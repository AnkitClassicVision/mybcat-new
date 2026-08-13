import path from 'node:path';

const SAFE_SEO_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isSafeSeoSlug(value) {
  return typeof value === 'string' && SAFE_SEO_SLUG.test(value);
}

export function resolveWithin(root, relativePath) {
  if (typeof relativePath !== 'string' || !relativePath || path.isAbsolute(relativePath)) return null;
  const resolvedRoot = path.resolve(root);
  const candidate = path.resolve(resolvedRoot, relativePath);
  const relative = path.relative(resolvedRoot, candidate);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return candidate;
}
