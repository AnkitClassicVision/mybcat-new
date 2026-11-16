import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import handler, { __test } from '../../api/forms/lead.mjs';

const originalFetch = globalThis.fetch;
const originalError = console.error;
const originalWarn = console.warn;
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

function contactPayload(overrides = {}) {
  return {
    fields: [
      { name: 'firstname', value: 'Synthetic' },
      { name: 'lastname', value: 'Lead' },
      { name: 'email', value: 'synthetic@example.test' },
      { name: 'mobilephone', value: '4045550100' },
      { name: 'website', value: 'https://example.com' },
      { name: 'number_of_locations', value: '2-4 Locations' },
      { name: 'requested_meeting', value: 'Discovery' },
      { name: 'utm_source', value: 'linkedin' },
      { name: 'utm_medium', value: 'social' },
      { name: 'utm_campaign', value: 'oa-2026' },
      { name: 'utm_content', value: 'eb-test' },
    ],
    context: {
      pageUri: 'https://mybcat.com/contact/?utm_source=linkedin&utm_content=eb-test',
      pageName: 'Contact Enterprise Team',
      source: 'contact',
      utm: {
        utm_source: 'linkedin',
        utm_medium: 'social',
        utm_campaign: 'oa-2026',
        utm_content: 'eb-test',
      },
    },
    ...overrides,
  };
}

async function run(payload, options = {}) {
  const req = {
    method: options.method || 'POST',
    headers: {
      origin: options.origin || 'http://localhost:4321',
      'user-agent': options.userAgent || 'lead-handler-test',
      ...(options.headers || {}),
    },
    body: payload,
  };
  const res = responseRecorder();
  await handler(req, res);
  return res;
}

function jsonResponse(ok, status, data) {
  return {
    ok,
    status,
    text: async () => JSON.stringify(data),
  };
}

function mockApis({
  people = [],
  personWriteOk = true,
  rejectCustomPersonFields = false,
  opportunityOk = true,
  rejectCustomOpportunityFields = false,
  noteOk = true,
  forwardOk = true,
} = {}) {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    const href = String(url);
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.parse(options.body) : null;
    calls.push({ url: href, method, body, headers: options?.headers || {} });

    if (href.includes('/people') && method === 'GET') {
      return jsonResponse(true, 200, { data: { people } });
    }
    if (href.includes('/people') && (method === 'POST' || method === 'PATCH')) {
      if (rejectCustomPersonFields && body?.utmSource) {
        return jsonResponse(false, 400, { messages: ['Field "utmSource" is not defined'] });
      }
      if (!personWriteOk) return jsonResponse(false, 500, { error: 'person_failed' });
      return jsonResponse(true, 200, { data: { createPerson: { id: 'person-1' } } });
    }
    if (href.includes('/opportunities')) {
      if (rejectCustomOpportunityFields && body?.utmSource) {
        return jsonResponse(false, 400, { messages: ['Field "utmSource" is not defined'] });
      }
      if (!opportunityOk) return jsonResponse(false, 500, { error: 'opp_failed' });
      return jsonResponse(true, 200, { data: { createOpportunity: { id: 'opp-1' } } });
    }
    if (href.includes('/notes')) {
      if (!noteOk) return jsonResponse(false, 500, { error: 'note_failed' });
      return jsonResponse(true, 200, { data: { createNote: { id: 'note-1' } } });
    }
    if (href.includes('/noteTargets')) {
      return jsonResponse(true, 200, { data: { createNoteTarget: { id: 'nt-1' } } });
    }
    return jsonResponse(forwardOk, forwardOk ? 200 : 502, { ok: forwardOk });
  };
  return calls;
}

beforeEach(() => {
  process.env.NODE_ENV = 'test';
  process.env.TWENTY_API_KEY = 'test-twenty-key-never-logged';
  process.env.TWENTY_API_URL = 'https://crm.mybcat.com/rest';
  process.env.FORM_INTAKE_ENDPOINT = 'https://estate.test/forms/intake';
  process.env.FORM_INTAKE_TOKEN = 'test-token-never-logged';
  delete process.env.TWENTY_LEAD_FIELD_MAP;
  console.error = () => {};
  console.warn = () => {};
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  console.error = originalError;
  console.warn = originalWarn;
  process.env = { ...originalEnv };
});

test('rejects non-POST requests and unapproved origins', async () => {
  const calls = mockApis();
  assert.equal((await run({}, { method: 'GET' })).statusCode, 405);
  assert.equal((await run(contactPayload(), { origin: 'https://unapproved.example' })).statusCode, 403);
  assert.equal((await run(contactPayload(), { origin: 'https://evil.vercel.app' })).statusCode, 403);
  assert.equal(calls.length, 0);
});

test('allows mybcat production and mybcat Vercel preview origins', () => {
  assert.equal(__test.isAllowedOrigin('https://mybcat.com'), true);
  assert.equal(__test.isAllowedOrigin('https://www.mybcat.com'), true);
  assert.equal(
    __test.isAllowedOrigin('https://mybcat-new-git-form-leads-ankitclassicvision.vercel.app'),
    true,
  );
  assert.equal(__test.isAllowedOrigin('http://localhost:4321'), true);
});

test('rejects oversized bodies before calling Twenty or the Worker', async () => {
  const calls = mockApis();
  const res = await run(contactPayload(), {
    headers: { 'content-length': String(40_000) },
  });
  assert.equal(res.statusCode, 413);
  assert.deepEqual(res.body, { ok: false, error: 'request_too_large' });
  assert.equal(calls.length, 0);
});

test('Twenty success returns ok and writes mapped UTM fields', async () => {
  const calls = mockApis({ forwardOk: false });
  const res = await run(contactPayload());
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });

  const personWrite = calls.find((call) => call.url.includes('/people') && call.method === 'POST');
  const opportunityWrite = calls.find((call) => call.url.includes('/opportunities'));
  assert.equal(personWrite.body.emails.primaryEmail, 'synthetic@example.test');
  assert.equal(personWrite.body.utmSource, 'linkedin');
  assert.equal(personWrite.body.utmMedium, 'social');
  assert.equal(personWrite.body.utmCampaign, 'oa-2026');
  assert.equal(personWrite.body.utmContent, 'eb-test');
  assert.equal(
    personWrite.body.landingPage,
    'https://mybcat.com/contact/?utm_source=linkedin&utm_content=eb-test',
  );
  assert.equal(opportunityWrite.body.stage, 'NEW');
  assert.equal(opportunityWrite.body.pointOfContactId, 'person-1');
  assert.equal(opportunityWrite.body.utmSource, 'linkedin');
  assert.equal(opportunityWrite.body.utmContent, 'eb-test');
  assert.equal(calls.some((call) => call.url.includes('/notes')), false);
});

test('Twenty fail plus Worker ok still returns ok', async () => {
  const calls = mockApis({ personWriteOk: false, forwardOk: true });
  const res = await run(contactPayload());
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal(calls.some((call) => call.url.includes('estate.test')), true);
  assert.equal(calls.some((call) => call.url.includes('crm.mybcat.com')), true);
});

test('unset TWENTY_API_KEY skips Twenty, logs a warning, and does not crash', async () => {
  delete process.env.TWENTY_API_KEY;
  const warnings = [];
  console.warn = (value) => { warnings.push(String(value)); };
  const calls = mockApis();
  const res = await run(contactPayload());
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.equal(calls.every((call) => !call.url.includes('crm.mybcat.com')), true);
  assert.equal(calls.some((call) => call.url.includes('estate.test')), true);
  const joined = warnings.join('\n');
  assert.match(joined, /twenty_api_key_unset/);
  assert.equal(joined.includes('synthetic@example.test'), false);
  assert.equal(joined.includes('test-twenty-key-never-logged'), false);
});

test('configurable UTM mapping changes Twenty field names and can omit a field', () => {
  process.env.TWENTY_LEAD_FIELD_MAP = JSON.stringify({
    utmSource: 'customSource',
    utmMedium: 'customMedium',
    utmCampaign: '',
    utmContent: 'customContent',
    landingPage: 'customLanding',
  });
  const lead = __test.extractLead(contactPayload());
  const mapped = __test.mappedAttributionFields(lead, __test.readFieldMap());
  assert.equal(mapped.customSource, 'linkedin');
  assert.equal(mapped.customMedium, 'social');
  assert.equal(mapped.customContent, 'eb-test');
  assert.equal(
    mapped.customLanding,
    'https://mybcat.com/contact/?utm_source=linkedin&utm_content=eb-test',
  );
  assert.equal(Object.hasOwn(mapped, 'utmCampaign'), false);
  assert.equal(Object.hasOwn(mapped, 'customCampaign'), false);
  assert.equal(Object.hasOwn(mapped, 'utmSource'), false);
});

test('missing Twenty UTM fields fall back to a note instead of failing the lead', async () => {
  const calls = mockApis({
    rejectCustomPersonFields: true,
    rejectCustomOpportunityFields: true,
    forwardOk: false,
  });
  const res = await run(contactPayload());
  assert.equal(res.statusCode, 200);

  const personWrites = calls.filter((call) => call.url.includes('/people') && call.method === 'POST');
  assert.equal(personWrites.some((call) => call.body.utmSource === 'linkedin'), true);
  assert.equal(personWrites.some((call) => !call.body.utmSource), true);

  const note = calls.find((call) => call.url.endsWith('/notes') || call.url.includes('/notes'));
  assert.equal(Boolean(note), true);
  const markdown = note.body.bodyV2?.markdown || note.body.body;
  assert.match(markdown, /utm_source: linkedin/);
  assert.match(markdown, /utm_medium: social/);
  assert.match(markdown, /utm_campaign: oa-2026/);
  assert.match(markdown, /utm_content: eb-test/);
  assert.match(markdown, /landing_page: https:\/\/mybcat\.com\/contact\//);
});

test('forwards the original payload to the Worker', async () => {
  let forwarded;
  mockApis({
    forwardOk: true,
  });
  globalThis.fetch = ((original) => async (url, options) => {
    const result = await original(url, options);
    if (String(url).includes('estate.test')) {
      forwarded = { headers: options.headers, body: JSON.parse(options.body) };
    }
    return result;
  })(globalThis.fetch);

  const payload = contactPayload();
  const res = await run(payload);
  assert.equal(res.statusCode, 200);
  assert.equal(forwarded.headers['X-Forms-Token'], process.env.FORM_INTAKE_TOKEN);
  assert.deepEqual(forwarded.body, payload);
});

test('both Twenty and Worker failing returns lead_not_delivered', async () => {
  mockApis({ personWriteOk: false, forwardOk: false });
  const res = await run(contactPayload());
  assert.equal(res.statusCode, 502);
  assert.deepEqual(res.body, { ok: false, error: 'lead_not_delivered' });
});

test('invalid email is rejected without upstream calls', async () => {
  const calls = mockApis();
  const payload = contactPayload();
  payload.fields = payload.fields.map((field) => (
    field.name === 'email' ? { ...field, value: 'not-an-email' } : field
  ));
  const res = await run(payload);
  assert.equal(res.statusCode, 400);
  assert.equal(calls.length, 0);
});

test('unknown fields stay out of Twenty payloads', () => {
  const payload = contactPayload();
  payload.fields.push({ name: 'patient_name', value: 'must-not-pass' });
  const lead = __test.extractLead(payload);
  const person = __test.buildPersonPayload(lead, true, __test.DEFAULT_FIELD_MAP);
  const note = __test.buildAttributionNote(lead);
  assert.equal(JSON.stringify(person).includes('must-not-pass'), false);
  assert.equal(note.includes('must-not-pass'), false);
  assert.equal(note.includes('patient_name'), false);
});

test('failure logs omit lead fields, tokens, and keys', async () => {
  const logs = [];
  console.error = (value) => { logs.push(String(value)); };
  console.warn = (value) => { logs.push(String(value)); };
  mockApis({ personWriteOk: false, forwardOk: false });
  await run(contactPayload());
  const joined = logs.join('\n');
  assert.equal(joined.includes('synthetic@example.test'), false);
  assert.equal(joined.includes('Synthetic'), false);
  assert.equal(joined.includes('4045550100'), false);
  assert.equal(joined.includes('test-twenty-key-never-logged'), false);
  assert.equal(joined.includes('test-token-never-logged'), false);
  assert.match(joined, /lead_twenty_failure|lead_forward_failure/);
});
