async function leave(){try{localStorage.removeItem("rn");localStorage.removeItem("rr")}catch(e){}try{await db.doc(`rooms/${room}/players/${uid}`).set({name:(players[uid]||{}).name||"Pemain",t:0})}catch(e){}location.reload()}
let auth,M,db,uid,room="",players={},st=null,sel=[],ord=[],auto=true,AC=null,snd=true,chat={},chatInit=false,wasMine=false,sig="",wasDone=false,drag=null,pend=false,noclick=false,kickOut=false;
// Pemain di-kick: st.kk[id] = nilai j pemain saat di-kick. Masuk ulang membuat j baru, jadi tidak lagi cocok (tanpa bergantung jam).
const kicked=i=>!!(st&&st.kk&&players[i]&&st.kk[i]!=null&&st.kk[i]===(players[i].j||0));
const live=i=>players[i]&&players[i].t>Date.now()-18e4&&!kicked(i);
const nm=i=>(st&&st.names&&st.names[i])||(players[i]&&players[i].name)||"?";
const msg=t=>{$("#err").textContent=t};
const save=async o=>{try{await db.doc("rooms/"+room).set(o);msg("")}catch(e){msg("Gagal menyimpan: "+(e.message||e.code))}};
// Host = pembuat ruang (st.host) selama masih aktif; kalau tidak aktif, pemain aktif yang masuk paling awal.
const hostId=()=>{const L=Object.keys(players).filter(live);if(st&&st.host&&L.includes(st.host))return st.host;return L.sort((a,b)=>(players[a].j||players[a].t)-(players[b].j||players[b].t))[0]||""};
const gen=()=>(st&&st.gen)||0;
const isOk=i=>i===hostId()||(!!players[i]&&players[i].ok===gen());
const pdoc=o=>{const p=players[uid]||{},r={name:p.name||"Pemain",t:Date.now()};["rd","j","ok"].forEach(k=>{if(p[k]!=null)r[k]=p[k]});return Object.assign(r,o||{})};
const FBC={apiKey:"AIzaSyD7iXbT11b_qqc0n97JhQ0SxdhBzx-UDg8",authDomain:"remi-online-69bb6.firebaseapp.com",databaseURL:"https://remi-online-69bb6-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"remi-online-69bb6",storageBucket:"remi-online-69bb6.firebasestorage.app",messagingSenderId:"386908271555",appId:"1:386908271555:web:e9a238988ceb869ecb8376"};
const CDN="https://www.gstatic.com/firebasejs/10.12.2/";
const norm=v=>{if(!v)return v;v.deck=v.deck||[];v.pile=v.pile||[];v.laid=v.laid||{};v.eat=v.eat||"";v.hist=v.hist||[];v.fb=v.fb||{};v.hands=v.hands||{};(v.order||[]).forEach(i=>{v.hands[i]=v.hands[i]||[]});return v};
const map=p=>p.replace(/^rooms\/([^/]+)$/,"rooms/$1/state");
(async()=>{
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
  // Layar judul tiap kali dibuka. Kode ruang: dari link undangan ?r=kode; kalau tidak ada, ruang yang belum
  // ditinggalkan lewat tombol Keluar (supaya bisa kembali ke game yang sedang berjalan); selain itu kosong.
  const ur=(new URLSearchParams(location.search).get("r")||"").toUpperCase();
  try{const sn=localStorage.getItem("rn"),sr=localStorage.getItem("rr");if(sn)$("#nm").value=sn;$("#rm").value=ur||(sr||"").toUpperCase()}catch(e){$("#rm").value=ur}
  $("#home").hidden=false;
 }catch(e){msg("Gagal menghubungkan Firebase: "+(e.message||e.code||"Periksa koneksi dan pengaturan Firebase."))}
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
 try{await db.doc(`rooms/${room}/players/${uid}`).set({name,t:Date.now(),j:Date.now()})}catch(e){return msg("Gagal masuk: "+(e.message||e.code))}
 $("#join").hidden=true;$("#game").hidden=false;
 db.collection(`rooms/${room}/chat`).onSnapshot(onChat,()=>{});
 db.collection(`rooms/${room}/players`).onSnapshot(s=>{players={};s.docs.forEach(d=>players[d.id]=d.data());got.p=1;idleCheck();render()},()=>msg("Koneksi terputus, muat ulang halaman."));
 db.doc("rooms/"+room).onSnapshot(s=>{st=s.exists?s.data():null;got.s=1;idleCheck();render();drawChat()},()=>msg("Koneksi terputus, muat ulang halaman."));
};

// Akun: tamu = login anonim. "Masuk dengan Google" menautkan akun Google ke uid yang sama (data tamu ikut);
// kalau Google itu sudah punya akun, pindah ke akun tersebut. Hapus akun: login ulang Google, hapus data ruang terakhir, hapus akun.
const gp=()=>new M.au.GoogleAuthProvider();
function authUI(){const u=auth&&auth.currentUser,g=!!u&&!u.isAnonymous;
 $("#gi").hidden=g;$("#go").hidden=!g;$("#da").hidden=!g;
 $("#gm").textContent=g?"Masuk sebagai "+(u.email||u.displayName||"akun Google"):"Main sebagai tamu"}
$("#gi").onclick=async()=>{
 try{
  try{await M.au.linkWithPopup(auth.currentUser,gp())}
  catch(e){if(e.code!=="auth/credential-already-in-use")throw e;await M.au.signInWithCredential(auth,M.au.GoogleAuthProvider.credentialFromError(e))}
  const u=auth.currentUser;uid=u.uid;
  if(!$("#nm").value)$("#nm").value=(u.displayName||"").split(" ")[0].slice(0,16);
  authUI();msg("")
 }catch(e){if(e.code!=="auth/popup-closed-by-user")msg("Login Google gagal: "+(e.code||e.message))}};
$("#go").onclick=async()=>{try{await M.au.signOut(auth);location.reload()}catch(e){msg("Gagal keluar: "+(e.code||e.message))}};
$("#da").onclick=async()=>{
 if(!confirm("Hapus akun ini secara permanen? Data akun hilang dan tidak bisa dikembalikan."))return;
 try{
  const u=auth.currentUser;
  await M.au.reauthenticateWithPopup(u,gp());
  let r="";try{r=localStorage.getItem("rr")||""}catch(e){}
  if(r)for(const p of["players","chat"])try{await db.doc(`rooms/${r}/${p}/${u.uid}`).set(null)}catch(e){}
  await M.au.deleteUser(u);
  try{["rn","rr","rid"].forEach(k=>localStorage.removeItem(k))}catch(e){}
  location.reload()
 }catch(e){if(e.code!=="auth/popup-closed-by-user")msg("Hapus akun gagal: "+(e.code||e.message))}};

$("#hp").onclick=()=>{$("#home").hidden=true;$("#join").hidden=false};
$("#hr").onclick=()=>{const d=document.querySelector("details");d.open=true;d.scrollIntoView({behavior:"smooth"})};
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
function chatList(){
 const cr=Math.max((st&&st.cr)||0,!st||st.status==="lobby"?Date.now()-3e5:0),L=[];
 for(const i in chat){const c=chat[i];if(!c)continue;(c.h||[{x:c.x,t:c.t}]).forEach(m=>{if(m&&m.x&&m.t>cr)L.push({i,n:c.n,x:m.x,t:m.t})})}
 return L.sort((a,b)=>a.t-b.t)}
function drawChat(){
 const L=chatList(),P=Object.values(Object.fromEntries(L.filter(m=>m.t>Date.now()-1e4).map(m=>[m.i,m])));
 $("#cr").textContent=st&&st.status==="play"?"Ronde "+((st.hist||[]).length+1):"";
 $("#ct").innerHTML=P.map(m=>`<span class="cb"><b>${esc(m.n)}</b> ${esc(m.x)}</span>`).join("");$("#ct").hidden=!P.length;
 const lg=$("#cl"),last=L[L.length-1],sg=L.length+"|"+(last?last.t:0);
 if(sg===clSig)return;clSig=sg;
 const bot=lg.scrollHeight-lg.scrollTop-lg.clientHeight<40||(last&&last.i===uid);
 lg.innerHTML=L.length?L.map(m=>{const me=m.i===uid;return `<div class="cm${me?" me":""}">${me?"":`<div class="cn">${esc(m.n)}</div>`}<div>${esc(m.x)}</div><div class="cmt">${hh(m.t)}</div></div>`}).join(""):'<div class="mut" style="text-align:center">Belum ada pesan</div>';
 if(bot)lg.scrollTop=lg.scrollHeight}
function onChat(sn){
 const m={};sn.docs.forEach(d=>{m[d.id]=d.data()});
 if(chatInit)for(const i in m)if(i!==uid&&m[i]&&m[i].t>((chat[i]||{}).t||0)){beep("pop");if($("#chatbox").hidden)document.body.classList.add("unr")}
 chat=m;chatInit=true;drawChat()}
let lastSend=0;
function sendChat(x){
 x=String(x||"").trim().slice(0,40);if(!x||!room||Date.now()-lastSend<700)return;lastSend=Date.now();
 const c=chat[uid]||{},cr=(st&&st.cr)||0,t=Date.now(),h=[...(c.h||(c.x?[{x:c.x,t:c.t}]:[])).filter(m=>m.t>cr),{x,t}].slice(-CHN);
 Promise.resolve(db.doc(`rooms/${room}/chat/${uid}`).set({n:(players[uid]||{}).name||"?",x,t,h})).catch(e=>msg("Chat gagal: "+(e.message||e.code)))}
setInterval(drawChat,5000);
document.addEventListener("click",e=>{const b=e.target.closest("[data-e]");if(b)sendChat(b.dataset.e)});
$("#cs").onclick=()=>{sendChat($("#ci").value);$("#ci").value=""};
$("#ci").onkeydown=e=>{if(e.key==="Enter"){sendChat(e.target.value);e.target.value=""}};
document.querySelectorAll(".cfb").forEach(x=>x.onclick=()=>{const b=$("#chatbox");b.hidden=!b.hidden;$("#mbox").hidden=true;if(!b.hidden){document.body.classList.remove("unr");$("#cl").scrollTop=$("#cl").scrollHeight}});
$("#cc").onclick=()=>{$("#chatbox").hidden=true};
$("#mb").onclick=()=>{const b=$("#mbox");b.hidden=!b.hidden;$("#chatbox").hidden=true};
$("#mc").onclick=()=>{$("#mbox").hidden=true};
$("#kx3").onclick=()=>{if(confirm("Keluar dari ruang?"))leave()};
function beat(){
 const p=players[uid];if(!room||!uid||!p||!p.name)return;
 try{Promise.resolve(db.doc(`rooms/${room}/players/${uid}`).set(pdoc())).catch(()=>{})}catch(e){}}
setInterval(beat,30000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)beat()});
// Akhiri game: hanya pemilik room (host). Reset penuh: catatan poin dikosongkan, putaran kembali ke kanan (state lobby tanpa dir).
$("#ky").onclick=()=>{if(!st||st.status!=="play"||hostId()!==uid)return;if(confirm("Akhiri game untuk semua pemain? Catatan poin dikosongkan dan putaran kembali ke kanan."))save({status:"lobby",hist:[],host:hostId()||uid,gen:st.gen||0,cr:Date.now()})};
$("#ab").onclick=async()=>{if(!st)return;try{await db.doc(`rooms/${room}/players/${uid}`).set(pdoc({rd:(st.hist||[]).length}));msg("")}catch(e){msg("Gagal: "+(e.message||e.code))}};
$("#kx2").onclick=leave;
