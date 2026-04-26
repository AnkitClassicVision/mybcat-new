#!/usr/bin/env node

/**
 * Content Quality Validator
 * Checks published/scheduled posts against quality thresholds.
 *
 * Hard-fail (error): word count, prose density, missing SEO fields,
 *   no Sources section, few citations, no CTA, few internal links.
 * Soft-fail (warning): em dashes, AI banned phrases.
 *
 * Flags:
 *   --scheduled-only        Only check posts with status=scheduled and scheduledDate<=today
 *   --new-only              Skip posts published before legacyCutoffDate (avoids legacy noise)
 *   --changed-files-only    Only check blog files in `git diff origin/main...HEAD` (PR-scoped)
 *   --verbose / -v          Show passing files too
 *
 * Exports validateFile() for programmatic use.
 *
 * Usage: node scripts/validators/validate-content-quality.js [flags]
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import matter from 'gray-matter';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'content-quality-rules.json');
const TAXONOMY_PATH = path.join(__dirname, '..', 'config', 'topic-taxonomy.json');
const BLOG_DIR = path.join(__dirname, '..', '..', 'src', 'content', 'blog');

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

function loadTaxonomy() {
  if (!fs.existsSync(TAXONOMY_PATH)) return null;
  return JSON.parse(fs.readFileSync(TAXONOMY_PATH, 'utf-8'));
}

/**
 * Classify a non-empty line as heading, bullet, code-fence, blockquote, or prose.
 */
function classifyLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return 'empty';
  if (trimmed.startsWith('#')) return 'heading';
  if (/^[-*]\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) return 'bullet';
  if (trimmed.startsWith('```')) return 'code-fence';
  if (trimmed.startsWith('>')) return 'blockquote';
  return 'prose';
}

/**
 * Calculate paragraph prose density.
 * Ratio = prose / (prose + bullet + heading). Code fences excluded from denominator.
 */
function calculateProseDensity(body) {
  const lines = body.split('\n');
  let prose = 0;
  let bullet = 0;
  let heading = 0;
  let inCodeFence = false;
  let inTOC = false;

  for (const line of lines) {
    const type = classifyLine(line);

    if (type === 'code-fence') {
      inCodeFence = !inCodeFence;
      continue;
    }
    if (inCodeFence) continue;

    // Skip Table of Contents / What You'll Learn section (navigational, not content)
    if (type === 'heading' && /^##\s+(table of contents|what you'll learn)/i.test(line.trim())) {
      inTOC = true;
      continue;
    }
    if (inTOC && type === 'heading') {
      inTOC = false; // next heading ends TOC section
    }
    if (inTOC) continue;

    if (type === 'empty' || type === 'blockquote') continue;

    if (type === 'prose') prose++;
    else if (type === 'bullet') bullet++;
    else if (type === 'heading') heading++;
  }

  const denominator = prose + bullet + heading;
  if (denominator === 0) return 0;
  return prose / denominator;
}

/**
 * Count words in markdown body (excluding frontmatter, HTML tags, code fences).
 */
function countWords(body) {
  let text = body;
  // Remove code fences
  text = text.replace(/```[\s\S]*?```/g, '');
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Remove markdown image/link syntax cruft but keep text
  text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
  text = text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  // Count words
  const words = text.split(/\s+/).filter(w => w.length > 0);
  return words.length;
}

/**
 * Count external citations (links to external domains, not mybcat.com or relative).
 */
function countExternalCitations(body) {
  const linkRegex = /\[[^\]]*\]\((https?:\/\/[^)]+)\)/g;
  let count = 0;
  let match;
  while ((match = linkRegex.exec(body)) !== null) {
    const url = match[1];
    if (!url.includes('mybcat.com') && !url.includes('hubspot.com')) {
      count++;
    }
  }
  return count;
}

/**
 * Count internal links (/blog/..., /solutions/..., /contact/, etc.)
 */
function countInternalLinks(body) {
  const mdLinks = /\[[^\]]*\]\(\/[^)]+\)/g;
  const hrefLinks = /href=["']\/[^"']+["']/gi;
  const mdMatches = body.match(mdLinks) || [];
  const hrefMatches = body.match(hrefLinks) || [];
  return mdMatches.length + hrefMatches.length;
}

/**
 * Check if body contains a CTA link.
 */
function hasCTA(body, ctaPatterns) {
  const lowerBody = body.toLowerCase();
  return ctaPatterns.some(pattern => lowerBody.includes(pattern.toLowerCase()));
}

/**
 * Find banned phrases in body text.
 */
function findBannedPhrases(body, phrases) {
  // Strip URLs from markdown links so we only check visible text
  const textOnly = body.replace(/\]\([^)]*\)/g, ']()')
  const lowerBody = textOnly.toLowerCase();
  const found = [];
  for (const phrase of phrases) {
    if (lowerBody.includes(phrase.toLowerCase())) {
      found.push(phrase);
    }
  }
  return found;
}

/**
 * Count em dashes in body.
 */
function countEmDashes(body, emDashChar) {
  return (body.split(emDashChar).length - 1);
}

/**
 * Structural H2 headings that should not count toward question ratio.
 */
const STRUCTURAL_H2S = new Set([
  'table of contents',
  'sources',
  'related reading',
  'related resources',
  'key takeaways',
  'next steps',
  'common questions',
  'frequently asked questions',
]);

/**
 * Check H2 question ratio (excluding structural headings).
 * Returns { total, questions, ratio, nonQuestionH2s }.
 */
function checkH2QuestionRatio(body) {
  const h2Regex = /^## (.+)$/gm;
  let total = 0;
  let questions = 0;
  const nonQuestionH2s = [];
  let match;

  while ((match = h2Regex.exec(body)) !== null) {
    const text = match[1].trim();
    const lower = text.toLowerCase();

    // Skip structural headings
    if (STRUCTURAL_H2S.has(lower)) continue;

    total++;
    if (text.endsWith('?')) {
      questions++;
    } else {
      nonQuestionH2s.push(text);
    }
  }

  const ratio = total > 0 ? questions / total : 1;
  return { total, questions, ratio, nonQuestionH2s };
}

/**
 * Check if TOC exists for posts that need one (>= threshold words).
 * Returns { hasTOC, wordCount, needsTOC }.
 */
function checkTOC(body, wordCount, threshold) {
  const needsTOC = wordCount >= threshold;
  const hasTOC = /^## (Table of Contents|What You'll Learn)$/m.test(body);
  return { hasTOC, wordCount, needsTOC };
}

/**
 * Slugify a heading text (matching common markdown renderers).
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Check for duplicate heading slugs within a post.
 * Returns array of { slug, headings } for duplicates.
 */
function checkDuplicateSlugs(body) {
  const headingRegex = /^(#{2,3}) (.+)$/gm;
  const slugMap = new Map();
  let match;

  while ((match = headingRegex.exec(body)) !== null) {
    const text = match[2].trim();
    const slug = slugify(text);
    if (!slugMap.has(slug)) {
      slugMap.set(slug, []);
    }
    slugMap.get(slug).push(text);
  }

  const duplicates = [];
  for (const [slug, headings] of slugMap) {
    if (headings.length > 1) {
      duplicates.push({ slug, headings });
    }
  }
  return duplicates;
}

/**
 * Validate a single file. Returns { errors: string[], warnings: string[] }.
 * @param {string} filePath
 * @param {object} config
 * @param {object} [taxonomy] - Optional topic taxonomy for cluster validation
 */
export function validateFile(filePath, config, taxonomy) {
  const errors = [];
  const warnings = [];

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content: body } = matter(raw);

  // Word count
  const wordCount = countWords(body);
  if (wordCount < config.thresholds.minWordCount) {
    errors.push(`Word count ${wordCount} < ${config.thresholds.minWordCount}`);
  }

  // Prose density
  const density = calculateProseDensity(body);
  if (density < config.thresholds.minProseDensity) {
    errors.push(`Prose density ${(density * 100).toFixed(0)}% < ${(config.thresholds.minProseDensity * 100).toFixed(0)}%`);
  }

  // SEO fields
  if (!data.seoTitle) errors.push('Missing seoTitle');
  if (!data.seoDescription) errors.push('Missing seoDescription');

  // Sources section
  if (!body.includes(config.requiredSections.sources)) {
    errors.push(`No "${config.requiredSections.sources}" section`);
  }

  // External citations
  const citations = countExternalCitations(body);
  if (citations < config.thresholds.minExternalCitations) {
    errors.push(`External citations ${citations} < ${config.thresholds.minExternalCitations}`);
  }

  // CTA link
  if (!hasCTA(body, config.ctaPatterns)) {
    errors.push('No CTA link (hubspot meeting or /contact/)');
  }

  // Internal links
  const internalLinks = countInternalLinks(body);
  if (internalLinks < config.thresholds.minInternalLinks) {
    errors.push(`Internal links ${internalLinks} < ${config.thresholds.minInternalLinks}`);
  }

  // Topic cluster validation (soft-fail)
  if (taxonomy && taxonomy.clusters) {
    const cluster = data.cluster;
    if (!cluster) {
      warnings.push('No "cluster" in frontmatter (required for topical authority)');
    } else {
      const normalizedCluster = cluster.replace(/^["']|["']$/g, '');
      if (!taxonomy.clusters[normalizedCluster]) {
        warnings.push(`Cluster "${normalizedCluster}" not in approved taxonomy. Valid: ${Object.keys(taxonomy.clusters).join(', ')}`);
      }
    }
  }

  // TOC check (soft-fail for now — warns when >= threshold words and no TOC)
  const tocThreshold = config.thresholds.minWordCountForTOC || 2000;
  const tocResult = checkTOC(body, wordCount, tocThreshold);
  if (tocResult.needsTOC && !tocResult.hasTOC) {
    warnings.push(`Post has ${wordCount} words but no "## Table of Contents" (required at >= ${tocThreshold})`);
  }

  // H2 question ratio (soft-fail — warns when below threshold)
  const h2Threshold = config.thresholds.minH2QuestionRatio || 0.70;
  const h2Result = checkH2QuestionRatio(body);
  if (h2Result.total > 0 && h2Result.ratio < h2Threshold) {
    warnings.push(`H2 question ratio ${(h2Result.ratio * 100).toFixed(0)}% < ${(h2Threshold * 100).toFixed(0)}% (${h2Result.questions}/${h2Result.total} are questions). Non-question H2s: ${h2Result.nonQuestionH2s.slice(0, 3).join('; ')}${h2Result.nonQuestionH2s.length > 3 ? '...' : ''}`);
  }

  // Duplicate heading slugs (soft-fail)
  const duplicateSlugs = checkDuplicateSlugs(body);
  if (duplicateSlugs.length > 0) {
    const slugList = duplicateSlugs.map(d => `"${d.slug}" (${d.headings.length}x)`).join(', ');
    warnings.push(`Duplicate heading slugs: ${slugList}`);
  }

  // Banned phrases (soft-fail)
  const banned = findBannedPhrases(body, config.bannedPhrases.softFail);
  if (banned.length > 0) {
    warnings.push(`AI banned phrases: ${banned.join(', ')}`);
  }

  // Em dashes (soft-fail)
  if (config.punctuation.warnOnEmDash) {
    const emDashCount = countEmDashes(body, config.punctuation.emDashChar);
    if (emDashCount > 0) {
      warnings.push(`Em dashes (${config.punctuation.emDashChar}): ${emDashCount} found`);
    }
  }

  return { errors, warnings };
}

/**
 * Resolve the set of blog files changed vs origin/main. Returns a Set of
 * basenames (e.g. "foo.md") or null if git lookup fails / not in a repo.
 * Caller treats null as "no filter; check everything".
 */
function getChangedBlogFiles() {
  try {
    const out = execSync('git diff --name-only origin/main...HEAD', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const blogPrefix = 'src/content/blog/';
    const changed = out
      .split('\n')
      .filter(line => line.startsWith(blogPrefix))
      .map(line => path.basename(line));
    return new Set(changed);
  } catch (err) {
    console.error(`${colors.yellow}WARN: --changed-files-only could not resolve git diff (${err.message.split('\n')[0]}); checking all files${colors.reset}`);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const scheduledOnly = args.includes('--scheduled-only');
  const newOnly = args.includes('--new-only');
  const changedFilesOnly = args.includes('--changed-files-only');

  console.log(`${colors.bold}Content Quality Validator${colors.reset}\n`);

  const config = loadConfig();
  const taxonomy = loadTaxonomy();

  if (!fs.existsSync(BLOG_DIR)) {
    console.log('No blog directory found.');
    process.exit(0);
  }

  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  const today = new Date().toISOString().split('T')[0];
  const legacyCutoff = config.thresholds.legacyCutoffDate;

  const changedFiles = changedFilesOnly ? getChangedBlogFiles() : null;
  if (changedFiles) {
    console.log(`Scoped to ${changedFiles.size} blog file(s) changed vs origin/main\n`);
  }

  let errorCount = 0;
  let warningCount = 0;
  let checkedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    // --changed-files-only: skip files not in this PR's diff
    if (changedFiles && !changedFiles.has(file)) {
      skippedCount++;
      continue;
    }

    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);

    // Filter: only published or scheduled
    if (data.status !== 'published' && data.status !== 'scheduled') {
      skippedCount++;
      continue;
    }

    // --scheduled-only: only check scheduled posts with scheduledDate <= today
    if (scheduledOnly) {
      if (data.status !== 'scheduled') {
        skippedCount++;
        continue;
      }
      if (data.scheduledDate) {
        const sd = new Date(data.scheduledDate).toISOString().split('T')[0];
        if (sd > today) {
          skippedCount++;
          continue;
        }
      }
    }

    // --new-only: skip posts published before legacy cutoff
    if (newOnly && data.publishDate) {
      const pd = new Date(data.publishDate).toISOString().split('T')[0];
      if (pd < legacyCutoff) {
        skippedCount++;
        continue;
      }
    }

    checkedCount++;
    const result = validateFile(filePath, config, taxonomy);

    if (result.errors.length > 0 || result.warnings.length > 0) {
      const slug = file.replace(/\.(md|mdx)$/, '');
      if (result.errors.length > 0) {
        errorCount += result.errors.length;
        console.log(`${colors.red}✗${colors.reset} ${slug}`);
        for (const err of result.errors) {
          console.log(`  ${colors.red}ERROR: ${err}${colors.reset}`);
        }
      }
      if (result.warnings.length > 0) {
        warningCount += result.warnings.length;
        if (result.errors.length === 0) {
          console.log(`${colors.yellow}⚠${colors.reset} ${slug}`);
        }
        for (const warn of result.warnings) {
          console.log(`  ${colors.yellow}WARN: ${warn}${colors.reset}`);
        }
      }
      console.log();
    } else if (verbose) {
      const slug = file.replace(/\.(md|mdx)$/, '');
      console.log(`${colors.green}✓${colors.reset} ${slug}`);
    }
  }

  // Summary
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  Checked: ${checkedCount} | Skipped: ${skippedCount}`);
  console.log(`  ${colors.red}Errors: ${errorCount}${colors.reset}`);
  console.log(`  ${colors.yellow}Warnings: ${warningCount}${colors.reset}`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

// Only run main() when invoked directly (not when imported by publish-scheduled.js)
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  main().catch(err => {
    console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
    process.exit(1);
  });
}
