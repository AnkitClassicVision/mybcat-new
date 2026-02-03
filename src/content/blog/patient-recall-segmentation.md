---
title: "Patient Recall Segmentation: Who to Call First (and Why)"
seoTitle: "Patient Recall Segmentation: Who to Call First (and Why)"
description: "Segment your recall list for maximum impact. Prioritization frameworks and criteria for deciding who gets called first."
seoDescription: "Patient recall segmentation and prioritization guide. Frameworks for deciding which patients to contact first based on value, recency, risk, and likelihood to respond."
publishDate: '2026-02-22'
status: scheduled
scheduledDate: '2026-02-22'
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
  - patient-reactivation-roi
  - reactivation-campaign-kpis
  - patient-recall-campaign-framework
---

When facing a recall list of 500 overdue patients, the instinct is to start at the top and work down alphabetically. This is one of the most common, and costly. Mistakes in patient recall. Not all patients are equal, and treating them as such wastes time on low-probability contacts while high-value opportunities slip away. Effective segmentation answers the fundamental question: who should we call first, and why?

## The Case for Segmentation

Recall outreach capacity is finite. Most practices can make 50-100 quality outreach attempts per day. With 500 overdue patients, that is a full week of work, and by week's end, some patients have become even harder to reach.

**The segmentation advantage:**

| Approach | Conversion Rate | Revenue/100 Contacts |
|----------|-----------------|---------------------|
| Alphabetical (random) | 12-15% | $4,200-5,250 |
| Recency-based | 18-22% | $6,300-7,700 |
| Value + Recency | 22-28% | $7,700-9,800 |
| Full prioritization | 25-32% | $8,750-11,200 |

**The math of prioritization:**
```
100 outreach attempts with random selection:
- Conversion: 15 patients scheduled
- Average revenue: $350
- Total: $5,250

100 outreach attempts with optimized segmentation:
- Conversion: 28 patients scheduled
- Average revenue: $350 (but higher-value mix)
- Total: $9,800+

Same effort, nearly double the result.
```

Segmentation is not about working harder. It is about working smarter.

## The Five Segmentation Dimensions

Effective recall segmentation considers five key dimensions:

### 1. Recency: When Did They Last Visit?

The most powerful predictor of recall success is how recently the patient was active.

**Recency tiers:**

| Tier | Months Since Visit | Contact Rate | Scheduling Rate |
|------|-------------------|--------------|-----------------|
| Just due | 6-12 months | 70-80% | 65-75% |
| Recently lapsed | 12-18 months | 55-65% | 45-55% |
| Dormant | 18-24 months | 40-50% | 25-35% |
| Long dormant | 24+ months | 25-35% | 12-20% |

**Recency rule:** Patients in the "just due" tier should always be prioritized over longer-lapsed patients, regardless of other factors.

### 2. Value: What Are They Worth?

Patient value varies significantly. High-value patients justify more outreach effort.

**Value calculation:**
```
Patient Value = Historical Revenue + Future Potential + Referral Value
```

**Value segmentation:**

| Segment | Characteristics | Priority Weight |
|---------|-----------------|-----------------|
| High value | $1,000+ annual spend, comprehensive care | 3x |
| Medium value | $400-1,000 annual, regular preventive | 2x |
| Low value | <$400 annual, infrequent, minimal treatment | 1x |

**Practical value indicators:**
- Treatment history (restorative, cosmetic, specialty)
- Insurance coverage (PPO vs. HMO vs. fee-for-service)
- Family connections (heads of household)
- Referral history

### 3. Engagement: How Do They Respond?

Past behavior predicts future behavior. Patients with strong engagement history respond better.

**Engagement indicators:**

| Signal | High Engagement | Low Engagement |
|--------|-----------------|----------------|
| Appointment history | Keeps appointments, rarely cancels | Frequent no-shows, late cancels |
| Communication response | Replies to texts, answers calls | Ignores outreach, changed numbers |
| Online activity | Uses patient portal, books online | No digital engagement |
| Payment behavior | Pays promptly, no collections | Outstanding balances, slow pay |

**Engagement scoring (0-10):**
- 8-10: Highly engaged, prioritize
- 5-7: Moderately engaged, standard priority
- 0-4: Low engagement, deprioritize or different approach

### 4. Risk: What Are the Clinical Implications?

Some patients have clinical reasons for more urgent recall.

**Risk factors for prioritization:**

| Condition | Recall Urgency | Prioritization |
|-----------|---------------|----------------|
| Periodontal disease (active) | 3-4 month | High |
| High caries risk | 4-6 month | High |
| Diabetic patient | 3-4 month | High |
| Post-treatment monitoring | Per treatment | High |
| Healthy, low risk | 6-12 month | Standard |

**Risk-based sequencing:**
Patients with clinical urgency may warrant outreach even if other factors are unfavorable, but balance with practical reachability.

### 5. Reachability: Can We Actually Contact Them?

Some patients are simply harder to reach. Factor this into prioritization.

**Reachability indicators:**

| Factor | High Reachability | Low Reachability |
|--------|-------------------|------------------|
| Contact info | Verified cell, responds to text | Landline only, old info |
| Contact history | Answers on first attempt | Never answers, no callback |
| Schedule flexibility | Flexible availability | Very limited windows |
| Location | Still in area | May have moved |

**Reachability rule:** A high-value patient you cannot reach is worth less than a medium-value patient who answers immediately.

## The Prioritization Matrix

Combine dimensions into a prioritization score:

### Basic Scoring Model

```
Priority Score = (Recency × 3) + (Value × 2) + (Engagement × 1.5) + 
                 (Risk × 1) + (Reachability × 1.5)

Where each dimension is scored 1-5:
- 5 = Highest priority indicator
- 1 = Lowest priority indicator
```

### Simplified Tier Assignment

For practices without sophisticated scoring systems, use this matrix:

**Tier 1 (Contact First):**
- 6-12 months overdue AND high/medium value
- Any recency with high clinical risk
- Previously engaged patients just coming due

**Tier 2 (Contact Second):**
- 12-18 months overdue, any value
- 6-12 months overdue, low value but high engagement
- Medium value, moderate engagement

**Tier 3 (Contact Third):**
- 18-24 months overdue
- Low engagement history
- Low value without mitigating factors

**Tier 4 (Contact Last or Alternative Channel):**
- 24+ months overdue
- No response to previous attempts
- Contact info likely outdated
- Consider: direct mail, email campaign, or archive

## Segmentation in Practice

### Step 1: Export and Clean Your List

Pull all patients due or overdue for recall:
- Include: Last visit date, total revenue, contact info, notes
- Clean: Remove deceased, moved, do-not-contact
- Verify: Check for updated contact information

### Step 2: Apply Segmentation Criteria

Create columns for each dimension and score or categorize:

| Patient | Recency | Value | Engagement | Risk | Reachability | Tier |
|---------|---------|-------|------------|------|--------------|------|
| Smith, J | 8 mo | High | High | Med | High | 1 |
| Jones, M | 14 mo | Med | Med | Low | Med | 2 |
| Brown, A | 22 mo | Low | Low | Low | Low | 4 |

### Step 3: Sort and Assign

Sort by tier, then within tier by secondary priority (usually value).

**Assignment distribution:**

| Week | Focus | Expected Yield |
|------|-------|----------------|
| Week 1 | Tier 1 (100 patients) | 25-32 scheduled |
| Week 2 | Tier 2 (150 patients) | 27-38 scheduled |
| Week 3 | Tier 3 (150 patients) | 22-30 scheduled |
| Week 4 | Tier 4 (100 patients) | 8-15 scheduled |

### Step 4: Tailor Approach by Segment

Different segments warrant different approaches:

| Tier | Primary Channel | Message Tone | Offer |
|------|-----------------|--------------|-------|
| 1 | Phone + SMS | Warm, personal | Convenience focus |
| 2 | SMS + Email | Friendly reminder | Value reminder |
| 3 | Email + SMS | Re-engagement | May include incentive |
| 4 | Email + Mail | Win-back | Incentive appropriate |

## Segment-Specific Messaging

### Tier 1: Just Due, High Value

```
SMS: "Hi [Name], it's time for your [cleaning/exam]! We have openings 
this week, Dr. [Name] is looking forward to seeing you. Reply with a 
good day/time and I'll confirm your appointment."

Tone: Personal, assumes they want to come, removes friction
```

### Tier 2: Recently Lapsed, Medium Value

```
SMS: "Hi [Name], we noticed it's been a while since your last visit 
at [Practice]. Regular [dental/eye] care helps catch small issues 
early. We have flexible scheduling. When works best for you?"

Tone: Gentle reminder, emphasizes value of preventive care
```

### Tier 3: Dormant, Lower Value

```
Email: "Hi [Name], we've missed seeing you at [Practice]! It's been 
[X months] since your last visit. Your oral health matters to us, 
and we'd love to help you get back on track. Click here to see 
available appointments."

Tone: We miss you, easy to respond
```

### Tier 4: Long Dormant, Low Engagement

```
Postcard: "We Miss You, [Name]! 
It's been too long since we've seen you at [Practice Name]. 
Schedule your appointment this month and receive [offer]. 
Call [number] or scan the QR code to book."

Tone: Win-back, incentive-driven, physical touchpoint
```

## Measuring Segmentation Effectiveness

Track performance by segment to refine your approach:

**Weekly segment performance:**

| Segment | Contacts | Responses | Scheduled | Rate | Revenue |
|---------|----------|-----------|-----------|------|---------|
| Tier 1 | 50 | 38 | 24 | 48% | $8,400 |
| Tier 2 | 75 | 42 | 22 | 29% | $7,700 |
| Tier 3 | 60 | 25 | 12 | 20% | $4,200 |
| Tier 4 | 40 | 10 | 4 | 10% | $1,400 |

**Insights from data:**
- Tier 1 converts at nearly 5x Tier 4. Prioritization is working
- Tier 2 volume justifies dedicated capacity given reasonable conversion
- Tier 4 may need different channel or be deprioritized further

## Common Segmentation Mistakes

### Mistake 1: Over-Complicating the Model

**Problem:** Analysis paralysis with 20 segmentation factors

**Fix:** Start with recency and value. These drive 80% of results. Add complexity only when basic model is working.

### Mistake 2: Static Segmentation

**Problem:** Segment once, never update

**Fix:** Re-segment monthly as patients move between tiers (recent → lapsed → dormant).

### Mistake 3: Ignoring Engagement History

**Problem:** Calling chronic no-shows before reliable patients

**Fix:** Weight engagement history (a medium-value engaged patient beats a high-value non-responder.

### Mistake 4: Same Approach for All Segments

**Problem:** Generic message to all patients regardless of segment

**Fix:** Tailor message, channel, and offer by segment characteristics.

## Key Takeaways

Effective recall segmentation prioritizes patients based on:

**Primary factors:**
- Recency (most predictive)
- Value (highest ROI)
- Engagement (likelihood to respond)

**Secondary factors:**
- Clinical risk (urgency)
- Reachability (practical contact probability)

**Implementation approach:**
1. Export and clean your list
2. Score or tier each patient
3. Sort by priority
4. Tailor outreach by segment
5. Track results and refine

**Expected outcomes with segmentation:**
- 50-100% improvement in conversion rates
- Higher revenue per outreach hour
- Better allocation of limited staff time
- More satisfied patients (right message, right time)

The question is not whether to do recall. It is who to recall first. Segmentation provides the answer.

For calculating the ROI of your reactivation efforts, see our [patient reactivation ROI guide](/blog/patient-reactivation-roi/). For the complete campaign framework, review our [patient recall campaign framework](/blog/patient-recall-campaign-framework/).

<!-- MyBCAT CTA Section -->
<div style="background: linear-gradient(135deg, #0A1628 0%, #9B6B3F 100%); padding: 40px; border-radius: 12px; text-align: center; margin: 40px 0;">
  <h3 style="color: #ffffff; font-size: 28px; margin-bottom: 16px;">Need Help Prioritizing Your Recall List?</h3>
  <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin-bottom: 24px;">Healthcare practices partner with MyBCAT for data-driven patient segmentation and prioritized recall outreach that maximizes every contact attempt.</p>
  <button onclick="if(typeof openHubSpotModal === 'function') { openHubSpotModal(); } else { window.location.href='https://hubspot.mybcat.com/meetings/ankit98/mybcat-discovery-call'; }" style="background: linear-gradient(135deg, #C49A6C 0%, #B17E4F 100%); color: white; padding: 14px 32px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em;">Schedule a Consultation Today</button>
</div>
<!-- End MyBCAT CTA Section -->

## Sources

- [Practice Numbers: Dental Recall Systems Strategies](https://practicenumbers.com/blog/dental-recall-systems-strategies/)
- [Axle: Patient Retention Strategies in Dentistry](https://meetaxle.com/blog/patient-retention-strategies-in-dentistry/)
- [Adit: Patient Retention Strategies Dental Recall](https://adit.com/patient-retention-strategies-dental-recall)
- [NexHealth: Dental Recall Software Systems](https://www.nexhealth.com/resources/dental-recall-software-systems)
- [Arini AI: Improve Patient Retention Recall Rate](https://www.arini.ai/blog/improve-patient-retention-recall-rate-dental-clinics)
- [Yapi: Dental Patient Communication System](https://yapiapp.com/blog/dental-patient-communication/sytem/)
- [Practice Analytics: Improving Patient Recall](https://practiceanalytics.com/improving-patient-recall-increases-practice-profitability/)

