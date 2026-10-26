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
    const ctaButton = page.locator('a[href*="book/discovery"], a[href*="contact"], a[href*="meeting"]').first();
    await expect(ctaButton).toBeVisible();
  });

  test('should have footer', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });
});
