import { useState } from 'react';
import {
  AlertCircle,
  Building2,
  Check,
  ChevronDown,
  Globe,
  Loader2,
  Sparkles,
} from 'lucide-react';
import type {
  QRAllowedDomainOption,
  QRDomainMode,
} from '../../types/qrGenerator';
import {
  CUSTOM_DOMAIN_CREDIT_COST,
  PUBLIC_QR_DOMAIN,
  normalizePublicQRDomain,
  validateSubdomainSlug,
} from '../../lib/qrHelpers';

export type SlugAvailabilityStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken';

interface QRDomainSelectorCardProps {
  domainMode: QRDomainMode;
  selectedPublicDomain?: string;
  availableDomains?: readonly QRAllowedDomainOption[];
  waiveCustomDomainCredit?: boolean;
  activeSlug: string;
  defaultShortCode: string;
  paidCustomSlug: string | null;
  suggestions: readonly string[];
  customSlugInput: string;
  availability: SlugAvailabilityStatus;
  creditRemaining: number | null;
  errorMsg?: string;
  onSelectPublicDomain?: (domain: string) => void;
  onSelectDefault: () => void;
  onSelectSuggestion: (slug: string) => void;
  onSelectCustomMode: () => void;
  onChangeCustomSlug: (rawValue: string) => void;
}

/**
 * Kartu pengaturan domain tautan QR (bawaan /q/kode, 4 saran subdomain gratis,
 * domain kustom pribadi, serta pemilihan domain khusus partner seperti narainstitute.net).
 */
export default function QRDomainSelectorCard({
  domainMode,
  selectedPublicDomain = PUBLIC_QR_DOMAIN,
  availableDomains = [],
  waiveCustomDomainCredit = false,
  activeSlug,
  defaultShortCode,
  paidCustomSlug,
  suggestions,
  customSlugInput,
  availability,
  creditRemaining,
  errorMsg,
  onSelectPublicDomain,
  onSelectDefault,
  onSelectSuggestion,
  onSelectCustomMode,
  onChangeCustomSlug,
}: QRDomainSelectorCardProps) {
  const [open, setOpen] = useState(true);

  const activeDomain = normalizePublicQRDomain(selectedPublicDomain);
  const isPartnerDomain = activeDomain !== PUBLIC_QR_DOMAIN;
  const hasMultipleDomains = availableDomains.length > 1;

  const normalizedCustom = customSlugInput.trim().toLowerCase();
  const customValidation = normalizedCustom
    ? validateSubdomainSlug(normalizedCustom)
    : { valid: false };
  const isCustomAlreadyPaid = Boolean(
    waiveCustomDomainCredit ||
      (paidCustomSlug &&
        normalizedCustom &&
        (paidCustomSlug === normalizedCustom ||
          paidCustomSlug === `${activeDomain}:${normalizedCustom}`))
  );
  const insufficientForCustom =
    domainMode === 'custom' &&
    !isCustomAlreadyPaid &&
    creditRemaining !== null &&
    creditRemaining < CUSTOM_DOMAIN_CREDIT_COST;

  const previewUrl =
    domainMode === 'default'
      ? `https://www.${PUBLIC_QR_DOMAIN}/q/${defaultShortCode}`
      : `https://${(domainMode === 'custom' ? normalizedCustom || 'nama-anda' : activeSlug).toLowerCase()}.${activeDomain}`;

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-bold text-zinc-900">Custom domain</h3>
            <p className="text-xs sm:text-sm text-zinc-500">
              {hasMultipleDomains
                ? 'Pilih domain organisasi atau buat subdomain kustom Anda sendiri'
                : 'Pilih saran subdomain atau buat nama domain Anda sendiri'}
            </p>
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
          {/* Pemilih Base Domain (tampil khusus jika user punya akses domain partner mis. narainstitute.net) */}
          {hasMultipleDomains && onSelectPublicDomain && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                  <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                  Pilih Domain Utama
                </span>
                <span className="text-[11px] font-medium text-indigo-600">
                  Akses Partner Terverifikasi
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableDomains.map((opt) => {
                  const selected = activeDomain === normalizePublicQRDomain(opt.domain);
                  const isPartner = opt.domain !== PUBLIC_QR_DOMAIN;
                  return (
                    <button
                      key={opt.domain}
                      type="button"
                      onClick={() => onSelectPublicDomain(opt.domain)}
                      className={`px-3.5 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        selected
                          ? isPartner
                            ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/15'
                            : 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/15'
                          : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-mono font-bold text-zinc-900 truncate">
                            *.{opt.domain}
                          </span>
                          {isPartner && (
                            <span className="px-1.5 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-extrabold uppercase tracking-wider">
                              Resmi
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                          {opt.orgName}
                          {opt.waiveCredit ? ' • Custom domain gratis' : ''}
                        </p>
                      </div>
                      {selected && (
                        <Check
                          className={`w-4 h-4 flex-shrink-0 ${
                            isPartner ? 'text-indigo-600' : 'text-blue-600'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ringkasan URL aktif */}
          <div className="rounded-xl bg-zinc-50 border border-zinc-200/80 px-3.5 py-2.5 flex items-center justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                Alamat QR Aktif
              </p>
              <p className="text-xs sm:text-sm font-mono font-semibold text-blue-700 truncate">
                {previewUrl}
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${
                domainMode === 'custom' && !isCustomAlreadyPaid
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : isPartnerDomain
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {domainMode === 'custom'
                ? waiveCustomDomainCredit
                  ? 'Gratis Partner'
                  : isCustomAlreadyPaid
                    ? 'Domain Kustom Aktif'
                    : `${CUSTOM_DOMAIN_CREDIT_COST} Kredit`
                : 'Tanpa Biaya Ekstra'}
            </span>
          </div>

          {/* 4 Saran Nama Domain Gratis */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-800">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                4 Saran Nama Domain Gratis
              </span>
              <button
                type="button"
                onClick={onSelectDefault}
                className={`text-xs font-semibold transition-colors cursor-pointer ${
                  domainMode === 'default'
                    ? 'text-blue-600 underline'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Pakai link standar (/q/)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((slug) => {
                const selected =
                  domainMode === 'suggested' && activeSlug === slug;
                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => onSelectSuggestion(slug)}
                    className={`px-3.5 py-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      selected
                        ? 'border-blue-500 bg-blue-50/70 ring-2 ring-blue-500/15'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">
                        {slug}
                        <span className="font-normal text-zinc-500">
                          .{activeDomain}
                        </span>
                      </p>
                      <p className="text-[11px] text-emerald-600 font-medium">
                        Saran sistem • Gratis tambahan kredit
                      </p>
                    </div>
                    {selected && (
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Custom Domain Sendiri */}
          <div className="pt-2 border-t border-zinc-100 space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={onSelectCustomMode}
                className="inline-flex items-center gap-2 text-left cursor-pointer group"
              >
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    domainMode === 'custom'
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-zinc-300 bg-white group-hover:border-blue-400'
                  }`}
                >
                  {domainMode === 'custom' && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span className="text-sm font-bold text-zinc-900">
                  Buat nama domain kustom sendiri
                </span>
              </button>

              {waiveCustomDomainCredit ? (
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-bold text-indigo-700">
                  Gratis Khusus Partner
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800">
                  Memakan {CUSTOM_DOMAIN_CREDIT_COST} kredit sekaligus
                </span>
              )}
            </div>

            <div
              onClick={() => {
                if (domainMode !== 'custom') onSelectCustomMode();
              }}
              className={`flex items-center rounded-xl border bg-white overflow-hidden transition-all ${
                domainMode === 'custom'
                  ? errorMsg || (normalizedCustom && !customValidation.valid) || availability === 'taken'
                    ? 'border-red-400 ring-2 ring-red-500/15'
                    : 'border-blue-500 ring-2 ring-blue-500/15'
                  : 'border-zinc-200 opacity-85 hover:opacity-100'
              }`}
            >
              <span className="pl-3.5 text-xs font-mono text-zinc-400 select-none">
                https://
              </span>
              <input
                type="text"
                maxLength={32}
                value={customSlugInput}
                onFocus={() => {
                  if (domainMode !== 'custom') onSelectCustomMode();
                }}
                onChange={(e) => onChangeCustomSlug(e.target.value)}
                placeholder="nama-anda"
                aria-label="Subdomain kustom"
                className="flex-1 min-w-0 px-1.5 py-2.5 text-sm font-mono font-semibold text-zinc-900 bg-transparent focus:outline-none placeholder:text-zinc-400 placeholder:font-normal"
              />
              <span className="pr-3.5 text-xs font-mono font-semibold text-zinc-500 bg-zinc-50 h-full py-2.5 pl-2.5 border-l border-zinc-200 select-none">
                .{activeDomain}
              </span>
            </div>

            {/* Status Validasi & Ketersediaan */}
            {domainMode === 'custom' && (
              <div className="space-y-1.5">
                {errorMsg && (
                  <p className="text-xs font-medium text-red-600">{errorMsg}</p>
                )}
                {!errorMsg && normalizedCustom && !customValidation.valid && customValidation.error && (
                  <p className="text-xs font-medium text-red-600">
                    {customValidation.error}
                  </p>
                )}
                {!errorMsg && normalizedCustom && customValidation.valid && (
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    {availability === 'checking' && (
                      <span className="inline-flex items-center gap-1 text-zinc-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Mengecek ketersediaan domain...
                      </span>
                    )}
                    {availability === 'available' && (
                      <span className="inline-flex items-center gap-1 text-emerald-600">
                        <Check className="w-3.5 h-3.5" />
                        {normalizedCustom}.{activeDomain} tersedia!
                      </span>
                    )}
                    {availability === 'taken' && (
                      <span className="inline-flex items-center gap-1 text-red-600">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Domain {normalizedCustom}.{activeDomain} sudah digunakan QR lain, coba nama berbeda.
                      </span>
                    )}
                  </div>
                )}

                {insufficientForCustom && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl px-3.5 py-2.5">
                    Sisa kredit Anda saat ini (<strong>{creditRemaining}</strong>) tidak mencukupi
                    untuk custom domain sendiri (butuh <strong>{CUSTOM_DOMAIN_CREDIT_COST} kredit</strong>).
                    Silakan pilih salah satu dari 4 saran nama domain gratis di atas!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
