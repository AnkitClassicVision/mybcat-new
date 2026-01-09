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

const nonPublishedSlugs = getNonPublishedSlugs();

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
        // Homepage highest priority
        if (item.url === 'https://mybcat.com/') {
          return { ...item, priority: 1.0, changefreq: 'daily' };
        }
        // Industry, solution, and comparison pages
        if (item.url.includes('/industries/') || item.url.includes('/solutions/') || item.url.includes('/compare/')) {
          return { ...item, priority: 0.9, changefreq: 'weekly' };
        }
        // Blog posts
        if (item.url.includes('/blog/')) {
          return { ...item, priority: 0.8, changefreq: 'weekly' };
        }
        return item;
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
