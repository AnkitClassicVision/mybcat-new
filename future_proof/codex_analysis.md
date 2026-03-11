---
title: "robots.txt — MyBCAT (discoverability on, training off)"
description: "robots.txt — MyBCAT (discoverability on, training off)"
---

I’ll (1) pull the key ideas from your friend’s spec, (2) sanity‑check what’s changed in the AI-crawling world since then, and (3) give you an updated, prioritized implementation guide for mybcat.com with concrete files/snippets and a verification checklist.

I created a clean, dev-ready markdown spec you can hand to your developer, with updated 2026 bot rules, llms.txt templates, and schema recommendations. I’ll now summarize the key changes from your friend’s spec and the top priorities for mybcat.com.

Thought for 22m 48s

I’m going to (1) tear down what’s in your spec-ai-optimization.md, (2) compare it to what the major AI/search crawlers actually do today, and (3) give you a MyBCAT-specific, copy/paste-ready playbook (robots, llms, schema, content patterns, and validation).

1) Your friend’s spec: what’s solid, what’s outdated, what’s missing

Your spec file is basically: robots.txt + llms.txt + JSON‑LD (FAQ, Organization, WebSite, breadcrumbs, articles, book/chapter, software app) with an Astro implementation plan. 

spec-ai-optimization

Here’s my blunt take:

Spec item	What’s good	The problem	What to do instead (2026-ready)
robots.txt with a long allowlist of AI bots	It’s better than accidentally blocking crawlers.	It’s redundant (if User-agent: * Allow: / is there). Also it treats “AI” as one thing, but it’s actually 3 different behaviors: search indexing, training, and user‑initiated fetchers.	Decide policy by category: Search bots = allow, Training bots = your call, User fetchers may ignore robots anyway, so robots isn’t your only lever. OpenAI explicitly separates search (OAI‑SearchBot) vs training (GPTBot).
llms.txt	Great idea. Low effort, upside.	It’s a proposal (not universal), and many sites now pair it with llms-full.txt or “.md” versions for clean extraction. llms.txt itself recommends .md mirrors.	Publish /llms.txt + optionally /llms-full.txt. Add clean markdown endpoints for your most important pages (even if it’s just a simplified “/md/…” version).
FAQPage + BreadcrumbList JSON‑LD	Helpful for machine understanding.	Good, but incomplete: for a service business, you want Organization + WebSite + WebPage + Service + Offer consistently, plus sameAs, contactPoint, and stable @id graph linking.	Use an @graph that ties everything together. Add Service schema per solution page; add FAQPage where there’s actual FAQ content; add BreadcrumbList sitewide.
“ChatGPT‑User” in robots	Looks nice on paper.	OpenAI’s own crawler doc says ChatGPT‑User is user‑initiated and robots.txt rules may not apply. So relying on that rule is wishful thinking.	Focus robots policy on OAI‑SearchBot (search visibility) + GPTBot (training). Treat user fetchers separately (WAF/IP controls, auth, or meta/noindex depending on what you want).
No mention of WAF / bot protection	—	This is where most “AI visibility” breaks. If you run Cloudflare/Bot Fight/JS challenges, crawlers get blocked even if robots allows them. OpenAI and Perplexity both explicitly mention allowing their IP ranges.	Add a WAF allow rule: match official UA AND official IP ranges. (Don’t just whitelist by UA; that’s spoofable.)
No mention of “AI features” controls	—	Sometimes you want visibility but not full snippet reuse, or you want to keep certain pages out. Google and OpenAI both point to noindex/nosnippet controls.	Use noindex for pages you never want surfaced. Use nosnippet/max-snippet style controls when you want indexing but limited reuse.
2) Quick MyBCAT snapshot (based on your live site)

Good news: MyBCAT is already structurally better than most “AI optimized” sites because your pages are dense with real text, not just fluff.

Strong positives I can see right now:

You have an HTML sitemap at /sitemap/ that lists major sections (solutions, industries, case studies, resources, glossary, legal).

Many key pages start with a TL;DR, which is exactly how LLMs and agents want to ingest content (fast summary → details). Example: Integrations + Solutions pages.

You have “trust” content (HIPAA, security controls) in plain text, which is critical for LLM trust + enterprise buyers.

Likely gaps (or at least “unknowns”)

I can’t confirm from the tooling whether you currently have a working /robots.txt or an XML sitemap like /sitemap.xml (search engines often don’t index robots.txt so it doesn’t show up in search). So assume you need to create or fix them.

I also can’t confirm how your WAF/CDN treats AI crawlers. That’s often the silent killer.

3) The updated 2026 playbook to make AI agents “see” MyBCAT
The core truth (don’t skip this)

“AI optimization” isn’t magic tags. It’s mostly:

Can they fetch it? (robots + WAF + rendering)

Can they understand it fast? (clean structure, summaries, schema, markdown, stable URLs)

Do they trust it? (sources for stats, clear entity info, authors, compliance)

Can they cite it? (pages with crisp claims + obvious canonical URLs)

Everything below ladders up to those four.

4) Step-by-step roadmap (MyBCAT-specific)
Phase 1 — “Make sure bots can actually reach you” (high impact, low effort)
A) Robots policy (split: Search vs Training vs User fetchers)

OpenAI is explicit:

OAI‑SearchBot → affects whether you show in ChatGPT search results

GPTBot → training crawler

ChatGPT‑User → user-initiated; robots may not apply

Anthropic and Perplexity are similar: they separate training bots, search bots, and user fetchers.

So you need to choose a stance:

Option 1 (my default recommendation): Visibility-first, training-optional

Allow search bots so you’re discoverable everywhere.

Decide training bots based on IP/strategy.

Option 2: Visibility-first, training-blocked

This is what many businesses do: you still show up in AI search and citations, but you’re not donating content for training.

Also note: Google-Extended and Applebot-Extended are controls about AI training usage, not “normal search indexing.” They don’t affect traditional search inclusion.

B) WAF / bot protection: the “hidden” requirement

Both OpenAI and Perplexity explicitly say you may need to allow requests from their published IP ranges (not just user-agent) to ensure access.

Strong opinion: if you run Cloudflare/AWS WAF/etc and you’re serious about AI visibility, you must implement “Verified bot allow rules” for:

OpenAI (OAI‑SearchBot + GPTBot IP ranges)

Perplexity (PerplexityBot IP ranges)

Google/Bing (already standard)

Applebot (Apple notes rendering can fail if you block JS/CSS resources)

Phase 2 — “Give agents a clean map” (llms.txt + XML sitemap)
A) Add /llms.txt

The llms.txt proposal is specifically meant to help LLMs use your site at inference time, because real sites are noisy and context windows are limited.

B) Add /llms-full.txt (optional but very useful)

Many docs sites now publish a “full” variant (example: AppDirect explicitly documents llms.txt vs llms-full.txt).
And some ecosystems (like MCP docs) even publish a giant llms-full.txt for deep indexing.

For MyBCAT: llms.txt should be curated; llms-full.txt can include all solutions + industries + comparisons + trust pages + key blog categories.

C) Add an XML sitemap (not just HTML)

Your HTML sitemap is nice, but crawlers and indexing pipelines are built around XML sitemaps. (This is still SEO 101, and it matters to AI too because many AI systems piggyback on search indexes.)

Phase 3 — “Make the content machine-legible” (Schema + page patterns)
A) Schema that matters for MyBCAT

For a service company like yours, prioritize:

Organization + WebSite (homepage)

WebPage (all core pages, via @graph)

Service (each solution page)

Offer (pricing page; only if you show real pricing)

FAQPage (FAQ page and any page with real FAQs)

BreadcrumbList (sitewide)

Article (blog posts)

PodcastSeries / PodcastEpisode (podcast)

Book (your book page)

This is the same spirit as your friend’s spec (FAQ + breadcrumbs + org), but adapted to your business model. 

spec-ai-optimization

B) Content patterns that LLMs actually parse well

You’re already doing this with TL;DR.
Make it consistent everywhere:

Recommended template for each solution page:

TL;DR (2–4 sentences)

Who it’s for (bullets)

What we do (bullets)

What we don’t do (bullets — reduces confusion)

Integrations (explicit list)

Compliance/security (short)

Implementation timeline (short)

FAQs (5–10)

Proof (case studies, testimonials)

CTA

This is “GEO/LLMO” in real life: reduce ambiguity, make claims explicit, and make them easy to quote.

5) Copy/paste templates for MyBCAT
A) Robots.txt templates
Template 1: “Discoverability everywhere, training blocked”

Use this if you want AI search visibility without donating content to training.

# robots.txt — MyBCAT (discoverability on, training off)

User-agent: *
Allow: /

# --- OpenAI ---
# Search visibility in ChatGPT: allow OAI-SearchBot
User-agent: OAI-SearchBot
Allow: /

# Training: block GPTBot (optional policy choice)
User-agent: GPTBot
Disallow: /

# --- Anthropic ---
# Search indexing: allow Claude-SearchBot
User-agent: Claude-SearchBot
Allow: /

# Training: block ClaudeBot (optional policy choice)
User-agent: ClaudeBot
Disallow: /

# --- Perplexity ---
# Search visibility: allow PerplexityBot
User-agent: PerplexityBot
Allow: /

# --- Google / Apple training controls (optional) ---
# Google-Extended controls Gemini training/grounding usage (not Search ranking)
User-agent: Google-Extended
Disallow: /

# Applebot-Extended controls Apple AI training usage (not search inclusion)
User-agent: Applebot-Extended
Disallow: /

# --- Sitemap(s) ---
Sitemap: https://mybcat.com/sitemap.xml
# If you use a sitemap index:
Sitemap: https://mybcat.com/sitemap-index.xml


Why this is sane:

OpenAI says OAI‑SearchBot controls search inclusion, GPTBot controls training.

Google-Extended is a “standalone product token” for training/grounding usage and “does not impact” Search inclusion/ranking.

Applebot-Extended is about training usage and doesn’t crawl pages itself.

Template 2: “Max everything”

Use this if your strategy is “I want AI to train on us too.”

# robots.txt — MyBCAT (max visibility)

User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

Sitemap: https://mybcat.com/sitemap.xml
Sitemap: https://mybcat.com/sitemap-index.xml


Important nuance: User-initiated fetchers may ignore robots. OpenAI explicitly notes robots.txt may not apply to ChatGPT‑User because it’s user-initiated. Perplexity says similarly for Perplexity‑User. Anthropic provides separate controls for Claude‑User as well.

So robots is necessary, but it’s not the whole story.

B) A MyBCAT /llms.txt draft (curated, high-signal)

This is designed for “What is MyBCAT, what do they do, where are the authoritative pages?”

# My Business Care Team (MyBCAT)

> My Business Care Team (MyBCAT) provides centralized patient access operations for healthcare practices and multi-location groups. We handle inbound calls, scheduling, intake, recalls, and front-desk workflows with direct EHR/PMS scheduling and HIPAA-aligned processes.

## Start here (core)
- Home: https://mybcat.com/
- How it works: https://mybcat.com/how-it-works/
- Pricing: https://mybcat.com/pricing/
- Contact: https://mybcat.com/contact/
- FAQ: https://mybcat.com/faq/

## Solutions (what we do)
- Medical Answering Service: https://mybcat.com/solutions/medical-answering-service/
- Patient Recall: https://mybcat.com/solutions/patient-recall/
- No-Show Recovery: https://mybcat.com/solutions/no-show-recovery/
- Front Desk Outsourcing: https://mybcat.com/solutions/front-desk-outsourcing/
- Virtual Medical Scribe: https://mybcat.com/solutions/virtual-medical-scribe/
- Medical Virtual Assistant: https://mybcat.com/solutions/medical-virtual-assistant/
- EHR & PMS Integrations: https://mybcat.com/solutions/integrations/

## Enterprise (multi-location)
- Multi-Location Overview: https://mybcat.com/enterprise/
- Implementation Timeline: https://mybcat.com/enterprise/implementation/

## Industries
- Optometry & Ophthalmology: https://mybcat.com/industries/optometry/
- Dental: https://mybcat.com/industries/dental/
- Veterinary: https://mybcat.com/industries/veterinary/
- MedSpa & Aesthetics: https://mybcat.com/industries/medspa/
- Dermatology: https://mybcat.com/industries/dermatology/
- Urgent Care: https://mybcat.com/industries/urgent-care/
- ENT & Audiology: https://mybcat.com/industries/ent-audiology/

## Proof (results + case studies)
- Case studies hub: https://mybcat.com/case-studies/
- Blog: https://mybcat.com/blog/

## Trust & compliance
- HIPAA compliance: https://mybcat.com/hipaa-compliance/
- Security controls: https://mybcat.com/soc-2/
- Privacy policy: https://mybcat.com/privacy-policy/
- Terms: https://mybcat.com/terms/
- GDPR: https://mybcat.com/gdpr/

## Resources
- ROI calculator: https://mybcat.com/resources/roi-calculator/
- Book: https://mybcat.com/resources/book/
- Podcast: https://mybcat.com/resources/podcast/
- Glossary: https://mybcat.com/glossary/
- HTML sitemap: https://mybcat.com/sitemap/


This matches your current IA (solutions, industries, enterprise, compare, resources, trust pages) as seen in your live navigation + sitemap.

Extra credit: add llms-full.txt that includes all compare pages, all case studies, and your top 20–50 blog URLs.

C) JSON‑LD patterns that will actually help AI/agents
1) Homepage: Organization + WebSite (graph, with stable @id)

Use sameAs to lock your entity to LinkedIn/Facebook, which helps entity resolution.

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://mybcat.com/#organization",
      "name": "My Business Care Team",
      "alternateName": ["MyBCAT", "My BCAT"],
      "url": "https://mybcat.com/",
      "logo": {
        "@type": "ImageObject",
        "url": "https://mybcat.com/favicon/apple-touch-icon.png"
      },
      "sameAs": [
        "https://www.linkedin.com/…",
        "https://www.facebook.com/…"
      ],
      "contactPoint": [{
        "@type": "ContactPoint",
        "contactType": "sales",
        "url": "https://mybcat.com/contact/"
      }]
    },
    {
      "@type": "WebSite",
      "@id": "https://mybcat.com/#website",
      "url": "https://mybcat.com/",
      "name": "My Business Care Team",
      "publisher": { "@id": "https://mybcat.com/#organization" }
    }
  ]
}
</script>

2) Solution pages: Service schema (plus BreadcrumbList)

Example for Medical Answering Service page (you already have great TL;DR copy on-page).

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Service",
  "@id": "https://mybcat.com/solutions/medical-answering-service/#service",
  "name": "Medical Answering Service",
  "provider": { "@id": "https://mybcat.com/#organization" },
  "url": "https://mybcat.com/solutions/medical-answering-service/",
  "serviceType": "Medical answering service with appointment scheduling and intake",
  "audience": {
    "@type": "Audience",
    "audienceType": "Healthcare practices and multi-location healthcare groups"
  }
}
</script>


Add FAQPage JSON‑LD only where you actually have an FAQ section (you do on these pages).

6) Validation checklist (don’t trust, verify)
“AI agents can see it” means you can verify 3 things

Robots + WAF allow

Make sure OAI‑SearchBot isn’t blocked if you want ChatGPT search visibility.

If you use WAF, allow OpenAI + Perplexity IP ranges (official JSON endpoints).

Indexability controls aren’t accidentally killing you

If you ever want to prevent surfacing, OpenAI says use noindex (but the crawler must be able to read the tag).

Google says for AI features in Search, use noindex, nosnippet, max-snippet, etc.

Rendering doesn’t depend on blocked resources
Applebot explicitly warns that if JS/CSS/resources are blocked, rendering/indexing quality can suffer.

7) “Deep” future-proofing moves (beyond the usual checklist)

These are the moves that will matter more as agents get more autonomous:

1) Publish an “Authoritative Facts” page (human + agent)

Create a page like /about/facts/ that contains:

exact name, acronym, HQ, year founded

what you do / don’t do

supported EHRs list

coverage hours

typical implementation timeline

pricing ranges (if you’re willing)

compliance bullets + links (HIPAA, SOC2-aligned controls)

Why: agents need one canonical place to pull facts without scraping 20 pages.

2) Put sources next to every stat you care about

You use strong numbers (“87% abandon voicemail”, etc.).
If you don’t cite them, AI systems will treat them as marketing and may refuse to repeat them confidently.

3) Add “.md mirrors” for key pages

llms.txt explicitly proposes .md versions of pages at the same URL plus .md.
For MyBCAT, even 10–20 markdown pages (home, each solution, integrations, pricing, compliance) will dramatically reduce hallucinations about what you do.

4) Consider an MCP server / OpenAPI (if you want agents to act, not just read)

If your goal is “agents can book a discovery call, run ROI estimates, pull integration details,” then eventually you’ll want machine-actionable endpoints (OpenAPI or MCP). This isn’t required for “visibility,” but it’s how you become agent-native.

The shortest “do this now” checklist (if you want the 80/20)
Priority	Do this	Why it matters
1	Ensure /robots.txt exists and does not block OAI‑SearchBot	Determines visibility in ChatGPT search.
2	Add WAF allow rules using official IP ranges	Robots “allow” is meaningless if WAF blocks.
3	Publish /llms.txt	Gives agents a clean map.
4	Publish an XML sitemap + reference it in robots	Crawl coverage + indexing.
5	Add Organization + Service + FAQ + Breadcrumb JSON‑LD	Machine understanding + entity clarity.
6	Add citations for your key stats	AI will reuse/cite you more confidently.

If you want, I can also generate:

a MyBCAT-specific llms-full.txt outline (including which blog posts are most valuable for AI discovery), and
