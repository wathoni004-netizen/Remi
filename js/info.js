// Pemberitahuan "event segera mulai" di panel hijau menu (bergantian dengan logo), hanya SEBELUM event mulai.
// Saat mulai, slide ini hilang dan banner event dari event.js mengambil alih. Ikut EV di event.js: nm, k, mulai harus sama.
const PENG={nm:"BIG BANG",k:"K02",mulai:"2026-11-25T15:00:00+08:00"};
(()=>{const mh=$("#home .mh"),s=SKA.get(PENG.k);if(!mh||!s||!PENG.mulai||Date.now()>=Date.parse(PENG.mulai))return;const t0=Date.parse(PENG.mulai),c=s.c,c1=c[1]||c[0];
const tgl=new Date(t0).toLocaleString("id-ID",{timeZone:"Asia/Makassar",weekday:"long",day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"}).replace(/\./g,":").replace(" pukul",",")+" WITA";
const sisa=ms=>{const m=Math.ceil(ms/6e4),h=Math.floor(m/1440),j=Math.floor(m%1440/60),n=m%60;return h?h+" hari "+j+" jam":j?j+" jam "+n+" menit":n+" menit"};
const ev=document.createElement("div");ev.className="ixc";ev.style.cssText=`--e0:${c[0]};--e1:${c1};--e2:${c[c.length-1]}`;
ev.innerHTML=`<div class="ixk"><div class="sks">${SKA.svg(PENG.k)}</div><i class="ixs"></i></div><div class="ixt"><span class="ixl">EVENT</span><b>${PENG.nm}</b><small>Kolektor: ${s.n}</small><span class="ixw"></span><span class="ixd"></span></div>`+
 Array.from({length:8},(_,i)=>`<i class="ixp" style="left:${8+i*11.5}%;top:${(i*37)%80+8}%;background:${c[i%c.length]};animation-delay:${(i*.37).toFixed(2)}s"></i>`).join("");
mh.append(ev);const dot=document.createElement("div");dot.className="ixo";dot.innerHTML="<i></i><i></i>";mh.append(dot);
let on=0;const sw=v=>{on=v;mh.classList.toggle("ix",!!on)};const iv2=setInterval(()=>sw(!on),6e3);mh.onclick=()=>sw(!on);
const end=()=>{clearInterval(iv);clearInterval(iv2);clearTimeout(to);ev.remove();dot.remove();mh.classList.remove("ix");mh.onclick=null};
const up=()=>{const n=Date.now();if(n>=t0)return end();ev.querySelector(".ixw").textContent="Mulai "+tgl;ev.querySelector(".ixd").textContent=sisa(t0-n)+" lagi"};
const iv=setInterval(up,3e4),to=setTimeout(end,Math.max(0,Math.min(t0-Date.now(),2147483000)));up();if(ev.isConnected)sw(1)})();
