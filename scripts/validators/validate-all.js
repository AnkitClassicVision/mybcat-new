#!/usr/bin/env node

/**
 * Run All Validators
 * Executes all validation scripts in sequence
 *
 * Usage:
 *   node scripts/validators/validate-all.js [--verbose] [--continue-on-error]
 */

import { spawn } from 'child_process';
import path from 'path';

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const VALIDATORS = [
  {
    name: 'Forbidden Terms',
    script: 'validate-terms.js',
    requiresBuild: false
  },
  {
    name: 'Meta Tags',
    script: 'validate-meta.js',
    requiresBuild: false
  },
  {
    name: 'H1 Tags',
    script: 'validate-h1.js',
    requiresBuild: false
  },
  {
    name: 'Enterprise Links',
    script: 'validate-enterprise-links.js',
    requiresBuild: false
  },
  {
    name: 'Schema Markup',
    script: 'validate-schema.js',
    requiresBuild: true
  },
  {
    name: 'Internal Links',
    script: 'validate-links.js',
    requiresBuild: true
  }
];

function runValidator(validator, verbose) {
  return new Promise((resolve) => {
    const args = ['scripts/validators/' + validator.script];
    if (verbose) args.push('--verbose');

    const proc = spawn('node', args, {
      stdio: 'inherit',
      shell: true
    });

    proc.on('close', (code) => {
      resolve({ validator, code });
    });

    proc.on('error', (err) => {
      console.error(`${colors.red}Error running ${validator.name}: ${err.message}${colors.reset}`);
      resolve({ validator, code: 1 });
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const continueOnError = args.includes('--continue-on-error');

  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}  MyBCAT Site Validation Suite${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  const results = [];
  let hasError = false;

  // Separate validators by build requirement
  const preBuildValidators = VALIDATORS.filter(v => !v.requiresBuild);
  const postBuildValidators = VALIDATORS.filter(v => v.requiresBuild);

  // Run pre-build validators
  console.log(`${colors.bold}Pre-Build Validations:${colors.reset}\n`);

  for (const validator of preBuildValidators) {
    console.log(`${colors.blue}▶ Running: ${validator.name}${colors.reset}\n`);
    const result = await runValidator(validator, verbose);
    results.push(result);

    if (result.code !== 0) {
      hasError = true;
      if (!continueOnError) {
        break;
      }
    }
    console.log();
  }

  // Run post-build validators if pre-build passed (or continue-on-error)
  if (!hasError || continueOnError) {
    console.log(`${colors.bold}Post-Build Validations:${colors.reset}`);
    console.log(`${colors.yellow}(Requires 'npm run build' to have run)${colors.reset}\n`);

    for (const validator of postBuildValidators) {
      console.log(`${colors.blue}▶ Running: ${validator.name}${colors.reset}\n`);
      const result = await runValidator(validator, verbose);
      results.push(result);

      if (result.code !== 0) {
        hasError = true;
        if (!continueOnError) {
          break;
        }
      }
      console.log();
    }
  }

  // Summary
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}  Validation Summary${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  for (const result of results) {
    const icon = result.code === 0 ? `${colors.green}✓` : `${colors.red}✗`;
    const status = result.code === 0 ? `${colors.green}PASS` : `${colors.red}FAIL`;
    console.log(`  ${icon} ${result.validator.name}: ${status}${colors.reset}`);
  }

  const passed = results.filter(r => r.code === 0).length;
  const failed = results.filter(r => r.code !== 0).length;

  console.log();
  console.log(`  ${colors.bold}Total: ${passed} passed, ${failed} failed${colors.reset}`);

  if (hasError) {
    console.log(`\n${colors.red}Validation failed. Fix issues before committing.${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}All validations passed!${colors.reset}`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});
