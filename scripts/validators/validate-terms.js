#!/usr/bin/env node

/**
 * Forbidden Terms Validator
 * Detects B2C/local terms that conflict with enterprise B2B positioning
 *
 * Usage:
 *   node scripts/validators/validate-terms.js [--verbose] [--file <path>]
 */

import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { glob } from 'glob';

const CONFIG_PATH = './scripts/config/forbidden-terms.json';
const ALLOWLIST_PATH = './scripts/config/term-allowlist.json';

// Colors for terminal output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function loadConfig() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  const allowlist = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf-8'));
  return { config, allowlist };
}

function isAllowed(filePath, term, allowlist, content) {
  // Check global file exceptions
  const normalizedPath = filePath.replace(/\\/g, '/');
  if (allowlist.exceptions.some(e => normalizedPath.includes(e.file) && e.terms.includes(term))) {
    return true;
  }

  // Check for inline comment exceptions
  for (const pattern of allowlist.commentPatterns) {
    if (content.includes(pattern)) {
      return true;
    }
  }

  return false;
}

function validateFile(filePath, config, allowlist, verbose) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues = [];
  const normalizedPath = filePath.replace(/\\/g, '/');

  // Check global file exceptions first
  if (config.globalExceptions?.filePatterns?.some(p => normalizedPath.includes(p))) {
    if (verbose) {
      console.log(`${colors.blue}[SKIP]${colors.reset} ${filePath} (global exception)`);
    }
    return issues;
  }

  for (const [categoryName, category] of Object.entries(config.categories)) {
    for (const termConfig of category.terms) {
      const regex = new RegExp(termConfig.pattern, 'gi');
      let match;

      while ((match = regex.exec(content)) !== null) {
        const term = match[0];

        // Check if this specific occurrence is allowed
        if (isAllowed(filePath, term, allowlist, content)) {
          continue;
        }

        // Check scope patterns
        if (termConfig.scopePatterns && termConfig.scopePatterns.length > 0) {
          const inScope = termConfig.scopePatterns.some(scope => normalizedPath.includes(scope));
          if (!inScope) {
            continue; // Term only forbidden in specific scopes
          }
        }

        // Calculate line number
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;

        issues.push({
          file: filePath,
          line: lineNumber,
          term: term,
          category: categoryName,
          severity: category.severity,
          context: termConfig.context,
          replacement: termConfig.replacement
        });
      }
    }
  }

  return issues;
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const fileIndex = args.indexOf('--file');
  const specificFile = fileIndex !== -1 ? args[fileIndex + 1] : null;

  console.log(`${colors.bold}Forbidden Terms Validator${colors.reset}\n`);

  const { config, allowlist } = loadConfig();
  let allIssues = [];

  let files;
  if (specificFile) {
    files = [specificFile];
  } else {
    // Scan content files
    files = await glob([
      'src/content/blog/**/*.{md,mdx}',
      'src/pages/**/*.astro',
      'src/layouts/**/*.astro'
    ], { ignore: ['node_modules/**'] });
  }

  console.log(`Scanning ${files.length} files...\n`);

  for (const file of files) {
    const issues = validateFile(file, config, allowlist, verbose);
    allIssues = allIssues.concat(issues);
  }

  // Report results
  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');

  if (allIssues.length === 0) {
    console.log(`${colors.green}✓ No forbidden terms detected${colors.reset}`);
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
      console.log(`  ${color}${icon}${colors.reset} Line ${issue.line}: "${issue.term}" (${issue.category})`);
      if (verbose && issue.replacement) {
        console.log(`    ${colors.blue}→ Consider: ${issue.replacement}${colors.reset}`);
      }
    }
    console.log();
  }

  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  ${colors.red}Errors: ${errors.length}${colors.reset}`);
  console.log(`  ${colors.yellow}Warnings: ${warnings.length}${colors.reset}`);

  // Exit with error code if there are errors
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
