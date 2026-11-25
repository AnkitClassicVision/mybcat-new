import { test, expect, type Page } from '@playwright/test';

type IntakeBody = {
  fields?: { name: string; value: string }[];
  context?: { source?: string; utm?: Record<string, string> };
};

function fieldsByName(body: IntakeBody) {
  return Object.fromEntries((body.fields || []).map((field) => [field.name, field.value]));
}

async function stubIntakeAndPosthog(page: Page) {
  const posthog = {
    events: [] as { event: string; props?: Record<string, unknown> }[],
    identifies: [] as string[],
  };

  await page.exposeFunction('__oaPhCapture', (event: string, props: Record<string, unknown>) => {
    posthog.events.push({ event, props });
  });
  await page.exposeFunction('__oaPhIdentify', (id: string) => {
    posthog.identifies.push(id);
  });
  await page.addInitScript(() => {
    const w = window as Window & {
      MYBCAT_FORM_TOKEN?: string;
      posthog?: {
        capture: (event: string, props?: Record<string, unknown>) => void;
        identify: (id: string) => void;
      };
      __oaPhCapture: (event: string, props?: Record<string, unknown>) => void;
      __oaPhIdentify: (id: string) => void;
    };
    w.MYBCAT_FORM_TOKEN = 'preview-test-token';
    w.posthog = {
      capture(event, props) {
        w.__oaPhCapture(event, props);
      },
      identify(id) {
        w.__oaPhIdentify(id);
      },
    };
  });

  return posthog;
}

test.describe('Optometry Analysis landing page', () => {
  test('renders the research page with title, H1, viewer, and CTA', async ({ page }) => {
    await page.goto('/optometry-analysis/');

    await expect(page).toHaveTitle(/What Drives Optometry Practice Growth\? 2026 Study \| MyBCAT/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /How to grow an optometry practice/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /What Drives Optometry Practice Growth/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/optometry-analysis\/$/);
    await expect(page.locator('h1')).toHaveText('What drives optometry practice growth');
    await expect(page.locator('[data-optometry-analysis-form]')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Get a plan built for your market' })).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Get a plan built for your market' })).toBeVisible();
    await expect(page.locator('[data-oa-deck]')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get my plan ↓' })).toBeVisible();

    const deckBox = await page.locator('[data-oa-deck]').boundingBox();
    const formBox = await page.locator('#book').boundingBox();
    expect(deckBox).toBeTruthy();
    expect(formBox).toBeTruthy();
    expect(deckBox!.y).toBeLessThan(formBox!.y);
  });

  test('shows the research slide viewer and advances with next', async ({ page }) => {
    await page.goto('/optometry-analysis/');
    const deck = page.locator('[data-oa-deck]');

    await expect(deck).toBeVisible();
    await expect(page.locator('#oa-deck-title')).toHaveText('Research slides');
    await expect(deck.locator('[data-oa-slide]')).toHaveCount(5);
    await expect(deck.locator('[data-oa-thumb]')).toHaveCount(5);
    await expect(deck.locator('[data-oa-counter]')).toHaveText('1 / 5');
    await expect(deck.locator('[data-oa-slide]').nth(0)).toBeVisible();
    await expect(deck.locator('[data-oa-slide]').nth(1)).toBeHidden();

    await deck.getByRole('button', { name: 'Next slide' }).click();
    await expect(deck.locator('[data-oa-counter]')).toHaveText('2 / 5');
    await expect(deck.locator('[data-oa-slide]').nth(1)).toBeVisible();
    await expect(deck.locator('[data-oa-slide]').nth(0)).toBeHidden();
  });

  test('CTA slide button scrolls to the form and focuses the first field', async ({ page }) => {
    await page.goto('/optometry-analysis/');
    const deck = page.locator('[data-oa-deck]');
    const field = page.locator('#oa-top-practice-name');

    await deck.getByRole('button', { name: 'Go to slide 5 of 5' }).click();
    await expect(deck.locator('[data-oa-counter]')).toHaveText('5 / 5');
    await expect(deck.locator('[data-oa-slide]').nth(4)).toBeVisible();
    await expect(deck.getByRole('heading', { name: 'Get a plan built for your market' })).toBeVisible();

    await deck.getByRole('button', { name: 'Get my plan' }).click();
    await expect(field).toBeFocused();
    await expect(page.locator('#book')).toBeInViewport();
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
    const posthog = await stubIntakeAndPosthog(page);
    await page.route('https://estate-form-bridge.mybcat-estate.workers.dev', async (route) => {
      const body = route.request().postDataJSON() as IntakeBody;
      expect(body.context?.source).toBe('optometry-analysis');
      const fields = fieldsByName(body);
      expect(fields.utm_source).toBe('optometry-analysis');
      expect(fields.utm_medium).toBeUndefined();
      expect(fields.utm_campaign).toBeUndefined();
      expect(fields.utm_content).toBeUndefined();
      expect(fields.message).toBe(
        'Growth plan request: wants a growth plan for their local market (optometry analysis page)'
      );
      expect(body.context?.utm).toEqual({ utm_source: 'optometry-analysis' });
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
    await page.waitForURL(/\/book\/discovery\/$/);
    expect(page.url()).not.toContain('firstName=');
    expect(page.url()).not.toContain('email=');
    expect(posthog.events.map((item) => item.event)).toContain('growth_plan_requested');
    expect(posthog.events.map((item) => item.event)).not.toContain('discovery_call_scheduled');
    expect(posthog.identifies).toEqual(['preview-test@example.com']);
    const growth = posthog.events.find((item) => item.event === 'growth_plan_requested');
    expect(growth?.props).toMatchObject({
      source: 'optometry-analysis',
      utm_source: 'optometry-analysis',
    });
  });

  test('sends URL UTMs as fields and context.utm', async ({ page }) => {
    const posthog = await stubIntakeAndPosthog(page);
    await page.route('https://estate-form-bridge.mybcat-estate.workers.dev', async (route) => {
      const body = route.request().postDataJSON() as IntakeBody;
      expect(body.context?.source).toBe('optometry-analysis');
      const fields = fieldsByName(body);
      expect(fields.utm_source).toBe('linkedin');
      expect(fields.utm_medium).toBe('social');
      expect(fields.utm_campaign).toBe('oa-2026');
      expect(fields.utm_content).toBe('hero-cta');
      expect(fields.message).toBe(
        'Growth plan request: wants a growth plan for their local market (optometry analysis page)'
      );
      expect(body.context?.utm).toEqual({
        utm_source: 'linkedin',
        utm_medium: 'social',
        utm_campaign: 'oa-2026',
        utm_content: 'hero-cta',
      });
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    const utmUrl =
      '/optometry-analysis/?utm_source=linkedin&utm_medium=social&utm_campaign=oa-2026&utm_content=hero-cta';
    await page.goto(utmUrl);
    const stored = await page.evaluate(() => sessionStorage.getItem('mybcat_oa_utm'));
    expect(JSON.parse(stored || '{}')).toEqual({
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'oa-2026',
      utm_content: 'hero-cta',
    });

    const form = page.locator('[data-optometry-analysis-form]').first();
    await form.locator('#oa-top-practice-name').fill('Preview Test Practice');
    await form.locator('#oa-top-website').fill('https://example.com');
    await form.locator('#oa-top-email').fill('preview-test@example.com');

    const requestPromise = page.waitForRequest('https://estate-form-bridge.mybcat-estate.workers.dev');
    await form.getByRole('button', { name: 'Get a plan built for your market' }).click();
    const request = await requestPromise;
    expect(request.headers()['x-forms-token']).toBe('preview-test-token');
    await page.waitForURL(/\/book\/discovery\/$/);
    expect(page.url()).not.toContain('firstName=');
    expect(page.url()).not.toContain('email=');
    const growth = posthog.events.find((item) => item.event === 'growth_plan_requested');
    expect(growth).toBeTruthy();
    expect(posthog.events.map((item) => item.event)).not.toContain('discovery_call_scheduled');
    expect(growth?.props).toMatchObject({
      source: 'optometry-analysis',
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'oa-2026',
      utm_content: 'hero-cta',
    });
  });

  test('exposes SEO metadata and structured data', async ({ page }) => {
    await page.goto('/optometry-analysis/');

    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/images\/optometry-analysis\/og-optometry-analysis\.jpg$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index, follow/);

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks
      .flatMap((block) => {
        const data = JSON.parse(block);
        return data['@graph'] ?? [data];
      })
      .flatMap((node) => [node['@type']].flat());
    expect(types).toEqual(expect.arrayContaining(['WebPage', 'Report', 'BreadcrumbList']));
  });

  test('keeps every slide crawlable with src, alt, and a text version', async ({ page }) => {
    await page.goto('/optometry-analysis/');

    const imgs = page.locator('[data-oa-slide] img');
    await expect(imgs).toHaveCount(4);
    for (const img of await imgs.all()) {
      await expect(img).toHaveAttribute('src', /\/images\/optometry-analysis\/.+\.webp$/);
      await expect(img).toHaveAttribute('alt', /.{20,}/);
      await expect(img).toHaveAttribute('width', '1600');
      await expect(img).toHaveAttribute('height', '901');
    }
    await expect(imgs.nth(0)).toHaveAttribute('loading', 'eager');
    await expect(imgs.nth(1)).toHaveAttribute('loading', 'lazy');

    const transcript = page.locator('.oa-transcript');
    await expect(transcript.locator('li')).toHaveCount(4);
    await expect(transcript).toContainText('Growers sit in older markets with more Medicare and Medicaid patients.');
    await expect(page.locator('.hero-notes .source')).toContainText('n=19 (13 Up / 6 not-Up)');
  });

  test('links to related MyBCAT pages', async ({ page }) => {
    await page.goto('/optometry-analysis/');
    const links = page.locator('.oa-links');

    await expect(links.locator('a[href="/ods-on-finance/"]')).toHaveCount(1);
    await expect(links.locator('a[href="/idoc/"]')).toHaveCount(1);
    await expect(links.locator('a[href="/"]')).toHaveCount(1);
  });

  test('does not name Classic Vision Care or other practices', async ({ page }) => {
    await page.goto('/optometry-analysis/');
    const body = await page.locator('.oa-page').textContent();
    expect(body).not.toMatch(/\bP\d{2}\b/);
    expect(body).not.toMatch(/private-only|self-pay|uninsured/i);
    expect(body).not.toMatch(/Classic Vision Care|\bCVC\b|East Cobb|Kennesaw|Marietta/i);
    expect(body).not.toMatch(/Golden Triangle|Winchester Optical|RLK/i);

    const html = await page.locator('.oa-page').evaluate((el) => el.innerHTML);
    expect(html).not.toMatch(/Classic Vision Care|\bCVC\b|East Cobb|Kennesaw|Marietta/i);

    const slideAlts = await page.locator('[data-oa-slide] img').evaluateAll((imgs) => (
      imgs.map((img) => img.getAttribute('alt') || '').join(' ')
    ));
    expect(slideAlts).not.toMatch(/Classic Vision Care|\bCVC\b|East Cobb|Kennesaw|Marietta/i);
    expect(slideAlts).not.toMatch(/Golden Triangle|Winchester Optical|RLK/i);
    expect(slideAlts).not.toMatch(/\bP\d{2}\b|private-only/i);
  });
});
