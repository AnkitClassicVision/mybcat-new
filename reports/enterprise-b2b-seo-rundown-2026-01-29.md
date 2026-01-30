# Enterprise / B2B (National) SEO Rundown for `mybcat.com`

**Date:** 2026-01-29  
**Scope:** This is a repo/code + built-output audit (not a Google Search Console / rankings audit).  
**Primary question:** “Is SEO set up properly for enterprise B2B (national), not local and not B2C?”

## What I actually verified (no guesses)

### Data sources used

- Local build output: `.vercel/output/static/` from running `npm run build` in this repo (219 HTML pages built).
- Repo content: `src/pages/**`, `src/layouts/**`, `src/content/blog/**`, `src/data/**`, `src/utils/schema.ts`, `public/robots.txt`.
- Live URL spot-checks (HTTP only):
  - `https://mybcat.com/robots.txt` returns `200`
  - `https://mybcat.com/sitemap.xml` returns `308` → `/sitemap-index.xml`
  - `https://mybcat.com/sitemap-index.xml` returns `200` and points to `/sitemap-0.xml`
  - `https://mybcat.com/images/og-default.png` returns `404` (but is referenced by JSON-LD on live pages)

### Build-wide SEO baselines (verified from 219 built pages)

- **219/219 pages include**:
  - `<title>` tag
  - `<meta name="description">`
  - `<link rel="canonical">`
- **JSON-LD is syntactically valid everywhere** (0 JSON.parse failures across all pages).
- **18 pages are `noindex`** (expected for drafts/scheduled blog posts + `404.html`).

## Executive answer (enterprise B2B vs local/B2C)

### Good news: the enterprise “money pages” are already positioned correctly

Your **enterprise landing pages** are clearly written for multi-location healthcare groups and use enterprise-relevant keywords in titles/H1s.

Verified examples (title → H1):

- `/enterprise/`: `Multi-Location Patient Operations | MyBCAT` → `One Team. Every Location. Every Call.`
- `/enterprise/dso/`: `DSOs | Multi-Location Support | MyBCAT` → `Patient Operations Built for DSOs`
- `/enterprise/patient-access-center/`: `Centralized Patient Access Center | MyBCAT` → `Centralized Patient Access for Healthcare Groups`
- `/contact/`: `Contact Enterprise Team | Schedule a Discovery Call | MyBCAT` → `Scaling Multi-Location Operations? Let's Talk.`

### Not-so-good news: site-wide signals *do* conflict with “national enterprise B2B”

Even though the enterprise pages are strong, you still have **significant local + consumer-style signals** elsewhere that can dilute that positioning:

1) **LocalBusiness + geo-based schema is present**
- Homepage embeds `@type: LocalBusiness` JSON-LD (local intent).
- About + Contact embed `@type: ProfessionalService` JSON-LD including **geo coordinates** (local intent).

2) **Many blog posts contain explicit local + B2C language**
- **34** blog posts mention **“Georgia”**.
- **18** blog posts mention **“Atlanta”**.
- **13** blog posts include **`tel:` “Call us” CTAs** (consumer/local behavior).
- Several posts include phrases like **“optometrist appointment in Georgia”** and **“optometry call service in Atlanta, Georgia”**, which is fundamentally **local/B2C phrasing** (patients booking appointments), not enterprise procurement language.

Net: the enterprise pages are set up well, but the overall site still looks partially like a **local optometry call-service provider** because of legacy blog content + schema choices.

## Technical SEO (what’s solid, what needs tightening)

### Solid foundations

- Astro static output (fast, crawlable HTML).
- Trailing-slash canonicals (consistent).
- XML sitemap exists (`/sitemap-index.xml` and `/sitemap-0.xml`).
- HTML sitemap exists (`/sitemap/`) for discovery.
- OG/Twitter meta is present site-wide via layouts.

### Issues to fix (verified)

#### 1) JSON-LD references an image that 404s

The JSON-LD for `LocalBusiness` + `ProfessionalService` references:

- `https://mybcat.com/images/og-default.png` → **404**

This is a concrete quality issue and an easy fix (either add the file, or point schema `image` to an existing OG image).

#### 2) Broken internal page links (SEO + UX)

Broken links found in the built output (page links only, not assets):

- `/about/story/` linked from `/404.html` (target page does not exist)
- `/blog/optometry-billing-best-practices/` linked from `/blog/optometry-private-practice/`
- `/blog/practice-management-software-guide/` linked from `/blog/optometry-private-practice/`
- `/blog/missed-calls-revenue-impact/` linked from `/blog/optometry-private-practice/`
- `/blog/medical-billing-optometry/` linked from `/blog/optometry-private-practice/`

#### 3) Multiple H1 tags on 6 blog posts

These built pages contain **2× `<h1>`**:

- `/blog/animal-hospital-patient-intake/`
- `/blog/optometric-practice-equipment/`
- `/blog/optometry-practice-finances/`
- `/blog/optometry-practice-location/`
- `/blog/optometry-practice-staffing/`
- `/blog/optometry-private-practice/`

### Meta title / description length (enterprise pages are mostly OK; blog needs cleanup)

Using a simple length heuristic (titles > 60 chars; descriptions < 120 or > 160):

- `enterprise` (9 pages): titles too long **1**, descriptions too short **2**, too long **1**
- `blog` (134 pages): titles too long **108**, descriptions too short **13**, too long **4**
- `compare` (7 pages): titles too long **5**
- `case-studies` (5 pages): descriptions too long **4**

For enterprise B2B, prioritize tightening titles/descriptions on:
- `/enterprise/**`
- `/solutions/**`
- `/industries/**`
- `/compare/**`
- `/case-studies/**`

(Blog improvements are still worthwhile, but they’re secondary if you care about enterprise conversion first.)

## “Enterprise B2B National” alignment review

### What’s aligned already

- Clear enterprise IA exists: `/enterprise/` hub + vertical pages + capability pages.
- Page titles/H1s use enterprise vocabulary: “multi-location”, “patient access center”, “DSO”, “enterprise reporting”.
- Contact page is explicitly “Enterprise Team” oriented.

### What’s actively misaligned (and likely hurting the targeting)

#### 1) LocalBusiness + geo schema

If you are *not* trying to be a local business, the current schema types + geo coordinates are counterproductive.

**Recommended direction for enterprise/national:**
- Use `Organization` + `WebSite` globally.
- Use `Service` schema on solution/enterprise pages.
- Use `BreadcrumbList` (already present on many pages).
- Avoid `LocalBusiness` unless you explicitly want local intent.

#### 2) Blog content reads like local/B2C in places

If your target buyer is an enterprise operator (VP Ops, COO, PE ops, etc.), you want:
- “centralized scheduling”, “patient access center”, “call handling SLA”, “rollout for acquisitions”

…not:
- “optometrist appointment in Georgia”
- “call service in Atlanta, Georgia”
- “Call us at 678-855-6130”

This content can still live on the site, but it should be rewritten to avoid geo + consumer phrasing if you want your overall brand to look national/enterprise.

## Prioritized plan (non-local enterprise SEO)

### Phase 0 (1–2 days): remove “local business” signals + obvious technical issues

1) **Remove `LocalBusiness` JSON-LD from homepage**  
   Keep `Organization` + `WebSite`.
2) **Replace/stop using geo-based `ProfessionalService` schema on About/Contact**  
   Replace with an enterprise-friendly schema approach (Organization + ContactPoint, or Service).
3) **Fix schema `image` URL that 404s** (`/images/og-default.png`)
4) **Fix broken internal page links** (5 broken targets listed above)
5) **Fix the 6 pages with multiple H1**

Success criteria:
- No local schema types remain unless intentionally retained.
- No broken internal page links in build output.
- No multi-H1 pages.

### Phase 1 (1–2 weeks): content cleanup to match enterprise positioning

1) **Rewrite/refresh legacy blog posts that mention Atlanta/Georgia + tel CTAs**
   - Remove geo-specific anchor text unless you *intentionally* want state SEO.
   - Replace “Call us” CTAs with enterprise CTAs (contact form, “Talk to enterprise team”, etc.).
2) **Create an “Enterprise content style guide”**
   - Audience: multi-location operators, corporate groups, DSOs, PE ops teams.
   - Language: “locations”, “SLA”, “rollout”, “acquisitions”, “standardization”, “QA”, “integration”.
3) **Improve top-of-funnel enterprise blog clusters**
   - Link clusters to `/enterprise/**` capability pages with consistent anchors.

Success criteria:
- Geo/local phrasing removed from core content (unless intentionally targeted).
- Blog CTAs and internal links point to enterprise funnels.

### Phase 2 (2–6 weeks): build enterprise topical authority (the pages that actually rank + convert)

1) Publish “pillar” pages for enterprise intent (if you want to rank nationally):
   - Patient Access Center outsourcing (healthcare)
   - Centralized scheduling call center (multi-location)
   - Multi-location recall / reactivation operations
   - Call center QA + reporting (healthcare)
2) Add “integration” pages (EHR/PM specific) **only if you can write unique content**:
   - Dentrix, Eaglesoft, Open Dental, Eyefinity, ModMed, etc.
3) Expand enterprise case studies:
   - Add procurement-friendly details: rollout timeline, governance, QA, reporting, compliance.

Success criteria:
- Clear enterprise keyword map to pages.
- Each pillar has 5–10 supporting articles linking in.
- Case studies read like enterprise proof (not SMB testimonials).

### Phase 3 (ongoing): authority / links (enterprise SEO needs this)

1) Repurpose original research (e.g., benchmark posts) into linkable assets (PDF, data tables, “methodology” page).
2) Digital PR:
   - Industry associations, healthcare ops publications, PE ops content, DSO ecosystem partners.
3) Partner pages:
   - EHR/PM vendors and service partners where relevant.

Success criteria:
- Steady increase in referring domains and branded + non-branded impressions in GSC.

## Next steps (if you want me to implement fixes in this repo)

I can implement Phase 0 changes directly (schema + broken links + multi-H1) and then re-run the local build checks to confirm.

