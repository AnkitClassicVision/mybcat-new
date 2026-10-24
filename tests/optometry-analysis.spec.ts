import { test, expect } from '@playwright/test';

test.describe('Optometry Analysis landing page', () => {
  test('renders the research page with title, H1, and both CTAs', async ({ page }) => {
    await page.goto('/optometry-analysis/');

    await expect(page).toHaveTitle(/What Drives Growth Across Optometry Practices \| MyBCAT/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Multi-practice research/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /What Drives Growth Across Optometry Practices/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/optometry-analysis\/$/);
    await expect(page.locator('h1')).toHaveText('What drives growth across a group of optometry practices');
    await expect(page.locator('[data-optometry-analysis-form]')).toHaveCount(2);
    await expect(page.getByRole('heading', { name: /what drives growth across a group of optometry practices/i })).toHaveCount(2);
    await expect(page.getByRole('button', { name: 'Get a plan built for your market' })).toHaveCount(2);
  });

  test('shows the research slide viewer and advances with next', async ({ page }) => {
    await page.goto('/optometry-analysis/');
    const deck = page.locator('[data-oa-deck]');

    await expect(deck).toBeVisible();
    await expect(page.locator('#oa-deck-title')).toHaveText('The research: what drives growth across a group of optometry practices');
    await expect(deck.locator('[data-oa-slide]')).toHaveCount(4);
    await expect(deck.locator('[data-oa-thumb]')).toHaveCount(4);
    await expect(deck.locator('[data-oa-counter]')).toHaveText('1 / 4');
    await expect(deck.locator('[data-oa-slide]').nth(0)).toBeVisible();
    await expect(deck.locator('[data-oa-slide]').nth(1)).toBeHidden();

    await deck.getByRole('button', { name: 'Next slide' }).click();
    await expect(deck.locator('[data-oa-counter]')).toHaveText('2 / 4');
    await expect(deck.locator('[data-oa-slide]').nth(1)).toBeVisible();
    await expect(deck.locator('[data-oa-slide]').nth(0)).toBeHidden();
  });

  test('requires practice name and a valid website', async ({ page }) => {
    await page.goto('/optometry-analysis/');
    const form = page.locator('[data-optometry-analysis-form]').first();

    await form.getByRole('button', { name: 'Get a plan built for your market' }).click();
    await expect(form.locator('[data-error-for="practice_name"]')).toHaveText('Practice name is required.');
    await expect(form.locator('[data-error-for="website"]')).toHaveText('Practice website is required.');

    await form.locator('#oa-top-practice-name').fill('Test Vision');
    await form.locator('#oa-top-website').fill('not-a-url');
    await form.getByRole('button', { name: 'Get a plan built for your market' }).click();
    await expect(form.locator('[data-error-for="website"]')).toContainText('valid website URL');
  });

  test('keeps phone and email optional, and validates them only when filled', async ({ page }) => {
    await page.goto('/optometry-analysis/');
    const form = page.locator('[data-optometry-analysis-form]').first();

    await form.locator('#oa-top-practice-name').fill('Test Vision');
    await form.locator('#oa-top-website').fill('https://example.com');
    await form.locator('#oa-top-phone').fill('123');
    await form.locator('#oa-top-email').fill('not-an-email');
    await form.getByRole('button', { name: 'Get a plan built for your market' }).click();

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
    await form.getByRole('button', { name: 'Get a plan built for your market' }).click();
    const request = await requestPromise;
    expect(request.headers()['x-forms-token']).toBe('preview-test-token');
    await page.waitForURL(/\/book\/discovery\/\?/);
    expect(page.url()).toContain('firstName=Preview+Test+Practice');
    expect(page.url()).toContain('email=preview-test%40example.com');
  });

  test('does not name Classic Vision Care or other practices', async ({ page }) => {
    await page.goto('/optometry-analysis/');
    const body = await page.locator('.oa-page').textContent();
    expect(body).toContain('P14');
    expect(body).toContain('P21');
    expect(body).not.toMatch(/Classic Vision Care|\bCVC\b|East Cobb|Kennesaw|Marietta/i);
    expect(body).not.toMatch(/Golden Triangle|Winchester Optical|RLK/i);

    const html = await page.content();
    expect(html).not.toMatch(/Classic Vision Care|\bCVC\b|East Cobb|Kennesaw|Marietta/i);

    const slideAlts = await page.locator('[data-oa-slide] img').evaluateAll((imgs) => (
      imgs.map((img) => img.getAttribute('alt') || '').join(' ')
    ));
    expect(slideAlts).not.toMatch(/Classic Vision Care|\bCVC\b|East Cobb|Kennesaw|Marietta/i);
    expect(slideAlts).not.toMatch(/Golden Triangle|Winchester Optical|RLK/i);
  });
});
