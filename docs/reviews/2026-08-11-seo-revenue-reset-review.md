CANARY: blue paperclip

## Verdict

**REVISE before any deployment or approval to promote this local artifact.** The implementation has useful fail-closed queue and intake mechanics, but it does not yet preserve the confidential acquisition journey's tracking boundary or protect all visitor-controlled attribution data from being forwarded with the durable inquiry. The live GSC path also writes refreshed credentials outside its configured secret source. No production, CRM, GTM, publishing, or other external action was taken in this review.

## Findings

### P1

- **Confidential acquisition traffic is not isolated from third-party tracking.** The transition page uses `PageLayout` without a tracking opt-out ([src/pages/optometry-practice-transitions/index.astro:5](../../src/pages/optometry-practice-transitions/index.astro#L5)); `PageLayout` neither accepts nor forwards `disableTracking` ([src/layouts/PageLayout.astro:16](../../src/layouts/PageLayout.astro#L16), [src/layouts/PageLayout.astro:53](../../src/layouts/PageLayout.astro#L53)). It therefore receives BaseLayout's immediate no-script GTM fallback and the attribution, HubSpot, and GTM loaders ([src/layouts/BaseLayout.astro:196](../../src/layouts/BaseLayout.astro#L196), [src/layouts/BaseLayout.astro:205](../../src/layouts/BaseLayout.astro#L205), [src/layouts/BaseLayout.astro:235](../../src/layouts/BaseLayout.astro#L235)). Both GTM and HubSpot load on the first pointer, key, or touch event, not only an affirmative consent event ([src/components/GoogleTagManager.astro:27](../../src/components/GoogleTagManager.astro#L27), [public/js/deferred-hubspot.js:17](../../public/js/deferred-hubspot.js#L17)). This conflicts with the promised separate confidential acquisition path and leaves its third-party data boundary uncontrolled. **Introduced by this change's new acquisition page and tracking policy.**

- **The durable intake forwards arbitrary URL query content and attribution strings.** The browser sends the complete `window.location.href` ([public/js/intake-form.js:71](../../public/js/intake-form.js#L71)); the server preserves it, including query text, up to 1,000 characters ([api/forms/intake.mjs:138](../../api/forms/intake.mjs#L138)). First and last-touch source, medium, campaign, and landing-page values are likewise copied after only length truncation ([api/forms/intake.mjs:100](../../api/forms/intake.mjs#L100)). A visitor can arrive through or paste a URL containing sensitive text, and that text will be sent to the upstream durable store despite the page's prohibition on patient and diligence data. Keep only a normalized path and an allowlisted attribution vocabulary before forwarding. **Introduced.**

- **The GSC credential refresh path writes to a different uncontrolled file.** When `GSC_TOKEN_PATH` is used, the script reads that configured path ([scripts/export-gsc.py:63](../../scripts/export-gsc.py#L63)) but, on refresh, writes the new token to the default home-directory token file whenever `GSC_TOKEN_JSON` is absent ([scripts/export-gsc.py:85](../../scripts/export-gsc.py#L85)). The new weekly workflow supplies `GSC_TOKEN_PATH` ([.github/workflows/weekly-audit.yml:102](../../.github/workflows/weekly-audit.yml#L102)), so a self-hosted run can create a refreshed credential copy outside the configured secret source. This violates the intended read-only, secret-contained data path. **Introduced by the new GSC live path, although the write behavior predates the path support.**

### P2

- **The claimed browser proof is incomplete.** The new contract suite is configured for Chromium, Firefox, WebKit, and mobile variants ([tests/seo-revenue-intake.spec.ts:26](../../tests/seo-revenue-intake.spec.ts#L26)). In this review, Chromium and Mobile Chrome completed 12 tests, but all 18 Firefox, WebKit, and Mobile Safari attempts failed before test execution because their browser binaries are absent. This is an environment gap, not a demonstrated product failure, but it leaves cross-browser form, consent, and success-state proof missing. **Pre-existing environment gap.**

- **The required type-check is currently red.** CI runs `npm run check` ([.github/workflows/seo-validation.yml:150](../../.github/workflows/seo-validation.yml#L150)); the local check returned 36 errors, including `src/components/Nav.astro:631` in a modified file. Most reported errors appear outside this reset's implementation, so attribution is not established, but the branch cannot claim the workflow's full quality gate is green. **Pre-existing or unrelated until baseline is compared.**

- **The live GSC job leaves raw query exports on the self-hosted workspace and has no cleanup step.** It writes `artifacts/gsc/queries.csv` before producing the summary ([.github/workflows/weekly-audit.yml:107](../../.github/workflows/weekly-audit.yml#L107)). The summary is privacy-aware, but the raw query dataset has a different retention surface. Do not treat the markdown summary as proof that raw inputs are safely retained or removed. **Introduced.**

### P3

- **The working diff does not pass whitespace validation.** `git diff --check` reports introduced trailing whitespace throughout `package-lock.json` and several workflow lines, plus a new blank line at EOF in `src/pages/contact.astro:975`. This does not change runtime behavior but obscures review and will remain noisy in future diffs. **Introduced.**

## Verification reviewed

- `npm run test:unit`: passed, 16/16. This covers form contract validation, upstream failure, consent isolation, idempotency, queue red states, and Lighthouse budget functions.
- `npm run validate:seo-queue`: correctly failed closed for the checked-in queue with zero approved and zero publish-ready topics. This is expected while every item remains `pending_approval`.
- `node scripts/validate-lighthouse-budget.mjs`: passed against the local report data. It validates report parsing and policy comparison, not a fresh seven-page Lighthouse run.
- `npm run build`: passed. The prebuild reported two existing cross-link warnings but no errors.
- `npm run lint -- --quiet`: passed.
- `npm run check`: failed with 36 errors; see P2.
- `npx playwright test tests/seo-revenue-intake.spec.ts --reporter=line`: 12 passed in Chromium-family projects; 18 failed before execution because Firefox and WebKit binaries are not installed.
- Codex Security OAuth preflight passed for the narrow path scope. The actual report-only scan was canceled after several minutes without completion; coverage is **incomplete**, and no static fallback skill was available on this surface. Private partial-artifact path: `/home/ankit114/.local/state/codex-security/scans/mybcat-new-20260811T152459Z-1065147`.

## Requirements coverage

| Requirement | Review state | Evidence / gap |
|---|---|---|
| SEO attribution truth | Partial | Browser allowlist and event contract exist; full cross-browser evidence is incomplete. |
| Durable intake with service/acquisition separation | Partial | Server allowlists fields and preserves opt-in separation, but acquisition tracking is not isolated and URL/attribution sanitization is insufficient. |
| Human-approved 14-day queue | Met locally, fail-closed | All 14 topics are pending approval; validator returns explicit red states and prevents a green publish path. |
| Seven critical-page Lighthouse governance | Partial | Seven paths and regression/Day-28 policy exist; no fresh Lighthouse evidence was produced here. |
| Live GSC weekly data path | Partial | Workflow and summary exist; credential persistence and raw-export retention must be resolved before calling it privacy-safe. |
| No external action | Met | This review made no production, CRM, GTM, publishing, scheduling, or follow-up action. |

## Residual risks

- The estate intake response contract, production routing, rate limiting/WAF, and non-PHI synthetic preview remain unverified, as the yardstick correctly requires before deployment.
- The local static adapter build passing does not prove the standalone `api/forms/intake.mjs` receives production traffic or that the upstream accepts the payload contract.
- Lighthouse and GSC results reviewed here are local/configuration evidence only, not current provider or live-site evidence.
- The scheduled-publish workflow remains an external-effect path. Its new queue gate blocks the current queue, but any later approval/publish change still needs action-time authorization.

## Recommended disposition

Keep this at **local artifact / review-required**. First fix the three P1 boundaries, then rerun the full browser matrix, a fresh narrow OAuth security scan, type-check, fresh seven-page Lighthouse run, and a non-PHI upstream preview before seeking release approval. Do not deploy, publish, alter GTM, or write to CRM from this review.

## Follow-up disposition (2026-08-11)

**Disposition: conditionally acceptable as a local artifact, still review-required.** The three original P1 findings are resolved and fresh seven-page Lighthouse evidence now passes. This is not release approval: the non-PHI upstream preview, production routing/rate-limit review, and action-time approval remain required before any deployment or external action.

### Original findings status

- **P1, confidential acquisition tracking isolation: resolved.** `PageLayout` now accepts and forwards `disableTracking` ([src/layouts/PageLayout.astro:16](../../src/layouts/PageLayout.astro#L16), [src/layouts/PageLayout.astro:55](../../src/layouts/PageLayout.astro#L55)); the acquisition page sets it true ([src/pages/optometry-practice-transitions/index.astro:5](../../src/pages/optometry-practice-transitions/index.astro#L5)). BaseLayout consequently omits no-script GTM, deferred HubSpot, and GTM for that page while still loading the first-party attribution script ([src/layouts/BaseLayout.astro:196](../../src/layouts/BaseLayout.astro#L196), [src/layouts/BaseLayout.astro:205](../../src/layouts/BaseLayout.astro#L205), [src/layouts/BaseLayout.astro:235](../../src/layouts/BaseLayout.astro#L235)). The new browser assertion confirms no GTM/HubSpot scripts or frame after first interaction while normalized first-party attribution remains available ([tests/seo-revenue-intake.spec.ts:137](../../tests/seo-revenue-intake.spec.ts#L137)).

- **P1, visitor-controlled URL and attribution forwarding: resolved.** The browser now sends `pagePath` only ([public/js/intake-form.js:71](../../public/js/intake-form.js#L71)). The handler requires the exact funnel-specific path, assigns a fixed page name, fixes CTA and cluster from the server-side contract, reduces sources and media to explicit sets, allows campaigns only through configuration, and retains only paths for landings ([api/forms/intake.mjs:115](../../api/forms/intake.mjs#L115), [api/forms/intake.mjs:137](../../api/forms/intake.mjs#L137), [api/forms/intake.mjs:149](../../api/forms/intake.mjs#L149), [api/forms/intake.mjs:180](../../api/forms/intake.mjs#L180)). The new negative unit test proves query and free-form attribution text are absent from the forwarded payload ([tests/unit/intake-handler.test.mjs:165](../../tests/unit/intake-handler.test.mjs#L165)).

- **P1, GSC refresh credential copy: resolved.** The script now records the credential source and persists a refreshed token only when it began from the explicit default local token file, never for configured-path or environment credentials ([scripts/export-gsc.py:56](../../scripts/export-gsc.py#L56), [scripts/export-gsc.py:88](../../scripts/export-gsc.py#L88)). The Python credential-persistence regression test confirms configured-path credentials refresh only in memory, do not mutate that file, and do not create a default-path copy.

- **P2, raw GSC query retention: resolved.** The workflow now uses `mktemp -d` for raw exports and registers `EXIT` cleanup before exporting or summarizing ([.github/workflows/weekly-audit.yml:107](../../.github/workflows/weekly-audit.yml#L107)). The summary alone is appended to the job summary.

- **P2, browser proof: partially resolved.** The installed Chromium and Mobile Chrome projects now pass all 14 E2E cases, including the confidential-page tracker assertion. Firefox, WebKit, and Mobile Safari binaries remain unavailable on this machine, so the original cross-browser proof gap remains a residual environment requirement rather than a known product failure.

- **P2, modified Nav type error: resolved.** The modified call now passes a string to `setAttribute` ([src/components/Nav.astro:631](../../src/components/Nav.astro#L631)); it no longer appears in the local type-check output. `npm run check` still returns 36 errors elsewhere in the repository, so the whole CI quality gate remains red until its baseline/unrelated errors are addressed.

- **P3, diff whitespace: resolved.** `git -c core.whitespace=cr-at-eol diff --check` now passes. The ordinary check remains noisy only because existing repository files use CRLF, not because the reset introduces whitespace defects.

### Follow-up verification reviewed

- `npm run test:unit`: **passed, 18 total**: 17 Node tests plus 1 Python credential-persistence regression test. The suite covers path normalization, fixed context, source/medium/campaign sanitization, exclusion of sensitive query content, and configured-path GSC refresh containment.
- `npx playwright test tests/seo-revenue-intake.spec.ts --project=chromium --project='Mobile Chrome' --reporter=line`: **passed, 14/14**. This includes the no-third-party-tracker check on the confidential acquisition path.
- `npm run check`: **still failed, 35 errors**, all outside the reset's new files; the prior modified-Nav type error remains absent.
- Fresh seven-page Lighthouse collection: **passed, 21 runs**. The regression validator returned no issues. Medians were performance 94-100, accessibility 95-100, best practices 96-100, SEO 100, and TBT 0 ms. The transitions page was 100/100/100/100.
- `git -c core.whitespace=cr-at-eol diff --check`: **passed**.

### Remaining gates

- Install the missing Firefox and WebKit browser binaries, then rerun the complete E2E matrix.
- Improve `/blog/` LCP before the Day-28 absolute target applies. Its fresh median is 3004 ms, above the future 2500 ms target; that target is not yet enforced, and the regression validator passed.
- Complete the existing non-PHI estate-intake preview, production routing, rate-limit/WAF, rollback, and environment review before any deployment.
- Obtain exact action-time approval before GTM, CRM, publishing, scheduling, deployment, or follow-up action.

### Final evidence update (2026-08-11)

The fresh Lighthouse collection contains three runs for each of the seven governed paths. The measured medians confirm the policy is currently passing:

| Path | Performance | Accessibility | Best practices | SEO | LCP ms | TBT ms |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 98 | 95 | 96 | 100 | 2256 | 0 |
| `/solutions/medical-answering-service/` | 99 | 95 | 96 | 100 | 1810 | 0 |
| `/industries/optometry/` | 100 | 100 | 96 | 100 | 1655 | 0 |
| `/blog/` | 94 | 100 | 96 | 100 | 3004 | 0 |
| `/contact/` | 100 | 100 | 96 | 100 | 1658 | 0 |
| `/pricing/` | 100 | 100 | 96 | 100 | 1658 | 0 |
| `/optometry-practice-transitions/` | 100 | 100 | 100 | 100 | 1655 | 0 |

The current Lighthouse budget validator passed with no issues. `/blog/` is the only known Day-28 watch item: its 3004 ms LCP exceeds the future 2500 ms absolute target, but the target's configured enforcement date has not yet arrived. This is a performance improvement obligation, not a current regression-gate failure.

external_actions_taken: 0
