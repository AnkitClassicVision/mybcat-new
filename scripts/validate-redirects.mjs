#!/usr/bin/env node

/**
 * Redirect Validator
 * Reads vercel.json and checks for:
 *   1. Redirect chains (A→B where B is also a redirect source)
 *   2. Destinations that don't map to any known page in src/pages/ or src/content/
 *
 * Usage:
 *   node scripts/validate-redirects.mjs [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const verbose = process.argv.includes('--verbose');

// ---------------------------------------------------------------------------
// 1. Load redirects from vercel.json
// ---------------------------------------------------------------------------
function loadRedirects() {
  const vercelPath = path.join(ROOT, 'vercel.json');
  const data = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
  return data.redirects || [];
}

// ---------------------------------------------------------------------------
// 2. Normalize a path for comparison (strip trailing slash, lowercase)
// ---------------------------------------------------------------------------
function norm(p) {
  if (!p || p === '/') return '/';
  return p.replace(/\/+$/, '').toLowerCase();
}

// ---------------------------------------------------------------------------
// 3. Build set of known routes from src/pages and src/content
// ---------------------------------------------------------------------------
function collectKnownRoutes() {
  const known = new Set();

  // --- Static pages from src/pages ---
  const pagesDir = path.join(ROOT, 'src', 'pages');
  walkPages(pagesDir, pagesDir, known);

  // --- Content collection slugs (blog posts) ---
  const blogDir = path.join(ROOT, 'src', 'content', 'blog');
  if (fs.existsSync(blogDir)) {
    for (const file of fs.readdirSync(blogDir)) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const slug = file.replace(/\.(mdx?|md)$/, '');
        known.add(norm(`/blog/${slug}`));
      }
    }
  }

  // Common well-known paths that always exist
  known.add('/');
  known.add('/404');
  known.add('/sitemap-index.xml');
  known.add('/sitemap-0.xml');

  return known;
}

function walkPages(dir, baseDir, known) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkPages(full, baseDir, known);
    } else if (/\.(astro|md|mdx)$/.test(entry.name)) {
      let rel = path.relative(baseDir, full);
      // Convert file path to route
      rel = rel
        .replace(/\\/g, '/')
        .replace(/\/index\.(astro|md|mdx)$/, '')
        .replace(/\.(astro|md|mdx)$/, '');

      // Skip dynamic routes — we can't validate them statically
      if (rel.includes('[')) continue;
      // Skip utility files like rss.xml.ts
      if (rel.includes('.xml')) continue;

      known.add(norm(`/${rel}`));
    }
  }
}

// ---------------------------------------------------------------------------
// 4. Detect redirect chains
// ---------------------------------------------------------------------------
function findChains(redirects) {
  // Map: normalized source → { destination (original), permanent }
  const sourceMap = new Map();
  for (const r of redirects) {
    sourceMap.set(norm(r.source), r.destination);
  }

  const chains = [];
  for (const r of redirects) {
    const destNorm = norm(r.destination);
    if (sourceMap.has(destNorm)) {
      const finalDest = sourceMap.get(destNorm);
      // Skip self-referencing "chains" (e.g. case-normalization redirects
      // where /blog/FOO → /blog/foo/ and norm(/blog/foo/) == norm(/blog/FOO))
      if (norm(finalDest) === destNorm) continue;
      chains.push({
        source: r.source,
        intermediate: r.destination,
        final: finalDest,
      });
    }
  }
  return chains;
}

// ---------------------------------------------------------------------------
// 5. Check destinations against known routes
//    Skip external URLs and dynamic-route destinations
// ---------------------------------------------------------------------------
function findOrphanDestinations(redirects, knownRoutes) {
  // Patterns that are served by dynamic routes in Astro
  const dynamicPatterns = [
    /^\/blog\/category\/.+/,
    /^\/blog\/tag\/.+/,
    /^\/blog\/archive(\/.*)?/,
    /^\/blog\/.+/,          // [slug].astro
    /^\/industries\/.+/,
    /^\/solutions\/.+/,
    /^\/case-studies\/.+/,
    /^\/compare\/.+/,
    /^\/glossary\/.+/,
    /^\/enterprise\/.+/,
  ];

  const orphans = [];
  const seen = new Set();

  for (const r of redirects) {
    const dest = r.destination;
    // Skip external URLs
    if (dest.startsWith('http://') || dest.startsWith('https://')) continue;

    const destNorm = norm(dest);
    if (seen.has(destNorm)) continue;
    seen.add(destNorm);

    // Check static routes first
    if (knownRoutes.has(destNorm)) continue;

    // Check dynamic route patterns
    if (dynamicPatterns.some((pat) => pat.test(destNorm))) continue;

    orphans.push({ destination: dest, sources: redirects.filter((x) => norm(x.destination) === destNorm).map((x) => x.source) });
  }
  return orphans;
}

// ---------------------------------------------------------------------------
// 6. Check for duplicate redirect sources
//    Uses exact source strings — /foo and /foo/ are distinct (Vercel treats them separately)
// ---------------------------------------------------------------------------
function findDuplicates(redirects) {
  const counts = new Map();
  for (const r of redirects) {
    const key = r.source;
    if (!counts.has(key)) counts.set(key, []);
    counts.get(key).push(r);
  }
  return [...counts.entries()]
    .filter(([, v]) => v.length > 1)
    .map(([source, entries]) => ({ source, count: entries.length }));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  console.log(`${colors.bold}Redirect Validator${colors.reset}\n`);

  const redirects = loadRedirects();
  console.log(`  Loaded ${colors.blue}${redirects.length}${colors.reset} redirects from vercel.json\n`);

  const knownRoutes = collectKnownRoutes();
  if (verbose) {
    console.log(`  Known static routes: ${knownRoutes.size}`);
    for (const r of [...knownRoutes].sort()) console.log(`    ${r}`);
    console.log();
  }

  let issues = 0;

  // --- Chains ---
  const chains = findChains(redirects);
  if (chains.length > 0) {
    console.log(`${colors.yellow}Redirect chains found (${chains.length}):${colors.reset}`);
    for (const c of chains) {
      console.log(`  ${c.source} -> ${c.intermediate} -> ${c.final}`);
      issues++;
    }
    console.log();
  }

  // --- Orphan destinations ---
  const orphans = findOrphanDestinations(redirects, knownRoutes);
  if (orphans.length > 0) {
    console.log(`${colors.yellow}Destinations with no matching page (${orphans.length}):${colors.reset}`);
    for (const o of orphans) {
      console.log(`  ${o.destination}  (from: ${o.sources.join(', ')})`);
      issues++;
    }
    console.log();
  }

  // --- Duplicates ---
  const dupes = findDuplicates(redirects);
  if (dupes.length > 0) {
    console.log(`${colors.yellow}Duplicate redirect sources (${dupes.length}):${colors.reset}`);
    for (const d of dupes) {
      console.log(`  ${d.source}  (${d.count} entries)`);
      issues++;
    }
    console.log();
  }

  // --- Summary ---
  if (issues === 0) {
    console.log(`${colors.green}${colors.bold}All redirects look good.${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bold}Found ${issues} issue(s).${colors.reset}`);
    process.exitCode = 1;
  }
}

main();
