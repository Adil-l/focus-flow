import { useState, useCallback } from 'react';

// Lightweight local urge log shared by the recovery features (reflection gate,
// SOS, future insights). Stored locally only — this is sensitive data and never
// leaves the Mac by default.
export type UrgeEntry = {
  ts: number;
  type: 'urge' | 'resisted' | 'slip';
  trigger?: string;
  intensity?: number;
  method?: string;
  note?: string;
};

const KEY = 'pomo:urge-log';

function load(): UrgeEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UrgeEntry[]) : [];
  } catch {
    return [];
  }
}

// Non-hook helper for use inside event handlers.
export function logUrge(entry: Omit<UrgeEntry, 'ts'>): void {
  try {
    const cur = load();
    cur.push({ ...entry, ts: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(cur));
  } catch {
    /* ignore */
  }
}

export function useUrgeLog() {
  const [entries, setEntries] = useState<UrgeEntry[]>(() => load());
  const add = useCallback((entry: Omit<UrgeEntry, 'ts'>) => {
    setEntries((prev) => {
      const next = [...prev, { ...entry, ts: Date.now() }];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);
  return { entries, add };
}

// ---------------------------------------------------------------------------
// Feature #4 — compassionate streak / relapse tracking.
//
// A "goal" is a behaviour the user is trying to step back from. We track how
// long the current clean stretch is, and the LONGEST clean stretch ever — the
// longest stretch can only ever go up. A slip is logged as data, not failure:
// it never erases the record you already earned. All data stays local.
// ---------------------------------------------------------------------------

export type RecoveryGoal = {
  id: string;
  label: string;
  startedAt: number;
  lastSlipAt: number | null;
  longestCleanMs: number;
  slips: { ts: number; trigger?: string; note?: string }[];
};

const RECOVERY_KEY = 'pomo:recovery';

function loadGoals(): RecoveryGoal[] {
  try {
    const raw = localStorage.getItem(RECOVERY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecoveryGoal[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveGoals(goals: RecoveryGoal[]): void {
  try {
    localStorage.setItem(RECOVERY_KEY, JSON.stringify(goals));
  } catch {
    /* ignore */
  }
}

function makeId(): string {
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

// The start of the current clean stretch: the most recent of the goal's start
// and its last slip.
function cleanStretchStart(goal: RecoveryGoal): number {
  return Math.max(goal.startedAt, goal.lastSlipAt ?? goal.startedAt);
}

// How long the current clean stretch has been running, in ms.
export function currentCleanMs(goal: RecoveryGoal, now: number = Date.now()): number {
  return Math.max(0, now - cleanStretchStart(goal));
}

// Render a duration as e.g. "3d 4h", "5h 12m", "just started".
export function humanizeDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return 'just started';
  const totalMinutes = Math.floor(ms / 60000);
  if (totalMinutes < 1) return 'just started';

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function useRecovery() {
  const [goals, setGoals] = useState<RecoveryGoal[]>(() => loadGoals());

  const persist = useCallback((next: RecoveryGoal[]) => {
    saveGoals(next);
    return next;
  }, []);

  const addGoal = useCallback((label: string) => {
    const clean = label.trim();
    if (!clean) return;
    setGoals((prev) => persist([
      ...prev,
      {
        id: makeId(),
        label: clean,
        startedAt: Date.now(),
        lastSlipAt: null,
        longestCleanMs: 0,
        slips: [],
      },
    ]));
  }, [persist]);

  const recordSlip = useCallback(
    (goalId: string, info?: { trigger?: string; note?: string }) => {
      const now = Date.now();
      setGoals((prev) => persist(prev.map((g) => {
        if (g.id !== goalId) return g;
        // Bank the clean stretch we just completed BEFORE resetting it. The
        // record can only ever rise — a slip never lowers it.
        const completed = now - cleanStretchStart(g);
        const longestCleanMs = Math.max(g.longestCleanMs, completed);
        return {
          ...g,
          longestCleanMs,
          lastSlipAt: now,
          slips: [...g.slips, { ts: now, trigger: info?.trigger, note: info?.note }],
        };
      })));
    },
    [persist],
  );

  const removeGoal = useCallback((id: string) => {
    setGoals((prev) => persist(prev.filter((g) => g.id !== id)));
  }, [persist]);

  return { goals, addGoal, recordSlip, removeGoal };
}
