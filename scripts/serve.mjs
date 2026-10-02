import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mp4':'video/mp4'};
http.createServer((req,res)=>{
 let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return}
 if(name==='/'){res.writeHead(302,{Location:'/tutu/map.html'}).end();return}if(name.endsWith('/'))name+='index.html';
 const file=path.resolve(root,'.'+name),relative=path.relative(root,file),ext=path.extname(file);
 if(relative.startsWith('..')||path.isAbsolute(relative)||relative.startsWith('scripts')||!types[ext]||(ext==='.mp4'&&relative.replaceAll('\\','/')!=='tutu/media/day-background.mp4')){res.writeHead(404).end();return}
 fs.stat(file,(error,stat)=>{if(error||!stat.isFile()){res.writeHead(404).end();return}
 const headers={'Content-Type':types[ext],'Cache-Control':'no-store','Accept-Ranges':'bytes'};let start=0,end=stat.size-1,code=200;
 if(req.headers.range){const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);if(!match||(!match[1]&&!match[2])){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return}
 if(!match[1])start=Math.max(0,stat.size-Number(match[2]));else{start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]))}
 if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return}code=206;headers['Content-Range']=`bytes ${start}-${end}/${stat.size}`;}
 headers['Content-Length']=end-start+1;res.writeHead(code,headers);if(req.method==='HEAD'){res.end();return}const stream=fs.createReadStream(file,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 });
}).listen(4174,'127.0.0.1',()=>console.log('Atlas: http://127.0.0.1:4174/tutu/map%20v3.html'));
