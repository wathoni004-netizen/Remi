async function leave(){if(window.BOT)return location.reload();try{localStorage.removeItem("rn");localStorage.removeItem("rr")}catch(e){}try{await db.doc(`rooms/${room}/players/${uid}`).set({name:(players[uid]||{}).name||"Pemain",t:0})}catch(e){}location.reload()}
let auth,M,db,uid,room="",players={},st=null,sel=[],ord=[],auto=true,AC=null,snd=true,chat={},chatInit=false,wasMine=false,sig="",wasDone=false,drag=null,pend=false,noclick=false,kickOut=false;
// Pemain di-kick: st.kk[id] = nilai j pemain saat di-kick. Masuk ulang membuat j baru, jadi tidak lagi cocok (tanpa bergantung jam).
const kicked=i=>!!(st&&st.kk&&players[i]&&st.kk[i]!=null&&st.kk[i]===(players[i].j||0));
const live=i=>players[i]&&players[i].t>Date.now()-18e4&&!kicked(i);
const nm=i=>(st&&st.names&&st.names[i])||(players[i]&&players[i].name)||"?";
const msg=t=>{$("#err").textContent=t};
const save=async o=>{if(window.BOT)return botSave(o);try{await db.doc("rooms/"+room).set(o);msg("")}catch(e){msg("Gagal menyimpan: "+(e.message||e.code))}};
// Host = pembuat ruang (st.host) selama masih aktif; kalau tidak aktif, pemain aktif yang masuk paling awal.
const hostId=()=>{const L=Object.keys(players).filter(live);if(st&&st.host&&L.includes(st.host))return st.host;return L.sort((a,b)=>(players[a].j||players[a].t)-(players[b].j||players[b].t))[0]||""};
const gen=()=>(st&&st.gen)||0;
const isOk=i=>i===hostId()||(!!players[i]&&players[i].ok===gen());
const pdoc=o=>{const p=players[uid]||{},r={name:p.name||"Pemain",t:Date.now()};["rd","j","ok","ck","mk"].forEach(k=>{if(p[k]!=null)r[k]=p[k]});if(window.GG)r.g=window.GG;return Object.assign(r,o||{})};
const FBC={apiKey:"AIzaSyD7iXbT11b_qqc0n97JhQ0SxdhBzx-UDg8",authDomain:"remi-online-69bb6.firebaseapp.com",databaseURL:"https://remi-online-69bb6-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"remi-online-69bb6",storageBucket:"remi-online-69bb6.firebasestorage.app",messagingSenderId:"386908271555",appId:"1:386908271555:web:e9a238988ceb869ecb8376"};
const CDN="https://www.gstatic.com/firebasejs/10.12.2/";
// State ruang ditulis pemain lain: JANGAN dipercaya. Kartu harus kode yang sah, angka dipaksa angka (sebagian masuk innerHTML).
const KR=c=>typeof c==="string"&&/^([SHDC]([2-9]|1[0-4])|X[12])$/.test(c);
const obj=o=>o&&typeof o==="object"?o:{},peta=(o,f)=>Object.fromEntries(Object.entries(obj(o)).map(([k,x])=>[k,f(x)]));
const krt=a=>Object.values(obj(a)).filter(KR),ang=x=>Number(x)||0;
const norm=v=>{if(!v)return v;v.deck=krt(v.deck);v.pile=krt(v.pile);v.hands=peta(v.hands,krt);
 v.laid=peta(v.laid,L=>Object.values(obj(L)).filter(m=>typeof m==="string"&&m.split(",").every(KR)));
 v.order=Object.values(obj(v.order)).filter(i=>typeof i==="string");v.order.forEach(i=>{v.hands[i]=v.hands[i]||[]});
 v.eat=KR(v.eat)?v.eat:"";if(!KR(v.sx))delete v.sx;
 const d=v.sk&&SKA.get(v.sk.k);if(d)v.sk={t:d.t,v:d.v,k:d.k};else delete v.sk;
 if(v.sc)v.sc=peta(v.sc,ang);v.fb=peta(v.fb,f=>peta(f,ang));
 v.hist=Object.values(obj(v.hist)).map(r=>Object.assign({},obj(r),{sc:peta(obj(r).sc,ang)}));
 return v};
const map=p=>p.replace(/^rooms\/([^/]+)$/,"rooms/$1/state");
(async()=>{
 const t0=Date.now();
 try{
  let id=new URLSearchParams(location.search).get("u");
  if(!id){try{id=localStorage.getItem("rid");if(!id){id="u"+Math.random().toString(36).slice(2,10);localStorage.setItem("rid",id)}}catch(e){}}
  uid=id||"u"+Math.random().toString(36).slice(2,10);
  M=window.__FBMOCK||{
   a:await import(CDN+"firebase-app.js"),
   d:await import(CDN+"firebase-database.js"),
   au:await import(CDN+"firebase-auth.js")
  };
  const app=M.a.initializeApp(FBC);
  auth=M.au.getAuth(app);
  // Pakai sesi yang tersimpan (anonim atau Google); anonim baru hanya jika belum ada sesi, agar login Google tidak tertimpa.
  if(auth.authStateReady)await auth.authStateReady();
  uid=(auth.currentUser||(await M.au.signInAnonymously(auth)).user).uid;
  authUI();
  const d=M.d,rdb=d.getDatabase(app);
  db={doc:p=>({set:o=>d.set(d.ref(rdb,map(p)),o),onSnapshot:(f,e)=>d.onValue(d.ref(rdb,map(p)),s=>{const v=s.val();f({exists:v!==null,data:()=>norm(v)})},e)}),
   get:p=>d.get(d.ref(rdb,p)).then(s=>s.val()),
   collection:p=>({onSnapshot:(f,e)=>d.onValue(d.ref(rdb,p),s=>{const v=s.val()||{};f({docs:Object.keys(v).map(k=>({id:k,data:()=>v[k]}))})},e)})};
  // Layar judul tiap kali dibuka. Kode ruang: dari link undangan ?r=kode; kalau tidak ada, kosong.
  // Ruang yang belum ditinggalkan lewat tombol Keluar (sr) dicek; kalau game-nya masih berjalan dan pemain ini
  // anggotanya, tampil kartu "Game berjalan" dengan tombol Gabung (untuk pemain yang tidak sengaja keluar).
  const ur=(new URLSearchParams(location.search).get("r")||"").toUpperCase();
  let sr="";try{const sn=localStorage.getItem("rn");sr=localStorage.getItem("rr")||"";if(sn)$("#nm").value=sn}catch(e){}
  $("#rm").value=ur;
  if(sr)db.get(`rooms/${sr}/state`).then(s=>{if(s&&(s.status==="play"||s.status==="done")&&(s.order||[]).includes(uid)){$("#rsk").textContent=sr.toUpperCase();$("#rs").hidden=false}}).catch(()=>{});
  $("#rg").onclick=()=>{$("#rm").value=sr;$("#jb").click()};
  if(window.apkReady)await window.apkReady;// APK: layar loading ini sekaligus mengecek (dan menampilkan) pembaruan
  await new Promise(r=>setTimeout(r,Math.max(0,1200-(Date.now()-t0))));
  menuUI();$("#ld").hidden=true;$("#home").hidden=false;
 }catch(e){$("#ld").hidden=true;$("#home").hidden=false;msg("Gagal menghubungkan Firebase: "+(e.message||e.code||"Periksa koneksi dan pengaturan Firebase.")+" (Lawan Bot tetap bisa dimainkan)")}
})();

// Saat masuk ruang (sekali per pemuatan halaman):
// - ruang belum ada / ruang tunggu tanpa pemain lain yang aktif: pemain ini menjadi host (pembuat ruang).
// - game/ronde lama dan tidak ada pemain lain yang aktif dalam 30 menit terakhir: kembali ke ruang tunggu,
//   catatan poin dikosongkan, pemain ini menjadi host.
let chk=false;const got={p:0,s:0};
function idleCheck(){
 if(chk||!got.p||!got.s)return;chk=true;
 const others=Object.keys(players).some(i=>i!==uid&&live(i));
 if(!st){if(!others)save({status:"lobby",hist:[],host:uid,gen:0});return}
 if(st.status==="lobby"){if(!others&&st.host!==uid)save({status:"lobby",hist:st.hist||[],host:uid,gen:st.gen||0,cr:st.cr||0});return}
 const lim=Date.now()-18e5;
 if(Object.keys(players).some(i=>i!==uid&&players[i]&&players[i].t>lim))return;
 save({status:"lobby",hist:[],host:uid,gen:st.gen||0,cr:Date.now()})}

$("#jb").onclick=async()=>{
 const name=$("#nm").value.trim()||"Pemain";
 room=$("#rm").value.trim().toLowerCase().replace(/[^a-z0-9-]/g,"");if(!room)return msg("Isi kode ruang, atau tekan Buat ruang baru.");
 try{localStorage.setItem("rn",name);localStorage.setItem("rr",room)}catch(e){}
 // Skin Kartu (equip.kartu) dan Meja (equip.meja) yang dipasang ikut ke data pemain agar terlihat semua orang; hanya akun Google.
 let ck="",mk="";try{const g=auth&&auth.currentUser;if(g&&!g.isAnonymous){const v=await db.get("users/"+uid),k=v&&v.equip&&v.equip.kartu,m=v&&v.equip&&v.equip.meja;if(k&&KSK.get(k)&&v.skins&&v.skins[k])ck=k;if(m&&MJK.get(m)&&v.skins&&v.skins[m])mk=m}}catch(e){}
 try{await db.doc(`rooms/${room}/players/${uid}`).set(Object.assign({name,t:Date.now(),j:Date.now()},Object.assign(ck?{ck}:{},mk?{mk}:{})))}catch(e){const x=e.message||e.code;return msg(/permission/i.test(x)?"Game di ruang ini sedang berjalan. Coba lagi setelah ronde selesai.":"Gagal masuk: "+x)}
 $("#home").hidden=true;$("#join").hidden=true;$("#game").hidden=false;
 db.collection(`rooms/${room}/chat`).onSnapshot(onChat,()=>{});
 db.collection(`rooms/${room}/players`).onSnapshot(s=>{players={};s.docs.forEach(d=>players[d.id]=d.data());got.p=1;idleCheck();render()},()=>msg("Koneksi terputus, muat ulang halaman."));
 db.doc("rooms/"+room).onSnapshot(s=>{st=s.exists?s.data():null;got.s=1;idleCheck();render();drawChat();award()},()=>msg("Koneksi terputus, muat ulang halaman."));
};

// Akun: tamu = login anonim. "Masuk dengan Google" menautkan akun Google ke uid yang sama (data tamu ikut);
// kalau Google itu sudah punya akun, pindah ke akun tersebut. Hapus akun: login ulang Google, hapus data ruang terakhir, hapus akun.
const gp=()=>new M.au.GoogleAuthProvider();
// Di APK pop-up Google diblokir WebView: ambil idToken dari plugin native, lalu jadikan credential Firebase web (uid tetap sama).
const NA=!!(window.Capacitor&&Capacitor.isNativePlatform&&Capacitor.isNativePlatform());
// Konfirmasi gaya game (pengganti confirm bawaan Android): await ask("teks") -> true/false.
function ask(t){return new Promise(r=>{const o=document.createElement("div");o.className="ask";o.innerHTML='<div class="ab"><p></p><div class="act"><button class="pri sec">Batal</button><button class="pri">Ya</button></div></div>';o.querySelector("p").textContent=t;const[n,y]=o.querySelectorAll("button"),d=v=>{o.remove();r(v)};n.onclick=()=>d(false);y.onclick=()=>d(true);document.body.append(o)})}
// Tombol Kembali HP (APK; butuh plugin @capacitor/app, tanpa plugin Android langsung menutup app): tutup dialog/panel, atau klik tombol kembali layar itu.
// Di menu utama: peringatan "tekan sekali lagi", Kembali kedua (dalam 2 dtk) keluar. shortcut: layar lain wajib terdaftar di B.
if(NA&&Capacitor.Plugins.App){const A=Capacitor.Plugins.App,H=$("#home"),vis=e=>e&&!e.hidden;let ex=0;
 const B=[["#join","#jbk"],["#pg","#pbk"],["#tw","#twb"],["#iv","#ivb"],["#kp","#spb"],["#game",null]];
 A.addListener("backButton",()=>{
  const k=document.querySelector(".ask button"),o=$("#spo"),c=$("#chatbox"),m=$("#mbox");
  if(k)k.click();else if(vis(o)&&$("#spl"))$("#spl").click();else if(vis(c)||vis(m)){c.hidden=true;m.hidden=true}
  else{const x=B.find(b=>vis($(b[0])));if(x)$(x[1]||(vis($("#lobby"))?"#kx4":"#kx3")).click();
   else if(vis(H)){if(Date.now()-ex<2e3)return A.exitApp();ex=Date.now();const t=document.createElement("div");t.className="tst";t.textContent="Tekan sekali lagi untuk keluar";document.body.append(t);setTimeout(()=>t.remove(),2e3)}}})}
const gNat=async()=>M.au.GoogleAuthProvider.credential((await Capacitor.Plugins.FirebaseAuthentication.signInWithGoogle({skipNativeAuth:true})).credential.idToken);
const batal=e=>e.code==="auth/popup-closed-by-user"||/cancel/i.test(e.message||"");
function authUI(){const u=auth&&auth.currentUser,g=!!u&&!u.isAnonymous;
 $("#gi").hidden=g;$("#go").hidden=!g;$("#da").hidden=!g;
 $("#gm").textContent=g?"Masuk sebagai "+(u.email||u.displayName||"akun Google"):"Main sebagai tamu";menuUI()}
function menuUI(){const u=auth&&auth.currentUser,g=!!u&&!u.isAnonymous,n=($("#nm").value||"").trim()||"Pemain";$("#mpn").textContent=n;$("#mav").textContent=n.slice(0,1).toUpperCase();$("#mpt").textContent=g?"Akun Google":"Tamu";$("#pgn").textContent=n;$("#pav").textContent=$("#mav").textContent;$("#pgt").textContent=$("#mpt").textContent;if(window.pfUI)pfUI()}
$("#gi").onclick=async()=>{
 try{
  const c=NA?await gNat():null;
  try{await(NA?M.au.linkWithCredential(auth.currentUser,c):M.au.linkWithPopup(auth.currentUser,gp()))}
  catch(e){if(e.code!=="auth/credential-already-in-use")throw e;await M.au.signInWithCredential(auth,c||M.au.GoogleAuthProvider.credentialFromError(e))}
  const u=auth.currentUser;uid=u.uid;
  if(!$("#nm").value)$("#nm").value=(u.displayName||"").split(" ")[0].slice(0,16);
  authUI();msg("")
 }catch(e){if(!batal(e))msg("Login Google gagal: "+(e.code||e.message))}};
$("#go").onclick=async()=>{try{await M.au.signOut(auth);location.reload()}catch(e){msg("Gagal keluar: "+(e.code||e.message))}};
$("#da").onclick=async()=>{
 if(!await ask("Hapus akun ini secara permanen? Data akun hilang dan tidak bisa dikembalikan."))return;
 try{
  const u=auth.currentUser;
  await(NA?M.au.reauthenticateWithCredential(u,await gNat()):M.au.reauthenticateWithPopup(u,gp()));
  let r="";try{r=localStorage.getItem("rr")||""}catch(e){}
  if(r)for(const p of["players","chat"])try{await db.doc(`rooms/${r}/${p}/${u.uid}`).set(null)}catch(e){}
  try{await db.doc("users/"+u.uid).set(null)}catch(e){}
  await M.au.deleteUser(u);
  try{["rn","rr","rid"].forEach(k=>localStorage.removeItem(k))}catch(e){}
  location.reload()
 }catch(e){if(!batal(e))msg("Hapus akun gagal: "+(e.code||e.message))}};

$("#hp").onclick=()=>{$("#home").hidden=true;$("#join").hidden=false};
// Navigasi menu: kembali dari Masuk/Profil; Toko dan Spin Skin belum ada (tile hanya penanda "Segera").
$("#jbk").onclick=()=>{menuUI();$("#join").hidden=true;$("#home").hidden=false};

$("#pbk").onclick=()=>{$("#pg").hidden=true;$("#home").hidden=false};
const soon=t=>{msg(t+" segera hadir");setTimeout(()=>msg(""),2500)};

$("#hr").onclick=()=>{$("#mpb").click();const d=$("#ard");d.open=true;d.scrollIntoView({behavior:"smooth"})};
// Buat ruang baru: kode acak 4 karakter (tanpa 0/O/1/I/L), dicek belum dipakai, lalu langsung masuk sebagai host.
$("#mk").onclick=async()=>{
 const A="ABCDEFGHJKMNPQRSTUVWXYZ23456789";let k="";
 for(let n=0;n<6;n++){k=Array.from({length:4},()=>A[Math.floor(Math.random()*A.length)]).join("");
  try{if(!db.get||!(await db.get(`rooms/${k.toLowerCase()}/players`)))break}catch(e){break}}
 $("#rm").value=k;$("#jb").click()};
// Riwayat chat: tiap pemain menyimpan h = 30 pesan terakhirnya; pesan lebih lama dari st.cr (awal ronde baru) disembunyikan.
// Pop-up di meja (#ct) hanya 10 detik; riwayat (#cl) tetap ada sampai ronde baru.
const CHN=30,hh=t=>{const d=new Date(t);return String(d.getHours()).padStart(2,"0")+"."+String(d.getMinutes()).padStart(2,"0")};
let clSig="";
// Blokir & lapor pemain (syarat Play untuk game ber-chat). Blokir disimpan di HP; lapor lewat email ke pengelola.
// Elemen mana pun ber-data-pl="uid" membuka menunya.
const EML="karturemi.kontak@gmail.com";
let blk=new Set();try{blk=new Set(JSON.parse(localStorage.getItem("blk"))||[])}catch(e){}
function setBlk(){try{localStorage.setItem("blk",JSON.stringify([...blk]))}catch(e){}clSig="";drawChat()}
function plMenu(i){
 if(i===uid||window.BOT)return;
 const c=chat[i]||{},n=c.n||nm(i),o=document.createElement("div");o.className="ask";
 o.innerHTML=`<div class="ab"><p></p><div class="act"><button class="pri sec" data-a="x">Batal</button><button class="pri sec" data-a="b">${blk.has(i)?"Buka blokir":"Blokir"}</button><button class="pri" data-a="l">Lapor</button></div></div>`;
 const p=o.querySelector("p");p.textContent=n+": blokir (chatnya disembunyikan di HP ini) atau laporkan ke pengelola?";
 o.onclick=e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a;
  if(a==="b"){blk.has(i)?blk.delete(i):blk.add(i);setBlk()}
  if(a!=="l")return o.remove();
  const isi=Object.values(c.h||{}).filter(m=>m&&m.x).slice(-10).map(m=>"- "+hh(m.t)+" "+m.x).join("\n");
  location.href="mailto:"+EML+"?subject="+encodeURIComponent("Lapor pemain Kartu Remi")+"&body="+encodeURIComponent("Alasan (tulis di sini):\n\n\n---\nRuang: "+room+"\nNama: "+n+"\nID pemain: "+i+"\nID pelapor: "+uid+"\nWaktu: "+new Date().toISOString()+"\nChat terakhir:\n"+(isi||"(tidak ada)"));
  p.textContent="Kirim email yang terbuka ke "+EML+". Kalau aplikasi email tidak terbuka, kirim manual dengan menyebut kode ruang "+room.toUpperCase()+" dan nama pemain.";
  o.querySelector(".act").innerHTML='<button class="pri" data-a="x">Tutup</button>'};
 document.body.append(o)}
document.addEventListener("click",e=>{if(e.target.closest("[data-kick]"))return;if(e.target.closest("[data-ub]")){blk.clear();return setBlk()}const x=e.target.closest("[data-pl]");if(x)plMenu(x.dataset.pl)});
function chatList(){
 const cr=Math.max((st&&st.cr)||0,!st||st.status==="lobby"?Date.now()-3e5:0),L=[];
 for(const i in chat){const c=chat[i];if(!c||blk.has(i))continue;Object.values(c.h||[{x:c.x,t:c.t}]).forEach(m=>{if(m&&m.x&&m.t>cr)L.push({i,n:c.n,x:m.x,t:m.t})})}
 return L.sort((a,b)=>a.t-b.t)}
function drawChat(){
 const L=chatList(),P=Object.values(Object.fromEntries(L.filter(m=>m.t>Date.now()-1e4).map(m=>[m.i,m])));
 $("#cr").textContent=st&&st.status==="play"?"Ronde "+((st.hist||[]).length+1):"";
 $("#ct").innerHTML=P.map(m=>`<span class="cb"><b>${esc(m.n)}</b> ${esc(m.x)}</span>`).join("");$("#ct").hidden=!P.length;
 const lg=$("#cl"),last=L[L.length-1],sg=L.length+"|"+(last?last.t:0)+"|"+blk.size;
 if(sg===clSig)return;clSig=sg;
 const bot=lg.scrollHeight-lg.scrollTop-lg.clientHeight<40||(last&&last.i===uid);
 lg.innerHTML=L.length?L.map(m=>{const me=m.i===uid;return `<div class="cm${me?" me":""}">${me?"":`<div class="cn" data-pl="${esc(m.i)}" role="button" style="cursor:pointer">${esc(m.n)} ⋮</div>`}<div>${esc(m.x)}</div><div class="cmt">${hh(m.t)}</div></div>`}).join(""):'<div class="mut" style="text-align:center">Belum ada pesan</div>';
 if(blk.size)lg.insertAdjacentHTML("beforeend",`<button class="pri sec" data-ub="1" style="font-size:12px">Buka semua blokir (${blk.size})</button>`);
 if(bot)lg.scrollTop=lg.scrollHeight}
function onChat(sn){
 const m={};sn.docs.forEach(d=>{m[d.id]=d.data()});
 if(chatInit)for(const i in m)if(i!==uid&&!blk.has(i)&&m[i]&&m[i].t>((chat[i]||{}).t||0)){beep("pop");if($("#chatbox").hidden)document.body.classList.add("unr")}
 chat=m;chatInit=true;drawChat()}
let lastSend=0;
function sendChat(x){
 x=String(x||"").trim().slice(0,40);if(!x||!room||window.BOT||Date.now()-lastSend<700)return;lastSend=Date.now();
 const c=chat[uid]||{},cr=(st&&st.cr)||0,t=Date.now(),h=[...Object.values(c.h||(c.x?[{x:c.x,t:c.t}]:[])).filter(m=>m&&m.t>cr),{x,t}].slice(-CHN);
 Promise.resolve(db.doc(`rooms/${room}/chat/${uid}`).set({n:(players[uid]||{}).name||"?",x,t,h})).catch(e=>msg("Chat gagal: "+(e.message||e.code)))}
setInterval(drawChat,5000);
document.addEventListener("click",e=>{const b=e.target.closest("[data-e]");if(b){sendChat(b.dataset.e);if(window.SND)SND("emo")}});
$("#cs").onclick=()=>{sendChat($("#ci").value);$("#ci").value=""};
$("#ci").onkeydown=e=>{if(e.key==="Enter"&&!e.isComposing){sendChat(e.target.value);e.target.value=""}};
document.querySelectorAll(".cfb").forEach(x=>x.onclick=()=>{const b=$("#chatbox");b.hidden=!b.hidden;$("#mbox").hidden=true;if(!b.hidden){document.body.classList.remove("unr");$("#cl").scrollTop=$("#cl").scrollHeight}});
$("#cc").onclick=()=>{$("#chatbox").hidden=true};
$("#mb").onclick=()=>{const b=$("#mbox");b.hidden=!b.hidden;$("#chatbox").hidden=true};
$("#mc").onclick=()=>{$("#mbox").hidden=true};
$("#kx3").onclick=async()=>{if(await ask("Keluar dari ruang?"))leave()};
function beat(){
 const p=players[uid];if(window.BOT||!room||!uid||!p||!p.name)return;
 try{Promise.resolve(db.doc(`rooms/${room}/players/${uid}`).set(pdoc())).catch(()=>{})}catch(e){}}
setInterval(beat,30000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)beat()});
// Statistik (akun Google, users/{uid}.st = {m: main, w: menang, s: set}): tiap peserta +1 main saat ronde selesai; pemenang +1 menang, +1 set kalau menang dengan men-set. Rules Firebase harus memuat "st".
// Hadiah (hanya akun Google): pemenang ronde dapat koin = setengah poinnya. Kartu spin hanya dari men-set: set biasa +1 kartu biru, set dengan kartu joker +1 kartu merah; batas harian 10 biru dan 5 merah (users/{uid}.hr = {d: tanggal perangkat, b, m}). Kunci per ronde di localStorage mencegah dobel.
async function award(){
 const g=auth&&auth.currentUser;
 if(window.BOT||!st||st.status!=="done"||!g||g.isAnonymous||!(st.order||[]).includes(uid))return;
 const win=st.winner===uid,k=room+":"+(st.gen||0)+":"+(st.hist||[]).length,kn=Math.max(0,Math.floor(((st.sc||{})[uid]||0)/2)),sx=st.sx;
 try{if(localStorage.getItem("aw")===k)return;localStorage.setItem("aw",k)}catch(e){}
 try{const v=(await db.get("users/"+uid))||{},o=v.st||{},ns={m:(o.m||0)+1,w:(o.w||0)+(win?1:0),s:(o.s||0)+(win&&sx?1:0)};if(!win){await db.doc("users/"+uid).set(Object.assign({},v,{st:ns}));rhSave(v).catch(()=>{});window.GG=pfLv(ns);return}const t=new Date(),dy=t.getFullYear()+"-"+(t.getMonth()+1)+"-"+t.getDate(),h=v.hr&&v.hr.d===dy?v.hr:{d:dy,b:0,m:0},j=sx&&isJ(sx),gb=sx&&!j&&h.b<10?1:0,gm=j&&h.m<5?1:0;await db.doc("users/"+uid).set(Object.assign({},v,{biru:(v.biru||0)+gb,merah:(v.merah||0)+gm,koin:(v.koin||0)+kn,hr:{d:dy,b:h.b+gb,m:h.m+gm},st:ns}));rhSave(v).catch(()=>{});window.GG=pfLv(ns);msg("🎉 Menang ronde! "+(gm?"+1 kartu merah, ":gb?"+1 kartu biru, ":sx?"batas kartu hari ini tercapai, ":"")+"+"+kn+" koin")}
 catch(e){try{localStorage.removeItem("aw")}catch(_){}}
}
// Riwayat (akun Google): users/{uid}/rh = 10 game terakhir, terbaru di depan. Satu game = rangkaian ronde dengan hist yang sama;
// gen naik tiap ronde dan hist bertambah tiap ronde, jadi gen - hist.length tetap selama satu game. Tulis terpisah supaya hadiah tidak ikut gagal kalau rules belum ada.
const rhSave=v=>{const H=st.hist||[],id=room+":"+((st.gen||0)-H.length),e={id,d:Date.now(),n:st.names||{},r:H.map(r=>({sc:r.sc,win:r.win,vic:r.vic||""}))};
 return Promise.resolve(db.doc("users/"+uid+"/rh").set([e,...(v.rh||[]).filter(x=>x&&x.id!==id)].slice(0,10)))};
// Akhiri game: hanya pemilik room (host). Reset penuh: catatan poin dikosongkan, putaran kembali ke kanan (state lobby tanpa dir).
$("#ky").onclick=async()=>{if(!st||st.status!=="play"||hostId()!==uid)return;if(await ask("Akhiri game untuk semua pemain? Catatan poin dikosongkan dan putaran kembali ke kanan."))window.BOT?leave():save({status:"lobby",hist:[],host:hostId()||uid,gen:st.gen||0,cr:Date.now()})};
$("#ab").onclick=async()=>{if(!st)return;if(window.BOT){for(const i in players)players[i].rd=(st.hist||[]).length;return start()}try{await db.doc(`rooms/${room}/players/${uid}`).set(pdoc({rd:(st.hist||[]).length}));msg("")}catch(e){msg("Gagal: "+(e.message||e.code))}};
$("#kx2").onclick=leave;
