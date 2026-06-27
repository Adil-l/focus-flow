// Focus Flow service worker — powers the installable PWA (iOS "Add to Home
// Screen", Android install) and basic offline use. Registered ONLY on the web
// build (see src/platform/mobile/registerSW.ts); the desktop Tauri app skips it.
//
// Strategy:
//   • Navigations (opening the app / route changes): network-first, falling back
//     to the cached app shell when offline. This way a new deploy is picked up
//     immediately and the installed icon still opens offline.
//   • Other same-origin GETs (hashed JS/CSS/img — immutable): cache-first.
//   • Cross-origin APIs (Supabase, Spotify, archive.org) and non-GET: untouched.
const CACHE_NAME = 'focus-flow-v3';
const APP_SHELL = '/index.html';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate the new SW as soon as it's installed.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Don't let one missing asset abort the whole precache.
      Promise.allSettled(ASSETS_TO_CACHE.map((url) => cache.add(url)))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((names) =>
        Promise.all(names.map((n) => (n !== CACHE_NAME ? caches.delete(n) : undefined)))
      ),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Let the browser handle non-GET and chatty cross-origin endpoints directly —
  // caching these is the usual cause of "Load failed" errors in SWs.
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('spotify.com') ||
    url.hostname.includes('archive.org')
  ) {
    return;
  }

  // Navigations → network-first, fall back to the cached shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(APP_SHELL, copy));
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match(APP_SHELL)))
    );
    return;
  }

  // Static assets → cache-first, then network (and cache the result).
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => new Response('Offline resource not available', { status: 408 }))
    )
  );
});
