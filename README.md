# Kartu Remi (Game Kampung)

Game kartu remi online 2-4 pemain. Web statis (GitHub Pages) + Firebase Realtime Database, login anonim atau Google.

## Struktur
- `index.html` — halaman dan CSS; memuat semua skrip di `js/`.
- `js/` — rules.js (aturan kartu), net.js (Firebase, chat, akun), game.js (giliran), ui.js (tampilan meja), skinart.js, setfx.js, kartuskin.js, mejaskin.js (skin), spin.js, toko.js, inv.js (Spin, Toko, Inventori), apk.js (pembaruan otomatis, hanya di APK).
- `img/` — label tingkat skin.
- `version.json` — versi + daftar berkas game untuk pembaruan otomatis APK.
- `apk/` — proyek APK (Capacitor). Panduan build: `apk/PANDUAN-APK.md`.

## Aturan kerja
- Urutan tag `<script>` di `index.html` penting; jangan diubah.
- Setelah mengubah satu berkas JS, naikkan angka `?v=` pada tag skripnya di `index.html`.
- Setelah aturan berubah, pakai kode ruang baru.
- Setiap upload: jalankan `node apk/versi.js` (naikkan version.json) agar APK ikut terbarui. Berkas baru di `js/` atau `img/` otomatis masuk daftar.
