# 03 — PAGE TEMPLATES REFERENCE

## Template Overview

This document defines the structure, content blocks, and semantic HTML for every page type on mybcat.com. Each template is designed to be:
- **Answer-friendly:** Easy for AI/LLMs to extract information
- **SEO-optimized:** Proper heading hierarchy and semantic markup
- **Conversion-focused:** Clear CTAs and trust signals
- **Consistent:** Reusable patterns across the site

---

## Common Elements (All Pages)

### Document Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- SEO Meta -->
  <title>{Page Title} | mybcat</title>
  <meta name="description" content="{Meta description 150-160 chars}">
  <link rel="canonical" href="https://mybcat.com{path}/">
  
  <!-- Open Graph -->
  <meta property="og:title" content="{Page Title}">
  <meta property="og:description" content="{Meta description}">
  <meta property="og:image" content="https://mybcat.com/images/og/{page}.jpg">
  <meta property="og:url" content="https://mybcat.com{path}/">
  <meta property="og:type" content="website">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{Page Title}">
  <meta name="twitter:description" content="{Meta description}">
  
  <!-- Schema (JSON-LD) -->
  <script type="application/ld+json">
    {schema_json}
  </script>
</head>
<body>
  <header>
    <nav>{navigation}</nav>
  </header>
  
  <main>
    {page_content}
  </main>
  
  <footer>
    {footer_content}
  </footer>
</body>
</html>
```

### Breadcrumb Component

```html
<nav aria-label="Breadcrumb" class="breadcrumb">
  <ol itemscope itemtype="https://schema.org/BreadcrumbList">
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/">
        <span itemprop="name">Home</span>
      </a>
      <meta itemprop="position" content="1">
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <a itemprop="item" href="/industries/">
        <span itemprop="name">Industries</span>
      </a>
      <meta itemprop="position" content="2">
    </li>
    <li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
      <span itemprop="name">Optometry</span>
      <meta itemprop="position" content="3">
    </li>
  </ol>
</nav>
```

### CTA Button Patterns

```html
<!-- Primary CTA -->
<a href="/contact/" class="btn btn-primary">
  Book a Demo
</a>

<!-- Secondary CTA -->
<a href="/pricing/" class="btn btn-secondary">
  View Pricing
</a>

<!-- Ghost CTA -->
<a href="/how-it-works/" class="btn btn-ghost">
  Learn More →
</a>
```

### FAQ Accordion Component

```html
<section class="faq-section">
  <h2>Frequently Asked Questions</h2>
  
  <div class="faq-list" itemscope itemtype="https://schema.org/FAQPage">
    <details itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
      <summary itemprop="name">Is mybcat HIPAA compliant?</summary>
      <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
        <p itemprop="text">
          Yes, mybcat is fully HIPAA compliant. All patient coordinators complete 
          annual HIPAA training, and we sign Business Associate Agreements (BAAs) 
          with every client. Our systems use encrypted communications and secure 
          data handling protocols.
        </p>
      </div>
    </details>
    
    <details itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
      <summary itemprop="name">How quickly can mybcat start handling our calls?</summary>
      <div itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
        <p itemprop="text">
          Most practices are fully onboarded within 2-3 weeks. This includes 
          EHR/PMS integration setup, training on your specific protocols, and 
          a soft launch period to ensure quality.
        </p>
      </div>
    </details>
  </div>
</section>
```

---

## Homepage Template

**URL:** `/`
**Goal:** Convert aware visitors, establish positioning
**Word Count:** 1,500-2,500

### Structure

```html
<main>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <h1>Stop Losing Patients to Voicemail</h1>
      <p class="hero-subtitle">
        mybcat is a patient acquisition platform that ensures 100% of calls 
        are answered, appointments are booked, and your schedule stays full—
        without adding to your payroll.
      </p>
      <div class="hero-ctas">
        <a href="/contact/" class="btn btn-primary">Book a Demo</a>
        <a href="/how-it-works/" class="btn btn-secondary">See How It Works</a>
      </div>
      <div class="social-proof-bar">
        <span>Trusted by 70+ healthcare practices</span>
        <div class="client-logos"><!-- logos --></div>
      </div>
    </div>
    <div class="hero-media">
      <!-- Dashboard screenshot or illustration -->
    </div>
  </section>

  <!-- Problem Section -->
  <section class="problem">
    <h2>Your Front Desk Is Costing You Patients</h2>
    <p class="lead">
      87% of patients who reach voicemail never call back. For the average 
      practice, that's over $100,000 in lost revenue every year.
    </p>
    <div class="problem-stats">
      <div class="stat">
        <span class="stat-value">87%</span>
        <span class="stat-label">of patients don't leave voicemails</span>
      </div>
      <div class="stat">
        <span class="stat-value">$100K+</span>
        <span class="stat-label">lost annually to missed calls</span>
      </div>
      <div class="stat">
        <span class="stat-value">23%</span>
        <span class="stat-label">average no-show rate</span>
      </div>
    </div>
  </section>

  <!-- Solution Overview -->
  <section class="solution">
    <h2>A Complete Patient Acquisition System</h2>
    <p>
      mybcat combines trained patient coordinators, AI automation, and 
      real-time analytics into one managed platform.
    </p>
    <div class="solution-cards">
      <div class="card">
        <h3>Professional Live Agents</h3>
        <p>
          Healthcare-trained coordinators who book appointments, handle 
          inquiries, and represent your practice professionally.
        </p>
      </div>
      <div class="card">
        <h3>24/7 AI Backup</h3>
        <p>
          Intelligent automation captures overflow calls and after-hours 
          inquiries so you never miss a patient.
        </p>
      </div>
      <div class="card">
        <h3>Practice Intelligence Dashboard</h3>
        <p>
          Real-time visibility into call metrics, booking rates, and 
          team performance across all locations.
        </p>
      </div>
      <div class="card">
        <h3>Proactive Patient Outreach</h3>
        <p>
          Recall campaigns, no-show recovery, and reactivation programs 
          that fill your schedule automatically.
        </p>
      </div>
    </div>
    <a href="/how-it-works/" class="btn btn-ghost">See How It Works →</a>
  </section>

  <!-- Differentiation Section -->
  <section class="differentiation">
    <h2>Why mybcat Is Different</h2>
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Feature</th>
          <th>mybcat</th>
          <th>VA Agencies</th>
          <th>Call Centers</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Pricing Model</td>
          <td>Outcome-based</td>
          <td>Hourly ($9-15/hr)</td>
          <td>Per-minute</td>
        </tr>
        <tr>
          <td>Management</td>
          <td>Fully managed</td>
          <td>You manage</td>
          <td>Limited oversight</td>
        </tr>
        <tr>
          <td>Technology</td>
          <td>AI + Human hybrid</td>
          <td>Human only</td>
          <td>Basic systems</td>
        </tr>
        <tr>
          <td>Healthcare Focus</td>
          <td>100% healthcare</td>
          <td>Generalist</td>
          <td>Multi-industry</td>
        </tr>
        <tr>
          <td>Quality Assurance</td>
          <td>Built-in QA</td>
          <td>None</td>
          <td>Basic</td>
        </tr>
      </tbody>
    </table>
    <a href="/compare/" class="btn btn-ghost">Compare All Options →</a>
  </section>

  <!-- Industries Section -->
  <section class="industries">
    <h2>Built for Healthcare Specialties</h2>
    <div class="industry-grid">
      <a href="/industries/optometry/" class="industry-card">
        <h3>Optometry</h3>
      </a>
      <a href="/industries/dental/" class="industry-card">
        <h3>Dental</h3>
      </a>
      <a href="/industries/veterinary/" class="industry-card">
        <h3>Veterinary</h3>
      </a>
      <a href="/industries/medspa/" class="industry-card">
        <h3>Medspa</h3>
      </a>
      <a href="/industries/dermatology/" class="industry-card">
        <h3>Dermatology</h3>
      </a>
      <a href="/industries/urgent-care/" class="industry-card">
        <h3>Urgent Care</h3>
      </a>
    </div>
  </section>

  <!-- Social Proof Section -->
  <section class="testimonials">
    <h2>Results That Speak</h2>
    <div class="testimonial-carousel">
      <blockquote>
        <p>
          "We went from missing 30% of calls to answering every single one. 
          Our schedule is fuller than ever."
        </p>
        <footer>
          <cite>Dr. Smith, Vision Plus Optometry</cite>
        </footer>
      </blockquote>
    </div>
    <div class="results-metrics">
      <div class="metric">
        <span class="metric-value">100%</span>
        <span class="metric-label">Call Answer Rate</span>
      </div>
      <div class="metric">
        <span class="metric-value">45%</span>
        <span class="metric-label">Increase in Booked Appointments</span>
      </div>
    </div>
    <a href="/case-studies/" class="btn btn-ghost">Read Case Studies →</a>
  </section>

  <!-- Pricing Preview -->
  <section class="pricing-preview">
    <h2>Transparent, Outcome-Based Pricing</h2>
    <p>
      No hidden fees. No long-term contracts. Pay for results, not hours.
    </p>
    <a href="/pricing/" class="btn btn-primary">View Pricing</a>
  </section>

  <!-- FAQ Section -->
  <section class="faq">
    <h2>Common Questions</h2>
    <!-- 4-6 FAQ items with schema -->
  </section>

  <!-- Final CTA -->
  <section class="final-cta">
    <h2>Ready to Fill Your Schedule?</h2>
    <p>
      See how mybcat can recover lost revenue and grow your practice.
    </p>
    <a href="/contact/" class="btn btn-primary">Book Your Demo</a>
  </section>
</main>
```

### H-Tag Structure

```
H1: Stop Losing Patients to Voicemail
  H2: Your Front Desk Is Costing You Patients
  H2: A Complete Patient Acquisition System
    H3: Professional Live Agents
    H3: 24/7 AI Backup
    H3: Practice Intelligence Dashboard
    H3: Proactive Patient Outreach
  H2: Why mybcat Is Different
  H2: Built for Healthcare Specialties
  H2: Results That Speak
  H2: Transparent, Outcome-Based Pricing
  H2: Common Questions
  H2: Ready to Fill Your Schedule?
```

---

## Solution Page Template

**URL:** `/solutions/[solution-slug]/`
**Goal:** Explain capability, drive demo booking
**Word Count:** 1,200-1,800

### Structure

```html
<main>
  <!-- Breadcrumb -->
  <nav aria-label="Breadcrumb">...</nav>

  <!-- Hero -->
  <section class="hero">
    <h1>Patient Intake & Scheduling: Never Miss Another New Patient Call</h1>
    
    <!-- TL;DR Block (Answer Capsule) -->
    <div class="tldr">
      <p>
        <strong>TL;DR:</strong> mybcat's patient intake service ensures every 
        call is answered by a trained healthcare coordinator who books 
        appointments directly into your EHR. We handle inbound calls, schedule 
        appointments, collect patient information, and verify insurance—so your 
        front desk can focus on patients in the office.
      </p>
    </div>
    
    <a href="/contact/" class="btn btn-primary">Book a Demo</a>
  </section>

  <!-- Problem Section -->
  <section class="problem">
    <h2>Why Are You Losing New Patients?</h2>
    <p>
      When your front desk is juggling check-ins, phone calls, and paperwork, 
      something has to give. Usually, it's the phone.
    </p>
    <ul class="problem-list">
      <li>Patients call during busy periods and reach voicemail</li>
      <li>Staff rushes calls to handle the in-office queue</li>
      <li>New patient inquiries get lower priority than existing patients</li>
      <li>After-hours calls go unanswered entirely</li>
    </ul>
    <div class="stat-callout">
      <p><strong>The cost:</strong> The average practice loses $100,000+ annually to missed and mishandled calls.</p>
    </div>
  </section>

  <!-- How It Works -->
  <section class="how-it-works">
    <h2>How Patient Intake Works</h2>
    <ol class="process-steps">
      <li>
        <h3>Step 1: Call Routing</h3>
        <p>
          Calls to your practice line are routed to mybcat's patient 
          coordinator team, either for all calls or overflow only.
        </p>
      </li>
      <li>
        <h3>Step 2: Professional Greeting</h3>
        <p>
          Our coordinators answer as your practice, following your scripts 
          and protocols exactly.
        </p>
      </li>
      <li>
        <h3>Step 3: Appointment Booking</h3>
        <p>
          Using your EHR/PMS system, we book appointments in real-time 
          based on your availability and scheduling rules.
        </p>
      </li>
      <li>
        <h3>Step 4: Information Collection</h3>
        <p>
          We collect patient demographics, insurance information, and 
          reason for visit—saving your staff time at check-in.
        </p>
      </li>
      <li>
        <h3>Step 5: Confirmation & Follow-up</h3>
        <p>
          Patients receive appointment confirmations, and you get 
          real-time visibility into all activity via your dashboard.
        </p>
      </li>
    </ol>
  </section>

  <!-- Outcomes Section -->
  <section class="outcomes">
    <h2>Results You Can Expect</h2>
    <div class="outcome-cards">
      <div class="outcome">
        <span class="outcome-value">100%</span>
        <span class="outcome-label">Call Answer Rate</span>
        <p>Every call answered by a live person during business hours.</p>
      </div>
      <div class="outcome">
        <span class="outcome-value">40%+</span>
        <span class="outcome-label">More Booked Appointments</span>
        <p>Clients typically see 30-50% increase in scheduled visits.</p>
      </div>
      <div class="outcome">
        <span class="outcome-value">Zero</span>
        <span class="outcome-label">Voicemail Black Holes</span>
        <p>No more missed opportunities from unanswered calls.</p>
      </div>
    </div>
  </section>

  <!-- Use Cases -->
  <section class="use-cases">
    <h2>Best For Practices That...</h2>
    <ul>
      <li>Miss calls during peak hours due to front desk overwhelm</li>
      <li>Struggle to hire and retain quality front desk staff</li>
      <li>Want to capture after-hours and weekend inquiries</li>
      <li>Are growing and need scalable intake infrastructure</li>
      <li>Have multiple locations needing consistent call handling</li>
    </ul>
  </section>

  <!-- Testimonial -->
  <section class="testimonial">
    <blockquote>
      <p>
        "Before mybcat, we were missing about 25% of our calls. Now every 
        call is answered, and we've seen a 40% increase in new patient 
        appointments."
      </p>
      <footer>
        <cite>— Dr. Johnson, Premier Eye Care (3 locations)</cite>
      </footer>
    </blockquote>
  </section>

  <!-- Related Solutions -->
  <section class="related-solutions">
    <h2>Works Well With</h2>
    <div class="solution-cards">
      <a href="/solutions/recall-reactivation/" class="card">
        <h3>Recall & Reactivation</h3>
        <p>Proactive outreach to bring dormant patients back.</p>
      </a>
      <a href="/solutions/no-show-recovery/" class="card">
        <h3>No-Show Recovery</h3>
        <p>Same-day rebooking for missed appointments.</p>
      </a>
    </div>
  </section>

  <!-- FAQ -->
  <section class="faq">
    <h2>Patient Intake FAQ</h2>
    <!-- 3-5 solution-specific questions -->
  </section>

  <!-- CTA -->
  <section class="cta">
    <h2>See Patient Intake in Action</h2>
    <p>Schedule a demo to see how we can transform your practice's phone operations.</p>
    <a href="/contact/" class="btn btn-primary">Book Your Demo</a>
  </section>
</main>
```

### H-Tag Structure

```
H1: [Solution Name]: [Outcome Promise]
  H2: Why Are You [Problem Statement]?
  H2: How [Solution] Works
    H3: Step 1: [Step Name]
    H3: Step 2: [Step Name]
    H3: Step 3: [Step Name]
    ...
  H2: Results You Can Expect
  H2: Best For Practices That...
  H2: Works Well With
    H3: [Related Solution 1]
    H3: [Related Solution 2]
  H2: [Solution] FAQ
  H2: See [Solution] in Action
```

### TL;DR Pattern (Answer Capsule)

Every solution page must include a TL;DR block immediately after the H1. This is the "answer capsule" that AI systems will extract.

**Requirements:**
- 40-60 words
- Answers "What is this service?"
- Includes key benefit
- Factual, not promotional
- Uses complete sentences

**Example:**
```html
<div class="tldr">
  <p>
    <strong>TL;DR:</strong> mybcat's patient intake service ensures every 
    call is answered by a trained healthcare coordinator who books 
    appointments directly into your EHR. We handle inbound calls, schedule 
    appointments, collect patient information, and verify insurance—so your 
    front desk can focus on patients in the office.
  </p>
</div>
```

---

## Industry Landing Page Template

**URL:** `/industries/[industry-slug]/`
**Goal:** Convert industry-specific prospects
**Word Count:** 1,200-1,800

### Structure

```html
<main>
  <!-- Breadcrumb -->
  <nav aria-label="Breadcrumb">...</nav>

  <!-- Hero -->
  <section class="hero">
    <h1>Optometry Patient Acquisition & Intake Services</h1>
    
    <!-- TL;DR Block -->
    <div class="tldr">
      <p>
        <strong>TL;DR:</strong> mybcat helps optometry practices capture every 
        patient call, book more comprehensive exams, and improve optical sales 
        through professional intake and recall services. We integrate with 
        Eyefinity, RevolutionEHR, and other major optometry systems.
      </p>
    </div>
    
    <!-- Industry-Specific Stat -->
    <div class="industry-stat">
      <p>The average optometry practice loses <strong>$127,000 annually</strong> to missed calls and no-shows.</p>
    </div>
    
    <a href="/contact/" class="btn btn-primary">Book a Demo</a>
  </section>

  <!-- Industry Challenges -->
  <section class="challenges">
    <h2>Challenges Facing Optometry Practices</h2>
    <div class="challenge-list">
      <div class="challenge">
        <h3>Annual Exam Recall</h3>
        <p>
          Patients need yearly exams but often forget to schedule. Without 
          proactive outreach, practices lose patients to competitors.
        </p>
      </div>
      <div class="challenge">
        <h3>High-Value Optical Sales</h3>
        <p>
          Missed calls mean missed opportunities for frame and contact lens 
          sales, which often exceed exam revenue.
        </p>
      </div>
      <div class="challenge">
        <h3>Insurance Complexity</h3>
        <p>
          Vision plans vary widely. Improper verification leads to billing 
          issues and patient dissatisfaction.
        </p>
      </div>
      <div class="challenge">
        <h3>After-Hours Inquiries</h3>
        <p>
          Many patients call after work hours. Practices without coverage 
          lose these potential bookings.
        </p>
      </div>
    </div>
  </section>

  <!-- Why mybcat for This Industry -->
  <section class="solution-fit">
    <h2>Why mybcat for Optometry</h2>
    <ul class="benefits">
      <li>
        <strong>Optometry-trained coordinators</strong> who understand 
        comprehensive exams, contact lens fits, and optical purchases
      </li>
      <li>
        <strong>Integration with major systems:</strong> Eyefinity, 
        RevolutionEHR, Crystal PM, and more
      </li>
      <li>
        <strong>Annual recall campaigns</strong> that bring patients back 
        for exams and capture optical sales
      </li>
      <li>
        <strong>Insurance verification</strong> for VSP, EyeMed, and all 
        major vision plans
      </li>
      <li>
        <strong>Multi-location support</strong> for optometry groups with 
        centralized visibility
      </li>
    </ul>
  </section>

  <!-- Case Study Snippet -->
  <section class="case-study">
    <h2>Optometry Success Story</h2>
    <div class="case-study-card">
      <h3>Vision Plus Optometry (3 Locations)</h3>
      <p><strong>Challenge:</strong> Missing 30% of calls, inconsistent scheduling across locations</p>
      <p><strong>Solution:</strong> mybcat patient intake + recall services</p>
      <div class="results">
        <div class="result">
          <span class="value">100%</span>
          <span class="label">Call Answer Rate</span>
        </div>
        <div class="result">
          <span class="value">42%</span>
          <span class="label">More Booked Exams</span>
        </div>
        <div class="result">
          <span class="value">$180K</span>
          <span class="label">Recovered Revenue (Year 1)</span>
        </div>
      </div>
      <a href="/case-studies/vision-plus/" class="btn btn-ghost">Read Full Case Study →</a>
    </div>
  </section>

  <!-- Testimonial -->
  <section class="testimonial">
    <blockquote>
      <p>
        "mybcat understands optometry. They handle our calls like they're 
        part of our team, and the recall campaigns have been a game-changer 
        for our annual exam numbers."
      </p>
      <footer>
        <cite>— Dr. Sarah Chen, EyeCare Associates</cite>
      </footer>
    </blockquote>
  </section>

  <!-- FAQ -->
  <section class="faq">
    <h2>Optometry FAQ</h2>
    <!-- Industry-specific questions -->
    <!-- "Does mybcat work with Eyefinity?" -->
    <!-- "Can you handle contact lens orders?" -->
    <!-- "Do your coordinators understand vision insurance?" -->
  </section>

  <!-- CTA -->
  <section class="cta">
    <h2>Ready to Grow Your Optometry Practice?</h2>
    <p>See how mybcat helps optometry practices fill their schedules and increase optical sales.</p>
    <a href="/contact/" class="btn btn-primary">Book Your Demo</a>
  </section>
</main>
```

---

## Comparison Page Template

**URL:** `/compare/vs-[competitor]/`
**Goal:** Capture comparison searches, differentiate
**Word Count:** 1,500-2,500

### Structure

```html
<main>
  <!-- Breadcrumb -->
  <nav aria-label="Breadcrumb">...</nav>

  <!-- Hero -->
  <section class="hero">
    <h1>mybcat vs Hello Rache: Which Is Right for Your Practice?</h1>
    
    <!-- TL;DR Block -->
    <div class="tldr">
      <p>
        <strong>Bottom line:</strong> Hello Rache provides hourly virtual 
        assistants you manage yourself, while mybcat is a fully managed 
        patient acquisition platform with AI automation and outcome-based 
        pricing. Choose Hello Rache for budget-conscious practices that can 
        manage VAs. Choose mybcat for practices that want turnkey operations 
        and guaranteed results.
      </p>
    </div>
    
    <!-- Jump Links -->
    <nav class="jump-links">
      <a href="#comparison">Quick Comparison</a>
      <a href="#pricing">Pricing</a>
      <a href="#features">Features</a>
      <a href="#verdict">Verdict</a>
    </nav>
  </section>

  <!-- Quick Comparison Table -->
  <section id="comparison" class="quick-comparison">
    <h2>At a Glance</h2>
    <table>
      <thead>
        <tr>
          <th>Factor</th>
          <th>mybcat</th>
          <th>Hello Rache</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Pricing Model</td>
          <td>Outcome-based (per result)</td>
          <td>Hourly ($9.50/hr)</td>
        </tr>
        <tr>
          <td>Management</td>
          <td>Fully managed</td>
          <td>You manage</td>
        </tr>
        <tr>
          <td>Technology</td>
          <td>AI + Human hybrid</td>
          <td>Human only</td>
        </tr>
        <tr>
          <td>Dashboard</td>
          <td>Real-time analytics</td>
          <td>Basic reporting</td>
        </tr>
        <tr>
          <td>Best For</td>
          <td>Practices wanting turnkey operations</td>
          <td>Budget-conscious practices with management capacity</td>
        </tr>
      </tbody>
    </table>
  </section>

  <!-- What Is mybcat -->
  <section class="overview-mybcat">
    <h2>What Is mybcat?</h2>
    <p>
      mybcat is a patient acquisition platform that combines trained patient 
      coordinators, AI automation, and real-time analytics into a fully 
      managed service. Practices pay for outcomes (booked appointments, 
      answered calls) rather than hours worked.
    </p>
    <p>
      Key features include 24/7 AI backup, multi-location dashboards, 
      proactive recall campaigns, and no-show recovery services.
    </p>
  </section>

  <!-- What Is Competitor -->
  <section class="overview-competitor">
    <h2>What Is Hello Rache?</h2>
    <p>
      Hello Rache is a virtual assistant staffing service that provides 
      trained Filipino healthcare VAs at $9.50 per hour. VAs work remotely 
      and can handle tasks like scheduling, phone answering, and 
      administrative work.
    </p>
    <p>
      Practices are responsible for training, managing, and supervising 
      their VA. Hello Rache provides initial training and placement but 
      ongoing management falls to the practice.
    </p>
  </section>

  <!-- Detailed Comparisons -->
  <section id="pricing" class="comparison-detail">
    <h2>Pricing Comparison</h2>
    <h3>mybcat Pricing</h3>
    <p>
      mybcat uses outcome-based pricing, meaning you pay for results rather 
      than time. Pricing varies based on call volume and services selected. 
      Most practices see positive ROI within the first month.
    </p>
    
    <h3>Hello Rache Pricing</h3>
    <p>
      Hello Rache charges $9.50 per hour for VA services. For a full-time 
      VA (40 hours/week), that's approximately $1,520/month plus any 
      additional software or training costs.
    </p>
    
    <h3>Cost Analysis</h3>
    <table>
      <tr>
        <td>Full-time VA (Hello Rache)</td>
        <td>~$1,520/month</td>
      </tr>
      <tr>
        <td>Your management time (10 hrs/week @ $50/hr)</td>
        <td>~$2,000/month</td>
      </tr>
      <tr>
        <td>Total effective cost</td>
        <td>~$3,520/month</td>
      </tr>
    </table>
    <p>
      While Hello Rache appears cheaper on paper, the hidden cost of 
      management time often makes it comparable to or more expensive than 
      managed solutions.
    </p>
  </section>

  <section class="comparison-detail">
    <h2>Service Model Comparison</h2>
    <!-- Detailed breakdown -->
  </section>

  <section class="comparison-detail">
    <h2>Technology Comparison</h2>
    <!-- Dashboard, AI, integrations -->
  </section>

  <!-- Pros and Cons -->
  <section class="pros-cons">
    <h2>mybcat Pros and Cons</h2>
    <div class="pros">
      <h3>Pros</h3>
      <ul>
        <li>Fully managed—no training or supervision required</li>
        <li>AI backup ensures 24/7 coverage</li>
        <li>Outcome-based pricing aligns incentives</li>
        <li>Real-time dashboard with multi-location support</li>
        <li>Built-in QA and performance monitoring</li>
      </ul>
    </div>
    <div class="cons">
      <h3>Cons</h3>
      <ul>
        <li>Higher upfront cost than hourly VAs</li>
        <li>Less control over individual staff</li>
        <li>Focused on patient acquisition (not general admin)</li>
      </ul>
    </div>
    
    <h2>Hello Rache Pros and Cons</h2>
    <div class="pros">
      <h3>Pros</h3>
      <ul>
        <li>Very affordable hourly rate ($9.50/hr)</li>
        <li>Direct control over your VA</li>
        <li>Can handle diverse administrative tasks</li>
        <li>Flexible hours based on your needs</li>
      </ul>
    </div>
    <div class="cons">
      <h3>Cons</h3>
      <ul>
        <li>You're responsible for management and training</li>
        <li>No AI backup or automation</li>
        <li>Limited visibility and analytics</li>
        <li>Single point of failure if VA is unavailable</li>
        <li>Time zone differences may affect availability</li>
      </ul>
    </div>
  </section>

  <!-- Verdict -->
  <section id="verdict" class="verdict">
    <h2>Which Should You Choose?</h2>
    
    <h3>Choose mybcat if:</h3>
    <ul>
      <li>You want a fully managed solution with no training overhead</li>
      <li>You need 24/7 coverage including AI backup</li>
      <li>You want outcome-based pricing tied to results</li>
      <li>You have multiple locations needing consistent service</li>
      <li>You value real-time analytics and visibility</li>
    </ul>
    
    <h3>Choose Hello Rache if:</h3>
    <ul>
      <li>You're highly budget-conscious and comfortable managing staff</li>
      <li>You want direct control over your VA's work</li>
      <li>You need a generalist VA for varied administrative tasks</li>
      <li>You have time to train and supervise remote staff</li>
    </ul>
  </section>

  <!-- FAQ -->
  <section class="faq">
    <h2>mybcat vs Hello Rache FAQ</h2>
    <!-- Comparison-specific questions -->
  </section>

  <!-- CTA -->
  <section class="cta">
    <h2>See mybcat in Action</h2>
    <p>Schedule a demo to see how mybcat compares for your specific needs.</p>
    <a href="/contact/" class="btn btn-primary">Book Your Demo</a>
  </section>
</main>
```

---

## Blog/Article Template

**URL:** `/blog/[slug]/`
**Goal:** Capture search traffic, educate, nurture
**Word Count:** 1,500-3,000

### Structure

```html
<article>
  <!-- Breadcrumb -->
  <nav aria-label="Breadcrumb">...</nav>

  <!-- Header -->
  <header class="article-header">
    <h1>How to Reduce No-Shows at Your Medical Practice: 10 Proven Strategies</h1>
    <div class="article-meta">
      <span class="author">By <a href="/about/team/author-name/">Author Name</a></span>
      <time datetime="2025-01-15">January 15, 2025</time>
      <span class="read-time">8 min read</span>
    </div>
    <img src="/images/blog/no-shows-featured.jpg" alt="Medical practice scheduling" class="featured-image">
  </header>

  <!-- Key Takeaways Box -->
  <aside class="key-takeaways">
    <h2>Key Takeaways</h2>
    <ul>
      <li>No-shows cost the average practice $150,000+ annually</li>
      <li>Confirmation calls 24-48 hours before reduce no-shows by 30%</li>
      <li>Automated reminders are more consistent than manual calls</li>
      <li>Same-day rebooking can recover 40% of missed appointments</li>
      <li>A no-show policy alone won't solve the problem—proactive outreach does</li>
    </ul>
  </aside>

  <!-- Introduction -->
  <section class="intro">
    <p>
      No-shows are one of the most frustrating problems in medical practice 
      management. When patients don't show up, you lose revenue, waste staff 
      time, and miss opportunities to help patients who need care.
    </p>
    <p>
      In this guide, we'll cover 10 proven strategies to reduce no-shows, 
      from simple reminder systems to advanced rebooking techniques used 
      by high-performing practices.
    </p>
  </section>

  <!-- Table of Contents (for long posts) -->
  <nav class="toc">
    <h2>Table of Contents</h2>
    <ol>
      <li><a href="#strategy-1">Strategy 1: Confirmation Calls</a></li>
      <li><a href="#strategy-2">Strategy 2: Automated Reminders</a></li>
      <!-- ... -->
    </ol>
  </nav>

  <!-- Body Content -->
  <section id="strategy-1">
    <h2>1. Implement Confirmation Calls 24-48 Hours Before</h2>
    <p>
      The most effective single tactic for reducing no-shows is a personal 
      confirmation call 24-48 hours before the appointment...
    </p>
    <!-- Detailed content -->
  </section>

  <section id="strategy-2">
    <h2>2. Use Automated Text and Email Reminders</h2>
    <p>...</p>
  </section>

  <!-- Continue with remaining strategies -->

  <!-- Conclusion -->
  <section class="conclusion">
    <h2>Conclusion: Build a No-Show Prevention System</h2>
    <p>
      Reducing no-shows isn't about implementing one tactic—it's about 
      building a system that combines confirmation, reminders, rebooking, 
      and ongoing optimization...
    </p>
  </section>

  <!-- Optional FAQ -->
  <section class="faq">
    <h2>FAQ: Reducing No-Shows</h2>
    <!-- 2-3 questions if relevant -->
  </section>

  <!-- Author Bio -->
  <aside class="author-bio">
    <img src="/images/team/author.jpg" alt="Author Name">
    <div>
      <h3>About the Author</h3>
      <p>
        <strong>Author Name</strong> is [role] at mybcat with [X] years of 
        experience in healthcare operations...
      </p>
    </div>
  </aside>

  <!-- Related Posts -->
  <section class="related-posts">
    <h2>Related Articles</h2>
    <div class="post-grid">
      <a href="/blog/patient-recall-best-practices/" class="post-card">
        <h3>Patient Recall Best Practices for Healthcare Practices</h3>
      </a>
      <!-- 2 more related posts -->
    </div>
  </section>

  <!-- CTA -->
  <section class="cta">
    <h2>Struggling with No-Shows?</h2>
    <p>
      mybcat's no-show recovery service can help you fill cancelled 
      appointments and reduce missed revenue.
    </p>
    <a href="/solutions/no-show-recovery/" class="btn btn-primary">Learn More</a>
  </section>
</article>
```

---

## Glossary Term Template

**URL:** `/glossary/[term]/`
**Goal:** SEO authority, education
**Word Count:** 300-600

### Structure

```html
<article class="glossary-term">
  <!-- Breadcrumb -->
  <nav aria-label="Breadcrumb">
    Home > Glossary > Patient Acquisition
  </nav>

  <h1>What Is Patient Acquisition?</h1>
  
  <!-- Definition (Answer Capsule) -->
  <div class="definition">
    <p>
      <strong>Patient acquisition</strong> is the process of attracting new 
      patients to a healthcare practice through marketing, referrals, and 
      operational excellence. It encompasses all activities from initial 
      awareness through booking a first appointment.
    </p>
  </div>

  <!-- Detailed Explanation -->
  <section>
    <h2>Patient Acquisition Explained</h2>
    <p>
      For healthcare practices, patient acquisition involves multiple 
      touchpoints: online presence, phone handling, appointment booking, 
      and the initial patient experience...
    </p>
  </section>

  <!-- Examples/Use Cases -->
  <section>
    <h2>Examples of Patient Acquisition Activities</h2>
    <ul>
      <li>Search engine optimization to appear in "dentist near me" searches</li>
      <li>Answering phone calls promptly and professionally</li>
      <li>Following up on web form inquiries within minutes</li>
      <li>Referral programs that incentivize current patients</li>
      <li>Recall campaigns to reactivate dormant patients</li>
    </ul>
  </section>

  <!-- Related Terms -->
  <section class="related-terms">
    <h2>Related Terms</h2>
    <ul>
      <li><a href="/glossary/patient-retention/">Patient Retention</a></li>
      <li><a href="/glossary/patient-recall/">Patient Recall</a></li>
      <li><a href="/glossary/no-show-rate/">No-Show Rate</a></li>
    </ul>
  </section>

  <!-- Related Solutions -->
  <section class="related-solutions">
    <h2>How mybcat Helps with Patient Acquisition</h2>
    <p>
      mybcat's <a href="/solutions/patient-intake/">patient intake service</a> 
      ensures every call is answered and every inquiry becomes a booked 
      appointment.
    </p>
    <a href="/solutions/patient-intake/" class="btn btn-ghost">Learn More →</a>
  </section>
</article>
```

---

## Content Quality Rules (All Templates)

### Thin Content Prevention

**Minimum Word Counts:**
- Homepage: 1,500 words
- Solution pages: 1,200 words
- Industry pages: 1,200 words
- Comparison pages: 1,500 words
- Blog posts: 1,500 words
- Case studies: 800 words
- Glossary terms: 300 words

### Required Elements by Page Type

| Page Type | Stats | Testimonial | FAQ | Case Study | CTA |
|-----------|-------|-------------|-----|------------|-----|
| Homepage | ✅ | ✅ | ✅ | ✅ | ✅ |
| Solution | ✅ | ✅ | ✅ | Optional | ✅ |
| Industry | ✅ | ✅ | ✅ | ✅ | ✅ |
| Comparison | Optional | Optional | ✅ | Optional | ✅ |
| Blog | ✅ | Optional | Optional | Optional | ✅ |
| Case Study | ✅ | ✅ | Optional | N/A | ✅ |
| Glossary | Optional | ❌ | ❌ | ❌ | ✅ |

### Internal Linking Minimums

| Page Type | Minimum Internal Links |
|-----------|----------------------|
| Homepage | 20 |
| Solution | 15 |
| Industry | 15 |
| Comparison | 10 |
| Blog | 5 |
| Case Study | 5 |
| Glossary | 5 |
