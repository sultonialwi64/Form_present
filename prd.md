# Product Requirements Document: Live Aspirasi Feedback System
**Project:** FKP PEKPPP 2026 - Dikpora Wonosobo  
**Status:** In Development  
**Author:** Ahmad Sultoni Alwi  

## 1. Executive Summary
Sistem interaktif berbasis web untuk menangkap aspirasi, saran, dan masukan audiens secara *real-time* selama acara presentasi. Solusi ini dibangun sebagai alternatif yang lebih fleksibel, tanpa batas karakter, dan mampu menangani kapasitas audiens yang lebih besar dibanding platform *interactive presentation* standar (seperti Slido/Mentimeter).

## 2. Problem Statement
*   **Keterbatasan Karakter:** Tools eksisting memiliki batas karakter yang memotong masukan audiens.
*   **Keterbatasan Kapasitas:** Platform pihak ketiga membatasi jumlah audiens (max 100 untuk akun gratis) sedangkan acara dihadiri 400+ orang.
*   **Visualisasi Data:** Hasil data dari form biasa sulit dibaca langsung di layar proyektor.

## 3. Goals
*   Menyediakan platform pengumpulan data opini audiens yang *unlimited* (tanpa batas karakter).
*   Menangani beban 400+ audiens secara bersamaan dengan sistem antrean data.
*   Menyediakan visualisasi *dashboard* yang menarik secara estetik untuk layar besar/proyektor.
*   Menggunakan *zero-cost infrastructure* (Gratis).

## 4. User Personas
*   **Audience (Public/Staff):** Pengguna perangkat mobile yang ingin mengirimkan pendapat/saran secara anonim atau teridentifikasi.
*   **Presenter/MC:** Pengguna layar besar/laptop yang memantau alur masuknya aspirasi untuk bahan diskusi *live*.

## 5. Functional Requirements
### A. Audience Portal
*   Form input Nama Lengkap (Required).
*   Form input Unit Kerja (Required).
*   Form input Masukan/Pendapat (Required, Multi-line).
*   *Success state* setelah pengiriman data.

### B. Presenter Dashboard
*   Tampilan *Live Reader* dengan format *grid/card*.
*   *Auto-refresh* data setiap 5 detik.
*   Indikator status sistem (Online/Live).
*   *Loading state* yang minimalis.

### C. Backend & Database
*   API Endpoint untuk menerima POST data.
*   Sistem antrean data (`LockService`) untuk mencegah *race condition* saat trafik tinggi.
*   Google Sheets sebagai *single source of truth*.

## 6. Technical Stack
*   **Frontend:** HTML5, Tailwind CSS (CDN), JavaScript (Fetch API).
*   **Hosting:** Cloudflare Pages (Deploy via GitHub integration).
*   **Backend:** Google Apps Script (GAS) Web App.
*   **Database:** Google Sheets.

## 7. Data Schema (Spreadsheet)
| Column Name | Type | Description |
| :--- | :--- | :--- |
| timestamp | DateTime | Waktu submit |
| nama | String | Nama pengirim |
| unit_kerja | String | Unit kerja pengirim |
| saran | String | Isi masukan audiens |

## 8. Non-Functional Requirements
*   **Scalability:** Mendukung minimal 400 *concurrent users*.
*   **Latency:** Data *refresh* maksimal 5 detik.
*   **Responsive:** UI harus optimal di layar mobile (audience) dan layar proyektor (presenter).
*   **Security:** Menggunakan *CORS-safe* implementation pada backend.

## 9. Deployment Roadmap
1.  **Backend:** Deploy Google Apps Script (Anyone access).
2.  **Configuration:** Update `WEB_APP_URL` di source code frontend.
3.  **Frontend:** Push to GitHub & Configure Cloudflare Pages.
4.  **Testing:** *Stress test* form input (Submit 5-10 data sekaligus).
5.  **Go-Live:** Presentasi acara.