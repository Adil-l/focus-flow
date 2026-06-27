// adblock-main.js — runs in the page's OWN JS world (MAIN), at document_start.
//
// Stops pop-under / pop-up AD windows at the source by controlling window.open.
// The background tab-closer can only catch a popup whose destination is a host
// already on a blocklist; pop-unders that go to a fresh/unlisted domain (most of
// them) slip past it. Controlling window.open here catches them all, regardless
// of where they point.
//
// Gated by <html data-ff-adblock="1">, which the isolated content script
// (adblock.js) sets only while the Ads / Pop-ups category is active. Until that
// attribute is present it FAILS OPEN — it does nothing, so a page is never worse
// off than without the extension.
//
// Heuristic (the standard popup-blocker approach): allow same-origin opens and
// exactly one cross-origin open per genuine (isTrusted) user gesture; swallow the
// rest. A real "open in new tab" from your click still works; a background
// pop-under (no gesture) or a second window piggy-backing on one click does not.
// Real <a target="_blank"> links use native navigation, not window.open, so they
// are never affected.

(() => {
  const realOpen = window.open;
  if (typeof realOpen !== 'function') return;

  const active = () => document.documentElement.getAttribute('data-ff-adblock') === '1';

  const GESTURE_MS = 1000;
  let lastGesture = 0;
  let gestureId = 0;
  let openedInGesture = -1;
  const mark = (e) => { if (e && e.isTrusted) { lastGesture = Date.now(); gestureId++; } };
  for (const ev of ['click', 'auxclick', 'mousedown', 'keydown', 'touchend', 'submit']) {
    window.addEventListener(ev, mark, true);
  }

  const sameOrigin = (url) => {
    if (!url) return true; // open() with no URL = blank window, usually legit app use
    try { return new URL(url, location.href).origin === location.origin; }
    catch { return false; }
  };

  // A harmless stand-in so the caller's code doesn't throw on a swallowed popup.
  const stub = () => {
    const w = {
      closed: true, name: '', opener: null,
      close() {}, focus() {}, blur() {}, postMessage() {}, moveTo() {}, resizeTo() {},
      addEventListener() {}, removeEventListener() {},
      document: { write() {}, writeln() {}, open() {}, close() {} },
      location: { href: 'about:blank', replace() {}, assign() {}, reload() {} },
    };
    w.open = () => stub();
    return w;
  };

  window.open = function (url, ...rest) {
    if (!active()) return realOpen.apply(window, [url, ...rest]);
    if (sameOrigin(url)) return realOpen.apply(window, [url, ...rest]);
    const fresh = Date.now() - lastGesture < GESTURE_MS;
    if (fresh && openedInGesture !== gestureId) {
      openedInGesture = gestureId;                 // one cross-origin popup per gesture
      return realOpen.apply(window, [url, ...rest]);
    }
    return stub();                                  // swallow the pop-under
  };

  // Keep the function looking native so anti-adblock fingerprinting that calls
  // window.open.toString() doesn't trivially flag it.
  try {
    Object.defineProperty(window.open, 'toString', { value: () => 'function open() { [native code] }' });
    Object.defineProperty(window.open, 'name', { value: 'open' });
  } catch { /* ignore */ }
})();
