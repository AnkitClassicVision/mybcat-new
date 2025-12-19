/**
 * Solution data for solution landing pages
 * Each solution has specific features, benefits, and process steps
 */

export interface SolutionFeature {
  title: string;
  description: string;
  icon: string;
}

export interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface Solution {
  slug: string;
  name: string;
  tagline: string;
  headline: string;
  description: string;
  metaDescription: string;
  features: SolutionFeature[];
  benefits: string[];
  process: ProcessStep[];
  stats: {
    label: string;
    value: string;
  }[];
}

export const solutions: Solution[] = [
  {
    slug: 'patient-intake',
    name: 'Patient Intake',
    tagline: 'Every Call Answered. Every Patient Captured.',
    headline: 'Never Miss Another Patient Call',
    description: 'Complete front-desk phone coverage that captures new patients and books appointments directly into your EHR. Your patients talk to real people who understand healthcare.',
    metaDescription: 'Never miss another patient call. MyBCAT\'s intake service answers every call, books appointments directly in your EHR, and recovers lost revenue.',
    features: [
      {
        title: 'Phone Answering',
        description: 'Every call answered in 3 rings by trained healthcare coordinators. No voicemail, no missed opportunities.',
        icon: 'phone'
      },
      {
        title: 'Appointment Scheduling',
        description: 'Direct booking into your EHR/PM system. We know your providers\' preferences and optimize for utilization.',
        icon: 'calendar'
      },
      {
        title: 'Insurance Verification',
        description: 'VSP, EyeMed, medical vision-we verify eligibility before appointments so there are no surprises.',
        icon: 'shield'
      },
      {
        title: 'Patient Information Collection',
        description: 'Complete intake forms, demographics, and medical history gathered before the visit.',
        icon: 'clipboard'
      }
    ],
    benefits: [
      'Never miss a new patient call',
      'Direct booking into your EHR/PM system',
      'Reduce front desk overwhelm',
      'Capture after-hours inquiries',
      'Increase appointment conversion rates'
    ],
    process: [
      {
        step: 1,
        title: 'Discovery Call',
        description: 'We learn your workflows, EHR, and pain points in a 30-minute call.'
      },
      {
        step: 2,
        title: 'Integration',
        description: 'We connect to your phone system and EHR/PM. Most integrations complete in 3-5 days.'
      },
      {
        step: 3,
        title: 'Go Live',
        description: 'AI-assisted intake starts in 5 days, full team coverage in 30-60 days.'
      }
    ],
    stats: [
      { label: 'Calls Answered', value: '100%' },
      { label: 'Average Ring Time', value: '<3 rings' },
      { label: 'Appointment Increase', value: '40%' }
    ]
  },
  {
    slug: 'recall-reactivation',
    name: 'Recall & Reactivation',
    tagline: 'Bring Your Patients Back Before They Become Lapsed',
    headline: 'Proactive Recall That Actually Works',
    description: 'Systematic outreach campaigns that reactivate dormant patients and drive recall compliance. We work your patient list so you can focus on patient care.',
    metaDescription: 'Proactive patient reactivation campaigns. We work your recall list to bring patients back before they become lapsed. Increase recall rates by 30%+.',
    features: [
      {
        title: 'Recall Campaigns',
        description: 'Systematic outreach to patients due for annual exams, follow-ups, or routine care.',
        icon: 'refresh'
      },
      {
        title: 'Reactivation Outreach',
        description: 'Targeted campaigns to bring back patients who have lapsed or missed appointments.',
        icon: 'users'
      },
      {
        title: 'Multi-Channel Contact',
        description: 'Phone, text, and email outreach based on patient preferences and response rates.',
        icon: 'message'
      },
      {
        title: 'Reporting & Analytics',
        description: 'Track campaign performance, contact rates, and booking conversions.',
        icon: 'chart'
      }
    ],
    benefits: [
      'Increase annual exam compliance',
      'Reactivate lapsed patients',
      'Fill schedule gaps proactively',
      'Reduce patient attrition',
      'Track campaign ROI'
    ],
    process: [
      {
        step: 1,
        title: 'List Analysis',
        description: 'We analyze your patient list to identify recall and reactivation opportunities.'
      },
      {
        step: 2,
        title: 'Campaign Setup',
        description: 'Design campaigns with appropriate messaging and contact cadences.'
      },
      {
        step: 3,
        title: 'Execute & Report',
        description: 'Run campaigns and provide weekly reporting on results and ROI.'
      }
    ],
    stats: [
      { label: 'Recall Rate Improvement', value: '30%+' },
      { label: 'Patient Reactivation', value: '25%' },
      { label: 'Revenue Recovered', value: '$50K+/year' }
    ]
  },
  {
    slug: 'no-show-recovery',
    name: 'No-Show Recovery',
    tagline: 'Turn Empty Slots Into Revenue',
    headline: 'Recover Revenue From Cancellations',
    description: 'Same-day and next-day recovery workflows that fill cancelled appointments quickly. Don\'t let last-minute cancellations cost you money.',
    metaDescription: 'Fill cancelled appointments fast. Our no-show recovery system contacts patients immediately and fills empty slots within hours.',
    features: [
      {
        title: 'Immediate Notification',
        description: 'Get alerted instantly when patients cancel or no-show so recovery can begin.',
        icon: 'bell'
      },
      {
        title: 'Waitlist Management',
        description: 'Maintain and work your waitlist to quickly fill cancelled slots.',
        icon: 'list'
      },
      {
        title: 'Same-Day Outreach',
        description: 'Contact patients on your bump list who can come in today.',
        icon: 'clock'
      },
      {
        title: 'No-Show Follow-Up',
        description: 'Reach out to no-shows to understand why and reschedule appropriately.',
        icon: 'phone-missed'
      }
    ],
    benefits: [
      'Fill cancelled slots same-day',
      'Reduce revenue loss from no-shows',
      'Maintain provider productivity',
      'Improve schedule utilization',
      'Track no-show patterns'
    ],
    process: [
      {
        step: 1,
        title: 'Alert Setup',
        description: 'Configure notifications for cancellations and no-shows in your EHR.'
      },
      {
        step: 2,
        title: 'Waitlist Building',
        description: 'Build and maintain a prioritized list of patients who want earlier appointments.'
      },
      {
        step: 3,
        title: 'Rapid Recovery',
        description: 'When slots open, we immediately work to fill them from your waitlist.'
      }
    ],
    stats: [
      { label: 'Slots Recovered', value: '65%' },
      { label: 'Average Fill Time', value: '<4 hours' },
      { label: 'Revenue Saved', value: '$40K+/year' }
    ]
  }
];

// Helper functions
export function getSolutionBySlug(slug: string): Solution | undefined {
  return solutions.find(s => s.slug === slug);
}

export function getAllSolutionSlugs(): string[] {
  return solutions.map(s => s.slug);
}
