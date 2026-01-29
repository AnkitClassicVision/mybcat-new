# MyBCAT.com Indexing Fix Plan

**Created:** 2026-01-29
**Status:** In Progress
**Verified By:** Agent Team (Codex, Gemini, Claude Code)

---

## Executive Summary

This document outlines the step-by-step plan to fix indexing issues on mybcat.com. Each step includes:
- **Objective**: What we're fixing
- **Actions**: Specific tasks to complete
- **Test Criteria**: How to verify success
- **Outcome**: Expected result
- **Status**: Current progress

---

## Issue Overview

| Issue | Severity | Root Cause | Fix Required |
|-------|----------|------------|--------------|
| Orphan category page `/blog/category/industry/` | High | Empty category in sitemap | Remove from sitemap |
| www to non-www redirect chain | Medium | 2-hop redirect | Fix Vercel domain config |
| HubSpot meeting links consuming crawl budget | Medium | 90+ links to external noindex page | Add rel="nofollow" |
| Legacy broken links (marietta-georgia pattern) | High | Historical bad links | Verify fixes deployed |
| Pages showing "Discovered - not indexed" | Medium | Google cache lag | Request re-indexing |

---

## Step 1: Fix Orphan Category Page

### Objective
Remove `/blog/category/industry/` from sitemap since it has no posts and no internal links.

### Actions
1. Update `astro.config.mjs` sitemap filter to exclude `/blog/category/industry/`
2. Verify the filter logic is working correctly
3. Build and check `sitemap-0.xml` output

### Test Criteria
- [ ] `grep "category/industry" dist/sitemap-0.xml` returns 0 results
- [ ] Build completes without errors
- [ ] Other category pages still appear in sitemap

### Expected Outcome
The orphan page is removed from sitemap, improving site quality signals.

### Status
- [ ] Not Started
- [ ] In Progress
- [ ] Completed
- [ ] Verified by Agent Team

### Verification Notes
```
<!-- Agent team verification results will be added here -->
```

---

## Step 2: Fix www to non-www Redirect

### Objective
Ensure www.mybcat.com redirects directly to mybcat.com in a single 301 hop.

### Actions
1. Check current Vercel domain configuration
2. Verify redirect is configured as "Redirect" not "Alias"
3. Test the redirect chain

### Test Criteria
- [ ] `curl -I https://www.mybcat.com/` shows single 301 to `https://mybcat.com/`
- [ ] No intermediate 308 redirects
- [ ] All www URLs redirect correctly

### Expected Outcome
Single-hop redirect preserves link equity and improves crawl efficiency.

### Status
- [ ] Not Started
- [ ] In Progress
- [ ] Completed
- [ ] Verified by Agent Team

### Verification Notes
```
<!-- Agent team verification results will be added here -->
```

---

## Step 3: Add nofollow to HubSpot Meeting Links

### Objective
Conserve crawl budget by adding `rel="nofollow"` to external HubSpot meeting links.

### Actions
1. Find all components/pages linking to `hubspot.mybcat.com`
2. Add `rel="nofollow noopener"` attribute to these links
3. Verify changes in relevant files

### Test Criteria
- [ ] All hubspot.mybcat.com links have `rel="nofollow"`
- [ ] Links still function correctly
- [ ] No broken internal CTAs

### Expected Outcome
Googlebot won't follow external meeting links, conserving crawl budget for important pages.

### Status
- [ ] Not Started
- [ ] In Progress
- [ ] Completed
- [ ] Verified by Agent Team

### Verification Notes
```
<!-- Agent team verification results will be added here -->
```

---

## Step 4: Verify Legacy Broken Links Fixed

### Objective
Confirm that all "marietta-georgia" pattern broken links have been removed from blog content.

### Actions
1. Search entire codebase for broken URL patterns
2. Check specific blog posts flagged by Ahrefs
3. Verify current link destinations are valid

### Test Criteria
- [ ] `grep -r "marietta-georgia" src/content/blog/` returns 0 results
- [ ] `grep -r "business-care-team-full-service" src/content/blog/` returns 0 results
- [ ] `grep -r "customer-service-outsourcing-provider-contact-us" src/` returns 0 results

### Expected Outcome
No broken internal links exist in the codebase.

### Status
- [ ] Not Started
- [ ] In Progress
- [ ] Completed
- [ ] Verified by Agent Team

### Verification Notes
```
<!-- Agent team verification results will be added here -->
```

---

## Step 5: Create GSC Re-indexing Request List

### Objective
Generate a prioritized list of URLs to submit for re-indexing in Google Search Console.

### Actions
1. Identify all "Discovered - not indexed" pages
2. Prioritize by business importance
3. Create submission schedule (10/day limit)

### Test Criteria
- [ ] List includes all solution pages
- [ ] List includes all industry pages
- [ ] List includes all compare pages
- [ ] Priority order is logical

### Expected Outcome
Clear action list for manual GSC submissions over the next 2 weeks.

### Status
- [ ] Not Started
- [ ] In Progress
- [ ] Completed
- [ ] Verified by Agent Team

### Verification Notes
```
<!-- Agent team verification results will be added here -->
```

---

## Step 6: Build and Deploy Verification

### Objective
Ensure all fixes are properly built and deployed to production.

### Actions
1. Run `npm run build` locally
2. Verify build output
3. Check production site after deployment

### Test Criteria
- [ ] Build completes with 0 errors
- [ ] Sitemap contains correct URLs
- [ ] Production site reflects changes

### Expected Outcome
All fixes are live on mybcat.com.

### Status
- [ ] Not Started
- [ ] In Progress
- [ ] Completed
- [ ] Verified by Agent Team

### Verification Notes
```
<!-- Agent team verification results will be added here -->
```

---

## Step 7: Agent Team Final Verification

### Objective
Run comprehensive verification using Codex, Gemini, and Claude to confirm all fixes.

### Actions
1. Launch parallel verification with all 3 AI systems
2. Document findings from each
3. Reconcile any discrepancies

### Test Criteria
- [ ] All 3 AI systems confirm fixes are correct
- [ ] No new issues discovered
- [ ] Documentation is complete

### Expected Outcome
Multi-AI verified confirmation that indexing issues are resolved.

### Status
- [ ] Not Started
- [ ] In Progress
- [ ] Completed

### Verification Notes
```
<!-- Agent team verification results will be added here -->
```

---

## Progress Tracking

| Step | Task | Status | Verified |
|------|------|--------|----------|
| 1 | Fix orphan category page | COMPLETE | YES (All 3 AIs) |
| 2 | Fix www redirect | MANUAL STEP | Documented |
| 3 | Add nofollow to HubSpot links | COMPLETE | YES (All 3 AIs) |
| 4 | Verify broken links fixed | COMPLETE | YES (All 3 AIs) |
| 5 | Create re-indexing list | COMPLETE | YES |
| 6 | Build and deploy | READY | Build tested |
| 7 | Agent team verification | COMPLETE | YES (Codex/Gemini/Claude) |

---

## Appendix A: Files Modified

| File | Change | Date |
|------|--------|------|
| astro.config.mjs | Added rehype-external-links plugin for nofollow | 2026-01-29 |
| package.json | Added rehype-external-links dependency | 2026-01-29 |
| GSC-INDEXING-TODO.md | Updated with current indexing status | 2026-01-29 |
| INDEXING-FIX-PLAN.md | Created comprehensive fix plan | 2026-01-29 |

| File | Change | Date |
|------|--------|------|
| *To be updated as changes are made* | | |

---

## Appendix B: Test Commands

```bash
# Check for orphan page in sitemap
grep "category/industry" dist/sitemap-0.xml

# Check for broken link patterns
grep -r "marietta-georgia" src/content/blog/
grep -r "business-care-team-full-service" src/content/blog/

# Check HubSpot links have nofollow
grep -r "hubspot.mybcat.com" src/ | grep -v "nofollow"

# Test www redirect
curl -I https://www.mybcat.com/

# Build the site
npm run build
```

---

## Appendix C: Agent Team Verification Log

**Verification Date:** 2026-01-29
**All 3 AI Systems: PASS on all 5 checks**

### Codex Findings (OpenAI GPT-5.2)
```
1. ORPHAN PAGE FIX: PASS
   - astro.config.mjs excludes /blog/category/industry
   - getStaticPaths does not generate industry category
   - sitemap-0.xml contains 0 matches for "blog/category/industry"
   - vercel.json has redirect: /blog/category/industry → /blog/

2. NOFOLLOW FIX: PASS
   - rehype-external-links@3.0.0 installed
   - Configured in astro.config.mjs with rel=['nofollow','noopener']
   - Built HTML verified: all hubspot.mybcat.com links have nofollow

3. BROKEN LINKS: PASS
   - grep for "marietta-georgia" in src/content/blog/ returns 0 results
   - grep for "business-care-team-full-service" returns 0 results
   - Legacy URLs exist only as redirect sources in vercel.json (expected)

4. SITEMAP: PASS
   - sitemap-index.xml generated correctly
   - sitemap-0.xml contains valid URLs with lastmod dates
   - No /draft/ paths in sitemap
   - No /blog/category/industry in sitemap

5. ROBOTS.TXT: PASS
   - User-agent: * with Allow: /
   - Sitemap: https://mybcat.com/sitemap.xml
   - Appropriate Disallow rules for /draft/, /api/, /admin/, /preview/
```

### Gemini Findings (Google)
```
1. ORPHAN PAGE FIX: PASS
   - astro.config.mjs filter excludes /blog/category/industry
   - vercel.json has 301 redirect for legacy URLs

2. NOFOLLOW FIX: PASS
   - package.json: "rehype-external-links": "^3.0.0"
   - astro.config.mjs correctly configures rel: ['nofollow', 'noopener']
   - Test function excludes internal links but includes hubspot.mybcat.com

3. BROKEN LINKS: PASS
   - Search returned 0 matches in src/content/blog/
   - Matches found only in vercel.json (redirects) and docs (expected)

4. SITEMAP: PASS
   - @astrojs/sitemap properly configured
   - Custom priority logic: 1.0 homepage, 0.9 industries/solutions, 0.8 blog
   - Exclusion of drafts and non-published posts working

5. ROBOTS.TXT: PASS
   - Correct Allow: / directive
   - Sitemap reference present
   - Proper disallow for non-public paths
```

### Claude Code Findings
```
1. ORPHAN PAGE FIX: PASS
   - astro.config.mjs lines 68-80: filter excludes /blog/category/industry
   - [category].astro lines 57-68: getStaticPaths omits 'industry'
   - grep sitemap-0.xml returns 0 for "category/industry"
   - Total URLs in sitemap: 194

2. NOFOLLOW FIX: PASS
   - astro.config.mjs lines 118-135: rehypeExternalLinks configured
   - Built HTML example: <a href="https://hubspot.mybcat.com/..." rel="nofollow noopener" target="_blank">
   - All 10 HubSpot links in blog posts verified with nofollow

3. BROKEN LINKS: PASS
   - find src/content/blog -exec grep "marietta-georgia|business-care-team" returns empty
   - 132 markdown files scanned, 0 matches

4. SITEMAP: PASS
   - sitemap-index.xml: 181 bytes, proper format
   - sitemap-0.xml: 35,295 bytes, 194 URLs
   - All entries have lastmod, changefreq, priority

5. ROBOTS.TXT: PASS
   - public/robots.txt matches .vercel/output/static/robots.txt
   - Sitemap: https://mybcat.com/sitemap.xml
   - /_astro/ correctly allowed for CSS/JS
```

### Consensus
```
UNANIMOUS AGREEMENT: All 5 SEO/indexing fixes verified as correctly implemented

- Orphan page: NOT generated, NOT in sitemap, redirect in place
- Nofollow: Plugin installed and working on all external links
- Broken links: Completely removed from content, redirects handle legacy URLs
- Sitemap: Properly generated with correct exclusions and priorities
- Robots.txt: Correctly configured for crawling and sitemap discovery

No remaining issues found. All fixes are ready for deployment.
```
