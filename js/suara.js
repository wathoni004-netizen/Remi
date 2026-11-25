// Efek suara game, disintesis dengan WebAudio (tanpa berkas audio, jadi tidak menambah ukuran unduhan APK).
// SND(nama[,arg]) dipanggil dari ui.js (aksi kartu, giliran, menang/set), setfx.js (tiap gerakan efek Set: tebas, ledakan, petir, api, kaca, ...) dan spin.js.
// Efek Set: suara mengikuti gerakan animasi skin, ditambah pembuka khas tier (S/E/L/K) dan nada dasar dari kunci skin, jadi tiap skin terdengar beda.
// Nyala/mati disimpan di localStorage "snd" (variabel snd di net.js); tombolnya di Profil dan di menu meja (☰).
(()=>{
try{snd=localStorage.getItem("snd")!=="0"}catch(e){}
let OUT=null,NB=null,CX={t:"S",m:1};const last={};
function ac(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();
 if(!OUT||OUT.context!==AC){const c=AC.createDynamicsCompressor(),g=AC.createGain();g.gain.value=.8;c.connect(g);g.connect(AC.destination);OUT=c;NB=null}
 return AC}catch(e){return null}}
function noiseBuf(){if(NB)return NB;const n=AC.sampleRate,b=AC.createBuffer(1,n,n),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return NB=b}
// Nada: frekuensi f (bisa meluncur ke o.to), durasi d, bentuk gelombang o.w, volume o.v, serang o.a.
function tone(t,f,d,o){o=o||{};const s=AC.createOscillator(),g=AC.createGain();s.type=o.w||"sine";s.frequency.setValueAtTime(f,t);if(o.to)s.frequency.exponentialRampToValueAtTime(o.to,t+d);
 const v=o.v||.2,a=o.a||.005;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(g);g.connect(o.dst||OUT);s.start(t);s.stop(t+d+.05)}
// Desis: noise lewat filter o.ft (lowpass/highpass/bandpass) di frekuensi o.f (bisa meluncur ke o.f2).
function nz(t,d,o){o=o||{};const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf();s.loop=true;f.type=o.ft||"bandpass";f.frequency.setValueAtTime(o.f||1000,t);if(o.f2)f.frequency.exponentialRampToValueAtTime(o.f2,t+d);f.Q.value=o.q||1;
 const v=o.v||.2,a=o.a||.005;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(f);f.connect(g);g.connect(OUT);s.start(t,Math.random()*.5);s.stop(t+d+.05)}
const R=(a,b)=>a+Math.random()*(b-a);
const notes=(t,fs,step,d,o)=>fs.forEach((f,i)=>tone(t+i*step,f,d,o));
// Daftar suara. m = pengali nada dari skin (efek Set), t = waktu mulai.
const S={
 // Aksi kartu
 draw:t=>{nz(t,.07,{ft:"highpass",f:2500,v:.22});tone(t,1300,.05,{w:"triangle",to:800,v:.05})},
 drop:t=>{nz(t,.1,{ft:"lowpass",f:1800,v:.32});tone(t,170,.12,{to:70,v:.28})},
 take:t=>{nz(t,.28,{f:500,f2:2600,q:2,v:.2,a:.06});tone(t+.2,660,.08,{w:"triangle",v:.06})},
 lay:t=>{[0,.06,.12].forEach(k=>nz(t+k,.06,{ft:"highpass",f:2200,v:.18}));notes(t+.16,[784,988,1175],.07,.25,{w:"triangle",v:.1})},
 sel:t=>tone(t,900,.04,{w:"triangle",v:.05}),
 turn:t=>notes(t,[660,880],.12,.22,{w:"triangle",v:.18}),
 tick:t=>tone(t,520,.05,{w:"triangle",v:.08}),
 pop:t=>tone(t,700,.1,{to:1100,v:.14}),
 emo:t=>{tone(t,500,.08,{to:900,v:.12});tone(t+.06,1200,.06,{w:"triangle",v:.06})},
 win:t=>{notes(t,[523,659,784,1047],.11,.3,{w:"triangle",v:.16});notes(t,[262,330,392,523],.11,.3,{w:"square",v:.03});S.burst(t+.45)},
 set:t=>{notes(t,[392,523,659,784,1047],.1,.35,{w:"triangle",v:.17});notes(t,[196,262,330,392,523],.1,.35,{w:"sawtooth",v:.03});tone(t+.5,1047,.9,{w:"triangle",v:.12});S.stars(t+.5)},
 // Spin skin: detak kartu lewat (melambat), lalu suara hadiah per tingkat
 spin:(t,d)=>{d=d||4;for(let k=0;k<=24;k++){const p=k/24,x=d*(1-Math.pow(1-p,1/3));tone(t+x,1400,.03,{w:"square",v:.035})}},
 rev0:t=>{tone(t,300,.35,{w:"sawtooth",to:120,v:.08})},
 rev1:t=>{notes(t,[659,880],.09,.25,{w:"triangle",v:.14})},
 rev2:t=>{notes(t,[659,880,1175],.08,.3,{w:"triangle",v:.14});S.stars(t+.25)},
 rev3:t=>{S.charge(t);notes(t+.55,[523,659,784,1047,1319],.07,.4,{w:"triangle",v:.15});S.stars(t+.9)},
 rev4:t=>{S.charge(t);S.boom(t+.6);notes(t+.6,[523,659,784,1047,1319,1568],.07,.5,{w:"triangle",v:.16});notes(t+.6,[262,330,392,523],.07,.6,{w:"sawtooth",v:.04});S.glass(t+1.1)},
 // Gerakan efek Set (setfx.js); nada dikali CX.m supaya tiap skin beda
 slash:t=>{nz(t,.2,{f:3500*CX.m,f2:700,q:3,v:.34,a:.01});tone(t+.02,2200*CX.m,.12,{w:"sawtooth",to:500,v:.04})},
 boom:t=>{tone(t,110*CX.m,.6,{to:38,v:.5});nz(t,.35,{ft:"lowpass",f:400,f2:80,v:.28})},
 burst:t=>{for(let i=0;i<5;i++)tone(t+i*.025,R(1500,3200)*CX.m,.09,{w:"triangle",v:.05})},
 stars:t=>{[2093,2637,3136,2637*1.5].forEach((f,i)=>tone(t+i*.06,f*CX.m,.18,{v:.06}))},
 zap:t=>{const g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();g.gain.value=1;l.type="square";l.frequency.value=35;lg.gain.value=.9;l.connect(lg);lg.connect(g.gain);g.connect(OUT);l.start(t);l.stop(t+.35);
  tone(t,1100*CX.m,.3,{w:"sawtooth",to:110,v:.13,dst:g});nz(t,.3,{ft:"highpass",f:3000,v:.22})},
 impact:t=>{nz(t,.14,{ft:"highpass",f:1200,v:.38});tone(t,95*CX.m,.28,{to:40,v:.42})},
 rumble:t=>nz(t,.7,{ft:"lowpass",f:160,v:.45,a:.04}),
 roar:t=>{nz(t,.9,{f:300,f2:1100,q:.8,v:.32,a:.08});nz(t,.9,{ft:"lowpass",f:200,v:.2,a:.1})},
 crackle:t=>{for(let i=0;i<9;i++)nz(t+R(0,.5),.025,{ft:"highpass",f:R(2000,5000),v:.16})},
 charge:t=>{tone(t,180*CX.m,.6,{to:900*CX.m,v:.1,a:.3});tone(t,182*CX.m,.6,{w:"triangle",to:905*CX.m,v:.05,a:.3})},
 crack:t=>{nz(t,.05,{f:2400,q:2,v:.35});nz(t+.04,.05,{f:1600,q:2,v:.25});tone(t,320,.12,{w:"square",to:90,v:.05})},
 glass:t=>{nz(t,.35,{ft:"highpass",f:4500,v:.2});for(let i=0;i<10;i++)tone(t+R(0,.25),R(2800,6500),R(.06,.2),{v:.04})},
 poof:t=>nz(t,.22,{ft:"lowpass",f:900,f2:200,v:.2,a:.02}),
 // Pembuka khas tier saat kartu Set dilempar
 introS:t=>{nz(t,.35,{f:400*CX.m,f2:3000,q:1.5,v:.22,a:.15})},
 introE:t=>{S.charge(t);tone(t,55*CX.m,1,{w:"sawtooth",v:.05,a:.2})},
 introL:t=>{[110,165,220,277].forEach(f=>tone(t,f*CX.m,1.6,{w:"triangle",v:.07,a:.5}));tone(t,55*CX.m,1.8,{v:.2,a:.3})},
 introK:t=>{notes(t,[523,659,784,988,1175,1397,1568].map(f=>f*CX.m),.07,.6,{w:"triangle",v:.09});[262,392,523].forEach(f=>tone(t+.5,f*CX.m,1.5,{v:.06,a:.4}))}};
// Nama gerakan setfx.js -> suara
const MAP={slash:"slash",ring:"boom",burst:"burst",stars:"stars",bolt:"zap",flash:"impact",shake:"rumble",fire:"roar",burn:"roar",embers:"crackle",glow:"charge",charge:"charge",split:"crack",crackLater:"crack",glass:"glass",shards:"glass",shatterNP:"glass",puff:"poof"};
window.SND=(k,x)=>{
 if(!snd)return;k=MAP[k]||k;const f=S[k];if(!f||!ac())return;
 const now=AC.currentTime,gap=k==="draw"||k==="sel"?.02:.06;if(last[k]&&now-last[k]<gap)return;last[k]=now;
 try{f(now+.01,x)}catch(e){}};
// Dipanggil setfx.js saat efek Set mulai: nada dasar dari kunci skin + pembuka tier.
window.SNDset=sk=>{const k=String(sk&&sk.k||""),h=[...k].reduce((a,c)=>a+c.charCodeAt(0),0);CX={t:sk&&sk.t||"S",m:[.85,.94,1,1.06,1.12,1.19][h%6]};SND("intro"+CX.t)};
// Tombol Suara: Nyala / Mati
const lbl=()=>"Suara: "+(snd?"Nyala":"Mati");
window.sndUI=()=>document.querySelectorAll(".snb").forEach(b=>{b.textContent=lbl();b.setAttribute("aria-pressed",snd)});
document.addEventListener("click",e=>{const b=e.target.closest(".snb");if(!b)return;snd=!snd;try{localStorage.setItem("snd",snd?"1":"0")}catch(_){}sndUI();SND("pop")});
sndUI();
})();
