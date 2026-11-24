import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

test('binder never dates an automatic approval before the standing rule', () => {
  const queue = { topics: [], required_external_source_count: 5, standing_release_rule: RULE };
  const files = [citedPost('optometry-new-post.md', 'Optometry New Post')];
  bindScheduledPosts(queue, files, new Date('2026-11-01T08:00:00Z'));
  assert.equal(queue.topics[0].approval.approved_at, RULE.approved_at);
  assert.equal(queue.topics[0].research_reviewed_at, RULE.approved_at);
  queue.opportunity_feed_as_of = '2026-01-01T00:00:00Z';
  assert.equal(evaluatePublishRelease(queue, files).ok, true);
});

test('binder keeps a bind time that is later than the standing rule', () => {
  const queue = { topics: [], required_external_source_count: 5, standing_release_rule: RULE };
  bindScheduledPosts(queue, [citedPost('optometry-new-post.md', 'Optometry New Post')], new Date('2026-11-24T02:00:00Z'));
  assert.equal(queue.topics[0].approval.approved_at, '2026-11-24T02:00:00Z');
});

// A queue topic a person added. Its id differs from its slug, and it is held
// (draft_ready, claims not reviewed), so the release gate must not pass it.
function heldHumanTopic() {
  return {
    id: 'seller-held-topic',
    slot: 1,
    slug: 'optometry-held-post',
    status: 'draft_ready',
    approval: { decision: 'approved', owner: 'human-owner', approved_at: '2026-11-01T12:00:00Z' },
    research_reviewed: true,
    claims_reviewed: false,
    evidence_set: [1, 2, 3, 4, 5].map((n) => ({ url: `https://example${n}.org/source` })),
    cannibalization_reviewed: true,
  };
}

test('binder adds no second entry for a held topic whose id differs from its slug, and the gate holds the post', () => {
  const queue = { required_external_source_count: 5, standing_release_rule: RULE, topics: [heldHumanTopic()] };
  const files = [citedPost('optometry-held-post.md', 'Optometry Held Post')];
  const queueBefore = JSON.stringify(queue, null, 2);
  const postBefore = files[0].content;
  const bound = bindScheduledPosts(queue, files, new Date('2026-11-24T02:00:00Z'));
  assert.deepEqual(bound.bound, []);
  assert.deepEqual(bound.skipped, ['optometry-held-post']);
  assert.match(bound.reasons['optometry-held-post'], /already holds this slug/);
  assert.equal(queue.topics.length, 1);
  assert.equal(JSON.stringify(queue, null, 2), queueBefore);
  assert.equal(files[0].content, postBefore);
  const release = evaluatePublishRelease(queue, files);
  assert.equal(release.ok, false);
  assert.deepEqual(release.releasable, []);
  assert.deepEqual(release.held.map((entry) => entry.name), ['optometry-held-post.md']);
});

test('binder command leaves the queue file and the post file byte for byte unchanged for a held topic', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bind-held-'));
  try {
    const queuePath = path.join(dir, 'queue.json');
    const postDir = path.join(dir, 'blog');
    fs.mkdirSync(postDir);
    const queue = { required_external_source_count: 5, standing_release_rule: RULE, topics: [heldHumanTopic()] };
    fs.writeFileSync(queuePath, `${JSON.stringify(queue, null, 2)}\n`);
    const post = citedPost('optometry-held-post.md', 'Optometry Held Post');
    fs.writeFileSync(path.join(postDir, post.name), post.content);
    const queueBytes = fs.readFileSync(queuePath);
    const script = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts', 'bind-scheduled-approvals.mjs');
    const out = JSON.parse(execFileSync(process.execPath, [script, queuePath, '--scheduled-dir', postDir], { encoding: 'utf8' }));
    assert.deepEqual(out.bound, []);
    assert.deepEqual(out.skipped, ['optometry-held-post']);
    assert.ok(fs.readFileSync(queuePath).equals(queueBytes));
    assert.equal(fs.readFileSync(path.join(postDir, post.name), 'utf8'), post.content);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('binder still registers and releases a new post when no queue topic holds its slug', () => {
  const queue = { required_external_source_count: 5, standing_release_rule: RULE, topics: [heldHumanTopic()] };
  const files = [citedPost('optometry-new-post.md', 'Optometry New Post')];
  const bound = bindScheduledPosts(queue, files, new Date('2026-11-24T02:00:00Z'));
  assert.deepEqual(bound.bound, ['optometry-new-post']);
  assert.deepEqual(bound.skipped, []);
  assert.equal(queue.topics.length, 2);
  assert.equal(queue.topics[1].slug, 'optometry-new-post');
  assert.equal(queue.topics[1].approval.mode, 'automatic');
  assert.match(files[0].content, /seoTopicId: optometry-new-post/);
  queue.opportunity_feed_as_of = '2026-01-01T00:00:00Z';
  const release = evaluatePublishRelease(queue, files);
  assert.equal(release.ok, true, release.issues.join(','));
  assert.deepEqual(release.releasable, ['optometry-new-post.md']);
});
