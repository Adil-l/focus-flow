import { useEffect } from 'react';

interface ShortcutActions {
  onStartPause: () => void;
  onReset: () => void;
  onSkipBreak: () => void;
  onToggleTasks: () => void;
  onToggleSounds: () => void;
  onToggleNotepad: () => void;
  onToggleSettings: () => void;
  onToggleFullscreen: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          actions.onStartPause();
          break;
        case 'r':
          if (!e.ctrlKey && !e.metaKey) actions.onReset();
          break;
        case 's':
          if (!e.ctrlKey && !e.metaKey) actions.onSkipBreak();
          break;
        case 't':
          actions.onToggleTasks();
          break;
        case 'm':
          actions.onToggleSounds();
          break;
        case 'n':
          actions.onToggleNotepad();
          break;
        case ',':
          actions.onToggleSettings();
          break;
        case 'f':
          if (!e.ctrlKey && !e.metaKey) actions.onToggleFullscreen();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [actions]);
}
