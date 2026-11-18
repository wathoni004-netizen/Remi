function scoreHtml(H){
 const ids=[],nmx={};
 H.forEach(r=>Object.keys(r.sc||{}).forEach(i=>{if(!ids.includes(i))ids.push(i);nmx[i]=(r.names&&r.names[i])||nmx[i]||"?"}));
 const tot=ids.map(i=>H.reduce((t,r)=>t+((r.sc||{})[i]||0),0)),mx=Math.max(...tot);
 const cell=(r,i)=>{const v=(r.sc||{})[i];if(v==null)return"<td>-</td>";return`<td class="${r.vic===i?"vc":r.win===i?"wn":""}">${v}</td>`};
 return `<b>Catatan poin</b><div style="overflow-x:auto;margin-top:6px"><table class="tbl"><tr><th>Ronde</th>${ids.map(i=>`<th>${esc(nmx[i])}</th>`).join("")}</tr>${H.map((r,k)=>`<tr><td>${k+1}</td>${ids.map(i=>cell(r,i)).join("")}</tr>`).join("")}<tr class="tt"><th>Total poin</th>${tot.map(t=>`<th>${t}${t===mx?" 👑":""}</th>`).join("")}</tr></table></div><div class="mut" style="margin-top:6px">Hijau = menang ronde · Merah = terkena set</div>`}
function handView(h){
 ord=ord.filter(c=>h.includes(c));h.forEach(c=>{if(!ord.includes(c))ord.push(c)});
 const A=arrange(ord);
 if(auto)ord=A.groups.flat();
 const starts=new Set();
 if(auto&&A.groups.length>1)A.groups.slice(1).forEach(g=>starts.add(g[0]));
 return{live:auto?A.live:adj(ord),starts}}
function mv(d){
 if(!sel.length)return;auto=false;const o=ord.slice();
 if(d<0){for(let i=1;i<o.length;i++)if(sel.includes(o[i])&&!sel.includes(o[i-1]))[o[i-1],o[i]]=[o[i],o[i-1]]}
 else{for(let i=o.length-2;i>=0;i--)if(sel.includes(o[i])&&!sel.includes(o[i+1]))[o[i],o[i+1]]=[o[i+1],o[i]]}
 ord=o;render()}
const pileLay=(n,RW,RH)=>{
 const r=125/175,W=Math.min(RW/9.24,RH*r/7.11,28),H=W/r,ox=(RW-9.24*W)/2,oy=(RH-7.11*H)/2,out=[];
 const seg=(x0,y0,x1,y1,k,e)=>{for(let j=0;j<k&&out.length<n;j++){const t=k>1?j/(k-1):0;out.push({x:ox+(x0+(x1-x0)*t)*W,y:oy+(y0+(y1-y0)*t)*H,e})}};
 seg(1.56,0,7.74,0,13,"T");seg(8.24,.5,8.24,5.61,11,"R");seg(7.74,6.11,.5,6.11,15,"B");seg(0,5.61,0,1,10,"L");
 if(out.length<n){const d=1,a=8.24-d,b=6.11-d;
  seg(d-1,d,a-.52,d,Math.round((a-.52-d+1)/.515)+1,"T");seg(a,d,a,b-.5,Math.round((b-.5-d)/.511)+1,"R");
  seg(a-.5,b,d+.5,b,Math.round((a-d-1)/.515)+1,"B");seg(d,b-.5,d,d+1,Math.round((b-.5-d-1)/.511)+1,"L")}
 while(out.length<n)out.push(Object.assign({},out[out.length-1]||{x:ox,y:oy,e:"T"}));
 return{p:out,W,H,SX:.515*W,SY:.511*H,fs:Math.max(8,Math.round(W*.35))}};
const pcard=(c,i,on,hl,xs,nw,p,L)=>{
 const j=isJ(c),s=j?"🃏":SU[suit(c)],r=j?"JK":(RK[rank(c)]||rank(c)),e=p.e,v=e==="T"||e==="B",ex=xs||nw,W=L.W,H=L.H,f=n=>n.toFixed(1),sx=f(L.SX),sw=f(L.SX-1);
 const lb={T:"left:0;top:2px;width:"+sw+"px",R:"left:2px;top:2px",B:"right:0;top:2px;width:"+sw+"px",L:"left:2px;bottom:2px"}[e];
 let dc="";
 if(ex){
  const cx=e==="T"?(W+L.SX)/2:e==="R"?0:e==="B"?(W-L.SX)/2:W,cy=e==="T"?H:e==="R"?(H+L.SY)/2:e==="B"?0:(H-L.SY)/2;
  if(xs){const w=Math.round(W*1.3),q=Math.round(W*.56),x=v?(W-w)/2:e==="R"?1-w:W-1,y=e==="T"?H-1:e==="B"?1-q:(H-q)/2;
   dc=`<i class="rb" style="left:${f(x-1)}px;top:${f(y-1)}px;width:${w}px;height:${q}px;line-height:${q}px;font-size:${Math.round(q*.62)}px">SET ${s}</i>`}
  else{const D=Math.max(14,Math.round(W*.74));
   dc=`<i class="bd" style="left:${f(cx-D/2-1)}px;top:${f(cy-D/2-1)}px;width:${D}px;height:${D}px;font-size:${Math.round(D*.7)}px">${s}</i><i class="sp" style="left:${f(cx-D/2-3)}px;top:${f(cy-D/2-1)}px;font-size:6px">✦</i><i class="sp" style="left:${f(cx+D/2+1)}px;top:${f(cy+D/2)}px;font-size:5px">✦</i>`}}
 const tx=xs?r:r+(v?"<br>":"")+s;
 return `<button class="c pk ${red(c)?"r":""}${hl&&!xs?" hl":""}${on?" tk":""}${xs?" xs":""}${ex?" ex":""}" style="left:${f(p.x)}px;top:${f(p.y)}px;width:${f(W)}px;height:${f(H)}px;font-size:${L.fs}px;z-index:${xs?9999:i+1}" ${on?'data-c="'+c+'"':"disabled"}><i class="lb${v?" v":""}" style="${lb}">${tx}</i>${dc}</button>`};
const card=(c,tag,on,x,sy)=>{const j=isJ(c),s=j?"🃏":SU[suit(c)],r=j?"JK":(RK[rank(c)]||rank(c))+s;return `<${tag} class="c ${red(c)?"r":""} ${x||""}"${sy?` style="${sy}"`:""} ${tag==="button"?(on?'data-c="'+c+'"':"disabled"):""}><i class="rk">${r}</i><i class="ct">${s}</i></${tag}>`};
const laid=i=>((st.laid||{})[i]||[]).map(m=>`<span class="mt">${m.split(",").map(c=>card(c,"span",0,i===uid?"sm":"mn")).join("")}</span>`).join("");

function render(){
 if(!room)return;
 if(drag&&drag.on){pend=true;return}
 $("#ky").hidden=!(st&&st.status==="play");
 const lob=$("#lobby"),pl=$("#play");
 {const H0=(st&&st.hist)||[],ss=st&&st.status,sh=H0.length&&(ss==="play"||(ss==="done"&&players[uid]&&players[uid].rd===H0.length));$("#score").hidden=!sh;if(sh)$("#score").innerHTML=scoreHtml(H0)}
 if(!st||st.status==="lobby"){
  const ids=Object.keys(players).filter(live).sort((a,b)=>players[a].t-players[b].t);
  pl.hidden=true;lob.hidden=false;
  lob.innerHTML=`<div class="mut">Ruang: <b>${esc(room)}</b> · pemain masuk (maks 4)</div><div class="row" style="margin:10px 0">${ids.map(i=>`<span class="pl">${esc(players[i].name)}</span>`).join("")}</div><div class="act"><button class="pri" id="sb" ${ids.length<2?"disabled":""}>${ids.length<2?"Menunggu teman masuk…":"Mulai game"}</button></div>`;
  $("#sb").onclick=start;return;
 }
 const HH=st.hist||[];
 if(st.status==="done"&&players[uid]&&players[uid].rd===HH.length){
  const rd=Object.keys(players).filter(i=>live(i)&&players[i].rd===HH.length).sort((a,b)=>players[a].t-players[b].t),wt=Object.keys(players).filter(i=>live(i)&&players[i].rd!==HH.length&&(st.order||[]).includes(i));
  pl.hidden=true;lob.hidden=false;
  lob.innerHTML=`<div class="mut">Ronde ${HH.length} selesai · siap lanjut (maks 4)</div><div class="row" style="margin:10px 0">${rd.map(i=>`<span class="pl">${esc(players[i].name)}</span>`).join("")}</div>${wt.length?`<div class="mut">Belum memilih: ${wt.map(i=>esc(players[i].name)).join(", ")}</div>`:""}<div class="act"><button class="pri" id="sb" ${rd.length<2?"disabled":""}>${rd.length<2?"Menunggu teman lanjut…":"Mulai ronde baru"}</button><button class="pri sec" id="kx">Keluar</button></div>`;
  $("#sb").onclick=start;$("#kx").onclick=leave;return}
 lob.hidden=true;pl.hidden=false;
 const O=st.order,h=(st.hands&&st.hands[uid])||[],done=st.status==="done",mine=!done&&st.turn===uid,ph=st.phase;
 {const sg=st.status+"|"+st.deck.length+"|"+st.pile.length+"|"+st.turn+"|"+ph;
  if(sig&&sg!==sig){if(done&&!wasDone)beep(st.sx?"set":"win");else if(!done&&mine&&!wasMine){beep("turn");buzz()}else if(!done)beep("tick")}
  sig=sg;wasDone=done;wasMine=!done&&mine;
  document.title=(!done&&mine?"🔔 Giliranmu! · ":"")+"Remi Online"}
 sel=sel.filter(c=>h.includes(c));
 const prev=O[(O.indexOf(uid)+O.length-1)%O.length],X=st.pile[st.pile.length-1];
 const cs=mine&&ph==="draw"&&st.lb===prev&&!!X&&h.some(y=>full([...h.filter(z=>z!==y),X]));
 const canTake=mine&&ph==="draw"&&st.pile.length>=1;
 const seat=i=>`<div class="${st.turn===i&&!done?"on":""}"><span class="nm">${esc(nm(i))} · ${st.hands[i].length}</span>${done?`<div class="ml">${st.hands[i].map(c=>card(c,"span",0,"mn")).join("")}</div>`:`<div class="bk">${'<span class="c back sm"></span>'.repeat(Math.min(st.hands[i].length,14))}</div>`}<div class="ml">${laid(i)}</div></div>`;
 const op=O.filter(i=>i!==uid),pos=op.length<2?[0,op[0],0]:op.length===2?[op[0],0,op[1]]:[op[0],op[1],op[2]];
 $("#sL").innerHTML=pos[0]?seat(pos[0]):"";$("#sT").innerHTML=pos[1]?seat(pos[1]):"";$("#sR").innerHTML=pos[2]?seat(pos[2]):"";
 $("#info").textContent=`Di bawah: ${st.pile.length} kartu${canTake?" · ketuk salah satu dari 5 kartu teratas untuk memakan":""}`;
 $("#dkn").textContent="Cabutan: "+st.deck.length;$("#deck").className="c back lg"+(mine&&ph==="draw"?" tk":"");
 const ring=$("#ring"),RW=ring.clientWidth||200,RH=ring.clientHeight||230,np=st.pile.length;
 const PL=pileLay(np,RW,RH);
 $("#pile").innerHTML=np?st.pile.map((c,i)=>{
  const hl=np-i<=5;
  return pcard(c,i,canTake&&hl,hl,done&&st.sx===c,i===np-1,PL.p[i],PL)}).join(""):'<span class="lab">Belum ada kartu dibuang</span>';
 $("#mine").innerHTML=laid(uid)||'<span class="lab">Kartu hidupmu akan muncul di sini</span>';
 let s=esc(st.msg||"");
 if(done)s=s+"<br>"+O.map(i=>{const f=(st.fb||{})[i];return esc(nm(i))+": "+(f?"hidup "+f.up+" − belum jadi "+f.dn+(f.st?(f.st>0?" + set ":" − set ")+Math.abs(f.st):"")+" = ":"")+st.sc[i]+" poin"}).join("<br>")+"<br>Pemenang: "+esc(nm(st.winner))+" 🎉";
 else if(!O.includes(uid))s="Game sedang berjalan, kamu menonton.";
 else if(mine)s=ph==="draw"?"Giliranmu: cabut kartu"+(cs?" atau Set!":""):st.eat?"Turunkan kombinasi berisi kartu yang kamu makan ("+lbl(st.eat)+"), lalu buang 1 kartu":"Giliranmu: turunkan kombinasi (opsional), lalu buang 1 kartu (joker tidak boleh dibuang)";
 else s=esc(st.msg||"")+" · giliran "+esc(nm(st.turn));
 $("#st").innerHTML=s;

 const used=Object.values(st.laid||{}).flat().flatMap(m=>m.split(",")),rd=done?[]:O.filter(i=>i!==uid&&ready(st.hands[i]||[],used));
 $("#alr").hidden=!rd.length;$("#alr").textContent=rd.length?"🔺 "+rd.map(i=>nm(i)).join(", ")+" siap men-set, hati-hati!":"";
 $("#bd").hidden=!(mine&&ph==="draw");$("#bs").hidden=!cs;
 $("#bl").hidden=!(mine&&ph==="act"&&sel.length>=3);$("#bx").hidden=!(mine&&ph==="act"&&sel.length===1);
 const V=handView(h),hs=ord,hd=$("#hand"),W=(hd.clientWidth||340)-8,gp=hs.filter(c=>V.starts.has(c)).length,step=hs.length>1?Math.min(36,(W-54-gp*14)/(hs.length-1)):0;
 hd.style.setProperty("--ov",(step-54)+"px");
 hd.innerHTML=hs.map(c=>card(c,"button",true,"lg"+(sel.includes(c)?" sl":"")+(V.live.has(c)?" lv":"")+(V.starts.has(c)?" gs":"")+(mine&&st.eat===c?" ea":""))).join("");
 $("#arr").hidden=!O.includes(uid);$("#mvl").disabled=$("#mvr").disabled=!sel.length;$("#aut").textContent="✨ Auto-susun: "+(auto?"ON":"OFF");
 $("#again").hidden=!done;
}
$("#hand").onclick=e=>{if(noclick)return;const b=e.target.closest("[data-c]");if(!b)return;const c=b.dataset.c;sel=sel.includes(c)?sel.filter(x=>x!==c):[...sel,c];render()};
$("#pile").onclick=e=>{const b=e.target.closest("[data-c]");if(b)go("take",b.dataset.c)};
$("#bd").onclick=()=>go("draw");$("#deck").onclick=()=>go("draw");
$("#bs").onclick=()=>go("set");
$("#bl").onclick=()=>go("lay",sel.slice());
$("#bx").onclick=()=>go("drop",sel[0]);
addEventListener("pointerdown",()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}},{once:true});
function beep(k){
 if(!snd)return;
 try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();
  const Q={turn:[[660,.12],[880,.2]],tick:[[520,.05]],pop:[[700,.06],[920,.08]],set:[[392,.15],[523,.15],[659,.15],[784,.35]],win:[[523,.12],[659,.12],[784,.12],[1047,.3]]};
  let t=AC.currentTime;
  (Q[k]||[]).forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain();o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.2,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d+.02);t+=d})
 }catch(e){}}
function buzz(){try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}}
{const HD=$("#hand");
 HD.addEventListener("pointerdown",e=>{const b=e.target.closest("[data-c]");if(!b)return;drag={el:b,c:b.dataset.c,x0:e.clientX,pid:e.pointerId,on:false}});
 HD.addEventListener("pointermove",e=>{
  if(!drag||e.pointerId!==drag.pid)return;
  const dx=e.clientX-drag.x0;
  if(!drag.on){if(Math.abs(dx)<12)return;drag.on=true;try{drag.el.setPointerCapture(e.pointerId)}catch(_){}drag.el.style.zIndex=50;drag.el.style.transition="none"}
  drag.el.style.transform="translate("+dx+"px,-16px)"});
 const fin2=(e,cancel)=>{
  if(!drag||e.pointerId!==drag.pid)return;
  const d=drag;drag=null;
  if(d.on){
   noclick=true;setTimeout(()=>{noclick=false},60);
   if(!cancel){
    const r=d.el.getBoundingClientRect(),cx=r.left+r.width/2;
    const idx=[...HD.querySelectorAll("[data-c]")].filter(x=>x!==d.el).filter(x=>{const q=x.getBoundingClientRect();return q.left+q.width/2<cx}).length;
    const o=ord.filter(c=>c!==d.c);o.splice(idx,0,d.c);ord=o;auto=false}
   pend=false;render()}
  else if(pend){pend=false;render()}};
 HD.addEventListener("pointerup",e=>fin2(e,false));
 HD.addEventListener("pointercancel",e=>fin2(e,true))}
$("#mvl").onclick=()=>mv(-1);$("#mvr").onclick=()=>mv(1);
$("#aut").onclick=()=>{auto=!auto;render()};
addEventListener("resize",()=>{if(st)render()});
