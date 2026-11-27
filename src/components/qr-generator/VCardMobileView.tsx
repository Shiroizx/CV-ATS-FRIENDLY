import { useEffect, useState } from 'react';
import {
  Briefcase,
  ChevronDown,
  ExternalLink,
  FileText,
  Globe,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  ThumbsUp,
  User,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { VCardContent } from '../../types/qrGenerator';
import {
  calculateRelativeLuminance,
  downloadVCardFile,
  extractDisplayHost,
  formatVCardManualAddress,
  sanitizeExternalUrl,
} from '../../lib/qrHelpers';
import { getSocialPlatformMeta } from '../../lib/qrPresets';

interface VCardSplashOverlayProps {
  visible: boolean;
  imageUrl: string | null;
  onDismiss: () => void;
  initialFadeIn?: boolean;
}

/**
 * Layar selamat datang layar penuh dengan background putih solid 100%
 * serta animasi transisi masuk & keluar yang halus.
 */
export function VCardSplashOverlay({
  visible,
  imageUrl,
  onDismiss,
  initialFadeIn = true,
}: VCardSplashOverlayProps) {
  return (
    <AnimatePresence initial={initialFadeIn}>
      {visible && imageUrl && (
        <motion.div
          key="vcard-splash-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={onDismiss}
          style={{ backgroundColor: '#FFFFFF' }}
          className="absolute inset-0 z-20 bg-white flex items-center justify-center p-8 cursor-pointer"
          title="Ketuk untuk menutup layar selamat datang"
        >
          <motion.img
            src={imageUrl}
            alt="Layar selamat datang"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[74%] max-h-[55%] object-contain select-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface VCardMobileViewProps {
  content: VCardContent;
  playSplashOnMount?: boolean;
  compact?: boolean;
}

type VCardCardSection = 'contact' | 'company' | 'summary' | 'social';

/**
 * Tampilan kartu nama digital interaktif vCard (digunakan di pratinjau ponsel & halaman scan /q/:shortCode).
 */
export default function VCardMobileView({
  content,
  playSplashOnMount = false,
  compact = true,
}: VCardMobileViewProps) {
  const [openSection, setOpenSection] = useState<VCardCardSection | null>(null);
  const [showingSplash, setShowingSplash] = useState(
    Boolean(playSplashOnMount && content.splashDataUrl)
  );

  useEffect(() => {
    if (!showingSplash) return;
    const timer = setTimeout(() => setShowingSplash(false), 1450);
    return () => clearTimeout(timer);
  }, [showingSplash]);

  const primaryBg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(content.primaryColor)
    ? content.primaryColor
    : '#6594FF';
  const secondaryBg = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(content.secondaryColor)
    ? content.secondaryColor
    : '#FFFFFF';

  const isLightHero = calculateRelativeLuminance(primaryBg) > 0.55;
  const heroTextClass = isLightHero ? 'text-zinc-900' : 'text-white';
  const heroSubClass = isLightHero ? 'text-zinc-700' : 'text-white/85';

  const filledPhones = content.phones.filter((p) => p.number.trim().length > 0);
  const filledEmails = content.emails.filter((e) => e.email.trim().length > 0);
  const manualAddress = formatVCardManualAddress(content);
  const mapHref =
    content.addressMode === 'url' && content.addressUrl.trim()
      ? sanitizeExternalUrl(content.addressUrl)
      : '#';
  const websiteHref = content.website.trim() ? sanitizeExternalUrl(content.website) : '#';
  const filledSocials = content.socials.filter((s) => s.url.trim().length > 0);

  const toggleSection = (key: VCardCardSection) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  return (
    <div
      className="relative flex-1 flex flex-col overflow-y-auto"
      style={{ backgroundColor: secondaryBg }}
    >
      {/* Overlay Layar Selamat Datang (Splash Screen saat dibuka dari scan publik) */}
      {playSplashOnMount && (
        <VCardSplashOverlay
          visible={showingSplash}
          imageUrl={content.splashDataUrl}
          onDismiss={() => setShowingSplash(false)}
          initialFadeIn={false}
        />
      )}

      {/* Bagian Hero Primer */}
      <div
        className={`relative px-5 ${compact ? 'pt-6 pb-10' : 'pt-8 pb-12'} text-center flex flex-col items-center`}
        style={{ backgroundColor: primaryBg }}
      >
        <div
          className={`${
            compact ? 'w-20 h-20' : 'w-24 h-24'
          } rounded-full border-[3.5px] border-white shadow-lg bg-white/25 overflow-hidden flex items-center justify-center mb-3`}
        >
          {content.avatarDataUrl ? (
            <img
              src={content.avatarDataUrl}
              alt={content.fullName || 'Foto Profil'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className={`w-10 h-10 ${heroTextClass} opacity-80`} />
          )}
        </div>

        <h3
          className={`${
            compact ? 'text-base' : 'text-xl'
          } font-extrabold tracking-tight leading-snug max-w-full break-words ${heroTextClass}`}
        >
          {content.fullName.trim() || 'Nama Lengkap Anda'}
        </h3>

        {(content.profession.trim() || content.company.trim()) && (
          <p className={`text-xs mt-1 font-medium ${heroSubClass}`}>
            {[content.profession.trim(), content.company.trim()]
              .filter(Boolean)
              .join(' • ')}
          </p>
        )}

        <button
          type="button"
          onClick={() => downloadVCardFile(content)}
          className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white text-zinc-900 text-xs font-bold shadow-md hover:shadow-lg hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 text-zinc-700" />
          <span>Tambahkan kontak</span>
        </button>
      </div>

      {/* Kartu Informasi Akordeon */}
      <div className="px-3.5 pb-5 -mt-5 relative z-10 space-y-2.5 flex-1">
        {/* 1. Kontak */}
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('contact')}
            className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-zinc-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                Kontak
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                openSection === 'contact' ? 'rotate-180' : '-rotate-90'
              }`}
            />
          </button>

          {openSection === 'contact' && (
            <div className="px-4 pb-3.5 pt-2 border-t border-zinc-100 space-y-2.5 text-xs">
              {filledPhones.length === 0 &&
              filledEmails.length === 0 &&
              websiteHref === '#' &&
              !manualAddress &&
              mapHref === '#' ? (
                <p className="text-zinc-400">Belum ada detail kontak diisi.</p>
              ) : (
                <>
                  {filledPhones.map((phone) => (
                    <a
                      key={phone.id}
                      href={`tel:${phone.number.replace(/\s+/g, '')}`}
                      className="flex items-start gap-2.5 text-zinc-700 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          {phone.label}
                        </p>
                        <p className="font-medium break-all">{phone.number}</p>
                      </div>
                    </a>
                  ))}

                  {filledEmails.map((em) => (
                    <a
                      key={em.id}
                      href={`mailto:${em.email.trim()}`}
                      className="flex items-start gap-2.5 text-zinc-700 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          {em.label}
                        </p>
                        <p className="font-medium break-all">{em.email}</p>
                      </div>
                    </a>
                  ))}

                  {websiteHref !== '#' && (
                    <a
                      href={websiteHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 text-zinc-700 hover:text-blue-600 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Situs Web
                        </p>
                        <p className="font-medium break-all">
                          {extractDisplayHost(content.website)}
                        </p>
                      </div>
                    </a>
                  )}

                  {content.addressMode === 'manual' && manualAddress && (
                    <div className="flex items-start gap-2.5 text-zinc-700">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                          Alamat
                        </p>
                        <p className="font-medium leading-relaxed">{manualAddress}</p>
                      </div>
                    </div>
                  )}

                  {content.addressMode === 'url' && mapHref !== '#' && (
                    <a
                      href={mapHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2.5 text-zinc-700 hover:text-blue-600 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="font-medium inline-flex items-center gap-1">
                        Buka Lokasi Peta
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </a>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* 2. Perusahaan */}
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('company')}
            className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-zinc-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                Perusahaan
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                openSection === 'company' ? 'rotate-180' : '-rotate-90'
              }`}
            />
          </button>

          {openSection === 'company' && (
            <div className="px-4 pb-3.5 pt-2 border-t border-zinc-100 space-y-1.5 text-xs">
              {!content.company.trim() && !content.profession.trim() ? (
                <p className="text-zinc-400">Belum ada info perusahaan diisi.</p>
              ) : (
                <>
                  {content.company.trim() && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Perusahaan
                      </p>
                      <p className="font-semibold text-zinc-800">{content.company}</p>
                    </div>
                  )}
                  {content.profession.trim() && (
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        Profesi / Jabatan
                      </p>
                      <p className="font-medium text-zinc-700">{content.profession}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* 3. Ringkasan */}
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('summary')}
            className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-zinc-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                Ringkasan
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                openSection === 'summary' ? 'rotate-180' : '-rotate-90'
              }`}
            />
          </button>

          {openSection === 'summary' && (
            <div className="px-4 pb-3.5 pt-2 border-t border-zinc-100 text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
              {content.summary.trim() || (
                <span className="text-zinc-400">Belum ada ringkasan diisi.</span>
              )}
            </div>
          )}
        </div>

        {/* 4. Media Sosial */}
        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => toggleSection('social')}
            className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-zinc-50/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <ThumbsUp className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                Media Sosial
              </span>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                openSection === 'social' ? 'rotate-180' : '-rotate-90'
              }`}
            />
          </button>

          {openSection === 'social' && (
            <div className="px-4 pb-3.5 pt-2 border-t border-zinc-100 space-y-2 text-xs">
              {filledSocials.length === 0 ? (
                <p className="text-zinc-400">Belum ada media sosial ditambahkan.</p>
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
                      className="flex items-center justify-between gap-2.5 p-2 rounded-lg bg-zinc-50 hover:bg-blue-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={meta.iconDataUrl}
                          alt={meta.label}
                          className="w-6 h-6 rounded-md flex-shrink-0"
                        />
                        <span className="font-semibold text-zinc-800 truncate">
                          {item.label.trim() || meta.label}
                        </span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    </a>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
