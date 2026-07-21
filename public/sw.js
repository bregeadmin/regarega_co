/* Rega Rega service worker — offline-capable caching.
   Strategy:
   - Precache the app shell (guide/stays, EN+RU, manifest, icons, offline fallback) on install.
   - Navigations (page loads): network-first, falling back to the cached page, then to /offline.html.
   - Other same-origin GET requests (JS/CSS/images/fonts): stale-while-revalidate — serve from
     cache instantly while refreshing in the background.
   - Cross-origin requests (Supabase API, remote images, etc.) are left untouched — never cached,
     never intercepted, so auth/data calls always hit the network normally.
   - Old cache versions are purged on activate; bump VERSION to force a refresh of the app shell. */

const VERSION = 'rega-v1';
const PRECACHE = [
  '/georgia/batumi/guide', '/georgia/batumi/stays',
  '/ru/georgia/batumi/guide', '/ru/georgia/batumi/stays',
  '/offline.html', '/manifest.webmanifest',
  '/icons/icon-192.png?v=7', '/icons/icon-512.png?v=7',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSION)
      .then((c) => c.addAll(PRECACHE).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return; // don't touch cross-origin (Supabase API/images)

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((r) => { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); return r; })
        .catch(() => caches.match(req).then((m) => m || caches.match('/offline.html')))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req)
        .then((r) => { if (r.ok) { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); } return r; })
        .catch(() => cached);
      return cached || net;
    })
  );
});
