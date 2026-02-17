import type { APIRoute } from 'astro';
import { company } from '@data/company';
import { solutions } from '@data/solutions';

export const prerender = true;

export const GET: APIRoute = () => {
  const items = solutions.map((solution) => ({
    slug: solution.slug,
    name: solution.name,
    tagline: solution.tagline,
    headline: solution.headline,
    description: solution.description,
    tldr: solution.tldr,
    metaDescription: solution.metaDescription,
    serviceType: solution.serviceType,
    url: `${company.site.url}/solutions/${solution.slug}/`,
    problem: solution.problem,
    features: solution.features,
    benefits: solution.benefits,
    process: solution.process,
    stats: solution.stats,
  }));

  return new Response(JSON.stringify({ items }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};

