#!/usr/bin/env node
/**
 * WordPress to Astro Blog Sync Script
 * Fetches all posts, images, and content from WordPress API
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const WP_API_BASE = 'https://mybcat.com/wp-json/wp/v2';
const POSTS_PER_PAGE = 100;
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'blog');

// Ensure directories exist
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Helper to fetch JSON from URL with headers
function fetchJsonWithHeaders(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 400) {
          // No more pages
          resolve({ data: [], headers: res.headers, statusCode: 400 });
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${url}`));
          return;
        }
        try {
          resolve({ data: JSON.parse(data), headers: res.headers, statusCode: res.statusCode });
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

// Helper to download file
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) {
      resolve(destPath);
      return;
    }

    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);

    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(destPath);
        downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }

      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`    Downloaded: ${path.basename(destPath)}`);
        resolve(destPath);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

// Get image filename from URL
function getImageFilename(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    // Remove size suffixes like -300x200 from filename
    let filename = path.basename(pathname);
    filename = filename.replace(/-\d+x\d+(?=\.\w+$)/, '');
    return filename;
  } catch {
    return null;
  }
}

// Extract all image URLs from HTML content
function extractImageUrls(html) {
  const urls = new Set();
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    urls.add(match[1]);
  }
  // Also check for background images
  const bgRegex = /url\(['"]?([^'")\s]+)['"]?\)/gi;
  while ((match = bgRegex.exec(html)) !== null) {
    urls.add(match[1]);
  }
  return Array.from(urls);
}

// Convert HTML to Markdown
function htmlToMarkdown(html) {
  if (!html) return '';

  let md = html;

  // Remove WordPress-specific classes and attributes
  md = md.replace(/ class="[^"]*"/g, '');
  md = md.replace(/ id="[^"]*"/g, '');
  md = md.replace(/ style="[^"]*"/g, '');
  md = md.replace(/ data-[^=]*="[^"]*"/g, '');

  // Convert headings
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, '\n##### $1\n');
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, '\n###### $1\n');

  // Convert paragraphs
  md = md.replace(/<p[^>]*>/gi, '\n');
  md = md.replace(/<\/p>/gi, '\n');

  // Convert lists
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');

  // Convert links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Convert bold and italic
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');

  // Convert blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '\n> $1\n');

  // Convert images - update paths to local
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, (match, src, alt) => {
    const filename = getImageFilename(src);
    if (filename && (src.includes('mybcat') || src.includes('wp-content'))) {
      return `![${alt}](/images/blog/${filename})`;
    }
    return `![${alt}](${src})`;
  });
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, (match, src) => {
    const filename = getImageFilename(src);
    if (filename && (src.includes('mybcat') || src.includes('wp-content'))) {
      return `![](/images/blog/${filename})`;
    }
    return `![](${src})`;
  });

  // Convert line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Convert horizontal rules
  md = md.replace(/<hr[^>]*\/?>/gi, '\n---\n');

  // Remove figure tags but keep content
  md = md.replace(/<figure[^>]*>/gi, '');
  md = md.replace(/<\/figure>/gi, '');
  md = md.replace(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi, '*$1*\n');

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  md = md.replace(/&nbsp;/g, ' ');
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#8211;/g, '–');
  md = md.replace(/&#8212;/g, '—');
  md = md.replace(/&#8216;/g, "'");
  md = md.replace(/&#8217;/g, "'");
  md = md.replace(/&#8220;/g, '"');
  md = md.replace(/&#8221;/g, '"');
  md = md.replace(/&#8230;/g, '...');
  md = md.replace(/&hellip;/g, '...');
  md = md.replace(/&rsquo;/g, "'");
  md = md.replace(/&lsquo;/g, "'");
  md = md.replace(/&rdquo;/g, '"');
  md = md.replace(/&ldquo;/g, '"');
  md = md.replace(/&ndash;/g, '–');
  md = md.replace(/&mdash;/g, '—');

  // Clean up excessive newlines
  md = md.replace(/\n{3,}/g, '\n\n');

  return md.trim();
}

// Decode HTML entities in title
function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&hellip;/g, '...');
}

// Create description from excerpt or content
function createDescription(excerpt, content, maxLength = 160) {
  let text = excerpt || content;
  text = text
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  text = decodeHtmlEntities(text);

  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}

// Determine category
function determineCategory(title, content) {
  const text = (title + ' ' + content).toLowerCase();

  if (text.includes('virtual assistant') || text.includes('virtual team') || text.includes('remote staff')) {
    return 'Virtual Staffing';
  }
  if (text.includes('ai') || text.includes('artificial intelligence')) {
    return 'Technology';
  }
  if (text.includes('patient') || text.includes('customer service')) {
    return 'Patient Experience';
  }
  if (text.includes('bpo') || text.includes('outsourc')) {
    return 'Outsourcing';
  }
  if (text.includes('call') || text.includes('phone') || text.includes('receptionist')) {
    return 'Call Management';
  }
  if (text.includes('scale') || text.includes('grow')) {
    return 'Practice Growth';
  }
  if (text.includes('cost') || text.includes('revenue')) {
    return 'Practice Finance';
  }
  if (text.includes('compliance') || text.includes('hipaa')) {
    return 'Compliance';
  }
  if (text.includes('scheduling') || text.includes('appointment')) {
    return 'Scheduling';
  }

  return 'Practice Management';
}

// Generate tags
function generateTags(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  const tags = [];

  const tagKeywords = {
    'optometry': ['optometry', 'optometrist', 'eye care'],
    'virtual-assistant': ['virtual assistant', 'virtual team'],
    'patient-care': ['patient care', 'patient experience'],
    'call-center': ['call center', 'call service'],
    'scheduling': ['scheduling', 'appointment'],
    'outsourcing': ['outsourcing', 'outsource', 'bpo'],
    'growth': ['growth', 'scale', 'expand'],
    'efficiency': ['efficiency', 'productivity'],
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      tags.push(tag);
    }
  }

  return tags.slice(0, 5);
}

// Generate markdown file
function generateMarkdownFile(post, featuredImagePath) {
  const title = decodeHtmlEntities(post.title.rendered);
  const content = htmlToMarkdown(post.content.rendered);
  const description = createDescription(post.excerpt.rendered, post.content.rendered);
  const category = determineCategory(title, content);
  const tags = generateTags(title, content);
  const publishDate = post.date.split('T')[0];

  const safeTitle = title.replace(/"/g, '\\"');
  const safeDescription = description.replace(/"/g, '\\"');

  const frontmatter = `---
title: "${safeTitle}"
description: "${safeDescription}"
publishDate: ${publishDate}
status: "published"
author: "Ankit Patel"
category: "${category}"
tags: ${JSON.stringify(tags)}
${featuredImagePath ? `featuredImage: "${featuredImagePath}"` : ''}
canonical: "https://mybcat.com/${post.slug}"
---`;

  return `${frontmatter}

${content}

---

*Need help managing your practice's calls and scheduling? [Book a discovery call](https://hubspot.mybcat.com/meetings/ankit98/mybcat-discovery-call) to learn how MyBCAT can help.*
`;
}

// Fetch all posts from WordPress
async function fetchAllPosts() {
  console.log('Fetching posts from WordPress API...\n');

  let allPosts = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${WP_API_BASE}/posts?per_page=${POSTS_PER_PAGE}&page=${page}&_embed`;
    console.log(`Fetching page ${page}/${totalPages}...`);

    try {
      const result = await fetchJsonWithHeaders(url);

      if (result.statusCode === 400 || result.data.length === 0) {
        break;
      }

      // Get total pages from header on first request
      if (page === 1 && result.headers['x-wp-totalpages']) {
        totalPages = parseInt(result.headers['x-wp-totalpages'], 10);
        console.log(`Total pages: ${totalPages}`);
      }

      allPosts = allPosts.concat(result.data);
      page++;

    } catch (error) {
      console.error(`Error fetching page ${page}: ${error.message}`);
      break;
    }
  }

  console.log(`\nFetched ${allPosts.length} posts total\n`);
  return allPosts;
}

// Process a single post
async function processPost(post) {
  const slug = post.slug;
  console.log(`\n  Processing: ${slug}`);

  let featuredImagePath = null;

  // Get featured image
  if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
    const media = post._embedded['wp:featuredmedia'][0];
    if (media.source_url) {
      const filename = getImageFilename(media.source_url);
      if (filename) {
        const destPath = path.join(IMAGES_DIR, filename);
        try {
          await downloadFile(media.source_url, destPath);
          featuredImagePath = `/images/blog/${filename}`;
        } catch (error) {
          console.error(`    Failed to download featured image: ${error.message}`);
        }
      }
    }
  }

  // Extract and download inline images
  const imageUrls = extractImageUrls(post.content.rendered);
  for (const imgUrl of imageUrls) {
    if (imgUrl.includes('mybcat') || imgUrl.includes('wp-content')) {
      const filename = getImageFilename(imgUrl);
      if (filename) {
        const destPath = path.join(IMAGES_DIR, filename);
        try {
          await downloadFile(imgUrl, destPath);
        } catch (error) {
          // Silent fail for inline images
        }
      }
    }
  }

  // Generate and write markdown file
  const markdown = generateMarkdownFile(post, featuredImagePath);
  const outputPath = path.join(OUTPUT_DIR, `${slug}.md`);
  fs.writeFileSync(outputPath, markdown, 'utf8');

  return { slug, featuredImage: featuredImagePath, inlineImages: imageUrls.length };
}

// Main sync function
async function sync() {
  console.log('=== WordPress to Astro Blog Sync ===\n');

  try {
    const posts = await fetchAllPosts();

    let processed = 0;
    let withImages = 0;

    for (const post of posts) {
      if (post.status !== 'publish') continue;

      const result = await processPost(post);
      processed++;
      if (result.featuredImage) withImages++;
    }

    console.log('\n=== Sync Complete ===');
    console.log(`Posts processed: ${processed}`);
    console.log(`With featured images: ${withImages}`);

    const images = fs.readdirSync(IMAGES_DIR);
    console.log(`Total images downloaded: ${images.length}`);

  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

sync();
