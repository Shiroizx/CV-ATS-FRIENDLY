import QRCodeStyling from 'qr-code-styling';
import type { DrawType, Options } from 'qr-code-styling';
import type { QRStyleOptions } from '../types/qrGenerator.ts';
import { composeFrameBackdropSvg, composeFramedSvg } from './qrFrameSvg.ts';
import { computeVCardImageCropLayout } from './qrHelpers.ts';

/**
 * Mengonversi opsi desain ke konfigurasi resmi `qr-code-styling`.
 */
export function buildQRCodeStylingOptions(
  data: string,
  style: QRStyleOptions,
  size = 300,
  drawType: DrawType = 'canvas'
): Partial<Options> {
  const effectiveErrorCorrection = style.logoDataUrl ? 'H' : style.errorCorrection;
  const rotationRad = (style.gradientRotationDeg * Math.PI) / 180;

  const dotsOptions: NonNullable<Options['dotsOptions']> = style.useGradient
    ? {
        type: style.dotStyle,
        gradient: {
          type: style.gradientType,
          rotation: rotationRad,
          colorStops: [
            { offset: 0, color: style.dotColor },
            { offset: 1, color: style.gradientSecondaryColor },
          ],
        },
      }
    : {
        type: style.dotStyle,
        color: style.dotColor,
      };

  const cornersSquareOptions: NonNullable<Options['cornersSquareOptions']> = {
    color: style.cornerSquareColor || style.dotColor,
    ...(style.cornerSquareStyle ? { type: style.cornerSquareStyle } : {}),
  };

  const cornersDotOptions: NonNullable<Options['cornersDotOptions']> = {
    color: style.cornerDotColor || style.dotColor,
    ...(style.cornerDotStyle ? { type: style.cornerDotStyle } : {}),
  };

  return {
    width: size,
    height: size,
    type: drawType,
    margin: 4,
    data: data || 'https://www.mywebsite.com',
    image: style.logoDataUrl ?? undefined,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel: effectiveErrorCorrection,
    },
    imageOptions: {
      saveAsBlob: true,
      hideBackgroundDots: true,
      imageSize: style.logoSize,
      margin: style.logoMargin,
      crossOrigin: 'anonymous',
    },
    dotsOptions,
    cornersSquareOptions,
    cornersDotOptions,
    backgroundOptions: {
      color: style.bgTransparent ? 'transparent' : style.bgColor,
    },
  };
}

/**
 * Menghasilkan SVG QR berbingkai secara penuh dalam memori (untuk ekspor vektor SVG).
 */
export async function generateFramedQRSvg(
  data: string,
  style: QRStyleOptions
): Promise<{ svg: string; width: number; height: number }> {
  const qr = new QRCodeStyling(buildQRCodeStylingOptions(data, style, 300, 'svg'));
  const raw = await qr.getRawData('svg');
  if (!raw || !(raw instanceof Blob)) {
    throw new Error('Gagal menghasilkan grafik SVG QR Code.');
  }
  const rawSvg = await raw.text();
  return composeFramedSvg(rawSvg, style);
}

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Gagal merender gambar QR ke kanvas.'));
    };
    img.src = url;
  });
}

/**
 * Merender Bingkai + QR Canvas native resolusi tinggi (lebar 1080px) ke Blob PNG atau JPG.
 * Memisahkan bingkai SVG dan matriks QR native memastikan logo di tengah selalu ikut tergambar utuh.
 */
async function rasterizeFramedQR(
  data: string,
  style: QRStyleOptions,
  format: 'png' | 'jpg'
): Promise<Blob> {
  const { svg: backdropSvg, layout } = composeFrameBackdropSvg(style);
  const targetWidth = 1080;
  const scale = targetWidth / layout.width;
  const targetHeight = Math.round(layout.height * scale);

  const qrPixelSize = Math.max(400, Math.round(layout.qrSize * scale));
  const qrInstance = new QRCodeStyling(
    buildQRCodeStylingOptions(data, style, qrPixelSize, 'canvas')
  );
  const qrBlob = await qrInstance.getRawData('png');
  if (!qrBlob || !(qrBlob instanceof Blob)) {
    throw new Error('Gagal membuat matriks QR resolusi tinggi.');
  }

  const qrImg = await loadImageFromBlob(qrBlob);
  const backdropImg =
    style.frameType !== 'none'
      ? await loadImageFromBlob(new Blob([backdropSvg], { type: 'image/svg+xml;charset=utf-8' }))
      : null;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Konteks 2D kanvas tidak tersedia.');
  }

  if (format === 'jpg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  if (backdropImg) {
    ctx.drawImage(backdropImg, 0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(
    qrImg,
    Math.round(layout.qrX * scale),
    Math.round(layout.qrY * scale),
    qrPixelSize,
    qrPixelSize
  );

  const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Gagal mengonversi kanvas ke file gambar.'));
          return;
        }
        resolve(blob);
      },
      mime,
      0.95
    );
  });
}

function triggerDownloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Mengekspor QR Code berbingkai sebagai PNG, JPG, atau SVG.
 */
export async function exportQRFile(
  data: string,
  style: QRStyleOptions,
  format: 'png' | 'jpg' | 'svg',
  baseFilename = 'kode-qr-freebuild'
): Promise<void> {
  const safeName = baseFilename.replace(/[^a-zA-Z0-9_-]+/g, '-').toLowerCase() || 'kode-qr';

  if (format === 'svg') {
    const { svg } = await generateFramedQRSvg(data, style);
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownloadBlob(svgBlob, `${safeName}.svg`);
    return;
  }

  const imgBlob = await rasterizeFramedQR(data, style, format);
  triggerDownloadBlob(imgBlob, `${safeName}.${format}`);
}

/**
 * Menyalin gambar QR PNG berbingkai ke clipboard browser.
 */
export async function copyQRToClipboard(
  data: string,
  style: QRStyleOptions
): Promise<void> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    throw new Error('Browser Anda belum mendukung penyalinan gambar ke clipboard.');
  }

  const pngBlob = await rasterizeFramedQR(data, style, 'png');
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': pngBlob })]);
}

/**
 * Mengecilkan data URL logo agar tetap tajam untuk QR tengah namun ringkas disimpan ke database JSONB.
 */
export async function shrinkLogoDataUrl(dataUrl: string, maxChars = 24000): Promise<string> {
  if (!dataUrl || dataUrl.length <= maxChars) {
    return dataUrl;
  }

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('File gambar tidak dapat dimuat.'));
    el.src = dataUrl;
  });

  const attempts: Array<{ maxSide: number; mime: string; quality: number }> = [
    { maxSide: 192, mime: 'image/webp', quality: 0.85 },
    { maxSide: 144, mime: 'image/webp', quality: 0.78 },
    { maxSide: 112, mime: 'image/png', quality: 0.85 },
  ];

  let latest = dataUrl;
  for (const cfg of attempts) {
    const srcW = img.naturalWidth || img.width || cfg.maxSide;
    const srcH = img.naturalHeight || img.height || cfg.maxSide;
    const scale = Math.min(1, cfg.maxSide / Math.max(srcW, srcH));
    const w = Math.max(1, Math.round(srcW * scale));
    const h = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) break;

    ctx.drawImage(img, 0, 0, w, h);
    latest = canvas.toDataURL(cfg.mime, cfg.quality);
    if (latest.length <= maxChars) {
      return latest;
    }
  }

  return latest;
}

/**
 * Membaca File menjadi raw Data URL sebelum dipotong/dikompres.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Membaca file logo unggahan menjadi data URL yang ringkas & bebas masalah CORS saat ekspor.
 */
export async function convertLogoFileToDataUrl(file: File): Promise<string> {
  const rawDataUrl = await readFileAsDataUrl(file);
  return shrinkLogoDataUrl(rawDataUrl, 24000);
}

export interface VCardImageTransformOptions {
  zoom: number;
  flipH: boolean;
  flipV: boolean;
  rotateDeg: number;
  squareCrop?: boolean;
  /** Rasio lebar/tinggi target (misalnya 16/10 untuk banner); memotong proporsional cover. */
  aspectRatio?: number;
  /** Pergeseran horizontal ternormalisasi terhadap lebar bingkai crop. */
  offsetX?: number;
  /** Pergeseran vertikal ternormalisasi terhadap tinggi bingkai crop. */
  offsetY?: number;
  maxChars?: number;
}

/**
 * Menerapkan zoom, geser (pan), balik (flip), putar (rotate), lalu mengompres gambar profil/banner/splash vCard
 * agar ringan disimpan di JSONB (<= 18 KB per gambar).
 */
export async function processVCardImageDataUrl(
  rawDataUrl: string,
  opts: VCardImageTransformOptions
): Promise<string> {
  const maxChars = opts.maxChars ?? 18000;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('File gambar tidak dapat diproses.'));
    el.src = rawDataUrl;
  });

  const srcW = img.naturalWidth || img.width || 240;
  const srcH = img.naturalHeight || img.height || 240;
  const normalizedRot = ((opts.rotateDeg % 360) + 360) % 360;
  const swapped = normalizedRot === 90 || normalizedRot === 270;
  const baseW = swapped ? srcH : srcW;
  const baseH = swapped ? srcW : srcH;

  const attempts = opts.aspectRatio
    ? [
        { maxSide: 800, mime: 'image/webp', quality: 0.86 },
        { maxSide: 720, mime: 'image/webp', quality: 0.80 },
        { maxSide: 640, mime: 'image/webp', quality: 0.74 },
        { maxSide: 560, mime: 'image/webp', quality: 0.68 },
        { maxSide: 480, mime: 'image/jpeg', quality: 0.76 },
        { maxSide: 360, mime: 'image/jpeg', quality: 0.68 },
      ]
    : [
        { maxSide: 360, mime: 'image/webp', quality: 0.86 },
        { maxSide: 300, mime: 'image/webp', quality: 0.80 },
        { maxSide: 240, mime: 'image/webp', quality: 0.74 },
        { maxSide: 200, mime: 'image/jpeg', quality: 0.74 },
        { maxSide: 160, mime: 'image/jpeg', quality: 0.68 },
      ];

  let latest = rawDataUrl;
  for (const cfg of attempts) {
    const canvas = document.createElement('canvas');
    if (opts.squareCrop) {
      canvas.width = cfg.maxSide;
      canvas.height = cfg.maxSide;
    } else if (opts.aspectRatio && opts.aspectRatio > 0) {
      canvas.width = cfg.maxSide;
      canvas.height = Math.max(1, Math.round(cfg.maxSide / opts.aspectRatio));
    } else {
      const ratio = Math.min(1, cfg.maxSide / Math.max(baseW, baseH));
      canvas.width = Math.max(1, Math.round(baseW * ratio));
      canvas.height = Math.max(1, Math.round(baseH * ratio));
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) break;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    if (cfg.mime === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const isCoverCrop = opts.squareCrop || Boolean(opts.aspectRatio && opts.aspectRatio > 0);
    const layout = computeVCardImageCropLayout({
      srcW,
      srcH,
      frameW: canvas.width,
      frameH: canvas.height,
      zoom: opts.zoom,
      rotateDeg: opts.rotateDeg,
      cover: isCoverCrop,
      offsetX: opts.offsetX,
      offsetY: opts.offsetY,
    });

    ctx.save();
    ctx.translate(canvas.width / 2 + layout.dx, canvas.height / 2 + layout.dy);
    ctx.scale(opts.flipH ? -1 : 1, opts.flipV ? -1 : 1);
    ctx.rotate((layout.normalizedRot * Math.PI) / 180);

    ctx.drawImage(
      img,
      -layout.drawW / 2,
      -layout.drawH / 2,
      layout.drawW,
      layout.drawH
    );
    ctx.restore();

    latest = canvas.toDataURL(cfg.mime, cfg.quality);
    if (latest.length <= maxChars) {
      return latest;
    }
  }

  return latest;
}
