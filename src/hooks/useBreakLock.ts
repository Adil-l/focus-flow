import { useState, useEffect, useCallback } from 'react';

// A mandatory break lock that survives reloads. It is anchored to an ABSOLUTE
// wall-clock `until` timestamp persisted in localStorage, so refreshing or
// reopening the tab cannot escape it — the overlay reappears and keeps counting
// down from where it was. It also exposes a flag the blocker extension reads to
// take over the whole browser during the break.
//
// Sequence (no more endless loops): the break plays its FULL length once, then a
// single recount at HALF the length, then it opens — and it never re-locks itself
// for that same break. A genuinely new break (the timer entering a break phase
// again) starts a fresh full→half sequence.

const KEY = 'pomo:break-lock';
const ACTIVE_FLAG = 'pomo:break-active'; // read by the extension bridge

export type BreakStage = 'full' | 'half';

export interface BreakLockState {
  until: number;
  phase: 'short' | 'long';
  fullMs: number;     // the original break length in ms (drives the half recount)
  stage: BreakStage;  // 'full' = first pass, 'half' = the single half-length recount
}

function readStored(): BreakLockState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (typeof v?.until !== 'number') return null;
    if (v.phase !== 'short' && v.phase !== 'long') return null;
    const stage: BreakStage = v.stage === 'half' ? 'half' : 'full';
    // Migrate older locks that predate fullMs/stage.
    const fullMs = typeof v.fullMs === 'number' && v.fullMs > 0
      ? v.fullMs
      : Math.max(1000, v.until - Date.now());
    return { until: v.until, phase: v.phase, fullMs, stage };
  } catch { /* ignore */ }
  return null;
}

function persist(v: BreakLockState | null) {
  try {
    if (v) localStorage.setItem(KEY, JSON.stringify(v));
    else localStorage.removeItem(KEY);
  } catch { /* ignore */ }
}

export function useBreakLock(enabled: boolean) {
  const [lock, setLock] = useState<BreakLockState | null>(() => readStored());
  const [now, setNow] = useState(() => Date.now());

  // Tick once per second while a lock is present so the countdown stays live.
  useEffect(() => {
    if (!lock) return;
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, [lock]);

  // The overlay is shown whenever a lock exists (and the feature is enabled).
  // We intentionally do NOT gate this on `now < until`, so the visible countdown
  // can hit 00:00 and immediately restart at half — a seamless recount, no flash.
  const active = !!lock && enabled;
  const remaining = lock ? Math.max(0, Math.ceil((lock.until - now) / 1000)) : 0;
  const stageTotalMs = lock
    ? (lock.stage === 'half' ? Math.max(1000, Math.round(lock.fullMs / 2)) : lock.fullMs)
    : 0;
  const totalSeconds = Math.round(stageTotalMs / 1000);

  // Mirror the live state to the flag the extension watches.
  useEffect(() => {
    try { localStorage.setItem(ACTIVE_FLAG, active ? '1' : '0'); } catch { /* ignore */ }
  }, [active]);

  // Stage machine: full pass elapsed → one half-length recount; half elapsed → open.
  useEffect(() => {
    if (!lock || now < lock.until) return;
    if (lock.stage === 'full') {
      // Anchor the half recount to the ORIGINAL deadline, not `now`. A break that
      // just elapsed recounts seamlessly from half; a break interrupted by closing
      // the app and reopened much later is already past `until + halfMs`, so the
      // next tick releases it instead of punishing the user with a fresh lock.
      const halfMs = Math.max(1000, Math.round(lock.fullMs / 2));
      const next: BreakLockState = { ...lock, until: lock.until + halfMs, stage: 'half' };
      persist(next);
      setLock(next);
      setNow(Date.now());
    } else {
      // Half recount done — release. No further re-locking for this break.
      persist(null);
      setLock(null);
    }
  }, [lock, now]);

  const engage = useCallback((phase: 'short' | 'long', seconds: number) => {
    const fullMs = Math.max(1000, Math.round(seconds) * 1000);
    const v: BreakLockState = { until: Date.now() + fullMs, phase, fullMs, stage: 'full' };
    persist(v);
    setLock(v);
    setNow(Date.now());
  }, []);

  const clear = useCallback(() => {
    persist(null);
    try { localStorage.setItem(ACTIVE_FLAG, '0'); } catch { /* ignore */ }
    setLock(null);
  }, []);

  return {
    active,
    remaining,
    totalSeconds,
    phase: lock?.phase ?? 'short',
    stage: lock?.stage ?? 'full',
    locked: !!lock,
    engage,
    clear,
  };
}
