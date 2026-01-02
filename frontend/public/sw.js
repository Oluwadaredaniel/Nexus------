
const CACHE_NAME = 'nexus-premium-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/bg-grain.png',
  '/manifest.json'
];

// Install Event: Pre-cache core static assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

// Activate Event: Clean up old caches
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
    }).then(() => self.clients.claim())
  );
});

// Helper: Determine request type
const isApiRequest = (url) => url.includes('/api/');
const isStaticAsset = (url) => url.match(/\.(js|css|png|jpg|jpeg|svg|woff2|woff|ttf)$/);
const isNavigation = (req) => req.mode === 'navigate';

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. API Requests: Network First, Fallback to Cache
  // This ensures data is fresh when online, but available when offline.
  if (isApiRequest(url.href)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the successful response
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => caches.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          // Optional: Return a specific offline JSON error
          return new Response(JSON.stringify({ message: 'You are offline', offline: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }))
    );
    return;
  }

  // 2. Navigation Requests (HTML): Network First, Fallback to /index.html (SPA)
  if (isNavigation(request)) {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // 3. Static Assets (JS, CSS, Images): Stale-While-Revalidate
  // Serve cached immediately, update in background for next time.
  if (isStaticAsset(url.href)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
          return networkResponse;
        });
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 4. Default: Network only
  event.respondWith(fetch(request));
});
