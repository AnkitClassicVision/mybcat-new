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
    featuredImage: '/images/case-studies/classic-vision-care.jpg'
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
    timeline: '30-day full implementation'
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
