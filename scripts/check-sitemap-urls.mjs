#!/usr/bin/env node

/**
 * Sitemap URL Health Checker
 * Fetches the live sitemap, extracts all URLs, and checks each for HTTP status.
 * Designed to run periodically (weekly or post-deploy).
 *
 * Usage:
 *   node scripts/check-sitemap-urls.mjs [--local] [--local-only] [--concurrency=10] [--timeout=8000]
 *
 * Options:
 *   --local         Read from local build sitemap instead of fetching live, check via HTTP
 *   --local-only    Read from local build sitemap AND verify against local build output (no HTTP)
 *   --concurrency=N Number of parallel requests (default: 10)
 *   --timeout=N     Request timeout in ms (default: 8000)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const SITEMAP_URL = 'https://mybcat.com/sitemap-0.xml';
const LOCAL_SITEMAP = fs.existsSync(path.join(ROOT, 'dist', 'sitemap-0.xml'))
  ? path.join(ROOT, 'dist', 'sitemap-0.xml')
  : path.join(ROOT, '.vercel', 'output', 'static', 'sitemap-0.xml');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// ---------------------------------------------------------------------------
// Parse CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
const useLocal = args.includes('--local') || args.includes('--local-only');
const localOnly = args.includes('--local-only');
const concurrency = parseInt(args.find((a) => a.startsWith('--concurrency='))?.split('=')[1] || '10', 10);
const timeout = parseInt(args.find((a) => a.startsWith('--timeout='))?.split('=')[1] || '8000', 10);

// Build output directory (Vercel adapter or plain Astro)
const BUILD_DIR = fs.existsSync(path.join(ROOT, '.vercel', 'output', 'static'))
  ? path.join(ROOT, '.vercel', 'output', 'static')
  : path.join(ROOT, 'dist');

// ---------------------------------------------------------------------------
// Fetch or read sitemap XML
// ---------------------------------------------------------------------------
async function getSitemapXml() {
  if (useLocal) {
    if (!fs.existsSync(LOCAL_SITEMAP)) {
      console.error(`${colors.red}Local sitemap not found at ${LOCAL_SITEMAP}${colors.reset}`);
      console.error('Run "npm run build" first, or omit --local to fetch the live sitemap.');
      process.exit(1);
    }
    console.log(`  Reading local sitemap: ${LOCAL_SITEMAP}`);
    return fs.readFileSync(LOCAL_SITEMAP, 'utf8');
  }

  console.log(`  Fetching sitemap: ${SITEMAP_URL}`);
  const res = await fetch(SITEMAP_URL, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) {
    console.error(`${colors.red}Failed to fetch sitemap: ${res.status} ${res.statusText}${colors.reset}`);
    process.exit(1);
  }
  return res.text();
}

// ---------------------------------------------------------------------------
// Extract <loc> URLs from sitemap XML (simple regex — no XML parser needed)
// ---------------------------------------------------------------------------
function extractUrls(xml) {
  const urls = [];
  const re = /<loc>\s*(.*?)\s*<\/loc>/gi;
  let match;
  while ((match = re.exec(xml)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
}

// ---------------------------------------------------------------------------
// Check a single URL, following redirects manually so we can report 301/302
// ---------------------------------------------------------------------------
async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
    });
    clearTimeout(timer);

    const status = res.status;
    const location = res.headers.get('location') || '';
    return { url, status, location };
  } catch (err) {
    return { url, status: 0, error: err.message };
  }
}

// ---------------------------------------------------------------------------
// Run checks with concurrency limit
// ---------------------------------------------------------------------------
async function checkAll(urls) {
  const results = [];
  let idx = 0;

  async function worker() {
    while (idx < urls.length) {
      const i = idx++;
      const result = await checkUrl(urls[i]);
      results.push(result);

      // Progress indicator
      if (results.length % 25 === 0 || results.length === urls.length) {
        process.stdout.write(`\r  Checked ${results.length}/${urls.length} URLs...`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, urls.length) }, () => worker());
  await Promise.all(workers);
  process.stdout.write('\n\n');

  return results;
}

// ---------------------------------------------------------------------------
// Local-only: verify sitemap URLs have matching files in build output
// ---------------------------------------------------------------------------
function checkLocalBuildOutput(urls) {
  const siteUrl = 'https://mybcat.com';
  const results = [];

  for (const url of urls) {
    const urlPath = url.replace(siteUrl, '');
    // URL /foo/bar/ should map to BUILD_DIR/foo/bar/index.html
    const filePath = path.join(BUILD_DIR, urlPath, 'index.html');
    const exists = fs.existsSync(filePath);
    results.push({
      url,
      status: exists ? 200 : 404,
      location: '',
    });
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log(`${colors.bold}Sitemap URL Health Check${colors.reset}\n`);

  const xml = await getSitemapXml();
  const urls = extractUrls(xml);
  console.log(`  Found ${colors.blue}${urls.length}${colors.reset} URLs in sitemap\n`);

  if (urls.length === 0) {
    console.log(`${colors.yellow}No URLs found in sitemap.${colors.reset}`);
    return;
  }

  let results;
  if (localOnly) {
    console.log(`  Verifying against local build output: ${BUILD_DIR}\n`);
    results = checkLocalBuildOutput(urls);
  } else {
    results = await checkAll(urls);
  }

  // Categorize results
  const ok = results.filter((r) => r.status >= 200 && r.status < 300);
  const redirects = results.filter((r) => r.status >= 300 && r.status < 400);
  const clientErrors = results.filter((r) => r.status >= 400 && r.status < 500);
  const serverErrors = results.filter((r) => r.status >= 500);
  const failures = results.filter((r) => r.status === 0);

  // Report non-200s
  if (redirects.length > 0) {
    console.log(`${colors.yellow}Redirects (${redirects.length}):${colors.reset}`);
    for (const r of redirects) {
      console.log(`  ${r.status} ${r.url} -> ${r.location}`);
    }
    console.log();
  }

  if (clientErrors.length > 0) {
    console.log(`${colors.red}Client errors (${clientErrors.length}):${colors.reset}`);
    for (const r of clientErrors) {
      console.log(`  ${r.status} ${r.url}`);
    }
    console.log();
  }

  if (serverErrors.length > 0) {
    console.log(`${colors.red}Server errors (${serverErrors.length}):${colors.reset}`);
    for (const r of serverErrors) {
      console.log(`  ${r.status} ${r.url}`);
    }
    console.log();
  }

  if (failures.length > 0) {
    console.log(`${colors.red}Connection failures (${failures.length}):${colors.reset}`);
    for (const r of failures) {
      console.log(`  ${r.url}  (${r.error})`);
    }
    console.log();
  }

  // Summary
  const issueCount = redirects.length + clientErrors.length + serverErrors.length + failures.length;
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  ${colors.green}200 OK:${colors.reset}       ${ok.length}`);
  if (redirects.length) console.log(`  ${colors.yellow}3xx Redirect:${colors.reset} ${redirects.length}`);
  if (clientErrors.length) console.log(`  ${colors.red}4xx Error:${colors.reset}    ${clientErrors.length}`);
  if (serverErrors.length) console.log(`  ${colors.red}5xx Error:${colors.reset}    ${serverErrors.length}`);
  if (failures.length) console.log(`  ${colors.red}Failed:${colors.reset}       ${failures.length}`);
  console.log(`  ${colors.blue}Total:${colors.reset}        ${results.length}`);

  if (issueCount > 0) {
    console.log(`\n${colors.red}${colors.bold}${issueCount} URL(s) need attention.${colors.reset}`);
    process.exitCode = 1;
  } else {
    console.log(`\n${colors.green}${colors.bold}All ${ok.length} sitemap URLs return 200 OK.${colors.reset}`);
  }
}

main();
