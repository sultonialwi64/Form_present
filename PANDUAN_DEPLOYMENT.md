# 🚀 Panduan Lengkap Deployment: Live Aspirasi Feedback System

Sistem Anda sudah selesai dibuat secara lokal di komputer Anda. Kode yang dibuat sudah sangat efisien dan siap menahan beban 400+ peserta tanpa masalah (menggunakan algoritma *Cursor Pagination* & `LockService` di Google Script).

Berikut adalah langkah-langkah detail *step-by-step* untuk mengonlinekan sistem ini secara 100% gratis.

---

## 1️⃣ Tahap 1: Setup Database & Backend (Google Sheets & Apps Script)

Ini adalah otak dan *database* dari sistem Anda. Semua data yang dikirim audiens akan masuk ke sini.

1. Buka [Google Sheets](https://sheets.google.com) menggunakan akun Google Anda dan buat *Spreadsheet* kosong baru (Blank). 
2. Beri nama file Spreadsheet Anda di kiri atas (misalnya: **"Database Aspirasi 2026"**).
3. **PENTING:** Ubah nama *Sheet* / *Tab* yang ada di bagian bawah (biasanya bernama "Sheet1") menjadi **Aspirasi** (huruf A besar).
4. Buat Judul Kolom (Header) di baris pertama (Baris 1) secara berurutan:
   - Sel **A1** ketik: `timestamp`
   - Sel **B1** ketik: `nama`
   - Sel **C1** ketik: `unit_kerja`
   - Sel **D1** ketik: `saran`
   *(Catatan: Anda bisa melebarkan kolom dan menebalkan teksnya (Bold) agar rapi).*
5. Pada menu bagian atas Google Sheets, klik **Extensions (Ekstensi)** > lalu pilih **Apps Script**. Tab baru akan terbuka.
6. Di halaman editor *Code.gs* yang terbuka, hapus semua kode bawaan `function myFunction() {}`.
7. Copy seluruh kode dari file `apps-script/Code.gs` yang ada di VS Code Anda, lalu *paste* ke editor Google Apps Script tersebut.
8. Klik ikon **Save (Simpan)** (gambar disket) atau tekan `Ctrl + S`.
9. Klik tombol biru **Deploy** di kanan atas > **New deployment (Deployment baru)**.
10. Pada menu *Select type* (ikon roda gigi di kiri kata "Select type"), klik dan centang **Web app**.
11. Isi form pengaturan *Web app* berikut:
    - **Description**: API Aspirasi V1
    - **Execute as**: Me (Pilih email Anda)
    - **Who has access**: Anyone (Siapa saja)
12. Klik tombol biru **Deploy**. 
13. Jika Google meminta *Authorize access* (Otorisasi Akses):
    - Klik **Review permissions**
    - Pilih akun Google Anda
    - Akan muncul peringatan "Google hasn't verified this app". Klik tulisan **Advanced (Lanjutan)** di bagian bawah
    - Scroll ke bawah dan klik **Go to Untitled project (unsafe)**
    - Klik **Allow (Izinkan)**
14. Selesai! Anda akan melihat tulisan **Web app URL** yang panjang (berawalan `https://script.google.com/macros/s/...`). 
15. **Copy URL tersebut** dan simpan (kita akan membutuhkannya di Tahap 2).

---

## 2️⃣ Tahap 2: Hubungkan URL Backend ke Kode Frontend

Sekarang kita masukkan URL tadi ke dalam kode website Anda agar bisa berkomunikasi.

1. Buka kembali **Visual Studio Code** Anda (`c:\Disk1\Project Web\Form Presentasi`).
2. Buka file `js/config.js`.
3. Ganti teks `"GANTI_DENGAN_URL_WEB_APP_GOOGLE_SCRIPT_ANDA_DISINI"` dengan **Web app URL** yang baru saja Anda copy dari tahap 1.
4. Simpan file (`Ctrl + S`).

---

## 3️⃣ Tahap 3: Upload Kode ke GitHub

Kita perlu mengunggah semua kode yang sudah ada URL rahasianya ini ke GitHub.

1. Buka terminal di VS Code (tekan `Ctrl` + <code>`</code>).
2. Jalankan perintah berikut secara berurutan:
   ```bash
   git add .
   git commit -m "Upload kode final dan API URL"
   ```
3. Buka website **[GitHub.com](https://github.com/)** dan login. Buat **New Repository** (tombol hijau "New"). 
4. Beri nama repositorinya (contoh: `fkp-pekppp-2026`). Biarkan opsinya *Public*. Klik **Create repository**.
5. Di halaman yang muncul, temukan bagian *"...or push an existing repository from the command line"*.
6. Copy *tiga baris perintah* yang ada di kotak tersebut (biasanya `git remote add...`, `git branch...`, dan `git push...`).
7. *Paste* ke terminal VS Code Anda dan tekan Enter. Tunggu sampai proses *upload* 100% selesai.

---

## 4️⃣ Tahap 4: Hosting Website di Cloudflare Pages

Langkah terakhir: mengonlinekan kode dari GitHub menjadi website publik (URL asli) dengan Cloudflare!

1. Login ke akun **[Cloudflare](https://dash.cloudflare.com/)** Anda.
2. Di menu sebelah kiri, cari dan klik **Workers & Pages**.
3. Klik tombol biru **Create application**.
4. Pilih tab menu **Pages** di sebelah kanan atas.
5. Klik tombol biru **Connect to Git**.
6. Pilih repositori GitHub Anda (`fkp-pekppp-2026`), lalu klik **Begin setup**.
7. Di bagian *Build settings*, Anda tidak perlu mengubah apa pun (karena ini HTML/JS statis, *Framework preset* biarkan "None").
8. Klik tombol **Save and Deploy**.
9. Tunggu sekitar 1 menit hingga Cloudflare selesai memproses.
10. Cloudflare akan memberikan Anda sebuah URL publik gratis (contoh: `https://fkp-pekppp-2026.pages.dev`).

---

## 🎯 Selesai! Cara Menggunakannya saat Acara:

*   **Untuk Audiens (Peserta):** Bagikan URL dari Cloudflare tadi (misal: `fkp-pekppp-2026.pages.dev`) dalam bentuk QR Code kepada audiens (Anda bisa memakai web seperti *qrcode-monkey.com*). Saat mereka *scan* dan isi form, hasilnya akan masuk ke Google Sheets.
*   **Untuk Presenter (Layar Proyektor):** Buka URL **`fkp-pekppp-2026.pages.dev/dashboard.html`** (tambahkan `/dashboard.html` di belakangnya) pada laptop yang terhubung ke proyektor. Halaman ini akan secara otomatis menampilkan masukan baru yang dikirim audiens tanpa perlu di-*refresh*.

*(Sistem Dashboard ini otomatis terhubung secara real-time dan beranimasi super mewah!)*
