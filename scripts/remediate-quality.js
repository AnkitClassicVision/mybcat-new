#!/usr/bin/env node

/**
 * Auto-Remediation for Blog Quality Gate Failures
 *
 * Runs BEFORE publish-scheduled.js in CI. Scans scheduled posts due for
 * publishing, validates each against the content quality gate, and applies
 * fixes in two tiers:
 *
 *   1. Deterministic fixes (angle brackets, double-bracket links, CTA, plain-text refs)
 *   2. LLM fixes via Claude API (word count, prose density, internal links, SEO fields)
 *
 * Safety:
 *   - Max 1 LLM attempt per post per run
 *   - Reverts to deterministic-fixed version if LLM output still fails
 *   - Skips gracefully when ANTHROPIC_API_KEY is not set
 *   - Preserves frontmatter exactly (only modifies body via gray-matter)
 *
 * Usage: node scripts/remediate-quality.js
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import matter from 'gray-matter';
import { fileURLToPath, pathToFileURL } from 'url';
import { validateFile } from './validators/validate-content-quality.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const QUALITY_RULES_PATH = path.join(__dirname, 'config', 'content-quality-rules.json');
const CTA_TEMPLATE_PATH = path.join(__dirname, 'config', 'cta-template.html');

const CLAUDE_MODEL = 'claude-sonnet-4-5-20250929';
const CLAUDE_MAX_TOKENS = 16000;
const CLAUDE_TEMPERATURE = 0.3;

// ── Helpers ──────────────────────────────────────────────────────────────

function loadConfig() {
  return JSON.parse(fs.readFileSync(QUALITY_RULES_PATH, 'utf-8'));
}

function loadCTATemplate() {
  return fs.readFileSync(CTA_TEMPLATE_PATH, 'utf-8').trim();
}

/**
 * Build a blog index: { slug, title, url } for all published posts.
 * Used by fixPlainTextReferences and the LLM prompt.
 */
function buildBlogIndex() {
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  const index = [];

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);

    if (data.status !== 'published') continue;

    const slug = file.replace(/\.(md|mdx)$/, '');
    index.push({
      slug,
      title: data.title || slug,
      url: `/blog/${slug}/`,
    });
  }

  return index;
}

// ── Scanning ─────────────────────────────────────────────────────────────

/**
 * Find posts with status=scheduled and scheduledDate <= today.
 */
function scanScheduledPosts() {
  const today = new Date().toISOString().split('T')[0];
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  const posts = [];

  for (const file of files) {
    const filePath = path.join(BLOG_DIR, file);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(raw);

    if (data.status !== 'scheduled' || !data.scheduledDate) continue;

    const sd = new Date(data.scheduledDate).toISOString().split('T')[0];
    if (sd <= today) {
      posts.push({ file, filePath, scheduledDate: sd });
    }
  }

  posts.sort((a, b) => {
    if (a.scheduledDate !== b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
    return a.file.localeCompare(b.file);
  });

  return posts;
}

// ── Validator wrapper ────────────────────────────────────────────────────

/**
 * Run validateFile and return structured results.
 */
function runValidator(filePath, config) {
  return validateFile(filePath, config);
}

// ── Deterministic fixes ──────────────────────────────────────────────────

/**
 * Fix angle bracket comparisons in prose and table cells.
 * <$2M → Under $2M, >85% → 85%+, <10 → fewer than 10, >100 → more than 100
 */
function fixAngleBrackets(content) {
  // Currency: <$X → Under $X
  content = content.replace(/<(\$[\d,.]+[KkMmBb]?)/g, 'Under $1');
  // Currency: >$X → Over $X
  content = content.replace(/>(\$[\d,.]+[KkMmBb]?)/g, 'Over $1');
  // Percentage: <N% → Under N%, >N% → N%+
  content = content.replace(/<(\d+(?:\.\d+)?%)/g, 'Under $1');
  content = content.replace(/>(\d+(?:\.\d+)?%)/g, '$1+');
  // Generic numbers in non-HTML contexts: <N → fewer than N, >N → more than N
  // Only match when preceded by whitespace or start of line (avoid HTML tags)
  content = content.replace(/(^|[\s|])<(\d+(?:,\d+)*(?:\.\d+)?)\b/gm, '$1fewer than $2');
  content = content.replace(/(^|[\s|])>(\d+(?:,\d+)*(?:\.\d+)?)\b/gm, '$1more than $2');

  return content;
}

/**
 * Fix double-bracket link artifacts: [[text](url)](url) → [text](url)
 */
function fixDoubleBracketLinks(content) {
  // Pattern: [[text](url)](url) — the outer brackets and duplicate URL
  return content.replace(/\[(\[[^\]]*\]\([^)]+\))\]\([^)]+\)/g, '$1');
}

/**
 * Convert plain-text references like "See: Post Title" or "Read: Post Title"
 * to proper markdown links using the blog index.
 */
function fixPlainTextReferences(content, blogIndex) {
  for (const entry of blogIndex) {
    // Match patterns: "See: Title", "Read: Title", "Related: Title"
    const escaped = entry.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `((?:See|Read|Related|Check out|Learn more):\\s*)${escaped}(?!\\])`,
      'gi'
    );
    content = content.replace(pattern, `$1[${entry.title}](${entry.url})`);
  }
  return content;
}

/**
 * Append CTA template if no CTA link is found.
 */
function ensureCTA(content, ctaPatterns, ctaTemplate) {
  const lowerContent = content.toLowerCase();
  const hasCTA = ctaPatterns.some(p => lowerContent.includes(p.toLowerCase()));

  if (hasCTA) return content;

  // Insert before ## Sources if it exists, otherwise append at end
  const sourcesIdx = content.indexOf('## Sources');
  if (sourcesIdx !== -1) {
    return (
      content.slice(0, sourcesIdx).trimEnd() +
      '\n\n' +
      ctaTemplate +
      '\n\n' +
      content.slice(sourcesIdx)
    );
  }

  return content.trimEnd() + '\n\n' + ctaTemplate + '\n';
}

// ── LLM remediation ─────────────────────────────────────────────────────

/**
 * Build a targeted LLM prompt based on which quality checks failed.
 */
function buildLLMPrompt(content, frontmatter, failures, blogIndex) {
  const instructions = [];

  for (const failure of failures) {
    if (failure.startsWith('Word count')) {
      instructions.push(
        'WORD COUNT: The post is too short. Expand thin sections with substantive prose. ' +
        'Add real-world examples, data points, or practical guidance. ' +
        'Do NOT add filler or repeat existing points. Target at least 1500 words total.'
      );
    } else if (failure.startsWith('Prose density')) {
      instructions.push(
        'PROSE DENSITY: Too many bullet lists relative to flowing prose. ' +
        'Convert bullet-heavy sections into narrative paragraphs. ' +
        'Keep the same information but present it as connected prose with transitions.'
      );
    } else if (failure.startsWith('Internal links')) {
      const linkList = blogIndex
        .slice(0, 30)
        .map(e => `- [${e.title}](${e.url})`)
        .join('\n');
      instructions.push(
        'INTERNAL LINKS: The post needs at least 5 internal links to other blog posts. ' +
        'Weave relevant links naturally into the prose where the topic connects. ' +
        'Here are available posts to link to:\n' + linkList
      );
    } else if (failure.startsWith('Missing seoTitle')) {
      instructions.push(
        'SEO TITLE: Generate an seoTitle field (max 60 characters) for the frontmatter. ' +
        'Return it as: FRONTMATTER_UPDATE: seoTitle: <value>'
      );
    } else if (failure.startsWith('Missing seoDescription')) {
      instructions.push(
        'SEO DESCRIPTION: Generate an seoDescription field (max 155 characters) for the frontmatter. ' +
        'Return it as: FRONTMATTER_UPDATE: seoDescription: <value>'
      );
    }
    // Skip failures we handle deterministically (CTA, angle brackets, etc.)
  }

  if (instructions.length === 0) return null;

  const prompt = `You are a healthcare content editor. Fix the following blog post to pass quality checks.

RULES:
- Preserve ALL existing content, links, and structure unless explicitly told to change it
- Do NOT add banned phrases: "dive into", "seamless", "leverage", "unlock", "robust", "comprehensive guide", "cutting-edge", "game-changer", "empower", "harness", "revolutionize"
- Do NOT use em dashes (—)
- Do NOT modify the frontmatter block (--- to ---) UNLESS returning FRONTMATTER_UPDATE lines
- Keep the same tone: professional, data-driven healthcare operations content
- Keep all existing ## Sources and citations intact

REQUIRED FIXES:
${instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n\n')}

CURRENT POST FRONTMATTER:
title: ${frontmatter.title || ''}

CURRENT POST BODY:
${content}

Return ONLY the corrected post body (no frontmatter). If you have FRONTMATTER_UPDATE lines, put them at the very end after a blank line.`;

  return prompt;
}

/**
 * Check if the `claude` CLI is available on the system.
 */
function hasClaudeCLI() {
  try {
    execFileSync('claude', ['--version'], { stdio: 'pipe', timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Call Claude via the CLI (uses Claude Code subscription, no API key needed).
 * Falls back to the Anthropic Messages API if CLI is not available.
 */
async function callClaude(prompt) {
  // Strategy 1: Claude CLI (VPS with subscription)
  if (hasClaudeCLI()) {
    console.log(`  Using Claude CLI (subscription)`);
    const promptFile = path.join(__dirname, '..', '.tmp-remediate-prompt.txt');
    try {
      fs.writeFileSync(promptFile, prompt);
      const output = execFileSync('claude', [
        '-p', '--output-format', 'text',
        '--max-turns', '1',
      ], {
        input: prompt,
        stdio: ['pipe', 'pipe', 'pipe'],
        timeout: 120_000,
        maxBuffer: 10 * 1024 * 1024,
      });
      const text = output.toString('utf-8').trim();
      if (!text) throw new Error('Empty response from Claude CLI');
      return text;
    } finally {
      try { fs.unlinkSync(promptFile); } catch { /* ignore */ }
    }
  }

  // Strategy 2: Anthropic Messages API (GitHub Actions with secret)
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  console.log(`  Using Anthropic API`);
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      temperature: CLAUDE_TEMPERATURE,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text;
  if (!text) throw new Error('Empty response from Claude API');

  return text;
}

/**
 * Parse FRONTMATTER_UPDATE lines from LLM output and apply to frontmatter.
 * Returns { body, updatedFields } where body has the update lines stripped.
 */
function parseFrontmatterUpdates(llmOutput, frontmatter) {
  const lines = llmOutput.split('\n');
  const bodyLines = [];
  const updatedFields = {};

  for (const line of lines) {
    const match = line.match(/^FRONTMATTER_UPDATE:\s*(\w+):\s*(.+)$/);
    if (match) {
      updatedFields[match[1]] = match[2].trim();
    } else {
      bodyLines.push(line);
    }
  }

  // Apply updates to frontmatter object
  for (const [key, value] of Object.entries(updatedFields)) {
    frontmatter[key] = value;
  }

  return { body: bodyLines.join('\n').trim(), updatedFields };
}

// ── Orchestrator ─────────────────────────────────────────────────────────

/**
 * Remediate a single post. Returns { status, file, actions }.
 */
async function remediatePost(filePath, config, blogIndex, ctaTemplate) {
  const file = path.basename(filePath);
  const actions = [];

  // Step 1: Initial validation
  const initial = runValidator(filePath, config);
  if (initial.errors.length === 0) {
    return { status: 'clean', file, actions: ['Already passing'] };
  }

  console.log(`  Errors: ${initial.errors.join('; ')}`);

  // Step 2: Apply deterministic fixes
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content: originalBody } = matter(raw);

  let fixedBody = originalBody;

  fixedBody = fixAngleBrackets(fixedBody);
  actions.push('fixAngleBrackets');

  fixedBody = fixDoubleBracketLinks(fixedBody);
  actions.push('fixDoubleBracketLinks');

  fixedBody = fixPlainTextReferences(fixedBody, blogIndex);
  actions.push('fixPlainTextReferences');

  fixedBody = ensureCTA(fixedBody, config.ctaPatterns, ctaTemplate);
  actions.push('ensureCTA');

  // Write deterministic fixes and re-validate
  const deterministicOutput = matter.stringify(fixedBody, frontmatter);
  fs.writeFileSync(filePath, deterministicOutput);

  const afterDeterministic = runValidator(filePath, config);
  if (afterDeterministic.errors.length === 0) {
    console.log(`  Deterministic fixes resolved all errors`);
    return { status: 'fixed-deterministic', file, actions };
  }

  console.log(`  After deterministic fixes: ${afterDeterministic.errors.join('; ')}`);

  // Step 3: LLM remediation (Claude CLI or API)
  if (!hasClaudeCLI() && !process.env.ANTHROPIC_API_KEY) {
    console.log(`  No Claude CLI or ANTHROPIC_API_KEY — skipping LLM remediation`);
    return { status: 'partial', file, actions: [...actions, 'LLM skipped (no CLI or API key)'] };
  }

  const prompt = buildLLMPrompt(fixedBody, frontmatter, afterDeterministic.errors, blogIndex);
  if (!prompt) {
    console.log(`  No LLM-remediable failures remaining`);
    return { status: 'partial', file, actions: [...actions, 'No LLM-fixable errors'] };
  }

  actions.push('callClaude');
  console.log(`  Calling Claude for content fixes...`);

  let llmBody;
  try {
    const llmOutput = await callClaude(prompt);
    if (!llmOutput) {
      return { status: 'partial', file, actions: [...actions, 'LLM returned empty'] };
    }

    const parsed = parseFrontmatterUpdates(llmOutput, frontmatter);
    llmBody = parsed.body;

    if (Object.keys(parsed.updatedFields).length > 0) {
      actions.push(`frontmatter updates: ${Object.keys(parsed.updatedFields).join(', ')}`);
    }
  } catch (err) {
    console.log(`  Claude error: ${err.message}`);
    // Keep deterministic-fixed version
    return { status: 'partial', file, actions: [...actions, `LLM error: ${err.message}`] };
  }

  // Write LLM output and validate
  const llmOutput = matter.stringify(llmBody, frontmatter);
  fs.writeFileSync(filePath, llmOutput);

  const afterLLM = runValidator(filePath, config);
  if (afterLLM.errors.length === 0) {
    console.log(`  LLM fixes resolved all errors`);
    return { status: 'fixed-llm', file, actions };
  }

  // Step 4: LLM output still fails — revert to deterministic-fixed version
  console.log(`  LLM output still fails: ${afterLLM.errors.join('; ')}`);
  console.log(`  Reverting to deterministic-fixed version`);
  fs.writeFileSync(filePath, deterministicOutput);
  actions.push('reverted to deterministic');

  return { status: 'partial', file, actions };
}

// ── Main ─────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Blog Quality Auto-Remediation ===\n');

  if (!fs.existsSync(BLOG_DIR)) {
    console.log('No blog directory found.');
    return;
  }

  const config = loadConfig();
  const ctaTemplate = loadCTATemplate();
  const blogIndex = buildBlogIndex();
  const posts = scanScheduledPosts();

  if (posts.length === 0) {
    console.log('No scheduled posts due for publishing. Nothing to remediate.');
    return;
  }

  console.log(`Found ${posts.length} scheduled post(s) due for publishing.`);
  console.log(`Blog index: ${blogIndex.length} published posts available for linking.\n`);

  if (!hasClaudeCLI() && !process.env.ANTHROPIC_API_KEY) {
    console.log('Warning: No Claude CLI or ANTHROPIC_API_KEY found. LLM remediation will be skipped.\n');
  } else if (hasClaudeCLI()) {
    console.log('Claude CLI detected — will use subscription for LLM remediation.\n');
  }

  const results = [];

  for (const post of posts) {
    console.log(`Remediating: ${post.file}`);
    const result = await remediatePost(post.filePath, config, blogIndex, ctaTemplate);
    results.push(result);
    console.log(`  Result: ${result.status}\n`);
  }

  // Summary
  const clean = results.filter(r => r.status === 'clean').length;
  const fixedDet = results.filter(r => r.status === 'fixed-deterministic').length;
  const fixedLLM = results.filter(r => r.status === 'fixed-llm').length;
  const partial = results.filter(r => r.status === 'partial').length;

  console.log('=== Remediation Summary ===');
  console.log(`  Already passing: ${clean}`);
  console.log(`  Fixed (deterministic): ${fixedDet}`);
  console.log(`  Fixed (LLM): ${fixedLLM}`);
  console.log(`  Partially fixed / skipped: ${partial}`);
  console.log(`  Total: ${results.length}`);

  if (partial > 0) {
    console.log('\nPosts still failing quality gate (will be skipped by publish-scheduled.js):');
    for (const r of results.filter(r => r.status === 'partial')) {
      console.log(`  - ${r.file}: ${r.actions.join(' → ')}`);
    }
  }
}

// Only run main() when invoked directly
const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  main().catch(err => {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  });
}

export { remediatePost, scanScheduledPosts, fixAngleBrackets, fixDoubleBracketLinks, fixPlainTextReferences, ensureCTA, buildLLMPrompt };
