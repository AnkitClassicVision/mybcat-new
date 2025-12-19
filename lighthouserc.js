/**
 * Lighthouse CI Configuration
 * Run with: npx lhci autorun
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
        'http://localhost:4321/solutions/patient-intake/',
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
        preset: 'desktop',
        // Throttling for more realistic results
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      // Assertion thresholds
      assertions: {
        // Performance
        'categories:performance': ['warn', { minScore: 0.8 }],

        // Accessibility
        'categories:accessibility': ['error', { minScore: 0.9 }],

        // Best Practices
        'categories:best-practices': ['warn', { minScore: 0.9 }],

        // SEO
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],

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
        'uses-responsive-images': 'warn',
        'offscreen-images': 'warn',
        'render-blocking-resources': 'warn',
        'unminified-css': 'warn',
        'unminified-javascript': 'warn',
        'unused-css-rules': 'off',
        'unused-javascript': 'off',

        // Best practices
        'errors-in-console': 'warn',
        'no-vulnerable-libraries': 'error',
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
