/* global URL, URLSearchParams */
/**
 * First-party lead source capture.
 *
 * Stores where a visitor came from so a form fill or a booking click can be
 * counted by source. Browser storage only: localStorage for the first touch,
 * sessionStorage for the last touch of the current session. No cookie, no
 * visitor id, no personal data. Values are cleaned before they are stored or
 * sent: an email address, a long digit run, a query string or a full URL never
 * survives.
 *
 * The pure functions (deriveChannel, readAttribution, mergeAttribution and the
 * helpers) take plain values so unit tests can run them in Node. initAttribution
 * is the only function that touches the browser, and it takes the window as an
 * argument for the same reason.
 *
 * This is separate from public/js/seo-attribution.js on purpose. That script
 * keeps a closed list of approved values for the confidential SEO intake
 * funnel. This module keeps the raw (cleaned) campaign values for the general
 * marketing site and never runs on pages that turn tracking off.
 */

export const FIRST_TOUCH_KEY = 'mybcat_first_touch_v1';
export const LAST_TOUCH_KEY = 'mybcat_last_touch_v1';
export const BOOKING_EVENT = 'mybcat_booking_click';
export const CHANNELS = ['organic_search', 'social', 'podcast', 'email', 'referral', 'paid', 'direct'];

const TOUCH_FIELDS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'referrer_host',
  'landing_path',
  'channel',
  'date',
];
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'msclkid', 'dclid'];
// The site tags its own links with utm_source=site (see discoveryBookingHref).
// That is a link on this site, not a way in, so it never counts as a touch.
const INTERNAL_SOURCES = ['site'];
const OWN_HOSTS = ['mybcat.com'];

// Booking links: the one internal path, plus the two Google schedule ids that
// belong to the discovery call.
const BOOKING_PATH = /^\/book\/discovery\/?$/;
const SCHEDULE_IDS = [
  'PLDmK4QwpdSqkxmb8',
  'AcZssZ21kmAUBj4aZSq7DYPJ4jkhMAVh400vqdkedNXshigCOXwWVU87EvvK4as9dXOlAqZYOruIhLog',
];

const PAID_MEDIUMS = ['cpc', 'ppc', 'paid', 'paidsearch', 'paid-search', 'paid_search', 'paidsocial', 'paid-social', 'paid_social', 'display', 'cpm', 'banner', 'retargeting', 'remarketing', 'sponsored'];
const EMAIL_MEDIUMS = ['email', 'e-mail', 'e_mail', 'newsletter', 'mail'];
const PODCAST_MEDIUMS = ['podcast', 'podcasts', 'audio'];
const SOCIAL_MEDIUMS = ['social', 'social-network', 'social-media', 'social_media', 'sm', 'smm', 'organic-social', 'organic_social'];
const ORGANIC_MEDIUMS = ['organic', 'seo'];
const EMAIL_SOURCES = ['email', 'e-mail', 'newsletter', 'mailchimp', 'klaviyo', 'constantcontact', 'sendgrid'];
const SOCIAL_SOURCES = ['facebook', 'fb', 'instagram', 'ig', 'linkedin', 'twitter', 'x', 'reddit', 'pinterest', 'tiktok', 'youtube', 'threads', 'bluesky', 'snapchat', 'whatsapp', 'telegram', 'quora', 'nextdoor', 'social'];
const SEARCH_SOURCES = ['google', 'bing', 'duckduckgo', 'yahoo', 'ecosia', 'baidu', 'yandex', 'brave', 'startpage', 'qwant', 'kagi', 'ask', 'aol'];

const EMAIL_HOSTS = ['mail.google.com', 'outlook.live.com', 'outlook.office.com', 'outlook.office365.com', 'mail.yahoo.com', 'mail.aol.com', 'mail.proton.me'];
const PODCAST_HOSTS = ['podcasts.apple.com', 'podcasts.google.com', 'spotify.com', 'overcast.fm', 'pocketcasts.com', 'pca.st', 'castbox.fm', 'stitcher.com', 'podbean.com', 'buzzsprout.com', 'libsyn.com', 'anchor.fm', 'iheart.com', 'player.fm', 'podchaser.com', 'transistor.fm', 'simplecast.com', 'captivate.fm', 'spreaker.com', 'castos.com', 'listennotes.com', 'podcastaddict.com', 'fountain.fm'];
const SEARCH_HOSTS = ['bing.com', 'duckduckgo.com', 'ecosia.org', 'baidu.com', 'search.brave.com', 'startpage.com', 'qwant.com', 'kagi.com', 'ask.com', 'search.aol.com', 'search.yahoo.com', 'com.google.android.googlequicksearchbox'];
const SOCIAL_HOSTS = ['facebook.com', 'fb.com', 'fb.me', 'instagram.com', 'linkedin.com', 'lnkd.in', 'twitter.com', 't.co', 'x.com', 'reddit.com', 'pinterest.com', 'pin.it', 'tiktok.com', 'youtube.com', 'youtu.be', 'threads.net', 'bsky.app', 'quora.com', 'snapchat.com', 'whatsapp.com', 'wa.me', 't.me', 'telegram.org', 'nextdoor.com', 'tumblr.com', 'com.facebook.katana', 'com.instagram.android', 'com.linkedin.android', 'com.twitter.android', 'com.reddit.frontpage', 'com.google.android.youtube'];

function hostMatches(host, list) {
  return list.some((entry) => host === entry || host.endsWith(`.${entry}`));
}

/**
 * Clean a campaign value. Lower case, safe characters only, 80 characters
 * at most. A value that holds an email address or a phone-like digit run is
 * dropped whole, because a tagged link can carry a mail merge field.
 */
export function cleanToken(value, max = 80) {
  if (typeof value !== 'string') return '';
  const text = value.trim().toLowerCase();
  if (!text || text.includes('@') || /\d{10,}|\d{3}[\s.-]?\d{3}[\s.-]?\d{4}/.test(text)) return '';
  return text
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._+-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max);
}

/** Host only: no scheme, path, query or port. A leading www. is removed. */
export function cleanHost(value) {
  if (typeof value !== 'string' || !value.trim()) return '';
  let host = value.trim().toLowerCase();
  if (host.includes('://')) {
    try {
      host = new URL(host).hostname;
    } catch {
      return '';
    }
  }
  host = host.replace(/^www\./, '').replace(/:\d+$/, '').replace(/\.$/, '');
  return /^[a-z0-9][a-z0-9.-]{0,98}[a-z0-9]$/.test(host) ? host : '';
}

/** Path only: no query, no hash. */
export function cleanPath(value) {
  if (typeof value !== 'string') return '';
  const path = value.split(/[?#]/)[0].replace(/\/{2,}/g, '/');
  if (!path.startsWith('/') || path.includes('@')) return '';
  return path.slice(0, 200);
}

function cleanDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

function isoDate(now) {
  const date = now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date();
  return date.toISOString().slice(0, 10);
}

function isOwnHost(host, ownHosts) {
  return [...OWN_HOSTS, ...(ownHosts || []).map(cleanHost)].filter(Boolean).some((own) => host === own || host.endsWith(`.${own}`));
}

/**
 * Channel for one touch. Order matters: a click id means paid, then the
 * campaign medium, then the campaign source, then the referrer host.
 * @param {{source?: string, medium?: string, referrerHost?: string, clickId?: boolean}} input
 * @returns {'organic_search'|'social'|'podcast'|'email'|'referral'|'paid'|'direct'}
 */
export function deriveChannel(input = {}) {
  const source = cleanToken(input.source || '');
  const medium = cleanToken(input.medium || '');
  const host = cleanHost(input.referrerHost || '');

  if (input.clickId) return 'paid';
  if (PAID_MEDIUMS.includes(medium)) return 'paid';
  if (EMAIL_MEDIUMS.includes(medium)) return 'email';
  if (PODCAST_MEDIUMS.includes(medium)) return 'podcast';
  if (SOCIAL_MEDIUMS.includes(medium)) return 'social';

  if (EMAIL_SOURCES.includes(source) || source.includes('newsletter')) return 'email';
  if (source.includes('podcast')) return 'podcast';
  if (SOCIAL_SOURCES.includes(source)) return 'social';
  if (ORGANIC_MEDIUMS.includes(medium) || SEARCH_SOURCES.includes(source)) return 'organic_search';

  if (host) {
    if (hostMatches(host, EMAIL_HOSTS) || host.startsWith('webmail.')) return 'email';
    if (hostMatches(host, PODCAST_HOSTS)) return 'podcast';
    if (/^google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host) || /^(.+\.)?yandex\.[a-z]{2,3}$/.test(host) || hostMatches(host, SEARCH_HOSTS)) return 'organic_search';
    if (hostMatches(host, SOCIAL_HOSTS)) return 'social';
    return 'referral';
  }

  if (source || medium) return 'referral';
  return 'direct';
}

/**
 * Read the touch for the current page view from the URL and the referrer.
 * @param {{href?: string, referrer?: string, now?: Date, ownHosts?: string[]}} input
 */
export function readAttribution(input = {}) {
  let url = null;
  try {
    url = new URL(input.href);
  } catch {
    url = null;
  }
  const params = url ? url.searchParams : new URLSearchParams();
  const internal = INTERNAL_SOURCES.includes(cleanToken(params.get('utm_source') || ''));

  const utm = {};
  UTM_KEYS.forEach((key) => {
    utm[key] = internal ? '' : cleanToken(params.get(key) || '');
  });
  const clickId = !internal && CLICK_IDS.some((id) => params.has(id));

  let referrerHost = cleanHost(input.referrer || '');
  if (referrerHost && isOwnHost(referrerHost, input.ownHosts)) referrerHost = '';

  return {
    ...utm,
    referrer_host: referrerHost,
    landing_path: cleanPath(url ? url.pathname : ''),
    channel: deriveChannel({ source: utm.utm_source, medium: utm.utm_medium, referrerHost, clickId }),
    date: isoDate(input.now),
  };
}

/** Clean a touch that came from storage. Returns null when it is not a touch. */
export function normalizeTouch(value) {
  if (!value || typeof value !== 'object') return null;
  if (!CHANNELS.includes(value.channel)) return null;
  const date = cleanDate(value.date);
  if (!date) return null;
  const touch = {};
  TOUCH_FIELDS.forEach((field) => {
    if (field === 'referrer_host') touch[field] = cleanHost(value[field] || '');
    else if (field === 'landing_path') touch[field] = cleanPath(value[field] || '');
    else if (field === 'channel') touch[field] = value.channel;
    else if (field === 'date') touch[field] = date;
    else touch[field] = cleanToken(value[field] || '');
  });
  return touch;
}

/**
 * Merge the stored touches with the touch for this page view.
 * The first touch is never overwritten once it is valid. The last touch moves
 * only when this page view brings a way in (anything but direct), or when no
 * last touch exists yet for the session.
 */
export function mergeAttribution(stored, touch) {
  const current = normalizeTouch(touch);
  const first = normalizeTouch(stored && stored.first_touch);
  const last = normalizeTouch(stored && stored.last_touch);
  return {
    first_touch: first || current,
    last_touch: !last || (current && current.channel !== 'direct') ? current : last,
  };
}

/** Flat key/value form for dataLayer and PostHog events. */
export function flattenAttribution(attribution) {
  const flat = {};
  ['first_touch', 'last_touch'].forEach((name) => {
    const touch = attribution && attribution[name];
    TOUCH_FIELDS.forEach((field) => {
      flat[`${name}_${field}`] = touch ? touch[field] || '' : '';
    });
  });
  return flat;
}

/** True for the internal booking path and for the discovery Google schedule. */
export function isBookingUrl(href, ownHosts, base) {
  let url;
  try {
    url = new URL(href, base || 'https://mybcat.com/');
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
  const host = cleanHost(url.hostname);
  if (host === 'calendar.app.google' || (host === 'calendar.google.com' && url.pathname.startsWith('/calendar/appointments/schedules/'))) {
    return SCHEDULE_IDS.some((id) => url.pathname.includes(id));
  }
  return isOwnHost(host, ownHosts) && BOOKING_PATH.test(url.pathname);
}

/** Where on the site the link sat: the utm_content the link already carries. */
export function bookingPlacement(href, base) {
  try {
    return cleanToken(new URL(href, base || 'https://mybcat.com/').searchParams.get('utm_content') || '');
  } catch {
    return '';
  }
}

function getStore(win, name) {
  try {
    return win[name] || null;
  } catch {
    return null;
  }
}

function readJson(store, key) {
  try {
    return store ? JSON.parse(store.getItem(key) || 'null') : null;
  } catch {
    return null;
  }
}

function writeJson(store, key, value) {
  try {
    if (store) store.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked. The page view still has the value in memory.
  }
}

function closestLink(node) {
  let current = node;
  while (current && current.nodeType === 1) {
    if (current.tagName === 'A' && current.getAttribute('href')) return current;
    current = current.parentNode;
  }
  return null;
}

/**
 * Capture attribution for this page view and expose window.MyBCATLeadSource.
 * Runs once per page. Does nothing on a page that has no tracking marker
 * (the layouts leave the marker out when tracking is turned off).
 */
export function initAttribution(win) {
  if (!win || !win.document) return null;
  if (win.MyBCATLeadSource) return win.MyBCATLeadSource;
  const doc = win.document;
  if (!doc.querySelector('meta[name="mybcat-attribution"]')) return null;

  const loc = win.location;
  const ownHosts = [loc.hostname];
  const local = getStore(win, 'localStorage');
  const session = getStore(win, 'sessionStorage');

  const stored = { first_touch: readJson(local, FIRST_TOUCH_KEY), last_touch: readJson(session, LAST_TOUCH_KEY) };
  const touch = readAttribution({ href: loc.href, referrer: doc.referrer, now: new Date(), ownHosts });
  const merged = mergeAttribution(stored, touch);
  if (!normalizeTouch(stored.first_touch)) writeJson(local, FIRST_TOUCH_KEY, merged.first_touch);
  writeJson(session, LAST_TOUCH_KEY, merged.last_touch);

  const api = {
    get() {
      return JSON.parse(JSON.stringify(merged));
    },
    flat() {
      return flattenAttribution(merged);
    },
    push(event, props) {
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({ event, ...(props || {}) });
    },
    trackBookingStart(options = {}) {
      const props = {
        booking_placement: cleanToken(options.placement || ''),
        booking_trigger: cleanToken(options.trigger || '') || 'link_click',
        page_path: cleanPath(loc.pathname),
        ...flattenAttribution(merged),
      };
      api.push(BOOKING_EVENT, props);
      if (options.posthog !== false && win.posthog && typeof win.posthog.capture === 'function') {
        win.posthog.capture(BOOKING_EVENT, props);
      }
    },
  };
  win.MyBCATLeadSource = api;

  // One listener for every booking link on the page, blog content included.
  // Capture phase, so a handler that stops the event cannot hide the click.
  doc.addEventListener(
    'click',
    (event) => {
      try {
        const link = closestLink(event.target);
        if (!link) return;
        const href = link.getAttribute('href');
        if (!isBookingUrl(href, ownHosts, loc.href)) return;
        api.trackBookingStart({ placement: bookingPlacement(href, loc.href), trigger: 'link_click' });
      } catch {
        // Tracking must never block a click.
      }
    },
    true
  );
  return api;
}
