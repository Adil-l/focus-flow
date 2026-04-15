import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

// Types
export type TimerMode = 'pomodoro' | 'countdown' | 'stopwatch' | 'animedoro' | '52/17';
export type SessionPhase = 'work' | 'short' | 'long';

export interface Task {
  id: string;
  name: string;
  estPomodoros: number;
  pomodorosDone: number;
  completed: boolean;
  colorTag: string;
  emoji: string;
  createdAt: number;
}

export interface HistoryEntry {
  ts: number;
  type: 'work' | 'break';
  duration: number;
  category: string;
}

export interface TimerPreset {
  name: string;
  work: number;
  short: number;
  long: number;
  cyclesForLong: number;
}

export interface Settings {
  work: number;
  short: number;
  long: number;
  cyclesForLong: number;
  autoNext: boolean;
  timerMode: TimerMode;
  displayName: string;
  preventSleep: boolean;
  clearMode: boolean;
  disableAnimatedThemes: boolean;
  clockFormat: '12h' | '24h';
  showSeconds: boolean;
  flipClock: boolean;
  clockFont: string;
  alertSound: string;
  alertVolume: number;
  ambientSound: string;
  ambientVolume: number;
  randomizeTheme: boolean;
  tallyStyle: string;
  quoteCategory: string;
  countdownMinutes: number;
}

const DEFAULT_SETTINGS: Settings = {
  work: 25,
  short: 5,
  long: 15,
  cyclesForLong: 4,
  autoNext: true,
  timerMode: 'pomodoro',
  displayName: '',
  preventSleep: false,
  clearMode: false,
  disableAnimatedThemes: false,
  clockFormat: '24h',
  showSeconds: false,
  flipClock: false,
  clockFont: 'default',
  alertSound: 'chime',
  alertVolume: 0.7,
  ambientSound: 'none',
  ambientVolume: 0.5,
  randomizeTheme: false,
  tallyStyle: 'dots',
  quoteCategory: 'motivational',
  countdownMinutes: 30,
};

// Helpers
function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Store
export function useSettings() {
  const [settings, setSettingsState] = useState<Settings>(() =>
    loadJSON('pomo:settings', DEFAULT_SETTINGS)
  );

  const setSettings = useCallback((update: Partial<Settings>) => {
    setSettingsState(prev => {
      const next = { ...prev, ...update };
      saveJSON('pomo:settings', next);
      return next;
    });
  }, []);

  return { settings, setSettings };
}

export function useTasks() {
  const [tasks, setTasksState] = useState<Task[]>(() => loadJSON('pomo:tasks', []));
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() =>
    loadJSON<string | null>('pomo:activeTask', null)
  );

  const persist = useCallback((t: Task[]) => saveJSON('pomo:tasks', t), []);

  const addTask = useCallback((name: string, estPomodoros: number, colorTag = '', emoji = '') => {
    setTasksState(prev => {
      const next = [...prev, {
        id: crypto.randomUUID(),
        name,
        estPomodoros,
        pomodorosDone: 0,
        completed: false,
        colorTag,
        emoji,
        createdAt: Date.now(),
      }];
      persist(next);
      return next;
    });
  }, [persist]);

  const toggleTask = useCallback((id: string) => {
    setTasksState(prev => {
      const next = prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      persist(next);
      return next;
    });
  }, [persist]);

  const removeTask = useCallback((id: string) => {
    setTasksState(prev => {
      const next = prev.filter(t => t.id !== id);
      persist(next);
      return next;
    });
  }, [persist]);

  const incrementPomodoro = useCallback((id: string) => {
    setTasksState(prev => {
      const next = prev.map(t => t.id === id ? { ...t, pomodorosDone: t.pomodorosDone + 1 } : t);
      persist(next);
      return next;
    });
  }, [persist]);

  useEffect(() => {
    saveJSON('pomo:activeTask', activeTaskId);
  }, [activeTaskId]);

  return { tasks, activeTaskId, setActiveTaskId, addTask, toggleTask, removeTask, incrementPomodoro };
}

export function useHistory() {
  const [history, setHistoryState] = useState<HistoryEntry[]>(() => loadJSON('pomo:history', []));

  const addEntry = useCallback((entry: HistoryEntry) => {
    setHistoryState(prev => {
      const next = [...prev, entry];
      saveJSON('pomo:history', next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistoryState([]);
    saveJSON('pomo:history', []);
  }, []);

  return { history, addEntry, clearHistory };
}

export function usePresets() {
  const [presets, setPresetsState] = useState<TimerPreset[]>(() => loadJSON('pomo:presets', []));

  const addPreset = useCallback((preset: TimerPreset) => {
    setPresetsState(prev => {
      const next = [...prev, preset];
      saveJSON('pomo:presets', next);
      return next;
    });
  }, []);

  const removePreset = useCallback((name: string) => {
    setPresetsState(prev => {
      const next = prev.filter(p => p.name !== name);
      saveJSON('pomo:presets', next);
      return next;
    });
  }, []);

  return { presets, addPreset, removePreset };
}

export function useNotepad() {
  const [content, setContentState] = useState(() => localStorage.getItem('pomo:notepad') || '');

  const setContent = useCallback((text: string) => {
    setContentState(text);
    localStorage.setItem('pomo:notepad', text);
  }, []);

  return { content, setContent };
}

// Streak calculation
export function calculateStreak(history: HistoryEntry[]): number {
  const workDays = [...new Set(
    history.filter(e => e.type === 'work').map(e => new Date(e.ts).toISOString().slice(0, 10))
  )].sort((a, b) => b.localeCompare(a));

  if (workDays.length === 0) return 0;

  let streak = 1;
  let checkDate = new Date(workDays[0]);
  for (let i = 1; i < workDays.length; i++) {
    checkDate.setDate(checkDate.getDate() - 1);
    if (workDays[i] === checkDate.toISOString().slice(0, 10)) streak++;
    else break;
  }
  return streak;
}

// Stats helpers
export function getStatsFromHistory(history: HistoryEntry[]) {
  const workEntries = history.filter(e => e.type === 'work');
  const totalMinutes = workEntries.reduce((acc, e) => acc + e.duration / 60, 0);
  const totalSessions = workEntries.length;
  const uniqueDays = [...new Set(workEntries.map(e => new Date(e.ts).toISOString().slice(0, 10)))];

  // Last 7 days chart data
  const counts: Record<string, number> = {};
  workEntries.forEach(e => {
    const d = new Date(e.ts).toISOString().slice(0, 10);
    counts[d] = (counts[d] || 0) + Math.round(e.duration / 60);
  });
  const labels = Object.keys(counts).sort().slice(-7);
  const data = labels.map(l => counts[l]);

  // Categories
  const cats: Record<string, number> = {};
  workEntries.forEach(e => {
    const c = e.category || 'Sem categoria';
    cats[c] = (cats[c] || 0) + 1;
  });

  return {
    totalHours: (totalMinutes / 60).toFixed(1),
    totalSessions,
    totalDays: uniqueDays.length,
    chartLabels: labels,
    chartData: data,
    categories: cats,
  };
}
