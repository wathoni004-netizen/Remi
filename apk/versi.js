// Dijalankan Claude setiap upload: tulis ulang version.json (naikkan v, daftar semua berkas game).
// APK membandingkan v ini dengan miliknya; kalau lebih besar, berkas yang sidiknya ("h") berubah diunduh.
// Jalankan SETELAH semua suntingan selesai: sidik dihitung dari isi berkas saat itu.
const fs=require("fs"),path=require("path"),crypto=require("crypto"),akar=path.join(__dirname,".."),p=path.join(akar,"version.json");
let v=0;try{v=JSON.parse(fs.readFileSync(p,"utf8")).v}catch(e){}
const isi=d=>fs.readdirSync(path.join(akar,d)).filter(f=>!f.startsWith(".")).sort().map(f=>d+"/"+f);
const files=["index.html",...isi("js"),...isi("img"),...isi("snd")];
// Sidik sama dengan js/apk.js: SHA-256, 16 hex pertama; CR diabaikan di berkas teks.
const sidik=f=>{let a=fs.readFileSync(path.join(akar,f));if(/\.(html|js|json|css)$/.test(f))a=Buffer.from(a.filter(c=>c!==13));return crypto.createHash("sha256").update(a).digest("hex").slice(0,16)};
const h=Object.fromEntries(files.map(f=>[f,sidik(f)]));
fs.writeFileSync(p,JSON.stringify({v:v+1,files,h},null,1)+"\n");
console.log("version.json v"+(v+1)+", "+files.length+" berkas");
