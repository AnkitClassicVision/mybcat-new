# 08 — CONTENT PIPELINE REFERENCE

## Content Collection Schemas

All content is managed through Astro Content Collections with strict schema validation.

### Blog Post Schema

**Location:** `src/content/blog/*.mdx`

```yaml
---
# REQUIRED FIELDS
title: "How to Reduce No-Shows at Your Medical Practice"  # Max 70 chars
description: "Reduce no-shows with these 10 proven strategies including confirmation calls and automated reminders."  # Max 160 chars
author: "Author Name"  # Must match author in team data
date: 2025-01-15  # ISO date format
category: "Operations"  # One of: Operations, Growth, Technology, Industry
image: "/images/blog/no-shows.jpg"  # Path to featured image

# OPTIONAL FIELDS
updatedDate: 2025-01-20  # Date of last significant update
tags: ["no-shows", "scheduling", "patient experience"]  # Array of tags
imageAlt: "Medical practice scheduling calendar"  # Alt text for image
draft: false  # Set true to exclude from build
---
```

**Category Options:**
- `Operations` — Practice operations, workflows, staffing
- `Growth` — Patient acquisition, marketing, revenue
- `Technology` — EHR, software, automation, AI
- `Industry` — Vertical-specific content, trends

### Case Study Schema

**Location:** `src/content/case-studies/*.mdx`

```yaml
---
# REQUIRED FIELDS
title: "How Vision Plus Optometry Increased Appointments by 42%"
client: "Vision Plus Optometry"  # Client/practice name
industry: "optometry"  # Must match industry slug
challenge: "Missing 30% of calls during peak hours, inconsistent scheduling across 3 locations"
solution: "mybcat patient intake and recall services with centralized dashboard"
date: 2024-11-01
image: "/images/case-studies/vision-plus.jpg"

# REQUIRED: At least 3 metrics
metrics:
  - label: "Call Answer Rate"
    value: "100%"
  - label: "More Booked Appointments"
    value: "+42%"
  - label: "Recovered Revenue (Year 1)"
    value: "$180K"

# OPTIONAL
testimonial:
  quote: "mybcat transformed our front office operations."
  author: "Dr. Sarah Chen"
  role: "Owner, Vision Plus Optometry"
---
```

**Industry Options:**
- `optometry`
- `dental`
- `veterinary`
- `medspa`
- `dermatology`
- `urgent-care`
- `ent`

### Glossary Term Schema

**Location:** `src/content/glossary/*.mdx`

```yaml
---
# REQUIRED FIELDS
term: "Patient Acquisition"  # The term being defined
definition: "The process of attracting new patients to a healthcare practice through marketing, referrals, and operational excellence."  # Max 200 chars

# OPTIONAL FIELDS
relatedTerms: ["patient-retention", "patient-recall", "no-show-rate"]  # Slugs of related terms
relatedSolutions: ["patient-intake", "recall-reactivation"]  # Slugs of related solutions
---
```

### FAQ Data Schema

**Location:** `src/content/faq/*.json`

```json
{
  "category": "General",
  "questions": [
    {
      "question": "Is mybcat HIPAA compliant?",
      "answer": "Yes, mybcat is fully HIPAA compliant. All patient coordinators complete annual HIPAA training, and we sign Business Associate Agreements (BAAs) with every client."
    },
    {
      "question": "How quickly can mybcat start handling our calls?",
      "answer": "Most practices are fully onboarded within 2-3 weeks. This includes EHR/PMS integration setup, training on your specific protocols, and a soft launch period."
    }
  ]
}
```

---

## Content Authoring Guidelines

### Writing for Answer-Friendliness

**TL;DR / Answer Capsule Pattern:**

Every significant page should have a TL;DR within the first 100 words that directly answers the primary question a user might have.

```mdx
**TL;DR:** mybcat's patient intake service ensures every call is answered by a 
trained healthcare coordinator who books appointments directly into your EHR. 
We handle inbound calls, schedule appointments, collect patient information, 
and verify insurance—so your front desk can focus on patients in the office.
```

**Requirements:**
- 40-60 words
- Direct, factual answer
- Complete sentences
- No promotional fluff
- Placed immediately after H1

### Heading Structure

**Blog Posts:**
```
H1: Main Title (only one)
  H2: Major Section 1
    H3: Subsection (if needed)
  H2: Major Section 2
    H3: Subsection
  H2: Conclusion / Key Takeaways
  H2: FAQ (optional)
```

**Landing Pages:**
```
H1: Page Title
  H2: Problem/Challenge
  H2: Solution/How It Works
  H2: Results/Outcomes
  H2: Best For / Use Cases
  H2: FAQ
  H2: CTA
```

**Rules:**
- Only ONE H1 per page
- H2s should be scannable (user understands page from H2s alone)
- Never skip levels (H1 → H3 without H2)
- Question format works well for H2s ("How does patient intake work?")

### Internal Linking

**Minimum Links per Content Type:**
- Blog posts: 5 internal links
- Case studies: 5 internal links
- Glossary terms: 5 internal links
- Solution/Industry pages: 15 internal links

**Linking Best Practices:**
```mdx
<!-- GOOD: Descriptive, contextual -->
Learn more about our [patient intake service](/solutions/patient-intake/) 
and how it reduces missed calls.

<!-- BAD: Generic anchor text -->
Learn more about patient intake [here](/solutions/patient-intake/).

<!-- GOOD: Link glossary terms inline -->
Improving your [patient acquisition](/glossary/patient-acquisition/) rate 
starts with answering every call.
```

### Statistics and Data

**Always cite sources:**
```mdx
According to a recent study, 87% of patients who reach voicemail never call back.
^[Source: [Healthcare Call Study 2024](https://example.com/study)]

<!-- Or inline -->
The average practice loses $100,000+ annually to missed calls (Source: AMA 2024).
```

**Use stat callout components:**
```mdx
import StatCard from '@components/content/StatCard.astro';

<StatCard value="87%" label="of patients never call back after reaching voicemail" />
```

---

## MDX Components

### Available Components for Blog/Content

```mdx
---
# At the top of your MDX file, import needed components
---

import Callout from '@components/content/Callout.astro';
import TipBox from '@components/content/TipBox.astro';
import StatCard from '@components/content/StatCard.astro';
import Quote from '@components/content/Quote.astro';
import KeyTakeaways from '@components/content/KeyTakeaways.astro';

## Using Components

<Callout type="info">
  This is an informational callout.
</Callout>

<Callout type="warning">
  This is a warning callout.
</Callout>

<Callout type="tip">
  This is a tip callout.
</Callout>

<TipBox title="Pro Tip">
  Confirmation calls 24-48 hours before appointments reduce no-shows by 30%.
</TipBox>

<StatCard 
  value="87%" 
  label="of patients never call back" 
/>

<Quote 
  text="mybcat transformed our front office operations."
  author="Dr. Sarah Chen"
  role="Owner, Vision Plus Optometry"
/>

<KeyTakeaways items={[
  "No-shows cost the average practice $150,000+ annually",
  "Confirmation calls reduce no-shows by 30%",
  "Automated reminders are more consistent than manual calls"
]} />
```

### Table Component

For comparison tables and data:

```mdx
| Feature | mybcat | Competitors |
|---------|--------|-------------|
| Pricing Model | Outcome-based | Hourly |
| Management | Fully managed | You manage |
| Technology | AI + Human | Human only |
```

Tables are automatically styled with Tailwind Typography.

---

## Content Quality Rules

### Minimum Word Counts

| Content Type | Minimum Words | Target Words |
|--------------|---------------|--------------|
| Blog Post | 1,500 | 2,000-2,500 |
| Case Study | 800 | 1,000-1,200 |
| Glossary Term | 300 | 400-500 |
| Solution Page | 1,200 | 1,500-1,800 |
| Industry Page | 1,200 | 1,500-1,800 |
| Comparison Page | 1,500 | 2,000-2,500 |

### Required Elements

**Blog Posts Must Include:**
- [ ] Key Takeaways box at top
- [ ] At least 3 statistics with sources
- [ ] At least 5 internal links
- [ ] At least 1 image (featured image minimum)
- [ ] Author bio at bottom
- [ ] Related posts section
- [ ] CTA section

**Case Studies Must Include:**
- [ ] Challenge section with specifics
- [ ] Solution section with details
- [ ] At least 3 quantified metrics
- [ ] Testimonial quote (if available)
- [ ] Industry tag for filtering
- [ ] CTA to relevant solution/demo

**Glossary Terms Must Include:**
- [ ] Clear definition (first paragraph)
- [ ] Detailed explanation
- [ ] Examples or use cases
- [ ] Related terms links
- [ ] Related solutions links

### Content Quality Checklist

Before publishing any content:

- [ ] Title under 70 characters
- [ ] Meta description under 160 characters
- [ ] H1 includes primary keyword
- [ ] TL;DR within first 100 words
- [ ] Proper heading hierarchy (no skipped levels)
- [ ] At least 3 internal links
- [ ] All images have alt text
- [ ] Statistics have sources cited
- [ ] No broken links
- [ ] Spell check passed
- [ ] Grammar check passed
- [ ] Mobile preview looks good
- [ ] Schema validates
- [ ] Lighthouse SEO score 90+

---

## Content Governance

### Keyword Assignment

**Rule:** Each primary keyword assigned to ONE page only.

Maintain a keyword tracking spreadsheet:

| Primary Keyword | Assigned URL | Secondary Keywords | Status |
|-----------------|--------------|-------------------|--------|
| optometry answering service | /industries/optometry/ | eye care phone service | Active |
| reduce no-shows | /blog/reduce-no-shows/ | appointment reminders | Active |
| mybcat vs hello rache | /compare/vs-hello-rache/ | hello rache alternative | Active |

Before creating new content:
1. Check if keyword already targeted
2. If overlap exists, differentiate or consolidate
3. Update tracking spreadsheet

### Content Refresh Cadence

**Quarterly Audit:**
- [ ] Identify pages with declining traffic (>20% YoY)
- [ ] Check for outdated statistics
- [ ] Update old screenshots
- [ ] Add new internal links
- [ ] Refresh meta descriptions
- [ ] Update schema if needed

**Triggers for Immediate Refresh:**
- Industry changes or new regulations
- Competitor changes mentioned in content
- New services or features added
- Customer feedback about outdated info

### Thin Content Policy

**Definition:** Pages with insufficient depth or value

**Indicators:**
- Under minimum word count
- High bounce rate (>80%)
- Low time on page (<30 seconds)
- No unique information
- Duplicate of other page

**Actions:**
1. **Expand:** Add more depth, examples, data
2. **Merge:** Combine with related page
3. **Redirect:** 301 to better page
4. **Remove:** 410 if no value

### Cannibalization Prevention

**Monthly Check:**
1. Export top pages from Google Search Console
2. Look for multiple pages ranking for same query
3. Identify if they're competing or complementary
4. Take action:
   - Different intent? Keep both, differentiate
   - Same intent? Merge or consolidate
   - Update internal linking to support primary page

---

## Content Workflow

### New Blog Post Process

1. **Planning**
   - Check keyword map for assignment
   - Research competing content
   - Outline with H2 structure

2. **Writing**
   - Create MDX file with frontmatter
   - Write content following guidelines
   - Add internal links
   - Add images

3. **Review**
   - Run quality checklist
   - Check Lighthouse SEO score
   - Validate schema
   - Preview on staging

4. **Publishing**
   - Merge to main branch
   - Verify deployed correctly
   - Submit to Google Search Console
   - Share on social channels

### Content Update Process

1. **Identify** page needing update
2. **Document** what's changing
3. **Update** content
4. **Update** `updatedDate` in frontmatter
5. **Verify** all links still work
6. **Deploy** and verify

---

## Image Guidelines

### Image Requirements

| Use Case | Dimensions | Format | Max Size |
|----------|------------|--------|----------|
| Blog featured | 1200 x 630 | WebP/JPG | 200KB |
| OG images | 1200 x 630 | JPG | 200KB |
| Inline blog | 800 x auto | WebP | 100KB |
| Team photos | 400 x 400 | WebP/JPG | 50KB |
| Icons | 64 x 64 | SVG | 5KB |

### Image Optimization

```bash
# Optimize images before adding
# Use squoosh.app or similar

# Or use imagemagick
convert input.jpg -resize 1200x630 -quality 80 output.jpg
```

### Alt Text Guidelines

```mdx
<!-- GOOD: Descriptive -->
![Patient coordinator using dashboard to schedule appointments](/images/blog/dashboard.jpg)

<!-- BAD: Not descriptive -->
![Image](/images/blog/dashboard.jpg)

<!-- BAD: Keyword stuffed -->
![Best medical answering service patient scheduling software dashboard](/images/blog/dashboard.jpg)
```

---

## SEO Content Brief Template

Use this template when planning new content:

```markdown
# Content Brief: [Topic]

## Target Keyword
Primary: [main keyword]
Secondary: [related keywords]

## Search Intent
[Informational / Commercial / Transactional]

## Target URL
/blog/[slug]/ or /[section]/[page]/

## Competing Content
- [URL 1] - [word count] - [key topics covered]
- [URL 2] - [word count] - [key topics covered]

## Content Outline
H1: [Title]
  H2: [Section 1]
  H2: [Section 2]
  ...

## Required Elements
- [ ] Key takeaways
- [ ] [X] statistics with sources
- [ ] [X] internal links to: [pages]
- [ ] FAQ section: [Y/N]
- [ ] CTA to: [page]

## Target Word Count
[X,XXX words]

## Notes
[Any specific requirements or research]
```

---

## Content Templates

### Blog Post Template

```mdx
---
title: "[Primary Keyword]: [Benefit/Hook]"
description: "[Action verb] [topic] with [solution]. Learn [what reader will learn] in this comprehensive guide."
author: "Author Name"
date: 2025-01-20
category: "Operations"
tags: ["tag1", "tag2", "tag3"]
image: "/images/blog/[slug].jpg"
imageAlt: "[Descriptive alt text]"
draft: false
---

import KeyTakeaways from '@components/content/KeyTakeaways.astro';
import Callout from '@components/content/Callout.astro';

<KeyTakeaways items={[
  "Takeaway 1 - specific, actionable",
  "Takeaway 2 - specific, actionable",
  "Takeaway 3 - specific, actionable",
  "Takeaway 4 - specific, actionable"
]} />

[Opening paragraph that hooks reader and establishes the problem. 2-3 sentences.]

[TL;DR paragraph that directly answers the main question. 40-60 words.]

In this guide, we'll cover:
- [Topic 1]
- [Topic 2]
- [Topic 3]

## [H2: First Major Section]

[Content with examples, data, and actionable advice]

<Callout type="stat">
  [Statistic with source]
</Callout>

### [H3: Subsection if needed]

[More detail]

## [H2: Second Major Section]

[Content]

## [H2: Continue with remaining sections]

[Content]

## Conclusion

[Summary of key points and action items]

## FAQ

### [Question 1]?

[Answer]

### [Question 2]?

[Answer]

---

**Ready to [achieve outcome]?** mybcat can help. [Link to relevant solution or demo].
```
