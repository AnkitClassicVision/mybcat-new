/**
 * Glossary terms for the glossary section
 * Each term has a definition, related terms, and related solutions
 */

export interface GlossaryTerm {
  slug: string;
  term: string;
  definition: string;
  detailedExplanation: string;
  category: 'operations' | 'technology' | 'compliance' | 'metrics' | 'marketing';
  relatedTerms: string[];
  relatedSolutions: string[];
  examples?: string[];
}

export const glossaryTerms: GlossaryTerm[] = [
  {
    slug: 'patient-acquisition',
    term: 'Patient Acquisition',
    definition: 'The process of attracting and converting new patients to a healthcare practice through marketing, referrals, and operational excellence.',
    detailedExplanation: 'Patient acquisition encompasses all activities that bring new patients into a practice. This includes marketing efforts, referral programs, online presence management, and—critically—the ability to convert inquiries into booked appointments. Many practices focus heavily on marketing but lose patients at the conversion stage due to missed calls or poor intake processes.',
    category: 'marketing',
    relatedTerms: ['patient-retention', 'no-show-rate', 'appointment-conversion'],
    relatedSolutions: ['medical-answering-service', 'patient-recall'],
    examples: [
      'A patient finds your practice through a Google search and calls to book',
      'Converting a walk-in inquiry into a scheduled appointment',
      'Re-engaging a lapsed patient through outreach campaigns'
    ]
  },
  {
    slug: 'patient-retention',
    term: 'Patient Retention',
    definition: 'The ability of a healthcare practice to keep existing patients returning for ongoing care rather than losing them to competitors or inaction.',
    detailedExplanation: 'Patient retention is often more cost-effective than acquisition, as returning patients require less marketing spend and tend to have higher lifetime values. Key factors include care quality, patient experience, appointment availability, and proactive recall programs. Practices with strong retention rates typically have systematic recall processes and excellent communication.',
    category: 'metrics',
    relatedTerms: ['patient-acquisition', 'recall-rate', 'patient-lifetime-value'],
    relatedSolutions: ['patient-recall', 'no-show-recovery'],
    examples: [
      'Patients returning for annual eye exams year after year',
      'Following up with patients due for hygiene appointments',
      'Maintaining relationships with patients between visits'
    ]
  },
  {
    slug: 'no-show-rate',
    term: 'No-Show Rate',
    definition: 'The percentage of scheduled appointments where patients fail to appear without canceling in advance.',
    detailedExplanation: 'No-shows represent significant lost revenue and productivity for healthcare practices. The average no-show rate across healthcare is 15-30%, with each missed appointment costing $100-200+ in lost revenue. Reducing no-shows requires a multi-pronged approach: confirmation calls, reminder systems, waitlist management, and understanding why patients miss appointments.',
    category: 'metrics',
    relatedTerms: ['appointment-conversion', 'patient-retention', 'schedule-utilization'],
    relatedSolutions: ['no-show-recovery', 'patient-recall'],
    examples: [
      'A patient scheduled for 10 AM simply doesn\'t show up',
      'No advance notice or cancellation call',
      'The appointment slot goes unfilled and unbillable'
    ]
  },
  {
    slug: 'recall-rate',
    term: 'Recall Rate',
    definition: 'The percentage of patients who return for scheduled follow-up appointments, particularly annual exams or routine care.',
    detailedExplanation: 'Recall rate is a critical metric for practice health, especially in specialties like optometry and dental where annual exams are standard. A healthy recall rate is 70-80%+, meaning most patients return as scheduled. Low recall rates indicate either poor outreach systems, patient dissatisfaction, or excessive competition. Improving recall requires systematic outreach and good patient relationships.',
    category: 'metrics',
    relatedTerms: ['patient-retention', 'patient-lifetime-value', 'no-show-rate'],
    relatedSolutions: ['patient-recall'],
    examples: [
      'An optometry practice where 75% of patients return annually',
      'Dental hygiene patients rebooking at checkout for 6 months later',
      'Systematic outreach to patients due for care'
    ]
  },
  {
    slug: 'appointment-conversion',
    term: 'Appointment Conversion Rate',
    definition: 'The percentage of patient inquiries (calls, web forms, walk-ins) that result in scheduled appointments.',
    detailedExplanation: 'Appointment conversion rate measures how effectively a practice turns interest into booked visits. A typical conversion rate ranges from 40-70%, meaning many inquiries never become appointments. Common reasons for lost conversions include unanswered calls, long hold times, scheduling complexity, and poor phone handling. Improving conversion directly increases revenue without additional marketing spend.',
    category: 'metrics',
    relatedTerms: ['patient-acquisition', 'no-show-rate'],
    relatedSolutions: ['medical-answering-service', 'front-desk-outsourcing'],
    examples: [
      'Of 100 calls, 60 result in scheduled appointments (60% conversion)',
      'A new patient calls and books their first exam',
      'Converting a web inquiry into a confirmed visit'
    ]
  },
  {
    slug: 'patient-lifetime-value',
    term: 'Patient Lifetime Value (PLV)',
    definition: 'The total revenue a practice can expect from a single patient throughout their relationship, including all visits, procedures, and purchases.',
    detailedExplanation: 'Patient lifetime value is crucial for understanding the true cost of lost patients and the value of retention efforts. In optometry, a patient who returns annually for 10 years represents $5,000-10,000+ in total revenue. In dental, this number can be even higher. Understanding PLV helps practices justify investments in patient acquisition and retention.',
    category: 'metrics',
    relatedTerms: ['patient-retention', 'patient-acquisition', 'recall-rate'],
    relatedSolutions: ['patient-recall', 'medical-answering-service'],
    examples: [
      'An optometry patient who spends $500/year for 10 years = $5,000 PLV',
      'A dental patient with regular cleanings plus occasional procedures',
      'The long-term revenue impact of each lost patient'
    ]
  },
  {
    slug: 'hipaa-compliance',
    term: 'HIPAA Compliance',
    definition: 'Adherence to the Health Insurance Portability and Accountability Act regulations that protect patient health information privacy and security.',
    detailedExplanation: 'HIPAA sets national standards for protecting sensitive patient health information. For practices working with third-party services, this means ensuring Business Associate Agreements (BAAs) are in place, data is encrypted and secure, and staff are properly trained. HIPAA violations can result in significant fines and reputational damage.',
    category: 'compliance',
    relatedTerms: ['baa', 'phi', 'hipaa-training'],
    relatedSolutions: ['medical-answering-service', 'integrations'],
    examples: [
      'Secure handling of patient records and communications',
      'Encrypted storage and transmission of health information',
      'Staff training on privacy requirements'
    ]
  },
  {
    slug: 'baa',
    term: 'Business Associate Agreement (BAA)',
    definition: 'A legal contract between a healthcare provider and a vendor that handles protected health information (PHI), ensuring HIPAA-compliant data handling.',
    detailedExplanation: 'A BAA is required whenever a third party has access to patient information. It defines how the business associate (vendor) will protect PHI, what uses are permitted, and what happens in case of a breach. Any patient intake service, call center, or technology provider handling patient data must sign a BAA before beginning work.',
    category: 'compliance',
    relatedTerms: ['hipaa-compliance', 'phi'],
    relatedSolutions: ['medical-answering-service', 'front-desk-outsourcing'],
    examples: [
      'mybcat signs a BAA with every client before accessing patient data',
      'The agreement specifies data handling, security, and breach procedures',
      'Required for any vendor touching patient information'
    ]
  },
  {
    slug: 'ehr',
    term: 'Electronic Health Record (EHR)',
    definition: 'A digital system that stores patient health records, treatment history, and medical information, enabling healthcare providers to access and update patient data.',
    detailedExplanation: 'EHRs have largely replaced paper records in healthcare. They contain patient demographics, medical history, appointments, treatment notes, and billing information. Integration with EHR systems is critical for any patient intake service, as it enables direct scheduling without manual data entry or message-taking.',
    category: 'technology',
    relatedTerms: ['pms'],
    relatedSolutions: ['integrations', 'medical-answering-service'],
    examples: [
      'Eyefinity for optometry practices',
      'Dentrix for dental practices',
      'ModMed for specialty practices'
    ]
  },
  {
    slug: 'pms',
    term: 'Practice Management System (PMS)',
    definition: 'Software that handles the business side of a healthcare practice including scheduling, billing, claims, and administrative functions.',
    detailedExplanation: 'While EHRs focus on clinical data, practice management systems handle operations: appointment scheduling, insurance billing, claims management, and revenue cycle. Many modern systems combine EHR and PMS functionality. Effective patient intake requires integration with both clinical and administrative systems.',
    category: 'technology',
    relatedTerms: ['ehr'],
    relatedSolutions: ['integrations', 'front-desk-outsourcing'],
    examples: [
      'Scheduling and calendar management',
      'Insurance claim submission and tracking',
      'Patient billing and collections'
    ]
  },
  {
    slug: 'virtual-receptionist',
    term: 'Virtual Receptionist',
    definition: 'A remote professional or service that handles incoming calls, scheduling, and patient communications for a healthcare practice.',
    detailedExplanation: 'Virtual receptionists provide the functions of an in-house receptionist from a remote location. This can range from basic answering services that take messages to fully integrated solutions that schedule appointments directly into practice systems. The best virtual receptionist services combine trained healthcare professionals with technology for seamless patient experiences.',
    category: 'operations',
    relatedTerms: ['medical-answering-service', 'call-center', 'answering-service'],
    relatedSolutions: ['medical-answering-service', 'front-desk-outsourcing'],
    examples: [
      'Answering patient calls when in-house staff are busy',
      'Providing after-hours coverage',
      'Handling scheduling and basic patient inquiries'
    ]
  },
  {
    slug: 'call-center',
    term: 'Call Center',
    definition: 'A centralized facility or service that handles large volumes of telephone calls, often using scripted responses and basic message-taking.',
    detailedExplanation: 'Traditional call centers focus on answering volume rather than outcomes. Operators typically read scripts and take messages for callback. While call centers can handle high volume, they often lack healthcare expertise and EHR integration, meaning patients must wait for callbacks and staff must manually process messages.',
    category: 'operations',
    relatedTerms: ['virtual-receptionist', 'answering-service'],
    relatedSolutions: ['medical-answering-service'],
    examples: [
      'After-hours message services',
      'High-volume answer-and-route operations',
      'Basic overflow coverage during busy periods'
    ]
  },
  {
    slug: 'schedule-utilization',
    term: 'Schedule Utilization',
    definition: 'The percentage of available appointment slots that are actually filled with patient visits.',
    detailedExplanation: 'Schedule utilization measures how effectively a practice fills its available capacity. Low utilization means empty chairs and lost revenue; high utilization maximizes provider productivity. Factors affecting utilization include no-shows, cancellations, booking gaps, and overbooking strategies. Optimal utilization balances productivity with patient access.',
    category: 'metrics',
    relatedTerms: ['no-show-rate', 'appointment-conversion'],
    relatedSolutions: ['no-show-recovery', 'front-desk-outsourcing'],
    examples: [
      '85% utilization means 85% of available slots are filled',
      'Managing waitlists to fill last-minute cancellations',
      'Strategic overbooking based on no-show patterns'
    ]
  },
  {
    slug: 'insurance-verification',
    term: 'Insurance Verification',
    definition: 'The process of confirming a patient\'s insurance coverage, benefits, and eligibility before their appointment.',
    detailedExplanation: 'Insurance verification prevents surprise billing issues and ensures practices know what will be covered before providing care. This is especially important in specialties like optometry where vision plans (VSP, EyeMed) and medical insurance have different coverage. Proper verification improves collections and patient satisfaction.',
    category: 'operations',
    relatedTerms: ['medical-answering-service'],
    relatedSolutions: ['medical-answering-service', 'front-desk-outsourcing'],
    examples: [
      'Confirming VSP vs EyeMed coverage for an eye exam',
      'Checking medical vs routine exam benefits',
      'Verifying deductibles and copays before the visit'
    ]
  },
  {
    slug: 'patient-intake',
    term: 'Patient Intake',
    definition: 'The complete process of bringing a new or returning patient into the practice, including initial contact, scheduling, information gathering, and preparation for their visit.',
    detailedExplanation: 'Patient intake encompasses everything from the first phone call to the patient walking through the door. This includes answering calls, booking appointments, collecting patient information, verifying insurance, sending confirmations, and ensuring all paperwork is ready. Effective intake sets the tone for the patient relationship and impacts conversion, satisfaction, and operational efficiency.',
    category: 'operations',
    relatedTerms: ['patient-acquisition', 'appointment-conversion', 'insurance-verification'],
    relatedSolutions: ['medical-answering-service', 'front-desk-outsourcing'],
    examples: [
      'A new patient calls, is scheduled, and receives confirmation',
      'Demographics and insurance collected before the visit',
      'Forms and paperwork prepared in advance'
    ]
  },
  {
    slug: 'dso',
    term: 'Dental Support Organization (DSO)',
    definition: 'A company that provides non-clinical business support and administrative services to dental practices, allowing dentists to focus on patient care while the DSO handles operations.',
    detailedExplanation: 'DSOs have transformed the dental industry by centralizing business functions across multiple practices. They typically handle HR, marketing, billing, compliance, and increasingly, patient communications and call handling. DSOs range from small groups (3-5 locations) to large organizations with hundreds of practices. The model has expanded to other healthcare verticals including optometry, veterinary, and urgent care.',
    category: 'operations',
    relatedTerms: ['centralized-scheduling', 'multi-location-practice', 'patient-intake'],
    relatedSolutions: ['medical-answering-service', 'front-desk-outsourcing'],
    examples: [
      'A dental group with 15 locations operating under unified management',
      'Centralized administrative services for multiple dental practices',
      'Shared resources and best practices across locations'
    ]
  },
  {
    slug: 'centralized-scheduling',
    term: 'Centralized Scheduling: Enterprise Guide to Unified Workforce Management',
    definition: 'Learn how centralized scheduling streamlines workforce coordination across locations. Discover implementation strategies, ROI benefits, and best practices for enterprise teams.',
    detailedExplanation: 'Centralized scheduling addresses the challenges of managing patient communications across multiple locations. Instead of each location independently handling calls (leading to inconsistency, training burden, and coverage gaps), a central team handles all inbound calls with unified protocols. This improves consistency, enables specialization, provides better coverage, and delivers unified reporting across all locations.',
    category: 'operations',
    relatedTerms: ['dso', 'multi-location-practice', 'call-center', 'schedule-utilization'],
    relatedSolutions: ['medical-answering-service', 'front-desk-outsourcing'],
    examples: [
      'One team handling calls for all 20 dental locations',
      'Unified training and quality standards across all patient interactions',
      'Single dashboard showing performance metrics for all locations'
    ]
  },
  {
    slug: 'multi-location-practice',
    term: 'Multi-Location Practice',
    definition: 'A healthcare organization operating multiple clinical sites under unified ownership or management, requiring coordinated operations across locations.',
    detailedExplanation: 'Multi-location practices face unique operational challenges including maintaining consistent patient experience, coordinating staff and schedules, managing different systems at different locations, and achieving economies of scale. As practices grow from single to multi-location, phone operations often become a significant pain point due to inconsistent handling, training burden, and lack of visibility.',
    category: 'operations',
    relatedTerms: ['dso', 'centralized-scheduling', 'schedule-utilization'],
    relatedSolutions: ['medical-answering-service', 'front-desk-outsourcing'],
    examples: [
      'An optometry group with locations in three cities',
      'A dental practice that has expanded to multiple offices',
      'A veterinary group operating five clinics in a region'
    ]
  }
];

// Helper functions
export function getGlossaryTermBySlug(slug: string): GlossaryTerm | undefined {
  return glossaryTerms.find(t => t.slug === slug);
}

export function getAllGlossaryTermSlugs(): string[] {
  return glossaryTerms.map(t => t.slug);
}

export function getGlossaryTermsByCategory(category: GlossaryTerm['category']): GlossaryTerm[] {
  return glossaryTerms.filter(t => t.category === category);
}

export function getRelatedTerms(term: GlossaryTerm): GlossaryTerm[] {
  return term.relatedTerms
    .map(slug => getGlossaryTermBySlug(slug))
    .filter((t): t is GlossaryTerm => t !== undefined);
}
