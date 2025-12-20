# MYBCAT.COM WEBSITE REBUILD — MASTER CONTROLLER

## Purpose
This is the orchestration document for rebuilding mybcat.com as a high-performance, AI-friendly, SEO-optimized B2B marketing website. Each phase references detailed implementation files.

---

## Quick Reference: Supporting Files

| File | Purpose | When to Use |
|------|---------|-------------|
| `01-POSITIONING-ICP.md` | Product definition, ICPs, jobs-to-be-done, buyer journey | Strategy planning, messaging decisions |
| `02-INFORMATION-ARCHITECTURE.md` | Full sitemap, URL structure, internal linking | Site structure decisions, new page creation |
| `03-PAGE-TEMPLATES.md` | HTML structure, H-tag patterns, content blocks | Building any page type |
| `04-STRUCTURED-DATA.md` | JSON-LD schemas, implementation code | Adding schema markup |
| `05-TECHNICAL-SEO.md` | Metadata, canonicals, robots, redirects | Technical implementation |
| `06-FRAMEWORK-ASTRO.md` | Astro configuration, component patterns | Framework setup, component creation |
| `07-REPOSITORY-STRUCTURE.md` | Full folder structure, file conventions | Repo setup, adding new files |
| `08-CONTENT-PIPELINE.md` | MDX frontmatter, content governance, quality rules | Creating/editing content |
| `09-VERCEL-DEPLOYMENT.md` | Vercel config, caching, security headers | Deployment configuration |
| `10-LAUNCH-CHECKLIST.md` | Pre-launch, launch day, post-launch tasks | QA and go-live |
| `11-KEYWORD-RESEARCH.md` | Full keyword map by intent, search volumes | Content planning, SEO targeting |
| `12-COMPETITOR-ANALYSIS.md` | Hello Rache, HireTeem, other competitor intel | Positioning, comparison pages |

---

## Executive Summary

1. **Current state:** mybcat.com has 50+ orphaned legacy pages, chaotic IA, no clear conversion paths, and positions ambiguously between "call center" and "managed platform"

2. **Target state:** Clean, fast (Lighthouse 90+), answer-friendly site that positions mybcat as a "Patient Acquisition Platform" — not hourly VAs

3. **Differentiator:** Outcome-based pricing vs Hello Rache ($9.50/hr) and HireTeem ($11/hr) hourly models

4. **Framework:** Astro (zero JS default) + Vercel + GitHub for code-first workflow

5. **Timeline:** 90-day rollout in 3 phases

---

## Phase 1: Foundation (Days 1-30)

### Objectives
- [ ] Repository setup with Astro + Vercel auto-deploy
- [ ] Core pages live: Homepage, Pricing, About, Contact
- [ ] 5 industry verticals: Optometry, Dental, Veterinary, Medspa, Dermatology
- [ ] 3 solution pages: Patient Intake, Recall & Reactivation, No-Show Recovery
- [ ] 301 redirects from all legacy URLs
- [ ] Google Search Console verified and sitemap submitted

### Step-by-Step Implementation

#### Step 1.1: Repository Setup
**Reference:** `06-FRAMEWORK-ASTRO.md` → "Initial Setup" section
**Reference:** `07-REPOSITORY-STRUCTURE.md` → Full folder structure

**Tasks:**
```bash
# Create project
npm create astro@latest mybcat-website -- --template minimal
cd mybcat-website

# Add integrations
npx astro add vercel mdx tailwind react

# Initialize git
git init
git remote add origin https://github.com/[org]/mybcat-website.git
```

**Test Criteria:**
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] Vercel preview deployment works on push

---

#### Step 1.2: Base Layout & Components
**Reference:** `07-REPOSITORY-STRUCTURE.md` → "Components" section
**Reference:** `03-PAGE-TEMPLATES.md` → "Common Elements" section

**Tasks:**
1. Create `src/layouts/BaseLayout.astro` with:
   - SEO component slot
   - Header component
   - Main content slot
   - Footer component
   - Schema injection slot

2. Create global components:
   - `Header.astro` — Nav with dropdowns
   - `Footer.astro` — Links, contact, legal
   - `SEO.astro` — Meta tags, OG, canonical
   - `Button.astro` — Primary/secondary variants
   - `Card.astro` — Reusable content cards

**Test Criteria:**
- [ ] Layout renders on all viewport sizes (320px to 1920px)
- [ ] Navigation dropdowns work on mobile and desktop
- [ ] All components have proper semantic HTML
- [ ] No console errors in browser dev tools

---

#### Step 1.3: Homepage Build
**Reference:** `03-PAGE-TEMPLATES.md` → "Homepage Template"
**Reference:** `04-STRUCTURED-DATA.md` → "Organization + WebSite schemas"

**Tasks:**
1. Create `src/pages/index.astro`
2. Implement all sections per template:
   - Hero with value prop + CTA
   - Problem section with statistics
   - Solution overview (4 capabilities)
   - Differentiation section with comparison table
   - Industries grid
   - Social proof / testimonials
   - Pricing preview
   - FAQ accordion (4-6 questions)
   - Final CTA

3. Add schema markup:
   - Organization
   - WebSite
   - FAQPage (for FAQ section)

**Test Criteria:**
- [ ] H1 contains primary keyword
- [ ] TL;DR paragraph within first 100 words
- [ ] All CTAs link to demo booking
- [ ] Schema validates in Google Rich Results Test
- [ ] Lighthouse Performance > 90
- [ ] No CLS issues (accordion pre-sized)

---

#### Step 1.4: Industry Pages (5 pages)
**Reference:** `03-PAGE-TEMPLATES.md` → "Industry Landing Page Template"
**Reference:** `02-INFORMATION-ARCHITECTURE.md` → "Industry Pages" section
**Reference:** `11-KEYWORD-RESEARCH.md` → Industry-specific keywords

**Pages to Create:**
1. `/industries/optometry/`
2. `/industries/dental/`
3. `/industries/veterinary/`
4. `/industries/medspa/`
5. `/industries/dermatology/`

**Per-Page Tasks:**
1. Follow Industry template structure exactly
2. Include industry-specific:
   - Statistics (e.g., "Average optometry practice loses $X to missed calls")
   - EHR/PMS integrations mentioned
   - Terminology alignment
   - Case study snippet (if available)
3. Add Service schema markup
4. Implement breadcrumb navigation

**Test Criteria (per page):**
- [ ] H1 includes "[Industry] + Patient Acquisition/Answering Service"
- [ ] TL;DR paragraph answers "What does mybcat do for [industry]?"
- [ ] Minimum 1,000 words of unique content
- [ ] 3+ industry-specific statistics with sources
- [ ] FAQ section with 3-5 industry-specific questions
- [ ] Schema validates
- [ ] Lighthouse Performance > 90

---

#### Step 1.5: Solution Pages (3 pages)
**Reference:** `03-PAGE-TEMPLATES.md` → "Solution Page Template"
**Reference:** `02-INFORMATION-ARCHITECTURE.md` → "Solution Pages" section

**Pages to Create:**
1. `/solutions/patient-intake/`
2. `/solutions/recall-reactivation/`
3. `/solutions/no-show-recovery/`

**Per-Page Tasks:**
1. Follow Solution template structure
2. Include:
   - Problem statement with data
   - How it works (numbered steps)
   - Expected outcomes with metrics
   - Use case scenarios
   - Related solutions links
3. Add Service schema

**Test Criteria (per page):**
- [ ] Clear outcome promise in H1
- [ ] Process/steps section with numbered list
- [ ] Before/after or metrics section
- [ ] Links to relevant industry pages
- [ ] Minimum 1,200 words unique content

---

#### Step 1.6: Pricing Page
**Reference:** `03-PAGE-TEMPLATES.md` → "Pricing Page Template"

**Tasks:**
1. Create `/pricing/` page
2. Implement pricing tiers (even if "contact us" based):
   - Tier names and positioning
   - Feature comparison table
   - What's included per tier
3. Add ROI section linking to calculator (future)
4. FAQ section specific to pricing/billing

**Test Criteria:**
- [ ] Clear pricing model explanation
- [ ] Feature comparison uses semantic `<table>`
- [ ] Strong CTAs to demo booking
- [ ] FAQ addresses: contracts, billing, refunds

---

#### Step 1.7: About Page
**Reference:** `03-PAGE-TEMPLATES.md` → "About Page Template"

**Tasks:**
1. Create `/about/` page
2. Include:
   - Founder story (Ankit's dual perspective as owner + provider)
   - Company mission/values
   - "Why we're different" section
   - Team section (if applicable)
   - Contact information
3. Add Organization schema

**Test Criteria:**
- [ ] Establishes credibility and trust
- [ ] Mentions Classic Vision Care ownership (proof of expertise)
- [ ] Clear contact options

---

#### Step 1.8: Contact/Demo Integration
**Tasks:**
1. Implement contact form (HubSpot, Calendly, or custom)
2. Create `/contact/` page with:
   - Embedded booking calendar
   - Contact form fallback
   - Phone number
   - Email
3. Test form submissions end-to-end

**Test Criteria:**
- [ ] Form submissions reach inbox/CRM
- [ ] Confirmation message displays
- [ ] Mobile-friendly form inputs
- [ ] No JS errors on submission

---

#### Step 1.9: 301 Redirects
**Reference:** `05-TECHNICAL-SEO.md` → "Redirect Policy"

**Tasks:**
1. Map all legacy URLs to new equivalents
2. Implement in `vercel.json`
3. Test each redirect

**Critical Redirects:**
```
/virtual-assistants-for-optometrists → /industries/optometry/
/customer-service-outsourcing-provider-in-marietta-georgia → /about/
/solutions-remote-hospitality-center → /solutions/patient-intake/
/service-package-deluxe → /pricing/
/service-package-ultimate → /pricing/
/service-package-enterprise → /pricing/
/blog/* → /blog/* (preserve if migrating)
```

**Test Criteria:**
- [ ] All legacy URLs return 301 (not 302)
- [ ] No redirect chains (A→B→C)
- [ ] No redirect loops
- [ ] GSC shows no new 404s from legacy URLs

---

#### Step 1.10: Google Search Console Setup
**Tasks:**
1. Verify domain ownership
2. Submit sitemap.xml
3. Request indexing for priority pages
4. Monitor for crawl errors

**Test Criteria:**
- [ ] Domain verified
- [ ] Sitemap submitted and processed
- [ ] No critical errors in Coverage report

---

### Phase 1 Completion Checklist
- [ ] All 12+ pages live and functional
- [ ] All Lighthouse scores > 90
- [ ] All schemas validate
- [ ] All redirects working
- [ ] GSC verified and sitemap submitted
- [ ] Forms tested and working
- [ ] Mobile responsive confirmed
- [ ] No console errors

---

## Phase 2: Content Expansion (Days 31-60)

### Objectives
- [ ] Remaining solution pages (2)
- [ ] Remaining industry pages (2): Urgent Care, ENT
- [ ] Comparison pages (2): vs Hello Rache, vs HireTeem
- [ ] FAQ hub with category pages
- [ ] Security & Compliance page
- [ ] Case studies (3)
- [ ] Blog posts (10)
- [ ] Glossary (20 terms)
- [ ] ROI Calculator (interactive)

### Step-by-Step Implementation

#### Step 2.1: Remaining Solution Pages
**Reference:** `03-PAGE-TEMPLATES.md` → "Solution Page Template"

**Pages:**
1. `/solutions/front-office-operations/`
2. `/solutions/how-it-works/` (process overview)

---

#### Step 2.2: Remaining Industry Pages
**Reference:** `03-PAGE-TEMPLATES.md` → "Industry Landing Page Template"

**Pages:**
1. `/industries/urgent-care/`
2. `/industries/ent/`

---

#### Step 2.3: Comparison Pages
**Reference:** `03-PAGE-TEMPLATES.md` → "Comparison Page Template"
**Reference:** `12-COMPETITOR-ANALYSIS.md` → Competitor details

**Pages:**
1. `/compare/vs-hello-rache/`
2. `/compare/vs-hireteem/`

**Critical Elements:**
- Fair, accurate competitor descriptions
- Side-by-side comparison table
- Pros/cons for both options
- "Best for" recommendations
- FAQ section

**Test Criteria:**
- [ ] Comparison table uses semantic `<table>`
- [ ] Content is factual and defensible
- [ ] Clear verdict/recommendation section
- [ ] Links to pricing and case studies

---

#### Step 2.4: FAQ Hub
**Reference:** `03-PAGE-TEMPLATES.md` → "FAQ Hub Template"
**Reference:** `04-STRUCTURED-DATA.md` → "FAQPage schema"

**Tasks:**
1. Create `/faq/` index page
2. Organize by category:
   - Getting Started
   - Pricing & Billing
   - Security & Compliance
   - Technical / Integrations
   - Service & Support
3. Implement expandable accordions
4. Add FAQPage schema to entire hub

---

#### Step 2.5: Security & Compliance Page
**Reference:** `03-PAGE-TEMPLATES.md` → "Trust Page Template"

**Page:** `/security/`

**Must Include:**
- HIPAA compliance explanation
- BAA (Business Associate Agreement) information
- Data security measures
- Encryption standards
- Training and certification
- Contact for compliance questions

---

#### Step 2.6: Case Studies (3)
**Reference:** `03-PAGE-TEMPLATES.md` → "Case Study Template"
**Reference:** `08-CONTENT-PIPELINE.md` → "Case Study frontmatter"

**Structure per case study:**
- Client overview (anonymized if needed)
- Challenge/problem
- Solution implemented
- Results with metrics
- Testimonial quote
- CTA

**Test Criteria:**
- [ ] Quantified results (%, $, time saved)
- [ ] Industry tag for filtering
- [ ] Testimonial with attribution

---

#### Step 2.7: Blog Posts (10)
**Reference:** `03-PAGE-TEMPLATES.md` → "Article Template"
**Reference:** `08-CONTENT-PIPELINE.md` → "Blog post frontmatter"
**Reference:** `11-KEYWORD-RESEARCH.md` → Target keywords

**Priority Topics (problem-aware content):**
1. "How to Reduce No-Shows at Your Medical Practice"
2. "The True Cost of Missed Patient Calls"
3. "Front Desk Overwhelmed? Signs Your Practice Needs Help"
4. "Optometry Patient Acquisition Strategies for 2025"
5. "HIPAA Compliant Answering Services: What to Look For"
6. "Virtual Assistant vs Managed Service: What's the Difference?"
7. "How to Calculate ROI on Front Office Outsourcing"
8. "Patient Recall Best Practices for Healthcare Practices"
9. "Why Multi-Location Practices Need Centralized Intake"
10. "Dental Practice Phone Handling: Common Mistakes"

**Per-Post Requirements:**
- Minimum 1,500 words
- Key Takeaways box at top
- 3+ internal links
- 1+ statistic with source
- FAQ section if applicable
- Author bio
- Related posts section

---

#### Step 2.8: Glossary (20 terms)
**Reference:** `03-PAGE-TEMPLATES.md` → "Glossary Template"
**Reference:** `08-CONTENT-PIPELINE.md` → "Glossary frontmatter"

**Priority Terms:**
1. Patient Acquisition
2. Remote Hospitality Center
3. Medical Answering Service
4. HIPAA Compliance
5. Business Associate Agreement (BAA)
6. Patient Recall
7. No-Show Rate
8. Appointment Confirmation
9. Insurance Verification
10. Referral Coordination
11. EHR Integration
12. Practice Management System (PMS)
13. Patient Intake
14. Call Overflow
15. After-Hours Answering
16. Multi-Location Practice
17. Patient Retention
18. Reactivation Campaign
19. Front Desk Bottleneck
20. Revenue Recovery

---

#### Step 2.9: ROI Calculator
**Reference:** `06-FRAMEWORK-ASTRO.md` → "Islands Architecture"

**Page:** `/resources/roi-calculator/`

**Implementation:**
- React component (island)
- Inputs: call volume, missed call %, average patient value
- Outputs: monthly/annual revenue loss, potential recovery
- Lead capture on results
- No page reload (client-side calculation)

---

### Phase 2 Completion Checklist
- [ ] 5+ new core pages live
- [ ] 2 comparison pages indexed
- [ ] 10 blog posts published
- [ ] 20 glossary terms live
- [ ] ROI calculator functional
- [ ] All new pages pass Lighthouse 90+
- [ ] Internal linking updated across site

---

## Phase 3: Scale & Optimize (Days 61-90)

### Objectives
- [ ] 3 additional comparison pages
- [ ] Expand glossary to 50+ terms
- [ ] Blog category pages
- [ ] Programmatic page generation (if justified)
- [ ] Schema audit and optimization
- [ ] Link building assets
- [ ] Performance tuning

### Step-by-Step Implementation

#### Step 3.1: Additional Comparison Pages
**Reference:** `03-PAGE-TEMPLATES.md` → "Comparison Page Template"

**Pages:**
1. `/compare/vs-virtual-assistants/`
2. `/compare/vs-call-centers/`
3. `/compare/vs-ai-receptionists/`

---

#### Step 3.2: Glossary Expansion
Expand to 50+ terms covering:
- Industry-specific terminology (optometry, dental, etc.)
- Compliance terms
- Technology terms
- Metrics and KPIs

---

#### Step 3.3: Blog Category Pages
**Pages:**
- `/blog/category/operations/`
- `/blog/category/growth/`
- `/blog/category/technology/`
- `/blog/category/industry/`

---

#### Step 3.4: Schema Audit
**Tasks:**
1. Validate all pages with Rich Results Test
2. Check for schema warnings
3. Ensure no duplicate Organization schemas
4. Verify breadcrumbs on all pages

---

#### Step 3.5: Link Building Assets
Create:
- Industry report / whitepaper (gated)
- Infographic on missed call costs
- Embeddable calculator for partners
- Press kit / media page

---

#### Step 3.6: Performance Tuning
**Tasks:**
1. Review Speed Insights data
2. Optimize any pages below 90 score
3. Implement image lazy loading audit
4. Review and optimize third-party scripts
5. Consider edge caching for dynamic elements

---

### Phase 3 Completion Checklist
- [ ] 50+ glossary terms
- [ ] Blog categories functional
- [ ] All schemas validated
- [ ] Link building assets created
- [ ] All pages Lighthouse 90+
- [ ] CWV passing in field data (GSC)

---

## Ongoing Maintenance

### Weekly
- [ ] Monitor GSC for crawl errors
- [ ] Check Speed Insights for regressions
- [ ] Review form submission data

### Monthly
- [ ] Publish 2-4 new blog posts
- [ ] Update any outdated content
- [ ] Review keyword rankings
- [ ] Check for broken links

### Quarterly
- [ ] Content audit for thin/duplicate pages
- [ ] Keyword cannibalization check
- [ ] Competitor positioning review
- [ ] Schema audit
- [ ] Performance benchmark comparison

---

## Risk Mitigation

| Risk | Prevention | Response |
|------|------------|----------|
| Legacy URL traffic loss | Comprehensive 301 map | Monitor GSC 404s, add missing redirects |
| Duplicate content | Canonical tags, consolidation | Identify via GSC, merge/redirect |
| Performance regression | Lighthouse CI gates | Revert PR, optimize offending code |
| Form breakage | End-to-end testing | Fallback email contact, hotfix |
| Schema errors | Rich Results Test in CI | Fix immediately, resubmit to GSC |
| Competitor SEO response | Content velocity, backlinks | Increase content output, PR push |

---

## Success Metrics

### 30-Day Targets
- [ ] All core pages indexed
- [ ] Lighthouse scores > 90 across site
- [ ] Zero 404 errors from legacy URLs
- [ ] Demo bookings from organic traffic

### 60-Day Targets
- [ ] Ranking for 5+ target keywords
- [ ] Comparison pages indexed
- [ ] 20+ blog posts live
- [ ] Traffic increase from baseline

### 90-Day Targets
- [ ] Top 10 rankings for "[industry] answering service" terms
- [ ] Featured snippets for 2+ queries
- [ ] Measurable lead increase from organic
- [ ] CWV passing in field data

---

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Quality Checks
npm run lint                   # ESLint check
npm run typecheck              # TypeScript check
npm run check-links            # Broken link checker
npm run lighthouse             # Run Lighthouse CI

# Content
npm run new:blog               # Create new blog post (if scripted)
npm run new:glossary           # Create new glossary term (if scripted)

# Deployment
git push origin main           # Auto-deploys to Vercel
```

---

## File Dependencies

When making changes, consider these dependencies:

| If you change... | Also update... |
|------------------|----------------|
| Navigation structure | `src/data/navigation.ts`, all page breadcrumbs |
| URL structure | `vercel.json` redirects, internal links, sitemap |
| Schema types | `src/utils/schema.ts`, affected page templates |
| Content collections | `src/content/config.ts`, collection queries |
| Global styles | Check all components for visual regression |
| CTA copy | All pages with CTA sections |

---

## Support Files Index

For detailed implementation of any section, reference the corresponding file:

1. **Strategy & Positioning** → `01-POSITIONING-ICP.md`
2. **Site Structure** → `02-INFORMATION-ARCHITECTURE.md`
3. **Page Building** → `03-PAGE-TEMPLATES.md`
4. **Schema Markup** → `04-STRUCTURED-DATA.md`
5. **Technical SEO** → `05-TECHNICAL-SEO.md`
6. **Astro Framework** → `06-FRAMEWORK-ASTRO.md`
7. **Repository Setup** → `07-REPOSITORY-STRUCTURE.md`
8. **Content Creation** → `08-CONTENT-PIPELINE.md`
9. **Deployment** → `09-VERCEL-DEPLOYMENT.md`
10. **Launch QA** → `10-LAUNCH-CHECKLIST.md`
11. **Keywords** → `11-KEYWORD-RESEARCH.md`
12. **Competitors** → `12-COMPETITOR-ANALYSIS.md`
