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
      url: `${company.site.url}/images/logo.webp`,
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
 * ProfessionalService/LocalBusiness schema for contact/about pages
 * More specific than Organization - indicates a service-based business
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
    logo: {
      '@type': 'ImageObject',
      url: `${company.site.url}/images/logo.webp`,
      width: 300,
      height: 60
    },
    image: `${company.site.url}/images/og-default.png`,
    address: {
      '@type': 'PostalAddress',
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
 * LocalBusiness schema for local SEO and GEO/AEO optimization
 * Important for Google Maps, local search, and AI search results
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
    logo: {
      '@type': 'ImageObject',
      url: `${company.site.url}/images/logo.webp`,
      width: 300,
      height: 60
    },
    image: `${company.site.url}/images/og-default.png`,
    address: {
      '@type': 'PostalAddress',
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
