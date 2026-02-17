import type { APIRoute } from 'astro';
import { company } from '@data/company';
import { caseStudies } from '@data/case-studies';

export const prerender = true;

export const GET: APIRoute = () => {
  const items = caseStudies.map((caseStudy) => ({
    slug: caseStudy.slug,
    title: caseStudy.title,
    client: caseStudy.client,
    industry: caseStudy.industry,
    industrySlug: caseStudy.industrySlug,
    location: caseStudy.location,
    practiceSize: caseStudy.practiceSize,
    challenge: caseStudy.challenge,
    solution: caseStudy.solution,
    implementation: caseStudy.implementation,
    results: caseStudy.results,
    metrics: caseStudy.metrics,
    testimonial: caseStudy.testimonial,
    timeline: caseStudy.timeline,
    featuredImage: caseStudy.featuredImage,
    relatedSolutions: caseStudy.relatedSolutions,
    url: `${company.site.url}/case-studies/${caseStudy.slug}/`,
  }));

  return new Response(JSON.stringify({ items }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};

