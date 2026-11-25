/**
 * The one booking route for discovery calls.
 *
 * Every discovery-call link goes to /book/discovery with a src that names the page
 * and the position (for example finances-hero). vercel.json rewrites the route to
 * api/book/discovery.mjs, which counts the click by src and redirects to the Google
 * appointment schedule. Google's short link discards the src. The src holds nothing
 * personal: only a page and position name from BOOKING_PLACEMENTS. This site also
 * reads it in the booking click event (src/utils/attribution.mjs).
 * Plain JavaScript so the unit tests and the server function can import it.
 */
export const BOOKING_PATH = '/book/discovery';
export const BOOKING_LABEL = 'Book a Discovery Call';
const SRC = /^[a-z0-9][a-z0-9-]{0,63}$/;

/**
 * Every booking placement the site uses. bookingHref refuses any other src, so the
 * site build fails before a link with an unlisted src can exist, and the booking
 * counter (api/book/discovery.mjs) records a src by name only when it is listed.
 * A new placement goes here. The solution pages add <slug>-hero and <slug>-cta for
 * each solution in src/data/solutions.ts.
 */
export const BOOKING_PLACEMENTS = Object.freeze([
  'header',
  'home-hero',
  'home-cta',
  'how-it-works',
  'contact',
  'pricing-hero',
  'pricing-plans',
  'pricing-callout',
  'pricing-cta',
  'finances-hero',
  'finances-cta',
  'fill-rate-finance-mid',
  'blog-top',
  'blog-mid',
  'blog-end',
  'fill-rate-blog-top',
  'fill-rate-blog-mid',
  'fill-rate-blog-end',
  'front-desk-outsourcing-hero',
  'front-desk-outsourcing-cta',
  'integrations-hero',
  'integrations-cta',
  'medical-answering-service-hero',
  'medical-answering-service-cta',
  'medical-virtual-assistant-hero',
  'medical-virtual-assistant-cta',
  'no-show-recovery-hero',
  'no-show-recovery-cta',
  'optometry-virtual-assistant-hero',
  'optometry-virtual-assistant-cta',
  'patient-recall-hero',
  'patient-recall-cta',
  'virtual-medical-scribe-hero',
  'virtual-medical-scribe-cta',
]);

/**
 * Tags on booking links posted outside the site, such as social posts. The booking
 * counter records these by name too. They are kept apart from BOOKING_PLACEMENTS on
 * purpose: bookingHref refuses them, so a site link cannot carry a social tag and
 * site clicks never count as social clicks.
 * A new campaign must add its tags here before its links go out.
 */
export const CAMPAIGN_PLACEMENTS = Object.freeze([
  'fill-rate-linkedin-personal-1',
  'fill-rate-linkedin-personal-2',
  'fill-rate-linkedin-personal-3',
  'fill-rate-linkedin-company-2',
  'fill-rate-linkedin-company-3',
  'fill-rate-facebook-1',
  'fill-rate-facebook-2',
  'fill-rate-facebook-3',
  'fill-rate-instagram-1',
  'fill-rate-instagram-2',
  'fill-rate-instagram-3',
  'fill-rate-social-1',
  'fill-rate-social-2',
  'fill-rate-social-3',
]);

/** True when src has the form of a placement name: lower case letters, digits and hyphens, 64 at most. */
export function isWellFormedSrc(src) {
  return typeof src === 'string' && SRC.test(src);
}

// Sale and valuation posts point at the confidential transitions page instead.
export const CONFIDENTIAL_LABEL = 'Start a Confidential Conversation';
export const CONFIDENTIAL_HREF = '/optometry-practice-transitions/?utm_source=blog&utm_medium=top-cta&utm_campaign=transition-guides';
const SALE_THEMES = ['acquisition_transition', 'finance_seller'];

/**
 * Which link a blog post shows under its description, from its resolved CTA theme
 * (src/data/blog-ctas.ts): none for off-audience posts, which keep the soft default
 * CTA only; the confidential transitions link for sale and valuation posts; the
 * booking link for the rest.
 * @param {string} theme
 * @returns {'none' | 'confidential' | 'booking'}
 */
export function blogTopCta(theme) {
  if (theme === 'default') return 'none';
  if (SALE_THEMES.includes(theme)) return 'confidential';
  return 'booking';
}

/** The booking link for one placement. Throws at build time on a bad or unlisted src. */
export function bookingHref(src) {
  if (!isWellFormedSrc(src)) throw new Error(`Invalid booking src: ${src}`);
  if (!BOOKING_PLACEMENTS.includes(src)) {
    throw new Error(`Unknown booking src: ${src}. Add it to BOOKING_PLACEMENTS in src/utils/booking.mjs.`);
  }
  return `${BOOKING_PATH}?src=${src}`;
}
