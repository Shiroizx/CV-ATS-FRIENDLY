import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeUrl,
  validateUrl,
  sanitizeExternalUrl,
  extractDisplayHost,
  validateUrlQRForm,
  validateVCardQRForm,
  validateBusinessQRForm,
  validateQRForm,
  formatBusinessTimeLabel,
  resolveBusinessScheduleRows,
  getQRDisplayTitle,
  generateVCardVcfString,
  resolveUrlQRPayload,
  resolveQRViewerLink,
  resolveVCardBrutalismPalette,
  pickAccessibleInkOnColor,
  hasLowColorContrast,
  resolveVCardPreviewChrome,
  resolveBusinessPreviewChrome,
  checkQRScannability,
  validateLogoFileMeta,
  generateShortCode,
  computeVCardImageCropLayout,
  generateVCardBannerWavePaths,
  normalizeVCardSkills,
  sanitizeSubdomainInput,
  validateSubdomainSlug,
  generateDomainSuggestions,
  extractQRSubdomainFromHostname,
  extractQRHostTargetFromHostname,
  normalizePublicQRDomain,
  isAllowedPartnerReturnUrl,
  getPartnerAccountMeta,
  isFreePartnerVCardRule,
} from '../src/lib/qrHelpers.ts';
import {
  DEFAULT_QR_STYLE,
  DEFAULT_VCARD_BRUTALISM_PALETTE,
  INITIAL_URL_CONTENT,
  INITIAL_VCARD_CONTENT,
  INITIAL_BUSINESS_CONTENT,
} from '../src/types/qrGenerator.ts';

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

test('validateVCardQRForm enforces fullName and validates optional website/email/socials', () => {
  const emptyRes = validateVCardQRForm(INITIAL_VCARD_CONTENT, { enabled: false, password: '' });
  assert.equal(emptyRes.isValid, false);
  assert.ok(emptyRes.errors.fullName);

  const validRes = validateVCardQRForm(
    {
      ...INITIAL_VCARD_CONTENT,
      fullName: 'Adlildzil Arifah',
      website: 'adlzil.engineer',
      emails: [{ id: 'e1', label: 'Lainnya', email: '19230602@bsi.ac.id' }],
    },
    { enabled: false, password: '' }
  );
  assert.equal(validRes.isValid, true);

  const badEmailRes = validateVCardQRForm(
    {
      ...INITIAL_VCARD_CONTENT,
      fullName: 'Adlildzil Arifah',
      emails: [{ id: 'e1', label: 'Kerja', email: 'bukan-email' }],
    },
    { enabled: false, password: '' }
  );
  assert.equal(badEmailRes.isValid, false);
  assert.ok(badEmailRes.errors.emails);
});

test('generateVCardVcfString produces standard vCard 3.0 payload', () => {
  const vcf = generateVCardVcfString({
    ...INITIAL_VCARD_CONTENT,
    fullName: 'Adlildzil Arifah',
    phones: [{ id: 'p1', label: 'Cara Kerja', number: '+6285156693650' }],
    emails: [{ id: 'e1', label: 'Kerja', email: 'test@example.com' }],
    company: 'nara institute',
    profession: 'Software Engineer',
    website: 'adlzil.engineer',
    street: 'Muncang',
    city: 'Jakarta Utara',
    state: 'DKI Jakarta',
    postalCode: '14270',
    country: 'Indonesia',
    summary: 'Halo semua',
  });
  assert.match(vcf, /^BEGIN:VCARD/);
  assert.match(vcf, /VERSION:3\.0/);
  assert.match(vcf, /FN:Adlildzil Arifah/);
  assert.match(vcf, /ORG:nara institute/);
  assert.match(vcf, /TITLE:Software Engineer/);
  assert.match(vcf, /TEL;TYPE=WORK,VOICE:\+6285156693650/);
  assert.match(vcf, /EMAIL;TYPE=WORK:test@example\.com/);
  assert.match(vcf, /URL:https:\/\/adlzil\.engineer/);
  assert.match(vcf, /ADR;TYPE=WORK:;;Muncang;Jakarta Utara;DKI Jakarta;14270;Indonesia/);
  assert.match(vcf, /END:VCARD$/);
});

test('computeVCardImageCropLayout keeps preview and canvas crop panning invariant across sizes', () => {
  const widePreview = computeVCardImageCropLayout({
    srcW: 1600,
    srcH: 900,
    frameW: 264,
    frameH: 165,
    zoom: 1,
    rotateDeg: 0,
    offsetX: 0.5,
  });
  const wideCanvas = computeVCardImageCropLayout({
    srcW: 1600,
    srcH: 900,
    frameW: 440,
    frameH: 275,
    zoom: 1,
    rotateDeg: 0,
    offsetX: widePreview.clampedOffsetX,
  });
  assert.ok(widePreview.maxOffsetX > 0.05);
  assert.equal(widePreview.maxOffsetY, 0);
  assert.ok(Math.abs(widePreview.clampedOffsetX - wideCanvas.clampedOffsetX) < 1e-6);

  const squareZoomed = computeVCardImageCropLayout({
    srcW: 1200,
    srcH: 1200,
    frameW: 220,
    frameH: 220,
    zoom: 2,
    rotateDeg: 90,
    offsetX: -0.25,
    offsetY: 2.5,
  });
  assert.ok(Math.abs(squareZoomed.maxOffsetX - 0.5) < 1e-6);
  assert.equal(squareZoomed.clampedOffsetX, -0.25);
  assert.ok(Math.abs(squareZoomed.clampedOffsetY - 0.5) < 1e-6);
  assert.equal(squareZoomed.normalizedRot, 90);
});

test('generateVCardBannerWavePaths is deterministic per seed and supports all shapes & mirroring', () => {
  const shapes = ['smooth', 'organic', 'layered', 'arch', 'sharp'] as const;
  for (const shape of shapes) {
    const a = generateVCardBannerWavePaths({
      shape,
      complexity: 3,
      height: 48,
      seed: 777,
    });
    const b = generateVCardBannerWavePaths({
      shape,
      complexity: 3,
      height: 48,
      seed: 777,
    });
    assert.deepEqual(a, b);
    assert.match(a.foregroundPath, /^M 0 /);
    assert.match(a.foregroundPath, /L 400 100 L 0 100 Z$/);
    if (shape === 'layered') {
      assert.equal(a.backdropLayers.length, 2);
    } else {
      assert.equal(a.backdropLayers.length, 0);
    }
  }

  const seedA = generateVCardBannerWavePaths({
    shape: 'organic',
    complexity: 4,
    height: 54,
    seed: 111,
  });
  const seedB = generateVCardBannerWavePaths({
    shape: 'organic',
    complexity: 4,
    height: 54,
    seed: 999,
  });
  const flippedA = generateVCardBannerWavePaths({
    shape: 'organic',
    complexity: 4,
    height: 54,
    seed: 111,
    flipX: true,
  });
  assert.notEqual(seedA.foregroundPath, seedB.foregroundPath);
  assert.notEqual(seedA.foregroundPath, flippedA.foregroundPath);
});

test('normalizeVCardSkills trims, deduplicates case-insensitively, and enforces caps', () => {
  const result = normalizeVCardSkills([
    '  React ',
    'react',
    '',
    '   ',
    'TypeScript',
    'VeryLongSkillNameExceedingThirtyTwoCharsHere',
    'UI/UX',
  ]);
  assert.deepEqual(result, [
    'React',
    'TypeScript',
    'VeryLongSkillNameExceedingThirty',
    'UI/UX',
  ]);
  assert.equal(normalizeVCardSkills(undefined).length, 0);
});

test('subdomain normalization, validation, suggestions, and hostname parsing work accurately', () => {
  assert.equal(sanitizeSubdomainInput('  Adlildzil Arifah!! '), 'adlildzil-arifah');
  assert.equal(validateSubdomainSlug('adlzil').valid, true);
  assert.equal(validateSubdomainSlug('ab').valid, false);
  assert.equal(validateSubdomainSlug('www').valid, false);
  assert.equal(validateSubdomainSlug('admin').valid, false);
  assert.equal(validateSubdomainSlug('-adlzil').valid, false);

  const suggestions = generateDomainSuggestions(
    {
      ...INITIAL_VCARD_CONTENT,
      fullName: 'Adlildzil Arifah',
      company: 'Nara Institute',
    },
    'LL52NTBx'
  );
  assert.equal(suggestions.length, 4);
  assert.equal(new Set(suggestions).size, 4);
  for (const s of suggestions) {
    assert.equal(validateSubdomainSlug(s).valid, true);
  }

  const fallbackSuggestions = generateDomainSuggestions(INITIAL_VCARD_CONTENT, 'LL52NTBx');
  assert.equal(fallbackSuggestions.length, 4);
  assert.equal(new Set(fallbackSuggestions).size, 4);

  assert.equal(extractQRSubdomainFromHostname('adlzil.freebuildcv.tech'), 'adlzil');
  assert.equal(extractQRSubdomainFromHostname('ADLZIL.freebuildcv.tech'), 'adlzil');
  assert.equal(extractQRSubdomainFromHostname('www.freebuildcv.tech'), null);
  assert.equal(extractQRSubdomainFromHostname('freebuildcv.tech'), null);
  assert.equal(extractQRSubdomainFromHostname('localhost:5173'), null);
  assert.equal(
    resolveUrlQRPayload('https://www.freebuildcv.tech', 'adlzil', 'custom'),
    'https://adlzil.freebuildcv.tech'
  );
  assert.equal(
    resolveUrlQRPayload('http://localhost:5173', 'adlzil', 'suggested'),
    'https://adlzil.freebuildcv.tech'
  );
  assert.equal(
    resolveQRViewerLink('http://192.168.137.1:5173', 'coffenusa', 'suggested'),
    'http://192.168.137.1:5173/q/coffenusa'
  );
  assert.equal(
    resolveQRViewerLink('http://localhost:5173', 'coffenusa', 'custom'),
    'http://localhost:5173/q/coffenusa'
  );
  assert.equal(
    resolveQRViewerLink('https://www.freebuildcv.tech', 'coffenusa', 'suggested'),
    'https://coffenusa.freebuildcv.tech'
  );

  // Multi-domain partner (*.narainstitute.net)
  assert.deepEqual(extractQRHostTargetFromHostname('asep.narainstitute.net'), {
    shortCode: 'asep',
    domain: 'narainstitute.net',
  });
  assert.deepEqual(extractQRHostTargetFromHostname('ADLZIL.freebuildcv.tech'), {
    shortCode: 'adlzil',
    domain: 'freebuildcv.tech',
  });
  assert.equal(extractQRHostTargetFromHostname('narainstitute.net'), null);
  assert.equal(extractQRHostTargetFromHostname('www.narainstitute.net'), null);
  assert.equal(extractQRSubdomainFromHostname('asep.narainstitute.net'), 'asep');
  assert.equal(validateSubdomainSlug('cpanel').valid, false);
  assert.equal(validateSubdomainSlug('webmail').valid, false);
  assert.equal(validateSubdomainSlug('autodiscover').valid, false);
  assert.equal(normalizePublicQRDomain('https://NaraInstitute.NET/'), 'narainstitute.net');
  assert.equal(normalizePublicQRDomain(''), 'freebuildcv.tech');
  assert.equal(
    resolveUrlQRPayload('https://www.freebuildcv.tech', 'asep', 'custom', 'narainstitute.net'),
    'https://asep.narainstitute.net'
  );
  assert.equal(
    resolveQRViewerLink('https://www.freebuildcv.tech', 'asep', 'custom', 'narainstitute.net'),
    'https://asep.narainstitute.net'
  );
  assert.equal(
    resolveQRViewerLink('http://localhost:5173', 'asep', 'custom', 'narainstitute.net'),
    'http://localhost:5173/q/asep?domain=narainstitute.net'
  );
  assert.equal(
    isAllowedPartnerReturnUrl('https://narainstitute.net/sales/vcard/callback', 'narainstitute.net'),
    true
  );
  assert.equal(
    isAllowedPartnerReturnUrl('http://localhost:8000/admin/hub/vcard/callback', 'narainstitute.net'),
    true
  );
  assert.equal(
    isAllowedPartnerReturnUrl('https://evil-phish.com/steal', 'narainstitute.net'),
    false
  );
  assert.equal(
    isAllowedPartnerReturnUrl('javascript:alert(1)', 'narainstitute.net'),
    false
  );

  // Partner credit policy: ONLY vCard on partner domain is free; URL/Business & freebuildcv.tech stay metered
  assert.equal(isFreePartnerVCardRule('vcard', 'narainstitute.net', true), true);
  assert.equal(isFreePartnerVCardRule('vcard', 'freebuildcv.tech', true), false);
  assert.equal(isFreePartnerVCardRule('url', 'narainstitute.net', true), false);
  assert.equal(isFreePartnerVCardRule('business', 'narainstitute.net', true), false);
  assert.equal(isFreePartnerVCardRule('vcard', 'narainstitute.net', false), false);

  const partnerMeta = getPartnerAccountMeta({
    is_partner_account: true,
    partner_org: 'narainstitute',
    partner_org_name: 'Nara Institute',
    partner_domain: 'narainstitute.net',
    laravel_user_id: '12',
    partner_switch_url: 'https://narainstitute.net/admin/hub/vcard/switch-account',
  });
  assert.equal(partnerMeta?.isPartner, true);
  assert.equal(partnerMeta?.domain, 'narainstitute.net');
  assert.equal(
    partnerMeta?.switchAccountUrl,
    'https://narainstitute.net/admin/hub/vcard/switch-account'
  );
  assert.equal(getPartnerAccountMeta({ full_name: 'Regular User' }), null);
});

test('validateBusinessQRForm enforces companyName and checks CTA buttons, website, email, and socials', () => {
  const emptyRes = validateBusinessQRForm(INITIAL_BUSINESS_CONTENT, {
    enabled: false,
    password: '',
  });
  assert.equal(emptyRes.isValid, false);
  assert.ok(emptyRes.errors.companyName);

  const badButtonRes = validateBusinessQRForm(
    {
      ...INITIAL_BUSINESS_CONTENT,
      companyName: 'Kopi Nusantara',
      buttons: [{ id: 'b1', label: 'Menu Spesial', url: 'tidak-valid' }],
    },
    { enabled: false, password: '' }
  );
  assert.equal(badButtonRes.isValid, false);
  assert.ok(badButtonRes.errors['button_url_b1']);

  const partialLabelRes = validateBusinessQRForm(
    {
      ...INITIAL_BUSINESS_CONTENT,
      companyName: 'Kopi Nusantara',
      buttons: [{ id: 'b1', label: '', url: 'https://kopinusantara.id' }],
    },
    { enabled: false, password: '' }
  );
  assert.equal(partialLabelRes.isValid, false);
  assert.ok(partialLabelRes.errors['button_label_b1']);

  const validRes = validateQRForm(
    {
      ...INITIAL_BUSINESS_CONTENT,
      companyName: 'Kopi Nusantara',
      buttons: [{ id: 'b1', label: 'Pesan Sekarang', url: 'kopinusantara.id/order' }],
      website: 'kopinusantara.id',
      emails: [{ id: 'e1', label: 'Kerja', email: 'halo@kopinusantara.id' }],
    },
    { enabled: false, password: '' }
  );
  assert.equal(validRes.isValid, true);
});

test('formatBusinessTimeLabel and resolveBusinessScheduleRows handle 24h, ampm, and weekday bulk mode', () => {
  assert.equal(formatBusinessTimeLabel('13:00', '24h'), '13:00');
  assert.equal(formatBusinessTimeLabel('13:00', 'ampm'), '01:00 PM');
  assert.equal(formatBusinessTimeLabel('00:05', 'ampm'), '12:05 AM');
  assert.equal(formatBusinessTimeLabel('09:30', 'ampm'), '09:30 AM');

  const rows = resolveBusinessScheduleRows({
    ...INITIAL_BUSINESS_CONTENT,
    scheduleMode: 'ampm',
    useWeekdayGroup: true,
    weekdayGroupIntervals: [{ id: 'wd-1', start: '13:00', end: '23:00' }],
    days: {
      ...INITIAL_BUSINESS_CONTENT.days,
      sat: { enabled: true, intervals: [{ id: 'sat-1', start: '10:00', end: '20:00' }] },
      sun: { enabled: false, intervals: [{ id: 'sun-1', start: '10:00', end: '18:00' }] },
    },
  });

  assert.equal(rows.length, 7);
  assert.equal(rows[0].enabled, true);
  assert.deepEqual(rows[0].formattedIntervals, ['01:00 PM - 11:00 PM']);
  assert.equal(rows[4].enabled, true);
  assert.deepEqual(rows[4].formattedIntervals, ['01:00 PM - 11:00 PM']);
  assert.equal(rows[5].enabled, true);
  assert.deepEqual(rows[5].formattedIntervals, ['10:00 AM - 08:00 PM']);
  assert.equal(rows[6].enabled, false);
});

test('getQRDisplayTitle and generateDomainSuggestions support business QR content', () => {
  const business = {
    ...INITIAL_BUSINESS_CONTENT,
    companyName: 'Kopi Nusantara',
    headline: 'Artisan Coffee Roastery',
  };
  assert.equal(getQRDisplayTitle(business), 'Kopi Nusantara');
  assert.equal(getQRDisplayTitle({ ...business, qrName: 'QR Outlet Pusat' }), 'QR Outlet Pusat');

  const suggestions = generateDomainSuggestions(business, 'AB12CD34');
  assert.equal(suggestions.length, 4);
  assert.equal(suggestions[0], 'kopi');
  for (const s of suggestions) {
    assert.equal(validateSubdomainSlug(s).valid, true);
  }
});

test('resolveVCardBrutalismPalette normalizes valid hexes and falls back safely', () => {
  assert.deepEqual(
    resolveVCardBrutalismPalette(undefined),
    DEFAULT_VCARD_BRUTALISM_PALETTE
  );
  assert.deepEqual(
    resolveVCardBrutalismPalette({ primary: 'not-hex', secondary: '#112233' }),
    {
      ...DEFAULT_VCARD_BRUTALISM_PALETTE,
      secondary: '#112233',
    }
  );
});

test('pickAccessibleInkOnColor and hasLowColorContrast enforce readable WCAG AA contrast', () => {
  assert.equal(pickAccessibleInkOnColor('#FDC800', '#1C293C', '#FFFFFF'), '#1C293C');
  assert.equal(pickAccessibleInkOnColor('#432DD7', '#1C293C', '#FFFFFF'), '#FFFFFF');
  assert.equal(hasLowColorContrast('#FBFBF9', '#FFFFFF'), true);
  assert.equal(hasLowColorContrast('#FBFBF9', '#1C293C'), false);
});

test('resolveVCardPreviewChrome handles default vs brutalism designStyle cleanly', () => {
  const defaultChrome = resolveVCardPreviewChrome({
    ...INITIAL_VCARD_CONTENT,
    designStyle: 'default',
    primaryColor: '#6594FF',
    secondaryColor: '#FFFFFF',
  });
  assert.equal(defaultChrome.statusBarBg, '#6594FF');
  assert.equal(defaultChrome.bottomBg, '#FFFFFF');
  assert.equal(defaultChrome.overlayStatusBar, false);

  const brutalChrome = resolveVCardPreviewChrome({
    ...INITIAL_VCARD_CONTENT,
    designStyle: 'brutalism',
    brutalismPalette: {
      primary: '#FDC800',
      secondary: '#432DD7',
      surface: '#FBFBF9',
      text: '#1C293C',
    },
  });
  assert.equal(brutalChrome.statusBarBg, '#FDC800');
  assert.equal(brutalChrome.bottomBg, '#FBFBF9');
  assert.equal(brutalChrome.overlayStatusBar, false);
  assert.equal(brutalChrome.statusBarLightText, false);
});

test('resolveBusinessPreviewChrome handles default vs brutalism designStyle cleanly', () => {
  const defaultBizChrome = resolveBusinessPreviewChrome({
    ...INITIAL_BUSINESS_CONTENT,
    designStyle: 'default',
    primaryColor: '#ECEDF1',
  });
  assert.equal(defaultBizChrome.statusBarBg, '#ECEDF1');
  assert.equal(defaultBizChrome.bottomBg, '#F8FAFC');
  assert.equal(defaultBizChrome.statusBarLightText, false);

  const brutalBizChrome = resolveBusinessPreviewChrome({
    ...INITIAL_BUSINESS_CONTENT,
    designStyle: 'brutalism',
    brutalismPalette: {
      primary: '#432DD7',
      secondary: '#FDC800',
      surface: '#FBFBF9',
      text: '#1C293C',
    },
  });
  assert.equal(brutalBizChrome.statusBarBg, '#432DD7');
  assert.equal(brutalBizChrome.bottomBg, '#FBFBF9');
  assert.equal(brutalBizChrome.statusBarLightText, true);
});
