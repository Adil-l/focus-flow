import { useState, useCallback, useEffect, useMemo, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import ClockDisplay from '@/components/ClockDisplay';
import TimerDisplay from '@/components/TimerDisplay';
import AchievementToast from '@/components/AchievementToast';
import LockOverlay from '@/components/LockOverlay';
import FloatingTimer from '@/components/FloatingTimer';
import FocusSessionTitle from '@/components/FocusSessionTitle';
import ShareModal from '@/components/ShareModal';
import WhatsNew from '@/components/WhatsNew';
import BottomBar, { type PanelView } from '@/components/BottomBar';
import { useMode } from '@/stores/modeStore';
import { track, identify } from '@/lib/analytics';

// Code-split: panels and modals load on demand to keep the initial bundle small.
const TaskPanel = lazy(() => import('@/components/TaskPanel'));
const NotepadPanel = lazy(() => import('@/components/NotepadPanel'));
const GoalsPanel = lazy(() => import('@/components/GoalsPanel'));
const AchievementsPanel = lazy(() => import('@/components/AchievementsPanel'));
const HeatmapPanel = lazy(() => import('@/components/HeatmapPanel'));
const LeaderboardPanel = lazy(() => import('@/components/LeaderboardPanel'));
const FocusRoom = lazy(() => import('@/components/FocusRoom'));
const SoundsPanel = lazy(() => import('@/components/SoundsPanel'));
const PricingPanel = lazy(() => import('@/components/PricingPanel'));
const SettingsSidebar = lazy(() => import('@/components/SettingsSidebar'));
const AuthPage = lazy(() => import('@/components/AuthPage').then(m => ({ default: m.AuthPage })));

import { useSettings, useTasks, useHistory, usePresets, useNotepad, calculateStreak } from '@/stores/pomodoroStore';
import { useGamification } from '@/stores/gamificationStore';
import { useGoals, getTodayProgress, getWeekProgress } from '@/stores/goalsStore';
import { useTimer } from '@/hooks/useTimer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAuth } from '@/hooks/useAuth';
import { useCloudSync } from '@/hooks/useCloudSync';
import { THEMES } from '@/data/themes';
import { soundManager, ALERT_SOUNDS } from '@/lib/audio';
import type { Achievement } from '@/data/achievements';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { settings, setSettings } = useSettings();
  const { tasks, activeTaskId, setActiveTaskId, addTask, toggleTask, removeTask, incrementPomodoro } = useTasks();
  const { history, addEntry, clearHistory } = useHistory();
  const { presets, addPreset, removePreset } = usePresets();
  const { content: noteContent, setContent: setNoteContent } = useNotepad();

  const gamification = useGamification();
  const { xp, unlockedAchievements, updateLongestStreak, checkAchievements, longestStreak, tasksCompleted, levelInfo } = gamification;
  const { goals } = useGoals();

  // Mirror local state to Supabase when signed in (cross-device sync).
  const gamificationState = useMemo(
    () => ({ xp, unlockedAchievements, tasksCompleted, longestStreak }),
    [xp, unlockedAchievements, tasksCompleted, longestStreak],
  );
  useCloudSync({ user, settings, goals, gamification: gamificationState, tasks, history, presets, notepad: noteContent });

  useEffect(() => {
    if (user) identify(user.id, { email: user.email ?? undefined });
  }, [user]);

  const { mode, setMode, floatingTimer } = useMode();
  const [activePanel, setActivePanel] = useState<PanelView>('none');
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Latch: keep SettingsSidebar mounted after the first open so its exit
  // animation still plays, while deferring the lazy chunk until it's needed.
  const [settingsMounted, setSettingsMounted] = useState(false);
  useEffect(() => { if (settingsOpen) setSettingsMounted(true); }, [settingsOpen]);
  const [showAuth, setShowAuth] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const canShowAuthModal = showAuth;

  const streak = useMemo(() => calculateStreak(history), [history]);
  const todayProgress = useMemo(() => getTodayProgress(history), [history]);
  const weekProgress = useMemo(() => getWeekProgress(history), [history]);

  useEffect(() => {
    const workEntries = history.filter(e => e.type === 'work');
    const totalMinutes = workEntries.reduce((a, e) => a + e.duration / 60, 0);
    updateLongestStreak(streak);
    const newAchievements = checkAchievements({
      totalSessions: workEntries.length,
      totalMinutes,
      currentStreak: streak,
      longestStreak: Math.max(streak, longestStreak),
      totalDays: new Set(workEntries.map(e => new Date(e.ts).toISOString().slice(0, 10))).size,
      tasksCompleted,
      level: levelInfo.level,
    });
    if (newAchievements.length > 0) {
      setAchievementToast(newAchievements[0]);
      setTimeout(() => setAchievementToast(null), 5000);
    }
  }, [history, streak, longestStreak, tasksCompleted, levelInfo.level, updateLongestStreak, checkAchievements]);

  const onSessionComplete = useCallback((phase: 'work' | 'short' | 'long', duration: number) => {
    const activeTask = tasks.find(t => t.id === activeTaskId);
    const category = activeTask?.name || 'Uncategorized';
    track('focus_session_completed', { phase, duration, category });

    if (phase === 'work') {
      addEntry({ ts: Date.now(), type: 'work', duration, category });
      if (activeTaskId) incrementPomodoro(activeTaskId);
      gamification.addXP(25);
      try {
        if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
      } catch (vError) {
        console.warn("Vibration not supported or blocked:", vError);
      }
    } else {
      addEntry({ ts: Date.now(), type: 'break', duration, category: 'break' });
      gamification.addXP(5);
    }

    if (Notification.permission === 'granted') {
      new Notification('Pomodoro', {
        body: phase === 'work' ? 'Focus session complete! 🎉' : 'Break over, time to focus! 💪',
      });
    }

    // Play alert sound
    if (settings.alertSound !== 'no alert') {
      const soundUrl = ALERT_SOUNDS[settings.alertSound] || ALERT_SOUNDS['chime'];
      soundManager.play(soundUrl, settings.alertVolume);
    }

    const allDone = tasks.length > 0 && tasks.every(t => t.completed);
    if (allDone) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
  }, [tasks, activeTaskId, addEntry, incrementPomodoro, gamification, settings.alertSound, settings.alertVolume]);

  const timer = useTimer({ settings, onSessionComplete });

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
    if (settings.preventSleep && timer.running && 'wakeLock' in navigator) {
      try {
        (navigator as Navigator & { wakeLock: { request: (type: 'screen') => Promise<WakeLockSentinel> } }).wakeLock.request('screen')
          .then((lock: WakeLockSentinel) => { wl = lock; })
          .catch((e: Error) => console.warn("WakeLock request failed:", e.message));
      } catch (e) {
        console.warn("WakeLock not supported in this context:", e);
      }
    }
    return () => { 
      if (wl) {
        wl.release().catch(() => {});
      }
    };
  }, [settings.preventSleep, timer.running]);

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
    const completing = task && !task.completed;
    if (completing) {
      gamification.incrementTasksCompleted();
      gamification.addXP(10);
    }
    toggleTask(id);
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    // Auto-advance: completing the active task moves focus to the next unfinished one.
    if (completing && id === activeTaskId) {
      const next = updated.find(t => !t.completed);
      setActiveTaskId(next ? next.id : null);
    }
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

  const currentThemeId = settings.homeTheme;
  const activeTheme = currentThemeId === 'custom' 
    ? { background: settings.customBg, preview: settings.customBg } 
    : THEMES.find(t => t.id === currentThemeId);
  
  const hasImageBg = (activeTheme?.background && (activeTheme.background.startsWith('http') || activeTheme.background.startsWith('/'))) || (currentThemeId === 'custom' && settings.customBg);

  const getVideoUrl = () => {
    return settings.videoBg; 
  };
  
  const getYoutubeId = (url: string | null) => {
    if (!url) return null;
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
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
    notepad: <NotepadPanel content={noteContent} onChange={setNoteContent} />,
    sounds: <SoundsPanel />,
    achievements: <AchievementsPanel xp={gamification.xp} unlockedAchievements={gamification.unlockedAchievements} />,
    goals: (
      <GoalsPanel goals={goals} todayMinutes={todayProgress.minutes} todaySessions={todayProgress.sessions}
        weekMinutes={weekProgress.minutes} weekSessions={weekProgress.sessions} />
    ),
    heatmap: <HeatmapPanel history={history} />,
    leaderboard: <LeaderboardPanel />,
    pricing: <PricingPanel />,
    focusroom: <FocusRoom currentStatus={timer.running ? (timer.phase === 'work' ? 'focus' : 'break') : 'idle'} />,
  };

  return (
    <div className={`h-screen w-screen overflow-hidden relative font-style-${settings.clockStyle}`}>
      <AnimatePresence>
        {settings.forceBreakLock && (timer.phase === 'short' || timer.phase === 'long') && (
          <LockOverlay 
            key="lock-screen-overlay" 
            remaining={timer.remaining} 
            phase={timer.phase} 
            onStart={timer.start}
            isRunning={timer.running}
          />
        )}
      </AnimatePresence>

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
                  frameBorder="0" 
                  allow="autoplay; encrypted-media; fullscreen" 
                  allowFullScreen
                />
              </div>
            ) : hasImageBg ? (
              <img src={activeTheme!.background ?? undefined} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-animated" style={{ background: activeTheme?.preview ?? undefined }} />
            )}
          </motion.div>
        </AnimatePresence>

        <div className={`absolute inset-0 ${mode === 'ambient' ? 'bg-black/20' : 'bg-black/40'}`} />
      </div>

      <div className="relative z-10 h-full w-full">
        {canShowAuthModal && (
          <Suspense fallback={null}>
            <AuthPage onClose={() => setShowAuth(false)} />
          </Suspense>
        )}

        <AchievementToast achievement={achievementToast} onDismiss={() => setAchievementToast(null)} />
        <WhatsNew />

        {/* Home mode: big clock + greeting + quote */}
        {mode === 'home' && (
          <ClockDisplay
            format={settings.clockFormat}
            showSeconds={settings.showSeconds}
            displayName={settings.displayName}
            timezone={settings.timezone}
            clockFont={settings.clockFont}
            clockStyle={settings.clockStyle}
            fontScale={settings.fontScale}
            showGreetings={settings.showGreetings}
            quoteCategory={settings.quoteCategory}
            showClock={settings.showClock}
            showQuote={settings.showQuote}
            showLogo={settings.showLogo}
          />
        )}

        {/* Focus mode: timer-centric layout */}
        {mode === 'focus' && (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <FocusSessionTitle
              activeTaskName={tasks.find(t => t.id === activeTaskId)?.name}
              onOpenTasks={() => setActivePanel('tasks')}
            />
            <TimerDisplay
              remaining={timer.remaining} phase={timer.phase} running={timer.running}
              progress={timer.progress} sessions={timer.sessions} tallyStyle={settings.tallyStyle}
              clockStyle={settings.clockStyle}
              fontScale={settings.fontScale}
              verticalOffset={settings.timerVerticalOffset}
              onStart={timer.start} onPause={timer.pause} onReset={timer.reset}
              onResetSegment={timer.resetSegment} onSkipBreak={timer.skipBreak} onPhaseSelect={handlePhaseSelect}
            />
          </div>
        )}

        {/* Floating timer: always in Ambient mode; opt-in on Home */}
        {(mode === 'ambient' || (mode === 'home' && floatingTimer)) && (
          <FloatingTimer
            remaining={timer.remaining}
            phase={timer.phase}
            running={timer.running}
            onStart={timer.start}
            onPause={timer.pause}
            onReset={timer.reset}
          />
        )}

        <div className="fixed bottom-24 left-4 z-40">
          <Suspense fallback={null}>
            <AnimatePresence mode="wait">
              {activePanel !== 'none' && panelContent[activePanel]}
            </AnimatePresence>
          </Suspense>
        </div>

        <BottomBar
          streak={streak}
          activePanel={activePanel}
          level={gamification.levelInfo.level}
          xp={gamification.xp}
          mode={mode}
          onModeChange={setMode}
          onPanelChange={setActivePanel}
          onFullscreen={toggleFullscreen}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenAuth={() => setShowAuth(true)}
          onShare={() => setShowShare(true)}
        />

        {showShare && <ShareModal onClose={() => setShowShare(false)} />}
      </div>

      {settingsMounted && (
        <Suspense fallback={null}>
          <SettingsSidebar
            open={settingsOpen} onClose={() => setSettingsOpen(false)}
            settings={settings} presets={presets} onUpdate={setSettings}
            onAddPreset={addPreset} onRemovePreset={removePreset}
            history={history} onClearHistory={clearHistory}
            onOpenAuth={() => setShowAuth(true)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default Index;