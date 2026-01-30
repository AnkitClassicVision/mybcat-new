# MyBCAT Site Controls & Guardrails

> **Purpose**: Prevent drift from enterprise B2B SEO positioning and maintain technical site integrity.
> **Last Updated**: 2026-01-29
> **Owner**: Engineering/Marketing

---

## Quick Reference

| Control | Script | Pre-commit | CI | Weekly Audit |
|---------|--------|------------|----|--------------|
| Schema Validation | `validate:schema` | No | Yes | Yes |
| Forbidden Terms | `validate:terms` | Yes | Yes | Yes |
| Meta Tag Length | `validate:meta` | Yes | Yes | Yes |
| H1 Validation | `validate:h1` | Yes | Yes | Yes |
| Internal Links | `validate:links` | No | Yes | Yes |
| Image Validation | `validate:images` | Yes | Yes | Yes |
| Enterprise Links | `validate:enterprise-links` | No | Yes | Yes |

**Run all validations**: `npm run validate:all`

---

## 1. SEO Governance Controls

### 1.1 Schema Markup Rules

**ALLOWED schemas**:
- `Organization` (homepage only)
- `WebSite` (homepage only)
- `Service` (solution pages)
- `Article` (blog posts)
- `BreadcrumbList` (all pages)
- `FAQPage` (FAQ sections)

**FORBIDDEN schemas** (will fail build):
- `LocalBusiness`
- `ProfessionalService`
- `GeoCoordinates`
- `PostalAddress` with specific city/state

**Validation**: `npm run validate:schema`

### 1.2 Enterprise Vocabulary Enforcement

**FORBIDDEN terms in content** (except author bio stories):
| Term | Replacement |
|------|-------------|
| `Georgia` (state context) | Remove or use "nationwide" |
| `Atlanta` (city context) | Remove or use "nationwide" |
| `Marietta` | Remove |
| `tel:` links in blog | `/contact/` link |
| `small business` on enterprise pages | `healthcare groups` |
| `local practice` | `multi-location groups` |

**REQUIRED enterprise vocabulary**:
- "multi-location" (not "multiple locations")
- "patient access center" (not "call center")
- "managed intake" (not "answering service" alone)
- "SLA" for enterprise commitments
- "rollout" for implementation
- "acquisition integration" for M&A content

**Validation**: `npm run validate:terms`

### 1.3 Meta Tag Requirements

| Field | Min | Max | Required |
|-------|-----|-----|----------|
| `title` | 30 | 60 | Yes |
| `seoTitle` | 30 | 60 | If different from title |
| `description` | 120 | 160 | Yes |
| `seoDescription` | 120 | 160 | If different from description |

**Validation**: `npm run validate:meta`

### 1.4 Heading Structure

- **Exactly ONE H1** per page
- H1 must appear before any H2/H3
- H1 should match or relate to page title
- Maximum H1 length: 70 characters

**Validation**: `npm run validate:h1`

### 1.5 Canonical URLs

- All pages must have canonical URL
- Canonical must be absolute (https://mybcat.com/...)
- Canonical must include trailing slash
- No duplicate canonicals across pages

---

## 2. Technical Site Controls

### 2.1 Internal Link Integrity

- Zero broken internal links (404s)
- All internal links must include trailing slash
- No double slashes in paths
- Case-sensitive path matching

**Validation**: `npm run validate:links`

### 2.2 Sitemap Requirements

- All published pages included
- Draft/scheduled posts excluded
- No duplicate URLs
- Valid XML structure

### 2.3 Image Requirements

- All images must have `alt` text
- Featured images: minimum 1200x630px
- No missing image references
- WebP versions required for all images

**Validation**: `npm run validate:images`

### 2.4 Build Output

- All routes must render without error
- No source files (.astro, .ts) in dist/
- sitemap.xml present
- robots.txt present

---

## 3. Content Quality Controls

### 3.1 Forbidden Terms Detection

See `scripts/config/forbidden-terms.json` for complete list.

**Categories**:
1. **Geographic B2C terms**: Georgia, Atlanta, Marietta (in business context)
2. **Local business signals**: tel: links, "local practice", "small business"
3. **B2C language**: "free trial", "DIY", "cheap"

**Exceptions**:
- Author bio stories (first-person experience)
- Historical/case study quotes
- Must be marked with `<!-- allowed-term: reason -->` comment

### 3.2 Enterprise Page Linking

Each enterprise pillar page should have minimum inbound links:

| Page | Minimum Links |
|------|---------------|
| `/enterprise/` | 10 |
| `/enterprise/patient-access-center/` | 5 |
| `/enterprise/centralized-scheduling/` | 5 |
| `/enterprise/multi-location-recall/` | 5 |
| `/enterprise/reporting-qa/` | 5 |
| `/enterprise/dso/` | 5 |

**Validation**: `npm run validate:enterprise-links`

### 3.3 Author Attribution

- All blog posts must have valid `author` field
- Author must exist in `src/data/company.ts`
- Author bio page should exist

---

## 4. Enforcement Mechanisms

### 4.1 Pre-commit Hooks (Automatic)

Runs on every commit via Husky:
```bash
# Validates staged files only
npm run validate:staged
```

**Blocks commit if**:
- Forbidden terms detected
- Meta tag length violations
- Multiple H1 tags
- Missing image alt text

### 4.2 CI Pipeline (Required for Merge)

GitHub Actions workflow runs on all PRs:
```bash
npm run validate:all
npm run build
npm run validate:links
```

**Blocks merge if**:
- Any validation fails
- Build fails
- Broken links detected

### 4.3 Weekly Audit (Monitoring)

Scheduled GitHub Action every Monday:
```bash
npm run audit:full
```

**Generates report for**:
- Content freshness
- Enterprise link health
- Schema compliance
- Term drift detection

---

## 5. Running Validations

### Individual Checks

```bash
# Schema validation (requires build first)
npm run validate:schema

# Forbidden terms (source files)
npm run validate:terms

# Meta tag lengths
npm run validate:meta

# H1 tag validation
npm run validate:h1

# Internal link integrity (requires build)
npm run validate:links

# Image validation
npm run validate:images

# Enterprise inbound links
npm run validate:enterprise-links
```

### Full Validation Suite

```bash
# All checks (pre-build)
npm run validate:all

# Full audit with report
npm run audit:full
```

### Fix Common Issues

```bash
# Auto-fix trailing slashes in links
npm run fix:trailing-slashes

# Report forbidden terms with locations
npm run validate:terms -- --verbose
```

---

## 6. Adding Exceptions

### Forbidden Term Exception

If a term is legitimately needed (e.g., author story):

1. Add HTML comment before the term:
   ```markdown
   <!-- allowed-term: author-bio-story -->
   My practice started in Atlanta...
   ```

2. Or add to allowlist in `scripts/config/term-allowlist.json`:
   ```json
   {
     "file": "src/content/blog/my-story.md",
     "terms": ["Atlanta"],
     "reason": "Author biographical content"
   }
   ```

### Schema Exception

For pages requiring non-standard schema:
1. Document in `scripts/config/schema-exceptions.json`
2. Requires approval comment in PR

---

## 7. Troubleshooting

### Validation Failing on CI but Passing Locally

1. Run `npm run build` first (link validation needs dist/)
2. Check for case-sensitivity issues (CI is Linux)
3. Ensure all dependencies installed: `npm ci`

### False Positive on Forbidden Terms

1. Check if term is in valid context
2. Add to allowlist with reason
3. Use HTML comment exception

### H1 Validation Issues

1. Check for H1 in layout AND page (duplicates)
2. Ensure dynamic content doesn't inject H1
3. Use `npm run validate:h1 -- --verbose` for details

---

## 8. Governance

### Changing Controls

1. Propose change in PR with rationale
2. Update this CONTROLS.md document
3. Update relevant config files
4. Test validation scripts
5. Requires review from SEO lead

### Adding New Controls

1. Create validation script in `scripts/validators/`
2. Add to `package.json` scripts
3. Add to CI workflow
4. Document in this file
5. Add to pre-commit if fast enough (<2s)

---

## 9. Related Files

| File | Purpose |
|------|---------|
| `scripts/validators/` | Validation scripts |
| `scripts/config/forbidden-terms.json` | Forbidden terms list |
| `scripts/config/term-allowlist.json` | Exception allowlist |
| `scripts/config/schema-rules.json` | Schema validation rules |
| `.husky/pre-commit` | Pre-commit hook |
| `.github/workflows/seo-validation.yml` | CI workflow |

---

## 10. Version History

| Date | Change | Author |
|------|--------|--------|
| 2026-01-29 | Initial controls document | Claude |
