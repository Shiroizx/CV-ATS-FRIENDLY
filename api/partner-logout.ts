import { jsonResponse, verifyPartnerJwt } from './_partnerAuth.js';

/**
 * Memverifikasi one-time signed logout_token dari halaman Konfirmasi Ganti Akun di Dashboard Nara.
 * Hanya setelah token ini tervalidasi di server, akun partner diizinkan logout dari FreeBuild CV.
 */
export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json().catch(() => null)) as {
      token?: string;
    } | null;
    const token = typeof body?.token === 'string' ? body.token.trim() : '';

    if (!token) {
      return jsonResponse({ ok: false, error: 'Token konfirmasi logout tidak ditemukan.' }, 400);
    }

    const verified = verifyPartnerJwt(token);
    if (!verified.valid) {
      return jsonResponse({ ok: false, error: verified.error }, 401);
    }

    const payload = verified.payload;
    if (payload.action !== 'partner_logout') {
      return jsonResponse(
        { ok: false, error: 'Token ini bukan token konfirmasi ganti akun.' },
        400
      );
    }

    return jsonResponse({
      ok: true,
      switchConfirmed: true,
      email: (payload.email || '').trim().toLowerCase(),
      orgName: payload.org_name || 'Nara Institute',
      orgSlug: payload.org_slug || 'narainstitute',
    });
  } catch (err) {
    return jsonResponse(
      {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : 'Gagal memverifikasi konfirmasi ganti akun.',
      },
      500
    );
  }
}

export async function GET(): Promise<Response> {
  return jsonResponse({ ok: false, error: 'Method Not Allowed' }, 405);
}
