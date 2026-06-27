import { isMobile } from '@/platform';

// Register the service worker that makes Focus Flow installable (PWA) and
// offline-capable. Web build ONLY:
//   • Skipped in the desktop Tauri app (tauri://localhost) — it has no use for a
//     SW there and one could interfere with the custom protocol.
//   • Skipped where unsupported, or over plain http on a non-localhost host
//     (SWs require a secure context), so it never throws.
// Safe no-op in all those cases.
export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!isMobile()) return; // desktop (Tauri) → skip
  if (!('serviceWorker' in navigator)) return;

  const secure =
    window.isSecureContext ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1';
  if (!secure) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => console.warn('Service worker registration failed:', err));
  });
}
