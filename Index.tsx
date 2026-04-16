import { useState, useCallback, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
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
import FocusRoom from '@/components/FocusRoom';
import BottomBar, { type PanelView, type DashboardMode } from '@/components/BottomBar';
import { useSettings, useTasks, useHistory, usePresets, useNotepad, calculateStreak } from '@/stores/pomodoroStore';
import { useGamification } from '@/stores/gamificationStore';
import { useGoals, getTodayProgress, getWeekProgress } from '@/stores/goalsStore';
import LeaderboardPanel from '@/components/LeaderboardPanel';
import { useSubscription } from '@/stores/subscriptionStore';
import { useTimer } from '@/hooks/useTimer';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { THEMES } from '@/data/themes';
import type { Achievement } from '@/data/achievements';

const Index = () => {
  const { settings, setSettings } = useSettings();
  const { tasks, activeTaskId, setActiveTaskId, addTask, toggleTask, removeTask, incrementPomodoro } = useTasks();
  const { history, addEntry, clearHistory } = useHistory();
  const { presets, addPreset, removePreset } = usePresets();
  const { content: noteContent, setContent: setNoteContent } = useNotepad();
  const { isPremium } = useSubscription();
  const ambient = useAmbientSound(settings.ambientSound, settings.ambientVolume);
  // ... inside return ...
      {/* Removed hidden audio player */}
  const gamification = useGamification();
  const { goals } = useGoals();

  const [activePanel, setActivePanel] = useState<PanelView>('none');
  const [dashMode, setDashMode] = useState<DashboardMode>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const [focusMode, setFocusMode] = useState(false);

  const streak = calculateStreak(history);
  const todayProgress = useMemo(() => getTodayProgress(history), [history]);
  const weekProgress = useMemo(() => getWeekProgress(history), [history]);

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

  const handleAmbientSoundChange = useCallback((s: string) => {
    setSettings({ ambientSound: s });
    ambient.playSound(s, settings.ambientVolume);
  }, [setSettings, ambient, settings.ambientVolume]);

  const handleAmbientVolumeChange = useCallback((v: number) => {
    setSettings({ ambientVolume: v });
    ambient.setVolume(v);
  }, [setSettings, ambient]);

  useEffect(() => {
    if (settings.autoPlayAmbient && timer.running && timer.phase === 'work' && settings.ambientSound !== 'none') {
      ambient.playSound(settings.ambientSound, settings.ambientVolume);
    } else if (settings.autoPlayAmbient && (!timer.running || timer.phase !== 'work')) {
      ambient.stopAll();
    }
  }, [timer.running, timer.phase, settings.autoPlayAmbient, settings.ambientSound, settings.ambientVolume, ambient]);

  useEffect(() => {
    if (timer.running) {
      const m = Math.floor(timer.remaining / 60);
      const s = timer.remaining % 60;
      document.title = `(${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}) ${timer.phase.toUpperCase()} — Pomodoro`;
    } else {
      document.title = 'Pomodoro — Focus & Flow';
    }
  }, [timer.remaining, timer.running, timer.phase]);

  useEffect(() => {
    let wl: WakeLockSentinel | null = null;
    if (isPremium && settings.preventSleep && timer.running && 'wakeLock' in navigator) {
      (navigator as any).wakeLock.request('screen').then((lock: WakeLockSentinel) => { wl = lock; }).catch(() => {});
    }
    return () => { wl?.release(); };
  }, [isPremium, settings.preventSleep, timer.running]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  useEffect(() => {
    if (dashMode === 'focus' && !timer.running) {
      toast('Focus mode ready', {
        description: 'Ready to start your deep work session?',
        action: { label: 'Start', onClick: timer.start },
      });
    }
  }, [dashMode]);

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

  const currentThemeId = dashMode === 'focus' ? settings.focusTheme : (dashMode === 'ambient' ? settings.ambientTheme : settings.homeTheme);
  const activeTheme = currentThemeId === 'custom' 
    ? { background: settings.customBg, preview: settings.customBg } 
    : THEMES.find(t => t.id === currentThemeId);
  
  const hasImageBg = (activeTheme?.background && activeTheme.background.startsWith('http')) || (currentThemeId === 'custom' && settings.customBg);

  // Logic to only show video if in the appropriate mode, or if videoBg is set for the current mode
  const getVideoUrl = () => {
    // Only return the URL if the current dashboard mode matches the configuration
    // You can refine this logic if you want specific videos for specific modes
    return settings.videoBg; 
  };
  
  const getYoutubeId = (url: string | null) => {
    if (!url) return null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    } catch {
      return null;
    }
  };
  
  const videoId = getYoutubeId(getVideoUrl());

  const panelContent: Record<PanelView, React.ReactNode> = {
    none: null,
    tasks: (
      <TaskPanel tasks={tasks} activeTaskId={activeTaskId}
        onAddTask={addTask} onToggleTask={handleToggleTask}
        onRemoveTask={removeTask} onSetActive={setActiveTaskId} />
    ),
    sounds: (
      <SoundsPanel ambientSound={settings.ambientSound} ambientVolume={settings.ambientVolume}
        onSoundChange={handleAmbientSoundChange} onVolumeChange={handleAmbientVolumeChange} />
    ),
    notepad: <NotepadPanel content={noteContent} onChange={setNoteContent} />,
    achievements: <AchievementsPanel xp={gamification.xp} unlockedAchievements={gamification.unlockedAchievements} />,
    goals: (
      <GoalsPanel goals={goals} todayMinutes={todayProgress.minutes} todaySessions={todayProgress.sessions}
        weekMinutes={weekProgress.minutes} weekSessions={weekProgress.sessions} />
    ),
    heatmap: <HeatmapPanel history={history} />,
    leaderboard: <LeaderboardPanel />,
    focusroom: <FocusRoom currentStatus={timer.running ? (timer.phase === 'work' ? 'focus' : 'break') : 'idle'} />,
  };

  return (
    <div className={`h-screen w-screen overflow-hidden relative font-style-${settings.clockStyle}`}>
      {/* Background Layer - Fixed and behind everything */}
      <div className="fixed inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentThemeId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {videoId ? (
              <div className="absolute inset-0 pointer-events-none scale-110">
                <iframe 
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}`}
                  className="w-full h-full aspect-video pointer-events-none object-cover"
                  frameBorder="0" allow="autoplay; encrypted-media; fullscreen" allowFullScreen
                />

              </div>
            ) : hasImageBg ? (
              <img src={activeTheme!.background} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-animated" style={{ background: activeTheme?.preview }} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content Layer - Above Background */}
      <div className="relative z-10 h-full w-full">
        <AchievementToast achievement={achievementToast} onDismiss={() => setAchievementToast(null)} />
        <ClockDisplay format={settings.clockFormat} showSeconds={settings.showSeconds} displayName={settings.displayName} />

        <div className="h-full flex flex-col items-center justify-center px-4">
          <TimerDisplay
            remaining={timer.remaining} phase={timer.phase} running={timer.running}
            progress={timer.progress} sessions={timer.sessions} tallyStyle={settings.tallyStyle}
            onStart={timer.start} onPause={timer.pause} onReset={timer.reset}
            onResetSegment={timer.resetSegment} onSkipBreak={timer.skipBreak} onPhaseSelect={handlePhaseSelect}
          />
        </div>

        <div className="fixed bottom-20 left-4 z-40">
          <AnimatePresence mode="wait">
            {activePanel !== 'none' && panelContent[activePanel]}
          </AnimatePresence>
        </div>

        <BottomBar streak={streak} activePanel={activePanel} mode={dashMode}
          level={gamification.levelInfo.level} xp={gamification.xp}
          onPanelChange={setActivePanel} onModeChange={setDashMode}
          onFullscreen={toggleFullscreen} onOpenSettings={() => setSettingsOpen(true)}
          onToggleFocus={() => setFocusMode(p => !p)} />
      </div>

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <div className="mb-12 text-center">
              <h2 className="text-white/40 text-sm font-medium uppercase tracking-[0.3em] mb-2">Focus Mode Active</h2>
              <p className="text-white/20 text-xs">Stay focused. The world can wait.</p>
            </div>
            
            <TimerDisplay
              remaining={timer.remaining} phase={timer.phase} running={timer.running}
              progress={timer.progress} sessions={timer.sessions} tallyStyle={settings.tallyStyle}
              onStart={timer.start} onPause={timer.pause} onReset={timer.reset}
              onResetSegment={timer.resetSegment} onSkipBreak={timer.skipBreak} onPhaseSelect={handlePhaseSelect}
              isCompact
            />

            <button
              onClick={() => setFocusMode(false)}
              className="mt-16 px-6 py-2 rounded-full border border-white/10 text-white/40 text-xs hover:bg-white/5 hover:text-white/60 transition-all"
            >
              Exit Focus Mode
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings sidebar */}
      <SettingsSidebar open={settingsOpen} onClose={() => setSettingsOpen(false)}
        settings={settings} presets={presets} onUpdate={setSettings}
        onAddPreset={addPreset} onRemovePreset={removePreset}
        history={history} onClearHistory={clearHistory} />
    </div>
  );
};

export default Index;
