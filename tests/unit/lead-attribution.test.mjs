import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BOOKING_EVENT,
  CHANNELS,
  FIRST_TOUCH_KEY,
  LAST_TOUCH_KEY,
  bookingPlacement,
  cleanHost,
  cleanPath,
  cleanToken,
  deriveChannel,
  firstTouchUtm,
  flattenAttribution,
  initAttribution,
  isBookingUrl,
  mergeAttribution,
  normalizeTouch,
  readAttribution,
} from '../../src/utils/attribution.mjs';

const NOW = new Date('2026-11-23T15:00:00Z');
const SITE = 'https://mybcat.com/blog/some-post/';

function touch(href, referrer = '', extra = {}) {
  return readAttribution({ href, referrer, now: NOW, ...extra });
}

// A value as the page sees it: URLSearchParams has already decoded it once.
function viaQuery(raw) {
  return new URL(`https://mybcat.com/?utm_campaign=${raw}`).searchParams.get('utm_campaign');
}

test('search engines are organic_search', () => {
  const hosts = [
    'https://www.google.com/',
    'https://www.google.co.uk/search?q=x',
    'https://google.de/',
    'https://www.bing.com/',
    'https://duckduckgo.com/',
    'https://search.yahoo.com/search?p=x',
    'https://uk.search.yahoo.com/',
    'https://www.ecosia.org/',
    'https://yandex.ru/',
    'android-app://com.google.android.googlequicksearchbox/',
  ];
  for (const referrer of hosts) {
    assert.equal(touch(SITE, referrer).channel, 'organic_search', referrer);
  }
  assert.equal(touch(`${SITE}?utm_source=google&utm_medium=organic`).channel, 'organic_search');
});

test('google services that are not search do not count as search', () => {
  assert.equal(touch(SITE, 'https://mail.google.com/mail/u/0/').channel, 'email');
  assert.equal(touch(SITE, 'https://podcasts.google.com/feed/x').channel, 'podcast');
  assert.equal(touch(SITE, 'https://docs.google.com/document/d/x').channel, 'referral');
  assert.equal(touch(SITE, 'https://news.google.com/').channel, 'referral');
});

test('the main social hosts are social', () => {
  const hosts = [
    'https://www.linkedin.com/feed/',
    'https://lnkd.in/abc',
    'https://l.facebook.com/l.php?u=x',
    'https://m.facebook.com/',
    'https://l.instagram.com/?u=x',
    'https://t.co/abc',
    'https://x.com/someone/status/1',
    'https://twitter.com/',
    'https://www.reddit.com/r/optometry/',
    'https://www.youtube.com/watch?v=x',
    'https://www.tiktok.com/',
    'android-app://com.linkedin.android/',
  ];
  for (const referrer of hosts) {
    assert.equal(touch(SITE, referrer).channel, 'social', referrer);
  }
  assert.equal(touch(`${SITE}?utm_source=linkedin&utm_medium=social`).channel, 'social');
  assert.equal(touch(`${SITE}?utm_source=linkedin&utm_medium=organic`).channel, 'social');
  assert.equal(touch(`${SITE}?utm_source=Facebook&utm_medium=Social`).channel, 'social');
  assert.equal(touch(`${SITE}?utm_source=facebook`).channel, 'social');
  assert.equal(touch(`${SITE}?fbclid=abc`, 'https://l.facebook.com/').channel, 'social');
});

test('podcast: utm_medium=podcast, a podcast source name, or a podcast host', () => {
  assert.equal(touch(`${SITE}?utm_source=some-show&utm_medium=podcast`).channel, 'podcast');
  assert.equal(touch(`${SITE}?utm_source=the-optometry-podcast`).channel, 'podcast');
  assert.equal(touch(`${SITE}?utm_source=x-podcast`).channel, 'podcast');
  assert.equal(touch(SITE, 'https://podcasts.apple.com/us/podcast/x/id1').channel, 'podcast');
  assert.equal(touch(SITE, 'https://open.spotify.com/episode/abc').channel, 'podcast');
  assert.equal(touch(SITE, 'https://overcast.fm/+abc').channel, 'podcast');
});

test('email: medium, newsletter or HubSpot source, or a mail host', () => {
  assert.equal(touch(`${SITE}?utm_source=hubspot&utm_medium=email`).channel, 'email');
  assert.equal(touch(`${SITE}?utm_source=hs_email&utm_medium=email`).channel, 'email');
  assert.equal(touch(`${SITE}?utm_source=hs_email`).channel, 'email');
  assert.equal(touch(`${SITE}?utm_source=weekly-newsletter`).channel, 'email');
  assert.equal(touch(SITE, 'https://outlook.live.com/mail/0/').channel, 'email');
  assert.equal(touch(SITE, 'https://us-mg5.mail.yahoo.com/').channel, 'email');
  assert.equal(touch(SITE, 'android-app://com.google.android.gm/').channel, 'email');
});

test('paid: click ids, and any medium that starts with cpc, ppc or paid', () => {
  assert.equal(touch(`${SITE}?gclid=abc123`).channel, 'paid');
  assert.equal(touch(`${SITE}?gbraid=abc&utm_source=google&utm_medium=organic`).channel, 'paid');
  assert.equal(touch(`${SITE}?msclkid=abc`).channel, 'paid');
  assert.equal(touch(`${SITE}?li_fat_id=abc`, 'https://www.linkedin.com/').channel, 'paid');
  assert.equal(touch(`${SITE}?ttclid=abc`).channel, 'paid');
  assert.equal(touch(`${SITE}?fbclid=abc&utm_source=facebook&utm_medium=paid-social`, 'https://l.facebook.com/').channel, 'paid');
  assert.equal(touch(`${SITE}?utm_source=google&utm_medium=cpc`).channel, 'paid');
  assert.equal(touch(`${SITE}?utm_source=linkedin&utm_medium=cpc-linkedin`).channel, 'paid');
  assert.equal(touch(`${SITE}?utm_source=linkedin&utm_medium=paid_social`).channel, 'paid');
  assert.equal(touch(`${SITE}?utm_source=linkedin&utm_medium=paidsocial`).channel, 'paid');
  assert.equal(touch(`${SITE}?utm_source=linkedin&utm_medium=Paid+Social`).channel, 'paid');
  assert.equal(touch(`${SITE}?utm_source=google&utm_medium=ppc`, 'https://www.google.com/').channel, 'paid');
});

test('AI assistants are their own channel', () => {
  const hosts = [
    'https://chatgpt.com/',
    'https://chat.openai.com/',
    'https://www.perplexity.ai/search/x',
    'https://claude.ai/chat/x',
    'https://gemini.google.com/app',
    'https://copilot.microsoft.com/',
  ];
  for (const referrer of hosts) {
    assert.equal(touch('https://mybcat.com/', referrer).channel, 'ai_assistant', referrer);
  }
  // ChatGPT tags the links it shows with utm_source=chatgpt.com.
  assert.equal(touch(`${SITE}?utm_source=chatgpt.com`).channel, 'ai_assistant');
});

test('direct, and referral for other sites', () => {
  assert.equal(touch(SITE).channel, 'direct');
  assert.equal(touch(`${SITE}?utm_campaign=q4`).channel, 'direct');
  assert.equal(touch(SITE, 'https://some-partner.example/resources').channel, 'referral');
  assert.equal(touch(`${SITE}?utm_source=partner-x`).channel, 'referral');
});

test('every derived channel is an allowed value', () => {
  const samples = [{}, { source: 'x', medium: 'y' }, { referrerHost: 'example.org' }, { clickId: true }, { medium: 'podcast' }, { source: 'chatgpt.com' }];
  for (const sample of samples) assert.ok(CHANNELS.includes(deriveChannel(sample)));
  assert.deepEqual([...CHANNELS].sort(), ['ai_assistant', 'direct', 'email', 'organic_search', 'paid', 'podcast', 'referral', 'social']);
});

test('own links, own referrers and Google calendar or accounts referrers are not a way in', () => {
  assert.equal(touch(SITE, 'https://mybcat.com/pricing/').channel, 'direct');
  assert.equal(touch(SITE, 'https://www.mybcat.com/pricing/').referrer_host, '');
  assert.equal(touch(SITE, 'https://hubspot.mybcat.com/x').referrer_host, '');
  assert.equal(touch(SITE, 'https://preview-123.vercel.app/x', { ownHosts: ['preview-123.vercel.app'] }).referrer_host, '');
  for (const referrer of ['https://calendar.google.com/', 'https://accounts.google.com/signin', 'https://accounts.google.co.uk/', 'https://myaccount.google.com/']) {
    const result = touch('https://mybcat.com/', referrer);
    assert.equal(result.channel, 'direct', referrer);
    assert.equal(result.referrer_host, '', referrer);
  }
  // The site tags its own booking links with utm_source=site.
  const internal = touch('https://mybcat.com/book/discovery/?utm_source=site&utm_content=header');
  assert.equal(internal.utm_source, '');
  assert.equal(internal.channel, 'direct');
  assert.equal(touch('https://mybcat.com/book/discovery/?utm_source=Site&gclid=1').channel, 'direct');
  assert.equal(touch('https://mybcat.com/book/discovery/?utm_source=site&utm_content=header', 'https://www.google.com/').channel, 'organic_search');
});

test('a touch stores utm_source, utm_medium and utm_campaign only, plus referrer host, landing path, channel and date', () => {
  const result = touch(
    'https://mybcat.com/blog/post/?utm_source=Some-Show&utm_medium=Podcast&utm_campaign=Q4-Launch&utm_content=ep12&utm_term=optometry',
    'https://podcasts.apple.com/us/podcast/x/id1?i=2'
  );
  assert.deepEqual(result, {
    utm_source: 'some-show',
    utm_medium: 'podcast',
    utm_campaign: 'q4-launch',
    referrer_host: 'podcasts.apple.com',
    landing_path: '/blog/post/',
    channel: 'podcast',
    date: '2026-11-23',
  });
  assert.ok(!('utm_content' in result));
  assert.ok(!('utm_term' in result));
});

// Hostile values. Each one must be dropped (empty), never kept and never rewritten.
const HOSTILE = {
  'encoded @': 'jane%40example.com',
  'double-encoded @': 'jane%2540example.com',
  'triple-encoded @': 'jane%252540example.com',
  'full-width @ (U+FF20)': 'jane%EF%BC%A0example.com',
  'the word at': 'jane+at+example+dot+com',
  'plus address': 'jane%2Bpromo%40example.com',
  'phone (555) 123-4567': '(555)%20123-4567',
  'phone (555)123-4567': '(555)123-4567',
  'phone 555_123_4567': '555_123_4567',
  'phone 555/123/4567': '555%2F123%2F4567',
  'phone 555 1234 567': '555%201234%20567',
  'phone +44 20 7946 0958': '%2B44%2020%207946%200958',
  'nine digits': '555-123-456',
  'seven digits spread out': 'q4-1-2-3-4-5-6-7',
  'name with plus signs': 'Jane+Doe+Smith',
  'name with accents': 'Jos%C3%A9+Garc%C3%ADa',
  'script tag': '%3Cscript%3Ealert(1)%3C%2Fscript%3E',
  'leading dash': '-abc',
  'space': 'a%20b',
  'too long (65 chars)': 'a'.repeat(65),
  'malformed percent': '%E0%A4%A',
};

test('hostile values are dropped, not rewritten', () => {
  for (const [label, raw] of Object.entries(HOSTILE)) {
    assert.equal(cleanToken(viaQuery(raw)), '', label);
    assert.equal(touch(`https://mybcat.com/?utm_source=${raw}&utm_medium=${raw}&utm_campaign=${raw}`).utm_campaign, '', label);
  }
  assert.equal(cleanToken('a'.repeat(2_000_000)), '');
  assert.equal(cleanToken('1-'.repeat(1_000_000)), '');
  assert.equal(cleanToken(undefined), '');
  assert.equal(cleanToken({ toString() { throw new Error('x'); } }), '');
});

test('values that pass the allow rule are kept, lower case', () => {
  assert.equal(cleanToken('Q4-Launch'), 'q4-launch');
  assert.equal(cleanToken('2026-q4_launch.v2'), '2026-q4_launch.v2');
  assert.equal(cleanToken('2026-11-q4_launch.v2'), '');
  assert.equal(cleanToken('a'.repeat(64)), 'a'.repeat(64));
  assert.equal(cleanToken('abc-123456'), 'abc-123456');
  assert.equal(cleanToken('abc-1234567'), '');
  assert.equal(cleanToken('hs_email'), 'hs_email');
});

test('referrer: host only, with the same allow rule', () => {
  const host = (referrer) => touch('https://mybcat.com/', referrer).referrer_host;
  assert.equal(host('https://www.linkedin.com/in/jane-doe-123?trk=x&email=jane@example.com'), 'linkedin.com');
  assert.equal(host('https://user:pass@evil.example/path'), 'evil.example');
  assert.equal(host('https://jane%40example.com.evil.example/'), '');
  assert.equal(host('http://192.168.100.200/'), '');
  assert.equal(host('https://' + 'a'.repeat(70) + '.example/'), '');
  assert.equal(cleanHost('https://www.Example.com:8080/path?q=1'), 'example.com');
  assert.equal(cleanHost('not a host'), '');
  // A host that is dropped still counts as a referral.
  assert.equal(touch('https://mybcat.com/', 'http://192.168.100.200/').channel, 'referral');
});

test('landing path: decoded first, two segments at most, each one passing the allow rule', () => {
  const path = (href) => touch(href).landing_path;
  assert.equal(path('https://mybcat.com/'), '/');
  assert.equal(path('https://mybcat.com/pricing/'), '/pricing/');
  assert.equal(path('https://mybcat.com/blog/some-post/'), '/blog/some-post/');
  assert.equal(path('https://mybcat.com/blog/some-post/extra/more/'), '/blog/some-post/');
  assert.equal(path('https://mybcat.com/blog/' + 'a'.repeat(70) + '/'), '/blog/');
  assert.equal(path('https://mybcat.com/jane.doe%40example.com/'), '/');
  assert.equal(path('https://mybcat.com/jane%2540example.com/'), '/');
  assert.equal(path('https://mybcat.com/5551234567/'), '/');
  assert.equal(path('https://mybcat.com/blog/%3Cscript%3E/'), '/blog/');
  assert.equal(path('https://mybcat.com/@jane/'), '/');
  assert.equal(path('https://mybcat.com/blog/jane%40example.com/'), '/blog/');
  assert.equal(path('https://mybcat.com/x/?email=jane%40example.com#frag'), '/x/');
  assert.equal(cleanPath('/' + 'a/'.repeat(5000)), '/');
  assert.equal(cleanPath('no-slash'), '');
  assert.equal(cleanPath(null), '');
});

test('no personal data survives anywhere in a touch', () => {
  const result = touch(
    'https://mybcat.com/contact/jane%40example.com/?email=jane%40example.com&firstName=Jane&utm_source=linkedin&utm_medium=social&utm_content=jane%40example.com&utm_term=5551234567&utm_campaign=(555)%20123-4567',
    'https://www.linkedin.com/in/jane-doe-123?trk=x'
  );
  assert.equal(result.utm_campaign, '');
  assert.equal(result.referrer_host, 'linkedin.com');
  assert.equal(result.landing_path, '/contact/');
  const text = JSON.stringify(result);
  assert.ok(!text.includes('@'));
  assert.ok(!/jane/i.test(text));
  assert.ok(!text.includes('email='));
});

test('a bad URL still gives a valid direct touch', () => {
  const result = readAttribution({ href: 'not a url', referrer: '', now: NOW });
  assert.equal(result.channel, 'direct');
  assert.equal(result.landing_path, '');
  assert.ok(normalizeTouch(result));
});

test('stored data is re-checked: hostile or corrupt stored touches are not trusted', () => {
  const hostile = [
    ['direct'],
    'direct',
    null,
    Object.create(null),
    { channel: 'not-a-channel', date: '2026-01-01' },
    { channel: 'direct', date: 'yesterday' },
  ];
  for (const value of hostile) assert.equal(normalizeTouch(value), null);
  // A value that is not a string is dropped without being called.
  const odd = normalizeTouch({ channel: 'direct', date: '2026-01-01', utm_source: { toString() { throw new Error('x'); } } });
  assert.equal(odd.utm_source, '');
  const cleaned = normalizeTouch({
    channel: 'direct',
    date: '2026-01-01',
    utm_source: 'jane@example.com',
    utm_medium: '(555) 123-4567',
    utm_campaign: 'ok-campaign',
    utm_content: 'leftover',
    utm_term: 'leftover',
    landing_path: '/a%40b/',
    referrer_host: ['x'],
  });
  assert.deepEqual(cleaned, {
    utm_source: '',
    utm_medium: '',
    utm_campaign: 'ok-campaign',
    referrer_host: '',
    landing_path: '/',
    channel: 'direct',
    date: '2026-01-01',
  });
});

test('merge: the first visit sets first touch and last touch', () => {
  const current = touch(`${SITE}?utm_source=linkedin&utm_medium=social`);
  const merged = mergeAttribution({}, current);
  assert.deepEqual(merged.first_touch, current);
  assert.deepEqual(merged.last_touch, current);
});

test('merge: first touch is never overwritten', () => {
  const first = touch(SITE, 'https://www.google.com/');
  const paid = touch(`${SITE}?gclid=abc`);
  const social = touch(SITE, 'https://www.linkedin.com/');
  const frozen = Object.freeze({ first_touch: Object.freeze({ ...first }), last_touch: Object.freeze({ ...first }) });

  const afterPaid = mergeAttribution(frozen, paid);
  assert.deepEqual(afterPaid.first_touch, first);
  assert.equal(afterPaid.last_touch.channel, 'paid');

  const afterSocial = mergeAttribution({ first_touch: afterPaid.first_touch, last_touch: afterPaid.last_touch }, social);
  assert.deepEqual(afterSocial.first_touch, first);
  assert.equal(afterSocial.first_touch.channel, 'organic_search');
  assert.equal(afterSocial.last_touch.channel, 'social');
});

test('merge: a direct page view keeps the session last touch, a new way in replaces it', () => {
  const organic = touch(SITE, 'https://www.google.com/');
  const direct = touch('https://mybcat.com/pricing/');
  const internal = touch('https://mybcat.com/pricing/', 'https://mybcat.com/', { ownHosts: ['mybcat.com'] });
  const fromCalendar = touch('https://mybcat.com/contact/', 'https://calendar.google.com/');
  const email = touch(`${SITE}?utm_medium=email`);
  for (const quiet of [direct, internal, fromCalendar]) {
    assert.deepEqual(mergeAttribution({ first_touch: organic, last_touch: organic }, quiet).last_touch, organic);
  }
  assert.equal(mergeAttribution({ first_touch: organic, last_touch: organic }, email).last_touch.channel, 'email');
  // A new session has no last touch yet, so even a direct touch becomes it.
  assert.equal(mergeAttribution({ first_touch: organic }, direct).last_touch.channel, 'direct');
});

test('merge: a corrupt stored first touch is replaced, not trusted', () => {
  const current = touch(SITE, 'https://www.linkedin.com/');
  const merged = mergeAttribution({ first_touch: { channel: 'not-a-channel', date: 'yesterday' }, last_touch: 'x' }, current);
  assert.deepEqual(merged.first_touch, current);
  assert.deepEqual(merged.last_touch, current);
});

test('flatten gives one flat key per field for each touch, without content or term', () => {
  const first = touch(`${SITE}?utm_source=linkedin&utm_medium=social&utm_content=a&utm_term=b`);
  const flat = flattenAttribution({ first_touch: first, last_touch: null });
  assert.equal(Object.keys(flat).length, 14);
  assert.equal(flat.first_touch_channel, 'social');
  assert.equal(flat.first_touch_utm_source, 'linkedin');
  assert.equal(flat.first_touch_landing_path, '/blog/some-post/');
  assert.equal(flat.first_touch_date, '2026-11-23');
  assert.equal(flat.last_touch_channel, '');
  assert.ok(Object.keys(flat).every((key) => !/utm_(content|term)/.test(key)));
  assert.ok(Object.values(flat).every((value) => typeof value === 'string'));
});

test('firstTouchUtm is a flat map of strings with only the keys the optometry page already sends', () => {
  const first = touch(`${SITE}?utm_source=some-show&utm_medium=podcast&utm_campaign=ep12`, 'https://podcasts.apple.com/');
  const utm = firstTouchUtm({ first_touch: first, last_touch: null });
  assert.deepEqual(utm, { utm_source: 'some-show', utm_medium: 'podcast', utm_campaign: 'ep12' });
  assert.deepEqual(firstTouchUtm({ first_touch: touch(SITE), last_touch: null }), {});
  assert.deepEqual(firstTouchUtm(null), {});
  assert.ok(Object.keys(utm).every((key) => ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].includes(key)));
});

test('booking links: the internal path and the discovery schedule, nothing else', () => {
  assert.ok(isBookingUrl('/book/discovery?utm_source=site&utm_content=header'));
  assert.ok(isBookingUrl('/book/discovery/'));
  assert.ok(isBookingUrl('/book/discovery/#faq'));
  assert.ok(isBookingUrl('//mybcat.com/book/discovery'));
  assert.ok(isBookingUrl('https://mybcat.com/book/discovery'));
  assert.ok(isBookingUrl('https://www.mybcat.com/book/discovery/?x=1'));
  assert.ok(isBookingUrl('https://calendar.app.google/PLDmK4QwpdSqkxmb8'));
  assert.ok(isBookingUrl('https://calendar.google.com/calendar/appointments/schedules/AcZssZ21kmAUBj4aZSq7DYPJ4jkhMAVh400vqdkedNXshigCOXwWVU87EvvK4as9dXOlAqZYOruIhLog?firstName=A'));
  assert.ok(isBookingUrl('/book/discovery', ['preview-1.vercel.app'], 'https://preview-1.vercel.app/contact/'));
  assert.ok(!isBookingUrl('/book/prep'));
  assert.ok(!isBookingUrl('/contact/'));
  assert.ok(!isBookingUrl('/book/discovery/index.html'));
  assert.ok(!isBookingUrl('https://calendar.app.google/VqkXspVbhw4BbYyz8'));
  assert.ok(!isBookingUrl('https://evil.example/book/discovery'));
  assert.ok(!isBookingUrl('http://mybcat.com.evil.example/book/discovery'));
  assert.ok(!isBookingUrl('https://evilmybcat.com/book/discovery'));
  assert.ok(!isBookingUrl('mailto:help@mybcat.com'));
  assert.ok(!isBookingUrl('javascript:void(0)'));
  assert.equal(bookingPlacement('/book/discovery?utm_source=site&utm_content=pricing'), 'pricing');
  assert.equal(bookingPlacement('https://mybcat.com/book/discovery'), '');
  assert.equal(bookingPlacement('/book/discovery?utm_content=jane%40example.com'), '');
});

function memoryStore(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

function fakeWindow({ href, referrer = '', local = {}, session = {}, marker = true, posthog, navigator } = {}) {
  const url = new URL(href);
  const listeners = [];
  const win = {
    location: { href, hostname: url.hostname, pathname: url.pathname },
    document: {
      referrer,
      querySelector: (selector) => (marker && selector === 'meta[name="mybcat-attribution"]' ? {} : null),
      addEventListener: (type, fn, capture) => listeners.push({ type, fn, capture }),
    },
    localStorage: memoryStore(local),
    sessionStorage: memoryStore(session),
    posthog,
    listeners,
  };
  if (navigator) win.navigator = navigator;
  return win;
}

function anchor(href, parentNode = null) {
  return { nodeType: 1, tagName: 'A', getAttribute: (name) => (name === 'href' ? href : null), parentNode };
}

function click(win, target) {
  const entry = win.listeners.find((item) => item.type === 'click');
  entry.fn({ target });
}

test('initAttribution stores first touch in localStorage and last touch in sessionStorage', () => {
  const win = fakeWindow({ href: 'https://mybcat.com/blog/post/?utm_source=linkedin&utm_medium=social&utm_campaign=q4', referrer: 'https://www.linkedin.com/' });
  const api = initAttribution(win);
  assert.ok(api);
  assert.equal(win.MyBCATLeadSource, api);
  const first = JSON.parse(win.localStorage.data.get(FIRST_TOUCH_KEY));
  const last = JSON.parse(win.sessionStorage.data.get(LAST_TOUCH_KEY));
  assert.equal(first.channel, 'social');
  assert.equal(first.utm_campaign, 'q4');
  assert.equal(first.landing_path, '/blog/post/');
  assert.match(first.date, /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(first, last);
  assert.equal(api.get().first_touch.channel, 'social');
  assert.equal(api.flat().first_touch_channel, 'social');
  assert.deepEqual(api.utm(), { utm_source: 'linkedin', utm_medium: 'social', utm_campaign: 'q4' });
  // Run again on the same window: no second listener, same object.
  assert.equal(initAttribution(win), api);
  assert.equal(win.listeners.length, 1);
});

test('initAttribution never overwrites a stored first touch, in a later session', () => {
  const first = touch('https://mybcat.com/blog/old/', 'https://www.google.com/');
  const win = fakeWindow({
    href: 'https://mybcat.com/pricing/?gclid=abc&utm_campaign=spring',
    local: { [FIRST_TOUCH_KEY]: JSON.stringify(first) },
  });
  const api = initAttribution(win);
  assert.deepEqual(JSON.parse(win.localStorage.data.get(FIRST_TOUCH_KEY)), first);
  assert.equal(api.get().first_touch.channel, 'organic_search');
  assert.equal(api.get().last_touch.channel, 'paid');
  assert.equal(JSON.parse(win.sessionStorage.data.get(LAST_TOUCH_KEY)).channel, 'paid');
});

test('initAttribution stores nothing personal even when the URL carries it', () => {
  const win = fakeWindow({
    href: 'https://mybcat.com/book/discovery/?firstName=Jane&email=jane%40example.com&utm_source=podcast-x&utm_medium=podcast&utm_campaign=(555)%20123-4567&utm_term=Jane+Doe',
  });
  initAttribution(win);
  const stored = [...win.localStorage.data.values(), ...win.sessionStorage.data.values()].join(' ');
  assert.ok(!stored.includes('@'));
  assert.ok(!/jane/i.test(stored));
  assert.ok(!/555/.test(stored));
  assert.ok(stored.includes('podcast'));
});

test('initAttribution survives corrupt stored values', () => {
  for (const bad of ['{not json', 'null', '"string"', '[]', '{"channel":"direct","date":"2026-01-01","__proto__":{"x":1}}']) {
    const win = fakeWindow({ href: 'https://mybcat.com/?utm_medium=email', local: { [FIRST_TOUCH_KEY]: bad }, session: { [LAST_TOUCH_KEY]: bad } });
    const api = initAttribution(win);
    assert.ok(api.get().first_touch.date, bad);
    assert.equal(api.get().last_touch.channel, 'email', bad);
  }
});

test('initAttribution does nothing on a page without the tracking marker', () => {
  const win = fakeWindow({ href: 'https://mybcat.com/optometry-practice-transitions/', marker: false });
  assert.equal(initAttribution(win), null);
  assert.equal(win.localStorage.data.size, 0);
  assert.equal(win.sessionStorage.data.size, 0);
  assert.equal(win.listeners.length, 0);
  assert.equal(win.MyBCATLeadSource, undefined);
});

test('initAttribution survives storage that throws, a throwing storage getter and about:blank', () => {
  const win = fakeWindow({ href: 'https://mybcat.com/?utm_source=x&utm_medium=email' });
  const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  win.localStorage = broken;
  win.sessionStorage = broken;
  assert.equal(initAttribution(win).get().first_touch.channel, 'email');

  const getter = fakeWindow({ href: 'https://mybcat.com/' });
  Object.defineProperty(getter, 'localStorage', { get() { throw new Error('SecurityError'); } });
  Object.defineProperty(getter, 'sessionStorage', { get() { throw new Error('SecurityError'); } });
  assert.ok(initAttribution(getter));

  const blank = fakeWindow({ href: 'https://mybcat.com/' });
  blank.location = { href: 'about:blank', hostname: '', pathname: 'blank' };
  assert.equal(initAttribution(blank).get().first_touch.channel, 'direct');
});

test('Global Privacy Control or Do Not Track: nothing is stored, read or attached', () => {
  const optedOut = [
    { globalPrivacyControl: true },
    { doNotTrack: '1' },
    { globalPrivacyControl: true, doNotTrack: '0' },
  ];
  for (const navigator of optedOut) {
    const win = fakeWindow({
      href: 'https://mybcat.com/pricing/?utm_source=linkedin&utm_medium=social',
      navigator,
      posthog: { capture: () => assert.fail('no event may be sent') },
    });
    assert.equal(initAttribution(win), null, JSON.stringify(navigator));
    assert.equal(win.MyBCATLeadSource, undefined);
    assert.equal(win.localStorage.data.size, 0);
    assert.equal(win.sessionStorage.data.size, 0);
    assert.equal(win.listeners.length, 0);
    assert.equal(win.dataLayer, undefined);
  }
  // A visitor who turns the signal on later loses what was stored before.
  const later = fakeWindow({
    href: 'https://mybcat.com/',
    navigator: { globalPrivacyControl: true },
    local: { [FIRST_TOUCH_KEY]: '{"channel":"direct","date":"2026-01-01"}' },
    session: { [LAST_TOUCH_KEY]: '{"channel":"direct","date":"2026-01-01"}' },
  });
  assert.equal(initAttribution(later), null);
  assert.equal(later.localStorage.data.size, 0);
  assert.equal(later.sessionStorage.data.size, 0);
  // The signal off, or not present, changes nothing.
  for (const navigator of [{ globalPrivacyControl: false, doNotTrack: '0' }, { doNotTrack: null }, {}, undefined]) {
    const win = fakeWindow({ href: 'https://mybcat.com/', navigator });
    assert.ok(initAttribution(win), JSON.stringify(navigator));
  }
});

test('a click on a booking link pushes the dataLayer event and the PostHog event with attribution', () => {
  const captured = [];
  const win = fakeWindow({
    href: 'https://mybcat.com/pricing/?utm_source=newsletter&utm_medium=email&utm_campaign=nov',
    posthog: { capture: (name, props) => captured.push({ name, props }) },
  });
  initAttribution(win);
  click(win, anchor('/book/discovery?utm_source=site&utm_content=pricing'));

  assert.equal(win.dataLayer.length, 1);
  const pushed = win.dataLayer[0];
  assert.equal(pushed.event, BOOKING_EVENT);
  assert.equal(pushed.event, 'mybcat_booking_click');
  assert.equal(pushed.booking_placement, 'pricing');
  assert.equal(pushed.booking_trigger, 'link_click');
  assert.equal(pushed.page_path, '/pricing/');
  assert.equal(pushed.first_touch_channel, 'email');
  assert.equal(pushed.first_touch_utm_campaign, 'nov');
  assert.equal(pushed.last_touch_channel, 'email');
  assert.ok(Object.keys(pushed).every((key) => !/utm_(content|term)/.test(key)));
  assert.equal(captured.length, 1);
  assert.equal(captured[0].name, 'mybcat_booking_click');
  assert.equal(captured[0].props.first_touch_channel, 'email');
  assert.equal(captured[0].props.event, undefined);
});

test('a click inside a booking link counts, an absolute site link counts, other links do not', () => {
  const win = fakeWindow({ href: 'https://mybcat.com/blog/post/' });
  initAttribution(win);
  const link = anchor('https://mybcat.com/book/discovery');
  const inner = { nodeType: 1, tagName: 'SPAN', getAttribute: () => null, parentNode: link };
  click(win, inner);
  assert.equal(win.dataLayer.length, 1);
  assert.equal(win.dataLayer[0].booking_placement, '');

  const other = fakeWindow({ href: 'https://mybcat.com/blog/post/' });
  initAttribution(other);
  click(other, anchor('/contact/'));
  click(other, anchor('/book/prep'));
  click(other, { nodeType: 1, tagName: 'DIV', getAttribute: () => null, parentNode: null });
  click(other, null);
  assert.equal(other.dataLayer, undefined);
});

test('a text node target and a lower-case anchor tag still count', () => {
  for (const target of [
    { nodeType: 3, parentNode: anchor('/book/discovery') },
    { nodeType: 1, tagName: 'a', getAttribute: () => '/book/discovery', parentNode: null },
  ]) {
    const win = fakeWindow({ href: 'https://mybcat.com/' });
    initAttribution(win);
    click(win, target);
    assert.equal(win.dataLayer.length, 1);
  }
});

test('a booking click works without PostHog and never throws', () => {
  const win = fakeWindow({ href: 'https://mybcat.com/' });
  initAttribution(win);
  assert.doesNotThrow(() => click(win, anchor('/book/discovery')));
  assert.equal(win.dataLayer.length, 1);
  const broken = fakeWindow({ href: 'https://mybcat.com/', posthog: { capture: () => { throw new Error('posthog down'); } } });
  initAttribution(broken);
  assert.doesNotThrow(() => click(broken, anchor('/book/discovery')));
});

test('one booking event per page view: the first trigger wins', () => {
  const captured = [];
  const win = fakeWindow({ href: 'https://mybcat.com/contact/', posthog: { capture: (name, props) => captured.push([name, props.booking_trigger]) } });
  const api = initAttribution(win);
  // The form submit shows the calendar, then the visitor clicks the fallback link.
  api.trackBookingStart({ placement: 'contact_form', trigger: 'calendar_embed' });
  click(win, anchor('https://mybcat.com/book/discovery'));
  click(win, anchor('/book/discovery?utm_source=site&utm_content=header'));
  assert.equal(win.dataLayer.filter((item) => item.event === BOOKING_EVENT).length, 1);
  assert.equal(win.dataLayer[0].booking_trigger, 'calendar_embed');
  assert.equal(win.dataLayer[0].booking_placement, 'contact_form');
  assert.deepEqual(captured, [['mybcat_booking_click', 'calendar_embed']]);

  // The other way round: a click first, then the calendar embed.
  const second = fakeWindow({ href: 'https://mybcat.com/contact/' });
  const api2 = initAttribution(second);
  click(second, anchor('/book/discovery?utm_source=site&utm_content=contact'));
  api2.trackBookingStart({ placement: 'contact_form', trigger: 'calendar_embed', posthog: false });
  assert.equal(second.dataLayer.length, 1);
  assert.equal(second.dataLayer[0].booking_trigger, 'link_click');
});

test('the contact page can push its own events without PostHog', () => {
  const captured = [];
  const win = fakeWindow({ href: 'https://mybcat.com/contact/', posthog: { capture: (name) => captured.push(name) } });
  const api = initAttribution(win);
  api.push('mybcat_contact_form_submitted', { form_id: 'contact', ...api.flat() });
  api.trackBookingStart({ placement: 'contact_form', trigger: 'calendar_embed', posthog: false });
  assert.equal(win.dataLayer[0].event, 'mybcat_contact_form_submitted');
  assert.equal(win.dataLayer[0].first_touch_channel, 'direct');
  assert.equal(win.dataLayer[1].event, 'mybcat_booking_click');
  assert.equal(win.dataLayer[1].booking_trigger, 'calendar_embed');
  assert.deepEqual(captured, []);
});
