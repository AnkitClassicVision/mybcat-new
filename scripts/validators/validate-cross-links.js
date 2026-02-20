#!/usr/bin/env node

/**
 * Cross-Link Safety Validator
 * Pre-build check: ensures published/scheduled posts only link to published posts.
 *
 * - Builds index: Map<slug, { status, scheduledDate, publishDate }>
 * - Scans published/scheduled posts for [text](/blog/slug/) links
 * - Published posts with broken cross-links → error (hard-fail)
 * - Scheduled posts with broken cross-links → warning (may self-resolve)
 * - Also checks relatedPosts frontmatter → warning if target not published
 *
 * Usage: node scripts/validators/validate-cross-links.js [--verbose]
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '..', '..', 'src', 'content', 'blog');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function buildPostIndex(blogDir) {
  const index = new Map();
  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);
    const slug = file.replace(/\.(md|mdx)$/, '');

    index.set(slug, {
      status: data.status || 'draft',
      scheduledDate: data.scheduledDate || null,
      publishDate: data.publishDate || null,
      file
    });
  }

  return index;
}

function extractBlogLinks(body) {
  const links = [];
  // Match [text](/blog/slug/) and [text](/blog/slug)
  const regex = /\[([^\]]+)\]\(\/blog\/([^/)]+)\/?(?:#[^)]*)?\)/g;
  let match;
  while ((match = regex.exec(body)) !== null) {
    links.push({ text: match[1], slug: match[2] });
  }
  // Also match href="/blog/slug/" in HTML
  const hrefRegex = /href=["']\/blog\/([^/"']+)\/?["']/gi;
  while ((match = hrefRegex.exec(body)) !== null) {
    links.push({ text: '(html-href)', slug: match[1] });
  }
  return links;
}

function isPublishedOrLiveToday(entry, today) {
  const coerceDate = (value) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  };

  if (entry.status === 'published') {
    // Align with site behavior: published posts are only live if publishDate is not in the future.
    const pd = coerceDate(entry.publishDate);
    return !pd || pd <= today;
  }

  if (entry.status === 'scheduled') {
    const sd = coerceDate(entry.scheduledDate);
    return !!sd && sd <= today;
  }

  return false;
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  console.log(`${colors.bold}Cross-Link Safety Validator${colors.reset}\n`);

  if (!fs.existsSync(BLOG_DIR)) {
    console.log('No blog directory found.');
    process.exit(0);
  }

  const index = buildPostIndex(BLOG_DIR);
  const today = new Date().toISOString().split('T')[0];

  let errorCount = 0;
  let warningCount = 0;
  let checkedCount = 0;

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content: body } = matter(raw);
    const sourceSlug = file.replace(/\.(md|mdx)$/, '');

    // Only check published/scheduled posts
    if (data.status !== 'published' && data.status !== 'scheduled') continue;

    checkedCount++;
    const sourceIsPublished = data.status === 'published';
    const fileIssues = [];

    // Check inline cross-links
    const links = extractBlogLinks(body);
    for (const link of links) {
      const target = index.get(link.slug);
      if (!target) {
        fileIssues.push({
          severity: sourceIsPublished ? 'error' : 'warning',
          message: `Links to /blog/${link.slug}/ — target not found`
        });
      } else if (!isPublishedOrLiveToday(target, today)) {
        fileIssues.push({
          severity: sourceIsPublished ? 'error' : 'warning',
          message: `Links to /blog/${link.slug}/ — target is ${target.status}${target.scheduledDate ? ' (scheduled ' + new Date(target.scheduledDate).toISOString().split('T')[0] + ')' : ''}`
        });
      }
    }

    // Check relatedPosts frontmatter
    if (Array.isArray(data.relatedPosts)) {
      for (const related of data.relatedPosts) {
        const relatedSlug = typeof related === 'string' ? related : null;
        if (!relatedSlug) continue;

        const target = index.get(relatedSlug);
        if (!target) {
          fileIssues.push({
            severity: 'warning',
            message: `relatedPosts: "${relatedSlug}" — not found`
          });
        } else if (target.status !== 'published') {
          fileIssues.push({
            severity: 'warning',
            message: `relatedPosts: "${relatedSlug}" — status is ${target.status}`
          });
        }
      }
    }

    // Report
    if (fileIssues.length > 0) {
      console.log(`${sourceIsPublished ? colors.red + '✗' : colors.yellow + '⚠'}${colors.reset} ${sourceSlug} (${data.status})`);
      for (const issue of fileIssues) {
        const color = issue.severity === 'error' ? colors.red : colors.yellow;
        const label = issue.severity === 'error' ? 'ERROR' : 'WARN';
        console.log(`  ${color}${label}: ${issue.message}${colors.reset}`);
        if (issue.severity === 'error') errorCount++;
        else warningCount++;
      }
      console.log();
    } else if (verbose) {
      console.log(`${colors.green}✓${colors.reset} ${sourceSlug}`);
    }
  }

  // Summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Checked: ${checkedCount} posts`);
  console.log(`  ${colors.red}Errors: ${errorCount}${colors.reset}`);
  console.log(`  ${colors.yellow}Warnings: ${warningCount}${colors.reset}`);

  if (errorCount > 0) {
    console.log(`\n${colors.cyan}Tip: Deactivate broken links or publish the target posts.${colors.reset}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});
