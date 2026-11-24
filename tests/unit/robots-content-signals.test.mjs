import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// robots.txt lets AI answer engines read and cite public pages (ai-input=yes) and
// refuses model training (ai-train=no), per https://contentsignals.org/.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const sourceFile = 'public/robots.txt';
const builtFile = '.vercel/output/static/robots.txt';
const namedCrawlers = ['OAI-SearchBot', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];

/** Split robots.txt into user-agent groups: { agents, signals, allow, disallow }. */
export function parseRobots(text) {
  const groups = [];
  let current = null;
  for (const raw of String(text).split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim();
    if (!line) continue;
    const idx = line.indexOf(':');
    if (idx < 0) continue;
    const key = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (key === 'user-agent') {
      if (!current || current.allow.length || current.disallow.length || current.signals.length) {
        current = { agents: [], signals: [], allow: [], disallow: [] };
        groups.push(current);
      }
      current.agents.push(value);
    } else if (current && key === 'content-signal') {
      current.signals.push(value);
    } else if (current && key === 'allow') {
      current.allow.push(value);
    } else if (current && key === 'disallow') {
      current.disallow.push(value);
    }
  }
  return groups;
}

/** Return a list of problems; an empty list means the file meets the policy. */
export function contentSignalProblems(text) {
  const problems = [];
  const groups = parseRobots(text);
  if (groups.length === 0) problems.push('no user-agent groups');
  for (const group of groups) {
    const name = group.agents.join(', ');
    if (group.signals.length !== 1) {
      problems.push(`${name}: expected one Content-Signal line, found ${group.signals.length}`);
      continue;
    }
    const pairs = Object.fromEntries(
      group.signals[0].split(',').map((part) => part.trim().split('=').map((s) => s.trim())),
    );
    if (pairs['ai-input'] !== 'yes') problems.push(`${name}: ai-input is ${pairs['ai-input']}`);
    if (pairs['ai-train'] !== 'no') problems.push(`${name}: ai-train is ${pairs['ai-train']}`);
    if (pairs.search !== 'yes') problems.push(`${name}: search is ${pairs.search}`);
    if (group.disallow.includes('/')) problems.push(`${name}: whole site disallowed`);
  }
  const agents = groups.flatMap((g) => g.agents);
  for (const crawler of ['*', ...namedCrawlers]) {
    if (!agents.includes(crawler)) problems.push(`no group for ${crawler}`);
  }
  // A named group replaces the * group for that crawler, so it must repeat every rule.
  const star = groups.find((g) => g.agents.includes('*'));
  if (star) {
    for (const group of groups) {
      if (group === star) continue;
      const name = group.agents.join(', ');
      for (const rule of star.allow) if (!group.allow.includes(rule)) problems.push(`${name}: missing Allow: ${rule}`);
      for (const rule of star.disallow) if (!group.disallow.includes(rule)) problems.push(`${name}: missing Disallow: ${rule}`);
    }
  }
  return problems;
}

const good = `User-agent: *\nContent-Signal: ai-train=no, search=yes, ai-input=yes\nAllow: /\n`;

test('the checker rejects ai-input=no, ai-train=yes and a missing signal', () => {
  assert.deepEqual(parseRobots(good)[0].agents, ['*']);
  const named = namedCrawlers.map((c) => `User-agent: ${c}\nContent-Signal: ai-train=no, search=yes, ai-input=yes\nAllow: /\n`).join('\n');
  assert.deepEqual(contentSignalProblems(`${good}\n${named}`), []);
  assert.match(contentSignalProblems(good.replace('ai-input=yes', 'ai-input=no')).join('\n'), /ai-input is no/);
  assert.match(contentSignalProblems(good.replace('ai-train=no', 'ai-train=yes')).join('\n'), /ai-train is yes/);
  assert.match(contentSignalProblems('User-agent: *\nAllow: /\n').join('\n'), /expected one Content-Signal line/);
});

test('every named crawler group repeats every Allow and Disallow rule of the * group', () => {
  const text = fs.readFileSync(path.join(repoRoot, sourceFile), 'utf8');
  assert.deepEqual(contentSignalProblems(text), []);
  // Drop one rule from one named group: the check must catch it.
  const lines = text.split('\n');
  const gpt = lines.indexOf('User-agent: GPTBot');
  const apiRule = lines.indexOf('Disallow: /api/', gpt);
  assert.ok(gpt > 0 && apiRule > gpt, 'the GPTBot group has Disallow: /api/');
  const broken = [...lines.slice(0, apiRule), ...lines.slice(apiRule + 1)].join('\n');
  assert.match(contentSignalProblems(broken).join('\n'), /GPTBot: missing Disallow: \/api\//);
});

test('public/robots.txt allows AI input and refuses AI training in every group', () => {
  const text = fs.readFileSync(path.join(repoRoot, sourceFile), 'utf8');
  assert.deepEqual(contentSignalProblems(text), []);
  assert.match(text, /^Sitemap: https:\/\/mybcat\.com\/sitemap-index\.xml$/m);
});

test('the built robots.txt carries ai-input=yes and ai-train=no', (t) => {
  const file = path.join(repoRoot, builtFile);
  if (!fs.existsSync(file)) {
    t.skip(`no build output at ${builtFile}; run astro build first`);
    return;
  }
  const built = fs.readFileSync(file, 'utf8');
  assert.match(built, /ai-input=yes/);
  assert.match(built, /ai-train=no/);
  assert.doesNotMatch(built, /ai-input=no/);
  assert.deepEqual(contentSignalProblems(built), []);
  assert.equal(built, fs.readFileSync(path.join(repoRoot, sourceFile), 'utf8'));
});
