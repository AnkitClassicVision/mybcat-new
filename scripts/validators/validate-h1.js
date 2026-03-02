#!/usr/bin/env node

/**
 * H1 Tag Validator
 * Ensures exactly one H1 per page and validates H1 content
 *
 * Usage:
 *   node scripts/validators/validate-h1.js [--verbose] [--file <path>]
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { glob } from 'glob';
import matter from 'gray-matter';

const MAX_H1_LENGTH = 70;

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function extractH1Tags(content) {
  const h1Tags = [];

  // Match markdown H1: # Title
  const markdownH1 = content.match(/^#\s+(.+)$/gm);
  if (markdownH1) {
    for (const match of markdownH1) {
      const text = match.replace(/^#\s+/, '').trim();
      h1Tags.push({ type: 'markdown', text });
    }
  }

  // Match HTML H1: <h1>Title</h1>
  const htmlH1 = content.match(/<h1[^>]*>([^<]+)<\/h1>/gi);
  if (htmlH1) {
    for (const match of htmlH1) {
      const text = match.replace(/<\/?h1[^>]*>/gi, '').trim();
      h1Tags.push({ type: 'html', text });
    }
  }

  return h1Tags;
}

function validateMarkdownFile(filePath, verbose) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];

  try {
    const { data: frontmatter, content: bodyContent } = matter(content);

    // Skip drafts
    if (frontmatter.status === 'draft') return issues;

    const h1Tags = extractH1Tags(bodyContent);

    // Blog posts typically get H1 from title in layout, so check frontmatter
    if (filePath.includes('/blog/')) {
      // For blog posts, H1 comes from frontmatter title via layout
      // Check if there are additional H1s in content
      if (h1Tags.length > 0) {
        issues.push({
          file: filePath,
          severity: 'error',
          message: `Blog post has ${h1Tags.length} H1(s) in content. H1 should only come from title via layout.`,
          h1s: h1Tags.map(h => h.text)
        });
      }

      // Validate title length for H1
      const title = frontmatter.title;
      if (title && title.length > MAX_H1_LENGTH) {
        issues.push({
          file: filePath,
          severity: 'warning',
          message: `Title (used as H1) is ${title.length} chars (max recommended: ${MAX_H1_LENGTH})`,
          h1s: [title]
        });
      }
    }
  } catch (err) {
    issues.push({
      file: filePath,
      severity: 'error',
      message: `Error parsing file: ${err.message}`
    });
  }

  return issues;
}

function validateAstroFile(filePath, verbose) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];

  const h1Tags = extractH1Tags(content);

  // Check for H1 in component/layout files (may be intentional)
  if (filePath.includes('/layouts/') || filePath.includes('/components/')) {
    // Layouts and components may have conditional H1s - just warn
    if (h1Tags.length > 0 && verbose) {
      console.log(`${colors.blue}[INFO]${colors.reset} ${filePath} contains ${h1Tags.length} H1 tag(s) - verify intentional`);
    }
    return issues;
  }

  // For page files, enforce exactly one H1
  if (h1Tags.length === 0) {
    issues.push({
      file: filePath,
      severity: 'warning',
      message: 'No H1 tag found (may come from layout)',
      h1s: []
    });
  } else if (h1Tags.length > 1) {
    issues.push({
      file: filePath,
      severity: 'error',
      message: `Multiple H1 tags found: ${h1Tags.length}`,
      h1s: h1Tags.map(h => h.text)
    });
  }

  // Check H1 length
  for (const h1 of h1Tags) {
    if (h1.text.length > MAX_H1_LENGTH) {
      issues.push({
        file: filePath,
        severity: 'warning',
        message: `H1 is ${h1.text.length} chars (max recommended: ${MAX_H1_LENGTH})`,
        h1s: [h1.text]
      });
    }
  }

  return issues;
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const fileIndex = args.indexOf('--file');
  const specificFile = fileIndex !== -1 ? args[fileIndex + 1] : null;

  console.log(`${colors.bold}H1 Tag Validator${colors.reset}\n`);

  let allIssues = [];

  let files;
  if (specificFile) {
    files = [specificFile];
  } else {
    files = await glob([
      'src/content/blog/**/*.{md,mdx}',
      'src/pages/**/*.astro'
    ], { ignore: ['node_modules/**', 'src/pages/api/**'] });
  }

  console.log(`Validating ${files.length} files...\n`);

  for (const file of files) {
    let issues;
    if (file.endsWith('.md') || file.endsWith('.mdx')) {
      issues = validateMarkdownFile(file, verbose);
    } else {
      issues = validateAstroFile(file, verbose);
    }
    allIssues = allIssues.concat(issues);
  }

  // Report results
  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');

  if (allIssues.length === 0) {
    console.log(`${colors.green}✓ All H1 tags valid${colors.reset}`);
    process.exit(0);
  }

  for (const issue of allIssues) {
    const color = issue.severity === 'error' ? colors.red : colors.yellow;
    const icon = issue.severity === 'error' ? '✗' : '⚠';
    console.log(`${color}${icon}${colors.reset} ${issue.file}`);
    console.log(`  ${issue.message}`);
    if (verbose && issue.h1s && issue.h1s.length > 0) {
      for (const h1 of issue.h1s) {
        console.log(`    ${colors.blue}→ "${h1}"${colors.reset}`);
      }
    }
    console.log();
  }

  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  ${colors.red}Errors: ${errors.length}${colors.reset}`);
  console.log(`  ${colors.yellow}Warnings: ${warnings.length}${colors.reset}`);

  if (errors.length > 0) {
    process.exit(1);
  }
}

// Only run main() when invoked directly (not when imported as a module)
const isDirectRun = process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  main().catch(err => {
    console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
    process.exit(1);
  });
}
