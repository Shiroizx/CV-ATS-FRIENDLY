import { useState, useRef } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  Ban,
  ChevronDown,
  Eye,
  EyeOff,
  Frame,
  Grid3X3,
  ImagePlus,
  Lock,
  Scan,
  Trash2,
  Upload,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type {
  QRCornerDotType,
  QRCornerSquareType,
  QRDotType,
  QRFrameType,
  QRPasswordOptions,
  QRStyleOptions,
} from '../../types/qrGenerator';
import { QR_FRAME_PRESETS } from '../../lib/qrFrameSvg';
import { QR_LOGO_PRESETS } from '../../lib/qrPresets';
import { checkQRScannability, validateLogoFileMeta } from '../../lib/qrHelpers';
import { convertLogoFileToDataUrl } from '../../lib/qrExport';
import { showError } from '../../utils/swal';

interface QRCustomizerProps {
  qrTypeLabel?: string;
  style: QRStyleOptions;
  passwordOpts: QRPasswordOptions;
  errors: Record<string, string>;
  onChangeStyle: (style: QRStyleOptions) => void;
  onChangePassword: (opts: QRPasswordOptions) => void;
}

function CustomizerCard({
  icon,
  title,
  subtitle,
  defaultOpen = true,
  children,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors text-left"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">{title}</h3>
            <p className="text-xs sm:text-sm text-zinc-500">{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-zinc-100 space-y-5">
          {children}
        </div>
      )}
    </div>
  );
}

function HexColorInput({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (hex: string) => void;
}) {
  const safeHex = /^#([0-9a-fA-F]{6})$/.test(value) ? value : '#000000';
  return (
    <div className="flex-1 min-w-0">
      <label className="block text-xs sm:text-sm font-bold text-zinc-800 mb-2">
        {label}
      </label>
      <div
        className={`flex items-center justify-between bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/15 transition-all ${
          disabled ? 'opacity-50 pointer-events-none' : ''
        }`}
      >
        <input
          type="text"
          value={value.toUpperCase()}
          maxLength={7}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm font-mono text-zinc-800 bg-transparent focus:outline-none"
        />
        <label className="relative cursor-pointer flex-shrink-0 ml-2">
          <span
            className="block w-6 h-6 rounded-md border border-zinc-300 shadow-2xs"
            style={{ backgroundColor: safeHex }}
          />
          <input
            type="color"
            value={safeHex}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="sr-only"
          />
        </label>
      </div>
    </div>
  );
}

function FrameMiniThumb({ type }: { type: QRFrameType }) {
  if (type === 'none') {
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        <Ban className="w-6 h-6 text-zinc-700" />
        <span className="text-[10px] font-semibold text-zinc-700 leading-tight text-center">
          Tanpa tepi
        </span>
      </div>
    );
  }
  return (
    <svg viewBox="0 0 64 74" className="w-12 h-14">
      {type === 'badge-top' && (
        <rect x="8" y="4" width="48" height="12" rx="3" fill="#18181b" />
      )}
      {type === 'bag' && (
        <path d="M23 13 C23 5, 41 5, 41 13" fill="none" stroke="#18181b" strokeWidth="3" />
      )}
      {type === 'envelope' && (
        <polygon points="8,16 32,4 56,16" fill="#18181b" />
      )}
      {type === 'clipboard' && (
        <rect x="22" y="3" width="20" height="8" rx="3" fill="#18181b" />
      )}

      <rect
        x="8"
        y={type === 'badge-top' ? 19 : type === 'bag' || type === 'envelope' ? 15 : 8}
        width="48"
        height="46"
        rx="6"
        fill="#fff"
        stroke="#18181b"
        strokeWidth={type === 'bold-bottom' ? 3 : 2}
      />

      {/* Mini QR glyph inside thumb */}
      <g
        transform={`translate(16, ${
          type === 'badge-top' ? 27 : type === 'bag' || type === 'envelope' ? 23 : 16
        })`}
        fill="#18181b"
      >
        <rect width="11" height="11" rx="1.5" />
        <rect x="2" y="2" width="7" height="7" fill="#fff" />
        <rect x="3.5" y="3.5" width="4" height="4" />

        <rect x="21" width="11" height="11" rx="1.5" />
        <rect x="23" y="2" width="7" height="7" fill="#fff" />
        <rect x="24.5" y="3.5" width="4" height="4" />

        <rect y="20" width="11" height="11" rx="1.5" />
        <rect x="2" y="22" width="7" height="7" fill="#fff" />
        <rect x="3.5" y="23.5" width="4" height="4" />

        <rect x="14" y="4" width="4" height="4" />
        <rect x="14" y="13" width="6" height="5" />
        <rect x="22" y="16" width="8" height="4" />
        <rect x="16" y="23" width="5" height="6" />
        <rect x="25" y="23" width="6" height="6" />
      </g>

      {type !== 'badge-top' && (
        <>
          <rect
            x={type === 'ribbon' ? 6 : 10}
            y="57"
            width={type === 'ribbon' ? 52 : 44}
            height="12"
            rx={type === 'pill-bottom' || type === 'speech-bottom' ? 4 : 2}
            fill={type === 'thin-bottom' ? '#e4e4e7' : '#18181b'}
          />
          <text
            x="32"
            y="65.5"
            textAnchor="middle"
            fontSize="6"
            fontWeight="700"
            fill={type === 'thin-bottom' ? '#18181b' : '#ffffff'}
          >
            Pindai saya!
          </text>
        </>
      )}
    </svg>
  );
}

const DOT_PATTERNS: readonly { id: QRDotType; label: string }[] = [
  { id: 'square', label: 'Klasik' },
  { id: 'dots', label: 'Titik' },
  { id: 'rounded', label: 'Membulat' },
  { id: 'extra-rounded', label: 'Halus' },
  { id: 'classy', label: 'Klasik Tajam' },
  { id: 'classy-rounded', label: 'Elegan' },
] as const;

function PatternMiniGlyph({ type }: { type: QRDotType }) {
  const rx =
    type === 'dots'
      ? 6
      : type === 'extra-rounded'
        ? 4
        : type === 'rounded' || type === 'classy-rounded'
          ? 2.5
          : 0;
  return (
    <svg viewBox="0 0 36 36" className="w-8 h-8 fill-zinc-900">
      <rect x="2" y="2" width="9" height="9" rx={rx} />
      <rect x="14" y="2" width="9" height="9" rx={rx} />
      <rect x="25" y="14" width="9" height="9" rx={rx} />
      <rect x="2" y="14" width="9" height="9" rx={rx} />
      <rect x="14" y="25" width="9" height="9" rx={rx} />
      <rect x="25" y="25" width="9" height="9" rx={rx} />
      <rect x="14" y="14" width="8" height="8" rx={rx} opacity="0.6" />
    </svg>
  );
}

const CORNER_SQUARE_OPTIONS: readonly { id: QRCornerSquareType; label: string }[] = [
  { id: '', label: 'Bawaan' },
  { id: 'dot', label: 'Bulat' },
  { id: 'square', label: 'Kotak' },
  { id: 'extra-rounded', label: 'Lengkung' },
];

const CORNER_DOT_OPTIONS: readonly { id: QRCornerDotType; label: string }[] = [
  { id: '', label: 'Bawaan' },
  { id: 'dot', label: 'Titik' },
  { id: 'square', label: 'Kotak' },
];

export default function QRCustomizer({
  qrTypeLabel = 'URL Situs Web',
  style,
  passwordOpts,
  errors,
  onChangeStyle,
  onChangePassword,
}: QRCustomizerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswordText, setShowPasswordText] = useState(false);

  const scannability = checkQRScannability(style);

  const updateStyle = <K extends keyof QRStyleOptions>(
    key: K,
    value: QRStyleOptions[K]
  ) => {
    onChangeStyle({ ...style, [key]: value });
  };

  const handleSelectLogoPreset = (presetId: string, dataUrl: string) => {
    if (style.logoPresetId === presetId) {
      onChangeStyle({
        ...style,
        logoPresetId: null,
        logoDataUrl: null,
      });
      return;
    }
    onChangeStyle({
      ...style,
      logoPresetId: presetId,
      logoDataUrl: dataUrl,
      errorCorrection: 'H',
    });
  };

  const handleLogoUpload = async (file: File | undefined) => {
    if (!file) return;
    const validation = validateLogoFileMeta({ size: file.size, type: file.type });
    if (!validation.valid) {
      await showError('Logo Tidak Valid', validation.error || 'File ditolak.');
      return;
    }

    try {
      const dataUrl = await convertLogoFileToDataUrl(file);
      onChangeStyle({
        ...style,
        logoPresetId: null,
        logoDataUrl: dataUrl,
        errorCorrection: 'H',
      });
    } catch (err) {
      await showError(
        'Gagal Memuat Logo',
        err instanceof Error ? err.message : 'Silakan pilih file gambar lain.'
      );
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
        Kustomisasikan desain untuk kode QR {qrTypeLabel}
      </h2>

      {scannability.warnings.length > 0 && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 space-y-1">
            <p className="font-bold">Peringatan Keterbacaan Kamera</p>
            {scannability.warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </div>
        </div>
      )}

      {/* 1. Bingkai kode QR */}
      <CustomizerCard
        icon={<Frame className="w-5 h-5" />}
        title="Bingkai kode QR"
        subtitle="Bingkai meningkatkan visibilitas kode QR Anda, sehingga menghasilkan lebih banyak pemindaian"
      >
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
          {QR_FRAME_PRESETS.map((preset) => {
            const active = style.frameType === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                title={preset.label}
                onClick={() => updateStyle('frameType', preset.id)}
                className={`h-20 rounded-xl border p-1.5 flex items-center justify-center transition-all cursor-pointer ${
                  active
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <FrameMiniThumb type={preset.id} />
              </button>
            );
          })}
        </div>

        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-zinc-800 mb-2">
                Teks bingkai
              </label>
              <input
                type="text"
                maxLength={24}
                disabled={style.frameType === 'none'}
                value={style.frameText}
                onChange={(e) => updateStyle('frameText', e.target.value)}
                placeholder="Pindai saya!"
                className="w-full bg-white rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 disabled:opacity-50"
              />
            </div>

            <HexColorInput
              label="Warna bingkai"
              value={style.frameColor}
              disabled={style.frameType === 'none'}
              onChange={(hex) => updateStyle('frameColor', hex)}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <HexColorInput
              label="Warna latar belakang"
              value={style.frameBgColor}
              disabled={style.frameType === 'none' || style.frameBgTransparent}
              onChange={(hex) => updateStyle('frameBgColor', hex)}
            />

            <button
              type="button"
              title="Tukar warna latar dan teks bingkai"
              disabled={style.frameType === 'none'}
              onClick={() =>
                onChangeStyle({
                  ...style,
                  frameBgColor: style.frameTextColor,
                  frameTextColor: style.frameBgColor,
                })
              }
              className="self-center sm:mb-2 p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 transition-colors disabled:opacity-40"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <HexColorInput
              label="Warna teks"
              value={style.frameTextColor}
              disabled={style.frameType === 'none'}
              onChange={(hex) => updateStyle('frameTextColor', hex)}
            />
          </div>

          <label className="inline-flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer select-none">
            <input
              type="checkbox"
              disabled={style.frameType === 'none'}
              checked={style.frameBgTransparent}
              onChange={(e) => updateStyle('frameBgTransparent', e.target.checked)}
              className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Latar belakang transparan</span>
          </label>
        </div>
      </CustomizerCard>

      {/* 2. Pola kode QR */}
      <CustomizerCard
        icon={<Grid3X3 className="w-5 h-5" />}
        title="Pola kode QR"
        subtitle="Pilih pola untuk kode QR Anda dan pilih warna"
      >
        <div>
          <p className="text-sm font-bold text-zinc-900 mb-3">Gaya pola</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {DOT_PATTERNS.map((pattern) => {
              const active = style.dotStyle === pattern.id;
              return (
                <button
                  key={pattern.id}
                  type="button"
                  title={pattern.label}
                  onClick={() => updateStyle('dotStyle', pattern.id)}
                  className={`h-16 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    active
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <PatternMiniGlyph type={pattern.id} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <HexColorInput
              label="Warna titik"
              value={style.dotColor}
              onChange={(hex) => updateStyle('dotColor', hex)}
            />

            <button
              type="button"
              title="Tukar warna titik dan latar belakang"
              onClick={() =>
                onChangeStyle({
                  ...style,
                  dotColor: style.bgColor,
                  bgColor: style.dotColor,
                })
              }
              className="self-center sm:mb-2 p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 transition-colors"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            <HexColorInput
              label="Warna latar belakang"
              value={style.bgColor}
              disabled={style.bgTransparent}
              onChange={(hex) => updateStyle('bgColor', hex)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <label className="inline-flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={style.bgTransparent}
                onChange={(e) => updateStyle('bgTransparent', e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Latar belakang transparan</span>
            </label>

            <label className="inline-flex items-center gap-2.5 text-sm text-zinc-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={style.useGradient}
                onChange={(e) => updateStyle('useGradient', e.target.checked)}
                className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Gunakan warna gradien</span>
            </label>
          </div>

          {style.useGradient && (
            <div className="pt-3 border-t border-zinc-200 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <HexColorInput
                label="Warna gradien kedua"
                value={style.gradientSecondaryColor}
                onChange={(hex) => updateStyle('gradientSecondaryColor', hex)}
              />
              <div>
                <label className="block text-xs sm:text-sm font-bold text-zinc-800 mb-2">
                  Tipe gradien
                </label>
                <select
                  value={style.gradientType}
                  onChange={(e) =>
                    updateStyle('gradientType', e.target.value as 'linear' | 'radial')
                  }
                  className="w-full bg-white rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="linear">Linear</option>
                  <option value="radial">Radial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-zinc-800 mb-2">
                  Sudut ({style.gradientRotationDeg}°)
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={style.gradientRotationDeg}
                  onChange={(e) =>
                    updateStyle('gradientRotationDeg', Number(e.target.value))
                  }
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          )}
        </div>
      </CustomizerCard>

      {/* 3. Sudut kode QR */}
      <CustomizerCard
        icon={<Scan className="w-5 h-5" />}
        title="Sudut kode QR"
        subtitle="Pilih gaya sudut kode QR Anda"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <p className="text-sm font-bold text-zinc-900 mb-3">Gaya bingkai sudut</p>
            <div className="grid grid-cols-4 gap-2.5">
              {CORNER_SQUARE_OPTIONS.map((opt) => {
                const active = style.cornerSquareStyle === opt.id;
                return (
                  <button
                    key={opt.id || 'default'}
                    type="button"
                    title={opt.label}
                    onClick={() => updateStyle('cornerSquareStyle', opt.id)}
                    className={`h-14 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      active
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    {opt.id === '' ? (
                      <Ban className="w-5 h-5 text-zinc-700" />
                    ) : opt.id === 'dot' ? (
                      <span className="w-5 h-5 rounded-full border-2 border-zinc-900" />
                    ) : opt.id === 'square' ? (
                      <span className="w-5 h-5 border-2 border-zinc-900" />
                    ) : (
                      <span className="w-5 h-5 rounded-md border-2 border-zinc-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-zinc-900 mb-3">Tipe titik sudut</p>
            <div className="grid grid-cols-3 gap-2.5">
              {CORNER_DOT_OPTIONS.map((opt) => {
                const active = style.cornerDotStyle === opt.id;
                return (
                  <button
                    key={opt.id || 'default'}
                    type="button"
                    title={opt.label}
                    onClick={() => updateStyle('cornerDotStyle', opt.id)}
                    className={`h-14 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      active
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    {opt.id === '' ? (
                      <Ban className="w-5 h-5 text-zinc-700" />
                    ) : opt.id === 'dot' ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-zinc-900" />
                    ) : (
                      <span className="w-3.5 h-3.5 bg-zinc-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-end gap-3">
          <HexColorInput
            label="Warna bingkai sudut"
            value={style.cornerSquareColor}
            onChange={(hex) => updateStyle('cornerSquareColor', hex)}
          />
          <button
            type="button"
            title="Tukar warna bingkai sudut dan titik sudut"
            onClick={() =>
              onChangeStyle({
                ...style,
                cornerSquareColor: style.cornerDotColor,
                cornerDotColor: style.cornerSquareColor,
              })
            }
            className="self-center sm:mb-2 p-2 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/70 transition-colors"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
          <HexColorInput
            label="Warna titik sudut"
            value={style.cornerDotColor}
            onChange={(hex) => updateStyle('cornerDotColor', hex)}
          />
        </div>
      </CustomizerCard>

      {/* 4. Tambahkan logo */}
      <CustomizerCard
        icon={<ImagePlus className="w-5 h-5" />}
        title="Tambahkan logo"
        subtitle="Personalisasi kode QR Anda dengan menambahkan logo atau gambar"
      >
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-zinc-900">Pilih logo</p>
            {style.logoDataUrl && (
              <button
                type="button"
                onClick={() =>
                  onChangeStyle({
                    ...style,
                    logoPresetId: null,
                    logoDataUrl: null,
                  })
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus logo
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {QR_LOGO_PRESETS.map((preset) => {
              const active = style.logoPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.label}
                  onClick={() => handleSelectLogoPreset(preset.id, preset.dataUrl)}
                  className={`w-10 h-10 rounded-xl border p-1.5 flex items-center justify-center transition-all cursor-pointer ${
                    active
                      ? 'border-blue-600 ring-2 ring-blue-600/25 bg-blue-50/40'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  <img src={preset.dataUrl} alt={preset.label} className="w-6 h-6 object-contain" />
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-sm font-bold text-zinc-900 mb-3">Unggah logo Anda</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
            onChange={(e) => {
              void handleLogoUpload(e.target.files?.[0]);
              e.target.value = '';
            }}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void handleLogoUpload(e.dataTransfer.files?.[0]);
            }}
            className="rounded-2xl border-2 border-dashed border-blue-400/70 bg-blue-50/20 hover:bg-blue-50/40 px-5 py-5 flex items-center justify-between gap-4 cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {style.logoDataUrl && !style.logoPresetId ? (
                  <img
                    src={style.logoDataUrl}
                    alt="Logo Kustom"
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  <Upload className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-zinc-900">
                  Unggah gambar (jpg, png, svg)
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">Ukuran maksimum: 5 MB</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-blue-600 hidden sm:inline">
              Pilih File
            </span>
          </div>
        </div>

        {style.logoDataUrl && (
          <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Ukuran logo ({Math.round(style.logoSize * 100)}%)
              </label>
              <input
                type="range"
                min={0.2}
                max={0.42}
                step={0.02}
                value={style.logoSize}
                onChange={(e) => updateStyle('logoSize', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Margin logo ({style.logoMargin}px)
              </label>
              <input
                type="range"
                min={0}
                max={14}
                step={1}
                value={style.logoMargin}
                onChange={(e) => updateStyle('logoMargin', Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>
            <p className="sm:col-span-2 text-xs text-zinc-500">
              Koreksi error otomatis dinaikkan ke level <strong>H</strong> agar logo di tengah tidak mengganggu pemindaian.
            </p>
          </div>
        )}
      </CustomizerCard>

      {/* 5. Kata sandi */}
      <CustomizerCard
        icon={<Lock className="w-5 h-5" />}
        title="Kata sandi"
        subtitle="Minta kata sandi untuk membuka kode QR ini"
      >
        <label className="inline-flex items-center gap-3 cursor-pointer select-none">
          <button
            type="button"
            role="switch"
            aria-checked={passwordOpts.enabled}
            onClick={() =>
              onChangePassword({
                ...passwordOpts,
                enabled: !passwordOpts.enabled,
              })
            }
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              passwordOpts.enabled ? 'bg-blue-600' : 'bg-zinc-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-xs ${
                passwordOpts.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm font-medium text-zinc-800">
            Wajibkan kata sandi untuk membuka kode QR ini
          </span>
        </label>

        {passwordOpts.enabled && (
          <div className="pt-2 space-y-2.5">
            <label className="block text-xs sm:text-sm font-bold text-zinc-800">
              {passwordOpts.alreadyProtected
                ? 'Kata sandi baru (kosongkan jika tidak ingin mengubah)'
                : 'Masukkan kata sandi QR'}
              {!passwordOpts.alreadyProtected && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPasswordText ? 'text' : 'password'}
                value={passwordOpts.password}
                onChange={(e) =>
                  onChangePassword({ ...passwordOpts, password: e.target.value })
                }
                placeholder={
                  passwordOpts.alreadyProtected
                    ? 'Kata sandi aktif tersimpan di server...'
                    : 'Minimal 4 karakter'
                }
                className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm text-zinc-900 focus:outline-none focus:ring-2 ${
                  errors.password
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-200 focus:border-blue-600 focus:ring-blue-600/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPasswordText((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                {showPasswordText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs font-medium text-red-600">{errors.password}</p>
            )}
            <p className="text-xs text-blue-800 bg-blue-50 border border-blue-200/80 rounded-xl px-3.5 py-2.5">
              Saat dipindai, kamera HP akan membuka halaman verifikasi sandi terlebih dahulu sebelum meneruskan pengguna ke URL tujuan.
            </p>
          </div>
        )}
      </CustomizerCard>
    </div>
  );
}
