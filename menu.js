/* ═══════════════════════════════════════════════
   CHEZ RAMO — Logique menu TV  |  menu.js
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
var SLIDE_DURATION = 10000;
var loadedSlides   = {};

/* ── WebP : essaie .webp, retombe sur l'original ── */
var webpSupported  = null;

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

/* ── Chargement d'image avec fallback WebP ───── */
function loadImg(img, src) {
  if (!src) { img.style.display = 'none'; return; }
  detectWebp(function(ok) {
    var primary  = ok ? toWebp(src) : src;
    var fallback = src;
    var tmp = new Image();
    tmp.onload = function() { img.src = primary; img.className = 'loaded'; };
    tmp.onerror = function() {
      if (primary !== fallback) {
        var tmp2 = new Image();
        tmp2.onload  = function() { img.src = fallback; img.className = 'loaded'; };
        tmp2.onerror = function() { img.style.display = 'none'; };
        tmp2.src = fallback;
      } else {
        img.style.display = 'none';
      }
    };
    tmp.src = primary;
  });
}

/* ── Menu par défaut ────────────────────────── */
var defaultMenu = [
  { category: "Sandwichs Vedettes", info: "Veau 100% Maison | Pain Artisanal", items: [
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
    { title: "Assiette Emporter",description: "Format pratique (Mixte: 18,00€)",   price: "15,00", url: "uploads/Assiette Emporter.png" },
    { title: "Salade du Berger", description: "Crudités, feta et olives",          price: "10,00", url: "uploads/Salade du Berger.png" }
  ]},
  { category: "Burgers", info: "Menu : +3,00 Euro (Frites + Boisson)", items: [
    { title: "Chicken Burger",description: "Poulet croustillant et cheddar",   price: "6,00", menuPrice: "9,00", url: "uploads/Chicken Burger.png" },
    { title: "Cheese Burger", description: "Steak haché et fromage fondu",     price: "6,00", menuPrice: "9,00", url: "uploads/Cheese Burger.png" },
    { title: "Fish Burger",   description: "Poisson pané et sauce tartare",    price: "6,00", menuPrice: "9,00", url: "uploads/Fish Burger.png" }
  ]},
  { category: "Finger Food", info: "Nos petites faims croustillantes", items: [
    { title: "Nuggets (x7)",description: "Filets de poulet frits dorés",   price: "8,50", url: "uploads/Nuggets (x7).png" },
    { title: "Wings (x4)",  description: "Ailerons de poulet épicés",      price: "7,50", url: "uploads/Wings (x8).png" },
    { title: "Tenders (x4)",description: "Aiguillettes de poulet tendres", price: "7,50", url: "uploads/Tenders (x4).png" }
  ]},
  { category: "Accompagnements & Sauces", info: "Pour compléter votre repas", items: [
    { title: "Frites",          description: "Petite: 2,00€ | Grande: 3,00€",     price: "2,00",   url: "uploads/Frites.png" },
    { title: "Barquette Viande",description: "Portion de veau 100% maison",       price: "10,00",  url: "uploads/Barquette.png" },
    { title: "Nos Sauces",      description: "Algérienne, Blanche, Samouraï... Incluse avec votre sandwich ou menu", price: "", menuPrice: "0,50", badge: "AU CHOIX", url: "uploads/Nos Sauces.png" }
  ]},
  { category: "Salades Fraiches", info: "Préparées avec des produits frais", items: [
    { title: "Salade Grecque",   description: "Tomates, concombres, olives, feta, oignons", price: "6,00",  url: "uploads/Salade_Grecque.png" },
    { title: "Salade Shope",     description: "Saladerie fraîche maison",                   price: "6,00",  url: "uploads/Salade_Shope.png" },
    { title: "Salade de Poulet", description: "Poulet grillé, frites et crudités",          price: "12,00", url: "uploads/Salade_de_Poulet.png" }
  ]},
  { category: "Salades & Burek", info: "Spécialités maison", items: [
    { title: "Salade de Boeuf",description: "Viande de boeuf, frites et crudités",  price: "13,00", url: "uploads/Salade_de_Boeuf.png" },
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
  { category: "Grillades", info: "Plateau : agneau, escalope, entrecôte, suxhuk, salade grecque, frites", items: [
    { title: "Grillade 2 pers.", description: "Plateau complet pour 2 personnes", price: "39,00", badge: "2 PERS", url: "uploads/Menu_Grillade.png" },
    { title: "Grillade 4 pers.", description: "Plateau complet pour 4 personnes", price: "79,00", badge: "4 PERS", url: "uploads/Menu_Grillade.png" },
    { title: "Grillade 6 pers.", description: "Plateau complet pour 6 personnes", price: "99,00", badge: "6 PERS", url: "uploads/Menu_Grillade.png" }
  ]},
  { category: "Desserts", info: "Douceurs maison", items: [
    { title: "Trilece",  description: "Dessert traditionnel au lait", price: "3,50", url: "uploads/Trilece.png" },
    { title: "Tiramisu", description: "Tiramisu maison",              price: "3,50", url: "uploads/Tiramisu.png" }
  ]}
];

/* ── État global ────────────────────────────── */
var menuData    = JSON.parse(JSON.stringify(defaultMenu));
var current     = 0;
var autoTimer   = null;
var progressBar = document.getElementById('progress-bar');

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
function render() {
  var vp   = document.getElementById('viewport');
  var html = '';

  for (var sIdx = 0; sIdx < menuData.length; sIdx++) {
    var slide     = menuData[sIdx];
    var cols      = slide.items.length <= 2 ? 'cols-2' : '';
    var cardsHtml = '';

    for (var i = 0; i < slide.items.length; i++) {
      var item     = slide.items[i];
      var safeUrl  = (item.url || '').replace(/'/g, '%27');
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

  vp.innerHTML = html;
  loadedSlides = {};
}

/* ── Chargement lazy des images ─────────────── */
function loadSlideImages(idx) {
  if (loadedSlides[idx]) return;
  loadedSlides[idx] = true;
  var el = document.getElementById('s' + idx);
  if (!el) return;
  var imgs = el.querySelectorAll('img[data-src]');
  for (var i = 0; i < imgs.length; i++) {
    (function(img) {
      var src = img.getAttribute('data-src');
      if (!src) return;
      img.removeAttribute('data-src');
      loadImg(img, src);
    })(imgs[i]);
  }
}

/* ── Affichage d'un slide ───────────────────── */
function showSlide(idx) {
  var slides = document.querySelectorAll('.slide');
  for (var i = 0; i < slides.length; i++) slides[i].className = 'slide';
  var el = document.getElementById('s' + idx);
  if (el) el.className = 'slide active';

  loadSlideImages(idx);
  /* Précharge le slide suivant après 1,5s */
  var nextIdx = (idx + 1) % menuData.length;
  setTimeout(function() { loadSlideImages(nextIdx); }, 1500);

  /* Barre de progression */
  progressBar.style.cssText =
    'width:0%;height:100%;background:#e01010;-webkit-transition:none;transition:none;';
  void progressBar.offsetWidth;
  progressBar.style.cssText =
    'width:100%;height:100%;background:#e01010;' +
    '-webkit-transition:width ' + SLIDE_DURATION + 'ms linear;' +
    'transition:width ' + SLIDE_DURATION + 'ms linear;';
}

/* ── Défilement automatique ─────────────────── */
function startAuto() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = setInterval(function() {
    current = (current + 1) % menuData.length;
    showSlide(current);
  }, SLIDE_DURATION);
}

function navigate(dir) {
  current = (current + dir + menuData.length) % menuData.length;
  showSlide(current);
  startAuto();
}

/* ── Télécommande + clic ────────────────────── */
document.addEventListener('keydown', function(e) {
  var key    = e.key || e.keyCode;
  var isNext = (key === 'ArrowRight' || key === 39 || key === 'Enter' || key === 13 ||
                key === 'Return'     || key === 'MediaFastForward' || key === 'XF86FastForward');
  var isPrev = (key === 'ArrowLeft'  || key === 37 ||
                key === 'MediaRewind' || key === 'XF86Rewind');
  if (isNext) { if (e.preventDefault) e.preventDefault(); navigate(1); }
  else if (isPrev) { if (e.preventDefault) e.preventDefault(); navigate(-1); }
});
document.addEventListener('click', function() { navigate(1); });

/* ── Chargement depuis Supabase (avec retry) ── */
var fetchRetryTimer = null;

function fetchMenu() {
  if (typeof fetch === 'undefined') return;
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
    for (var r = 0; r < rows.length; r++) {
      var row = rows[r];
      if (!cats[row.category]) {
        cats[row.category] = { category: row.category, info: catInfo[row.category] || '', items: [] };
      }
      if (row.desc !== undefined && row.description === undefined) row.description = row.desc;
      cats[row.category].items.push(row);
    }
    var fresh = Object.values(cats);
    if (fresh.length) {
      menuData = fresh;
      render();
      showSlide(current);
      startAuto();
    }
  }).catch(function() {
    /* Retry dans 30s si réseau indisponible */
    fetchRetryTimer = setTimeout(fetchMenu, 30000);
  });
}

/* ── Détection de mise à jour (auto-refresh TV) ─
   Interroge version.json toutes les 60s.
   Si la version change → rechargement automatique. */
var deployVersion = null;

function checkVersion() {
  if (typeof fetch === 'undefined') return;
  fetch('version.json?t=' + Date.now(), { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(data) {
      if (!data || !data.v) return;
      if (deployVersion === null) { deployVersion = data.v; return; }
      if (data.v !== deployVersion) {
        /* Nouvelle version déployée → rechargement propre */
        location.reload(true);
      }
    })
    .catch(function() {});
}

/* ── Récupération d'urgence : reload après 4h ─
   Évite que le navigateur TV reste bloqué sur une
   session corrompue sans jamais se récupérer.     */
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

/* ── Démarrage ──────────────────────────────── */
render();
showSlide(0);
startAuto();
setTimeout(function() {
  fetchMenu();
  setInterval(fetchMenu, 30000);
  checkVersion();
  setInterval(checkVersion, 60000);
}, 2000);
