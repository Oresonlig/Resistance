// The Chain — Service Worker
// PM3: Offline-stöd + cache-bust per app-version.
// Strategi: stale-while-revalidate för statiska resurser, network-only för Supabase.
// Versionerad cache-key gör att ny version automatiskt rensar gammal cache vid activate.

// Version läses från registrerings-URL (./sw.js?v=X.Y.Z) så att index.html förblir
// single-source-of-truth. Browsern ser olika URL per version → installerar ny SW.
const APP_VERSION = new URL(self.location).searchParams.get('v') || 'unknown';
const CACHE_NAME = `thechain-cache-v${APP_VERSION}`;
const CORE_ASSETS = ['./', './index.html'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(CORE_ASSETS.map(url =>
        fetch(url, {cache: 'no-store'}).then(r => cache.put(url, r)).catch(() => {})
      )))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[SW] install failed:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;

  const url = new URL(req.url);

  // Network-only för Supabase: synk/auth får aldrig serveras från cache.
  if(url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in')){
    return;
  }

  // Stale-while-revalidate för allt annat (HTML, fonts, CDN-script, bilder).
  // Cachen serveras direkt om den finns; samtidigt hämtas fresh i bakgrunden
  // och uppdaterar cachen för nästa request. Vid offline: cachen är fallback.
  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(req);
      const networkPromise = fetch(req).then(resp => {
        if(resp && resp.status === 200 && (resp.type === 'basic' || resp.type === 'cors')){
          cache.put(req, resp.clone()).catch(() => {});
        }
        return resp;
      }).catch(() => cached);
      return cached || networkPromise;
    })
  );
});
