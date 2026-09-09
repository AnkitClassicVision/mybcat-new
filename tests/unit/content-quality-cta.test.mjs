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
