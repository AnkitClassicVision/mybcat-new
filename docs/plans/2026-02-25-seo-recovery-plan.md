---
title: "MyBCAT Organic Search Recovery Plan (2026-02-25)"
description: "Evidence-based diagnosis for the Feb 2026 click decline, plus a recovery plan focused on CTR uplift, redirects, and internal linking with GSC validation steps."
---

# mybcat.com Organic Search Analysis + Recovery Plan

**Created:** 2026-02-25  
**Repo:** `mybcat-new` (Astro/Vercel static site)  
**Primary objective:** explain the observed “organic traffic decline” with evidence, then define a production-ready recovery plan with measurable acceptance criteria and validation hooks.

---

## 0) Executive summary (what’s happening, in plain English)

- **This is not an indexing/technical-breakage story right now.** As of 2026-02-25, the repo’s post-build validators report: schemas valid, internal links valid, redirects valid, and sitemap URLs all return 200 (`reports/validation-2026-02-25.txt`).
- **Clicks are down over the last 90 days vs the previous 90 days**, but **impressions are way up** and **average position improved**. Net: the site is being shown more often, but it’s earning fewer clicks per impression (**CTR collapse**).
- The decline is most visible in the **US segment** and also in **Philippines traffic** (which likely includes internal/team traffic and is not the core SEO market).
- The “decline” is **mostly a mix-shift**: legacy pages (many now redirected) are losing clicks while newer content (especially blog) is earning massive impressions with low CTR.
- The recovery plan focuses on (1) **CTR uplift on high-impression pages**, (2) **intent matching + content clustering**, and (3) **making sure legacy redirects land on the best canonical destination** for the query they rank for.

---

## 1) Sources of truth (and where the data lives in this repo)

### 1.1 Live analytics sources
- **Google Search Console (GSC):** `sc-domain:mybcat.com` (domain property)
- **GA4:** Property **382796644** (“MyBcat.com”)

### 1.2 Repo-based validation sources
- SEO & content validators (CI): `.github/workflows/seo-validation.yml`
- Weekly audit workflow: `.github/workflows/weekly-audit.yml`
- Local validation guide: `docs/VALIDATION-QUICK-START.md`

### 1.3 Exported datasets generated on 2026-02-25
- GSC CSV exports: `reports/gsc/`
- Validation run output: `reports/validation-2026-02-25.txt`

> Note: GSC query-level data is often privacy-thresholded (“anonymized queries”), so query breakdowns may not reconcile perfectly with page/date totals.

---

## 2) What the data says (quantified)

### 2.1 Sitewide deltas (GSC domain property)

**Last 90 days vs previous 90 days**
- **Last 90d:** 2025-11-26 → 2026-02-24  
  - Clicks: **734**  
  - Impressions: **118,691**  
  - Avg position: **14.2**  
  - Avg CTR: **0.75%**
- **Prev 90d:** 2025-08-28 → 2025-11-25  
  - Clicks: **840** (**-12.6%**)  
  - Impressions: **49,579** (**+139%**)  
  - Avg position: **16.4** (improved)  
  - Avg CTR: **1.71%** (down)

**Interpretation:** visibility increased (impressions up; position improved), but click yield dropped. This is almost always driven by (a) query mix expansion to broader/less-clicky queries, (b) snippet/title/brand mismatch, (c) SERP feature displacement, or (d) “ranking but not for the right intent.”

### 2.2 US-only deltas (GSC country=usa)

**Last 90d vs previous 90d**
- **USA clicks:** 398 → 360 (**-9.5%**)  
- **USA impressions:** 38,274 → 81,181 (**+112%**)  
- **USA CTR:** 1.04% → 0.44%  
- **USA avg position:** 20.0 → 13.5 (improved materially)

**Interpretation:** in the core market, the problem is still CTR (and/or intent/snippet), not crawl/index.

### 2.3 Recent rebound (last 28 days vs previous 28 days)

- **Last 28d (2026-01-28 → 2026-02-24):** 354 clicks / 62,322 impressions / avg pos 11.2 / CTR 0.62%  
- **Prev 28d (2025-12-31 → 2026-01-27):** 209 clicks / 40,355 impressions / avg pos 15.9 / CTR 0.56%

**Interpretation:** there is a near-term recovery underway (clicks up), but the 90d window still shows net click decline because CTR remains low.

### 2.4 Device mix (last 90d)

From `reports/gsc/gsc_device_2025-11-26_to_2026-02-24.csv`:
- Desktop: 458 clicks / 89,884 impressions / CTR 0.51%
- Mobile: 270 clicks / 26,267 impressions / CTR 1.03%

**Interpretation:** not a mobile-only collapse; desktop CTR is the bigger drag.

---

## 3) Where the change happened (pages + redirects + content mix)

### 3.1 Section mix shift (last 90d vs previous 90d; page buckets)

Using `reports/gsc/gsc_pages_2025-11-26_to_2026-02-24.csv` vs `reports/gsc/gsc_pages_2025-08-28_to_2025-11-25.csv`:
- “Legacy/other” pages: **-399 clicks**
- Blog: **+225 clicks** (but at very low CTR)
- Industries: +33 clicks
- Solutions: +20 clicks
- Compare: +7 clicks

**Interpretation:** you’re replacing legacy click volume with blog/TOFU visibility. That’s fine strategically, but you must raise blog CTR and convert that authority into money pages.

### 3.2 Biggest losing pages (last 90d vs previous 90d)

Top losses by click delta:
- Homepage `/`: **-154 clicks**
- `/customer-service-outsourcing-provider-careers` (redirects to `/careers/`): **-61 clicks**
- Legacy optometry call service local slug (redirects to `/industries/optometry/`): **-34 clicks**
- Old valuation slug (redirect legacy): **-29 clicks**
- `/virtual-assistants-for-optometrists` (redirects to `/industries/optometry/`): **-22 clicks**

**Interpretation:** the click decline is concentrated in **legacy URLs and brand navigational behavior**. This is consistent with a site restructuring + repositioning (B2C/local → enterprise/national) and with brand-demand fluctuations.

### 3.3 High-impression pages with low CTR (largest leverage list)

From `reports/gsc/gsc_pages_2025-11-26_to_2026-02-24.csv`:
- `/blog/optometry-practice-finances/`: 16,291 impressions, **0.14% CTR**, avg pos 3.8
- `/blog/the-optometric-practice-valuation-guide-for-buyers-and-sellers/`: 5,751 impressions, **0.35% CTR**, avg pos 8.2
- `/blog/optometry-private-practice/`: 4,161 impressions, **0.41% CTR**, avg pos 13.1
- `/pricing/`: 2,024 impressions, **0.25% CTR**, avg pos 10.1
- `/solutions/medical-virtual-assistant/`: 3,367 impressions, **0.39% CTR**, avg pos 17.8
- `/compare/vs-hello-rache/`: 1,555 impressions, **0.32% CTR**, avg pos 9.7

**Interpretation:** CTR uplift on a handful of pages can recover a meaningful share of lost clicks without any ranking gains.

---

## 4) Root-cause hypotheses (ranked with confidence)

### H1 — CTR collapse due to query-mix expansion (High confidence)
Evidence:
- Impressions up massively; avg position improved; clicks down in 90d window.
- Blog drives the largest impression volume with **weighted CTR ~0.33%** (last 90d).

What would falsify it:
- If the same query set shows stable CTR and clicks are down due to rank loss. (Current exports suggest the opposite.)

### H2 — Branded demand is down (Medium confidence)
Evidence:
- Reported GSC queries show fewer clicks for **“mybcat”** and **“my business care team”** in last 90d vs previous 90d.

What would falsify it:
- If Search Console UI (or a complete export) shows brand clicks stable but non-brand clicks down.

### H3 — Legacy redirects and “best destination” mismatches (Medium confidence)
Evidence:
- Many losing URLs are legacy slugs now redirecting to new pages.
- Some redirects route semantically similar slugs to different destinations (e.g., process/careers/about patterns). These can reduce relevance and CTR when old URLs still appear in SERPs.

What would falsify it:
- If redirect destinations are consistently the most relevant canonical page for the ranking queries and CTR does not improve when destinations are corrected.

### H4 — Content intent mismatch (High confidence)
Evidence:
- Several pages show very high impressions and good average positions but extremely low CTR, which is typical when the snippet does not match intent or the title is not competitive.

What would falsify it:
- If snippet/title/meta changes do not move CTR despite stable positions and impressions.

### H5 — Technical SEO regression (Low confidence *right now*)
Evidence against:
- Current validators pass for schema, links, sitemap health, redirects, and URL stability as of 2026-02-25.

---

## 5) Recovery plan (prioritized, production-oriented)

### Track A — CTR uplift on high-impression pages (0–14 days)

**Goal:** raise CTR where we already have visibility.

**Process**
1) Build a weekly “high impressions + low CTR” queue from GSC page exports.
2) For each page, adjust:
   - `seoTitle` (50–60 chars; front-load keyword; add outcome hook)
   - `seoDescription` (intent match; outcome; credibility; CTA)
   - on-page above-the-fold: add 1–2 sentence “direct answer” block aligned to query intent
3) Re-run validators (pre + post build) and ship.
4) Measure in GSC after 7–14 days (positions stable? CTR moved?).

**Initial target list (start here)**
- `src/content/blog/optometry-practice-finances.md`
- `src/content/blog/the-optometric-practice-valuation-guide-for-buyers-and-sellers.md`
- `src/content/blog/optometry-private-practice.md`
- `src/pages/pricing.astro`
- `src/pages/solutions/[slug].astro` (ensure solution titles are CTR-competitive)
- `src/pages/compare/[slug].astro` (ensure compare titles answer “vs” intent clearly)

**Acceptance criteria**
- For each targeted page: CTR increases by **≥ 30% relative** within 14–28 days *without* a significant position drop.

---

### Track B — Pricing intent capture (0–21 days)

**Goal:** win “pricing/cost” queries that currently generate impressions with near-zero clicks.

Actions:
- Expand `/pricing/` to directly answer:
  - “medical answering service pricing”
  - “medical answering service cost”
  - “how much does a medical answering service cost”
- Add a pricing FAQ block with schema (already validated by `npm run validate:schema`).

Acceptance criteria:
- GSC query “medical answering service pricing” shows non-zero clicks and CTR improvement within 30–45 days.

---

### Track C — Legacy redirect relevance audit (0–30 days)

**Goal:** ensure legacy URLs that still appear in SERPs redirect to the most relevant canonical destination.

Actions:
- From `reports/gsc/gsc_pages_2025-11-26_to_2026-02-24.csv`, extract legacy/root slugs (non-`/blog/`, non core pages) with significant impressions.
- For each:
  - verify current redirect destination in `vercel.json`
  - decide canonical destination based on query intent (not “closest page”)
  - ensure **single-hop** permanent redirect to canonical + trailing slash

Acceptance criteria:
- No high-impression legacy slug redirects to a semantically mismatched page (manual review using GSC + SERP checks).

---

### Track D — Internal linking: convert blog visibility into money-page strength (2–8 weeks)

**Goal:** push authority from blog to solutions/enterprise pages while keeping user intent intact.

Actions:
- Enforce inbound-link minimums already configured in `scripts/config/enterprise-links.json` and validated by `npm run validate:enterprise-links`.
- Add contextual links from top blog pages to:
  - `/enterprise/` and enterprise subpages
  - relevant `/solutions/.../` pages
  - relevant `/compare/.../` pages for competitor-intent queries

Acceptance criteria:
- Enterprise link validator warnings trend to zero; money pages see impression and position gains over 6–12 weeks.

---

### Track E — Authority & distribution (ongoing; 6–16 weeks)

**Goal:** improve non-brand rankings via links and reputation signals.

Actions (ops, not code):
- prioritize 10–20 high-fit link targets (associations, partners, podcasts, case studies)
- publish 1–2 “linkable assets” per quarter (benchmark reports, calculators, original data)
- track referring domains + non-brand impressions as KPIs

Acceptance criteria:
- sustained growth in non-brand impressions and clicks over 3–6 months.

---

## 6) Validation + monitoring (no regressions)

### 6.1 Local/CI validation (already in place)
- Pre-build: `npm run validate:terms`, `validate:meta`, `validate:h1`, `validate:enterprise-links`, `validate:content-quality`
- Post-build: `npm run validate:schema`, `validate:links`, `validate:redirects`, `validate:sitemap`, `validate:url-stability`

### 6.2 Weekly reporting (minimum)
- GSC: clicks, impressions, CTR, position (US-only and sitewide)
- Segment: blog vs solutions vs industries vs compare vs enterprise
- “Top 10 CTR opportunities” list
- “Top 10 losing queries/pages” list

---

## 7) Appendix — Autonomous SEO Ops Agent (zero runtime approvals)

This appendix shows how to apply `docs/AGENT_FACTORY_FRAMEWORK.md` to mybcat.com SEO operations.

### 7.1 Allowed actions (strict)
- Read-only: pull GSC/GA4 data; run validators; build site; compute diffs
- Reversible writes: open PRs that change titles/meta/internal links/redirects
- Irreversible actions: **denied** (DNS changes, deleting data, paid spend changes)

### 7.2 Machine-enforced gates
- PR auto-merge only if:
  - `npm run build` passes
  - `npm run validate:all` passes
  - Lighthouse CI meets thresholds (existing `lighthouserc.cjs`)
  - scenario satisfaction score ≥ threshold (holdouts stored outside the repo)

### 7.3 Kill switch
- A single repo variable/secret (e.g., `AUTONOMY_WRITES_ENABLED=false`) that forces the agent into observation-only mode.

### 7.4 Scenarios to add (examples)
- “High-impression pages do not ship with missing/weak meta”
- “Redirect changes do not introduce chains”
- “Enterprise pages maintain inbound link minimums”
