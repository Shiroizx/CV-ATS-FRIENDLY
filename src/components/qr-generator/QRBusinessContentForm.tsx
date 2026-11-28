import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  ImagePlus,
  MapPin,
  Paintbrush,
  Pencil,
  Phone,
  Plus,
  Share2,
  Sparkles,
  Store,
  Trash2,
} from 'lucide-react';
import {
  BUSINESS_COLOR_SCHEMES,
  BUSINESS_DAYS,
  BUSINESS_FACILITIES,
  DEFAULT_VCARD_BRUTALISM_PALETTE,
  INITIAL_BUSINESS_CONTENT,
} from '../../types/qrGenerator';
import type {
  BusinessContent,
  BusinessDayKey,
  BusinessFacilityId,
  BusinessScheduleMode,
  BusinessTimeInterval,
  VCardEmailLabel,
  VCardPhoneLabel,
} from '../../types/qrGenerator';
import {
  createRowId,
  formatBusinessTimeLabel,
  validateLogoFileMeta,
} from '../../lib/qrHelpers';
import { readFileAsDataUrl } from '../../lib/qrExport';
import { showError } from '../../utils/swal';
import QRImageEditorModal from './QRImageEditorModal';
import {
  ImagePickerField,
  QRDesignStyleSection,
  SocialNetworksField,
} from './QRFormPrimitives';
import { QRVCardSectionCard as TopAccordionCard } from './QRVCardExtraSectionsEditor';
import { BusinessFacilityIcon } from './BusinessFacilityIcon';

interface QRBusinessContentFormProps {
  content: BusinessContent;
  errors: Record<string, string>;
  onChange: (updated: BusinessContent) => void;
  onPreviewSplash: () => void;
}

type BusinessImageTarget = 'cover' | 'splash';

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

const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, idx) =>
  String(idx * 5).padStart(2, '0')
);
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, idx) =>
  String(idx).padStart(2, '0')
);

function formatHourOption(hour24: string, mode: BusinessScheduleMode): string {
  const num = Number.parseInt(hour24, 10) || 0;
  if (mode !== 'ampm') return hour24;
  const period = num >= 12 ? 'PM' : 'AM';
  const h12 = num % 12 === 0 ? 12 : num % 12;
  return `${String(h12).padStart(2, '0')} ${period}`;
}

/**
 * Tombol pemilih jam & menit dua kolom dengan tombol Simpan (sesuai desain referensi).
 */
function TimePickerButton({
  value,
  mode,
  disabled = false,
  onCommit,
}: {
  value: string;
  mode: BusinessScheduleMode;
  disabled?: boolean;
  onCommit: (nextHhmm: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [initH = '09', initM = '00'] = value.split(':');
  const [draftHour, setDraftHour] = useState(initH.padStart(2, '0'));
  const [draftMinute, setDraftMinute] = useState(initM.padStart(2, '0'));

  const handleOpen = () => {
    if (disabled) return;
    const [h = '09', m = '00'] = value.split(':');
    setDraftHour(h.padStart(2, '0'));
    setDraftMinute(m.padStart(2, '0'));
    setOpen(true);
  };

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
          disabled
            ? 'border-zinc-200 bg-zinc-100 text-zinc-400 cursor-not-allowed'
            : open
              ? 'border-blue-600 bg-blue-50/40 text-blue-700 cursor-pointer'
              : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-800 cursor-pointer'
        }`}
      >
        <Clock className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
        <span>{formatBusinessTimeLabel(value, mode)}</span>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full mt-1.5 z-30 w-44 bg-white rounded-2xl border border-zinc-200 shadow-xl p-2">
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="h-44 overflow-y-auto pr-0.5 space-y-0.5 border-r border-zinc-100">
                {HOUR_OPTIONS.map((h) => {
                  const selected = draftHour === h;
                  return (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDraftHour(h)}
                      className={`w-full py-1.5 px-1.5 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                        selected
                          ? 'bg-blue-600 text-white'
                          : 'text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {formatHourOption(h, mode)}
                    </button>
                  );
                })}
              </div>
              <div className="h-44 overflow-y-auto space-y-0.5">
                {MINUTE_OPTIONS.map((m) => {
                  const selected = draftMinute === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDraftMinute(m)}
                      className={`w-full py-1.5 px-1.5 rounded-lg text-xs font-semibold text-center transition-colors cursor-pointer ${
                        selected
                          ? 'bg-blue-600 text-white'
                          : 'text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onCommit(`${draftHour}:${draftMinute}`);
                setOpen(false);
              }}
              className="w-full py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Simpan
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Baris checkbox hari/grup + daftar rentang jam buka/tutup beserta tombol tambah/hapus shift.
 */
function ScheduleIntervalRow({
  label,
  checked,
  disabled = false,
  intervals,
  mode,
  onToggleChecked,
  onChangeInterval,
  onAddInterval,
  onRemoveInterval,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  intervals: BusinessTimeInterval[];
  mode: BusinessScheduleMode;
  onToggleChecked: (next: boolean) => void;
  onChangeInterval: (id: string, field: 'start' | 'end', value: string) => void;
  onAddInterval: () => void;
  onRemoveInterval: (id: string) => void;
}) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-start justify-between gap-3 py-2 ${
        disabled ? 'opacity-50' : ''
      }`}
    >
      <label
        className={`inline-flex items-center gap-2.5 pt-1.5 min-w-[140px] select-none ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <input
          type="checkbox"
          disabled={disabled}
          checked={checked}
          onChange={(e) => onToggleChecked(e.target.checked)}
          className="w-4 h-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
        />
        <span className="text-sm font-semibold text-zinc-800">{label}</span>
      </label>

      <div className="flex-1 space-y-2">
        {checked ? (
          intervals.map((slot, idx) => (
            <div key={slot.id} className="flex flex-wrap items-center gap-2">
              <TimePickerButton
                value={slot.start}
                mode={mode}
                disabled={disabled}
                onCommit={(val) => onChangeInterval(slot.id, 'start', val)}
              />
              <span className="text-zinc-400 text-xs font-bold">→</span>
              <TimePickerButton
                value={slot.end}
                mode={mode}
                disabled={disabled}
                onCommit={(val) => onChangeInterval(slot.id, 'end', val)}
              />
              {idx === 0 && (
                <button
                  type="button"
                  disabled={disabled}
                  title="Tambah rentang jam lain di hari yang sama"
                  onClick={onAddInterval}
                  className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {intervals.length > 1 && (
                <button
                  type="button"
                  disabled={disabled}
                  title="Hapus rentang jam"
                  onClick={() => onRemoveInterval(slot.id)}
                  className="p-2 rounded-xl border border-zinc-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-zinc-500 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-xs font-medium text-zinc-400 pt-2">Tutup</p>
        )}
      </div>
    </div>
  );
}

export default function QRBusinessContentForm({
  content,
  errors,
  onChange,
  onPreviewSplash,
}: QRBusinessContentFormProps) {
  const [pendingCrop, setPendingCrop] = useState<{
    target: BusinessImageTarget;
    rawUrl: string;
    fileName: string;
  } | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const splashInputRef = useRef<HTMLInputElement>(null);

  const handleFillSample = () => {
    setPendingCrop(null);
    onChange({
      ...INITIAL_BUSINESS_CONTENT,
      designStyle: content.designStyle ?? 'default',
      brutalismPalette:
        content.brutalismPalette ?? DEFAULT_VCARD_BRUTALISM_PALETTE,
      qrName: 'QR Outlet Kemang',
      primaryColor: '#ECEDF1',
      secondaryColor: '#232321',
      companyName: 'Kopi Nusantara',
      headline: 'Roastery & Slow Bar Spesialti',
      subtitle: 'Menyeduh biji kopi terbaik dari berbagai daerah di Indonesia.',
      buttons: [
        {
          id: 'btn-sample-1',
          label: 'Lihat Menu & Promo',
          url: 'https://kopinusantara.id/menu',
        },
        {
          id: 'btn-sample-2',
          label: 'Reservasi Meja via WhatsApp',
          url: 'https://wa.me/6281234567890',
        },
      ],
      scheduleMode: '24h',
      useWeekdayGroup: true,
      weekdayGroupIntervals: [{ id: 'wd-sample', start: '08:00', end: '22:00' }],
      days: {
        ...INITIAL_BUSINESS_CONTENT.days,
        sat: {
          enabled: true,
          intervals: [{ id: 'sat-sample', start: '09:00', end: '23:00' }],
        },
        sun: {
          enabled: true,
          intervals: [{ id: 'sun-sample', start: '09:00', end: '23:00' }],
        },
      },
      contactName: 'Raka Pratama',
      phones: [{ id: 'p-sample', label: 'Cara Kerja', number: '+6281234567890' }],
      website: 'kopinusantara.id',
      emails: [{ id: 'e-sample', label: 'Kerja', email: 'halo@kopinusantara.id' }],
      addressMode: 'manual',
      street: 'Jl. Kemang Raya No. 45',
      postalCode: '12730',
      city: 'Jakarta Selatan',
      state: 'DKI Jakarta',
      country: 'Indonesia',
      facilities: ['wifi', 'seating', 'cafe', 'toilet', 'parking'],
      summary:
        'Kedai kopi spesialti dan ruang kerja nyaman dengan Wi-Fi berkecepatan tinggi, area indoor ber-AC, dan taman outdoor.',
      socials: [
        {
          id: 'soc-sample',
          platform: 'instagram',
          url: 'https://www.instagram.com/',
          label: 'Instagram Kami',
        },
      ],
    });
  };

  const handleUploadImage = async (
    e: ChangeEvent<HTMLInputElement>,
    target: BusinessImageTarget
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const meta = validateLogoFileMeta({
      size: file.size,
      type: file.type,
      name: file.name,
    });
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

  const toggleFacility = (facilityId: BusinessFacilityId) => {
    const exists = content.facilities.includes(facilityId);
    onChange({
      ...content,
      facilities: exists
        ? content.facilities.filter((f) => f !== facilityId)
        : [...content.facilities, facilityId],
    });
  };

  const updateDaySchedule = (
    dayKey: BusinessDayKey,
    updater: (prev: BusinessContent['days'][BusinessDayKey]) => BusinessContent['days'][BusinessDayKey]
  ) => {
    onChange({
      ...content,
      days: {
        ...content.days,
        [dayKey]: updater(content.days[dayKey]),
      },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Tambahkan konten ke kode QR Bisnis
        </h2>
        <button
          type="button"
          onClick={handleFillSample}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Isi Contoh Bisnis
        </button>
      </div>

      {/* 1. Desain dan sesuaikan */}
      <TopAccordionCard
        icon={<Paintbrush className="w-5 h-5" />}
        title="Desain dan sesuaikan"
        subtitle="Pilih gaya halaman, palet warna & gambar header bisnis"
      >
        <QRDesignStyleSection
          styleHeading="Gaya tampilan Halaman Bisnis"
          defaultDescription="Bersih modern dengan tombol kontras & kartu lembut"
          defaultSchemes={BUSINESS_COLOR_SCHEMES}
          defaultSwatchVariant="stacked-card"
          designStyle={content.designStyle ?? 'default'}
          primaryColor={content.primaryColor}
          secondaryColor={content.secondaryColor}
          brutalismPalette={content.brutalismPalette}
          onSelectStyle={(nextStyle, ensuredPalette) =>
            onChange({
              ...content,
              designStyle: nextStyle,
              brutalismPalette:
                nextStyle === 'brutalism'
                  ? ensuredPalette
                  : content.brutalismPalette,
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

        <div className="pt-1">
          <ImagePickerField
            label="Gambar Header"
            hint="Foto toko, produk, atau banner utama Halaman Bisnis Anda"
            emptyTitle="Tambahkan Gambar (jpg, png, svg)"
            imageUrl={content.coverDataUrl}
            fileName={content.coverFileName}
            fallbackFileName="foto-bisnis.webp"
            previewAlt="Foto Header Bisnis"
            previewClassName="w-16 h-11 rounded-xl object-cover border border-zinc-200 flex-shrink-0"
            editTitle="Ganti gambar header"
            inputRef={coverInputRef}
            onFileChange={(e) => void handleUploadImage(e, 'cover')}
            onRemove={() =>
              onChange({
                ...content,
                coverDataUrl: null,
                coverFileName: '',
              })
            }
          />
        </div>
      </TopAccordionCard>

      {/* 2. Informasi bisnis */}
      <TopAccordionCard
        icon={<Store className="w-5 h-5" />}
        title="Informasi bisnis"
        subtitle="Nama perusahaan, tajuk utama, dan tombol ajakan bertindak (CTA)"
      >
        <div>
          <label
            htmlFor="business-company-name"
            className="block text-sm font-bold text-zinc-900 mb-1.5"
          >
            Nama perusahaan<span className="text-blue-600">*</span>
          </label>
          <input
            id="business-company-name"
            type="text"
            maxLength={100}
            value={content.companyName}
            onChange={(e) => onChange({ ...content, companyName: e.target.value })}
            placeholder="misalnya Kopi Nusantara"
            className={`w-full rounded-xl border px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 transition-all ${
              errors.companyName
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 focus:border-blue-600 focus:ring-blue-600/15'
            }`}
          />
          {errors.companyName && (
            <p className="text-xs font-medium text-red-600 mt-1">
              {errors.companyName}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="business-headline"
            className="block text-sm font-bold text-zinc-900 mb-1.5"
          >
            Judul
          </label>
          <input
            id="business-headline"
            type="text"
            maxLength={120}
            value={content.headline}
            onChange={(e) => onChange({ ...content, headline: e.target.value })}
            placeholder="misalnya Spesialis Kopi Artisan & Pastry"
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
          />
        </div>

        <div>
          <label
            htmlFor="business-subtitle"
            className="block text-sm font-bold text-zinc-900 mb-1.5"
          >
            Subtitle
          </label>
          <input
            id="business-subtitle"
            type="text"
            maxLength={180}
            value={content.subtitle}
            onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
            placeholder="misalnya Nikmati suasana kerja santai setiap hari"
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
          />
        </div>

        {/* Tombol CTA */}
        <div className="space-y-3 pt-1">
          {content.buttons.map((btn) => {
            const labelErr = errors[`button_label_${btn.id}`];
            const urlErr = errors[`button_url_${btn.id}`];
            return (
              <div
                key={btn.id}
                className="rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      Teks tombol<span className="text-blue-600">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={50}
                      value={btn.label}
                      onChange={(e) =>
                        onChange({
                          ...content,
                          buttons: content.buttons.map((item) =>
                            item.id === btn.id
                              ? { ...item, label: e.target.value }
                              : item
                          ),
                        })
                      }
                      placeholder="misalnya Kunjungi Situs Kami"
                      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                        labelErr
                          ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                          : 'border-zinc-200 focus:border-blue-600 focus:ring-blue-600/15'
                      }`}
                    />
                    {labelErr && (
                      <p className="text-xs font-medium text-red-600 mt-1">
                        {labelErr}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 mb-1">
                      URL<span className="text-blue-600">*</span>
                    </label>
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <input
                          type="url"
                          value={btn.url}
                          onChange={(e) =>
                            onChange({
                              ...content,
                              buttons: content.buttons.map((item) =>
                                item.id === btn.id
                                  ? { ...item, url: e.target.value }
                                  : item
                              ),
                            })
                          }
                          placeholder="misalnya https://mywebsite.com/"
                          className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 transition-all ${
                            urlErr
                              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                              : 'border-zinc-200 focus:border-blue-600 focus:ring-blue-600/15'
                          }`}
                        />
                        {urlErr && (
                          <p className="text-xs font-medium text-red-600 mt-1">
                            {urlErr}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        title="Hapus tombol"
                        onClick={() =>
                          onChange({
                            ...content,
                            buttons: content.buttons.filter(
                              (item) => item.id !== btn.id
                            ),
                          })
                        }
                        className="p-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-500 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() =>
              onChange({
                ...content,
                buttons: [
                  ...content.buttons,
                  { id: createRowId('btn'), label: '', url: '' },
                ],
              })
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-xs sm:text-sm font-semibold text-blue-700 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambahkan Tombol
          </button>
        </div>
      </TopAccordionCard>

      {/* 3. Jam buka */}
      <TopAccordionCard
        icon={<Clock className="w-5 h-5" />}
        title="Jam buka"
        subtitle="Tentukan jadwal operasional Anda."
        defaultOpen={false}
        allowOverflow
      >
        <div className="inline-flex rounded-xl border border-zinc-200 p-1 bg-zinc-50">
          {(
            [
              { id: 'ampm', label: 'AM/PM' },
              { id: '24h', label: '24 jam' },
              { id: 'open24', label: 'Buka 24 jam' },
            ] as const
          ).map((tab) => {
            const active = content.scheduleMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange({ ...content, scheduleMode: tab.id })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-blue-600 shadow-2xs border border-blue-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {content.scheduleMode === 'open24' ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-800">
            Bisnis Anda akan ditampilkan sebagai buka 24 jam penuh setiap hari (Senin–Minggu).
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {/* Jadwal Massal Senin - Jumat */}
            <div className="rounded-xl border border-zinc-200/80 bg-zinc-50/60 px-3.5 py-2">
              <ScheduleIntervalRow
                label="Senin - Jumat"
                checked={content.useWeekdayGroup}
                intervals={content.weekdayGroupIntervals}
                mode={content.scheduleMode}
                onToggleChecked={(next) =>
                  onChange({ ...content, useWeekdayGroup: next })
                }
                onChangeInterval={(slotId, field, value) =>
                  onChange({
                    ...content,
                    weekdayGroupIntervals: content.weekdayGroupIntervals.map((s) =>
                      s.id === slotId ? { ...s, [field]: value } : s
                    ),
                  })
                }
                onAddInterval={() =>
                  onChange({
                    ...content,
                    weekdayGroupIntervals: [
                      ...content.weekdayGroupIntervals,
                      { id: createRowId('wd'), start: '13:00', end: '21:00' },
                    ],
                  })
                }
                onRemoveInterval={(slotId) =>
                  onChange({
                    ...content,
                    weekdayGroupIntervals: content.weekdayGroupIntervals.filter(
                      (s) => s.id !== slotId
                    ),
                  })
                }
              />
            </div>

            <div className="flex items-center gap-3 py-0.5">
              <div className="h-px flex-1 bg-zinc-200" />
              <span className="text-[11px] font-bold tracking-widest text-zinc-400">
                ATAU
              </span>
              <div className="h-px flex-1 bg-zinc-200" />
            </div>

            <div className="divide-y divide-zinc-100">
              {BUSINESS_DAYS.map((day) => {
                const isWeekday =
                  day.key === 'mon' ||
                  day.key === 'tue' ||
                  day.key === 'wed' ||
                  day.key === 'thu' ||
                  day.key === 'fri';
                const lockedByGroup = content.useWeekdayGroup && isWeekday;
                const daySched = content.days[day.key];

                return (
                  <ScheduleIntervalRow
                    key={day.key}
                    label={day.label}
                    checked={lockedByGroup ? true : daySched.enabled}
                    disabled={lockedByGroup}
                    intervals={
                      lockedByGroup
                        ? content.weekdayGroupIntervals
                        : daySched.intervals
                    }
                    mode={content.scheduleMode}
                    onToggleChecked={(next) =>
                      updateDaySchedule(day.key, (prev) => ({
                        ...prev,
                        enabled: next,
                      }))
                    }
                    onChangeInterval={(slotId, field, value) =>
                      updateDaySchedule(day.key, (prev) => ({
                        ...prev,
                        intervals: prev.intervals.map((s) =>
                          s.id === slotId ? { ...s, [field]: value } : s
                        ),
                      }))
                    }
                    onAddInterval={() =>
                      updateDaySchedule(day.key, (prev) => ({
                        ...prev,
                        intervals: [
                          ...prev.intervals,
                          { id: createRowId(day.key), start: '13:00', end: '21:00' },
                        ],
                      }))
                    }
                    onRemoveInterval={(slotId) =>
                      updateDaySchedule(day.key, (prev) => ({
                        ...prev,
                        intervals: prev.intervals.filter((s) => s.id !== slotId),
                      }))
                    }
                  />
                );
              })}
            </div>
          </div>
        )}
      </TopAccordionCard>

      {/* 4. Informasi kontak */}
      <TopAccordionCard
        icon={<Phone className="w-5 h-5" />}
        title="Informasi kontak"
        subtitle="Bagaimana pengunjung dapat menghubungi Anda?"
        defaultOpen={false}
      >
        <div>
          <label
            htmlFor="business-contact-name"
            className="block text-sm font-bold text-zinc-900 mb-1.5"
          >
            Nama lengkap
          </label>
          <input
            id="business-contact-name"
            type="text"
            maxLength={100}
            value={content.contactName}
            onChange={(e) =>
              onChange({ ...content, contactName: e.target.value })
            }
            placeholder="misalnya Raka Pratama"
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all"
          />
        </div>

        {/* Telepon */}
        <div className="space-y-2.5">
          <label className="block text-sm font-bold text-zinc-900">
            Nomor telepon
          </label>
          {content.phones.map((item, idx) => (
            <div key={item.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <select
                value={item.label}
                onChange={(e) =>
                  onChange({
                    ...content,
                    phones: content.phones.map((p) =>
                      p.id === item.id
                        ? { ...p, label: e.target.value as VCardPhoneLabel }
                        : p
                    ),
                  })
                }
                className="w-full sm:w-36 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-blue-600"
              >
                {PHONE_LABELS.map((lbl) => (
                  <option key={lbl} value={lbl}>
                    {lbl}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={item.number}
                onChange={(e) =>
                  onChange({
                    ...content,
                    phones: content.phones.map((p) =>
                      p.id === item.id ? { ...p, number: e.target.value } : p
                    ),
                  })
                }
                placeholder="misalnya +62 812 3456 7890"
                className="flex-1 min-w-0 rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
              />
              {idx === 0 && (
                <button
                  type="button"
                  title="Tambah nomor telepon"
                  onClick={() =>
                    onChange({
                      ...content,
                      phones: [
                        ...content.phones,
                        { id: createRowId('bp'), label: 'Ponsel', number: '' },
                      ],
                    })
                  }
                  className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {content.phones.length > 1 && (
                <button
                  type="button"
                  title="Hapus nomor"
                  onClick={() =>
                    onChange({
                      ...content,
                      phones: content.phones.filter((p) => p.id !== item.id),
                    })
                  }
                  className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-zinc-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Situs Web */}
        <div>
          <label
            htmlFor="business-website"
            className="block text-sm font-bold text-zinc-900 mb-1.5"
          >
            Situs web
          </label>
          <input
            id="business-website"
            type="url"
            value={content.website}
            onChange={(e) => onChange({ ...content, website: e.target.value })}
            placeholder="misalnya https://mywebsite.com/"
            className={`w-full rounded-xl border px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 transition-all ${
              errors.website
                ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                : 'border-zinc-200 focus:border-blue-600 focus:ring-blue-600/15'
            }`}
          />
          {errors.website && (
            <p className="text-xs font-medium text-red-600 mt-1">
              {errors.website}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2.5">
          <label className="block text-sm font-bold text-zinc-900">Email</label>
          {content.emails.map((item, idx) => (
            <div key={item.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <select
                value={item.label}
                onChange={(e) =>
                  onChange({
                    ...content,
                    emails: content.emails.map((em) =>
                      em.id === item.id
                        ? { ...em, label: e.target.value as VCardEmailLabel }
                        : em
                    ),
                  })
                }
                className="w-full sm:w-36 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-blue-600"
              >
                {EMAIL_LABELS.map((lbl) => (
                  <option key={lbl} value={lbl}>
                    {lbl}
                  </option>
                ))}
              </select>
              <input
                type="email"
                value={item.email}
                onChange={(e) =>
                  onChange({
                    ...content,
                    emails: content.emails.map((em) =>
                      em.id === item.id ? { ...em, email: e.target.value } : em
                    ),
                  })
                }
                placeholder="misalnya myemail@email.com"
                className={`flex-1 min-w-0 rounded-xl border px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none ${
                  errors.emails
                    ? 'border-red-400 focus:border-red-500'
                    : 'border-zinc-200 focus:border-blue-600'
                }`}
              />
              {idx === 0 && (
                <button
                  type="button"
                  title="Tambah alamat email"
                  onClick={() =>
                    onChange({
                      ...content,
                      emails: [
                        ...content.emails,
                        { id: createRowId('be'), label: 'Kerja', email: '' },
                      ],
                    })
                  }
                  className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              {content.emails.length > 1 && (
                <button
                  type="button"
                  title="Hapus email"
                  onClick={() =>
                    onChange({
                      ...content,
                      emails: content.emails.filter((em) => em.id !== item.id),
                    })
                  }
                  className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-zinc-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {errors.emails && (
            <p className="text-xs font-medium text-red-600">{errors.emails}</p>
          )}
        </div>
      </TopAccordionCard>

      {/* 5. Lokasi */}
      <TopAccordionCard
        icon={<MapPin className="w-5 h-5" />}
        title="Lokasi"
        subtitle="Masukkan detail lokasi usaha atau tautan peta"
        defaultOpen={false}
      >
        <div className="inline-flex rounded-xl border border-zinc-200 p-1 bg-zinc-50">
          {(
            [
              { id: 'manual', label: 'Manual' },
              { id: 'url', label: 'URL' },
            ] as const
          ).map((modeTab) => {
            const active = content.addressMode === modeTab.id;
            return (
              <button
                key={modeTab.id}
                type="button"
                onClick={() =>
                  onChange({ ...content, addressMode: modeTab.id })
                }
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-white text-blue-600 shadow-2xs border border-blue-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {modeTab.label}
              </button>
            );
          })}
        </div>

        {content.addressMode === 'manual' ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                Jalan
              </label>
              <input
                type="text"
                value={content.street}
                onChange={(e) => onChange({ ...content, street: e.target.value })}
                placeholder="misalnya Jalan Sudirman No. 12"
                className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Kode pos
                </label>
                <input
                  type="text"
                  value={content.postalCode}
                  onChange={(e) =>
                    onChange({ ...content, postalCode: e.target.value })
                  }
                  placeholder="misalnya 12190"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Kota
                </label>
                <input
                  type="text"
                  value={content.city}
                  onChange={(e) => onChange({ ...content, city: e.target.value })}
                  placeholder="misalnya Jakarta Selatan"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Negara Bagian/Provinsi
                </label>
                <input
                  type="text"
                  value={content.state}
                  onChange={(e) => onChange({ ...content, state: e.target.value })}
                  placeholder="misalnya DKI Jakarta"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-800 mb-1.5">
                  Negara
                </label>
                <input
                  type="text"
                  value={content.country}
                  onChange={(e) =>
                    onChange({ ...content, country: e.target.value })
                  }
                  placeholder="misalnya Indonesia"
                  className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-bold text-zinc-800 mb-1.5">
              URL Alamat / Google Maps
            </label>
            <input
              type="url"
              value={content.addressUrl}
              onChange={(e) =>
                onChange({ ...content, addressUrl: e.target.value })
              }
              placeholder="misalnya https://maps.google.com/?q=..."
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
      </TopAccordionCard>

      {/* 6. Fasilitas */}
      <TopAccordionCard
        icon={<CheckCircle2 className="w-5 h-5" />}
        title="Fasilitas"
        subtitle="Pilih fasilitas yang tersedia di tempat usaha Anda"
        defaultOpen={false}
      >
        <div className="flex flex-wrap gap-2.5">
          {BUSINESS_FACILITIES.map((facility) => {
            const selected = content.facilities.includes(facility.id);
            return (
              <button
                key={facility.id}
                type="button"
                onClick={() => toggleFacility(facility.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  selected
                    ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-600/15'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 text-zinc-700'
                }`}
              >
                <span className="flex items-center justify-center w-4 h-4">
                  <BusinessFacilityIcon id={facility.id} className="w-4 h-4" />
                </span>
                <span>{facility.label}</span>
              </button>
            );
          })}
        </div>
      </TopAccordionCard>

      {/* 7. Tentang perusahaan */}
      <TopAccordionCard
        icon={<Building2 className="w-5 h-5" />}
        title="Tentang perusahaan"
        subtitle="Tambahkan deskripsi singkat tentang perusahaan Anda"
        defaultOpen={false}
      >
        <div>
          <label
            htmlFor="business-summary"
            className="block text-sm font-bold text-zinc-900 mb-1.5"
          >
            Ringkasan
          </label>
          <textarea
            id="business-summary"
            rows={4}
            maxLength={1200}
            value={content.summary}
            onChange={(e) => onChange({ ...content, summary: e.target.value })}
            placeholder="Tambahkan deskripsi singkat tentang perusahaan Anda"
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all resize-y"
          />
        </div>
      </TopAccordionCard>

      {/* 8. Jejaring sosial */}
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

      {/* 9. Layar selamat datang */}
      <TopAccordionCard
        icon={<ImagePlus className="w-5 h-5" />}
        title="Layar selamat datang"
        subtitle="Menampilkan gambar sambutan khusus saat halaman Anda dimuat"
        defaultOpen={false}
      >
        <ImagePickerField
          label=""
          emptyTitle="Unggah gambar sambutan Anda (jpg, png, svg)"
          imageUrl={content.splashDataUrl}
          fileName={content.splashFileName}
          fallbackFileName="layar-selamat-datang.webp"
          previewAlt="Gambar sambutan Halaman Bisnis"
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

      {/* 10. Nama kode QR */}
      <TopAccordionCard
        icon={<FileText className="w-5 h-5" />}
        title="Nama kode QR"
        subtitle="Beri nama kode QR Anda (opsional)"
        defaultOpen={false}
      >
        <div>
          <label
            htmlFor="business-qr-name"
            className="block text-sm font-bold text-zinc-900 mb-2"
          >
            Beri nama kode QR Anda
          </label>
          <div className="relative">
            <input
              id="business-qr-name"
              type="text"
              maxLength={80}
              value={content.qrName}
              onChange={(e) => onChange({ ...content, qrName: e.target.value })}
              placeholder="misalnya Kode QR pertama saya"
              className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all pr-10"
            />
            <Pencil className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </TopAccordionCard>

      {/* Modal Crop Gambar Sampul & Sambutan */}
      {pendingCrop && (
        <QRImageEditorModal
          imageUrl={pendingCrop.rawUrl}
          squareCrop={false}
          aspectRatio={pendingCrop.target === 'cover' ? 16 / 10 : undefined}
          maxChars={pendingCrop.target === 'cover' ? 28000 : 14000}
          onClose={() => setPendingCrop(null)}
          onSave={(processed) => {
            if (pendingCrop.target === 'cover') {
              onChange({
                ...content,
                coverDataUrl: processed,
                coverFileName: pendingCrop.fileName,
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
