import { describe, it, expect } from 'vitest';
import { calculateStreak, getStatsFromHistory, type HistoryEntry } from './pomodoroStore';

// Build a work entry on a given UTC calendar day (noon UTC keeps the UTC date stable).
const workOn = (year: number, month: number, day: number, durationSec = 1500): HistoryEntry => ({
  ts: Date.UTC(year, month, day, 12, 0, 0),
  type: 'work',
  duration: durationSec,
  category: 'Study',
});

describe('calculateStreak', () => {
  it('returns 0 for empty history', () => {
    expect(calculateStreak([])).toBe(0);
  });

  it('returns 0 when there are only break entries', () => {
    const history: HistoryEntry[] = [
      { ts: Date.UTC(2024, 0, 10, 12), type: 'break', duration: 300, category: 'break' },
    ];
    expect(calculateStreak(history)).toBe(0);
  });

  it('counts a single work day as a streak of 1', () => {
    expect(calculateStreak([workOn(2024, 0, 10)])).toBe(1);
  });

  it('counts consecutive days', () => {
    const history = [workOn(2024, 0, 10), workOn(2024, 0, 11), workOn(2024, 0, 12)];
    expect(calculateStreak(history)).toBe(3);
  });

  it('collapses multiple sessions on the same day into one', () => {
    const history = [
      workOn(2024, 0, 12),
      workOn(2024, 0, 12),
      workOn(2024, 0, 11),
    ];
    expect(calculateStreak(history)).toBe(2);
  });

  it('stops the streak at the first gap, counting only the most recent run', () => {
    const history = [
      workOn(2024, 0, 12),
      workOn(2024, 0, 11),
      // gap on the 10th
      workOn(2024, 0, 8),
      workOn(2024, 0, 7),
    ];
    expect(calculateStreak(history)).toBe(2);
  });

  it('is order-independent', () => {
    const history = [workOn(2024, 0, 11), workOn(2024, 0, 13), workOn(2024, 0, 12)];
    expect(calculateStreak(history)).toBe(3);
  });
});

describe('getStatsFromHistory', () => {
  it('handles empty history without dividing by zero', () => {
    const stats = getStatsFromHistory([]);
    expect(stats.totalSessions).toBe(0);
    expect(stats.totalHours).toBe('0.0');
    expect(stats.totalDays).toBe(0);
    expect(stats.additionalMetrics.averageSession).toBe(0);
    expect(stats.additionalMetrics.longestSession).toBe(0);
    expect(stats.chartData).toHaveLength(7);
  });

  it('aggregates totals, days and category distribution', () => {
    const history: HistoryEntry[] = [
      { ts: Date.UTC(2024, 0, 10, 12), type: 'work', duration: 1500, category: 'Study' }, // 25 min
      { ts: Date.UTC(2024, 0, 10, 13), type: 'work', duration: 1500, category: 'Study' }, // 25 min
      { ts: Date.UTC(2024, 0, 11, 12), type: 'work', duration: 3000, category: 'Code' },  // 50 min
      { ts: Date.UTC(2024, 0, 11, 13), type: 'break', duration: 300, category: 'break' }, // 5 min
    ];
    const stats = getStatsFromHistory(history);

    expect(stats.totalSessions).toBe(3);
    expect(stats.totalDays).toBe(2);
    expect(stats.totalHours).toBe('1.7'); // 100 work minutes => 1.666h
    expect(stats.categories).toEqual({ Study: 50, Code: 50 });
    expect(stats.distribution).toEqual({ work: 100, break: 5 });
    expect(stats.additionalMetrics.longestSession).toBe(50);
    expect(stats.additionalMetrics.averageSession).toBeCloseTo(33.3, 1);
  });

  it('always returns a 7-day chart window', () => {
    const stats = getStatsFromHistory([workOn(2024, 0, 10)]);
    expect(stats.chartLabels).toHaveLength(7);
    expect(stats.chartData).toHaveLength(7);
  });
});
