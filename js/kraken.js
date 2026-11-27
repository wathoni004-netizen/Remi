// Efek Set skin Kraken (L05): panggung sendiri 360x520, 5,6 detik. Suara: SC.L05 di suara.js. Dipanggil dari playSetFx (setfx.js).
// Dibuat dari draf di desain-skin/ (tentakel meliuk, laut, hujan, petir, percikan dihitung per bingkai di canvas).
(()=>{
const PETA=[[0,0],[1500,2300],[2300,3300],[2600,3600],[3800,5600],[4000,5900]];
const petakan=(v,a,b)=>{let i=1;while(i<PETA.length-1&&v>PETA[i][a])i++;const p=PETA[i-1],q=PETA[i];return p[b]+(v-p[a])*(q[b]-p[b])/(q[a]-p[a])};
const W=ms=>petakan(ms,0,1),Wbalik=ms=>petakan(ms,1,0);
const TT=(()=>{
const WARNA=[[0,58,10,78],[.35,130,8,128],[.65,192,72,156],[1,242,160,200]]; // sisi luar -> sisi pengisap (sama dengan efek-kraken.ai)
const warna=t=>{let j=1;while(j<3&&t>WARNA[j][0])j++;const a=WARNA[j-1],z=WARNA[j],u=(t-a[0])/(z[0]-a[0]);return `rgb(${[1,2,3].map(i=>a[i]+(z[i]-a[i])*u|0)})`};
// nilai dari daftar [waktu, nilai], diperhalus
const kunci=(k,t)=>{if(t<=k[0][0])return k[0][1];for(let i=1;i<k.length;i++)if(t<k[i][0]){let u=(t-k[i-1][0])/(k[i][0]-k[i-1][0]);u=u*u*(3-2*u);return k[i-1][1]+(k[i][1]-k[i-1][1])*u}return k[k.length-1][1]};
// Utama: muncul, ancang-ancang ke belakang, mencambuk korban, bergetar, masuk lagi
const UTAMA={x:122,y:575,L:500,w:36,mulai:1700,arah:-1.75,jeda:110,gelombang:1,
 panjang:[[0,0],[420,1],[1250,1],[1600,0]],
 lengkung:[[0,.2],[380,-.4],[600,-1.2],[740,.8],[880,.5],[1100,.65],[1600,-.3]], // makin besar = condong ke kanan
 gulung:[[0,5],[420,3.8],[600,4.2],[740,-.3],[900,.9],[1150,1.6],[1600,5]],
 liuk:[[0,.7],[500,.45],[700,.08],[850,.5],[1250,.75],[1600,.8]]};
// Pendamping: meliuk di kiri dan kanan
const samping=(x,sisi,mulai,fase)=>({x,y:565,L:270,w:24,mulai,arah:-1.5708+sisi*.12,jeda:0,gelombang:sisi,fase,
 panjang:[[0,0],[500,1],[1900,1],[2400,0]],lengkung:[[0,0],[2400,0]],gulung:[[0,sisi*4],[600,sisi*2.2],[1600,sisi*3.2],[2400,sisi*4]],liuk:[[0,.8],[2400,.8]]});
const SEMUA=[samping(34,1,900,0),samping(330,-1,1150,2.4),UTAMA];
function satu(g,c,t){
 const T=t-c.mulai;if(T<0)return;
 const N=56,P=kunci(c.panjang,T);if(P<.02)return;
 const seg=c.L*P/N,pt=[];let x=c.x,y=c.y;
 for(let i=0;i<=N;i++){
  const u=i/N,lag=T-c.jeda*u; // ujung terlambat dari pangkal = efek cambuk
  const a=c.arah+kunci(c.lengkung,lag)*u+kunci(c.gulung,lag)*u*u*u*u+kunci(c.liuk,lag)*u*Math.sin(u*8-T*.011+(c.fase||0))*c.gelombang;
  const nx=-Math.sin(a),ny=Math.cos(a),s=c.gelombang<0?-1:1,w=c.w*Math.pow(1-u,.8)*Math.min(1,P*1.6)+2;
  pt.push({x,y,nx:nx*s,ny:ny*s,w});x+=Math.cos(a)*seg;y+=Math.sin(a)*seg;
 }
 const sisi=k=>pt.map(p=>[p.x+p.nx*p.w*k,p.y+p.ny*p.w*k]);
 const bentuk=(a,b)=>{g.beginPath();a.concat(b.slice().reverse()).forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath()};
 const dalam=sisi(1),luar=sisi(-1);
 for(let k=0;k<20;k++){bentuk(sisi(-1+k/10),dalam);g.fillStyle=warna(k/19);g.fill()}
 bentuk(luar,dalam);g.strokeStyle="#1c0524";g.lineWidth=3.5;g.lineJoin="round";g.stroke();
 for(let i=3;i<N-3;i+=4){const p=pt[i],r=p.w*.34,cx=p.x+p.nx*p.w*.5,cy=p.y+p.ny*p.w*.5;
  [[r,"#f5b800"],[r*.45,"#a8381e"]].forEach(([q,f])=>{g.beginPath();g.arc(cx,cy,q,0,7);g.fillStyle=f;g.fill();if(q===r){g.lineWidth=1.4;g.strokeStyle="#4a1e0c";g.stroke()}})}
}
// ---------- Laut bergelombang (warna sama dengan layer "ombak" di efek-kraken.ai) ----------
// Permukaan laut: puncak lancip yang berjalan + garis buih
function laut(g,t,dasar,amp,lebar,laju,warnaAir,geser){
 const y=x=>{const f=((x+t*laju+geser)%lebar+lebar)%lebar/lebar;return dasar-amp*Math.pow(Math.abs(Math.sin(Math.PI*f)),3)};
 g.beginPath();g.moveTo(-10,540);for(let x=-10;x<=370;x+=5)g.lineTo(x,y(x));g.lineTo(370,540);g.closePath();
 g.fillStyle=warnaAir;g.fill();g.strokeStyle="#081a33";g.lineWidth=2.5;g.stroke();
 g.beginPath();for(let x=-10;x<=370;x+=5){const v=y(x)+4;x>-10?g.lineTo(x,v):g.moveTo(x,v)}
 g.strokeStyle="#cfeaf0";g.lineWidth=4;g.setLineDash([26,14,8,18]);g.lineDashOffset=t*laju*.7;g.stroke();g.setLineDash([]);
}
const naik=t=>kunci([[0,560],[500,505],[1300,455],[2600,470],[3300,500],[3800,580]],t); // tinggi air
return{gambar(cv,t){const g=cv.getContext("2d");g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(cv.width/360,0,0,cv.height/520,0,0);const a=naik(t);
 laut(g,t,a-22,26,130,.07,"#1a4466",0);
 SEMUA.forEach(c=>satu(g,c,t));
 laut(g,t,a+14,30,155,.12,"#1d4a70",60);laut(g,t,a+46,24,115,.17,"#12304f",20)}}})();
const acak=i=>{const x=Math.sin(i*127.1+31.7)*43758.5453;return x-Math.floor(x)};
const bulat=(g,x,y,r,f)=>{g.beginPath();g.arc(x,y,Math.max(0,r),0,7);g.fillStyle=f;g.fill()};
function petir(g,seed,x1,y1,x2,y2){
 const p=[[x1,y1]];for(let i=1;i<9;i++){const u=i/9;p.push([x1+(x2-x1)*u+(acak(seed+i)-.5)*55,y1+(y2-y1)*u+(acak(seed+i+50)-.5)*20])}p.push([x2,y2]);
 [[11,"rgba(140,190,255,.35)"],[4,"#ffe3a0"],[1.6,"#fff"]].forEach(([w,c])=>{g.beginPath();p.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.lineWidth=w;g.strokeStyle=c;g.lineJoin="round";g.stroke()});
}
// ledakan partikel: mulai T0, n butir dari (x,y)
function ledak(g,t,T0,lama,n,x,y,laju,berat,warna,r,seed){
 const u=(t-T0)/lama;if(u<0||u>1)return;const s=(t-T0)/1000;
 for(let i=0;i<n;i++){const a=acak(seed+i)*6.283,v=laju*(.35+acak(seed+i+300));
  g.globalAlpha=1-u*u;bulat(g,x+Math.cos(a)*v*s,y+Math.sin(a)*v*s+berat*s*s,r*(.4+acak(seed+i+600))*(1-u*.5),warna[i%warna.length])}
 g.globalAlpha=1;
}
function bintang(g,x,y,z,c){g.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,q=i%2?z*.25:z;g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q)}g.closePath();g.fillStyle=c;g.fill()}
function gambar(cv,t){
 const g=cv.getContext("2d");g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);g.setTransform(cv.width/360,0,0,cv.height/520,0,0);
 // hujan badai
 const hujan=Math.min(1,t/300)*Math.min(1,Math.max(0,(3700-t)/500));
 if(hujan>0){g.strokeStyle="rgba(170,215,255,"+(.35*hujan)+")";g.lineWidth=1.2;g.beginPath();
  for(let i=0;i<70;i++){const y=(acak(i)*600+t*(.7+acak(i+9)*.4))%600-40,x=(acak(i+77)*440-y*.22+440)%440-40;g.moveTo(x,y);g.lineTo(x-5,y+18)}g.stroke()}
 // gelembung saat kepala muncul
 if(t<1600)for(let i=0;i<26;i++){const u=((t/900+acak(i+5))%1);g.globalAlpha=(1-u)*Math.min(1,(1600-t)/300);
  g.beginPath();g.arc(40+acak(i)*280+Math.sin(t/130+i)*6,510-u*330,2+acak(i+3)*6,0,7);g.strokeStyle="#bff3ff";g.lineWidth=1.5;g.stroke()}
 g.globalAlpha=1;
 // sinar dari mata
 if(t>500&&t<1050){const a=Math.sin((t-500)/550*Math.PI);g.globalAlpha=a*.8;[142,218].forEach(x=>{bulat(g,x,238,20+a*10,"rgba(255,170,40,.35)");bintang(g,x,238,26*a,"#fff6c0")});g.globalAlpha=1}
 // sambaran petir bertubi-tubi (berubah tiap 70 ms)
 const S=Math.floor(t/70);
 if(t>900&&t<1320){petir(g,S,60,-5,150,250);if(S%2)petir(g,S+200,310,-5,235,200)}
 if(t>2520&&t<2760){petir(g,S+400,15,-5,170,90);petir(g,S+500,345,-5,190,90)}
 // percikan air saat tentakel muncul
 ledak(g,t,1750,800,36,150,480,190,420,["#cfeaf0","#6fb4c8"],5,11);
 ledak(g,t,1950,700,22,60,490,150,400,["#cfeaf0"],4,41);ledak(g,t,2150,700,22,310,490,150,400,["#cfeaf0"],4,71);
 // jejak cambukan
 if(t>2380&&t<2620){g.globalAlpha=1-Math.abs(t-2500)/120;g.strokeStyle="#ffd6f2";g.lineCap="round";[0,1,2].forEach(i=>{g.lineWidth=5-i*1.4;g.beginPath();g.arc(120+i*14,300,190-i*18,-2.3,-1.15);g.stroke()});g.globalAlpha=1}
 // HANTAMAN: kilat putih, garis ledak, air, emas, tinta
 const h=t-2520;
 if(h>0&&h<130){g.fillStyle="rgba(255,255,255,"+(.8*(1-h/130))+")";g.fillRect(0,0,360,520)}
 if(h>0&&h<420){const u=h/420;g.strokeStyle="#fff2a8";g.lineCap="round";g.lineWidth=5*(1-u);g.beginPath();
  for(let i=0;i<18;i++){const a=i*.349,r1=30+u*170,r2=r1+50*(1-u)+10;g.moveTo(180+Math.cos(a)*r1,90+Math.sin(a)*r1);g.lineTo(180+Math.cos(a)*r2,90+Math.sin(a)*r2)}g.stroke()}
 [0,130,270].forEach((d,i)=>{const u=(h-d)/500;if(u>0&&u<1){g.globalAlpha=1-u;g.beginPath();g.ellipse(180,100,u*210,u*95,0,0,7);g.lineWidth=7*(1-u)+1;g.strokeStyle=["#fff","#8fe6ff","#ffd24a"][i];g.stroke();g.globalAlpha=1}});
 ledak(g,t,2520,900,60,180,95,260,380,["#cfeaf0","#6fb4c8","#fff"],6,101);
 ledak(g,t,2540,1100,34,180,95,200,260,["#ffd24a","#ff9d2e","#fff6c0"],4,211);
 ledak(g,t,2580,1000,16,180,95,150,200,["#3b1a6b","#7a2bd1"],9,311);
 // kelap-kelip setelah hantaman
 if(h>100&&h<1200)for(let i=0;i<20;i++){const a=Math.sin((h/160+acak(i+900)*3)*Math.PI);if(a>0){g.globalAlpha=a*Math.min(1,(1200-h)/300);bintang(g,30+acak(i+910)*300,20+acak(i+920)*230,4+acak(i+930)*9,i%2?"#ffd24a":"#fff")}}
 g.globalAlpha=1;
}
const NASKAH=[
 ["gelap",0,3800,[{opacity:0},{opacity:.78,offset:.1},{opacity:.7,offset:.85},{opacity:0}]],
 ["kepala",100,1500,[{opacity:0,transform:"translateY(300px) scale(.7)"},{opacity:1,transform:"translateY(20px) scale(1)",offset:.35,easing:"ease-out"},{opacity:1,transform:"translateY(0) scale(1.04) rotate(-2deg)",offset:.55},{opacity:1,transform:"translateY(8px) scale(1.12) rotate(2deg)",offset:.75},{opacity:0,transform:"translateY(260px) scale(.9)"}]],
 ["petir",900,420,[{opacity:0},{opacity:1,offset:.15},{opacity:.2,offset:.35},{opacity:1,offset:.5},{opacity:0}]],
 ["kilat",950,300,[{opacity:0},{opacity:.7,offset:.2},{opacity:0}]],
 ["kartu",1100,900,[{opacity:0,transform:"translateY(40px) rotate(0)"},{opacity:1,transform:"translateY(-60px) rotate(180deg)",offset:.3},{opacity:1,transform:"translateY(-300px) rotate(720deg) scale(.7)"}]],
 ["seru",450,950,[{opacity:0,transform:"scale(3) rotate(-14deg)"},{opacity:1,transform:"scale(1) rotate(-5deg)",offset:.2,easing:"ease-out"},{opacity:1,transform:"scale(1.1) rotate(-2deg)",offset:.8},{opacity:0,transform:"scale(1.6)"}]],
 ["cipratan",2540,600,[{opacity:1,transform:"scale(.2) rotate(0)"},{opacity:1,transform:"scale(1.15) rotate(12deg)",offset:.4},{opacity:0,transform:"scale(1.4) rotate(20deg)"}]],
 ["riak",2560,800,[{opacity:1,transform:"scale(.15)"},{opacity:0,transform:"scale(1.5)"}]],
 ["pen",2650,1100,[{opacity:0,transform:"scale(2.4)"},{opacity:1,transform:"scale(1)",offset:.2},{opacity:1,transform:"translateY(-10px)",offset:.8},{opacity:0,transform:"translateY(-50px)"}]],
 ["st",2520,650,[0,-18,16,-13,11,-8,6,-3,0].map(x=>({transform:`translate(${x}px,${-x/2}px)`}))]
];
let css=document.createElement("style");
css.textContent=".sfx.krk{align-items:flex-end;background:rgba(2,5,16,.62)}.krk .st{position:relative;width:360px;height:520px;flex:none;transform-origin:50% 100%;clip-path:inset(-100vmax -100vmax 0)}.krk .st>*{position:absolute;pointer-events:none}.krk .fx{opacity:0}.krk .gelap{inset:-100vmax;background:#020510}.krk .kilat{inset:-100vmax;background:#fff6cf}.krk .kepala{width:330px;left:15px;top:105px}.krk .petir{width:230px;left:65px;top:-30px}.krk .kartu{width:90px;height:120px;left:135px;top:340px}.krk canvas{left:0;top:0;width:360px;height:520px}.krk .cipratan{width:250px;left:55px;top:-30px}.krk .riak{width:320px;left:20px;top:-45px}.krk .nm{left:50%;transform:translateX(-50%);padding:6px 16px;border-radius:10px;background:#000a;color:#fff;font-weight:700;white-space:nowrap}.krk .korban{top:70px}.krk .oleh{bottom:8px;background:#e8b923;color:#14201a;z-index:2}.krk .seru{left:0;width:100%;top:330px;text-align:center;font:900 italic 54px Impact,sans-serif;color:#ffd24a;-webkit-text-stroke:2px #3b0a50;text-shadow:0 5px 0 #3b0a50,0 0 24px #ff7ae0}.krk .pen{left:0;width:100%;top:150px;text-align:center;font:900 52px sans-serif;color:#ff5a4f;text-shadow:0 3px 0 #000}";
document.head.appendChild(css);
window.KRK=(oleh,korban,pen)=>{
 const ov=document.createElement("div");ov.className="sfx krk";
 const g=(c,f)=>`<img class="fx ${c}" src="img/${f}?v=1" alt="">`,cv=c=>`<canvas class="${c}" width="720" height="1040"></canvas>`;
 ov.innerHTML=`<div class="st"><div class="nm korban"></div><div class="fx gelap"></div>${g("kepala","kr-kepala.webp")}${g("petir","kr-petir.svg")}<div class="fx kilat"></div>${g("kartu","kr-kartu.svg")}${g("riak","kr-riak.svg")}${cv("tentakel")}${g("cipratan","kr-cipratan.svg")}${cv("pesta")}<div class="fx seru">KRAKEN!</div><div class="fx pen"></div><div class="nm oleh"></div></div>`;
 const q=c=>ov.querySelector("."+c),st=q("st");
 q("korban").textContent=korban;q("oleh").textContent=oleh;q("pen").textContent=pen;
 st.style.transform="scale("+Math.min(1.25,innerWidth/360,innerHeight/540)+")";
 document.body.appendChild(ov);
 ov.animate([{opacity:0},{opacity:1}],{duration:200});
 NASKAH.forEach(([id,t,d,kf])=>(id==="st"?ov:q(id)).animate(kf,{delay:W(t),duration:W(t+d)-W(t)}));
 let raf=0,t0=0;
 const jalan=n=>{t0=t0||n;const t=Wbalik(n-t0);TT.gambar(q("tentakel"),t);gambar(q("pesta"),t);if(n-t0<5600)raf=requestAnimationFrame(jalan)};
 raf=requestAnimationFrame(jalan);
 setTimeout(()=>ov.animate([{opacity:1},{opacity:0}],{duration:300,fill:"forwards"}),5300);
 setTimeout(()=>{cancelAnimationFrame(raf);ov.remove()},5600);
};
})();
