#!/usr/bin/env node

/**
 * Enterprise Links Validator
 * Validates that enterprise pillar pages have sufficient inbound links
 *
 * Usage:
 *   node scripts/validators/validate-enterprise-links.js [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const CONFIG_PATH = './scripts/config/enterprise-links.json';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function extractInternalLinks(content) {
  const links = [];

  // Match markdown links
  const mdLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  while ((match = mdLinkRegex.exec(content)) !== null) {
    const href = match[2];
    if (href.startsWith('/') || href.startsWith('https://mybcat.com')) {
      links.push(href.replace('https://mybcat.com', ''));
    }
  }

  // Match href attributes
  const hrefRegex = /href=["']([^"']+)["']/gi;
  while ((match = hrefRegex.exec(content)) !== null) {
    const href = match[1];
    if (href.startsWith('/') || href.startsWith('https://mybcat.com')) {
      links.push(href.replace('https://mybcat.com', ''));
    }
  }

  return links;
}

function normalizeLink(href) {
  let normalized = href.split('#')[0]; // Remove anchors
  normalized = normalized.split('?')[0]; // Remove query params
  if (!normalized.endsWith('/') && !path.extname(normalized)) {
    normalized += '/';
  }
  return normalized;
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  console.log(`${colors.bold}Enterprise Links Validator${colors.reset}\n`);

  const config = loadConfig();

  // Initialize link counts
  const linkCounts = {};
  const linkSources = {};
  for (const page of Object.keys(config.pillarPages)) {
    linkCounts[page] = 0;
    linkSources[page] = [];
  }

  // Get source files
  const sourceFiles = await glob(config.linkSources.validSources, {
    ignore: config.linkSources.excludeSources
  });

  console.log(`Scanning ${sourceFiles.length} source files...\n`);

  // Count links to each pillar page
  for (const file of sourceFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const links = extractInternalLinks(content);

    for (const link of links) {
      const normalized = normalizeLink(link);

      for (const pillarPage of Object.keys(config.pillarPages)) {
        if (normalized === pillarPage || normalized === pillarPage.replace(/\/$/, '')) {
          linkCounts[pillarPage]++;
          linkSources[pillarPage].push(file);
        }
      }
    }
  }

  // Check against requirements
  const issues = [];
  const passes = [];

  for (const [page, pageConfig] of Object.entries(config.pillarPages)) {
    const count = linkCounts[page];
    const required = pageConfig.minInboundLinks;
    const threshold = required * config.reporting.warnThreshold;
    const failThreshold = required * config.reporting.failThreshold;

    if (count >= required) {
      passes.push({
        page,
        count,
        required,
        priority: pageConfig.priority
      });
    } else if (count >= threshold) {
      issues.push({
        page,
        count,
        required,
        severity: 'warning',
        priority: pageConfig.priority,
        description: pageConfig.description
      });
    } else {
      issues.push({
        page,
        count,
        required,
        severity: count < failThreshold ? 'error' : 'warning',
        priority: pageConfig.priority,
        description: pageConfig.description
      });
    }
  }

  // Report results
  console.log(`${colors.bold}Enterprise Pillar Page Links:${colors.reset}\n`);

  // Show passes
  for (const pass of passes) {
    console.log(`${colors.green}✓${colors.reset} ${pass.page}`);
    console.log(`  Links: ${pass.count}/${pass.required} ${colors.green}(OK)${colors.reset}`);
    if (verbose) {
      console.log(`  Sources:`);
      for (const source of linkSources[pass.page].slice(0, 5)) {
        console.log(`    ${colors.blue}→ ${source}${colors.reset}`);
      }
      if (linkSources[pass.page].length > 5) {
        console.log(`    ${colors.blue}... and ${linkSources[pass.page].length - 5} more${colors.reset}`);
      }
    }
    console.log();
  }

  // Show issues
  for (const issue of issues) {
    const color = issue.severity === 'error' ? colors.red : colors.yellow;
    const icon = issue.severity === 'error' ? '✗' : '⚠';
    console.log(`${color}${icon}${colors.reset} ${issue.page}`);
    console.log(`  ${issue.description}`);
    console.log(`  Links: ${issue.count}/${issue.required} ${color}(needs ${issue.required - issue.count} more)${colors.reset}`);
    if (verbose) {
      console.log(`  Current sources:`);
      for (const source of linkSources[issue.page]) {
        console.log(`    ${colors.blue}→ ${source}${colors.reset}`);
      }
    }
    console.log();
  }

  // Summary
  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  ${colors.green}Passing: ${passes.length}${colors.reset}`);
  console.log(`  ${colors.red}Errors: ${errors.length}${colors.reset}`);
  console.log(`  ${colors.yellow}Warnings: ${warnings.length}${colors.reset}`);

  if (errors.length > 0) {
    console.log(`\n${colors.cyan}Tip: Add contextual links to enterprise pages from relevant blog posts.${colors.reset}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});
