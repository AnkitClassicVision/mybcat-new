# 06 — ASTRO FRAMEWORK REFERENCE

## Why Astro

Astro was selected for mybcat.com based on these criteria:

| Requirement | Astro Capability |
|-------------|------------------|
| Lighthouse 90+ Mobile | Zero JS by default, optimal CWV |
| SEO-friendly | Static HTML output, full crawlability |
| Code-first workflow | File-based routing, MDX support |
| Vercel deployment | Native adapter, one-click deploy |
| Minimal complexity | Simpler than Next.js for content sites |
| Answer-friendly | Clean semantic HTML output |

### Comparison Summary

| Factor | Astro | Next.js | Plain HTML |
|--------|-------|---------|------------|
| JS Payload | 0KB default | 70-100KB+ | 0KB |
| Build Complexity | Low | Medium | None |
| Content Authoring | MDX + Collections | MDX (more setup) | Manual |
| Interactivity | Islands (opt-in) | Full hydration | External scripts |
| Vercel Support | Native adapter | Native platform | Basic static |

---

## Initial Setup

### Create Project

```bash
# Create new Astro project
npm create astro@latest mybcat-website -- --template minimal

# Navigate to project
cd mybcat-website

# Add required integrations
npx astro add vercel
npx astro add mdx
npx astro add tailwind
npx astro add react  # For interactive islands

# Install additional dependencies
npm install @fontsource/inter  # Or your font choice
npm install sharp  # For image optimization
```

### Project Structure After Setup

```
mybcat-website/
├── astro.config.mjs
├── package.json
├── tailwind.config.mjs
├── tsconfig.json
├── public/
│   └── favicon.svg
└── src/
    ├── components/
    ├── content/
    ├── layouts/
    ├── pages/
    └── styles/
```

---

## Configuration Files

### astro.config.mjs

```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mybcat.com',
  output: 'static',
  
  adapter: vercel({
    imageService: true,
    webAnalytics: { enabled: true },
    speedInsights: { enabled: true },
  }),
  
  integrations: [
    mdx(),
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    sitemap({
      filter: (page) => !page.includes('/admin/') && !page.includes('/preview/'),
    }),
  ],
  
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
    domains: ['mybcat.com'],
  },
  
  build: {
    inlineStylesheets: 'auto',
    format: 'directory',
  },
  
  trailingSlash: 'always',
  
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
```

### tailwind.config.mjs

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        secondary: {
          500: '#8b5cf6',
          600: '#7c3aed',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#374151',
            h1: { fontWeight: '700' },
            h2: { fontWeight: '600' },
            a: { color: '#0284c7', textDecoration: 'none' },
            'a:hover': { textDecoration: 'underline' },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
```

### tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"],
      "@utils/*": ["src/utils/*"],
      "@content/*": ["src/content/*"]
    },
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

---

## Content Collections

### Configuration

Create `src/content/config.ts`:

```typescript
import { defineCollection, z } from 'astro:content';

// Blog post collection
const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(70),
    description: z.string().max(160),
    author: z.string(),
    date: z.date(),
    updatedDate: z.date().optional(),
    category: z.enum(['Operations', 'Growth', 'Technology', 'Industry']),
    tags: z.array(z.string()).default([]),
    image: z.string(),
    imageAlt: z.string().default(''),
    draft: z.boolean().default(false),
  }),
});

// Case study collection
const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    client: z.string(),
    industry: z.enum(['optometry', 'dental', 'veterinary', 'medspa', 'dermatology', 'urgent-care', 'ent']),
    challenge: z.string(),
    solution: z.string(),
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

// Glossary term collection
const glossary = defineCollection({
  type: 'content',
  schema: z.object({
    term: z.string(),
    definition: z.string().max(200),
    relatedTerms: z.array(z.string()).default([]),
    relatedSolutions: z.array(z.string()).default([]),
  }),
});

// FAQ collection
const faq = defineCollection({
  type: 'data',
  schema: z.object({
    category: z.string(),
    questions: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })),
  }),
});

export const collections = {
  blog,
  'case-studies': caseStudies,
  glossary,
  faq,
};
```

### Content File Examples

**Blog Post (`src/content/blog/reduce-no-shows.mdx`):**

```mdx
---
title: "How to Reduce No-Shows at Your Medical Practice"
description: "Reduce no-shows with these 10 proven strategies including confirmation calls, automated reminders, and same-day rebooking."
author: "Author Name"
date: 2025-01-15
category: "Operations"
tags: ["no-shows", "scheduling", "patient experience"]
image: "/images/blog/no-shows.jpg"
imageAlt: "Medical practice scheduling calendar"
draft: false
---

import Callout from '@components/content/Callout.astro';
import Stats from '@components/content/Stats.astro';

No-shows are one of the most frustrating problems in medical practice management...

<Callout type="stat">
  The average practice loses **$150,000+ annually** to no-shows and cancelled appointments.
</Callout>

## 1. Implement Confirmation Calls

Confirmation calls 24-48 hours before the appointment reduce no-shows by up to 30%...

<Stats items={[
  { value: "30%", label: "Reduction in no-shows" },
  { value: "24-48hrs", label: "Optimal confirmation timing" }
]} />
```

**Case Study (`src/content/case-studies/vision-plus.mdx`):**

```mdx
---
title: "How Vision Plus Optometry Increased Appointments by 42%"
client: "Vision Plus Optometry"
industry: "optometry"
challenge: "Missing 30% of calls during peak hours, inconsistent scheduling across 3 locations"
solution: "mybcat patient intake and recall services with centralized dashboard"
metrics:
  - label: "Call Answer Rate"
    value: "100%"
  - label: "More Booked Appointments"
    value: "+42%"
  - label: "Recovered Revenue (Year 1)"
    value: "$180K"
testimonial:
  quote: "mybcat transformed our front office operations. We're booking more patients than ever."
  author: "Dr. Sarah Chen"
  role: "Owner, Vision Plus Optometry"
date: 2024-11-01
image: "/images/case-studies/vision-plus.jpg"
---

## The Challenge

Vision Plus Optometry operates three locations in the Phoenix metro area...

## The Solution

After evaluating several options, Vision Plus chose mybcat's patient acquisition platform...

## The Results

Within the first 90 days, Vision Plus saw dramatic improvements...
```

---

## Component Architecture

### Base Layout

`src/layouts/BaseLayout.astro`:

```astro
---
import Header from '@components/common/Header.astro';
import Footer from '@components/common/Footer.astro';
import SEO from '@components/common/SEO.astro';
import '@/styles/global.css';

interface Props {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
  schema?: object | object[];
  noindex?: boolean;
}

const { title, description, image, canonical, schema, noindex } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <SEO
    title={title}
    description={description}
    image={image}
    canonical={canonical}
    noindex={noindex}
  />
  
  {schema && (
    <script type="application/ld+json" set:html={JSON.stringify(schema)} />
  )}
  
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
</head>
<body class="min-h-screen flex flex-col">
  <Header />
  
  <main class="flex-grow">
    <slot />
  </main>
  
  <Footer />
</body>
</html>
```

### SEO Component

`src/components/common/SEO.astro`:

```astro
---
interface Props {
  title: string;
  description: string;
  image?: string;
  canonical?: string;
  noindex?: boolean;
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    author?: string;
  };
}

const {
  title,
  description,
  image = '/images/og/default.jpg',
  canonical,
  noindex = false,
  article,
} = Astro.props;

const siteUrl = 'https://mybcat.com';
const pageUrl = canonical || `${siteUrl}${Astro.url.pathname}`;
const imageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
const fullTitle = title.includes('mybcat') ? title : `${title} | mybcat`;
---

<title>{fullTitle}</title>
<meta name="description" content={description}>
<link rel="canonical" href={pageUrl}>

{noindex && <meta name="robots" content="noindex, nofollow">}

<!-- Open Graph -->
<meta property="og:type" content={article ? 'article' : 'website'}>
<meta property="og:title" content={fullTitle}>
<meta property="og:description" content={description}>
<meta property="og:image" content={imageUrl}>
<meta property="og:url" content={pageUrl}>
<meta property="og:site_name" content="mybcat">
<meta property="og:locale" content="en_US">

{article && (
  <>
    <meta property="article:published_time" content={article.publishedTime}>
    {article.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime}>}
    {article.author && <meta property="article:author" content={article.author}>}
  </>
)}

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content={fullTitle}>
<meta name="twitter:description" content={description}>
<meta name="twitter:image" content={imageUrl}>
```

### Breadcrumb Component

`src/components/common/Breadcrumb.astro`:

```astro
---
interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface Props {
  items: BreadcrumbItem[];
}

const { items } = Astro.props;
---

<nav aria-label="Breadcrumb" class="text-sm text-gray-600 mb-6">
  <ol class="flex items-center space-x-2" itemscope itemtype="https://schema.org/BreadcrumbList">
    {items.map((item, index) => (
      <li
        class="flex items-center"
        itemprop="itemListElement"
        itemscope
        itemtype="https://schema.org/ListItem"
      >
        {index > 0 && <span class="mx-2">/</span>}
        {item.url ? (
          <a href={item.url} itemprop="item" class="hover:text-primary-600">
            <span itemprop="name">{item.name}</span>
          </a>
        ) : (
          <span itemprop="name" class="text-gray-900 font-medium">{item.name}</span>
        )}
        <meta itemprop="position" content={String(index + 1)}>
      </li>
    ))}
  </ol>
</nav>
```

---

## Islands Architecture

For interactive components, use Astro Islands with React:

### Contact Form Island

`src/components/islands/ContactForm.tsx`:

```tsx
import { useState, type FormEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  phone: string;
  practice: string;
  message: string;
}

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: FormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      practice: formData.get('practice') as string,
      message: formData.get('message') as string,
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Submission failed');
      
      setIsSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-green-800">Thank you!</h3>
        <p className="text-green-700">We'll be in touch within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      
      <div>
        <label htmlFor="practice" className="block text-sm font-medium text-gray-700">
          Practice Name
        </label>
        <input
          type="text"
          id="practice"
          name="practice"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message (optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary-600 text-white py-3 px-4 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Submitting...' : 'Book Your Demo'}
      </button>
    </form>
  );
}
```

### Using Islands in Astro

```astro
---
import ContactForm from '@components/islands/ContactForm';
---

<section class="py-16 bg-gray-50">
  <div class="max-w-md mx-auto px-4">
    <h2 class="text-2xl font-bold mb-6">Book Your Demo</h2>
    
    <!-- client:load = hydrate immediately -->
    <ContactForm client:load />
    
    <!-- Other directives: -->
    <!-- client:idle = hydrate when browser is idle -->
    <!-- client:visible = hydrate when component is visible -->
    <!-- client:media="(max-width: 768px)" = hydrate based on media query -->
  </div>
</section>
```

---

## Page Examples

### Homepage

`src/pages/index.astro`:

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
import Hero from '@components/sections/Hero.astro';
import Problem from '@components/sections/Problem.astro';
import Solution from '@components/sections/Solution.astro';
import Industries from '@components/sections/Industries.astro';
import Testimonials from '@components/sections/Testimonials.astro';
import FAQ from '@components/sections/FAQ.astro';
import CTA from '@components/sections/CTA.astro';
import { generateOrganizationSchema, generateWebSiteSchema, generateFAQSchema } from '@utils/schema';

const homeFAQs = [
  { question: "Is mybcat HIPAA compliant?", answer: "Yes, mybcat is fully HIPAA compliant..." },
  { question: "How quickly can we get started?", answer: "Most practices are onboarded in 2-3 weeks..." },
];

const schema = [
  generateOrganizationSchema(),
  generateWebSiteSchema(),
  generateFAQSchema(homeFAQs),
];
---

<BaseLayout
  title="Patient Acquisition Platform for Healthcare | mybcat"
  description="Stop losing patients to voicemail. mybcat ensures 100% of calls answered and appointments booked. See how it works."
  schema={schema}
>
  <Hero />
  <Problem />
  <Solution />
  <Industries />
  <Testimonials />
  <FAQ items={homeFAQs} />
  <CTA />
</BaseLayout>
```

### Blog Post (Dynamic)

`src/pages/blog/[...slug].astro`:

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '@layouts/BaseLayout.astro';
import Breadcrumb from '@components/common/Breadcrumb.astro';
import AuthorBio from '@components/blog/AuthorBio.astro';
import RelatedPosts from '@components/blog/RelatedPosts.astro';
import { generateBreadcrumbSchema, generateArticleSchema } from '@utils/schema';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await post.render();

const breadcrumbs = [
  { name: 'Home', url: 'https://mybcat.com/' },
  { name: 'Blog', url: 'https://mybcat.com/blog/' },
  { name: post.data.title },
];

const schema = [
  generateBreadcrumbSchema(breadcrumbs),
  generateArticleSchema({
    headline: post.data.title,
    description: post.data.description,
    image: `https://mybcat.com${post.data.image}`,
    author: post.data.author,
    datePublished: post.data.date.toISOString(),
    dateModified: post.data.updatedDate?.toISOString(),
    url: `https://mybcat.com/blog/${post.slug}/`,
  }),
];
---

<BaseLayout
  title={`${post.data.title} | mybcat Blog`}
  description={post.data.description}
  image={post.data.image}
  schema={schema}
>
  <article class="max-w-3xl mx-auto px-4 py-12">
    <Breadcrumb items={breadcrumbs} />
    
    <header class="mb-8">
      <h1 class="text-4xl font-bold mb-4">{post.data.title}</h1>
      <div class="text-gray-600">
        <span>By {post.data.author}</span>
        <span class="mx-2">•</span>
        <time datetime={post.data.date.toISOString()}>
          {post.data.date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </time>
      </div>
    </header>
    
    <img 
      src={post.data.image} 
      alt={post.data.imageAlt}
      class="w-full rounded-lg mb-8"
    />
    
    <div class="prose prose-lg max-w-none">
      <Content />
    </div>
    
    <AuthorBio author={post.data.author} />
    <RelatedPosts currentSlug={post.slug} category={post.data.category} />
  </article>
</BaseLayout>
```

---

## Performance Optimization

### Image Optimization

Use Astro's `<Image>` component:

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/images/hero.jpg';
---

<Image
  src={heroImage}
  alt="Patient coordinator dashboard"
  width={1200}
  height={630}
  format="webp"
  quality={80}
  loading="eager"  <!-- For above-fold images -->
/>

<!-- For below-fold images -->
<Image
  src={heroImage}
  alt="..."
  loading="lazy"
/>
```

### Font Optimization

```astro
---
// In BaseLayout.astro
---
<head>
  <!-- Preload critical font -->
  <link
    rel="preload"
    href="/fonts/inter-var.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />
  
  <!-- Font face definition -->
  <style is:inline>
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 100 900;
      font-display: swap;
      src: url('/fonts/inter-var.woff2') format('woff2');
    }
  </style>
</head>
```

### CSS Optimization

Astro automatically:
- Scopes component CSS
- Removes unused styles
- Inlines critical CSS

For global styles, use `src/styles/global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

/* Critical above-fold styles */
@layer base {
  html {
    scroll-behavior: smooth;
  }
  
  body {
    @apply antialiased text-gray-900;
  }
}
```

---

## Development Commands

```bash
# Development
npm run dev              # Start dev server at localhost:4321
npm run dev -- --host    # Expose to network

# Build
npm run build            # Production build to ./dist
npm run preview          # Preview production build

# Type checking
npm run astro check      # Run Astro type checking
npx tsc --noEmit         # Run TypeScript checking

# Lint
npm run lint             # Run ESLint
npm run lint:fix         # Fix auto-fixable issues
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "lint": "eslint src --ext .ts,.tsx,.astro",
    "lint:fix": "eslint src --ext .ts,.tsx,.astro --fix",
    "typecheck": "astro check && tsc --noEmit",
    "check-links": "linkinator ./dist --recurse --skip 'linkedin|twitter'",
    "lighthouse": "lhci autorun"
  }
}
```
