// Batas giliran 1 menit dan penanda koneksi putus. Tanpa field baru di state: tiap HP menghitung sendiri sejak melihat
// giliran berganti (jam antar HP tidak perlu sama). Waktu habis: HP pemain yang giliran menjalankan otomatis();
// kalau HP itu putus, host yang menjalankannya 10 detik kemudian. Lawan Bot tidak dibatasi.
(()=>{
const DUR=60,JEDA=10;let kunci="",mulai=0,tadi=Date.now(),warn="",lama="";const lihat={};
// Sinyal pemain dari heartbeat (tiap 30 dtk) menurut jam HP ini: 0 hijau lancar, 1 kuning terlambat (45 dtk), 2 merah putus (90 dtk) atau keluar.
const sinyal=i=>{const p=players[i];if(!p||!(p.t>Date.now()-18e4))return 2;const x=lihat[i],d=x&&x.t===p.t?Date.now()-x.at:0;return d>9e4?2:d>45e3?1:0};
const W=[["#3ddc6f","Koneksi lancar"],["#ffd23f","Koneksi tersendat"],["#ff4d4d","Koneksi putus"]];
window.titik=i=>{if(window.BOT||i===uid)return"";const[c,t]=W[sinyal(i)];return`<i role="img" aria-label="${t}" title="${t}" style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${c};box-shadow:0 0 0 1px rgba(0,0,0,.5);margin-right:5px"></i>`};
// Selesaikan giliran: cabut, turunkan kartu yang dimakan (wajib), buang kartu tak terpakai bernilai tertinggi. Satu kali tulis.
window.otomatis=id=>{
 if(!st||st.status!=="play"||st.turn!==id)return;
 const s=JSON.parse(JSON.stringify(st)),h=s.hands[id];s.laid=s.laid||{};
 if(s.phase==="draw"){if(!s.deck.length)return fin(s);h.push(s.deck.shift())}
 if(s.eat){
  const L=s.laid[id]||[],hs=hasSeri(L),sisa=m=>h.filter(c=>!m.includes(c)),aman=m=>sisa(m).some(c=>!isJ(c));
  for(const m of[3,4].flatMap(n=>sub(h,n)).filter(m=>meld(m)&&m.includes(s.eat))){
   let ms=null;
   if(hs||isSeri(m)){if(aman(m))ms=[m]}
   else{const q=[3,4].flatMap(n=>sub(sisa(m),n)).find(q=>meld(q)&&isSeri(q)&&aman([...m,...q]));if(q)ms=[q,m]}
   if(ms){ms.flat().forEach(c=>h.splice(h.indexOf(c),1));s.laid[id]=[...L,...ms.map(x=>(run(x)?runOrd(x):x).join(","))];break}}
  s.eat=""}
 const pakai=new Set(arrange(h,hasSeri(s.laid[id])).ms.flat()),c=h.filter(x=>!isJ(x)),bebas=c.filter(x=>!pakai.has(x));
 const b=(bebas.length?bebas:c).sort((p,q)=>pts(q)-pts(p))[0];
 if(b){h.splice(h.indexOf(b),1);s.pile.push(b);s.lb=id}
 s.msg=nm(id)+" kehabisan waktu"+(b?", buang "+lbl(b):"");s.turn=nxt(s,id,1);s.phase="draw";
 if(id===uid)sel=[];save(s)};
function tik(){
 const el=$("#tmr"),now=Date.now(),tidur=now-tadi>3000;tadi=now;
 for(const i in players){const t=players[i]&&players[i].t;if(!lihat[i]||lihat[i].t!==t||tidur)lihat[i]={t,at:now}}
 if(window.BOT||!room||!st||st.status!=="play"){el.hidden=true;kunci="";return}
 // gambar ulang meja kalau warna sinyal ada yang berubah
 const ps=(st.order||[]).map(sinyal).join();if(ps!==lama){lama=ps;render()}
 // aplikasi sempat tidur: hitung dari awal, data bisa jadi belum segar (jangan menimpa permainan)
 const k=room+"|"+(st.gen||0)+"|"+st.turn;if(k!==kunci||tidur){kunci=k;mulai=now}
 el.hidden=false;
 if(!navigator.onLine){el.textContent="🔴 Koneksi internetmu putus";el.style.color="#ff8a80";mulai=now;return}
 const lewat=Math.floor((now-mulai)/1000),sisa=Math.max(0,DUR-lewat),mine=st.turn===uid;
 el.textContent="⏱ "+(mine?"Waktumu":nm(st.turn))+" "+(sisa>=60?"1:00":"0:"+String(sisa).padStart(2,"0"));el.style.color=sisa<=10?"#ff8a80":"";
 if(mine&&sisa<=10&&sisa>0&&warn!==k+mulai){warn=k+mulai;beep("turn");buzz()}
 if(mine?lewat>=DUR:lewat>=DUR+JEDA&&hostId()===uid){mulai=now;otomatis(st.turn)}}
setInterval(tik,500);
})();
