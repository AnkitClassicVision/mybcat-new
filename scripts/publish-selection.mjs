/**
 * Which scheduled posts go live, and in what order.
 *
 * One copy of the publish job's selection rules. scripts/publish-scheduled.js
 * (the publish job) and scripts/check-due-queue.mjs (the daily health check)
 * both import it, so the check cannot drift from the job.
 *
 * Pure: no file access, no clock, no logging. The caller supplies the posts and
 * the gate functions.
 *
 * A post here is { file, scheduledDate, ... } with scheduledDate as YYYY-MM-DD.
 */

/** Posts the publish job releases in one UTC day. */
export const MAX_DAILY_PUBLISH = 1;

/** Oldest scheduledDate first, then filename. */
export function publishOrder(a, b) {
  if (a.scheduledDate !== b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
  return a.file.localeCompare(b.file);
}

/** The eligible posts in release order. Does not change the input. */
export function orderForPublish(eligible) {
  return [...eligible].sort(publishOrder);
}

/** How many more posts may go live today, given how many already did. */
export function remainingToday(publishedToday) {
  return Math.max(0, MAX_DAILY_PUBLISH - publishedToday);
}

/**
 * The release gate, one post at a time. A held post never holds back another.
 * `evaluate(post)` returns { ok, issues }. Order is kept.
 */
export function splitByRelease(ordered, evaluate) {
  const releasable = [];
  const releaseHeld = [];
  for (const post of ordered) {
    const result = evaluate(post);
    if (result.ok) {
      releasable.push(post);
    } else {
      releaseHeld.push({ ...post, reasons: result.issues });
    }
  }
  return { releasable, releaseHeld };
}

/**
 * The daily cap. `remaining` is what remainingToday returned. With `force`
 * the cap is off and every post goes.
 */
export function applyDailyCap(passed, { force = false, remaining }) {
  const limit = force ? passed.length : remaining;
  return { toPublish: passed.slice(0, limit), deferred: passed.slice(limit) };
}

/**
 * The whole selection in one call: order, release gate, optional quality gate,
 * daily cap. The publish job runs the same stages one at a time, because it
 * logs between them.
 *
 * @param {object} input
 * @param {Array<{file: string, scheduledDate: string}>} input.eligible posts due today or earlier
 * @param {number} [input.publishedToday] posts already live today
 * @param {boolean} [input.force]
 * @param {(post: object) => {ok: boolean, issues: string[]}} input.evaluateRelease
 * @param {(post: object) => boolean} [input.passesQuality]
 */
export function selectForPublish({ eligible, publishedToday = 0, force = false, evaluateRelease, passesQuality = () => true }) {
  const ordered = orderForPublish(eligible);
  const { releasable, releaseHeld } = splitByRelease(ordered, evaluateRelease);
  const qualityPassed = releasable.filter(passesQuality);
  const remaining = remainingToday(publishedToday);
  const { toPublish, deferred } = applyDailyCap(qualityPassed, { force, remaining });
  return { ordered, releasable, releaseHeld, toPublish, deferred, remaining };
}
