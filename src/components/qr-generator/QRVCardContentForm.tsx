import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  FlipHorizontal2,
  ImagePlus,
  Paintbrush,
  Pencil,
  Plus,
  Share2,
  Shuffle,
  Sparkles,
  Trash2,
  User,
  Waves,
} from 'lucide-react';
import {
  VCARD_COLOR_SCHEMES,
  DEFAULT_VCARD_BRUTALISM_PALETTE,
  INITIAL_VCARD_CONTENT,
  DEFAULT_VCARD_BANNER_WAVE,
} from '../../types/qrGenerator';
import type {
  VCardBannerWaveConfig,
  VCardBannerWaveShape,
  VCardContent,
  VCardEmailLabel,
  VCardPhoneLabel,
} from '../../types/qrGenerator';
import {
  createRowId,
  resolveVCardBrutalismPalette,
  validateLogoFileMeta,
} from '../../lib/qrHelpers';
import { readFileAsDataUrl } from '../../lib/qrExport';
import { showError } from '../../utils/swal';
import QRImageEditorModal from './QRImageEditorModal';
import {
  ImagePickerField as VCardImagePickerField,
  QRDesignStyleSection,
  SocialNetworksField,
  SubAccordion,
} from './QRFormPrimitives';
import QRVCardExtraSectionsEditor, {
  QRVCardSectionCard as TopAccordionCard,
} from './QRVCardExtraSectionsEditor';
import { VCardBannerWaveSvg } from './VCardMobileView';

const WAVE_SHAPES: readonly { id: VCardBannerWaveShape; label: string }[] = [
  { id: 'smooth', label: 'Halus' },
  { id: 'organic', label: 'Organik' },
  { id: 'layered', label: 'Berlapis' },
  { id: 'arch', label: 'Lengkung' },
  { id: 'sharp', label: 'Tajam' },
];

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

type AboutSectionKey = 'personal' | 'contact' | 'company' | 'summary' | 'address';
type VCardImageTarget = 'avatar' | 'banner' | 'splash';

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

  const [pendingCrop, setPendingCrop] = useState<{
    target: VCardImageTarget;
    rawUrl: string;
    fileName: string;
  } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const splashInputRef = useRef<HTMLInputElement>(null);

  const toggleAbout = (key: AboutSectionKey) => {
    setOpenAbout((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFillSample = () => {
    setPendingCrop(null);
    onChange({
      ...INITIAL_VCARD_CONTENT,
      type: 'vcard',
      designStyle: content.designStyle ?? 'default',
      brutalismPalette: content.brutalismPalette ?? DEFAULT_VCARD_BRUTALISM_PALETTE,
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
      availabilityStatus: 'Terbuka untuk peluang & kolaborasi',
      workingHours: 'Senin–Jumat, 09:00–17:00 WIB',
      skills: [
        'Full-Stack Development',
        'UI/UX Design',
        'React & TypeScript',
        'System Architecture',
      ],
      showShareButton: true,
      defaultOpenSection: 'summary',
    });
  };

  const handleUploadImage = async (
    e: ChangeEvent<HTMLInputElement>,
    target: VCardImageTarget
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
        subtitle="Pilih gaya kartu & skema warna"
      >
        <QRDesignStyleSection
          styleHeading="Gaya tampilan vCard"
          defaultDescription="Modern halus, avatar bulat & gelombang banner"
          defaultSchemes={VCARD_COLOR_SCHEMES}
          designStyle={content.designStyle ?? 'default'}
          primaryColor={content.primaryColor}
          secondaryColor={content.secondaryColor}
          brutalismPalette={content.brutalismPalette}
          onSelectStyle={(nextStyle, ensuredPalette) =>
            onChange({
              ...content,
              designStyle: nextStyle,
              brutalismPalette:
                nextStyle === 'brutalism' ? ensuredPalette : content.brutalismPalette,
            })
          }
          onChangeDefaultColors={(nextPrimary, nextSecondary) =>
            onChange({
              ...content,
              primaryColor: nextPrimary,
              secondaryColor: nextSecondary,
            })
          }
          onChangeBrutalismPalette={(nextPalette) =>
            onChange({
              ...content,
              designStyle: 'brutalism',
              brutalismPalette: nextPalette,
            })
          }
        />

        <div className="pt-2 border-t border-zinc-100 space-y-4">
          <VCardImagePickerField
            label="Gambar banner (opsional)"
            hint="Kosongkan untuk memakai warna primer default sebagai latar belakang atas."
            emptyTitle="Unggah gambar banner (jpg, png, svg)"
            imageUrl={content.bannerDataUrl}
            fileName={content.bannerFileName}
            fallbackFileName="banner-vcard.webp"
            previewAlt="Banner vCard"
            previewClassName="w-20 h-14 rounded-xl object-cover border border-zinc-200 flex-shrink-0"
            editTitle="Pilih gambar banner baru"
            inputRef={bannerInputRef}
            onFileChange={(e) => void handleUploadImage(e, 'banner')}
            onRemove={() =>
              onChange({
                ...content,
                bannerDataUrl: null,
                bannerFileName: '',
              })
            }
          />

          {/* Shape Wave pada Banner (didukung di gaya Default & Brutalism) */}
          {(() => {
            const isBrutal = (content.designStyle ?? 'default') === 'brutalism';
            const brutalPalette = resolveVCardBrutalismPalette(
              content.brutalismPalette
            );
            const wavePreviewBg = isBrutal
              ? brutalPalette.primary
              : content.primaryColor || '#6594FF';
            const wavePreviewFill = isBrutal
              ? brutalPalette.surface
              : content.secondaryColor || '#FFFFFF';
            const wave: VCardBannerWaveConfig = {
              ...DEFAULT_VCARD_BANNER_WAVE,
              ...(content.bannerWave ?? {}),
            };
            const updateWave = (patch: Partial<VCardBannerWaveConfig>) => {
              onChange({
                ...content,
                bannerWave: { ...wave, ...patch },
              });
            };

            return (
              <div className="pt-3 border-t border-zinc-100 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-zinc-900">
                      Bentuk gelombang banner (Wave)
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Pilih tepi bawah banner lurus atau bergelombang artistik.
                    </p>
                  </div>
                  <div className="inline-flex p-1 rounded-xl bg-zinc-100 border border-zinc-200/70 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => updateWave({ enabled: false })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        !wave.enabled
                          ? 'bg-white text-zinc-900 shadow-2xs'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Lurus
                    </button>
                    <button
                      type="button"
                      onClick={() => updateWave({ enabled: true })}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        wave.enabled
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      <Waves className="w-3.5 h-3.5" />
                      Wave
                    </button>
                  </div>
                </div>

                {wave.enabled && (
                  <div className="rounded-xl bg-zinc-50 border border-zinc-200/80 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                        Pilih Bentuk Wave
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateWave({
                              seed: Math.floor(Math.random() * 9000) + 100,
                            })
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 text-xs font-semibold text-zinc-700 transition-colors cursor-pointer"
                        >
                          <Shuffle className="w-3.5 h-3.5" />
                          Acak Bentuk
                        </button>
                        <button
                          type="button"
                          title="Balik arah gelombang kiri-kanan"
                          onClick={() => updateWave({ flipX: !wave.flipX })}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                            wave.flipX
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100'
                          }`}
                        >
                          <FlipHorizontal2 className="w-3.5 h-3.5" />
                          Balik
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {WAVE_SHAPES.map((item) => {
                        const active = wave.shape === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => updateWave({ shape: item.id })}
                            className={`rounded-xl border overflow-hidden text-left transition-all cursor-pointer bg-white ${
                              active
                                ? 'border-blue-500 ring-2 ring-blue-500/20'
                                : 'border-zinc-200 hover:border-zinc-300'
                            }`}
                          >
                            <div
                              className="relative h-10 w-full overflow-hidden border-b border-zinc-100"
                              style={{
                                backgroundColor: wavePreviewBg,
                              }}
                            >
                              <VCardBannerWaveSvg
                                wave={{ ...wave, shape: item.id, enabled: true }}
                                fillColor={wavePreviewFill}
                                strokeColor={isBrutal ? brutalPalette.text : undefined}
                                strokeWidth={1.8}
                                className="absolute -bottom-px inset-x-0 w-full h-5"
                              />
                            </div>
                            <p
                              className={`px-1.5 py-1.5 text-[11px] font-semibold text-center truncate ${
                                active ? 'text-blue-600' : 'text-zinc-700'
                              }`}
                            >
                              {item.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="vcard-wave-complexity"
                            className="text-xs font-semibold text-zinc-700"
                          >
                            Jumlah lengkungan
                          </label>
                          <span className="text-[11px] font-mono text-zinc-500">
                            {wave.complexity} puncak
                          </span>
                        </div>
                        <input
                          id="vcard-wave-complexity"
                          type="range"
                          min={1}
                          max={6}
                          step={1}
                          value={wave.complexity}
                          onChange={(e) =>
                            updateWave({ complexity: Number(e.target.value) })
                          }
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label
                            htmlFor="vcard-wave-height"
                            className="text-xs font-semibold text-zinc-700"
                          >
                            Tinggi gelombang
                          </label>
                          <span className="text-[11px] font-mono text-zinc-500">
                            {wave.height}%
                          </span>
                        </div>
                        <input
                          id="vcard-wave-height"
                          type="range"
                          min={24}
                          max={74}
                          step={2}
                          value={wave.height}
                          onChange={(e) =>
                            updateWave({ height: Number(e.target.value) })
                          }
                          className="w-full accent-blue-600 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
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

          <VCardImagePickerField
            label="Gambar"
            emptyTitle="Unggah foto profil (jpg, png, svg)"
            imageUrl={content.avatarDataUrl}
            fileName={content.avatarFileName}
            fallbackFileName="foto-profil.webp"
            previewAlt="Foto profil"
            previewClassName="w-14 h-14 rounded-xl object-cover border border-zinc-200 flex-shrink-0"
            editTitle="Pilih gambar baru"
            inputRef={avatarInputRef}
            onFileChange={(e) => void handleUploadImage(e, 'avatar')}
            onRemove={() =>
              onChange({
                ...content,
                avatarDataUrl: null,
                avatarFileName: '',
              })
            }
          />
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
        <SocialNetworksField
          socials={content.socials}
          error={errors.socials}
          onChange={(socials) => onChange({ ...content, socials })}
        />
      </TopAccordionCard>

      {/* Bagian Tambahan (Tautan Pilihan, Keahlian & Ketersediaan, Tata Letak) */}
      <QRVCardExtraSectionsEditor
        content={content}
        errors={errors}
        onChange={onChange}
      />

      {/* 4. Layar selamat datang */}
      <TopAccordionCard
        icon={<ImagePlus className="w-5 h-5" />}
        title="Layar selamat datang"
        subtitle="Menampilkan logo khusus saat halaman Anda dimuat"
        defaultOpen={false}
      >
        <VCardImagePickerField
          label="Gambar"
          emptyTitle="Unggah logo layar selamat datang (jpg, png, svg)"
          imageUrl={content.splashDataUrl}
          fileName={content.splashFileName}
          fallbackFileName="layar-selamat-datang.webp"
          previewAlt="Logo layar selamat datang"
          previewClassName="w-14 h-14 rounded-xl object-contain bg-zinc-50 border border-zinc-200 p-1 flex-shrink-0"
          editTitle="Pilih gambar layar selamat datang baru"
          inputRef={splashInputRef}
          onFileChange={(e) => void handleUploadImage(e, 'splash')}
          onPreview={onPreviewSplash}
          onRemove={() =>
            onChange({
              ...content,
              splashDataUrl: null,
              splashFileName: '',
            })
          }
        />
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
          aspectRatio={pendingCrop.target === 'banner' ? 4 / 3 : undefined}
          maxChars={
            pendingCrop.target === 'banner'
              ? 34000
              : pendingCrop.target === 'avatar'
                ? 13000
                : 12000
          }
          onClose={() => setPendingCrop(null)}
          onSave={(processed) => {
            if (pendingCrop.target === 'avatar') {
              onChange({
                ...content,
                avatarDataUrl: processed,
                avatarFileName: pendingCrop.fileName,
              });
            } else if (pendingCrop.target === 'banner') {
              onChange({
                ...content,
                bannerDataUrl: processed,
                bannerFileName: pendingCrop.fileName,
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
