import fs from 'node:fs';
import path from 'node:path';

const WIDTHS = [400, 800, 1200] as const;

const cache = new Map<string, string | null>();

/**
 * Build a srcset string from existing width-suffixed variants in /public.
 *
 * Source-of-truth: `featuredImage` from frontmatter is canonical
 * (used for og:image, schema.org, RSS). Variants are predictable
 * siblings generated offline by scripts/generate-image-variants.js
 * (e.g. foo-400.webp, foo-800.webp, foo-1200.webp). This helper
 * picks only variants that actually exist on disk so srcset never
 * lists a 404.
 *
 * Returns null if no variants are present (caller should fall back
 * to the canonical single-source <img>).
 */
export function getResponsiveSrcset(featuredImage: string | undefined | null): string | null {
  if (!featuredImage) return null;
  if (cache.has(featuredImage)) return cache.get(featuredImage) ?? null;

  const ext = featuredImage.match(/\.(webp|jpg|jpeg|png)$/i)?.[0];
  if (!ext) {
    cache.set(featuredImage, null);
    return null;
  }
  const base = featuredImage.slice(0, -ext.length);

  const entries: string[] = [];
  for (const w of WIDTHS) {
    const variantUrl = `${base}-${w}.webp`;
    const fsPath = path.join('public', variantUrl);
    if (fs.existsSync(fsPath)) {
      entries.push(`${variantUrl} ${w}w`);
    }
  }

  const srcset = entries.length > 0 ? entries.join(', ') : null;
  cache.set(featuredImage, srcset);
  return srcset;
}
