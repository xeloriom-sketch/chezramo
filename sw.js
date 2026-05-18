/* ═══════════════════════════════════════════════
   CHEZ RAMO — Service Worker
   Offline-first · Cache agressif · Pre-cache total
   ═══════════════════════════════════════════════ */

var CACHE = 'ramo-v2';
var STATIC = [
  '/',
  '/index.html',
  '/menu.js',
  '/style.css'
];

/* ── Install : cache les assets critiques ─────── */
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      return c.addAll(STATIC);
    })
  );
  self.skipWaiting();
});

/* ── Activate : supprime les anciens caches ────── */
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

/* ── Fetch : offline-first par type ─────────────
   - version.json    → réseau direct (détection deploy)
   - supabase.co     → réseau, fallback [] si hors ligne
   - images          → cache en PREMIER, réseau en fond
   - HTML/JS/CSS     → cache en PREMIER, réseau en fond
   ─────────────────────────────────────────────── */
self.addEventListener('fetch', function(e) {
  var url = e.request.url;
  var method = e.request.method;
  if (method !== 'GET') return;

  /* version.json : jamais en cache, toujours frais */
  if (url.indexOf('version.json') !== -1) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(function() {
        return new Response('{"v":"0"}', {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  /* Supabase API : réseau, fallback vide si offline */
  if (url.indexOf('supabase.co') !== -1) {
    e.respondWith(
      fetch(e.request).catch(function() {
        return new Response('[]', {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  /* Tout le reste (images, JS, CSS, HTML) :
     cache en premier → réponse immédiate,
     mise à jour réseau en arrière-plan               */
  e.respondWith(
    caches.open(CACHE).then(function(cache) {
      return cache.match(e.request).then(function(cached) {
        var networkFetch = fetch(e.request).then(function(response) {
          if (response && response.ok) {
            cache.put(e.request, response.clone());
          }
          return response;
        }).catch(function() {
          /* Hors ligne : retourne le cache ou une réponse vide */
          return cached || new Response('', { status: 503 });
        });

        /* Retourne le cache immédiatement si dispo */
        return cached || networkFetch;
      });
    })
  );
});

/* ── Messages depuis la page ─────────────────────
   SKIP_WAITING  : activation immédiate du nouveau SW
   PRECACHE      : télécharge toutes les images en fond
   ─────────────────────────────────────────────── */
self.addEventListener('message', function(e) {
  if (!e.data) return;

  if (e.data === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  /* Pre-cache de toutes les images menu en arrière-plan.
     Téléchargement séquentiel avec pause pour ne pas
     saturer une connexion WiFi faible.               */
  if (e.data.type === 'PRECACHE') {
    var urls = e.data.urls || [];
    var delay = e.data.slow ? 400 : 150; /* pause entre chaque */

    caches.open(CACHE).then(function(cache) {
      var i = 0;
      function next() {
        if (i >= urls.length) return;
        var url = urls[i++];
        cache.match(url).then(function(hit) {
          if (hit) {
            /* Déjà en cache → on passe directement */
            setTimeout(next, 20);
          } else {
            fetch(url, { mode: 'no-cors' }).then(function(r) {
              if (r && (r.ok || r.type === 'opaque')) cache.put(url, r);
              setTimeout(next, delay);
            }).catch(function() {
              setTimeout(next, delay * 2);
            });
          }
        });
      }
      /* Délai initial : laisse la page se charger d'abord */
      setTimeout(next, 4000);
    });
  }
});
