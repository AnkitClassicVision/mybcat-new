#!/usr/bin/env node

/**
 * Generate responsive WebP variants for blog featured images.
 *
 * Reads /public/images/blog/*.webp, produces width-suffixed siblings
 * (foo-400.webp, foo-800.webp, foo-1200.webp) so blog list templates
 * can emit a real srcset. Idempotent — only generates missing variants.
 * Skips upsampling: if source is 891px wide, we won't generate -1200.
 *
 * Source-of-truth model: frontmatter `featuredImage: "/images/blog/foo.webp"`
 * remains canonical. Variants are deterministic siblings; og:image,
 * schema.org, RSS, sitemap all keep using the canonical URL.
 *
 * Usage:
 *   node scripts/generate-image-variants.js              # generate
 *   node scripts/generate-image-variants.js --dry-run    # report what would run
 *   node scripts/generate-image-variants.js --force      # regenerate even if present
 */

import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_IMAGE_DIR = path.join(__dirname, '..', 'public', 'images', 'blog');
const TARGET_WIDTHS = [400, 800, 1200];
// Only match the exact target widths so canonical images whose names
// legitimately end in years/numbers (foo-2026.webp, starting-an-optometric-practice-101.webp)
// aren't mis-classified as already-generated variants and skipped.
const VARIANT_SUFFIX_RE = new RegExp(`-(?:${TARGET_WIDTHS.join('|')})\\.webp$`);

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');

function isVariant(filename) {
  return VARIANT_SUFFIX_RE.test(filename);
}

async function main() {
  console.log(`${colors.bold}Blog Image Variant Generator${colors.reset}`);
  console.log(`  Source dir: ${BLOG_IMAGE_DIR}`);
  console.log(`  Widths: ${TARGET_WIDTHS.join(', ')}`);
  if (dryRun) console.log(`  Mode: ${colors.yellow}dry-run${colors.reset}`);
  if (force) console.log(`  Mode: ${colors.yellow}force${colors.reset}`);
  console.log();

  if (!fs.existsSync(BLOG_IMAGE_DIR)) {
    console.error(`${colors.red}Source dir not found: ${BLOG_IMAGE_DIR}${colors.reset}`);
    process.exit(1);
  }

  const sources = fs
    .readdirSync(BLOG_IMAGE_DIR)
    .filter(f => f.endsWith('.webp') && !isVariant(f));

  console.log(`Found ${sources.length} source image(s).\n`);

  let generated = 0;
  let skippedExisting = 0;
  let skippedUpsample = 0;
  let totalBytesIn = 0;
  let totalBytesOut = 0;
  const errors = [];

  for (const source of sources) {
    const sourcePath = path.join(BLOG_IMAGE_DIR, source);
    const baseName = source.replace(/\.webp$/, '');

    let meta;
    try {
      meta = await sharp(sourcePath).metadata();
    } catch (err) {
      errors.push({ source, err: err.message });
      continue;
    }

    totalBytesIn += fs.statSync(sourcePath).size;

    for (const width of TARGET_WIDTHS) {
      const outName = `${baseName}-${width}.webp`;
      const outPath = path.join(BLOG_IMAGE_DIR, outName);

      // Skip if source is already smaller than target — upsampling makes
      // images blurry without saving bandwidth.
      if (meta.width < width) {
        skippedUpsample++;
        continue;
      }

      if (!force && fs.existsSync(outPath)) {
        skippedExisting++;
        totalBytesOut += fs.statSync(outPath).size;
        continue;
      }

      if (dryRun) {
        console.log(`  ${colors.yellow}[would generate]${colors.reset} ${outName}`);
        generated++;
        continue;
      }

      try {
        await sharp(sourcePath)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 82, effort: 5 })
          .toFile(outPath);
        const outSize = fs.statSync(outPath).size;
        totalBytesOut += outSize;
        generated++;
        console.log(`  ${colors.green}✓${colors.reset} ${outName} (${(outSize / 1024).toFixed(0)}KB)`);
      } catch (err) {
        errors.push({ source: outName, err: err.message });
      }
    }
  }

  console.log();
  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  ${colors.green}Generated: ${generated}${colors.reset}`);
  console.log(`  ${colors.cyan}Skipped (exists): ${skippedExisting}${colors.reset}`);
  console.log(`  ${colors.cyan}Skipped (would upsample): ${skippedUpsample}${colors.reset}`);
  if (errors.length) {
    console.log(`  ${colors.red}Errors: ${errors.length}${colors.reset}`);
    for (const e of errors) {
      console.log(`    ${colors.red}✗ ${e.source}: ${e.err}${colors.reset}`);
    }
  }
  console.log(`  Source total: ${(totalBytesIn / 1024 / 1024).toFixed(1)}MB`);
  console.log(`  Variant total: ${(totalBytesOut / 1024 / 1024).toFixed(1)}MB`);

  if (errors.length > 0) process.exit(1);
}

main().catch(err => {
  console.error(`${colors.red}Fatal: ${err.message}${colors.reset}`);
  process.exit(1);
});
