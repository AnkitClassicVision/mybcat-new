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
  tldr: string;  // 40-60 word summary for SEO answer-friendliness
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
    tldr: 'mybcat\'s patient intake service ensures every call is answered by a trained healthcare coordinator who books appointments directly into your EHR. We handle inbound calls, schedule appointments, collect patient information, and verify insurance—so your front desk can focus on patients in the office.',
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
    tldr: 'mybcat\'s recall and reactivation service proactively contacts patients due for appointments and those who have lapsed. We run multi-channel campaigns via phone, text, and email to bring patients back, improving recall compliance by 30%+ and recovering $50K+ in annual revenue.',
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
    tldr: 'mybcat\'s no-show recovery service fills cancelled appointments within hours. When patients cancel or no-show, we immediately contact your waitlist to fill the slot. Practices typically recover 65% of cancelled appointments, saving $40K+ in annual revenue.',
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
  },
  {
    slug: 'front-office-operations',
    name: 'Front Office Operations',
    tagline: 'Your Complete Front Desk Solution',
    headline: 'Comprehensive Front Office Support',
    description: 'End-to-end front office operations that go beyond just phone answering. We handle your complete patient communication workflow from first contact to appointment completion.',
    tldr: 'mybcat\'s front office operations service handles your entire patient communication workflow. We manage all calls, appointment confirmations, insurance coordination, and schedule optimization—reducing staffing needs by 40+ hours per week while improving patient satisfaction.',
    metaDescription: 'Complete front office outsourcing for healthcare practices. Handle calls, scheduling, insurance, and patient communications all in one solution.',
    features: [
      {
        title: 'Complete Call Handling',
        description: 'All inbound calls handled professionally—new patients, existing patients, insurance questions, and general inquiries.',
        icon: 'phone'
      },
      {
        title: 'Patient Communications',
        description: 'Appointment confirmations, reminder calls, and follow-up communications managed systematically.',
        icon: 'message'
      },
      {
        title: 'Insurance Coordination',
        description: 'Benefits verification, pre-authorization, and insurance question handling.',
        icon: 'shield'
      },
      {
        title: 'Schedule Optimization',
        description: 'Proactive schedule management to maximize provider productivity and minimize gaps.',
        icon: 'calendar'
      }
    ],
    benefits: [
      'Reduce front desk staffing needs',
      'Consistent patient experience',
      'Eliminate phone overflow',
      'Centralized operations for multi-location practices',
      'Cost savings vs in-house staff'
    ],
    process: [
      {
        step: 1,
        title: 'Operations Audit',
        description: 'We document your current workflows, bottlenecks, and opportunities.'
      },
      {
        step: 2,
        title: 'Team Training',
        description: 'Our team is trained on your specific protocols, preferences, and systems.'
      },
      {
        step: 3,
        title: 'Phased Rollout',
        description: 'Gradual transition of operations with oversight until fully operational.'
      }
    ],
    stats: [
      { label: 'Staff Time Saved', value: '40+ hrs/week' },
      { label: 'Cost Savings vs In-House', value: '30-50%' },
      { label: 'Patient Satisfaction', value: '95%+' }
    ]
  },
  {
    slug: 'integrations',
    name: 'EHR & PMS Integrations',
    tagline: 'Direct Connection to Your Systems',
    headline: 'Seamless Integration With Your Practice Systems',
    description: 'mybcat integrates directly with your existing EHR/PMS, phone system, and communication tools. No double entry, no disconnected workflows—just seamless operations.',
    tldr: 'mybcat integrates directly with 50+ EHR and practice management systems including Eyefinity, Dentrix, ModMed, and more. Our team schedules appointments directly in your system—no message-taking or double entry required. Setup typically takes 3-5 days.',
    metaDescription: 'mybcat integrates with major EHR and practice management systems. Eyefinity, Dentrix, ModMed, and 50+ more. Direct scheduling, no message-taking.',
    features: [
      {
        title: 'Direct EHR/PMS Access',
        description: 'Our team schedules directly in your system—Eyefinity, Dentrix, ModMed, and many more.',
        icon: 'link'
      },
      {
        title: 'Phone System Integration',
        description: 'Seamless connection to your existing phone system via forwarding, VoIP, or direct integration.',
        icon: 'phone'
      },
      {
        title: 'Real-Time Sync',
        description: 'Appointments, patient notes, and updates sync instantly—no delays or data gaps.',
        icon: 'refresh'
      },
      {
        title: 'Secure Access',
        description: 'HIPAA-compliant access with role-based permissions and full audit trails.',
        icon: 'shield'
      }
    ],
    benefits: [
      'No double data entry',
      'Real-time visibility into your schedule',
      'Eliminate manual message-taking',
      'Consistent with your existing workflows',
      'Minimal IT involvement required'
    ],
    process: [
      {
        step: 1,
        title: 'System Assessment',
        description: 'We identify your EHR/PMS and determine the best integration approach.'
      },
      {
        step: 2,
        title: 'Access Setup',
        description: 'Secure user accounts created with appropriate permissions for our team.'
      },
      {
        step: 3,
        title: 'Testing & Validation',
        description: 'Full integration testing before any patient-facing work begins.'
      }
    ],
    stats: [
      { label: 'EHR Systems Supported', value: '50+' },
      { label: 'Average Setup Time', value: '3-5 days' },
      { label: 'Integration Success Rate', value: '100%' }
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
