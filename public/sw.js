// This is a minimal Service Worker required for PWA installability.
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // We just let the network handle it. 
  // Having the fetch listener is enough to pass the PWA criteria for Chrome.
  event.respondWith(fetch(event.request).catch(() => {
    return new Response('Offline Content Placeholder');
  }));
});
