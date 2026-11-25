/**
 * /book/discovery: count one booking click, then send the visitor on.
 *
 * vercel.json rewrites /book/discovery and /book/discovery/ to this function.
 * The answer is the same 308 the static redirect gave: the Google appointment
 * schedule, with the request's query string passed on as it came.
 *
 * Before the redirect it writes one record of three values:
 * - src: the link's page and position (for example home-hero) when it passes
 *   the booking src rule (src/utils/booking.mjs) and the stored-value rule
 *   (src/utils/attribution.mjs); 'none' when the link has no src; 'invalid'
 *   for anything else. An invalid value is never kept.
 * - date: the UTC day, YYYY-MM-DD.
 * - bot: true when the request is not a plain browser navigation, by a coarse
 *   test on the method and user agent. The user agent itself is not kept.
 * No IP address, user agent, cookie, referrer, other query value or identifier.
 *
 * The record goes to the Vercel runtime log (one JSON line; Pro keeps one day)
 * and, when PUBLIC_POSTHOG_PROJECT_TOKEN is set (Production), to PostHog as one
 * personless event, which keeps the daily counts.
 *
 * It fails open: any error in counting still sends the redirect, and a slow
 * PostHog call is cut off after POSTHOG_TIMEOUT_MS.
 */
import { cleanToken } from '../../src/utils/attribution.mjs';
import { bookingHref } from '../../src/utils/booking.mjs';

export const DESTINATION = 'https://calendar.app.google/PLDmK4QwpdSqkxmb8';
export const EVENT = 'booking_redirect';
const BODY = 'Redirecting...\n';
const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';
// A fixed name, not a person: the events are personless.
const DISTINCT_ID = 'mybcat-booking-redirect';
const POSTHOG_TIMEOUT_MS = 800;

// Coarse: crawlers, link previews, monitors, headless browsers and HTTP tools.
const BOT_UA = /bot|crawl|spider|slurp|scrap|fetch|preview|monitor|uptime|pingdom|lighthouse|headless|phantom|python|curl|wget|httpclient|http-client|okhttp|axios|undici|go-http|java\/|libwww|facebookexternalhit|embedly|whatsapp|telegram|discord|slack|skype/i;

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
export function placement(query) {
  let src;
  try {
    src = new URLSearchParams(query).get('src');
  } catch {
    return 'invalid';
  }
  if (src === null || src === '') return 'none';
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
  const set = (location) => {
    res.setHeader('Location', location);
    res.setHeader('Refresh', `0;url=${location}`);
  };
  try {
    set(target);
  } catch {
    set(DESTINATION);
  }
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'no-store');
  res.statusCode = 308;
  res.end(String(req?.method || '').toUpperCase() === 'HEAD' ? undefined : BODY);
}

export function createHandler({
  env = process.env,
  fetchImpl = globalThis.fetch,
  now = () => Date.now(),
  log = (line) => console.log(line),
  timeoutMs = POSTHOG_TIMEOUT_MS,
} = {}) {
  return async function bookDiscovery(req, res) {
    const query = rawQuery(req);
    try {
      const record = {
        event: EVENT,
        src: placement(query),
        date: new Date(now()).toISOString().slice(0, 10),
        bot: isBot(req),
      };
      log(JSON.stringify(record));
      await sendToPostHog(record, { env, fetchImpl, timeoutMs });
    } catch {
      // Counting must never block a booking.
    }
    redirect(req, res, query ? `${DESTINATION}?${query}` : DESTINATION);
  };
}

export default createHandler();
