const C={'ID Card':'🪪',Earphones:'🎧',Book:'📚',Wallet:'👛',Keys:'🔑',Bag:'🎒',Certificate:'📜',Other:'📦'};
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const L=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const me=L('cf_me')||(()=>{const u='u'+Math.random().toString(36).slice(2);localStorage.setItem('cf_me',JSON.stringify(u));return u})();
const H=h=>new Date(Date.now()-h*36e5).toISOString().slice(0,16);
const mk=(id,type,title,cat,loc,h,desc)=>({id,type,title,cat,loc,when:H(h),desc,owner:'demo',name:'Student',contact:'demo@campus.edu',status:'open',claims:[],at:Date.now()-h*36e5});
let items=L('cf_items')||[mk('d1','lost','Black leather wallet','Wallet','Library',5,'Black wallet with student ID inside'),
mk('d2','found','Wallet near library','Wallet','Library',3,'Found a black leather wallet on a bench'),
mk('d3','lost','Blue backpack','Bag','Canteen',20,'Blue Wildcraft bag with laptop sleeve'),
mk('d4','found','Bunch of keys','Keys','Block A',8,'Three keys with a red keychain'),
mk('d5','lost','White earbuds','Earphones','Gym',30,'White wireless earbuds in a small case')];
let pic='';
const save=()=>{try{localStorage.setItem('cf_items',JSON.stringify(items))}catch(e){toast('Storage full – delete old reports')}};
const toast=t=>{const e=$('#toast');e.textContent=t;e.className='show';clearTimeout(toast.t);toast.t=setTimeout(()=>e.className='',2600)};
const fmt=w=>new Date(w).toLocaleString([],{dateStyle:'medium',timeStyle:'short'});
const opts=Object.keys(C).map(c=>`<option>${c}</option>`).join('');
const words=i=>new Set(((i.title+' '+i.desc).toLowerCase().match(/[a-z0-9]{3,}/g)||[]));
const matches=i=>{const w=words(i);return items.filter(o=>o.type!=i.type&&o.status=='open'&&i.status=='open').map(o=>{let s=o.cat==i.cat?40:0;words(o).forEach(x=>w.has(x)&&(s+=12));if(o.loc.toLowerCase()==i.loc.toLowerCase())s+=20;return{o,s:Math.min(s,99)}}).filter(m=>m.s>=52).sort((a,b)=>b.s-a.s)};
const thumb=i=>i.img?`<img src="${i.img}" alt="">`:`<span>${C[i.cat]}</span>`;
const card=(i,n=0)=>`<article class="card" style="animation-delay:${n*60}ms" onclick="openItem('${i.id}')"><div class="ph">${thumb(i)}<em class="tag ${i.type}">${i.type=='lost'?'Lost':'Found'}</em>${i.status=='returned'?'<em class="tag done">✔ Returned</em>':''}</div><div class="cb"><h3>${esc(i.title)}</h3><p>📍 ${esc(i.loc)}</p><p>🕒 ${fmt(i.when)}</p><small>${C[i.cat]} ${i.cat}</small></div></article>`;

const V={
home(){const n=t=>items.filter(i=>i.type==t).length,r=items.filter(i=>i.status=='returned').length;
return `<section class="hero"><h1>Lost something on campus?<br><span>Let's find it together.</span></h1><p>Report lost or found items and get matched instantly.</p><div class="row"><button class="btn ghost" onclick="go('report')">Report an item</button><button class="btn" style="background:#ffffff33;box-shadow:none" onclick="go('browse')">Browse items</button></div></section>
<section class="stats">${[['📋',items.length,'Total reports'],['😟',n('lost'),'Lost'],['🙌',n('found'),'Found'],['✅',r,'Returned'],['📈',(items.length?Math.round(r/items.length*100):0)+'%','Recovery rate']].map(s=>`<div class="stat"><b>${s[0]}</b><h2>${s[1]}</h2><p>${s[2]}</p></div>`).join('')}</section>
<h2 class="sec">Recent reports</h2><div class="grid">${[...items].sort((a,b)=>b.at-a.at).slice(0,6).map(card).join('')}</div>`},
browse(){return `<h2 class="sec">Browse items</h2><div class="filters"><input id="q" placeholder="🔍 Search items, places..."><select id="ft"><option value="">Lost &amp; Found</option><option value="lost">Lost</option><option value="found">Found</option></select><select id="fc"><option value="">All categories</option>${opts}</select><select id="fs"><option value="open">Open</option><option value="returned">Returned</option><option value="">Any status</option></select></div><div class="grid" id="res"></div>`},
report(){return `<form class="form" id="f"><h2>Report an item</h2><div class="seg"><label><input type="radio" name="type" value="lost" checked><span>😟 I lost it</span></label><label><input type="radio" name="type" value="found"><span>🙌 I found it</span></label></div>
<input name="title" placeholder="Item name (e.g. Blue backpack)" required><select name="cat">${opts}</select><input name="loc" placeholder="Location (e.g. Main library, 2nd floor)" required><input type="datetime-local" name="when" required value="${H(0)}"><textarea name="desc" rows="3" placeholder="Description: colour, brand, marks..."></textarea>
<label class="up">📷 Upload photo<input type="file" id="ph" accept="image/*" hidden><img id="pv" hidden></label><input name="name" placeholder="Your name" required value="${esc((L('cf_prof')||{}).name)}"><input name="contact" placeholder="Phone or email" required value="${esc((L('cf_prof')||{}).contact)}"><button class="btn">Submit report</button></form>`},
mine(){const m=items.filter(i=>i.owner==me);return `<h2 class="sec">My reports</h2>`+(m.length?`<div class="grid">${m.map((i,n)=>`<div>${card(i,n)}<div class="mrow">${i.status=='returned'?'✅ Resolved':'⏳ Open'} · ${i.claims.length} response(s) · ${matches(i).length} possible match(es)</div></div>`).join('')}</div>`:`<p class="empty">No reports yet. Tap “+ Report” to add one.</p>`)}};

function openItem(id){const i=items.find(x=>x.id==id),mine=i.owner==me,m=matches(i),open=i.status=='open',p=L('cf_prof')||{};
let act='';
if(mine)act=`${i.claims.map(c=>`<div class="claim"><b>${esc(c.name)}</b> · ${esc(c.contact)}<br>${esc(c.msg)}</div>`).join('')||'<p class="empty" style="padding:6px">No responses yet.</p>'}${open?`<button class="btn grn" onclick="setS('${id}','returned')">✔ Mark as Returned</button>`:`<button class="btn ghost" onclick="setS('${id}','open')">Reopen</button>`}<button class="btn red" onclick="del('${id}')">Delete report</button>`;
else if(open)act=`<button class="btn" onclick="this.hidden=true;$('#cf').hidden=false">${i.type=='lost'?'🙌 I Found This':'🙋 This Might Be Mine'}</button><div id="cf" hidden style="display:grid;gap:8px"><input id="cn" placeholder="Your name" value="${esc(p.name)}"><input id="cc" placeholder="Phone or email" value="${esc(p.contact)}"><textarea id="cm" rows="2" placeholder="Details to prove it (marks, where, when...)"></textarea><button class="btn" onclick="claim('${id}')">Send to owner</button></div>`;
$('#modal').hidden=false;
$('#modal').innerHTML=`<div class="box"><button class="x" onclick="closeM()">✕</button><div class="ph big">${thumb(i)}</div><h2>${esc(i.title)}</h2><p><em class="tag s ${i.type}">${i.type=='lost'?'Lost':'Found'}</em> <em class="tag s ${open?'open':'done'}">${open?'Open':'✔ Returned'}</em></p><p>${esc(i.desc)||'No description'}</p><ul><li>📍 ${esc(i.loc)}</li><li>🕒 ${fmt(i.when)}</li><li>${C[i.cat]} ${i.cat}</li><li>👤 Reported by ${esc(i.name)}</li></ul>${act}${m.length?`<h3>🎯 Possible matches</h3>${m.map(x=>`<div class="mini" onclick="openItem('${x.o.id}')"><span>${C[x.o.cat]} ${esc(x.o.title)}</span><b>${x.s}%</b></div>`).join('')}`:''}</div>`}
function closeM(){$('#modal').hidden=true}
function claim(id){const n=$('#cn').value.trim(),c=$('#cc').value.trim();if(!n||!c)return toast('Please add your name and contact');
items.find(x=>x.id==id).claims.push({name:n,contact:c,msg:$('#cm').value,at:Date.now()});localStorage.setItem('cf_prof',JSON.stringify({name:n,contact:c}));save();closeM();toast('Sent! The owner will contact you.')}
function setS(id,s){items.find(x=>x.id==id).status=s;save();closeM();render();toast(s=='returned'?'🎉 Marked as returned!':'Reopened')}
function del(id){if(!confirm('Delete this report?'))return;items=items.filter(x=>x.id!=id);save();closeM();render()}
function go(v){location.hash=v}
function fil(){const q=$('#q').value.toLowerCase(),t=$('#ft').value,c=$('#fc').value,s=$('#fs').value;
const r=items.filter(i=>(!t||i.type==t)&&(!c||i.cat==c)&&(!s||i.status==s)&&(i.title+i.desc+i.loc+i.cat).toLowerCase().includes(q)).sort((a,b)=>b.at-a.at);
$('#res').innerHTML=r.map(card).join('')||'<p class="empty">No items found.</p>'}
function render(){const v=location.hash.slice(1),k=V[v]?v:'home';$('#app').innerHTML=V[k]();
document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.go==k));window.scrollTo(0,0);
if(k=='browse'){['q','ft','fc','fs'].forEach(x=>$('#'+x).oninput=fil);fil()}
if(k=='report'){pic='';$('#ph').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,600/im.width),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);pic=c.toDataURL('image/jpeg',.7);$('#pv').src=pic;$('#pv').hidden=false};im.src=r.result};r.readAsDataURL(f)};
$('#f').onsubmit=e=>{e.preventDefault();const f=Object.fromEntries(new FormData(e.target));items.unshift({...f,id:'i'+Date.now(),img:pic,owner:me,status:'open',claims:[],at:Date.now()});
localStorage.setItem('cf_prof',JSON.stringify({name:f.name,contact:f.contact}));save();const m=matches(items[0]).length;go('mine');toast(m?`🎯 ${m} possible match(es) found!`:'Report posted!')}}}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)go(g.dataset.go);if(e.target.id=='modal')closeM()});
window.addEventListener('hashchange',render);render();
