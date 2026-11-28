import type { ReactNode } from 'react';
import {
  Award,
  Briefcase,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  Share2,
  ThumbsUp,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { DEFAULT_VCARD_BANNER_WAVE } from '../../types/qrGenerator';
import type {
  VCardAccordionSectionKey,
  VCardBannerWaveConfig,
  VCardBrutalismPalette,
  VCardContent,
} from '../../types/qrGenerator';
import {
  extractDisplayHost,
  hasLowColorContrast,
  pickAccessibleInkOnColor,
  sanitizeExternalUrl,
} from '../../lib/qrHelpers';
import { getSocialPlatformMeta } from '../../lib/qrPresets';
import { VCardBannerWaveSvg } from './VCardBannerWaveSvg';

interface BrutalAccordionBoxProps {
  icon: ReactNode;
  title: string;
  isOpen: boolean;
  ink: string;
  accentBg: string;
  cardBg: string;
  titleColor: string;
  onToggle: () => void;
  children: ReactNode;
}

export function BrutalAccordionBox({
  icon,
  title,
  isOpen,
  ink,
  accentBg,
  cardBg,
  titleColor,
  onToggle,
  children,
}: BrutalAccordionBoxProps) {
  const accentInk = pickAccessibleInkOnColor(accentBg, ink, '#FFFFFF');
  return (
    <div
      className="rounded-md overflow-hidden transition-transform"
      style={{
        backgroundColor: cardBg,
        border: `2px solid ${ink}`,
        boxShadow: `3px 3px 0px ${ink}`,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-3.5 py-3 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-7 h-7 rounded-xs flex items-center justify-center flex-shrink-0 border-2"
            style={{
              backgroundColor: accentBg,
              borderColor: ink,
              color: accentInk,
            }}
          >
            {icon}
          </span>
          <span
            className="text-xs sm:text-sm font-extrabold tracking-tight truncate"
            style={{ color: titleColor }}
          >
            {title}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : '-rotate-90'
          }`}
          style={{ color: titleColor }}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="brutal-accordion-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
            style={{ borderTop: `2px solid ${ink}` }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface VCardBrutalismViewProps {
  content: VCardContent;
  palette: VCardBrutalismPalette;
  compact: boolean;
  hasTopMockupBar: boolean;
  filledPhones: VCardContent['phones'];
  filledEmails: VCardContent['emails'];
  manualAddress: string;
  mapHref: string;
  websiteHref: string;
  filledSocials: VCardContent['socials'];
  normalizedSkills: string[];
  availabilityStatus: string;
  workingHours: string;
  showShareButton: boolean;
  openSection: VCardAccordionSectionKey | null;
  copiedShare: boolean;
  onToggleSection: (key: VCardAccordionSectionKey) => void;
  onSaveContact: () => void;
  onShareCard: () => void;
  footerNote?: ReactNode;
}

/**
 * Tampilan vCard Pribadi bergaya Neo-Brutalism / Brutalism:
 * border ink tegas 2px, hard offset shadow datar tanpa blur, tipografi mono label,
 * dan penyesuaian kontras teks otomatis WCAG 2.2 AA.
 */
export default function VCardBrutalismView({
  content,
  palette,
  compact,
  hasTopMockupBar,
  filledPhones,
  filledEmails,
  manualAddress,
  mapHref,
  websiteHref,
  filledSocials,
  normalizedSkills,
  availabilityStatus,
  workingHours,
  showShareButton,
  openSection,
  copiedShare,
  onToggleSection,
  onSaveContact,
  onShareCard,
  footerNote,
}: VCardBrutalismViewProps) {
  const ink = palette.text;
  const surfaceBg = palette.surface;
  const surfaceInk = pickAccessibleInkOnColor(surfaceBg, ink, '#FFFFFF');
  const isLightSurface = !hasLowColorContrast(surfaceBg, '#111827', 3.5);
  const cardBg = isLightSurface ? '#FFFFFF' : '#18181B';
  const cardInk = pickAccessibleInkOnColor(cardBg, ink, '#FFFFFF');
  const mutedInkColor = isLightSurface ? '#52525B' : '#A1A1AA';

  const hasBanner = Boolean(content.bannerDataUrl);
  const heroInk = hasBanner
    ? '#FFFFFF'
    : pickAccessibleInkOnColor(palette.primary, ink, '#FFFFFF');
  const ctaInk = pickAccessibleInkOnColor(palette.secondary, ink, '#FFFFFF');

  const bannerWave: VCardBannerWaveConfig = {
    ...DEFAULT_VCARD_BANNER_WAVE,
    ...(content.bannerWave ?? {}),
  };
  const hasWave = bannerWave.enabled;
  const waveHeightPx = compact
    ? Math.round(28 + bannerWave.height * 0.42)
    : Math.round(38 + bannerWave.height * 0.62);

  const topPadClass = hasTopMockupBar
    ? compact
      ? hasWave
        ? 'pt-[50px] pb-[54px]'
        : 'pt-[52px] pb-5'
      : hasWave
        ? 'pt-[74px] pb-[72px]'
        : 'pt-[76px] pb-7'
    : compact
      ? hasWave
        ? 'pt-4 pb-12'
        : 'pt-4 pb-5'
      : hasWave
        ? 'pt-6 pb-[68px]'
        : 'pt-6 pb-7';

  return (
    <div
      className="relative flex-1 min-h-full flex flex-col"
      style={{ backgroundColor: surfaceBg, color: surfaceInk }}
    >
      {/* Strip Identitas Mono di Atas (saat tidak tertutup overlay mockup banner) */}
      {!hasTopMockupBar && (
        <div
          className="px-3.5 py-1.5 flex items-center justify-between gap-2 text-[10px] font-mono font-bold uppercase tracking-widest border-b-2"
          style={{
            backgroundColor: palette.secondary,
            borderColor: ink,
            color: ctaInk,
          }}
        >
          <span>VCARD // BRUTAL</span>
          <span>ID-01</span>
        </div>
      )}

      {/* Bagian Hero Tegas */}
      <div
        className={`relative flex-shrink-0 overflow-hidden px-4 ${topPadClass} ${
          hasWave ? '' : 'border-b-2'
        }`}
        style={{
          backgroundColor: palette.primary,
          borderColor: ink,
        }}
      >
        {hasBanner && content.bannerDataUrl && (
          <>
            <img
              src={content.bannerDataUrl}
              alt="Banner vCard"
              className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-black/55 pointer-events-none"
            />
          </>
        )}

        <motion.div
          initial={compact ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          {/* Bingkai Avatar Kotak Tegas Brutalist */}
          <div
            className={`${
              compact ? 'w-[70px] h-[70px] mb-3' : 'w-24 h-24 mb-3.5'
            } rounded-md border-2 bg-white overflow-hidden flex items-center justify-center`}
            style={{
              borderColor: ink,
              boxShadow: `4px 4px 0px ${ink}`,
            }}
          >
            {content.avatarDataUrl ? (
              <img
                src={content.avatarDataUrl}
                alt={content.fullName || 'Foto Profil'}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-9 h-9" style={{ color: ink }} />
            )}
          </div>

          <h3
            className={`${
              compact ? 'text-[17px]' : 'text-2xl'
            } font-black tracking-tight leading-tight max-w-full break-words`}
            style={{ color: heroInk }}
          >
            {content.fullName.trim() || 'Nama Lengkap Anda'}
          </h3>

          {(content.profession.trim() || content.company.trim()) && (
            <span
              className="mt-2 inline-block px-2.5 py-1 rounded-xs border-2 text-[11px] font-mono font-bold max-w-full break-words"
              style={{
                backgroundColor: surfaceBg,
                borderColor: ink,
                color: surfaceInk,
                boxShadow: `2px 2px 0px ${ink}`,
              }}
            >
              {[content.profession.trim(), content.company.trim()]
                .filter(Boolean)
                .join(' • ')}
            </span>
          )}

          {availabilityStatus && (
            <span
              className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs border-2 text-[10px] font-mono font-bold uppercase tracking-wide"
              style={{
                backgroundColor: cardBg,
                borderColor: ink,
                color: cardInk,
              }}
            >
              <span
                className="w-2 h-2 bg-emerald-500 border flex-shrink-0"
                style={{ borderColor: ink }}
              />
              <span>{availabilityStatus}</span>
            </span>
          )}

          <button
            type="button"
            onClick={onSaveContact}
            className={`${
              compact ? 'mt-3.5' : 'mt-4'
            } inline-flex items-center gap-2 px-5 py-2 rounded-md border-2 text-xs font-extrabold uppercase tracking-wide transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer`}
            style={{
              backgroundColor: palette.secondary,
              borderColor: ink,
              color: ctaInk,
              boxShadow: `3px 3px 0px ${ink}`,
            }}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Tambahkan kontak</span>
          </button>
        </motion.div>

        {hasWave && (
          <VCardBannerWaveSvg
            wave={bannerWave}
            fillColor={surfaceBg}
            strokeColor={ink}
            strokeWidth={2.5}
            className="absolute -bottom-px inset-x-0 w-full z-[5] pointer-events-none select-none"
            style={{ height: `${waveHeightPx}px` }}
          />
        )}
      </div>

      {/* Konten Akordeon & Informasi Brutalism */}
      <div
        className={`flex-1 flex flex-col px-3.5 relative z-10 ${
          hasWave ? '-mt-2' : 'pt-3.5'
        } ${compact ? 'pb-6' : 'pb-8'} space-y-2.5`}
      >
        {/* 1. Kontak */}
        <BrutalAccordionBox
          icon={<Phone className="w-3.5 h-3.5" />}
          title="Kontak"
          isOpen={openSection === 'contact'}
          ink={ink}
          accentBg={palette.primary}
          cardBg={cardBg}
          titleColor={cardInk}
          onToggle={() => onToggleSection('contact')}
        >
          <div className="px-3.5 pb-3.5 pt-2.5 space-y-2.5 text-xs">
            {filledPhones.length === 0 &&
            filledEmails.length === 0 &&
            websiteHref === '#' &&
            !manualAddress &&
            mapHref === '#' ? (
              <p style={{ color: mutedInkColor }}>Belum ada detail kontak diisi.</p>
            ) : (
              <>
                {filledPhones.map((phone) => (
                  <a
                    key={phone.id}
                    href={`tel:${phone.number.replace(/\s+/g, '')}`}
                    className="flex items-start gap-2.5 rounded-sm p-1.5 -mx-1.5 transition-colors hover:underline"
                    style={{ color: cardInk }}
                  >
                    <Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p
                        className="text-[10px] font-mono font-bold uppercase tracking-wider"
                        style={{ color: mutedInkColor }}
                      >
                        {phone.label}
                      </p>
                      <p className="font-bold break-all">{phone.number}</p>
                    </div>
                  </a>
                ))}

                {filledEmails.map((em) => (
                  <a
                    key={em.id}
                    href={`mailto:${em.email.trim()}`}
                    className="flex items-start gap-2.5 rounded-sm p-1.5 -mx-1.5 transition-colors hover:underline"
                    style={{ color: cardInk }}
                  >
                    <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p
                        className="text-[10px] font-mono font-bold uppercase tracking-wider"
                        style={{ color: mutedInkColor }}
                      >
                        {em.label}
                      </p>
                      <p className="font-bold break-all">{em.email}</p>
                    </div>
                  </a>
                ))}

                {websiteHref !== '#' && (
                  <a
                    href={websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 rounded-sm p-1.5 -mx-1.5 transition-colors hover:underline"
                    style={{ color: cardInk }}
                  >
                    <Globe className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p
                        className="text-[10px] font-mono font-bold uppercase tracking-wider"
                        style={{ color: mutedInkColor }}
                      >
                        Situs Web
                      </p>
                      <p className="font-bold break-all">
                        {extractDisplayHost(content.website)}
                      </p>
                    </div>
                  </a>
                )}

                {content.addressMode === 'manual' && manualAddress && (
                  <div
                    className="flex items-start gap-2.5 p-1.5 -mx-1.5"
                    style={{ color: cardInk }}
                  >
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p
                        className="text-[10px] font-mono font-bold uppercase tracking-wider"
                        style={{ color: mutedInkColor }}
                      >
                        Alamat
                      </p>
                      <p className="font-semibold leading-relaxed">{manualAddress}</p>
                    </div>
                  </div>
                )}

                {content.addressMode === 'url' && mapHref !== '#' && (
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 p-1.5 -mx-1.5 font-bold hover:underline"
                    style={{ color: cardInk }}
                  >
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span className="inline-flex items-center gap-1">
                      Buka Lokasi Peta
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                )}
              </>
            )}
          </div>
        </BrutalAccordionBox>

        {/* 2. Perusahaan */}
        <BrutalAccordionBox
          icon={<Briefcase className="w-3.5 h-3.5" />}
          title="Perusahaan"
          isOpen={openSection === 'company'}
          ink={ink}
          accentBg={palette.secondary}
          cardBg={cardBg}
          titleColor={cardInk}
          onToggle={() => onToggleSection('company')}
        >
          <div className="px-3.5 pb-3.5 pt-2.5 space-y-2 text-xs">
            {!content.company.trim() && !content.profession.trim() ? (
              <p style={{ color: mutedInkColor }}>Belum ada info perusahaan diisi.</p>
            ) : (
              <>
                {content.company.trim() && (
                  <div>
                    <p
                      className="text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: mutedInkColor }}
                    >
                      Perusahaan
                    </p>
                    <p className="font-bold" style={{ color: cardInk }}>
                      {content.company}
                    </p>
                  </div>
                )}
                {content.profession.trim() && (
                  <div>
                    <p
                      className="text-[10px] font-mono font-bold uppercase tracking-wider"
                      style={{ color: mutedInkColor }}
                    >
                      Profesi / Jabatan
                    </p>
                    <p className="font-semibold" style={{ color: cardInk }}>
                      {content.profession}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </BrutalAccordionBox>

        {/* 3. Ringkasan */}
        <BrutalAccordionBox
          icon={<FileText className="w-3.5 h-3.5" />}
          title="Ringkasan"
          isOpen={openSection === 'summary'}
          ink={ink}
          accentBg={palette.primary}
          cardBg={cardBg}
          titleColor={cardInk}
          onToggle={() => onToggleSection('summary')}
        >
          <div
            className="px-3.5 pb-3.5 pt-2.5 text-xs leading-relaxed whitespace-pre-line font-medium"
            style={{ color: cardInk }}
          >
            {content.summary.trim() || (
              <span style={{ color: mutedInkColor }}>Belum ada ringkasan diisi.</span>
            )}
          </div>
        </BrutalAccordionBox>

        {/* 4. Media Sosial */}
        <BrutalAccordionBox
          icon={<ThumbsUp className="w-3.5 h-3.5" />}
          title="Media Sosial"
          isOpen={openSection === 'social'}
          ink={ink}
          accentBg={palette.secondary}
          cardBg={cardBg}
          titleColor={cardInk}
          onToggle={() => onToggleSection('social')}
        >
          <div className="px-3.5 pb-3.5 pt-2.5 space-y-2 text-xs">
            {filledSocials.length === 0 ? (
              <p style={{ color: mutedInkColor }}>Belum ada media sosial ditambahkan.</p>
            ) : (
              filledSocials.map((item) => {
                const meta = getSocialPlatformMeta(item.platform);
                const safeLink = sanitizeExternalUrl(item.url);
                return (
                  <a
                    key={item.id}
                    href={safeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2.5 p-2 rounded-sm border-2 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: surfaceBg,
                      borderColor: ink,
                      color: surfaceInk,
                      boxShadow: `2px 2px 0px ${ink}`,
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={meta.iconDataUrl}
                        alt={meta.label}
                        className="w-6 h-6 rounded-md flex-shrink-0"
                      />
                      <span className="font-bold truncate">
                        {item.label.trim() || meta.label}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                );
              })
            )}
          </div>
        </BrutalAccordionBox>

        {/* Keahlian & Layanan */}
        {normalizedSkills.length > 0 && (
          <div
            className="rounded-md p-3.5 space-y-2.5 border-2"
            style={{
              backgroundColor: cardBg,
              borderColor: ink,
              boxShadow: `3px 3px 0px ${ink}`,
            }}
          >
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cardInk }} />
              <span
                className="text-[11px] font-mono font-bold uppercase tracking-wider"
                style={{ color: cardInk }}
              >
                Keahlian &amp; Layanan
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {normalizedSkills.map((skill, idx) => {
                const usePrimary = idx % 2 === 0;
                const chipBg = usePrimary ? palette.primary : surfaceBg;
                const chipInk = pickAccessibleInkOnColor(chipBg, ink, '#FFFFFF');
                return (
                  <span
                    key={skill}
                    className="px-2.5 py-1 rounded-xs border-2 text-[11px] font-mono font-bold"
                    style={{
                      backgroundColor: chipBg,
                      borderColor: ink,
                      color: chipInk,
                      boxShadow: `2px 2px 0px ${ink}`,
                    }}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Jam Operasional */}
        {workingHours && (
          <div
            className="flex items-center justify-center gap-2 rounded-md border-2 px-3.5 py-2.5 text-xs font-mono font-bold"
            style={{
              backgroundColor: cardBg,
              borderColor: ink,
              color: cardInk,
            }}
          >
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{workingHours}</span>
          </div>
        )}

        {/* Tombol Bagikan */}
        {showShareButton && (
          <button
            type="button"
            onClick={onShareCard}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md border-2 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer"
            style={{
              backgroundColor: cardBg,
              borderColor: ink,
              color: cardInk,
              boxShadow: `3px 3px 0px ${ink}`,
            }}
          >
            {copiedShare ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tautan kartu disalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan Kartu Nama</span>
              </>
            )}
          </button>
        )}

        {footerNote && <div className="mt-auto text-center">{footerNote}</div>}
      </div>
    </div>
  );
}
