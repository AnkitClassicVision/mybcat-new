#!/usr/bin/env node

/**
 * Post Evaluator — Pre-publish quality gate
 *
 * Runs a battery of scenario tests on a blog post before publishing.
 * Designed as an independent evaluator (spec item: "Don't let the same model grade itself").
 *
 * Scenario tests:
 *   1. Citations sanity    — >= 2 live external sources; no dead links; no archive-only sources
 *   2. Topical alignment   — Has valid cluster; maps to approved taxonomy
 *   3. H2 format           — >= 70% H2s are questions (structural excluded)
 *   4. Content quality      — Word count, prose density, internal links, CTA, Sources section
 *   5. Heading hygiene      — No duplicate slugs; TOC present for long posts
 *   6. Compliance basics    — No medical diagnosis claims; no confidential patterns
 *
 * Usage:
 *   node scripts/evaluate-post.js <path-to-post.md>
 *   node scripts/evaluate-post.js --all [--new-only]
 *
 * Exit code: 0 = all pass, 1 = failures found
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';
import { validateFile } from './validators/validate-content-quality.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, 'config', 'content-quality-rules.json');
const TAXONOMY_PATH = path.join(__dirname, 'config', 'topic-taxonomy.json');
const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

/**
 * Compliance patterns to check for medical/legal risk.
 */
const COMPLIANCE_PATTERNS = [
  { pattern: /\b(diagnos(?:e|es|ed|ing))\b.*\b(patient|you)\b/i, label: 'Possible medical diagnosis claim' },
  { pattern: /\b(guaranteed?|100% effective|always works|never fails)\b/i, label: 'Unverifiable absolute claim' },
  { pattern: /\b(SSN|social security|credit card|password)\b/i, label: 'Potentially sensitive data reference' },
  { pattern: /\b(HIPAA violation|violating HIPAA|illegal|lawsuit)\b/i, label: 'Legal risk language — verify context' },
];

function loadConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

function loadTaxonomy() {
  if (!fs.existsSync(TAXONOMY_PATH)) return null;
  return JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf-8'));
}

/**
 * Run all evaluation scenarios on a single post.
 * Returns { scenarios: Array<{ name, pass, details }>, overallPass }.
 */
function evaluatePost(filePath, config, taxonomy) {
  const scenarios = [];
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content: body } = matter(raw);

  // Run the existing validator
  const qualityResult = validateFile(filePath, config, taxonomy);

  // Scenario 1: Content Quality (errors = hard fail)
  scenarios.push({
    name: 'Content Quality',
    pass: qualityResult.errors.length === 0,
    details: qualityResult.errors.length === 0
      ? 'All content quality checks pass'
      : qualityResult.errors.join('; ')
  });

  // Scenario 2: Topical Alignment
  if (taxonomy && taxonomy.clusters) {
    const cluster = data.cluster;
    const normalizedCluster = cluster ? cluster.replace(/^["']|["']$/g, '') : null;
    const isValid = normalizedCluster && taxonomy.clusters[normalizedCluster];
    scenarios.push({
      name: 'Topical Alignment',
      pass: !!isValid,
      details: isValid
        ? `Cluster "${normalizedCluster}" maps to pillar ${taxonomy.clusters[normalizedCluster].pillar}`
        : cluster ? `Cluster "${cluster}" not in approved taxonomy` : 'No cluster in frontmatter'
    });
  }

  // Scenario 3: H2 Format
  const h2Regex = /^## (.+)$/gm;
  const structuralH2s = new Set(['table of contents', 'sources', 'related reading', 'related resources', 'key takeaways', 'next steps', 'common questions', 'frequently asked questions']);
  let h2Total = 0;
  let h2Questions = 0;
  let match;
  while ((match = h2Regex.exec(body)) !== null) {
    const text = match[1].trim();
    if (structuralH2s.has(text.toLowerCase())) continue;
    h2Total++;
    if (text.endsWith('?')) h2Questions++;
  }
  const h2Ratio = h2Total > 0 ? h2Questions / h2Total : 1;
  scenarios.push({
    name: 'H2 Question Format',
    pass: h2Ratio >= 0.70,
    details: `${(h2Ratio * 100).toFixed(0)}% questions (${h2Questions}/${h2Total}). Threshold: 70%`
  });

  // Scenario 4: TOC presence (for long posts)
  const wordCount = body.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount >= 2000) {
    const hasTOC = /^## Table of Contents$/m.test(body);
    scenarios.push({
      name: 'Table of Contents',
      pass: hasTOC,
      details: hasTOC ? `TOC present (${wordCount} words)` : `Missing TOC (${wordCount} words, threshold: 2000)`
    });
  }

  // Scenario 5: Compliance
  const complianceIssues = [];
  const lines = body.split('\n');
  for (let i = 0; i < lines.length; i++) {
    for (const { pattern, label } of COMPLIANCE_PATTERNS) {
      if (pattern.test(lines[i])) {
        complianceIssues.push(`Line ${i + 1}: ${label}`);
      }
    }
  }
  scenarios.push({
    name: 'Compliance',
    pass: complianceIssues.length === 0,
    details: complianceIssues.length === 0
      ? 'No compliance flags detected'
      : complianceIssues.slice(0, 3).join('; ') + (complianceIssues.length > 3 ? `... (+${complianceIssues.length - 3} more)` : '')
  });

  // Scenario 6: Quality Warnings (informational, soft pass)
  if (qualityResult.warnings.length > 0) {
    scenarios.push({
      name: 'Quality Warnings',
      pass: true, // warnings don't block
      details: `${qualityResult.warnings.length} warning(s): ${qualityResult.warnings.slice(0, 2).join('; ')}${qualityResult.warnings.length > 2 ? '...' : ''}`
    });
  }

  const overallPass = scenarios.every(s => s.pass);
  return { scenarios, overallPass };
}

async function main() {
  const args = process.argv.slice(2);
  const isAll = args.includes('--all');
  const newOnly = args.includes('--new-only');

  const config = loadConfig();
  const taxonomy = loadTaxonomy();

  console.log(`${colors.bold}Post Evaluator — Pre-Publish Quality Gate${colors.reset}\n`);

  let files = [];

  if (isAll) {
    const allFiles = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
    const legacyCutoff = config.thresholds.legacyCutoffDate || '2026-01-01';

    for (const file of allFiles) {
      const filePath = path.join(BLOG_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(raw);

      if (data.status !== 'published' && data.status !== 'scheduled') continue;
      if (newOnly && data.publishDate) {
        const pd = new Date(data.publishDate).toISOString().split('T')[0];
        if (pd < legacyCutoff) continue;
      }
      files.push(filePath);
    }
  } else {
    const filePath = args.find(a => !a.startsWith('--'));
    if (!filePath) {
      console.log('Usage: node scripts/evaluate-post.js <path-to-post.md>');
      console.log('       node scripts/evaluate-post.js --all [--new-only]');
      process.exit(1);
    }
    const resolved = path.resolve(filePath);
    if (!fs.existsSync(resolved)) {
      console.error(`${colors.red}File not found: ${resolved}${colors.reset}`);
      process.exit(1);
    }
    files.push(resolved);
  }

  let totalPass = 0;
  let totalFail = 0;

  for (const filePath of files) {
    const slug = path.basename(filePath).replace(/\.(md|mdx)$/, '');
    const result = evaluatePost(filePath, config, taxonomy);

    if (result.overallPass) {
      totalPass++;
      if (!isAll || args.includes('--verbose')) {
        console.log(`${colors.green}PASS${colors.reset} ${slug}`);
        for (const s of result.scenarios) {
          console.log(`  ${colors.green}✓${colors.reset} ${s.name}: ${s.details}`);
        }
        console.log();
      }
    } else {
      totalFail++;
      console.log(`${colors.red}FAIL${colors.reset} ${slug}`);
      for (const s of result.scenarios) {
        const icon = s.pass ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
        console.log(`  ${icon} ${s.name}: ${s.details}`);
      }
      console.log();
    }
  }

  // Summary
  console.log(`${colors.bold}Evaluator Summary:${colors.reset}`);
  console.log(`  ${colors.green}Pass: ${totalPass}${colors.reset}`);
  console.log(`  ${colors.red}Fail: ${totalFail}${colors.reset}`);
  console.log(`  Total: ${files.length}`);

  if (totalFail > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});
