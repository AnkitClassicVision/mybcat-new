#!/usr/bin/env node

/**
 * Auto-Deactivate Broken Cross-Links
 *
 * Scans published posts for links to unpublished/scheduled/missing targets.
 * Replaces [text](/blog/slug/) with plain text and records the deactivation
 * in deactivated-links.json so links can be auto-restored later.
 *
 * Usage: node scripts/deactivate-broken-links.js [--dry-run] [--verbose]
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import {
  BLOG_DIR,
  buildPostIndex,
  extractBlogLinks,
  isPublishedOrLiveToday
} from './validators/validate-cross-links.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEACTIVATED_LINKS_PATH = path.join(__dirname, 'config', 'deactivated-links.json');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verbose = args.includes('--verbose') || args.includes('-v');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

console.log(`${colors.bold}Auto-Deactivate Broken Cross-Links${colors.reset}`);
if (dryRun) console.log(`${colors.cyan}(dry-run mode — no files will be modified)${colors.reset}`);
console.log();

if (!fs.existsSync(BLOG_DIR)) {
  console.log('No blog directory found.');
  process.exit(0);
}

// Load existing deactivated links
let deactivatedEntries = [];
if (fs.existsSync(DEACTIVATED_LINKS_PATH)) {
  try {
    deactivatedEntries = JSON.parse(fs.readFileSync(DEACTIVATED_LINKS_PATH, 'utf-8'));
  } catch {
    console.log('Warning: Could not parse deactivated-links.json, starting fresh.');
    deactivatedEntries = [];
  }
}

// Build a set of existing deactivations for idempotency
const existingDeactivations = new Set(
  deactivatedEntries.map(e => `${e.sourceSlug}::${e.originalMarkdown}`)
);

const index = buildPostIndex(BLOG_DIR);
const today = new Date().toISOString().split('T')[0];

const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

let deactivatedCount = 0;
let skippedCount = 0;
const newEntries = [];

for (const file of files) {
  const filePath = path.join(BLOG_DIR, file);
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content: body } = matter(raw);
  const sourceSlug = file.replace(/\.(md|mdx)$/, '');

  // Only scan published posts
  if (data.status !== 'published') continue;

  const links = extractBlogLinks(body);
  const toDeactivate = [];

  for (const link of links) {
    const target = index.get(link.slug);
    const isBroken = !target || !isPublishedOrLiveToday(target, today);

    if (!isBroken) continue;

    // Check idempotency
    if (existingDeactivations.has(`${sourceSlug}::${link.fullMatch}`)) {
      skippedCount++;
      if (verbose) {
        console.log(`  Skip (already deactivated): ${sourceSlug} → ${link.slug}`);
      }
      continue;
    }

    toDeactivate.push(link);
  }

  if (toDeactivate.length === 0) continue;

  // Process deactivations for this file
  let fileContent = raw;

  for (const link of toDeactivate) {
    const pos = fileContent.indexOf(link.fullMatch);
    if (pos === -1) {
      console.log(`  ${colors.yellow}Warning: Could not find "${link.fullMatch}" in ${file}${colors.reset}`);
      continue;
    }

    // Replace fullMatch with plain text (only this occurrence via indexOf)
    fileContent = fileContent.substring(0, pos) + link.text + fileContent.substring(pos + link.fullMatch.length);

    const entry = {
      sourceSlug,
      targetSlug: link.slug,
      originalMarkdown: link.fullMatch,
      plainText: link.text
    };

    newEntries.push(entry);
    deactivatedCount++;

    const reason = index.has(link.slug)
      ? `target is ${index.get(link.slug).status}`
      : 'target not found';
    console.log(`  ${colors.red}Deactivated:${colors.reset} ${sourceSlug} → /blog/${link.slug}/ (${reason})`);
  }

  if (!dryRun && deactivatedCount > 0) {
    fs.writeFileSync(filePath, fileContent);
  }
}

// Update deactivated-links.json
if (newEntries.length > 0 && !dryRun) {
  const updated = [...deactivatedEntries, ...newEntries];
  fs.writeFileSync(DEACTIVATED_LINKS_PATH, JSON.stringify(updated, null, 2) + '\n');
}

// Summary
console.log();
console.log(`${colors.bold}Summary:${colors.reset}`);
console.log(`  Deactivated: ${deactivatedCount}`);
console.log(`  Skipped (already deactivated): ${skippedCount}`);
if (dryRun && deactivatedCount > 0) {
  console.log(`  ${colors.cyan}(dry-run — no changes written)${colors.reset}`);
}
if (deactivatedCount === 0 && skippedCount === 0) {
  console.log(`  ${colors.green}No broken cross-links found.${colors.reset}`);
}
