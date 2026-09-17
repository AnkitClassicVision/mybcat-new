import type { APIRoute } from 'astro';
import { company } from '@data/company';
import { industries } from '@data/industries';

export const prerender = true;

export const GET: APIRoute = () => {
  const items = industries.map((industry) => ({
    slug: industry.slug,
    name: industry.name,
    shortName: industry.shortName,
    icon: industry.icon,
    headline: industry.headline,
    description: industry.description,
    descriptionCta: industry.descriptionCta,
    tldr: industry.tldr,
    metaDescription: industry.metaDescription,
    url: `${company.site.url}/industries/${industry.slug}/`,
    patientAcquisition: industry.patientAcquisition,
    painPoints: industry.painPoints,
    solutions: industry.solutions,
    primaryEHR: industry.primaryEHR,
    stats: industry.stats,
    testimonial: industry.testimonial,
  }));

  return new Response(JSON.stringify({ items }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};

