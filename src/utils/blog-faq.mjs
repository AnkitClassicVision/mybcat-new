/**
 * Blog post FAQ: the frontmatter schema and the helpers the Blog layout uses.
 * Plain JavaScript so the unit tests can import it without the Astro runtime.
 */
import { z } from 'astro/zod';

/** One visible question and its answer. Unknown keys are rejected. */
export const faqItemSchema = z
  .object({
    question: z.string().trim().min(1),
    answer: z.string().trim().min(1),
  })
  .strict();

/** The `faqs` frontmatter field: up to six items, empty when absent. */
export const faqsSchema = z.array(faqItemSchema).max(6).default([]);

const FAQPAGE_TYPE = /"@type"\s*:\s*"FAQPage"/;

/** True when the post body embeds its own FAQPage JSON-LD. */
export function bodyHasFaqSchema(body) {
  return FAQPAGE_TYPE.test(String(body || ''));
}

/** Split rendered post HTML just before the Sources heading. Returns [before, from Sources on]. */
export function splitBeforeSources(html) {
  const text = String(html || '');
  const at = text.search(/<h2\b[^>]*\bid="sources"/i);
  return at < 0 ? [text, ''] : [text.slice(0, at), text.slice(at)];
}
