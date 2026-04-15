import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import ClockDisplay from '@/components/ClockDisplay';
import TimerDisplay from '@/components/TimerDisplay';
import TaskPanel from '@/components/TaskPanel';
import StatsPanel from '@/components/StatsPanel';
import NotepadPanel from '@/components/NotepadPanel';
import SoundsPanel from '@/components/SoundsPanel';
import SettingsPanel from '@/components/SettingsPanel';
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

  const streak = calculateStreak(history);

  const onSessionComplete = useCallback((phase: 'work' | 'short' | 'long', duration: number) => {
    const activeTask = tasks.find(t => t.id === activeTaskId);
    const category = activeTask?.name || 'Sem categoria';

    if (phase === 'work') {
      addEntry({ ts: Date.now(), type: 'work', duration, category });
      if (activeTaskId) incrementPomodoro(activeTaskId);

      // Vibrate
      if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
    } else {
      addEntry({ ts: Date.now(), type: 'break', duration, category: 'break' });
    }

    // Notification
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro', {
        body: phase === 'work' ? 'Sessão de foco concluída! 🎉' : 'Pausa terminada, volta ao foco! 💪',
      });
    }

    // Check if all tasks completed → confetti
    const allDone = tasks.length > 0 && tasks.every(t => t.completed);
    if (allDone) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
  }, [tasks, activeTaskId, addEntry, incrementPomodoro]);

  const timer = useTimer({ settings, onSessionComplete });

  // Update document title
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

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen();
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
          // Confetti if all done
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
    stats: <StatsPanel history={history} onClearHistory={clearHistory} />,
    settings: (
      <SettingsPanel
        settings={settings}
        presets={presets}
        onUpdate={setSettings}
        onAddPreset={addPreset}
        onRemovePreset={removePreset}
      />
    ),
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-8 pb-20">
      <div className="w-full max-w-2xl">
        {/* Clock & greeting */}
        {dashMode === 'home' && (
          <ClockDisplay
            format={settings.clockFormat}
            showSeconds={settings.showSeconds}
            displayName={settings.displayName}
          />
        )}

        {/* Timer */}
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
        />

        {/* Active task indicator */}
        {activeTaskId && (
          <div className="mt-4 text-center">
            <span className="text-xs text-muted-foreground">A trabalhar em: </span>
            <span className="text-sm font-medium text-foreground">
              {tasks.find(t => t.id === activeTaskId)?.emoji}{' '}
              {tasks.find(t => t.id === activeTaskId)?.name}
            </span>
          </div>
        )}

        {/* Side panel */}
        <AnimatePresence mode="wait">
          {activePanel !== 'none' && (
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              className="mt-6"
            >
              {panelContent[activePanel]}
            </motion.div>
          )}
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
      />
    </div>
  );
};

export default Index;
