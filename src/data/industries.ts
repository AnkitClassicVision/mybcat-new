/**
 * Industry data for industry landing pages
 * Each industry has specific pain points, solutions, and messaging
 */

export interface Industry {
  slug: string;
  name: string;
  shortName: string;
  icon: string;
  headline: string;
  description: string;
  metaDescription: string;
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
    headline: 'Optometry Patient Intake That Understands Eye Care',
    description: 'Dedicated patient intake solutions for optometry and ophthalmology practices. We understand VSP vs EyeMed, medical vs routine visits, and provider scheduling preferences.',
    metaDescription: 'Optometry answering service built for eye care practices. We integrate with Eyefinity, handle comprehensive exam scheduling, and drive optical sales.',
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
    headline: 'Dental Practice Phone Coverage That Converts',
    description: 'Patient intake and scheduling services designed for dental practices. From hygiene recalls to emergency appointments, we keep your chairs filled.',
    metaDescription: 'Dental practice answering service with direct EHR scheduling. Handle new patient calls, hygiene recalls, and emergencies professionally.',
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
    headline: 'Veterinary Practice Support for Busy Animal Hospitals',
    description: 'Patient intake services that understand pet parents and animal hospital workflows. From wellness visits to emergencies, we handle it all.',
    metaDescription: 'Veterinary practice answering service. Handle appointment scheduling, medication refills, and emergency triage for animal hospitals.',
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
    headline: 'MedSpa Booking That Matches Your Premium Experience',
    description: 'Patient intake services designed for aesthetic practices. We understand the consultation-driven nature of medspa services and convert inquiries into bookings.',
    metaDescription: 'MedSpa answering service that converts inquiries into bookings. Handle consultations, treatment scheduling, and membership programs.',
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
    headline: 'Dermatology Practice Support for Medical & Cosmetic',
    description: 'Patient intake for dermatology practices handling both medical and cosmetic services. We route appropriately and capture every opportunity.',
    metaDescription: 'Dermatology answering service for medical and cosmetic practices. Handle skin checks, cosmetic consultations, and follow-up care.',
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
  }
];

// Helper functions
export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find(i => i.slug === slug);
}

export function getAllIndustrySlugs(): string[] {
  return industries.map(i => i.slug);
}
