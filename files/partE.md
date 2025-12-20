Part E: Technical SEO Specification
Metadata Rules
Title Tags:

Format: [Primary Keyword] | [Secondary Keyword] - mybcat
Homepage: Patient Acquisition Platform for Healthcare Practices | mybcat
Solution: [Solution Name]: [Benefit] | mybcat
Industry: [Industry] Answering Service & Patient Intake | mybcat
Blog: [Post Title] | mybcat Blog
Length: 50-60 characters

Meta Descriptions:

Length: 150-160 characters
Include primary keyword
Include benefit/outcome
End with CTA or value proposition
Unique per page

Example:
html<title>Optometry Answering Service & Patient Intake | mybcat</title>
<meta name="description" content="Never miss another patient call. mybcat's managed intake service helps optometry practices fill their schedules and recover lost revenue. Book a demo.">
Canonical Strategy

Self-referencing canonicals on all pages
Primary URL: Always https://mybcat.com/[path]/ (with trailing slash)
Parameters: Canonical points to clean URL (strip UTM, tracking params)
Pagination: rel="canonical" on paginated pages points to page 1 unless content is substantively different
Legacy pages: 301 redirect OR canonical to new equivalent

html<link rel="canonical" href="https://mybcat.com/industries/optometry/">
Sitemap.xml Approach
Multiple Sitemaps (sitemap index):
xml<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://mybcat.com/sitemap-pages.xml</loc>
    <lastmod>2025-12-19</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://mybcat.com/sitemap-blog.xml</loc>
    <lastmod>2025-12-19</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://mybcat.com/sitemap-resources.xml</loc>
    <lastmod>2025-12-19</lastmod>
  </sitemap>
</sitemapindex>
Priority Guidance:

Homepage: 1.0
Solution/Industry pages: 0.8
Blog posts: 0.6
Glossary terms: 0.4

Frequency:

Homepage: weekly
Solution/Industry: monthly
Blog: weekly
Glossary: monthly

Robots.txt
User-agent: *
Allow: /

# Block admin and internal paths
Disallow: /admin/
Disallow: /api/
Disallow: /_astro/
Disallow: /preview/

# Block search results
Disallow: /search

# Allow AI crawlers
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: https://mybcat.com/sitemap-index.xml
Redirect Policy
301 Redirects (Permanent):

All legacy pages → new equivalent
HTTP → HTTPS
Non-www → www (or vice versa, pick one)
Old URL structures → new URL structures

308 Redirects:

For POST requests that need to maintain method

Never use:

302 for permanent moves
Redirect chains (A→B→C)
Redirect loops

Legacy mybcat.com Redirects Needed:
/virtual-assistants-for-optometrists → /industries/optometry/
/customer-service-outsourcing-provider-in-marietta-georgia → /about/
/solutions-remote-hospitality-center → /solutions/patient-intake/
/service-package-deluxe → /pricing/
/service-package-ultimate → /pricing/
404/410 Handling
404 Page:

Custom design with helpful navigation
Search functionality
Links to popular pages
Clear "page not found" message
Proper 404 HTTP status code

410 (Gone):

Use for intentionally removed content
Content that was indexed but permanently deleted

URL Normalization
Rules:

Lowercase only: /Industries/Optometry/ → /industries/optometry/
Trailing slash consistent: Choose one pattern and enforce
No file extensions: /about.html → /about/
Hyphens for word separation: /front-office-operations/ not /front_office_operations/
No special characters or spaces
Short, descriptive slugs

Internal Linking Rules

Anchor text: Descriptive, keyword-rich, varied (not all exact match)
Contextual links: Within body content, not just navigation
Link depth: Important pages within 3 clicks of homepage
No orphan pages: Every page linked from at least one other page
Related content: Blog posts link to related posts and solutions
Hub and spoke: Solution pages as hubs, supporting content as spokes

Content Governance (Cannibalization Prevention)
Keyword Assignment Matrix:

Each primary keyword assigned to ONE page only
Track in spreadsheet: Page URL | Primary Keyword | Secondary Keywords | Status
Before creating new content, check if keyword is already targeted
If overlap exists, consolidate or differentiate content

Content Audit Cadence:

Quarterly keyword cannibalization check
Identify pages competing for same terms
Consolidate thin content
Update outdated content (flag anything >12 months old)