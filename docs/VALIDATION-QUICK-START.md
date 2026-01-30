# Validation Quick Start Guide

This guide covers how to use the site validation tools to maintain enterprise B2B SEO positioning.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Git Hooks

```bash
bash scripts/setup-hooks.sh
```

This installs:
- **Pre-commit hook**: Validates staged content files before commit
- **Pre-push hook**: Runs full validation before push

---

## Running Validations

### Quick Check (Pre-Build)

```bash
# Check all content files for issues
npm run validate:terms      # Forbidden terms (Georgia, Atlanta, tel:)
npm run validate:meta       # Title/description lengths
npm run validate:h1         # Single H1 per page
npm run validate:enterprise-links  # Inbound links to enterprise pages
```

### Full Validation (Requires Build)

```bash
npm run build
npm run validate:schema     # JSON-LD schema markup
npm run validate:links      # Internal link integrity
```

### Run Everything

```bash
npm run validate:all        # All validations in sequence
npm run audit:seo           # Same, with verbose output
```

---

## Understanding Results

### Exit Codes

- `0` = All checks passed
- `1` = Errors found (blocks commit/push/CI)

### Severity Levels

- **Error** (red ✗): Must fix before merge
- **Warning** (yellow ⚠): Should fix, won't block

---

## Common Scenarios

### Adding a New Blog Post

1. Write your post in `src/content/blog/`
2. Stage the file: `git add src/content/blog/my-post.md`
3. Commit: `git commit -m "Add blog post"`
4. Pre-commit hook automatically validates:
   - No forbidden terms
   - Valid title/description lengths
   - No extra H1 tags

### Editing Enterprise Pages

When editing `/enterprise/` pages:
1. Make changes
2. Run: `npm run validate:schema` (after build)
3. Ensure no LocalBusiness/ProfessionalService schemas

### Checking Link Health

After any content changes:
```bash
npm run build
npm run validate:links
```

---

## Fixing Common Issues

### Forbidden Term Detected

**Error**: `"Georgia" detected in business context`

**Fix options**:
1. Remove the term
2. Replace with "nationwide" or similar
3. If legitimate (author bio), add to allowlist:
   - Edit `scripts/config/term-allowlist.json`
   - Add exception with reason

### Title Too Long

**Error**: `Title too long: 72 chars (max: 60)`

**Fix**: Edit frontmatter `seoTitle` to be under 60 characters

### Multiple H1 Tags

**Error**: `Blog post has 1 H1(s) in content`

**Fix**: Blog posts get H1 from `title` in frontmatter via layout. Remove any `# Heading` that's meant to be the page title.

### Forbidden Schema Type

**Error**: `Forbidden schema type: LocalBusiness`

**Fix**:
1. Check `src/utils/schema.ts` for schema generation
2. Ensure homepage uses `Organization`, not `LocalBusiness`
3. Remove any geo-coordinate or address schemas

### Enterprise Links Low

**Warning**: `/enterprise/patient-access-center/ needs 3 more links`

**Fix**: Add contextual internal links from relevant blog posts:
```markdown
For groups seeking a turnkey solution, a [patient access center](/enterprise/patient-access-center/) can accelerate...
```

---

## Configuration Files

| File | Purpose |
|------|---------|
| `scripts/config/forbidden-terms.json` | Terms to detect/block |
| `scripts/config/term-allowlist.json` | Exceptions to forbidden terms |
| `scripts/config/schema-rules.json` | Allowed/forbidden schema types |
| `scripts/config/meta-rules.json` | Title/description length rules |
| `scripts/config/enterprise-links.json` | Required inbound link counts |

---

## CI/CD Integration

Validations run automatically on:
- **Pull Requests**: All pre-build + post-build checks
- **Push to main**: Full validation suite
- **Weekly (Monday 8am UTC)**: Full audit with report

See `.github/workflows/seo-validation.yml` for details.

---

## Bypassing Hooks (Emergency Only)

If you must commit without validation:

```bash
git commit --no-verify -m "Emergency fix"
```

**Note**: CI will still run validations. This only bypasses local hooks.

---

## Getting Help

1. Check `CONTROLS.md` for complete rules documentation
2. Run with `--verbose` for detailed output:
   ```bash
   npm run validate:terms -- --verbose
   ```
3. Check CI logs for validation failures

---

## Summary of Commands

| Command | Purpose | When to Run |
|---------|---------|-------------|
| `npm run validate:terms` | Check forbidden B2C terms | Before commit |
| `npm run validate:meta` | Check title/description | Before commit |
| `npm run validate:h1` | Check H1 structure | Before commit |
| `npm run validate:enterprise-links` | Check enterprise links | Before PR |
| `npm run validate:schema` | Check JSON-LD schemas | After build |
| `npm run validate:links` | Check internal links | After build |
| `npm run validate:all` | Run all checks | Before PR/push |
