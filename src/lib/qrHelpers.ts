import type {
  QRContentData,
  QRPasswordOptions,
  QRStyleOptions,
  UrlContent,
  VCardContent,
} from '../types/qrGenerator.ts';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);
const UNSAFE_SCHEME_PREFIX = /^(javascript|vbscript|data):/i;
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB (sesuai referensi UI)
const ALLOWED_LOGO_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/svg+xml',
  'image/webp',
]);

/**
 * Menambahkan protokol https:// secara otomatis bila belum ada.
 */
export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (UNSAFE_SCHEME_PREFIX.test(trimmed)) return trimmed;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Memvalidasi format URL situs web yang aman.
 */
export function validateUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed || /\s/.test(trimmed)) return false;
  if (UNSAFE_SCHEME_PREFIX.test(trimmed)) return false;

  const normalized = normalizeUrl(trimmed);
  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const host = parsed.hostname;
    if (!host) return false;
    return host === 'localhost' || (host.includes('.') && !host.startsWith('.') && !host.endsWith('.'));
  } catch {
    return false;
  }
}

/**
 * Menjaga tautan eksternal tetap aman dari skema berbahaya (XSS).
 */
export function sanitizeExternalUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed || UNSAFE_SCHEME_PREFIX.test(trimmed)) return '#';

  const normalized = normalizeUrl(trimmed);
  try {
    const parsed = new URL(normalized);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return '#';
    }
    return parsed.toString().replace(/\/$/, trimmed.endsWith('/') ? '/' : '');
  } catch {
    return '#';
  }
}

/**
 * Mengambil label domain/path ringkas untuk bilah alamat mockup ponsel.
 */
export function extractDisplayHost(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return 'www.mywebsite.com';
  try {
    const parsed = new URL(normalizeUrl(trimmed));
    const path = parsed.pathname === '/' ? '' : parsed.pathname;
    return `${parsed.hostname}${path}`;
  } catch {
    return trimmed;
  }
}

function validatePasswordOptions(
  passwordOpts: QRPasswordOptions,
  errors: Record<string, string>
): void {
  if (passwordOpts.enabled && !passwordOpts.alreadyProtected) {
    if (!passwordOpts.password || passwordOpts.password.trim().length < 4) {
      errors.password = 'Kata sandi minimal 4 karakter.';
    }
  } else if (
    passwordOpts.enabled &&
    passwordOpts.password.trim().length > 0 &&
    passwordOpts.password.trim().length < 4
  ) {
    errors.password = 'Kata sandi baru minimal 4 karakter.';
  }
}

/**
 * Validasi format email sederhana yang aman.
 */
export function validateEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validasi form URL Situs Web + Kata sandi opsional di Langkah 2 & 3.
 */
export function validateUrlQRForm(
  content: UrlContent,
  passwordOpts: QRPasswordOptions
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!content.url.trim()) {
    errors.url = 'URL Situs Web wajib diisi.';
  } else if (!validateUrl(content.url)) {
    errors.url = 'Masukkan URL situs web yang valid (misalnya https://www.mywebsite.com).';
  }

  validatePasswordOptions(passwordOpts, errors);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validasi form vCard + Kata sandi opsional di Langkah 2 & 3.
 */
export function validateVCardQRForm(
  content: VCardContent,
  passwordOpts: QRPasswordOptions
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!content.fullName.trim()) {
    errors.fullName = 'Nama lengkap wajib diisi.';
  }

  if (content.website.trim() && !validateUrl(content.website)) {
    errors.website = 'Masukkan URL situs web yang valid (misalnya https://adlzil.engineer).';
  }

  if (content.addressMode === 'url' && content.addressUrl.trim() && !validateUrl(content.addressUrl)) {
    errors.addressUrl = 'Masukkan URL alamat/peta yang valid.';
  }

  const invalidEmail = content.emails.some(
    (item) => item.email.trim().length > 0 && !validateEmailAddress(item.email)
  );
  if (invalidEmail) {
    errors.emails = 'Periksa format alamat email agar valid.';
  }

  const invalidSocial = content.socials.some(
    (item) => item.url.trim().length > 0 && !validateUrl(item.url)
  );
  if (invalidSocial) {
    errors.socials = 'Periksa URL tautan media sosial agar valid.';
  }

  validatePasswordOptions(passwordOpts, errors);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validasi terpadu untuk semua jenis konten QR aktif.
 */
export function validateQRForm(
  content: QRContentData,
  passwordOpts: QRPasswordOptions
): { isValid: boolean; errors: Record<string, string> } {
  if (content.type === 'vcard') {
    return validateVCardQRForm(content, passwordOpts);
  }
  return validateUrlQRForm(content, passwordOpts);
}

/**
 * Menentukan string yang di-encode ke matriks QR:
 * Seluruh QR URL selalu diarahkan ke tautan dinamis `/q/:shortCode` agar QR
 * baru aktif setelah pengguna masuk akun dan mengklik Simpan atau Unduh QR,
 * sekaligus mendukung proteksi sandi, pelacakan scan, dan edit URL tujuan.
 */
export function resolveUrlQRPayload(origin: string, shortCode: string): string {
  const cleanOrigin = origin.replace(/\/$/, '');
  return `${cleanOrigin}/q/${shortCode || 'preview'}`;
}

/**
 * Mengurai warna hex #rgb atau #rrggbb menjadi RGB 0..255.
 */
function parseHexRgb(hex: string): [number, number, number] | null {
  const cleaned = hex.trim().replace(/^#/, '');
  if (/^[0-9a-fA-F]{3}$/.test(cleaned)) {
    return [
      parseInt(cleaned[0] + cleaned[0], 16),
      parseInt(cleaned[1] + cleaned[1], 16),
      parseInt(cleaned[2] + cleaned[2], 16),
    ];
  }
  if (/^[0-9a-fA-F]{6}$/.test(cleaned)) {
    return [
      parseInt(cleaned.slice(0, 2), 16),
      parseInt(cleaned.slice(2, 4), 16),
      parseInt(cleaned.slice(4, 6), 16),
    ];
  }
  return null;
}

/**
 * Menghitung luminansi relatif WCAG (0..1).
 */
export function calculateRelativeLuminance(hex: string): number {
  const rgb = parseHexRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map((channel) => {
    const s = channel / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Menghitung rasio kontras WCAG antara dua warna hex.
 */
export function getContrastRatio(hexA: string, hexB: string): number {
  const lumA = calculateRelativeLuminance(hexA);
  const lumB = calculateRelativeLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Memeriksa keterbacaan QR (kontras warna rendah atau warna terbalik).
 */
export function checkQRScannability(style: QRStyleOptions): {
  ratio: number;
  isLowContrast: boolean;
  isInverted: boolean;
  warnings: string[];
} {
  const effectiveBg = style.bgTransparent ? '#FFFFFF' : style.bgColor;
  const fgRatio = getContrastRatio(style.dotColor, effectiveBg);
  const ratio = style.useGradient
    ? Math.min(fgRatio, getContrastRatio(style.gradientSecondaryColor, effectiveBg))
    : fgRatio;

  const fgLum = calculateRelativeLuminance(style.dotColor);
  const bgLum = calculateRelativeLuminance(effectiveBg);

  const isLowContrast = ratio < 3.0;
  const isInverted = fgLum > bgLum + 0.05;
  const warnings: string[] = [];

  if (isLowContrast) {
    warnings.push('Kontras warna titik dan latar terlalu rendah — kamera mungkin kesulitan memindai QR.');
  }
  if (isInverted) {
    warnings.push('Warna titik lebih terang dari latar belakang (QR terbalik) — beberapa kamera HP lama tidak mendukung pola ini.');
  }

  return { ratio, isLowContrast, isInverted, warnings };
}

/**
 * Memvalidasi metadata file logo / gambar unggahan (maks 5 MB, JPG/PNG/SVG/WebP/JFIF).
 */
export function validateLogoFileMeta(meta: { size: number; type: string; name?: string }): {
  valid: boolean;
  error?: string;
} {
  const mime = meta.type.toLowerCase();
  const isJfif = /\.jfif$/i.test(meta.name || '');
  if (!ALLOWED_LOGO_MIME.has(mime) && !isJfif) {
    return {
      valid: false,
      error: 'Format gambar harus PNG, JPG, SVG, atau WebP.',
    };
  }
  if (meta.size > MAX_LOGO_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Ukuran file gambar melebihi batas maksimum 5 MB.',
    };
  }
  return { valid: true };
}

/**
 * Menghasilkan short_code unik 8 karakter alfanumerik aman.
 */
export function generateShortCode(length = 8): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

/**
 * Menentukan judul QR yang rapi untuk ditampilkan di daftar tersimpan.
 */
export function getQRDisplayTitle(content: QRContentData): string {
  if (content.qrName.trim()) return content.qrName.trim();
  if (content.type === 'vcard') {
    return content.fullName.trim() || 'Kartu Nama vCard';
  }
  const host = extractDisplayHost(content.url);
  return host || 'Kode QR Situs Web';
}

function escapeVCardText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

function mapPhoneTypeToVcf(label: string): string {
  switch (label) {
    case 'Cara Kerja':
      return 'WORK,VOICE';
    case 'Ponsel':
      return 'CELL';
    case 'Rumah':
      return 'HOME';
    case 'Faks':
      return 'FAX';
    default:
      return 'VOICE';
  }
}

function mapEmailTypeToVcf(label: string): string {
  switch (label) {
    case 'Kerja':
      return 'WORK';
    case 'Pribadi':
      return 'HOME';
    default:
      return 'INTERNET';
  }
}

/**
 * Memformat data alamat manual vCard menjadi string satu baris yang rapi.
 */
export function formatVCardManualAddress(vcard: VCardContent): string {
  return [
    vcard.street.trim(),
    vcard.city.trim(),
    vcard.state.trim(),
    vcard.postalCode.trim(),
    vcard.country.trim(),
  ]
    .filter(Boolean)
    .join(', ');
}

/**
 * Menghasilkan payload standar vCard 3.0 (.vcf) agar dapat langsung disimpan ke kontak ponsel.
 */
export function generateVCardVcfString(vcard: VCardContent): string {
  const fullName = vcard.fullName.trim() || 'Kontak Baru';
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || fullName;
  const lastName = nameParts.slice(1).join(' ');

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCardText(fullName)}`,
    `N:${escapeVCardText(lastName)};${escapeVCardText(firstName)};;;`,
  ];

  if (vcard.company.trim()) {
    lines.push(`ORG:${escapeVCardText(vcard.company.trim())}`);
  }
  if (vcard.profession.trim()) {
    lines.push(`TITLE:${escapeVCardText(vcard.profession.trim())}`);
  }

  for (const phone of vcard.phones) {
    const cleanPhone = phone.number.trim();
    if (cleanPhone) {
      lines.push(`TEL;TYPE=${mapPhoneTypeToVcf(phone.label)}:${cleanPhone}`);
    }
  }

  for (const email of vcard.emails) {
    const cleanEmail = email.email.trim();
    if (cleanEmail) {
      lines.push(`EMAIL;TYPE=${mapEmailTypeToVcf(email.label)}:${cleanEmail}`);
    }
  }

  if (vcard.website.trim()) {
    const safeWeb = sanitizeExternalUrl(vcard.website);
    if (safeWeb !== '#') {
      lines.push(`URL:${safeWeb}`);
    }
  }

  if (vcard.addressMode === 'manual') {
    const hasManual =
      vcard.street.trim() ||
      vcard.city.trim() ||
      vcard.state.trim() ||
      vcard.postalCode.trim() ||
      vcard.country.trim();
    if (hasManual) {
      lines.push(
        `ADR;TYPE=WORK:;;${escapeVCardText(vcard.street.trim())};${escapeVCardText(
          vcard.city.trim()
        )};${escapeVCardText(vcard.state.trim())};${escapeVCardText(
          vcard.postalCode.trim()
        )};${escapeVCardText(vcard.country.trim())}`
      );
    }
  } else if (vcard.addressUrl.trim()) {
    const safeMap = sanitizeExternalUrl(vcard.addressUrl);
    if (safeMap !== '#') {
      lines.push(`URL;TYPE=Location:${safeMap}`);
    }
  }

  for (const social of vcard.socials) {
    const safeSocial = sanitizeExternalUrl(social.url);
    if (safeSocial !== '#') {
      lines.push(`X-SOCIALPROFILE;TYPE=${social.platform}:${safeSocial}`);
    }
  }

  if (vcard.summary.trim()) {
    lines.push(`NOTE:${escapeVCardText(vcard.summary.trim())}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Memicu pengunduhan file kontak `.vcf` pada perangkat pengguna.
 */
export function downloadVCardFile(vcard: VCardContent): void {
  const vcfContent = generateVCardVcfString(vcard);
  const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
  const slug =
    (vcard.fullName.trim() || vcard.qrName.trim() || 'kontak')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .toLowerCase() || 'kontak';
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Menghasilkan data URL SVG pola watermark diagonal bertingkat untuk layar pratinjau QR.
 */
export function buildWatermarkTileDataUrl(isDarkSurface = false): string {
  const fillHex = isDarkSurface ? '#ffffff' : '#0f172a';
  const fillOpacity = isDarkSurface ? '0.26' : '0.16';
  const tileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="150" viewBox="0 0 220 150"><g transform="rotate(-26 55 38)"><text x="55" y="34" text-anchor="middle" fill="${fillHex}" fill-opacity="${fillOpacity}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" letter-spacing="1.4">FREEBUILD CV</text><text x="55" y="49" text-anchor="middle" fill="${fillHex}" fill-opacity="${fillOpacity}" font-family="system-ui, -apple-system, sans-serif" font-size="9.5" font-weight="700" letter-spacing="1.2">PRATINJAU</text></g><g transform="rotate(-26 165 113)"><text x="165" y="109" text-anchor="middle" fill="${fillHex}" fill-opacity="${fillOpacity}" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800" letter-spacing="1.4">FREEBUILD CV</text><text x="165" y="124" text-anchor="middle" fill="${fillHex}" fill-opacity="${fillOpacity}" font-family="system-ui, -apple-system, sans-serif" font-size="9.5" font-weight="700" letter-spacing="1.2">PRATINJAU</text></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(tileSvg)}`;
}
