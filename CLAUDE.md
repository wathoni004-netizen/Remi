# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Game kartu remi online 2-4 pemain. Web statis tanpa build/bundler (tayang di GitHub Pages) + Firebase Realtime Database & Auth (anonim / Google). `apk/` membungkus game yang sama jadi APK Android (Capacitor). Komentar dan teks UI berbahasa Indonesia; pertahankan gaya kode yang padat (nama variabel pendek, satu baris panjang).

## Gaya kerja

- Panggil user "Boss".
- Bahasa Indonesia santai, singkat, langsung ke inti.
- Tugas yang jelas: langsung kerjakan sampai jadi, jangan cuma kasih saran.
- Tanpa izin (sudah disetujui Boss): hapus file/folder biasa, ubah Firebase/rules/database, `npm install` dan install besar. Tetap jelaskan singkat apa dan kenapa (terutama Firebase), tapi tidak perlu menunggu jawaban.
- Tetap minta izin dulu: `git push` ke GitHub, dan melonggarkan blokir di `.claude/settings.json` (`push --force`, baca `.env`); `rm -rf` boleh tapi selalu tanya dulu.

## Perintah

Tidak ada build, lint, atau test otomatis. Uji manual di browser.

- Jalankan lokal: sajikan folder root dengan server statis (mis. `npx http-server .`), buka `index.html`. Firebase SDK diimpor dinamis dari CDN gstatic, jadi butuh internet.
- Uji multi-pemain di satu browser: tambahkan `?u=<id>` di URL tiap tab supaya id pemain berbeda; `?r=<kode>` mengisi kode ruang.
- Setiap upload / perubahan game: `node apk/versi.js` (menaikkan `v` di `version.json` dan menyusun ulang daftar berkas dari `index.html`, `js/*`, `img/*`). Tanpa ini APK tidak ikut terbarui.
- APK (dari `apk/`): `npm run salin` (salin berkas game ke `apk/www` sesuai `version.json`), `npm run siap` (salin + generate ikon + `cap sync android`), `npm run buat` (sekali, membuat proyek `android/`). Panduan lengkap: `apk/PANDUAN-APK.md`.

## Git

- Repo sudah aktif, branch `main`, remote `origin` = https://github.com/wathoni004-netizen/Remi (GitHub Pages tayang dari sini, jadi push = langsung tayang).
- Push selalu minta izin Boss dulu. Perubahan game: jalankan `node apk/versi.js` sebelum commit supaya APK ikut terbarui.
- Login GitHub tersimpan lewat Git Credential Manager (`credential.credentialStore=dpapi`, karena penyimpanan bawaan Windows error "string binding is invalid"). Login ulang hanya bisa dilakukan Boss lewat browser; jangan masukkan token/kata sandi sendiri.
- Kalau `git` tidak dikenali di sesi/terminal lama (dibuka sebelum git terpasang), pakai `C:\Program Files\Git\cmd\git.exe` atau buka sesi baru.
- Pesan commit berbahasa Indonesia, singkat.

## Aturan kerja (dari README)

- Urutan tag `<script>` di `index.html` penting; jangan diubah. Semua skrip berbagi global scope (bukan modul).
- Setelah mengubah sebuah berkas JS, naikkan angka `?v=` pada tag skripnya di `index.html` (cache-busting).
- Setelah aturan permainan berubah, uji dengan kode ruang baru (state ruang lama di Firebase bisa tidak cocok).
- APK baru hanya perlu untuk ikon/nama atau plugin native baru; saat itu naikkan `VC` (versionCode) di `apk/salin.js`. Package ID `com.kartuRemi` jangan diganti.

## Arsitektur

**Urutan muat & tanggung jawab** (`index.html` memuat CSS + semua HTML layar; skrip di `js/`):
1. `rules.js` — logika kartu murni: helper `$`, kode kartu, validasi kombinasi (`run` = urutan satu jenis, `rell` = angka sama, `isSeri`), poin (`pts`, `meldPts`), solver tangan (`all`/`full`, `part`/`finalLay`, `arrange`, `ready`), `mk()` kocok dek.
2. `apk.js` — pembaruan otomatis, hanya aktif di Capacitor (lihat bawah). Mengekspos `window.apkReady`.
3. `net.js` — init Firebase, wrapper `db`, akun (anonim ↔ Google, hapus akun), masuk/buat ruang, host, heartbeat, chat, hadiah (`award`), tombol Kembali Android.
4. `game.js` — mesin giliran: `start()` (host), `go(aksi, arg)` untuk `draw`/`take`/`set`/`lay`/`drop`, `fin()` hitung skor ronde.
5. `kartuskin.js`, `mejaskin.js`, `skinart.js`, `setfx.js` — registri skin (`KSK`, `MJK`, `SKA`) dan efek animasi saat men-set (`skinFx`).
6. `ui.js` — `render()` meja, tangan, tumpukan, papan skor.
7. `spin.js`, `toko.js`, `inv.js`, `profil.js` — Spin, Toko, Inventori (pasang skin), Profil/level; semua membaca/menulis `users/{uid}`.

**Kode kartu**: string `<jenis><angka>`, jenis `S/H/D/C`, angka 2-14 (11-13 = J/Q/K, 14 = As); joker `X1`/`X2`. Kombinasi di state disimpan sebagai string kartu dipisah koma.

**Model sinkronisasi (tanpa server/Cloud Functions)**: seluruh state ronde ada di satu node `rooms/{room}/state`. Klien yang sedang giliran (`st.turn===uid`) meng-clone `st`, mengubahnya di `go()`, lalu `save()` menimpa node itu utuh; semua klien mendengarkan via `onSnapshot` → `render()`. Validasi aturan sepenuhnya di klien.
- `db` di `net.js` adalah wrapper bergaya Firestore di atas RTDB: `db.doc("rooms/X")` dipetakan ke `rooms/X/state` (fungsi `map`), `norm()` mengisi field kosong (RTDB membuang array/objek kosong). `window.__FBMOCK` bisa menggantikan modul Firebase.
- Node lain: `rooms/{room}/players/{uid}` (nama, heartbeat `t` tiap 30 dtk, `j` waktu masuk, `ok` siap, skin `ck`/`mk`), `rooms/{room}/chat/{uid}` (30 pesan terakhir per pemain), `users/{uid}` (koin, kartu spin `biru`/`merah`, `skins`, `equip`, statistik `st`, batas harian `hr`; hanya akun Google).
- Field penting `state`: `status` (`lobby`/`play`/`done`), `order`, `hands`, `deck`, `pile`, `laid`, `turn`, `phase` (`draw`/`act`), `lb` (pembuang terakhir), `eat` (kartu yang dimakan dan wajib diturunkan), `dir` (arah putaran, berbalik setelah ronde berakhir dengan set), `hist` (skor per ronde), `host`, `gen`, `kk` (daftar kick).
- Pemain "live" = heartbeat < 3 menit dan tidak di-kick. Host = `st.host` selama live, kalau tidak pemain live paling awal masuk. Ruang yang idle 30 menit di-reset ke lobby saat ada yang masuk (`idleCheck`).
- Rules keamanan Firebase tidak ada di repo (diatur di console project `remi-online-69bb6`). Menambah field baru di `users/{uid}` bisa butuh perubahan rules — jelaskan ke Boss apa dan kenapa.

**Pembaruan otomatis APK** (`apk.js`): saat dibuka, bandingkan `version.json` bawaan dengan milik GitHub Pages; kalau `v` lebih besar, unduh semua berkas di `files` ke folder `DATA/up<v>`, lalu `WebView.setServerBasePath` ke folder itu dan hapus folder `up*` lama. Karena itu setiap berkas baru yang dipakai game harus ada di `js/` atau `img/` (atau ditambahkan ke `versi.js`) agar ikut terdaftar.

**Event skin**: ada skill `kartu-remi-event` untuk membuat/mengubah event skin terbatas (token bintang, spin meteor, Toko Event, kristal).
