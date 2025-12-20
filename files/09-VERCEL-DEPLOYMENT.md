# 09 — VERCEL DEPLOYMENT REFERENCE

## Initial Vercel Setup

### Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Import Git Repository
3. Select your GitHub/GitLab repo
4. Configure project settings:
   - Framework Preset: Astro
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Environment Variables

Set in Vercel Dashboard → Project → Settings → Environment Variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| `SITE_URL` | `https://mybcat.com` | Production |
| `SITE_URL` | `https://staging.mybcat.com` | Preview |
| `GOOGLE_ANALYTICS_ID` | `G-XXXXXXXXXX` | Production |
| `FORM_ENDPOINT` | `https://api.example.com` | All |

---

## vercel.json Configuration

Full configuration file:

```json
{
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  
  "trailingSlash": true,
  "cleanUrls": true,
  
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()"
        }
      ]
    },
    {
      "source": "/fonts/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/_astro/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  
  "redirects": [
    {
      "source": "/virtual-assistants-for-optometrists",
      "destination": "/industries/optometry/",
      "permanent": true
    },
    {
      "source": "/virtual-assistants-for-dental-practices",
      "destination": "/industries/dental/",
      "permanent": true
    },
    {
      "source": "/virtual-assistants-for-veterinary",
      "destination": "/industries/veterinary/",
      "permanent": true
    },
    {
      "source": "/customer-service-outsourcing-provider-in-marietta-georgia",
      "destination": "/about/",
      "permanent": true
    },
    {
      "source": "/solutions-remote-hospitality-center",
      "destination": "/solutions/patient-intake/",
      "permanent": true
    },
    {
      "source": "/service-package-deluxe",
      "destination": "/pricing/",
      "permanent": true
    },
    {
      "source": "/service-package-ultimate",
      "destination": "/pricing/",
      "permanent": true
    },
    {
      "source": "/service-package-enterprise",
      "destination": "/pricing/",
      "permanent": true
    },
    {
      "source": "/service-package-basic",
      "destination": "/pricing/",
      "permanent": true
    },
    {
      "source": "/contact-us",
      "destination": "/contact/",
      "permanent": true
    },
    {
      "source": "/careers-at-my-business-care-team",
      "destination": "/careers/",
      "permanent": true
    },
    {
      "source": "/our-team",
      "destination": "/about/",
      "permanent": true
    }
  ]
}
```

---

## Caching Strategy

### Cache Headers by Asset Type

| Asset Type | Cache Duration | Headers |
|------------|---------------|---------|
| HTML pages | No cache | `Cache-Control: no-store` |
| Static assets (`/_astro/*`) | 1 year, immutable | `Cache-Control: public, max-age=31536000, immutable` |
| Images | 1 year, immutable | `Cache-Control: public, max-age=31536000, immutable` |
| Fonts | 1 year, immutable | `Cache-Control: public, max-age=31536000, immutable` |
| Sitemap/robots.txt | 1 day | `Cache-Control: public, max-age=86400` |

### Vercel Edge Caching

Astro static pages are automatically cached at the edge. For any dynamic elements, use:

```javascript
// In astro.config.mjs for ISR (if needed)
export default defineConfig({
  output: 'hybrid',  // or 'server' for full SSR
  adapter: vercel({
    isr: {
      expiration: 60 * 60,  // 1 hour
    },
  }),
});
```

For this project, `output: 'static'` is recommended (full static).

---

## Image Optimization

### Vercel Image Optimization

Enabled via Astro Vercel adapter:

```javascript
// astro.config.mjs
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel({
    imageService: true,  // Enable Vercel Image Optimization
  }),
});
```

### Using Optimized Images

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<!-- Astro will optimize and serve via Vercel -->
<Image 
  src={heroImage} 
  alt="Hero image"
  width={1200}
  height={630}
  format="webp"
  quality={80}
/>
```

### Remote Images

For external images, configure allowed domains:

```javascript
// astro.config.mjs
export default defineConfig({
  image: {
    domains: ['mybcat.com', 'images.unsplash.com'],
  },
});
```

---

## Security Headers

### Recommended Security Headers

Already included in `vercel.json`. Explanation:

| Header | Purpose | Value |
|--------|---------|-------|
| `X-Content-Type-Options` | Prevent MIME sniffing | `nosniff` |
| `X-Frame-Options` | Prevent clickjacking | `DENY` |
| `X-XSS-Protection` | XSS filter | `1; mode=block` |
| `Referrer-Policy` | Control referrer info | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Disable unused APIs | `camera=(), microphone=()...` |

### Content Security Policy (Advanced)

For stricter security, add CSP:

```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://js.hsforms.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://www.google-analytics.com https://api.hubspot.com; frame-src https://meetings.hubspot.com"
}
```

**Note:** CSP requires careful testing. Start without it and add incrementally.

---

## Preview Deployments

### Automatic Preview Deploys

Vercel automatically creates preview deployments for:
- Every push to non-production branches
- Every pull request

### Preview URLs

Format: `https://[project]-[branch]-[random].vercel.app`

### Branch Protection

Configure in GitHub:
1. Require status checks to pass
2. Require Vercel deployment to succeed
3. Optional: Require Lighthouse CI to pass

### Preview Comments

Enable Vercel for GitHub app to get:
- Deployment status comments on PRs
- Preview URL in comments
- Build logs link

---

## Domain Configuration

### Custom Domain Setup

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add `mybcat.com`
3. Add `www.mybcat.com`
4. Configure DNS:
   - `mybcat.com` → A record to Vercel IP
   - `www.mybcat.com` → CNAME to `cname.vercel-dns.com`

### SSL Configuration

- Automatic SSL via Let's Encrypt
- Automatic renewal
- HTTP → HTTPS redirect (automatic)

### www vs non-www

Choose one and redirect the other:

```json
// In vercel.json - redirect www to non-www
{
  "redirects": [
    {
      "source": "https://www.mybcat.com/:path*",
      "destination": "https://mybcat.com/:path*",
      "permanent": true
    }
  ]
}
```

---

## Monitoring & Analytics

### Vercel Analytics

Enable in project settings or via adapter:

```javascript
// astro.config.mjs
export default defineConfig({
  adapter: vercel({
    webAnalytics: { enabled: true },
    speedInsights: { enabled: true },
  }),
});
```

**Web Analytics provides:**
- Page views
- Unique visitors
- Top pages
- Referrers
- Countries
- Devices

**Speed Insights provides:**
- Real User Monitoring (RUM)
- Core Web Vitals from real users
- LCP, FID, CLS, TTFB, INP
- Performance by page
- Performance by device/country

### Setting Up Alerts

1. Vercel Dashboard → Project → Settings → Notifications
2. Configure alerts for:
   - Deployment failures
   - Domain expiration
   - Usage limits

### External Monitoring

**Recommended tools:**

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| UptimeRobot | Uptime monitoring | 50 monitors |
| Google Search Console | SEO/indexing | Free |
| Google Analytics 4 | Traffic analytics | Free |
| Sentry | Error tracking | 5K events/mo |

### Google Search Console Setup

1. Verify ownership via DNS TXT record
2. Submit sitemap: `https://mybcat.com/sitemap-index.xml`
3. Monitor:
   - Indexing status
   - Core Web Vitals
   - Search performance
   - Crawl errors

---

## Deployment Workflow

### Production Deployment

```bash
# Push to main branch
git push origin main

# Vercel automatically:
# 1. Triggers build
# 2. Runs npm run build
# 3. Deploys to production
# 4. Invalidates edge cache
```

### Rollback

If deployment has issues:
1. Go to Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Build Optimization

### Build Performance

```javascript
// astro.config.mjs
export default defineConfig({
  build: {
    inlineStylesheets: 'auto',  // Inline small stylesheets
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',  // Faster CSS minification
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor chunks if needed
          },
        },
      },
    },
  },
});
```

### Build Caching

Vercel automatically caches:
- `node_modules`
- Build artifacts between deployments

### Build Timeout

Default: 45 minutes (usually builds in <2 minutes for static sites)

---

## Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Check locally first
npm run build

# Review Vercel build logs
# Look for:
# - Missing dependencies
# - TypeScript errors
# - Path issues
```

**404 on Direct URL Access:**
- Check `trailingSlash` setting
- Verify redirects in `vercel.json`
- Check file exists in `dist/`

**Slow Performance:**
- Check Speed Insights for bottlenecks
- Verify image optimization working
- Check third-party scripts

**Cache Issues:**
- Vercel invalidates on deploy
- For CDN issues, redeploy
- Check browser cache (hard refresh)

### Vercel Support

- Status page: status.vercel.com
- Documentation: vercel.com/docs
- Support: vercel.com/support

---

## Cost Considerations

### Vercel Pricing (Hobby/Pro)

| Feature | Hobby (Free) | Pro ($20/mo) |
|---------|--------------|--------------|
| Bandwidth | 100GB/mo | 1TB/mo |
| Builds | 6000 min/mo | 24000 min/mo |
| Team members | 1 | Unlimited |
| Analytics | Basic | Full |
| Support | Community | Email |

For mybcat.com (static site with moderate traffic):
- **Hobby tier** is likely sufficient initially
- Monitor bandwidth and upgrade if needed
- Pro tier if team access needed

### Optimizing Costs

1. Optimize images to reduce bandwidth
2. Use efficient caching headers
3. Monitor usage in dashboard
4. Remove unused preview deployments
