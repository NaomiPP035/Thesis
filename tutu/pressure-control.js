'use strict';
const $=id=>document.getElementById(id),channel={postMessage:data=>window.TouchLink.send('pressure',{value:data.value})};
let port=null,reader=null,reading=null,connecting=false,closing=false,raw=null,lastRead=0,simulation=0,pointer=null;
function status(text){$('status').textContent=text}
function calibration(){const base=Number($('baseline').value),max=Number($('maximum').value);return {base,max,valid:$('baseline').value!==''&&$('maximum').value!==''&&Number.isFinite(base)&&Number.isFinite(max)&&Math.abs(max-base)>=5&&base>=0&&max>=0&&base<=65535&&max<=65535}}
function pressure(){if(!port)return simulation;if(raw===null||performance.now()-lastRead>1500)return 0;const c=calibration();return c.valid?Math.min(1,Math.max(0,(raw-c.base)/(c.max-c.base)*Number($('gain').value))):0}
function send(){const value=pressure();channel.postMessage({type:'pressure',value});$('percent').textContent=Math.round(value*100);$('fill').style.width=value*100+'%';if(port&&!closing)status(performance.now()-lastRead>1500?'已连接 · 等待有效数据，请检查程序和波特率':'传感器已连接 · A0 实时输入');}
setInterval(send,80);
function simulationValue(value){simulation=Math.min(1,Math.max(0,value));$('simulation').value=Math.round(simulation*100);$('pad').classList.toggle('active',simulation>0);send()}
function release(){pointer=null;simulationValue(0)}
$('simulation').oninput=()=>simulationValue(Number($('simulation').value)/100);$('release').onclick=release;
$('pad').onpointerdown=e=>{if(port)return;pointer=e.pointerId;$('pad').setPointerCapture(pointer);simulationValue(.35)};
$('pad').onpointermove=e=>{if(pointer!==e.pointerId)return;const r=$('pad').getBoundingClientRect();simulationValue(1-(e.clientY-r.top)/r.height)};
for(const name of ['pointerup','pointercancel','lostpointercapture'])$('pad').addEventListener(name,release);
$('pad').onkeydown=e=>{if((e.key===' '||e.key==='Enter')&&!port){e.preventDefault();simulationValue(.6)}};
$('pad').onkeyup=e=>{if(e.key===' '||e.key==='Enter')release()};addEventListener('blur',release);
$('gain').oninput=()=>{$('gainValue').textContent=Number($('gain').value).toFixed(1);send()};
function validate(){const c=calibration();$('calibration').textContent=c.valid?'校准范围已设置 · 压力为相对强度。':'两个读数需相差至少 5；请输入有效的原始读数。';send()}
for(const id of ['baseline','maximum'])$(id).oninput=validate;
$('zero').onclick=()=>{if(raw!==null){$('baseline').value=raw;validate()}};$('peak').onclick=()=>{if(raw!==null){$('maximum').value=raw;validate()}};
function ui(){const active=!!port;for(const id of ['pad','simulation','release','baud'])$(id).disabled=active||connecting;$('connect').disabled=active||connecting;$('disconnect').disabled=!active||closing;for(const id of ['zero','peak'])$(id).disabled=!active||raw===null;}
async function readLoop(active){const decoder=new TextDecoder();let buffer='';try{reader=active.readable.getReader();while(!closing){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});const lines=buffer.split('\n');buffer=lines.pop();if(buffer.length>128)buffer='';for(const line of lines){const text=line.trim();if(!/^\d{1,5}$/.test(text))continue;const n=Number(text);if(n>65535)continue;raw=n;lastRead=performance.now();$('raw').textContent=n;ui();}}}catch(error){if(!closing)status('连接中断：'+error.message)}finally{reader?.releaseLock();reader=null;try{await active.close()}catch{}port=null;raw=null;simulation=0;$('raw').textContent='—';ui();send();status('已断开 · 可以使用模拟模式');}}
$('connect').onclick=async()=>{if(!navigator.serial||!isSecureContext){status('请使用桌面 Chrome / Edge，通过 localhost 或 HTTPS 打开。');return}connecting=true;ui();try{const selected=await navigator.serial.requestPort();await selected.open({baudRate:Number($('baud').value)});await selected.setSignals({dataTerminalReady:true}).catch(()=>{});port=selected;closing=false;raw=null;lastRead=performance.now();release();reading=readLoop(selected);}catch(error){status(error.name==='NotFoundError'?'未选择设备 · 仍可模拟':'无法连接：'+error.message+'。请关闭占用串口的程序。')}finally{connecting=false;ui()}};
$('disconnect').onclick=async()=>{closing=true;ui();if(reader)await reader.cancel().catch(()=>{});await reading;closing=false;ui()};
addEventListener('pagehide',()=>{channel.postMessage({type:'pressure',value:0});reader?.cancel().catch(()=>{})});
if(!navigator.serial||!isSecureContext)status('模拟模式 · 硬件连接需要桌面 Chrome / Edge 的 localhost 或 HTTPS 页面');

