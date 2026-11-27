import { useState } from 'react';
import { ChevronDown, HelpCircle, Link2, Pencil, Sparkles } from 'lucide-react';
import type { UrlContent } from '../../types/qrGenerator';

interface QRUrlContentFormProps {
  content: UrlContent;
  errors: Record<string, string>;
  onChange: (updated: UrlContent) => void;
}

export default function QRUrlContentForm({
  content,
  errors,
  onChange,
}: QRUrlContentFormProps) {
  const [openUrlSection, setOpenUrlSection] = useState(true);
  const [openNameSection, setOpenNameSection] = useState(true);
  const [showUrlTip, setShowUrlTip] = useState(false);

  const handleFillSample = () => {
    onChange({
      type: 'url',
      url: 'https://www.freebuildcv.tech',
      qrName: 'Portofolio & CV FreeBuild',
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Tambahkan konten ke kode QR URL Situs Web
        </h2>
        <button
          type="button"
          onClick={handleFillSample}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors whitespace-nowrap"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Isi Contoh URL
        </button>
      </div>

      {/* Kartu 1: Alamat situs web */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenUrlSection((prev) => !prev)}
          className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Link2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Alamat situs web</h3>
              <p className="text-xs sm:text-sm text-zinc-500">
                Masukkan URL tujuan kode QR Anda
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${
              openUrlSection ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openUrlSection && (
          <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-zinc-100">
            <label
              htmlFor="qr-url-input"
              className="block text-sm font-bold text-zinc-900 mb-2"
            >
              URL Situs Web<span className="text-red-500 ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                id="qr-url-input"
                type="url"
                value={content.url}
                onChange={(e) => onChange({ ...content, url: e.target.value })}
                placeholder="misalnya www.mywebsite.com"
                className={`w-full rounded-xl border px-4 py-3 pr-10 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.url
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-200 focus:border-blue-600 focus:ring-blue-600/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowUrlTip((v) => !v)}
                title="Info format URL"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            {errors.url && (
              <p className="text-xs font-medium text-red-600 mt-1.5">{errors.url}</p>
            )}
            {showUrlTip && (
              <p className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 mt-2">
                Anda dapat memasukkan dengan atau tanpa <code className="font-mono">https://</code> (contoh: <span className="font-medium">www.mywebsite.com</span>). Sistem akan menormalisasinya secara otomatis.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Kartu 2: Nama kode QR */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setOpenNameSection((prev) => !prev)}
          className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900">Nama kode QR</h3>
              <p className="text-xs sm:text-sm text-zinc-500">
                Tentukan nama untuk kode QR Anda (opsional)
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${
              openNameSection ? 'rotate-180' : ''
            }`}
          />
        </button>

        {openNameSection && (
          <div className="px-5 sm:px-6 pb-6 pt-3 border-t border-zinc-100">
            <label
              htmlFor="qr-name-input"
              className="block text-sm font-bold text-zinc-900 mb-2"
            >
              Beri nama kode QR Anda
            </label>
            <input
              id="qr-name-input"
              type="text"
              maxLength={80}
              value={content.qrName}
              onChange={(e) => onChange({ ...content, qrName: e.target.value })}
              placeholder="misalnya Kode QR pertama saya"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
            />
          </div>
        )}
      </div>
    </div>
  );
}
