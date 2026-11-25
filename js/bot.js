// Lawan Bot: main lokal di HP tanpa Firebase, 1-3 bot, tingkat Mudah/Sedang/Sulit. Tanpa hadiah, statistik, dan riwayat (award() dilewati saat window.BOT).
// save() (net.js) diarahkan ke botSave = state lokal. Giliran bot memanggil go() yang sama dengan uid ditukar sementara, jadi aturan tidak diduplikasi.
(()=>{
const LV=["Mudah","Sedang","Sulit"];let T=0;
window.botSave=o=>{st=norm(JSON.parse(JSON.stringify(o)));msg("");setTimeout(()=>{render();tick()},0)};
const tick=()=>{clearTimeout(T);if(window.BOT&&st&&st.status==="play"&&BOT.b[st.turn])T=setTimeout(move,BOT.lv===2?700:950)};
// Coba satu aksi sebagai bot; false kalau ditolak aturan (st tidak berubah), pesan galatnya dibuang.
const tg=(id,k,a)=>{const me=uid,s0=st,e=$("#err").textContent;uid=id;try{go(k,a)}finally{uid=me}if(st===s0){$("#err").textContent=e;return false}return true};
function drop(h,hs,L){
 const c=h.filter(x=>!isJ(x));
 if(!L)return c[Math.floor(Math.random()*c.length)];
 if(L===1){const lv=new Set(arrange(h,hs).ms.flat()),f=c.filter(x=>!lv.has(x));return(f.length?f:c).sort((p,q)=>pts(q)-pts(p))[0]}
 // Sulit: buang kartu yang menyisakan tangan terbaik; utamakan tangan yang siap Set.
 const used=Object.values(st.laid||{}).flat().flatMap(m=>m.split(","));
 return c.map(x=>{const r=h.filter(y=>y!==x);return{x,v:part(srt(r)).v+(ready(r,used,hs)?500:0)+pts(x)*.1}}).sort((p,q)=>q.v-p.v)[0].x}
function move(){
 if(!window.BOT||!st||st.status!=="play"||!BOT.b[st.turn])return;
 const id=st.turn,L=BOT.lv,h=st.hands[id],hs=hasSeri((st.laid||{})[id]),P=st.pile,n=P.length;
 if(st.phase==="draw"){
  if((L||Math.random()<.5)&&tg(id,"set"))return;// Mudah kadang melewatkan Set
  // Makan: Mudah tidak pernah, Sedang hanya kartu teratas, Sulit sampai 3 teratas.
  for(let i=n-1;i>=Math.max(0,n-[0,1,3][L]);i--)if(tg(id,"take",P[i]))return;
  tg(id,"draw");return}
 if(st.eat)for(const k of[3,4])for(const m of sub(h,k))if(m.includes(st.eat)&&meld(m)&&tg(id,"lay",run(m)?runOrd(m):m))return;
 // Turun: sisakan minimal 2 kartu supaya tangan tidak habis lalu tertinggal joker saja.
 if(L||Math.random()<.5)for(const m of arrange(h,hs).ms)if(h.length-m.length>=2&&tg(id,"lay",run(m)?runOrd(m):m.slice()))return;
 tg(id,"drop",drop(h,hs,L))}
function mulai(n,L){
 const t=9e15,P={},B={};P[uid]={name:($("#nm").value||"").trim()||"Kamu",t,j:1,ok:0};
 for(let i=1;i<=n;i++){B["bot"+i]=1;P["bot"+i]={name:"Bot "+i+" ("+LV[L]+")",t,j:1+i,ok:0}}
 window.BOT={lv:L,b:B,me:uid};room="bot";players=P;st=null;
 $("#home").hidden=true;$("#game").hidden=false;start()}
// Dialog pilihan: tombol Batal paling depan di DOM supaya tombol Kembali HP (net.js, klik .ask button pertama) menutupnya.
$("#hb").onclick=()=>{let n=1,L=1;const o=document.createElement("div");o.className="ask";
 const draw=()=>{o.innerHTML=`<div class="ab" style="display:flex;flex-direction:column;gap:8px"><div class="act" style="order:9"><button class="pri sec" data-x="1">Batal</button><button class="pri" data-go="1">Mulai</button></div><p><b>Lawan Bot</b></p><div class="mut">Jumlah bot</div><div class="act" style="margin:0">${[1,2,3].map(k=>`<button class="pri${k===n?"":" sec"}" data-n="${k}">${k}</button>`).join("")}</div><div class="mut">Tingkat</div><div class="act" style="margin:0">${LV.map((t,k)=>`<button class="pri${k===L?"":" sec"}" data-l="${k}">${t}</button>`).join("")}</div><div class="mut" style="font-size:12px">Latihan di HP, tanpa hadiah dan statistik.</div></div>`};
 o.onclick=e=>{const b=e.target.closest("button");if(!b)return;const d=b.dataset;if(d.n)n=+d.n;else if(d.l)L=+d.l;else{o.remove();if(d.go)mulai(n,L);return}draw()};
 draw();document.body.append(o)};
})();
