import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { getPublicQRByCode, verifyPublicQRPassword } from '../lib/qrService';
import { extractDisplayHost, sanitizeExternalUrl } from '../lib/qrHelpers';
import type { VCardContent } from '../types/qrGenerator';
import IPhone18ProMaxMockup from '../components/qr-generator/IPhone18ProMaxMockup';
import VCardMobileView, {
  VCardSplashOverlay,
} from '../components/qr-generator/VCardMobileView';

function useIsDesktopSm(): boolean {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 640px)').matches
      : true
  );

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 640px)');
    const onChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isDesktop;
}

export default function PublicQRViewerPage() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const isDesktop = useIsDesktopSm();
  const [loading, setLoading] = useState(Boolean(shortCode));
  const [isNotActivated, setIsNotActivated] = useState(!shortCode);
  const [errorMsg, setErrorMsg] = useState('');
  const [title, setTitle] = useState('Kode QR FreeBuild CV');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);
  const [vcardContent, setVcardContent] = useState<VCardContent | null>(null);
  const [splashVisible, setSplashVisible] = useState(false);

  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    if (!shortCode) {
      return;
    }

    let cancelled = false;
    void getPublicQRByCode(shortCode).then(({ data, notFound, error }) => {
      if (cancelled) return;
      setLoading(false);
      if (notFound) {
        setIsNotActivated(true);
        document.title = 'QR Code Belum Diaktifkan - FreeBuild CV';
        return;
      }
      if (error || !data) {
        setErrorMsg(error?.message || 'Gagal memuat Kode QR.');
        return;
      }

      setTitle(data.title || 'Kode QR');
      document.title = `${data.title || 'Kode QR'} - FreeBuild CV`;

      if (data.requires_password) {
        setRequiresPassword(true);
      } else if (data.content_data?.type === 'vcard') {
        setVcardContent(data.content_data);
        if (data.content_data.splashDataUrl) {
          setSplashVisible(true);
        }
      } else if (data.content_data?.type === 'url' && data.content_data.url) {
        const safe = sanitizeExternalUrl(data.content_data.url);
        setUnlockedUrl(safe);
        if (safe !== '#') {
          window.location.replace(safe);
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [shortCode]);

  useEffect(() => {
    if (!splashVisible) return;
    const timer = setTimeout(() => setSplashVisible(false), 1650);
    return () => clearTimeout(timer);
  }, [splashVisible]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortCode || !password.trim()) {
      setPwdError('Masukkan kata sandi terlebih dahulu.');
      return;
    }

    setPwdError('');
    setVerifying(true);
    const res = await verifyPublicQRPassword(shortCode, password);
    setVerifying(false);

    if (res.error) {
      setPwdError(res.error.message);
      return;
    }

    if (!res.valid || !res.content_data) {
      setPwdError('Kata sandi salah. Silakan periksa kembali.');
      return;
    }

    if (res.content_data.type === 'vcard') {
      setVcardContent(res.content_data);
      if (res.content_data.splashDataUrl) {
        setSplashVisible(true);
      }
      setRequiresPassword(false);
      return;
    }

    const safe = sanitizeExternalUrl(res.content_data.url || '');
    setUnlockedUrl(safe);
    setRequiresPassword(false);
    if (safe !== '#') {
      window.location.replace(safe);
    }
  };

  if (vcardContent) {
    const footerLink = (
      <Link
        to="/"
        className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors pt-5 pb-1"
      >
        <QrCode className="w-3.5 h-3.5" />
        Dibuat dengan FreeBuild CV
      </Link>
    );

    if (isDesktop) {
      return (
        <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center py-8 px-4 overflow-x-auto">
          <IPhone18ProMaxMockup
            exactSize
            statusBarBg={vcardContent.primaryColor}
            bottomBg={vcardContent.secondaryColor}
            splashVisible={splashVisible}
            splashImageUrl={vcardContent.splashDataUrl}
            fadeSplashBackdropIn={false}
            onDismissSplash={() => setSplashVisible(false)}
          >
            <VCardMobileView
              content={vcardContent}
              playSplashOnMount={false}
              compact={false}
              footerNote={footerLink}
            />
          </IPhone18ProMaxMockup>
        </div>
      );
    }

    return (
      <div className="min-h-dvh bg-white flex flex-col w-full">
        {vcardContent.splashDataUrl && (
          <VCardSplashOverlay
            visible={splashVisible}
            imageUrl={vcardContent.splashDataUrl}
            onDismiss={() => setSplashVisible(false)}
            fadeBackdropIn={false}
            fullScreen
          />
        )}
        <VCardMobileView
          content={vcardContent}
          playSplashOnMount={false}
          compact={false}
          footerNote={footerLink}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200 shadow-lg p-7 sm:p-8 text-center">
        {loading ? (
          <div className="py-10 flex flex-col items-center gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
            <p className="text-sm font-medium text-zinc-600">Membuka tautan QR...</p>
          </div>
        ) : isNotActivated ? (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto">
              <QrCode className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-zinc-900">
                QR Code Belum Diaktifkan
              </h1>
              <p className="text-sm text-zinc-600 leading-relaxed">
                QR Code tersebut belum diaktifkan. Jika Anda pembuat QR Code ini,
                silakan masuk atau daftar akun terlebih dahulu lalu klik{' '}
                <span className="font-semibold text-zinc-800">Simpan</span> atau{' '}
                <span className="font-semibold text-zinc-800">Unduh QR</span>{' '}
                untuk mengaktifkannya.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <Link
                to="/qr-generator"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Buat &amp; Aktifkan QR Code
              </Link>
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 text-sm font-semibold hover:bg-zinc-50 transition-colors"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        ) : errorMsg ? (
          <div className="py-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900">QR Tidak Tersedia</h1>
            <p className="text-sm text-zinc-600">{errorMsg}</p>
            <Link
              to="/"
              className="inline-block px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        ) : requiresPassword && !unlockedUrl ? (
          <form onSubmit={handleUnlock} className="space-y-5 text-left">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-extrabold text-zinc-900">{title}</h1>
              <p className="text-sm text-zinc-500">
                Kode QR ini dilindungi kata sandi. Masukkan kata sandi untuk membuka tautan tujuan.
              </p>
            </div>

            <div>
              <label
                htmlFor="unlock-qr-password"
                className="block text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2"
              >
                Kata Sandi
              </label>
              <div className="relative">
                <input
                  id="unlock-qr-password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  autoFocus
                  className="w-full rounded-xl border border-zinc-200 px-4 py-3 pr-11 text-sm text-zinc-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {pwdError && (
                <p className="text-xs font-medium text-red-600 mt-1.5">{pwdError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {verifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {verifying ? 'Memverifikasi...' : 'Buka Tautan'}
            </button>
          </form>
        ) : (
          <div className="py-4 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ExternalLink className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold text-zinc-900">{title}</h1>
            <p className="text-sm text-zinc-500">
              Mengalihkan ke{' '}
              <span className="font-semibold text-zinc-800">
                {extractDisplayHost(unlockedUrl || '')}
              </span>
            </p>
            <a
              href={unlockedUrl || '#'}
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              Buka Situs Tujuan Sekarang
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>

      <Link
        to="/"
        className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
      >
        <QrCode className="w-3.5 h-3.5" />
        Dibuat dengan FreeBuild CV
      </Link>
    </div>
  );
}
