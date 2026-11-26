# Panduan build APK Kartu Remi (PC Windows)

APK berisi berkas game. Saat game dibuka, APK mengecek versi di GitHub Pages; kalau ada yang baru, muncul layar **"Memperbarui game…"** dengan bar, lalu game langsung terbuka dengan versi baru. Kalau internet putus, game jalan dengan versi lama dan dicoba lagi saat dibuka berikutnya. Jadi untuk update game, Boss tidak perlu kirim APK baru.

Package ID: `com.kartuRemi` (jangan diganti). Nama: Kartu Remi.

---

## A. Pasang alat (sekali saja)

1. **Node.js LTS**: https://nodejs.org, unduh versi LTS, pasang dengan pilihan bawaan.
2. **Android Studio**: https://developer.android.com/studio, pasang, buka sekali, ikuti wizard sampai selesai (pilih Standard). Wizard ini mengunduh Android SDK dan Java. Butuh ±10 GB dan internet stabil.
3. Cek: buka **Command Prompt**, ketik `node -v`. Kalau muncul angka versi, berarti sudah siap.

## B. Ambil kode

1. Buka https://github.com/wathoni004-netizen/Remi, lalu **Code** > **Download ZIP**.
2. Ekstrak ke `C:\KartuRemi`. Hasilnya `C:\KartuRemi\Remi-main\` (di dalamnya ada `index.html`, `js\`, `apk\`).
3. Folder ini **disimpan terus**, jangan dihapus. Folder `apk\android\` yang dibuat nanti dipakai lagi untuk APK berikutnya.

## C. Buat keystore (kunci tanda tangan APK)

Buka Command Prompt, lalu jalankan:

```
mkdir C:\KunciKartuRemi
cd C:\KunciKartuRemi
"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -genkeypair -v -keystore kartu-remi.jks -alias kartuRemi -keyalg RSA -keysize 2048 -validity 10000
```

- Isi kata sandi (catat!), lalu nama dan kota boleh diisi asal. Ketik `yes` di akhir.
- **WAJIB:** cadangkan `kartu-remi.jks` dan kata sandinya di 2 tempat (misal flashdisk dan Google Drive pribadi). Jangan dikirim ke siapa pun, termasuk ke Claude. Kalau hilang, APK tidak bisa diperbarui.

Ambil SHA-1 (untuk login Google):

```
"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -list -v -keystore kartu-remi.jks -alias kartuRemi
```

Salin baris `SHA1: AA:BB:...`.

## D. Daftarkan APK di Firebase (untuk login Google)

1. Buka https://console.firebase.google.com, pilih project game.
2. Ikon roda > **Project settings** > **Your apps** > **Add app** > ikon Android.
3. Package name: `com.kartuRemi`, nickname: Kartu Remi. Tempel **SHA-1** dari langkah C. Klik Register.
4. Unduh **google-services.json**. Langkah lain di wizard Firebase (Gradle/SDK) **lewati saja**; sudah diurus.
5. Pastikan **Authentication > Sign-in method > Google** masih aktif (sudah aktif untuk versi web).

## E. Buat proyek Android (sekali saja)

Di Command Prompt:

```
cd C:\KartuRemi\Remi-main\apk
npm install
npm run buat
```

Lalu salin **google-services.json** ke `C:\KartuRemi\Remi-main\apk\android\app\`.

## F. Build APK

1. `npx cap open android`. Android Studio akan terbuka; tunggu sampai bar bawah selesai (Gradle sync, pertama kali bisa 5-15 menit).
2. Menu **Build** > **Generate Signed App Bundle or APK** > pilih **APK** > Next.
3. Key store path: `C:\KunciKartuRemi\kartu-remi.jks`, isi kata sandi, alias `kartuRemi`, kata sandi kunci. Next.
4. Pilih **release** > Create.
5. Hasil: `C:\KartuRemi\Remi-main\apk\android\app\release\app-release.apk`.

## G. Uji sebelum dibagikan (2 HP)

1. Kirim APK ke HP (Drive terbatas atau chat pribadi), lalu izinkan **instal dari sumber tidak dikenal**.
2. Cek berurutan:
   - Game terbuka dan ikon benar.
   - Main sebagai tamu di 2 HP dalam 1 ruang.
   - **Masuk dengan Google**: pilih akun, nama dan saldo muncul.
   - Hapus akun: pakai akun cadangan saja.
   - Tes update: Claude push perubahan kecil, tutup penuh game lalu buka lagi; layar "Memperbarui game…" muncul lalu perubahan terlihat.
3. Kalau ada error, kirim tangkapan layarnya ke Claude.

## H. Nanti: kapan perlu APK baru?

**Tidak perlu** (update otomatis): semua perubahan game (aturan, tampilan, skin, event, gambar).

**Perlu APK baru**: ganti ikon/nama, plugin native baru (misal tombol Kembali = `@capacitor/app`, notifikasi, pembelian), atau kalau update otomatis bermasalah. Caranya:
1. Download ZIP terbaru, lalu timpa semua isi `Remi-main` **kecuali** folder `apk\android` (folder itu tidak ada di ZIP, jadi aman).
2. `cd C:\KartuRemi\Remi-main\apk`, lalu `npm install` (mengambil plugin baru kalau ada), lalu `npm run siap`. Nomor `versionCode` dinaikkan otomatis lewat angka `VC` di `apk\salin.js` (sekarang 4; Claude menaikkannya tiap APK baru).
3. Ulangi langkah F dengan keystore yang **sama**.

## Kalau update rusak (game layar putih)

Pengaturan HP > Aplikasi > Kartu Remi > Penyimpanan > **Hapus data**. Game kembali ke versi bawaan APK. Akun Google aman (login ulang); data tamu di HP itu hilang.
