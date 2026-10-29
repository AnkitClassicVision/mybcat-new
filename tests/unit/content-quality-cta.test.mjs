import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveCTAPatterns } from '../../scripts/validators/validate-content-quality.js';

const config = {
  ctaPatterns: ['/contact/'],
  ctaPatternsByFunnel: {
    service: ['/contact/'],
    acquisition: ['/optometry-practice-transitions/'],
  },
};

test('acquisition posts use only the confidential transition CTA', () => {
  assert.deepEqual(
    resolveCTAPatterns({ funnel: 'acquisition' }, config),
    ['/optometry-practice-transitions/'],
  );
});

test('service and legacy posts use the native contact CTA pattern', () => {
  assert.deepEqual(
    resolveCTAPatterns({ funnel: 'service' }, config),
    ['/contact/'],
  );
  assert.deepEqual(resolveCTAPatterns({}, config), config.ctaPatterns);
});

test('production service CTA rules accept the existing discovery booking destination', async () => {
  const { readFileSync } = await import('node:fs');
  const production = JSON.parse(readFileSync(new URL('../../scripts/config/content-quality-rules.json', import.meta.url)));
  const booking = 'https://hubspot.mybcat.com/meetings/ankit98/mybcat-discovery-call';
  assert.ok(resolveCTAPatterns({}, production).includes(booking));
  assert.ok(resolveCTAPatterns({ funnel: 'service' }, production).includes(booking));
  assert.deepEqual(resolveCTAPatterns({ funnel: 'acquisition' }, production), ['/optometry-practice-transitions/']);
  assert.equal(production.thresholds.minExternalCitations, 2);
  assert.equal(production.thresholds.minInternalLinks, 5);
  assert.equal(production.thresholds.minWordCount, 1500);
});
