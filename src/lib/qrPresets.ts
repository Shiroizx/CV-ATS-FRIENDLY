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

export interface VCardSocialPlatform {
  id: string;
  label: string;
  defaultUrl: string;
  defaultText: string;
  iconDataUrl: string;
  extra?: boolean;
}

function getPresetIconUrl(id: string): string {
  return QR_LOGO_PRESETS.find((p) => p.id === id)?.dataUrl || '';
}

export const VCARD_SOCIAL_PLATFORMS: readonly VCardSocialPlatform[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    defaultUrl: 'https://www.facebook.com/',
    defaultText: 'My Facebook',
    iconDataUrl: getPresetIconUrl('facebook'),
  },
  {
    id: 'instagram',
    label: 'Instagram',
    defaultUrl: 'https://www.instagram.com/',
    defaultText: 'My Instagram',
    iconDataUrl: getPresetIconUrl('instagram'),
  },
  {
    id: 'twitter',
    label: 'Twitter',
    defaultUrl: 'https://twitter.com/',
    defaultText: 'My Twitter',
    iconDataUrl: getPresetIconUrl('twitter'),
  },
  {
    id: 'x',
    label: 'X',
    defaultUrl: 'https://x.com/',
    defaultText: 'My X',
    iconDataUrl: getPresetIconUrl('x'),
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    defaultUrl: 'https://wa.me/',
    defaultText: 'Chat WhatsApp',
    iconDataUrl: getPresetIconUrl('whatsapp'),
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    defaultUrl: 'https://www.tiktok.com/@',
    defaultText: 'My TikTok',
    iconDataUrl: getPresetIconUrl('tiktok'),
  },
  {
    id: 'snapchat',
    label: 'Snapchat',
    defaultUrl: 'https://www.snapchat.com/add/',
    defaultText: 'My Snapchat',
    iconDataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#FFFC00"/><path fill="#fff" stroke="#18181B" stroke-width="2.5" d="M32 15c-6.8 0-11.2 4.6-11.2 11.4 0 2 .3 3.5.3 3.5s-2.4.7-2.6 2.1c-.1 1.1 1.6 1.8 2.8 2.2.3.1.4.4.3.7-.7 2.4-2.8 4.9-6.6 5.9-.8.2-1 1-.3 1.4 1.6 1 3.7 1.6 5.4 1.9.4.8.7 2.2 1.8 2.6 1.2.4 2.8-.6 4.7-.6s3.2 1.6 5.4 1.6 3.5-1.6 5.4-1.6 3.5 1 4.7.6c1.1-.4 1.4-1.8 1.8-2.6 1.7-.3 3.8-.9 5.4-1.9.7-.4.5-1.2-.3-1.4-3.8-1-5.9-3.5-6.6-5.9-.1-.3 0-.6.3-.7 1.2-.4 2.9-1.1 2.8-2.2-.2-1.4-2.6-2.1-2.6-2.1s.3-1.5.3-3.5C43.2 19.6 38.8 15 32 15z"/></svg>`
    ),
  },
  {
    id: 'youtube',
    label: 'YouTube',
    defaultUrl: 'https://www.youtube.com/@',
    defaultText: 'My YouTube',
    iconDataUrl: getPresetIconUrl('youtube'),
  },
  {
    id: 'telegram',
    label: 'Telegram',
    defaultUrl: 'https://t.me/',
    defaultText: 'My Telegram',
    iconDataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#26A5E4"/><path fill="#fff" d="M47.6 18.4L15.4 30.9c-2.2.9-2.2 2.1-.4 2.7l8.2 2.6 3.1 9.8c.4 1.1.2 1.5 1.4 1.5.9 0 1.3-.4 1.8-.9l4.4-4.3 9.1 6.7c1.7.9 2.9.4 3.3-1.6l5.9-27.9c.6-2.5-.9-3.6-2.6-2.9zm-4.5 5.4l-16.4 14.8-.6 6.7-2.8-8.8 19.8-12.7z"/></svg>`
    ),
  },
  {
    id: 'messenger',
    label: 'Messenger',
    defaultUrl: 'https://m.me/',
    defaultText: 'My Messenger',
    iconDataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0084FF"/><path fill="#fff" d="M32 15c-9.9 0-17.6 7.3-17.6 16.7 0 5.2 2.5 9.9 6.5 12.9v6l6.1-3.3c1.6.4 3.3.7 5 .7 9.9 0 17.6-7.3 17.6-16.7S41.9 15 32 15zm1.8 22.3l-4.5-4.8-8.7 4.8 9.6-10.2 4.6 4.8 8.6-4.8-9.6 10.2z"/></svg>`
    ),
  },
  {
    id: 'google',
    label: 'Google',
    defaultUrl: 'https://www.google.com/',
    defaultText: 'Profil Google',
    iconDataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#F97316"/><path fill="#fff" d="M32 29v7h9.8c-.4 2.5-2.9 7.3-9.8 7.3-5.9 0-10.7-4.9-10.7-11s4.8-11 10.7-11c3.4 0 5.6 1.4 6.9 2.7l4.7-4.6C40.6 16.7 36.7 15 32 15c-9.4 0-17 7.6-17 17s7.6 17 17 17c9.8 0 16.3-6.9 16.3-16.6 0-1.1-.1-2-.3-2.9H32z"/></svg>`
    ),
  },
  {
    id: 'pinterest',
    label: 'Pinterest',
    defaultUrl: 'https://www.pinterest.com/',
    defaultText: 'My Pinterest',
    iconDataUrl: getPresetIconUrl('pinterest'),
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    defaultUrl: 'https://www.linkedin.com/in/',
    defaultText: 'My LinkedIn',
    iconDataUrl: getPresetIconUrl('linkedin'),
  },
  {
    id: 'line',
    label: 'LINE',
    defaultUrl: 'https://line.me/ti/p/',
    defaultText: 'My LINE',
    iconDataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#06C755"/><path fill="#fff" d="M32 16c-9.9 0-18 6.4-18 14.3 0 7.1 6.3 13 14.8 14.1.6.1 1.4.4 1.6.9.2.5.1 1.2.1 1.7l-.3 1.5c-.1.4-.4 1.7 1.5.9 1.9-.8 10.1-5.9 13.8-10.2C48.5 36.1 50 33.4 50 30.3 50 22.4 41.9 16 32 16z"/></svg>`
    ),
  },
  {
    id: 'reddit',
    label: 'Reddit',
    defaultUrl: 'https://www.reddit.com/user/',
    defaultText: 'My Reddit',
    iconDataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#FF4500"/><circle cx="32" cy="35" r="14" fill="#fff"/><circle cx="26.5" cy="34" r="2.5" fill="#FF4500"/><circle cx="37.5" cy="34" r="2.5" fill="#FF4500"/><path d="M27 40c1.4 1.4 3.1 2 5 2s3.6-.6 5-2" fill="none" stroke="#FF4500" stroke-width="2.2" stroke-linecap="round"/><path d="M32 21l2.8-6.5 6.2 1.5" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/><circle cx="43" cy="17" r="2.5" fill="#fff"/></svg>`
    ),
  },
  {
    id: 'github',
    label: 'GitHub',
    defaultUrl: 'https://github.com/',
    defaultText: 'My GitHub',
    iconDataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0F766E"/><path fill="#fff" d="M32 14a18 18 0 00-5.7 35.1c.9.2 1.2-.4 1.2-.9v-3.2c-5 1.1-6-2.4-6-2.4-.8-2.1-2-2.6-2-2.6-1.6-1.1.1-1.1.1-1.1 1.8.1 2.8 1.9 2.8 1.9 1.6 2.8 4.2 2 5.2 1.5.2-1.2.6-2 1.1-2.4-4-.5-8.2-2-8.2-8.9 0-2 .7-3.6 1.9-4.9-.2-.5-.8-2.3.2-4.8 0 0 1.5-.5 5 1.9a17.2 17.2 0 019 0c3.5-2.4 5-1.9 5-1.9 1 2.5.4 4.3.2 4.8 1.2 1.3 1.9 2.9 1.9 4.9 0 6.9-4.2 8.4-8.2 8.9.6.5 1.2 1.6 1.2 3.3v4.9c0 .5.3 1.1 1.2.9A18 18 0 0032 14z"/></svg>`
    ),
  },
  {
    id: 'dribbble',
    label: 'Dribbble',
    defaultUrl: 'https://dribbble.com/',
    defaultText: 'My Dribbble',
    iconDataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#EA4C89"/><circle cx="32" cy="32" r="15" fill="none" stroke="#fff" stroke-width="3.2"/><path d="M20 24c8 1 15 8 19 21M18 35c10-.2 19-3.6 26-10M27 18c6 6 11 16 14 27" fill="none" stroke="#fff" stroke-width="2.5"/></svg>`
    ),
  },
  {
    id: 'tumblr',
    label: 'Tumblr',
    defaultUrl: 'https://www.tumblr.com/',
    defaultText: 'My Tumblr',
    iconDataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#35465C"/><path fill="#fff" d="M36 47c-5.6 0-8.6-3-8.6-8.3V28h-4v-5.2c4.4-1.4 6.5-5 6.9-8.8h5.1v8h6.4V28h-6.4v9.8c0 2.5 1.3 3.7 3.8 3.7h2.8V47H36z"/></svg>`
    ),
    extra: true,
  },
  {
    id: 'vk',
    label: 'VK',
    defaultUrl: 'https://vk.com/',
    defaultText: 'My VK',
    iconDataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0077FF"/><path fill="#fff" d="M33.6 43c-10.3 0-16.2-7-16.4-18.8h5.2c.2 8.6 4 12.2 7 13V24.2h4.9v7.4c3-.3 6.1-3.7 7.1-7.4h4.9c-.8 4.6-4.1 8-6.5 9.4 2.4 1.1 6.2 4.1 7.6 9.4H42c-1.1-3.6-3.9-6.3-7.7-6.7V43h-.7z"/></svg>`
    ),
    extra: true,
  },
  {
    id: 'gmail',
    label: 'Gmail',
    defaultUrl: 'mailto:',
    defaultText: 'Email Gmail',
    iconDataUrl: getPresetIconUrl('gmail'),
    extra: true,
  },
  {
    id: 'outlook',
    label: 'Outlook',
    defaultUrl: 'mailto:',
    defaultText: 'Email Outlook',
    iconDataUrl: getPresetIconUrl('outlook'),
    extra: true,
  },
  {
    id: 'apple',
    label: 'Apple',
    defaultUrl: 'https://apps.apple.com/',
    defaultText: 'App Store',
    iconDataUrl: getPresetIconUrl('apple'),
    extra: true,
  },
  {
    id: 'netflix',
    label: 'Portfolio Video',
    defaultUrl: 'https://www.youtube.com/',
    defaultText: 'Tonton Karya',
    iconDataUrl: getPresetIconUrl('netflix'),
    extra: true,
  },
  {
    id: 'discord',
    label: 'Discord',
    defaultUrl: 'https://discord.gg/',
    defaultText: 'Komunitas Discord',
    iconDataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#5865F2"/><path fill="#fff" d="M44 21.5a26 26 0 00-6.5-2l-.8 1.6a23 23 0 00-9.4 0l-.8-1.6a26 26 0 00-6.5 2C15.9 27.7 14.8 33.8 15.3 39.8a26.3 26.3 0 008 4l1.7-2.8a16.8 16.8 0 01-2.6-1.3l.6-.5c5 2.3 10.6 2.3 15.6 0l.6.5a16.8 16.8 0 01-2.6 1.3l1.7 2.8a26.3 26.3 0 008-4c.6-6.9-1-13-4.3-18.3zM26.5 35.8c-1.5 0-2.7-1.4-2.7-3.1s1.2-3.1 2.7-3.1 2.8 1.4 2.7 3.1c0 1.7-1.2 3.1-2.7 3.1zm11 0c-1.5 0-2.7-1.4-2.7-3.1s1.2-3.1 2.7-3.1 2.8 1.4 2.7 3.1c0 1.7-1.2 3.1-2.7 3.1z"/></svg>`
    ),
    extra: true,
  },
  {
    id: 'threads',
    label: 'Threads',
    defaultUrl: 'https://www.threads.net/@',
    defaultText: 'My Threads',
    iconDataUrl: toSvgDataUrl(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#18181B"/><path fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" d="M41.5 28.5c-1.5-5.5-5.5-8.5-10.5-8.5-6.6 0-11.5 5.2-11.5 12s4.9 12 11.5 12c5.4 0 9.6-3.1 10.8-8.1.5-2-.4-4.2-2.4-5-2.1-.8-4.7.2-5.4 2.4-.5 1.7-1.9 2.7-3.5 2.7-2.2 0-3.8-1.8-3.8-4s1.6-4 3.8-4c2.8 0 4.5 1.8 4.8 4.4.4 3.6 3.5 5.5 6.8 4.6 3.1-.8 4.9-4.1 4.4-8.1"/></svg>`
    ),
    extra: true,
  },
] as const;

export function getSocialPlatformMeta(platformId: string): VCardSocialPlatform {
  return (
    VCARD_SOCIAL_PLATFORMS.find((p) => p.id === platformId) ?? VCARD_SOCIAL_PLATFORMS[0]
  );
}
