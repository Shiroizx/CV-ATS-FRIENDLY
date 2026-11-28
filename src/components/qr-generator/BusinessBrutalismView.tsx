import type { ReactNode } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  Share2,
  Store,
  ThumbsUp,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import type {
  BusinessButtonItem,
  BusinessContent,
  BusinessFacilityId,
  VCardBrutalismPalette,
  VCardEmailItem,
  VCardPhoneItem,
  VCardSocialItem,
} from '../../types/qrGenerator';
import type { BusinessScheduleRow } from '../../lib/qrHelpers';
import {
  extractDisplayHost,
  hasLowColorContrast,
  pickAccessibleInkOnColor,
  sanitizeExternalUrl,
} from '../../lib/qrHelpers';
import { getSocialPlatformMeta } from '../../lib/qrPresets';
import { BusinessFacilityIcon } from './BusinessFacilityIcon';
import { BrutalAccordionBox } from './VCardBrutalismView';

export type BusinessSectionKey =
  | 'hours'
  | 'summary'
  | 'contact'
  | 'location'
  | 'facilities'
  | 'social';

interface BusinessBrutalismViewProps {
  content: BusinessContent;
  palette: VCardBrutalismPalette;
  compact: boolean;
  visibleButtons: BusinessButtonItem[];
  scheduleRows: BusinessScheduleRow[];
  hasSchedule: boolean;
  todayKey: string;
  nonEmptyPhones: VCardPhoneItem[];
  nonEmptyEmails: VCardEmailItem[];
  safeWebsite: string;
  hasContactInfo: boolean;
  manualAddress: string;
  safeAddressUrl: string;
  hasLocation: boolean;
  selectedFacilities: readonly { id: BusinessFacilityId; label: string }[];
  validSocials: VCardSocialItem[];
  openSections: Record<BusinessSectionKey, boolean>;
  copiedShare: boolean;
  onToggleSection: (key: BusinessSectionKey) => void;
  onSharePage: () => void;
  footerNote?: ReactNode;
}

/**
 * Tampilan Halaman Bisnis bergaya Neo-Brutalism / Brutalism (tanpa wave):
 * pita mono atas, bingkai sampul border 2px ber-offset shadow 4px, tombol CTA tajam,
 * akordeon kontras tinggi, serta dukungan penuh palet kustom WCAG AA.
 */
export default function BusinessBrutalismView({
  content,
  palette,
  compact,
  visibleButtons,
  scheduleRows,
  hasSchedule,
  todayKey,
  nonEmptyPhones,
  nonEmptyEmails,
  safeWebsite,
  hasContactInfo,
  manualAddress,
  safeAddressUrl,
  hasLocation,
  selectedFacilities,
  validSocials,
  openSections,
  copiedShare,
  onToggleSection,
  onSharePage,
  footerNote,
}: BusinessBrutalismViewProps) {
  const ink = palette.text;
  const surfaceBg = palette.surface;
  const surfaceInk = pickAccessibleInkOnColor(surfaceBg, ink, '#FFFFFF');
  const isLightSurface = !hasLowColorContrast(surfaceBg, '#111827', 3.5);
  const cardBg = isLightSurface ? '#FFFFFF' : '#18181B';
  const cardInk = pickAccessibleInkOnColor(cardBg, ink, '#FFFFFF');
  const mutedInkColor = isLightSurface ? '#52525B' : '#A1A1AA';
  const ctaInk = pickAccessibleInkOnColor(palette.secondary, ink, '#FFFFFF');

  return (
    <div
      className="relative flex-1 min-h-full flex flex-col"
      style={{ backgroundColor: surfaceBg, color: surfaceInk }}
    >
      {/* Strip Identitas Mono Atas */}
      <div
        className="px-3.5 py-1.5 flex items-center justify-between gap-2 text-[10px] font-mono font-bold uppercase tracking-widest border-b-2"
        style={{
          backgroundColor: palette.secondary,
          borderColor: ink,
          color: ctaInk,
        }}
      >
        <span>BISNIS // BRUTAL</span>
        <span>PROFIL RESMI</span>
      </div>

      {/* Bagian Header Band + Sampul Bisnis Berbingkai Tegas */}
      <div
        className={`relative flex-shrink-0 px-3.5 ${
          compact ? 'pt-3 pb-4' : 'pt-4 pb-5'
        } border-b-2`}
        style={{
          backgroundColor: palette.primary,
          borderColor: ink,
        }}
      >
        <div
          className="w-full overflow-hidden rounded-md border-2 bg-white flex items-center justify-center aspect-[16/9]"
          style={{
            borderColor: ink,
            boxShadow: `4px 4px 0px ${ink}`,
          }}
        >
          {content.coverDataUrl ? (
            <img
              src={content.coverDataUrl}
              alt={content.companyName || 'Header Bisnis'}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center gap-1.5"
              style={{ backgroundColor: surfaceBg, color: surfaceInk }}
            >
              <div
                className="w-11 h-11 rounded-sm border-2 flex items-center justify-center"
                style={{
                  backgroundColor: palette.primary,
                  borderColor: ink,
                  color: pickAccessibleInkOnColor(palette.primary, ink, '#FFFFFF'),
                  boxShadow: `2px 2px 0px ${ink}`,
                }}
              >
                <Store className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wide">
                Tambahkan gambar bisnis
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Identitas Bisnis, CTA, & Akordeon Brutalist */}
      <motion.div
        initial={compact ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`flex-1 flex flex-col px-3.5 ${
          compact ? 'pt-3.5 pb-6 space-y-2.5' : 'pt-5 pb-8 space-y-3'
        }`}
      >
        <div className="text-center px-1">
          <h3
            className={`${
              compact ? 'text-[18px]' : 'text-2xl'
            } font-black tracking-tight leading-snug break-words`}
            style={{ color: surfaceInk }}
          >
            {content.companyName.trim() || 'Nama Perusahaan Anda'}
          </h3>

          {content.headline.trim() && (
            <span
              className="mt-1.5 inline-block px-2.5 py-0.5 rounded-xs border-2 text-[11px] font-mono font-bold max-w-full break-words"
              style={{
                backgroundColor: palette.primary,
                borderColor: ink,
                color: pickAccessibleInkOnColor(palette.primary, ink, '#FFFFFF'),
                boxShadow: `2px 2px 0px ${ink}`,
              }}
            >
              {content.headline.trim()}
            </span>
          )}

          {content.subtitle.trim() && (
            <p
              className="text-[11px] sm:text-xs font-medium mt-2 leading-relaxed break-words"
              style={{ color: surfaceInk, opacity: 0.85 }}
            >
              {content.subtitle.trim()}
            </p>
          )}
        </div>

        {/* Tombol Aksi CTA Brutalism */}
        {visibleButtons.length > 0 && (
          <div className="space-y-2 pt-0.5">
            {visibleButtons.map((btn) => {
              const safeUrl = btn.url.trim()
                ? sanitizeExternalUrl(btn.url)
                : '#';
              const isValidLink = safeUrl !== '#';
              const commonClass =
                'w-full rounded-md border-2 px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none';
              const btnStyle = {
                backgroundColor: palette.secondary,
                borderColor: ink,
                color: ctaInk,
                boxShadow: `3px 3px 0px ${ink}`,
              };
              return isValidLink ? (
                <a
                  key={btn.id}
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={btnStyle}
                  className={commonClass}
                >
                  <span className="truncate">{btn.label.trim()}</span>
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
              ) : (
                <div key={btn.id} style={btnStyle} className={commonClass}>
                  <span className="truncate">{btn.label.trim()}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Daftar Akordeon Brutalism */}
        <div className="space-y-2.5 pt-1">
          {hasSchedule && (
            <BrutalAccordionBox
              icon={<Clock className="w-3.5 h-3.5" />}
              title="Jam buka"
              isOpen={openSections.hours}
              ink={ink}
              accentBg={palette.primary}
              cardBg={cardBg}
              titleColor={cardInk}
              onToggle={() => onToggleSection('hours')}
            >
              <div className="px-3.5 pb-3.5 pt-2.5">
                {content.scheduleMode === 'open24' ? (
                  <div
                    className="flex items-center gap-2 rounded-xs border-2 px-3 py-2 text-xs font-mono font-bold"
                    style={{
                      backgroundColor: palette.primary,
                      borderColor: ink,
                      color: pickAccessibleInkOnColor(
                        palette.primary,
                        ink,
                        '#FFFFFF'
                      ),
                    }}
                  >
                    <span
                      className="w-2 h-2 bg-emerald-500 border flex-shrink-0"
                      style={{ borderColor: ink }}
                    />
                    <span>Buka 24 Jam (Senin – Minggu)</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {scheduleRows.map((row) => {
                      const isToday = row.key === todayKey;
                      return (
                        <div
                          key={row.key}
                          className="flex items-start justify-between gap-2 text-xs py-0.5"
                          style={{
                            color: cardInk,
                            fontWeight: isToday ? 800 : 500,
                          }}
                        >
                          <span className="inline-flex items-center gap-1.5 flex-shrink-0">
                            {isToday && (
                              <span
                                className="w-2 h-2 border"
                                style={{
                                  backgroundColor: palette.primary,
                                  borderColor: ink,
                                }}
                              />
                            )}
                            <span>{row.label}</span>
                          </span>
                          <span className="text-right font-mono text-[11px]">
                            {row.enabled
                              ? row.formattedIntervals.join(', ')
                              : 'Tutup'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </BrutalAccordionBox>
          )}

          {content.summary.trim().length > 0 && (
            <BrutalAccordionBox
              icon={<FileText className="w-3.5 h-3.5" />}
              title="Ringkasan"
              isOpen={openSections.summary}
              ink={ink}
              accentBg={palette.secondary}
              cardBg={cardBg}
              titleColor={cardInk}
              onToggle={() => onToggleSection('summary')}
            >
              <div className="px-3.5 pb-3.5 pt-2.5">
                <p
                  className="text-xs font-medium leading-relaxed whitespace-pre-line break-words"
                  style={{ color: cardInk }}
                >
                  {content.summary.trim()}
                </p>
              </div>
            </BrutalAccordionBox>
          )}

          {hasContactInfo && (
            <BrutalAccordionBox
              icon={<Phone className="w-3.5 h-3.5" />}
              title="Kontak"
              isOpen={openSections.contact}
              ink={ink}
              accentBg={palette.primary}
              cardBg={cardBg}
              titleColor={cardInk}
              onToggle={() => onToggleSection('contact')}
            >
              <div className="px-3.5 pb-3.5 pt-2.5 space-y-2.5 text-xs">
                {content.contactName.trim() && (
                  <div className="flex items-start gap-2.5" style={{ color: cardInk }}>
                    <User className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p
                        className="text-[10px] font-mono font-bold uppercase tracking-wider"
                        style={{ color: mutedInkColor }}
                      >
                        Narahubung
                      </p>
                      <p className="font-bold break-words">
                        {content.contactName.trim()}
                      </p>
                    </div>
                  </div>
                )}

                {nonEmptyPhones.map((phone) => (
                  <a
                    key={phone.id}
                    href={`tel:${phone.number.replace(/[^\d+]/g, '')}`}
                    className="flex items-start gap-2.5 hover:underline"
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

                {nonEmptyEmails.map((em) => (
                  <a
                    key={em.id}
                    href={`mailto:${em.email}`}
                    className="flex items-start gap-2.5 hover:underline"
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

                {safeWebsite !== '#' && (
                  <a
                    href={safeWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 hover:underline"
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
              </div>
            </BrutalAccordionBox>
          )}

          {hasLocation && (
            <BrutalAccordionBox
              icon={<MapPin className="w-3.5 h-3.5" />}
              title="Lokasi"
              isOpen={openSections.location}
              ink={ink}
              accentBg={palette.secondary}
              cardBg={cardBg}
              titleColor={cardInk}
              onToggle={() => onToggleSection('location')}
            >
              <div className="px-3.5 pb-3.5 pt-2.5">
                {content.addressMode === 'manual' ? (
                  <p
                    className="text-xs font-semibold leading-relaxed break-words"
                    style={{ color: cardInk }}
                  >
                    {manualAddress}
                  </p>
                ) : (
                  <a
                    href={safeAddressUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline break-all"
                    style={{ color: cardInk }}
                  >
                    <span>Buka Peta Lokasi</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                )}
              </div>
            </BrutalAccordionBox>
          )}

          {selectedFacilities.length > 0 && (
            <BrutalAccordionBox
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              title="Fasilitas"
              isOpen={openSections.facilities}
              ink={ink}
              accentBg={palette.primary}
              cardBg={cardBg}
              titleColor={cardInk}
              onToggle={() => onToggleSection('facilities')}
            >
              <div className="px-3.5 pb-3.5 pt-2.5 flex flex-wrap gap-2">
                {selectedFacilities.map((facility, idx) => {
                  const chipBg = idx % 2 === 0 ? palette.primary : surfaceBg;
                  const chipInk = pickAccessibleInkOnColor(
                    chipBg,
                    ink,
                    '#FFFFFF'
                  );
                  return (
                    <span
                      key={facility.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs border-2 text-[11px] font-mono font-bold"
                      style={{
                        backgroundColor: chipBg,
                        borderColor: ink,
                        color: chipInk,
                        boxShadow: `2px 2px 0px ${ink}`,
                      }}
                    >
                      <BusinessFacilityIcon
                        id={facility.id}
                        className="w-3.5 h-3.5"
                      />
                      <span>{facility.label}</span>
                    </span>
                  );
                })}
              </div>
            </BrutalAccordionBox>
          )}

          {validSocials.length > 0 && (
            <BrutalAccordionBox
              icon={<ThumbsUp className="w-3.5 h-3.5" />}
              title="Media Sosial"
              isOpen={openSections.social}
              ink={ink}
              accentBg={palette.secondary}
              cardBg={cardBg}
              titleColor={cardInk}
              onToggle={() => onToggleSection('social')}
            >
              <div className="px-3.5 pb-3.5 pt-2.5 space-y-2 text-xs">
                {validSocials.map((soc) => {
                  const meta = getSocialPlatformMeta(soc.platform);
                  const safeSocialUrl = sanitizeExternalUrl(soc.url);
                  return (
                    <a
                      key={soc.id}
                      href={safeSocialUrl}
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
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">
                            {soc.label.trim() || meta.label}
                          </p>
                          <p
                            className="text-[10px] font-mono truncate"
                            style={{ color: mutedInkColor }}
                          >
                            {extractDisplayHost(soc.url)}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </BrutalAccordionBox>
          )}
        </div>

        {/* Tombol Bagikan Halaman Bisnis */}
        <button
          type="button"
          onClick={onSharePage}
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
              <span>Tautan halaman disalin!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan Halaman Bisnis</span>
            </>
          )}
        </button>

        {footerNote && <div className="mt-auto text-center">{footerNote}</div>}
      </motion.div>
    </div>
  );
}
