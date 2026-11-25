// Dijalankan Claude setiap upload: tulis ulang version.json (naikkan v, daftar semua berkas game).
// APK membandingkan v ini dengan miliknya; kalau lebih besar, berkas di daftar diunduh.
const fs=require("fs"),path=require("path"),akar=path.join(__dirname,".."),p=path.join(akar,"version.json");
let v=0;try{v=JSON.parse(fs.readFileSync(p,"utf8")).v}catch(e){}
const isi=d=>fs.readdirSync(path.join(akar,d)).filter(f=>!f.startsWith(".")).sort().map(f=>d+"/"+f);
const files=["index.html",...isi("js"),...isi("img"),...isi("snd")];
fs.writeFileSync(p,JSON.stringify({v:v+1,files},null,1)+"\n");
console.log("version.json v"+(v+1)+", "+files.length+" berkas");
