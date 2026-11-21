// Arah putaran: st.dir 1 = kanan (berlawanan arah jarum jam), -1 = kiri. Berbalik setiap ronde yang berakhir dengan set.
const nxt=(s,i,k)=>{const O=s.order,n=O.length;return O[((O.indexOf(i)+k*(s.dir||1))%n+n)%n]};

function start(){
 // Hanya host (pembuat ruang) yang bisa memulai; di ruang tunggu semua pemain harus sudah Siap.
 if(hostId()!==uid)return;
 // Urutan duduk: ronde lanjutan mempertahankan urutan ronde sebelumnya; selebihnya menurut waktu masuk (j), bukan waktu aktif (t).
 const H0=(st&&st.hist)||[],nx=st&&st.status==="done",jt=i=>players[i].j||players[i].t,ix=i=>{const k=nx?(st.order||[]).indexOf(i):-1;return k<0?9:k},ids=Object.keys(players).filter(i=>live(i)&&(!nx||players[i].rd===H0.length)).sort((a,b)=>ix(a)-ix(b)||jt(a)-jt(b)).slice(0,4);
 if(ids.length<2||(!nx&&!ids.every(isOk)))return;
 const d=mk(),hands={};ids.forEach(i=>hands[i]=d.splice(0,7));
 // host, gen, dan kk ikut disimpan: host tetap, tanda Siap direset untuk ruang tunggu berikutnya, daftar kick tidak hilang.
 save({status:"play",order:ids,names:Object.fromEntries(ids.map(i=>[i,players[i].name])),hands,deck:d,pile:[],laid:{},eat:"",hist:H0,turn:ids[0],phase:"draw",lb:"",msg:players[ids[0]].name+" jalan duluan",host:hostId(),gen:gen()+1,kk:(st&&st.kk)||{},dir:nx?(st.sx?-1:1)*(st.dir||1):1,cr:Date.now()});
}

function fin(s,by,c){
 s.status="done";s.sc={};
 s.laid=s.laid||{};s.fb={};
 s.order.forEach(i=>{
  const L=(s.laid[i]||[]).slice(),hd=s.hands[i]||[],lp=L.reduce((t,m)=>t+meldPts(m.split(",")),0),F=finalLay(hd,L.some(m=>isSeri(m.split(","))));
  const ms=F.m.map(m=>run(m)?runOrd(m):m),rest=hd.filter(c=>!ms.some(m=>m.includes(c)));
  ms.forEach(m=>L.push(m.join(",")));s.laid[i]=L;s.hands[i]=rest;
  const up=lp+ms.reduce((t,m)=>t+meldPts(m),0),dn=rest.reduce((t,c)=>t+pts(c),0);
  s.sc[i]=up-dn;s.fb[i]={up,dn,st:0}});
 if(c){const b=pts(c)*10;s.sc[by]+=b;s.sc[s.lb]-=b;s.fb[by].st=b;s.fb[s.lb].st=-b;s.msg=nm(by)+" men-set "+nm(s.lb)+" dengan kartu set "+lbl(c)+"! +"+b+" poin untuk "+nm(by)+", −"+b+" poin untuk "+nm(s.lb)}
 else s.msg="Tumpukan habis, permainan selesai"
 s.winner=c?by:s.order.reduce((a,b)=>s.sc[b]>s.sc[a]?b:a);
 s.hist=[...(s.hist||[]),{sc:Object.assign({},s.sc),names:Object.assign({},s.names),win:s.winner,vic:c?s.lb:""}];
 save(s);
}

function go(k,a){
 if(!st||st.status!=="play"||st.turn!==uid)return;
 const s=JSON.parse(JSON.stringify(st)),h=s.hands[uid],O=s.order,me=nm(uid);
 const prev=nxt(s,uid,-1);
 s.laid=s.laid||{};
 if(k==="draw"){
  if(s.phase!=="draw")return;
  if(!s.deck.length)return fin(s);
  h.push(s.deck.shift());s.phase="act";s.msg=me+" cabut";
 }else if(k==="take"){
  if(s.phase!=="draw"||!s.pile.length)return;
  const i=s.pile.indexOf(a);if(i<0)return;if(s.pile.length-i>5)return msg("Hanya boleh makan dari 5 kartu teratas");
  const nh=[...h,...s.pile.slice(i)],hasSeri=(s.laid[uid]||[]).some(m=>isSeri(m.split(",")));
  // Rell boleh dimakan kalau seri sudah di bawah, atau ada seri lain di tangan (seri itu ikut turun otomatis saat rell diturunkan).
  const sh=y=>[3,4].some(n=>sub(h.filter(c=>!y.includes(c)),n).some(q=>meld(q)&&isSeri(q)));
  const ok=[2,3].some(n=>sub(h,n).some(x=>{const m=[a,...x];return meld(m)&&(isSeri(m)||hasSeri||sh(x))&&nh.length-m.length>=1&&nh.some(c=>!m.includes(c)&&!isJ(c))}));
  if(!ok)return msg("Kartu itu belum bisa langsung kamu turunkan (harus cocok dengan kartu di tangan; rell butuh seri lebih dulu)");
  h.push(...s.pile.splice(i));s.eat=a;s.phase="act";s.msg=me+" makan "+lbl(a);
 }else if(k==="set"){
  const X=s.pile[s.pile.length-1];
  if(s.phase!=="draw"||s.lb!==prev||!X)return;
  // Semua kartu set yang mungkin (kartu tangan yang bisa ditukar dengan X sehingga seluruh tangan jadi kombinasi).
  // Jika pemain memilih satu (a), pakai pilihan itu; jika tidak, pakai nilai tertinggi.
  const hs=hasSeri(s.laid[uid]),opts=h.filter(y=>full([...h.filter(z=>z!==y),X],hs));
  const c=opts.includes(a)?a:opts.slice().sort((p,q)=>pts(q)-pts(p))[0];
  if(!c)return msg("Belum bisa men-set");
  s.hands[uid]=[...h.filter(z=>z!==c),X];s.pile.pop();s.pile.push(c);s.sx=c;sel=[];
  // Efek skin: hanya jika pen-set punya skin kartu set ini (setfx.js).
  const fx=skinFx(c);if(fx)s.sk=fx;else delete s.sk;
  return fin(s,uid,c);
 }else if(k==="lay"){
  if(s.phase!=="act"||!a.every(c=>h.includes(c))||!meld(a))return msg("Kombinasi tidak valid");
  const L=(s.laid[uid]||[]);let ms=[a];
  // Rell sebelum ada seri di bawah: seri dari tangan ikut turun otomatis lebih dulu.
  if(!isSeri(a)&&!hasSeri(L)){
   const rest=h.filter(c=>!a.includes(c)),cs=[3,4].flatMap(n=>sub(rest,n)).filter(m=>meld(m)&&isSeri(m)&&rest.some(c=>!m.includes(c)&&!isJ(c)));
   const sr=cs.find(m=>s.eat&&m.includes(s.eat))||cs.sort((p,q)=>meldPts(q)-meldPts(p))[0];
   if(!sr)return msg("Turunkan kartu seri dulu sebelum rell (belum ada seri di tangan)");
   ms=[run(sr)?runOrd(sr):sr,a]}
  const out=ms.flat();
  if(s.eat&&!out.includes(s.eat))return msg("Turunkan dulu kombinasi yang berisi kartu yang kamu makan ("+lbl(s.eat)+")");
  if(!h.filter(c=>!out.includes(c)).some(c=>!isJ(c)))return msg("Sisakan 1 kartu (bukan joker) untuk dibuang");
  out.forEach(c=>h.splice(h.indexOf(c),1));
  s.laid[uid]=[...L,...ms.map(m=>m.join(","))];s.msg=me+(ms.length>1?" turun seri dan rell":" turun kartu");if(s.eat&&out.includes(s.eat))s.eat="";
 }else if(k==="drop"){
  if(s.phase!=="act"||!h.includes(a))return;
  if(isJ(a))return msg("Joker tidak boleh dibuang. Joker hanya bisa diturunkan dalam kombinasi atau dipakai untuk Set");
  if(s.eat)return msg("Turunkan dulu kombinasi yang berisi kartu yang kamu makan ("+lbl(s.eat)+")");
  h.splice(h.indexOf(a),1);s.pile.push(a);s.lb=uid;
  s.turn=nxt(s,uid,1);s.phase="draw";s.msg=me+" buang "+lbl(a)
 }
 sel=[];save(s);
}
