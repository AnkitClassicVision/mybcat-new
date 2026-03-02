#!/usr/bin/env node

/**
 * Meta Tag Validator
 * Validates title, description, and other meta tag lengths and requirements
 *
 * Usage:
 *   node scripts/validators/validate-meta.js [--verbose] [--file <path>]
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { glob } from 'glob';
import matter from 'gray-matter';

const CONFIG_PATH = './scripts/config/meta-rules.json';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function validateFrontmatter(filePath, frontmatter, config) {
  const issues = [];

  // Check title
  const title = frontmatter.seoTitle || frontmatter.title;
  if (!title) {
    issues.push({
      file: filePath,
      field: 'title',
      severity: 'error',
      message: 'Missing title'
    });
  } else {
    if (title.length < config.title.minLength) {
      issues.push({
        file: filePath,
        field: 'title',
        severity: 'warning',
        message: `Title too short: ${title.length} chars (min: ${config.title.minLength})`,
        value: title
      });
    }
    if (title.length > config.title.maxLength) {
      issues.push({
        file: filePath,
        field: 'title',
        severity: 'error',
        message: `Title too long: ${title.length} chars (max: ${config.title.maxLength})`,
        value: title
      });
    }
    for (const forbidden of config.title.mustNotInclude) {
      if (title.toLowerCase().includes(forbidden.toLowerCase())) {
        issues.push({
          file: filePath,
          field: 'title',
          severity: 'error',
          message: `Title contains forbidden term: "${forbidden}"`,
          value: title
        });
      }
    }
  }

  // Check description
  const description = frontmatter.seoDescription || frontmatter.description;
  if (!description) {
    issues.push({
      file: filePath,
      field: 'description',
      severity: 'error',
      message: 'Missing description'
    });
  } else {
    if (description.length < config.description.minLength) {
      issues.push({
        file: filePath,
        field: 'description',
        severity: 'warning',
        message: `Description too short: ${description.length} chars (min: ${config.description.minLength})`,
        value: description.substring(0, 50) + '...'
      });
    }
    if (description.length > config.description.maxLength) {
      issues.push({
        file: filePath,
        field: 'description',
        severity: 'error',
        message: `Description too long: ${description.length} chars (max: ${config.description.maxLength})`,
        value: description.substring(0, 50) + '...'
      });
    }
    for (const forbidden of config.description.mustNotInclude) {
      if (description.toLowerCase().includes(forbidden.toLowerCase())) {
        issues.push({
          file: filePath,
          field: 'description',
          severity: 'error',
          message: `Description contains forbidden term: "${forbidden}"`,
          value: description.substring(0, 50) + '...'
        });
      }
    }
  }

  // Check canonical if present
  if (frontmatter.canonical) {
    if (config.canonical.mustBeAbsolute && !frontmatter.canonical.startsWith('http')) {
      issues.push({
        file: filePath,
        field: 'canonical',
        severity: 'error',
        message: 'Canonical URL must be absolute',
        value: frontmatter.canonical
      });
    }
    if (config.canonical.mustUseHttps && !frontmatter.canonical.startsWith('https://')) {
      issues.push({
        file: filePath,
        field: 'canonical',
        severity: 'error',
        message: 'Canonical URL must use HTTPS',
        value: frontmatter.canonical
      });
    }
    if (config.canonical.mustIncludeTrailingSlash && !frontmatter.canonical.endsWith('/')) {
      issues.push({
        file: filePath,
        field: 'canonical',
        severity: 'warning',
        message: 'Canonical URL should include trailing slash',
        value: frontmatter.canonical
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

  console.log(`${colors.bold}Meta Tag Validator${colors.reset}\n`);

  const config = loadConfig();
  let allIssues = [];

  let files;
  if (specificFile) {
    files = [specificFile];
  } else {
    files = await glob(['src/content/blog/**/*.{md,mdx}'], { ignore: ['node_modules/**'] });
  }

  console.log(`Validating ${files.length} files...\n`);

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      const { data: frontmatter } = matter(content);

      // Skip drafts
      if (frontmatter.status === 'draft') continue;

      const issues = validateFrontmatter(file, frontmatter, config);
      allIssues = allIssues.concat(issues);
    } catch (err) {
      console.error(`${colors.red}Error parsing ${file}: ${err.message}${colors.reset}`);
    }
  }

  // Report results
  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');

  if (allIssues.length === 0) {
    console.log(`${colors.green}✓ All meta tags valid${colors.reset}`);
    process.exit(0);
  }

  // Group by file
  const byFile = {};
  for (const issue of allIssues) {
    if (!byFile[issue.file]) byFile[issue.file] = [];
    byFile[issue.file].push(issue);
  }

  for (const [file, issues] of Object.entries(byFile)) {
    console.log(`${colors.bold}${file}${colors.reset}`);
    for (const issue of issues) {
      const color = issue.severity === 'error' ? colors.red : colors.yellow;
      const icon = issue.severity === 'error' ? '✗' : '⚠';
      console.log(`  ${color}${icon}${colors.reset} [${issue.field}] ${issue.message}`);
      if (verbose && issue.value) {
        console.log(`    ${colors.blue}Value: "${issue.value}"${colors.reset}`);
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
