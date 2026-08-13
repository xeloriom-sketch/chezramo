/* ═══════════════════════════════════════════════════════════
   CHEZ RAMO — Admin Panel  |  admin.js  v2.0
   Correctifs : mapping desc↔description, menuPrice↔menu_price,
   nettoyage payload null, retry, logs d'erreur détaillés.
   ═══════════════════════════════════════════════════════════ */

/* ── Configuration Supabase ─────────────────────────────── */
var SUPABASE_URL = 'https://hqfewokpvjmxezhnurbm.supabase.co';
var SUPABASE_KEY = 'sb_publishable_NmIfxaQb5ncapzCtzI5uNQ_tHdCwAyc';
var TABLE        = 'menu_items';

/* ── Mapping champs JS ↔ colonnes Supabase ──────────────────
   Le tableau Supabase utilise "description" et "menu_price".
   En interne on garde les clés courtes (desc, menuPrice).
   toDb()  : convertit avant envoi vers Supabase
   fromDb(): convertit à la réception depuis Supabase
   ─────────────────────────────────────────────────────────── */
function toDb(obj) {
  var out = {};
  Object.keys(obj).forEach(function(k) {
    var v = obj[k];
    var val = (v === '' || v === undefined) ? null : v;
    if      (k === 'desc')      out['description'] = val;
    else if (k === 'menuPrice') out['menu_price']  = val;
    else                        out[k]             = val;
  });
  return out;
}

function fromDb(r) {
  return {
    id:         r.id          || '',
    category:   r.category    || '',
    title:      r.title       || '',
    desc:       r.description || r.desc || '',
    price:      r.price       || '',
    menuPrice:  r.menu_price  || r.menuPrice || '',
    badge:      r.badge       || '',
    url:        r.url         || '',
    sort_order: r.sort_order  || 0
  };
}

/* ── Données par défaut (fallback si Supabase indisponible) ─ */
var defaultMenu = [
  {
    category: 'Sandwichs Vedettes',
    items: [
      { id:'kebab',        title:'Kebab',        desc:'Pain rond, veau maison, crudités',         price:'9,00',  menuPrice:'12,00', badge:null,    url:'/uploads/Kebab.png',           sort_order:1  },
      { id:'kebab-frites', title:'Kebab Frites', desc:'Viande et frites servis dans le pain',     price:'9,50',  menuPrice:null,    badge:null,    url:'/uploads/Kebab Frites.png',    sort_order:2  },
      { id:'kebab-geant',  title:'Kebab Géant',  desc:'Double portion de viande de veau',         price:'15,00', menuPrice:'17,00', badge:'XXL',   url:'/uploads/Kebab Geant.png',     sort_order:3  }
    ]
  },
  {
    category: 'Nos Specialites',
    items: [
      { id:'kofte',     title:'Kofte',     desc:'Boulettes de viande hachée épicées', price:'9,00', menuPrice:'12,00', badge:null, url:'/uploads/Americain.png', sort_order:10 },
      { id:'americain', title:'Américain', desc:'Steak haché et cheddar fondu',       price:'9,00', menuPrice:'12,00', badge:null, url:'/uploads/Kofte.png',     sort_order:11 },
      { id:'escalope',  title:'Escalope',  desc:'Filet de poulet pané maison',        price:'9,00', menuPrice:'12,00', badge:null, url:'/uploads/Escalope.png',  sort_order:12 }
    ]
  },
  {
    category: 'Tradition & Galettes',
    items: [
      { id:'miche-kebab', title:'Miche Kebab', desc:'Pain miche traditionnel croustillant', price:'9,00', menuPrice:'12,00', badge:null, url:'/uploads/Miche Kebab.png', sort_order:20 },
      { id:'galette',     title:'Galette',     desc:'Dürum : fine galette roulée',          price:'9,00', menuPrice:'12,00', badge:null, url:'/uploads/Galette.png',     sort_order:21 },
      { id:'cordon-bleu', title:'Cordon Bleu', desc:'Sandwich au cordon bleu fondant',      price:'9,00', menuPrice:'12,00', badge:null, url:'/uploads/Cordon Bleu.png', sort_order:22 }
    ]
  },
  {
    category: 'Tacos',
    items: [
      { id:'tacos',      title:'Tacos',      desc:'Sauce fromagère et frites incluses', price:'10,00', menuPrice:'13,00', badge:null,   url:'/uploads/Tacos.png',      sort_order:30 },
      { id:'maxi-tacos', title:'Maxi Tacos', desc:'Format géant avec 2 viandes',        price:'15,00', menuPrice:'17,00', badge:'MAXI', url:'/uploads/Maxi Tacos.png', sort_order:31 }
    ]
  },
  {
    category: 'Assiettes Gourmet',
    items: [
      { id:'assiette-kebab',    title:'Assiette Kebab',    desc:"Veau maison servi à l'assiette", price:'15,00', menuPrice:null, badge:null, url:'/uploads/Assiette Kebab.png',    sort_order:40 },
      { id:'assiette-escalope', title:'Assiette Escalope', desc:'Poulet pané ou grillé',           price:'15,00', menuPrice:null, badge:null, url:'/uploads/Assiette Escalope.png', sort_order:41 },
      { id:'assiette-kofte',    title:'Assiette Kofte',    desc:'Boulettes maison grillées',       price:'15,00', menuPrice:null, badge:null, url:'/uploads/Assiette Kofte.png',    sort_order:42 }
    ]
  },
  {
    category: 'Assiettes Gourmet (Suite)',
    items: [
      { id:'assiette-steak',  title:'Assiette Steak',       desc:'Steaks hachés grillés minute',  price:'15,00', menuPrice:null, badge:null,    url:'/uploads/Assiette Steak.png',      sort_order:50 },
      { id:'assiette-cordon', title:'Assiette Cordon Bleu', desc:'Deux cordons bleus fondants',   price:'15,00', menuPrice:null, badge:null,    url:'/uploads/Assiette Cordon Bleu.png',sort_order:51 },
      { id:'assiette-mixte',  title:'Assiette Mixte',       desc:'Kebab + 2 viandes au choix',    price:'18,00', menuPrice:null, badge:'MIXTE', url:'/uploads/Assiette Mixte.png',      sort_order:52 }
    ]
  },
  {
    category: 'Assiettes & Salade',
    items: [
      { id:'assiette-enfant',   title:'Assiette Enfant',   desc:'Frites + viandes',             price:'12,00', menuPrice:null, badge:null, url:'/uploads/Assiette Enfant.png',   sort_order:60 },
      { id:'assiette-emporter', title:'Assiette Emporter', desc:'Format pratique (Mixte: 18€)', price:'15,00', menuPrice:null, badge:null, url:'/uploads/Assiette Emporter.png', sort_order:61 },
      { id:'salade-berger',     title:'Salade du Berger',  desc:'Crudités, feta et olives',     price:'10,00', menuPrice:null, badge:null, url:'/uploads/Salade du Berger.png',  sort_order:62 }
    ]
  },
  {
    category: 'Burgers',
    items: [
      { id:'chicken-burger', title:'Chicken Burger', desc:'Poulet croustillant et cheddar', price:'6,00', menuPrice:'9,00', badge:null, url:'/uploads/Chicken Burger.png', sort_order:70 },
      { id:'cheese-burger',  title:'Cheese Burger',  desc:'Steak haché et fromage fondu',   price:'6,00', menuPrice:'9,00', badge:null, url:'/uploads/Cheese Burger.png',  sort_order:71 },
      { id:'fish-burger',    title:'Fish Burger',    desc:'Poisson pané et sauce tartare',  price:'6,00', menuPrice:'9,00', badge:null, url:'/uploads/Fish Burger.png',    sort_order:72 }
    ]
  },
  {
    category: 'Finger Food',
    items: [
      { id:'nuggets', title:'Nuggets (x7)', desc:'Filets de poulet frits dorés',   price:'8,50', menuPrice:null, badge:null, url:'/uploads/Nuggets (x7).png', sort_order:80 },
      { id:'wings',   title:'Wings (x4)',   desc:'Ailerons de poulet épicés',       price:'7,50', menuPrice:null, badge:null, url:'/uploads/Wings (x8).png',   sort_order:81 },
      { id:'tenders', title:'Tenders (x4)', desc:'Aiguillettes de poulet tendres', price:'7,50', menuPrice:null, badge:null, url:'/uploads/Tenders (x4).png', sort_order:82 }
    ]
  },
  {
    category: 'Boissons & Boissons Chaudes',
    items: [
      { id:'boissons-33cl', title:'Boissons 33cl', desc:'Coca, Fanta, Oasis, Perrier...', price:'2,00', menuPrice:null, badge:null, url:'/uploads/Boissons 33cl.png', sort_order:90 },
      { id:'cafe',          title:'Café',           desc:'Café expresso moulu minute',     price:'1,50', menuPrice:null, badge:null, url:'/uploads/Café.png',          sort_order:91 },
      { id:'the',           title:'Thé',            desc:'Thé à la menthe ou nature',      price:'1,50', menuPrice:null, badge:null, url:'/uploads/Thé.png',           sort_order:92 }
    ]
  },
  {
    category: 'Accompagnements & Sauces',
    items: [
      { id:'frites',    title:'Frites',          desc:"Petite: 2,00€ | Grande: 3,00€",    price:'2,00',   menuPrice:null, badge:null,        url:'/uploads/Frites.png',    sort_order:100 },
      { id:'barquette', title:'Barquette Viande', desc:'Portion de veau 100% maison',      price:'10,00',  menuPrice:null, badge:null,        url:'/uploads/Barquette.png', sort_order:101 },
      { id:'sauces',    title:'Nos Sauces',       desc:'Algérienne, Blanche, Samouraï... Incluse avec votre sandwich ou menu', price:'INCLUSE', menuPrice:'0,50', badge:'AU CHOIX', url:'/uploads/Nos Sauces.png', sort_order:102 }
    ]
  },
  {
    category: 'Salades Fraîches',
    items: [
      { id:'salade-grecque', title:'Salade Grecque',   desc:'Tomates, concombres, olives, feta, oignons', price:'6,00',  menuPrice:null, badge:null, url:'/uploads/Salade_Grecque.png',   sort_order:110 },
      { id:'salade-shope',   title:'Salade Shope',     desc:'Saladerie fraîche maison',                   price:'6,00',  menuPrice:null, badge:null, url:'/uploads/Salade_Shope.png',     sort_order:111 },
      { id:'salade-poulet',  title:'Salade de Poulet', desc:'Poulet grillé, frites et crudités',          price:'12,00', menuPrice:null, badge:null, url:'/uploads/Salade_de_Poulet.png', sort_order:112 }
    ]
  },
  {
    category: 'Salades & Burek',
    items: [
      { id:'salade-boeuf',   title:'Salade de Boeuf', desc:'Viande de bœuf, frites et crudités',  price:'13,00', menuPrice:null, badge:null, url:'/uploads/Salade_de_Boeuf.png', sort_order:120 },
      { id:'burek-fromage',  title:'Burek Fromage',   desc:'Burek au fromage, feuilleté maison',   price:'3,50',  menuPrice:null, badge:null, url:'/uploads/Burek_Fromage.png',   sort_order:121 },
      { id:'burek-epinards', title:'Burek Épinards',  desc:'Burek aux épinards et fromage',        price:'3,50',  menuPrice:null, badge:null, url:'/uploads/Burek_Épinards.png',  sort_order:122 }
    ]
  },
  {
    category: 'Burek & Spécialités',
    items: [
      { id:'burek-viande', title:'Burek Viande', desc:'Burek à la viande, feuilleté croustillant', price:'4,00', menuPrice:null, badge:null, url:'/uploads/Burek_Viande.png', sort_order:130 },
      { id:'fli-flija',    title:'Fli - Flija',  desc:'Fli traditionnel maison',                   price:'4,00', menuPrice:null, badge:null, url:'/uploads/Fli_-_Flija.png',  sort_order:131 },
      { id:'makarona',     title:'Makarona',     desc:'Penne, sauce tomate, fromage râpé',          price:'8,50', menuPrice:null, badge:null, url:'/uploads/Makarona.png',     sort_order:132 }
    ]
  },
  {
    category: 'Plats Maison',
    items: [
      { id:'escalope-creme', title:'Escalope Crème',  desc:'Poulet à la crème, champignons, légumes',               price:'12,50', menuPrice:null, badge:null, url:'/uploads/Escalope_Crème.png',  sort_order:140 },
      { id:'filet-poulet',   title:'Filet de Poulet', desc:'Frites, fromage, tomate, salade de choux, sauce blanche', price:'12,00', menuPrice:null, badge:null, url:'/uploads/Filet_de_Poulet.png', sort_order:141 },
      { id:'pleskavice',     title:'Pleskavice',      desc:'Frites, fromage, tomate, salade de choux, sauce blanche', price:'9,50',  menuPrice:null, badge:null, url:'/uploads/Pleskavice.png',      sort_order:142 }
    ]
  },
  {
    category: 'Qofte Grillées',
    items: [
      { id:'qofte-x5',  title:'Qofte x5',  desc:'5 boulettes grillées maison',  price:'9,00',  menuPrice:null, badge:null, url:'/uploads/Qofte_x5.png',  sort_order:150 },
      { id:'qofte-x7',  title:'Qofte x7',  desc:'7 boulettes grillées maison',  price:'11,00', menuPrice:null, badge:null, url:'/uploads/Qofte_x7.png',  sort_order:151 },
      { id:'qofte-x10', title:'Qofte x10', desc:'10 boulettes grillées maison', price:'13,00', menuPrice:null, badge:null, url:'/uploads/Qofte_x10.png', sort_order:152 }
    ]
  },
  {
    category: 'Grillades',
    items: [
      { id:'grillade',       title:'Grillade 2 pers.', desc:'Agneau, escalope, entrecôte, suxhuk, salade grecque, frites', price:'39,00', menuPrice:null, badge:'2 PERS', url:'/uploads/Menu_Grillade.png', sort_order:160 },
      { id:'grillade-4pers', title:'Grillade 4 pers.', desc:'Agneau, escalope, entrecôte, suxhuk, salade grecque, frites', price:'79,00', menuPrice:null, badge:'4 PERS', url:'/uploads/Menu_Grillade.png', sort_order:161 },
      { id:'grillade-6pers', title:'Grillade 6 pers.', desc:'Agneau, escalope, entrecôte, suxhuk, salade grecque, frites', price:'99,00', menuPrice:null, badge:'6 PERS', url:'/uploads/Menu_Grillade.png', sort_order:162 }
    ]
  },
  {
    category: 'Desserts',
    items: [
      { id:'trilece',  title:'Trilece',  desc:'Dessert traditionnel au lait', price:'3,50', menuPrice:null, badge:null, url:'/uploads/Trilece.png',  sort_order:163 },
      { id:'tiramisu', title:'Tiramisu', desc:'Tiramisu maison',              price:'3,50', menuPrice:null, badge:null, url:'/uploads/Tiramisu.png', sort_order:164 }
    ]
  }
];

/* ── État global ────────────────────────────────────────── */
var allItems       = [];
var pendingChanges = {};
var pendingNew     = [];
var pendingDelete  = [];
var searchQuery    = '';
var filterCategory = '';
var isLoggedIn     = false;

/* ── Utilitaires ─────────────────────────────────────────── */
function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function slug(s) {
  return String(s || '').toLowerCase()
    .replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e')
    .replace(/[îï]/g,'i').replace(/[ôö]/g,'o')
    .replace(/[ùûü]/g,'u').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function getCategories() {
  var cats = [], seen = {};
  allItems.forEach(function(item) {
    if (!seen[item.category]) { seen[item.category] = true; cats.push(item.category); }
  });
  return cats;
}

function hasPending() {
  return Object.keys(pendingChanges).length > 0
      || pendingNew.length > 0
      || pendingDelete.length > 0;
}

/* Normalise une valeur pour comparaison (null/undefined → '') */
function norm(v) { return (v === null || v === undefined) ? '' : String(v); }

/* ── Toast notifications ────────────────────────────────── */
var toastCount = 0;
function showToast(msg, type, duration) {
  type     = type     || 'info';
  duration = duration || 3500;
  var container = document.getElementById('toast-container');
  if (!container) return;
  var id = 'toast-' + (++toastCount);
  var icons = { success:'✓', error:'✕', warning:'⚠', info:'ℹ' };
  var div = document.createElement('div');
  div.className = 'toast toast-' + type;
  div.id = id;
  div.innerHTML =
    '<span class="toast-icon">' + (icons[type]||'ℹ') + '</span>' +
    '<span class="toast-msg">'  + esc(msg) + '</span>' +
    '<button class="toast-close" onclick="dismissToast(\'' + id + '\')">✕</button>';
  container.appendChild(div);
  setTimeout(function() { div.classList.add('show'); }, 10);
  setTimeout(function() { dismissToast(id); }, duration);
}
function dismissToast(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('show');
  setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 350);
}

/* ── Save bar ────────────────────────────────────────────── */
function updateSaveBar() {
  var bar  = document.getElementById('save-bar');
  var stat = document.getElementById('pending-count-stat');
  if (!bar) return;
  var n = Object.keys(pendingChanges).length + pendingNew.length + pendingDelete.length;
  if (stat) stat.textContent = n;
  if (hasPending()) {
    bar.classList.add('visible');
    var lbl = document.getElementById('pending-count');
    if (lbl) lbl.textContent = n + ' modification' + (n > 1 ? 's' : '') + ' en attente';
  } else {
    bar.classList.remove('visible');
  }
}

function markChanged(id, field, value) {
  if (!pendingChanges[id]) pendingChanges[id] = {};
  pendingChanges[id][field] = value;
  updateSaveBar();
  var card = document.querySelector('[data-id="' + id + '"]');
  if (card) card.classList.add('has-changes');
}

/* ── Stats ──────────────────────────────────────────────── */
function updateStats() {
  var cats  = getCategories().length;
  var items = allItems.length - pendingDelete.length + pendingNew.length;
  var elC = document.getElementById('stat-cats');
  var elI = document.getElementById('stat-items');
  if (elC) elC.textContent = cats;
  if (elI) elI.textContent = items;
}

/* ── Sidebar ─────────────────────────────────────────────── */
function buildSidebar() {
  var sidebar = document.getElementById('sidebar-links');
  if (!sidebar) return;
  var html = '';
  getCategories().forEach(function(cat) {
    html += '<a class="sidebar-link" href="#cat-' + slug(cat) + '" onclick="closeSidebarMobile()">' + esc(cat) + '</a>';
  });
  sidebar.innerHTML = html;
}

function closeSidebarMobile() {
  if (window.innerWidth < 900) closeSidebar();
}

/* ── Recherche & filtre ──────────────────────────────────── */
function applySearch() {
  var q = searchQuery.toLowerCase();
  var catCards = document.querySelectorAll('.cat-section');
  var totalVisible = 0;
  for (var i = 0; i < catCards.length; i++) {
    var section = catCards[i];
    var cards   = section.querySelectorAll('.item-card');
    var catVisible = 0;
    for (var j = 0; j < cards.length; j++) {
      var card  = cards[j];
      var title = (card.getAttribute('data-title') || '').toLowerCase();
      var cat   = (card.getAttribute('data-cat')   || '').toLowerCase();
      var match = (!q || title.indexOf(q) !== -1 || cat.indexOf(q) !== -1) &&
                  (!filterCategory || cat === filterCategory.toLowerCase());
      card.style.display = match ? '' : 'none';
      if (match) catVisible++;
    }
    section.style.display = catVisible === 0 ? 'none' : '';
    totalVisible += catVisible;
  }
  var empty = document.getElementById('empty-state');
  if (empty) empty.style.display = totalVisible === 0 ? 'flex' : 'none';
}

/* ── Rendu HTML ──────────────────────────────────────────── */
function renderAdmin() {
  var content = document.getElementById('content');
  if (!content) return;
  var cats = getCategories();
  if (cats.length === 0) {
    content.innerHTML = '<div id="empty-state" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:4rem;color:#888"><div style="font-size:3rem">🍽️</div><div style="font-size:1.1rem">Aucun article trouvé</div></div>';
    return;
  }
  var html = '';
  cats.forEach(function(cat) {
    var anchor   = slug(cat);
    var catItems = allItems.filter(function(it) {
      return it.category === cat && pendingDelete.indexOf(it.id) === -1;
    });
    html +=
      '<section class="cat-section" id="cat-' + anchor + '">' +
        '<div class="cat-header">' +
          '<div>' +
            '<div class="cat-name">' + esc(cat) + '</div>' +
            '<div class="cat-count">' + catItems.length + ' article' + (catItems.length > 1 ? 's' : '') + '</div>' +
          '</div>' +
          '<button class="btn btn-outline btn-sm" onclick="openAddModal(\'' + esc(cat).replace(/'/g,"\\'") + '\')">' +
            '+ Ajouter un article' +
          '</button>' +
        '</div>' +
        '<div class="items-list">';
    catItems.forEach(function(item) { html += renderItem(item); });
    html += '</div></section>';
  });
  html += '<div id="empty-state" style="display:none;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:4rem;color:#888"><div style="font-size:3rem">🔍</div><div style="font-size:1.1rem">Aucun résultat</div></div>';
  content.innerHTML = html;
  buildSidebar();
  updateStats();
}

function imgSrc(url) {
  if (!url) return '';
  if (url.indexOf('://') !== -1) return url;   // URL absolue (http/https)
  if (url.charAt(0) === '/') return url;        // Chemin absolu (/uploads/…)
  return '../' + url;                           // Relatif (uploads/…) → ../uploads/…
}

function renderItem(item) {
  var ch    = pendingChanges[item.id] || {};
  var isMod = Object.keys(ch).length > 0;
  var thumb = imgSrc(item.url || '');
  var sid   = esc(item.id);
  return (
    '<div class="item-card' + (isMod ? ' has-changes' : '') +
      '" data-id="' + sid + '" data-title="' + esc(item.title) + '" data-cat="' + esc(item.category) + '">' +
      '<div class="item-thumb">' +
        (thumb
          ? '<img src="' + esc(thumb) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">'
          : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#555;font-size:1.8rem">🍽️</div>') +
      '</div>' +
      '<div class="item-info">' +
        '<div class="item-title">' + esc(ch.title || item.title) + '</div>' +
        '<div class="item-meta">' +
          '<span class="item-badge">' + esc(item.category) + '</span>' +
          (item.badge ? '<span class="item-badge" style="background:rgba(224,16,16,0.15);color:#e01010">' + esc(item.badge) + '</span>' : '') +
        '</div>' +
      '</div>' +
      '<div class="item-prices">' +
        '<div class="price-group">' +
          '<label>Prix seul</label>' +
          '<input class="price-input" type="text" value="' + esc(norm(ch.price    !== undefined ? ch.price    : item.price))     + '" placeholder="9,00"' +
            ' oninput="markChanged(\'' + sid + '\',\'price\',this.value)">' +
        '</div>' +
        '<div class="price-group">' +
          '<label>Prix menu</label>' +
          '<input class="price-input" type="text" value="' + esc(norm(ch.menuPrice !== undefined ? ch.menuPrice : item.menuPrice)) + '" placeholder="12,00"' +
            ' oninput="markChanged(\'' + sid + '\',\'menuPrice\',this.value)">' +
        '</div>' +
      '</div>' +
      '<div class="item-actions">' +
        '<button class="btn-icon btn-edit"   title="Modifier"   onclick="openEditModal(\'' + sid + '\')">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>' +
            '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' +
          '</svg>' +
        '</button>' +
        '<button class="btn-icon btn-delete" title="Supprimer"  onclick="confirmDelete(\'' + sid + '\',\'' + esc(item.title).replace(/'/g,"\\'") + '\')">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
            '<polyline points="3 6 5 6 21 6"/>' +
            '<path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>' +
            '<path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
    '</div>'
  );
}

/* ── Modale : édition complète ───────────────────────────── */
var editingId = null;

function openEditModal(id) {
  var item = findItem(id);
  if (!item) return;
  var ch = pendingChanges[id] || {};
  editingId = id;
  setField('modal-id',        item.id);
  setField('modal-category',  norm(ch.category  || item.category));
  setField('modal-title',     norm(ch.title     || item.title));
  setField('modal-desc',      norm(ch.desc      !== undefined ? ch.desc      : item.desc));
  setField('modal-price',     norm(ch.price     || item.price));
  setField('modal-menuprice', norm(ch.menuPrice !== undefined ? ch.menuPrice : item.menuPrice));
  setField('modal-badge',     norm(ch.badge     !== undefined ? ch.badge     : item.badge));
  setField('modal-url',       norm(ch.url       || item.url));
  previewModalImage();
  openModal('edit-modal');
}

function openAddModal(category) {
  editingId = null;
  setField('modal-id',        '');
  setField('modal-category',  category || '');
  setField('modal-title',     '');
  setField('modal-desc',      '');
  setField('modal-price',     '');
  setField('modal-menuprice', '');
  setField('modal-badge',     '');
  setField('modal-url',       '');
  var prev = document.getElementById('modal-img-preview');
  if (prev) { prev.src = ''; prev.style.display = 'none'; }
  openModal('edit-modal');
}

function saveModal() {
  var id        = getField('modal-id').trim();
  var title     = getField('modal-title').trim();
  var desc      = getField('modal-desc').trim();
  var price     = getField('modal-price').trim();
  var menuPrice = getField('modal-menuprice').trim();
  var badge     = getField('modal-badge').trim();
  var url       = getField('modal-url').trim();
  var category  = getField('modal-category').trim();

  if (!title || !price || !category) {
    showToast('Titre, prix et catégorie sont obligatoires', 'error');
    return;
  }

  if (editingId) {
    /* ── Modification : on ne marque que les champs vraiment changés ── */
    var it = findItem(editingId);
    if (!it) { showToast('Article introuvable', 'error'); return; }

    var ch = {};
    if (title     !== norm(it.title))     ch.title     = title;
    if (desc      !== norm(it.desc))      ch.desc      = desc;
    if (price     !== norm(it.price))     ch.price     = price;
    if (menuPrice !== norm(it.menuPrice)) ch.menuPrice = menuPrice;
    if (badge     !== norm(it.badge))     ch.badge     = badge;
    if (url       !== norm(it.url))       ch.url       = url;
    if (category  !== norm(it.category))  ch.category  = category;

    if (Object.keys(ch).length > 0) {
      if (!pendingChanges[editingId]) pendingChanges[editingId] = {};
      Object.keys(ch).forEach(function(k) { pendingChanges[editingId][k] = ch[k]; });
      /* Applique localement pour un rendu immédiat */
      Object.keys(ch).forEach(function(k) { it[k] = ch[k]; });
      showToast('Modifications en attente — pensez à sauvegarder', 'info');
    } else {
      showToast('Aucune modification détectée', 'info');
    }

  } else {
    /* ── Nouvel article ── */
    if (!id) id = slug(title) + '-' + Date.now();
    var newItem = {
      id: id, category: category, title: title, desc: desc,
      price: price, menuPrice: menuPrice || null,
      badge: badge || null, url: url,
      sort_order: (allItems.length + 1) * 10
    };
    allItems.push(newItem);
    pendingNew.push(newItem);
    showToast('Article ajouté — pensez à sauvegarder', 'info');
  }

  closeModal('edit-modal');
  renderAdmin();
  updateSaveBar();
}

/* ── Suppression avec confirmation ───────────────────────── */
var deletingId    = '';
var deletingTitle = '';

function confirmDelete(id, title) {
  deletingId    = id;
  deletingTitle = title;
  var msg = document.getElementById('confirm-msg');
  if (msg) msg.textContent = 'Supprimer "' + title + '" ? Cette action est irréversible après sauvegarde.';
  openModal('confirm-dialog');
}

function doDelete() {
  if (!deletingId) return;
  /* Si l'item n'était qu'un ajout local, on l'annule sans aller sur Supabase */
  var newIdx = -1;
  for (var i = 0; i < pendingNew.length; i++) {
    if (pendingNew[i].id === deletingId) { newIdx = i; break; }
  }
  if (newIdx !== -1) {
    pendingNew.splice(newIdx, 1);
  } else {
    if (pendingDelete.indexOf(deletingId) === -1) pendingDelete.push(deletingId);
  }
  allItems = allItems.filter(function(it) { return it.id !== deletingId; });
  delete pendingChanges[deletingId];
  closeModal('confirm-dialog');
  renderAdmin();
  updateSaveBar();
  showToast('"' + deletingTitle + '" supprimé (sera effectif après sauvegarde)', 'warning');
  deletingId = ''; deletingTitle = '';
}

/* ── Sauvegarde Supabase ─────────────────────────────────── */
function saveAll() {
  if (!hasPending()) { showToast('Rien à sauvegarder', 'info'); return; }

  var btn = document.getElementById('btn-save-all');
  if (btn) { btn.disabled = true; btn.textContent = 'Sauvegarde…'; }

  var tasks = [];

  /* PATCH : modifications existantes */
  Object.keys(pendingChanges).forEach(function(id) {
    tasks.push(supabasePatch(id, pendingChanges[id]));
  });

  /* POST : nouveaux articles */
  pendingNew.forEach(function(item) {
    tasks.push(supabasePost(item));
  });

  /* DELETE : suppressions */
  pendingDelete.forEach(function(id) {
    tasks.push(supabaseDelete(id));
  });

  promiseAll(tasks, function(results) {
    var errors = results.filter(function(r) { return r && r.error; });
    if (errors.length === 0) {
      pendingChanges = {};
      pendingNew     = [];
      pendingDelete  = [];
      updateSaveBar();
      renderAdmin();
      showToast('✓ Toutes les modifications ont été sauvegardées !', 'success', 4000);
    } else {
      var details = errors.map(function(e) { return e.detail || e.id || '?'; }).join(', ');
      showToast(
        errors.length + ' erreur(s) lors de la sauvegarde. Détail : ' + details,
        'error', 6000
      );
      console.error('[Admin] Erreurs Supabase :', errors);
    }
    if (btn) { btn.disabled = false; btn.textContent = 'Sauvegarder'; }
  });
}

function discardAll() {
  pendingChanges = {};
  pendingNew     = [];
  pendingDelete  = [];
  fetchMenu();
  updateSaveBar();
  showToast('Modifications annulées', 'info');
}

/* ── Supabase API helpers ────────────────────────────────── */
function supabaseHeaders() {
  return {
    'apikey':        SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type':  'application/json',
    'Prefer':        'return=minimal'
  };
}

/* PATCH — convertit les clés JS → colonnes DB avant envoi */
function supabasePatch(id, changes) {
  return new Promise(function(resolve) {
    var payload = toDb(changes);
    /* Supprime l'id du payload pour éviter les conflits de clé primaire */
    delete payload.id;
    /* Supprime sort_order si pas dans les changes pour éviter les erreurs */
    if (!changes.sort_order) delete payload.sort_order;

    var url = SUPABASE_URL + '/rest/v1/' + TABLE + '?id=eq.' + encodeURIComponent(id);
    xhrRequest('PATCH', url, payload, function(ok, data, status) {
      if (ok) {
        resolve(null);
      } else {
        var detail = parseSupabaseError(data) || ('HTTP ' + status);
        console.error('[Admin] PATCH échoué pour', id, ':', detail, '\nPayload:', JSON.stringify(payload));
        resolve({ error: true, id: id, detail: detail });
      }
    });
  });
}

/* POST — convertit les clés JS → colonnes DB avant envoi */
function supabasePost(item) {
  return new Promise(function(resolve) {
    var payload = toDb(item);
    var url = SUPABASE_URL + '/rest/v1/' + TABLE;
    xhrRequest('POST', url, payload, function(ok, data, status) {
      if (ok) {
        resolve(null);
      } else {
        var detail = parseSupabaseError(data) || ('HTTP ' + status);
        console.error('[Admin] POST échoué :', detail, '\nPayload:', JSON.stringify(payload));
        resolve({ error: true, detail: detail });
      }
    });
  });
}

function supabaseDelete(id) {
  return new Promise(function(resolve) {
    var url = SUPABASE_URL + '/rest/v1/' + TABLE + '?id=eq.' + encodeURIComponent(id);
    xhrRequest('DELETE', url, null, function(ok, data, status) {
      if (ok) {
        resolve(null);
      } else {
        var detail = parseSupabaseError(data) || ('HTTP ' + status);
        console.error('[Admin] DELETE échoué pour', id, ':', detail);
        resolve({ error: true, id: id, detail: detail });
      }
    });
  });
}

/* Extrait le message d'erreur de la réponse Supabase */
function parseSupabaseError(body) {
  try {
    var obj = JSON.parse(body);
    return obj.message || obj.hint || obj.details || JSON.stringify(obj);
  } catch(e) { return body || ''; }
}

function xhrRequest(method, url, body, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  var headers = supabaseHeaders();
  Object.keys(headers).forEach(function(k) { xhr.setRequestHeader(k, headers[k]); });
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    cb(xhr.status >= 200 && xhr.status < 300, xhr.responseText, xhr.status);
  };
  xhr.onerror = function() { cb(false, 'Erreur réseau', 0); };
  xhr.send(body ? JSON.stringify(body) : null);
}

function promiseAll(promises, cb) {
  if (!Promise || promises.length === 0) { cb([]); return; }
  Promise.all(promises)
    .then(function(results) { cb(results); })
    .catch(function(e) { cb([{ error: true, detail: String(e) }]); });
}

/* ── Fetch menu depuis Supabase ──────────────────────────── */
function fetchMenu() {
  var status = document.getElementById('status-pill');
  if (status) { status.className = 'status-pill loading'; status.textContent = 'Connexion…'; }

  var url = SUPABASE_URL + '/rest/v1/' + TABLE + '?select=*&order=sort_order.asc';
  xhrRequest('GET', url, null, function(ok, data, httpStatus) {
    if (ok && data) {
      try {
        var rows = JSON.parse(data);
        if (Array.isArray(rows) && rows.length > 0) {
          allItems = rows.map(fromDb);
          if (status) { status.className = 'status-pill online'; status.textContent = '● En ligne'; }
          renderAdmin();
          return;
        }
      } catch(e) {
        console.error('[Admin] Erreur parsing JSON :', e);
      }
    } else {
      console.warn('[Admin] fetchMenu échoué — HTTP', httpStatus, data);
    }
    useFallback();
    if (status) { status.className = 'status-pill offline'; status.textContent = '○ Hors ligne'; }
  });
}

function useFallback() {
  allItems = [];
  defaultMenu.forEach(function(cat) {
    cat.items.forEach(function(item) {
      allItems.push({
        id:         item.id,
        category:   cat.category,
        title:      item.title,
        desc:       item.desc  || '',
        price:      item.price,
        menuPrice:  item.menuPrice || '',
        badge:      item.badge     || '',
        url:        item.url       || '',
        sort_order: item.sort_order
      });
    });
  });
  showToast('Mode hors ligne — données locales utilisées', 'warning', 5000);
  renderAdmin();
}

/* ── Helpers ─────────────────────────────────────────────── */
function findItem(id) {
  for (var i = 0; i < allItems.length; i++) {
    if (allItems[i].id === id) return allItems[i];
  }
  return null;
}

function openModal(id) {
  var el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
    setTimeout(function() { el.classList.add('open'); }, 10);
  }
}

function closeModal(id) {
  var el = document.getElementById(id);
  if (el) {
    el.classList.remove('open');
    setTimeout(function() { el.style.display = 'none'; }, 250);
  }
}

function getField(id) {
  var el = document.getElementById(id);
  return el ? el.value : '';
}

function setField(id, val) {
  var el = document.getElementById(id);
  if (el) el.value = (val === null || val === undefined) ? '' : val;
}

function previewModalImage() {
  var url  = getField('modal-url');
  var prev = document.getElementById('modal-img-preview');
  var ph   = document.getElementById('modal-photo-placeholder');
  if (!prev) return;
  if (url) {
    prev.src = imgSrc(url);
    prev.style.display = 'block';
    if (ph) ph.style.display = 'none';
  } else {
    prev.src = '';
    prev.style.display = 'none';
    if (ph) ph.style.display = '';
  }
}

/* ── Sidebar toggle ─────────────────────────────────────── */
function toggleSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  if (sidebar) {
    var isOpen = sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('show', isOpen);
  }
}

function closeSidebar() {
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}

/* ── Login ───────────────────────────────────────────────── */
function doLogin() {
  // Auth gérée par AdminClient.tsx qui wrappe ce panel — on auto-valide
  try { localStorage.setItem('admin_auth', 'ramo_ok'); } catch(e) {}
  var ls = document.getElementById('login-screen');
  var ap = document.getElementById('app');
  if (ls) ls.style.display = 'none';
  if (ap) ap.style.display = 'flex';
  isLoggedIn = true;
  fetchMenu();
  try {
    if (!localStorage.getItem('tuto_seen')) setTimeout(showTuto, 800);
  } catch(e) { setTimeout(showTuto, 800); }
}

/* ═══════════════════════════════════════════════════════════
   TUTORIAL SPOTLIGHT
═══════════════════════════════════════════════════════════ */
var tutoStep = 0;
var tutoForcedSaveBar = false;
var tutoSteps = [
  {
    target: null,
    emoji: '👋',
    title: 'Bienvenue dans l\'admin !',
    text:  'Ce tutoriel rapide vous guide à travers les fonctionnalités principales. Cliquez "Suivant" pour continuer.'
  },
  {
    target: '.items-list .item-card',
    emoji: '✏️',
    title: 'Modifier un article',
    text:  'Cliquez sur l\'icône crayon pour ouvrir la fiche complète d\'un article et modifier tous ses champs.'
  },
  {
    target: '.price-input',
    emoji: '💶',
    title: 'Modifier les prix rapide',
    text:  'Modifiez directement les prix ici sans ouvrir la modale. La carte sera marquée en orange.'
  },
  {
    target: '#save-bar',
    emoji: '💾',
    title: 'Sauvegarder vos modifications',
    text:  'Cette barre apparaît dès qu\'il y a des modifications en attente. Cliquez "Sauvegarder" pour envoyer tout vers le serveur.'
  },
  {
    target: '.cat-header .btn-outline',
    emoji: '➕',
    title: 'Ajouter un article',
    text:  'Chaque catégorie a un bouton pour ajouter un nouvel article directement dans cette section.'
  },
  {
    target: '#search-input, .search-input',
    emoji: '🔍',
    title: 'Recherche rapide',
    text:  'Filtrez les articles par nom ou catégorie en temps réel grâce à la barre de recherche.'
  },
  {
    target: null,
    emoji: '🎉',
    title: 'Vous êtes prêt !',
    text:  'Tout est clair ? N\'hésitez pas à rouvrir ce tutoriel via le bouton "Aide" dans la barre du haut.'
  }
];

function showTuto() {
  tutoStep = 0;
  var overlay = document.getElementById('tuto-overlay');
  if (overlay) overlay.style.display = 'block';
  applyTutoStep();
}

function applyTutoStep() {
  var step = tutoSteps[tutoStep];
  if (!step) { closeTuto(); return; }

  /* Dots */
  var dotsRow = document.getElementById('tuto-dots-row');
  if (dotsRow) {
    var html = '';
    tutoSteps.forEach(function(_, i) {
      html += '<div class="tuto-dot' + (i === tutoStep ? ' active' : '') + '"></div>';
    });
    dotsRow.innerHTML = html;
  }

  /* Contenu */
  var emoji = document.getElementById('tuto-emoji');
  var title = document.getElementById('tuto-card-title');
  var text  = document.getElementById('tuto-card-text');
  if (emoji) emoji.textContent = step.emoji || '';
  if (title) title.textContent = step.title || '';
  if (text)  text.textContent  = step.text  || '';

  /* Boutons nav */
  var btnPrev = document.getElementById('tuto-btn-prev');
  var btnNext = document.getElementById('tuto-btn-next');
  if (btnPrev) btnPrev.style.visibility = tutoStep === 0 ? 'hidden' : 'visible';
  if (btnNext) btnNext.textContent = tutoStep === tutoSteps.length - 1 ? 'Terminer ✓' : 'Suivant →';

  /* Save bar — forcer visible pour la démo */
  if (step.target === '#save-bar') {
    var bar = document.getElementById('save-bar');
    if (bar && !bar.classList.contains('visible')) {
      bar.classList.add('visible');
      tutoForcedSaveBar = true;
    }
  }

  /* Spotlight */
  if (step.target) {
    var el = document.querySelector(step.target);
    if (el) {
      positionTutoSpot(el);
    } else {
      hideTutoSpot();
      centerTutoCard();
    }
  } else {
    hideTutoSpot();
    centerTutoCard();
  }
}

function positionTutoSpot(el) {
  var rect    = el.getBoundingClientRect();
  var pad     = 8;
  var spot    = document.getElementById('tuto-spot');
  var pointer = document.getElementById('tuto-pointer');

  if (spot) {
    spot.style.display = 'block';
    spot.style.top     = (rect.top    - pad) + 'px';
    spot.style.left    = (rect.left   - pad) + 'px';
    spot.style.width   = (rect.width  + pad * 2) + 'px';
    spot.style.height  = (rect.height + pad * 2) + 'px';
  }
  if (pointer) {
    pointer.style.display = 'flex';
    pointer.style.top  = (rect.top  - pad - 36) + 'px';
    pointer.style.left = (rect.left + rect.width / 2 - 60) + 'px';
    var arrow = document.getElementById('tuto-pointer-arrow');
    if (arrow) arrow.textContent = '👇';
  }

  /* Positionne la carte info */
  var card   = document.getElementById('tuto-card');
  if (!card) return;
  var vw     = window.innerWidth;
  var vh     = window.innerHeight;
  var cardW  = Math.min(340, vw - 32);
  var cardH  = 220;
  var margin = 16;
  var cardLeft = Math.max(margin, Math.min(rect.left + rect.width / 2 - cardW / 2, vw - cardW - margin));
  var cardTop;

  if (rect.bottom + margin + cardH < vh) {
    cardTop = rect.bottom + margin + pad;
  } else if (rect.top - margin - cardH > 0) {
    cardTop = rect.top - margin - cardH - pad;
  } else {
    cardTop  = vh - cardH - margin;
    cardLeft = margin;
    cardW    = Math.min(340, vw - margin * 2);
  }

  card.style.left      = cardLeft + 'px';
  card.style.top       = cardTop  + 'px';
  card.style.width     = cardW    + 'px';
  card.style.transform = 'none';
}

function hideTutoSpot() {
  var spot    = document.getElementById('tuto-spot');
  var pointer = document.getElementById('tuto-pointer');
  if (spot)    spot.style.display    = 'none';
  if (pointer) pointer.style.display = 'none';
}

function centerTutoCard() {
  var card = document.getElementById('tuto-card');
  if (!card) return;
  var vw   = window.innerWidth;
  var cardW = Math.min(340, vw - 32);
  card.style.width     = cardW + 'px';
  card.style.left      = ((vw - cardW) / 2) + 'px';
  card.style.top       = '50%';
  card.style.transform = 'translateY(-50%)';
}

function tutoNext() {
  if (tutoStep < tutoSteps.length - 1) { tutoStep++; applyTutoStep(); }
  else closeTuto();
}

function tutoPrev() {
  if (tutoStep > 0) { tutoStep--; applyTutoStep(); }
}

function closeTuto() {
  var overlay = document.getElementById('tuto-overlay');
  if (overlay) overlay.style.display = 'none';
  hideTutoSpot();
  if (tutoForcedSaveBar && !hasPending()) {
    var bar = document.getElementById('save-bar');
    if (bar) bar.classList.remove('visible');
    tutoForcedSaveBar = false;
  }
  try { localStorage.setItem('tuto_seen', '1'); } catch(e) {}
}

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {

  /* Reconnexion automatique si déjà authentifié */
  try {
    if (localStorage.getItem('admin_auth') === 'ramo_ok') {
      document.getElementById('login-screen').style.display = 'none';
      document.getElementById('app').style.display = 'flex';
      isLoggedIn = true;
      fetchMenu();
    }
  } catch(e) {}

  /* Enter sur le champ mot de passe */
  var pw = document.getElementById('login-pw');
  if (pw) pw.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.keyCode === 13) doLogin();
  });

  /* Recherche desktop */
  var searchDesktop = document.getElementById('search-input');
  if (searchDesktop) searchDesktop.addEventListener('input', function() {
    searchQuery = this.value;
    applySearch();
  });

  /* Fermer les modales en cliquant sur le fond */
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
      var id = e.target.id;
      if (id !== 'confirm-dialog') closeModal(id);
    }
  });

  /* Echap pour fermer */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      closeModal('edit-modal');
      closeTuto();
    }
  });

  /* Recalcul position tuto si fenêtre redimensionnée */
  window.addEventListener('resize', function() {
    var overlay = document.getElementById('tuto-overlay');
    if (overlay && overlay.style.display !== 'none') applyTutoStep();
  });

  /* URL image en temps réel */
  var urlInput = document.getElementById('modal-url');
  if (urlInput) urlInput.addEventListener('input', previewModalImage);
});

/* ══════════════════════════════════════════════════════════
   NAVIGATION ONGLETS
══════════════════════════════════════════════════════════ */
var currentTab = 'menu';

function showTab(tab) {
  currentTab = tab;

  /* Panels contenu */
  var panelMenu     = document.getElementById('content');
  var panelTvs      = document.getElementById('content-tvs');
  var panelSettings = document.getElementById('content-settings');
  if (panelMenu)     panelMenu.style.display     = (tab === 'menu')     ? '' : 'none';
  if (panelTvs)      panelTvs.style.display      = (tab === 'tvs')      ? '' : 'none';
  if (panelSettings) panelSettings.style.display = (tab === 'settings') ? '' : 'none';

  /* Bottom tab bar */
  var tabs = ['menu', 'tvs', 'settings'];
  tabs.forEach(function(t) {
    var el = document.getElementById('btab-' + t);
    if (el) el.classList.toggle('active', t === tab);
  });

  /* Sidebar tabs desktop */
  tabs.forEach(function(t) {
    var el = document.getElementById('stab-' + t);
    if (el) el.classList.toggle('active', t === tab);
  });

  /* Afficher/masquer section catégories dans sidebar */
  var catLabel = document.getElementById('sidebar-cat-label');
  var sidebarLinks = document.getElementById('sidebar-links');
  var showCats = (tab === 'menu');
  if (catLabel)    catLabel.style.display    = showCats ? '' : 'none';
  if (sidebarLinks) sidebarLinks.style.display = showCats ? '' : 'none';

  if (tab === 'tvs') {
    loadTvPanel();
  } else {
    /* Stopper l'auto-refresh quand on quitte l'onglet TVs */
    if (_tvRefreshTimer) { clearInterval(_tvRefreshTimer); _tvRefreshTimer = null; }
  }

  /* Fermer sidebar mobile */
  closeSidebar();
}

/* ══════════════════════════════════════════════════════════
   PANEL TV
══════════════════════════════════════════════════════════ */

var TV_BASE_URL = (function() {
  return window.location.href.replace(/admin\.html.*$/, '').replace(/\/$/, '');
})();

var _tvRefreshTimer = null;

function tvUrl(n) {
  var base = TV_BASE_URL || (window.location.origin + window.location.pathname.replace(/admin\.html.*$/, ''));
  return base.replace(/\/$/, '') + '/index.html?tv=' + n;
}

function releaseAllTvRoles() {
  var roles = [1, 2, 3];
  var done  = 0;
  roles.forEach(function(role) {
    var url = SUPABASE_URL + '/rest/v1/tv_roles?role=eq.' + role;
    var xhr = new XMLHttpRequest();
    xhr.open('PATCH', url, true);
    xhr.setRequestHeader('apikey', SUPABASE_KEY);
    xhr.setRequestHeader('Authorization', 'Bearer ' + SUPABASE_KEY);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Prefer', 'return=minimal');
    xhr.onreadystatechange = function() {
      if (xhr.readyState !== 4) return;
      done++;
      if (done === roles.length) {
        showToast('Tous les rôles TV libérés — les TVs vont se reconfigurer', 'success', 4000);
        loadTvPanel();
      }
    };
    xhr.send(JSON.stringify({ device_id: null, last_seen: 0 }));
  });
}

function loadTvPanel() {
  var grid = document.getElementById('tv-cards-grid');
  if (!grid) return;

  /* Barre d'outils */
  var header = document.querySelector('#content-tvs .panel-header');
  if (header && !header.querySelector('.tv-toolbar')) {
    var toolbar = document.createElement('div');
    toolbar.className = 'tv-toolbar';
    toolbar.innerHTML =
      '<button class="btn btn-ghost btn-sm" onclick="releaseAllTvRoles()" title="Libère tous les rôles — les TVs se reconfigurent automatiquement">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.87"/></svg>' +
        ' Tout libérer' +
      '</button>' +
      '<span class="tv-refresh-label" id="tv-refresh-label">Actualisation auto dans 10s</span>';
    header.appendChild(toolbar);
  }

  /* Lancer l'auto-refresh */
  if (_tvRefreshTimer) clearInterval(_tvRefreshTimer);
  var countdown = 10;
  _tvRefreshTimer = setInterval(function() {
    countdown--;
    var lbl = document.getElementById('tv-refresh-label');
    if (lbl) lbl.textContent = countdown > 0 ? ('Actualisation dans ' + countdown + 's') : 'Actualisation…';
    if (countdown <= 0) {
      countdown = 10;
      fetchTvRoles();
    }
  }, 1000);

  fetchTvRoles();
}

function fetchTvRoles() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', SUPABASE_URL + '/rest/v1/tv_roles?select=*', true);
  xhr.setRequestHeader('apikey', SUPABASE_KEY);
  xhr.setRequestHeader('Authorization', 'Bearer ' + SUPABASE_KEY);
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    var rows = [];
    if (xhr.status >= 200 && xhr.status < 300) {
      try { rows = JSON.parse(xhr.responseText) || []; } catch(e) {}
    }
    renderTvCards(rows);
  };
  xhr.onerror = function() { renderTvCards([]); };
  xhr.send(null);
}

function renderTvCards(rows) {
  var grid = document.getElementById('tv-cards-grid');
  if (!grid) return;

  var now      = Date.now();
  var STALE_MS = 2 * 60 * 1000;

  var byRole = {};
  rows.forEach(function(r) { byRole[r.role] = r; });

  var tvDefs = [
    { n: 1, label: 'TV 1', sublabel: 'Menu — Partie 1' },
    { n: 2, label: 'TV 2', sublabel: 'Menu — Partie 2' },
    { n: 3, label: 'TV 3', sublabel: 'Publicités' }
  ];

  var html = '';
  tvDefs.forEach(function(tv) {
    var row      = byRole[tv.n] || {};
    var deviceId = row.device_id || '';
    var lastMs   = row.last_seen ? Number(row.last_seen) : 0;
    var isOnline = lastMs > 0 && (now - lastMs) < STALE_MS;
    var shortId  = deviceId ? deviceId.slice(-8) : '';

    /* Badge statut */
    var badge = isOnline
      ? '<span class="tv-badge tv-badge-live">En ligne</span>'
      : (deviceId
          ? '<span class="tv-badge tv-badge-offline">Hors ligne</span>'
          : '<span class="tv-badge tv-badge-offline">Non assignée</span>');

    /* Dernière connexion */
    var lastSeenStr = '';
    if (lastMs > 0) {
      var d  = new Date(lastMs);
      var hh = d.getHours().toString().padStart(2, '0');
      var mm = d.getMinutes().toString().padStart(2, '0');
      var ss = d.getSeconds().toString().padStart(2, '0');
      lastSeenStr = hh + ':' + mm + ':' + ss;
    }

    /* URL d'assignation */
    var url = tvUrl(tv.n);

    html +=
      '<div class="tv-card' + (isOnline ? ' tv-card-online' : '') + '">' +
        '<div class="tv-card-top">' +
          '<div class="tv-icon">' +
            '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">' +
              '<rect x="2" y="3" width="20" height="14" rx="2"/>' +
              '<line x1="8" y1="21" x2="16" y2="21"/>' +
              '<line x1="12" y1="17" x2="12" y2="21"/>' +
            '</svg>' +
          '</div>' +
          '<div class="tv-status-badges">' + badge + '</div>' +
        '</div>' +

        '<div>' +
          '<div class="tv-label">' + esc(tv.label) + '</div>' +
          '<div class="tv-sublabel">' + esc(tv.sublabel) + '</div>' +
        '</div>' +

        /* Appareil connecté */
        (deviceId
          ? '<div class="tv-device">' +
              '<span class="tv-device-id">' + esc(shortId) + '</span>' +
              (lastSeenStr ? '<span class="tv-device-seen">Vu à ' + lastSeenStr + '</span>' : '') +
            '</div>'
          : '<div class="tv-device empty">Aucun appareil</div>') +

        /* URL d'assignation */
        '<div class="tv-url-section">' +
          '<div class="tv-url-label">Lien à ouvrir sur cet écran</div>' +
          '<div class="tv-url-box">' + esc(url) + '</div>' +
        '</div>' +

        /* Actions */
        '<div class="tv-actions">' +
          '<button class="btn btn-ghost btn-sm" onclick="resetTvRole(' + tv.n + ')">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.87"/></svg>' +
            ' Libérer' +
          '</button>' +
          '<button class="btn btn-primary btn-sm" onclick="copyTvUrl(' + tv.n + ')">' +
            '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
            ' Copier le lien' +
          '</button>' +
        '</div>' +
      '</div>';
  });

  grid.innerHTML = html;
}

function resetTvRole(role) {
  if (!role) return;
  var url = SUPABASE_URL + '/rest/v1/tv_roles?role=eq.' + encodeURIComponent(role);
  var xhr = new XMLHttpRequest();
  xhr.open('PATCH', url, true);
  var headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': 'Bearer ' + SUPABASE_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal'
  };
  Object.keys(headers).forEach(function(k) { xhr.setRequestHeader(k, headers[k]); });
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    if (xhr.status >= 200 && xhr.status < 300) {
      showToast('TV ' + role + ' réinitialisée', 'success');
      loadTvPanel();
    } else {
      showToast('Erreur lors de la réinitialisation', 'error');
    }
  };
  xhr.onerror = function() { showToast('Erreur réseau', 'error'); };
  xhr.send(JSON.stringify({ device_id: null, last_seen: null }));
}

function copyTvUrl(n) {
  var url = tvUrl(n);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(function() {
      showToast('Lien copié : ' + url, 'success', 4000);
    }).catch(function() {
      fallbackCopy(url);
    });
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    showToast('Lien copié !', 'success', 3000);
  } catch(e) {
    showToast('Impossible de copier : ' + text, 'info', 6000);
  }
  document.body.removeChild(ta);
}
/* ── Liaison boutons (Next.js — pas d'inline onclick) ─────── */
document.addEventListener('DOMContentLoaded', function() {
  var loginBtn   = document.getElementById('login-btn');
  var loginPw    = document.getElementById('login-pw');
  var menuToggle = document.getElementById('menu-toggle-btn');
  var overlay    = document.getElementById('sidebar-overlay');
  var helpBtn    = document.getElementById('help-btn');
  var discardBtn = document.getElementById('discard-btn');
  var saveBtn    = document.getElementById('btn-save-all');
  var genBtn     = document.getElementById('btn-gen');
  var dlBtn      = document.getElementById('btn-dl');

  if (loginBtn)   loginBtn.addEventListener('click', doLogin);
  if (loginPw)    loginPw.addEventListener('keydown', function(e){ if(e.key==='Enter') doLogin(); });
  if (menuToggle) menuToggle.addEventListener('click', toggleSidebar);
  if (overlay)    overlay.addEventListener('click', closeSidebar);
  if (helpBtn)    helpBtn.addEventListener('click', showTuto);
  if (discardBtn) discardBtn.addEventListener('click', discardAll);
  if (saveBtn)    saveBtn.addEventListener('click', saveAll);

  /* Mobile search */
  var mSearch = document.getElementById('search-input-mobile');
  if (mSearch) mSearch.addEventListener('input', function(){ searchQuery=this.value; applySearch(); });
  var dSearch = document.getElementById('search-input');
  if (dSearch) dSearch.addEventListener('input', function(){ searchQuery=this.value; applySearch(); });

  /* Tab buttons */
  document.querySelectorAll('[data-tab]').forEach(function(btn) {
    btn.addEventListener('click', function(){ showTab(this.getAttribute('data-tab')); });
  });

  /* Modals */
  var editClose   = document.getElementById('edit-modal-close');
  var editCancel  = document.getElementById('edit-modal-cancel');
  var editSave    = document.getElementById('edit-modal-save');
  var confCancel  = document.getElementById('confirm-cancel');
  var confDelete  = document.getElementById('confirm-delete');
  var tutoSkip    = document.getElementById('tuto-btn-skip');
  var tutoPrevBtn = document.getElementById('tuto-btn-prev');
  var tutoNextBtn = document.getElementById('tuto-btn-next');

  if (editClose)   editClose.addEventListener('click', function(){ closeModal('edit-modal'); });
  if (editCancel)  editCancel.addEventListener('click', function(){ closeModal('edit-modal'); });
  if (editSave)    editSave.addEventListener('click', saveModal);
  if (confCancel)  confCancel.addEventListener('click', function(){ closeModal('confirm-dialog'); });
  if (confDelete)  confDelete.addEventListener('click', doDelete);
  if (tutoSkip)    tutoSkip.addEventListener('click', closeTuto);
  if (tutoPrevBtn) tutoPrevBtn.addEventListener('click', tutoPrev);
  if (tutoNextBtn) tutoNextBtn.addEventListener('click', tutoNext);

  /* Modal image preview */
  var urlInput = document.getElementById('modal-url');
  if (urlInput) urlInput.addEventListener('input', previewModalImage);

  /* Modal img error/load */
  var imgPrev = document.getElementById('modal-img-preview');
  if (imgPrev) {
    imgPrev.addEventListener('error', function(){ this.style.display='none'; });
    imgPrev.addEventListener('load', function(){ this.style.display='block'; });
  }
});

/* Patch tvUrl to use /tv route */
function tvUrl(n) {
  var base = window.location.origin + '/tv';
  return n ? base + '?tv=' + n : base;
}
