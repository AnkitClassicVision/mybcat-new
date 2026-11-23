import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  evaluateOptometryScope,
  evaluateScheduledPost,
  evaluateScheduledPosts,
} from '../../scripts/validate-seo-topic-queue.mjs';

const RULE = {
  id: 'optometry-auto-release-v1',
  approved_by: 'owner-name',
  approved_at: '2026-11-23T12:00:00Z',
};

function topic(overrides = {}) {
  return {
    id: 'optometry-recall-playbook',
    slot: 1,
    funnel: 'service',
    status: 'publish_ready',
    evidence_set: ['source-1'],
    required_external_source_count: 1,
    research_reviewed: true,
    cannibalization_reviewed: true,
    claims_reviewed: true,
    approval: { decision: 'approved', owner: 'human-owner', approved_at: '2026-08-11T12:00:00Z' },
    ...overrides,
  };
}

function post(name, title, topicId = 'optometry-recall-playbook') {
  return {
    name,
    content: `---\ntitle: ${title}\nstatus: scheduled\nseoTopicId: ${topicId}\n---\nBody\n`,
  };
}

test('an optometry or eye care topic is in scope', () => {
  assert.equal(evaluateOptometryScope({ title: 'Optometry Practice Valuation Benchmarks' }).ok, true);
  assert.equal(evaluateOptometryScope({ slug: 'eye-care-recall-postcard-playbook' }).ok, true);
  assert.equal(evaluateOptometryScope({ keyword: 'accounting for optometrist' }).ok, true);
  assert.equal(evaluateOptometryScope({ title: "An OD's Guide to Selling a Practice" }).ok, true);
});

test('a topic that names another specialty is out of scope', () => {
  for (const title of [
    'Unscheduled Treatment Reactivation Dental Groups',
    'How DSOs Size Recall Capacity Before a Blast',
    'Medspa Membership Lapse Reactivation Multi-Location',
    'ENT Group Referral Intake Call Center at Scale',
    'Veterinary Answering Service Guide',
  ]) {
    const result = evaluateOptometryScope({ title });
    assert.equal(result.ok, false, title);
    assert.match(result.reason, /names another specialty/);
  }
});

test('another specialty in the slug is out of scope even with an optometry title', () => {
  const result = evaluateOptometryScope({
    title: 'Recall Playbook for Optometry',
    slug: 'unscheduled-treatment-reactivation-dental-groups-2',
  });
  assert.equal(result.ok, false);
});

test('a general healthcare topic that does not name optometry is out of scope', () => {
  const result = evaluateOptometryScope({
    title: 'Centralized Call Overflow Routing for Healthcare Groups',
    slug: 'centralized-call-overflow-routing-healthcare-groups-2',
  });
  assert.equal(result.ok, false);
  assert.match(result.reason, /does not name optometry/);
});

test('vetting a buyer is not read as a veterinary topic', () => {
  assert.equal(evaluateOptometryScope({ title: 'How to Vet a Buyer for Your Optometry Practice' }).ok, true);
});

test('an approved optometry post is releasable on its own', () => {
  const queue = { topics: [topic()] };
  const result = evaluateScheduledPost(queue, post('optometry-recall-playbook.md', 'Optometry Recall Playbook'));
  assert.deepEqual(result, { name: 'optometry-recall-playbook.md', ok: true, issues: [] });
});

test('an approved post that names another specialty is held back', () => {
  const queue = { topics: [topic({ id: 'dental-recall' })] };
  const result = evaluateScheduledPost(queue, post('dental-recall.md', 'Dental Recall Playbook', 'dental-recall'));
  assert.equal(result.ok, false);
  assert.deepEqual(result.issues, ['RED_POST_OUT_OF_SCOPE:dental-recall.md']);
});

test('one held post does not hold back the others', () => {
  const queue = { topics: [topic(), topic({ id: 'dental-recall', slot: 2 })] };
  const result = evaluateScheduledPosts(queue, [
    post('optometry-recall-playbook.md', 'Optometry Recall Playbook'),
    post('dental-recall.md', 'Dental Recall Playbook', 'dental-recall'),
  ]);
  assert.equal(result.ok, false);
  assert.deepEqual(result.releasable, ['optometry-recall-playbook.md']);
  assert.deepEqual(result.held.map((item) => item.name), ['dental-recall.md']);
});

test('an automatic approval releases nothing until the owner approves a standing rule', () => {
  const automatic = topic({
    approval: {
      decision: 'approved',
      mode: 'automatic',
      owner: `standing-rule:${RULE.id}`,
      rule_id: RULE.id,
      approved_at: RULE.approved_at,
    },
  });
  const file = post('optometry-recall-playbook.md', 'Optometry Recall Playbook');

  const withoutRule = evaluateScheduledPost({ topics: [automatic] }, file);
  assert.equal(withoutRule.ok, false);
  assert.deepEqual(withoutRule.issues, ['RED_STANDING_RULE_NOT_APPROVED:optometry-recall-playbook.md']);

  const withRule = evaluateScheduledPost({ topics: [automatic], standing_release_rule: RULE }, file);
  assert.equal(withRule.ok, true);

  const switchedOff = evaluateScheduledPost(
    { topics: [automatic], standing_release_rule: { ...RULE, enabled: false } },
    file,
  );
  assert.equal(switchedOff.ok, false);

  const otherRule = evaluateScheduledPost(
    { topics: [automatic], standing_release_rule: { ...RULE, id: 'another-rule' } },
    file,
  );
  assert.equal(otherRule.ok, false);
});

test('a standing rule without an owner or a date approves nothing', () => {
  const automatic = topic({
    approval: { decision: 'approved', mode: 'automatic', rule_id: RULE.id, approved_at: RULE.approved_at },
  });
  const file = post('optometry-recall-playbook.md', 'Optometry Recall Playbook');
  for (const rule of [{ id: RULE.id }, { ...RULE, approved_by: ' ' }, { ...RULE, approved_at: 'not-a-date' }]) {
    assert.equal(evaluateScheduledPost({ topics: [automatic], standing_release_rule: rule }, file).ok, false);
  }
});

test('an automatic approval dated before its rule is held', () => {
  const file = post('optometry-recall-playbook.md', 'Optometry Recall Playbook');
  const automatic = (approvedAt) => topic({
    approval: {
      decision: 'approved',
      mode: 'automatic',
      owner: `standing-rule:${RULE.id}`,
      rule_id: RULE.id,
      approved_at: approvedAt,
    },
  });
  const queue = (approvedAt) => ({ topics: [automatic(approvedAt)], standing_release_rule: RULE });

  const early = evaluateScheduledPost(queue('2026-11-23T11:59:59Z'), file);
  assert.equal(early.ok, false);
  assert.deepEqual(early.issues, ['RED_STANDING_RULE_NOT_APPROVED:optometry-recall-playbook.md']);

  assert.equal(evaluateScheduledPost(queue(RULE.approved_at), file).ok, true);
  assert.equal(evaluateScheduledPost(queue('2026-11-24T02:00:00Z'), file).ok, true);

  const held = evaluateScheduledPosts(queue('2026-10-15T20:37:30Z'), [file]);
  assert.deepEqual(held.releasable, []);
  assert.deepEqual(held.held.map((item) => item.name), ['optometry-recall-playbook.md']);
});

test('the real queue file has no automatic approval dated before its rule', () => {
  const queue = JSON.parse(fs.readFileSync(new URL('../../config/seo-topic-queue.json', import.meta.url), 'utf8'));
  const ruleTime = new Date(queue.standing_release_rule.approved_at).getTime();
  assert.ok(Number.isFinite(ruleTime));
  const automatic = queue.topics.filter((item) => item.approval?.mode === 'automatic');
  assert.ok(automatic.length > 0);
  for (const item of automatic) {
    assert.ok(
      new Date(item.approval.approved_at).getTime() >= ruleTime,
      `${item.id} automatic approval is dated before the standing rule`,
    );
  }
});
