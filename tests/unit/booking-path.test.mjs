import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { BOOKING_LABEL, BOOKING_PATH, CONFIDENTIAL_LABEL, bookingHref, blogTopCta } from '../../src/utils/booking.mjs';

// One booking route: every discovery-call CTA goes through /book/discovery with a
// src naming the page and position, and each page in the booking set shows one
// discovery-call CTA in its first screen with the same label.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => fs.readFileSync(path.join(repoRoot, file), 'utf8');
const built = path.join(repoRoot, '.vercel/output/static');

// Page -> the src of its first-screen booking CTA. The transitions page keeps its
// confidential path instead (tracking is off there on purpose).
export const FIRST_SCREEN = {
  '/': 'home-hero',
  '/pricing/': 'pricing-hero',
  '/optometry-practice-finances/': 'finances-hero',
  '/solutions/front-desk-outsourcing/': 'front-desk-outsourcing-hero',
  '/solutions/medical-answering-service/': 'medical-answering-service-hero',
  '/blog/optometry-practice-finances/': 'blog-top',
  '/blog/medical-answering-services-eye-care-guide/': 'blog-top',
};

// Source files that render the booking set. None may link straight to the calendar.
const SOURCES = [
  'src/pages/index.astro',
  'src/pages/pricing.astro',
  'src/pages/optometry-practice-finances/index.astro',
  'src/pages/solutions/[slug].astro',
  'src/layouts/Blog.astro',
  'src/components/Nav.astro',
  'src/components/Footer.astro',
  'src/data/blog-ctas.ts',
  'src/data/navigation.ts',
  'src/data/pricing.ts',
];
const CALENDAR = /calendar\.app\.google|calendar\.google\.com\/calendar\/appointments/;

/** Links in an HTML string: [{ href, text, index }]. */
export function links(html) {
  return [...String(html).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map((m) => ({
    href: (m[1].match(/\bhref="([^"]*)"/) || [])[1] || '',
    text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    index: m.index,
  }));
}

/** Problems with a page's booking links: bypasses, and discovery-call links off the route. */
export function bookingProblems(html) {
  const problems = [];
  for (const link of links(html)) {
    const href = link.href.replace(/&amp;|&#38;/g, '&');
    if (CALENDAR.test(href)) problems.push(`calendar link bypasses ${BOOKING_PATH}: ${href}`);
    if (/discovery call/i.test(link.text) && !href.startsWith(`${BOOKING_PATH}?src=`)) {
      problems.push(`"${link.text}" goes to ${href}`);
    }
  }
  return problems;
}

test('bookingHref builds the one route with a clean src and refuses anything else', () => {
  assert.equal(BOOKING_PATH, '/book/discovery');
  assert.equal(BOOKING_LABEL, 'Book a Discovery Call');
  assert.equal(bookingHref('finances-hero'), '/book/discovery?src=finances-hero');
  for (const bad of ['', 'Hero', 'a b', 'jane@example.com', 'x'.repeat(65), 'hero?x=1']) {
    assert.throws(() => bookingHref(bad), /src/, bad);
  }
});

// Sale and valuation guides that carry the finance_seller theme, and one acquisition post.
const SALE_POSTS = [
  'guide-for-selling-your-optometry-practice',
  'optometry-practice-appraisal-process',
  'optometry-practice-broker-how-to-choose',
  'the-optometric-practice-valuation-guide-for-buyers-and-sellers',
  'first-confidential-optometry-transition-conversation',
];
const OFF_AUDIENCE = /dental|dentist|veterinar|\bvet\b/i;

test('the blog top link follows the CTA theme: none for off-audience, confidential for sale posts', () => {
  assert.equal(blogTopCta('default'), 'none');
  assert.equal(blogTopCta('acquisition_transition'), 'confidential');
  assert.equal(blogTopCta('finance_seller'), 'confidential');
  for (const theme of ['operations', 'recall_fill_book', 'finance_open', 'finance_service', 'finance_profit']) {
    assert.equal(blogTopCta(theme), 'booking', theme);
  }
});

test('the booking check flags calendar links and discovery-call links that skip the route', () => {
  assert.deepEqual(bookingProblems('<a href="/book/discovery?src=home-hero">Book a Discovery Call</a>'), []);
  assert.equal(bookingProblems('<a href="https://calendar.app.google/abc">Book</a>').length, 1);
  assert.equal(bookingProblems('<a href="/contact/?utm_source=blog">Book a Discovery Call</a>').length, 1);
  assert.deepEqual(bookingProblems('<a href="/contact/">Get Started</a>'), []);
});

test('no source file in the booking set links straight to the calendar', () => {
  for (const file of SOURCES) assert.doesNotMatch(read(file), CALENDAR, file);
});

test('built pages: one first-screen booking CTA with the shared label, and no bypass', (t) => {
  if (!fs.existsSync(path.join(built, 'index.html'))) {
    t.skip('no build output; run astro build first');
    return;
  }
  for (const [page, src] of Object.entries(FIRST_SCREEN)) {
    const html = fs.readFileSync(path.join(built, page, 'index.html'), 'utf8');
    assert.deepEqual(bookingProblems(html), [], page);
    const main = html.indexOf('<main');
    const cta = links(html).find((l) => l.href.replace(/&amp;|&#38;/g, '&') === bookingHref(src) && l.index > main);
    assert.ok(cta, `${page} has a ${src} CTA in the page body`);
    assert.equal(cta.text, BOOKING_LABEL, `${page} label`);
    // First screen: before the page's first section heading below the hero.
    const firstH2 = html.slice(main).search(/<h2\b/);
    assert.ok(firstH2 < 0 || cta.index < main + firstH2, `${page}: ${src} sits above the first section heading`);
  }
  const home = fs.readFileSync(path.join(built, 'index.html'), 'utf8');
  const heroGroup = home.slice(home.indexOf('hero-cta-group'), home.indexOf('</div>', home.indexOf('hero-cta-group')));
  const order = links(heroGroup).map((l) => l.text);
  assert.deepEqual(order, [BOOKING_LABEL, 'Get Started', 'See How It Works'], 'home hero links, booking first');
  assert.ok(home.indexOf('hero-cta-group') < home.indexOf('hero-benefit-bar'), 'home tick list sits below the buttons');
  const transitions = fs.readFileSync(path.join(built, 'optometry-practice-transitions/index.html'), 'utf8');
  assert.match(transitions, /href="#transition-form-title"[^>]*>Start the confidential inquiry</);
});

test('built blog posts: no top booking link off-audience, the confidential link on sale posts', (t) => {
  const blog = path.join(built, 'blog');
  if (!fs.existsSync(blog)) {
    t.skip('no build output; run astro build first');
    return;
  }
  const topBooking = bookingHref('blog-top');
  let offAudience = 0;
  for (const slug of fs.readdirSync(blog)) {
    const file = path.join(blog, slug, 'index.html');
    if (!OFF_AUDIENCE.test(slug) || !fs.existsSync(file)) continue;
    offAudience += 1;
    assert.ok(!fs.readFileSync(file, 'utf8').includes(`href="${topBooking}"`), `${slug} shows the top booking link`);
  }
  assert.ok(offAudience > 10, 'off-audience posts were checked');
  // Unmapped topic groups: the general front-desk post gets the booking link; the
  // dental, veterinary and dental-bodied posts stay without it.
  const general = fs.readFileSync(path.join(blog, 'medical-practice-front-desk-efficiency-metrics-2', 'index.html'), 'utf8');
  assert.ok(general.includes(`href="${topBooking}"`), 'the general front-desk post shows the top booking link');
  for (const slug of ['animal-hospital-patient-intake', 'centralized-scheduling-multi-office-2026', 'dso-case-study-15-location-missed-calls', 'dso-centralized-scheduling-benchmarks', 'dso-patient-recall-workflow-standardization']) {
    const html = fs.readFileSync(path.join(blog, slug, 'index.html'), 'utf8');
    assert.ok(!html.includes(`href="${topBooking}"`), `${slug} stays without the top booking link`);
  }
  for (const slug of SALE_POSTS) {
    const html = fs.readFileSync(path.join(blog, slug, 'index.html'), 'utf8');
    assert.ok(!html.includes(`href="${topBooking}"`), `${slug} shows the booking link`);
    const top = html.slice(html.indexOf('post-header'), html.indexOf('id="blog-content"'));
    const confidential = links(top).find((l) => l.text === CONFIDENTIAL_LABEL);
    assert.ok(confidential, `${slug} has the confidential link at the top`);
    assert.match(confidential.href, /^\/optometry-practice-transitions\//);
  }
});
