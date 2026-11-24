// Layar Profil: nama, gelar, saldo, statistik dan jumlah skin (users/{uid}), ganti nama. Dibuka dengan menekan blok pemain di menu.
(()=>{
const isG=()=>!!auth&&!!auth.currentUser&&!auth.currentUser.isAnonymous;
let U=null;
// Gelar tertinggi yang sudah dicapai (dihitung dari statistik, tidak disimpan).
const gelar=t=>t.w>=200?"Raja Kampung":t.s>=25?"Raja Set":t.w>=20?"Jago Kampung":t.m>=10?"Pemain Kampung":"Pemain Baru";
function ui(){
 const g=isG();$("#pgl").hidden=g;$("#pgb").hidden=!(g&&U);$("#pgg").hidden=true;
 if(!(g&&U))return;
 const t=U.st||{};
 $("#stm").textContent=t.m||0;$("#stw").textContent=t.w||0;$("#sts").textContent=t.s||0;$("#pgg").textContent=gelar(t);$("#pgg").hidden=false;
 const all=[...SKA.list,...KSK.list,...MJK.list],n=all.filter(d=>U.skins[d.k]).length;
 $("#pgk").textContent=(U.koin||0).toLocaleString("id-ID");$("#pgu").textContent=U.biru||0;$("#pgm").textContent=U.merah||0;
 $("#pgo").textContent=n+" / "+all.length;$("#pgp").style.width=Math.round(n/all.length*100)+"%"}
async function load(){
 U=null;
 if(isG()){try{U=Object.assign({koin:0,biru:0,merah:0,skins:{}},await db.get("users/"+uid));U.skins=SKA.migrate(U.skins||{})}catch(e){}}
 ui()}
window.pfUI=()=>{if(!$("#pg").hidden)load()};
$("#mpb").onclick=()=>{menuUI();$("#home").hidden=true;$("#pg").hidden=false;load()};
$("#mpb").onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();$("#mpb").click()}};
// Ganti nama: tekan sekali membuka kolom nama, tekan lagi menyimpan (nama dipakai saat masuk ruang).
$("#pgr").onclick=()=>{const i=$("#pgi");
 if(i.hidden){i.value=($("#nm").value||"").trim();i.hidden=false;i.focus();$("#pgr").textContent="Simpan";return}
 const n=i.value.trim().slice(0,16);
 if(n){$("#nm").value=n;try{localStorage.setItem("rn",n)}catch(e){}}
 i.hidden=true;$("#pgr").textContent="Ganti nama";menuUI()};
$("#pgi").onkeydown=e=>{if(e.key==="Enter")$("#pgr").click()};
})();
