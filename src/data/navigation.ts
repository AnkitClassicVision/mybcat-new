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
      },
      {
        label: 'Front Office Operations',
        href: '/solutions/front-office-operations/',
        description: 'Complete front desk support'
      },
      {
        label: 'How It Works',
        href: '/how-it-works/',
        description: 'Our process explained'
      },
      {
        label: 'Integrations',
        href: '/solutions/integrations/',
        description: 'EHR & PMS connections'
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
      { label: 'Dermatology', href: '/industries/dermatology/' },
      { label: 'Urgent Care', href: '/industries/urgent-care/' },
      { label: 'ENT & Audiology', href: '/industries/ent/' }
    ]
  },
  {
    label: 'Compare',
    href: '/compare/',
    children: [
      { label: 'vs Hello Rache', href: '/compare/vs-hello-rache/' },
      { label: 'vs HireTeem', href: '/compare/vs-hireteem/' },
      { label: 'vs Virtual Assistants', href: '/compare/vs-virtual-assistants/' },
      { label: 'vs Call Centers', href: '/compare/vs-call-centers/' },
      { label: 'vs AI Receptionists', href: '/compare/vs-ai-receptionists/' },
      { label: 'All Comparisons', href: '/compare/' }
    ]
  },
  {
    label: 'Resources',
    href: '/resources/',
    children: [
      { label: 'Blog', href: '/blog/' },
      { label: 'Case Studies', href: '/case-studies/', description: 'Success stories' },
      { label: 'ROI Calculator', href: '/resources/roi-calculator/', description: 'Calculate your savings' },
      { label: 'Glossary', href: '/glossary/', description: 'Healthcare terms explained' },
      { label: 'FAQ', href: '/faq/', description: 'Common questions' },
      { label: 'Podcast', href: '/resources/podcast/' }
    ]
  },
  {
    label: 'Pricing',
    href: '/pricing/'
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
    { label: 'No-Show Recovery', href: '/solutions/no-show-recovery/' },
    { label: 'Front Office Operations', href: '/solutions/front-office-operations/' },
    { label: 'Integrations', href: '/solutions/integrations/' }
  ],
  industries: [
    { label: 'Optometry', href: '/industries/optometry/' },
    { label: 'Dental', href: '/industries/dental/' },
    { label: 'Veterinary', href: '/industries/veterinary/' },
    { label: 'MedSpa', href: '/industries/medspa/' },
    { label: 'Dermatology', href: '/industries/dermatology/' },
    { label: 'Urgent Care', href: '/industries/urgent-care/' },
    { label: 'ENT', href: '/industries/ent/' }
  ],
  company: [
    { label: 'About', href: '/about/' },
    { label: 'How It Works', href: '/how-it-works/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Careers', href: '/careers/' },
    { label: 'Security', href: '/security/' }
  ],
  resources: [
    { label: 'Blog', href: '/blog/' },
    { label: 'ROI Calculator', href: '/resources/roi-calculator/' },
    { label: 'Glossary', href: '/glossary/' },
    { label: 'FAQ', href: '/faq/' },
    { label: 'Compare Solutions', href: '/compare/' },
    { label: 'Podcast', href: '/resources/podcast/' },
    { label: 'Book', href: '/resources/book/' }
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy/' },
    { label: 'Terms of Service', href: '/terms/' }
  ]
};

// CTA button configuration
export const ctaButton = {
  label: 'Get My Schedule Filled',
  href: '/contact/',
  mobileLabel: 'Book Call'
};
