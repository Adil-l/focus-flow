import type { PostHog } from 'posthog-js';

// Thin, vendor-swappable analytics wrapper. No-ops entirely unless a PostHog key
// is configured (VITE_POSTHOG_KEY). posthog-js is loaded with a DYNAMIC import so
// its weight ships only when analytics is actually enabled. Autocapture is OFF —
// we only send the explicit, named events below.

const KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://eu.i.posthog.com';

let client: PostHog | null = null;
// Buffer the most recent calls made before the async init resolves.
const pending: Array<(ph: PostHog) => void> = [];

export async function initAnalytics() {
  if (!KEY || client) return;
  const { default: posthog } = await import('posthog-js');
  posthog.init(KEY, {
    api_host: HOST,
    autocapture: false,
    capture_pageview: false,
    person_profiles: 'identified_only',
  });
  client = posthog;
  pending.splice(0).forEach((fn) => fn(posthog));
}

function withClient(fn: (ph: PostHog) => void) {
  if (!KEY) return;
  if (client) fn(client);
  else pending.push(fn);
}

export function track(event: string, props?: Record<string, unknown>) {
  withClient((ph) => ph.capture(event, props));
}

export function identify(id: string, props?: Record<string, unknown>) {
  withClient((ph) => ph.identify(id, props));
}

export function resetAnalytics() {
  withClient((ph) => ph.reset());
}
