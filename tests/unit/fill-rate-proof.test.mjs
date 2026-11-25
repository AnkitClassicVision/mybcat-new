import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

// The fill rate proof: one blog post and one block on the practice finances page.
// Both periods in the data were with MyBCAT, so the copy says where schedules ended
// up and never that MyBCAT caused the change. Every figure must come from the
// approved list. These tests fail when the copy breaks one of those rules.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => fs.readFileSync(path.join(repoRoot, file), 'utf8');
const built = path.join(repoRoot, '.vercel/output/static');

export const POST_SLUG = 'optometry-appointment-fill-rate';
const postFile = `src/content/blog/${POST_SLUG}.md`;
const pageFile = 'src/pages/optometry-practice-finances/index.astro';
const CTA_TEXT = 'Book a 15-minute fill rate review';

/** The only figures the copy may carry. */
export const APPROVED_NUMBERS = ['17', '91.0', '6,550', '7,199', '88.9', '6,252', '7,034', '431', '422', '5', '13', '48'];

/** Dates and the call length are not data. They are removed before the number check. */
const ALLOWED_PHRASES = [/\bOct 24 to Nov 14, 2026\b/g, /\bSept 19 to Oct 3\b/g, /\bNov 23, 2026\b/g, /\b15-minute\b/g];

/** Number words that would carry a figure outside the approved list. */
const NUMBER_WORDS = /\b(?:two|four|six|seven|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million|dozen|half|double|twice|triple)\b/gi;

/** The honest sentences that name causing on purpose: they say we do not know yet. */
export const HONEST_SENTENCES = [
  'We do not yet know how much of this we caused.',
  'Both periods were with MyBCAT, so this shows where schedules ended up, not yet how much of the change we caused.',
];

const SELF = /\b(?:MyBCAT|we|our|ours|us)\b/i;
const TOPIC = /fill|slot|schedul|appointment|\d/i;
const CAUSAL = /\b(?:caus(?:e|ed|es|ing)|drove|dr[io]v(?:e|en|es|ing)|rais(?:e|ed|es|ing)|improv\w*|deliver\w*|boost\w*|increas\w*|lift(?:ed|s|ing)|push(?:ed|es|ing)?|grew|grow(?:n|s|ing)?|help(?:ed|s|ing)?|produc(?:e|ed|es|ing)|generat\w*|achiev\w*|thanks to|because of)\b/i;
const WRONG_GROUP = /\b(?:practices\s+(?:that\s+|which\s+)?(?:we|MyBCAT)\s+(?:support|serve|work with)|(?:we|MyBCAT)\s+(?:support|serve|work with)\s+(?:\w+\s+){0,3}practices)\b/gi;

/** Visible words only: no link targets, bare URLs, HTML tags or Astro expressions. */
export function visibleText(text) {
  return String(text)
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}

function sentences(text) {
  return visibleText(text)
    .replace(/[*_#|]/g, ' ')
    .split(/(?<=[.!?])\s+|\n\s*\n/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

/** Sentences that tie MyBCAT to the fill rate with a causal verb. */
export function causalProblems(text) {
  return sentences(text).filter((s) => !HONEST_SENTENCES.includes(s) && SELF.test(s) && TOPIC.test(s) && CAUSAL.test(s));
}

/** Figures and number words outside the approved list. */
export function numberProblems(text) {
  let rest = visibleText(text).replace(/^\s*\d+\.\s/gm, ' ');
  for (const phrase of ALLOWED_PHRASES) rest = rest.replace(phrase, ' ');
  const figures = (rest.match(/\d[\d,]*(?:\.\d+)?/g) || []).map((n) => n.replace(/,$/, ''));
  const words = (rest.match(NUMBER_WORDS) || []).map((w) => w.toLowerCase());
  return [...figures.filter((n) => !APPROVED_NUMBERS.includes(n)), ...words];
}

/** Any other copy problem: a dollar sign, or wording that treats the 17 as all our practices. */
export function wordingProblems(text) {
  const found = [];
  if (String(text).includes('$')) found.push('$');
  found.push(...(visibleText(text).match(WRONG_GROUP) || []));
  return found;
}

/** The post copy a reader or search engine sees: title, description, FAQ and body before Sources. */
function postCopy() {
  const { data, content } = matter(read(postFile));
  const faqs = (data.faqs || []).map((f) => `${f.question}\n\n${f.answer}`);
  const article = content.split(/^## Sources\s*$/m)[0];
  return { data, content, article, copy: [data.title, data.seoTitle, data.description, data.seoDescription, ...(data.tags || []), ...faqs, article].join('\n\n') };
}

/** The proof block on the finance page. */
function pageBlock() {
  const page = read(pageFile);
  const block = page.match(/<aside class="fill-rate-proof"[\s\S]*?<\/aside>/)?.[0];
  return { page, block };
}

test('the checks flag causal claims, dollar signs, the wrong group wording and other figures', () => {
  assert.equal(causalProblems('MyBCAT raised fill rate to 91.0%.').length, 1);
  assert.equal(causalProblems('Our team drove more filled slots.').length, 1);
  assert.equal(causalProblems('We improved the schedule at 17 practices.').length, 1);
  assert.deepEqual(causalProblems('We do not yet know how much of this we caused.'), []);
  assert.deepEqual(causalProblems('Across the 17 optometry practices in our fill rate reporting, 91.0% of appointment slots were filled.'), []);
  assert.deepEqual(numberProblems('91.0% (6,550 of 7,199) from Oct 24 to Nov 14, 2026, and 48 weeks.'), []);
  assert.deepEqual(numberProblems('Book a 15-minute fill rate review.\n1. Pick a week.'), []);
  assert.deepEqual(numberProblems('Up 2.1 points, about 649 open slots, or 91% full.'), ['2.1', '649', '91']);
  assert.deepEqual(numberProblems('Twenty practices, half the slots.'), ['twenty', 'half']);
  assert.deepEqual(numberProblems('[Source](https://example.org/2023/1100/)'), []);
  assert.deepEqual(wordingProblems('Each slot is worth $250.'), ['$']);
  assert.equal(wordingProblems('Across the practices we support, fill rate rose.').length, 1);
  assert.equal(wordingProblems('We work with 17 optometry practices.').length, 1);
  assert.deepEqual(wordingProblems('Across the 17 practices in our fill rate reporting.'), []);
});

test('the post carries only the approved claims, figures and wording', () => {
  const { data, content, article, copy } = postCopy();
  assert.deepEqual(causalProblems(copy), [], 'causal claims');
  assert.deepEqual(numberProblems(copy), [], 'figures outside the approved list');
  assert.deepEqual(wordingProblems(copy), [], 'dollar signs or group wording');
  assert.deepEqual(wordingProblems(content), [], 'dollar signs or group wording in Sources');

  const text = visibleText(article).replace(/\s+/g, ' ');
  assert.ok(text.includes('Across the 17 optometry practices in our fill rate reporting, 91.0% of appointment slots were filled over the last three tracked weeks, Oct 24 to Nov 14, 2026 (6,550 of 7,199).'), 'claim 1, recent period');
  assert.ok(text.includes('Eight weeks earlier, from Sept 19 to Oct 3, it was 88.9% (6,252 of 7,034).'), 'claim 1, earlier period');
  assert.match(text, /431 slots/, 'claim 2, slots added');
  assert.match(text, /422 more appointments/, 'claim 2, appointments filled');
  assert.match(text, /\b5 practices\b/, 'claim 2, practices');
  assert.match(text, /about 13 open slots a week/, 'claim 3');
  assert.match(text, /open slots per week × net collected per visit × 48 weeks/, 'claim 3 formula');
  assert.equal(text.split('A no-show does not count as a filled slot.').length - 1, 1, 'the definition is stated once');
  assert.ok(text.includes('We do not yet know how much of this we caused.'), 'the lift caveat');
  assert.match(text, /Monday morning[^.]*Friday close[^.]*\./, 'how lift tracking works');
  assert.match(text, /the week of Nov 23, 2026/, 'when lift tracking started');
  assert.doesNotMatch(copy, /—/, 'no em dashes');

  for (const position of ['top', 'mid', 'end']) {
    assert.ok(content.includes(`[${CTA_TEXT}](/book/discovery?src=fill-rate-blog-${position})`), `${position} CTA`);
  }
  assert.match(content, /\]\(\/optometry-practice-finances\/\)/, 'links the finance page');
  assert.match(content, /\]\(\/solutions\/front-desk-outsourcing\/\)/, 'links front desk outsourcing');
  // The daily publish flips scheduled to published, so both states are valid here.
  assert.ok(['scheduled', 'published'].includes(data.status), `status is ${data.status}`);
  assert.equal(data.funnel, 'service');
});

test('the finance page block states claim 1 with its dates, the caveat, the post link and the CTA', () => {
  const { page, block } = pageBlock();
  assert.ok(block, 'the proof block exists');
  const topLine = page.slice(page.indexOf('id="top-line-title"'), page.indexOf('id="bottom-line-title"'));
  assert.ok(topLine.includes(block), 'the block sits in the fuller schedule section');
  assert.equal((page.match(/class="fill-rate-proof"/g) || []).length, 1, 'one block');

  assert.deepEqual(causalProblems(block), [], 'causal claims');
  assert.deepEqual(numberProblems(block), [], 'figures outside the approved list');
  assert.deepEqual(wordingProblems(block), [], 'dollar signs or group wording');

  const text = visibleText(block).replace(/\s+/g, ' ');
  assert.ok(text.includes('Across the 17 optometry practices in our fill rate reporting, 91.0% of appointment slots were filled from Oct 24 to Nov 14, 2026 (6,550 of 7,199), compared with 88.9% from Sept 19 to Oct 3 (6,252 of 7,034).'), 'claim 1 in one sentence');
  assert.ok(text.includes(HONEST_SENTENCES[1]), 'where schedules ended up, not lift');
  assert.ok(block.includes(CTA_TEXT), 'CTA text');
  assert.match(page, /discoveryBookingHref\('fill-rate-finance-mid'\)/, 'CTA src');
  // The post goes live on the daily publish. Until then the page must not link a missing page.
  assert.match(block, /\{fillRatePostLive && <a href=\{fillRatePostHref\}>/, 'the post link waits for the post');
  assert.match(page, new RegExp(`const fillRatePostHref = '/blog/${POST_SLUG}/';`));
});

test('the built finance page shows the block, and links the post only once it is live', (t) => {
  const file = path.join(built, 'optometry-practice-finances/index.html');
  if (!fs.existsSync(file)) {
    t.skip('no build output; run astro build first');
    return;
  }
  const html = fs.readFileSync(file, 'utf8');
  const block = html.match(/<aside class="fill-rate-proof"[\s\S]*?<\/aside>/)?.[0];
  assert.ok(block, 'built block');
  assert.match(block, /href="\/book\/discovery\?src=fill-rate-finance-mid"/);
  const postLive = fs.existsSync(path.join(built, 'blog', POST_SLUG, 'index.html'));
  assert.equal(block.includes(`href="/blog/${POST_SLUG}/"`), postLive, 'the post link matches whether the post is built');
});
