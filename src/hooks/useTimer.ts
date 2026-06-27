import { useCallback, useEffect, useRef, useState } from 'react';
import type { SessionPhase, Settings } from '@/stores/pomodoroStore';

interface UseTimerOptions {
  settings: Settings;
  onSessionComplete: (phase: SessionPhase, duration: number) => void;
}

// Sub-second cadence so the displayed seconds stay accurate near boundaries.
const TICK_MS = 250;

export function useTimer({ settings, onSessionComplete }: UseTimerOptions) {
  const [phase, setPhase] = useState<SessionPhase>('work');
  const [remaining, setRemaining] = useState(settings.work * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [stopwatchTime, setStopwatchTime] = useState(0);

  // Wall-clock anchors: `remaining` is DERIVED from these, never decremented, so
  // scheduling jitter can never accumulate into drift.
  const endTimeRef = useRef<number>(0);          // ms timestamp the countdown ends
  const stopwatchStartRef = useRef<number>(0);   // ms timestamp the stopwatch started
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // One-off custom work duration (seconds). When set, the NEXT work session runs
  // for this long instead of settings.work; consumed when that session ends. Used
  // by the "+ minutes" task-prompt action. null = normal settings-based duration.
  const customWorkRef = useRef<number | null>(null);

  const phaseRef = useRef(phase);
  const remainingRef = useRef(remaining);
  const sessionsRef = useRef(sessions);
  const runningRef = useRef(running);
  const stopwatchTimeRef = useRef(stopwatchTime);

  phaseRef.current = phase;
  remainingRef.current = remaining;
  sessionsRef.current = sessions;
  runningRef.current = running;
  stopwatchTimeRef.current = stopwatchTime;

  const getTotalForPhase = useCallback((p: SessionPhase) => {
    if (p === 'work' && customWorkRef.current != null) return customWorkRef.current;
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
      setStopwatchTime(Math.floor((Date.now() - stopwatchStartRef.current) / 1000));
      intervalRef.current = setTimeout(tick, TICK_MS);
      return;
    }

    const newRemaining = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
    setRemaining(newRemaining);

    if (newRemaining <= 0) {
      const currentPhase = phaseRef.current;
      onSessionComplete(currentPhase, getTotalForPhase(currentPhase));

      let nextPhase: SessionPhase;
      if (currentPhase === 'work') {
        const newSessions = sessionsRef.current + 1;
        setSessions(newSessions);
        const cyclesForLong = settings.cyclesForLong || 4;
        nextPhase = newSessions % cyclesForLong === 0 ? 'long' : 'short';
        customWorkRef.current = null; // consume the one-off custom work duration
      } else {
        nextPhase = 'work';
      }

      const nextTotal = getTotalForPhase(nextPhase);
      setPhase(nextPhase);
      setRemaining(nextTotal);
      endTimeRef.current = Date.now() + nextTotal * 1000;

      if (!settings.autoNext) {
        setRunning(false);
        return;
      }
    }

    intervalRef.current = setTimeout(tick, TICK_MS);
  }, [settings, getTotalForPhase, onSessionComplete]);

  const start = useCallback(() => {
    if (runningRef.current) return;
    setRunning(true); // the running effect anchors the clock and starts ticking
  }, []);

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

  // Start a one-off focus session of a custom length (minutes), on the current
  // task. Used by the task prompt's "+ minutes" action.
  const startCustomFocus = useCallback((minutes: number) => {
    const secs = Math.max(1, Math.round(minutes * 60));
    customWorkRef.current = secs;
    setPhase('work');
    setRemaining(secs);
    setRunning(true); // running effect anchors the wall clock from remaining
  }, []);

  const skipBreak = useCallback(() => {
    if (phaseRef.current !== 'work') {
      const workTotal = getTotalForPhase('work');
      setPhase('work');
      setRemaining(workTotal);
      // Re-anchor the clock so the already-running tick targets the new phase.
      if (runningRef.current) endTimeRef.current = Date.now() + workTotal * 1000;
    }
  }, [getTotalForPhase]);

  // Cleanup on unmount.
  useEffect(() => () => clearTimer(), [clearTimer]);

  // Single source that starts/stops the interval and anchors the wall clock
  // whenever `running` flips (or the tick identity changes via settings).
  useEffect(() => {
    if (!running) return;
    clearTimer();
    if (settings.timerMode === 'stopwatch') {
      stopwatchStartRef.current = Date.now() - stopwatchTimeRef.current * 1000;
    } else {
      endTimeRef.current = Date.now() + remainingRef.current * 1000;
    }
    intervalRef.current = setTimeout(tick, TICK_MS);
    return () => clearTimer();
  }, [running, tick, clearTimer, settings.timerMode]);

  // Keep remaining in sync with settings while idle.
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
    total,
    start,
    pause,
    reset,
    resetSegment,
    skipBreak,
    startCustomFocus,
    setPhase,
  };
}
