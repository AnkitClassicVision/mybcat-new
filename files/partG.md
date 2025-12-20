Part G: Implementation Blueprint for Claude Code CLI
Repository Structure
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
Conventions for Adding Pages
Adding a New Solution Page:

Create src/pages/solutions/[solution-name].astro
Use LandingLayout with appropriate schema
Follow Solution Page Template structure
Add to navigation data in src/data/navigation.ts
Update sitemap generation

Adding a New Blog Post:

Create src/content/blog/[slug].mdx
Include required frontmatter:

yaml---
title: "Post Title"
description: "Meta description"
author: "Author Name"
date: 2025-12-19
category: "Category"
tags: ["tag1", "tag2"]
image: "/images/blog/featured.jpg"
---

Write content in MDX
Run npm run build to validate

Content Pipeline (MD/MDX + Frontmatter)
Content Collection Schema (src/content/config.ts):
typescriptimport { defineCollection, z } from 'astro:content';

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
CI Checks
.github/workflows/ci.yml:
yamlname: CI

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
lighthouserc.json:
json{
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
Rollout Phases
Phase 1: MVP (Days 1-30)

 Repository setup with Astro + Vercel
 Base layout and global components
 Homepage (new design)
 3 solution pages (Patient Intake, Recall, No-Show)
 5 industry pages (Optometry, Dental, Veterinary, Medspa, Dermatology)
 Pricing page
 About page
 Contact/Demo booking integration
 Basic blog index + 5 migrated posts
 301 redirects from legacy URLs
 Google Search Console setup

Phase 2: Content Expansion (Days 31-60)

 Remaining solution pages
 Remaining industry pages (Urgent Care, ENT)
 2 comparison pages (vs Hello Rache, vs HireTeem)
 FAQ hub
 Security & Compliance page
 3 case studies
 10 additional blog posts
 Glossary (20 terms)
 ROI Calculator (interactive island)

Phase 3: Programmatic Pages (Days 61-90)

 Remaining comparison pages
 Expanded glossary (50+ terms)
 Blog category pages
 Automated sitemap generation
 Schema markup audit and optimization
 Link building outreach assets
 Analytics and conversion tracking refinement