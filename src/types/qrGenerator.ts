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
    available: false,
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

export interface VCardContent {
  type: 'vcard';
  qrName: string;
  primaryColor: string;
  secondaryColor: string;
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
  splashDataUrl: string | null;
  splashFileName: string;
}

export type QRContentData = UrlContent | VCardContent;

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
}

export interface QRPasswordOptions {
  enabled: boolean;
  password: string;
  alreadyProtected?: boolean;
}

export interface SavedQRCode {
  id: string;
  short_code: string;
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
};

export const INITIAL_URL_CONTENT: UrlContent = {
  type: 'url',
  url: '',
  qrName: '',
};

export const INITIAL_VCARD_CONTENT: VCardContent = {
  type: 'vcard',
  qrName: '',
  primaryColor: '#6594FF',
  secondaryColor: '#FFFFFF',
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
  splashDataUrl: null,
  splashFileName: '',
};
