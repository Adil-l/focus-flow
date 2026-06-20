import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from './useTimer';
import type { Settings } from '@/stores/pomodoroStore';

// Minimal settings object — useTimer only reads the timer-related fields.
// NOTE: must be created once per test and kept referentially stable, otherwise
// the hook's effect re-schedules the interval on every render.
const makeSettings = (overrides: Partial<Settings> = {}): Settings =>
  ({
    work: 1,
    short: 1,
    long: 1,
    cyclesForLong: 4,
    timerMode: 'pomodoro',
    autoNext: true,
    ...overrides,
  } as unknown as Settings);

// Advance fake time one second per act() so React flushes between ticks and the
// hook's internal `remainingRef` updates each step (a single large advance would
// be batched into one render and only decrement once).
const advanceSeconds = (n: number) => {
  for (let i = 0; i < n; i++) {
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  }
};

describe('useTimer', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('initialises to the work phase, stopped', () => {
    const settings = makeSettings({ work: 25 });
    const { result } = renderHook(() => useTimer({ settings, onSessionComplete: vi.fn() }));
    expect(result.current.phase).toBe('work');
    expect(result.current.running).toBe(false);
    expect(result.current.remaining).toBe(25 * 60);
    expect(result.current.sessions).toBe(0);
  });

  it('counts down while running', () => {
    const settings = makeSettings({ work: 25 });
    const { result } = renderHook(() => useTimer({ settings, onSessionComplete: vi.fn() }));

    act(() => result.current.start());
    expect(result.current.running).toBe(true);

    advanceSeconds(5);
    const afterFive = result.current.remaining;
    expect(afterFive).toBeLessThan(25 * 60);

    advanceSeconds(5);
    expect(result.current.remaining).toBeLessThan(afterFive);
  });

  it('pause stops the countdown and keeps remaining', () => {
    const settings = makeSettings({ work: 25 });
    const { result } = renderHook(() => useTimer({ settings, onSessionComplete: vi.fn() }));

    act(() => result.current.start());
    advanceSeconds(5);
    act(() => result.current.pause());
    const frozen = result.current.remaining;

    advanceSeconds(5);
    expect(result.current.running).toBe(false);
    expect(result.current.remaining).toBe(frozen);
  });

  it('reset returns to a fresh work phase', () => {
    const settings = makeSettings({ work: 25 });
    const { result } = renderHook(() => useTimer({ settings, onSessionComplete: vi.fn() }));

    act(() => result.current.start());
    advanceSeconds(10);
    act(() => result.current.reset());

    expect(result.current.phase).toBe('work');
    expect(result.current.running).toBe(false);
    expect(result.current.remaining).toBe(25 * 60);
    expect(result.current.sessions).toBe(0);
  });

  it('transitions work -> short break and reports completion', () => {
    const settings = makeSettings({ work: 1 });
    const onSessionComplete = vi.fn();
    const { result } = renderHook(() => useTimer({ settings, onSessionComplete }));

    act(() => result.current.start());
    // 1-minute work phase; advance past it with a margin for the timer's drift.
    advanceSeconds(65);

    expect(onSessionComplete).toHaveBeenCalledWith('work', 60);
    expect(result.current.phase).toBe('short');
    expect(result.current.sessions).toBe(1);
  });

  it('goes to a long break after the configured number of cycles', () => {
    const settings = makeSettings({ work: 1, short: 1, cyclesForLong: 2 });
    const onSessionComplete = vi.fn();
    const { result } = renderHook(() => useTimer({ settings, onSessionComplete }));

    act(() => result.current.start());
    // work -> short -> work: the 2nd work completion triggers the long break.
    advanceSeconds(200);

    expect(result.current.phase).toBe('long');
  });
});
