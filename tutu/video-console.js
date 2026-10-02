(()=>{'use strict';
const status=document.getElementById('video-status'),input=document.getElementById('video-file');
const ids=['video-rate','video-blur','video-brightness'];function update(){const s={rate:Number(document.getElementById(ids[0]).value),blur:Number(document.getElementById(ids[1]).value),brightness:Number(document.getElementById(ids[2]).value)};try{BackgroundStore.configure(s)}catch{status.textContent='无法保存设置，请允许此网站使用本地存储。'}document.getElementById('video-values').textContent=`${s.rate}× 播放 · 模糊 ${s.blur} · 亮度 ${Math.round(s.brightness*100)}%`}
const s=BackgroundStore.settings();ids.forEach((id,i)=>{document.getElementById(id).value=[s.rate,s.blur,s.brightness][i];document.getElementById(id).oninput=update});update();
input.onchange=async()=>{const file=input.files[0];if(!file)return;if(file.size>350*1024*1024){status.textContent='请先使用小于 350 MB 的片段；大型素材交给我压缩后再加载。';return}if(!file.type.startsWith('video/')){status.textContent='请选择浏览器可播放的 MP4 或 WebM。';return}status.textContent='正在保存本地视频…';try{await BackgroundStore.save(file);status.textContent='已加载 '+file.name+'；星图会自动读取（视频不上传）。'}catch(error){status.textContent='保存失败：'+error.message}};
addEventListener('background-status',e=>{status.textContent=e.detail});BackgroundStore.read().then(r=>{status.textContent=r?'已保存视频：'+r.name+'；播放状态由星图页面报告。':'默认背景：'+BackgroundStore.bundled.name+'（4 倍速剪辑）'}).catch(()=>{status.textContent='本地视频存储不可用。'});
})();

