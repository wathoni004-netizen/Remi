// Hanya jalan di APK (Capacitor); di web langsung berhenti.
// Pembaruan otomatis: saat game dibuka, cek version.json di GitHub Pages; kalau lebih baru, tampil layar
// "Memperbarui game" di layar loading game, unduh semua berkas ke HP, lalu game dimuat ulang dengan versi baru.
window.apkReady=(async()=>{
 const C=window.Capacitor;if(!(C&&C.isNativePlatform&&C.isNativePlatform()))return;
 const S="https://wathoni004-netizen.github.io/Remi/",F=C.Plugins.Filesystem,W=C.Plugins.WebView,D="DATA";
 // Batas waktu per permintaan: cek versi 5 detik, unduh berkas 15 detik (sinyal jelek tidak membuat layar macet).
 const ambil=async(u,ms)=>{const a=new AbortController(),t=setTimeout(()=>a.abort(),ms||15000);
  try{const r=await fetch(u,{cache:"no-store",signal:a.signal});if(!r.ok)throw Error(r.status+" "+u);return r}finally{clearTimeout(t)}};
 const ld=document.getElementById("ld"),bar=ld&&ld.querySelector(".pb i"),tx=ld&&ld.querySelector(".mut");
 try{
  const cur=(await W.getServerBasePath()).path||"";
  // Capacitor kadang tidak mengingat folder unduhan: kembali sendiri ke unduhan terakhir (hanya bila lebih baru dari berkas bawaan), tanpa unduh ulang.
  const ud=localStorage.getItem("ud");
  if(ud&&!cur.includes("/up")){try{const bw=await(await ambil("version.json",5000)).json();
   if(+ud.slice(2)>bw.v){await F.stat({path:ud+"/index.html",directory:D});const{uri}=await F.getUri({path:ud,directory:D});await W.setServerBasePath({path:uri.replace(/^file:\/\//,"").replace(/\/+$/,"")});await new Promise(()=>{})}}catch(e){localStorage.removeItem("ud")}}
  if(cur.includes("/up")){
   await W.persistServerBasePath();// ingat versi ini; APK baru (versionCode naik) otomatis kembali ke berkas bawaan
   const now=cur.replace(/\/+$/,"").split("/").pop();// tanpa garis miring di akhir; kalau tidak, folder yang sedang dipakai ikut terhapus
   if(/^up\d+$/.test(now))for(const e of(await F.readdir({path:"",directory:D})).files)if(/^up\d+$/.test(e.name)&&e.name!==now)await F.rmdir({path:e.name,directory:D,recursive:true})
  }
  const lok=await(await ambil("version.json",5000)).json(),baru=await(await ambil(S+"version.json?t="+Date.now(),5000)).json();
  if(!(baru.v>lok.v))return;
  // Satu layar saja: layar loading game (#ld) itu sendiri; bar berubah jadi bar kemajuan unduhan.
  const n=baru.files.length,dir="up"+baru.v;
  bar.style.cssText="animation:none;width:0;transition:width .2s";tx.textContent="Memperbarui game…";
  for(let i=0;i<n;i++){
   const f=baru.files[i],b=await(await ambil(S+f+"?t="+baru.v)).blob();
   const data=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result.split(",")[1]);r.onerror=no;r.readAsDataURL(b)});
   await F.writeFile({path:dir+"/"+f,data,directory:D,recursive:true});
   bar.style.width=Math.round((i+1)/n*100)+"%";tx.textContent="Memperbarui game… "+(i+1)+" / "+n
  }
  await F.writeFile({path:dir+"/version.json",data:JSON.stringify(baru),directory:D,encoding:"utf8"});
  try{localStorage.setItem("ud",dir)}catch(e){}
  const{uri}=await F.getUri({path:dir,directory:D});
  await W.setServerBasePath({path:uri.replace(/^file:\/\//,"").replace(/\/+$/,"")});// game dimuat ulang dari versi baru
  W.persistServerBasePath();// langsung diingat, jangan menunggu halaman baru
  await new Promise(()=>{})// halaman sedang dimuat ulang: tahan layar loading sampai berganti
 }catch(e){console.log("Pembaruan APK gagal:",e);if(bar){bar.style.cssText="";tx.textContent="Memuat…"}}// gagal: tetap main versi lama, dicoba lagi saat dibuka berikutnya
})();
