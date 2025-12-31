# MyBCAT Website Migration Plan

## Overview

Migration from **mybcat.com** (WordPress) to **mybcat-new.vercel.app** (Astro)

**Generated:** 2024-12-30
**Status:** COMPLETED

---

## Pre-Migration Checklist

### Critical Issues to Fix

| # | Issue | File | Status |
|---|-------|------|--------|
| 1 | X-Robots-Tag set to noindex | vercel.json:14 | FIXED |
| 2 | Missing 124 redirect entries | vercel.json | FIXED |
| 3 | Canonical URLs point to wrong paths | src/content/blog/*.md | FIXED |

---

## Step 1: Fix X-Robots-Tag Header

**File:** `vercel.json`
**Line:** 14
**Change:** `noindex, nofollow` → `index, follow`

### Before
```json
{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }
```

### After
```json
{ "key": "X-Robots-Tag", "value": "index, follow" }
```

**Verification:** Run Codex to confirm change

---

## Step 2: Add Redirect Entries

**File:** `vercel.json`
**Section:** `redirects` array

### Redirects to Add (62 unique paths, 124 entries with trailing slash variants)

#### High Priority (SEO/Backlinked Pages)
- `/about-book` → `/resources/book/`
- `/about-podcast` → `/resources/podcast/`
- `/integrations` → `/solutions/integrations/`
- `/virtual-medical-scribes-for-optometrists` → `/solutions/virtual-medical-scribe/`
- `/virtual-team-solutions-for-you` → `/blog/virtual-team-solutions-for-you-2/`

#### Medium Priority (Old Structure Pages)
- All `/customer-service-outsourcing-*` pages
- All `/service-package-*` pages
- Solution and industry pages

#### Low Priority (Deprecated/Test Pages)
- `/gemini-website` → `/`
- `/sitemap` → `/`
- `/seco-2024-registration` → `/contact/`

**Verification:** Run Codex to confirm all redirects added

---

## Step 3: Fix Canonical URLs in Blog Posts

**Directory:** `src/content/blog/`
**Files:** All `.md` files with canonical field

### Change Pattern
```
canonical: "https://mybcat.com/[slug]"
↓
canonical: "https://mybcat.com/blog/[slug]"
```

**Verification:** Run Codex to confirm canonical URLs updated

---

## Step 4: Final Verification

- [x] Build passes without errors (165 pages, 7.36s)
- [x] All redirects configured (148 entries)
- [x] Canonical URLs are correct (90 files fixed)
- [x] Sitemap includes all pages (sitemap-index.xml generated)
- [x] No console errors

---

## Post-Migration Tasks

1. Submit new sitemap to Google Search Console
2. Request indexing for high-priority pages
3. Monitor for 404 errors in first 7 days
4. Check traffic patterns in Google Analytics

---

## Rollback Plan

1. Revert DNS to old WordPress hosting
2. Keep old site available at `old.mybcat.com` for 90 days
3. Document any issues encountered

---

## Execution Log

| Step | Started | Completed | Verified | Notes |
|------|---------|-----------|----------|-------|
| 1 | 2024-12-30 | 2024-12-30 | YES | X-Robots-Tag → "index, follow" |
| 2 | 2024-12-30 | 2024-12-30 | YES | Added 106 new redirects (148 total) |
| 3 | 2024-12-30 | 2024-12-30 | YES | Fixed 90 blog canonical URLs |
| 4 | 2024-12-30 | 2024-12-30 | YES | Build passes, 165 pages |

---

## Summary

All migration preparation tasks completed successfully:

| Metric | Before | After |
|--------|--------|-------|
| X-Robots-Tag | noindex, nofollow | index, follow |
| Redirect Entries | 38 | 148 |
| Canonical URLs | /[slug] | /blog/[slug] |
| Build Status | N/A | 165 pages, 0 errors |

**Ready for DNS cutover to production.**
