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

interface ReviewedByPerson {
  name: string;
  url?: string;
  credential?: string;
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
  reviewedBy?: ReviewedByPerson;
}

interface ServiceMeta {
  name: string;
  description: string;
  url: string;
  serviceType?: string;
}

interface HowToStep {
  name: string;
  text: string;
  url?: string;
  image?: string;
}

interface HowToMeta {
  name: string;
  description: string;
  totalTime?: string; // ISO 8601 duration format, e.g., "P1W" for 1 week
  estimatedCost?: {
    value: string;
    currency: string;
  };
  steps: HowToStep[];
  image?: string;
  url?: string;
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
    telephone: company.phone,
    email: company.email,
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
      telephone: company.phone,
      email: company.email,
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
export function generateBreadcrumbSchema(items: BreadcrumbItem[], currentUrl?: string) {
  const homeItem = { name: 'Home', url: company.site.url };

  // Skip adding Home if it's already the first item (prevents "Home > Home" duplication)
  let allItems: BreadcrumbItem[];
  if (items[0]?.name === 'Home') {
    // Normalize the Home URL to full site URL
    allItems = [{ ...items[0], url: company.site.url }, ...items.slice(1)];
  } else {
    allItems = [homeItem, ...items];
  }

  const normalizedCurrentUrl = normalizeUrl(currentUrl);

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: allItems.map((item, index) => {
      const isLastItem = index === allItems.length - 1;
      const normalizedUrl = normalizeUrl(item.url);
      const itemUrl = normalizedUrl || (isLastItem ? normalizedCurrentUrl : undefined);

      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        // Include `item` for every crumb (including the current page) to satisfy common validators.
        ...(itemUrl && { item: itemUrl })
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
 * HowTo schema for step-by-step process pages
 * Used for onboarding flows, implementation guides, etc.
 */
export function generateHowToSchema(meta: HowToMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: meta.name,
    description: meta.description,
    ...(meta.totalTime && { totalTime: meta.totalTime }),
    ...(meta.estimatedCost && {
      estimatedCost: {
        '@type': 'MonetaryAmount',
        value: meta.estimatedCost.value,
        currency: meta.estimatedCost.currency
      }
    }),
    ...(meta.image && { image: meta.image.startsWith('http') ? meta.image : `${company.site.url}${meta.image}` }),
    ...(meta.url && { url: meta.url }),
    step: meta.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: step.url }),
      ...(step.image && { image: step.image.startsWith('http') ? step.image : `${company.site.url}${step.image}` })
    }))
  };
}

/**
 * Article schema for blog posts and case studies
 * Publisher is expanded inline to ensure search engines can resolve it
 * even when crawling individual blog posts without the homepage
 */
export function generateArticleSchema(meta: ArticleMeta) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${meta.url}#article`,
    headline: meta.headline,
    description: meta.description,
    image: meta.image.startsWith('http') ? meta.image : `${company.site.url}${meta.image}`,
    url: meta.url,
    author: {
      '@type': 'Person',
      name: meta.author,
      ...(meta.authorUrl && { url: meta.authorUrl }),
      worksFor: {
        '@type': 'Organization',
        '@id': `${company.site.url}/#organization`,
        name: company.name
      }
    },
    publisher: {
      '@type': 'Organization',
      '@id': `${company.site.url}/#organization`,
      name: company.name,
      logo: {
        '@type': 'ImageObject',
        url: `${company.site.url}/images/logo.webp`
      }
    },
    datePublished: meta.datePublished,
    dateModified: meta.dateModified || meta.datePublished,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': meta.url
    },
    ...(meta.wordCount && { wordCount: meta.wordCount }),
    ...(meta.section && { articleSection: meta.section }),
    ...(meta.keywords && { keywords: meta.keywords.join(', ') }),
    ...(meta.reviewedBy && {
      reviewedBy: {
        '@type': 'Person',
        name: meta.reviewedBy.name,
        ...(meta.reviewedBy.url && { url: meta.reviewedBy.url }),
        ...(meta.reviewedBy.credential && {
          hasCredential: {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'degree',
            name: meta.reviewedBy.credential
          }
        })
      }
    }),
    isPartOf: {
      '@type': 'Blog',
      '@id': `${company.site.url}/blog/#blog`,
      name: `${company.name} Blog`,
      publisher: {
        '@id': `${company.site.url}/#organization`
      }
    }
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
 * PodcastSeries schema for the podcast page
 */
export function generatePodcastSeriesSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'PodcastSeries',
    '@id': `${company.site.url}/resources/podcast/#podcastseries`,
    name: 'Optometrists Building Empires',
    description: 'Weekly conversations with practice owners who are scaling, selling, and succeeding. Real stories from the trenches of multi-location optometry ownership.',
    url: 'https://buildingempires.live',
    webFeed: 'https://buildingempires.live',
    author: {
      '@type': 'Person',
      name: company.ownership.founder,
      jobTitle: company.ownership.founderTitle,
      url: `${company.site.url}/about/`,
      worksFor: {
        '@id': `${company.site.url}/#organization`
      }
    },
    productionCompany: {
      '@id': `${company.site.url}/#organization`
    },
    inLanguage: 'en-US',
    genre: ['Business', 'Healthcare', 'Optometry'],
    sameAs: [
      'https://podcasts.apple.com/us/podcast/optometrists-building-empires/id1762685070',
      'https://open.spotify.com/show/5w1H9BBwRXvBSSkexePYxG'
    ]
  };
}

/**
 * Book schema for the book page
 */
export function generateBookSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': `${company.site.url}/resources/book/#book`,
    name: 'Optometry Redefined: Master Global Resourcing for Peak Performance',
    author: {
      '@type': 'Person',
      name: company.ownership.founder,
      jobTitle: company.ownership.founderTitle,
      url: `${company.site.url}/about/`,
      worksFor: {
        '@id': `${company.site.url}/#organization`
      }
    },
    publisher: {
      '@id': `${company.site.url}/#organization`
    },
    description: 'The definitive playbook for practice owners seeking to scale without sacrificing margins, sanity, or patient experience. Drawing from operational systems at Classic Vision Care and multi-location practices nationwide.',
    url: `${company.site.url}/resources/book/`,
    bookFormat: 'https://schema.org/EBook',
    numberOfPages: 200,
    inLanguage: 'en-US',
    genre: ['Business', 'Healthcare Management', 'Optometry'],
    about: [
      'Healthcare Practice Operations',
      'Global Resourcing',
      'Multi-Location Practice Management',
      'Lean Six Sigma for Healthcare',
      'EBITDA Optimization'
    ],
    sameAs: [
      'https://www.amazon.com/Optometry-Redefined-Master-Resourcing-Performance-ebook/dp/B0FKK13S4Z/'
    ]
  };
}

/**
 * Serialize schema to JSON string for embedding
 */
export function serializeSchema(schema: object): string {
  return JSON.stringify(schema, null, 0);
}
