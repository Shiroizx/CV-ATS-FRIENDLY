import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeXml,
  composeFramedSvg,
  composeFrameBackdropSvg,
  QR_FRAME_PRESETS,
} from '../src/lib/qrFrameSvg.ts';
import { DEFAULT_QR_STYLE } from '../src/types/qrGenerator.ts';

const MOCK_QR_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 300"><rect width="300" height="300" fill="#fff"/><image href="data:image/png;base64,AAA" xlink:href="data:image/png;base64,AAA" x="100" y="100" width="100" height="100"/></svg>';

test('escapeXml neutralizes XML metacharacters in CTA labels', () => {
  assert.equal(escapeXml('Kopi & Kue <2026> "Top"'), 'Kopi &amp; Kue &lt;2026&gt; &quot;Top&quot;');
});

test('QR_FRAME_PRESETS exposes all 12 frame presets', () => {
  assert.equal(QR_FRAME_PRESETS.length, 12);
});

test('composeFramedSvg preserves xmlns:xlink namespace when logo xlink:href is present', () => {
  const noneRes = composeFramedSvg(MOCK_QR_SVG, { ...DEFAULT_QR_STYLE, frameType: 'none' });
  assert.equal(noneRes.width, 300);
  assert.equal(noneRes.height, 300);
  assert.match(noneRes.svg, /xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/);

  const framedRes = composeFramedSvg(MOCK_QR_SVG, { ...DEFAULT_QR_STYLE, frameType: 'pill-bottom' });
  assert.match(framedRes.svg, /xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/);
});

test('composeFramedSvg composes all framed types safely with escaped CTA text', () => {
  for (const preset of QR_FRAME_PRESETS) {
    if (preset.id === 'none') continue;
    const res = composeFramedSvg(MOCK_QR_SVG, {
      ...DEFAULT_QR_STYLE,
      frameType: preset.id,
      frameText: 'Scan & Cek <2026>',
      frameColor: '#000000',
      frameBgColor: '#FFFFFF',
      frameTextColor: '#FFFFFF',
    });
    assert.ok(res.width >= 300);
    assert.ok(res.height >= 300);
    assert.match(res.svg, /Scan &amp; Cek &lt;2026&gt;/);
    assert.ok(!res.svg.includes('<2026>'));

    const backdrop = composeFrameBackdropSvg({
      ...DEFAULT_QR_STYLE,
      frameType: preset.id,
      frameText: 'Scan & Cek <2026>',
    });
    assert.equal(backdrop.layout.width, res.width);
    assert.equal(backdrop.layout.height, res.height);
  }
});
