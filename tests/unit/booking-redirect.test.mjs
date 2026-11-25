import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import handler, { DESTINATION, EVENT, createHandler, isBot, placement } from '../../api/book/discovery.mjs';
import { bookingHref } from '../../src/utils/booking.mjs';

// /book/discovery is served by api/book/discovery.mjs: one count, then the same
// 308 to the same Google schedule that the static redirect gave.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const vercel = JSON.parse(fs.readFileSync(path.join(repoRoot, 'vercel.json'), 'utf8'));
const built = path.join(repoRoot, '.vercel/output/static');

// The destination the static redirect in vercel.json used before this route moved.
const CALENDAR = 'https://calendar.app.google/PLDmK4QwpdSqkxmb8';
const BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const DAY = Date.parse('2026-11-25T15:04:05Z');

function request(url, headers = {}, method = 'GET') {
  return { method, url, headers: { 'user-agent': BROWSER, ...headers } };
}

function recorder() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    ended: false,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(body) {
      this.body = body;
      this.ended = true;
    },
  };
}

/** A handler with fake clock, log and fetch. Returns the handler and what it recorded. */
function rig({ env = {}, fetchImpl, timeoutMs } = {}) {
  const lines = [];
  const calls = [];
  const fetcher = fetchImpl || (async (url, init) => {
    calls.push({ url, init });
    return { ok: true, status: 200 };
  });
  const run = createHandler({
    env,
    now: () => DAY,
    log: (line) => lines.push(line),
    fetchImpl: (url, init) => {
      if (fetchImpl) calls.push({ url, init });
      return fetcher(url, init);
    },
    timeoutMs,
  });
  return { run, lines, calls };
}

test('a normal booking click gets the same 308 and Location as the static redirect', async () => {
  assert.equal(DESTINATION, CALENDAR);
  const { run } = rig();
  const res = recorder();
  await run(request('/book/discovery?src=test-link'), res);
  assert.equal(res.statusCode, 308);
  assert.equal(res.headers.location, `${CALENDAR}?src=test-link`);
  assert.equal(res.headers.refresh, `0;url=${CALENDAR}?src=test-link`);
  assert.equal(res.headers['content-type'], 'text/plain');
  assert.equal(res.body, 'Redirecting...\n');
  assert.ok(res.ended);
});

test('the query string goes on as it came; no query and an empty query give the bare link', async () => {
  const cases = [
    ['/book/discovery', CALENDAR],
    ['/book/discovery?', CALENDAR],
    ['/book/discovery/?src=home-hero', `${CALENDAR}?src=home-hero`],
    ['/api/book/discovery?src=header', `${CALENDAR}?src=header`],
    ['/book/discovery?utm_source=site&utm_content=header', `${CALENDAR}?utm_source=site&utm_content=header`],
    ['/book/discovery?a=1&a=2&b', `${CALENDAR}?a=1&a=2&b`],
    ['/book/discovery?src=%E2%9C%93&x=%2F', `${CALENDAR}?src=%E2%9C%93&x=%2F`],
  ];
  for (const [url, location] of cases) {
    const { run } = rig();
    const res = recorder();
    await run(request(url), res);
    assert.equal(res.statusCode, 308, url);
    assert.equal(res.headers.location, location, url);
  }
});

test('the redirect is never stored by a cache, so each click reaches the counter', async () => {
  const { run } = rig();
  const res = recorder();
  await run(request('/book/discovery?src=home-hero'), res);
  assert.equal(res.headers['cache-control'], 'no-store');
});

test('every method gets the redirect, and HEAD gets no body', async () => {
  for (const method of ['GET', 'HEAD', 'POST', 'OPTIONS']) {
    const { run } = rig();
    const res = recorder();
    await run(request('/book/discovery?src=header', {}, method), res);
    assert.equal(res.statusCode, 308, method);
    assert.equal(res.headers.location, `${CALENDAR}?src=header`, method);
    assert.equal(res.body, method === 'HEAD' ? undefined : 'Redirecting...\n', method);
  }
});

test('placement keeps a src that passes the booking rule, and never keeps any other value', () => {
  assert.equal(placement('src=home-hero'), 'home-hero');
  assert.equal(placement('src=fill-rate-blog-top&utm_source=site'), 'fill-rate-blog-top');
  assert.equal(placement(''), 'none');
  assert.equal(placement('src='), 'none');
  assert.equal(placement('utm_content=header'), 'none');
  const bad = [
    'src=Home-Hero',
    'src=jane%40example.com',
    'src=a%20b',
    'src=a+b',
    'src=hero.top',
    'src=hero_top',
    `src=${'x'.repeat(65)}`,
    'src=5551234567',
    'src=call-555-123-4567',
    'src=%E2%9C%93',
    'src=-hero',
  ];
  for (const query of bad) assert.equal(placement(query), 'invalid', query);
});

test('one log line per request, holding only the event, src, date and bot flag', async () => {
  const { run, lines } = rig();
  const req = request('/book/discovery?src=pricing-hero&email=jane%40example.com', {
    cookie: 'ph_phc_x_posthog=secret-cookie',
    'x-forwarded-for': '203.0.113.9',
    'x-real-ip': '203.0.113.9',
    referer: 'https://mybcat.com/pricing/?utm_campaign=jane',
  });
  await run(req, recorder());
  assert.equal(lines.length, 1);
  const record = JSON.parse(lines[0]);
  assert.deepEqual(record, { event: EVENT, src: 'pricing-hero', date: '2026-11-25', bot: false });
  for (const leak of ['203.0.113.9', 'secret-cookie', 'jane', 'Mozilla', 'Chrome', 'pricing/?']) {
    assert.ok(!lines[0].includes(leak), `log line holds ${leak}`);
  }
});

test('an invalid src is counted as invalid, without its value', async () => {
  const { run, lines } = rig();
  await run(request('/book/discovery?src=jane-doe-5551234567'), recorder());
  const record = JSON.parse(lines[0]);
  assert.equal(record.src, 'invalid');
  assert.ok(!lines[0].includes('jane'));
});

test('bots are counted apart by a coarse test; the user agent is not kept', async () => {
  const human = [
    BROWSER,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0',
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
  ];
  const bots = [
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
    'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
    'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
    'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/131.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse',
    'curl/8.9.1',
    'python-requests/2.32.3',
    'Go-http-client/2.0',
    'WhatsApp/2.23.20.0',
    '',
  ];
  for (const ua of human) assert.equal(isBot(request('/', { 'user-agent': ua })), false, ua);
  for (const ua of bots) assert.equal(isBot(request('/', { 'user-agent': ua })), true, ua);
  assert.equal(isBot({ method: 'GET', url: '/', headers: {} }), true, 'no user agent');
  assert.equal(isBot(request('/', {}, 'HEAD')), true, 'HEAD is not a click');
  assert.equal(isBot(request('/', { 'sec-purpose': 'prefetch' })), true, 'prefetch is not a click');
  assert.equal(isBot(request('/', { purpose: 'prefetch' })), true, 'prefetch is not a click');

  const { run, lines } = rig();
  await run(request('/book/discovery?src=header', { 'user-agent': 'curl/8.9.1' }), recorder());
  assert.deepEqual(JSON.parse(lines[0]), { event: EVENT, src: 'header', date: '2026-11-25', bot: true });
  assert.ok(!lines[0].includes('curl'));
});

test('without the PostHog token nothing is sent; the log line and redirect still happen', async () => {
  const { run, lines, calls } = rig({ env: {} });
  const res = recorder();
  await run(request('/book/discovery?src=header'), res);
  assert.equal(calls.length, 0);
  assert.equal(lines.length, 1);
  assert.equal(res.statusCode, 308);
});

test('with the PostHog token: one personless event with the same three values', async () => {
  const { run, calls } = rig({ env: { PUBLIC_POSTHOG_PROJECT_TOKEN: 'phc_test_token', PUBLIC_POSTHOG_HOST: 'https://us.i.posthog.com/' } });
  await run(request('/book/discovery?src=home-hero', { cookie: 'a=b', 'x-forwarded-for': '203.0.113.9' }), recorder());
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://us.i.posthog.com/i/v0/e/');
  assert.equal(calls[0].init.method, 'POST');
  assert.deepEqual(Object.keys(calls[0].init.headers), ['Content-Type']);
  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body, {
    api_key: 'phc_test_token',
    event: EVENT,
    distinct_id: 'mybcat-booking-redirect',
    properties: {
      src: 'home-hero',
      date: '2026-11-25',
      bot: false,
      $process_person_profile: false,
      $geoip_disable: true,
    },
  });
  assert.ok(!calls[0].init.body.includes('203.0.113.9'));
  assert.ok(!calls[0].init.body.includes('Mozilla'));
});

test('the PostHog call finishes before the redirect is sent, so the function is not stopped mid-send', async () => {
  const order = [];
  const fetchImpl = () => new Promise((resolve) => setTimeout(() => {
    order.push('posthog');
    resolve({ ok: true, status: 200 });
  }, 5));
  const { run } = rig({ env: { PUBLIC_POSTHOG_PROJECT_TOKEN: 'phc_test_token' }, fetchImpl, timeoutMs: 500 });
  const res = recorder();
  const end = res.end.bind(res);
  res.end = (body) => {
    order.push('redirect');
    end(body);
  };
  await run(request('/book/discovery?src=header'), res);
  assert.deepEqual(order, ['posthog', 'redirect']);
});

test('the default PostHog host is the one the site uses, and a non-https host sends nothing', async () => {
  const first = rig({ env: { PUBLIC_POSTHOG_PROJECT_TOKEN: 'phc_test_token' } });
  await first.run(request('/book/discovery?src=header'), recorder());
  assert.equal(first.calls[0].url, 'https://us.i.posthog.com/i/v0/e/');
  const second = rig({ env: { PUBLIC_POSTHOG_PROJECT_TOKEN: 'phc_test_token', PUBLIC_POSTHOG_HOST: 'http://us.i.posthog.com' } });
  await second.run(request('/book/discovery?src=header'), recorder());
  assert.equal(second.calls.length, 0);
});

test('fails open: a PostHog error, refusal or hang still redirects', async () => {
  const env = { PUBLIC_POSTHOG_PROJECT_TOKEN: 'phc_test_token' };
  const failures = [
    async () => {
      throw new Error('network down');
    },
    async () => ({ ok: false, status: 503 }),
    () => new Promise(() => {}),
  ];
  for (const fetchImpl of failures) {
    const { run } = rig({ env, fetchImpl, timeoutMs: 20 });
    const res = recorder();
    const started = Date.now();
    await run(request('/book/discovery?src=header'), res);
    assert.ok(Date.now() - started < 1000, 'a hung PostHog call is cut off');
    assert.equal(res.statusCode, 308);
    assert.equal(res.headers.location, `${CALENDAR}?src=header`);
  }
});

test('fails open: a broken log, clock or request still redirects', async () => {
  const broken = createHandler({
    env: {},
    now: () => {
      throw new Error('clock');
    },
    log: () => {
      throw new Error('log');
    },
  });
  const res = recorder();
  await broken(request('/book/discovery?src=header'), res);
  assert.equal(res.statusCode, 308);
  assert.equal(res.headers.location, `${CALENDAR}?src=header`);

  const odd = recorder();
  await broken({ method: 'GET', url: undefined, headers: undefined }, odd);
  assert.equal(odd.statusCode, 308);
  assert.equal(odd.headers.location, CALENDAR);
});

test('fails open: a query the header cannot hold falls back to the bare link', async () => {
  const strict = recorder();
  strict.setHeader = function setHeader(name, value) {
    if (/[^\x20-\x7e]/.test(String(value))) throw new TypeError('Invalid character in header content');
    this.headers[name.toLowerCase()] = value;
  };
  const { run } = rig();
  await run(request('/book/discovery?src=é'), strict);
  assert.equal(strict.statusCode, 308);
  assert.equal(strict.headers.location, CALENDAR);
});

test('the default export is a ready handler', async () => {
  assert.equal(typeof handler, 'function');
});

test('vercel.json: /book/discovery is a rewrite to the function, not a redirect; other booking links unchanged', () => {
  const redirects = vercel.redirects || [];
  const rewrites = vercel.rewrites || [];
  for (const source of ['/book/discovery', '/book/discovery/']) {
    assert.equal(redirects.find((r) => r.source === source), undefined, `${source} redirect is gone`);
    const rewrite = rewrites.find((r) => r.source === source);
    assert.ok(rewrite, `${source} rewrite exists`);
    assert.equal(rewrite.destination, '/api/book/discovery', source);
  }
  assert.ok(fs.existsSync(path.join(repoRoot, 'api/book/discovery.mjs')), 'the rewrite target exists');
  const others = {
    '/book/prep': 'https://calendar.app.google/VqkXspVbhw4BbYyz8',
    '/book/interview': 'https://calendar.app.google/Cpksvx8ywN26GtMY6',
    '/book/1-1': 'https://calendar.app.google/4R8J9WLuNnrXFvnEA',
  };
  for (const [source, destination] of Object.entries(others)) {
    for (const s of [source, `${source}/`]) {
      const r = redirects.find((entry) => entry.source === s);
      assert.ok(r, `${s} redirect stays`);
      assert.equal(r.destination, destination, s);
      assert.equal(r.permanent, true, s);
    }
  }
});

test('every src the site source sets passes the counter rule', () => {
  const srcDir = path.join(repoRoot, 'src');
  const found = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (/\.(astro|ts|mjs|js|md|mdx)$/.test(entry.name)) {
        const text = fs.readFileSync(file, 'utf8');
        for (const m of text.matchAll(/(?:discoveryBookingHref|bookingHref)\(\s*'([^']+)'\s*\)/g)) found.add(m[1]);
        for (const m of text.matchAll(/\/book\/discovery\?src=([a-z0-9-]+)/g)) found.add(m[1]);
      }
    }
  };
  walk(srcDir);
  assert.ok(found.size > 10, `found ${found.size} src values`);
  for (const src of found) {
    assert.equal(placement(new URL(bookingHref(src), 'https://mybcat.com').search.slice(1)), src, src);
  }
});

test('built pages: every booking link on the site is counted under its own src', (t) => {
  if (!fs.existsSync(path.join(built, 'index.html'))) {
    t.skip('no build output; run astro build first');
    return;
  }
  const seen = new Set();
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (entry.name.endsWith('.html')) {
        const html = fs.readFileSync(file, 'utf8');
        for (const m of html.matchAll(/href="(\/book\/discovery[^"]*)"/g)) seen.add(m[1].replace(/&amp;|&#38;/g, '&'));
      }
    }
  };
  walk(built);
  assert.ok(seen.size > 10, `found ${seen.size} booking links`);
  for (const href of seen) {
    const query = href.includes('?') ? href.slice(href.indexOf('?') + 1) : '';
    const src = new URLSearchParams(query).get('src');
    assert.ok(src, `${href} carries a src`);
    assert.equal(placement(query), src, href);
  }
});
