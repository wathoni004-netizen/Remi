// Skin Meja: kain, bingkai, dan hiasan tengah meja. Dipakai lewat slot "Meja" di Inventori (users/{uid}.equip.meja).
// Kunci M01..M03 disimpan di users/{uid}.skins bersama skin lain. Meja yang tampil di layar semua pemain = skin milik host (rooms/{room}/players/{host}.mk).
// t: S Spesial, E Epik, L Legenda (harga di toko.js). bg = latar kain, sh = bingkai (box-shadow), dc = hiasan tengah (SVG 100x100).
const MJK=(()=>{
const TN={S:"Spesial",E:"Epik",L:"Legenda"};
const G="#e8c35a",Y="#ffd24a",V="#a56bff";
const star=(c,o)=>`<path d="M50 14L58 40L86 40L63 57L72 84L50 67L28 84L37 57L14 40L42 40Z" fill="${c}" opacity="${o}"/>`;
const L=[
["M01","Beludru Merah","S",
 "radial-gradient(ellipse at 50% 45%,#8a1f2b 0,#5a0f1a 75%)",
 `inset 0 0 0 2px ${G},inset 0 0 0 5px #3a0810`,
 `<circle cx="50" cy="50" r="46" fill="none" stroke="${G}" stroke-width="1.6" opacity=".5"/><circle cx="50" cy="50" r="38" fill="none" stroke="${G}" stroke-width="1" stroke-dasharray="3 4" opacity=".5"/>`],
["M02","Malam Bintang","E",
 "radial-gradient(circle,rgba(255,255,255,.75) 0 1px,transparent 1.6px) 0 0/23px 23px,radial-gradient(circle,rgba(200,170,255,.6) 0 1px,transparent 1.6px) 11px 13px/29px 29px,radial-gradient(ellipse at 50% 40%,#2b2a6b 0,#14123a 65%,#07061a)",
 `inset 0 0 0 2px ${V},inset 0 0 0 5px #0b0926,0 0 12px ${V}`,
 `<circle cx="50" cy="50" r="46" fill="none" stroke="${V}" stroke-width="2" opacity=".6"/>${star("#fff",.35)}${star(V,.25)}<circle cx="50" cy="50" r="12" fill="none" stroke="#fff" stroke-width="1.4" opacity=".6"/>`],
["M03","Istana Emas","L",
 "repeating-linear-gradient(45deg,rgba(255,210,74,.13) 0 2px,transparent 2px 15px),repeating-linear-gradient(-45deg,rgba(255,210,74,.13) 0 2px,transparent 2px 15px),radial-gradient(ellipse at 50% 45%,#14503a,#0a2a1e)",
 `inset 0 0 0 2px ${Y},inset 0 0 0 5px #0a2a1e,inset 0 0 0 7px ${G},0 0 14px rgba(255,210,74,.55)`,
 `<circle cx="50" cy="50" r="46" fill="none" stroke="${Y}" stroke-width="2" opacity=".7"/><circle cx="50" cy="50" r="40" fill="none" stroke="${Y}" stroke-width="1" opacity=".5"/><path d="M28 68L31 38L43 53L50 32L57 53L69 38L72 68Z" fill="${Y}" opacity=".6" stroke="#7a3a00" stroke-width="1.2" stroke-linejoin="round"/><rect x="28" y="68" width="44" height="6" rx="1.5" fill="${G}" opacity=".7"/><circle cx="50" cy="28" r="2.6" fill="#fff" opacity=".8"/>`]
];
const D=L.map(x=>({k:x[0],n:x[1],t:x[2],tn:TN[x[2]],bg:x[3],sh:x[4],dc:x[5]}));
const get=k=>D.find(d=>d.k===k);
let css=".msp{position:relative;width:36px;height:50px;border-radius:6px;pointer-events:none;overflow:hidden}.msp::after{content:\"\";position:absolute;inset:0;background:var(--md) center/82% no-repeat}.tb #ring::before{content:\"\";position:absolute;inset:0;background:var(--md) center/auto 80% no-repeat;pointer-events:none}";
D.forEach(d=>{
 css+=`.tb.tm-${d.k},.msp.tm-${d.k}{background:${d.bg};box-shadow:${d.sh};--md:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${d.dc}</svg>`)}")}`});
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
// Pratinjau kecil untuk Inventori dan Toko.
const thumb=k=>`<div class="msp tm-${k}"></div>`;
// Nama kelas untuk meja (kosong bila kunci tidak dikenal).
const tm=k=>get(k)?"tm-"+k:"";
return{list:D,get,thumb,tm}})();
