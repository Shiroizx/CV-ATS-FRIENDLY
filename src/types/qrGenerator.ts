export type QRType =
  | 'url'
  | 'vcard'
  | 'pdf'
  | 'image'
  | 'social'
  | 'video'
  | 'business'
  | 'menu';

export type QRTypeIconName =
  | 'Link2'
  | 'Contact'
  | 'FileText'
  | 'Image'
  | 'Share2'
  | 'Video'
  | 'Store'
  | 'UtensilsCrossed';

export interface QRTypeConfig {
  id: QRType;
  label: string;
  description: string;
  icon: QRTypeIconName;
  popular?: boolean;
  available: boolean;
}

export const QR_TYPES: readonly QRTypeConfig[] = [
  {
    id: 'url',
    label: 'URL Situs Web',
    description: 'Tautan ke situs web pilihan',
    icon: 'Link2',
    popular: true,
    available: true,
  },
  {
    id: 'vcard',
    label: 'vCard',
    description: 'Bagikan kartu nama elektronik',
    icon: 'Contact',
    available: true,
  },
  {
    id: 'pdf',
    label: 'PDF',
    description: 'Tampilkan PDF',
    icon: 'FileText',
    available: false,
  },
  {
    id: 'image',
    label: 'Gambar',
    description: 'Tampilkan galeri gambar',
    icon: 'Image',
    available: false,
  },
  {
    id: 'social',
    label: 'Media Sosial',
    description: 'Bagikan saluran media sosial Anda',
    icon: 'Share2',
    available: false,
  },
  {
    id: 'video',
    label: 'Video',
    description: 'Bagikan satu atau beberapa video',
    icon: 'Video',
    available: false,
  },
  {
    id: 'business',
    label: 'Halaman Bisnis',
    description: 'Bagikan informasi bisnis Anda',
    icon: 'Store',
    available: true,
  },
  {
    id: 'menu',
    label: 'Menu',
    description: 'Buat menu restoran digital',
    icon: 'UtensilsCrossed',
    available: false,
  },
] as const;

export interface UrlContent {
  type: 'url';
  url: string;
  qrName: string;
}

export type VCardPhoneLabel = 'Cara Kerja' | 'Ponsel' | 'Rumah' | 'Faks' | 'Lainnya';
export type VCardEmailLabel = 'Kerja' | 'Pribadi' | 'Lainnya';

export interface VCardPhoneItem {
  id: string;
  label: VCardPhoneLabel;
  number: string;
}

export interface VCardEmailItem {
  id: string;
  label: VCardEmailLabel;
  email: string;
}

export interface VCardSocialItem {
  id: string;
  platform: string;
  url: string;
  label: string;
}

export type VCardAccordionSectionKey = 'contact' | 'company' | 'summary' | 'social';
export type VCardDefaultOpenMode = 'none' | VCardAccordionSectionKey;

export type VCardBannerWaveShape =
  | 'smooth'
  | 'organic'
  | 'layered'
  | 'arch'
  | 'sharp';

export interface VCardBannerWaveConfig {
  enabled: boolean;
  shape: VCardBannerWaveShape;
  complexity: number;
  height: number;
  seed: number;
  flipX: boolean;
}

export const DEFAULT_VCARD_BANNER_WAVE: VCardBannerWaveConfig = {
  enabled: false,
  shape: 'smooth',
  complexity: 3,
  height: 48,
  seed: 101,
  flipX: false,
};

export type VCardDesignStyle = 'default' | 'brutalism';

export interface VCardBrutalismPalette {
  primary: string;
  secondary: string;
  surface: string;
  text: string;
}

export interface VCardBrutalismScheme {
  id: string;
  label: string;
  palette: VCardBrutalismPalette;
}

export interface VCardContent {
  type: 'vcard';
  qrName: string;
  designStyle?: VCardDesignStyle;
  brutalismPalette?: VCardBrutalismPalette;
  primaryColor: string;
  secondaryColor: string;
  bannerDataUrl: string | null;
  bannerFileName: string;
  bannerWave?: VCardBannerWaveConfig;
  fullName: string;
  avatarDataUrl: string | null;
  avatarFileName: string;
  phones: VCardPhoneItem[];
  website: string;
  emails: VCardEmailItem[];
  company: string;
  profession: string;
  summary: string;
  addressMode: 'manual' | 'url';
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  addressUrl: string;
  socials: VCardSocialItem[];
  availabilityStatus?: string;
  workingHours?: string;
  skills?: string[];
  showShareButton?: boolean;
  defaultOpenSection?: VCardDefaultOpenMode;
  splashDataUrl: string | null;
  splashFileName: string;
}

export type BusinessScheduleMode = '24h' | 'ampm' | 'open24';

export type BusinessDayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const BUSINESS_DAYS: readonly { key: BusinessDayKey; label: string }[] = [
  { key: 'mon', label: 'Senin' },
  { key: 'tue', label: 'Selasa' },
  { key: 'wed', label: 'Rabu' },
  { key: 'thu', label: 'Kamis' },
  { key: 'fri', label: 'Jumat' },
  { key: 'sat', label: 'Sabtu' },
  { key: 'sun', label: 'Minggu' },
] as const;

export interface BusinessTimeInterval {
  id: string;
  start: string;
  end: string;
}

export interface BusinessDaySchedule {
  enabled: boolean;
  intervals: BusinessTimeInterval[];
}

export type BusinessFacilityId =
  | 'wifi'
  | 'train'
  | 'seating'
  | 'taxi'
  | 'accessible'
  | 'accommodation'
  | 'toilet'
  | 'cafe'
  | 'kid_friendly'
  | 'bar'
  | 'pet_friendly'
  | 'restaurant'
  | 'parking';

export const BUSINESS_FACILITIES: readonly {
  id: BusinessFacilityId;
  label: string;
}[] = [
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'train', label: 'Kereta Api' },
  { id: 'seating', label: 'Kursi' },
  { id: 'taxi', label: 'Taksi' },
  { id: 'accessible', label: 'Dapat diakses' },
  { id: 'accommodation', label: 'Akomodasi' },
  { id: 'toilet', label: 'Toilet' },
  { id: 'cafe', label: 'Kafe' },
  { id: 'kid_friendly', label: 'Ramah anak' },
  { id: 'bar', label: 'Bar' },
  { id: 'pet_friendly', label: 'Ramah hewan peliharaan' },
  { id: 'restaurant', label: 'Restoran' },
  { id: 'parking', label: 'Parkir' },
] as const;

export interface BusinessButtonItem {
  id: string;
  label: string;
  url: string;
}

export interface BusinessContent {
  type: 'business';
  qrName: string;
  designStyle?: VCardDesignStyle;
  brutalismPalette?: VCardBrutalismPalette;
  primaryColor: string;
  secondaryColor: string;
  coverDataUrl: string | null;
  coverFileName: string;
  companyName: string;
  headline: string;
  subtitle: string;
  buttons: BusinessButtonItem[];
  scheduleMode: BusinessScheduleMode;
  useWeekdayGroup: boolean;
  weekdayGroupIntervals: BusinessTimeInterval[];
  days: Record<BusinessDayKey, BusinessDaySchedule>;
  contactName: string;
  phones: VCardPhoneItem[];
  website: string;
  emails: VCardEmailItem[];
  addressMode: 'manual' | 'url';
  street: string;
  postalCode: string;
  city: string;
  state: string;
  country: string;
  addressUrl: string;
  facilities: BusinessFacilityId[];
  summary: string;
  socials: VCardSocialItem[];
  splashDataUrl: string | null;
  splashFileName: string;
}

export type QRContentData = UrlContent | VCardContent | BusinessContent;

export const BUSINESS_COLOR_SCHEMES: readonly VCardColorScheme[] = [
  { id: 'silver-charcoal', primary: '#ECEDF1', secondary: '#232321', label: 'Abu Lembut & Hitam' },
  { id: 'blue-charcoal', primary: '#D8EAF9', secondary: '#1E3A8A', label: 'Biru Lembut & Navy' },
  { id: 'cream-espresso', primary: '#F5EFE6', secondary: '#3E2723', label: 'Krem & Espresso' },
  { id: 'mint-forest', primary: '#E2F3EA', secondary: '#14532D', label: 'Mint & Hijau Hutan' },
  { id: 'lavender-plum', primary: '#EDE7F6', secondary: '#4C1D95', label: 'Lavender & Ungu' },
  { id: 'rose-burgundy', primary: '#FCE7F3', secondary: '#831843', label: 'Mawar & Marun' },
  { id: 'amber-slate', primary: '#FEF3C7', secondary: '#1F2937', label: 'Amber & Slate' },
] as const;

export interface VCardColorScheme {
  id: string;
  primary: string;
  secondary: string;
  label: string;
}

export const VCARD_COLOR_SCHEMES: readonly VCardColorScheme[] = [
  { id: 'blue-white', primary: '#6594FF', secondary: '#FFFFFF', label: 'Biru & Putih' },
  { id: 'slate-dark', primary: '#E8EBF2', secondary: '#111827', label: 'Abu & Hitam' },
  { id: 'slate-blue', primary: '#E8EBF2', secondary: '#5F8FFF', label: 'Abu & Biru' },
  { id: 'sky-blue', primary: '#D8EAF9', secondary: '#5F8FFF', label: 'Biru Langit' },
  { id: 'lavender-white', primary: '#B39DDB', secondary: '#FFFFFF', label: 'Ungu & Putih' },
  { id: 'mint-dark', primary: '#6BD09D', secondary: '#18181B', label: 'Mint & Hitam' },
  { id: 'gold-white', primary: '#F9C963', secondary: '#FFFFFF', label: 'Kuning & Putih' },
] as const;

export const DEFAULT_VCARD_BRUTALISM_PALETTE: VCardBrutalismPalette = {
  primary: '#FDC800',
  secondary: '#432DD7',
  surface: '#FBFBF9',
  text: '#1C293C',
};

export const VCARD_BRUTALISM_SCHEMES: readonly VCardBrutalismScheme[] = [
  {
    id: 'brutal-yellow',
    label: 'Kuning Brutal & Indigo',
    palette: DEFAULT_VCARD_BRUTALISM_PALETTE,
  },
  {
    id: 'concrete-coral',
    label: 'Beton Terakota & Emas',
    palette: {
      primary: '#DD614C',
      secondary: '#DAA144',
      surface: '#FFFFFF',
      text: '#111827',
    },
  },
  {
    id: 'mint-punch',
    label: 'Mint Elektrik & Pink',
    palette: {
      primary: '#4ADE80',
      secondary: '#FF5A8A',
      surface: '#FAF9F5',
      text: '#111827',
    },
  },
  {
    id: 'acid-noir',
    label: 'Lime Neon & Gelap',
    palette: {
      primary: '#D9F99D',
      secondary: '#0F172A',
      surface: '#FFFFFF',
      text: '#09090B',
    },
  },
  {
    id: 'cyber-kobalt',
    label: 'Biru Kobalt & Kuning',
    palette: {
      primary: '#3B82F6',
      secondary: '#FACC15',
      surface: '#F4F4F0',
      text: '#111827',
    },
  },
  {
    id: 'monochrome-zine',
    label: 'Zine Monokrom Tegas',
    palette: {
      primary: '#E5E7EB',
      secondary: '#111827',
      surface: '#FFFFFF',
      text: '#09090B',
    },
  },
] as const;

export type QRDotType =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'extra-rounded'
  | 'classy'
  | 'classy-rounded';

export type QRCornerSquareType = '' | 'dot' | 'square' | 'extra-rounded';
export type QRCornerDotType = '' | 'dot' | 'square';

export type QRFrameType =
  | 'none'
  | 'thin-bottom'
  | 'bold-bottom'
  | 'pill-bottom'
  | 'badge-top'
  | 'speech-bottom'
  | 'ticket'
  | 'ribbon'
  | 'bag'
  | 'envelope'
  | 'laptop'
  | 'clipboard';

export type QRDomainMode = 'default' | 'suggested' | 'custom';

export interface QRAllowedDomainOption {
  domain: string;
  orgSlug: string;
  orgName: string;
  waiveCredit: boolean;
  authSource: 'default' | 'partner_token' | 'email_domain';
}

export interface QRPartnerContext {
  token: string;
  domain: string;
  orgSlug: string;
  orgName: string;
  waiveCredit: boolean;
  externalUserId?: string;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  userPosition?: string;
  userCompany?: string;
  userWebsite?: string;
  suggestedSlug?: string;
  returnUrl?: string;
  callbackState?: string;
  dashboardUrl?: string;
  switchAccountUrl?: string;
  editQrId?: string;
  createNew?: boolean;
}

export interface QRStyleOptions {
  frameType: QRFrameType;
  frameText: string;
  frameColor: string;
  frameBgColor: string;
  frameBgTransparent: boolean;
  frameTextColor: string;
  dotStyle: QRDotType;
  dotColor: string;
  bgColor: string;
  bgTransparent: boolean;
  useGradient: boolean;
  gradientSecondaryColor: string;
  gradientType: 'linear' | 'radial';
  gradientRotationDeg: number;
  cornerSquareStyle: QRCornerSquareType;
  cornerDotStyle: QRCornerDotType;
  cornerSquareColor: string;
  cornerDotColor: string;
  logoDataUrl: string | null;
  logoPresetId: string | null;
  logoSize: number;
  logoMargin: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  domainMode?: QRDomainMode;
  publicDomain?: string;
  paidCustomDomainSlug?: string | null;
}

export interface QRPasswordOptions {
  enabled: boolean;
  password: string;
  alreadyProtected?: boolean;
}

export interface SavedQRCode {
  id: string;
  short_code: string;
  public_domain?: string;
  org_slug?: string | null;
  external_owner_ref?: string | null;
  user_id: string;
  qr_type: QRType;
  title: string;
  content_data: QRContentData;
  style_options: QRStyleOptions;
  requires_password: boolean;
  scan_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WizardStep = 1 | 2 | 3;

export const DEFAULT_QR_STYLE: QRStyleOptions = {
  frameType: 'pill-bottom',
  frameText: 'Pindai saya!',
  frameColor: '#000000',
  frameBgColor: '#FFFFFF',
  frameBgTransparent: false,
  frameTextColor: '#FFFFFF',
  dotStyle: 'square',
  dotColor: '#000000',
  bgColor: '#FFFFFF',
  bgTransparent: false,
  useGradient: false,
  gradientSecondaryColor: '#2563EB',
  gradientType: 'linear',
  gradientRotationDeg: 45,
  cornerSquareStyle: '',
  cornerDotStyle: '',
  cornerSquareColor: '#000000',
  cornerDotColor: '#000000',
  logoDataUrl: null,
  logoPresetId: null,
  logoSize: 0.34,
  logoMargin: 6,
  errorCorrection: 'M',
  domainMode: 'default',
  publicDomain: 'freebuildcv.tech',
  paidCustomDomainSlug: null,
};

export const INITIAL_URL_CONTENT: UrlContent = {
  type: 'url',
  url: '',
  qrName: '',
};

export const INITIAL_VCARD_CONTENT: VCardContent = {
  type: 'vcard',
  qrName: '',
  designStyle: 'default',
  brutalismPalette: DEFAULT_VCARD_BRUTALISM_PALETTE,
  primaryColor: '#6594FF',
  secondaryColor: '#FFFFFF',
  bannerDataUrl: null,
  bannerFileName: '',
  bannerWave: DEFAULT_VCARD_BANNER_WAVE,
  fullName: '',
  avatarDataUrl: null,
  avatarFileName: '',
  phones: [{ id: 'phone-1', label: 'Cara Kerja', number: '' }],
  website: '',
  emails: [{ id: 'email-1', label: 'Lainnya', email: '' }],
  company: '',
  profession: '',
  summary: '',
  addressMode: 'manual',
  street: '',
  postalCode: '',
  city: '',
  state: '',
  country: '',
  addressUrl: '',
  socials: [],
  availabilityStatus: '',
  workingHours: '',
  skills: [],
  showShareButton: true,
  defaultOpenSection: 'none',
  splashDataUrl: null,
  splashFileName: '',
};

export const INITIAL_BUSINESS_CONTENT: BusinessContent = {
  type: 'business',
  qrName: '',
  designStyle: 'default',
  brutalismPalette: DEFAULT_VCARD_BRUTALISM_PALETTE,
  primaryColor: '#ECEDF1',
  secondaryColor: '#232321',
  coverDataUrl: null,
  coverFileName: '',
  companyName: '',
  headline: '',
  subtitle: '',
  buttons: [{ id: 'btn-1', label: '', url: '' }],
  scheduleMode: '24h',
  useWeekdayGroup: false,
  weekdayGroupIntervals: [{ id: 'wd-1', start: '09:00', end: '17:00' }],
  days: {
    mon: { enabled: true, intervals: [{ id: 'mon-1', start: '09:00', end: '17:00' }] },
    tue: { enabled: true, intervals: [{ id: 'tue-1', start: '09:00', end: '17:00' }] },
    wed: { enabled: true, intervals: [{ id: 'wed-1', start: '09:00', end: '17:00' }] },
    thu: { enabled: true, intervals: [{ id: 'thu-1', start: '09:00', end: '17:00' }] },
    fri: { enabled: true, intervals: [{ id: 'fri-1', start: '09:00', end: '17:00' }] },
    sat: { enabled: false, intervals: [{ id: 'sat-1', start: '09:00', end: '15:00' }] },
    sun: { enabled: false, intervals: [{ id: 'sun-1', start: '09:00', end: '15:00' }] },
  },
  contactName: '',
  phones: [{ id: 'b-phone-1', label: 'Cara Kerja', number: '' }],
  website: '',
  emails: [{ id: 'b-email-1', label: 'Kerja', email: '' }],
  addressMode: 'manual',
  street: '',
  postalCode: '',
  city: '',
  state: '',
  country: '',
  addressUrl: '',
  facilities: [],
  summary: '',
  socials: [],
  splashDataUrl: null,
  splashFileName: '',
};
