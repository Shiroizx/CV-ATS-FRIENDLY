import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Download,
  Eye,
  FolderClock,
  HelpCircle,
  Loader2,
  QrCode,
  Save,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  QRContentData,
  QRPasswordOptions,
  QRStyleOptions,
  QRType,
  UrlContent,
  VCardContent,
  WizardStep,
} from '../types/qrGenerator';
import {
  DEFAULT_QR_STYLE,
  INITIAL_URL_CONTENT,
  INITIAL_VCARD_CONTENT,
} from '../types/qrGenerator';
import {
  checkQRScannability,
  generateShortCode,
  getQRDisplayTitle,
  normalizeUrl,
  resolveUrlQRPayload,
  validateQRForm,
} from '../lib/qrHelpers';
import { exportQRFile } from '../lib/qrExport';
import {
  consumeQRDownloadCredit,
  getQRCodeById,
  saveUserQR,
} from '../lib/qrService';
import { getRemainingDownloads } from '../lib/downloadCredit';
import type { DownloadCreditInfo } from '../lib/downloadCredit';
import { useAuth } from '../contexts/AuthContext';
import {
  showConfirm,
  showDownloadLimitReached,
  showError,
  showInfo,
  showSuccess,
  showToast,
} from '../utils/swal';
import QRStepIndicator from '../components/qr-generator/QRStepIndicator';
import QRTypeSelector from '../components/qr-generator/QRTypeSelector';
import QRUrlContentForm from '../components/qr-generator/QRUrlContentForm';
import QRVCardContentForm from '../components/qr-generator/QRVCardContentForm';
import QRCustomizer from '../components/qr-generator/QRCustomizer';
import QRPreview from '../components/qr-generator/QRPreview';

const DRAFT_STORAGE_KEY = 'freebuild_qr_draft_v1';
const DRAFT_PWD_KEY = 'freebuild_qr_pwd_v1';

interface StoredQRDraft {
  step: WizardStep;
  maxReachedStep: WizardStep;
  content: QRContentData;
  style: QRStyleOptions;
  shortCode: string;
}

function coerceContentData(
  raw: Partial<QRContentData> | null | undefined,
  explicitType?: QRType
): QRContentData {
  const targetType = explicitType || raw?.type;
  if (targetType === 'vcard') {
    const vc = (raw || {}) as Partial<VCardContent>;
    return {
      ...INITIAL_VCARD_CONTENT,
      ...vc,
      type: 'vcard',
      phones:
        Array.isArray(vc.phones) && vc.phones.length > 0
          ? vc.phones
          : INITIAL_VCARD_CONTENT.phones,
      emails:
        Array.isArray(vc.emails) && vc.emails.length > 0
          ? vc.emails
          : INITIAL_VCARD_CONTENT.emails,
      socials: Array.isArray(vc.socials) ? vc.socials : [],
      skills: Array.isArray(vc.skills) ? vc.skills : [],
    };
  }
  const u = (raw || {}) as Partial<UrlContent>;
  return { ...INITIAL_URL_CONTENT, ...u, type: 'url' };
}

function readQRDraft(hasEditId: boolean): StoredQRDraft | null {
  if (hasEditId || typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredQRDraft>;
    if (!parsed.content || !parsed.style) return null;
    return {
      step: parsed.step === 2 || parsed.step === 3 ? parsed.step : 1,
      maxReachedStep:
        parsed.maxReachedStep === 3 ? 3 : parsed.maxReachedStep === 2 ? 2 : 1,
      content: coerceContentData(parsed.content),
      style: { ...DEFAULT_QR_STYLE, ...parsed.style },
      shortCode:
        typeof parsed.shortCode === 'string' && parsed.shortCode.length >= 4
          ? parsed.shortCode
          : generateShortCode(8),
    };
  } catch {
    return null;
  }
}

function readDraftPassword(hasEditId: boolean): QRPasswordOptions {
  if (hasEditId || typeof window === 'undefined') {
    return { enabled: false, password: '', alreadyProtected: false };
  }
  try {
    const raw = sessionStorage.getItem(DRAFT_PWD_KEY);
    if (!raw) return { enabled: false, password: '', alreadyProtected: false };
    const parsed = JSON.parse(raw) as { enabled?: boolean; password?: string };
    return {
      enabled: Boolean(parsed.enabled),
      password: typeof parsed.password === 'string' ? parsed.password : '',
      alreadyProtected: false,
    };
  } catch {
    return { enabled: false, password: '', alreadyProtected: false };
  }
}

function persistQRDraft(
  step: WizardStep,
  maxReachedStep: WizardStep,
  content: QRContentData,
  style: QRStyleOptions,
  passwordOpts: QRPasswordOptions,
  shortCode: string
): void {
  try {
    const payload: StoredQRDraft = {
      step,
      maxReachedStep,
      content,
      style,
      shortCode,
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
    sessionStorage.setItem(
      DRAFT_PWD_KEY,
      JSON.stringify({ enabled: passwordOpts.enabled, password: passwordOpts.password })
    );
  } catch {
    // Abaikan jika storage browser penuh
  }
}

function clearQRDraft(): void {
  try {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    sessionStorage.removeItem(DRAFT_PWD_KEY);
  } catch {
    // Abaikan error akses storage
  }
}

export default function QRGeneratorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [initialDraft] = useState<StoredQRDraft | null>(() => readQRDraft(Boolean(id)));

  const [step, setStep] = useState<WizardStep>(() => initialDraft?.step ?? 1);
  const [maxReachedStep, setMaxReachedStep] = useState<WizardStep>(
    () => initialDraft?.maxReachedStep ?? 1
  );
  const [selectedType, setSelectedType] = useState<QRType | null>(
    () => initialDraft?.content.type ?? 'url'
  );
  const [content, setContent] = useState<QRContentData>(
    () => initialDraft?.content ?? INITIAL_URL_CONTENT
  );
  const [splashPreviewNonce, setSplashPreviewNonce] = useState(0);
  const [style, setStyle] = useState<QRStyleOptions>(
    () => initialDraft?.style ?? DEFAULT_QR_STYLE
  );
  const [passwordOpts, setPasswordOpts] = useState<QRPasswordOptions>(() =>
    readDraftPassword(Boolean(id))
  );
  const [shortCode, setShortCode] = useState<string>(
    () => initialDraft?.shortCode ?? generateShortCode(8)
  );
  const [savedId, setSavedId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [prevParamId, setPrevParamId] = useState<string | undefined>(id);
  const [loadedDataId, setLoadedDataId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [creditInfo, setCreditInfo] = useState<DownloadCreditInfo | null>(null);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [hoveredType, setHoveredType] = useState<QRType | null>(null);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  if (prevParamId !== id) {
    setPrevParamId(id);
    if (!id) {
      setStep(1);
      setMaxReachedStep(1);
      setSelectedType('url');
      setContent(INITIAL_URL_CONTENT);
      setStyle(DEFAULT_QR_STYLE);
      setPasswordOpts({ enabled: false, password: '', alreadyProtected: false });
      setShortCode(generateShortCode(8));
      setSavedId(null);
      setLoadedDataId(null);
      setHasUnsavedChanges(false);
      setHasDownloaded(false);
      setErrors({});
    }
  }

  const displayedCredit = user ? creditInfo : null;
  const isLoadingEdit = Boolean(id && user && loadedDataId !== id);

  useEffect(() => {
    document.title = 'Generator Kode QR - FreeBuild CV';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void getRemainingDownloads(true).then((info) => {
      if (!cancelled) setCreditInfo(info);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Simpan draft otomatis di browser agar tidak hilang saat pengguna diarahkan ke Login/Register
  useEffect(() => {
    if (id || savedId) return;
    const hasDraftData =
      content.type === 'vcard'
        ? Boolean(content.fullName.trim() || content.qrName.trim() || content.avatarDataUrl)
        : Boolean(content.url.trim() || content.qrName.trim());
    if (!hasDraftData && step === 1) return;
    persistQRDraft(step, maxReachedStep, content, style, passwordOpts, shortCode);
  }, [id, savedId, step, maxReachedStep, content, style, passwordOpts, shortCode]);

  // Muat QR tersimpan jika ada parameter /:id
  useEffect(() => {
    if (!id || !user || loadedDataId === id) {
      return;
    }

    let cancelled = false;
    void getQRCodeById(id).then(({ data, error }) => {
      if (cancelled) return;
      setLoadedDataId(id);
      if (error || !data) {
        void showError(
          'Gagal Memuat QR',
          error?.message || 'Data QR tidak ditemukan atau Anda tidak memiliki akses.'
        );
        navigate('/my-qr-codes');
        return;
      }

      setSavedId(data.id);
      setShortCode(data.short_code);
      setSelectedType(data.qr_type);
      setContent(coerceContentData(data.content_data, data.qr_type));
      setStyle({ ...DEFAULT_QR_STYLE, ...data.style_options });
      setPasswordOpts({
        enabled: data.requires_password,
        password: '',
        alreadyProtected: data.requires_password,
      });
      setStep(3);
      setMaxReachedStep(3);
      setHasUnsavedChanges(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id, user, loadedDataId, navigate]);

  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'https://www.freebuildcv.tech';
  const qrPayload = resolveUrlQRPayload(origin, shortCode);

  const updateContent = (next: QRContentData) => {
    setContent(next);
    setHasUnsavedChanges(true);
    setHasDownloaded(false);
    if (Object.keys(errors).length > 0) {
      setErrors((prev): Record<string, string> => {
        if (!prev.password) return {};
        return { password: prev.password };
      });
    }
  };

  const updateStyle = (next: QRStyleOptions) => {
    setStyle(next);
    setHasUnsavedChanges(true);
    setHasDownloaded(false);
  };

  const updatePassword = (next: QRPasswordOptions) => {
    setPasswordOpts(next);
    setHasUnsavedChanges(true);
    setHasDownloaded(false);
    if (errors.password) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy.password;
        return copy;
      });
    }
  };

  const handleSelectType = (type: QRType) => {
    setSelectedType(type);
    if (type === 'vcard' && content.type !== 'vcard') {
      setContent(INITIAL_VCARD_CONTENT);
      setHasUnsavedChanges(false);
      setHasDownloaded(false);
      setErrors({});
    } else if (type === 'url' && content.type !== 'url') {
      setContent(INITIAL_URL_CONTENT);
      setHasUnsavedChanges(false);
      setHasDownloaded(false);
      setErrors({});
    }
    setStep(2);
    setMaxReachedStep((prev) => (prev < 2 ? 2 : prev));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const normalizeContentForSave = (raw: QRContentData): QRContentData => {
    if (raw.type === 'vcard') {
      return {
        ...raw,
        qrName: raw.qrName.trim(),
        fullName: raw.fullName.trim(),
        website: raw.website.trim() ? normalizeUrl(raw.website) : '',
        company: raw.company.trim(),
        profession: raw.profession.trim(),
        summary: raw.summary.trim(),
        addressUrl: raw.addressUrl.trim() ? normalizeUrl(raw.addressUrl) : '',
        phones: raw.phones.map((p) => ({ ...p, number: p.number.trim() })),
        emails: raw.emails.map((em) => ({ ...em, email: em.email.trim() })),
        socials: raw.socials
          .filter((s) => s.url.trim().length > 0)
          .map((s) => ({ ...s, url: normalizeUrl(s.url), label: s.label.trim() })),
      };
    }
    return {
      type: 'url',
      url: normalizeUrl(raw.url),
      qrName: raw.qrName.trim(),
    };
  };

  const handleInvalidValidation = (validationErrors: Record<string, string>) => {
    setErrors(validationErrors);
    const step2Err =
      validationErrors.url ||
      validationErrors.fullName ||
      validationErrors.website ||
      validationErrors.emails ||
      validationErrors.socials ||
      validationErrors.addressUrl;
    if (step2Err) {
      setStep(2);
    }
    void showToast(
      'error',
      step2Err || validationErrors.password || 'Periksa kembali data QR Anda.'
    );
  };

  const handleSaveToSupabase = async (): Promise<boolean> => {
    const validation = validateQRForm(content, passwordOpts);
    if (!validation.isValid) {
      handleInvalidValidation(validation.errors);
      return false;
    }

    const normalizedContent = normalizeContentForSave(content);

    setIsSaving(true);
    const { data, error } = await saveUserQR({
      id: savedId,
      shortCode,
      qrType: normalizedContent.type,
      title: getQRDisplayTitle(normalizedContent),
      content: normalizedContent,
      style,
      passwordEnabled: passwordOpts.enabled,
      newPassword: passwordOpts.password,
    });
    setIsSaving(false);

    if (error || !data) {
      await showError(
        'Gagal Menyimpan',
        error?.message || 'Tidak dapat menyimpan Kode QR Anda. Silakan coba lagi.'
      );
      return false;
    }

    setContent(normalizedContent);
    setSavedId(data.id);
    setShortCode(data.short_code);
    setPasswordOpts({
      enabled: data.requires_password,
      password: '',
      alreadyProtected: data.requires_password,
    });
    setHasUnsavedChanges(false);
    clearQRDraft();

    if (!id) {
      setPrevParamId(data.id);
      setLoadedDataId(data.id);
      navigate(`/qr-generator/${data.id}`, { replace: true });
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (selectedType !== 'url' && selectedType !== 'vcard') {
        void showToast('info', 'Pilih URL Situs Web atau vCard untuk melanjutkan.');
        return;
      }
      setStep(2);
      setMaxReachedStep((prev) => (prev < 2 ? 2 : prev));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (step === 2) {
      const check = validateQRForm(content, { enabled: false, password: '' });
      if (!check.isValid) {
        handleInvalidValidation(check.errors);
        return;
      }
      setErrors({});
      setStep(3);
      setMaxReachedStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate('/');
      return;
    }
    setStep((prev) => (prev === 3 ? 2 : 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const redirectToLoginForDownload = () => {
    const validation = validateQRForm(content, passwordOpts);
    if (!validation.isValid) {
      handleInvalidValidation(validation.errors);
      return;
    }

    persistQRDraft(step, maxReachedStep, content, style, passwordOpts, shortCode);
    navigate('/login', { state: { from: '/qr-generator' } });
  };

  const handleExportQR = async (format: 'png' | 'jpg' | 'svg') => {
    setShowDownloadMenu(false);

    if (!user) {
      redirectToLoginForDownload();
      return;
    }

    const validation = validateQRForm(content, passwordOpts);
    if (!validation.isValid) {
      handleInvalidValidation(validation.errors);
      return;
    }

    const scannability = checkQRScannability(style);
    if (scannability.warnings.length > 0) {
      const res = await showConfirm(
        'Kontras QR Rendah',
        `${scannability.warnings[0]} Tetap lanjutkan mengunduh?`,
        'Ya, Tetap Unduh',
        'Perbaiki Dulu'
      );
      if (!res.isConfirmed) return;
    }

    setIsExporting(true);
    try {
      const preCheck = await getRemainingDownloads(true);
      setCreditInfo(preCheck);
      if (preCheck.remaining <= 0) {
        await showDownloadLimitReached(preCheck.count, preCheck.max);
        return;
      }

      const ok = await handleSaveToSupabase();
      if (!ok) return;

      const titleSlug = getQRDisplayTitle(content);
      const { allowed, credit } = await consumeQRDownloadCredit(
        `${titleSlug} (${format.toUpperCase()})`
      );
      setCreditInfo(credit);
      if (!allowed) {
        await showDownloadLimitReached(credit.count, credit.max);
        return;
      }

      await exportQRFile(qrPayload, style, format, titleSlug);
      setHasDownloaded(true);
      void showSuccess(
        'Berhasil Disimpan & Diunduh',
        `Kode QR (${format.toUpperCase()}) telah diunduh dan tersimpan di akun Anda. Sisa kredit download: ${credit.remaining}/${credit.max}.`
      );
    } catch (err) {
      await showError(
        'Gagal Mengekspor QR',
        err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat file QR.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleShowHelp = () => {
    void showInfo(
      'Panduan Generator Kode QR',
      '1. Pilih jenis URL Situs Web.\n2. Masukkan alamat situs web tujuan dan nama QR (opsional).\n3. Kustomisasi bingkai, pola titik, sudut, logo, dan kata sandi opsional. Setiap QR otomatis tersimpan aman di akun Anda dan dapat dikelola melalui menu Riwayat QR Code.'
    );
  };

  if (isLoadingEdit) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3 bg-[#f7f9fc]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-zinc-600">Memuat data QR Code...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fc] pb-28">
      {/* Sub-header Builder */}
      <div className="bg-white/80 backdrop-blur-xs border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-zinc-900 truncate block">
                QR Code Generator
              </span>
            </div>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
              {selectedType === 'vcard' ? 'vCard' : 'URL Situs Web'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {displayedCredit && (
              <Link
                to="/download-history"
                className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  displayedCredit.remaining === 0
                    ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                    : displayedCredit.remaining <= 2
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
                title="Lihat riwayat dan sisa kredit download"
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  Kredit: {displayedCredit.remaining}/{displayedCredit.max}
                </span>
              </Link>
            )}

            {user && (
              <Link
                to="/my-qr-codes"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <FolderClock className="w-4 h-4 text-zinc-500" />
                <span className="hidden sm:inline">Riwayat QR</span>
              </Link>
            )}

            <button
              type="button"
              onClick={handleShowHelp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              Bantuan
            </button>
          </div>
        </div>
      </div>

      {/* Konten Utama 2 Kolom */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Panel Kiri: Wizard */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <QRTypeSelector
                    selected={selectedType}
                    onSelect={handleSelectType}
                    onHover={setHoveredType}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key={`step-2-${content.type}`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  {content.type === 'vcard' ? (
                    <QRVCardContentForm
                      content={content}
                      errors={errors}
                      onChange={updateContent}
                      onPreviewSplash={() => setSplashPreviewNonce((n) => n + 1)}
                    />
                  ) : (
                    <QRUrlContentForm
                      content={content}
                      errors={errors}
                      onChange={updateContent}
                    />
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                >
                  <QRCustomizer
                    qrTypeLabel={selectedType === 'vcard' ? 'vCard' : 'URL Situs Web'}
                    style={style}
                    passwordOpts={passwordOpts}
                    errors={errors}
                    onChangeStyle={updateStyle}
                    onChangePassword={updatePassword}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Panel Kanan: Sticky Mockup Ponsel (Desktop) */}
          <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-20">
            <QRPreview
              step={step}
              hoveredType={hoveredType}
              splashTrigger={splashPreviewNonce}
              content={content}
              style={style}
              qrPayload={qrPayload}
              passwordEnabled={passwordOpts.enabled}
              isActivated={Boolean(savedId)}
              isAuthenticated={Boolean(user)}
              isSaved={Boolean(savedId) && !hasUnsavedChanges}
              isSaving={isSaving}
              isExporting={isExporting}
              showWatermark={!hasDownloaded}
              creditInfo={displayedCredit}
              onDownload={(format) => void handleExportQR(format)}
            />
          </div>
        </div>
      </div>

      {/* Tombol Melayang Pratinjau (Mobile) */}
      <button
        type="button"
        onClick={() => setShowMobilePreview(true)}
        className="lg:hidden fixed bottom-24 right-5 z-30 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-zinc-900 text-white text-sm font-semibold shadow-xl hover:bg-zinc-800 active:scale-95 transition-all"
      >
        <Eye className="w-4 h-4" />
        Pratinjau
      </button>

      {/* Modal Pratinjau Mobile */}
      {showMobilePreview && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-[#f7f9fc] rounded-3xl w-full max-w-md p-5 pt-12 max-h-[92vh] overflow-y-auto shadow-2xl">
            <button
              type="button"
              onClick={() => setShowMobilePreview(false)}
              className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              aria-label="Tutup pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
            <QRPreview
              step={step}
              hoveredType={hoveredType}
              splashTrigger={splashPreviewNonce}
              content={content}
              style={style}
              qrPayload={qrPayload}
              passwordEnabled={passwordOpts.enabled}
              isActivated={Boolean(savedId)}
              isAuthenticated={Boolean(user)}
              isSaved={Boolean(savedId) && !hasUnsavedChanges}
              isSaving={isSaving}
              isExporting={isExporting}
              showWatermark={!hasDownloaded}
              creditInfo={displayedCredit}
              onDownload={(format) => void handleExportQR(format)}
            />
          </div>
        </div>
      )}

      {/* Bilah Navigasi Bawah Tetap (sesuai contoh image) */}
      <footer className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-zinc-200 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <div className="hidden md:block">
            <QRStepIndicator
              currentStep={step}
              maxReachedStep={maxReachedStep}
              onStepClick={(target) => {
                setStep(target);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>

          <div className="relative flex items-center gap-2.5">
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <span>Berikutnya</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    if (!user) {
                      redirectToLoginForDownload();
                      return;
                    }
                    void handleSaveToSupabase().then((ok) => {
                      if (ok) {
                        void showSuccess(
                          'Tersimpan',
                          'Kode QR URL Anda berhasil disimpan ke akun Anda.'
                        );
                      }
                    });
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{savedId ? 'Perbarui' : 'Simpan'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSaving || isExporting}
                  onClick={() => {
                    if (!user) {
                      redirectToLoginForDownload();
                      return;
                    }
                    setShowDownloadMenu((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  <span>Unduh QR</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showDownloadMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDownloadMenu(false)}
                    />
                    <div className="absolute right-0 bottom-14 w-52 bg-white rounded-2xl border border-zinc-200 shadow-xl py-1.5 z-50">
                      <button
                        type="button"
                        onClick={() => void handleExportQR('png')}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50 flex items-center gap-2.5"
                      >
                        <Download className="w-4 h-4 text-blue-600" />
                        Unduh PNG (HD)
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleExportQR('jpg')}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50 flex items-center gap-2.5"
                      >
                        <Download className="w-4 h-4 text-zinc-600" />
                        Unduh JPG
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleExportQR('svg')}
                        className="w-full px-4 py-2.5 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50 flex items-center gap-2.5"
                      >
                        <Download className="w-4 h-4 text-emerald-600" />
                        Unduh SVG (Vektor)
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
