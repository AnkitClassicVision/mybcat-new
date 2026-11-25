import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// No page may put a visitor's name, email or phone into a URL. A URL query reaches
// the next server (Google's calendar, or the booking redirect and the short link it
// forwards to), its logs and the browser history. Forms send these values only in
// the request body to their own backend.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SCAN = ['src/pages', 'src/components', 'src/layouts', 'src/utils', 'public/js'];
const EXTENSIONS = /\.(astro|ts|mjs|js)$/;
const PERSONAL_KEY = '(?:first_?name|last_?name|full_?name|owner_?name|name|e-?mail|phone|mobile_?phone)';

/** Problems: places where source code writes a personal value into a URL query. */
export function personalUrlProblems(source) {
  const text = String(source);
  const found = [];
  const setter = new RegExp(`\\.(?:set|append)\\(\\s*['"\`]${PERSONAL_KEY}['"\`]`, 'gi');
  const literal = new RegExp(`new URLSearchParams\\(\\s*\\{[^}]*\\b${PERSONAL_KEY}\\s*:`, 'gi');
  const inline = new RegExp(`[?&]${PERSONAL_KEY}=['"\`+$]`, 'gi');
  // A mailto: link with a subject or body built from values (a person's details).
  const mailto = /['"`]mailto:[^\n]*?[?&](?:subject|body)=['"`]\s*\+/gi;
  for (const pattern of [setter, literal, inline, mailto]) {
    for (const match of text.matchAll(pattern)) found.push(match[0]);
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

test('the check finds name, email and phone written into a URL query', () => {
  assert.equal(personalUrlProblems("url.searchParams.set('email', values.email);").length, 1);
  assert.equal(personalUrlProblems("params.set('firstName', values.firstName);").length, 1);
  assert.equal(personalUrlProblems("new URLSearchParams({ firstName: a, email: b })").length, 1);
  assert.equal(personalUrlProblems("const u = base + '?email=' + email;").length, 1);
  assert.deepEqual(personalUrlProblems("params.set('utm_source', 'site');"), []);
  assert.deepEqual(personalUrlProblems("body: JSON.stringify({ email: values.email })"), []);
});

// Forms send personal fields only through their script. Without JavaScript a form
// with no method submits as GET and puts every field into the page URL. Each form
// therefore posts to javascript:void(0), which sends nothing, and the page says how
// to reach us without JavaScript. The transitions page is frozen; its form is listed
// for the owner instead of changed here.
const FROZEN_FORMS = ['src/pages/optometry-practice-transitions/index.astro'];

/** Problems with the form tags in one source file. */
export function formProblems(source) {
  const text = String(source);
  const problems = [];
  for (const match of text.matchAll(/<form\b[^>]*>/g)) {
    const tag = match[0];
    if (!/\bmethod="post"/.test(tag)) problems.push(`no method="post": ${tag.slice(0, 60)}`);
    if (!/\baction="javascript:void\(0\)"/.test(tag)) problems.push(`no-JavaScript submit can send data: ${tag.slice(0, 60)}`);
  }
  if (problems.length === 0 && /<form\b/.test(text) && !/<noscript>[\s\S]*?hello@mybcat\.com[\s\S]*?<\/noscript>/.test(text)) {
    problems.push('no <noscript> notice with an email address');
  }
  return problems;
}

test('the form check wants method post, a javascript:void(0) action and a noscript notice', () => {
  assert.equal(formProblems('<form id="x" novalidate>').length, 2);
  assert.deepEqual(formProblems('<form id="x" method="post" action="javascript:void(0)"><noscript><p>Email hello@mybcat.com</p></noscript>'), []);
  assert.deepEqual(formProblems('<form method="post" action="javascript:void(0)">'), ['no <noscript> notice with an email address']);
  assert.equal(personalUrlProblems("return 'mailto:' + to + '?subject=' + encodeURIComponent(name);").length, 1);
  assert.deepEqual(personalUrlProblems("const href = 'mailto:hello@mybcat.com?subject=Practice%20brief';"), []);
});

test('every form with personal fields posts nowhere without JavaScript', () => {
  for (const file of SCAN.flatMap(files).filter((f) => f.endsWith('.astro') && !FROZEN_FORMS.includes(f))) {
    assert.deepEqual(formProblems(fs.readFileSync(path.join(repoRoot, file), 'utf8')), [], file);
  }
});

test('no page, component, layout or script writes personal data into a URL', () => {
  const sources = SCAN.flatMap(files);
  assert.ok(sources.length > 50, 'scanned the site sources');
  for (const file of sources) {
    assert.deepEqual(personalUrlProblems(fs.readFileSync(path.join(repoRoot, file), 'utf8')), [], file);
  }
});
