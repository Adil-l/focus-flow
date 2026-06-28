import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { fetchCloudState, seedCloudState, pushCloudState, type CloudState, type CloudStateWithMeta } from '@/lib/sync';

// localStorage keys owned by the app's stores. Everything is JSON except the
// notepad, which is stored as a raw string.
const KEYS = {
  settings: 'pomo:settings',
  goals: 'pomo:goals',
  gamification: 'pomo:gamification',
  tasks: 'pomo:tasks',
  history: 'pomo:history',
  presets: 'pomo:presets',
} as const;
const NOTEPAD_KEY = 'pomo:notepad';
const SYNCED_FLAG = 'pomo:cloud-synced'; // sessionStorage: holds the user id once hydrated
const SINCE_KEY = 'pomo:cloud-since';    // sessionStorage: last seen cloud updated_at (sync baseline)

const hasContent = (v: unknown): boolean =>
  Array.isArray(v) ? v.length > 0 : !!v && typeof v === 'object' && Object.keys(v).length > 0;

/** Copy a freshly-fetched cloud state into localStorage so the stores read it on next mount. */
function hydrateLocal(remote: Partial<CloudState>) {
  for (const [field, key] of Object.entries(KEYS) as [keyof typeof KEYS, string][]) {
    const value = remote[field];
    // Arrays may legitimately be empty; objects must have content to avoid
    // clobbering a store's defaults with `{}`.
    if (Array.isArray(value) || hasContent(value)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
  if (typeof remote.notepad === 'string') {
    localStorage.setItem(NOTEPAD_KEY, remote.notepad);
  }
}

interface CloudSyncInput {
  user: User | null;
  loading: boolean;
  settings: unknown;
  goals: unknown;
  gamification: unknown;
  tasks: unknown[];
  history: unknown[];
  presets: unknown[];
  notepad: string;
}

/**
 * Two-way bridge between the local stores and Supabase:
 *  - On login: pull the cloud row (if any) into localStorage and reload once so
 *    the stores re-hydrate; otherwise seed the cloud from the current local data.
 *  - While signed in: push a debounced snapshot whenever any slice changes.
 */
export function useCloudSync({ user, loading, settings, goals, gamification, tasks, history, presets, notepad }: CloudSyncInput) {
  // "ready" means the initial pull/seed finished and it's safe to push changes.
  const [ready, setReady] = useState(false);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The cloud updated_at we last observed — used as the precondition for pushes
  // so a stale local snapshot can't clobber newer data from another device.
  const lastSeen = useRef<string | null>(null);

  // Pull-on-login / seed-on-first-login.
  useEffect(() => {
    // Auth hasn't settled yet. Do NOTHING — in particular, don't clear the
    // synced flag. `user` is briefly null while the session loads, and clearing
    // the flag here makes the post-hydrate guard miss on the next render, which
    // re-triggers hydrate→reload forever (an auto-reload loop).
    if (loading) return;

    if (!user) {
      sessionStorage.removeItem(SYNCED_FLAG);
      setReady(false);
      return;
    }

    // Already hydrated for this user in this session (e.g. just after a reload).
    if (sessionStorage.getItem(SYNCED_FLAG) === user.id) {
      lastSeen.current = sessionStorage.getItem(SINCE_KEY);
      setReady(true);
      return;
    }

    let cancelled = false;
    (async () => {
      let remote: CloudStateWithMeta | null;
      try {
        remote = await fetchCloudState(user.id);
      } catch {
        // Transient error fetching cloud state — do NOT seed/overwrite the
        // cloud from local (that could clobber good remote data). Bail without
        // marking synced; we'll retry on the next mount/login.
        return;
      }
      if (cancelled) return;

      // "Has cloud data" must look at EVERY slice, not just settings — a row with
      // tasks/history but default (empty) settings is still real data we must not
      // overwrite by seeding local over it.
      const remoteHasData = !!remote && (
        hasContent(remote.settings) || hasContent(remote.goals) || hasContent(remote.gamification) ||
        hasContent(remote.tasks) || hasContent(remote.history) || hasContent(remote.presets) ||
        (typeof remote.notepad === 'string' && remote.notepad.length > 0)
      );

      if (remote && remoteHasData) {
        // Existing account on another device → adopt the cloud copy. Mark synced
        // FIRST so the post-remount mount short-circuits (no pull loop), then
        // remount the app to re-hydrate the stores instead of a hard reload
        // (which in Tauri re-runs all desktop init). The SYNCED_FLAG guard above
        // makes the remounted hook skip straight to ready.
        hydrateLocal(remote);
        sessionStorage.setItem(SYNCED_FLAG, user.id);
        if (remote.updated_at) sessionStorage.setItem(SINCE_KEY, remote.updated_at);
        window.dispatchEvent(new Event('kipto:rehydrate'));
        return;
      }

      // Genuinely no cloud data yet (null / empty) → seed from this device.
      const seededAt = await seedCloudState(user.id, snapshot());
      lastSeen.current = seededAt;
      if (seededAt) sessionStorage.setItem(SINCE_KEY, seededAt);
      sessionStorage.setItem(SYNCED_FLAG, user.id);
      setReady(true);
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  // Build the current snapshot from props.
  const snapshot = (): Partial<CloudState> => ({
    settings: settings as CloudState['settings'],
    goals: goals as CloudState['goals'],
    gamification: gamification as CloudState['gamification'],
    tasks,
    history,
    presets,
    notepad,
  });

  // Debounced, conditional push on any change once ready.
  useEffect(() => {
    if (!ready || !user) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(async () => {
      const newAt = await pushCloudState(user.id, snapshot(), lastSeen.current);
      if (newAt) {
        // Our write landed — advance the baseline.
        lastSeen.current = newAt;
        sessionStorage.setItem(SINCE_KEY, newAt);
      } else {
        // Conflict or error: another device wrote newer data. Re-baseline from
        // the server instead of clobbering it; the next local change will sync.
        try {
          const fresh = await fetchCloudState(user.id);
          if (fresh?.updated_at) {
            lastSeen.current = fresh.updated_at;
            sessionStorage.setItem(SINCE_KEY, fresh.updated_at);
          }
        } catch { /* transient — keep current baseline */ }
      }
    }, 1500);
    return () => { if (pushTimer.current) clearTimeout(pushTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, settings, goals, gamification, tasks, history, presets, notepad]);

  return { syncing: !!user && !ready };
}
