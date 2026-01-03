# Google Search Console - Manual Indexing Request List

**Created:** 2026-01-03
**Status:** In Progress

## How to Submit

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select **mybcat.com** property
3. Paste each URL in the search bar at the top
4. Click **"Request Indexing"**
5. Check off each URL below after submitting

**Note:** GSC limits ~10 indexing requests per day. Split across multiple days if needed.

---

## URLs To Submit (15 Total)

### Solutions (4 URLs)
- [ ] https://mybcat.com/solutions/medical-answering-service/
- [ ] https://mybcat.com/solutions/patient-recall/
- [ ] https://mybcat.com/solutions/no-show-recovery/
- [ ] https://mybcat.com/solutions/integrations/

### Industries (5 URLs)
- [ ] https://mybcat.com/industries/dental/
- [ ] https://mybcat.com/industries/veterinary/
- [ ] https://mybcat.com/industries/medspa/
- [ ] https://mybcat.com/industries/dermatology/
- [ ] https://mybcat.com/industries/ent/

### Compare Pages (4 URLs)
- [ ] https://mybcat.com/compare/vs-hello-rache/
- [ ] https://mybcat.com/compare/vs-call-centers/
- [ ] https://mybcat.com/compare/vs-ai-receptionists/
- [ ] https://mybcat.com/compare/vs-virtual-assistants/

### Enterprise (2 URLs)
- [ ] https://mybcat.com/enterprise/
- [ ] https://mybcat.com/enterprise/optometry-groups/

---

## Already Indexed (No Action Needed)

These pages are already indexed in Google:

- https://mybcat.com/ (Homepage)
- https://mybcat.com/pricing/
- https://mybcat.com/careers/
- https://mybcat.com/blog/
- https://mybcat.com/industries/optometry/
- https://mybcat.com/industries/urgent-care/
- https://mybcat.com/solutions/front-desk-outsourcing/
- https://mybcat.com/solutions/medical-virtual-assistant/
- https://mybcat.com/solutions/virtual-medical-scribe/
- https://mybcat.com/compare/build-vs-buy/
- https://mybcat.com/compare/vs-hireteem/
- https://mybcat.com/enterprise/dso/
- https://mybcat.com/case-studies/
- https://mybcat.com/resources/roi-calculator/
- https://mybcat.com/blog/dso-integration-playbook/
- https://mybcat.com/blog/the-optometric-practice-valuation-guide-for-buyers-and-sellers/

---

## SEO Fixes Deployed Today (2026-01-03)

1. Fixed 91 blog canonical URLs (added trailing slashes)
2. Added 301 redirects for legacy URLs
3. Fixed /jobs redirect to /careers
4. Submitted sitemap to GSC

---

## Re-check Indexing Status

Run this command to verify indexing progress:

```bash
node scripts/gsc-url-inspector.js --urls="https://mybcat.com/solutions/medical-answering-service/,https://mybcat.com/industries/dental/,https://mybcat.com/compare/vs-hello-rache/"
```

Or check all URLs:

```bash
python3 ~/.claude/skills/google-search-console/gsc.py inspect "sc-domain:mybcat.com" "URL_HERE"
```
