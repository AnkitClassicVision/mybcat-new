#!/usr/bin/env node
/**
 * Image Optimization Script
 * Automatically converts PNG/JPG images to WebP format
 * Run: node scripts/optimize-images.js
 *
 * Options:
 *   --dry-run    Show what would be converted without making changes
 *   --force      Regenerate all WebP files even if they exist
 *   --quality=N  Set WebP quality (default: 80)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Parse CLI arguments
const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE = args.includes('--force');
const qualityArg = args.find(a => a.startsWith('--quality='));
const QUALITY = qualityArg ? parseInt(qualityArg.split('=')[1]) : 80;

// Image extensions to process
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

// Directories to scan
const SCAN_DIRS = [
  path.join(PUBLIC_DIR, 'images'),
  path.join(PUBLIC_DIR, 'videos'), // For video poster images
];

/**
 * Recursively find all image files
 */
function findImages(dir, images = []) {
  if (!fs.existsSync(dir)) return images;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      findImages(fullPath, images);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (IMAGE_EXTENSIONS.includes(ext)) {
        images.push(fullPath);
      }
    }
  }

  return images;
}

/**
 * Check if WebP version exists and is newer than source
 */
function needsConversion(imagePath, webpPath) {
  if (FORCE) return true;
  if (!fs.existsSync(webpPath)) return true;

  const srcStat = fs.statSync(imagePath);
  const webpStat = fs.statSync(webpPath);

  // Regenerate if source is newer
  return srcStat.mtimeMs > webpStat.mtimeMs;
}

/**
 * Convert image to WebP using sharp
 */
async function convertToWebP(imagePath, webpPath) {
  // Dynamic import of sharp (only when needed)
  const sharp = (await import('sharp')).default;

  const stats = fs.statSync(imagePath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

  console.log(`  Converting: ${path.relative(ROOT_DIR, imagePath)} (${sizeMB}MB)`);

  if (DRY_RUN) {
    console.log(`    Would create: ${path.relative(ROOT_DIR, webpPath)}`);
    return { original: stats.size, converted: 0, saved: 0 };
  }

  await sharp(imagePath)
    .webp({ quality: QUALITY })
    .toFile(webpPath);

  const webpStats = fs.statSync(webpPath);
  const savedPercent = ((1 - webpStats.size / stats.size) * 100).toFixed(1);
  const webpSizeMB = (webpStats.size / 1024 / 1024).toFixed(2);

  console.log(`    Created: ${path.relative(ROOT_DIR, webpPath)} (${webpSizeMB}MB, ${savedPercent}% smaller)`);

  return {
    original: stats.size,
    converted: webpStats.size,
    saved: stats.size - webpStats.size
  };
}

/**
 * Main execution
 */
async function main() {
  console.log('');
  console.log('='.repeat(60));
  console.log('  Image Optimization Script');
  console.log('='.repeat(60));
  console.log(`  Mode: ${DRY_RUN ? 'DRY RUN (no changes)' : 'LIVE'}`);
  console.log(`  Quality: ${QUALITY}`);
  console.log(`  Force regenerate: ${FORCE}`);
  console.log('');

  // Find all images
  let allImages = [];
  for (const dir of SCAN_DIRS) {
    const images = findImages(dir);
    allImages = allImages.concat(images);
  }

  console.log(`Found ${allImages.length} source images`);
  console.log('');

  // Filter to images needing conversion
  const toConvert = [];
  for (const imagePath of allImages) {
    const webpPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    if (needsConversion(imagePath, webpPath)) {
      toConvert.push({ imagePath, webpPath });
    }
  }

  if (toConvert.length === 0) {
    console.log('All images already have up-to-date WebP versions!');
    return;
  }

  console.log(`${toConvert.length} images need WebP conversion:`);
  console.log('');

  let totalOriginal = 0;
  let totalConverted = 0;
  let totalSaved = 0;
  let errors = [];

  for (const { imagePath, webpPath } of toConvert) {
    try {
      const result = await convertToWebP(imagePath, webpPath);
      totalOriginal += result.original;
      totalConverted += result.converted;
      totalSaved += result.saved;
    } catch (err) {
      console.error(`  ERROR converting ${imagePath}: ${err.message}`);
      errors.push({ path: imagePath, error: err.message });
    }
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('  Summary');
  console.log('='.repeat(60));
  console.log(`  Images processed: ${toConvert.length - errors.length}`);
  console.log(`  Errors: ${errors.length}`);

  if (!DRY_RUN && totalOriginal > 0) {
    const savedMB = (totalSaved / 1024 / 1024).toFixed(2);
    const savedPercent = ((totalSaved / totalOriginal) * 100).toFixed(1);
    console.log(`  Total space saved: ${savedMB}MB (${savedPercent}%)`);
  }

  console.log('');

  if (errors.length > 0) {
    console.error('Errors encountered:');
    for (const e of errors) {
      console.error(`  - ${e.path}: ${e.error}`);
    }
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
