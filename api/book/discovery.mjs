/**
 * /book/discovery: count one booking click, then send the visitor on.
 *
 * vercel.json rewrites /book/discovery and /book/discovery/ to this function.
 * The answer is the same 308 the static redirect gave, to the same Google
 * appointment schedule. The host and path are fixed. Only a valid src goes on
 * (?src=home-hero), so a normal booking link gets a byte-identical Location;
 * every other query value is dropped. Google's short link drops the query
 * anyway, so nothing is lost.
 *
 * For a GET it first writes one record of three values:
 * - src: the link's page and position when it passes the booking src rule
 *   (src/utils/booking.mjs) and the stored-value rule (src/utils/attribution.mjs);
 *   'none' when the link has no src; 'invalid' for anything else. An invalid
 *   value is never kept.
 * - date: the UTC day, YYYY-MM-DD.
 * - bot: true when the GET is not a plain browser navigation, by a coarse test
 *   on the user agent. The user agent itself is not kept.
 * No IP address, user agent, cookie, referrer, other query value or identifier.
 * HEAD, OPTIONS, POST and other methods get the redirect and are not counted.
 *
 * The record goes to the Vercel runtime log (one JSON line; Pro keeps one day)
 * and, when PUBLIC_POSTHOG_PROJECT_TOKEN is set (Production), to PostHog as one
 * personless event under one fixed id, which keeps the daily counts.
 *
 * It fails open: there is no top-level import, the shared rules load inside the
 * handler, any error in counting still sends the redirect, and a slow PostHog
 * call is cut off after POSTHOG_TIMEOUT_MS.
 */
export const DESTINATION = 'https://calendar.app.google/PLDmK4QwpdSqkxmb8';
export const EVENT = 'booking_redirect';
const BODY = 'Redirecting...\n';
const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';
// One fixed name for every event, not a person: the events are personless.
const DISTINCT_ID = 'mybcat-booking-redirect';
const POSTHOG_TIMEOUT_MS = 800;
// A real booking link's query is short. A longer one is not parsed.
const MAX_QUERY = 2048;

// Coarse: crawlers, link previews, monitors, headless browsers and HTTP tools.
const BOT_UA = /bot|crawl|spider|slurp|scrap|fetch|preview|monitor|uptime|pingdom|lighthouse|headless|phantom|python|curl|wget|httpclient|http-client|okhttp|axios|undici|go-http|java\/|libwww|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|skype/i;

let rules = null;

/** The shared allow rules, loaded once inside the handler so a load error cannot stop the redirect. */
async function loadRules() {
  if (!rules) {
    const [booking, attribution] = await Promise.all([
      import('../../src/utils/booking.mjs'),
      import('../../src/utils/attribution.mjs'),
    ]);
    rules = { bookingHref: booking.bookingHref, cleanToken: attribution.cleanToken };
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

/** The link's placement: its src if it passes both allow rules, else 'none' or 'invalid'. */
export async function placement(query) {
  if (typeof query !== 'string' || query.length > MAX_QUERY) return 'invalid';
  let src;
  try {
    src = new URLSearchParams(query).get('src');
  } catch {
    return 'invalid';
  }
  if (src === null || src === '') return 'none';
  const { bookingHref, cleanToken } = await loadRules();
  try {
    bookingHref(src);
  } catch {
    return 'invalid';
  }
  return cleanToken(src) === src ? src : 'invalid';
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
    // No request header is passed on: PostHog sees this server, not the visitor.
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
          $ip: null,
          $geoip_disable: true,
        },
      }),
      signal: controller.signal,
    });
    return Boolean(response && response.ok);
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
} = {}) {
  return async function bookDiscovery(req, res) {
    let target = DESTINATION;
    try {
      const src = await placement(rawQuery(req));
      if (src !== 'none' && src !== 'invalid') target = `${DESTINATION}?src=${src}`;
      if (String(req?.method || 'GET').toUpperCase() === 'GET') {
        const record = {
          event: EVENT,
          src,
          date: new Date(now()).toISOString().slice(0, 10),
          bot: isBot(req),
        };
        log(JSON.stringify(record));
        await sendToPostHog(record, { env, fetchImpl, timeoutMs });
      }
    } catch {
      // Counting must never block a booking.
    }
    redirect(req, res, target);
  };
}

export default createHandler();
