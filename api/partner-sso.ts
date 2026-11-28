import {
  createSupabaseAdmin,
  jsonResponse,
  verifyPartnerJwt,
} from './_partnerAuth.js';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json().catch(() => null)) as {
      token?: string;
    } | null;
    const token = typeof body?.token === 'string' ? body.token.trim() : '';

    if (!token) {
      return jsonResponse({ ok: false, error: 'Token partner tidak ditemukan.' }, 400);
    }

    const verified = verifyPartnerJwt(token);
    if (!verified.valid) {
      return jsonResponse({ ok: false, error: verified.error }, 401);
    }

    const payload = verified.payload;
    if (payload.action && payload.action !== 'launch') {
      return jsonResponse({ ok: false, error: 'Jenis token partner tidak sesuai untuk login.' }, 400);
    }

    const email = (payload.email || '').trim().toLowerCase();
    const domain = (payload.domain || '').trim().toLowerCase();
    const orgSlug = (payload.org_slug || 'narainstitute').trim().toLowerCase();
    const orgName = (payload.org_name || 'Nara Institute').trim();
    const externalUserId = (payload.external_user_id || '').trim();
    const fullName = (payload.name || email.split('@')[0] || 'Staf Partner').trim();

    if (!email || !email.includes('@') || !domain || !externalUserId) {
      return jsonResponse(
        { ok: false, error: 'Data identitas partner (email/domain/user_id) tidak lengkap.' },
        400
      );
    }

    const supabaseAdmin = createSupabaseAdmin();
    if (!supabaseAdmin) {
      return jsonResponse(
        {
          ok: false,
          error:
            'Server Vercel belum memiliki SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY untuk auto-login partner.',
        },
        500
      );
    }

    const defaultVCardPrefix = payload.role === 'admin' ? 'admin/hub/vcard' : 'sales/vcard';
    const partnerMetadata: Record<string, unknown> = {
      full_name: fullName,
      is_partner_account: true,
      partner_org: orgSlug,
      partner_org_name: orgName,
      partner_domain: domain,
      laravel_user_id: externalUserId,
      partner_role: payload.role || 'sales',
      partner_dashboard_url:
        payload.dashboard_url || `https://${domain}/${defaultVCardPrefix}`,
      partner_switch_url:
        payload.switch_account_url ||
        `https://${domain}/${defaultVCardPrefix}/switch-account`,
    };

    // 1. Buat akun Supabase baru secara otomatis jika belum terdaftar
    let isNewAccount = false;
    let userId: string | null = null;
    let existingUserMeta: Record<string, unknown> = {};

    const createRes = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: partnerMetadata,
    });

    if (!createRes.error && createRes.data?.user) {
      isNewAccount = true;
      userId = createRes.data.user.id;
    }

    // 2. Hasilkan one-time magiclink token_hash (sekaligus mengambil user existing jika sudah terdaftar)
    let linkRes = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (linkRes.error || !linkRes.data?.user || !linkRes.data.properties?.hashed_token) {
      return jsonResponse(
        {
          ok: false,
          error:
            linkRes.error?.message ||
            createRes.error?.message ||
            'Gagal menyiapkan sesi otomatis akun partner.',
        },
        500
      );
    }

    userId = linkRes.data.user.id;
    existingUserMeta =
      (linkRes.data.user.user_metadata as Record<string, unknown> | undefined) || {};

    // 3. Sinkronkan metadata partner pada akun existing, lalu terbitkan ulang magiclink
    //    karena updateUserById dapat menginvalidasi token magiclink sebelumnya di Supabase GoTrue.
    if (!isNewAccount) {
      const needsMetaUpdate = Object.entries(partnerMetadata).some(
        ([k, v]) => existingUserMeta[k] !== v
      );
      if (needsMetaUpdate) {
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            ...existingUserMeta,
            ...partnerMetadata,
          },
        });
        const refreshedLink = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email,
        });
        if (
          !refreshedLink.error &&
          refreshedLink.data?.user &&
          refreshedLink.data.properties?.hashed_token
        ) {
          linkRes = refreshedLink;
        }
      }
    }

    // 4. Rekonsiliasi kepemilikan vCard lama milik external_user_id ini (jika sebelumnya sempat tersimpan di akun lain)
    let resolvedEditQrId = payload.create_new ? '' : (payload.edit_qr_id || '').trim();

    if (resolvedEditQrId && userId) {
      const { data: existingQr } = await supabaseAdmin
        .from('qr_codes')
        .select('id, user_id, org_slug, external_owner_ref, public_domain')
        .eq('id', resolvedEditQrId)
        .maybeSingle();

      if (existingQr) {
        const matchesOrg =
          (existingQr.org_slug || '').toLowerCase() === orgSlug ||
          (existingQr.public_domain || '').toLowerCase() === domain;
        const matchesOwner =
          !existingQr.external_owner_ref ||
          String(existingQr.external_owner_ref) === externalUserId;

        if (matchesOrg && matchesOwner && existingQr.user_id !== userId) {
          await supabaseAdmin
            .from('qr_codes')
            .update({
              user_id: userId,
              org_slug: orgSlug,
              external_owner_ref: externalUserId,
            })
            .eq('id', existingQr.id);
        } else if (!matchesOrg || !matchesOwner) {
          resolvedEditQrId = '';
        }
      } else {
        resolvedEditQrId = '';
      }
    }

    // Jika edit_qr_id kosong & bukan mode create_new, cek apakah user ini sudah punya vCard aktif untuk org ini
    if (!resolvedEditQrId && !payload.create_new && userId) {
      const { data: ownedQr } = await supabaseAdmin
        .from('qr_codes')
        .select('id')
        .eq('user_id', userId)
        .eq('qr_type', 'vcard')
        .ilike('public_domain', domain)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ownedQr?.id) {
        resolvedEditQrId = ownedQr.id;
      }
    }

    return jsonResponse({
      ok: true,
      isNewAccount,
      email,
      userId,
      tokenHash: linkRes.data.properties.hashed_token,
      resolvedEditQrId: resolvedEditQrId || null,
      partner: {
        domain,
        orgSlug,
        orgName,
        externalUserId,
        name: fullName,
        email,
        phone: payload.phone || '',
        position: payload.position || '',
        company: payload.company || orgName,
        website: payload.website || `https://${domain}`,
        suggestedSlug: payload.suggested_slug || '',
        returnUrl: payload.return_url || '',
        callbackState: payload.callback_state || '',
        dashboardUrl:
          payload.dashboard_url || `https://${domain}/${defaultVCardPrefix}`,
        switchAccountUrl:
          payload.switch_account_url ||
          `https://${domain}/${defaultVCardPrefix}/switch-account`,
        editQrId: resolvedEditQrId || '',
        createNew: Boolean(payload.create_new),
      },
    });
  } catch (err) {
    return jsonResponse(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'Terjadi kesalahan saat menyiapkan akun partner.',
      },
      500
    );
  }
}

export async function GET(): Promise<Response> {
  return jsonResponse({ ok: false, error: 'Method Not Allowed' }, 405);
}
