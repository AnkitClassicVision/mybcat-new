import { createHash } from 'node:crypto';

const MAX_BODY_BYTES = 32_768;
const UPSTREAM_TIMEOUT_MS = 8_000;
const DEFAULT_ALLOWED_ORIGINS = new Set([
  'https://mybcat.com',
  'https://www.mybcat.com',
]);

const FIELD_RULES = {
  service: {
    formId: 'service-intake-v1',
    pagePath: '/contact/',
    contentCluster: 'optometry-patient-access',
    ctaId: 'service-fit-review',
    required: ['firstname', 'lastname', 'email'],
    allowed: new Set([
      'firstname', 'lastname', 'email', 'mobilephone', 'website',
      'number_of_locations', 'specialty', 'role', 'operating_problem', 'timeline',
    ]),
  },
  acquisition: {
    formId: 'acquisition-intake-v1',
    pagePath: '/optometry-practice-transitions/',
    contentCluster: 'optometry-practice-transitions',
    ctaId: 'confidential-seller-inquiry',
    required: [
      'firstname', 'lastname', 'email', 'state', 'number_of_locations',
      'transition_horizon', 'confidentiality_consent',
    ],
    allowed: new Set([
      'firstname', 'lastname', 'email', 'mobilephone', 'state',
      'number_of_locations', 'transition_horizon', 'post_sale_involvement',
      'confidentiality_consent', 'service_interest_consent',
    ]),
  },
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ATTRIBUTION_ID_PATTERN = /^[A-Za-z0-9-]{16,100}$/;
const ALLOWED_SOURCES = new Set([
  'direct', 'google', 'bing', 'duckduckgo', 'yahoo', 'linkedin', 'facebook',
  'instagram', 'newsletter', 'referral', 'organic', 'email', 'partner', 'other',
]);
const ALLOWED_MEDIA = new Set([
  'none', 'organic', 'referral', 'email', 'social', 'paid-search', 'cpc', 'ppc',
  'display', 'partner', 'other',
]);

function send(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
}

function getHeader(req, name) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
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

function parseBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body || '');
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) {
    throw new Error('body_too_large');
  }
  return JSON.parse(raw);
}

function normalizedFields(rawFields, rules) {
  if (!Array.isArray(rawFields) || rawFields.length > 20) {
    throw new Error('invalid_fields');
  }

  const seen = new Set();
  const fields = rawFields.map((field) => {
    const name = typeof field?.name === 'string' ? field.name.trim() : '';
    const rawValue = typeof field?.value === 'string' ? field.value.trim() : '';
    if (!rules.allowed.has(name) || seen.has(name) || rawValue.length > 500) {
      throw new Error('invalid_fields');
    }
    seen.add(name);
    return {
      objectTypeId: name === 'website' ? '0-2' : '0-1',
      name,
      value: rawValue,
    };
  });

  const byName = Object.fromEntries(fields.map((field) => [field.name, field.value]));
  if (rules.required.some((name) => !byName[name])) {
    throw new Error('missing_required_fields');
  }
  if (!EMAIL_PATTERN.test(byName.email)) {
    throw new Error('invalid_email');
  }
  return { fields, byName };
}

function cleanPath(value) {
  if (typeof value !== 'string') return '';
  try {
    const parsed = new URL(value, 'https://mybcat.com');
    const path = parsed.pathname.replace(/\/{2,}/g, '/').slice(0, 300);
    return path.startsWith('/') ? path : '';
  } catch {
    return '';
  }
}

function cleanCampaign(value) {
  if (!value) return '';
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';
  if (normalized === 'unapproved-campaign') return normalized;
  const approved = new Set((process.env.SEO_CAMPAIGN_ALLOWLIST || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean));
  return approved.has(normalized) ? normalized : 'unapproved-campaign';
}

function cleanTouch(value) {
  if (!value || typeof value !== 'object') throw new Error('invalid_attribution');
  const source = typeof value.source === 'string' ? value.source.trim().toLowerCase() : '';
  const medium = typeof value.medium === 'string' ? value.medium.trim().toLowerCase() : '';
  return {
    source: ALLOWED_SOURCES.has(source) ? source : 'other',
    medium: ALLOWED_MEDIA.has(medium) ? medium : 'other',
    campaign: cleanCampaign(value.campaign),
    landing_page: cleanPath(value.landing_page),
  };
}

function cleanPayload(input) {
  const funnel = input?.funnel;
  const rules = FIELD_RULES[funnel];
  if (!rules || input?.form_id !== rules.formId || input?.schema_version !== 'seo-intake.v1') {
    throw new Error('invalid_contract');
  }

  const { fields, byName } = normalizedFields(input.fields, rules);
  if (funnel === 'acquisition' && byName.confidentiality_consent !== 'yes') {
    throw new Error('confidentiality_consent_required');
  }

  const attribution = input.attribution;
  if (!attribution || !ATTRIBUTION_ID_PATTERN.test(attribution.attribution_id || '')) {
    throw new Error('invalid_attribution');
  }
  if (attribution.content_cluster !== rules.contentCluster || attribution.cta_id !== rules.ctaId) {
    throw new Error('invalid_attribution');
  }

  const requestedScopes = Array.isArray(input.consent?.scopes)
    ? input.consent.scopes.filter((scope) => typeof scope === 'string').slice(0, 5)
    : [];
  const serviceConsent = funnel === 'acquisition' && byName.service_interest_consent === 'yes';
  const scopes = funnel === 'service'
    ? ['business_inquiry_processing']
    : ['confidential_acquisition_inquiry', ...(serviceConsent ? ['service_marketing'] : [])];
  if (requestedScopes.some((scope) => !scopes.includes(scope))) {
    throw new Error('invalid_consent_scope');
  }

  const pagePath = cleanPath(input.context?.pagePath);
  if (pagePath !== rules.pagePath) throw new Error('invalid_context');
  const context = {
    pagePath,
    pageName: funnel === 'service' ? 'MyBCAT service inquiry' : 'MyBCAT confidential acquisition inquiry',
  };
  const cleaned = {
    schema_version: 'seo-intake.v1',
    form_id: rules.formId,
    funnel,
    fields,
    context,
    attribution: {
      attribution_id: attribution.attribution_id,
      first_touch: cleanTouch(attribution.first_touch),
      last_touch: cleanTouch(attribution.last_touch),
      content_cluster: rules.contentCluster,
      cta_id: rules.ctaId,
    },
    consent: {
      scopes,
      timestamp: typeof input.consent?.timestamp === 'string' ? input.consent.timestamp.slice(0, 40) : '',
    },
    crm: {
      canonical: false,
      target_pipeline: funnel === 'service' ? 'mybcat-service-sales' : 'optometry-acquisitions',
      target_stage: funnel === 'service' ? 'new-inbound' : 'confidential-inquiry',
      routing_status: 'pending-canonical-gate',
    },
    qualification: {
      owner: 'ankit',
      decision: 'pending-review',
      reason: '',
      decision_date: '',
      proof_references: [],
      confidence: null,
    },
  };

  const stableKeyInput = JSON.stringify({ funnel, fields });
  cleaned.idempotency_key = createHash('sha256').update(stableKeyInput).digest('hex');
  return cleaned;
}

async function forwardToEstate(payload) {
  const endpoint = process.env.FORM_INTAKE_ENDPOINT;
  const token = process.env.FORM_INTAKE_TOKEN;
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    return await fetch(endpoint, {
      method: 'POST',
      redirect: 'error',
      headers: {
        'Content-Type': 'application/json',
        'X-Forms-Token': token,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { ok: false, error: 'method_not_allowed' });

  const contentLength = Number(getHeader(req, 'content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return send(res, 413, { ok: false, error: 'request_too_large' });

  const origin = getHeader(req, 'origin');
  if (!origin || !parseAllowedOrigins().has(origin)) {
    return send(res, 403, { ok: false, error: 'origin_not_allowed' });
  }

  let payload;
  try {
    payload = cleanPayload(parseBody(req));
  } catch {
    return send(res, 400, { ok: false, error: 'invalid_submission' });
  }

  try {
    const upstream = await forwardToEstate(payload);
    if (!upstream.ok) return send(res, 502, { ok: false, error: 'intake_unavailable' });
    return send(res, 200, { ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'intake_not_configured') {
      return send(res, 503, { ok: false, error: 'intake_not_configured' });
    }
    return send(res, 502, { ok: false, error: 'intake_unavailable' });
  }
}

export const __test = { cleanPayload, parseAllowedOrigins };
