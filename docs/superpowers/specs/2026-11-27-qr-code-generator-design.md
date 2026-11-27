# Generator Kode QR — Spesifikasi Arsitektur & Desain UX

**Tanggal:** 2026-11-27
**Aplikasi Target:** FreeBuild CV (`React 19` + `TypeScript 5.9` + `Vite 7` + `Tailwind CSS v4` + `Supabase`)
**Alur Referensi:** Reverse Engineering Analysis (REA) dari `myqrcode.com/id/generator` yang diadaptasi secara native ke sistem desain monokrom zinc + aksen `blue-600` milik FreeBuild CV.

---

## 1. Cakupan & Jenis Kode QR yang Didukung (8 Jenis)

Hanya 8 jenis Kode QR yang disetujui pengguna dari MyQRCode yang disertakan:

| # | ID | Label | Deskripsi | Mode Statis | Mode Dinamis Ter-host (`/q/:shortCode`) |
|---|---|---|---|---|---|
| 1 | `url` | **URL Situs Web** (`PALING BANYAK DIGUNAKAN`) | Tautan ke situs web pilihan | Bawaan (URL langsung yang sudah dinormalisasi) | Opsional (shortlink terlacak) |
| 2 | `vcard` | **vCard** | Bagikan kartu nama elektronik | Didukung (string vCard 3.0 offline; hanya teks, tanpa foto) | Bawaan (kartu kontak digital kaya fitur + unduh `.vcf` 1-klik) |
| 3 | `pdf` | **PDF** | Tampilkan PDF | Didukung (tautan URL PDF langsung) | Bawaan (kartu sampul/ringkasan PDF + tombol Buka/Unduh) |
| 4 | `image` | **Gambar** | Tampilkan galeri gambar | Fallback tautan langsung untuk 1 gambar | Bawaan (halaman landing galeri multi-gambar) |
| 5 | `social` | **Media Sosial** | Bagikan saluran media sosial Anda | Fallback tautan tunggal (hanya 1 saluran) | Bawaan (halaman mobile Link-in-Bio multi-saluran) |
| 6 | `video` | **Video** | Bagikan satu atau beberapa video | Fallback tautan langsung untuk 1 video | Bawaan (showcase multi-video dengan player YouTube/Vimeo/MP4 yang aman) |
| 7 | `business` | **Halaman Bisnis** | Bagikan informasi bisnis Anda | Tidak berlaku | Wajib (profil merek, jam buka 7 hari, alamat/Maps, WhatsApp, CTA) |
| 8 | `menu` | **Menu** | Buat menu restoran digital | Tidak berlaku | Wajib (kategori, item, mata uang, harga, foto, lencana menu) |

### Mengapa Menggunakan Arsitektur Hybrid Statis + Dinamis?
Matriks QR native hanya dapat menyimpan teks mentah (`<= ~2.9 KB` maks) dan kamera smartphone hanya menjalankan aksi langsung untuk URL `http(s)://` atau payload `BEGIN:VCARD`. Meng-encode Menu restoran terstruktur, Galeri multi-gambar, atau daftar Media Sosial sebagai teks mentah akan merusak pengalaman pengguna nyata (kamera hanya menampilkan teks biasa yang tidak bisa diklik) dan membuat kepadatan QR terlalu rapat.

Karena FreeBuild CV sudah menggunakan Supabase + routing SPA Vercel (`vercel.json` fallback ke `index.html`), menggabungkan rendering QR sisi klien (`qr-code-styling`) dengan rute penampil publik (`/q/:shortCode`) dan tabel `public.qr_codes` membuat **seluruh 8 jenis QR benar-benar berfungsi end-to-end** saat dipindai kamera smartphone, sekaligus tetap menjaga **encoding statis offline tanpa database** untuk `url` dan `vcard` statis.

---

## 2. UX Wizard 3 Langkah & Pratinjau Ponsel Dual-Mode

### Tata Letak
- **Rute:** `/qr-generator` (baru) dan `/qr-generator/:id` (edit QR dinamis tersimpan).
- **Desktop (`lg:`):** StickyNavbar (`h-16`) + grid 12 kolom (`lg:col-span-7` Panel Wizard Kiri, `lg:col-span-5` Panel Mockup Ponsel Sticky Kanan) + `QRStepIndicator` di bawah.
- **Mobile (`< lg`):** Form 1 kolom + tombol melayang `Preview` untuk membuka pratinjau layar penuh dalam modal (konsisten dengan `PortfolioBuilderPage.tsx`).

### Langkah 1 — Pilih Jenis (`QRTypeSelector`)
- Grid kartu responsif 2 kolom dengan ikon Lucide, judul, deskripsi, lencana `PALING BANYAK DIGUNAKAN` pada `url`, serta lencana pengiriman halus (`Langsung` vs `Halaman Digital`).
- Memilih salah satu jenis akan menginisialisasi `createInitialContent(type)` dan lanjut mulus ke Langkah 2.

### Langkah 2 — Tambahkan Konten (`QRContentForm` + Subform Modular)
- Bagian akordeon yang dapat dibuka-tutup mengikuti ergonomi `PortfolioForm` milik FreeBuild CV.
- Tombol **"Isi Data Contoh"** memuat contoh data Bahasa Indonesia yang realistis untuk jenis QR yang aktif.
- Untuk `vcard`, `pdf`, `image`, `video`, dan `social`, pengguna dapat mengganti toggle **Mode Dinamis (Halaman Digital)** vs **Mode Langsung / Statis** (ditampilkan bila `supportsStatic === true`).
- **Mockup Dual-Mode Panel Kanan:** Switch tersegmentasi di bagian atas (`Pratinjau Halaman` | `Kode QR`).
  - `Pratinjau Halaman`: Merender `QRLandingRenderer` secara live di dalam bingkai ponsel sehingga pengguna melihat tampilan halaman mobile persis saat mengetik (untuk `url`, menampilkan kartu pratinjau tautan mobile, bukan iframe yang diblokir `X-Frame-Options`).
  - `Kode QR`: Merender kode QR bergaya secara live (menggunakan URL placeholder `https://freebuildcv.tech/q/preview` pada mode dinamis sebelum dipublikasikan, atau payload asli pada mode statis).

### Langkah 3 — Kustomisasikan Desain QR (`QRCustomizer`)
Empat bagian desain yang dapat dibuka-tutup:
1. **Bingkai & Teks CTA:** 6 preset (`none`, `basic`, `badge-bottom`, `badge-top`, `card`, `minimal-corners`), label CTA (maks 24 karakter, di-escape XML), warna bingkai, warna teks CTA.
2. **Pola QR & Warna:** 6 bentuk titik (`square`, `dots`, `rounded`, `extra-rounded`, `classy`, `classy-rounded`), Warna Solid vs Gradien (`linear`/`radial`, sudut `0–360`, 2 color stop), warna latar belakang atau toggle transparan.
3. **Sudut QR (Mata QR):** Kotak sudut luar (`square`, `extra-rounded`, `dot`) + warna; titik sudut dalam (`square`, `dot`) + warna.
4. **Logo & Koreksi Error:** 10 ikon preset SVG inline + unggah file kustom (`PNG/JPG/SVG/WebP`, maks 2MB, dikonversi menjadi `data:` URL agar menghindari CORS canvas tainting), ukuran (`0.20–0.40`), margin (`0–12px`), koreksi error (`L/M/Q/H`, otomatis dinaikkan ke `'H'` saat logo aktif).
- **Penjaga Keterbacaan (Scannability Guard):** Menghitung kontras luminansi relatif WCAG antara stop warna depan dan latar belakang (memakai `#ffffff` saat transparan). Menampilkan lencana peringatan jika rasio kontras `< 3.0` atau warna depan lebih terang daripada latar belakang (QR terbalik).

---

## 3. Persistensi Data, Keamanan & Pipeline Ekspor

### Skema Supabase (`sql_qr_codes_setup.sql`)
- **Tabel `public.qr_codes`:**
  - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
  - `short_code text UNIQUE NOT NULL`
  - `user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE` (`NULL` diizinkan untuk QR publikasi tamu)
  - `qr_type text NOT NULL CHECK (qr_type IN ('url','vcard','pdf','image','social','video','business','menu'))`
  - `mode text NOT NULL CHECK (mode IN ('static','dynamic'))`
  - `title text NOT NULL DEFAULT 'QR Code'`
  - `content_data jsonb NOT NULL` (batasi: `octet_length(content_data::text) <= 65536`)
  - `style_options jsonb NOT NULL` (batasi: `octet_length(style_options::text) <= 32768`)
  - `scan_count int NOT NULL DEFAULT 0`
  - `is_active boolean NOT NULL DEFAULT true`
  - `created_at timestamptz DEFAULT now()`, `updated_at timestamptz DEFAULT now()`
- **RLS & Perlindungan Privasi (Anti-Scraping):**
  - Pengguna terautentikasi memiliki akses `ALL` (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) terbatas pada `auth.uid() = user_id`.
  - **Tidak ada policy `anon SELECT` terbuka** di `public.qr_codes` (mencegah dump tabel lewat kunci `anon` yang bisa membocorkan nomor HP/email pengguna).
  - Pembacaan halaman scan publik hanya melalui RPC `SECURITY DEFINER` `get_public_qr(p_short_code text)` yang mengembalikan 1 baris aktif berdasarkan kecocokan `short_code` persis dan menaikkan `scan_count`.
  - Publikasi QR dinamis untuk tamu melalui RPC `SECURITY DEFINER` `create_guest_qr(...)` yang menegakkan daftar izin `qr_type` dan batas ukuran byte payload (disimpan dengan `user_id = NULL`, tidak dapat diedit setelah dibuat).
- **Storage Bucket `qr-assets`:** Baca publik, unggah terautentikasi ke `${auth.uid()}/...` (`image/*`, `application/pdf`, maks 5MB). Tempel URL langsung selalu berfungsi tanpa login.

### Kontrol Keamanan
- Seluruh tautan input pengguna melewati `sanitizeExternalUrl()` yang hanya mengizinkan `http:`, `https:`, `mailto:`, `tel:` (memblokir `javascript:`, `vbscript:`, `data:`).
- Embed video mem-parsing ID YouTube / Vimeo secara ketat ke URL terizin `youtube-nocookie.com` / `player.vimeo.com` atau `<video>` native untuk `.mp4`/`.webm`; URL tak dikenal dirender sebagai tombol tautan keluar yang aman (tanpa injeksi iframe sembarangan).
- Teks CTA bingkai di-escape melalui `escapeXml()` sebelum menyusun template SVG.

### Komposer Ekspor (`qrExport.ts`)
- Memanggil `QRCodeStyling.getRawData('svg')`, mengekstrak markup `<svg>` bagian dalam, dan membungkusnya ke dalam SVG Bingkai deterministik terpilih (`composeFramedSvg`), memastikan **ekspor PNG, JPG, SVG, dan Salin PNG ke Clipboard selalu menyertakan Bingkai + CTA + Pola + Sudut + Logo**.
- Ekspor JPG memaksa lapisan dasar kanvas putih solid bila `bgTransparent === true`.
- **Keputusan Kuota:** Pembuatan & pengunduhan QR **gratis tanpa batas** (TIDAK memotong kuota kredit unduh PDF CV milik pengguna yang terbatas 3/6).

---

## 4. Integrasi Aplikasi

- **Rute (`src/App.tsx`):**
  - `/qr-generator` & `/qr-generator/:id` (`QRGeneratorPage`, lazy)
  - `/q/:shortCode` (`PublicQRViewerPage`, lazy — penampil mandiri tanpa Navbar)
  - `/my-qr-codes` (`MyQRCodesPage`, lazy di dalam `ProtectedRoute`)
- **Navigasi (`src/components/Navbar.tsx`):**
  - Ganti `routeLinks: any[]` yang belum bertipe dengan `RouteLink[]` bertipe, tambahkan `{ to: '/qr-generator', label: 'QR Generator', icon: QrCode }`.
  - Sembunyikan `<Navbar />` pada rute `/q/*` agar halaman hasil scan tampil bersih di ponsel pengguna akhir.
  - Tambahkan tautan `Riwayat QR Code` (`/my-qr-codes`) di dropdown profil (desktop + mobile).
- **Etalase Halaman Utama (`src/pages/MainPage.tsx`):**
  - Pertahankan grid Template CV 4 kolom tetap seimbang (`3 template CV + 1 Coming Soon`), dan tampilkan **Kartu Sorotan QR Code Generator** khusus tepat di bawah grid template yang mengarah langsung ke `/qr-generator` dengan pratinjau QR mini interaktif/SVG dan lencana fitur.
