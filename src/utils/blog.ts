/**
 * Blog utility functions
 * Centralized logic for post visibility and filtering
 */

import type { CollectionEntry } from 'astro:content';

/**
 * Check if a blog post should be visible on the site
 *
 * A post is visible only when status is 'published' and publishDate is
 * in the past or today. A scheduled post stays off the site until the
 * publisher commits status: published. A past scheduledDate must not
 * make the page public, or a rebuild releases it while main still says
 * scheduled.
 */
export function isPostVisible(data: CollectionEntry<'blog'>['data']): boolean {
  const now = new Date();

  // Posts with redirectTo should not be rendered as standalone pages
  if (data.redirectTo) {
    return false;
  }

  if (data.status === 'published') {
    // Published posts must have a past or current publishDate.
    return data.publishDate <= now;
  }

  return false;
}

/**
 * Filter function for getCollection that only returns visible posts
 * Usage: getCollection('blog', isVisiblePost)
 */
export function isVisiblePost({ data }: { data: CollectionEntry<'blog'>['data'] }): boolean {
  return isPostVisible(data);
}
