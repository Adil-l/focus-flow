import { isTauri } from './index';

// Open a URL in the system browser / mail client — never inside the app webview.
// In Tauri, window.open would load the site inside the app; use the Rust
// open_url command instead.
export async function openExternal(url: string): Promise<void> {
  if (isTauri()) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_url', { url });
      return;
    } catch { /* fall through to web behaviour */ }
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}
