import { supabase } from './supabase';
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
 * Menghapus QR Code milik user yang login.
 */
export async function deleteQRCode(id: string): Promise<{ error: Error | null }> {
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
