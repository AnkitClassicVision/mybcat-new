import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQueue, evaluateRun, evaluateScheduledPosts, evaluatePublishRelease } from '../../scripts/validate-seo-topic-queue.mjs';

function validQueue() {
  const funnels = ['acquisition', 'acquisition', 'acquisition', 'acquisition', 'acquisition', 'service', 'service', 'acquisition', 'acquisition', 'acquisition', 'acquisition', 'acquisition', 'service', 'service'];
  return {
    opportunity_feed_as_of: '2026-08-11T12:00:00Z',
    stale_after_hours: 48,
    minimum_approved_topics: 14,
    minimum_publish_ready: 7,
    weekly_allocation: { acquisition: 5, service: 2 },
    topics: funnels.map((funnel, index) => ({
      id: `topic-${index + 1}`,
      slot: index + 1,
      funnel,
      status: 'publish_ready',
      evidence_set: ['source-1'],
      required_external_source_count: 1,
      research_reviewed: true,
      cannibalization_reviewed: true,
      claims_reviewed: true,
      approval: { decision: 'approved', owner: 'human-owner', approved_at: '2026-08-11T12:00:00Z' },
    })),
  };
}

test('valid 14-topic queue with seven ready posts and 5/2 allocation passes', () => {
  const result = evaluateQueue(validQueue(), new Date('2026-08-11T13:00:00Z'));
  assert.deepEqual(result, {
    ok: true,
    issues: [],
    required_readiness: 'publish_ready',
    counts: { candidates: 14, approved: 14, draft_ready: 14, publish_ready: 14 },
  });
});

test('draft-ready topics pass local readiness without claim approval', () => {
  const queue = validQueue();
  for (const topic of queue.topics) {
    topic.status = 'draft_ready';
    topic.claims_reviewed = false;
  }
  const result = evaluateQueue(queue, new Date('2026-08-11T13:00:00Z'), 'draft_ready');
  assert.equal(result.ok, true);
  assert.equal(result.counts.draft_ready, 14);
  assert.equal(result.counts.publish_ready, 0);
});

test('draft-ready topics do not pass the publish-ready gate', () => {
  const queue = validQueue();
  for (const topic of queue.topics) {
    topic.status = 'draft_ready';
    topic.claims_reviewed = false;
  }
  const result = evaluateQueue(queue, new Date('2026-08-11T13:00:00Z'), 'publish_ready');
  assert.equal(result.ok, false);
  assert.ok(result.issues.includes('RED_ZERO_PUBLISH_READY_POSTS'));
});

test('empty and stale queues fail with explicit red states', () => {
  const result = evaluateQueue({ topics: [], opportunity_feed_as_of: '2026-01-01T00:00:00Z' }, new Date('2026-08-11T13:00:00Z'));
  assert.ok(result.issues.includes('RED_ZERO_CANDIDATES'));
  assert.ok(result.issues.includes('RED_STALE_OPPORTUNITY_FEED'));
  assert.ok(result.issues.includes('RED_ZERO_APPROVED_TOPICS'));
  assert.ok(result.issues.includes('RED_ZERO_PUBLISH_READY_POSTS'));
});

test('human-approved publication window covers all ten scheduled 09:00Z runs', () => {
  const queue = validQueue();
  queue.opportunity_feed_as_of = '2026-08-13T16:00:00Z';
  queue.publication_window = {
    approved_by: 'Ankit',
    approved_at: '2026-08-13T18:00:00Z',
    valid_through: '2026-08-23T10:00:00Z',
  };

  for (let day = 14; day <= 23; day += 1) {
    const runAt = `2026-08-${String(day).padStart(2, '0')}T09:00:00Z`;
    assert.equal(evaluateQueue(queue, new Date(runAt)).ok, true, runAt);
  }
});

test('human-approved publication window becomes stale immediately after valid_through', () => {
  const queue = validQueue();
  queue.opportunity_feed_as_of = '2026-08-13T16:00:00Z';
  queue.publication_window = {
    approved_by: 'Ankit',
    approved_at: '2026-08-13T18:00:00Z',
    valid_through: '2026-08-23T10:00:00Z',
  };

  assert.equal(evaluateQueue(queue, new Date('2026-08-23T10:00:00Z')).ok, true);
  assert.ok(evaluateQueue(queue, new Date('2026-08-23T10:00:00.001Z')).issues.includes('RED_STALE_OPPORTUNITY_FEED'));
});

test('malformed publication approval metadata fails closed as stale', () => {
  const malformedWindows = [
    { approved_by: '', approved_at: '2026-08-13T18:00:00Z', valid_through: '2026-08-20T10:00:00Z' },
    { approved_by: 'Ankit', approved_at: 'not-a-date', valid_through: '2026-08-20T10:00:00Z' },
    { approved_by: 'Ankit', approved_at: 1786644000000, valid_through: '2026-08-20T10:00:00Z' },
    { approved_by: 'Ankit', approved_at: '2026-08-13T18:00:00Z', valid_through: 'not-a-date' },
    { approved_by: 'Ankit', approved_at: '2026-08-13T18:00:00Z', valid_through: '2026-08-13T17:00:00Z' },
    { approved_by: 'Ankit', approved_at: '2026-08-14T18:00:00Z', valid_through: '2026-08-20T10:00:00Z' },
  ];

  for (const publicationWindow of malformedWindows) {
    const queue = validQueue();
    queue.opportunity_feed_as_of = '2026-08-13T16:00:00Z';
    queue.publication_window = publicationWindow;
    assert.ok(evaluateQueue(queue, new Date('2026-08-14T09:00:00Z')).issues.includes('RED_STALE_OPPORTUNITY_FEED'));
  }
});

test('publication window longer than ten days from opportunity feed fails closed as stale', () => {
  const queue = validQueue();
  queue.publication_window = {
    approved_by: 'Ankit',
    approved_at: '2026-08-11T13:00:00Z',
    valid_through: '2026-08-21T12:00:00.001Z',
  };

  assert.ok(evaluateQueue(queue, new Date('2026-08-12T09:00:00Z')).issues.includes('RED_STALE_OPPORTUNITY_FEED'));
});

test('a nominally successful zero-output run is red, not green', () => {
  const result = evaluateRun({ status: 'success', candidates: 0, queued_topics: 0, published_posts: 0 });
  assert.equal(result.ok, false);
  assert.ok(result.issues.includes('RED_ZERO_QUEUED_TOPICS'));
  assert.ok(result.issues.includes('RED_NO_POST_PUBLISHED'));
  assert.ok(result.issues.includes('RED_SILENT_GREEN_RUN'));
});

test('scheduled content must map to a publish-ready approved topic', () => {
  const queue = validQueue();
  const good = evaluateScheduledPosts(queue, [{ name: 'optometry-good.md', content: 'status: scheduled\nseoTopicId: topic-1\n' }]);
  const bad = evaluateScheduledPosts(queue, [{ name: 'bad.md', content: 'status: scheduled\n' }]);
  assert.equal(good.ok, true);
  assert.equal(bad.ok, false);
  assert.ok(bad.issues[0].startsWith('RED_SCHEDULED_POST_NOT_APPROVED'));
});

test('scheduled topic without approval fails even when the queue meets global minimums', () => {
  const queue = validQueue();
  queue.topics.push({
    ...queue.topics[0],
    id: 'scheduled-without-approval',
    slot: 15,
    approval: undefined,
  });

  assert.equal(evaluateQueue(queue, new Date('2026-08-11T13:00:00Z')).ok, true);
  const result = evaluateScheduledPosts(queue, [{
    name: 'optometry-unapproved.md',
    content: 'status: scheduled\nseoTopicId: scheduled-without-approval\n',
  }]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.issues, ['RED_SCHEDULED_POST_NOT_APPROVED:optometry-unapproved.md']);
});

test('release ignores an expired opportunity window when the scheduled post is already approved', () => {
  const queue = validQueue();
  queue.opportunity_feed_as_of = '2026-01-01T00:00:00Z';
  const files = [{ name: 'optometry-good.md', content: 'status: scheduled\nseoTopicId: topic-1\n' }];
  const release = evaluatePublishRelease(queue, files);
  assert.equal(release.ok, true);
  assert.deepEqual(release.issues, []);
  assert.ok(release.intake_issues.includes('RED_STALE_OPPORTUNITY_FEED'));
  assert.equal(evaluateQueue(queue, new Date('2026-08-11T13:00:00Z')).ok, false);
});

test('release still rejects a scheduled post with no approval link', () => {
  const queue = validQueue();
  const release = evaluatePublishRelease(queue, [{ name: 'bad.md', content: 'status: scheduled\n' }]);
  assert.equal(release.ok, false);
  assert.ok(release.issues[0].startsWith('RED_SCHEDULED_POST_NOT_APPROVED'));
});
