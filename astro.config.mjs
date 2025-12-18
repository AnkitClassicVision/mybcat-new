import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/static';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://mybcat.com',
  output: 'static',
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
  integrations: [
    // Sitemap disabled while site is in development (noindex)
    // Uncomment when ready to launch:
    // sitemap({
    //   filter: (page) => !page.includes('/draft/'),
    //   changefreq: 'weekly',
    //   priority: 0.7,
    //   serialize: (item) => {
    //     if (item.url === 'https://mybcat.com/') {
    //       return { ...item, priority: 1.0, changefreq: 'daily' };
    //     }
    //     if (item.url.includes('/blog/')) {
    //       return { ...item, priority: 0.8, changefreq: 'weekly' };
    //     }
    //     return item;
    //   },
    // }),
  ],
  vite: {
    build: {
      cssMinify: true,
    },
  },
  // Preserve URL structure from WordPress
  trailingSlash: 'never',
});
