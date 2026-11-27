import type { QRFrameType, QRStyleOptions } from '../types/qrGenerator.ts';

export const QR_FRAME_PRESETS: readonly { id: QRFrameType; label: string }[] = [
  { id: 'none', label: 'Tanpa tepi' },
  { id: 'thin-bottom', label: 'Bingkai Tipis' },
  { id: 'bold-bottom', label: 'Bingkai Tebal' },
  { id: 'pill-bottom', label: 'Pil Bawah' },
  { id: 'badge-top', label: 'Badge Atas' },
  { id: 'speech-bottom', label: 'Balon Teks' },
  { id: 'ticket', label: 'Kupon' },
  { id: 'ribbon', label: 'Pita' },
  { id: 'bag', label: 'Tas Belanja' },
  { id: 'envelope', label: 'Amplop' },
  { id: 'laptop', label: 'Laptop' },
  { id: 'clipboard', label: 'Papan Klip' },
] as const;

export interface FrameLayout {
  width: number;
  height: number;
  qrX: number;
  qrY: number;
  qrSize: number;
}

export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function extractSvgInnerContent(rawSvg: string): { viewBox: string; inner: string } {
  const vbMatch = rawSvg.match(/viewBox=["']([^"']+)["']/i);
  const viewBox = vbMatch ? vbMatch[1] : '0 0 300 300';
  const innerMatch = rawSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  return {
    viewBox,
    inner: innerMatch ? innerMatch[1] : rawSvg,
  };
}

function normalizeColor(hex: string, fallback: string): string {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim()) ? hex.trim() : fallback;
}

export function getFrameLayout(frameType: QRFrameType): FrameLayout {
  switch (frameType) {
    case 'none':
      return { width: 300, height: 300, qrX: 0, qrY: 0, qrSize: 300 };
    case 'thin-bottom':
      return { width: 340, height: 400, qrX: 30, qrY: 28, qrSize: 280 };
    case 'bold-bottom':
      return { width: 340, height: 410, qrX: 30, qrY: 26, qrSize: 280 };
    case 'pill-bottom':
      return { width: 340, height: 420, qrX: 30, qrY: 28, qrSize: 280 };
    case 'badge-top':
      return { width: 340, height: 420, qrX: 30, qrY: 106, qrSize: 280 };
    case 'speech-bottom':
      return { width: 340, height: 425, qrX: 30, qrY: 28, qrSize: 280 };
    case 'ticket':
      return { width: 340, height: 420, qrX: 34, qrY: 30, qrSize: 272 };
    case 'ribbon':
      return { width: 360, height: 415, qrX: 40, qrY: 30, qrSize: 280 };
    case 'bag':
      return { width: 340, height: 450, qrX: 42, qrY: 86, qrSize: 256 };
    case 'envelope':
      return { width: 340, height: 435, qrX: 40, qrY: 88, qrSize: 260 };
    case 'laptop':
      return { width: 380, height: 400, qrX: 60, qrY: 34, qrSize: 260 };
    case 'clipboard':
      return { width: 340, height: 445, qrX: 40, qrY: 66, qrSize: 260 };
  }
}

function buildFrameParts(style: QRStyleOptions): {
  layout: FrameLayout;
  beforeQr: string;
  afterQr: string;
} {
  const layout = getFrameLayout(style.frameType);
  if (style.frameType === 'none') {
    return { layout, beforeQr: '', afterQr: '' };
  }

  const cta = escapeXml((style.frameText.trim() || 'Pindai saya!').slice(0, 24));
  const fColor = normalizeColor(style.frameColor, '#000000');
  const fText = normalizeColor(style.frameTextColor, '#FFFFFF');
  const cardBg = style.frameBgTransparent ? 'none' : normalizeColor(style.frameBgColor, '#FFFFFF');

  switch (style.frameType) {
    case 'thin-bottom':
      return {
        layout,
        beforeQr: `<rect x="10" y="10" width="320" height="380" rx="18" fill="${cardBg}" stroke="${fColor}" stroke-width="5"/>`,
        afterQr: `<text x="170" y="360" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="${fColor}">${cta}</text>`,
      };
    case 'bold-bottom':
      return {
        layout,
        beforeQr: `<rect x="8" y="8" width="324" height="394" rx="16" fill="${cardBg}" stroke="${fColor}" stroke-width="10"/>`,
        afterQr: `<rect x="8" y="330" width="324" height="72" rx="12" fill="${fColor}"/><text x="170" y="375" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="${fText}">${cta}</text>`,
      };
    case 'pill-bottom':
      return {
        layout,
        beforeQr: `<rect x="14" y="12" width="312" height="312" rx="22" fill="${cardBg}" stroke="${fColor}" stroke-width="8"/>`,
        afterQr: `<rect x="28" y="340" width="284" height="62" rx="14" fill="${fColor}"/><text x="170" y="380" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="25" font-weight="800" fill="${fText}">${cta}</text>`,
      };
    case 'badge-top':
      return {
        layout,
        beforeQr: `<rect x="28" y="14" width="284" height="58" rx="14" fill="${fColor}"/><text x="170" y="52" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="${fText}">${cta}</text><rect x="14" y="88" width="312" height="316" rx="20" fill="${cardBg}" stroke="${fColor}" stroke-width="8"/>`,
        afterQr: '',
      };
    case 'speech-bottom':
      return {
        layout,
        beforeQr: `<rect x="14" y="12" width="312" height="312" rx="20" fill="${cardBg}" stroke="${fColor}" stroke-width="8"/>`,
        afterQr: `<polygon points="170,330 154,348 186,348" fill="${fColor}"/><rect x="26" y="346" width="288" height="62" rx="14" fill="${fColor}"/><text x="170" y="386" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="${fText}">${cta}</text>`,
      };
    case 'ticket':
      return {
        layout,
        beforeQr: `<rect x="14" y="14" width="312" height="392" rx="16" fill="${cardBg}" stroke="${fColor}" stroke-width="7"/><circle cx="14" cy="326" r="14" fill="#FFFFFF" stroke="${fColor}" stroke-width="5"/><circle cx="326" cy="326" r="14" fill="#FFFFFF" stroke="${fColor}" stroke-width="5"/><line x1="36" y1="326" x2="304" y2="326" stroke="${fColor}" stroke-width="3" stroke-dasharray="8 6"/>`,
        afterQr: `<rect x="34" y="340" width="272" height="50" rx="10" fill="${fColor}"/><text x="170" y="373" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="800" fill="${fText}">${cta}</text>`,
      };
    case 'ribbon':
      return {
        layout,
        beforeQr: `<rect x="24" y="14" width="312" height="312" rx="18" fill="${cardBg}" stroke="${fColor}" stroke-width="8"/>`,
        afterQr: `<polygon points="10,342 36,342 36,396 10,396 24,369" fill="${fColor}" opacity="0.82"/><polygon points="350,342 324,342 324,396 350,396 336,369" fill="${fColor}" opacity="0.82"/><rect x="32" y="336" width="296" height="60" rx="10" fill="${fColor}"/><text x="180" y="375" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="${fText}">${cta}</text>`,
      };
    case 'bag':
      return {
        layout,
        beforeQr: `<path d="M122 68 C122 24, 218 24, 218 68" fill="none" stroke="${fColor}" stroke-width="12" stroke-linecap="round"/><rect x="24" y="68" width="292" height="366" rx="22" fill="${cardBg}" stroke="${fColor}" stroke-width="10"/>`,
        afterQr: `<rect x="24" y="362" width="292" height="72" rx="14" fill="${fColor}"/><text x="170" y="407" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="800" fill="${fText}">${cta}</text>`,
      };
    case 'envelope':
      return {
        layout,
        beforeQr: `<polygon points="18,74 170,16 322,74" fill="${fColor}"/><rect x="18" y="74" width="304" height="344" rx="14" fill="${cardBg}" stroke="${fColor}" stroke-width="8"/>`,
        afterQr: `<rect x="18" y="354" width="304" height="64" rx="10" fill="${fColor}"/><text x="170" y="395" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="23" font-weight="800" fill="${fText}">${cta}</text>`,
      };
    case 'laptop':
      return {
        layout,
        beforeQr: `<rect x="40" y="16" width="300" height="304" rx="16" fill="${cardBg}" stroke="${fColor}" stroke-width="10"/>`,
        afterQr: `<path d="M16 326 L364 326 L346 382 L34 382 Z" fill="${fColor}"/><text x="190" y="363" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="800" fill="${fText}">${cta}</text>`,
      };
    case 'clipboard':
      return {
        layout,
        beforeQr: `<rect x="18" y="42" width="304" height="388" rx="20" fill="${cardBg}" stroke="${fColor}" stroke-width="9"/><rect x="116" y="16" width="108" height="38" rx="12" fill="${fColor}"/><circle cx="170" cy="30" r="6" fill="${cardBg === 'none' ? '#FFFFFF' : cardBg}"/>`,
        afterQr: `<rect x="38" y="346" width="264" height="62" rx="12" fill="${fColor}"/><text x="170" y="386" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="23" font-weight="800" fill="${fText}">${cta}</text>`,
      };
  }
}

/**
 * Menghasilkan SVG khusus bingkai (tanpa matriks QR) untuk latar pratinjau live dan komposisi kanvas PNG/JPG.
 */
export function composeFrameBackdropSvg(style: QRStyleOptions): {
  svg: string;
  layout: FrameLayout;
} {
  const { layout, beforeQr, afterQr } = buildFrameParts(style);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}">${beforeQr}${afterQr}</svg>`;
  return { svg, layout };
}

/**
 * Menggabungkan SVG mentah dari qr-code-styling ke dalam bingkai SVG deterministik lengkap.
 * Menyertakan xmlns:xlink agar elemen <image xlink:href="..."> logo di dalamnya selalu valid secara XML.
 */
export function composeFramedSvg(
  rawQrSvg: string,
  style: QRStyleOptions
): { svg: string; width: number; height: number } {
  const { viewBox, inner } = extractSvgInnerContent(rawQrSvg);
  const { layout, beforeQr, afterQr } = buildFrameParts(style);

  if (style.frameType === 'none') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="300" height="300" viewBox="${viewBox}">${inner}</svg>`;
    return { svg, width: 300, height: 300 };
  }

  const embeddedQr = `<svg x="${layout.qrX}" y="${layout.qrY}" width="${layout.qrSize}" height="${layout.qrSize}" viewBox="${viewBox}">${inner}</svg>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}">${beforeQr}${embeddedQr}${afterQr}</svg>`;
  return { svg, width: layout.width, height: layout.height };
}
