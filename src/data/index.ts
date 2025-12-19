/**
 * Data layer barrel export
 * Import from '@data' for easy access
 */

export { company } from './company';
export type { Company } from './company';

export { mainNavigation, footerNavigation, ctaButton } from './navigation';
export type { NavItem } from './navigation';

export { industries, getIndustryBySlug, getAllIndustrySlugs } from './industries';
export type { Industry } from './industries';

export { solutions, getSolutionBySlug, getAllSolutionSlugs } from './solutions';
export type { Solution, SolutionFeature, ProcessStep } from './solutions';

export { pricingTiers, allFeatures, getPricingTierBySlug } from './pricing';
export type { PricingTier, PricingFeature } from './pricing';

export { faqs, getFAQsByCategory, getGeneralFAQs, getTopFAQs } from './faq';
export type { FAQ } from './faq';

export { testimonials, clientLogos, getFeaturedTestimonial, getTestimonialsByIndustry, getTestimonialsForDisplay } from './testimonials';
export type { Testimonial } from './testimonials';
