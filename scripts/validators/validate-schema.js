#!/usr/bin/env node

/**
 * Schema Markup Validator
 * Validates JSON-LD schemas against enterprise B2B positioning rules
 *
 * Usage:
 *   node scripts/validators/validate-schema.js [--verbose]
 *
 * Note: Requires built site (npm run build first)
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const DIST_DIR = './dist';
const CONFIG_PATH = './scripts/config/schema-rules.json';

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

function extractSchemas(html) {
  const schemas = [];
  const regex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    try {
      const schema = JSON.parse(match[1]);
      schemas.push(schema);
    } catch (err) {
      schemas.push({ _parseError: err.message, _raw: match[1] });
    }
  }

  return schemas;
}

function getSchemaTypes(schema) {
  const types = [];

  if (schema['@type']) {
    if (Array.isArray(schema['@type'])) {
      types.push(...schema['@type']);
    } else {
      types.push(schema['@type']);
    }
  }

  // Check for @graph
  if (schema['@graph'] && Array.isArray(schema['@graph'])) {
    for (const item of schema['@graph']) {
      types.push(...getSchemaTypes(item));
    }
  }

  return types;
}

function validateSchema(schema, filePath, config) {
  const issues = [];
  const types = getSchemaTypes(schema);

  // Check for parse errors
  if (schema._parseError) {
    issues.push({
      file: filePath,
      severity: 'error',
      message: `Invalid JSON-LD: ${schema._parseError}`
    });
    return issues;
  }

  // Check for forbidden types
  for (const type of types) {
    if (config.forbidden[type]) {
      issues.push({
        file: filePath,
        severity: config.forbidden[type].severity,
        message: `Forbidden schema type: ${type} - ${config.forbidden[type].reason}`,
        type
      });
    }
  }

  // Validate required properties for allowed types
  for (const type of types) {
    if (config.allowed[type]) {
      const required = config.allowed[type].properties || [];
      for (const prop of required) {
        if (!schema[prop] && !hasPropertyInGraph(schema, type, prop)) {
          issues.push({
            file: filePath,
            severity: 'warning',
            message: `Schema ${type} missing recommended property: ${prop}`,
            type
          });
        }
      }
    }
  }

  // Validate URL format
  if (config.validation.requireAbsoluteUrls) {
    const urls = extractUrls(schema);
    for (const url of urls) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        issues.push({
          file: filePath,
          severity: 'warning',
          message: `Schema contains relative URL: ${url}`
        });
      }
    }
  }

  if (config.validation.requireHttps) {
    const urls = extractUrls(schema);
    for (const url of urls) {
      if (url.startsWith('http://') && !url.includes('localhost')) {
        issues.push({
          file: filePath,
          severity: 'error',
          message: `Schema contains non-HTTPS URL: ${url}`
        });
      }
    }
  }

  return issues;
}

function hasPropertyInGraph(schema, type, prop) {
  if (schema['@graph']) {
    for (const item of schema['@graph']) {
      if (item['@type'] === type && item[prop]) {
        return true;
      }
    }
  }
  return false;
}

function extractUrls(obj) {
  const urls = [];

  function traverse(value) {
    if (typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/'))) {
      urls.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(traverse);
    } else if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach(traverse);
    }
  }

  traverse(obj);
  return urls;
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  console.log(`${colors.bold}Schema Markup Validator${colors.reset}\n`);

  // Check if dist exists
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`${colors.red}Error: ${DIST_DIR} not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }

  const config = loadConfig();
  let allIssues = [];

  // Scan all HTML files
  const htmlFiles = await glob([`${DIST_DIR}/**/*.html`]);
  console.log(`Scanning ${htmlFiles.length} HTML files...\n`);

  let pagesWithSchema = 0;
  let totalSchemas = 0;

  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf-8');
    const schemas = extractSchemas(html);

    if (schemas.length > 0) {
      pagesWithSchema++;
      totalSchemas += schemas.length;

      for (const schema of schemas) {
        const issues = validateSchema(schema, file, config);
        allIssues = allIssues.concat(issues);
      }

      if (verbose && schemas.length > 0) {
        const types = schemas.flatMap(s => getSchemaTypes(s));
        console.log(`${colors.blue}[INFO]${colors.reset} ${file}: ${types.join(', ')}`);
      }
    }
  }

  // Report results
  const errors = allIssues.filter(i => i.severity === 'error');
  const warnings = allIssues.filter(i => i.severity === 'warning');

  console.log();

  if (allIssues.length === 0) {
    console.log(`${colors.green}✓ All schemas valid${colors.reset}`);
    console.log(`  Pages with schema: ${pagesWithSchema}`);
    console.log(`  Total schemas: ${totalSchemas}`);
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
      console.log(`  ${color}${icon}${colors.reset} ${issue.message}`);
    }
    console.log();
  }

  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  ${colors.red}Errors: ${errors.length}${colors.reset}`);
  console.log(`  ${colors.yellow}Warnings: ${warnings.length}${colors.reset}`);
  console.log(`  Pages with schema: ${pagesWithSchema}`);
  console.log(`  Total schemas: ${totalSchemas}`);

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});
