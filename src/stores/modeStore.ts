import { useCallback, useState } from 'react';

// The three top-level dashboard modes, mirroring Flocus:
//  - home:    big clock + greeting + quote
//  - focus:   timer-centric ("What do you want to focus on?")
//  - ambient: immersive background with a floating timer widget
export type AppMode = 'home' | 'focus' | 'ambient';

const MODE_KEY = 'pomo:mode';
const FLOATING_KEY = 'pomo:floatingTimer';

/** Standalone mode store (kept out of Settings so it isn't cloud-synced or in the settings snapshot). */
export function useMode() {
  const [mode, setModeState] = useState<AppMode>(() => {
    const saved = localStorage.getItem(MODE_KEY);
    return saved === 'home' || saved === 'focus' || saved === 'ambient' ? saved : 'home';
  });
  const [floatingTimer, setFloatingTimerState] = useState<boolean>(
    () => localStorage.getItem(FLOATING_KEY) === '1',
  );

  const setMode = useCallback((m: AppMode) => {
    setModeState(m);
    localStorage.setItem(MODE_KEY, m);
  }, []);

  const setFloatingTimer = useCallback((v: boolean) => {
    setFloatingTimerState(v);
    localStorage.setItem(FLOATING_KEY, v ? '1' : '0');
  }, []);

  return { mode, setMode, floatingTimer, setFloatingTimer };
}
