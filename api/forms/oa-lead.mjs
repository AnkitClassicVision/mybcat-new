const MAX_BODY_BYTES = 32_768;
const RESEND_TIMEOUT_MS = 8_000;
const UPSTREAM_TIMEOUT_MS = 5_000;
const DEFAULT_LEAD_EMAIL_TO = 'ankit@mybcat.com';
const DEFAULT_ALLOWED_ORIGINS = new Set([
  'https://mybcat.com',
  'https://www.mybcat.com',
]);

const ALLOWED_FIELDS = new Set([
  'company',
  'practice',
  'firstname',
  'website',
  'email',
  'mobilephone',
  'message',
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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTEXT_KEYS = new Set(['pageUri', 'page_url', 'pageName', 'source']);

function send(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
}

function getHeader(req, name) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function logFailure(code) {
  console.error(JSON.stringify({ event: 'oa_lead_failure', code }));
}

function parseAllowedOrigins() {
  const configured = (process.env.ALLOWED_FORM_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const origins = new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:4321');
    origins.add('http://127.0.0.1:4321');
  }
  return origins;
}

function isVercelPreviewOrigin(origin) {
  try {
    const parsed = new URL(origin);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    return host.endsWith('.vercel.app') && host.includes('mybcat');
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin) {
  if (!origin || typeof origin !== 'string') return false;
  return parseAllowedOrigins().has(origin) || isVercelPreviewOrigin(origin);
}

function sanitizeLine(value, maxLen = 500) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, maxLen);
}

function parseBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    if (Buffer.byteLength(JSON.stringify(req.body), 'utf8') > MAX_BODY_BYTES) {
      throw new Error('body_too_large');
    }
    return req.body;
  }
  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body || '');
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    throw new Error('body_too_large');
  }
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('invalid_submission');
  }
  return parsed;
}

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
    values[name] = sanitizeLine(context[name], name === 'pageUri' || name === 'page_url' ? 1000 : 500);
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
  const practice = values.company || values.practice || values.firstname;
  if (!practice) throw new Error('missing_practice');
  if (values.email && !EMAIL_PATTERN.test(values.email)) throw new Error('invalid_email');

  return {
    practice,
    website: values.website || '',
    email: values.email || '',
    phone: values.mobilephone || '',
    message: values.message || '',
    requestedMeeting: values.requested_meeting || '',
    utmSource: values.utm_source || '',
    utmMedium: values.utm_medium || '',
    utmCampaign: values.utm_campaign || '',
    utmContent: values.utm_content || '',
    pageUrl: values.page_url || values.pageUri || '',
    pageName: values.pageName || '',
    source: values.source || '',
  };
}

function formatTimestampEt(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(date);
}

function buildEmailText(lead, userAgent, timestamp) {
  return [
    'New Optometry Analysis lead',
    '',
    `Practice: ${lead.practice}`,
    `Website: ${lead.website || '(not provided)'}`,
    `Email: ${lead.email || '(not provided)'}`,
    `Phone: ${lead.phone || '(not provided)'}`,
    `Requested meeting: ${lead.requestedMeeting || '(not provided)'}`,
    `Message: ${lead.message || '(not provided)'}`,
    `UTM source: ${lead.utmSource || '(none)'}`,
    `UTM medium: ${lead.utmMedium || '(none)'}`,
    `UTM campaign: ${lead.utmCampaign || '(none)'}`,
    `UTM content: ${lead.utmContent || '(none)'}`,
    `Page URL: ${lead.pageUrl || '(not provided)'}`,
    `Page name: ${lead.pageName || '(not provided)'}`,
    `Source: ${lead.source || '(not provided)'}`,
    `Timestamp (ET): ${timestamp}`,
    `User agent: ${userAgent || '(not provided)'}`,
  ].join('\n');
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

function addressFromHeader(value) {
  const trimmed = String(value || '').trim();
  const angled = trimmed.match(/<([^>]+)>\s*$/);
  return (angled ? angled[1] : trimmed).trim();
}

async function sendResendEmail({ to, from, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('resend_not_configured');
  if (!EMAIL_PATTERN.test(addressFromHeader(from))) {
    throw new Error('resend_from_invalid');
  }

  const response = await fetchWithTimeout('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
    }),
  }, RESEND_TIMEOUT_MS);

  if (!response.ok) throw new Error('resend_failed');
  return response;
}

function intakeCredentials() {
  const endpoint = process.env.FORM_INTAKE_ENDPOINT;
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

async function tryEmail(lead, userAgent) {
  try {
    const to = sanitizeLine(process.env.LEAD_EMAIL_TO || DEFAULT_LEAD_EMAIL_TO, 200);
    const from = sanitizeLine(process.env.LEAD_EMAIL_FROM || '', 200);
    if (!EMAIL_PATTERN.test(to)) throw new Error('resend_to_invalid');
    await sendResendEmail({
      to,
      from,
      subject: `[MyBCAT] Optometry Analysis lead — ${lead.practice}`,
      text: buildEmailText(lead, userAgent, formatTimestampEt()),
    });
    return true;
  } catch (error) {
    const code = error instanceof Error ? error.message : 'email_failed';
    logFailure(code);
    return false;
  }
}

async function tryForward(payload) {
  try {
    const upstream = await forwardToEstate(payload);
    if (!upstream.ok) {
      logFailure('forward_http_error');
      return false;
    }
    return true;
  } catch (error) {
    const code = error instanceof Error ? error.message : 'forward_failed';
    logFailure(code);
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

  const userAgent = sanitizeLine(getHeader(req, 'user-agent') || '', 400);
  const [emailOk, forwardOk] = await Promise.all([
    tryEmail(lead, userAgent),
    tryForward(payload),
  ]);

  if (emailOk || forwardOk) return send(res, 200, { ok: true });
  return send(res, 502, { ok: false, error: 'lead_not_delivered' });
}

export const __test = {
  extractLead,
  formatTimestampEt,
  buildEmailText,
  isAllowedOrigin,
  parseAllowedOrigins,
  sendResendEmail,
};
