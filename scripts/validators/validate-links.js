#!/usr/bin/env node

/**
 * Internal Link Validator
 * Validates all internal links point to valid routes (no 404s)
 *
 * Usage:
 *   node scripts/validators/validate-links.js [--verbose]
 *
 * Note: Requires built site (npm run build first)
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const DIST_DIR = './dist';
const SITE_BASE = 'https://mybcat.com';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function extractInternalLinks(html, filePath) {
  const links = [];

  // Match href attributes
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let match;

  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];

    // Skip external links, anchors, mailto, tel, javascript
    if (href.startsWith('http://') ||
        href.startsWith('https://') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        href.startsWith('data:')) {
      continue;
    }

    // Internal link
    links.push({
      href,
      source: filePath
    });
  }

  return links;
}

function normalizeLink(href) {
  // Remove leading slash for comparison
  let normalized = href.startsWith('/') ? href.slice(1) : href;

  // Add trailing slash if not present and not a file
  if (!normalized.endsWith('/') && !path.extname(normalized)) {
    normalized += '/';
  }

  return normalized;
}

function linkToFilePath(href, distDir) {
  const normalized = normalizeLink(href);

  // Check for index.html
  const indexPath = path.join(distDir, normalized, 'index.html');
  if (fs.existsSync(indexPath)) {
    return indexPath;
  }

  // Check for direct file
  const directPath = path.join(distDir, normalized);
  if (fs.existsSync(directPath)) {
    return directPath;
  }

  // Check without trailing slash
  const withoutSlash = normalized.replace(/\/$/, '');
  const altPath = path.join(distDir, withoutSlash, 'index.html');
  if (fs.existsSync(altPath)) {
    return altPath;
  }

  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  console.log(`${colors.bold}Internal Link Validator${colors.reset}\n`);

  // Check if dist exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`${colors.red}Error: ${DIST_DIR} not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  // Collect all HTML files
  const htmlFiles = await glob([`${DIST_DIR}/**/*.html`]);
  console.log(`Scanning ${htmlFiles.length} HTML files...\n`);

  // Extract all internal links
  const allLinks = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf-8');
    const links = extractInternalLinks(html, file);
    allLinks.push(...links);
  }

  console.log(`Found ${allLinks.length} internal links\n`);

  // Validate each link
  const brokenLinks = [];
  const checkedPaths = new Set();

  for (const link of allLinks) {
    const normalized = normalizeLink(link.href);

    // Skip if already checked
    if (checkedPaths.has(normalized)) {
      continue;
    }
    checkedPaths.add(normalized);

    const targetPath = linkToFilePath(link.href, DIST_DIR);

    if (!targetPath) {
      brokenLinks.push({
        href: link.href,
        source: link.source,
        normalized
      });
    }
  }

  // Check for common issues
  const issues = [];

  // Check for double slashes
  for (const link of allLinks) {
    if (link.href.includes('//') && !link.href.startsWith('http')) {
      issues.push({
        type: 'double-slash',
        href: link.href,
        source: link.source
      });
    }
  }

  // Check for missing trailing slashes
  for (const link of allLinks) {
    if (!link.href.endsWith('/') &&
        !path.extname(link.href) &&
        !link.href.includes('#')) {
      issues.push({
        type: 'missing-trailing-slash',
        href: link.href,
        source: link.source
      });
    }
  }

  // Report results
  if (brokenLinks.length === 0 && issues.length === 0) {
    console.log(`${colors.green}✓ All internal links valid${colors.reset}`);
    console.log(`  Checked ${checkedPaths.size} unique paths`);
    process.exit(0);
  }

  if (brokenLinks.length > 0) {
    console.log(`${colors.red}${colors.bold}Broken Links (${brokenLinks.length}):${colors.reset}\n`);
    for (const link of brokenLinks) {
      console.log(`${colors.red}✗${colors.reset} ${link.href}`);
      if (verbose) {
        console.log(`  ${colors.blue}Source: ${link.source}${colors.reset}`);
      }
    }
    console.log();
  }

  if (issues.length > 0 && verbose) {
    console.log(`${colors.yellow}${colors.bold}Link Issues (${issues.length}):${colors.reset}\n`);
    for (const issue of issues) {
      console.log(`${colors.yellow}⚠${colors.reset} [${issue.type}] ${issue.href}`);
      console.log(`  ${colors.blue}Source: ${issue.source}${colors.reset}`);
    }
    console.log();
  }

  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  ${colors.red}Broken links: ${brokenLinks.length}${colors.reset}`);
  console.log(`  ${colors.yellow}Issues: ${issues.length}${colors.reset}`);
  console.log(`  Checked: ${checkedPaths.size} unique paths`);

  if (brokenLinks.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});
