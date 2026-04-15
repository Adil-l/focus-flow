import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import ClockDisplay from '@/components/ClockDisplay';
import TimerDisplay from '@/components/TimerDisplay';
import TaskPanel from '@/components/TaskPanel';
import NotepadPanel from '@/components/NotepadPanel';
import SoundsPanel from '@/components/SoundsPanel';
import SettingsSidebar from '@/components/SettingsSidebar';
import BottomBar, { type PanelView, type DashboardMode } from '@/components/BottomBar';
import { useSettings, useTasks, useHistory, usePresets, useNotepad, calculateStreak } from '@/stores/pomodoroStore';
import { useTimer } from '@/hooks/useTimer';

const Index = () => {
  const { settings, setSettings } = useSettings();
  const { tasks, activeTaskId, setActiveTaskId, addTask, toggleTask, removeTask, incrementPomodoro } = useTasks();
  const { history, addEntry, clearHistory } = useHistory();
  const { presets, addPreset, removePreset } = usePresets();
  const { content: noteContent, setContent: setNoteContent } = useNotepad();

  const [activePanel, setActivePanel] = useState<PanelView>('none');
  const [dashMode, setDashMode] = useState<DashboardMode>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const streak = calculateStreak(history);

  const onSessionComplete = useCallback((phase: 'work' | 'short' | 'long', duration: number) => {
    const activeTask = tasks.find(t => t.id === activeTaskId);
    const category = activeTask?.name || 'Sem categoria';

    if (phase === 'work') {
      addEntry({ ts: Date.now(), type: 'work', duration, category });
      if (activeTaskId) incrementPomodoro(activeTaskId);
      if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
    } else {
      addEntry({ ts: Date.now(), type: 'break', duration, category: 'break' });
    }

    if (Notification.permission === 'granted') {
      new Notification('Pomodoro', {
        body: phase === 'work' ? 'Focus session complete! 🎉' : 'Break over, time to focus! 💪',
      });
    }

    const allDone = tasks.length > 0 && tasks.every(t => t.completed);
    if (allDone) confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
  }, [tasks, activeTaskId, addEntry, incrementPomodoro]);

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
      (navigator as any).wakeLock.request('screen').then((lock: WakeLockSentinel) => { wl = lock; }).catch(() => {});
    }
    return () => { wl?.release(); };
  }, [settings.preventSleep, timer.running]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
  };

  const handlePhaseSelect = (phase: 'work' | 'short' | 'long') => {
    if (!timer.running) {
      timer.setPhase(phase);
    }
  };

  const panelContent: Record<PanelView, React.ReactNode> = {
    none: null,
    tasks: (
      <TaskPanel
        tasks={tasks}
        activeTaskId={activeTaskId}
        onAddTask={addTask}
        onToggleTask={(id) => {
          toggleTask(id);
          const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
          if (updated.length > 0 && updated.every(t => t.completed)) {
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          }
        }}
        onRemoveTask={removeTask}
        onSetActive={setActiveTaskId}
      />
    ),
    sounds: (
      <SoundsPanel
        ambientSound={settings.ambientSound}
        ambientVolume={settings.ambientVolume}
        onSoundChange={s => setSettings({ ambientSound: s })}
        onVolumeChange={v => setSettings({ ambientVolume: v })}
      />
    ),
    notepad: <NotepadPanel content={noteContent} onChange={setNoteContent} />,
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-animated relative">
      {/* Animated orbs */}
      {!settings.disableAnimatedThemes && (
        <>
          <div className="bg-orb bg-orb-1" />
          <div className="bg-orb bg-orb-2" />
          <div className="bg-orb bg-orb-3" />
        </>
      )}

      {/* Top bar */}
      <ClockDisplay format={settings.clockFormat} showSeconds={settings.showSeconds} displayName={settings.displayName} />

      {/* Main content - centered timer */}
      <div className="h-full flex flex-col items-center justify-center px-4">
        <TimerDisplay
          remaining={timer.remaining}
          phase={timer.phase}
          running={timer.running}
          progress={timer.progress}
          sessions={timer.sessions}
          tallyStyle={settings.tallyStyle}
          onStart={timer.start}
          onPause={timer.pause}
          onReset={timer.reset}
          onResetSegment={timer.resetSegment}
          onSkipBreak={timer.skipBreak}
          onPhaseSelect={handlePhaseSelect}
        />
      </div>

      {/* Floating widget panels (bottom-left) */}
      <div className="fixed bottom-20 left-4 z-40">
        <AnimatePresence mode="wait">
          {activePanel !== 'none' && panelContent[activePanel]}
        </AnimatePresence>
      </div>

      {/* Bottom bar */}
      <BottomBar
        streak={streak}
        activePanel={activePanel}
        mode={dashMode}
        onPanelChange={setActivePanel}
        onModeChange={setDashMode}
        onFullscreen={toggleFullscreen}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Settings sidebar */}
      <SettingsSidebar
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        presets={presets}
        onUpdate={setSettings}
        onAddPreset={addPreset}
        onRemovePreset={removePreset}
        history={history}
        onClearHistory={clearHistory}
      />
    </div>
  );
};

export default Index;
