const CACHE_NAME = 'y3labs-v1';
const urlsToCache = [
  '/',
  '/src/landing/index.html',
  '/src/games/pacboy-2025/',
  '/src/games/pacboy-2025/index.html',
  '/src/games/pacboy-2025/waka.wav',
  '/src/landing/manifest.json',
  '/src/landing/img/Y3labs.png',
  '/src/landing/img/brandonator.png',
  '/src/landing/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
          .then((fetchResponse) => {
            // Cache successful responses for future use
            if (fetchResponse && fetchResponse.status === 200 && fetchResponse.type === 'basic') {
              const responseToCache = fetchResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return fetchResponse;
          })
          .catch(() => {
            // If offline and requesting a page, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/src/landing/offline.html');
            }
          });
      })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 