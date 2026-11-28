import { useState } from 'react';
import type { ChangeEvent, ReactNode, RefObject } from 'react';
import {
  AlertTriangle,
  ArrowLeftRight,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  DEFAULT_VCARD_BRUTALISM_PALETTE,
  VCARD_BRUTALISM_SCHEMES,
} from '../../types/qrGenerator';
import type {
  VCardBrutalismPalette,
  VCardColorScheme,
  VCardDesignStyle,
  VCardSocialItem,
} from '../../types/qrGenerator';
import {
  VCARD_SOCIAL_PLATFORMS,
  getSocialPlatformMeta,
} from '../../lib/qrPresets';
import {
  createRowId,
  hasLowColorContrast,
  resolveVCardBrutalismPalette,
} from '../../lib/qrHelpers';

/**
 * Akordeon sub-bagian untuk mengelompokkan fieldset di dalam kartu form.
 */
export function SubAccordion({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-zinc-50/80 border border-zinc-200/70 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3.5 flex items-center gap-2.5 text-left hover:bg-zinc-100/70 transition-colors cursor-pointer"
      >
        <ChevronRight
          className={`w-4 h-4 text-zinc-700 transition-transform duration-150 ${
            open ? 'rotate-90' : ''
          }`}
        />
        <span className="text-sm font-bold text-zinc-900">{title}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-2 border-t border-zinc-200/60 bg-white space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Input pemilih warna Hex beserta swatch native `<input type="color">`.
 */
export function ColorHexPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const safeHex = /^#([0-9a-fA-F]{6})$/.test(value) ? value : '#6594FF';
  return (
    <div className="flex-1 min-w-0">
      <label className="block text-xs sm:text-sm font-bold text-zinc-800 mb-2">
        {label}
      </label>
      <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl px-3.5 py-2.5 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-600/15 transition-all">
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

/**
 * Field pengunggah gambar dengan pratinjau berkas, tombol edit, hapus, dan opsional lihat layar penuh.
 */
export function ImagePickerField({
  label,
  hint,
  emptyTitle,
  imageUrl,
  fileName,
  fallbackFileName,
  previewAlt,
  previewClassName,
  editTitle,
  inputRef,
  onFileChange,
  onRemove,
  onPreview,
}: {
  label: string;
  hint?: string;
  emptyTitle: string;
  imageUrl: string | null;
  fileName: string;
  fallbackFileName: string;
  previewAlt: string;
  previewClassName: string;
  editTitle: string;
  inputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  onPreview?: () => void;
}) {
  return (
    <div>
      {label && (
        <div className="mb-2">
          <label className="block text-sm font-bold text-zinc-900">{label}</label>
          {hint && <p className="text-xs text-zinc-500 mt-0.5">{hint}</p>}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,.jfif"
        onChange={onFileChange}
        className="hidden"
      />
      {imageUrl ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={imageUrl}
              alt={previewAlt}
              className={previewClassName}
            />
            <span className="text-sm font-semibold text-zinc-800 truncate">
              {fileName || fallbackFileName}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {onPreview && (
              <button
                type="button"
                title="Pratinjau layar selamat datang di ponsel"
                onClick={onPreview}
                className="p-2.5 rounded-xl border border-blue-300 bg-blue-50/50 text-blue-600 hover:bg-blue-100/70 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              title={editTitle}
              onClick={() => inputRef.current?.click()}
              className="p-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-zinc-200 hover:border-blue-400 bg-zinc-50/50 hover:bg-blue-50/30 px-4 py-5 flex items-center justify-between gap-3 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3 text-left">
            <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">{emptyTitle}</p>
              <p className="text-xs text-zinc-500">Ukuran maksimum: 5 MB</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-600 flex-shrink-0">
            Pilih File
          </span>
        </button>
      )}
    </div>
  );
}

/**
 * Editor daftar jejaring sosial interaktif berbasis ikon platform yang dapat dipakai ulang.
 */
export function SocialNetworksField({
  socials,
  error,
  onChange,
}: {
  socials: VCardSocialItem[];
  error?: string;
  onChange: (next: VCardSocialItem[]) => void;
}) {
  const [showMoreSocials, setShowMoreSocials] = useState(false);

  const visiblePlatforms = showMoreSocials
    ? VCARD_SOCIAL_PLATFORMS
    : VCARD_SOCIAL_PLATFORMS.filter((p) => !p.extra);

  const addSocialPlatform = (platformId: string) => {
    const meta = getSocialPlatformMeta(platformId);
    onChange([
      ...socials,
      {
        id: createRowId('soc'),
        platform: meta.id,
        url: meta.defaultUrl,
        label: meta.defaultText,
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs sm:text-sm font-bold text-zinc-900 mb-3">
          Tambahkan saluran media sosial
        </p>
        <div className="flex flex-wrap gap-2">
          {visiblePlatforms.map((platform) => {
            const hasPlatform = socials.some((s) => s.platform === platform.id);
            return (
              <button
                key={platform.id}
                type="button"
                title={`Tambah ${platform.label}`}
                onClick={() => addSocialPlatform(platform.id)}
                className={`w-11 h-11 rounded-xl border flex items-center justify-center p-2 transition-all cursor-pointer ${
                  hasPlatform
                    ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/15'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <img
                  src={platform.iconDataUrl}
                  alt={platform.label}
                  className="w-full h-full object-contain rounded-md"
                />
              </button>
            );
          })}
        </div>
      </div>

      {socials.length > 0 && (
        <div className="space-y-2.5 pt-1">
          {socials.map((item) => {
            const meta = getSocialPlatformMeta(item.platform);
            return (
              <div
                key={item.id}
                className="bg-zinc-50 border border-zinc-200/70 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-2.5"
              >
                <div className="flex items-center gap-2.5 sm:w-36 flex-shrink-0">
                  <img
                    src={meta.iconDataUrl}
                    alt={meta.label}
                    className="w-8 h-8 rounded-lg flex-shrink-0"
                  />
                  <span className="text-sm font-bold text-zinc-900 truncate">
                    {meta.label}
                  </span>
                </div>

                <input
                  type="url"
                  value={item.url}
                  onChange={(e) =>
                    onChange(
                      socials.map((s) =>
                        s.id === item.id ? { ...s, url: e.target.value } : s
                      )
                    )
                  }
                  placeholder={meta.defaultUrl}
                  className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-blue-600"
                />

                <div className="flex items-center gap-2 sm:w-44">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) =>
                      onChange(
                        socials.map((s) =>
                          s.id === item.id ? { ...s, label: e.target.value } : s
                        )
                      )
                    }
                    placeholder={meta.defaultText}
                    className="flex-1 min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-blue-600"
                  />
                  <button
                    type="button"
                    title="Hapus tautan"
                    onClick={() =>
                      onChange(socials.filter((s) => s.id !== item.id))
                    }
                    className="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => setShowMoreSocials((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {showMoreSocials ? 'Tampilkan lebih sedikit' : 'Tambahkan lebih banyak'}
        </button>
      </div>
    </div>
  );
}

/**
 * Pemilih gaya tampilan (Default vs Brutalism) beserta editor palet warna yang dipakai bersama di vCard & Halaman Bisnis.
 */
export function QRDesignStyleSection({
  styleHeading,
  defaultDescription,
  defaultSchemes,
  defaultSwatchVariant = 'split-pills',
  designStyle,
  primaryColor,
  secondaryColor,
  brutalismPalette,
  onSelectStyle,
  onChangeDefaultColors,
  onChangeBrutalismPalette,
}: {
  styleHeading: string;
  defaultDescription: string;
  defaultSchemes: readonly VCardColorScheme[];
  defaultSwatchVariant?: 'split-pills' | 'stacked-card';
  designStyle: VCardDesignStyle;
  primaryColor: string;
  secondaryColor: string;
  brutalismPalette?: VCardBrutalismPalette;
  onSelectStyle: (
    nextStyle: VCardDesignStyle,
    ensuredPalette: VCardBrutalismPalette
  ) => void;
  onChangeDefaultColors: (nextPrimary: string, nextSecondary: string) => void;
  onChangeBrutalismPalette: (nextPalette: VCardBrutalismPalette) => void;
}) {
  const activePalette = resolveVCardBrutalismPalette(brutalismPalette);
  const isLowSurfaceContrast = hasLowColorContrast(
    activePalette.surface,
    activePalette.text,
    4.5
  );

  const patchBrutalism = (patch: Partial<VCardBrutalismPalette>) => {
    onChangeBrutalismPalette({ ...activePalette, ...patch });
  };

  return (
    <>
      <div className="space-y-2">
        <p className="text-xs sm:text-sm font-bold text-zinc-900">
          {styleHeading}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onSelectStyle('default', activePalette)}
            className={`rounded-xl border p-3 text-left transition-all flex items-center gap-3 cursor-pointer ${
              designStyle === 'default'
                ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40'
                : 'border-zinc-200 hover:border-zinc-300 bg-white'
            }`}
          >
            <div className="w-14 h-12 rounded-lg overflow-hidden border border-zinc-200 flex-shrink-0 flex flex-col bg-white">
              <div
                className="h-5 flex items-center justify-center"
                style={{ backgroundColor: primaryColor || '#6594FF' }}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-white/90 shadow-2xs" />
              </div>
              <div className="flex-1 p-1.5 space-y-1">
                <span className="block h-1.5 w-3/4 rounded-full bg-zinc-200" />
                <span className="block h-1.5 w-1/2 rounded-full bg-zinc-100" />
              </div>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-900">Default</p>
              <p className="text-xs text-zinc-500 leading-snug">
                {defaultDescription}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectStyle('brutalism', activePalette)}
            className={`rounded-xl border p-3 text-left transition-all flex items-center gap-3 cursor-pointer ${
              designStyle === 'brutalism'
                ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40'
                : 'border-zinc-200 hover:border-zinc-300 bg-white'
            }`}
          >
            <div
              className="w-14 h-12 rounded-sm overflow-hidden flex-shrink-0 flex flex-col border-2"
              style={{
                borderColor: activePalette.text,
                backgroundColor: activePalette.surface,
                boxShadow: `2px 2px 0px ${activePalette.text}`,
              }}
            >
              <div
                className="h-5 px-1.5 flex items-center justify-between border-b-2"
                style={{
                  backgroundColor: activePalette.primary,
                  borderColor: activePalette.text,
                }}
              >
                <span
                  className="w-3 h-3 rounded-xs border bg-white"
                  style={{ borderColor: activePalette.text }}
                />
                <span
                  className="w-4 h-2 rounded-xs border"
                  style={{
                    backgroundColor: activePalette.secondary,
                    borderColor: activePalette.text,
                  }}
                />
              </div>
              <div className="flex-1 p-1.5 space-y-1">
                <span
                  className="block h-1.5 w-4/5"
                  style={{ backgroundColor: activePalette.text }}
                />
                <span
                  className="block h-1.5 w-1/2 opacity-40"
                  style={{ backgroundColor: activePalette.text }}
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-zinc-900">Brutalism</p>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-mono font-bold uppercase">
                  Baru
                </span>
              </div>
              <p className="text-xs text-zinc-500 leading-snug">
                Border tebal, bayangan tajam & palet kontras tinggi
              </p>
            </div>
          </button>
        </div>
      </div>

      {designStyle === 'default' ? (
        <>
          <div className="flex flex-wrap gap-2.5 pt-1">
            {defaultSchemes.map((scheme) => {
              const active =
                primaryColor.toUpperCase() === scheme.primary.toUpperCase() &&
                secondaryColor.toUpperCase() === scheme.secondary.toUpperCase();
              return (
                <button
                  key={scheme.id}
                  type="button"
                  title={scheme.label}
                  onClick={() =>
                    onChangeDefaultColors(scheme.primary, scheme.secondary)
                  }
                  className={`p-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  {defaultSwatchVariant === 'stacked-card' ? (
                    <div className="w-16 h-9 rounded-lg overflow-hidden border border-zinc-200/80 flex flex-col">
                      <span
                        className="flex-1 w-full"
                        style={{ backgroundColor: scheme.primary }}
                      />
                      <span
                        className="h-3.5 w-full"
                        style={{ backgroundColor: scheme.secondary }}
                      />
                    </div>
                  ) : (
                    <>
                      <span
                        className="w-7 h-7 rounded-lg border border-zinc-200/70"
                        style={{ backgroundColor: scheme.primary }}
                      />
                      <span
                        className="w-7 h-7 rounded-lg border border-zinc-200/70"
                        style={{ backgroundColor: scheme.secondary }}
                      />
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-end gap-3">
            <ColorHexPicker
              label="Warna primer"
              value={primaryColor}
              onChange={(hex) => onChangeDefaultColors(hex, secondaryColor)}
            />
            <button
              type="button"
              title="Tukar warna primer dan sekunder"
              onClick={() => onChangeDefaultColors(secondaryColor, primaryColor)}
              className="self-center sm:mb-2 p-2 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/70 transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
            <ColorHexPicker
              label="Warna sekunder"
              value={secondaryColor}
              onChange={(hex) => onChangeDefaultColors(primaryColor, hex)}
            />
          </div>
        </>
      ) : (
        <div className="space-y-4 pt-1">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs sm:text-sm font-bold text-zinc-900">
                Preset palet warna Brutalism
              </p>
              <button
                type="button"
                onClick={() => patchBrutalism(DEFAULT_VCARD_BRUTALISM_PALETTE)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Palet
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VCARD_BRUTALISM_SCHEMES.map((scheme) => {
                const active =
                  activePalette.primary.toUpperCase() ===
                    scheme.palette.primary.toUpperCase() &&
                  activePalette.secondary.toUpperCase() ===
                    scheme.palette.secondary.toUpperCase() &&
                  activePalette.surface.toUpperCase() ===
                    scheme.palette.surface.toUpperCase() &&
                  activePalette.text.toUpperCase() ===
                    scheme.palette.text.toUpperCase();
                return (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => patchBrutalism(scheme.palette)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40'
                        : 'border-zinc-200 hover:border-zinc-300 bg-white'
                    }`}
                  >
                    <div
                      className="flex items-center h-6 rounded border-2 overflow-hidden mb-1.5"
                      style={{ borderColor: scheme.palette.text }}
                    >
                      <span
                        className="flex-1 h-full"
                        style={{ backgroundColor: scheme.palette.primary }}
                      />
                      <span
                        className="flex-1 h-full"
                        style={{ backgroundColor: scheme.palette.secondary }}
                      />
                      <span
                        className="flex-1 h-full"
                        style={{ backgroundColor: scheme.palette.surface }}
                      />
                      <span
                        className="w-4 h-full"
                        style={{ backgroundColor: scheme.palette.text }}
                      />
                    </div>
                    <span className="block text-[11px] font-semibold text-zinc-800 truncate">
                      {scheme.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ColorHexPicker
                label="Warna primer (Blok Hero & Tag)"
                value={activePalette.primary}
                onChange={(hex) => patchBrutalism({ primary: hex })}
              />
              <ColorHexPicker
                label="Warna sekunder (Tombol & Aksen)"
                value={activePalette.secondary}
                onChange={(hex) => patchBrutalism({ secondary: hex })}
              />
              <ColorHexPicker
                label="Warna latar / permukaan (Surface)"
                value={activePalette.surface}
                onChange={(hex) => patchBrutalism({ surface: hex })}
              />
              <ColorHexPicker
                label="Warna teks & garis tepi (Ink)"
                value={activePalette.text}
                onChange={(hex) => patchBrutalism({ text: hex })}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  patchBrutalism({
                    primary: activePalette.secondary,
                    secondary: activePalette.primary,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Tukar Primer & Sekunder
              </button>
            </div>

            {isLowSurfaceContrast && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Kontras antara warna latar (<em>surface</em>) dan teks terlalu rendah untuk standar WCAG AA. Pilih teks lebih gelap atau latar lebih terang agar kartu tetap terbaca jelas.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
