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

export interface VCardImageCropLayout {
  normalizedRot: number;
  baseW: number;
  baseH: number;
  drawW: number;
  drawH: number;
  dx: number;
  dy: number;
  maxOffsetX: number;
  maxOffsetY: number;
  clampedOffsetX: number;
  clampedOffsetY: number;
}

/**
 * Menghitung ukuran render & batas pergeseran (pan/crop) yang identik untuk pratinjau CSS maupun kanvas.
 */
export function computeVCardImageCropLayout(params: {
  srcW: number;
  srcH: number;
  frameW: number;
  frameH: number;
  zoom: number;
  rotateDeg: number;
  cover?: boolean;
  offsetX?: number;
  offsetY?: number;
}): VCardImageCropLayout {
  const safeSrcW = Math.max(1, params.srcW);
  const safeSrcH = Math.max(1, params.srcH);
  const safeFrameW = Math.max(1, params.frameW);
  const safeFrameH = Math.max(1, params.frameH);

  const normalizedRot = ((params.rotateDeg % 360) + 360) % 360;
  const swapped = normalizedRot === 90 || normalizedRot === 270;
  const baseW = swapped ? safeSrcH : safeSrcW;
  const baseH = swapped ? safeSrcW : safeSrcH;

  const baseScale =
    params.cover !== false
      ? Math.max(safeFrameW / baseW, safeFrameH / baseH)
      : Math.min(safeFrameW / baseW, safeFrameH / baseH);
  const finalScale = baseScale * Math.max(1, params.zoom);

  const drawW = safeSrcW * finalScale;
  const drawH = safeSrcH * finalScale;
  const renderedW = baseW * finalScale;
  const renderedH = baseH * finalScale;

  const maxShiftX = Math.max(0, (renderedW - safeFrameW) / 2);
  const maxShiftY = Math.max(0, (renderedH - safeFrameH) / 2);
  const maxOffsetX = maxShiftX / safeFrameW;
  const maxOffsetY = maxShiftY / safeFrameH;

  const rawX = params.offsetX ?? 0;
  const rawY = params.offsetY ?? 0;
  const clampedOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, rawX));
  const clampedOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, rawY));

  return {
    normalizedRot,
    baseW,
    baseH,
    drawW,
    drawH,
    dx: clampedOffsetX * safeFrameW,
    dy: clampedOffsetY * safeFrameH,
    maxOffsetX,
    maxOffsetY,
    clampedOffsetX,
    clampedOffsetY,
  };
}

export interface VCardWavePoint {
  x: number;
  y: number;
}

export interface VCardWaveLayer {
  d: string;
  opacity: number;
}

function createSeededWaveRng(seed: number): () => number {
  let state = (Math.floor(Math.abs(seed)) || 1) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function clampWaveY(y: number): number {
  return Math.max(2, Math.min(98, Math.round(y * 10) / 10));
}

function mirrorWavePoints(points: VCardWavePoint[]): VCardWavePoint[] {
  return [...points]
    .reverse()
    .map((p) => ({ x: Math.round((400 - p.x) * 10) / 10, y: p.y }));
}

function buildClosedSmoothWavePath(points: VCardWavePoint[]): string {
  if (points.length < 2) {
    return 'M 0 100 L 400 100 Z';
  }
  const cmds: string[] = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = Math.round((p1.x + (p2.x - p0.x) / 6) * 10) / 10;
    const cp1y = clampWaveY(p1.y + (p2.y - p0.y) / 6);
    const cp2x = Math.round((p2.x - (p3.x - p1.x) / 6) * 10) / 10;
    const cp2y = clampWaveY(p2.y - (p3.y - p1.y) / 6);
    cmds.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
  }
  cmds.push('L 400 100 L 0 100 Z');
  return cmds.join(' ');
}

function buildClosedPolygonWavePath(points: VCardWavePoint[]): string {
  if (points.length < 2) {
    return 'M 0 100 L 400 100 Z';
  }
  const cmds = [`M ${points[0].x} ${points[0].y}`];
  for (let i = 1; i < points.length; i++) {
    cmds.push(`L ${points[i].x} ${points[i].y}`);
  }
  cmds.push('L 400 100 L 0 100 Z');
  return cmds.join(' ');
}

function sampleWavePoints(
  shape: 'smooth' | 'organic' | 'layered' | 'arch' | 'sharp',
  complexity: number,
  amp: number,
  seed: number,
  heightScale = 1
): VCardWavePoint[] {
  const rng = createSeededWaveRng(seed);
  const scaledAmp = Math.min(86, amp * heightScale);
  const yBottom = 94;
  const yTop = Math.max(8, yBottom - scaledAmp);

  if (shape === 'arch') {
    const peakCount = Math.max(2, Math.min(4, Math.round(complexity / 2) + 1));
    const tiltBias = (rng() - 0.5) * scaledAmp * 0.45;
    const pts: VCardWavePoint[] = [];
    for (let i = 0; i <= peakCount; i++) {
      const t = i / peakCount;
      const x = Math.round(t * 400 * 10) / 10;
      const archCurve = Math.sin(t * Math.PI);
      const jitter = i === 0 || i === peakCount ? tiltBias * (i === 0 ? -1 : 1) : (rng() - 0.5) * 12;
      const y = clampWaveY(yBottom - archCurve * scaledAmp * 0.85 - scaledAmp * 0.1 + jitter);
      pts.push({ x, y });
    }
    return pts;
  }

  const steps = Math.max(2, Math.min(12, complexity * 2));
  const phase = rng() > 0.5 ? 1 : -1;
  const pts: VCardWavePoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const baseT = i / steps;
    const xJitter =
      i === 0 || i === steps || shape === 'smooth'
        ? 0
        : (rng() - 0.5) * (400 / steps) * (shape === 'sharp' ? 0.28 : 0.34);
    const x = Math.round(Math.max(0, Math.min(400, baseT * 400 + xJitter)) * 10) / 10;

    const isCrest = (i % 2 === 0 ? 1 : -1) * phase > 0;
    const baseY = isCrest ? yTop + scaledAmp * 0.12 : yBottom - scaledAmp * 0.12;
    const variance =
      shape === 'smooth'
        ? (rng() - 0.5) * scaledAmp * 0.18
        : (rng() - 0.5) * scaledAmp * 0.48;
    const y = clampWaveY(baseY + variance);
    pts.push({ x, y });
  }

  return pts;
}

/**
 * Menghasilkan path SVG gelombang deterministik (`viewBox="0 0 400 100"`) untuk pemisah bawah banner vCard.
 */
export function generateVCardBannerWavePaths(wave: {
  shape: 'smooth' | 'organic' | 'layered' | 'arch' | 'sharp';
  complexity: number;
  height: number;
  seed: number;
  flipX?: boolean;
}): {
  backdropLayers: VCardWaveLayer[];
  foregroundPath: string;
} {
  const complexity = Math.max(1, Math.min(6, Math.round(wave.complexity)));
  const amp = Math.max(20, Math.min(78, wave.height));
  const seed = Math.max(1, Math.round(wave.seed || 1));

  const formatPath = (pts: VCardWavePoint[], usePolygon: boolean) => {
    const ordered = wave.flipX ? mirrorWavePoints(pts) : pts;
    return usePolygon
      ? buildClosedPolygonWavePath(ordered)
      : buildClosedSmoothWavePath(ordered);
  };

  if (wave.shape === 'layered') {
    const backPts = sampleWavePoints('organic', complexity, amp, seed + 41, 1.08).map((p) => ({
      x: p.x,
      y: clampWaveY(p.y - 10),
    }));
    const midPts = sampleWavePoints('smooth', Math.max(2, complexity), amp, seed + 89, 0.92).map((p) => ({
      x: p.x,
      y: clampWaveY(p.y - 4),
    }));
    const frontPts = sampleWavePoints('smooth', complexity, amp, seed, 0.78);
    return {
      backdropLayers: [
        { d: formatPath(backPts, false), opacity: 0.34 },
        { d: formatPath(midPts, false), opacity: 0.55 },
      ],
      foregroundPath: formatPath(frontPts, false),
    };
  }

  const pts = sampleWavePoints(wave.shape, complexity, amp, seed, 1);
  return {
    backdropLayers: [],
    foregroundPath: formatPath(pts, wave.shape === 'sharp'),
  };
}

/**
 * Menormalkan daftar tag keahlian/layanan vCard: trim spasi, hapus kosong/duplikat,
 * batas panjang 32 karakter per tag dan maksimal 12 tag.
 */
export function normalizeVCardSkills(skills: readonly string[] | undefined): string[] {
  if (!Array.isArray(skills)) return [];
  const seen = new Set<string>();
  const normalized: string[] = [];

  for (const raw of skills) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim().slice(0, 32);
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(trimmed);
    if (normalized.length >= 12) break;
  }

  return normalized;
}
