import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Copy,
  Download,
  Edit,
  ExternalLink,
  Loader2,
  Lock,
  Plus,
  QrCode,
  Trash2,
} from 'lucide-react';
import type { SavedQRCode } from '../types/qrGenerator';
import { DEFAULT_QR_STYLE } from '../types/qrGenerator';
import {
  extractDisplayHost,
  resolveUrlQRPayload,
  sanitizeExternalUrl,
} from '../lib/qrHelpers';
import { exportQRFile } from '../lib/qrExport';
import {
  consumeQRDownloadCredit,
  deleteQRCode,
  getUserQRCodes,
} from '../lib/qrService';
import { getRemainingDownloads } from '../lib/downloadCredit';
import type { DownloadCreditInfo } from '../lib/downloadCredit';
import {
  showDeleteConfirm,
  showDownloadLimitReached,
  showError,
  showSuccess,
  showToast,
} from '../utils/swal';
import FramedQRCanvas from '../components/qr-generator/FramedQRCanvas';

function QRCardThumbnail({ qr }: { qr: SavedQRCode }) {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://www.freebuildcv.tech';
  const payload = resolveUrlQRPayload(origin, qr.short_code);
  const mergedStyle = { ...DEFAULT_QR_STYLE, ...qr.style_options };

  return (
    <div className="w-24 h-28 rounded-2xl bg-zinc-50 border border-zinc-200/80 p-2 flex items-center justify-center flex-shrink-0">
      <FramedQRCanvas
        data={payload}
        style={mergedStyle}
        resolution={260}
        className="max-w-full max-h-full w-20"
      />
    </div>
  );
}

export default function MyQRCodesPage() {
  const [items, setItems] = useState<SavedQRCode[]>([]);
  const [creditInfo, setCreditInfo] = useState<DownloadCreditInfo | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const fetchQRs = async () => {
    setLoading(true);
    setErrorMsg('');
    const [{ data, error }, credit] = await Promise.all([
      getUserQRCodes(),
      getRemainingDownloads(true),
    ]);
    setLoading(false);
    setCreditInfo(credit);
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setItems(data || []);
  };

  useEffect(() => {
    document.title = 'Riwayat QR Code - FreeBuild CV';
    let cancelled = false;
    void Promise.all([getUserQRCodes(), getRemainingDownloads(true)]).then(
      ([{ data, error }, credit]) => {
        if (cancelled) return;
        setLoading(false);
        setCreditInfo(credit);
        if (error) {
          setErrorMsg(error.message);
          return;
        }
        setItems(data || []);
      }
    );
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDelete = async (qr: SavedQRCode) => {
    const res = await showDeleteConfirm(
      'Hapus QR Code?',
      `QR "${qr.title}" akan dihapus permanen dari akun Anda.`
    );
    if (!res.isConfirmed) return;

    const { error } = await deleteQRCode(qr.id);
    if (error) {
      await showError('Gagal Menghapus', error.message);
      return;
    }
    setItems((prev) => prev.filter((item) => item.id !== qr.id));
    await showSuccess('Terhapus', 'QR Code berhasil dihapus.');
  };

  const handleDownloadQuick = async (qr: SavedQRCode, format: 'png' | 'svg') => {
    setDownloadingId(qr.id);
    try {
      const { allowed, credit } = await consumeQRDownloadCredit(
        `${qr.title} (${format.toUpperCase()})`
      );
      setCreditInfo(credit);
      if (!allowed) {
        await showDownloadLimitReached(credit.count, credit.max);
        return;
      }

      const origin = window.location.origin;
      const payload = resolveUrlQRPayload(origin, qr.short_code);
      await exportQRFile(
        payload,
        { ...DEFAULT_QR_STYLE, ...qr.style_options },
        format,
        qr.title
      );
      void showToast(
        'success',
        `QR (${format.toUpperCase()}) diunduh · Sisa kredit: ${credit.remaining}/${credit.max}`
      );
    } catch (err) {
      await showError(
        'Gagal Mengunduh',
        err instanceof Error ? err.message : 'Gagal membuat file QR.'
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCopyPayload = async (qr: SavedQRCode) => {
    const payload = resolveUrlQRPayload(window.location.origin, qr.short_code);
    await navigator.clipboard.writeText(payload);
    void showToast('success', 'Tautan QR disalin ke clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#f7f9fc] py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-900 flex items-center gap-3 tracking-tight">
              <QrCode className="w-8 h-8 text-blue-600" />
              Riwayat QR Code
            </h1>
            <p className="text-zinc-600 text-sm sm:text-base mt-1.5">
              Kelola, edit desain, dan unduh ulang QR Code URL yang tersimpan di akun Anda.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {creditInfo && (
              <Link
                to="/download-history"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
                  creditInfo.remaining === 0
                    ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                    : creditInfo.remaining <= 2
                      ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                Kredit: {creditInfo.remaining}/{creditInfo.max}
              </Link>
            )}
            <Link
              to="/qr-generator"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Buat QR Baru
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl border border-zinc-200 py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-9 h-9 animate-spin text-blue-600 mb-3" />
            <p className="text-sm text-zinc-500">Memuat daftar QR Code Anda...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-white rounded-3xl border border-red-200 p-8 text-center space-y-3">
            <p className="text-base font-bold text-red-700">Gagal Memuat Data</p>
            <p className="text-sm text-zinc-600 max-w-lg mx-auto">{errorMsg}</p>
            <button
              type="button"
              onClick={() => void fetchQRs()}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800"
            >
              Coba Lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-zinc-200 py-20 px-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 mb-2">Belum Ada Kode QR</h2>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto mb-6">
              Anda belum menyimpan Kode QR apa pun. Mulai buat QR Code kustom untuk tautan website Anda!
            </p>
            <Link
              to="/qr-generator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Buat QR Sekarang
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {items.map((qr) => {
              const targetHref = sanitizeExternalUrl(qr.content_data?.url || '');
              return (
                <div
                  key={qr.id}
                  className="bg-white rounded-2xl border border-zinc-200 p-5 hover:shadow-md transition-shadow flex flex-col justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <QRCardThumbnail qr={qr} />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                          URL Situs Web
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                          Aktif • {qr.scan_count}× scan
                        </span>
                        {qr.requires_password && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-semibold">
                            <Lock className="w-3 h-3" />
                            Terkunci Sandi
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-zinc-900 truncate" title={qr.title}>
                        {qr.title}
                      </h3>

                      <a
                        href={targetHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-600 truncate max-w-full mt-0.5"
                      >
                        <span className="truncate">
                          {extractDisplayHost(qr.content_data?.url || '')}
                        </span>
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </a>

                      <p className="text-[11px] text-zinc-400 mt-2">
                        Diperbarui:{' '}
                        {new Date(qr.updated_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 flex-wrap">
                    <button
                      type="button"
                      onClick={() => navigate(`/qr-generator/${qr.id}`)}
                      className="flex-1 min-w-[90px] py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={downloadingId === qr.id}
                      onClick={() => void handleDownloadQuick(qr, 'png')}
                      className="py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PNG
                    </button>
                    <button
                      type="button"
                      disabled={downloadingId === qr.id}
                      onClick={() => void handleDownloadQuick(qr, 'svg')}
                      className="py-2 px-3 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      SVG
                    </button>
                    <button
                      type="button"
                      title="Salin tautan QR"
                      onClick={() => void handleCopyPayload(qr)}
                      className="p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      title="Hapus QR"
                      onClick={() => void handleDelete(qr)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
