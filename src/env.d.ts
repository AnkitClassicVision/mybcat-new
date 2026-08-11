/* eslint-disable @typescript-eslint/triple-slash-reference */
/// <reference path="../.astro/types.d.ts" />

interface Window {
  MyBCATAttribution?: {
    snapshot(overrides?: { content_cluster?: string; cta_id?: string }): {
      attribution_id: string;
      first_touch: Record<string, string>;
      last_touch: Record<string, string>;
      content_cluster: string;
      cta_id: string;
    };
    emit(eventName: string, detail?: Record<string, string>): boolean;
  };
}
