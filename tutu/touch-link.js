/* Ephemeral controls only: no diary content is sent or stored. */
(()=>{'use strict';
const hash=new URLSearchParams(location.hash.slice(1));let room=hash.get('room');
if(!/^[a-f0-9]{32}$/.test(room||'')){try{room=localStorage.getItem('tutu-touch-room')}catch{}if(!/^[a-f0-9]{32}$/.test(room||'')){room=Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join('')}}
try{localStorage.setItem('tutu-touch-room',room)}catch{}
const source=Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>n.toString(16).padStart(2,'0')).join('');
let sequence=0,ready=false,remote=null;const listeners=new Set(),seen=new Map();
const local=typeof BroadcastChannel==='function'?new BroadcastChannel('tutu-touch-'+room):null;
function receive(m){if(!m||m.room!==room||m.source===source||typeof m.source!=='string'||m.source.length>40||!Number.isSafeInteger(m.sequence)||!['touch','pressure','presence'].includes(m.kind))return;
if(m.sequence<=(seen.get(m.source)||0))return;if(seen.size>100)seen.clear();seen.set(m.source,m.sequence);for(const fn of listeners)fn(m)}
if(local)local.onmessage=e=>receive(e.data);
function state(value){api.state=value;dispatchEvent(new CustomEvent('touch-link-state',{detail:value}))}
const api=window.TouchLink={room,state:'local',on:fn=>listeners.add(fn),send(kind,data){const m={room,source,sequence:++sequence,kind,...data};local?.postMessage(m);if(ready)remote.send({type:'broadcast',event:'control',payload:m}).catch(()=>state('error'))},url(file){const u=new URL(file,location.href);u.hash='room='+room;return u.href}};
const config=window.ATLAS_CLOUD_CONFIG;
if(window.supabase&&config?.url&&config?.publishableKey){const client=supabase.createClient(config.url,config.publishableKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},realtime:{params:{eventsPerSecond:30}}});
remote=client.channel('tutu-touch-'+room,{config:{broadcast:{self:false}}});remote.on('broadcast',{event:'control'},({payload})=>receive(payload)).subscribe(s=>{ready=s==='SUBSCRIBED';state(ready?'connected':s==='CHANNEL_ERROR'||s==='TIMED_OUT'?'error':'connecting')});
addEventListener('pagehide',()=>{client.removeChannel(remote);local?.close()},{once:true})}
})();
