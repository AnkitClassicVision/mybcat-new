/**
 * WordPress Content Export Script
 *
 * Exports all published posts from WordPress REST API to Markdown files.
 * Also downloads featured images.
 *
 * Usage: node scripts/export-wordpress.js
 *
 * Requirements:
 * - Node.js 18+
 * - Access to WordPress REST API (https://mybcat.com/wp-json/wp/v2/posts)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WP_API_BASE = 'https://mybcat.com/wp-json/wp/v2';
const BLOG_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'blog');

// Ensure directories exist
if (!fs.existsSync(BLOG_DIR)) {
  fs.mkdirSync(BLOG_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

/**
 * Fetch JSON from URL
 */
async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Download file from URL
 */
async function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    protocol.get(url, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(destPath);
      reject(err);
    });
  });
}

/**
 * Convert HTML to Markdown (basic conversion)
 */
function htmlToMarkdown(html) {
  if (!html) return '';

  let md = html
    // Remove WordPress specific stuff
    .replace(/<!-- wp:.*?-->/g, '')
    .replace(/<!-- \/wp:.*?-->/g, '')
    // Headings
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    // Bold and italic
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    // Images
    .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
    .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
    // Lists
    .replace(/<ul[^>]*>/gi, '\n')
    .replace(/<\/ul>/gi, '\n')
    .replace(/<ol[^>]*>/gi, '\n')
    .replace(/<\/ol>/gi, '\n')
    .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
    // Paragraphs
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    // Line breaks
    .replace(/<br\s*\/?>/gi, '\n')
    // Blockquotes
    .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n\n')
    // Code
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gis, '```\n$1\n```\n\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    // Clean up whitespace
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return md;
}

/**
 * Generate slug from title
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Main export function
 */
async function exportPosts() {
  console.log('Fetching posts from WordPress...');

  try {
    // Fetch all published posts with embedded media
    const posts = await fetchJson(`${WP_API_BASE}/posts?per_page=100&status=publish&_embed`);

    console.log(`Found ${posts.length} posts to export.`);

    const inventory = [];

    for (const post of posts) {
      const slug = post.slug || generateSlug(post.title.rendered);
      const title = post.title.rendered.replace(/&amp;/g, '&').replace(/&#8217;/g, "'");
      const content = htmlToMarkdown(post.content.rendered);
      const excerpt = htmlToMarkdown(post.excerpt.rendered).replace(/\n/g, ' ').slice(0, 160);
      const publishDate = post.date.split('T')[0];

      // Get featured image
      let featuredImage = '';
      let imageCount = 0;
      if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        const imageUrl = media.source_url;
        const imageExt = path.extname(imageUrl.split('?')[0]) || '.jpg';
        const localImagePath = `/images/blog/${slug}${imageExt}`;
        featuredImage = localImagePath;

        // Download image
        const destPath = path.join(IMAGES_DIR, `${slug}${imageExt}`);
        try {
          console.log(`  Downloading image for: ${slug}`);
          await downloadFile(imageUrl, destPath);
          imageCount = 1;
        } catch (err) {
          console.error(`  Failed to download image for ${slug}:`, err.message);
        }
      }

      // Get categories
      let category = 'Uncategorized';
      if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0]) {
        const categories = post._embedded['wp:term'][0];
        if (categories.length > 0) {
          category = categories[0].name;
        }
      }

      // Get tags
      let tags = [];
      if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][1]) {
        tags = post._embedded['wp:term'][1].map(t => t.name);
      }

      // Get author
      let author = 'Ankit Patel';
      if (post._embedded && post._embedded.author && post._embedded.author[0]) {
        author = post._embedded.author[0].name;
      }

      // Build frontmatter
      const frontmatter = {
        title,
        description: excerpt || `${title} - Learn more about ${category.toLowerCase()} from My Business Care Team.`,
        publishDate: new Date(publishDate),
        status: 'published',
        author,
        category,
        tags,
        featuredImage: featuredImage || undefined,
        relatedPosts: [],
      };

      // Build markdown content
      const yamlFrontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${(excerpt || '').replace(/"/g, '\\"')}"
publishDate: ${publishDate}
status: "published"
author: "${author}"
category: "${category}"
tags: [${tags.map(t => `"${t}"`).join(', ')}]
${featuredImage ? `featuredImage: "${featuredImage}"` : '# featuredImage: ""'}
relatedPosts: []
---

`;

      const fullContent = yamlFrontmatter + content;

      // Write file
      const filePath = path.join(BLOG_DIR, `${slug}.md`);
      fs.writeFileSync(filePath, fullContent);
      console.log(`Exported: ${slug}.md`);

      // Add to inventory
      inventory.push({
        slug,
        title,
        date: publishDate,
        images: imageCount,
        status: 'Exported',
      });
    }

    // Write inventory
    const inventoryPath = path.join(__dirname, 'export-inventory.md');
    let inventoryContent = `# WordPress Export Inventory\n\nExported on: ${new Date().toISOString()}\n\n`;
    inventoryContent += `| Slug | Title | Date | Images | Status |\n`;
    inventoryContent += `|------|-------|------|--------|--------|\n`;
    for (const item of inventory) {
      inventoryContent += `| ${item.slug} | ${item.title.slice(0, 40)}${item.title.length > 40 ? '...' : ''} | ${item.date} | ${item.images} | ${item.status} |\n`;
    }
    fs.writeFileSync(inventoryPath, inventoryContent);

    console.log(`\nExport complete! ${posts.length} posts exported.`);
    console.log(`Inventory saved to: scripts/export-inventory.md`);

  } catch (error) {
    console.error('Export failed:', error.message);
    process.exit(1);
  }
}

// Run export
exportPosts();
