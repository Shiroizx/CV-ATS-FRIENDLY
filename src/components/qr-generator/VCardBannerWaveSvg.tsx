import type { CSSProperties } from 'react';
import type { VCardBannerWaveConfig } from '../../types/qrGenerator';
import { generateVCardBannerWavePaths } from '../../lib/qrHelpers';

/**
 * Merender SVG gelombang pemisah bawah banner vCard berdasarkan konfigurasi bentuk & seed acak.
 * Mendukung optional `strokeColor` untuk gaya Brutalism agar tepi gelombang bergaris ink tegas.
 */
export function VCardBannerWaveSvg({
  wave,
  fillColor,
  strokeColor,
  strokeWidth = 2.5,
  className = '',
  style,
}: {
  wave: VCardBannerWaveConfig;
  fillColor: string;
  strokeColor?: string;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const { backdropLayers, foregroundPath } = generateVCardBannerWavePaths(wave);
  const openRidgePath = strokeColor
    ? foregroundPath.replace(/\s*L\s*400\s+100\s+L\s*0\s+100\s*Z\s*$/i, '')
    : '';

  return (
    <svg
      viewBox="0 0 400 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {backdropLayers.map((layer, idx) => (
        <path
          key={idx}
          d={layer.d}
          fill={fillColor}
          fillOpacity={layer.opacity}
        />
      ))}
      <path d={foregroundPath} fill={fillColor} />
      {strokeColor && openRidgePath && (
        <path
          d={openRidgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          vectorEffect="nonScalingStroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
