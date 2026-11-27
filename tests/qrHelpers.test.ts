import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUrl,
  validateUrl,
  sanitizeExternalUrl,
  extractDisplayHost,
  validateUrlQRForm,
  resolveUrlQRPayload,
  checkQRScannability,
  validateLogoFileMeta,
  generateShortCode,
} from '../src/lib/qrHelpers.ts';
import { DEFAULT_QR_STYLE, INITIAL_URL_CONTENT } from '../src/types/qrGenerator.ts';

test('URL normalization, domain validation, and XSS blocking', () => {
  assert.equal(normalizeUrl('www.mywebsite.com'), 'https://www.mywebsite.com');
  assert.equal(normalizeUrl('https://adlzil.engineer/cv'), 'https://adlzil.engineer/cv');
  assert.equal(validateUrl('adlzil.engineer'), true);
  assert.equal(validateUrl('https://freebuildcv.tech/builder'), true);
  assert.equal(validateUrl('not a valid url'), false);
  assert.equal(validateUrl(''), false);
  assert.equal(sanitizeExternalUrl('javascript:alert(1)'), '#');
  assert.equal(sanitizeExternalUrl('vbscript:msgbox(1)'), '#');
  assert.equal(sanitizeExternalUrl('data:text/html,<script>alert(1)</script>'), '#');
  assert.equal(sanitizeExternalUrl('adlzil.engineer'), 'https://adlzil.engineer');
});

test('extractDisplayHost returns clean domain label for phone mockup bar', () => {
  assert.equal(extractDisplayHost('https://www.mywebsite.com/promo'), 'www.mywebsite.com/promo');
  assert.equal(extractDisplayHost('adlzil.engineer'), 'adlzil.engineer');
  assert.equal(extractDisplayHost(''), 'www.mywebsite.com');
});

test('validateUrlQRForm catches empty/invalid URL and short password when enabled', () => {
  const emptyRes = validateUrlQRForm(INITIAL_URL_CONTENT, { enabled: false, password: '' });
  assert.equal(emptyRes.isValid, false);
  assert.ok(emptyRes.errors.url);

  const badUrlRes = validateUrlQRForm(
    { type: 'url', url: 'javascript:alert(1)', qrName: 'Test' },
    { enabled: false, password: '' }
  );
  assert.equal(badUrlRes.isValid, false);

  const shortPassRes = validateUrlQRForm(
    { type: 'url', url: 'adlzil.engineer', qrName: 'Portofolio' },
    { enabled: true, password: '12', alreadyProtected: false }
  );
  assert.equal(shortPassRes.isValid, false);
  assert.ok(shortPassRes.errors.password);

  const existingProtectedRes = validateUrlQRForm(
    { type: 'url', url: 'adlzil.engineer', qrName: 'Portofolio' },
    { enabled: true, password: '', alreadyProtected: true }
  );
  assert.equal(existingProtectedRes.isValid, true);
});

test('resolveUrlQRPayload always encodes dynamic /q/:shortCode gate URL', () => {
  assert.equal(
    resolveUrlQRPayload('https://www.freebuildcv.tech', 'AbCd1234'),
    'https://www.freebuildcv.tech/q/AbCd1234'
  );
  assert.equal(
    resolveUrlQRPayload('http://localhost:5173/', ''),
    'http://localhost:5173/q/preview'
  );
});

test('Scannability detects low contrast and inverted colors', () => {
  const lowContrast = { ...DEFAULT_QR_STYLE, dotColor: '#d4d4d8', bgColor: '#ffffff' };
  const check1 = checkQRScannability(lowContrast);
  assert.equal(check1.isLowContrast, true);
  assert.ok(check1.warnings.length > 0);

  const inverted = { ...DEFAULT_QR_STYLE, dotColor: '#ffffff', bgColor: '#000000' };
  const check2 = checkQRScannability(inverted);
  assert.equal(check2.isInverted, true);
});

test('Logo file validator accepts PNG/JPG/SVG <= 5MB and rejects >5MB or PDF', () => {
  assert.equal(validateLogoFileMeta({ size: 1_200_000, type: 'image/png' }).valid, true);
  assert.equal(validateLogoFileMeta({ size: 250_000, type: 'image/svg+xml' }).valid, true);
  assert.equal(validateLogoFileMeta({ size: 5_500_000, type: 'image/jpeg' }).valid, false);
  assert.equal(validateLogoFileMeta({ size: 100_000, type: 'application/pdf' }).valid, false);
});

test('generateShortCode returns alphanumeric 8-char tokens', () => {
  const code = generateShortCode(8);
  assert.match(code, /^[A-Za-z0-9]{8}$/);
});
