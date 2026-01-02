
const CACHE_NAME = 'nexus-v2';
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(['/', '/index.html']))));
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) return;
  event.respondWith(caches.match(event.request).then(r => r || fetch(event.request)));
});
