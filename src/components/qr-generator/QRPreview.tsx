import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Download,
  ExternalLink,
  Eye,
  Globe,
  Info,
  Lock,
  QrCode,
} from 'lucide-react';
import type {
  QRContentData,
  QRStyleOptions,
  QRType,
  WizardStep,
} from '../../types/qrGenerator';
import {
  buildWatermarkTileDataUrl,
  extractDisplayHost,
  getQRDisplayTitle,
  sanitizeExternalUrl,
} from '../../lib/qrHelpers';
import type { DownloadCreditInfo } from '../../lib/downloadCredit';
import FramedQRCanvas from './FramedQRCanvas';
import IPhone18ProMaxMockup from './IPhone18ProMaxMockup';
import QRTypeHoverPreview from './QRTypeHoverPreview';
import VCardMobileView from './VCardMobileView';

interface QRPreviewProps {
  step: WizardStep;
  hoveredType?: QRType | null;
  splashTrigger?: number;
  content: QRContentData;
  style: QRStyleOptions;
  qrPayload: string;
  passwordEnabled: boolean;
  isActivated: boolean;
  isAuthenticated: boolean;
  isSaved: boolean;
  isSaving: boolean;
  isExporting?: boolean;
  showWatermark?: boolean;
  creditInfo?: DownloadCreditInfo | null;
  onDownload: (format: 'png' | 'jpg' | 'svg') => void;
}

export default function QRPreview({
  step,
  hoveredType = null,
  splashTrigger = 0,
  content,
  style,
  qrPayload,
  passwordEnabled,
  isActivated,
  isAuthenticated,
  isSaved,
  isSaving,
  isExporting = false,
  showWatermark = false,
  creditInfo = null,
  onDownload,
}: QRPreviewProps) {
  const [prevStep, setPrevStep] = useState<WizardStep>(step);
  const [tab, setTab] = useState<'preview' | 'qr'>(step === 2 ? 'preview' : 'qr');
  const [prevSplashTrigger, setPrevSplashTrigger] = useState(splashTrigger);
  const [showingVCardSplash, setShowingVCardSplash] = useState(false);

  if (prevStep !== step) {
    setPrevStep(step);
    setTab(step === 2 ? 'preview' : 'qr');
  }

  if (splashTrigger !== prevSplashTrigger) {
    setPrevSplashTrigger(splashTrigger);
    if (content.type === 'vcard' && content.splashDataUrl) {
      setTab('preview');
      setShowingVCardSplash(true);
    }
  }

  useEffect(() => {
    if (!showingVCardSplash) return;
    const timer = setTimeout(() => setShowingVCardSplash(false), 1450);
    return () => clearTimeout(timer);
  }, [showingVCardSplash]);

  const displayHost =
    content.type === 'url'
      ? extractDisplayHost(content.url)
      : getQRDisplayTitle(content);
  const safeHref =
    content.type === 'url' ? sanitizeExternalUrl(content.url) : '#';
  const isVCardPreviewTab = Boolean(
    step > 1 && content.type === 'vcard' && tab === 'preview'
  );
  const isVCardHasBanner = Boolean(
    isVCardPreviewTab && content.type === 'vcard' && content.bannerDataUrl
  );
  const vcardHeroPrimary =
    content.type === 'vcard' &&
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(content.primaryColor)
      ? content.primaryColor
      : '#6594FF';
  const vcardBottomBg =
    content.type === 'vcard' &&
    /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(content.secondaryColor)
      ? content.secondaryColor
      : '#FFFFFF';
  const isPhoneWatermarkVisible = Boolean(showWatermark && step > 1 && tab === 'qr');
  const phoneWatermarkUrl = useMemo(
    () => (isPhoneWatermarkVisible ? buildWatermarkTileDataUrl(false) : ''),
    [isPhoneWatermarkVisible]
  );

  return (
    <div className="flex flex-col items-center">
      {/* Toggle Pratinjau | Kode QR */}
      {step > 1 && (
        <div className="inline-flex p-1 rounded-full bg-white border border-blue-200 shadow-2xs mb-5">
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              tab === 'preview'
                ? 'bg-blue-500 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Pratinjau
          </button>
          <button
            type="button"
            onClick={() => setTab('qr')}
            className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              tab === 'qr'
                ? 'bg-blue-500 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            Kode QR
          </button>
        </div>
      )}

      {/* iPhone 18 Pro Max Mockup Frame */}
      <IPhone18ProMaxMockup
        exactSize={false}
        statusBarBg={isVCardPreviewTab ? vcardHeroPrimary : undefined}
        overlayStatusBar={isVCardHasBanner}
        statusBarLightText={isVCardHasBanner}
        bottomBg={isVCardPreviewTab ? vcardBottomBg : '#FFFFFF'}
        splashVisible={Boolean(
          content.type === 'vcard' && step > 1 && showingVCardSplash && tab === 'preview'
        )}
        splashImageUrl={content.type === 'vcard' ? content.splashDataUrl : null}
        fadeSplashBackdropIn
        onDismissSplash={() => setShowingVCardSplash(false)}
        backgroundOverlay={
          isPhoneWatermarkVisible ? (
            <div
              aria-hidden="true"
              className="absolute inset-0 z-[1] pointer-events-none select-none"
              style={{
                backgroundImage: `url("${phoneWatermarkUrl}")`,
                backgroundRepeat: 'repeat',
                backgroundSize: '185px 126px',
              }}
            />
          ) : null
        }
      >
        {step === 1 ? (
          hoveredType ? (
            <QRTypeHoverPreview type={hoveredType} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-10 text-center">
              <div className="w-40 h-40 rounded-2xl border border-zinc-100 shadow-lg bg-white flex items-center justify-center p-4 mb-6">
                <div className="relative w-full h-full grid grid-cols-3 gap-1.5 opacity-25">
                  <div className="border-4 border-zinc-900 rounded-sm" />
                  <div className="bg-zinc-900/60 rounded-xs" />
                  <div className="border-4 border-zinc-900 rounded-sm" />
                  <div className="bg-zinc-900/60 rounded-xs" />
                  <div className="bg-zinc-900/20 rounded-xs" />
                  <div className="bg-zinc-900/60 rounded-xs" />
                  <div className="border-4 border-zinc-900 rounded-sm" />
                  <div className="bg-zinc-900/60 rounded-xs" />
                  <div className="bg-zinc-900/40 rounded-xs" />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold tracking-widest text-zinc-900">
                    LOGO
                  </span>
                </div>
              </div>
              <p className="text-sm text-zinc-500 max-w-[22ch] leading-relaxed">
                Pilih atau arahkan kursor ke jenis Kode QR di sebelah kiri
              </p>
            </div>
          )
        ) : (
          <div className="relative z-10 flex-1 flex flex-col">
            {/* Mini browser address bar inside phone (hanya untuk URL atau tab Kode QR) */}
            {!isVCardPreviewTab && (
              <div className="px-4 pb-3">
                <div className="bg-zinc-100/90 backdrop-blur-xs rounded-full px-3 py-1.5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-zinc-600 truncate">
                  {passwordEnabled ? (
                    <Lock className="w-3 h-3 text-amber-600 flex-shrink-0" />
                  ) : (
                    <Globe className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                  )}
                  <span className="truncate">{displayHost}</span>
                </div>
              </div>
            )}

            {tab === 'preview' ? (
              content.type === 'vcard' ? (
                <VCardMobileView
                  content={content}
                  compact
                  hasTopMockupBar={isVCardHasBanner}
                />
              ) : (
                /* Pratinjau halaman tujuan (sesuai screenshot image.png) */
                <div className="flex-1 bg-indigo-100/70 p-3 flex flex-col gap-3">
                  <div className="bg-white rounded-2xl p-3.5 shadow-2xs space-y-3">
                    <div className="h-32 rounded-xl bg-zinc-200/80 flex items-center justify-center text-zinc-400">
                      <Globe className="w-9 h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2.5 w-3/4 rounded-full bg-zinc-200" />
                      <div className="h-2 w-full rounded-full bg-zinc-100" />
                      <div className="h-2 w-2/3 rounded-full bg-zinc-100" />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-3 shadow-2xs flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-2 w-2/3 rounded-full bg-zinc-200" />
                      <div className="h-2 w-1/2 rounded-full bg-zinc-100" />
                    </div>
                  </div>

                  {passwordEnabled && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-[11px] text-amber-900 flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                      <span>Terkunci kata sandi saat dipindai</span>
                    </div>
                  )}

                  {safeHref !== '#' ? (
                    <a
                      href={safeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      Buka Tautan Tujuan
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div className="mt-auto w-full h-9 rounded-xl bg-indigo-300/70" />
                  )}
                </div>
              )
            ) : (
              /* Kode QR Live Preview */
              <div className="flex-1 flex flex-col items-center justify-center px-5 pb-6">
                <FramedQRCanvas
                  data={qrPayload}
                  style={style}
                  resolution={560}
                  showWatermark={showWatermark}
                  className="w-full max-w-[235px] pointer-events-none"
                />
                <p className="text-[11px] font-medium text-zinc-500 mt-4 text-center leading-relaxed">
                  {!isActivated
                    ? 'Belum diaktifkan — klik Simpan atau Unduh untuk mengaktifkan QR Code Anda'
                    : showWatermark
                      ? 'Unduh QR untuk menghilangkan watermark pratinjau'
                      : passwordEnabled
                        ? 'QR aktif • pemindaian melewati gerbang sandi terlebih dahulu'
                        : 'QR aktif • siap dipindai kamera HP'}
                </p>
              </div>
            )}
          </div>
        )}
      </IPhone18ProMaxMockup>

      {/* Status Simpan & Aksi Ekspor saat Step 3 */}
      {step === 3 && (
        <div className="w-full max-w-[308px] mt-5 space-y-2.5">
          <div className="flex flex-col items-center justify-center gap-1 text-xs font-medium text-center">
            {isAuthenticated && isSaved ? (
              <div className="inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="text-emerald-700">
                  {showWatermark
                    ? 'QR aktif & tersimpan • Unduh untuk hapus watermark'
                    : 'QR Code aktif & tersimpan di akun Anda'}
                </span>
              </div>
            ) : !isActivated ? (
              <>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-semibold leading-snug">
                  <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span>Klik Simpan atau Unduh untuk mengaktifkan QR Code Anda</span>
                </div>
                {showWatermark && (
                  <span className="text-[11px] text-zinc-400">
                    Unduh gambar QR untuk menghilangkan watermark pratinjau
                  </span>
                )}
              </>
            ) : (
              <span className="text-zinc-500">
                {showWatermark
                  ? 'Klik Simpan atau Unduh untuk menyimpan & hapus watermark'
                  : 'Klik Simpan atau Unduh untuk menyimpan perubahan QR Code'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isExporting || isSaving}
              onClick={() => onDownload('png')}
              className="py-2.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              PNG
            </button>
            <button
              type="button"
              disabled={isExporting || isSaving}
              onClick={() => onDownload('jpg')}
              className="py-2.5 px-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              JPG
            </button>
            <button
              type="button"
              disabled={isExporting || isSaving}
              onClick={() => onDownload('svg')}
              className="py-2.5 px-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-900 border border-zinc-200 text-xs font-bold flex items-center justify-center gap-1 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              SVG
            </button>
          </div>

          {isAuthenticated && creditInfo && (
            <p
              className={`text-[11px] font-medium text-center ${
                creditInfo.remaining === 0
                  ? 'text-red-600'
                  : creditInfo.remaining <= 2
                    ? 'text-amber-700'
                    : 'text-zinc-500'
              }`}
            >
              {creditInfo.remaining === 0
                ? `Kredit download habis (0/${creditInfo.max}) · 1 unduhan = 1 kredit`
                : `Sisa kredit download: ${creditInfo.remaining}/${creditInfo.max} (1 unduhan = 1 kredit)`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
