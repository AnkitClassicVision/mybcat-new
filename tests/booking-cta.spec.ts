import { test, expect } from '@playwright/test';

const discoveryHref = (page: string) =>
  `/book/discovery?utm_source=site&utm_content=${page}`;

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
    for (const link of await clickToBook.all()) {
      await expect(link).toHaveAttribute('href', discoveryHref('pricing'));
    }
    await expect(page.getByRole('link', { name: 'Book Your Call' })).toHaveAttribute(
      'href',
      discoveryHref('pricing')
    );
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
