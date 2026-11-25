import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import handler, { DESTINATION, EVENT, createHandler, isBot, placement } from '../../api/book/discovery.mjs';
import { BOOKING_PLACEMENTS, bookingHref } from '../../src/utils/booking.mjs';

// /book/discovery is served by api/book/discovery.mjs: one count, then the same
// 308 to the same Google schedule that the static redirect gave.
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const vercel = JSON.parse(fs.readFileSync(path.join(repoRoot, 'vercel.json'), 'utf8'));
const built = path.join(repoRoot, '.vercel/output/static');

// The destination the static redirect in vercel.json used before this route moved.
const CALENDAR = 'https://calendar.app.google/PLDmK4QwpdSqkxmb8';
const BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const DAY = Date.parse('2026-11-25T15:04:05Z');
const TOKEN_ENV = { PUBLIC_POSTHOG_PROJECT_TOKEN: 'phc_test_token' };

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
function rig({ env = {}, fetchImpl, timeoutMs, waitUntil = null, log } = {}) {
  const lines = [];
  const calls = [];
  const fetcher = fetchImpl || (async () => ({ ok: true, status: 200 }));
  const run = createHandler({
    env,
    now: () => DAY,
    log: log || ((line) => lines.push(line)),
    fetchImpl: (url, init) => {
      calls.push({ url, init });
      return fetcher(url, init);
    },
    timeoutMs,
    getWaitUntil: () => waitUntil,
  });
  return { run, lines, calls };
}

async function locationFor(url, method = 'GET') {
  const { run } = rig();
  const res = recorder();
  await run(request(url, {}, method), res);
  assert.equal(res.statusCode, 308, url);
  return res.headers.location;
}

test('a normal booking click gets the same 308 and Location as the static redirect', async () => {
  assert.equal(DESTINATION, CALENDAR);
  const { run } = rig();
  const res = recorder();
  await run(request('/book/discovery?src=header'), res);
  assert.equal(res.statusCode, 308);
  assert.equal(res.headers.location, `${CALENDAR}?src=header`);
  assert.equal(res.headers.refresh, `0;url=${CALENDAR}?src=header`);
  assert.equal(res.headers['content-type'], 'text/plain');
  assert.equal(res.body, 'Redirecting...\n');
  assert.ok(res.ended);
});

test('only a listed placement goes on to Google; every other query value is dropped', async () => {
  const cases = [
    ['/book/discovery', CALENDAR],
    ['/book/discovery?', CALENDAR],
    ['/book/discovery/?src=home-hero', `${CALENDAR}?src=home-hero`],
    ['/api/book/discovery?src=header', `${CALENDAR}?src=header`],
    ['/book/discovery?src=header&utm_source=site&email=jane%40example.com', `${CALENDAR}?src=header`],
    ['/book/discovery?utm_source=site&utm_content=header', CALENDAR],
    ['/book/discovery?a=1&a=2&b', CALENDAR],
    ['/book/discovery?src=a+b', CALENDAR],
    ['/book/discovery?src=Home-Hero', CALENDAR],
    // Well formed but not a site placement: not passed on (Google drops it anyway).
    ['/book/discovery?src=test-link', CALENDAR],
    ['/book/discovery?src=jane-doe-glaucoma', CALENDAR],
    // A long query does not lose a listed src.
    [`/book/discovery?src=header&${'x='.repeat(50000)}`, `${CALENDAR}?src=header`],
  ];
  for (const [url, location] of cases) assert.equal(await locationFor(url), location, url);
});

test('no request input can change the redirect host or path', async () => {
  const attacks = [
    '/book/discovery?src=//evil.example',
    '/book/discovery?src=%2F%2Fevil.example',
    '/book/discovery?src=header%0d%0aLocation:%20https://evil.example',
    '/book/discovery?src=%0d%0a',
    '/book/discovery?src=user@evil.example',
    '/book/discovery?src=https://evil.example/',
    '/book/discovery?src=https%3A%2F%2Fevil.example%2F',
    '/book/discovery?next=https://evil.example&url=//evil.example',
    '/book/discovery?@evil.example',
    '/book/discovery?src=header/../../evil',
    '//evil.example/book/discovery?src=evil-example',
  ];
  for (const url of attacks) {
    const location = await locationFor(url);
    const parsed = new URL(location);
    assert.equal(parsed.origin, 'https://calendar.app.google', url);
    assert.equal(parsed.pathname, '/PLDmK4QwpdSqkxmb8', url);
    assert.ok(!/evil\.example|[\r\n@]|\/\//.test(location.slice('https://'.length)), `${url} -> ${location}`);
  }
  // The first src wins; a second one cannot add anything.
  assert.equal(await locationFor('/book/discovery?src=header&src=//evil.example'), `${CALENDAR}?src=header`);
});

test('the redirect is never stored by a cache, so each click reaches the counter', async () => {
  const { run } = rig();
  const res = recorder();
  await run(request('/book/discovery?src=home-hero'), res);
  assert.equal(res.headers['cache-control'], 'no-store');
});

test('HEAD, OPTIONS and POST get the redirect and are not counted; HEAD gets no body', async () => {
  for (const method of ['HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE']) {
    const { run, lines, calls } = rig({ env: TOKEN_ENV });
    const res = recorder();
    await run(request('/book/discovery?src=header', {}, method), res);
    assert.equal(res.statusCode, 308, method);
    assert.equal(res.headers.location, `${CALENDAR}?src=header`, method);
    assert.equal(res.body, method === 'HEAD' ? undefined : 'Redirecting...\n', method);
    assert.equal(lines.length, 0, `${method} is not logged`);
    assert.equal(calls.length, 0, `${method} is not sent to PostHog`);
  }
});

test('placement names only a listed site placement; other, none and invalid otherwise', async () => {
  assert.equal(await placement('src=home-hero'), 'home-hero');
  assert.equal(await placement('src=fill-rate-blog-top&utm_source=site'), 'fill-rate-blog-top');
  assert.equal(await placement(`src=header&${'x'.repeat(5000)}`), 'header', 'a long query keeps its src');
  assert.equal(await placement(`${'x='.repeat(50000)}&src=blog-top`), 'blog-top', 'a long query keeps its src');
  assert.equal(await placement(''), 'none');
  assert.equal(await placement('src='), 'none');
  assert.equal(await placement('utm_content=header'), 'none');
  // Well formed, but not a placement the site uses: the value is never kept.
  for (const query of ['src=jane-doe-glaucoma', 'src=test-link', 'src=5551234567', 'src=call-555-123-4567', 'src=header-x']) {
    assert.equal(await placement(query), 'other', query);
  }
  const bad = [
    'src=Home-Hero',
    'src=jane%40example.com',
    'src=a%20b',
    'src=a+b',
    'src=hero.top',
    'src=hero_top',
    `src=${'x'.repeat(65)}`,
    'src=%E2%9C%93',
    'src=-hero',
    'src=%E0%A4%A',
  ];
  for (const query of bad) assert.equal(await placement(query), 'invalid', query.slice(0, 40));
});

test('the placement list is the one the site uses: bookingHref refuses any src not in it', () => {
  assert.ok(BOOKING_PLACEMENTS.length > 20, 'the list is filled');
  assert.equal(new Set(BOOKING_PLACEMENTS).size, BOOKING_PLACEMENTS.length, 'no duplicates');
  assert.ok(Object.isFrozen(BOOKING_PLACEMENTS), 'the list cannot be changed at run time');
  for (const src of BOOKING_PLACEMENTS) {
    assert.match(src, /^[a-z0-9][a-z0-9-]{0,63}$/, src);
    assert.ok(!['none', 'invalid', 'other'].includes(src), `${src} is a reserved record value`);
    assert.equal(bookingHref(src), `/book/discovery?src=${src}`, src);
  }
  for (const unknown of ['test-link', 'jane-doe-glaucoma', 'header-x']) {
    assert.throws(() => bookingHref(unknown), /BOOKING_PLACEMENTS/, unknown);
  }
});

test('one log line per GET, holding only the event, src, date and bot flag', async () => {
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

test('an unknown or invalid src is counted as other or invalid, without its value', async () => {
  const cases = [
    ['/book/discovery?src=jane-doe-glaucoma', 'other'],
    ['/book/discovery?src=Jane-Doe', 'invalid'],
    ['/book/discovery?src=jane%40example.com', 'invalid'],
  ];
  for (const [url, expected] of cases) {
    const { run, lines, calls } = rig({ env: TOKEN_ENV });
    await run(request(url), recorder());
    assert.equal(JSON.parse(lines[0]).src, expected, url);
    assert.equal(JSON.parse(calls[0].init.body).properties.src, expected, url);
    assert.ok(!/jane|glaucoma/i.test(lines[0] + calls[0].init.body), `${url} value kept`);
  }
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

test('PostHog event: one fixed anonymous id, no person profile, no visitor IP, no GeoIP', async () => {
  const { run, calls } = rig({ env: { ...TOKEN_ENV, PUBLIC_POSTHOG_HOST: 'https://us.i.posthog.com/' } });
  const visitors = [
    { 'x-forwarded-for': '203.0.113.9', 'x-real-ip': '203.0.113.9', 'x-vercel-forwarded-for': '203.0.113.9', cookie: 'ph_phc_a_posthog=%7B%22distinct_id%22%3A%22visitor-a%22%7D', 'x-posthog-distinct-id': 'visitor-a', 'x-posthog-session-id': 'session-a' },
    { 'x-forwarded-for': '198.51.100.7', cookie: 'ph_phc_b_posthog=visitor-b', 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1' },
  ];
  for (const headers of visitors) await run(request('/book/discovery?src=home-hero', headers), recorder());
  assert.equal(calls.length, 2);
  const expected = {
    api_key: 'phc_test_token',
    event: EVENT,
    distinct_id: 'mybcat-booking-redirect',
    properties: {
      src: 'home-hero',
      date: '2026-11-25',
      bot: false,
      $process_person_profile: false,
      $ip: null,
      $geoip_disable: true,
    },
  };
  for (const call of calls) {
    assert.equal(call.url, 'https://us.i.posthog.com/i/v0/e/');
    assert.equal(call.init.method, 'POST');
    assert.deepEqual(call.init.headers, { 'Content-Type': 'application/json' }, 'no request header is passed on');
    assert.deepEqual(JSON.parse(call.init.body), expected);
    for (const leak of ['203.0.113.9', '198.51.100.7', 'visitor-a', 'visitor-b', 'session-a', 'Mozilla', 'iPhone']) {
      assert.ok(!call.init.body.includes(leak), `PostHog body holds ${leak}`);
    }
  }
  assert.equal(calls[0].init.body, calls[1].init.body, 'two visitors send the same event');
});

test('with waitUntil: the redirect goes first and PostHog finishes after it', async () => {
  const order = [];
  let release;
  const cancel = { called: 0 };
  const fetchImpl = () => new Promise((resolve) => {
    release = () => {
      order.push('posthog');
      resolve({ ok: true, status: 200, body: { cancel: async () => { cancel.called += 1; } } });
    };
  });
  const kept = [];
  const { run, calls } = rig({ env: TOKEN_ENV, fetchImpl, timeoutMs: 500, waitUntil: (promise) => kept.push(promise) });
  const res = recorder();
  const end = res.end.bind(res);
  res.end = (body) => {
    order.push('redirect');
    end(body);
  };
  await run(request('/book/discovery?src=header'), res);
  assert.deepEqual(order, ['redirect'], 'the visitor did not wait for PostHog');
  assert.equal(res.headers.location, `${CALENDAR}?src=header`);
  assert.equal(kept.length, 1, 'the PostHog call was handed to waitUntil');
  assert.equal(calls.length, 1);
  release();
  assert.equal(await kept[0], true);
  assert.deepEqual(order, ['redirect', 'posthog']);
  assert.equal(cancel.called, 1, 'the PostHog response body is released');
});

test('with waitUntil: a hung PostHog call still ends at the cap', async () => {
  const kept = [];
  const { run } = rig({ env: TOKEN_ENV, fetchImpl: () => new Promise(() => {}), timeoutMs: 20, waitUntil: (promise) => kept.push(promise) });
  const res = recorder();
  await run(request('/book/discovery?src=header'), res);
  assert.equal(res.statusCode, 308);
  const started = Date.now();
  assert.equal(await kept[0], false);
  assert.ok(Date.now() - started < 1000);
});

test('waitUntil comes from the Vercel request context when the platform provides one', async () => {
  const key = Symbol.for('@vercel/request-context');
  const before = globalThis[key];
  const kept = [];
  globalThis[key] = { get: () => ({ waitUntil: (promise) => kept.push(promise) }) };
  try {
    const run = createHandler({ env: TOKEN_ENV, now: () => DAY, log: () => {}, fetchImpl: async () => ({ ok: true, status: 200 }) });
    const res = recorder();
    await run(request('/book/discovery?src=header'), res);
    assert.equal(res.statusCode, 308);
    assert.equal(kept.length, 1);
    assert.equal(await kept[0], true);
  } finally {
    if (before === undefined) delete globalThis[key];
    else globalThis[key] = before;
  }
  // No context, or a context that throws: the call is awaited instead.
  for (const context of [undefined, { get: () => { throw new Error('context'); } }, { get: () => ({}) }]) {
    if (context === undefined) delete globalThis[key];
    else globalThis[key] = context;
    try {
      const order = [];
      const run = createHandler({
        env: TOKEN_ENV,
        now: () => DAY,
        log: () => {},
        fetchImpl: () => new Promise((resolve) => setTimeout(() => {
          order.push('posthog');
          resolve({ ok: true, status: 200 });
        }, 5)),
      });
      const res = recorder();
      const end = res.end.bind(res);
      res.end = (body) => {
        order.push('redirect');
        end(body);
      };
      await run(request('/book/discovery?src=header'), res);
      assert.deepEqual(order, ['posthog', 'redirect']);
    } finally {
      if (before === undefined) delete globalThis[key];
      else globalThis[key] = before;
    }
  }
});

test('a waitUntil that throws falls back to waiting, then redirects', async () => {
  const order = [];
  const fetchImpl = () => new Promise((resolve) => setTimeout(() => {
    order.push('posthog');
    resolve({ ok: true, status: 200 });
  }, 5));
  const { run } = rig({ env: TOKEN_ENV, fetchImpl, waitUntil: () => { throw new Error('no'); } });
  const res = recorder();
  const end = res.end.bind(res);
  res.end = (body) => {
    order.push('redirect');
    end(body);
  };
  await run(request('/book/discovery?src=header'), res);
  assert.deepEqual(order, ['posthog', 'redirect']);
});

test('a failing log line does not stop the PostHog count', async () => {
  const { run, calls } = rig({ env: TOKEN_ENV, log: () => { throw new Error('log'); } });
  const res = recorder();
  await run(request('/book/discovery?src=header'), res);
  assert.equal(calls.length, 1);
  assert.equal(JSON.parse(calls[0].init.body).properties.src, 'header');
  assert.equal(res.statusCode, 308);
});

test('without waitUntil: the PostHog call finishes before the redirect is sent, and its body is released', async () => {
  const cancel = { called: 0 };
  const { run } = rig({ env: TOKEN_ENV, fetchImpl: async () => ({ ok: true, status: 200, body: { cancel: async () => { cancel.called += 1; } } }) });
  await run(request('/book/discovery?src=header'), recorder());
  assert.equal(cancel.called, 1);
});

test('the PostHog call finishes before the redirect is sent, so the function is not stopped mid-send', async () => {
  const order = [];
  const fetchImpl = () => new Promise((resolve) => setTimeout(() => {
    order.push('posthog');
    resolve({ ok: true, status: 200 });
  }, 5));
  const { run } = rig({ env: TOKEN_ENV, fetchImpl, timeoutMs: 500 });
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
  const first = rig({ env: TOKEN_ENV });
  await first.run(request('/book/discovery?src=header'), recorder());
  assert.equal(first.calls[0].url, 'https://us.i.posthog.com/i/v0/e/');
  const second = rig({ env: { ...TOKEN_ENV, PUBLIC_POSTHOG_HOST: 'http://us.i.posthog.com' } });
  await second.run(request('/book/discovery?src=header'), recorder());
  assert.equal(second.calls.length, 0);
});

test('fails open: a PostHog error, 500, refusal or hang still redirects', async () => {
  const failures = [
    async () => {
      throw new Error('network down');
    },
    async () => ({ ok: false, status: 500 }),
    async () => ({ ok: false, status: 503 }),
    () => new Promise(() => {}),
  ];
  for (const fetchImpl of failures) {
    const { run } = rig({ env: TOKEN_ENV, fetchImpl, timeoutMs: 20 });
    const res = recorder();
    const started = Date.now();
    await run(request('/book/discovery?src=header'), res);
    assert.ok(Date.now() - started < 1000, 'a hung PostHog call is cut off');
    assert.equal(res.statusCode, 308);
    assert.equal(res.headers.location, `${CALENDAR}?src=header`);
  }
});

test('fails open: a broken log, clock, fetch or request still redirects', async () => {
  const broken = createHandler({
    env: TOKEN_ENV,
    now: () => {
      throw new Error('clock');
    },
    log: () => {
      throw new Error('log');
    },
    fetchImpl: () => {
      throw new Error('fetch');
    },
  });
  const res = recorder();
  await broken(request('/book/discovery?src=header'), res);
  assert.equal(res.statusCode, 308);
  assert.equal(res.headers.location, `${CALENDAR}?src=header`);

  for (const req of [
    { method: 'GET', url: undefined, headers: undefined },
    { method: undefined, url: 42, headers: null },
    null,
    { method: 'GET', url: '/book/discovery?src=%E0%A4%A&x=%', headers: { 'user-agent': ['a', 'b'] } },
  ]) {
    const odd = recorder();
    await broken(req, odd);
    assert.equal(odd.statusCode, 308);
    assert.equal(odd.headers.location, CALENDAR);
  }
  const long = recorder();
  await broken({ method: 'GET', url: `/book/discovery?src=header&${'x='.repeat(50000)}`, headers: {} }, long);
  assert.equal(long.statusCode, 308);
  assert.equal(long.headers.location, `${CALENDAR}?src=header`);
});

test('fails open: a response object that refuses headers still gets a 308 with the bare link', async () => {
  const { run } = rig();
  const strict = recorder();
  let refused = 0;
  strict.setHeader = function setHeader(name, value) {
    if (name === 'Refresh' && refused === 0) {
      refused += 1;
      throw new TypeError('Invalid character in header content');
    }
    this.headers[name.toLowerCase()] = value;
  };
  await run(request('/book/discovery?src=header'), strict);
  assert.equal(strict.statusCode, 308);
  assert.equal(strict.headers.location, CALENDAR);
  assert.ok(strict.ended);
});

test('no top-level import or module-scope work that could fail at cold start', () => {
  const source = fs.readFileSync(path.join(repoRoot, 'api/book/discovery.mjs'), 'utf8');
  assert.doesNotMatch(source, /^\s*import\s/m, 'shared rules are loaded inside the handler');
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

test('the link check accepts a rewrite source and still reports a missing page', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mybcat-links-'));
  const script = path.join(repoRoot, 'scripts/validators/validate-links.js');
  const page = (hrefs) => `<html><body>${hrefs.map((h) => `<a href="${h}">x</a>`).join('')}</body></html>`;
  const run = () => {
    const out = spawnSync(process.execPath, [script], { cwd: dir, encoding: 'utf8' });
    // eslint-disable-next-line no-control-regex -- strips the script's color codes
    return { status: out.status, text: `${out.stdout}${out.stderr}`.replace(/\x1b\[[0-9;]*m/g, '') };
  };
  try {
    fs.writeFileSync(path.join(dir, 'vercel.json'), JSON.stringify({
      redirects: [{ source: '/old-page', destination: '/', permanent: true }],
      rewrites: [{ source: '/book/discovery', destination: '/api/book/discovery' }],
    }));
    fs.mkdirSync(path.join(dir, 'dist'));
    fs.writeFileSync(path.join(dir, 'dist', 'index.html'), page(['/book/discovery?src=header', '/old-page']));
    const good = run();
    assert.equal(good.status, 0, good.text);
    assert.match(good.text, /All internal links valid|Broken links: 0/);

    fs.writeFileSync(path.join(dir, 'dist', 'index.html'), page(['/book/discovery?src=header', '/definitely-missing-page/']));
    const bad = run();
    assert.equal(bad.status, 1, bad.text);
    assert.match(bad.text, /✗ \/definitely-missing-page\//);
    assert.doesNotMatch(bad.text, /✗ \/book\/discovery/);
    assert.match(bad.text, /Broken links: 1\b/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('every src the site source sets passes the counter rule', async () => {
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
  // The solution pages build their src from each solution's slug.
  const solutions = fs.readFileSync(path.join(srcDir, 'data/solutions.ts'), 'utf8');
  const slugs = [...solutions.matchAll(/\bslug:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);
  assert.ok(slugs.length > 5, `found ${slugs.length} solution slugs`);
  assert.match(fs.readFileSync(path.join(srcDir, 'pages/solutions/[slug].astro'), 'utf8'), /discoveryBookingHref\(`\$\{solution\.slug\}-hero`\)/);
  for (const slug of slugs) {
    found.add(`${slug}-hero`);
    found.add(`${slug}-cta`);
  }
  assert.ok(found.size > 20, `found ${found.size} src values`);
  for (const src of found) {
    assert.ok(BOOKING_PLACEMENTS.includes(src), `${src} is used by the site but missing from BOOKING_PLACEMENTS`);
    assert.equal(await placement(new URL(bookingHref(src), 'https://mybcat.com').search.slice(1)), src, src);
  }
});

test('built pages: every booking link on the site is counted under its own src', async (t) => {
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
    assert.ok(BOOKING_PLACEMENTS.includes(src), `${href}: src ${src} is missing from BOOKING_PLACEMENTS`);
    assert.equal(await placement(query), src, href);
    assert.equal(await locationFor(href), `${CALENDAR}?src=${src}`, href);
  }
});
