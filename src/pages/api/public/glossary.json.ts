import type { APIRoute } from 'astro';
import { company } from '@data/company';
import { glossaryTerms } from '@data/glossary';

export const prerender = true;

export const GET: APIRoute = () => {
  const items = glossaryTerms.map((term) => ({
    slug: term.slug,
    term: term.term,
    definition: term.definition,
    detailedExplanation: term.detailedExplanation,
    category: term.category,
    relatedTerms: term.relatedTerms,
    relatedSolutions: term.relatedSolutions,
    examples: term.examples,
    url: `${company.site.url}/glossary/${term.slug}/`,
  }));

  return new Response(JSON.stringify({ items }, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
};

