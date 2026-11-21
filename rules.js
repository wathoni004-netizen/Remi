const $=s=>document.querySelector(s);
const SU={S:"♠",H:"♥",D:"♦",C:"♣"},RK={11:"J",12:"Q",13:"K",14:"A"};
const isJ=c=>c[0]==="X",nj=m=>m.filter(c=>!isJ(c));
const suit=c=>c[0],rank=c=>+c.slice(1),lbl=c=>isJ(c)?(c==="X2"?"🃏🔴":"🃏⚫"):(RK[rank(c)]||rank(c))+SU[suit(c)],red=c=>c==="X2"||(!isJ(c)&&"HD".includes(suit(c)));
const pts=c=>{if(isJ(c))return 25;const r=rank(c);return r==14?15:r>10?10:5};
const meldPts=m=>m.length*pts(nj(m)[0]);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const sub=(a,k)=>k==0?[[]]:a.length<k?[]:[...sub(a.slice(1),k-1).map(x=>[a[0],...x]),...sub(a.slice(1),k)];
const seq=a=>a.every((r,i)=>!i||r==a[i-1]+1);
const run=m=>{const n=m.length,x=nj(m);if(n<3||n>4||x.length<2||n-x.length>1||x.some(c=>suit(c)!==suit(x[0])))return false;const r=x.map(rank).sort((a,b)=>a-b);if(r.some((v,i)=>i&&v===r[i-1]))return false;const e=r[r.length-1];let lo,hi;if(e<=10){lo=2;hi=10}else if(r[0]>=11&&e<=13){lo=11;hi=13}else return false;for(let s=lo;s+n-1<=hi;s++)if(s<=r[0]&&s+n-1>=e)return true;return false};
const rell=m=>{const x=nj(m);return m.length>=3&&m.length<=4&&x.length>=2&&m.length-x.length<=1&&x.every(c=>rank(c)===rank(x[0]))};
const meld=m=>run(m)||rell(m);
const isSeri=m=>run(m)||(rell(m)&&rank(nj(m)[0])===14);
const best=cs=>{if(!cs.length)return 0;const[a,...r]=cs;let b=-pts(a)+best(r);for(const k of[2,3])for(const x of sub(r,k)){const m=[a,...x];if(meld(m))b=Math.max(b,meldPts(m)+best(r.filter(c=>!x.includes(c))))}return b};
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
