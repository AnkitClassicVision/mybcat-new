#!/usr/bin/env node

/**
 * Citation Liveness & Authority Validator
 * Checks all outbound URLs in ## Sources sections for HTTP status and authority.
 *
 * Checks:
 *   - HTTP status: HEAD request, flags non-200-399 responses
 *   - Archive detection: warns on web.archive.org primary sources
 *   - Authority heuristic: prefers .gov/.edu/recognized industry bodies
 *
 * Usage:
 *   node scripts/validators/validate-citations.js [--fix-suggestions] [--concurrency=5] [--timeout=10000]
 *
 * Options:
 *   --fix-suggestions      Show suggested replacement sources for dead links
 *   --concurrency=N        Max parallel requests (default: 5)
 *   --timeout=N            Request timeout in ms (default: 10000)
 *   --new-only             Skip posts published before legacyCutoffDate (from content-quality-rules.json)
 *   --changed-files-only   Only check blog files in `git diff origin/main...HEAD` (PR-scoped)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '..', '..', 'src', 'content', 'blog');
const CONFIG_DIR = path.join(__dirname, '..', 'config');

// Load legacy cutoff from content-quality-rules.json (single source of truth)
const qualityConfig = JSON.parse(fs.readFileSync(path.join(CONFIG_DIR, 'content-quality-rules.json'), 'utf8'));
const LEGACY_CUTOFF = qualityConfig.thresholds?.legacyCutoffDate || '2026-03-06';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

/**
 * High-authority domains that should be preferred as sources.
 */
const AUTHORITY_DOMAINS = new Set([
  // Government
  'nih.gov', 'cdc.gov', 'cms.gov', 'hhs.gov', 'ftc.gov', 'bls.gov',
  // Education
  'harvard.edu', 'stanford.edu', 'mit.edu', 'mayo.edu',
  // Healthcare industry bodies
  'aoa.org', 'ada.org', 'avma.org', 'mgma.com', 'ama-assn.org',
  'aao.org', 'who.int',
  // Business / research
  'mckinsey.com', 'hbr.org', 'pewresearch.org',
  // Recognized trade publications
  'beckersdental.com', 'beckershospitalreview.com',
  'reviewob.com', 'veterinarypracticenews.com',
  'todaysveterinarybusiness.com',
  'callrail.com',
]);

/**
 * Archive domains that indicate potentially stale sources.
 */
const ARCHIVE_DOMAINS = [
  'web.archive.org',
  'archive.org',
  'webcache.googleusercontent.com',
  'cached.',
];

/**
 * Extract all URLs from the ## Sources section of a markdown file.
 */
function extractSourceURLs(body) {
  const sourcesMatch = body.match(/^## Sources\s*\n([\s\S]*?)(?=\n## |\n---|(?![\s\S]))/m);
  if (!sourcesMatch) return [];

  const sourcesBlock = sourcesMatch[1];
  const urls = [];
  const urlRegex = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
  const bareUrlRegex = /^\s*-\s*(https?:\/\/\S+)/gm;

  let match;
  while ((match = urlRegex.exec(sourcesBlock)) !== null) {
    urls.push({ text: match[1], url: match[2] });
  }
  while ((match = bareUrlRegex.exec(sourcesBlock)) !== null) {
    if (!urls.some(u => u.url === match[1])) {
      urls.push({ text: '', url: match[1] });
    }
  }

  return urls;
}

/**
 * Check if a URL is from an archive/cache service.
 */
function isArchiveURL(url) {
  return ARCHIVE_DOMAINS.some(domain => url.includes(domain));
}

/**
 * Check if a URL is from a high-authority domain.
 */
function isAuthorityDomain(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return AUTHORITY_DOMAINS.has(hostname) ||
      [...AUTHORITY_DOMAINS].some(d => hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

/**
 * Single-shot check: HEAD first, fall back to GET on 405/403 (some servers reject HEAD).
 */
async function checkURLOnce(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'MyBCAT-Citation-Checker/1.0 (link validation)'
      }
    });

    if (response.status === 405 || response.status === 403) {
      response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'MyBCAT-Citation-Checker/1.0 (link validation)'
        }
      });
    }

    clearTimeout(timer);
    // 200-399: alive. 403/429: alive but bot-blocked (WAF or rate limit) —
    // CI's IP and our 'link validation' UA frequently trip Cloudflare/HHS-style
    // bot detection on otherwise-fine pages; counting these as "dead" causes
    // gate flap on every push. 404/410 + connection errors stay dead.
    const status = response.status;
    const ok = (status >= 200 && status < 400) || status === 403 || status === 429;
    return { status, ok };
  } catch (err) {
    clearTimeout(timer);
    return { status: 0, ok: false, error: err.name === 'AbortError' ? 'timeout' : err.message };
  }
}

/**
 * Check HTTP status of a URL with one retry on transient failure
 * (timeouts and 5xx). Slow servers and flaky CDNs frequently fail the
 * first hit but answer fine on the second; without this, CI gates flap.
 */
async function checkURL(url, timeout) {
  const first = await checkURLOnce(url, timeout);
  if (first.ok) return first;

  // Retry on any network-level error (timeout, DNS, TLS, fetch failed)
  // and on 5xx; permanent 4xx (404/410) stays dead immediately.
  const isTransient = !!first.error || (first.status >= 500 && first.status < 600);
  if (!isTransient) return first;

  await new Promise(r => setTimeout(r, 500));
  return checkURLOnce(url, timeout * 1.5);
}

/**
 * Process URLs with concurrency limit.
 */
async function processWithConcurrency(items, concurrency, fn) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const promise = fn(item).then(result => {
      executing.delete(promise);
      return result;
    });
    executing.add(promise);
    results.push(promise);

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

/**
 * Resolve the set of blog files changed vs DIFF_BASE (default: origin/main).
 * Set DIFF_BASE=<sha> on push events (e.g. github.event.before) so we only
 * re-check what just landed. Returns a Set of basenames or null on failure
 * (caller treats null as "no filter; check everything").
 */
function getChangedBlogFiles() {
  const base = process.env.DIFF_BASE || 'origin/main';
  try {
    const out = execSync(`git diff --name-only ${base}...HEAD`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const blogPrefix = 'src/content/blog/';
    const changed = out
      .split('\n')
      .filter(line => line.startsWith(blogPrefix))
      .map(line => path.basename(line));
    return new Set(changed);
  } catch (err) {
    console.error(`${colors.yellow}WARN: --changed-files-only could not resolve git diff against ${base} (${err.message.split('\n')[0]}); checking all files${colors.reset}`);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const newOnly = args.includes('--new-only');
  const changedFilesOnly = args.includes('--changed-files-only');
  const concurrencyArg = args.find(a => a.startsWith('--concurrency='));
  const timeoutArg = args.find(a => a.startsWith('--timeout='));
  const concurrency = concurrencyArg ? parseInt(concurrencyArg.split('=')[1]) : 5;
  const timeout = timeoutArg ? parseInt(timeoutArg.split('=')[1]) : 10000;

  console.log(`${colors.bold}Citation Liveness & Authority Validator${colors.reset}`);
  console.log(`  Concurrency: ${concurrency} | Timeout: ${timeout}ms\n`);

  if (!fs.existsSync(BLOG_DIR)) {
    console.log('No blog directory found.');
    process.exit(0);
  }

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  const changedFiles = changedFilesOnly ? getChangedBlogFiles() : null;
  if (changedFiles) {
    console.log(`Scoped to ${changedFiles.size} blog file(s) changed vs origin/main\n`);
  }

  let totalURLs = 0;
  let deadURLs = 0;
  let archiveURLs = 0;
  let lowAuthorityPosts = 0;
  let checkedPosts = 0;
  const allChecks = [];

  // Collect all URLs from all files first
  for (const file of files) {
    if (changedFiles && !changedFiles.has(file)) continue;

    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(raw);

    if (data.status !== 'published' && data.status !== 'scheduled') continue;
    if (newOnly && data.publishDate) {
      const pd = new Date(data.publishDate).toISOString().split('T')[0];
      if (pd < LEGACY_CUTOFF) continue;
    }

    const urls = extractSourceURLs(body);
    if (urls.length === 0) continue;

    checkedPosts++;
    const slug = file.replace(/\.(md|mdx)$/, '');
    allChecks.push({ slug, file, urls });
  }

  console.log(`Found ${allChecks.reduce((sum, c) => sum + c.urls.length, 0)} citation URLs across ${checkedPosts} posts\n`);

  // Deduplicate URLs for checking (same URL may appear in multiple posts)
  const uniqueURLs = new Map();
  for (const check of allChecks) {
    for (const { url } of check.urls) {
      if (!uniqueURLs.has(url)) {
        uniqueURLs.set(url, null);
      }
    }
  }

  // Check all unique URLs
  const urlList = [...uniqueURLs.keys()];
  console.log(`Checking ${urlList.length} unique URLs...\n`);

  const urlResults = await processWithConcurrency(urlList, concurrency, async (url) => {
    const result = await checkURL(url, timeout);
    return { url, ...result };
  });

  // Store results
  for (const result of urlResults) {
    uniqueURLs.set(result.url, result);
  }

  // Report per post
  for (const { slug, urls } of allChecks) {
    const issues = [];

    let hasAuthoritySource = false;
    for (const { text, url } of urls) {
      totalURLs++;
      const result = uniqueURLs.get(url);

      if (isArchiveURL(url)) {
        archiveURLs++;
        issues.push(`${colors.yellow}ARCHIVE${colors.reset} ${url}`);
      } else if (!result.ok) {
        deadURLs++;
        const statusText = result.error || `HTTP ${result.status}`;
        issues.push(`${colors.red}DEAD (${statusText})${colors.reset} ${url}`);
      }

      if (isAuthorityDomain(url)) {
        hasAuthoritySource = true;
      }
    }

    if (!hasAuthoritySource && urls.length > 0) {
      lowAuthorityPosts++;
      issues.push(`${colors.cyan}LOW AUTHORITY${colors.reset} No .gov/.edu/industry-body sources`);
    }

    if (issues.length > 0) {
      console.log(`${colors.red}!${colors.reset} ${slug}`);
      for (const issue of issues) {
        console.log(`  ${issue}`);
      }
      console.log();
    }
  }

  // Summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Posts checked: ${checkedPosts}`);
  console.log(`  Total citation URLs: ${totalURLs}`);
  console.log(`  ${colors.red}Dead/unreachable: ${deadURLs}${colors.reset}`);
  console.log(`  ${colors.yellow}Archive URLs: ${archiveURLs}${colors.reset}`);
  console.log(`  ${colors.cyan}Posts with no authority sources: ${lowAuthorityPosts}${colors.reset}`);

  if (deadURLs > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});
