// Spin Skin: kartu biru/merah -> skin. Data di users/{uid} = {biru,merah,skins:{kunci:true}}; hanya akun Google yang boleh menyimpan (lihat Rules).
// Satu tulisan penuh per aksi (kurangi kartu + tambah skin sekaligus) supaya saldo tidak setengah tersimpan.
(()=>{
const TC={Spesial:"#4ac68c",Epik:"#a56bff",Legenda:"#ff9d2e"},LV={Spesial:2,Epik:3,Legenda:4,Kolektor:4};
const card=(k,w)=>{const d=SKA.get(k);return{key:k,n:d.n,t:d.tn,w,col:d.c[0]}};
// Peluang (persen), tiap skin dalam satu tier sama besar. biru = Spesial 98,5 (12 skin); Epik 1,5 (6 skin). merah = Spesial 50 (12 skin); Epik 40 (6 skin); Legenda 10 (4 skin). Kolektor tidak ada di Spin (event terbatas).
const P1=[],P2=[],ids=t=>SKA.list.filter(d=>d.t===t).map(d=>d.k);
ids("S").forEach(k=>{P1.push(card(k,98.5/12));P2.push(card(k,50/12))});
ids("E").forEach(k=>{P1.push(card(k,1.5/6));P2.push(card(k,40/6))});
ids("L").forEach(k=>P2.push(card(k,10/4)));
const POOL={biru:P1,merah:P2};
const ROWS={biru:[["#4ac68c","Spesial","12 skin","98,5%"],["#a56bff","Epik","6 skin","1,5%"]],
 merah:[["#4ac68c","Spesial","12 skin","50%"],["#a56bff","Epik","6 skin","40%"],["#ff9d2e","Legenda","4 skin","10%"]]};
const NM={biru:"Spin Biasa",merah:"Spin Legenda"};
let U={biru:0,merah:0,skins:{}},tab="biru",busy=false;
const isG=()=>!!auth&&!!auth.currentUser&&!auth.currentUser.isAnonymous;
const sm=t=>{$("#spm").textContent=t||""};
const pick=p=>{let r=Math.random()*100,a=0;for(const c of p){a+=c.w;if(r<a)return c}return p[p.length-1]};
const face=c=>`<div class="sks">${SKA.svg(c.key)}</div>`;
function strip(win){const a=[];for(let i=0;i<32;i++)a.push(pick(POOL[tab]));if(win)a[24]=win;$("#spt").innerHTML=a.map(face).join("")}
function counts(){$("#spcb").textContent=U.biru||0;$("#spcm").textContent=U.merah||0}
function info(){$("#spq").innerHTML=`<div class="mut" style="font-weight:700;letter-spacing:.08em;margin-bottom:4px">PELUANG · ${NM[tab]}</div>`+ROWS[tab].map(r=>`<div style="display:flex;align-items:center;gap:10px;min-height:32px"><span style="width:12px;height:12px;border-radius:3px;background:${r[0]}"></span><b style="width:64px;font-size:14px">${r[1]}</b><span class="mut" style="flex:1;font-size:12px">${r[2]}</span><b>${r[3]}</b></div>`).join("")}
function setTab(k){
 tab=k;const b=k==="biru";
 $("#spt1").classList.toggle("on",b);$("#spt2").classList.toggle("on",!b);
 $("#spn").style.background=b?"#2f6fe0":"#d63a3a";$("#spn").textContent="PUTAR · 1 kartu "+(b?"biru":"merah");
 $("#spr").textContent="Putar untuk dapat skin";strip();
 const t=$("#spt");t.style.transition="none";t.style.transform="translateX(0)";info()}
async function open(){
 $("#home").hidden=true;$("#kp").hidden=false;$("#spq").hidden=true;
 U={biru:0,merah:0,skins:{}};sm("");
 if(isG()){try{const v=await db.get("users/"+uid);if(v)U=Object.assign(U,v);U.skins=SKA.migrate(U.skins)}catch(e){sm("Gagal memuat: "+(e.code||e.message))}}
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
 const l=LV[w.t],c=w.col,G=[240,280,340,400][l-1],o=$("#spo");
 let h="";
 if(l===4)h+=`<div class="skx" style="top:0;left:0;right:0;bottom:0;background:#fff7d6;animation:skFlash .9s ease-out both"></div>`;
 if(l>=3){
  h+=`<div class="skx" style="left:50%;top:50%;width:640px;height:640px;margin:-350px 0 0 -320px;border-radius:50%;background:repeating-conic-gradient(from 0deg,${l===4?"rgba(232,185,35,.55)":"rgba(165,107,255,.4)"} 0deg 9deg,transparent 9deg 24deg);-webkit-mask-image:radial-gradient(circle,#000 18%,transparent 68%);mask-image:radial-gradient(circle,#000 18%,transparent 68%);animation:skRays ${l===4?6:12}s linear infinite"></div>`;
  [0,.9].forEach(d=>{h+=`<div class="skx" style="left:50%;top:50%;width:200px;height:200px;margin:-200px 0 0 -100px;border-radius:50%;border:3px solid ${c};animation:skRing 1.8s ease-out ${d}s infinite"></div>`})}
 h+=`<div class="skx" style="left:50%;top:50%;width:${G}px;height:${G}px;margin:${-G/2-50}px 0 0 ${-G/2}px;border-radius:50%;background:radial-gradient(circle,${c} 0%,transparent 65%);animation:skPulse 1.6s ease-in-out infinite"></div>`;
 for(let i=0,n=[0,8,16,28][l-1];i<n;i++){const k=l===4&&i%2?"#fff3b0":c;h+=`<span class="skx" style="left:${(i*53+17)%96+2}%;top:${30+(i*29+7)%55}%;width:${4+(i%3)*3}px;height:${4+(i%3)*3}px;border-radius:50%;background:${k};box-shadow:0 0 8px ${k};opacity:0;animation:skTw ${1.6+(i%4)*.4}s ease-out ${(i%7)*.25}s infinite"></span>`}
 h+=`<div style="position:relative;animation:${l===4?"skShake .5s ease-in-out .9s 2":"none"}"><div style="position:relative;width:150px;height:210px;animation:skFlip .9s ease-out both">${SKA.svg(w.key,"ska rv")}</div></div>`;
 h+=`<div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;animation:skPop .6s ease-out .7s both"><div style="font-size:${[22,26,32,38][l-1]}px;font-weight:900;letter-spacing:.12em;color:${c};text-shadow:${l>=3?"0 0 18px "+c:"none"}">${w.t.toUpperCase()}</div><div style="font-size:14px;color:#d9e7de">${w.n} · skin ${w.t}${dup?" (sudah dimiliki)":""}</div></div>`;
 h+=`<button class="skl" id="spl">Lanjut</button>`;
 o.innerHTML=h;o.hidden=false;
 $("#spl").onclick=()=>{o.hidden=true;o.innerHTML=""};
 $("#spr").innerHTML=`<div class="sks" style="width:36px;height:50px">${SKA.svg(w.key,"ska sm")}</div><b style="color:${c}">${w.n} · skin ${w.t}</b>`;
 if(navigator.vibrate)navigator.vibrate(l>=4?[60,40,60,40,120]:l>=3?[60,40,60]:30)}
$("#ts").onclick=open;
$("#spb").onclick=()=>{$("#kp").hidden=true;$("#home").hidden=false};
$("#spt1").onclick=()=>{if(!busy)setTab("biru")};
$("#spt2").onclick=()=>{if(!busy)setTab("merah")};
$("#kpi").onclick=()=>{const q=$("#spq");q.hidden=!q.hidden};
$("#spn").onclick=spin;$("#spx").onclick=swap;
})();
