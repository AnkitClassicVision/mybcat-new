import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// The practice finances page explains how the service helps a practice's top line and
// bottom line. It must not describe bookkeeping, accounting or tax deliverables, and the
// finance posts must point at it.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => fs.readFileSync(path.join(repoRoot, file), 'utf8');
const pageFile = 'src/pages/optometry-practice-finances/index.astro';
const pagePath = '/optometry-practice-finances/';
const built = path.join(repoRoot, '.vercel/output/static');
export const financePosts = [
  'optometry-practice-finances',
  'first-year-financial-planning-optometry',
  'optometry-private-practice',
  'accounting-for-optometrists',
];

/** Words that would describe accounting deliverables or give tax advice. */
export function deliverableProblems(text) {
  const withoutScopeLine = String(text).replace(/We do not do tax work at this time\./g, '');
  const found = withoutScopeLine.match(/bookkeep|reconcil|monthly books|financial statements|\btax\b|guarantee/gi);
  return found ? [...new Set(found.map((w) => w.toLowerCase()))] : [];
}

test('the deliverable check flags bookkeeping and tax wording but allows the scope line', () => {
  assert.deepEqual(deliverableProblems('We do not do tax work at this time.'), []);
  assert.deepEqual(deliverableProblems('We keep your monthly books.'), ['monthly books']);
  assert.deepEqual(deliverableProblems('Tax planning saves money.'), ['tax']);
});

test('the page source has a short title, an FAQ, Service data and the discovery call', () => {
  const page = read(pageFile);
  const title = page.match(/^\s*title="([^"]+)"/m)?.[1];
  assert.ok(title, 'page title');
  assert.ok(title.length < 60, `title is ${title.length} characters`);
  assert.match(page, /<FAQ\b/);
  assert.match(page, /'@type': 'Service'/);
  assert.match(page, /discoveryBookingHref\('optometry-practice-finances'\)/);
  assert.match(page, /from '@data\/testimonials'/, 'quotes come from the testimonials file');
  assert.deepEqual(deliverableProblems(page), []);
});

test('the footer, llms.txt and the finance posts link to the page', () => {
  assert.match(read('src/components/Footer.astro'), /href="\/optometry-practice-finances\/"/);
  assert.match(read('public/llms.txt'), /https:\/\/mybcat\.com\/optometry-practice-finances\//);
  for (const slug of financePosts) {
    const post = read(`src/content/blog/${slug}.md`);
    assert.match(post, /\]\(\/optometry-practice-finances\/\)/, `${slug} links the page`);
    assert.match(post, /^ctaTheme:\s*finance_service\b/m, `${slug} uses the finance_service CTA`);
    assert.match(post, /\]\((?:https:\/\/mybcat\.com)?\/contact\/\)/, `${slug} keeps its contact link`);
  }
});

test('the built page has one H1, one FAQPage, Service and breadcrumb data, and is in the sitemap', (t) => {
  const file = path.join(built, 'optometry-practice-finances/index.html');
  if (!fs.existsSync(file)) {
    t.skip('no build output; run astro build first');
    return;
  }
  const html = fs.readFileSync(file, 'utf8');
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const types = JSON.stringify(blocks);
  assert.equal((types.match(/"@type":"FAQPage"/g) || []).length, 1);
  assert.match(types, /"@type":"Service"/);
  assert.match(types, /"@type":"BreadcrumbList"/);
  const title = html.match(/<title>([^<]*)<\/title>/)[1];
  assert.ok(title.length < 60, `built title is ${title.length} characters`);
  assert.match(html, /href="\/book\/discovery\?utm_source=site&#38;utm_content=optometry-practice-finances"|href="\/book\/discovery\?utm_source=site&amp;utm_content=optometry-practice-finances"/);
  assert.match(fs.readFileSync(path.join(built, 'sitemap-0.xml'), 'utf8'), /<loc>https:\/\/mybcat\.com\/optometry-practice-finances\/<\/loc>/);
  for (const slug of financePosts) {
    const post = fs.readFileSync(path.join(built, 'blog', slug, 'index.html'), 'utf8');
    assert.match(post, new RegExp(`href="${pagePath}\\?utm_source=blog`), `${slug} CTA points at the page`);
  }
});
