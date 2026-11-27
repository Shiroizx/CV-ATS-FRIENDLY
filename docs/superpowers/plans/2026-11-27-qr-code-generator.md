# Rencana Implementasi QR Code Generator

> **Untuk agentic workers:** SUB-SKILL WAJIB: Gunakan `superpowers:subagent-driven-development` (direkomendasikan) atau `superpowers:executing-plans` untuk mengimplementasikan rencana ini task demi task. Langkah-langkah menggunakan sintaks checkbox (`- [ ]`) untuk pelacakan.

**Tujuan:** Membangun fitur QR Code Generator lengkap dengan 8 jenis QR (`/qr-generator`), penampil halaman landing QR dinamis publik (`/q/:shortCode`), serta dasbor riwayat QR tersimpan (`/my-qr-codes`) yang terintegrasi ke FreeBuild CV, hasil reverse engineering alur UX `myqrcode.com/id/generator`.

**Arsitektur:** Wizard 3 langkah (`Pilih Jenis` → `Tambahkan Konten` → `Kustomisasikan Desain QR`) berpasangan dengan Mockup Ponsel Dual-Mode yang sticky di sebelah kanan (`Pratinjau Halaman` vs `Kode QR`). Tipe yang mendukung mode statis (`url`, `vcard` statis, `pdf`/`image`/`video` tautan tunggal) langsung di-encode di browser; tipe halaman landing kaya fitur (`menu`, `business`, `social`, galeri `image`, multi-`video`, `vcard`/`pdf` dinamis) mempublikasikan payload JSON ke Supabase (`public.qr_codes`) di bawah URL singkat 8 karakter (`/q/:shortCode`) yang dirender oleh komponen bersama `QRLandingRenderer`. Langkah 3 memanfaatkan `qr-code-styling` yang digabung ke dalam bingkai SVG aman-XML untuk ekspor PNG/JPG/SVG/Clipboard beresolusi tinggi.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4, `qr-code-styling`, Supabase (PostgreSQL + RPC + Storage), `lucide-react`, `sweetalert2`, `motion`, Node 22 native test runner (`node --experimental-strip-types --test`).

**Spec:** [docs/superpowers/specs/2026-11-27-qr-code-generator-design.md](file:///c:/React%20Vite/cv-ats-builder/docs/superpowers/specs/2026-11-27-qr-code-generator-design.md)

## Batasan Global (Global Constraints)

- TypeScript ketat (`tsconfig.app.json`): `strict: true`, `noUnusedLocals: true`, `noUnusedParameters: true`, `verbatimModuleSyntax: true` (wajib `import type`), `erasableSyntaxOnly: true` (dilarang memakai `enum`, dilarang memakai parameter property pada constructor), `allowImportingTsExtensions: true`
- ESLint (`eslint.config.js`): dilarang memakai `any` (`@typescript-eslint/no-explicit-any`), aturan React hooks ditegakkan
- File logika murni di bawah `src/lib/` yang diuji di Node (`qrHelpers.ts`, `qrFrameSvg.ts`) harus mengimpor file TS relatif dengan ekstensi `.ts` dan DILARANG mengimpor `import.meta.env`, `supabase`, atau global DOM (`window`, `document`, `DOMParser`)
- Styling: Tailwind CSS v4 (`@tailwindcss/vite`), palet monokrom zinc (`zinc-900`, `zinc-200`, `rounded-2xl`/`rounded-3xl`) + aksen aktif `blue-600`, font Inter, ikon hanya dari `lucide-react`
- Dialog/toast: gunakan ulang `src/utils/swal.ts` (`showSuccess`, `showError`, `showWarning`, `showInfo`, `showDeleteConfirm`, `showToast`)
- DILARANG memotong kredit unduh CV (`src/lib/downloadCredit.ts`) saat mengunduh QR
- Seluruh teks UI yang tampil ke pengguna dalam Bahasa Indonesia
- Verifikasi: `node --experimental-strip-types --test tests/*.test.ts`, `npx tsc -b`, `npm run lint`, dan `npm run build`

## Fokus Review (Review Focus)

1. **Injeksi XSS / URL & Embed Video Tidak Aman** — Pengguna berniat jahat menyimpan `javascript:alert(1)` pada tautan URL/CTA/media sosial atau `<iframe src="evil">` atau `<2026> & Cafe` pada teks CTA bingkai; `sanitizeExternalUrl`, `parseVideoEmbedUrl`, dan `escapeXml` harus menetralisir semuanya tanpa crash.
2. **QR Kontras Rendah / Terbalik (Tidak Bisa Dipindai)** — Pengguna memilih titik terang (`#e5e5e5`) di atas putih (`#ffffff`) atau titik putih di atas hitam (`#000000`); `checkQRScannability` harus mendeteksi rasio kontras luminansi WCAG `< 3.0` serta warna depan terbalik, lalu memicu peringatan visual + konfirmasi sebelum ekspor.
3. **Luapan Byte vCard Statis (Byte Overflow)** — Pengguna mengisi seluruh kolom vCard + bio panjang pada mode Statis hingga melebihi ~2.000 byte; `resolveQRPayload` harus menghitung panjang byte UTF-8 secara akurat dan menandai `isOverflowRisk: true` agar UI menyarankan beralih ke mode Dinamis.
4. **Pengiriman Form Kosong / Tidak Valid** — Pengguna mengklik `Lanjut` di Langkah 2 dengan URL tidak valid, kategori/item Menu kosong, daftar Media Sosial kosong, atau nama Bisnis kosong; `validateQRContent` harus mengembalikan error per kolom yang tepat dan memblokir transisi ke Langkah 3.
5. **QR Dinamis Belum Dipublikasikan & CORS Tainting Logo** — Pengguna mencoba mengunduh QR Menu/Bisnis sebelum dipublikasikan ke Supabase (yang akan meng-encode URL pratinjau mati), ATAU mengunggah file logo >2MB / format tidak didukung; UI harus mewajibkan publikasi sebelum unduh pada mode dinamis dan mengonversi logo lokal secara ketat menjadi `data:` URL agar ekspor Canvas PNG/JPG tidak pernah melempar `SecurityError`.

---

## Struktur File

| Aksi | Path | Tanggung Jawab |
|---|---|---|
| Buat | `sql_qr_codes_setup.sql` | Tabel Supabase `qr_codes`, batasan ukuran JSONB, RLS pemilik, RPC `get_public_qr` & `create_guest_qr`, bucket storage `qr-assets` |
| Buat | `src/types/qrGenerator.ts` | Seluruh tipe/union untuk 8 model konten QR, opsi gaya, state wizard, metadata `QR_TYPES`, `createInitialContent` |
| Buat | `src/lib/qrHelpers.ts` | Sanitasi URL murni, parsing embed video, pembuat vCard 3.0, validasi, resolver payload, penjaga kontras, generator short code |
| Buat | `src/lib/qrFrameSvg.ts` | Komposer bingkai SVG murni (`escapeXml`, `composeFramedSvg`, metadata bingkai) yang dipakai bersama oleh pratinjau live & ekspor |
| Buat | `src/lib/qrPresets.ts` | 10 ikon preset data-URI SVG inline, palet warna, data contoh (dummy) untuk seluruh 8 jenis QR |
| Buat | `src/lib/qrExport.ts` | Helper ekspor browser (ekstraksi SVG `qr-code-styling` + unduh PNG/JPG/SVG berbingkai, salin clipboard, unduh blob `.vcf`) |
| Buat | `src/lib/qrService.ts` | CRUD Supabase (`publishQRCode`, `getUserQRCodes`, `getQRCodeById`, `deleteQRCode`, `getPublicQRByCode`, `uploadQRAsset`) |
| Buat | `src/components/qr-generator/QRStepIndicator.tsx` | Indikator navigasi bawah 3 langkah |
| Buat | `src/components/qr-generator/QRTypeSelector.tsx` | Langkah 1: Grid 2 kolom pilihan 8 jenis QR dengan `PALING BANYAK DIGUNAKAN` & petunjuk mode pengiriman |
| Buat | `src/components/qr-generator/forms/QRFormFields.tsx` | Komponen form bersama (DRY): bagian akordeon, input teks/textarea, pemilih warna, input URL gambar/file + unggah Supabase |
| Buat | `src/components/qr-generator/forms/SimpleLinkForms.tsx` | Form Langkah 2 untuk `url`, `pdf`, `image` (galeri), `video` (multi-video) |
| Buat | `src/components/qr-generator/forms/VCardForm.tsx` | Form Langkah 2 untuk `vcard` (kolom kontak + informasi toggle Statis vs Dinamis) |
| Buat | `src/components/qr-generator/forms/SocialMediaForm.tsx` | Form Langkah 2 untuk `social` (header profil + daftar saluran dinamis dengan pemilih platform) |
| Buat | `src/components/qr-generator/forms/BusinessPageForm.tsx` | Form Langkah 2 untuk `business` (merek, tentang, editor jam buka 7 hari, kontak/Maps, CTA) |
| Buat | `src/components/qr-generator/forms/MenuForm.tsx` | Form Langkah 2 untuk `menu` (info restoran, mata uang, kategori, item, harga, lencana menu) |
| Buat | `src/components/qr-generator/QRContentForm.tsx` | Orkestrator Langkah 2: pengalih form, banner validasi, tombol isi data contoh, toggle statis/dinamis |
| Buat | `src/components/qr-generator/QRCustomizer.tsx` | Langkah 3: 4 kontrol akordeon (Bingkai & CTA, Pola & Warna/Gradien, Sudut QR, Logo & Koreksi Error) + peringatan keterbacaan |
| Buat | `src/components/qr-generator/landing/QRLandingRenderer.tsx` | UI landing mobile bersama yang dirender identik di Pratinjau Mockup Ponsel DAN halaman publik `/q/:shortCode` |
| Buat | `src/components/qr-generator/QRPreview.tsx` | Mockup ponsel sticky dengan toggle `Pratinjau Halaman` / `Kode QR`, pratinjau live SVG `qr-code-styling` + bingkai, bilah ekspor PNG/JPG/SVG/Salin |
| Buat | `src/pages/QRGeneratorPage.tsx` | Halaman wizard utama (`/qr-generator/:id?`), persistensi draft & state, alur publikasi Supabase, modal pratinjau mobile |
| Buat | `src/pages/PublicQRViewerPage.tsx` | Halaman landing publik hasil pemindaian (`/q/:shortCode`) yang membungkus `QRLandingRenderer` |
| Buat | `src/pages/MyQRCodesPage.tsx` | Dasbor QR tersimpan berproteksi (`/my-qr-codes`) dengan statistik scan, pratinjau QR cepat, edit, hapus |
| Modifikasi | `src/App.tsx:1-58` | Tambah rute lazy untuk `/qr-generator/:id?`, `/q/:shortCode`, `/my-qr-codes` |
| Modifikasi | `src/components/Navbar.tsx:52-395` | Beri tipe pada `routeLinks`, tambah tautan navigasi `QR Generator`, sembunyikan Navbar di `/q/*`, tambah `Riwayat QR Code` di menu profil |
| Modifikasi | `src/pages/MainPage.tsx:425-432` | Tambah banner sorotan khusus QR Code Generator di bawah grid template 4 kolom (menjaga simetri grid) |
| Test | `tests/qrHelpers.test.ts` | Unit test untuk sanitasi, embed video, vCard 3.0, validasi, overflow, dan pemeriksaan kontras |
| Test | `tests/qrFrameSvg.test.ts` | Unit test untuk komposisi bingkai SVG dan XML escaping pada CTA |

---

### Task 1: Dependensi, Migrasi SQL & Tipe Data (`src/types/qrGenerator.ts`)

**Files:**
- Create: `sql_qr_codes_setup.sql`
- Create: `src/types/qrGenerator.ts`

**Interfaces:**
- Consumes: tidak ada
- Produces:
  - `QRType`, `QRDeliveryMode`, `QRTypeConfig`, `QR_TYPES`
  - `UrlContent`, `VCardContent`, `PdfContent`, `ImageItem`, `ImageContent`, `SocialPlatform`, `SocialChannel`, `SocialContent`, `VideoItem`, `VideoContent`, `OpeningHour`, `BusinessContent`, `MenuBadge`, `MenuItem`, `MenuCategory`, `MenuContent`, `QRContentData`
  - `QRDotType`, `QRCornerSquareType`, `QRCornerDotType`, `QRFrameType`, `QRColorMode`, `QRGradientType`, `QRStyleOptions`
  - `SavedQRCode`, `WizardStep`, `WizardState`
  - `DEFAULT_QR_STYLE: QRStyleOptions`
  - `createInitialContent(type: QRType): QRContentData`

- [ ] **Langkah 1: Pasang `qr-code-styling`**

Jalankan: `npm install qr-code-styling`
Ekspektasi: `qr-code-styling` masuk ke `dependencies` di `package.json`.

- [ ] **Langkah 2: Buat `sql_qr_codes_setup.sql`**

Sertakan: `CREATE TABLE IF NOT EXISTS public.qr_codes` dengan semua kolom & batasan ukuran JSONB `CHECK` dari Spesifikasi Bagian 3, indeks pada `short_code` dan `user_id`, RLS aktif dengan policy `authenticated` khusus pemilik (TANPA `anon SELECT` terbuka), RPC `SECURITY DEFINER` `get_public_qr(p_short_code text)` (mengambil baris aktif dan menaikkan `scan_count`), RPC `SECURITY DEFINER` `create_guest_qr(...)` (memvalidasi `qr_type`, menyisipkan `user_id = NULL`, mengembalikan baris baru), serta bucket storage `qr-assets` + policy-nya.

- [ ] **Langkah 3: Buat `src/types/qrGenerator.ts`**

Definisikan seluruh tipe, union literal (pakai `type`, jangan pernah pakai `enum` karena `erasableSyntaxOnly`), array `QR_TYPES` yang cocok persis dengan 8 label/deskripsi Bahasa Indonesia dari tangkapan layar spesifikasi, `DEFAULT_QR_STYLE` (`dotStyle: 'rounded'`, `fgColor: '#18181b'`, `bgColor: '#ffffff'`, `frameType: 'none'`, `frameText: 'SCAN ME'`, `errorCorrection: 'M'`), serta `createInitialContent(type: QRType): QRContentData` yang mengembalikan nilai awal bersih untuk masing-masing dari 8 jenis (termasuk `hours` 7 hari untuk `business`, 1 saluran kosong untuk `social`, 1 kategori+item kosong untuk `menu`).

- [ ] **Langkah 4: Cek tipe TypeScript**

Jalankan: `npx tsc -b`
Ekspektasi: Exit code `0` tanpa error.

- [ ] **Langkah 5: Commit**

```bash
git add package.json package-lock.json sql_qr_codes_setup.sql src/types/qrGenerator.ts
git commit -m "feat(qr): install qr-code-styling, add SQL migration and TypeScript domain models"
```

---

### Task 2: Helper QR Murni & Validator Keamanan (`src/lib/qrHelpers.ts`) — TDD

**Files:**
- Create: `src/lib/qrHelpers.ts`
- Test: `tests/qrHelpers.test.ts`

**Interfaces:**
- Consumes: `QRContentData`, `QRDeliveryMode`, `QRStyleOptions`, `VCardContent` dari `../types/qrGenerator.ts`
- Produces:
  - `normalizeUrl(raw: string): string`
  - `validateUrl(raw: string): boolean`
  - `sanitizeExternalUrl(raw: string): string`
  - `parseVideoEmbedUrl(raw: string): { provider: 'youtube' | 'vimeo' | 'direct' | 'link'; embedUrl: string }`
  - `buildVCardString(data: VCardContent): string`
  - `validateQRContent(content: QRContentData, mode: QRDeliveryMode): { isValid: boolean; errors: Record<string, string> }`
  - `resolveQRPayload(content: QRContentData, mode: QRDeliveryMode, dynamicUrl?: string): { data: string; byteLength: number; isOverflowRisk: boolean }`
  - `calculateRelativeLuminance(hex: string): number`
  - `getContrastRatio(hexA: string, hexB: string): number`
  - `checkQRScannability(style: QRStyleOptions): { ratio: number; isLowContrast: boolean; isInverted: boolean; warnings: string[] }`
  - `generateShortCode(length?: number): string`
  - `getQRDisplayTitle(content: QRContentData): string`
  - `validateLogoFileMeta(meta: { size: number; type: string }): { valid: boolean; error?: string }`

- [ ] **Langkah 1: Tulis unit test yang gagal terlebih dahulu di `tests/qrHelpers.test.ts`**

Uji seluruh perilaku murni termasuk setiap kasus pada Fokus Review:
```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUrl,
  validateUrl,
  sanitizeExternalUrl,
  parseVideoEmbedUrl,
  buildVCardString,
  validateQRContent,
  resolveQRPayload,
  checkQRScannability,
  validateLogoFileMeta,
} from '../src/lib/qrHelpers.ts';
import { createInitialContent, DEFAULT_QR_STYLE } from '../src/types/qrGenerator.ts';

test('URL normalization and XSS blocking', () => {
  assert.equal(normalizeUrl('example.com/cv'), 'https://example.com/cv');
  assert.equal(validateUrl('https://freebuildcv.tech'), true);
  assert.equal(validateUrl('not a valid url'), false);
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), '#');
  assert.equal(sanitizeExternalUrl('data:text/html,<script>'), '#');
  assert.equal(sanitizeExternalUrl('mailto:hi@test.com'), 'mailto:hi@test.com');
  assert.equal(sanitizeExternalUrl('wa.me/628123'), 'https://wa.me/628123');
});

test('Video URL parser isolates YouTube/Vimeo safely', () => {
  assert.deepEqual(parseVideoEmbedUrl('https://youtu.be/dQw4w9WgXcQ'), {
    provider: 'youtube',
    embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
  });
  assert.deepEqual(parseVideoEmbedUrl('https://vimeo.com/12345678'), {
    provider: 'vimeo',
    embedUrl: 'https://player.vimeo.com/video/12345678',
  });
  assert.deepEqual(parseVideoEmbedUrl('https://cdn.site/clip.mp4'), {
    provider: 'direct',
    embedUrl: 'https://cdn.site/clip.mp4',
  });
  assert.deepEqual(parseVideoEmbedUrl('javascript:alert(1)'), {
    provider: 'link',
    embedUrl: '#',
  });
});

test('vCard 3.0 builder formats & flags static overflow above 1800 bytes', () => {
  const vcard = createInitialContent('vcard');
  if (vcard.type !== 'vcard') throw new Error('expected vcard');
  vcard.firstName = 'Budi';
  vcard.lastName = 'Santoso';
  vcard.phoneMobile = '+628123456789';
  const encoded = buildVCardString(vcard);
  assert.match(encoded, /^BEGIN:VCARD\r?\nVERSION:3\.0/);
  assert.match(encoded, /N:Santoso;Budi;;;/);
  assert.match(encoded, /TEL;TYPE=CELL:\+628123456789/);

  const huge = { ...vcard, bio: 'a'.repeat(2100) };
  const payload = resolveQRPayload(huge, 'static');
  assert.equal(payload.isOverflowRisk, true);
  assert.ok(payload.byteLength > 1800);
});

test('Validation rejects empty/invalid inputs across all 8 QR types', () => {
  for (const t of ['url', 'vcard', 'pdf', 'image', 'social', 'video', 'business', 'menu'] as const) {
    const empty = createInitialContent(t);
    assert.equal(validateQRContent(empty, t === 'url' ? 'static' : 'dynamic').isValid, false, `empty ${t} must fail`);
  }

  const biz = createInitialContent('business');
  if (biz.type === 'business') {
    biz.companyName = 'Kopi Nusantara';
    assert.equal(validateQRContent(biz, 'dynamic').isValid, true);
  }

  const dynUnpub = resolveQRPayload(biz, 'dynamic');
  assert.equal(dynUnpub.data, 'https://www.freebuildcv.tech/q/preview');
  const dynPub = resolveQRPayload(biz, 'dynamic', 'https://www.freebuildcv.tech/q/Ab12Cd34');
  assert.equal(dynPub.data, 'https://www.freebuildcv.tech/q/Ab12Cd34');
});

test('Scannability detects low contrast and inverted QR styles', () => {
  const lowContrast = { ...DEFAULT_QR_STYLE, fgColor: '#d4d4d8', bgColor: '#ffffff' };
  const check1 = checkQRScannability(lowContrast);
  assert.equal(check1.isLowContrast, true);
  assert.ok(check1.warnings.length > 0);

  const inverted = { ...DEFAULT_QR_STYLE, fgColor: '#ffffff', bgColor: '#000000' };
  const check2 = checkQRScannability(inverted);
  assert.equal(check2.isInverted, true);
});

test('Logo file validator rejects oversized or unsupported MIME files', () => {
  assert.equal(validateLogoFileMeta({ size: 500_000, type: 'image/png' }).valid, true);
  assert.equal(validateLogoFileMeta({ size: 2_500_000, type: 'image/png' }).valid, false);
  assert.equal(validateLogoFileMeta({ size: 100_000, type: 'application/pdf' }).valid, false);
});
```

- [ ] **Langkah 2: Jalankan test untuk memverifikasi kegagalan awal**

Jalankan: `node --experimental-strip-types --test tests/qrHelpers.test.ts`
Ekspektasi: FAIL (`Cannot find module '../src/lib/qrHelpers.ts'`).

- [ ] **Langkah 3: Implementasikan `src/lib/qrHelpers.ts`**

Impor tipe secara eksplisit memakai `import type { ... } from '../types/qrGenerator.ts'`.
- `sanitizeExternalUrl`: memangkas spasi, memblokir `javascript:`, `vbscript:`, `data:`, mengizinkan `mailto:`/`tel:`/`http(s):`, menambahkan prefiks `https://` pada string domain seperti `example.com`, mengembalikan `'#'` jika kosong atau tidak valid.
- `validateUrl`: menolak string berspasi atau tanpa host/titik (kecuali `localhost`), mengecek konstruktor `URL` setelah normalisasi.
- `parseVideoEmbedUrl`: memvalidasi via `sanitizeExternalUrl`; mem-parsing ID YouTube (`youtube.com/watch?v=`, `youtu.be/`, `youtube.com/shorts/`) berpola `[A-Za-z0-9_-]{11}`, ID angka Vimeo, atau akhiran `.mp4`/`.webm`.
- `buildVCardString`: meng-escape `\`, `,`, `;`, `\n` pada kolom vCard (`N`, `FN`, `ORG`, `TITLE`, `TEL;TYPE=CELL`, `TEL;TYPE=WORK`, `EMAIL`, `URL`, `ADR;TYPE=WORK`, `NOTE`), diakhiri `END:VCARD`.
- `resolveQRPayload`: untuk `url` mengembalikan `normalizeUrl(content.url)`; untuk `vcard` mode `static` mengembalikan `buildVCardString`; untuk `pdf`/`image`/`video` mode `static` mengembalikan URL utama langsung; untuk `social` mode `static` mengembalikan URL saluran pertama; selain itu mengembalikan `dynamicUrl || 'https://www.freebuildcv.tech/q/preview'`. Memakai `new TextEncoder().encode(data).length` untuk menghitung byte UTF-8; mengatur `isOverflowRisk = byteLength > 1800`.
- `checkQRScannability`: mengonversi `#rrggbb` ke luminansi relatif WCAG `L`, memeriksa stop warna depan terhadap latar belakang efektif (`bgTransparent ? '#ffffff' : style.bgColor`), mengatur `isLowContrast = ratio < 3.0`, `isInverted = fgLum > bgLum`.

- [ ] **Langkah 4: Jalankan test & cek tipe**

Jalankan: `node --experimental-strip-types --test tests/qrHelpers.test.ts && npx tsc -b`
Ekspektasi: Semua test PASS, `tsc -b` selesai dengan kode 0.

- [ ] **Langkah 5: Commit**

```bash
git add src/lib/qrHelpers.ts tests/qrHelpers.test.ts
git commit -m "feat(qr): add pure QR validation, vCard, embed parsing, and contrast checks"
```

---

### Task 3: Komposer Bingkai SVG & Preset (`src/lib/qrFrameSvg.ts`, `src/lib/qrPresets.ts`) — TDD

**Files:**
- Create: `src/lib/qrFrameSvg.ts`
- Create: `src/lib/qrPresets.ts`
- Test: `tests/qrFrameSvg.test.ts`

**Interfaces:**
- Consumes: `QRFrameType`, `QRStyleOptions`, `QRType`, `QRContentData` dari `../types/qrGenerator.ts`
- Produces:
  - `QR_FRAME_PRESETS: readonly { id: QRFrameType; label: string }[]`
  - `escapeXml(str: string): string`
  - `extractSvgInnerContent(rawSvg: string): { viewBox: string; inner: string }`
  - `composeFramedSvg(rawQrSvg: string, style: QRStyleOptions): { svg: string; width: number; height: number }`
  - `QR_LOGO_PRESETS: readonly { id: string; label: string; dataUrl: string }[]`
  - `COLOR_PALETTE_PRESETS: readonly string[]`
  - `getDummyQRContent(type: QRType): QRContentData`

- [ ] **Langkah 1: Tulis unit test yang gagal terlebih dahulu di `tests/qrFrameSvg.test.ts`**

Test:
```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeXml, composeFramedSvg } from '../src/lib/qrFrameSvg.ts';
import { DEFAULT_QR_STYLE } from '../src/types/qrGenerator.ts';

const MOCK_QR_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="#fff"/></svg>';

test('escapeXml neutralizes XML metacharacters in CTA labels', () => {
  assert.equal(escapeXml('Kopi & Kue <2026> "Top"'), 'Kopi &amp; Kue &lt;2026&gt; &quot;Top&quot;');
});

test('composeFramedSvg returns original proportions when frameType is none', () => {
  const res = composeFramedSvg(MOCK_QR_SVG, { ...DEFAULT_QR_STYLE, frameType: 'none' });
  assert.equal(res.width, 300);
  assert.equal(res.height, 300);
  assert.match(res.svg, /^<svg[^>]+viewBox="0 0 300 300"/);
});

test('composeFramedSvg embeds QR and escaped CTA text for badge-bottom', () => {
  const res = composeFramedSvg(MOCK_QR_SVG, {
    ...DEFAULT_QR_STYLE,
    frameType: 'badge-bottom',
    frameText: 'Menu & Harga <Baru>',
    frameColor: '#18181b',
    frameTextColor: '#ffffff',
  });
  assert.ok(res.height > res.width);
  assert.match(res.svg, /Menu &amp; Harga &lt;Baru&gt;/);
  assert.ok(!res.svg.includes('<Baru>'));
});
```

- [ ] **Langkah 2: Jalankan test untuk memverifikasi kegagalan awal**

Jalankan: `node --experimental-strip-types --test tests/qrFrameSvg.test.ts`
Ekspektasi: FAIL (`Cannot find module '../src/lib/qrFrameSvg.ts'`).

- [ ] **Langkah 3: Implementasikan `src/lib/qrFrameSvg.ts` dan `src/lib/qrPresets.ts`**

- Di `qrFrameSvg.ts`: implementasikan `escapeXml`, `extractSvgInnerContent` (melepas tag pembungkus `<svg ...>`, membaca lebar/tinggi `viewBox` dengan default `300`), serta `composeFramedSvg` yang mendukung seluruh 6 geometri `QRFrameType` (`none`, `basic`, `badge-bottom`, `badge-top`, `card`, `minimal-corners`) menggunakan `<svg x="..." y="..." width="300" height="300" viewBox="...">` bersarang agar hasil di segala ukuran tetap identik. Batasi teks CTA maks 24 karakter dan escape dengan `escapeXml`.
- Di `qrPresets.ts`: sediakan 10 ikon preset data-URI SVG ringan (`data:image/svg+xml;utf8,...` yang di-encode dengan `encodeURIComponent`) untuk Scan, Web, vCard, PDF, Gambar, Media Sosial, Video, Toko/Bisnis, Menu, WhatsApp; palet warna zinc/brand; serta `getDummyQRContent(type)` yang mengembalikan contoh data Bahasa Indonesia realistis untuk seluruh 8 jenis QR.

- [ ] **Langkah 4: Jalankan test & cek tipe**

Jalankan: `node --experimental-strip-types --test tests/*.test.ts && npx tsc -b`
Ekspektasi: Semua test PASS, `tsc -b` selesai dengan kode 0.

- [ ] **Langkah 5: Commit**

```bash
git add src/lib/qrFrameSvg.ts src/lib/qrPresets.ts tests/qrFrameSvg.test.ts
git commit -m "feat(qr): add XML-safe SVG frame composer, icon presets, and sample data"
```

---

### Task 4: Mesin Ekspor Browser (`src/lib/qrExport.ts`) & Layanan Supabase (`src/lib/qrService.ts`)

**Files:**
- Create: `src/lib/qrExport.ts`
- Create: `src/lib/qrService.ts`

**Interfaces:**
- Consumes: `QRStyleOptions`, `QRType`, `QRDeliveryMode`, `QRContentData`, `SavedQRCode`, `VCardContent` (`../types/qrGenerator`); `composeFramedSvg` (`./qrFrameSvg`); `buildVCardString`, `generateShortCode` (`./qrHelpers`); `supabase` (`./supabase`)
- Produces:
  - `buildQRCodeStylingOptions(data: string, style: QRStyleOptions, size?: number)`
  - `exportQRFile(data: string, style: QRStyleOptions, format: 'png' | 'jpg' | 'svg', filename?: string): Promise<void>`
  - `copyQRToClipboard(data: string, style: QRStyleOptions): Promise<void>`
  - `downloadVCardFile(vcard: VCardContent): void`
  - `uploadQRAsset(file: File, userId: string): Promise<string>`
  - `publishQRCode(params: { qrType: QRType; mode: QRDeliveryMode; title: string; content: QRContentData; style: QRStyleOptions; isAuthenticated: boolean; existingId?: string }): Promise<{ data: SavedQRCode | null; error: Error | null }>`
  - `getUserQRCodes(): Promise<{ data: SavedQRCode[] | null; error: Error | null }>`
  - `getQRCodeById(id: string): Promise<{ data: SavedQRCode | null; error: Error | null }>`
  - `getPublicQRByCode(shortCode: string): Promise<{ data: SavedQRCode | null; error: Error | null }>`
  - `deleteQRCode(id: string): Promise<{ error: Error | null }>`

- [ ] **Langkah 1: Buat `src/lib/qrExport.ts`**

- `buildQRCodeStylingOptions`: memetakan `QRStyleOptions` menjadi konfigurasi konstruktor `QRCodeStyling` (`type: 'svg'`, `dotsOptions` solid atau gradien hasil konversi `gradientRotationDeg` ke radian, `cornersSquareOptions`, `cornersDotOptions`, `backgroundOptions`, `imageOptions: { hideBackgroundDots: true, imageSize: style.logoSize, margin: style.logoMargin, crossOrigin: 'anonymous' }`, `qrOptions: { errorCorrectionLevel: effectiveEC }` — otomatis memaksakan `'H'` bila logo terpasang!).
- `renderFramedBlob`: membuat instance `QRCodeStyling` sementara beresolusi tinggi (`1024px` PNG/JPG, `300px` SVG), membaca `.getRawData('svg')`, meneruskan teks SVG ke `composeFramedSvg`, lalu untuk `'svg'` mengembalikan Blob SVG langsung; untuk `'png'`/`'jpg'`, menggambar SVG ke atas `<canvas>` offscreen dengan latar putih opsional untuk JPG (`bgTransparent` ditimpa saat JPG), mengekspor via `canvas.toBlob`, serta membersihkan Object URL sementara.
- `downloadVCardFile`: memicu unduhan file `.vcf` dari `buildVCardString`.

- [ ] **Langkah 2: Buat `src/lib/qrService.ts`**

- `uploadQRAsset`: memvalidasi ukuran file (gambar `<= 2MB`, pdf `<= 5MB`), mengunggah ke bucket `qr-assets` di `${userId}/${Date.now()}-${random}.${ext}`, mengembalikan URL publik.
- `publishQRCode`: jika `isAuthenticated && existingId`, memperbarui baris `qr_codes` milik `auth.uid()` (mempertahankan `short_code` yang sama); jika `isAuthenticated && !existingId`, membuat `short_code` via `generateShortCode()` lalu menyisipkan ke `qr_codes`; jika tamu (`!isAuthenticated`), memanggil `supabase.rpc('create_guest_qr', ...)` (membuat `short_code` baru tiap publikasi tamu karena baris anonim tidak dapat diedit setelah dibuat). Catatan: batasi ukuran `logoDataUrl` berseri (`<= 30KB`) sebelum disimpan.
- `getPublicQRByCode`: memanggil `supabase.rpc('get_public_qr', { p_short_code: shortCode })` dan mengembalikan satu record `SavedQRCode` atau pesan error yang jelas.

- [ ] **Langkah 3: Cek tipe & Lint**

Jalankan: `npx tsc -b && npx eslint src/lib/qrExport.ts src/lib/qrService.ts`
Ekspektasi: Nol error TypeScript maupun ESLint.

- [ ] **Langkah 4: Commit**

```bash
git add src/lib/qrExport.ts src/lib/qrService.ts
git commit -m "feat(qr): add framed SVG/PNG/JPG export composer and Supabase QR service"
```

---

### Task 5: Komponen Langkah 1 & Navigasi (`QRTypeSelector.tsx`, `QRStepIndicator.tsx`)

**Files:**
- Create: `src/components/qr-generator/QRTypeSelector.tsx`
- Create: `src/components/qr-generator/QRStepIndicator.tsx`

**Interfaces:**
- Consumes: `QRType`, `QRTypeIconName`, `QR_TYPES`, `WizardStep` (`../../types/qrGenerator`)
- Produces:
  - `QRTypeSelector` — `(props: { selected: QRType | null; onSelect: (type: QRType) => void; onHover?: (type: QRType | null) => void }) => ReactElement`
  - `QRStepIndicator` — `(props: { currentStep: WizardStep; maxReachedStep: WizardStep; onStepClick: (step: WizardStep) => void }) => ReactElement`

- [ ] **Langkah 1: Buat `src/components/qr-generator/QRTypeSelector.tsx`**

Petakan `QRTypeIconName` lewat objek lookup bertipe `Record<QRTypeIconName, LucideIcon>` (`Link2`, `Contact`, `FileText`, `Image`, `Share2`, `Video`, `Store`, `UtensilsCrossed`). Render grid 2 kolom sesuai tangkapan layar & estetika FreeBuild CV (`rounded-2xl border border-zinc-200`, saat terpilih `border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/15`, lencana pil `PALING BANYAK DIGUNAKAN` pada `url`). Tampilkan lencana mode pengiriman halus (`Langsung` vs `Halaman Digital`) di tiap kartu. Picu `onHover` saat mouse masuk/keluar.

- [ ] **Langkah 2: Buat `src/components/qr-generator/QRStepIndicator.tsx`**

Render bilah 3 langkah (`1 Pilih jenis` → `2 Tambahkan konten` → `3 Kustomisasikan desain QR`) dengan langkah selesai/terjangkau dapat diklik (`step <= maxReachedStep`), menyamai stepper bawah pada tangkapan layar dan disesuaikan dengan aksen aktif `blue-600` serta selesai `zinc-900`.

- [ ] **Langkah 3: Cek tipe & Lint**

Jalankan: `npx tsc -b && npx eslint src/components/qr-generator/QRTypeSelector.tsx src/components/qr-generator/QRStepIndicator.tsx`
Ekspektasi: Nol error.

- [ ] **Langkah 4: Commit**

```bash
git add src/components/qr-generator/QRTypeSelector.tsx src/components/qr-generator/QRStepIndicator.tsx
git commit -m "feat(qr): add Step 1 QR type selector grid and 3-step indicator"
```

---

### Task 6: Primitif Form Bersama & 4 Form Pertama (`QRFormFields.tsx`, `SimpleLinkForms.tsx`, `VCardForm.tsx`)

**Files:**
- Create: `src/components/qr-generator/forms/QRFormFields.tsx`
- Create: `src/components/qr-generator/forms/SimpleLinkForms.tsx`
- Create: `src/components/qr-generator/forms/VCardForm.tsx`

**Interfaces:**
- Consumes: `UrlContent`, `PdfContent`, `ImageContent`, `VideoContent`, `VCardContent`, `QRDeliveryMode` (`../../../types/qrGenerator`); `uploadQRAsset` (`../../../lib/qrService`); `COLOR_PALETTE_PRESETS` (`../../../lib/qrPresets`); `showError`, `showToast` (`../../../utils/swal`)
- Produces:
  - `AccordionSection`, `TextField`, `TextAreaField`, `ThemeColorPicker`, `AssetUrlOrUploadField` dari `QRFormFields.tsx`
  - `SimpleLinkForms` — merender form `url`, `pdf`, `image` (pembuat galeri multi-gambar), `video` (daftar multi-video) dengan `errors: Record<string, string>` per kolom
  - `VCardForm` — merender seluruh kolom kontak vCard + info/peringatan mode Statis vs Dinamis jika `bio` atau `photoUrl` melebihi kapasitas statis

- [ ] **Langkah 1: Buat `src/components/qr-generator/forms/QRFormFields.tsx`**

Bangun primitif form yang dapat dipakai ulang (DRY):
- `AccordionSection`: kartu lipat sesuai pola FreeBuild CV (`rounded-2xl border border-zinc-200 bg-white overflow-hidden`) dengan ikon + judul + chevron.
- `TextField` / `TextAreaField`: seragam dengan `rounded-xl border border-zinc-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15`, bingkai merah + pesan `error` inline saat tidak valid.
- `ThemeColorPicker`: preset swatch warna + `<input type="color">` native + teks kode hex.
- `AssetUrlOrUploadField`: input teks URL + tombol unggah file opsional (mengecek `user` dari `useAuth()`; bila sudah login, mengunggah via `uploadQRAsset`; bila tamu, mengarahkan lewat `showToast('info', 'Login untuk upload file langsung, atau tempel URL publik di kolom ini.')`).

- [ ] **Langkah 2: Buat `src/components/qr-generator/forms/SimpleLinkForms.tsx`**

Tangani `url`, `pdf`, `image`, `video`:
- `url`: Input URL* + Label/Judul opsional.
- `pdf`: URL PDF* atau unggah (jika login) + Judul Dokumen* + Perusahaan + Deskripsi + Warna tema. (Pada mode `static`, sederhanakan UI untuk menonjolkan URL PDF langsung).
- `image`: Array dinamis `ImageItem` (`url*`, `caption`), tambah/hapus/ubah urutan, Judul Galeri*, Deskripsi, URL Situs Web, Warna tema.
- `video`: Array dinamis `VideoItem` (`url*`, `title`), Judul Showcase Video*, Perusahaan, Deskripsi, Label/URL CTA, Warna tema.

- [ ] **Langkah 3: Buat `src/components/qr-generator/forms/VCardForm.tsx`**

Susun akordeon terstruktur:
- *Informasi Pribadi* (Nama Depan*, Nama Belakang*, Perusahaan, Jabatan, URL/Unggah Foto Profil)
- *Kontak & Alamat* (Telepon Seluler*, Telepon Kerja, Email, Situs Web, Alamat)
- *Tentang & Tema* (Ringkasan/Bio, Warna Kartu — disembunyikan/diberi petunjuk nonaktif bila `mode === 'static'`).

- [ ] **Langkah 4: Cek tipe & Lint**

Jalankan: `npx tsc -b && npx eslint src/components/qr-generator/forms/`
Ekspektasi: Nol error.

- [ ] **Langkah 5: Commit**

```bash
git add src/components/qr-generator/forms/QRFormFields.tsx src/components/qr-generator/forms/SimpleLinkForms.tsx src/components/qr-generator/forms/VCardForm.tsx
git commit -m "feat(qr): add shared form fields and URL/PDF/Image/Video/vCard forms"
```

---

### Task 7: Form Dinamis Kaya Fitur & Orkestrator Langkah 2 (`SocialMediaForm.tsx`, `BusinessPageForm.tsx`, `MenuForm.tsx`, `QRContentForm.tsx`)

**Files:**
- Create: `src/components/qr-generator/forms/SocialMediaForm.tsx`
- Create: `src/components/qr-generator/forms/BusinessPageForm.tsx`
- Create: `src/components/qr-generator/forms/MenuForm.tsx`
- Create: `src/components/qr-generator/QRContentForm.tsx`

**Interfaces:**
- Consumes: `SocialContent`, `BusinessContent`, `MenuContent`, `QRType`, `QRContentData`, `QRDeliveryMode` (`../../types/qrGenerator`); primitif form dari `QRFormFields.tsx`; `SimpleLinkForms`, `VCardForm`; `getDummyQRContent` (`../../lib/qrPresets`)
- Produces:
  - `SocialMediaForm`, `BusinessPageForm`, `MenuForm`
  - `QRContentForm` — `(props: { type: QRType; mode: QRDeliveryMode; content: QRContentData; errors: Record<string, string>; payloadOverflow?: boolean; onModeChange: (mode: QRDeliveryMode) => void; onChange: (content: QRContentData) => void; onLoadSample: () => void }) => ReactElement`

- [ ] **Langkah 1: Buat `SocialMediaForm.tsx`**

Akordeon: *Profil Halaman* (Headline*, Bio, URL/Unggah Avatar, Warna Tema) + *Saluran Media Sosial* (daftar dinamis `SocialChannel` dengan `<select>` platform, label kustom, URL*, tombol naik/turun urutan & hapus; tombol cepat tambah platform untuk Instagram, TikTok, WhatsApp, YouTube, LinkedIn).

- [ ] **Langkah 2: Buat `BusinessPageForm.tsx`**

Akordeon: *Identitas Bisnis* (Nama Bisnis*, Tagline, Deskripsi, URL/Unggah Logo, Warna Tema), *Kontak & Lokasi* (Telepon, WhatsApp, Email, Situs Web, Alamat, Tautan Google Maps), *Jam Operasional* (baris 7 hari dengan toggle `Tutup` + input jam buka/tutup), *Tombol Aksi (CTA)* (Label & URL).

- [ ] **Langkah 3: Buat `MenuForm.tsx`**

Akordeon: *Info Restoran* (Nama Restoran*, Deskripsi, URL/Unggah Logo, Mata Uang `Rp`/`$`, Telepon, Alamat, Warna Tema) + *Kategori & Daftar Menu* (tambah/hapus/ubah nama `MenuCategory`, tambah/hapus bertingkat `MenuItem` berisi nama*, harga*, deskripsi, URL foto, serta pil multi-pilih `MenuBadge`: `Halal`, `Pedas`, `Favorit`, `Vegan`, `Baru`).

- [ ] **Langkah 4: Buat `src/components/qr-generator/QRContentForm.tsx`**

Bilah atas: lencana Jenis QR aktif, tombol **"Isi Data Contoh"** (memanggil `onLoadSample`), dan bila `QR_TYPES` menandai `supportsStatic === true` (`url`, `vcard`, `pdf`, `image`, `video`, `social`), tampilkan toggle tersegmentasi **"Halaman Digital (Dinamis)"** vs **"Link / Data Langsung (Statis)"** disertai tooltip ringkas tentang perbedaan link offline vs dinamis yang dapat diedit! Bila `payloadOverflow` bernilai true pada mode statis, tampilkan banner peringatan agar beralih ke mode Dinamis. Switch bersih berdasarkan `content.type` untuk merender form aktif.

- [ ] **Langkah 5: Cek tipe & Lint**

Jalankan: `npx tsc -b && npx eslint src/components/qr-generator/`
Ekspektasi: Nol error.

- [ ] **Langkah 6: Commit**

```bash
git add src/components/qr-generator/forms/SocialMediaForm.tsx src/components/qr-generator/forms/BusinessPageForm.tsx src/components/qr-generator/forms/MenuForm.tsx src/components/qr-generator/QRContentForm.tsx
git commit -m "feat(qr): add Social, Business, Menu forms and Step 2 orchestrator"
```

---

### Task 8: Kustomisasi Desain Langkah 3 (`QRCustomizer.tsx`)

**Files:**
- Create: `src/components/qr-generator/QRCustomizer.tsx`

**Interfaces:**
- Consumes: `QRStyleOptions`, `QRDotType`, `QRCornerSquareType`, `QRCornerDotType` (`../../types/qrGenerator`); `QR_FRAME_PRESETS` (`../../lib/qrFrameSvg`); `QR_LOGO_PRESETS`, `COLOR_PALETTE_PRESETS` (`../../lib/qrPresets`); `checkQRScannability`, `validateLogoFileMeta` (`../../lib/qrHelpers`); `AccordionSection`, `ThemeColorPicker` (`./forms/QRFormFields`); `showError` (`../../utils/swal`)
- Produces:
  - `QRCustomizer` — `(props: { style: QRStyleOptions; onChange: (style: QRStyleOptions) => void }) => ReactElement`

- [ ] **Langkah 1: Buat `src/components/qr-generator/QRCustomizer.tsx`**

Bangun 4 panel `AccordionSection` yang bisa dibuka-tutup + **Banner Peringatan Keterbacaan** di bagian atas yang digerakkan oleh `checkQRScannability(style)`:
1. **Bingkai & Teks CTA:** Kartu visual untuk seluruh 6 `QR_FRAME_PRESETS`; bila `frameType !== 'none'`, tampilkan input `Teks CTA` (`maxLength={24}`), `Warna Bingkai`, dan `Warna Teks CTA`.
2. **Pola QR & Warna:**
   - 6 tombol pola titik disertai ikon SVG mini tajam yang merepresentasikan `square`, `dots`, `rounded`, `extra-rounded`, `classy`, `classy-rounded`.
   - Toggle Solid vs Gradien; saat gradien aktif, tampilkan warna utama, warna kedua, jenis gradien (`linear`/`radial`), dan slider sudut (`0–360°`).
   - Pemilih warna latar belakang + centang `Latar Transparan` (disertai catatan bahwa ekspor JPG selalu memaksa latar putih).
3. **Sudut QR (Mata QR):** Pemilih sudut luar (`square`, `extra-rounded`, `dot`) + warna; pemilih titik dalam (`square`, `dot`) + warna.
4. **Logo Tengah & Koreksi Error:**
   - Grid ikon preset dari `QR_LOGO_PRESETS` + tombol reset "Tanpa Logo".
   - Unggah logo kustom divalidasi lewat `validateLogoFileMeta` (`PNG`, `JPG`, `SVG`, `WebP`, `<= 2MB`) lalu dibaca ketat menjadi base64 `data:` URL melalui `FileReader` (tampilkan `showError` bila tidak valid).
   - Slider ukuran (`0.20–0.40`) dan margin (`0–12px`) saat logo aktif.
   - Tombol pil koreksi error (`L`, `M`, `Q`, `H`); otomatis mengunci/menyarankan `'H'` selama logo terpasang.

- [ ] **Langkah 2: Cek tipe & Lint**

Jalankan: `npx tsc -b && npx eslint src/components/qr-generator/QRCustomizer.tsx`
Ekspektasi: Nol error.

- [ ] **Langkah 3: Commit**

```bash
git add src/components/qr-generator/QRCustomizer.tsx
git commit -m "feat(qr): add Step 3 design customizer with frames, patterns, gradients, logos, and contrast guard"
```

---

### Task 9: Perender Halaman Landing Bersama & Pratinjau Mockup Ponsel (`QRLandingRenderer.tsx`, `QRPreview.tsx`)

**Files:**
- Create: `src/components/qr-generator/landing/QRLandingRenderer.tsx`
- Create: `src/components/qr-generator/QRPreview.tsx`

**Interfaces:**
- Consumes: `QRContentData`, `QRStyleOptions`, `QRType`, `QRDeliveryMode`, `WizardStep` (`../../types/qrGenerator`); `sanitizeExternalUrl`, `parseVideoEmbedUrl`, `checkQRScannability` (`../../lib/qrHelpers`); `composeFramedSvg` (`../../lib/qrFrameSvg`); `buildQRCodeStylingOptions`, `exportQRFile`, `copyQRToClipboard`, `downloadVCardFile` (`../../lib/qrExport`); `showSuccess`, `showWarning`, `showError` (`../../../utils/swal`)
- Produces:
  - `QRLandingRenderer` — `(props: { content: QRContentData; isMockup?: boolean }) => ReactElement`
  - `QRPreview` — `(props: { step: WizardStep; hoveredType: QRType | null; mode: QRDeliveryMode; content: QRContentData | null; style: QRStyleOptions; qrPayload: string; isOverflowRisk: boolean; needsPublishToDownload: boolean; isPublishing: boolean; onPublish?: () => Promise<void> }) => ReactElement`

- [ ] **Langkah 1: Buat `src/components/qr-generator/landing/QRLandingRenderer.tsx`**

Render UI publik berorientasi mobile untuk tiap jenis QR secara aman tanpa `dangerouslySetInnerHTML`:
- `url`: Kartu pratinjau tujuan yang rapi + tombol "Buka Situs Web" (`sanitizeExternalUrl`).
- `vcard`: Header bermerek (`primaryColor`), fallback inisial avatar, nama/jabatan/perusahaan, tombol 1-klik **"Simpan Kontak (.vcf)"** (`downloadVCardFile`), baris aksi klik langsung Telepon/Email/Website/Maps, kartu bio.
- `pdf`: Kartu hero dokumen (`primaryColor`), judul, perusahaan, deskripsi, tombol CTA **"Buka / Download PDF"** (`sanitizeExternalUrl`).
- `image`: Header galeri + grid foto responsif 1/2 kolom disertai keterangan dan modal lightbox saat diklik.
- `social`: Link-in-Bio dengan avatar tengah, headline, bio, daftar tombol platform bergaya dengan lencana Lucide/teks (`sanitizeExternalUrl`).
- `video`: Header showcase video, merender `parseVideoEmbedUrl` (`<iframe>` `youtube`/`vimeo` dengan `allowFullScreen` & `referrerPolicy="strict-origin-when-cross-origin"`, `<video controls>` untuk `direct`, atau tombol tautan aman), ditambah tombol CTA.
- `business`: Header hero dengan logo, nama perusahaan/tagline, bilah aksi cepat (Telepon, WhatsApp, Maps), bagian Tentang Kami, kartu Jam Operasional 7 hari yang menyorot hari ini, tombol CTA.
- `menu`: Header restoran dengan logo, tab lompat kategori + kolom filter kata kunci (saat mode interaktif), kartu item menu menampilkan foto, judul, format `currency + price`, deskripsi, dan pil `MenuBadge`!

- [ ] **Langkah 2: Buat `src/components/qr-generator/QRPreview.tsx`**

- Bingkai Mockup Ponsel (bezel realistis, notch dynamic-island, status bar `"18:45"`, ikon sinyal/baterai sesuai tangkapan layar) dengan toggle tersegmentasi atas **`Pratinjau Halaman` | `Kode QR`**. Bawaan berada di `Pratinjau Halaman` selama Langkah 2 untuk tipe dinamis/halaman landing, dan otomatis pindah ke `Kode QR` di Langkah 1 & Langkah 3!
- Placeholder Langkah 1 saat `content === null`: tampilkan wireframe QR kosong (`LOGO`) + `"Pilih jenis Kode QR dari kolom di sebelah kiri"` (atau petunjuk aktif saat kursor menyorot kartu jenis QR).
- Rendering QR secara live: mount SVG `QRCodeStyling` dalam kontainer tersembunyi/termemoisasi, ekstrak SVG mentah dengan debounce (`200ms`), gabungkan via `composeFramedSvg(rawSvg, style)` ke kontainer pratinjau SVG responsif sehingga pengguna melihat **Bingkai + CTA + Matriks QR asli secara live**!
- Bilah ekspor di bawah ponsel:
  - Bila `needsPublishToDownload` (mode dinamis tanpa `publishedShortCode`): CTA utama **"Publikasikan & Aktifkan QR"** memanggil `onPublish`.
  - Setelah aktif/statis: tombol **`Download PNG`**, **`Download JPG`**, **`Download SVG`**, **`Salin PNG`**. Sebelum mengunduh bila `checkQRScannability(style)` memberi peringatan, tampilkan konfirmasi/peringatan santun via `showWarning` / lencana inline; di browser mobile, tampilkan tips halus `"Jika unduhan tidak otomatis, tekan lama gambar QR untuk menyimpan"`.

- [ ] **Langkah 3: Cek tipe & Lint**

Jalankan: `npx tsc -b && npx eslint src/components/qr-generator/`
Ekspektasi: Nol error.

- [ ] **Langkah 4: Commit**

```bash
git add src/components/qr-generator/landing/QRLandingRenderer.tsx src/components/qr-generator/QRPreview.tsx
git commit -m "feat(qr): add unified mobile landing renderer and dual-mode phone mockup preview"
```

---

### Task 10: Halaman & Integrasi Aplikasi (`QRGeneratorPage.tsx`, `PublicQRViewerPage.tsx`, `MyQRCodesPage.tsx`, Routing, Navbar, MainPage)

**Files:**
- Create: `src/pages/QRGeneratorPage.tsx`
- Create: `src/pages/PublicQRViewerPage.tsx`
- Create: `src/pages/MyQRCodesPage.tsx`
- Modify: `src/App.tsx:1-58`
- Modify: `src/components/Navbar.tsx:52-395`
- Modify: `src/pages/MainPage.tsx:425-432`

**Interfaces:**
- Consumes: Semua komponen QR (`QRTypeSelector`, `QRContentForm`, `QRCustomizer`, `QRPreview`, `QRStepIndicator`, `QRLandingRenderer`), `qrHelpers`, `qrService`, `qrPresets`, `useAuth`, `src/utils/swal`
- Produces: Halaman default-export yang dapat di-route + rute & navigasi terintegrasi

- [ ] **Langkah 1: Buat `src/pages/QRGeneratorPage.tsx`**

- Mendukung `/qr-generator` (baru) dan `/qr-generator/:id` (edit QR tersimpan milik user).
- Menyimpan draft wizard aktif ke `sessionStorage` (`qr_generator_draft`) pada sesi baru agar refresh tidak sengaja tidak menghapus Menu atau Halaman Bisnis yang sedang dikerjakan.
- Header berisi tombol kembali (`/`), judul `"Generator Kode QR"`, pil status simpan/publikasi (menampilkan tombol salin tautan `/q/:shortCode` live setelah terpublikasi!), dan tombol melayang `Preview` di mobile untuk membuka modal pratinjau layar penuh.
- Transisi langkah (`motion` `AnimatePresence`) dengan penanganan `Kembali`, `Lanjut`, serta `Publikasikan & Kustomisasi`:
  - Saat klik `Lanjut` di Langkah 2: jalankan `validateQRContent(content, mode)`. Bila tidak valid, pasang `errors` inline, scroll ke atas/error pertama, tampilkan `showToast('error', 'Lengkapi bidang wajib terlebih dahulu')`. Bila valid dan `mode === 'dynamic'` serta belum terpublikasi (atau ada perubahan edit), publikasikan/perbarui via `publishQRCode` agar `publishedShortCode` aktif sebelum masuk Langkah 3 (bila Supabase gagal, tampilkan pesan error yang jelas dan actionable alih-alih membuat QR pratinjau rusak!).
  - Pada Langkah 3: pengguna terlogin mendapatkan tombol **"Simpan QR ke Akun"** yang menyimpan baik `content` maupun `style` kustom (berlaku juga untuk QR statis), dan memperbarui `style_options` di DB setiap kali disimpan ulang.
- Modal `showInfo` ringan saat kunjungan pertama menjelaskan mode QR Statis vs Dinamis (dapat ditutup, muncul sekali per sesi via `sessionStorage`).

- [ ] **Langkah 2: Buat `src/pages/PublicQRViewerPage.tsx`**

- Membaca `useParams<{ shortCode: string }>()`. Memanggil `getPublicQRByCode(shortCode)`.
- Merender spinner loading, halaman 404/nonaktif rapi bila tidak ditemukan, atau viewport mobile penuh rata tengah (`max-w-lg mx-auto min-h-screen bg-white shadow-sm`) berisi `<QRLandingRenderer content={qr.content_data} />` + tautan footer tipis non-intrusif `"Dibuat dengan FreeBuild CV"`. Mengatur `document.title = qr.title`.

- [ ] **Langkah 3: Buat `src/pages/MyQRCodesPage.tsx`**

- Dasbor berproteksi dengan estetika senada `MyResumesPage.tsx`: menampilkan daftar kartu dari `getUserQRCodes()` berisi lencana jenis QR, chip `scan_count`, tombol salin tautan singkat, `Edit` (`/qr-generator/:id`), modal cepat `Lihat QR` (`QRCodeStyling` + unduh cepat PNG/SVG), dan `Hapus` (`showDeleteConfirm` + `deleteQRCode`).

- [ ] **Langkah 4: Sambungkan rute & navigasi di `src/App.tsx`, `src/components/Navbar.tsx`, `src/pages/MainPage.tsx`**

- `src/App.tsx`: Lazy import `QRGeneratorPage`, `PublicQRViewerPage`, `MyQRCodesPage`; tambahkan rute `/qr-generator`, `/qr-generator/:id`, `/q/:shortCode`, `/my-qr-codes` (dibungkus `ProtectedRoute` + `Suspense`).
- `src/components/Navbar.tsx`: Sembunyikan Navbar bila `location.pathname.startsWith('/q/')`. Ganti `const routeLinks: any[] = []` menjadi `RouteLink[]` bertipe berisi `{ to: '/qr-generator', label: 'QR Generator', icon: QrCode }`. Tambahkan item `Riwayat QR Code` (`/my-qr-codes`) di dropdown profil baik versi desktop maupun mobile.
- `src/pages/MainPage.tsx`: Pertahankan grid Template CV 4 kolom (`3 template CV + 1 Coming Soon`) tetap simetris, lalu tambahkan **Kartu Sorotan QR Code Generator** ramping tepat di bawah grid (nuansa gelap zinc/biru senada bagian Bento, visual ikon QR mini, chip ringkasan 8 jenis, dan tombol CTA menuju `/qr-generator`).

- [ ] **Langkah 5: Jalankan rangkaian verifikasi penuh**

Jalankan:
```bash
node --experimental-strip-types --test tests/*.test.ts && npx tsc -b && npm run lint && npm run build
```
Ekspektasi: Seluruh unit test PASS, build TypeScript ketat lulus, ESLint 0 error, build produksi Vite selesai bersih.

- [ ] **Langkah 6: Checklist verifikasi manual E2E (setelah `npm run dev`)**

- Buka `/qr-generator` melalui kartu di MainPage dan menu Navbar `QR Generator`
- Langkah 1: Pastikan hanya 8 jenis QR permintaan pengguna yang tampil, dan `URL Situs Web` menampilkan lencana `PALING BANYAK DIGUNAKAN`
- Langkah 2: Uji `Isi Data Contoh` pada `Menu`, `Halaman Bisnis`, `Media Sosial`, `vCard`, `PDF`, `Gambar`, `Video`, `URL`; pastikan `Pratinjau Halaman` memperbarui Mockup Ponsel secara live; pastikan validasi memblokir kolom kosong
- Langkah 3: Uji Bingkai + CTA (`Menu & Harga <Baru>`), Pola Titik, Gradien, Sudut QR, Logo Preset/Unggahan, dan peringatan kontras rendah; pastikan hasil ekspor SVG & PNG menyertakan Bingkai + CTA
- Uji `/q/:shortCode` (setelah menjalankan `sql_qr_codes_setup.sql` di Supabase): pastikan Navbar tersembunyi rapi dan tampilan mobile identik dengan mockup

- [ ] **Langkah 7: Commit**

```bash
git add src/pages/QRGeneratorPage.tsx src/pages/PublicQRViewerPage.tsx src/pages/MyQRCodesPage.tsx src/App.tsx src/components/Navbar.tsx src/pages/MainPage.tsx
git commit -m "feat(qr): add QRGeneratorPage, PublicQRViewerPage, MyQRCodesPage, and app navigation"
```
