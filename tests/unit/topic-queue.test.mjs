import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateQueue, evaluateRun, evaluateScheduledPosts } from '../../scripts/validate-seo-topic-queue.mjs';

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

test('a nominally successful zero-output run is red, not green', () => {
  const result = evaluateRun({ status: 'success', candidates: 0, queued_topics: 0, published_posts: 0 });
  assert.equal(result.ok, false);
  assert.ok(result.issues.includes('RED_ZERO_QUEUED_TOPICS'));
  assert.ok(result.issues.includes('RED_NO_POST_PUBLISHED'));
  assert.ok(result.issues.includes('RED_SILENT_GREEN_RUN'));
});

test('scheduled content must map to a publish-ready approved topic', () => {
  const queue = validQueue();
  const good = evaluateScheduledPosts(queue, [{ name: 'good.md', content: 'status: scheduled\nseoTopicId: topic-1\n' }]);
  const bad = evaluateScheduledPosts(queue, [{ name: 'bad.md', content: 'status: scheduled\n' }]);
  assert.equal(good.ok, true);
  assert.equal(bad.ok, false);
  assert.ok(bad.issues[0].startsWith('RED_SCHEDULED_POST_NOT_APPROVED'));
});
