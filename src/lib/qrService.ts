import { supabase, deleteImage } from './supabase';
import {
  PUBLIC_QR_DOMAIN,
  generateShortCode,
  isAllowedPartnerReturnUrl,
  normalizePublicQRDomain,
} from './qrHelpers';
import { shrinkLogoDataUrl } from './qrExport';
import { checkAndRecordUserDownload } from './downloadCredit';
import type { DownloadCreditInfo } from './downloadCredit';
import type {
  QRAllowedDomainOption,
  QRContentData,
  QRPartnerContext,
  QRStyleOptions,
  QRType,
  SavedQRCode,
} from '../types/qrGenerator';

const QR_SELECT_COLUMNS =
  'id, short_code, public_domain, org_slug, external_owner_ref, user_id, qr_type, title, content_data, style_options, requires_password, scan_count, is_active, created_at, updated_at';

const QR_SELECT_COLUMNS_LEGACY =
  'id, short_code, user_id, qr_type, title, content_data, style_options, requires_password, scan_count, is_active, created_at, updated_at';

export const DEFAULT_ALLOWED_DOMAIN_OPTION: QRAllowedDomainOption = {
  domain: PUBLIC_QR_DOMAIN,
  orgSlug: 'freebuildcv',
  orgName: 'FreeBuild CV',
  waiveCredit: false,
  authSource: 'default',
};

function isMissingPartnerSchemaError(err: unknown): boolean {
  const msg =
    err instanceof Error
      ? err.message
      : String((err as { message?: string })?.message || err);
  return /public_domain|org_slug|external_owner_ref|p_public_domain|p_partner_token|verify_qr_partner_token|get_my_allowed_qr_domains|could not find the function|schema cache|does not exist/i.test(
    msg
  );
}

function formatSupabaseError(err: unknown): Error {
  const msg =
    err instanceof Error
      ? err.message
      : String((err as { message?: string })?.message || err);
  if (
    /verify_qr_partner_token|get_my_allowed_qr_domains|qr_partner_domains|p_public_domain|p_partner_token/i.test(
      msg
    ) &&
    /does not exist|not found|schema cache|could not find the function/i.test(msg)
  ) {
    return new Error(
      'Skema multi-domain partner di Supabase belum tersedia. Jalankan skrip sql/sql_qr_partner_domains_setup.sql di Supabase SQL Editor terlebih dahulu.'
    );
  }
  if (
    /qr_codes|save_user_qr|get_public_qr/i.test(msg) &&
    /does not exist|not found|schema cache/i.test(msg)
  ) {
    return new Error(
      'Tabel atau fungsi QR di Supabase belum tersedia. Jalankan skrip sql/sql_qr_codes_setup.sql di Supabase SQL Editor terlebih dahulu.'
    );
  }
  if (/duplicate key|23505|short_code|idx_qr_codes_slug_domain_unique/i.test(msg)) {
    return new Error('Nama domain tersebut sudah digunakan oleh QR lain. Pilih nama lain.');
  }
  return err instanceof Error ? err : new Error(msg || 'Terjadi kesalahan pada layanan database QR.');
}

export interface SaveQRParams {
  id?: string | null;
  shortCode?: string | null;
  publicDomain?: string | null;
  partnerToken?: string | null;
  orgSlug?: string | null;
  externalOwnerRef?: string | null;
  qrType: QRType;
  title: string;
  content: QRContentData;
  style: QRStyleOptions;
  passwordEnabled: boolean;
  newPassword?: string;
}

/**
 * Menyimpan atau memperbarui QR Code milik user yang login via RPC `save_user_qr`.
 */
export async function saveUserQR(
  params: SaveQRParams
): Promise<{ data: SavedQRCode | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        data: null,
        error: new Error('Anda harus login terlebih dahulu untuk menyimpan QR Code.'),
      };
    }

    const shortCode = params.shortCode || generateShortCode(8);
    const trimmedPassword = params.newPassword?.trim() || null;
    const resolvedDomain = normalizePublicQRDomain(
      params.publicDomain || params.style.publicDomain
    );

    let styleToPersist: QRStyleOptions = {
      ...params.style,
      publicDomain: resolvedDomain,
    };
    if (params.style.logoDataUrl && params.style.logoDataUrl.length > 24000) {
      const compactLogo = await shrinkLogoDataUrl(params.style.logoDataUrl, 24000);
      styleToPersist = { ...styleToPersist, logoDataUrl: compactLogo };
    }

    let { data, error } = await supabase.rpc('save_user_qr', {
      p_id: params.id || null,
      p_short_code: shortCode,
      p_qr_type: params.qrType,
      p_title: params.title,
      p_content_data: params.content,
      p_style_options: styleToPersist,
      p_password_enabled: params.passwordEnabled,
      p_new_password: trimmedPassword,
      p_public_domain: resolvedDomain,
      p_partner_token: params.partnerToken || null,
      p_org_slug: params.orgSlug || null,
      p_external_owner_ref: params.externalOwnerRef || null,
    });

    if (
      error &&
      resolvedDomain === PUBLIC_QR_DOMAIN &&
      isMissingPartnerSchemaError(error)
    ) {
      const legacyRes = await supabase.rpc('save_user_qr', {
        p_id: params.id || null,
        p_short_code: shortCode,
        p_qr_type: params.qrType,
        p_title: params.title,
        p_content_data: params.content,
        p_style_options: styleToPersist,
        p_password_enabled: params.passwordEnabled,
        p_new_password: trimmedPassword,
      });
      data = legacyRes.data;
      error = legacyRes.error;
    }

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      throw new Error('Tidak ada data yang dikembalikan setelah menyimpan QR Code.');
    }

    const normalizedRow: SavedQRCode = {
      ...(row as SavedQRCode),
      public_domain: normalizePublicQRDomain(
        (row as SavedQRCode).public_domain || resolvedDomain
      ),
    };

    return { data: normalizedRow, error: null };
  } catch (err) {
    return { data: null, error: formatSupabaseError(err) };
  }
}

/**
 * Mengambil seluruh riwayat QR Code milik user yang sedang login.
 */
export async function getUserQRCodes(): Promise<{
  data: SavedQRCode[] | null;
  error: Error | null;
}> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User belum login.') };
    }

    const primary = await supabase
      .from('qr_codes')
      .select(QR_SELECT_COLUMNS)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (primary.error && isMissingPartnerSchemaError(primary.error)) {
      const legacy = await supabase
        .from('qr_codes')
        .select(QR_SELECT_COLUMNS_LEGACY)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      if (legacy.error) throw legacy.error;
      return { data: (legacy.data || []) as SavedQRCode[], error: null };
    }

    if (primary.error) throw primary.error;
    return { data: (primary.data || []) as SavedQRCode[], error: null };
  } catch (err) {
    return { data: null, error: formatSupabaseError(err) };
  }
}

/**
 * Mengambil satu data QR Code berdasarkan ID untuk diedit pemiliknya.
 */
export async function getQRCodeById(
  id: string
): Promise<{ data: SavedQRCode | null; error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: null, error: new Error('User belum login.') };
    }

    const primary = await supabase
      .from('qr_codes')
      .select(QR_SELECT_COLUMNS)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (primary.error && isMissingPartnerSchemaError(primary.error)) {
      const legacy = await supabase
        .from('qr_codes')
        .select(QR_SELECT_COLUMNS_LEGACY)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (legacy.error) throw legacy.error;
      return { data: legacy.data as SavedQRCode, error: null };
    }

    if (primary.error) throw primary.error;
    return { data: primary.data as SavedQRCode, error: null };
  } catch (err) {
    return { data: null, error: formatSupabaseError(err) };
  }
}

/**
 * Menghapus file gambar Supabase Storage (jika ada URL storage) yang tertaut pada QR.
 */
async function cleanupQRStorageImages(qr?: Partial<SavedQRCode> | null): Promise<void> {
  if (!qr) return;
  const content = (qr.content_data || {}) as Record<string, unknown>;
  const style = (qr.style_options || {}) as Record<string, unknown>;
  const urls = [
    content.avatarDataUrl,
    content.bannerDataUrl,
    content.splashDataUrl,
    content.coverDataUrl,
    style.logoDataUrl,
  ].filter((u): u is string => typeof u === 'string' && u.includes('/portfolio-images/'));

  await Promise.all(urls.map((url) => deleteImage(url)));
}

/**
 * Menghapus QR Code milik user yang login beserta gambar terkait (dan menyinkronkan ke webhook partner bila ada).
 */
export async function deleteQRCode(
  id: string,
  qrSnapshot?: SavedQRCode | null
): Promise<{ error: Error | null }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: new Error('User belum login.') };
    }

    const { error } = await supabase
      .from('qr_codes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    await cleanupQRStorageImages(qrSnapshot);

    if (qrSnapshot) {
      void syncPartnerQREvent({
        event: 'deleted',
        qrId: qrSnapshot.id,
        slug: qrSnapshot.short_code,
        domain: qrSnapshot.public_domain || qrSnapshot.style_options?.publicDomain,
        title: qrSnapshot.title,
        qrType: qrSnapshot.qr_type,
        externalUserId: qrSnapshot.external_owner_ref || undefined,
        contentData: qrSnapshot.content_data as unknown as Record<string, unknown>,
        styleOptions: qrSnapshot.style_options as unknown as Record<string, unknown>,
      });
    }

    return { error: null };
  } catch (err) {
    return { error: formatSupabaseError(err) };
  }
}

export interface PublicQRResult {
  id: string;
  short_code: string;
  public_domain?: string;
  qr_type: QRType;
  title: string;
  requires_password: boolean;
  content_data: QRContentData | null;
}

/**
 * Mengambil metadata QR publik via RPC get_public_qr (aman, tanpa mengekspos URL jika terkunci sandi).
 */
export async function getPublicQRByCode(
  shortCode: string,
  publicDomain?: string
): Promise<{ data: PublicQRResult | null; notFound?: boolean; error: Error | null }> {
  try {
    const normalizedDomain = publicDomain
      ? normalizePublicQRDomain(publicDomain)
      : null;

    let { data, error } = await supabase.rpc(
      'get_public_qr',
      normalizedDomain
        ? { p_short_code: shortCode, p_public_domain: normalizedDomain }
        : { p_short_code: shortCode }
    );

    if (error && normalizedDomain && isMissingPartnerSchemaError(error)) {
      const legacy = await supabase.rpc('get_public_qr', {
        p_short_code: shortCode,
      });
      data = legacy.data;
      error = legacy.error;
    }

    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      return { data: null, notFound: true, error: null };
    }

    return { data: row as PublicQRResult, error: null };
  } catch (err) {
    return { data: null, error: formatSupabaseError(err) };
  }
}

/**
 * Memverifikasi kata sandi QR publik dan membuka URL tujuan jika cocok.
 */
export async function verifyPublicQRPassword(
  shortCode: string,
  password: string,
  publicDomain?: string
): Promise<{
  valid: boolean;
  content_data: QRContentData | null;
  title?: string;
  error: Error | null;
}> {
  try {
    const normalizedDomain = publicDomain
      ? normalizePublicQRDomain(publicDomain)
      : null;

    let { data, error } = await supabase.rpc(
      'verify_qr_password',
      normalizedDomain
        ? {
            p_short_code: shortCode,
            p_password: password,
            p_public_domain: normalizedDomain,
          }
        : { p_short_code: shortCode, p_password: password }
    );

    if (error && normalizedDomain && isMissingPartnerSchemaError(error)) {
      const legacy = await supabase.rpc('verify_qr_password', {
        p_short_code: shortCode,
        p_password: password,
      });
      data = legacy.data;
      error = legacy.error;
    }

    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || !row.valid) {
      return { valid: false, content_data: null, error: null };
    }

    return {
      valid: true,
      content_data: row.content_data as QRContentData,
      title: row.title as string,
      error: null,
    };
  } catch (err) {
    return { valid: false, content_data: null, error: formatSupabaseError(err) };
  }
}

/**
 * Memeriksa apakah slug subdomain / short_code masih tersedia untuk domain tertentu.
 */
export async function checkQRSlugAvailable(
  slug: string,
  excludeId?: string | null,
  publicDomain: string = PUBLIC_QR_DOMAIN
): Promise<{ available: boolean; checkSkipped?: boolean; error?: string }> {
  const clean = slug.trim().toLowerCase();
  if (clean.length < 3) {
    return { available: false, error: 'Minimal 3 karakter.' };
  }

  const normalizedDomain = normalizePublicQRDomain(publicDomain);

  try {
    let { data, error } = await supabase.rpc('check_qr_slug_available', {
      p_slug: clean,
      p_exclude_id: excludeId || null,
      p_public_domain: normalizedDomain,
    });

    if (error && isMissingPartnerSchemaError(error)) {
      const legacy = await supabase.rpc('check_qr_slug_available', {
        p_slug: clean,
        p_exclude_id: excludeId || null,
      });
      data = legacy.data;
      error = legacy.error;
    }

    if (error) {
      if (/check_qr_slug_available|does not exist|not found/i.test(error.message)) {
        return { available: true, checkSkipped: true };
      }
      return { available: true, checkSkipped: true, error: error.message };
    }
    return { available: Boolean(data) };
  } catch {
    return { available: true, checkSkipped: true };
  }
}

interface VerifyPartnerRpcRow {
  valid: boolean;
  domain: string | null;
  org_slug: string | null;
  org_name: string | null;
  waive_credit: boolean;
  payload: Record<string, unknown> | null;
  error_message: string | null;
}

/**
 * Memverifikasi Signed Partner Token (HS256) dari dashboard eksternal (mis. Laravel Nara Institute).
 */
export async function verifyQRPartnerToken(
  token: string
): Promise<{ context: QRPartnerContext | null; error: string | null }> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return { context: null, error: 'Token partner kosong.' };
  }

  try {
    const { data, error } = await supabase.rpc('verify_qr_partner_token', {
      p_token: cleanToken,
    });

    if (error) {
      return { context: null, error: formatSupabaseError(error).message };
    }

    const row = (Array.isArray(data) ? data[0] : data) as
      | VerifyPartnerRpcRow
      | undefined;
    if (!row || !row.valid || !row.domain) {
      return {
        context: null,
        error:
          row?.error_message ||
          'Token integrasi partner tidak valid atau sudah kedaluwarsa.',
      };
    }

    const payload = row.payload || {};
    const str = (key: string): string | undefined => {
      const val = payload[key];
      return typeof val === 'string' && val.trim() ? val.trim() : undefined;
    };

    const rawReturnUrl = str('return_url');
    const safeReturnUrl = isAllowedPartnerReturnUrl(rawReturnUrl, row.domain)
      ? rawReturnUrl
      : undefined;

    return {
      context: {
        token: cleanToken,
        domain: normalizePublicQRDomain(row.domain),
        orgSlug: row.org_slug || 'partner',
        orgName: row.org_name || row.domain,
        waiveCredit: Boolean(row.waive_credit),
        externalUserId: str('external_user_id'),
        userName: str('name'),
        userEmail: str('email'),
        userPhone: str('phone'),
        userPosition: str('position'),
        userCompany: str('company') || row.org_name || undefined,
        userWebsite: str('website'),
        suggestedSlug: str('suggested_slug'),
        returnUrl: safeReturnUrl,
        callbackState: str('callback_state'),
        editQrId: str('edit_qr_id'),
      },
      error: null,
    };
  } catch (err) {
    return { context: null, error: formatSupabaseError(err).message };
  }
}

interface AllowedDomainRpcRow {
  domain: string;
  org_slug: string;
  org_name: string;
  waive_credit: boolean;
  auth_source: 'default' | 'partner_token' | 'email_domain';
}

/**
 * Mengambil daftar base domain yang diizinkan untuk user saat ini
 * (selalu mencakup freebuildcv.tech + domain partner bila terverifikasi via token atau email resmi).
 */
export async function getAllowedQRDomains(
  partnerToken?: string | null
): Promise<QRAllowedDomainOption[]> {
  try {
    const { data, error } = await supabase.rpc('get_my_allowed_qr_domains', {
      p_partner_token: partnerToken || null,
    });

    if (error || !Array.isArray(data) || data.length === 0) {
      return [DEFAULT_ALLOWED_DOMAIN_OPTION];
    }

    const mapped = (data as AllowedDomainRpcRow[])
      .filter((row) => Boolean(row?.domain))
      .map((row) => ({
        domain: normalizePublicQRDomain(row.domain),
        orgSlug: row.org_slug || 'partner',
        orgName: row.org_name || row.domain,
        waiveCredit: Boolean(row.waive_credit),
        authSource: row.auth_source || 'default',
      }));

    if (!mapped.some((item) => item.domain === PUBLIC_QR_DOMAIN)) {
      mapped.push(DEFAULT_ALLOWED_DOMAIN_OPTION);
    }

    // Urutkan domain partner resmi di depan agar mudah dipilih admin/sales
    return mapped.sort((a, b) => {
      if (a.domain === PUBLIC_QR_DOMAIN && b.domain !== PUBLIC_QR_DOMAIN) return 1;
      if (a.domain !== PUBLIC_QR_DOMAIN && b.domain === PUBLIC_QR_DOMAIN) return -1;
      return a.domain.localeCompare(b.domain);
    });
  } catch {
    return [DEFAULT_ALLOWED_DOMAIN_OPTION];
  }
}

export interface PartnerSsoExchangeResult {
  ok: boolean;
  apiUnavailable?: boolean;
  isNewAccount?: boolean;
  resolvedEditQrId?: string | null;
  context: QRPartnerContext | null;
  error: string | null;
}

/**
 * Menukar Signed Partner Token dari Laravel lewat Vercel Serverless Function `/api/partner-sso`:
 * otomatis membuat akun partner Supabase jika belum ada, lalu otomatis login ke akun tersebut via verifyOtp.
 */
export async function exchangePartnerSsoToken(
  token: string
): Promise<PartnerSsoExchangeResult> {
  const cleanToken = token.trim();
  if (!cleanToken) {
    return { ok: false, context: null, error: 'Token partner kosong.' };
  }

  try {
    const res = await fetch('/api/partner-sso', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ token: cleanToken }),
    });

    if (res.status === 404) {
      return {
        ok: false,
        apiUnavailable: true,
        context: null,
        error: 'Endpoint /api/partner-sso tidak tersedia di mode dev lokal.',
      };
    }

    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
      isNewAccount?: boolean;
      email?: string;
      tokenHash?: string;
      resolvedEditQrId?: string | null;
      partner?: {
        domain?: string;
        orgSlug?: string;
        orgName?: string;
        externalUserId?: string;
        name?: string;
        email?: string;
        phone?: string;
        position?: string;
        company?: string;
        website?: string;
        suggestedSlug?: string;
        returnUrl?: string;
        callbackState?: string;
        dashboardUrl?: string;
        switchAccountUrl?: string;
        editQrId?: string;
        createNew?: boolean;
      };
    } | null;

    if (!res.ok || !data?.ok || !data.tokenHash || !data.partner?.domain) {
      return {
        ok: false,
        context: null,
        error: data?.error || 'Gagal menyiapkan sesi otomatis akun partner.',
      };
    }

    // Jika sedang login dengan akun berbeda (mis. akun admin FreeBuild CV), tukar ke akun partner milik staf ini
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    const targetEmail = (data.email || data.partner.email || '').trim().toLowerCase();
    if (
      currentUser &&
      currentUser.email &&
      targetEmail &&
      currentUser.email.trim().toLowerCase() !== targetEmail
    ) {
      await supabase.auth.signOut();
    }

    const { error: otpError } = await supabase.auth.verifyOtp({
      token_hash: data.tokenHash,
      type: 'magiclink',
    });

    if (otpError) {
      return {
        ok: false,
        context: null,
        error: `Akun partner siap, tetapi login otomatis gagal: ${otpError.message}`,
      };
    }

    const domain = normalizePublicQRDomain(data.partner.domain);
    const safeReturnUrl = isAllowedPartnerReturnUrl(data.partner.returnUrl, domain)
      ? data.partner.returnUrl
      : undefined;
    const safeDashboardUrl = isAllowedPartnerReturnUrl(data.partner.dashboardUrl, domain)
      ? data.partner.dashboardUrl
      : undefined;
    const safeSwitchUrl = isAllowedPartnerReturnUrl(data.partner.switchAccountUrl, domain)
      ? data.partner.switchAccountUrl
      : undefined;

    return {
      ok: true,
      isNewAccount: Boolean(data.isNewAccount),
      resolvedEditQrId: data.resolvedEditQrId || data.partner.editQrId || null,
      context: {
        token: cleanToken,
        domain,
        orgSlug: data.partner.orgSlug || 'narainstitute',
        orgName: data.partner.orgName || 'Nara Institute',
        waiveCredit: true,
        externalUserId: data.partner.externalUserId,
        userName: data.partner.name,
        userEmail: data.partner.email,
        userPhone: data.partner.phone,
        userPosition: data.partner.position,
        userCompany: data.partner.company,
        userWebsite: data.partner.website,
        suggestedSlug: data.partner.suggestedSlug,
        returnUrl: safeReturnUrl,
        callbackState: data.partner.callbackState,
        dashboardUrl: safeDashboardUrl,
        switchAccountUrl: safeSwitchUrl,
        editQrId: data.resolvedEditQrId || data.partner.editQrId || undefined,
        createNew: Boolean(data.partner.createNew),
      },
      error: null,
    };
  } catch (err) {
    return {
      ok: false,
      context: null,
      error:
        err instanceof Error
          ? err.message
          : 'Gagal terhubung ke layanan SSO Partner.',
    };
  }
}

/**
 * Mengirim event sinkronisasi real-time (saved / deleted) ke server Vercel -> Webhook Laravel MySQL.
 */
export async function syncPartnerQREvent(params: {
  event: 'saved' | 'deleted';
  qrId: string;
  slug?: string;
  domain?: string;
  url?: string;
  title?: string;
  qrType?: string;
  externalUserId?: string;
  contentData?: Record<string, unknown> | null;
  styleOptions?: Record<string, unknown> | null;
}): Promise<{ ok: boolean; synced?: boolean }> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const accessToken = session?.access_token;
    if (!accessToken) return { ok: false };

    const res = await fetch('/api/partner-sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(params),
    });

    if (!res.ok) return { ok: false };
    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      synced?: boolean;
    } | null;
    return { ok: Boolean(data?.ok), synced: Boolean(data?.synced) };
  } catch {
    return { ok: false };
  }
}

/**
 * Memverifikasi one-time signed logout_token yang diterbitkan setelah konfirmasi ganti akun di Dashboard Nara.
 */
export async function verifyPartnerLogoutToken(
  token: string
): Promise<{ valid: boolean; orgName?: string; error?: string }> {
  try {
    const res = await fetch('/api/partner-logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ token: token.trim() }),
    });
    const data = (await res.json().catch(() => null)) as {
      ok?: boolean;
      switchConfirmed?: boolean;
      orgName?: string;
      error?: string;
    } | null;

    if (!res.ok || !data?.ok || !data.switchConfirmed) {
      return {
        valid: false,
        error: data?.error || 'Konfirmasi ganti akun tidak valid atau kedaluwarsa.',
      };
    }

    return { valid: true, orgName: data.orgName };
  } catch (err) {
    return {
      valid: false,
      error:
        err instanceof Error
          ? err.message
          : 'Gagal memverifikasi konfirmasi ganti akun.',
    };
  }
}

/**
 * Memeriksa dan memotong kredit unduhan akun untuk unduhan QR Code atau aktivasi domain kustom.
 */
export async function consumeQRDownloadCredit(
  label: string,
  creditCost = 1
): Promise<{ allowed: boolean; credit: DownloadCreditInfo }> {
  const res = await checkAndRecordUserDownload('qr_code', label, creditCost);
  return {
    allowed: res.allowed,
    credit: {
      count: res.count,
      max: res.max,
      remaining: Math.max(0, res.max - res.count),
    },
  };
}
