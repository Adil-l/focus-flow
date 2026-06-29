import { useState, useCallback, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import ClockDisplay from '@/components/ClockDisplay';
import TimerDisplay from '@/components/TimerDisplay';
import AchievementToast from '@/components/AchievementToast';
import LockOverlay from '@/components/LockOverlay';
import SosPanel from '@/components/SosPanel';
import { LifeBuoy as SosIcon } from 'lucide-react';
import FloatingTimer from '@/components/FloatingTimer';
import FocusSessionTitle from '@/components/FocusSessionTitle';
import ShareModal from '@/components/ShareModal';
import TaskCompletePrompt from '@/components/TaskCompletePrompt';
import WhatsNew from '@/components/WhatsNew';
import BottomBar, { type PanelView } from '@/components/BottomBar';
import MobileTabBar from '@/platform/mobile/MobileTabBar';
import BottomSheet from '@/platform/mobile/BottomSheet';
import MoreSheet, { type MoreAction } from '@/platform/mobile/MoreSheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMode } from '@/stores/modeStore';
import { useSoundMixer } from '@/hooks/useSoundMixer';
import { usePremium } from '@/hooks/usePremium';
import { track, identify } from '@/lib/analytics';
import { useTranslation } from '@/lib/i18n';

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
import { useBreakLock } from '@/hooks/useBreakLock';
import { useDeepBlocklistAutoRefresh } from '@/hooks/useDeepBlocklistAutoRefresh';
import { checkForUpdates } from '@/platform/desktop/updater';
import { THEMES } from '@/data/themes';
import { soundManager, ALERT_SOUNDS } from '@/lib/audio';
import { ensureNotifyPermission, notify } from '@/platform/notify';
import type { Achievement } from '@/data/achievements';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { language: uiLang } = useTranslation();
  const { settings, setSettings } = useSettings();
  const { tasks, activeTaskId, setActiveTaskId, addTask, toggleTask, removeTask, incrementPomodoro, extendTaskEstimate } = useTasks();
  const { history, addEntry, clearHistory } = useHistory();
  const { presets, addPreset, removePreset } = usePresets();
  const { content: noteContent, setContent: setNoteContent } = useNotepad();
  useDeepBlocklistAutoRefresh(); // desktop-only: refresh maintained feeds on launch + daily

  // Desktop-only: check for a signed app update shortly after launch.
  useEffect(() => {
    const t = setTimeout(() => { void checkForUpdates(); }, 4000);
    return () => clearTimeout(t);
  }, []);

  const gamification = useGamification();
  const { xp, unlockedAchievements, updateLongestStreak, checkAchievements, longestStreak, tasksCompleted, levelInfo } = gamification;
  const { goals } = useGoals();

  // Mirror local state to Supabase when signed in (cross-device sync).
  const gamificationState = useMemo(
    () => ({ xp, unlockedAchievements, tasksCompleted, longestStreak }),
    [xp, unlockedAchievements, tasksCompleted, longestStreak],
  );
  useCloudSync({ user, loading: authLoading, settings, goals, gamification: gamificationState, tasks, history, presets, notepad: noteContent });

  useEffect(() => {
    if (user) identify(user.id, { email: user.email ?? undefined });
  }, [user]);

  const { mode, setMode, floatingTimer } = useMode();
  const { isPremium } = usePremium();
  // Owned here (not in SoundsPanel) so the mix keeps playing when the panel closes.
  const soundMixer = useSoundMixer({ allowPremium: isPremium, autoResume: settings.autoPlayAmbient });
  const [activePanel, setActivePanel] = useState<PanelView>('none');
  const isMobile = useIsMobile();
  const [moreOpen, setMoreOpen] = useState(false);
  // A task hit its planned session count; carried across the break, then shown.
  const taskMilestoneRef = useRef<string | null>(null);
  const [taskPrompt, setTaskPrompt] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Latch: keep SettingsSidebar mounted after the first open so its exit
  // animation still plays, while deferring the lazy chunk until it's needed.
  const [settingsMounted, setSettingsMounted] = useState(false);
  useEffect(() => { if (settingsOpen) setSettingsMounted(true); }, [settingsOpen]);
  const [showAuth, setShowAuth] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const randomizedRef = useRef(false);
  const [achievementToast, setAchievementToast] = useState<Achievement | null>(null);
  const achievementQueue = useRef<Achievement[]>([]);
  const achievementTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canShowAuthModal = showAuth;

  // Show unlocked achievements one at a time; clears its own timer (no leaks/stacking).
  const showNextAchievement = useCallback(() => {
    const next = achievementQueue.current.shift();
    if (!next) {
      achievementTimer.current = null;
      setAchievementToast(null);
      return;
    }
    setAchievementToast(next);
    achievementTimer.current = setTimeout(showNextAchievement, 4000);
  }, []);
  useEffect(() => () => { if (achievementTimer.current) clearTimeout(achievementTimer.current); }, []);

  const streak = useMemo(() => calculateStreak(history), [history]);
  const todayProgress = useMemo(() => getTodayProgress(history), [history]);
  const weekProgress = useMemo(() => getWeekProgress(history), [history]);

  // Task ETA Mode: projected finish time for the active task, derived from its
  // remaining estimated pomodoros (work + intervening short breaks). An estimate
  // (hence the "~"), recomputed each minute so the clock stays roughly current.
  const [etaTick, setEtaTick] = useState(0);
  useEffect(() => {
    if (!settings.taskEtaMode) return;
    const id = setInterval(() => setEtaTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, [settings.taskEtaMode]);
  const taskEta = useMemo(() => {
    if (!settings.taskEtaMode) return null;
    const task = tasks.find(t => t.id === activeTaskId);
    if (!task) return null;
    const remaining = Math.max(0, (task.estPomodoros || 0) - (task.pomodorosDone || 0));
    if (remaining === 0) return null;
    const minutes = remaining * settings.work + Math.max(0, remaining - 1) * settings.short;
    const finish = new Date(Date.now() + minutes * 60_000);
    const clock = finish.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: settings.clockFormat === '12h',
    });
    return { clock, remaining };
    // etaTick is an intentional dep: it ticks each minute to refresh the clock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.taskEtaMode, settings.work, settings.short, settings.clockFormat, tasks, activeTaskId, etaTick]);

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
      achievementQueue.current.push(...newAchievements);
      if (!achievementTimer.current) showNextAchievement();
    }
  }, [history, streak, longestStreak, tasksCompleted, levelInfo.level, updateLongestStreak, checkAchievements, showNextAchievement]);

  const onSessionComplete = useCallback((phase: 'work' | 'short' | 'long', duration: number) => {
    const activeTask = tasks.find(t => t.id === activeTaskId);
    const category = activeTask?.name || 'Uncategorized';
    track('focus_session_completed', { phase, duration, category });

    if (phase === 'work') {
      addEntry({ ts: Date.now(), type: 'work', duration, category });
      if (activeTaskId) incrementPomodoro(activeTaskId);
      // If this session completes the task's planned sessions, flag it so the
      // task prompt can appear once the (mandatory) break is over.
      if (activeTask && !activeTask.completed && activeTask.estPomodoros > 0
          && activeTask.pomodorosDone + 1 >= activeTask.estPomodoros) {
        taskMilestoneRef.current = activeTaskId;
      }
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

    notify(
      'Pomodoro',
      phase === 'work'
        ? (uiLang === 'pt' ? 'Sessão de foco concluída! 🎉' : 'Focus session complete! 🎉')
        : (uiLang === 'pt' ? 'Pausa terminada, hora de focar! 💪' : 'Break over, time to focus! 💪'),
    );

    // Play alert sound (skip when the user chose "no alert" / "none")
    if (settings.alertSound !== 'no alert' && settings.alertSound !== 'none') {
      const soundUrl = ALERT_SOUNDS[settings.alertSound] || ALERT_SOUNDS['chime'];
      soundManager.play(soundUrl, settings.alertVolume);
    }

    const allDone = tasks.length > 0 && tasks.every(t => t.completed);
    if (allDone) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
  }, [tasks, activeTaskId, addEntry, incrementPomodoro, gamification, settings.alertSound, settings.alertVolume, uiLang]);

  const timer = useTimer({ settings, onSessionComplete });

  // Mandatory, reload-proof break lock. Engages the moment a forced break starts
  // running and persists by absolute timestamp, so a refresh can't escape it.
  // Mandatory breaks (with the full-Mac kiosk lock on desktop) follow the user's
  // setting — authorized in the first-run onboarding, toggleable later in Settings.
  const forceLock = settings.forceBreakLock;
  const breakLock = useBreakLock(forceLock);
  const [showSos, setShowSos] = useState(false);
  // Engage the lock ONLY on the rising edge of entering a break (work → break),
  // never again while the timer stays in that break. The lock then runs its own
  // full → half-recount → open sequence (see useBreakLock). This is what stops the
  // old re-lock loop, where an expired lock kept re-engaging mid-break.
  const prevInBreakRef = useRef(false);
  useEffect(() => {
    const inBreak = timer.running && (timer.phase === 'short' || timer.phase === 'long');
    const startedBreak = inBreak && !prevInBreakRef.current;
    prevInBreakRef.current = inBreak;
    // The trailing phase check is redundant with `startedBreak` but narrows the
    // type for engage() (which only accepts 'short' | 'long'). Don't remove it.
    if (forceLock && startedBreak && !breakLock.locked && (timer.phase === 'short' || timer.phase === 'long')) {
      breakLock.engage(timer.phase, timer.remaining);
      // Freeze the focus timer for the whole lock. If it kept running it would
      // cycle work↔break underneath, and a new break could re-lock the instant
      // this one opens (the focus and break counters "aligning"). The lock owns
      // the break duration; the timer resumes onto the next focus session when it
      // opens (see the release effect below).
      timer.pause();
    }
    // timer.remaining/engage intentionally omitted: capture at break start only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceLock, timer.running, timer.phase]);

  // When the mandatory break opens, advance past the break into the next focus
  // session (the timer was frozen while locked). This guarantees you ALWAYS leave
  // the break — the focus countdown can never align with it and trap you.
  const wasLockActiveRef = useRef(false);
  useEffect(() => {
    if (wasLockActiveRef.current && !breakLock.active) {
      timer.skipBreak();              // move off the break phase onto 'work'
      // Don't auto-start onto the next session if a task just hit its estimate —
      // the prompt below takes over and holds the timer until the user chooses.
      if (settings.autoNext && !taskMilestoneRef.current) timer.start();
    }
    wasLockActiveRef.current = breakLock.active;
    // timer methods are stable (useCallback); depend only on the lock's edge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakLock.active, settings.autoNext]);

  // When we return to a focus phase after a break and a task hit its planned
  // session count, surface the task prompt and hold the timer until the user
  // chooses. Works with OR without the mandatory break lock.
  const prevPhaseRef = useRef(timer.phase);
  useEffect(() => {
    const wasBreak = prevPhaseRef.current === 'short' || prevPhaseRef.current === 'long';
    prevPhaseRef.current = timer.phase;
    if (wasBreak && timer.phase === 'work' && taskMilestoneRef.current) {
      setTaskPrompt(taskMilestoneRef.current);
      taskMilestoneRef.current = null;
      timer.pause();
    }
    // timer.pause is stable; fire only on the phase edge.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.phase]);

  // Live focus signal for the Focus Blocker companion (extension/desktop reads
  // this via localStorage). '1' while a focus work session is actually running.
  useEffect(() => {
    const active = mode === 'focus' && timer.running && timer.phase === 'work';
    try { localStorage.setItem('pomo:blocker-focus', active ? '1' : '0'); } catch { /* ignore */ }
  }, [mode, timer.running, timer.phase]);

  useEffect(() => {
    if (timer.running) {
      const m = Math.floor(timer.remaining / 60);
      const s = timer.remaining % 60;
      document.title = `(${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}) ${timer.phase.toUpperCase()} — Pomodoro`;
    } else {
      document.title = uiLang === 'pt' ? 'Pomodoro — Foco & Fluxo' : 'Pomodoro — Focus & Flow';
    }
  }, [timer.remaining, timer.running, timer.phase, uiLang]);

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
    ensureNotifyPermission();
  }, []);

  // Clear mode: fade the chrome out when the pointer leaves the window.
  useEffect(() => {
    if (!settings.clearMode) { setChromeHidden(false); return; }
    const hide = () => setChromeHidden(true);
    const show = () => setChromeHidden(false);
    document.documentElement.addEventListener('mouseleave', hide);
    document.documentElement.addEventListener('mouseenter', show);
    return () => {
      document.documentElement.removeEventListener('mouseleave', hide);
      document.documentElement.removeEventListener('mouseenter', show);
    };
  }, [settings.clearMode]);

  // Theme randomizer: pick a different home theme once per load.
  useEffect(() => {
    if (settings.randomizeTheme && !randomizedRef.current) {
      randomizedRef.current = true;
      const pool = THEMES.filter(th => th.id !== settings.homeTheme);
      const pick = pool[Math.floor(Math.random() * pool.length)];
      if (pick) setSettings({ homeTheme: pick.id });
    }
  }, [settings.randomizeTheme, settings.homeTheme, setSettings]);

  // Daily goal reached → celebrate / notify, at most once per day.
  useEffect(() => {
    const met = todayProgress.sessions >= goals.dailySessions || todayProgress.minutes >= goals.dailyMinutes;
    if (!met) return;
    const todayKey = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem('pomo:goalDoneDate') === todayKey) return;
      localStorage.setItem('pomo:goalDoneDate', todayKey);
    } catch {
      // Storage unavailable (private mode/quota) — treat as best-effort like the
      // rest of the app; just celebrate without the once-per-day guard.
    }
    if (settings.goalCelebrate) confetti({ particleCount: 160, spread: 90, origin: { y: 0.6 } });
    if (settings.goalNotify) {
      notify(
        uiLang === 'pt' ? 'Meta alcançada! 🎯' : 'Goal reached! 🎯',
        uiLang === 'pt' ? 'Atingiste a tua meta de foco de hoje. Bom trabalho.' : "You hit today's focus goal. Nice work.",
      );
    }
  }, [todayProgress, goals.dailySessions, goals.dailyMinutes, settings.goalCelebrate, settings.goalNotify, uiLang]);

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

  // --- Task-complete prompt (shown after the break when a task hits its estimate) ---
  const promptTask = tasks.find(t => t.id === taskPrompt) || null;
  const nextUnfinishedTaskId = () => {
    const next = tasks.find(t => !t.completed && t.id !== taskPrompt);
    return next ? next.id : null;
  };
  const closeTaskPrompt = () => setTaskPrompt(null);
  const handleTaskComplete = () => {
    const hasNext = !!nextUnfinishedTaskId();
    if (taskPrompt) handleToggleTask(taskPrompt); // completes + advances active + XP
    closeTaskPrompt();
    if (settings.autoNext && hasNext) timer.start();
  };
  const handleTaskAddSession = () => {
    if (taskPrompt) extendTaskEstimate(taskPrompt, 1); // keep counter in sync (1/1 → 1/2)
    closeTaskPrompt();
    timer.start(); // another normal-length focus session on the same task
  };
  const handleTaskAddMinutes = (m: number) => {
    if (taskPrompt) extendTaskEstimate(taskPrompt, 1);
    closeTaskPrompt();
    timer.startCustomFocus(m); // one-off custom-length focus block on the same task
  };
  const handleTaskNext = () => {
    const nid = nextUnfinishedTaskId();
    setActiveTaskId(nid); // move on WITHOUT marking the current task done
    closeTaskPrompt();
    if (nid && settings.autoNext) timer.start();
  };

  // Mobile "More" menu → route each secondary action to its existing handler,
  // so nothing from the desktop app is lost — it's just one tap deeper.
  const handleMoreAction = useCallback((action: MoreAction) => {
    setMoreOpen(false);
    switch (action) {
      case 'ambient': setMode('ambient'); setActivePanel('none'); break;
      case 'settings': setSettingsOpen(true); break;
      case 'login': setShowAuth(true); break;
      case 'share': setShowShare(true); break;
      case 'sos': setShowSos(true); break;
      // The rest are panel views (notepad/focusroom/goals/achievements/heatmap/
      // leaderboard/pricing) — open them in the bottom sheet.
      default: setActivePanel(action as PanelView);
    }
  }, [setMode]);

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
    sounds: (
      <SoundsPanel
        active={soundMixer.active}
        toggle={soundMixer.toggle}
        setVolume={soundMixer.setVolume}
        stopAll={soundMixer.stopAll}
      />
    ),
    achievements: <AchievementsPanel xp={gamification.xp} unlockedAchievements={gamification.unlockedAchievements} />,
    goals: (
      <GoalsPanel goals={goals} todayMinutes={todayProgress.minutes} todaySessions={todayProgress.sessions}
        weekMinutes={weekProgress.minutes} weekSessions={weekProgress.sessions} />
    ),
    heatmap: <HeatmapPanel history={history} />,
    leaderboard: (
      <LeaderboardPanel
        history={history}
        userId={user?.id ?? null}
        displayName={settings.displayName || (uiLang === 'pt' ? 'Anónimo' : 'Anonymous')}
        optedIn={settings.leaderboardOptIn}
        onOptInChange={v => setSettings({ leaderboardOptIn: v })}
      />
    ),
    pricing: <PricingPanel />,
    focusroom: <FocusRoom currentStatus={timer.running ? (timer.phase === 'work' ? 'focus' : 'break') : 'idle'} />,
  };

  return (
    <div className={`app-shell h-screen w-screen overflow-hidden relative font-style-${settings.clockStyle}`}>
      <AnimatePresence>
        {breakLock.active && (
          <LockOverlay
            key="lock-screen-overlay"
            remaining={breakLock.remaining}
            phase={breakLock.phase}
            totalSeconds={breakLock.totalSeconds}
            stage={breakLock.stage}
          />
        )}
      </AnimatePresence>

      {/* Always-available SOS / "I'm struggling" support (recovery) */}
      <button
        onClick={() => setShowSos(true)}
        title={uiLang === 'pt' ? 'Estou com dificuldades' : "I'm struggling"}
        className="sos-fab fixed bottom-24 left-4 z-[150] flex items-center gap-1.5 rounded-full bg-violet-600/90 px-3.5 py-2 text-[12px] font-bold text-white shadow-lg backdrop-blur hover:bg-violet-600"
      >
        <SosIcon size={15} /> SOS
      </button>
      {showSos && <SosPanel onClose={() => setShowSos(false)} />}

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
              <div className={`w-full h-full ${settings.disableAnimatedThemes ? '' : 'bg-gradient-animated'}`} style={{ background: activeTheme?.preview ?? undefined }} />
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

        <AchievementToast achievement={achievementToast} onDismiss={() => { if (achievementTimer.current) clearTimeout(achievementTimer.current); showNextAchievement(); }} />
        <WhatsNew />

        {/* Home: big clock + greeting + quote. Focus/Ambient: logo + quote chrome only. */}
        <ClockDisplay
          format={settings.clockFormat}
          showSeconds={settings.showSeconds}
          displayName={settings.displayName}
          timezone={settings.timezone}
          clockFont={settings.clockFont}
          clockStyle={settings.clockStyle}
          fontScale={settings.fontScale}
          chromeOnly={mode !== 'home'}
          showGreetings={settings.showGreetings}
          quoteCategory={settings.quoteCategory}
          showClock={settings.showClock}
          showQuote={settings.showQuote}
          showLogo={settings.showLogo}
        />

        {settings.goalShowOnDashboard && mode === 'home' && (
          <div className="goal-pill fixed bottom-28 left-1/2 -translate-x-1/2 z-30 glass-panel px-4 py-2 flex items-center gap-2 text-xs font-bold text-white/80 whitespace-nowrap">
            🎯 {todayProgress.sessions}/{goals.dailySessions} {uiLang === 'pt' ? 'sessões' : 'sessions'} · {todayProgress.minutes}/{goals.dailyMinutes}m {uiLang === 'pt' ? 'hoje' : 'today'}
          </div>
        )}

        {/* Focus mode: timer-centric layout */}
        {mode === 'focus' && (
          <div className="h-full flex flex-col items-center justify-center px-4">
            <FocusSessionTitle
              activeTaskName={tasks.find(t => t.id === activeTaskId)?.name}
              onOpenTasks={() => setActivePanel('tasks')}
            />
            {taskEta && (
              <div className="mb-2 -mt-1 glass-panel px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-white/80 whitespace-nowrap">
                🏁 {uiLang === 'pt' ? 'Conclui ~' : 'Done ~'}{taskEta.clock}
                <span className="text-white/40">· {taskEta.remaining} {uiLang === 'pt' ? 'restantes' : 'left'}</span>
              </div>
            )}
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

        {isMobile ? (
          <BottomSheet
            open={activePanel !== 'none'}
            onClose={() => setActivePanel('none')}
            closeLabel={uiLang === 'pt' ? 'Fechar' : 'Close'}
          >
            <Suspense fallback={null}>{panelContent[activePanel]}</Suspense>
          </BottomSheet>
        ) : (
          <div className="panel-dock fixed bottom-24 left-4 z-40">
            <Suspense fallback={null}>
              <AnimatePresence mode="wait">
                {activePanel !== 'none' && panelContent[activePanel]}
              </AnimatePresence>
            </Suspense>
          </div>
        )}

        {isMobile ? (
          <>
            <MobileTabBar
              mode={mode}
              activePanel={activePanel}
              moreOpen={moreOpen}
              onHome={() => { setMode('home'); setActivePanel('none'); setMoreOpen(false); }}
              onTasks={() => { setMoreOpen(false); setActivePanel(p => (p === 'tasks' ? 'none' : 'tasks')); }}
              onFocus={() => { setMode('focus'); setActivePanel('none'); setMoreOpen(false); }}
              onSounds={() => { setMoreOpen(false); setActivePanel(p => (p === 'sounds' ? 'none' : 'sounds')); }}
              onMore={() => { setActivePanel('none'); setMoreOpen(o => !o); }}
            />
            <BottomSheet
              open={moreOpen}
              onClose={() => setMoreOpen(false)}
              closeLabel={uiLang === 'pt' ? 'Fechar' : 'Close'}
            >
              <MoreSheet loggedIn={!!user} onAction={handleMoreAction} />
            </BottomSheet>
          </>
        ) : (
          <div className={`transition-opacity duration-500 ${chromeHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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
              showShareButton={settings.showShareButton}
            />
          </div>
        )}

        {showShare && <ShareModal onClose={() => setShowShare(false)} />}

        {promptTask && (
          <TaskCompletePrompt
            taskName={promptTask.name}
            done={promptTask.pomodorosDone}
            est={promptTask.estPomodoros}
            workMinutes={settings.work}
            hasNextTask={!!nextUnfinishedTaskId()}
            onComplete={handleTaskComplete}
            onAddSession={handleTaskAddSession}
            onAddMinutes={handleTaskAddMinutes}
            onNextTask={handleTaskNext}
            onClose={closeTaskPrompt}
          />
        )}
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