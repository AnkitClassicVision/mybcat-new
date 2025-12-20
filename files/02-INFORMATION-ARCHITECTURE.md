# 02 — INFORMATION ARCHITECTURE & SITEMAP

## Navigation Structure

### Primary Navigation (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Logo]  │ Solutions ▼ │ Industries ▼ │ Compare ▼ │ Pricing │ Resources ▼ │ [Book Demo] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Dropdown Menus

**Solutions Dropdown:**
```
Solutions
├── Patient Intake & Scheduling
├── Recall & Reactivation
├── No-Show Recovery
├── Front Office Operations
├── ─────────────────────
├── How It Works
└── Integrations
```

**Industries Dropdown:**
```
Industries
├── Optometry & Ophthalmology
├── Dental
├── Veterinary
├── Medspa & Aesthetics
├── Dermatology
├── Urgent Care
└── ENT
```

**Compare Dropdown:**
```
Compare
├── mybcat vs Virtual Assistants
├── mybcat vs Call Centers
├── mybcat vs AI Receptionists
├── ─────────────────────
├── mybcat vs Hello Rache
└── mybcat vs HireTeem
```

**Resources Dropdown:**
```
Resources
├── Blog
├── Case Studies
├── ROI Calculator
├── Glossary
├── FAQ
└── Podcast
```

### Mobile Navigation
- Hamburger menu → Full-screen overlay
- Accordions for dropdown sections
- Primary CTA always visible

### Footer Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  [Logo]              Solutions        Industries       Company             │
│                      • Patient Intake  • Optometry      • About            │
│  Your remote         • Recall         • Dental         • Careers          │
│  patient acquisition • No-Show        • Veterinary     • Contact          │
│  platform            • Operations     • Medspa         • Security         │
│                      • Integrations   • Dermatology    • Privacy          │
│                                       • Urgent Care    • Terms            │
│                                       • ENT                               │
│                                                                           │
│  Resources          Compare                                               │
│  • Blog             • vs VAs          [Contact Info]                      │
│  • Case Studies     • vs Call Centers  📍 Address                         │
│  • FAQ              • vs AI           📞 Phone                            │
│  • Glossary         • vs Hello Rache  ✉️ Email                            │
│  • Podcast          • vs HireTeem                                         │
│                                                                           │
│ ────────────────────────────────────────────────────────────────────────── │
│  © 2025 mybcat. All rights reserved.  │  Privacy Policy  │  Terms         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Complete Sitemap

### Tier 1: Core Pages (Critical for Launch)

| Page | URL | Parent | Priority |
|------|-----|--------|----------|
| Homepage | `/` | — | 1.0 |
| Pricing | `/pricing/` | — | 0.9 |
| About | `/about/` | — | 0.7 |
| Contact | `/contact/` | — | 0.8 |
| Security & Compliance | `/security/` | — | 0.7 |

### Tier 2: Solution Pages

| Page | URL | Parent | Priority |
|------|-----|--------|----------|
| Solutions Index | `/solutions/` | Homepage | 0.8 |
| Patient Intake & Scheduling | `/solutions/patient-intake/` | Solutions | 0.8 |
| Recall & Reactivation | `/solutions/recall-reactivation/` | Solutions | 0.8 |
| No-Show Recovery | `/solutions/no-show-recovery/` | Solutions | 0.8 |
| Front Office Operations | `/solutions/front-office-operations/` | Solutions | 0.8 |
| How It Works | `/how-it-works/` | Solutions | 0.8 |
| Integrations | `/integrations/` | Solutions | 0.7 |

### Tier 3: Industry Pages

| Page | URL | Parent | Priority |
|------|-----|--------|----------|
| Industries Index | `/industries/` | Homepage | 0.8 |
| Optometry & Ophthalmology | `/industries/optometry/` | Industries | 0.8 |
| Dental | `/industries/dental/` | Industries | 0.8 |
| Veterinary | `/industries/veterinary/` | Industries | 0.8 |
| Medspa & Aesthetics | `/industries/medspa/` | Industries | 0.8 |
| Dermatology | `/industries/dermatology/` | Industries | 0.8 |
| Urgent Care | `/industries/urgent-care/` | Industries | 0.7 |
| ENT | `/industries/ent/` | Industries | 0.7 |

### Tier 4: Comparison Pages

| Page | URL | Parent | Priority |
|------|-----|--------|----------|
| Compare Index | `/compare/` | Homepage | 0.7 |
| vs Virtual Assistants | `/compare/vs-virtual-assistants/` | Compare | 0.7 |
| vs Call Centers | `/compare/vs-call-centers/` | Compare | 0.7 |
| vs AI Receptionists | `/compare/vs-ai-receptionists/` | Compare | 0.7 |
| vs Hello Rache | `/compare/vs-hello-rache/` | Compare | 0.7 |
| vs HireTeem | `/compare/vs-hireteem/` | Compare | 0.7 |

### Tier 5: Resource Pages

| Page | URL | Parent | Priority |
|------|-----|--------|----------|
| Resources Hub | `/resources/` | Homepage | 0.6 |
| Blog Index | `/blog/` | Resources | 0.6 |
| Blog Posts | `/blog/[slug]/` | Blog | 0.6 |
| Blog Categories | `/blog/category/[category]/` | Blog | 0.5 |
| Case Studies Index | `/case-studies/` | Resources | 0.7 |
| Case Study Pages | `/case-studies/[slug]/` | Case Studies | 0.6 |
| ROI Calculator | `/resources/roi-calculator/` | Resources | 0.7 |
| FAQ Hub | `/faq/` | Resources | 0.7 |
| Glossary Index | `/glossary/` | Resources | 0.5 |
| Glossary Terms | `/glossary/[term]/` | Glossary | 0.4 |
| Podcast | `/podcast/` | Resources | 0.5 |

### Tier 6: Legal & Utility Pages

| Page | URL | Parent | Priority |
|------|-----|--------|----------|
| Privacy Policy | `/privacy/` | Footer | 0.3 |
| Terms of Service | `/terms/` | Footer | 0.3 |
| Careers | `/careers/` | Footer | 0.4 |
| 404 Page | `/404/` | — | 0.0 |
| Sitemap (HTML) | `/sitemap/` | Footer | 0.3 |

---

## URL Structure Rules

### General Rules
1. **Lowercase only:** `/Industries/Optometry/` → `/industries/optometry/`
2. **Trailing slash:** All URLs end with `/`
3. **Hyphens for spaces:** `front-office-operations` not `front_office_operations`
4. **No file extensions:** `/about/` not `/about.html`
5. **No special characters:** Letters, numbers, hyphens only
6. **Short and descriptive:** Max 3-4 words per slug segment
7. **No dates in URLs:** `/blog/reduce-no-shows/` not `/blog/2025/01/reduce-no-shows/`

### URL Patterns by Page Type

| Page Type | Pattern | Example |
|-----------|---------|---------|
| Solution | `/solutions/[solution-slug]/` | `/solutions/patient-intake/` |
| Industry | `/industries/[industry-slug]/` | `/industries/optometry/` |
| Comparison | `/compare/vs-[competitor]/` | `/compare/vs-hello-rache/` |
| Blog Post | `/blog/[post-slug]/` | `/blog/reduce-no-shows-guide/` |
| Blog Category | `/blog/category/[category]/` | `/blog/category/operations/` |
| Case Study | `/case-studies/[client-slug]/` | `/case-studies/vision-plus/` |
| Glossary Term | `/glossary/[term-slug]/` | `/glossary/patient-acquisition/` |

### Canonical URL Rules
- Every page has a self-referencing canonical
- Canonical always includes trailing slash
- Canonical always uses `https://`
- Query parameters stripped from canonical

```html
<!-- Example: /industries/optometry/?utm_source=google -->
<link rel="canonical" href="https://mybcat.com/industries/optometry/">
```

---

## Internal Linking Strategy

### Hub & Spoke Model

```
                    ┌─────────────┐
                    │  HOMEPAGE   │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
   │SOLUTIONS│        │INDUSTRIES│       │ COMPARE │
   │  (Hub)  │        │  (Hub)   │       │  (Hub)  │
   └────┬────┘        └────┬────┘        └────┬────┘
        │                  │                  │
   ┌────┼────┐        ┌────┼────┐        ┌────┼────┐
   │    │    │        │    │    │        │    │    │
   ▼    ▼    ▼        ▼    ▼    ▼        ▼    ▼    ▼
 Spoke Spoke Spoke  Spoke Spoke Spoke  Spoke Spoke Spoke
 Pages Pages Pages  Pages Pages Pages  Pages Pages Pages
```

### Linking Rules by Page Type

**Homepage Links To:**
- All solution pages (in Solutions section)
- All industry pages (in Industries section)
- Pricing page (multiple CTAs)
- Featured case studies
- Blog highlights

**Solution Pages Link To:**
- Other solution pages (Related Solutions section)
- Relevant industry pages
- Relevant case studies
- Pricing page
- How It Works page
- Blog posts on same topic

**Industry Pages Link To:**
- All solution pages
- Industry-specific case studies
- Pricing page
- Comparison pages (when relevant)
- Industry-specific blog posts
- Glossary terms used on page

**Comparison Pages Link To:**
- Pricing page
- Relevant solution pages
- Case studies
- FAQ page
- Demo booking

**Blog Posts Link To:**
- Related blog posts (3-5)
- Relevant solution pages
- Relevant industry pages
- Glossary terms (inline)
- CTAs (demo, calculator, etc.)

**Case Studies Link To:**
- Related industry page
- Related solution page
- Pricing page
- Other case studies

**Glossary Terms Link To:**
- Related glossary terms
- Solution pages using the term
- Blog posts on the topic

### Breadcrumb Implementation

Every page (except homepage) includes breadcrumbs:

```
Home > Industries > Optometry
Home > Blog > Category > [Post Title]
Home > Compare > mybcat vs Hello Rache
```

**Schema Markup Required:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://mybcat.com/"},
    {"@type": "ListItem", "position": 2, "name": "Industries", "item": "https://mybcat.com/industries/"},
    {"@type": "ListItem", "position": 3, "name": "Optometry"}
  ]
}
```

### Anchor Text Guidelines

| Type | Example | Use Case |
|------|---------|----------|
| Exact Match | "patient intake services" | Sparingly, max 1-2 per page |
| Partial Match | "our intake solution" | Regular use |
| Branded | "mybcat's approach" | Brand mentions |
| Generic | "learn more", "read the guide" | Supplementary links |
| Natural | "handling patient calls" | Most common, conversational |

**Avoid:**
- Over-optimized anchor text (keyword stuffing)
- "Click here" without context
- Broken links
- Redirect chains in internal links

---

## Page Type Specifications

### Core Selling Pages

**Homepage (`/`)**
- Goal: Convert aware visitors, establish positioning
- Target Intent: Brand, solution-aware
- Key Elements: Hero, problem, solution, differentiation, social proof, CTA
- Word Count: 1,500-2,500 (visible content)
- Internal Links: 20-30

**Pricing (`/pricing/`)**
- Goal: Convert qualified leads, filter tire-kickers
- Target Intent: Decision stage, transactional
- Key Elements: Tier comparison, feature table, ROI, FAQ
- Word Count: 800-1,200
- Internal Links: 10-15

### Solution Pages

**Pattern: `/solutions/[slug]/`**
- Goal: Explain capability, drive demo booking
- Target Intent: Commercial, consideration
- Key Elements: TL;DR, problem, solution details, outcomes, use cases, FAQ
- Word Count: 1,200-1,800
- Internal Links: 15-20

**Required Sections:**
1. Hero with outcome promise
2. Problem statement with statistics
3. How it works (numbered steps)
4. Expected outcomes with metrics
5. Best for / use cases
6. Testimonial or proof point
7. Related solutions
8. FAQ (3-5 questions)
9. CTA section

### Industry Pages

**Pattern: `/industries/[slug]/`**
- Goal: Convert industry-specific prospects
- Target Intent: Commercial, vertical-specific
- Key Elements: Industry statistics, vertical pain points, integrations, case study
- Word Count: 1,200-1,800
- Internal Links: 15-20

**Required Sections:**
1. Hero with industry-specific value prop
2. Industry challenges (vertical-specific)
3. Why mybcat for [industry]
4. EHR/PMS integrations mentioned
5. Industry case study snippet
6. Testimonial from industry
7. FAQ (3-5 industry-specific)
8. CTA section

**Industry-Specific Requirements:**

| Industry | EHR/PMS to Mention | Key Statistics | Unique Pain Points |
|----------|-------------------|----------------|-------------------|
| Optometry | Eyefinity, RevolutionEHR, Crystal PM | Vision Council data | Frame/contact lens sales, recall for annual exams |
| Dental | Dentrix, Eaglesoft, Open Dental | ADA statistics | Hygiene recall, treatment acceptance |
| Veterinary | AVImark, Cornerstone, eVetPractice | AVMA data | Pet owner communication, emergency calls |
| Medspa | Zenoti, Boulevard, Aesthetic Record | AmSpa data | Appointment value, membership programs |
| Dermatology | ModMed, EMA, DrChrono | AAD statistics | Insurance verification, prior auth |
| Urgent Care | DocuTAP, Experity | UCA data | Wait time communication, walk-ins |
| ENT | Modernizing Medicine, AdvancedMD | AAO-HNS data | Hearing aid follow-ups, specialist referrals |

### Comparison Pages

**Pattern: `/compare/vs-[competitor]/`**
- Goal: Capture comparison searches, differentiate
- Target Intent: Comparison, consideration
- Key Elements: Quick comparison table, detailed breakdown, pros/cons, verdict
- Word Count: 1,500-2,500
- Internal Links: 10-15

**Required Sections:**
1. Hero with comparison framing
2. Quick comparison table (at-a-glance)
3. Overview of mybcat
4. Overview of competitor (fair)
5. Detailed comparisons:
   - Pricing model
   - Service model
   - Technology
   - Target customer
6. Pros and cons (both)
7. Verdict / decision criteria
8. FAQ
9. CTA

### Blog Posts

**Pattern: `/blog/[slug]/`**
- Goal: Capture search traffic, educate, nurture
- Target Intent: Varies (informational, problem-aware, etc.)
- Key Elements: Key takeaways, structured content, internal links, CTAs
- Word Count: 1,500-3,000
- Internal Links: 5-10

**Content Types:**
1. How-to guides ("How to Reduce No-Shows")
2. Problem-aware posts ("Signs Your Front Desk is Overwhelmed")
3. Industry insights ("Optometry Patient Acquisition Trends")
4. Comparison/listicles ("5 Best Practices for Patient Recall")
5. Thought leadership ("The Future of Medical Practice Operations")

### Case Studies

**Pattern: `/case-studies/[slug]/`**
- Goal: Prove ROI, build trust
- Target Intent: Consideration, decision
- Key Elements: Challenge, solution, results, testimonial
- Word Count: 800-1,500
- Internal Links: 5-10

**Required Sections:**
1. Client overview (can be anonymized)
2. Challenge / problem faced
3. Solution implemented
4. Results with specific metrics
5. Testimonial quote
6. CTA to demo

### Glossary Terms

**Pattern: `/glossary/[term]/`**
- Goal: SEO authority, education
- Target Intent: Informational
- Key Elements: Definition, explanation, examples, related terms
- Word Count: 300-600
- Internal Links: 5-8

### FAQ Pages

**FAQ Hub (`/faq/`)**
- Goal: Answer objections, reduce friction
- Target Intent: Decision, consideration
- Key Elements: Categorized questions, expandable answers
- Word Count: 1,500-3,000
- Internal Links: 15-20

**Categories:**
1. Getting Started
2. Pricing & Billing
3. Security & Compliance
4. Technical / Integrations
5. Service & Support

---

## Content Gaps to Address

Based on competitive analysis and keyword research, these content types are missing:

### High Priority
- [ ] Comparison pages (none exist currently)
- [ ] Industry-specific landing pages (limited depth)
- [ ] Case studies with quantified results
- [ ] FAQ hub with structured content
- [ ] Security/compliance dedicated page

### Medium Priority
- [ ] Glossary for SEO authority
- [ ] ROI calculator for lead capture
- [ ] Integration page listing compatible systems
- [ ] How it works process page

### Lower Priority (Phase 3)
- [ ] Podcast/video content
- [ ] Webinar/event pages
- [ ] Partner directory
- [ ] Press/media kit

---

## Migration Mapping

### Legacy URLs to New URLs

| Legacy URL | New URL | Redirect Type |
|-----------|---------|---------------|
| `/virtual-assistants-for-optometrists` | `/industries/optometry/` | 301 |
| `/virtual-assistants-for-dental-practices` | `/industries/dental/` | 301 |
| `/virtual-assistants-for-veterinary` | `/industries/veterinary/` | 301 |
| `/customer-service-outsourcing-provider-in-marietta-georgia` | `/about/` | 301 |
| `/solutions-remote-hospitality-center` | `/solutions/patient-intake/` | 301 |
| `/service-package-deluxe` | `/pricing/` | 301 |
| `/service-package-ultimate` | `/pricing/` | 301 |
| `/service-package-enterprise` | `/pricing/` | 301 |
| `/contact-us` | `/contact/` | 301 |
| `/careers-at-my-business-care-team` | `/careers/` | 301 |
| `/our-team` | `/about/` | 301 |
| `/blog/*` | `/blog/*` | Preserve or map individually |

### Pages to Deprecate (410 or Consolidate)

| Legacy URL | Action | Reason |
|-----------|--------|--------|
| `/service-package-basic` | 301 → `/pricing/` | Consolidate packages |
| Duplicate location pages | 410 or consolidate | Remove thin content |
| Old landing pages | 301 → best match | Reduce page bloat |

---

## XML Sitemap Strategy

### Sitemap Index Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://mybcat.com/sitemap-pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://mybcat.com/sitemap-blog.xml</loc>
  </sitemap>
  <sitemap>
    <loc>https://mybcat.com/sitemap-resources.xml</loc>
  </sitemap>
</sitemapindex>
```

### Sitemap Contents

**sitemap-pages.xml:**
- Homepage
- Solutions pages
- Industry pages
- Comparison pages
- Pricing
- About
- Contact
- Security

**sitemap-blog.xml:**
- All blog posts
- Blog category pages

**sitemap-resources.xml:**
- Case studies
- Glossary terms
- FAQ pages
- ROI Calculator

### Priority & Frequency Guidelines

| Page Type | Priority | Change Frequency |
|-----------|----------|------------------|
| Homepage | 1.0 | weekly |
| Solutions | 0.8 | monthly |
| Industries | 0.8 | monthly |
| Pricing | 0.9 | monthly |
| Comparisons | 0.7 | monthly |
| Blog Posts | 0.6 | weekly (index), monthly (posts) |
| Case Studies | 0.6 | monthly |
| Glossary | 0.4 | monthly |
| Legal Pages | 0.3 | yearly |
