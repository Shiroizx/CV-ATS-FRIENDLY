import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';
import {
  base64UrlEncode,
  extractStorageImagePathsFromQR,
  signWebhookBody,
  verifyPartnerJwt,
  verifyWebhookSignature,
} from '../api/_partnerAuth.ts';

const TEST_SECRET = 'unit-test-secret-key-for-vcard-partner-hmac-64chars';

function mintJwt(payload: Record<string, unknown>, secret = TEST_SECRET): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const sig = base64UrlEncode(
    crypto.createHmac('sha256', secret).update(`${header}.${body}`, 'utf8').digest()
  );
  return `${header}.${body}.${sig}`;
}

test('verifyPartnerJwt validates valid HS256 launch & logout tokens and rejects tampered/expired tokens', () => {
  const now = Math.floor(Date.now() / 1000);
  const validToken = mintJwt({
    action: 'launch',
    domain: 'narainstitute.net',
    org_slug: 'narainstitute',
    external_user_id: '42',
    email: 'dasep@narainstitute.net',
    name: 'Asep Hidayat',
    iat: now,
    exp: now + 600,
  });

  const ok = verifyPartnerJwt(validToken, TEST_SECRET);
  assert.equal(ok.valid, true);
  if (ok.valid) {
    assert.equal(ok.payload.action, 'launch');
    assert.equal(ok.payload.email, 'dasep@narainstitute.net');
    assert.equal(ok.payload.external_user_id, '42');
  }

  const tampered = `${validToken.slice(0, -3)}xxx`;
  const badSig = verifyPartnerJwt(tampered, TEST_SECRET);
  assert.equal(badSig.valid, false);

  const expiredToken = mintJwt({
    action: 'partner_logout',
    email: 'dasep@narainstitute.net',
    exp: now - 5,
  });
  const expired = verifyPartnerJwt(expiredToken, TEST_SECRET);
  assert.equal(expired.valid, false);
});

test('signWebhookBody and verifyWebhookSignature match exact raw payload HMAC-SHA256 hex', () => {
  const rawBody = JSON.stringify({
    event: 'saved',
    org_slug: 'narainstitute',
    slug: 'asep',
    domain: 'narainstitute.net',
    timestamp: 1795875000,
  });

  const sig = signWebhookBody(rawBody, TEST_SECRET);
  assert.equal(sig.length, 64);
  assert.equal(verifyWebhookSignature(rawBody, sig, TEST_SECRET), true);
  assert.equal(verifyWebhookSignature(rawBody, sig.toUpperCase(), TEST_SECRET), true);
  assert.equal(verifyWebhookSignature(`${rawBody} `, sig, TEST_SECRET), false);
  assert.equal(verifyWebhookSignature(rawBody, 'invalid', TEST_SECRET), false);
  assert.equal(verifyWebhookSignature(rawBody, null, TEST_SECRET), false);
});

test('extractStorageImagePathsFromQR extracts only Supabase portfolio-images paths safely', () => {
  const paths = extractStorageImagePathsFromQR(
    {
      avatarDataUrl:
        'https://demo.supabase.co/storage/v1/object/public/portfolio-images/users/123/avatar.webp?t=123',
      bannerDataUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
      splashDataUrl:
        'https://demo.supabase.co/storage/v1/object/public/portfolio-images/users/123/splash%201.png',
    },
    {
      logoDataUrl:
        'https://demo.supabase.co/storage/v1/object/public/portfolio-images/../secret.png',
    }
  );

  assert.deepEqual(paths, ['users/123/avatar.webp', 'users/123/splash 1.png']);
});
