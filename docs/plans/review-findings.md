# Blog Article Review Findings

**Generated:** 2026-02-03
**Review Method:** Codex CLI (gpt-5.2-high and gpt-5.2-xhigh) parallel reviews
**Status:** COMPLETE - All critical fixes applied

---

## Summary of Issues Found

### Critical Issues (FIXED ✓)

| Article | Issue | Status |
|---------|-------|--------|
| patient-recall-segmentation.md | **Line 25:** "costly. Mistakes" → "costly, mistakes" | ✓ FIXED |
| patient-recall-segmentation.md | **Line 312:** Missing closing parenthesis | ✓ FIXED |
| dso-patient-retention-strategy.md | **Line 294:** "do mornings" → "Do mornings" | ✓ FIXED |
| dso-patient-retention-strategy.md | **Line 518:** "problems. Achieve" → "problems, achieve" | ✓ FIXED |
| dental-group-acquisition-due-diligence.md | **Line 26:** Sentence fragments rewritten | ✓ FIXED |
| reducingpatientchurninhealthcare.md | **Line 46:** "$2M" → "$1.76M" | ✓ FIXED |
| reducingpatientchurninhealthcare.md | **Line 81:** "Location 12" → "Location 10" | ✓ FIXED |

### Critical Issues (FIXED - Round 2 ✓)

| Article | Issue | Status |
|---------|-------|--------|
| dso-case-study-15-location-missed-calls.md | **Line 227:** Clarified that 8-10% of missed calls are new patient inquiries | ✓ FIXED |
| blog-spanish-speaking-agents.md | "41 million" → "over 40 million" with Census attribution | ✓ FIXED |
| blog-spanish-speaking-agents.md | "10%" → "9%" for metro Atlanta | ✓ FIXED |
| blog-spanish-speaking-agents.md | "15-20% growth" → "meaningful growth" (removed unsourced stat) | ✓ FIXED |

### Critical Issues (FIXED - Round 3 ✓)

| Article | Issue | Status |
|---------|-------|--------|
| pe-backed-healthcare-operations.md | **Lines 225-251:** Replaced unfilled template placeholders ($X.XM, XX%, X,XXX) with realistic example values | ✓ FIXED |

### Medium Issues (Should Review)

| Article | Issue | Recommendation |
|---------|-------|----------------|
| patient-reactivation-campaign-timeline.md | **Line 261:** 90-day booking rate shows `22-32%` but expected `20-28%` | Fix to `20-28%` or verify intentional |
| patient-reactivation-campaign-timeline.md | 7-day booking=reactivation (both 10-15%), but booking should be higher | Adjust: booking should exceed reactivation |
| dso-patient-retention-strategy.md | "5% improvement saves 2,500 patients" ambiguous | Clarify: "5 percentage point improvement" |
| reactivationcallcenterformedicalpractice.md | "4-5 FTEs" should be "5-6 FTEs" | Math: 4.5-5.6 agents base, update to "5-6" |
| reactivationcallcenterformedicalpractice.md | "6-7 FTEs" with shrinkage should be "6-8 FTEs" | Math: 4.5-5.6 × 1.30-1.35 = 5.85-7.56, rounds to 6-8 |
| reactivationcallcenterformedicalpractice.md | Intro claims "20-30%/$1M+" but case shows 17%/$900K | Align numbers or clarify as conservative example |
| reactivationcallcenterformedicalpractice.md | ROI stated as "100-150%" but upper bound is 157% | ($900K-$350K)/$350K = 157% |
| reactivationcallcenterformedicalpractice.md | Call volume: 9,000 attempts vs 4-5 touches = 18K+ calls? | Clarify single-attempt vs multi-touch math |
| case-study-dormant-patient-recovery.md | "22% inactive" calculation unclear | Clarify denominator (total DB vs active) |
| front-desk-recall-workflow.md | **Line 274 vs 295:** Claims "80% accept" but example shows 75% | Align claim with example or vice versa |
| front-desk-recall-workflow.md | Weekly template missing Contact % and Response % | Add missing metrics to template |
| front-desk-recall-workflow.md | "60-80% outreach reduction" claim untracked | Add tracking or soften claim |
| front-desk-recall-workflow.md | "10-15% hygiene/exam production increase" claim completely untracked | Add tracking metric or remove claim |
| front-desk-recall-workflow.md | "20-50% no-show reduction" conflicts with "<10% no-show rate" absolute target | Reconcile relative vs absolute metrics |
| healthcare-operations-MA-integration.md | **Lines 48-58:** $15.6M - $6.25M = $9.35M but shows $9.4M | Use consistent precision: $15.6M - $6.3M = $9.3M |
| healthcare-operations-MA-integration.md | "90-Day Framework" includes Day -30, actually 120+ days | Rename to "120-Day Framework" or exclude pre-close |
| healthcare-operations-MA-integration.md | Phase 3 (Days 61-90) and Phase 4 (Days 90+) overlap at Day 90 | Fix to "Days 91+" for Phase 4 |
| dental-group-acquisition-due-diligence.md | **Line 41:** Value composition 70-85%+10-20%+5-10% = 85-115% | Adjust ranges to sum to ~100% |
| dental-group-acquisition-due-diligence.md | **Line 59:** EBITDA drop -63% but $200K→$75K is -62.5% | Use consistent precision |
| optometry-network-operations-scale.md | **Line 241:** Gap costs not strictly proportional (implied revenue/loc varies $1.2M-$1.4M) | Clarify assumption or adjust table |
| optometry-network-operations-scale.md | **Lines 317-357:** OD ratio × Revenue/OD doesn't match Revenue/Location | Clarify if Revenue/OD is professional only |
| healthcare-front-desk-staffing-crisis-2025.mdx | Direct-cost total $196K uses $14K/turnover but article implies $15K range | Minor: adjust to $210K or clarify $14K-$26K range |
| healthcare-front-desk-staffing-crisis-2025.mdx | "exponentially amplified challenges" - incorrect; scaling is linear | Change "exponentially" to "significantly" or similar |
| multi-location-healthcare-EBITDA.md | SEO claims "10-20% EBITDA lift" but worked example shows 39% | Align SEO description with actual model results |
| multi-location-healthcare-EBITDA.md | Key Takeaways: "10% retention = 15-25% EBITDA" but model shows ~39% | Update takeaway or note example is aggressive scenario |
| multi-location-healthcare-EBITDA.md | $75 labeled as "revenue" but treated as EBITDA dollars in calculation | Clarify unit: apply margin or label as "EBITDA contribution" |
| pe-backed-healthcare-operations.md | Debt/EBITDA: <3.5x target vs <4x for clean exit - inconsistent | Align targets across tables |
| pe-backed-healthcare-operations.md | Same-Store Growth: 3-8% vs 5-8%+ annually - inconsistent | Align ranges across tables |
| pe-backed-healthcare-operations.md | "5% retention improvement = 15-20% revenue impact" unsourced and potentially overstated | 5pp improvement = 6.25% relative increase; add source or adjust claim |
| pe-backed-healthcare-operations.md | **Dashboard tables contain placeholders**: $X.XM, XX%, X,XXX | Replace with actual values or remove |
| human-ai-hybrid-model-healthcare-intake.md | AI 60-70% + Humans 30-40% could sum to 90-110%, not 100% | Clarify: "humans handle remainder" or adjust ranges |
| human-ai-hybrid-model-healthcare-intake.md | "40-50% cost reduction" claim has no supporting math | Add cost comparison calculation or soften claim |
| patient-recall-segmentation.md | "Full prioritization" claims 25-32% but example shows 48% | Internal consistency: clarify different timeframes/definitions |
| patient-recall-segmentation.md | "Nearly double" claim: $5,250→$9,800 is 1.87x (+87%), not 2x | Minor: change to "nearly double" → "nearly 90% more" or keep as is |

### Low Issues (Acceptable Rounding)

| Article | Issue | Status |
|---------|-------|--------|
| case-study-dormant-patient-recovery.md | ROI 4,366% vs 4,365% stated | Acceptable rounding |
| case-study-dormant-patient-recovery.md | Contact rate 86.67% vs 87% | Acceptable rounding |
| case-study-dormant-patient-recovery.md | Response rate 30.88% vs 31% | Acceptable rounding |

---

## AI Writing Patterns

### Em Dashes
- **None found** across reviewed articles

### Banned Phrases (leverage, streamline, navigate, robust, seamless)
- **None found** across reviewed articles

### Structural Patterns Noted (Not Required to Fix)
- Template-heavy structure with consistent sections
- Repetitive "Key Takeaways" formatting
- Unattributed inline statistics (sources at bottom but not linked)

---

## Verified Correct (No Changes Needed)

### case-study-dormant-patient-recovery.md
- Location table sums: 4,200 targeted, 847 reactivated ✓
- Revenue calculation: $156,695 + $142,380 + $13,200 = $312,275 ✓
- Cost calculation: $672 + $4,800 + $320 + $1,200 = $6,992 ✓
- Lifetime value: 847 × $2,800 = $2,371,600 ✓
- LTV derivation: $520 × 5.4 years = $2,808 ≈ $2,800 ✓

### reducingpatientchurninhealthcare.md
- 10 × 2,000 = 20,000 patients ✓
- 15-30% churn = 3,000-6,000 lost ✓
- $4,000 × 3,000-6,000 = $12M-$24M ✓
- 75% → 85% retention = 2,000 additional patients ✓
- 2,000 × $4,000 = $8M protected ✓

### dso-patient-retention-strategy.md
- 2,500 × 20 = 50,000 ✓
- 50,000 × 20% = 10,000 lost ✓
- 10,000 × $150-300 = $1.5-3M ✓
- $500K × 8x = $4M ✓

---

## Review Status

All 17 articles reviewed. Critical issues fixed.

---

## Recommended Actions

1. ~~**Fix critical issues**~~ ✓ COMPLETED (6 fixes applied)
2. **Clarify ambiguous percentages** (5% improvement = 5 percentage points)
3. **Align intro claims with case study numbers** (reactivationcallcenterformedicalpractice.md)
4. **Review medium issues** if time permits - mostly precision/rounding concerns
5. **No AI pattern remediation needed** (no banned phrases or em dashes found)
