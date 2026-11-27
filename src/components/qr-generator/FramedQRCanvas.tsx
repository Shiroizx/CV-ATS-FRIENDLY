import { useEffect, useMemo, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import type { QRStyleOptions } from '../../types/qrGenerator';
import { composeFrameBackdropSvg } from '../../lib/qrFrameSvg';
import { buildQRCodeStylingOptions } from '../../lib/qrExport';
import {
  buildWatermarkTileDataUrl,
  calculateRelativeLuminance,
} from '../../lib/qrHelpers';

interface FramedQRCanvasProps {
  data: string;
  style: QRStyleOptions;
  resolution?: number;
  className?: string;
  showWatermark?: boolean;
}

function isWhiteColor(hex: string): boolean {
  const normalized = hex.trim().toUpperCase();
  return normalized === '#FFFFFF' || normalized === '#FFF';
}

/**
 * Merender bingkai SVG murni sebagai latar belakang dan kanvas `qr-code-styling` native di tengahnya.
 * Menghindari masalah SVG-in-img saat memuat logo preset maupun logo unggahan pengguna.
 */
export default function FramedQRCanvas({
  data,
  style,
  resolution = 520,
  className = '',
  showWatermark = false,
}: FramedQRCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const isDefaultWhiteFrameBg = style.frameBgTransparent || isWhiteColor(style.frameBgColor);
  const isDefaultWhiteQrBg = style.bgTransparent || isWhiteColor(style.bgColor);
  // Biarkan watermark menyatu mulus dari layar ponsel saat bingkai & QR memakai latar putih standar.
  const showCustomQrWatermarkLayer =
    showWatermark && !style.bgTransparent && (!isDefaultWhiteQrBg || !isDefaultWhiteFrameBg);

  const { svg: backdropSvg, layout } = useMemo(() => {
    const backdropStyle =
      showWatermark && isDefaultWhiteFrameBg
        ? { ...style, frameBgTransparent: true }
        : style;
    return composeFrameBackdropSvg(backdropStyle);
  }, [style, showWatermark, isDefaultWhiteFrameBg]);

  const backdropDataUrl = useMemo(
    () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(backdropSvg)}`,
    [backdropSvg]
  );

  const customWatermarkDataUrl = useMemo(() => {
    if (!showCustomQrWatermarkLayer) return '';
    const isDarkBg = calculateRelativeLuminance(style.bgColor) < 0.35;
    return buildWatermarkTileDataUrl(isDarkBg);
  }, [showCustomQrWatermarkLayer, style.bgColor]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      el.innerHTML = '';
      // Gunakan latar transparan pada kanvas pratinjau agar watermark di belakang pola QR tetap terlihat.
      const effectiveStyle = showWatermark ? { ...style, bgTransparent: true } : style;
      const qr = new QRCodeStyling(
        buildQRCodeStylingOptions(data, effectiveStyle, resolution, 'canvas')
      );
      qr.append(el);
    }, 60);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [data, style, resolution, showWatermark]);

  const leftPct = (layout.qrX / layout.width) * 100;
  const topPct = (layout.qrY / layout.height) * 100;
  const widthPct = (layout.qrSize / layout.width) * 100;
  const heightPct = (layout.qrSize / layout.height) * 100;

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ aspectRatio: `${layout.width} / ${layout.height}` }}
    >
      {style.frameType !== 'none' && (
        <img
          src={backdropDataUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 z-0 w-full h-full object-contain pointer-events-none"
        />
      )}
      {showCustomQrWatermarkLayer && (
        <div
          aria-hidden="true"
          className="absolute z-[1] pointer-events-none select-none overflow-hidden rounded-xs"
          style={{
            left: `${leftPct}%`,
            top: `${topPct}%`,
            width: `${widthPct}%`,
            height: `${heightPct}%`,
            backgroundColor: style.bgColor,
          }}
        >
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("${customWatermarkDataUrl}")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '185px 126px',
            }}
          />
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          left: `${leftPct}%`,
          top: `${topPct}%`,
          width: `${widthPct}%`,
          height: `${heightPct}%`,
        }}
        className="absolute z-10 flex items-center justify-center [&>canvas]:w-full [&>canvas]:h-full [&>canvas]:block"
      />
    </div>
  );
}
