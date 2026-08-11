# SEO technical cleanup loop — snapshot 2026-08-11

Runbook: `docs/runbooks/seo-technical-cleanup.md`. Operator: headless Claude Code orchestrator + Ringer workers.
Base commit: `7d966c2` (origin/main). Branch: `seo/cleanup-2026-08-11`.
Delta baseline: `reports/ahrefs-loop/2026-07-21/snapshot.md` (Ahrefs crawl 2026-07-16T13:42:32Z). That run reached Phase 3 and never opened a PR, so its findings are still open and this run re-detects them from scratch.

## Phase 0 — Preflight

`scripts/seo-cleanup-loop/preflight.sh` exit code **0** (clear to run, fix PR permitted).

| Gate | Result |
|---|---|
| CPU idle | 94% (threshold 40%) |
| Repo mount write test | ok |
| /tmp writable | ok |
| git fetch origin | ok |
| ringer.py present | ok (but see the tooling defect below) |
| Previous `seo-cleanup-loop` PR open | none — PR #86 is the only labelled PR and it merged 2026-07-17 |

Box: 32 cores, 86 GB available, CPU 93% idle at swarm launch. Load average was not used as a gate (2026-07-16 lesson).

## Phase 1 — Detect

### Internal (deterministic, free)

Scratch worktree of `origin/main` at `.../seo-loop-scratch/detect-2026-08-11`, `npm ci`, full sweep.

| Check | Result | vs 2026-07-21 |
|---|---|---|
| `validate:meta` | 0 errors, **31 warnings across 26 posts** | unchanged |
| `validate:h1` | 0 errors, 14 warnings (all `.astro` pages whose H1 comes from a layout — expected, not a finding) | unchanged |
| `validate:schema` | 0 errors, **9 warnings, all on one post** (`centralized-scheduling-multi-office-2026`) | unchanged |
| `validate:terms` | clean, 279 files, no forbidden terms | unchanged |
| `evaluate-post.js --all` | **150 pass / 50 fail** of 200 evaluated posts | unchanged |
| `npm run build` on `origin/main` | green, 544 pages, `git status` clean afterwards | — |
| Outbound link scan | 488 unique external URLs checked, **3 true 404s** | was 461 URLs / 1 true 404 |

Evaluator failure categories across the 50 failing posts (identical distribution to 2026-07-21):

| Category | Posts affected |
|---|---|
| Missing table of contents (>2000 words) | 32 |
| H2 question ratio below 70% | 19 |
| Cluster not in approved taxonomy | 14 |
| Unverifiable absolute claim | 14 |
| Content quality (word count / citations) | 1 |

Outbound link scan detail: 434×200, 41×403, 6×404, 2×429, 2×202, 1 each of 401/400/302.

The 41 403s are the known bot-blockers (hhs.gov, cdc.gov, bls.gov, beckers\*, hipaajournal, grandviewresearch, doi.org, athenahealth, ahrq.gov, fcc.gov, nejm.org, and similar publishers). **Not link rot — intentionally untouched**, per the 2026-07-16 lesson. The 401 (wsj.com) is a paywall, the 429s (linkedin.com, wtwco.com) are rate limiting, and the 400 (facebook.com/mybcat) reproduces on a real-browser GET, so it is Facebook refusing non-browser clients.

Three of the six 404s are **not content links**: `fonts.googleapis.com`, `fonts.gstatic.com`, and `www.googletagmanager.com` are bare origins that appear only in `<link rel="preconnect">` / `<link rel="dns-prefetch">` tags. A bare origin returning 404 on a HEAD is normal for those hosts. Not rot, no action.

The three true dead outbound links:

| Dead URL | Cited in | Evaluator status of that post |
|---|---|---|
| `heightscg.com/2026/02/10/soc-2-requirements-healthcare-security/` | `soc2-medical-answering-service-enterprise-healthcare.md` | FAIL (2 deficiencies) |
| `aao.org/eye-on-advocacy-article/private-equity-investment-in-ophthalmology` | `optometry-answering-service-roi.md` | FAIL (2 deficiencies) |
| `cofi.ai/resources/key-performance-indicators-kpis-critical-tools-for-private-equity-firm-portfolio-management` | `pe-backed-healthcare-operations.md` | PASS |

The 2026-07-21 finding (`web.archive.org/…/mahealthcareadvisors.com`) did not reproduce: every archive.org URL in the built site returned 200 this run. No action.

### External (Ahrefs MCP)

Project `Mybcat` (6365418), latest crawl **2026-08-06T13:58:28Z**, health score **100** (was 99), 811 URLs, 1 with errors.

**Budget: 300 of 1,500 units consumed** (workspace usage 28,558 → 28,858 of 100,000; resets 2026-08-24). Eight calls, all under cap.

Delta against the 2026-07-16 crawl:

| Ahrefs finding | Now | Change | Notes |
|---|---|---|---|
| Broken backlinks | **0** | — | no dead targets with live referring domains |
| Orphan page (indexable, Error) | **0** | **−1 (resolved)** | `/truth-layer/` cleared, exactly as the 2026-07-21 run predicted |
| Structured data schema.org validation error | **0** | **−5 (resolved)** | the five shared-generator pages cleared on recrawl |
| Meta description too short / too long | 0 / 0 | −4 / −2 | Ahrefs-side only; the internal validator still reports 26 posts |
| Organic traffic dropped | 3 | −1 | see REPORT-ONLY |
| Pages dropped from Top 10 | 4 | +4 | new issue this crawl; see REPORT-ONLY |
| Page and SERP titles do not match | 12 | +4 | see REPORT-ONLY |
| Pages to submit to IndexNow | 202 | +139 | post-merge only |
| External 4XX / 3XX (Ahrefs view) | 41 / 48 | −4 / 0 | superseded by the deterministic internal scan above |
| External 5XX | 1 | +1 | `/resources/book/` — did not reproduce, see below |
| Pages have high AI content levels | 5 | +4 | notice-level, outside every fix class |
| No. of referring domains dropped | 7 | +7 | notice-level, off-site, outside every fix class |

The single URL flagged with an error is `/resources/book/`, for one external 5XX. Re-checking all six of its external links by hand returned 200/403/429/400 and no 5XX, so the Ahrefs reading was transient at crawl time. **Not a finding.**

Two of last run's REPORT-ONLY items closed themselves on recrawl: the `/truth-layer/` orphan (the repo already carried four contextual in-body links to it) and the five shared-generator schema errors. Neither needed the human-supervised session that was reserved for them.

## Phase 2 — Classify

| Class | Findings | Action this run |
|---|---|---|
| broken-backlink-redirect | 0 | nothing to do |
| orphan-page | 0 | resolved upstream |
| schema-error (shared generator/component) | 0 | resolved upstream |
| schema-error (per-page frontmatter) | 1 post | bundled into that post's whole-post lane |
| dead-outbound-link | 3 posts | 1 surgical lane + 2 bundled into whole-post lanes |
| meta-length | 26 posts | 11 frontmatter-only (2 Ringer lanes); 14 deferred to the quality queue; 1 excluded |
| legacy-post-quality | 50 failing posts | 7 worst-by-deficiency remediated (Ringer lanes) |
| indexnow-backlog | 202 pages | AUTO, post-merge only |
| organic-drop / title-mismatch | 3 + 12 | REPORT-ONLY |

### The diff-scoped CI rule drove two splits

**meta-length.** Of the 26 posts carrying meta warnings, **12 also pass `evaluate-post.js`** and are safe for a frontmatter-only lane. The other **14 also fail the evaluator**, so touching them for a "small" meta fix would pull their pre-existing errors into the PR gate; they stay in the legacy-post-quality queue (4 of them are in this run's remediation batch, which fixes their meta as part of whole-post work). One of the 12 clean posts, `optometry-practice-broker-how-to-choose-2`, is **excluded**: it is a `-2` near-duplicate of a post in this run's remediation batch, and per the 2026-07-16 lesson a `-2` slug is a dedup decision, not a remediation target. That leaves **11** in the meta lanes.

**dead-outbound-link.** Only `pe-backed-healthcare-operations` passes the evaluator, so only it gets a surgical citation-swap lane. The other two dead links sit in posts that already fail the evaluator, so their swaps are bundled into whole-post remediation rather than opened as small lanes.

### REPORT-ONLY (no edits this run)

**Organic traffic dropped — 3 pages; Pages dropped from Top 10 — 4 pages.** The two issues overlap on the same URLs.

| Page | Traffic | Prev | Top keyword | Position | Prev position |
|---|---|---|---|---|---|
| `/compare/vs-hello-rache/` | 9 | 43 | `hello rache` | 13 | 6 |
| `/blog/the-importance-of-timely-appointment-scheduling/` | 0 | 1 | — | — | 9 |

`/compare/vs-hello-rache/` is the one worth a human look: it lost roughly three quarters of its traffic and fell from position 6 to 13 on a competitor-brand term. It fails no deterministic internal check, so the registry keeps it REPORT-ONLY and rule 4 keeps the loop off a ranking page it cannot diagnose from validators. This is a SERP-competition question (who else now ranks for `hello rache`), not a technical defect. The second page is a single visit and a position-9 keyword falling off; noise.

**Page and SERP titles do not match — 12 pages.** Eleven are ordinary Google behaviour: truncation, dropping the ` | MyBCAT` suffix, or reordering. All of them rank between position 1 and 9 for their head term, and several (`optometry-private-practice` at 1 with 41 visits, `patient-intake` at 7 with 25) are the site's better performers. No edits.

The twelfth is the same `/glossary/` finding the 2026-07-21 run flagged and it has not changed: page title "Healthcare Practice Glossary | MyBCAT", SERP title "Glosarium Praktik Perawatan Kesehatan | MyBCAT", top keyword `nedet artinya` at position 47 with 0 traffic. Google is serving a machine-translated title against Indonesian-language queries. That is an intent-targeting decision for Ankit, not a technical defect, and it is outside every fix class.

**IndexNow backlog — 202 pages.** AUTO, post-merge only. Not submitted this run because nothing has merged.

**Near-duplicate `-2` slugs.** Still open, still skipped: `optometry-practice-broker-how-to-choose-2`, `ensuring-compliance-…-team-2`, `medical-practice-front-desk-efficiency-metrics-2`, `dso-centralized-patient-scheduling-operations-2`, `after-hours-medical-answering-service-benefits-2`, `dso-call-center-kpi-benchmarks-enterprise-healthcare-2`, `dso-change-management-centralize-intake-consolidation-2`. These need a canonicalize-or-consolidate decision from Ankit. The loop will keep skipping them, because remediating a duplicate deepens the duplication. `ensuring-compliance-…-team-2` again ranked in the worst tier by deficiency count and was again passed over for that reason.

**Pages with high AI content levels (5) and referring domains dropped (7).** New notice-level Ahrefs issues this crawl. Neither maps to a fix class. Flagging them so they are not silently dropped.

### Tooling defects found (not site findings)

1. `scripts/seo-cleanup-loop/templates/scan_external_links.sh` still ships with hardcoded `DIST` and `OUT` paths pointing at a 2026-07-16 scratch directory that no longer exists, so it cannot run as written. Reported on 2026-07-21 and unfixed. This run executed the identical two-stage check logic (HEAD, then ranged GET for 403/405/000/501) with the paths passed as arguments. The template should take `DIST`/`OUT` as arguments, the way `gen_content_manifest.py` already does.
2. **The preflight's Ringer gate passes on a path that cannot run.** `preflight.sh` checks `~/repos/ringer/ringer.py`, but the live Ringer config (`~/.config/ringer/config.toml`) points every engine wrapper at `/mnt/d_drive/repos/ringer/engines/*.sh`. Invoking `~/repos/ringer/ringer.py` therefore aborts with `engines.codex.bin must use the trusted engines/codex-oauth.sh wrapper`. This run used `/mnt/d_drive/repos/ringer/ringer.py`, which works. The preflight should check the install that the config actually points at, otherwise the gate is green on a broken tool.

Both are loop tooling, not site content, and tooling repair is not in the fix-class registry, so neither was fixed here.

## Phase 3 — Fix via Ringer

Run name `seo-cleanup-loop-2026-08-11`, **10 lanes** (cap 10), `max_parallel` 6, `worktrees: true`, engine Codex CLI pinned to `gpt-5.6-terra`.

Engine choice confirmed against this box's scoreboard for `task_type=docs`: gpt-5.6-terra now has **115 tasks, 0.90 pass, 0.82 first-try** — still the strongest record of any engine with meaningful volume (next best with volume: `local-shell` 39 tasks at 0.92/0.72, `Codex CLI default (unpinned)` 40 tasks at 0.75/0.57). No exploration lane was assigned: this is unattended production work against a PR gate with no human on hand to veto an experiment, and the runbook pins the engine.

Lane layout — file ownership is disjoint across all 10 lanes (19 owned files, zero overlap, unique patch export paths, `ringer.py lint`: clean):

| Lane | Class | Files |
|---|---|---|
| `post-optometry-practice-financing-loan-opti` | legacy-post-quality (4 deficiencies) + meta | 1 |
| `post-centralized-scheduling-multi-office-20` | legacy-post-quality (3) + per-page schema | 1 |
| `post-optometry-practice-broker-how-to-choos` | legacy-post-quality (3) + meta | 1 |
| `post-optometrist-business-plan-template-mul` | legacy-post-quality (3) + meta | 1 |
| `post-enterprise-healthcare-patient-access-c` | legacy-post-quality (3) + meta | 1 |
| `post-soc2-medical-answering-service-enterpr` | legacy-post-quality (2) + dead-outbound-link | 1 |
| `post-optometry-answering-service-roi` | legacy-post-quality (2) + dead-outbound-link | 1 |
| `meta-a` | meta-length, frontmatter only | 6 |
| `meta-b` | meta-length, frontmatter only | 5 |
| `link-pe-backed-healthcare-operations` | dead-outbound-link, surgical | 1 |

The seven whole-post lanes use the battle-tested `gen_content_manifest.py` spec and `post_verify.sh` check. The three smaller-class lanes needed new per-class checks, which were written for this run and **watched fail before being trusted**:

- `meta_verify.sh` — asserts every owned post lands `seoTitle` in 50–60 and `seoDescription` in 140–160, that the article body is byte-identical to HEAD, that `title`/`publishDate`/`author`/`canonical`/`status`/`slug`/`cluster`/`category` are unchanged, that only owned files changed, and that `evaluate-post.js` still passes on each. RED-tested on the unmodified tree (failed with the exact character counts) and separately against a one-line body edit (failed on the frontmatter-only rule); GREEN-tested against a compliant edit.
- `link_verify.sh` — asserts the dead URL fragment is gone, that a replacement was added, that it appears in `verified-source-pool.txt`, that it returns a live HTTP status right now, that no archive.org URL was introduced, that only the owned file changed, and that `evaluate-post.js` still passes. RED-tested on the unmodified tree; GREEN-tested against a pooled replacement.

Both live in the run workdir, outside the repo, so loop tooling stays out of the content PR.

### Lane results — 10/10 pass

| Lane | Verdict | Attempts | Tokens | Elapsed |
|---|---|---|---|---|
| `post-optometry-practice-financing-loan-opti` | PASS | 1 | 84,351 | 202s |
| `post-centralized-scheduling-multi-office-20` | PASS | 1 | 98,079 | 191s |
| `post-optometry-practice-broker-how-to-choos` | PASS | 1 | 74,531 | 188s |
| `post-optometrist-business-plan-template-mul` | PASS | **2** | 70,656 | 160s |
| `post-enterprise-healthcare-patient-access-c` | PASS | 1 | 70,267 | 155s |
| `post-soc2-medical-answering-service-enterpr` | PASS | 1 | 76,833 | 186s |
| `post-optometry-answering-service-roi` | PASS | 1 | 66,221 | 156s |
| `meta-a` | PASS | 1 | 37,305 | 74s |
| `meta-b` | PASS | 1 | 36,564 | 67s |
| `link-pe-backed-healthcare-operations` | PASS | 1 | 68,040 | 151s |

`post-optometrist-business-plan-template-mul` needed its one allowed requeue: attempt 1 exited rc=64 from the `codex-oauth.sh` wrapper (`blocked ambiguous provider, model, profile, backend, or config selector`) before the worker ever started, so the lane check correctly failed on a missing `fix-summary.md`. Attempt 2 ran normally. The engine args were identical on both attempts and the other nine lanes launched fine with them, so this reads as a transient wrapper rejection rather than a manifest defect. Worth watching next run.

**One worker self-report needed checking rather than believing.** The `link-pe-backed-healthcare-operations` worker reported that it could not finish verification because the live `curl` probe returned `000` for every candidate source, and asked for a network-enabled rerun. That is true of the worker's own sandbox, which has no outbound network by design; the harness runs the same check afterwards with network, and it passed there. Verified by hand at integration: the chosen replacement is an exact line in `verified-source-pool.txt` and returns HTTP 200.

## Phase 4 — Integrate

All 10 patches applied to `seo/cleanup-2026-08-11` with `git apply --ignore-whitespace` (repo has CRLF files). Every one applied cleanly.

| Integration gate | Result |
|---|---|
| Files changed | 19 content files + 1 report file (abort threshold: >25) |
| Lines changed | 2,332 (+545 / −1,787) (abort threshold: >3,000) |
| Diff limited to files owned by passing lanes | yes — 19 changed files, 19 owned files, exact match |
| Forbidden paths in diff | none (no nav, layouts, `astro.config.*`, redirects, money pages, or `.github/`) |
| `evaluate-post.js` re-run on every touched file | 19/19 pass |
| `deactivate-broken-links.js` run BEFORE commit | 0 deactivated — workers linked only to published targets |
| `git status` re-checked after the deactivator and after the build | no silent source rewrites |
| `npm run build` | green, 544 pages |

Validator sweep, integrated tree vs `origin/main`:

| Check | Before | After |
|---|---|---|
| `evaluate-post.js --all` | 150 pass / 50 fail | **157 pass / 43 fail** |
| `validate:meta` warnings | 31 across 26 posts | **13 across 11 posts** |
| `validate:schema` | 9 warnings on 1 post | **0 — all schemas valid** |
| `validate:terms` | clean | clean |
| `validate:h1` | 14 warnings (layout-sourced) | 14 warnings (unchanged) |
| True dead outbound links | 3 | **0** |

**Regression check on untouched files: none.** Set-differencing the before and after failure lists shows zero newly failing posts and zero newly warning posts. The seven evaluator fixes and fifteen meta clearances are all on files this run owned.

The post-integration link scan reports one `000` on `sequencehealth.com`, a pre-existing citation that returned 200 before the run and returns 200 on retry (it served a 503 in between). Flaky host, not rot, no action.

### Something for Ankit to look at before merging

**All seven whole-post remediations made their posts substantially shorter.** The spec floor is 1,600 words and every post cleared it, but the deltas are large:

| Post | Words before | Words after |
|---|---|---|
| `enterprise-healthcare-patient-access-compliance-hipaa-soc2` | 6,084 | 2,504 |
| `optometry-answering-service-roi` | 3,554 | 2,406 |
| `optometry-practice-broker-how-to-choose` | 3,710 | 2,901 |
| `centralized-scheduling-multi-office-2026` | 3,561 | 2,514 |
| `optometrist-business-plan-template-multi-location` | 3,410 | 2,369 |
| `optometry-practice-financing-loan-options` | 3,174 | 2,263 |
| `soc2-medical-answering-service-enterprise-healthcare` | 2,792 | 2,610 |

This is the same shape as the previously merged batch-3 PR (#86 contained a post that went +81/−887), so it is not new behaviour for this loop. It is still a real content reduction on live pages, and no automated check measures whether what was cut deserved to go. The loop is not equipped to make that call. **Read the seven diffs before merging** — that judgment is the reason this is a PR and not a merge.

## Phase 5 — Verify + report

Live probes do not run until Ankit merges. The PR body carries the exact `curl` commands for the changed URLs. IndexNow submission (202 pages queued) is post-merge only and has not been sent.

<!-- LOOP STATE -->

```
LOOP STATE 2026-08-11
run:            seo-cleanup-loop-2026-08-11-20260811T113711Z-p143745
preflight:      rc=0 (full run authorised, fix PR permitted)
base:           7d966c2 origin/main
branch:         seo/cleanup-2026-08-11
ahrefs budget:  300 / 1500 units (workspace 28,558 -> 28,858)
ringer lanes:   10 / 10 cap, 10 PASS, 1 requeue, 0 failed, 0 salvaged
found:          50 legacy-quality failures, 26 meta-warning posts, 3 dead outbound links,
                1 per-page schema post, 0 broken backlinks, 0 orphans, 0 shared-generator schema errors
fixed:          7 posts to standard, 15 posts' meta cleared, 3 dead links replaced, 9 schema warnings cleared
                (evaluator 150->157 pass, meta 31->13 warnings, schema 9->0, dead links 3->0, 0 regressions)
report-only:    /compare/vs-hello-rache/ organic drop (pos 6->13 on "hello rache", traffic 43->9)
                12 page/SERP title mismatches incl. the /glossary/ Indonesian-title question
                7 near-duplicate -2 slugs awaiting a dedup decision
                5 high-AI-content notices, 7 referring-domain drops
                2 loop tooling defects (scan_external_links.sh hardcoded paths; preflight checks the wrong ringer install)
deferred:       43 legacy-quality failures, 11 meta-warning posts (queue for next run)
post-merge:     202 pages queued for IndexNow; live probes listed in the PR body
needs ankit:    review + merge the PR — in particular the seven shrunken posts
pr:             PR_URL_PLACEHOLDER
```

