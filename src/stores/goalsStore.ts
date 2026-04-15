import { useState, useCallback } from 'react';

function loadJSON<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; } catch { return fallback; }
}
function saveJSON(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); }

export interface Goals {
  dailyMinutes: number;
  weeklyMinutes: number;
  dailySessions: number;
  weeklySessions: number;
}

const DEFAULT_GOALS: Goals = { dailyMinutes: 120, weeklyMinutes: 600, dailySessions: 4, weeklySessions: 20 };

export function useGoals() {
  const [goals, setGoalsState] = useState<Goals>(() => loadJSON('pomo:goals', DEFAULT_GOALS));

  const setGoals = useCallback((update: Partial<Goals>) => {
    setGoalsState(prev => {
      const next = { ...prev, ...update };
      saveJSON('pomo:goals', next);
      return next;
    });
  }, []);

  return { goals, setGoals };
}

export function getTodayProgress(history: { ts: number; type: string; duration: number }[]) {
  const today = new Date().toISOString().slice(0, 10);
  const todayEntries = history.filter(e => e.type === 'work' && new Date(e.ts).toISOString().slice(0, 10) === today);
  return {
    minutes: Math.round(todayEntries.reduce((a, e) => a + e.duration / 60, 0)),
    sessions: todayEntries.length,
  };
}

export function getWeekProgress(history: { ts: number; type: string; duration: number }[]) {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEntries = history.filter(e => e.type === 'work' && e.ts >= weekStart.getTime());
  return {
    minutes: Math.round(weekEntries.reduce((a, e) => a + e.duration / 60, 0)),
    sessions: weekEntries.length,
  };
}
