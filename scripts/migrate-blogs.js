#!/usr/bin/env node
/**
 * Blog Migration Script
 * Converts WordPress posts from posts_list.json to Astro markdown files
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const POSTS_JSON = '/mnt/d_drive/repos/mybcat-live/posts_list.json';
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'content', 'blog');

// Category mapping based on content keywords
function determineCategory(title, content) {
  const text = (title + ' ' + content).toLowerCase();

  if (text.includes('virtual assistant') || text.includes('virtual team') || text.includes('remote staff')) {
    return 'Virtual Staffing';
  }
  if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('technology')) {
    return 'Technology';
  }
  if (text.includes('patient') || text.includes('customer service') || text.includes('experience')) {
    return 'Patient Experience';
  }
  if (text.includes('bpo') || text.includes('outsourc')) {
    return 'Outsourcing';
  }
  if (text.includes('call') || text.includes('phone') || text.includes('receptionist') || text.includes('answering')) {
    return 'Call Management';
  }
  if (text.includes('scale') || text.includes('grow') || text.includes('expand')) {
    return 'Practice Growth';
  }
  if (text.includes('cost') || text.includes('revenue') || text.includes('profit') || text.includes('financial')) {
    return 'Practice Finance';
  }
  if (text.includes('compliance') || text.includes('hipaa') || text.includes('security') || text.includes('legal')) {
    return 'Compliance';
  }
  if (text.includes('scheduling') || text.includes('appointment') || text.includes('booking')) {
    return 'Scheduling';
  }
  if (text.includes('insurance') || text.includes('claim') || text.includes('billing')) {
    return 'Insurance & Billing';
  }

  return 'Practice Management';
}

// Generate tags from content
function generateTags(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  const tags = [];

  const tagKeywords = {
    'optometry': ['optometry', 'optometrist', 'eye care', 'eye clinic', 'vision'],
    'virtual-assistant': ['virtual assistant', 'virtual team', 'remote staff', 'va '],
    'patient-care': ['patient care', 'patient experience', 'patient satisfaction'],
    'call-center': ['call center', 'call service', 'answering service', 'phone support'],
    'scheduling': ['scheduling', 'appointment', 'booking'],
    'insurance': ['insurance', 'verification', 'claims'],
    'hipaa': ['hipaa', 'compliance', 'security'],
    'ai': ['artificial intelligence', ' ai ', 'machine learning'],
    'outsourcing': ['outsourcing', 'outsource', 'bpo'],
    'growth': ['growth', 'scale', 'expand', 'scaling'],
    'efficiency': ['efficiency', 'productivity', 'streamline'],
    'staffing': ['staffing', 'hiring', 'training', 'employees'],
    'reception': ['receptionist', 'reception', 'front desk'],
    'management': ['management', 'operations', 'practice management'],
  };

  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      tags.push(tag);
    }
  }

  // Limit to 5 most relevant tags
  return tags.slice(0, 5);
}

// Convert HTML to Markdown
function htmlToMarkdown(html) {
  if (!html) return '';

  let md = html;

  // Remove WordPress-specific classes and attributes
  md = md.replace(/ class="[^"]*"/g, '');
  md = md.replace(/ id="[^"]*"/g, '');

  // Convert headings
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '\n##### $1\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '\n###### $1\n');

  // Convert paragraphs
  md = md.replace(/<p[^>]*>/gi, '\n');
  md = md.replace(/<\/p>/gi, '\n');

  // Convert lists
  md = md.replace(/<ul[^>]*>/gi, '\n');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '\n');
  md = md.replace(/<\/ol>/gi, '\n');
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');

  // Convert links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Convert bold and italic
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');

  // Convert blockquotes
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, '\n> $1\n');

  // Convert line breaks
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Convert images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*\/?>/gi, '![$1]($2)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

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

  // Trim whitespace
  md = md.trim();

  return md;
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

// Create excerpt/description from content
function createDescription(content, maxLength = 160) {
  // Get first paragraph or first 160 chars
  const text = htmlToMarkdown(content)
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;

  // Cut at word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}

// Generate markdown file content
function generateMarkdownFile(post) {
  const title = decodeHtmlEntities(post.title.rendered);
  const content = htmlToMarkdown(post.content.rendered);
  const description = createDescription(post.content.rendered);
  const category = determineCategory(title, content);
  const tags = generateTags(title, content);
  const publishDate = post.date.split('T')[0];

  // Escape quotes in title for YAML
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
canonical: "https://mybcat.com/${post.slug}"
---`;

  return `${frontmatter}

${content}

---

*Need help managing your practice's calls and scheduling? [Book a discovery call](https://meetings.hubspot.com/ankit98/mybcat-discovery-call) to learn how MyBCAT can help.*
`;
}

// Main migration function
async function migrate() {
  console.log('Starting blog migration...\n');

  // Read posts JSON
  const postsData = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8'));
  console.log(`Found ${postsData.length} posts to migrate\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get existing posts to skip
  const existingPosts = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));

  console.log(`Existing posts: ${existingPosts.length}\n`);

  let migrated = 0;
  let skipped = 0;

  for (const post of postsData) {
    const slug = post.slug;

    // Skip if already exists (check both exact and with -2 suffix)
    if (existingPosts.includes(slug) || existingPosts.includes(slug + '-2')) {
      console.log(`Skipping (exists): ${slug}`);
      skipped++;
      continue;
    }

    // Only migrate published posts
    if (post.status !== 'publish') {
      console.log(`Skipping (not published): ${slug}`);
      skipped++;
      continue;
    }

    try {
      const markdown = generateMarkdownFile(post);
      const outputPath = path.join(OUTPUT_DIR, `${slug}.md`);

      fs.writeFileSync(outputPath, markdown, 'utf8');
      console.log(`Migrated: ${slug}`);
      migrated++;
    } catch (error) {
      console.error(`Error migrating ${slug}:`, error.message);
    }
  }

  console.log(`\n--- Migration Complete ---`);
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${postsData.length}`);
}

// Run migration
migrate().catch(console.error);
