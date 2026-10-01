(()=>{'use strict';const status=document.getElementById('link-state'),field=document.getElementById('phone-url'),anchor=document.getElementById('phone-link'),note=document.getElementById('pair-note');let lastPhone=0;
document.querySelector('header .link').href=TouchLink.url('map v3.html');document.querySelector('iframe').src=TouchLink.url('map v3.html');
try{field.value=localStorage.getItem('tutu-phone-url')||TouchLink.url('touchscreen.html')}catch{field.value=TouchLink.url('touchscreen.html')}
function urlChanged(){try{const u=new URL(field.value);if(!['http:','https:'].includes(u.protocol))throw Error();u.hash='room='+TouchLink.room;anchor.href=u.href;try{localStorage.setItem('tutu-phone-url',u.href)}catch{}note.textContent=['localhost','127.0.0.1'].includes(u.hostname)?'手机不能访问 localhost。请把地址中的 127.0.0.1 换成电脑的局域网 IP，并确保手机可访问这个网站；或使用已发布的网址。':'在手机打开此链接，房间标记已自动添加。';}catch{anchor.removeAttribute('href');note.textContent='请输入有效的 http 或 https 页面地址。'}}
field.oninput=urlChanged;urlChanged();
TouchLink.on(m=>{if(m.kind==='presence'&&m.role==='phone'){lastPhone=performance.now()}});
setInterval(()=>{const phone=performance.now()-lastPhone<2500;status.textContent=(TouchLink.state==='connected'?'跨设备连接已就绪':TouchLink.state==='error'?'云端连接失败，仅同浏览器可同步':'正在连接云端…')+(phone?' · 手机已接入'+' · 滑动时手机会显示微光轨迹':' · 等待手机');},500);
})();

