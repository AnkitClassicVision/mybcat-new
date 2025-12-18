# MyBCAT Site Transition Plan
## WordPress (mybcat-live) → Astro/Vercel (mybcat-new)

**Created:** December 18, 2025
**Status:** PLANNING - Awaiting Approval
**Source:** https://github.com/AnkitClassicVision/mybcat-live (READ ONLY - NO CHANGES)
**Target:** https://github.com/AnkitClassicVision/mybcat-new

---

## Golden Rule

**mybcat-live remains UNTOUCHED throughout this entire process.**
All work happens in mybcat-new. The live site continues running on WordPress/Nestify until final cutover.

---

## Phase Overview

| Phase | Description | Deliverables | Duration |
|-------|-------------|--------------|----------|
| 1 | Project Setup | Astro project, config, structure | 1 day |
| 2 | Content Export | WordPress posts → Markdown files | 1 day |
| 3 | Design System | CSS variables, base styles | 1-2 days |
| 4 | Core Components | Nav, Footer, Cards, Buttons | 2-3 days |
| 5 | Homepage | Full front-page conversion | 2-3 days |
| 6 | Blog System | Listing, single post, categories | 2-3 days |
| 7 | Secondary Pages | About, GDPR, Privacy, etc. | 1-2 days |
| 8 | HubSpot Integration | Forms, Chat, Meetings modal | 1-2 days |
| 9 | SEO & Meta | Sitemap, robots, structured data | 1 day |
| 10 | Testing & QA | Cross-browser, performance, links | 2-3 days |
| 11 | Vercel Deployment | Deploy, DNS, monitoring | 1 day |

**Total Estimated:** 15-21 days

---

## Phase 1: Project Setup

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 1.1 | Astro project initialized | `npm create astro@latest` with TypeScript |
| 1.2 | Vercel adapter configured | `@astrojs/vercel` installed and configured |
| 1.3 | Directory structure created | All folders per architecture plan |
| 1.4 | Package.json dependencies | All required packages listed |
| 1.5 | TypeScript config | Strict mode, path aliases |
| 1.6 | Content collection schema | Blog post frontmatter schema defined |

### Test Criteria

| # | Test | Pass Criteria |
|---|------|---------------|
| 1.1 | `npm run dev` starts | Dev server runs on localhost:4321 |
| 1.2 | `npm run build` succeeds | Build completes with no errors |
| 1.3 | Basic page renders | Can see "Hello World" at localhost:4321 |
| 1.4 | TypeScript compiles | No TS errors in terminal |

### Files Created
```
mybcat-new/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── src/
│   ├── content/
│   │   └── config.ts
│   ├── layouts/
│   │   └── Base.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
└── public/
    └── (empty, ready for assets)
```

---

## Phase 2: Content Export

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 2.1 | Export script created | Script to pull WordPress posts via REST API |
| 2.2 | Blog posts exported | All posts converted to Markdown with frontmatter |
| 2.3 | Images downloaded | All featured images saved locally |
| 2.4 | Content inventory | List of all exported content with status |

### Test Criteria

| # | Test | Pass Criteria |
|---|------|---------------|
| 2.1 | Post count matches | Same number of posts as WordPress |
| 2.2 | Frontmatter valid | All posts have required fields (title, date, etc.) |
| 2.3 | Images accessible | All image files exist and are valid |
| 2.4 | Markdown renders | Content renders correctly in preview |
| 2.5 | No data loss | Spot-check 3 posts against WordPress originals |

### Files Created
```
mybcat-new/
├── scripts/
│   └── export-wordpress.js
└── src/
    └── content/
        └── blog/
            ├── post-1.md
            ├── post-2.md
            └── ...
```

### Content Inventory Template
```markdown
| Post Slug | Title | Date | Images | Status |
|-----------|-------|------|--------|--------|
| post-slug | Title | 2025-01-01 | 2 | Exported |
```

---

## Phase 3: Design System

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 3.1 | CSS custom properties | All color, spacing, typography tokens |
| 3.2 | Typography styles | Font imports, heading scales, body text |
| 3.3 | Animation utilities | Transitions, keyframes from original |
| 3.4 | Responsive breakpoints | Mobile, tablet, desktop media queries |
| 3.5 | Base reset/normalize | Consistent cross-browser baseline |

### Test Criteria

| # | Test | Pass Criteria |
|---|------|---------------|
| 3.1 | Colors match | `--oceanic-teal`, `--navy-900` etc. render identically |
| 3.2 | Fonts load | Inter font displays correctly |
| 3.3 | Variables accessible | Can use `var(--navy-900)` in any component |
| 3.4 | No FOUT | Fonts don't flash unstyled on load |

### CSS Variables to Migrate
```css
/* From front-page.php - Must match exactly */
--deep-slate: #27343C;
--oceanic-teal: #006064;
--electric-aqua: #4DD0E1;
--silver-mist: #E0E0E0;
--revenue-gold: #D3AF5E;
--navy-900: #1A242C;
--navy-800: #27343C;
/* ... (full list in implementation) */
```

---

## Phase 4: Core Components

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 4.1 | Nav.astro | Floating glass navigation dock |
| 4.2 | MobileNav.astro | Hamburger menu for mobile |
| 4.3 | Footer.astro | Site footer with links |
| 4.4 | SpatialCard.astro | Bento card with tilt effect |
| 4.5 | Button.astro | Magnetic button component |
| 4.6 | SEO.astro | Meta tags, OG, Twitter cards |
| 4.7 | Schema.astro | JSON-LD structured data |

### Test Criteria

| # | Test | Pass Criteria |
|---|------|---------------|
| 4.1 | Nav renders | All nav links visible and clickable |
| 4.2 | Mobile menu works | Hamburger opens/closes menu |
| 4.3 | Nav glass effect | Backdrop blur visible |
| 4.4 | Card tilt works | Cards tilt on hover (desktop) |
| 4.5 | Button hover | Magnetic effect on button hover |
| 4.6 | SEO tags present | View source shows meta tags |
| 4.7 | Smooth scroll | Anchor links scroll smoothly |

### Visual Comparison Checklist
- [ ] Nav matches original at desktop width
- [ ] Nav matches original at mobile width
- [ ] Cards have same border-radius, shadows
- [ ] Buttons have same colors, hover states
- [ ] Footer layout matches original

---

## Phase 5: Homepage

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 5.1 | Hero section | Logo, headline, CTA, video thumbnail |
| 5.2 | "Is this for you" section | Qualifier cards (1-3, 3-20 locations) |
| 5.3 | Problem section | Pain point cards with stats |
| 5.4 | Comparison table | MyBCAT vs alternatives |
| 5.5 | Solution section | Service feature cards |
| 5.6 | How it works | 3-step process |
| 5.7 | Proof section | Stats and testimonials |
| 5.8 | Pricing section | Growth/Enterprise cards |
| 5.9 | FAQ section | Accordion questions |
| 5.10 | CTA section | Final call-to-action with form |

### Test Criteria

| # | Test | Pass Criteria |
|---|------|---------------|
| 5.1 | Visual match | Side-by-side screenshot matches 95%+ |
| 5.2 | All sections render | No missing content |
| 5.3 | Responsive | Looks correct at 375px, 768px, 1440px |
| 5.4 | Animations work | Hover effects, transitions active |
| 5.5 | Links work | All anchor links scroll to correct section |
| 5.6 | Images load | All images display correctly |
| 5.7 | Video thumbnail | Poster image shows, play button visible |

### Section-by-Section Checklist
- [ ] Hero: Logo, headline, subhead, CTAs, video
- [ ] Qualifier: Both cards with correct copy
- [ ] Problem: All 4 pain point cards
- [ ] Comparison: Full table with all rows
- [ ] Solution: All 3 feature cards
- [ ] How it works: 3 numbered steps
- [ ] Proof: 4 stat cards + testimonials
- [ ] Pricing: Both plans with features
- [ ] FAQ: All 8 questions expandable
- [ ] CTA: Form renders (placeholder for now)

---

## Phase 6: Blog System

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 6.1 | Blog listing page | Grid of posts with pagination |
| 6.2 | Featured post | Hero post at top of listing |
| 6.3 | Post card component | Thumbnail, title, excerpt, date |
| 6.4 | Single post page | Full article with styling |
| 6.5 | Reading time | Calculated from word count |
| 6.6 | Related posts | 3 posts from same category |
| 6.7 | Category pages | Filter by category |
| 6.8 | Tag pages | Filter by tag |
| 6.9 | Pagination | Previous/next, page numbers |

### Test Criteria

| # | Test | Pass Criteria |
|---|------|---------------|
| 6.1 | Posts display | All published posts show on /blog |
| 6.2 | Sorting works | Newest posts first |
| 6.3 | Pagination works | Can navigate between pages |
| 6.4 | Post renders | Full content displays on single page |
| 6.5 | Reading time accurate | Within 1 min of actual |
| 6.6 | Related posts show | 3 relevant posts at bottom |
| 6.7 | Category filter | /blog/category/[cat] shows correct posts |
| 6.8 | Draft posts hidden | status: draft posts not visible |
| 6.9 | URLs match | Same URL structure as current site |

### URL Structure
```
/blog                     → Blog listing (paginated)
/blog/[slug]             → Single post
/blog/category/[cat]     → Category archive
/blog/tag/[tag]          → Tag archive
```

---

## Phase 7: Secondary Pages

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 7.1 | /about/story | Company story page |
| 7.2 | /about/podcast | Podcast page |
| 7.3 | /about/book | Book page |
| 7.4 | /gdpr | GDPR compliance page |
| 7.5 | /privacy-policy | Privacy policy page |
| 7.6 | /404 | Custom 404 page |

### Test Criteria

| # | Test | Pass Criteria |
|---|------|---------------|
| 7.1 | All pages render | No 404s on secondary pages |
| 7.2 | Content matches | Text matches original |
| 7.3 | Styling consistent | Uses same design system |
| 7.4 | Navigation works | Can reach from nav menu |
| 7.5 | 404 displays | Invalid URL shows custom 404 |

---

## Phase 8: HubSpot Integration

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 8.1 | HubSpotForm.astro | Lazy-loaded form embed |
| 8.2 | HubSpotChat.astro | Delayed chat widget (8s) |
| 8.3 | HubSpotMeetingModal.astro | Meeting scheduler modal |
| 8.4 | Form styling | Match current form appearance |
| 8.5 | CTA form integration | Form in final CTA section |
| 8.6 | Contact form integration | Form on GDPR/Privacy pages |

### Test Criteria

| # | Test | Pass Criteria |
|---|------|---------------|
| 8.1 | Form renders | HubSpot form visible in CTA section |
| 8.2 | Form submits | Test submission reaches HubSpot |
| 8.3 | Chat appears | Widget shows after 8s or interaction |
| 8.4 | Modal opens | "Book a Call" opens meeting scheduler |
| 8.5 | Modal closes | X button and backdrop click close modal |
| 8.6 | Form styling | Inputs, labels, button match design |
| 8.7 | Lazy loading works | Forms load only when visible |

### HubSpot IDs Required
```
Portal ID: 23344341
CTA Form ID: a365996f-87cf-4a60-8782-9dabb9f9dd97
Contact Form ID: bd996134-e8e1-47a0-9325-2666307738ee
Meeting URL: https://hubspot.mybcat.com/meetings/ankit98/mybcat-discovery-call
```

---

## Phase 9: SEO & Meta

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 9.1 | Sitemap generation | Auto-generated sitemap.xml |
| 9.2 | robots.txt | Search engine directives |
| 9.3 | Meta tags | Title, description on all pages |
| 9.4 | Open Graph tags | Social sharing images/text |
| 9.5 | Twitter cards | Twitter-specific meta |
| 9.6 | JSON-LD schema | Organization, Article, FAQ schemas |
| 9.7 | Canonical URLs | Proper canonical tags |

### Test Criteria

| # | Test | Pass Criteria |
|---|------|---------------|
| 9.1 | Sitemap accessible | /sitemap.xml returns valid XML |
| 9.2 | Sitemap complete | Contains all public URLs |
| 9.3 | robots.txt works | /robots.txt accessible |
| 9.4 | Meta tags present | View source shows correct tags |
| 9.5 | OG tags work | Facebook debugger shows preview |
| 9.6 | Twitter cards work | Twitter card validator passes |
| 9.7 | Schema valid | Google Rich Results test passes |
| 9.8 | No duplicate tags | Only one of each meta tag |

### SEO Validation Tools
- [ ] Google Rich Results Test
- [ ] Facebook Sharing Debugger
- [ ] Twitter Card Validator
- [ ] Screaming Frog crawl (or similar)

---

## Phase 10: Testing & QA

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 10.1 | Cross-browser testing | Chrome, Firefox, Safari, Edge |
| 10.2 | Mobile testing | iOS Safari, Android Chrome |
| 10.3 | Performance testing | PageSpeed Insights audit |
| 10.4 | Link validation | All internal/external links work |
| 10.5 | Accessibility audit | Basic a11y compliance |
| 10.6 | Content review | All text matches original |

### Test Criteria

| # | Test | Pass Criteria |
|---|------|---------------|
| 10.1 | Chrome desktop | No visual or functional bugs |
| 10.2 | Firefox desktop | No visual or functional bugs |
| 10.3 | Safari desktop | No visual or functional bugs |
| 10.4 | Edge desktop | No visual or functional bugs |
| 10.5 | iOS Safari | Fully functional and styled |
| 10.6 | Android Chrome | Fully functional and styled |
| 10.7 | PageSpeed Mobile | Score 90+ |
| 10.8 | PageSpeed Desktop | Score 95+ |
| 10.9 | No broken links | 0 404s on internal links |
| 10.10 | Images optimized | All images < 200KB |

### Performance Targets
| Metric | Target |
|--------|--------|
| PageSpeed Mobile | 90+ |
| PageSpeed Desktop | 95+ |
| LCP | < 1.5s |
| FID/INP | < 100ms |
| CLS | < 0.1 |
| Total JS | < 50KB |

---

## Phase 11: Vercel Deployment

### Deliverables

| # | Deliverable | Description |
|---|-------------|-------------|
| 11.1 | Vercel project created | Connected to mybcat-new repo |
| 11.2 | Preview deployment | Working preview URL |
| 11.3 | Environment variables | Any required env vars set |
| 11.4 | Custom domain | mybcat.com pointed to Vercel |
| 11.5 | SSL certificate | HTTPS working |
| 11.6 | Redirects configured | Any URL changes handled |

### Test Criteria

| # | Test | Pass Criteria |
|---|------|---------------|
| 11.1 | Preview works | Can access [project].vercel.app |
| 11.2 | Build succeeds | Vercel build completes |
| 11.3 | All pages work | Full site functional on Vercel |
| 11.4 | Domain works | mybcat.com loads new site |
| 11.5 | HTTPS works | SSL certificate valid |
| 11.6 | www redirect | www.mybcat.com → mybcat.com |
| 11.7 | Old URLs work | Redirects in place if needed |

### DNS Cutover Checklist
- [ ] Backup current DNS settings
- [ ] Lower TTL 24h before cutover
- [ ] Update A/CNAME records to Vercel
- [ ] Verify site loads on new hosting
- [ ] Monitor for 404s for 24h
- [ ] Keep WordPress running for 7 days as backup

---

## Rollback Plan

If critical issues are found after launch:

1. **Immediate (< 1 hour):** Revert DNS to Nestify/WordPress
2. **Short-term:** WordPress site stays running during transition
3. **Documentation:** All DNS settings documented before change

---

## Sign-Off Checklist

Before final launch, confirm:

- [ ] All phases completed
- [ ] All test criteria passed
- [ ] Visual comparison approved
- [ ] Performance targets met
- [ ] HubSpot forms tested with real submission
- [ ] SEO validation passed
- [ ] Rollback plan documented
- [ ] DNS change scheduled

---

## Appendix A: File Mapping

| Source (mybcat-live) | Target (mybcat-new) |
|---------------------|---------------------|
| front-page.php | src/pages/index.astro |
| page-blog.php | src/pages/blog/index.astro |
| single.php | src/pages/blog/[...slug].astro |
| page-about-story.php | src/pages/about/story.astro |
| page-about-podcast.php | src/pages/about/podcast.astro |
| page-about-book.php | src/pages/about/book.astro |
| page-gdpr.php | src/pages/gdpr.astro |
| page-privacy-policy.php | src/pages/privacy-policy.astro |
| /images/* | public/images/* |
| CSS in front-page.php | src/styles/global.css |

---

## Appendix B: Content Schema

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    scheduledDate: z.date().optional(),
    status: z.enum(['published', 'draft', 'scheduled']),
    author: z.string().default('Ankit Patel'),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    featuredImage: z.string().optional(),
    ogImage: z.string().optional(),
    relatedPosts: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
```

---

## Appendix C: Scheduled Publishing Workflow

```yaml
# .github/workflows/scheduled-publish.yml
name: Publish Scheduled Posts

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Publish scheduled posts
        run: node scripts/publish-scheduled.js

      - name: Commit changes
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git diff --quiet || (git add -A && git commit -m "Publish scheduled posts for $(date +%Y-%m-%d)" && git push)
```

---

**Document Status:** Ready for Review
**Next Step:** Approve this plan, then I begin Phase 1
