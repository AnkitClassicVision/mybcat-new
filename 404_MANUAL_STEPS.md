# 404 Fix - Manual Steps Required

**Date**: January 5, 2026
**Status**: Code changes complete, manual steps pending

---

## Completed (Automated)

| Task | Status | Verification |
|------|--------|--------------|
| Add 10 redirects to vercel.json | Done | JSON validated, 587 total redirects |
| Replace robots.txt | Done | Googlebot bug fixed, /_astro/ allowed |
| Build project | Done | 169 pages, no errors |
| Test redirects locally | Done | All 10 return 308, destinations return 200 |

---

## Manual Steps Required

### Step 1: Configure www → non-www Redirect (Vercel Dashboard)

**Why**: Currently `www.mybcat.com` doesn't redirect to `mybcat.com`, causing duplicate content issues and the `/home` and `/Follow` 404s from GSC.

**Steps**:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the **mybcat** project
3. Go to **Settings** → **Domains**
4. Verify `mybcat.com` is listed as primary
5. Add `www.mybcat.com` if not present
6. Click on `www.mybcat.com` → Configure as **Redirect** (not alias)
7. Target: `mybcat.com`

**Verification**:
```bash
curl -I https://www.mybcat.com/
# Should return 308 with Location: https://mybcat.com/
```

---

### Step 2: Configure meeting.mybcat.com Redirect

**Why**: `https://meeting.mybcat.com/` is returning 404 in GSC. Redirect to contact page.

**Option A: Vercel (Recommended if DNS points to Vercel)**
1. Go to Vercel Dashboard → **Add New Project** (or use existing)
2. Add domain `meeting.mybcat.com`
3. Configure as redirect to `https://mybcat.com/contact/`

**Option B: Cloudflare Page Rule (if using Cloudflare DNS)**
1. Go to Cloudflare Dashboard → `mybcat.com` → Rules → Page Rules
2. Create new rule:
   - URL: `meeting.mybcat.com/*`
   - Setting: Forwarding URL (301 Permanent)
   - Destination: `https://mybcat.com/contact/`

**Verification**:
```bash
curl -I https://meeting.mybcat.com/
# Should return 301/308 with Location: https://mybcat.com/contact/
```

---

### Step 3: Deploy Changes

After manual steps are configured:

```bash
# Option 1: Push to GitHub (triggers auto-deploy)
git add vercel.json public/robots.txt
git commit -m "fix(seo): Add 404 redirects and fix robots.txt Googlebot bug"
git push

# Option 2: Manual deploy
vercel --prod
```

---

### Step 4: Post-Deployment Verification

After deployment, verify on production:

```bash
# Test redirects
curl -I https://mybcat.com/home
curl -I https://mybcat.com/Follow
curl -I https://mybcat.com/customer-service-outsourcing-provider-contact-us/faq
curl -I https://mybcat.com/optometry-calls-expert-24-7-virtual-reception/feed

# Test www redirect
curl -I https://www.mybcat.com/

# Test meeting subdomain (after Step 2)
curl -I https://meeting.mybcat.com/

# Verify robots.txt
curl https://mybcat.com/robots.txt
```

---

### Step 5: Google Search Console Actions (Wait 48 hours)

1. **Do NOT** immediately mark as fixed
2. Use **URL Inspection Tool** to test individual URLs
3. After 48 hours, go to **Coverage** → **Not found (404)** → **Validate Fix**
4. Monitor for 2-4 weeks

---

## Summary

| Item | Type | Status |
|------|------|--------|
| vercel.json redirects | Code | Ready to deploy |
| robots.txt fix | Code | Ready to deploy |
| www → non-www | Manual (Vercel) | **Action Required** |
| meeting.mybcat.com | Manual (Vercel/Cloudflare) | **Action Required** |
| Deploy to production | Manual | **After above steps** |
| GSC validation | Manual | **After 48 hours** |
