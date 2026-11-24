import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// The confidential transitions page promises no marketing tracking. The shared FAQ
// component sends a PostHog event on expand, so this page must render it untracked.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (file) => fs.readFileSync(path.join(repoRoot, file), 'utf8');
const pageSource = 'src/pages/optometry-practice-transitions/index.astro';
const faqSource = 'src/components/sections/FAQ.astro';
const builtPage = '.vercel/output/static/optometry-practice-transitions/index.html';

export function faqCaptureCalls(html) {
  return (String(html).match(/posthog\.capture\(\s*['"]faq_item_expanded/g) || []).length;
}

test('the transitions page renders the shared FAQ with tracking off', () => {
  const page = read(pageSource);
  const faqTags = page.match(/<FAQ\b[^>]*>/g) || [];
  assert.ok(faqTags.length > 0, 'the page renders the FAQ component');
  for (const tag of faqTags) assert.match(tag, /\btrack=\{false\}/);
  assert.match(page, /disableTracking=\{true\}/);
});

test('the FAQ capture script is gated by the track prop and skips untracked sections', () => {
  const faq = read(faqSource);
  assert.match(faq, /track\s*=\s*true/, 'track defaults to the current behaviour');
  const scriptStart = faq.indexOf('<script is:inline>');
  assert.ok(scriptStart > 0);
  assert.match(faq.slice(0, scriptStart), /\{track && \(\s*$/, 'the capture script renders only when track is true');
  assert.match(faq, /closest\('\[data-faq-track="off"\]'\)\) return;/);
});

test('the capture detector finds the FAQ event and passes clean HTML', () => {
  const tracked = "<script>window.posthog.capture('faq_item_expanded', { question: q });</script>";
  assert.equal(faqCaptureCalls(tracked), 1);
  assert.equal(faqCaptureCalls('<section data-faq-track="off"><details class="faq-item"></details></section>'), 0);
});

test('the built transitions page has no FAQ capture call', (t) => {
  const file = path.join(repoRoot, builtPage);
  if (!fs.existsSync(file)) {
    t.skip(`no build output at ${builtPage}; run astro build first`);
    return;
  }
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /<section\b[^>]*\bdata-faq-track="off"/, 'the built FAQ section is marked untracked');
  assert.equal(faqCaptureCalls(html), 0);
  assert.doesNotMatch(html, /posthog\.capture\(/);
});
