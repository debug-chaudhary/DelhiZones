/**
 * Delhizones Service Worker (v7.0 - PWA & SEO Optimized)
 * Strategy: Stale-While-Revalidate for Assets, Network-First for HTML
 */

const CACHE_NAME = 'delhizones-static-v7'; // Bumped to match Loader
const DATA_CACHE_NAME = 'delhizones-data-v7';

// CRITICAL: Files to cache immediately.
// If any of these are missing from your server, the PWA Install will fail.
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/404.html',
    '/donate.html',       // Added
    '/subscribe.html',    // Added
    '/includes/navbar.html',
    '/includes/footer.html',
    '/assets/css/themes.css',
    '/assets/js/loader.js', 
    '/assets/icons/icon-192.png',
    '/assets/icons/favicon.ico'
];

// 1. INSTALL PHASE
self.addEventListener('install', (event) => {
    console.log('[SW] Installing v7.0...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Precaching App Shell');
                // We use catch() so one missing file doesn't break the entire install
                return cache.addAll(PRECACHE_URLS).catch(err => {
                    console.error('[SW] Precache Error - check file paths:', err);
                });
            })
            .then(() => self.skipWaiting())
    );
});

// 2. ACTIVATE PHASE (Cleanup old caches)
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating & Cleaning');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                    console.log('[SW] Removing old cache:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

// 3. FETCH STRATEGY
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // A. EXCLUSIONS (Analytics, Admin, POST requests)
    if (url.hostname.includes('google') || 
        url.pathname.includes('/admin') || 
        event.request.method !== 'GET') {
        return; 
    }

    // B. HTML PAGES (Network First -> Fallback to Cache)
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // 1. If Server says 404, return our custom 404 page
                    if (response.status === 404) {
                        return caches.match('/404.html');
                    }

                    // 2. If Good response, Cache it and return it
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(DATA_CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // 3. Network failed (Offline), try cache
                    return caches.match(event.request)
                        .then((cachedResponse) => {
                            if (cachedResponse) return cachedResponse;
                            
                            // 4. If page not in cache, show 404 or Home
                            // Ideally, show 404.html as a generic offline fallback if specific page is missing
                            return caches.match('/404.html'); 
                        });
                })
        );
        return;
    }

    // C. STATIC ASSETS (Cache First -> Fallback to Network)
    // CSS, JS, Images
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            return fetch(event.request).then((response) => {
                // Check if valid
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Cache the new asset dynamically
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        })
    );
});