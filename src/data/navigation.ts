/**
 * Navigation structure for main menu, footer, and breadcrumbs
 */

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
  external?: boolean;
  description?: string;
}

// Main navigation menu
export const mainNavigation: NavItem[] = [
  {
    label: 'Solutions',
    href: '/solutions/',
    children: [
      {
        label: 'Patient Intake',
        href: '/solutions/patient-intake/',
        description: 'Never miss another call'
      },
      {
        label: 'Recall & Reactivation',
        href: '/solutions/recall-reactivation/',
        description: 'Bring patients back'
      },
      {
        label: 'No-Show Recovery',
        href: '/solutions/no-show-recovery/',
        description: 'Fill cancelled slots'
      }
    ]
  },
  {
    label: 'Industries',
    href: '/industries/',
    children: [
      { label: 'Optometry', href: '/industries/optometry/' },
      { label: 'Dental', href: '/industries/dental/' },
      { label: 'Veterinary', href: '/industries/veterinary/' },
      { label: 'MedSpa', href: '/industries/medspa/' },
      { label: 'Dermatology', href: '/industries/dermatology/' }
    ]
  },
  {
    label: 'Pricing',
    href: '/pricing/'
  },
  {
    label: 'Resources',
    href: '/resources/',
    children: [
      { label: 'Blog', href: '/blog/' },
      { label: 'Podcast', href: '/resources/podcast/' },
      { label: 'Book', href: '/resources/book/' }
    ]
  },
  {
    label: 'About',
    href: '/about/'
  }
];

// Footer navigation organized by section
export const footerNavigation = {
  solutions: [
    { label: 'Patient Intake', href: '/solutions/patient-intake/' },
    { label: 'Recall & Reactivation', href: '/solutions/recall-reactivation/' },
    { label: 'No-Show Recovery', href: '/solutions/no-show-recovery/' }
  ],
  industries: [
    { label: 'Optometry', href: '/industries/optometry/' },
    { label: 'Dental', href: '/industries/dental/' },
    { label: 'Veterinary', href: '/industries/veterinary/' },
    { label: 'MedSpa', href: '/industries/medspa/' },
    { label: 'Dermatology', href: '/industries/dermatology/' }
  ],
  company: [
    { label: 'About', href: '/about/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Security', href: '/security/' },
    { label: 'Blog', href: '/blog/' }
  ],
  resources: [
    { label: 'Podcast', href: '/resources/podcast/' },
    { label: 'Book', href: '/resources/book/' }
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy/' },
    { label: 'GDPR', href: '/gdpr/' }
  ]
};

// CTA button configuration
export const ctaButton = {
  label: 'Get My Schedule Filled',
  href: '/contact/',
  mobileLabel: 'Book Call'
};
