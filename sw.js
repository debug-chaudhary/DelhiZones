/**
 * Delhizones Service Worker
 * Strategy: Stale-While-Revalidate
 * Purpose: Serves cached content instantly for speed, updates in background.
 * Includes: Logic to ignore Google Analytics (so tracking always works).
 */

const CACHE_NAME = 'delhizones-v1-cache';

// Core assets to pre-cache immediately on install
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/assets/js/loader.js',
  '/includes/navbar.html',
  '/includes/footer.html',
  '/includes/head.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html' // Ensure you create this file for true offline support
];
// CHANGE THIS LINE: Increment v1 to v2, v3, etc.
const CACHE_NAME = 'delhizones-v2-cache'; 

// ... keep the rest of your code exactly the same ...
// Inside sw.js fetch event
if (!event.request.url.startsWith(self.location.origin)) {
     return; // This skips caching for external links like Google Analytics (good!)
}
// 1. INSTALL EVENT
// Runs once when the browser sees a new version of this sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching core assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Force the waiting service worker to become the active service worker immediately
  self.skipWaiting();
});

// 2. ACTIVATE EVENT
// Cleans up old caches when a new Service Worker takes over
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Removing old cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  // Claim control of all pages immediately (clients don't need to reload)
  return self.clients.claim();
});

// 3. FETCH EVENT
// Intercepts every network request
self.addEventListener('fetch', (event) => {
  
  // EXCLUSION: Do not cache external links (like Google Analytics)
  // This ensures your GA script loads fresh from Google every time.
  if (!event.request.url.startsWith(self.location.origin)) {
     return; 
  }

  // Handle standard GET requests for your own site files
  if (event.request.method === 'GET') {
    event.respondWith(
      // A. Try to find the file in the cache first
      // { ignoreSearch: true } handles cases where loader.js might add timestamps
      caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
        
        // B. Network Fetch (The "Revalidate" part)
        // We perform this in the background to update the cache for next time
        const networkFetch = fetch(event.request)
          .then((networkResponse) => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response because it's a stream and can only be consumed once
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME).then((cache) => {
              // Update the cache with the fresh version
              cache.put(event.request, responseToCache);
            });

            return networkResponse;
          })
          .catch(() => {
            // Network failed. If we didn't have a cachedResponse, show offline page.
            // This handles the "User is completely offline" scenario for new pages.
            if (!cachedResponse && event.request.mode === 'navigate') {
               return caches.match('/offline.html');
            }
          });

        // C. Return Strategy
        // 1. If we have it in cache, return it INSTANTLY (Speed).
        // 2. If not, wait for the network (Fresh).
        return cachedResponse || networkFetch;
      })
    );
  }
});