import { CATEGORIES, CATEGORY_KEYS } from './categories.js';
import { getGuard, isLocked, weakens, mergeNoWeaken } from './guard.js';

const STORAGE_KEY = 'config';

const DEFAULT_CONFIG = {
  enabled: true,
  // When true, only block while a Focus Flow focus session is running.
  focusOnly: false,
  focusActive: false,
  // When true, a mandatory break is in progress -> take over the whole browser.
  breakActive: false,
  categories: { distracting: false, ads: true, gambling: true, adult: true, piracy: true, threat: true },
  personalBlock: [],
  personalAllow: [],
};

// Hosts always reachable (so the Focus Flow timer tab stays visible during a break).
const ALLOW_HOSTS = [
  'localhost', '127.0.0.1', 'focusflow.app', 'vercel.app', 'netlify.app',
  'ngrok-free.dev', 'ngrok-free.app', 'ngrok.app', 'trycloudflare.com',
];

const SUB_RESOURCE_TYPES = [
  'sub_frame', 'stylesheet', 'script', 'image', 'font',
  'object', 'xmlhttprequest', 'ping', 'media', 'websocket', 'other',
];

const normDomain = (d) =>
  String(d || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^\.+|\.+$/g, '');

async function getConfig() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  return { ...DEFAULT_CONFIG, ...(stored[STORAGE_KEY] || {}) };
}

function effectiveDomains(config) {
  const set = new Set();
  for (const key of CATEGORY_KEYS) {
    if (config.categories?.[key]) {
      for (const d of CATEGORIES[key].domains) set.add(normDomain(d));
    }
  }
  for (const d of config.personalBlock || []) {
    const n = normDomain(d);
    if (n && n.includes('.')) set.add(n);
  }
  for (const d of config.personalAllow || []) set.delete(normDomain(d));
  set.delete('');
  return [...set];
}

function blockingActive(config) {
  if (!config.enabled) return false;
  if (config.focusOnly && !config.focusActive) return false;
  return true;
}

// Build DNR rules: redirect top-level navigations to a friendly page, hard-block
// every sub-resource. Two rules per domain keeps it readable and well within the
// dynamic-rule budget for a curated list.
function buildRules(domains) {
  const rules = [];
  let id = 1;
  const blockedPage = chrome.runtime.getURL('blocked.html');
  for (const domain of domains) {
    const urlFilter = `||${domain}^`;
    rules.push({
      id: id++,
      priority: 1,
      action: { type: 'redirect', redirect: { url: `${blockedPage}?d=${encodeURIComponent(domain)}` } },
      condition: { urlFilter, resourceTypes: ['main_frame'] },
    });
    rules.push({
      id: id++,
      priority: 1,
      action: { type: 'block' },
      condition: { urlFilter, resourceTypes: SUB_RESOURCE_TYPES },
    });
  }
  return rules;
}

// Full-browser takeover during a mandatory break: allow the Focus Flow tab,
// redirect every other top-level navigation to the break screen.
function buildTakeoverRules() {
  const breakPage = chrome.runtime.getURL('blocked.html?break=1');
  return [
    {
      id: 1,
      priority: 2,
      action: { type: 'allow' },
      condition: { requestDomains: ALLOW_HOSTS, resourceTypes: ['main_frame'] },
    },
    {
      id: 2,
      priority: 1,
      action: { type: 'redirect', redirect: { url: breakPage } },
      condition: { resourceTypes: ['main_frame'] },
    },
  ];
}

// Actively pull already-open tabs onto the break screen (DNR only catches new
// navigations). Leaves the Focus Flow tab and browser/extension pages alone.
async function enforceTakeoverTabs() {
  const breakPage = chrome.runtime.getURL('blocked.html?break=1');
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) {
      if (!tab.id || !tab.url) continue;
      if (/^(chrome|edge|brave|about|chrome-extension|moz-extension|view-source):/.test(tab.url)) continue;
      let host = '';
      try { host = new URL(tab.url).hostname; } catch { continue; }
      const allowed = ALLOW_HOSTS.some((d) => host === d || host.endsWith('.' + d));
      if (!allowed) chrome.tabs.update(tab.id, { url: breakPage });
    }
  } catch { /* tabs permission may be limited */ }
}

async function _applyRules() {
  const config = await getConfig();
  updateAutoClose(config);
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);

  let addRules;
  if (config.breakActive) {
    addRules = buildTakeoverRules();
  } else {
    addRules = blockingActive(config) ? buildRules(effectiveDomains(config)) : [];
  }

  // Chrome caps dynamic rules; a curated list stays well under, but guard anyway.
  const MAX = chrome.declarativeNetRequest.MAX_NUMBER_OF_DYNAMIC_RULES || 5000;
  const capped = addRules.slice(0, MAX);

  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules: capped });
  if (config.breakActive) enforceTakeoverTabs();
  await updateBadge(config, capped.length);
}

// Serialize rule updates. Multiple triggers (onInstalled, onStartup, storage
// changes) can fire at once; without a queue they each read 0 existing rules
// and re-add id 1 -> "Rule with id 1 does not have a unique ID".
let applyChain = Promise.resolve();
function applyRules() {
  applyChain = applyChain.then(_applyRules).catch((e) => console.warn('[blocker] applyRules failed', e));
  return applyChain;
}

async function updateBadge(config, ruleCount) {
  const breakOn = config.breakActive;
  const on = breakOn || (blockingActive(config) && ruleCount > 0);
  try {
    await chrome.action.setBadgeText({ text: breakOn ? '⏸' : on ? 'ON' : '' });
    await chrome.action.setBadgeBackgroundColor({ color: on ? '#7c3aed' : '#000000' });
  } catch { /* action API may be unavailable in some contexts */ }
}

// Rebuild whenever the config changes (popup writes, or the Focus Flow bridge).
// When the guard is locked, this listener is also the *backstop*: any write that
// would weaken protection is reverted to its strengthened form. So even if a
// config write slips past the popup UI (devtools, a stale bridge, a race), the
// blocker cannot be loosened until the user passes the timed challenge.
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes[STORAGE_KEY]) return;
  (async () => {
    const guard = await getGuard();
    if (isLocked(guard)) {
      const prev = changes[STORAGE_KEY].oldValue;
      const next = changes[STORAGE_KEY].newValue;
      if (prev && next && weakens(prev, next)) {
        const corrected = mergeNoWeaken(prev, next);
        // Writing the corrected config re-fires onChanged, but mergeNoWeaken is a
        // fixpoint (corrected never weakens prev) so it settles immediately.
        await chrome.storage.local.set({ [STORAGE_KEY]: corrected });
        return; // applyRules runs on the follow-up change with the safe config
      }
    }
    applyRules();
  })();
});

chrome.runtime.onInstalled.addListener(async () => {
  const cur = await chrome.storage.local.get(STORAGE_KEY);
  if (!cur[STORAGE_KEY]) await chrome.storage.local.set({ [STORAGE_KEY]: DEFAULT_CONFIG });
  applyRules();
});

chrome.runtime.onStartup.addListener(applyRules);

// Messages from the Focus Flow page bridge (config + live focus signal).
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'FF_BLOCKER_SYNC' && msg.payload) {
    (async () => {
      const config = await getConfig();
      let next = { ...config };
      if (msg.payload.categories) next.categories = { ...config.categories, ...msg.payload.categories };
      if (Array.isArray(msg.payload.personalBlock)) next.personalBlock = msg.payload.personalBlock;
      if (Array.isArray(msg.payload.personalAllow)) next.personalAllow = msg.payload.personalAllow;
      if (typeof msg.payload.focusOnly === 'boolean') next.focusOnly = msg.payload.focusOnly;
      if (typeof msg.payload.focusActive === 'boolean') next.focusActive = msg.payload.focusActive;
      if (typeof msg.payload.breakActive === 'boolean') next.breakActive = msg.payload.breakActive;
      // focusActive / breakActive are live session signals, not protection
      // strength — let them through. Everything else is clamped so the app can
      // never be used to loosen the blocker while the guard is locked.
      const guard = await getGuard();
      if (isLocked(guard)) {
        const merged = mergeNoWeaken(config, next);
        next = { ...merged, focusActive: next.focusActive, breakActive: next.breakActive };
      }
      await chrome.storage.local.set({ [STORAGE_KEY]: next }); // triggers applyRules via onChanged
      sendResponse({ ok: true });
    })();
    return true; // async response
  }
  return false;
});

// --- Auto-close ad / pop-under tabs ------------------------------------------
// Ad scripts on streaming / download / betting pages spawn a new tab (a
// "pop-under") that redirects through an ad network to a betting or adult
// landing page. DNR already redirects that tab to blocked.html, but the user is
// still left with a stray tab to dismiss by hand. When the Ads / Pop-ups
// category is on we detect that freshly-spawned tab and close it automatically,
// returning focus to the page the user was actually on — "validate, close, skip
// past the ad tab". We only ever close a tab that:
//   (a) was opened *by another tab* (has an opener) — never one the user typed
//       in or that the browser restored,
//   (b) is *fresh* (just spawned) — so it's the pop-under, not a tab they've
//       been using and happened to navigate somewhere blocked, and
//   (c) targets a blocked ad / betting / adult / piracy host.
// Anything else is left to the normal blocked.html redirect.

const POPUP_TTL_MS = 20000;        // watch a spawned tab this long for an ad redirect
const popupTabs = new Map();       // tabId -> { opener, ts }
const AUTO_CLOSE_CATS = ['ads', 'gambling', 'adult', 'piracy'];
let autoCloseOn = false;
let autoCloseReady = false;        // has the host set been computed since SW start?
let autoCloseSet = new Set();

function updateAutoClose(config) {
  autoCloseReady = true;
  autoCloseOn = blockingActive(config) && !!config.categories?.ads && !config.breakActive;
  if (!autoCloseOn) { autoCloseSet = new Set(); return; }
  const set = new Set();
  for (const key of AUTO_CLOSE_CATS) {
    if (config.categories?.[key] && CATEGORIES[key]?.domains) {
      for (const d of CATEGORIES[key].domains) set.add(normDomain(d));
    }
  }
  for (const d of config.personalBlock || []) {
    const n = normDomain(d);
    if (n && n.includes('.')) set.add(n);
  }
  for (const d of config.personalAllow || []) set.delete(normDomain(d));
  set.delete('');
  autoCloseSet = set;
}

// Recompute lazily after a service-worker restart (which resets module state)
// so the first tab event still sees a correct host set.
async function ensureAutoClose() {
  if (!autoCloseReady) updateAutoClose(await getConfig());
}

function hostInAutoClose(host) {
  if (!host) return false;
  let h = String(host).toLowerCase().replace(/^www\./, '');
  while (h.includes('.')) {                 // ads.x.popads.net -> x.popads.net -> popads.net
    if (autoCloseSet.has(h)) return true;
    h = h.slice(h.indexOf('.') + 1);
  }
  return false;
}

const BLOCKED_PREFIX = chrome.runtime.getURL('blocked.html');

// The blocked host an ad tab targets, or null if the tab must NOT be closed.
function adTargetHost(url) {
  if (!url) return null;
  if (url.startsWith(BLOCKED_PREFIX)) {
    if (/[?&]break=1/.test(url)) return null; // never close the break-takeover screen
    const m = url.match(/[?&]d=([^&]+)/);
    if (!m) return null;
    let d = '';
    try { d = decodeURIComponent(m[1]); } catch { d = m[1]; }
    return hostInAutoClose(d) ? d : null;
  }
  let host = '';
  try { host = new URL(url).hostname; } catch { return null; }
  return hostInAutoClose(host) ? host : null;
}

async function closeAdTab(tabId, opener) {
  popupTabs.delete(tabId);
  try { await chrome.tabs.remove(tabId); } catch { /* already gone */ }
  if (opener != null) {
    try { await chrome.tabs.update(opener, { active: true }); } catch { /* opener gone */ }
  }
}

function prunePopups(now) {
  for (const [id, info] of popupTabs) if (now - info.ts > POPUP_TTL_MS) popupTabs.delete(id);
}

chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.openerTabId == null || tab.id == null) return; // only page-spawned tabs
  await ensureAutoClose();
  if (!autoCloseOn) return;
  const now = Date.now();
  prunePopups(now);
  popupTabs.set(tab.id, { opener: tab.openerTabId, ts: now });
  if (adTargetHost(tab.pendingUrl || tab.url)) closeAdTab(tab.id, tab.openerTabId);
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const info = popupTabs.get(tabId);
  if (!info) return;                         // only watch tabs we flagged as pop-unders
  if (Date.now() - info.ts > POPUP_TTL_MS) { popupTabs.delete(tabId); return; }
  await ensureAutoClose();
  if (!autoCloseOn) return;
  const url = changeInfo.url || tab?.url;
  if (url && adTargetHost(url)) closeAdTab(tabId, info.opener);
});

chrome.tabs.onRemoved.addListener((tabId) => { popupTabs.delete(tabId); });
