// Inventori: 6 slot skin yang dipakai saat bermain. Data users/{uid}.equip = {k2,kqj,as,jk: kunci skin}; meja dan kartu belum ada skinnya.
// Skin (skinart.js: S01..S12 Spesial, E01..E06 Epik, L01..L04 Legenda, K01,K02 Kolektor) boleh di slot 2-10, KQJ, As, Joker; Kolektor hanya As dan Joker.
// Ketuk skin: pratinjau efek Set + tombol slot untuk memakainya. Atau tarik skin ke slot mana pun. Ketuk slot terisi: lihat efeknya, bisa Lepas. Efek Set memakai slot ini (setfx.js).
(()=>{
const SL=[["meja","Meja"],["kartu","Kartu"],["k2","2–10"],["kqj","KQJ"],["as","As"],["jk","Joker"]],NS=SL.slice(2);
const LV={S:1,E:2,L:3,K:4};
let U={skins:{},equip:{}},sel=null,act=null;
const isG=()=>!!auth&&!!auth.currentUser&&!auth.currentUser.isAnonymous;
const sm=t=>{$("#ivm").textContent=t||""};
const face=(k,x)=>`<div class="sk${x||""}" data-k="${k}">${SKA.svg(k)}</div>`;
function draw(){
 const q=U.equip||{};
 $("#ivs").innerHTML=SL.map(([id,n])=>`<div data-s="${id}" class="${id===act?"act":sel&&!act?"sel":""}">${q[id]?face(q[id]):'<div class="sk em"></div>'}<span>${n}</span></div>`).join("");
 const p=$("#ivp");p.hidden=!sel;
 if(sel){const d=SKA.get(sel);p.innerHTML=`<div class="ivh">${face(sel)}<div style="flex:1;min-width:0"><b>${d.n}</b><div class="mut" style="font-size:12px">${d.tn}${d.t==="K"?" · hanya As dan Joker":""}</div></div><button class="pri sec" data-a="play" style="flex:none;padding:4px 10px">Putar</button></div>`+(act?'<div class="ivu"><button class="pri sec" data-a="off">Lepas</button></div>':`<div class="ivu"><span class="mut" style="font-size:12px">Pakai di</span>${NS.filter(([s])=>SKA.canSlot(sel,s)).map(([s,n])=>`<button class="pri" data-a="on" data-s="${s}">${n}</button>`).join("")}</div>`)}
 const ks=Object.keys(U.skins||{}).sort((a,b)=>LV[SKA.get(b).t]-LV[SKA.get(a).t]||(a<b?-1:1));
 $("#ivl").innerHTML=ks.length?ks.map(k=>face(k,k===sel&&!act?" on":"")).join(""):'<span class="mut">Belum ada skin. Putar di Spin Skin.</span>';
 $("#ivl").querySelectorAll(".sk").forEach(el=>el.onpointerdown=e=>down(e,el))}
async function open(){
 $("#home").hidden=true;$("#iv").hidden=false;U={skins:{},equip:{}};sel=null;act=null;sm("");
 if(isG()){try{const v=await db.get("users/"+uid);if(v)U=Object.assign(U,v);U.skins=SKA.migrate(U.skins);U.equip=SKA.migrateEquip(U.equip)}catch(e){sm("Gagal memuat: "+(e.code||e.message))}}
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
 if(!SKA.canSlot(k,s)){draw();return sm("Kolektor hanya untuk slot As dan Joker.")}
 save(Object.assign({},U.equip,{[s]:k}));draw();sm("Terpasang.")}
function pick(k,a){sel=k;act=a;draw();pv()}
function pv(){try{const d=SKA.get(sel);playSetFx({t:d.t,v:d.v,k:d.k},uid,"",150,"Lawan")}catch(e){}}
function down(e,el){
 const k=el.dataset.k,x0=e.clientX,y0=e.clientY;let g=null;
 const mv=ev=>{
  if(!g&&Math.hypot(ev.clientX-x0,ev.clientY-y0)>8){g=el.cloneNode(true);g.classList.add("ivg");document.body.appendChild(g)}
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
 else if(b.dataset.a==="on")place(b.dataset.s,sel);
 else if(b.dataset.a==="off"){const q=Object.assign({},U.equip);delete q[act];sel=null;act=null;save(q);draw();sm("Dilepas.")}};
$("#ti").onclick=open;
$("#ivb").onclick=()=>{$("#iv").hidden=true;$("#home").hidden=false};
})();
