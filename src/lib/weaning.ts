import type { BlockerCategory } from '@/stores/pomodoroStore';

// Gradual reduction ("weaning"): phase blocking in over time instead of all at
// once. Each category can be given a start DATE — until then it is not enforced,
// even if its toggle is on. This lets someone tighten step by step (e.g. block
// adult content now, gambling next week, social the week after) — a gentler,
// more sustainable path than cold-turkey-everything. Changes happen at most
// daily/weekly, so it stays friendly with the admin-authorized hosts blocker
// (no password spam).

// Map of category -> ISO date string when its blocking begins.
export type WeaningMap = Partial<Record<BlockerCategory, string>>;

export function isPending(startISO: string | undefined, now: number = Date.now()): boolean {
  if (!startISO) return false;
  const t = Date.parse(startISO);
  return Number.isFinite(t) && t > now;
}

// Effective categories right now: a category is enforced only if its base toggle
// is on AND its scheduled start (if any) has already passed.
export function effectiveBlockedCategories(
  base: Record<BlockerCategory, boolean>,
  weaning: WeaningMap | undefined,
  now: number = Date.now(),
): Record<BlockerCategory, boolean> {
  const out = { ...base };
  (Object.keys(out) as BlockerCategory[]).forEach((k) => {
    if (out[k] && isPending(weaning?.[k], now)) out[k] = false;
  });
  return out;
}

// Categories that are toggled on but still waiting for their start date.
export function pendingCategories(
  base: Record<BlockerCategory, boolean>,
  weaning: WeaningMap | undefined,
  now: number = Date.now(),
): BlockerCategory[] {
  return (Object.keys(base) as BlockerCategory[]).filter((k) => base[k] && isPending(weaning?.[k], now));
}

// "2026-07-10" (the <input type="date"> value) for a stored ISO string, or ''.
export function toDateInput(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isFinite(d.getTime()) ? d.toISOString().slice(0, 10) : '';
}
