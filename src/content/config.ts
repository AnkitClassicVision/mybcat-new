import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    modifiedDate: z.coerce.date().optional(),
    scheduledDate: z.coerce.date().optional(),
    status: z.enum(['published', 'draft', 'scheduled']).default('draft'),
    author: z.string().default('Ankit Patel'),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    featuredImage: z.string().optional().transform((value) => value?.trim() || undefined),
    ogImage: z.string().optional().transform((value) => value?.trim() || undefined),
    relatedPosts: z.array(z.string()).default([]),
    // Content clustering & pillar page support
    cluster: z.string().optional(),
    // Explicit CTA variant override — wins over cluster-based routing (see src/data/blog-ctas.ts).
    // Use 'default' for off-ICP posts (e.g. dental-bodied content) that share a themed cluster.
    ctaTheme: z.enum(['recall_fill_book', 'finances_selling', 'operations', 'default']).optional(),
    isPillar: z.boolean().default(false),
    redirectTo: z.string().optional().transform((value) => value?.trim() || undefined),
    // SEO overrides
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonical: z.string().optional().transform((value) => value?.trim() || undefined),
  }),
});

export const collections = { blog };
