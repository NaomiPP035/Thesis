(()=>{'use strict';
const pad=document.getElementById('touch'),canvas=document.getElementById('touch-feedback'),ctx=canvas.getContext('2d');
let pointer=null,x=0,y=0,lastX=0,lastY=0,lastSend=0,lastMove=0,speed=0,w=1,h=1;const trail=[],rings=[];
function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,2);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0)}resize();addEventListener('resize',resize);
function send(force=false){const now=performance.now();if(!force&&now-lastSend<40)return;lastSend=now;window.TouchLink?.send('touch',{x,y,active:pointer!==null,speed})}
function start(e){if(pointer!==null||(e.pointerType==='mouse'&&e.button!==0))return;pointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;lastMove=performance.now();speed=0;try{pad.setPointerCapture(pointer)}catch{}trail.push({x:lastX,y:lastY,t:lastMove,s:0,start:true});rings.push({x:lastX,y:lastY,t:lastMove});send(true);e.preventDefault()}
function move(e){if(pointer!==e.pointerId)return;const now=performance.now(),dx=(e.clientX-lastX)/w,dy=(e.clientY-lastY)/h,dt=Math.max(.008,(now-lastMove)/1000);x+=dx*4;y+=dy*3;speed=Math.min(1,Math.hypot(dx,dy)/dt/2);lastX=e.clientX;lastY=e.clientY;lastMove=now;trail.push({x:lastX,y:lastY,t:now,s:speed});if(trail.length>160)trail.shift();send();e.preventDefault()}
function end(e){if(e?.pointerId!==undefined&&e.pointerId!==pointer)return;const id=pointer;pointer=null;speed=0;if(id!==null&&pad.hasPointerCapture(id))pad.releasePointerCapture(id);send(true)}
pad.addEventListener('pointerdown',start);pad.addEventListener('pointermove',move);for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,end);
addEventListener('blur',()=>end());addEventListener('pagehide',()=>end());document.addEventListener('visibilitychange',()=>{if(document.hidden){end();trail.length=0;rings.length=0}});
function frame(now){ctx.clearRect(0,0,w,h);while(trail.length&&now-trail[0].t>900)trail.shift();while(rings.length&&now-rings[0].t>750)rings.shift();ctx.lineCap='round';
for(let i=1;i<trail.length;i++){const a=trail[i-1],b=trail[i];if(b.start)continue;const fade=Math.max(0,1-(now-b.t)/900);ctx.strokeStyle=`rgba(193,178,230,${fade*.7})`;ctx.lineWidth=1.5+b.s*5;ctx.shadowColor='#a98ce0';ctx.shadowBlur=12+b.s*14;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}
ctx.shadowBlur=0;for(const r of rings){const age=(now-r.t)/750;ctx.strokeStyle=`rgba(212,201,242,${(1-age)*.65})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(r.x,r.y,12+age*58,0,Math.PI*2);ctx.stroke()}
if(pointer!==null){const radius=34+speed*20,g=ctx.createRadialGradient(lastX,lastY,0,lastX,lastY,radius);g.addColorStop(0,'rgba(238,230,255,.72)');g.addColorStop(.18,'rgba(186,166,230,.35)');g.addColorStop(1,'rgba(170,144,220,0)');ctx.fillStyle=g;ctx.fillRect(lastX-radius,lastY-radius,radius*2,radius*2);ctx.strokeStyle='rgba(230,219,250,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(lastX,lastY,11+speed*7,0,Math.PI*2);ctx.stroke()}
requestAnimationFrame(frame)}requestAnimationFrame(frame);
setInterval(()=>{if(!document.hidden){if(performance.now()-lastMove>160)speed=0;send(true);window.TouchLink?.send('presence',{role:'phone'})}},600);
})();

