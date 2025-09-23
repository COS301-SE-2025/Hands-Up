// A name for our cache.
const CACHE_NAME = 'handsup-app-cache-v1';

// The list of essential static files to cache. You'll need to manually
// update this with your build-generated JS and CSS files.
const urlsToCache = [
  '/', 
  '/index.html',
  '/manifest.json',
  '/logo2-192x192.png',
  '/logo2-512x512.png',
  '/favicon.ico',
  // You need to add your bundled JS and CSS files here, e.g.:
  // '/static/js/main.chunk.js',
  // '/static/css/main.chunk.css'
];

// The `install` event.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// The `activate` event.
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

// The `fetch` event.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If the request is in the cache, return the cached version.
        if (response) {
          return response;
        }

        // If not, clone the request and fetch from the network.
        const fetchRequest = event.request.clone();
        return fetch(fetchRequest)
          .then((fetchResponse) => {
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return fetchResponse;
          })
          .catch(() => {
            // This fallback is for when the network is unavailable.
            // It will return a cached version if it exists, for all types of requests.
            return caches.match(event.request);
          });
      })
  );
});