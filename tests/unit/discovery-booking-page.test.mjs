import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const vercel = JSON.parse(fs.readFileSync(path.join(repoRoot, 'vercel.json'), 'utf8'));
const redirects = vercel.redirects || [];

function redirect(source) {
  return redirects.find((entry) => entry.source === source);
}

test('discovery booking is an on-site page, not a Google Calendar redirect', () => {
  assert.equal(fs.existsSync(path.join(repoRoot, 'src/pages/book/discovery/index.astro')), true);

  const bare = redirect('/book/discovery');
  assert.ok(bare, 'slash redirect from /book/discovery is present');
  assert.equal(bare.destination, '/book/discovery/');
  assert.equal(bare.permanent, true);

  const slashed = redirect('/book/discovery/');
  assert.equal(slashed, undefined);

  for (const entry of redirects) {
    if (entry.source === '/book/discovery' || entry.source === '/book/discovery/') {
      assert.equal(String(entry.destination).includes('calendar.app.google'), false);
    }
  }
});

test('prep, interview, and 1-1 booking wrappers stay on Google Calendar', () => {
  assert.equal(redirect('/book/prep')?.destination, 'https://calendar.app.google/VqkXspVbhw4BbYyz8');
  assert.equal(redirect('/book/prep/')?.destination, 'https://calendar.app.google/VqkXspVbhw4BbYyz8');
  assert.equal(redirect('/book/interview')?.destination, 'https://calendar.app.google/Cpksvx8ywN26GtMY6');
  assert.equal(redirect('/book/interview/')?.destination, 'https://calendar.app.google/Cpksvx8ywN26GtMY6');
  assert.equal(redirect('/book/1-1')?.destination, 'https://calendar.app.google/4R8J9WLuNnrXFvnEA');
  assert.equal(redirect('/book/1-1/')?.destination, 'https://calendar.app.google/4R8J9WLuNnrXFvnEA');
});
