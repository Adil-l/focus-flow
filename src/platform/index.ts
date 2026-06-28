// =============================================================================
// Platform layer — one place to ask "where am I running?"
// =============================================================================
// Kipto ships from a single codebase in two shapes:
//
//   • Desktop (macOS) — the React app wrapped in the Tauri shell. Has native
//     powers: the system-wide /etc/hosts website blocker and the full-Mac
//     break "kiosk" lock. Code for those lives in ./desktop.
//
//   • Mobile / web — the plain web build a phone browser loads. No Tauri, so the
//     native powers above don't exist; the UI degrades gracefully. Mobile-only
//     assets live in ./mobile (e.g. the responsive mobile.css).
//
// Everything OUTSIDE src/platform is shared core (timer, stores, UI, i18n …) and
// runs identically on both. Feature code should import detection + capabilities
// from here instead of sniffing `window` ad-hoc.
// =============================================================================

// True when running inside the Tauri desktop shell (vs the plain web build).
// Tauri v2 injects __TAURI_INTERNALS__ on the window.
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/** The macOS desktop build (Tauri shell present). */
export function isDesktop(): boolean {
  return isTauri();
}

/** The web build — what a phone browser loads (no Tauri shell). */
export function isMobile(): boolean {
  return !isTauri();
}

// The public web origin used for share links and OAuth/Stripe return URLs. In
// the desktop app window.location.origin is `tauri://localhost`, useless for
// those, so fall back to the real site.
export const APP_WEB_ORIGIN = 'https://kipto.xyz';
export function webOrigin(): string {
  if (isTauri()) return APP_WEB_ORIGIN;
  return typeof window !== 'undefined' ? window.location.origin : APP_WEB_ORIGIN;
}

/**
 * Which native capabilities exist on the current platform. The desktop-only
 * features need the Tauri shell; on the web/mobile build they're unavailable and
 * callers should hide or no-op the corresponding UI. Evaluated once at load —
 * Tauri injects its globals before app code runs.
 */
export const capabilities = {
  /** System-wide website blocker (rewrites /etc/hosts via the Rust helper). */
  systemBlocker: isTauri(),
  /** Full-Mac kiosk lock during mandatory breaks. */
  breakKiosk: isTauri(),
  /** Native OS notifications (web build falls back to the Notification API). */
  nativeNotifications: isTauri(),
} as const;
