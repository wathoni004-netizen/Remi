// Salin berkas game dari repo (folder di atas apk/) ke www/ untuk dibungkus ke APK. Daftar berkas = version.json.
const fs=require("fs"),path=require("path"),akar=path.join(__dirname,".."),www=path.join(__dirname,"www");
const v=JSON.parse(fs.readFileSync(path.join(akar,"version.json"),"utf8"));
fs.rmSync(www,{recursive:true,force:true});
for(const f of[...v.files,"version.json"]){const t=path.join(www,f);fs.mkdirSync(path.dirname(t),{recursive:true});fs.copyFileSync(path.join(akar,f),t)}
console.log("Disalin "+(v.files.length+1)+" berkas, versi game "+v.v);
// Login Google native butuh baris ini di proyek Android (dibuat oleh "npx cap add android").
const g=path.join(__dirname,"android","variables.gradle");
if(fs.existsSync(g)){const t=fs.readFileSync(g,"utf8");if(!t.includes("rgcfaIncludeGoogle"))fs.writeFileSync(g,t.replace("ext {","ext {\n    rgcfaIncludeGoogle = true"))}
// Nomor versi APK (versionCode): naikkan angka ini setiap membuat APK baru supaya HP mau memasang di atas yang lama.
const VC=2,b=path.join(__dirname,"android","app","build.gradle");
if(fs.existsSync(b))fs.writeFileSync(b,fs.readFileSync(b,"utf8").replace(/versionCode \d+/,"versionCode "+VC));
