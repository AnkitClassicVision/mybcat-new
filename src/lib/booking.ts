/**
 * Discovery call booking links, shared by the contact and partner pages.
 *
 * The scheduling step embeds a Google appointment schedule in an iframe.
 * Google only renders that schedule inside a frame when the URL carries the
 * `gv=true` parameter, so it is baked into the constant here. This schedule
 * type does not accept `firstName`, `lastName`, or `email` prefill parameters,
 * so callers must set the iframe `src` to this value as-is.
 */
export const MEETINGS_URL =
  'https://calendar.google.com/calendar/appointments/schedules/AcZssZ21kmAUBj4aZSq7DYPJ4jkhMAVh400vqdkedNXshigCOXwWVU87EvvK4as9dXOlAqZYOruIhLog?gv=true';

/** Direct booking page shown when the embedded calendar does not render. */
export const MEETINGS_FALLBACK_URL = 'https://mybcat.com/book/discovery';
