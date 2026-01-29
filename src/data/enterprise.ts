/**
 * Enterprise/Multi-Location data for enterprise landing pages
 * Targeting DSOs, healthcare groups, and scaling practices
 */

export interface EnterpriseFeature {
  title: string;
  description: string;
  icon: string;
}

export interface EnterpriseStat {
  value: string;
  label: string;
}

export interface EnterprisePainPoint {
  title: string;
  description: string;
}

export interface EnterpriseVertical {
  slug: string;
  name: string;
  shortName: string;
  headline: string;
  tagline: string;
  description: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  parentIndustrySlug?: string;
  icon: string;
  painPoints: EnterprisePainPoint[];
  solutions: EnterpriseFeature[];
  integrations: string[];
  stats: EnterpriseStat[];
  cta: {
    primary: string;
    secondary: string;
  };
}

// Enterprise hub page content
export const enterpriseHub = {
  title: 'Multi-Location Patient Operations',
  headline: 'One Team. Every Location. Every Call.',
  tagline: 'Centralized patient operations for healthcare groups scaling from 3 to 300 locations',
  metaDescription: 'Centralized patient operations for DSOs and multi-location practices. One team for calls, scheduling, intake.',
  primaryKeyword: 'centralized healthcare call center',
  secondaryKeywords: [
    'multi-location medical answering service',
    'healthcare group phone support',
    'centralized patient scheduling'
  ],

  // Problem section
  problem: {
    headline: 'The Multi-Location Phone Problem',
    description: 'As you grow, phone operations get harder, not easier. Every new location multiplies complexity.',
    stats: [
      { value: '34%', label: 'Higher turnover at multi-location practices' },
      { value: '$4,500', label: 'Cost to hire and train each front desk employee' },
      { value: '23%', label: 'Of calls go unanswered during peak hours' }
    ],
    painPoints: [
      {
        title: 'Inconsistent Patient Experience',
        description: 'Every location handles calls differently. New patients get different experiences depending on who answers.'
      },
      {
        title: 'Training Never Ends',
        description: 'High turnover means constant training. As soon as someone is proficient, they leave.'
      },
      {
        title: 'No Visibility Across Locations',
        description: 'You can not see call volume, answer rates, or booking rates across all locations in one place.'
      },
      {
        title: 'Scaling Means More Chaos',
        description: 'Adding locations should mean more revenue, not more operational headaches.'
      }
    ]
  },

  // Solution section
  solution: {
    headline: 'Centralized Operations, Local Feel',
    description: 'One trained team handles patient calls for all your locations. They know your protocols, your providers, and your patients.',
    capabilities: [
      {
        title: 'Multi-Location Call Routing',
        description: 'Calls route to the right team member based on location, call type, and availability. No patient waits.',
        icon: 'phone'
      },
      {
        title: 'Unified EHR Access',
        description: 'We schedule directly into each location\'s EHR. Dentrix, Eyefinity, ModMed—we integrate with 50+ systems.',
        icon: 'link'
      },
      {
        title: 'Location-Specific Protocols',
        description: 'Each location can have unique scheduling rules, provider preferences, and patient communication styles.',
        icon: 'settings'
      },
      {
        title: 'Centralized Reporting',
        description: 'See call volume, answer rates, booking rates, and patient satisfaction across all locations in one dashboard.',
        icon: 'chart'
      },
      {
        title: 'Overflow Between Locations',
        description: 'When one location is slammed, calls overflow to the central team. No more voicemail during rush hours.',
        icon: 'refresh'
      },
      {
        title: 'Scalable Infrastructure',
        description: 'Adding a location takes days, not months. Our team expands with you.',
        icon: 'growth'
      }
    ]
  },

  // Process section
  process: [
    {
      step: 1,
      title: 'Discovery & Planning',
      description: 'We map your locations, EHR systems, and workflows. We identify quick wins and build a rollout plan.'
    },
    {
      step: 2,
      title: 'Phased Onboarding',
      description: 'We start with 1-2 locations, perfect the process, then roll out to remaining locations.'
    },
    {
      step: 3,
      title: 'Centralized Operations',
      description: 'Your dedicated team handles all locations with consistent quality and real-time reporting.'
    }
  ],

  // Trust elements
  trust: [
    { value: '70+', label: 'Healthcare Practices Served' },
    { value: '50+', label: 'EHR Integrations' },
    { value: '100%', label: 'HIPAA Compliant' },
    { value: '<3', label: 'Rings to Answer' }
  ]
};

// Enterprise verticals
export const enterpriseVerticals: EnterpriseVertical[] = [
  {
    slug: 'dso',
    name: 'DSOs & Dental Groups',
    shortName: 'DSOs',
    headline: 'Patient Operations Built for DSOs',
    tagline: 'From 5 locations to 500, we scale with you',
    description: 'Centralized call handling, scheduling, and patient communication for dental support organizations. We integrate with Dentrix, Eaglesoft, Open Dental, and every major dental PM system.',
    metaDescription: 'Patient operations for DSOs. Centralized call handling, Dentrix/Eaglesoft/Open Dental scheduling.',
    primaryKeyword: 'DSO answering service',
    secondaryKeywords: ['dental group phone support', 'dental support organization call center', 'DSO patient communication'],
    parentIndustrySlug: 'dental',
    icon: 'tooth',
    painPoints: [
      {
        title: 'PM System Fragmentation',
        description: 'Different locations on different systems. Dentrix here, Eaglesoft there. No unified view.'
      },
      {
        title: 'Inconsistent Phone Experience',
        description: 'Patients calling Location A get a different experience than Location B. Brand consistency suffers.'
      },
      {
        title: 'Training Burden at Scale',
        description: 'With 26% annual turnover in dental, you are always training. It never stops.'
      },
      {
        title: 'Hygiene Recall Falls Through',
        description: 'Proactive recall requires consistent outreach. Busy front desks can not keep up.'
      }
    ],
    solutions: [
      {
        title: 'Multi-System Integration',
        description: 'We work in Dentrix, Eaglesoft, Open Dental, Curve, and more. One team, every system.',
        icon: 'link'
      },
      {
        title: 'Consistent Brand Experience',
        description: 'Every call answered the same way. Every patient gets the same quality experience.',
        icon: 'users'
      },
      {
        title: 'Hygiene Recall at Scale',
        description: 'Proactive outreach to patients due for cleanings. Across all locations, systematically.',
        icon: 'refresh'
      },
      {
        title: 'Treatment Plan Follow-Up',
        description: 'Patients who left with unscheduled treatment get follow-up calls. More case acceptance.',
        icon: 'calendar'
      }
    ],
    integrations: ['Dentrix', 'Eaglesoft', 'Open Dental', 'Curve Dental', 'Denticon', 'Planet DDS'],
    stats: [
      { value: '40%', label: 'Increase in Hygiene Recall' },
      { value: '30%', label: 'Reduction in Staffing Costs' },
      { value: '100%', label: 'Call Answer Rate' }
    ],
    cta: {
      primary: 'Talk to Our DSO Team',
      secondary: 'See DSO Case Studies'
    }
  },
  {
    slug: 'optometry-groups',
    name: 'Optometry Groups',
    shortName: 'Optometry',
    headline: 'Phone Support for Multi-Location Optometry',
    tagline: 'Unified patient operations for growing eye care groups',
    description: 'Centralized call handling and scheduling for optometry groups. We integrate with Eyefinity, Crystal PM, Compulink, and handle vision insurance verification across all locations.',
    metaDescription: 'Phone support for multi-location optometry groups. Centralized scheduling, Eyefinity integration, and vision insurance verification across all your practices.',
    primaryKeyword: 'optometry group answering service',
    secondaryKeywords: ['multi-location optometry phone', 'eye care group scheduling', 'optometry practice management'],
    parentIndustrySlug: 'optometry',
    icon: 'eye',
    painPoints: [
      {
        title: 'Vision Insurance Complexity',
        description: 'VSP, EyeMed, Spectera—each location handles verification differently. Errors cost money.'
      },
      {
        title: 'Annual Exam Recall',
        description: 'Patients need annual exams but forget to schedule. Proactive recall requires dedicated effort.'
      },
      {
        title: 'Optical Sales Coordination',
        description: 'Frame orders, contact lens reorders, and optical pickups need tracking across locations.'
      },
      {
        title: 'After-Hours Coverage',
        description: 'Eye emergencies happen after hours. Patients need someone to answer.'
      }
    ],
    solutions: [
      {
        title: 'Vision Insurance Verification',
        description: 'VSP, EyeMed, medical vision—we verify before every appointment, every location.',
        icon: 'shield'
      },
      {
        title: 'Annual Exam Recall',
        description: 'Systematic outreach to patients due for annual exams. Higher recall rates, fuller schedules.',
        icon: 'refresh'
      },
      {
        title: 'Contact Lens Reorder Calls',
        description: 'Proactive outreach when patients are due for contact lens reorders.',
        icon: 'phone'
      },
      {
        title: 'Eyefinity & PM Integration',
        description: 'Direct scheduling into Eyefinity, Crystal PM, Compulink, Revolution EHR, and more.',
        icon: 'link'
      }
    ],
    integrations: ['Eyefinity', 'Crystal PM', 'Compulink', 'Revolution EHR', 'MaximEyes', 'My Vision Express'],
    stats: [
      { value: '35%', label: 'Increase in Annual Exam Recall' },
      { value: '100%', label: 'Insurance Verified Before Visit' },
      { value: '24/7', label: 'After-Hours Coverage' }
    ],
    cta: {
      primary: 'Talk to Our Optometry Team',
      secondary: 'See Optometry Case Studies'
    }
  },
  {
    slug: 'veterinary-groups',
    name: 'Veterinary Groups',
    shortName: 'Veterinary',
    headline: 'Centralized Intake for Corporate Vet Practices',
    tagline: 'Professional phone support for growing veterinary networks',
    description: 'Centralized call handling for veterinary groups. We integrate with Cornerstone, AVImark, eVetPractice, and handle appointment scheduling, prescription refills, and emergency triage across all locations.',
    metaDescription: 'Centralized phone support for veterinary groups. Multi-location scheduling, Cornerstone integration, and 24/7 emergency triage for corporate vet practices.',
    primaryKeyword: 'veterinary group answering service',
    secondaryKeywords: ['corporate veterinary phone support', 'vet clinic call center', 'multi-location veterinary scheduling'],
    parentIndustrySlug: 'veterinary',
    icon: 'paw',
    painPoints: [
      {
        title: 'After-Hours Emergencies',
        description: 'Pet emergencies do not wait for business hours. Owners need guidance on what to do.'
      },
      {
        title: 'Prescription Refill Calls',
        description: 'High call volume for routine refills ties up staff who should be helping patients.'
      },
      {
        title: 'Multi-Location Scheduling Complexity',
        description: 'Different vets, different specialties, different availability across locations.'
      },
      {
        title: 'Client Communication at Scale',
        description: 'Vaccine reminders, wellness visit recalls, and follow-ups across thousands of patients.'
      }
    ],
    solutions: [
      {
        title: '24/7 Emergency Triage',
        description: 'After-hours calls answered and triaged. True emergencies directed to ER, others scheduled.',
        icon: 'clock'
      },
      {
        title: 'Prescription Refill Handling',
        description: 'We handle routine refill requests, freeing your team for patient care.',
        icon: 'clipboard'
      },
      {
        title: 'Multi-Location Scheduling',
        description: 'Book appointments at any location based on availability, specialty, and client preference.',
        icon: 'calendar'
      },
      {
        title: 'Wellness Recall Campaigns',
        description: 'Systematic outreach for vaccines, wellness visits, and preventive care.',
        icon: 'refresh'
      }
    ],
    integrations: ['Cornerstone', 'AVImark', 'eVetPractice', 'Shepherd', 'Covetrus Pulse', 'IDEXX Neo'],
    stats: [
      { value: '100%', label: 'After-Hours Calls Answered' },
      { value: '25%', label: 'Reduction in Missed Appointments' },
      { value: '40%', label: 'Increase in Wellness Compliance' }
    ],
    cta: {
      primary: 'Talk to Our Veterinary Team',
      secondary: 'See Veterinary Case Studies'
    }
  },
  {
    slug: 'urgent-care-chains',
    name: 'Urgent Care Chains',
    shortName: 'Urgent Care',
    headline: 'Phone Support for Urgent Care Networks',
    tagline: 'Handle high call volume across all your urgent care locations',
    description: 'Centralized call handling for urgent care chains. We manage high call volume, provide wait time information, and route patients to the right location based on services and capacity.',
    metaDescription: 'Phone support for urgent care chains. Centralized call handling, wait time management, and patient routing across all your urgent care locations.',
    primaryKeyword: 'urgent care chain answering service',
    secondaryKeywords: ['urgent care call center', 'multi-location urgent care phone', 'urgent care patient routing'],
    parentIndustrySlug: 'urgent-care',
    icon: 'clock',
    painPoints: [
      {
        title: 'High Call Volume Spikes',
        description: 'Flu season, COVID surges—call volume spikes unpredictably. Staff can not keep up.'
      },
      {
        title: 'Wait Time Questions',
        description: 'Patients call to ask wait times. These calls take staff away from check-in.'
      },
      {
        title: 'Service Availability',
        description: 'Not every location offers every service. Patients need routing to the right clinic.'
      },
      {
        title: 'After-Hours Guidance',
        description: 'When clinics close, patients still call. They need guidance on ER vs. waiting.'
      }
    ],
    solutions: [
      {
        title: 'Scalable Call Handling',
        description: 'We scale up during volume spikes. No patient waits on hold.',
        icon: 'growth'
      },
      {
        title: 'Wait Time Information',
        description: 'Real-time wait time updates to callers. Reduces unnecessary calls to locations.',
        icon: 'clock'
      },
      {
        title: 'Intelligent Patient Routing',
        description: 'Route patients to the right location based on services needed and current capacity.',
        icon: 'map'
      },
      {
        title: 'After-Hours Triage',
        description: 'Guide patients on appropriate level of care when your clinics are closed.',
        icon: 'phone'
      }
    ],
    integrations: ['athenahealth', 'eClinicalWorks', 'DocuTAP', 'Practice Velocity', 'Experity'],
    stats: [
      { value: '<30s', label: 'Average Answer Time' },
      { value: '50%', label: 'Reduction in Location Call Volume' },
      { value: '24/7', label: 'After-Hours Support' }
    ],
    cta: {
      primary: 'Talk to Our Urgent Care Team',
      secondary: 'See Urgent Care Case Studies'
    }
  }
];

// Enterprise capability pages (new landing pages for SEO)
export interface EnterpriseCapabilityPage {
  slug: string;
  name: string;
  headline: string;
  tagline: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  icon: string;
  problemStatement: string;
  painPoints: string[];
  features: EnterpriseFeature[];
  stats: EnterpriseStat[];
  relatedVerticals: string[];
}

export const enterpriseCapabilityPages: EnterpriseCapabilityPage[] = [
  {
    slug: 'patient-access-center',
    name: 'Patient Access Center',
    headline: 'Centralized Patient Access for Healthcare Groups',
    tagline: 'One team. Every location. Every patient call handled right.',
    metaDescription: 'Centralized patient access center for multi-location healthcare groups. Unified call handling, scheduling, and intake across all your locations.',
    primaryKeyword: 'centralized patient access center',
    secondaryKeywords: ['healthcare call center', 'patient access services', 'medical call handling'],
    icon: 'phone',
    problemStatement: 'When you have 5, 10, or 50+ locations, every location handling calls differently creates chaos. Patients get inconsistent experiences, staff turnover creates constant training gaps, and you have zero visibility into what\'s actually happening on the phones.',
    painPoints: [
      'Inconsistent patient experience across locations',
      'High turnover means constant training',
      'No unified reporting or visibility',
      'Overflow calls go to voicemail',
      'Adding new locations multiplies chaos'
    ],
    features: [
      { title: 'Single Team, All Locations', description: 'Your dedicated team knows every location\'s protocols, providers, and systems. Patients get the same quality experience no matter which location they\'re calling.', icon: 'users' },
      { title: 'Direct EHR Scheduling', description: 'We schedule directly into each location\'s system—Dentrix, Eyefinity, ModMed, or whatever you use. No callbacks, no delays.', icon: 'link' },
      { title: 'Location-Specific Routing', description: 'Calls route intelligently based on the location called, service needed, and provider availability.', icon: 'map' },
      { title: 'Unified Reporting Dashboard', description: 'See call volume, answer rates, booking rates, and patient satisfaction across all locations in one place.', icon: 'chart' }
    ],
    stats: [
      { value: '100%', label: 'Calls Answered' },
      { value: '<3', label: 'Rings to Answer' },
      { value: '50+', label: 'EHR Integrations' }
    ],
    relatedVerticals: ['dso', 'optometry-groups', 'veterinary-groups', 'urgent-care-chains']
  },
  {
    slug: 'centralized-scheduling',
    name: 'Centralized Scheduling',
    headline: 'Multi-Location Scheduling That Actually Works',
    tagline: 'Fill schedules across all locations from one coordinated team.',
    metaDescription: 'Centralized scheduling for multi-location healthcare groups. Direct EHR booking, provider preference management, and optimized scheduling across all your practices.',
    primaryKeyword: 'multi-location scheduling',
    secondaryKeywords: ['centralized healthcare scheduling', 'medical appointment scheduling', 'practice management scheduling'],
    icon: 'calendar',
    problemStatement: 'Scheduling across multiple locations is a nightmare. Different systems, different provider preferences, different availability—and when one location is overbooked while another has openings, patients wait unnecessarily.',
    painPoints: [
      'Different scheduling systems at different locations',
      'Provider preferences not communicated',
      'Can\'t balance capacity across locations',
      'Double-bookings and scheduling errors',
      'New patients lost to booking friction'
    ],
    features: [
      { title: 'Multi-System Expertise', description: 'We work in Dentrix, Eaglesoft, Eyefinity, Crystal PM, Cornerstone, and 50+ other systems. One team handles all your systems.', icon: 'link' },
      { title: 'Provider Preference Management', description: 'We know which providers want buffer time, who sees complex cases, and who prefers certain appointment types.', icon: 'users' },
      { title: 'Cross-Location Optimization', description: 'When one location is full, we route patients to nearby locations with availability. Maximum efficiency, minimum patient wait.', icon: 'map' },
      { title: 'Real-Time Availability', description: 'Live access to each location\'s schedule means we book accurately, every time. No callbacks to confirm.', icon: 'clock' }
    ],
    stats: [
      { value: '98%', label: 'First-Call Resolution' },
      { value: '35%', label: 'Reduction in No-Shows' },
      { value: '50+', label: 'Systems We Use' }
    ],
    relatedVerticals: ['dso', 'optometry-groups', 'urgent-care-chains']
  },
  {
    slug: 'multi-location-recall',
    name: 'Multi-Location Recall',
    headline: 'Patient Recall at Scale',
    tagline: 'Systematic outreach that brings patients back across all your locations.',
    metaDescription: 'Multi-location patient recall services for healthcare groups. Hygiene recall, annual exams, wellness visits—systematically handled across all your practices.',
    primaryKeyword: 'multi-location patient recall',
    secondaryKeywords: ['dental hygiene recall', 'patient reactivation', 'wellness recall campaigns'],
    icon: 'refresh',
    problemStatement: 'Recall is the first thing that slips when front desks get busy. Patients due for hygiene cleanings, annual exams, and wellness visits fall through the cracks—and that\'s revenue walking out the door.',
    painPoints: [
      'Front desk too busy for proactive outreach',
      'Inconsistent recall efforts across locations',
      'Patients due for care not being contacted',
      'No visibility into recall rates by location',
      'Revenue lost to lapsed patients'
    ],
    features: [
      { title: 'Systematic Outreach', description: 'We don\'t wait for patients to remember—we proactively reach out when they\'re due for care. Hygiene, annual exams, wellness visits.', icon: 'phone' },
      { title: 'Multi-Channel Contact', description: 'Phone calls, text reminders, email follow-ups—we use the channel most likely to reach each patient.', icon: 'users' },
      { title: 'Location-Level Reporting', description: 'See recall rates, contact rates, and reactivation success for each location. Identify which locations need attention.', icon: 'chart' },
      { title: 'Integrated Scheduling', description: 'When patients are ready to book, we schedule them immediately. No handoffs, no delays, no lost opportunities.', icon: 'calendar' }
    ],
    stats: [
      { value: '40%', label: 'Increase in Recall Rate' },
      { value: '25%', label: 'Patient Reactivation' },
      { value: '3x', label: 'ROI on Recall Campaigns' }
    ],
    relatedVerticals: ['dso', 'optometry-groups', 'veterinary-groups']
  },
  {
    slug: 'reporting-qa',
    name: 'Reporting & QA',
    headline: 'Visibility Across All Your Locations',
    tagline: 'Dashboards, scorecards, and QA that keep your operations on track.',
    metaDescription: 'Enterprise reporting and QA for multi-location healthcare groups. Call analytics, agent scorecards, and quality assurance across all your practices.',
    primaryKeyword: 'healthcare call center reporting',
    secondaryKeywords: ['QA dashboards', 'call center scorecards', 'patient access analytics'],
    icon: 'chart',
    problemStatement: 'You can\'t improve what you can\'t measure. Most multi-location groups have no idea how their phone operations are performing—call volume, answer rates, booking rates, patient satisfaction. You\'re flying blind.',
    painPoints: [
      'No visibility into call handling across locations',
      'Can\'t identify underperforming locations',
      'Quality varies without QA processes',
      'No data to support staffing decisions',
      'Patient complaints surface too late'
    ],
    features: [
      { title: 'Real-Time Dashboards', description: 'See call volume, answer rates, average handle time, and booking rates across all locations—updated in real time.', icon: 'chart' },
      { title: 'Agent Scorecards', description: 'Track individual agent performance on call quality, patient satisfaction, and key metrics. Identify coaching opportunities.', icon: 'users' },
      { title: 'Location Comparisons', description: 'Compare performance across locations. See which sites are excelling and which need support.', icon: 'map' },
      { title: 'QA Call Reviews', description: 'Regular call audits ensure quality stays high. We share feedback and continuously improve.', icon: 'shield' }
    ],
    stats: [
      { value: '100%', label: 'Call Recording' },
      { value: 'Weekly', label: 'QA Reviews' },
      { value: 'Real-Time', label: 'Dashboard Updates' }
    ],
    relatedVerticals: ['dso', 'optometry-groups', 'veterinary-groups', 'urgent-care-chains']
  }
];

// Rollout timeline for enterprise implementations
export const enterpriseRolloutTimeline = {
  phases: [
    {
      phase: 'Discovery',
      duration: 'Week 1',
      description: 'Map locations, systems, and workflows',
      activities: ['EHR/PM system inventory', 'Workflow documentation', 'Protocol capture', 'Team introductions']
    },
    {
      phase: 'Pilot Setup',
      duration: 'Week 2-3',
      description: 'Configure and launch 1-2 pilot locations',
      activities: ['System access setup', 'Protocol training', 'Call routing configuration', 'Go-live with pilot sites']
    },
    {
      phase: 'Pilot Optimization',
      duration: 'Week 4-6',
      description: 'Refine processes based on pilot learnings',
      activities: ['Performance review', 'Protocol adjustments', 'Team calibration', 'Reporting setup']
    },
    {
      phase: 'Phased Rollout',
      duration: 'Week 7+',
      description: 'Expand to remaining locations',
      activities: ['Add 2-3 locations per week', 'Ongoing QA and training', 'Dashboard expansion', 'Continuous improvement']
    }
  ],
  successMetrics: {
    day30: [
      'Pilot locations fully operational',
      'Call answer rate >95%',
      'First-call resolution >90%',
      'Team handling protocols independently'
    ],
    day60: [
      '50% of locations onboarded',
      'Reporting dashboard live',
      'QA process established',
      'Patient satisfaction baseline set'
    ],
    day90: [
      'All locations live',
      'Performance targets met',
      'Recall campaigns launched',
      'ROI metrics documented'
    ]
  }
};

// Helper functions
export function getEnterpriseVerticalBySlug(slug: string): EnterpriseVertical | undefined {
  return enterpriseVerticals.find(v => v.slug === slug);
}

export function getAllEnterpriseVerticalSlugs(): string[] {
  return enterpriseVerticals.map(v => v.slug);
}

export function getEnterpriseCapabilityBySlug(slug: string): EnterpriseCapabilityPage | undefined {
  return enterpriseCapabilityPages.find(p => p.slug === slug);
}

export function getAllEnterpriseCapabilitySlugs(): string[] {
  return enterpriseCapabilityPages.map(p => p.slug);
}
