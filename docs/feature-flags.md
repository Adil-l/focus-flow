# Feature flags registry

Three independent axes decide what a user sees. Keep them separate.

| Axis | Source of truth | Where | Notes |
| --- | --- | --- | --- |
| **Entitlement (Plus)** | Server: `subscriptions` table via Stripe webhook + RLS | `useSubscription` → `usePremium` / `PremiumGate` | Permission flag — never expires, never a cleanup candidate. Client checks are UX only. |
| **Catalog (`plus` data)** | Static config | `SOUNDS[].premium` in `SoundsPanel`, future `themes`/fonts | Declarative data marks an item as Plus-only. Gate off the data field, never a hardcoded id list at the call site. |
| **Client flags** | Env (`VITE_*`) | `src/lib/flags.ts` | Kill-switches + beta toggles below. |

## Registered client flags

| Flag | Env var | Default | Type | Owner | Remove by |
| --- | --- | --- | --- | --- | --- |
| `killSpotify` | `VITE_KILL_SPOTIFY` | off | kill-switch | eng | — (permanent safety) |
| `killBinaural` | `VITE_KILL_BINAURAL` | off | kill-switch | eng | — (permanent safety) |
| `aiCoach` | `VITE_FLAG_AI_COACH` | off | beta | eng | when AI coach (Phase F) ships GA |

## Rules

- **Kill-switches are permanent** safety valves for third-party integrations (Spotify embed, external/CDN audio). They don't expire.
- **Beta flags are debt**: they need an owner and a removal date, and must be deleted once the feature is GA.
- Add any new flag here in the same PR that introduces it.
