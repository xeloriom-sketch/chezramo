/* ═══════════════════════════════════════════════
   CHEZ RAMO — Service Worker
   Cache agressif + auto-refresh au déploiement
   ═══════════════════════════════════════════════ */

var CACHE = 'ramo-v1';
var STATIC = [
  '/',
  '/index.html',
  '/menu.js',
  '/style.css'
];

/* ── Install : mise en cache des assets statiques */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(STATIC); })
  );
  self.skipWaiting();
});

/* ── Activate : suppression des anciens caches ── */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* ── Fetch : stratégie selon le type de ressource */
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  /* version.json → toujours réseau (détection déploiement) */
  if (url.indexOf('version.json') !== -1) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(function() {
        return new Response('{"v":"0"}', { headers: { 'Content-Type': 'application/json' } });
      })
    );
    return;
  }

  /* Supabase API → réseau uniquement, pas de cache */
  if (url.indexOf('supabase.co') !== -1) {
    e.respondWith(fetch(e.request).catch(function() {
      return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
    }));
    return;
  }

  /* Images → cache en premier, mise à jour en arrière-plan */
  if (url.match(/\.(webp|png|jpg|jpeg|gif|svg)(\?.*)?$/i)) {
    e.respondWith(
      caches.open(CACHE).then(function(cache) {
        return cache.match(e.request).then(function(cached) {
          var networkFetch = fetch(e.request).then(function(response) {
            if (response && response.ok) {
              cache.put(e.request, response.clone());
            }
            return response;
          }).catch(function() { return cached; });
          /* Retourne le cache immédiatement, met à jour en fond */
          return cached || networkFetch;
        });
      })
    );
    return;
  }

  /* HTML / JS / CSS → stale-while-revalidate */
  e.respondWith(
    caches.open(CACHE).then(function(cache) {
      return cache.match(e.request).then(function(cached) {
        var networkFetch = fetch(e.request).then(function(response) {
          if (response && response.ok) {
            cache.put(e.request, response.clone());
          }
          return response;
        }).catch(function() { return cached; });
        return cached || networkFetch;
      });
    })
  );
});

/* ── Message : skip waiting (forcer mise à jour) ─ */
self.addEventListener('message', function(e) {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
