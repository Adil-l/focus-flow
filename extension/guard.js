// guard.js — makes turning the blocker OFF deliberately hard (the "friction"
// layer). Pure helpers shared by background.js and popup.js. The idea: once the
// guard is *armed*, you cannot weaken protection (master off, un-tick a
// category, enable focus-only, add an allow-list entry, remove a personal
// block) on impulse. To weaken anything you must pass a challenge — retype a
// commitment phrase + the password you set — and then *wait out a cooldown*.
// Only inside the short window after the cooldown can you make the change.
//
// This does NOT (and cannot) stop someone removing the extension from
// chrome://extensions — that is what the macOS managed-policy layer is for
// (see hardening/). This layer kills the impulsive "ugh, let me just turn it
// off for a sec" path, which is what actually breaks focus streaks.

export const GUARD_KEY = 'guard';

export const DEFAULT_GUARD = {
  active: false,      // is the lock armed?
  saltHex: null,      // per-install random salt
  passHash: null,     // SHA-256(salt + ':' + password)
  phrase: '',         // commitment phrase the user must retype verbatim
  cooldownMin: 5,     // minutes to wait after a correct challenge
  unlockAt: null,     // epoch ms when the editable window opens (set by challenge)
};

// After the cooldown elapses, you get this long to actually flip things off
// before the lock re-arms itself.
export const UNLOCK_WINDOW_MS = 2 * 60 * 1000;

const CAT_KEYS = ['distracting', 'gambling', 'adult', 'threat'];

export async function getGuard() {
  const s = await chrome.storage.local.get(GUARD_KEY);
  return { ...DEFAULT_GUARD, ...(s[GUARD_KEY] || {}) };
}

export async function setGuard(patch) {
  const cur = await getGuard();
  const next = { ...cur, ...patch };
  await chrome.storage.local.set({ [GUARD_KEY]: next });
  return next;
}

// --- password hashing (SHA-256 + random salt; no plaintext ever stored) ---

function buf2hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomSaltHex() {
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  return [...a].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPassword(password, saltHex) {
  const data = new TextEncoder().encode(saltHex + ':' + password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return buf2hex(digest);
}

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function verifyPassword(guard, password) {
  if (!guard.passHash || !guard.saltHex) return false;
  const h = await hashPassword(password, guard.saltHex);
  return timingSafeEqual(h, guard.passHash);
}

// --- lock state ---

export function inUnlockWindow(guard, now = Date.now()) {
  return guard.unlockAt != null && now >= guard.unlockAt && now <= guard.unlockAt + UNLOCK_WINDOW_MS;
}

// Locked = armed AND not currently inside the post-cooldown editable window.
export function isLocked(guard, now = Date.now()) {
  return !!guard.active && !inUnlockWindow(guard, now);
}

// --- protection-strength logic ---

// Does `next` reduce protection vs `prev`?
export function weakens(prev, next) {
  if (prev.enabled && next.enabled === false) return true;
  if (!prev.focusOnly && next.focusOnly === true) return true; // narrows when blocking applies
  for (const k of CAT_KEYS) {
    if (prev.categories?.[k] && next.categories?.[k] === false) return true;
  }
  const prevAllow = new Set(prev.personalAllow || []);
  for (const d of next.personalAllow || []) if (!prevAllow.has(d)) return true; // new exception
  const nextBlock = new Set(next.personalBlock || []);
  for (const d of prev.personalBlock || []) if (!nextBlock.has(d)) return true; // dropped a block
  return false;
}

// Merge an incoming config so it can only ever *strengthen* protection.
// Used by background.js to neutralise any weakening write while locked.
export function mergeNoWeaken(prev, next) {
  const out = { ...next };
  out.enabled = prev.enabled ? true : next.enabled;
  out.focusOnly = (!prev.focusOnly && next.focusOnly) ? false : next.focusOnly;
  out.categories = { ...(next.categories || {}) };
  for (const k of CAT_KEYS) if (prev.categories?.[k]) out.categories[k] = true;
  const prevAllow = new Set(prev.personalAllow || []);
  out.personalAllow = (next.personalAllow || []).filter((d) => prevAllow.has(d));
  out.personalBlock = [...new Set([...(prev.personalBlock || []), ...(next.personalBlock || [])])];
  return out;
}
