// Lightweight client flags. This is NOT entitlement — premium access is decided
// by the server (Stripe webhook + RLS) and read via usePremium/useSubscription.
// Use these only for:
//   - kill-switches: hard-disable a flaky third-party integration for everyone
//   - beta/new feature toggles
// Each flag is env-driven (VITE_*) so it ships per-build. Register every flag in
// docs/feature-flags.md with an owner and a removal date.

const env = import.meta.env;
const on = (v: string | undefined) => v === '1' || v === 'true';

export const flags = {
  /** Kill-switch: hide the Spotify/embed music integration if it breaks. */
  killSpotify: on(env.VITE_KILL_SPOTIFY),
  /** Kill-switch: hide binaural beats (external/CDN audio). */
  killBinaural: on(env.VITE_KILL_BINAURAL),
  /** Beta: AI focus-coach feature (Phase F). */
  aiCoach: on(env.VITE_FLAG_AI_COACH),
} as const;

export type Flags = typeof flags;
