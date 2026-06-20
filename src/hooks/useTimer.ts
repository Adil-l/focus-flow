import { useCallback, useEffect, useRef, useState } from 'react';
import type { SessionPhase, Settings, TimerMode } from '@/stores/pomodoroStore';

interface UseTimerOptions {
  settings: Settings;
  onSessionComplete: (phase: SessionPhase, duration: number) => void;
}

export function useTimer({ settings, onSessionComplete }: UseTimerOptions) {
  const [phase, setPhase] = useState<SessionPhase>('work');
  const [remaining, setRemaining] = useState(settings.work * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [stopwatchTime, setStopwatchTime] = useState(0);

  const expectedRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef(phase);
  const remainingRef = useRef(remaining);
  const sessionsRef = useRef(sessions);
  const runningRef = useRef(running);

  phaseRef.current = phase;
  remainingRef.current = remaining;
  sessionsRef.current = sessions;
  runningRef.current = running;

  const getTotalForPhase = useCallback((p: SessionPhase) => {
    if (settings.timerMode === '52/17') {
      return p === 'work' ? 52 * 60 : 17 * 60;
    }
    if (settings.timerMode === 'animedoro') {
      return p === 'work' ? 40 * 60 : 20 * 60;
    }
    if (p === 'work') return settings.work * 60;
    if (p === 'short') return settings.short * 60;
    return settings.long * 60;
  }, [settings]);

  const total = settings.timerMode === 'stopwatch' ? stopwatchTime : getTotalForPhase(phase);

  const progress = settings.timerMode === 'stopwatch'
    ? 0
    : Math.max(0, Math.min(100, Math.round((1 - remaining / getTotalForPhase(phase)) * 100)));

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    if (!runningRef.current) return;

    if (settings.timerMode === 'stopwatch') {
      setStopwatchTime(prev => prev + 1);
      expectedRef.current += 1000;
      const drift = Date.now() - expectedRef.current;
      intervalRef.current = setTimeout(tick, Math.max(0, 1000 - drift));
      return;
    }

    const newRemaining = Math.max(0, remainingRef.current - 1);
    setRemaining(newRemaining);

    if (newRemaining <= 0) {
      const currentPhase = phaseRef.current;
      const duration = getTotalForPhase(currentPhase);
      onSessionComplete(currentPhase, duration);

      if (currentPhase === 'work') {
        const newSessions = sessionsRef.current + 1;
        setSessions(newSessions);
        const cyclesForLong = settings.cyclesForLong || 4;
        if (newSessions % cyclesForLong === 0) {
          setPhase('long');
          setRemaining(getTotalForPhase('long'));
        } else {
          setPhase('short');
          setRemaining(getTotalForPhase('short'));
        }
      } else {
        setPhase('work');
        setRemaining(getTotalForPhase('work'));
      }

      if (!settings.autoNext) {
        setRunning(false);
        return;
      }
    }

    expectedRef.current += 1000;
    const drift = Date.now() - expectedRef.current;
    intervalRef.current = setTimeout(tick, Math.max(0, 1000 - drift));
  }, [settings, getTotalForPhase, onSessionComplete]);

  const start = useCallback(() => {
    if (runningRef.current) return;
    setRunning(true);
    expectedRef.current = Date.now() + 1000;
    intervalRef.current = setTimeout(tick, 1000);
  }, [tick]);

  const pause = useCallback(() => {
    setRunning(false);
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    pause();
    setPhase('work');
    setRemaining(getTotalForPhase('work'));
    setSessions(0);
    setStopwatchTime(0);
  }, [pause, getTotalForPhase]);

  const resetSegment = useCallback(() => {
    pause();
    setRemaining(getTotalForPhase(phaseRef.current));
  }, [pause, getTotalForPhase]);

  const skipBreak = useCallback(() => {
    if (phaseRef.current !== 'work') {
      clearTimer();
      setPhase('work');
      setRemaining(getTotalForPhase('work'));
      if (runningRef.current) {
        expectedRef.current = Date.now() + 1000;
        intervalRef.current = setTimeout(tick, 1000);
      }
    }
  }, [clearTimer, getTotalForPhase, tick]);

  // Cleanup
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Restart tick when running changes
  useEffect(() => {
    if (running) {
      clearTimer();
      expectedRef.current = Date.now() + 1000;
      intervalRef.current = setTimeout(tick, 1000);
    }
    return () => clearTimer();
  }, [running, tick, clearTimer]);

  // Update remaining when settings change and not running
  useEffect(() => {
    if (!running) {
      setRemaining(getTotalForPhase(phase));
    }
  }, [running, phase, getTotalForPhase]);

  const displayTime = settings.timerMode === 'stopwatch' ? stopwatchTime : remaining;

  return {
    phase,
    remaining: displayTime,
    running,
    sessions,
    progress,
    total: getTotalForPhase(phase),
    start,
    pause,
    reset,
    resetSegment,
    skipBreak,
    setPhase,
  };
}
