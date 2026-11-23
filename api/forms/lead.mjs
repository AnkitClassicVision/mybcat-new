import {
  MAX_BODY_BYTES,
  EMAIL_PATTERN,
  send,
  getHeader,
  logFailure,
  logWarning,
  parseAllowedOrigins,
  isAllowedOrigin,
  sanitizeLine,
  parseBody,
} from './form-guard.mjs';

const UPSTREAM_TIMEOUT_MS = 5_000;
const TWENTY_TIMEOUT_MS = 8_000;
const DEFAULT_TWENTY_API_URL = 'https://crm.mybcat.com/rest';
const DEFAULT_FORM_INTAKE_ENDPOINT = 'https://estate-form-bridge.mybcat-estate.workers.dev';
const DEFAULT_OPPORTUNITY_STAGE = 'NEW';

const DEFAULT_FIELD_MAP = {
  utmSource: 'utmSource',
  utmMedium: 'utmMedium',
  utmCampaign: 'utmCampaign',
  utmContent: 'utmContent',
  landingPage: 'landingPage',
};

const ALLOWED_FIELDS = new Set([
  'company',
  'practice',
  'firstname',
  'lastname',
  'website',
  'email',
  'mobilephone',
  'message',
  'number_of_locations',
  'requested_meeting',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'page_url',
  'pageUri',
  'pageName',
  'source',
]);

const CONTEXT_KEYS = new Set(['pageUri', 'page_url', 'pageName', 'source', 'landingPage']);

function collectAllowlisted(input) {
  const values = {};

  if (Array.isArray(input.fields)) {
    if (input.fields.length > 30) throw new Error('invalid_fields');
    for (const field of input.fields) {
      const name = typeof field?.name === 'string' ? field.name.trim() : '';
      if (!ALLOWED_FIELDS.has(name)) continue;
      const maxLen = name === 'message' ? 2000 : 500;
      values[name] = sanitizeLine(field?.value, maxLen);
    }
  }

  for (const name of ALLOWED_FIELDS) {
    if (values[name] || typeof input[name] !== 'string') continue;
    const maxLen = name === 'message' ? 2000 : 500;
    values[name] = sanitizeLine(input[name], maxLen);
  }

  const context = input.context && typeof input.context === 'object' ? input.context : {};
  for (const name of CONTEXT_KEYS) {
    if (values[name] || typeof context[name] !== 'string') continue;
    values[name] = sanitizeLine(
      context[name],
      name === 'pageUri' || name === 'page_url' || name === 'landingPage' ? 1000 : 500,
    );
  }

  if (context.utm && typeof context.utm === 'object') {
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
      if (values[key] || typeof context.utm[key] !== 'string') continue;
      values[key] = sanitizeLine(context.utm[key], 100);
    }
  }

  return values;
}

function extractLead(input) {
  const values = collectAllowlisted(input);
  const firstName = values.firstname || '';
  const lastName = values.lastname || '';
  const company = values.company || values.practice || '';
  if (!firstName && !company && !values.email) throw new Error('missing_identity');
  if (values.email && !EMAIL_PATTERN.test(values.email)) throw new Error('invalid_email');

  return {
    firstName,
    lastName,
    company,
    website: values.website || '',
    email: values.email || '',
    phone: values.mobilephone || '',
    message: values.message || '',
    locations: values.number_of_locations || '',
    requestedMeeting: values.requested_meeting || '',
    utmSource: values.utm_source || '',
    utmMedium: values.utm_medium || '',
    utmCampaign: values.utm_campaign || '',
    utmContent: values.utm_content || '',
    pageUrl: values.page_url || values.pageUri || values.landingPage || '',
    pageName: values.pageName || '',
    source: values.source || '',
  };
}

function readFieldMap() {
  const mapped = { ...DEFAULT_FIELD_MAP };
  const raw = process.env.TWENTY_LEAD_FIELD_MAP;
  if (!raw) return mapped;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return mapped;
    for (const key of Object.keys(DEFAULT_FIELD_MAP)) {
      if (!Object.prototype.hasOwnProperty.call(parsed, key)) continue;
      const value = parsed[key];
      if (value === null || value === '') {
        mapped[key] = '';
        continue;
      }
      if (typeof value === 'string') mapped[key] = sanitizeLine(value, 80);
    }
    return mapped;
  } catch {
    return mapped;
  }
}

function attributionValues(lead) {
  return {
    utmSource: lead.utmSource,
    utmMedium: lead.utmMedium,
    utmCampaign: lead.utmCampaign,
    utmContent: lead.utmContent,
    landingPage: lead.pageUrl,
  };
}

function mappedAttributionFields(lead, fieldMap = readFieldMap()) {
  const values = attributionValues(lead);
  const fields = {};
  for (const [logical, twentyName] of Object.entries(fieldMap)) {
    if (!twentyName) continue;
    const value = values[logical];
    if (!value) continue;
    fields[twentyName] = value;
  }
  return fields;
}

function personDisplayName(lead) {
  const full = `${lead.firstName} ${lead.lastName}`.trim();
  return full || lead.company || 'Website lead';
}

function buildPersonPayload(lead, includeCustomFields, fieldMap = readFieldMap()) {
  const firstName = lead.firstName || lead.company || 'Website';
  const lastName = lead.lastName || '(form)';
  const payload = {
    name: {
      firstName: firstName.slice(0, 100),
      lastName: lastName.slice(0, 100),
    },
    emails: {
      primaryEmail: lead.email,
    },
  };
  if (lead.phone) {
    payload.phones = { primaryPhoneNumber: lead.phone.slice(0, 40) };
  }
  if (includeCustomFields) Object.assign(payload, mappedAttributionFields(lead, fieldMap));
  return payload;
}

function buildOpportunityPayload(lead, personId, includeCustomFields, fieldMap = readFieldMap()) {
  const sourceLabel = lead.source === 'optometry-analysis' ? 'Optometry Analysis' : 'Website';
  const payload = {
    name: `${sourceLabel} lead — ${personDisplayName(lead)}`.slice(0, 200),
    stage: process.env.TWENTY_OPPORTUNITY_STAGE || DEFAULT_OPPORTUNITY_STAGE,
  };
  if (personId) payload.pointOfContactId = personId;
  if (includeCustomFields) Object.assign(payload, mappedAttributionFields(lead, fieldMap));
  return payload;
}

function buildAttributionNote(lead) {
  return [
    'Form lead attribution',
    `source: ${lead.source || '(none)'}`,
    `utm_source: ${lead.utmSource || '(none)'}`,
    `utm_medium: ${lead.utmMedium || '(none)'}`,
    `utm_campaign: ${lead.utmCampaign || '(none)'}`,
    `utm_content: ${lead.utmContent || '(none)'}`,
    `landing_page: ${lead.pageUrl || '(none)'}`,
    `page_name: ${lead.pageName || '(none)'}`,
    `website: ${lead.website || '(none)'}`,
    `locations: ${lead.locations || '(none)'}`,
    `requested_meeting: ${lead.requestedMeeting || '(none)'}`,
    `message: ${lead.message || '(none)'}`,
  ].join('\n');
}

function twentyBaseUrl() {
  const raw = (process.env.TWENTY_API_URL || DEFAULT_TWENTY_API_URL).trim().replace(/\/+$/, '');
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error('invalid_twenty_url');
  }
  if (parsed.protocol !== 'https:') throw new Error('invalid_twenty_url');
  return raw;
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function extractRecordId(json) {
  if (!json || typeof json !== 'object') return '';
  const data = json.data && typeof json.data === 'object' ? json.data : json;
  if (typeof data.id === 'string' && data.id) return data.id;
  for (const value of Object.values(data)) {
    if (value && typeof value === 'object' && typeof value.id === 'string' && value.id) {
      return value.id;
    }
  }
  return '';
}

function firstPersonId(json) {
  if (!json || typeof json !== 'object') return '';
  const data = json.data && typeof json.data === 'object' ? json.data : json;
  const lists = [data.people, data.edges, Array.isArray(data) ? data : null];
  for (const list of lists) {
    if (!Array.isArray(list) || !list.length) continue;
    const first = list[0]?.node && typeof list[0].node === 'object' ? list[0].node : list[0];
    if (first && typeof first.id === 'string') return first.id;
  }
  return extractRecordId(json);
}

function isRetryableFieldError(result) {
  if (!result || result.ok) return false;
  if (result.status < 400 || result.status >= 500) return false;
  return true;
}

async function twentyJson(method, path, body) {
  const apiKey = process.env.TWENTY_API_KEY;
  if (!apiKey) throw new Error('twenty_api_key_unset');
  const url = `${twentyBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetchWithTimeout(url, {
    method,
    redirect: 'error',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  }, TWENTY_TIMEOUT_MS);

  let json = null;
  try {
    const text = await response.text();
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { ok: response.ok, status: response.status, json };
}

async function findPersonByEmail(email) {
  const filter = encodeURIComponent(`emails.primaryEmail[eq]:"${email}"`);
  const result = await twentyJson('GET', `/people?filter=${filter}`);
  if (!result.ok) throw new Error('twenty_lookup_failed');
  return firstPersonId(result.json);
}

async function writePerson(lead, includeCustomFields, fieldMap) {
  const payload = buildPersonPayload(lead, includeCustomFields, fieldMap);
  const existingId = await findPersonByEmail(lead.email);
  if (existingId) {
    const patched = await twentyJson('PATCH', `/people/${existingId}`, payload);
    if (patched.ok) return { id: existingId || extractRecordId(patched.json), usedCustomFields: includeCustomFields };
    if (includeCustomFields && isRetryableFieldError(patched)) {
      return writePerson(lead, false, fieldMap);
    }
    throw new Error('twenty_person_failed');
  }

  const created = await twentyJson('POST', '/people?upsert=true', payload);
  if (created.ok) {
    const id = extractRecordId(created.json) || await findPersonByEmail(lead.email);
    return { id, usedCustomFields: includeCustomFields };
  }
  if (includeCustomFields && isRetryableFieldError(created)) {
    return writePerson(lead, false, fieldMap);
  }

  const posted = await twentyJson('POST', '/people', payload);
  if (posted.ok) return { id: extractRecordId(posted.json), usedCustomFields: includeCustomFields };
  if (includeCustomFields && isRetryableFieldError(posted)) {
    return writePerson(lead, false, fieldMap);
  }
  throw new Error('twenty_person_failed');
}

async function writeOpportunity(lead, personId, includeCustomFields, fieldMap) {
  const payload = buildOpportunityPayload(lead, personId, includeCustomFields, fieldMap);
  const created = await twentyJson('POST', '/opportunities', payload);
  if (created.ok) {
    return { id: extractRecordId(created.json), usedCustomFields: includeCustomFields };
  }
  if (includeCustomFields && isRetryableFieldError(created)) {
    return writeOpportunity(lead, personId, false, fieldMap);
  }
  throw new Error('twenty_opportunity_failed');
}

async function writeAttributionNote(lead, personId, opportunityId) {
  const markdown = buildAttributionNote(lead);
  let note = await twentyJson('POST', '/notes', {
    title: 'Form lead attribution',
    bodyV2: { markdown },
  });
  if (!note.ok) {
    note = await twentyJson('POST', '/notes', {
      title: 'Form lead attribution',
      body: markdown,
    });
  }
  if (!note.ok) throw new Error('twenty_note_failed');
  const noteId = extractRecordId(note.json);
  if (!noteId) throw new Error('twenty_note_failed');

  if (personId) {
    const target = await twentyJson('POST', '/noteTargets', { noteId, personId });
    if (!target.ok) throw new Error('twenty_note_target_failed');
  }
  if (opportunityId) {
    const target = await twentyJson('POST', '/noteTargets', { noteId, opportunityId });
    if (!target.ok) logWarning('lead_twenty_note_target_skipped', 'opportunity_note_target_failed');
  }
  return noteId;
}

async function writeToTwenty(lead) {
  if (!lead.email) {
    logWarning('lead_twenty_skipped', 'missing_email');
    return false;
  }
  const fieldMap = readFieldMap();
  const person = await writePerson(lead, true, fieldMap);
  if (!person.id) throw new Error('twenty_person_failed');
  const opportunity = await writeOpportunity(lead, person.id, true, fieldMap);
  if (!opportunity.id) throw new Error('twenty_opportunity_failed');
  const customFieldsLanded = person.usedCustomFields && opportunity.usedCustomFields;
  if (!customFieldsLanded) {
    try {
      await writeAttributionNote(lead, person.id, opportunity.id);
    } catch (error) {
      const code = error instanceof Error ? error.message : 'twenty_note_failed';
      logWarning('lead_twenty_note_skipped', code);
    }
  }
  return true;
}

function intakeCredentials() {
  const endpoint = process.env.FORM_INTAKE_ENDPOINT || DEFAULT_FORM_INTAKE_ENDPOINT;
  const token = process.env.FORM_INTAKE_TOKEN
    || process.env.PUBLIC_CUTOVER_FORMS_TOKEN
    || process.env.PUBLIC_FORM_INTAKE_TOKEN;
  return { endpoint, token };
}

async function forwardToEstate(payload) {
  const { endpoint, token } = intakeCredentials();
  if (!endpoint || !token) throw new Error('intake_not_configured');

  let parsed;
  try {
    parsed = new URL(endpoint);
  } catch {
    throw new Error('invalid_intake_endpoint');
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('invalid_intake_endpoint');
  }

  return fetchWithTimeout(endpoint, {
    method: 'POST',
    redirect: 'error',
    headers: {
      'Content-Type': 'application/json',
      'X-Forms-Token': token,
    },
    body: JSON.stringify(payload),
  }, UPSTREAM_TIMEOUT_MS);
}

async function tryTwenty(lead) {
  if (!process.env.TWENTY_API_KEY) {
    logWarning('lead_twenty_skipped', 'twenty_api_key_unset');
    return false;
  }
  try {
    return await writeToTwenty(lead);
  } catch (error) {
    const code = error instanceof Error ? error.message : 'twenty_failed';
    logFailure('lead_twenty_failure', code);
    return false;
  }
}

async function tryForward(payload) {
  try {
    const upstream = await forwardToEstate(payload);
    if (!upstream.ok) {
      logFailure('lead_forward_failure', 'forward_http_error');
      return false;
    }
    return true;
  } catch (error) {
    const code = error instanceof Error ? error.message : 'forward_failed';
    logFailure('lead_forward_failure', code);
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method_not_allowed' });

  const contentLength = Number(getHeader(req, 'content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return send(res, 413, { ok: false, error: 'request_too_large' });

  const origin = getHeader(req, 'origin');
  if (!isAllowedOrigin(origin)) {
    return send(res, 403, { ok: false, error: 'origin_not_allowed' });
  }

  let payload;
  let lead;
  try {
    payload = parseBody(req);
    lead = extractLead(payload);
  } catch (error) {
    if (error instanceof Error && error.message === 'body_too_large') {
      return send(res, 413, { ok: false, error: 'request_too_large' });
    }
    return send(res, 400, { ok: false, error: 'invalid_submission' });
  }

  const [twentyOk, forwardOk] = await Promise.all([
    tryTwenty(lead),
    tryForward(payload),
  ]);

  if (twentyOk || forwardOk) return send(res, 200, { ok: true });
  return send(res, 502, { ok: false, error: 'lead_not_delivered' });
}

export const __test = {
  extractLead,
  readFieldMap,
  mappedAttributionFields,
  buildPersonPayload,
  buildOpportunityPayload,
  buildAttributionNote,
  isAllowedOrigin,
  parseAllowedOrigins,
  DEFAULT_FIELD_MAP,
};
