# 04 — STRUCTURED DATA & SCHEMA REFERENCE

## Overview

This document provides complete JSON-LD schema markup for every page type on mybcat.com. Schema helps search engines understand page content and can trigger rich results in SERPs.

**Important:** As of 2023, Google restricts FAQ rich results to government and health authority sites. However, implementing FAQPage schema still helps AI systems understand content structure and may return in the future.

---

## Schema Types by Page Type

| Page Type | Required Schema | Optional Schema |
|-----------|-----------------|-----------------|
| Homepage | Organization, WebSite | FAQPage, LocalBusiness |
| Solution Pages | Service, BreadcrumbList | FAQPage |
| Industry Pages | Service, BreadcrumbList | FAQPage |
| Comparison Pages | BreadcrumbList | FAQPage |
| Pricing | BreadcrumbList | Offer |
| Blog Posts | Article, BreadcrumbList | FAQPage |
| Case Studies | Article, BreadcrumbList | — |
| FAQ Hub | FAQPage, BreadcrumbList | — |
| Glossary Terms | BreadcrumbList | DefinedTerm |
| About | Organization, BreadcrumbList | — |

---

## Organization Schema (Homepage)

Place in `<head>` of homepage only.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://mybcat.com/#organization",
  "name": "mybcat",
  "alternateName": "My Business Care Team",
  "url": "https://mybcat.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://mybcat.com/images/logo.png",
    "width": 300,
    "height": 60
  },
  "description": "Patient acquisition platform for healthcare practices. Combines trained coordinators, AI automation, and real-time analytics to ensure every patient call is answered and scheduled.",
  "foundingDate": "2018",
  "telephone": "+1-XXX-XXX-XXXX",
  "email": "hello@mybcat.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Street Address]",
    "addressLocality": "Marietta",
    "addressRegion": "GA",
    "postalCode": "30060",
    "addressCountry": "US"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "sameAs": [
    "https://www.linkedin.com/company/mybcat",
    "https://twitter.com/mybcat",
    "https://www.facebook.com/mybcat"
  ],
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+1-XXX-XXX-XXXX",
      "contactType": "sales",
      "availableLanguage": ["English"],
      "areaServed": "US"
    },
    {
      "@type": "ContactPoint",
      "telephone": "+1-XXX-XXX-XXXX",
      "contactType": "customer support",
      "availableLanguage": ["English"],
      "areaServed": "US"
    }
  ],
  "knowsAbout": [
    "Patient acquisition",
    "Healthcare operations",
    "Medical practice management",
    "Remote patient coordination",
    "Healthcare call center services"
  ]
}
```

---

## WebSite Schema (Homepage)

Place in `<head>` of homepage only, after Organization schema.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://mybcat.com/#website",
  "name": "mybcat",
  "url": "https://mybcat.com",
  "publisher": {
    "@id": "https://mybcat.com/#organization"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://mybcat.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

**Note:** Only include SearchAction if you implement site search. If no search exists, omit the potentialAction.

---

## BreadcrumbList Schema (All Pages Except Homepage)

Include on every page except homepage. Adjust items for actual page hierarchy.

### Example: Industry Page

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://mybcat.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Industries",
      "item": "https://mybcat.com/industries/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Optometry"
    }
  ]
}
```

### Example: Blog Post

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://mybcat.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://mybcat.com/blog/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "How to Reduce No-Shows at Your Medical Practice"
    }
  ]
}
```

**Rules:**
- Last item should NOT have an "item" property (it's the current page)
- Position starts at 1
- Use exact page titles for "name" values

---

## Service Schema (Solution & Industry Pages)

Use on solution pages and industry pages to describe the service offered.

### Example: Patient Intake Service Page

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://mybcat.com/solutions/patient-intake/#service",
  "name": "Patient Intake & Scheduling Service",
  "serviceType": "Healthcare Call Answering",
  "description": "Managed patient intake service that ensures every call is answered by a trained healthcare coordinator who books appointments directly into your EHR. We handle inbound calls, schedule appointments, collect patient information, and verify insurance.",
  "provider": {
    "@id": "https://mybcat.com/#organization"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Healthcare practices"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Patient Intake Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Inbound Call Management"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Appointment Scheduling"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Patient Information Collection"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Insurance Verification"
        }
      }
    ]
  }
}
```

### Example: Industry Page (Optometry)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://mybcat.com/industries/optometry/#service",
  "name": "Optometry Patient Acquisition Services",
  "serviceType": "Healthcare Call Answering for Optometry",
  "description": "Patient acquisition and intake services specifically for optometry practices. We handle patient calls, book comprehensive exams, manage recall campaigns, and integrate with Eyefinity, RevolutionEHR, and other optometry practice management systems.",
  "provider": {
    "@id": "https://mybcat.com/#organization"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "audience": {
    "@type": "Audience",
    "audienceType": "Optometry practices, Eye care practices, Ophthalmology practices"
  },
  "category": "Healthcare BPO Services"
}
```

---

## FAQPage Schema

Use on FAQ hub and any page with FAQ sections. Note: Rich results currently restricted but still valuable for AI understanding.

### Example: FAQ Hub

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is mybcat HIPAA compliant?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, mybcat is fully HIPAA compliant. All patient coordinators complete annual HIPAA training, and we sign Business Associate Agreements (BAAs) with every client. Our systems use encrypted communications and secure data handling protocols."
      }
    },
    {
      "@type": "Question",
      "name": "How quickly can mybcat start handling our calls?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most practices are fully onboarded within 2-3 weeks. This includes EHR/PMS integration setup, training on your specific protocols, and a soft launch period to ensure quality."
      }
    },
    {
      "@type": "Question",
      "name": "What EHR/PMS systems does mybcat integrate with?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "mybcat integrates with most major healthcare practice management systems including Eyefinity, RevolutionEHR, Dentrix, Eaglesoft, ModMed, AdvancedMD, and many others. We work directly in your system just like your in-house staff would."
      }
    },
    {
      "@type": "Question",
      "name": "How much does mybcat cost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "mybcat uses outcome-based pricing rather than hourly billing. Costs vary based on call volume and services selected. Most practices see positive ROI within the first month. Contact us for a custom quote based on your practice's needs."
      }
    },
    {
      "@type": "Question",
      "name": "Can I try mybcat before committing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, we offer a pilot program so you can see results before making a long-term commitment. During the pilot, we track key metrics like call answer rate, booking rate, and patient feedback to demonstrate value."
      }
    }
  ]
}
```

### Inline FAQ on Other Pages

When adding FAQ sections to solution/industry/comparison pages, include FAQPage schema with only those page-specific questions:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Does mybcat work with Eyefinity?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, mybcat integrates seamlessly with Eyefinity. Our patient coordinators work directly in your Eyefinity system to view availability, book appointments, and access patient records just like your in-house staff."
      }
    },
    {
      "@type": "Question",
      "name": "Can mybcat handle contact lens orders?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our optometry-trained coordinators can assist patients with contact lens reorders and direct them to your optical department for new purchases. We follow your specific protocols for handling optical inquiries."
      }
    }
  ]
}
```

---

## Article Schema (Blog Posts & Case Studies)

### Blog Post Example

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Reduce No-Shows at Your Medical Practice: 10 Proven Strategies",
  "description": "Reduce no-shows at your medical practice with these 10 proven strategies including confirmation calls, automated reminders, and same-day rebooking techniques.",
  "image": {
    "@type": "ImageObject",
    "url": "https://mybcat.com/images/blog/no-shows-featured.jpg",
    "width": 1200,
    "height": 630
  },
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://mybcat.com/about/team/author-name/",
    "jobTitle": "Director of Operations",
    "worksFor": {
      "@id": "https://mybcat.com/#organization"
    }
  },
  "publisher": {
    "@id": "https://mybcat.com/#organization"
  },
  "datePublished": "2025-01-15T08:00:00-05:00",
  "dateModified": "2025-01-20T10:30:00-05:00",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://mybcat.com/blog/reduce-no-shows-medical-practice/"
  },
  "wordCount": 2500,
  "articleSection": "Operations",
  "keywords": ["no-shows", "medical practice", "patient scheduling", "appointment reminders"]
}
```

### Case Study Example

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How Vision Plus Optometry Increased Booked Appointments by 42%",
  "description": "Case study: Vision Plus Optometry partnered with mybcat to solve their missed call problem. Results: 100% call answer rate and 42% increase in booked appointments.",
  "image": "https://mybcat.com/images/case-studies/vision-plus.jpg",
  "author": {
    "@type": "Organization",
    "@id": "https://mybcat.com/#organization"
  },
  "publisher": {
    "@id": "https://mybcat.com/#organization"
  },
  "datePublished": "2024-11-01T08:00:00-05:00",
  "dateModified": "2024-11-01T08:00:00-05:00",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://mybcat.com/case-studies/vision-plus/"
  },
  "about": {
    "@type": "Organization",
    "name": "Vision Plus Optometry",
    "description": "Multi-location optometry practice"
  }
}
```

---

## DefinedTerm Schema (Glossary Terms)

Optional but helpful for glossary pages:

```json
{
  "@context": "https://schema.org",
  "@type": "DefinedTerm",
  "name": "Patient Acquisition",
  "description": "The process of attracting new patients to a healthcare practice through marketing, referrals, and operational excellence.",
  "inDefinedTermSet": {
    "@type": "DefinedTermSet",
    "name": "mybcat Healthcare Glossary",
    "url": "https://mybcat.com/glossary/"
  }
}
```

---

## Combining Multiple Schemas

When a page needs multiple schema types, combine them in an array:

```json
[
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [...]
  },
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "...",
    ...
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [...]
  }
]
```

Or use `@graph` syntax (preferred for complex pages):

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "itemListElement": [...]
    },
    {
      "@type": "Service",
      "name": "...",
      ...
    },
    {
      "@type": "FAQPage",
      "mainEntity": [...]
    }
  ]
}
```

---

## Astro Implementation

Create a schema utility file to generate JSON-LD:

### `src/utils/schema.ts`

```typescript
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
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://mybcat.com/#organization",
    name: "mybcat",
    alternateName: "My Business Care Team",
    url: "https://mybcat.com",
    logo: {
      "@type": "ImageObject",
      url: "https://mybcat.com/images/logo.png",
      width: 300,
      height: 60,
    },
    description: "Patient acquisition platform for healthcare practices.",
    telephone: "+1-XXX-XXX-XXXX",
    email: "hello@mybcat.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Marietta",
      addressRegion: "GA",
      postalCode: "30060",
      addressCountry: "US",
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
  };
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://mybcat.com/#website",
    name: "mybcat",
    url: "https://mybcat.com",
    publisher: {
      "@id": "https://mybcat.com/#organization",
    },
  };
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };
}

export function generateServiceSchema(
  name: string,
  description: string,
  serviceType: string,
  url: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    description,
    serviceType,
    provider: {
      "@id": "https://mybcat.com/#organization",
    },
    areaServed: {
      "@type": "Country",
      name: "United States",
    },
  };
}

export function generateFAQSchema(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function generateArticleSchema(meta: ArticleMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.headline,
    description: meta.description,
    image: meta.image,
    author: {
      "@type": "Person",
      name: meta.author,
      ...(meta.authorUrl && { url: meta.authorUrl }),
    },
    publisher: {
      "@id": "https://mybcat.com/#organization",
    },
    datePublished: meta.datePublished,
    dateModified: meta.dateModified || meta.datePublished,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": meta.url,
    },
    ...(meta.wordCount && { wordCount: meta.wordCount }),
    ...(meta.section && { articleSection: meta.section }),
  };
}

// Combine multiple schemas into @graph format
export function combineSchemas(...schemas: object[]) {
  return {
    "@context": "https://schema.org",
    "@graph": schemas.map(({ "@context": _, ...rest }) => rest),
  };
}
```

### Usage in Astro Component

```astro
---
import {
  generateBreadcrumbSchema,
  generateServiceSchema,
  generateFAQSchema,
  combineSchemas
} from '../utils/schema';

const breadcrumbs = [
  { name: "Home", url: "https://mybcat.com/" },
  { name: "Solutions", url: "https://mybcat.com/solutions/" },
  { name: "Patient Intake" }
];

const faqs = [
  { question: "How quickly can we get started?", answer: "Most practices are fully onboarded within 2-3 weeks." },
  { question: "Is mybcat HIPAA compliant?", answer: "Yes, mybcat is fully HIPAA compliant with BAAs for every client." }
];

const schema = combineSchemas(
  generateBreadcrumbSchema(breadcrumbs),
  generateServiceSchema(
    "Patient Intake & Scheduling Service",
    "Managed patient intake service ensuring every call is answered.",
    "Healthcare Call Answering",
    "https://mybcat.com/solutions/patient-intake/"
  ),
  generateFAQSchema(faqs)
);
---

<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

---

## Validation & Compliance

### Testing Tools

1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Schema.org Validator**: https://validator.schema.org/
3. **Google Search Console**: Enhancements reports

### Compliance Rules

1. **Content Match**: Schema must accurately reflect visible page content
2. **No Hidden Content**: Don't mark up content users can't see
3. **One Organization**: Only include Organization schema on homepage
4. **Fresh Dates**: Update `dateModified` when content actually changes
5. **Real Authors**: Use actual author names with real credentials
6. **No Spam**: Don't include keywords not present on the page
7. **Accurate Addresses**: Use real, verifiable business address

### Common Mistakes to Avoid

❌ **Don't** include Organization schema on every page (only homepage)
❌ **Don't** use fake or placeholder author names
❌ **Don't** mark up hidden FAQ content
❌ **Don't** use dateModified without actual content changes
❌ **Don't** duplicate @id values across pages
❌ **Don't** include schema for content that doesn't exist on the page

### CI Validation

Add schema validation to CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Validate Schema
  run: |
    npm install -g schema-validator-cli
    find ./dist -name "*.html" -exec sh -c '
      schema-validator-cli validate --file "$1"
    ' _ {} \;
```

---

## Quick Reference: Schema per Page

| Page | Schema Types |
|------|-------------|
| `/` | Organization, WebSite, FAQPage |
| `/solutions/*` | BreadcrumbList, Service, FAQPage |
| `/industries/*` | BreadcrumbList, Service, FAQPage |
| `/compare/*` | BreadcrumbList, FAQPage |
| `/pricing/` | BreadcrumbList |
| `/blog/*` | BreadcrumbList, Article, FAQPage (optional) |
| `/case-studies/*` | BreadcrumbList, Article |
| `/faq/` | BreadcrumbList, FAQPage |
| `/glossary/*` | BreadcrumbList, DefinedTerm (optional) |
| `/about/` | BreadcrumbList, Organization reference |
| `/security/` | BreadcrumbList |
