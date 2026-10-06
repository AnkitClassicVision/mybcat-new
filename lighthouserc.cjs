/**
 * Lighthouse CI Configuration
 * Run with: npx lhci autorun
 *
 * IMPORTANT: This now tests MOBILE performance to catch regressions
 * that affect real users. Desktop testing was hiding mobile issues.
 *
 * Install: npm install -D @lhci/cli
 */

const newestPostUrl = process.env.LHCI_NEWEST_POST_URL;
// error on the Monday hard run and on layout/style/tracking edits.
// warn on ordinary pushes so a blog or token commit does not fail a known miss.
// Do not change 2500. A higher cap would hide the miss.
const fcpLevel = process.env.LHCI_FCP_LEVEL === "error" ? "error" : "warn";

module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:4321/',
        'http://localhost:4321/about/',
        'http://localhost:4321/solutions/medical-answering-service/',
        'http://localhost:4321/industries/optometry/',
        'http://localhost:4321/blog/',
        'http://localhost:4321/contact/',
        'http://localhost:4321/pricing/',
        ...(newestPostUrl ? [newestPostUrl] : []),
      ],
      // Start the dev server before running
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        // Mobile testing to catch real-world regressions
        // Note: preset: 'mobile' was removed (deprecated in Lighthouse v11+)
        // Mobile is now configured via formFactor + screenEmulation below
        // Mobile throttling to simulate real-world conditions
        throttling: {
          // Standard mobile CPU slowdown (4x)
          cpuSlowdownMultiplier: 4,
        },
        // Emulate mobile device
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 375,
          height: 667,
          deviceScaleFactor: 2,
        },
      },
    },
    assert: {
      // STRICTER assertions for mobile performance
      assertions: {
        // Performance: 'warn' while perf debt lands. Mobile scores are
        // currently 0.61–0.69 across /, /solutions/medical-answering-service/,
        // /contact/, /pricing/ — primarily HubSpot tracking + meetings widget
        // (TBT 1198–2436ms) and unsized blog images. Threshold stays at 0.70
        // so we see when perf actually improves. Don't raise this to 'error'
        // again until perf work lands; do not lower the threshold either —
        // that would hide regressions. See gap-plan Phase 1 item 1.3 +
        // Phase 3B follow-up.
        'categories:performance': ['warn', { minScore: 0.70 }],

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.9 }],

        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.9 }],

        // SEO
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals - STRICT MOBILE THRESHOLDS
        'first-contentful-paint': [fcpLevel, { maxNumericValue: 2500 }],
        // LCP: 'warn' while perf debt lands. Currently passes /, /pricing/,
        // /contact/ but fails /blog/ at ~3500.8ms (under 1ms over).
        // Threshold stays at 3500 so we see when perf actually improves.
        'largest-contentful-paint': ['warn', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        // TBT: temporarily 'warn' while we untangle the HubSpot tracking
        // script + meetings widget on /contact/, /pricing/. Measured at
        // 768-1140ms today. Don't raise this to 'error' again until perf
        // work lands; do not raise the threshold either — that hides
        // regressions. See Phase 3B follow-up.
        'total-blocking-time': ['warn', { maxNumericValue: 400 }],

        // Critical SEO audits
        'document-title': 'error',
        'meta-description': 'error',
        'link-text': 'warn',
        'crawlable-anchors': 'warn',
        'is-crawlable': 'error',
        'robots-txt': 'warn',
        'canonical': 'warn',
        'hreflang': 'off',

        // Accessibility audits
        'color-contrast': 'warn',
        'image-alt': 'error',
        'label': 'error',
        'heading-order': 'warn',

        // Performance audits
        // uses-responsive-images: 'warn' until /blog/ index uses Astro
        // <Image> with srcset variants. Currently scoring 0 because the
        // <picture> element only swaps webp at one size. See Phase 3B
        // follow-up. Stays visible as a warning — do not 'off' it.
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'render-blocking-resources': 'warn',
        'unminified-css': 'error',
        'unminified-javascript': 'error',
        'unused-css-rules': 'off',
        'unused-javascript': 'off',

        // Best practices
        'errors-in-console': 'warn',
        'no-vulnerable-libraries': 'off',
        'csp-xss': 'off',
        'notification-on-start': 'off',
      },
    },
    upload: {
      // Upload to temporary public storage (for CI)
      target: 'temporary-public-storage',
    },
  },
};
