/**
 * /book/discovery: count one booking click, then send the visitor on.
 *
 * vercel.json rewrites /book/discovery and /book/discovery/ to this function.
 * The answer is the same 308 the static redirect gave, to the same Google
 * appointment schedule. The host and path are fixed. Only a src from the site
 * or campaign placement lists goes on (?src=home-hero), so a normal booking link
 * gets a byte-identical Location; every other query value is dropped. Google's
 * short link drops the query anyway, so the visitor lands on the same page.
 *
 * For a GET it writes one record of three values:
 * - src: the placement name when it is in BOOKING_PLACEMENTS or
 *   CAMPAIGN_PLACEMENTS (src/utils/booking.mjs); 'other' for a well-formed
 *   name in neither list; 'invalid' for anything else; 'none' when the link
 *   has no src. Only listed names are ever kept.
 * - date: the UTC day, YYYY-MM-DD.
 * - bot: true when the GET is not a plain browser navigation, by a coarse test
 *   on the user agent. The user agent itself is not kept.
 * No IP address, user agent, cookie, referrer, other query value or identifier.
 * HEAD, OPTIONS, POST and other methods get the redirect and are not counted.
 *
 * The record goes to the Vercel runtime log (one JSON line; Pro keeps one day)
 * and, when PUBLIC_POSTHOG_PROJECT_TOKEN is set (Production), to PostHog as one
 * personless event under one fixed id, which keeps the daily counts. No request
 * header is passed on to PostHog. PostHog may still store the IP address of the
 * request it receives: that is the IP of this Vercel function's server, not the
 * visitor's. $geoip_disable stops PostHog from looking up a location for it.
 *
 * The visitor does not wait for PostHog: the redirect is sent first and the
 * PostHog call is handed to Vercel's waitUntil from the request context. Where
 * that is not available, the call is awaited before the redirect. Either way it
 * is cut off after POSTHOG_TIMEOUT_MS.
 *
 * It fails open: there is no top-level import, the placement list loads inside
 * the handler, and any error in counting still sends the redirect.
 */
export const DESTINATION = 'https://calendar.app.google/PLDmK4QwpdSqkxmb8';
export const EVENT = 'booking_redirect';
const BODY = 'Redirecting...\n';
const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';
// One fixed name for every event, not a person: the events are personless.
const DISTINCT_ID = 'mybcat-booking-redirect';
const POSTHOG_TIMEOUT_MS = 800;
// Record values that are not placement names. The list test keeps them out of BOOKING_PLACEMENTS.
const NOT_A_PLACEMENT = new Set(['none', 'invalid', 'other']);
// Vercel puts the per-request context, with waitUntil, under this symbol.
const REQUEST_CONTEXT = Symbol.for('@vercel/request-context');

// Coarse: crawlers, link previews, monitors, headless browsers and HTTP tools.
const BOT_UA = /bot|crawl|spider|slurp|scrap|fetch|preview|monitor|uptime|pingdom|lighthouse|headless|phantom|python|curl|wget|httpclient|http-client|okhttp|axios|undici|go-http|java\/|libwww|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|skype/i;

let rules = null;

/** The site and campaign placement lists and the src rule, loaded once inside the handler so a load error cannot stop the redirect. */
async function loadRules() {
  if (!rules) {
    const booking = await import('../../src/utils/booking.mjs');
    rules = {
      placements: new Set([...booking.BOOKING_PLACEMENTS, ...booking.CAMPAIGN_PLACEMENTS]),
      isWellFormedSrc: booking.isWellFormedSrc,
    };
  }
  return rules;
}

function header(req, name) {
  const value = req?.headers?.[name];
  return Array.isArray(value) ? value[0] : value;
}

/** The query string as the request sent it, without the leading '?'. */
function rawQuery(req) {
  const url = typeof req?.url === 'string' ? req.url : '';
  const start = url.indexOf('?');
  return start < 0 ? '' : url.slice(start + 1);
}

/** The link's placement: a listed name, or 'other', 'invalid' or 'none'. */
export async function placement(query) {
  if (typeof query !== 'string') return 'invalid';
  let src;
  try {
    src = new URLSearchParams(query).get('src');
  } catch {
    return 'invalid';
  }
  if (src === null || src === '') return 'none';
  const { placements, isWellFormedSrc } = await loadRules();
  if (!isWellFormedSrc(src)) return 'invalid';
  return placements.has(src) ? src : 'other';
}

/** True when the request is not a plain browser navigation. */
export function isBot(req) {
  const method = String(req?.method || 'GET').toUpperCase();
  if (method !== 'GET') return true;
  const purpose = String(header(req, 'sec-purpose') || header(req, 'purpose') || '');
  if (/prefetch|prerender/i.test(purpose)) return true;
  const ua = header(req, 'user-agent');
  if (typeof ua !== 'string' || !ua.startsWith('Mozilla/')) return true;
  return BOT_UA.test(ua);
}

/** Vercel's waitUntil for this request, or null where the platform gives none. */
function platformWaitUntil() {
  try {
    const context = globalThis[REQUEST_CONTEXT]?.get?.();
    return typeof context?.waitUntil === 'function' ? (promise) => context.waitUntil(promise) : null;
  } catch {
    return null;
  }
}

async function sendToPostHog(record, { env, fetchImpl, timeoutMs }) {
  const token = env?.PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token || typeof fetchImpl !== 'function') return false;
  let host;
  try {
    host = new URL(env.PUBLIC_POSTHOG_HOST || DEFAULT_POSTHOG_HOST);
  } catch {
    return false;
  }
  if (host.protocol !== 'https:') return false;

  const controller = new AbortController();
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => {
      controller.abort();
      resolve(false);
    }, timeoutMs);
  });
  const send = (async () => {
    // No request header is passed on. PostHog sees this server's IP, not the visitor's.
    const response = await fetchImpl(`${host.href.replace(/\/+$/, '')}/i/v0/e/`, {
      method: 'POST',
      redirect: 'error',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: token,
        event: record.event,
        distinct_id: DISTINCT_ID,
        properties: {
          src: record.src,
          date: record.date,
          bot: record.bot,
          $process_person_profile: false,
          // Asks PostHog not to use the request IP. PostHog may still store the
          // IP of the request it receives, which is this function's server IP.
          $ip: null,
          $geoip_disable: true,
        },
      }),
      signal: controller.signal,
    });
    const ok = Boolean(response && response.ok);
    try {
      await response?.body?.cancel?.();
    } catch {
      // The answer is not needed.
    }
    return ok;
  })().catch(() => false);
  try {
    return await Promise.race([send, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

function redirect(req, res, target) {
  try {
    res.setHeader('Location', target);
    res.setHeader('Refresh', `0;url=${target}`);
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Cache-Control', 'no-store');
    res.statusCode = 308;
    res.end(String(req?.method || '').toUpperCase() === 'HEAD' ? undefined : BODY);
  } catch {
    try {
      res.statusCode = 308;
      res.setHeader('Location', DESTINATION);
      res.setHeader('Cache-Control', 'no-store');
      res.end();
    } catch {
      // Nothing more can be sent.
    }
  }
}

export function createHandler({
  env = process.env,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  log = (line) => console.log(line),
  timeoutMs = POSTHOG_TIMEOUT_MS,
  getWaitUntil = platformWaitUntil,
} = {}) {
  return async function bookDiscovery(req, res) {
    let target = DESTINATION;
    let pending = null;
    try {
      const src = await placement(rawQuery(req));
      if (!NOT_A_PLACEMENT.has(src)) target = `${DESTINATION}?src=${src}`;
      if (String(req?.method || 'GET').toUpperCase() === 'GET') {
        const record = {
          event: EVENT,
          src,
          date: new Date(now()).toISOString().slice(0, 10),
          bot: isBot(req),
        };
        try {
          log(JSON.stringify(record));
        } catch {
          // A failed log line must not stop the PostHog count.
        }
        pending = sendToPostHog(record, { env, fetchImpl, timeoutMs }).catch(() => false);
      }
    } catch {
      // Counting must never block a booking.
    }

    if (pending) {
      let handedOff = false;
      try {
        const waitUntil = getWaitUntil();
        if (typeof waitUntil === 'function') {
          waitUntil(pending);
          handedOff = true;
        }
      } catch {
        handedOff = false;
      }
      if (!handedOff) await pending;
    }
    redirect(req, res, target);
  };
}

export default createHandler();
