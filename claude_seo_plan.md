# mybcat.com Website Restructuring Blueprint

## Executive Summary (10 Key Findings)

1. **mybcat.com has strong positioning** as a "managed patient acquisition system" (not hourly VA provider), but the current site architecture is chaotic with 50+ orphaned legacy pages creating duplicate content issues and diluted SEO authority.

2. **Primary competitors Hello Rache ($9.50/hr) and HireTeem ($11/hr)** position as hourly VA staffing services, while mybcat's outcome-based model ("we sell results, not hours") is a meaningful differentiator that requires clearer site communication.

3. **Optometry vertical dominance** - mybcat has deep optometry expertise but underserves expansion verticals (dental, veterinary, medspa, urgent care, ENT) with minimal dedicated content.

4. **Critical keyword opportunities exist** in niche vertical queries ("optometry answering service," "dental practice answering service") with medium competition, while head terms ("medical virtual assistant services") are highly competitive.

5. **SERP analysis reveals listicle content dominates** for "best" queries, specialty landing pages win for vertical queries, and problem-aware content ("reduce no-shows") favors numbered tip formats.

6. **Astro framework is recommended** for the rebuild - zero JavaScript by default delivers optimal Core Web Vitals (LCP <2.5s, CLS <0.1) with excellent MDX content authoring for the code-first workflow.

7. **FAQ schema rich results are restricted** to government/health authority sites only (Google 2023 policy), but implementing FAQPage schema still helps AI understanding and extraction.

8. **AI Overview optimization requires** 40-60 word "answer capsules" at the top of each section, Q&A heading structure, and ranking in top 10 organically (52% of AI citations come from top 10 results).

9. **Content gaps include** missing comparison pages vs competitors, no transparent pricing, limited case studies, no ROI calculator, and insufficient trust signals (certifications, compliance badges).

10. **30-day MVP** should prioritize homepage rebuild, 3 core service pages, 5 industry verticals (optometry, dental, veterinary, medspa, dermatology), and comparison content vs Hello Rache/HireTeem.

---

## Part A: Positioning-to-Structure Translation

### Product/Category Definition

**Product Category:** Remote Patient Acquisition & Front-Office Operations Platform

**Core Product Components:**
- Managed intake infrastructure (not hourly staffing)
- Trained live patient coordinators + AI automation hybrid
- Centralized multi-location dashboard
- Outcome guarantees (filled schedules, recovered revenue)

**Service Lines:**
1. **Patient Intake & Scheduling** - Inbound call handling, appointment booking
2. **Recall & Reactivation Campaigns** - Proactive outbound patient engagement
3. **No-Show Recovery** - Same-day rebooking, reminder systems
4. **Front Office Operations** - Insurance verification, referral coordination

### Primary ICPs (Ideal Customer Profiles)

| ICP | Characteristics | Pain Points | Decision Drivers |
|-----|-----------------|-------------|------------------|
| **ICP 1: Growth-Stage Practice Owner** | 1-3 locations, $500K-$2M revenue, owner-operator | Missed calls, front desk overwhelm, inability to scale | Cost of missed calls, time freedom, growth enablement |
| **ICP 2: Multi-Location Group Operator** | 3-20 locations, PE-backed or growth-minded, operations focus | Standardization gaps, visibility across locations, P&L pressure | Operational efficiency, exit valuation impact, scalability |
| **ICP 3: Exit-Oriented Practice Owner** | 5+ years in practice, considering sale in 2-5 years | EBITDA optimization, operational documentation, buyer readiness | Valuation multiplier impact, clean operations for due diligence |

### Jobs-to-Be-Done Framework

**Functional Jobs:**
- Fill empty appointment slots consistently
- Answer 100% of patient calls during business hours
- Reduce no-show rates below 10%
- Standardize intake process across multiple locations
- Gain visibility into front-office performance metrics

**Emotional Jobs:**
- Stop "firefighting" and start leading strategically
- Feel confident in practice growth trajectory
- Reduce stress about staffing turnover
- Trust that patients are being handled professionally

**Social Jobs:**
- Be recognized as a well-run, growing practice
- Impress potential buyers with operational excellence
- Demonstrate innovation in practice management

### Buying Journey Stages

| Stage | Mindset | Questions | Content Needs | Page Types |
|-------|---------|-----------|---------------|------------|
| **Unaware** | "Business as usual" | None yet | Industry trend content, benchmark data | Blog posts, industry reports |
| **Problem Aware** | "We're losing patients to missed calls" | How many calls are we missing? What's it costing us? | Problem quantification, cost calculators | Problem-aware blog posts, ROI calculator |
| **Solution Aware** | "There are services that handle this" | What options exist? VA vs answering service vs full platform? | Solution comparisons, category education | Comparison guides, "how to choose" content |
| **Product Aware** | "mybcat is an option" | How is mybcat different? What results do they get? | Case studies, testimonials, feature deep-dives | Product pages, case studies, comparison vs competitors |
| **Most Aware** | "Ready to evaluate mybcat" | Pricing? Implementation? ROI timeline? | Pricing, implementation details, objection handling | Pricing page, FAQ, demo booking |

### Structure Translation

```
POSITIONING → SITE STRUCTURE

"We sell outcomes, not hours" → Homepage hero + differentiation section
"Managed system" → Solution/Product pages (not "services")
Target ICPs → "Who It's For" section + industry pages
Vertical expertise → Dedicated industry landing pages
Outcome guarantees → Case studies + proof points
vs Competitors → Comparison pages (X vs Y format)
Trust/Compliance → Security & compliance page
Buyer education → Resource center + blog
```

---

## Part B: Information Architecture & Sitemap

### Proposed Top Navigation (6 Items)

```
Logo | Solutions | Industries | Compare | Pricing | Resources | [CTA: Book Demo]
```

**Dropdown Structure:**

```
Solutions
├── Patient Intake & Scheduling
├── Recall & Reactivation
├── No-Show Recovery
├── Front Office Operations
├── How It Works
└── Integrations

Industries
├── Optometry & Ophthalmology
├── Dental
├── Veterinary
├── Medspa & Aesthetics
├── Dermatology
├── Urgent Care
└── ENT

Compare
├── mybcat vs VAs
├── mybcat vs Call Centers
├── mybcat vs AI Receptionists
├── mybcat vs Hello Rache
└── mybcat vs HireTeem

Resources
├── Blog
├── Case Studies
├── ROI Calculator
├── Glossary
├── FAQ
└── Podcast
```

### Full Sitemap by Page Type

#### Core Selling Pages

| Page | URL | Goal | Target Intent | Example Queries | Internal Links | Template |
|------|-----|------|---------------|-----------------|----------------|----------|
| Homepage | `/` | Convert aware visitors, establish positioning | Brand + solution-aware | "mybcat", "patient acquisition platform" | All sections, industries, solutions | Homepage |
| Patient Intake | `/solutions/patient-intake/` | Explain intake capabilities | Commercial | "medical practice call answering", "patient scheduling service" | Homepage, Industries, Pricing, Case Studies | Solution |
| Recall & Reactivation | `/solutions/recall-reactivation/` | Explain recall campaigns | Commercial | "patient recall service", "reactivation campaigns healthcare" | Homepage, Industries, Case Studies | Solution |
| No-Show Recovery | `/solutions/no-show-recovery/` | Explain no-show solution | Problem-aware | "reduce no-shows medical practice", "appointment reminder service" | Homepage, Blog (no-show content), Industries | Solution |
| Front Office Operations | `/solutions/front-office-operations/` | Explain operational support | Commercial | "outsource front desk medical practice", "remote receptionist healthcare" | Homepage, Industries, Integrations | Solution |
| How It Works | `/how-it-works/` | Explain process, reduce friction | Consideration | "how does mybcat work" | Pricing, Solutions, Book Demo | Process |
| Integrations | `/integrations/` | Show EHR/PMS compatibility | Commercial | "EHR integration patient scheduling" | Solutions, Industries | Integrations |

#### Industry Landing Pages

| Page | URL | Goal | Target Intent | Example Queries | Internal Links | Template |
|------|-----|------|---------------|-----------------|----------------|----------|
| Optometry | `/industries/optometry/` | Convert optometry practices | Commercial | "optometry answering service", "eye care practice scheduling" | Solutions, Case Studies (optometry), Pricing | Industry |
| Dental | `/industries/dental/` | Convert dental practices | Commercial | "dental answering service", "dental practice call center" | Solutions, Case Studies, Pricing | Industry |
| Veterinary | `/industries/veterinary/` | Convert vet clinics | Commercial | "veterinary answering service", "vet clinic phone service" | Solutions, Case Studies, Pricing | Industry |
| Medspa | `/industries/medspa/` | Convert medspa practices | Commercial | "medspa answering service", "aesthetic practice scheduling" | Solutions, Pricing | Industry |
| Dermatology | `/industries/dermatology/` | Convert derm practices | Commercial | "dermatology answering service", "skin care practice support" | Solutions, Pricing | Industry |
| Urgent Care | `/industries/urgent-care/` | Convert urgent care clinics | Commercial | "urgent care answering service", "walk-in clinic phone service" | Solutions, Pricing | Industry |
| ENT | `/industries/ent/` | Convert ENT practices | Commercial | "ENT answering service", "otolaryngology practice support" | Solutions, Pricing | Industry |

#### Comparison Pages

| Page | URL | Goal | Target Intent | Example Queries | Internal Links | Template |
|------|-----|------|---------------|-----------------|----------------|----------|
| vs Virtual Assistants | `/compare/vs-virtual-assistants/` | Differentiate from VA model | Comparison | "virtual assistant vs managed service", "hire VA or outsource" | Homepage, Solutions, Pricing | Comparison |
| vs Call Centers | `/compare/vs-call-centers/` | Differentiate from call centers | Comparison | "medical call center vs virtual receptionist" | Homepage, Solutions | Comparison |
| vs AI Receptionists | `/compare/vs-ai-receptionists/` | Differentiate from AI-only | Comparison | "AI receptionist vs human", "AI phone answering healthcare" | Homepage, Solutions | Comparison |
| vs Hello Rache | `/compare/vs-hello-rache/` | Capture competitor searches | Comparison | "Hello Rache alternatives", "Hello Rache vs mybcat" | Solutions, Pricing, Case Studies | Comparison |
| vs HireTeem | `/compare/vs-hireteem/` | Capture competitor searches | Comparison | "HireTeem alternatives", "HireTeem vs mybcat" | Solutions, Pricing, Case Studies | Comparison |

#### Trust & Security Pages

| Page | URL | Goal | Target Intent | Example Queries | Internal Links | Template |
|------|-----|------|---------------|-----------------|----------------|----------|
| Security & Compliance | `/security/` | Build trust, address HIPAA concerns | Trust | "HIPAA compliant answering service", "secure patient communications" | Solutions, Industries, FAQ | Trust |
| About / Our Story | `/about/` | Build credibility, founder story | Trust | "mybcat company", "who is mybcat" | Team, Careers, Case Studies | About |
| Careers | `/careers/` | Recruit talent | Informational | "mybcat jobs", "healthcare VA jobs" | About | Careers |

#### Pricing

| Page | URL | Goal | Target Intent | Example Queries | Internal Links | Template |
|------|-----|------|---------------|-----------------|----------------|----------|
| Pricing | `/pricing/` | Convert qualified leads, filter tire-kickers | Decision | "mybcat pricing", "medical answering service cost" | Solutions, FAQ, Book Demo | Pricing |

#### Resource Center

| Page | URL | Goal | Target Intent | Example Queries | Internal Links | Template |
|------|-----|------|---------------|-----------------|----------------|----------|
| Resource Hub | `/resources/` | Content discovery, lead capture | Informational | "healthcare front desk resources" | Blog, Case Studies, Glossary, FAQ | Resource Hub |
| Blog Index | `/blog/` | Content discovery | Informational | "mybcat blog" | All blog posts, Resources | Blog Index |
| Blog Post | `/blog/[slug]/` | Capture search traffic, educate | Varies | Various keywords | Related posts, Solutions, CTAs | Article |
| Case Studies Index | `/case-studies/` | Build social proof | Consideration | "mybcat case studies", "mybcat reviews" | Individual case studies | Case Studies Index |
| Case Study | `/case-studies/[slug]/` | Prove ROI, build trust | Consideration | "[Practice name] mybcat" | Solutions, Pricing, Industries | Case Study |
| ROI Calculator | `/resources/roi-calculator/` | Lead capture, quantify value | Problem-aware | "medical practice missed calls calculator" | Pricing, Solutions, Book Demo | Tool |
| Glossary Index | `/glossary/` | SEO, establish expertise | Informational | "healthcare terminology" | Individual terms | Glossary Index |
| Glossary Term | `/glossary/[term]/` | SEO, education | Informational | "what is [term]" | Related terms, Solutions | Glossary Term |
| FAQ Hub | `/faq/` | Answer objections, reduce friction | Decision | "mybcat FAQ", "is mybcat HIPAA compliant" | Pricing, Solutions, Security | FAQ Hub |
| Podcast | `/podcast/` | Thought leadership | Informational | "mybcat podcast" | About, Blog | Podcast |

### Internal Linking Rules

1. **Homepage** links to: All solutions, all industries, featured case studies, pricing
2. **Solution pages** link to: Related industries, relevant case studies, pricing, how it works
3. **Industry pages** link to: All solutions, industry-specific case studies, pricing, comparison pages
4. **Blog posts** link to: Relevant solutions, industry pages, related posts, glossary terms, CTAs
5. **Comparison pages** link to: Pricing, case studies, solutions, FAQ
6. **Case studies** link to: Relevant industry page, relevant solution, pricing
7. **Glossary terms** link to: Related terms, solutions using the term, relevant blog posts

---

## Part C: Answer-Friendly Page Templates

### Homepage Template

```
STRUCTURE:
├── Hero Section
│   ├── H1: Primary value proposition (60 chars max)
│   ├── Subhead: Outcome promise with proof point
│   ├── Primary CTA + Secondary CTA
│   └── Social proof bar (logos, stats)
├── Problem Section
│   ├── H2: Problem statement (question format ideal)
│   ├── Statistics with sources
│   └── Problem agitation
├── Solution Overview
│   ├── H2: How mybcat solves this
│   ├── 3-4 capability cards
│   └── Link to How It Works
├── Differentiation Section
│   ├── H2: Why mybcat is different
│   ├── Comparison table (mybcat vs alternatives)
│   └── Links to comparison pages
├── Industries Section
│   ├── H2: Built for healthcare specialties
│   ├── Industry cards with icons
│   └── Links to industry pages
├── Proof Section
│   ├── H2: Results that speak
│   ├── Testimonial carousel
│   ├── Key metrics (filled schedules, recovered revenue)
│   └── Link to case studies
├── Pricing Preview
│   ├── H2: Transparent pricing
│   ├── Tier overview cards
│   └── Link to full pricing page
├── FAQ Section (4-6 questions)
│   ├── H2: Common questions
│   └── Accordion with schema markup
└── Final CTA
    ├── H2: Ready to fill your schedule?
    ├── Benefit recap
    └── Primary CTA
```

**Semantic HTML Requirements:**
- `<header>` for hero
- `<main>` wrapping all content sections
- `<section>` for each major block
- `<article>` not needed (not an article page)
- `<nav>` for navigation
- `<footer>` for footer

**Schema Markup:**
- Organization
- WebSite
- FAQPage (within FAQ section)

### Solution/Product Page Template

```
STRUCTURE:
├── Hero Section
│   ├── Breadcrumb (Home > Solutions > [Solution])
│   ├── H1: Solution name + outcome promise
│   ├── TL;DR paragraph (40-60 words directly answering "what is this?")
│   ├── Primary CTA
│   └── Hero image/illustration
├── Problem Section
│   ├── H2: The challenge (question format)
│   ├── Problem statistics
│   └── Pain point bullets (max 4)
├── Solution Details
│   ├── H2: How [solution] works
│   ├── Feature list with descriptions
│   └── Process steps (numbered)
├── Outcomes Section
│   ├── H2: Results you can expect
│   ├── Metric cards (quantified outcomes)
│   └── Before/after comparison
├── Use Cases
│   ├── H2: Best for practices that...
│   └── Use case bullets
├── Social Proof
│   ├── Relevant testimonial
│   └── Mini case study snippet
├── Related Solutions
│   ├── H2: Works well with
│   └── Solution cards
├── FAQ Section (3-5 questions)
│   ├── H2: [Solution] FAQ
│   └── Accordion
└── CTA Section
    ├── H2: See [solution] in action
    └── Demo booking form
```

**H1/H2 Structure:**
- H1: "[Solution Name]: [Outcome Promise]" (e.g., "Patient Intake: Never Miss Another New Patient Call")
- H2s: Question format or outcome-focused ("How does patient intake work?", "What results can you expect?")

**TL;DR Pattern:**
Place a 40-60 word summary immediately after H1 that directly answers "What is this service and why should I care?"

**Thin Content Prevention:**
- Minimum 1,000 words per solution page
- Include 3+ statistics with sources
- 1+ testimonial
- 3-5 FAQ items
- Process/how-it-works section

### Industry Landing Page Template

```
STRUCTURE:
├── Hero Section
│   ├── Breadcrumb (Home > Industries > [Industry])
│   ├── H1: [Industry] Patient Acquisition & Intake Services
│   ├── TL;DR: Direct value proposition for this vertical (40-60 words)
│   ├── Industry-specific statistics
│   ├── Primary CTA
│   └── Hero image (industry-relevant)
├── Industry Problems
│   ├── H2: Challenges facing [industry] practices
│   ├── Problem bullets (specific to vertical)
│   └── Supporting statistics
├── Solution Fit
│   ├── H2: Why mybcat for [industry]
│   ├── Industry-specific capabilities
│   └── Integration mentions (relevant EHR/PMS)
├── Outcomes Section
│   ├── H2: [Industry] practice results
│   ├── Industry-specific case study snippet
│   └── Relevant metrics
├── Testimonial
│   ├── Industry-specific testimonial (video if available)
│   └── Practice name/location
├── FAQ Section (3-5 industry-specific questions)
│   ├── H2: [Industry] FAQ
│   └── Questions like "Does mybcat work with [industry EHR]?"
└── CTA Section
    ├── H2: Ready to grow your [industry] practice?
    └── Demo booking
```

**Answer-Friendly Requirements:**
- Include "What is [industry] patient acquisition?" definition
- Use industry-specific terminology throughout
- Reference industry-specific integrations (e.g., ModMed for derm, Eyefinity for optometry)
- Include industry benchmark statistics

### Comparison Page Template (X vs Y)

```
STRUCTURE:
├── Hero Section
│   ├── Breadcrumb (Home > Compare > [X vs Y])
│   ├── H1: mybcat vs [Competitor]: Which is right for your practice?
│   ├── TL;DR: 2-3 sentence summary of key differences
│   └── Jump links to sections
├── Quick Comparison Table
│   ├── H2: At a glance
│   └── Feature comparison table (6-8 rows)
├── Overview Sections
│   ├── H2: What is mybcat?
│   ├── 40-60 word definition + key differentiators
│   ├── H2: What is [Competitor]?
│   └── 40-60 word fair description
├── Detailed Comparison
│   ├── H2: Pricing comparison
│   ├── H2: Service model comparison
│   ├── H2: Technology comparison
│   └── H2: Best for comparison
├── Pros and Cons
│   ├── H2: mybcat pros and cons
│   └── H2: [Competitor] pros and cons
├── Verdict Section
│   ├── H2: Which should you choose?
│   ├── Decision criteria
│   └── Recommendations by practice type
├── FAQ
│   ├── H2: [X vs Y] FAQ
│   └── Common comparison questions
└── CTA
    └── "See mybcat in action" demo booking
```

**Answer-Friendly Requirements:**
- Include direct answer to "Which is better, mybcat or [competitor]?"
- Comparison table must use semantic `<table>` HTML
- Be fair to competitors (builds trust, avoids appearing biased)
- Include "Bottom line" summary paragraph

### Pricing Page Template

```
STRUCTURE:
├── Hero Section
│   ├── H1: Simple, transparent pricing
│   ├── TL;DR: Pricing model overview (40-60 words)
│   └── Trust badge (money-back guarantee, no long-term contracts)
├── Pricing Tiers
│   ├── H2: Choose your plan
│   └── Tier cards with features, pricing, CTAs
├── Feature Comparison
│   ├── H2: What's included
│   └── Detailed feature table by tier
├── ROI Section
│   ├── H2: Calculate your ROI
│   ├── Link to ROI calculator
│   └── Example ROI scenarios
├── FAQ Section
│   ├── H2: Pricing FAQ
│   └── Questions: billing, contracts, upgrades, refunds
└── CTA
    └── Demo booking
```

### FAQ Hub + Detail Template

**FAQ Hub:**
```
├── H1: Frequently Asked Questions
├── TL;DR: What you'll find here
├── Category navigation
│   ├── Getting Started
│   ├── Pricing & Billing
│   ├── Security & Compliance
│   ├── Technical / Integrations
│   └── Service & Support
└── Question list by category (expandable)
```

**FAQ Detail Page (for long-form answers):**
```
├── Breadcrumb (Home > FAQ > [Category] > [Question])
├── H1: [Question]?
├── Short answer (40-60 words, featured snippet optimized)
├── Detailed answer (multiple paragraphs)
├── Related questions
└── CTA
```

### Blog/Article Template

```
STRUCTURE:
├── Header
│   ├── Breadcrumb (Home > Blog > [Category] > [Post])
│   ├── H1: Article title (60 chars, keyword-rich)
│   ├── Meta: Author, date, read time
│   └── Featured image
├── Key Takeaways Box
│   ├── H2: Key Takeaways
│   └── 3-5 bullet points summarizing article
├── Introduction
│   ├── Hook paragraph
│   ├── Problem/question setup
│   └── What you'll learn
├── Body Sections
│   ├── H2: [Section 1]
│   ├── Content with H3 subsections
│   ├── H2: [Section 2]
│   └── Repeat...
├── Conclusion
│   ├── H2: Conclusion / Key Takeaways
│   └── Summary + action items
├── FAQ (if applicable)
│   ├── H2: FAQ
│   └── 2-3 related questions
├── Author Bio
│   └── Author credentials
├── Related Posts
│   └── 3 related articles
└── CTA
    └── Relevant conversion action
```

**Thin Content Prevention:**
- Minimum 1,500 words for SEO-targeted posts
- Include 3+ statistics
- 2+ internal links
- 1+ image/visual
- Table of contents for 2,000+ word posts

### Glossary Term Template

```
├── Breadcrumb (Home > Glossary > [Term])
├── H1: What is [Term]?
├── Definition (40-60 words, directly answering the question)
├── Detailed explanation
├── Examples / use cases
├── Related terms
├── Related solutions (internal links)
└── CTA
```

---

## Part D: Structured Data Strategy

### Schema Types by Page Type

| Page Type | Schema Types | Priority |
|-----------|--------------|----------|
| Homepage | Organization, WebSite, BreadcrumbList | High |
| Solution Pages | Service, BreadcrumbList, FAQPage | High |
| Industry Pages | Service, BreadcrumbList, FAQPage | High |
| Comparison Pages | BreadcrumbList, FAQPage | Medium |
| Pricing | BreadcrumbList | Medium |
| Blog Posts | Article, BreadcrumbList, FAQPage (if applicable) | High |
| Case Studies | Article, BreadcrumbList | Medium |
| FAQ Hub | FAQPage, BreadcrumbList | High |
| Glossary Terms | BreadcrumbList | Low |
| About | Organization, BreadcrumbList | Medium |

### JSON-LD Implementation Examples

**Organization (Homepage):**
```json
{
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
```

**WebSite (Homepage):**
```json
{
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
```

**BreadcrumbList (All Pages):**
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

**Service (Solution/Industry Pages):**
```json
{
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
```

**Article (Blog Posts):**
```json
{
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
```

**FAQPage:**
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
```

### Compliance Guidelines

1. **Content Match:** Schema data must accurately reflect visible page content
2. **Freshness:** Update dateModified when content changes
3. **One Schema per Type:** Avoid duplicate Organization schemas across pages
4. **Validation:** Test all schema with Google Rich Results Test before deployment
5. **Placement:** JSON-LD in `<head>` section (preferred) or at end of `<body>`
6. **No Spam:** Never mark up content users can't see

---

## Part E: Technical SEO Specification

### Metadata Rules

**Title Tags:**
- Format: `[Primary Keyword] | [Secondary Keyword] - mybcat`
- Homepage: `Patient Acquisition Platform for Healthcare Practices | mybcat`
- Solution: `[Solution Name]: [Benefit] | mybcat`
- Industry: `[Industry] Answering Service & Patient Intake | mybcat`
- Blog: `[Post Title] | mybcat Blog`
- Length: 50-60 characters

**Meta Descriptions:**
- Length: 150-160 characters
- Include primary keyword
- Include benefit/outcome
- End with CTA or value proposition
- Unique per page

**Example:**
```html
<title>Optometry Answering Service & Patient Intake | mybcat</title>
<meta name="description" content="Never miss another patient call. mybcat's managed intake service helps optometry practices fill their schedules and recover lost revenue. Book a demo.">
```

### Canonical Strategy

- **Self-referencing canonicals** on all pages
- **Primary URL:** Always `https://mybcat.com/[path]/` (with trailing slash)
- **Parameters:** Canonical points to clean URL (strip UTM, tracking params)
- **Pagination:** `rel="canonical"` on paginated pages points to page 1 unless content is substantively different
- **Legacy pages:** 301 redirect OR canonical to new equivalent

```html
<link rel="canonical" href="https://mybcat.com/industries/optometry/">
```

### Sitemap.xml Approach

**Multiple Sitemaps (sitemap index):**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://mybcat.com/sitemap-pages.xml</loc>
    <lastmod>2025-12-19</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://mybcat.com/sitemap-blog.xml</loc>
    <lastmod>2025-12-19</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://mybcat.com/sitemap-resources.xml</loc>
    <lastmod>2025-12-19</lastmod>
  </sitemap>
</sitemapindex>
```

**Priority Guidance:**
- Homepage: 1.0
- Solution/Industry pages: 0.8
- Blog posts: 0.6
- Glossary terms: 0.4

**Frequency:**
- Homepage: weekly
- Solution/Industry: monthly
- Blog: weekly
- Glossary: monthly

### Robots.txt

```
User-agent: *
Allow: /

# Block admin and internal paths
Disallow: /admin/
Disallow: /api/
Disallow: /_astro/
Disallow: /preview/

# Block search results
Disallow: /search

# Allow AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://mybcat.com/sitemap-index.xml
```

### Redirect Policy

**301 Redirects (Permanent):**
- All legacy pages → new equivalent
- HTTP → HTTPS
- Non-www → www (or vice versa, pick one)
- Old URL structures → new URL structures

**308 Redirects:**
- For POST requests that need to maintain method

**Never use:**
- 302 for permanent moves
- Redirect chains (A→B→C)
- Redirect loops

**Legacy mybcat.com Redirects Needed:**
```
/virtual-assistants-for-optometrists → /industries/optometry/
/customer-service-outsourcing-provider-in-marietta-georgia → /about/
/solutions-remote-hospitality-center → /solutions/patient-intake/
/service-package-deluxe → /pricing/
/service-package-ultimate → /pricing/
```

### 404/410 Handling

**404 Page:**
- Custom design with helpful navigation
- Search functionality
- Links to popular pages
- Clear "page not found" message
- Proper 404 HTTP status code

**410 (Gone):**
- Use for intentionally removed content
- Content that was indexed but permanently deleted

### URL Normalization

**Rules:**
- Lowercase only: `/Industries/Optometry/` → `/industries/optometry/`
- Trailing slash consistent: Choose one pattern and enforce
- No file extensions: `/about.html` → `/about/`
- Hyphens for word separation: `/front-office-operations/` not `/front_office_operations/`
- No special characters or spaces
- Short, descriptive slugs

### Internal Linking Rules

1. **Anchor text:** Descriptive, keyword-rich, varied (not all exact match)
2. **Contextual links:** Within body content, not just navigation
3. **Link depth:** Important pages within 3 clicks of homepage
4. **No orphan pages:** Every page linked from at least one other page
5. **Related content:** Blog posts link to related posts and solutions
6. **Hub and spoke:** Solution pages as hubs, supporting content as spokes

### Content Governance (Cannibalization Prevention)

**Keyword Assignment Matrix:**
- Each primary keyword assigned to ONE page only
- Track in spreadsheet: Page URL | Primary Keyword | Secondary Keywords | Status
- Before creating new content, check if keyword is already targeted
- If overlap exists, consolidate or differentiate content

**Content Audit Cadence:**
- Quarterly keyword cannibalization check
- Identify pages competing for same terms
- Consolidate thin content
- Update outdated content (flag anything >12 months old)

---

## Part F: Performance & Architecture Recommendation

### Framework Comparison for Vercel + GitHub Workflow

| Criteria | Astro | Next.js (SSG/ISR) | Plain HTML/Static |
|----------|-------|-------------------|-------------------|
| **TTFB** | ⭐⭐⭐⭐⭐ Excellent (<100ms) | ⭐⭐⭐⭐ Very Good (SSG), ⭐⭐⭐ Good (ISR) | ⭐⭐⭐⭐⭐ Excellent |
| **JS Payload** | ⭐⭐⭐⭐⭐ 0KB default | ⭐⭐⭐ 70-100KB+ React baseline | ⭐⭐⭐⭐⭐ 0KB |
| **Hydration** | Partial (islands only) | Full page | None |
| **Build Complexity** | ⭐⭐⭐⭐ Low | ⭐⭐⭐ Medium | ⭐⭐⭐⭐⭐ None |
| **Content Authoring (MD/MDX)** | ⭐⭐⭐⭐⭐ Native Content Collections | ⭐⭐⭐⭐ Good, requires setup | ⭐⭐ Manual only |
| **SEO Impact** | ⭐⭐⭐⭐⭐ Pure HTML output | ⭐⭐⭐⭐⭐ SSG excellent | ⭐⭐⭐⭐⭐ Excellent |
| **Vercel Integration** | ⭐⭐⭐⭐ Native adapter | ⭐⭐⭐⭐⭐ Native platform | ⭐⭐⭐⭐ Basic |
| **Interactive Components** | Islands (React/Vue/Svelte) | Full React | External scripts only |
| **Learning Curve** | Low-Medium | Medium-High | None |

### Recommendation: Astro

**Primary Reasons:**

1. **Zero-JS Default = Optimal Core Web Vitals**
   - LCP <2.5s easily achievable
   - No hydration blocking render
   - CLS near 0 without JS layout shifts

2. **Content Collections API**
   - Type-safe MDX with Zod validation
   - Perfect for code-first content workflow
   - Frontmatter-driven metadata

3. **Islands Architecture**
   - Add interactivity only where needed (contact forms, calculators)
   - No framework tax on content pages

4. **Vercel Integration**
   - `@astrojs/vercel` adapter
   - Image optimization built-in
   - Speed Insights supported

5. **Simplicity**
   - Lower complexity than Next.js
   - Easier for non-React developers
   - Better for content-focused sites

### When to Reconsider Next.js:

- If mybcat plans to add authenticated dashboards or portals
- If frequent content updates require ISR (hourly changes)
- If team has deep React expertise and prefers it

---

## Part G: Implementation Blueprint for Claude Code CLI

### Repository Structure

```
mybcat.com/
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lint, typecheck, build
│       ├── lighthouse.yml      # Lighthouse CI
│       └── deploy-preview.yml  # Preview deployments
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   └── SEO.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── FAQ.astro
│   │   │   ├── Testimonials.astro
│   │   │   └── CTA.astro
│   │   └── islands/            # Interactive components
│   │       ├── ContactForm.tsx
│   │       ├── ROICalculator.tsx
│   │       └── MobileNav.tsx
│   ├── content/
│   │   ├── blog/
│   │   │   └── *.mdx
│   │   ├── case-studies/
│   │   │   └── *.mdx
│   │   ├── glossary/
│   │   │   └── *.mdx
│   │   └── config.ts           # Content collection schemas
│   ├── data/
│   │   ├── navigation.ts
│   │   ├── testimonials.ts
│   │   └── faq.ts
│   ├── layouts/
│   │   ├── BaseLayout.astro
│   │   ├── BlogLayout.astro
│   │   └── LandingLayout.astro
│   ├── pages/
│   │   ├── index.astro
│   │   ├── pricing.astro
│   │   ├── about.astro
│   │   ├── faq.astro
│   │   ├── solutions/
│   │   │   ├── index.astro
│   │   │   ├── patient-intake.astro
│   │   │   └── [...]
│   │   ├── industries/
│   │   │   ├── index.astro
│   │   │   ├── optometry.astro
│   │   │   └── [...]
│   │   ├── compare/
│   │   │   ├── vs-hello-rache.astro
│   │   │   └── [...]
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── case-studies/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   ├── glossary/
│   │   │   ├── index.astro
│   │   │   └── [...term].astro
│   │   └── resources/
│   │       └── roi-calculator.astro
│   ├── styles/
│   │   ├── global.css
│   │   └── variables.css
│   └── utils/
│       ├── schema.ts           # JSON-LD generators
│       ├── seo.ts              # Meta tag helpers
│       └── formatting.ts
├── public/
│   ├── images/
│   ├── fonts/
│   ├── robots.txt
│   └── favicon.svg
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── README.md
```

### Conventions for Adding Pages

**Adding a New Solution Page:**
1. Create `src/pages/solutions/[solution-name].astro`
2. Use `LandingLayout` with appropriate schema
3. Follow Solution Page Template structure
4. Add to navigation data in `src/data/navigation.ts`
5. Update sitemap generation

**Adding a New Blog Post:**
1. Create `src/content/blog/[slug].mdx`
2. Include required frontmatter:
```yaml
---
title: "Post Title"
description: "Meta description"
author: "Author Name"
date: 2025-12-19
category: "Category"
tags: ["tag1", "tag2"]
image: "/images/blog/featured.jpg"
---
```
3. Write content in MDX
4. Run `npm run build` to validate

### Content Pipeline (MD/MDX + Frontmatter)

**Content Collection Schema (`src/content/config.ts`):**
```typescript
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(60),
    description: z.string().max(160),
    author: z.string(),
    date: z.date(),
    updatedDate: z.date().optional(),
    category: z.enum(['Operations', 'Growth', 'Technology', 'Industry']),
    tags: z.array(z.string()),
    image: z.string(),
    draft: z.boolean().default(false),
  }),
});

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    industry: z.enum(['optometry', 'dental', 'veterinary', 'medspa', 'dermatology']),
    metrics: z.array(z.object({
      label: z.string(),
      value: z.string(),
    })),
    testimonial: z.object({
      quote: z.string(),
      author: z.string(),
      role: z.string(),
    }).optional(),
    date: z.date(),
    image: z.string(),
  }),
});

const glossary = defineCollection({
  type: 'content',
  schema: z.object({
    term: z.string(),
    definition: z.string().max(160),
    relatedTerms: z.array(z.string()).optional(),
    relatedSolutions: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, caseStudies, glossary };
```

### CI Checks

**`.github/workflows/ci.yml`:**
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npm run typecheck
      
      - name: Build
        run: npm run build
      
      - name: Link checker
        run: npm run check-links
      
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
```

**`lighthouserc.json`:**
```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist"
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}],
        "first-contentful-paint": ["error", {"maxNumericValue": 1800}],
        "largest-contentful-paint": ["error", {"maxNumericValue": 2500}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}]
      }
    }
  }
}
```

### Rollout Phases

**Phase 1: MVP (Days 1-30)**
- [ ] Repository setup with Astro + Vercel
- [ ] Base layout and global components
- [ ] Homepage (new design)
- [ ] 3 solution pages (Patient Intake, Recall, No-Show)
- [ ] 5 industry pages (Optometry, Dental, Veterinary, Medspa, Dermatology)
- [ ] Pricing page
- [ ] About page
- [ ] Contact/Demo booking integration
- [ ] Basic blog index + 5 migrated posts
- [ ] 301 redirects from legacy URLs
- [ ] Google Search Console setup

**Phase 2: Content Expansion (Days 31-60)**
- [ ] Remaining solution pages
- [ ] Remaining industry pages (Urgent Care, ENT)
- [ ] 2 comparison pages (vs Hello Rache, vs HireTeem)
- [ ] FAQ hub
- [ ] Security & Compliance page
- [ ] 3 case studies
- [ ] 10 additional blog posts
- [ ] Glossary (20 terms)
- [ ] ROI Calculator (interactive island)

**Phase 3: Programmatic Pages (Days 61-90)**
- [ ] Remaining comparison pages
- [ ] Expanded glossary (50+ terms)
- [ ] Blog category pages
- [ ] Automated sitemap generation
- [ ] Schema markup audit and optimization
- [ ] Link building outreach assets
- [ ] Analytics and conversion tracking refinement

---

## Part H: Vercel Deployment & Monitoring

### Caching Settings

**`vercel.json`:**
```json
{
  "trailingSlash": true,
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    },
    {
      "source": "/_astro/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ],
  "redirects": [
    { "source": "/virtual-assistants-for-optometrists", "destination": "/industries/optometry/", "permanent": true },
    { "source": "/customer-service-outsourcing-provider-in-marietta-georgia", "destination": "/about/", "permanent": true },
    { "source": "/solutions-remote-hospitality-center", "destination": "/solutions/patient-intake/", "permanent": true }
  ]
}
```

### Image Optimization

**Astro Config (`astro.config.mjs`):**
```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  adapter: vercel({
    imageService: true,
    webAnalytics: { enabled: true },
    speedInsights: { enabled: true },
  }),
  integrations: [mdx(), tailwind(), react()],
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
    domains: ['mybcat.com'],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
```

### Security Headers

Already included in `vercel.json` above. Additional headers for production:

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.hsforms.net https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.hubspot.com https://www.google-analytics.com; frame-src https://meetings.hubspot.com"
}
```

### Preview Deployments

Vercel automatically creates preview deployments for every PR. Configure:

1. **Branch Protection:** Require preview deployment checks to pass
2. **Comment Previews:** Enable "Vercel for GitHub" comments on PRs
3. **Environment Variables:** Use `VERCEL_ENV` to distinguish preview from production

### Monitoring Setup

**Speed Insights (Vercel Built-in):**
- Enable in `astro.config.mjs` via adapter
- Monitors real-user Core Web Vitals
- Available in Vercel dashboard

**Lighthouse CI:**
- Run on every PR via GitHub Actions
- Block merges if scores drop below thresholds
- Track performance over time

**Uptime Monitoring:**
- Use Vercel's built-in monitoring
- OR external: UptimeRobot, Pingdom (free tier available)
- Alert on 5xx errors or downtime

**Google Search Console:**
- Verify ownership
- Submit sitemap
- Monitor indexing status
- Track Core Web Vitals from field data

---

## Part I: Output Formats

### 1. Executive Summary (10 Bullets)

See beginning of document.

### 2. Sitemap Table

| Page Type | Example URL | Target Intent | Primary Internal Links | Template |
|-----------|-------------|---------------|------------------------|----------|
| Homepage | `/` | Brand, Solution-aware | Solutions, Industries, Pricing, Case Studies | Homepage |
| Solution - Patient Intake | `/solutions/patient-intake/` | Commercial | Industries, Case Studies, Pricing | Solution |
| Solution - Recall | `/solutions/recall-reactivation/` | Commercial | Industries, Case Studies | Solution |
| Solution - No-Show | `/solutions/no-show-recovery/` | Problem-aware | Blog, Industries | Solution |
| Industry - Optometry | `/industries/optometry/` | Commercial | Solutions, Case Studies, Pricing | Industry |
| Industry - Dental | `/industries/dental/` | Commercial | Solutions, Case Studies, Pricing | Industry |
| Industry - Veterinary | `/industries/veterinary/` | Commercial | Solutions, Pricing | Industry |
| Industry - Medspa | `/industries/medspa/` | Commercial | Solutions, Pricing | Industry |
| Industry - Dermatology | `/industries/dermatology/` | Commercial | Solutions, Pricing | Industry |
| Compare - vs Hello Rache | `/compare/vs-hello-rache/` | Comparison | Solutions, Pricing, Case Studies | Comparison |
| Compare - vs HireTeem | `/compare/vs-hireteem/` | Comparison | Solutions, Pricing, Case Studies | Comparison |
| Pricing | `/pricing/` | Decision | Solutions, FAQ, Demo | Pricing |
| Blog Index | `/blog/` | Informational | All posts, Solutions | Blog Index |
| Blog Post | `/blog/[slug]/` | Varies | Related posts, Solutions, CTA | Article |
| Case Study | `/case-studies/[slug]/` | Consideration | Industry, Solution, Pricing | Case Study |
| FAQ Hub | `/faq/` | Decision | Pricing, Solutions, Security | FAQ |
| Glossary Term | `/glossary/[term]/` | Informational | Related terms, Solutions | Glossary |
| Security | `/security/` | Trust | Solutions, FAQ | Trust |
| About | `/about/` | Trust | Team, Careers | About |

### 3. Content Roadmap (30/60/90 Days)

**Days 1-30 (MVP Launch):**
- Week 1: Repository setup, base components, layouts
- Week 2: Homepage, Pricing, About, Contact integration
- Week 3: 5 industry pages (Optometry, Dental, Veterinary, Medspa, Dermatology)
- Week 4: 3 solution pages, Blog index, 5 migrated posts, 301 redirects, launch

**Days 31-60 (Content Expansion):**
- Week 5-6: Remaining solution pages, 2 comparison pages
- Week 7: FAQ hub, Security page, 3 case studies
- Week 8: 10 new blog posts, Glossary (20 terms), ROI Calculator

**Days 61-90 (Scale & Optimize):**
- Week 9-10: 3 more comparison pages, Urgent Care + ENT industry pages
- Week 11: Expand glossary to 50+ terms, blog category pages
- Week 12: Schema audit, performance optimization, link building prep

### 4. Launch Checklist

**Pre-Launch:**
- [ ] All 301 redirects configured and tested
- [ ] Canonical tags on all pages
- [ ] Schema markup validated on all page types
- [ ] robots.txt allows crawling
- [ ] sitemap.xml generated and accessible
- [ ] Google Search Console verified
- [ ] Analytics/tracking installed
- [ ] Contact forms tested
- [ ] Mobile responsive on all pages
- [ ] Lighthouse scores >90 on all categories
- [ ] Security headers configured
- [ ] SSL certificate active

**Launch Day:**
- [ ] Deploy to production
- [ ] Submit sitemap to Google Search Console
- [ ] Test all critical user flows
- [ ] Monitor for 500 errors
- [ ] Verify redirects working
- [ ] Check Search Console for crawl errors

**Post-Launch (Week 1):**
- [ ] Monitor Search Console indexing
- [ ] Check Speed Insights for real-user data
- [ ] Fix any 404s or broken links
- [ ] Monitor form submissions
- [ ] Review analytics baseline

### 5. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Legacy URL traffic loss** | High | High | Comprehensive 301 redirect map, monitor Search Console for 404s |
| **Duplicate content from migration** | Medium | High | Canonical tags, consolidate legacy pages, remove old URLs from index |
| **Performance regression** | Low | Medium | Lighthouse CI gates on PRs, real-user monitoring via Speed Insights |
| **Schema validation failures** | Medium | Low | Automated schema testing in CI, Rich Results Test before launch |
| **Form submission breaks** | Medium | High | Test all forms thoroughly, have fallback email contact |
| **HIPAA compliance concerns** | Low | High | Clear compliance page, BAA documentation, security headers |
| **Competitor SEO response** | Medium | Medium | Monitor rankings, maintain content velocity, build backlinks |
| **Content quality decline** | Medium | Medium | Content governance rules, quarterly audits, style guide |
| **Technical debt accumulation** | Medium | Medium | Code review requirements, documentation, regular refactoring |
| **Vercel outage** | Low | High | Monitor status page, have DNS failover plan |

---

## Authoritative Sources Referenced

**Google Official:**
- Google Search Central: https://developers.google.com/search
- Schema.org: https://schema.org
- Web Vitals: https://web.dev/vitals

**Framework Documentation:**
- Astro: https://docs.astro.build
- Next.js: https://nextjs.org/docs
- Vercel: https://vercel.com/docs

**SEO Research:**
- Ahrefs: https://ahrefs.com/blog
- Search Engine Journal: https://searchenginejournal.com
- Moz: https://moz.com

**AI Optimization:**
- WebFX SGE Guide
- Mailchimp AI Overviews
- GEO research papers