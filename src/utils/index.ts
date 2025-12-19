/**
 * Utilities barrel export
 * Import from '@utils' for easy access
 */

export {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateBreadcrumbSchema,
  generateServiceSchema,
  generateFAQSchema,
  generateArticleSchema,
  combineSchemas,
  serializeSchema
} from './schema';

export {
  generateTitle,
  formatDescription,
  generateCanonical,
  generateOGImage,
  generateSEOMeta,
  titleFormats,
  shouldIndex,
  getSitemapPriority
} from './seo';

export {
  formatDate,
  formatDateISO,
  formatRelativeDate,
  formatCurrency,
  formatNumber,
  formatPercentage,
  calculateReadingTime,
  formatReadingTime,
  truncateText,
  slugify,
  unslugify,
  getInitials,
  pluralize,
  formatPhone
} from './formatting';
