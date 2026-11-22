const $=s=>document.querySelector(s);
// Lambang dan angka kartu digambar sebagai SVG (bukan teks/emoji) supaya sama di semua HP dan aman untuk skin.
const GL=(()=>{
const P={"1":"M2.5 3.5L5.5 1.2V12.8","2":"M1.8 3.8C2 2 3.4 1.2 5 1.2S8.2 2.4 8.2 4.2C8.2 6.5 4 8.8 1.5 12.8H8.5","3":"M1.8 2.5C3 1.3 7.8 .8 8 3.8C8 5.6 6 6.4 4.2 6.5C6.5 6.5 8.5 7.6 8.5 9.8C8.5 12.4 3 13.6 1.5 11.5","4":"M7 12.8V1.2L1.2 9.2H8.8","5":"M8 1.2H2.5L2 6.2C5 5 8.5 6.2 8.5 9.2C8.5 12.5 4 13.8 1.5 11.8","6":"M7.8 2.2C5 .5 1.6 2.5 1.6 7.5C1.6 12.8 8.5 13.5 8.5 9.4C8.5 6 3.5 5.4 1.6 8.2","7":"M1.5 1.2H8.5L4.2 12.8","8":"M5 6.6C2.5 6.6 2 4.8 2 3.8C2 2.2 3.2 1.2 5 1.2S8 2.2 8 3.8C8 4.8 7.5 6.6 5 6.6C2 6.6 1.5 8.5 1.5 9.8C1.5 11.8 3 12.8 5 12.8S8.5 11.8 8.5 9.8C8.5 8.5 8 6.6 5 6.6Z","9":"M2.2 11.8C5 13.5 8.4 11.5 8.4 6.5C8.4 1.2 1.5 .5 1.5 4.6C1.5 8 6.5 8.6 8.4 5.8","0":"M5 1.2C2.5 1.2 1.5 3.5 1.5 7S2.5 12.8 5 12.8 8.5 10.5 8.5 7 7.5 1.2 5 1.2Z",J:"M7 1.2V9.5C7 12.5 4.5 13 3.2 12.5C2 12 1.5 11 1.5 10",Q:"M5 1.2C2.5 1.2 1.5 3.5 1.5 6.5S2.5 11.8 5 11.8 8.5 9.5 8.5 6.5 7.5 1.2 5 1.2ZM5.5 9.5L8.8 13.2",K:"M2 1.2V12.8M8.2 1.2L2 7.2M4.2 5.4L8.5 12.8",A:"M1.2 12.8L5 1.2L8.8 12.8M2.8 8.8H7.2"};
const S={S:'<path d="M10 1C10 1 2 8 2 12C2 14.6 4 16 6 16C7.6 16 8.8 15.3 9.4 14.2C9.2 16.5 8.4 17.6 7 19H13C11.6 17.6 10.8 16.5 10.6 14.2C11.2 15.3 12.4 16 14 16C16 16 18 14.6 18 12C18 8 10 1 10 1Z"/>',H:'<path d="M10 18C2 12 1 8 1 6C1 3.2 3.2 1.5 5.5 1.5C7.4 1.5 9 2.6 10 4.4C11 2.6 12.6 1.5 14.5 1.5C16.8 1.5 19 3.2 19 6C19 8 18 12 10 18Z"/>',D:'<path d="M10 1L17 10L10 19L3 10Z"/>',C:'<circle cx="10" cy="5.6" r="4.3"/><circle cx="5.2" cy="11.6" r="4.3"/><circle cx="14.8" cy="11.6" r="4.3"/><path d="M9.3 11L7.6 19H12.4L10.7 11Z"/>',X:'<path d="M10 1.5L12.4 7.4L18.7 7.8L13.8 11.8L15.4 18L10 14.6L4.6 18L6.2 11.8L1.3 7.8L7.6 7.4Z"/>'};
// r: "A","10","JK", dst. su: S/H/D/C, X untuk joker.
const rk=r=>{const g=r==="JK"?["J","K"]:String(r).split(""),n=g.length;return `<svg class="gl gk" viewBox="0 0 ${n*11-1} 14" style="width:${(n*.78-.08).toFixed(2)}em" aria-hidden="true">${g.map((c,i)=>`<path d="${P[c]}" transform="translate(${i*11} 0)"/>`).join("")}</svg>`};
const su=s=>`<svg class="gl gs" viewBox="0 0 20 20" aria-hidden="true">${S[s]||S.X}</svg>`;
return{rk,su}})();
const SU={S:"♠\uFE0E",H:"♥\uFE0E",D:"♦\uFE0E",C:"♣\uFE0E"},RK={11:"J",12:"Q",13:"K",14:"A"};
const isJ=c=>c[0]==="X",nj=m=>m.filter(c=>!isJ(c));
const suit=c=>c[0],rank=c=>+c.slice(1),lbl=c=>isJ(c)?(c==="X2"?"🃏🔴":"🃏⚫"):(RK[rank(c)]||rank(c))+SU[suit(c)],red=c=>c==="X2"||(!isJ(c)&&"HD".includes(suit(c)));
const pts=c=>{if(isJ(c))return 25;const r=rank(c);return r==14?15:r>10?10:5};
const meldPts=m=>m.length*pts(nj(m)[0]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const sub=(a,k)=>k==0?[[]]:a.length<k?[]:[...sub(a.slice(1),k-1).map(x=>[a[0],...x]),...sub(a.slice(1),k)];
const run=m=>{const n=m.length,x=nj(m);if(n<3||n>4||x.length<2||n-x.length>1||x.some(c=>suit(c)!==suit(x[0])))return false;const r=x.map(rank).sort((a,b)=>a-b);if(r.some((v,i)=>i&&v===r[i-1]))return false;const e=r[r.length-1];let lo,hi;if(e<=10){lo=2;hi=10}else if(r[0]>=11&&e<=13){lo=11;hi=13}else return false;for(let s=lo;s+n-1<=hi;s++)if(s<=r[0]&&s+n-1>=e)return true;return false};
const rell=m=>{const x=nj(m);return m.length>=3&&m.length<=4&&x.length>=2&&m.length-x.length<=1&&x.every(c=>rank(c)===rank(x[0]))};
const meld=m=>run(m)||rell(m);
const isSeri=m=>run(m)||(rell(m)&&rank(nj(m)[0])===14);
// Semua kartu habis jadi kombinasi. need = masih wajib ada seri (rell baru sah kalau sudah punya seri di tangan atau di bawah).
const all=(cs,need)=>{if(!cs.length)return !need;const[a,...r]=cs;for(const k of[2,3])for(const x of sub(r,k)){const m=[a,...x];if(meld(m)&&all(r.filter(c=>!x.includes(c)),need&&!isSeri(m)))return true}return false};
const full=(cs,hs)=>cs.length>=3&&all(cs,!hs);
const hasSeri=L=>(L||[]).some(m=>isSeri(m.split(",")));
const srt=cs=>cs.slice().sort((a,b)=>suit(a).localeCompare(suit(b))||rank(a)-rank(b));
const part=cs=>{if(!cs.length)return{v:0,m:[]};const[a,...r]=cs;let p0=part(r),b={v:p0.v-pts(a),m:p0.m};for(const k of[2,3])for(const x of sub(r,k)){const m=[a,...x];if(meld(m)){const p=part(r.filter(c=>!x.includes(c))),v=meldPts(m)+p.v;if(v>b.v)b={v,m:[m,...p.m]}}}return b};
const partF=(cs,ok)=>{if(!cs.length)return{v:0,m:[]};const[a,...r]=cs;const p0=partF(r,ok);let b={v:p0.v-pts(a),m:p0.m};for(const k of[2,3])for(const x of sub(r,k)){const m=[a,...x];if(meld(m)&&ok(m)){const p=partF(r.filter(c=>!x.includes(c)),ok),v=meldPts(m)+p.v;if(v>b.v)b={v,m:[m,...p.m]}}}return b};
const finalLay=(hand,hasSeri)=>{const q=srt(hand),any=()=>true;if(hasSeri)return partF(q,any);
 let b={v:-q.reduce((t,c)=>t+pts(c),0),m:[]};
 for(const k of[3,4])for(const m of sub(q,k))if(meld(m)&&isSeri(m)){const p=partF(q.filter(c=>!m.includes(c)),any),v=meldPts(m)+p.v;if(v>b.v)b={v,m:[m,...p.m]}}
 return b};
const runOrd=m=>{const x=nj(m),jk=m.filter(isJ),r=x.map(rank),e=Math.max(...r),mn=Math.min(...r),n=m.length,lo=e<=10?2:11,hi=e<=10?10:13;for(let t=lo;t+n-1<=hi;t++)if(t<=mn&&t+n-1>=e){const o=[];for(let v=t;v<t+n;v++)o.push(x.find(y=>rank(y)===v)||jk.shift());return o}return m};
const AM={};
// hs = sudah punya seri di bawah. Kalau belum, pilih susunan yang memuat seri bila ada (rell tanpa seri belum hidup).
const arrange=(cs,hs)=>{const key=cs.slice().sort().join(",")+"|"+!!hs;if(AM[key])return AM[key];
 const q=srt(cs);let ms=cs.length<=12?part(q).m.slice():[];
 if(!hs&&cs.length<=12&&!ms.some(isSeri)){const F=finalLay(q,false);if(F.m.length)ms=F.m.slice()}
 ms.sort((p,r)=>(isSeri(p)?0:1)-(isSeri(r)?0:1));
 const groups=ms.map(m=>run(m)?runOrd(m):m),rest=q.filter(c=>!ms.some(m=>m.includes(c)));
 if(rest.length)groups.push(rest);
 if(Object.keys(AM).length>300)for(const k in AM)delete AM[k];
 return AM[key]={groups,ms}};
const ALLC=[];for(const q of "SHDC")for(let r=2;r<=14;r++)ALLC.push(q+r);
const RDY={};
function ready(H,used,hs){
 if(H.length<3)return false;
 const key=H.slice().sort().join(",")+"|"+used.length+"|"+!!hs;
 if(key in RDY)return RDY[key];
 let ok=false;const cand=ALLC.filter(c=>!H.includes(c)&&!used.includes(c));
 for(const y of H){const rest=H.filter(z=>z!==y);if(cand.some(X=>full([...rest,X],hs))){ok=true;break}}
 if(Object.keys(RDY).length>400)for(const k in RDY)delete RDY[k];
 return RDY[key]=ok}
// Susunan manual: kombinasi dari kartu yang berdampingan.
function adj(o){const M=[];let i=0;while(i<o.length){let k=0;for(const n of[4,3])if(i+n<=o.length&&meld(o.slice(i,i+n))){k=n;break}if(k){M.push(o.slice(i,i+k));i+=k}else i++}return M}
const mk=()=>{const d=[];for(const s of "SHDC")for(let r=2;r<=14;r++)d.push(s+r);d.push("X1","X2");for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]]}return d};
