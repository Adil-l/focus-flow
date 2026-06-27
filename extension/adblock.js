// Content script: best-effort "skip the ad gate".
//
// DNR already stops ad iframes from loading; this cleans up what they leave
// behind ON the page itself — the full-screen overlay shell that still swallows
// clicks, and the scroll-lock that ad / anti-adblock scripts drop on <body>.
//
// It is deliberately conservative so it never breaks real UI:
//   • it NEVER clicks anything (no auto "continue", which could trigger
//     downloads or navigation);
//   • it only removes a *direct child of <body>* that is fixed/absolute, covers
//     almost the whole viewport, has an ad-tier z-index, carries no real text
//     and no interactive controls (real cookie/login/paywall modals have
//     buttons, inputs or text, so they are left alone);
//   • it only gives scrolling back when it actually removed such a shell.
//
// Runs only while the "Ads / Pop-ups" category is active.

(() => {
  const SKIP_HOSTS = ['focusflow.app', 'localhost', '127.0.0.1'];
  const host = location.hostname || '';
  if (SKIP_HOSTS.some((h) => host === h || host.endsWith('.' + h))) return;
  if (!/^https?:$/.test(location.protocol)) return;

  let active = false;

  function readActive() {
    try {
      chrome.storage.local.get('config', (s) => {
        const c = s && s.config;
        active = !!(c && c.enabled && c.categories && c.categories.ads && (!c.focusOnly || c.focusActive));
        // Flag for the MAIN-world pop-under killer (adblock-main.js), which can't
        // read chrome.storage. The shared DOM is the bridge between the two worlds.
        document.documentElement.setAttribute('data-ff-adblock', active ? '1' : '0');
        if (active) { injectCosmetic(); sweep(); }
      });
    } catch { /* extension context gone — ignore */ }
  }

  // Collapse the most universal ad slots so blocked (empty) ad iframes don't
  // leave gaps. Deliberately limited to unambiguous ad-network markers.
  let cosmeticDone = false;
  function injectCosmetic() {
    if (cosmeticDone) return;
    cosmeticDone = true;
    const css = 'ins.adsbygoogle,.adsbygoogle,iframe[id^="google_ads_iframe"],'
      + 'iframe[id^="aswift_"],[id^="div-gpt-ad"],[id^="google_ads_"],'
      + 'iframe[src*="doubleclick.net"],iframe[src*="googlesyndication"],'
      + 'iframe[src*="adnxs.com"],iframe[src*="adsterra"],iframe[src*="exoclick"],'
      + 'iframe[src*="popads"],iframe[src*="propellerads"],iframe[src*="hilltopads"]'
      + '{display:none!important;}';
    const style = document.createElement('style');
    style.id = 'ff-adblock-cosmetic';
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);
  }

  const isHuge = (el) => {
    const r = el.getBoundingClientRect();
    return innerWidth > 0 && innerHeight > 0
      && r.width >= innerWidth * 0.85 && r.height >= innerHeight * 0.85;
  };

  // A blocked-ad overlay shell: big, fixed, ad-tier z-index, empty of real UI.
  const looksLikeAdShell = (el) => {
    if (!el || el.nodeType !== 1) return false;
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' && cs.position !== 'absolute') return false;
    if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    const z = parseInt(cs.zIndex, 10);
    if (!(z >= 9999)) return false;                 // real overlays rarely go this high
    if (!isHuge(el)) return false;
    if (el.querySelector('input,button,form,video,select,textarea')) return false; // real UI
    if ((el.textContent || '').trim().length > 12) return false; // real content has text
    return true;
  };

  // Is `el` a covering overlay (a modal/backdrop on top of the page)?
  const isOverlayish = (el) => {
    if (!el || el.nodeType !== 1 || !el.isConnected) return false;
    const cs = getComputedStyle(el);
    if (cs.position !== 'fixed' && cs.position !== 'absolute') return false;
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    const z = parseInt(cs.zIndex, 10) || 0;
    const r = el.getBoundingClientRect();
    const big = innerWidth > 0 && innerHeight > 0
      && r.width >= innerWidth * 0.5 && r.height >= innerHeight * 0.5;
    return z >= 1000 || big;
  };

  // Anti-adblock walls announce themselves. These phrases don't appear in cookie/
  // login/paywall/newsletter modals, so matching them inside a covering overlay is
  // a high-precision signal — we won't nuke legitimate dialogs.
  const ADBLOCK_RE = /ad[\s-]?block|adblock|brave shields|whitelist|allowlist|disable (?:your |the )?(?:ad|ad-?block|shield)|turn off (?:your )?ad|we (?:detected|noticed|see)[^.]{0,40}(?:ad ?block|blocker)|rel(?:y|ies) on ads|supported by ads|ad-supported|using an ad ?blocker/i;

  // Remove anti-adblock warning walls so the page underneath is usable again.
  function killAntiAdblock() {
    if (!document.body) return false;
    let killed = false;
    // Walls live near the top of <body>; scan the top two levels (bounded, fast).
    const scan = [];
    for (const a of document.body.children) {
      scan.push(a);
      for (const b of a.children) scan.push(b);
    }
    for (const el of scan) {
      if (!el.isConnected) continue;
      const txt = (el.textContent || '').trim();
      if (txt.length === 0 || txt.length > 1500) continue; // skip empty / whole-article text
      if (!ADBLOCK_RE.test(txt)) continue;
      // Climb to the outermost covering overlay (the backdrop wrapping the modal).
      let target = el;
      while (target.parentElement && target.parentElement !== document.body && isOverlayish(target.parentElement)) {
        target = target.parentElement;
      }
      if (isOverlayish(target)) { target.remove(); killed = true; }
      else if (isOverlayish(el)) { el.remove(); killed = true; }
    }
    return killed;
  }

  // Give scrolling back (walls/ads lock <body>) and strip any blur they applied.
  function restoreScroll() {
    for (const el of [document.documentElement, document.body]) {
      if (!el) continue;
      const cs = getComputedStyle(el);
      if (cs.overflow === 'hidden') el.style.setProperty('overflow', 'auto', 'important');
      if (cs.position === 'fixed') el.style.setProperty('position', 'static', 'important');
      if (cs.filter && cs.filter !== 'none') el.style.setProperty('filter', 'none', 'important');
      ['no-scroll', 'noscroll', 'modal-open', 'overflow-hidden', 'adblock', 'has-adblock']
        .forEach((c) => el.classList.remove(c));
    }
  }

  let sweeping = false;
  function sweep() {
    if (!active || sweeping || !document.body) return;
    sweeping = true;
    try {
      let removed = false;
      for (const el of Array.from(document.body.children)) {
        if (looksLikeAdShell(el)) { el.remove(); removed = true; }
      }
      if (killAntiAdblock()) removed = true;
      if (removed) restoreScroll();
    } catch { /* ignore */ } finally {
      sweeping = false;
    }
  }

  readActive();

  // Ad overlays inject late; re-sweep on DOM changes (throttled) + on load.
  let t = 0;
  const obs = new MutationObserver(() => {
    if (!active) return;
    clearTimeout(t);
    t = setTimeout(sweep, 400);
  });
  if (document.documentElement) {
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }
  addEventListener('load', () => { if (active) sweep(); });

  try {
    chrome.storage.onChanged.addListener((ch, area) => {
      if (area === 'local' && ch.config) readActive();
    });
  } catch { /* ignore */ }
})();
