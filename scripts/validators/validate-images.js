#!/usr/bin/env node

/**
 * Image Reference Validator
 * Validates that referenced local images exist in /public.
 *
 * Checks:
 *  - Blog frontmatter `featuredImage`
 *  - Markdown image syntax `![](/images/...)`
 *  - HTML <img src="/images/..."> and srcset URLs inside blog content
 *
 * Usage:
 *   node scripts/validators/validate-images.js [--verbose] [--file <path>]
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import matter from 'gray-matter';

const PUBLIC_DIR = path.resolve('public');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function stripQueryAndHash(url) {
  if (!url || typeof url !== 'string') return url;
  return url.split('#')[0].split('?')[0];
}

function toPublicPath(rootRelativeUrl) {
  if (!rootRelativeUrl || typeof rootRelativeUrl !== 'string') return null;
  if (!rootRelativeUrl.startsWith('/')) return null;
  if (rootRelativeUrl.startsWith('//')) return null;
  if (rootRelativeUrl.startsWith('/api/')) return null;

  const cleaned = stripQueryAndHash(rootRelativeUrl).replace(/^\/+/, '');
  if (!cleaned) return null;
  return path.join(PUBLIC_DIR, cleaned);
}

function isRemoteUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

function extractMarkdownImageUrls(markdown) {
  const urls = [];
  const regex = /!\[[^\]]*]\(([^)]+)\)/g;
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    const raw = (match[1] || '').trim();
    if (!raw) continue;

    // Support optional title: (url "title") or (url 'title')
    const firstToken = raw.split(/\s+/)[0];
    const unwrapped = firstToken.replace(/^<(.+)>$/, '$1').trim();
    urls.push(unwrapped);
  }
  return urls;
}

function extractHtmlImgUrls(markdownOrHtml) {
  const urls = [];

  // src / data-src attributes on img tags
  const srcRegex = /<img[^>]*\s(?:src|data-src)=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = srcRegex.exec(markdownOrHtml)) !== null) {
    const raw = (match[1] || '').trim();
    if (raw) urls.push(raw);
  }

  // srcset on img tags
  const srcsetRegex = /<img[^>]*\ssrcset=["']([^"']+)["'][^>]*>/gi;
  while ((match = srcsetRegex.exec(markdownOrHtml)) !== null) {
    const raw = (match[1] || '').trim();
    if (!raw) continue;
    const parts = raw.split(',').map(p => p.trim()).filter(Boolean);
    for (const part of parts) {
      const url = part.split(/\s+/)[0];
      if (url) urls.push(url.trim());
    }
  }

  return urls;
}

function validateUrlExists(filePath, url, field) {
  if (!url || typeof url !== 'string') return null;
  if (isRemoteUrl(url)) return null;
  if (!url.startsWith('/images/')) return null;

  const publicPath = toPublicPath(url);
  if (!publicPath) return null;

  if (!fs.existsSync(publicPath)) {
    return {
      file: filePath,
      field,
      severity: 'error',
      message: `Missing image: ${url}`,
      value: publicPath
    };
  }

  return null;
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const fileIndex = args.indexOf('--file');
  const specificFile = fileIndex !== -1 ? args[fileIndex + 1] : null;

  console.log(`${colors.bold}Image Reference Validator${colors.reset}\n`);

  let files;
  if (specificFile) {
    files = [specificFile];
  } else {
    files = await glob(['src/content/blog/**/*.{md,mdx}'], { ignore: ['node_modules/**'] });
  }

  console.log(`Validating ${files.length} files...\n`);

  const issues = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, 'utf-8');
      const { data: frontmatter, content } = matter(raw);

      // Skip drafts
      if (frontmatter.status === 'draft') continue;

      // Frontmatter featured image
      if (typeof frontmatter.featuredImage === 'string') {
        const issue = validateUrlExists(file, frontmatter.featuredImage.trim(), 'featuredImage');
        if (issue) issues.push(issue);
      }

      // Inline images in content
      const markdownUrls = extractMarkdownImageUrls(content);
      for (const url of markdownUrls) {
        const issue = validateUrlExists(file, url, 'content:markdown');
        if (issue) issues.push(issue);
      }

      const htmlUrls = extractHtmlImgUrls(content);
      for (const url of htmlUrls) {
        const issue = validateUrlExists(file, url, 'content:html');
        if (issue) issues.push(issue);
      }
    } catch (err) {
      issues.push({
        file,
        field: 'parse',
        severity: 'error',
        message: `Error parsing file: ${err.message}`
      });
    }
  }

  const errors = issues.filter(i => i.severity === 'error');

  if (issues.length === 0) {
    console.log(`${colors.green}✓ All referenced images exist${colors.reset}`);
    process.exit(0);
  }

  // Group by file
  const byFile = {};
  for (const issue of issues) {
    if (!byFile[issue.file]) byFile[issue.file] = [];
    byFile[issue.file].push(issue);
  }

  for (const [file, fileIssues] of Object.entries(byFile)) {
    console.log(`${colors.bold}${file}${colors.reset}`);
    for (const issue of fileIssues) {
      const icon = '✗';
      console.log(`  ${colors.red}${icon}${colors.reset} [${issue.field}] ${issue.message}`);
      if (verbose && issue.value) {
        console.log(`    ${colors.blue}Path: ${issue.value}${colors.reset}`);
      }
    }
    console.log();
  }

  console.log(`${colors.bold}Summary:${colors.reset}`);
  console.log(`  ${colors.red}Errors: ${errors.length}${colors.reset}`);

  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`${colors.red}Error: ${err.message}${colors.reset}`);
  process.exit(1);
});

