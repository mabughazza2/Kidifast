// Little Fasters v6 — Service Worker
const CACHE = 'lfa-v6';
const ASSETS = [
  './',
  './index.html',
  './data.json',
  './questions.json',
  './icon.svg',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .catch(() => {}) // graceful if offline
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  // Delete all old caches (lfa-v1 through lfa-v5)
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request)
        .then(resp => {
          // Cache successful responses
          if (resp && resp.status === 200) {
            const clone = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return resp;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});

// Notify clients when new version available
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
