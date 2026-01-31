#!/usr/bin/env node

/**
 * Publish Date Validator
 * Ensures no blog posts have status="published" with a future publishDate
 *
 * This prevents posts from going live before their intended publish date.
 *
 * Usage:
 *   node scripts/validators/validate-publish-dates.js [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function parseDate(value) {
  if (!value) return null;
  const str = String(value).trim();
  // Handle Date objects
  if (value instanceof Date) return value;
  // Handle ISO strings
  try {
    return new Date(str);
  } catch {
    return null;
  }
}

async function validatePublishDates(verbose = false) {
  const blogDir = './src/content/blog';
  if (!fs.existsSync(blogDir)) {
    console.log(`${colors.yellow}Warning: Blog directory not found at ${blogDir}${colors.reset}`);
    return { passed: true, issues: [] };
  }

  const files = await glob(`${blogDir}/**/*.{md,mdx}`);
  const issues = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today

  for (const filePath of files) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data: frontmatter } = matter(content);

      const status = String(frontmatter.status || '').trim();
      if (status !== 'published') continue;

      const publishDate = parseDate(frontmatter.publishDate);
      if (!publishDate) continue;

      // Reset time for comparison
      const pubDateOnly = new Date(publishDate);
      pubDateOnly.setHours(0, 0, 0, 0);

      if (pubDateOnly > today) {
        const slug = path.basename(filePath, path.extname(filePath));
        issues.push({
          file: filePath,
          slug,
          publishDate: frontmatter.publishDate,
          daysAhead: Math.ceil((pubDateOnly - today) / (1000 * 60 * 60 * 24)),
          message: `Post "${slug}" has status="published" but publishDate is in the future (${frontmatter.publishDate}). Change status to "draft" or "scheduled".`
        });
      }
    } catch (err) {
      if (verbose) {
        console.log(`${colors.yellow}Warning: Could not parse ${filePath}: ${err.message}${colors.reset}`);
      }
    }
  }

  return { passed: issues.length === 0, issues };
}

async function main() {
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

  console.log(`${colors.blue}${colors.bold}Publish Date Validator${colors.reset}`);
  console.log('Checking for published posts with future dates...\n');

  const { passed, issues } = await validatePublishDates(verbose);

  if (passed) {
    console.log(`${colors.green}${colors.bold}PASS${colors.reset} No future-dated published posts found.`);
    process.exit(0);
  }

  console.log(`${colors.red}${colors.bold}FAIL${colors.reset} Found ${issues.length} post(s) with future publishDate but status="published":\n`);

  for (const issue of issues) {
    console.log(`${colors.red}ERROR${colors.reset} ${issue.slug}`);
    console.log(`  ${colors.yellow}publishDate:${colors.reset} ${issue.publishDate} (${issue.daysAhead} days ahead)`);
    console.log(`  ${colors.yellow}file:${colors.reset} ${issue.file}`);
    console.log(`  ${colors.yellow}fix:${colors.reset} Change status to "draft" or set publishDate to today/past\n`);
  }

  console.log(`${colors.bold}Why this matters:${colors.reset}`);
  console.log('Posts with status="published" appear on the live site immediately,');
  console.log('regardless of their publishDate. The publishDate field is only used');
  console.log('for display/sorting purposes, not for gating visibility.\n');

  console.log(`${colors.bold}To fix:${colors.reset}`);
  console.log('1. Change status from "published" to "draft" for scheduled posts');
  console.log('2. Use the scheduled-publish workflow to auto-publish on the correct date');
  console.log('3. Or set publishDate to today if the post should be live now\n');

  process.exit(1);
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});
