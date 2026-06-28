// Content script injected on the Kipto web app. It reads the blocker
// config the app persists in localStorage and relays it to the extension's
// background, so toggling categories (or starting a focus session) in Focus
// Flow drives what this browser blocks — that's the "join" between the two.

const SETTINGS_KEY = 'pomo:settings';
const FOCUS_KEY = 'pomo:blocker-focus'; // '1' while a focus session is active
const BREAK_KEY = 'pomo:break-active';  // '1' while a mandatory break is locking

function readConfig() {
  // Only act on a real Kipto page; never push (and risk wiping) config
  // from somewhere that just happens to match.
  const hasFootprint =
    localStorage.getItem(SETTINGS_KEY) != null || localStorage.getItem(BREAK_KEY) != null;
  if (!hasFootprint) return null;

  let blocker = null;
  let focusActive = false;
  let breakActive = false;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) blocker = JSON.parse(raw).blocker || null;
  } catch { /* ignore malformed */ }
  try {
    focusActive = localStorage.getItem(FOCUS_KEY) === '1';
    breakActive = localStorage.getItem(BREAK_KEY) === '1';
  } catch { /* ignore */ }

  // During a mandatory break we still take over the browser even if the user
  // hasn't configured any blocker categories — so don't bail on a null blocker.
  return {
    categories: blocker?.categories || {},
    personalBlock: Array.isArray(blocker?.personalBlock) ? blocker.personalBlock : [],
    personalAllow: Array.isArray(blocker?.personalAllow) ? blocker.personalAllow : [],
    focusOnly: !!blocker?.focusOnly,
    focusActive,
    breakActive,
  };
}

let last = '';
function sync() {
  const payload = readConfig();
  if (!payload) return;
  const sig = JSON.stringify(payload);
  if (sig === last) return; // nothing changed
  last = sig;
  try {
    chrome.runtime.sendMessage({ type: 'FF_BLOCKER_SYNC', payload }, () => void chrome.runtime.lastError);
  } catch { /* extension context invalidated on reload — ignore */ }
}

sync();
setInterval(sync, 2500);
window.addEventListener('focus', sync);
