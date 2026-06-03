/* ============================================================
   SERVICE WORKER — sw.js
   Fabulous & More — Cache After Cookie Consent
   ============================================================ */

const CACHE_NAME = "fabulous-v1";
const IMAGE_CACHE = "fabulous-images-v1";

const PRECACHE_ASSETS = [
  "/",
  "/images/hero-kitchen.jpg",
  "/images/hero-teapots.jpg",
  "/images/hero-tea.jpg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS).catch(() => {})),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== IMAGE_CACHE)
            .map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.pathname.startsWith("/api/")) return;

  const isImage =
    request.destination === "image" ||
    url.pathname.match(/\.(jpg|jpeg|png|webp|gif|svg|ico)$/i) ||
    url.hostname === "images.unsplash.com" ||
    url.hostname === "res.cloudinary.com";

  if (isImage) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          /* Only cache valid responses — clone BEFORE reading */
          if (response.ok && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          return cached || Response.error();
        }
      }),
    );
    return;
  }

  /* Network-first for everything else */
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request)),
  );
});

/* Prefetch after cookie consent */
self.addEventListener("message", async (event) => {
  if (event.data?.type !== "PREFETCH_IMAGES") return;

  const urls = event.data.urls || [];
  const cache = await caches.open(IMAGE_CACHE);
  let cached = 0;

  const batchSize = 6;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    await Promise.allSettled(
      batch.map(async (url) => {
        try {
          const already = await cache.match(url);
          if (already) {
            cached++;
            return;
          }
          const res = await fetch(url);
          if (res.ok) {
            await cache.put(url, res);
            cached++;
          }
        } catch {
          /* skip */
        }
      }),
    );
  }

  const clients = await self.clients.matchAll();
  clients.forEach((client) =>
    client.postMessage({ type: "PREFETCH_DONE", count: cached }),
  );
});
