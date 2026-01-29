# MyBCAT Enterprise Reposition Implementation Plan

Based on: `/home/ankit114/clawd/reports/mybcat_enterprise_site_plan_20260127.md`
Verified by: Agent Team (Codex, Gemini, Claude) on 2026-01-29

---

## Pre-Implementation Requirements

### REQUIRED: Validate Operating Model Before Starting
**Owner:** Leadership/Operations
**Deadline:** Before Phase 1 begins

| Question | Answer Required |
|----------|-----------------|
| Is "US-based leadership + HIPAA-trained global delivery team" accurate? | [ ] Yes / [ ] No - provide correct framing |
| What is the actual Enterprise pricing model? | Base: $____/week, Volume modifiers: ____ |
| Confirm pricing math: $2,500/week = $10,500/month (4.2 weeks) | [ ] Confirmed |

**BLOCKER:** Do not proceed with Phase 1.2 until operating model is validated.

---

## Phase 1: Priority 0 - Trust Leaks (48 hours)

### 1.1 Fix Build vs Buy Pricing Inconsistency

**Files:**
- `src/pages/compare/build-vs-buy.astro`

**Current Issue:** Shows "From $2,500 monthly" but Enterprise tier is $2,500/week (~$10,500/month)

**Deliverables:**
| # | Deliverable | File |
|---|-------------|------|
| 1.1.1 | Update `buyCosts` to "From $10,500/month (Enterprise)" | `build-vs-buy.astro` |
| 1.1.2 | Update `buyTotal` calculations to match | `build-vs-buy.astro` |
| 1.1.3 | Add volume context: "Based on ~5,000 calls/month" | `build-vs-buy.astro` |
| 1.1.4 | Add footnote linking to `/pricing/` for full details | `build-vs-buy.astro` |

**Test Criteria:**
- [ ] Build vs Buy page shows "$10,500/month" (not $2,500 monthly)
- [ ] Math is consistent: $2,500/week × 4.2 weeks = $10,500/month
- [ ] Link to `/pricing/` is present and functional
- [ ] No "monthly" vs "weekly" unit confusion exists on page

---

### 1.2 Fix US-based vs Philippines Inconsistency

**Files:**
- `src/pages/about/index.astro`
- `src/pages/enterprise/index.astro`
- `src/pages/hipaa-compliance.astro`

**Approved Framing:** "US-based leadership + HIPAA-trained global delivery team"
*(Must be validated by leadership before implementation)*

**Deliverables:**
| # | Deliverable | File |
|---|-------------|------|
| 1.2.1 | Remove/replace "US-based, healthcare-certified" claim | `enterprise/index.astro` |
| 1.2.2 | Add consistent team model description | `enterprise/index.astro` |
| 1.2.3 | Update compliance section to explain distributed team model | `hipaa-compliance.astro` |
| 1.2.4 | Keep Philippines story, add enterprise trust block | `about/index.astro` |

**Test Criteria:**
- [ ] Search entire codebase for "US-based" - all instances use approved framing
- [ ] Search for "Philippines" - only appears in `/about/` with trust context
- [ ] No contradictory claims exist across pages
- [ ] Enterprise trust block appears on `/about/` page

**Verification Command:**
```bash
grep -r "US-based" src/pages/ --include="*.astro"
grep -r "Philippines" src/pages/ --include="*.astro"
```

---

### 1.3 Update Homepage Hero to Enterprise-First

**Files:**
- `src/pages/index.astro`

**Deliverables:**
| # | Deliverable | File |
|---|-------------|------|
| 1.3.1 | Update hero tagline to "Centralized Patient Access for Multi-Location Healthcare Groups" | `index.astro` |
| 1.3.2 | Move "overflow" to secondary/supporting copy | `index.astro` |
| 1.3.3 | Update Primary CTA: "Talk to Enterprise Team" → `/contact/` | `index.astro` |
| 1.3.4 | Update Secondary CTA: "See How It Works" → `/enterprise/` | `index.astro` |
| 1.3.5 | Add 3 enterprise proof chips above fold | `index.astro` |
| 1.3.6 | Move Enterprise Callout section above Solutions grid | `index.astro` |
| 1.3.7 | **NEW:** Add internal links to `/enterprise/`, `/hipaa-compliance/`, `/solutions/integrations/`, `/case-studies/dittman-eye-care/` | `index.astro` |

**Enterprise Proof Chips:**
1. "Pilot 1–2 locations"
2. "Unified reporting by location"
3. "Rollouts for acquisitions"

**Test Criteria:**
- [ ] Hero tagline contains "Multi-Location" (not "overflow")
- [ ] Primary CTA text is "Talk to Enterprise Team"
- [ ] Secondary CTA links to `/enterprise/`
- [ ] 3 proof chips visible above the fold
- [ ] Enterprise Callout appears before Solutions grid
- [ ] Internal links present: `/enterprise/`, `/hipaa-compliance/`, `/solutions/integrations/`, case study
- [ ] All links return 200 status

---

### 1.4 Technical SEO Quick Wins (Moved from Phase 4)

**Files:**
- `src/pages/pricing.astro`
- `src/pages/enterprise/index.astro`
- `src/pages/enterprise/[slug].astro`
- `src/pages/hipaa-compliance.astro`
- `src/layouts/BaseLayout.astro` (if meta tags defined here)

**Deliverables:**
| # | Deliverable | File |
|---|-------------|------|
| 1.4.1 | Trim `/pricing/` title to 55-60 chars | `pricing.astro` |
| 1.4.2 | Trim `/enterprise/` title to 55-60 chars | `enterprise/index.astro` |
| 1.4.3 | Review enterprise vertical titles, trim as needed | `enterprise/[slug].astro` |
| 1.4.4 | Ensure SERP titles match page titles for `/`, `/pricing/`, `/hipaa-compliance/` | Various |
| 1.4.5 | Add noindex to HubSpot meetings pages (identify exact routes first) | TBD |

**Test Criteria:**
- [ ] All page titles ≤ 60 characters
- [ ] `<title>` tag matches `<h1>` intent on key pages
- [ ] HubSpot meetings pages have `<meta name="robots" content="noindex">`
- [ ] Run Screaming Frog or similar to verify no title truncation warnings

---

## Phase 2: Enterprise-First Positioning (2 weeks)

### 2.1 Update Enterprise Hub Page

**Files:**
- `src/pages/enterprise/index.astro`
- `src/data/enterprise.ts`

**Deliverables:**
| # | Deliverable | File |
|---|-------------|------|
| 2.1.1 | Remove/adjust "US-based, healthcare-certified" claim | `enterprise/index.astro` |
| 2.1.2 | Add Ops buyer block: SLAs, rollout plan, escalation, QA calibration | `enterprise.ts` + `index.astro` |
| 2.1.3 | Add Finance buyer block: cost-to-booked appt, staffing avoidance, EBITDA | `enterprise.ts` + `index.astro` |
| 2.1.4 | Add IT/Compliance buyer block: access controls, audit trails, BAA, PHI | `enterprise.ts` + `index.astro` |
| 2.1.5 | Add "Sample Reporting Dashboard" section with screenshot/mockup | `index.astro` |
| 2.1.6 | Add "Implementation Timeline" section (pilot → rollout phases) | `index.astro` |

**Test Criteria:**
- [ ] 3 distinct buyer blocks visible on `/enterprise/`
- [ ] Each block addresses specific persona concerns (Ops/Finance/IT)
- [ ] Dashboard screenshot/mockup renders correctly
- [ ] Implementation timeline shows clear phases
- [ ] No "US-based" inconsistency remains

---

### 2.2 Update Navigation

**Files:**
- `src/data/navigation.ts`
- `src/components/Nav.astro` (if header CTA added)

**Decision Required:** Header CTA approach
- **Option A (Recommended):** Persistent "3+ Locations?" button in header
- **Option B:** 2-path selector modal on first visit

**Deliverables:**
| # | Deliverable | File |
|---|-------------|------|
| 2.2.1 | Move "Enterprise" to second position in `mainNavigation` | `navigation.ts` |
| 2.2.2 | Add "3+ Locations?" CTA button to header | `Nav.astro` + `navigation.ts` |
| 2.2.3 | Update `ctaButton` label to "Talk to Enterprise Team" | `navigation.ts` |
| 2.2.4 | Add mobile-friendly CTA variant | `navigation.ts` |

**Test Criteria:**
- [ ] "Enterprise" appears as 2nd nav item (after "Solutions")
- [ ] "3+ Locations?" button visible in header on desktop
- [ ] Header CTA links to `/contact/` or `/enterprise/`
- [ ] Mobile nav shows enterprise prominently
- [ ] No layout shifts or overflow issues

---

### 2.3 Update Industry Pages

**Files:**
- `src/data/industries.ts`
- `src/pages/industries/[slug].astro`

**Deliverables:**
| # | Deliverable | File |
|---|-------------|------|
| 2.3.1 | Update Optometry headline: "Phone Support for Multi-Location Optometry Groups" | `industries.ts` |
| 2.3.2 | Update Dental headline: "Dental Group Patient Access Center (DSO-ready)" | `industries.ts` |
| 2.3.3 | Update Veterinary headline: "Corporate Veterinary Intake & Scheduling" | `industries.ts` |
| 2.3.4 | Move multi-location callout to banner position (top 1/3 of page) | `[slug].astro` |
| 2.3.5 | Update CTA to enterprise-focused text | `industries.ts` |

**Test Criteria:**
- [ ] Each industry page headline mentions "Multi-Location" or "Group"
- [ ] Multi-location callout visible without scrolling (above fold or top 1/3)
- [ ] Callout styled as banner (not buried in body text)
- [ ] CTA text is enterprise-focused

---

### 2.4 Update Solutions Pages

**Files:**
- `src/data/solutions.ts`
- `src/pages/solutions/[slug].astro`

**Deliverables:**
| # | Deliverable | File |
|---|-------------|------|
| 2.4.1 | Update CTA from "Get Started" to "Talk to Enterprise Team" | `solutions.ts` |
| 2.4.2 | Add "Multi-location use case" block near top of each page | `[slug].astro` |
| 2.4.3 | Add internal link to `/enterprise/` | `[slug].astro` |
| 2.4.4 | Add internal link to `/solutions/integrations/` | `[slug].astro` |
| 2.4.5 | **NEW:** Add internal link to `/hipaa-compliance/` | `[slug].astro` |
| 2.4.6 | **NEW:** Add link to relevant enterprise vertical (e.g., optometry solution → optometry-groups) | `[slug].astro` |

**Test Criteria:**
- [ ] All solution pages show "Talk to Enterprise Team" CTA
- [ ] Multi-location block appears in top 1/3 of each solution page
- [ ] Internal links present: `/enterprise/`, `/solutions/integrations/`, `/hipaa-compliance/`
- [ ] Relevant vertical link present where applicable
- [ ] All links return 200 status

---

### 2.5 Update Contact Page + Enterprise Qualification

**Files:**
- `src/pages/contact.astro`
- HubSpot form configuration (external)

**Deliverables:**
| # | Deliverable | File |
|---|-------------|------|
| 2.5.1 | Reframe hero: "Centralize patient access across your locations" | `contact.astro` |
| 2.5.2 | Add "What happens next" bullets | `contact.astro` |
| 2.5.3 | **NEW:** Add pre-form enterprise qualifier section OR update HubSpot form | `contact.astro` / HubSpot |
| 2.5.4 | **NEW:** Add qualification fields: Number of locations | HubSpot form |
| 2.5.5 | **NEW:** Add qualification fields: Monthly call volume estimate | HubSpot form |
| 2.5.6 | **NEW:** Add qualification fields: Current EHR/PMS system | HubSpot form |

**"What Happens Next" Bullets:**
1. Discovery call with enterprise team (15 min)
2. Custom workflow analysis for your locations
3. Pilot program for 1-2 locations
4. Phased rollout plan with dedicated support

**Test Criteria:**
- [ ] Hero text mentions "locations" (enterprise framing)
- [ ] "What happens next" section visible on page
- [ ] Contact form includes "Number of locations" field
- [ ] Contact form includes "Call volume" field
- [ ] Contact form includes "Current system" field (dropdown with Eyefinity, Dentrix, etc.)
- [ ] Form submissions capture all qualification data in HubSpot

---

### 2.6 Update Pricing Page

**Files:**
- `src/pages/pricing.astro`
- `src/data/pricing.ts`

**Deliverables:**
| # | Deliverable | File |
|---|-------------|------|
| 2.6.1 | Add Enterprise section above the fold | `pricing.astro` |
| 2.6.2 | **UPDATED:** Show pricing as "$2,500/week base" with volume modifiers, NOT $8k-$15k range | `pricing.astro` |
| 2.6.3 | Add "Start with a 30-day pilot" messaging | `pricing.astro` |
| 2.6.4 | Review/remove "$25,480/year" comparison if inconsistent | `pricing.astro` |
| 2.6.5 | **NEW:** Update headline from "medical answering service pricing" to enterprise-first | `pricing.astro` |

**Enterprise Section Copy:**
```
For 3+ Locations
Enterprise pricing starts at $2,500/week with volume-based adjustments.
Typical monthly investment: $10,500-$15,000 depending on call volume and workflow complexity.
→ Start with a 30-day pilot at 1-2 locations
```

**Test Criteria:**
- [ ] Enterprise section visible above fold (no scrolling required)
- [ ] Pricing shows "$2,500/week" base (consistent with Build vs Buy)
- [ ] Monthly range tied to weekly rate with clear math
- [ ] Page headline does NOT say "medical answering service" (enterprise-first)
- [ ] No conflicting annual/monthly/weekly numbers on page
- [ ] "30-day pilot" messaging present

---

## Phase 3: Content Expansion (30-90 days)

### 3.0 START IMMEDIATELY: Case Study Customer Outreach

**Owner:** Sales/Marketing
**Start:** Week 1 (parallel with Phase 1-2)

**Deliverables:**
| # | Deliverable | Owner |
|---|-------------|-------|
| 3.0.1 | Identify 4-6 enterprise customers for case studies | Sales |
| 3.0.2 | Send outreach emails requesting participation | Marketing |
| 3.0.3 | Schedule interviews (30 min each) | Marketing |
| 3.0.4 | Draft case studies from interviews | Marketing |
| 3.0.5 | Get customer approval on final copy | Sales |

**Target Customers:**
- 10-15 location dental group / DSO
- 8-12 location optometry group
- Multi-location veterinary corporate group
- Urgent care chain (5+ locations)

**Test Criteria:**
- [ ] 4+ customers contacted by end of Week 2
- [ ] 2+ interviews completed by end of Week 4
- [ ] 2+ draft case studies ready by end of Week 6

---

### 3.1 New Enterprise Landing Pages

**Files to Create:**
- `src/pages/enterprise/patient-access-center.astro`
- `src/pages/enterprise/centralized-scheduling.astro`
- `src/pages/enterprise/multi-location-recall.astro`
- `src/pages/enterprise/reporting-qa.astro`

**Data File:** Add to `src/data/enterprise.ts` (new `enterprisePages` array)

**Deliverables:**
| # | Deliverable | Target Keyword |
|---|-------------|----------------|
| 3.1.1 | Create `/enterprise/patient-access-center/` | centralized patient access center |
| 3.1.2 | Create `/enterprise/centralized-scheduling/` | multi-location scheduling |
| 3.1.3 | Create `/enterprise/multi-location-recall/` | recall at scale |
| 3.1.4 | Create `/enterprise/reporting-qa/` | QA dashboards scorecards |
| 3.1.5 | Add pages to enterprise nav dropdown | `navigation.ts` |

**Content Requirements (per page):**
- Hero with target keyword in H1
- Problem statement (3-4 pain points)
- Solution overview (how MyBCAT solves it)
- 3 key features with icons
- Relevant statistics
- CTA: "Talk to Enterprise Team"
- Internal links to related pages

**Test Criteria:**
- [ ] All 4 pages return 200 status
- [ ] Each page has unique H1 with target keyword
- [ ] Each page has meta description (150-160 chars)
- [ ] Pages appear in enterprise nav dropdown
- [ ] Internal links functional
- [ ] Schema markup present (Service or WebPage)

---

### 3.2 Enterprise Vertical Enhancements

**Files:**
- `src/data/enterprise.ts`
- `src/pages/enterprise/[slug].astro`

**Deliverables (per vertical: DSO, Optometry, Veterinary, Urgent Care):**
| # | Deliverable | File |
|---|-------------|------|
| 3.2.1 | Add 1 mini case study relevant to vertical | `enterprise.ts` |
| 3.2.2 | Add "Systems we integrate with" section | `enterprise.ts` + `[slug].astro` |
| 3.2.3 | Add "Typical rollout timeline" section | `enterprise.ts` + `[slug].astro` |
| 3.2.4 | Add "Success in 30/60/90 days" section | `enterprise.ts` + `[slug].astro` |

**Test Criteria:**
- [ ] Each vertical page has mini case study
- [ ] Each vertical page lists relevant integrations (EHR systems)
- [ ] Rollout timeline visual/text present
- [ ] 30/60/90 success metrics clearly defined
- [ ] Template changes render correctly for all verticals

---

### 3.3 New Case Studies

**Files:**
- `src/data/case-studies.ts`
- `src/pages/case-studies/index.astro`
- `src/pages/case-studies/[slug].astro`

**Deliverables:**
| # | Deliverable | File |
|---|-------------|------|
| 3.3.1 | Add DSO/Dental group case study (10-15 locations) | `case-studies.ts` |
| 3.3.2 | Add Optometry group case study (8-12 locations) | `case-studies.ts` |
| 3.3.3 | Add Veterinary corporate case study | `case-studies.ts` |
| 3.3.4 | Add Urgent care chain case study (5+ locations) | `case-studies.ts` |
| 3.3.5 | **NEW:** Add filtering UI by "# locations" | `index.astro` |
| 3.3.6 | **NEW:** Add filtering UI by "EHR system" | `index.astro` |

**Case Study Data Fields Required:**
```typescript
{
  slug: string,
  clientName: string,
  industry: string,
  locationCount: number,  // NEW: for filtering
  ehrSystem: string,      // NEW: for filtering
  challenge: string,
  solution: string,
  results: { metric: string, value: string }[],
  testimonial: { quote: string, author: string, title: string },
  timeline: string
}
```

**Test Criteria:**
- [ ] 4 new case studies visible on `/case-studies/`
- [ ] Each case study has location count and EHR system
- [ ] Filter by "# locations" works (e.g., "5+ locations")
- [ ] Filter by "system" works (e.g., "Eyefinity", "Dentrix")
- [ ] Individual case study pages render correctly

---

### 3.4 Enterprise Resources

**Files:**
- `src/pages/resources/` (new pages or PDFs)
- `src/data/resources.ts` (if data-driven)

**Deliverables:**
| # | Deliverable | Format | Owner |
|---|-------------|--------|-------|
| 3.4.1 | Implementation Guide | PDF + landing page | Marketing |
| 3.4.2 | Security Overview | PDF + landing page | Compliance |
| 3.4.3 | Sample Dashboard/Reporting Preview | Screenshots + page | Product |
| 3.4.4 | RFP-style FAQ for Procurement | Landing page | Sales |

**Content Outline Required Before Build:**
- [ ] Implementation Guide outline approved
- [ ] Security Overview outline approved
- [ ] Dashboard screenshots captured
- [ ] RFP FAQ questions compiled from sales

**Test Criteria:**
- [ ] Each resource has dedicated landing page
- [ ] PDFs downloadable (if applicable)
- [ ] Resources linked from `/enterprise/` hub
- [ ] Resources appear in footer/nav resources section

---

### 3.5 HIPAA Compliance Enhancements

**Files:**
- `src/pages/hipaa-compliance.astro`

**Deliverables:**
| # | Deliverable | Section |
|---|-------------|---------|
| 3.5.1 | Add "Access Control Model" section | New section |
| 3.5.2 | Add "Audit Logs" section | New section |
| 3.5.3 | Add "MFA Requirements" section | New section |
| 3.5.4 | Add "Device Policies" section | New section |
| 3.5.5 | Add "Incident Response Procedures" section | New section |

**Test Criteria:**
- [ ] All 5 enterprise compliance sections present
- [ ] Each section has substantive content (not placeholders)
- [ ] Page still renders correctly (no layout breaks)
- [ ] Internal links from `/enterprise/` point to these sections

---

## Implementation Order Summary

### Immediate (48 hours) - Phase 1
| Task | Deliverables | Owner | Status |
|------|--------------|-------|--------|
| Validate operating model | Pre-req answers | Leadership | [ ] |
| 1.1 Build vs Buy pricing | 1.1.1-1.1.4 | Dev | [ ] |
| 1.2 US-based consistency | 1.2.1-1.2.4 | Dev | [ ] |
| 1.3 Homepage hero | 1.3.1-1.3.7 | Dev | [ ] |
| 1.4 Technical SEO | 1.4.1-1.4.5 | Dev | [ ] |

### Week 1-2 - Phase 2
| Task | Deliverables | Owner | Status |
|------|--------------|-------|--------|
| 2.1 Enterprise hub | 2.1.1-2.1.6 | Dev | [ ] |
| 2.2 Navigation | 2.2.1-2.2.4 | Dev | [ ] |
| 2.3 Industry pages | 2.3.1-2.3.5 | Dev | [ ] |
| 2.4 Solutions pages | 2.4.1-2.4.6 | Dev | [ ] |
| 2.5 Contact + qualification | 2.5.1-2.5.6 | Dev + HubSpot | [ ] |
| 2.6 Pricing page | 2.6.1-2.6.5 | Dev | [ ] |
| 3.0 Case study outreach | 3.0.1-3.0.2 | Sales/Marketing | [ ] |

### Week 3-4 - Phase 3a
| Task | Deliverables | Owner | Status |
|------|--------------|-------|--------|
| 3.1 Enterprise landing pages | 3.1.1-3.1.5 | Dev | [ ] |
| 3.2 Vertical enhancements | 3.2.1-3.2.4 | Dev | [ ] |
| 3.0 Case study interviews | 3.0.3-3.0.4 | Marketing | [ ] |

### Month 2-3 - Phase 3b
| Task | Deliverables | Owner | Status |
|------|--------------|-------|--------|
| 3.3 New case studies | 3.3.1-3.3.6 | Dev + Marketing | [ ] |
| 3.4 Enterprise resources | 3.4.1-3.4.4 | Marketing + Dev | [ ] |
| 3.5 HIPAA enhancements | 3.5.1-3.5.5 | Dev + Compliance | [ ] |

---

## Files to Modify Summary

### Data Files
| File | Changes | Phase |
|------|---------|-------|
| `src/data/navigation.ts` | Nav order, CTAs, enterprise dropdown | 2 |
| `src/data/enterprise.ts` | Hub content, verticals, new pages data | 2-3 |
| `src/data/industries.ts` | Headlines, callouts, CTAs | 2 |
| `src/data/solutions.ts` | CTAs, multi-location blocks | 2 |
| `src/data/pricing.ts` | Enterprise tier details | 2 |
| `src/data/case-studies.ts` | New studies, locationCount, ehrSystem fields | 3 |

### Page Files
| File | Changes | Phase |
|------|---------|-------|
| `src/pages/index.astro` | Hero, CTAs, section order, internal links | 1 |
| `src/pages/enterprise/index.astro` | Buyer blocks, dashboard, timeline | 1-2 |
| `src/pages/enterprise/[slug].astro` | Vertical enhancements (new sections) | 3 |
| `src/pages/compare/build-vs-buy.astro` | Pricing numbers, link to pricing | 1 |
| `src/pages/pricing.astro` | Enterprise section, headline, math | 2 |
| `src/pages/contact.astro` | Hero, process bullets, qualifier | 2 |
| `src/pages/about/index.astro` | Enterprise trust block | 1 |
| `src/pages/hipaa-compliance.astro` | Team model, enterprise sections | 1, 3 |
| `src/pages/industries/[slug].astro` | Callout position, banner | 2 |
| `src/pages/solutions/[slug].astro` | CTA, multi-location block, links | 2 |
| `src/pages/case-studies/index.astro` | Filtering UI | 3 |

### New Pages to Create
| File | Target | Phase |
|------|--------|-------|
| `src/pages/enterprise/patient-access-center.astro` | centralized patient access | 3 |
| `src/pages/enterprise/centralized-scheduling.astro` | multi-location scheduling | 3 |
| `src/pages/enterprise/multi-location-recall.astro` | recall at scale | 3 |
| `src/pages/enterprise/reporting-qa.astro` | QA dashboards | 3 |

---

## Messaging Cheat Sheet

| Replace | With |
|---------|------|
| "Overflow calls" | "Centralized patient access / intake" |
| "Answering service" | "Patient access operations / intake center" |
| "Get started" | "Request enterprise demo" or "Start pilot" |
| "Virtual assistant" | "Managed outcome-based operations" |
| "Book a Demo" | "Talk to Enterprise Team" |
| "medical answering service pricing" | "Enterprise Patient Access Pricing" |

---

## Success Metrics & Baseline

**Capture baselines BEFORE Phase 1 begins:**

| Metric | Baseline (capture now) | Target (90 days) |
|--------|------------------------|------------------|
| Enterprise inquiries/month via form | ____ | +50% |
| Average deal size (3+ locations) | $____ | +25% |
| Time on `/enterprise/` pages | ____ sec | +40% |
| Bounce rate on `/enterprise/` | ____% | -20% |
| Keyword rankings: "centralized patient access" | #____ | Top 20 |
| Keyword rankings: "DSO answering service" | #____ | Top 10 |
| Contact form completion rate | ____% | +15% |

**Tracking Setup Required:**
- [ ] Google Analytics goals for enterprise page engagement
- [ ] HubSpot form tracking with qualification fields
- [ ] Ahrefs/Semrush keyword tracking for enterprise clusters

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Pricing inconsistency re-introduced | All pricing changes reviewed against master pricing doc before deploy |
| Operating model claim inaccurate | Leadership sign-off required before Phase 1.2 |
| Case studies delayed | Start outreach Week 1; have backup plan (anonymized studies) |
| SEO rankings drop from headline changes | Create separate enterprise pages vs overwriting SMB pages |
| Internal links broken | Run link checker before each deploy |
| HubSpot form changes break lead flow | Test form in staging before production |

---

## Approval & Sign-off

| Phase | Reviewer | Approved | Date |
|-------|----------|----------|------|
| Pre-req: Operating model validation | Leadership | [ ] | |
| Phase 1: Trust leaks | Product/Marketing | [ ] | |
| Phase 2: Enterprise positioning | Product/Marketing | [ ] | |
| Phase 3: Content expansion | Marketing | [ ] | |

---

*Last updated: 2026-01-29*
*Verified by: Agent Team (Codex, Gemini, Claude Code)*
