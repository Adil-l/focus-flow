import { invoke } from '@tauri-apps/api/core';
import { isTauri } from './desktop';

// During a mandatory break, take over the whole Mac. We do an *instant* borderless
// takeover — the window is made frameless and resized to fill the entire monitor,
// floating above everything — instead of macOS native fullscreen. Native
// fullscreen animates into a separate Space, can be reversed with a trackpad
// gesture / Ctrl-Cmd-F, and (the actual bug we hit) silently refuses to engage
// once a window is already always-on-top. The manual fill maximises immediately,
// stays put, and there's nothing to escape from. The Rust `set_kiosk` command
// hides the Dock/menu bar and disables Cmd-Tab / Cmd-Q / force-quit. No-op on web.

// Remember the window's normal geometry so we can put it back after the break.
let prevSize: { width: number; height: number } | null = null;
let prevPos: { x: number; y: number } | null = null;

export async function enterBreakKiosk(): Promise<void> {
  if (!isTauri()) return;
  try {
    const { getCurrentWindow, currentMonitor } = await import('@tauri-apps/api/window');
    const { PhysicalPosition, PhysicalSize } = await import('@tauri-apps/api/dpi');
    const win = getCurrentWindow();

    // Snapshot current geometry to restore on exit.
    try {
      const s = await win.outerSize();
      const p = await win.outerPosition();
      prevSize = { width: s.width, height: s.height };
      prevPos = { x: p.x, y: p.y };
    } catch { /* ignore */ }

    // Fill the whole screen, borderless, above everything — right now.
    const mon = await currentMonitor();
    await win.setResizable(true); // some platforms ignore setSize on a fixed window
    await win.setDecorations(false);
    if (mon) {
      await win.setPosition(new PhysicalPosition(mon.position.x, mon.position.y));
      await win.setSize(new PhysicalSize(mon.size.width, mon.size.height));
    } else {
      // No monitor info — fall back to native fullscreen.
      await win.setFullscreen(true);
    }
    await win.setAlwaysOnTop(true);
    await win.setFocus();
  } catch { /* window API may be unavailable */ }

  // Hide Dock/menu bar + disable process switching / force-quit (Rust side).
  try { await invoke('set_kiosk', { on: true }); } catch { /* ignore */ }
}

export async function exitBreakKiosk(): Promise<void> {
  if (!isTauri()) return;
  try { await invoke('set_kiosk', { on: false }); } catch { /* ignore */ }
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const { PhysicalPosition, PhysicalSize } = await import('@tauri-apps/api/dpi');
    const win = getCurrentWindow();
    await win.setFullscreen(false);
    await win.setAlwaysOnTop(false);
    await win.setDecorations(true);
    // Restore the window to where it was before the break.
    if (prevSize) await win.setSize(new PhysicalSize(prevSize.width, prevSize.height));
    if (prevPos) await win.setPosition(new PhysicalPosition(prevPos.x, prevPos.y));
    prevSize = null;
    prevPos = null;
  } catch { /* ignore */ }
}
