# Plan of Action: MyBCAT SEO & Authority Overhaul

Based on the audit by Peter (NAV43) and your "Porsche" strategy (Tuning vs. Maintenance).

## Phase 1: Establish Authority (E-E-A-T)
**Goal:** Prove to Google that Ankit Patel is an entity with Expertise, Experience, Authoritativeness, and Trustworthiness.

1.  **Create Dedicated Author Page**
    *   **File:** `src/pages/author/ankit-patel.astro`
    *   **Action:** Create a profile page distinct from the company "About" page.
    *   **Content:** Bio, high-res headshot, links to *all* social profiles (LinkedIn, etc.), and a feed of recent blog posts.
    *   **Technical:** Implement `Person` Schema (JSON-LD) linking to `sameAs` social profiles.

2.  **Update Schema Infrastructure**
    *   **File:** `src/utils/schema.ts`
    *   **Action:** Add `generatePersonSchema` function. Ensure `Article` schema in blog posts points to this new Author URL instead of a generic string.

3.  **Link Building (Internal)**
    *   **Action:** Ensure the Footer and Blog Layouts link the author name "Ankit Patel" to `/author/ankit-patel`.

## Phase 2: "Tuning the Engine" (Content Depth)
**Goal:** Increase Service Page word count from ~300 to ~1300+ words to match competitors, using semantic keywords without breaking UX.

1.  **Upgrade Data Structure**
    *   **File:** `src/data/solutions.ts`
    *   **Action:** Extend the `Solution` interface to include:
        *   `specificFaqs`: An array of FAQs specific to *that* service (currently the page only pulls generic/onboarding FAQs).
        *   `deepDive`: A new Markdown/HTML field for comprehensive, below-the-fold content (history, detailed workflows, detailed benefits).

2.  **Update Service Page Template**
    *   **File:** `src/pages/solutions/[slug].astro`
    *   **Action:**
        *   Render `specificFaqs` (this alone adds ~300-500 words of high-value keyword content).
        *   Render the `deepDive` content section at the bottom of the page (good for crawlers, unobtrusive for users).

3.  **Content Injection (Immediate Priority)**
    *   **Focus:** "Medical Virtual Assistant" and "Medical Answering Service".
    *   **Action:** Draft and insert the "Deep Dive" content and 5-8 specific FAQs for these top-tier pages using the new data fields.

## Phase 3: "The Pit Crew" (Automation & Signals)
**Goal:** Weekly monitoring and adjustments.

1.  **Automated Signals**
    *   **Action:** Refine your existing scripts in `scripts/` to create a weekly "Health Check" report.
    *   **Integration:** If using Ahrefs API, integrate it here to flag keyword drops.

2.  **Content Pipeline**
    *   **Action:** rigorous schedule of 1-3 posts/week. Use your existing `scheduledDate` logic in `src/content/config.ts` to queue posts in advance.

## Phase 4: Technical Clean-up
1.  **Fix Broken Links:** Run a local crawler/linter to identify 404s within the internal linking structure.
2.  **Schema Validation:** Run the new Author and Service pages through Google's Rich Results Test.

---

## Immediate Next Steps (Day 1)
1.  **Approve this plan.**
2.  I will create the **Author Page** and update the **Schema** (Phase 1).
3.  I will modify the **Solutions Data Structure** to support the new content (Phase 2).
