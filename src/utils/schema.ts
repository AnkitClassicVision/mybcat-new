/**
 * JSON-LD Schema generators for structured data
 * Following specifications in 04-STRUCTURED-DATA.md
 */

import { company } from '@data/company';

// Types
interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface ArticleMeta {
  headline: string;
  description: string;
  image: string;
  author: string;
  authorUrl?: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  wordCount?: number;
  section?: string;
  keywords?: string[];
}

interface ServiceMeta {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}

/**
 * Organization schema for homepage
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${company.site.url}/#organization`,
    name: company.name,
    alternateName: company.shortName,
    url: company.site.url,
    logo: {
      '@type': 'ImageObject',
      url: `${company.site.url}/images/logo.png`,
      width: 300,
      height: 60
    },
    description: company.description,
    foundingDate: '2018',
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: company.address.city,
      addressRegion: company.address.state,
      postalCode: company.address.zip,
      addressCountry: company.address.country
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States'
    },
    sameAs: Object.values(company.social),
    knowsAbout: [
      'Patient acquisition',
      'Healthcare operations',
      'Medical practice management',
      'Remote patient coordination',
      'Healthcare call center services'
    ]
  };
}

/**
 * WebSite schema for homepage
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${company.site.url}/#website`,
    name: company.shortName,
    url: company.site.url,
    publisher: {
      '@id': `${company.site.url}/#organization`
    }
  };
}

/**
 * BreadcrumbList schema for all pages except homepage
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  const homeItem = { name: 'Home', url: company.site.url };
  const allItems = [homeItem, ...items];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && index < allItems.length - 1 && { item: item.url })
    }))
  };
}

/**
 * Service schema for solution and industry pages
 */
export function generateServiceSchema(meta: ServiceMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${meta.url}#service`,
    name: meta.name,
    description: meta.description,
    serviceType: meta.serviceType || 'Healthcare Call Answering',
    provider: {
      '@id': `${company.site.url}/#organization`
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States'
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Healthcare practices'
    }
  };
}

/**
 * FAQPage schema for FAQ sections
 */
export function generateFAQSchema(items: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

/**
 * Article schema for blog posts and case studies
 */
export function generateArticleSchema(meta: ArticleMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.headline,
    description: meta.description,
    image: meta.image.startsWith('http') ? meta.image : `${company.site.url}${meta.image}`,
    author: {
      '@type': 'Person',
      name: meta.author,
      ...(meta.authorUrl && { url: meta.authorUrl }),
      worksFor: {
        '@id': `${company.site.url}/#organization`
      }
    },
    publisher: {
      '@id': `${company.site.url}/#organization`
    },
    datePublished: meta.datePublished,
    dateModified: meta.dateModified || meta.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': meta.url
    },
    ...(meta.wordCount && { wordCount: meta.wordCount }),
    ...(meta.section && { articleSection: meta.section }),
    ...(meta.keywords && { keywords: meta.keywords.join(', ') })
  };
}

/**
 * Combine multiple schemas using @graph
 */
export function combineSchemas(...schemas: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map(schema => {
      const { '@context': _, ...rest } = schema as { '@context'?: string };
      return rest;
    })
  };
}

/**
 * Serialize schema to JSON string for embedding
 */
export function serializeSchema(schema: object): string {
  return JSON.stringify(schema, null, 0);
}
