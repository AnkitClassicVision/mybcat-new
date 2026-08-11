import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import handler, { __test } from '../../api/forms/intake.mjs';

const originalFetch = globalThis.fetch;
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

function touch(landing = '/contact/') {
  return { source: 'search', medium: 'organic', campaign: '', landing_page: landing };
}

function servicePayload(overrides = {}) {
  return {
    schema_version: 'seo-intake.v1',
    form_id: 'service-intake-v1',
    funnel: 'service',
    fields: [
      { name: 'firstname', value: 'Synthetic' },
      { name: 'lastname', value: 'Lead' },
      { name: 'email', value: 'synthetic@example.test' },
      { name: 'specialty', value: 'Optometry' },
      { name: 'role', value: 'Owner' },
      { name: 'number_of_locations', value: '3-4 Locations' },
      { name: 'operating_problem', value: 'Missed calls' },
      { name: 'timeline', value: '1-3 months' },
    ],
    context: { pagePath: '/contact/' },
    attribution: {
      attribution_id: 'synthetic-attribution',
      first_touch: touch(),
      last_touch: touch(),
      content_cluster: 'optometry-patient-access',
      cta_id: 'service-fit-review',
    },
    consent: { scopes: ['business_inquiry_processing'], timestamp: '2026-08-11T14:00:00Z' },
    ...overrides,
  };
}

function acquisitionPayload(serviceConsent = false) {
  return {
    ...servicePayload(),
    form_id: 'acquisition-intake-v1',
    funnel: 'acquisition',
    fields: [
      { name: 'firstname', value: 'Synthetic' },
      { name: 'lastname', value: 'Owner' },
      { name: 'email', value: 'owner@example.test' },
      { name: 'state', value: 'GA' },
      { name: 'number_of_locations', value: '1 Location' },
      { name: 'transition_horizon', value: '1-2 years' },
      { name: 'confidentiality_consent', value: 'yes' },
      ...(serviceConsent ? [{ name: 'service_interest_consent', value: 'yes' }] : []),
    ],
    context: { pagePath: '/optometry-practice-transitions/' },
    attribution: {
      attribution_id: 'synthetic-seller-attribution',
      first_touch: touch('/optometry-practice-transitions/'),
      last_touch: touch('/optometry-practice-transitions/'),
      content_cluster: 'optometry-practice-transitions',
      cta_id: 'confidential-seller-inquiry',
    },
    consent: {
      scopes: ['confidential_acquisition_inquiry', ...(serviceConsent ? ['service_marketing'] : [])],
      timestamp: '2026-08-11T14:00:00Z',
    },
  };
}

async function run(payload, options = {}) {
  const req = {
    method: options.method || 'POST',
    headers: { origin: options.origin || 'http://localhost:4321' },
    body: payload,
  };
  const res = responseRecorder();
  await handler(req, res);
  return res;
}

beforeEach(() => {
  process.env.NODE_ENV = 'test';
  process.env.FORM_INTAKE_ENDPOINT = 'http://estate.test/forms/intake';
  process.env.FORM_INTAKE_TOKEN = 'test-token-never-logged';
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
});

test('rejects non-POST requests and unapproved origins', async () => {
  assert.equal((await run({}, { method: 'GET' })).statusCode, 405);
  assert.equal((await run(servicePayload(), { origin: 'https://unapproved.example' })).statusCode, 403);
});

test('fails closed when intake configuration is absent', async () => {
  delete process.env.FORM_INTAKE_TOKEN;
  const res = await run(servicePayload());
  assert.equal(res.statusCode, 503);
  assert.deepEqual(res.body, { ok: false, error: 'intake_not_configured' });
});

test('failed upstream intake produces no success response', async () => {
  globalThis.fetch = async () => ({ ok: false });
  const res = await run(servicePayload());
  assert.equal(res.statusCode, 502);
  assert.deepEqual(res.body, { ok: false, error: 'intake_unavailable' });
});

test('forwards a validated service inquiry without making Twenty canonical', async () => {
  let forwarded;
  globalThis.fetch = async (_url, options) => {
    forwarded = { headers: options.headers, body: JSON.parse(options.body) };
    return { ok: true };
  };
  const res = await run(servicePayload());
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal(forwarded.headers['X-Forms-Token'], process.env.FORM_INTAKE_TOKEN);
  assert.equal(forwarded.body.crm.canonical, false);
  assert.equal(forwarded.body.crm.routing_status, 'pending-canonical-gate');
  assert.equal(forwarded.body.attribution.first_touch.landing_page, '/contact/');
});

test('seller service consent defaults off and cannot be inferred', () => {
  const withoutConsent = __test.cleanPayload(acquisitionPayload(false));
  const withConsent = __test.cleanPayload(acquisitionPayload(true));
  assert.deepEqual(withoutConsent.consent.scopes, ['confidential_acquisition_inquiry']);
  assert.deepEqual(withConsent.consent.scopes, ['confidential_acquisition_inquiry', 'service_marketing']);
});

test('seller confidentiality consent is mandatory', async () => {
  const payload = acquisitionPayload(false);
  payload.fields = payload.fields.filter((field) => field.name !== 'confidentiality_consent');
  assert.equal((await run(payload)).statusCode, 400);
});

test('duplicate submissions carry a stable downstream idempotency key', () => {
  const first = __test.cleanPayload(servicePayload());
  const secondPayload = servicePayload();
  secondPayload.attribution.attribution_id = 'different-session';
  secondPayload.consent.timestamp = '2026-08-12T14:00:00Z';
  const second = __test.cleanPayload(secondPayload);
  assert.equal(first.idempotency_key, second.idempotency_key);
});

test('unknown fields are rejected instead of forwarded', async () => {
  const payload = servicePayload();
  payload.fields.push({ name: 'patient_name', value: 'must-not-pass' });
  assert.equal((await run(payload)).statusCode, 400);
});

test('visitor-controlled query text and attribution values are not forwarded', () => {
  const payload = servicePayload();
  payload.context.pagePath = '/contact/?patient=must-not-pass';
  payload.attribution.first_touch = {
    source: 'sensitive-person-name',
    medium: 'private-note',
    campaign: 'patient-record-123',
    landing_page: '/contact/?patient=must-not-pass',
  };
  const cleaned = __test.cleanPayload(payload);
  assert.deepEqual(cleaned.context, {
    pagePath: '/contact/',
    pageName: 'MyBCAT service inquiry',
  });
  assert.deepEqual(cleaned.attribution.first_touch, {
    source: 'other',
    medium: 'other',
    campaign: 'unapproved-campaign',
    landing_page: '/contact/',
  });
  assert.equal(JSON.stringify(cleaned).includes('must-not-pass'), false);
  assert.equal(JSON.stringify(cleaned).includes('patient-record-123'), false);
});
