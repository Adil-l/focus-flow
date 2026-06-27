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

  let sweeping = false;
  function sweep() {
    if (!active || sweeping || !document.body) return;
    sweeping = true;
    try {
      let removed = false;
      for (const el of Array.from(document.body.children)) {
        if (looksLikeAdShell(el)) { el.remove(); removed = true; }
      }
      if (removed) {
        // The ad had locked the page; restore scrolling.
        for (const el of [document.documentElement, document.body]) {
          if (!el) continue;
          const cs = getComputedStyle(el);
          if (cs.overflow === 'hidden') el.style.setProperty('overflow', 'auto', 'important');
          if (cs.position === 'fixed') el.style.setProperty('position', 'static', 'important');
        }
      }
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
