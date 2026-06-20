const CACHE_NAME = 'focus-flow-v2'; // Incremented version
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/placeholder.svg',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force update
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching for Supabase functions, Spotify API and Archive.org audio
  // These are often the cause of "TypeError: Load failed" in Service Workers
  if (
    url.hostname.includes('supabase.co') || 
    url.hostname.includes('spotify.com') || 
    url.hostname.includes('archive.org') ||
    event.request.method !== 'GET'
  ) {
    return; // Let the browser handle these normally
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Fallback for network errors without breaking the app
        return new Response('Offline resource not available', { status: 408 });
      });
    })
  );
});
