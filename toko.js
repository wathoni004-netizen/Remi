// Toko: beli kartu spin dengan koin. Data di users/{uid} (sama dengan spin.js). Skin belum dijual (belum ada tampilannya).
(()=>{
const PR={biru:100,merah:400};
let U={koin:0,biru:0,merah:0},busy=false;
const isG=()=>!!auth&&!!auth.currentUser&&!auth.currentUser.isAnonymous;
const sm=t=>{$("#twm").textContent=t||""};
const counts=()=>{$("#twk").textContent=(U.koin||0).toLocaleString("id-ID");$("#twb1").textContent=U.biru||0;$("#twm2").textContent=U.merah||0};
async function open(){
 $("#home").hidden=true;$("#tw").hidden=false;U={koin:0,biru:0,merah:0};sm("");
 if(isG()){try{const v=await db.get("users/"+uid);if(v)U=Object.assign(U,v)}catch(e){sm("Gagal memuat: "+(e.code||e.message))}}
 else sm("Masuk dengan Google di Pengaturan agar koin dan kartu tersimpan.");
 counts()}
async function buy(k){
 if(busy)return;
 if(!isG())return sm("Masuk dengan Google dulu (Pengaturan).");
 if((U.koin||0)<PR[k])return sm("Koin tidak cukup, perlu "+PR[k]+".");
 const nu=Object.assign({},U,{koin:U.koin-PR[k],[k]:(U[k]||0)+1});
 busy=true;
 try{await db.doc("users/"+uid).set(nu);U=nu;counts();sm("Berhasil beli 1 kartu "+k+".")}
 catch(e){sm("Gagal menyimpan: "+(e.code||e.message))}
 busy=false}
$("#tk").onclick=open;
$("#twb").onclick=()=>{$("#tw").hidden=true;$("#home").hidden=false};
$("#tw1").onclick=()=>buy("biru");$("#tw2").onclick=()=>buy("merah");
})();
