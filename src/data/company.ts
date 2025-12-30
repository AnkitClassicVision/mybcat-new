/**
 * Company information and configuration
 * Central source of truth for brand, contact, and HubSpot settings
 */

export const company = {
  name: 'My Business Care Team',
  shortName: 'MyBCAT',
  tagline: 'Medical Answering Service That Fills Your Schedule',
  description: 'Medical operations partner helping healthcare practices capture every call and fill every appointment slot.',

  // Contact information
  phone: '',
  email: 'hello@mybcat.com',

  // Address
  address: {
    street: '',
    city: 'Marietta',
    state: 'GA',
    zip: '30060',
    country: 'US'
  },

  // Social media
  social: {
    facebook: 'https://www.facebook.com/mybcat',
    linkedin: 'https://www.linkedin.com/company/mybcat'
  },

  // HubSpot integration
  hubspot: {
    portalId: '47905082',
    meetingLink: 'https://hubspot.mybcat.com/meetings/ankit98/mybcat-discovery-call'
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
