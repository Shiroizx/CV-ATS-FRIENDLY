import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface PartnerJwtPayload {
  iss?: string;
  iat?: number;
  exp?: number;
  action?: 'launch' | 'partner_logout' | 'delete_qr';
  domain?: string;
  org_slug?: string;
  org_name?: string;
  external_user_id?: string;
  role?: string;
  name?: string;
  email?: string;
  phone?: string;
  position?: string;
  company?: string;
  website?: string;
  suggested_slug?: string;
  edit_qr_id?: string;
  create_new?: boolean;
  return_url?: string;
  callback_state?: string;
  dashboard_url?: string;
  switch_account_url?: string;
  qr_id?: string;
  slug?: string;
}

export function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function base64UrlDecodeToString(input: string): string {
  let normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const rem = normalized.length % 4;
  if (rem === 2) normalized += '==';
  else if (rem === 3) normalized += '=';
  return Buffer.from(normalized, 'base64').toString('utf8');
}

export function getPartnerSecret(): string {
  return (process.env.VCARD_PARTNER_SECRET || '').trim();
}

export function getSupabaseAdminConfig(): { url: string; serviceKey: string } {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    ''
  ).trim();
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return { url, serviceKey };
}

export function createSupabaseAdmin(): SupabaseClient | null {
  const { url, serviceKey } = getSupabaseAdminConfig();
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Memverifikasi HS256 JWT (HMAC-SHA256) yang diterbitkan Laravel VCardPartnerTokenService.
 */
export function verifyPartnerJwt(
  token: string,
  secretOverride?: string
): { valid: true; payload: PartnerJwtPayload } | { valid: false; error: string } {
  const secret = (secretOverride ?? getPartnerSecret()).trim();
  if (secret.length < 16) {
    return {
      valid: false,
      error: 'VCARD_PARTNER_SECRET belum dikonfigurasi di server Vercel.',
    };
  }

  const trimmed = (token || '').trim();
  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Format token partner tidak valid.' };
  }

  const [headerB64, payloadB64, sigB64] = parts;
  const expectedSig = base64UrlEncode(
    crypto
      .createHmac('sha256', secret)
      .update(`${headerB64}.${payloadB64}`, 'utf8')
      .digest()
  );

  const a = Buffer.from(expectedSig, 'utf8');
  const b = Buffer.from(sigB64, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { valid: false, error: 'Tanda tangan token partner tidak valid.' };
  }

  let payload: PartnerJwtPayload;
  try {
    payload = JSON.parse(base64UrlDecodeToString(payloadB64)) as PartnerJwtPayload;
  } catch {
    return { valid: false, error: 'Payload token partner rusak.' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== 'number' || payload.exp < now) {
    return {
      valid: false,
      error: 'Sesi tautan partner sudah kedaluwarsa. Buka ulang tombol dari Dashboard Nara.',
    };
  }

  return { valid: true, payload };
}

export function signWebhookBody(rawBody: string, secretOverride?: string): string {
  const secret = (secretOverride ?? getPartnerSecret()).trim();
  return crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex');
}

export function verifyWebhookSignature(
  rawBody: string,
  providedHex: string | null,
  secretOverride?: string
): boolean {
  const secret = (secretOverride ?? getPartnerSecret()).trim();
  if (!secret || secret.length < 16 || !providedHex) return false;
  const expected = signWebhookBody(rawBody, secret);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(providedHex.trim().toLowerCase(), 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Mengambil semua path file gambar yang tersimpan di Supabase Storage bucket `portfolio-images`
 * dari content_data dan style_options QR/vCard/Business agar ikut terhapus bersih saat QR dihapus.
 */
export function extractStorageImagePathsFromQR(
  contentData: Record<string, unknown> | null | undefined,
  styleOptions: Record<string, unknown> | null | undefined
): string[] {
  const candidates = [
    contentData?.avatarDataUrl,
    contentData?.bannerDataUrl,
    contentData?.splashDataUrl,
    contentData?.coverDataUrl,
    styleOptions?.logoDataUrl,
  ];

  const paths = new Set<string>();
  const marker = '/storage/v1/object/public/portfolio-images/';

  for (const val of candidates) {
    if (typeof val !== 'string' || !val.includes(marker)) continue;
    const parts = val.split(marker);
    if (parts.length === 2 && parts[1].trim()) {
      const cleanPath = decodeURIComponent(parts[1].split('?')[0].trim());
      if (cleanPath && !cleanPath.includes('..')) {
        paths.add(cleanPath);
      }
    }
  }

  return Array.from(paths);
}

export async function removeQRStorageImages(
  supabaseAdmin: SupabaseClient,
  contentData: Record<string, unknown> | null | undefined,
  styleOptions: Record<string, unknown> | null | undefined
): Promise<string[]> {
  const paths = extractStorageImagePathsFromQR(contentData, styleOptions);
  if (paths.length === 0) return [];

  const { error } = await supabaseAdmin.storage
    .from('portfolio-images')
    .remove(paths);

  if (error) {
    console.error('[partnerAuth] Failed removing storage images:', error.message);
    return [];
  }
  return paths;
}

export interface NaraWebhookEventPayload {
  event: 'saved' | 'deleted';
  org_slug: string;
  external_user_id?: string | null;
  email?: string | null;
  qr_id?: string | null;
  slug?: string | null;
  domain?: string | null;
  url?: string | null;
  title?: string | null;
  qr_type?: string | null;
  timestamp: number;
}

export async function notifyNaraWebhook(
  payload: NaraWebhookEventPayload
): Promise<{ sent: boolean; status?: number; error?: string }> {
  const webhookUrl = (
    process.env.NARA_WEBHOOK_URL || 'https://narainstitute.net/api/vcard/webhook-sync'
  ).trim();
  const secret = getPartnerSecret();

  if (!webhookUrl || secret.length < 16) {
    return { sent: false, error: 'Webhook URL atau secret belum dikonfigurasi.' };
  }

  const rawBody = JSON.stringify(payload);
  const signature = signWebhookBody(rawBody, secret);

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Nara-Signature': signature,
        'X-Nara-Timestamp': String(payload.timestamp),
      },
      body: rawBody,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return {
        sent: false,
        status: res.status,
        error: `Webhook HTTP ${res.status}: ${txt.slice(0, 160)}`,
      };
    }

    return { sent: true, status: res.status };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : 'Gagal menghubungi webhook Nara.',
    };
  }
}

export function jsonResponse(
  body: Record<string, unknown>,
  status = 200
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}
