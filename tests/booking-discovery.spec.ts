import { test, expect, type Page } from '@playwright/test';

const CALENDAR_URL = 'https://calendar.app.google/PLDmK4QwpdSqkxmb8';
const CALENDAR_HOST = 'calendar.app.google';

type PosthogStub = {
  events: { event: string; props?: Record<string, unknown> }[];
};

async function stubPosthog(page: Page): Promise<PosthogStub> {
  const posthog: PosthogStub = { events: [] };

  await page.exposeFunction('__bookingPhCapture', (event: string, props: Record<string, unknown>) => {
    posthog.events.push({ event, props });
  });

  await page.addInitScript(() => {
    const w = window as Window & {
      posthog?: { capture: (event: string, props?: Record<string, unknown>) => void };
      __bookingPhCapture: (event: string, props?: Record<string, unknown>) => void;
    };
    w.posthog = {
      capture(event, props) {
        w.__bookingPhCapture(event, props);
      },
    };
  });

  return posthog;
}

async function interceptCalendar(page: Page) {
  await page.route('https://calendar.app.google/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'text/plain',
      body: 'intercepted-calendar',
    });
  });
}

test.describe('Discovery booking source page', () => {
  test('renders the source step with header, noindex, select, continue, and fallback', async ({
    page,
  }) => {
    await page.goto('/book/discovery/');

    await expect(page).toHaveTitle(/Book your discovery call \| MyBCAT/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('h1')).toHaveText('Book your discovery call');
    await expect(page.getByText('Tell us how you heard about us, then pick a time.')).toBeVisible();
    await expect(page.getByLabel(/How did you hear about us/)).toBeVisible();
    await expect(page.locator('#other-wrap')).toBeHidden();
    await expect(page.getByRole('link', { name: 'Continue to the calendar' })).toHaveAttribute(
      'href',
      CALENDAR_URL
    );
    await expect(page.getByRole('link', { name: 'Open the calendar' })).toHaveAttribute(
      'href',
      CALENDAR_URL
    );
    const viewport = page.viewportSize();
    const compact = Boolean(viewport && viewport.width <= 1024);
    if (compact) {
      await expect(page.locator('.mobile-menu-toggle')).toBeVisible();
    } else {
      await expect(page.locator('nav.nav-dock')).toBeVisible();
    }
    await expect(page.locator('footer')).toBeVisible();
  });

  test('keeps query from existing /book/discovery?utm_ links', async ({ page }) => {
    // Production 308s /book/discovery → /book/discovery/ and keeps the query.
    // astro preview does not apply vercel.json, so this test hits the page URL.
    await page.goto('/book/discovery/?utm_source=site&utm_content=header');
    await expect(page).toHaveURL(/\/book\/discovery\/\?utm_source=site&utm_content=header/);
    await expect(page.locator('h1')).toHaveText('Book your discovery call');
    await expect(page.getByLabel(/How did you hear about us/)).toHaveValue('');
  });

  test('prefills the select from a clear utm_source and continues to the calendar', async ({
    page,
  }) => {
    const posthog = await stubPosthog(page);
    await interceptCalendar(page);

    await page.goto(
      '/book/discovery/?utm_source=linkedin&utm_medium=social&utm_campaign=obe&utm_content=header'
    );
    await expect(page.getByLabel(/How did you hear about us/)).toHaveValue('linkedin');
    await expect(page.locator('#other-wrap')).toBeHidden();

    await Promise.all([
      page.waitForURL(new RegExp(CALENDAR_HOST)),
      page.getByRole('link', { name: 'Continue to the calendar' }).click(),
    ]);

    expect(page.url()).toContain(CALENDAR_HOST);
    expect(posthog.events.map((item) => item.event)).toContain('booking_source_selected');
    expect(posthog.events.map((item) => item.event)).not.toContain('discovery_call_scheduled');

    const selected = posthog.events.find((item) => item.event === 'booking_source_selected');
    expect(selected?.props).toMatchObject({
      lane: 'linkedin',
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'obe',
      utm_content: 'header',
      landing_page: '/book/discovery/',
    });
  });

  test('stores lane plus UTMs in sessionStorage and first-touch localStorage', async ({ page }) => {
    const stored: Record<string, string> = {};
    await page.exposeFunction('__bookingStoreWrite', (key: string, value: string) => {
      stored[key] = value;
    });
    await stubPosthog(page);
    await page.addInitScript(() => {
      const raw = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        raw.call(this, key, String(value));
        const w = window as Window & { __bookingStoreWrite?: (k: string, v: string) => void };
        if (
          (key === 'mybcat_booking_utm' || key === 'mybcat_booking_first_touch') &&
          typeof w.__bookingStoreWrite === 'function'
        ) {
          w.__bookingStoreWrite(key, String(value));
        }
      };
    });
    await interceptCalendar(page);

    await page.goto(
      '/book/discovery/?utm_source=youtube&utm_medium=video&utm_campaign=obe&utm_content=home'
    );
    await expect(page.getByLabel(/How did you hear about us/)).toHaveValue('youtube');
    await page.getByLabel(/How did you hear about us/).selectOption('podcast');

    await Promise.all([
      page.waitForURL(new RegExp(CALENDAR_HOST)),
      page.getByRole('link', { name: 'Continue to the calendar' }).click(),
    ]);

    expect(JSON.parse(stored.mybcat_booking_utm || 'null')).toMatchObject({
      lane: 'podcast',
      utm_source: 'youtube',
      utm_medium: 'video',
      utm_campaign: 'obe',
      utm_content: 'home',
      landing_page: '/book/discovery/',
    });
    expect(JSON.parse(stored.mybcat_booking_first_touch || 'null')).toMatchObject({
      lane: 'podcast',
      utm_source: 'youtube',
      landing_page: '/book/discovery/',
    });
  });

  test('Other detail stays local and the first touch survives a second visit', async ({ page }) => {
    const posthog = await stubPosthog(page);
    await interceptCalendar(page);
    await page.goto('/book/discovery/?utm_source=other&utm_content=header');
    const detail = page.getByLabel('Please specify');
    await expect(detail).toBeVisible();
    await detail.fill('  <Trade journal>  ');
    await page.getByRole('link', { name: 'Continue to the calendar' }).click();
    await expect(page).toHaveURL(CALENDAR_URL);
    await page.goto('/book/discovery/');
    const readRecord = (store: 'sessionStorage' | 'localStorage', item: string) =>
      page.evaluate(({ store, item }) => JSON.parse(window[store].getItem(item) || 'null'), { store, item });
    const first = await readRecord('localStorage', 'mybcat_booking_first_touch');
    expect(first).toMatchObject({ lane: 'other', other_detail: 'Trade journal', utm_content: 'header' });
    expect(await readRecord('sessionStorage', 'mybcat_booking_utm')).toEqual(first);
    expect(posthog.events.find(({ event }) => event === 'booking_source_selected')?.props).toMatchObject({ lane: 'other' });
    expect(posthog.events.find(({ event }) => event === 'booking_source_selected')?.props).not.toHaveProperty('other_detail');
    await page.getByLabel(/How did you hear about us/).selectOption('referral');
    await expect(detail).toBeHidden();
    await page.getByRole('link', { name: 'Continue to the calendar' }).click();
    await expect(page).toHaveURL(CALENDAR_URL);
    await page.goto('/book/discovery/');
    expect(await readRecord('localStorage', 'mybcat_booking_first_touch')).toEqual(first);
    const latest = await readRecord('sessionStorage', 'mybcat_booking_utm');
    expect(latest.lane).toBe('referral');
    expect(latest).not.toHaveProperty('other_detail');
  });

  for (const name of ['Continue to the calendar', 'Open the calendar']) {
    test(`${name} still works when analytics throws`, async ({ page }) => {
      await interceptCalendar(page);
      await page.goto('/book/discovery/');
      await page.evaluate(() => {
        Object.defineProperty(window, 'posthog', {
          configurable: true,
          value: { capture() { throw new Error('Analytics unavailable'); } },
        });
      });
      await page.getByRole('link', { name }).focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(CALENDAR_URL, { timeout: 3500 });
    });
  }

  test('skip path sends lane=unknown and still opens the calendar', async ({ page }) => {
    const posthog = await stubPosthog(page);
    await interceptCalendar(page);

    await page.goto('/book/discovery/');
    await expect(page.getByLabel(/How did you hear about us/)).toHaveValue('');

    await Promise.all([
      page.waitForURL(new RegExp(CALENDAR_HOST)),
      page.getByRole('link', { name: 'Continue to the calendar' }).click(),
    ]);

    const selected = posthog.events.find((item) => item.event === 'booking_source_selected');
    expect(selected?.props).toMatchObject({
      lane: 'unknown',
      landing_page: '/book/discovery/',
    });
    expect(posthog.events.map((item) => item.event)).not.toContain('discovery_call_scheduled');
  });
});

test.describe('Discovery booking source page without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('no-JS fallback still points at the calendar', async ({ page }) => {
    await page.goto('/book/discovery/');
    await expect(page.getByRole('link', { name: 'Continue to the calendar' })).toHaveAttribute(
      'href',
      CALENDAR_URL
    );
    await expect(page.getByRole('link', { name: 'Open the calendar' })).toHaveAttribute(
      'href',
      CALENDAR_URL
    );
  });
});
