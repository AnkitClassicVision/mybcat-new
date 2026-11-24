/**
 * The one booking route for discovery calls.
 *
 * Every discovery-call link goes to /book/discovery with a src that names the page
 * and the position (for example finances-hero). The route is a redirect in
 * vercel.json to the Google appointment schedule. Nothing about the visitor is
 * added: Google's short link drops the query string, so the src is only read on
 * this site, by the booking click event (src/utils/attribution.mjs).
 * Plain JavaScript so the unit tests can import it.
 */
export const BOOKING_PATH = '/book/discovery';
export const BOOKING_LABEL = 'Book a Discovery Call';
const SRC = /^[a-z0-9][a-z0-9-]{0,63}$/;

/** The booking link for one placement. Throws at build time on a bad src. */
export function bookingHref(src) {
  if (typeof src !== 'string' || !SRC.test(src)) throw new Error(`Invalid booking src: ${src}`);
  return `${BOOKING_PATH}?src=${src}`;
}
