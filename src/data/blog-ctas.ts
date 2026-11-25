/**
 * Blog CTA routing map — cluster → funnel theme → CTA variant
 *
 * Three validated funnel themes (RB2B identified-visitor data + GSC demand, 2026-07-01):
 *  - recall_fill_book: readers with empty-slots pain (office managers + owners)
 *  - finances_selling: owners on the financial/ownership journey (pre-exit or margin-stressed)
 *  - operations: multi-location admins / DSO ops leads (closest to service, shortest funnel)
 *
 * CTA hrefs carry UTM params so the native contact flow attributes each theme.
 * When the Free Phone & Staffing Analysis page ships, update the hrefs here once.
 * Discovery-call buttons go through the one booking route (src/utils/booking.mjs).
 */
import { discoveryBookingHref } from './navigation';

export type FunnelTheme =
  | 'recall_fill_book'
  | 'finances_selling'
  // Finance sub-intents (assigned per-post via `ctaTheme` frontmatter). The finance
  // cluster splits into three reader doors, all pointing to the same offer: the
  // "another location's worth of profit, without the overhead" operating-system report.
  | 'finance_open'    // opening/building a practice or location (Cold-Start / Growth Builder) -> remote front-office service
  | 'finance_profit'  // margin-stressed owner of an existing practice -> practice profit audit
  | 'finance_seller'  // Exit Strategist: raise value before listing (advisor stance, not acquirer)
  | 'finance_service' // practice finances page: fuller schedule (top line), lower front-desk labor cost (bottom line)
  | 'acquisition_transition'
  // Cluster themes for any optometry owner, solo practices included.
  | 'practice_finance' // practice-finance cluster: books, margins, cash
  | 'ai_projects'      // ai-projects cluster: front desk, phones, scribe, first project
  | 'operations'
  | 'default';

export type BlogFunnel = 'service' | 'acquisition';

export interface BlogCtaVariant {
  funnel: BlogFunnel;
  ctaId: string;
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
  'practice-finance': 'practice_finance',
  'ai-projects': 'ai_projects',
  // practice-transitions reuses the confidential transition variant (links to /optometry-practice-transitions/)
  'practice-transitions': 'acquisition_transition',
  'enterprise': 'operations',
  'enterprise-operations': 'operations',
  'enterprise-compliance': 'operations',
  'bpo-outsourcing': 'operations',
  'call-center-operations': 'operations',
  'virtual-assistant': 'operations',
  'compliance': 'operations',
  'ai-technology': 'operations',
  'optometry': 'operations',
  'patient-access-measurement': 'operations',
  'patient-access-operations': 'operations',
  // dental / veterinary intentionally fall through to default (off-ICP: soft CTA only)
};

const utm = (theme: string, placement: string) =>
  `/contact/?utm_source=blog&utm_medium=${placement}&utm_campaign=theme-${theme}`;

export const blogCtaVariants: Record<FunnelTheme, BlogCtaVariant> = {
  recall_fill_book: {
    funnel: 'service',
    ctaId: 'service-fit-review',
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
    funnel: 'service',
    ctaId: 'service-fit-review',
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
  // --- Finance sub-intents (OB_mybcat decision 2026-06-24). Two offers:
  //   finance_open  -> the remote front-office service (open/scale a practice without a full local desk)
  //   finance_profit / finance_seller -> the Practice Profit Audit ("another location's worth of profit, without the overhead")
  // Roll-up/sell-side is paused: no "we buy your practice" language anywhere. ---
  finance_open: {
    funnel: 'service',
    ctaId: 'service-fit-review',
    title: 'Opening a Practice? Watch the Front Desk',
    description:
      'The biggest ongoing cost of a new location is not the lease. It is a full front desk. MyBCAT runs the phones, scheduling, and recall remotely, so you can open without hiring one on day one.',
    buttonText: 'Get a Front-Desk Plan',
    buttonHref: utm('finance-open', 'in-content-cta'),
    endTitle: 'Open Without Carrying a Full Front Desk',
    endDescription:
      'MyBCAT covers the calls and scheduling for your new practice from day one, so the book fills while your local team stays small and focused on the patients in the chair.',
    endButtonText: 'Book a Discovery Call',
    endButtonHref: discoveryBookingHref('blog-end'),
  },
  finance_profit: {
    funnel: 'service',
    ctaId: 'service-fit-review',
    title: 'Working Harder, Keeping Less?',
    description:
      'You are not imagining the gap. Another location\'s worth of profit could be hiding inside the practice you already run, and a practice profit audit shows you where.',
    buttonText: 'See Where the Profit Is Hiding',
    buttonHref: utm('finance-profit', 'in-content-cta'),
    endTitle: 'Another Location\'s Worth of Profit, Without the Overhead',
    endDescription:
      'You do not need a second address to grow. The audit walks your whole practice and points to where that profit may already be sitting, same location, no new overhead.',
    endButtonText: 'Get the Practice Profit Audit',
    endButtonHref: utm('finance-profit', 'post-cta'),
  },
  finance_seller: {
    funnel: 'service',
    ctaId: 'service-fit-review',
    title: 'Thinking About Selling in the Next Few Years?',
    description:
      'Buyers pay more for a practice that runs without you and keeps its book full. The fastest way to raise your number is to clean up operations before you list, not during diligence.',
    buttonText: 'See What Raises Your Value',
    buttonHref: utm('finance-seller', 'in-content-cta'),
    endTitle: 'Raise the Value Before You List',
    endDescription:
      'A practice profit audit gives you a buyer\'s-eye view of your operations: phone answer rate, recall, scheduling, and where value is leaking. Fix it on your timeline, not theirs.',
    endButtonText: 'Get the Practice Profit Audit',
    endButtonHref: utm('finance-seller', 'post-cta'),
  },
  // Points at /optometry-practice-finances/. Copy restates that page only: no
  // bookkeeping, accounting or tax deliverables, no figures beyond the page's own.
  finance_service: {
    funnel: 'service',
    ctaId: 'service-fit-review',
    title: 'A Better Top Line and Bottom Line',
    description:
      'Our remote hospitality center works to keep your schedule full, and front-desk labor often costs less than staffing the same work in the office. We do all the work.',
    buttonText: 'See How It Works',
    buttonHref: '/optometry-practice-finances/?utm_source=blog&utm_medium=in-content-cta&utm_campaign=theme-finance-service',
    endTitle: 'A Fuller Schedule and Lower Front-Desk Labor Cost',
    endDescription:
      'We run your remote front desk, so there is no assistant for you to manage. See how that helps your practice finances, then book a discovery call to work out your own numbers.',
    endButtonText: 'See How It Helps Your Finances',
    endButtonHref: '/optometry-practice-finances/?utm_source=blog&utm_medium=post-cta&utm_campaign=theme-finance-service',
  },
  acquisition_transition: {
    funnel: 'acquisition',
    ctaId: 'confidential-seller-inquiry',
    title: 'Considering a Practice Transition?',
    description:
      'Start with a confidential fit and timing conversation. No valuation, financial files, or patient records are required for the first inquiry.',
    buttonText: 'Start a Confidential Conversation',
    buttonHref: '/optometry-practice-transitions/?utm_source=blog&utm_medium=in-content-cta&utm_campaign=transition-guides',
    endTitle: 'Talk Through Fit and Timing Confidentially',
    endDescription:
      'Share the basic shape of your goals and timeline. Ankit reviews each inquiry before any qualification or diligence step.',
    endButtonText: 'Send a Confidential Inquiry',
    endButtonHref: '/optometry-practice-transitions/?utm_source=blog&utm_medium=post-cta&utm_campaign=transition-guides',
  },
  practice_finance: {
    funnel: 'service',
    ctaId: 'service-fit-review',
    title: 'Know Your Books, Margins, and Cash',
    description:
      'You do not need a finance team to see where your practice earns and where it leaks. Start with a short call about your books, your margins, and your cash flow.',
    buttonText: 'Book a Discovery Call',
    buttonHref: discoveryBookingHref('blog-mid'),
    endTitle: 'Get Clear on Your Practice Numbers',
    endDescription:
      'Whether you run one practice or several, the questions are the same: are the books current, which lines hold margin, and how much cash is left after payroll and bills. A short discovery call is a good place to start.',
    endButtonText: 'Book a Discovery Call',
    endButtonHref: discoveryBookingHref('blog-end'),
  },
  ai_projects: {
    funnel: 'service',
    ctaId: 'service-fit-review',
    title: 'Thinking About AI for Your Practice?',
    description:
      'Start with one job: the front desk, the phones, or a scribe. A small first project shows what works in your practice before you commit to anything bigger.',
    buttonText: 'Book a Discovery Call',
    buttonHref: discoveryBookingHref('blog-mid'),
    endTitle: 'Pick the First AI Project for Your Practice',
    endDescription:
      'Front desk, phones, or a scribe: choose one first project that fits your team and your patients. A short discovery call is a good place to begin.',
    endButtonText: 'Book a Discovery Call',
    endButtonHref: discoveryBookingHref('blog-end'),
  },
  operations: {
    funnel: 'service',
    ctaId: 'service-fit-review',
    title: 'Stop Patching the Front Desk',
    description:
      'HIPAA-trained remote teams answer every call for 30+ optometry practices: scheduling, insurance verification, and recall, with QA you can inspect.',
    buttonText: 'Book a Discovery Call',
    buttonHref: discoveryBookingHref('blog-mid'),
    endTitle: 'See the Operation Behind 30+ Practices',
    endDescription:
      'Coverage, cost, and QA in one 20-minute walkthrough. If it is not a fit, you keep the benchmarks.',
    endButtonText: 'Book a Discovery Call',
    endButtonHref: discoveryBookingHref('blog-end'),
  },
  default: {
    funnel: 'service',
    ctaId: 'service-fit-review',
    title: 'Reduce Your Front Desk Dependency',
    description:
      'MyBCAT helps healthcare practices build resilient intake operations that do not break when staffing is tight.',
    buttonText: 'Schedule a Consultation',
    buttonHref: utm('general', 'in-content-cta'),
    endTitle: 'Ready to Capture More Revenue?',
    endDescription:
      'See how MyBCAT helps optometry practices of any size fill every appointment slot and reduce front desk dependency.',
    endButtonText: 'Schedule a Consultation',
    endButtonHref: utm('general', 'post-cta'),
  },
};

/** Off-ICP detector: dental/veterinary content gets the neutral default variant even when it
 * shares a cross-cutting cluster (e.g. a dental post tagged patient-recall must not see
 * optometry-specific copy). Checked against slug and category ONLY — tags are too broad a
 * signal (multi-location/DSO posts often carry a "dental" tag while targeting the core ICP).
 *
 * EDITORIAL RULE for posts this regex cannot see (neutral slug, dental/DSO-dominant body):
 * a themed post whose body has >= 8 dental/DSO/vet references and <= 2 optometry references
 * must carry an explicit `ctaTheme: default` frontmatter override (QA-101/QA-201).
 * Run the density sweep after adding new posts; broad-healthcare posts below that threshold
 * intentionally keep their themed CTA (optometry proof copy is acceptable to generic readers). */
const OFF_ICP = /dental|dentist|veterinar|\bvet\b/i;

export interface BlogCtaContext {
  slug?: string;
  category?: string;
  /** The funnel is authoritative and prevents acquisition content from inheriting service CTAs. */
  funnel?: BlogFunnel;
  /** Explicit frontmatter override (ctaTheme) — authoritative when present. */
  ctaTheme?: FunnelTheme;
}

/** Resolve a post's CTA variant. Precedence:
 * 1. acquisition funnel -> confidential transition variant
 * 2. explicit frontmatter ctaTheme override (authoritative, set per-post for
 *    content-classified off-ICP posts, e.g. dental-bodied recall guides)
 * 3. off-ICP slug/category heuristic -> default variant
 * 4. cluster -> theme mapping
 * 5. default variant */
export function getBlogCtaTheme(cluster?: string, ctx?: BlogCtaContext): FunnelTheme {
  if (ctx?.funnel === 'acquisition') return 'acquisition_transition';
  if (ctx?.ctaTheme && blogCtaVariants[ctx.ctaTheme]) return ctx.ctaTheme;
  const haystack = [ctx?.slug, ctx?.category].filter(Boolean).join(' ');
  if (OFF_ICP.test(haystack)) return 'default';
  const key = (cluster || '').replace(/["']/g, '').trim();
  return clusterToTheme[key] || 'default';
}

export function getBlogCta(cluster?: string, ctx?: BlogCtaContext): BlogCtaVariant {
  return blogCtaVariants[getBlogCtaTheme(cluster, ctx)];
}
