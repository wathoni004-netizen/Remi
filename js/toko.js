// Toko: beli kartu spin, skin Set, skin Kartu (kartuskin.js), dan skin Meja (mejaskin.js) dengan koin. Data di users/{uid} (sama dengan spin.js). Kolektor tidak dijual (event terbatas).
// Harga kartu = nilai rata-rata hadiahnya (lihat peluang di spin.js); harga skin = target jumlah ronde menang x ~100 koin (Spesial 10, Epik 30, Legenda 90 ronde).
(()=>{
const PR={biru:50,merah:650},PS={S:1000,E:3000,L:9000},LV={S:1,E:2,L:3};
let U={koin:0,biru:0,merah:0,skins:{}},busy=false;
const isG=()=>!!auth&&!!auth.currentUser&&!auth.currentUser.isAnonymous;
const sm=t=>{$("#twm").textContent=t||""};
const counts=()=>{$("#twk").textContent=(U.koin||0).toLocaleString("id-ID");$("#twb1").textContent=U.biru||0;$("#twm2").textContent=U.merah||0};
function tile(d,art){const own=!!(U.skins||{})[d.k];return `<button class="tci${own?" own":""}" data-k="${d.k}" aria-label="${d.n}, ${d.tn}, ${PS[d.t]} koin"><div class="sk">${art}${SKA.tag(d.t,"lbl lbs")}</div><span>${d.n}</span>${own?"<span>✓</span>":`<span class="tpr"><i></i>${PS[d.t].toLocaleString("id-ID")}</span>`}</button>`}
const hd=t=>`<div style="width:100%;font-weight:800;font-size:13px;color:#e8b923">${t}</div>`;
function list(){
 const srt=(a,b)=>LV[a.t]-LV[b.t],ds=SKA.list.filter(d=>PS[d.t]).sort(srt),ks=KSK.list.slice().sort(srt),ms=MJK.list.slice().sort(srt);
 $("#tsk").innerHTML=hd("Skin Set")+ds.map(d=>tile(d,SKA.svg(d.k))).join("")+hd("Skin Kartu")+ks.map(d=>tile(d,KSK.thumb(d.k))).join("")+hd("Skin Meja")+ms.map(d=>tile(d,MJK.thumb(d.k))).join("")}
async function open(){
 $("#home").hidden=true;$("#tw").hidden=false;U={koin:0,biru:0,merah:0,skins:{}};sm("");
 if(isG()){try{const v=await db.get("users/"+uid);if(v)U=Object.assign(U,v);U.skins=SKA.migrate(U.skins)}catch(e){sm("Gagal memuat: "+(e.code||e.message))}}
 else sm("Masuk dengan Google di Pengaturan agar koin dan kartu tersimpan.");
 counts();list()}
async function put(nu,ok){
 busy=true;
 try{await db.doc("users/"+uid).set(nu);U=nu;counts();list();sm(ok)}
 catch(e){sm("Gagal menyimpan: "+(e.code||e.message))}
 busy=false}
function buy(k){
 if(busy)return;
 if(!isG())return sm("Masuk dengan Google dulu (Pengaturan).");
 if((U.koin||0)<PR[k])return sm("Koin tidak cukup, perlu "+PR[k]+".");
 put(Object.assign({},U,{koin:U.koin-PR[k],[k]:(U[k]||0)+1}),"Berhasil beli 1 kartu "+k+".")}
function buySkin(k){
 if(busy)return;
 const d=SKA.get(k)||KSK.get(k)||MJK.get(k),p=PS[d.t];
 if(!isG())return sm("Masuk dengan Google dulu (Pengaturan).");
 if((U.skins||{})[k])return sm("Skin "+d.n+" sudah dimiliki.");
 if((U.koin||0)<p)return sm("Koin tidak cukup, perlu "+p+".");
 if(!confirm("Beli skin "+d.n+" ("+d.tn+") seharga "+p+" koin?"))return;
 put(Object.assign({},U,{koin:U.koin-p,skins:Object.assign({},U.skins,{[k]:true})}),"Berhasil beli skin "+d.n+".")}
$("#tk").onclick=open;
$("#twb").onclick=()=>{$("#tw").hidden=true;$("#home").hidden=false};
$("#tw1").onclick=()=>buy("biru");$("#tw2").onclick=()=>buy("merah");
$("#tsk").onclick=e=>{const b=e.target.closest("[data-k]");if(b)buySkin(b.dataset.k)};
})();
