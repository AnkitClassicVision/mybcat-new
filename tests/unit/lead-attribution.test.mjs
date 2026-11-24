import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BOOKING_EVENT,
  CHANNELS,
  FIRST_TOUCH_KEY,
  LAST_TOUCH_KEY,
  bookingPlacement,
  cleanHost,
  cleanToken,
  deriveChannel,
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
  assert.equal(touch(`${SITE}?utm_source=facebook`).channel, 'social');
});

test('podcast: utm_medium=podcast, a podcast source name, or a podcast host', () => {
  assert.equal(touch(`${SITE}?utm_source=some-show&utm_medium=podcast`).channel, 'podcast');
  assert.equal(touch(`${SITE}?utm_source=the-optometry-podcast`).channel, 'podcast');
  assert.equal(touch(SITE, 'https://podcasts.apple.com/us/podcast/x/id1').channel, 'podcast');
  assert.equal(touch(SITE, 'https://open.spotify.com/episode/abc').channel, 'podcast');
  assert.equal(touch(SITE, 'https://overcast.fm/+abc').channel, 'podcast');
});

test('email: medium, newsletter source, or a webmail host', () => {
  assert.equal(touch(`${SITE}?utm_source=hubspot&utm_medium=email`).channel, 'email');
  assert.equal(touch(`${SITE}?utm_source=weekly-newsletter`).channel, 'email');
  assert.equal(touch(SITE, 'https://outlook.live.com/mail/0/').channel, 'email');
  assert.equal(touch(SITE, 'https://us-mg5.mail.yahoo.com/').channel, 'email');
});

test('paid: a click id or a paid medium', () => {
  assert.equal(touch(`${SITE}?gclid=abc123`).channel, 'paid');
  assert.equal(touch(`${SITE}?gbraid=abc&utm_source=google&utm_medium=organic`).channel, 'paid');
  assert.equal(touch(`${SITE}?msclkid=abc`).channel, 'paid');
  assert.equal(touch(`${SITE}?utm_source=google&utm_medium=cpc`).channel, 'paid');
  assert.equal(touch(`${SITE}?utm_source=linkedin&utm_medium=paid-social`).channel, 'paid');
  assert.equal(touch(`${SITE}?utm_medium=ppc`, 'https://www.google.com/').channel, 'paid');
});

test('direct, and referral for other sites', () => {
  assert.equal(touch(SITE).channel, 'direct');
  assert.equal(touch(`${SITE}?utm_campaign=q4`).channel, 'direct');
  assert.equal(touch(SITE, 'https://some-partner.example/resources').channel, 'referral');
  assert.equal(touch(`${SITE}?utm_source=partner-x`).channel, 'referral');
  assert.equal(touch(SITE, 'https://chatgpt.com/').channel, 'referral');
});

test('every derived channel is one of the seven allowed values', () => {
  const samples = [
    {},
    { source: 'x', medium: 'y' },
    { referrerHost: 'example.org' },
    { clickId: true },
    { medium: 'podcast' },
  ];
  for (const sample of samples) assert.ok(CHANNELS.includes(deriveChannel(sample)));
  assert.deepEqual([...CHANNELS].sort(), ['direct', 'email', 'organic_search', 'paid', 'podcast', 'referral', 'social']);
});

test('own links and own referrers are not a way in', () => {
  assert.equal(touch(SITE, 'https://mybcat.com/pricing/').channel, 'direct');
  assert.equal(touch(SITE, 'https://www.mybcat.com/pricing/').referrer_host, '');
  assert.equal(touch(SITE, 'https://hubspot.mybcat.com/x').referrer_host, '');
  assert.equal(touch(SITE, 'https://preview-123.vercel.app/x', { ownHosts: ['preview-123.vercel.app'] }).referrer_host, '');
  // The site tags its own booking links with utm_source=site.
  const internal = touch('https://mybcat.com/book/discovery/?utm_source=site&utm_content=header');
  assert.equal(internal.utm_source, '');
  assert.equal(internal.utm_content, '');
  assert.equal(internal.channel, 'direct');
  assert.equal(touch('https://mybcat.com/book/discovery/?utm_source=site&utm_content=header', 'https://www.google.com/').channel, 'organic_search');
});

test('a touch holds the campaign fields, the referrer host, the landing path and the date', () => {
  const result = touch(
    'https://mybcat.com/blog/post/?utm_source=Some-Show&utm_medium=Podcast&utm_campaign=Q4-Launch&utm_content=ep12&utm_term=optometry+call+center',
    'https://podcasts.apple.com/us/podcast/x/id1?i=2'
  );
  assert.deepEqual(result, {
    utm_source: 'some-show',
    utm_medium: 'podcast',
    utm_campaign: 'q4-launch',
    utm_content: 'ep12',
    utm_term: 'optometry-call-center',
    referrer_host: 'podcasts.apple.com',
    landing_path: '/blog/post/',
    channel: 'podcast',
    date: '2026-11-23',
  });
});

test('no personal data survives: query strings, emails, phone numbers, full referrer URLs', () => {
  const result = touch(
    'https://mybcat.com/contact/?email=jane%40example.com&firstName=Jane&utm_source=linkedin&utm_medium=social&utm_content=jane%40example.com&utm_term=5551234567&utm_campaign=555-123-4567',
    'https://www.linkedin.com/in/jane-doe-123?trk=x'
  );
  assert.equal(result.utm_content, '');
  assert.equal(result.utm_term, '');
  assert.equal(result.utm_campaign, '');
  assert.equal(result.referrer_host, 'linkedin.com');
  assert.equal(result.landing_path, '/contact/');
  const text = JSON.stringify(result);
  assert.ok(!text.includes('@'));
  assert.ok(!/jane/i.test(text));
  assert.ok(!text.includes('email='));
  assert.equal(cleanToken('a'.repeat(200)).length, 80);
  assert.equal(cleanToken('2026-11-q4-launch'), '2026-11-q4-launch');
  assert.equal(cleanHost('https://www.Example.com:8080/path?q=1'), 'example.com');
  assert.equal(cleanHost('not a host'), '');
});

test('a bad URL still gives a valid direct touch', () => {
  const result = readAttribution({ href: 'not a url', referrer: '', now: NOW });
  assert.equal(result.channel, 'direct');
  assert.equal(result.landing_path, '');
  assert.ok(normalizeTouch(result));
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
  const email = touch(`${SITE}?utm_medium=email`);
  const kept = mergeAttribution({ first_touch: organic, last_touch: organic }, direct);
  assert.deepEqual(kept.last_touch, organic);
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

test('flatten gives one flat key per field for each touch', () => {
  const first = touch(`${SITE}?utm_source=linkedin&utm_medium=social`);
  const flat = flattenAttribution({ first_touch: first, last_touch: null });
  assert.equal(Object.keys(flat).length, 18);
  assert.equal(flat.first_touch_channel, 'social');
  assert.equal(flat.first_touch_utm_source, 'linkedin');
  assert.equal(flat.first_touch_landing_path, '/blog/some-post/');
  assert.equal(flat.first_touch_date, '2026-11-23');
  assert.equal(flat.last_touch_channel, '');
  assert.ok(Object.values(flat).every((value) => typeof value === 'string'));
});

test('booking links: the internal path and the discovery schedule, nothing else', () => {
  assert.ok(isBookingUrl('/book/discovery?utm_source=site&utm_content=header'));
  assert.ok(isBookingUrl('/book/discovery/'));
  assert.ok(isBookingUrl('https://mybcat.com/book/discovery'));
  assert.ok(isBookingUrl('https://www.mybcat.com/book/discovery/?x=1'));
  assert.ok(isBookingUrl('https://calendar.app.google/PLDmK4QwpdSqkxmb8'));
  assert.ok(isBookingUrl('https://calendar.google.com/calendar/appointments/schedules/AcZssZ21kmAUBj4aZSq7DYPJ4jkhMAVh400vqdkedNXshigCOXwWVU87EvvK4as9dXOlAqZYOruIhLog?firstName=A'));
  assert.ok(isBookingUrl('/book/discovery', ['preview-1.vercel.app'], 'https://preview-1.vercel.app/contact/'));
  assert.ok(!isBookingUrl('/book/prep'));
  assert.ok(!isBookingUrl('/contact/'));
  assert.ok(!isBookingUrl('https://calendar.app.google/VqkXspVbhw4BbYyz8'));
  assert.ok(!isBookingUrl('https://evil.example/book/discovery'));
  assert.ok(!isBookingUrl('mailto:help@mybcat.com'));
  assert.ok(!isBookingUrl('javascript:void(0)'));
  assert.equal(bookingPlacement('/book/discovery?utm_source=site&utm_content=pricing'), 'pricing');
  assert.equal(bookingPlacement('https://mybcat.com/book/discovery'), '');
});

function memoryStore(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

function fakeWindow({ href, referrer = '', local = {}, session = {}, marker = true, posthog } = {}) {
  const url = new URL(href);
  const listeners = [];
  return {
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
  const win = fakeWindow({ href: 'https://mybcat.com/book/discovery/?firstName=Jane&email=jane%40example.com&utm_source=podcast-x&utm_medium=podcast' });
  initAttribution(win);
  const stored = [...win.localStorage.data.values(), ...win.sessionStorage.data.values()].join(' ');
  assert.ok(!stored.includes('@'));
  assert.ok(!/jane/i.test(stored));
  assert.ok(stored.includes('podcast'));
});

test('initAttribution does nothing on a page without the tracking marker', () => {
  const win = fakeWindow({ href: 'https://mybcat.com/optometry-practice-transitions/', marker: false });
  assert.equal(initAttribution(win), null);
  assert.equal(win.localStorage.data.size, 0);
  assert.equal(win.sessionStorage.data.size, 0);
  assert.equal(win.listeners.length, 0);
  assert.equal(win.MyBCATLeadSource, undefined);
});

test('initAttribution survives storage that throws', () => {
  const win = fakeWindow({ href: 'https://mybcat.com/?utm_source=x&utm_medium=email' });
  const broken = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  win.localStorage = broken;
  win.sessionStorage = broken;
  const api = initAttribution(win);
  assert.equal(api.get().first_touch.channel, 'email');
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
  click(win, anchor('/contact/'));
  click(win, anchor('/book/prep'));
  click(win, { nodeType: 1, tagName: 'DIV', getAttribute: () => null, parentNode: null });
  assert.equal(win.dataLayer.length, 1);
});

test('a booking click works without PostHog and never throws', () => {
  const win = fakeWindow({ href: 'https://mybcat.com/' });
  initAttribution(win);
  assert.doesNotThrow(() => click(win, anchor('/book/discovery')));
  assert.equal(win.dataLayer.length, 1);
  win.posthog = { capture: () => { throw new Error('posthog down'); } };
  assert.doesNotThrow(() => click(win, anchor('/book/discovery')));
});

test('the contact page can push its own events and a booking start without PostHog', () => {
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
