import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/static';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import rehypeExternalLinks from 'rehype-external-links';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { execSync } from 'child_process';
import rehypeA11y from './scripts/rehype-a11y.js';

// Get non-published blog post slugs at build time
function getNonPublishedSlugs() {
  const blogDir = path.join(process.cwd(), 'src/content/blog');
  if (!fs.existsSync(blogDir)) return [];

  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  const slugs = [];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
    const { data } = matter(content);
    if (data.status !== 'published' || data.redirectTo) {
      slugs.push(file.replace(/\.(md|mdx)$/, ''));
    }
  });

  return slugs;
}

// Build a map of blog URLs to their publish dates for sitemap lastmod
function getBlogLastModDates() {
  const blogDir = path.join(process.cwd(), 'src/content/blog');
  if (!fs.existsSync(blogDir)) return {};

  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  const dateMap = {};

  files.forEach(file => {
    const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
    const { data } = matter(content);
    if (data.status === 'published' && data.publishDate) {
      const slug = file.replace(/\.(md|mdx)$/, '');
      const url = `https://mybcat.com/blog/${slug}/`;
      // Use modifiedDate if available, otherwise fall back to publishDate
      const bestDate = data.modifiedDate || data.publishDate;
      dateMap[url] = new Date(bestDate).toISOString().split('T')[0];
    }
  });

  return dateMap;
}

// Check if a date is within the last N days (likely a "build date" rather than meaningful content update)
function isRecentDate(dateStr, daysThreshold = 7) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = (now - date) / (1000 * 60 * 60 * 24);
  return diffDays < daysThreshold;
}

// Get git last commit date for a file
// Returns null if the date is too recent (likely just a build/deploy, not content change)
function getGitLastModDate(filePath, skipRecentDates = true) {
  try {
    const result = execSync(`git log -1 --format=%cI -- "${filePath}"`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    if (result) {
      const dateStr = result.split('T')[0];
      // Skip dates that are too recent - they likely represent build/deploy times, not content updates
      if (skipRecentDates && isRecentDate(dateStr)) {
        return null;
      }
      return dateStr;
    }
  } catch {
    // Git command failed
  }

  return null;
}

// Build a map of page URLs to their lastmod dates based on source files
function getPageLastModDates() {
  const dateMap = {};
  const baseDir = process.cwd();

  // Map data files to their URL patterns
  const dataFileMapping = {
    'src/data/solutions.ts': '/solutions/',
    'src/data/industries.ts': '/industries/',
    'src/data/competitors.ts': '/compare/',
    'src/data/enterprise.ts': '/enterprise/',
    'src/data/case-studies.ts': '/case-studies/',
    'src/data/glossary.ts': '/glossary/',
    'src/data/faq.ts': '/faq/',
    'src/data/pricing.ts': '/pricing/',
  };

  // Get dates for data-driven pages
  for (const [dataFile, urlPattern] of Object.entries(dataFileMapping)) {
    const filePath = path.join(baseDir, dataFile);
    if (fs.existsSync(filePath)) {
      const lastMod = getGitLastModDate(filePath);
      if (lastMod) {
        dateMap[urlPattern] = lastMod;
      }
    }
  }

  // Map specific page files to their URLs
  const pageFileMapping = {
    'src/pages/index.astro': '/',
    'src/pages/how-it-works.astro': '/how-it-works/',
    'src/pages/pricing.astro': '/pricing/',
    'src/pages/contact.astro': '/contact/',
    'src/pages/about/index.astro': '/about/',
    'src/pages/careers.astro': '/careers/',
    'src/pages/privacy-policy.astro': '/privacy-policy/',
    'src/pages/terms.astro': '/terms/',
    'src/pages/hipaa-compliance.astro': '/hipaa-compliance/',
    'src/pages/gdpr.astro': '/gdpr/',
    'src/pages/resources/index.astro': '/resources/',
    'src/pages/resources/podcast.astro': '/resources/podcast/',
    'src/pages/resources/book.astro': '/resources/book/',
    'src/pages/resources/roi-calculator.astro': '/resources/roi-calculator/',
    'src/pages/blog/index.astro': '/blog/',
    'src/pages/compare/build-vs-buy.astro': '/compare/build-vs-buy/',
  };

  // Get dates for static pages
  for (const [pageFile, url] of Object.entries(pageFileMapping)) {
    const filePath = path.join(baseDir, pageFile);
    if (fs.existsSync(filePath)) {
      const lastMod = getGitLastModDate(filePath);
      if (lastMod) {
        dateMap[url] = lastMod;
      }
    }
  }

  return dateMap;
}

// Section-specific lastmod dates for SEO
// These represent approximate content freshness by section type
const sectionLastModDates = {
  '/solutions/': '2025-11-15',       // Core product pages
  '/industries/': '2025-11-20',      // Industry-specific pages
  '/compare/': '2025-12-01',         // Comparison pages
  '/enterprise/': '2025-11-10',      // Enterprise solutions
  '/case-studies/': '2025-10-15',    // Case study content
  '/glossary/': '2025-09-01',        // Reference content (less frequently updated)
  '/resources/': '2025-10-01',       // Resource hub
  '/faq/': '2025-11-01',             // FAQ content
  '/about/': '2025-08-15',           // Company info (stable)
  '/contact/': '2025-08-15',         // Contact info (stable)
  '/pricing/': '2025-12-15',         // Pricing (may update periodically)
  '/careers/': '2025-11-01',         // Careers page
  '/how-it-works/': '2025-10-20',    // How it works page
  '/privacy-policy/': '2025-07-01',  // Legal pages (rarely change)
  '/terms/': '2025-07-01',           // Legal pages
  '/hipaa-compliance/': '2025-06-15',// Compliance pages
  '/gdpr/': '2025-06-15',            // Compliance pages
  '/sitemap/': '2025-12-01',         // HTML sitemap
  '/blog/category/': '2025-12-20',   // Category pages
  '/blog/tag/': '2025-12-20',        // Tag pages
  '/blog/archive/': '2025-12-25',    // Archive pages
  '/blog/': '2025-12-28',            // Blog index
  '/author/': '2025-10-01',          // Author pages
  '/': '2025-12-01',                 // Homepage
};

// Helper to find the best lastmod for a URL
function findLastModForUrl(url, pageLastModDates) {
  const urlPath = url.replace('https://mybcat.com', '');

  // First, check for git-based dates that are NOT recent (meaningful content updates)
  if (pageLastModDates[urlPath]) {
    return pageLastModDates[urlPath];
  }

  // Check for pattern matches from git dates
  for (const [pattern, date] of Object.entries(pageLastModDates)) {
    if (pattern !== '/' && urlPath.startsWith(pattern)) {
      return date;
    }
  }

  // Use section-specific fallback dates for varied lastmod across sitemap
  // Check specific paths first (longer patterns), then shorter ones
  const sortedPatterns = Object.keys(sectionLastModDates).sort((a, b) => b.length - a.length);
  for (const pattern of sortedPatterns) {
    if (urlPath === pattern || (pattern !== '/' && urlPath.startsWith(pattern))) {
      return sectionLastModDates[pattern];
    }
  }

  // Homepage exact match
  if (urlPath === '/') {
    return sectionLastModDates['/'];
  }

  return null;
}

const nonPublishedSlugs = getNonPublishedSlugs();
const blogLastModDates = getBlogLastModDates();
const pageLastModDates = getPageLastModDates();

// Get categories that have published posts (to exclude empty category pages from sitemap)
function getEmptyCategorySlugs() {
  const blogDir = path.join(process.cwd(), 'src/content/blog');
  if (!fs.existsSync(blogDir)) return [];

  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  const categoriesWithPosts = new Set();

  files.forEach(file => {
    const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
    const { data } = matter(content);
    if (data.status === 'published' && data.category) {
      categoriesWithPosts.add(data.category.toLowerCase().replace(/\s+/g, '-'));
    }
  });

  // All possible category slugs from the [category].astro static paths
  const allCategorySlugs = [
    'technology', 'virtual-staffing', 'patient-experience', 'operations',
    'growth', 'practice-growth', 'practice-management', 'analytics',
    'case-study', 'optometry', 'dental', 'enterprise'
  ];

  return allCategorySlugs.filter(slug => !categoriesWithPosts.has(slug));
}

const emptyCategorySlugs = getEmptyCategorySlugs();

// Default lastmod only used as absolute fallback
const defaultLastMod = '2025-01-01';

// https://astro.build/config
export default defineConfig({
  site: 'https://mybcat.com',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => {
        // Exclude API endpoints from sitemap
        if (page.includes('/api/')) return false;
        // Exclude the internal cutover preview
        if (page.includes('cutover-mock')) return false;
        // Exclude conference landing pages (non-indexable / not in sitemap)
        if (page.includes('/idoc-connections-2026/')) return false;
        // Exclude drafts
        if (page.includes('/draft/')) return false;
        // Exclude empty category pages (no published posts exist)
        for (const slug of emptyCategorySlugs) {
          if (page.includes(`/blog/category/${slug}`)) return false;
        }
        // Exclude archive pages (these return 308 redirects)
        if (page.includes('/blog/archive/')) return false;
        // Exclude non-published blog posts (scheduled/draft)
        for (const slug of nonPublishedSlugs) {
          if (page.includes(`/blog/${slug}/`) || page.endsWith(`/blog/${slug}`)) {
            return false;
          }
        }
        return true;
      },
      changefreq: 'weekly',
      priority: 0.7,
      serialize: (item) => {
        // Determine lastmod date from multiple sources
        let lastmod = defaultLastMod;

        // Check blog posts first (use publishDate)
        if (blogLastModDates[item.url]) {
          lastmod = blogLastModDates[item.url];
        } else {
          // Try to find lastmod from page/data file git history
          const pageLastMod = findLastModForUrl(item.url, pageLastModDates);
          if (pageLastMod) {
            lastmod = pageLastMod;
          }
        }

        // Homepage highest priority
        if (item.url === 'https://mybcat.com/') {
          return { ...item, lastmod, priority: 1.0, changefreq: 'daily' };
        }
        // Industry, solution, and comparison pages
        if (item.url.includes('/industries/') || item.url.includes('/solutions/') || item.url.includes('/compare/')) {
          return { ...item, lastmod, priority: 0.9, changefreq: 'weekly' };
        }
        // Blog posts
        if (item.url.includes('/blog/')) {
          return { ...item, lastmod, priority: 0.8, changefreq: 'weekly' };
        }
        return { ...item, lastmod };
      },
    }),
  ],
  vite: {
    build: {
      cssMinify: true,
    },
  },
  // Use trailing slashes for SEO consistency
  trailingSlash: 'always',
  build: {
    format: 'directory'
  },
  // External links: dofollow by default (per Google best practices).
  // Only add nofollow to paid/sponsored/UGC links manually.
  // See: seo_source_of_truth/05_technical_seo.md §External Link Policy
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, {
        target: '_blank',
        rel: ['noopener'],
      }],
      // Build-time accessibility fixes for Markdown content (tables + task lists).
      rehypeA11y,
    ]
  }
});
