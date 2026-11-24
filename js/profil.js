// Layar Profil: nama, gelar, saldo, statistik dan jumlah skin (users/{uid}), ganti nama. Dibuka dengan menekan blok pemain di menu.
(()=>{
const isG=()=>!!auth&&!!auth.currentUser&&!auth.currentUser.isAnonymous;
let U=null;
// Gelar tertinggi yang sudah dicapai (1-5, dihitung dari statistik, tidak disimpan). 0 = tamu.
const GN=["","Pemain Baru","Pemain Kampung","Jago Kampung","Raja Set","Raja Kampung"],
 lv=t=>(t=t||{},t.w>=200?5:t.s>=25?4:t.w>=20?3:t.m>=10?2:1);
// Medali per gelar (SVG, siluet beda: bulat, segel, perisai, segel+pita+sekop, segel+pita+mahkota+daun). Detail daun hanya di ukuran besar.
const MCL=["",["#c4ccd2","#6f7a82"],["#e0985a","#8a4d1c"],["#f4f7f9","#8f9aa3"],["#ffe27a","#b9860b"],["#fff1a8","#d99a00"]],
 SEG=(()=>{const a=[];for(let k=0;k<32;k++){const r=k%2?8.3:9.7,t=k*Math.PI/16;a.push((12+r*Math.sin(t)).toFixed(2)+","+(11-r*Math.cos(t)).toFixed(2))}return a.join(" ")})(),
 PIT='<polygon points="7,17.5 5.5,23.5 8.4,22 10,23.8 11.2,18" fill="#b3261e"/><polygon points="17,17.5 18.5,23.5 15.6,22 14,23.8 12.8,18" fill="#b3261e"/>',
 LAU=(()=>{let o="";for(const x of[-1,1])for(let k=0;k<6;k++){const d=95+k*16,t=d*Math.PI/180,px=(12+x*11.3*Math.sin(t)).toFixed(1),py=(11-11.3*Math.cos(t)).toFixed(1);o+=`<ellipse cx="${px}" cy="${py}" rx="2.3" ry="1" transform="rotate(${-x*d+x*45} ${px} ${py})" fill="#b07a0a"/>`}return o})(),
 SPA='<path d="M12 6C12 6 7.5 9 7.5 12c0 1.6 1.5 2.4 2.7 1.8-.2 1.2-.6 1.8-1.2 2.4h6c-.6-.6-1-1.2-1.2-2.4 1.2.6 2.7-.2 2.7-1.8C16.5 9 12 6 12 6z" fill="#5a3d00"/>',
 CRN='<path d="M7.5 14.5V8.5L10 11l2-3.6 2 3.6 2.5-2.5v6z" fill="#7a1410"/>',
 SHP={1:'<circle cx="12" cy="11" r="8.6" fill="url(#mg1)" stroke="#5d676f" stroke-width=".8"/><circle cx="12" cy="11" r="2.4" fill="#fff"/>',
  2:`<polygon points="${SEG}" fill="url(#mg2)" stroke="#6b3a12" stroke-width=".7"/><circle cx="12" cy="11" r="6" fill="none" stroke="#fff" stroke-opacity=".55"/><polygon points="12,7 13,10 16,10.2 13.7,12.1 14.5,15 12,13.4 9.5,15 10.3,12.1 8,10.2 11,10" fill="#fff"/>`,
  3:'<polygon points="12,1.8 20,6.4 20,15.6 12,20.2 4,15.6 4,6.4" fill="url(#mg3)" stroke="#6c7780" stroke-width=".8"/><polygon points="12,4.6 17.6,7.8 17.6,14.2 12,17.4 6.4,14.2 6.4,7.8" fill="none" stroke="#fff" stroke-opacity=".8"/><polygon points="12,7 13,10 16,10.2 13.7,12.1 14.5,15 12,13.4 9.5,15 10.3,12.1 8,10.2 11,10" fill="#4a545c"/>',
  4:`${PIT}<polygon points="${SEG}" fill="url(#mg4)" stroke="#8a6200" stroke-width=".7"/><circle cx="12" cy="11" r="6.4" fill="none" stroke="#fff" stroke-opacity=".6"/>${SPA}`,
  5:`${PIT}<polygon points="${SEG}" fill="url(#mg5)" stroke="#d7263d" stroke-width="1.1"/><circle cx="12" cy="11" r="6.4" fill="none" stroke="#fff" stroke-opacity=".7"/>${CRN}`};
window.medal=(g,z)=>{if(!(g>0&&g<6))return"";z=z||16;const c=MCL[g];
 return`<svg class="md" width="${z}" height="${z}" viewBox="0 0 24 24"><defs><linearGradient id="mg${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs>${g===5&&z>=40?LAU:""}${SHP[g]}</svg>`};
window.GG=0;
function ui(){
 const g=isG();$("#pgl").hidden=g;$("#pgb").hidden=!(g&&U);$("#pgg").hidden=true;
 if(!(g&&U))return;
 const t=U.st||{};
 $("#stm").textContent=t.m||0;$("#stw").textContent=t.w||0;$("#sts").textContent=t.s||0;$("#pgg").innerHTML=medal(lv(t),20)+" "+GN[lv(t)];$("#pgg").hidden=false;
 const all=[...SKA.list,...KSK.list,...MJK.list],n=all.filter(d=>U.skins[d.k]).length;
 $("#pgk").textContent=(U.koin||0).toLocaleString("id-ID");$("#pgu").textContent=U.biru||0;$("#pgm").textContent=U.merah||0;
 $("#pgo").textContent=n+" / "+all.length;$("#pgp").style.width=Math.round(n/all.length*100)+"%"}
async function load(){
 U=null;
 if(isG()){try{U=Object.assign({koin:0,biru:0,merah:0,skins:{}},await db.get("users/"+uid));U.skins=SKA.migrate(U.skins||{})}catch(e){}}
 GG=U?lv(U.st):0;ui()}
window.pfUI=()=>{if(!$("#pg").hidden||(isG()&&!U))load();else if(!isG()){U=null;GG=0}};
window.pfLv=lv;
// Di APK: tampilkan versi game yang sedang jalan dan asalnya (unduhan = hasil pembaruan, bawaan APK = berkas di dalam APK).
// Menu utama: versi game dari version.json (sama dengan yang dipakai pembaruan APK).
fetch("version.json",{cache:"no-store"}).then(r=>r.json()).then(j=>{$("#hv").textContent="2–4 pemain · versi "+j.v}).catch(()=>{});
const ver=()=>{const C=window.Capacitor;if(!(C&&C.isNativePlatform&&C.isNativePlatform()))return;
 fetch("version.json",{cache:"no-store"}).then(r=>r.json()).then(async j=>{const p=(await C.Plugins.WebView.getServerBasePath()).path||"";$("#pgv").textContent="Game v"+j.v+(p.includes("/up")?" · unduhan":" · bawaan APK")}).catch(()=>{})};
$("#mpb").onclick=()=>{menuUI();ver();$("#home").hidden=true;$("#pg").hidden=false;load()};
$("#mpb").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();$("#mpb").click()}};
// Ganti nama: tekan sekali membuka kolom nama, tekan lagi menyimpan (nama dipakai saat masuk ruang).
$("#pgr").onclick=()=>{const i=$("#pgi");
 if(i.hidden){i.value=($("#nm").value||"").trim();i.hidden=false;i.focus();$("#pgr").textContent="Simpan";return}
 const n=i.value.trim().slice(0,16);
 if(n){$("#nm").value=n;try{localStorage.setItem("rn",n)}catch(e){}}
 i.hidden=true;$("#pgr").textContent="Ganti nama";menuUI()};
$("#pgi").onkeydown=e=>{if(e.key==="Enter")$("#pgr").click()};
})();
