import { CATEGORIES, CATEGORY_KEYS } from './categories.js';
import {
  getGuard, setGuard, isLocked, inUnlockWindow, weakens,
  randomSaltHex, hashPassword, verifyPassword, UNLOCK_WINDOW_MS,
} from './guard.js';

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

let flashTimer = null;
function flash(msg, ok = false) {
  const el = document.getElementById('flash');
  el.textContent = msg;
  el.style.color = ok ? '#86efac' : '#fca5a5';
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => { el.textContent = ''; }, 3200);
}

// Apply a config patch, but refuse it (and re-render to revert the control) if
// it would weaken protection while the guard is locked.
async function guardedSet(patch) {
  const cur = await getConfig();
  const next = { ...cur, ...patch };
  if (patch.categories) next.categories = { ...cur.categories, ...patch.categories };
  const guard = await getGuard();
  if (isLocked(guard) && weakens(cur, next)) {
    flash('🔒 Locked — pass the challenge below to weaken protection');
    render();
    return;
  }
  await setConfig(patch);
}

function fmt(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function row(label, desc, checked, onChange, disabled) {
  const el = document.createElement('div');
  el.className = 'row';
  el.innerHTML = `<div><div class="label">${label}</div><div class="desc">${desc}</div></div>
    <label class="sw"><input type="checkbox" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}/><span></span></label>`;
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
      (v) => guardedSet({ categories: { [key]: v } }),
    ));
  }

  const pb = document.getElementById('personalBlock');
  if (document.activeElement !== pb) pb.value = (cfg.personalBlock || []).join('\n');

  await renderGuard();
}

// ---------------------------------------------------------------------------
// Guard panel: arm protection, then a timed challenge to weaken/disarm.
// ---------------------------------------------------------------------------

async function renderGuard() {
  const panel = document.getElementById('guardPanel');
  // Never rebuild the panel while the user is typing in one of its fields —
  // otherwise the periodic tick / storage events wipe the phrase & password.
  const ae = document.activeElement;
  if (ae && panel.contains(ae) && (ae.tagName === 'INPUT' || ae.tagName === 'SELECT')) return;
  const guard = await getGuard();
  panel.innerHTML = '';

  if (!guard.active) {
    panel.appendChild(buildArmUI(guard));
    return;
  }

  const now = Date.now();
  if (inUnlockWindow(guard, now)) {
    panel.appendChild(buildUnlockedUI(guard, now));
  } else if (guard.unlockAt && now < guard.unlockAt) {
    panel.appendChild(buildWaitingUI(guard, now));
  } else {
    panel.appendChild(buildLockedUI(guard));
  }
}

function el(html) {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d;
}

function buildArmUI() {
  const wrap = el(`
    <div class="gtitle">🔒 Protect this blocker</div>
    <p class="note">Once armed, you can't turn the blocker off, un-tick a category or
      add an allow-list site on impulse. To weaken anything you'll have to retype a
      commitment phrase + password, then wait out a cooldown.</p>
    <input class="fld" id="g_phrase" type="text" placeholder="Commitment phrase (e.g. I choose focus)" />
    <input class="fld" id="g_pass" type="password" placeholder="Password" autocomplete="new-password" />
    <input class="fld" id="g_pass2" type="password" placeholder="Confirm password" autocomplete="new-password" />
    <select class="fld" id="g_cool">
      <option value="5">Cooldown: 5 minutes</option>
      <option value="10">Cooldown: 10 minutes</option>
      <option value="20">Cooldown: 20 minutes</option>
      <option value="60">Cooldown: 1 hour</option>
    </select>
    <button class="btn primary" id="g_arm">Arm protection</button>`);
  wrap.querySelector('#g_arm').addEventListener('click', async () => {
    const phrase = wrap.querySelector('#g_phrase').value.trim();
    const p1 = wrap.querySelector('#g_pass').value;
    const p2 = wrap.querySelector('#g_pass2').value;
    const cooldownMin = parseInt(wrap.querySelector('#g_cool').value, 10);
    if (phrase.length < 6) return flash('Phrase must be at least 6 characters');
    if (p1.length < 4) return flash('Password must be at least 4 characters');
    if (p1 !== p2) return flash('Passwords do not match');
    const saltHex = randomSaltHex();
    const passHash = await hashPassword(p1, saltHex);
    await setGuard({ active: true, saltHex, passHash, phrase, cooldownMin, unlockAt: null });
    flash('Protection armed. Stay focused. 💪', true);
    render();
  });
  return wrap;
}

function buildLockedUI(guard) {
  const wrap = el(`
    <div class="gtitle">🔒 Protection is locked</div>
    <p class="note">Cooldown: <b>${guard.cooldownMin} min</b>. To make a weakening change,
      pass the challenge — then the controls unlock for ${Math.round(UNLOCK_WINDOW_MS / 60000)} minute(s).</p>
    <input class="fld" id="u_phrase" type="text" placeholder="Type your commitment phrase" />
    <input class="fld" id="u_pass" type="password" placeholder="Password" autocomplete="off" />
    <button class="btn" id="u_go">Start unlock cooldown</button>`);
  wrap.querySelector('#u_go').addEventListener('click', async () => {
    const phrase = wrap.querySelector('#u_phrase').value.trim();
    const pass = wrap.querySelector('#u_pass').value;
    if (phrase !== guard.phrase) return flash('Phrase does not match');
    if (!(await verifyPassword(guard, pass))) return flash('Wrong password');
    const unlockAt = Date.now() + guard.cooldownMin * 60 * 1000;
    await setGuard({ unlockAt });
    flash(`Cooldown started — ${guard.cooldownMin} min. Keep this popup expectation in mind.`, true);
    renderGuard();
  });
  return wrap;
}

function buildWaitingUI(guard, now) {
  const left = guard.unlockAt - now;
  const wrap = el(`
    <div class="gtitle">⏳ Unlocking…</div>
    <p class="note">Controls open in <span class="count">${fmt(left)}</span>.
      This wait is the point — the urge usually passes before the timer does.</p>
    <button class="btn danger" id="u_cancel">Cancel & re-lock now</button>`);
  wrap.querySelector('#u_cancel').addEventListener('click', async () => {
    await setGuard({ unlockAt: null });
    flash('Re-locked. 🔒', true);
    renderGuard();
  });
  return wrap;
}

function buildUnlockedUI(guard, now) {
  const left = guard.unlockAt + UNLOCK_WINDOW_MS - now;
  const wrap = el(`
    <div class="gtitle">🔓 Editable — re-locks in <span class="count">${fmt(left)}</span></div>
    <p class="note">You can now turn things off or adjust categories above.</p>
    <button class="btn" id="u_relock">Re-lock now</button>
    <button class="btn danger" id="u_disarm">Disarm protection entirely</button>`);
  wrap.querySelector('#u_relock').addEventListener('click', async () => {
    await setGuard({ unlockAt: null });
    flash('Re-locked. 🔒', true);
    render();
  });
  wrap.querySelector('#u_disarm').addEventListener('click', async () => {
    await setGuard({ active: false, passHash: null, saltHex: null, phrase: '', unlockAt: null });
    flash('Protection disarmed.', true);
    render();
  });
  return wrap;
}

// Static control handlers (categories are re-bound on each render).
document.getElementById('enabled').addEventListener('change', (e) => guardedSet({ enabled: e.target.checked }));
document.getElementById('focusOnly').addEventListener('change', (e) => guardedSet({ focusOnly: e.target.checked }));
document.getElementById('personalBlock').addEventListener('change', (e) => {
  const list = e.target.value.split('\n').map((s) => s.trim()).filter(Boolean);
  guardedSet({ personalBlock: list });
});
document.getElementById('openFF').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: 'http://localhost:8080/app' });
});

chrome.storage.onChanged.addListener((c, area) => {
  if (area === 'local' && (c[STORAGE_KEY] || c.guard)) render();
});

// Tick the countdowns while the popup is open — but ONLY in states that have a
// moving countdown (waiting / unlock window). The setup form and the challenge
// form contain text inputs the user types into, so we never auto-rebuild those.
async function tick() {
  const guard = await getGuard();
  if (!guard.active || guard.unlockAt == null) return; // arm form or challenge form
  renderGuard(); // waiting / unlocked states are just buttons + a countdown
}
setInterval(tick, 1000);
render();
