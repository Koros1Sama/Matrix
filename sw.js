const CACHE_NAME = 'koros-matrix-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  './splash.png',
  './css/style.css',
  './css/determinant.css',
  './css/about.css',
  './css/cinematic-tutorial.css',
  './css/custom-level.css',
  './js/app.js',
  './js/matrix.js',
  './js/levels.js',
  './js/dragdrop.js',
  './js/determinant-game.js',
  './js/determinant-levels.js',
  './js/determinant-tutorial.js',
  './js/cramer-game.js',
  './js/cramer-levels.js',
  './js/cramer-tutorial.js',
  './js/inverse-game.js',
  './js/inverse-levels.js',
  './js/inverse-tutorial.js',
  './js/lesson-animator.js',
  './js/cinematic-tutorial.js',
  './js/custom-level.js',
  './Assets/Telegram QR.png',
  './Assets/legendary_bg.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
