import {
  createSupabaseAdmin,
  jsonResponse,
  removeQRStorageImages,
  verifyWebhookSignature,
} from './_partnerAuth.js';

interface PartnerDeleteBody {
  qr_id?: string | null;
  slug?: string | null;
  domain?: string | null;
  org_slug?: string | null;
  external_user_id?: string | null;
  email?: string | null;
  actor_role?: string | null;
}

/**
 * Endpoint server-to-server yang dipanggil oleh Laravel Nara Institute saat admin/sales
 * menekan tombol Hapus / Putuskan vCard di Dashboard Nara.
 * Menghapus permanen baris `public.qr_codes` + file gambar Storage terkait sehingga URL langsung mati.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-nara-signature');

    if (!verifyWebhookSignature(rawBody, signature)) {
      return jsonResponse({ ok: false, error: 'Tanda tangan HMAC tidak valid.' }, 401);
    }

    const body = JSON.parse(rawBody) as PartnerDeleteBody;
    const qrId = (body.qr_id || '').trim();
    const slug = (body.slug || '').trim().toLowerCase();
    const domain = (body.domain || 'narainstitute.net').trim().toLowerCase();
    const orgSlug = (body.org_slug || 'narainstitute').trim().toLowerCase();
    const externalUserId = (body.external_user_id || '').trim();

    if (!qrId && !slug) {
      return jsonResponse({ ok: false, error: 'qr_id atau slug wajib dikirim.' }, 400);
    }

    const supabaseAdmin = createSupabaseAdmin();
    if (!supabaseAdmin) {
      return jsonResponse(
        { ok: false, error: 'Konfigurasi SUPABASE_SERVICE_ROLE_KEY di Vercel belum tersedia.' },
        500
      );
    }

    type RowShape = {
      id: string;
      short_code: string;
      public_domain: string | null;
      org_slug: string | null;
      external_owner_ref: string | null;
      content_data: Record<string, unknown> | null;
      style_options: Record<string, unknown> | null;
    };

    const targets: RowShape[] = [];

    if (qrId) {
      const { data } = await supabaseAdmin
        .from('qr_codes')
        .select('id, short_code, public_domain, org_slug, external_owner_ref, content_data, style_options')
        .eq('id', qrId)
        .maybeSingle();
      if (data) targets.push(data as RowShape);
    }

    if (targets.length === 0 && slug) {
      const { data } = await supabaseAdmin
        .from('qr_codes')
        .select('id, short_code, public_domain, org_slug, external_owner_ref, content_data, style_options')
        .ilike('short_code', slug)
        .ilike('public_domain', domain)
        .limit(5);
      if (Array.isArray(data)) {
        targets.push(...(data as RowShape[]));
      }
    }

    // Filter keamanan: hanya boleh menghapus record milik domain/org partner yang sah
    const authorizedTargets = targets.filter((row) => {
      const rowDomain = (row.public_domain || '').toLowerCase();
      const rowOrg = (row.org_slug || '').toLowerCase();
      const domainOrOrgMatch = rowDomain === domain || rowOrg === orgSlug;
      if (!domainOrOrgMatch) return false;

      if (body.actor_role === 'admin') return true;
      if (!row.external_owner_ref || !externalUserId) return true;
      return String(row.external_owner_ref) === externalUserId;
    });

    const deletedIds: string[] = [];
    const deletedStorageFiles: string[] = [];

    for (const row of authorizedTargets) {
      const removed = await removeQRStorageImages(
        supabaseAdmin,
        row.content_data,
        row.style_options
      );
      deletedStorageFiles.push(...removed);

      const { error: delErr } = await supabaseAdmin
        .from('qr_codes')
        .delete()
        .eq('id', row.id);

      if (!delErr) {
        deletedIds.push(row.id);
      }
    }

    return jsonResponse({
      ok: true,
      deletedCount: deletedIds.length,
      deletedIds,
      deletedStorageFiles,
    });
  } catch (err) {
    return jsonResponse(
      {
        ok: false,
        error: err instanceof Error ? err.message : 'Gagal menghapus vCard partner di Supabase.',
      },
      500
    );
  }
}

export async function GET(): Promise<Response> {
  return jsonResponse({ ok: false, error: 'Method Not Allowed' }, 405);
}
