/**
 * The one booking route for discovery calls.
 *
 * Every discovery-call link goes to /book/discovery with a src that names the page
 * and the position (for example finances-hero). The route is a redirect in
 * vercel.json to the Google appointment schedule. The redirect forwards the src to
 * Google's short link, which discards it. The src holds nothing personal: only a
 * page and position name. This site reads it in the booking click event
 * (src/utils/attribution.mjs).
 * Plain JavaScript so the unit tests can import it.
 */
export const BOOKING_PATH = '/book/discovery';
export const BOOKING_LABEL = 'Book a Discovery Call';
const SRC = /^[a-z0-9][a-z0-9-]{0,63}$/;

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

/** The booking link for one placement. Throws at build time on a bad src. */
export function bookingHref(src) {
  if (typeof src !== 'string' || !SRC.test(src)) throw new Error(`Invalid booking src: ${src}`);
  return `${BOOKING_PATH}?src=${src}`;
}
