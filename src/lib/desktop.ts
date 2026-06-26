// True when running inside the Tauri desktop shell (vs the plain web build).
// Tauri v2 injects __TAURI_INTERNALS__ on the window.
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

// The public web origin used for share links and OAuth/Stripe return URLs. In
// the desktop app window.location.origin is `tauri://localhost`, useless for
// those, so fall back to the real site.
export const APP_WEB_ORIGIN = 'https://focusflow.app';
export function webOrigin(): string {
  if (isTauri()) return APP_WEB_ORIGIN;
  return typeof window !== 'undefined' ? window.location.origin : APP_WEB_ORIGIN;
}
