import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkDueQueue } from '../../scripts/check-due-queue.mjs';
import {
  MAX_DAILY_PUBLISH,
  applyDailyCap,
  orderForPublish,
  publishOrder,
  remainingToday,
  selectForPublish,
  splitByRelease,
} from '../../scripts/publish-selection.mjs';
import { published, queueOf, scheduled, topic } from './due-queue-fixtures.mjs';

// scripts/publish-selection.mjs holds the publish job's order, release gate and
// daily cap. The publish job and the daily health check both import it. These
// tests pin its behaviour two ways: directly, and by running the real publish job
// in a sandbox. They replace a text match on the publisher's source, which a
// reversed sort, slice(-limit) or `if (true)` all passed.

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const post = (file, scheduledDate) => ({ file, scheduledDate });
const files = (list) => list.map((entry) => entry.file);

// ---------------------------------------------------------------------------
// The module, directly

test('release order is oldest scheduledDate first, then filename, and the input is left alone', () => {
  const input = [post('b.md', '2026-10-02'), post('z.md', '2026-10-01'), post('a.md', '2026-10-02')];
  const snapshot = files(input);
  assert.deepEqual(files(orderForPublish(input)), ['z.md', 'a.md', 'b.md']);
  assert.deepEqual(files(input), snapshot, 'orderForPublish does not reorder its input');
  assert.ok(publishOrder(post('a.md', '2026-10-01'), post('a.md', '2026-10-02')) < 0);
  assert.ok(publishOrder(post('b.md', '2026-10-01'), post('a.md', '2026-10-01')) > 0);
  assert.equal(publishOrder(post('a.md', '2026-10-01'), post('a.md', '2026-10-01')), 0);
});

test('the daily cap is one post, and it keeps the first posts in order, not the last', () => {
  assert.equal(MAX_DAILY_PUBLISH, 1);
  assert.equal(remainingToday(0), 1);
  assert.equal(remainingToday(1), 0);
  assert.equal(remainingToday(5), 0);
  const queue = [post('a.md', '1'), post('b.md', '2'), post('c.md', '3')];
  assert.deepEqual(applyDailyCap(queue, { remaining: 1 }), { toPublish: [queue[0]], deferred: [queue[1], queue[2]] });
  assert.deepEqual(applyDailyCap(queue, { remaining: 2 }).toPublish, [queue[0], queue[1]]);
  assert.deepEqual(applyDailyCap(queue, { remaining: 0 }), { toPublish: [], deferred: queue });
  assert.deepEqual(applyDailyCap(queue, { remaining: 0, force: true }), { toPublish: queue, deferred: [] }, '--force turns the cap off');
});

test('the release gate holds each post on its own and never holds back another', () => {
  const queue = [post('a.md', '1'), post('b.md', '2'), post('c.md', '3')];
  const verdicts = { 'a.md': { ok: false, issues: ['RED_X:a.md'] }, 'b.md': { ok: true, issues: [] }, 'c.md': { ok: false, issues: ['RED_Y:c.md', 'RED_Z:c.md'] } };
  const { releasable, releaseHeld } = splitByRelease(queue, (entry) => verdicts[entry.file]);
  assert.deepEqual(files(releasable), ['b.md']);
  assert.deepEqual(releaseHeld.map((entry) => [entry.file, entry.reasons]), [['a.md', ['RED_X:a.md']], ['c.md', ['RED_Y:c.md', 'RED_Z:c.md']]]);
  assert.deepEqual(files(splitByRelease(queue, () => ({ ok: true, issues: [] })).releasable), ['a.md', 'b.md', 'c.md']);
  assert.deepEqual(splitByRelease(queue, () => ({ ok: false, issues: ['RED'] })).releasable, []);
});

test('the whole selection: order, then release gate, then quality gate, then cap', () => {
  const eligible = [post('c.md', '3'), post('a.md', '1'), post('b.md', '2'), post('d.md', '4')];
  const evaluateRelease = (entry) => (entry.file === 'a.md' ? { ok: false, issues: ['RED'] } : { ok: true, issues: [] });
  const base = { eligible, evaluateRelease };
  assert.deepEqual(files(selectForPublish(base).toPublish), ['b.md'], 'the oldest post the gate lets through');
  assert.deepEqual(files(selectForPublish(base).releaseHeld), ['a.md']);
  assert.deepEqual(files(selectForPublish({ ...base, force: true }).toPublish), ['b.md', 'c.md', 'd.md']);
  assert.deepEqual(files(selectForPublish({ ...base, publishedToday: 1 }).toPublish), [], 'a post already went out today');
  assert.deepEqual(files(selectForPublish({ ...base, passesQuality: (entry) => entry.file !== 'b.md' }).toPublish), ['c.md'], 'a post that fails quality is skipped, the next goes');
});

// ---------------------------------------------------------------------------
// The real publish job, in a sandbox

// A copy of scripts/ with a fixture blog and queue, run with --dry-run so nothing
// is written. The content quality rules are left out, as the job itself allows:
// the fixtures are not long enough to pass them, and quality is not what is tested.
function sandbox(fileList, queue) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'publish-sandbox-'));
  fs.cpSync(path.join(repoRoot, 'scripts'), path.join(dir, 'scripts'), { recursive: true });
  fs.rmSync(path.join(dir, 'scripts/config/content-quality-rules.json'), { force: true });
  fs.symlinkSync(path.join(repoRoot, 'node_modules'), path.join(dir, 'node_modules'), 'dir');
  fs.mkdirSync(path.join(dir, 'src/content/blog'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'config'));
  for (const file of fileList) fs.writeFileSync(path.join(dir, 'src/content/blog', file.name), file.content);
  fs.writeFileSync(path.join(dir, 'config/seo-topic-queue.json'), JSON.stringify(queue));
  return dir;
}

function dryRun(dir, ...args) {
  const run = spawnSync(process.execPath, ['scripts/publish-scheduled.js', '--dry-run', ...args], { cwd: dir, encoding: 'utf8' });
  const lines = run.stdout.split('\n');
  const pick = (prefix) => lines.filter((line) => line.startsWith(prefix)).map((line) => line.slice(prefix.length).split(' ')[0]);
  return {
    status: run.status,
    stdout: run.stdout,
    wouldPublish: pick('Would publish: '),
    wouldLeave: pick('Would leave scheduled: '),
    held: pick('Release gate HELD: '),
  };
}

// Dates and names are scrambled against each other so that neither directory
// order nor name order gives the release order.
const SCRAMBLED = [
  ['m-post.md', '2020-03-04'], ['c-post.md', '2020-03-09'], ['x-post.md', '2020-03-02'], ['a-post.md', '2020-03-11'],
  ['q-post.md', '2020-03-06'], ['f-post.md', '2020-03-02'], ['t-post.md', '2020-03-13'], ['h-post.md', '2020-03-08'],
].map(([name, date]) => [`optometry-${name}`, date]);
const RELEASE_ORDER = ['optometry-f-post.md', 'optometry-x-post.md', 'optometry-m-post.md', 'optometry-q-post.md', 'optometry-h-post.md', 'optometry-c-post.md', 'optometry-a-post.md', 'optometry-t-post.md'];

function fixture({ unapproved = [] } = {}) {
  const list = SCRAMBLED.map(([name, date]) => scheduled(name, date, { topic: !unapproved.includes(name) }));
  const queue = queueOf(...SCRAMBLED.filter(([name]) => !unapproved.includes(name)).map(([name]) => topic(name, '2019-01-01T00:00:00Z')));
  return { list, queue };
}

test('the publish job releases the oldest approved post, one a day', () => {
  const { list, queue } = fixture();
  const dir = sandbox(list, queue);
  try {
    const run = dryRun(dir);
    assert.equal(run.status, 0, run.stdout);
    assert.deepEqual(run.wouldPublish, [RELEASE_ORDER[0]]);
    assert.deepEqual(run.wouldLeave, RELEASE_ORDER.slice(1), 'the rest wait, in release order');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the publish job skips a post the release gate holds and releases the next one', () => {
  const { list, queue } = fixture({ unapproved: [RELEASE_ORDER[0], RELEASE_ORDER[2]] });
  const dir = sandbox(list, queue);
  try {
    const run = dryRun(dir);
    assert.equal(run.status, 0, run.stdout);
    assert.deepEqual(run.held, [RELEASE_ORDER[0], RELEASE_ORDER[2]]);
    assert.deepEqual(run.wouldPublish, [RELEASE_ORDER[1]]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('with --force the publish job releases every approved post, in release order', () => {
  const { list, queue } = fixture({ unapproved: [RELEASE_ORDER[3]] });
  const dir = sandbox(list, queue);
  try {
    const run = dryRun(dir, '--force');
    assert.equal(run.status, 0, run.stdout);
    assert.deepEqual(run.wouldPublish, RELEASE_ORDER.filter((name) => name !== RELEASE_ORDER[3]));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('once a post is live today the publish job releases no more', () => {
  const { list, queue } = fixture();
  const today = new Date().toISOString().split('T')[0];
  const dir = sandbox([...list, published('optometry-live-today.md', today)], queue);
  try {
    const run = dryRun(dir);
    assert.equal(run.status, 0, run.stdout);
    assert.deepEqual(run.wouldPublish, []);
    assert.match(run.stdout, /Daily publish cap reached: 1 post\(s\) already published on/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('the daily health check picks the same post as the publish job, held posts included', () => {
  for (const unapproved of [[], [RELEASE_ORDER[0]], [RELEASE_ORDER[0], RELEASE_ORDER[1], RELEASE_ORDER[2]]]) {
    const { list, queue } = fixture({ unapproved });
    const dir = sandbox(list, queue);
    try {
      const job = dryRun(dir);
      // Every post is long due and approved long ago. Nothing is live today, so the
      // check reports the first in line, which is the post the job chose.
      const today = new Date().toISOString().split('T')[0];
      const check = checkDueQueue({ today, files: list, queue });
      assert.equal(check.queue[0].file, job.wouldPublish[0], `unapproved ${unapproved.length}`);
      assert.deepEqual(check.queue.map((entry) => entry.file), RELEASE_ORDER.filter((name) => !unapproved.includes(name)));
      assert.deepEqual(check.held.map((entry) => entry.file).sort(), [...job.held].sort());
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});
