import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import handler, { __test } from '../../api/forms/oa-lead.mjs';

const originalFetch = globalThis.fetch;
const originalError = console.error;
const originalEnv = { ...process.env };

function responseRecorder() {
  return {
    headers: {},
    statusCode: 0,
    body: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function oaPayload(overrides = {}) {
  return {
    fields: [
      { name: 'company', value: 'Preview Test Practice' },
      { name: 'firstname', value: 'Preview Test Practice' },
      { name: 'website', value: 'https://example.com' },
      { name: 'requested_meeting', value: 'Discovery' },
      { name: 'message', value: 'Growth plan request: wants a growth plan for their local market (optometry analysis page)' },
      { name: 'email', value: 'synthetic@example.test' },
      { name: 'mobilephone', value: '4045550100' },
      { name: 'utm_source', value: 'optometry-analysis' },
    ],
    context: {
      pageUri: 'https://mybcat.com/optometry-analysis/',
      pageName: 'What drives optometry practice growth',
      source: 'optometry-analysis',
      utm: { utm_source: 'optometry-analysis' },
    },
    ...overrides,
  };
}

async function run(payload, options = {}) {
  const req = {
    method: options.method || 'POST',
    headers: {
      origin: options.origin || 'http://localhost:4321',
      'user-agent': options.userAgent || 'oa-lead-test-agent',
      ...(options.headers || {}),
    },
    body: payload,
  };
  const res = responseRecorder();
  await handler(req, res);
  return res;
}

function mockFetch({ emailOk = true, forwardOk = true, onCall } = {}) {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    const href = String(url);
    const entry = { url: href, options };
    calls.push(entry);
    if (onCall) onCall(entry);
    if (href.includes('api.resend.com')) return { ok: emailOk, status: emailOk ? 200 : 500 };
    return { ok: forwardOk, status: forwardOk ? 200 : 502 };
  };
  return calls;
}

beforeEach(() => {
  process.env.NODE_ENV = 'test';
  process.env.RESEND_API_KEY = 'test-resend-key-never-logged';
  process.env.LEAD_EMAIL_TO = 'ankit@mybcat.com';
  process.env.LEAD_EMAIL_FROM = 'MyBCAT Leads <leads@mybcat.com>';
  process.env.FORM_INTAKE_ENDPOINT = 'https://estate.test/forms/intake';
  process.env.FORM_INTAKE_TOKEN = 'test-token-never-logged';
  console.error = () => {};
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalError;
  process.env = { ...originalEnv };
});

test('rejects non-POST requests and unapproved origins', async () => {
  assert.equal((await run({}, { method: 'GET' })).statusCode, 405);
  assert.equal((await run(oaPayload(), { origin: 'https://unapproved.example' })).statusCode, 403);
  assert.equal((await run(oaPayload(), { origin: 'https://evil.vercel.app' })).statusCode, 403);
});

test('allows mybcat production and mybcat Vercel preview origins', () => {
  assert.equal(__test.isAllowedOrigin('https://mybcat.com'), true);
  assert.equal(__test.isAllowedOrigin('https://www.mybcat.com'), true);
  assert.equal(
    __test.isAllowedOrigin('https://mybcat-new-git-oa-lead-ankitclassicvision.vercel.app'),
    true,
  );
  assert.equal(__test.isAllowedOrigin('http://localhost:4321'), true);
});

test('rejects oversized bodies before calling upstream services', async () => {
  const calls = mockFetch();
  const res = await run(oaPayload(), {
    headers: { 'content-length': String(40_000) },
  });
  assert.equal(res.statusCode, 413);
  assert.deepEqual(res.body, { ok: false, error: 'request_too_large' });
  assert.equal(calls.length, 0);
});

test('unknown fields stay out of the email and do not fail the request', () => {
  const payload = oaPayload();
  payload.fields.push({ name: 'patient_name', value: 'must-not-pass' });
  const lead = __test.extractLead(payload);
  assert.equal(lead.practice, 'Preview Test Practice');
  const text = __test.buildEmailText(lead, 'agent', 'Oct 27, 2026, 11:15:00 AM EDT');
  assert.equal(text.includes('must-not-pass'), false);
  assert.equal(text.includes('patient_name'), false);
});

test('email success with a failed Worker forward still returns ok', async () => {
  const calls = mockFetch({ emailOk: true, forwardOk: false });
  const res = await run(oaPayload());
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal(calls.some((call) => call.url.includes('api.resend.com')), true);
  assert.equal(calls.some((call) => call.url.includes('estate.test')), true);
});

test('Worker forward success with a failed email still returns ok', async () => {
  const calls = mockFetch({ emailOk: false, forwardOk: true });
  const res = await run(oaPayload());
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal(calls.length, 2);
});

test('returns lead_not_delivered only when both email and forward fail', async () => {
  mockFetch({ emailOk: false, forwardOk: false });
  const res = await run(oaPayload());
  assert.equal(res.statusCode, 502);
  assert.deepEqual(res.body, { ok: false, error: 'lead_not_delivered' });
});

test('sends a plain-text Resend email and forwards the original payload', async () => {
  let resendBody;
  let forwarded;
  mockFetch({
    onCall({ url, options }) {
      if (String(url).includes('api.resend.com')) resendBody = JSON.parse(options.body);
      if (String(url).includes('estate.test')) {
        forwarded = { headers: options.headers, body: JSON.parse(options.body) };
      }
    },
  });

  const payload = oaPayload();
  const res = await run(payload, { userAgent: 'Mozilla/5.0 TestAgent' });
  assert.equal(res.statusCode, 200);
  assert.equal(resendBody.from, 'MyBCAT Leads <leads@mybcat.com>');
  assert.deepEqual(resendBody.to, ['ankit@mybcat.com']);
  assert.equal(resendBody.subject, '[MyBCAT] Optometry Analysis lead — Preview Test Practice');
  assert.match(resendBody.text, /Practice: Preview Test Practice/);
  assert.match(resendBody.text, /Website: https:\/\/example\.com/);
  assert.match(resendBody.text, /Email: synthetic@example\.test/);
  assert.match(resendBody.text, /Phone: 4045550100/);
  assert.match(resendBody.text, /UTM source: optometry-analysis/);
  assert.match(resendBody.text, /Page URL: https:\/\/mybcat\.com\/optometry-analysis\//);
  assert.match(resendBody.text, /Timestamp \(ET\): /);
  assert.match(resendBody.text, /User agent: Mozilla\/5\.0 TestAgent/);
  assert.equal(forwarded.headers['X-Forms-Token'], process.env.FORM_INTAKE_TOKEN);
  assert.deepEqual(forwarded.body, payload);
});

test('falls back to the public form token when FORM_INTAKE_TOKEN is absent', async () => {
  delete process.env.FORM_INTAKE_TOKEN;
  process.env.PUBLIC_FORM_INTAKE_TOKEN = 'public-test-token-never-logged';
  let forwardedToken;
  mockFetch({
    onCall({ url, options }) {
      if (String(url).includes('estate.test')) forwardedToken = options.headers['X-Forms-Token'];
    },
  });
  const res = await run(oaPayload());
  assert.equal(res.statusCode, 200);
  assert.equal(forwardedToken, 'public-test-token-never-logged');
});

test('failure logs omit lead fields and addresses', async () => {
  const logs = [];
  console.error = (value) => { logs.push(String(value)); };
  mockFetch({ emailOk: false, forwardOk: false });
  await run(oaPayload());
  const joined = logs.join('\n');
  assert.equal(joined.includes('synthetic@example.test'), false);
  assert.equal(joined.includes('Preview Test Practice'), false);
  assert.equal(joined.includes('4045550100'), false);
  assert.equal(joined.includes('test-resend-key-never-logged'), false);
  assert.equal(joined.includes('test-token-never-logged'), false);
  assert.match(joined, /oa_lead_failure/);
});

test('ET timestamp formatter includes an Eastern zone label', () => {
  const stamp = __test.formatTimestampEt(new Date('2026-01-15T17:00:00.000Z'));
  assert.match(stamp, /EST|EDT/);
});
