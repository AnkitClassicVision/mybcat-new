const MAX_BODY_BYTES = 32_768;
const DEFAULT_ALLOWED_ORIGINS = new Set([
  'https://mybcat.com',
  'https://www.mybcat.com',
]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function send(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  return res.status(status).json(body);
}

function getHeader(req, name) {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
}

function logFailure(event, code) {
  console.error(JSON.stringify({ event, code }));
}

function logWarning(event, code) {
  console.warn(JSON.stringify({ event, code }));
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
  let cleaned = '';
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const isControl = (code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 127;
    if (!isControl) cleaned += char;
  }
  return cleaned.trim().slice(0, maxLen);
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

export {
  MAX_BODY_BYTES,
  EMAIL_PATTERN,
  send,
  getHeader,
  logFailure,
  logWarning,
  parseAllowedOrigins,
  isVercelPreviewOrigin,
  isAllowedOrigin,
  sanitizeLine,
  parseBody,
};
