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
const SCAN = ['src/pages', 'src/components', 'src/layouts', 'src/data'];
const EXTENSIONS = /\.(astro|ts|tsx|mjs|js)$/;
// The transitions page is frozen; its wording is listed for the owner instead.
const FROZEN = ['src/pages/optometry-practice-transitions/index.astro'];

// Promises that data is never shared, sold or tracked. Always a problem.
const PROMISE = new RegExp(
  [
    'never\\s+(?:be\\s+)?shar',
    'never\\s+(?:be\\s+)?sol[dl]',
    'never\\s+sell',
    "won[’']t\\s+(?:share|sell)",
    'will\\s+not\\s+(?:share|sell)',
    'not\\s+shared\\s+with\\s+third',
    "we\\s+don[’']t\\s+track",
    'we\\s+do\\s+not\\s+track',
  ].join('|'),
  'gi',
);
// Assurances of total security. A problem unless the sentence denies them first, as
// the privacy policy does: "No website ... is completely secure."
const ASSURANCE = /100%\s+(?:secure|private|confidential)|completely\s+(?:confidential|secure|private)/gi;
const NEGATION = /\b(?:no|not|nothing|cannot|can't|isn't)\b/i;

/** Absolute privacy or security promises in a piece of source text. */
export function promiseProblems(text) {
  const source = String(text);
  const found = [...source.matchAll(PROMISE)].map((m) => m[0]);
  for (const m of source.matchAll(ASSURANCE)) {
    const sentenceStart = Math.max(source.lastIndexOf('.', m.index), source.lastIndexOf('>', m.index), source.lastIndexOf('\n', m.index)) + 1;
    if (!NEGATION.test(source.slice(sentenceStart, m.index))) found.push(m[0]);
  }
  return found;
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
  assert.deepEqual(promiseProblems('No website, and no way of sending or storing information, is completely secure.'), []);
  assert.equal(promiseProblems('Your data is completely secure with us.').length, 1);
});

test('no page, component, layout or data file makes an absolute privacy promise', () => {
  const sources = SCAN.flatMap(files).filter((file) => !FROZEN.includes(file));
  assert.ok(sources.length > 50, 'scanned the site sources');
  for (const file of sources) {
    assert.deepEqual(promiseProblems(fs.readFileSync(path.join(repoRoot, file), 'utf8')), [], file);
  }
});
