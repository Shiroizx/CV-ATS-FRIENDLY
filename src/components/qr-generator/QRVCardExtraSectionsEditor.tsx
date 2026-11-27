import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Award,
  ChevronDown,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type {
  VCardContent,
  VCardDefaultOpenMode,
} from '../../types/qrGenerator';
import { normalizeVCardSkills } from '../../lib/qrHelpers';

/**
 * Kartu akordeon utama yang dapat dipakai bersama di form konten vCard.
 */
export function QRVCardSectionCard({
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

const AVAILABILITY_PRESETS = [
  'Terbuka untuk peluang kerja',
  'Tersedia untuk proyek freelance',
  'Buka konsultasi',
] as const;

const SUGGESTED_SKILLS = [
  'UI/UX Design',
  'Full-Stack Dev',
  'React',
  'Public Speaking',
  'Konsultan',
  'Digital Marketing',
] as const;

const DEFAULT_OPEN_OPTIONS: readonly {
  id: VCardDefaultOpenMode;
  label: string;
}[] = [
  { id: 'none', label: 'Semua Tertutup' },
  { id: 'contact', label: 'Kontak' },
  { id: 'company', label: 'Perusahaan' },
  { id: 'summary', label: 'Ringkasan' },
  { id: 'social', label: 'Media Sosial' },
];

export interface QRVCardExtraSectionsEditorProps {
  content: VCardContent;
  errors?: Record<string, string>;
  onChange: (updated: VCardContent) => void;
}

/**
 * Editor bagian tambahan vCard (Keahlian & Ketersediaan serta Tata Letak & Tombol Bagikan).
 */
export default function QRVCardExtraSectionsEditor({
  content,
  onChange,
}: QRVCardExtraSectionsEditorProps) {
  const [skillDraft, setSkillDraft] = useState('');

  const skills = normalizeVCardSkills(content.skills);
  const availabilityStatus = content.availabilityStatus ?? '';
  const workingHours = content.workingHours ?? '';
  const showShareButton = content.showShareButton !== false;
  const defaultOpenSection = content.defaultOpenSection ?? 'none';

  const handleAddSkill = (rawSkill: string) => {
    const nextSkills = normalizeVCardSkills([...skills, rawSkill]);
    onChange({ ...content, skills: nextSkills });
    setSkillDraft('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onChange({
      ...content,
      skills: skills.filter((s) => s !== skillToRemove),
    });
  };

  return (
    <>
      {/* Keahlian & Ketersediaan */}
      <QRVCardSectionCard
        icon={<Award className="w-5 h-5" />}
        title="Keahlian & ketersediaan"
        subtitle="Tampilkan status aktif, jam kerja, & label keahlian Anda"
        defaultOpen={false}
      >
        <div>
          <label
            htmlFor="vcard-availability"
            className="block text-sm font-bold text-zinc-900 mb-2"
          >
            Status ketersediaan
          </label>
          <input
            id="vcard-availability"
            type="text"
            maxLength={80}
            value={availabilityStatus}
            onChange={(e) =>
              onChange({ ...content, availabilityStatus: e.target.value })
            }
            placeholder="misalnya Terbuka untuk peluang & kolaborasi"
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {AVAILABILITY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChange({ ...content, availabilityStatus: preset })}
                className="px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-blue-50 hover:text-blue-700 text-[11px] font-medium text-zinc-600 transition-colors cursor-pointer"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="vcard-working-hours"
            className="block text-sm font-bold text-zinc-900 mb-2"
          >
            Jam operasional / layanan
          </label>
          <input
            id="vcard-working-hours"
            type="text"
            maxLength={80}
            value={workingHours}
            onChange={(e) =>
              onChange({ ...content, workingHours: e.target.value })
            }
            placeholder="misalnya Senin–Jumat, 09:00–17:00 WIB"
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="vcard-skill-input"
              className="text-sm font-bold text-zinc-900"
            >
              Tag keahlian / layanan
            </label>
            <span className="text-xs text-zinc-400">{skills.length}/12</span>
          </div>

          <div className="flex gap-2">
            <input
              id="vcard-skill-input"
              type="text"
              maxLength={32}
              value={skillDraft}
              onChange={(e) => setSkillDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (skillDraft.trim()) handleAddSkill(skillDraft);
                }
              }}
              placeholder="Ketik keahlian lalu tekan Tambah"
              className="flex-1 rounded-xl border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-600"
            />
            <button
              type="button"
              disabled={!skillDraft.trim() || skills.length >= 12}
              onClick={() => handleAddSkill(skillDraft)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
            >
              Tambah
            </button>
          </div>

          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-blue-700"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    title={`Hapus ${skill}`}
                    onClick={() => handleRemoveSkill(skill)}
                    className="p-0.5 rounded-full hover:bg-blue-200/60 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {skills.length < 12 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {SUGGESTED_SKILLS.filter(
                (s) => !skills.some((ex) => ex.toLowerCase() === s.toLowerCase())
              ).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddSkill(preset)}
                  className="px-2.5 py-1 rounded-full border border-zinc-200 bg-white hover:border-blue-300 hover:text-blue-700 text-[11px] font-medium text-zinc-600 transition-colors cursor-pointer"
                >
                  + {preset}
                </button>
              ))}
            </div>
          )}
        </div>
      </QRVCardSectionCard>

      {/* Tata Letak & Tombol Bagikan */}
      <QRVCardSectionCard
        icon={<SlidersHorizontal className="w-5 h-5" />}
        title="Tata letak & tombol cepat"
        subtitle="Atur kartu terbuka awal & tombol bagikan profil"
        defaultOpen={false}
      >
        <div>
          <p className="text-sm font-bold text-zinc-900 mb-2">
            Kartu yang langsung terbuka saat halaman dimuat
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DEFAULT_OPEN_OPTIONS.map((opt) => {
              const active = defaultOpenSection === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onChange({ ...content, defaultOpenSection: opt.id })
                  }
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 px-3.5 py-3 cursor-pointer hover:bg-zinc-50 transition-colors">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              Tombol Bagikan Kartu Nama
            </p>
            <p className="text-xs text-zinc-500">
              Tombol bagikan atau salin tautan vCard di bagian bawah.
            </p>
          </div>
          <input
            type="checkbox"
            checked={showShareButton}
            onChange={(e) =>
              onChange({ ...content, showShareButton: e.target.checked })
            }
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
        </label>
      </QRVCardSectionCard>
    </>
  );
}
