// Panduan bergambar untuk pemain baru: muncul sekali di menu pertama kali, bisa dibuka lagi dari Profil.
// Tombol Lewati paling depan di DOM supaya tombol Kembali HP (net.js) menutupnya.
(()=>{
const K=(...c)=>`<span class="pdk">${c.map(x=>card(x,"span",0,"sm lc")).join("")}</span>`;
const HAL=[
 ["Tujuan permainan",`<p>Tiap pemain mendapat <b>7 kartu</b>. Susun kartu menjadi kombinasi untuk mengumpulkan poin. Kartu yang tidak jadi <b>mengurangi</b> poin.</p>${K("S5","S6","S7")}${K("H13","D13","C13")}`],
 ["Dua jenis kombinasi",`<p><b>Seri</b>: 3-4 angka berurutan, jenis sama.</p>${K("H5","H6","H7")}<p><b>Rell</b>: 3-4 kartu angka sama.</p>${K("S9","H9","D9")}<p><b>Joker</b> bisa menggantikan 1 kartu. Seri harus turun lebih dulu sebelum rell.</p>${K("C3","X1","C5")}`],
 ["Saat giliranmu",`<p>1. <b>Cabut</b> 1 kartu, atau <b>makan</b> dari 5 kartu buangan teratas (wajib langsung diturunkan).</p><p>2. <b>Turunkan</b> kombinasi kalau mau: ketuk kartunya, lalu Turunkan.</p><p>3. <b>Buang</b> 1 kartu. Joker tidak boleh dibuang.</p><p>⏱ Waktu <b>1 menit</b>. Kalau habis, kartu dicabut dan dibuang otomatis.</p>`],
 ["Set",`<p>Kalau buangan pemain sebelumnya membuat <b>semua kartumu jadi</b> (dengan menukar 1 kartu), tekan <b>Set</b>.</p><p>Poinmu bertambah, pemain yang di-set berkurang sebanyak itu, dan ronde selesai.</p>`],
 ["Poin",`<p>2-10 = <b>5</b><br>J, Q, K = <b>10</b><br>As = <b>15</b><br>Joker = <b>25</b></p>${K("H8","S12","D14","X2")}<p>Aturan lengkap ada di <b>Profil &gt; Aturan main</b>. Coba dulu lewat <b>Lawan Bot</b>.</p>`]];
function panduan(){
 let n=0;const o=document.createElement("div");o.className="ask";
 const draw=()=>{const akhir=n===HAL.length-1;o.innerHTML=`<div class="ab" style="display:flex;flex-direction:column;max-height:88vh"><div class="act" style="order:9"><button class="pri sec" data-a="x">${akhir?"Tutup":"Lewati"}</button>${n?'<button class="pri sec" data-a="p">Kembali</button>':""}${akhir?"":'<button class="pri" data-a="n">Lanjut</button>'}</div><p><b>${HAL[n][0]}</b> <span class="mut">${n+1}/${HAL.length}</span></p><div class="pdi">${HAL[n][1]}</div></div>`};
 o.onclick=e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;if(a==="x")return o.remove();n+=a==="n"?1:-1;draw()};
 draw();document.body.append(o)}
const css=document.createElement("style");css.textContent=".pdi{overflow:auto;font-size:14px;line-height:1.5}.pdi p{margin:8px 0;font-size:14px}.pdk{display:flex;justify-content:center;gap:4px;margin:6px 0}.pdk .c{position:relative;margin:0;flex:none}";document.head.append(css);
$("#bpd").onclick=panduan;
// Hanya untuk yang benar-benar baru (belum pernah mengisi nama / masuk ruang).
let baru=false;try{baru=!localStorage.getItem("pd")&&!localStorage.getItem("rn")&&!localStorage.getItem("rr")}catch(e){}
if(baru){const t=setInterval(()=>{if($("#home").hidden)return;clearInterval(t);try{localStorage.setItem("pd","1")}catch(e){}panduan()},500)}
})();
