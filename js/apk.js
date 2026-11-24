// Hanya jalan di APK (Capacitor); di web langsung berhenti.
// Pembaruan otomatis: saat game dibuka, cek version.json di GitHub Pages; kalau lebih baru, tampil layar
// "Memperbarui game" di layar loading game, unduh semua berkas ke HP, lalu game dimuat ulang dengan versi baru.
(async()=>{
 const C=window.Capacitor;if(!(C&&C.isNativePlatform&&C.isNativePlatform()))return;
 const S="https://wathoni004-netizen.github.io/Remi/",F=C.Plugins.Filesystem,W=C.Plugins.WebView,D="DATA";
 // Batas 15 detik per berkas agar sinyal jelek tidak membuat layar pembaruan macet.
 const ambil=async u=>{const a=new AbortController(),t=setTimeout(()=>a.abort(),15000);
  try{const r=await fetch(u,{cache:"no-store",signal:a.signal});if(!r.ok)throw Error(r.status+" "+u);return r}finally{clearTimeout(t)}};
 let box;
 try{
  const cur=(await W.getServerBasePath()).path||"";
  if(cur.includes("/up")){
   await W.persistServerBasePath();// ingat versi ini; APK baru (versionCode naik) otomatis kembali ke berkas bawaan
   const now=cur.split("/").pop();
   for(const e of(await F.readdir({path:"",directory:D})).files)if(/^up\d+$/.test(e.name)&&e.name!==now)await F.rmdir({path:e.name,directory:D,recursive:true})
  }
  const lok=await(await ambil("version.json")).json(),baru=await(await ambil(S+"version.json?t="+Date.now())).json();
  if(!(baru.v>lok.v))return;
  // Pakai layar loading game yang sudah ada (#ld), bukan tampilan baru; bar jadi bar kemajuan unduhan.
  box=document.getElementById("ld").cloneNode(true);box.removeAttribute("id");box.hidden=false;
  box.style.cssText+=";position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;max-width:none;margin:0;border-radius:0;justify-content:center";
  const bar=box.querySelector(".pb i"),tx=box.querySelector(".mut"),n=baru.files.length,dir="up"+baru.v;
  bar.style.cssText="animation:none;width:0;transition:width .2s";tx.textContent="Memperbarui game…";
  document.body.appendChild(box);
  for(let i=0;i<n;i++){
   const f=baru.files[i],b=await(await ambil(S+f+"?t="+baru.v)).blob();
   const data=await new Promise((ok,no)=>{const r=new FileReader();r.onload=()=>ok(r.result.split(",")[1]);r.onerror=no;r.readAsDataURL(b)});
   await F.writeFile({path:dir+"/"+f,data,directory:D,recursive:true});
   bar.style.width=Math.round((i+1)/n*100)+"%";tx.textContent="Memperbarui game… "+(i+1)+" / "+n
  }
  await F.writeFile({path:dir+"/version.json",data:JSON.stringify(baru),directory:D,encoding:"utf8"});
  const{uri}=await F.getUri({path:dir,directory:D});
  await W.setServerBasePath({path:uri.replace(/^file:\/\//,"")});// game dimuat ulang dari versi baru
  W.persistServerBasePath()// langsung diingat, jangan menunggu halaman baru (kalau tidak, buka ulang app memuat berkas bawaan lagi)
 }catch(e){console.log("Pembaruan APK gagal:",e);if(box)box.remove()}// gagal: tetap main versi lama, dicoba lagi saat dibuka berikutnya
})();
