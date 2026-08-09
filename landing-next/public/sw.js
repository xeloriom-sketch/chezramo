/* ═══════════════════════════════════════════════
   CHEZ RAMO — Service Worker
   Offline-first · Cache agressif · Pre-cache total
   ═══════════════════════════════════════════════ */

var CACHE = 'ramo-v5';
var STATIC = [
  '/tv',
  '/tv/menu.js',
  '/tv/style.css',
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(STATIC);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  var method = e.request.method;
  if (method !== 'GET') return;

  /* version.json : jamais en cache */
  if (url.indexOf('version.json') !== -1) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(function() {
        return new Response('{"v":"0"}', { headers: { 'Content-Type': 'application/json' } });
      })
    );
    return;
  }

  /* Routes API Next.js : réseau direct, JAMAIS en cache */
  if (url.indexOf('/api/') !== -1) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(function() {
        return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
      })
    );
    return;
  }

  /* Pages admin : réseau direct (évite de cacher des 404 d'onglets dynamiques) */
  if (url.indexOf('/admin') !== -1 || url.indexOf('/menu-qr') !== -1) {
    e.respondWith(fetch(e.request).catch(function() {
      return new Response('', { status: 503 });
    }));
    return;
  }

  /* Supabase : réseau, fallback vide si offline */
  if (url.indexOf('supabase.co') !== -1) {
    e.respondWith(
      fetch(e.request).catch(function() {
        return new Response('[]', { headers: { 'Content-Type': 'application/json' } });
      })
    );
    return;
  }

  /* Next.js build assets : réseau (ne pas cacher les hash changeants) */
  if (url.indexOf('/_next/') !== -1) return;

  /* Tout le reste (images, TV assets) : cache-first */
  e.respondWith(
    caches.open(CACHE).then(function(cache) {
      return cache.match(e.request).then(function(cached) {
        var networkFetch = fetch(e.request).then(function(response) {
          if (response && response.ok) cache.put(e.request, response.clone());
          return response;
        }).catch(function() {
          return cached || new Response('', { status: 503 });
        });
        return cached || networkFetch;
      });
    })
  );
});

self.addEventListener('message', function(e) {
  if (!e.data) return;

  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (e.data.type === 'PRECACHE') {
    var urls = e.data.urls || [];
    var delay = e.data.slow ? 400 : 150;
    caches.open(CACHE).then(function(cache) {
      var i = 0;
      function next() {
        if (i >= urls.length) return;
        var url = urls[i++];
        cache.match(url).then(function(hit) {
          if (hit) { setTimeout(next, 20); return; }
          fetch(url, { mode: 'no-cors' }).then(function(r) {
            if (r && (r.ok || r.type === 'opaque')) cache.put(url, r);
            setTimeout(next, delay);
          }).catch(function() { setTimeout(next, delay * 2); });
        });
      }
      setTimeout(next, 4000);
    });
  }
});
