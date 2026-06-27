import { invoke } from '@tauri-apps/api/core';
import { isTauri } from '@/platform';

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

    // Snapshot current geometry to restore on exit — but ONLY if we don't
    // already hold one. A second enter before an exit (StrictMode remount, or a
    // reload re-mounting the overlay) would otherwise overwrite the real size
    // with the already-fullscreen size and never restore correctly.
    if (prevSize == null) {
      try {
        const s = await win.outerSize();
        const p = await win.outerPosition();
        prevSize = { width: s.width, height: s.height };
        prevPos = { x: p.x, y: p.y };
      } catch { /* ignore */ }
    }

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
    // Each restore step is independent: if one rejects, the rest must still run,
    // otherwise the window could stay borderless + always-on-top (visually
    // locked) even though the OS-level kiosk was already lifted above.
    const step = async (fn: () => Promise<unknown>) => { try { await fn(); } catch { /* ignore */ } };
    await step(() => win.setFullscreen(false));
    await step(() => win.setAlwaysOnTop(false));
    await step(() => win.setDecorations(true));
    if (prevSize) await step(() => win.setSize(new PhysicalSize(prevSize!.width, prevSize!.height)));
    if (prevPos) await step(() => win.setPosition(new PhysicalPosition(prevPos!.x, prevPos!.y)));
    prevSize = null;
    prevPos = null;
  } catch { /* ignore */ }
}
