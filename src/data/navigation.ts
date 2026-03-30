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

// Main navigation menu - Enterprise-first positioning
export const mainNavigation: NavItem[] = [
  {
    label: 'Enterprise',
    href: '/enterprise/',
    children: [
      { label: 'Enterprise Overview', href: '/enterprise/', description: 'Multi-location solutions' },
      { label: 'Patient Access Center', href: '/enterprise/patient-access-center/', description: 'Centralized call handling' },
      { label: 'Centralized Scheduling', href: '/enterprise/centralized-scheduling/', description: 'Multi-location booking' },
      { label: 'Multi-Location Recall', href: '/enterprise/multi-location-recall/', description: 'Recall at scale' },
      { label: 'Reporting & QA', href: '/enterprise/reporting-qa/', description: 'Dashboards & scorecards' },
      { label: 'Security & Compliance', href: '/hipaa-compliance/', description: 'HIPAA, SOC 2, BAA' },
      { label: 'DSOs & Dental Groups', href: '/enterprise/dso/' },
      { label: 'Optometry Groups', href: '/enterprise/optometry-groups/' },
      { label: 'Veterinary Groups', href: '/enterprise/veterinary-groups/' },
      { label: 'Urgent Care Chains', href: '/enterprise/urgent-care-chains/' },
      { label: 'Build vs Buy Analysis', href: '/compare/build-vs-buy/', description: 'Cost comparison' }
    ]
  },
  {
    label: 'Solutions',
    href: '/solutions/',
    children: [
      {
        label: 'Medical Answering Service',
        href: '/solutions/medical-answering-service/',
        description: 'Never miss another call'
      },
      {
        label: 'Patient Recall',
        href: '/solutions/patient-recall/',
        description: 'Bring patients back'
      },
      {
        label: 'No-Show Recovery',
        href: '/solutions/no-show-recovery/',
        description: 'Fill cancelled slots'
      },
      {
        label: 'Front Desk Outsourcing',
        href: '/solutions/front-desk-outsourcing/',
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
      { label: 'Enterprise Case Studies', href: '/case-studies/', description: 'Multi-location success stories' },
      { label: 'ROI Calculator', href: '/resources/roi-calculator/', description: 'Calculate your savings' },
      { label: 'Security & Compliance', href: '/hipaa-compliance/', description: 'HIPAA, SOC 2 docs' },
      { label: 'Blog', href: '/blog/' },
      { label: 'Book', href: '/resources/book/', description: 'Staff Smart Not Hard' },
      { label: 'Podcast', href: '/resources/podcast/', description: 'Staff Smart Podcast' },
      { label: 'Glossary', href: '/glossary/', description: 'Healthcare terms explained' },
      { label: 'FAQ', href: '/faq/', description: 'Common questions' }
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
  enterprise: [
    { label: 'Enterprise Overview', href: '/enterprise/' },
    { label: 'Patient Access Center', href: '/enterprise/patient-access-center/' },
    { label: 'Centralized Scheduling', href: '/enterprise/centralized-scheduling/' },
    { label: 'Multi-Location Recall', href: '/enterprise/multi-location-recall/' },
    { label: 'Reporting & QA', href: '/enterprise/reporting-qa/' },
    { label: 'DSOs & Dental Groups', href: '/enterprise/dso/' },
    { label: 'Optometry Groups', href: '/enterprise/optometry-groups/' },
    { label: 'Security & Compliance', href: '/hipaa-compliance/' }
  ],
  solutions: [
    { label: 'Front Desk Outsourcing', href: '/solutions/front-desk-outsourcing/' },
    { label: 'Medical Answering Service', href: '/solutions/medical-answering-service/' },
    { label: 'Medical Virtual Assistant', href: '/solutions/medical-virtual-assistant/' },
    { label: 'Patient Recall', href: '/solutions/patient-recall/' },
    { label: 'No-Show Recovery', href: '/solutions/no-show-recovery/' },
    { label: 'Virtual Medical Scribe', href: '/solutions/virtual-medical-scribe/' },
    { label: 'Integrations', href: '/solutions/integrations/' }
  ],
  industries: [
    { label: 'Optometry', href: '/industries/optometry/' },
    { label: 'Dental', href: '/industries/dental/' },
    { label: 'Dermatology', href: '/industries/dermatology/' },
    { label: 'ENT', href: '/industries/ent/' },
    { label: 'MedSpa', href: '/industries/medspa/' },
    { label: 'Urgent Care', href: '/industries/urgent-care/' },
    { label: 'Veterinary', href: '/industries/veterinary/' }
  ],
  company: [
    { label: 'About', href: '/about/' },
    { label: 'Careers', href: '/careers/' },
    { label: 'Case Studies', href: '/case-studies/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'FAQ', href: '/faq/' }
  ],
  resources: [
    { label: 'Blog', href: '/blog/' },
    { label: 'Book', href: '/resources/book/' },
    { label: 'Podcast', href: '/resources/podcast/' },
    { label: 'ROI Calculator', href: '/resources/roi-calculator/' },
    { label: 'Sitemap', href: '/sitemap/' }
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy-policy/' },
    { label: 'Terms', href: '/terms/' },
    { label: 'HIPAA Compliance', href: '/hipaa-compliance/' },
    { label: 'GDPR', href: '/gdpr/' }
  ]
};

// CTA button configuration
export const ctaButton = {
  label: 'Book a Discovery Call',
  href: '/contact/',
  mobileLabel: 'Book a Call'
};
