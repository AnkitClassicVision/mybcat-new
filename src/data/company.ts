/**
 * Company information and configuration
 * Central source of truth for brand and contact settings
 */

export const company = {
  name: 'My Business Care Team',
  shortName: 'MyBCAT',
  tagline: 'Every Call Answered. Every Patient Captured.',
  description: 'We answer your overflow calls and book appointments directly into your EHR—so your staff can focus on patients, not phones.',

  // Contact information
  phone: '+1-678-855-6130',
  email: 'hello@mybcat.com',

  // Address (Headquarters)
  address: {
    street: '1140 Hammond Drive',
    city: 'Marietta',
    state: 'GA',
    zip: '30060',
    country: 'US'
  },

  // Social media
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=100088695738006',
    linkedin: 'https://www.linkedin.com/company/my-business-care-team/'
  },

  // Ownership and founder info
  ownership: {
    parent: 'Classic Vision Care',
    founder: 'Ankit Patel',
    founderTitle: 'Founder & CEO'
  },

  // Site settings
  site: {
    url: 'https://mybcat.com',
    locale: 'en_US'
  },

  // Key statistics for use across site
  stats: {
    trustedPractices: '70+',
    callAnswerRate: '100%',
    avgRevenueRecovered: '$100,000+',
    missedCallCost: '$2,400'
  }
} as const;

export type Company = typeof company;
