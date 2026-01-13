const CACHE_NAME = 'delhizones-v5';
const urlsToCache = [
  '/',
  '/includes/head.html',
  '/includes/navbar.html',
  '/includes/footer.html',
  '/contact.html',
  '/logo.svg',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});