import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

/**
 * Get the PostHog server-side client.
 * Uses a singleton pattern to avoid creating multiple clients.
 * Configured with flushAt 1 / flushInterval 0 so every API-route capture
 * is sent immediately before the short-lived handler returns.
 */
export function getPostHogServer(): PostHog | null {
  const token = import.meta.env.PUBLIC_POSTHOG_PROJECT_TOKEN;
  const host = import.meta.env.PUBLIC_POSTHOG_HOST;

  if (!token) {
    // Guard: in dev mode, warn once about missing config
    if (import.meta.env.DEV) {
      console.warn(
        'PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, ' +
        'this causes events to be silently missed. This error stops appearing once ' +
        'PUBLIC_POSTHOG_PROJECT_TOKEN is configured'
      );
    }
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(token, {
      host: host || 'https://us.i.posthog.com',
      // Flush immediately — API routes are short-lived per request
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return posthogClient;
}

/**
 * Gracefully shut down the PostHog client.
 * Call this when your server is shutting down.
 */
export async function shutdownPostHog(): Promise<void> {
  if (posthogClient) {
    await posthogClient.shutdown();
    posthogClient = null;
  }
}
