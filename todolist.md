# MyBCAT Site Spec Action Plan — Todo List

> Source: `MyBCAT_site_spec_action_plan.pdf` (Feb 20, 2026)
> Generated: 2026-02-20
> Each item checked against live repo state at `/mnt/d_drive/repos/mybcat-new`

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| DONE | Already implemented, no work needed |
| TODO | Not started, needs implementation |
| PARTIAL | Partially done, needs finishing |

---

## M1 — AI Discoverability

### 1. /llms.txt at site root — DONE

| Field | Detail |
|-------|--------|
| **Item** | Serve `/llms.txt` at site root (HTTP 200, UTF-8) following llmstxt.org format |
| **Deliverables** | `public/llms.txt` with H1 title, blockquote summary, sections with bullet links |
| **Success Criteria** | Returns 200; contains only canonical URLs; sections reflect actual navigation; no staging/UTM/admin URLs |
| **Current State** | `public/llms.txt` exists (74 lines). Follows spec format: H1 title, blockquote summary, 8 sections with canonical URLs. Includes AI Profile link. Also has `public/llms-full.txt` extended version. |

### 2. /ai-profile page — DONE

| Field | Detail |
|-------|--------|
| **Item** | Create a public AI Profile page at `/ai-profile/` with factual, verifiable company information for AI citation |
| **Deliverables** | New Astro page at `src/pages/ai-profile.astro` with content blocks: Core identity, Services, Ideal customer, How it works, Differentiators, Compliance/Security, Contact, About this page |
| **Success Criteria** | Page loads at `/ai-profile/`; indexable (not blocked by robots.txt or noindex); content matches real offerings; factual and specific with no marketing fluff or unverifiable superlatives |
| **Current State** | Implemented at `src/pages/ai-profile.astro`. Builds to `/ai-profile/index.html` (38KB). Uses PageLayout with breadcrumbs. Content sourced from `company.ts` data. Build verified. |

### 3. AI Profile footer link — DONE

| Field | Detail |
|-------|--------|
| **Item** | Add "AI Profile" link in the site footer, in the Legal column next to Privacy Policy and Terms |
| **Deliverables** | Added `<a href="/ai-profile/">AI Profile</a>` to the Legal section of `src/components/Footer.astro` |
| **Success Criteria** | Link appears site-wide in footer; same UI location as Privacy/Terms; resolves to the AI Profile page |
| **Current State** | Implemented in Footer.astro. Link added after GDPR in the Legal column. |

### 4. Update llms.txt with AI Profile link — DONE

| Field | Detail |
|-------|--------|
| **Item** | Add AI Profile URL to `public/llms.txt` in the "Start here" section |
| **Deliverables** | Added line `- AI Profile: https://mybcat.com/ai-profile/` to the "Start here (core)" section |
| **Success Criteria** | llms.txt includes AI Profile link; link resolves to 200 |
| **Current State** | Implemented. Link added to "Start here (core)" section of `public/llms.txt`. |

---

## M2 — Generator Quality

### 5. TOC validator (code-enforced) — DONE

| Field | Detail |
|-------|--------|
| **Item** | Add automated validator that checks all blog posts >= 2000 words have a `## Table of Contents` section |
| **Deliverables** | New check in `scripts/validators/validate-content-quality.js`: computes word count, verifies `## Table of Contents` exists when >= 2000 words |
| **Success Criteria** | Running validator on all posts >= 2000 words reports warnings for missing TOCs; threshold configurable via `minWordCountForTOC` in config |
| **Current State** | Implemented as soft-fail warning in `validate-content-quality.js`. Config threshold `minWordCountForTOC: 2000` added to `content-quality-rules.json`. Currently flags 2 posts missing TOC. |

### 6. H2 question ratio validator (code-enforced) — DONE

| Field | Detail |
|-------|--------|
| **Item** | Add automated validator that checks >= 70% of H2 headings are phrased as questions |
| **Deliverables** | New validation rule in `validate-content-quality.js`: parses H2 headings, excludes structural headings (Table of Contents, Sources, Related Reading, Key Takeaways, Next Steps, Common Questions, Frequently Asked Questions), calculates ratio, warns when below 70% |
| **Success Criteria** | Validator runs as part of `npm run validate:content-quality`; threshold configurable via `minH2QuestionRatio` in config; structural headings exempt from count |
| **Current State** | Implemented as soft-fail warning. Config threshold `minH2QuestionRatio: 0.70`. Flags posts below 70% with specific non-question headings listed. |

### 7. Heading slug dedup check — DONE

| Field | Detail |
|-------|--------|
| **Item** | Add validator to detect duplicate heading slugs within a single post |
| **Deliverables** | Check in content quality validator: slugifies all H2/H3 headings, detects duplicates, warns when found |
| **Success Criteria** | Warns on duplicate heading slugs that would produce broken anchor links in TOC |
| **Current State** | Implemented as soft-fail warning in `validate-content-quality.js`. Currently flags 1 post with duplicate slugs (`optometry-network-operations-scale`). |

---

## M3 — Authority + Trust

### 8. Topic taxonomy allowlist enforcement — DONE

| Field | Detail |
|-------|--------|
| **Item** | Enforce that every blog post maps to an approved topic cluster and prevent off-topic content generation |
| **Deliverables** | (1) Config file at `scripts/config/topic-taxonomy.json` with 13 approved clusters. (2) Validation in `validate-content-quality.js` that checks `cluster` frontmatter against allowlist. (3) Evaluator scenario in `evaluate-post.js` that fails posts without valid cluster. |
| **Success Criteria** | Posts without a valid `cluster` field get warnings; unapproved cluster values flagged with list of valid options |
| **Current State** | Config + validator + evaluator all implemented. Strategy: "broad-multi-vertical" with 13 clusters. Note: 101/152 posts still lack a `cluster` field — backfilling is a separate content task, not a regression. |

### 9. Source/citation HTTP liveness checker — DONE

| Field | Detail |
|-------|--------|
| **Item** | Add automated checker that validates all outbound citation URLs in blog posts are live |
| **Deliverables** | New script `scripts/validators/validate-citations.js`: extracts URLs from `## Sources` sections, HEAD/GET requests each, flags dead (HTTP 400+/timeout), detects archive.org URLs, checks authority domains |
| **Success Criteria** | Run via `npm run validate:citations`; reports dead URLs, archive URLs, and low-authority-only posts |
| **Current State** | Implemented with concurrency control, timeout, archive detection, and authority heuristic. npm script `validate:citations` added to `package.json`. |

### 10. Source authority heuristic — DONE

| Field | Detail |
|-------|--------|
| **Item** | Check preferring authoritative sources (.gov, .edu, recognized industry bodies) |
| **Deliverables** | Built into `validate-citations.js`: categorizes domains against known authority list (NIH, CDC, AOA, ADA, AVMA, MGMA, etc.); warns when a post has no authority-domain sources |
| **Success Criteria** | Warnings generated for posts with all low-authority sources |
| **Current State** | Implemented as part of citation validator. Authority domain list includes .gov, .edu, and recognized healthcare industry bodies. |

---

## M4 — Indexing + Ops

### 11. IndexNow integration — DONE

| Field | Detail |
|-------|--------|
| **Item** | Submit new URLs to IndexNow on publish for faster Bing/Yandex discovery |
| **Deliverables** | IndexNow key file at site root; batch submission on publish; key verification in Bing Webmaster Tools |
| **Success Criteria** | Key file returns 200 at site root; new posts submitted on publish; logs show success responses |
| **Current State** | Fully implemented. Key file at `public/d0fa8fc9f2c9f1eddea0d7f5ba4163e8.txt`. `publish-scheduled.js` pings `api.indexnow.org` with batch POST after publishing. |

### 12. PR template / release checklist — DONE

| Field | Detail |
|-------|--------|
| **Item** | Create a PR template with the release checklist from the spec |
| **Deliverables** | File at `.github/PULL_REQUEST_TEMPLATE.md` with checklist: llms.txt reachable, AI Profile reachable + in footer, TOC on long posts, H2 question ratio passes, validate:content-quality passes, validate:all passes, link checker passes, IndexNow logs success, no unintentional noindex |
| **Success Criteria** | Every new PR auto-populates with checklist |
| **Current State** | Implemented at `.github/PULL_REQUEST_TEMPLATE.md`. Includes summary section, 9-item release checklist, and rollback plan section. |

### 13. Separate evaluator agent — DONE

| Field | Detail |
|-------|--------|
| **Item** | Set up a separate evaluator to run scenario tests on generated content before publishing |
| **Deliverables** | `scripts/evaluate-post.js` — independent evaluator script with 6 scenario tests: (1) Content Quality — all hard-fail checks pass; (2) Topical Alignment — valid cluster mapping; (3) H2 Question Format — >= 70% threshold; (4) Table of Contents — present for >= 2000 word posts; (5) Compliance — pattern-based detection of medical diagnosis claims, absolute guarantees, sensitive data references, legal risk language; (6) Quality Warnings — informational roll-up |
| **Success Criteria** | Run via `npm run evaluate-post <file>` or `npm run evaluate-post -- --all --new-only`; produces clear pass/fail per scenario; exit code 1 on failures |
| **Current State** | Implemented. Batch mode: 32 pass / 28 fail across 60 new posts (failures are pre-existing content gaps: missing cluster, missing TOC). Single-post mode tested and working. |
| **Notes** | This covers the deterministic evaluation scenarios from the spec. LLM-based uniqueness checking (comparing against SERP patterns) would require API integration and is deferred as a future enhancement. The compliance check uses regex patterns rather than LLM inference, catching the most common risk patterns without API costs. |

---

## M0 — Already Implemented (Pre-existing)

These items from the spec were already fully implemented before this work:

| # | Item | Evidence |
|---|------|----------|
| A | `/llms.txt` at site root | `public/llms.txt` — llmstxt.org format, canonical URLs only |
| B | `/llms-full.txt` extended version | `public/llms-full.txt` — full catalog for LLMs |
| C | IndexNow key file | `public/d0fa8fc9f2c9f1eddea0d7f5ba4163e8.txt` |
| D | IndexNow submission on publish | `scripts/publish-scheduled.js` lines 164-182 |
| E | Content quality validator | `scripts/validators/validate-content-quality.js` — word count, prose density, citations, internal links, CTA, banned phrases |
| F | Internal link validator | `scripts/validators/validate-links.js` |
| G | Cross-link validator | `scripts/validators/validate-cross-links.js` |
| H | Blog cluster/taxonomy frontmatter | Posts use `cluster` field |
| I | TOC in most posts | 90/152 posts already have `## Table of Contents` |
| J | H2 question headings (bulk conversion) | Commits `39be772` and `e181678` |
| K | Sitemap URL health checker | `scripts/check-sitemap-urls.mjs` |
| L | robots.txt with AI crawler controls | Differentiated policies for training vs search bots |
| M | Automated publishing workflow | `scripts/publish-scheduled.js` with quality gate |

---

## Summary

| Status | Count | Items |
|--------|-------|-------|
| DONE | 13 | All items #1-13 across milestones M1-M4 |
| TODO | 0 | -- |

### Files Created/Modified in This Sprint

| File | Action | Purpose |
|------|--------|---------|
| `src/pages/ai-profile.astro` | Created | AI Profile page (#2) |
| `src/components/Footer.astro` | Modified | Added AI Profile link (#3) |
| `public/llms.txt` | Modified | Added AI Profile URL (#4) |
| `scripts/validators/validate-content-quality.js` | Modified | Added TOC, H2 question ratio, slug dedup, cluster checks (#5, #6, #7, #8) |
| `scripts/config/content-quality-rules.json` | Modified | Added `minWordCountForTOC` and `minH2QuestionRatio` thresholds (#5, #6) |
| `scripts/config/topic-taxonomy.json` | Created | Topic cluster allowlist with 13 clusters (#8) |
| `scripts/validators/validate-citations.js` | Created | Citation liveness + authority checker (#9, #10) |
| `scripts/evaluate-post.js` | Created | Pre-publish evaluator with 6 scenario tests (#13) |
| `package.json` | Modified | Added `validate:citations` and `evaluate-post` scripts |
| `.github/PULL_REQUEST_TEMPLATE.md` | Created | PR release checklist (#12) |

### Verification Results

| Check | Result |
|-------|--------|
| `npx astro build` | 371 pages, 0 errors |
| `validate:content-quality --new-only` | 0 errors, 38 warnings (all soft-fail) |
| `evaluate-post --all --new-only` | 32 pass, 28 fail (pre-existing content gaps) |
| AI Profile page builds | `/ai-profile/index.html` (38KB) |
| Footer link present | Confirmed in Footer.astro |
| llms.txt updated | AI Profile URL in "Start here" section |
