// Efek suara game, disintesis dengan WebAudio (tanpa berkas audio, jadi tidak menambah ukuran unduhan APK).
// SND(nama[,arg]) dipanggil dari ui.js (aksi kartu, giliran, menang/set), setfx.js (tiap gerakan efek Set: tebas, ledakan, petir, api, kaca, ...) dan spin.js.
// Efek Set: tiap skin punya naskah suara sendiri (SC, sampel rekaman snd/*.ogg + lapisan sintetis), waktunya mengikuti animasi; makin tinggi tier makin berat, bergema, dan berlapis.
// Nyala/mati disimpan di localStorage "snd" (variabel snd di net.js); tombolnya di Profil dan di menu meja (☰).
(()=>{
try{snd=localStorage.getItem("snd")!=="0"}catch(e){}
let OUT=null,NB=null,CX={t:"S",m:1};const last={};
function ac(){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();
 if(!OUT||OUT.context!==AC){const c=AC.createDynamicsCompressor(),g=AC.createGain();g.gain.value=.8;c.connect(g);g.connect(AC.destination);OUT=c;NB=null;RVN={}}
 loadS();
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
 // Gerakan efek Set (setfx.js). Nada dikali CX.m (dari kunci skin) supaya tiap skin beda. x = durasi (detik) / kekuatan.
 // Lemparan: desis angin yang makin dekat makin keras; lemparan panjang (berputar) diberi kibasan "wuk-wuk".
 fly:(t,d)=>{d=Math.min(1.8,Math.max(.18,d||.4));const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf();s.loop=true;f.type="bandpass";f.Q.value=1.4;
  f.frequency.setValueAtTime(380*CX.m,t);f.frequency.exponentialRampToValueAtTime(2400*CX.m,t+d*.85);f.frequency.exponentialRampToValueAtTime(800,t+d+.15);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.04,t+d*.3);g.gain.exponentialRampToValueAtTime(.24,t+d*.9);g.gain.exponentialRampToValueAtTime(.0001,t+d+.18);
  s.connect(f);f.connect(g);if(d>.55){const am=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();am.gain.value=.55;l.frequency.value=9;lg.gain.value=.45;l.connect(lg);lg.connect(am.gain);g.connect(am);am.connect(OUT);l.start(t);l.stop(t+d+.25)}else g.connect(OUT);
  s.start(t,Math.random()*.5);s.stop(t+d+.25)},
 fall:(t,d)=>{d=d||.5;tone(t,2400*CX.m,d,{to:500,v:.05,a:d*.4});nz(t,d,{f:3500,f2:600,q:2,v:.16,a:d*.7})},
 slash:t=>{nz(t,.2,{f:3500*CX.m,f2:700,q:3,v:.34,a:.01});tone(t+.02,2200*CX.m,.12,{w:"sawtooth",to:500,v:.04})},
 // Hantaman & ledakan
 thud:t=>{nz(t,.06,{ft:"highpass",f:1500,v:.3});tone(t,140*CX.m,.18,{to:55,v:.4})},
 impact:t=>S.thud(t),
 sub:t=>{tone(t,75,.6,{to:30,v:.5});tone(t,110,.3,{w:"triangle",to:45,v:.2})},
 whomp:t=>{tone(t,170*CX.m,.25,{to:60,v:.2});nz(t,.18,{ft:"lowpass",f:700,f2:150,v:.12})},
 boom:t=>{tone(t,120*CX.m,.7,{to:32,v:.55});nz(t,.9,{ft:"lowpass",f:1800,f2:90,v:.42,a:.004});nz(t,.12,{f:900,q:.7,v:.3});for(let i=0;i<6;i++)nz(t+.05+R(0,.5),.03,{ft:"highpass",f:R(1500,4000),v:.08})},
 bigboom:t=>{tone(t,90,1.4,{to:25,v:.7});tone(t,60,1.6,{w:"triangle",to:22,v:.3});nz(t,1.8,{ft:"lowpass",f:2500,f2:60,v:.55,a:.003});nz(t+.04,.25,{f:700,q:.6,v:.35});for(let i=0;i<14;i++)nz(t+.1+R(0,1.2),.03,{ft:"highpass",f:R(1200,4500),v:.1})},
 rumble:(t,a)=>{a=a||8;if(a<7)return S.thud(t);nz(t,.4+a*.04,{ft:"lowpass",f:120+a*6,v:Math.min(.55,.2+a*.02),a:.01});tone(t,55,.3+a*.03,{to:30,v:.25})},
 burst:t=>{nz(t,.08,{f:1500,q:.8,v:.12});for(let i=0;i<5;i++)tone(t+i*.025,R(1500,3200)*CX.m,.09,{w:"triangle",v:.05})},
 crack:t=>{nz(t,.05,{f:2400,q:2,v:.35});nz(t+.04,.05,{f:1600,q:2,v:.25});tone(t,320,.12,{w:"square",to:90,v:.05})},
 shot:t=>{nz(t,.05,{ft:"highpass",f:2000,v:.5});tone(t,180,.2,{to:50,v:.5});nz(t+.03,.45,{ft:"lowpass",f:1500,f2:200,v:.25})},
 scope:t=>notes(t,[1800,1800],.14,.05,{w:"square",v:.035}),
 grind:(t,d)=>{d=d||.9;tone(t,240*CX.m,d,{w:"sawtooth",to:320*CX.m,v:.07,a:.03});nz(t,d,{f:3200,q:4,v:.18,a:.03});for(let i=0;i<10;i++)nz(t+R(0,d),.02,{ft:"highpass",f:R(3000,6000),v:.1})},
 sword:t=>{nz(t,.12,{ft:"highpass",f:4000,f2:8000,v:.1});tone(t+.08,R(1800,2600)*CX.m,.45,{w:"triangle",v:.05})},
 clang:t=>{nz(t,.08,{ft:"highpass",f:2000,v:.35});tone(t,520*CX.m,.8,{w:"square",v:.05});tone(t,1340*CX.m,.6,{w:"triangle",v:.07});tone(t,2210*CX.m,.4,{v:.05})},
 saber:(t,d)=>{d=d||1;tone(t,95,d,{w:"sawtooth",v:.07,a:.05});tone(t,97,d,{w:"sawtooth",v:.05,a:.05});tone(t+d*.3,150,.4,{w:"sawtooth",to:90,v:.1});nz(t+d*.3,.35,{f:600,f2:2500,q:3,v:.16,a:.1})},
 // Cahaya: dengung lonceng terang + desis halus + kerlip
 shine:(t,d)=>{d=d||.9;[1047,1319,1568,2093].forEach(f=>{tone(t,f*CX.m,d,{v:.04,a:d*.35});tone(t,f*CX.m*1.005,d,{w:"triangle",v:.018,a:d*.35})});nz(t,d,{ft:"highpass",f:5000,f2:9000,v:.05,a:d*.3});S.twinkle(t+d*.3,d*.7)},
 glow:t=>S.shine(t,.6),
 flash:t=>{nz(t,.5,{ft:"highpass",f:6000,v:.2,a:.003});tone(t,2637*CX.m,.7,{v:.06});tone(t,3951*CX.m,.5,{v:.04});tone(t,1319*CX.m,.8,{w:"triangle",v:.05})},
 twinkle:(t,d)=>{d=d||.8;for(let i=0;i<8;i++)tone(t+R(0,d),R(2000,4200)*CX.m,.25,{v:.035})},
 stars:t=>{[2093,2637,3136,2637*1.5].forEach((f,i)=>tone(t+i*.06,f*CX.m,.18,{v:.06}))},
 ping:(t,i)=>{const f=[1568,1760,1976,2349,2637,3136,3520][(i|0)%7]*CX.m;tone(t,f,.5,{v:.07});tone(t,f*2,.3,{v:.02})},
 crown:t=>{notes(t,[1568,2093,2637].map(f=>f*CX.m),.06,.5,{v:.06});S.twinkle(t+.15,.5)},
 beam:(t,d)=>{d=d||1;tone(t,220*CX.m,d,{w:"sawtooth",v:.07,a:.05});tone(t,440*CX.m,d,{w:"square",v:.025,a:.05});nz(t,d,{f:1200,q:.8,v:.16,a:.05});S.shine(t,d)},
 charge:t=>{tone(t,180*CX.m,.6,{to:900*CX.m,v:.1,a:.3});tone(t,182*CX.m,.6,{w:"triangle",to:905*CX.m,v:.05,a:.3});nz(t,.6,{f:300,f2:4000,q:2,v:.07,a:.5})},
 zap:t=>{const g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();g.gain.value=1;l.type="square";l.frequency.value=35;lg.gain.value=.9;l.connect(lg);lg.connect(g.gain);g.connect(OUT);l.start(t);l.stop(t+.35);
  tone(t,1100*CX.m,.3,{w:"sawtooth",to:110,v:.13,dst:g});nz(t,.3,{ft:"highpass",f:3000,v:.22})},
 // Api, gaib, ruang
 roar:t=>{nz(t,.9,{f:300,f2:1100,q:.8,v:.32,a:.08});nz(t,.9,{ft:"lowpass",f:200,v:.2,a:.1});S.crackle(t+.2)},
 crackle:t=>{for(let i=0;i<9;i++)nz(t+R(0,.5),.025,{ft:"highpass",f:R(2000,5000),v:.16})},
 rocket:(t,d)=>{d=d||.75;nz(t,d,{f:800,f2:3000,q:1,v:.3,a:.05});tone(t,150,d,{w:"sawtooth",to:400,v:.05});S.crackle(t)},
 growl:t=>{const g=AC.createGain(),l=AC.createOscillator(),lg=AC.createGain();g.gain.value=.6;l.frequency.value=28;lg.gain.value=.4;l.connect(lg);lg.connect(g.gain);g.connect(OUT);l.start(t);l.stop(t+1.4);
  tone(t,90,1.3,{w:"sawtooth",to:55,v:.16,a:.25,dst:g});nz(t,1.3,{ft:"lowpass",f:500,f2:200,v:.2,a:.3})},
 dark:(t,d)=>{d=Math.min(4.5,d||2);tone(t,55,d,{w:"sawtooth",v:.04,a:d*.25});tone(t,82.5,d,{w:"triangle",v:.05,a:d*.25});nz(t,d,{ft:"lowpass",f:220,v:.1,a:d*.3})},
 portal:t=>{tone(t,200,.6,{w:"triangle",to:600,v:.1,a:.1});tone(t,203,.6,{to:610,v:.06,a:.1});nz(t,.6,{f:500,f2:2000,q:3,v:.08,a:.2})},
 vortex:(t,d)=>{d=d||1;nz(t,d,{f:200,f2:3000,q:4,v:.2,a:d*.6});tone(t,100,d,{w:"triangle",to:800,v:.06,a:d*.5})},
 void:(t,d)=>{d=d||1.6;tone(t,300,d,{w:"triangle",to:40,v:.12,a:.3});nz(t,d,{ft:"lowpass",f:800,f2:80,v:.2,a:.4})},
 clock:(t,d)=>{d=d||1.4;for(let i=0;i*.2<d;i++)tone(t+i*.2,i%2?900:1300,.04,{w:"square",v:.06})},
 // Kaca/kristal
 ting:t=>notes(t,[2637,3520].map(f=>f*CX.m),.05,.6,{v:.06}),
 tinkle:t=>{for(let i=0;i<12;i++)tone(t+R(.05,1.1),R(3000,6000),R(.05,.15),{v:.03})},
 glass:t=>{nz(t,.35,{ft:"highpass",f:4500,v:.2});for(let i=0;i<10;i++)tone(t+R(0,.25),R(2800,6500),R(.06,.2),{v:.04})},
 poof:t=>nz(t,.22,{ft:"lowpass",f:900,f2:200,v:.2,a:.02})};
window.SND=(k,x)=>{
 if(!snd)return;const f=S[k];if(!f||!ac())return;
 const now=AC.currentTime,gap=k==="draw"||k==="sel"?.02:.06;if(last[k]&&now-last[k]<gap)return;last[k]=now;
 try{f(now+.01,x)}catch(e){}};
// ---------- Sampel rekaman untuk efek Set ----------
// Berkas snd/*.ogg dari pack Kenney.nl (CC0, bebas dipakai). Dimuat sekali saat suara pertama dibunyikan.
// Waktu di naskah = saat PUNCAK suara (PK, diukur otomatis) jatuh, jadi dentum/sabetan pas dengan animasi.
const SN="bong_001 bookFlip1 bookFlip2 cloth1 cloth2 cloth3 cloth4 confirmation_002 drawKnife2 engineCircular_000 explosionCrunch_000 explosionCrunch_001 explosionCrunch_002 explosionCrunch_003 explosionCrunch_004 forceField_000 forceField_002 glass_001 glass_004 handleCoins impactBell_heavy_000 impactBell_heavy_001 impactGlass_heavy_000 impactGlass_heavy_001 impactGlass_medium_000 impactMetal_heavy_000 impactMining_000 impactPlank_medium_000 impactPunch_heavy_000 impactPunch_heavy_002 impactPunch_medium_000 impactSoft_heavy_000 impactTin_medium_000 impactWood_light_000 impactWood_light_001 impactWood_light_002 knifeSlice knifeSlice2 laserLarge_000 laserLarge_002 lowFrequency_explosion_000 lowFrequency_explosion_001 maximize_005 metalClick metalLatch phaseJump1 phaserUp3 powerUp1 powerUp10 powerUp3 slime_000 spaceEngineLow_002 thrusterFire_000 zap1 zap2".split(" "),SB={},PK={};
let LD=0,RVN={};
function loadS(){if(LD||!AC)return;LD=1;SN.forEach(n=>fetch("snd/"+n+".ogg").then(r=>r.arrayBuffer()).then(b=>new Promise((ok,no)=>AC.decodeAudioData(b,ok,no))).then(b=>{SB[n]=b;const d=b.getChannelData(0);let p=0,pi=0;for(let i=0;i<d.length;i+=4){const a=Math.abs(d[i]);if(a>p){p=a;pi=i}}PK[n]=pi/b.sampleRate}).catch(()=>{}))}
// Watak tier: makin tinggi makin berat (nada turun), gema makin panjang & basah, ada lapisan bass.
const TC={S:{rv:.06,rl:.5,r:1.06},E:{rv:.2,rl:1.3,r:1},L:{rv:.34,rl:2.6,r:.9},K:{rv:.45,rl:3.4,r:.86}};
function REV(){const k=CX.t;if(RVN[k])return RVN[k];const c=TC[k]||TC.S,n=AC.sampleRate*c.rl|0,b=AC.createBuffer(2,n,AC.sampleRate);
 for(let h=0;h<2;h++){const d=b.getChannelData(h);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,3)}const v=AC.createConvolver();v.buffer=b;v.connect(OUT);return RVN[k]=v}
// Putar sampel n pada waktu t. o: v volume, r kecepatan/nada, lp lowpass, d potong (detik, fade), pk:false = mulai tepat di t (bukan puncaknya).
function smp(n,t,o){o=o||{};const b=SB[n];if(!b)return;const c=TC[CX.t]||TC.S,r=(o.r||1)*c.r,s=AC.createBufferSource(),g=AC.createGain();s.buffer=b;s.playbackRate.value=r;
 let st=t-(o.pk===false?0:(PK[n]||0)/r),off=0;const now=AC.currentTime;if(st<now){off=(now-st)*r;st=now}
 let x=s;if(o.lp){const f=AC.createBiquadFilter();f.type="lowpass";f.frequency.value=o.lp;s.connect(f);x=f}x.connect(g);const v=o.v??.8;g.gain.value=v;g.connect(OUT);
 const rv=o.rv??c.rv;if(rv>0){const sg=AC.createGain();sg.gain.value=rv;g.connect(sg);sg.connect(REV())}
 if(o.d){g.gain.setValueAtTime(v,st+Math.max(0,o.d-.25));g.gain.linearRampToValueAtTime(.0001,st+o.d);s.start(st,off);s.stop(st+o.d+.05)}else s.start(st,off)}
// Lapisan bersama per tier (D = waktu dampak utama / finale)
const hitE=D=>[[D,"impactPunch_heavy_000",{v:.85}],[D,"~sub"],[D+40,"~twinkle",.7]],
 finL=D=>[[D,"lowFrequency_explosion_000",{v:1}],[D,"explosionCrunch_004",{v:.85}],[D,"~bigboom"],[D+150,"thrusterFire_000",{pk:false,d:1.6,v:.4,r:.8}],[D+250,"~twinkle",1.6]],
 finK=D=>[[D-150,"glass_004",{v:.5}],[D,"lowFrequency_explosion_000",{v:1}],[D,"explosionCrunch_003",{v:.7,r:.75}],[D,"~bigboom"],[D+80,"impactGlass_heavy_001",{v:1}],[D+100,"impactGlass_medium_000",{v:.8,r:.8}],[D+250,"powerUp1",{pk:false,v:.3,r:1.25}],[D+300,"~tinkle"]],
 fl="bookFlip2",ws=(t,v,r)=>[t,["cloth1","cloth2","cloth3","cloth4"][t%4],{v:v||.55,r:r||1}];
// Naskah suara per skin: [ms, sampel | "~sintetis", opsi]. Waktu mengikuti animasi varian skin itu di setfx.js.
const SC={
 // SPESIAL: kering & ringan, satu-dua lapis
 S01:[[0,fl,{v:.5}],ws(420),[430,"knifeSlice",{v:.9}],[440,"impactPunch_medium_000",{v:.7}],[480,"drawKnife2",{v:.35,r:1.2}]],
 S02:[[0,fl,{v:.5}],[0,"~fly",.65],[650,"knifeSlice2",{v:.85}],[650,"impactPunch_medium_000",{v:.7}],ws(1250,.4),[1300,"impactWood_light_000",{v:.35}]],
 S03:[[0,"bookFlip1",{pk:false,v:.55}],ws(880),[1000,"knifeSlice",{v:.85}],[1000,"impactPunch_heavy_002",{v:.7}],[1080,"knifeSlice2",{v:.8,r:1.1}]],
 S04:[[0,fl,{v:.5}],[240,"impactWood_light_000",{v:.75}],[480,"impactWood_light_001",{v:.75,r:1.1}],ws(700,.5),[720,"impactPlank_medium_000",{v:.85}],[720,"impactPunch_medium_000",{v:.5}]],
 S05:[[0,fl,{v:.5}],ws(220,.6),[230,"impactGlass_heavy_000",{v:.85}],[240,"knifeSlice2",{v:.6,r:1.3}],ws(420,.35,1.3)],
 S06:[[0,fl,{v:.5}],[0,"~fly",.9],ws(450,.4),[900,"impactSoft_heavy_000",{v:.85}],[900,"phaserUp3",{v:.45}],[950,"maximize_005",{pk:false,v:.35}]],
 S07:[[80,"metalLatch",{v:.75}],[450,"metalClick",{v:.6}],[935,"bong_001",{v:.4}],ws(1560,.5,1.2),[1600,"explosionCrunch_000",{v:.8,r:1.4,d:.5}],[1600,"impactGlass_heavy_001",{v:.6}]],
 S08:[[0,fl,{v:.5}],ws(330),[350,"impactMetal_heavy_000",{v:.8}],[350,"engineCircular_000",{pk:false,d:.9,v:.45,r:1.5}],[1250,"knifeSlice",{v:.85}],[1260,"impactTin_medium_000",{v:.7}]],
 S09:[[0,"cloth3",{pk:false,v:.5}],...[0,1,2,3,4,5].map(i=>[830+i*120,"impactWood_light_00"+(i%3),{v:.6,r:.9+i*.05}]),[1430,"impactPlank_medium_000",{v:.75}]],
 S10:[[0,fl,{v:.5}],[250,"impactSoft_heavy_000",{v:.5,r:1.3}],[500,"impactSoft_heavy_000",{v:.55,r:1.2}],[750,"impactSoft_heavy_000",{v:.6,r:1.1}],[1000,"impactPunch_heavy_000",{v:.8}],[1000,"impactSoft_heavy_000",{v:.6,r:.8}]],
 S11:[[0,fl,{v:.5}],[0,"~fly",1.3],[650,"impactWood_light_002",{v:.4}],[1300,"knifeSlice2",{v:.8}],[1300,"impactPunch_medium_000",{v:.75}]],
 S12:[[0,"explosionCrunch_002",{v:.85,r:1.1}],[0,"lowFrequency_explosion_001",{v:.6}],ws(280,.5),[300,"explosionCrunch_000",{v:.85}],[300,"impactPunch_heavy_000",{v:.8}]],
 // EPIK: + bass, gema sedang, suara energi
 E01:[[0,"~dark",2.6],[0,"forceField_000",{pk:false,v:.35,r:.7}],[200,"powerUp3",{pk:false,v:.4,r:.8}],[1050,"zap2",{v:.8}],[1090,"zap1",{v:.6}],[1150,"explosionCrunch_003",{v:.9,r:.75,lp:3500}],...hitE(1160)],
 E02:[[0,"~dark",2.4],...[0,1,2,3,4].flatMap(i=>[[i*180,"~fall",.42],[420+i*180,"explosionCrunch_00"+(i%3),{v:.55,r:1.1,d:.6}]]),[1150,"lowFrequency_explosion_000",{v:.9}],...hitE(1150)],
 E03:[[0,"forceField_002",{pk:false,v:.6}],[350,"forceField_000",{pk:false,v:.6,r:1.15}],[500,"slime_000",{v:.5}],[520,"phaseJump1",{v:.6,r:.8}],[820,"phaseJump1",{pk:false,v:.6,r:1.1}],ws(1180,.4),[1200,"powerUp10",{v:.4}],...hitE(1200)],
 E04:[ws(360),[380,"impactSoft_heavy_000",{v:.7}],[380,"spaceEngineLow_002",{pk:false,d:1.2,v:.7,r:.8}],[400,"~vortex",1.1],[1300,"slime_000",{v:.55,r:.7}],[1500,"explosionCrunch_001",{v:.8,r:.8}],...hitE(1500)],
 E05:[[380,"laserLarge_002",{pk:false,v:.5,r:.6}],[500,"forceField_002",{pk:false,v:.5,r:.6,d:.9}],[780,"laserLarge_000",{v:.8,r:.7}],[790,"knifeSlice",{v:.6}],...hitE(790)],
 E06:[[0,fl,{v:.5}],[350,"bookFlip1",{pk:false,v:.6}],[350,"powerUp1",{pk:false,v:.35}],ws(1080),[1100,"impactPunch_heavy_002",{v:.7}],[1100,"confirmation_002",{pk:false,v:.3}],...hitE(1100)],
 // LEGENDA: sinematis, latar gelap berdengung, dentum besar + api
 L01:[[0,"~dark",3.6],[200,"thrusterFire_000",{pk:false,v:.5,r:.55,d:1.6}],[300,"~growl"],[400,"spaceEngineLow_002",{pk:false,v:.45,r:.6,d:1.4}],ws(1700,.6,.7),...finL(1800)],
 L02:[[0,"~dark",3.6],[0,fl,{v:.5}],[400,"impactBell_heavy_001",{pk:false,v:.5,r:.6}],[400,"~shine",1.4],[500,"thrusterFire_000",{pk:false,v:.45,r:.7,d:1.4}],...finL(1900)],
 L03:[[0,"~dark",3.4],[300,"impactBell_heavy_000",{pk:false,v:.55,r:.45}],[300,"~void",1.7],[600,"cloth1",{pk:false,v:.5,r:.7}],[1100,"slime_000",{v:.5,r:.6}],[1100,"~vortex",.8],...finL(2000)],
 L04:[[0,"~dark",3.8],[100,"handleCoins",{pk:false,v:.5}],[640,"impactBell_heavy_001",{v:.6,r:1.2}],[700,"~twinkle",1],[900,"powerUp3",{pk:false,v:.5,r:.7}],[1700,"laserLarge_002",{pk:false,v:.7,r:.5}],[1700,"~beam",1],...finL(1900)],
 // KOLEKTOR: paling megah, gema panjang, kaca/kristal pecah
 K01:[[0,"~dark",4.2],[0,"cloth3",{pk:false,v:.5}],[500,"spaceEngineLow_002",{pk:false,v:.6,r:.7,d:1.5}],[500,"~fall",1.5],[1990,"impactPunch_heavy_000",{v:1,r:.6}],[2000,"impactMining_000",{v:.8,r:.7}],...finK(2000)],
 K02:[[0,"~dark",5],[0,fl,{v:.5}],[520,"impactBell_heavy_000",{pk:false,v:.5,r:.4}],[520,"spaceEngineLow_002",{pk:false,v:.8,r:.6,d:1.85}],[900,"~vortex",1.4],[1250,"phaseJump1",{v:.4,r:.6}],[1600,"phaseJump1",{v:.45,r:.5}],[1900,"phaseJump1",{v:.5,r:.4}],...finK(2350),[2350,"explosionCrunch_004",{v:1,r:.6}],[2350,"thrusterFire_000",{pk:false,v:.5,r:.5,d:2}]]};
// Dipanggil setfx.js saat efek Set mulai: pilih naskah skin (atau skin setier dengan varian sama), lalu jadwalkan.
window.SNDset=sk=>{if(!snd||!sk||!ac())return;CX={t:sk.t||"S",m:1};
 const L=(window.SKA&&SKA.list)||[],sc=SC[sk.k]||SC[(L.find(d=>d.t===sk.t&&d.v===sk.v)||{}).k]||SC[{S:"S01",E:"E01",L:"L01",K:"K02"}[sk.t]];if(!sc)return;
 const t0=AC.currentTime+.03;sc.forEach(([ms,n,o])=>{const t=t0+ms/1000;try{if(n[0]==="~"){const f=S[n.slice(1)];if(f)f(t,o)}else smp(n,t,o)}catch(e){}})};
// Tombol Suara: Nyala / Mati
const lbl=()=>"Suara: "+(snd?"Nyala":"Mati");
window.sndUI=()=>document.querySelectorAll(".snb").forEach(b=>{b.textContent=lbl();b.setAttribute("aria-pressed",snd)});
document.addEventListener("click",e=>{const b=e.target.closest(".snb");if(!b)return;snd=!snd;try{localStorage.setItem("snd",snd?"1":"0")}catch(_){}sndUI();SND("pop")});
sndUI();
})();
