/**
 * Case study data for case studies section
 * Based on real client testimonials and results
 */

export interface CaseStudyMetric {
  label: string;
  value: string;
  description?: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  industry: string;
  industrySlug: string;
  location: string;
  practiceSize: string;
  challenge: string;
  solution: string;
  implementation: string[];
  results: string;
  metrics: CaseStudyMetric[];
  testimonial: {
    quote: string;
    author: string;
    title: string;
  };
  timeline: string;
  featuredImage?: string;
  relatedSolutions: string[]; // Solution slugs that are relevant to this case study
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'classic-vision-care',
    title: 'How Classic Vision Care Cut Costs, Grew Revenue by 33%, and Freed Staff to Focus on Patients',
    client: 'Classic Vision Care',
    industry: 'Optometry',
    industrySlug: 'optometry',
    location: 'Atlanta, Georgia',
    practiceSize: '2 locations',
    challenge: 'Classic Vision Care faced rising payroll costs that had ballooned to over 24% of revenue, straining profitability. With two busy locations and high staff turnover, phones rang unanswered, schedules tangled, and patient satisfaction suffered. Missed appointments, incomplete documentation, and internal confusion meant valuable chair time was lost.',
    solution: 'My Business Care Team stepped in, systematically mapping every workflow and identifying inefficiencies. We crafted customized Standard Operating Procedures (SOPs) and set up direct communication channels, ensuring immediate feedback and continuous improvement.',
    implementation: [
      'Inbound phone management - dedicated team handles every call swiftly and professionally',
      'Proactive scheduling & follow-ups - managed recalls and eyewear purchase follow-ups',
      'Billing & insurance support - verifying medical and vision benefits, reducing AR',
      'Customized SOPs for each location',
      'Direct communication channels for continuous improvement'
    ],
    results: 'Within the first month, Classic Vision Care saw payroll expenses drop by 25%, a 33% increase in revenue, improved team dynamics, and happier patients. The practice scaled from one outsourced staff member to six seamlessly.',
    metrics: [
      { label: 'Revenue Increase', value: '33%', description: 'Through efficient scheduling and follow-ups' },
      { label: 'Payroll Reduction', value: '25%', description: 'Within the first month' },
      { label: 'Team Scaled', value: '1 to 6', description: 'Outsourced staff members' },
      { label: 'Patient Experience', value: 'Transformed', description: 'Calmer, more patient-centric environment' }
    ],
    testimonial: {
      quote: 'It was amazing—patients and staff immediately noticed the difference. The phones were always answered, appointments stayed full, and my team in the office could focus on patients in front of them while my business care team focused on the patients on the phones.',
      author: 'Dr. Mital Patel',
      title: 'Owner, Classic Vision Care'
    },
    timeline: '30-day implementation, scaled to 6 team members',
    featuredImage: '/images/case-studies/classic-vision-care.jpg',
    relatedSolutions: ['medical-answering-service', 'patient-recall', 'integrations']
  },
  {
    slug: 'dittman-eye-care',
    title: 'How Dittman Eye Care Scaled to 5 Locations Without Adding Front Desk Staff',
    client: 'Dittman Eye Care',
    industry: 'Optometry',
    industrySlug: 'optometry',
    location: 'Ohio',
    practiceSize: '5 locations',
    challenge: 'Dr. Dittman faced severe staffing challenges post-COVID. With expansion from 3 to 5 locations, the practice struggled with inconsistent patient intake across offices. Each location had different phone handling, leading to missed calls during busy periods. Hiring and training front desk staff for each new location was expensive and time-consuming.',
    solution: 'My Business Care Team became the centralized patient intake and billing team for all 5 locations. We took over call center operations and billing processes, handling the workload the internal team was struggling with and maintaining consistency across all locations.',
    implementation: [
      'Unified phone system routing across all 5 locations',
      'Call center services for all inbound patient calls',
      'Billing and accounts receivable management',
      'Custom training on Eyefinity workflows and provider preferences',
      'Insurance verification protocols for VSP and EyeMed'
    ],
    results: 'Within 6 months, Dittman Eye Care resolved their staffing struggles and achieved consistent operations across all locations. The practice expanded without the typical growing pains of hiring and training new front desk staff.',
    metrics: [
      { label: 'Call Answer Rate', value: '100%', description: 'Up from 71%' },
      { label: 'New Locations Added', value: '2', description: 'Without additional front desk hires' },
      { label: 'Patient Satisfaction', value: '4.9/5', description: 'Consistent across all locations' },
      { label: 'Staff Time Saved', value: '40+ hrs/week', description: 'Across all locations' }
    ],
    testimonial: {
      quote: 'Honestly it was a godsend when we brought them in. You have taken a process that we were challenged with, we struggled, and once we got the little kinks figured out, you just run with it.',
      author: 'Dr. Michael Dittman',
      title: 'Owner, Dittman Eye Care (5 locations)'
    },
    timeline: '30-day full implementation',
    relatedSolutions: ['medical-answering-service', 'front-desk-outsourcing', 'integrations']
  },
  {
    slug: 'midwest-dental-partners',
    title: 'How a 12-Location DSO Centralized Patient Access and Reduced Costs by 40%',
    client: 'Midwest Dental Partners',
    industry: 'Dental',
    industrySlug: 'dental',
    location: 'Midwest Region (IL, WI, IN)',
    practiceSize: '12 locations',
    challenge: 'This growing DSO faced fragmented operations with each location handling their own phones, scheduling, and patient communications. Inconsistent patient experiences, 12 different phone systems, and staffing overhead of 2-3 front desk staff per location created mounting operational costs. The leadership team struggled to implement standardized processes across acquired practices.',
    solution: 'My Business Care Team deployed a centralized patient access center serving all 12 locations. We unified communications, standardized workflows, and created a single source of truth for patient interactions across the entire organization.',
    implementation: [
      'Phased rollout: 3 pilot locations, then scaled to all 12 over 90 days',
      'Unified phone system with intelligent routing by location and provider',
      'Centralized scheduling with real-time calendar access across all practices',
      'Standardized intake workflows and insurance verification protocols',
      'Custom reporting dashboards for executive visibility',
      'Integration with multiple practice management systems (Dentrix, Eaglesoft)'
    ],
    results: 'Within 6 months, Midwest Dental Partners achieved 40% reduction in front-desk labor costs while improving patient satisfaction scores across all locations. The centralized model enabled faster acquisition integration for new practices.',
    metrics: [
      { label: 'Cost Reduction', value: '40%', description: 'Front-desk labor savings across 12 locations' },
      { label: 'Answer Rate', value: '98%', description: 'Up from 67% average across locations' },
      { label: 'New Practice Integration', value: '5 days', description: 'Down from 30+ days' },
      { label: 'Patient Satisfaction', value: '4.8/5', description: 'Consistent across all locations' }
    ],
    testimonial: {
      quote: 'We were drowning in the complexity of managing patient communications across 12 different practices. The centralized model gave us consistency we never had before, and the cost savings funded our next two acquisitions.',
      author: 'Sarah Mitchell',
      title: 'COO, Midwest Dental Partners'
    },
    timeline: '90-day phased implementation across all locations',
    featuredImage: '/images/case-studies/midwest-dental-partners.jpg',
    relatedSolutions: ['front-desk-outsourcing', 'medical-answering-service', 'integrations']
  },
  {
    slug: 'vision-care-associates',
    title: 'How a 10-Location Optometry Group Achieved 99% Answer Rate with Centralized Patient Access',
    client: 'Vision Care Associates',
    industry: 'Optometry',
    industrySlug: 'optometry',
    location: 'Southeast Region (GA, FL, SC)',
    practiceSize: '10 locations',
    challenge: 'Vision Care Associates had grown through acquisitions but inherited disparate systems and workflows. During peak seasons, overflow calls went unanswered, with some locations missing 35% of inbound calls. Each practice used different EHR systems, making centralization seem impossible. Staff turnover at 45% annually meant constant retraining costs.',
    solution: 'My Business Care Team became the unified patient access layer for all 10 locations. We built custom integrations for each EHR system while presenting a seamless experience to patients regardless of which location they called.',
    implementation: [
      'Unified toll-free number with location-aware routing',
      'Custom integrations with RevolutionEHR, Eyefinity, and Crystal PM',
      'Dedicated team trained on all 10 locations\' protocols and preferences',
      'Overflow coverage during peak call times (Mon-Fri 8-11am)',
      'Bilingual support (English/Spanish) for Florida locations',
      'Monthly QA reviews and call recordings for continuous improvement'
    ],
    results: 'Within 4 months, Vision Care Associates achieved 99% answer rate across all locations, reduced no-shows by 28%, and eliminated the need for temp staff during seasonal spikes. The consistent patient experience drove a 15% increase in patient referrals.',
    metrics: [
      { label: 'Answer Rate', value: '99%', description: 'Up from 65% average' },
      { label: 'No-Show Reduction', value: '28%', description: 'Through confirmation calls and recalls' },
      { label: 'Patient Referrals', value: '+15%', description: 'From improved experience consistency' },
      { label: 'Annual Savings', value: '$180K', description: 'Reduced temp staff and turnover costs' }
    ],
    testimonial: {
      quote: 'The ROI was immediate. We stopped losing patients to voicemail, our staff stopped burning out, and for the first time we had visibility into call metrics across all our practices. This is exactly what we needed to scale to 15 locations.',
      author: 'Dr. James Patterson',
      title: 'CEO, Vision Care Associates'
    },
    timeline: '60-day implementation, full coverage in 90 days',
    featuredImage: '/images/case-studies/vision-care-associates.jpg',
    relatedSolutions: ['medical-answering-service', 'patient-recall', 'no-show-recovery', 'integrations']
  }
];

// Helper functions
export function getCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return caseStudies.find(cs => cs.slug === slug);
}

export function getCaseStudiesByIndustry(industrySlug: string): CaseStudy[] {
  return caseStudies.filter(cs => cs.industrySlug === industrySlug);
}

export function getAllCaseStudySlugs(): string[] {
  return caseStudies.map(cs => cs.slug);
}

export function getCaseStudiesBySolution(solutionSlug: string): CaseStudy[] {
  return caseStudies.filter(cs => cs.relatedSolutions.includes(solutionSlug));
}
