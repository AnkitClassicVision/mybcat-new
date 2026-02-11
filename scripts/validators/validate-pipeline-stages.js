#!/usr/bin/env node

/**
 * Pipeline Stages Validator (Advisory Only)
 * Checks ../blog_writer/blogs/published/evidence/{slug}.json for 17-stage completion.
 * Gracefully skips when evidence directory is missing (CI environment).
 * Never hard-fails — advisory only.
 *
 * Usage: node scripts/validators/validate-pipeline-stages.js [--verbose]
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '..', '..', 'src', 'content', 'blog');
const EVIDENCE_DIR = path.join(__dirname, '..', '..', '..', 'blog_writer', 'blogs', 'published', 'evidence');

const EXPECTED_STAGES = [
  'topic_selection',
  'keyword_research',
  'competitor_analysis',
  'outline_creation',
  'source_gathering',
  'first_draft',
  'fact_checking',
  'seo_optimization',
  'internal_linking',
  'cta_placement',
  'readability_review',
  'plagiarism_check',
  'editorial_review',
  'frontmatter_validation',
  'image_optimization',
  'schema_markup',
  'final_approval'
];

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  console.log(`${colors.bold}Pipeline Stages Validator (Advisory)${colors.reset}\n`);

  if (!fs.existsSync(EVIDENCE_DIR)) {
    console.log(`${colors.yellow}Evidence directory not found: ${EVIDENCE_DIR}${colors.reset}`);
    console.log('Skipping pipeline stage checks (expected in CI).\n');
    process.exit(0);
  }

  if (!fs.existsSync(BLOG_DIR)) {
    console.log('No blog directory found.');
    process.exit(0);
  }

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

  let fullPipeline = 0;
  let partialPipeline = 0;
  let noPipeline = 0;

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);

    // Only check published/scheduled posts
    if (data.status !== 'published' && data.status !== 'scheduled') continue;

    const slug = file.replace(/\.(md|mdx)$/, '');
    const evidencePath = path.join(EVIDENCE_DIR, `${slug}.json`);

    if (!fs.existsSync(evidencePath)) {
      noPipeline++;
      if (verbose) {
        console.log(`${colors.yellow}⚠${colors.reset} ${slug} — no evidence file`);
      }
      continue;
    }

    try {
      const evidence = JSON.parse(fs.readFileSync(evidencePath, 'utf-8'));
      const completedStages = EXPECTED_STAGES.filter(stage => {
        const stageData = evidence[stage] || evidence.stages?.[stage];
        return stageData && stageData.completed;
      });

      if (completedStages.length === EXPECTED_STAGES.length) {
        fullPipeline++;
        if (verbose) {
          console.log(`${colors.green}✓${colors.reset} ${slug} — ${completedStages.length}/${EXPECTED_STAGES.length} stages`);
        }
      } else {
        partialPipeline++;
        const missing = EXPECTED_STAGES.filter(s => !completedStages.includes(s));
        console.log(`${colors.yellow}⚠${colors.reset} ${slug} — ${completedStages.length}/${EXPECTED_STAGES.length} stages`);
        if (verbose) {
          console.log(`  Missing: ${missing.join(', ')}`);
        }
      }
    } catch {
      noPipeline++;
      console.log(`${colors.yellow}⚠${colors.reset} ${slug} — invalid evidence file`);
    }
  }

  // Summary
  console.log(`\n${colors.bold}Summary:${colors.reset}`);
  console.log(`  ${colors.green}Full pipeline: ${fullPipeline}${colors.reset}`);
  console.log(`  ${colors.yellow}Partial pipeline: ${partialPipeline}${colors.reset}`);
  console.log(`  ${colors.yellow}No evidence: ${noPipeline}${colors.reset}`);

  // Advisory only — always exit 0
  process.exit(0);
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(0); // Advisory only
});
