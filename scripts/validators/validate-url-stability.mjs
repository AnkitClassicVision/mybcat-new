#!/usr/bin/env node

/**
 * URL Stability Validator
 *
 * Compares the current build's sitemap against a saved baseline and flags
 * any URLs that were removed without a corresponding 301 redirect in vercel.json.
 *
 * Usage:
 *   node scripts/validators/validate-url-stability.mjs [--save]
 *
 * Options:
 *   --save    Save current sitemap URLs as the new baseline (run after verified deploy)
 *
 * The baseline is stored in scripts/config/sitemap-baseline.json.
 * First run with no baseline will save the current sitemap and exit cleanly.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

const BASELINE_FILE = path.join(ROOT, 'scripts', 'config', 'sitemap-baseline.json');

const BUILD_DIR = fs.existsSync(path.join(ROOT, '.vercel', 'output', 'static'))
  ? path.join(ROOT, '.vercel', 'output', 'static')
  : path.join(ROOT, 'dist');

const SITEMAP_PATH = path.join(BUILD_DIR, 'sitemap-0.xml');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

// Extract <loc> URLs from sitemap XML
function extractUrls(xml) {
  const urls = [];
  const re = /<loc>\s*(.*?)\s*<\/loc>/gi;
  let match;
  while ((match = re.exec(xml)) !== null) {
    urls.push(match[1].trim());
  }
  return urls;
}

// Load redirect destinations from vercel.json
function loadRedirectSources() {
  const vercelPath = path.join(ROOT, 'vercel.json');
  const data = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  const sources = new Set();
  for (const r of data.redirects || []) {
    // Normalize: strip trailing slash, lowercase
    const norm = r.source.replace(/\/+$/, '').toLowerCase();
    sources.add(norm);
  }
  return sources;
}

function norm(url) {
  return url.replace('https://mybcat.com', '').replace(/\/+$/, '').toLowerCase() || '/';
}

function main() {
  const saveMode = process.argv.includes('--save');

  // Read current sitemap
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.log(`${colors.yellow}No sitemap found at ${SITEMAP_PATH}. Run build first.${colors.reset}`);
    process.exitCode = 1;
    return;
  }

  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const currentUrls = extractUrls(xml);
  const currentSet = new Set(currentUrls.map(norm));

  console.log(`${colors.bold}URL Stability Validator${colors.reset}\n`);
  console.log(`  Current sitemap: ${colors.blue}${currentUrls.length}${colors.reset} URLs\n`);

  // Save mode: write baseline and exit
  if (saveMode) {
    fs.mkdirSync(path.dirname(BASELINE_FILE), { recursive: true });
    fs.writeFileSync(BASELINE_FILE, JSON.stringify({ urls: currentUrls, date: new Date().toISOString() }, null, 2));
    console.log(`${colors.green}Baseline saved with ${currentUrls.length} URLs.${colors.reset}`);
    return;
  }

  // Load baseline
  if (!fs.existsSync(BASELINE_FILE)) {
    console.log(`${colors.yellow}No baseline found. Saving current sitemap as baseline.${colors.reset}`);
    fs.mkdirSync(path.dirname(BASELINE_FILE), { recursive: true });
    fs.writeFileSync(BASELINE_FILE, JSON.stringify({ urls: currentUrls, date: new Date().toISOString() }, null, 2));
    console.log(`${colors.green}Baseline created. Run again after next build to compare.${colors.reset}`);
    return;
  }

  const baseline = JSON.parse(fs.readFileSync(BASELINE_FILE, 'utf8'));
  const baselineUrls = baseline.urls || [];
  const baselineSet = new Set(baselineUrls.map(norm));

  console.log(`  Baseline: ${colors.blue}${baselineUrls.length}${colors.reset} URLs (from ${baseline.date || 'unknown'})\n`);

  // Find removed URLs (in baseline but not in current)
  const redirectSources = loadRedirectSources();
  const removed = [];
  const removedWithRedirect = [];
  const removedWithoutRedirect = [];

  for (const url of baselineUrls) {
    const n = norm(url);
    if (!currentSet.has(n)) {
      removed.push(url);
      if (redirectSources.has(n)) {
        removedWithRedirect.push(url);
      } else {
        removedWithoutRedirect.push(url);
      }
    }
  }

  // Find added URLs
  const added = currentUrls.filter(url => !baselineSet.has(norm(url)));

  // Report
  if (added.length > 0) {
    console.log(`${colors.green}New URLs added (${added.length}):${colors.reset}`);
    for (const url of added.slice(0, 10)) {
      console.log(`  + ${url}`);
    }
    if (added.length > 10) console.log(`  ... and ${added.length - 10} more`);
    console.log();
  }

  if (removedWithRedirect.length > 0) {
    console.log(`${colors.yellow}Removed URLs with redirects (${removedWithRedirect.length}):${colors.reset}`);
    for (const url of removedWithRedirect) {
      console.log(`  ~ ${url} (has 301)`);
    }
    console.log();
  }

  if (removedWithoutRedirect.length > 0) {
    console.log(`${colors.red}${colors.bold}REMOVED URLs WITHOUT REDIRECTS (${removedWithoutRedirect.length}):${colors.reset}`);
    for (const url of removedWithoutRedirect) {
      console.log(`  ${colors.red}✗ ${url}${colors.reset}`);
    }
    console.log();
    console.log(`${colors.red}These URLs were in the previous sitemap but are now gone with no 301.`);
    console.log(`Add redirects in vercel.json or restore the pages.${colors.reset}`);
    process.exitCode = 1;
    return;
  }

  if (removed.length === 0 && added.length === 0) {
    console.log(`${colors.green}${colors.bold}No URL changes since baseline.${colors.reset}`);
  } else if (removedWithoutRedirect.length === 0) {
    console.log(`${colors.green}${colors.bold}All URL changes are safe (${added.length} added, ${removedWithRedirect.length} removed with redirects).${colors.reset}`);
  }
}

main();
