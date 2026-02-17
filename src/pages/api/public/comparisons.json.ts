import type { APIRoute } from 'astro';
import { company } from '@data/company';
import { competitors } from '@data/competitors';

export const prerender = true;

export const GET: APIRoute = () => {
  const items = competitors.map((competitor) => ({
    slug: competitor.slug,
    name: competitor.name,
    tagline: competitor.tagline,
    headline: competitor.headline,
    description: competitor.description,
    metaDescription: competitor.metaDescription,
    pricing: competitor.pricing,
    model: competitor.model,
    website: competitor.website,
    url: `${company.site.url}/compare/${competitor.slug}/`,
    features: competitor.features,
    advantages: competitor.advantages,
    competitorStrengths: competitor.competitorStrengths,
    bestFor: competitor.bestFor,
    differentiators: competitor.differentiators,
    faqs: competitor.faqs,
  }));

  return new Response(JSON.stringify({ items }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};

