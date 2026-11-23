/**
 * Scheduled Publishing Script
 *
 * This script runs daily via GitHub Actions to publish scheduled posts.
 * It scans all blog posts for scheduledDate <= today's date,
 * and updates their status from 'scheduled' to 'published'.
 *
 * Safeguards:
 *   - Publish cap: MAX_DAILY_PUBLISH (default 1, override with --force)
 *   - Release gate: each post must be approved in the topic queue and inside the
 *     optometry-only scope. A post that is not is held back on its own.
 *   - Pre-publish quality gate: posts that fail content quality checks are skipped
 *   - Cross-link auto-restore: re-activates deactivated links when targets are published
 *
 * Usage: node scripts/publish-scheduled.js [--force]
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { validateFile } from './validators/validate-content-quality.js';
import { evaluateScheduledPost } from './validate-seo-topic-queue.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const TOPIC_QUEUE_PATH = path.join(__dirname, '..', 'config', 'seo-topic-queue.json');
const DEACTIVATED_LINKS_PATH = path.join(__dirname, 'config', 'deactivated-links.json');
const QUALITY_RULES_PATH = path.join(__dirname, 'config', 'content-quality-rules.json');

const MAX_DAILY_PUBLISH = 1;
const today = new Date().toISOString().split('T')[0];

// A runner that is a day late keeps the scheduled day. A post held back for
// longer takes the day it really goes live, so its date is true and the daily
// checks, which look at today's posts, see it.
function publishDayFor(scheduledDate, runDay) {
  const lateDays = (Date.parse(runDay) - Date.parse(scheduledDate)) / 86400000;
  return lateDays > 1 ? runDay : scheduledDate;
}

const args = process.argv.slice(2);
const forceMode = args.includes('--force');
const dryRun = args.includes('--dry-run');

console.log(`Checking for posts scheduled on or before ${today}...`);
if (forceMode) console.log('--force mode: publish cap disabled');
if (dryRun) console.log('--dry-run: no files will be written');

// Ensure blog directory exists
if (!fs.existsSync(BLOG_DIR)) {
  console.log('No blog directory found. Nothing to publish.');
  process.exit(0);
}

// Load quality rules
let qualityConfig;
try {
  qualityConfig = JSON.parse(fs.readFileSync(QUALITY_RULES_PATH, 'utf-8'));
} catch (err) {
  console.log(`Warning: Could not load quality rules: ${err.message}`);
  qualityConfig = null;
}

// Get all markdown files
const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

if (files.length === 0) {
  console.log('No blog posts found. Nothing to publish.');
  process.exit(0);
}

// Collect eligible posts (scheduledDate <= today)
const eligible = [];
for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(content);

  if (data.status === 'scheduled' && data.scheduledDate) {
    const scheduledDate = new Date(data.scheduledDate).toISOString().split('T')[0];
    if (scheduledDate <= today) {
      eligible.push({ file, filePath, scheduledDate });
    }
  }
}

if (eligible.length === 0) {
  console.log('No posts scheduled for today or earlier.');
  process.exit(0);
}

// Sort by scheduledDate (oldest first), then filename
eligible.sort((a, b) => {
  if (a.scheduledDate !== b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
  return a.file.localeCompare(b.file);
});

console.log(`Found ${eligible.length} eligible post(s).`);

// Release gate: approval and optometry scope, one post at a time. An
// unreadable queue approves nothing, so every post is held.
let topicQueue = null;
try {
  topicQueue = JSON.parse(fs.readFileSync(TOPIC_QUEUE_PATH, 'utf-8'));
} catch (err) {
  console.log(`Release gate: topic queue unreadable (${err.message}). Every post is held.`);
}

const releasable = [];
const releaseHeld = [];

for (const post of eligible) {
  const result = topicQueue
    ? evaluateScheduledPost(topicQueue, { name: post.file, content: fs.readFileSync(post.filePath, 'utf8') })
    : { ok: false, issues: [`RED_QUEUE_UNREADABLE:${post.file}`] };
  if (result.ok) {
    releasable.push(post);
  } else {
    releaseHeld.push({ ...post, reasons: result.issues });
    console.log(`Release gate HELD: ${post.file}`);
    for (const issue of result.issues) {
      console.log(`  - ${issue}`);
    }
  }
}

if (releaseHeld.length > 0) {
  console.log(`\n${releaseHeld.length} post(s) held by the release gate. The others go on.`);
}

// Pre-publish quality gate
const qualityPassed = [];
const qualityFailed = [];

for (const post of releasable) {
  if (!qualityConfig) {
    qualityPassed.push(post);
    continue;
  }

  try {
    const result = validateFile(post.filePath, qualityConfig);
    if (result.errors.length > 0) {
      qualityFailed.push({ ...post, reasons: result.errors });
      console.log(`Quality gate FAILED: ${post.file}`);
      for (const err of result.errors) {
        console.log(`  - ${err}`);
      }
    } else {
      qualityPassed.push(post);
    }
  } catch (err) {
    console.log(`Quality check error for ${post.file}: ${err.message} — skipping gate`);
    qualityPassed.push(post);
  }
}

if (qualityFailed.length > 0) {
  console.log(`\n${qualityFailed.length} post(s) failed quality gate and will be skipped.`);
}

// Apply publish cap
const limit = forceMode ? qualityPassed.length : MAX_DAILY_PUBLISH;
const toPublish = qualityPassed.slice(0, limit);
const deferred = qualityPassed.slice(limit);

if (deferred.length > 0) {
  console.log(`\nPublish cap (${MAX_DAILY_PUBLISH}): publishing ${toPublish.length}, deferring ${deferred.length}`);
  for (const post of deferred) {
    console.log(`  Deferred: ${post.file} (scheduled ${post.scheduledDate})`);
  }
}

if (dryRun) {
  console.log(`Dry run would publish ${toPublish.length} post(s).`);
  for (const post of toPublish) {
    console.log(`Would publish: ${post.file}`);
    console.log(`  status: scheduled -> published`);
    console.log(`  publishDate: ${post.scheduledDate}`);
    console.log(`  scheduledDate: removed`);
  }
  for (const post of deferred) {
    console.log(`Would leave scheduled: ${post.file} (${post.scheduledDate})`);
  }
  console.log(`Dry run would hold ${releaseHeld.length + qualityFailed.length} post(s): ${releaseHeld.length} at the release gate, ${qualityFailed.length} at the quality gate.`);
  process.exit(0);
}

// Publish posts
let publishedCount = 0;
const publishedSlugs = [];

for (const post of toPublish) {
  const content = fs.readFileSync(post.filePath, 'utf8');

  console.log(`Publishing: ${post.file}`);

  // Keep the article body. A late runner must not move publishDate to the
  // run day or reflow the post. See publishDayFor for a long-held post.
  const publishDay = publishDayFor(post.scheduledDate, today);
  const newline = content.includes('\r\n') ? '\r\n' : '\n';
  const lines = content.split(/\r?\n/);
  const nextLines = [];
  for (const line of lines) {
    if (/^scheduledDate:/.test(line)) continue;
    if (/^status:\s*['"]?scheduled['"]?\s*$/.test(line)) {
      nextLines.push('status: published');
      continue;
    }
    if (/^publishDate:/.test(line)) {
      nextLines.push(`publishDate: '${publishDay}'`);
      continue;
    }
    nextLines.push(line);
  }
  fs.writeFileSync(post.filePath, nextLines.join(newline));

  publishedCount++;
  publishedSlugs.push(post.file.replace(/\.(md|mdx)$/, ''));
}

if (publishedCount > 0) {
  console.log(`\nSuccessfully published ${publishedCount} post(s).`);

  // Cross-link auto-restore
  restoreDeactivatedLinks(publishedSlugs);

  // Ping IndexNow. Only the scheduled job on GitHub Actions pings. A local or
  // test run must never tell search engines about a page that is not live.
  const INDEXNOW_KEY = 'd0fa8fc9f2c9f1eddea0d7f5ba4163e8';
  const SITE_URL = 'https://mybcat.com';
  const publishedUrls = publishedSlugs.map(slug => `${SITE_URL}/blog/${slug}/`);

  const mayPing = process.env.GITHUB_ACTIONS === 'true';
  if (publishedUrls.length > 0 && !mayPing) {
    console.log('IndexNow ping skipped: not running in GitHub Actions.');
  }
  if (publishedUrls.length > 0 && mayPing) {
    console.log(`Pinging IndexNow for ${publishedUrls.length} URL(s)...`);
    fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host: 'mybcat.com',
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: publishedUrls
      })
    })
      .then(res => console.log(`IndexNow response: ${res.status}`))
      .catch(err => console.log(`IndexNow ping failed (non-blocking): ${err.message}`));
  }
} else {
  console.log('No posts published (all were held or deferred).');
}

const heldPosts = [
  ...releaseHeld.map((post) => ({ file: post.file, gate: 'release', reasons: post.reasons })),
  ...qualityFailed.map((post) => ({ file: post.file, gate: 'quality', reasons: post.reasons })),
];
const shouldFailNoPublish = eligible.length > 0 && publishedCount === 0 && heldPosts.length > 0;

// AAC v2: write run manifest so scheduled-publish.yml can emit posts_published count
const MANIFEST_DIR = path.join(__dirname, '..', 'artifacts', 'scheduled-publish');
const MANIFEST_PATH = path.join(MANIFEST_DIR, 'latest-run.json');

fs.mkdirSync(MANIFEST_DIR, { recursive: true });
fs.writeFileSync(MANIFEST_PATH, JSON.stringify({
  finished_at: new Date().toISOString(),
  eligible: eligible.length,
  release_held: releaseHeld.length,
  quality_failed: qualityFailed.length,
  deferred: deferred.length,
  posts_published: publishedCount,
  slugs: publishedSlugs,
  held: heldPosts,
}, null, 2) + '\n');
console.log(`Manifest written: ${MANIFEST_PATH}`);

if (shouldFailNoPublish) {
  console.error(
    `Publish failed: ${heldPosts.length} eligible post(s) were held (${releaseHeld.length} release gate, ${qualityFailed.length} quality gate) and zero posts were published.`
  );
  process.exitCode = 1;
}

/**
 * After publishing posts, restore any deactivated cross-links whose targets
 * are now published. Best-effort: failed restores stay in JSON for manual review.
 */
function restoreDeactivatedLinks(publishedSlugs) {
  if (!fs.existsSync(DEACTIVATED_LINKS_PATH)) {
    return;
  }

  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(DEACTIVATED_LINKS_PATH, 'utf-8'));
  } catch {
    console.log('Warning: Could not parse deactivated-links.json');
    return;
  }

  if (!Array.isArray(entries) || entries.length === 0) return;

  // Find entries whose target was just published
  const toRestore = entries.filter(e => publishedSlugs.includes(e.targetSlug));
  if (toRestore.length === 0) return;

  console.log(`\nAuto-restoring ${toRestore.length} deactivated cross-link(s)...`);

  const restored = [];
  const failed = [];

  for (const entry of toRestore) {
    const sourceFile = files.find(f => f.replace(/\.(md|mdx)$/, '') === entry.sourceSlug);
    if (!sourceFile) {
      console.log(`  Skip: source "${entry.sourceSlug}" not found`);
      failed.push(entry);
      continue;
    }

    const sourcePath = path.join(BLOG_DIR, sourceFile);
    let sourceContent = fs.readFileSync(sourcePath, 'utf-8');

    if (!sourceContent.includes(entry.plainText)) {
      console.log(`  Skip: plain text not found in "${entry.sourceSlug}" (edited since deactivation?)`);
      failed.push(entry);
      continue;
    }

    // Replace plainText with originalMarkdown using context-aware match when available
    let didRestore = false;

    if (entry.contextBefore !== undefined && entry.contextAfter !== undefined) {
      const ctxBefore = entry.contextBefore.replace(/↵/g, '\n');
      const ctxAfter  = entry.contextAfter.replace(/↵/g, '\n');
      const searchStr  = ctxBefore + entry.plainText + ctxAfter;
      const replaceStr = ctxBefore + entry.originalMarkdown + ctxAfter;
      if (sourceContent.includes(searchStr)) {
        sourceContent = sourceContent.replace(searchStr, replaceStr);
        didRestore = true;
        console.log(`  Restored (context-match): ${entry.sourceSlug} → ${entry.targetSlug}`);
      }
    }

    if (!didRestore) {
      sourceContent = sourceContent.replace(entry.plainText, entry.originalMarkdown);
      console.log(`  Restored (first-match fallback): ${entry.sourceSlug} → ${entry.targetSlug}`);
    }

    fs.writeFileSync(sourcePath, sourceContent);
    restored.push(entry);
  }

  // Update JSON: keep only unrestored and non-targeted entries
  const restoredSet = new Set(restored.map(e => JSON.stringify(e)));
  const remaining = entries.filter(e => !restoredSet.has(JSON.stringify(e)));
  fs.writeFileSync(DEACTIVATED_LINKS_PATH, JSON.stringify(remaining, null, 2) + '\n');

  console.log(`  Restored: ${restored.length} | Failed: ${failed.length} | Remaining: ${remaining.length}`);
}
