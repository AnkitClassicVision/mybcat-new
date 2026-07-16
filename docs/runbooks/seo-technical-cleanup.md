---
title: "SEO Technical Cleanup Runbook — autonomous loop"
description: "Internal ops runbook: weekly autonomous SEO cleanup via headless Claude orchestrator + Ringer. PR-only, never merges."
---

# SEO Technical Cleanup Runbook — autonomous loop

Owner: Ankit. Operator: a headless Claude Code session (orchestrator) + Ringer workers (typing + executed checks).
Cadence: weekly (Tuesday, after Monday's `weekly-audit.yml`), or on demand ("run the seo cleanup runbook").
Origin: 2026-07-16 manual loop (PR #82 technical fixes, PR #83 content batch 1). This document codifies that session.

## Non-negotiable boundaries

1. **PRs only. NEVER merge, never push to `main`, never enable auto-merge.** Ankit merges.
2. **Never touch:** nav components, layouts, `astro.config.*`, redirect REMOVALS (additions only), money pages
   (`/solutions/*`, `/industries/*`, `/enterprise/*`) except frontmatter-meta-only fixes, anything under `.github/`.
3. **Never delete or rename a post/URL.** Slug, publishDate, author are immutable.
4. **The site is GROWING** (traffic all-time high). When detection says a page dropped but it still ranks,
   INVESTIGATE-ONLY — do not rewrite ranking pages on a hunch.
5. Budget caps per run: Ahrefs ≤1,500 API units; Ringer ≤10 lanes; one fix PR.
6. **If the loop's previous PR is still open, detection + report only.** Never stack fix PRs.
7. No secrets in specs, logs, or PR bodies. IndexNow key is public-by-design (hosted in `public/`), everything else via env/secret-store.

## Phase 0 — Preflight (abort the run, report, and stop on any failure)

- Box health: **do not gate on load average** (D-state pileups fake it — 2026-07-16 lesson: load 92, CPU 90% idle).
  Gate on: CPU idle ≥40% (`vmstat 1 2`, last row `id` column) AND `timeout 5 touch <repo>/.iotest` succeeds AND `/tmp` writable.
- Repo: `git fetch origin` works; branch from `origin/main` only; working tree of the integration worktree clean.
- Ringer available: `~/repos/ringer/ringer.py` exists; HUD reachable or startable.
- Previous loop PR (label `seo-cleanup-loop`) merged or closed. If open → detection + report only (rule 6).

## Phase 1 — Detect

Two views; run both:

**Internal (free, deterministic):**
- `npm ci` in a scratch worktree of `origin/main`.
- Full-site sweep: `node scripts/validators/validate-all.js` equivalents — at minimum `validate:meta`, `validate:h1`,
  `validate:schema`, `validate:terms`, plus `node scripts/evaluate-post.js` over every `src/content/blog/*.md`
  (collect per-post error counts; this is the legacy-quality backlog queue).
- Outbound link rot: `scripts/seo-cleanup-loop/templates/scan_external_links.sh` (bot-blocker 403s are NOT rot — 2026-07-16 lesson: ~30 Ahrefs 4XX flags were bot-blockers, intentionally untouched).

**External (Ahrefs MCP, ≤1,500 units):**
- Site audit issues delta vs last snapshot (`reports/ahrefs-loop/<last-date>/snapshot.md`).
- Broken backlinks (new 404 targets with live referring domains).
- Organic-drop pages, orphan pages, schema errors, meta issues, IndexNow backlog.
- Write the new snapshot to `reports/ahrefs-loop/<today>/snapshot.md` (same format; append LOOP STATE as the run progresses).

## Phase 2 — Classify (fix-class registry)

Map every finding to exactly one class. Anything that doesn't match → REPORT-ONLY.

| Class | Detection source | Fix pattern | Lane |
|---|---|---|---|
| broken-backlink-redirect | Ahrefs broken backlinks | Add ONE permanent redirect from the dead path to the correct live URL (additive only; follow the repo's existing redirect mechanism) | AUTO (deterministic script or 1 ringer lane) |
| meta-length | validate-meta / Ahrefs | Rewrite seoTitle to 50–60 chars, seoDescription to 140–160 chars; frontmatter only | RINGER lane |
| orphan-page | Ahrefs orphan report | Add ≥2 contextual internal links FROM related existing pages TO the orphan (edit the linking pages, not the orphan) | RINGER lane |
| schema-error (per-page frontmatter) | Ahrefs / validate:schema | Fix the page's frontmatter/data | RINGER lane |
| schema-error (shared generator/component) | same, multiple pages same error | REPORT-ONLY — shared-generator changes have site-wide blast radius; needs a human-supervised session (2026-07-16: reviewedBy-on-Article root cause was fixed under supervision) | REPORT-ONLY |
| dead-outbound-link | scan_external_links.sh | Swap to a live equivalent from `templates/verified-source-pool.txt` or the source's live successor; never archive.org | RINGER lane |
| legacy-post-quality | evaluate-post.js sweep | WHOLE-post remediation via `templates/gen_content_manifest.py` spec (batch = 10 worst by error count) | RINGER lanes |
| indexnow-backlog | Ahrefs / changed URLs post-merge | Submit to api.indexnow.org (key already hosted in `public/`; payload shape as in `scripts/publish-scheduled.js`) | AUTO, post-merge only |
| organic-drop / title-mismatch | Ahrefs | Analysis memo in the report; NO edits unless the page also fails a deterministic check | REPORT-ONLY |

Diff-scoped CI rule (2026-07-16 lesson): CI content-quality pulls a touched file's PRE-EXISTING errors into the PR gate.
Before any lane touches a legacy post for a "small" fix, run `node scripts/evaluate-post.js` on it: if it has other errors,
either bundle the WHOLE-post remediation into that lane's spec or leave the file for the legacy-post-quality queue.

## Phase 3 — Fix via Ringer

- Create integration worktree: `git worktree add <scratch>/seo-cleanup-<date> -b seo/cleanup-<date> origin/main`, `npm ci` there.
- Generate the manifest with `scripts/seo-cleanup-loop/templates/gen_content_manifest.py` (parameterized: `--repo`, `--workdir`, `--posts-json`)
  for content lanes; smaller classes use the same fix-swarm check pattern with per-class spec templates.
- Manifest rules (all battle-tested 2026-07-16): `worktrees: true`, `max_parallel` 4–10 by box headroom, engine per the
  Ringer scoreboard (`./ringer.py models --task-type docs` — gpt-5.6-terra was 7/7 first-try), file ownership DISJOINT
  across all lanes, every check runs `templates/post_verify.sh <slug>` (the repo's own evaluator) and exports the patch
  outside the worktree via the fix-swarm checker.
- `./ringer.py lint` before `run`. Watch via HUD.
- Failed lanes: keep exported patches/worktrees for salvage; requeue at most once per run.

## Phase 4 — Integrate

- Apply each passing patch with `git apply --ignore-whitespace` (repo has CRLF files) into the integration worktree.
- RE-RUN the evaluator/validator on every touched file in the integration worktree (belt and suspenders — lane checks
  ran in isolation; integration can differ).
- Verify the diff touches ONLY files owned by passing lanes. Any stray path → drop the patch, log it, continue.
- Commit (conventional message, session trailer), push branch, open PR with label `seo-cleanup-loop`; PR body lists
  per-class findings, lane results, and the exact live-verification probes for after merge.
- Watch CI (`gh pr checks --watch`). CI red → fix within the run if a lane check missed something mechanical; otherwise
  mark the PR draft and flag it in the report.

## Phase 5 — Verify + report

- After Ankit merges (NOT before): run the PR body's live probes (curl the changed URLs / redirect targets on mybcat.com),
  then submit changed URLs to IndexNow.
- Every run — including zero-finding runs — appends LOOP STATE to today's snapshot and sends Ankit one notification:
  what was found, what was fixed, what needs him (merge link), what was REPORT-ONLY. One message, no resends.
- Capture a Work Ledger checkpoint to OB_mybcat (sanitized).

## Abort conditions (stop, report, no PR)

- Preflight failure; Ahrefs budget would exceed 1,500 units; >25 files or >3,000 changed lines in the integration diff;
  any forbidden-path file in the diff; validator regressions on untouched files; ringer run <50% pass after requeue.

## Lessons log (append here; these are load-bearing)

- 2026-07-16: `git apply --ignore-whitespace` required (CRLF). Diff-scoped CI pulls pre-existing errors in (whole-post rule).
  Load average lies under D-state pileups — gate on CPU idle + mount write test. Failed lanes keep worktrees + patches — salvage
  before requeue. Bot-blocker 403s are not link rot. llama-3.3-70b:free unusable for repo tasks (64k ctx). gpt-5.6-terra 7/7
  first-try on whole-post remediation (~70k tok, ~3 min/post).
