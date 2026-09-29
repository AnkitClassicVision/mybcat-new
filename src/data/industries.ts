/**
 * Industry data for industry landing pages
 * Each industry has specific pain points, solutions, and messaging
 */

export type DescriptionPart =
  | { type: 'text'; value: string }
  | { type: 'link'; text: string; href: string };

export interface Industry {
  slug: string;
  name: string;
  shortName: string;
  icon: string;
  headline: string;
  seoTitle?: string;  // Optional <title> override; falls back to templated title in [slug].astro
  heroCta?: { text: string; href: string };  // Optional hero CTA override; falls back to Get Started -> /contact/
  description: string;  // Plain text only. The industries hub wraps this in a card link, so HTML here prints as raw tags.
  descriptionParts?: DescriptionPart[];  // Same words as description, with real links, for surfaces that are not already inside an anchor.
  tldr: string;  // 40-60 word summary for SEO answer-friendliness
  metaDescription: string;
  patientAcquisition: {
    definition: string;  // Answer-friendly definition for SEO
    keyMetrics: string[];
  };
  painPoints: string[];
  solutions: string[];
  primaryEHR: string[];
  stats: {
    label: string;
    value: string;
  }[];
  testimonial?: {
    quote: string;
    author: string;
    title: string;
    company?: string;
  };
}

export const industries: Industry[] = [
  {
    slug: 'optometry',
    name: 'Optometry & Ophthalmology',
    shortName: 'Optometry',
    icon: 'eye',
    headline: 'Optometry Virtual Assistants, Answering & Patient Intake',
    seoTitle: 'Optometry Virtual Assistants & Answering Service | MyBCAT',
    heroCta: { text: 'Book a Discovery Call', href: '/contact/?utm_source=seo&utm_medium=industries-optometry&utm_campaign=theme-operations' },
    description: 'Dedicated answering service and patient intake for optometry and ophthalmology practices. We understand VSP vs EyeMed, medical vs routine visits, and provider scheduling preferences. Need a dedicated VA instead? See our optometry virtual assistant service. Comparing hourly VAs such as Hello Rache? Read the Hello Rache vs MyBCAT comparison. Owners weighing a sale can start with the private practice operations guide or the optometry practice sale guide.',
    descriptionParts: [
      { type: 'text', value: 'Dedicated answering service and patient intake for optometry and ophthalmology practices. We understand VSP vs EyeMed, medical vs routine visits, and provider scheduling preferences. Need a dedicated VA instead? See our ' },
      { type: 'link', text: 'optometry virtual assistant service', href: '/solutions/optometry-virtual-assistant/' },
      { type: 'text', value: '. Comparing hourly VAs such as Hello Rache? Read the ' },
      { type: 'link', text: 'Hello Rache vs MyBCAT comparison', href: '/compare/vs-hello-rache/' },
      { type: 'text', value: '. Owners weighing a sale can start with the ' },
      { type: 'link', text: 'private practice operations guide', href: '/blog/the-complete-guide-to-running-a-private-optometric-practice/' },
      { type: 'text', value: ' or the ' },
      { type: 'link', text: 'optometry practice sale guide', href: '/blog/guide-for-selling-your-optometry-practice/' },
      { type: 'text', value: '.' },
    ],
    tldr: 'My Business Care Team provides optometry-specific phone answering and scheduling services. We understand VSP vs EyeMed insurance, route medical vs routine visits correctly, and book directly into Eyefinity, RevolutionEHR, and other eye care systems. Practices typically recover $127K+ in annual revenue from missed calls.',
    metaDescription: 'HIPAA-trained optometry patient access teams manage scheduling, insurance verification, and recall workflows across multi-location eye care groups.',
    patientAcquisition: {
      definition: 'Patient acquisition for optometry practices means converting phone calls, website inquiries, and referrals into scheduled comprehensive eye exams and optical purchases. It encompasses the full patient journey from first contact through appointment booking, including insurance verification and new patient intake.',
      keyMetrics: [
        'Call-to-appointment conversion rate',
        'New patient bookings per month',
        'Optical capture rate from exams',
        'Insurance verification accuracy'
      ]
    },
    painPoints: [
      'VSP vs EyeMed insurance complexity',
      'High volume of routine exam scheduling',
      'Medical vs routine visit routing',
      'After-hours patient inquiries',
      'Contact lens reorder management'
    ],
    solutions: [
      'Insurance-specific intake workflows',
      'Optical appointment optimization',
      'Provider preference scheduling',
      'After-hours coverage',
      'Recall campaign management'
    ],
    primaryEHR: ['Eyefinity', 'RevolutionEHR', 'Crystal PM', 'Compulink', 'MaximEyes'],
    stats: [
      { label: 'Average Revenue Lost to Missed Calls', value: '$127,000/year' },
      { label: 'Typical No-Show Rate', value: '15-25%' },
      { label: 'Calls Going to Voicemail', value: '29%' }
    ],
    testimonial: {
      quote: "Honestly it was a godsend. You have taken a process that we struggled with, and once we got the kinks figured out, you just run with it.",
      author: "Dr. Michael Dittman",
      title: "Owner",
      company: "Dittman Eye Care (5 locations)"
    }
  },
  {
    slug: 'dental',
    name: 'Dental',
    shortName: 'Dental',
    icon: 'tooth',
    headline: 'Centralized Patient Access for Dental Groups & DSOs',
    description: 'Patient intake and scheduling services designed for dental practices. From hygiene recalls to emergency appointments, we keep your chairs filled.',
    tldr: 'My Business Care Team handles dental practice phone calls with direct scheduling into Dentrix, Eaglesoft, and Open Dental. We manage hygiene recalls, new patient intake, emergency triage, and treatment follow-ups. Dental practices lose $150K+ annually to missed calls—we help you capture that revenue.',
    metaDescription: 'Dental practice answering service with direct EHR scheduling. Handle new patient calls, hygiene recalls, and emergencies professionally.',
    patientAcquisition: {
      definition: 'Patient acquisition for dental practices involves converting inquiries into scheduled appointments, maintaining hygiene recall compliance, and following up on treatment plans. It includes new patient intake, emergency scheduling, and reactivating patients who have lapsed from regular care.',
      keyMetrics: [
        'New patient appointments per month',
        'Hygiene recall rate',
        'Treatment plan acceptance rate',
        'Patient reactivation success'
      ]
    },
    painPoints: [
      'Hygiene recall management',
      'Treatment acceptance follow-up',
      'New patient conversion',
      'Emergency call handling',
      'Insurance verification complexity'
    ],
    solutions: [
      'Hygiene recall campaigns',
      'Treatment follow-up calls',
      'New patient intake optimization',
      'Emergency triage protocols',
      'Insurance pre-verification'
    ],
    primaryEHR: ['Dentrix', 'Eaglesoft', 'Open Dental', 'Curve Dental', 'Carestream'],
    stats: [
      { label: 'Average Revenue Lost to Missed Calls', value: '$150,000/year' },
      { label: 'Typical Hygiene Recall Rate', value: '45-65%' },
      { label: 'New Patient No-Show Rate', value: '20-30%' }
    ]
  },
  {
    slug: 'veterinary',
    name: 'Veterinary',
    shortName: 'Veterinary',
    icon: 'paw',
    headline: 'Phone Support for Multi-Location Veterinary Groups',
    description: 'Patient intake services that understand pet parents and animal hospital workflows. From wellness visits to emergencies, we handle it all.',
    tldr: 'My Business Care Team provides veterinary-specific answering services that understand pet parent needs. We handle emergency triage, wellness scheduling, medication refills, and multi-pet households. Our team integrates with Cornerstone, AVImark, and other veterinary practice systems.',
    metaDescription: 'Veterinary practice answering service. Handle appointment scheduling, medication refills, and emergency triage for animal hospitals.',
    patientAcquisition: {
      definition: 'Patient acquisition for veterinary practices means converting pet parent inquiries into scheduled wellness visits, managing emergency calls, and maintaining relationships with multi-pet households. It includes new client onboarding, vaccine reminders, and reactivating clients who have lapsed.',
      keyMetrics: [
        'New client bookings per month',
        'Wellness visit compliance rate',
        'Emergency call conversion rate',
        'Multi-pet household retention'
      ]
    },
    painPoints: [
      'High call volume during peak hours',
      'Emergency vs routine call triage',
      'Medication refill requests',
      'Multi-pet household scheduling',
      'After-hours emergency routing'
    ],
    solutions: [
      'Emergency call triage protocols',
      'Wellness appointment scheduling',
      'Medication refill processing',
      'Multi-pet family management',
      '24/7 emergency coverage'
    ],
    primaryEHR: ['Cornerstone', 'AVImark', 'eVetPractice', 'Shepherd', 'Digitail'],
    stats: [
      { label: 'Average Revenue Lost to Missed Calls', value: '$95,000/year' },
      { label: 'Emergency Calls After Hours', value: '35%' },
      { label: 'Multi-Pet Household Rate', value: '40%' }
    ]
  },
  {
    slug: 'medspa',
    name: 'MedSpa & Aesthetics',
    shortName: 'MedSpa',
    icon: 'sparkles',
    headline: 'Centralized Booking for Multi-Location MedSpas',
    description: 'Patient intake services designed for aesthetic practices. We understand the consultation-driven nature of medspa services and convert inquiries into bookings.',
    tldr: 'My Business Care Team provides premium phone services for medspa and aesthetics practices. We convert consultation inquiries into bookings, manage membership programs, and schedule treatment packages. With average consultation values of $2,500+, every missed call is significant lost revenue.',
    metaDescription: 'MedSpa answering service that converts inquiries into bookings. Handle consultations, treatment scheduling, and membership programs.',
    patientAcquisition: {
      definition: 'Patient acquisition for medspa practices focuses on converting high-value consultation inquiries into booked appointments and long-term client relationships. It includes capturing leads from marketing campaigns, nurturing prospects through the consultation process, and maintaining membership program engagement.',
      keyMetrics: [
        'Inquiry-to-consultation rate',
        'Consultation-to-treatment conversion',
        'Membership enrollment rate',
        'Client lifetime value'
      ]
    },
    painPoints: [
      'High-value consultation conversions',
      'Membership program management',
      'Treatment package scheduling',
      'Competitive inquiry handling',
      'After-hours luxury service expectations'
    ],
    solutions: [
      'Consultation conversion optimization',
      'Membership inquiry handling',
      'Treatment package scheduling',
      'Premium after-hours service',
      'Follow-up appointment booking'
    ],
    primaryEHR: ['Aesthetic Record', 'PatientNow', 'Nextech', 'Symplast', 'Boulevard'],
    stats: [
      { label: 'Average Consultation Value', value: '$2,500+' },
      { label: 'Inquiry-to-Booking Rate', value: '30-45%' },
      { label: 'Repeat Client Revenue', value: '65%' }
    ]
  },
  {
    slug: 'dermatology',
    name: 'Dermatology',
    shortName: 'Dermatology',
    icon: 'shield',
    headline: 'Phone Support for Multi-Location Dermatology Practices',
    description: 'Patient intake for dermatology practices handling both medical and cosmetic services. We route appropriately and capture every opportunity.',
    tldr: 'My Business Care Team handles dermatology calls for both medical and cosmetic services. We properly route skin checks vs cosmetic consultations, manage insurance vs self-pay workflows, and integrate with Modernizing Medicine, Nextech, and other derm systems.',
    metaDescription: 'Dermatology answering service for medical and cosmetic practices. Handle skin checks, cosmetic consultations, and follow-up care.',
    patientAcquisition: {
      definition: 'Patient acquisition for dermatology practices involves capturing both medical and cosmetic patients through multiple channels. It requires proper triage of urgent skin concerns, routing to appropriate providers, and converting cosmetic inquiries into high-value consultations while managing insurance and self-pay workflows.',
      keyMetrics: [
        'New patient bookings per month',
        'Cosmetic consultation conversion rate',
        'Same-day appointment fill rate',
        'Follow-up care compliance'
      ]
    },
    painPoints: [
      'Medical vs cosmetic routing',
      'Skin check urgency assessment',
      'Insurance vs self-pay workflows',
      'Provider specialty matching',
      'Biopsy result callbacks'
    ],
    solutions: [
      'Medical/cosmetic intake routing',
      'Urgency triage protocols',
      'Dual workflow management',
      'Provider matching logic',
      'Secure callback handling'
    ],
    primaryEHR: ['Modernizing Medicine', 'Nextech', 'EMA', 'DrChrono', 'AdvancedMD'],
    stats: [
      { label: 'Average Revenue Lost to Missed Calls', value: '$110,000/year' },
      { label: 'Cosmetic Consultation Value', value: '$1,800+' },
      { label: 'Skin Check Conversion Rate', value: '75%' }
    ]
  },
  {
    slug: 'urgent-care',
    name: 'Urgent Care',
    shortName: 'Urgent Care',
    icon: 'shield',
    headline: 'Centralized Patient Access for Urgent Care Chains',
    description: 'Patient intake services designed for urgent care centers handling high call volumes and walk-in traffic. We triage calls, manage wait times, and maximize patient throughput.',
    tldr: 'My Business Care Team manages high-volume urgent care phone lines so your staff can focus on patients. We handle 150-300+ daily calls, communicate real-time wait times, and balance walk-in flow with scheduled appointments. Available extended hours including weekends.',
    metaDescription: 'Urgent care answering service for walk-in clinics. Handle high call volumes, wait time inquiries, and appointment scheduling efficiently.',
    patientAcquisition: {
      definition: 'Patient acquisition for urgent care centers involves maximizing patient throughput while maintaining quality care. It includes managing high-volume phone traffic, communicating wait times effectively, balancing walk-ins with scheduled appointments, and capturing patients who might otherwise go to competitors or the ER.',
      keyMetrics: [
        'Daily patient volume',
        'Average wait time communication',
        'Call abandonment rate',
        'Return visit rate'
      ]
    },
    painPoints: [
      'Extremely high call volume during peak hours',
      'Walk-in vs appointment balance management',
      'Wait time inquiries overwhelming front desk',
      'After-hours and weekend coverage needs',
      'Multi-location coordination challenges'
    ],
    solutions: [
      'High-volume call handling capacity',
      'Real-time wait time communication',
      'Walk-in flow optimization',
      'Extended hours coverage (weekends/evenings)',
      'Multi-location centralized intake'
    ],
    primaryEHR: ['Practice Velocity', 'DocuTap', 'eClinicalWorks', 'athenahealth', 'Experity'],
    stats: [
      { label: 'Average Daily Call Volume', value: '150-300 calls' },
      { label: 'Peak Hour Call Spike', value: '3-5x normal' },
      { label: 'Calls About Wait Times', value: '40%' }
    ]
  },
  {
    slug: 'ent',
    name: 'ENT & Audiology',
    shortName: 'ENT',
    icon: 'shield',
    headline: 'Phone Support for Multi-Location ENT & Audiology Groups',
    description: 'Patient intake services for ENT practices and audiology clinics. We handle surgical scheduling, hearing aid appointments, and complex multi-visit care coordination.',
    tldr: 'My Business Care Team handles complex ENT and audiology scheduling including surgical pre-authorization, hearing aid fittings, and multi-visit care coordination. We integrate with ModMed, AdvancedMD, and specialty audiology systems to manage your diverse service lines.',
    metaDescription: 'ENT and audiology answering service. Handle hearing evaluations, surgical scheduling, and complex multi-specialty appointment coordination.',
    patientAcquisition: {
      definition: 'Patient acquisition for ENT and audiology practices involves managing complex multi-visit patient journeys across multiple service lines. It includes capturing surgical referrals, converting hearing evaluation inquiries into hearing aid sales, managing allergy patients, and coordinating care across multiple providers and specialties.',
      keyMetrics: [
        'Surgical case bookings',
        'Hearing aid conversion rate',
        'Multi-visit patient retention',
        'Referral-to-appointment rate'
      ]
    },
    painPoints: [
      'Complex surgical scheduling coordination',
      'Hearing aid fitting and follow-up management',
      'Multi-provider specialty routing',
      'Insurance authorization tracking',
      'Allergy shot scheduling and tracking'
    ],
    solutions: [
      'Surgical pre-authorization support',
      'Hearing aid appointment optimization',
      'Multi-specialty provider routing',
      'Insurance verification workflows',
      'Allergy injection scheduling'
    ],
    primaryEHR: ['ModMed', 'AdvancedMD', 'athenahealth', 'NextGen', 'Audigy'],
    stats: [
      { label: 'Average Surgical Case Value', value: '$8,500+' },
      { label: 'Hearing Aid Revenue Opportunity', value: '$3,000-6,000' },
      { label: 'Multi-Visit Patient Rate', value: '60%' }
    ]
  }
];

// Helper functions
export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find(i => i.slug === slug);
}

export function getAllIndustrySlugs(): string[] {
  return industries.map(i => i.slug);
}

for (const industry of industries) {
  if (!industry.descriptionParts) continue;
  const fromParts = industry.descriptionParts
    .map((part) => (part.type === 'link' ? part.text : part.value))
    .join('');
  if (fromParts !== industry.description) {
    throw new Error(`descriptionParts drifted from description for ${industry.slug}`);
  }
}
