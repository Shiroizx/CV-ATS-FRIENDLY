import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { verifyPartnerLogoutToken } from '../lib/qrService';

export default function PartnerLogoutPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { forceSignOut, partnerMeta } = useAuth();
  const token = searchParams.get('token')?.trim() || '';
  const switchUrl =
    partnerMeta?.switchAccountUrl ||
    'https://narainstitute.net/sales/vcard/switch-account';

  const [status, setStatus] = useState<'verifying' | 'done' | 'error'>(() =>
    token ? 'verifying' : 'error'
  );
  const [message, setMessage] = useState(() =>
    token
      ? 'Memverifikasi konfirmasi ganti akun dari Dashboard Nara Institute...'
      : 'Token konfirmasi ganti akun tidak ditemukan. Mulai proses ganti akun melalui Dashboard Nara Institute.'
  );

  useEffect(() => {
    document.title = 'Konfirmasi Ganti Akun - FreeBuild CV';
    if (!token) return;

    let cancelled = false;
    void verifyPartnerLogoutToken(token).then(async ({ valid, orgName, error }) => {
      if (cancelled) return;
      if (!valid) {
        setStatus('error');
        setMessage(
          error ||
            'Token konfirmasi tidak valid atau sudah kedaluwarsa. Ulangi konfirmasi dari Dashboard Nara Institute.'
        );
        return;
      }

      try {
        sessionStorage.removeItem('freebuild_qr_partner_token_v1');
        localStorage.removeItem('freebuild_qr_draft_v1');
        sessionStorage.removeItem('freebuild_qr_pwd_v1');
      } catch {
        // Abaikan error storage
      }

      await forceSignOut();
      if (cancelled) return;

      setStatus('done');
      setMessage(
        `Sesi akun partner ${orgName || 'Nara Institute'} telah dilepaskan. Mengalihkan ke halaman login FreeBuild CV...`
      );

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    });

    return () => {
      cancelled = true;
    };
  }, [token, forceSignOut, navigate]);

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200 shadow-lg p-7 sm:p-8 text-center space-y-5">
        {status === 'verifying' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-zinc-900">
                Memproses Ganti Akun
              </h1>
              <p className="text-sm text-zinc-600 leading-relaxed">{message}</p>
            </div>
          </>
        )}

        {status === 'done' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-zinc-900">
                Akun Partner Berhasil Dikeluarkan
              </h1>
              <p className="text-sm text-zinc-600 leading-relaxed">{message}</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Masuk dengan Akun FreeBuild CV Lain
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-zinc-900">
                Konfirmasi Tidak Valid
              </h1>
              <p className="text-sm text-zinc-600 leading-relaxed">{message}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <a
                href={switchUrl}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold transition-colors"
              >
                Buka Dashboard Nara
              </a>
              <Link
                to="/qr-generator"
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-sm font-semibold transition-colors"
              >
                Kembali ke Builder
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
