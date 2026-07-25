const CACHE = "autoforge-v1";
const PRECACHE_URLS = ["/", "/catalogue", "/contact", "/saisie"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      try {
        return cache.addAll(PRECACHE_URLS);
      } catch {
        // non-blocking — offline works for already-visited pages
        return Promise.resolve();
      }
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== CACHE)
          .map((n) => caches.delete(n)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE).then((cache) => {
          try {
            cache.put(request, clone);
          } catch {
            // ignore cache failures for non-cacheable responses
          }
        });
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached ?? new Response("Hors ligne", { status: 503 }))),
  );
});
