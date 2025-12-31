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

export interface ProblemStatement {
  question: string;
  stats: { label: string; value: string }[];
  painPoints: string[];
}

export interface Solution {
  slug: string;
  name: string;
  tagline: string;
  headline: string;
  description: string;
  tldr: string;  // 40-60 word summary for SEO answer-friendliness
  metaDescription: string;
  serviceType: string;  // For JSON-LD Service schema
  problem: ProblemStatement;
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
    slug: 'medical-answering-service',
    name: 'Medical Answering Service',
    tagline: 'Every Call Answered. Every Patient Captured.',
    headline: 'Medical Answering Service for Healthcare Practices',
    description: '24/7 medical answering service with live healthcare coordinators who book appointments directly into your EHR. Never miss a patient call again.',
    tldr: 'My Business Care Team\'s medical answering service ensures every call is answered by a trained healthcare coordinator who books appointments directly into your EHR. We handle inbound calls, schedule appointments, collect patient information, and verify insurance—available 24/7 including after hours.',
    metaDescription: '24/7 medical answering service that books appointments directly into your EHR. HIPAA compliant, US-based healthcare coordinators. Never miss a patient call.',
    serviceType: 'Medical Answering Service',
    problem: {
      question: 'How many patient calls is your practice missing?',
      stats: [
        { label: 'Callers abandon voicemail', value: '87%' },
        { label: 'Patient lifetime value', value: '$1,500-$8,500+' },
        { label: 'Calls going to voicemail', value: '29%' }
      ],
      painPoints: [
        'Front desk too busy with in-office patients to answer every call',
        'After-hours callers leave messages that never get returned',
        'New patients call competitors when they can\'t reach you',
        'Staff turnover creates gaps in phone coverage'
      ]
    },
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
    slug: 'patient-recall',
    name: 'Patient Recall Service',
    tagline: 'Bring Your Patients Back Before They Become Lapsed',
    headline: 'Patient Recall Service That Actually Works',
    description: 'Systematic patient recall campaigns that reactivate dormant patients and drive recall compliance. We work your patient list so you can focus on patient care.',
    tldr: 'My Business Care Team\'s patient recall service proactively contacts patients due for appointments and those who have lapsed. We run multi-channel campaigns via phone, text, and email to bring patients back, improving recall compliance by 30%+ and recovering $50K+ in annual revenue.',
    metaDescription: 'Patient recall service that brings patients back before they lapse. Multi-channel outreach campaigns increase recall rates by 30%+.',
    serviceType: 'Patient Recall and Reactivation Service',
    problem: {
      question: 'How many patients are slipping through the cracks?',
      stats: [
        { label: 'Patients lapse each year', value: '20-30%' },
        { label: 'Revenue lost per lapsed patient', value: '$500-2,000' },
        { label: 'Patients don\'t return without outreach', value: '65%' }
      ],
      painPoints: [
        'Recall lists grow but staff doesn\'t have time to work them',
        'Patients forget to schedule their annual appointments',
        'No systematic process to bring back lapsed patients',
        'Front desk is too reactive to do proactive outreach'
      ]
    },
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
    tldr: 'My Business Care Team\'s no-show recovery service fills cancelled appointments within hours. When patients cancel or no-show, we immediately contact your waitlist to fill the slot. Practices typically recover 65% of cancelled appointments, saving $40K+ in annual revenue.',
    metaDescription: 'Fill cancelled appointments fast. Our no-show recovery system contacts patients immediately and fills empty slots within hours.',
    serviceType: 'Appointment No-Show Recovery Service',
    problem: {
      question: 'How much revenue are cancellations costing your practice?',
      stats: [
        { label: 'Average no-show rate', value: '15-20%' },
        { label: 'Revenue lost per empty slot', value: '$150-400' },
        { label: 'Same-day cancellations', value: '8-12%' }
      ],
      painPoints: [
        'Last-minute cancellations leave revenue on the table',
        'Staff too busy to work the waitlist effectively',
        'No systematic process to fill cancelled slots',
        'Chronic no-shows never get addressed'
      ]
    },
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
    slug: 'front-desk-outsourcing',
    name: 'Front Desk Outsourcing',
    tagline: 'Your Complete Front Desk Solution',
    headline: 'Front Desk Outsourcing for Healthcare Practices',
    description: 'Complete front desk outsourcing that goes beyond phone answering. We handle your entire patient communication workflow from first contact to appointment completion.',
    tldr: 'My Business Care Team\'s front desk outsourcing service handles your entire patient communication workflow. We manage all calls, appointment confirmations, insurance coordination, and schedule optimization—reducing staffing needs by 40+ hours per week while improving patient satisfaction.',
    metaDescription: 'Front desk outsourcing for healthcare practices. Complete call handling, scheduling, insurance coordination, and patient communications in one solution.',
    serviceType: 'Healthcare Front Desk Outsourcing',
    problem: {
      question: 'Is your front desk holding back your practice growth?',
      stats: [
        { label: 'Time spent on phone daily', value: '4-6 hours' },
        { label: 'Staff turnover in healthcare', value: '26%/year' },
        { label: 'Cost per front desk hire', value: '$4,500+' }
      ],
      painPoints: [
        'High turnover creates constant training burden',
        'Front desk overwhelmed by competing priorities',
        'Inconsistent patient experience across staff',
        'Multi-location coordination is chaotic'
      ]
    },
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
    description: 'My Business Care Team integrates directly with your existing EHR/PMS, phone system, and communication tools. No double entry, no disconnected workflows—just seamless operations.',
    tldr: 'My Business Care Team integrates directly with 50+ EHR and practice management systems including Eyefinity, Dentrix, ModMed, and more. Our team schedules appointments directly in your system—no message-taking or double entry required. Setup typically takes 3-5 days.',
    metaDescription: 'My Business Care Team integrates with major EHR and practice management systems. Eyefinity, Dentrix, ModMed, and 50+ more. Direct scheduling, no message-taking.',
    serviceType: 'Healthcare System Integration Service',
    problem: {
      question: 'Is disconnected technology slowing down your practice?',
      stats: [
        { label: 'Time lost to double entry', value: '10+ hrs/week' },
        { label: 'Data entry errors', value: '15-20%' },
        { label: 'Failed outsourcing attempts', value: '40%' }
      ],
      painPoints: [
        'Previous services just took messages, didn\'t schedule',
        'Double data entry creates errors and wastes time',
        'Disconnected systems mean constant manual updates',
        'IT complexity makes change feel impossible'
      ]
    },
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
  },
  {
    slug: 'virtual-medical-scribe',
    name: 'Virtual Medical Scribe',
    tagline: 'Documentation Done. Focus on Patients.',
    headline: 'Virtual Medical Scribe Service for Healthcare Providers',
    description: 'Remote medical scribes that handle clinical documentation in real-time. Reduce provider burnout, improve note quality, and reclaim hours each week for patient care.',
    tldr: 'My Business Care Team\'s virtual medical scribe service provides trained remote scribes who document patient encounters in real-time. Scribes work alongside providers via audio or video, completing notes during or immediately after visits—reducing documentation time by 2+ hours daily.',
    metaDescription: 'Virtual medical scribe service that handles clinical documentation in real-time. Reduce provider burnout and reclaim 2+ hours daily. HIPAA compliant.',
    serviceType: 'Virtual Medical Scribe Service',
    problem: {
      question: 'How much time are your providers losing to documentation?',
      stats: [
        { label: 'Time spent on documentation daily', value: '2-3 hours' },
        { label: 'Physicians report burnout', value: '63%' },
        { label: 'Notes completed after hours', value: '50%+' }
      ],
      painPoints: [
        'Providers spend evenings and weekends catching up on notes',
        'Documentation burden reduces patient face time',
        'EHR complexity makes charting slow and frustrating',
        'Hiring in-person scribes is expensive and hard to staff'
      ]
    },
    features: [
      {
        title: 'Real-Time Documentation',
        description: 'Scribes document encounters as they happen via audio or video connection, so notes are done when the visit ends.',
        icon: 'edit'
      },
      {
        title: 'EHR Integration',
        description: 'Direct documentation into your EHR—Epic, Cerner, Athena, ModMed, and 50+ systems supported.',
        icon: 'link'
      },
      {
        title: 'Specialty-Trained Scribes',
        description: 'Scribes trained in your specialty terminology, workflows, and documentation preferences.',
        icon: 'graduation'
      },
      {
        title: 'Quality Assurance',
        description: 'All notes reviewed for accuracy, completeness, and compliance before finalization.',
        icon: 'check-circle'
      }
    ],
    benefits: [
      'Reduce documentation time by 2+ hours daily',
      'Complete notes before leaving the office',
      'Increase patient face time',
      'Reduce provider burnout',
      'Improve note quality and completeness'
    ],
    process: [
      {
        step: 1,
        title: 'Workflow Assessment',
        description: 'We learn your documentation style, EHR workflows, and specialty requirements.'
      },
      {
        step: 2,
        title: 'Scribe Training',
        description: 'Your dedicated scribe is trained on your preferences and templates.'
      },
      {
        step: 3,
        title: 'Go Live',
        description: 'Start with supervised sessions, transition to full documentation support in 1-2 weeks.'
      }
    ],
    stats: [
      { label: 'Documentation Time Saved', value: '2+ hrs/day' },
      { label: 'Notes Completed Same-Day', value: '95%+' },
      { label: 'Provider Satisfaction', value: '98%' }
    ]
  },
  {
    slug: 'medical-virtual-assistant',
    name: 'Medical Virtual Assistant',
    tagline: 'Your Dedicated Remote Healthcare Admin',
    headline: 'Medical Virtual Assistant Service for Healthcare Practices',
    description: 'Dedicated remote healthcare virtual assistants who handle administrative tasks, patient coordination, and back-office operations. Full-time support without the overhead of in-house staff.',
    tldr: 'My Business Care Team\'s medical virtual assistant service provides dedicated remote staff trained in healthcare administration. Your VA handles scheduling, insurance verification, referral coordination, billing follow-up, and administrative tasks—reducing overhead by 50% compared to in-house hires.',
    metaDescription: 'Medical virtual assistant service with dedicated remote healthcare staff. Scheduling, insurance verification, billing, and admin support at 50% less than in-house.',
    serviceType: 'Medical Virtual Assistant Service',
    problem: {
      question: 'Is administrative work slowing down your practice?',
      stats: [
        { label: 'Admin tasks per patient visit', value: '15-20 min' },
        { label: 'Staff time on insurance/billing', value: '30%+' },
        { label: 'Average cost per FTE', value: '$45K+/year' }
      ],
      painPoints: [
        'Administrative burden takes time away from patient care',
        'Hiring and training staff is expensive and time-consuming',
        'Insurance verification and prior auth delays slow revenue',
        'Referral coordination falls through the cracks'
      ]
    },
    features: [
      {
        title: 'Dedicated Virtual Assistant',
        description: 'A single dedicated VA who learns your practice, not a rotating pool of agents.',
        icon: 'user'
      },
      {
        title: 'Insurance & Billing Support',
        description: 'Benefits verification, prior authorizations, claim follow-up, and patient billing inquiries.',
        icon: 'shield'
      },
      {
        title: 'Referral Coordination',
        description: 'Manage incoming and outgoing referrals, follow up on pending authorizations, and track referral status.',
        icon: 'share'
      },
      {
        title: 'Administrative Tasks',
        description: 'Medical records requests, fax management, patient correspondence, and general admin support.',
        icon: 'clipboard'
      }
    ],
    benefits: [
      'Dedicated staff who knows your practice',
      '50% cost savings vs in-house hire',
      'No recruiting, training, or HR overhead',
      'Flexible hours based on your needs',
      'HIPAA-trained healthcare professionals'
    ],
    process: [
      {
        step: 1,
        title: 'Needs Assessment',
        description: 'We identify your administrative pain points and task requirements.'
      },
      {
        step: 2,
        title: 'VA Matching',
        description: 'Match you with a VA whose skills and experience fit your practice needs.'
      },
      {
        step: 3,
        title: 'Onboarding',
        description: 'Your VA is trained on your systems, workflows, and preferences before starting.'
      }
    ],
    stats: [
      { label: 'Cost Savings vs In-House', value: '50%' },
      { label: 'Tasks Handled Per Day', value: '40+' },
      { label: 'Retention Rate', value: '95%' }
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
