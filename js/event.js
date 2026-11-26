// Event skin terbatas (pertama: Big Bang). Banner geser di menu, layar event (spin token bintang, animasi meteor), Toko Event (beli/tukar token, tukar kristal jadi skin).
// Data: users/{uid}.tok = token bintang; users/{uid}.ev = {id, kr: kristal, p: spin sejak skin terakhir}. Kristal hangus saat event selesai; sisa token jadi koin (1 token = 50 koin) bila tidak ada event aktif.
// Ganti event: ubah EV (id baru, skin Kolektor, nama, tanggal mulai). Jam memakai jam perangkat (shortcut: bisa diakali, pindah ke waktu server bila perlu).
(()=>{
// TEMA EVENT: id baru tiap event (mereset kristal), k = skin Kolektor event, nm = nama, mulai (ISO +08:00), hari = durasi,
// bg = 5 warna latar dari pusat ke tepi (terang -> gelap), sinar = warna sinar/partikel panggung (biasanya palet skin Kolektor).
const EV={id:"bigbang1",k:"K02",nm:"BIG BANG",mulai:"2026-11-25T15:00:00+08:00",hari:5,
 bg:["#ff5a1e","#b23cff","#5a4bff","#14103f","#07051c"],sinar:["#ff4f4f","#ffd24a","#4fff9b","#4fd2ff","#a56bff","#ff7ad9"]};
const T0=Date.parse(EV.mulai),T1=T0+EV.hari*864e5,aktif=()=>{const n=Date.now();return n>=T0&&n<T1};
// Angka keputusan Boss 22 Nov 2026 (claude/event-token.md).
const PEL=[["F",95.75],["S",3],["E",1],["L",.2],["K",.05]],DUP={S:10,E:30,L:90,K:180},HRG={S:60,E:180,L:450,K:900},DROP=5,SISA=50;
const ORD="FSELK",RB=["#ff4f4f","#ffd24a","#4fff9b","#4fd2ff","#a56bff","#ff7ad9"];
const CL={F:["#9fb4ff","#ffffff"],S:["#4fff9b","#b8ffd6","#1fd17a"],E:["#b07cff","#e2c9ff","#7a3dff"],L:["#ffd24a","#fff3b0","#ff8a1e"],K:RB};
const BRD={F:"#9fb4ff",S:"#4fff9b",E:"#b07cff",L:"#ffd24a",K:"#ff7ad9"},NMT={F:"Kristal",S:"Spesial",E:"Epik",L:"Legenda",K:"Kolektor"};
const SPL={E:["#e01ee0","#ff7aff"],L:["#ffb31a","#ffe07a"],K:RB};
let NID=0;const KR0='<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="evkr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffd6ff"/><stop offset=".45" stop-color="#b06bff"/><stop offset="1" stop-color="#2f6bff"/></linearGradient></defs><polygon points="10,24 22,8 44,6 56,22 46,38 30,58 16,42" fill="url(#evkr)" stroke="#1b1450" stroke-width="2.5" stroke-linejoin="round"/><polyline points="10,24 30,26 56,22" fill="none" stroke="#fff" stroke-width="1.5" opacity=".7"/><polyline points="22,8 30,26 44,6" fill="none" stroke="#fff" stroke-width="1.5" opacity=".5"/><polygon points="22,8 30,26 10,24" fill="#fff" opacity=".35"/><polygon points="46,38 30,58 30,26 56,22" fill="#2f6bff" opacity=".35"/><polygon points="48,10 50,14 54,15 50,17 48,21 46,17 42,15 46,14" fill="#fff"/></svg>';
const TK0='<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="evtk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3b0"/><stop offset="1" stop-color="#b8650a"/></linearGradient></defs><circle cx="32" cy="32" r="28" fill="url(#evtk)" stroke="#6a3a00" stroke-width="2.5"/><polygon points="32,10 38,25 54,26 42,36 46,52 32,43 18,52 22,36 10,26 26,25" fill="#ffd24a" stroke="#6a3a00" stroke-width="2.2" stroke-linejoin="round"/></svg>';
// id gradien unik per salinan: gradien di dalam elemen tersembunyi tidak bisa dipakai salinan lain.
const uniq=x=>{const n=++NID;return x.replace(/id="(ev\w+)"/,'id="$1'+n+'"').replace(/url\(#(ev\w+)\)/,'url(#$1'+n+')')};
const KR=()=>uniq(KR0),TK=()=>uniq(TK0);
const isG=()=>!!auth&&!!auth.currentUser&&!auth.currentUser.isAnonymous;
const pk=a=>a[Math.random()*a.length|0];
let U={},busy=false;

// ---------- data ----------
function roll(p){let t;
 if(p>=9){const w=PEL.slice(1),s=w.reduce((a,x)=>a+x[1],0);let r=Math.random()*s;t=w.find(x=>(r-=x[1])<0)?.[0]||"S"}
 else{let r=Math.random()*100;t=(PEL.find(x=>(r-=x[1])<0)||PEL[0])[0]}
 return t}
// Satu tulisan per aksi: token dipotong, hadiah, kristal, pity sekaligus.
function hasil(n,own,ev){const R=[];
 for(let i=0;i<n;i++){const t=roll(ev.p);
  if(t==="F"){ev.kr+=DROP;ev.p++;R.push({t,k:null,dup:false});continue}
  ev.p=0;const k=t==="K"?EV.k:pk(SKA.list.filter(d=>d.t===t)).k,dup=!!own[k];
  if(dup)ev.kr+=DUP[t];else own[k]=true;R.push({t,k,dup})}
 return R}
async function muat(){
 U={koin:0,biru:0,merah:0,tok:0,skins:{},ev:{id:EV.id,kr:0,p:0}};
 if(!isG())return false;
 const v=await db.get("users/"+uid);if(v)Object.assign(U,v);
 U.skins=SKA.migrate(U.skins||{});if(!U.ev||U.ev.id!==EV.id)U.ev={id:EV.id,kr:0,p:0};
 return true}
async function simpan(nu){try{await db.doc("users/"+uid).set(nu);U=nu;return true}catch(e){pesan("Gagal menyimpan: "+(e.code||e.message),1);return false}}
// Akhir event: kristal hangus, sisa token jadi koin. Dicek sekali setelah login Google.
let cek="";
setInterval(async()=>{if(!isG()||cek===uid)return;cek=uid;
 try{const v=(await db.get("users/"+uid))||{},nu=Object.assign({},v);let ch=false;
  if(!aktif()&&(v.tok||0)>0){nu.koin=Math.min(999999,(v.koin||0)+v.tok*SISA);nu.tok=0;ch=true}
  if(v.ev&&v.ev.kr&&(v.ev.id!==EV.id||Date.now()>=T1)){nu.ev={id:EV.id,kr:0,p:0};ch=true}
  if(ch)await db.doc("users/"+uid).set(nu)}catch(e){cek=""}},5000);

// ---------- tampilan ----------
const css=`
#evs,#evt{position:fixed;inset:0;z-index:60;color:#fff;font-family:system-ui,sans-serif;overflow:hidden;background:var(--e4)}
#evs canvas{position:absolute;inset:0;width:100%;height:100%}
.evtop{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:8px;padding:12px;padding-top:max(12px,env(safe-area-inset-top));z-index:2}
.evib{width:40px;height:40px;flex:none;border-radius:50%;border:2px solid #ffd24a;background:rgba(10,6,40,.8);color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;padding:0;cursor:pointer}
.evch{display:flex;align-items:center;gap:5px;height:32px;padding:0 10px;border-radius:999px;background:rgba(10,6,40,.85);font-size:14px;font-weight:700;white-space:nowrap}
.evch svg,.evpr svg{width:18px;height:18px}
.evsub{pointer-events:none;position:absolute;left:0;right:0;top:64px;text-align:center;font-size:12px;color:#ffe9a8;z-index:2}
.evbot{position:absolute;left:0;right:0;bottom:22px;bottom:max(22px,env(safe-area-inset-bottom));display:flex;flex-direction:column;align-items:center;gap:8px;z-index:2}
.evsb{width:124px;height:72px;border-radius:14px;border:3px solid #ffd24a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:0;font:inherit;cursor:pointer}
.evsb b{font-size:18px}.evsb span{font-size:12px;display:flex;align-items:center;gap:3px}.evsb svg{width:14px;height:14px}
.evmsg{font-size:12px;min-height:16px;text-align:center;color:#bfffd6}
#evskip{position:absolute;right:12px;top:12px;top:max(12px,env(safe-area-inset-top));z-index:4;background:rgba(10,6,40,.85);color:#fff;border:2px solid #ffd24a;border-radius:999px;padding:7px 14px;font:inherit;font-size:13px;cursor:pointer}
#evs[hidden],#evt[hidden],#evres[hidden],#evskip[hidden]{display:none}
#evres{position:absolute;inset:0;z-index:3;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:16px}
.evcard{position:relative;border-radius:12px;background:#14142e;border:4px solid #fff;display:flex;align-items:center;justify-content:center;transform:rotateY(90deg) scale(.4);opacity:0;transition:transform .45s cubic-bezier(.2,1.6,.4,1),opacity .25s}
.evcard.on{transform:none;opacity:1}
.evcard .ska{width:100%;height:100%}
.evcard span svg{display:block;width:100%;height:auto}
.evcard img.evl{position:absolute;left:50%;bottom:-14px;transform:translateX(-50%);width:62%}
.evgrid{display:grid;grid-template-columns:repeat(5,64px);gap:16px 8px}
.evok{background:#ffd24a;color:#1a0d00;border:0;border-radius:12px;padding:10px 34px;font:inherit;font-size:15px;font-weight:700;cursor:pointer}
#evt{background:radial-gradient(circle at 50% 0%,var(--e0) 0,var(--e1) 22%,var(--e2) 46%,var(--e3) 78%,var(--e4) 100%);overflow-y:auto;padding:12px;padding-top:max(12px,env(safe-area-inset-top))}
.evrow{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0}
.evsec{font-size:12px;color:#ffe9a8;margin:10px 0 6px}
.evtx{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.evtk{border-radius:14px;background:rgba(10,6,40,.85);border:2px solid #ffd24a;padding:8px 4px;display:flex;flex-direction:column;align-items:center;gap:3px;color:#fff;font:inherit;cursor:pointer}
.evtk b{display:flex;align-items:center;gap:4px;font-size:13px}.evtk svg{width:15px;height:15px}.evtk span{font-size:11px;color:#ffe9a8}
.evmini{display:inline-block;width:11px;height:15px;border-radius:3px}
.evsk{display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:12px}
.evti{border-radius:14px;background:rgba(10,6,40,.85);border:2.5px solid var(--c);padding:8px 4px 7px;display:flex;flex-direction:column;align-items:center;gap:4px;color:#fff;font:inherit;cursor:pointer}
.evti.own{opacity:.5}.evti.gk{animation:evgk 2.2s ease-in-out infinite}
@keyframes evgk{50%{box-shadow:0 0 18px 4px var(--c)}}
.evti .evim{position:relative;width:84px;height:112px;margin-bottom:12px}.evti .ska{width:100%;height:100%}
.evti img.evl{position:absolute;left:50%;bottom:-15px;transform:translateX(-50%);width:58px}
.evpr{font-size:12px;color:#bfe8ff;display:flex;align-items:center;gap:3px}
.evmh{display:block!important;position:relative;overflow:hidden;padding:0}
.evtrack{display:flex;height:100%;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none}
.evtrack::-webkit-scrollbar{display:none}
.evtrack>*{flex:0 0 100%;height:100%;scroll-snap-align:center;display:flex;align-items:center;justify-content:center}
.evban{position:relative;border:0;padding:0;cursor:pointer;color:#fff;font:inherit;background:conic-gradient(from 0deg at 50% 42%,rgba(255,255,255,.18),rgba(255,255,255,0) 8%,rgba(255,200,255,.16) 16%,rgba(255,255,255,0) 24%,rgba(255,255,255,.18) 33%,rgba(255,255,255,0) 41%,rgba(255,200,255,.16) 50%,rgba(255,255,255,0) 58%),radial-gradient(circle at 50% 42%,#fff6c0 0 3%,var(--e0) 9%,var(--e1) 22%,var(--e2) 42%,var(--e3) 72%)}
.evban i{position:absolute;left:10px;top:10px;background:#e8b923;color:#201600;font:800 10px system-ui;letter-spacing:1px;padding:4px 8px;border-radius:999px;font-style:normal}
.evban u{position:absolute;right:10px;top:10px;background:rgba(10,5,30,.75);font-size:11px;padding:4px 8px;border-radius:999px;text-decoration:none}
.evban b{position:absolute;left:12px;bottom:10px;font-size:24px;letter-spacing:1px}
.evdots{position:absolute;left:0;right:0;bottom:6px;display:flex;justify-content:center;gap:6px;pointer-events:none}
.evdots s{width:7px;height:7px;border-radius:9px;background:rgba(255,255,255,.35);text-decoration:none}.evdots s.on{width:18px;background:#e8b923}
@media (orientation:landscape) and (max-height:520px){
 .evsub{top:20px;left:auto;right:auto;width:100%}
 .evbot{left:auto;right:16px;align-items:flex-end}
 #evt .evsk{display:flex;overflow-x:auto}#evt .evti{flex:0 0 112px}
}
@media (prefers-reduced-motion:reduce){.evti.gk{animation:none}}`;
const sty=document.createElement("style");sty.textContent=css;document.head.appendChild(sty);
EV.bg.forEach((c,i)=>document.documentElement.style.setProperty("--e"+i,c));
const sisa=()=>{const s=Math.max(0,T1-Date.now())/1e3;return Math.floor(s/86400)+"h "+Math.floor(s%86400/3600)+"j"};
const svgImg=s=>"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s.replace("<svg ",'<svg xmlns="http://www.w3.org/2000/svg" '));
const cardHTML=(r,w)=>`<div class="evcard" style="width:${w}px;height:${w*1.4|0}px;border-color:${BRD[r.t]}">${r.k?SKA.svg(r.k)+SKA.tag(r.t,"evl"):`<span style="display:block;width:60%">${KR()}</span>`}</div>`;

const evs=document.createElement("div");evs.id="evs";evs.hidden=true;
evs.innerHTML=`<canvas></canvas>
<div class="evtop" id="evtop"><button class="evib" id="evx" aria-label="Keluar">‹</button><button class="evib" id="evtoko" aria-label="Toko event">🛍</button><span style="flex:1"></span>
<span class="evch" style="border:2px solid #7fd6ff">${KR()}<span id="evkr">0</span></span><span class="evch" style="border:2px solid #ffd24a">${TK()}<span id="evtok">0</span></span>
<button class="evib" id="evinfo" aria-label="Info hadiah">🎁</button></div>
<div class="evsub" id="evsub"></div>
<div class="evbot" id="evbot"><div class="evmsg" id="evm"></div><div style="font-size:12px;color:#d8d2ff">Tiap 10 spin dijamin 1 skin Spesial atau lebih</div>
<div style="display:flex;gap:40px"><button class="evsb" id="ev1" style="background:rgba(20,16,63,.92);color:#fff"><b>Spin 1x</b><span>${TK()}1</span></button>
<button class="evsb" id="ev10" style="background:#ffb52e;color:#1a0d00"><b>Spin 10x</b><span>${TK()}9</span></button></div></div>
<button id="evskip" hidden>Lewati ⏭</button><div id="evres" hidden></div>`;
document.body.appendChild(evs);
const evt=document.createElement("div");evt.id="evt";evt.hidden=true;document.body.appendChild(evt);
const $e=s=>evs.querySelector(s);
function pesan(t,bad){for(const m of [$e("#evm"),evt.querySelector(".evmsg")])if(m){m.textContent=t||"";m.style.color=bad?"#ffb3b3":"#bfffd6"}}
function angka(){$e("#evkr").textContent=U.ev.kr;$e("#evtok").textContent=U.tok||0;$e("#evsub").innerHTML=`<b style="color:#fff;letter-spacing:1px">${EV.nm}</b> · sisa ${sisa()}`}

// ---------- canvas: panggung (kartu tersedot lubang cacing) + animasi spin ----------
const cv=$e("canvas"),g=cv.getContext("2d");let W=0,H=0,CX=0,CY=0,S=1,raf=0;
const img=new Image();img.src=svgImg(SKA.svg(EV.k));
function ukur(){const d=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;g.setTransform(d,0,0,d,0,0);
 const ls=W>H;CX=ls?W*.45:W/2;CY=ls?H*.55:H*.45;S=Math.min(W,H)/(ls?420:340)}
addEventListener("resize",()=>{if(!evs.hidden)ukur()});
const stars=Array.from({length:120},()=>({x:Math.random(),y:Math.random(),r:Math.random()*1.4+.3,p:Math.random()*6}));
let P=[],R=[],A=[],GH=[],run=null,flash=0,shake=0,dk=0,rays=null,spiral=0,last=0;
const add=(x,y,vx,vy,c,r,life,o)=>P.push(Object.assign({x,y,vx,vy,c,r,life,max:life,gr:.05,dr:.985,tr:false},o||{}));
function burstAt(x,y,n,sp,cols,o){for(let i=0;i<n;i++){const a=Math.random()*7,v=sp*S*(.4+Math.random()*.6);add(x,y,Math.cos(a)*v,Math.sin(a)*v,pk(cols),(1.5+Math.random()*2.2)*S,1+Math.random()*.9,o)}}
const burst=(n,sp,c,o)=>burstAt(CX,CY,n,sp,c,o),ring=(c,sp,w,x,y)=>R.push({x:x??CX,y:y??CY,r:4,sp:sp*S,c,w,a:1});
function bolt(c){const p=[[CX,CY]];let x=CX,y=CY,a=Math.random()*7;for(let i=0;i<9;i++){a+=(Math.random()-.5)*1.2;x+=Math.cos(a)*24*S;y+=Math.sin(a)*24*S;p.push([x,y])}A.push({p,c,life:.4})}
function rain(n,c,life){for(let i=0;i<n;i++){const a=Math.random()*7,v=4.5*S*Math.random();add(CX,CY,Math.cos(a)*v,Math.sin(a)*v-1,pk(c),1.7*S,life,{gr:.022,dr:.99,tr:true})}}
const tm=[],later=(f,ms)=>tm.push(setTimeout(f,ms));
function ledak(t){const c=CL[t];bunyi("evledak",ORD.indexOf(t));flash={F:.3,S:.55,E:.75,L:1,K:1}[t];shake={F:2,S:4,E:7,L:11,K:16}[t];
 if(t==="F"){burst(50,3.2,c);for(let i=0;i<8;i++)add(CX,CY,(Math.random()-.5)*2.4,-1.5-Math.random(),"#ffe14f",3*S,1.6)}
 if(t==="S"){burst(160,6.5,c);ring("#4fff9b",5,4);later(()=>burst(70,3.5,["#fff","#b8ffd6"]),220);later(()=>rain(60,["#4fff9b","#b8ffd6"],1.6),350)}
 if(t==="E"){burst(190,7.5,c);ring("#b07cff",6,5);later(()=>{ring("#e2c9ff",8,3);burst(100,5,c)},200);for(let i=0;i<10;i++)later(()=>bolt(pk(["#fff","#d9b8ff","#b07cff"])),i*70);later(()=>rain(80,c,1.8),400)}
 if(t==="L"){burst(260,9,c,{dr:.975});ring("#fff3b0",7,7);ring("#ffd24a",5,4);rays={c:"#ffd24a",life:1.8,n:16};later(()=>rain(220,["#ffd24a","#fff3b0"],2.8),250);later(()=>{ring("#ff8a1e",9,4);burst(120,6,c)},450)}
 if(t==="K"){burst(340,10.5,c,{dr:.975});ring("#fff",9,8);[0,140,280,420].forEach((d,i)=>later(()=>{ring(RB[i+1],6+i,5);burst(120,6+i,c)},d));rays={c:"rb",life:2.4,n:24};spiral=2.4;later(()=>rain(260,RB,3.2),500)}}
const rr=(x,y,w,h,r)=>{g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()};
function kartu(x,y,rot,sx,sy,a,glow){const k=.95*S;g.save();g.globalAlpha=a;g.translate(x,y);g.rotate(rot);g.scale(sx*k,sy*k);
 if(glow){g.shadowColor=EV.bg[1];g.shadowBlur=45;rr(-65,-91,130,182,13);g.fillStyle="#14142e";g.fill();g.shadowColor="#ffd24a";g.shadowBlur=22;g.fill();g.shadowBlur=0}
 if(img.complete)g.drawImage(img,-97.5,-130,195,260);g.restore()}
function pusaran(t,pow){const R0=(150*pow+40)*S;
 for(let k=0;k<5;k++){g.save();g.translate(CX,CY);g.rotate(-t*(1.2+k*.5)*(1+pow*2));
  for(let i=0;i<6;i++){g.rotate(Math.PI/3);const gr=g.createLinearGradient(0,0,R0,0);gr.addColorStop(0,"rgba(255,255,255,0)");gr.addColorStop(.3,EV.sinar[(i+k)%EV.sinar.length]+"aa");gr.addColorStop(1,"rgba(90,75,255,0)");
   g.strokeStyle=gr;g.lineWidth=(3+pow*5-k*.6)*S;g.beginPath();for(let a=0;a<3.2;a+=.08){const r=8*S+a*R0/3.2;g.lineTo(Math.cos(a*1.6)*r,Math.sin(a*1.6)*r)}g.stroke()}g.restore()}
 const rc=(34+pow*20)*S,cg=g.createRadialGradient(CX,CY,0,CX,CY,rc);cg.addColorStop(0,"#000");cg.addColorStop(.55,"#12052a");cg.addColorStop(.8,"rgba(178,60,255,.9)");cg.addColorStop(1,"rgba(178,60,255,0)");
 g.fillStyle=cg;g.beginPath();g.arc(CX,CY,rc,0,7);g.fill()}
// Panggung diam (umum untuk semua tema): kartu bergoyang -> terpelintir masuk lubang -> ledakan -> lahir lagi (7 dtk). Warna dari EV.sinar.
let idleB=false;
function panggung(tt){const t=tt%7;if(t<.1)idleB=false;
 const pow=t<1.5?.25:t<4.3?.25+(t-1.5)/2.8*.9:t<4.8?1.15-(t-4.3)*2:.2;
 if(t<4.6){pusaran(tt,pow);if(Math.random()<.4+pow)for(let i=0;i<(2+pow*4|0);i++){const a=Math.random()*7,d=(150+Math.random()*120)*S;P.push({x:CX+Math.cos(a)*d,y:CY+Math.sin(a)*d,vx:0,vy:0,c:pk(EV.sinar),r:2*S,life:.9,max:.9,gr:0,dr:1,tr:false,suck:1})}}
 if(t<1.5)kartu(CX,CY+Math.sin(tt*3)*6*S,Math.sin(tt*2.2)*.07,1,1,1,true);
 else if(t<4.2){const k=(t-1.5)/2.7,e=k*k,an=e*Math.PI*7,rd=(1-e)*40*S,x=CX+Math.cos(an)*rd,y=CY+Math.sin(an)*rd,sc=1-e*.96,tw=Math.cos(an*1.3);
  for(let j=3;j>0;j--)kartu(x,y,an*.9-j*.25,sc*tw*(1+j*.04),sc*(1+e*.6),.14,false);kartu(x,y,an*.9,sc*tw,sc*(1+e*.6),1,true)}
 else if(t>=4.5&&!idleB){idleB=true;burst(220,8,EV.sinar);[0,1,2].forEach(r=>ring(EV.sinar[r*2%EV.sinar.length],7+r,8-r*2))}
 if(t>=4.2&&t<5.1)flash=Math.max(flash,t<4.55?(t-4.2)/.35*.9:0);
 if(t>=5){const k=Math.min(1,(t-5)/.9),e=1-Math.pow(1-k,3);kartu(CX,CY,(1-e)*Math.PI*2,e*(1+Math.sin(k*12)*(1-k)*.25),e,1,true)}}
function jejak(tr,col,w,al){if(tr.length<2)return;g.lineCap="round";for(let i=1;i<tr.length;i++){const k=i/tr.length;g.globalAlpha=al*k;g.strokeStyle=col;g.lineWidth=w*k;g.beginPath();g.moveTo(tr[i-1][0],tr[i-1][1]);g.lineTo(tr[i][0],tr[i][1]);g.stroke()}g.globalAlpha=1}
// Spin: 3 meteor (bawah, kanan atas, kiri atas) memutar ke tengah, pecah 2 tiap naik tingkat (Epik, Legenda, Kolektor), menyatu, meledak.
const TD=.9,TF=3.4,TS=1.5,TC=1;
function mulaiAnim(top,done){
 P=[];R=[];A=[];GH=[];rays=null;spiral=0;
 const st=top==="E"?["E"]:top==="L"?["E","L"]:top==="K"?["E","L","K"]:[];
 const hs=[[CX,H+30],[W+30,-30],[-30,-30]].map(o=>({x:o[0],y:o[1],h:Math.atan2(CY-o[1],CX-o[0]),col:["#d8dcef"],w:3.2*S,tr:[]}));
 const sc=[];let tt=TD+TF;st.forEach(s=>{sc.push({at:tt,s});tt+=TS});
 run={top,hs,st,sc,si:0,t0:performance.now(),end:tt,boom:false,lv:0,done};bunyi("evspin")}
function langkah(now,dt){const f=dt*60,el=(now-run.t0)/1000;
 if(run.si<run.sc.length&&el>=run.sc[run.si].at){const cols=SPL[run.sc[run.si].s];run.si++;run.lv++;const nh=[];
  run.hs.forEach(m=>{burstAt(m.x,m.y,16,3,cols);ring(cols[0],3,2,m.x,m.y);GH.push({tr:m.tr,c:m.col[0],w:m.w,a:1});[-.55,.55].forEach(d=>nh.push({x:m.x,y:m.y,h:m.h+d,col:cols,w:Math.max(1.8*S,m.w*.85),tr:[[m.x,m.y]]}))});
  run.hs=nh;flash=.22+run.lv*.08;shake=3+run.lv*2.5;bunyi("evpecah",run.lv)}
 if(el<=TD)return;
 const conv=el>run.end,ck=conv?Math.min(1,(el-run.end)/TC):0,sp=(2.6+run.lv*.5+ck*4)*f*S;
 for(const m of run.hs){const dx=CX-m.x,dy=CY-m.y,ds=Math.hypot(dx,dy)/S;let off=(ds<80?1.45:ds<160?1.2:.85)*(1-ck*.8);
  let d=Math.atan2(dy,dx)+off-m.h;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;
  m.h+=d*Math.min(1,.06*f*(1+ck*3));m.x+=Math.cos(m.h)*sp;m.y+=Math.sin(m.h)*sp;m.tr.push([m.x,m.y]);if(m.tr.length>22)m.tr.shift();
  const col=conv&&!run.st.length?pk(CL[run.top]):pk(m.col);jejak(m.tr,col,m.w*2.4,.9);
  if(Math.random()<.7)add(m.x,m.y,(Math.random()-.5)*.6,(Math.random()-.5)*.6,col,(1+Math.random()*1.5)*S,.5,{gr:0,dr:.93});
  const hg=g.createRadialGradient(m.x,m.y,0,m.x,m.y,m.w*4);hg.addColorStop(0,"#fff");hg.addColorStop(.4,col);hg.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=hg;g.beginPath();g.arc(m.x,m.y,m.w*4,0,7);g.fill()}
 if(conv&&ck>.6){const q=(ck-.6)/.4;g.fillStyle="rgba(255,255,255,"+q*.55+")";g.beginPath();g.arc(CX,CY,(8+q*28)*S,0,7);g.fill()}
 if(conv&&ck>=1){run.boom=true;ledak(run.top);const d=run.done;later(d,{F:900,S:1000,E:1100,L:1300,K:1600}[run.top])}}
function frame(now){
 const dt=Math.min(.05,(now-last)/1000||.016);last=now;
 g.save();if(shake>0){g.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);shake*=.92;if(shake<.3)shake=0}
 const bg=g.createRadialGradient(CX,CY,0,CX,CY,Math.max(W,H)*.9);[0,.12,.38,.7,1].forEach((o,i)=>bg.addColorStop(o,EV.bg[i]));
 g.fillStyle=bg;g.fillRect(-20,-20,W+40,H+40);
 for(const s of stars){g.globalAlpha=.3+.7*Math.abs(Math.sin(now/700+s.p));g.fillStyle="#fff";g.beginPath();g.arc(s.x*W,s.y*H,s.r,0,7);g.fill()}g.globalAlpha=1;
 const tgt=run?(run.boom?.75:.94):0;dk+=(tgt-dk)*(run&&!run.boom?.05:.03);if(dk>.01){g.fillStyle="rgba(0,0,0,"+dk+")";g.fillRect(-20,-20,W+40,H+40)}
 if(!run)panggung(now/1000);
 for(let i=GH.length-1;i>=0;i--){const q=GH[i];q.a-=dt*1.2;if(q.a<=0){GH.splice(i,1);continue}jejak(q.tr,q.c,q.w*2.2,q.a*.7)}
 if(run&&!run.boom)langkah(now,dt);
 if(rays){rays.life-=dt;const a=Math.max(0,Math.min(1,rays.life/1.4));g.save();g.translate(CX,CY);g.rotate(now/900);
  for(let i=0;i<rays.n;i++){g.rotate(Math.PI*2/rays.n);g.fillStyle=rays.c==="rb"?RB[i%6]:rays.c;g.globalAlpha=a*.35;g.beginPath();g.moveTo(0,0);g.lineTo(W+H,-15*S);g.lineTo(W+H,15*S);g.fill()}g.restore();g.globalAlpha=1;if(rays.life<=0)rays=null}
 if(spiral>0){spiral-=dt;g.save();g.translate(CX,CY);g.rotate(-now/300);for(let k=0;k<6;k++){g.rotate(Math.PI/3);g.strokeStyle=RB[k];g.globalAlpha=Math.min(1,spiral)*.8;g.lineWidth=4*S;g.beginPath();for(let a=0;a<4;a+=.1){const r=(6+a*32)*S;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.stroke()}g.restore();g.globalAlpha=1}
 for(let i=R.length-1;i>=0;i--){const r=R[i];r.r+=r.sp;r.a-=.017;if(r.a<=0){R.splice(i,1);continue}g.strokeStyle=r.c;g.globalAlpha=r.a;g.lineWidth=r.w*S;g.beginPath();g.arc(r.x,r.y,r.r,0,7);g.stroke()}g.globalAlpha=1;
 for(let i=A.length-1;i>=0;i--){const b=A[i];b.life-=dt;if(b.life<=0){A.splice(i,1);continue}g.strokeStyle=b.c;g.globalAlpha=b.life/.4;g.lineWidth=2.5*S;g.beginPath();b.p.forEach((p,j)=>j?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke()}g.globalAlpha=1;
 g.globalCompositeOperation="lighter";
 for(let i=P.length-1;i>=0;i--){const p=P[i];
  if(p.suck){p.x+=(CX-p.x)*.06;p.y+=(CY-p.y)*.06}else{p.vx*=p.dr;p.vy=p.vy*p.dr+p.gr;p.x+=p.vx;p.y+=p.vy}
  p.life-=dt;if(p.life<=0){P.splice(i,1);continue}const a=p.life/p.max;g.globalAlpha=p.tr?a*(.5+.5*Math.sin(now/60+i)):a;g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.r*(p.tr?1:a*.6+.4),0,7);g.fill()}
 g.globalCompositeOperation="source-over";g.globalAlpha=1;
 if(flash>0){g.fillStyle="rgba(255,255,255,"+flash+")";g.fillRect(-20,-20,W+40,H+40);flash*=.9;if(flash<.02)flash=0}
 g.restore();raf=requestAnimationFrame(frame)}

// ---------- spin ----------
const ui=v=>{for(const id of ["#evtop","#evsub","#evbot"])$e(id).style.visibility=v?"visible":"hidden"};
async function spin(n){
 if(busy||run)return;if(!aktif())return pesan("Event sudah selesai.",1);
 if(!isG())return pesan("Masuk dengan Google dulu (Pengaturan).",1);
 const harga=n===10?9:1;if((U.tok||0)<harga)return pesan("Token kurang, perlu "+harga+". Beli atau tukar di Toko Event.",1);
 const own=Object.assign({},U.skins),ev=Object.assign({},U.ev),res=hasil(n,own,ev);
 busy=true;pesan("");
 if(!await simpan(Object.assign({},U,{tok:U.tok-harga,skins:own,ev}))){busy=false;return}
 angka();ui(false);
 const top=res.reduce((m,r)=>ORD.indexOf(r.t)>ORD.indexOf(m)?r.t:m,"F");
 const skip=$e("#evskip");skip.hidden=false;
 const tampil=anim=>{skip.hidden=true;tm.forEach(clearTimeout);tm.length=0;n===1?satu(res[0]):sepuluh(res,anim)};
 skip.onclick=()=>{P=[];R=[];A=[];GH=[];rays=null;spiral=0;flash=0;shake=0;if(run)run.boom=true;tampil(false)};
 mulaiAnim(top,()=>tampil(true))}
function selesai(){$e("#evres").hidden=true;$e("#evres").innerHTML="";run=null;busy=false;ui(true);angka()}
function teks(r){return r.k?NMT[r.t]+": "+SKA.get(r.k).n+(r.dup?` (dobel, +${DUP[r.t]} kristal)`:""):"+"+DROP+" kristal"}
function satu(r){const o=$e("#evres");o.hidden=false;
 bunyi("evkartu",ORD.indexOf(r.t));o.innerHTML=cardHTML(r,130)+`<div style="margin-top:14px;font-size:15px;font-weight:700;color:${BRD[r.t]}">${teks(r)}</div><button class="evok">OK</button>`;
 requestAnimationFrame(()=>o.querySelector(".evcard").classList.add("on"));o.querySelector(".evok").onclick=selesai}
function sepuluh(R,anim){const o=$e("#evres");o.hidden=false;
 const urut=R.map((r,i)=>i).sort((a,b)=>ORD.indexOf(R[a].t)-ORD.indexOf(R[b].t));
 o.innerHTML=`<div class="evgrid">${R.map(r=>cardHTML(r,64)).join("")}</div><div class="evsum" style="font-size:13px;color:#d8d2ff;text-align:center;line-height:1.7"></div><button class="evok" hidden>OK</button>`;
 const el=[...o.querySelectorAll(".evcard")],cnt={};R.forEach(r=>cnt[r.t]=(cnt[r.t]||0)+1);
 const akhir=()=>{o.querySelector(".evsum").innerHTML=["K","L","E","S"].filter(t=>cnt[t]).map(t=>NMT[t]+" x"+cnt[t]).join(" · ")+(cnt.F?"<br>+"+cnt.F*DROP+" kristal":"")+(R.some(r=>r.dup)?"<br>Skin dobel jadi kristal":"");const b=o.querySelector(".evok");b.hidden=false;b.onclick=selesai};
 if(!anim){el.forEach(e=>e.classList.add("on"));return akhir()}
 urut.forEach((i,k)=>later(()=>{el[i].classList.add("on");const t=R[i].t,q=ORD.indexOf(t);bunyi("evkartu",q);
  if(q>=2){const a=el[i].getBoundingClientRect();burstAt(a.left+a.width/2,a.top+a.height/2,q*25,3+q,CL[t]);if(q>=3){flash=.3;shake=4}}},k*260));
 later(akhir,urut.length*260+300)}

// ---------- Toko Event ----------
// Kolektor yang dijual hanya skin event ini (EV.k); Kolektor lain tidak muncul.
function toko(){
 const urut=["K","L","E","S"],L=SKA.list.filter(d=>HRG[d.t]&&(d.t!=="K"||d.k===EV.k)).sort((a,b)=>urut.indexOf(a.t)-urut.indexOf(b.t));
 evt.innerHTML=`<div style="display:flex;align-items:center;gap:8px"><button class="evib" id="evtb" aria-label="Kembali">‹</button><div><div style="font-size:18px;font-weight:800;letter-spacing:1px">TOKO EVENT</div><div style="font-size:12px;color:#ffe9a8">sisa ${sisa()}</div></div></div>
<div class="evrow"><span class="evch" style="border:2px solid #ffd24a">${TK()}${U.tok||0}</span><span class="evch" style="border:2px solid #7fd6ff">${KR()}${U.ev.kr}</span><span class="evch" style="border:2px solid #4cc790">🪙 ${(U.koin||0).toLocaleString("id-ID")}</span><span class="evch" style="border:2px solid #4f8cff"><i class="evmini" style="background:#3a7bff"></i>${U.biru||0}</span><span class="evch" style="border:2px solid #ff5a5a"><i class="evmini" style="background:#e23a3a"></i>${U.merah||0}</span></div>
<div class="evsec">Tukar token</div><div class="evtx">
<button class="evtk" data-tx="koin"><b>🪙100 → ${TK()}1</b><span>Beli token</span></button>
<button class="evtk" data-tx="biru"><b><i class="evmini" style="background:#3a7bff"></i>2 → ${TK()}1</b><span>Tukar kartu biru</span></button>
<button class="evtk" data-tx="merah"><b><i class="evmini" style="background:#e23a3a"></i>1 → ${TK()}6</b><span>Tukar kartu merah</span></button></div>
<div class="evmsg" style="margin:6px 0"></div>
<div class="evsec">Tukar kristal dengan skin</div><div class="evsk">${L.map(d=>{const own=!!U.skins[d.k];
 return `<button class="evti${d.t==="K"?" gk":""}${own?" own":""}" style="--c:${BRD[d.t]}" data-k="${d.k}"><div class="evim">${SKA.svg(d.k)}${SKA.tag(d.t,"evl")}</div><span style="font-size:13px;font-weight:700">${d.n}</span><span class="evpr">${own?"✓ Dimiliki":KR()+HRG[d.t]}</span></button>`}).join("")}</div>`;
 evt.querySelector("#evtb").onclick=()=>{evt.hidden=true;evs.hidden=false;angka()}}
const TX={koin:[["koin",100],1,"Koin kurang, perlu 100."],biru:[["biru",2],1,"Kartu biru kurang, perlu 2."],merah:[["merah",1],6,"Kartu merah kurang."]};
evt.addEventListener("click",async e=>{if(busy)return;
 const b=e.target.closest("[data-tx]"),s=e.target.closest("[data-k]");if(!b&&!s)return;
 if(!isG())return pesan("Masuk dengan Google dulu (Pengaturan).",1);if(!aktif())return pesan("Event sudah selesai.",1);
 let nu,ok;
 if(b){const [[f,c],dapat,kurang]=TX[b.dataset.tx];if((U[f]||0)<c)return pesan(kurang,1);
  nu=Object.assign({},U,{[f]:U[f]-c,tok:Math.min(9999,(U.tok||0)+dapat)});ok="+"+dapat+" token"}
 else{const d=SKA.get(s.dataset.k),h=HRG[d.t];if(U.skins[d.k])return pesan(d.n+" sudah dimiliki.",1);if(U.ev.kr<h)return pesan("Kristal kurang, perlu "+h+".",1);
  if(!confirm("Tukar "+h+" kristal dengan skin "+d.n+"?"))return;
  nu=Object.assign({},U,{skins:Object.assign({},U.skins,{[d.k]:true}),ev:Object.assign({},U.ev,{kr:U.ev.kr-h})});ok="Dapat skin "+d.n}
 busy=true;const sukses=await simpan(nu);busy=false;if(sukses){toko();pesan(ok);if(window.SND)SND("rev1")}});

// ---------- buka/tutup ----------
async function buka(){
 $("#home").hidden=true;evs.hidden=false;ukur();pesan("");
 try{if(!await muat())pesan("Masuk dengan Google di Pengaturan agar token dan skin tersimpan.",1)}catch(e){pesan("Gagal memuat: "+(e.code||e.message),1)}
 angka();last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}
function tutup(){if(busy||run)return;evs.hidden=true;evt.hidden=true;cancelAnimationFrame(raf);$("#home").hidden=false}
// Game ruang dimulai selagi layar event terbuka: tutup paksa (hasil spin sudah tersimpan).
window.evTutupPaksa=()=>{if(evs.hidden&&evt.hidden)return;tm.forEach(clearTimeout);tm.length=0;$e("#evskip").hidden=true;selesai();evs.hidden=true;evt.hidden=true;cancelAnimationFrame(raf)};
const bunyi=(k,x)=>{if(window.SND&&!evs.hidden)SND(k,x)};
$e("#evx").onclick=tutup;$e("#ev1").onclick=()=>spin(1);$e("#ev10").onclick=()=>spin(10);
$e("#evtoko").onclick=()=>{if(run)return;evs.hidden=true;evt.hidden=false;toko()};
$e("#evinfo").onclick=()=>alert(`${EV.nm} · event ${EV.hari} hari (sisa ${sisa()})\n\nPeluang per spin:\n${PEL.map(([t,p])=>NMT[t]+(t==="F"?" (+"+DROP+")":"")+": "+String(p).replace(".",",")+"%").join("\n")}\n\nTiap 10 spin tanpa skin, spin ke-10 pasti skin.\nSkin dobel jadi kristal: Spesial ${DUP.S}, Epik ${DUP.E}, Legenda ${DUP.L}, Kolektor ${DUP.K}.\nKristal hangus saat event selesai. Sisa token jadi koin (1 token = ${SISA} koin).`);

// ---------- banner geser di menu ----------
function banner(){const mh=document.querySelector("#home .mh");if(!mh||mh.dataset.ev)return;mh.dataset.ev=1;
 const tr=document.createElement("div");tr.className="evtrack";const s1=document.createElement("div");while(mh.firstChild)s1.appendChild(mh.firstChild);
 const s2=document.createElement("button");s2.className="evban";s2.setAttribute("aria-label","Buka event "+EV.nm);
 s2.innerHTML=`<i>EVENT TERBATAS</i><u>${sisa()}</u><b>${EV.nm}</b>`;tr.append(s1,s2);
 const dt=document.createElement("div");dt.className="evdots";dt.innerHTML="<s class=on></s><s></s>";
 mh.classList.add("evmh");mh.append(tr,dt);s2.onclick=buka;
 tr.addEventListener("scroll",()=>{const i=Math.round(tr.scrollLeft/tr.clientWidth);dt.children[0].className=i?"":"on";dt.children[1].className=i?"on":""},{passive:true});
 const iv=setInterval(()=>{s2.querySelector("u").textContent=sisa();if(!aktif()){clearInterval(iv);tr.scrollLeft=0;s2.remove();dt.remove()}},60000)}
if(aktif())banner();else if(Date.now()<T0)setTimeout(()=>banner(),Math.min(T0-Date.now(),2147483000));
})();
