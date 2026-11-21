// Inventori: 6 slot skin yang dipakai saat bermain. Data users/{uid}.equip = {k2,kqj,as,jk: kunci skin}; meja dan kartu belum ada skinnya.
// Ketuk skin: pratinjau efek Set + tombol Pakai (masuk ke slot kelompoknya). Atau tarik skin ke slot mana pun. Ketuk slot terisi: lihat efeknya, bisa Lepas. Efek Set memakai slot ini (setfx.js).
(()=>{
const TC={Biasa:"#c9d6cd",Spesial:"#4ac68c",Epik:"#a56bff",Legenda:"#ff9d2e"},LV={Biasa:1,Spesial:2,Epik:3,Legenda:4};
const CH={s:"♠",h:"♥",c:"♣",d:"♦",jb:"★",jr:"★"},RED={h:1,d:1,jr:1};
const SL=[["meja","Meja"],["kartu","Kartu"],["k2","2–10"],["kqj","KQJ"],["as","As"],["jk","Joker"]];
const EN={S:"Spesial",E:"Epik",L:"Legenda"};
let U={skins:{},equip:{}},sel=null,act=null;
const isG=()=>!!auth&&!!auth.currentUser&&!auth.currentUser.isAnonymous;
const sm=t=>{$("#ivm").textContent=t||""};
const tier=k=>{const r=k.split("_")[0];return r==="JOKER"?"Legenda":r==="A"?"Epik":"KQJ".includes(r)?"Spesial":"Biasa"};
const grp=k=>{const r=k.split("_")[0];return r==="JOKER"?"jk":r==="A"?"as":"KQJ".includes(r)?"kqj":"k2"};
const face=(k,x)=>{const[r,s]=k.split("_"),j=r==="JOKER";return `<div class="skc${x||""}" data-k="${k}" style="border-color:${TC[tier(k)]};color:${RED[s]?"#c0392b":"#14201a"}"><span style="font-size:${j?8:16}px">${r}</span><span style="font-size:13px">${CH[s]}</span></div>`};
function draw(){
 const q=U.equip||{};
 $("#ivs").innerHTML=SL.map(([id,n])=>`<div data-s="${id}" class="${id===act?"act":sel&&!act?"sel":""}">${q[id]?face(q[id]):'<div class="skc em"></div>'}<span>${n}</span></div>`).join("");
 const p=$("#ivp");p.hidden=!sel;
 if(sel)p.innerHTML=`<div class="ivh">${face(sel)}<b>${EN[fxTier(sel)]}</b><span style="margin-left:auto;display:flex;gap:6px"><button class="pri sec" data-a="play" style="flex:none;padding:4px 10px">Putar</button>${act?'<button class="pri sec" data-a="off" style="flex:none;padding:4px 10px">Lepas</button>':`<button class="pri" data-a="on" style="flex:none;padding:4px 14px">Pakai</button>`}</span></div>`;
 const ks=Object.keys(U.skins||{}).sort((a,b)=>LV[tier(b)]-LV[tier(a)]||(a<b?-1:1));
 $("#ivl").innerHTML=ks.length?ks.map(k=>face(k,k===sel&&!act?" on":"")).join(""):'<span class="mut">Belum ada skin. Putar di Spin Skin.</span>';
 $("#ivl").querySelectorAll(".skc").forEach(el=>el.onpointerdown=e=>down(e,el))}
async function open(){
 $("#home").hidden=true;$("#iv").hidden=false;U={skins:{},equip:{}};sel=null;act=null;sm("");
 if(isG()){try{const v=await db.get("users/"+uid);if(v)U=Object.assign(U,v);U.skins=U.skins||{};U.equip=U.equip||{}}catch(e){sm("Gagal memuat: "+(e.code||e.message))}}
 else sm("Masuk dengan Google di Pengaturan agar skin tersimpan.");
 draw()}
// Simpan langsung ke tampilan dan MYEQ, lalu tulis; tiap tulisan membawa seluruh data terbaru.
function save(q){
 if(!isG())return sm("Masuk dengan Google dulu (Pengaturan).");
 const nu=Object.assign({},U,{equip:q});U=nu;MYEQ=q;
 db.doc("users/"+uid).set(nu).catch(e=>sm("Gagal menyimpan: "+(e.code||e.message)))}
function place(s,k){
 sel=null;act=null;
 if(s==="meja"||s==="kartu"){draw();return sm("Skin meja dan kartu belum tersedia.")}
 save(Object.assign({},U.equip,{[s]:k}));draw();sm("Terpasang.")}
function pick(k,a){sel=k;act=a;draw();pv()}
function pv(){try{playSetFx({t:fxTier(sel),v:fxV(sel)},uid,"",150,"Lawan")}catch(e){}}
function down(e,el){
 const k=el.dataset.k,x0=e.clientX,y0=e.clientY;let g=null;
 const mv=ev=>{
  if(!g&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>8){g=el.cloneNode(true);g.className="ivg";g.style.borderColor=el.style.borderColor;g.style.color=el.style.color;document.body.appendChild(g)}
  if(g){g.style.left=ev.clientX-18+"px";g.style.top=ev.clientY-25+"px"}};
 const up=ev=>{
  document.removeEventListener("pointermove",mv);document.removeEventListener("pointerup",up);document.removeEventListener("pointercancel",up);
  if(g){g.remove();const t=document.elementFromPoint(ev.clientX,ev.clientY),s=t&&t.closest("[data-s]");if(s&&ev.type==="pointerup")place(s.dataset.s,k)}
  else pick(k,null)};
 document.addEventListener("pointermove",mv);document.addEventListener("pointerup",up);document.addEventListener("pointercancel",up)}
$("#ivs").onclick=e=>{const s=e.target.closest("[data-s]");if(!s)return;const id=s.dataset.s;if(sel&&!act)place(id,sel);else if((U.equip||{})[id])pick(U.equip[id],id)};
$("#ivp").onclick=e=>{
 const b=e.target.closest("button");if(!b)return;
 if(b.dataset.a==="play")pv();
 else if(b.dataset.a==="on")place(grp(sel),sel);
 else if(b.dataset.a==="off"){const q=Object.assign({},U.equip);delete q[act];sel=null;act=null;save(q);draw();sm("Dilepas.")}};
$("#ti").onclick=open;
$("#ivb").onclick=()=>{$("#iv").hidden=true;$("#home").hidden=false};
})();
