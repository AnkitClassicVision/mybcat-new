import test from 'node:test';
import assert from 'node:assert/strict';
import { bindScheduledPosts } from '../../scripts/bind-scheduled-approvals.mjs';
import { evaluatePublishRelease } from '../../scripts/validate-seo-topic-queue.mjs';

const RULE = {
  id: 'optometry-auto-release-v1',
  approved_by: 'owner-name',
  approved_at: '2026-11-23T12:00:00Z',
};

const urls = [1, 2, 3, 4, 5].map((n) => `https://example${n}.org/source`).join('\n');

function citedPost(name, title) {
  return {
    name,
    content: `---\nstatus: scheduled\ntitle: ${title}\ntargetKeyword: ${title.toLowerCase()}\n---\n${urls}\n`,
  };
}

test('binder registers a cited optometry post under the standing rule and release then passes on a stale feed', () => {
  const queue = { topics: [], required_external_source_count: 5, standing_release_rule: RULE };
  const files = [citedPost('optometry-new-post.md', 'Optometry New Post')];
  const bound = bindScheduledPosts(queue, files, new Date('2026-11-24T02:00:00Z'));
  assert.deepEqual(bound.bound, ['optometry-new-post']);
  assert.deepEqual(bound.skipped, []);
  assert.match(files[0].content, /seoTopicId: optometry-new-post/);
  queue.opportunity_feed_as_of = '2026-01-01T00:00:00Z';
  const release = evaluatePublishRelease(queue, files);
  assert.equal(release.ok, true, release.issues.join(','));
});

test('binder never signs a person\'s name on an automatic approval', () => {
  const queue = { topics: [], required_external_source_count: 5, standing_release_rule: RULE };
  bindScheduledPosts(queue, [citedPost('optometry-new-post.md', 'Optometry New Post')], new Date('2026-11-24T02:00:00Z'));
  const approval = queue.topics[0].approval;
  assert.equal(approval.mode, 'automatic');
  assert.equal(approval.rule_id, RULE.id);
  assert.equal(approval.owner, `standing-rule:${RULE.id}`);
  assert.notEqual(approval.owner, RULE.approved_by);
  assert.match(queue.topics[0].review_basis, /no human review/i);
});

test('binder approves nothing when the owner has not approved a standing rule', () => {
  const queue = { topics: [], required_external_source_count: 5 };
  const files = [citedPost('optometry-new-post.md', 'Optometry New Post')];
  const bound = bindScheduledPosts(queue, files);
  assert.deepEqual(bound.bound, []);
  assert.deepEqual(bound.skipped, ['optometry-new-post']);
  assert.equal(bound.reasons['optometry-new-post'], 'no approved standing release rule');
  assert.deepEqual(queue.topics, []);
  assert.doesNotMatch(files[0].content, /seoTopicId/);
  assert.equal(evaluatePublishRelease(queue, files).ok, false);
});

test('binder does not approve a post that names another specialty', () => {
  const queue = { topics: [], required_external_source_count: 5, standing_release_rule: RULE };
  const files = [citedPost('dental-new-post.md', 'Dental New Post')];
  const bound = bindScheduledPosts(queue, files);
  assert.deepEqual(bound.bound, []);
  assert.deepEqual(bound.skipped, ['dental-new-post']);
  assert.match(bound.reasons['dental-new-post'], /out of scope/);
  assert.deepEqual(queue.topics, []);
});

test('binder does not approve a scheduled post with too few citations', () => {
  const queue = { topics: [], standing_release_rule: RULE };
  const files = [{
    name: 'optometry-thin.md',
    content: '---\nstatus: scheduled\ntitle: Optometry Thin\n---\nhttps://example.org/one\n',
  }];
  const bound = bindScheduledPosts(queue, files);
  assert.deepEqual(bound.bound, []);
  assert.deepEqual(bound.skipped, ['optometry-thin']);
  assert.equal(evaluatePublishRelease(queue, files).ok, false);
});

test('binder does not add a second approval for a topic the queue already holds as not ready', () => {
  const queue = {
    required_external_source_count: 5,
    standing_release_rule: RULE,
    topics: [{
      id: 'optometry-new-post',
      slot: 1,
      status: 'approved',
      approval: { decision: 'approved', owner: 'human-owner', approved_at: '2026-11-01T12:00:00Z' },
    }],
  };
  const files = [citedPost('optometry-new-post.md', 'Optometry New Post')];
  const bound = bindScheduledPosts(queue, files);
  assert.deepEqual(bound.bound, []);
  assert.deepEqual(bound.skipped, ['optometry-new-post']);
  assert.equal(bound.reasons['optometry-new-post'], 'queue topic is not publish-ready');
  assert.equal(queue.topics.length, 1);
});
