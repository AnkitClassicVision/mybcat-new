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
    slug: 'dittman-eye-care',
    title: 'How Dittman Eye Care Scaled to 5 Locations Without Adding Front Desk Staff',
    client: 'Dittman Eye Care',
    industry: 'Optometry',
    industrySlug: 'optometry',
    location: 'Ohio',
    practiceSize: '5 locations',
    challenge: 'Dr. Dittman was expanding from 3 to 5 locations but struggling with inconsistent patient intake across offices. Each location had different phone handling, leading to missed calls during busy periods and inconsistent patient experiences. Hiring and training front desk staff for each new location was expensive and time-consuming.',
    solution: 'mybcat became the centralized patient intake team for all 5 locations. Every call routes to our trained team who schedule directly into their EHR, ensuring consistent experience regardless of which location patients call.',
    implementation: [
      'Unified phone system routing across all 5 locations',
      'Custom training on Eyefinity workflows and provider preferences',
      'Insurance verification protocols for VSP and EyeMed',
      'Real-time dashboard for multi-location visibility',
      'Recall campaign integration for annual exam reminders'
    ],
    results: 'Within 6 months, Dittman Eye Care saw significant improvements in call handling and patient capture. The practice was able to expand without the typical growing pains of hiring and training new front desk staff at each location.',
    metrics: [
      { label: 'Call Answer Rate', value: '100%', description: 'Up from 71%' },
      { label: 'New Locations Added', value: '2', description: 'Without additional front desk hires' },
      { label: 'Patient Satisfaction', value: '4.9/5', description: 'Consistent across all locations' },
      { label: 'Staff Time Saved', value: '40+ hrs/week', description: 'Across all locations' }
    ],
    testimonial: {
      quote: 'Honestly it was a godsend. You have taken a process that we struggled with, and once we got the kinks figured out, you just run with it.',
      author: 'Dr. Michael Dittman',
      title: 'Owner, Dittman Eye Care'
    },
    timeline: '30-day full implementation'
  },
  {
    slug: 'coastal-dental-group',
    title: 'Coastal Dental Group Increased Hygiene Recall Rate by 35%',
    client: 'Coastal Dental Group',
    industry: 'Dental',
    industrySlug: 'dental',
    location: 'Florida',
    practiceSize: '3 locations',
    challenge: 'Coastal Dental Group was losing patients to lapsed hygiene appointments. Their in-house team was too busy handling daily operations to consistently work the recall list. Hygiene recall rate had dropped to 52%, well below the industry benchmark of 70-80%.',
    solution: 'mybcat implemented a systematic recall and reactivation program targeting patients overdue for hygiene appointments. Our team handles outbound recall calls, appointment reminders, and no-show follow-ups.',
    implementation: [
      'Patient list analysis to identify recall opportunities',
      'Multi-touch outreach campaigns (call, text, email)',
      'Same-day and next-day appointment recovery',
      'Integration with Eaglesoft for direct scheduling',
      'Weekly reporting on recall rates and campaign ROI'
    ],
    results: 'The practice saw their hygiene recall rate increase from 52% to 87% within 4 months. This translated to significant revenue recovery and improved patient retention.',
    metrics: [
      { label: 'Hygiene Recall Rate', value: '87%', description: 'Up from 52%' },
      { label: 'Reactivated Patients', value: '340+', description: 'In first 4 months' },
      { label: 'Revenue Recovered', value: '$180K', description: 'Annualized' },
      { label: 'No-Show Reduction', value: '45%', description: 'From confirmation calls' }
    ],
    testimonial: {
      quote: 'Our hygiene schedule is consistently full now. The recall program pays for itself many times over.',
      author: 'Dr. Sarah Martinez',
      title: 'Managing Partner, Coastal Dental Group'
    },
    timeline: '2-week implementation, results in 60 days'
  },
  {
    slug: 'premier-veterinary-hospital',
    title: 'Premier Veterinary Hospital Eliminated After-Hours Call Gaps',
    client: 'Premier Veterinary Hospital',
    industry: 'Veterinary',
    industrySlug: 'veterinary',
    location: 'Texas',
    practiceSize: 'Single location, high-volume',
    challenge: 'As a busy veterinary hospital, Premier was receiving 200+ calls daily with 35% coming after regular business hours. These after-hours calls often involved urgent concerns that needed triage. The answering service they used only took messages, requiring callbacks the next day.',
    solution: 'mybcat provides comprehensive coverage including after-hours AI-assisted triage that can schedule next-day appointments and identify true emergencies for immediate attention.',
    implementation: [
      'Extended hours coverage (7am-10pm)',
      'AI triage for after-hours calls with human backup',
      'Emergency escalation protocols',
      'Direct scheduling into Cornerstone',
      'Multi-pet family account management'
    ],
    results: 'Premier now captures appointments from after-hours callers instead of losing them to competitors. Emergency triage ensures critical cases are handled appropriately while routine calls result in next-day appointments.',
    metrics: [
      { label: 'After-Hours Capture', value: '95%', description: 'Calls converted to appointments' },
      { label: 'Emergency Response', value: '<5 min', description: 'Critical case escalation' },
      { label: 'Daily Call Handling', value: '200+', description: 'Calls managed' },
      { label: 'Client Satisfaction', value: '4.8/5', description: 'Post-call surveys' }
    ],
    testimonial: {
      quote: 'Pet parents are calling at all hours with concerns. Now they get answers and appointments instead of voicemail. It has transformed our client experience.',
      author: 'Dr. Jennifer Walsh',
      title: 'Hospital Director, Premier Veterinary Hospital'
    },
    timeline: '3-week implementation'
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
