/**
 * Blog CTA routing map — cluster → funnel theme → CTA variant
 *
 * Three validated funnel themes (RB2B identified-visitor data + GSC demand, 2026-07-01):
 *  - recall_fill_book: readers with empty-slots pain (office managers + owners)
 *  - finances_selling: owners on the financial/ownership journey (pre-exit or margin-stressed)
 *  - operations: multi-location admins / DSO ops leads (closest to service, shortest funnel)
 *
 * CTA hrefs carry UTM params so HubSpot meeting bookings attribute per theme
 * (landing-URL UTMs propagate into the meeting embed — see HubSpotMeeting.astro).
 * When the Free Phone & Staffing Analysis page ships, update the hrefs here once.
 */

export type FunnelTheme = 'recall_fill_book' | 'finances_selling' | 'operations' | 'default';

export interface BlogCtaVariant {
  /** Mid-content CTA (InContentCTA component) */
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  /** End-of-post CTA section */
  endTitle: string;
  endDescription: string;
  endButtonText: string;
  endButtonHref: string;
}

/** Map each frontmatter `cluster` value to a funnel theme */
const clusterToTheme: Record<string, FunnelTheme> = {
  'patient-recall': 'recall_fill_book',
  'no-show-recovery': 'recall_fill_book',
  'retention': 'recall_fill_book',
  'patient-communications': 'recall_fill_book',
  'practice-valuation': 'finances_selling',
  'starting-practice': 'finances_selling',
  'private-practice': 'finances_selling',
  'enterprise': 'operations',
  'enterprise-operations': 'operations',
  'enterprise-compliance': 'operations',
  'bpo-outsourcing': 'operations',
  'call-center-operations': 'operations',
  'virtual-assistant': 'operations',
  'compliance': 'operations',
  'ai-technology': 'operations',
  'optometry': 'operations',
  // dental / veterinary intentionally fall through to default (off-ICP: soft CTA only)
};

const utm = (theme: string, placement: string) =>
  `/contact/?utm_source=blog&utm_medium=${placement}&utm_campaign=theme-${theme}`;

export const blogCtaVariants: Record<FunnelTheme, BlogCtaVariant> = {
  recall_fill_book: {
    title: 'Your Recall List Is Sitting on Revenue',
    description:
      'Scripts help, but someone still has to work the list. MyBCAT teams run recall calls, texts, and rebooking for optometry practices, done for you and measured weekly.',
    buttonText: 'Get a Free Phone & Staffing Analysis',
    buttonHref: utm('recall', 'in-content-cta'),
    endTitle: 'Want Your Recall List Worked Every Week?',
    endDescription:
      'MyBCAT runs recall and reactivation campaigns for 30+ optometry practices: live callers, proven scripts, and booked appointments you can count.',
    endButtonText: 'Get a Free Phone & Staffing Analysis',
    endButtonHref: utm('recall', 'post-cta'),
  },
  finances_selling: {
    title: 'Practice Value Is Built in Operations',
    description:
      'Recall rate, phone answer rate, and no-shows move your EBITDA, and your valuation. MyBCAT runs the front-desk operations that raise both, whether you plan to grow or eventually sell.',
    buttonText: 'Book a Practice Value Conversation',
    buttonHref: utm('finances', 'in-content-cta'),
    endTitle: 'Raise the Value Before You Sell (or Scale)',
    endDescription:
      'Buyers pay for clean operations and a full book. See how MyBCAT improves the operating metrics that drive practice value.',
    endButtonText: 'Book a Practice Value Conversation',
    endButtonHref: utm('finances', 'post-cta'),
  },
  operations: {
    title: 'Stop Patching the Front Desk',
    description:
      'HIPAA-trained remote teams answer every call for 30+ optometry practices: scheduling, insurance verification, and recall, with QA you can inspect.',
    buttonText: 'Book a Discovery Call',
    buttonHref: utm('operations', 'in-content-cta'),
    endTitle: 'See the Operation Behind 30+ Practices',
    endDescription:
      'Coverage, cost, and QA in one 20-minute walkthrough. If it is not a fit, you keep the benchmarks.',
    endButtonText: 'Book a Discovery Call',
    endButtonHref: utm('operations', 'post-cta'),
  },
  default: {
    title: 'Reduce Your Front Desk Dependency',
    description:
      'MyBCAT helps healthcare practices build resilient intake operations that do not break when staffing is tight.',
    buttonText: 'Schedule a Consultation',
    buttonHref: utm('general', 'in-content-cta'),
    endTitle: 'Ready to Capture More Revenue?',
    endDescription:
      'See how MyBCAT helps multi-location healthcare groups fill every appointment slot and reduce front desk dependency.',
    endButtonText: 'Schedule a Consultation',
    endButtonHref: utm('general', 'post-cta'),
  },
};

/** Resolve a post's CTA variant from its frontmatter cluster (quotes/whitespace tolerated) */
export function getBlogCta(cluster?: string): BlogCtaVariant {
  const key = (cluster || '').replace(/["']/g, '').trim();
  const theme = clusterToTheme[key] || 'default';
  return blogCtaVariants[theme];
}
