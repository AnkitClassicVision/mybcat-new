/**
 * Pricing tier data
 * Extracted from homepage for reuse across site
 */

export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingTier {
  name: string;
  slug: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
  popular?: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    slug: 'starter',
    price: '$1,995',
    period: '/mo',
    description: 'Perfect for single locations ready to capture every call.',
    features: [
      'All calls answered in 3 rings',
      'Appointment scheduling',
      'Insurance verification',
      '8am-6pm coverage'
    ],
    ctaText: 'Get Started',
    ctaHref: '/contact/',
    popular: false
  },
  {
    name: 'Growth',
    slug: 'growth',
    price: '$3,495',
    period: '/mo',
    description: 'For practices ready to scale without operational chaos.',
    features: [
      'Everything in Starter',
      'Extended hours (7am-9pm)',
      'Recall outreach campaigns',
      'Dedicated account manager'
    ],
    ctaText: 'Get Started',
    ctaHref: '/contact/',
    popular: true
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    price: 'From $2,500',
    period: '/location/mo',
    description: 'Multi-location groups. Volume discounts available.',
    features: [
      'Everything in Growth',
      '24/7 coverage',
      'Centralized dashboard',
      'Custom integrations',
      '30-day pilot available'
    ],
    ctaText: 'Talk to Enterprise Team',
    ctaHref: '/contact/',
    popular: false
  }
];

// All features for comparison table
export const allFeatures = [
  { name: 'Phone answering', starter: true, growth: true, enterprise: true },
  { name: 'Appointment scheduling', starter: true, growth: true, enterprise: true },
  { name: 'Insurance verification', starter: true, growth: true, enterprise: true },
  { name: 'Business hours coverage', starter: '8am-6pm', growth: '7am-9pm', enterprise: '24/7' },
  { name: 'Recall campaigns', starter: false, growth: true, enterprise: true },
  { name: 'Dedicated account manager', starter: false, growth: true, enterprise: true },
  { name: 'Multi-location dashboard', starter: false, growth: false, enterprise: true },
  { name: 'Custom integrations', starter: false, growth: false, enterprise: true },
  { name: 'API access', starter: false, growth: false, enterprise: true }
];

// Helper function
export function getPricingTierBySlug(slug: string): PricingTier | undefined {
  return pricingTiers.find(t => t.slug === slug);
}
