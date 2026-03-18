/**
 * Blog utility functions
 * Centralized logic for post visibility and filtering
 */

import type { CollectionEntry } from 'astro:content';

/**
 * Check if a blog post should be visible on the site
 *
 * A post is visible if:
 * 1. status is 'published' AND publishDate is in the past/today
 * 2. status is 'scheduled' AND scheduledDate is in the past/today
 *
 * This prevents future-dated posts from appearing on the site
 * even if they're accidentally marked as 'published'.
 */
export function isPostVisible(data: CollectionEntry<'blog'>['data']): boolean {
  const now = new Date();

  // Posts with redirectTo should not be rendered as standalone pages
  if (data.redirectTo) {
    return false;
  }

  if (data.status === 'published') {
    // Published posts must have a past/current publishDate
    return data.publishDate <= now;
  }

  if (data.status === 'scheduled' && data.scheduledDate) {
    // Scheduled posts become visible when scheduledDate passes
    return new Date(data.scheduledDate) <= now;
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
