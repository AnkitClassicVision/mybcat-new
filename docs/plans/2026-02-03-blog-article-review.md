# Blog Article Quality Review Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Review 15 MyBCAT blog posts for numerical accuracy, internal consistency, and AI writing patterns, then decide on and implement necessary corrections.

**Architecture:** Two-phase approach - (1) Review and document all issues across all articles, (2) Batch-apply corrections for approved changes. Reviews will verify calculations, check internal consistency, and flag AI writing patterns (em dashes, overused phrases).

**Tech Stack:** Markdown blog posts, manual calculation verification, grep for pattern detection

---

## Articles to Review (from Codex tasks)

1. `case-study-dormant-patient-recovery.md` - Case study with extensive calculations
2. `reactivationcallcenterformedicalpractice.md` - Call center metrics and ROI
3. `reducingpatientchurninhealthcare.md` - Churn rates and cost calculations
4. `patient-reactivation-campaign-timeline.md` - Timeline benchmarks
5. `front-desk-recall-workflow.md` - Workflow metrics
6. `patient-recall-segmentation.md` - Segmentation math and tables
7. `centralized-patient-recall-multi-location.md` - Multi-location math
8. `healthcare-operations-MA-integration.md` - M&A integration math
9. `dso-patient-retention-strategy.md` - DSO strategy calculations
10. `multi-location-healthcare-EBITDA.md` - EBITDA calculations
11. `pe-backed-healthcare-operations.md` - PE metrics and KPIs
12. `optometry-network-operations-scale.md` - Scaling benchmarks
13. `dental-group-acquisition-due-diligence.md` - Deal structure math
14. `human-ai-hybrid-model-healthcare-intake.md` - Hybrid model percentages
15. `healthcare-front-desk-staffing-crisis-2025.mdx` - Staffing calculations
16. `blog-spanish-speaking-agents.md` - Demographics
17. `dso-case-study-15-location-missed-calls.md` - Case study ROI

---

## Review Criteria (for each article)

### A. Numerical Accuracy
- All multiplication/division calculations correct
- Percentages calculated correctly (e.g., X/Y = Z%)
- Sums of table rows/columns match stated totals
- Ranges internally consistent (e.g., high end > low end)
- ROI calculations: (Revenue - Cost) / Cost × 100

### B. Internal Consistency
- Numbers stated in text match numbers in tables
- Claims match supporting data
- Percentages that should sum to 100% do so
- Ranges don't contradict each other

### C. AI Writing Patterns to Flag
- Em dashes (—) - replace with periods, commas, or colons
- Overused phrases: leverage, streamline, navigate, dive into, robust, seamless, cutting-edge, game-changer, holistic

---

## Task 1: Review Article 1 - case-study-dormant-patient-recovery.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/case-study-dormant-patient-recovery.md`
- Output: Create findings in `docs/plans/review-findings.md`

**Step 1: Verify key calculations**

Numbers to verify:
```
1. 4,200 + 2,100 = 6,300 total inactive patients ✓ (if stated)
2. 22% of database inactive - verify against 28,000 active
3. 3,640 / 4,200 = 87% contact rate ✓
4. 1,124 / 3,640 = 30.9% ≈ 31% response rate ✓
5. 912 / 1,124 = 81.1% ≈ 81% booking rate ✓
6. 847 / 912 = 92.9% ≈ 93% show rate ✓
7. 847 / 4,200 = 20.2% reactivation rate ✓
8. 847 × $185 = $156,695 ✓
9. Eyewear: 847 × 0.58 = 491 patients with eyewear
   - $142,380 / 491 = $290 per patient (plausible)
10. $156,695 + $142,380 + $13,200 = $312,275 ✓
11. SMS cost: Check if 4,200 × $0.16 = $672 ✓
12. $672 + $4,800 + $320 + $1,200 = $6,992 ✓
13. ($312,275 - $6,992) / $6,992 = 4,365% ✓
14. $312,275 / $6,992 = 44.7x ✓
15. 847 × $2,800 = $2,371,600 ✓
16. $520 × 5.4 = $2,808 ≈ $2,800 ✓
17. Location sums: Add all targeted = 4,200?
18. Location sums: Add all reactivated = 847?
```

**Step 2: Verify location table sums**

```
Targeted: 520+410+380+350+320+340+290+310+280+360+320+320 = ?
Should equal 4,200

Reactivated: 124+98+82+71+62+65+54+57+49+62+51+72 = ?
Should equal 847
```

**Step 3: Search for AI writing patterns**

Run: `grep -n "—\|leverage\|streamline\|navigate\|dive into\|robust\|seamless" file`

**Step 4: Document findings**

Record issues found with line numbers and recommended fixes.

---

## Task 2: Review Article 2 - reactivationcallcenterformedicalpractice.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/reactivationcallcenterformedicalpractice.md`

**Step 1: Verify key calculations**

```
1. 15 locations × 6,000 patients = 90,000 total ✓
2. 90,000 × 10% = 9,000 lost patients ✓
3. 9,000 × $400 = $3.6M and 9,000 × $800 = $7.2M ✓
4. 9,000 calls / 80 = 112.5 days; 9,000 / 100 = 90 days ✓
5. 90-112 days / 20 business days = 4.5-5.6 agents ✓
6. 4.5-5.6 × 1.30-1.35 = 5.85-7.56 ≈ 6-7 FTEs ✓
7. 500 × $600 = $300,000 ✓
8. 1,500 / 9,000 = 16.7% ≈ 17% ✓
9. 1,500 × $600 = $900,000 ✓
10. ($900K - $350-450K) / $350-450K = 100-157% ✓
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 3: Review Article 3 - reducingpatientchurninhealthcare.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/reducingpatientchurninhealthcare.md`

**Step 1: Verify key calculations**

```
1. 10 locations × 2,000 = 20,000 patients ✓
2. 20,000 × 15% = 3,000; 20,000 × 30% = 6,000 ✓
3. 3,000-6,000 × $4,000 = $12M-$24M ✓
4. Single location: 2,000 × 20% = 400 ✓
5. 400 × $4,000 = $1.6M ✓
6. 400 × $400 = $160,000 (stated as $1.6M total - verify)
7. 10-location: 4,000 × $4,000 = $16M ✓
8. 4,000 × $400 = $1.6M acquisition ✓
9. Net: $16M + $1.6M = $17.6M ✓
10. 20,000 × (85%-75%) = 2,000 additional patients ✓
11. 2,000 × $4,000 = $8M ✓
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 4: Review Article 4 - patient-reactivation-campaign-timeline.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/patient-reactivation-campaign-timeline.md`

**Step 1: Verify benchmark progressions**

```
- Response rates should increase: 8-12% → 14-18% → 18-22% → 20-25% → 22-28%
- Each range should overlap with previous (showing progression)
- Booking rate should be slightly higher than reactivation rate
- Reactivation = booking × show rate (typically 85-95%)
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 5: Review Article 5 - front-desk-recall-workflow.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/front-desk-recall-workflow.md`

**Step 1: Verify metrics**

```
- 80% pre-schedule acceptance → 60-80% reduced outreach volume (logical)
- Tracking targets consistency with stated claims
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 6: Review Article 6 - patient-recall-segmentation.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/patient-recall-segmentation.md`

**Step 1: Verify calculations**

```
1. 15 × $350 = $5,250 ✓
2. 28 × $350 = $9,800 ✓
3. Segment table: 24/50 = 48%, 22/75 = 29.3%, etc.
4. 48% / 10% = 4.8x (claim says 5x - minor rounding)
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 7: Review Article 7 - centralized-patient-recall-multi-location.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/centralized-patient-recall-multi-location.md`

**Step 1: Verify calculations**

```
1. 60,000 × 65% = 39,000 ✓
2. 60,000 × 82% = 49,200 ✓
3. 49,200 - 39,000 = 10,200 ✓
4. 10,200 × $300 = $3,060,000 ✓
5. 50,000 patients at 1:15K-20K ratio = 2.5-3.3 FTEs (digital)
6. At 1:8K-12K = 4.2-6.25 FTEs (phone)
7. Check 6.5 FTE claim against ratios
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 8: Review Article 8 - healthcare-operations-MA-integration.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/healthcare-operations-MA-integration.md`

**Step 1: Verify calculations**

```
1. 25,000 × 25% = 6,250 ✓
2. 25,000 × 10% = 2,500 ✓
3. 6,250 × $2,500 = $15,625,000 (check if $15.6M stated)
4. 2,500 × $2,500 = $6,250,000 ✓
5. $15.625M - $6.25M = $9.375M (check if $9.4M stated)
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 9: Review Article 9 - dso-patient-retention-strategy.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/dso-patient-retention-strategy.md`

**Step 1: Verify calculations**

```
1. 2,500 × 20 = 50,000 ✓
2. 50,000 × 20% = 10,000 ✓
3. 10,000 × $150 = $1.5M; 10,000 × $300 = $3M ✓
4. 5% improvement = 2,500 patients saved
5. 2,500 × $150-300 = $375K-$750K ✓
6. $500K × 8x = $4M ✓
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 10: Review Article 10 - multi-location-healthcare-EBITDA.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/multi-location-healthcare-EBITDA.md`

**Step 1: Verify calculations (extensive)**

```
1. Single $1M × 4x = $4M ✓
2. Small $2M × 5.5x = $11M ✓
3. Regional $5M × 8x = $40M ✓
4. Large $10M × 12x = $120M ✓
5. 15 × 3,000 = 45,000 ✓
6. 45,000 × $500 = $22.5M ✓
7. $22.5M × 18% = $4.05M ✓
8. $4.05M × 8x = $32.4M ✓
9. 45,000 × 25% = 11,250 ✓
10. 45,000 × 15% = 6,750 (improved attrition)
11. 11,250 - 6,750 = 4,500 patients saved ✓
12. 4,500 × $250 = $1,125,000 ✓
13. 4,500 × $75 = $337,500 ✓
14. 4,500 × $25 = $112,500 ✓
15. $1,125K + $337.5K + $112.5K = $1,575,000 ✓
16. $4.05M + $1.575M = $5.625M ✓
17. ($5.625M - $4.05M) / $4.05M = 38.9% ≈ 39% ✓
18. $5.625M × 9x = $50.625M ✓
19. $50.625M - $32.4M = $18.225M ✓
20. $18.225M / $32.4M = 56.3% ≈ 56% ✓
21. Provider: 1,500 × 40% = 600 ✓
22. 600 × $500 = $300,000 ✓
23. $300,000 × 20% = $60,000 ✓
24. $60,000 × 10x = $600,000 ✓
25. Mitigated: 1,500 × 20% = 300 ✓
26. 300 × $500 = $150,000 ✓
27. $150,000 × 20% = $30,000 ✓
28. $30,000 × 10x = $300,000 ✓
29. $600,000 - $300,000 = $300,000 ✓
30. ROI: 50,000 × 5% = 2,500 ✓
31. 2,500 × $500 = $1.25M ✓
32. $1.25M × 20% = $250,000 ✓
33. $250,000 × 10x = $2.5M ✓
34. $2.5M / $120K = 20.8x ✓
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 11: Review Article 11 - pe-backed-healthcare-operations.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/pe-backed-healthcare-operations.md`

**Step 1: Verify calculations**

```
1. $10M × 10x = $100M ✓
2. $10M × 12x = $120M ✓
3. $120M - $100M = $20M ✓
```

**Step 2: Check KPI targets for internal consistency**

**Step 3: Search for AI patterns**

**Step 4: Document findings**

---

## Task 12: Review Article 12 - optometry-network-operations-scale.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/optometry-network-operations-scale.md`

**Step 1: Verify scale-retention gap costs**

Check if gap costs scale proportionally with locations × retention gap × revenue

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 13: Review Article 13 - dental-group-acquisition-due-diligence.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/dental-group-acquisition-due-diligence.md`

**Step 1: Verify deal structure math**

```
1. 70-85% + 10-20% + 5-10% ≈ 100% ✓
2. $1.2M × 75% = $900K ✓
3. EBITDA -62%: Check $200K → $76K vs stated
4. Structure 2: $500K + $120K + $120K + $60K = $800K (not $900K?)
5. Structure 3: $850K - $50K - $40K - $35K = $725K ✓
6. Structure 4: $550K + $250K = $800K ✓
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 14: Review Article 14 - human-ai-hybrid-model-healthcare-intake.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/human-ai-hybrid-model-healthcare-intake.md`

**Step 1: Verify calculations**

```
1. 20 locations × 200 calls = 4,000 monthly ✓
2. 4,000 × $10 = $40,000; 4,000 × $15 = $60,000 ✓
3. AI 60-70% + Humans 30-40% = 100% ✓
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 15: Review Article 15 - healthcare-front-desk-staffing-crisis-2025.mdx

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/healthcare-front-desk-staffing-crisis-2025.mdx`

**Step 1: Verify calculations**

```
1. 15 × 3 = 45 staff ✓
2. 45 × 30% = 13.5 ≈ 14 departures ✓
3. 14 × $15,000 = $210,000 ✓
4. 14 × $26,000 = $364,000 ✓
5. 7 fewer × $20,000 = $140,000 ✓
6. 60 × 30% = 18 departures ✓
7. 18 × 50 = 900 days ✓
8. 18 × 90 × 50% = 810 days ✓
9. 900 + 810 = 1,710 ✓
10. 1,710 / 250 = 6.84 ≈ 7 FTE ✓
11. Wage: ($15.75-$14.50)/$14.50 = 8.6% ✓
12. Wage: ($17.25-$15.75)/$15.75 = 9.5% ✓
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 16: Review Article 16 - blog-spanish-speaking-agents.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/blog-spanish-speaking-agents.md`

**Step 1: Verify cited statistics**

Verify 41 million Spanish speakers claim against Pew Research

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 17: Review Article 17 - dso-case-study-15-location-missed-calls.md

**Files:**
- Review: `/mnt/d_drive/repos/mybcat-new/src/content/blog/dso-case-study-15-location-missed-calls.md`

**Step 1: Verify calculations**

```
1. (95-62)/62 = 53% improvement ✓
2. (42-8)/42 = 81% reduction ✓
3. (23-14)/14 = 64% increase ✓
4. (276-168)/168 = 64% increase ✓
5. $276K - $168K = $108K ✓
6. $108,000 / $4,200 = 25.7 ≈ 25:1 ✓
```

**Step 2: Search for AI patterns**

**Step 3: Document findings**

---

## Task 18: Compile All Findings

**Files:**
- Create: `/mnt/d_drive/repos/mybcat-new/docs/plans/review-findings.md`

**Step 1: Aggregate all issues found**

Create a structured document with:
- Article name
- Issue type (Math Error / Inconsistency / AI Pattern)
- Line number
- Current text
- Recommended fix
- Priority (Critical / Medium / Low)

**Step 2: Categorize by decision needed**

- **Auto-fix**: Clear math errors, em dash replacements
- **Review needed**: Claims that may need verification
- **No change**: Issues that are actually correct

---

## Task 19: Apply Corrections (After Approval)

**Files:**
- Modify: All articles with identified issues

**Step 1: Apply approved math corrections**

Use Edit tool to fix each calculation error.

**Step 2: Replace em dashes**

Run search-and-replace for em dashes with appropriate punctuation.

**Step 3: Replace overused phrases**

Replace flagged AI phrases with alternatives.

**Step 4: Commit changes**

```bash
git add src/content/blog/*.md src/content/blog/*.mdx
git commit -m "fix: correct numerical errors and remove AI writing patterns in blog posts

- Fixed calculation errors in case studies and ROI articles
- Replaced em dashes with appropriate punctuation
- Removed overused AI phrases (leverage, streamline, etc.)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Execution Timeline

| Phase | Tasks | Estimated Scope |
|-------|-------|-----------------|
| Phase 1 | Tasks 1-17 | Review all articles, document findings |
| Phase 2 | Task 18 | Compile findings, prioritize |
| Phase 3 | Task 19 | Apply approved corrections |

---

## Success Criteria

- All calculations verified (correct or flagged)
- All AI writing patterns identified
- Clear recommendations for each issue
- Changes applied only after user approval
