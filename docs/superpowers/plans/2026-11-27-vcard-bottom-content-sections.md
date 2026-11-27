# Rencana Implementasi Konten Bagian Bawah & Aksi Cepat vCard

> **Untuk eksekutor agen:** WAJIB gunakan skill `superpowers:subagent-driven-development` (direkomendasikan) atau `superpowers:executing-plans` untuk mengerjakan rencana ini langkah demi langkah per task. Gunakan sintaks kotak centang (`- [ ]`) untuk melacak progres.

**Tujuan:** Mengisi area kosong di bagian bawah kartu digital vCard dengan modul berdaya guna tinggi (**Aksi Cepat**, **Tautan Pilihan / Portofolio**, **Keahlian & Status Ketersediaan**, kontrol **Kartu Terbuka Awal**, serta tombol **Bagikan Kartu Nama**) tanpa merusak proporsi layar iPhone 18 Pro Max (`440×956`) maupun batas ukuran data JSONB di database.

**Arsitektur:** Memperluas `VCardContent` dengan field opsional bertipe teks/array ringan (tanpa tambahan gambar base64 baru) serta fallback aman untuk data lama. UI input baru dipisahkan ke komponen fokus tersendiri (`QRVCardExtraSectionsEditor.tsx`) agar `QRVCardContentForm.tsx` tidak membengkak, seluruh logika pembersihan tag/ekstraksi aksi cepat/validasi URL diletakkan di fungsi murni `src/lib/qrHelpers.ts` lengkap dengan unit test, dan komponen `VCardMobileView.tsx` merender modul bawah secara adaptif terhadap kontras warna terang/gelap.

**Teknologi:** React 19, TypeScript (`strict`, `verbatimModuleSyntax`), Tailwind CSS v4, Motion (`motion/react`), Lucide React, Node test runner bawaan (`--experimental-strip-types`), Vite, Supabase PostgreSQL JSONB.

**Spesifikasi Acuan:** Diskusi & perencanaan interaktif (`2026-11-27`) untuk mengisi area putih di bawah 4 kartu akordeon (`Kontak`, `Perusahaan`, `Ringkasan`, `Media Sosial`) yang awalnya tertutup pada pratinjau `IPhone18ProMaxMockup` (`440×956`) maupun tampilan ponsel.

---

## Batasan Global

- **Batas ukuran payload database:** Total JSON `content_data` wajib tetap di bawah `65536` byte (`sql_qr_codes_setup.sql` `CHECK (octet_length(content_data::text) <= 65536)`); seluruh field baru hanya teks/array ringan (maksimal 5 tautan pilihan, maksimal 12 tag keahlian pendek).
- **Kompatibilitas mundur (*backward compatibility*):** Data `qr_codes` lama di Supabase yang belum memiliki field baru wajib tetap termuat mulus di `PublicQRViewerPage.tsx` dan `QRGeneratorPage.tsx` melalui `INITIAL_VCARD_CONTENT` dan operator nullish fallback (`??`).
- **Keamanan & Anti-XSS:** Setiap URL pada tautan pilihan wajib melewati `validateUrl()` di `validateVCardQRForm()` dan dibungkus dengan `sanitizeExternalUrl()` sebelum dirender ke `<a href>`.
- **Bahasa & Kontras Tema:** Seluruh label/placeholder memakai Bahasa Indonesia yang natural dan menyesuaikan kontras teks secara dinamis pada latar belakang sekunder terang (`#FFFFFF`) maupun gelap (`#111827`).
- **Presisi Responsif:** Tetap menjaga ukuran layar mockup iPhone 18 Pro Max (`440×956` CSS px) di desktop, tampilan penuh (*edge-to-edge*) di ponsel `<640px`, divider gelombang (*wave*) banner, serta lolos `tsc -b`, ESLint, dan build Vite.

## Fokus Review & Pengujian Kasus Tepi

- Payload vCard lama dari Supabase tanpa `customLinks`, `skills`, `availabilityStatus`, `workingHours`, `showQuickActions`, `showShareButton`, maupun `defaultOpenSection` -> wajib fallback aman tanpa error runtime `undefined.map`.
- Protokol berbahaya (`javascript:`, `vbscript:`, `data:text/html`) yang diinput ke `customLinks[].url` -> wajib ditolak oleh `validateVCardQRForm` melalui `errors.customLinks` serta dinetralkan menjadi `'#'` oleh `sanitizeExternalUrl()`.
- Tag `skills` berisi spasi kosong, duplikat beda kapital (`React` vs `react`), atau terlalu panjang -> `normalizeVCardSkills()` wajib melakukan `trim()`, deduplikasi *case-insensitive*, membuang string kosong, membatasi maksimal 12 tag dan panjang 32 karakter per tag.
- Skema warna `secondaryColor` gelap (misalnya `#111827` pada preset *Abu & Hitam*) -> modul bagian bawah (`customLinks`, `skills`, `workingHours`, tombol Bagikan) wajib membaca `calculateRelativeLuminance(secondaryBg)` untuk kontras teks/kartu agar tidak gelap di atas gelap.
- Seluruh field opsional dibiarkan kosong oleh pengguna -> modul `customLinks`, `skills`, `availabilityStatus`, dan `workingHours` tidak boleh menampilkan kotak kosong mengganggu di halaman publik.

---

## Struktur File Rencana

| File | Tanggung Jawab |
| --- | --- |
| `src/types/qrGenerator.ts` | Menambahkan tipe `VCardCustomLinkIcon`, `VCardCustomLink`, `VCardAccordionSectionKey`, `VCardDefaultOpenMode`, beserta properti opsional di `VCardContent` dan nilai default di `INITIAL_VCARD_CONTENT` |
| `src/lib/qrHelpers.ts` | Menambahkan helper murni `normalizeVCardSkills`, `deriveVCardQuickActions`, serta memperluas `validateVCardQRForm` untuk memeriksa validitas URL `customLinks` |
| `src/pages/QRGeneratorPage.tsx` | Mengamankan `coerceContentData` agar array `customLinks` dan `skills` dari `localStorage` / Supabase terkonversi dengan aman |
| `src/components/qr-generator/QRVCardExtraSectionsEditor.tsx` | Komponen editor modular baru untuk **Tautan Pilihan & Portofolio**, **Keahlian & Ketersediaan**, dan **Tata Letak & Tombol Cepat** |
| `src/components/qr-generator/QRVCardContentForm.tsx` | Memasang `<QRVCardExtraSectionsEditor />` di antara kartu 3 (`Jejaring sosial`) dan kartu 4 (`Layar selamat datang`), serta melengkapi `handleFillSample()` dengan contoh isi bawah |
| `src/components/qr-generator/VCardMobileView.tsx` | Merender lencana Ketersediaan, baris Aksi Cepat, `defaultOpenSection`, pill Keahlian, kartu Tautan Pilihan, Jam Kerja, dan tombol Bagikan Kartu Nama dengan penyesuaian kontras `secondaryBg` |
| `tests/qrHelpers.test.ts` | Unit test untuk seluruh helper baru, pemblokiran XSS URL, fallback nilai default, dan normalisasi tag keahlian |

---

### Task 1: Perluas Tipe Data, Nilai Default, Validasi, & Helper Normalisasi

**File:**
- Ubah: `src/types/qrGenerator.ts:96-146`, `src/types/qrGenerator.ts:295-326`
- Ubah: `src/lib/qrHelpers.ts:140-177`
- Ubah: `src/pages/QRGeneratorPage.tsx:74-98`
- Uji: `tests/qrHelpers.test.ts`

**Antarmuka:**
- Menghasilkan di `src/types/qrGenerator.ts`:
  ```ts
  export type VCardCustomLinkIcon = 'link' | 'file' | 'whatsapp' | 'calendar' | 'briefcase' | 'globe';
  export interface VCardCustomLink {
    id: string;
    title: string;
    subtitle: string;
    url: string;
    icon: VCardCustomLinkIcon;
  }
  export type VCardAccordionSectionKey = 'contact' | 'company' | 'summary' | 'social';
  export type VCardDefaultOpenMode = 'none' | VCardAccordionSectionKey;
  ```
  Serta properti opsional pada `VCardContent`: `availabilityStatus?: string`, `workingHours?: string`, `skills?: string[]`, `customLinks?: VCardCustomLink[]`, `showQuickActions?: boolean`, `showShareButton?: boolean`, `defaultOpenSection?: VCardDefaultOpenMode`.
- Menghasilkan di `src/lib/qrHelpers.ts`:
  ```ts
  export interface VCardQuickActionItem {
    id: 'call' | 'email' | 'website' | 'map';
    label: string;
    href: string;
    external: boolean;
  }
  export function normalizeVCardSkills(skills: readonly string[] | undefined): string[];
  export function deriveVCardQuickActions(content: VCardContent): VCardQuickActionItem[];
  ```

- [ ] **Langkah 1: Tulis unit test yang gagal terlebih dahulu untuk normalisasi keahlian, ekstraksi aksi cepat, dan validasi URL tautan pilihan**

Tambahkan skenario uji di `tests/qrHelpers.test.ts`:
```ts
test('normalizeVCardSkills trims, deduplicates case-insensitively, and enforces caps', () => {
  const result = normalizeVCardSkills([
    '  React ',
    'react',
    '',
    '   ',
    'TypeScript',
    'VeryLongSkillNameExceedingThirtyTwoCharsHere',
    'UI/UX',
  ]);
  assert.deepEqual(result, [
    'React',
    'TypeScript',
    'VeryLongSkillNameExceedingThirty',
    'UI/UX',
  ]);
  assert.equal(normalizeVCardSkills(undefined).length, 0);
});

test('deriveVCardQuickActions extracts safe contact actions only from filled fields', () => {
  const actions = deriveVCardQuickActions({
    ...INITIAL_VCARD_CONTENT,
    fullName: 'Adlildzil Arifah',
    phones: [{ id: 'p1', label: 'Ponsel', number: '+62 851-5669-3650' }],
    emails: [{ id: 'e1', label: 'Kerja', email: 'hello@adlzil.engineer' }],
    website: 'javascript:alert(1)',
    addressMode: 'url',
    addressUrl: 'https://maps.google.com/?q=Jakarta',
  });
  assert.deepEqual(
    actions.map((a) => [a.id, a.href]),
    [
      ['call', 'tel:+62851-5669-3650'],
      ['email', 'mailto:hello@adlzil.engineer'],
      ['map', 'https://maps.google.com/?q=Jakarta'],
    ]
  );
});

test('validateVCardQRForm blocks invalid or unsafe customLinks URLs', () => {
  const res = validateVCardQRForm(
    {
      ...INITIAL_VCARD_CONTENT,
      fullName: 'Adlildzil',
      customLinks: [
        { id: 'l1', title: 'XSS', subtitle: '', url: 'javascript:alert(1)', icon: 'link' },
      ],
    },
    { enabled: false, password: '' }
  );
  assert.equal(res.isValid, false);
  assert.ok(res.errors.customLinks);
});
```

- [ ] **Langkah 2: Jalankan unit test untuk memastikan test tersebut gagal sebelum implementasi**

Jalankan: `node --experimental-strip-types --test tests/qrHelpers.test.ts`
Hasil yang diharapkan: GAGAL karena `normalizeVCardSkills` dan `deriveVCardQuickActions` belum didefinisikan.

- [ ] **Langkah 3: Tambahkan tipe baru & nilai default di `src/types/qrGenerator.ts`**

Definisikan `VCardCustomLinkIcon`, `VCardCustomLink`, `VCardAccordionSectionKey`, `VCardDefaultOpenMode`, properti opsional pada `VCardContent`, serta nilai awal pada `INITIAL_VCARD_CONTENT` (`availabilityStatus: ''`, `workingHours: ''`, `skills: []`, `customLinks: []`, `showQuickActions: true`, `showShareButton: true`, `defaultOpenSection: 'none'`).

- [ ] **Langkah 4: Implementasikan `normalizeVCardSkills`, `deriveVCardQuickActions`, dan validasi `customLinks` di `src/lib/qrHelpers.ts` + perkuat `coerceContentData` di `src/pages/QRGeneratorPage.tsx`**

- `normalizeVCardSkills`: pangkas spasi (`trim()`), buang elemen kosong, potong panjang teks maksimal `32` karakter, deduplikasi memakai `Set` huruf kecil, dan batasi total maksimal `12` tag.
- `deriveVCardQuickActions`: ambil nomor telepon terisi pertama (`tel:`), email valid terisi pertama (`mailto:`), `website` melalui `sanitizeExternalUrl` (abaikan jika `'#'`), serta `addressUrl` jika `addressMode === 'url'` melalui `sanitizeExternalUrl` (abaikan jika `'#'`).
- `validateVCardQRForm`: periksa `const invalidCustomLink = (content.customLinks ?? []).some((item) => item.url.trim().length > 0 && !validateUrl(item.url));` lalu isi `errors.customLinks` jika tidak valid.
- `coerceContentData` di `QRGeneratorPage.tsx`: pastikan `skills` dan `customLinks` tetap berupa array valid jika berasal dari draft lama / Supabase.

- [ ] **Langkah 5: Jalankan unit test & cek TypeScript untuk memverifikasi Task 1 lulus**

Jalankan: `node --experimental-strip-types --test tests/qrHelpers.test.ts; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; npx tsc -b`
Hasil yang diharapkan: Seluruh skenario di `qrHelpers.test.ts` LULUS dan `tsc -b` selesai dengan kode keluar `0`.

- [ ] **Langkah 6: Commit Task 1**

```bash
git add src/types/qrGenerator.ts src/lib/qrHelpers.ts src/pages/QRGeneratorPage.tsx tests/qrHelpers.test.ts
git commit -m "feat(vcard): add types, defaults, normalization, and validation for bottom vCard sections"
```

---

### Task 2: Buat Komponen Editor Modular (`QRVCardExtraSectionsEditor.tsx`) & Contoh Isi Otomatis

**File:**
- Buat: `src/components/qr-generator/QRVCardExtraSectionsEditor.tsx`
- Ubah: `src/components/qr-generator/QRVCardContentForm.tsx:20-38`, `src/components/qr-generator/QRVCardContentForm.tsx:323-353`, `src/components/qr-generator/QRVCardContentForm.tsx:1075-1105`

**Antarmuka:**
- Menggunakan: `VCardContent`, `VCardCustomLink`, `VCardCustomLinkIcon`, `VCardDefaultOpenMode` dari `../../types/qrGenerator`; `normalizeVCardSkills` dari `../../lib/qrHelpers`.
- Menghasilkan:
  ```tsx
  export interface QRVCardExtraSectionsEditorProps {
    content: VCardContent;
    errors: Record<string, string>;
    onChange: (updated: VCardContent) => void;
  }
  ```

- [ ] **Langkah 1: Buat `QRVCardExtraSectionsEditor.tsx` berisi 3 kartu akordeon terstruktur**

Meliputi:
1. **Tautan Pilihan & Portofolio** (maksimal 5 item): tombol *"Tambah tautan"* untuk menambah `{ id, title: '', subtitle: '', url: '', icon: 'briefcase' }`; pemilih ikon per baris (`Briefcase`, `FileText`, `Globe`, `Calendar`, `MessageCircle`, `Link2`), input Judul CTA, Subjudul singkat, URL tujuan, tombol hapus baris, serta pesan validasi `errors.customLinks`.
2. **Keahlian & Ketersediaan**:
   - Input `availabilityStatus` disertai pilihan cepat klik (*"Terbuka untuk peluang kerja"*, *"Tersedia untuk proyek freelance"*, *"Buka konsultasi"*).
   - Input `workingHours` (placeholder `"misalnya Senin–Jumat, 09:00–17:00 WIB"`).
   - Input tag `skills` (tekan Enter / tombol *"Tambah"* + saran tag cepat seperti `UI/UX`, `React`, `Public Speaking`, `Konsultan`; chip bisa dihapus serta menampilkan penghitung `X/12`).
3. **Tata Letak & Tombol Cepat**:
   - Sakelar aktif/nonaktif **Baris Aksi Cepat** (`showQuickActions`: `Telepon`, `Email`, `Situs`, `Peta`).
   - Sakelar **Tombol Bagikan Profil** (`showShareButton`).
   - Pemilih **Kartu Terbuka Awal** (`defaultOpenSection`: `Semua Tertutup`, `Kontak`, `Perusahaan`, `Ringkasan`, `Media Sosial`).

- [ ] **Langkah 2: Pasang `<QRVCardExtraSectionsEditor />` ke `QRVCardContentForm.tsx` & lengkapi `handleFillSample()`**

- Letakkan `<QRVCardExtraSectionsEditor content={content} errors={errors} onChange={onChange} />` di antara kartu 3 (`Jejaring sosial`) dan kartu 4 (`Layar selamat datang`).
- Pada `handleFillSample()`, isikan contoh data yang realistis dan ringan:
  - `availabilityStatus`: `'Terbuka untuk peluang & kolaborasi'`
  - `workingHours`: `'Senin–Jumat, 09:00–17:00 WIB'`
  - `skills`: `['Full-Stack Development', 'UI/UX Design', 'React & TypeScript', 'System Architecture']`
  - `customLinks`: 2 item (*Lihat Portofolio* -> `https://adlzil.engineer`, *Hubungi via WhatsApp* -> `https://wa.me/6285156693650`)
  - `showQuickActions`: `true`, `showShareButton`: `true`, `defaultOpenSection`: `'summary'`

- [ ] **Langkah 3: Jalankan cek tipe TypeScript dan ESLint pada modul form yang diubah**

Jalankan: `npx tsc -b; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; npx eslint src/components/qr-generator/QRVCardExtraSectionsEditor.tsx src/components/qr-generator/QRVCardContentForm.tsx`
Hasil yang diharapkan: Kode keluar `0`, tanpa error/warning.

- [ ] **Langkah 4: Commit Task 2**

```bash
git add src/components/qr-generator/QRVCardExtraSectionsEditor.tsx src/components/qr-generator/QRVCardContentForm.tsx
git commit -m "feat(vcard): add extra links, skills, availability, and quick-layout controls to vCard editor"
```

---

### Task 3: Render Modul Bagian Bawah & Aksi Cepat di `VCardMobileView.tsx`

**File:**
- Ubah: `src/components/qr-generator/VCardMobileView.tsx:160-360`, `src/components/qr-generator/VCardMobileView.tsx:500-545`

**Antarmuka:**
- Menggunakan: `deriveVCardQuickActions`, `normalizeVCardSkills`, `calculateRelativeLuminance`, `sanitizeExternalUrl` dari `../../lib/qrHelpers`; `DEFAULT_VCARD_BANNER_WAVE` dan `VCardContent` dari `../../types/qrGenerator`.

- [ ] **Langkah 1: Sesuaikan state `defaultOpenSection` & adaptasi kontras `secondaryBg`**

- Inisialisasi dan sinkronisasi kartu terbuka awal dari `content.defaultOpenSection` (default `'none'`), sambil tetap menjaga interaksi buka-tutup pengguna saat pratinjau diklik.
- Hitung `isLightSecondary = calculateRelativeLuminance(secondaryBg) > 0.55` untuk menyesuaikan warna teks, chip keahlian, garis pembatas, dan tombol Bagikan pada skema gelap (`#111827`) maupun terang (`#FFFFFF`).

- [ ] **Langkah 2: Render seluruh modul opsional bagian bawah secara bersih & responsif**

1. **Lencana Status Ketersediaan (`availabilityStatus`):** Jika diisi, tampilkan badge status elegan dengan titik indikator hijau (`●`) tepat di hero bawah nama/profesi atau di bagian atas konten.
2. **Baris Aksi Cepat (`showQuickActions !== false`):** Jika `deriveVCardQuickActions(content).length > 0`, tampilkan deretan tombol ikon bulat ringkas 1-ketuk (`Telepon`, `Email`, `Situs Web`, `Peta`) memakai ikon Lucide (`Phone`, `Mail`, `Globe`, `MapPin`).
3. **Kartu Tautan Pilihan (`customLinks`):** Render item yang memiliki judul atau URL (dengan `href = sanitizeExternalUrl(item.url)`) langsung di bawah 4 kartu akordeon sebagai kartu CTA modern lengkap dengan lencana ikon, judul tebal, subjudul singkat opsional, dan ikon panah keluar.
4. **Keahlian & Layanan (`skills`):** Render `normalizeVCardSkills(content.skills)` di bawah Tautan Pilihan dalam bentuk *pill tags* membungkus rapi di bawah label *"Keahlian & Layanan"*.
5. **Jam Kerja (`workingHours`):** Jika diisi, tampilkan baris ringkas dengan ikon `Clock` di bawah daftar informasi.
6. **Tombol Bagikan Profil (`showShareButton !== false`):** Tombol outline penuh di bagian bawah (`Share2` + *"Bagikan Kartu Nama"*), memakai `navigator.share` dengan fallback salin tautan ke clipboard (`"Tautan disalin!"`).

- [ ] **Langkah 3: Jalankan cek TypeScript & ESLint pada `VCardMobileView.tsx`**

Jalankan: `npx tsc -b; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; npx eslint src/components/qr-generator/VCardMobileView.tsx`
Hasil yang diharapkan: Kode keluar `0`, tanpa error/warning.

- [ ] **Langkah 4: Commit Task 3**

```bash
git add src/components/qr-generator/VCardMobileView.tsx
git commit -m "feat(vcard): render quick actions, featured links, skills, availability, and share button in vCard view"
```

---

### Task 4: Verifikasi Regresi Penuh & Build Produksi

**File:**
- Uji: `tests/qrHelpers.test.ts`, `tests/qrFrameSvg.test.ts`

- [ ] **Langkah 1: Jalankan seluruh unit test QR, cek TypeScript global, ESLint seluruh file terkait, dan build Vite produksi**

Jalankan:
```powershell
node --experimental-strip-types --test tests/qrHelpers.test.ts tests/qrFrameSvg.test.ts; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; npx tsc -b; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; npx eslint src/types/qrGenerator.ts src/lib/qrHelpers.ts src/pages/QRGeneratorPage.tsx src/components/qr-generator/QRVCardExtraSectionsEditor.tsx src/components/qr-generator/QRVCardContentForm.tsx src/components/qr-generator/VCardMobileView.tsx; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }; npm run build
```
Hasil yang diharapkan: Seluruh unit test lulus, `tsc -b` selesai dengan kode `0`, ESLint bersih tanpa error, dan `npm run build` sukses.
