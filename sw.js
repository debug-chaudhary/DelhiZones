/**
 * Delhizones Service Worker (v2.0)
 * Strategy: 
 * 1. HTML Pages: Network First (Get latest content, fallback to cache)
 * 2. Static Assets: Cache First (Speed up loading)
 * 3. External: Network Only (Google Analytics, Ads)
 */

// CHANGE THIS: Increment 'v2' to 'v3', 'v4' etc. whenever you update the site.
const CACHE_NAME = 'delhizones-v3-static';
const DATA_CACHE_NAME = 'delhizones-v3-data';

// Files to cache immediately (The "App Shell")
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/404.html',
    '/assets/css/themes.css',
    '/assets/js/loader.js',
    '/assets/js/theme-manager.js',
    '/assets/js/pwa-manager.js',
    '/includes/navbar.html',
    '/includes/footer.html',
    '/includes/head.html',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png',
    '/assets/icons/favicon.ico'
];

// 1. INSTALL: Cache the App Shell
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing version:', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching App Shell');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting()) // Activate immediately
    );
});

// 2. ACTIVATE: Clean up old caches (v1, v2...)
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating & Cleaning old caches');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                    console.log('[Service Worker] Removing old cache:', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    self.clients.claim();
});

// 3. FETCH: The Routing Logic
self.addEventListener('fetch', (event) => {
    
    const url = new URL(event.request.url);

    // A. IGNORE: Google Analytics, Netlify Forms, Admin Panels, External Ads
    if (url.hostname.includes('google-analytics.com') || 
        url.hostname.includes('googletagmanager.com') ||
        url.pathname.includes('/admin') ||
        event.request.method !== 'GET') {
        return; // Let the network handle it directly
    }

    // B. HTML PAGES: Network First (Fresh Content)
    // If user asks for a page, try Internet first. If offline, give Cache.
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Update cache with the fresh page
                    const responseClone = response.clone();
                    caches.open(DATA_CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // If offline, serve from cache
                    return caches.match(event.request)
                        .then((cachedResponse) => {
                            if (cachedResponse) return cachedResponse;
                            // If page not in cache, show 404
                            return caches.match('/404.html');
                        });
                })
        );
        return;
    }

    // C. STATIC ASSETS (CSS, JS, Images): Cache First (Speed)
    // Check cache first. If missing, fetch from network and cache it.
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((response) => {
                // Check if valid response
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Cache the new asset
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            });
        })
    );
});