// Pemberitahuan jadwal event di panel hijau menu utama (bergantian dengan logo). Ganti isi PENG untuk event berikutnya:
// nm nama event, k skin Kolektor event (kunci skinart.js), mulai ISO +08:00 (WITA), hari lama event. mulai "" = sembunyikan.
const PENG={nm:"Event Skin Kolektor",k:"K02",mulai:"2026-11-25T15:00:00+08:00",hari:7};
(()=>{const mh=$("#home .mh"),s=SKA.get(PENG.k);if(!mh||!s||!PENG.mulai)return;const t0=Date.parse(PENG.mulai),t1=t0+PENG.hari*864e5,c=s.c,c1=c[1]||c[0];
const tgl=new Date(t0).toLocaleString("id-ID",{timeZone:"Asia/Makassar",weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"}).replace(/\./g,":").replace(" pukul",",")+" WITA";
const sisa=ms=>{const m=Math.ceil(ms/6e4),h=Math.floor(m/1440),j=Math.floor(m%1440/60),n=m%60;return h?h+" hari "+j+" jam":j?j+" jam "+n+" menit":n+" menit"};
const ev=document.createElement("div");ev.className="evc";ev.style.cssText=`--e0:${c[0]};--e1:${c1};--e2:${c[c.length-1]}`;
ev.innerHTML=`<div class="evk"><div class="sks">${SKA.svg(PENG.k)}</div><i class="evs"></i></div><div class="evt"><span class="evl">EVENT</span><b>${PENG.nm}</b><small>Kolektor: ${s.n}</small><span class="evw"></span><span class="evd"></span></div>`+
 Array.from({length:8},(_,i)=>`<i class="evp" style="left:${8+i*11.5}%;top:${(i*37)%80+8}%;background:${c[i%c.length]};animation-delay:${(i*.37).toFixed(2)}s"></i>`).join("");
mh.append(ev);const dot=document.createElement("div");dot.className="evo";dot.innerHTML="<i></i><i></i>";mh.append(dot);
let on=0;const sw=v=>{on=v;mh.classList.toggle("ev",!!on)};const iv2=setInterval(()=>sw(!on),6e3);mh.onclick=()=>sw(!on);
const up=()=>{const n=Date.now();if(n>=t1){clearInterval(iv);clearInterval(iv2);ev.remove();dot.remove();mh.classList.remove("ev");mh.onclick=null;return}
 ev.querySelector(".evw").textContent=n<t0?"Mulai "+tgl:"Sedang berlangsung!";ev.querySelector(".evd").textContent=n<t0?sisa(t0-n)+" lagi":"Berakhir "+sisa(t1-n)+" lagi"};
const iv=setInterval(up,3e4);up();sw(1)})();
