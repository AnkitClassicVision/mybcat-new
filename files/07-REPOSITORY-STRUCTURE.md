# 07 — REPOSITORY STRUCTURE REFERENCE

## Complete Folder Structure

```
mybcat-website/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # Lint, typecheck, build
│   │   ├── lighthouse.yml            # Lighthouse CI checks
│   │   └── deploy-preview.yml        # Preview deployment comments
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── CODEOWNERS
│
├── public/
│   ├── fonts/
│   │   └── inter-var.woff2
│   ├── images/
│   │   ├── blog/
│   │   ├── case-studies/
│   │   ├── icons/
│   │   ├── og/                       # Open Graph images
│   │   ├── team/
│   │   └── logos/
│   ├── favicon.svg
│   ├── favicon.ico
│   ├── apple-touch-icon.png
│   ├── robots.txt
│   └── site.webmanifest
│
├── src/
│   ├── assets/                       # Processed by Astro
│   │   └── images/
│   │       ├── hero.jpg
│   │       └── ...
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Navigation.astro
│   │   │   ├── MobileNav.astro
│   │   │   ├── Breadcrumb.astro
│   │   │   ├── SEO.astro
│   │   │   ├── Button.astro
│   │   │   ├── Card.astro
│   │   │   └── Logo.astro
│   │   │
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── HeroSimple.astro
│   │   │   ├── Problem.astro
│   │   │   ├── Solution.astro
│   │   │   ├── Features.astro
│   │   │   ├── Industries.astro
│   │   │   ├── Testimonials.astro
│   │   │   ├── FAQ.astro
│   │   │   ├── CTA.astro
│   │   │   ├── CTABanner.astro
│   │   │   ├── Pricing.astro
│   │   │   ├── ComparisonTable.astro
│   │   │   ├── Stats.astro
│   │   │   └── ProcessSteps.astro
│   │   │
│   │   ├── content/
│   │   │   ├── Callout.astro
│   │   │   ├── TipBox.astro
│   │   │   ├── StatCard.astro
│   │   │   ├── Quote.astro
│   │   │   ├── KeyTakeaways.astro
│   │   │   └── TableOfContents.astro
│   │   │
│   │   ├── blog/
│   │   │   ├── PostCard.astro
│   │   │   ├── PostList.astro
│   │   │   ├── AuthorBio.astro
│   │   │   ├── RelatedPosts.astro
│   │   │   └── CategoryBadge.astro
│   │   │
│   │   ├── case-studies/
│   │   │   ├── CaseStudyCard.astro
│   │   │   ├── MetricsDisplay.astro
│   │   │   └── TestimonialBlock.astro
│   │   │
│   │   ├── forms/
│   │   │   ├── Input.astro
│   │   │   ├── Textarea.astro
│   │   │   ├── Select.astro
│   │   │   └── FormField.astro
│   │   │
│   │   └── islands/                  # Interactive React components
│   │       ├── ContactForm.tsx
│   │       ├── ROICalculator.tsx
│   │       ├── MobileNavToggle.tsx
│   │       ├── FAQAccordion.tsx
│   │       └── NewsletterSignup.tsx
│   │
│   ├── content/
│   │   ├── config.ts                 # Content collection schemas
│   │   ├── blog/
│   │   │   ├── reduce-no-shows.mdx
│   │   │   ├── cost-of-missed-calls.mdx
│   │   │   └── ...
│   │   ├── case-studies/
│   │   │   ├── vision-plus.mdx
│   │   │   └── ...
│   │   ├── glossary/
│   │   │   ├── patient-acquisition.mdx
│   │   │   ├── hipaa-compliance.mdx
│   │   │   └── ...
│   │   └── faq/
│   │       ├── general.json
│   │       ├── pricing.json
│   │       ├── security.json
│   │       └── technical.json
│   │
│   ├── data/
│   │   ├── navigation.ts             # Nav menu structure
│   │   ├── testimonials.ts           # Testimonial data
│   │   ├── industries.ts             # Industry metadata
│   │   ├── solutions.ts              # Solution metadata
│   │   ├── integrations.ts           # EHR/PMS integrations list
│   │   └── team.ts                   # Team member data
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro          # Base HTML structure
│   │   ├── PageLayout.astro          # Standard page with header/footer
│   │   ├── BlogLayout.astro          # Blog post layout
│   │   ├── LandingLayout.astro       # Landing page (solutions, industries)
│   │   └── MinimalLayout.astro       # Minimal for legal pages
│   │
│   ├── pages/
│   │   ├── index.astro               # Homepage
│   │   ├── pricing.astro
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── security.astro
│   │   ├── careers.astro
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── 404.astro
│   │   │
│   │   ├── solutions/
│   │   │   ├── index.astro
│   │   │   ├── patient-intake.astro
│   │   │   ├── recall-reactivation.astro
│   │   │   ├── no-show-recovery.astro
│   │   │   ├── front-office-operations.astro
│   │   │   └── integrations.astro
│   │   │
│   │   ├── industries/
│   │   │   ├── index.astro
│   │   │   ├── optometry.astro
│   │   │   ├── dental.astro
│   │   │   ├── veterinary.astro
│   │   │   ├── medspa.astro
│   │   │   ├── dermatology.astro
│   │   │   ├── urgent-care.astro
│   │   │   └── ent.astro
│   │   │
│   │   ├── compare/
│   │   │   ├── index.astro
│   │   │   ├── vs-virtual-assistants.astro
│   │   │   ├── vs-call-centers.astro
│   │   │   ├── vs-ai-receptionists.astro
│   │   │   ├── vs-hello-rache.astro
│   │   │   └── vs-hireteem.astro
│   │   │
│   │   ├── blog/
│   │   │   ├── index.astro           # Blog listing
│   │   │   ├── [...slug].astro       # Dynamic blog posts
│   │   │   └── category/
│   │   │       └── [category].astro  # Category pages
│   │   │
│   │   ├── case-studies/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro
│   │   │
│   │   ├── glossary/
│   │   │   ├── index.astro
│   │   │   └── [...term].astro
│   │   │
│   │   ├── faq/
│   │   │   └── index.astro
│   │   │
│   │   ├── resources/
│   │   │   ├── index.astro
│   │   │   └── roi-calculator.astro
│   │   │
│   │   └── how-it-works.astro
│   │
│   ├── styles/
│   │   ├── global.css                # Tailwind + global styles
│   │   └── prose.css                 # Typography for MDX content
│   │
│   ├── utils/
│   │   ├── schema.ts                 # JSON-LD schema generators
│   │   ├── seo.ts                    # SEO utility functions
│   │   ├── formatting.ts             # Date, number formatting
│   │   ├── content.ts                # Content helper functions
│   │   └── analytics.ts              # Analytics event helpers
│   │
│   └── env.d.ts                      # TypeScript env definitions
│
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc
├── astro.config.mjs
├── package.json
├── package-lock.json
├── tailwind.config.mjs
├── tsconfig.json
├── vercel.json
├── lighthouserc.json
└── README.md
```

---

## File Naming Conventions

### Pages (`.astro`)

| Type | Convention | Example |
|------|------------|---------|
| Static page | `kebab-case.astro` | `patient-intake.astro` |
| Dynamic (single) | `[param].astro` | `[slug].astro` |
| Dynamic (catch-all) | `[...param].astro` | `[...slug].astro` |
| Index | `index.astro` | `index.astro` |

### Components (`.astro`, `.tsx`)

| Type | Convention | Example |
|------|------------|---------|
| Astro component | `PascalCase.astro` | `Hero.astro` |
| React island | `PascalCase.tsx` | `ContactForm.tsx` |
| Utility component | `PascalCase.astro` | `Button.astro` |

### Content (`.mdx`, `.json`)

| Type | Convention | Example |
|------|------------|---------|
| Blog post | `kebab-case.mdx` | `reduce-no-shows.mdx` |
| Case study | `kebab-case.mdx` | `vision-plus.mdx` |
| Glossary term | `kebab-case.mdx` | `patient-acquisition.mdx` |
| Data file | `kebab-case.json` | `general.json` |

### Utilities (`.ts`)

| Type | Convention | Example |
|------|------------|---------|
| Utility module | `camelCase.ts` | `schema.ts` |
| Type definitions | `camelCase.ts` | `types.ts` |
| Constants | `SCREAMING_SNAKE` in file | `export const MAX_POSTS = 10` |

---

## Data Files

### navigation.ts

```typescript
// src/data/navigation.ts

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const mainNavigation: NavItem[] = [
  {
    label: 'Solutions',
    href: '/solutions/',
    children: [
      { label: 'Patient Intake & Scheduling', href: '/solutions/patient-intake/' },
      { label: 'Recall & Reactivation', href: '/solutions/recall-reactivation/' },
      { label: 'No-Show Recovery', href: '/solutions/no-show-recovery/' },
      { label: 'Front Office Operations', href: '/solutions/front-office-operations/' },
      { label: 'How It Works', href: '/how-it-works/' },
      { label: 'Integrations', href: '/solutions/integrations/' },
    ],
  },
  {
    label: 'Industries',
    href: '/industries/',
    children: [
      { label: 'Optometry & Ophthalmology', href: '/industries/optometry/' },
      { label: 'Dental', href: '/industries/dental/' },
      { label: 'Veterinary', href: '/industries/veterinary/' },
      { label: 'Medspa & Aesthetics', href: '/industries/medspa/' },
      { label: 'Dermatology', href: '/industries/dermatology/' },
      { label: 'Urgent Care', href: '/industries/urgent-care/' },
      { label: 'ENT', href: '/industries/ent/' },
    ],
  },
  {
    label: 'Compare',
    href: '/compare/',
    children: [
      { label: 'vs Virtual Assistants', href: '/compare/vs-virtual-assistants/' },
      { label: 'vs Call Centers', href: '/compare/vs-call-centers/' },
      { label: 'vs AI Receptionists', href: '/compare/vs-ai-receptionists/' },
      { label: 'vs Hello Rache', href: '/compare/vs-hello-rache/' },
      { label: 'vs HireTeem', href: '/compare/vs-hireteem/' },
    ],
  },
  {
    label: 'Pricing',
    href: '/pricing/',
  },
  {
    label: 'Resources',
    href: '/resources/',
    children: [
      { label: 'Blog', href: '/blog/' },
      { label: 'Case Studies', href: '/case-studies/' },
      { label: 'ROI Calculator', href: '/resources/roi-calculator/' },
      { label: 'Glossary', href: '/glossary/' },
      { label: 'FAQ', href: '/faq/' },
    ],
  },
];

export const footerNavigation = {
  solutions: [
    { label: 'Patient Intake', href: '/solutions/patient-intake/' },
    { label: 'Recall & Reactivation', href: '/solutions/recall-reactivation/' },
    { label: 'No-Show Recovery', href: '/solutions/no-show-recovery/' },
    { label: 'Front Office Operations', href: '/solutions/front-office-operations/' },
    { label: 'Integrations', href: '/solutions/integrations/' },
  ],
  industries: [
    { label: 'Optometry', href: '/industries/optometry/' },
    { label: 'Dental', href: '/industries/dental/' },
    { label: 'Veterinary', href: '/industries/veterinary/' },
    { label: 'Medspa', href: '/industries/medspa/' },
    { label: 'Dermatology', href: '/industries/dermatology/' },
    { label: 'Urgent Care', href: '/industries/urgent-care/' },
  ],
  company: [
    { label: 'About', href: '/about/' },
    { label: 'Careers', href: '/careers/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Security', href: '/security/' },
  ],
  resources: [
    { label: 'Blog', href: '/blog/' },
    { label: 'Case Studies', href: '/case-studies/' },
    { label: 'FAQ', href: '/faq/' },
    { label: 'Glossary', href: '/glossary/' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy/' },
    { label: 'Terms of Service', href: '/terms/' },
  ],
};
```

### testimonials.ts

```typescript
// src/data/testimonials.ts

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  industry: string;
  image?: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: "We went from missing 30% of calls to answering every single one. Our schedule is fuller than ever.",
    author: "Dr. Sarah Chen",
    role: "Owner",
    company: "Vision Plus Optometry",
    industry: "optometry",
    image: "/images/testimonials/sarah-chen.jpg",
  },
  {
    quote: "mybcat understands optometry. They handle our calls like they're part of our team.",
    author: "Dr. Michael Torres",
    role: "Managing Partner",
    company: "EyeCare Associates",
    industry: "optometry",
  },
  {
    quote: "The dashboard gives me visibility I never had before. I can see exactly what's happening across all three locations.",
    author: "Jennifer Adams",
    role: "Practice Administrator",
    company: "Dental Partners Group",
    industry: "dental",
  },
];

export function getTestimonialsByIndustry(industry: string): Testimonial[] {
  return testimonials.filter((t) => t.industry === industry);
}
```

### industries.ts

```typescript
// src/data/industries.ts

export interface Industry {
  slug: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  primaryEHR: string[];
  keyPainPoints: string[];
  keyMetrics: { label: string; value: string }[];
}

export const industries: Industry[] = [
  {
    slug: 'optometry',
    name: 'Optometry & Ophthalmology',
    shortName: 'Optometry',
    description: 'Patient acquisition and intake services for eye care practices.',
    icon: 'eye',
    primaryEHR: ['Eyefinity', 'RevolutionEHR', 'Crystal PM', 'Compulink'],
    keyPainPoints: [
      'Annual exam recall',
      'Optical sales capture',
      'Vision insurance complexity',
      'After-hours inquiries',
    ],
    keyMetrics: [
      { label: 'Avg lost revenue to missed calls', value: '$127,000/year' },
      { label: 'Typical no-show rate', value: '15-25%' },
    ],
  },
  {
    slug: 'dental',
    name: 'Dental',
    shortName: 'Dental',
    description: 'Patient acquisition and scheduling for dental practices.',
    icon: 'tooth',
    primaryEHR: ['Dentrix', 'Eaglesoft', 'Open Dental', 'Curve Dental'],
    keyPainPoints: [
      'Hygiene recall management',
      'Treatment acceptance follow-up',
      'New patient conversion',
      'Emergency call handling',
    ],
    keyMetrics: [
      { label: 'Avg lost revenue to missed calls', value: '$150,000/year' },
      { label: 'Typical hygiene recall rate', value: '45-65%' },
    ],
  },
  // ... more industries
];

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((i) => i.slug === slug);
}
```

---

## Adding New Pages

### Adding a New Blog Post

1. Create file: `src/content/blog/[slug].mdx`

```mdx
---
title: "Your Post Title Here"
description: "Meta description under 160 characters"
author: "Author Name"
date: 2025-01-20
category: "Operations"
tags: ["tag1", "tag2"]
image: "/images/blog/your-image.jpg"
imageAlt: "Description of image"
draft: false
---

Your content here...
```

2. Add image to `public/images/blog/`

3. Run `npm run build` to validate schema

### Adding a New Industry Page

1. Create file: `src/pages/industries/[industry].astro`

```astro
---
import LandingLayout from '@layouts/LandingLayout.astro';
import { getIndustryBySlug } from '@data/industries';
import IndustryHero from '@components/sections/IndustryHero.astro';
import IndustryChallenges from '@components/sections/IndustryChallenges.astro';
import IndustrySolution from '@components/sections/IndustrySolution.astro';
import IndustryFAQ from '@components/sections/IndustryFAQ.astro';
import CTA from '@components/sections/CTA.astro';

const industry = getIndustryBySlug('new-industry');
---

<LandingLayout
  title={`${industry.name} Answering Service | mybcat`}
  description={industry.description}
>
  <IndustryHero industry={industry} />
  <IndustryChallenges industry={industry} />
  <IndustrySolution industry={industry} />
  <IndustryFAQ industry={industry} />
  <CTA />
</LandingLayout>
```

2. Add industry data to `src/data/industries.ts`

3. Add to navigation in `src/data/navigation.ts`

4. Create OG image in `public/images/og/`

### Adding a New Comparison Page

1. Create file: `src/pages/compare/vs-[competitor].astro`

2. Follow comparison template from `03-PAGE-TEMPLATES.md`

3. Add to navigation

4. Add redirect if replacing legacy URL

---

## Git Workflow

### Branch Naming

| Type | Convention | Example |
|------|------------|---------|
| Feature | `feature/[description]` | `feature/add-dental-page` |
| Fix | `fix/[description]` | `fix/broken-nav-link` |
| Content | `content/[description]` | `content/new-blog-post` |
| Chore | `chore/[description]` | `chore/update-deps` |

### Commit Messages

Follow conventional commits:

```
feat: add dental industry page
fix: correct broken link on homepage
content: add blog post about no-shows
chore: update dependencies
docs: update README with setup instructions
style: format code with prettier
refactor: simplify schema utility
```

### Pull Request Template

```markdown
## Description
[Brief description of changes]

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Content update
- [ ] Documentation
- [ ] Other: ___

## Checklist
- [ ] Lighthouse scores pass (90+)
- [ ] Schema validates
- [ ] No broken links
- [ ] Mobile responsive
- [ ] Tested in preview deployment

## Screenshots
[If applicable]
```

---

## Environment Variables

### Required for Production

```env
# .env (local development)
# .env.production (production)

# Site URL (used for canonical URLs, sitemaps)
SITE_URL=https://mybcat.com

# Analytics (if using)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Form handling (if using external service)
FORM_ENDPOINT=https://api.example.com/forms

# Optional: API keys for integrations
HUBSPOT_API_KEY=xxxxx
```

### Accessing in Astro

```astro
---
const siteUrl = import.meta.env.SITE_URL || 'https://mybcat.com';
const gaId = import.meta.env.GOOGLE_ANALYTICS_ID;
---
```

---

## CI/CD Configuration

### GitHub Actions: CI

`.github/workflows/ci.yml`:

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
      
      - name: Setup Node
        uses: actions/setup-node@v4
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
      
      - name: Check links
        run: npm run check-links
      
      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

### GitHub Actions: Lighthouse

`.github/workflows/lighthouse.yml`:

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### Lighthouse Configuration

`lighthouserc.json`:

```json
{
  "ci": {
    "collect": {
      "staticDistDir": "./dist",
      "url": [
        "/",
        "/solutions/patient-intake/",
        "/industries/optometry/",
        "/pricing/",
        "/blog/"
      ]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```
