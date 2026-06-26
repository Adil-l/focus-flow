import { isTauri } from '@/lib/desktop';

// Cross-platform notifications.
//   • Desktop app (Tauri): real macOS Notification Center alerts via the
//     notification plugin — these show even when the app window isn't focused.
//   • Web: the browser Notification API.
// Everything here is best-effort and must never throw into the caller.

let webAsked = false;

/** Ask once for permission up front (e.g. on first app load). Returns granted. */
export async function ensureNotifyPermission(): Promise<boolean> {
  if (isTauri()) {
    try {
      const { isPermissionGranted, requestPermission } = await import('@tauri-apps/plugin-notification');
      let granted = await isPermissionGranted();
      if (!granted) granted = (await requestPermission()) === 'granted';
      return granted;
    } catch {
      return false;
    }
  }
  if (typeof Notification === 'undefined') return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'default' && !webAsked) {
    webAsked = true;
    try {
      return (await Notification.requestPermission()) === 'granted';
    } catch {
      return false;
    }
  }
  // Reached only when permission is 'denied' (or 'default' yet already asked).
  return false;
}

/** Show a notification. No-ops silently if permission isn't granted. */
export async function notify(title: string, body?: string): Promise<void> {
  if (isTauri()) {
    try {
      const { isPermissionGranted, requestPermission, sendNotification } = await import('@tauri-apps/plugin-notification');
      let granted = await isPermissionGranted();
      if (!granted) granted = (await requestPermission()) === 'granted';
      if (granted) sendNotification(body ? { title, body } : { title });
    } catch {
      /* ignore — notifications are non-critical */
    }
    return;
  }
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, body ? { body } : undefined);
    }
  } catch {
    /* ignore */
  }
}
