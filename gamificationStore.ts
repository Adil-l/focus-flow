import { useState, useCallback } from 'react';
import { ACHIEVEMENTS, getLevelFromXP, type Achievement, type AchievementStats } from '@/data/achievements';

function loadJSON<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function saveJSON(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); }

export interface GamificationState {
  xp: number;
  unlockedAchievements: string[];
  tasksCompleted: number;
  longestStreak: number;
}

const DEFAULT: GamificationState = { xp: 0, unlockedAchievements: [], tasksCompleted: 0, longestStreak: 0 };

export function useGamification() {
  const [state, setState] = useState<GamificationState>(() => loadJSON('pomo:gamification', DEFAULT));

  const addXP = useCallback((amount: number) => {
    setState(prev => {
      const next = { ...prev, xp: prev.xp + amount };
      saveJSON('pomo:gamification', next);
      return next;
    });
  }, []);

  const incrementTasksCompleted = useCallback(() => {
    setState(prev => {
      const next = { ...prev, tasksCompleted: prev.tasksCompleted + 1 };
      saveJSON('pomo:gamification', next);
      return next;
    });
  }, []);

  const updateLongestStreak = useCallback((currentStreak: number) => {
    setState(prev => {
      if (currentStreak <= prev.longestStreak) return prev;
      const next = { ...prev, longestStreak: currentStreak };
      saveJSON('pomo:gamification', next);
      return next;
    });
  }, []);

  const checkAchievements = useCallback((stats: AchievementStats): Achievement[] => {
    const newlyUnlocked: Achievement[] = [];
    setState(prev => {
      let xpGain = 0;
      const newIds: string[] = [];
      for (const a of ACHIEVEMENTS) {
        if (!prev.unlockedAchievements.includes(a.id) && a.condition(stats)) {
          newIds.push(a.id);
          xpGain += a.xpReward;
          newlyUnlocked.push(a);
        }
      }
      if (newIds.length === 0) return prev;
      const next = {
        ...prev,
        xp: prev.xp + xpGain,
        unlockedAchievements: [...prev.unlockedAchievements, ...newIds],
      };
      saveJSON('pomo:gamification', next);
      return next;
    });
    return newlyUnlocked;
  }, []);

  const levelInfo = getLevelFromXP(state.xp);

  return {
    ...state,
    levelInfo,
    addXP,
    incrementTasksCompleted,
    updateLongestStreak,
    checkAchievements,
  };
}
