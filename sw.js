// Redirect service worker - forwards to the actual service worker
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all clients
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Redirect any requests to the actual service worker
  if (event.request.url.includes('/sw.js')) {
    event.respondWith(
      fetch('/src/sw.js')
    );
  }
}); 