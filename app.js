const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const PLAT=[['youtube','YouTube','Video 1080p, music','FF0000'],['tiktok','TikTok','Video, music','25F4EE'],['facebook','Facebook','Video, photos','1877F2'],['instagram','Instagram','Reels, photos','E4405F'],['x','X','Video, photos','888888'],['pinterest','Pinterest','Video, photos','E60023'],['reddit','Reddit','Video, images','FF4500'],['vimeo','Vimeo','Video 1080p','1AB7EA'],['twitch','Twitch','Clips, video','9146FF'],['dailymotion','Dailymotion','Video','0066DC'],['soundcloud','SoundCloud','Music','FF5500'],['snapchat','Snapchat','Spotlight video','FFFC00'],['linkedin','LinkedIn','Video, photos','0A66C2'],['bilibili','Bilibili','Video 1080p','00A1D6']];
$('#plat').innerHTML=PLAT.map(p=>`<div class="pl" style="--k:#${p[3]}"><img src="https://cdn.simpleicons.org/${p[0]}/ffffff" alt="${p[1]} logo"><b>${p[1]}</b><small>${p[2]}</small></div>`).join('');
// theme
const root=document.documentElement;root.dataset.theme=localStorage.theme||(matchMedia('(prefers-color-scheme:light)').matches?'light':'dark');
$('#theme').onclick=()=>{root.dataset.theme=localStorage.theme=root.dataset.theme==='dark'?'light':'dark'};
// views
function show(v){$$('.view').forEach(x=>x.hidden=x.id!=='v-'+v);$$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.view===v));if(v==='library')lib()}
$$('nav button').forEach(b=>b.onclick=()=>show(b.dataset.view));
// storage
const DB=new Promise(r=>{const o=indexedDB.open('hasan-dl',1);o.onupgradeneeded=()=>o.result.createObjectStore('f',{keyPath:'id'});o.onsuccess=()=>r(o.result)});
const tx=async(m,f)=>{const d=await DB;return new Promise(r=>{const t=d.transaction('f',m),q=f(t.objectStore('f'));t.oncomplete=()=>r(q&&q.result)})};
// fetch info
let info,link,type='video',qual=1080;
$('#f').onsubmit=async e=>{e.preventDefault();link=$('#url').value.trim();const er=$('#err');er.hidden=true;$('#prev').hidden=true;if(!link)return;
 const b=$('.go');b.textContent='Reading...';
 try{const r=await fetch('/api/info?url='+encodeURIComponent(link));const j=await r.json();if(!r.ok)throw j.error;info=j;
  $('#pi').src=j.thumb||'';$('#pt').textContent=j.title;$('#pm').textContent=[j.site,j.uploader,j.duration&&Math.round(j.duration/60*10)/10+' min'].filter(Boolean).join(' - ');$('#prev').hidden=false}
 catch(x){er.textContent=x||'Server is not reachable. Try again in a moment.';er.hidden=false}b.textContent='Fetch'};
$('#url').addEventListener('paste',()=>setTimeout(()=>$('#f').requestSubmit(),50));
// dialog
function chips(){const hs=(info.heights.length?info.heights:[1080,720,480,360]).filter(h=>h<=1080),c=$('#qs');
 c.hidden=type==='image';c.innerHTML=type==='audio'?'<button class="on">Best audio</button>':hs.map((h,i)=>`<button data-q="${h}" class="${i?'':'on'}">${h}p</button>`).join('');qual=hs[0];
 $$('#qs button[data-q]').forEach(b=>b.onclick=()=>{$$('#qs button').forEach(x=>x.classList.remove('on'));b.classList.add('on');qual=+b.dataset.q})}
$('#dl').onclick=()=>{type=info.hasVideo?'video':'audio';$$('#tp button').forEach(b=>b.classList.toggle('on',b.dataset.t===type));chips();$('#dlg').showModal()};
$$('#tp button').forEach(b=>b.onclick=()=>{type=b.dataset.t;$$('#tp button').forEach(x=>x.classList.toggle('on',x===b));chips()});
$('#cx').onclick=()=>$('#dlg').close();$('#ok').onclick=()=>{$('#dlg').close();start()};
// download with progress
const active=new Map(),EXT={video:'mp4',audio:'m4a',image:'jpg'};
function save(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click()}
async function start(){const id=Date.now()+'',it={id,title:info.title,thumb:info.thumb,type,site:info.site,q:qual,pct:0,state:'Preparing on server'};active.set(id,it);show('library');
 try{const r=await fetch('/api/download?'+new URLSearchParams({url:link,type,q:qual}));if(!r.ok)throw 0;
  const len=+r.headers.get('content-length')||0,rd=r.body.getReader(),ch=[];let got=0;it.state='Downloading';
  for(;;){const{done,value}=await rd.read();if(done)break;ch.push(value);got+=value.length;it.pct=len?Math.round(got/len*100):0;paint()}
  const blob=new Blob(ch,{type:r.headers.get('content-type')}),name=(info.title||'download').replace(/[^\w ]+/g,'').slice(0,60)+'.'+EXT[type];
  await tx('readwrite',s=>s.put({id,title:info.title,thumb:info.thumb,type,site:info.site,q:qual,date:Date.now(),name,blob}));
  active.delete(id);save(blob,name);lib()}
 catch{it.state='Failed. Check the link and try again.';it.pct=0;paint()}}
function paint(){$('#active').innerHTML=[...active.values()].map(i=>`<div class="it"><div class="b"><h4>${esc(i.title)}</h4><p class="m">${i.state}${i.state==='Downloading'?' - '+i.pct+'%':''}</p><div class="bar"><i style="--p:${i.state==='Downloading'?i.pct:i.state==='Failed. Check the link and try again.'?0:8}%"></i></div></div></div>`).join('')}
const esc=s=>String(s||'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
async function lib(){paint();const all=await tx('readonly',s=>s.getAll())||[];all.sort((a,b)=>b.date-a.date);
 $('#empty').hidden=all.length||active.size;
 $('#saved').innerHTML=all.map(f=>{const u=URL.createObjectURL(f.blob);const m=f.type==='video'?`<video src="${u}" controls playsinline poster="${esc(f.thumb)}"></video>`:f.type==='audio'?`<img src="${esc(f.thumb)}" alt=""><audio src="${u}" controls></audio>`:`<img src="${u}" alt="">`;
  return `<div class="it">${m}<div class="b"><h4>${esc(f.title)}</h4><p class="m">${esc(f.site)} - ${f.type}${f.type==='video'?' '+f.q+'p':''} - 100%</p><div class="bar"><i style="--p:100%"></i></div><div class="act" style="margin-top:12px"><button data-s="${f.id}"><i class="ic i-save"></i> Save to gallery</button><button data-d="${f.id}" aria-label="Delete"><i class="ic i-del"></i></button></div></div></div>`}).join('');
 $$('[data-s]').forEach(b=>b.onclick=async()=>{const f=all.find(x=>x.id===b.dataset.s),file=new File([f.blob],f.name,{type:f.blob.type});
  if(navigator.canShare&&navigator.canShare({files:[file]}))try{await navigator.share({files:[file]});return}catch{}save(f.blob,f.name)});
 $$('[data-d]').forEach(b=>b.onclick=async()=>{await tx('readwrite',s=>s.delete(b.dataset.d));lib()})}
// google sign-in
const cid=(window.APP_CONFIG||{}).GOOGLE_CLIENT_ID,who=()=>JSON.parse(localStorage.user||'null');
function acct(){const u=who();if(u){$('#who').innerHTML=`<div style="display:flex;gap:14px;align-items:center"><img src="${esc(u.picture)}" alt="" style="width:56px;border-radius:50%"><div><b>${esc(u.name)}</b><p class="sub" style="margin:0">${esc(u.email)}</p></div></div><button class="ghost" id="out" style="margin-top:16px">Sign out</button>`;$('#out').onclick=()=>{localStorage.removeItem('user');location.reload()};return}
 if(!cid){$('#gnote').hidden=false;return}
 const s=document.createElement('script');s.src='https://accounts.google.com/gsi/client';s.onload=()=>{google.accounts.id.initialize({client_id:cid,callback:r=>{const p=JSON.parse(atob(r.credential.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));localStorage.user=JSON.stringify({name:p.name,email:p.email,picture:p.picture});acct()}});google.accounts.id.renderButton($('#gbtn'),{theme:'filled_blue',shape:'pill',size:'large'})};document.head.appendChild(s)}
acct();
