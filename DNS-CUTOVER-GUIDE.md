# MyBCAT DNS Cutover Guide

## Overview

**From:** Nestify (WordPress) → **To:** Vercel (Astro)
**Domain Registrar:** Namecheap
**Domain:** mybcat.com

---

## Pre-Cutover Checklist

Before making any DNS changes, verify these are complete:

- [x] All 543 redirects configured in vercel.json
- [x] X-Robots-Tag set to `index, follow`
- [x] Canonical URLs pointing to mybcat.com
- [x] Sitemap working at /sitemap-index.xml
- [x] robots.txt configured correctly
- [x] Article schema on all blog posts
- [x] Build passing (168 pages)

---

## Step 1: Add Domain to Vercel (Do This First)

### 1.1 Go to Vercel Dashboard

1. Open https://vercel.com/dashboard
2. Click on **mybcat-new** project
3. Go to **Settings** → **Domains**

### 1.2 Add Production Domain

1. Click **Add Domain**
2. Enter: `mybcat.com`
3. Click **Add**
4. Vercel will show you the DNS records needed

### 1.3 Add www Subdomain

1. Click **Add Domain** again
2. Enter: `www.mybcat.com`
3. Click **Add**
4. Choose **Redirect to mybcat.com** (recommended)

### 1.4 Note the Required DNS Records

Vercel will provide one of these options:

**Option A - A Record (Recommended):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Option B - CNAME (for www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Step 2: Update DNS at Namecheap

### 2.1 Login to Namecheap

1. Go to https://namecheap.com
2. Login to your account
3. Go to **Domain List** → Click **Manage** next to mybcat.com

### 2.2 Go to Advanced DNS

1. Click the **Advanced DNS** tab
2. You'll see current DNS records pointing to Nestify

### 2.3 Update/Add DNS Records

**Delete old records first**, then add new ones:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | Automatic |
| CNAME | www | cname.vercel-dns.com | Automatic |

**Important:** Remove any old A records pointing to Nestify IP addresses.

### 2.4 Save Changes

Click **Save All Changes**

---

## Step 3: Wait for DNS Propagation

DNS changes can take 5 minutes to 48 hours to propagate globally.

### 3.1 Check Propagation Status

Use these tools to monitor:

1. **DNS Checker:** https://dnschecker.org/#A/mybcat.com
2. **WhatsMyDNS:** https://whatsmydns.net/#A/mybcat.com

### 3.2 Verify Vercel Shows Domain Active

1. Go back to Vercel → Settings → Domains
2. Wait until the domain shows a **green checkmark**
3. SSL certificate will be provisioned automatically (may take a few minutes)

---

## Step 4: Verify New Site is Live

Once DNS propagates, verify everything works:

### 4.1 Test in Browser

```
https://mybcat.com
https://mybcat.com/blog/
https://mybcat.com/solutions/
https://mybcat.com/contact/
```

### 4.2 Test Redirects Work

```bash
# Test a root-level redirect
curl -sI "https://mybcat.com/5-signs-youre-ready-to-scale" | grep -E "HTTP|location"
# Should show: 308 redirect to /blog/5-signs-youre-ready-to-scale/

# Test old WordPress paths
curl -sI "https://mybcat.com/about-book" | grep -E "HTTP|location"
# Should show: 308 redirect to /resources/book/
```

### 4.3 Verify SSL Certificate

1. Click the padlock in your browser
2. Verify certificate is issued by "Let's Encrypt" (Vercel's CA)
3. Ensure no mixed content warnings

---

## Step 5: Make Old Nestify Site Non-Indexable

**Critical:** Prevent the old site from competing with the new one in search results.

### 5.1 Option A: Add noindex to Nestify (If Keeping It Running)

If keeping the old site as a backup, add to WordPress:

1. Login to WordPress admin on Nestify
2. Go to **Settings** → **Reading**
3. Check **Discourage search engines from indexing this site**
4. Click **Save Changes**

Also add to `.htaccess`:
```apache
Header set X-Robots-Tag "noindex, nofollow"
```

### 5.2 Option B: Take Nestify Offline (Recommended)

1. Login to Nestify dashboard
2. Either:
   - **Pause** the site (keeps files, stops serving)
   - **Delete** the site (if you have backups)
3. This ensures no duplicate content issues

### 5.3 Option C: Point Nestify to a Parked Page

Create a simple index.html:
```html
<!DOCTYPE html>
<html>
<head>
  <meta name="robots" content="noindex, nofollow">
  <meta http-equiv="refresh" content="0;url=https://mybcat.com">
  <title>Redirecting...</title>
</head>
<body>
  <p>This site has moved to <a href="https://mybcat.com">mybcat.com</a></p>
</body>
</html>
```

---

## Step 6: Submit to Google Search Console

### 6.1 Verify New Property (if not already done)

1. Go to https://search.google.com/search-console
2. Click **Add Property**
3. Choose **URL prefix**: `https://mybcat.com`
4. Verify using DNS TXT record or HTML file

### 6.2 Submit Sitemap

1. In Search Console, go to **Sitemaps** (left sidebar)
2. Enter: `sitemap-index.xml`
3. Click **Submit**

### 6.3 Request Indexing for Key Pages

1. Go to **URL Inspection** (left sidebar)
2. Enter each priority URL and click **Request Indexing**:

Priority pages to submit:
```
https://mybcat.com/
https://mybcat.com/solutions/
https://mybcat.com/solutions/medical-answering-service/
https://mybcat.com/solutions/patient-recall/
https://mybcat.com/industries/
https://mybcat.com/blog/
https://mybcat.com/contact/
https://mybcat.com/about/
```

### 6.4 Remove Old URLs (If Needed)

If old WordPress URLs are still indexed:
1. Go to **Removals** in Search Console
2. Enter old URLs that no longer exist
3. Request removal

---

## Step 7: Submit to Bing Webmaster Tools

### 7.1 Add Site to Bing

1. Go to https://www.bing.com/webmasters
2. Login with Microsoft account
3. Click **Add Site** → Enter `https://mybcat.com`

### 7.2 Submit Sitemap

1. Go to **Sitemaps**
2. Submit: `https://mybcat.com/sitemap-index.xml`

### 7.3 Request Indexing

Use **URL Submission** to submit key pages.

---

## Step 8: Post-Cutover Monitoring

### 8.1 Monitor for 404 Errors

Check Vercel Analytics for any 404s:
1. Vercel Dashboard → Analytics → Functions
2. Look for 404 status codes
3. Add missing redirects if needed

### 8.2 Monitor Search Console

Check daily for the first week:
1. **Coverage** report for any errors
2. **Core Web Vitals** for performance
3. **Search Results** for traffic changes

### 8.3 Monitor Google Analytics

1. Compare traffic before/after cutover
2. Check for any significant drops
3. Verify all tracking is working

---

## Rollback Plan (If Needed)

If something goes wrong:

### Immediate Rollback (Within 48 hours)

1. Go to Namecheap → Advanced DNS
2. Change A record back to Nestify IP
3. Remove Vercel CNAME
4. Wait for propagation

### Keep Nestify Running

For the first 7 days, keep Nestify site available (just not indexable) as a safety net.

---

## Timeline Summary

| Step | Action | Time Required |
|------|--------|---------------|
| 1 | Add domain to Vercel | 5 minutes |
| 2 | Update Namecheap DNS | 5 minutes |
| 3 | Wait for propagation | 5 min - 48 hours |
| 4 | Verify new site | 15 minutes |
| 5 | Disable old Nestify site | 10 minutes |
| 6 | Submit to Google Search Console | 15 minutes |
| 7 | Submit to Bing | 10 minutes |
| 8 | Ongoing monitoring | Daily for 1 week |

---

## Quick Reference Commands

### Check DNS Propagation
```bash
dig mybcat.com A +short
# Should return: 76.76.21.21
```

### Verify Vercel is Serving
```bash
curl -sI https://mybcat.com | grep -i server
# Should return: server: Vercel
```

### Verify X-Robots-Tag
```bash
curl -sI https://mybcat.com | grep -i x-robots
# Should return: x-robots-tag: index, follow
```

### Verify Sitemap
```bash
curl -s https://mybcat.com/sitemap-index.xml | head -20
```

### Test Redirect
```bash
curl -sIL "https://mybcat.com/5-signs-youre-ready-to-scale" | grep -E "HTTP|location"
```

---

## Contacts & Resources

- **Vercel Support:** https://vercel.com/support
- **Namecheap Support:** https://www.namecheap.com/support/
- **Google Search Console:** https://search.google.com/search-console
- **Bing Webmaster Tools:** https://www.bing.com/webmasters

---

*Last Updated: December 2024*
