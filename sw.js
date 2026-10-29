/* Tikè Lakay app - service worker.
 * Pages: network FIRST (a ticket, an event or a price must never be shown from
 * an old copy when the network is there), the saved copy only when offline.
 * Pictures, icons, scripts of this site: the saved copy first, refreshed behind.
 * ⛔ Never anything from another site: the API (tickets, payments, the QR) is
 * always asked live - a cached "valid" at the door would be a lie. */
const CACHE = 'tl-app-v1';
const SHELL = ['./', 'index.html', 'my-tickets.html', 'check.html', 'manifest.webmanifest',
  'assets/icon-192.png', 'assets/tike-lakay-logo.png', 'event-types.js', 'js/pwa.js'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate' || /\.html$/.test(url.pathname) || url.pathname.endsWith('/')) {
    e.respondWith(fetch(req).then((r) => {
      const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return r;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => {
    const net = fetch(req).then((r) => { if (r.ok) { const c2 = r.clone(); caches.open(CACHE).then((c) => c.put(req, c2)); } return r; }).catch(() => hit);
    return hit || net;
  }));
});
