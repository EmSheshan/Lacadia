const CACHE_NAME = 'pokemon-images-cache-v1';
const IMAGE_CACHE_PATTERN = /pokemonArt\/(.*)\.(png|jpg|jpeg|webp)$/i;

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(BG_IMAGES))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // Cache background images
  if (BG_IMAGES.some(bg => request.url.endsWith(bg))) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(response =>
          response || fetch(request).then(networkResponse => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          })
        )
      )
    );
    return;
  }

  // Only cache images from pokemonArt/
  if (IMAGE_CACHE_PATTERN.test(request.url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(request).then(response =>
          response || fetch(request).then(networkResponse => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          })
        )
      )
    );
  }
});
