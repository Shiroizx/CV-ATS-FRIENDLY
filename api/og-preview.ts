import { createSupabaseAdmin } from './_partnerAuth.js';

const ROOT_DOMAINS = ['narainstitute.net', 'freebuildcv.tech'];
const RESERVED_HOSTS = new Set(['www', 'api', 'app', 'admin', 'mail', 'cpanel']);

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseSubdomainTarget(host: string): { slug: string; domain: string } | null {
  const cleanHost = host.trim().toLowerCase().replace(/:\d+$/, '');
  for (const root of ROOT_DOMAINS) {
    const suffix = `.${root}`;
    if (cleanHost.endsWith(suffix)) {
      const sub = cleanHost.slice(0, -suffix.length);
      if (sub && !sub.includes('.') && !RESERVED_HOSTS.has(sub)) {
        return { slug: sub, domain: root };
      }
    }
  }
  return null;
}

function buildHtml(meta: {
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  siteName: string;
  type: string;
}): string {
  const t = escapeHtml(meta.title);
  const d = escapeHtml(meta.description);
  const u = escapeHtml(meta.url);
  const s = escapeHtml(meta.siteName);
  const imgTag = meta.imageUrl
    ? `
  <meta property="og:image" content="${escapeHtml(meta.imageUrl)}" />
  <meta property="og:image:width" content="600" />
  <meta property="og:image:height" content="600" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:image" content="${escapeHtml(meta.imageUrl)}" />`
    : `
  <meta name="twitter:card" content="summary" />`;

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>${t}</title>
  <meta name="description" content="${d}" />
  <meta property="og:type" content="${escapeHtml(meta.type)}" />
  <meta property="og:site_name" content="${s}" />
  <meta property="og:title" content="${t}" />
  <meta property="og:description" content="${d}" />
  <meta property="og:url" content="${u}" />${imgTag}
  <meta name="twitter:title" content="${t}" />
  <meta name="twitter:description" content="${d}" />
  <link rel="canonical" href="${u}" />
</head>
<body>
  <h1>${t}</h1>
  <p>${d}</p>
</body>
</html>`;
}

export async function GET(request: Request): Promise<Response> {
  const reqUrl = new URL(request.url);
  const rawHost =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    reqUrl.host;

  const querySlug = (reqUrl.searchParams.get('slug') || '').trim().toLowerCase();
  const hostTarget = parseSubdomainTarget(rawHost);

  const slug = hostTarget?.slug || querySlug;
  const domain = hostTarget?.domain || 'freebuildcv.tech';

  // Jika bukan subdomain QR / /q/:slug (mis. www.freebuildcv.tech), tampilkan OG default FreeBuild CV
  if (!slug) {
    const html = buildHtml({
      title: 'FreeBuild CV - Buat CV ATS-Friendly Gratis',
      description:
        'CV Builder gratis dengan template ATS-friendly. Buat CV profesional dalam hitungan menit, tanpa perlu registrasi. Download langsung dalam PDF!',
      url: 'https://www.freebuildcv.tech',
      imageUrl: 'https://www.freebuildcv.tech/og-image.png',
      siteName: 'FreeBuild CV',
      type: 'website',
    });
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    });
  }

  const canonicalUrl = hostTarget
    ? `https://${slug}.${domain}`
    : `https://www.freebuildcv.tech/q/${encodeURIComponent(slug)}`;

  const supabaseAdmin = createSupabaseAdmin();
  if (!supabaseAdmin) {
    const fallbackHtml = buildHtml({
      title: `${slug} — Kartu Nama Digital`,
      description: `Buka kartu nama digital resmi di ${canonicalUrl}`,
      url: canonicalUrl,
      siteName: domain === 'narainstitute.net' ? 'Nara Institute' : 'FreeBuild CV',
      type: 'profile',
    });
    return new Response(fallbackHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const query = supabaseAdmin
    .from('qr_codes')
    .select('id, title, qr_type, short_code, public_domain, content_data, is_active, updated_at')
    .ilike('short_code', slug)
    .eq('is_active', true);

  if (hostTarget) {
    query.ilike('public_domain', domain);
  }

  const { data: row } = await query.limit(1).maybeSingle();

  if (!row) {
    const notFoundHtml = buildHtml({
      title: 'Kartu Nama Digital Tidak Ditemukan',
      description: `Tautan ${canonicalUrl} tidak aktif atau sudah dihapus.`,
      url: canonicalUrl,
      siteName: domain === 'narainstitute.net' ? 'Nara Institute' : 'FreeBuild CV',
      type: 'website',
    });
    return new Response(notFoundHtml, {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const content = (row.content_data || {}) as Record<string, unknown>;
  const qrDomain = (row.public_domain || domain).toLowerCase();
  const siteName =
    qrDomain === 'narainstitute.net'
      ? (typeof content.company === 'string' && content.company.trim()) || 'Nara Institute'
      : 'FreeBuild CV';

  let ogTitle = row.title || slug;
  let ogDescription = `Buka profil digital di ${canonicalUrl}`;
  let ogType = 'website';

  if (row.qr_type === 'vcard') {
    ogType = 'profile';
    const fullName = (typeof content.fullName === 'string' ? content.fullName.trim() : '') || row.title || slug;
    const jobTitle = typeof content.title === 'string' ? content.title.trim() : '';
    const company = typeof content.company === 'string' ? content.company.trim() : '';
    const bio = typeof content.bio === 'string' ? content.bio.trim() : '';

    const roleParts = [jobTitle, company].filter(Boolean).join(' | ');
    ogTitle = roleParts ? `${fullName} — ${roleParts}` : fullName;
    ogDescription =
      bio ||
      `Kartu Nama Digital resmi ${fullName}${roleParts ? ` (${roleParts})` : ''}. Klik untuk melihat kontak, WhatsApp, email, dan simpan kontak langsung.`;
  } else if (row.qr_type === 'business') {
    const companyName =
      (typeof content.companyName === 'string' ? content.companyName.trim() : '') || row.title || slug;
    const tagline = typeof content.tagline === 'string' ? content.tagline.trim() : '';
    const address = typeof content.address === 'string' ? content.address.trim() : '';
    ogTitle = tagline ? `${companyName} — ${tagline}` : companyName;
    ogDescription =
      tagline ||
      address ||
      `Profil bisnis resmi ${companyName}. Lihat jam operasional, kontak, dan lokasi.`;
  }

  const hasPhoto = Boolean(
    (typeof content.avatarDataUrl === 'string' && content.avatarDataUrl.length > 0) ||
      (typeof content.bannerDataUrl === 'string' && content.bannerDataUrl.length > 0) ||
      (typeof content.splashDataUrl === 'string' && content.splashDataUrl.length > 0) ||
      (typeof content.coverDataUrl === 'string' && content.coverDataUrl.length > 0)
  );

  const version = row.updated_at ? String(new Date(row.updated_at).getTime()) : '1';
  const origin = hostTarget ? `https://${slug}.${qrDomain}` : 'https://www.freebuildcv.tech';
  const imageUrl = hasPhoto
    ? `${origin}/api/og-image?slug=${encodeURIComponent(slug)}&domain=${encodeURIComponent(qrDomain)}&v=${version}`
    : undefined;

  const html = buildHtml({
    title: ogTitle,
    description: ogDescription,
    url: canonicalUrl,
    imageUrl,
    siteName,
    type: ogType,
  });

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
