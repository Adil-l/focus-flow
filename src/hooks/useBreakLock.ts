import { useState, useEffect, useCallback } from 'react';

// A mandatory break lock that survives reloads. It is anchored to an ABSOLUTE
// wall-clock `until` timestamp persisted in localStorage, so refreshing or
// reopening the tab cannot escape it — the overlay reappears and keeps counting
// down from where it was. It also exposes a flag the blocker extension reads to
// take over the whole browser during the break.

const KEY = 'pomo:break-lock';
const ACTIVE_FLAG = 'pomo:break-active'; // read by the extension bridge

export interface BreakLockState {
  until: number;
  phase: 'short' | 'long';
}

function readStored(): BreakLockState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    if (typeof v?.until === 'number' && (v.phase === 'short' || v.phase === 'long')) return v;
  } catch { /* ignore */ }
  return null;
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

  const active = !!lock && enabled && now < lock.until;
  const remaining = lock ? Math.max(0, Math.ceil((lock.until - now) / 1000)) : 0;

  // Mirror the live state to the flag the extension watches.
  useEffect(() => {
    try { localStorage.setItem(ACTIVE_FLAG, active ? '1' : '0'); } catch { /* ignore */ }
  }, [active]);

  // Drop the lock once the break time has fully elapsed.
  useEffect(() => {
    if (lock && now >= lock.until) {
      try { localStorage.removeItem(KEY); } catch { /* ignore */ }
      setLock(null);
    }
  }, [lock, now]);

  const engage = useCallback((phase: 'short' | 'long', seconds: number) => {
    const v: BreakLockState = { until: Date.now() + Math.max(1, Math.round(seconds)) * 1000, phase };
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* ignore */ }
    setLock(v);
    setNow(Date.now());
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
      localStorage.setItem(ACTIVE_FLAG, '0');
    } catch { /* ignore */ }
    setLock(null);
  }, []);

  return { active, remaining, phase: lock?.phase ?? 'short', locked: !!lock, engage, clear };
}
