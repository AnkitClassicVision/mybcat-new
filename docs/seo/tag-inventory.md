# Website Tag Inventory

**Classification:** UNROOMED / INTERNAL-ONLY  
**Reviewed:** 2026-08-11  
**External actions taken:** 0

| Tag or embed | Owner | Business value | Data recipient | Consent or trigger | Current execution policy | Measured cost |
|---|---|---|---|---|---|---|
| Google Tag Manager `GTM-MFK3VKPN` | Marketing analytics | Canonical CTA and successful-intake measurement | Google and approved container destinations | Explicit analytics-consent event or meaningful interaction | Deferred until consent, pointer action, touch, or keyboard interaction | Needs fresh three-run capture |
| HubSpot tracking `23344341` | Sales operations | Existing visitor and conversation context | HubSpot | Marketing consent or meaningful interaction | Deferred until explicit consent event, pointer action, touch, or keyboard interaction | Prior repository notes show material mobile blocking; fresh capture pending |
| HubSpot Meetings | Sales operations | Lets a service lead choose a discovery time after intake | HubSpot | User successfully submits service intake, then chooses to use the calendar | Iframe has no `src` until durable intake succeeds | Fresh capture pending |
| YouTube testimonial embed | Marketing | Shows an existing client testimonial | YouTube / Google | User clicks play | Poster only until click | Fresh capture pending |
| Vercel Web Analytics injection | Web operations | Aggregate site usage | Vercel | Platform configuration; privacy review required | Disabled on pages using `disableTracking`; otherwise platform-controlled | Unknown |
| Vector.co pixel referenced by current GTM | Unknown | No confirmed decision value | Vector.co | None documented | Blocked in page layout because the current tag is misconfigured | Unknown |

## Governance decision

- Do not add, remove, or publish a production tag from this inventory without an owner, decision value, recipient, consent basis, execution cost, and action-time approval.
- The production GTM container contents have not been read in this work order. This inventory covers tags observable in repository code only.
- The clean-container preview and production cutover remain L3 actions. No GTM changes were made here.
