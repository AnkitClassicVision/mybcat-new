import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('should navigate to Solutions page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/solutions/"]');
    await expect(page).toHaveURL(/solutions/);
  });

  test('should navigate to Industries page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/industries/"]');
    await expect(page).toHaveURL(/industries/);
  });

  test('should navigate to Pricing page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/pricing/"]');
    await expect(page).toHaveURL(/pricing/);
  });

  test('should navigate to Blog page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/blog/"]');
    await expect(page).toHaveURL(/blog/);
  });

  test('should navigate to Contact page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/contact/"]');
    await expect(page).toHaveURL(/contact/);
  });

  test('logo should link to homepage', async ({ page }) => {
    await page.goto('/solutions/');
    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Footer Links', () => {
  test('footer should have company links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.locator('a[href="/about/"]')).toBeVisible();
    await expect(footer.locator('a[href="/contact/"]')).toBeVisible();
  });

  test('footer should have legal links', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.locator('a[href="/privacy-policy/"]')).toBeVisible();
    await expect(footer.locator('a[href="/terms/"]')).toBeVisible();
  });
});
