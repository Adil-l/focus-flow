import { CATEGORIES, CATEGORY_KEYS } from './categories.js';

const STORAGE_KEY = 'config';
const DEFAULTS = {
  enabled: true, focusOnly: false, focusActive: false,
  categories: { distracting: false, gambling: true, adult: true, threat: true },
  personalBlock: [], personalAllow: [],
};

async function getConfig() {
  const s = await chrome.storage.local.get(STORAGE_KEY);
  return { ...DEFAULTS, ...(s[STORAGE_KEY] || {}) };
}
async function setConfig(patch) {
  const cur = await getConfig();
  const next = { ...cur, ...patch };
  if (patch.categories) next.categories = { ...cur.categories, ...patch.categories };
  await chrome.storage.local.set({ [STORAGE_KEY]: next });
  return next;
}

function row(label, desc, checked, onChange) {
  const el = document.createElement('div');
  el.className = 'row';
  el.innerHTML = `<div><div class="label">${label}</div><div class="desc">${desc}</div></div>
    <label class="sw"><input type="checkbox" ${checked ? 'checked' : ''}/><span></span></label>`;
  el.querySelector('input').addEventListener('change', (e) => onChange(e.target.checked));
  return el;
}

async function render() {
  const cfg = await getConfig();
  document.getElementById('enabled').checked = cfg.enabled;
  document.getElementById('focusOnly').checked = cfg.focusOnly;
  const fs = document.getElementById('focusState');
  fs.textContent = cfg.focusActive ? 'active' : 'inactive';
  fs.className = 'badge ' + (cfg.focusActive ? 'on' : 'off');

  const cats = document.getElementById('cats');
  cats.innerHTML = '';
  for (const key of CATEGORY_KEYS) {
    cats.appendChild(row(
      CATEGORIES[key].label,
      `${CATEGORIES[key].domains.length} sites`,
      !!cfg.categories[key],
      (v) => setConfig({ categories: { [key]: v } }),
    ));
  }

  const pb = document.getElementById('personalBlock');
  pb.value = (cfg.personalBlock || []).join('\n');
}

document.getElementById('enabled').addEventListener('change', (e) => setConfig({ enabled: e.target.checked }));
document.getElementById('focusOnly').addEventListener('change', (e) => setConfig({ focusOnly: e.target.checked }));
document.getElementById('personalBlock').addEventListener('change', (e) => {
  const list = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
  setConfig({ personalBlock: list });
});
document.getElementById('openFF').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'http://localhost:8080/app' });
});

chrome.storage.onChanged.addListener((c, area) => { if (area === 'local' && c[STORAGE_KEY]) render(); });
render();
