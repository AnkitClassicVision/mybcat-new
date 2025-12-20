Part F: Performance & Architecture Recommendation
Framework Comparison for Vercel + GitHub Workflow
CriteriaAstroNext.js (SSG/ISR)Plain HTML/StaticTTFB⭐⭐⭐⭐⭐ Excellent (<100ms)⭐⭐⭐⭐ Very Good (SSG), ⭐⭐⭐ Good (ISR)⭐⭐⭐⭐⭐ ExcellentJS Payload⭐⭐⭐⭐⭐ 0KB default⭐⭐⭐ 70-100KB+ React baseline⭐⭐⭐⭐⭐ 0KBHydrationPartial (islands only)Full pageNoneBuild Complexity⭐⭐⭐⭐ Low⭐⭐⭐ Medium⭐⭐⭐⭐⭐ NoneContent Authoring (MD/MDX)⭐⭐⭐⭐⭐ Native Content Collections⭐⭐⭐⭐ Good, requires setup⭐⭐ Manual onlySEO Impact⭐⭐⭐⭐⭐ Pure HTML output⭐⭐⭐⭐⭐ SSG excellent⭐⭐⭐⭐⭐ ExcellentVercel Integration⭐⭐⭐⭐ Native adapter⭐⭐⭐⭐⭐ Native platform⭐⭐⭐⭐ BasicInteractive ComponentsIslands (React/Vue/Svelte)Full ReactExternal scripts onlyLearning CurveLow-MediumMedium-HighNone
Recommendation: Astro
Primary Reasons:

Zero-JS Default = Optimal Core Web Vitals

LCP <2.5s easily achievable
No hydration blocking render
CLS near 0 without JS layout shifts


Content Collections API

Type-safe MDX with Zod validation
Perfect for code-first content workflow
Frontmatter-driven metadata


Islands Architecture

Add interactivity only where needed (contact forms, calculators)
No framework tax on content pages


Vercel Integration

@astrojs/vercel adapter
Image optimization built-in
Speed Insights supported


Simplicity

Lower complexity than Next.js
Easier for non-React developers
Better for content-focused sites



When to Reconsider Next.js:

If mybcat plans to add authenticated dashboards or portals
If frequent content updates require ISR (hourly changes)
If team has deep React expertise and prefers it