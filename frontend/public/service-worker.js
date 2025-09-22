// A name for our cache. Increment this version number when you want to force
// all users to download new assets.
const CACHE_NAME = 'handsup-app-cache-v1';

// A list of the essential static files your PWA needs to work offline.
// These are the files that don't change frequently.
const urlsToCache = [
  '/', // The main URL of your site
  '/index.html',
  '/manifest.json',
  '/logo2.png',
  '/favicon.ico'
];

// The `install` event is triggered when the service worker is first installed.
// We use it to open a cache and store all the essential files.
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

// The `activate` event is used to clean up old caches.
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

// The `fetch` event intercepts every network request made by the page.

self.addEventListener('fetch', (event) => {

  event.respondWith(

    caches.match(event.request)

      .then((response) => {

        // If the request is in the cache, return the cached version.

        if (response) {

          return response;

        }



        // If not, fetch the resource from the network.

        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)

          .then((fetchResponse) => {

            // Check if we received a valid response.

            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {

              return fetchResponse;

            }



            // If the response is valid, clone it to put it in the cache.

            const responseToCache = fetchResponse.clone();

            caches.open(CACHE_NAME)

              .then((cache) => {

                cache.put(event.request, responseToCache);

              });

            return fetchResponse;

          })

          .catch(() => {

            // This is a fallback for when the network is unavailable.

            if (event.request.mode === 'navigate') {

              return caches.match('/index.html');

            }

          });

      })

  );

});
