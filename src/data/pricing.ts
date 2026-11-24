/**
 * Pricing tier data
 * Extracted from homepage for reuse across site
 */
import { discoveryBookingHref } from './navigation';

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
    price: 'Starting at $10',
    period: '/hr',
    description: 'Perfect for practices ready to capture every call around the clock.',
    features: [
      'All calls answered 24/7',
      'Human + AI coverage',
      'Dashboard & metrics reporting',
      'Medical answering services'
    ],
    ctaText: 'Click to book',
    ctaHref: discoveryBookingHref('pricing-plans'),
    popular: false
  },
  {
    name: 'Scale',
    slug: 'scale',
    price: 'Starting at $10',
    period: '/hr',
    description: 'For practices ready to scale with customizable workflows and full front desk support.',
    features: [
      '24/7 coverage with moderate customization',
      'Dedicated account manager',
      'Patient recalls',
      'Insurance verifications',
      'Appointment confirmations',
      'Front desk outsourcing'
    ],
    ctaText: 'Click to book',
    ctaHref: discoveryBookingHref('pricing-plans'),
    popular: true
  },
  {
    name: 'Enterprise',
    slug: 'enterprise',
    price: 'Starting at $10',
    period: '/hr',
    description: 'Multi-location groups with full virtual team support and complete customization.',
    features: [
      'Everything in Scale',
      '24/7 coverage with full customization',
      'Virtual assistants',
      'Medical scribes',
      '30-day pilot available',
      'Custom integrations'
    ],
    ctaText: 'Click to book',
    ctaHref: discoveryBookingHref('pricing-plans'),
    popular: false
  }
];

// All features for comparison table
export const allFeatures = [
  { name: 'All calls answered 24/7', starter: true, scale: true, enterprise: true },
  { name: 'Human + AI coverage', starter: true, scale: true, enterprise: true },
  { name: 'Dashboard & metrics reporting', starter: true, scale: true, enterprise: true },
  { name: 'Medical answering services', starter: true, scale: true, enterprise: true },
  { name: 'Moderate workflow customization', starter: false, scale: true, enterprise: true },
  { name: 'Full workflow customization', starter: false, scale: false, enterprise: true },
  { name: 'Insurance verifications', starter: false, scale: true, enterprise: true },
  { name: 'Appointment confirmations', starter: false, scale: true, enterprise: true },
  { name: 'Patient recalls', starter: false, scale: true, enterprise: true },
  { name: 'Dedicated account manager', starter: false, scale: true, enterprise: true },
  { name: 'Front desk outsourcing', starter: false, scale: true, enterprise: true },
  { name: 'Virtual assistants', starter: false, scale: false, enterprise: true },
  { name: 'Medical scribes', starter: false, scale: false, enterprise: true },
  { name: '30-day pilot available', starter: false, scale: false, enterprise: true },
  { name: 'Custom integrations', starter: false, scale: false, enterprise: true }
];

// Helper function
export function getPricingTierBySlug(slug: string): PricingTier | undefined {
  return pricingTiers.find(t => t.slug === slug);
}
