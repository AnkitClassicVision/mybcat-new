import test from 'node:test';
import assert from 'node:assert/strict';
import { bindScheduledPosts } from '../../scripts/bind-scheduled-approvals.mjs';
import { evaluatePublishRelease } from '../../scripts/validate-seo-topic-queue.mjs';

test('binder registers a cited scheduled post and release then passes on a stale feed', () => {
  const urls = [1, 2, 3, 4, 5].map((n) => `https://example${n}.org/source`).join('\n');
  const queue = { topics: [], required_external_source_count: 5 };
  const files = [{
    name: 'new-post.md',
    content: `---\nstatus: scheduled\ntitle: New Post\ntargetKeyword: new post\n---\n${urls}\n`,
  }];
  const bound = bindScheduledPosts(queue, files, new Date('2026-10-09T02:00:00Z'));
  assert.deepEqual(bound.bound, ['new-post']);
  assert.deepEqual(bound.skipped, []);
  assert.match(files[0].content, /seoTopicId: new-post/);
  queue.opportunity_feed_as_of = '2026-01-01T00:00:00Z';
  const release = evaluatePublishRelease(queue, files);
  assert.equal(release.ok, true, release.issues.join(','));
});

test('binder does not approve a scheduled post with too few citations', () => {
  const queue = { topics: [] };
  const files = [{
    name: 'thin.md',
    content: '---\nstatus: scheduled\ntitle: Thin\n---\nhttps://example.org/one\n',
  }];
  const bound = bindScheduledPosts(queue, files);
  assert.deepEqual(bound.bound, []);
  assert.deepEqual(bound.skipped, ['thin']);
  assert.equal(evaluatePublishRelease(queue, files).ok, false);
});
