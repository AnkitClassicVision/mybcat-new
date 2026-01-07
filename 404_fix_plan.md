# 404 Errors Fix Plan for MyBCAT.com (Revised)

**Version**: 2.0 (Agent-Team Reviewed)
**Date**: January 5, 2026
**Status**: Ready for Review

---

## Executive Summary

This plan addresses 113 URLs reporting 404 errors in Google Search Console. After multi-AI review (Codex, Gemini, Claude), several critical issues were identified in the original plan and have been corrected.

### Key Changes from Original Plan:
- FAQ redirect destination changed from `/contact/` to `/faq/`
- Feed redirect destination changed to the actual blog post URL
- robots.txt completely restructured to fix Googlebot grouping bug
- Subdomain handling separated into DNS/external actions
- www→non-www redirect added (was missing)
- All redirects now include both trailing slash variants

---

## Error Categories

| Category | Count | Priority | Action |
|----------|-------|----------|--------|
| Main site legacy URLs (mybcat.com) | 5 | **Critical** | Vercel redirects |
| WWW subdomain URLs (www.mybcat.com) | 2 | **Critical** | Domain-level redirect |
| Meeting subdomain (meeting.mybcat.com) | 1 | **High** | DNS removal |
| HubSpot subdomain (hubspot.mybcat.com) | 96 | **Low** | Ignore (external CDN) |
| WordPress probe URLs | ~8 | **Low** | Let 404 naturally |

---

## Phase 1: Vercel.json Redirects (Critical)

Add the following redirects to `vercel.json`. Each URL has both trailing-slash and non-trailing-slash variants to catch all inbound links.

### 1.1 Legacy FAQ Page

**GSC URL**: `https://mybcat.com/customer-service-outsourcing-provider-contact-us/faq`

```json
{
  "source": "/customer-service-outsourcing-provider-contact-us/faq",
  "destination": "/faq/",
  "permanent": true
},
{
  "source": "/customer-service-outsourcing-provider-contact-us/faq/",
  "destination": "/faq/",
  "permanent": true
}
```

**Rationale**: Redirect to `/faq/` (not `/contact/`) because:
- The `/faq/` page exists at `src/pages/faq/index.astro`
- Users searching for "faq" expect FAQ content, not a contact form
- Avoids "soft 404" signals to Google

### 1.2 Legacy Blog Feed

**GSC URL**: `https://mybcat.com/optometry-calls-expert-24-7-virtual-reception/feed`

```json
{
  "source": "/optometry-calls-expert-24-7-virtual-reception/feed",
  "destination": "/blog/optometry-calls-expert-24-7-virtual-reception/",
  "permanent": true
},
{
  "source": "/optometry-calls-expert-24-7-virtual-reception/feed/",
  "destination": "/blog/optometry-calls-expert-24-7-virtual-reception/",
  "permanent": true
}
```

**Rationale**: The blog post exists at `src/content/blog/optometry-calls-expert-24-7-virtual-reception.md`. Redirecting to the actual content preserves SEO value better than redirecting to a generic RSS feed.

### 1.3 Homepage Variants

**GSC URLs**:
- `https://www.mybcat.com/home`
- `https://www.mybcat.com/Follow`

```json
{
  "source": "/home",
  "destination": "/",
  "permanent": true
},
{
  "source": "/home/",
  "destination": "/",
  "permanent": true
},
{
  "source": "/Follow",
  "destination": "/",
  "permanent": true
},
{
  "source": "/Follow/",
  "destination": "/",
  "permanent": true
},
{
  "source": "/follow",
  "destination": "/",
  "permanent": true
},
{
  "source": "/follow/",
  "destination": "/",
  "permanent": true
}
```

**Rationale**: Added lowercase `/follow` variants because Vercel redirects are case-sensitive.

---

## Phase 2: Domain-Level Configuration (Critical)

### 2.1 WWW to Non-WWW Redirect

**Current Status**: NOT CONFIGURED (Critical Gap)

**Action Required in Vercel Dashboard**:
1. Go to Project Settings → Domains
2. Ensure `mybcat.com` is the primary domain
3. Add `www.mybcat.com` as a redirect (not alias)
4. Vercel will automatically 308 redirect www → non-www

**Alternative via vercel.json** (if domain-level doesn't work):
```json
{
  "source": "/:path*",
  "has": [
    {
      "type": "host",
      "value": "www.mybcat.com"
    }
  ],
  "destination": "https://mybcat.com/:path*",
  "permanent": true
}
```

### 2.2 Meeting Subdomain (meeting.mybcat.com)

**Current Status**: Returns 404, crawled Jan 2, 2026

**Recommended Action**: Redirect to Contact Page

**Option A: Vercel Dashboard (Simplest)**
1. Go to Vercel Dashboard → Project Settings → Domains
2. Add `meeting.mybcat.com` as a domain
3. Configure it as a **redirect** to `https://mybcat.com/contact/`

**Option B: Cloudflare Page Rule (if using Cloudflare DNS)**
1. Go to Cloudflare → Rules → Page Rules
2. Create rule: `meeting.mybcat.com/*` → Forwarding URL (301) → `https://mybcat.com/contact/`

**Option C: Separate Vercel Project**
1. Create new Vercel project named `meeting-redirect`
2. Add `meeting.mybcat.com` domain
3. Add this to `vercel.json`:
```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "destination": "https://mybcat.com/contact/",
      "permanent": true
    }
  ]
}
```

**Result**: All requests to `meeting.mybcat.com` (and any path) will 301 redirect to `https://mybcat.com/contact/`

---

## Phase 3: Robots.txt Restructure (High Priority)

### Current Problem

The existing robots.txt has a critical bug:

```
User-agent: *
Disallow: /draft/
Disallow: /api/
...

User-agent: Googlebot
Allow: /
```

**Bug**: When Googlebot crawls, it uses the `User-agent: Googlebot` group (most specific match). That group only has `Allow: /`, so **none of the disallows apply to Google**.

### New robots.txt (Replace Entire File)

```
# robots.txt for mybcat.com
# Consolidated rules for all crawlers

User-agent: *
Allow: /

# Block non-public paths
Disallow: /draft/
Disallow: /api/
Disallow: /admin/
Disallow: /preview/
Disallow: /search

# Note: /_astro/ is ALLOWED - blocking it breaks CSS/JS rendering
# which hurts mobile-first indexing scores

# Sitemap location
Sitemap: https://mybcat.com/sitemap-index.xml
```

### What Changed:
1. **Removed all bot-specific groups** - Single `User-agent: *` ensures rules apply to everyone
2. **Removed `Disallow: /_astro/`** - Blocking build assets hurts rendering/indexing
3. **Did NOT add `/wp-*` or `/*.php` blocks** - See rationale below

### Why NOT Block WordPress Patterns

The original plan proposed:
```
Disallow: /wp-*
Disallow: /*.php
Disallow: /*.js.gz
```

**Reasons to skip this**:
1. Blocking via robots.txt doesn't remove URLs from index - it just changes status from "404" to "blocked"
2. URLs stay in GSC as "blocked by robots.txt" indefinitely
3. Letting them 404 is cleaner - Google eventually drops them from index
4. No crawl budget concern - these are probe requests, not real traffic

---

## Phase 4: HubSpot Subdomain (Low Priority)

### The 96 URLs

All URLs like:
- `https://hubspot.mybcat.com/ui-addon-iframeable/static-1.8020`
- `https://hubspot.mybcat.com/react/static-7.151`
- etc.

### Why They Exist

These are HubSpot CDN static resources that Google discovered when crawling pages with HubSpot forms/widgets. The version numbers change frequently, causing old URLs to 404.

### Action: IGNORE

**Rationale**:
1. These are internal HubSpot resources, not your content
2. They have zero SEO value
3. You **cannot** control `hubspot.mybcat.com` via your site's robots.txt
4. To add robots.txt to the subdomain, you'd need to configure it in HubSpot Portal → Settings → Website → SEO & Crawlers

### Verification Step

Confirm HubSpot meeting links still work (used throughout the site):
```
https://hubspot.mybcat.com/meetings/ankit98/mybcat-discovery-call
```

If this URL works, HubSpot integration is fine and 404s are just old static resource versions.

---

## Phase 5: Google Search Console Actions

### After Deployment

1. **Wait 24-48 hours** for changes to propagate
2. **Do NOT immediately "Mark as Fixed"** - Let Google re-crawl first
3. Use **URL Inspection Tool** to verify:
   - `/customer-service-outsourcing-provider-contact-us/faq` → 301 to `/faq/`
   - `/home` → 301 to `/`
   - `www.mybcat.com/anything` → 301 to `mybcat.com/anything`

4. **Request Validation** for the "Not found (404)" issue category
5. **Monitor for 2-4 weeks** - Google will re-crawl and update status

### GSC Property Recommendation

Ensure you have a **Domain Property** (`sc-domain:mybcat.com`) rather than just URL prefix properties. Domain properties show all subdomains (www, meeting, hubspot) in one view.

---

## Implementation Checklist

### Critical (Do First)
- [ ] Add 10 redirects to `vercel.json` (Phase 1)
- [ ] Configure www→non-www in Vercel Dashboard (Phase 2.1)
- [ ] Configure `meeting.mybcat.com` redirect to `/contact/` (Phase 2.2)

### High Priority
- [ ] Replace `public/robots.txt` with new version (Phase 3)
- [ ] Deploy changes to production
- [ ] Verify redirects work with `curl -I https://mybcat.com/home`

### Post-Deployment
- [ ] Test HubSpot meeting link still works
- [ ] Wait 48 hours, then validate in GSC
- [ ] Monitor 404 count reduction over 2-4 weeks

### Low Priority (Optional)
- [ ] Check HubSpot Portal for subdomain robots.txt option
- [ ] Consider adding Domain Property in GSC if not present

---

## Expected Outcomes

| URL Category | Before | After |
|--------------|--------|-------|
| Legacy mybcat.com URLs (5) | 404 | 301 → valid pages |
| www.mybcat.com URLs (2) | 404 | 301 → mybcat.com |
| meeting.mybcat.com (1) | 404 | 301 → /contact/ |
| hubspot.mybcat.com (96) | 404 | Still 404 (ignored) |
| wp-*.php probes (~8) | 404 | Still 404 (expected) |

**Net Result**:
- 8 URLs fixed with redirects
- 1 subdomain redirected to /contact/
- 96+ URLs safely ignored
- GSC "Not found" errors should drop significantly within 4 weeks

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Redirect loop (www↔non-www) | Low | High | Test with curl before deploying |
| Blocking CSS/JS hurts rendering | Low | Medium | New robots.txt allows /_astro/ |
| HubSpot forms break | Very Low | High | Verify meeting link works post-deploy |
| Soft 404 from wrong redirect target | Low | Medium | All destinations verified to exist |

---

## Files to Modify

1. **`vercel.json`** - Add 10 redirect entries
2. **`public/robots.txt`** - Complete replacement
3. **Vercel Dashboard** - Domain redirect configuration
4. **Vercel/Cloudflare** - Configure meeting.mybcat.com redirect

---

## Appendix: Full Redirect JSON Block

Copy this entire block to add to the `redirects` array in `vercel.json`:

```json
{
  "source": "/customer-service-outsourcing-provider-contact-us/faq",
  "destination": "/faq/",
  "permanent": true
},
{
  "source": "/customer-service-outsourcing-provider-contact-us/faq/",
  "destination": "/faq/",
  "permanent": true
},
{
  "source": "/optometry-calls-expert-24-7-virtual-reception/feed",
  "destination": "/blog/optometry-calls-expert-24-7-virtual-reception/",
  "permanent": true
},
{
  "source": "/optometry-calls-expert-24-7-virtual-reception/feed/",
  "destination": "/blog/optometry-calls-expert-24-7-virtual-reception/",
  "permanent": true
},
{
  "source": "/home",
  "destination": "/",
  "permanent": true
},
{
  "source": "/home/",
  "destination": "/",
  "permanent": true
},
{
  "source": "/Follow",
  "destination": "/",
  "permanent": true
},
{
  "source": "/Follow/",
  "destination": "/",
  "permanent": true
},
{
  "source": "/follow",
  "destination": "/",
  "permanent": true
},
{
  "source": "/follow/",
  "destination": "/",
  "permanent": true
}
```

---

## Appendix: New robots.txt

Replace entire contents of `public/robots.txt` with:

```
# robots.txt for mybcat.com
# Consolidated rules for all crawlers

User-agent: *
Allow: /

# Block non-public paths
Disallow: /draft/
Disallow: /api/
Disallow: /admin/
Disallow: /preview/
Disallow: /search

# Sitemap location
Sitemap: https://mybcat.com/sitemap-index.xml
```

---

**Plan Status**: Ready for approval. Proceed with implementation?
