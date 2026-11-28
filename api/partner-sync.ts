import {
  createSupabaseAdmin,
  jsonResponse,
  notifyNaraWebhook,
  removeQRStorageImages,
} from './_partnerAuth.js';

interface PartnerSyncRequestBody {
  event?: 'saved' | 'deleted';
  qrId?: string;
  slug?: string;
  domain?: string;
  url?: string;
  title?: string;
  qrType?: string;
  externalUserId?: string;
  contentData?: Record<string, unknown> | null;
  styleOptions?: Record<string, unknown> | null;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const bearer = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : '';

    if (!bearer) {
      return jsonResponse({ ok: false, error: 'Token sesi pengguna diperlukan.' }, 401);
    }

    const supabaseAdmin = createSupabaseAdmin();
    if (!supabaseAdmin) {
      return jsonResponse({ ok: false, error: 'Konfigurasi server Supabase belum lengkap.' }, 500);
    }

    const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(bearer);
    if (authErr || !authData?.user) {
      return jsonResponse({ ok: false, error: 'Sesi pengguna tidak valid.' }, 401);
    }

    const caller = authData.user;
    const callerMeta = (caller.user_metadata || {}) as Record<string, unknown>;
    const body = (await request.json().catch(() => null)) as PartnerSyncRequestBody | null;

    if (!body || (body.event !== 'saved' && body.event !== 'deleted')) {
      return jsonResponse({ ok: false, error: 'Event sinkronisasi tidak valid.' }, 400);
    }

    const nowSec = Math.floor(Date.now() / 1000);

    if (body.event === 'saved') {
      if (!body.qrId) {
        return jsonResponse({ ok: false, error: 'qrId wajib diisi.' }, 400);
      }

      const { data: row, error: rowErr } = await supabaseAdmin
        .from('qr_codes')
        .select('id, short_code, public_domain, org_slug, external_owner_ref, qr_type, title, user_id')
        .eq('id', body.qrId)
        .eq('user_id', caller.id)
        .maybeSingle();

      if (rowErr || !row) {
        return jsonResponse({ ok: false, error: 'Data QR tidak ditemukan pada akun Anda.' }, 404);
      }

      const rowDomain = (row.public_domain || 'freebuildcv.tech').toLowerCase();
      const orgSlug = (row.org_slug || (callerMeta.partner_org as string | undefined) || '').toLowerCase();

      if (rowDomain !== 'narainstitute.net' && orgSlug !== 'narainstitute') {
        return jsonResponse({ ok: true, skipped: true });
      }

      const liveUrl = `https://${row.short_code.toLowerCase()}.${rowDomain}`;
      const externalUserId =
        row.external_owner_ref ||
        (typeof callerMeta.laravel_user_id === 'string' ? callerMeta.laravel_user_id : null) ||
        body.externalUserId ||
        null;

      const webhookRes = await notifyNaraWebhook({
        event: 'saved',
        org_slug: orgSlug || 'narainstitute',
        external_user_id: externalUserId,
        email: caller.email || null,
        qr_id: row.id,
        slug: row.short_code.toLowerCase(),
        domain: rowDomain,
        url: liveUrl,
        title: row.title,
        qr_type: row.qr_type,
        timestamp: nowSec,
      });

      return jsonResponse({ ok: true, synced: webhookRes.sent, webhook: webhookRes });
    }

    // Event 'deleted': hapus gambar Storage jika ada + beri tahu Laravel agar MySQL ikut terhapus
    const removedImages = await removeQRStorageImages(
      supabaseAdmin,
      body.contentData,
      body.styleOptions
    );

    const targetDomain = (body.domain || '').toLowerCase();
    const orgSlug = (
      (callerMeta.partner_org as string | undefined) ||
      (targetDomain === 'narainstitute.net' ? 'narainstitute' : '')
    ).toLowerCase();

    if (targetDomain !== 'narainstitute.net' && orgSlug !== 'narainstitute') {
      return jsonResponse({ ok: true, skipped: true, removedImages });
    }

    const externalUserId =
      body.externalUserId ||
      (typeof callerMeta.laravel_user_id === 'string' ? callerMeta.laravel_user_id : null);

    const webhookRes = await notifyNaraWebhook({
      event: 'deleted',
      org_slug: orgSlug || 'narainstitute',
      external_user_id: externalUserId,
      email: caller.email || null,
      qr_id: body.qrId || null,
      slug: body.slug ? body.slug.toLowerCase() : null,
      domain: targetDomain || 'narainstitute.net',
      url: null,
      title: body.title || null,
      qr_type: body.qrType || 'vcard',
      timestamp: nowSec,
    });

    return jsonResponse({
      ok: true,
      synced: webhookRes.sent,
      removedImages,
      webhook: webhookRes,
    });
  } catch (err) {
    return jsonResponse(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Gagal menyinkronkan data partner.',
      },
      500
    );
  }
}

export async function GET(): Promise<Response> {
  return jsonResponse({ ok: false, error: 'Method Not Allowed' }, 405);
}
