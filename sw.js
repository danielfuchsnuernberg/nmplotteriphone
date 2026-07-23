/* ============================================================
   NM Plotter — iPhone shell — Service Worker

   Separate repo, separate cache namespace. This must never share a
   cache name with the live NM Plotter build, or the two will evict
   each other's shells on the same device.

   The shell is a single self-contained HTML file with no external
   requests, so precaching it is all that is needed for full offline
   use. There is no map archive here — the placeholder map is drawn
   in CSS.

   Bump CACHE on every version so devices pull the new copy instead
   of serving an old cached one.
   ============================================================ */
const CACHE = 'nmplotter-iphone-v76';

const SHELL = [
  './',
  './index.html'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // allSettled so one failed entry cannot abort the whole install
    await Promise.allSettled(SHELL.map(u => cache.add(new Request(u, { cache: 'reload' }))));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    // only drop this app's old caches; never touch the live build's
    await Promise.all(
      keys.filter(k => k.startsWith('nmplotter-iphone-') && k !== CACHE)
          .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  e.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const res = await fetch(req);
      if (res && res.ok && url.origin === self.location.origin) {
        const cache = await caches.open(CACHE);
        cache.put(req, res.clone());
      }
      return res;
    } catch (_) {
      // Offline and not cached. For a navigation, fall back to the shell.
      if (req.mode === 'navigate') {
        const shell = await caches.match('./index.html');
        if (shell) return shell;
      }
      return new Response('', { status: 503, statusText: 'offline' });
    }
  })());
});
