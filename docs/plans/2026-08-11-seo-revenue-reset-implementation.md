# SEO-to-Revenue Reset Implementation Yardstick

**Classification:** UNROOMED / INTERNAL-ONLY / NOT FOR EXTERNAL USE  
**Current level:** L0 inventory moving toward L1 read-only proof  
**External actions taken:** 0  
**CANARY:** blue paperclip

## Product contract

Organic traffic must become attributable optometry opportunities without treating page views, generic clicks, failed submissions, or browser-generated qualification labels as qualified conversions. The website intake layer stays independent from the CRM. Twenty remains behind its separate canonical cutover gate.

## Implementation units

| ID | Outcome | Expected proof |
|---|---|---|
| SEO-U1 | Canonical event and first/last-touch contracts exist; only CTA clicks and successful intake may originate in the browser. | Browser tests show page views and generic clicks emit no canonical event; failed intake emits no success event. |
| SEO-U2 | Service and acquisition forms post through a same-origin, server-side proxy and show success only after durable upstream acceptance. | Unit tests cover origin, validation, missing config, upstream failure, successful forwarding, consent isolation, and stable idempotency. |
| SEO-U3 | The homepage is optometry-first and the acquisition journey is a separate confidential page with its own fields and consent. | Mobile browser tests complete both journeys; seller service consent defaults off. |
| SEO-U4 | Content queue health is deterministic and fails with explicit red codes for zero candidates, zero approved topics, zero publish-ready posts, stale inputs, or no publication. | Unit tests watch each red state fail and a valid 14-topic/7-ready queue pass. |
| SEO-U5 | Tag inventory and performance policy are explicit; nonessential HubSpot tracking is deferred to consent or meaningful interaction. | Static tests verify tag loading policy; Lighthouse policy validates regression and Day-28 thresholds from machine-readable reports. |

## Decision residue

- **Hardest decision:** keep CRM qualification events out of browser code even though GTM could generate them cheaply. Qualification is a human/business decision and browser emission would make attribution easy to spoof.
- **Rejected:** direct HubSpot form submission. It bypasses the durable estate intake boundary and shows success before durable acceptance.
- **Rejected:** placing the estate token in a public environment variable. The browser must never receive it.
- **Least-confident assumption:** the existing estate intake accepts the documented `form_id`, `fields`, and `context` shape plus additional metadata. Deployment remains gated until a non-PHI synthetic preview confirms the exact production response.

## Release gates

1. No deployment until environment variables, same-origin routing, rate limiting/WAF, rollback, and a synthetic non-PHI preview are reviewed.
2. No production GTM, CRM, scheduling, publishing, or follow-up change without exact action-time approval.
3. Twenty cannot receive canonical pipeline writes until seven shadow days reconcile without lost or duplicate opportunities.
4. Topic candidates remain `pending_approval` until the weekly claim and evidence review is recorded.

## Highest true state allowed by this work order

Local artifact only, tests passed, and internal review packet. This work order does not authorize commit, push, PR, merge, deployment, publishing, CRM writes, or external messages.
