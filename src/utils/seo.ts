/**
 * SEO utility functions
 * Following specifications in 05-TECHNICAL-SEO.md
 */

import { company } from '@data/company';

interface SEOMeta {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  publishDate?: Date;
  modifiedDate?: Date;
  author?: string;
}

/**
 * Generate page title following format: [Primary Keyword] | mybcat
 */
export function generateTitle(title: string, suffix: boolean = true): string {
  if (!suffix) return title;
  return `${title} | ${company.shortName}`;
}

/**
 * Ensure description is within 150-160 characters
 */
export function formatDescription(description: string, maxLength: number = 160): string {
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength - 3).trim() + '...';
}

/**
 * Generate canonical URL with trailing slash
 */
export function generateCanonical(path: string): string {
  const baseUrl = company.site.url;
  let cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Ensure trailing slash
  if (!cleanPath.endsWith('/') && !cleanPath.includes('.')) {
    cleanPath += '/';
  }

  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate OG image URL
 */
export function generateOGImage(imagePath: string): string {
  if (imagePath.startsWith('http')) return imagePath;
  return `${company.site.url}${imagePath}`;
}

/**
 * Generate complete SEO meta object
 */
export function generateSEOMeta(options: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  publishDate?: Date;
  modifiedDate?: Date;
  author?: string;
}): SEOMeta {
  return {
    title: generateTitle(options.title),
    description: formatDescription(options.description),
    canonical: generateCanonical(options.path),
    ogImage: generateOGImage(options.ogImage || '/images/og-home.jpg'),
    ogType: options.ogType || 'website',
    noindex: options.noindex || false,
    publishDate: options.publishDate,
    modifiedDate: options.modifiedDate,
    author: options.author || company.ownership.founder
  };
}

/**
 * Page type specific title generators
 */
export const titleFormats = {
  home: () => `Patient Acquisition Platform for Healthcare | ${company.shortName}`,

  solution: (name: string) => `${name}: Never Miss Another Call | ${company.shortName}`,

  industry: (name: string) => `${name} Answering Service & Patient Intake | ${company.shortName}`,

  comparison: (competitor: string) => `${company.shortName} vs ${competitor}: Complete Comparison | ${company.shortName}`,

  blog: (title: string) => `${title} | ${company.shortName} Blog`,

  caseStudy: (client: string, result: string) => `${client}: ${result} | ${company.shortName}`,

  pricing: () => `Pricing & Plans | ${company.shortName}`,

  about: () => `About Us | ${company.shortName}`,

  contact: () => `Book a Demo | ${company.shortName}`,

  security: () => `Security & HIPAA Compliance | ${company.shortName}`
};

/**
 * Check if URL should be indexed
 */
export function shouldIndex(path: string): boolean {
  const noIndexPaths = [
    '/draft/',
    '/preview/',
    '/admin/',
    '/thank-you',
    '/confirmation'
  ];

  return !noIndexPaths.some(p => path.includes(p));
}

/**
 * Generate sitemap priority based on page type
 */
export function getSitemapPriority(path: string): number {
  if (path === '/') return 1.0;
  if (path.includes('/solutions/') || path.includes('/industries/')) return 0.9;
  if (path === '/pricing/') return 0.9;
  if (path.includes('/blog/')) return 0.8;
  if (path.includes('/compare/')) return 0.7;
  if (path.includes('/case-studies/')) return 0.7;
  if (path.includes('/faq/')) return 0.7;
  if (path.includes('/glossary/')) return 0.65;
  if (path.includes('/privacy') || path.includes('/terms') || path.includes('/gdpr')) return 0.3;
  return 0.6;
}
