/* ═══════════════════════════════════════════════
   CHEZ RAMO — Logique menu TV  |  menu.js
   Offline-first · WebP · Adaptatif réseau
   ═══════════════════════════════════════════════ */

/* ── Polyfills TV ───────────────────────────── */
if (!String.prototype.padStart) {
  String.prototype.padStart = function(len, fill) {
    var s = String(this); fill = fill || ' ';
    while (s.length < len) s = fill + s;
    return s;
  };
}
if (!Object.values) {
  Object.values = function(obj) {
    return Object.keys(obj).map(function(k) { return obj[k]; });
  };
}

/* ── Config ─────────────────────────────────── */
var SUPABASE_URL   = 'https://hqfewokpvjmxezhnurbm.supabase.co';
var SUPABASE_KEY   = 'sb_publishable_NmIfxaQb5ncapzCtzI5uNQ_tHdCwAyc';
var BASE_DURATION  = 6000;  /* durée normale d'un slide (demande client) */
var SLOW_DURATION  = 9000;  /* durée en connexion faible (temps de charger) */
var SLIDE_DURATION = BASE_DURATION;
var loadedSlides   = {};

/* ════════════════════════════════════════════════
   MODE 2 TV : chaque écran affiche la moitié du menu
   ────────────────────────────────────────────────
   TV_ID = 0 → toutes les catégories (TV unique)
   TV_ID = 1 → première moitié   |   TV_ID = 2 → seconde moitié

   DÉTECTION AUTO (défaut) : chaque TV s'enregistre dans
   la table Supabase `tv_roles` et prend le premier rôle
   libre (1 puis 2). Heartbeat toutes les 45 s ; un rôle
   sans nouvelle depuis 2 min est considéré libre.
   Manuel : touche 1 / 2 (0 = menu complet, 5 = retour auto)
   ou URL index.html?tv=1 — mémorisé (localStorage).
   ════════════════════════════════════════════════ */
var TV_ID     = 0;      /* rôle effectif de CETTE TV */
var TV_MANUAL = null;   /* choix manuel mémorisé — null = mode auto */
var DEVICE_ID = '';     /* identité stable de cette TV */
(function() {
  try {
    DEVICE_ID = localStorage.getItem('ramo_device') || '';
    if (!DEVICE_ID) {
      DEVICE_ID = 'tv-' + Math.random().toString(36).slice(2, 10) + '-' + Date.now().toString(36);
      localStorage.setItem('ramo_device', DEVICE_ID);
    }
  } catch (e) {
    DEVICE_ID = 'tv-' + Math.random().toString(36).slice(2, 10);
  }
  var m = location.search.match(/[?&]tv=(\d)/);
  if (m) {
    TV_MANUAL = parseInt(m[1], 10) || 0;
    try { localStorage.setItem('ramo_tv', String(TV_MANUAL)); } catch (e) {}
  } else {
    try {
      var s = localStorage.getItem('ramo_tv');
      if (s !== null && s !== '') TV_MANUAL = parseInt(s, 10) || 0;
    } catch (e) {}
  }
  if (TV_MANUAL !== null) {
    if (TV_MANUAL !== 1 && TV_MANUAL !== 2 && TV_MANUAL !== 3) TV_MANUAL = 0;
    TV_ID = TV_MANUAL;
  } else {
    /* Rôle auto détecté lors d'une session précédente → appliqué immédiatement,
       évite le flash "plein menu → demi-menu" au chargement */
    try {
      var sa = localStorage.getItem('ramo_tv_auto');
      if (sa) TV_ID = parseInt(sa, 10) || 0;
    } catch(e) {}
  }
})();


/* Normalise un nom de catégorie pour comparaison sans accent ni casse */
function normCat(s) {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/* Split TV1/TV2/TV3 fixé par noms de catégories (accent-insensible)
   pour que les catégories restent sur la bonne TV même si Supabase
   utilise des noms légèrement différents (accents, casse). */
var _tv1Cats = null;
var _tv2Cats = null;
function _initTvCats() {
  if (_tv1Cats) return;
  _tv1Cats = {}; _tv2Cats = {};
  /* TV1 : 9 premières catégories (Sandwichs → Finger Food)
     TV2 : le reste, dont Accompagnements & Sauces en premier */
  var half = 9;
  for (var _i = 0; _i < defaultMenu.length; _i++) {
    var _key = normCat(defaultMenu[_i].category);
    if (_i < half) _tv1Cats[_key] = true;
    else           _tv2Cats[_key] = true;
  }
}
function slidesForTv(data) {
  if (TV_ID === 3) return data.map(function(cat) {
    return Object.assign({}, cat, { items: (cat.items || []).filter(function(it) {
      return (it.title || '').toLowerCase() !== 'grande frite';
    })});
  });        /* TV3 = diapo : tout le menu sauf Grande Frite */
  if (TV_ID !== 1 && TV_ID !== 2) return data;
  _initTvCats();
  var out1 = [], out2 = [], unk = [];
  for (var _j = 0; _j < data.length; _j++) {
    var _key = normCat(data[_j].category);
    if (_tv1Cats[_key])      out1.push(data[_j]);
    else if (_tv2Cats[_key]) out2.push(data[_j]);
    else                     unk.push(data[_j]);
  }
  var uh = Math.ceil(unk.length / 2);
  if (TV_ID === 1) return out1.concat(unk.slice(0, uh));
  return out2.concat(unk.slice(uh));
}

/* ════════════════════════════════════════════════
   MODE D'AFFICHAGE
   ────────────────────────────────────────────────
   'board' → panneau type fast-food : tout le menu
             visible d'un coup (défaut)
   'diapo' → ancien diaporama photo (3 plats/slide)
   Touche 3 de la télécommande pour basculer.
   ════════════════════════════════════════════════ */
var MODE = 'board';
(function() {
  try {
    var m = localStorage.getItem('ramo_mode');
    if (m === 'diapo' || m === 'board') MODE = m;
  } catch (e) {}
  if (TV_ID === 3) MODE = 'diapo'; /* TV3 : slider à la place du pub */
})();
var BOARD_DURATION = 20000; /* rotation entre pages du panneau */
var BOARD_MAX_COL  = 9;     /* moins de catégories par colonne → texte plus grand et aéré */

/* ════════════════════════════════════════════════
   DÉTECTION RÉSEAU & ADAPTATION
   ════════════════════════════════════════════════ */
var netQuality  = 'unknown'; /* 'fast' | 'medium' | 'slow' | 'offline' */
var statusEl    = null;
var hideTimer   = null;
var perfStyle   = null;

function getNetQuality() {
  if (!navigator.onLine) return 'offline';
  var nc = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (nc) {
    var ect = nc.effectiveType || '';
    if (ect === 'slow-2g' || ect === '2g') return 'slow';
    if (ect === '3g')                       return 'medium';
    if (ect === '4g')                       return 'fast';
    if (nc.downlink !== undefined) {
      if (nc.downlink < 0.5) return 'slow';
      if (nc.downlink < 2)   return 'medium';
      return 'fast';
    }
  }
  return 'unknown';
}

/* Applique les adaptations visuelles selon la qualité réseau */
function applyNetQuality(q) {
  netQuality = q;
  if (!perfStyle) {
    perfStyle = document.createElement('style');
    perfStyle.id = '_perf';
    document.head.appendChild(perfStyle);
  }
  if (q === 'slow' || q === 'offline') {
    /* Connexion faible : coupe Ken Burns, transitions légères */
    perfStyle.textContent =
      '.slide.active .card-img img.loaded{' +
        '-webkit-transform:scale(1) translateZ(0)!important;' +
        'transform:scale(1) translateZ(0)!important;' +
      '}' +
      '.card-img img{' +
        '-webkit-transition:opacity 0.3s ease!important;' +
        'transition:opacity 0.3s ease!important;' +
      '}';
    SLIDE_DURATION = SLOW_DURATION;
  } else {
    perfStyle.textContent = '';
    SLIDE_DURATION = BASE_DURATION;
  }
  /* Si le défilement tourne déjà, applique la nouvelle durée */
  if (autoTimer) startAuto();
}

/* Indicateur réseau : pill discret en bas de l'écran */
function showNetStatus(msg, color, autohideMs) {
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.style.cssText = [
      'position:fixed;bottom:14px;left:50%;',
      '-webkit-transform:translateX(-50%);',
      'transform:translateX(-50%);',
      'padding:5px 16px;border-radius:99px;',
      'font-family:Arial,Helvetica,sans-serif;',
      'font-size:1vw;font-weight:700;',
      'letter-spacing:0.1vw;text-transform:uppercase;',
      'color:#fff;z-index:9999;pointer-events:none;',
      'box-shadow:0 2px 12px rgba(0,0,0,0.5);',
      'opacity:0;',
      '-webkit-transition:opacity 0.4s ease;',
      'transition:opacity 0.4s ease;'
    ].join('');
    document.body.appendChild(statusEl);
  }
  clearTimeout(hideTimer);
  statusEl.textContent = msg;
  statusEl.style.background = color;
  /* Micro-délai pour que la transition CSS joue */
  setTimeout(function() { statusEl.style.opacity = '1'; }, 10);
  if (autohideMs) {
    hideTimer = setTimeout(function() { statusEl.style.opacity = '0'; }, autohideMs);
  }
}

function hideNetStatus() {
  if (statusEl) statusEl.style.opacity = '0';
  clearTimeout(hideTimer);
}

/* Événements réseau */
window.addEventListener('offline', function() {
  applyNetQuality('offline');
  showNetStatus('HORS LIGNE — Menu en cache', '#333333', 0);
});

window.addEventListener('online', function() {
  var q = getNetQuality();
  applyNetQuality(q);
  showNetStatus('CONNEXION RÉTABLIE', '#1c7c3e', 3500);
  /* Resynchronise le menu dès que le réseau revient */
  setTimeout(fetchMenu, 1500);
  setTimeout(checkVersion, 3000);
  setTimeout(tvClaim, 4000);
});

/* Change de qualité réseau en direct (ex: TV qui s'éloigne du routeur) */
(function() {
  var nc = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (nc && nc.addEventListener) {
    nc.addEventListener('change', function() {
      var q = getNetQuality();
      if (q !== netQuality) {
        applyNetQuality(q);
        if (q === 'slow') {
          showNetStatus('CONNEXION FAIBLE — Mode économique', '#b05000', 5000);
        }
      }
    });
  }
})();

/* ════════════════════════════════════════════════
   WEBP & CHARGEMENT IMAGE
   ════════════════════════════════════════════════ */
var webpSupported = null;

function detectWebp(cb) {
  if (webpSupported !== null) { cb(webpSupported); return; }
  var img = new Image();
  img.onload = img.onerror = function() {
    webpSupported = (img.width === 1);
    cb(webpSupported);
  };
  img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJZQCdAEO/gHOAAA=';
}

function toWebp(url) {
  if (!url) return url;
  return url.replace(/\.(png|jpg|jpeg)(\?.*)?$/i, '.webp$2');
}

/* Version détourée (fond transparent) d'une image :
   uploads/X.png → uploads/cut/X.png (générées par IA, dans le repo) */
function cutUrl(url) {
  if (!url || url.indexOf('uploads/') === -1) return null;
  return url.replace('uploads/', 'uploads/cut/')
            .replace(/\.(jpg|jpeg|webp)(\?.*)?$/i, '.png$2');
}

/* Vignette panneau : détourée en priorité, fallback photo originale */
/* Normalise la taille visuelle du plat dans une image détourée.
   Scanne les pixels non-transparents, calcule la boîte englobante,
   applique un scale individuel pour homogénéiser tous les plats. */
function normalizeThumb(img) {
  var par = img.parentElement;
  if (!par) return;
  var isHero  = par.className.indexOf('bhero-photo') !== -1;
  var isThumb = par.className.indexOf('biph') !== -1;
  if (!isHero && !isThumb) return;
  if (isHero && TV_ID === 3) return; /* TV3 pub : pas de normalisation sur le fond */
  try {
    var c = document.createElement('canvas');
    c.width  = img.naturalWidth;
    c.height = img.naturalHeight;
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var d = ctx.getImageData(0, 0, c.width, c.height).data;
    var minX = c.width, maxX = 0, minY = c.height, maxY = 0;
    for (var i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 15) {
        var px = (i >> 2) % c.width;
        var py = (i >> 2) / c.width | 0;
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    }
    if (maxX <= minX || maxY <= minY) return;
    var foodSize   = Math.max(maxX - minX + 1, maxY - minY + 1);
    var canvasSize = Math.max(c.width, c.height);
    if (isHero) {
      /* Héros : normalise sur la plus grande dimension du plat → taille uniforme */
      var scale = Math.min((canvasSize * 0.72) / foodSize, 1.5);
      var foodCenterRatio = (minY + maxY) / 2 / c.height;
      var offsetY = (0.5 - foodCenterRatio) * 100;
      img.style.transformOrigin = 'center center';
      img.style.transform = 'scale(' + scale.toFixed(2) + ') translateY(' + offsetY.toFixed(1) + '%)';
    } else {
      var scale = Math.min((canvasSize * 1.35) / foodSize, 5.4);
      img.style.transform = 'scale(' + scale.toFixed(2) + ')';
    }
  } catch (e) {}
}

function loadThumb(img, src) {
  if (!src) { img.style.display = 'none'; return; }
  var cut = cutUrl(src);
  if (!cut || cut === src) { loadImg(img, src); return; }
  var cutWp = cut.replace(/\.png(\?.*)?$/i, '.webp');

  function tryPng() {
    var p = new Image();
    p.onload = function() {
      img.onload = function() { normalizeThumb(img); };
      img.src = cut;
      img.className = 'loaded';
    };
    p.onerror = function() { loadImg(img, src); };
    p.src = cut;
  }

  detectWebp(function(ok) {
    if (!ok || cutWp === cut) { tryPng(); return; }
    var p = new Image();
    p.onload = function() {
      img.onload = function() { normalizeThumb(img); };
      img.src = cutWp;
      img.className = 'loaded';
    };
    p.onerror = tryPng;
    p.src = cutWp;
  });
}

/* Charge une image : WebP en priorité, fallback sur original */
function loadImg(img, src) {
  if (!src) { img.style.display = 'none'; return; }
  detectWebp(function(ok) {
    var primary  = ok ? toWebp(src) : src;
    var fallback = src;
    var probe = new Image();
    probe.onload = function() { img.src = primary; img.className = 'loaded'; };
    probe.onerror = function() {
      if (primary !== fallback) {
        var probe2 = new Image();
        probe2.onload  = function() { img.src = fallback; img.className = 'loaded'; };
        probe2.onerror = function() { img.style.display = 'none'; };
        probe2.src = fallback;
      } else {
        img.style.display = 'none';
      }
    };
    probe.src = primary;
  });
}

/* ════════════════════════════════════════════════
   PRE-CACHE TOTAL : toutes les images en arrière-plan
   Le SW télécharge séquentiellement chaque image
   pour les rendre disponibles offline.
   ════════════════════════════════════════════════ */
function precacheAllImages(data) {
  if (!navigator.serviceWorker) return;
  var swc = navigator.serviceWorker.controller;
  if (!swc) {
    /* SW pas encore actif, on réessaie dans 4s */
    setTimeout(function() { precacheAllImages(data); }, 4000);
    return;
  }
  var urls = [];
  var seen = {};
  (data || menuData).forEach(function(slide) {
    (slide.items || []).forEach(function(item) {
      if (!item.url || seen[item.url]) return;
      seen[item.url] = true;
      urls.push(item.url);
      var wp = toWebp(item.url);
      if (wp !== item.url && !seen[wp]) { seen[wp] = true; urls.push(wp); }
      var ct = cutUrl(item.url);
      if (ct && !seen[ct]) { seen[ct] = true; urls.push(ct); }
      /* WebP cut (RGBA transparent, plus léger) */
      var ctWp = ct ? ct.replace(/\.png(\?.*)?$/i, '.webp') : null;
      if (ctWp && ctWp !== ct && !seen[ctWp]) { seen[ctWp] = true; urls.push(ctWp); }
    });
  });
  swc.postMessage({
    type: 'PRECACHE',
    urls: urls,
    slow: (netQuality === 'slow' || netQuality === 'medium')
  });
}

/* ════════════════════════════════════════════════
   DONNÉES MENU PAR DÉFAUT (fallback offline)
   ════════════════════════════════════════════════ */
var defaultMenu = [
  { category: "Sandwichs Vedettes", info: "", items: [
    { title: "Kebab",       description: "Pain rond, veau maison, crudités",        price: "9,00",  menuPrice: "12,00", url: "uploads/Kebab.png" },
    { title: "Kebab Frites",description: "Viande et frites servis dans le pain",    price: "9,50",                      url: "uploads/Kebab Frites.png" },
    { title: "Kebab Geant", description: "Double portion de viande de veau",        price: "15,00", menuPrice: "17,00", badge: "XXL", url: "uploads/Kebab Geant.png" }
  ]},
  { category: "Nos Specialites", info: "Servis Seul ou en Menu (+3,00€)", items: [
    { title: "Kofte",    description: "Boulettes de viande hachée épicées", price: "9,00", menuPrice: "12,00", url: "uploads/Americain.png" },
    { title: "Americain",description: "Steak haché et cheddar fondu",       price: "9,00", menuPrice: "12,00", url: "uploads/Kofte.png" },
    { title: "Escalope", description: "Filet de poulet pané maison",        price: "9,00", menuPrice: "12,00", url: "uploads/Escalope.png" }
  ]},
  { category: "Tradition & Galettes", info: "Pain miche ou galette fine au choix", items: [
    { title: "Miche Kebab", description: "Pain miche traditionnel croustillant", price: "9,00", menuPrice: "12,00", url: "uploads/Miche Kebab.png" },
    { title: "Galette",     description: "Dürum : fine galette roulée",          price: "9,00", menuPrice: "12,00", url: "uploads/Galette.png" },
    { title: "Cordon Bleu", description: "Sandwich au cordon bleu fondant",      price: "9,00", menuPrice: "12,00", url: "uploads/Cordon Bleu.png" }
  ]},
  { category: "Tacos", info: "Viande au choix : Kebab, Escalope, Kofte, Steak, Cordon Bleu", items: [
    { title: "Tacos",      description: "Sauce fromagère et frites incluses", price: "10,00", menuPrice: "13,00", url: "uploads/Tacos.png" },
    { title: "Maxi Tacos", description: "Format géant avec 2 viandes",        price: "15,00", menuPrice: "17,00", badge: "MAXI", url: "uploads/Maxi Tacos.png" }
  ]},
  { category: "Assiettes Gourmet", info: "Inclus : frites, blé et crudités fraîches", items: [
    { title: "Assiette Kebab",   description: "Veau maison servi à l'assiette", price: "15,00", url: "uploads/Assiette Kebab.png" },
    { title: "Assiette Escalope",description: "Poulet pané ou grillé",          price: "15,00", url: "uploads/Assiette Escalope.png" },
    { title: "Assiette Kofte",   description: "Boulettes maison grillées",      price: "15,00", url: "uploads/Assiette Kofte.png" }
  ]},
  { category: "Assiettes Gourmet (Suite)", info: "Accompagnements frais tous les jours", items: [
    { title: "Assiette Steak",      description: "Steaks hachés grillés minute",   price: "15,00", url: "uploads/Assiette Steak.png" },
    { title: "Assiette Cordon Bleu",description: "Deux cordons bleus fondants",    price: "15,00", url: "uploads/Assiette Cordon Bleu.png" },
    { title: "Assiette Mixte",      description: "Kebab + 2 viandes au choix",     price: "18,00", badge: "MIXTE", url: "uploads/Assiette Mixte.png" }
  ]},
  { category: "Assiettes & Salade", info: "Produits frais et de qualité", items: [
    { title: "Assiette Enfant",  description: "Frites + viandes",                  price: "12,00", url: "uploads/Assiette Enfant.png" },
    { title: "Assiette Emporter",description: "Format pratique (Mixte: 18,00€)",   price: "15,00", url: "uploads/Assiette Emporter.png" }
  ]},
  { category: "Burgers", info: "Menu : +3,00 Euro (Frites + Boisson)", items: [
    { title: "Chicken Burger",description: "Poulet croustillant et cheddar",   price: "6,00", menuPrice: "9,00", url: "uploads/Chicken Burger.png" },
    { title: "Cheese Burger", description: "Steak haché et fromage fondu",     price: "6,00", menuPrice: "9,00", url: "uploads/Cheese Burger.png" }
  ]},
  { category: "Finger Food", info: "Nos petites faims croustillantes", items: [
    { title: "Nuggets (x7)",description: "Filets de poulet frits dorés",   price: "8,50", url: "uploads/Nuggets (x7).png" },
    { title: "Wings (x4)",  description: "Ailerons de poulet épicés",      price: "7,50", url: "uploads/Wings (x8).png" },
    { title: "Tenders (x4)",description: "Aiguillettes de poulet tendres", price: "7,50", url: "uploads/Tenders (x4).png" }
  ]},
  { category: "Accompagnements & Sauces", info: "Pour compléter votre repas", items: [
    { title: "Frites",          description: "Petite portion",                    price: "2,00",   url: "uploads/Frites.png" },
    { title: "Grande Frite",    description: "Grande portion",                    price: "3,00",   url: "uploads/Frites.png" },
    { title: "Barquette Viande",description: "Portion de veau 100% maison",       price: "10,00",  url: "uploads/Barquette.png" },
  ]},
  { category: "Salades Fraiches", info: "Préparées avec des produits frais", items: [
    { title: "Salade Grecque",   description: "Tomates, concombres, olives, feta, oignons", price: "6,00",  url: "uploads/Salade_Grecque.png" },
    { title: "Salade du Berger", description: "Crudités, feta et olives",                   price: "10,00", url: "uploads/Salade du Berger.png" },
    { title: "Salade Shope",     description: "Saladerie fraîche maison",                   price: "6,00",  url: "uploads/Salade_Shope.png" }
  ]},
  { category: "Salades & Burek", info: "Spécialités maison", items: [
    { title: "Burek Fromage",  description: "Burek au fromage, feuilleté maison",    price: "3,50",  url: "uploads/Burek_Fromage.png" },
    { title: "Burek Epinards", description: "Burek aux épinards et fromage",         price: "3,50",  url: "uploads/Burek_Épinards.png" }
  ]},
  { category: "Burek & Specialites", info: "Recettes traditionnelles", items: [
    { title: "Burek Viande", description: "Burek à la viande, feuilleté croustillant", price: "4,00", url: "uploads/Burek_Viande.png" },
    { title: "Fli - Flija",  description: "Fli traditionnel maison",                   price: "4,00", url: "uploads/Fli_-_Flija.png" },
    { title: "Makarona",     description: "Penne, sauce tomate, fromage râpé",         price: "8,50", url: "uploads/Makarona.png" }
  ]},
  { category: "Plats Maison", info: "Cuisine faite maison chaque jour", items: [
    { title: "Escalope Creme",  description: "Poulet à la crème, champignons, légumes",                  price: "12,50", url: "uploads/Escalope_Crème.png" },
    { title: "Filet de Poulet", description: "Frites, fromage, tomate, salade de choux, sauce blanche",  price: "12,00", url: "uploads/Filet_de_Poulet.png" },
    { title: "Pleskavice",      description: "Frites, fromage, tomate, salade de choux, sauce blanche",  price: "9,50",  url: "uploads/Pleskavice.png" }
  ]},
  { category: "Qofte Grillees", info: "Frites, fromage, tomate, concombre, salade de choux, sauce blanche", items: [
    { title: "Qofte x5",  description: "5 boulettes grillées maison",  price: "9,00",  url: "uploads/Qofte_x5.png" },
    { title: "Qofte x7",  description: "7 boulettes grillées maison",  price: "11,00", url: "uploads/Qofte_x7.png" },
    { title: "Qofte x10", description: "10 boulettes grillées maison", price: "13,00", url: "uploads/Qofte_x10.png" }
  ]},
  { category: "Desserts", info: "Douceurs maison", items: [
    { title: "Trilece",  description: "Dessert traditionnel au lait", price: "3,50", url: "uploads/Trilece.png" },
    { title: "Tiramisu", description: "Tiramisu maison",              price: "3,50", url: "uploads/Tiramisu.png" }
  ]},
  { category: "Menu Enfants", info: "Petits plats pour nos petits clients", items: [
    { title: "Menu Enfant",     description: "4 Nuggets ou viande au choix",      price: "10,00", badge: "AU CHOIX", url: "uploads/Assiette Enfant.png" },
    { title: "Assiette Enfant", description: "Frites, viande et sauce au choix",  price: "12,00", url: "uploads/Assiette Enfant.png" }
  ]},
  { category: "Nos Sauces", items: [
    { title: "Nos Sauces", description: "Algérienne, Blanche, Samouraï... À partir de la 3ème sauce : 1€ supplémentaire", price: "INCLUSE", badge: "3ÈME: 1€ SUPP.", url: "uploads/Nos Sauces.png" }
  ]}
];

/* ── État global ────────────────────────────── */
var menuData    = JSON.parse(JSON.stringify(defaultMenu)); /* menu complet */
var viewData    = slidesForTv(menuData);                   /* slides de CETTE TV */
var current     = 0;
var autoTimer   = null;
var progressBar = document.getElementById('progress-bar');
var lastMenuJson = '';

/* ── Formatage des prix ─────────────────────── */
function makePrice(price, menuPrice) {
  var noMain = !price || price === 'INCLUSE' || price === 'OFFERT' || price === '';
  if (noMain && !menuPrice) return '';
  if (noMain && menuPrice) {
    var sp = menuPrice.indexOf(',') >= 0 ? menuPrice.split(',') : [menuPrice, '00'];
    return '<div class="price-row supp">' +
      '<span class="plabel">SUPP.</span>' +
      '<span class="pval">+' + sp[0] + '<sup>,' + sp[1] + '&euro;</sup></span>' +
      '</div>';
  }
  var parts = price.indexOf(',') >= 0 ? price.split(',') : [price, '00'];
  var html = '<div class="price-row">' +
    '<span class="plabel">SEUL</span>' +
    '<span class="pval">' + parts[0] + '<sup>,' + parts[1] + '&euro;</sup></span>' +
    '</div>';
  if (menuPrice) {
    var mp = menuPrice.indexOf(',') >= 0 ? menuPrice.split(',') : [menuPrice, '00'];
    html += '<div class="price-row menu">' +
      '<span class="plabel">MENU</span>' +
      '<span class="pval">' + mp[0] + '<sup>,' + mp[1] + '&euro;</sup></span>' +
      '</div>';
  }
  return html;
}

/* ── Construction HTML ──────────────────────── */
var slideTotal = 0; /* nombre de slides/pages réellement affichés */

function render() {
  var vp = document.getElementById('viewport');
  vp.innerHTML = (MODE === 'board') ? buildBoardHtml() : buildSlidesHtml();
  loadedSlides = {};
  /* Habillage spécifique panneau (bandeau d'en-tête rouge) */
  document.body.className = (MODE === 'board') ? 'mode-board' : '';
  if (MODE === 'board') { heroRender(); heroStart(); }
  else { heroStop(); }
  /* Barre de progression inutile si une seule page (panneau statique) */
  var pw = document.getElementById('progress-wrap');
  if (pw) pw.style.display = (slideTotal > 1) ? '' : 'none';
}

/* ── Diaporama photo (mode 'diapo') ─────────── */
function buildSlidesHtml() {
  slideTotal = viewData.length;
  var html = '';
  for (var sIdx = 0; sIdx < viewData.length; sIdx++) {
    var slide     = viewData[sIdx];
    var cols      = slide.items.length <= 2 ? 'cols-2' : '';
    var cardsHtml = '';
    for (var i = 0; i < slide.items.length; i++) {
      var item      = slide.items[i];
      var safeUrl   = (item.url || '').replace(/'/g, '%27');
      var badgeHtml = item.badge ? '<div class="badge">' + item.badge + '</div>' : '';
      cardsHtml +=
        '<div class="card">' +
          '<div class="card-img">' +
            badgeHtml +
            '<img data-src="' + safeUrl + '" src="" alt="' + (item.title || '') + '" decoding="async">' +
          '</div>' +
          '<div class="card-body">' +
            '<div class="c-name">' + (item.title || '') + '</div>' +
            '<div class="c-desc">' + (item.description || '') + '</div>' +
            '<div class="prices">' + makePrice(item.price, item.menuPrice) + '</div>' +
          '</div>' +
        '</div>';
    }
    html +=
      '<div class="slide" id="s' + sIdx + '">' +
        '<div class="cat-header">' +
          '<div class="cat-title">' + (slide.category || '') + '</div>' +
          '<div class="cat-line"></div>' +
        '</div>' +
        (slide.info ? '<div class="cat-info">' + slide.info + '</div>' : '') +
        '<div class="grid ' + cols + '">' + cardsHtml + '</div>' +
      '</div>';
  }
  return html;
}

/* ── Panneau fast-food (mode 'board') ─────────
   Répartit les catégories dans des colonnes de
   BOARD_MAX_COL "lignes" max, 3 colonnes par page.
   1 page = tout visible d'un coup, sans attendre. */
function boardPages(data) {
  /* 1 page statique — tout affiché d'un coup, aucune rotation */
  var t = Math.ceil(data.length / 3);
  return [[ data.slice(0, t), data.slice(t, 2 * t), data.slice(2 * t) ]];
}

/* Item circulaire : photo ronde + nom + prix */
function boardItemHtml(item, showImg) {
  var safeUrl = (item.url || '').replace(/'/g, '%27');
  var badge   = item.badge ? '<span class="bibadge">' + item.badge + '</span>' : '';
  var p       = item.price || '';
  var mp      = item.menuPrice || item.menu_price || '';
  var thumb   = showImg
    ? '<span class="biph"><img data-src="' + safeUrl + '" data-thumb="1" src="" alt="" decoding="async"></span>'
    : '<span class="biph biph-empty"></span>';
  var priceHtml = '<span class="bitem-price">';
  if (p) priceHtml += '<span class="bip">' + p + (/\d/.test(p) ? '<sup>€</sup>' : '') + '</span>';
  if (mp) priceHtml += '<span class="bipm">M ' + mp + '€</span>';
  priceHtml += '</span>';
  return (
    '<div class="bitem">' + thumb +
      '<span class="bitem-name">' + (item.title || '') + badge + '</span>' +
      priceHtml +
    '</div>'
  );
}

function boardCatHtml(cat) {
  var items = cat.items || [];
  var html  =
    '<div class="bcat">' +
      '<div class="bcat-head">' +
        '<span class="bcat-title">' + (cat.category || '') + '</span>' +
        '<span class="bcat-line"></span>' +
      '</div>' +
      (cat.info ? '<div class="bcat-info">' + cat.info + '</div>' : '');
  html += '<div class="bcat-items">';
  for (var k = 0; k < items.length; k++) {
    var it      = items[k];
    var showImg = !!it.url;
    html += boardItemHtml(it, showImg);
  }
  return html + '</div></div>';
}

var HERO_EXTRA_HTML =
  '<div class="bhero-extra">' +
    '<div class="bhero-xrow">' +
      '<span class="bhero-xtitle">Sauces</span>' +
      '<span class="bhero-xitems">Algérienne · Blanche · Samouraï · Harissa</span>' +
    '</div>' +
    '<div class="bhero-xrow">' +
      '<span class="bhero-xtitle">Boissons</span>' +
      '<span class="bhero-xitems">33CL 2,00€ · CAFÉ 1,50€ · THÉ 1,50€</span>' +
    '</div>' +
  '</div>';

function buildBoardHtml() {
  var pages  = boardPages(viewData);
  slideTotal = pages.length;
  var html = '';
  for (var p = 0; p < pages.length; p++) {
    var colsHtml = '';
    for (var c = 0; c < 3; c++) {
      var cats    = pages[p][c] || [];
      var catHtml = '';
      for (var k = 0; k < cats.length; k++) catHtml += boardCatHtml(cats[k]);
      colsHtml += '<div class="bcol">' + catHtml + '</div>';
    }
    html +=
      '<div class="slide board" id="s' + p + '">' +
        '<div class="bhero-band">' +
          '<div class="bhero-brand-corner">CHEZ RAMO</div>' +
          '<div class="bhero-inner"></div>' +
          HERO_EXTRA_HTML +
        '</div>' +
        '<div class="bmenu">' + colsHtml + '</div>' +
      '</div>';
  }
  return html;
}

/* ── Plat vedette « À LA UNE » : rotation 7 s ──
   Fait tourner tous les plats (avec photo) de la
   moitié de menu de CETTE TV, en très grand.     ── */
var HERO_DURATION = 7000;
var heroIdx   = 0;
var heroTimer = null;
var pubTimer  = null;
var pubColIdx = 0;
var PUB_COL_DUR = 5000; /* ms par slide */

/* Plats mis en avant dans la bannière — uniquement ceux avec une belle image */
var HERO_FEATURED = [
  'kebab', 'kebab geant', 'kebab-geant',
  'tacos', 'maxi tacos', 'maxi-tacos',
  'burger', 'chicken burger', 'cheese burger', 'fish burger'
];
var PUB_EXCLUDE = ['miche', 'assiette', 'assiete'];

function heroItems() {
  /* TV3 pub : utilise tout le menu, pas juste la moitié */
  var source = (TV_ID === 3) ? menuData : viewData;
  /* Collecte tous les plats avec photo */
  var all = [], seen = {};
  for (var s = 0; s < source.length; s++) {
    var items = source[s].items || [];
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      if (it.url && !seen[it.url]) {
        seen[it.url] = true;
        all.push(it);
      }
    }
  }
  /* Filtre sur les best-sellers */
  var featured = all.filter(function(it) {
    var key = (it.title || it.id || '').toLowerCase().trim();
    for (var e = 0; e < PUB_EXCLUDE.length; e++) {
      if (key.indexOf(PUB_EXCLUDE[e]) !== -1) return false;
    }
    for (var k = 0; k < HERO_FEATURED.length; k++) {
      if (key === HERO_FEATURED[k] || key.indexOf(HERO_FEATURED[k]) !== -1) return true;
    }
    return false;
  });
  /* Fallback : si rien ne matche (Supabase avec noms différents), on prend tout */
  return featured.length ? featured : all;
}

function heroRender() {
  if (TV_ID === 3) { pubRender(); return; }
  var inners = document.querySelectorAll('.bhero-inner');
  if (!inners.length) return;
  var items = heroItems();
  if (!items.length) return;
  heroIdx = heroIdx % items.length;
  var it         = items[heroIdx];
  var safeUrl    = (it.url || '').replace(/'/g, '%27');
  var mp         = it.menuPrice || it.menu_price || '';
  var pricesHtml = '';
  if (it.price) {
    pricesHtml +=
      '<div class="bhero-pcard">' +
        '<div class="bhero-pnum">' + it.price + (/\d/.test(it.price) ? '<sup>€</sup>' : '') + '</div>' +
        '<div class="bhero-plbl">SEUL</div>' +
      '</div>';
  }
  if (mp) {
    pricesHtml +=
      '<div class="bhero-pcard bhero-pcard-menu">' +
        '<div class="bhero-pnum">' + mp + '<sup>€</sup></div>' +
        '<div class="bhero-plbl">MENU</div>' +
      '</div>';
  }
  var html =
    '<div class="bhero-photo">' +
      '<img data-src="' + safeUrl + '" data-thumb="1" src="" alt="" decoding="async">' +
    '</div>' +
    '<div class="bhero-right">' +
      '<div class="bhero-name-row">' +
        '<div class="bhero-name">' + (it.title || '') + '</div>' +
        (pricesHtml ? '<div class="bhero-prices">' + pricesHtml + '</div>' : '') +
      '</div>' +
      (it.description ? '<div class="bhero-desc">' + it.description + '</div>' : '') +
    '</div>';
  for (var c = 0; c < inners.length; c++) {
    var inner = inners[c];
    inner.innerHTML = html;
    var img = inner.querySelector('img[data-src]');
    if (img) {
      var src = img.getAttribute('data-src');
      img.removeAttribute('data-src');
      if (TV_ID === 3) { loadImg(img, src); } else { loadThumb(img, src); }
    }
    inner.style.opacity = '1';
    inner.style.transform = 'translateX(0)';
  }
}

function pubStop() {
  if (pubTimer) { clearInterval(pubTimer); pubTimer = null; }
}

/* ── Images "dessin" pour TV3 pub ──────────────
   Clé = mot-clé dans le titre (lowercase).
   Ajoute ici les fichiers que tu télécharges dans uploads/.
   Ex: 'kebab': 'uploads/draw_kebab.png'              */
/* Ordre important : clés les plus longues/spécifiques en premier */
var PUB_DRAW_MAP = {
  'kebab frites':   'uploads/draw_kebab_frites.png',
  'kebab geant':    'uploads/draw_kebab_geant.png',
  'kebab-geant':    'uploads/draw_kebab_geant.png',
  'miche kebab':    'uploads/draw_miche_kebab.png',
  'miche-kebab':    'uploads/draw_miche_kebab.png',
  'miche':          'uploads/draw_miche_kebab.png',
  'maxi tacos':     'uploads/draw_maxi_tacos.png',
  'maxi-tacos':     'uploads/draw_maxi_tacos.png',
  'chicken burger': 'uploads/draw_chicken_burger.png',
  'cheese burger':  'uploads/draw_cheese_burger.png',
  'fish burger':    'uploads/draw_fish_burger.png',
  'tacos':          'uploads/draw_tacos.png',
  'kebab':          'uploads/draw_kebab.png',
  'burger':         'uploads/draw_cheese_burger.png'
};
function pubDrawUrl(title) {
  var t = (title || '').toLowerCase();
  var keys = Object.keys(PUB_DRAW_MAP);
  for (var i = 0; i < keys.length; i++) {
    if (t.indexOf(keys[i]) !== -1) return PUB_DRAW_MAP[keys[i]];
  }
  return null;
}

/* Unsplash HD backgrounds — licence Unsplash (gratuit, usage commercial autorisé) */
var PUB_BG_IDS = {
  kebab:     'UC0HZdUitWY',
  tacos:     '50KffXbjIOg',
  burger:    'jh5XyK4Rr3Y',
  americain: 'I7A_pHLcQK8',
  miche:     'sPmF7MNzdnU',
  sandwich:  'sPmF7MNzdnU',
  frites:    'ChXHveqrb28',
  galette:   'wYwbs_bsmaM',
  assiette:  'jhTzMj5aJQk',
  _default:  'Fo80DfhsJUk'
};
function pubBgUrl(title) {
  var t = (title || '').toLowerCase();
  var keys = ['kebab','tacos','burger','americain','miche','sandwich','frites','galette','assiette'];
  for (var i = 0; i < keys.length; i++) {
    if (t.indexOf(keys[i]) >= 0) {
      return 'https://images.unsplash.com/photo-' + PUB_BG_IDS[keys[i]] + '?w=1920&h=1080&fit=crop&q=82&fm=webp';
    }
  }
  return 'https://images.unsplash.com/photo-' + PUB_BG_IDS._default + '?w=1920&h=1080&fit=crop&q=82&fm=webp';
}

/* Génère le collage typographique en fond (style editorial) */
var PUB_EXTRAS = ['MAISON','ROYAL','SAVEUR','FRAIS','DORÉ','GRILLÉ','ÉPICÉ','GÉANT'];
function pubGhostHtml(title, idx) {
  var words = (title || '').replace(/[^A-Za-zÀ-ÿ0-9\s]/g,'').toUpperCase().split(/\s+/).filter(Boolean);
  var w0 = words[0] || 'CHEZ';
  var w1 = words.length > 1 ? words[1] : PUB_EXTRAS[idx % PUB_EXTRAS.length];
  var w2 = words.length > 2 ? words[2] : PUB_EXTRAS[(idx + 3) % PUB_EXTRAS.length];
  return (
    '<div class="pub-collage">' +
      '<span class="pub-ghost" style="font-size:20vw;top:-1%;left:-2%;-webkit-transform:rotate(-7deg);transform:rotate(-7deg)">' + w0 + '</span>' +
      '<span class="pub-ghost" style="font-size:6.5vw;top:35%;right:-0.5%;letter-spacing:0.45em;-webkit-transform:rotate(90deg);transform:rotate(90deg)">CHEZ RAMO</span>' +
      '<span class="pub-ghost pub-ghost-sm" style="font-size:9vw;top:70%;left:1%;-webkit-transform:rotate(5deg);transform:rotate(5deg)">' + w1 + '</span>' +
      '<span class="pub-ghost pub-ghost-sm" style="font-size:5.5vw;top:12%;left:5%;-webkit-transform:rotate(-3deg);transform:rotate(-3deg)">' + w2 + '</span>' +
      '<span class="pub-ghost-dots" style="top:51%;left:4%;-webkit-transform:rotate(-1deg);transform:rotate(-1deg)">· · · · · · · · · · · · · · ·</span>' +
    '</div>'
  );
}

/* Scanne les pixels non-transparents, positionne et taille dest
   pour que le food remplisse ~75 % de l'écran en un seul scale
   (width/height = meilleure interpolation que transform:scale). */
function normalizePubImg(src, dest) {
  try {
    var c = document.createElement('canvas');
    c.width = src.naturalWidth; c.height = src.naturalHeight;
    var ctx = c.getContext('2d');
    ctx.drawImage(src, 0, 0);
    var d = ctx.getImageData(0, 0, c.width, c.height).data;
    var minX = c.width, maxX = 0, minY = c.height, maxY = 0;
    for (var i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 15) {
        var px = (i >> 2) % c.width;
        var py = (i >> 2) / c.width | 0;
        if (px < minX) minX = px; if (px > maxX) maxX = px;
        if (py < minY) minY = py; if (py > maxY) maxY = py;
      }
    }
    if (maxX <= minX || maxY <= minY) {
      minX = 0; maxX = c.width - 1; minY = 0; maxY = c.height - 1;
    }
    var foodW  = maxX - minX + 1;
    var foodH  = maxY - minY + 1;
    var foodCX = (minX + maxX) / 2;
    var foodCY = (minY + maxY) / 2;
    var vw = window.innerWidth  || 1920;
    var vh = window.innerHeight || 1080;
    /* Scale unique : food ≈ 50 % de l'écran, capé à ×2 pour limiter la pixelisation */
    var target = Math.min(vh * 0.50, vw * 0.38);
    var scale  = Math.min(target / Math.max(foodW, foodH), 2);
    scale = Math.max(scale, 0.8);
    dest.style.width     = (c.width  * scale).toFixed(0) + 'px';
    dest.style.height    = (c.height * scale).toFixed(0) + 'px';
    dest.style.left      = (vw * 0.50 - foodCX * scale).toFixed(0) + 'px';
    dest.style.top       = (vh * 0.44 - foodCY * scale).toFixed(0) + 'px';
    dest.style.transform = 'none';
  } catch(e) {
    dest.style.width = 'auto'; dest.style.height = '75vh';
    dest.style.left = '50%';   dest.style.top    = '44%';
    dest.style.transform = 'translate(-50%,-50%)';
  }
}

function pubCycle() {
  var container = document.getElementById('pub-cols');
  if (!container) return;
  var slides = container.querySelectorAll('.pub-slide');
  var n = slides.length;
  if (!n) return;
  var idx = pubColIdx % n;
  for (var i = 0; i < n; i++) {
    slides[i].className = 'pub-slide' + (i === idx ? ' active' : '');
  }
  pubColIdx++;
}

function pubStart() {
  pubStop();
  pubColIdx = 0;
  pubCycle();
  pubTimer = setInterval(pubCycle, PUB_COL_DUR);
}

function pubRender() {
  var container = document.getElementById('pub-cols');
  if (!container) return;
  var items = heroItems();
  if (!items.length) return;

  /* Palette old B&W : encre noire + sépia foncé */
  var COLORS = ['#1C1308', '#2E1F0A', '#1C1308', '#2E1F0A', '#1C1308'];
  var n = Math.min(items.length, 8);

  /* expose la durée comme variable CSS pour la barre de progression */
  document.documentElement.style.setProperty('--pub-slide-dur', PUB_COL_DUR + 'ms');

  var html = '<div class="pub-slider">';
  for (var i = 0; i < n; i++) {
    var it       = items[i];
    var color    = COLORS[i % COLORS.length];
    var priceStr = it.price ? it.price + '€' : (it.menuPrice ? it.menuPrice + '€' : '');
    var descStr  = it.description || 'Savourez chaque bouchée — une explosion de saveurs authentiques !';
    var safeUrl  = (it.url || '').replace(/'/g, '%27');

    var dotsHtml = '';
    for (var j = 0; j < n; j++) {
      dotsHtml += '<span class="pub-dot' + (j === i ? ' active' : '') + '"></span>';
    }

    var bgUrl     = pubBgUrl(it.title);
    var ghostHtml = pubGhostHtml(it.title, i);
    var drawUrl   = pubDrawUrl(it.title);
    var imgSrc    = drawUrl ? drawUrl : safeUrl;
    var imgClass  = drawUrl ? 'pub-slide-img pub-slide-img--draw' : 'pub-slide-img pub-slide-img--photo';

    html +=
      '<div class="pub-slide' + (i === 0 ? ' active' : '') + '" style="--pub-accent:' + color + '">' +
        ghostHtml +
        '<div class="pub-accent-bar"></div>' +
        '<div class="pub-left">' +
          '<div class="pub-slide-tag">CHEZ RAMO</div>' +
          '<div class="pub-eyebrow">· NOTRE SPÉCIALITÉ ·</div>' +
          '<div class="pub-rule"><span class="pub-rule-inner"></span></div>' +
          '<div class="pub-title-clip"><div class="pub-slide-title">' + (it.title || '') + '</div></div>' +
          (priceStr ? '<div class="pub-slide-row"><div class="pub-slide-price"><span class="pub-price-val">' + priceStr + '</span></div></div>' : '') +
          (descStr ? '<div class="pub-slide-desc">' + descStr + '</div>' : '') +
          '<div class="pub-slide-dots">' + dotsHtml + '</div>' +
        '</div>' +
        '<div class="pub-right">' +
          '<img class="' + imgClass + '" src="" data-src="' + imgSrc + '" alt="" decoding="async">' +
        '</div>' +
        '<div class="pub-prog-wrap"><div class="pub-prog-bar"></div></div>' +
      '</div>';
  }
  html += '</div>';

  container.innerHTML = html;

  var imgs = container.querySelectorAll('img[data-src]');
  for (var k = 0; k < imgs.length; k++) {
    (function(imgEl) {
      var src = imgEl.getAttribute('data-src');
      imgEl.removeAttribute('data-src');
      if (!src) { imgEl.style.display = 'none'; return; }

      var cut  = cutUrl(src);
      detectWebp(function(webpOk) {
        var list = [];
        if (cut) {
          var wp = cut.replace(/\.png(\?.*)?$/i, '.webp');
          if (webpOk && wp !== cut) list.push(wp);
          list.push(cut);
        }
        list.push(src);

        function tryNext(idx) {
          if (idx >= list.length) return;
          var tmp = new Image();
          tmp.onload = function() {
            imgEl.src = tmp.src;
            var base = imgEl.className.replace(/\bloaded\b/g, '').trim();
            imgEl.className = base + ' loaded';
          };
          tmp.onerror = function() { tryNext(idx + 1); };
          tmp.src = list[idx];
        }
        tryNext(0);
      });
    })(imgs[k]);
  }
}

function heroStop() {
  if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
  pubStop();
}

function heroStart() {
  heroStop();
  if (MODE !== 'board') return;
  if (TV_ID === 3) { pubStart(); return; }
  heroTimer = setInterval(function() {
    heroIdx++;
    var inners = document.querySelectorAll('.bhero-inner');
    for (var c = 0; c < inners.length; c++) {
      inners[c].style.opacity = '0';
      inners[c].style.transform = 'translateX(-3vw)';
    }
    setTimeout(function() {
      var ins = document.querySelectorAll('.bhero-inner');
      for (var c2 = 0; c2 < ins.length; c2++) ins[c2].style.transform = 'translateX(3vw)';
      heroRender();
    }, 500);
  }, HERO_DURATION);
}

/* ── Chargement lazy des images du slide ──────── */
function loadSlideImages(idx) {
  if (loadedSlides[idx]) return;
  loadedSlides[idx] = true;
  var el = document.getElementById('s' + idx);
  if (!el) return;
  var imgs = el.querySelectorAll('img[data-src]');
  for (var i = 0; i < imgs.length; i++) {
    (function(img) {
      var src = img.getAttribute('data-src');
      if (!src) { img.style.display = 'none'; return; }
      img.removeAttribute('data-src');
      if (img.getAttribute('data-thumb')) loadThumb(img, src);
      else loadImg(img, src);
    })(imgs[i]);
  }
}

/* ── Affichage d'un slide / d'une page ──────── */
function activeDuration() {
  return (MODE === 'board') ? BOARD_DURATION : SLIDE_DURATION;
}

function showSlide(idx) {
  if (idx >= slideTotal) idx = current = 0;
  var slides = document.querySelectorAll('.slide');
  var isBoard = (MODE === 'board');
  var isPub   = isBoard && TV_ID === 3;
  for (var i = 0; i < slides.length; i++) {
    slides[i].className = isBoard ? (isPub ? 'slide board pub' : 'slide board') : 'slide';
  }
  var el = document.getElementById('s' + idx);
  if (el) el.className = isBoard ? (isPub ? 'slide board pub active' : 'slide board active') : 'slide active';

  loadSlideImages(idx);
  var nextIdx = (idx + 1) % slideTotal;
  setTimeout(function() { loadSlideImages(nextIdx); }, 1200);

  if (slideTotal < 2) return; /* page unique : pas de barre de progression */
  progressBar.style.cssText =
    'width:0%;height:100%;background:#e01010;-webkit-transition:none;transition:none;';
  void progressBar.offsetWidth;
  progressBar.style.cssText =
    'width:100%;height:100%;background:#e01010;' +
    '-webkit-transition:width ' + activeDuration() + 'ms linear;' +
    'transition:width ' + activeDuration() + 'ms linear;';
}

/* ── Défilement automatique ─────────────────── */
function startAuto() {
  if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  if (slideTotal < 2) return; /* panneau statique : rien à faire tourner */
  autoTimer = setInterval(function() {
    /* Reload code en attente : profite de la transition de slide (invisible) */
    if (pendingCodeReload) {
      pendingCodeReload = false;
      setTimeout(function() { location.reload(true); }, 300);
      return;
    }
    current = (current + 1) % slideTotal;
    showSlide(current);
  }, activeDuration());
}

function navigate(dir) {
  if (slideTotal < 2) return;
  current = (current + dir + slideTotal) % slideTotal;
  showSlide(current);
  startAuto();
}

/* ── Application d'un rôle TV ───────────────── */
function applyRole(n, label) {
  TV_ID    = n;
  viewData = slidesForTv(menuData);
  current  = 0;
  _roleFetched = true;
  if (_loaderDone || !_loaderEl) {
    /* Loader déjà parti : re-render visible (changement de rôle en cours d'utilisation) */
    render(); showSlide(0); startAuto();
    if (label) showNetStatus(label, '#1c3e7c', 5000);
  } else {
    /* Loader encore présent : déclencher la sortie du loader */
    if (label) showNetStatus(label, '#1c3e7c', 5000);
    _tryHideLoader();
  }
}

/* Choix manuel : touches 1 / 2 / 0 */
function setTv(n) {
  TV_MANUAL = n;
  try { localStorage.setItem('ramo_tv', String(n)); } catch (e) {}
  applyRole(n,
    n === 0 ? 'TV UNIQUE — MENU COMPLET'
            : 'TV ' + n + ' — MANUEL — ' + slidesForTv(menuData).length + ' CATÉGORIES');
}

/* Retour au mode auto : touche 5 */
function setTvAuto() {
  TV_MANUAL = null;
  try { localStorage.removeItem('ramo_tv'); } catch (e) {}
  applyRole(0, 'MODE AUTO — DÉTECTION DES TV…');
  tvClaim();
}

/* ── Détection auto via Supabase (table tv_roles) ──
   refresh : je garde le rôle que je possède déjà
   take    : je prends un rôle libre (heartbeat > 2 min)
   Filtres SQL dans l'URL = opérations atomiques,
   pas de conflit possible entre les deux TV.       ── */
var CLAIM_STALE = 120000;

function tvPatch(filter, body, cb) {
  fetch(SUPABASE_URL + '/rest/v1/tv_roles?' + filter, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  }).then(function(r) { return r.ok ? r.json() : []; })
    .then(function(rows) { cb(rows && rows.length > 0); })
    .catch(function() { cb(false); });
}

function tvClaim() {
  if (TV_MANUAL !== null) return;
  if (typeof fetch === 'undefined' || netQuality === 'offline') return;
  var now = Date.now();
  var me  = encodeURIComponent(DEVICE_ID);

  function got(role) {
    try { localStorage.setItem('ramo_tv_auto', String(role)); } catch(e) {}
    if (TV_ID !== role) applyRole(role, 'TV ' + role + ' — DÉTECTION AUTO');
  }
  function take(role, next) {
    tvPatch('role=eq.' + role + '&last_seen=lt.' + (now - CLAIM_STALE),
      { device_id: DEVICE_ID, last_seen: now },
      function(ok) { if (ok) got(role); else next(); });
  }
  function refresh(role, next) {
    tvPatch('role=eq.' + role + '&device_id=eq.' + me,
      { last_seen: now },
      function(ok) { if (ok) got(role); else next(); });
  }
  refresh(1, function() {
    refresh(2, function() {
      refresh(3, function() {
        take(1, function() {
          take(2, function() {
            take(3, function() {
              if (TV_ID !== 0) applyRole(0, 'TV UNIQUE — MENU COMPLET');
            });
          });
        });
      });
    });
  });
}

/* ── Bascule panneau / diaporama (touche 3) ──── */
function setMode(m) {
  MODE = m;
  try { localStorage.setItem('ramo_mode', m); } catch (e) {}
  current = 0;
  render();
  showSlide(0);
  startAuto();
  showNetStatus(
    m === 'board' ? 'MODE PANNEAU — TOUT LE MENU' : 'MODE DIAPORAMA PHOTO',
    '#1c3e7c', 5000
  );
}

/* ── Télécommande + clic ────────────────────── */
document.addEventListener('keydown', function(e) {
  var key = e.key || e.keyCode;
  var isNext = (key === 'ArrowRight' || key === 39 || key === 'Enter' || key === 13 ||
                key === 'Return'     || key === 'MediaFastForward' || key === 'XF86FastForward');
  var isPrev = (key === 'ArrowLeft'  || key === 37 ||
                key === 'MediaRewind' || key === 'XF86Rewind');
  if (isNext) { if (e.preventDefault) e.preventDefault(); navigate(1); }
  else if (isPrev) { if (e.preventDefault) e.preventDefault(); navigate(-1); }
  /* Touches chiffres : assigne le rôle de la TV (mémorisé) */
  else if (key === '1' || key === 49) { setTv(1); }
  else if (key === '2' || key === 50) { setTv(2); }
  else if (key === '0' || key === 48) { setTv(0); }
  /* Touche 3 : bascule panneau ↔ diaporama (mémorisé) */
  else if (key === '3' || key === 51) { setMode(MODE === 'board' ? 'diapo' : 'board'); }
  /* Touche 5 : retour à la détection auto des rôles TV */
  else if (key === '5' || key === 53) { setTvAuto(); }
  /* Touche 9 / U : prévisualiser l'animation de mise à jour (test local) */
  else if (key === '9' || key === 57 || (e.code && e.code === 'Digit9') || key === 'u' || key === 'U') { showUpdateOverlay('TEST'); }
});
document.addEventListener('click', function() { navigate(1); });

/* ── Chargement depuis Supabase ─────────────── */
var fetchRetryTimer = null;

function fetchMenu() {
  if (typeof fetch === 'undefined') return;
  if (netQuality === 'offline') return; /* Inutile si hors ligne */
  clearTimeout(fetchRetryTimer);
  fetch(SUPABASE_URL + '/rest/v1/menu_items?order=sort_order', {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': 'Bearer ' + SUPABASE_KEY }
  }).then(function(res) {
    if (!res.ok) return null;
    return res.json();
  }).then(function(rows) {
    if (!rows || !rows.length) return;
    var cats    = {};
    var catInfo = {};
    for (var k = 0; k < defaultMenu.length; k++) {
      catInfo[defaultMenu[k].category] = defaultMenu[k].info || '';
    }
    /* Catégories à masquer du board (affichées ailleurs : bannière, etc.) */
    var HIDDEN_CATS = ['Boissons & Boissons Chaudes', 'Boissons', 'Grillades'];
    /* Items supprimés du menu local mais encore présents dans Supabase
       Clés et valeurs normalisées (sans accents, sans casse) pour matcher Supabase */
    var HIDDEN_ITEMS_NORM = {};
    (function() {
      var raw = {
        'Assiettes & Salade': ['Salade du Berger'],
        'Salades Fraiches':   ['Salade de Poulet'],
        'Salades & Burek':    ['Salade de Boeuf'],
        'Menu Enfants':       ['Menu Nuggets', 'Menu Escalope', 'Menu Cheese']
      };
      Object.keys(raw).forEach(function(cat) {
        HIDDEN_ITEMS_NORM[normCat(cat)] = raw[cat].map(normCat);
      });
    })();
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      if (HIDDEN_CATS.indexOf(row.category) !== -1) continue;
      var hiddenInCat = HIDDEN_ITEMS_NORM[normCat(row.category)];
      if (hiddenInCat && hiddenInCat.indexOf(normCat(row.title)) !== -1) continue;
      if (!cats[row.category]) {
        cats[row.category] = { category: row.category, info: catInfo[row.category] || '', items: [] };
      }
      if (row.desc !== undefined && row.description === undefined) row.description = row.desc;
      if (row.menu_price !== undefined && row.menuPrice === undefined) row.menuPrice = row.menu_price;
      cats[row.category].items.push(row);
    }
    var fresh = Object.values(cats);
    if (!fresh.length) return;
    /* Réordonne selon defaultMenu (comparaison sans accents) */
    var catOrder = {};
    for (var oi = 0; oi < defaultMenu.length; oi++) catOrder[normCat(defaultMenu[oi].category)] = oi;
    /* Fallback : catégories dans defaultMenu mais absentes de Supabase (ex: Grillades)
       → injectées depuis les données locales pour ne jamais disparaître */
    var freshNorm = {};
    for (var fi = 0; fi < fresh.length; fi++) freshNorm[normCat(fresh[fi].category)] = true;
    for (var di = 0; di < defaultMenu.length; di++) {
      var defCat  = defaultMenu[di];
      var normKey = normCat(defCat.category);
      if (!freshNorm[normKey]) {
        /* Catégorie absente de Supabase → injecter depuis local */
        fresh.push(JSON.parse(JSON.stringify(defCat)));
      } else {
        /* Catégorie présente → compléter les items manquants */
        for (var fj = 0; fj < fresh.length; fj++) {
          if (normCat(fresh[fj].category) !== normKey) continue;
          var sbTitles = {};
          for (var si = 0; si < fresh[fj].items.length; si++) {
            sbTitles[normCat(fresh[fj].items[si].title)] = true;
          }
          for (var dj = 0; dj < defCat.items.length; dj++) {
            if (!sbTitles[normCat(defCat.items[dj].title)]) {
              fresh[fj].items.push(JSON.parse(JSON.stringify(defCat.items[dj])));
            }
          }
          break;
        }
      }
    }
    fresh.sort(function(a, b) {
      var ai = catOrder[normCat(a.category)]; if (ai === undefined) ai = 999;
      var bi = catOrder[normCat(b.category)]; if (bi === undefined) bi = 999;
      return ai - bi;
    });
    var freshJson = JSON.stringify(fresh);
    menuData = fresh; /* toujours mettre à jour menuData */
    _menuFetched = true;
    _tryHideLoader(); /* cache le loader si rôle aussi prêt */
    /* Re-render visible uniquement si le loader est parti ET le contenu a changé */
    if (freshJson === lastMenuJson) return;
    lastMenuJson = freshJson;
    if (!_loaderDone) return; /* loader encore visible : pas besoin de re-render, _tryHideLoader le fait */
    var newView = slidesForTv(menuData);
    if (JSON.stringify(newView) === JSON.stringify(viewData)) return;
    viewData = newView;
    if (current >= viewData.length) current = 0;
    render();
    showSlide(current);
    startAuto();
    setTimeout(function() { precacheAllImages(fresh); }, 2500);
  }).catch(function() {
    fetchRetryTimer = setTimeout(fetchMenu, 30000);
  });
}

/* ── Détection de mise à jour (silencieuse) ─── */
var deployVersion    = null;
var pendingCodeReload = false;

/* Petit toast discret coin haut-droite (non-bloquant) */
function showToast(msg) {
  var t = document.createElement('div');
  t.style.cssText = 'position:fixed;top:1vw;right:1.2vw;background:rgba(0,0,0,0.78);color:#fff;' +
    'font-family:\'Bebas Neue\',Impact,sans-serif;font-size:1.1vw;letter-spacing:0.12vw;' +
    'padding:0.5vw 1.1vw;border-radius:0.4vw;border-left:3px solid #e01010;' +
    'z-index:9999;opacity:0;-webkit-transition:opacity 0.35s;transition:opacity 0.35s;pointer-events:none;';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(function() { t.style.opacity = '1'; }, 60);
  setTimeout(function() {
    t.style.opacity = '0';
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 500);
  }, 4000);
}

/* Mise à jour silencieuse : données + SW, reload au prochain changement de slide */
function silentUpdate(newVersion) {
  deployVersion = newVersion;
  fetchMenu();
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage('SKIP_WAITING');
  }
  pendingCodeReload = true;
  showToast('MISE À JOUR ✓');
  /* En mode panneau statique (1 seule page), le timer de slide ne tourne pas :
     le pendingCodeReload ne serait jamais vérifié → forcer le reload directement */
  if (slideTotal < 2) {
    setTimeout(function() { location.reload(true); }, 3000);
  }
}

/* Overlay test uniquement (touche 9 / U) */
function showUpdateOverlay(version) {
  var o = document.createElement('div');
  o.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.92);z-index:99999;' +
    'display:-webkit-flex;display:flex;-webkit-flex-direction:column;flex-direction:column;' +
    '-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center;' +
    'opacity:0;-webkit-transition:opacity 0.5s ease;transition:opacity 0.5s ease;';
  o.innerHTML =
    '<div style="font-family:\'Bebas Neue\',Impact,sans-serif;font-size:3vw;color:#fff;letter-spacing:0.3vw;">TEST MISE À JOUR</div>' +
    '<div style="font-family:\'Bebas Neue\',Impact,sans-serif;font-size:1.5vw;color:#e01010;margin-top:0.5vw;">VERSION ' + version + '</div>';
  document.body.appendChild(o);
  setTimeout(function() { o.style.opacity = '1'; }, 60);
  setTimeout(function() {
    o.style.opacity = '0';
    setTimeout(function() { if (o.parentNode) o.parentNode.removeChild(o); }, 600);
  }, 3000);
}

function checkVersion() {
  if (typeof fetch === 'undefined') return;
  if (netQuality === 'offline') return;
  fetch('version.json?t=' + Date.now(), { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(data) {
      if (!data || !data.v) return;
      if (deployVersion === null) { deployVersion = data.v; return; }
      if (data.v !== deployVersion) { silentUpdate(data.v); }
    })
    .catch(function() {});
}

/* ── Reload d'urgence toutes les 4h (TV browser) ─ */
setTimeout(function() { location.reload(true); }, 4 * 60 * 60 * 1000);

/* ── Horloge ────────────────────────────────── */
function tick() {
  var n  = new Date();
  var el = document.getElementById('clock');
  if (el) {
    el.textContent =
      String(n.getHours()).padStart(2, '0') + ':' +
      String(n.getMinutes()).padStart(2, '0');
  }
}
setInterval(tick, 1000);
tick();

/* ══════════════════════════════════════════════
   DÉMARRAGE
   ══════════════════════════════════════════════ */

/* ── Loader : masque l'affichage jusqu'à ce que Supabase soit prêt ── */
var _loaderEl    = null;
var _loaderDone  = false;
var _loaderAt    = Date.now();
var _menuFetched = false;
var _roleFetched = (TV_ID > 0); /* vrai si rôle déjà connu depuis le cache */

function _tryHideLoader() {
  if (_loaderDone || !_menuFetched || !_roleFetched) return;
  _loaderDone = true;
  render(); showSlide(0); startAuto();
  var wait = Math.max(0, 700 - (Date.now() - _loaderAt));
  setTimeout(function() {
    if (!_loaderEl) return;
    _loaderEl.classList.add('tvl-out');
    setTimeout(function() {
      if (_loaderEl && _loaderEl.parentNode) _loaderEl.parentNode.removeChild(_loaderEl);
      _loaderEl = null;
    }, 550);
  }, wait);
}

if (TV_ID !== 3) {
  _loaderEl = document.createElement('div');
  _loaderEl.id = 'tv-loader';
  _loaderEl.innerHTML =
    '<div class="tvl-inner">' +
      '<div class="tvl-brand">CHEZ <span>RAMO</span></div>' +
      '<div class="tvl-dots">' +
        '<div class="tvl-dot"></div>' +
        '<div class="tvl-dot"></div>' +
        '<div class="tvl-dot"></div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(_loaderEl);
  /* Sécurité : affiche quand même après 5s si Supabase ne répond pas */
  setTimeout(function() {
    _menuFetched = true; _roleFetched = true; _tryHideLoader();
  }, 5000);
} else {
  /* TV3 diapo : pas de loader, rendu immédiat */
  render(); showSlide(0); startAuto();
}

/* 1. Adaptation réseau */
applyNetQuality(getNetQuality());
if (!navigator.onLine) {
  showNetStatus('HORS LIGNE — Menu en cache', '#333333', 0);
  _menuFetched = true; _tryHideLoader();
}

/* 2. Détection TV immédiate */
tvClaim();

/* 3. Fetch Supabase immédiatement (plus de délai 2s) */
fetchMenu();
setInterval(fetchMenu, 30000);
var vOff = TV_ID > 0 ? (TV_ID - 1) * 20000 : Math.floor(Math.random() * 15000);
setTimeout(function() {
  checkVersion();
  setInterval(checkVersion, 55000 + Math.floor(Math.random() * 10000));
}, vOff);
setInterval(tvClaim, 45000);

/* 4. Pre-cache images en arrière-plan */
setTimeout(function() { precacheAllImages(menuData); }, 6000);
