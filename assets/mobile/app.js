const $ = selector => document.querySelector(selector);
const record = $('#record');
const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
const draftKey = 'between-surfaces.draft.v1';

let recognition = null;
let holding = false;
let state = 'idle';
let watchdog = null;
let baseline = '';
let speechText = '';
let pendingReview = false;
let error = false;
let savedId = null;
let locating = false;
let speechLang = localStorage.getItem('between-surfaces.speech-language') || 'zh-CN';

const canvas = $('#particles');
const ctx = canvas.getContext('2d');
let seed = 193;
function random() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
const dots = Array.from({ length: 390 }, () => {
  const angle = random() * Math.PI * 2;
  const z = random() * 2 - 1;
  const radius = Math.cbrt(random());
  const redFamily = random() < .36;
  return {
    x: Math.cos(angle) * Math.sqrt(1 - z * z) * radius,
    y: Math.sin(angle) * Math.sqrt(1 - z * z) * radius,
    z: z * radius,
    h: redFamily ? (340 + random() * 55) % 360 : random() * 360,
    l: 18 + random() * 65,
    s: 24 + random() * 72,
    size: .35 + random() * 1.8
  };
});
let tick = 0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
function paint() {
  const size = canvas.clientWidth;
  const dpr = Math.min(devicePixelRatio, 2);
  if (canvas.width !== Math.round(size * dpr)) {
    canvas.width = Math.round(size * dpr);
    canvas.height = canvas.width;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, size, size);
  if (!reduced.matches) tick += state === 'listening' ? .009 : .0018;
  const pulse = state === 'listening' ? 1 + Math.sin(tick * 9) * .035 : 1;
  for (const point of dots) {
    const x = point.x * Math.cos(tick) + point.z * Math.sin(tick);
    const z = -point.x * Math.sin(tick) + point.z * Math.cos(tick);
    const scale = 1 / (2.9 - z);
    const radius = size * .95 * pulse;
    ctx.beginPath();
    ctx.fillStyle = `hsla(${point.h} ${point.s}% ${point.l}% / ${.3 + scale})`;
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 3;
    ctx.arc(size / 2 + x * radius * scale, size / 2 + point.y * radius * scale, point.size * (.5 + scale), 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(paint);
}
paint();

function localTime() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
$('#when').value = localTime();

function hasChinese(text) {
  return /[\u3400-\u9fff]/.test(text);
}
function decodeText(text) {
  const box = document.createElement('textarea');
  box.innerHTML = text;
  return box.value;
}
function splitForTranslation(text, max = 420) {
  const pieces = text.match(/[^。！？!?\n]+[。！？!?\n]?/g) || [text];
  const chunks = [];
  let current = '';
  for (const piece of pieces) {
    if ((current + piece).length <= max) {
      current += piece;
      continue;
    }
    if (current.trim()) chunks.push(current.trim());
    for (let i = 0; i < piece.length; i += max) chunks.push(piece.slice(i, i + max).trim());
    current = '';
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
}
async function translateToEnglish(text) {
  if (!hasChinese(text)) return text.trim();
  const translated = [];
  for (const chunk of splitForTranslation(text)) {
    const url = new URL('https://api.mymemory.translated.net/get');
    url.searchParams.set('q', chunk);
    url.searchParams.set('langpair', 'zh-CN|en');
    const response = await fetch(url);
    if (!response.ok) throw Error('Translation is temporarily unavailable.');
    const data = await response.json();
    const value = decodeText(data?.responseData?.translatedText || '').trim();
    if (!value) throw Error('Translation did not return any text.');
    translated.push(value);
  }
  return translated.join(' ').replace(/\s+/g, ' ').trim();
}

const gerunds = {
  touched: 'Touching', held: 'Holding', saw: 'Seeing', heard: 'Hearing',
  ate: 'Eating', made: 'Making', cooked: 'Cooking', dropped: 'Dropping',
  felt: 'Feeling', bought: 'Buying', went: 'Going', drank: 'Drinking',
  noticed: 'Noticing', found: 'Finding', pressed: 'Pressing',
  grabbed: 'Grabbing', opened: 'Opening', tried: 'Trying',
  wore: 'Wearing', put: 'Putting'
};
function momentTitle(text) {
  let first = text.trim().split(/[.!?\n]/)[0]
    .replace(/^(well|so|um|uh|okay|ok)[, ]+/i, '')
    .replace(/^I\s+(just\s+)?/i, '')
    .trim()
    .split(/,|\s+(?:and|but|because|so|while|when)\s+/i)[0]
    .trim();
  const words = first.split(/\s+/).filter(Boolean);
  if (!words.length) return 'A Small Moment';
  const verb = words[0].toLowerCase();
  if (gerunds[verb]) words[0] = gerunds[verb];
  else words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  let title = words.slice(0, 7).join(' ').replace(/[,;:]$/, '');
  if (title.length > 52) title = title.slice(0, 52).replace(/\s+\S*$/, '');
  return title || 'A Small Moment';
}
async function prepareEnglish(text) {
  status('Turning this moment into English…');
  try {
    return await translateToEnglish(text);
  } catch (translationError) {
    status(translationError.message + ' Your original words are still here.');
    return text.trim();
  }
}

function locationLabel(data) {
  const address = data?.address || {};
  const parts = [
    address.road || address.pedestrian || address.neighbourhood || address.suburb,
    address.city || address.town || address.village || address.county,
    address.state
  ].filter(Boolean);
  return [...new Set(parts)].slice(0, 3).join(', ') || data?.display_name || '';
}
function autoFillLocation() {
  const place = $('#place');
  const note = $('#location-status');
  if (locating || place.value.trim()) return;
  if (!navigator.geolocation) {
    note.textContent = 'Location is unavailable—you can type it instead.';
    return;
  }
  locating = true;
  note.textContent = 'Finding your location…';
  navigator.geolocation.getCurrentPosition(async position => {
    locating = false;
    if (place.value.trim()) return;
    const { latitude, longitude } = position.coords;
    try {
      const url = new URL('https://nominatim.openstreetmap.org/reverse');
      url.searchParams.set('format', 'jsonv2');
      url.searchParams.set('lat', latitude);
      url.searchParams.set('lon', longitude);
      url.searchParams.set('zoom', '16');
      url.searchParams.set('addressdetails', '1');
      url.searchParams.set('accept-language', 'en');
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw Error('lookup failed');
      const data = await response.json();
      place.value = locationLabel(data) || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      note.innerHTML = 'Location added automatically · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>';
      saveDraft();
    } catch {
      place.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      note.textContent = 'Coordinates added automatically; you can replace them with a place name.';
      saveDraft();
    }
  }, () => {
    locating = false;
    note.textContent = 'Location is off—you can type it instead.';
  }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
}

function screen(name) {
  for (const id of ['capture', 'review', 'settings', 'success']) {
    $('#' + id).hidden = id !== name;
  }
  document.querySelectorAll('[data-screen]').forEach(button => {
    if (button.dataset.screen === name) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
}
function status(text) {
  $('#live').textContent = text;
}
function review() {
  if (!$('#title').value && $('#transcript').value.trim()) {
    $('#title').value = momentTitle($('#transcript').value);
  }
  screen('review');
  autoFillLocation();
}
function openWriting() {
  if (state !== 'idle') {
    pendingReview = true;
    holding = false;
    if (state === 'starting') {
      recognition?.abort();
      finish();
    } else {
      stop();
    }
  } else {
    review();
  }
}
async function finish() {
  clearTimeout(watchdog);
  if (state === 'translating') return;
  recognition = null;
  holding = false;
  record.classList.remove('recording');
  if (speechText.trim()) {
    state = 'translating';
    const spoken = await prepareEnglish(speechText.trim());
    $('#transcript').value = [baseline, spoken].filter(Boolean).join('\n');
    state = 'idle';
    saveDraft();
    review();
  } else {
    state = 'idle';
    if (pendingReview) review();
    else if (!error) status('I did not catch anything. Try again, or write it down instead.');
  }
  pendingReview = false;
}
function stop() {
  holding = false;
  if (state === 'listening') {
    state = 'finishing';
    status('Finishing up…');
    recognition?.stop();
    watchdog = setTimeout(() => {
      recognition?.abort();
      finish();
    }, 5000);
  }
}
function start() {
  if (state !== 'idle') return;
  if (!Speech) {
    status('This browser does not support voice transcription, but you can still write.');
    return;
  }
  if (!isSecureContext) {
    status('Voice recording needs a secure connection. You can still write for now.');
    return;
  }
  holding = true;
  error = false;
  pendingReview = false;
  speechText = '';
  baseline = $('#transcript').value.trim();
  state = 'starting';
  status('Getting the microphone ready…');
  const session = new Speech();
  recognition = session;
  session.lang = speechLang;
  session.continuous = true;
  session.interimResults = true;
  session.onstart = () => {
    if (recognition !== session) return;
    state = 'listening';
    if (!holding) {
      stop();
      return;
    }
    record.classList.add('recording');
    status('Listening… release to finish.');
  };
  session.onresult = event => {
    if (recognition !== session) return;
    speechText = Array.from(event.results).map(result => result[0].transcript).join('');
    status(speechText);
  };
  session.onerror = event => {
    if (recognition !== session) return;
    error = true;
    status({
      'not-allowed': 'Microphone access is off. Allow it in your browser, or write instead.',
      network: 'The speech service is not responding. Try again, or write instead.',
      'no-speech': 'I did not hear any speech. Try again, or write instead.',
      'audio-capture': 'No microphone is available. You can still write.'
    }[event.error] || 'The transcription did not finish. Try again, or write instead.');
  };
  session.onend = () => {
    if (recognition === session) finish();
  };
  try {
    session.start();
    watchdog = setTimeout(() => {
      if (state === 'starting') {
        error = true;
        status('The microphone is not ready yet. Try again, or write instead.');
        session.abort();
        finish();
      }
    }, 15000);
  } catch {
    error = true;
    status('Voice recording could not start. You can still write.');
    finish();
  }
}

document.querySelectorAll('[data-speech-lang]').forEach(button => {
  button.setAttribute('aria-pressed', String(button.dataset.speechLang === speechLang));
  button.onclick = () => {
    speechLang = button.dataset.speechLang;
    localStorage.setItem('between-surfaces.speech-language', speechLang);
    document.querySelectorAll('[data-speech-lang]').forEach(option => {
      option.setAttribute('aria-pressed', String(option === button));
    });
  };
});
record.onpointerdown = event => {
  if (event.button !== 0) return;
  event.preventDefault();
  record.setPointerCapture(event.pointerId);
  start();
};
record.onpointerup = stop;
record.onpointercancel = stop;
record.onlostpointercapture = stop;
record.oncontextmenu = event => event.preventDefault();
record.onkeydown = event => {
  if ((event.code === 'Space' || event.code === 'Enter') && !event.repeat) {
    event.preventDefault();
    start();
  }
};
record.onkeyup = event => {
  if (event.code === 'Space' || event.code === 'Enter') {
    event.preventDefault();
    stop();
  }
};
window.addEventListener('blur', stop);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stop();
});

document.querySelectorAll('[data-screen]').forEach(button => {
  button.onclick = () => {
    const target = button.dataset.screen;
    if (target === 'review') {
      openWriting();
      return;
    }
    if (state !== 'idle') {
      holding = false;
      const activeRecognition = recognition;
      recognition = null;
      activeRecognition?.abort();
      clearTimeout(watchdog);
      state = 'idle';
      record.classList.remove('recording');
    }
    saveDraft();
    screen(target);
  };
});
window.addEventListener('atlas-open-settings', () => screen('settings'));

const palette = [
  '#7c152a', '#ef596f', '#ff9ca8', '#e66c2c',
  '#f2c14e', '#88c057', '#3dc6a3', '#39a9db',
  '#4169d8', '#7c45c8', '#d76bd7', '#f0ded4'
];
$('#colors').innerHTML = palette.map(color =>
  `<button type="button" style="--swatch:${color}" aria-label="Choose color ${color}" aria-pressed="${color === $('#color').value}" data-color="${color}"></button>`
).join('');
function colorChanged() {
  document.documentElement.style.setProperty('--accent', $('#color').value);
  document.querySelectorAll('[data-color]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.color === $('#color').value));
  });
}
document.querySelectorAll('[data-color]').forEach(button => {
  button.onclick = () => {
    $('#color').value = button.dataset.color;
    colorChanged();
    saveDraft();
  };
});
$('#color').oninput = () => {
  colorChanged();
  saveDraft();
};

const fields = ['transcript', 'title', 'when', 'place', 'object', 'body', 'mood', 'color'];
function getDraft() {
  return Object.fromEntries(fields.map(key => [key, $('#' + key).value]).concat([
    ['recordId', savedId],
    ['senses', ['Touch']]
  ]));
}
function saveDraft() {
  try {
    localStorage.setItem(draftKey, JSON.stringify(getDraft()));
  } catch {
    $('#form-status').textContent = 'Your browser could not save this draft. Please keep a copy of your words.';
  }
}
try {
  const draft = JSON.parse(localStorage.getItem(draftKey) || 'null');
  if (draft) {
    savedId = typeof draft.recordId === 'string' ? draft.recordId : null;
    fields.forEach(key => {
      if (typeof draft[key] === 'string') $('#' + key).value = draft[key];
    });
    colorChanged();
  }
} catch {}

$('#form').addEventListener('input', saveDraft);
$('#transcript').addEventListener('blur', () => {
  if (!$('#title').value.trim() && $('#transcript').value.trim()) {
    $('#title').value = momentTitle($('#transcript').value);
    saveDraft();
  }
});
$('#form').onsubmit = async event => {
  event.preventDefault();
  if (!$('#transcript').value.trim()) {
    $('#form-status').textContent = 'Write down the moment first.';
    return;
  }
  const submit = $('#send');
  submit.disabled = true;
  try {
    if (hasChinese($('#transcript').value)) {
      const original = $('#transcript').value;
      $('#form-status').textContent = 'Turning your words into English…';
      const translated = await translateToEnglish(original);
      $('#transcript').value = translated;
      if (!$('#title').value.trim() || hasChinese($('#title').value)) {
        $('#title').value = momentTitle(translated);
      }
    }
    if (!$('#title').value.trim()) $('#title').value = momentTitle($('#transcript').value);
    saveDraft();
    await AtlasRecords.ready;
    if (!AtlasRecords.state().user) {
      AtlasCloudUI.open();
      throw Error('Sign in with your email first. Your draft is still here.');
    }
    const draft = getDraft();
    const date = new Date(draft.when);
    if (!Number.isFinite(date.getTime())) throw Error('Check the date and time.');
    savedId = savedId || crypto.randomUUID();
    saveDraft();
    $('#form-status').textContent = 'Saving to the cloud…';
    await AtlasRecords.add({
      id: savedId,
      title: draft.title.trim(),
      text: draft.transcript.trim(),
      recordedAt: date.toISOString(),
      place: draft.place,
      object: draft.object,
      body: draft.body,
      mood: draft.mood,
      senses: draft.senses,
      color: draft.color
    });
    try { localStorage.removeItem(draftKey); } catch {}
    $('#saved-title').textContent = draft.title;
    $('#new-star').style.setProperty('--accent', draft.color);
    $('#view-star').href = 'tutu/map-v2.html#record=' + encodeURIComponent(savedId);
    $('#view-star-v1').href = 'tutu/map-v1.html#record=' + encodeURIComponent(savedId);
    screen('success');
  } catch (saveError) {
    $('#form-status').textContent = 'It did not save: ' + saveError.message + ' Your words are still here, so you can try again.';
  } finally {
    submit.disabled = false;
  }
};
$('#another').onclick = () => {
  savedId = null;
  $('#form').reset();
  $('#when').value = localTime();
  $('#color').value = '#ef596f';
  colorChanged();
  status('');
  $('#form-status').textContent = '';
  screen('capture');
};

if (!Speech) {
  $('#support').textContent = 'Voice transcription is not available in this browser, but writing works normally.';
}
screen('capture');
