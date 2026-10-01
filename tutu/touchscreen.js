(()=>{'use strict';const pad=document.getElementById('touch');let pointer=null,x=0,y=0,lastX=0,lastY=0,lastPulse=0,lastSend=0,lastSensor=0,pressure=0,unlocked=false;
function pulse(speed=0){const now=performance.now();if(!unlocked||document.hidden||typeof navigator.vibrate!=='function'||now-lastPulse<150)return;lastPulse=now;const p=now-lastSensor<1700?pressure:0;try{navigator.vibrate([8+Math.round(Math.min(1,speed+p)*16),28,10])}catch{}}
function send(force=false){if(!force&&performance.now()-lastSend<50)return;lastSend=performance.now();TouchLink.send('touch',{x,y,active:pointer!==null})}
pad.addEventListener('pointerdown',e=>{if(pointer!==null||e.button!==0)return;unlocked=true;pointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;pad.setPointerCapture(pointer);send(true);pulse(.2);e.preventDefault()});
pad.addEventListener('pointermove',e=>{if(pointer!==e.pointerId)return;const dx=(e.clientX-lastX)/Math.max(1,innerWidth),dy=(e.clientY-lastY)/Math.max(1,innerHeight);x+=dx*4;y+=dy*3;lastX=e.clientX;lastY=e.clientY;send();if(Math.hypot(dx,dy)>.002)pulse(Math.hypot(dx,dy)*18);e.preventDefault()});
function end(e){if(e?.pointerId!==undefined&&e.pointerId!==pointer)return;const id=pointer;pointer=null;if(id!==null&&pad.hasPointerCapture(id))pad.releasePointerCapture(id);send(true);try{navigator.vibrate?.(0)}catch{}}
for(const event of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(event,end);
addEventListener('blur',()=>end());addEventListener('pagehide',()=>end());document.addEventListener('visibilitychange',()=>{if(document.hidden)end()});
TouchLink.on(m=>{if(m.kind==='pressure'&&Number.isFinite(m.value)){pressure=Math.max(0,Math.min(1,m.value));lastSensor=performance.now();if(pressure>.05&&pointer!==null)pulse(pressure)}});
setInterval(()=>{if(!document.hidden){send(true);TouchLink.send('presence',{role:'phone',haptics:typeof navigator.vibrate==='function'})}},700);
})();
