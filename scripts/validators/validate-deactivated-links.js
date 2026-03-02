#!/usr/bin/env node

/**
 * Deactivated-Links Schema Validator
 *
 * Ensures every entry in scripts/config/deactivated-links.json has the
 * full 6-field schema including contextBefore and contextAfter.
 * Entries missing these fields cause silent content corruption when
 * restoreDeactivatedLinks() falls back to first-occurrence string replace.
 *
 * Usage: node scripts/validators/validate-deactivated-links.js [--verbose]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const DEACTIVATED_LINKS_PATH = path.join(__dirname, '..', 'config', 'deactivated-links.json');

const REQUIRED_FIELDS = ['sourceSlug', 'targetSlug', 'originalMarkdown', 'plainText', 'contextBefore', 'contextAfter'];

const colors = {
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
};

function validateDeactivatedLinks(verbose = false) {
  if (!fs.existsSync(DEACTIVATED_LINKS_PATH)) {
    console.log(`${colors.yellow}WARN${colors.reset} ${DEACTIVATED_LINKS_PATH} not found — skipping.`);
    return { passed: true, issues: [] };
  }

  let entries;
  try {
    entries = JSON.parse(fs.readFileSync(DEACTIVATED_LINKS_PATH, 'utf-8'));
  } catch (err) {
    console.error(`${colors.red}FAIL${colors.reset} Could not parse deactivated-links.json: ${err.message}`);
    return { passed: false, issues: [{ type: 'parse-error', message: err.message }] };
  }

  if (!Array.isArray(entries)) {
    console.error(`${colors.red}FAIL${colors.reset} deactivated-links.json must be a JSON array, got ${typeof entries}`);
    return { passed: false, issues: [{ type: 'not-array' }] };
  }

  if (entries.length === 0) {
    if (verbose) console.log(`${colors.green}PASS${colors.reset} deactivated-links.json is empty — nothing to validate.`);
    return { passed: true, issues: [] };
  }

  const issues = [];

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      issues.push({ index: i, message: `Entry ${i} is not an object` });
      continue;
    }

    // NOTE: only checks typeof, NOT length. Empty string is valid (link at position 0 in file).
    const missing = REQUIRED_FIELDS.filter(f => typeof entry[f] !== 'string');
    if (missing.length > 0) {
      issues.push({
        index: i,
        sourceSlug: entry.sourceSlug || '(unknown)',
        targetSlug: entry.targetSlug || '(unknown)',
        missing,
      });
    }
  }

  return { passed: issues.length === 0, issues, total: entries.length };
}

async function main() {
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

  console.log(`${colors.blue}${colors.bold}Deactivated-Links Schema Validator${colors.reset}`);

  const { passed, issues, total } = validateDeactivatedLinks(verbose);

  if (passed) {
    const count = total ?? 0;
    console.log(`${colors.green}${colors.bold}PASS${colors.reset} deactivated-links.json: ${count} entr${count === 1 ? 'y' : 'ies'}, all valid.`);
    process.exit(0);
  }

  console.log(`${colors.red}${colors.bold}FAIL${colors.reset} deactivated-links.json has ${issues.length} invalid entr${issues.length === 1 ? 'y' : 'ies'}:\n`);

  for (const issue of issues) {
    if (issue.type === 'parse-error') {
      console.log(`  ${colors.red}Parse error:${colors.reset} ${issue.message}`);
    } else if (issue.type === 'not-array') {
      console.log(`  ${colors.red}Schema error:${colors.reset} root must be a JSON array`);
    } else {
      console.log(`  ${colors.red}Entry ${issue.index}${colors.reset} [${issue.sourceSlug} → ${issue.targetSlug}]`);
      console.log(`    Missing fields: ${colors.yellow}${issue.missing.join(', ')}${colors.reset}`);
      console.log(`    These fields are required to prevent false-positive link restoration.`);
    }
    console.log();
  }

  console.log(`${colors.bold}Why this matters:${colors.reset}`);
  console.log('Without contextBefore/contextAfter, restoreDeactivatedLinks() uses a');
  console.log('first-occurrence string replace which can linkify the wrong sentence.');
  console.log();
  console.log(`${colors.bold}How to fix:${colors.reset}`);
  console.log('1. Re-run the deactivator on the affected source post (it now captures context).');
  console.log('2. Or manually add contextBefore/contextAfter (60 chars around the link).');
  console.log('3. Use ↵ in place of newlines in the context strings.');

  process.exit(1);
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

export { validateDeactivatedLinks };
