Part D: Structured Data Strategy
Schema Types by Page Type
Page TypeSchema TypesPriorityHomepageOrganization, WebSite, BreadcrumbListHighSolution PagesService, BreadcrumbList, FAQPageHighIndustry PagesService, BreadcrumbList, FAQPageHighComparison PagesBreadcrumbList, FAQPageMediumPricingBreadcrumbListMediumBlog PostsArticle, BreadcrumbList, FAQPage (if applicable)HighCase StudiesArticle, BreadcrumbListMediumFAQ HubFAQPage, BreadcrumbListHighGlossary TermsBreadcrumbListLowAboutOrganization, BreadcrumbListMedium
JSON-LD Implementation Examples
Organization (Homepage):
json{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "mybcat",
  "alternateName": "My Business Care Team",
  "url": "https://mybcat.com",
  "logo": "https://mybcat.com/images/logo.png",
  "description": "Remote patient acquisition and front-office operations platform for healthcare practices",
  "telephone": "+1-XXX-XXX-XXXX",
  "email": "hello@mybcat.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Minneapolis",
    "addressRegion": "MN",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://www.linkedin.com/company/mybcat",
    "https://twitter.com/mybcat"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-XXX-XXX-XXXX",
    "contactType": "sales",
    "availableLanguage": ["English"]
  }
}
WebSite (Homepage):
json{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "mybcat",
  "url": "https://mybcat.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://mybcat.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
BreadcrumbList (All Pages):
json{
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
Service (Solution/Industry Pages):
json{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Patient Intake and Scheduling",
  "provider": {
    "@type": "Organization",
    "name": "mybcat"
  },
  "areaServed": {
    "@type": "Country",
    "name": "United States"
  },
  "description": "Managed patient intake service that ensures 100% of patient calls are answered and scheduled professionally.",
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Patient Acquisition Services",
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
      }
    ]
  }
}
Article (Blog Posts):
json{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Reduce No-Shows at Your Medical Practice: 10 Proven Strategies",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://mybcat.com/about/team/author-name"
  },
  "datePublished": "2025-12-19",
  "dateModified": "2025-12-19",
  "publisher": {
    "@type": "Organization",
    "name": "mybcat",
    "logo": {
      "@type": "ImageObject",
      "url": "https://mybcat.com/images/logo.png"
    }
  },
  "image": "https://mybcat.com/images/blog/no-shows-featured.jpg",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://mybcat.com/blog/reduce-no-shows-medical-practice/"
  }
}
FAQPage:
json{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is mybcat HIPAA compliant?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, mybcat is fully HIPAA compliant. All patient coordinators complete HIPAA training, and we sign Business Associate Agreements (BAAs) with every client. Our systems use encrypted communications and secure data handling protocols."
      }
    },
    {
      "@type": "Question",
      "name": "How quickly can mybcat start handling our calls?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most practices are fully onboarded within 2-3 weeks. This includes EHR/PMS integration setup, training on your specific protocols, and a soft launch period to ensure quality."
      }
    }
  ]
}
Compliance Guidelines

Content Match: Schema data must accurately reflect visible page content Google
Freshness: Update dateModified when content changes
One Schema per Type: Avoid duplicate Organization schemas across pages
Validation: Test all schema with Google Rich Results Test before deployment
Placement: JSON-LD in <head> section (preferred) or at end of <body>
No Spam: Never mark up content users can't see