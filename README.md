# Panduan Pemasangan dan Penggunaan Moodle Auto Quiz Solver

> [!CAUTION]
> **PERINGATAN PENTING: GUNAKAN DENGAN BIJAK!**
> Ekstensi ini dikembangkan secara independen semata-mata untuk tujuan pembelajaran, edukasi, riset asistensi otomatisasi peramban web, dan eksplorasi teknologi AI. Segala risiko, dampak etis, maupun konsekuensi akademik yang timbul akibat penggunaan alat ini berada di luar tanggung jawab pengembang dan menjadi tanggung jawab pengguna seutuhnya. Gunakan secara bijak, bertanggung jawab, dan patuhi seluruh peraturan institusi Anda.

> [!WARNING]
> **LANGKAH AWAL SEBELUM MENGGUNAKAN (WAJIB DILAKUKAN SEKALI):**
> 1. Buka situs resmi Google Gemini di browser Anda: `https://gemini.google.com/app?hl=id`
> 2. Pastikan Anda sudah **masuk (login) ke akun Google** Anda hingga kolom chat input Gemini dapat digunakan secara normal.
> 3. Jika belum login ke Google Gemini, ekstensi **TIDAK AKAN BISA** memproses soal dan mengambil jawaban di jendela latar belakang.
> *(Setelah Anda login sekali, tab Gemini boleh ditutup. Ekstensi akan otomatis menjalankannya di latar belakang senyap saat kuis berlangsung).*

---

## 1. Cara Mengunduh Berkas Proyek

Pilih salah satu metode berikut untuk mendapatkan berkas proyek ke komputer Anda:

### Metode A: Unduh Berkas ZIP 
1. Buka halaman repositori proyek di GitHub.
2. Klik tombol hijau bertuliskan **Code**.
3. Pilih **Download ZIP**.
4. Setelah unduhan selesai, cari berkas `.zip` tersebut di folder `Downloads`.
5. Klik kanan pada berkas `.zip` lalu pilih **Extract All...** (Ekstrak Semua).
6. Tentukan folder tujuan ekstraksi, lalu klik **Extract**. Pastikan folder hasil ekstraksi berisi berkas `manifest.json`, folder `content`, `background`, dan `popup`.

### Metode B: Menggunakan Git 
Buka Terminal atau Command Prompt, lalu jalankan perintah berikut:
```bash
git clone https://github.com/ItzApipAjalah/moodle-ai.git
```

---

## 2. Cara Memasang Ekstensi di Google Chrome

1. Buka browser **Google Chrome** di komputer Anda.
2. Pada bilah alamat (address bar), ketik tautan berikut lalu tekan **Enter**:
   ```text
   chrome://extensions
   ```
   *(Catatan: Pengguna Opera atau Opera GX dapat mengetik `opera://extensions`)*.
3. Di pojok kanan atas halaman, aktifkan sakelar **Developer mode** (Mode pengembang).
4. Setelah mode pengembang aktif, akan muncul tiga tombol baru di bagian kiri atas. Klik tombol **Load unpacked** (Muat yang belum dibongkar).
5. Pada jendela penjelajah berkas yang terbuka, arahkan ke folder proyek ekstensi yang sudah diekstrak (pilih folder utama yang memuat berkas `manifest.json`).
6. Klik tombol **Select Folder** (Pilih Folder).
7. Ekstensi **Moodle Auto Quiz Solver** kini telah berhasil terpasang dan aktif di browser Anda.

---

## 3. Cara Menjalankan di Halaman Kuis Moodle

1. Buka halaman kuis Moodle atau V-Class kampus Anda (misalnya: praktikum.gunadarma.ac.id atau v-class).
2. Mulai percobaan kuis (*Attempt quiz*).
3. Di pojok kanan bawah layar akan muncul widget antarmuka **Moodle AI Solver**.
4. Klik tombol utama **Jalankan Auto-Pilot (Web Gemini)** atau aktifkan sakelar **Auto-Pilot 1-Klik**.
5. Sistem akan:
   - Membaca dan mengumpulkan soal kuis dari seluruh halaman secara instan (termasuk diagram dan gambar).
   - Mengirimkan soal ke Web Gemini di jendela latar belakang senyap.
   - Mengisi jawaban secara otomatis pada halaman aktif (pilihan ganda, checkbox ganda, dan True/False).
   - Berpindah ke halaman berikutnya hingga seluruh soal kuis terisi lengkap.

---

## 4. Cara Memperbarui Ekstensi (Update)

Jika Anda melakukan perubahan pada kode atau menarik pembaruan terbaru:
1. Buka kembali halaman `chrome://extensions`.
2. Cari kartu ekstensi **Moodle Auto Quiz Solver**.
3. Klik tombol ikon putar melingkar (**Reload / Muat ulang**).
4. Kembali ke tab kuis Moodle Anda, lalu tekan tombol **F5** pada keyboard untuk menyegarkan halaman.
