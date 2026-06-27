// =============================================================================
// Mobile / web build surface
// =============================================================================
// The phone build is the plain web app — no Tauri shell — so the desktop-only
// native features (system blocker, break kiosk) simply don't exist here. The UI
// checks `capabilities.*` from '@/platform' and degrades gracefully.
//
// HARD RULE: nothing in this folder may import from ../desktop or @tauri-apps/*.
// That import boundary is the whole point of the split — it keeps native desktop
// code out of the mobile build.
//
// The visual adaptation itself lives next to this file in `mobile.css` (loaded
// once from main.tsx, scoped to @media (max-width: 767px) so it's inert on the
// desktop app's wide window).
// =============================================================================

export { isMobile } from '@/platform';

/** Screen width (px) below which the mobile layout applies. Mirrors the value
 *  baked into mobile.css and useIsMobile(). */
export const MOBILE_BREAKPOINT = 768;
