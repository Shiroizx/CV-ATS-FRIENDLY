import { supabase } from './supabase';
import { generateShortCode } from './qrHelpers';
import { shrinkLogoDataUrl } from './qrExport';
import { checkAndRecordUserDownload } from './downloadCredit';
import type { DownloadCreditInfo } from './downloadCredit';
import type {
  QRContentData,
  QRStyleOptions,
  QRType,
  SavedQRCode,
} from '../types/qrGenerator';

const QR_SELECT_COLUMNS =
  'id, short_code, user_id, qr_type, title, content_data, style_options, requires_password, scan_count, is_active, created_at, updated_at';

function formatSupabaseError(err: unknown): Error {
  const msg = err instanceof Error ? err.message : String((err as { message?: string })?.message || err);
  if (/qr_codes|save_user_qr|get_public_qr/i.test(msg) && /does not exist|not found|schema cache/i.test(msg)) {
    return new Error(
      'Tabel atau fungsi QR di Supabase belum tersedia. Jalankan skrip sql_qr_codes_setup.sql di Supabase SQL Editor terlebih dahulu.'
    );
  }
  if (/duplicate key|23505|short_code/i.test(msg)) {
    return new Error('Nama domain tersebut sudah digunakan oleh QR lain. Pilih nama lain.');
  }
  return err instanceof Error ? err : new Error(msg || 'Terjadi kesalahan pada layanan database QR.');
}

export interface SaveQRParams {
  id?: string | null;
  shortCode?: string | null;
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

    let styleToPersist = params.style;
    if (params.style.logoDataUrl && params.style.logoDataUrl.length > 24000) {
      const compactLogo = await shrinkLogoDataUrl(params.style.logoDataUrl, 24000);
      styleToPersist = { ...params.style, logoDataUrl: compactLogo };
    }

    const { data, error } = await supabase.rpc('save_user_qr', {
      p_id: params.id || null,
      p_short_code: shortCode,
      p_qr_type: params.qrType,
      p_title: params.title,
      p_content_data: params.content,
      p_style_options: styleToPersist,
      p_password_enabled: params.passwordEnabled,
      p_new_password: trimmedPassword,
    });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) {
      throw new Error('Tidak ada data yang dikembalikan setelah menyimpan QR Code.');
    }

    return { data: row as SavedQRCode, error: null };
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

    const { data, error } = await supabase
      .from('qr_codes')
      .select(QR_SELECT_COLUMNS)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return { data: (data || []) as SavedQRCode[], error: null };
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

    const { data, error } = await supabase
      .from('qr_codes')
      .select(QR_SELECT_COLUMNS)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
    return { data: data as SavedQRCode, error: null };
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
  qr_type: QRType;
  title: string;
  requires_password: boolean;
  content_data: QRContentData | null;
}

/**
 * Mengambil metadata QR publik via RPC get_public_qr (aman, tanpa mengekspos URL jika terkunci sandi).
 */
export async function getPublicQRByCode(
  shortCode: string
): Promise<{ data: PublicQRResult | null; notFound?: boolean; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_public_qr', {
      p_short_code: shortCode,
    });

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
  password: string
): Promise<{ valid: boolean; content_data: QRContentData | null; title?: string; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('verify_qr_password', {
      p_short_code: shortCode,
      p_password: password,
    });

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
 * Memeriksa apakah slug subdomain / short_code masih tersedia (belum dipakai QR lain).
 */
export async function checkQRSlugAvailable(
  slug: string,
  excludeId?: string | null
): Promise<{ available: boolean; checkSkipped?: boolean; error?: string }> {
  const clean = slug.trim().toLowerCase();
  if (clean.length < 3) {
    return { available: false, error: 'Minimal 3 karakter.' };
  }

  try {
    const { data, error } = await supabase.rpc('check_qr_slug_available', {
      p_slug: clean,
      p_exclude_id: excludeId || null,
    });
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
