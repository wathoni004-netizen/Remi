// Layar Profil: nama, gelar, saldo, statistik dan jumlah skin (users/{uid}), ganti nama. Dibuka dengan menekan blok pemain di menu.
(()=>{
const isG=()=>!!auth&&!!auth.currentUser&&!auth.currentUser.isAnonymous;
let U=null;
// Gelar tertinggi yang sudah dicapai (1-5, dihitung dari statistik, tidak disimpan). 0 = tamu.
const GN=["","Pemain Baru","Pemain Kampung","Jago Kampung","Raja Set","Raja Kampung"],
 lv=t=>(t=t||{},t.w>=200?5:t.s>=25?4:t.w>=20?3:t.m>=10?2:1);
// Medali kecil per gelar: lingkaran warna + lambang (titik, bintang, bintang, berlian, mahkota) + pita.
const MC=["","#8a949c","#c07a3a","#cfd6dc","#e8b923","#ffd54a"],
 MG=["",'<circle cx="8" cy="6" r="1.6" fill="#fff"/>','<polygon points="8,3.2 8.9,5.2 11.1,5.4 9.4,6.8 9.9,9 8,7.9 6.1,9 6.6,6.8 4.9,5.4 7.1,5.2" fill="#fff"/>','<polygon points="8,3.2 8.9,5.2 11.1,5.4 9.4,6.8 9.9,9 8,7.9 6.1,9 6.6,6.8 4.9,5.4 7.1,5.2" fill="#555"/>','<polygon points="8,2.8 11.2,6 8,9.2 4.8,6 " fill="#fff"/>','<polygon points="4.8,8.2 4.8,4 6.6,5.6 8,3.4 9.4,5.6 11.2,4 11.2,8.2" fill="#b3261e"/>'];
window.medal=(g,z)=>g>0&&g<6?`<svg class="md" width="${z||16}" height="${z||16}" viewBox="0 0 16 16"><path d="M4.5 10 3 15l2.5-1.2L8 15.2l-.8-5.2zM11.5 10 13 15l-2.5-1.2L8 15.2l.8-5.2z" fill="#b33"/><circle cx="8" cy="6" r="5.4" fill="${MC[g]}" stroke="${g===5?"#d7263d":"#0006"}" stroke-width="${g===5?1.4:1}"/>${MG[g]}</svg>`:"";
window.GL=0;
function ui(){
 const g=isG();$("#pgl").hidden=g;$("#pgb").hidden=!(g&&U);$("#pgg").hidden=true;
 if(!(g&&U))return;
 const t=U.st||{};
 $("#stm").textContent=t.m||0;$("#stw").textContent=t.w||0;$("#sts").textContent=t.s||0;$("#pgg").innerHTML=medal(lv(t),18)+" "+GN[lv(t)];$("#pgg").hidden=false;
 const all=[...SKA.list,...KSK.list,...MJK.list],n=all.filter(d=>U.skins[d.k]).length;
 $("#pgk").textContent=(U.koin||0).toLocaleString("id-ID");$("#pgu").textContent=U.biru||0;$("#pgm").textContent=U.merah||0;
 $("#pgo").textContent=n+" / "+all.length;$("#pgp").style.width=Math.round(n/all.length*100)+"%"}
async function load(){
 U=null;
 if(isG()){try{U=Object.assign({koin:0,biru:0,merah:0,skins:{}},await db.get("users/"+uid));U.skins=SKA.migrate(U.skins||{})}catch(e){}}
 GL=U?lv(U.st):0;ui()}
window.pfUI=()=>{if(!$("#pg").hidden||(isG()&&!U))load();else if(!isG()){U=null;GL=0}};
window.pfLv=lv;
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
