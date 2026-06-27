// =============================================================================
// Desktop-only features (macOS / Tauri shell)
// =============================================================================
// Barrel for the native powers that exist ONLY in the desktop build. Guard every
// call with `capabilities.*` (or isTauri) from '@/platform' — on the web/mobile
// build these no-op, since the Tauri commands they wrap aren't there.
//
//   • blocker  — system-wide website blocker (/etc/hosts via the Rust helper)
//   • kiosk    — full-Mac break lock (borderless fill + presentation options)
//   • domains  — blocklist domain/category helpers
//   • unblockEscalation — the friction/escalation logic before disabling blocking
// =============================================================================

export * from './blocker';
export * from './kiosk';
export * from './domains';
export * from './unblockEscalation';
