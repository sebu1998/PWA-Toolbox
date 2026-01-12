const CACHE_VERSION = 'v1';
const CACHE_NAME = `pwa-toolbox-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  './',
  './index.html',
  './tools.json',
  './manifest.webmanifest',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
  './tools/timer/index.html',
  './tools/timer/timer.js',
  './tools/timer/timer.css',
  './tools/stoppuhr/index.html',
  './tools/stoppuhr/stopwatch.js',
  './tools/stoppuhr/stopwatch.css',
  './tools/vierbilder/index.html',
  './tools/vierbilder/game.js',
  './tools/vierbilder/game.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }

      return fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(async () => {
          if (event.request.mode === 'navigate') {
            const fallback = await caches.match('./index.html');
            if (fallback) return fallback;
          }
          return cached || Response.error();
        });
    })
  );
});
