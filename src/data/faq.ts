/**
 * FAQ data for FAQ sections and page
 * Organized by category for flexibility
 */

export interface FAQ {
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'security' | 'technical' | 'onboarding';
}

export const faqs: FAQ[] = [
  // General
  {
    question: 'How is this different from hiring a $10/hr VA?',
    answer: 'VAs from gig platforms require you to train, manage, and replace them. We arrive ready-trained on optometry workflows, insurance (VSP vs EyeMed), and your EMR. You buy a managed team and results, not a person to babysit.',
    category: 'general'
  },
  {
    question: 'Do your team members actually understand healthcare?',
    answer: 'Yes. We train specifically on healthcare workflows-insurance verification, recall protocols, and your provider preferences. This isn\'t generic call center staff reading scripts.',
    category: 'general'
  },
  {
    question: 'We\'re scaling to 5+ locations. Can you handle that?',
    answer: 'That\'s exactly who we built this for. We function as your centralized intake backbone across every location-one team, one playbook, one dashboard.',
    category: 'general'
  },
  {
    question: 'What happens when someone on your team is sick?',
    answer: 'Unlike hiring a single VA, we operate as a team with built-in redundancy. If one coordinator is out, another trained team member covers seamlessly. You never experience gaps in coverage.',
    category: 'general'
  },
  {
    question: 'Will patients know they\'re not talking to someone in my office?',
    answer: 'No. We answer as your practice using your greeting. Patients experience us as an extension of your team. We\'re trained on your office protocols, provider schedules, and can answer questions about your practice just like your front desk would.',
    category: 'general'
  },
  {
    question: 'What if a patient has a complex question you can\'t answer?',
    answer: 'We handle the common calls that take up 80% of your phone time—scheduling, insurance questions, directions, hours. For clinical questions or situations requiring your staff, we warm-transfer to your team or take a detailed message with priority flagging.',
    category: 'general'
  },
  {
    question: 'I\'m worried about losing control of my patient experience.',
    answer: 'You have full visibility. Every call is recorded and available in your dashboard. You approve our scripts, set our protocols, and we follow your playbook. Think of us as your front desk\'s best friend—we handle overflow and after-hours so they can focus on in-office patients.',
    category: 'general'
  },

  // Onboarding
  {
    question: 'How fast can we get started?',
    answer: 'AI-assisted intake can start in 5 days. Full team integration takes 30-60 days depending on your EMR and workflow complexity.',
    category: 'onboarding'
  },
  {
    question: 'How do you learn our specific workflows?',
    answer: 'We start with a detailed discovery call to understand your practice. Then we shadow your current processes, document your protocols, and train our team on your specific needs before going live.',
    category: 'onboarding'
  },
  {
    question: 'What EMR/PM systems do you work with?',
    answer: 'We integrate with most major systems including Eyefinity, RevolutionEHR, Dentrix, Eaglesoft, Open Dental, ModMed, AdvancedMD, and many others. If you use it, we likely support it.',
    category: 'onboarding'
  },

  // Security
  {
    question: 'What about HIPAA compliance?',
    answer: 'Our team operates under a full Business Associate Agreement (BAA). All data stays within HIPAA-compliant systems with the same security protocols as US-based staff.',
    category: 'security'
  },
  {
    question: 'Where is patient data stored?',
    answer: 'Patient data stays in your existing systems. We access your EMR/PM just like your in-house staff would, following all your existing security protocols and access controls.',
    category: 'security'
  },
  {
    question: 'Do you sign a BAA?',
    answer: 'Yes, we sign a Business Associate Agreement with every client before any patient information is accessed. This is non-negotiable for us.',
    category: 'security'
  },

  // Pricing
  {
    question: 'How does pricing work?',
    answer: 'We use transparent monthly pricing based on your practice size and service level. No hidden fees, no per-call charges. You know exactly what you\'re paying each month.',
    category: 'pricing'
  },
  {
    question: 'Is there a contract?',
    answer: 'We offer month-to-month service after an initial 90-day commitment. The 90 days allows proper training and integration. After that, you can cancel with 30 days notice.',
    category: 'pricing'
  },
  {
    question: 'What\'s the ROI?',
    answer: 'Most practices see positive ROI within the first month. With the average missed call representing $2,400 in patient lifetime value, capturing just a few additional patients per month pays for the service.',
    category: 'pricing'
  },

  // Technical
  {
    question: 'How do you connect to our phone system?',
    answer: 'We support multiple integration methods-call forwarding, VoIP integration, or direct phone system connection. We\'ll recommend the best approach based on your current setup.',
    category: 'technical'
  },
  {
    question: 'Can we still see call recordings?',
    answer: 'Yes, all calls are recorded and available for your review. You\'ll have access to a dashboard where you can listen to calls, review metrics, and track performance.',
    category: 'technical'
  },
  {
    question: 'What hours are you available?',
    answer: 'Starter plans include 8am-6pm local time coverage. Growth plans extend to 7am-9pm. Enterprise plans include full 24/7 coverage.',
    category: 'technical'
  }
];

// Helper functions
export function getFAQsByCategory(category: FAQ['category']): FAQ[] {
  return faqs.filter(f => f.category === category);
}

export function getGeneralFAQs(): FAQ[] {
  return getFAQsByCategory('general');
}

export function getTopFAQs(count: number = 5): FAQ[] {
  return faqs.slice(0, count);
}
