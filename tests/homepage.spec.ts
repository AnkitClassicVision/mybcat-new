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
      '/book/discovery?utm_source=site&utm_content=home'
    );
  });

  test('hero headline and Get Started CTA stay on the contact form', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero h1.hero-title')).toHaveText(
      'Centralized Patient Access for Multi-Location Healthcare Groups'
    );
    const heroCta = page.locator('#hero .hero-cta-group a').first();
    await expect(heroCta).toHaveText('Get Started');
    await expect(heroCta).toHaveAttribute('href', '/contact/');
  });

  test('should have footer', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
