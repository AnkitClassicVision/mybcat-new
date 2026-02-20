## Summary

<!-- Brief description of changes -->

## Release Checklist

- [ ] `llms.txt` reachable at `/llms.txt` (200)
- [ ] AI Profile reachable at `/ai-profile/` and linked in footer
- [ ] Long-form posts (>= 2000 words) include TOC with working anchor links
- [ ] H2 question ratio test passes (>= 70%)
- [ ] `npm run validate:content-quality` passes with 0 errors
- [ ] `npm run validate:all` passes
- [ ] Link checker passes (no dead/archived citations)
- [ ] IndexNow submission logs success (or retries with backoff)
- [ ] No new pages blocked by `robots.txt` or `noindex` unintentionally

## Rollback Plan

<!-- If QA fails post-deploy, what's the rollback? e.g., revert commit, feature flag -->
