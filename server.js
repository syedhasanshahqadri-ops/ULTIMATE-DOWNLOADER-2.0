const express=require('express'),cors=require('cors'),fs=require('fs'),{execFile}=require('child_process');
const app=express();app.use(cors());const path=require('path');
['index.html','style.css','app.js','config.js','manifest.json','service-worker.js','icon.svg','icon-192.png','icon-512.png'].forEach(f=>
  app.get(f==='index.html'?['/','/index.html']:'/'+f,(q,r)=>r.sendFile(path.join(__dirname,f))));.forEach(f=>
  app.get(f==='index.html'?['/','/index.html']:'/'+f,(q,r)=>r.sendFile(path.join(__dirname,f))));
const ok=u=>/^https?:\/\//i.test(u||'');
const NAMES={video:['mp4','video/mp4'],audio:['m4a','audio/mp4'],image:['jpg','image/jpeg']};

app.get('/api/info',(req,res)=>{
  const u=req.query.url;if(!ok(u))return res.status(400).json({error:'Paste a full link that starts with http'});
  execFile('yt-dlp',['-J','--no-playlist',u],{maxBuffer:1e8,timeout:60000},(e,o)=>{
    if(e)return res.status(422).json({error:'This link could not be read. It may be private or unsupported.'});
    const j=JSON.parse(o),f=j.formats||[];
    const heights=[...new Set(f.map(x=>x.height).filter(h=>h&&h<=1080))].sort((a,b)=>b-a);
    res.json({title:j.title,thumb:j.thumbnail,duration:j.duration,site:j.extractor_key,uploader:j.uploader,
      hasVideo:f.some(x=>x.vcodec&&x.vcodec!=='none'),heights});
  });
});

app.get('/api/download',(req,res)=>{
  const{url,type='video'}=req.query,h=Math.min(parseInt(req.query.q)||1080,1080);
  if(!ok(url)||!NAMES[type])return res.status(400).end();
  const[ext,mime]=NAMES[type];
  if(type==='image'){
    const send=async u=>{const r=await fetch(u);res.type(r.headers.get('content-type')||mime);
      res.setHeader('Content-Disposition','attachment; filename="photo.jpg"');res.send(Buffer.from(await r.arrayBuffer()))};
    if(/\.(jpe?g|png|webp|gif)(\?|$)/i.test(url))return send(url).catch(()=>res.status(502).end());
    return execFile('yt-dlp',['--get-thumbnail','--no-playlist',url],(e,o)=>e?res.status(422).end():send(o.trim().split('\n')[0]).catch(()=>res.status(502).end()));
  }
  const out=`/tmp/${Date.now()}${Math.random().toString(36).slice(2)}.${ext}`;
  const args=type==='audio'?['-f','bestaudio[ext=m4a]/bestaudio','-x','--audio-format','m4a']
    :['-f',`bv*[height<=${h}]+ba/b[height<=${h}]/b`,'--merge-output-format','mp4'];
  execFile('yt-dlp',[...args,'--no-playlist','-o',out,url],{timeout:600000},e=>{
    if(e||!fs.existsSync(out))return res.status(422).end();
    res.type(mime).download(out,'hasan-'+type+'.'+ext,()=>fs.unlink(out,()=>{}));
  });
});
app.listen(process.env.PORT||3000);
