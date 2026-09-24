const raw=[
['清理下水管道','浴室','排水口内壁与残留物','手指（隔着手套）、鼻子','触觉 嗅觉','厌恶、烦躁','#77714e','黏滑、湿冷，异味向上涌。','我把头转开，但手还留在排水口里。','我屏住呼吸，把手伸进去，又几次想抽出来。','想尽快结束，清理后反复冲洗手套。','触觉与嗅觉可能让身体产生不同方向的反应；任务要求也可能解释为何继续。'],
['晒过的床单','卧室','棉质床单','手掌、脸颊','触觉 嗅觉','温暖、松弛','#c4a078','干燥、柔软，留着淡淡洗涤剂气味。','我把脸贴上去，多停留了一会儿。','原本准备铺好就离开，手却又抚平了一次褶皱。','身体放松，想躺下来。','柔软可能参与了安定感，也可能是休息的期待。'],
['冷金属扶手','楼梯间','不锈钢扶手','手掌','触觉','清醒、退缩','#7d9aa9','突然的冰冷、光滑。','我的手刚握住，就松开了一点。','下楼时顺手握住扶手，冷感让我缩了缩指尖。','仍然扶着，但接触面积变小了。','安全需要与不适可能同时决定动作。'],
['电梯里的倒影','电梯','拉丝钢板','眼睛、肩膀','视觉','拘谨、自我审视','#8d91b5','模糊的身形映在竖向纹路里。','开门之前，我拉平了外套。','看到倒影后，我抬起头，整理前襟。','开始注意自己是否显得从容。','倒影可能邀请自我检查，也可能是即将见人的情境。'],
['熟悉的袖口','书桌前','旧棉毛衣袖口','拇指、食指','触觉','安稳、熟悉','#9daa8c','薄软的布料和微微凸起的缝线。','我的手不用看就找到了缝线。','写不出第一句话时，我捻着袖口。','停顿后继续写下不完美的草稿。','熟悉感可能帮助开始行动，但停顿本身也可能有作用。'],
['看着自己倾听','线上讨论','屏幕中的自我画面','眼睛、面部','视觉','紧张、分心','#8983b5','亮屏中的小小实时头像。','我看起来专注，却漏听了半句话。','我抬起下巴，检查自己的表情。','注意力从发言者转向了自己。','自我画面可能引发监视表情，群体压力也可能参与。'],
['长椅上的寒意','公交站','金属长椅','大腿、手臂','触觉','不适、疏离','#6d808b','寒意透过衣服，边缘硌着腿。','我坐下了，却没有真正安顿下来。','我坐在边缘，把包留在肩上。','等待还没结束就站了起来。','座椅可能影响停留意愿，天气同样重要。'],
['经过橱窗','街道','反光玻璃','眼睛','视觉','平静、无明显变化','#728b87','自己的轮廓和车流叠在一起。','我的倒影只是经过了。','和朋友聊天时短暂看见轮廓。','没有整理衣服，继续聊天。','反光不一定引发自我检查，注意力也在决定经验。'],
['硬挺的领口','工作室','外套领口','脖子、背部','触觉','正式、克制','#8e919d','硬挺的边缘触到脖子。','衣服撑起一种我试着保持的姿态。','穿上外套后，我坐得更直。','开场白说得更谨慎。','身体约束和衣服的社会联想可能共同作用。'],
['被柔化的脸','卧室','手机美颜预览','眼睛','视觉','比较、不自在','#a68c9f','过于光滑的皮肤图像。','画面更光滑，我却更不满意。','我在原图和柔化图之间来回切换。','没有拍照，关掉了相机。','图像可能引入比较，原有的外貌焦虑也可能存在。'],
['划痕里的许可','工作室','有划痕的木桌','手掌、眼睛','触觉 视觉','自在、投入','#ad916e','刀痕、墨渍和磨圆的边角。','我不再担心留下痕迹。','看见旧划痕后，我把材料铺开。','动作幅度变大，开始尝试。','已有痕迹可能传达许可，工作室惯例也可能解释。'],
['表带下的浅痕','家里','手腕皮肤','指尖、眼睛','触觉 视觉','在意、轻微不适','#b18c7a','浅浅压痕，皮肤有些温热。','一道浅痕把压力留了下来。','我摸过压痕，转了转手腕。','重新戴表前松了一格。','身体痕迹可能使习惯被注意到，也可能只是实用调整。'],
['扎人的围巾','阅览室','粗羊毛围巾','下巴、脖子','触觉','烦躁、排斥','#a18b68','纤维刺痒，持续摩擦。','我不停地给皮肤留出一点空隙。','反复拉开围巾，抓了抓下巴。','脱下围巾后重新阅读。','感官不适未必涉及身份，但仍值得记录。'],
['熟悉的把手','厨房','哑光柜门把手','手掌','触觉','日常、无明显变化','#77857b','干燥，温度接近室温。','我的手知道去哪里。','我打开柜门取出杯子。','继续准备早餐，没有察觉变化。','记录无需为每次普通接触赋予深层意义。'],
['读一道旧疤','家里','手背上的旧疤','眼睛、指尖','触觉 视觉','亲近、复杂','#9f7789','微微隆起，比周围皮肤更浅。','手指沿着一条带着故事的线移动。','我顺着疤痕摸过去，想起旧事。','短暂想起年轻一些的自己。','身体表面可能唤起叙事，记忆也可能自行出现。'],
['海绵里的油','厨房','油腻的洗碗海绵','指尖、鼻子','触觉 嗅觉','嫌恶、抗拒','#797c4f','软塌、油滑，带着残留饭菜的气味。','我只想用两根手指捏住它。','我缩小接触面积，挤出泡沫。','洗完后把它放得离自己远一些。','油滑可能引发排斥，卫生联想也可能参与。'],
['橘子皮破开','厨房','新鲜橘皮','拇指、鼻子','触觉 嗅觉','愉悦、醒神','#c39b5b','皮面颗粒，破开时散出清香。','香气先于果肉抵达。','指甲划开果皮，我把它凑近了一点。','从走神中回到手里的动作。','气味可能吸引注意，饥饿也可能影响愉悦。'],
['湿掉的袜子','回家路上','湿棉袜','脚趾、脚底','触觉','烦躁、急切','#777e71','湿冷的布料黏着脚。','每一步都提醒我还没到家。','鞋子进水后，我加快了脚步。','想尽快脱掉袜子。','持续的不适可能改变步速和对距离的感受。'],
['翻开旧书','图书馆','泛黄书页','指腹、鼻子','触觉 嗅觉','安静、好奇','#b2a281','薄而干燥的纸，有旧纸气味。','我翻得比平时慢一点。','指尖轻轻托起纸角。','注意到页边的手写痕迹。','纸的脆弱和历史联想可能共同改变动作。'],
['玻璃上的水汽','浴室','起雾的镜面','手指、眼睛','触觉 视觉','好奇、短暂轻松','#90aaa8','潮湿光滑，擦过后出现清晰条带。','我擦出一小块能看见自己的地方。','用指尖画开水汽。','只看见局部的脸，然后水汽再次聚拢。','不完整的倒影可能改变观看方式，但未必改变自我理解。'],
['纸箱的毛边','门口','纸箱切口','指腹','触觉','警觉、轻微疼痛','#ac8d76','干涩的边缘刮过皮肤。','我的手忽然变得小心。','摸到毛边后改变了拿箱子的角度。','用掌心托住而不再勾住边缘。','疼痛预期可能重新安排身体与物的接触。'],
['温热的杯壁','书桌前','陶瓷杯','双手','触觉','安定、舒适','#bb9580','温热、圆润，重量落在掌心。','我用两只手抱住这个温度。','暂停打字，握住热杯。','肩膀稍微放松。','热量可能带来安慰，休息的间隙也可能如此。'],
['胶带留下的黏','工作台','指尖上的胶痕','指尖','触觉','不耐烦','#8e896b','轻微拉扯，东西不断粘到手上。','触摸变成了摆脱触摸。','我反复搓动指尖，试着去掉残胶。','难以专心继续粘贴。','残留物可能让身体难以忽略刚刚结束的接触。'],
['风里的窗帘','卧室窗边','薄纱窗帘','手背、眼睛','触觉 视觉','轻盈、放松','#9eafa9','很轻，掠过手背。','我没有把它拨开。','纱帘被风吹到手边。','短暂停下正在做的事。','偶然触碰可能带来停顿，也可能只是风的作用。'],
['塑料袋的摩擦声','超市','薄塑料包装','手指、耳朵','触觉 听觉','局促、在意','#8b9691','薄而滑，揉动时声音清脆。','安静里，包装声突然很大。','我试着慢一点打开袋口。','开始留意周围的人。','声音可能让自己的动作变得显眼，环境安静也很关键。'],
['砂纸的阻力','工作室','砂纸','指腹、耳朵','触觉 听觉','专注、谨慎','#a49477','粗糙颗粒，有细密刮擦声。','阻力让我慢下来。','我减轻压力，来回试探。','注意力集中到指尖。','阻力和声音可能共同提供动作反馈。'],
['洗手后的绷紧','洗手间','手背皮肤','手掌','触觉','干涩、不自在','#b29c87','皮肤发紧，指节拉扯。','干净之后，还有另一种不舒服。','我摊开手，又握了握拳。','寻找护手霜。','清洁和舒适在这次接触中未必一致。'],
['门把上的雨','入口','湿金属门把','手掌','触觉','迟疑','#7e9199','冰凉水滴留在掌心。','我抓住之前犹豫了一下。','换用指尖压下门把。','在衣服上擦了擦手。','不确定的潮湿来源可能比温度更影响反应。'],
['地毯上的赤脚','客厅','短绒地毯','脚底','触觉','安稳、松弛','#aa9d89','绒毛缓冲脚底的压力。','脚步变轻，声音也消失了。','脱鞋后走上地毯。','步伐放慢，站了一会儿。','柔软和安静可能共同改变空间的亲近感。'],
['键盘上的节奏','书桌前','机械键盘','指尖、耳朵','触觉 听觉','投入、连贯','#8899ac','明确回弹和密集敲击声。','声音像在告诉我，事情正在发生。','连续输入一段文字。','感到行动有了节奏。','反馈可能增强投入，但写作顺利也可能是原因。'],
['粗糙的墙面','走廊','水泥墙','手背','触觉','退缩、警觉','#8c8d83','颗粒摩擦皮肤。','我把身体往另一边让了一点。','转身时手背擦到墙。','经过同处时留出更多距离。','一次摩擦可能暂时改变对空间边界的感知。'],
['滑动的丝绸','衣柜前','丝质衬衣','手掌、前臂','触觉','轻松、珍惜','#a598b4','凉滑，几乎没有阻力。','我接住了快要滑走的布料。','把衬衣搭在手臂上。','放下时动作变轻。','滑动和物品价值的联想可能共同带来谨慎。'],
['撕开魔术贴','门厅','鞋面魔术贴','手指、耳朵','触觉 听觉','利落、短暂紧张','#9c9279','强烈阻力突然释放，声音尖锐。','手先用力，然后突然松开。','扯开鞋带搭扣。','看了一眼是否吵到别人。','听觉可能把私人动作带入共享空间。'],
['手机上的指纹','咖啡店','油印覆盖的屏幕','眼睛、拇指','视觉 触觉','在意、轻微嫌恶','#828373','反光中浮出油印，指尖略有阻力。','屏幕留下了我，却让我想擦掉。','用衣角擦过表面。','重新看内容，短暂不再注意痕迹。','身体痕迹可能同时意味着使用与不洁。'],
['面团粘住手','厨房','湿面团','手指、手掌','触觉','挫败、随后投入','#b9a488','柔软、黏稠，拉开时不断牵连。','我越想干净，手上越多。','想甩掉面团，后来改用掌根慢慢揉。','逐渐接受手被包裹。','相似的黏腻在不同任务中可能获得不同意义。'],
['落叶碎在脚下','公园小径','干燥落叶','脚底、耳朵','触觉 听觉','轻快、好奇','#b19759','细碎阻力与脆响。','我又挑了一片踩下去。','听见第一声后改变了落脚位置。','开始主动寻找相似触感。','声音反馈可能引出重复接触。'],
['被褥里的静电','卧室','化纤被套','手指、耳朵','触觉 听觉','惊讶、警觉','#9c8caf','突然刺痛，伴随很轻的噼啪声。','我缩回手，又慢慢靠近。','拉动被套时被电了一下。','再次接触时减慢动作。','突发感觉可能改变对熟悉物的预期。'],
['洗净的瓷盘','厨房','湿瓷盘','手掌、耳朵','触觉 听觉','满意、谨慎','#91a5aa','光滑、略滑手，碰撞声清脆。','我抱得更稳，不想听见它掉落。','擦干时用两只手托住。','确认干燥后才放开。','易碎的预期可能比光滑本身更决定动作。'],
['窗边的阳光','室内窗边','被阳光晒暖的皮肤','前臂','触觉','舒适、停留','#bf9f73','局部温热，与周围凉意形成差别。','我把手臂留在那一小块光里。','从阴影中伸出手。','保持姿势多坐了一会儿。','温度差可能引导身体在空间中的位置。'],
['生锈的栏杆','室外台阶','锈蚀铁栏杆','眼睛、手指','视觉 触觉','犹豫、不信任','#9e7356','粗糙，局部有松动的粉末。','我先看，再决定要不要握。','轻轻试了一个没有锈的地方。','握得很浅，继续下台阶。','可见痕迹可能影响安全与洁净的预判。']
];
const senses=['全部','触觉','视觉','嗅觉','听觉','味觉'];
const baseEntries=raw.map((r,i)=>({id:i+1,title:r[0],place:r[1],object:r[2],body:r[3],senses:r[4].split(' '),mood:r[5],color:r[6],texture:r[7],quote:r[8],action:r[9],after:r[10],reflection:r[11],day:Math.floor(i/6)+1,time:['08:15','10:30','13:10','16:45','19:20','20:40'][i%6],fictional:true}));
// Synthetic variations test a dense atlas; never presented as collected observations.
const contexts=[['独处','周围安静，注意力慢慢回到身体。'],['匆忙时','还有下一件事要做，我没有马上停下来。'],['疲倦时','已经有些疲惫，这种感觉变得更难忽略。'],['有人在旁','我同时注意到自己的动作是否被看见。'],['第一次留意','原本熟悉的接触，今天忽然进入了注意。'],['停顿之后','停了一会儿，再次接触时感受略有不同。'],['清晨','一天刚开始，我还没有完全进入状态。'],['夜里','周围渐渐安静下来，感官变得突出。'],['分心时','脑中想着其他事情，只捕捉到短暂的感觉。'],['慢下来','我放慢动作，试着分辨具体感受。'],['再次接触','我带着之前的印象靠近，也注意到预期。'],['准备离开','我即将离开这个地方，接触变得短促。']];
const entries=contexts.flatMap((ctx,k)=>baseEntries.map((e,i)=>{const hue=(i*137.508+k*23)%360,sat=[24,88,52,96,12,67,38,81,18,73,43,92][(i+k)%12],light=[28,72,44,84,36,59,22,67,48,77,33,55][(i*3+k)%12];return {...e,id:k*baseEntries.length+i+1,title:k?e.title+' · '+ctx[0]:e.title,context:ctx[0],action:e.action+(k?' '+ctx[1]:''),day:Math.floor((k*40+i)/6)+1,color:i===0?'hsl('+ (49+k*2)+' 22% '+(25+k*2)+'%)':'hsl('+hue.toFixed(1)+' '+sat+'% '+light+'%)',variation:k>0,sourceScenario:i+1}}));
entries[0].time='20:40';
const importedIds=new Set();
function escapeRecord(value){return String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function readNewRecords(){try{return AtlasRecords.read().filter(r=>!importedIds.has(r.id))}catch(err){console.warn('Saved records unavailable',err.message);return[]}}
function importRecord(r){importedIds.add(r.id);const escaped=Object.fromEntries(['title','place','object','body','mood','text'].map(k=>[k,escapeRecord(r[k])]));return {id:entries.length+1,sourceId:r.id,title:escaped.title,place:escaped.place||'未填写',object:escaped.object||'未填写',body:escaped.body||'未填写',mood:escaped.mood||'未填写',senses:Array.isArray(r.senses)?r.senses.filter(v=>['触觉','视觉','嗅觉','听觉','味觉'].includes(v)):[],color:/^#[0-9a-f]{6}$/i.test(r.color)?r.color:'#94b9ad',texture:escaped.object||'未填写',quote:escaped.text,action:escaped.text,after:'',reflection:'',recordedAt:r.recordedAt,day:'',time:new Date(r.recordedAt).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'}),fictional:false}}
for(const record of readNewRecords())entries.push(importRecord(record));
function dateLabel(e){return e.recordedAt?escapeRecord(new Date(e.recordedAt).toLocaleDateString('zh-CN')):'DAY '+e.day}

const $=s=>document.querySelector(s),universe=$('#universe'),preview=$('#preview'),detail=$('#detail');
let current=null,filter='全部',hover=null;
let seed=7321;function rand(){seed=(seed*16807)%2147483647;return(seed-1)/2147483646}
// Uniform sampling throughout a sphere's volume, not only its shell.
const positions=entries.map(()=>{const z=rand()*2-1,angle=rand()*Math.PI*2,r=Math.cbrt(rand()),ring=Math.sqrt(1-z*z);return{x:r*ring*Math.cos(angle),y:r*ring*Math.sin(angle),z:r*z,depth:.25+rand()*.75,phase:rand()*Math.PI*2}});
let nodes=[],lineNodes=[],linked=[],width=1,height=1,last=0,yaw=0,pitch=0,vx=0,vy=0,px=0,py=0,drift=0;
let distance=3.1,targetDistance=3.1,animationStarted=false;
let drag=null,suppressClickUntil=0;
let motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
function measure(){width=universe.clientWidth;height=universe.clientHeight;$('#lines').setAttribute('viewBox','0 0 '+width+' '+height)}
function zoomTo(value){if(current||$('#method').open)return;targetDistance=Math.max(.18,Math.min(5.5,value));hover=null;preview.hidden=true;highlight(null);if(!motion)distance=targetDistance}
function frame(t){const dt=Math.min((t-last)/1000||.016,.04);last=t;const paused=current||hover||drag?.moved||$('#method').open||!motion||document.hidden;
const targetX=paused?0:Math.sign(px)*px*px*.32,targetY=paused?0:Math.sign(py)*py*py*.24,ease=1-Math.exp(-dt*3);vx+=(targetX-vx)*ease;vy+=(targetY-vy)*ease;if(!paused){yaw+=vx*dt;pitch-=vy*dt;drift+=dt}
distance+=(targetDistance-distance)*(1-Math.exp(-dt*5));
const mobile=width<750,cx=width*(mobile?.5:.64),cy=height*(mobile?.55:.51),focal=Math.min(width*(mobile?1.06:.72),height*.95),cosY=Math.cos(yaw),sinY=Math.sin(yaw),cosX=Math.cos(pitch),sinX=Math.sin(pitch);
positions.forEach((p,i)=>{const bob=Math.sin(drift*.36+p.phase)*.007,x=p.x*cosY+p.z*sinY,z0=-p.x*sinY+p.z*cosY,y=(p.y+bob)*cosX-z0*sinX,z=(p.y+bob)*sinX+z0*cosX,viewZ=distance-z;
p.sx=cx+x*focal/Math.max(.12,viewZ);p.sy=cy+y*focal/Math.max(.12,viewZ);p.visible=viewZ>.14&&p.sx>-35&&p.sx<width+35&&p.sy>-35&&p.sy<height+35;
const node=nodes[i];node.style.visibility=p.visible?'visible':'hidden';node.tabIndex=p.visible?0:-1;if(p.visible){const scale=Math.min(4,2.5/viewZ),size=(2.2+p.depth*4)*scale,alpha=Math.max(.16,Math.min(1,.95/viewZ+.18));node.style.transform='translate3d('+p.sx.toFixed(2)+'px,'+p.sy.toFixed(2)+'px,0) translate(-50%,-50%)';node.style.setProperty('--size',size.toFixed(2)+'px');node.style.setProperty('--halo',(size*1.3).toFixed(2)+'px');node.style.setProperty('--alpha',alpha.toFixed(2));node.style.zIndex=Math.round(1000/viewZ)}});
if(linked.length){const a=positions[(current?.id||hover)-1];lineNodes.forEach((line,j)=>{const b=positions[linked[j].id-1];line.style.display=a.visible&&b.visible?'':'none';line.setAttribute('x1',a.sx);line.setAttribute('y1',a.sy);line.setAttribute('x2',b.sx);line.setAttribute('y2',b.sy)})}
$('#depth-label').textContent=distance<1?'星群内部':distance<2.4?'正在靠近':'球体全景';requestAnimationFrame(frame)}
document.addEventListener('pointermove',ev=>{if(ev.pointerType==='touch')return;px=Math.max(-1,Math.min(1,(ev.clientX/innerWidth-.5)*2));py=Math.max(-1,Math.min(1,(ev.clientY/innerHeight-.5)*2));if(Math.abs(px)<.12)px=0;if(Math.abs(py)<.12)py=0});document.documentElement.addEventListener('pointerleave',()=>{px=0;py=0});
universe.addEventListener('wheel',e=>{if(e.ctrlKey||current||$('#method').open)return;e.preventDefault();const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?height:1);zoomTo(targetDistance+Math.max(-180,Math.min(180,delta))*.0035)},{passive:false});
$('#forward').onclick=()=>zoomTo(targetDistance-.6);$('#backward').onclick=()=>zoomTo(targetDistance+.6);$('#home-view').onclick=()=>{reset();yaw=0;pitch=0;px=0;py=0;vx=0;vy=0;zoomTo(3.1)};
// Capture only after a movement threshold so a stationary click still opens a record.
universe.addEventListener('pointerdown',e=>{if(e.button!==0||current||$('#method').open)return;drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,x:e.clientX,y:e.clientY,time:performance.now(),moved:false};});
document.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const now=performance.now();if(!drag.moved&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)<5)return;
if(!drag.moved){drag.moved=true;universe.setPointerCapture(e.pointerId);universe.classList.add('dragging');hover=null;preview.hidden=true;highlight(null)}
const dx=e.clientX-drag.x,dy=e.clientY-drag.y,elapsed=Math.max(.008,(now-drag.time)/1000),gain=.008;
yaw+=dx*gain;pitch-=dy*gain;vx=Math.max(-3.5,Math.min(3.5,dx*gain/elapsed));vy=Math.max(-3.5,Math.min(3.5,dy*gain/elapsed));drag.x=e.clientX;drag.y=e.clientY;drag.time=now;e.preventDefault();},{passive:false});
function endDrag(e){if(!drag||(e.pointerId!==undefined&&e.pointerId!==drag.id))return;const active=drag;drag=null;universe.classList.remove('dragging');if(active.moved){suppressClickUntil=performance.now()+350;hover=null;preview.hidden=true;px=0;py=0;if(performance.now()-active.time>120||e.type!=='pointerup'){vx=0;vy=0}}if(universe.hasPointerCapture(active.id))universe.releasePointerCapture(active.id);}
document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',endDrag);universe.addEventListener('lostpointercapture',endDrag);window.addEventListener('blur',endDrag);
universe.addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
function matches(e){return filter==='全部'||e.senses.includes(filter)}
function related(e){return entries.filter(v=>v.id!==e.id&&matches(v)&&v.senses.some(s=>e.senses.includes(s)))}
function draw(){const root=$('#stars');root.innerHTML=entries.map((e,i)=>{const p=positions[i];return '<button class="star" data-id="'+e.id+'" style="--color:'+e.color+';--size:'+(2+p.depth*10).toFixed(1)+'px;--halo:'+(3+p.depth*9).toFixed(1)+'px;--alpha:'+(.32+p.depth*.68).toFixed(2)+';z-index:'+Math.round(p.depth*10)+'" aria-label="'+e.title+'，'+e.mood+'" aria-pressed="false"></button>'}).join('');nodes=[...root.querySelectorAll('.star')];nodes.forEach(b=>{const e=entries[+b.dataset.id-1];b.onpointerenter=()=>{if(!current&&!drag?.moved&&performance.now()>suppressClickUntil){hover=e.id;showPreview(e,b);highlight(e)}};b.onpointerleave=()=>{if(!current){hover=null;preview.hidden=true;highlight(null)}};b.onfocus=()=>{if(!current&&!drag?.moved&&performance.now()>suppressClickUntil){hover=e.id;showPreview(e,b);highlight(e)}};b.onblur=()=>{if(!current){hover=null;preview.hidden=true;highlight(null)}};b.onclick=ev=>{ev.stopPropagation();select(e)}});measure();renderFilters();highlight(current);if(!animationStarted){animationStarted=true;requestAnimationFrame(frame)}}
function renderFilters(){$('#filters').innerHTML=senses.map(s=>`<button aria-pressed="${filter===s}" class="${filter===s?'active':''}">${s}</button>`).join('');$('#filters').querySelectorAll('button').forEach(b=>b.onclick=()=>{filter=b.textContent;reset();renderFilters();highlight(null)});$('#counter').textContent=`${String(entries.filter(matches).length).padStart(2,'0')} encounters`;$('#total').textContent=entries.length}
function highlight(e){linked=e?related(e).filter(v=>positions[v.id-1].visible).sort((a,b)=>{const p=positions[e.id-1],q=positions[a.id-1],r=positions[b.id-1];return Math.hypot(q.sx-p.sx,q.sy-p.sy)-Math.hypot(r.sx-p.sx,r.sy-p.sy)}).slice(0,9):[];const ids=new Set(linked.map(v=>v.id));nodes.forEach(b=>{const v=entries[+b.dataset.id-1];b.hidden=!matches(v);b.classList.toggle('dim',Boolean(e&&v.id!==e.id&&!ids.has(v.id)));b.classList.toggle('selected',v.id===e?.id);b.setAttribute('aria-pressed',String(v.id===current?.id))});$('#lines').innerHTML=linked.map(()=>'<line stroke="'+e.color+'" stroke-opacity=".24" stroke-width=".7"/>').join('');lineNodes=[...$('#lines').children]}
function showPreview(e,b){preview.innerHTML=`<div class="mini-meta"><span class="swatch" style="--color:${e.color}"></span>${dateLabel(e)} · ${e.time}</div><h2>${e.title}</h2><p>地点 / ${e.place}</p><p>对象 / ${e.object}</p><p>身体 / ${e.body}</p><p>感官 / ${e.senses.join(' · ')}</p><p>心情 / ${e.mood}</p><p class="hint">点击，停留在这段体验</p>`;preview.hidden=false;const rect=b.getBoundingClientRect(),pw=preview.offsetWidth,ph=preview.offsetHeight;preview.style.left=Math.max(12,Math.min(rect.right+16,innerWidth-pw-14))+'px';preview.style.top=Math.max(12,Math.min(rect.top-20,innerHeight-ph-14))+'px'}
function select(e){current=e;hover=null;preview.hidden=true;detail.hidden=false;detail.style.setProperty('--color',e.color);$('#detail-body').innerHTML=`<p class="mini-meta"><span class="swatch" style="--color:${e.color}"></span>ENCOUNTER ${String(e.id).padStart(2,'0')}</p><h2>${e.title}</h2><p class="mini-meta">${dateLabel(e)} · ${e.time}</p><blockquote class="quote">${e.quote}</blockquote><dl class="metadata"><dt>地点</dt><dd>${e.place}</dd><dt>接触对象</dt><dd>${e.object}</dd><dt>身体部位</dt><dd>${e.body}</dd><dt>感官</dt><dd>${e.senses.join(' · ')}</dd><dt>触感 / 感知</dt><dd>${e.texture}</dd><dt>心情</dt><dd>${e.mood}</dd></dl><p class="section-label">01 / 身体做了什么</p><p class="body-copy">${e.action}</p><p class="section-label">02 / 接触之后</p><p class="body-copy">${e.after||"尚未补充"}</p><p class="section-label">03 / 暂时的解释，而非结论</p><p class="body-copy">${e.reflection||"留待之后再回看这一刻。"}</p><p class="section-label">相同感官的相遇 · ${related(e).length}</p><p class="body-copy">连线表示共享感官标签，不表示因果。以下展示其中几条。</p><div class="connections">${related(e).slice(0,4).map(v=>`<button data-related="${v.id}"><span class="swatch" style="--color:${v.color}"></span>${v.title} ↗</button>`).join('')}</div>`;detail.scrollTop=0;detail.querySelectorAll('[data-related]').forEach(b=>b.onclick=()=>select(entries[+b.dataset.related-1]));highlight(e)}
function reset(){const id=current?.id;current=null;hover=null;detail.hidden=true;preview.hidden=true;highlight(null);return id}
$('#close').onclick=()=>{const id=reset();const b=document.querySelector(`[data-id="${id}"]`);if(b){b.focus();hover=null;preview.hidden=true;highlight(null)}};
universe.onclick=e=>{if(!e.target.closest('.star'))reset()};document.addEventListener('keydown',e=>{if(e.key==='Escape')reset()});
$('#about').onclick=()=>{$('#method').showModal();preview.hidden=true};$('#close-method').onclick=()=>$('#method').close();
$('#export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({status:'Atlas export: illustrative scenarios and user-submitted records; fictional flags identify source',entries},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='surface-atlas-export.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
addEventListener('resize',()=>{measure();positions.forEach(p=>{p.sx=undefined});highlight(current);preview.hidden=true});
const motionButton=$('#motion');function updateMotion(){motionButton.textContent=motion?'暂停漂浮 Ⅱ':'开启漂浮 ▷';motionButton.setAttribute('aria-pressed',String(motion))}motionButton.onclick=()=>{motion=!motion;px=0;py=0;updateMotion()};matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{motion=!e.matches;updateMotion()});updateMotion();draw();

let syncedSignature='';
function syncSaved(){const incoming=AtlasRecords.read();const signature=JSON.stringify(incoming);if(signature===syncedSignature)return;syncedSignature=signature;const prior=new Map(entries.filter(e=>e.sourceId).map(e=>[e.sourceId,positions[e.id-1]]));const base=entries.filter(e=>!e.sourceId);const basePositions=base.map(e=>positions[e.id-1]);entries.splice(0,entries.length,...base);positions.splice(0,positions.length,...basePositions);importedIds.clear();for(const r of incoming){entries.push(importRecord(r));if(prior.has(r.id)){positions.push(prior.get(r.id));continue}const z=rand()*2-1,angle=rand()*Math.PI*2,radius=Math.cbrt(rand()),ring=Math.sqrt(1-z*z);positions.push({x:radius*ring*Math.cos(angle),y:radius*ring*Math.sin(angle),z:radius*z,depth:.25+rand()*.75,phase:rand()*Math.PI*2})}reset();draw();requestAnimationFrame(openLinked)}
window.addEventListener('storage',e=>{if(e.key===AtlasRecords.key)syncSaved()});window.addEventListener('atlas-records-changed',syncSaved);window.addEventListener('focus',syncSaved);
function openLinked(){const m=location.hash.match(/^#record=(.+)$/);if(m){const e=entries.find(e=>e.sourceId===decodeURIComponent(m[1]));if(e)select(e)}}window.addEventListener('hashchange',openLinked);requestAnimationFrame(openLinked);
