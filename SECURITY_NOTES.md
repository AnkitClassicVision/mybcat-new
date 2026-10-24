# Security notes (audit 2026-10-24, branch security/black-october-2026-10-24)

No CSP or API behavior was changed. This file is documentation only.

## 1. CSP location and current value
- Defined only in `vercel.json:40` (headers block, source `/(.*)`, line 39 area). No `_headers`, middleware or astro-config CSP found.
- Current: `script-src 'self' 'unsafe-inline' 'unsafe-eval' https:`; `connect-src 'self' https: wss:`; `frame-src 'self' https:`; `style-src 'self' 'unsafe-inline' https:`.

## 2. Third-party script origins actually used in src/ and public/
| Origin | Where | Notes |
|---|---|---|
| https://www.googletagmanager.com (gtm.js) | `src/components/GoogleTagManager.astro:23`, `GoogleTagManagerNoScript.astro:13` (iframe ns.html), preconnects in `src/layouts/Base.astro:180`, `BaseLayout.astro:173` | injected dynamically after consent/interaction. GTM can load further tags (GA, ads, etc.) that are NOT visible in this repo; check the GTM container before locking down |
| https://js.hs-scripts.com (HubSpot tracking, portal 23344341) | `public/js/deferred-hubspot.js:13` | loads further HubSpot hosts (js.hubspot.com, js.hsforms.net, js.usemessages.com, etc.) |
| https://js.hsforms.net (forms v2 embed) | `src/components/HubSpotForm.astro:98` | forms may also post to forms.hubspot.com / api.hsforms.com (connect-src) |
| https://us.i.posthog.com / us.posthog.com | `src/components/PostHog.astro:56-57` (snippet loads array.js from the PostHog host, so assets host `us-assets.i.posthog.com` is likely also needed) | connect-src and script-src |
| https://www.youtube.com/embed | `src/components/sections/Hero.astro:137` | frame-src only |
| https://unpkg.com/lucide@latest | `public/r/unique-eyecare-optical-2026-07/index.html:12` | unpinned CDN script in a static page; pin or self-host |
No chat widget, Turnstile, or Calendly script was found in src/ or public/js.

## 3. Proposed tightened script-src (NOT applied)
```
script-src 'self' 'nonce-<per-request>' 'strict-dynamic' https://www.googletagmanager.com https://js.hs-scripts.com https://js.hsforms.net https://js.hubspot.com https://js.usemessages.com https://js.hscollectedforms.net https://js.hs-banner.com https://js.hs-analytics.net https://us-assets.i.posthog.com https://us.i.posthog.com https://www.google-analytics.com
```
Remove `'unsafe-eval'` and `'unsafe-inline'` and bare `https:`. Caveats:
- This is a static Vercel site: per-request nonces are not possible without middleware/edge. Practical option is hash-based allowlisting (`'sha256-...'` computed at build) for inline scripts, and keeping `'self'`.
- With `'strict-dynamic'` host allowlists are ignored by modern browsers; scripts created by trusted scripts (GTM, HubSpot loaders) are then allowed. Keep hosts as fallback for old browsers.
- First ship as `Content-Security-Policy-Report-Only` and watch violations (GTM tags may need `'unsafe-eval'`; test removal against the GTM container).
- `https://unpkg.com` only needed if the `public/r/...` page remains; prefer self-hosting.

## 4. Inline scripts needing hashes or nonces
Astro `<script is:inline>` and `define:vars` scripts are emitted inline as-is. Plain `<script>` (bundled) in .astro files that Astro keeps small may also be inlined (Astro 4 inlines scripts under `vite.build.assetsInlineLimit`), so verify in `dist` after build.
Explicit `is:inline` (certainly inline):
- `src/components/GoogleTagManager.astro:14` (define:vars)
- `src/components/PostHog.astro:5` (define:vars)
- `src/components/sections/FAQ.astro:130`
- `src/layouts/BaseLayout.astro:67`, `:213`
- `src/layouts/Base.astro:116`, `:204`
- `src/pages/index.astro:835`
- `src/pages/contact.astro:922`
- `src/pages/pricing.astro:695`
- `src/pages/optometry-analysis/index.astro:102`
- `src/pages/practice-growth/onboard/index.astro:441`
External same-origin (no change needed): `BaseLayout.astro:209-210` (`/js/seo-attribution.js`, `/js/intake-form.js`).
Plain `<script>` (bundled; may be inlined): Card.astro:172, Nav.astro:595, OptometryAnalysisDeck.astro:113, IdocConnections2026Landing.astro:1522, HubSpotForm.astro:88, LogoMarquee.astro:49, Hero.astro:734, common/Header.astro:395, ai-profile.astro:275, layouts/Blog.astro:246, idoc.astro:173, ods-on-finance.astro:165, contact.astro:917, optometry-analysis/index.astro:98, practice-growth/onboard/index.astro:437.
JSON-LD `<script type="application/ld+json">` blocks (20 files) are data blocks and are not governed by script-src.
Verify the final inline list with: `grep -L 'src=' ` over `dist/**/*.html` script tags after build.

## 5. Intake/contact form API
Handler: `api/forms/intake.mjs` (only API route; client `public/js/intake-form.js:82` posts to `/api/forms/intake`). HubSpot-embedded forms bypass this handler.
- Durable rate limit: NONE. No rate-limit code, KV/Redis/DB use anywhere in `api/` (grep for rate/limit/redis/kv/upstash empty). Only controls are body size `intake.mjs:3` (32 KB, `:263` checks the Content-Length header only), an Origin allowlist (`:265-268`; requests with no Origin are rejected, but Origin is trivially forged by non-browser clients), field length caps (`:92-97`) and an upstream timeout (`:241`). Check `vercel.json`/Vercel Firewall for platform rules (not visible in repo).
- Turnstile: NOT enforced server-side (and not present client-side). No `turnstile`/`captcha`/`cf-` references in `api/`, `src/`, or `public/js`.
- Raw upstream errors to client: NO. Handler returns only fixed codes (`intake.mjs:279`, `:283`, `:285`: `intake_unavailable`, `intake_not_configured`, 400 `invalid_submission` `:274`). Upstream status/body are not forwarded; caught errors are not logged or echoed. Minor: `intake_not_configured` (503, `:283`) reveals a server misconfiguration state.
- Other: upstream call uses `redirect: 'error'` (`:246`) and a shared token header (`:249`); `Content-Length` check can be bypassed with chunked bodies (platform body limits apply).

## 6. Dependency state
See the commit message. Remaining: Astro 4.16.19 (needs Astro upgrade project), `@astrojs/vercel` 7.x. `npm audit` still reports 29 vulnerabilities after this change (mostly Astro 4 transitive).
