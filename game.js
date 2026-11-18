function start(){
 if(hostId()!==uid)return;
 const H0=(st&&st.hist)||[],nx=st&&st.status==="done",ids=Object.keys(players).filter(i=>live(i)&&(!nx||players[i].rd===H0.length)).sort((a,b)=>players[a].t-players[b].t).slice(0,4);
 if(ids.length<2)return;
 const d=mk(),hands={};ids.forEach(i=>hands[i]=d.splice(0,7));
 save({status:"play",order:ids,names:Object.fromEntries(ids.map(i=>[i,players[i].name])),hands,deck:d,pile:[],laid:{},eat:"",hist:H0,turn:ids[0],phase:"draw",lb:"",msg:players[ids[0]].name+" jalan duluan"});
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
 else s.msg="Tumpukan habis, permainan selesai";
 s.winner=c?by:s.order.reduce((a,b)=>s.sc[b]>s.sc[a]?b:a);
 s.hist=[...(s.hist||[]),{sc:Object.assign({},s.sc),names:Object.assign({},s.names),win:s.winner,vic:c?s.lb:""}];
 save(s);
}

function go(k,a){
 if(!st||st.status!=="play"||st.turn!==uid)return;
 const s=JSON.parse(JSON.stringify(st)),h=s.hands[uid],O=s.order,me=nm(uid);
 const prev=O[(O.indexOf(uid)+O.length-1)%O.length];
 s.laid=s.laid||{};
 if(k==="draw"){
  if(s.phase!=="draw")return;
  if(!s.deck.length)return fin(s);
  h.push(s.deck.shift());s.phase="act";s.msg=me+" mencabut kartu";
 }else if(k==="take"){
  if(s.phase!=="draw"||!s.pile.length)return;
  const i=s.pile.indexOf(a);if(i<0)return;if(s.pile.length-i>5)return msg("Hanya boleh makan dari 5 kartu teratas");
  const nh=[...h,...s.pile.slice(i)],hasSeri=(s.laid[uid]||[]).some(m=>isSeri(m.split(",")));
  const ok=[2,3].some(n=>sub(h,n).some(x=>{const m=[a,...x];return meld(m)&&(isSeri(m)||hasSeri)&&nh.length-m.length>=1&&nh.some(c=>!m.includes(c)&&!isJ(c))}));
  if(!ok)return msg("Kartu itu belum bisa langsung kamu turunkan (harus cocok dengan kartu di tangan; rell butuh seri lebih dulu)");
  h.push(...s.pile.splice(i));s.eat=a;s.phase="act";s.msg=me+" memakan kartu "+lbl(a)+" dan semua di atasnya";
 }else if(k==="set"){
  const X=s.pile[s.pile.length-1];
  if(s.phase!=="draw"||s.lb!==prev||!X)return;
  const c=h.filter(y=>full([...h.filter(z=>z!==y),X])).sort((p,q)=>pts(q)-pts(p))[0];
  if(!c)return msg("Belum bisa men-set");
  s.hands[uid]=[...h.filter(z=>z!==c),X];s.pile.pop();s.pile.push(c);s.sx=c;sel=[];
  return fin(s,uid,c);
 }else if(k==="lay"){
  if(s.phase!=="act"||!a.every(c=>h.includes(c))||!meld(a))return msg("Kombinasi tidak valid");
  if(s.eat&&!a.includes(s.eat))return msg("Turunkan dulu kombinasi yang berisi kartu yang kamu makan ("+lbl(s.eat)+")");
  if(!h.filter(c=>!a.includes(c)).some(c=>!isJ(c)))return msg("Sisakan 1 kartu (bukan joker) untuk dibuang");
  const L=(s.laid[uid]||[]);
  if(!isSeri(a)&&!L.some(m=>isSeri(m.split(","))))return msg("Turunkan kartu seri dulu sebelum rell");
  a.forEach(c=>h.splice(h.indexOf(c),1));
  s.laid[uid]=[...L,a.join(",")];s.msg=me+" menurunkan kartu";if(s.eat&&a.includes(s.eat))s.eat="";
 }else if(k==="drop"){
  if(s.phase!=="act"||!h.includes(a))return;
  if(isJ(a))return msg("Joker tidak boleh dibuang. Joker hanya bisa diturunkan dalam kombinasi atau dipakai untuk Set");
  if(s.eat)return msg("Turunkan dulu kombinasi yang berisi kartu yang kamu makan ("+lbl(s.eat)+")");
  h.splice(h.indexOf(a),1);s.pile.push(a);s.lb=uid;
  s.turn=O[(O.indexOf(uid)+1)%O.length];s.phase="draw";s.msg=me+" membuang "+lbl(a);
 }
 sel=[];save(s);
}

