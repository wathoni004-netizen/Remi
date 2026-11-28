// Efek Set skin Megalodon (L06), 9 detik: air muncul serempak dari bawah meja, seekor hiu berenang di dalam air (hanya sirip
// punggungnya tampak), melompat 3x (baru seluruh badannya terlihat), lalu menerkam korban, mengoyaknya (kepala dikibas, rahang menggigit berulang), pergi, lalu cincin "SET!" + poin.
// Hiunya gambar Boss yang diiris dan ditempel per bingkai pada tulang punggung meliuk (mengikuti lintasan kepala),
// jadi badannya melengkung saat berbelok dan ekornya mengibas.
// Suara: SC.L06 di suara.js. Dipanggil dari playSetFx (setfx.js).
(()=>{
const acak=i=>{const v=Math.sin(i*127.1+3.7)*43758.5453;return v-Math.floor(v)};
const jepit=v=>Math.min(1,Math.max(0,v)),f=(t,a,b)=>jepit((t-a)/(b-a)),halus=u=>u*u*(3-2*u),antara=(a,b,p)=>a+(b-a)*p;
const LOMPAT=[3060,3860,4660],GIGIT=[6100,6500,6900,7300],SERANG=6100;
// Air mengikuti desain Boss (desain/megalodon/air.ai).
const AIR=new Image();AIR.src="img/mg-air.webp?v=1";
// Hiunya gambar buatan Boss (mg-hiu.webp 840x440, kepala di kanan, garis tengah badan di y 230).
const HIU=new Image();HIU.src="img/mg-hiu.webp?v=2";
// Rahang bawah (koordinat gambar) yang diputar di engsel (610,300) untuk mengatup.
const RAHANG=[[72.6,64.8],[77.4,64.8],[83.3,69.3],[86.9,73.2],[90.7,68.2],[91.1,79.5],[87.5,84.5],[78.6,83.6],[73.2,75]].map(([x,y])=>[x*8.4,y*4.4]);
// Tahap ekor: gelombang renang menjalar dari kepala ke ekor; makin cepat saat menyerang.
const fase=t=>t*.0098+Math.max(0,t-5450)*.007+Math.max(0,t-SERANG)*.012;

const N=40;
// Lengkung tulang punggung dibatasi supaya badan tidak pernah terlipat (tekukan terlalu tajam membuat gambar sobek).
function lenturkan(P){const Q=[P[0]];let a0=null;
 for(let i=1;i<P.length;i++){const dx=P[i].x-P[i-1].x,dy=P[i].y-P[i-1].y,d=Math.hypot(dx,dy);let a=d>.01?Math.atan2(dy,dx):a0||0;
  if(a0!==null){let beda=Math.atan2(Math.sin(a-a0),Math.cos(a-a0));a=a0+Math.max(-.05,Math.min(.05,beda))}
  const p=Q[i-1];Q.push({x:p.x+Math.cos(a)*d,y:p.y+Math.sin(a)*d});a0=a}
 return Q}
// Gambar hiu dibentangkan di atas jaring segitiga yang mengikuti tulang punggung P (moncong dulu). Titik sambungan
// dipakai bersama oleh segitiga bersebelahan, jadi badannya utuh tanpa sekat saat melengkung atau berputar balik.
function gambarHiu(g,P,panjang,mulut,t){
 if(!HIU.complete||!HIU.naturalWidth)return;
 const k=panjang/840,pada=s=>{const q=jepit(s)*N,i=Math.min(N-1,q|0),u=q-i;return {x:antara(P[i].x,P[i+1].x,u),y:antara(P[i].y,P[i+1].y,u)}};
 // Arah hadap dipakai sama untuk seluruh badan: saat berbalik, badan menipis sebentar lalu menghadap sisi lain.
 let hx=0;for(let i=0;i<N;i+=4){const dx=P[i].x-P[i+4].x,dy=P[i].y-P[i+4].y;hx+=dx/(Math.hypot(dx,dy)||1)}hx/=N/4;
 const q=Math.tanh(hx*6),sisi=(q<0?-1:1)*Math.max(.14,Math.abs(q));
 // titik layar untuk titik gambar (x, y): garis tengah badan di y 230
 const peta=(x,y)=>{const s=1-x/840,p=pada(s),a=pada(s-.06),b=pada(s+.06),dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy)||1,v=(y-230)*k*sisi;return [p.x-dy/d*v,p.y+dx/d*v]};
 const segitiga=(S,D)=>{const [[x0,y0],[x1,y1],[x2,y2]]=S,[[u0,v0],[u1,v1],[u2,v2]]=D,det=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0);if(!det)return;
  const a=((u1-u0)*(y2-y0)-(u2-u0)*(y1-y0))/det,c=((u2-u0)*(x1-x0)-(u1-u0)*(x2-x0))/det,b=((v1-v0)*(y2-y0)-(v2-v0)*(y1-y0))/det,d=((v2-v0)*(x1-x0)-(v1-v0)*(x2-x0))/det;
  const cx=(u0+u1+u2)/3,cy=(v0+v1+v2)/3;g.save();g.beginPath();D.forEach(([u,v],i)=>{const l=Math.hypot(u-cx,v-cy)||1;g[i?"lineTo":"moveTo"](u+(u-cx)/l*.9,v+(v-cy)/l*.9)});g.clip();
  g.transform(a,b,c,d,u0-a*x0-c*y0,v0-b*x0-d*y0);const kiri=Math.max(0,Math.min(x0,x1,x2)-3),kanan=Math.min(840,Math.max(x0,x1,x2)+3);g.drawImage(HIU,kiri,0,kanan-kiri,440,kiri,0,kanan-kiri,440);g.restore()};
 const KOLOM=18,BARIS=[0,230,440];
 for(let i=0;i<KOLOM;i++){const x0=i*840/KOLOM,x1=(i+1)*840/KOLOM;
  for(let j=0;j<2;j++){const y0=BARIS[j],y1=BARIS[j+1],A=[x0,y0],B=[x1,y0],C=[x1,y1],D=[x0,y1];
   segitiga([A,B,C],[peta(...A),peta(...B),peta(...C)]);segitiga([A,C,D],[peta(...A),peta(...C),peta(...D)])}}
 // rahang mengatup: sedikit saat berenang, penuh tepat saat menggigit
 const tutup=t>=SERANG?1-mulut:.3*(1-mulut);
 if(tutup>.03){const c=Math.cos(-.23*tutup),n=Math.sin(-.23*tutup);g.save();g.beginPath();
  RAHANG.forEach(([x,y],i)=>g[i?"lineTo":"moveTo"](...peta(610+(x-610)*c-(y-300)*n,300+(x-610)*n+(y-300)*c)));g.closePath();g.clip();
  const o=peta(610,300),ex=peta(710,300),ey=peta(610,400),a=(ex[0]-o[0])/100,b=(ex[1]-o[1])/100,cc=(ey[0]-o[0])/100,d=(ey[1]-o[1])/100;
  g.transform(a,b,cc,d,o[0],o[1]);g.rotate(-.23*tutup);g.translate(-610,-300);g.drawImage(HIU,0,0);g.restore()}
}

let css=document.createElement("style");
css.textContent=".sfx.mgl{background:rgba(3,8,30,.4)}.mgl .dunia{position:absolute;inset:0;overflow:hidden}.mgl .dunia.kotak{position:relative;inset:auto;height:330px;flex:none;border-radius:12px;background:#0b2244}.mgl .dunia>*{position:absolute;pointer-events:none;left:0;top:0}.mgl canvas{width:100%;height:100%}.mgl .krt,.mgl .cin,.mgl .seru,.mgl .pen,.mgl .krauk{opacity:0}.mgl .nm{transform:translate(-50%,-50%);z-index:4;padding:5px 14px;border-radius:10px;background:#000a;color:#fff;font-weight:700;white-space:nowrap}.mgl .oleh{background:#12e8e8;color:#04163a}.mgl .seru,.mgl .pen{width:100%;text-align:center;z-index:5;white-space:nowrap}.mgl .seru{font:900 italic 40px Impact,sans-serif;color:#ffe27a;-webkit-text-stroke:2px #5a3200;text-shadow:0 2px 0 #fff3b0,0 5px 0 #06285c,0 0 18px #ffb400,0 0 36px #12f5ee;letter-spacing:2px}.mgl .pen{font:900 46px sans-serif;color:#ff5a4f;text-shadow:0 3px 0 #000}.mgl .krauk{z-index:5;font:900 italic 34px Impact,sans-serif;color:#ffe27a;-webkit-text-stroke:2px #06285c;white-space:nowrap}.mgl .cin{z-index:5;width:170px;height:170px;filter:drop-shadow(0 0 16px #ffcf4a)}";
document.head.appendChild(css);
const cincin=`<svg class="cin" viewBox="0 0 170 170" overflow="visible"><defs><linearGradient id="mgcin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14f0e8"/><stop offset="1" stop-color="#071b60"/></linearGradient></defs><path d="M68 16C76 2 88-8 104-12C100 0 102 10 110 18Z" fill="url(#mgcin)"/><circle cx="85" cy="85" r="72" fill="#f4fdff" stroke="url(#mgcin)" stroke-width="13"/><circle cx="85" cy="85" r="82" fill="none" stroke="#12f5ee" stroke-width="4" opacity=".55"/><text x="85" y="101" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" font-size="46" fill="#0a5a9a">SET!</text></svg>`;
// A = posisi pen-set, V = posisi korban (piksel layar); kosong = kotak pratinjau.
window.MGL=(oleh,korban,pen,A,V)=>{
 const ov=document.createElement("div");ov.className="sfx mgl";
 const kotak=!(A&&V&&Math.hypot(V.x-A.x,V.y-A.y)>40);
 const L=kotak?Math.min(380,innerWidth-16):innerWidth,T=kotak?330:innerHeight;
 // R = daerah air: satu layar penuh (atau seluruh kotak pratinjau).
 const R={left:0,top:0,right:L,bottom:T},W=L,H=T,CX=L/2,sudutMeja=kotak?12:0;
 if(kotak){A={x:L*.3,y:T-30};V={x:L*.68,y:105}}
 ov.innerHTML=`<div class="dunia${kotak?" kotak":""}"><canvas></canvas><img class="krt" src="img/mg-kartu.svg?v=1" alt=""><canvas></canvas><canvas></canvas>${cincin}<div class="nm korban"></div><div class="nm oleh"></div><div class="krauk">KRAUK!</div><div class="seru">MEGALODON!</div><div class="pen"></div></div>`;
 const q=c=>ov.querySelector("."+c),dunia=q("dunia");
 if(kotak){dunia.style.width=L+"px";dunia.style.transform="scale("+Math.min(1,(innerHeight-16)/330)+")"}
 q("korban").textContent=korban;q("oleh").textContent=oleh;q("pen").textContent=pen;
 document.body.appendChild(ov);
 const u=Math.min(1.25,Math.max(.65,Math.min(W,H)/320));
 const nama=q("korban"),taruh=(e,p)=>{const w=e.offsetWidth/2+4;e.style.left=Math.min(L-w,Math.max(w,p.x))+"px";e.style.top=Math.min(T-18,Math.max(18,p.y))+"px"};
 taruh(nama,V);taruh(q("oleh"),{x:A.x,y:A.y+30*u});
 // g1 = air, g3 = hiu, g2 = buih dan efek di atasnya. Air digambar di resolusi lebih rendah supaya ringan di HP.
 const r=Math.min(1.5,devicePixelRatio||1),rAir=.75,[g1,g3,g2]=[...ov.querySelectorAll("canvas")].map((c,i)=>{const k=i?r:rAir;c.width=L*k;c.height=T*k;return c.getContext("2d")});
 const lembar=document.createElement("canvas"),siluet=document.createElement("canvas"),rl=r;lembar.width=L*rl;lembar.height=T*rl;siluet.width=L/2;siluet.height=T/2;const gl=lembar.getContext("2d"),gs=siluet.getContext("2d");
 const krt=q("krt"),cin=q("cin"),seru=q("seru"),pn=q("pen"),krauk=q("krauk");
 // bawah = korban di luar meja (tangan kita).
 const bawah=V.y>R.bottom-20,kanan=V.x>=CX?1:-1,PJ=Math.min(W*.66,250*u);
 // Lintasan kepala [waktu, x, y]: masuk dari bawah, berkeliling meja, melompat, menyelam, lalu meluncur ke korban.
 const M=(fx,fy)=>[R.left+fx*W,R.top+fy*H];
 const KUNCI=[[800,...M(-.12,.95)],[1500,...M(.32,.78)],[2150,...M(.8,.62)],[2600,...M(.68,.3)],[3060,...M(.32,.3)],[3500,...M(.18,.56)],[3860,...M(.42,.76)],[4280,...M(.82,.62)],[4660,...M(.62,.34)],[5080,...M(.24,.38)],
  [5450,V.x-kanan*W*.48,V.y+(bawah?-.38:.14)*H],[5750,V.x-kanan*W*.3,V.y+(bawah?-.34:.36)*H],[SERANG,V.x,V.y]];
 const miring=i=>{const a=KUNCI[Math.max(0,i-1)],b=KUNCI[Math.min(KUNCI.length-1,i+1)],d=b[0]-a[0]||1;return [(b[1]-a[1])/d,(b[2]-a[2])/d]};
 const jalur=t=>{const n=KUNCI.length-1;if(t<=KUNCI[0][0]){const m=miring(0),d=t-KUNCI[0][0];return {x:KUNCI[0][1]+m[0]*d,y:KUNCI[0][2]+m[1]*d}}
  let i=0;while(i<n-1&&t>KUNCI[i+1][0])i++;const a=KUNCI[i],b=KUNCI[i+1],h=b[0]-a[0],s=jepit((t-a[0])/h),m=miring(i),k=miring(i+1),s2=s*s,s3=s2*s,
   v=j=>(2*s3-3*s2+1)*a[j+1]+(s3-2*s2+s)*h*m[j]+(-2*s3+3*s2)*b[j+1]+(s3-s2)*h*k[j];return {x:v(0),y:v(1)}};
 const akhir=jalur(SERANG),sebelum=jalur(SERANG-60),h0=Math.atan2(akhir.y-sebelum.y,akhir.x-sebelum.x);
 // Tulang punggung berenang: badan menapaki jejak kepala, ditambah gelombang renang yang membesar ke ekor.
 const tulangRenang=(t,amp)=>{const jejak=[jalur(t)];let d=0,tt=t;const D=[0];
  while(d<PJ&&D.length<400){tt-=10;const p=jalur(tt),a=jejak[jejak.length-1];d+=Math.hypot(p.x-a.x,p.y-a.y);jejak.push(p);D.push(d)}
  const P=[];let j=1;for(let i=0;i<=N;i++){const s=i/N,c=s*PJ;while(j<D.length-1&&D[j]<c)j++;const a=jejak[j-1],b=jejak[j],k=jepit((c-D[j-1])/(D[j]-D[j-1]||1)),dx=a.x-b.x,dy=a.y-b.y,l=Math.hypot(dx,dy)||1,
    w=Math.sin(fase(t)-s*5)*PJ*.07*amp*(.04+s*s);P.push({x:antara(a.x,b.x,k)-dy/l*w,y:antara(a.y,b.y,k)+dx/l*w})}return P};
 // Tulang punggung saat memangsa: kepala bertahan di mangsa, badan dan ekor mencambuk.
 const tulangMangsa=(t,kepala,hadap,amp)=>{const P=[{x:kepala.x,y:kepala.y}],lg=PJ/N;
  for(let i=1;i<=N;i++){const s=i/N,a=hadap+Math.PI+Math.sin(fase(t)-s*4.2)*amp*.75*s,p=P[i-1];P.push({x:p.x+Math.cos(a)*lg,y:p.y+Math.sin(a)*lg})}return P};
 // Sirip punggung (dipotong dari gambar Boss) membelah permukaan air; badan hiu tersembunyi di bawahnya.
 const sirip=(g,t,pos,vx,vy,tampak)=>{if(tampak<=0||!HIU.complete||!HIU.naturalWidth)return;
  const d=Math.hypot(vx,vy)||1,hx=vx/d,hy=vy/d,q=Math.tanh(hx*6),sisi=(q<0?-1:1)*Math.max(.14,Math.abs(q)),k=PJ/840*1.55,naik=Math.sin(t/170)*3*u,px=-hy,py=hx;
  g.save();g.globalAlpha=tampak;g.lineCap="round";
  // jejak air berbentuk V di belakang sirip
  for(const sg of [1,-1])for(let i=0;i<3;i++){const a=(14+i*10)*u,b=(60+i*48)*u,lebar=(10+i*17)*u;g.globalAlpha=tampak*(.5-i*.14);g.strokeStyle="#e8ffff";g.lineWidth=(3.5-i)*u;g.beginPath();
   g.moveTo(pos.x+hx*30*u,pos.y+hy*30*u);g.quadraticCurveTo(pos.x-hx*a+px*sg*lebar,pos.y-hy*a+py*sg*lebar,pos.x-hx*b+px*sg*(lebar+14*u),pos.y-hy*b+py*sg*(lebar+14*u));g.stroke()}
  for(let i=0;i<9;i++){const v=(t/520+acak(i+3))%1;g.globalAlpha=tampak*(1-v)*.8;g.lineWidth=1.5*u;g.beginPath();g.arc(pos.x-hx*v*110*u+(acak(i+20)-.5)*50*u*v,pos.y-hy*v*110*u+(acak(i+40)-.5)*40*u*v,(2+4*v)*u,0,7);g.stroke()}
  g.globalAlpha=tampak;g.translate(pos.x,pos.y+naik);g.rotate(hy*.22*(sisi<0?-1:1));g.scale(k*sisi,k);g.translate(-445,-132);
  g.beginPath();[[350,134],[386,96],[398,46],[374,0],[432,16],[480,68],[536,126],[500,134],[460,129],[420,137],[385,130]].forEach(([x,y],i)=>g[i?"lineTo":"moveTo"](x,y));g.closePath();g.clip();g.drawImage(HIU,0,0,840,440);g.restore();
  // buih di garis air
  g.save();g.strokeStyle="#e8ffff";g.fillStyle="rgba(190,240,255,.45)";g.globalAlpha=tampak;g.beginPath();g.ellipse(pos.x,pos.y+naik+2*u,96*k*Math.max(.4,Math.abs(sisi)),9*u,0,0,7);g.fill();g.lineWidth=2*u;g.stroke();g.restore()};
 const dalamMeja=(g,fn)=>{g.save();g.beginPath();g.roundRect(R.left,R.top,W,H,sudutMeja);g.clip();fn();g.restore()};
 // Air merembes dari bawah meja serempak di banyak titik, lalu surut dengan cara sama.
 // muncul lewat genangan, hilang dengan memudar
 const basah=t=>halus(f(t,80,1150)),surut=t=>1-halus(f(t,7700,8400));
 const TITIK=[];for(let b=0;b<5;b++)for(let k=0;k<4;k++){const n=b*4+k;TITIK.push([R.left+(k+.2+.6*acak(n+700))*W/4,R.top+(b+.2+.6*acak(n+730))*H/5,.8+.2*acak(n+760)])}
 const jari=Math.hypot(W/4,H/5)*1.15;
 // genangan bertepi tidak rata (seperti rembesan)
 const gumpal=(g,x,y,q,n,t)=>{for(let i=0;i<=28;i++){const a=i/28*6.2832,j=q*(1+.2*Math.sin(a*3+n+t/260)+.11*Math.sin(a*7-n*2-t/180));g[i?"lineTo":"moveTo"](x+Math.cos(a)*j,y+Math.sin(a)*j*.82)}};
 // Permukaan air: gambar ombak Boss, dua lapis yang bergeser berlawanan supaya beriak.
 const lukisAir=(g,t)=>{if(surut(t)<=0)return;dalamMeja(g,()=>{const k=basah(t);if(k<1){g.beginPath();TITIK.forEach(([x,y,z],n)=>gumpal(g,x,y,jari*1.25*k*z,n,t));g.clip()}
  g.globalAlpha=surut(t);
  g.fillStyle="#0080e0";g.fillRect(R.left,R.top-20,W,H+40);
  if(AIR.complete&&AIR.naturalWidth){const lw=W+60,lh=Math.max(H+50,lw*928/750);
   g.drawImage(AIR,R.left-30+Math.sin(t/620)*22,R.top-25+Math.sin(t/830)*14,lw,lh);
   g.globalAlpha=.35*surut(t);g.drawImage(AIR,R.left-30-Math.sin(t/510)*26,R.top-25+Math.cos(t/700)*16,lw,lh);g.globalAlpha=surut(t)}
  const v=g.createRadialGradient(CX,R.top+H/2,Math.min(W,H)*.3,CX,R.top+H/2,Math.max(W,H)*.75);v.addColorStop(0,"rgba(0,20,70,0)");v.addColorStop(1,"rgba(0,14,52,.55)");g.fillStyle=v;g.fillRect(R.left,R.top-20,W,H+40);
  g.fillStyle="#e8ffff";for(let i=0;i<26;i++){const k=Math.sin(t/230+acak(i)*40);if(k<.55)continue;const x=R.left+acak(i+60)*W,y=R.top+acak(i+90)*H,z=(3+acak(i+30)*6)*u*(k-.55)*2.4;g.globalAlpha=k;g.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4,q=j%2?z*.22:z;g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}g.fill()}})};
 const bulat=(g,x,y,z,c)=>{g.beginPath();g.arc(x,y,Math.max(0,z),0,7);g.fillStyle=c;g.fill()};
 // percikan dilihat dari atas: menyebar ke segala arah
 const percik=(g,t,x,y,mulai,n,laju,benih)=>{const s=(t-mulai)/1000,w=(t-mulai)/650;if(w<0||w>1)return;
  for(let i=0;i<n;i++){const a=6.283*acak(benih+i),v=laju*u*(.3+acak(benih+i+300))*(1-w*.4);g.globalAlpha=1-w*w;
   bulat(g,x+Math.cos(a)*v*s,y+Math.sin(a)*v*s,(2+5*acak(benih+i+600))*u*(1-w*.4),["#fff","#bffcff","#12e8ee","#8fd8ff"][i%4])}g.globalAlpha=1};
 const riak=(g,t,x,y,mulai)=>{const k=(t-mulai)/700;if(k<0||k>1)return;g.globalAlpha=1-k;g.strokeStyle="#e8ffff";g.lineWidth=(5*(1-k)+1)*u;g.beginPath();g.ellipse(x,y,140*k*u,115*k*u,0,0,7);g.stroke();g.globalAlpha=1};
 // ---------- Hiasan mewah: sinar, kilat, serbuk emas, gelombang kejut, bilah sinema, hujan kristal ----------
 const bintang=(g,x,y,z,c)=>{if(z<=0)return;g.fillStyle=c;g.beginPath();for(let j=0;j<8;j++){const a=j*Math.PI/4,q=j%2?z*.2:z;g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}g.fill()};
 const cincinKejut=(g,t,x,y,mulai,besar,warna,tebal)=>{const k=(t-mulai)/650;if(k<0||k>1)return;const e=1-(1-k)*(1-k);g.globalAlpha=1-k;g.strokeStyle=warna;g.lineWidth=tebal*u*(1-k)+1;g.beginPath();g.arc(x,y,e*besar*u,0,7);g.stroke();g.globalAlpha=1};
 const petir=(g,benih,x0,y0,x1,y1)=>{const p=[[x0,y0]];for(let i=1;i<9;i++){const k=i/9;p.push([antara(x0,x1,k)+(acak(benih+i)-.5)*60*u,antara(y0,y1,k)+(acak(benih+i+40)-.5)*24*u])}p.push([x1,y1]);
  for(const [w,c] of [[9,"rgba(120,220,255,.35)"],[3.5,"#bff6ff"],[1.5,"#fff"]]){g.strokeStyle=c;g.lineWidth=w*u;g.beginPath();p.forEach((v,i)=>g[i?"lineTo":"moveTo"](...v));g.stroke()}};
 const sinar=(g,t)=>{const a=basah(t)*surut(t);if(a<=0)return;g.save();g.globalCompositeOperation="lighter";g.fillStyle="#9fe8ff";
  for(let i=0;i<5;i++){const x=W*(.1+.2*i)+Math.sin(t/900+i*2)*40*u,w=(18+acak(i+5)*26)*u;g.globalAlpha=a*(.07+.05*Math.sin(t/500+i*1.7));g.beginPath();g.moveTo(x,-10);g.lineTo(x+w,-10);g.lineTo(x+w*3-H*.25,H);g.lineTo(x-w-H*.25,H);g.fill()}g.restore()};
 const mewah=t=>{const g=g2,cx=W/2,cy=H*.42;g.lineCap=g.lineJoin="round";
  // pembukaan: cincin emas dan serbuk bintang saat air muncul
  cincinKejut(g,t,cx,cy,120,260,"#ffd24a",10);cincinKejut(g,t,cx,cy,300,220,"#8ffcf6",7);
  for(let i=0;i<34;i++){const k=(t-150-acak(i+800)*250)/900;if(k<0||k>1)continue;const a=i*.62,d=(30+acak(i+810)*230)*u*(1-(1-k)*(1-k));bintang(g,cx+Math.cos(a)*d,cy+Math.sin(a)*d+60*u*k*k,(4+acak(i+820)*8)*u*(1-k),i%3?"#ffd24a":"#fff")}
  // tiap lompatan: petir menyambar air dan hiu meninggalkan jejak serbuk emas
  LOMPAT.forEach((m,n)=>{if(t>=m-170&&t<m+90){const p=jalur(m),S=Math.floor(t/60);if(S%3){petir(g,S*13+n*7,acak(S+n)*W,0,p.x+(n-1)*30*u,p.y-30*u);if(n>1)petir(g,S*17+3,acak(S+9)*W,0,p.x-70*u,p.y+20*u)}
     if(t<m-60){g.globalAlpha=.28*(1-f(t,m-170,m-60));g.fillStyle="#dff8ff";g.fillRect(0,0,L,T);g.globalAlpha=1}}
   if(t>=m-150&&t<m+500)for(let i=0;i<22;i++){const w=t-i*22;if(w<m-150||w>m+360)continue;const p=jalur(w),v=1-i/22;bintang(g,p.x+(acak(i+n*30+850)-.5)*80*u,p.y+(acak(i+n*30+880)-.5)*80*u+i*1.5*u,(3+acak(i+890)*8)*u*v,i%2?"#ffd24a":"#fff6c0")}});
  // terkaman: garis kecepatan menuju korban, lalu gelombang kejut emas tiap gigitan
  if(t>=5750&&t<SERANG){const k=f(t,5750,SERANG);g.strokeStyle="#e8ffff";for(let i=0;i<26;i++){const a=i*.2417+acak(i)*.2,d=(380-250*k+acak(i+7)*90)*u;g.globalAlpha=.8*k;g.lineWidth=(1+3*acak(i+2))*u;g.beginPath();g.moveTo(V.x+Math.cos(a)*d,V.y+Math.sin(a)*d);g.lineTo(V.x+Math.cos(a)*(d+(50+90*k)*u),V.y+Math.sin(a)*(d+(50+90*k)*u));g.stroke()}g.globalAlpha=1}
  cincinKejut(g,t,V.x,V.y,SERANG,330,"#ffd24a",16);cincinKejut(g,t,V.x,V.y,SERANG+90,270,"#fff",9);
  GIGIT.forEach((m,n)=>{cincinKejut(g,t,V.x,V.y,m,150+n*20,n===3?"#ffd24a":"#8ffcf6",8);
   for(let i=0;i<16;i++){const k=(t-m)/620;if(k<0||k>1)continue;const a=acak(i+n*20+900)*6.283,d=(30+acak(i+n*20+930)*150)*u*(1-(1-k)*(1-k));bintang(g,V.x+Math.cos(a)*d,V.y+Math.sin(a)*d+90*u*k*k,(5+acak(i+960)*9)*u*(1-k),i%2?"#ffd24a":"#fff")}});
  // hujan kristal biru jatuh pelan setelah hiu pergi
  if(t>7500&&t<8900){const a=f(t,7500,7750)*(1-f(t,8600,8900));for(let i=0;i<30;i++){const x=acak(i+1000)*W+Math.sin(t/260+i)*10*u,y=(acak(i+1040)*H*.9-H*.2)+(t-7500)/1000*(60+acak(i+1080)*130)*u,z=(5+acak(i+1120)*11)*u;g.save();g.globalAlpha=a;g.translate(x,y);g.rotate(Math.sin(t/300+i)*.6);
     for(const [c,sg] of [["#8ffcf6",-1],["#1568b8",1]]){g.fillStyle=c;g.beginPath();g.moveTo(0,-z*1.4);g.lineTo(sg*z*.7,0);g.lineTo(0,z*1.4);g.fill()}g.restore();if(i%5===0){g.globalAlpha=a;bintang(g,x,y,z*1.2*Math.abs(Math.sin(t/130+i)),"#fff");g.globalAlpha=1}}}
  // sorot emas berputar di belakang cincin SET dan konfeti bintang
  if(t>7980){const a=f(t,7980,8200)*(1-f(t,8750,9000)),sy=Math.min(T-150,Math.max(110,T*.45));g.save();g.translate(cx,sy);g.rotate(t/900);g.globalCompositeOperation="lighter";g.fillStyle="#ffcf4a";
   for(let i=0;i<14;i++){g.rotate(6.2832/14);g.globalAlpha=a*(i%2?.2:.32);g.beginPath();g.moveTo(0,0);g.lineTo(260*u,-22*u);g.lineTo(260*u,22*u);g.fill()}g.restore();
   cincinKejut(g,t,cx,sy,8050,260,"#ffd24a",12);cincinKejut(g,t,cx,sy,8200,200,"#fff",7);
   for(let i=0;i<40;i++){const k=(t-8050-acak(i+1200)*120)/850;if(k<0||k>1)continue;const b=acak(i+1210)*6.283,d=(60+acak(i+1220)*190)*u*(1-(1-k)*(1-k));bintang(g,cx+Math.cos(b)*d,sy+Math.sin(b)*d+130*u*k*k,(5+acak(i+1230)*9)*u*(1-k*.7),["#ffd24a","#fff","#8ffcf6"][i%3])}}
  // bilah sinema hitam bergaris emas selama terkaman
  const bar=halus(f(t,5300,5600))*(1-halus(f(t,7700,8000)))*(kotak?22:T*.065);
  if(bar>0){g.fillStyle="#000";g.fillRect(0,0,L,bar);g.fillRect(0,T-bar,L,bar);g.fillStyle="#ffd24a";g.fillRect(0,bar,L,2);g.fillRect(0,T-bar-2,L,2)}
 };
 function gambar(t){
  [g1,g3,g2].forEach((g,i)=>{const k=i?r:rAir;g.setTransform(k,0,0,k,0,0);g.clearRect(0,0,L,T)});
  krt.style.opacity=krauk.style.opacity=0;
  // 1. Air muncul serempak; kartu skin pen-set terangkat lalu tenggelam.
  lukisAir(g1,t);
  if(t<1300){const p=halus(f(t,100,900)),w=70*u,y=antara(R.bottom+40*u,R.bottom-120*u,p)+60*u*f(t,950,1300),kx=Math.min(R.right-w,Math.max(R.left+w,A.x));
   krt.style.width=w+"px";krt.style.transform=`translate(${kx-w/2}px,${y-w*.66}px) rotate(${Math.sin(t/150)*12}deg)`;krt.style.opacity=f(t,100,350)*(1-f(t,1050,1300))}
  sinar(g1,t);
  // Saat menerkam, meja menggelap kecuali di sekitar korban.
  {const a=f(t,5400,5900)*(1-f(t,7700,8100));if(a>0)dalamMeja(g1,()=>{const p=g1.createRadialGradient(V.x,V.y,50*u,V.x,V.y,260*u);p.addColorStop(0,"rgba(0,10,40,0)");p.addColorStop(1,"rgba(0,8,34,"+.7*a+")");g1.fillStyle=p;g1.fillRect(R.left,R.top,W,H)})}
  // 2. Hiu. Di dalam air hanya sirip punggungnya yang tampak; seluruh badan baru kelihatan saat keluar dari air
  // (melompat, menerkam, memangsa). tinggi = seberapa jauh ia melompat.
  let kepala=null;
  const tinggi=LOMPAT.reduce((v,m)=>Math.max(v,t>m-170&&t<m+380?Math.sin(Math.PI*(t-m+170)/550):0),0);
  if(t>=800&&t<8300){
   let P,mulut=0,z=tinggi,keluar=jepit(tinggi*3),fin=0;
   if(t<SERANG){P=tulangRenang(t,t<5450?1:.6);mulut=Math.max(tinggi*.55,f(t,5650,5950));
    fin=halus(f(t,900,1300))*(1-keluar)*(1-f(t,5740,5860));
    if(t>5750){z=halus(f(t,5750,SERANG))*.35;keluar=f(t,5790,5910)}}
   else{const s=(t-SERANG)/1000,kibas=Math.sin(s*6.283*3.4)*(1-.4*f(t,7300,7600))*(1-f(t,7600,7900)),p=((t-SERANG)%400)/400,
     seret=f(t,6400,7700),pergi=halus(f(t,7700,8300)),hadap=h0+kibas*.42+kanan*pergi*1.9,mundur=seret*24*u;
    kepala={x:V.x-Math.cos(h0)*mundur-Math.sin(h0)*kibas*18*u+Math.cos(hadap)*pergi*H*.3,y:V.y-Math.sin(h0)*mundur+Math.cos(h0)*kibas*18*u+Math.sin(hadap)*pergi*H*.3};
    P=tulangMangsa(t,kepala,hadap,.5+.12*Math.abs(kibas)-pergi*.2);
    mulut=t>=7600?0:p<.35?p/.35:p<.8?1:1-(p-.8)/.2; // menutup tepat saat tiap gigitan
    z=.35*(1-pergi);keluar=1-f(t,7750,8000);fin=f(t,7800,7980)*(1-f(t,8080,8300))}
   if(keluar>0){P=lenturkan(P);
    const skala=1+.45*z,c=P[Math.round(N*.35)];
    gl.setTransform(rl,0,0,rl,0,0);gl.clearRect(0,0,L,T);gambarHiu(gl,P,PJ,mulut,t);
    // siluet gelap untuk bayangan (resolusi kecil, jauh lebih ringan daripada filter)
    gs.globalCompositeOperation="source-over";gs.clearRect(0,0,siluet.width,siluet.height);gs.drawImage(lembar,0,0,siluet.width,siluet.height);gs.globalCompositeOperation="source-in";gs.fillStyle="#000a28";gs.fillRect(0,0,siluet.width,siluet.height);
    const tempel=(dx,dy,sk,gbr=lembar)=>{g3.save();g3.translate(c.x+dx,c.y+dy);g3.scale(sk,sk);g3.translate(-c.x,-c.y);g3.drawImage(gbr,0,0,L,T);g3.restore()};
    g3.globalAlpha=keluar*.3;tempel((14+46*z)*u,(20+60*z)*u,1+.1*z,siluet);
    g3.globalAlpha=keluar;tempel(0,0,skala);g3.globalAlpha=1}
   if(fin>0){const m=t<SERANG?t:SERANG,pos=t<SERANG?jalur(t-60):{x:kepala.x,y:kepala.y},a=jalur(m-60),b=jalur(m);
    sirip(g3,t,pos,t<SERANG?b.x-a.x:Math.cos(h0+kanan*1.9),t<SERANG?b.y-a.y:Math.sin(h0+kanan*1.9),fin)}
  }
  // cipratan tiap lompatan: saat keluar dan saat jatuh kembali
  LOMPAT.forEach((m,i)=>{[[m-130,i*100],[m+330,i*100+50]].forEach(([w,benih])=>{if(t<w||t>w+900)return;const p=jalur(w);percik(g2,t,p.x,p.y,w,34+i*8,230+i*50,benih);riak(g2,t,p.x,p.y,w);riak(g2,t,p.x,p.y,w+160)})});
  // 3. Memangsa
  if(t>=SERANG&&t<8200){
   percik(g2,t,V.x,V.y,SERANG,60,520,480);
   GIGIT.forEach((m,i)=>{percik(g2,t,V.x-30*u,V.y,m,28,380,700+i*80);percik(g2,t,V.x+30*u,V.y,m+140,22,320,740+i*80);riak(g2,t,V.x,V.y,m+60);
    const k=(t-m)/380;if(k>=0&&k<1){g2.globalAlpha=1-k;g2.strokeStyle="#fff";g2.lineWidth=4*u*(1-k)+1;g2.beginPath();for(let j=0;j<12;j++){const a=j*.524+i,r1=(40+60*k)*u;g2.moveTo(V.x+Math.cos(a)*r1,V.y+Math.sin(a)*r1);g2.lineTo(V.x+Math.cos(a)*(r1+26*u),V.y+Math.sin(a)*(r1+26*u))}g2.stroke();g2.globalAlpha=1;
     const sisi=i%2?-1:1,x=Math.min(L-60,Math.max(60,V.x+sisi*80*u)),y=Math.max(44,V.y-(70+i*8)*u);
     krauk.style.left=x+"px";krauk.style.top=y+"px";krauk.style.transform=`translate(-50%,-50%) rotate(${sisi*10}deg) scale(${1+.5*(1-k)})`;krauk.style.opacity=1-k*k}});
   if(t<SERANG+220){g2.globalAlpha=.7*(1-f(t,SERANG,SERANG+220));g2.fillStyle="#fff";g2.fillRect(0,0,L,T);g2.globalAlpha=1}
   // pusaran buih di titik mangsa
   g2.lineCap="round";for(let i=0;i<5;i++){const a=t/(120+i*25)+i*1.3,rx=(65+i*18)*u;g2.globalAlpha=(.7-i*.12)*(1-f(t,7700,8100));g2.strokeStyle=i%2?"#8ffcf6":"#fff";g2.lineWidth=(6-i)*u;g2.beginPath();g2.ellipse(V.x,V.y,rx,rx*.78,0,a,a+1.7);g2.stroke()}g2.globalAlpha=1;
   // serpihan kartu korban beterbangan
   for(let i=0;i<14;i++){const k=(t-SERANG-i*95)/800;if(k<0||k>1)continue;const a=acak(i+40)*6.283,d=(40+acak(i+50)*110)*u*k;g2.save();g2.globalAlpha=1-k;g2.translate(V.x+Math.cos(a)*d,V.y+Math.sin(a)*d);g2.rotate(k*9+i);g2.fillStyle="#f4fbff";g2.fillRect(-6*u,-8*u,12*u,16*u);g2.strokeStyle="#0a2a6a";g2.lineWidth=1.5;g2.strokeRect(-6*u,-8*u,12*u,16*u);g2.restore()}}
  // buih di tepi genangan selagi air muncul atau surut, dan gelembung naik
  dalamMeja(g2,()=>{const k=basah(t);g2.strokeStyle="#e8ffff";g2.lineWidth=2.5*u;
   if(k>0&&k<1){g2.globalAlpha=.45*Math.sin(Math.PI*k);TITIK.forEach(([x,y,z],n)=>{g2.beginPath();gumpal(g2,x,y,jari*1.25*k*z,n,t);g2.stroke()})}
   g2.lineWidth=1.5*u;for(let i=0;i<22;i++){const v=(t/1400+acak(i))%1;g2.globalAlpha=.6*Math.sin(Math.PI*v)*k*surut(t);g2.beginPath();g2.arc(R.left+acak(i+9)*W+Math.sin(t/200+i)*6,R.top+acak(i+33)*H-v*30*u,(2+acak(i+3)*5)*u*(.5+v*.5),0,7);g2.stroke()}});
  mewah(t);
  // Nama korban terjepit di rahang, ikut diguncang dan diseret.
  if(t>=SERANG){nama.style.scale=".8";taruh(nama,kepala?{x:kepala.x+Math.cos(h0)*22*u,y:kepala.y+Math.sin(h0)*22*u}:{x:V.x,y:T+99});nama.style.rotate=Math.sin(t/38)*16*(1-f(t,7600,7900))+"deg";nama.style.opacity=1-f(t,7800,8050)}
  // 4. Cincin SET! + poin.
  const cx=L/2,cy=Math.min(T-150,Math.max(110,T*.45)),m=f(t,8000,8280),hil=1-f(t,8750,9000),sk=m<.75?1.2*halus(m/.75):1.2-.2*(m-.75)/.25;
  cin.style.transform=`translate(${cx-85}px,${cy-85}px) scale(${sk*(kotak?.85:1)})`;cin.style.opacity=Math.min(1,m*3)*hil;
  pn.style.transform=`translateY(${cy+(kotak?84:105)-20*f(t,8400,8900)}px)`;pn.style.opacity=f(t,8250,8450)*hil;
  const sr=f(t,3050,3230);seru.style.transform=`translateY(${Math.max(8,T*(kotak?.03:.12))}px) scale(${2-halus(sr)}) rotate(-4deg)`;seru.style.opacity=sr*(1-f(t,5100,5350));
  const goyang=[...GIGIT,...LOMPAT.map(m=>m+330)].reduce((v,m,i)=>Math.max(v,t>=m&&t<m+220?(1-(t-m)/220)*(i<4?1:.55):0),0)*(kotak?0:13);
  dunia.style.translate=`${Math.sin(t/17)*goyang}px ${Math.cos(t/23)*goyang}px`;
  ov.style.opacity=Math.min(1,t/200)*hil;
 }
 const t0=performance.now();let raf=0;
 const jalan=()=>{gambar(performance.now()-t0);raf=requestAnimationFrame(jalan)};jalan();
 setTimeout(()=>{cancelAnimationFrame(raf);ov.remove()},9000);
};
})();
