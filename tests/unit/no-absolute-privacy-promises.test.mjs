import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// Visitor details do reach other companies (form processing, analytics, session
// recording, advertising tags), as the privacy policy lists. So no page or component
// may promise that data is never shared, never sold, fully secure or untracked.
// Lines near forms say what the details are used for and link the policy instead.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCAN = ['src/pages', 'src/components', 'src/layouts', 'src/data', 'src/content/blog'];
const EXTENSIONS = /\.(astro|ts|tsx|mjs|js|md|mdx)$/;
// The transitions page is frozen; its wording is listed for the owner instead.
const FROZEN = ['src/pages/optometry-practice-transitions/index.astro'];

const PROMISE = new RegExp(
  [
    'never\\s+(?:be\\s+)?shar',
    'never\\s+(?:be\\s+)?sol[dl]',
    'never\\s+sell',
    "won[’']t\\s+(?:share|sell)",
    'will\\s+not\\s+(?:share|sell)',
    'not\\s+shared\\s+with\\s+third',
    '100%\\s+(?:secure|private|confidential)',
    'completely\\s+(?:confidential|secure|private)',
    "we\\s+don[’']t\\s+track",
    'we\\s+do\\s+not\\s+track',
  ].join('|'),
  'gi',
);

// The one allowed sentence: the privacy policy's honest disclaimer, where "No website"
// (or "no method of transmission") is the subject of "is completely secure" in the
// same clause. Pinned to that file; the same words anywhere else still fail.
const ALLOWED = [
  {
    file: 'src/pages/privacy-policy.astro',
    pattern: /\bNo (?:website|method of transmission)(?:, and no way of sending or storing information,)? is completely secure\./g,
  },
];

/** Absolute privacy or security promises in source text from one file. */
export function promiseProblems(text, file = '') {
  let source = String(text);
  for (const allowed of ALLOWED) {
    if (allowed.file === file) source = source.replace(allowed.pattern, '');
  }
  return [...source.matchAll(PROMISE)].map((m) => m[0]);
}

function files(dir) {
  const full = path.join(repoRoot, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((entry) => {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) return files(rel);
    return EXTENSIONS.test(entry.name) ? [rel] : [];
  });
}

test('the check finds never-share style promises and lets plain lines through', () => {
  assert.equal(promiseProblems("We'll never share your information.").length, 1);
  assert.equal(promiseProblems('Your data is never shared with third parties.').length, 1);
  assert.equal(promiseProblems('We will not sell your data. 100% secure.').length, 2);
  assert.equal(promiseProblems('We don’t track you.').length, 1);
  assert.deepEqual(promiseProblems('We use your details to respond to your request. See our Privacy Policy.'), []);
  assert.deepEqual(promiseProblems('87% of callers never call back.'), []);
  const policy = 'src/pages/privacy-policy.astro';
  const disclaimer = 'No website, and no way of sending or storing information, is completely secure.';
  assert.deepEqual(promiseProblems(disclaimer, policy), [], 'the policy disclaimer passes in the policy');
  assert.equal(promiseProblems(disclaimer, 'src/pages/contact.astro').length, 1, 'the same words fail elsewhere');
  for (const promise of [
    'No matter what, your records stay completely confidential.',
    'No setup fees, and your patient data is completely private.',
    'Not to worry: your information is 100% secure.',
    'No website is perfect, but our portal is completely secure.',
  ]) {
    assert.equal(promiseProblems(promise, policy).length, 1, promise);
  }
});

test('no page, component, layout or data file makes an absolute privacy promise', () => {
  const sources = SCAN.flatMap(files).filter((file) => !FROZEN.includes(file));
  assert.ok(sources.length > 300, 'scanned the site sources and blog posts');
  for (const file of sources) {
    assert.deepEqual(promiseProblems(fs.readFileSync(path.join(repoRoot, file), 'utf8'), file), [], file);
  }
});
