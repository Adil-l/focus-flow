# Focus Flow

A polished Pomodoro / focus-timer web app: multiple timer modes, tasks, goals,
gamification (XP, levels, achievements), heatmap, notepad, themeable
video/image backgrounds, Supabase auth and optional cross-device cloud sync.

Built with **React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Supabase**.

## Getting started

```sh
npm install
npm run dev      # start the dev server (Vite)
```

### Scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the local dev server                   |
| `npm run build`     | Production build                             |
| `npm run preview`   | Preview the production build                 |
| `npm run lint`      | Run ESLint                                   |
| `npm test`          | Run the unit tests (Vitest)                  |
| `npm run test:watch`| Run tests in watch mode                      |

## Environment

Copy `.env` and set the following (all are public, client-side keys):

```dotenv
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SPOTIFY_CLIENT_ID=...
VITE_STRIPE_PUBLIC_KEY=...
```

## Data & cloud sync

By default all state (settings, tasks, history, goals, gamification, notepad)
lives in `localStorage`, so the app works fully offline and signed-out.

When a user signs in, [`useCloudSync`](src/hooks/useCloudSync.ts) mirrors that
state to Supabase for cross-device sync:

- **On login** it pulls the cloud row into `localStorage` (and reloads once so
  the stores re-hydrate), or seeds the cloud from the current device on first login.
- **While signed in** it pushes a debounced snapshot whenever any slice changes.

### Applying the database schema

The sync table and its Row Level Security policies live in
[`supabase/migrations`](supabase/migrations). Apply it with the Supabase CLI:

```sh
supabase db push
```

…or paste the SQL from the latest migration into the Supabase SQL editor. RLS
ensures every user can only read and write their own row.

## Testing

Unit tests cover the pure logic (streak/stats calculations, level/achievement
rules, goal progress) and the timer hook. Run them with `npm test`.

## Notes

- The leaderboard panel currently shows **demo data** — a real leaderboard needs
  an opt-in cross-user aggregation view.
- `useTimer` has a small (~1s) start-of-phase drift worth tightening if precise
  long-run accuracy matters.
