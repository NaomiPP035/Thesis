(()=>{'use strict';
let strength=0,lastPressure=0,lastMove=0;const pointers=new Map();
const input=window.AtlasTouchInput={dx:0,dy:0,pressure:0,motion:0,tick(dt){const now=performance.now(),goal=now-lastPressure<1700?strength:0;input.pressure+=(goal-input.pressure)*(1-Math.exp(-dt*(goal>input.pressure?5:.65)));if(now-lastMove>100)input.motion*=Math.exp(-dt*3)}};
TouchLink.on(m=>{if(m.kind==='pressure'&&Number.isFinite(m.value)){strength=Math.min(1,Math.max(0,m.value));lastPressure=performance.now()}
if(m.kind==='touch'&&Number.isFinite(m.x)&&Number.isFinite(m.y)&&Math.abs(m.x)<1e6&&Math.abs(m.y)<1e6){const old=pointers.get(m.source);if(old&&performance.now()-old.at<2000){const dx=Math.max(-.7,Math.min(.7,m.x-old.x)),dy=Math.max(-.7,Math.min(.7,m.y-old.y));input.dx+=dx;input.dy+=dy;if(Math.hypot(dx,dy)>.0001){const dt=Math.max(.015,(performance.now()-old.at)/1000);input.motion=Math.min(1,Math.hypot(dx,dy)/dt/5);lastMove=performance.now()}}if(pointers.size>32)pointers.clear();pointers.set(m.source,{x:m.x,y:m.y,at:performance.now()})}});
setInterval(()=>TouchLink.send('presence',{role:'map'}),1000);
})();
