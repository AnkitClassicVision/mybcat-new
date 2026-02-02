---
title: "Patient Recall Segmentation: Who to Call First (and Why)"
seoTitle: "Patient Recall Segmentation: Prioritize Your Outreach"
description: "Not all dormant patients deserve equal effort. Learn how to segment your recall list by value, dormancy duration, and attrition risk to maximize ROI from your outreach resources."
seoDescription: "Patient recall segmentation framework for healthcare practices. Prioritize dormant patients by lifetime value, dormancy duration, and attrition risk for maximum reactivation ROI."
publishDate: '2026-02-24'
status: scheduled
scheduledDate: '2026-02-24'
author: Ankit Patel
category: Analytics
tags:
  - segmentation
  - patient recall
  - reactivation
  - analytics
featuredImage: /images/blog/patient-recall-segmentation.webp
canonical: https://mybcat.com/blog/patient-recall-segmentation/
cluster: recall-reactivation
relatedPosts:
  - reactivation-campaign-kpis
  - patient-reactivation-roi
  - dormant-patient-reactivation
---

A practice with 2,000 dormant patients cannot—and should not—treat them all the same. The patient who spent $3,000 annually and has been gone for 8 months is fundamentally different from the patient who came once three years ago for a basic exam. Effective recall segmentation ensures your limited outreach resources focus on the patients most likely to return and most valuable when they do. This guide provides the framework for segmenting your recall list and prioritizing your outreach.

## Why Segmentation Matters

Without segmentation, recall campaigns waste resources on low-probability, low-value patients while under-investing in high-probability, high-value ones:

**The math of unsegmented outreach:**
- 2,000 dormant patients
- Staff capacity: 500 calls/month
- Random calling reaches patients proportionally
- Result: Many calls to low-value, long-dormant patients
- Opportunity cost: High-value patients not reached

**The math of segmented outreach:**
- Same 2,000 dormant patients
- Segmented into priority tiers
- Top 500 (high-value, recently dormant) called first
- Result: Higher reactivation rate, higher revenue per reactivation
- ROI: 2-3x improvement over unsegmented

## The Three Segmentation Dimensions

Effective recall segmentation combines three primary dimensions:

### 1. Lifetime Value (LTV)

What is this patient worth to your practice over time?

**LTV calculation:**
```
LTV = Average Annual Revenue × Average Patient Tenure
```

**LTV tiers:**
| Tier | Annual Revenue | Estimated LTV | Priority |
|------|---------------|---------------|----------|
| High | $800+ | $4,000+ | Highest |
| Medium | $400-800 | $2,000-4,000 | High |
| Standard | $200-400 | $1,000-2,000 | Medium |
| Low | <$200 | <$1,000 | Lower |

**Indicators of high LTV:**
- Multiple services (exam + products/procedures)
- Frequent visits beyond minimum recall
- Family members also patients
- Insurance with good coverage
- History of accepting recommended treatment

### 2. Dormancy Duration

How long has it been since their last visit?

**Dormancy tiers:**
| Tier | Time Since Last Visit | Reactivation Probability | Priority |
|------|----------------------|-------------------------|----------|
| Recently dormant | 6-12 months | 25-35% | Highest |
| Moderately dormant | 12-18 months | 15-25% | High |
| Long dormant | 18-24 months | 10-15% | Medium |
| Very long dormant | 24+ months | 5-10% | Lower |

**Why recency matters:**
- Recent patients remember your practice
- Contact info more likely valid
- Life circumstances less likely to have changed dramatically
- Emotional connection to provider still exists

### 3. Attrition Risk

What is the likelihood this patient will never return without intervention?

**Risk indicators:**
| Factor | Higher Risk | Lower Risk |
|--------|-------------|------------|
| Age | Younger (more mobile) | Older (established) |
| Tenure before dormancy | Short (1-2 years) | Long (5+ years) |
| Last experience | Issue/complaint | Positive |
| Insurance status | Changed/lost | Stable |
| Geographic mobility | High-mobility area | Stable neighborhood |

**Risk scoring approach:**
Assign points for each risk factor, sum for total score:
- Age under 35: +2
- Tenure under 2 years: +2
- No-show in last 6 months before dormancy: +3
- Single visit only: +3
- Complaint on file: +4
- Changed insurance: +2

**Risk tiers:**
- 0-3 points: Low risk (likely to return eventually)
- 4-7 points: Medium risk (intervention helpful)
- 8+ points: High risk (urgent intervention needed)

## The Segmentation Matrix

Combine dimensions into a prioritization matrix:

### Priority Tier 1: High Value + Recently Dormant
- **Who:** Patients with high LTV, dormant 6-12 months
- **Why first:** Highest reactivation probability, highest return
- **Channel:** Phone call + personalized SMS
- **Investment level:** High (multiple attempts, escalation to provider)

### Priority Tier 2: High Value + Moderately Dormant
- **Who:** Patients with high LTV, dormant 12-18 months
- **Why second:** Still recoverable, high value worth extra effort
- **Channel:** Phone call + multi-touch SMS/email
- **Investment level:** High

### Priority Tier 3: Medium Value + Recently Dormant
- **Who:** Patients with medium LTV, dormant 6-12 months
- **Why third:** Good reactivation probability, decent value
- **Channel:** SMS/email sequence + phone for non-responders
- **Investment level:** Medium

### Priority Tier 4: High Value + Long Dormant
- **Who:** Patients with high LTV, dormant 18-24 months
- **Why fourth:** Value justifies effort despite lower probability
- **Channel:** Phone (personal touch needed) + direct mail
- **Investment level:** Medium-high

### Priority Tier 5: Medium Value + Moderately Dormant
- **Who:** Patients with medium LTV, dormant 12-18 months
- **Why fifth:** Reasonable probability and value
- **Channel:** SMS/email sequence + phone for high-risk
- **Investment level:** Medium

### Priority Tier 6: Standard Value + Any Duration
- **Who:** Standard LTV patients regardless of dormancy
- **Channel:** Automated SMS/email only
- **Investment level:** Low (automated outreach)

### Priority Tier 7: Low Value + Long Dormant
- **Who:** Low LTV, dormant 18+ months
- **Channel:** Automated SMS if contact info valid, otherwise skip
- **Investment level:** Minimal

## Implementing Segmentation

### Step 1: Extract and Calculate

Pull from your PM system:
- All patients with no visit in 6+ months
- Last visit date
- Total revenue in last 3 years
- Visit frequency before dormancy
- Contact information status

### Step 2: Calculate LTV Tier

For each patient:
```
Annual Revenue = Total Revenue / Years as Patient
LTV Estimate = Annual Revenue × 5 (average tenure)
Assign tier: High / Medium / Standard / Low
```

### Step 3: Calculate Dormancy Tier

For each patient:
```
Months Dormant = Today - Last Visit Date
Assign tier: Recently / Moderately / Long / Very Long
```

### Step 4: Calculate Risk Score

For each patient:
```
Sum risk factors based on available data
Assign tier: Low / Medium / High
```

### Step 5: Assign Priority Tier

Use the matrix to assign each patient to Priority Tier 1-7.

### Step 6: Validate and Adjust

Review segments for reasonableness:
- Are segment sizes workable?
- Does the prioritization feel right intuitively?
- Are any high-value patients in low-priority tiers incorrectly?

## Segmentation by Specialty

Different specialties may weight factors differently:

**Dental:**
- Emphasize hygiene frequency (2x/year patients are high value)
- Weight restorative treatment history heavily
- Consider family relationships (one dormant = family at risk)

**Optometry:**
- Annual exam is the baseline (dormant = 12+ months)
- Weight eyewear/contact lens purchases
- Consider vision plan status and benefit timing

**Medical/Primary Care:**
- Weight chronic condition management
- Consider preventive care compliance
- Factor in referral potential

## Dynamic Segmentation

Segments should update as circumstances change:

**Triggers for re-segmentation:**
- Patient responds to outreach (upgrade priority)
- Contact info bounces (note and adjust)
- Insurance change detected (re-evaluate risk)
- Time passes (dormancy tier changes)

**Quarterly refresh:**
- Re-run segmentation calculations
- Move patients between tiers as appropriate
- Archive permanently lost (multiple failed contacts)

## Resource Allocation by Segment

Match your resources to your segments:

| Priority Tier | Recommended Resource | Cost/Patient | Expected ROI |
|--------------|---------------------|--------------|--------------|
| 1 (High/Recent) | Dedicated caller | $5-8 | 50-100x |
| 2 (High/Moderate) | Dedicated caller | $5-8 | 40-80x |
| 3 (Med/Recent) | Hybrid (auto + phone) | $2-4 | 30-60x |
| 4 (High/Long) | Dedicated caller | $8-12 | 25-50x |
| 5 (Med/Moderate) | Hybrid | $2-4 | 20-40x |
| 6 (Standard) | Automated only | $0.50-1 | 15-30x |
| 7 (Low/Long) | Minimal auto | $0.25-0.50 | 10-20x |

## Multi-Location Considerations

For healthcare groups operating multiple sites:

**Standardize:**
- Segmentation criteria and thresholds
- Priority tier definitions
- Resource allocation guidelines

**Localize:**
- Calculate LTV using location-specific revenue
- Adjust for local demographics and mobility
- Account for location-specific service mix

**Aggregate for insights:**
- Compare segment distributions across locations
- Identify locations with higher dormancy rates
- Share best practices from high-performing sites

## Measuring Segmentation Effectiveness

Track these metrics by segment to validate your approach:

| Metric | Tier 1-2 Target | Tier 3-5 Target | Tier 6-7 Target |
|--------|----------------|-----------------|-----------------|
| Reactivation rate | 25-35% | 15-25% | 8-15% |
| Revenue per reactivation | $600+ | $400-600 | $200-400 |
| Cost per reactivation | $15-25 | $8-15 | $3-8 |
| Campaign ROI | 40-80x | 25-50x | 15-30x |

**If results do not match expectations:**
- Tier 1-2 underperforming: Check if LTV calculation is accurate
- Tier 6-7 overperforming: Consider moving threshold higher
- All tiers underperforming: Review messaging, not segmentation

## Key Takeaways

Patient recall segmentation ensures your limited resources focus on the highest-impact opportunities:

**The three dimensions:**
1. **Lifetime Value:** What the patient is worth
2. **Dormancy Duration:** How long they have been gone
3. **Attrition Risk:** How likely they are to be lost permanently

**Priority order:**
1. High value + recently dormant (25-35% reactivation, highest ROI)
2. High value + moderately dormant (still worth significant investment)
3. Medium value + recently dormant (good probability, decent value)
4. Continue through matrix based on value × probability

**Resource matching:**
- Tier 1-2: Phone calls with dedicated staff
- Tier 3-5: Hybrid approach (automated + phone backup)
- Tier 6-7: Automated only or minimal effort

**Refresh quarterly:** Segments shift as time passes and circumstances change.

The practices that excel at recall do not simply work harder—they work smarter by focusing their energy on the patients most likely to return and most valuable when they do.

For the metrics to track during segmented campaigns, see our [reactivation campaign KPIs guide](/blog/reactivation-campaign-kpis/). For ROI calculation by segment, review our [patient reactivation ROI guide](/blog/patient-reactivation-roi/).

<!-- MyBCAT CTA Section -->
<div style="background: linear-gradient(135deg, #0A1628 0%, #9B6B3F 100%); padding: 40px; border-radius: 12px; text-align: center; margin: 40px 0;">
  <h3 style="color: #ffffff; font-size: 28px; margin-bottom: 16px;">Need Help Segmenting and Prioritizing?</h3>
  <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin-bottom: 24px;">Multi-location healthcare groups partner with MyBCAT for data-driven segmentation and prioritized outreach that maximizes reactivation ROI.</p>
  <button onclick="if(typeof openHubSpotModal === 'function') { openHubSpotModal(); } else { window.location.href='https://hubspot.mybcat.com/meetings/ankit98/mybcat-discovery-call'; }" style="background: linear-gradient(135deg, #C49A6C 0%, #B17E4F 100%); color: white; padding: 14px 32px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em;">Schedule a Consultation Today</button>
</div>
<!-- End MyBCAT CTA Section -->

## Sources

- [SciSoft: Patient Segmentation](https://www.scnsoft.com/healthcare/patient-segmentation)
- [PMC: Population Segmentation in Healthcare](https://pmc.ncbi.nlm.nih.gov/articles/PMC7267007/)
- [Paubox: Implementing Data Segmentation in Healthcare](https://www.paubox.com/blog/implementing-data-segmentation-in-healthcare)
- [Alexander Group: Precision Targeting in Healthcare](https://www.alexandergroup.com/insights/precision-targeting-navigating-healthcare-markets-with-data-driven-segmentation/)
- [Johns Hopkins ACG: Guide to Quality Patient Segmentation](https://www.hopkinsacg.org/your-guide-to-quality-patient-segmentation/)
- [Deloitte: Healthcare Consumer Segmentation](https://www.deloitte.com/us/en/insights/industry/health-care/healthcare-consumer-patient-segmentation.html)
