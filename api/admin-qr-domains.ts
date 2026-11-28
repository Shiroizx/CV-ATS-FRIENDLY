import {
  createSupabaseAdmin,
  jsonResponse,
  notifyNaraWebhook,
  removeQRStorageImages,
} from './_partnerAuth.js';

const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'app', 'admin', 'auth', 'login', 'register', 'cdn',
  'static', 'assets', 'mail', 'smtp', 'imap', 'pop', 'ftp', 'ns1', 'ns2',
  'vercel', 'supabase', 'freebuildcv', 'dashboard', 'settings', 'builder',
  'qr', 'q', 'help', 'support', 'status', 'blog', 'docs', 'cpanel',
  'webmail', 'whm', 'autodiscover', 'autoconfig', 'cpcalendars',
  'cpcontacts', 'webdisk', 'exam', 'assessment', 'portal', 'client',
]);

function normalizeSubdomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

function isValidSubdomain(slug: string): boolean {
  if (slug.length < 3 || slug.length > 32) return false;
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])$/.test(slug)) return false;
  return !RESERVED_SUBDOMAINS.has(slug);
}

function sanitizeContentSummary(
  qrType: string,
  contentData: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  const c = contentData || {};
  if (qrType === 'vcard') {
    return {
      fullName: typeof c.fullName === 'string' ? c.fullName : '',
      title: typeof c.title === 'string' ? c.title : '',
      company: typeof c.company === 'string' ? c.company : '',
      email: typeof c.email === 'string' ? c.email : '',
      phone: typeof c.phone === 'string' ? c.phone : '',
      whatsapp: typeof c.whatsapp === 'string' ? c.whatsapp : '',
      website: typeof c.website === 'string' ? c.website : '',
      address: typeof c.address === 'string' ? c.address : '',
      bio: typeof c.bio === 'string' ? c.bio : '',
      designStyle: typeof c.designStyle === 'string' ? c.designStyle : 'default',
      hasAvatar: typeof c.avatarDataUrl === 'string' && c.avatarDataUrl.length > 0,
      hasBanner: typeof c.bannerDataUrl === 'string' && c.bannerDataUrl.length > 0,
    };
  }
  if (qrType === 'business') {
    return {
      companyName: typeof c.companyName === 'string' ? c.companyName : '',
      tagline: typeof c.tagline === 'string' ? c.tagline : '',
      phone: typeof c.phone === 'string' ? c.phone : '',
      email: typeof c.email === 'string' ? c.email : '',
      website: typeof c.website === 'string' ? c.website : '',
      address: typeof c.address === 'string' ? c.address : '',
      designStyle: typeof c.designStyle === 'string' ? c.designStyle : 'default',
    };
  }
  return {
    url: typeof c.url === 'string' ? c.url : '',
  };
}

async function requireAdminCaller(request: Request) {
  const authHeader = request.headers.get('authorization') || '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!bearer) {
    return { error: jsonResponse({ ok: false, error: 'Token otentikasi diperlukan.' }, 401) };
  }

  const supabaseAdmin = createSupabaseAdmin();
  if (!supabaseAdmin) {
    return {
      error: jsonResponse(
        { ok: false, error: 'Konfigurasi SUPABASE_SERVICE_ROLE_KEY di Vercel belum lengkap.' },
        500
      ),
    };
  }

  const { data: authData, error: authErr } = await supabaseAdmin.auth.getUser(bearer);
  if (authErr || !authData?.user) {
    return { error: jsonResponse({ ok: false, error: 'Sesi admin tidak valid.' }, 401) };
  }

  const meta = (authData.user.user_metadata || {}) as Record<string, unknown>;
  if (meta.is_admin !== true) {
    return { error: jsonResponse({ ok: false, error: 'Akses ditolak: khusus Admin FreeBuild CV.' }, 403) };
  }

  return { supabaseAdmin, caller: authData.user };
}

export async function GET(request: Request): Promise<Response> {
  try {
    const auth = await requireAdminCaller(request);
    if ('error' in auth && auth.error) return auth.error;
    const { supabaseAdmin } = auth;

    const [qrRes, usersRes, domainsRes] = await Promise.all([
      supabaseAdmin
        .from('qr_codes')
        .select(
          'id, user_id, title, qr_type, short_code, public_domain, org_slug, external_owner_ref, content_data, is_active, scan_count, created_at, updated_at'
        )
        .order('updated_at', { ascending: false })
        .limit(500),
      supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      supabaseAdmin
        .from('qr_partner_domains')
        .select('domain, org_slug, org_name, is_active')
        .eq('is_active', true),
    ]);

    if (qrRes.error) {
      return jsonResponse({ ok: false, error: qrRes.error.message }, 500);
    }

    const userMap = new Map<string, { email: string; fullName: string; isPartner: boolean }>();
    for (const u of usersRes.data?.users || []) {
      const m = (u.user_metadata || {}) as Record<string, unknown>;
      userMap.set(u.id, {
        email: u.email || '',
        fullName:
          (typeof m.full_name === 'string' && m.full_name.trim()) ||
          (typeof m.username === 'string' && m.username.trim()) ||
          (u.email ? u.email.split('@')[0] : 'Unknown'),
        isPartner: m.is_partner_account === true,
      });
    }

    const items = (qrRes.data || []).map((row) => {
      const owner = userMap.get(row.user_id) || {
        email: '-',
        fullName: 'Unknown User',
        isPartner: false,
      };
      const domain = (row.public_domain || 'freebuildcv.tech').toLowerCase();
      return {
        id: row.id,
        user_id: row.user_id,
        owner_email: owner.email,
        owner_name: owner.fullName,
        owner_is_partner: owner.isPartner,
        title: row.title,
        qr_type: row.qr_type,
        short_code: row.short_code,
        public_domain: domain,
        live_url: `https://${row.short_code.toLowerCase()}.${domain}`,
        org_slug: row.org_slug || null,
        external_owner_ref: row.external_owner_ref || null,
        destination_url:
          typeof (row.content_data as Record<string, unknown> | null)?.url === 'string'
            ? String((row.content_data as Record<string, unknown>).url)
            : null,
        content_summary: sanitizeContentSummary(
          row.qr_type,
          row.content_data as Record<string, unknown> | null
        ),
        is_active: Boolean(row.is_active),
        scan_count: Number(row.scan_count || 0),
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    const availableDomains = Array.from(
      new Set([
        'freebuildcv.tech',
        ...(domainsRes.data || []).map((d) => String(d.domain || '').toLowerCase()).filter(Boolean),
        ...items.map((it) => it.public_domain),
      ])
    );

    return jsonResponse({
      ok: true,
      items,
      availableDomains,
    });
  } catch (err) {
    return jsonResponse(
      { ok: false, error: err instanceof Error ? err.message : 'Gagal memuat daftar domain QR.' },
      500
    );
  }
}

interface AdminPatchBody {
  id?: string;
  title?: string;
  short_code?: string;
  public_domain?: string;
  is_active?: boolean;
  destination_url?: string | null;
  content_patch?: Record<string, string>;
}

export async function PATCH(request: Request): Promise<Response> {
  try {
    const auth = await requireAdminCaller(request);
    if ('error' in auth && auth.error) return auth.error;
    const { supabaseAdmin } = auth;

    const body = (await request.json().catch(() => null)) as AdminPatchBody | null;
    const id = (body?.id || '').trim();
    if (!id) {
      return jsonResponse({ ok: false, error: 'ID QR wajib diisi.' }, 400);
    }

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('qr_codes')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !existing) {
      return jsonResponse({ ok: false, error: 'Data QR/Domain tidak ditemukan.' }, 404);
    }

    const nextSlug = body?.short_code !== undefined
      ? normalizeSubdomain(body.short_code)
      : String(existing.short_code).toLowerCase();
    const nextDomain = body?.public_domain !== undefined
      ? body.public_domain.trim().toLowerCase()
      : String(existing.public_domain || 'freebuildcv.tech').toLowerCase();

    if (!isValidSubdomain(nextSlug)) {
      return jsonResponse(
        {
          ok: false,
          error:
            'Subdomain tidak valid (3-32 karakter huruf kecil/angka/tanda hubung dan bukan subdomain sistem).',
        },
        400
      );
    }

    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(nextDomain)) {
      return jsonResponse({ ok: false, error: 'Format domain induk tidak valid.' }, 400);
    }

    // Cek bentrok subdomain di domain yang sama
    const { data: conflict } = await supabaseAdmin
      .from('qr_codes')
      .select('id')
      .ilike('short_code', nextSlug)
      .ilike('public_domain', nextDomain)
      .neq('id', id)
      .limit(1)
      .maybeSingle();

    if (conflict) {
      return jsonResponse(
        { ok: false, error: `Domain ${nextSlug}.${nextDomain} sudah digunakan oleh QR lain.` },
        409
      );
    }

    const existingContent = (existing.content_data || {}) as Record<string, unknown>;
    const mergedContent: Record<string, unknown> = { ...existingContent };
    const patch = body?.content_patch || {};

    if (existing.qr_type === 'vcard') {
      const allowedKeys = [
        'fullName', 'title', 'company', 'email', 'phone',
        'whatsapp', 'website', 'address', 'bio',
      ];
      for (const key of allowedKeys) {
        if (typeof patch[key] === 'string') {
          mergedContent[key] = patch[key].trim();
        }
      }
    } else if (existing.qr_type === 'business') {
      const allowedKeys = ['companyName', 'tagline', 'phone', 'email', 'website', 'address'];
      for (const key of allowedKeys) {
        if (typeof patch[key] === 'string') {
          mergedContent[key] = patch[key].trim();
        }
      }
    } else if (existing.qr_type === 'url') {
      if (typeof patch.url === 'string') {
        mergedContent.url = patch.url.trim();
      }
    }

    const nextTitle =
      typeof body?.title === 'string' && body.title.trim()
        ? body.title.trim()
        : existing.title;
    const nextIsActive =
      typeof body?.is_active === 'boolean' ? body.is_active : Boolean(existing.is_active);
    const nextOrgSlug =
      nextDomain === 'narainstitute.net' ? 'narainstitute' : existing.org_slug;

    const { data: updated, error: updErr } = await supabaseAdmin
      .from('qr_codes')
      .update({
        title: nextTitle,
        short_code: nextSlug,
        public_domain: nextDomain,
        org_slug: nextOrgSlug,
        is_active: nextIsActive,
        content_data: mergedContent,
      })
      .eq('id', id)
      .select('*')
      .single();

    if (updErr || !updated) {
      return jsonResponse({ ok: false, error: updErr?.message || 'Gagal memperbarui data QR.' }, 500);
    }

    // Jika domain partner narainstitute.net, sinkronkan perubahan ke MySQL Laravel
    if (nextDomain === 'narainstitute.net' && updated.qr_type === 'vcard') {
      const ownerRes = await supabaseAdmin.auth.admin.getUserById(updated.user_id).catch(() => null);
      const ownerEmail = ownerRes?.data?.user?.email || null;
      await notifyNaraWebhook({
        event: 'saved',
        org_slug: 'narainstitute',
        external_user_id: updated.external_owner_ref || null,
        email: ownerEmail,
        qr_id: updated.id,
        slug: nextSlug,
        domain: nextDomain,
        url: `https://${nextSlug}.${nextDomain}`,
        title: updated.title,
        qr_type: updated.qr_type,
        timestamp: Math.floor(Date.now() / 1000),
      });
    }

    return jsonResponse({ ok: true, id: updated.id, live_url: `https://${nextSlug}.${nextDomain}` });
  } catch (err) {
    return jsonResponse(
      { ok: false, error: err instanceof Error ? err.message : 'Gagal mengubah domain QR.' },
      500
    );
  }
}

export async function DELETE(request: Request): Promise<Response> {
  try {
    const auth = await requireAdminCaller(request);
    if ('error' in auth && auth.error) return auth.error;
    const { supabaseAdmin } = auth;

    const body = (await request.json().catch(() => null)) as { id?: string } | null;
    const id = (body?.id || '').trim();
    if (!id) {
      return jsonResponse({ ok: false, error: 'ID QR wajib diisi.' }, 400);
    }

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('qr_codes')
      .select('id, user_id, short_code, public_domain, org_slug, external_owner_ref, qr_type, title, content_data, style_options')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !existing) {
      return jsonResponse({ ok: false, error: 'Data QR/Domain tidak ditemukan.' }, 404);
    }

    const removedImages = await removeQRStorageImages(
      supabaseAdmin,
      existing.content_data as Record<string, unknown> | null,
      existing.style_options as Record<string, unknown> | null
    );

    const { error: delErr } = await supabaseAdmin
      .from('qr_codes')
      .delete()
      .eq('id', id);

    if (delErr) {
      return jsonResponse({ ok: false, error: delErr.message }, 500);
    }

    const domain = (existing.public_domain || '').toLowerCase();
    const orgSlug = (existing.org_slug || '').toLowerCase();
    let webhookSynced = false;

    if (domain === 'narainstitute.net' || orgSlug === 'narainstitute') {
      const ownerRes = await supabaseAdmin.auth.admin.getUserById(existing.user_id).catch(() => null);
      const ownerEmail = ownerRes?.data?.user?.email || null;
      const hook = await notifyNaraWebhook({
        event: 'deleted',
        org_slug: 'narainstitute',
        external_user_id: existing.external_owner_ref || null,
        email: ownerEmail,
        qr_id: existing.id,
        slug: String(existing.short_code).toLowerCase(),
        domain: domain || 'narainstitute.net',
        url: null,
        title: existing.title,
        qr_type: existing.qr_type,
        timestamp: Math.floor(Date.now() / 1000),
      });
      webhookSynced = hook.sent;
    }

    return jsonResponse({
      ok: true,
      deletedId: id,
      removedImages,
      webhookSynced,
    });
  } catch (err) {
    return jsonResponse(
      { ok: false, error: err instanceof Error ? err.message : 'Gagal menghapus domain QR.' },
      500
    );
  }
}
