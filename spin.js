// Spin Skin: kartu biru/merah -> skin. Data di users/{uid} = {biru,merah,skins:{kunci:true}}; hanya akun Google yang boleh menyimpan (lihat Rules).
// Satu tulisan penuh per aksi (kurangi kartu + tambah skin sekaligus) supaya saldo tidak setengah tersimpan.
(()=>{
const TC={Biasa:"#c9d6cd",Spesial:"#4ac68c",Epik:"#a56bff",Legenda:"#ff9d2e"},LV={Biasa:1,Spesial:2,Epik:3,Legenda:4};
const CH={s:"♠",h:"♥",c:"♣",d:"♦",jb:"★",jr:"★"},RED={h:1,d:1,jr:1};
const card=(r,s,t,w)=>({r,s,t,w,key:r+"_"+s,ch:CH[s],ink:RED[s]?"#c0392b":"#14201a"});
// Peluang (persen): biru = 2-10 Biasa 78,5; K Q J Spesial 20; As (2 kartu) Epik 1,5. merah = K Q J semua jenis Spesial 50; As (3 kartu) Epik 40; Joker (2) Legenda 10.
const P1=[],P2=[];
for(let n=2;n<=10;n++)P1.push(card(String(n),"shcd"[n%4],"Biasa",78.5/9));
[["K","s"],["Q","h"],["J","c"]].forEach(x=>P1.push(card(x[0],x[1],"Spesial",20/3)));
P1.push(card("A","s","Epik",.75),card("A","h","Epik",.75));
["K","Q","J"].forEach(r=>"shcd".split("").forEach(s=>P2.push(card(r,s,"Spesial",50/12))));
["s","h","d"].forEach(s=>P2.push(card("A",s,"Epik",40/3)));
P2.push(card("JOKER","jb","Legenda",5),card("JOKER","jr","Legenda",5));
const POOL={biru:P1,merah:P2};
const ROWS={biru:[["#c9d6cd","Biasa","2–10","78,5%"],["#4ac68c","Spesial","K Q J","20%"],["#a56bff","Epik","As · hanya 2 kartu","1,5%"]],
 merah:[["#4ac68c","Spesial","K Q J · semua jenis (12 kartu)","50%"],["#a56bff","Epik","As · hanya 3 kartu","40%"],["#ff9d2e","Legenda","Joker · 2 kartu","10%"]]};
const NM={biru:"Spin Biasa",merah:"Spin Legenda"};
let U={biru:0,merah:0,skins:{}},tab="biru",busy=false;
const isG=()=>!!auth&&!!auth.currentUser&&!auth.currentUser.isAnonymous;
const sm=t=>{$("#spm").textContent=t||""};
const pick=p=>{let r=Math.random()*100,a=0;for(const c of p){a+=c.w;if(r<a)return c}return p[p.length-1]};
const face=c=>`<div class="skc" style="border-color:${TC[c.t]};color:${c.ink}"><span style="font-size:${c.r==="JOKER"?"12px":"28px"}">${c.r}</span><span>${c.ch}</span></div>`;
const label=c=>c.r+(c.r==="JOKER"?"":c.ch);
function strip(win){const a=[];for(let i=0;i<32;i++)a.push(pick(POOL[tab]));if(win)a[24]=win;$("#spt").innerHTML=a.map(face).join("")}
function counts(){$("#spcb").textContent=U.biru||0;$("#spcm").textContent=U.merah||0}
function info(){$("#spq").innerHTML=`<div class="mut" style="font-weight:700;letter-spacing:.08em;margin-bottom:4px">PELUANG · ${NM[tab]}</div>`+ROWS[tab].map(r=>`<div style="display:flex;align-items:center;gap:10px;min-height:32px"><span style="width:12px;height:12px;border-radius:3px;background:${r[0]}"></span><b style="width:64px;font-size:14px">${r[1]}</b><span class="mut" style="flex:1;font-size:12px">${r[2]}</span><b>${r[3]}</b></div>`).join("")}
function setTab(k){
 tab=k;const b=k==="biru";
 $("#spt1").style.background=b?"#2f6fe0":"#1f2b25";$("#spt2").style.background=b?"#1f2b25":"#d63a3a";
 $("#spn").style.background=b?"#2f6fe0":"#d63a3a";$("#spn").textContent="PUTAR · 1 kartu "+(b?"biru":"merah");
 $("#spr").textContent="Putar untuk dapat skin";strip();
 const t=$("#spt");t.style.transition="none";t.style.transform="translateX(0)";info()}
async function open(){
 $("#home").hidden=true;$("#sp").hidden=false;$("#spq").hidden=true;
 U={biru:0,merah:0,skins:{}};sm("");
 if(isG()){try{const v=await db.get("users/"+uid);if(v)U=Object.assign(U,v);U.skins=U.skins||{}}catch(e){sm("Gagal memuat: "+(e.code||e.message))}}
 else sm("Masuk dengan Google di Pengaturan agar kartu dan skin tersimpan.");
 counts();setTab("biru")}
async function put(nu){try{await db.doc("users/"+uid).set(nu);return true}catch(e){sm("Gagal menyimpan: "+(e.code||e.message));return false}}
async function spin(){
 if(busy)return;
 if(!isG())return sm("Masuk dengan Google dulu (Pengaturan).");
 if((U[tab]||0)<1)return sm("Kartu "+(tab==="biru"?"biru":"merah")+" tidak cukup.");
 const w=pick(POOL[tab]),dup=!!U.skins[w.key],nu=Object.assign({},U,{skins:Object.assign({},U.skins,{[w.key]:true})});nu[tab]=U[tab]-1;
 busy=true;sm("");
 if(!await put(nu)){busy=false;return}
 U=nu;counts();$("#spr").textContent="Memutar…";
 strip(w);const t=$("#spt");t.style.transition="none";t.style.transform="translateX(0)";void t.offsetWidth;
 t.style.transition="transform 4s cubic-bezier(.1,.75,.15,1)";t.style.transform="translateX(-"+(24*80+35-$("#spw").clientWidth/2)+"px)";
 setTimeout(()=>{busy=false;reveal(w,dup)},4300)}
async function swap(){
 if(busy)return;
 if(!isG())return sm("Masuk dengan Google dulu (Pengaturan).");
 if((U.biru||0)<10)return sm("Kartu biru belum cukup, perlu 10.");
 const nu=Object.assign({},U,{biru:U.biru-10,merah:(U.merah||0)+2});
 if(await put(nu)){U=nu;counts();sm("Berhasil: 10 kartu biru jadi 2 kartu merah.")}}
// Layar hadiah: makin langka makin mewah (Biasa: balik kartu; Spesial: + kilau; Epik: + sinar & cincin; Legenda: + kilatan, getar, kilap).
function reveal(w,dup){
 const l=LV[w.t],c=TC[w.t],G=[240,280,340,400][l-1],j=w.r==="JOKER",o=$("#spo");
 let h="";
 if(l===4)h+=`<div class="skx" style="top:0;left:0;right:0;bottom:0;background:#fff7d6;animation:skFlash .9s ease-out both"></div>`;
 if(l>=3){
  h+=`<div class="skx" style="left:50%;top:50%;width:640px;height:640px;margin:-350px 0 0 -320px;border-radius:50%;background:repeating-conic-gradient(from 0deg,${l===4?"rgba(232,185,35,.55)":"rgba(165,107,255,.4)"} 0deg 9deg,transparent 9deg 24deg);-webkit-mask-image:radial-gradient(circle,#000 18%,transparent 68%);mask-image:radial-gradient(circle,#000 18%,transparent 68%);animation:skRays ${l===4?6:12}s linear infinite"></div>`;
  [0,.9].forEach(d=>{h+=`<div class="skx" style="left:50%;top:50%;width:200px;height:200px;margin:-200px 0 0 -100px;border-radius:50%;border:3px solid ${c};animation:skRing 1.8s ease-out ${d}s infinite"></div>`})}
 h+=`<div class="skx" style="left:50%;top:50%;width:${G}px;height:${G}px;margin:${-G/2-50}px 0 0 ${-G/2}px;border-radius:50%;background:radial-gradient(circle,${c} 0%,transparent 65%);animation:skPulse 1.6s ease-in-out infinite"></div>`;
 for(let i=0,n=[0,8,16,28][l-1];i<n;i++){const k=l===4&&i%2?"#fff3b0":c;h+=`<span class="skx" style="left:${(i*53+17)%96+2}%;top:${30+(i*29+7)%55}%;width:${4+(i%3)*3}px;height:${4+(i%3)*3}px;border-radius:50%;background:${k};box-shadow:0 0 8px ${k};opacity:0;animation:skTw ${1.6+(i%4)*.4}s ease-out ${(i%7)*.25}s infinite"></span>`}
 h+=`<div style="position:relative;animation:${l===4?"skShake .5s ease-in-out .9s 2":"none"}"><div style="position:relative;width:150px;height:210px;box-sizing:border-box;border-radius:14px;background:#f7f3e6;border:5px solid ${c};color:${w.ink};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;font-weight:800;line-height:1;box-shadow:0 0 44px ${c};overflow:hidden;animation:skFlip .9s ease-out both"><span style="font-size:${j?30:76}px">${w.r}</span><span style="font-size:46px">${w.ch}</span>${l===4?`<div class="skx" style="top:0;bottom:0;left:0;width:50px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.85),transparent);animation:skShine 2.2s ease-in-out 1s infinite"></div>`:""}</div></div>`;
 h+=`<div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;animation:skPop .6s ease-out .7s both"><div style="font-size:${[22,26,32,38][l-1]}px;font-weight:900;letter-spacing:.12em;color:${c};text-shadow:${l>=3?"0 0 18px "+c:"none"}">${w.t.toUpperCase()}</div><div style="font-size:14px;color:#d9e7de">Skin ${w.t} · kartu ${label(w)}${dup?" (sudah dimiliki)":""}</div></div>`;
 h+=`<button class="skl" id="spl">Lanjut</button>`;
 o.innerHTML=h;o.hidden=false;
 $("#spl").onclick=()=>{o.hidden=true;o.innerHTML=""};
 $("#spr").innerHTML=`<div class="skc" style="width:36px;height:50px;border-width:3px;border-color:${c};color:${w.ink};font-size:${j?9:18}px">${label(w)}</div><b style="color:${c}">Skin ${w.t} · kartu ${label(w)}</b>`;
 if(navigator.vibrate)navigator.vibrate(l>=4?[60,40,60,40,120]:l>=3?[60,40,60]:30)}
$("#ts").onclick=open;
$("#spb").onclick=()=>{$("#sp").hidden=true;$("#home").hidden=false};
$("#spt1").onclick=()=>{if(!busy)setTab("biru")};
$("#spt2").onclick=()=>{if(!busy)setTab("merah")};
$("#spi").onclick=()=>{const q=$("#spq");q.hidden=!q.hidden};
$("#spn").onclick=spin;$("#spx").onclick=swap;
})();
