import { invoke } from '@tauri-apps/api/core';
import { isTauri } from './desktop';

// During a mandatory break, take over the whole Mac: fullscreen + always-on-top
// window, and (via the Rust set_kiosk command) hide the Dock/menu bar and disable
// Cmd-Tab / Cmd-Q / force-quit. No-op in the web build.

export async function enterBreakKiosk(): Promise<void> {
  if (!isTauri()) return;
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const win = getCurrentWindow();
    await win.setAlwaysOnTop(true);
    await win.setFullscreen(true);
    await win.setFocus();
  } catch { /* window API may be unavailable */ }
  try { await invoke('set_kiosk', { on: true }); } catch { /* ignore */ }
}

export async function exitBreakKiosk(): Promise<void> {
  if (!isTauri()) return;
  try { await invoke('set_kiosk', { on: false }); } catch { /* ignore */ }
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const win = getCurrentWindow();
    await win.setFullscreen(false);
    await win.setAlwaysOnTop(false);
  } catch { /* ignore */ }
}
