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
    ctaTheme: z.enum(['recall_fill_book', 'finances_selling', 'finance_open', 'finance_profit', 'finance_seller', 'acquisition_transition', 'practice_finance', 'ai_projects', 'operations', 'default']).optional(),
    // Visible FAQ rendered by the shared FAQ component after the post body. The
    // component emits the page's FAQPage JSON-LD, so each answer must restate the post.
    faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).max(6).default([]),
    // Attribution and editorial proof contract for the separate service and
    // practice-transition funnels. Existing posts remain service content unless
    // their frontmatter explicitly opts into the acquisition funnel.
    funnel: z.enum(['service', 'acquisition']).default('service'),
    seoTopicId: z.string().optional().transform((value) => value?.trim() || undefined),
    buyerStage: z.enum(['awareness', 'problem-aware', 'consideration', 'solution-aware', 'decision']).optional(),
    contentAction: z.enum(['new', 'refresh']).optional(),
    ctaId: z.string().optional().transform((value) => value?.trim() || undefined),
    intendedCrmOutcome: z.string().optional().transform((value) => value?.trim() || undefined),
    evidencePacket: z.string().optional().transform((value) => value?.trim() || undefined),
    researchReviewed: z.boolean().default(false),
    cannibalizationReviewed: z.boolean().default(false),
    claimsReviewed: z.boolean().default(false),
    isPillar: z.boolean().default(false),
    redirectTo: z.string().optional().transform((value) => value?.trim() || undefined),
    // SEO overrides
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    canonical: z.string().optional().transform((value) => value?.trim() || undefined),
  }),
});

export const collections = { blog };
