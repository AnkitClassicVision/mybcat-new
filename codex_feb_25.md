---
title: "MyBCAT Autonomous SEO Forensics Spec (v1)"
description: "Behavioral contract and guardrails for an autonomous SEO forensics + remediation loop across ongoing_seo and mybcat-new (PR-based, validated, rollbackable)."
---

# MyBCAT Autonomous SEO Forensics + Remediation (Spec v1)

### System Overview
This spec defines a **fully autonomous, daily-running SEO forensics + technical remediation loop** for `mybcat.com`, implemented as **brownfield changes** across:
- `ongoing_seo` (the VPS/self-hosted runner “factory” that monitors, diagnoses, and drives changes)
- `mybcat-new` (the website repo that deploys to production)

The system’s job is to (1) **detect and quantify** organic search drops using evidence (primarily GSC), (2) **diagnose likely causes** without guessing, (3) **apply safe technical/on-page fixes** via PRs, and (4) **validate + rollback** automatically if deployment or guardrails fail.

### Behavioral Contract
The system must behave as follows (observable outcomes; no assumptions):

**Daily run (always)**
- When the daily job starts, the system creates a new run record and produces a **forensic report artifact** (Markdown + machine-readable JSON) in `ongoing_seo`, even if no incident is detected.
- When collecting Google Search data, the system must account for GSC lag (≈2 days) and must label the exact date windows used.
- When GSC query data is partially anonymized/suppressed, the system must state that limitation and fall back to **page-level** and **segment-level** analysis rather than guessing queries.
- When producing insights or recommendations, the system must prioritize **enterprise intent** (3+ locations / multi-location groups) and must treat SMB/small-office topics as out-of-scope unless explicitly configured.

**Drop detection (incident vs monitor mode)**
- When the system detects a statistically meaningful drop in organic performance for the **strategic keyword set / strategic pages** (see Integration Boundaries), it must enter **Incident Mode** for that run and include the detection rationale in the report.
- When no meaningful drop is detected, the system must remain in **Monitor Mode** and must not change production content; it may open “advisory-only” issues/PRs only if explicitly configured.
- Default incident triggers (7d vs prior 7d; evaluate only rows with ≥50 impressions in the compared window):
  - clicks drop ≥30%, OR
  - impressions drop ≥20%, OR
  - CTR drop ≥25% **and** impressions change is within ±10% (to distinguish CTR/rank shifts from demand shifts).

**Forensic diagnosis (Incident Mode)**
- When in Incident Mode, the system must produce an evidence-based diagnosis that clearly separates:
  - **Confirmed** (supported by data exports / code diffs / inspections)
  - **Hypothesized** (plausible, but unconfirmed)
- When building the timeline, the system must correlate the detected drop window against **deploy/commit history** in `mybcat-new` and summarize the SEO-relevant diffs (titles/meta/template/redirect/sitemap/robots/canonical/internal linking/rendering).
- When the system detects emergent “new” keywords outside the current IA/strategy, it may report them as **incidental opportunities**, but it must not change IA or launch new clusters automatically unless they pass the enterprise gate and are explicitly enabled.

**Remediation (PR-based, auto-merge)**
- When remediation is recommended, the system must create a **PR to `mybcat-new`** (not a direct push) containing only changes that are within the allowed scope for that run.
- When PR checks (build, SEO validations, Lighthouse, link validation, etc.) are green, the system must **enable auto-merge and complete the merge** without human approval.
- When PR checks fail, the system must not merge. It may attempt bounded auto-remediation (within the same scope/budgets) and update the PR; if still failing, it must stop and alert via email.

**High-risk changes (robots.txt + canonicals)**
- When the system proposes a change to `public/robots.txt` or canonical-generation rules/templates, it must treat the change as **high-risk** and must:
  - Include a clear “why” + before/after diff in the forensic report
  - Run stricter deterministic validations (see Integration Boundaries)
  - Keep blast radius small (bounded file/line caps) unless explicitly configured otherwise
- When the high-risk validations do not pass, the system must not merge the PR.

**Deployment verification + rollback**
- When a PR merges, the system must verify that production deploy succeeded (Vercel) and that key URLs are healthy (200s, robots + sitemap reachable, sample pages render).
- When deploy verification fails, the system must automatically **rollback** via a revert commit PR/merge (or equivalent reversible action) and must email an incident summary.

**Post-change SEO regression monitoring + rollback**
- When the system merges a remediation PR, it must record a **pre-change baseline** for the strategic target set (GSC + Ahrefs + GA4 where available).
- When new GSC data becomes available (accounting for lag), the system must compare **post-change** performance vs baseline on the strategic target set.
- If a regression beyond the incident thresholds is detected and persists for **2 consecutive daily runs** (with ≥50 impressions on affected rows), the system must automatically rollback the change set (revert PR/merge) and email the incident summary.
- The forensic report must label SEO rollbacks as **hypothesis-driven** (correlation, not guaranteed causation) and must include the exact evidence bundle used for the rollback decision.

**Dependency failure handling**
- When any external dependency is unavailable or auth is expired (GSC, Gmail, Ahrefs, DataForSEO, GitHub API), the system must:
  - Abort any production-changing actions for that run
  - Email a clear “reauthorize and rerun” checklist to `ankit@mybcat.com`
  - Record the failure (with timestamps and error output) in the `ongoing_seo` report
- When GA4 is enabled and GA4 auth fails, the system must follow the same behavior (abort changes; email reauth; record failure).

**LLM/runtime fallback**
- When the primary agent runtime (Claude Code / Claude CLI) fails due to token limits/rate limits/empty output, the system must attempt a single fallback run using **Codex CLI in no-approval mode (“yolo”)** on the VPS runner.
- When the fallback also fails, the system must stop safely (no merges) and alert via email with next steps.
- The fallback must use a **fixed, versioned prompt template** (see Implementation Constraints) so behavior is stable and auditable.

**Definition of “done” / stop condition**
- When the system has run daily for **14 consecutive days without Incident Mode** for the strategic set, the system may switch to Monitor Mode only (no automated remediation) unless explicitly re-enabled.

### Explicit Non-Behaviors
The system must not:
- Change **Cloudflare** settings or DNS (out of scope).
- Force-push, rewrite remote history, delete remote branches, or run other destructive git operations against `mybcat-new` or `ongoing_seo`.
- Merge any PR that does not have all required checks green.
- Modify or bypass the existing **scheduled publishing** mechanism for blog posts:
  - It must not publish posts early by changing `status`/`scheduledDate` outside of the dedicated scheduled-publish workflow.
- Reduce or “thin” content as a side effect of remediation (e.g., large net word-count reductions) without explicit configuration and documentation in the report.
- Store secrets/tokens in git, in reports, or in PR comments.

### Integration Boundaries
This system touches the following external systems. For each integration, the agent must treat inputs as untrusted data and must use deterministic gates for side effects.

**Repos (GitHub)**
- `mybcat-new` (website; PRs auto-merged when checks pass)
- `ongoing_seo` (system of record for reports, run logs, baselines, policies)
- Optional: `blog_writer` (only if needed for remediation; otherwise read-only)
- Data flow:
  - Out: PRs, commits, run reports, rollback commits
  - In: git history, diffs, CI statuses, branch protection requirements
- Failure behavior: if PR creation/merge permissions fail, do not attempt workarounds; email “permissions missing” with required scopes and current error text.

**Google Search Console (GSC)**
- Contract: export performance for defined windows and dimensions (page/query/country/device/search appearance as available), and URL inspection for specific tier-1 URLs.
- Required outputs per run:
  - Exact windows used and why (accounting for GSC lag)
  - Top losing pages (clicks/impr/CTR/pos deltas)
  - Segment deltas (country/device)
- Failure behavior: if auth expires or API errors, abort changes and email reauth steps + rerun instructions.
- Reauth instructions must include a deterministic runner command (preferred):
  - `python3 ~/.config/google-search-console/authenticate.py` (or the runner-equivalent home path), followed by a verification command (e.g., `python3 ~/.claude/skills/google-search-console/gsc.py sites`).

**Ahrefs**
- Contract: retrieve rank/visibility data for the strategic keyword set and key pages.
- Failure behavior: if unavailable, continue GSC-only forensics but label Ahrefs section “missing due to dependency failure”; do not guess.

**DataForSEO**
- Contract: optional SERP snapshots/feature checks for a small set of strategic keywords when an incident is detected.
- Failure behavior: same as Ahrefs.

**Google Analytics (GA4)**
- Contract: pull organic performance trend context to cross-check GSC signals (sessions/users/pageviews/bounce/avg session duration), especially for landing pages that overlap with GSC’s top losing pages.
- Configuration contract:
  - GA4 Property ID must be provided via a runner config value (e.g., `GA4_PROPERTY_ID`) rather than hardcoded.
  - Credentials must be available via OAuth token at `~/.config/google-analytics/token.json` or via env vars (`GA_TOKEN_JSON` / `GA_CREDENTIALS_JSON`).
- Failure behavior: if GA4 is enabled but auth fails, abort production-changing actions and send reauth email instructions.
- Reauth instructions must include deterministic runner commands (preferred):
  - `python3 ~/.claude/skills/google-analytics/ga4.py auth`
  - `python3 ~/.claude/skills/google-analytics/ga4.py properties` (to discover `GA4_PROPERTY_ID`)

**Gmail (notifications)**
- Contract: email on dependency failure, merge/rollback incidents, and (optionally) daily summary.
- Failure behavior: if Gmail auth fails, write a local report artifact and surface failure via GitHub Actions logs; do not attempt alternate outbound channels unless explicitly configured.

**Vercel (deployment)**
- Contract: confirm production deployment succeeded after merges; validate production URL health.
- Failure behavior: if deployment fails or site health checks fail, rollback and email.

**Site invariants to preserve (from current repo structure)**
- Canonical URL policy: must remain **absolute, https, mybcat.com host, trailing slashes canonical** (see `src/utils/seo.ts`, `CONTROLS.md`).
- robots policy: `/_astro/` must remain crawlable; sitemap line must point to the current sitemap index (see `public/robots.txt`).
- Scheduled posts: `status` + `scheduledDate` govern publication (see `src/content/config.ts` and `.github/workflows/scheduled-publish.yml`).

**Strategic target set (source of truth)**
- Keywords/pages must be defined as the union of:
  - `ongoing_seo/baseline_tracking.json` (priority keyword list + target pages), AND
  - `mybcat-new/ORIGINAL_SEO_STRATEGY.md` (strategy targets)
- The system must prioritize **enterprise intent** terms/pages and must not expand into SMB positioning automatically.

### Behavioral Scenarios
Scenarios are evaluated externally (via observable artifacts, PRs, merges, and production behavior). The agent that implements this system must not rely on reading these scenarios as “tests” during development.

**Happy path 1 — Monitor run (no incident)**
- Setup: GSC windows show no meaningful regression on strategic pages/keywords.
- Action: Daily job runs.
- Expected outcomes:
  - A new timestamped report is committed to `ongoing_seo` stating “Monitor Mode” with the exact windows and key metrics.
  - No PR is opened to `mybcat-new`.

**Happy path 2 — Incident detected, safe on-page fix**
- Setup: GSC shows a meaningful CTR drop on a strategic page while impressions are stable; recent commits touched titles/meta.
- Action: Daily job runs in Incident Mode.
- Expected outcomes:
  - Report includes confirmed drop quantification + commit correlation + a ranked hypothesis list (confirmed vs hypothesized labels).
  - A PR to `mybcat-new` proposes a bounded meta/title fix and passes all required checks.
  - PR auto-merges; report records the PR URL, merge SHA, and which validations passed.

**Happy path 3 — High-risk robots/canonical fix with extra gates**
- Setup: A deterministic validator shows canonical host/scheme/trailing-slash violations OR robots sitemap line is incorrect.
- Action: Daily job proposes remediation.
- Expected outcomes:
  - PR is created with only the minimal robots/canonical fix.
  - Report contains an explicit high-risk section with before/after diff and validation outputs.
  - PR only auto-merges after extra gates pass; then production robots/sitemap/canonical health checks succeed.

**Error 1 — GSC auth expired**
- Setup: GSC API returns an auth error.
- Action: Daily job runs.
- Expected outcomes:
  - No PR is opened and no merge occurs.
  - Report is committed to `ongoing_seo` documenting the failure.
  - An email is sent to `ankit@mybcat.com` with step-by-step reauth instructions and a “how to rerun” checklist.

**Error 2 — Vercel deploy fails after merge**
- Setup: A remediation PR merges successfully, but production verification detects a deploy failure or production returns non-200 for key URLs.
- Action: Post-merge verification runs.
- Expected outcomes:
  - System performs an automatic rollback (revert PR/merge) within the same run window.
  - Email is sent with incident summary, revert commit/PR, and last known good SHA.
  - Report in `ongoing_seo` records the failure, rollback action, and verification evidence.

**Edge 1 — GSC query suppression**
- Setup: Query exports are heavily anonymized and do not sum to property totals.
- Action: Incident Mode diagnosis runs.
- Expected outcomes:
  - Report explicitly notes query suppression and uses page/segment evidence as primary.
  - No “top losing queries” are asserted as definitive beyond what exports show.

**Edge 2 — Scheduled content invariants**
- Setup: A remediation touches blog content files where some posts have `status: scheduled` and future `scheduledDate`.
- Action: Remediation PR is generated.
- Expected outcomes:
  - The PR does not modify `status`/`scheduledDate` to publish early.
  - If a proposed change would publish early, the system blocks the merge and reports the violation.

### Ambiguity Warnings
Resolved / defaults (as of **2026-02-25**, from `docs/plans/2026-02-25-seo-recovery-plan.md`):
1. **GA4 property ID**: default **`382796644`** (override via `GA4_PROPERTY_ID` in `/home/github-runner/seo-pipeline/.env` on the VPS runner).

Still configurable:
1. **GA4 “time on page” proxy**: use `averageSessionDuration` as the operational proxy (recommended default: **yes**).
2. **Whether GA4 is required to ship changes**: default **not required** (`GA4_REQUIRED=false`). If you want GA4 auth failures to block autonomous merges, set `GA4_REQUIRED=true`.

### Implementation Constraints
- Brownfield-first: do not restructure site IA/strategy; focus on technical SEO and guardrails.
- Runtime: must run on the existing VPS/self-hosted runner model used by `ongoing_seo` (no runtime human approvals except reauth).
- Safety: default-deny scope for writes; explicit allowlist of writable files; budgets/timeouts; tamper-evident logs; reversible changes with rollback.
- Merge policy: PRs must be auto-merged when checks are green; merging outside business hours is allowed. Prefer squash merges unless branch protection forces another method.
- Kill switch: autonomous writes must be gateable via `AUTONOMY_WRITES_ENABLED` (default-deny is acceptable; enable explicitly on the runner).
- High-risk write gates: robots/canonicals/redirects/config must be behind explicit gates:
  - `SEO_ROBOTS_WRITES_ENABLED`
  - `SEO_CANONICAL_WRITES_ENABLED`
  - `SEO_REDIRECT_WRITES_ENABLED`
  - `SEO_CONFIG_WRITES_ENABLED`
  - (optional override) `SEO_HIGH_RISK_WRITES_ENABLED=true`

### Incorporated from `docs/plans/2026-02-25-seo-recovery-plan.md` (additive vs duplicative)
Additive (new concrete inputs / execution hooks):
- **GA4 property ID**: `382796644`
- **Recovery tracks A–E** as remediation playbooks (esp. **Track A CTR uplift** and **Track C redirect relevance audit**) with measurable acceptance criteria
- Explicit “this looks like **CTR collapse / mix shift**, not indexing breakage” framing for the 90‑day view (informational; still re-verify in daily 7‑day windows)

Duplicative (already captured elsewhere in this spec):
- PR-based shipping + validation gates + rollback mindset
- “No guessing” / evidence-bundled diagnosis requirements
- Kill switch concept (now concretized as env-gated writes)
- Codex fallback prompt (versioned template): when invoking Codex in `--yolo` fallback mode, the system must pass this prompt (fill placeholders):

```text
You are the Codex fallback runtime for MyBCAT’s autonomous SEO forensics + remediation system.

Hard rules (non-negotiable):
- Do NOT change Cloudflare/DNS.
- Do NOT do destructive git operations (no force-push, no history rewrites, no deleting remote branches).
- Do NOT bypass required PR checks; never merge if checks are failing.
- Preserve scheduled publishing invariants: never publish early by changing blog `status`/`scheduledDate` outside the publish workflow.
- Do NOT thin content as a side effect (avoid large net word-count reductions).
- Enterprise-first: avoid SMB/small-office positioning; keep changes aligned with `mybcat-new/CONTROLS.md` guardrails.

Your job for this run:
1) Export evidence bundles:
   - GSC: page + query (if available) + country + device for the specified windows (account for ~2-day GSC lag).
   - GA4: organic landing pages + summary for the specified windows (if `GA4_PROPERTY_ID` is configured).
   - Ahrefs + DataForSEO: only if credentials are present; otherwise mark as unavailable.
2) Build a timeline correlating the detected drop window to `mybcat-new` commits and SEO-impacting diffs.
3) Propose the smallest safe remediation(s) within allowed scope.
4) Implement remediation via a PR to `mybcat-new`, ensure all required checks pass, enable auto-merge, and complete merge.
5) Verify production health (robots/sitemap fetchable; key URLs 200; basic render sanity). If verification fails, rollback via revert PR/merge.
6) Commit a forensic report (Markdown + JSON) into `ongoing_seo` including:
   - confirmed vs hypothesized causes,
   - top losing pages/segments,
   - PR/merge/rollback links and SHAs,
   - validation outputs,
   - any dependency/auth failures and reauth instructions.

Run context:
- Run ID: {{RUN_ID}}
- Mode: {{MODE}} (monitor|incident)
- Strategic targets: union of `ongoing_seo/baseline_tracking.json` and `mybcat-new/ORIGINAL_SEO_STRATEGY.md`, enterprise-first.
- Repo paths (on VPS runner): {{REPOS_DIR}}/mybcat-new and {{REPOS_DIR}}/ongoing_seo (if different, detect).
- Budgets: max wall-clock {{MAX_MINUTES}} minutes; max PRs {{MAX_PRS}}; max changed files {{MAX_FILES}}; max changed lines {{MAX_LINES}}.
```

---

## Appendix A — Feb 25, 2026 Forensic Report (reference; not requirements)

1) Executive Summary (max 10 bullets)
- Confirmed drop window: comparing **2026-02-03..2026-02-09** vs **2026-02-10..2026-02-16** in GSC, **clicks fell 133 → 82 (-38.3%)** while **impressions rose 14,561 → 15,127 (+3.9%)**; **CTR fell 0.91% → 0.54%** and **avg position worsened 10.31 → 11.17**.
- Interpretation (confirmed): this pattern is **more “CTR/ranking shift” than “demand collapse”** because impressions did not drop overall.
- Biggest contributor (confirmed): **Philippines** clicks fell **55 → 20 (-63.6%)**; **USA** clicks fell **55 → 42 (-23.6%)**.
- Device impact (confirmed): **Mobile** clicks fell **57 → 23 (-59.6%)**; **Desktop** clicks fell **76 → 57 (-25.0%)** (mobile CTR fell **1.91% → 0.86%**).
- Top losing pages (confirmed): **Homepage** (**49 → 23 clicks, -26**) and **/careers/** (**14 → 6 clicks, -8**) drive most click loss.
- Homepage geo detail (confirmed): homepage performance fell in both **PHL** (**31 → 7 clicks; position 2.80 → 5.17**) and **USA** (**12 → 7 clicks; position 7.36 → 14.18**).
- Technical “kill switch” checks (confirmed): no evidence of sitewide blocking—**robots.txt allows crawling**, key URLs return **200**, canonical tags resolve to `https://mybcat.com/.../`, and **URL Inspection shows “Submitted and indexed”** for `/`, `/careers/`, and key blog URLs.
- Change correlation (confirmed): the decline window aligns with a concentrated set of **SEO/meta/redirect/template commits on 2026-02-08..2026-02-10**.
- Most likely causes (ranked): **(1)** homepage + brand/nav query performance deterioration (esp. PHL) + mobile CTR decline, **(2)** ranking/CTR volatility from large SEO template/meta changes shipped Feb 8–10, **(3)** specific content cluster visibility loss on several high-impression blog posts.
- First fixes: isolate **brand vs non-brand** and **PHL vs USA** in GSC, then focus on **homepage snippet/brand alignment** + **/careers/ title/H1 alignment**, and review the handful of **blog URLs with the largest impression losses**—while also hardening daily deploys with a deterministic “SEO regression gate” (Hybrid / Software Factory pattern) to prevent repeat regressions.

2) Timeline: exact drop date(s) + deploy/commit correlation
- Data availability note (confirmed): As of **2026-02-25**, GSC data is available through **2026-02-22** (typical GSC reporting lag).
- Day-by-day (confirmed, clicks): **Feb 9: 16**, **Feb 10: 17**, **Feb 11: 19**, **Feb 12: 13**, **Feb 13: 10**, **Feb 14: 6**, **Feb 15: 5**, **Feb 16: 12**.
- Drop onset (confirmed but noisy due to low volume): the “after” week **starting 2026-02-10** is materially weaker on CTR and average position vs the prior week; the rolling 7‑day click total steps down materially around **2026-02-12** (when the prior spike day rolls out).
- Deploy/commit cluster immediately before/at the drop (confirmed from `git log`):
  - **2026-02-08**: `bb6942f` (redirects/stale sitemaps/tag fixes), `1f7ff55` (rewrite many meta descriptions), `13579fd` (lowercase slugs/canonicals + redirects).
  - **2026-02-09**: `c6eb1e5` (robots sitemap → `sitemap-index.xml`), plus additional SEO/enterprise changes.
  - **2026-02-10**: `30b84a1` (large SEO/EEAT/mobile UX changes), `b09275b` (blog pagination + blog `<title>` logic), `da49179` (meta + tags hub + **careers title change**), `04a4f37` (discovery links + meta description clamping).

3) Tables

Top losing queries (before/after clicks, impressions, position, CTR)
| Query | Before Clicks | Before Impr | Before CTR | Before Pos | After Clicks | After Impr | After CTR | After Pos | Δ Impr |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| view optical eyeglasses store valuation | 0 | 183 | 0.00% | 7.6 | 0 | 1 | 0.00% | 3.0 | -182 |
| healthcare answering services | 0 | 36 | 0.00% | 73.9 | 0 | 5 | 0.00% | 90.6 | -31 |
| patient reactivation | 0 | 23 | 0.00% | 26.4 | 0 | 2 | 0.00% | 37.0 | -21 |
| average revenue independent optometry practice us | 0 | 20 | 0.00% | 2.8 | 0 | 0 | 0.00% | — | -20 |
| rache | 0 | 20 | 0.00% | 6.1 | 0 | 0 | 0.00% | — | -20 |
| optometrist practice management | 0 | 23 | 0.00% | 7.7 | 0 | 7 | 0.00% | 74.7 | -16 |
| veterinarian charts patient intake easy solution | 0 | 21 | 0.00% | 5.0 | 0 | 5 | 0.00% | 5.4 | -16 |
| optometry alliance groups | 0 | 20 | 0.00% | 5.9 | 1 | 5 | 20.00% | 5.8 | -15 |
| optometry practice management | 0 | 46 | 0.00% | 61.2 | 0 | 31 | 0.00% | 81.8 | -15 |
| optometry virtual assistant | 0 | 35 | 0.00% | 19.2 | 1 | 21 | 4.76% | 7.6 | -14 |
| optical inventory management software | 0 | 23 | 0.00% | 39.3 | 0 | 10 | 0.00% | 44.5 | -13 |
| dental support organization dso business entity lensesback | 0 | 27 | 0.00% | 8.3 | 0 | 18 | 0.00% | 9.3 | -9 |
| it support for optometrists | 0 | 23 | 0.00% | 53.0 | 0 | 14 | 0.00% | 42.7 | -9 |
| optometrist answering service | 0 | 26 | 0.00% | 15.3 | 0 | 18 | 0.00% | 19.2 | -8 |
| hireteem | 0 | 33 | 0.00% | 6.4 | 0 | 26 | 0.00% | 6.6 | -7 |
| how to value an optometry practice | 0 | 25 | 0.00% | 10.6 | 0 | 18 | 0.00% | 6.4 | -7 |
| virtual optometrist assistant | 0 | 31 | 0.00% | 8.3 | 0 | 25 | 0.00% | 5.2 | -6 |
| selling optometry practice | 0 | 20 | 0.00% | 22.8 | 0 | 15 | 0.00% | 18.1 | -5 |
| virtual assistant services for medical practice | 0 | 21 | 0.00% | 74.0 | 0 | 16 | 0.00% | 86.1 | -5 |
| hello rache | 1 | 30 | 3.33% | 11.9 | 0 | 27 | 0.00% | 12.3 | -3 |

Important limitation (confirmed): GSC API query rows are heavily anonymized/suppressed here. For the BEFORE window, query rows sum to **54 clicks** while the property total is **133 clicks**; AFTER query rows sum to **22 clicks** vs **82 total**. Use this query table as directional only; pages table is more reliable.

Top losing pages (before/after clicks, impressions, position, CTR)
| Page | Before Clicks | Before Impr | Before CTR | Before Pos | After Clicks | After Impr | After CTR | After Pos | Δ Clicks |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| https://mybcat.com/ | 49 | 362 | 13.54% | 6.0 | 23 | 413 | 5.57% | 6.5 | -26 |
| https://mybcat.com/careers/ | 14 | 120 | 11.67% | 6.0 | 6 | 115 | 5.22% | 9.9 | -8 |
| https://mybcat.com/blog/optometry-private-practice/ | 7 | 953 | 0.73% | 10.8 | 1 | 264 | 0.38% | 9.8 | -6 |
| https://mybcat.com/blog/healthcare-operations-ma-integration/ | 3 | 100 | 3.00% | 8.1 | 1 | 264 | 0.38% | 9.2 | -2 |
| https://mybcat.com/blog/optometric-practice-equipment/ | 3 | 92 | 3.26% | 6.8 | 1 | 87 | 1.15% | 6.8 | -2 |
| https://mybcat.com/blog/the-importance-of-timely-appointment-scheduling/ | 2 | 136 | 1.47% | 10.4 | 0 | 168 | 0.00% | 13.5 | -2 |
| https://mybcat.com/blog/reactivation-text-message-templates/ | 2 | 71 | 2.82% | 6.1 | 0 | 19 | 0.00% | 7.6 | -2 |
| https://mybcat.com/blog/optometry-practice-finances/ | 3 | 1723 | 0.17% | 4.0 | 2 | 1332 | 0.15% | 4.7 | -1 |
| https://mybcat.com/solutions/medical-virtual-assistant/ | 2 | 580 | 0.34% | 22.0 | 1 | 465 | 0.22% | 18.1 | -1 |
| https://mybcat.com/blog/streamlining-patient-intake-for-eye-care-practices/ | 2 | 91 | 2.20% | 20.6 | 1 | 91 | 1.10% | 28.2 | -1 |
| https://mybcat.com/glossary/appointment-conversion/ | 2 | 51 | 3.92% | 7.2 | 1 | 87 | 1.15% | 8.4 | -1 |
| https://mybcat.com/solutions/front-desk-outsourcing/ | 1 | 221 | 0.45% | 11.2 | 0 | 458 | 0.00% | 11.9 | -1 |
| https://mybcat.com/glossary/patient-intake/ | 1 | 138 | 0.72% | 6.6 | 0 | 86 | 0.00% | 7.0 | -1 |
| https://mybcat.com/blog/embracing-cultural-sensitivity-in-optometry-care/ | 1 | 124 | 0.81% | 8.3 | 0 | 152 | 0.00% | 8.4 | -1 |
| https://mybcat.com/blog/standing-out-in-a-crowded-market-strategic-positioning-for-optometry-practices/ | 1 | 99 | 1.01% | 13.4 | 0 | 115 | 0.00% | 17.8 | -1 |
| https://mybcat.com/blog/optometry-practice-location/ | 1 | 96 | 1.04% | 5.1 | 0 | 49 | 0.00% | 5.7 | -1 |
| https://mybcat.com/blog/evaluating-the-effectiveness-of-your-optometry-growth-strategy/ | 1 | 76 | 1.32% | 13.9 | 0 | 104 | 0.00% | 13.2 | -1 |
| https://mybcat.com/blog/dso-integration-playbook/ | 1 | 62 | 1.61% | 7.6 | 0 | 46 | 0.00% | 16.9 | -1 |
| https://mybcat.com/industries/dental/ | 1 | 55 | 1.82% | 14.6 | 0 | 65 | 0.00% | 5.0 | -1 |
| https://mybcat.com/blog/conducting-a-cost-benefit-analysis-of-bpo-in-optometry/ | 1 | 53 | 1.89% | 18.0 | 0 | 82 | 0.00% | 16.8 | -1 |

4) Root-cause hypotheses ranked (evidence, confidence level, and disconfirming tests)

H1) Homepage + brand/navigation performance deterioration (PHL-heavy) plus mobile CTR decline
- Evidence (confirmed):
  - The overall drop is primarily CTR/position: clicks down while impressions up (section 1).
  - Country: **PHL clicks 55 → 20** is the single biggest country delta.
  - Homepage is the biggest losing page (section 3), and on homepage specifically:
    - **PHL**: **31 → 7 clicks**, position **2.80 → 5.17**.
    - **USA**: **12 → 7 clicks**, position **7.36 → 14.18**.
  - Device: mobile CTR and clicks fell sharply (section 1).
- What’s hypothesized (not confirmed): the “why” behind homepage ranking/CTR changes (SERP layout change, competitor moves, Google rewriting titles, brand demand shift, etc.).
- Confidence: **Medium-High** (the segment + homepage deltas are clear; the causal mechanism is not).
- Disconfirming tests:
  - In GSC UI, filter **Page = /** and compare **PHL vs USA** for the last 3–6 weeks: if position/CTR rebound without site changes, it’s likely volatility/demand.
  - Spot-check SERPs (PHL + US) for `mybcat` and top homepage queries: look for new SERP features/knowledge panels pushing the site down.

H2) Feb 8–10 SEO/template/meta changes triggered short-term ranking/CTR volatility on key pages (esp. /careers/ + blog templates)
- Evidence (confirmed):
  - Timing: the decline starts immediately after a high-volume SEO change burst (timeline section 2).
  - `/careers/` is a top losing page (section 3) and its title was changed on **2026-02-10** in `src/pages/careers.astro:10`.
  - Blog template changed title-rendering logic on **2026-02-10** in `src/layouts/Blog.astro:25` (brand suffix conditional), and many meta descriptions were edited on **2026-02-08** (commit `1f7ff55`).
- What’s hypothesized (not confirmed): that these meta/title/template changes materially reduced CTR or induced brief re-evaluation.
- Confidence: **Medium** (strong temporal correlation; mixed page-level behavior).
- Disconfirming tests:
  - Pull a GSC page filter for `/careers/` and compare **avg position** trend day-by-day across Feb 1–22: if the inflection aligns tightly with Feb 10 and persists, template/title is more likely causal.
  - In GSC, compare CTR for blog posts where `<title>` changed (long titles dropping brand) vs posts where it didn’t.

H3) Specific informational content visibility loss (optometry + recall clusters), likely non-technical
- Evidence (confirmed):
  - Large impression losses on a few posts (examples):
    - `/blog/optometry-private-practice/`: impressions **953 → 264 (-689)**.
    - `/blog/the-optometric-practice-valuation-guide-for-buyers-and-sellers/`: **1093 → 537 (-556)** with position **7.2 → 10.2**.
    - `/blog/patient-recall-campaign-framework/`: **519 → 82 (-437)**.
  - URL Inspection for these pages remains **Submitted and indexed** (no deindexing signal).
- What’s hypothesized (not confirmed): intent mismatch vs current SERPs, competition, cannibalization, or content edits affecting relevance.
- Confidence: **Medium-Low** (clear page-level losses; root mechanism not confirmed).
- Disconfirming tests:
  - For each losing URL, run GSC **Page filter** and list top queries (UI export preferred) to see whether losses are concentrated on 1–3 intents (cannibalization) or broad (algorithm/competition).
  - Compare against the closest sibling pages in the same cluster (e.g., recall framework vs recall service vs segmentation) for overlapping query sets.

H4) Indexing/crawl loss or blocking (robots/noindex/WAF) causing the drop
- Evidence against (confirmed):
  - `public/robots.txt:4` allows `User-agent: *` and points to sitemap at `public/robots.txt:40`.
  - Live fetches return **200** for key pages; Googlebot UA fetch returns **200**; canonical/meta robots present; URL inspection says **Indexed**.
- Confidence: **Low**.
- Disconfirming tests:
  - If GSC **Indexing → Pages** shows a sharp rise in “Crawled - currently not indexed”, “Duplicate”, “Soft 404”, or “Blocked by robots.txt” starting Feb 10, re-rank this hypothesis upward.

5) Remediation Plan

0–7 days (quick wins)
- Build a segmented “forensics” view in GSC (PHL vs USA, Mobile vs Desktop, Page=/, Page=/careers/, top 5 blog losers).
  - Impact: High (diagnosis accuracy).
  - Effort: Low.
  - Risk: None.
  - Validate in GSC: confirm whether the decline is concentrated in (a) **PHL brand/nav** and/or (b) **mobile** and/or (c) a few URLs.
- Homepage snippet/brand alignment test
  - Action: update homepage `<title>` to explicitly include **MyBCAT** and your primary value prop (current title is in `src/pages/index.astro:63`).
  - Impact: Medium–High (CTR lift possible for brand/nav queries).
  - Effort: Low.
  - Risk: Medium (could reduce non-brand CTR if title becomes less intent-aligned).
  - Validate in GSC: Page=`https://mybcat.com/` CTR + clicks, split by **PHL** and **USA**; compare next 7 days vs prior 7 days after Google reprocesses.
- Fix /careers/ title + H1 alignment (and revert if needed)
  - Action: revise title in `src/pages/careers.astro:10` and ensure it matches on-page H1 (`src/pages/careers.astro:77`) and likely query intent.
  - Impact: Medium (page-level ranking/CTR recovery).
  - Effort: Low.
  - Risk: Low–Medium.
  - Validate in GSC: Page=`/careers/` avg position + CTR trend (desktop/mobile split).
- Stabilize blog `<title>` behavior if it’s changing too aggressively
  - Action: review meta title logic in `src/layouts/Blog.astro:25` (brand suffix conditional at `src/layouts/Blog.astro:30`) and confirm it’s not causing large-scale title changes without matching query intent.
  - Impact: Medium (CTR stabilization).
  - Effort: Low–Medium.
  - Risk: Medium (sitewide change affects many URLs).
  - Validate in GSC: compare CTR for blog URLs with largest click losses; monitor for 14 days.

2–4 weeks
- Query-to-page loss mapping (reduce “unknowns” from anonymized query data)
  - Action: use GSC UI exports (Queries + Pages) for before/after windows and map: losing queries → losing pages → title/meta changes.
  - Impact: High (identifies true non-brand drivers).
  - Effort: Medium.
  - Risk: None.
  - Validate in GSC: you should be able to explain ≥70% of click loss with 5–10 query clusters and 5–10 URLs.
- Content cluster tuning for the biggest impression losers
  - Action: for the top 5 impression-losing posts, add/update `seoTitle`/`seoDescription`, strengthen internal linking from hub/tag pages, and reduce cannibalization (merge/redirect where necessary).
  - Impact: Medium–High (impression recovery).
  - Effort: Medium.
  - Risk: Medium (content edits can cause more volatility).
  - Validate in GSC: Page-level impressions + avg position on the specific URLs; track query overlap reductions.
- Mobile performance regression check (CWV / UX)
  - Action: run Lighthouse + Search Console Web Vitals and fix any new CLS/LCP issues introduced around Feb 8–10.
  - Impact: Medium (mobile rankings/CTR).
  - Effort: Medium.
  - Risk: Low–Medium.
  - Validate in GSC: mobile segment CTR + position; Web Vitals report improvements.
- Harden daily deploys using a “Hybrid” Software Factory spine (deterministic workflow + bounded agent steps)
  - Action: treat any LLM/agent output as a proposal only; enforce safety via deterministic controls (default-deny) and outcome-verified validation before publish. Concretely: require `npm run validate:all` (see `CONTROLS.md`), `scripts/validate-redirects.mjs`, `scripts/check-sitemap-urls.mjs`, and Playwright `tests/seo.spec.ts` to pass on every PR that touches SEO-critical surfaces (robots, sitemaps, redirects, canonicals, title/meta templates).
  - Impact: High (reduces blast radius from daily SEO changes; prevents “one bad deploy” failures like accidental noindex/disallow/canonical errors).
  - Effort: Medium.
  - Risk: Low (process change; may slow merge velocity slightly).
  - Validate in GSC: fewer sudden multi-segment CTR/position regressions after deploys; faster commit→metric correlation when regressions occur.

1–3 months
- E‑E‑A‑T hardening for informational content
  - Action: improve author pages, medical review where appropriate, citations/sources, and consolidate thin/overlapping posts (especially in recall + optometry finance/valuation topics).
  - Impact: Medium–High (sustained non-brand growth).
  - Effort: High.
  - Risk: Medium.
  - Validate in GSC: non-brand impressions trend up; fewer “flat CTR” pages; improved positions on priority query clusters.
- Build an autonomous SEO forensics + remediation loop (Software Factory SDLC)
  - Action: implement a closed-loop system that (1) snapshots GSC segments daily, (2) detects drops via thresholds, (3) correlates to deploy/commit timelines, (4) generates *typed* tickets/PRs, and (5) ships only through rollbackable, validated changes. Apply a risk-based allowed-action taxonomy: **R (read-only)** for data pulls/crawls, **W‑R (reversible writes)** for PRs/drafts/feature-flagged edits, and keep **W‑I (irreversible)** actions (robots/canonical policy shifts, mass redirects) behind deterministic multi-signal gates + fast rollback. Add hard budgets (time/tool calls/file-touch limits) + a kill switch for auto-publish flows.
  - Impact: High (shortens detection-to-fix time; reduces recurrence risk under daily deploys).
  - Effort: Medium–High.
  - Risk: Medium (automation risk if not bounded; mitigated by default-deny + validation + rollback).
  - Validate in GSC: reduced MTTR for future drops; measurable improvement in stability of mobile/US/non-brand segments after releases.

6) Developer punch list (ticket-style): what file/component to change + acceptance criteria
- Ticket: Add explicit “MyBCAT” to homepage title (snippet CTR test)
  - Files: `src/pages/index.astro:63`
  - Acceptance criteria: live HTML `<title>` contains “MyBCAT”; canonical remains `https://mybcat.com/`; no noindex; deploy doesn’t change URL.
- Ticket: Rework /careers/ title + H1 consistency
  - Files: `src/pages/careers.astro:10`, `src/pages/careers.astro:77`
  - Acceptance criteria: `<title>` and `<h1>` align semantically; page remains indexable; GSC page-level avg position stops declining within 14–21 days.
- Ticket: Audit blog `<title>` logic change impact
  - Files: `src/layouts/Blog.astro:25`–`src/layouts/Blog.astro:35`
  - Acceptance criteria: decide on a stable rule (always include brand vs conditional); document it; verify rendered `<title>` for 10 representative posts (short + long titles) matches the rule.
- Ticket: Verify redirect correctness for recently changed slugs/tags (no chains)
  - Files: `vercel.json:3322` (uppercase M&A slug redirect), `vercel.json:3272` (healthcare-m&a tag redirect)
  - Acceptance criteria: old URLs 308/301 directly to final canonical (single hop); final URL returns 200; sitemap contains only canonical URLs.
- Ticket: Confirm sitemap behavior and submission status
  - Files: `public/robots.txt:40`, `astro.config.mjs:253`, `astro.config.mjs:313`
  - Acceptance criteria: sitemap index resolves 200; sitemap lists only indexable URLs; validate in GSC UI that sitemap shows processed/valid (not just via API).
- Ticket: Add “SEO regression gate” to CI for SEO-critical files (default-deny posture)
  - Files: `CONTROLS.md` (update control definitions) + your CI workflow(s) that run `npm run validate:all`, `scripts/validate-redirects.mjs`, `scripts/check-sitemap-urls.mjs`, and Playwright `tests/seo.spec.ts`.
  - Acceptance criteria: PRs that change `public/robots.txt`, `astro.config.mjs`, `vercel.json`, or title/meta layout components cannot merge unless all SEO validations pass and artifacts (reports) are uploaded.
- Ticket: Implement daily GSC “drop detector” + deploy correlation (typed outputs)
  - Files: new script (e.g., `scripts/gsc-diff.*`) + scheduled runner (GitHub Actions cron, server cron, or similar) + output folder (e.g., `reports/seo/`).
  - Acceptance criteria: produces a daily report with (a) before/after windows, (b) segment splits (USA/PHL, mobile/desktop), (c) top losing pages, (d) commit/deploy IDs for the window; hard budgets and a kill switch prevent runaway/unsafe actions.
- Ticket: Define an allowed-action taxonomy for SEO automation (R / W‑R / W‑I) and enforce it
  - Files: policy-as-code file (location TBD) + enforcement in the tool runner / CI (default-deny).
  - Acceptance criteria: SEO automation can create drafts/PRs (W‑R) but cannot directly ship W‑I changes without deterministic gates; policy decisions are logged alongside tool I/O.
- Ticket: Expand “scenario validation” for SEO (holdout-style critical paths)
  - Files: `tests/seo.spec.ts` + a scenario list file (location TBD).
  - Acceptance criteria: critical URLs (homepage, careers, top traffic blog posts, sitemap, robots) are always checked for indexability invariants (200/308 expectations, canonical correctness, robots meta = index, no accidental noindex); failures block release and are recorded as replayable artifacts.

7) Data still needed (only if necessary; be specific)
- GSC exports (to overcome query anonymization): **Performance → Search results** compare **Feb 3–9 vs Feb 10–16, 2026**:
  - Queries CSV (full), Pages CSV (full), plus device + country breakdown if available.
- GSC UI screenshots/exports: **Indexing → Pages** (counts + top exclusion reasons) for the same time period; **Crawl stats** summary (spikes/drops).
- GA4 (optional but high value): organic landing pages trend across **Feb 1–Feb 22, 2026** to confirm whether the drop is isolated to search or broader.
- Cloudflare/Vercel: any WAF/bot-fight/rate-limit rule changes around **Feb 8–Feb 12, 2026**; firewall events filtered to Googlebot (to conclusively rule out blocking).
- 5–10 priority non-brand keywords you care about most (optometry valuation, recall, virtual assistant, etc.) so we can run a focused SERP-change check and cannibalization analysis.
