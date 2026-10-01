(()=>{'use strict';
let strength=0,lastPressure=0;const pointers=new Map();
const input=window.AtlasTouchInput={dx:0,dy:0,pressure:0,tick(dt){const goal=performance.now()-lastPressure<1700?strength:0;input.pressure+=(goal-input.pressure)*(1-Math.exp(-dt*(goal>input.pressure?5:.65)))}};
TouchLink.on(m=>{if(m.kind==='pressure'&&Number.isFinite(m.value)){strength=Math.min(1,Math.max(0,m.value));lastPressure=performance.now()}
if(m.kind==='touch'&&Number.isFinite(m.x)&&Number.isFinite(m.y)&&Math.abs(m.x)<1e6&&Math.abs(m.y)<1e6){const old=pointers.get(m.source);if(old&&performance.now()-old.at<2000){input.dx+=Math.max(-.5,Math.min(.5,m.x-old.x));input.dy+=Math.max(-.5,Math.min(.5,m.y-old.y))}if(pointers.size>32)pointers.clear();pointers.set(m.source,{x:m.x,y:m.y,at:performance.now()})}});
setInterval(()=>TouchLink.send('presence',{role:'map'}),1000);
})();
