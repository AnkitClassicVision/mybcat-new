/**
 * Lighthouse CI Configuration
 * Run with: npx lhci autorun
 *
 * IMPORTANT: This now tests MOBILE performance to catch regressions
 * that affect real users. Desktop testing was hiding mobile issues.
 *
 * Install: npm install -D @lhci/cli
 */

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
        // Performance - ERROR to block deploys on regression
        'categories:performance': ['error', { minScore: 0.70 }],

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.9 }],

        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.9 }],

        // SEO
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals - STRICT MOBILE THRESHOLDS
        'first-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 400 }],

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

        // Performance audits - now ERROR level
        'uses-responsive-images': 'error',
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
