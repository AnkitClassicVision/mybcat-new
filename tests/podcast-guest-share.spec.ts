import { test, expect } from '@playwright/test';

const PAGE_PATH = '/resources/podcast/share/why-your-frame-turn-is-lying-to-you/';
const SECTION_IDS = ['linkedin', 'x', 'facebook', 'instagram', 'tiktok', 'youtube'];

test.describe('Podcast guest share page', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'Clipboard QA runs in Chromium');

  test('is noindex, hidden from chrome, and copy buttons work', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(PAGE_PATH);

    await expect(page).toHaveTitle('Copy your posts · Why Your Frame Turn Is Lying to You');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
    await expect(page.locator('nav')).toHaveCount(0);
    await expect(page.locator('h1')).toContainText('Why Your Frame Turn');
    await expect(page.locator('.copy-btn')).toHaveCount(6);
    await expect(page.locator('.post-btn')).toHaveCount(6);
    await expect(page.locator('.copy-btn').first()).toHaveCSS('background-color', 'rgb(34, 118, 145)');
    await expect(page.locator('.post-btn').first()).toHaveCSS('background-color', 'rgb(34, 118, 145)');

    for (const id of SECTION_IDS) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
      await page.goto(`${PAGE_PATH}#${id}`);
      expect(new URL(page.url()).hash).toBe(`#${id}`);
    }

    const copyButton = page.locator('[data-copy="post-linkedin"]');
    await copyButton.click();
    await expect(copyButton).toHaveText('Copied!');
    await expect(copyButton).toHaveClass(/copied/);

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('My episode of Optometrists Building Empires is live');
    expect(clipboardText).toContain(
      'https://buildingempires.live/episodes/why-your-frame-turn-is-lying-to-you'
    );
  });

  test('is left out of the sitemap and has no nav links on the public site', async ({ page, request }) => {
    const sitemap = await request.get('/sitemap-0.xml');
    expect(sitemap.ok()).toBeTruthy();
    const sitemapXml = await sitemap.text();
    expect(sitemapXml).not.toContain('/resources/podcast/share/');

    await page.goto('/');
    await expect(page.locator(`a[href*="/resources/podcast/share/"]`)).toHaveCount(0);
  });

  test('every link on the page resolves', async ({ page, request }) => {
    await page.goto(PAGE_PATH);
    const hrefs = await page.locator('a[href]').evaluateAll((anchors) =>
      [...new Set(anchors.map((anchor) => (anchor as HTMLAnchorElement).href))]
    );

    expect(hrefs.length).toBeGreaterThan(0);

    const authWallHosts = new Set([
      'linkedin.com',
      'www.linkedin.com',
      'facebook.com',
      'www.facebook.com',
      'x.com',
      'twitter.com'
    ]);

    const failures: string[] = [];
    for (const href of hrefs) {
      const response = await request.get(href, {
        maxRedirects: 5,
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const status = response.status();
      const host = new URL(href).hostname;
      const authWall = authWallHosts.has(host);
      const ok =
        (status >= 200 && status < 400) ||
        (authWall && (status === 400 || status === 401 || status === 403));
      if (!ok) {
        failures.push(`${href} -> ${status}`);
      }
    }

    expect(failures, failures.join('\n')).toEqual([]);
  });
});
