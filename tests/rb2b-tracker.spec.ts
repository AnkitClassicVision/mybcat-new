import { test, expect } from '@playwright/test';

const RB2B_SNIPPET = `!function(b){if(!window.reb2b){window.reb2b={loaded:!0};var a=document.createElement("script");a.async=!0;a.src="https://b2bjsstore.s3.us-west-2.amazonaws.com/b/"+b+"/"+b+".js.gz";document.getElementsByTagName("script")[0].parentNode.insertBefore(a,document.getElementsByTagName("script")[0])}}("46DJ4HGGQL61");`;

test.describe('RB2B tracker', () => {
  test('does not load the RB2B script when the GTM snippet runs', async ({ page }) => {
    const rb2bRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes('b2bjsstore') || url.includes('reb2b')) {
        rb2bRequests.push(url);
      }
    });

    await page.goto('/');
    await page.evaluate((snippet) => {
      const script = document.createElement('script');
      script.textContent = snippet;
      document.body.appendChild(script);
    }, RB2B_SNIPPET);

    await page.waitForTimeout(1000);

    const injected = await page.locator('script[src*="b2bjsstore"], script[src*="reb2b"]').count();
    expect(injected).toBe(0);
    expect(rb2bRequests).toEqual([]);
  });
});
