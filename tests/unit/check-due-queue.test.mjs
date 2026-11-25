import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { SLACK_DAYS, checkDueQueue, formatReport, publishOrder } from '../../scripts/check-due-queue.mjs';

// The Daily New Post Health Check must not fail because a post dated today is
// waiting behind older posts: the publish job releases one post a day, oldest
// first. It must still fail when publishing really stalls. These tests cover
// today's real queue, a day with no publish, an overdue post, and a held post.

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TODAY = '2026-11-25';

const RULE = { id: 'auto-release-v1', approved_by: 'owner', approved_at: '2026-11-23T19:40:04Z', enabled: true };

function post(name, { status, scheduledDate, publishDate, topic = true }) {
  const slug = name.replace(/\.md$/, '');
  const lines = [
    '---',
    `title: "Post ${slug}"`,
    `targetKeyword: "optometry ${slug}"`,
    `status: ${status}`,
    `publishDate: '${publishDate ?? scheduledDate}'`,
  ];
  if (scheduledDate) lines.push(`scheduledDate: '${scheduledDate}'`);
  if (topic) lines.push(`seoTopicId: ${slug}`);
  lines.push('---', '', 'Body.', '');
  return { name, content: lines.join('\n') };
}

const scheduled = (name, scheduledDate, extra = {}) => post(name, { status: 'scheduled', scheduledDate, ...extra });
const published = (name, publishDate) => post(name, { status: 'published', publishDate, topic: false });

function topic(name, approvedAt, { automatic = false } = {}) {
  const id = name.replace(/\.md$/, '');
  return {
    id,
    status: 'publish_ready',
    research_reviewed: true,
    claims_reviewed: true,
    cannibalization_reviewed: true,
    required_external_source_count: 1,
    evidence_set: ['source-1'],
    approval: automatic
      ? { decision: 'approved', mode: 'automatic', owner: `standing-rule:${RULE.id}`, rule_id: RULE.id, approved_at: approvedAt }
      : { decision: 'approved', owner: 'human-owner', approved_at: approvedAt },
  };
}

const queueOf = (...topics) => ({ standing_release_rule: RULE, topics });
const names = (entries) => entries.map((entry) => entry.file);
const codes = (result) => result.failures.map((failure) => failure.code);

// The queue as it stood on 2026-11-25 after today's publish: one post went out
// today, seven are due behind it and six are dated later. One due post, the
// last, is dated today and still scheduled. That is the state the old gate
// failed every day.
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
      published('eye-care-recall-a.md', '2026-11-23'),
      published('eye-care-recall-b.md', '2026-11-23'),
      published('optometry-older-post.md', '2026-09-26'),
    ],
    queue: queueOf(...all.map(([name, , approvedAt]) => topic(name, approvedAt, { automatic: true }))),
    dueNames: due.map(([name]) => name),
  };
}

test("today's real queue passes: a post dated today waits behind older posts", () => {
  const { files, queue, dueNames } = realQueueState();
  assert.ok(
    files.some((file) => /^status: scheduled$/m.test(file.content) && file.content.includes(`scheduledDate: '${TODAY}'`)),
    'the fixture must hold the state the old gate failed on: a post dated today, still scheduled',
  );
  const result = checkDueQueue({ today: TODAY, files, queue });
  assert.deepEqual(result.failures, []);
  assert.equal(result.ok, true);
  assert.equal(result.publishedToday, 1);
  assert.deepEqual(names(result.queue), dueNames, 'the due queue is in publish order, oldest scheduledDate first');
  assert.deepEqual(result.held, []);
});

test('the queue stays green on every day while it drains, one post a day', () => {
  const { files, queue } = realQueueState();
  const state = new Map(files.map((file) => [file.name, file.content]));
  let day = TODAY;
  for (let step = 0; step < 14; step += 1) {
    day = new Date(Date.parse(day) + 86_400_000).toISOString().split('T')[0];
    // The publish job: one post a day, oldest scheduledDate first.
    const dueToday = [...state.entries()]
      .filter(([, content]) => /^status: scheduled$/m.test(content) && content.match(/^scheduledDate: '(.+)'$/m)[1] <= day)
      .map(([name, content]) => ({ file: name, scheduledDate: content.match(/^scheduledDate: '(.+)'$/m)[1] }))
      .sort(publishOrder);
    if (dueToday.length > 0) {
      const { file } = dueToday[0];
      state.set(file, state.get(file)
        .replace(/^status: scheduled$/m, 'status: published')
        .replace(/^publishDate: .*$/m, `publishDate: '${day}'`)
        .replace(/^scheduledDate: .*\n/m, ''));
    }
    const result = checkDueQueue({ today: day, files: [...state].map(([name, content]) => ({ name, content })), queue });
    assert.deepEqual(result.failures, [], `${day} must be green while the queue drains`);
  }
  assert.ok([...state.values()].every((content) => /^status: published$/m.test(content)), 'the queue is empty at the end');
});

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
  // A post went live today: the queue behind it is waiting its turn.
  assert.equal(checkDueQueue({
    today: TODAY,
    files: [scheduled('optometry-post-a.md', '2026-11-24'), published('optometry-post-new.md', TODAY)],
    queue,
  }).ok, true);
  // Nothing is due, so nothing was owed.
  assert.equal(checkDueQueue({
    today: TODAY,
    files: [scheduled('optometry-post-a.md', '2026-11-26'), published('optometry-post-old.md', '2026-11-20')],
    queue,
  }).ok, true);
  // The only due post was approved today and has not had a publish run yet.
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

test('the order is the publish job: oldest scheduledDate first, then filename', () => {
  const sorted = [
    { file: 'b.md', scheduledDate: '2026-10-02' },
    { file: 'z.md', scheduledDate: '2026-10-01' },
    { file: 'a.md', scheduledDate: '2026-10-02' },
  ].sort(publishOrder).map((entry) => entry.file);
  assert.deepEqual(sorted, ['z.md', 'a.md', 'b.md']);
});

test('drift guard: the publish job still orders, gates and caps the way this gate assumes', () => {
  // scripts/publish-scheduled.js runs at load and cannot be imported. Pin the
  // three facts this gate relies on. A failure here means read this gate again.
  const source = fs.readFileSync(path.join(repoRoot, 'scripts/publish-scheduled.js'), 'utf8').replace(/\s+/g, ' ');
  assert.ok(source.includes("import { evaluateScheduledPost } from './validate-seo-topic-queue.mjs';"), 'release gate is evaluateScheduledPost');
  assert.ok(source.includes('evaluateScheduledPost(topicQueue,'), 'release gate runs per post');
  assert.ok(source.includes('if (a.scheduledDate !== b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate); return a.file.localeCompare(b.file);'), 'oldest scheduledDate first, then filename');
  assert.ok(source.includes('const MAX_DAILY_PUBLISH = 1;'), 'one post a day');
  assert.ok(source.includes("data.status === 'scheduled' && data.scheduledDate"), 'what counts as a scheduled post');
  assert.ok(source.includes('scheduledDate <= today'), 'what counts as due');
});

test('the workflow runs this gate in place of the old due-today loop', () => {
  const workflow = fs.readFileSync(path.join(repoRoot, '.github/workflows/daily-post-check.yml'), 'utf8');
  assert.match(workflow, /node scripts\/check-due-queue\.mjs/);
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
    const run = (...args) => spawnSync(process.execPath, [path.join(repoRoot, 'scripts/check-due-queue.mjs'), '--blog-dir', blogDir, '--queue', queuePath, ...args], { cwd: dir, encoding: 'utf8' });

    const healthy = run('--today', TODAY);
    assert.equal(healthy.status, 0, healthy.stdout + healthy.stderr);
    assert.match(healthy.stdout, /Due queue is healthy\./);

    // The next day, before the publish job has run, nothing has gone out yet.
    const stalled = run('--today', '2026-11-26');
    assert.equal(stalled.status, 1);
    assert.match(stalled.stdout, /::error::NOTHING_PUBLISHED_TODAY/);

    assert.equal(run('--today', 'not-a-day').status, 2);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
