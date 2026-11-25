/**
 * Due-queue gate for the Daily New Post Health Check.
 *
 * The publish job (scripts/publish-scheduled.js) releases ONE post a day, oldest
 * scheduledDate first. A post dated today can therefore wait behind older posts
 * and still be healthy. This gate fails only on a real publishing fault:
 *
 *   (a) NOTHING_PUBLISHED_TODAY: nothing went live today although at least one
 *       post was due, approved by the release gate and had a full day to go out.
 *   (b) OVERDUE: a due post has waited longer than its place in the queue
 *       explains. It fails when
 *           days waited > posts ahead of it when it became releasable + 1 day
 *       where "posts ahead" is the posts still ahead of it plus the posts
 *       published since it became releasable.
 *
 * A post held by the release gate is not a publisher fault. It is reported as a
 * warning and never fails this gate.
 *
 * "Became releasable" is the later of the post's scheduledDate and the day after
 * its approval in the topic queue. A post cannot go out before it is approved.
 *
 * Reuse: the release gate is the publish job's own evaluateScheduledPost. The
 * ordering below mirrors the publish job's sort. publish-scheduled.js runs at
 * load and cannot be imported, so tests/unit/check-due-queue.test.mjs pins both
 * to the publisher's source.
 *
 * Usage: node scripts/check-due-queue.mjs [--blog-dir DIR] [--queue FILE] [--today YYYY-MM-DD]
 * Exit: 0 healthy, 1 publishing fault, 2 bad arguments.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { evaluateScheduledPost } from './validate-seo-topic-queue.mjs';

/** Days a post may wait beyond its place in the queue before the gate fails. */
export const SLACK_DAYS = 1;

const DAY_MS = 24 * 60 * 60 * 1000;

/** The UTC day (YYYY-MM-DD) of a frontmatter date, as the publish job reads it. */
export function utcDay(value) {
  if (value === undefined || value === null || value === '') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
}

export function addDays(day, count) {
  return new Date(Date.parse(day) + count * DAY_MS).toISOString().split('T')[0];
}

export function daysBetween(from, to) {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS);
}

/** The publish job's order: oldest scheduledDate first, then filename. */
export function publishOrder(a, b) {
  if (a.scheduledDate !== b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
  return a.file.localeCompare(b.file);
}

/** First day the publish job could release the post: scheduled, and a full day after approval. */
function releasableFrom(post, topicById) {
  const approvedDay = utcDay(topicById.get(post.seoTopicId)?.approval?.approved_at);
  if (!approvedDay) return post.scheduledDate;
  const afterApproval = addDays(approvedDay, 1);
  return afterApproval > post.scheduledDate ? afterApproval : post.scheduledDate;
}

/**
 * @param {{ today: string, files: Array<{ name: string, content: string }>, queue: object | null }} input
 * @returns {{ ok: boolean, today: string, publishedToday: number, queue: object[], held: object[], failures: object[] }}
 */
export function checkDueQueue({ today, files, queue }) {
  const failures = [];
  const publishedDays = [];
  const due = [];

  for (const file of files) {
    let data;
    try {
      ({ data } = matter(file.content));
    } catch (err) {
      failures.push({ code: 'FRONTMATTER_UNREADABLE', file: file.name, detail: err.message });
      continue;
    }
    if (data.status === 'published') {
      const day = utcDay(data.publishDate);
      if (day) publishedDays.push(day);
    } else if (data.status === 'scheduled' && data.scheduledDate) {
      const scheduledDate = utcDay(data.scheduledDate);
      if (!scheduledDate) {
        failures.push({ code: 'SCHEDULED_DATE_UNREADABLE', file: file.name, detail: `scheduledDate "${data.scheduledDate}" is not a date` });
      } else if (scheduledDate <= today) {
        const seoTopicId = data.seoTopicId === undefined || data.seoTopicId === null ? '' : String(data.seoTopicId).trim();
        due.push({ file: file.name, content: file.content, scheduledDate, seoTopicId });
      }
    }
  }

  due.sort(publishOrder);
  const publishedToday = publishedDays.filter((day) => day === today).length;
  const topicById = new Map((queue?.topics || []).map((topic) => [topic.id, topic]));

  // The publish job holds every post when the queue cannot be read. That is a fault.
  if (!queue && due.length > 0) {
    failures.push({ code: 'QUEUE_UNREADABLE', detail: `the topic queue cannot be read, so the publish job holds all ${due.length} due post(s)` });
  }

  const releasable = [];
  const held = [];
  if (queue) {
    for (const post of due) {
      const result = evaluateScheduledPost(queue, { name: post.file, content: post.content }, topicById);
      if (result.ok) {
        releasable.push(post);
      } else {
        held.push({ file: post.file, scheduledDate: post.scheduledDate, issues: result.issues });
      }
    }
  }

  const entries = releasable.map((post, index) => ({
    file: post.file,
    scheduledDate: post.scheduledDate,
    releasableFrom: releasableFrom(post, topicById),
    ahead: index,
  }));

  // Posts approved today, after the publish run, have not had their chance yet.
  const hadItsChance = entries.filter((entry) => entry.releasableFrom <= today);

  if (hadItsChance.length > 0 && publishedToday === 0) {
    failures.push({
      code: 'NOTHING_PUBLISHED_TODAY',
      file: hadItsChance[0].file,
      detail: `nothing was published on ${today} although ${hadItsChance.length} releasable post(s) were due; first in line is ${hadItsChance[0].file}`,
    });
  }

  for (const entry of hadItsChance) {
    const waited = daysBetween(entry.releasableFrom, today);
    const publishedSince = publishedDays.filter((day) => day >= entry.releasableFrom && day <= today).length;
    const allowed = entry.ahead + publishedSince + SLACK_DAYS;
    entry.waited = waited;
    entry.allowed = allowed;
    if (waited > allowed) {
      failures.push({
        code: 'OVERDUE',
        file: entry.file,
        detail: `${entry.file} has waited ${waited} day(s) since it became releasable on ${entry.releasableFrom}; ${entry.ahead} post(s) still ahead and ${publishedSince} published since explain at most ${allowed} (${SLACK_DAYS} day of slack included)`,
      });
    }
  }

  return { ok: failures.length === 0, today, publishedToday, queue: entries, held, failures };
}

/** Console lines, with GitHub annotations for failures and held posts. */
export function formatReport(result) {
  const lines = [
    `Due-queue gate for ${result.today}`,
    `Published today: ${result.publishedToday}`,
    `Due and releasable, in publish order: ${result.queue.length}`,
  ];
  result.queue.forEach((entry, index) => {
    const state = entry.waited === undefined ? 'not yet its turn to be counted' : `waited ${entry.waited} of ${entry.allowed} allowed day(s)`;
    lines.push(`  ${index + 1}. ${entry.file} (scheduled ${entry.scheduledDate}, releasable from ${entry.releasableFrom}, ${state})`);
  });
  for (const held of result.held) {
    lines.push(`::warning::Held by the release gate, not a publisher fault: ${held.file} (${held.issues.join(', ')})`);
  }
  for (const failure of result.failures) {
    lines.push(`::error::${failure.code}: ${failure.detail}`);
  }
  lines.push(result.ok
    ? `Due queue is healthy.${result.held.length > 0 ? ` ${result.held.length} post(s) held by the release gate are reported above.` : ''}`
    : 'Publishing fault: the due queue is not draining as the publish job should drain it.');
  return lines;
}

export function loadFiles(blogDir) {
  return fs.readdirSync(blogDir)
    .filter((name) => /\.mdx?$/.test(name))
    .map((name) => ({ name, content: fs.readFileSync(path.join(blogDir, name), 'utf8') }));
}

export function loadQueue(queuePath) {
  try {
    return JSON.parse(fs.readFileSync(queuePath, 'utf8'));
  } catch {
    return null;
  }
}

function option(argv, name, fallback) {
  const index = argv.indexOf(name);
  return index === -1 ? fallback : argv[index + 1];
}

export function main(argv = process.argv.slice(2), now = new Date()) {
  const blogDir = option(argv, '--blog-dir', 'src/content/blog');
  const queuePath = option(argv, '--queue', 'config/seo-topic-queue.json');
  const today = option(argv, '--today', now.toISOString().split('T')[0]);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today ?? '') || utcDay(today) !== today) {
    console.error('--today must be a UTC day in the form YYYY-MM-DD');
    return 2;
  }
  if (!blogDir || !fs.existsSync(blogDir)) {
    console.error(`Blog directory not found: ${blogDir}`);
    return 2;
  }
  const result = checkDueQueue({ today, files: loadFiles(blogDir), queue: queuePath ? loadQueue(queuePath) : null });
  for (const line of formatReport(result)) console.log(line);
  return result.ok ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
