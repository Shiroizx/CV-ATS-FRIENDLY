# BAB VI PENGUJIAN SISTEM

## 6.1 Metode Pengujian
Pada pengembangan sistem *freebuildcv.tech*, metode pengujian yang digunakan adalah **Blackbox Testing** (Pengujian Kotak Hitam). Pengujian ini memfokuskan evaluasi pada fungsionalitas eksternal dari perangkat lunak. Penguji (tester) tidak perlu memahami susunan baris kode atau algoritma di belakang layar, melainkan hanya perlu bertindak layaknya pengguna nyata (end-user). Pengujian dilakukan dengan memberikan berbagai variasi masukan (*input*) melalui antarmuka situs web (UI), kemudian mengamati dan memverifikasi apakah keluaran (*output*) dan respon sistem sesuai dengan dokumen spesifikasi rancangan yang telah ditentukan.

## 6.2 Hasil Pengujian dan Analisis
Proses eksekusi *Blackbox Testing* dibagi menjadi beberapa modul utama yang mewakili alur perjalanan pengguna (User Journey). Seluruh tahapan dan hasil pengujian dicatat secara rinci di bawah ini.

### 6.2.1 Pengujian Autentikasi dan Registrasi
Pengujian ini bertujuan untuk memastikan bahwa gerbang keamanan pertama aplikasi berfungsi dengan baik dalam memproses kredensial calon pengguna.

| Skenario Pengujian | Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| Mendaftar akun baru dengan email dan kata sandi valid. | Mengisi formulir daftar dan klik "Daftar". | Sistem membuat akun baru di Supabase Auth, menampilkan notifikasi sukses, dan mengalihkan ke halaman utama. | Akun terbuat, token disimpan, limit unduhan otomatis bertambah menjadi 6. | [ &check; ] Sukses |
| Masuk (login) dengan kredensial yang salah. | Mengisi kata sandi yang keliru. | Sistem menolak akses dan memunculkan pop-up galat (error) bahwa kredensial tidak valid. | Muncul notifikasi "Invalid login credentials", akses tertolak. | [ &check; ] Sukses |
| Masuk menggunakan SSO (Single Sign-On) Google. | Mengklik tombol "Login with Google". | Sistem memunculkan jendela pop-up Google Auth dan langsung mengautentikasi tanpa meminta kata sandi. | Pengguna berhasil masuk dengan aman menggunakan akun Google. | [ &check; ] Sukses |

### 6.2.2 Pengujian Formulir CV Dinamis (Live Preview)
Pengujian ini sangat krusial karena fungsionalitas *Live Preview* merupakan inti daya tarik aplikasi *builder* ini.

| Skenario Pengujian | Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| Mengisi kolom isian teks (Nama, Nomor HP, Summary). | Mengetik teks acak di formulir sebelah kiri. | Teks di atas lembar pratinjau (kanan) otomatis terisi secara instan bersamaan dengan tiap ketikan keyboard (*real-time*). | Perubahan langsung terlihat di *Live Preview* tanpa *lag* atau muat ulang halaman. | [ &check; ] Sukses |
| Menambahkan blok riwayat baru (Pendidikan/Pengalaman). | Klik tombol "Tambah Pendidikan" lalu isi detail kampus dan tahun. | Blok komponen pendidikan baru muncul di pratinjau dengan format yang presisi. | Format blok sesuai dengan standar templat, tidak merusak spasi batas kertas. | [ &check; ] Sukses |
| Mengunggah foto profil ke dalam CV. | Memilih file berekstensi .jpg/.png dari komputer. | Foto berhasil terunggah ke *Storage* dan langsung dimuat ke sudut lembar pratinjau CV. | Foto masuk dengan proporsi *cropping* yang pas dan tidak merusak layout teks. | [ &check; ] Sukses |

### 6.2.3 Pengujian Ekspor Dokumen ke PDF (Fungsionalitas Utama)
Pengujian fungsionalitas ini memastikan konversi dari tampilan web (HTML/CSS) menjadi dokumen cetak (PDF) berjalan tanpa cacat (standar ATS).

| Skenario Pengujian | Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| Mengekspor dokumen CV saat formulir telah terisi penuh. | Klik tombol "Unduh CV". | Proses komputasi berjalan, kemudian peramban mengunduh file `.pdf` ke memori perangkat pengguna. | File PDF berhasil diunduh. Tata letak elemen, margin kertas A4, dan ukuran font sama persis dengan *Live Preview*. | [ &check; ] Sukses |
| Mengekspor CV kosong. | Klik "Unduh CV" tanpa mengisi satupun input. | Sistem mengunduh PDF template kosong dengan desain batas margin dasar. | Unduhan berhasil, namun desain mengikuti format data kosong bawaan. | [ &check; ] Sukses |

### 6.2.4 Pengujian Batasan Kuota Unduhan (Limit Management)
Pengujian ini ditujukan untuk memverifikasi kebijakan sistem dalam mencegah pengunduhan massal tak terbatas oleh tamu.

| Skenario Pengujian | Masukan (Input) | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|
| Pengunduhan saat kuota tersedia (Limit > 0). | Menekan "Unduh CV" dengan posisi sisa limit 3 (Guest) atau 6 (User). | PDF terunduh. Sistem mengeksekusi fungsi Supabase untuk mencatat log ke tabel *download_history* dan mengurangi angka kuota sebanyak 1 poin. | Kuota pengguna berkurang otomatis di pangkalan data secara aktual. | [ &check; ] Sukses |
| Pengunduhan saat kuota habis (Limit = 0). | Menekan "Unduh CV" saat sisa limit bernilai 0. | Sistem secara responsif mencegat (*intercept*) proses unduh dan memblokir konversi. | PDF gagal dibuat, muncul pop-up peringatan bahwa "Limit kuota unduhan Anda telah habis". | [ &check; ] Sukses |

### 6.2.5 Analisis Hasil Pengujian
Berdasarkan serangkaian pengujian fungsional di atas, dapat ditarik analisis bahwa platform web *freebuildcv.tech* telah beroperasi penuh sesuai rancangan kebutuhan awal. 

Integrasi antara *Frontend* (React) dan *Backend* (Supabase) berhasil dieksekusi dengan *delay* yang sangat minim. Fitur pengolahan *state* yang kompleks pada komponen *Live Preview* terbukti stabil meskipun dihadapkan pada masukan data teks dan gambar yang padat. Logika pembatasan limit kuota bekerja akurat di tingkat basis data (Database Level) sehingga mencegah eksploitasi oleh pihak luar. Selain itu, modul ekspor (library `html2pdf`) juga terbukti tangguh dalam menerjemahkan struktur *Styling CSS* web menjadi format PDF berstandar ATS, yang memastikan teks bisa dibaca oleh mesin pelacak CV (*parser*) milik perusahaan. Secara keseluruhan, sistem disimpulkan bebas dari cacat kritis (*bug-free*) dan dinilai siap (Production-Ready) untuk didistribusikan kepada publik.
