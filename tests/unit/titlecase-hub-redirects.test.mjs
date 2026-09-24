import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const vercel = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));

const REQUIRED = [
  { source: '/Blog', destination: '/blog/' },
  { source: '/Blog/', destination: '/blog/' },
  { source: '/Glossary', destination: '/glossary/' },
  { source: '/Glossary/', destination: '/glossary/' },
  { source: '/Solutions', destination: '/solutions/' },
  { source: '/Solutions/', destination: '/solutions/' },
];

const PROTECTED_LOWERCASE = ['/blog', '/blog/', '/glossary', '/glossary/', '/solutions', '/solutions/'];

test('TitleCase hub URLs permanently redirect to lowercase hubs', () => {
  const redirects = vercel.redirects || [];

  for (const expected of REQUIRED) {
    const matches = redirects.filter((rule) => rule.source === expected.source);
    assert.equal(matches.length, 1, `expected one redirect for ${expected.source}`);
    assert.equal(matches[0].destination, expected.destination);
    assert.equal(matches[0].permanent, true);
  }
});

test('lowercase hub paths are not redirected away from themselves', () => {
  const redirects = vercel.redirects || [];

  for (const source of PROTECTED_LOWERCASE) {
    const bad = redirects.filter((rule) => {
      if (rule.source !== source) return false;
      const dest = String(rule.destination || '').replace(/\/+$/, '').toLowerCase();
      const src = source.replace(/\/+$/, '').toLowerCase();
      return dest !== src;
    });
    assert.equal(bad.length, 0, `${source} must not redirect to a different path`);
  }
});
