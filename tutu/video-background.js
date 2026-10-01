(()=>{'use strict';
const canvas=document.createElement('canvas');canvas.id='background-video';canvas.setAttribute('aria-hidden','true');document.getElementById('universe').prepend(canvas);
const gl=canvas.getContext('webgl',{alpha:false,antialias:false});let settings=BackgroundStore.settings(),url=null,loaded=false,failed=false,previous=new Map(),level=0;
const video=document.createElement('video');video.muted=true;video.loop=true;video.playsInline=true;video.preload='auto';
const report=text=>BackgroundStore.status(text);
if(!gl){report('此浏览器无法启动视频扰动，请使用启用硬件加速的 Chrome / Edge。');return}
function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
const vertex='attribute vec2 a; varying vec2 uv; void main(){uv=a*.5+.5;gl_Position=vec4(a,0.,1.);}';
const fragment=`precision mediump float;
varying vec2 uv;uniform sampler2D movie;uniform vec2 screen;uniform vec2 cover;uniform vec4 points[16];uniform float clock;uniform float blur;uniform float light;
vec3 sampleAt(vec2 p){return texture2D(movie,clamp((p-.5)*cover+.5,vec2(.002),vec2(.998))).rgb;}
void main(){vec2 p=uv;float aspect=screen.x/screen.y;
for(int i=0;i<16;i++){vec2 d=uv-points[i].xy;vec2 metric=vec2(d.x*aspect,d.y);float distance=length(metric);float envelope=exp(-distance*distance/0.012);float wave=sin(distance*65.-clock*3.8+float(i));p+=d/(distance+.03)*wave*envelope*points[i].z;}
vec2 b=vec2(blur)/screen;vec3 c=sampleAt(p)*.2;
c+=sampleAt(p+vec2(b.x,0.))*.12;c+=sampleAt(p-vec2(b.x,0.))*.12;c+=sampleAt(p+vec2(0.,b.y))*.12;c+=sampleAt(p-vec2(0.,b.y))*.12;
c+=sampleAt(p+b)*.08;c+=sampleAt(p-b)*.08;c+=sampleAt(p+vec2(b.x,-b.y))*.08;c+=sampleAt(p+vec2(-b.x,b.y))*.08;
float gray=dot(c,vec3(.299,.587,.114));c=mix(vec3(gray),c,.55);gl_FragColor=vec4(c*light,1.);}`;
let program;try{program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));}catch(e){report('视频效果初始化失败：'+e.message);return}
gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
const u=Object.fromEntries(['screen','cover','points[0]','clock','blur','light'].map(name=>[name,gl.getUniformLocation(program,name)]));const points=new Float32Array(64);
function configure(){settings=BackgroundStore.settings();video.playbackRate=settings.rate;canvas.style.filter=`blur(${Math.max(1,settings.blur*.35)}px)`}
async function useBlob(blob){loaded=false;failed=false;video.pause();if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);video.src=url;configure();video.load();}
video.onloadeddata=()=>{loaded=true;video.play().then(()=>{canvas.dataset.state='playing';report('背景视频播放中 · '+settings.rate+'× · 光点局部扰动已启用')}).catch(()=>{report('请点击电脑星图一次以开始播放视频。')})};
video.onerror=()=>{loaded=false;canvas.dataset.state='error';report('视频无法解码，请使用 H.264 MP4 或 WebM。')};
async function restore(){try{const saved=await BackgroundStore.read();if(saved)await useBlob(saved.file);else report('等待本地视频；当前保留星图。')}catch(e){report('无法读取本地视频：'+e.message)}}
addEventListener('background-reload',restore);addEventListener('background-settings',configure);addEventListener('pointerdown',()=>{if(loaded&&video.paused)video.play().catch(()=>{})});
canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;report('视频图形上下文已中断，请刷新星图页。')});
window.AtlasBackground={useBlob,step(items,w,h,dt,now){if(failed)return;
const width=Math.max(1,Math.round(w*.65)),height=Math.max(1,Math.round(h*.65));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height)}
const selected=items.filter(i=>i.p.alpha>.035).sort((a,b)=>b.p.size*b.p.alpha-a.p.size*a.p.alpha).slice(0,16);points.fill(0);let fastest=0;
for(let i=0;i<selected.length;i++){const {entry,p}=selected[i],old=previous.get(entry.key);const speed=old?Math.hypot((p.sx-old.x)/w,(p.sy-old.y)/h)/Math.max(.008,dt):0;fastest=Math.max(fastest,speed);previous.set(entry.key,{x:p.sx,y:p.sy});const pressure=window.AtlasTouchInput?.pressure||0;points[i*4]=p.sx/w;points[i*4+1]=1-p.sy/h;points[i*4+2]=Math.min(.028,.0006+Math.min(1,speed*2)*.018+pressure*.009);}
const keys=new Set(selected.map(i=>i.entry.key));for(const key of previous.keys())if(!keys.has(key))previous.delete(key);level+=(Math.min(1,fastest*2)-level)*(1-Math.exp(-dt*4));canvas.dataset.motion=level.toFixed(3);
if(!loaded||video.readyState<2)return;try{gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video);const aspect=w/h,source=video.videoWidth/video.videoHeight;gl.uniform2f(u.screen,w,h);gl.uniform2f(u.cover,aspect<source?aspect/source:1,aspect>source?source/aspect:1);gl.uniform4fv(u['points[0]'],points);gl.uniform1f(u.clock,now/1000);gl.uniform1f(u.blur,settings.blur);gl.uniform1f(u.light,settings.brightness);gl.drawArrays(gl.TRIANGLES,0,6);canvas.dataset.state='playing';}catch(e){failed=true;report('视频纹理读取失败：'+e.message)}}};
configure();restore();
})();
