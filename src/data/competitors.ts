/**
 * Competitor data for comparison pages
 * Each competitor has comparison features, advantages, and FAQs
 */

export interface ComparisonFeature {
  name: string;
  mybcat: string | boolean;
  competitor: string | boolean;
}

export interface FeatureCategory {
  category: string;
  items: ComparisonFeature[];
}

export interface Competitor {
  slug: string;
  name: string;
  tagline: string;
  headline: string;
  description: string;
  metaDescription: string;
  pricing: string;
  model: string;
  website?: string;

  // Comparison matrix
  features: FeatureCategory[];

  // Why mybcat wins
  advantages: string[];

  // Fair assessment - competitor strengths
  competitorStrengths: string[];

  // When competitor might be better fit
  bestFor: string[];

  // Key differentiators for BeforeAfter component
  differentiators: {
    competitor: string;
    mybcat: string;
  }[];

  // FAQ for this comparison
  faqs: { question: string; answer: string }[];
}

export const competitors: Competitor[] = [
  {
    slug: 'vs-hello-rache',
    name: 'Hello Rache',
    tagline: 'Managed Service vs Hourly VA Staffing',
    headline: 'MyBCAT vs Hello Rache: Which Is Right for Your Practice?',
    description: 'Compare My Business Care Team\'s fully managed patient acquisition platform with Hello Rache\'s hourly virtual assistant staffing model. Understand the key differences in pricing, management, technology, and outcomes.',
    metaDescription: 'Compare MyBCAT vs Hello Rache for your healthcare practice. See how our managed service differs from hourly VA staffing in pricing, technology, and results.',
    pricing: '$9.50/hour',
    model: 'Hourly VA staffing',
    website: 'hellorache.com',

    features: [
      {
        category: 'Service Model',
        items: [
          { name: 'Management style', mybcat: 'Fully managed', competitor: 'You manage the VA' },
          { name: 'Pricing model', mybcat: 'Outcome-based', competitor: 'Hourly ($9.50/hr)' },
          { name: 'Coverage model', mybcat: 'Team + AI backup', competitor: 'Single dedicated VA' },
          { name: 'Sick/vacation coverage', mybcat: 'Automatic', competitor: 'You arrange' },
        ]
      },
      {
        category: 'Technology',
        items: [
          { name: 'Real-time dashboard', mybcat: true, competitor: false },
          { name: 'AI-powered backup', mybcat: true, competitor: false },
          { name: 'Call analytics & QA', mybcat: true, competitor: false },
          { name: 'EHR/PMS integration', mybcat: true, competitor: 'Manual' },
        ]
      },
      {
        category: 'Services',
        items: [
          { name: 'Inbound call handling', mybcat: true, competitor: true },
          { name: 'Appointment scheduling', mybcat: 'Direct to EHR', competitor: 'Manual entry' },
          { name: 'Recall campaigns', mybcat: true, competitor: 'Extra cost' },
          { name: 'No-show recovery', mybcat: true, competitor: 'Extra cost' },
          { name: 'Insurance verification', mybcat: true, competitor: true },
        ]
      },
      {
        category: 'Healthcare Expertise',
        items: [
          { name: 'HIPAA compliance', mybcat: true, competitor: true },
          { name: 'Industry specialization', mybcat: 'Deep vertical focus', competitor: 'General healthcare' },
          { name: 'EHR system knowledge', mybcat: 'Certified specialists', competitor: 'Basic training' },
        ]
      }
    ],

    advantages: [
      'No management overhead - we handle training, QA, and scheduling',
      'Team coverage means you\'re never without support',
      'AI backup ensures 100% call coverage even during peak times',
      'Real-time visibility into call metrics and performance',
      'Outcome-based pricing aligns our success with yours',
      'Deep specialization in your specific industry vertical'
    ],

    competitorStrengths: [
      'Lower hourly rate ($9.50/hr) for practices on tight budgets',
      'Dedicated VA becomes familiar with your specific practice',
      'Good for practices that want direct control over their VA',
      'Reasonable option for basic administrative tasks',
      'Established provider with track record in healthcare'
    ],

    bestFor: [
      'Practices wanting the absolute lowest hourly cost',
      'Owners who prefer hands-on VA management',
      'Very small practices with minimal call volume',
      'Practices needing basic tasks beyond phone handling'
    ],

    differentiators: [
      { competitor: 'You manage the VA', mybcat: 'Fully managed service' },
      { competitor: 'Single point of failure', mybcat: 'Team + AI coverage' },
      { competitor: 'No technology platform', mybcat: 'Real-time dashboard & analytics' },
      { competitor: 'Hourly billing regardless of results', mybcat: 'Outcome-based pricing' },
      { competitor: 'General healthcare training', mybcat: 'Deep vertical expertise' },
      { competitor: 'Manual EHR entry', mybcat: 'Direct EHR integration' }
    ],

    faqs: [
      {
        question: 'Why is My Business Care Team more expensive than Hello Rache?',
        answer: 'While Hello Rache charges $9.50/hour, you\'re responsible for management, training, and covering absences. When you factor in your time spent managing, plus the technology and team coverage My Business Care Team provides, most practices find the total cost similar - with better, more consistent results.'
      },
      {
        question: 'Can I switch from Hello Rache to My Business Care Team?',
        answer: 'Yes, many practices have made this switch. We handle the entire transition, including EHR integration setup and training our team on your specific workflows. Most practices are fully transitioned within 2-3 weeks.'
      },
      {
        question: 'What if I like managing my own VA?',
        answer: 'Hello Rache might be a better fit for you. My Business Care Team is designed for practice owners who want to focus on patient care, not VA management. If you enjoy the hands-on control, an hourly VA model could work well.'
      },
      {
        question: 'Does My Business Care Team offer the same services as Hello Rache?',
        answer: 'My Business Care Team includes everything Hello Rache offers plus proactive services like recall campaigns, no-show recovery, and AI-powered coverage. We also provide real-time analytics and direct EHR integration that Hello Rache doesn\'t offer.'
      }
    ]
  },

  {
    slug: 'vs-hireteem',
    name: 'HireTeem',
    tagline: 'Managed Platform vs Hourly VA Model',
    headline: 'HireTeem Alternative: Compare Top Features & Pricing [2025]',
    description: 'Compare My Business Care Team\'s managed patient acquisition platform with HireTeem\'s hourly virtual assistant staffing. Learn which approach best fits your practice\'s needs and growth goals.',
    metaDescription: 'Looking for a HireTeem alternative? Compare features, pricing & user reviews. Discover why teams are switching to better hiring solutions. Free trial available.',
    pricing: '$11/hour',
    model: 'Hourly VA staffing',
    website: 'hireteem.com',

    features: [
      {
        category: 'Service Model',
        items: [
          { name: 'Management style', mybcat: 'Fully managed', competitor: 'You manage the VA' },
          { name: 'Pricing model', mybcat: 'Outcome-based', competitor: 'Hourly ($11/hr)' },
          { name: 'Coverage model', mybcat: 'Team + AI backup', competitor: 'Single dedicated VA' },
          { name: 'Sick/vacation coverage', mybcat: 'Automatic', competitor: 'You arrange' },
        ]
      },
      {
        category: 'Technology',
        items: [
          { name: 'Real-time dashboard', mybcat: true, competitor: false },
          { name: 'AI-powered backup', mybcat: true, competitor: false },
          { name: 'Call analytics & QA', mybcat: true, competitor: false },
          { name: 'EHR/PMS integration', mybcat: true, competitor: 'Manual' },
        ]
      },
      {
        category: 'Services',
        items: [
          { name: 'Inbound call handling', mybcat: true, competitor: true },
          { name: 'Appointment scheduling', mybcat: 'Direct to EHR', competitor: 'Manual entry' },
          { name: 'Recall campaigns', mybcat: true, competitor: 'Extra cost' },
          { name: 'No-show recovery', mybcat: true, competitor: 'Extra cost' },
          { name: 'Revenue cycle support', mybcat: 'Core focus', competitor: true },
        ]
      },
      {
        category: 'Healthcare Expertise',
        items: [
          { name: 'HIPAA compliance', mybcat: true, competitor: true },
          { name: 'Industry specialization', mybcat: 'Deep vertical focus', competitor: 'General healthcare' },
          { name: 'Quality assurance', mybcat: 'Continuous QA', competitor: 'Self-managed' },
        ]
      }
    ],

    advantages: [
      'No management burden - focus on patients, not VA supervision',
      'Team model eliminates single-point-of-failure risk',
      'AI backup ensures calls are never missed',
      'Dashboard gives visibility into every call and outcome',
      'Proactive services included (recall, no-show recovery)',
      'Industry-specific expertise, not general healthcare'
    ],

    competitorStrengths: [
      'Competitive hourly rate for budget-conscious practices',
      'Revenue cycle management services available',
      'Dedicated VA relationship over time',
      'Healthcare-specific focus (not generalist)',
      'Flexible for practices wanting direct control'
    ],

    bestFor: [
      'Practices wanting to directly manage their VA',
      'Budget-focused practices prioritizing low hourly cost',
      'Practices needing revenue cycle management support',
      'Owners who prefer hands-on oversight of staff'
    ],

    differentiators: [
      { competitor: 'Self-managed VA', mybcat: 'Fully managed team' },
      { competitor: 'Single VA coverage', mybcat: 'Team + AI always available' },
      { competitor: 'No tech platform', mybcat: 'Real-time analytics dashboard' },
      { competitor: 'Pay by the hour', mybcat: 'Pay for results' },
      { competitor: 'General healthcare', mybcat: 'Your specialty expertise' },
      { competitor: 'You do QA', mybcat: 'Continuous quality assurance' }
    ],

    faqs: [
      {
        question: 'How does My Business Care Team pricing compare to HireTeem\'s $11/hour?',
        answer: 'My Business Care Team\'s outcome-based pricing means you pay for results, not hours logged. When you factor in management time, coverage gaps, and the technology platform we provide, most practices find My Business Care Team delivers better ROI despite different pricing models.'
      },
      {
        question: 'Does HireTeem offer better revenue cycle services?',
        answer: 'HireTeem does offer revenue cycle management. My Business Care Team focuses on patient acquisition - getting patients scheduled and reducing no-shows. For billing support, some practices use both services together.'
      },
      {
        question: 'Can I switch from HireTeem to My Business Care Team?',
        answer: 'Absolutely. We handle the transition seamlessly, typically completing the switch in 2-3 weeks including EHR integration and team training on your workflows.'
      },
      {
        question: 'What makes My Business Care Team different from HireTeem?',
        answer: 'The biggest difference is our managed approach with technology. HireTeem provides a VA you manage; My Business Care Team provides a complete system - trained team, AI backup, analytics dashboard, and outcome accountability - all managed for you.'
      }
    ]
  },

  {
    slug: 'vs-virtual-assistants',
    name: 'Virtual Assistants',
    tagline: 'Managed Service vs DIY Staffing',
    headline: 'MyBCAT vs Hiring a Virtual Assistant: What\'s the Difference?',
    description: 'Should you hire a virtual assistant or use a managed service like My Business Care Team? Compare the true costs, management requirements, and outcomes of each approach for your healthcare practice.',
    metaDescription: 'Compare hiring a virtual assistant vs using MyBCAT for your medical practice. Understand the real costs, management burden, and results of each option.',
    pricing: '$8-15/hour',
    model: 'Self-managed staffing',

    features: [
      {
        category: 'Management & Operations',
        items: [
          { name: 'Who manages', mybcat: 'My Business Care Team handles everything', competitor: 'You manage directly' },
          { name: 'Training', mybcat: 'Pre-trained on your EHR', competitor: 'You train from scratch' },
          { name: 'Quality assurance', mybcat: 'Continuous monitoring', competitor: 'You monitor' },
          { name: 'Scheduling & coverage', mybcat: 'Automatic team coverage', competitor: 'You coordinate' },
          { name: 'Performance reviews', mybcat: 'Included', competitor: 'You conduct' },
        ]
      },
      {
        category: 'Risk & Reliability',
        items: [
          { name: 'Sick day coverage', mybcat: 'Automatic backup', competitor: 'No coverage' },
          { name: 'Turnover handling', mybcat: 'Seamless replacement', competitor: 'Start over' },
          { name: 'Call overflow', mybcat: 'AI handles overflow', competitor: 'Calls go to voicemail' },
          { name: 'After-hours coverage', mybcat: 'Included', competitor: 'Extra cost/effort' },
        ]
      },
      {
        category: 'Technology',
        items: [
          { name: 'Dashboard & analytics', mybcat: true, competitor: false },
          { name: 'EHR integration', mybcat: 'Direct integration', competitor: 'You set up' },
          { name: 'Call recording & QA', mybcat: true, competitor: 'You arrange' },
          { name: 'AI assistance', mybcat: true, competitor: false },
        ]
      },
      {
        category: 'True Cost Factors',
        items: [
          { name: 'Your management time', mybcat: 'None', competitor: '5-10 hrs/week' },
          { name: 'Training costs', mybcat: 'Included', competitor: '40+ hours initial' },
          { name: 'Technology/tools', mybcat: 'Included', competitor: 'You provide' },
          { name: 'Replacement costs', mybcat: 'None', competitor: 'Start over each time' },
        ]
      }
    ],

    advantages: [
      'Zero management time required from you',
      'No training burden - team arrives ready on day one',
      'Never without coverage - team + AI always available',
      'Technology platform included (dashboard, analytics, integrations)',
      'Consistent quality through continuous monitoring',
      'Scales instantly without additional hiring'
    ],

    competitorStrengths: [
      'Lower apparent hourly cost ($8-15/hr typical)',
      'Direct relationship with your VA',
      'Full control over tasks and priorities',
      'Can handle tasks beyond phone work',
      'Flexibility in role definition'
    ],

    bestFor: [
      'Practices with dedicated management capacity',
      'Owners who enjoy hands-on staff management',
      'Very small practices with simple workflows',
      'Practices needing diverse admin tasks beyond phones'
    ],

    differentiators: [
      { competitor: 'You hire and train', mybcat: 'Team arrives trained and ready' },
      { competitor: 'You manage daily', mybcat: 'Fully managed for you' },
      { competitor: 'Single person, single point of failure', mybcat: 'Team coverage, always available' },
      { competitor: 'No technology included', mybcat: 'Dashboard, analytics, AI included' },
      { competitor: 'You handle sick days and turnover', mybcat: 'Seamless coverage always' },
      { competitor: 'General admin skills', mybcat: 'Healthcare specialists' }
    ],

    faqs: [
      {
        question: 'Isn\'t hiring a VA cheaper than My Business Care Team?',
        answer: 'The hourly rate looks lower, but the true cost includes your time managing (5-10 hrs/week), training (40+ hours), technology setup, and the cost of gaps when your VA is unavailable. Most practices find My Business Care Team\'s total cost similar with far less hassle.'
      },
      {
        question: 'Can\'t I just train a VA on my systems?',
        answer: 'You can, but it takes significant time. Our team arrives pre-trained on major EHR systems and healthcare workflows. We also handle ongoing training as your needs evolve, so you never have to repeat the process.'
      },
      {
        question: 'What if I already have a VA and want to switch?',
        answer: 'Many practices make this switch when they realize the management burden isn\'t worth the cost savings. We can transition you in 2-3 weeks, and you\'ll immediately notice the difference in coverage consistency and visibility.'
      },
      {
        question: 'Do I lose control by using My Business Care Team instead of my own VA?',
        answer: 'You gain visibility, not lose control. Our dashboard shows you every call, outcome, and metric in real-time. You set the protocols and preferences; we execute consistently. Most owners find they have better insight into operations than with a self-managed VA.'
      }
    ]
  },

  {
    slug: 'vs-call-centers',
    name: 'Call Centers',
    tagline: 'Patient Acquisition vs Call Answering',
    headline: 'MyBCAT vs Medical Call Centers: Beyond Answering the Phone',
    description: 'Traditional call centers answer phones. My Business Care Team acquires patients. Compare script-based answering services with our integrated patient acquisition platform for healthcare practices.',
    metaDescription: 'Compare MyBCAT vs medical call centers. See why healthcare practices choose patient acquisition over basic answering services.',
    pricing: 'Per call or per minute',
    model: 'Traditional answering service',

    features: [
      {
        category: 'Core Approach',
        items: [
          { name: 'Primary goal', mybcat: 'Book appointments', competitor: 'Answer & message' },
          { name: 'Call handling', mybcat: 'Relationship-focused', competitor: 'Script-based' },
          { name: 'Training depth', mybcat: 'Healthcare specialists', competitor: 'General operators' },
          { name: 'Your practice knowledge', mybcat: 'Deep understanding', competitor: 'Basic scripts' },
        ]
      },
      {
        category: 'Integration & Technology',
        items: [
          { name: 'EHR/PMS scheduling', mybcat: 'Direct booking', competitor: 'Message only' },
          { name: 'Patient information access', mybcat: 'Full EHR access', competitor: 'None' },
          { name: 'Real-time dashboard', mybcat: true, competitor: false },
          { name: 'AI assistance', mybcat: true, competitor: false },
        ]
      },
      {
        category: 'Services',
        items: [
          { name: 'New patient scheduling', mybcat: 'Complete intake', competitor: 'Take message' },
          { name: 'Existing patient scheduling', mybcat: 'Direct booking', competitor: 'Take message' },
          { name: 'Insurance questions', mybcat: 'Can verify/answer', competitor: 'Take message' },
          { name: 'Recall campaigns', mybcat: true, competitor: false },
          { name: 'No-show recovery', mybcat: true, competitor: false },
        ]
      },
      {
        category: 'Quality & Personalization',
        items: [
          { name: 'Caller experience', mybcat: 'Personal, knowledgeable', competitor: 'Generic, scripted' },
          { name: 'Complex question handling', mybcat: 'Can resolve', competitor: 'Take message' },
          { name: 'Practice representation', mybcat: 'Extension of your team', competitor: 'Third-party feel' },
        ]
      }
    ],

    advantages: [
      'Appointments booked directly - not just messages taken',
      'Deep healthcare knowledge, not script reading',
      'Direct EHR integration for real-time scheduling',
      'Proactive services (recall, no-show) not just reactive answering',
      'Patients feel they\'re talking to your practice, not a call center',
      'Analytics and visibility into every interaction'
    ],

    competitorStrengths: [
      '24/7 availability with large operator pool',
      'Established infrastructure and reliability',
      'Can handle very high call volumes',
      'Lower cost for basic message-taking needs',
      'HIPAA compliant call handling'
    ],

    bestFor: [
      'Practices only needing after-hours message taking',
      'Very high volume practices with simple needs',
      'Practices with staff to follow up on all messages',
      'Budget-focused practices needing basic coverage'
    ],

    differentiators: [
      { competitor: 'Answer and take message', mybcat: 'Answer, schedule, and convert' },
      { competitor: 'Script-based operators', mybcat: 'Healthcare specialists' },
      { competitor: 'No EHR access', mybcat: 'Direct EHR integration' },
      { competitor: 'Message waiting for callback', mybcat: 'Appointment booked immediately' },
      { competitor: 'Generic call center feel', mybcat: 'Extension of your practice' },
      { competitor: 'Reactive only', mybcat: 'Proactive recall & recovery' }
    ],

    faqs: [
      {
        question: 'Why not just use a medical answering service?',
        answer: 'Answering services take messages - you still have to call patients back. Every callback is a chance to lose that patient. My Business Care Team books the appointment on the first call, converting callers into patients immediately.'
      },
      {
        question: 'Can call centers access my EHR to schedule?',
        answer: 'Traditional call centers rarely have EHR integration. They take messages that your staff must then act on. My Business Care Team integrates directly with your EHR/PMS, booking appointments in real-time without any extra work from your team.'
      },
      {
        question: 'Are call centers better for after-hours coverage?',
        answer: 'Call centers can take messages after hours, but those patients still wait for a callback. My Business Care Team\'s AI + human model can schedule appointments 24/7, and our team handles true emergencies appropriately.'
      },
      {
        question: 'Is a call center cheaper than My Business Care Team?',
        answer: 'Per-call rates look cheap, but you\'re paying for messages, not results. Factor in the staff time to return calls, the patients lost while waiting, and the appointments never booked - My Business Care Team\'s outcome-based model often delivers better ROI.'
      }
    ]
  },

  {
    slug: 'vs-ai-receptionists',
    name: 'AI Receptionists',
    tagline: 'Human Connection + AI Power vs AI-Only',
    headline: 'MyBCAT vs AI Receptionist Tools: The Best of Both Worlds',
    description: 'Pure AI solutions promise efficiency, but patients want human connection. See how My Business Care Team combines AI power with human expertise for better patient experiences and outcomes.',
    metaDescription: 'Compare My Business Care Team\'s AI + human hybrid model vs AI-only receptionist tools. Learn why the best healthcare practices use both together.',
    pricing: 'SaaS subscription',
    model: 'AI-only automation',

    features: [
      {
        category: 'Patient Experience',
        items: [
          { name: 'Human conversation available', mybcat: 'Always', competitor: 'Never' },
          { name: 'Complex question handling', mybcat: 'Human resolves', competitor: 'Often fails' },
          { name: 'Emotional intelligence', mybcat: 'Human empathy', competitor: 'Limited/none' },
          { name: 'Patient preference', mybcat: 'Choice of AI or human', competitor: 'AI only' },
        ]
      },
      {
        category: 'Capabilities',
        items: [
          { name: 'Simple scheduling', mybcat: 'AI handles', competitor: 'AI handles' },
          { name: 'Complex scheduling', mybcat: 'Human handles', competitor: 'Often fails' },
          { name: 'Insurance questions', mybcat: 'Human answers', competitor: 'Limited' },
          { name: 'Upset patient handling', mybcat: 'Human de-escalates', competitor: 'Poor' },
          { name: 'Edge cases', mybcat: 'Human judgment', competitor: 'Breaks down' },
        ]
      },
      {
        category: 'Implementation',
        items: [
          { name: 'Setup complexity', mybcat: 'We handle everything', competitor: 'You configure' },
          { name: 'Ongoing tuning', mybcat: 'We optimize', competitor: 'You maintain' },
          { name: 'Error handling', mybcat: 'Human catches issues', competitor: 'Errors compound' },
          { name: 'EHR integration', mybcat: 'Included', competitor: 'Variable' },
        ]
      },
      {
        category: 'Business Model',
        items: [
          { name: 'Pricing approach', mybcat: 'Outcome-based', competitor: 'Per seat/usage' },
          { name: 'Scalability', mybcat: 'Instant', competitor: 'Instant' },
          { name: '24/7 availability', mybcat: 'AI + human', competitor: 'AI only' },
          { name: 'Accountability', mybcat: 'We own results', competitor: 'You own results' },
        ]
      }
    ],

    advantages: [
      'Human available whenever patients need real conversation',
      'AI handles routine tasks efficiently (best of both)',
      'Complex situations resolved properly, not dropped',
      'Patients who prefer humans get humans',
      'No configuration or maintenance burden on you',
      'We\'re accountable for outcomes, not just uptime'
    ],

    competitorStrengths: [
      'Lower cost at high volumes',
      'Perfectly consistent responses',
      '24/7 availability without staffing',
      'Instant scalability',
      'No human management required'
    ],

    bestFor: [
      'Practices with very simple, routine scheduling',
      'Tech-forward patient demographics',
      'Very high volume, low complexity calls',
      'Practices with strong in-house backup for AI failures'
    ],

    differentiators: [
      { competitor: 'AI-only interaction', mybcat: 'Human available when needed' },
      { competitor: 'Complex calls fail', mybcat: 'Human handles complexity' },
      { competitor: 'No empathy', mybcat: 'Human connection for sensitive situations' },
      { competitor: 'You configure & maintain', mybcat: 'We handle everything' },
      { competitor: 'Patients stuck with AI', mybcat: 'Patients choose their preference' },
      { competitor: 'You own AI mistakes', mybcat: 'We\'re accountable for results' }
    ],

    faqs: [
      {
        question: 'Isn\'t AI the future? Why use humans at all?',
        answer: 'AI is powerful for routine tasks - and we use it. But healthcare involves nuance, emotion, and complexity. Patients calling about a worrying symptom or confused about their insurance don\'t want a chatbot. Our hybrid model uses AI where it excels and humans where they matter.'
      },
      {
        question: 'Can\'t AI handle most calls without human help?',
        answer: 'AI handles simple, predictable calls well. But studies show 30-40% of healthcare calls involve complexity AI struggles with. Those are often your highest-value calls - new patients, complex scheduling, concerned patients. You don\'t want AI fumbling those.'
      },
      {
        question: 'Is AI cheaper than My Business Care Team?',
        answer: 'Per-interaction, yes. But consider: What\'s the cost of a frustrated patient who couldn\'t get help from your AI? What\'s a lost new patient worth? Our outcome-based model means we\'re incentivized to convert, not just answer.'
      },
      {
        question: 'Does My Business Care Team use AI at all?',
        answer: 'Absolutely. We use AI for after-hours handling, overflow during peak times, and routine information requests. The difference is we have humans ready to step in when AI isn\'t enough - and patients can always request a human.'
      }
    ]
  }
];

// Helper functions
export function getCompetitorBySlug(slug: string): Competitor | undefined {
  return competitors.find(c => c.slug === slug);
}

export function getAllCompetitorSlugs(): string[] {
  return competitors.map(c => c.slug);
}

export function getCompetitorFAQs(slug: string): { question: string; answer: string }[] {
  const competitor = getCompetitorBySlug(slug);
  return competitor?.faqs || [];
}
