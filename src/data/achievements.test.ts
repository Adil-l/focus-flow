import { describe, it, expect } from 'vitest';
import {
  ACHIEVEMENTS,
  getLevelFromXP,
  LEVEL_THRESHOLDS,
  type AchievementStats,
} from './achievements';

const baseStats = (overrides: Partial<AchievementStats> = {}): AchievementStats => ({
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalDays: 0,
  tasksCompleted: 0,
  level: 1,
  ...overrides,
});

describe('getLevelFromXP', () => {
  it('starts everyone at level 1 with 0 XP', () => {
    const info = getLevelFromXP(0);
    expect(info.level).toBe(1);
    expect(info.currentXP).toBe(0);
  });

  it('promotes exactly at a threshold boundary', () => {
    expect(getLevelFromXP(LEVEL_THRESHOLDS[1]).level).toBe(2); // 50 XP -> level 2
    expect(getLevelFromXP(LEVEL_THRESHOLDS[1] - 1).level).toBe(1); // 49 XP -> level 1
  });

  it('reports progress between 0 and 100 within a level', () => {
    const info = getLevelFromXP(85); // between level 2 (50) and level 3 (120)
    expect(info.level).toBe(2);
    expect(info.progress).toBeGreaterThan(0);
    expect(info.progress).toBeLessThanOrEqual(100);
    expect(info.currentXP).toBe(35);
  });

  it('caps progress at 100 beyond the highest defined threshold', () => {
    const info = getLevelFromXP(1_000_000);
    expect(info.level).toBe(LEVEL_THRESHOLDS.length);
    expect(info.progress).toBeLessThanOrEqual(100);
  });
});

describe('ACHIEVEMENTS conditions', () => {
  it('has unique ids', () => {
    const ids = ACHIEVEMENTS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('unlocks "first-focus" on the first session and not before', () => {
    const a = ACHIEVEMENTS.find(x => x.id === 'first-focus')!;
    expect(a.condition(baseStats({ totalSessions: 0 }))).toBe(false);
    expect(a.condition(baseStats({ totalSessions: 1 }))).toBe(true);
  });

  it('unlocks streak milestones at their threshold', () => {
    const streak7 = ACHIEVEMENTS.find(x => x.id === 'streak-7')!;
    expect(streak7.condition(baseStats({ currentStreak: 6 }))).toBe(false);
    expect(streak7.condition(baseStats({ currentStreak: 7 }))).toBe(true);
  });

  it('unlocks time milestones based on accumulated minutes', () => {
    const tenHours = ACHIEVEMENTS.find(x => x.id === 'ten-hours')!;
    expect(tenHours.condition(baseStats({ totalMinutes: 599 }))).toBe(false);
    expect(tenHours.condition(baseStats({ totalMinutes: 600 }))).toBe(true);
  });
});
