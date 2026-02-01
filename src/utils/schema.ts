/**
 * JSON-LD Schema generators for structured data
 * Following specifications in 04-STRUCTURED-DATA.md
 */

import { company } from '@data/company';
import { solutions } from '@data/solutions';

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

interface ReviewItem {
  author: string;
  reviewBody: string;
  datePublished?: string;
}

interface AggregateRatingMeta {
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
  ratingCount: number;
  reviews?: ReviewItem[];
}

/**
 * Generate OfferCatalog with all healthcare services
 * Used in Organization schema to advertise services offered
 */
function generateServicesOfferCatalog() {
  const serviceOffers = solutions.map(solution => ({
    '@type': 'Offer',
    itemOffered: {
      '@type': 'Service',
      '@id': `${company.site.url}/solutions/${solution.slug}/#service`,
      name: solution.name,
      description: solution.description,
      serviceType: solution.serviceType,
      provider: {
        '@id': `${company.site.url}/#organization`
      },
      areaServed: {
        '@type': 'Country',
        name: 'United States'
      },
      url: `${company.site.url}/solutions/${solution.slug}/`
    }
  }));

  return {
    '@type': 'OfferCatalog',
    name: 'Healthcare Operations Services',
    itemListElement: serviceOffers
  };
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
    logo: `${company.site.url}/images/logo.webp`,
    description: company.description,
    foundingDate: '2018',
    // Email omitted - contact form used instead
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.address.street,
      addressLocality: company.address.city,
      addressRegion: company.address.state,
      postalCode: company.address.zip,
      addressCountry: company.address.country
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States'
    },
    // ContactPoint for organizations using web-based contact
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: `${company.site.url}/contact/`,
      availableLanguage: ['English', 'Spanish']
    },
    sameAs: Object.values(company.social),
    knowsAbout: [
      'Healthcare Practice Operations',
      'Multi-Location Practice Management',
      'Enterprise Patient Access',
      'Medical Administrative Outsourcing',
      'Healthcare BPO Services',
      'Patient Intake Automation',
      'HIPAA Compliant Services',
      'Healthcare Technology Integration'
    ],
    // Service catalog listing all healthcare services offered
    hasOfferCatalog: generateServicesOfferCatalog()
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
 * Normalize a URL to be absolute (prepend site URL if relative)
 */
function normalizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  // If already absolute, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Prepend site URL to relative paths
  const baseUrl = company.site.url;
  // Handle paths with or without leading slash
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${path}`;
}

/**
 * BreadcrumbList schema for all pages except homepage
 * Generates JSON-LD structured data for breadcrumb navigation
 *
 * @example
 * // For a blog post: Home > Blog > Post Title
 * generateBreadcrumbSchema([
 *   { name: 'Blog', url: '/blog/' },
 *   { name: 'How to Reduce No-Shows' }
 * ])
 *
 * @example
 * // For a solution page: Home > Solutions > Medical Answering Service
 * generateBreadcrumbSchema([
 *   { name: 'Solutions', url: '/solutions/' },
 *   { name: 'Medical Answering Service' }
 * ])
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  const homeItem = { name: 'Home', url: company.site.url };

  // Skip adding Home if it's already the first item (prevents "Home > Home" duplication)
  let allItems: BreadcrumbItem[];
  if (items[0]?.name === 'Home') {
    // Normalize the Home URL to full site URL
    allItems = [{ ...items[0], url: company.site.url }, ...items.slice(1)];
  } else {
    allItems = [homeItem, ...items];
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => {
      const isLastItem = index === allItems.length - 1;
      const normalizedUrl = normalizeUrl(item.url);

      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        // Only include 'item' URL for non-last items that have a URL
        ...(normalizedUrl && !isLastItem && { item: normalizedUrl })
      };
    })
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
    audience: [
      {
        '@type': 'Audience',
        audienceType: 'Enterprise Healthcare Groups'
      },
      {
        '@type': 'Audience',
        audienceType: 'Dental Service Organizations (DSOs)'
      },
      {
        '@type': 'Audience',
        audienceType: 'Multi-Location Healthcare Practices'
      }
    ]
  };
}

/**
 * AggregateRating schema for reviews/testimonials section
 * Supports the "70+ Healthcare Professionals" claim with structured data
 */
export function generateAggregateRatingSchema(meta: AggregateRatingMeta) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${company.site.url}/#organization`,
    name: company.name,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: meta.ratingValue,
      bestRating: meta.bestRating || 5,
      worstRating: meta.worstRating || 1,
      ratingCount: meta.ratingCount
    }
  };

  // Add individual reviews if provided
  if (meta.reviews && meta.reviews.length > 0) {
    schema.review = meta.reviews.map(review => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author
      },
      reviewBody: review.reviewBody,
      reviewRating: {
        '@type': 'Rating',
        ratingValue: 5,
        bestRating: 5,
        worstRating: 1
      },
      ...(review.datePublished && { datePublished: review.datePublished })
    }));
  }

  return schema;
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
    url: meta.url,
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
 * Preserves @context in each item for broader validator compatibility
 */
export function combineSchemas(...schemas: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map(schema => {
      // Keep @context in each item for validators that check independently
      const schemaObj = schema as { '@context'?: string };
      if (!schemaObj['@context']) {
        return { '@context': 'https://schema.org', ...schema };
      }
      return schema;
    })
  };
}

/**
 * @deprecated Use generateOrganizationSchema() instead for enterprise B2B positioning.
 * ProfessionalService schema with geo coordinates is inappropriate for national B2B positioning.
 * Retained temporarily for reference during migration.
 */
export function generateProfessionalServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${company.site.url}/#business`,
    name: company.name,
    alternateName: company.shortName,
    description: company.description,
    url: company.site.url,
    logo: `${company.site.url}/images/logo.webp`,
    image: `${company.site.url}/images/og-about.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1140 Hammond Drive',
      addressLocality: company.address.city,
      addressRegion: company.address.state,
      postalCode: company.address.zip,
      addressCountry: company.address.country
    },
    geo: {
      '@type': 'GeoCoordinates',
      // Marietta, GA coordinates
      latitude: 33.9526,
      longitude: -84.5499
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States'
    },
    // Use single serviceType string for better schema validation
    serviceType: 'Healthcare Call Answering Service',
    priceRange: '$$',
    sameAs: Object.values(company.social),
    // ContactPoint for businesses without a public phone number
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: `${company.site.url}/contact/`,
      availableLanguage: ['English', 'Spanish']
    },
    parentOrganization: {
      '@type': 'Organization',
      name: company.ownership.parent
    },
    founder: {
      '@type': 'Person',
      name: company.ownership.founder,
      jobTitle: company.ownership.founderTitle,
      url: `${company.site.url}/author/ankit-patel/`
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00'
      }
    ],
    knowsAbout: [
      'Healthcare Operations',
      'Medical Practice Management',
      'Patient Acquisition',
      'Healthcare Call Center Services',
      'HIPAA Compliant Services',
      'Medical Virtual Assistants'
    ]
  };
}

/**
 * @deprecated Use generateOrganizationSchema() instead for enterprise B2B positioning.
 * LocalBusiness schema with geo coordinates is inappropriate for national B2B positioning.
 * Retained temporarily for reference during migration.
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${company.site.url}/#localbusiness`,
    name: company.name,
    alternateName: company.shortName,
    description: company.description,
    url: company.site.url,
    logo: `${company.site.url}/images/logo.webp`,
    image: `${company.site.url}/images/og-home.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1140 Hammond Drive',
      addressLocality: company.address.city,
      addressRegion: company.address.state,
      postalCode: company.address.zip,
      addressCountry: company.address.country
    },
    geo: {
      '@type': 'GeoCoordinates',
      // Marietta, GA coordinates
      latitude: 33.9526,
      longitude: -84.5499
    },
    areaServed: {
      '@type': 'Country',
      name: 'United States'
    },
    serviceArea: {
      '@type': 'Country',
      name: 'United States'
    },
    priceRange: '$$',
    sameAs: Object.values(company.social),
    founder: {
      '@type': 'Person',
      name: company.ownership.founder,
      jobTitle: company.ownership.founderTitle,
      url: `${company.site.url}/author/ankit-patel/`
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00'
      }
    ],
    knowsAbout: [
      'Healthcare Operations',
      'Medical Practice Management',
      'Patient Acquisition',
      'Healthcare Call Center Services',
      'HIPAA Compliant Services',
      'Medical Virtual Assistants'
    ]
  };
}

/**
 * Person schema for author pages - critical for E-A-T signals
 */
export function generatePersonSchema(person: {
  name: string;
  givenName?: string;
  familyName?: string;
  jobTitle: string;
  description: string;
  image: string;
  url: string;
  sameAs?: string[];
  knowsAbout?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${person.url}#person`,
    name: person.name,
    ...(person.givenName && { givenName: person.givenName }),
    ...(person.familyName && { familyName: person.familyName }),
    jobTitle: person.jobTitle,
    description: person.description,
    image: person.image.startsWith('http') ? person.image : `${company.site.url}${person.image}`,
    url: person.url,
    ...(person.sameAs && { sameAs: person.sameAs }),
    worksFor: {
      '@type': 'Organization',
      '@id': `${company.site.url}/#organization`,
      name: company.name
    },
    ...(person.knowsAbout && { knowsAbout: person.knowsAbout })
  };
}

/**
 * Serialize schema to JSON string for embedding
 */
export function serializeSchema(schema: object): string {
  return JSON.stringify(schema, null, 0);
}
