import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function evaluateQueue(queue, now = new Date(), requiredReadiness = 'publish_ready') {
  const issues = [];
  const topics = Array.isArray(queue?.topics) ? queue.topics : [];
  if (topics.length === 0) issues.push('RED_ZERO_CANDIDATES');

  const feedDate = new Date(queue?.opportunity_feed_as_of || 0);
  const staleAfter = Number(queue?.stale_after_hours || 48);
  if (!Number.isFinite(feedDate.getTime()) || now.getTime() - feedDate.getTime() > staleAfter * 3_600_000) {
    issues.push('RED_STALE_OPPORTUNITY_FEED');
  }

  const hasApproval = (topic) =>
    topic.approval?.decision === 'approved' &&
    typeof topic.approval?.owner === 'string' && topic.approval.owner.length > 0 &&
    Number.isFinite(new Date(topic.approval?.approved_at || 0).getTime());
  const approved = topics.filter((topic) =>
    ['approved', 'draft_ready', 'publish_ready'].includes(topic.status) && hasApproval(topic)
  );
  const draftReady = topics.filter((topic) =>
    ['draft_ready', 'publish_ready'].includes(topic.status) &&
    hasApproval(topic) &&
    topic.research_reviewed === true &&
    Array.isArray(topic.evidence_set) &&
    topic.evidence_set.length >= Number(topic.required_external_source_count || queue?.required_external_source_count || 5) &&
    topic.cannibalization_reviewed === true
  );
  const publishReady = draftReady.filter((topic) =>
    topic.status === 'publish_ready' && topic.claims_reviewed === true
  );
  const minimumApproved = Number(queue?.minimum_approved_topics || 14);
  const minimumDraftReady = Number(queue?.minimum_draft_ready || 14);
  const minimumReady = Number(queue?.minimum_publish_ready || 7);

  if (approved.length === 0) issues.push('RED_ZERO_APPROVED_TOPICS');
  if (approved.length < minimumApproved) issues.push('RED_APPROVED_QUEUE_BELOW_14');
  if (requiredReadiness === 'draft_ready') {
    if (draftReady.length === 0) issues.push('RED_ZERO_DRAFT_READY_TOPICS');
    if (draftReady.length < minimumDraftReady) issues.push(`RED_DRAFT_READY_BELOW_${minimumDraftReady}`);
  } else if (requiredReadiness === 'publish_ready') {
    if (publishReady.length === 0) issues.push('RED_ZERO_PUBLISH_READY_POSTS');
    if (publishReady.length < minimumReady) issues.push(`RED_PUBLISH_READY_BELOW_${minimumReady}`);
  } else {
    issues.push(`RED_READINESS_INVALID:${requiredReadiness}`);
  }

  const selected = requiredReadiness === 'draft_ready' ? draftReady : publishReady;
  if (selected.length >= 7) {
    const expected = queue.weekly_allocation || { acquisition: 5, service: 2 };
    const ordered = [...selected].sort((a, b) => a.slot - b.slot);
    for (let offset = 0; offset < ordered.length; offset += 7) {
      const block = ordered.slice(offset, offset + 7);
      if (block.length < 7) {
        issues.push(`RED_INCOMPLETE_WEEKLY_BLOCK:${Math.floor(offset / 7) + 1}`);
        continue;
      }
      const counts = block.reduce((result, topic) => {
        result[topic.funnel] = (result[topic.funnel] || 0) + 1;
        return result;
      }, {});
      if (counts.acquisition !== expected.acquisition || counts.service !== expected.service) {
        issues.push(`RED_WEEKLY_ALLOCATION_MISMATCH:${Math.floor(offset / 7) + 1}`);
      }
    }
  }

  return {
    ok: issues.length === 0,
    issues,
    required_readiness: requiredReadiness,
    counts: {
      candidates: topics.length,
      approved: approved.length,
      draft_ready: draftReady.length,
      publish_ready: publishReady.length,
    },
  };
}

export function evaluateRun(run) {
  const issues = [];
  if (Number(run?.candidates || 0) === 0) issues.push('RED_ZERO_CANDIDATES');
  if (Number(run?.queued_topics || 0) === 0) issues.push('RED_ZERO_QUEUED_TOPICS');
  if (Number(run?.published_posts || 0) === 0) issues.push('RED_NO_POST_PUBLISHED');
  if (run?.status === 'success' && issues.length > 0) issues.push('RED_SILENT_GREEN_RUN');
  return { ok: issues.length === 0, issues };
}

export function evaluateScheduledPosts(queue, files) {
  const issues = [];
  const topicById = new Map((queue?.topics || []).map((topic) => [topic.id, topic]));
  const scheduled = files.filter((file) => /^status:\s*["']?scheduled["']?\s*$/mi.test(file.content));
  if (scheduled.length === 0) issues.push('RED_NO_SCHEDULED_POST');
  for (const file of scheduled) {
    const topicId = file.content.match(/^seoTopicId:\s*["']?([^"'\r\n]+)["']?\s*$/mi)?.[1]?.trim();
    const topic = topicById.get(topicId);
    if (!topicId || topic?.status !== 'publish_ready') {
      issues.push(`RED_SCHEDULED_POST_NOT_APPROVED:${file.name}`);
    }
  }
  return { ok: issues.length === 0, issues, scheduled_posts: scheduled.length };
}

function main() {
  const queuePath = process.argv[2] || 'config/seo-topic-queue.json';
  const scheduledDirIndex = process.argv.indexOf('--scheduled-dir');
  const requireIndex = process.argv.indexOf('--require');
  const requiredReadiness = requireIndex === -1 ? 'publish_ready' : process.argv[requireIndex + 1];
  const absolute = path.resolve(process.cwd(), queuePath);
  let queue;
  try {
    queue = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  } catch {
    process.stdout.write(JSON.stringify({ ok: false, issues: ['RED_QUEUE_UNREADABLE'], queue: queuePath }) + '\n');
    process.exitCode = 2;
    return;
  }
  const result = evaluateQueue(queue, new Date(), requiredReadiness);
  if (scheduledDirIndex !== -1) {
    const scheduledDir = process.argv[scheduledDirIndex + 1];
    const files = fs.readdirSync(scheduledDir)
      .filter((name) => /\.mdx?$/.test(name))
      .map((name) => ({ name, content: fs.readFileSync(path.join(scheduledDir, name), 'utf8') }));
    const scheduledResult = evaluateScheduledPosts(queue, files);
    result.issues.push(...scheduledResult.issues);
    result.ok = result.issues.length === 0;
    result.counts.scheduled_posts = scheduledResult.scheduled_posts;
  }
  process.stdout.write(JSON.stringify({ ...result, queue: queuePath }) + '\n');
  if (!result.ok) process.exitCode = 2;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
