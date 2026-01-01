# Google Search Console URL Inspection Scripts

This directory contains scripts for checking and managing URL indexing status in Google Search Console.

## Available Scripts

### 1. `gsc-url-inspector.js` - Custom URL Inspector

Checks the indexing status of any URLs and generates a detailed markdown report.

**Usage:**

```bash
# Check default critical URLs (about, pricing, careers, faq, contact)
node scripts/gsc-url-inspector.js

# Check custom URLs
node scripts/gsc-url-inspector.js --urls="https://mybcat.com/custom-page/,https://mybcat.com/another/"

# Output as JSON for integration
node scripts/gsc-url-inspector.js --json
```

**Output:**
- Console summary of indexing status
- Markdown report saved to `gsc_critical_urls_report.md`
- List of URLs requiring manual indexing

### 2. `gsc-check-tier1-urls.js` - Priority URLs Checker

Checks Tier 1 (critical) and Tier 2 (important) business URLs identified in the SEO audit.

**Usage:**

```bash
node scripts/gsc-check-tier1-urls.js
```

**Checks:**
- Tier 1: /about/, /pricing/, /solutions/integrations/, /case-studies/classic-vision-care/, /enterprise/veterinary-groups/
- Tier 2: /careers/, /faq/, /industries/optometry/, /industries/dermatology/, /compare/

**Output:**
- Real-time status for each URL
- Summary statistics
- List of URLs requiring manual indexing

## Understanding the Results

### Indexing Statuses

| Status | Meaning | Action Required |
|--------|---------|----------------|
| **INDEXED** | ✅ Page is indexed and appears in Google Search | None - page is live |
| **DISCOVERED_NOT_INDEXED** | ⚠️ Google found the URL but hasn't indexed it | Request manual indexing |
| **NOT_FOUND** | ❌ Google doesn't know about this URL | Request manual indexing + check sitemap |
| **ERROR** | ❌ Error checking the URL | Investigate error message |

### Coverage States from GSC

- **"Submitted and indexed"** - Success! Page is in Google's index
- **"Discovered - currently not indexed"** - Google found it but hasn't crawled/indexed yet
- **"URL is unknown to Google"** - Google has no record of this URL

## Manual Indexing Process

Since the Google Search Console API doesn't support automated indexing requests, you must manually request indexing through the GSC web interface.

### Step-by-Step Instructions

1. **Open Google Search Console**
   - Go to https://search.google.com/search-console
   - Select the "mybcat.com" property

2. **Use URL Inspection Tool**
   - At the top of the page, find the search bar
   - Paste the URL you want to index
   - Press Enter

3. **Request Indexing**
   - Review the inspection results
   - Click "Request Indexing" button
   - Wait for confirmation (may take a few seconds)

4. **Monitor Progress**
   - Re-run the inspection script after 1-2 weeks
   - Check if status changed to "Submitted and indexed"

### Tips for Faster Indexing

- **Internal Linking**: Add links to the page from high-authority pages (homepage, main nav)
- **Sitemap**: Ensure the URL is in your sitemap.xml
- **Fresh Content**: Update the page with new, valuable content
- **Social Signals**: Share the URL on social media
- **Backlinks**: Get quality external links to the page

## Automation Workflow

### Weekly Monitoring

Set up a weekly cron job or GitHub Action:

```bash
# Check priority URLs weekly
0 9 * * 1 cd /path/to/mybcat-new && node scripts/gsc-check-tier1-urls.js >> logs/gsc-weekly.log
```

### After Content Updates

Run after publishing new content:

```bash
# Check specific new pages
node scripts/gsc-url-inspector.js --urls="https://mybcat.com/new-blog-post/"
```

### Full Site Audit

For comprehensive indexing checks across all pages:

```bash
# Use the main GSC skill to inspect all sitemap URLs
python3 ~/.claude/skills/google-search-console/gsc.py inspect "https://mybcat.com/" "https://mybcat.com/page-url/"
```

## Interpreting Reports

### Green Flags ✅

- **Coverage State**: "Submitted and indexed"
- **Page Fetch State**: "SUCCESSFUL"
- **Robots.txt State**: "ALLOWED"
- **Recent Last Crawl Time**: Within last week

### Red Flags 🚩

- **Coverage State**: Contains "not indexed" or "Discovered"
- **Last Crawl Time**: "Never" or very old date
- **Page Fetch State**: Not "SUCCESSFUL"
- **Robots.txt State**: "BLOCKED" or "DISALLOWED"

## Troubleshooting

### URL Not Indexing After Request

**Possible Causes:**
1. **Low quality content** - Add more unique, valuable content (500+ words)
2. **Duplicate content** - Use canonical tags or consolidate similar pages
3. **Poor internal linking** - Add links from important pages
4. **Robots.txt blocking** - Check your robots.txt file
5. **Crawl budget** - For large sites, Google may be selective

**Solutions:**
- Improve content quality and uniqueness
- Add structured data (Schema.org markup)
- Build internal links from high-authority pages
- Get external backlinks
- Be patient - sometimes takes 2-4 weeks

### Script Errors

**"Cannot find module" error:**
```bash
# Install Node.js dependencies
npm install
```

**"Python script not found" error:**
```bash
# Verify GSC skill is installed
ls -la ~/.claude/skills/google-search-console/
```

**"Authentication failed" error:**
```bash
# Re-authenticate with Google Search Console
# Follow the GSC skill setup instructions
```

## Related Resources

- [Google Search Console Documentation](https://developers.google.com/search)
- [URL Inspection API Reference](https://developers.google.com/webmaster-tools/search-console-api-original/v3/urlcrawlerrorssamples)
- [How to Get Your Page Indexed by Google](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)

## Next Steps

After running these scripts and requesting indexing:

1. **Monitor Progress**: Re-run scripts weekly to track improvements
2. **Fix Issues**: Address any red flags in the inspection results
3. **Optimize Content**: Improve thin or duplicate content
4. **Build Links**: Focus on internal linking and acquiring backlinks
5. **Track Rankings**: Monitor search rankings in GSC Performance reports

---

**Last Updated:** 2025-12-31
**Maintained By:** MyBCAT Development Team
