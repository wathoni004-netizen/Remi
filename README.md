# Kartu Remi (Game Kampung)

Game kartu remi online 2-4 pemain. Web statis (GitHub Pages) + Firebase Realtime Database, login anonim atau Google.

## Struktur
- `index.html` — halaman dan CSS; memuat semua skrip di `js/`.
- `js/` — rules.js (aturan kartu), net.js (Firebase, chat, akun), game.js (giliran), ui.js (tampilan meja), skinart.js, setfx.js, kartuskin.js, mejaskin.js (skin), spin.js, toko.js, inv.js (Spin, Toko, Inventori).
- `img/` — label tingkat skin.

## Aturan kerja
- Urutan tag `<script>` di `index.html` penting; jangan diubah.
- Setelah mengubah satu berkas JS, naikkan angka `?v=` pada tag skripnya di `index.html`.
- Setelah aturan berubah, pakai kode ruang baru.
