/**
 * Due-queue gate for the Daily New Post Health Check.
 *
 * The publish job (scripts/publish-scheduled.js) releases ONE post a day, oldest
 * scheduledDate first. A post dated today can therefore wait behind older posts
 * and still be healthy. This gate fails only on a real publishing fault:
 *
 *   NOTHING_PUBLISHED_TODAY  nothing went live today although at least one post
 *       was due, approved by the release gate and had a full day to go out.
 *   WRONG_POST_PUBLISHED     the post that went live today is not the one that
 *       was first in line before today's publish.
 *   SKIPPED                  a releasable post is older in the order than a post
 *       published after it became releasable.
 *   OVERDUE                  a due post waited longer than its place in the queue
 *       explains: days waited > posts ahead of it when it became releasable + 1.
 *       "Posts ahead" is the posts still ahead plus the posts published since.
 *   CEILING                  a releasable post waited longer than
 *       max(queue length when it became releasable + 1, 14) days.
 *   HELD_TOO_LONG            a post has been due and held by the release gate for
 *       more than 14 days. Shorter holds are warnings, never failures.
 *
 * "Became releasable" is the later of the post's scheduledDate and the day after
 * its approval in the topic queue. A post cannot go out before it is approved.
 *
 * Order and release rules come from scripts/publish-selection.mjs, the same
 * module the publish job runs, so this gate cannot drift from it. The release
 * gate is the publish job's own evaluateScheduledPost.
 *
 * Published posts lose their scheduledDate: the publish job removes it. The
 * original order of a published post survives only in the "Publish scheduled
 * posts for <day>" commit. WRONG_POST_PUBLISHED and SKIPPED read it from git
 * history. Without history they cannot run: the gate prints a warning and the
 * other rules still apply.
 *
 * Usage: node scripts/check-due-queue.mjs [--blog-dir DIR] [--queue FILE]
 *          [--today YYYY-MM-DD] [--history auto|off]
 * Exit: 0 healthy, 1 publishing fault, 2 bad arguments.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { evaluateScheduledPost } from './validate-seo-topic-queue.mjs';
import { applyDailyCap, orderForPublish, publishOrder, splitByRelease } from './publish-selection.mjs';

/** Days a post may wait beyond its place in the queue before the gate fails. */
export const SLACK_DAYS = 1;
/** No releasable post may wait longer than this, whatever the queue length. */
export const CEILING_FLOOR_DAYS = 14;
/** A due post held by the release gate for longer than this fails the gate. */
export const HELD_LIMIT_DAYS = 14;

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

/** First day the publish job could release the post: scheduled, and a full day after approval. */
function releasableFrom(post, topicById) {
  const approvedDay = utcDay(topicById.get(post.seoTopicId)?.approval?.approved_at);
  if (!approvedDay) return post.scheduledDate;
  const afterApproval = addDays(approvedDay, 1);
  return afterApproval > post.scheduledDate ? afterApproval : post.scheduledDate;
}

const unquote = (value) => value.replace(/^(['"])(.*)\1$/, '$2');

/**
 * Read the publish job's commits. Each removes scheduledDate, sets status to
 * published and sets publishDate to the day it went live. A post that goes live
 * on its own scheduledDate keeps its publishDate, so that line may be missing
 * from the diff. The commit subject, "Publish scheduled posts for <day>", then
 * gives the day.
 *
 * @param {string} diff output of `git log -p -U0 --format=%x01%H%x09%s` for those commits
 * @returns {Array<{ file: string, scheduledDate: string, publishedOn: string }>} newest first
 */
export function parsePublishDiff(diff) {
  const records = [];
  let file = null;
  let scheduledDate = null;
  let publishedOn = null;
  let nowPublished = false;
  let commitDay = null;
  const flush = () => {
    const day = publishedOn ?? commitDay;
    if (file && scheduledDate && day && nowPublished) records.push({ file, scheduledDate, publishedOn: day });
    file = null;
    scheduledDate = null;
    publishedOn = null;
    nowPublished = false;
  };
  for (const raw of diff.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (line.startsWith('\u0001')) {
      flush();
      commitDay = line.match(/\tPublish scheduled posts for (\d{4}-\d{2}-\d{2})/)?.[1] ?? null;
      continue;
    }
    const header = line.match(/^diff --git a\/(.+) b\/(.+)$/);
    if (header) {
      flush();
      file = path.posix.basename(header[2]);
      continue;
    }
    if (!file) continue;
    const removedDate = line.match(/^-scheduledDate:\s*(.+?)\s*$/);
    const newPublishDate = line.match(/^\+publishDate:\s*(.+?)\s*$/);
    if (removedDate) scheduledDate = utcDay(unquote(removedDate[1]));
    else if (newPublishDate) publishedOn = utcDay(unquote(newPublishDate[1]));
    else if (/^\+status:\s*['"]?published['"]?\s*$/.test(line)) nowPublished = true;
  }
  flush();
  return records;
}

/**
 * The publish job's record of what it released, from git history, and the first
 * day that history covers. A shallow clone covers only what it holds. Returns
 * null when git cannot be read. `--diff-filter=M` keeps a shallow boundary
 * commit, which git shows as a whole tree of added files, out of the output.
 *
 * @returns {{ records: Array<{ file: string, scheduledDate: string, publishedOn: string }>, coversFrom: string } | null}
 */
export function readPublications(blogDir) {
  const git = (args) => execFileSync('git', args, { cwd: blogDir, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
  try {
    const diff = git([
      'log', '--extended-regexp', '--grep=^Publish scheduled posts for ', '--diff-filter=M',
      '-p', '-U0', '--no-color', '--no-ext-diff', '--format=%x01%H%x09%s', '--', '.',
    ]);
    const commitDays = git(['log', '--format=%cI']).split('\n').map((line) => utcDay(line.trim())).filter(Boolean).sort();
    if (commitDays.length === 0) return null;
    return { records: parsePublishDiff(diff), coversFrom: commitDays[0] };
  } catch {
    return null;
  }
}

/**
 * @param {{
 *   today: string,
 *   files: Array<{ name: string, content: string }>,
 *   queue: object | null,
 *   publications?: { records: Array<{ file: string, scheduledDate: string, publishedOn: string }>, coversFrom: string } | null,
 * }} input `publications` is the publish job's record from git history and the first day
 *   it covers, or null when history is unavailable
 */
export function checkDueQueue({ today, files, queue, publications = null }) {
  const failures = [];
  const warnings = [];
  const published = [];
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
      if (day) published.push({ file: file.name, day });
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

  const publishedDays = published.map((entry) => entry.day);
  const publishedTodayFiles = published.filter((entry) => entry.day === today).map((entry) => entry.file);
  const publishedToday = publishedTodayFiles.length;
  const topicById = new Map((queue?.topics || []).map((topic) => [topic.id, topic]));

  // The publish job holds every post when the queue cannot be read. That is a fault.
  if (!queue && due.length > 0) {
    failures.push({ code: 'QUEUE_UNREADABLE', detail: `the topic queue cannot be read, so the publish job holds all ${due.length} due post(s)` });
  }

  // The publish job's own order and release gate (scripts/publish-selection.mjs).
  const { releasable, releaseHeld } = queue
    ? splitByRelease(orderForPublish(due), (post) => evaluateScheduledPost(queue, { name: post.file, content: post.content }, topicById))
    : { releasable: [], releaseHeld: [] };

  const held = releaseHeld.map((post) => ({
    file: post.file,
    scheduledDate: post.scheduledDate,
    issues: post.reasons,
    daysHeld: daysBetween(post.scheduledDate, today),
  }));

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

  // The publish job's record of what it released, newest record per file.
  const records = publications?.records ?? [];
  const recordOf = new Map();
  for (const record of records) {
    if (!recordOf.has(record.file)) recordOf.set(record.file, record);
  }

  // WRONG_POST_PUBLISHED: rebuild the queue as it stood before today's publish by
  // putting today's posts back with their original scheduledDate. The post(s) that
  // went live must be the first in that order.
  if (publishedToday > 0) {
    if (publications === null) {
      warnings.push(`Publish history is not available, so the order of today's publication (${publishedTodayFiles.join(', ')}) was not verified.`);
    } else {
      const todays = publishedTodayFiles
        .map((name) => recordOf.get(name))
        .filter((record) => record && record.publishedOn === today);
      const unrecorded = publishedTodayFiles.filter((name) => !todays.some((record) => record.file === name));
      if (unrecorded.length > 0) {
        warnings.push(`No publish record found in history for ${unrecorded.join(', ')}, so its place in the order was not verified.`);
      }
      if (todays.length > 0) {
        const beforePublish = orderForPublish([
          ...hadItsChance.map((entry) => ({ file: entry.file, scheduledDate: entry.scheduledDate })),
          ...todays.map((record) => ({ file: record.file, scheduledDate: record.scheduledDate })),
        ]);
        const { toPublish } = applyDailyCap(beforePublish, { remaining: todays.length });
        const missed = toPublish.find((post) => !todays.some((record) => record.file === post.file));
        if (missed) {
          const wrong = todays.find((record) => !toPublish.some((post) => post.file === record.file));
          failures.push({
            code: 'WRONG_POST_PUBLISHED',
            file: wrong.file,
            detail: `${missed.file} (scheduled ${missed.scheduledDate}) was first in line today, but ${wrong.file} (scheduled ${wrong.scheduledDate}) was published instead; the publish job releases the oldest scheduledDate first`,
          });
        }
      }
    }
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

    // SKIPPED: a post behind this one in the order went live after this one could go.
    const skippedBy = records
      .filter((record) => record.publishedOn < today && record.publishedOn >= entry.releasableFrom && publishOrder(record, entry) > 0)
      .sort((a, b) => a.publishedOn.localeCompare(b.publishedOn))[0];
    if (skippedBy) {
      failures.push({
        code: 'SKIPPED',
        file: entry.file,
        detail: `${entry.file} (scheduled ${entry.scheduledDate}) has been releasable since ${entry.releasableFrom}, but ${skippedBy.file} (scheduled ${skippedBy.scheduledDate}), which is behind it in the order, went live on ${skippedBy.publishedOn}; the publish job skipped it (quality gate or another fault)`,
      });
    }

    // CEILING: the queue when this post became releasable was its posts ahead then
    // plus itself. With history, only posts that were really ahead of it count.
    // Where history does not reach back to the day the post became releasable, the
    // records are incomplete: count every post published since, which never fails
    // a healthy queue.
    const historyCovers = publications !== null && publications.coversFrom <= entry.releasableFrom;
    const publishedAhead = historyCovers
      ? records.filter((record) => record.publishedOn >= entry.releasableFrom && record.publishedOn <= today && publishOrder(record, entry) < 0).length
      : publishedSince;
    const queueThen = entry.ahead + publishedAhead + 1;
    const ceiling = Math.max(queueThen + SLACK_DAYS, CEILING_FLOOR_DAYS);
    entry.ceiling = ceiling;
    if (waited > ceiling) {
      failures.push({
        code: 'CEILING',
        file: entry.file,
        detail: `${entry.file} has waited ${waited} day(s) since it became releasable on ${entry.releasableFrom}, more than the ceiling of ${ceiling} (the larger of ${queueThen + SLACK_DAYS} for a queue of ${queueThen} and ${CEILING_FLOOR_DAYS})`,
      });
    }
  }

  // HELD_TOO_LONG: a hold is a warning at first, then a failure.
  for (const post of held) {
    if (post.daysHeld > HELD_LIMIT_DAYS) {
      post.tooLong = true;
      failures.push({
        code: 'HELD_TOO_LONG',
        file: post.file,
        detail: `${post.file} has been held by the release gate for ${post.daysHeld} day(s) since it was due on ${post.scheduledDate} (limit ${HELD_LIMIT_DAYS}): ${post.issues.join(', ')}. Approve it, bring it in scope, or take it off the schedule`,
      });
    }
  }

  return { ok: failures.length === 0, today, publishedToday, queue: entries, held, warnings, failures };
}

/** Console lines, with GitHub annotations for failures, warnings and held posts. */
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
  for (const held of result.held.filter((post) => !post.tooLong)) {
    lines.push(`::warning::Held by the release gate for ${held.daysHeld} day(s), not a publisher fault yet: ${held.file} (${held.issues.join(', ')})`);
  }
  for (const warning of result.warnings) {
    lines.push(`::warning::${warning}`);
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
  const history = option(argv, '--history', 'auto');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today ?? '') || utcDay(today) !== today) {
    console.error('--today must be a UTC day in the form YYYY-MM-DD');
    return 2;
  }
  if (history !== 'auto' && history !== 'off') {
    console.error('--history must be auto or off');
    return 2;
  }
  if (!blogDir || !fs.existsSync(blogDir)) {
    console.error(`Blog directory not found: ${blogDir}`);
    return 2;
  }
  const publications = history === 'off' ? null : readPublications(blogDir);
  const result = checkDueQueue({ today, files: loadFiles(blogDir), queue: queuePath ? loadQueue(queuePath) : null, publications });
  for (const line of formatReport(result)) console.log(line);
  return result.ok ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
