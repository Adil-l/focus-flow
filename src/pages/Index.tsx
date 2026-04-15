import { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import ClockDisplay from '@/components/ClockDisplay';
import TimerDisplay from '@/components/TimerDisplay';
import TaskPanel from '@/components/TaskPanel';
import NotepadPanel from '@/components/NotepadPanel';
import SoundsPanel from '@/components/SoundsPanel';
import GoalsPanel from '@/components/GoalsPanel';
import AchievementsPanel from '@/components/AchievementsPanel';
import HeatmapPanel from '@/components/HeatmapPanel';
import AchievementToast from '@/components/AchievementToast';
import SettingsSidebar from '@/components/SettingsSidebar';
import BottomBar, { type PanelView, type DashboardMode } from '@/components/BottomBar';
import { useSettings, useTasks, useHistory, usePresets, useNotepad, calculateStreak } from '@/stores/pomodoroStore';
import { useGamification } from '@/stores/gamificationStore';
import { useGoals, getTodayProgress, getWeekProgress } from '@/stores/goalsStore';
import { useTimer } from '@/hooks/useTimer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { THEMES } from '@/data/themes';
import type { Achievement } from '@/data/achievements';

const Index = () => {
  const { settings, setSettings } = useSettings();
  const { tasks, activeTaskId, setActiveTaskId, addTask, toggleTask, removeTask, incrementPomodoro } = useTasks();
  const { history, addEntry, clearHistory } = useHistory();
  const { presets, addPreset, removePreset } = usePresets();
  const { content: noteContent, setContent: setNoteContent } = useNotepad();
  const gamification = useGamification();
  const { goals } = useGoals();

  const [activePanel, setActivePanel] = useState<PanelView>('none');
  const [dashMode, setDashMode] = useState<DashboardMode>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);

  const streak = calculateStreak(history);
  const todayProgress = useMemo(() => getTodayProgress(history), [history]);
  const weekProgress = useMemo(() => getWeekProgress(history), [history]);

  // Check achievements periodically
  useEffect(() => {
    const workEntries = history.filter(e => e.type === 'work');
    const totalMinutes = workEntries.reduce((a, e) => a + e.duration / 60, 0);
    gamification.updateLongestStreak(streak);
    const newAchievements = gamification.checkAchievements({
      totalSessions: workEntries.length,
      totalMinutes,
      currentStreak: streak,
      longestStreak: Math.max(streak, gamification.longestStreak),
      totalDays: new Set(workEntries.map(e => new Date(e.ts).toISOString().slice(0, 10))).size,
      tasksCompleted: gamification.tasksCompleted,
      level: gamification.levelInfo.level,
    });
    if (newAchievements.length > 0) {
      setAchievementToast(newAchievements[0]);
      setTimeout(() => setAchievementToast(null), 5000);
    }
  }, [history, streak]);

  const onSessionComplete = useCallback((phase: 'work' | 'short' | 'long', duration: number) => {
    const activeTask = tasks.find(t => t.id === activeTaskId);
    const category = activeTask?.name || 'Uncategorized';

    if (phase === 'work') {
      addEntry({ ts: Date.now(), type: 'work', duration, category });
      if (activeTaskId) incrementPomodoro(activeTaskId);
      gamification.addXP(25);
      if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
    } else {
      addEntry({ ts: Date.now(), type: 'break', duration, category: 'break' });
      gamification.addXP(5);
    }

    if (Notification.permission === 'granted') {
      new Notification('Pomodoro', {
        body: phase === 'work' ? 'Focus session complete! 🎉' : 'Break over, time to focus! 💪',
      });
    }

    const allDone = tasks.length > 0 && tasks.every(t => t.completed);
    if (allDone) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
  }, [tasks, activeTaskId, addEntry, incrementPomodoro, gamification]);

  const timer = useTimer({ settings, onSessionComplete });

  // Document title
  useEffect(() => {
    if (timer.running) {
      const m = Math.floor(timer.remaining / 60);
      const s = timer.remaining % 60;
      document.title = `(${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}) ${timer.phase.toUpperCase()} — Pomodoro`;
    } else {
      document.title = 'Pomodoro — Focus & Flow';
    }
  }, [timer.remaining, timer.running, timer.phase]);

  // Wake lock
  useEffect(() => {
    let wl: WakeLockSentinel | null = null;
    if (settings.preventSleep && timer.running && 'wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').then((lock: WakeLockSentinel) => { wl = lock; }).catch(() => {});
    }
    return () => { wl?.release(); };
  }, [settings.preventSleep, timer.running]);

  // Notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  };

  const handlePhaseSelect = (phase: 'work' | 'short' | 'long') => {
    if (!timer.running) timer.setPhase(phase);
  };

  const handleToggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) {
      gamification.incrementTasksCompleted();
      gamification.addXP(10);
    }
    toggleTask(id);
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    if (updated.length > 0 && updated.every(t => t.completed)) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts(useMemo(() => ({
    onStartPause: () => timer.running ? timer.pause() : timer.start(),
    onReset: timer.reset,
    onSkipBreak: timer.skipBreak,
    onToggleTasks: () => setActivePanel(p => p === 'tasks' ? 'none' : 'tasks'),
    onToggleSounds: () => setActivePanel(p => p === 'sounds' ? 'none' : 'sounds'),
    onToggleNotepad: () => setActivePanel(p => p === 'notepad' ? 'none' : 'notepad'),
    onToggleSettings: () => setSettingsOpen(p => !p),
    onToggleFullscreen: toggleFullscreen,
  }), [timer]));

  // Active theme background
  const activeTheme = THEMES.find(t => t.id === (settings as any).activeTheme);
  const hasImageBg = activeTheme?.background && activeTheme.background.startsWith('http');

  const panelContent: Record<PanelView, React.ReactNode> = {
    none: null,
    tasks: (
      <TaskPanel tasks={tasks} activeTaskId={activeTaskId}
        onAddTask={addTask} onToggleTask={handleToggleTask}
        onRemoveTask={removeTask} onSetActive={setActiveTaskId} />
    ),
    sounds: (
      <SoundsPanel ambientSound={settings.ambientSound} ambientVolume={settings.ambientVolume}
        onSoundChange={s => setSettings({ ambientSound: s })} onVolumeChange={v => setSettings({ ambientVolume: v })} />
    ),
    notepad: <NotepadPanel content={noteContent} onChange={setNoteContent} />,
    achievements: <AchievementsPanel xp={gamification.xp} unlockedAchievements={gamification.unlockedAchievements} />,
    goals: (
      <GoalsPanel goals={goals} todayMinutes={todayProgress.minutes} todaySessions={todayProgress.sessions}
        weekMinutes={weekProgress.minutes} weekSessions={weekProgress.sessions} />
    ),
    heatmap: <HeatmapPanel history={history} />,
  };

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      {/* Background */}
      {hasImageBg ? (
        <div className="absolute inset-0 z-0">
          <img src={activeTheme!.background} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-animated" />
      )}

      {/* Animated orbs (only on gradient bg) */}
      {!hasImageBg && !settings.disableAnimatedThemes && (
        <>
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
        </>
      )}

      {/* Achievement toast */}
      <AchievementToast achievement={achievementToast} onDismiss={() => setAchievementToast(null)} />

      {/* Top bar */}
      <ClockDisplay format={settings.clockFormat} showSeconds={settings.showSeconds} displayName={settings.displayName} />

      {/* Main content */}
      <div className="h-full flex flex-col items-center justify-center px-4 relative z-10">
        <TimerDisplay
          remaining={timer.remaining} phase={timer.phase} running={timer.running}
          progress={timer.progress} sessions={timer.sessions} tallyStyle={settings.tallyStyle}
          onStart={timer.start} onPause={timer.pause} onReset={timer.reset}
          onResetSegment={timer.resetSegment} onSkipBreak={timer.skipBreak} onPhaseSelect={handlePhaseSelect}
        />
      </div>

      {/* Floating widget panels */}
      <div className="fixed bottom-20 left-4 z-40">
        <AnimatePresence mode="wait">
          {activePanel !== 'none' && panelContent[activePanel]}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <BottomBar streak={streak} activePanel={activePanel} mode={dashMode}
        level={gamification.levelInfo.level} xp={gamification.xp}
        onPanelChange={setActivePanel} onModeChange={setDashMode}
        onFullscreen={toggleFullscreen} onOpenSettings={() => setSettingsOpen(true)} />

      {/* Settings sidebar */}
      <SettingsSidebar open={settingsOpen} onClose={() => setSettingsOpen(false)}
        settings={settings} presets={presets} onUpdate={setSettings}
        onAddPreset={addPreset} onRemovePreset={removePreset}
        history={history} onClearHistory={clearHistory} />
    </div>
  );
};

export default Index;
