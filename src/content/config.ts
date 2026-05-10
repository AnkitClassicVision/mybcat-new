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
    isPillar: z.boolean().default(false),
    redirectTo: z.string().optional().transform((value) => value?.trim() || undefined),
    // SEO overrides
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonical: z.string().optional().transform((value) => value?.trim() || undefined),
    // Optional structured-data schemas. Emitted as JSON-LD by Blog.astro when present.
    howToSchema: z
      .object({
        name: z.string(),
        description: z.string(),
        totalTime: z.string().optional(),
        estimatedCost: z
          .object({ value: z.string(), currency: z.string() })
          .optional(),
        image: z.string().optional(),
        steps: z.array(
          z.object({
            name: z.string(),
            text: z.string(),
            url: z.string().optional(),
            image: z.string().optional(),
          })
        ),
      })
      .optional(),
    faqSchema: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
  }),
});

export const collections = { blog };
