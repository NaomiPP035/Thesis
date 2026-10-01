'use strict';

// Visual recency belongs to this viewing session. It never changes an event's date
// or assigns a notice / un-notice state to a source record.
const touchMapMode = document.body.dataset.touchMap === 'true';
const $ = selector => document.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeColor = value => /^#[0-9a-f]{6}$/i.test(value || '') ? value : '#ccc5b8';
const REAL_PLACES = {
  home:'8608 Rancho Mangana',
  school:'ArtCenter South Campus, 950 S Raymond Ave, Pasadena',
  market:'99 Ranch Market, 140 W Valley Blvd, San Gabriel',
  gathering:'Blossom Market Hall, 264 S Mission Dr, San Gabriel',
  yogurt:'Yogurtland, 259 Sierra Madre Villa Ave, Pasadena',
  bar:'The Blind Donkey, 53 E Union St, Pasadena',
  library:'Hastings Branch Library, 3325 E Orange Grove Blvd, Pasadena',
  oldTown:'Old Pasadena, Colorado Blvd & Fair Oaks Ave, Pasadena',
  park:'Central Park, Pasadena'
};
function realPlace(entry) {
  const place=String(entry.place || '');
  const route=(from,to)=>`${from} → ${to}`;
  if(/Home to school/i.test(place)) return route(REAL_PLACES.home,REAL_PLACES.school);
  if(/School to home/i.test(place)) return route(REAL_PLACES.school,REAL_PLACES.home);
  if(/School to the Chinese supermarket/i.test(place)) return route(REAL_PLACES.school,REAL_PLACES.market);
  if(/Supermarket to home/i.test(place)) return route(REAL_PLACES.market,REAL_PLACES.home);
  if(/Home to Mila/i.test(place)) return route(REAL_PLACES.home,REAL_PLACES.gathering);
  if(/Mila.+to school/i.test(place)) return route(REAL_PLACES.gathering,REAL_PLACES.school);
  if(/Home to the frozen yogurt shop/i.test(place)) return route(REAL_PLACES.home,REAL_PLACES.yogurt);
  if(/Frozen yogurt shop to the bar/i.test(place)) return route(REAL_PLACES.yogurt,REAL_PLACES.bar);
  if(/Old Town bar to home/i.test(place)) return route(REAL_PLACES.bar,REAL_PLACES.home);
  if(/Home to Hillside Library/i.test(place)) return route(REAL_PLACES.home,REAL_PLACES.library);
  if(/Hillside Library to home/i.test(place)) return route(REAL_PLACES.library,REAL_PLACES.home);
  if(/Chinese supermarket/i.test(place)) return REAL_PLACES.market;
  if(/Mila/i.test(place)) return REAL_PLACES.gathering;
  if(/Frozen yogurt|Near the frozen yogurt/i.test(place)) return REAL_PLACES.yogurt;
  if(/Old Town bar/i.test(place)) return REAL_PLACES.bar;
  if(/Hillside Library/i.test(place)) return REAL_PLACES.library;
  if(/School|classroom|studio/i.test(place)) return REAL_PLACES.school;
  if(/Bedroom|bathroom|Shared kitchen|Front door|Getting dressed/i.test(place)) return REAL_PLACES.home;
  if(/Home or school/i.test(place)) return Number(entry.key?.slice(-1))%2 ? REAL_PLACES.home : REAL_PLACES.school;
  if(/Between the two places/i.test(place)) return REAL_PLACES.oldTown;
  if(/Changes with the activity/i.test(place)) return /class|design|presentation/i.test(entry.scene || '') ? REAL_PLACES.school : REAL_PLACES.home;
  if(/Location unknown/i.test(place)) return REAL_PLACES.park;
  return place || REAL_PLACES.park;
}
const base = window.ATLAS_DIARY.map(r => ({...r, key:r.key, place:realPlace(r), color:safeColor(r.color)}));
let entries = [...base], dated = [], byKey = new Map(), sequenceIndex = new Map();
let cursor = 0, focusedKey = '', returned = false, playing = false, timer = null;
let nodes = new Map(), particles = new Map(), width = 1, height = 1;
let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let drifting = !reduced, turn = 0, turnTarget = 0, pitch = 0, pitchTarget = 0, distance = 3.1, targetDistance = 3.1;
let pointerX = 0, pointerY = 0, offsetX = 0, offsetY = 0;
let drag = null, suppressClickUntil = 0, hoverKey = '', previousFrame = 0, driftTime = 0;
let syncSignature = '', returningFocus = null;
let attentionTime = 0;
const noticedAt = new Map();
const FADE_SECONDS = 22;
const BIRTH_SECONDS = 4.2;
let audioContext = null;
function unlockAudio() {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  audioContext ||= new AudioEngine();
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
}
function playBirthNote() {
  if (!audioContext || audioContext.state !== 'running') return;
  const notes = [60, 62, 64, 67, 69, 72, 74];
  const midi = notes[Math.floor(Math.random() * notes.length)];
  const frequency = 440 * Math.pow(2, (midi - 69) / 12);
  const now = audioContext.currentTime;
  [[1, .11, 1.8], [2, .032, 1.15], [3, .012, .72]].forEach(([multiple, volume, decay]) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency * multiple, now);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, now + decay);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + decay + .05);
  });
}
window.addEventListener('pointerdown', unlockAudio, {once:true});
window.addEventListener('keydown', unlockAudio, {once:true});
function brighten(key) { noticedAt.set(key, attentionTime); }
function resetAttention() {
  noticedAt.clear();
  dated.forEach((entry,index) => noticedAt.set(entry.key, attentionTime - Math.max(0,cursor-index)*3));
}
const universe = $('#universe'), preview = $('#preview');
const canvas = document.createElement('canvas');
canvas.id = 'star-canvas'; canvas.setAttribute('aria-hidden','true');
$('#stars').before(canvas);
const ctx = canvas.getContext('2d', {alpha:true});
let pixelRatio = 1, drawn = [], keyboardKey = '';
const sprites = new Map();
let spriteCursor=0;
// Cache the original two soft shadows and blurred disc, rather than applying
// CSS filters and resizing hundreds of composited DOM layers every frame.
function glowMask(size, blur) {
  const color = '#ffffff';
  const diameter = Math.max(.25, Math.round(size*4)/4);
  const softness = Math.round(blur*10)/10;
  const key = `${diameter}:${softness}:${pixelRatio}`;
  if(sprites.has(key)) return sprites.get(key);
  const extent=diameter+64, pixels=Math.ceil(extent*pixelRatio);
  const raw=document.createElement('canvas'); raw.width=raw.height=pixels;
  const r=raw.getContext('2d');
  r.scale(pixelRatio,pixelRatio);
  const center=pixels/pixelRatio/2, radius=diameter/2;
  // Put shadow sources outside the tile, leaving only their shadows in it.
  function shadow(spread,blurRadius) {
    r.save(); r.shadowColor=color; r.shadowBlur=blurRadius*pixelRatio;
    r.shadowOffsetX=200*pixelRatio; r.fillStyle=color;
    r.beginPath(); r.arc(center-200,center,Math.max(.01,radius+spread),0,Math.PI*2); r.fill(); r.restore();
  }
  shadow(-1,20); shadow(1,7);
  r.fillStyle=color; r.beginPath(); r.arc(center,center,radius,0,Math.PI*2); r.fill();
  const tile=document.createElement('canvas'); tile.width=tile.height=pixels;
  const t=tile.getContext('2d'); t.filter=`blur(${softness*pixelRatio}px)`; t.drawImage(raw,0,0);
  const result={tile,extent:pixels/pixelRatio,key};
  if(sprites.size>=2048) sprites.delete(sprites.keys().next().value);
  sprites.set(key,result); return result;
}
// Shared white glow masks keep hundreds of emotional shades from multiplying
// expensive blur operations. Each particle reuses one tinted tile.
function starSprite(color,size,blur,p) {
  const mask=glowMask(size,blur), key=mask.key+color;
  if(p.spriteKey===key) return p.sprite;
  p.spriteCache ??= new Map();
  if(p.spriteCache.has(key)) {p.spriteKey=key;p.sprite=p.spriteCache.get(key);return p.sprite;}
  let tile;
  if(p.spriteCache.size>=3) {const oldest=p.spriteCache.keys().next().value;tile=p.spriteCache.get(oldest).tile;p.spriteCache.delete(oldest);}
  else tile=document.createElement('canvas');
  if(tile.width!==mask.tile.width || tile.height!==mask.tile.height) {
    tile.width=mask.tile.width; tile.height=mask.tile.height;
  }
  const t=tile.getContext('2d');
  t.globalCompositeOperation='source-over'; t.clearRect(0,0,tile.width,tile.height);
  t.drawImage(mask.tile,0,0);
  t.globalCompositeOperation='source-in';t.fillStyle=color;t.fillRect(0,0,tile.width,tile.height);
  t.globalCompositeOperation='source-over';
  p.spriteKey=key; p.sprite={tile,extent:mask.extent,size,blur};p.spriteCache.set(key,p.sprite); return p.sprite;
}
function paintStars() {
  ctx.clearRect(0,0,width,height);
  drawn.sort((a,b)=>a.depth-b.depth);
  // Bound expensive blur/tint work instead of rebuilding hundreds of tiles on
  // one zoom frame. Round-robin avoids starving later stars during a long drag.
  const deadline=performance.now()+2;
  for(let checked=0,rebuilt=0;checked<drawn.length && rebuilt<8;checked++) {
    const item=drawn[spriteCursor++ % drawn.length], {entry,p}=item;
    if(p.alpha<.002) continue;
    const key=`${Math.max(.25,Math.round(p.size*4)/4)}:${Math.round(p.blur*10)/10}:${pixelRatio}`+entry.color;
    if(p.spriteKey===key) continue;
    starSprite(entry.color,p.size,p.blur,p);rebuilt++;
    if(performance.now()>=deadline) break;
  }
  for(const item of drawn) {
    const {entry,p}=item;
    const sprite=p.sprite;
    if(!sprite || p.alpha<.002) continue;
    // Position and size still react every frame while a glow tile is pending.
    const extent=sprite.extent*Math.max(.05,p.size/Math.max(.25,sprite.size));
    ctx.globalAlpha=p.alpha;
    ctx.drawImage(sprite.tile,p.sx-extent/2,p.sy-extent/2,extent,extent);
    const front=entry.key===focusedKey, hovered=entry.key===hoverKey, keyboard=entry.key===keyboardKey;
    if(!touchMapMode && (front || !entry.date || hovered || keyboard)) {
      ctx.beginPath(); ctx.lineWidth=1;
      ctx.strokeStyle=!entry.date?'#c7bca32a':front?'#d3c2a655':'#b5a589';
      ctx.setLineDash(!entry.date?[2,2]:[]);
      ctx.arc(p.sx,p.sy,!entry.date?5.5:front?19.5:12.5,0,Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  ctx.globalAlpha=1;
}
function hitStar(clientX,clientY) {
  const rect=universe.getBoundingClientRect(), x=clientX-rect.left, y=clientY-rect.top;
  for(let i=drawn.length-1;i>=0;i--) {
    const {entry,p}=drawn[i];
    if(p.alpha>.025 && p.size>.7 && Math.abs(x-p.sx)<=13 && Math.abs(y-p.sy)<=13) return entry;
  }
  return null;
}
function activateStar(entry) {
  if(touchMapMode || !entry || performance.now()<suppressClickUntil) return;
  stopPlayback();
  if(focusedKey===entry.key) openDetail(); else bringForward(entry.key);
}
canvas.addEventListener('click',event=>activateStar(hitStar(event.clientX,event.clientY)));


function dateLabel(date, options = {}) {
  if (!date) return 'Date not recorded';
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {timeZone:'UTC', month:'short', day:'numeric', ...options})
    .format(new Date(Date.UTC(year, month - 1, day)));
}
function timeLabel(entry) {
  const time=String(entry.time || 'Time not recorded')
    .replace(/\s*·\s*(provisional placement|location reconstructed|change of location reconstructed|reconstructed scene|reconstructed|sequence inferred).*$/i,'')
    .replace(/^Date unknown$/i,'Time not recorded');
  return [time,dateLabel(entry.date,{year:'numeric'}),entry.place || 'Location not recorded'].join(' · ');
}
function seedFor(key) {
  let hash = 2166136261;
  for (const c of key) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return () => {hash ^= hash << 13; hash ^= hash >>> 17; hash ^= hash << 5; return (hash >>> 0) / 4294967296;};
}
function makeParticle(key) {
  const random = seedFor(key);
  const z=random()*2-1, angle=random()*Math.PI*2, ring=Math.sqrt(1-z*z);
  const radius=Math.pow(random(),.65)*(random()<.16?1.55:1.12);
  const variation=Math.pow(random(),1.25);
  return {x:radius*ring*Math.cos(angle), y:radius*ring*Math.sin(angle), z:radius*z,
    phase:random()*Math.PI*2, depth:random(),
    baseSize:.35+variation*6.4, luminance:.0005+Math.pow(variation,2)*.46,
    sx:null, sy:null, size:0, alpha:0, blur:.5};
}
function rebuildIndex() {
  byKey = new Map(entries.map(e => [e.key, e]));
  // Stable sorting preserves the workbook's sequence within each day. Its fuzzy
  // time labels and all-day contacts cannot establish an exact chronology.
  dated = entries.filter(e => e.date).sort((a,b) => a.date.localeCompare(b.date));
  sequenceIndex = new Map(dated.map((e,i) => [e.key,i]));
  $('#position').max = Math.max(0,dated.length - 1);
  $('#total').textContent = entries.length;
  $('#undated-open').textContent = `${entries.filter(e => !e.date).length} entries without a date ↗`;
  const dates = [...new Set(dated.map(e => e.date))];
  $('#days').innerHTML = dates.map(day => `<button data-day="${day}" aria-pressed="false">${dateLabel(day)}<small>${dateLabel(day,{weekday:'short'}).split(',')[0]}</small></button>`).join('');
  $('#days').querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
    stopPlayback();
    // Jump to the first row for that date, so its sequence can be followed.
    seek(dated.findIndex(e => e.date === button.dataset.day));
  }));
  const oldFilter = $('#archive-day').value;
  $('#archive-day').innerHTML = '<option value="all">All dates</option>' +
    dates.map(day => `<option value="${day}">${dateLabel(day)}</option>`).join('') + '<option value="undated">Date unknown</option>';
  $('#archive-day').value = [...$('#archive-day').options].some(o => o.value === oldFilter) ? oldFilter : 'all';
}
function renderStars() {
  const fragment = document.createDocumentFragment();
  const oldParticles = particles;
  particles = new Map(); nodes = new Map();
  for (const entry of entries) {
    const node = document.createElement('button');
    node.className = 'star-accessible';
    node.dataset.key = entry.key;
    node.style.setProperty('--color', entry.color);
    node.setAttribute('aria-label', `${entry.title}. ${dateLabel(entry.date)}. Bring into view.`);
    node.setAttribute('aria-pressed', 'false');
    node.addEventListener('click', () => activateStar(entry));
    node.addEventListener('focus', () => {keyboardKey=entry.key; showPreview(entry);});
    node.addEventListener('blur', () => {keyboardKey=''; hidePreview();});
    nodes.set(entry.key, node);
    particles.set(entry.key, oldParticles.get(entry.key) || makeParticle(entry.key));
    fragment.append(node);
  }
  $('#stars').replaceChildren(fragment);
  measure();
}
function renderFocus(label) {
  const entry = byKey.get(focusedKey);
  if (!entry) return;
  $('#focus-date').textContent = timeLabel(entry);
  $('#focus-title').textContent = entry.title;
  $('#focus-copy').textContent = entry.text;
  $('#focus-card').style.setProperty('--color', entry.color);
  for (const [key,node] of nodes) {
    node.classList.toggle('front', key === focusedKey);
    node.setAttribute('aria-pressed', String(key === focusedKey));
    node.hidden = sequenceIndex.has(key) && sequenceIndex.get(key) > cursor;
  }
  $('#position').value = cursor;
  $('#position').setAttribute('aria-valuetext', `${cursor+1} of ${dated.length}. ${dated[cursor]?.title || ''}. ${dateLabel(dated[cursor]?.date)}`);
  $('#sequence-count').textContent = `${cursor+1} / ${dated.length} dated entries`;
  $('#previous').disabled = cursor <= 0;
  $('#next').disabled = cursor >= dated.length-1;
  $('#days').querySelectorAll('button').forEach(button => {
    const active = button.dataset.day === dated[cursor]?.date;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
  updatePlayButton();
}
function seek(index, announce = true) {
  const previousCursor = cursor;
  cursor = Math.max(0, Math.min(dated.length-1, index));
  focusedKey = dated[cursor]?.key || entries[0]?.key;
  returned = false;
  if(cursor === previousCursor + 1 && noticedAt.size) brighten(focusedKey);
  else resetAttention();
  hidePreview(); renderFocus();
  if (announce && !playing) $('#announcement').textContent = `${byKey.get(focusedKey)?.title}. ${dateLabel(byKey.get(focusedKey)?.date)}.`;
}
function bringForward(key, label) {
  const entry = byKey.get(key);
  if (!entry) return;
  const index = sequenceIndex.get(key);
  if (index !== undefined && index > cursor) cursor = index;
  focusedKey = key;
  returned = true;
  brighten(key);
  hidePreview(); renderFocus(label);
  $('#announcement').textContent = `${entry.title} is back in view. Original date: ${dateLabel(entry.date)}.`;
}
function updatePlayButton() {
  $('#play').textContent = playing ? 'Pause Ⅱ' : cursor >= dated.length-1 ? 'Replay ▷' : 'Play ▷';
  $('#play').setAttribute('aria-pressed',String(playing));
}
function stopPlayback() {playing = false; clearInterval(timer); timer = null; updatePlayButton();}
function startPlayback() {
  if (dated.length < 2) return;
  if (cursor >= dated.length-1) seek(0,false);
  playing = true; updatePlayButton();
  clearInterval(timer);
  timer = setInterval(() => {
    if (document.hidden || document.querySelector('dialog[open]')) {stopPlayback(); return;}
    if (cursor >= dated.length-1) {stopPlayback(); return;}
    seek(cursor+1,false);
    if (cursor >= dated.length-1) stopPlayback();
  },Number($('#speed').value));
}
$('#play').addEventListener('click', () => playing ? stopPlayback() : startPlayback());
$('#previous').addEventListener('click', () => {stopPlayback(); seek(cursor-1);});
$('#next').addEventListener('click', () => {stopPlayback(); seek(cursor+1);});
$('#position').addEventListener('input', e => {stopPlayback(); seek(Number(e.target.value));});
$('#speed').addEventListener('change', () => {if (playing) startPlayback();});

function measure() {
  width=universe.clientWidth; height=universe.clientHeight;
  const ratio=Math.min(2,window.devicePixelRatio || 1);
  if(ratio!==pixelRatio) {pixelRatio=ratio;sprites.clear();}
  canvas.width=Math.round(width*pixelRatio); canvas.height=Math.round(height*pixelRatio);
  ctx.setTransform(pixelRatio,0,0,pixelRatio,0,0);
}
new ResizeObserver(measure).observe(universe);
function frame(now) {
  const dt = Math.min(.05,(now-previousFrame)/1000 || .016); previousFrame=now;
  if (!document.hidden) {
    attentionTime += dt;
    if(touchMapMode && window.AtlasTouchInput){
      const input=window.AtlasTouchInput;
      input.tick(dt);
      turnTarget+=input.dx;pitchTarget-=input.dy;input.dx=input.dy=0;
      targetDistance=3.1-input.pressure*.65;
    }
    const modal = !!document.querySelector('dialog[open]');
    if(modal) {requestAnimationFrame(frame);return;}
    const ease = reduced ? 1 : 1-Math.exp(-dt*3.2);
    const movable = drifting && !reduced && !modal && !hoverKey && !drag;
    if (movable) {driftTime+=dt; turnTarget+=pointerX*Math.abs(pointerX)*dt*.32; pitchTarget-=pointerY*Math.abs(pointerY)*dt*.24;}
    turn+=(turnTarget-turn)*ease; pitch+=(pitchTarget-pitch)*ease;
    distance+=(targetDistance-distance)*ease;
    const cx=width*.5, cy=height*.5, focal=Math.min(width*.9,height*1.18);
    const cosY=Math.cos(turn), sinY=Math.sin(turn), cosX=Math.cos(pitch), sinX=Math.sin(pitch);
    drawn=[];
    for (const entry of entries) {
      const node=nodes.get(entry.key), p=particles.get(entry.key);
      if (node.hidden) continue;
      const front=entry.key===focusedKey;
      const elapsed=Math.max(0,attentionTime-(noticedAt.get(entry.key) ?? attentionTime-220));
      const strength=Math.exp(-elapsed/FADE_SECONDS);
      const index=sequenceIndex.get(entry.key);
      const recency=index===undefined?0:Math.exp(-(dated.length-1-index)/18);
      const birthAge=p.birthAt===undefined?Infinity:Math.max(0,attentionTime-p.birthAt);
      const birthLinear=reduced?1:Math.min(1,birthAge/BIRTH_SECONDS);
      const birth=1-Math.pow(1-birthLinear,3);
      const bob=drifting && !reduced ? Math.sin(driftTime*.36+p.phase)*.007 : 0;
      // Same volumetric distribution and two-axis perspective rotation as V1.
      const x=p.x*cosY+p.z*sinY, z0=-p.x*sinY+p.z*cosY;
      const y=(p.y+bob)*cosX-z0*sinX, z=(p.y+bob)*sinX+z0*cosX;
      const viewZ=distance-z;
      const targetX=cx+x*1.55*focal/Math.max(.12,viewZ);
      const targetY=cy+y*.74*focal/Math.max(.12,viewZ);
      const visible=viewZ>.14&&targetX>-30&&targetX<width+30&&targetY>-30&&targetY<height+30;
      if(p.visible!==visible) {node.tabIndex=visible?0:-1;p.visible=visible;}
      if(!visible) continue;
      // Continuous intrinsic variation, depth and attention all contribute.
      // Moving the camera closer reveals small, nearly invisible background points.
      const scale=Math.min(8,2.6/viewZ);
      // Date recency gives new moments a reliable visible scale. Returning
      // attention changes brightness only, so selecting a star cannot enlarge it.
      const size=Math.min(20,Math.max(p.baseSize,.35+recency*4.85)*scale);
      const projectedAlpha=Math.min(.98,(p.luminance+strength*.6)*Math.pow(scale,1.6));
      const alpha=Math.min(1,Math.max(projectedAlpha,strength*.72)*birth+(touchMapMode?(window.AtlasTouchInput?.pressure||0)*.32:0));
      const bornSize=size*(.32+birth*.68);
      if (p.sx === null) {p.sx=targetX; p.sy=targetY;}
      p.sx+=(targetX-p.sx)*ease; p.sy+=(targetY-p.sy)*ease;
      p.size+=(bornSize-p.size)*ease; p.alpha+=(alpha-p.alpha)*ease;
      p.blur+=((.6+(1-strength)*.4+(1-birth)*1.1)-p.blur)*ease;
      drawn.push({entry,p,depth:Math.round(1000/viewZ)});
    }
    paintStars();
  }
  requestAnimationFrame(frame);
}
function hidePreview() {hoverKey=''; preview.hidden=true;}
function showPreview(entry) {
  if (touchMapMode || drag || document.querySelector('dialog[open]')) return;
  hoverKey=entry.key;
  preview.innerHTML=`<span>${escapeHTML(timeLabel(entry))}</span><strong>${escapeHTML(entry.title)}</strong>`;
  preview.hidden=false;
  const bounds=universe.getBoundingClientRect(), p=particles.get(entry.key);
  const rect={right:bounds.left+(p?.sx ?? width/2)+13,top:bounds.top+(p?.sy ?? height/2)-13};
  preview.style.left=Math.max(10,Math.min(innerWidth-preview.offsetWidth-12,rect.right+12))+'px';
  preview.style.top=Math.max(10,Math.min(innerHeight-preview.offsetHeight-12,rect.top))+'px';
}
universe.addEventListener('pointermove',event => {
  const rect=universe.getBoundingClientRect();
  pointerX=Math.max(-1,Math.min(1,((event.clientX-rect.left)/width-.5)*2));
  pointerY=Math.max(-1,Math.min(1,((event.clientY-rect.top)/height-.5)*2));
  if (!drag || drag.id!==event.pointerId) {
    const hit=event.target===canvas?hitStar(event.clientX,event.clientY):null;
    if(hit && hoverKey!==hit.key) showPreview(hit);
    else if(!hit && hoverKey) hidePreview();
    return;
  }
  if (!drag.moved && Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<5) return;
  if (!drag.moved) {drag.moved=true; universe.setPointerCapture(event.pointerId); universe.classList.add('dragging'); hidePreview();}
  turnTarget+=(event.clientX-drag.x)*.008;
  pitchTarget-=(event.clientY-drag.y)*.008;
  // Dragging reacts much faster than the ambient edge motion.
  turn=turnTarget; pitch=pitchTarget;
  drag.y=event.clientY; drag.x=event.clientX; event.preventDefault();
});
universe.addEventListener('pointerleave',()=>{pointerX=pointerY=0;hidePreview();});
universe.addEventListener('pointerdown',event=>{
  if(event.button!==0 || event.target.closest('.field-controls')) return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,moved:false};
});
function endDrag(event) {
  if (!drag || (event.pointerId!==undefined && event.pointerId!==drag.id)) return;
  const previous=drag; drag=null;
  if (previous.moved) suppressClickUntil=performance.now()+300;
  if(universe.hasPointerCapture(previous.id)) universe.releasePointerCapture(previous.id);
  universe.classList.remove('dragging'); pointerX=pointerY=0;
}
window.addEventListener('pointerup',endDrag);
window.addEventListener('pointercancel',endDrag);
window.addEventListener('blur',endDrag);
universe.addEventListener('lostpointercapture',endDrag);
universe.addEventListener('wheel',event=>{
  if(event.ctrlKey) return;
  event.preventDefault(); hidePreview();
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?height:1);
  targetDistance=Math.max(.18,Math.min(5.5,targetDistance+Math.max(-180,Math.min(180,delta))*.0035));
},{passive:false});
$('#home-view').addEventListener('click',()=>{turnTarget=0;pitchTarget=0;targetDistance=3.1;pointerX=pointerY=0;});
function updateMotion(){ $('#motion').textContent=drifting?'Pause drift':'Start drift'; $('#motion').setAttribute('aria-pressed',String(drifting)); }
$('#motion').addEventListener('click',()=>{drifting=!drifting;updateMotion();});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',event=>{reduced=event.matches;drifting=!reduced;updateMotion();});
window.addEventListener('resize',()=>{measure();hidePreview();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){stopPlayback();hidePreview();}});

function openDialog(id) {
  stopPlayback(); hidePreview(); returningFocus=document.activeElement;
  $('#'+id).showModal();
}
document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>$('#'+button.dataset.close).close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>{returningFocus?.focus?.({preventScroll:true});hidePreview();}));
function openDetail() {
  const entry=byKey.get(focusedKey); if(!entry) return;
  const fields=[['PLACE',entry.place],['BODY',entry.body],['SURFACE',entry.object],['SENSATION',entry.texture],['MOOD',entry.mood || 'Not reported']];
  $('#detail-body').innerHTML=`<p class="eyebrow">${escapeHTML(entry.key)} · TOUCH</p>
    <h2 id="detail-title">${escapeHTML(entry.title)}</h2><p class="moment-date">${escapeHTML(timeLabel(entry))}</p>
    <blockquote class="quote">${escapeHTML(entry.text)}</blockquote>
    <dl class="metadata">${fields.map(([label,value])=>`<dt>${label}</dt><dd>${escapeHTML(value || 'Not recorded')}</dd>`).join('')}</dl>
    ${entry.followUp?`<p class="source-note">Still to check: ${escapeHTML(entry.followUp)}</p>`:''}
    ${entry.source?`<details class="source-original"><summary>Original source wording · row ${entry.sourceRow}</summary>${Object.entries(entry.source).filter(([k,v])=>v!==null&&!['证据状态','依据'].includes(k)).map(([k,v])=>`<p><strong>${escapeHTML(k)}</strong><br>${escapeHTML(v)}</p>`).join('')}</details>`:''}`;
  openDialog('detail'); $('#detail').scrollTop=0;
}
$('#focus-title').addEventListener('click',openDetail);
$('#focus-title').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openDetail();}});
$('#about').addEventListener('click',()=>openDialog('method'));

function searchWords(value) {
  return String(value || '').normalize('NFKC').toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}
function searchScore(entry, terms) {
  if(!terms.length) return 1;
  // Search content, not hidden source notes/statuses. English matches start at
  // word boundaries (and no longer matches hand); Chinese supports substrings.
  const source=entry.source || {};
  const fields=[
    [entry.key,12], [entry.title,10], [entry.object,8], [entry.text,6],
    [entry.body,4], [entry.place,4], [entry.scene,3], [entry.texture,2],
    [entry.date,2], [entry.time,2],
    [source['接触对象'],8], [source['具体动作'],6], [source['身体部位'],4],
    [source['空间'],4], [source['触感'],2]
  ].map(([value,weight])=>({text:String(value || '').normalize('NFKC').toLocaleLowerCase(),words:searchWords(value),weight}));
  let score=0;
  for(const term of terms) {
    let best=0;
    for(const field of fields) {
      const chinese=/[\p{Script=Han}]/u.test(term);
      const exact=field.words.includes(term);
      const matches=chinese ? field.text.includes(term) : field.words.some(word=>word.startsWith(term));
      if(matches) best=Math.max(best,field.weight+(exact?2:0));
    }
    if(!best) return 0;
    score+=best;
  }
  return score;
}
function renderArchive() {
  const query=$('#search').value.trim(), day=$('#archive-day').value;
  const terms=searchWords(query);
  const found=entries.map(entry=>({entry,score:searchScore(entry,terms)}))
    .filter(({entry,score})=>score>0 && (day==='all' || (day==='undated' ? !entry.date : entry.date===day)))
    .sort((a,b)=>b.score-a.score).map(({entry})=>entry);
  $('#archive-count').textContent=`${found.length} ${found.length===1?'entry':'entries'}${query ? ' matching “'+query+'”' : ''}`;
  $('#archive-list').innerHTML=found.length ? found.map(entry=>`<button data-entry="${escapeHTML(entry.key)}"><span>${escapeHTML(entry.sourceId?'CLOUD':entry.key)}</span><span><strong>${escapeHTML(entry.title)}</strong><small class="search-excerpt">${escapeHTML(entry.text)}</small><small>${escapeHTML(timeLabel(entry))}</small></span><span class="return-arrow">↗</span></button>`).join('') : '<p class="muted">No contacts match. Try another word or date.</p>';
}
function openArchive(undated=false) {
  $('#search').value=''; $('#archive-day').value=undated?'undated':'all';
  renderArchive(); openDialog('archive'); $('#archive').scrollTop=0;
}
$('#archive-open').addEventListener('click',()=>openArchive());
$('#undated-open').addEventListener('click',()=>openArchive(true));
$('#search').addEventListener('input',renderArchive);
$('#search').addEventListener('search',renderArchive);
$('#search').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();renderArchive();}});
$('#archive-day').addEventListener('change',renderArchive);
$('#archive-list').addEventListener('click',event=>{
  const button=event.target.closest('[data-entry]'); if(!button) return;
  $('#archive').close(); bringForward(button.dataset.entry);
  $('#focus-title').focus({preventScroll:true});
});
$('#export').addEventListener('click',()=>{
  const content={title:'TUTU · Touch & Attention',timeZone:'America/Los_Angeles',
    note:'Rows are contact types or action steps, not counts of actual touches. Visual recession is not measured awareness. Source statuses and original dates are retained.',entries};
  const url=URL.createObjectURL(new Blob([JSON.stringify(content,null,2)],{type:'application/json'}));
  const anchor=document.createElement('a'); anchor.href=url; anchor.download='tutu-touch-diary.json'; anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});

function cloudEntry(record) {
  const when=new Date(record.recordedAt), valid=Number.isFinite(when.getTime());
  const date=valid?new Intl.DateTimeFormat('en-CA',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(when):null;
  return {...record, key:'cloud-'+record.id, sourceId:record.id, date,
    time:valid?when.toLocaleTimeString('en-US',{timeZone:'America/Los_Angeles',hour:'numeric',minute:'2-digit'}):'',
    evidence:'Personal log',color:safeColor(record.color),texture:'Not separately recorded',contactForm:'Not recorded',senses:record.senses?.length?record.senses:['Touch']};
}
function syncSaved() {
  let incoming=[];
  try {incoming=(window.AtlasRecords?.read() || []);}
  catch(error){console.warn('Could not read saved touch records:',error.message);return;}
  const signature=JSON.stringify(incoming);
  if(signature===syncSignature) return;
  const firstSync=!syncSignature;
  syncSignature=signature;
  const formerKeys=new Set(entries.map(e=>e.key)), formerCursorKey=dated[cursor]?.key;
  const wasAtLatest=cursor>=dated.length-1;
  const oldFocus=focusedKey;
  entries=[...base,...incoming.map(cloudEntry)];
  rebuildIndex(); renderStars();
  cursor=wasAtLatest?dated.length-1:(sequenceIndex.get(formerCursorKey) ?? dated.length-1);
  focusedKey=byKey.has(oldFocus)?oldFocus:dated[cursor]?.key;
  const additions=entries.filter(e=>e.sourceId&&!formerKeys.has(e.key));
  if(additions.length){
    if(!firstSync) {
      additions.forEach(entry=>{const particle=particles.get(entry.key);if(particle)particle.birthAt=attentionTime;});
      playBirthNote();
    }
    stopPlayback();bringForward(additions[additions.length-1].key,'NEW FROM YOUR LOG');
  }
  else renderFocus();
  if($('#archive').open) renderArchive();
  if($('#detail').open) {
    // A sign-out or cross-device removal must not leave a deleted cloud entry open.
    if(!byKey.has(oldFocus)) $('#detail').close();
  }
  openLinked();
}
function openLinked() {
  const match=location.hash.match(/^#record=(.+)$/); if(!match) return;
  let id;try{id=decodeURIComponent(match[1]);}catch{return;}
  const entry=entries.find(e=>e.sourceId===id);
  if(entry){stopPlayback();bringForward(entry.key,'FROM YOUR LOG');}
}
window.addEventListener('atlas-records-changed',syncSaved);
window.addEventListener('storage',syncSaved);
window.addEventListener('hashchange',openLinked);

rebuildIndex(); renderStars(); seek(dated.length-1,false); updateMotion();
syncSaved(); openLinked(); requestAnimationFrame(frame);
