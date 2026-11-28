import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronRight,
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
import { BUSINESS_FACILITIES } from '../../types/qrGenerator';
import type { BusinessContent } from '../../types/qrGenerator';
import {
  calculateRelativeLuminance,
  extractDisplayHost,
  formatVCardManualAddress,
  resolveBusinessScheduleRows,
  resolveVCardBrutalismPalette,
  sanitizeExternalUrl,
} from '../../lib/qrHelpers';
import { getSocialPlatformMeta } from '../../lib/qrPresets';
import { VCardAccordionCard, VCardSplashOverlay } from './VCardMobileView';
import { BusinessFacilityIcon } from './BusinessFacilityIcon';
import BusinessBrutalismView from './BusinessBrutalismView';
import type { BusinessSectionKey } from './BusinessBrutalismView';

interface BusinessMobileViewProps {
  content: BusinessContent;
  playSplashOnMount?: boolean;
  compact?: boolean;
  hasTopMockupBar?: boolean;
  footerNote?: ReactNode;
}

function getTodayBusinessKey(): 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun' {
  const day = new Date().getDay();
  const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  return map[day] ?? 'mon';
}

export default function BusinessMobileView({
  content,
  playSplashOnMount = false,
  compact = false,
  footerNote,
}: BusinessMobileViewProps) {
  const [openSections, setOpenSections] = useState<
    Record<BusinessSectionKey, boolean>
  >({
    hours: false,
    summary: false,
    contact: false,
    location: false,
    facilities: false,
    social: false,
  });
  const [showingSplash, setShowingSplash] = useState(() =>
    Boolean(playSplashOnMount && content.splashDataUrl)
  );
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!showingSplash) return;
    const timer = setTimeout(() => setShowingSplash(false), 1450);
    return () => clearTimeout(timer);
  }, [showingSplash]);

  const primaryBg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(content.primaryColor)
    ? content.primaryColor
    : '#ECEDF1';
  const secondaryBg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(
    content.secondaryColor
  )
    ? content.secondaryColor
    : '#232321';

  const secondaryLum = calculateRelativeLuminance(secondaryBg);
  const ctaTextColor = secondaryLum > 0.48 ? '#18181B' : '#FFFFFF';

  const visibleButtons = content.buttons.filter(
    (btn) => btn.label.trim().length > 0
  );
  const scheduleRows = resolveBusinessScheduleRows(content);
  const hasSchedule =
    content.scheduleMode === 'open24' || scheduleRows.some((row) => row.enabled);
  const todayKey = getTodayBusinessKey();

  const nonEmptyPhones = content.phones.filter((p) => p.number.trim().length > 0);
  const nonEmptyEmails = content.emails.filter((em) => em.email.trim().length > 0);
  const safeWebsite = content.website.trim()
    ? sanitizeExternalUrl(content.website)
    : '#';
  const hasContactInfo = Boolean(
    content.contactName.trim() ||
      nonEmptyPhones.length > 0 ||
      nonEmptyEmails.length > 0 ||
      safeWebsite !== '#'
  );

  const manualAddress = formatVCardManualAddress(content);
  const safeAddressUrl =
    content.addressMode === 'url' && content.addressUrl.trim()
      ? sanitizeExternalUrl(content.addressUrl)
      : '#';
  const hasLocation =
    content.addressMode === 'manual'
      ? Boolean(manualAddress)
      : safeAddressUrl !== '#';

  const selectedFacilities = BUSINESS_FACILITIES.filter((f) =>
    content.facilities.includes(f.id)
  );
  const validSocials = content.socials.filter((s) => s.url.trim().length > 0);

  const toggleSection = (key: BusinessSectionKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSharePage = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const title = content.companyName.trim() || 'Halaman Bisnis';

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text: content.headline.trim() || title,
          url: shareUrl,
        });
        return;
      } catch {
        // Fallback salin tautan
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard && shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      } catch {
        // Abaikan kegagalan clipboard pada mode pratinjau
      }
    }
  };

  if ((content.designStyle ?? 'default') === 'brutalism') {
    const brutalPalette = resolveVCardBrutalismPalette(content.brutalismPalette);
    return (
      <div className="relative flex-1 flex flex-col min-h-full">
        {playSplashOnMount && content.splashDataUrl && (
          <VCardSplashOverlay
            visible={showingSplash}
            imageUrl={content.splashDataUrl}
            onDismiss={() => setShowingSplash(false)}
            fadeBackdropIn={false}
            fullScreen
          />
        )}
        <BusinessBrutalismView
          content={content}
          palette={brutalPalette}
          compact={compact}
          visibleButtons={visibleButtons}
          scheduleRows={scheduleRows}
          hasSchedule={hasSchedule}
          todayKey={todayKey}
          nonEmptyPhones={nonEmptyPhones}
          nonEmptyEmails={nonEmptyEmails}
          safeWebsite={safeWebsite}
          hasContactInfo={hasContactInfo}
          manualAddress={manualAddress}
          safeAddressUrl={safeAddressUrl}
          hasLocation={hasLocation}
          selectedFacilities={selectedFacilities}
          validSocials={validSocials}
          openSections={openSections}
          copiedShare={copiedShare}
          onToggleSection={toggleSection}
          onSharePage={() => void handleSharePage()}
          footerNote={footerNote}
        />
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-full bg-[#F8FAFC]">
      {playSplashOnMount && content.splashDataUrl && (
        <VCardSplashOverlay
          visible={showingSplash}
          imageUrl={content.splashDataUrl}
          onDismiss={() => setShowingSplash(false)}
          fadeBackdropIn={false}
          fullScreen
        />
      )}

      {/* Header Band + Foto Sampul Bisnis */}
      <div className="relative flex-shrink-0">
        <div
          aria-hidden="true"
          className={`absolute inset-x-0 top-0 ${
            content.coverDataUrl
              ? compact
                ? 'h-20'
                : 'h-32'
              : compact
                ? 'h-10'
                : 'h-16'
          }`}
          style={{ backgroundColor: primaryBg }}
        />

        <div className={`relative z-10 ${compact ? 'px-3 pt-1.5' : 'px-5 pt-4'}`}>
          <div
            className={`w-full overflow-hidden rounded-2xl border border-black/5 shadow-md bg-white flex items-center justify-center ${
              compact ? 'aspect-[16/9]' : 'aspect-[16/10]'
            }`}
          >
            {content.coverDataUrl ? (
              <img
                src={content.coverDataUrl}
                alt={content.companyName || 'Header Bisnis'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-zinc-500"
                style={{
                  background: `linear-gradient(135deg, ${primaryBg}88 0%, #FFFFFF 100%)`,
                }}
              >
                <div className="w-11 h-11 rounded-2xl bg-white/90 shadow-xs border border-zinc-200/70 flex items-center justify-center text-zinc-700">
                  <Store className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-zinc-500">
                  Tambahkan gambar bisnis Anda
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Identitas Bisnis & Tombol Aksi */}
      <motion.div
        initial={compact ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`flex-1 flex flex-col ${
          compact ? 'px-3 pt-3 pb-6 space-y-2.5' : 'px-5 pt-5 pb-8 space-y-3.5'
        }`}
      >
        <div className="text-center px-1">
          <h3
            className={`${
              compact ? 'text-[17px]' : 'text-[22px]'
            } font-extrabold text-zinc-900 tracking-tight leading-snug break-words`}
          >
            {content.companyName.trim() || 'Nama Perusahaan Anda'}
          </h3>
          {content.headline.trim() && (
            <p className="text-xs sm:text-sm font-semibold text-zinc-600 mt-1 break-words">
              {content.headline.trim()}
            </p>
          )}
          {content.subtitle.trim() && (
            <p className="text-[11px] sm:text-xs text-zinc-500 mt-1 leading-relaxed break-words">
              {content.subtitle.trim()}
            </p>
          )}
        </div>

        {/* Stacked CTA Buttons */}
        {visibleButtons.length > 0 && (
          <div className="space-y-2 pt-0.5">
            {visibleButtons.map((btn) => {
              const safeUrl = btn.url.trim()
                ? sanitizeExternalUrl(btn.url)
                : '#';
              const isValidLink = safeUrl !== '#';
              const commonClass =
                'w-full rounded-xl px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-opacity hover:opacity-90 active:scale-[0.99]';
              return isValidLink ? (
                <a
                  key={btn.id}
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: secondaryBg,
                    color: ctaTextColor,
                  }}
                  className={commonClass}
                >
                  <span className="truncate">{btn.label.trim()}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80 flex-shrink-0" />
                </a>
              ) : (
                <div
                  key={btn.id}
                  style={{
                    backgroundColor: secondaryBg,
                    color: ctaTextColor,
                  }}
                  className={commonClass}
                >
                  <span className="truncate">{btn.label.trim()}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Kartu Akordeon Informasi Bisnis */}
        <div className="space-y-2.5 pt-1">
          {hasSchedule && (
            <VCardAccordionCard
              icon={<Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              title="Jam buka"
              isOpen={openSections.hours}
              onToggle={() => toggleSection('hours')}
            >
              <div className="px-4 pb-4 pt-2 border-t border-zinc-100">
                {content.scheduleMode === 'open24' ? (
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-2 text-xs font-semibold text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <span>Buka 24 Jam (Senin – Minggu)</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {scheduleRows.map((row) => {
                      const isToday = row.key === todayKey;
                      return (
                        <div
                          key={row.key}
                          className={`flex items-start justify-between gap-2 text-xs py-0.5 ${
                            isToday ? 'font-bold text-zinc-900' : 'text-zinc-600'
                          }`}
                        >
                          <span className="inline-flex items-center gap-1.5 flex-shrink-0">
                            {isToday && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                            )}
                            <span>{row.label}</span>
                          </span>
                          <span className="text-right">
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
            </VCardAccordionCard>
          )}

          {content.summary.trim().length > 0 && (
            <VCardAccordionCard
              icon={<FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              title="Ringkasan"
              isOpen={openSections.summary}
              onToggle={() => toggleSection('summary')}
            >
              <div className="px-4 pb-4 pt-2 border-t border-zinc-100">
                <p className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line break-words">
                  {content.summary.trim()}
                </p>
              </div>
            </VCardAccordionCard>
          )}

          {hasContactInfo && (
            <VCardAccordionCard
              icon={<Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              title="Kontak"
              isOpen={openSections.contact}
              onToggle={() => toggleSection('contact')}
            >
              <div className="px-4 pb-4 pt-2 space-y-3 border-t border-zinc-100">
                {content.contactName.trim() && (
                  <div className="flex items-start gap-3">
                    <User className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Narahubung
                      </p>
                      <p className="text-xs font-medium text-zinc-800 break-words">
                        {content.contactName.trim()}
                      </p>
                    </div>
                  </div>
                )}

                {nonEmptyPhones.map((phone) => (
                  <div key={phone.id} className="flex items-start gap-3">
                    <Phone className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {phone.label}
                      </p>
                      <a
                        href={`tel:${phone.number.replace(/[^\d+]/g, '')}`}
                        className="text-xs font-medium text-zinc-800 hover:text-blue-600 break-all"
                      >
                        {phone.number}
                      </a>
                    </div>
                  </div>
                ))}

                {nonEmptyEmails.map((em) => (
                  <div key={em.id} className="flex items-start gap-3">
                    <Mail className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {em.label}
                      </p>
                      <a
                        href={`mailto:${em.email}`}
                        className="text-xs font-medium text-zinc-800 hover:text-blue-600 break-all"
                      >
                        {em.email}
                      </a>
                    </div>
                  </div>
                ))}

                {safeWebsite !== '#' && (
                  <div className="flex items-start gap-3">
                    <Globe className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Situs Web
                      </p>
                      <a
                        href={safeWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-zinc-800 hover:text-blue-600 break-all"
                      >
                        {extractDisplayHost(content.website)}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </VCardAccordionCard>
          )}

          {hasLocation && (
            <VCardAccordionCard
              icon={<MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />}
              title="Lokasi"
              isOpen={openSections.location}
              onToggle={() => toggleSection('location')}
            >
              <div className="px-4 pb-4 pt-2 border-t border-zinc-100">
                {content.addressMode === 'manual' ? (
                  <p className="text-xs text-zinc-700 leading-relaxed break-words">
                    {manualAddress}
                  </p>
                ) : (
                  <a
                    href={safeAddressUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline break-all"
                  >
                    <span>Buka Peta Lokasi</span>
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  </a>
                )}
              </div>
            </VCardAccordionCard>
          )}

          {selectedFacilities.length > 0 && (
            <VCardAccordionCard
              icon={
                <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              }
              title="Fasilitas"
              isOpen={openSections.facilities}
              onToggle={() => toggleSection('facilities')}
            >
              <div className="px-4 pb-4 pt-2.5 border-t border-zinc-100 flex flex-wrap gap-1.5">
                {selectedFacilities.map((facility) => (
                  <span
                    key={facility.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-[11px] font-semibold text-zinc-700"
                  >
                    <BusinessFacilityIcon
                      id={facility.id}
                      className="w-3.5 h-3.5 text-blue-600"
                    />
                    <span>{facility.label}</span>
                  </span>
                ))}
              </div>
            </VCardAccordionCard>
          )}

          {validSocials.length > 0 && (
            <VCardAccordionCard
              icon={
                <ThumbsUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
              }
              title="Media Sosial"
              isOpen={openSections.social}
              onToggle={() => toggleSection('social')}
            >
              <div className="px-4 pb-4 pt-2 space-y-2 border-t border-zinc-100">
                {validSocials.map((soc) => {
                  const meta = getSocialPlatformMeta(soc.platform);
                  const safeSocialUrl = sanitizeExternalUrl(soc.url);
                  return (
                    <a
                      key={soc.id}
                      href={safeSocialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2.5 p-2 rounded-xl hover:bg-zinc-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={meta.iconDataUrl}
                          alt={meta.label}
                          className="w-7 h-7 rounded-lg flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-zinc-800 truncate">
                            {soc.label.trim() || meta.label}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">
                            {extractDisplayHost(soc.url)}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </VCardAccordionCard>
          )}
        </div>

        {/* Tombol Bagikan Halaman Bisnis */}
        <button
          type="button"
          onClick={() => void handleSharePage()}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 px-4 py-2.5 text-xs font-bold text-zinc-700 transition-all cursor-pointer"
        >
          {copiedShare ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
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
