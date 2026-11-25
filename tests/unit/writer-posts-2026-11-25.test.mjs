import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Six scheduled posts the writer produced on 2026-11-25 before its quality fixes
// merged. Each must open with a direct answer above the table of contents, carry a
// 140-160 character description, link its service page in the body, keep at least
// two internal links and a Sources section, and use the CTA theme for its topic.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const POSTS = {
  'bookkeeping-for-optometry-practices': { service: '/optometry-practice-finances/', theme: 'finance_service' },
  'optometry-answering-service-cost': { service: '/solutions/front-desk-outsourcing/', theme: 'operations' },
  'optometry-practice-sale-letter-of-intent': { service: '/optometry-practice-transitions/', theme: null },
  'ai-scribe-for-optometrists': { service: '/solutions/medical-answering-service/', theme: null },
  'optometry-practice-profit-margin-benchmarks': { service: '/optometry-practice-finances/', theme: 'finance_service' },
  'optometry-practice-chart-of-accounts': { service: '/optometry-practice-finances/', theme: 'finance_service' },
};

function parse(slug) {
  const text = fs.readFileSync(path.join(repoRoot, 'src/content/blog', `${slug}.md`), 'utf8');
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  return { front: match[1], body: text.slice(match[0].length) };
}

function description(front) {
  const raw = front.match(/^description:\s*([\s\S]*?)(?=^\w+:)/m)[1];
  return raw.replace(/^>-\s*/, '').replace(/\s+/g, ' ').trim().replace(/^['"]|['"]$/g, '');
}

for (const [slug, rule] of Object.entries(POSTS)) {
  test(`${slug}: answer first, description, service link, links, sources, CTA theme`, () => {
    const { front, body } = parse(slug);
    const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    assert.ok(!blocks[0].startsWith('#'), 'the post opens with a paragraph, not a heading');
    const sentences = blocks[0].split(/(?<=[.!?])\s+/);
    assert.ok(sentences.length >= 2 && !/\?$/.test(sentences[0]) && !/\?$/.test(sentences[1]), 'the first two sentences answer, not ask');
    assert.ok(body.indexOf(blocks[0]) < body.indexOf('## Table of Contents'), 'the answer sits above the table of contents');

    const desc = description(front);
    assert.ok(desc.length >= 140 && desc.length <= 160, `description is ${desc.length} characters`);

    const closing = body.slice(0, body.indexOf('## Related Reading') > 0 ? body.indexOf('## Related Reading') : undefined);
    const lastParagraph = closing.trim().split(/\n\s*\n/).pop();
    assert.ok(closing.replace(lastParagraph, '').includes(`](${rule.service})`), `links ${rule.service} before the closing line`);

    const internal = [...body.matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]);
    assert.ok(new Set(internal).size >= 2, 'at least two internal links');
    assert.ok(!internal.some((href) => href.includes(slug)), 'no link to itself');
    assert.match(body, /^## Sources$/m);
    assert.doesNotMatch(body, /staging\.reviewob\.com|aoa\.org\/practice\/practice-management\)/);
    assert.doesNotMatch(body, /\[[^\]\n]*\n\s*\n[^\]\n]*\]\(/, 'no link split across paragraphs');

    const theme = (front.match(/^ctaTheme:\s*(\w+)/m) || [])[1] || null;
    assert.equal(theme, rule.theme, 'CTA theme');
  });
}
