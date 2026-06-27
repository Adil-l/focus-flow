// Escalating cooldown for the reflection gate. The more you try to weaken the
// blocker, the longer the wait — both across days and across attempts in a day.
//
//   cooldown(min) = base * dayCount + 5 * (attemptToday - 1)
//
// where `base` is the per-day base (default 15), `dayCount` is how many distinct
// days you've attempted a deactivation (1 on the first day, 2 the next day you
// try, …) and `attemptToday` is which attempt today this is (1st, 2nd, …).
//   • Day 1: 15, then 20, 25, … (each extra attempt today +5)
//   • Day 2: 30, then 35, …
//   • Day 3: 45, …
// The idea: relapsing repeatedly costs progressively more patience.

const KEY = 'pomo:unblock-attempts';

function load(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    const a = raw ? JSON.parse(raw) : [];
    return Array.isArray(a) ? a.filter((x) => typeof x === 'number') : [];
  } catch {
    return [];
  }
}

function save(a: number[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* ignore */ }
}

function dayStr(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

// Minutes for the NEXT attempt (does not record it — so the gate can preview it).
export function nextCooldownMin(baseMin: number, now: number = Date.now()): number {
  const base = Math.max(1, baseMin || 15);
  const attempts = load();
  const today = dayStr(now);
  const daysSet = new Set(attempts.map(dayStr));
  const attemptsTodayPrev = attempts.filter((t) => dayStr(t) === today).length;
  const dayCount = daysSet.has(today) ? daysSet.size : daysSet.size + 1;
  const thisAttemptToday = attemptsTodayPrev + 1;
  return Math.max(1, base * dayCount + 5 * (thisAttemptToday - 1));
}

// Record that an attempt was just started (prunes entries older than 90 days).
export function recordAttempt(now: number = Date.now()): void {
  const cutoff = now - 90 * 24 * 3600 * 1000;
  const attempts = load().filter((t) => t >= cutoff);
  attempts.push(now);
  save(attempts);
}
