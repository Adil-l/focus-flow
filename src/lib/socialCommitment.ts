// Logic for the Distracting / Social blocker commitment. The user commits to
// keeping social/distracting sites blocked for a chosen span; bailing out before
// it completes costs a typed reason whose length scales with the commitment.
import type { SocialCommitment } from '@/stores/pomodoroStore';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Commitment length presets offered when turning the Social blocker on.
export interface CommitmentPreset {
  id: string;
  labelPt: string;
  labelEn: string;
  ms: number;
}
export const COMMITMENT_PRESETS: CommitmentPreset[] = [
  { id: '1h', labelPt: '1 hora', labelEn: '1 hour', ms: 1 * HOUR },
  { id: '4h', labelPt: '4 horas', labelEn: '4 hours', ms: 4 * HOUR },
  { id: '8h', labelPt: '8 horas', labelEn: '8 hours', ms: 8 * HOUR },
  { id: '1d', labelPt: '1 dia', labelEn: '1 day', ms: 1 * DAY },
  { id: '3d', labelPt: '3 dias', labelEn: '3 days', ms: 3 * DAY },
  { id: '1w', labelPt: '1 semana', labelEn: '1 week', ms: 7 * DAY },
  { id: '2w', labelPt: '2 semanas', labelEn: '2 weeks', ms: 14 * DAY },
];

// A commitment of a week or more demands a longer (100-char) justification to
// break early; shorter ones require 50. Matches the user's spec.
export const LONG_COMMITMENT_MS = 7 * DAY;
export const SHORT_REASON_CHARS = 50;
export const LONG_REASON_CHARS = 100;

/** True while the commitment is active (now is before its end). */
export function isCommitted(c: SocialCommitment | null | undefined, now: number = Date.now()): boolean {
  return !!c && now < c.until;
}

/** How many characters the early-exit reason must have for this commitment. */
export function requiredReasonChars(c: SocialCommitment | null | undefined): number {
  return c && c.spanMs >= LONG_COMMITMENT_MS ? LONG_REASON_CHARS : SHORT_REASON_CHARS;
}

/** Milliseconds left in the commitment (0 if none/expired). */
export function remainingMs(c: SocialCommitment | null | undefined, now: number = Date.now()): number {
  return c ? Math.max(0, c.until - now) : 0;
}

/** Human-friendly remaining time, e.g. "2d 3h", "5h 12m", "8m". */
export function formatRemaining(ms: number, pt: boolean): string {
  const totalMin = Math.ceil(ms / 60000);
  const d = Math.floor(totalMin / (60 * 24));
  const h = Math.floor((totalMin % (60 * 24)) / 60);
  const m = totalMin % 60;
  const parts: string[] = [];
  if (d) parts.push(`${d}${pt ? 'd' : 'd'}`);
  if (h) parts.push(`${h}h`);
  if (m && !d) parts.push(`${m}m`); // drop minutes once we're showing days
  return parts.join(' ') || (pt ? 'menos de 1m' : 'under 1m');
}
