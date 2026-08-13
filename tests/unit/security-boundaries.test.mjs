import assert from 'node:assert/strict';
import test from 'node:test';

import { isSafeGitRevision } from '../../scripts/lib/git-diff-files.mjs';
import { isSafeSeoSlug, resolveWithin } from '../../scripts/lib/seo-path-safety.mjs';
import { normalizeCluster } from '../../scripts/validators/validate-content-quality.js';

test('git revision input cannot inject shell syntax or alter the revision range', () => {
  assert.equal(isSafeGitRevision('origin/main'), true);
  assert.equal(isSafeGitRevision('abc123'), true);
  assert.equal(isSafeGitRevision('main;touch-pwned'), false);
  assert.equal(isSafeGitRevision('main..evil'), false);
  assert.equal(isSafeGitRevision('--output=/tmp/x'), false);
});

test('SEO artifact slugs and evidence paths stay inside their approved roots', () => {
  assert.equal(isSafeSeoSlug('seller-transition-readiness'), true);
  assert.equal(isSafeSeoSlug('../../outside'), false);
  assert.equal(isSafeSeoSlug('/absolute'), false);
  assert.equal(resolveWithin('/repo', 'docs/research/evidence.md'), '/repo/docs/research/evidence.md');
  assert.equal(resolveWithin('/repo', '../outside.md'), null);
  assert.equal(resolveWithin('/repo', '/absolute.md'), null);
});

test('non-string taxonomy values fail closed instead of crashing the evaluator', () => {
  assert.equal(normalizeCluster('"transition-readiness"'), 'transition-readiness');
  assert.equal(normalizeCluster(7), null);
  assert.equal(normalizeCluster(null), null);
});
