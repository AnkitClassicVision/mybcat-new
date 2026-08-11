import { test, expect } from '@playwright/test';

const canonicalEvents = [
  'seo_cta_click',
  'lead_submit_success',
  'meeting_booked',
  'service_qualified_opportunity',
  'acquisition_qualified_seller',
];

async function canonicalDataLayerEvents(page) {
  return page.evaluate((names) => (window.dataLayer || []).filter((entry: { event?: string }) => names.includes(entry.event || '')), canonicalEvents);
}

async function fillServiceForm(page) {
  await page.locator('#cf-firstname').fill('Synthetic');
  await page.locator('#cf-lastname').fill('Lead');
  await page.locator('#cf-email').fill('synthetic@example.test');
  await page.locator('#cf-specialty').selectOption('Optometry');
  await page.locator('#cf-role').selectOption('Owner');
  await page.locator('#cf-locations').selectOption('3-4 Locations');
  await page.locator('#cf-problem').selectOption('Missed calls');
  await page.locator('#cf-timeline').selectOption('1-3 months');
}

test.describe('SEO-to-revenue intake truth', () => {
  test('page views and ordinary clicks create zero canonical conversions', async ({ page }) => {
    await page.goto('/contact/');
    expect(await canonicalDataLayerEvents(page)).toEqual([]);

    await page.evaluate(() => {
      const ordinaryLink = document.createElement('a');
      ordinaryLink.href = '#ordinary-link';
      ordinaryLink.addEventListener('click', (event) => event.preventDefault());
      document.body.appendChild(ordinaryLink);
      ordinaryLink.click();
    });
    expect(await canonicalDataLayerEvents(page)).toEqual([]);
  });

  test('ten synthetic event attempts produce only the six browser-owned events', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate((attempts) => {
      window.dataLayer = [];
      const accepted = attempts.map((eventName) => window.MyBCATAttribution?.emit(eventName, { funnel: 'service' }));
      return {
        accepted,
        events: window.dataLayer.map((entry: { event?: string }) => entry.event),
      };
    }, [
      'seo_cta_click',
      'seo_cta_click',
      'seo_cta_click',
      'lead_submit_success',
      'lead_submit_success',
      'meeting_booked',
      'page_view',
      'click',
      'service_qualified_opportunity',
      'acquisition_qualified_seller',
    ]);
    expect(result.accepted).toEqual([true, true, true, true, true, true, false, false, false, false]);
    expect(result.events).toEqual([
      'seo_cta_click', 'seo_cta_click', 'seo_cta_click',
      'lead_submit_success', 'lead_submit_success', 'meeting_booked',
    ]);
  });

  test('first touch remains immutable while last touch changes', async ({ page }) => {
    await page.goto('/?utm_source=google&utm_medium=organic&utm_campaign=alpha');
    const first = await page.evaluate(() => window.MyBCATAttribution?.snapshot());
    await page.goto('/contact/?utm_source=linkedin&utm_medium=social&utm_campaign=beta');
    const second = await page.evaluate(() => window.MyBCATAttribution?.snapshot());
    expect(second?.attribution_id).toBe(first?.attribution_id);
    expect(second?.first_touch.source).toBe('google');
    expect(second?.first_touch.landing_page).toBe('/');
    expect(second?.last_touch.source).toBe('linkedin');
    expect(second?.last_touch.landing_page).toBe('/contact/');
  });

  test('service success appears only after durable intake acceptance', async ({ page }) => {
    let posted: Record<string, unknown> | undefined;
    await page.route('**/api/forms/intake', async (route) => {
      posted = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });
    await page.route('**/meetings.hubspot.com/**', (route) => route.abort());
    await page.goto('/contact/?utm_source=google&utm_medium=organic');
    await fillServiceForm(page);
    await page.locator('#cf-submit').click();

    await expect(page.locator('#post-submit-state')).toBeVisible();
    await expect(page.locator('#form-content')).toBeHidden();
    expect(posted?.funnel).toBe('service');
    expect((posted?.attribution as { first_touch: { source: string } }).first_touch.source).toBe('google');
    const events = await canonicalDataLayerEvents(page);
    expect(events.map((entry: { event?: string }) => entry.event)).toEqual(['lead_submit_success']);
  });

  test('failed service intake leaves the form visible and emits no success', async ({ page }) => {
    await page.route('**/api/forms/intake', (route) => route.fulfill({
      status: 502,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, error: 'intake_unavailable' }),
    }));
    await page.goto('/contact/');
    await fillServiceForm(page);
    await page.locator('#cf-submit').click();

    await expect(page.locator('[data-submit-error]')).toBeVisible();
    await expect(page.locator('#form-content')).toBeVisible();
    await expect(page.locator('#post-submit-state')).toBeHidden();
    expect(await canonicalDataLayerEvents(page)).toEqual([]);
  });

  test('seller inquiry stays out of service marketing by default', async ({ page }) => {
    let posted: { consent?: { scopes?: string[] }; fields?: Array<{ name: string }> } = {};
    await page.route('**/api/forms/intake', async (route) => {
      posted = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });
    await page.goto('/optometry-practice-transitions/');
    await page.locator('#at-firstname').fill('Synthetic');
    await page.locator('#at-lastname').fill('Owner');
    await page.locator('#at-email').fill('owner@example.test');
    await page.locator('#at-state').selectOption('GA');
    await page.locator('#at-locations').selectOption('1 Location');
    await page.locator('#at-horizon').selectOption('1-2 years');
    await page.locator('#at-confidentiality').check();
    await page.getByRole('button', { name: 'Send Confidential Inquiry' }).click();

    await expect(page.locator('#acquisition-success')).toBeVisible();
    expect(posted.consent?.scopes).toEqual(['confidential_acquisition_inquiry']);
    expect(posted.fields?.some((field) => field.name === 'service_interest_consent')).toBe(false);
  });

  test('confidential seller path does not load third-party marketing trackers', async ({ page }) => {
    await page.goto('/optometry-practice-transitions/?utm_source=google&utm_medium=organic');
    await page.locator('#at-firstname').click();
    await page.waitForTimeout(200);

    const trackingState = await page.evaluate(() => ({
      gtmLoaded: Boolean((window as Window & { __gtmLoaded?: boolean }).__gtmLoaded),
      gtmScripts: document.querySelectorAll('script[src*="googletagmanager.com"]').length,
      hubspotScripts: document.querySelectorAll('script[src*="hs-scripts.com"]').length,
      gtmFrames: document.querySelectorAll('iframe[src*="googletagmanager.com"]').length,
    }));
    expect(trackingState).toEqual({
      gtmLoaded: false,
      gtmScripts: 0,
      hubspotScripts: 0,
      gtmFrames: 0,
    });
    expect(await page.evaluate(() => window.MyBCATAttribution?.snapshot().last_touch.landing_page)).toBe('/optometry-practice-transitions/');
  });
});

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}
