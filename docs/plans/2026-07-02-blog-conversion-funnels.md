---
title: "Blog Conversion Funnels + Finance-Intent CTAs (2026-07-02)"
description: "Revisit-and-merge plan for PR #73: finance-cluster CTA split into open/profit/seller intents, valuation-guide upgrade, locked decisions, and merge steps."
---

# Blog Conversion Funnels + Finance-Intent CTAs

Date: 2026-07-02
Owner: Ankit
Status: **Awaiting merge** (PR #73). Week-1 funnel work already SHIPPED (PR #71, live).

---

## ELI5

The blog attracts the right readers but the site never asked them to buy in a way that fit who they were. We now show each reader a call-to-action matched to what they came for, and every click is tagged so a booked discovery call can be traced back to the exact topic. Nothing here creates new traffic; it converts the traffic that already shows up.

## End goal (Definition of Done)

Organic search produces **4+ attributed discovery calls/month** from optometry owner-operators within ~90 days, measurable end to end (organic click -> theme-tagged CTA -> HubSpot booking with `utm_campaign=theme-*`). Ties to the quarterly PARALLEL OBJECTIVE recorded in `exports/operating-model/OBJECTIVES.md` (organic discovery-call channel).

## Business purpose

Sales is founder-owned and the growth engine is gated by call-quality/sales confidence. A working organic-inbound channel that self-attributes reduces dependence on outbound and gives a second, compounding lead source. Positioning per OB_mybcat: Remote Hospitality Center + Patient Acquisition Engine; sells booked visits/outcomes, not agent hours.

---

## What shipped in Week 1 (PR #71, MERGED + LIVE)

- `src/data/blog-ctas.ts`: cluster -> funnel-theme CTA routing map (recall_fill_book, finances_selling, operations, default).
- `src/layouts/Blog.astro`: wired the orphaned `InContentCTA` mid-article + themed end-of-post CTA; GTM `blog_cta_click` events; UTM-tagged hrefs for per-theme booking attribution. Upgrades all blog posts.
- A4 internal-link mesh from top posts to `/industries/optometry/`, `/compare/vs-hello-rache/`, `/solutions/no-show-recovery/`.
- A1: `/industries/optometry/` retitled for the "optometry virtual assistant" query (was pos ~2.8, 1.3% CTR) + "Book a Discovery Call" hero CTA. Fixed a raw-HTML-in-hero bug on all industry pages.
- Off-ICP guard + `ctaTheme` frontmatter override so dental/DSO-bodied posts get neutral copy.
- Nav dropdown hover-gap fix (PR #72, merged + live) - unrelated but same session.

## What is IN PR #73 (awaiting Ankit merge)

Finance-cluster CTA differentiation. The finance cluster served one generic CTA to three different buyers; split into three intent variants in `src/data/blog-ctas.ts`, all grounded in OB_mybcat offer + Style 2 voice:

| Variant | Reader | Message | Offer | Posts |
|---|---|---|---|---|
| `finance_open` | opening/building a practice | "open without carrying a full front desk from day one" | remote front-office service | 8 |
| `finance_profit` | margin-stressed existing owner | "another location's worth of profit, without the overhead" | Practice Profit Audit | 2 |
| `finance_seller` | exit-minded owner | "raise the value before you list" (advisor stance) | Practice Profit Audit | 3 |

- 14 finance posts routed by true intent via `ctaTheme` frontmatter (13 + the upgraded valuation guide).
- **Valuation guide upgrade** (`the-optometric-practice-valuation-guide-for-buyers-and-sellers.md`): was failing the content-quality gate on pre-existing debt (word count, no Sources, no citations, no body CTA). Upgraded with two operations-to-value sections, real external citations (Peak Business Valuation + AOA, no fabricated figures), a `/contact/` Practice Profit Audit CTA, and internal links. Now 1805 words, 4 external cites, 6 internal links, 0 gate errors. Tagged `finance_seller`.
- UTM per intent: `theme-finance-open` / `theme-finance-profit` / `theme-finance-seller`.

### Strategic decisions locked (ratify or change on revisit)

1. **Seller framing = ADVISOR, not acquirer.** OB_mybcat decision 2026-06-24 PAUSED the MSO/roll-up/buy-or-sell-practices lane. So seller copy says "raise value before you list," never "we buy your practice." Change ONLY on an explicit, unambiguous Ankit go to revive sell-side.
2. **Offer anchor = "another location's worth of profit, without the overhead" + Practice Profit Audit** (OB flagship, launching 2026-06-24). Not "MBA-equivalent report" in public copy.
3. **`finance_open` uses frame (b)** ("open lean, we run the phones") not frame (a) ("don't open, find it in your current practice"), because frame (a) copy mismatched genuine new-practice readers (caught by Codex QA).

## Guardrails honored

- Protected surfaces (offer positioning, financial claims) = draft/propose/PR, Ankit merges. No autonomous publish; deploy = merge.
- No fabricated metrics/price/timeline; conditional profit language only.
- No banned words, no em-dashes, no semicolons (Style 2 voice guide).
- EBITDA not oversimplified (real capex caution per OB).
- No PHI.

## Verification status

- Content-quality gate: 0 errors on all 14 changed posts.
- Deterministic compliance scan (finance variants): zero banned words, no em-dashes/semicolons, no roll-up phrases, consistent offer name.
- Deployed Vercel preview verified: each post emits the correct `theme-finance-*` UTM.
- CI on PR #73: build + Content Quality + Pre-Build + Vercel all green (Lighthouse/Post-Build finishing at time of writing).
- **Caveat:** fresh-agent Codex recheck TIMED OUT on a degraded local environment; not a clean second-model PASS. v1 Codex findings (offer-name, first-timer routing) were addressed and re-verified deterministically. Ankit merge = human sign-off.
- Local `npm run build` was hanging on the mounted drive (environment, not code); Vercel's clean build compiling is the authoritative proof the TS/rename is fine.

## HOW TO REVISIT + MERGE

```bash
cd /mnt/d_drive/repos/mybcat-new && gh pr checks 73 && gh pr view 73
```

If all checks green and the decisions above still hold:

```bash
cd /mnt/d_drive/repos/mybcat-new && gh pr merge 73 --squash
```

Then verify live (deploy = merge):

```bash
curl -s https://mybcat.com/blog/optometry-practice-finances/ | grep -o "utm_campaign=theme-finance-[a-z]*"
```

## Week-2 queue (NOT started - awaiting go per item)

- **A3**: Free Phone & Staffing Analysis page (the low-friction offer/CTA target).
- **C2/C3**: embed ROI/EBITDA calculators in posts + gated assets (Recall Kit PDF, Front Desk Benchmarks).
- **C1** (gated, CRM): HubSpot `blog_theme` property + 3 theme lists + derivation workflow. Packet drafted, ZERO CRM writes done.
- **C6** (gated, CRM): RB2B identified-visitor -> HubSpot Daily 2 warm-signal feed, log-only shadow first.
- **B4**: cluster backfill on ~70 untagged posts.
- Optional: swap `finance_open` to frame (a) if intercepting committed openers is preferred over lean-open.

## Measurement watch

HubSpot bookings by `utm_campaign=theme-*`; GTM `blog_cta_click` by theme; GSC CTR on "optometry virtual assistant" (baseline 1.3% at pos 2.8). 30-day checkpoint with kill criteria: if the CTA/asset layer shows zero booking motion, stop the nurture buildout and double down on the RB2B->outbound loop (C6).

## Provenance

PRs: #71 (merged, live), #72 (nav fix, merged), #73 (this plan's finance work, awaiting merge).
OB_mybcat: Work Ledger checkpoint 2026-07-02 (topic: seo, conversion-funnels, mybcat-website); offer source decision 2026-06-24 (topic: product-positioning, another-location-profit, expansion without overhead).
