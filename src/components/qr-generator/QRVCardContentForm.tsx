import { useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  Eye,
  ImagePlus,
  Paintbrush,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import {
  VCARD_COLOR_SCHEMES,
  INITIAL_VCARD_CONTENT,
} from '../../types/qrGenerator';
import type {
  VCardContent,
  VCardEmailLabel,
  VCardPhoneLabel,
} from '../../types/qrGenerator';
import {
  VCARD_SOCIAL_PLATFORMS,
  getSocialPlatformMeta,
} from '../../lib/qrPresets';
import { validateLogoFileMeta } from '../../lib/qrHelpers';
import { readFileAsDataUrl } from '../../lib/qrExport';
import { showError } from '../../utils/swal';
import QRImageEditorModal from './QRImageEditorModal';

interface QRVCardContentFormProps {
  content: VCardContent;
  errors: Record<string, string>;
  onChange: (updated: VCardContent) => void;
  onPreviewSplash: () => void;
}

const PHONE_LABELS: readonly VCardPhoneLabel[] = [
  'Cara Kerja',
  'Ponsel',
  'Rumah',
  'Faks',
  'Lainnya',
];

const EMAIL_LABELS: readonly VCardEmailLabel[] = [
  'Kerja',
  'Pribadi',
  'Lainnya',
];

function TopAccordionCard({
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
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-zinc-900">{title}</h3>
            <p className="text-xs sm:text-sm text-zinc-500 truncate">{subtitle}</p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-zinc-500 transition-transform duration-200 flex-shrink-0 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      {open && (
        <div className="px-5 sm:px-6 pb-6 pt-4 border-t border-zinc-100 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

function SubAccordion({
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

function ColorHexPicker({
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

type AboutSectionKey = 'personal' | 'contact' | 'company' | 'summary' | 'address';

function createRowId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}`;
}

export default function QRVCardContentForm({
  content,
  errors,
  onChange,
  onPreviewSplash,
}: QRVCardContentFormProps) {
  const [openAbout, setOpenAbout] = useState<Record<AboutSectionKey, boolean>>({
    personal: true,
    contact: false,
    company: false,
    summary: false,
    address: false,
  });
  const [showMoreSocials, setShowMoreSocials] = useState(false);

  const [pendingCrop, setPendingCrop] = useState<{
    target: 'avatar' | 'splash';
    rawUrl: string;
    fileName: string;
  } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const splashInputRef = useRef<HTMLInputElement>(null);

  const toggleAbout = (key: AboutSectionKey) => {
    setOpenAbout((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFillSample = () => {
    setPendingCrop(null);
    onChange({
      ...INITIAL_VCARD_CONTENT,
      type: 'vcard',
      qrName: 'Kartu Nama Adlildzil',
      primaryColor: '#6594FF',
      secondaryColor: '#FFFFFF',
      fullName: 'Adlildzil Arifah',
      phones: [{ id: 'p-sample', label: 'Cara Kerja', number: '+6285156693650' }],
      website: 'adlzil.engineer',
      emails: [{ id: 'e-sample', label: 'Lainnya', email: '19230602@bsi.ac.id' }],
      company: 'nara institute',
      profession: 'Software Engineer',
      summary: 'Full-Stack Developer & UI/UX Designer berpengalaman membangun produk digital.',
      addressMode: 'manual',
      street: 'Muncang',
      postalCode: '14270',
      city: 'Jakarta Utara',
      state: 'DKI Jakarta',
      country: 'Indonesia',
      socials: [
        {
          id: 'soc-sample',
          platform: 'instagram',
          url: 'https://www.instagram.com/',
          label: 'My Instagram',
        },
      ],
    });
  };

  const handleUploadImage = async (
    e: ChangeEvent<HTMLInputElement>,
    target: 'avatar' | 'splash'
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const meta = validateLogoFileMeta({ size: file.size, type: file.type, name: file.name });
    if (!meta.valid) {
      await showError('File Tidak Didukung', meta.error);
      return;
    }

    try {
      const rawUrl = await readFileAsDataUrl(file);
      setPendingCrop({ target, rawUrl, fileName: file.name });
    } catch (err) {
      await showError(
        'Gagal Memuat Gambar',
        err instanceof Error ? err.message : 'Gambar gagal diunggah.'
      );
    }
  };

  const addPhoneRow = () => {
    onChange({
      ...content,
      phones: [
        ...content.phones,
        { id: createRowId('p'), label: 'Ponsel', number: '' },
      ],
    });
  };

  const addEmailRow = () => {
    onChange({
      ...content,
      emails: [
        ...content.emails,
        { id: createRowId('e'), label: 'Kerja', email: '' },
      ],
    });
  };

  const addSocialPlatform = (platformId: string) => {
    const meta = getSocialPlatformMeta(platformId);
    onChange({
      ...content,
      socials: [
        ...content.socials,
        {
          id: createRowId('soc'),
          platform: meta.id,
          url: meta.defaultUrl,
          label: meta.defaultText,
        },
      ],
    });
  };

  const visiblePlatforms = showMoreSocials
    ? VCARD_SOCIAL_PLATFORMS
    : VCARD_SOCIAL_PLATFORMS.filter((p) => !p.extra);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Tambahkan konten ke kode QR vCard
        </h2>
        <button
          type="button"
          onClick={handleFillSample}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Isi Contoh vCard
        </button>
      </div>

      {/* 1. Desain dan sesuaikan */}
      <TopAccordionCard
        icon={<Paintbrush className="w-5 h-5" />}
        title="Desain dan sesuaikan"
        subtitle="Pilih skema warna"
      >
        <div className="flex flex-wrap gap-2.5">
          {VCARD_COLOR_SCHEMES.map((scheme) => {
            const active =
              content.primaryColor.toUpperCase() === scheme.primary.toUpperCase() &&
              content.secondaryColor.toUpperCase() === scheme.secondary.toUpperCase();
            return (
              <button
                key={scheme.id}
                type="button"
                title={scheme.label}
                onClick={() =>
                  onChange({
                    ...content,
                    primaryColor: scheme.primary,
                    secondaryColor: scheme.secondary,
                  })
                }
                className={`p-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40'
                    : 'border-zinc-200 hover:border-zinc-300 bg-white'
                }`}
              >
                <span
                  className="w-7 h-7 rounded-lg border border-zinc-200/70"
                  style={{ backgroundColor: scheme.primary }}
                />
                <span
                  className="w-7 h-7 rounded-lg border border-zinc-200/70"
                  style={{ backgroundColor: scheme.secondary }}
                />
              </button>
            );
          })}
        </div>

        <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-end gap-3">
          <ColorHexPicker
            label="Warna primer"
            value={content.primaryColor}
            onChange={(hex) => onChange({ ...content, primaryColor: hex })}
          />
          <button
            type="button"
            title="Tukar warna primer dan sekunder"
            onClick={() =>
              onChange({
                ...content,
                primaryColor: content.secondaryColor,
                secondaryColor: content.primaryColor,
              })
            }
            className="self-center sm:mb-2 p-2 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/70 transition-colors cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
          <ColorHexPicker
            label="Warna sekunder"
            value={content.secondaryColor}
            onChange={(hex) => onChange({ ...content, secondaryColor: hex })}
          />
        </div>
      </TopAccordionCard>

      {/* 2. Tentang Anda */}
      <TopAccordionCard
        icon={<User className="w-5 h-5" />}
        title="Tentang Anda"
        subtitle="Isi informasi yang ingin ditampilkan pada vCard Anda"
      >
        {/* 2a. Informasi pribadi */}
        <SubAccordion
          title="Informasi pribadi"
          open={openAbout.personal}
          onToggle={() => toggleAbout('personal')}
        >
          <div>
            <label
              htmlFor="vcard-full-name"
              className="block text-sm font-bold text-zinc-900 mb-2"
            >
              Nama lengkap<span className="text-red-500 ml-0.5">*</span>
            </label>
            <input
              id="vcard-full-name"
              type="text"
              value={content.fullName}
              onChange={(e) => onChange({ ...content, fullName: e.target.value })}
              placeholder="misalnya Adlildzil Arifah"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                errors.fullName
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-zinc-200 focus:border-blue-600 focus:ring-blue-600/15'
              }`}
            />
            {errors.fullName && (
              <p className="text-xs font-medium text-red-600 mt-1.5">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-zinc-900 mb-2">Gambar</label>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,.jfif"
              onChange={(e) => void handleUploadImage(e, 'avatar')}
              className="hidden"
            />
            {content.avatarDataUrl ? (
              <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={content.avatarDataUrl}
                    alt="Foto profil"
                    className="w-14 h-14 rounded-xl object-cover border border-zinc-200 flex-shrink-0"
                  />
                  <span className="text-sm font-semibold text-zinc-800 truncate">
                    {content.avatarFileName || 'foto-profil.webp'}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    type="button"
                    title="Pilih gambar baru"
                    onClick={() => avatarInputRef.current?.click()}
                    className="p-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...content,
                        avatarDataUrl: null,
                        avatarFileName: '',
                      });
                    }}
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
                onClick={() => avatarInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-zinc-200 hover:border-blue-400 bg-zinc-50/50 hover:bg-blue-50/30 px-4 py-5 flex items-center justify-between gap-3 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      Unggah foto profil (jpg, png, svg)
                    </p>
                    <p className="text-xs text-zinc-500">Ukuran maksimum: 5 MB</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 flex-shrink-0">
                  Pilih File
                </span>
              </button>
            )}
          </div>
        </SubAccordion>

        {/* 2b. Perincian kontak */}
        <SubAccordion
          title="Perincian kontak"
          open={openAbout.contact}
          onToggle={() => toggleAbout('contact')}
        >
          {/* Nomor telepon */}
          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-zinc-900">
              Nomor telepon
            </label>
            {content.phones.map((item, idx) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-2">
                <select
                  value={item.label}
                  onChange={(e) => {
                    const updated = content.phones.map((p) =>
                      p.id === item.id
                        ? { ...p, label: e.target.value as VCardPhoneLabel }
                        : p
                    );
                    onChange({ ...content, phones: updated });
                  }}
                  className="sm:w-40 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:border-blue-600"
                >
                  {PHONE_LABELS.map((lbl) => (
                    <option key={lbl} value={lbl}>
                      {lbl}
                    </option>
                  ))}
                </select>
                <div className="flex-1 flex gap-2">
                  <input
                    type="tel"
                    value={item.number}
                    onChange={(e) => {
                      const updated = content.phones.map((p) =>
                        p.id === item.id ? { ...p, number: e.target.value } : p
                      );
                      onChange({ ...content, phones: updated });
                    }}
                    placeholder="+6281234567890"
                    className="flex-1 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                  {idx === content.phones.length - 1 ? (
                    <button
                      type="button"
                      title="Tambah nomor telepon"
                      onClick={addPhoneRow}
                      className="w-10 h-10 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 flex items-center justify-center flex-shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      title="Hapus baris nomor"
                      onClick={() =>
                        onChange({
                          ...content,
                          phones: content.phones.filter((p) => p.id !== item.id),
                        })
                      }
                      className="w-10 h-10 rounded-xl border border-zinc-200 hover:bg-red-50 hover:text-red-600 text-zinc-500 flex items-center justify-center flex-shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Situs web */}
          <div>
            <label
              htmlFor="vcard-website"
              className="block text-sm font-bold text-zinc-900 mb-2"
            >
              Situs web
            </label>
            <input
              id="vcard-website"
              type="url"
              value={content.website}
              onChange={(e) => onChange({ ...content, website: e.target.value })}
              placeholder="misalnya adlzil.engineer"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                errors.website
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                  : 'border-zinc-200 focus:border-blue-600 focus:ring-blue-600/15'
              }`}
            />
            {errors.website && (
              <p className="text-xs font-medium text-red-600 mt-1">{errors.website}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2.5">
            <label className="block text-sm font-bold text-zinc-900">Email</label>
            {content.emails.map((item, idx) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-2">
                <select
                  value={item.label}
                  onChange={(e) => {
                    const updated = content.emails.map((em) =>
                      em.id === item.id
                        ? { ...em, label: e.target.value as VCardEmailLabel }
                        : em
                    );
                    onChange({ ...content, emails: updated });
                  }}
                  className="sm:w-40 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-800 focus:outline-none focus:border-blue-600"
                >
                  {EMAIL_LABELS.map((lbl) => (
                    <option key={lbl} value={lbl}>
                      {lbl}
                    </option>
                  ))}
                </select>
                <div className="flex-1 flex gap-2">
                  <input
                    type="email"
                    value={item.email}
                    onChange={(e) => {
                      const updated = content.emails.map((em) =>
                        em.id === item.id ? { ...em, email: e.target.value } : em
                      );
                      onChange({ ...content, emails: updated });
                    }}
                    placeholder="nama@example.com"
                    className="flex-1 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
                  />
                  {idx === content.emails.length - 1 ? (
                    <button
                      type="button"
                      title="Tambah email"
                      onClick={addEmailRow}
                      className="w-10 h-10 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-700 flex items-center justify-center flex-shrink-0 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      title="Hapus email"
                      onClick={() =>
                        onChange({
                          ...content,
                          emails: content.emails.filter((em) => em.id !== item.id),
                        })
                      }
                      className="w-10 h-10 rounded-xl border border-zinc-200 hover:bg-red-50 hover:text-red-600 text-zinc-500 flex items-center justify-center flex-shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            {errors.emails && (
              <p className="text-xs font-medium text-red-600">{errors.emails}</p>
            )}
          </div>
        </SubAccordion>

        {/* 2c. Perincian perusahaan */}
        <SubAccordion
          title="Perincian perusahaan"
          open={openAbout.company}
          onToggle={() => toggleAbout('company')}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="vcard-company"
                className="block text-sm font-bold text-zinc-900 mb-2"
              >
                Nama perusahaan
              </label>
              <input
                id="vcard-company"
                type="text"
                value={content.company}
                onChange={(e) => onChange({ ...content, company: e.target.value })}
                placeholder="misalnya Nara Institute"
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
            </div>
            <div>
              <label
                htmlFor="vcard-profession"
                className="block text-sm font-bold text-zinc-900 mb-2"
              >
                Profesi
              </label>
              <input
                id="vcard-profession"
                type="text"
                value={content.profession}
                onChange={(e) => onChange({ ...content, profession: e.target.value })}
                placeholder="misalnya Software Engineer"
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
            </div>
          </div>
        </SubAccordion>

        {/* 2d. Ringkasan */}
        <SubAccordion
          title="Ringkasan"
          open={openAbout.summary}
          onToggle={() => toggleAbout('summary')}
        >
          <div>
            <label
              htmlFor="vcard-summary"
              className="block text-sm font-bold text-zinc-900 mb-2"
            >
              Teks
            </label>
            <textarea
              id="vcard-summary"
              rows={3}
              value={content.summary}
              onChange={(e) => onChange({ ...content, summary: e.target.value })}
              placeholder="Tuliskan bio singkat atau profil Anda..."
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 resize-y"
            />
          </div>
        </SubAccordion>

        {/* 2e. Alamat */}
        <SubAccordion
          title="Alamat"
          open={openAbout.address}
          onToggle={() => toggleAbout('address')}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...content, addressMode: 'manual' })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                content.addressMode === 'manual'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...content, addressMode: 'url' })}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                content.addressMode === 'url'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              URL
            </button>
          </div>

          {content.addressMode === 'manual' ? (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1.5">
                    Jalan
                  </label>
                  <input
                    type="text"
                    value={content.street}
                    onChange={(e) => onChange({ ...content, street: e.target.value })}
                    placeholder="Nama jalan & nomor"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1.5">
                    Kode pos
                  </label>
                  <input
                    type="text"
                    value={content.postalCode}
                    onChange={(e) => onChange({ ...content, postalCode: e.target.value })}
                    placeholder="14270"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1.5">
                    Kota
                  </label>
                  <input
                    type="text"
                    value={content.city}
                    onChange={(e) => onChange({ ...content, city: e.target.value })}
                    placeholder="Jakarta Utara"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1.5">
                    Negara Bagian/Provinsi
                  </label>
                  <input
                    type="text"
                    value={content.state}
                    onChange={(e) => onChange({ ...content, state: e.target.value })}
                    placeholder="DKI Jakarta"
                    className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1.5">
                  Negara
                </label>
                <input
                  type="text"
                  value={content.country}
                  onChange={(e) => onChange({ ...content, country: e.target.value })}
                  placeholder="Indonesia"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-zinc-900 mb-1.5">
                URL Lokasi / Google Maps
              </label>
              <input
                type="url"
                value={content.addressUrl}
                onChange={(e) => onChange({ ...content, addressUrl: e.target.value })}
                placeholder="https://maps.google.com/?q=..."
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 ${
                  errors.addressUrl
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-zinc-200 focus:border-blue-600 focus:ring-blue-600/15'
                }`}
              />
              {errors.addressUrl && (
                <p className="text-xs font-medium text-red-600 mt-1">
                  {errors.addressUrl}
                </p>
              )}
            </div>
          )}
        </SubAccordion>
      </TopAccordionCard>

      {/* 3. Jejaring sosial */}
      <TopAccordionCard
        icon={<Share2 className="w-5 h-5" />}
        title="Jejaring sosial"
        subtitle="Klik ikon di bawah untuk menambahkan saluran media sosial yang ingin ditampilkan"
        defaultOpen={false}
      >
        <div>
          <p className="text-xs sm:text-sm font-bold text-zinc-900 mb-3">
            Tambahkan saluran media sosial
          </p>
          <div className="flex flex-wrap gap-2">
            {visiblePlatforms.map((platform) => {
              const hasPlatform = content.socials.some(
                (s) => s.platform === platform.id
              );
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

        {content.socials.length > 0 && (
          <div className="space-y-2.5 pt-1">
            {content.socials.map((item) => {
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
                    onChange={(e) => {
                      const updated = content.socials.map((s) =>
                        s.id === item.id ? { ...s, url: e.target.value } : s
                      );
                      onChange({ ...content, socials: updated });
                    }}
                    placeholder={meta.defaultUrl}
                    className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-blue-600"
                  />

                  <div className="flex items-center gap-2 sm:w-44">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const updated = content.socials.map((s) =>
                          s.id === item.id ? { ...s, label: e.target.value } : s
                        );
                        onChange({ ...content, socials: updated });
                      }}
                      placeholder={meta.defaultText}
                      className="flex-1 min-w-0 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      title="Hapus tautan"
                      onClick={() =>
                        onChange({
                          ...content,
                          socials: content.socials.filter((s) => s.id !== item.id),
                        })
                      }
                      className="p-2 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
            {errors.socials && (
              <p className="text-xs font-medium text-red-600">{errors.socials}</p>
            )}
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
      </TopAccordionCard>

      {/* 4. Layar selamat datang */}
      <TopAccordionCard
        icon={<ImagePlus className="w-5 h-5" />}
        title="Layar selamat datang"
        subtitle="Menampilkan logo khusus saat halaman Anda dimuat"
        defaultOpen={false}
      >
        <div>
          <label className="block text-sm font-bold text-zinc-900 mb-2">Gambar</label>
          <input
            ref={splashInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,.jfif"
            onChange={(e) => void handleUploadImage(e, 'splash')}
            className="hidden"
          />
          {content.splashDataUrl ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={content.splashDataUrl}
                  alt="Logo layar selamat datang"
                  className="w-14 h-14 rounded-xl object-contain bg-zinc-50 border border-zinc-200 p-1 flex-shrink-0"
                />
                <span className="text-sm font-semibold text-zinc-800 truncate">
                  {content.splashFileName || 'layar-selamat-datang.webp'}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  title="Pratinjau layar selamat datang di ponsel"
                  onClick={onPreviewSplash}
                  className="p-2.5 rounded-xl border border-blue-300 bg-blue-50/50 text-blue-600 hover:bg-blue-100/70 transition-colors cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Pilih gambar layar selamat datang baru"
                  onClick={() => splashInputRef.current?.click()}
                  className="p-2.5 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      ...content,
                      splashDataUrl: null,
                      splashFileName: '',
                    });
                  }}
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
              onClick={() => splashInputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-zinc-200 hover:border-blue-400 bg-zinc-50/50 hover:bg-blue-50/30 px-4 py-5 flex items-center justify-between gap-3 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-11 h-11 rounded-xl bg-white border border-zinc-200 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">
                    Unggah logo layar selamat datang (jpg, png, svg)
                  </p>
                  <p className="text-xs text-zinc-500">Ukuran maksimum: 5 MB</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-blue-600 flex-shrink-0">
                Pilih File
              </span>
            </button>
          )}
        </div>
      </TopAccordionCard>

      {/* 5. Nama kode QR */}
      <TopAccordionCard
        icon={<Pencil className="w-5 h-5" />}
        title="Nama kode QR"
        subtitle="Tentukan nama untuk kode QR Anda (opsional)"
        defaultOpen={false}
      >
        <div>
          <label
            htmlFor="vcard-qr-name"
            className="block text-sm font-bold text-zinc-900 mb-2"
          >
            Beri nama kode QR Anda
          </label>
          <input
            id="vcard-qr-name"
            type="text"
            maxLength={80}
            value={content.qrName}
            onChange={(e) => onChange({ ...content, qrName: e.target.value })}
            placeholder="misalnya MyQrBro"
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
          />
        </div>
      </TopAccordionCard>

      {/* Modal Crop & Sesuaikan Gambar Baru */}
      {pendingCrop && (
        <QRImageEditorModal
          imageUrl={pendingCrop.rawUrl}
          squareCrop={pendingCrop.target === 'avatar'}
          onClose={() => setPendingCrop(null)}
          onSave={(processed) => {
            if (pendingCrop.target === 'avatar') {
              onChange({
                ...content,
                avatarDataUrl: processed,
                avatarFileName: pendingCrop.fileName,
              });
            } else {
              onChange({
                ...content,
                splashDataUrl: processed,
                splashFileName: pendingCrop.fileName,
              });
            }
            setPendingCrop(null);
          }}
        />
      )}
    </div>
  );
}
