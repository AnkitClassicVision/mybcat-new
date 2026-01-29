# SEO Fix Implementation Plan for mybcat.com

**Created:** January 29, 2026
**Source:** Agent Team Synthesis (Codex + Gemini + Claude Code)
**Status:** Ready for Implementation

---

## Overview

This document provides a comprehensive implementation plan to fix all 10 SEO issues identified in the mybcat.com audit. Each issue includes clear objectives, success criteria, specific files to modify, code changes, and testing steps.

**Expected Impact:** Overall health score improvement from 60/100 (D) to 85+/100 (B+)

---

## Issue #1: Redirect Chains (196 instances)

### Objective
Eliminate all 308 redirect chains caused by internal links missing trailing slashes.

### Root Cause
The site uses `trailingSlash: 'always'` in Astro config, but internal links in components don't include trailing slashes, causing redirects like `/solutions` → `/solutions/`.

### Success Criteria
- [ ] Zero 308 redirects for internal navigation
- [ ] All internal `href` attributes end with `/`
- [ ] SquirrelScan Links score improves from 56 to 85+

### Files to Modify

| File | Location | Action |
|------|----------|--------|
| `src/components/Nav.astro` | Lines with `href="/..."` | Add trailing slashes |
| `src/components/Footer.astro` | Lines 20-87 | Verify all have trailing slashes (already OK) |
| `src/components/common/Breadcrumb.astro` | Link generation | Ensure trailing slashes |
| `src/layouts/BlogLayout.astro` | Line 38, 110-114 | Add trailing slashes to links |
| `src/pages/blog/index.astro` | Post card links | Use `/${post.slug}/` |
| `src/content/blog/*.md` | All internal links | Add trailing slashes |

### Code Changes

**1. Create a Link Utility (NEW FILE: `src/utils/links.ts`)**
```typescript
/**
 * Ensures internal links have trailing slashes
 */
export function normalizeLink(href: string): string {
  // Skip external links, anchors, query strings, and file extensions
  if (
    href.startsWith('http') ||
    href.startsWith('#') ||
    href.includes('?') ||
    /\.\w{2,4}$/.test(href)
  ) {
    return href;
  }

  // Add trailing slash if missing
  return href.endsWith('/') ? href : `${href}/`;
}
```

**2. Update Nav.astro Links**
```astro
<!-- Before -->
<a href="/solutions">Solutions</a>

<!-- After -->
<a href="/solutions/">Solutions</a>
```

**3. Create Codemod Script (NEW FILE: `scripts/fix-trailing-slashes.js`)**
```javascript
#!/usr/bin/env node
/**
 * Fixes internal links missing trailing slashes
 * Run: node scripts/fix-trailing-slashes.js --dry-run
 */
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const DRY_RUN = process.argv.includes('--dry-run');

// Pattern: href="/path" without trailing slash (excluding files with extensions)
const LINK_PATTERN = /href="(\/[a-z0-9\-\/]+)(?<!\/)"/gi;

async function fixFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fixed = content.replace(LINK_PATTERN, (match, path) => {
    // Skip if already has slash or is a file
    if (path.endsWith('/') || /\.\w+$/.test(path)) return match;
    console.log(`  ${path} → ${path}/`);
    return `href="${path}/"`;
  });

  if (content !== fixed && !DRY_RUN) {
    fs.writeFileSync(filePath, fixed);
  }
  return content !== fixed;
}

async function main() {
  const files = await glob('src/**/*.{astro,md,mdx}');
  let changed = 0;

  for (const file of files) {
    if (await fixFile(file)) changed++;
  }

  console.log(`\n${DRY_RUN ? 'Would fix' : 'Fixed'} ${changed} files`);
}

main();
```

### Testing Steps
1. Run `node scripts/fix-trailing-slashes.js --dry-run` to preview changes
2. Run `node scripts/fix-trailing-slashes.js` to apply fixes
3. Run `npm run build` to verify no broken links
4. Run `squirrel audit https://mybcat.com --refresh` to verify redirects eliminated

---

## Issue #2: JSON-LD Validation Errors (186 pages)

### Objective
Fix Schema.org validation errors for logo format and missing @context.

### Root Cause
1. `Organization.logo` uses `ImageObject` but validator expects string URL
2. Individual schemas in `@graph` may need proper structure

### Success Criteria
- [ ] Google Rich Results Test passes with zero errors
- [ ] SquirrelScan Structured Data score improves from 72 to 95+
- [ ] All 186 pages have valid JSON-LD

### Files to Modify

| File | Location | Action |
|------|----------|--------|
| `src/utils/schema.ts` | Lines 51-56, 241-249, 264-268, 341-345 | Fix logo format, improve combineSchemas |
| `src/data/company.ts` | Address section | Add streetAddress |

### Code Changes

**1. Fix `src/utils/schema.ts` - Logo Format**
```typescript
// BEFORE (Lines 51-56)
logo: {
  '@type': 'ImageObject',
  url: `${company.site.url}/images/logo.webp`,
  width: 300,
  height: 60
}

// AFTER - Use string URL for Google compatibility
logo: `${company.site.url}/images/logo.webp`
```

**2. Fix `src/utils/schema.ts` - combineSchemas Function**
```typescript
// BEFORE (Lines 241-249)
export function combineSchemas(...schemas: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.map(schema => {
      const { '@context': _, ...rest } = schema as { '@context'?: string };
      return rest;
    })
  };
}

// AFTER - Filter invalid inputs and ensure proper structure
export function combineSchemas(...schemas: object[]) {
  const validSchemas = schemas.filter(
    (s): s is object => s != null && typeof s === 'object'
  );

  if (validSchemas.length === 0) {
    return { '@context': 'https://schema.org' };
  }

  return {
    '@context': 'https://schema.org',
    '@graph': validSchemas.map(schema => {
      const { '@context': _, ...rest } = schema as { '@context'?: string };
      return rest;
    })
  };
}
```

**3. Fix `src/data/company.ts` - Add Street Address**
```typescript
// BEFORE
address: {
  city: 'Marietta',
  state: 'GA',
  zip: '30060',
  country: 'US'
}

// AFTER
address: {
  streetAddress: '1234 Business Park Drive', // Add actual address
  city: 'Marietta',
  state: 'GA',
  zip: '30060',
  country: 'US'
}
```

**4. Apply Same Logo Fix to Other Functions**
- `generateProfessionalServiceSchema()` (Lines 264-268)
- `generateLocalBusinessSchema()` (Lines 341-345)

### Testing Steps
1. Run `npm run build`
2. Open homepage in browser, view source, copy JSON-LD
3. Paste into [Schema.org Validator](https://validator.schema.org/)
4. Paste into [Google Rich Results Test](https://search.google.com/test/rich-results)
5. Verify zero errors

---

## Issue #3: Title Tags Wrong Length (111 pages)

### Objective
Optimize all title tags to be 30-60 characters (ideal: 50-60).

### Root Cause
- 106 titles too long (>60 chars) - mostly blog posts with long headlines
- 5 titles too short (<30 chars) - glossary and terms pages

### Success Criteria
- [ ] All titles between 30-60 characters
- [ ] Core SEO score improves from 94 to 98+
- [ ] Better SERP display (no truncation)

### Files to Modify

| File Type | Action |
|-----------|--------|
| Blog posts (106 files) | Add `seoTitle` frontmatter override |
| `src/pages/glossary/*.astro` | Update title generation |
| `src/pages/terms.astro` | Expand title |

### Code Changes

**1. Blog Posts - Add seoTitle Frontmatter**

For each long title, add a shorter `seoTitle` in frontmatter:

```markdown
---
title: 'Compliance and Security in Utilizing Virtual Assistants in Ophthalmology and Optometry Practices'
seoTitle: 'VA Compliance & Security for Eye Care | MyBCAT'
---
```

**2. Create Script to Identify Long Titles (NEW FILE: `scripts/audit-titles.js`)**
```javascript
#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { glob } from 'glob';

const MIN_LENGTH = 30;
const MAX_LENGTH = 60;

async function main() {
  const files = await glob('src/content/blog/*.{md,mdx}');
  const issues = { tooLong: [], tooShort: [] };

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const { data } = matter(content);
    const title = data.seoTitle || data.title;
    const fullTitle = `${title} | MyBCAT Blog`;

    if (fullTitle.length > MAX_LENGTH) {
      issues.tooLong.push({ file: path.basename(file), length: fullTitle.length, title });
    } else if (fullTitle.length < MIN_LENGTH) {
      issues.tooShort.push({ file: path.basename(file), length: fullTitle.length, title });
    }
  }

  console.log('=== TOO LONG (>60 chars) ===');
  issues.tooLong.forEach(i => console.log(`${i.length} chars: ${i.file}`));

  console.log('\n=== TOO SHORT (<30 chars) ===');
  issues.tooShort.forEach(i => console.log(`${i.length} chars: ${i.file}`));
}

main();
```

**3. Fix Short Titles**

```astro
<!-- src/pages/glossary/baa.astro - BEFORE -->
title="BAA | MyBCAT"

<!-- AFTER -->
title="Business Associate Agreement (BAA) Explained | MyBCAT"
```

```astro
<!-- src/pages/terms.astro - BEFORE -->
title="Terms | MyBCAT"

<!-- AFTER -->
title="Terms of Service - MyBCAT Healthcare Solutions"
```

### Testing Steps
1. Run `node scripts/audit-titles.js` to identify all issues
2. Update frontmatter for blog posts with long titles
3. Update page titles for short pages
4. Run `npm run build`
5. Spot check pages in browser for correct titles

---

## Issue #4: Broken Internal Links (3 category pages)

### Objective
Fix 404 errors for `/blog/category/practice-growth/`, `/blog/category/analytics/`, `/blog/category/case-study/`.

### Root Cause
These category slugs are linked from sitemap/blog but don't exist in the category mapping.

### Success Criteria
- [ ] All three URLs return 200 OK
- [ ] Links score improves
- [ ] No 404 errors in Search Console

### Files to Modify

| File | Action |
|------|--------|
| `src/pages/blog/category/[category].astro` | Add missing categories or redirects |
| `src/pages/sitemap.astro` | Remove or fix broken links |
| `astro.config.mjs` or `vercel.json` | Add redirects if needed |

### Code Changes

**Option A: Add Missing Categories**

```typescript
// src/pages/blog/category/[category].astro - Add to categoryMeta
const categoryMeta: Record<string, { title: string; description: string }> = {
  // ... existing categories
  'practice-growth': {
    title: 'Practice Growth',
    description: 'Strategies for growing your healthcare practice.'
  },
  'analytics': {
    title: 'Analytics & Metrics',
    description: 'Data-driven insights for healthcare operations.'
  },
  'case-study': {
    title: 'Case Studies',
    description: 'Real-world success stories from healthcare practices.'
  }
};

// Update getStaticPaths
export async function getStaticPaths() {
  return [
    // ... existing paths
    { params: { category: 'practice-growth' } },
    { params: { category: 'analytics' } },
    { params: { category: 'case-study' } },
  ];
}
```

**Option B: Add Redirects (if categories should map elsewhere)**

```javascript
// vercel.json
{
  "redirects": [
    {
      "source": "/blog/category/practice-growth/",
      "destination": "/blog/category/growth/",
      "permanent": true
    },
    {
      "source": "/blog/category/case-study/",
      "destination": "/case-studies/",
      "permanent": true
    }
  ]
}
```

**Option C: Remove Dead Links**

Update `src/pages/sitemap.astro` to remove links to non-existent categories.

### Testing Steps
1. Decide on approach (add pages vs redirect vs remove links)
2. Implement chosen solution
3. Run `npm run build`
4. Test URLs manually: `curl -I https://mybcat.com/blog/category/practice-growth/`
5. Verify 200 OK or 301/308 redirect

---

## Issue #5: Form Inputs Without Labels (124 instances)

### Objective
Add accessible labels to all form inputs across 6 calculator pages.

### Root Cause
Interactive calculators use checkboxes, range inputs, and selects without proper `<label>` elements or `aria-label` attributes.

### Success Criteria
- [ ] All form inputs have accessible names
- [ ] Accessibility score improves from 71 to 90+
- [ ] Lighthouse accessibility audit passes

### Files to Modify

| File | Inputs | Action |
|------|--------|--------|
| `src/components/islands/ROICalculator.tsx` | 5 inputs | Verify labels (already OK) |
| `src/content/blog/ebitda-impact-calculator.mdx` | ~52 inputs | Add labels to embedded component |
| `src/content/blog/missed-call-revenue-calculator.mdx` | ~6 inputs | Add labels |
| Other calculator MDX files | Various | Add labels |

### Code Changes

**1. Check Existing ROI Calculator (Already Has Labels)**
```typescript
// src/components/islands/ROICalculator.tsx - Already correct:
<label htmlFor="industry">Select Your Industry</label>
<select id="industry" value={industry} onChange={...}>
```

**2. Fix Embedded Calculator Components**

For any calculator without labels, add them:

```tsx
// BEFORE - Missing label
<input type="range" id="callVolume" min="100" max="2000" />

// AFTER - With label
<label htmlFor="callVolume" className="sr-only">Monthly Call Volume</label>
<input type="range" id="callVolume" min="100" max="2000" aria-label="Monthly Call Volume" />
```

**3. Add Visually Hidden Label Class**

```css
/* src/styles/global.css */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**4. For HubSpot Forms**

HubSpot forms are embedded iframes - ensure HubSpot form settings have labels enabled:
- Log into HubSpot
- Edit form settings
- Enable "Show field labels"

### Testing Steps
1. Run Lighthouse accessibility audit on calculator pages
2. Use axe DevTools browser extension
3. Tab through forms with keyboard
4. Verify screen reader announces all inputs

---

## Issue #6: Broken External Links (2 instances)

### Objective
Fix or remove 2 broken external links.

### Root Cause
External resources have moved or been removed.

### Success Criteria
- [ ] Zero broken external links
- [ ] No 404s from external references

### Files to Modify

| Broken URL | Found In | Action |
|------------|----------|--------|
| `https://www.mgma.com/data/benchmarking` | `src/content/blog/benchmark-report-revenue-per-call-2025.md` | Find new URL or remove |
| `https://www.avma.org/resources-tools/...` | `src/content/blog/veterinary-emergency-triage-protocols.md` | Find new URL or remove |

### Code Changes

**1. Fix MGMA Link**
```markdown
<!-- BEFORE -->
[MGMA benchmarking data](https://www.mgma.com/data/benchmarking)

<!-- AFTER - Find current URL -->
[MGMA benchmarking data](https://www.mgma.com/data) <!-- or remove if unavailable -->
```

**2. Fix AVMA Link**
```markdown
<!-- BEFORE -->
[AVMA market research](https://www.avma.org/resources-tools/reports-statistics/market-research-statistics-veterinarians)

<!-- AFTER - Find current URL or cite differently -->
According to AVMA market research... <!-- Remove hyperlink if page doesn't exist -->
```

### Testing Steps
1. Search for current URLs on mgma.com and avma.org
2. Update or remove links
3. Run `npm run build`
4. Run link checker: `npx linkinator https://mybcat.com --recurse`

---

## Issue #7: Orphan Pages (7 pages)

### Objective
Add internal links to pages with fewer than 2 incoming links.

### Root Cause
These pages exist but aren't linked from navigation, footer, or related content.

### Success Criteria
- [ ] Each orphan page has 2+ internal links
- [ ] Pages discoverable via site navigation

### Orphan Pages Identified

1. `/sitemap/`
2. `/enterprise/centralized-scheduling/`
3. `/enterprise/multi-location-recall/`
4. `/enterprise/patient-access-center/`
5. `/enterprise/reporting-qa/`
6. `/blog/category/analytics/`
7. `/blog/category/case-study/`

### Files to Modify

| File | Action |
|------|--------|
| `src/components/Footer.astro` | Add sitemap link |
| `src/pages/enterprise/index.astro` | Add links to enterprise subpages |
| `src/data/navigation.ts` | Add enterprise dropdown items |

### Code Changes

**1. Add Sitemap to Footer**
```astro
<!-- src/components/Footer.astro -->
<div class="footer-column">
  <h4>Resources</h4>
  <a href="/blog/">Blog</a>
  <a href="/case-studies/">Case Studies</a>
  <a href="/sitemap/">Sitemap</a>  <!-- ADD THIS -->
</div>
```

**2. Link Enterprise Subpages**
```astro
<!-- src/pages/enterprise/index.astro - Add internal links -->
<section class="enterprise-solutions">
  <h2>Our Enterprise Solutions</h2>
  <a href="/enterprise/centralized-scheduling/">Centralized Scheduling</a>
  <a href="/enterprise/multi-location-recall/">Multi-Location Recall</a>
  <a href="/enterprise/patient-access-center/">Patient Access Center</a>
  <a href="/enterprise/reporting-qa/">Reporting & QA</a>
</section>
```

**3. Update Navigation Data**
```typescript
// src/data/navigation.ts - Add to enterprise dropdown
{
  label: 'Enterprise',
  href: '/enterprise/',
  children: [
    { label: 'Overview', href: '/enterprise/' },
    { label: 'Centralized Scheduling', href: '/enterprise/centralized-scheduling/' },
    { label: 'Multi-Location Recall', href: '/enterprise/multi-location-recall/' },
    { label: 'Patient Access Center', href: '/enterprise/patient-access-center/' },
    { label: 'Reporting & QA', href: '/enterprise/reporting-qa/' },
  ]
}
```

### Testing Steps
1. Implement link additions
2. Run `npm run build`
3. Use Screaming Frog or similar to verify all pages have 2+ inlinks
4. Navigate site manually to verify discoverability

---

## Issue #8: Heading Hierarchy Issues

### Objective
Fix heading level skips (H2 → H4) and multiple H1 tags.

### Root Cause
- Some pages skip from H2 to H4 (missing H3)
- 6 blog posts have multiple H1 tags

### Success Criteria
- [ ] Proper H1 → H2 → H3 → H4 hierarchy
- [ ] Single H1 per page
- [ ] Lighthouse heading audit passes

### Files to Modify

| File | Issue | Action |
|------|-------|--------|
| `src/pages/blog/index.astro` | H2 → H4 skip | Add H3 or change H4 to H3 |
| `src/pages/blog/archive.astro` | H2 → H4 skip | Fix hierarchy |
| 6 blog posts | Multiple H1 | Change extra H1 to H2 |

### Pages with Multiple H1
- `/blog/animal-hospital-patient-intake`
- `/blog/optometric-practice-equipment`
- `/blog/optometry-practice-location`
- `/blog/optometry-practice-finances`
- `/blog/optometry-practice-staffing`
- `/blog/optometry-private-practice`

### Code Changes

**1. Fix Blog Index Heading Skip**
```astro
<!-- BEFORE -->
<h2>Latest Posts</h2>
<div class="post-card">
  <h4>Post Title</h4>  <!-- Skips H3 -->
</div>

<!-- AFTER -->
<h2>Latest Posts</h2>
<div class="post-card">
  <h3>Post Title</h3>  <!-- Proper hierarchy -->
</div>
```

**2. Fix Multiple H1 in Blog Posts**

Check content files for multiple `# Heading` or `<h1>` tags:

```markdown
<!-- BEFORE - Multiple H1 -->
# Main Title
...content...
# Another Section  <!-- This should be H2 -->

<!-- AFTER - Single H1 -->
# Main Title
...content...
## Another Section  <!-- Changed to H2 -->
```

### Testing Steps
1. Run `node scripts/audit-headings.js` (create if needed)
2. Fix identified issues
3. Run Lighthouse accessibility audit
4. Verify heading structure with browser DevTools

---

## Issue #9: Missing Skip-to-Content Link

### Objective
Add accessible skip navigation link for keyboard users.

### Root Cause
`BaseLayout.astro` doesn't include a skip link.

### Success Criteria
- [ ] Skip link appears on Tab press
- [ ] Link jumps to main content
- [ ] Meets WCAG 2.1 AA requirements

### Files to Modify

| File | Action |
|------|--------|
| `src/layouts/BaseLayout.astro` | Add skip link after `<body>` |
| `src/styles/global.css` | Add skip link styles |

### Code Changes

**1. Add Skip Link to BaseLayout.astro**
```astro
<!-- src/layouts/BaseLayout.astro - After <body> tag -->
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <GoogleTagManagerNoScript />
  {navMode !== 'hidden' && <Nav currentPath={Astro.url.pathname} />}
  <main id="main-content">
    <slot />
  </main>
  <Footer />
</body>
```

**2. Add Skip Link Styles**
```css
/* src/styles/global.css */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--navy-900);
  color: white;
  padding: 8px 16px;
  z-index: 10000;
  text-decoration: none;
  font-weight: 600;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}
```

### Testing Steps
1. Add skip link HTML and CSS
2. Run `npm run build`
3. Open any page in browser
4. Press Tab key immediately after page load
5. Verify skip link appears and works

---

## Issue #10: Large Images (14+ images over 100KB)

### Objective
Compress all images to under 100KB where possible.

### Root Cause
Images not optimized during upload/creation.

### Success Criteria
- [ ] All images under 100KB (except hero images)
- [ ] Images score improves from 79 to 95+
- [ ] Faster page load times

### Large Images Identified

| Image | Current Size | Target |
|-------|-------------|--------|
| `veterinary-call-service-texas.webp` | 218 KB | <100 KB |
| `avoid-outsourcing-mistakes-in-optometry.webp` | 164 KB | <100 KB |
| `bpo-services-compliance-eye-care.webp` | 164 KB | <100 KB |
| `ensuring-compliance-security-outsourced-team.webp` | 164 KB | <100 KB |
| `location-selection-optometric-practices.webp` | 129 KB | <100 KB |
| `ankit_headshot_full.webp` | 109 KB | <80 KB |
| + 8 more | Various | <100 KB |

### Files to Modify

| Directory | Action |
|-----------|--------|
| `public/images/blog/` | Compress WebP images |
| `public/images/` | Compress logo and headshot |
| `scripts/optimize-images.js` | Add max size option |

### Code Changes

**1. Enhance optimize-images.js**
```javascript
// scripts/optimize-images.js - Add compression with size limit
import sharp from 'sharp';

const MAX_SIZE_KB = 100;
const QUALITY_START = 80;
const QUALITY_MIN = 50;

async function optimizeImage(inputPath, outputPath) {
  let quality = QUALITY_START;
  let buffer;

  do {
    buffer = await sharp(inputPath)
      .webp({ quality })
      .toBuffer();

    if (buffer.length > MAX_SIZE_KB * 1024 && quality > QUALITY_MIN) {
      quality -= 5;
    } else {
      break;
    }
  } while (quality >= QUALITY_MIN);

  await fs.promises.writeFile(outputPath, buffer);
  console.log(`${inputPath} → ${(buffer.length / 1024).toFixed(1)}KB (q=${quality})`);
}
```

**2. Run Optimization**
```bash
# Install sharp if not present
npm install sharp --save-dev

# Run optimization
node scripts/optimize-images.js --compress --max-size=100
```

**3. Manual Optimization for Stubborn Images**

Use [Squoosh](https://squoosh.app/) for images that can't be compressed automatically:
- Reduce dimensions if image is displayed smaller
- Use lossy compression
- Consider AVIF format for modern browsers

### Testing Steps
1. Run `node scripts/optimize-images.js --compress`
2. Check file sizes: `ls -la public/images/blog/*.webp | awk '{print $5, $9}' | sort -n`
3. Run Lighthouse performance audit
4. Verify images still look acceptable visually

---

## Implementation Schedule

### Phase 1: Critical Fixes (Days 1-2)
| Priority | Issue | Effort |
|----------|-------|--------|
| 1 | Trailing slashes (#1) | 2 hours |
| 2 | Broken internal links (#4) | 1 hour |
| 3 | Broken external links (#6) | 30 min |

### Phase 2: High Impact (Days 3-5)
| Priority | Issue | Effort |
|----------|-------|--------|
| 4 | JSON-LD validation (#2) | 2 hours |
| 5 | Title tag optimization (#3) | 4 hours |
| 6 | Skip link (#9) | 30 min |

### Phase 3: Medium Impact (Days 6-8)
| Priority | Issue | Effort |
|----------|-------|--------|
| 7 | Form labels (#5) | 2 hours |
| 8 | Heading hierarchy (#8) | 2 hours |
| 9 | Orphan pages (#7) | 1 hour |

### Phase 4: Optimization (Days 9-10)
| Priority | Issue | Effort |
|----------|-------|--------|
| 10 | Image compression (#10) | 3 hours |

---

## Verification Checklist

After all fixes are implemented:

- [ ] Run `npm run build` - No errors
- [ ] Run `squirrel audit https://mybcat.com --refresh --format llm`
- [ ] Overall score > 80/100
- [ ] Links score > 85/100
- [ ] Structured Data score > 95/100
- [ ] Core SEO score > 98/100
- [ ] Accessibility score > 90/100
- [ ] Run Lighthouse audit - All green
- [ ] Run Google Rich Results Test - No errors
- [ ] Check Search Console for new crawl errors

---

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Overall Health Score | 60/100 | 85+/100 |
| Links Score | 56/100 | 85+/100 |
| Structured Data Score | 72/100 | 95+/100 |
| Core SEO Score | 94/100 | 98+/100 |
| Accessibility Score | 71/100 | 90+/100 |
| Redirect Chains | 196 | 0 |
| Broken Links | 5 | 0 |
| Title Tag Issues | 111 | 0 |

---

*Plan created: January 29, 2026*
*Sources: Codex (OpenAI), Gemini (Google), Claude Code*
