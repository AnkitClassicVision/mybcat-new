# Website Action Plan (mybcat.com)

**Source:** AI talk (Peter + Ankit) — 2026-01-08  
**Repo:** `mybcat-new` (Astro/Vercel)

This is the step-by-step execution plan to address the issues discussed in the meeting: **technical SEO + schema + content depth + E-E-A-T + monitoring**.

---

## 0) Decide what “winning” means (30 minutes)

**Pick the primary KPI for the next 30 days:**
- Leads booked (HubSpot meetings / form submits)
- Rankings for 3–5 “money” clusters (e.g., medical answering service, medical virtual assistant, virtual medical scribe, front desk outsourcing)
- AEO/GEO visibility (AI Overviews / LLM answers)

**Output (write these down):**
- Top 5 pages to treat as “money pages”
- Top 10 keywords/clusters we’ll track weekly

---

## 1) Close out current critical technical work (same day)

These are already documented in-repo; the goal is to ensure they’re **actually live** and then validated in GSC.

**1.1 404 + robots**
- Follow: `404_MANUAL_STEPS.md`
- Source plan: `404_fix_plan.md`

**Definition of done**
- `https://www.mybcat.com/` 308/301 → `https://mybcat.com/`
- Legacy URLs in the 404 report return 308/301 → valid 200 destination
- `https://mybcat.com/robots.txt` returns 200 and includes `Sitemap: https://mybcat.com/sitemap-index.xml`

**1.2 Indexing requests**
- Follow checklist: `GSC-INDEXING-TODO.md`
- Keep adding pages that matter to the business (don’t waste requests on low-intent pages)

---

## Quick findings from this repo (actionable)

- `src/pages/sitemap.astro` sorts blog posts by `pubDate` but the collection uses `publishDate` (can cause wrong “recent posts” ordering).
- JSON-LD schemas on non-homepage pages reference `/#organization`, but `Organization` is currently only emitted on the homepage (`src/layouts/BaseLayout.astro`), which can trigger schema validation warnings.
- `company.email` / `company.phone` are empty in `src/data/company.ts` but are used (or should be used) for trust + structured data; either fill them or omit the fields from schema when blank.

---

## 2) Run a weekly “track health” loop (set up once; then repeat)

This is the “Porsche maintenance + track day tuning” loop from the meeting.

**2.1 Weekly technical crawl**
- Ahrefs Site Audit weekly (or similar)
- Internal: run Playwright tests (`npm test`) + Lighthouse CI (`npx lhci autorun` with `lighthouserc.cjs`)

**2.2 Daily/weekly rank tracking**
- Ahrefs Rank Tracker (daily) for the top 10 keyword clusters

**Definition of done**
- A recurring weekly report exists with: top errors, new 404s, redirect chains, CWV changes, and rank movers (20→10, 10→3)

---

## 3) Fix structured data + E‑E‑A‑T (week 1)

The goal is: **every important page has the right schema**, and blog content clearly ties to a real expert author.

**3.1 Schema coverage**
- Audit current generators: `src/utils/schema.ts` and where they’re applied:
  - `src/layouts/BaseLayout.astro`
  - `src/layouts/LandingLayout.astro`
  - `src/layouts/BlogLayout.astro`
- Validate with Google’s Rich Results Test and Schema Markup Validator (manual)

**3.2 Add dedicated author page**
- Implement: `/author/ankit-patel/` (separate from `/about/`)
- Link from every blog post author name to the author page
- Update Article schema to include the author URL
- Update Ankit’s social profiles to link back to the author page (manual)

**Definition of done**
- No schema validator “errors” on: homepage, 1 solution page, 1 blog post, contact, author page
- Author is unambiguous:
  - `/blog/*` → author name is clickable → `/author/ankit-patel/`
  - Article JSON-LD includes a Person with an explicit URL

---

## 4) Upgrade content depth on “money pages” (weeks 1–3)

This addresses the Surfer-style finding from the meeting: **service pages are thin vs competitors**.

**4.1 Set a standard**
- For each money page: target **~1,000–1,500 words** of helpful content (not keyword stuffing)
- Add content *below the fold* and/or in collapsibles if needed to protect conversion UX

**4.2 Implement per-page upgrades**
- Add: “Who it’s for”, “What’s included”, “Workflow”, “FAQ”, “Outcomes”, “Integrations”, “Pricing factors”, “Common objections”
- Add semantically related terms naturally (based on GSC + Ahrefs keyword opportunities)

**Definition of done**
- Each money page hits target depth and supports its cluster
- Internal linking supports hub-and-spoke (blogs → service page; service page → relevant blogs)

---

## 5) Ongoing content ops (weekly + quarterly)

**Weekly**
- Publish content on a consistent cadence (spread posts; avoid dumping)
- Use rank movers as triggers: when a keyword moves ~20→10, publish supporting spokes for that cluster

**Quarterly**
- Refresh money pages and top-performing blogs (recency + competitiveness)
- Re-run competitor content depth / semantic coverage check

---

## 6) Authority (later, but plan it now)

Authority will cap rankings until the domain earns more trust.

**Start small**
- PR/news release around a legitimately newsworthy angle
- Partner mentions and guest posts in healthcare/ops communities (relevance matters)
- Avoid spam link packs

**Definition of done**
- A monthly target exists (e.g., “X new referring domains/month”), tracked in Ahrefs

---

## 7) CRO + funnel measurement (parallel track)

SEO wins don’t matter if the funnel leaks.

**Minimum**
- Confirm conversions: form submit, meeting booked, phone clicks
- Ensure HubSpot events + attribution are clean

---

## What to do next (pick 1)

1) Finish the remaining manual items in `404_MANUAL_STEPS.md` and validate in GSC  
2) Implement `/author/ankit-patel/` + wire it into blog templates + Article schema  
3) Pick the top 3 money pages and do the content-depth upgrade pass
