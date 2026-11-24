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
    await page.locator('footer a[href="/contact/"]').click();
    await expect(page).toHaveURL(/contact/);
  });

  test('header CTA books a discovery call', async ({ page }) => {
    await page.goto('/');
    const viewport = page.viewportSize();
    const isCompact = Boolean(viewport && viewport.width <= 1024);
    const headerCta = isCompact
      ? page.locator('.mobile-menu a.mobile-cta')
      : page.locator('nav.nav-dock a.nav-cta-glow');

    if (isCompact) {
      await page.locator('.mobile-menu-toggle').click();
    }

    await expect(headerCta).toBeVisible();
    await expect(headerCta).toHaveText('Book a Discovery Call');
    await expect(headerCta).toHaveAttribute('href', '/book/discovery?src=header');
  });

  test("resources nav item reads Ankit's Book", async ({ page }) => {
    await page.goto('/');
    const bookLinks = page.locator('a[href="/resources/book/"]');
    const labels = await bookLinks.evaluateAll((els) =>
      els.map((el) => (el.textContent || '').trim())
    );
    expect(labels.length).toBeGreaterThan(0);
    expect(labels.every((label) => label === "Ankit's Book")).toBeTruthy();
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
