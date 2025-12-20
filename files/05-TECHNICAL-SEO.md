# 05 — TECHNICAL SEO SPECIFICATION

## Metadata Rules

### Title Tags

**Format:** `[Primary Keyword] | [Modifier] - mybcat`

**Constraints:**
- Length: 50-60 characters (absolute max 70)
- Primary keyword first
- Brand name last
- Unique per page
- No keyword stuffing

**Examples by Page Type:**

| Page Type | Format | Example |
|-----------|--------|---------|
| Homepage | `[Value Prop] \| mybcat` | `Patient Acquisition Platform for Healthcare \| mybcat` |
| Solution | `[Solution]: [Benefit] \| mybcat` | `Patient Intake: Never Miss Another Call \| mybcat` |
| Industry | `[Industry] Answering Service \| mybcat` | `Optometry Answering Service & Patient Intake \| mybcat` |
| Comparison | `mybcat vs [Competitor]: [Hook] \| mybcat` | `mybcat vs Hello Rache: Complete Comparison \| mybcat` |
| Blog | `[Post Title] \| mybcat Blog` | `10 Strategies to Reduce No-Shows \| mybcat Blog` |
| Case Study | `[Client] Case Study \| mybcat` | `Vision Plus: 42% More Appointments \| mybcat` |
| Pricing | `Pricing & Plans \| mybcat` | `Pricing & Plans \| mybcat` |

### Meta Descriptions

**Constraints:**
- Length: 150-160 characters
- Include primary keyword naturally
- Include benefit or outcome
- End with CTA or value hook
- Unique per page
- No duplicate descriptions

**Formula:** `[Problem/Benefit] + [What we do] + [CTA/Hook]`

**Examples:**

```html
<!-- Homepage -->
<meta name="description" content="Stop losing patients to voicemail. mybcat's patient acquisition platform ensures 100% of calls answered and appointments booked. See how it works.">

<!-- Solution Page -->
<meta name="description" content="Never miss another patient call. mybcat's intake service answers every call, books appointments directly in your EHR, and recovers lost revenue. Book a demo.">

<!-- Industry Page -->
<meta name="description" content="Optometry answering service built for eye care practices. We integrate with Eyefinity, handle comprehensive exam scheduling, and drive optical sales. Get started.">

<!-- Comparison Page -->
<meta name="description" content="mybcat vs Hello Rache: See how outcome-based pricing and AI automation compare to hourly VAs. Detailed comparison to help you choose the right solution.">

<!-- Blog Post -->
<meta name="description" content="Reduce no-shows at your medical practice with these 10 proven strategies. Learn how confirmation calls, reminders, and rebooking can fill your schedule.">
```

### Open Graph Tags

Include on all pages:

```html
<meta property="og:title" content="{Title - same as title tag or slightly modified}">
<meta property="og:description" content="{Same as meta description}">
<meta property="og:image" content="https://mybcat.com/images/og/{page-specific}.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="{Canonical URL}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="mybcat">
<meta property="og:locale" content="en_US">
```

**OG Image Requirements:**
- Dimensions: 1200x630px
- Format: JPG or PNG
- File size: <1MB
- Include brand elements
- Readable at thumbnail size

### Twitter Card Tags

```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@mybcat">
<meta name="twitter:title" content="{Title}">
<meta name="twitter:description" content="{Description}">
<meta name="twitter:image" content="{OG Image URL}">
```

---

## Canonical Strategy

### Self-Referencing Canonicals

Every page includes a canonical pointing to itself:

```html
<link rel="canonical" href="https://mybcat.com/industries/optometry/">
```

### Rules

1. **Always HTTPS:** `https://mybcat.com/...`
2. **Trailing Slash Consistent:** Choose one pattern and enforce
3. **No Parameters:** Strip UTM, tracking, and filter params
4. **No Fragments:** Remove `#section` anchors
5. **Lowercase:** Force lowercase URLs
6. **Single Version:** One canonical per page content

### Pagination Canonicals

For paginated content (blog index, etc.):

```html
<!-- Page 1 (no parameter needed) -->
<link rel="canonical" href="https://mybcat.com/blog/">

<!-- Page 2 -->
<link rel="canonical" href="https://mybcat.com/blog/page/2/">

<!-- Also include: -->
<link rel="prev" href="https://mybcat.com/blog/">
<link rel="next" href="https://mybcat.com/blog/page/3/">
```

### Cross-Domain Canonicals

If content exists elsewhere (syndication, etc.):

```html
<!-- On the duplicate/syndicated version -->
<link rel="canonical" href="https://mybcat.com/blog/original-article/">
```

---

## Sitemap.xml Strategy

### Sitemap Index

Location: `https://mybcat.com/sitemap-index.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://mybcat.com/sitemap-pages.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://mybcat.com/sitemap-blog.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://mybcat.com/sitemap-resources.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
</sitemapindex>
```

### Individual Sitemaps

**sitemap-pages.xml:** Core pages, solutions, industries, comparisons

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://mybcat.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://mybcat.com/solutions/patient-intake/</loc>
    <lastmod>2025-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Continue for all pages -->
</urlset>
```

**sitemap-blog.xml:** All blog posts

**sitemap-resources.xml:** Case studies, glossary, FAQ

### Priority Guidelines

| Page Type | Priority | Change Frequency |
|-----------|----------|------------------|
| Homepage | 1.0 | weekly |
| Solutions | 0.8 | monthly |
| Industries | 0.8 | monthly |
| Pricing | 0.9 | monthly |
| Comparisons | 0.7 | monthly |
| Blog Index | 0.6 | weekly |
| Blog Posts | 0.6 | yearly |
| Case Studies | 0.6 | yearly |
| Glossary | 0.4 | monthly |
| FAQ | 0.7 | monthly |
| Legal | 0.3 | yearly |

### Sitemap Generation (Astro)

```typescript
// astro.config.mjs
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mybcat.com',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/') && !page.includes('/preview/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      serialize(item) {
        // Custom priority based on URL pattern
        if (item.url === 'https://mybcat.com/') {
          item.priority = 1.0;
        } else if (item.url.includes('/solutions/') || item.url.includes('/industries/')) {
          item.priority = 0.8;
        } else if (item.url.includes('/blog/')) {
          item.priority = 0.6;
        }
        return item;
      }
    })
  ]
});
```

---

## Robots.txt

Location: `https://mybcat.com/robots.txt`

```txt
# mybcat.com robots.txt

User-agent: *
Allow: /

# Block admin and internal paths
Disallow: /admin/
Disallow: /api/
Disallow: /_astro/
Disallow: /preview/
Disallow: /internal/

# Block search results page
Disallow: /search
Disallow: /search/

# Block temporary/draft content
Disallow: /drafts/
Disallow: /staging/

# Block utility pages from crawling
Disallow: /thank-you
Disallow: /confirmation

# AI Crawler Permissions (explicit allow)
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Google-Extended
Allow: /

# Sitemaps
Sitemap: https://mybcat.com/sitemap-index.xml
```

### Notes:
- Be explicit about allowing AI crawlers for AI Overview inclusion
- Block admin paths to prevent indexing
- Include sitemap reference
- Don't block CSS/JS (needed for rendering)

---

## Redirect Policy

### Redirect Types

| Type | Use Case | HTTP Code |
|------|----------|-----------|
| 301 | Permanent URL change | 301 Moved Permanently |
| 308 | Permanent, preserve method | 308 Permanent Redirect |
| 302 | Temporary redirect | 302 Found |
| 307 | Temporary, preserve method | 307 Temporary Redirect |

**Default:** Use 301 for most redirects

### Redirect Rules

1. **No Chains:** A→B→C is bad. A→C is good.
2. **No Loops:** A→B→A will break crawling
3. **Preserve Query Params:** Optional, depends on use case
4. **HTTPS Redirect:** HTTP → HTTPS (server-level)
5. **www Normalization:** Pick one (www vs non-www) and enforce
6. **Trailing Slash:** Redirect non-trailing to trailing (or vice versa)

### Legacy URL Redirects

Map all old mybcat.com URLs to new structure:

```json
// vercel.json redirects array
{
  "redirects": [
    {
      "source": "/virtual-assistants-for-optometrists",
      "destination": "/industries/optometry/",
      "permanent": true
    },
    {
      "source": "/virtual-assistants-for-dental-practices",
      "destination": "/industries/dental/",
      "permanent": true
    },
    {
      "source": "/virtual-assistants-for-veterinary",
      "destination": "/industries/veterinary/",
      "permanent": true
    },
    {
      "source": "/customer-service-outsourcing-provider-in-marietta-georgia",
      "destination": "/about/",
      "permanent": true
    },
    {
      "source": "/solutions-remote-hospitality-center",
      "destination": "/solutions/patient-intake/",
      "permanent": true
    },
    {
      "source": "/service-package-deluxe",
      "destination": "/pricing/",
      "permanent": true
    },
    {
      "source": "/service-package-ultimate",
      "destination": "/pricing/",
      "permanent": true
    },
    {
      "source": "/service-package-enterprise",
      "destination": "/pricing/",
      "permanent": true
    },
    {
      "source": "/service-package-basic",
      "destination": "/pricing/",
      "permanent": true
    },
    {
      "source": "/contact-us",
      "destination": "/contact/",
      "permanent": true
    },
    {
      "source": "/careers-at-my-business-care-team",
      "destination": "/careers/",
      "permanent": true
    },
    {
      "source": "/our-team",
      "destination": "/about/",
      "permanent": true
    }
  ]
}
```

### Redirect Testing

Before launch, test all redirects:

```bash
# Test redirect status and destination
curl -I https://mybcat.com/old-url

# Expected output:
# HTTP/2 301
# location: https://mybcat.com/new-url/
```

---

## 404 & 410 Handling

### 404 Page Requirements

1. **Return 404 Status:** Must be HTTP 404, not 200
2. **User-Friendly Design:** Helpful, on-brand
3. **Navigation Options:**
   - Link to homepage
   - Link to main sections
   - Search (if available)
4. **Contact Option:** Way to report issues
5. **No Index:** Don't noindex, just ensure 404 status

**Example 404 Page Content:**

```html
<main class="error-page">
  <h1>Page Not Found</h1>
  <p>We couldn't find the page you're looking for. It may have been moved or no longer exists.</p>
  
  <h2>Try These Instead</h2>
  <ul>
    <li><a href="/">Go to Homepage</a></li>
    <li><a href="/solutions/">View Our Solutions</a></li>
    <li><a href="/industries/">Browse by Industry</a></li>
    <li><a href="/contact/">Contact Us</a></li>
  </ul>
  
  <p>If you believe this is an error, please <a href="/contact/">let us know</a>.</p>
</main>
```

### 410 Gone

Use 410 for intentionally removed content that won't return:

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/old-page-permanently-removed/",
      "destination": "/api/410",
      "statusCode": 410
    }
  ]
}
```

---

## URL Normalization

### Rules

| Rule | Bad | Good |
|------|-----|------|
| Lowercase | `/Industries/Optometry/` | `/industries/optometry/` |
| Trailing slash | `/industries/optometry` | `/industries/optometry/` |
| No extensions | `/about.html` | `/about/` |
| Hyphens | `/front_office_operations/` | `/front-office-operations/` |
| No double slashes | `/solutions//intake/` | `/solutions/intake/` |
| No special chars | `/solutions/intake%20service/` | `/solutions/intake-service/` |
| No query params | `/solutions/?source=google` | `/solutions/` |

### Enforcement

**Vercel Configuration:**

```json
// vercel.json
{
  "trailingSlash": true,
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Link",
          "value": "<https://mybcat.com/$1>; rel=\"canonical\""
        }
      ]
    }
  ]
}
```

**Astro Configuration:**

```javascript
// astro.config.mjs
export default defineConfig({
  trailingSlash: 'always',
  build: {
    format: 'directory'
  }
});
```

---

## Internal Linking Rules

### Link Quality

1. **Descriptive Anchor Text:** Not "click here"
2. **Contextual:** Links within content, not just nav
3. **Relevant:** Links should be topically related
4. **No Broken Links:** Test all links regularly
5. **Reasonable Quantity:** Don't over-link

### Link Structure

```html
<!-- Good: Descriptive, contextual -->
<p>Learn more about our <a href="/solutions/patient-intake/">patient intake service</a> and how it can reduce missed calls.</p>

<!-- Bad: Generic anchor text -->
<p>Learn more about patient intake <a href="/solutions/patient-intake/">here</a>.</p>

<!-- Bad: Over-linked -->
<p>Our <a href="/solutions/patient-intake/">patient intake</a> <a href="/solutions/">service</a> helps <a href="/industries/optometry/">optometry</a> <a href="/industries/dental/">dental</a> practices.</p>
```

### Internal Link Checklist

- [ ] Every page linked from at least one other page
- [ ] Important pages within 3 clicks of homepage
- [ ] Related content linked contextually
- [ ] No orphan pages
- [ ] No broken internal links

---

## Content Governance

### Cannibalization Prevention

**Definition:** When multiple pages compete for the same keyword

**Prevention:**
1. **Keyword Mapping:** Assign each primary keyword to ONE page
2. **Content Audit:** Quarterly check for competing pages
3. **Consolidation:** Merge thin pages targeting same topic
4. **Differentiation:** Ensure unique angle per page

**Tracking Spreadsheet:**

| Primary Keyword | Assigned Page | Secondary Keywords | Status |
|-----------------|---------------|-------------------|--------|
| optometry answering service | /industries/optometry/ | eye care phone service, optometry receptionist | Active |
| dental answering service | /industries/dental/ | dental receptionist, dental practice phone | Active |
| reduce no-shows | /blog/reduce-no-shows/ | no-show prevention, appointment reminders | Active |

### Content Refresh Strategy

**Quarterly Review:**
- Identify pages with declining traffic
- Update statistics and data
- Refresh outdated sections
- Add new internal links
- Update `dateModified` in schema

**Triggers for Refresh:**
- Content older than 12 months
- Traffic decline >20% YoY
- Industry changes or new data
- Competitor content updates

### Thin Content Policy

**Minimum Word Counts:**
- Solution/Industry pages: 1,200 words
- Blog posts: 1,500 words
- Case studies: 800 words
- Glossary terms: 300 words

**Quality Signals:**
- Original research or data
- Expert quotes or testimonials
- Visual content (images, charts)
- Comprehensive topic coverage
- Proper internal linking

**Actions for Thin Content:**
1. Expand with more depth
2. Merge with related page
3. 301 redirect to better page
4. 410 if no value

---

## Hreflang (Not Needed)

mybcat.com targets US-only English audience. No hreflang required.

If expanding internationally in future:

```html
<link rel="alternate" hreflang="en-us" href="https://mybcat.com/page/">
<link rel="alternate" hreflang="en-gb" href="https://mybcat.co.uk/page/">
<link rel="alternate" hreflang="x-default" href="https://mybcat.com/page/">
```

---

## Technical SEO Checklist

### Pre-Launch

- [ ] All pages have unique title tags
- [ ] All pages have unique meta descriptions
- [ ] All pages have canonical tags
- [ ] All pages have OG and Twitter meta
- [ ] robots.txt allows appropriate crawling
- [ ] sitemap.xml generated and accessible
- [ ] All legacy URLs have 301 redirects
- [ ] No broken internal links
- [ ] No orphan pages
- [ ] Schema markup validates on all pages
- [ ] Page speed >90 on mobile
- [ ] Mobile responsive on all pages
- [ ] HTTPS enforced site-wide

### Post-Launch (Weekly)

- [ ] Monitor GSC for crawl errors
- [ ] Check for new 404s
- [ ] Verify sitemap submission
- [ ] Review indexation status

### Ongoing (Monthly)

- [ ] Audit for broken links
- [ ] Check for duplicate content
- [ ] Review keyword cannibalization
- [ ] Update outdated content
- [ ] Monitor Core Web Vitals

### Quarterly

- [ ] Full content audit
- [ ] Competitor content analysis
- [ ] Schema markup review
- [ ] Redirect chain cleanup
- [ ] Performance benchmark
