/* global URL, URLSearchParams */
/**
 * First-party lead source capture.
 *
 * Stores where a visitor came from so a form fill or a booking click can be
 * counted by source. Browser storage only: localStorage for the first touch,
 * sessionStorage for the last touch of the current session. No cookie, no
 * visitor id. A visitor who sends Global Privacy Control or Do Not Track gets
 * nothing stored, read or attached.
 *
 * Stored values follow an allow rule, not a block list. A value is kept only
 * if, after URL-decoding until it stops changing (3 times at most) and lower
 * casing, it matches ^[a-z0-9][a-z0-9._-]{0,63}$ and holds fewer than 7 digits.
 * Anything else is dropped, never rewritten. A person can still type a name in
 * these characters (jane-doe), so the three utm values are limited to
 * utm_source, utm_medium and utm_campaign, which the team sets itself.
 *
 * The pure functions (deriveChannel, readAttribution, mergeAttribution and the
 * helpers) take plain values so unit tests can run them in Node. initAttribution
 * is the only function that touches the browser, and it takes the window as an
 * argument for the same reason.
 *
 * This is separate from public/js/seo-attribution.js on purpose. That script
 * keeps a closed list of approved values for the confidential SEO intake
 * funnel. This module never runs on pages that turn tracking off.
 */

export const FIRST_TOUCH_KEY = 'mybcat_first_touch_v1';
export const LAST_TOUCH_KEY = 'mybcat_last_touch_v1';
export const BOOKING_EVENT = 'mybcat_booking_click';
export const CHANNELS = ['organic_search', 'social', 'podcast', 'email', 'ai_assistant', 'referral', 'paid', 'direct'];

const TOUCH_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'referrer_host', 'landing_path', 'channel', 'date'];
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'];
const CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'msclkid', 'dclid', 'li_fat_id', 'ttclid'];
// The site tags its own links with utm_source=site (see discoveryBookingHref).
// That is a link on this site, not a way in, so it never counts as a touch.
const INTERNAL_SOURCES = ['site'];
const OWN_HOSTS = ['mybcat.com'];
const MAX_RAW = 512;

const ALLOWED = /^[a-z0-9][a-z0-9._-]{0,63}$/;

// Booking links: the one internal path, plus the two Google schedule ids that
// belong to the discovery call.
const BOOKING_PATH = /^\/book\/discovery\/?$/;
const SCHEDULE_IDS = [
  'PLDmK4QwpdSqkxmb8',
  'AcZssZ21kmAUBj4aZSq7DYPJ4jkhMAVh400vqdkedNXshigCOXwWVU87EvvK4as9dXOlAqZYOruIhLog',
];

// These lists are only compared against. Nothing from them is stored.
const PAID_MEDIUMS = ['display', 'cpm', 'banner', 'retargeting', 'remarketing', 'sponsored'];
const EMAIL_MEDIUMS = ['email', 'e-mail', 'newsletter', 'mail'];
const PODCAST_MEDIUMS = ['podcast', 'podcasts', 'audio'];
const SOCIAL_MEDIUMS = ['social', 'social-network', 'social-media', 'sm', 'smm', 'organic-social'];
const ORGANIC_MEDIUMS = ['organic', 'seo'];
const EMAIL_SOURCES = ['email', 'e-mail', 'hs-email', 'newsletter', 'mailchimp', 'klaviyo', 'constantcontact', 'sendgrid'];
const SOCIAL_SOURCES = ['facebook', 'fb', 'instagram', 'ig', 'linkedin', 'twitter', 'x', 'reddit', 'pinterest', 'tiktok', 'youtube', 'threads', 'bluesky', 'snapchat', 'whatsapp', 'telegram', 'quora', 'nextdoor', 'social'];
const SEARCH_SOURCES = ['google', 'bing', 'duckduckgo', 'yahoo', 'ecosia', 'baidu', 'yandex', 'brave', 'startpage', 'qwant', 'kagi', 'ask', 'aol'];
const AI_SOURCES = ['chatgpt.com', 'chatgpt', 'perplexity.ai', 'perplexity', 'claude.ai', 'gemini.google.com', 'copilot.microsoft.com'];

const EMAIL_HOSTS = ['mail.google.com', 'outlook.live.com', 'outlook.office.com', 'outlook.office365.com', 'mail.yahoo.com', 'mail.aol.com', 'mail.proton.me', 'com.google.android.gm', 'com.microsoft.office.outlook'];
const PODCAST_HOSTS = ['podcasts.apple.com', 'podcasts.google.com', 'spotify.com', 'overcast.fm', 'pocketcasts.com', 'pca.st', 'castbox.fm', 'stitcher.com', 'podbean.com', 'buzzsprout.com', 'libsyn.com', 'anchor.fm', 'iheart.com', 'player.fm', 'podchaser.com', 'transistor.fm', 'simplecast.com', 'captivate.fm', 'spreaker.com', 'castos.com', 'listennotes.com', 'podcastaddict.com', 'fountain.fm'];
const AI_HOSTS = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'claude.ai', 'gemini.google.com', 'copilot.microsoft.com'];
const SEARCH_HOSTS = ['bing.com', 'duckduckgo.com', 'ecosia.org', 'baidu.com', 'search.brave.com', 'startpage.com', 'qwant.com', 'kagi.com', 'ask.com', 'search.aol.com', 'search.yahoo.com', 'com.google.android.googlequicksearchbox'];
const SOCIAL_HOSTS = ['facebook.com', 'fb.com', 'fb.me', 'instagram.com', 'linkedin.com', 'lnkd.in', 'twitter.com', 't.co', 'x.com', 'reddit.com', 'pinterest.com', 'pin.it', 'tiktok.com', 'youtube.com', 'youtu.be', 'threads.net', 'bsky.app', 'quora.com', 'snapchat.com', 'whatsapp.com', 'wa.me', 't.me', 'telegram.org', 'nextdoor.com', 'tumblr.com', 'com.facebook.katana', 'com.instagram.android', 'com.linkedin.android', 'com.twitter.android', 'com.reddit.frontpage', 'com.google.android.youtube'];
// Google sign-in and calendar pages: a visitor passing through them is not a new way in.
const IGNORED_HOSTS = ['calendar.google.com', 'myaccount.google.com', 'accounts.youtube.com'];

function hostMatches(host, list) {
  return list.some((entry) => host === entry || host.endsWith(`.${entry}`));
}

/** Decode until the text stops changing, three times at most. Stops at a bad escape. */
function decodeStable(text) {
  let current = text;
  for (let pass = 0; pass < 3; pass += 1) {
    let next;
    try {
      next = decodeURIComponent(current);
    } catch {
      return current;
    }
    if (next === current) return current;
    current = next;
  }
  return current;
}

function passesAllowRule(text) {
  return ALLOWED.test(text) && (text.match(/\d/g) || []).length < 7;
}

/**
 * The allow rule for a stored value. Returns the lower case value, or '' when
 * it does not pass. Nothing is rewritten.
 */
export function cleanToken(value) {
  if (typeof value !== 'string' || value.length > MAX_RAW) return '';
  const text = decodeStable(value.trim()).toLowerCase();
  return passesAllowRule(text) ? text : '';
}

/** Loose form used only to compare against the lists above. Never stored. */
function matchKey(value) {
  if (typeof value !== 'string' || value.length > MAX_RAW) return '';
  return decodeStable(value.trim()).toLowerCase().replace(/[\s_]+/g, '-').slice(0, 100);
}

/** Host name from a URL or a bare host. Lower case, no www, port or userinfo. */
function extractHost(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > MAX_RAW) return '';
  let host = value.trim().toLowerCase();
  if (host.includes('://')) {
    try {
      host = new URL(host).hostname;
    } catch {
      return '';
    }
  }
  host = host.replace(/^www\./, '').replace(/:\d+$/, '').replace(/\.$/, '');
  return /^[a-z0-9._-]+$/.test(host) ? host : '';
}

/** Host only, and only if it passes the allow rule. */
export function cleanHost(value) {
  const host = extractHost(value);
  return passesAllowRule(host) ? host : '';
}

/**
 * Landing path: decoded first, then the first two segments at most, each one
 * passing the allow rule. The path stops at the first segment that fails, so
 * the result is /, /first/ or /first/second/.
 */
export function cleanPath(value) {
  if (typeof value !== 'string' || !value.startsWith('/')) return '';
  if (value.length > 2048) return '/';
  const segments = decodeStable(value.split(/[?#]/)[0]).split('/').filter(Boolean);
  const kept = [];
  for (let index = 0; index < 2 && index < segments.length; index += 1) {
    const segment = segments[index].toLowerCase();
    if (!passesAllowRule(segment)) break;
    kept.push(segment);
  }
  if (!kept.length) return '/';
  return `/${kept.join('/')}${kept[kept.length - 1].includes('.') ? '' : '/'}`;
}

function cleanDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

function isoDate(now) {
  const date = now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date();
  return date.toISOString().slice(0, 10);
}

function isOwnHost(host, ownHosts) {
  return [...OWN_HOSTS, ...(ownHosts || []).map(extractHost)].filter(Boolean).some((own) => host === own || host.endsWith(`.${own}`));
}

function isIgnoredReferrer(host) {
  return hostMatches(host, IGNORED_HOSTS) || /^accounts\.google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(host);
}

/**
 * Channel for one touch. Order matters: a click id or a paid medium means paid,
 * then the campaign medium, then the campaign source, then the referrer host.
 * Source and medium are compared in a loose form and are not stored by this
 * function.
 * @param {{source?: string, medium?: string, referrerHost?: string, clickId?: boolean}} input
 * @returns {'organic_search'|'social'|'podcast'|'email'|'ai_assistant'|'referral'|'paid'|'direct'}
 */
export function deriveChannel(input = {}) {
  const source = matchKey(input.source || '');
  const medium = matchKey(input.medium || '');
  const host = extractHost(input.referrerHost || '');

  if (input.clickId) return 'paid';
  if (/^(cpc|ppc|paid)/.test(medium) || PAID_MEDIUMS.includes(medium)) return 'paid';
  if (EMAIL_MEDIUMS.includes(medium)) return 'email';
  if (PODCAST_MEDIUMS.includes(medium)) return 'podcast';
  if (SOCIAL_MEDIUMS.includes(medium)) return 'social';

  if (EMAIL_SOURCES.includes(source) || source.includes('newsletter')) return 'email';
  if (source.includes('podcast')) return 'podcast';
  if (SOCIAL_SOURCES.includes(source)) return 'social';
  if (AI_SOURCES.includes(source)) return 'ai_assistant';
  if (ORGANIC_MEDIUMS.includes(medium) || SEARCH_SOURCES.includes(source)) return 'organic_search';

  if (host) {
    if (hostMatches(host, EMAIL_HOSTS) || host.startsWith('webmail.')) return 'email';
    if (hostMatches(host, PODCAST_HOSTS)) return 'podcast';
    if (hostMatches(host, AI_HOSTS)) return 'ai_assistant';
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
  const internal = INTERNAL_SOURCES.includes(matchKey(params.get('utm_source') || ''));

  const raw = {};
  const utm = {};
  UTM_KEYS.forEach((key) => {
    raw[key] = internal ? '' : params.get(key) || '';
    utm[key] = cleanToken(raw[key]);
  });
  const clickId = !internal && CLICK_IDS.some((id) => params.has(id));

  let referrerHost = extractHost(input.referrer || '');
  if (referrerHost && (isOwnHost(referrerHost, input.ownHosts) || isIgnoredReferrer(referrerHost))) referrerHost = '';

  return {
    ...utm,
    referrer_host: cleanHost(referrerHost),
    landing_path: url ? cleanPath(url.pathname) : '',
    channel: deriveChannel({ source: raw.utm_source, medium: raw.utm_medium, referrerHost, clickId }),
    date: isoDate(input.now),
  };
}

/** Clean a touch that came from storage. Returns null when it is not a touch. */
export function normalizeTouch(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (!CHANNELS.includes(value.channel)) return null;
  const date = cleanDate(value.date);
  if (!date) return null;
  const touch = {};
  TOUCH_FIELDS.forEach((field) => {
    if (field === 'referrer_host') touch[field] = cleanHost(value[field]);
    else if (field === 'landing_path') touch[field] = cleanPath(value[field]) || '/';
    else if (field === 'channel') touch[field] = value.channel;
    else if (field === 'date') touch[field] = date;
    else touch[field] = cleanToken(value[field]);
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

/**
 * The first-touch campaign values as a flat map of strings, with only the key
 * names the /optometry-analysis/ page already sends the form receiver in
 * context.utm. Empty values are left out.
 */
export function firstTouchUtm(attribution) {
  const first = attribution && attribution.first_touch;
  const utm = {};
  UTM_KEYS.forEach((key) => {
    if (first && typeof first[key] === 'string' && first[key]) utm[key] = first[key];
  });
  return utm;
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
  const host = extractHost(url.hostname);
  if (host === 'calendar.app.google' || (host === 'calendar.google.com' && url.pathname.startsWith('/calendar/appointments/schedules/'))) {
    return SCHEDULE_IDS.some((id) => url.pathname.includes(id));
  }
  return isOwnHost(host, ownHosts) && BOOKING_PATH.test(url.pathname);
}

/** Where on the site the link sat: its src (page and position), or an older utm_content. */
export function bookingPlacement(href, base) {
  try {
    const params = new URL(href, base || 'https://mybcat.com/').searchParams;
    return cleanToken(params.get('src') || params.get('utm_content') || '');
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

function removeKey(store, key) {
  try {
    if (store && typeof store.removeItem === 'function') store.removeItem(key);
  } catch {
    // Storage blocked. Nothing was written by this script on this page.
  }
}

function optedOut(win) {
  try {
    const nav = win.navigator || {};
    return nav.globalPrivacyControl === true || nav.doNotTrack === '1' || win.doNotTrack === '1';
  } catch {
    return false;
  }
}

function closestLink(node) {
  let current = node;
  while (current) {
    if (current.nodeType === 1 && String(current.tagName).toUpperCase() === 'A' && current.getAttribute('href')) return current;
    current = current.parentNode;
  }
  return null;
}

/**
 * Capture attribution for this page view and expose window.MyBCATLeadSource.
 * Runs once per page. Does nothing on a page that has no tracking marker (the
 * layouts leave the marker out when tracking is turned off) and nothing for a
 * visitor who sends Global Privacy Control or Do Not Track.
 */
export function initAttribution(win) {
  if (!win || !win.document) return null;
  if (win.MyBCATLeadSource) return win.MyBCATLeadSource;
  const doc = win.document;
  if (!doc.querySelector('meta[name="mybcat-attribution"]')) return null;

  const local = getStore(win, 'localStorage');
  const session = getStore(win, 'sessionStorage');
  if (optedOut(win)) {
    removeKey(local, FIRST_TOUCH_KEY);
    removeKey(session, LAST_TOUCH_KEY);
    return null;
  }

  const loc = win.location;
  const ownHosts = [loc.hostname];
  const stored = { first_touch: readJson(local, FIRST_TOUCH_KEY), last_touch: readJson(session, LAST_TOUCH_KEY) };
  const touch = readAttribution({ href: loc.href, referrer: doc.referrer, now: new Date(), ownHosts });
  const merged = mergeAttribution(stored, touch);
  if (!normalizeTouch(stored.first_touch)) writeJson(local, FIRST_TOUCH_KEY, merged.first_touch);
  writeJson(session, LAST_TOUCH_KEY, merged.last_touch);

  // One booking event per page view. The first one sets the trigger.
  let bookingCounted = false;

  const api = {
    get() {
      return JSON.parse(JSON.stringify(merged));
    },
    flat() {
      return flattenAttribution(merged);
    },
    utm() {
      return firstTouchUtm(merged);
    },
    push(event, props) {
      win.dataLayer = win.dataLayer || [];
      win.dataLayer.push({ event, ...(props || {}) });
    },
    trackBookingStart(options = {}) {
      if (bookingCounted) return false;
      bookingCounted = true;
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
      return true;
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
