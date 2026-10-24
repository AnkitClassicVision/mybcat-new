import { test, expect } from '@playwright/test';

test.describe('Optometry Analysis landing page', () => {
  test('renders the analysis page with title, H1, and both CTAs', async ({ page }) => {
    await page.goto('/optometry-analysis/');

    await expect(page).toHaveTitle(/Optometry Analysis: What Drives Growth \| MyBCAT/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Classic Vision Care/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Optometry Analysis/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/optometry-analysis\/$/);
    await expect(page.locator('h1')).toHaveText('What separates growing independent practices');
    await expect(page.locator('[data-optometry-analysis-form]')).toHaveCount(2);
    await expect(page.getByRole('heading', { name: 'Classic Vision Care: two offices, East Cobb (Marietta, GA) and Kennesaw (GA), sharing one website' })).toBeVisible();
  });

  test('requires practice name and a valid website', async ({ page }) => {
    await page.goto('/optometry-analysis/');
    const form = page.locator('[data-optometry-analysis-form]').first();

    await form.getByRole('button', { name: 'Get a custom analysis for your location' }).click();
    await expect(form.locator('[data-error-for="practice_name"]')).toHaveText('Practice name is required.');
    await expect(form.locator('[data-error-for="website"]')).toHaveText('Practice website is required.');

    await form.locator('#oa-top-practice-name').fill('Test Vision');
    await form.locator('#oa-top-website').fill('not-a-url');
    await form.getByRole('button', { name: 'Get a custom analysis for your location' }).click();
    await expect(form.locator('[data-error-for="website"]')).toContainText('valid website URL');
  });

  test('keeps phone and email optional, and validates them only when filled', async ({ page }) => {
    await page.goto('/optometry-analysis/');
    const form = page.locator('[data-optometry-analysis-form]').first();

    await form.locator('#oa-top-practice-name').fill('Test Vision');
    await form.locator('#oa-top-website').fill('https://example.com');
    await form.locator('#oa-top-phone').fill('123');
    await form.locator('#oa-top-email').fill('not-an-email');
    await form.getByRole('button', { name: 'Get a custom analysis for your location' }).click();

    await expect(form.locator('[data-error-for="mobilephone"]')).toContainText('10 digits');
    await expect(form.locator('[data-error-for="email"]')).toContainText('valid email');
  });

  test('redirects to discovery booking after a successful intake post', async ({ page }) => {
    await page.addInitScript(() => {
      window.MYBCAT_FORM_TOKEN = 'preview-test-token';
    });
    await page.route('https://estate-form-bridge.mybcat-estate.workers.dev', async (route) => {
      const body = route.request().postDataJSON() as { context?: { source?: string } };
      expect(body.context?.source).toBe('optometry-analysis');
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    await page.goto('/optometry-analysis/');
    const form = page.locator('[data-optometry-analysis-form]').first();
    await form.locator('#oa-top-practice-name').fill('Preview Test Practice');
    await form.locator('#oa-top-website').fill('https://example.com');
    await form.locator('#oa-top-email').fill('preview-test@example.com');

    const requestPromise = page.waitForRequest('https://estate-form-bridge.mybcat-estate.workers.dev');
    await form.getByRole('button', { name: 'Get a custom analysis for your location' }).click();
    const request = await requestPromise;
    expect(request.headers()['x-forms-token']).toBe('preview-test-token');
    await page.waitForURL(/\/book\/discovery\/\?/);
    expect(page.url()).toContain('firstName=Preview+Test+Practice');
    expect(page.url()).toContain('email=preview-test%40example.com');
  });

  test('does not name practices other than Classic Vision Care', async ({ page }) => {
    await page.goto('/optometry-analysis/');
    const body = await page.locator('.oa-page').innerText();
    expect(body).toContain('Classic Vision Care');
    expect(body).toContain('P14');
    expect(body).toContain('P21');
    expect(body).not.toMatch(/Golden Triangle|Winchester Optical|RLK/i);
  });
});
