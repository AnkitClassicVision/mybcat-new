import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { bodyHasFaqSchema, faqsSchema, splitBeforeSources } from '../../src/utils/blog-faq.mjs';

// Blog posts can carry a visible FAQ in frontmatter. The layout renders it before
// the Sources heading with the shared FAQ component, which emits FAQPage JSON-LD.
// A post that embeds its own FAQPage keeps only that one.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const builtBlog = path.join(repoRoot, '.vercel/output/static/blog');
const faqPosts = [
  'ai-receptionist-vs-virtual-front-desk-answering-service',
  'optometry-practice-finances',
  'first-year-financial-planning-optometry',
  'optometry-private-practice',
  'medical-answering-services-eye-care-guide',
];

export function faqPageCount(html) {
  return (String(html).match(/"@type"\s*:\s*"FAQPage"/g) || []).length;
}

/** FAQPage blocks a post page carries: its own embedded ones plus the component's, if rendered. */
function renderedFaqPageCount(body, faqs) {
  const own = faqPageCount(body);
  const component = faqs.length > 0 && !bodyHasFaqSchema(body) ? 1 : 0;
  return own + component;
}

const ownFaqBody = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}</script>\n\nText.';
const valid = [{ question: 'What does it do?', answer: 'It answers calls.' }];

test('the faqs schema accepts a valid list and defaults to empty', () => {
  assert.deepEqual(faqsSchema.parse(valid), valid);
  assert.deepEqual(faqsSchema.parse(undefined), []);
});

test('the faqs schema rejects an empty question or answer and unknown keys', () => {
  assert.equal(faqsSchema.safeParse([{ question: '', answer: 'x' }]).success, false);
  assert.equal(faqsSchema.safeParse([{ question: 'q', answer: '  ' }]).success, false);
  assert.equal(faqsSchema.safeParse([{ question: 'q', answer: 'a', link: '/x/' }]).success, false);
  assert.equal(faqsSchema.safeParse([{ question: 'q' }]).success, false);
});

test('a post with faqs and no FAQPage of its own renders exactly one FAQPage', () => {
  assert.equal(bodyHasFaqSchema('Plain text.'), false);
  assert.equal(renderedFaqPageCount('Plain text.', valid), 1);
  assert.equal(renderedFaqPageCount('Plain text.', []), 0);
});

test('a post with its own FAQPage and faqs renders exactly one FAQPage', () => {
  assert.equal(bodyHasFaqSchema(ownFaqBody), true);
  assert.equal(renderedFaqPageCount(ownFaqBody, valid), 1);
});

test('the FAQ goes before the Sources heading', () => {
  const html = '<p>Body.</p>\n<h2 id="related-reading">Related Reading</h2>\n<h2 id="sources">Sources</h2>\n<ul><li>x</li></ul>';
  const [before, after] = splitBeforeSources(html);
  assert.equal(before + after, html);
  assert.match(after, /^<h2 id="sources">Sources<\/h2>/);
  assert.doesNotMatch(before, /id="sources"/);
  assert.deepEqual(splitBeforeSources('<p>No sources.</p>'), ['<p>No sources.</p>', '']);
});

test('built posts carry one FAQPage, with the FAQ before Sources', (t) => {
  if (!fs.existsSync(builtBlog)) {
    t.skip('no build output at .vercel/output/static/blog; run astro build first');
    return;
  }
  for (const slug of faqPosts) {
    const html = fs.readFileSync(path.join(builtBlog, slug, 'index.html'), 'utf8');
    assert.equal(faqPageCount(html), 1, `${slug} FAQPage count`);
    const faq = html.indexOf('id="faq"');
    const sources = html.search(/<h2\b[^>]*\bid="sources"/);
    assert.ok(faq > 0, `${slug} renders the FAQ`);
    if (sources > 0) assert.ok(faq < sources, `${slug} FAQ comes before Sources`);
  }
  for (const dir of fs.readdirSync(builtBlog)) {
    const file = path.join(builtBlog, dir, 'index.html');
    if (fs.existsSync(file)) assert.ok(faqPageCount(fs.readFileSync(file, 'utf8')) <= 1, `${dir} has more than one FAQPage`);
  }
});
