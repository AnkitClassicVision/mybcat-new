import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/static';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Get non-published blog post slugs at build time
function getNonPublishedSlugs() {
  const blogDir = path.join(process.cwd(), 'src/content/blog');
  if (!fs.existsSync(blogDir)) return [];

  const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  const slugs = [];

  files.forEach(file => {
    const content = fs.readFileSync(path.join(blogDir, file), 'utf8');
    const { data } = matter(content);
    if (data.status !== 'published') {
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
      dateMap[url] = new Date(data.publishDate).toISOString().split('T')[0];
    }
  });

  return dateMap;
}

const nonPublishedSlugs = getNonPublishedSlugs();
const blogLastModDates = getBlogLastModDates();

// Default lastmod date for static pages (can be updated when pages change)
const defaultLastMod = new Date().toISOString().split('T')[0];

// https://astro.build/config
export default defineConfig({
  site: 'https://mybcat.com',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: true },
    speedInsights: { enabled: true }
  }),
  integrations: [
    react(),
    mdx(),
    sitemap({
      filter: (page) => {
        // Exclude drafts
        if (page.includes('/draft/')) return false;
        // Exclude empty category pages (no posts exist)
        if (page.includes('/blog/category/industry')) return false;
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
        // Determine lastmod date
        let lastmod = defaultLastMod;
        if (blogLastModDates[item.url]) {
          lastmod = blogLastModDates[item.url];
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
  }
});
