# BAB 7 EVALUASI DAN DOKUMENTASI

## 7.1 Evaluasi Hasil Proyek terhadap Tujuan Awal
Evaluasi ini bertujuan untuk menilai sejauh mana hasil pengembangan platform **FreeBuild CV (freebuildcv.tech)** memenuhi tujuan umum dan spesifik proyek yang telah dirancang sebelumnya.

### 7.1.1 Pencapaian terhadap Tujuan Umum
Tujuan umum proyek adalah merancang dan membangun platform pembuat CV berbasis web yang interaktif, responsif, dan mudah digunakan oleh masyarakat luas. Evaluasi terhadap tujuan ini menunjukkan hasil sebagai berikut:
* **Interaktivitas:** Fitur *Live Preview* berhasil diimplementasikan dengan sangat interaktif. Setiap ketikan pengguna pada formulir dinamis langsung terproyeksikan ke tampilan CV secara instan.
* **Responsivitas:** Halaman situs web telah diuji pada perangkat dengan berbagai ukuran resolusi (ponsel cerdas, tablet, dan desktop) dan terbukti responsif dengan tata letak formulir yang otomatis bergeser secara vertikal pada layar kecil.
* **Kemudahan Penggunaan:** Desain UI dua kolom (*split-screen*) terbukti meminimalkan disorientasi visual, memungkinkan pengguna fokus mengisi data di kolom kiri sambil memantau hasilnya di kolom kanan.

### 7.1.2 Pencapaian terhadap Tujuan Spesifik
Evaluasi terhadap tujuan spesifik yang telah dirancang dijabarkan dalam matriks berikut:

| Tujuan Spesifik Awal | Status Pencapaian dalam Sistem | Indikator Keberhasilan |
|---|---|---|
| Mengimplementasikan manajemen hak akses pengguna (*multi-role*) | **Tercapai** | Sistem berhasil memisahkan hak akses antara *Guest* (akses dasar), *User* terdaftar (draf tersimpan), dan *Admin* (pemantauan dasbor). |
| Menerapkan sistem kuota kredit unduh PDF otomatis | **Tercapai** | Kebijakan limitasi kuota (default: 3 untuk *Guest* dan 6 untuk *User*) berhasil berjalan di tingkat basis data dan secara otomatis berkurang ketika pengguna mengunduh berkas. |
| Menyediakan variasi templat CV standar dunia kerja (ATS-Friendly) | **Tercapai** | Menyediakan pilihan templat profesional dengan struktur teks terstandardisasi yang dapat dibaca secara akurat oleh mesin parser ATS. |

### 7.1.3 Kelebihan dan Kekurangan Sistem
* **Kelebihan:**
  1. **Keamanan RLS (Row Level Security):** Kebijakan tingkat database memastikan data pribadi draf CV pengguna tidak dapat diakses atau diubah oleh akun lain.
  2. **Akurasi Konversi:** Berkas PDF hasil unduhan tetap mempertahankan struktur teks mentah (*selectable text*), bukan gambar raster, sehingga ramah terhadap sistem filter ATS.
  3. **Fitur SPK Analitis:** Admin dilengkapi dengan modul analitis SPK menggunakan metode SAW, TOPSIS, dan AHP untuk mengevaluasi data aktivitas pengguna secara objektif.
* **Kekurangan:**
  1. **Ketergantungan Sisi Klien (*Client-Side Rendering*):** Proses kompilasi HTML-ke-PDF dijalankan langsung oleh browser lokal menggunakan `html2pdf.js`, sehingga kecepatan pengunduhan dan konsistensi tata letak sangat bergantung pada memori dan mesin browser pengguna.

---

## 7.2 Dokumentasi Teknis dan Pengguna

### 7.2.1 Dokumentasi Teknis (Untuk Pengembang/Administrator)
Dokumentasi teknis ini merinci arsitektur dan konfigurasi sistem agar sistem dapat dipelihara dan dikembangkan lebih lanjut di masa depan.

1. **Arsitektur Sistem:**
   Aplikasi ini menggunakan arsitektur modern *Serverless Frontend-Heavy SPA*:
   * **Frontend:** React 19.2.0, TypeScript 5.9.3, Vite 7.2.4, Tailwind CSS 4.1.18, React Router DOM 7.11.0.
   * **Backend (BaaS):** Supabase SDK sebagai penghubung ke PostgreSQL, Supabase Auth untuk token JWT sesi, dan Supabase Storage bucket `profile-photos` untuk penyimpanan berkas gambar.

2. **Struktur File Konfigurasi `.env`:**
   Frontend memerlukan konfigurasi variabel lingkungan untuk terhubung ke kluster Supabase:
   ```env
   VITE_SUPABASE_URL=https://[id-proyek-supabase].supabase.co
   VITE_SUPABASE_ANON_KEY=[kunci-anon-public-supabase]
   ```

3. **Skema Relasi Basis Data:**
   Sistem menggunakan pangkalan data relasional PostgreSQL dengan skema tabel utama: `user_resumes` (id UUID, nama resume), `resume_personal_info` (1:1 ke resume), `resume_education` (1:N ke resume), `resume_experiences` (1:N ke resume), `resume_skills` (1:1 ke resume), dan `download_history` (riwayat unduh).

4. **Algoritma SPK DSS (Decision Support System):**
   Sistem mengagregasikan metrik pengguna di admin panel berdasarkan 5 kriteria utama (C1: Unduhan, C2: Jumlah CV, C3: Kelengkapan Profil, C4: Hari sejak aktif terakhir, C5: Variasi template). Normalisasi data dilakukan menggunakan matriks matematika SAW, disusul penentuan alternatif terbaik menggunakan solusi ideal positif/negatif metode TOPSIS, dengan pembobotan kriteria dikalibrasi via AHP.

---

### 7.2.2 Dokumentasi Pengguna (Panduan Operasional)
Berikut adalah panduan langkah demi langkah penggunaan sistem untuk pengguna akhir (*end-user*) dan administrator.

#### A. Langkah Pendaftaran & Login Akun:
1. Buka halaman utama browser dan akses domain [freebuildcv.tech](http://freebuildcv.tech).
2. Klik tombol **"Daftar Akun"**, masukkan nama lengkap, alamat email, serta kata sandi, lalu klik submit. Konfirmasi pendaftaran melalui tautan yang dikirim secara otomatis ke email Anda.
3. Alternatif masuk instan: klik tombol **"Login dengan Google"** untuk mengautentikasi akun secara cepat melalui Single Sign-On (SSO).

> [!TIP]
> **TEMPATKAN SCREENSHOT 1 DI SINI (Halaman Login & Registrasi)**
> * **Petunjuk Gambar:** Ambil *screenshot* area form login/registrasi, pastikan tombol "Login with Google" terlihat jelas. Lakukan *crop* rapi tanpa menyertakan tab browser atau taskbar Windows.
> * **Caption di Word:**
>   `Gambar 7.1 Antarmuka Halaman Login dan Registrasi Akun dengan Fitur SSO Google`

#### B. Langkah Pembuatan CV:
1. Setelah login, Anda akan diarahkan ke halaman **"Workspace / CV Builder"**.
2. Pilih templat CV yang sesuai (misalnya: *ATS Standard Template*).
3. Mulailah mengisi kolom formulir di sebelah kiri (Data Pribadi, Ringkasan Profil, Pendidikan, Pengalaman, dan Keahlian). Perubahan teks akan otomatis diperbarui secara *real-time* pada kolom pratinjau di sebelah kanan.

> [!TIP]
> **TEMPATKAN SCREENSHOT 2 DI SINI (Workspace & Live Preview)**
> * **Petunjuk Gambar:** Ambil *screenshot* layar penuh aplikasi saat sedang dalam mode pengisian. Tunjukkan tampilan *split-screen* di mana form kiri telah terisi teks dan pratinjau kanan menampilkan render teks tersebut.
> * **Caption di Word:**
>   `Gambar 7.2 Antarmuka Workspace Pembuatan CV dengan Fitur Live Preview Real-Time`

4. Untuk mengunggah foto profil, klik tombol **"Unggah Foto"** pada bagian informasi pribadi. Pilih berkas gambar dari perangkat Anda.
5. Anda juga dapat memodifikasi tema warna dasar templat melalui panel kustomisasi warna.

> [!TIP]
> **TEMPATKAN SCREENSHOT 3 DI SINI (Upload Foto & Tema Warna)**
> * **Petunjuk Gambar:** Ambil *screenshot* saat mengunggah foto profil pelamar atau saat menu pemilihan tema warna sedang aktif di antarmuka.
> * **Caption di Word:**
>   `Gambar 7.3 Fitur Unggah Foto Profil dan Pemilihan Tema Warna Template`

6. Setelah data terisi lengkap, klik tombol **"Unduh PDF"** yang terletak di bagian atas panel pratinjau.
7. Sistem akan memproses berkas dan browser akan mengunduh file `.pdf` secara otomatis.

> [!TIP]
> **TEMPATKAN SCREENSHOT 4 DI SINI (Contoh Dokumen Hasil PDF)**
> * **Petunjuk Gambar:** Buka file PDF hasil download Anda menggunakan PDF reader (seperti Chrome PDF viewer atau Adobe Reader), lalu ambil *screenshot* tampilan penuh satu halaman CV tersebut.
> * **Caption di Word:**
>   `Gambar 7.4 Hasil Unduhan Berkas CV dalam Format PDF Standar A4 ATS-Friendly`

#### C. Panduan Admin (Dasbor Monitoring & SPK):
1. Gunakan akun dengan role administrator untuk masuk ke URL `/admin`.
2. Dasbor admin akan menampilkan metrik statistik global (jumlah pengguna terdaftar dan grafik riwayat pengunduhan harian).
3. Masuk ke menu **SPK DSS** untuk melihat analisis keputusan perankingan alternatif pengguna berdasarkan metode SAW, TOPSIS, dan AHP. Admin dapat mengubah bobot kriteria secara dinamis.

> [!TIP]
> **TEMPATKAN SCREENSHOT 5 DI SINI (Dasbor Admin & SPK)**
> * **Petunjuk Gambar:** Ambil *screenshot* halaman admin panel, tampilkan grafik analitik penggunaan dan tabel ranking hasil SPK DSS (metode SAW, TOPSIS, AHP) beserta visualisasi chart-nya.
> * **Caption di Word:**
>   `Gambar 7.5 Halaman Dasbor Administrator dan Modul Analisis SPK DSS`

#### D. Troubleshooting Sederhana (Pemecahan Masalah):
* **Kuota Unduhan Habis:** Jika muncul peringatan kuota unduh habis (sisa kredit = 0), daftarkan akun baru (jika saat ini login sebagai Guest) untuk mendapatkan kuota tambahan 6 unduhan secara gratis.
* **PDF Terpotong/Layout Geser:** Gunakan browser berbasis Chromium versi terbaru (seperti Google Chrome atau Microsoft Edge) pada perangkat desktop agar pustaka render PDF dapat menghitung ukuran halaman A4 secara presisi.

---

## 7.3 Rencana Pengembangan Lanjutan

### 7.3.1 Rencana Fitur Baru
* **Integrasi AI ATS Scanner:** Mengembangkan fitur bertenaga AI (*Artificial Intelligence*) yang dapat membaca teks CV hasil generate pengguna, mencocokkannya dengan deskripsi pekerjaan (*job description*) yang diunggah, lalu memberikan penilaian kecocokan (*ATS Match Score*) serta rekomendasi kata kunci.
* **Impor Otomatis LinkedIn:** Menambahkan fitur impor profil LinkedIn untuk mengisi data formulir CV secara otomatis hanya dengan mengunggah PDF profil LinkedIn atau memasukkan tautan akun.

### 7.3.2 Peningkatan Performa
* **Server-Side PDF Rendering:** Mengalihkan proses kompilasi berkas PDF dari browser pengguna (sisi klien) ke server (sisi backend) menggunakan Node.js microservice yang dilengkapi dengan pustaka Puppeteer. Hal ini akan meminimalisir kegagalan render di browser ponsel lawas dan menjamin visualisasi layout PDF 100% konsisten di semua perangkat.

### 7.3.3 Integrasi Sistem Lain
* **Job Board Connector:** Mengintegrasikan platform secara langsung dengan API lowongan pekerjaan (seperti LinkedIn atau JobStreet), sehingga setelah mengunduh CV, pengguna dapat langsung melamar lowongan kerja yang relevan dari dasbor FreeBuild CV.

### 7.3.4 Pengembangan Platform Baru
* **Mobile Application (Android & iOS):** Mengembangkan aplikasi mobile menggunakan React Native. Aplikasi mobile ini akan berbagi pangkalan data Supabase yang sama, sehingga draf CV yang dibuat di web dapat diedit kembali dengan nyaman lewat smartphone pengguna secara *native*.
