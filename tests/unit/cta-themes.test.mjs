import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { z } from 'astro/zod';

import { CTA_THEMES } from '../../src/utils/cta-themes.mjs';

// The blog `ctaTheme` frontmatter enum and the CTA variants in src/data/blog-ctas.ts
// must stay in step: every allowed value needs a variant, and every post must use an
// allowed value. finance_service is the practice finances page's theme.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => fs.readFileSync(path.join(repoRoot, file), 'utf8');
const ctas = read('src/data/blog-ctas.ts');
const ctaThemeSchema = z.enum(CTA_THEMES);

function variantBlock(theme) {
  const start = ctas.indexOf(`\n  ${theme}: {`);
  if (start < 0) return null;
  return ctas.slice(start, ctas.indexOf('\n  },', start));
}

test('the ctaTheme schema accepts every listed theme and rejects others', () => {
  for (const theme of CTA_THEMES) assert.equal(ctaThemeSchema.safeParse(theme).success, true, theme);
  assert.equal(ctaThemeSchema.safeParse('finance_service').success, true);
  assert.equal(ctaThemeSchema.safeParse('not_a_theme').success, false);
});

test('content config uses the shared theme list', () => {
  assert.match(read('src/content/config.ts'), /ctaTheme:\s*z\.enum\(CTA_THEMES\)\.optional\(\)/);
});

test('every allowed theme has a CTA variant and a FunnelTheme member', () => {
  for (const theme of CTA_THEMES) {
    assert.ok(variantBlock(theme), `no variant for ${theme}`);
    assert.match(ctas, new RegExp(`\\|\\s*'${theme}'`), `${theme} missing from FunnelTheme`);
  }
});

test('the finance_service CTA points at the practice finances page', () => {
  const block = variantBlock('finance_service');
  assert.ok(block);
  const hrefs = [...block.matchAll(/(?:buttonHref|endButtonHref):\s*([^\n]+)/g)].map((m) => m[1]);
  assert.equal(hrefs.length, 2);
  for (const href of hrefs) assert.match(href, /optometry-practice-finances/);
  assert.doesNotMatch(block, /bookkeep|reconcil|tax|guarantee/i);
  // Like the finance page, any lower-cost line carries the company's own-estimate hedge.
  for (const line of block.match(/[^'\n]*costs less[^'\n]*/g) || []) assert.match(line, /by our own estimate/, line);
});

test('every post uses an allowed ctaTheme', () => {
  const dir = path.join(repoRoot, 'src/content/blog');
  for (const file of fs.readdirSync(dir)) {
    const match = fs.readFileSync(path.join(dir, file), 'utf8').match(/^ctaTheme:\s*([\w-]+)/m);
    if (match) assert.ok(CTA_THEMES.includes(match[1]), `${file} uses ${match[1]}`);
  }
});
