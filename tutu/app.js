const senses=['All','Touch','Sight','Smell','Sound','Taste'];
const senseAliases={Touch:'Touch',Sight:'Sight',Smell:'Smell',Sound:'Sound',Taste:'Taste','\u89e6\u89c9':'Touch','\u89c6\u89c9':'Sight','\u55c5\u89c9':'Smell','\u542c\u89c9':'Sound','\u5473\u89c9':'Taste'};
function normalizeSenses(values){return [...new Set((Array.isArray(values)?values:[]).map(v=>senseAliases[v]).filter(Boolean))]}
// One entry per described experience; do not multiply diary entries for density.
const entries=window.ATLAS_DIARY.map((r,i)=>({
 id:i+1,diaryId:r.key,title:escapeRecord(r.title),place:escapeRecord(r.place)||'Not recorded',
 object:escapeRecord(r.object)||'Not recorded',body:escapeRecord(r.body)||'Not recorded',
 senses:normalizeSenses(r.senses),mood:escapeRecord(r.mood),color:r.color,texture:escapeRecord(r.texture)||'Not separately described',
 quote:escapeRecord(r.text),action:'',after:'',reflection:'',
 date:r.date,dateEnd:r.dateEnd||'',time:r.time||'',dateUncertain:!!r.dateUncertain
}));
const importedIds=new Set();
function escapeRecord(value){return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function readNewRecords(){try{return AtlasRecords.read().filter(r=>!importedIds.has(r.id))}catch(err){console.warn('Saved records unavailable',err.message);return[]}}
function importRecord(r){importedIds.add(r.id);const escaped=Object.fromEntries(['title','place','object','body','mood','text'].map(k=>[k,escapeRecord(r[k])]));return {id:entries.length+1,sourceId:r.id,title:escaped.title,place:escaped.place||'Not entered',object:escaped.object||'Not entered',body:escaped.body||'Not entered',mood:escaped.mood||'Not entered',senses:normalizeSenses(r.senses),color:/^#[0-9a-f]{6}$/i.test(r.color)?r.color:'#94b9ad',texture:escaped.object||'Not entered',quote:escaped.text,action:escaped.text,after:'',reflection:'',recordedAt:r.recordedAt,day:'',time:new Date(r.recordedAt).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',timeZone:'America/Los_Angeles'}),fictional:false}}
for(const record of readNewRecords())entries.push(importRecord(record));
// Diary calendar dates stay literal: never turn a day into midnight UTC.
function calendarLabel(value){
 const [y,m,d]=value.split('-').map(Number);
 const weekday=['SUN','MON','TUE','WED','THU','FRI','SAT'][new Date(Date.UTC(y,m-1,d)).getUTCDay()];
 const month=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][m-1];
 return month+' '+d+', '+y+' · '+weekday;
}
function dateLabel(e){
 if(e.date){const label=e.dateEnd?calendarLabel(e.date)+' — '+calendarLabel(e.dateEnd):calendarLabel(e.date);return label+(e.dateUncertain?' · EXACT DATE NOT RECORDED':'')}
 return e.recordedAt?escapeRecord(new Date(e.recordedAt).toLocaleDateString('en-US',{timeZone:'America/Los_Angeles'})):'DATE NOT RECORDED';
}
function momentLabel(e){return dateLabel(e)+(e.time?' · '+escapeRecord(e.time):'')}
function optionalSections(e){return [['What my body did',e.action],['After the contact',e.after],['A thought afterward',e.reflection]].filter(([,text])=>text&&text!==e.quote).map(([title,text])=>'<p class="section-label">'+title+'</p><p class="body-copy">'+text+'</p>').join('')}


const $=s=>document.querySelector(s),universe=$('#universe'),preview=$('#preview'),detail=$('#detail');
let current=null,activeSenses=new Set(),hover=null;
let seed=7321;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646}
// Dense core and softly fading outliers; shared by new records.
function createPosition(){
 const z=rand()*2-1,angle=rand()*Math.PI*2,ring=Math.sqrt(1-z*z);
 const radius=Math.pow(rand(),.65)*(rand()<.16?1.55:1.12);
 return{x:radius*ring*Math.cos(angle),y:radius*ring*Math.sin(angle),z:radius*z,fade:Math.max(.28,1-Math.max(0,radius-.6)*.75),depth:.25+rand()*.75,phase:rand()*Math.PI*2};
}
const positions=entries.map(createPosition);
let nodes=[],lineNodes=[],linked=[],width=1,height=1,last=0,yaw=0,pitch=0,vx=0,vy=0,px=0,py=0,drift=0;
let distance=3.1,targetDistance=3.1,animationStarted=false;
let drag=null,suppressClickUntil=0;
let motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
function measure(){width=universe.clientWidth;height=universe.clientHeight;$('#lines').setAttribute('viewBox','0 0 '+width+' '+height)}
function zoomTo(value){if(current||$('#method').open)return;targetDistance=Math.max(.18,Math.min(5.5,value));hover=null;preview.hidden=true;highlight(null);if(!motion)distance=targetDistance}
function frame(t){const dt=Math.min((t-last)/1000||.016,.04);last=t;const paused=current||hover||drag?.moved||$('#method').open||!motion||document.hidden;
const targetX=paused?0:Math.sign(px)*px*px*.32,targetY=paused?0:Math.sign(py)*py*py*.24,ease=1-Math.exp(-dt*3);vx+=(targetX-vx)*ease;vy+=(targetY-vy)*ease;if(!paused){yaw+=vx*dt;pitch-=vy*dt;drift+=dt}
distance+=(targetDistance-distance)*(1-Math.exp(-dt*5));
const mobile=width<750,cx=width*(mobile?.5:.63),cy=height*(mobile?.55:.51),focal=Math.min(width*(mobile?1.06:.72),height*.95),cosY=Math.cos(yaw),sinY=Math.sin(yaw),cosX=Math.cos(pitch),sinX=Math.sin(pitch);
positions.forEach((p,i)=>{const bob=Math.sin(drift*.36+p.phase)*.007,x=p.x*cosY+p.z*sinY,z0=-p.x*sinY+p.z*cosY,y=(p.y+bob)*cosX-z0*sinX,z=(p.y+bob)*sinX+z0*cosX,viewZ=distance-z;
p.sx=cx+x*(mobile?1.12:1.55)*focal/Math.max(.12,viewZ);p.sy=cy+y*.74*focal/Math.max(.12,viewZ);p.visible=viewZ>.14&&p.sx>-35&&p.sx<width+35&&p.sy>-35&&p.sy<height+35;
const node=nodes[i];node.style.visibility=p.visible?'visible':'hidden';node.tabIndex=p.visible?0:-1;if(p.visible){const scale=Math.min(4,2.5/viewZ),size=(entries.length<80?4+p.depth*5:2.2+p.depth*4)*scale,alpha=Math.max(.09,Math.min(1,.95/viewZ+.18)*p.fade);node.style.transform='translate3d('+p.sx.toFixed(2)+'px,'+p.sy.toFixed(2)+'px,0) translate(-50%,-50%)';node.style.setProperty('--size',size.toFixed(2)+'px');node.style.setProperty('--halo',(size*1.3).toFixed(2)+'px');node.style.setProperty('--alpha',alpha.toFixed(2));node.style.zIndex=Math.round(1000/viewZ)}});
if(linked.length){const a=positions[(current?.id||hover)-1];lineNodes.forEach((line,j)=>{const b=positions[linked[j].id-1];line.style.display=a.visible&&b.visible?'':'none';line.setAttribute('x1',a.sx);line.setAttribute('y1',a.sy);line.setAttribute('x2',b.sx);line.setAttribute('y2',b.sy)})}
$('#depth-label').textContent=distance<1?'INSIDE THE FIELD':distance<2.4?'MOVING CLOSER':'FULL VIEW';requestAnimationFrame(frame)}
document.addEventListener('pointermove',ev=>{if(ev.pointerType==='touch')return;px=Math.max(-1,Math.min(1,(ev.clientX/innerWidth-.5)*2));py=Math.max(-1,Math.min(1,(ev.clientY/innerHeight-.5)*2));if(Math.abs(px)<.12)px=0;if(Math.abs(py)<.12)py=0});document.documentElement.addEventListener('pointerleave',()=>{px=0;py=0});
universe.addEventListener('wheel',e=>{if(e.ctrlKey||current||$('#method').open)return;e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?height:1);zoomTo(targetDistance+Math.max(-180,Math.min(180,delta))*.0035)},{passive:false});
$('#home-view').onclick=()=>{reset();yaw=0;pitch=0;px=0;py=0;vx=0;vy=0;zoomTo(3.1)};
// Capture only after a movement threshold so a stationary click still opens a record.
universe.addEventListener('pointerdown',e=>{if(e.button!==0||current||$('#method').open)return;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,time:performance.now(),moved:false};});
document.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const now=performance.now();if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<5)return;
if(!drag.moved){drag.moved=true;universe.setPointerCapture(e.pointerId);universe.classList.add('dragging');hover=null;preview.hidden=true;highlight(null)}
const dx=e.clientX-drag.x,dy=e.clientY-drag.y,elapsed=Math.max(.008,(now-drag.time)/1000),gain=.008;
yaw+=dx*gain;pitch-=dy*gain;vx=Math.max(-3.5,Math.min(3.5,dx*gain/elapsed));vy=Math.max(-3.5,Math.min(3.5,dy*gain/elapsed));drag.x=e.clientX;drag.y=e.clientY;drag.time=now;e.preventDefault();},{passive:false});
function endDrag(e){if(!drag||(e.pointerId!==undefined&&e.pointerId!==drag.id))return;const active=drag;drag=null;universe.classList.remove('dragging');if(active.moved){suppressClickUntil=performance.now()+350;hover=null;preview.hidden=true;px=0;py=0;if(performance.now()-active.time>120||e.type!=='pointerup'){vx=0;vy=0}}if(universe.hasPointerCapture(active.id))universe.releasePointerCapture(active.id);}
document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',endDrag);universe.addEventListener('lostpointercapture',endDrag);window.addEventListener('blur',endDrag);
universe.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
function matches(e){return activeSenses.size===0||e.senses.some(s=>activeSenses.has(s))}
function colorVector(color){const match=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(color);return match?match.slice(1).map(v=>parseInt(v,16)):[148,185,173]}
function colorDistance(a,b){const x=colorVector(a),y=colorVector(b),mean=(x[0]+y[0])/2,dr=x[0]-y[0],dg=x[1]-y[1],db=x[2]-y[2];return Math.sqrt((2+mean/256)*dr*dr+4*dg*dg+(2+(255-mean)/256)*db*db)}
function related(e){return entries.filter(v=>v.id!==e.id&&matches(v)).sort((a,b)=>colorDistance(e.color,a.color)-colorDistance(e.color,b.color)).slice(0,9)}
function draw(){const root=$('#stars');root.innerHTML=entries.map((e,i)=>{const p=positions[i];return '<button class="star" data-id="'+e.id+'" style="--color:'+e.color+';--size:'+(2+p.depth*10).toFixed(1)+'px;--halo:'+(3+p.depth*9).toFixed(1)+'px;--alpha:'+(.32+p.depth*.68).toFixed(2)+';z-index:'+Math.round(p.depth*10)+'" aria-label="'+e.title+', '+e.mood+'" aria-pressed="false"></button>'}).join('');nodes=[...root.querySelectorAll('.star')];nodes.forEach(b=>{const e=entries[+b.dataset.id-1];b.onpointerenter=()=>{if(!current&&!drag?.moved&&performance.now()>suppressClickUntil){hover=e.id;showPreview(e,b);highlight(e)}};b.onpointerleave=()=>{if(!current){hover=null;preview.hidden=true;highlight(null)}};b.onfocus=()=>{if(!current&&!drag?.moved&&performance.now()>suppressClickUntil){hover=e.id;showPreview(e,b);highlight(e)}};b.onblur=()=>{if(!current){hover=null;preview.hidden=true;highlight(null)}};b.onclick=ev=>{ev.stopPropagation();select(e)}});measure();renderFilters();highlight(current);if(!animationStarted){animationStarted=true;requestAnimationFrame(frame)}}
function renderFilters(){const all=activeSenses.size===0;$('#filters').innerHTML=senses.map(s=>{const pressed=s==='All'?all:activeSenses.has(s);return `<button aria-pressed="${pressed}" class="${pressed?'active':''}">${s}</button>`}).join('');$('#filters').querySelectorAll('button').forEach(b=>b.onclick=()=>{const sense=b.textContent;if(sense==='All')activeSenses.clear();else{activeSenses.has(sense)?activeSenses.delete(sense):activeSenses.add(sense);if(activeSenses.size===senses.length-1)activeSenses.clear()}reset();renderFilters();highlight(null)});$('#counter').textContent=`${String(entries.filter(matches).length).padStart(2,'0')} encounters`;$('#total').textContent=entries.length}
function highlight(e){linked=e?related(e).filter(v=>positions[v.id-1].visible):[];const ids=new Set(linked.map(v=>v.id));nodes.forEach(b=>{const v=entries[+b.dataset.id-1];b.hidden=!matches(v);b.classList.toggle('dim',Boolean(e&&v.id!==e.id&&!ids.has(v.id)));b.classList.toggle('selected',v.id===e?.id);b.setAttribute('aria-pressed',String(v.id===current?.id))});$('#lines').innerHTML=linked.map(v=>'<line stroke="'+v.color+'" stroke-opacity=".34" stroke-width=".8"/>').join('');lineNodes=[...$('#lines').children]}
function showPreview(e,b){preview.innerHTML=`<div class="mini-meta"><span class="swatch" style="--color:${e.color}"></span>${momentLabel(e)}</div><h2>${e.title}</h2><p>PLACE / ${e.place}</p><p>OBJECT / ${e.object}</p><p>BODY / ${e.body}</p><p>SENSES / ${e.senses.length?e.senses.join(' · '):'Bodily sensation'}</p><p>MOOD / ${e.mood}</p><p class="hint">Click to stay with this moment</p>`;preview.hidden=false;const rect=b.getBoundingClientRect(),pw=preview.offsetWidth,ph=preview.offsetHeight;preview.style.left=Math.max(12,Math.min(rect.right+16,innerWidth-pw-14))+'px';preview.style.top=Math.max(12,Math.min(rect.top-20,innerHeight-ph-14))+'px'}
function select(e){current=e;hover=null;preview.hidden=true;detail.hidden=false;detail.style.setProperty('--color',e.color);$('#detail-body').innerHTML=`<p class="mini-meta"><span class="swatch" style="--color:${e.color}"></span>ENCOUNTER ${String(e.id).padStart(2,'0')}</p><h2>${e.title}</h2><p class="mini-meta">${momentLabel(e)}</p><blockquote class="quote">${e.quote}</blockquote><dl class="metadata"><dt>PLACE</dt><dd>${e.place}</dd><dt>OBJECT</dt><dd>${e.object}</dd><dt>BODY</dt><dd>${e.body}</dd><dt>SENSES</dt><dd>${e.senses.length?e.senses.join(' · '):'Bodily sensation'}</dd><dt>TEXTURE / PERCEPTION</dt><dd>${e.texture}</dd><dt>MOOD</dt><dd>${e.mood}</dd></dl>${optionalSections(e)}<p class="section-label">SIMILAR COLORS · ${related(e).length}</p><p class="body-copy">These lines connect moments with nearby emotional colors. The events may be completely different; the feeling simply sits somewhere close.</p><div class="connections">${related(e).slice(0,4).map(v=>`<button data-related="${v.id}"><span class="swatch" style="--color:${v.color}"></span>${v.title} ↗</button>`).join('')}</div>`;detail.scrollTop=0;detail.querySelectorAll('[data-related]').forEach(b=>b.onclick=()=>select(entries[+b.dataset.related-1]));highlight(e)}
function reset(){const id=current?.id;current=null;hover=null;detail.hidden=true;preview.hidden=true;highlight(null);return id}
$('#close').onclick=()=>{const id=reset();const b=document.querySelector(`[data-id="${id}"]`);if(b){b.focus();hover=null;preview.hidden=true;highlight(null)}};
universe.onclick=e=>{if(!e.target.closest('.star'))reset()};document.addEventListener('keydown',e=>{if(e.key==='Escape')reset()});
$('#about').onclick=()=>{$('#method').showModal();preview.hidden=true};$('#close-method').onclick=()=>$('#method').close();
$('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({status:'Personal sensory diary',timeZone:'America/Los_Angeles',entries},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='surface-atlas-export.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
addEventListener('resize',()=>{measure();positions.forEach(p=>{p.sx=undefined});highlight(current);preview.hidden=true});
const motionButton=$('#motion');function updateMotion(){motionButton.textContent=motion?'PAUSE DRIFT Ⅱ':'START DRIFT ▷';motionButton.setAttribute('aria-pressed',String(motion))}motionButton.onclick=()=>{motion=!motion;px=0;py=0;updateMotion()};matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{motion=!e.matches;updateMotion()});updateMotion();draw();

let syncedSignature='';
function syncSaved(){const incoming=AtlasRecords.read();const signature=JSON.stringify(incoming);if(signature===syncedSignature)return;syncedSignature=signature;const prior=new Map(entries.filter(e=>e.sourceId).map(e=>[e.sourceId,positions[e.id-1]]));const base=entries.filter(e=>!e.sourceId);const basePositions=base.map(e=>positions[e.id-1]);entries.splice(0,entries.length,...base);positions.splice(0,positions.length,...basePositions);importedIds.clear();for(const r of incoming){entries.push(importRecord(r));if(prior.has(r.id)){positions.push(prior.get(r.id));continue}positions.push(createPosition())}reset();draw();requestAnimationFrame(openLinked)}
window.addEventListener('storage',e=>{if(e.key===AtlasRecords.key)syncSaved()});window.addEventListener('atlas-records-changed',syncSaved);window.addEventListener('focus',syncSaved);
function openLinked(){const m=location.hash.match(/^#record=(.+)$/);if(m){const e=entries.find(e=>e.sourceId===decodeURIComponent(m[1]));if(e)select(e)}}window.addEventListener('hashchange',openLinked);requestAnimationFrame(openLinked);
