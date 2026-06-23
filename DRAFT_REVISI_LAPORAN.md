# Draft Revisi Laporan - FreeBuild CV (freebuildcv.tech)

Gunakan draf teks di bawah ini untuk menggantikan bagian-bagian di dalam file Microsoft Word (`laporan psi.docx`) Anda yang masih menyebutkan "PinPin Edukasi", Laravel, PHP, atau nama anggota tim yang salah.

---

## 1. BAB I - Latar Belakang Proyek (Revisi Paragraf Akhir)

**Ganti paragraf tentang "PinPin Edukasi" di Latar Belakang dengan teks berikut:**

> **Teks Revisi:**
> **FreeBuild CV (freebuildcv.tech)** dikembangkan sebagai respons terhadap kondisi tersebut. Sistem ini merupakan platform pembuat Curriculum Vitae (CV) berbasis web yang menggabungkan kemudahan pengisian data dengan standardisasi tata letak yang ramah terhadap sistem penyaring otomatis atau *Applicant Tracking System* (ATS). Platform ini menyediakan fitur pembuatan CV dengan *Live Preview* secara *real-time*, ekspor dokumen langsung ke format PDF, manajemen portofolio digital yang dinamis, modul manajemen kreatif (*Creative Management*), serta sistem pendukung keputusan (SPK DSS) dengan metode SAW, TOPSIS, dan AHP untuk analisis kompetensi. Untuk mengontrol penggunaan dan meningkatkan retensi pengguna, sistem ini juga menerapkan pembatasan kuota unduh dokumen yang terdistribusi secara otomatis untuk tipe akun *Guest* dan *User*. Dengan pendekatan ini, platform berperan sebagai solusi teknologi yang mempermudah pencari kerja mempersiapkan berkas lamaran secara profesional sekaligus menjadi media penerapan ilmu analisis dan perancangan sistem bagi mahasiswa pengembang.

---

## 2. BAB V - Implementasi dan Pengembangan Sistem (Rombak Total)

**Ganti seluruh isi BAB V yang membahas Laravel/Laragon/PHP dengan arsitektur React/Supabase berikut:**

> **Teks Revisi:**
> 
> ### 5.1. Tahapan Pengembangan Aplikasi Berbasis Web
> Pengembangan platform *FreeBuild CV* mengikuti pendekatan bertahap yang terstruktur, di mana setiap fase membangun fondasi untuk fase berikutnya. Secara keseluruhan, proses ini terbagi ke dalam enam tahapan utama yang dilaksanakan secara berurutan:
> 
> #### 5.1.1 Tahap 1 - Persiapan Lingkungan Pengembangan
> Sebelum menulis kode program, tim memastikan seluruh anggota bekerja dalam lingkungan pengembangan yang identik. Node.js (v22) dipasang sebagai runtime JavaScript lokal, dengan npm sebagai manajer paket dependensi. Aplikasi diinisialisasi menggunakan Vite sebagai bundler aset frontend yang cepat dengan template React dan TypeScript. Supabase dipilih sebagai platform Backend-as-a-Service (BaaS) untuk menyediakan layanan database PostgreSQL, autentikasi pengguna, dan penyimpanan berkas secara *out-of-the-box* tanpa perlu mengelola server backend mandiri. Hubungan ke Supabase dikonfigurasi melalui variabel lingkungan pada file `.env` menggunakan kunci API anonim dan URL proyek Supabase.
> 
> #### 5.1.2 Tahap 2 – Perancangan dan Migrasi Basis Data
> Struktur basis data relasional dikelola dan diterapkan langsung pada pangkalan data PostgreSQL milik Supabase melalui SQL Editor. Skema tabel utama yang dibuat meliputi:
> 1. `auth.users`: Tabel bawaan Supabase untuk mengelola kredensial dan metadata akun pengguna.
> 2. `public.user_resumes`: Menyimpan meta-data dokumen CV (seperti nama resume dan template yang dipilih).
> 3. `public.resume_personal_info`: Menyimpan data pribadi (nama lengkap, kontak, ringkasan profil, URL foto) dengan relasi 1:1 terhadap `user_resumes`.
> 4. `public.resume_education` & `public.resume_experiences`: Menyimpan riwayat pendidikan dan pengalaman kerja secara dinamis dengan relasi 1:N terhadap `user_resumes`.
> 5. `public.resume_skills` & `public.resume_awards`: Menyimpan keahlian dan penghargaan pengguna.
> 6. `public.app_settings`: Menyimpan konfigurasi global seperti batas kuota unduh.
> 7. `public.download_history`: Mencatat log riwayat unduhan berkas PDF pengguna.
> 
> Keamanan akses data dijamin melalui penerapan kebijakan Row Level Security (RLS) di tingkat database, memastikan setiap pengguna hanya dapat membaca, menambah, atau mengubah data resume milik mereka sendiri.
> 
> #### 5.1.3 Tahap 3 – Pengembangan Backend dan Logika Aplikasi (Supabase & SPK)
> Logika backend pada aplikasi ini bersifat *serverless* dan memanfaatkan Supabase Database, Storage, dan Auth. Untuk fungsionalitas lanjutan, beberapa fungsi khusus ditulis dalam bentuk PostgreSQL Trigger dan RPC (Remote Procedure Call):
> * **Manajemen Autentikasi:** Mengintegrasikan Supabase Auth untuk pendaftaran akun, login dengan email, serta integrasi masuk lewat pihak ketiga menggunakan Google SSO.
> * **Sistem Kuota Unduhan:** Dibuat fungsi database untuk mencatat dan mengurangi kuota unduhan secara otomatis di tingkat server guna mencegah manipulasi sisi klien (*client-side manipulation*).
> * **Modul Sistem Pendukung Keputusan (SPK):** Algoritma evaluasi kriteria menggunakan metode SAW (*Simple Additive Weighting*), TOPSIS (*Technique for Order of Preference by Similarity to Ideal Solution*), dan AHP (*Analytic Hierarchy Process*) diimplementasikan di sisi frontend untuk menganalisis dan merangking alternatif keputusan secara dinamis berdasarkan bobot kriteria.
> 
> #### 5.1.4 Tahap 4 – Pengembangan Frontend dan Antarmuka Pengguna
> Antarmuka pengguna dibangun menggunakan React 19 dengan TypeScript untuk menghasilkan aplikasi yang aman dari kesalahan tipe data (*type-safe*). Penataan gaya visual menggunakan Tailwind CSS versi 4 untuk menghasilkan antarmuka modern yang responsif dan sangat ringan. Fitur-fitur antarmuka utama meliputi:
> * **Dashboard Beranda (Main Page):** Berisi navigasi utama, galeri templat, dan status sisa kuota kredit unduh pengguna.
> * **CV & Portfolio Builder Wizard:** Halaman formulir multi-langkah (*multi-step*) di kolom kiri, yang terintegrasi secara *real-time state sharing* dengan komponen *Live Preview* di kolom kanan. Setiap perubahan ketikan keyboard langsung merender tampilan CV secara instan.
> * **Ekspor PDF:** Proses konversi tampilan HTML menjadi berkas PDF siap cetak dilakukan langsung di browser menggunakan library `html2pdf.js` dan `jsPDF`, memastikan dokumen yang diunduh mempertahankan rasio margin kertas A4 standar ATS.
> 
> #### 5.1.5 Tahap 5 – Pengembangan Panel Administrasi
> Halaman Dasbor Admin (`AdminDashboardPage.tsx`) dirancang khusus untuk memantau penggunaan platform secara keseluruhan. Menggunakan pembatasan rute akses (*AdminRoute*), halaman ini hanya dapat dibuka oleh akun pengguna yang memiliki metadata `is_admin: true` di database Supabase. Fitur utama dasbor admin meliputi:
> * Visualisasi grafik statistik jumlah pendaftaran pengguna baru dan aktivitas unduhan harian.
> * Tabel manajemen pengguna untuk memantau sisa kuota kredit unduh masing-masing akun.
> * Statistik analisis penggunaan modul SPK DSS.
> 
> #### 5.1.6 Tahap 6 – Pengujian Fungsionalitas
> Seluruh modul aplikasi diuji secara fungsional menggunakan metode pengujian manual berbasis skenario (*happy path* dan *edge cases*). Skenario mencakup alur autentikasi Supabase, pengunggahan foto profil ke storage bucket, pembaruan data formulir dinamis, validasi sisa kuota, kalkulasi peringkat SPK, dan keakuratan visual dokumen hasil konversi PDF.
> 
> ---
> 
> ### 5.2. Kendala yang Dihadapi dan Solusinya
> 
> #### 5.2.1 Sinkronisasi State pada Formulir Dinamis dan Live Preview
> * **Kendala:** Perubahan data pada formulir beranak (*nested dynamic forms* seperti riwayat pendidikan atau pekerjaan) seringkali menyebabkan keterlambatan render (*input lag*) pada panel pratinjau langsung karena banyaknya komponen React yang memicu proses render ulang secara berlebihan.
> * **Solusi:** Tim menerapkan optimasi *state management* dengan membagi komponen formulir menjadi sub-komponen terisolasi dan menggunakan teknik debouncing ringan pada input teks yang panjang, serta memanfaatkan memoization React (`useMemo` dan `useCallback`) untuk mencegah kalkulasi layout pratinjau yang tidak perlu.
> 
> #### 5.2.2 Konversi HTML ke PDF dengan Layout yang Konsisten
> * **Kendala:** Library konversi PDF sering kali menghasilkan dokumen dengan tata letak yang berantakan, teks terpotong di batas halaman, atau font yang tidak terbaca oleh sistem ATS (Applicant Tracking System) ketika diterjemahkan dari elemen HTML biasa.
> * **Solusi:** Layout pratinjau CV dirancang dengan ukuran piksel yang dihitung secara presisi agar sesuai dengan rasio aspek kertas A4 (210mm x 297mm). Tim membatasi penggunaan elemen CSS grafis yang rumit dan memaksimalkan penggunaan font standar (seperti Inter atau Arial) untuk menjamin teks di dalam file PDF hasil unduhan tetap berupa teks mentah (*selectable text*) yang ramah mesin parser ATS.
> 
> #### 5.2.3 Keamanan Pengurangan Kuota Unduh di Supabase
> * **Kendala:** Melakukan pengurangan kuota unduhan langsung melalui kode di sisi frontend sangat tidak aman karena pengguna dapat memanipulasi kode JavaScript lokal untuk memintas batasan unduhan gratis.
> * **Solusi:** Logika pengurangan kuota dipindahkan seluruhnya ke tingkat basis data menggunakan Supabase Database Function yang dijalankan dengan hak akses keamanan tinggi (`SECURITY DEFINER`). Setiap kali berkas PDF berhasil diunduh, frontend memanggil fungsi RPC tersebut secara aman yang secara otomatis mengurangi sisa kuota pengguna di tabel server.

---

## 3. BAB VI - Pengujian Sistem

**Revisi isi tabel-tabel uji di BAB VI dengan memindahkan matriks kasus uji riil dari file** [bab_6_pengujian.md](file:///c:/React%20Vite/cv-ats-builder/bab_6_pengujian.md). Pindahkan tabel pengujian berikut:
* **6.2.1 Pengujian Autentikasi dan Registrasi** (Skenario daftar, login salah, Google SSO).
* **6.2.2 Pengujian Formulir CV Dinamis** (Skenario live preview, tambah blok, unggah foto).
* **6.2.3 Pengujian Ekspor Dokumen ke PDF** (Skenario unduh isi, unduh kosong).
* **6.2.4 Pengujian Batasan Kuota Unduhan** (Skenario unduh limit > 0, unduh limit = 0).


---

## 4. BAB VII - Evaluasi dan Dokumentasi (Draf Lengkap Baru)

**Tambahkan isi BAB VII berikut di bawah bab pengujian Anda:**

> ### BAB VII EVALUASI DAN DOKUMENTASI
> 
> #### VII.1 Evaluasi Hasil Proyek terhadap Tujuan Awal
> Evaluasi ini bertujuan untuk menilai sejauh mana hasil pengembangan platform **FreeBuild CV (freebuildcv.tech)** memenuhi tujuan umum dan spesifik proyek yang telah dirancang sebelumnya.
> 
> ##### A. Pencapaian terhadap Tujuan Umum
> Tujuan umum proyek adalah merancang dan membangun platform pembuat CV berbasis web yang interaktif, responsif, dan mudah digunakan oleh masyarakat luas. Evaluasi terhadap tujuan ini menunjukkan hasil sebagai berikut:
> * **Interaktivitas:** Fitur *Live Preview* berhasil diimplementasikan dengan sangat interaktif. Setiap ketikan pengguna pada formulir dinamis langsung terproyeksikan ke tampilan CV secara instan.
> * **Responsivitas:** Halaman situs web telah diuji pada perangkat dengan berbagai ukuran resolusi (ponsel cerdas, tablet, dan desktop) dan terbukti responsif dengan tata letak formulir yang otomatis bergeser secara vertikal pada layar kecil.
> * **Kemudahan Penggunaan:** Desain UI dua kolom (*split-screen*) terbukti meminimalkan disorientasi visual, memungkinkan pengguna fokus mengisi data di kolom kiri sambil memantau hasilnya di kolom kanan.
> 
> ##### B. Pencapaian terhadap Tujuan Spesifik
> Evaluasi terhadap tujuan spesifik yang telah dirancang dijabarkan dalam matriks berikut:
> 
> | Tujuan Spesifik Awal | Status Pencapaian dalam Sistem | Indikator Keberhasilan |
> |---|---|---|
> | Mengimplementasikan manajemen hak akses pengguna (*multi-role*) | **Tercapai** | Sistem berhasil memisahkan hak akses antara *Guest* (akses dasar), *User* terdaftar (draf tersimpan), dan *Admin* (pemantauan dasbor). |
> | Menerapkan sistem kuota kredit unduh PDF otomatis | **Tercapai** | Kebijakan limitasi kuota (default: 3 untuk *Guest* dan 6 untuk *User*) berhasil berjalan di tingkat basis data dan secara otomatis berkurang ketika pengguna mengunduh berkas. |
> | Menyediakan variasi templat CV standar dunia kerja (ATS-Friendly) | **Tercapai** | Menyediakan pilihan templat profesional dengan struktur teks terstandardisasi yang dapat dibaca secara akurat oleh mesin parser ATS. |
> 
> ##### C. Kelebihan dan Kekurangan Sistem
> * **Kelebihan:**
>   1. **Keamanan RLS (Row Level Security):** Kebijakan tingkat database memastikan data pribadi draf CV pengguna tidak dapat diakses atau diubah oleh akun lain.
>   2. **Akurasi Konversi:** Berkas PDF hasil unduhan tetap mempertahankan struktur teks mentah (*selectable text*), bukan gambar raster, sehingga ramah terhadap sistem filter ATS.
>   3. **Fitur SPK Analitis:** Admin dilengkapi dengan modul analitis SPK menggunakan metode SAW, TOPSIS, dan AHP untuk mengevaluasi data aktivitas pengguna secara objektif.
> * **Kekurangan:**
>   1. **Ketergantungan Sisi Klien (*Client-Side Rendering*):** Proses kompilasi HTML-ke-PDF dijalankan langsung oleh browser lokal menggunakan `html2pdf.js`, sehingga kecepatan pengunduhan dan konsistensi tata letak sangat bergantung pada memori dan mesin browser pengguna.
> 
> ---
> 
> #### VII.2 Dokumentasi Teknis dan Pengguna
> 
> ##### A. Dokumentasi Teknis (Untuk Pengembang/Administrator)
> Dokumentasi teknis ini merinci arsitektur dan konfigurasi sistem agar sistem dapat dipelihara dan dikembangkan lebih lanjut di masa depan.
> 
> 1. **Arsitektur Sistem:**
>    Aplikasi ini menggunakan arsitektur modern *Serverless Frontend-Heavy SPA*:
>    * **Frontend:** React 19.2.0, TypeScript 5.9.3, Vite 7.2.4, Tailwind CSS 4.1.18, React Router DOM 7.11.0.
>    * **Backend (BaaS):** Supabase SDK sebagai penghubung ke PostgreSQL, Supabase Auth untuk token JWT sesi, dan Supabase Storage bucket `profile-photos` untuk penyimpanan berkas gambar.
> 
> 2. **Struktur File Konfigurasi `.env`:**
>    Frontend memerlukan konfigurasi variabel lingkungan untuk terhubung ke kluster Supabase:
>    ```env
>    VITE_SUPABASE_URL=https://[id-proyek-supabase].supabase.co
>    VITE_SUPABASE_ANON_KEY=[kunci-anon-public-supabase]
>    ```
> 
> 3. **Skema Relasi Basis Data:**
>    Sistem menggunakan pangkalan data relasional PostgreSQL dengan skema tabel utama: `user_resumes` (id UUID, nama resume), `resume_personal_info` (1:1 ke resume), `resume_education` (1:N ke resume), `resume_experiences` (1:N ke resume), `resume_skills` (1:1 ke resume), dan `download_history` (riwayat unduh).
> 
> 4. **Algoritma SPK DSS (Decision Support System):**
>    Sistem mengagregasikan metrik pengguna di admin panel berdasarkan 5 kriteria utama (C1: Unduhan, C2: Jumlah CV, C3: Kelengkapan Profil, C4: Hari sejak aktif terakhir, C5: Variasi template). Normalisasi data dilakukan menggunakan matriks matematika SAW, disusul penentuan alternatif terbaik menggunakan solusi ideal positif/negatif metode TOPSIS, dengan pembobotan kriteria dikalibrasi via AHP.
> 
> ##### B. Dokumentasi Pengguna (Panduan Operasional)
> 1. **Langkah Pendaftaran & Login Akun:**
>    * Buka halaman utama [freebuildcv.tech](http://freebuildcv.tech).
>    * Klik **"Daftar Akun"**, masukkan nama, email, dan password, lalu klik submit. Konfirmasi pendaftaran melalui link email yang dikirim otomatis.
>    * Atau, klik **"Login with Google"** untuk masuk secara instan menggunakan akun Google Anda.
> 
> 2. **Langkah Pembuatan CV:**
>    * Masuk ke halaman **"Workspace / CV Builder"**.
>    * Pilih templat yang Anda inginkan (misalnya: *ATS Standard Template*).
>    * Isi formulir pada kolom kiri (Data Pribadi, Ringkasan, Pendidikan, Pengalaman, Keahlian). Pantau perubahan visualnya di kolom kanan secara *real-time*.
>    * Jika ingin menambahkan foto profil, klik tombol unggah foto pada kolom data pribadi.
>    * Setelah selesai, klik tombol **"Unduh PDF"** di bagian atas pratinjau. Sistem akan memproses berkas dan browser akan otomatis menyimpan file PDF.
> 
> 3. **Panduan Admin (Dasbor Monitoring & SPK):**
>    * Login dengan akun administrator.
>    * Buka URL `/admin` untuk masuk ke halaman **Admin Dashboard**.
>    * Menu **Statistik** menampilkan grafik pendaftaran user dan total unduhan berkas.
>    * Menu **SPK DSS** menampilkan tabel perankingan alternatif pengguna terbaik berdasarkan komputasi SAW, TOPSIS, dan AHP. Admin dapat menyesuaikan pembobotan matriks kriteria untuk mengkalibrasi ulang hasil perangkingan secara dinamis.
> 
> 4. **Troubleshooting Sederhana:**
>    * **Kuota Unduh Habis:** Jika muncul peringatan kuota habis, daftarkan akun baru (jika saat ini login sebagai Guest) untuk mendapatkan kuota tambahan 6 unduhan secara gratis.
>    * **PDF Terpotong/Layout Rusak:** Gunakan browser berbasis Chromium versi terbaru (seperti Google Chrome atau Microsoft Edge) pada perangkat desktop agar pustaka render PDF dapat menghitung ukuran halaman A4 secara presisi.
> 
> ---
> 
> #### VII.3 Rencana Pengembangan Lanjutan
> 
> ##### A. Rencana Fitur Baru
> * **Integrasi AI ATS Scanner:** Mengembangkan fitur bertenaga AI (*Artificial Intelligence*) yang dapat membaca teks CV hasil generate pengguna, mencocokkannya dengan deskripsi pekerjaan (*job description*) yang diunggah, lalu memberikan penilaian kecocokan (*ATS Match Score*) serta rekomendasi kata kunci.
> * **Impor Otomatis LinkedIn:** Menambahkan fitur impor profil LinkedIn untuk mengisi data formulir CV secara otomatis hanya dengan mengunggah PDF profil LinkedIn atau memasukkan tautan akun.
> 
> ##### B. Peningkatan Performa
> * **Server-Side PDF Rendering:** Mengalihkan proses kompilasi berkas PDF dari browser pengguna (sisi klien) ke server (sisi backend) menggunakan Node.js microservice yang dilengkapi dengan pustaka Puppeteer. Hal ini akan meminimalisir kegagalan render di browser ponsel lawas dan menjamin visualisasi layout PDF 100% konsisten di semua perangkat.
> 
> ##### C. Integrasi Sistem Lain
> * **Job Board Connector:** Mengintegrasikan platform secara langsung dengan API lowongan pekerjaan (seperti LinkedIn atau JobStreet), sehingga setelah mengunduh CV, pengguna dapat langsung melamar lowongan kerja yang relevan dari dasbor FreeBuild CV.
> 
> ##### D. Pengembangan Platform Baru
> * **Mobile Application (Android & iOS):** Mengembangkan aplikasi mobile menggunakan React Native. Aplikasi mobile ini akan berbagi pangkalan data Supabase yang sama, sehingga draf CV yang dibuat di web dapat diedit kembali dengan nyaman lewat smartphone pengguna secara *native*.

---

## 5. BAB VIII - Manajemen Tim (Perbaikan Identitas & Sprints)


**Ganti tabel pembagian tugas dan linear sprints dengan informasi berikut:**

> ### 8.1 Pembagian Tugas Antar Anggota Tim
> Pembagian peran dilakukan berdasarkan kompetensi dan minat masing-masing anggota kelompok:
> 
> | Anggota Tim | Peran Utama | Tanggung Jawab Utama |
> |---|---|---|
> | **Muhammad Fatur Rohman** | Programmer / Developer | Mengembangkan komponen frontend React, integrasi API client Supabase SDK, algoritma keputusan SPK (SAW, TOPSIS, AHP), penataan layout Tailwind CSS, dan implementasi ekspor PDF. |
> | **Muhamad Adlidzil Arifah** | Database & Security Specialist | Merancang skema database PostgreSQL Supabase, menulis SQL scripts untuk tabel dan RLS policies, membuat trigger fungsi pengurangan kuota unduh, dan pengujian database. |
> | **Abdul Rahman Majid** | UI/UX Designer & Tester | Merancang tata letak dan wireframe antarmuka web, membuat dokumentasi changelog, pengujian fungsionalitas sistem (Blackbox testing), dan penyusunan laporan akhir. |
> 
> ---
> 
> ### 8.2 Strategi Manajemen Proyek (Linear Sprints)
> 
> | Sprint | Periode Pengerjaan | Fokus Pengerjaan |
> |---|---|---|
> | **Sprint 1** | Minggu 1–2 | Persiapan lingkungan proyek (Vite, React, TypeScript), inisialisasi git, instalasi Tailwind CSS, dan setup database Supabase awal. |
> | **Sprint 2** | Minggu 3–4 | Pembuatan halaman autentikasi (Login, Register), integrasi Supabase Auth, dan setup Google SSO. |
> | **Sprint 3** | Minggu 5–6 | Pengembangan form CV dinamis multi-step, state sharing, dan visualisasi komponen *Live Preview* secara real-time. |
> | **Sprint 4** | Minggu 7–8 | Implementasi library `html2pdf.js` untuk ekspor dokumen ke PDF, setup storage bucket Supabase untuk unggah foto profil CV. |
> | **Sprint 5** | Minggu 9–10 | Pembuatan fitur limit kuota unduh dokumen untuk Guest & User, serta pencatatan log riwayat unduhan di database. |
> | **Sprint 6** | Minggu 11–12 | Pengembangan modul SPK DSS (metode SAW, TOPSIS, AHP), chart visualisasi hasil keputusan, serta pembuatan halaman Admin Dashboard. |
> | **Sprint 7** | Minggu 13–14 | Pengujian integrasi sistem (*Blackbox Testing*), perbaikan minor bug pada render PDF, dan finalisasi penyusunan berkas laporan. |
