import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/static';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

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
    sitemap({
      filter: (page) => !page.includes('/draft/'),
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
