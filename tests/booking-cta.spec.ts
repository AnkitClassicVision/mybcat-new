import { test, expect } from '@playwright/test';

const discoveryHref = (src: string) => `/book/discovery?src=${src}`;

test.describe('Discovery booking CTAs', () => {
  test('how-it-works schedule CTA points at discovery booking', async ({ page }) => {
    await page.goto('/how-it-works/');
    await expect(page.getByRole('link', { name: 'Schedule Discovery Call' })).toHaveAttribute(
      'href',
      discoveryHref('how-it-works')
    );
  });

  test('pricing discovery CTAs keep their labels and point at booking', async ({ page }) => {
    await page.goto('/pricing/');
    const clickToBook = page.getByRole('link', { name: 'Click to book' });
    await expect(clickToBook).toHaveCount(4);
    await expect(clickToBook.first()).toHaveAttribute('href', discoveryHref('pricing-callout'));
    for (const link of (await clickToBook.all()).slice(1)) {
      await expect(link).toHaveAttribute('href', discoveryHref('pricing-plans'));
    }
    await expect(page.getByRole('link', { name: 'Book Your Call' })).toHaveAttribute(
      'href',
      discoveryHref('pricing-cta')
    );
    await expect(page.locator('main a.hero-book')).toHaveAttribute('href', discoveryHref('pricing-hero'));
  });

  test('contact page adds a book button above the form', async ({ page }) => {
    await page.goto('/contact/');
    const bookNow = page.getByRole('link', { name: 'Book a 20-minute call now' });
    await expect(bookNow).toBeVisible();
    await expect(bookNow).toHaveAttribute('href', discoveryHref('contact'));
    await expect(page.getByText("Or send a note and we'll reply.")).toBeVisible();
    await expect(page.locator('#contact-form')).toBeVisible();

    const bookNowBox = await bookNow.boundingBox();
    const formBox = await page.locator('#contact-form').boundingBox();
    expect(bookNowBox && formBox && bookNowBox.y < formBox.y).toBeTruthy();
  });
});
