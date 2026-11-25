import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  CEILING_FLOOR_DAYS,
  HELD_LIMIT_DAYS,
  SLACK_DAYS,
  checkDueQueue,
  formatReport,
  parsePublishDiff,
  readPublications,
} from '../../scripts/check-due-queue.mjs';
import {
  Repo,
  addDay,
  history,
  newestFirst,
  oldestFirst,
  published,
  queueOf,
  record,
  scheduled,
  topic,
} from './due-queue-fixtures.mjs';

// The Daily New Post Health Check must not fail because a post dated today is
// waiting behind older posts: the publish job releases one post a day, oldest
// first. It must still fail when publishing really stalls: no publish, the wrong
// post published, a post skipped, a post waiting past its ceiling, a post held
// too long. These tests cover each, and that a healthy queue stays green.

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TODAY = '2026-11-25';
const names = (entries) => entries.map((entry) => entry.file);
const codes = (result) => result.failures.map((failure) => failure.code);

// The queue as it stood on 2026-11-25 after today's publish: one post went out
// today, seven are due behind it and six are dated later. The last due post is
// dated today and still scheduled. That is the state the old gate failed every
// day. The history is the publish job's real record of the four posts it
// released on 11-23, 11-24 and 11-25: oldest scheduledDate first.
function realQueueState() {
  const auto = '2026-11-23T19:40:04Z';
  const due = [
    ['optometry-appointment-fill-rate.md', '2026-10-26', '2026-11-25T19:36:10.713Z'],
    ['eye-care-no-show-fee-policy-playbook.md', '2026-10-27', auto],
    ['eye-care-confirmation-cadence-playbook.md', '2026-10-28', auto],
    ['eye-care-chair-time-playbook.md', '2026-10-29', auto],
    ['optometry-practice-valuation-benchmarks.md', '2026-10-30', auto],
    ['optometry-practice-sale-process-playbook.md', '2026-11-24', '2026-11-24T01:35:38.832Z'],
    ['ai-receptionist-for-optometry-practice.md', '2026-11-25', '2026-11-24T23:39:22.259Z'],
  ];
  const later = [
    ['bookkeeping-for-optometry-practices.md', '2026-11-26', '2026-11-25T01:38:44.407Z'],
    ['optometry-answering-service-cost.md', '2026-11-27', '2026-11-24T10:00:00Z'],
    ['optometry-practice-sale-letter-of-intent.md', '2026-11-30', '2026-11-24T10:00:00Z'],
    ['ai-scribe-for-optometrists.md', '2026-12-01', '2026-11-24T10:00:00Z'],
    ['optometry-practice-profit-margin-benchmarks.md', '2026-12-02', '2026-11-24T10:00:00Z'],
    ['optometry-practice-chart-of-accounts.md', '2026-12-03', '2026-11-24T10:00:00Z'],
  ];
  const all = [...due, ...later];
  return {
    files: [
      ...all.map(([name, date]) => scheduled(name, date)),
      published('eye-care-recall-attribution-playbook.md', '2026-11-25'),
      published('eye-care-recall-postcard-playbook.md', '2026-11-24'),
      published('eye-care-kpi-dashboard-playbook.md', '2026-11-23'),
      published('accounting-for-optometrist.md', '2026-11-23'),
      published('optometry-older-post.md', '2026-09-26'),
    ],
    queue: queueOf(...all.map(([name, , approvedAt]) => topic(name, approvedAt, { automatic: true }))),
    publications: history([
      record('eye-care-recall-attribution-playbook.md', '2026-10-26', '2026-11-25'),
      record('eye-care-recall-postcard-playbook.md', '2026-10-23', '2026-11-24'),
      record('eye-care-kpi-dashboard-playbook.md', '2026-10-22', '2026-11-23'),
      record('accounting-for-optometrist.md', '2026-10-21', '2026-11-23'),
    ], '2026-09-26'),
    dueNames: due.map(([name]) => name),
  };
}

/**
 * `count` scheduled posts named optometry-post-00.md and up, all approved well
 * before. Dates: one day apart from `firstDay`, all on `firstDay` with
 * `sameDay`, or exactly `dates`.
 */
function backlog(count, { firstDay = '2026-11-01', sameDay = false, dates = null } = {}) {
  const files = [];
  const topics = [];
  for (let index = 0; index < count; index += 1) {
    const name = `optometry-post-${String(index).padStart(2, '0')}.md`;
    const date = dates ? dates[index] : sameDay ? firstDay : addDay(firstDay, index);
    files.push(scheduled(name, date));
    topics.push(topic(name, '2026-10-01T10:00:00Z'));
  }
  return { files, topics };
}

// ---------------------------------------------------------------------------
// Today's real queue, and a healthy queue every day

test("today's real queue passes: a post dated today waits behind older posts", () => {
  const { files, queue, publications, dueNames } = realQueueState();
  assert.ok(
    files.some((file) => /^status: scheduled$/m.test(file.content) && file.content.includes(`scheduledDate: '${TODAY}'`)),
    'the fixture must hold the state the old gate failed on: a post dated today, still scheduled',
  );
  const result = checkDueQueue({ today: TODAY, files, queue, publications });
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.warnings, [], "today's publication was checked against the history, with nothing left unverified");
  assert.equal(result.ok, true);
  assert.equal(result.publishedToday, 1);
  assert.deepEqual(names(result.queue), dueNames, 'the due queue is in publish order, oldest scheduledDate first');
  assert.deepEqual(result.held, []);
});

test("today's real queue still passes when no history can be read, with a warning", () => {
  const { files, queue } = realQueueState();
  const result = checkDueQueue({ today: TODAY, files, queue, publications: null });
  assert.equal(result.ok, true);
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /history is not available/);
});

test('the queue stays green on every day while it drains, one post a day, oldest first', () => {
  const { files, queue, publications } = realQueueState();
  const repo = new Repo(files, publications.records);
  let day = TODAY;
  for (let step = 0; step < 14; step += 1) {
    day = addDay(day);
    repo.publishOne(day, oldestFirst);
    const result = checkDueQueue({ today: day, files: repo.files, queue, publications: history(repo.records, '2026-09-26') });
    assert.deepEqual(result.failures, [], `${day} must be green while the queue drains`);
    assert.deepEqual(result.warnings, [], `${day} must have nothing left unverified`);
  }
  assert.ok(repo.files.every((file) => /^status: published$/m.test(file.content)), 'the queue is empty at the end');
});

test('a queue longer than 14 posts drains green: the ceiling grows with the queue', () => {
  const { files, topics } = backlog(20, { sameDay: true });
  // All 20 became due on 11-01. The last one goes out on 11-20, 19 days later.
  const repo = new Repo(files);
  const queue = queueOf(...topics);
  let day = '2026-11-01';
  let lastPublished = 0;
  for (let step = 0; step < 26; step += 1) {
    if (repo.publishOne(day, oldestFirst)) lastPublished += 1;
    const result = checkDueQueue({ today: day, files: repo.files, queue, publications: history(repo.records) });
    assert.deepEqual(result.failures, [], `${day} must be green`);
    day = addDay(day);
  }
  assert.equal(lastPublished, 20);
});

// ---------------------------------------------------------------------------
// Nothing published, overdue

test('nothing published today although a releasable post was due fails', () => {
  const files = [
    scheduled('optometry-post-a.md', '2026-11-24'),
    published('optometry-post-old.md', '2026-11-24'),
  ];
  const queue = queueOf(topic('optometry-post-a.md', '2026-11-20T10:00:00Z'));
  const result = checkDueQueue({ today: TODAY, files, queue });
  assert.equal(result.ok, false);
  assert.deepEqual(codes(result), ['NOTHING_PUBLISHED_TODAY']);
  assert.match(result.failures[0].detail, /optometry-post-a\.md/);
  assert.ok(formatReport(result).some((line) => line.startsWith('::error::NOTHING_PUBLISHED_TODAY')));
});

test('a publish today, a day with nothing due, or a post approved today do not fail', () => {
  const queue = queueOf(
    topic('optometry-post-a.md', '2026-11-20T10:00:00Z'),
    topic('optometry-post-late.md', `${TODAY}T15:00:00Z`),
  );
  assert.equal(checkDueQueue({
    today: TODAY,
    files: [scheduled('optometry-post-a.md', '2026-11-24'), published('optometry-post-new.md', TODAY)],
    queue,
  }).ok, true);
  assert.equal(checkDueQueue({
    today: TODAY,
    files: [scheduled('optometry-post-a.md', '2026-11-26'), published('optometry-post-old.md', '2026-11-20')],
    queue,
  }).ok, true);
  assert.equal(checkDueQueue({
    today: TODAY,
    files: [scheduled('optometry-post-late.md', '2026-11-20')],
    queue,
  }).ok, true);
});

test('a post overdue beyond its place in the queue fails', () => {
  const queue = queueOf(
    topic('optometry-post-a.md', '2026-11-01T10:00:00Z'),
    topic('optometry-post-b.md', '2026-11-01T10:00:00Z'),
  );
  // Both became releasable on 11-22. The publish job went out only today.
  // A waited 3 days with nothing ahead: 0 ahead + 1 published + 1 slack = 2.
  // B waited 3 days with one ahead: 1 + 1 + 1 = 3, so its place explains it.
  const files = [
    scheduled('optometry-post-a.md', '2026-11-22'),
    scheduled('optometry-post-b.md', '2026-11-22'),
    published('optometry-post-new.md', TODAY),
  ];
  const result = checkDueQueue({ today: TODAY, files, queue });
  assert.equal(result.ok, false);
  assert.deepEqual(codes(result), ['OVERDUE']);
  assert.equal(result.failures[0].file, 'optometry-post-a.md');
  assert.match(result.failures[0].detail, /waited 3 day\(s\)/);
});

test('the overdue limit is the queue position plus one day of slack, to the day', () => {
  assert.equal(SLACK_DAYS, 1);
  const queue = queueOf(topic('optometry-post-a.md', '2026-11-01T10:00:00Z'));
  const run = (scheduledDate) => checkDueQueue({
    today: TODAY,
    files: [scheduled('optometry-post-a.md', scheduledDate), published('optometry-post-new.md', TODAY)],
    queue,
  });
  assert.equal(run('2026-11-23').ok, true, 'waited 2 = 0 ahead + 1 published + 1 slack');
  assert.equal(run('2026-11-22').ok, false, 'waited 3 is one day past the limit');
});

// ---------------------------------------------------------------------------
// Rule 1: the wrong post was published

test('a publisher that releases the newest post first fails on its first day', () => {
  const { files, topics } = backlog(5);
  const queue = queueOf(...topics);
  const repo = new Repo(files);
  const day = '2026-11-08';
  const wrong = repo.publishOne(day, newestFirst);
  assert.equal(wrong, 'optometry-post-04.md');
  const result = checkDueQueue({ today: day, files: repo.files, queue, publications: history(repo.records) });
  assert.equal(result.ok, false);
  const failure = result.failures.find((entry) => entry.code === 'WRONG_POST_PUBLISHED');
  assert.ok(failure, `expected WRONG_POST_PUBLISHED, got ${codes(result)}`);
  assert.match(failure.detail, /optometry-post-00\.md \(scheduled 2026-11-01\) was first in line today, but optometry-post-04\.md \(scheduled 2026-11-05\) was published instead/);
  assert.ok(formatReport(result).some((line) => line.startsWith('::error::WRONG_POST_PUBLISHED')));
});

test('a publisher that releases the newest post first never turns green over 14 days', () => {
  // The case the count rules cannot see: five older posts wait, a new post is
  // scheduled every day, and the job always takes the newest. Posts go live every
  // day, so nothing looks stalled, and the older posts only get older.
  const { files, topics } = backlog(5, { firstDay: '2026-10-10', sameDay: true });
  const repo = new Repo(files);
  let day = '2026-10-10';
  for (let step = 0; step < 14; step += 1) {
    const name = `optometry-post-new-${String(step).padStart(2, '0')}.md`;
    if (step > 0) {
      repo.add(scheduled(name, day));
      topics.push(topic(name, '2026-10-01T10:00:00Z'));
    }
    assert.ok(repo.publishOne(day, newestFirst));
    const result = checkDueQueue({ today: day, files: repo.files, queue: queueOf(...topics), publications: history(repo.records) });
    assert.equal(result.ok, false, `${day} must be red`);
    assert.ok(codes(result).includes('WRONG_POST_PUBLISHED'), `${day}: expected WRONG_POST_PUBLISHED, got ${codes(result)}`);
    day = addDay(day);
  }
});

test('the right post passes: ties break by filename, several posts a day work, and a post approved today is not owed', () => {
  const queue = queueOf(
    topic('optometry-post-a.md', '2026-10-01T10:00:00Z'),
    topic('optometry-post-b.md', '2026-10-01T10:00:00Z'),
    topic('optometry-post-c.md', '2026-10-01T10:00:00Z'),
    topic('optometry-post-late.md', `${TODAY}T05:00:00Z`),
  );
  const start = () => new Repo([
    scheduled('optometry-post-a.md', '2026-11-24'),
    scheduled('optometry-post-b.md', '2026-11-24'),
    scheduled('optometry-post-c.md', '2026-11-25'),
  ]);
  const verdict = (repo) => checkDueQueue({ today: TODAY, files: repo.files, queue, publications: history(repo.records) });

  const a = start();
  a.publishOne(TODAY, oldestFirst);
  assert.deepEqual(a.records.map((entry) => entry.file), ['optometry-post-a.md']);
  assert.equal(verdict(a).ok, true, 'same date: the earlier filename goes first');

  const b = start();
  b.publishOne(TODAY, (due) => due.find((entry) => entry.file === 'optometry-post-b.md'));
  assert.deepEqual(codes(verdict(b)), ['WRONG_POST_PUBLISHED'], 'same date: the later filename must not go first');

  const two = start();
  two.publishOne(TODAY, oldestFirst);
  two.publishOne(TODAY, oldestFirst);
  assert.equal(verdict(two).ok, true, 'two posts in one day (a forced run) are the first two in line');

  const skipOne = start();
  skipOne.publishOne(TODAY, (due) => due.find((entry) => entry.file === 'optometry-post-a.md'));
  skipOne.publishOne(TODAY, (due) => due.find((entry) => entry.file === 'optometry-post-c.md'));
  assert.deepEqual(codes(verdict(skipOne)), ['WRONG_POST_PUBLISHED'], 'the first and the third of three is wrong: the second was first in line');

  // A post approved today was not releasable when the job ran. It is older than the
  // post that went live and still must not make that publication wrong.
  const late = new Repo([scheduled('optometry-post-late.md', '2026-10-15'), scheduled('optometry-post-a.md', '2026-11-24')]);
  late.publishOne(TODAY, (due) => due.find((entry) => entry.file === 'optometry-post-a.md'));
  assert.equal(verdict(late).ok, true);
});

test('an unrecorded or unreadable history leaves the order unverified, with a warning, and does not fail', () => {
  const queue = queueOf(topic('optometry-post-a.md', '2026-10-01T10:00:00Z'));
  const files = [scheduled('optometry-post-a.md', '2026-11-24'), published('optometry-post-hand.md', TODAY)];
  const none = checkDueQueue({ today: TODAY, files, queue, publications: null });
  assert.equal(none.ok, true);
  assert.match(none.warnings[0], /history is not available/);
  const missing = checkDueQueue({ today: TODAY, files, queue, publications: history([]) });
  assert.equal(missing.ok, true);
  assert.match(missing.warnings[0], /No publish record found in history for optometry-post-hand\.md/);
});

// ---------------------------------------------------------------------------
// Rule 2: a post is skipped, or waits past the ceiling

test('a post stuck at the front of a growing queue fails every day, not after 60 days of green', () => {
  // optometry-post-0-stuck is first in the order, approved, and due on the first day. The job keeps taking
  // another post: the case where the front post fails the quality gate. Two posts
  // are scheduled every day and one goes out, so the queue behind it grows.
  const queueFor = (extra) => queueOf(topic('optometry-post-0-stuck.md', '2026-09-20T10:00:00Z'), ...extra);
  const repo = new Repo([scheduled('optometry-post-0-stuck.md', '2026-10-10')]);
  const topics = [];
  let day = '2026-10-10';
  for (let step = 0; step < 60; step += 1) {
    for (const suffix of ['a', 'b']) {
      const name = `optometry-post-new-${String(step).padStart(2, '0')}${suffix}.md`;
      repo.add(scheduled(name, day));
      topics.push(topic(name, '2026-09-20T10:00:00Z'));
    }
    repo.publishOne(day, (due) => oldestFirst(due.filter((entry) => entry.file !== 'optometry-post-0-stuck.md')));
    const result = checkDueQueue({ today: day, files: repo.files, queue: queueFor(topics), publications: history(repo.records) });
    assert.equal(result.ok, false, `${day} must be red`);
    // The day it happens, today's publication is the wrong post. From the next day,
    // the stuck post is skipped by a post that went live after it could.
    const naming = result.failures.filter((failure) => failure.detail.includes('optometry-post-0-stuck.md'));
    assert.ok(naming.length > 0, `${day}: the stuck post must be named`);
    if (step === 0) {
      assert.ok(codes(result).includes('WRONG_POST_PUBLISHED'));
    } else {
      const skipped = result.failures.find((failure) => failure.code === 'SKIPPED' && failure.file === 'optometry-post-0-stuck.md');
      assert.ok(skipped, `${day}: SKIPPED expected, got ${codes(result)}`);
      assert.match(skipped.detail, /optometry-post-new-00a\.md .* went live on 2026-10-10; the publish job skipped it/);
    }
    // Past 14 days the absolute ceiling also stops it: nothing that went live was ahead of it.
    const waited = Math.round((Date.parse(day) - Date.parse('2026-10-10')) / 86_400_000);
    const ceiling = result.failures.find((failure) => failure.code === 'CEILING' && failure.file === 'optometry-post-0-stuck.md');
    assert.equal(Boolean(ceiling), waited > 14, `${day}: the ceiling applies once the post has waited more than 14 days (waited ${waited})`);
    day = addDay(day);
  }
});

test('a post is skipped only by a post behind it that went live after it became releasable', () => {
  const queue = queueOf(topic('optometry-post-x.md', '2026-11-19T10:00:00Z'));
  const files = [scheduled('optometry-post-x.md', '2026-11-10'), published('optometry-post-y.md', '2026-11-23')];
  const run = (records) => checkDueQueue({ today: TODAY, files: [...files, published('optometry-post-today.md', TODAY)], queue, publications: history(records) });
  // y is behind x (scheduled later) and went live on 11-23, after x became releasable on 11-20.
  assert.deepEqual(codes(run([record('optometry-post-y.md', '2026-11-12', '2026-11-23')])).filter((code) => code === 'SKIPPED'), ['SKIPPED']);
  // y was older than x: x was rightly behind it.
  assert.ok(!codes(run([record('optometry-post-y.md', '2026-11-05', '2026-11-23')])).includes('SKIPPED'));
  // y went live before x became releasable: x could not have gone.
  assert.ok(!codes(run([record('optometry-post-y.md', '2026-11-12', '2026-11-19')])).includes('SKIPPED'));
});

test('no releasable post waits past max(queue length + 1, 14) days, even when manual publishes hide it from the counts', () => {
  assert.equal(CEILING_FLOOR_DAYS, 14);
  const queue = queueOf(topic('optometry-post-a.md', '2026-10-01T10:00:00Z'));
  // A goes live nowhere. Someone publishes another post by hand every day, so the
  // count of posts published since is large and OVERDUE stays quiet.
  const run = (today, coversFrom = '2020-01-01') => {
    const files = [scheduled('optometry-post-a.md', '2026-11-01')];
    for (let offset = 0; offset <= 20; offset += 1) {
      if (addDay('2026-11-01', offset) <= today) files.push(published(`optometry-hand-${offset}.md`, addDay('2026-11-01', offset)));
    }
    return checkDueQueue({ today, files, queue, publications: history([], coversFrom) });
  };
  assert.equal(run('2026-11-15').ok, true, 'waited 14 days is at the ceiling');
  const red = run('2026-11-16');
  assert.deepEqual(codes(red), ['CEILING'], 'waited 15 days is one past it');
  assert.match(red.failures[0].detail, /waited 15 day\(s\).*ceiling of 14/);
  // History that does not reach back to the day the post became releasable is
  // incomplete: the ceiling falls back to the safe count and does not guess.
  assert.equal(run('2026-11-16', '2026-11-10').ok, true);
});

// ---------------------------------------------------------------------------
// Rule 3: held posts

test('a post held by the release gate is reported and never fails the publisher', () => {
  const queue = queueOf(topic('optometry-post-a.md', '2026-11-20T10:00:00Z'));
  const held = scheduled('optometry-post-held.md', '2026-11-20', { topic: false });
  const dental = scheduled('dental-post.md', '2026-11-20');
  const releasable = scheduled('optometry-post-a.md', '2026-11-24');
  const files = [held, releasable, dental, published('optometry-post-new.md', TODAY)];
  const result = checkDueQueue({ today: TODAY, files, queue: { ...queue, topics: [...queue.topics, topic('dental-post.md', '2026-11-20T10:00:00Z')] } });
  assert.equal(result.ok, true);
  assert.deepEqual(result.failures, []);
  assert.deepEqual(result.held.map((entry) => entry.file).sort(), ['dental-post.md', 'optometry-post-held.md']);
  const byFile = Object.fromEntries(result.held.map((entry) => [entry.file, entry.issues]));
  assert.deepEqual(byFile['optometry-post-held.md'], ['RED_SCHEDULED_POST_NOT_APPROVED:optometry-post-held.md']);
  assert.deepEqual(byFile['dental-post.md'], ['RED_POST_OUT_OF_SCOPE:dental-post.md']);
  assert.equal(result.queue[0].file, 'optometry-post-a.md');
  assert.equal(result.queue[0].ahead, 0, 'a held post is not ahead of anyone: the publish job skips it');
  const lines = formatReport(result);
  assert.ok(lines.some((line) => line.startsWith('::warning::') && line.includes('optometry-post-held.md')));
  assert.ok(!lines.some((line) => line.startsWith('::error::')));
});

test('only held posts due and nothing published is not a publisher fault', () => {
  const files = [scheduled('optometry-post-held.md', '2026-11-20', { topic: false }), published('optometry-post-old.md', '2026-11-20')];
  const result = checkDueQueue({ today: TODAY, files, queue: queueOf() });
  assert.equal(result.ok, true);
  assert.equal(result.held.length, 1);
});

test('a post held for more than 14 days fails with its hold reason; up to 14 days it warns', () => {
  assert.equal(HELD_LIMIT_DAYS, 14);
  const run = (scheduledDate) => checkDueQueue({
    today: TODAY,
    files: [scheduled('optometry-post-held.md', scheduledDate, { topic: false }), published('optometry-post-new.md', TODAY)],
    queue: queueOf(),
  });
  const warned = run(addDay(TODAY, -14));
  assert.equal(warned.ok, true, 'held exactly 14 days is still a warning');
  assert.ok(formatReport(warned).some((line) => line.startsWith('::warning::') && line.includes('14 day(s)')));

  const failed = run(addDay(TODAY, -15));
  assert.equal(failed.ok, false);
  assert.deepEqual(codes(failed), ['HELD_TOO_LONG']);
  assert.match(failed.failures[0].detail, /held by the release gate for 15 day\(s\) since it was due on 2026-11-10 \(limit 14\): RED_SCHEDULED_POST_NOT_APPROVED:optometry-post-held\.md/);
  const lines = formatReport(failed);
  assert.ok(lines.some((line) => line.startsWith('::error::HELD_TOO_LONG')));
  assert.ok(!lines.some((line) => line.startsWith('::warning::Held')), 'a failing hold is reported once, as an error');
});

// ---------------------------------------------------------------------------
// Unreadable inputs

test('an unreadable topic queue fails when posts are due and passes when none are', () => {
  const due = [scheduled('optometry-post-a.md', '2026-11-24'), published('optometry-post-new.md', TODAY)];
  assert.deepEqual(codes(checkDueQueue({ today: TODAY, files: due, queue: null })), ['QUEUE_UNREADABLE']);
  assert.equal(checkDueQueue({ today: TODAY, files: [scheduled('optometry-post-a.md', '2026-12-01')], queue: null }).ok, true);
});

test('a post whose frontmatter cannot be read fails loudly', () => {
  const files = [{ name: 'optometry-post-bad.md', content: '---\nstatus: [unclosed\n---\n' }];
  const result = checkDueQueue({ today: TODAY, files, queue: queueOf() });
  assert.deepEqual(codes(result), ['FRONTMATTER_UNREADABLE']);
});

// ---------------------------------------------------------------------------
// The publish history

test('the publish commit diff gives each post its original scheduledDate and the day it went live', () => {
  const diff = [
    '\u0001aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\tPublish scheduled posts for 2026-11-25',
    '',
    'diff --git a/src/content/blog/eye-care-recall-attribution-playbook.md b/src/content/blog/eye-care-recall-attribution-playbook.md',
    'index 111..222 100644',
    '--- a/src/content/blog/eye-care-recall-attribution-playbook.md',
    '+++ b/src/content/blog/eye-care-recall-attribution-playbook.md',
    "@@ -5,3 +5,2 @@ title",
    "-publishDate: '2026-10-26'",
    '-status: scheduled',
    "-scheduledDate: '2026-10-26'",
    "+publishDate: '2026-11-25'",
    '+status: published',
    'diff --git a/src/content/blog/other-post.mdx b/src/content/blog/other-post.mdx',
    '@@ -5,3 +5,2 @@',
    '-publishDate: 2026-10-21\r',
    '-status: "scheduled"\r',
    '-scheduledDate: 2026-10-21\r',
    '+publishDate: 2026-11-23\r',
    '+status: published\r',
    '\u0001bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb\tPublish scheduled posts for 2026-11-26',
    '',
    // On time: publishDate was already the day it went live, so the diff has no publishDate line.
    'diff --git a/src/content/blog/on-time-post.md b/src/content/blog/on-time-post.md',
    '-status: scheduled',
    '+status: published',
    "-scheduledDate: '2026-11-26'",
    'diff --git a/src/content/blog/not-a-publish.md b/src/content/blog/not-a-publish.md',
    "-scheduledDate: '2026-10-30'",
    "+publishDate: '2026-11-26'",
    '+status: draft',
  ].join('\n');
  assert.deepEqual(parsePublishDiff(diff), [
    { file: 'eye-care-recall-attribution-playbook.md', scheduledDate: '2026-10-26', publishedOn: '2026-11-25' },
    { file: 'other-post.mdx', scheduledDate: '2026-10-21', publishedOn: '2026-11-23' },
    { file: 'on-time-post.md', scheduledDate: '2026-11-26', publishedOn: '2026-11-26' },
  ]);
});

// A real repository: a seed commit with five scheduled posts, then the publish job's
// commit releasing one of them, as the Publish Scheduled Posts workflow commits it.
function historyRepo(root, { release }) {
  const git = (args, cwd = root, date = '2026-11-06T09:00:00Z') => {
    const run = spawnSync('git', args, {
      cwd,
      encoding: 'utf8',
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: 'test', GIT_AUTHOR_EMAIL: 'test@example.invalid',
        GIT_COMMITTER_NAME: 'test', GIT_COMMITTER_EMAIL: 'test@example.invalid',
        GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date,
      },
    });
    assert.equal(run.status, 0, `git ${args.join(' ')}: ${run.stderr}`);
    return run.stdout;
  };
  const { files, topics } = backlog(5, { dates: ['2026-11-05', '2026-11-05', '2026-11-06', '2026-11-06', '2026-11-06'] });
  const blog = path.join(root, 'src/content/blog');
  fs.mkdirSync(blog, { recursive: true });
  fs.mkdirSync(path.join(root, 'config'));
  for (const file of files) fs.writeFileSync(path.join(blog, file.name), file.content);
  fs.writeFileSync(path.join(root, 'config/seo-topic-queue.json'), JSON.stringify(queueOf(...topics)));
  git(['init', '-q', '-b', 'main']);
  git(['add', '-A']);
  git(['commit', '-q', '-m', 'seed'], root, '2026-11-01T08:00:00Z');
  const repo = new Repo(files);
  const chosen = repo.publishOne('2026-11-06', (due) => due.find((entry) => entry.file === release));
  fs.writeFileSync(path.join(blog, chosen), repo.contents.get(chosen));
  git(['add', '-A']);
  git(['commit', '-q', '-m', 'Publish scheduled posts for 2026-11-06']);
  git(['config', 'uploadpack.allowFilter', 'true']);
  git(['config', 'uploadpack.allowAnySHA1InWant', 'true']);
  return { blog, git, queue: path.join(root, 'config/seo-topic-queue.json') };
}

const gate = (cwd, ...args) => spawnSync(process.execPath, [path.join(repoRoot, 'scripts/check-due-queue.mjs'), ...args], { cwd, encoding: 'utf8' });

test('the gate reads the publish job from real git history and catches the wrong post', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-due-queue-git-'));
  try {
    const good = path.join(dir, 'good');
    const bad = path.join(dir, 'bad');
    fs.mkdirSync(good);
    fs.mkdirSync(bad);
    const goodRepo = historyRepo(good, { release: 'optometry-post-00.md' });
    const badRepo = historyRepo(bad, { release: 'optometry-post-04.md' });

    const publications = readPublications(goodRepo.blog);
    assert.deepEqual(publications.records, [{ file: 'optometry-post-00.md', scheduledDate: '2026-11-05', publishedOn: '2026-11-06' }]);
    assert.equal(publications.coversFrom, '2026-11-01');

    const healthy = gate(good, '--blog-dir', goodRepo.blog, '--queue', goodRepo.queue, '--today', '2026-11-06');
    assert.equal(healthy.status, 0, healthy.stdout + healthy.stderr);
    assert.doesNotMatch(healthy.stdout, /::warning::/);

    const wrong = gate(bad, '--blog-dir', badRepo.blog, '--queue', badRepo.queue, '--today', '2026-11-06');
    assert.equal(wrong.status, 1);
    assert.match(wrong.stdout, /::error::WRONG_POST_PUBLISHED: optometry-post-00\.md \(scheduled 2026-11-05\) was first in line today, but optometry-post-04\.md/);

    // --history off is the unverified path: the same repo passes with a warning.
    const off = gate(bad, '--blog-dir', badRepo.blog, '--queue', badRepo.queue, '--today', '2026-11-06', '--history', 'off');
    assert.equal(off.status, 0);
    assert.match(off.stdout, /::warning::Publish history is not available/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("the workflow's history fetch turns a depth-1 checkout into one the gate can read", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-due-queue-shallow-'));
  try {
    const source = path.join(dir, 'source');
    fs.mkdirSync(source);
    const { git } = historyRepo(source, { release: 'optometry-post-04.md' });
    const sha = git(['rev-parse', 'HEAD']).trim();
    // A checkout like actions/checkout makes: one commit, no history.
    const clone = path.join(dir, 'clone');
    git(['clone', '-q', '--depth', '1', `file://${source}`, clone], dir);
    const args = ['--blog-dir', path.join(clone, 'src/content/blog'), '--queue', path.join(clone, 'config/seo-topic-queue.json'), '--today', '2026-11-06'];

    const before = gate(clone, ...args);
    assert.equal(before.status, 0, 'without history the wrong post cannot be seen');
    assert.match(before.stdout, /::warning::No publish record found in history for optometry-post-04\.md/);

    // The fetch the workflow runs, with the window set to cover the seed commit.
    git(['fetch', '--no-tags', '--quiet', '--filter=blob:none', '--shallow-since=2026-10-31', 'origin', sha], clone);
    const after = gate(clone, ...args);
    assert.equal(after.status, 1, after.stdout);
    assert.match(after.stdout, /::error::WRONG_POST_PUBLISHED/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------------------
// Wiring

test('the workflow fetches history, explains its timing, and runs this gate in place of the old due-today loop', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github/workflows/daily-post-check.yml'), 'utf8');
  assert.match(workflow, /node scripts\/check-due-queue\.mjs/);
  assert.match(workflow, /git fetch --no-tags --quiet --filter=blob:none --shallow-since=/);
  assert.match(workflow, /Timing: this gate reads the repository after the publish job/);
  assert.match(workflow, /reports "nothing published today"/);
  assert.doesNotMatch(workflow, /Due today but still scheduled/);
  assert.match(workflow, /name: Find posts published in last 48 hours/);
  assert.match(workflow, /name: Aggregate validator outcomes/);
});

test('the command line exits 0 on a healthy queue, 1 on a publishing fault and 2 on bad input', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-due-queue-'));
  try {
    const blogDir = path.join(dir, 'blog');
    fs.mkdirSync(blogDir);
    const { files, queue } = realQueueState();
    for (const file of files) fs.writeFileSync(path.join(blogDir, file.name), file.content);
    const queuePath = path.join(dir, 'queue.json');
    fs.writeFileSync(queuePath, JSON.stringify(queue));
    const run = (...args) => gate(dir, '--blog-dir', blogDir, '--queue', queuePath, ...args);

    const healthy = run('--today', TODAY);
    assert.equal(healthy.status, 0, healthy.stdout + healthy.stderr);
    assert.match(healthy.stdout, /Due queue is healthy\./);

    // The next day, before the publish job has run, nothing has gone out yet.
    const stalled = run('--today', '2026-11-26');
    assert.equal(stalled.status, 1);
    assert.match(stalled.stdout, /::error::NOTHING_PUBLISHED_TODAY/);

    assert.equal(run('--today', 'not-a-day').status, 2);
    assert.equal(run('--today', TODAY, '--history', 'maybe').status, 2);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
