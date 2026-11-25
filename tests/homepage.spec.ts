import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/MyBCAT/);
  });

  test('should have main navigation', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('should have hero section', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('[class*="hero"], .hero, section').first();
    await expect(hero).toBeVisible();
  });

  test('should have working CTA button', async ({ page }) => {
    await page.goto('/');
    const ctaButton = page.locator('nav.nav-dock a.nav-cta-glow, #hero .hero-cta-group a').first();
    await expect(ctaButton).toBeVisible();
  });

  test('final discovery CTA points at the booking wrapper', async ({ page }) => {
    await page.goto('/');
    const discoveryCta = page.getByRole('link', { name: 'Book Your Discovery Call' });
    await expect(discoveryCta).toHaveAttribute(
      'href',
      '/book/discovery?src=home-cta'
    );
  });

  test('hero headline and Get Started CTA stay on the contact form', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero h1.hero-title')).toHaveText(
      'Answering, Scheduling, and Recall for Optometry Practices of Any Size'
    );
    const heroCta = page.locator('#hero .hero-cta-group').getByRole('link', { name: 'Get Started' });
    await expect(heroCta).toHaveAttribute('href', '/contact/');
    await expect(page.locator('#hero .hero-cta-group a').first()).toHaveText('Book a Discovery Call');
  });

  for (const [width, height] of [[360, 640], [375, 667], [390, 664], [414, 736], [390, 844]]) {
    test(`booking button is fully on the first screen at ${width}x${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      const box = await page.locator('#hero a[href="/book/discovery?src=home-hero"]').boundingBox();
      expect(box && box.y >= 0 && box.y + box.height <= height).toBeTruthy();
      const h1 = await page.locator('#hero h1').boundingBox();
      expect(h1 && h1.y + h1.height <= height).toBeTruthy();
    });
  }

  test('should have footer', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
