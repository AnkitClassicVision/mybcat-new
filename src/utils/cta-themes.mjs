/**
 * Allowed values for the blog `ctaTheme` frontmatter field. Each needs a variant in
 * src/data/blog-ctas.ts. Plain JavaScript so the unit tests can check the list.
 */
export const CTA_THEMES = /** @type {const} */ ([
  'recall_fill_book',
  'finances_selling',
  'finance_open',
  'finance_profit',
  'finance_seller',
  'finance_service',
  'acquisition_transition',
  'operations',
  'default',
]);
