import { describe, it, expect } from 'vitest';
import { getTodayProgress, getWeekProgress } from './goalsStore';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe('getTodayProgress', () => {
  it('returns zero progress for empty history', () => {
    expect(getTodayProgress([])).toEqual({ minutes: 0, sessions: 0 });
  });

  it('counts only work sessions from today', () => {
    const now = Date.now();
    const history = [
      { ts: now, type: 'work', duration: 1500 },        // today, 25 min
      { ts: now, type: 'break', duration: 300 },         // break ignored
      { ts: now - 3 * DAY, type: 'work', duration: 1500 }, // earlier day ignored
    ];
    expect(getTodayProgress(history)).toEqual({ minutes: 25, sessions: 1 });
  });
});

describe('getWeekProgress', () => {
  it('returns zero progress for empty history', () => {
    expect(getWeekProgress([])).toEqual({ minutes: 0, sessions: 0 });
  });

  it('excludes sessions older than the current week', () => {
    const now = Date.now();
    const history = [
      { ts: now, type: 'work', duration: 1500 },
      { ts: now - 30 * DAY, type: 'work', duration: 1500 }, // last month
    ];
    const result = getWeekProgress(history);
    expect(result.sessions).toBe(1);
    expect(result.minutes).toBe(25);
  });
});
