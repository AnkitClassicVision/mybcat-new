/**
 * Scheduled Publishing Script
 *
 * This script runs daily via GitHub Actions to publish scheduled posts.
 * It scans all blog posts for scheduledDate matching today's date,
 * and updates their status from 'scheduled' to 'published'.
 *
 * Usage: node scripts/publish-scheduled.js
 */

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const today = new Date().toISOString().split('T')[0]; // "2025-12-18"

console.log(`Checking for posts scheduled for ${today}...`);

// Ensure blog directory exists
if (!fs.existsSync(BLOG_DIR)) {
  console.log('No blog directory found. Nothing to publish.');
  process.exit(0);
}

// Get all markdown files (both .md and .mdx)
const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

if (files.length === 0) {
  console.log('No blog posts found. Nothing to publish.');
  process.exit(0);
}

let publishedCount = 0;

files.forEach(file => {
  const filePath = path.join(BLOG_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: body } = matter(content);

  // Check if this post is scheduled for today
  if (data.status === 'scheduled' && data.scheduledDate) {
    const scheduledDate = new Date(data.scheduledDate).toISOString().split('T')[0];

    if (scheduledDate === today) {
      console.log(`Publishing: ${file}`);

      // Ensure the publishDate reflects the go-live date so sorting and timestamps are correct.
      // Astro content schema uses `z.coerce.date()`, so both ISO strings and YYYY-MM-DD strings are valid.
      try {
        data.publishDate = new Date(data.scheduledDate).toISOString();
      } catch {
        data.publishDate = new Date().toISOString();
      }

      // Update status to published
      data.status = 'published';
      delete data.scheduledDate;

      // Write back to file
      const newContent = matter.stringify(body, data);
      fs.writeFileSync(filePath, newContent);

      publishedCount++;
    }
  }
});

if (publishedCount > 0) {
  console.log(`Successfully published ${publishedCount} post(s).`);
} else {
  console.log('No posts scheduled for today.');
}
