/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />

interface Window {
  MYBCAT_FORM_TOKEN?: string;
  posthog?: { capture: (event: string, properties?: Record<string, unknown>) => void };
}