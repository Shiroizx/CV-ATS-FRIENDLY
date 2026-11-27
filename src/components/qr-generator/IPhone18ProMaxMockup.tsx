import type { ReactNode } from 'react';
import { Battery, Signal, Wifi } from 'lucide-react';
import { calculateRelativeLuminance } from '../../lib/qrHelpers';
import { VCardSplashOverlay } from './VCardMobileView';

interface IPhone18ProMaxMockupProps {
  /** Mode ukuran persis layar iPhone 18 Pro Max (440×956 CSS px, Dynamic Island 82×32 CSS px). */
  exactSize?: boolean;
  /** Warna latar belakang status bar atas (mengikuti hero vCard jika aktif). */
  statusBarBg?: string;
  /** Menampilkan status bar melayang transparan di atas banner hero penuh layar. */
  overlayStatusBar?: boolean;
  /** Memaksa ikon status bar berwarna putih kontras saat berada di atas gambar banner. */
  statusBarLightText?: boolean;
  /** Warna latar konten utama untuk menyesuaikan kontras Home Indicator di bawah. */
  bottomBg?: string;
  /** Data URL wallpaper/watermark opsional di belakang konten layar. */
  backgroundOverlay?: ReactNode;
  /** Status layar selamat datang aktif. */
  splashVisible?: boolean;
  splashImageUrl?: string | null;
  fadeSplashBackdropIn?: boolean;
  onDismissSplash?: () => void;
  children: ReactNode;
}

/**
 * Mockup hardware seri iPhone 18 Pro Max (layar 6,9" 440×956 CSS px & Dynamic Island ringkas 82×32 CSS px).
 */
export default function IPhone18ProMaxMockup({
  exactSize = true,
  statusBarBg,
  overlayStatusBar = false,
  statusBarLightText = false,
  bottomBg = '#FFFFFF',
  backgroundOverlay,
  splashVisible = false,
  splashImageUrl = null,
  fadeSplashBackdropIn = true,
  onDismissSplash,
  children,
}: IPhone18ProMaxMockupProps) {
  const isOverlayActive = Boolean(overlayStatusBar && !splashVisible);
  const effectiveStatusBg =
    splashVisible ? '#FFFFFF' : statusBarBg || undefined;
  const isLightStatus =
    isOverlayActive && statusBarLightText
      ? false
      : effectiveStatusBg
        ? calculateRelativeLuminance(effectiveStatusBg) > 0.55
        : true;
  const isLightBottom = calculateRelativeLuminance(bottomBg) > 0.55;

  const bezelPadding = exactSize ? '10px' : '9px';
  const outerRadius = exactSize ? '64px' : '46px';
  const screenRadius = exactSize ? '54px' : '37px';

  return (
    <div
      className="relative select-none"
      style={{
        width: exactSize ? '460px' : 'min(308px, 100%)',
        padding: bezelPadding,
        borderRadius: outerRadius,
        background:
          'linear-gradient(145deg, #2b2b2f 0%, #141416 45%, #232327 100%)',
        boxShadow:
          '0 28px 60px -15px rgba(0, 0, 0, 0.38), inset 0 0 0 1.5px rgba(255, 255, 255, 0.14)',
      }}
    >
      {/* Tombol Samping Kiri: Action + Volume Up + Volume Down */}
      <span
        aria-hidden="true"
        className="absolute -left-[3px] w-[3px] bg-zinc-700 rounded-l"
        style={{
          top: exactSize ? '138px' : '86px',
          height: exactSize ? '28px' : '20px',
        }}
      />
      <span
        aria-hidden="true"
        className="absolute -left-[3px] w-[3px] bg-zinc-700 rounded-l"
        style={{
          top: exactSize ? '186px' : '118px',
          height: exactSize ? '58px' : '38px',
        }}
      />
      <span
        aria-hidden="true"
        className="absolute -left-[3px] w-[3px] bg-zinc-700 rounded-l"
        style={{
          top: exactSize ? '258px' : '165px',
          height: exactSize ? '58px' : '38px',
        }}
      />
      {/* Tombol Samping Kanan: Power */}
      <span
        aria-hidden="true"
        className="absolute -right-[3px] w-[3px] bg-zinc-700 rounded-r"
        style={{
          top: exactSize ? '220px' : '142px',
          height: exactSize ? '86px' : '54px',
        }}
      />

      {/* Bezel Hitam Internal Tipis + Layar iPhone 18 Pro Max (440×956 CSS px saat exactSize) */}
      <div
        className="relative bg-white overflow-hidden flex flex-col"
        style={{
          width: exactSize ? '440px' : '100%',
          height: exactSize ? '956px' : undefined,
          minHeight: exactSize ? '956px' : '560px',
          borderRadius: screenRadius,
        }}
      >
        {backgroundOverlay}

        {/* Layar Selamat Datang Full Screen di Dalam Mockup */}
        {splashImageUrl && (
          <VCardSplashOverlay
            visible={splashVisible}
            imageUrl={splashImageUrl}
            onDismiss={onDismissSplash ?? (() => {})}
            fadeBackdropIn={fadeSplashBackdropIn}
          />
        )}

        {/* Status Bar & Dynamic Island iPhone 18 Pro Max (82×32 px ringkas) */}
        <div
          className={`${
            isOverlayActive ? 'absolute top-0 inset-x-0 pointer-events-none' : 'relative flex-shrink-0'
          } z-30 flex items-center justify-between transition-colors duration-300 ${
            isLightStatus ? 'text-zinc-900' : 'text-white'
          }`}
          style={{
            height: exactSize ? '56px' : '44px',
            paddingLeft: exactSize ? '32px' : '22px',
            paddingRight: exactSize ? '28px' : '20px',
            backgroundColor: splashVisible
              ? '#FFFFFF'
              : isOverlayActive
                ? 'transparent'
                : statusBarBg,
          }}
        >
          <span
            className="font-semibold tracking-tight leading-none"
            style={{ fontSize: exactSize ? '15px' : '12px' }}
          >
            21:30
          </span>

          {/* Dynamic Island iPhone 18 Pro Max: 82×32 CSS px (proporsi fisik 13,49 mm pada layar 440×956 @3x) */}
          <div
            aria-label="Dynamic Island iPhone 18 Pro Max"
            className="absolute left-1/2 -translate-x-1/2 bg-black rounded-full flex items-center justify-end px-2 shadow-inner"
            style={{
              top: exactSize ? '12px' : '9px',
              width: exactSize ? '82px' : '64px',
              height: exactSize ? '32px' : '24px',
            }}
          >
            <span
              className="rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center"
              style={{
                width: exactSize ? '13px' : '10px',
                height: exactSize ? '13px' : '10px',
              }}
            >
              <span
                className="rounded-full bg-blue-950/90"
                style={{
                  width: exactSize ? '5px' : '4px',
                  height: exactSize ? '5px' : '4px',
                }}
              />
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Signal style={{ width: exactSize ? '15px' : '12px', height: exactSize ? '15px' : '12px' }} />
            <Wifi style={{ width: exactSize ? '15px' : '12px', height: exactSize ? '15px' : '12px' }} />
            <Battery style={{ width: exactSize ? '20px' : '16px', height: exactSize ? '20px' : '16px' }} />
          </div>
        </div>

        {/* Konten Layar */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>

        {/* Home Indicator iOS */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-30 rounded-full transition-colors"
          style={{
            width: exactSize ? '140px' : '104px',
            height: exactSize ? '5px' : '4px',
            backgroundColor: isLightBottom
              ? 'rgba(24, 24, 27, 0.25)'
              : 'rgba(255, 255, 255, 0.45)',
          }}
        />
      </div>
    </div>
  );
}
