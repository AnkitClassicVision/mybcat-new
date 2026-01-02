#!/usr/bin/env node
/**
 * Pre-build WebP Check Script
 * Ensures all images have WebP versions before build
 * Fails the build if missing WebP files are found
 *
 * Run: node scripts/check-missing-webp.js
 *
 * Options:
 *   --fix    Automatically convert missing images (requires sharp)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Parse CLI arguments
const args = process.argv.slice(2);
const AUTO_FIX = args.includes('--fix');

// Image extensions to check
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

// Directories to scan
const SCAN_DIRS = [
  path.join(PUBLIC_DIR, 'images'),
  path.join(PUBLIC_DIR, 'videos'),
];

// Files to skip (e.g., favicons that should remain PNG)
const SKIP_PATTERNS = [
  /favicon/i,
  /apple-touch-icon/i,
  /android-chrome/i,
  /mstile/i,
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
        // Check skip patterns
        const shouldSkip = SKIP_PATTERNS.some(pattern => pattern.test(entry.name));
        if (!shouldSkip) {
          images.push(fullPath);
        }
      }
    }
  }

  return images;
}

/**
 * Convert image to WebP
 */
async function convertToWebP(imagePath, webpPath) {
  const sharp = (await import('sharp')).default;

  await sharp(imagePath)
    .webp({ quality: 80 })
    .toFile(webpPath);
}

/**
 * Main execution
 */
async function main() {
  console.log('');
  console.log('Checking for missing WebP images...');
  console.log('');

  // Find all images
  let allImages = [];
  for (const dir of SCAN_DIRS) {
    const images = findImages(dir);
    allImages = allImages.concat(images);
  }

  // Find missing WebP files
  const missing = [];
  for (const imagePath of allImages) {
    const webpPath = imagePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    if (!fs.existsSync(webpPath)) {
      const stats = fs.statSync(imagePath);
      missing.push({
        path: imagePath,
        webpPath,
        size: stats.size,
        relativePath: path.relative(ROOT_DIR, imagePath)
      });
    }
  }

  if (missing.length === 0) {
    console.log('All images have WebP versions. Build can proceed.');
    return;
  }

  // Sort by size (largest first)
  missing.sort((a, b) => b.size - a.size);

  console.log(`Found ${missing.length} images missing WebP versions:`);
  console.log('');

  for (const img of missing) {
    const sizeMB = (img.size / 1024 / 1024).toFixed(2);
    const sizeKB = (img.size / 1024).toFixed(0);
    const sizeStr = img.size > 1024 * 1024 ? `${sizeMB}MB` : `${sizeKB}KB`;
    console.log(`  - ${img.relativePath} (${sizeStr})`);
  }

  console.log('');

  if (AUTO_FIX) {
    console.log('Auto-fixing: Converting missing images to WebP...');
    console.log('');

    let converted = 0;
    let errors = 0;

    for (const img of missing) {
      try {
        await convertToWebP(img.path, img.webpPath);
        console.log(`  Converted: ${img.relativePath}`);
        converted++;
      } catch (err) {
        console.error(`  ERROR: ${img.relativePath} - ${err.message}`);
        errors++;
      }
    }

    console.log('');
    console.log(`Converted ${converted} images, ${errors} errors`);

    if (errors > 0) {
      process.exit(1);
    }
  } else {
    // Calculate total impact
    const totalSize = missing.reduce((sum, img) => sum + img.size, 0);
    const totalMB = (totalSize / 1024 / 1024).toFixed(2);

    console.log(`Total unoptimized size: ${totalMB}MB`);
    console.log('');
    console.log('To fix this issue, run one of:');
    console.log('  npm run images:check -- --fix    # Auto-convert missing images');
    console.log('  npm run images:optimize          # Run full optimization');
    console.log('');
    console.log('BUILD BLOCKED: Missing WebP images will degrade PageSpeed scores.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
