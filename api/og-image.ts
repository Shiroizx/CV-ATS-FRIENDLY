import { createSupabaseAdmin } from './_partnerAuth.js';

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const slug = (url.searchParams.get('slug') || '').trim().toLowerCase();
  const domain = (url.searchParams.get('domain') || 'narainstitute.net').trim().toLowerCase();

  if (!slug) {
    return new Response('Not Found', { status: 404 });
  }

  const supabaseAdmin = createSupabaseAdmin();
  if (!supabaseAdmin) {
    return new Response('Server not configured', { status: 500 });
  }

  const { data: row } = await supabaseAdmin
    .from('qr_codes')
    .select('content_data')
    .ilike('short_code', slug)
    .ilike('public_domain', domain)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();

  const content = (row?.content_data || {}) as Record<string, unknown>;
  const candidates = [
    content.avatarDataUrl,
    content.bannerDataUrl,
    content.coverDataUrl,
    content.splashDataUrl,
  ];

  for (const raw of candidates) {
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const val = raw.trim();

    if (val.startsWith('https://') || val.startsWith('http://')) {
      return Response.redirect(val, 302);
    }

    const match = val.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i);
    if (match) {
      const mimeType = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
      const buffer = Buffer.from(match[2], 'base64');
      return new Response(buffer, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        },
      });
    }
  }

  return new Response('No image', { status: 404 });
}
