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

/** Promise wording: "keeps your schedule full". The page uses the aim form instead. */
export function promiseProblems(text) {
  return String(text).match(/\bkeeps\s+(?:\w+\s+){0,3}schedule\s+full\b/gi) || [];
}

test('the schedule wording states an aim, not a promise', () => {
  assert.deepEqual(promiseProblems('Our team works to keep your schedule full.'), []);
  assert.equal(promiseProblems('Our team keeps your schedule full.').length, 1);
  assert.equal(promiseProblems('A team that keeps an optometry practice schedule full.').length, 1);
  for (const file of [pageFile, 'public/llms.txt', 'src/data/blog-ctas.ts', 'src/content/blog/medical-answering-services-eye-care-guide.md']) {
    assert.deepEqual(promiseProblems(read(file)), [], file);
  }
});

test('the hero carries no figure, and the cost figures state their basis', () => {
  const page = read(pageFile);
  const hero = page.match(/heroSubtitle="([^"]+)"/)[1];
  assert.doesNotMatch(hero, /half|\$|%/);
  for (const sentence of page.match(/[^.>]*\$45,000\+[^.<]*\./g)) assert.match(sentence, /40 hours a week/);
  assert.doesNotMatch(page.match(/^\s*title="([^"]+)"/m)[1], /^Optometry Practice Finances:/);
});

test('the page source has a short title, an FAQ, Service data and the discovery call', () => {
  const page = read(pageFile);
  const title = page.match(/^\s*title="([^"]+)"/m)?.[1];
  assert.ok(title, 'page title');
  assert.ok(title.length < 60, `title is ${title.length} characters`);
  assert.match(page, /<FAQ\b/);
  assert.match(page, /'@type': 'Service'/);
  assert.match(page, /discoveryBookingHref\('finances-hero'\)/);
  assert.match(page, /from '@data\/testimonials'/, 'quotes come from the testimonials file');
  assert.match(page, /a meeting with Ankit Patel, our Founder & CEO, to purchase/, 'step 2 is a meeting with the company founder');
  assert.doesNotMatch(page, /meeting with the practice owner/);
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
  assert.match(html, /href="\/book\/discovery\?src=finances-hero"/);
  assert.match(html, /href="\/book\/discovery\?src=finances-cta"/);
  assert.match(fs.readFileSync(path.join(built, 'sitemap-0.xml'), 'utf8'), /<loc>https:\/\/mybcat\.com\/optometry-practice-finances\/<\/loc>/);
  for (const slug of financePosts) {
    const post = fs.readFileSync(path.join(built, 'blog', slug, 'index.html'), 'utf8');
    assert.match(post, new RegExp(`href="${pagePath}\\?utm_source=blog`), `${slug} CTA points at the page`);
  }
});
