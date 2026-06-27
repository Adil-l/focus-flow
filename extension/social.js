// social.js — hide first-party "Sponsored / Promoted" posts on social networks.
//
// Domain/hosts blocking can't touch these: the ads are served by the site itself
// (instagram.com serves its own sponsored posts), so the only lever is cosmetic —
// find the promoted-post label in the feed and hide that post. This is inherently
// fragile (these sites change their HTML constantly; Facebook actively obfuscates
// the word "Sponsored" to defeat blockers) so it is written to FAIL SAFE: it only
// ever *hides*; worst case a sponsored post stays visible — it never breaks the
// page. Runs only while the Ads / Pop-ups category is active.
//
// Reliable: Instagram, X/Twitter, YouTube (feed/banner ads), Reddit, LinkedIn.
// Partial: Facebook (obfuscation), TikTok (obfuscated class names).
// NOT handled: in-stream VIDEO ads (YouTube pre-roll etc.) — those need a player
// scriptlet, a much bigger/cat-and-mouse engine.

(() => {
  if (!/^https?:$/.test(location.protocol)) return;
  const HOST = location.hostname || '';
  const is = (...n) => n.some((x) => HOST === x || HOST.endsWith('.' + x));
  if (!is('instagram.com', 'facebook.com', 'x.com', 'twitter.com', 'youtube.com', 'reddit.com', 'linkedin.com', 'tiktok.com')) return;

  let active = false;
  function readActive() {
    try {
      chrome.storage.local.get('config', (s) => {
        const c = s && s.config;
        active = !!(c && c.enabled && c.categories && c.categories.ads && (!c.focusOnly || c.focusActive));
        if (active) { injectCss(); sweep(); }
      });
    } catch { /* extension context gone — ignore */ }
  }

  // A marker class + CSS, plus the platforms whose ad units are stable element
  // tags (YouTube, Reddit) — those need no text scan at all.
  let cssDone = false;
  function injectCss() {
    if (cssDone) return;
    cssDone = true;
    const css =
      '[data-ff-ad="1"]{display:none!important}'
      + 'ytd-promoted-video-renderer,ytd-display-ad-renderer,ytd-in-feed-ad-layout-renderer,'
      + 'ytd-ad-slot-renderer,ytd-promoted-sparkles-web-renderer,ytd-banner-promo-renderer,'
      + 'ytd-statement-banner-renderer,ytd-companion-slot-renderer,#masthead-ad,#player-ads,'
      + 'ytm-promoted-video-renderer,.ytp-ad-overlay-slot{display:none!important}'
      + 'shreddit-ad-post,shreddit-comments-page-ad,[data-testid="post-container"][data-promoted="true"]{display:none!important}';
    const st = document.createElement('style');
    st.id = 'ff-social-cosmetic';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  // Promoted-post labels across common languages. "ad" is deliberately excluded
  // (too short/ambiguous). The match requires an element whose WHOLE short text is
  // exactly one of these — the dedicated label span — not a mention in body text.
  const LABELS = new Set([
    'sponsored', 'patrocinado', 'patrocinada', 'patrocinados', 'publicidade', 'publicidad',
    'promoted', 'promovido', 'promocionado', 'anúncio', 'anuncio', 'gesponsert',
    'sponsorisé', 'sponsorisée', 'sponsorizzato', 'annonce', 'reclame',
  ]);
  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const isLabel = (el) => {
    const t = norm(el.textContent);
    return t.length > 0 && t.length <= 14 && LABELS.has(t);
  };

  function hasLabel(container) {
    const a = container.querySelector('[aria-label]');
    if (a) { const al = norm(a.getAttribute('aria-label')); if (LABELS.has(al)) return true; }
    let i = 0;
    for (const n of container.querySelectorAll('span,a,div,cite,h2,h3')) {
      if (i++ > 250) break;          // bound the per-post scan
      if (isLabel(n)) return true;
    }
    return false;
  }

  function containers() {
    if (is('instagram.com')) return document.querySelectorAll('main article');
    if (is('x.com', 'twitter.com')) return document.querySelectorAll('[data-testid="tweet"]');
    if (is('facebook.com')) return document.querySelectorAll('[role="article"]');
    if (is('reddit.com')) return document.querySelectorAll('shreddit-post,article');
    if (is('linkedin.com')) return document.querySelectorAll('.feed-shared-update-v2,[data-id^="urn:li:activity"]');
    if (is('tiktok.com')) return document.querySelectorAll('[data-e2e="recommend-list-item-container"],[class*="DivItemContainer"]');
    return [];
  }

  let sweeping = false;
  function sweep() {
    if (!active || sweeping) return;
    sweeping = true;
    try {
      let n = 0;
      for (const c of containers()) {
        if (n++ > 120) break;                         // bound total work per sweep
        if (c.getAttribute('data-ff-ad') === '1') continue;
        if (hasLabel(c)) c.setAttribute('data-ff-ad', '1');
      }
    } catch { /* ignore */ } finally {
      sweeping = false;
    }
  }

  readActive();
  let t = 0;
  const obs = new MutationObserver(() => { if (!active) return; clearTimeout(t); t = setTimeout(sweep, 600); });
  if (document.documentElement) obs.observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('load', () => { if (active) sweep(); });
  setInterval(() => { if (active) sweep(); }, 3000); // feeds lazy-load; periodic re-scan
  try {
    chrome.storage.onChanged.addListener((ch, area) => { if (area === 'local' && ch.config) readActive(); });
  } catch { /* ignore */ }
})();
