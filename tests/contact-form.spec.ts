import { test, expect, type Page } from '@playwright/test';

type LeadBody = {
  fields?: { name: string; value: string }[];
  context?: {
    source?: string;
    pageUri?: string;
    utm?: Record<string, string>;
  };
};

function fieldsByName(body: LeadBody) {
  return Object.fromEntries((body.fields || []).map((field) => [field.name, field.value]));
}

async function stubPosthog(page: Page) {
  const posthog = {
    events: [] as { event: string; props?: Record<string, unknown> }[],
  };

  await page.exposeFunction('__contactPhCapture', (event: string, props: Record<string, unknown>) => {
    posthog.events.push({ event, props });
  });
  await page.addInitScript(() => {
    const w = window as Window & {
      posthog?: {
        capture: (event: string, props?: Record<string, unknown>) => void;
      };
      __contactPhCapture: (event: string, props?: Record<string, unknown>) => void;
    };
    w.posthog = {
      capture(event, props) {
        w.__contactPhCapture(event, props);
      },
    };
  });

  return posthog;
}

async function fillContactForm(page: Page) {
  await page.locator('#cf-firstname').fill('Preview');
  await page.locator('#cf-lastname').fill('Tester');
  await page.locator('#cf-email').fill('preview-test@example.com');
  await page.locator('#cf-phone').fill('4045550100');
}

test.describe('Contact form lead capture', () => {
  test('sends all 4 UTMs and the landing page, and does not fire discovery_call_scheduled on submit', async ({ page }) => {
    const posthog = await stubPosthog(page);
    await page.route('**/api/forms/lead', async (route) => {
      const body = route.request().postDataJSON() as LeadBody;
      expect(body.context?.source).toBe('contact');
      const fields = fieldsByName(body);
      expect(fields.utm_source).toBe('linkedin');
      expect(fields.utm_medium).toBe('social');
      expect(fields.utm_campaign).toBe('oa-2026');
      expect(fields.utm_content).toBe('eb-test');
      expect(body.context?.utm).toEqual({
        utm_source: 'linkedin',
        utm_medium: 'social',
        utm_campaign: 'oa-2026',
        utm_content: 'eb-test',
      });
      expect(body.context?.pageUri).toContain('/contact/');
      expect(body.context?.pageUri).toContain('utm_content=eb-test');
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    const utmUrl =
      '/contact/?utm_source=linkedin&utm_medium=social&utm_campaign=oa-2026&utm_content=eb-test';
    await page.goto(utmUrl);
    const stored = await page.evaluate(() => sessionStorage.getItem('mybcat_contact_utm'));
    expect(JSON.parse(stored || '{}')).toEqual({
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'oa-2026',
      utm_content: 'eb-test',
    });

    await fillContactForm(page);
    const requestPromise = page.waitForRequest((request) => (
      request.url().includes('/api/forms/lead') && request.method() === 'POST'
    ));
    await page.locator('#cf-submit').click();
    const request = await requestPromise;
    expect(request.headers()['x-forms-token']).toBeFalsy();

    await expect(page.locator('#post-submit-state')).toBeVisible();
    const eventNames = posthog.events.map((item) => item.event);
    expect(eventNames).toContain('contact_form_submitted');
    expect(eventNames).toContain('booking_calendar_shown');
    expect(eventNames).not.toContain('discovery_call_scheduled');
    const submitted = posthog.events.find((item) => item.event === 'contact_form_submitted');
    expect(submitted?.props).toMatchObject({
      source: 'contact_page',
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'oa-2026',
      utm_content: 'eb-test',
    });
  });

  test('reuses first-touch UTMs from sessionStorage when the query string is gone', async ({ page }) => {
    await stubPosthog(page);
    await page.route('**/api/forms/lead', async (route) => {
      const body = route.request().postDataJSON() as LeadBody;
      const fields = fieldsByName(body);
      expect(fields.utm_source).toBe('linkedin');
      expect(fields.utm_medium).toBe('social');
      expect(fields.utm_campaign).toBe('oa-2026');
      expect(fields.utm_content).toBe('eb-test');
      expect(body.context?.utm).toEqual({
        utm_source: 'linkedin',
        utm_medium: 'social',
        utm_campaign: 'oa-2026',
        utm_content: 'eb-test',
      });
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
    });

    await page.goto('/contact/?utm_source=linkedin&utm_medium=social&utm_campaign=oa-2026&utm_content=eb-test');
    await page.goto('/contact/');
    const stored = await page.evaluate(() => sessionStorage.getItem('mybcat_contact_utm'));
    expect(JSON.parse(stored || '{}')).toEqual({
      utm_source: 'linkedin',
      utm_medium: 'social',
      utm_campaign: 'oa-2026',
      utm_content: 'eb-test',
    });

    await fillContactForm(page);
    const requestPromise = page.waitForRequest((request) => (
      request.url().includes('/api/forms/lead') && request.method() === 'POST'
    ));
    await page.locator('#cf-submit').click();
    await requestPromise;
  });
});
