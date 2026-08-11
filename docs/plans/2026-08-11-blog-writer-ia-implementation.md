# Dual-Funnel Blog Writer and Information Architecture Implementation

**Classification:** UNROOMED / INTERNAL-ONLY / NOT FOR EXTERNAL USE  
**Current level:** L0 inventory moving toward L1 local proof  
**External actions taken:** 0  
**CANARY:** blue paperclip

## Product and requirements contract

The approved 14-topic queue must feed the existing `blog_writer` research, evidence, drafting, review, image, and audit process without uncontrolled topic seeding or implicit publication. Acquisition content serves owner-led Southeast optometry practices, primarily one to three locations. Service content serves optometry groups with three or more locations. Every draft must preserve its funnel, evidence, CTA, intended CRM outcome, and first-party topic ID from queue to frontmatter.

Topic approval authorizes research and local drafting. It does not approve claims or scheduling. A topic may become `draft_ready` after evidence and cannibalization review. It may become `publish_ready` only after Ankit records claim approval. Scheduled content must point to a `publish_ready` topic.

## Implementation units

| ID | Outcome | Expected proof |
|---|---|---|
| BLOG-U1 | A deterministic adapter imports only approved queue topics at the requested readiness gate and preserves topic IDs and funnel metadata. | Unit tests prove idempotency, duplicate rejection, stale-input failure, 5/2 allocation, and zero-ready red states. |
| BLOG-U2 | The writer applies the correct ICP for `service` or `acquisition`; the global enterprise gate cannot reject seller topics or admit off-profile topics. | Unit tests cover service 3+ locations, acquisition optometry owner 1-3 locations, geography, and cross-funnel rejection. |
| BLOG-U3 | The full-buffer runner cannot self-seed by default and has explicit plan-only, local-draft, and separately gated push modes. | Tests prove no seeder invocation, no git command in local mode, and push mode refusal without an explicit environment gate. |
| BLOG-U4 | Source and claim packs carry the queue's reviewed evidence. Acquisition drafts require a five-source floor, government or professional primary material, and no unsupported legal, tax, valuation, clinical, or market claims. | Source-pack and negative-claim tests fail on missing research, headline multiples, invented dollar/percentage claims, and unsupported compliance language. |
| BLOG-U5 | Blog frontmatter and CTA routing preserve `funnel`, `seoTopicId`, buyer stage, CTA ID, evidence packet, and intended CRM outcome. Acquisition CTAs route only to the confidential transition path. | Schema/unit/browser tests show acquisition posts cannot emit service-funnel attribution or route into service marketing. |
| BLOG-U6 | The confidential transition page becomes the acquisition hub while service content stays in the service IA. Existing risky finance and transaction pages remain outside the hub until reviewed. | Link audit proves one dominant intent and no links to quarantined claim-heavy pages. |
| BLOG-U7 | All 14 approved topics have deep-research packets; eleven are net-new drafts and three are substantive refreshes. | Queue/research validation passes and one acquisition plus one service item complete the local 18-stage proof before batch generation. |
| BLOG-U8 | The completed local batch passes build, focused browser tests, content validators, security review, and fresh report-only review. | Exact commands and review artifacts are attached; external actions remain zero. |

## Content action decisions

The approved topic intent is unchanged. These three topics are refreshes because a current page already owns the query intent:

- `seller-valuation-conversation-prep` refreshes the current optometry valuation guide and removes unsupported headline-multiple framing.
- `service-recall-workflow-metrics` refreshes the current recall KPI guide with optometry-specific definitions and evidence.
- `service-location-level-reporting` refreshes the current patient-access metrics guide with a location scorecard.

The other eleven topics are net-new drafts. Existing broker duplicates, unsupported transaction totals, valuation ranges, and dollar-loss headlines are quarantined from the acquisition hub until a separate claim audit passes.

## Non-goals and action gates

- No commit, push, PR, merge, deployment, workflow dispatch, schedule, publication, CRM write, or external message.
- No patient information, financial diligence documents, raw CRM identifiers, credentials, or secrets in prompts or artifacts.
- No claim-review or publication approval is inferred from topic approval.
- No acquisition inquiry enters service marketing without separate consent.

## Fable-proof run packet

- **Mode:** fable-lite
- **Stakes:** medium
- **Scope:** three local repositories, queue-to-draft behavior, IA, and tests
- **Allowed tools:** local inspection, `apply_patch`, tests, builds, public primary-source research, local browser verification
- **Forbidden actions:** all external effects and git history changes listed above
- **Baseline gate:** current queue tests, writer tests, source-claim tests, site unit tests, and site build
- **Stop condition:** three failed fixes on the same problem, an overlapping user edit that cannot be preserved, missing safe source support, or any action requiring a new live approval
- **Repo hook:** `ongoing_seo/.ai/fable-proof-run.md` loaded

## Decision residue

- **Hardest decision:** split `draft_ready` from `publish_ready`. This lets the approved topics use the writer now without falsely approving claims or scheduling.
- **Rejected:** importing every `approved` topic directly into the scheduled backlog. That bypasses evidence and claim gates.
- **Rejected:** preserving the global enterprise wrapper for acquisition posts. It targets the wrong buyer and produces the wrong CTA.
- **Rejected:** creating fourteen new URLs when three intents already have owners. That would increase cannibalization.
- **Least-confident assumption:** the existing 18-stage writer can produce acceptable acquisition drafts after its prompt and evidence contracts become funnel-aware. The two-topic local proof must settle this before batch generation.

## Rollback

All changes remain uncommitted and path-scoped. Rollback means reverting only files listed in the final changed-file manifest or deleting newly added files. Existing dirty worktree changes are never reset, checked out, or overwritten wholesale.
