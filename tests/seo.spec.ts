import { test, expect } from '@playwright/test';

const PAGES_TO_TEST = [
  { path: '/', name: 'Homepage' },
  { path: '/solutions/', name: 'Solutions' },
  { path: '/industries/', name: 'Industries' },
  { path: '/pricing/', name: 'Pricing' },
  { path: '/contact/', name: 'Contact' },
  { path: '/blog/', name: 'Blog' },
];

test.describe('SEO Essentials', () => {
  for (const { path, name } of PAGES_TO_TEST) {
    test(`${name} should have meta title`, async ({ page }) => {
      await page.goto(path);
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);
    });

    test(`${name} should have meta description`, async ({ page }) => {
      await page.goto(path);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description).toBeTruthy();
      expect(description!.length).toBeGreaterThan(50);
    });

    test(`${name} should have canonical URL`, async ({ page }) => {
      await page.goto(path);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toBeTruthy();
    });

    test(`${name} should have Open Graph tags`, async ({ page }) => {
      await page.goto(path);
      const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
      const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
      expect(ogTitle).toBeTruthy();
      expect(ogDescription).toBeTruthy();
    });
  }
});

test.describe('Accessibility Basics', () => {
  test('Homepage should have h1 heading', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('Images should have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img:not([alt])');
    const count = await images.count();
    expect(count).toBe(0);
  });
});
