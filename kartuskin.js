// Skin Kartu: tampilan punggung dan wajah kartu. Dipakai lewat slot "Kartu" di Inventori (users/{uid}.equip.kartu).
// Kunci C01..C05 disimpan di users/{uid}.skins bersama skin Set. Pemilik memasang skin, kunci ikut disimpan di rooms/{room}/players/{uid}.ck supaya semua pemain melihatnya.
// t: S Spesial, E Epik (harga di toko.js). b = latar punggung, bd = garis punggung, f = latar wajah, fc/fr = warna simbol hitam/merah, fb = garis wajah, g = cahaya (opsional).
const KSK=(()=>{
const TN={S:"Spesial",E:"Epik",L:"Legenda"};
const L=[
["C01","Emas Klasik","S","repeating-linear-gradient(45deg,#7a5a14 0 4px,#e8c35a 4px 6px)","#fff6d0","#fff8e1","#3a2a05","#b3261e","#d9b24a"],
["C02","Samudra","S","repeating-linear-gradient(135deg,#0b3a66 0 5px,#2a7fc1 5px 8px)","#bfe4ff","#eaf6ff","#0b2a4a","#c0392b","#5aa7de"],
["C03","Hutan","S","repeating-linear-gradient(0deg,#134a2a 0 4px,#2f8f55 4px 7px)","#d3f5df","#effaf2","#123a22","#c0392b","#4cae73"],
["C04","Giok Ungu","E","radial-gradient(circle,#d9b8ff 0 10%,transparent 12%) 0 0/9px 9px,repeating-linear-gradient(45deg,#3b1a6b 0 4px,#6d38b8 4px 8px)","#ead9ff","#f6eeff","#2a1050","#c2185b","#9a62e0","0 0 8px #b07cff"],
["C05","Senja","E","linear-gradient(160deg,#ff9a3c,#c2185b 55%,#3b1a6b)","#ffe2c2","linear-gradient(160deg,#fff4e6,#ffe0e8)","#3b1a2a","#c62828","#ff8a50","0 0 8px #ff8a50"]
];
const D=L.map(x=>({k:x[0],n:x[1],t:x[2],tn:TN[x[2]],b:x[3],bd:x[4],f:x[5],fc:x[6],fr:x[7],fb:x[8],g:x[9]||""}));
const get=k=>D.find(d=>d.k===k);
let css=".ksp{position:relative;width:36px;height:50px;pointer-events:none}.ksp .c{position:absolute;width:26px;height:38px;font-size:11px;border-radius:4px}.ksp .c.back{left:0;top:9px;transform:rotate(-9deg)}.ksp .c:not(.back){left:10px;top:3px;transform:rotate(7deg)}";
D.forEach(d=>{
 css+=`.c.back.kb-${d.k}{background:${d.b}!important;border-color:${d.bd}!important${d.g?";box-shadow:"+d.g:""}}`;
 css+=`.c.kf-${d.k}{background:${d.f};border-color:${d.fb};color:${d.fc}${d.g?";box-shadow:"+d.g:""}}.c.kf-${d.k}.r{color:${d.fr}}`});
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
// Pratinjau: punggung dan wajah (A sekop) berdampingan. Dipakai di Inventori dan Toko.
const thumb=k=>`<div class="ksp"><span class="c back sm kb-${k}"></span><span class="c sm kf-${k}"><i class="rk">${GL.rk("A")}${GL.su("S")}</i><i class="ct">${GL.su("S")}</i></span></div>`;
// Nama kelas untuk pemilik tertentu (kosong bila kunci tidak dikenal, jadi data ngawur tidak merusak tampilan).
const kb=k=>get(k)?" kb-"+k:"",kf=k=>get(k)?" kf-"+k:"";
return{list:D,get,thumb,kb,kf}})();
