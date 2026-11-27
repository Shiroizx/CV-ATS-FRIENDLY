function toSvgDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface QRLogoPreset {
  id: string;
  label: string;
  dataUrl: string;
}

/**
 * 13 ikon preset berwarna bersih sebagai SVG data-URI inline (tanpa dependensi eksternal / bebas CORS).
 */
export const QR_LOGO_PRESETS: readonly QRLogoPreset[] = [
  {
    id: 'twitter',
    label: 'Twitter',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#1DA1F2"/><path fill="#fff" d="M48 22.3c-1.2.5-2.5.9-3.8 1 1.4-.8 2.4-2.1 2.9-3.6-1.3.8-2.7 1.3-4.2 1.6-1.2-1.3-2.9-2.1-4.8-2.1-3.6 0-6.6 2.9-6.6 6.6 0 .5.1 1 .2 1.5-5.5-.3-10.3-2.9-13.6-6.9-.6 1-.9 2.1-.9 3.3 0 2.3 1.2 4.3 2.9 5.5-1.1 0-2.1-.3-3-.8v.1c0 3.2 2.3 5.8 5.3 6.4-.6.2-1.1.2-1.7.2-.4 0-.8 0-1.2-.1.8 2.6 3.3 4.5 6.1 4.6-2.2 1.8-5.1 2.8-8.2 2.8-.5 0-1.1 0-1.6-.1 2.9 1.9 6.4 3 10.1 3 12.1 0 18.7-10 18.7-18.7v-.9c1.3-.9 2.4-2.1 3.3-3.4z"/></svg>`
    ),
  },
  {
    id: 'x',
    label: 'X',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#09090B"/><path fill="#fff" d="M36.3 29.3L49.4 14h-3.1L34.9 27.3 25.8 14H15.3l13.7 20-13.7 16h3.1l12-14 9.6 14h10.5L36.3 29.3zm-4.3 5l-1.4-2-11.1-15.9h4.8l8.9 12.8 1.4 2 11.6 16.6h-4.8L32 34.3z"/></svg>`
    ),
  },
  {
    id: 'youtube',
    label: 'YouTube',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#FF0000"/><rect x="12" y="19" width="40" height="26" rx="7" fill="#fff"/><polygon points="28,25 28,39 40,32" fill="#FF0000"/></svg>`
    ),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stop-color="#F58529"/><stop offset="50%" stop-color="#DD2A7B"/><stop offset="100%" stop-color="#8134AF"/></linearGradient></defs><rect width="64" height="64" rx="16" fill="url(#ig)"/><rect x="16" y="16" width="32" height="32" rx="9" fill="none" stroke="#fff" stroke-width="4"/><circle cx="32" cy="32" r="7.5" fill="none" stroke="#fff" stroke-width="4"/><circle cx="42" cy="22" r="2.2" fill="#fff"/></svg>`
    ),
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#111827"/><path fill="#25F4EE" d="M35 16v21a6 6 0 11-6-6v-5a11 11 0 1011 11V25c2.6 1.8 5.6 2.8 8.8 2.8v-5c-3.9 0-7.4-2.5-8.6-6.8H35z"/><path fill="#FE2C55" d="M37 16v21a6 6 0 11-6-6v-5a11 11 0 1011 11V25c2.6 1.8 5.6 2.8 8.8 2.8v-5c-3.9 0-7.4-2.5-8.6-6.8H37z" opacity="0.85"/><path fill="#fff" d="M36 16v21a6 6 0 11-6-6v-5a11 11 0 1011 11V25c2.6 1.8 5.6 2.8 8.8 2.8v-5c-3.9 0-7.4-2.5-8.6-6.8H36z"/></svg>`
    ),
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0A66C2"/><circle cx="21" cy="21" r="3.5" fill="#fff"/><rect x="18" y="27" width="6" height="19" rx="1.5" fill="#fff"/><path fill="#fff" d="M29 27h5.8v2.6h.1c.8-1.5 2.8-3.1 5.8-3.1 6.2 0 7.3 4.1 7.3 9.4V46h-6v-8.8c0-2.1 0-4.8-2.9-4.8s-3.4 2.3-3.4 4.6V46h-6V27z"/></svg>`
    ),
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#E60023"/><path fill="#fff" d="M32 14c-9.9 0-18 8.1-18 18 0 7.6 4.7 14.1 11.4 16.7-.2-1.4-.3-3.6.1-5.1.3-1.4 2-8.7 2-8.7s-.5-1-.5-2.5c0-2.4 1.4-4.2 3.1-4.2 1.5 0 2.2 1.1 2.2 2.4 0 1.5-.9 3.7-1.4 5.7-.4 1.7.9 3.1 2.6 3.1 3.1 0 5.5-3.3 5.5-8 0-4.2-3-7.1-7.3-7.1-5 0-7.9 3.7-7.9 7.6 0 1.5.6 3.1 1.3 4 .1.2.2.3.1.5-.1.5-.4 1.7-.5 1.9-.1.3-.3.4-.6.2-2.2-1-3.6-4.3-3.6-6.9 0-5.6 4.1-10.8 11.8-10.8 6.2 0 11 4.4 11 10.3 0 6.1-3.9 11.1-9.3 11.1-1.8 0-3.5-.9-4.1-2l-1.1 4.3c-.4 1.6-1.5 3.6-2.2 4.8 1.7.5 3.4.8 5.2.8 9.9 0 18-8.1 18-18s-8.1-18-18-18z"/></svg>`
    ),
  },
  {
    id: 'outlook',
    label: 'Outlook',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0078D4"/><rect x="14" y="18" width="36" height="28" rx="4" fill="#fff"/><path d="M14 21l18 13 18-13" fill="none" stroke="#0078D4" stroke-width="3.5"/></svg>`
    ),
  },
  {
    id: 'apple',
    label: 'Apple',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#18181B"/><path fill="#fff" d="M39.8 33.4c0-4.3 3.5-6.4 3.7-6.5-2-2.9-5.1-3.3-6.2-3.4-2.6-.3-5.2 1.6-6.5 1.6-1.4 0-3.5-1.5-5.7-1.5-2.9 0-5.6 1.7-7.1 4.3-3.1 5.3-.8 13.1 2.2 17.4 1.5 2.1 3.2 4.5 5.5 4.4 2.2-.1 3-1.4 5.7-1.4s3.4 1.4 5.7 1.4c2.4 0 3.9-2.1 5.3-4.2 1.7-2.5 2.4-4.9 2.4-5-.1-.1-4.9-1.9-5-7.1zM35.5 20.8c1.2-1.5 2-3.5 1.8-5.5-1.7.1-3.8 1.2-5 2.6-1.1 1.3-2.1 3.3-1.8 5.3 1.9.1 3.8-1 5-2.4z"/></svg>`
    ),
  },
  {
    id: 'gmail',
    label: 'Gmail',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#F4F4F5"/><path fill="#EA4335" d="M16 24v22h7V31l9 7 9-7v15h7V24l-16 12z"/><path fill="#4285F4" d="M16 24v22h7V29l-7-5z"/><path fill="#34A853" d="M41 29v17h7V24l-7 5z"/><path fill="#FBBC05" d="M16 24l7 5v-7l-4-3c-1.7-1.3-3-.1-3 2z"/></svg>`
    ),
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#25D366"/><path fill="#fff" d="M32 14c-9.9 0-18 7.8-18 17.5 0 3.3.9 6.5 2.7 9.2L14 50l9.6-2.5c2.6 1.4 5.5 2.1 8.4 2.1 9.9 0 18-7.8 18-17.5S41.9 14 32 14zm9.9 24.4c-.4 1.2-2.4 2.2-3.3 2.3-.9.1-2 .2-3.2-.2-.8-.3-1.8-.6-3-1.2-5.3-2.3-8.8-7.7-9.1-8.1-.3-.4-2.2-2.9-2.2-5.5s1.4-3.9 1.9-4.5c.5-.5 1.1-.7 1.5-.7h1c.3 0 .8-.1 1.2.9.4 1.1 1.5 3.6 1.6 3.9.1.3.2.6 0 1-.2.4-.3.6-.6 1-.3.3-.6.8-.9 1-.3.3-.6.6-.2 1.2.3.6 1.5 2.5 3.3 4 2.3 2 4.2 2.6 4.8 2.9.6.3 1 .2 1.3-.1.4-.4 1.5-1.7 1.9-2.3.4-.6.8-.5 1.3-.3.5.2 3.4 1.6 4 1.9.6.3.9.4 1.1.7.1.3.1 1.6-.3 2.8z"/></svg>`
    ),
  },
  {
    id: 'facebook',
    label: 'Facebook',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#1877F2"/><path fill="#fff" d="M36 48V34h4.7l.7-5.5H36V25c0-1.6.4-2.7 2.7-2.7h2.9v-4.9c-.5-.1-2.2-.2-4.2-.2-4.2 0-7 2.5-7 7.2v4.1H26v5.5h4.4V48H36z"/></svg>`
    ),
  },
  {
    id: 'netflix',
    label: 'Netflix',
    dataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#141414"/><path fill="#B20710" d="M21 15h7v34h-7z"/><path fill="#B20710" d="M36 15h7v34h-7z"/><path fill="#E50914" d="M21 15l15 34h7L28 15z"/></svg>`
    ),
  },
] as const;

export const QUICK_COLOR_SWATCHES: readonly string[] = [
  '#000000',
  '#18181B',
  '#2563EB',
  '#059669',
  '#DC2626',
  '#7C3AED',
  '#EA580C',
] as const;
