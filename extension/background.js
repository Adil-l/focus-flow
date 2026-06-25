import { CATEGORIES, CATEGORY_KEYS } from './categories.js';

const STORAGE_KEY = 'config';

const DEFAULT_CONFIG = {
  enabled: true,
  // When true, only block while a Focus Flow focus session is running.
  focusOnly: false,
  focusActive: false,
  categories: { distracting: false, gambling: true, adult: true, threat: true },
  personalBlock: [],
  personalAllow: [],
};

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

async function applyRules() {
  const config = await getConfig();
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existing.map((r) => r.id);

  const addRules = blockingActive(config) ? buildRules(effectiveDomains(config)) : [];

  // Chrome caps dynamic rules; a curated list stays well under, but guard anyway.
  const MAX = chrome.declarativeNetRequest.MAX_NUMBER_OF_DYNAMIC_RULES || 5000;
  const capped = addRules.slice(0, MAX);

  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds, addRules: capped });
  await updateBadge(config, capped.length);
}

async function updateBadge(config, ruleCount) {
  const on = blockingActive(config) && ruleCount > 0;
  try {
    await chrome.action.setBadgeText({ text: on ? 'ON' : '' });
    await chrome.action.setBadgeBackgroundColor({ color: on ? '#7c3aed' : '#000000' });
  } catch { /* action API may be unavailable in some contexts */ }
}

// Rebuild whenever the config changes (popup writes, or the Focus Flow bridge).
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[STORAGE_KEY]) applyRules();
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
      const next = { ...config };
      if (msg.payload.categories) next.categories = { ...config.categories, ...msg.payload.categories };
      if (Array.isArray(msg.payload.personalBlock)) next.personalBlock = msg.payload.personalBlock;
      if (Array.isArray(msg.payload.personalAllow)) next.personalAllow = msg.payload.personalAllow;
      if (typeof msg.payload.focusOnly === 'boolean') next.focusOnly = msg.payload.focusOnly;
      if (typeof msg.payload.focusActive === 'boolean') next.focusActive = msg.payload.focusActive;
      await chrome.storage.local.set({ [STORAGE_KEY]: next }); // triggers applyRules via onChanged
      sendResponse({ ok: true });
    })();
    return true; // async response
  }
  return false;
});
