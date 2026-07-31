/* ============================================================
   NM Plotter — iPhone shell — Service Worker

   Separate repo, separate cache namespace. This must never share a
   cache name with the live NM Plotter build, or the two will evict
   each other's shells on the same device.

   Carries the pmtiles range machinery lifted from the live build's
   worker: PMTiles reads the archive by byte range, so we slice the
   cached copy and answer 206. Without this the offline vector
   basemap cannot draw.

   Terrain tiles get their own cache that survives version bumps, so
   a new app version never discards a downloaded terrain region.

   Bump CACHE on every version so devices pull the new copy instead
   of serving an old cached one.
   ============================================================ */
const CACHE         = 'nmplotter-iphone-v103';
const TERRAIN_CACHE = 'nmplotter-iphone-terrain';

const SHELL = [
  './',
  './index.html',
  './png.pmtiles'   // optional — install won't fail if it isn't there yet
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
      keys.filter(k => k.startsWith('nmplotter-iphone-')
                    && k !== CACHE
                    && k !== TERRAIN_CACHE)
          .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// Keep the archive in memory once read, so range requests don't
// re-decode the whole cached file every time.
const pmBuffers = {};

async function rangeFromCache(request, rangeHeader) {
  const url = request.url.split('#')[0];
  if (!pmBuffers[url]) {
    const cache = await caches.open(CACHE);
    let full = await cache.match(url, { ignoreSearch: true });
    if (!full) {
      try {
        full = await fetch(url);
        if (full && full.ok) cache.put(url, full.clone());
      } catch (_) { return new Response('', { status: 503 }); }
    }
    if (!full || !full.ok) return new Response('', { status: 503 });
    pmBuffers[url] = await full.arrayBuffer();
  }
  const buf   = pmBuffers[url];
  const total = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(rangeHeader || '');
  let start = m && m[1] !== '' ? parseInt(m[1], 10) : 0;
  let end   = m && m[2] !== '' ? parseInt(m[2], 10) : total - 1;
  if (isNaN(start) || start < 0) start = 0;
  if (isNaN(end) || end >= total) end = total - 1;
  if (start > end) start = 0;
  const slice = buf.slice(start, end + 1);
  return new Response(slice, {
    status: 206,
    headers: {
      'Content-Type':   'application/octet-stream',
      'Content-Range':  `bytes ${start}-${end}/${total}`,
      'Content-Length': String(slice.byteLength),
      'Accept-Ranges':  'bytes'
    }
  });
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Terrain elevation tiles (cross-origin), for the terrain layer later.
  if (url.hostname.indexOf('amazonaws.com') >= 0 && url.pathname.indexOf('/terrarium/') >= 0) {
    e.respondWith(
      caches.open(TERRAIN_CACHE)
        .then(c => c.match(req))
        .then(hit => hit || fetch(req))
    );
    return;
  }

  // PMTiles byte-range request -> serve a slice from the cached archive
  if (url.pathname.endsWith('.pmtiles') && req.headers.get('range')) {
    e.respondWith(rangeFromCache(req, req.headers.get('range')));
    return;
  }

  // Basemap / imagery tiles: network first, cached copy as the fallback.
  // Cache-first would freeze the map on a stale tile set.
  if (url.hostname.indexOf('cartocdn.com') >= 0 ||
      url.hostname.indexOf('arcgisonline.com') >= 0) {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) { (await caches.open(CACHE)).put(req, res.clone()); }
        return res;
      } catch (_) {
        const hit = await caches.match(req, { ignoreSearch: true });
        return hit || new Response('', { status: 503 });
      }
    })());
    return;
  }

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
