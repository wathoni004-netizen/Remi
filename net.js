async function leave(){try{localStorage.removeItem("rn");localStorage.removeItem("rr")}catch(e){}try{await db.doc(`rooms/${room}/players/${uid}`).set({name:(players[uid]||{}).name||"Pemain",t:0})}catch(e){}location.reload()}
let db,uid,room="",players={},st=null,sel=[],ord=[],auto=true,AC=null,snd=true,chat={},chatInit=false,wasMine=false,sig="",wasDone=false,drag=null,pend=false,noclick=false,kickOut=false;
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
  const M=window.__FBMOCK||{
   a:await import(CDN+"firebase-app.js"),
   d:await import(CDN+"firebase-database.js"),
   au:await import(CDN+"firebase-auth.js")
  };
  const app=M.a.initializeApp(FBC);
  const auth=M.au.getAuth(app);
  // Identitas anonim diperlukan agar Firebase dapat mengizinkan akses berdasarkan Rules.
  const credential=await M.au.signInAnonymously(auth);
  uid=credential.user.uid;
  const d=M.d,rdb=d.getDatabase(app);
  db={doc:p=>({set:o=>d.set(d.ref(rdb,map(p)),o),onSnapshot:(f,e)=>d.onValue(d.ref(rdb,map(p)),s=>{const v=s.val();f({exists:v!==null,data:()=>norm(v)})},e)}),
   collection:p=>({onSnapshot:(f,e)=>d.onValue(d.ref(rdb,p),s=>{const v=s.val()||{};f({docs:Object.keys(v).map(k=>({id:k,data:()=>v[k]}))})},e)})};
  $("#join").hidden=false;
  try{const sn=localStorage.getItem("rn"),sr=localStorage.getItem("rr");if(sn){$("#nm").value=sn;if(sr)$("#rm").value=sr;$("#jb").click()}}catch(e){}
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
 if(st.status==="lobby"){if(!others&&st.host!==uid)save({status:"lobby",hist:st.hist||[],host:uid,gen:st.gen||0});return}
 const lim=Date.now()-18e5;
 if(Object.keys(players).some(i=>i!==uid&&players[i]&&players[i].t>lim))return;
 save({status:"lobby",hist:[],host:uid,gen:st.gen||0})}

$("#jb").onclick=async()=>{
 const name=$("#nm").value.trim()||"Pemain";
 room=($("#rm").value.trim().toLowerCase().replace(/[^a-z0-9-]/g,""))||"kartu";
 try{localStorage.setItem("rn",name);localStorage.setItem("rr",room)}catch(e){}
 try{await db.doc(`rooms/${room}/players/${uid}`).set({name,t:Date.now(),j:Date.now()})}catch(e){return msg("Gagal masuk: "+(e.message||e.code))}
 $("#join").hidden=true;$("#game").hidden=false;
 db.collection(`rooms/${room}/chat`).onSnapshot(onChat,()=>{});
 db.collection(`rooms/${room}/players`).onSnapshot(s=>{players={};s.docs.forEach(d=>players[d.id]=d.data());got.p=1;idleCheck();render()},()=>msg("Koneksi terputus, muat ulang halaman."));
 db.doc("rooms/"+room).onSnapshot(s=>{st=s.exists?s.data():null;got.s=1;idleCheck();render()},()=>msg("Koneksi terputus, muat ulang halaman."));
};

function drawChat(){
 const now=Date.now(),L=Object.keys(chat).map(i=>chat[i]).filter(m=>m&&m.t>now-45000).sort((a,b)=>a.t-b.t);
 $("#ct").innerHTML=L.map(m=>`<span class="cb"><b>${esc(m.n)}</b> ${esc(m.x)}</span>`).join("");$("#ct").hidden=!L.length}
function onChat(sn){
 const m={};sn.docs.forEach(d=>{m[d.id]=d.data()});
 if(chatInit)for(const i in m)if(i!==uid&&m[i]&&m[i].t>((chat[i]||{}).t||0))beep("pop");
 chat=m;chatInit=true;drawChat()}
let lastSend=0;
function sendChat(x){
 x=String(x||"").trim().slice(0,40);if(!x||!room||Date.now()-lastSend<700)return;lastSend=Date.now();
 Promise.resolve(db.doc(`rooms/${room}/chat/${uid}`).set({n:(players[uid]||{}).name||"?",x,t:Date.now()})).catch(e=>msg("Chat gagal: "+(e.message||e.code)))}
setInterval(drawChat,5000);
document.addEventListener("click",e=>{const b=e.target.closest("[data-e]");if(b)sendChat(b.dataset.e)});
$("#cs").onclick=()=>{sendChat($("#ci").value);$("#ci").value=""};
$("#ci").onkeydown=e=>{if(e.key==="Enter"){sendChat(e.target.value);e.target.value=""}};
$("#kx3").onclick=()=>{if(confirm("Keluar dari ruang?"))leave()};
function beat(){
 const p=players[uid];if(!room||!uid||!p||!p.name)return;
 try{Promise.resolve(db.doc(`rooms/${room}/players/${uid}`).set(pdoc())).catch(()=>{})}catch(e){}}
setInterval(beat,30000);
document.addEventListener("visibilitychange",()=>{if(!document.hidden)beat()});
$("#ky").onclick=()=>{if(!st||st.status!=="play")return;if(confirm("Akhiri game yang sedang berjalan untuk semua pemain? Ronde ini tidak dihitung."))save({status:"lobby",hist:st.hist||[],host:hostId()||uid,gen:st.gen||0})};
$("#ab").onclick=async()=>{if(!st)return;try{await db.doc(`rooms/${room}/players/${uid}`).set(pdoc({rd:(st.hist||[]).length}));msg("")}catch(e){msg("Gagal: "+(e.message||e.code))}};
$("#kx2").onclick=leave;
