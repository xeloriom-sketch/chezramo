/* ═══════════════════════════════════════════════════════════
   CHEZ RAMO — Admin Panel  |  admin.js
   ═══════════════════════════════════════════════════════════ */

/* ── Configuration Supabase ─────────────────────────────── */
var SUPABASE_URL = 'https://hqfewokpvjmxezhnurbm.supabase.co';
var SUPABASE_KEY = 'sb_publishable_NmIfxaQb5ncapzCtzI5uNQ_tHdCwAyc';
var TABLE      = 'menu_items';
var ADMIN_PASS = 'ramo2024';

/* ── Données par défaut (fallback si Supabase indisponible) ─ */
var defaultMenu = [
  {
    category: 'Sandwichs Vedettes',
    items: [
      { id:'kebab',        title:'Kebab',        desc:'Pain rond, veau maison, crudités',         price:'9,00',  menuPrice:'12,00', badge:null,    url:'uploads/Kebab.png',           sort_order:1  },
      { id:'kebab-frites', title:'Kebab Frites', desc:'Viande et frites servis dans le pain',     price:'9,50',  menuPrice:null,    badge:null,    url:'uploads/Kebab Frites.png',    sort_order:2  },
      { id:'kebab-geant',  title:'Kebab Géant',  desc:'Double portion de viande de veau',         price:'15,00', menuPrice:'17,00', badge:'XXL',   url:'uploads/Kebab Geant.png',     sort_order:3  }
    ]
  },
  {
    category: 'Nos Specialites',
    items: [
      { id:'kofte',     title:'Kofte',     desc:'Boulettes de viande hachée épicées', price:'9,00', menuPrice:'12,00', badge:null, url:'uploads/Americain.png', sort_order:10 },
      { id:'americain', title:'Américain', desc:'Steak haché et cheddar fondu',       price:'9,00', menuPrice:'12,00', badge:null, url:'uploads/Kofte.png',     sort_order:11 },
      { id:'escalope',  title:'Escalope',  desc:'Filet de poulet pané maison',        price:'9,00', menuPrice:'12,00', badge:null, url:'uploads/Escalope.png',  sort_order:12 }
    ]
  },
  {
    category: 'Tradition & Galettes',
    items: [
      { id:'miche-kebab', title:'Miche Kebab', desc:'Pain miche traditionnel croustillant', price:'9,00', menuPrice:'12,00', badge:null, url:'uploads/Miche Kebab.png', sort_order:20 },
      { id:'galette',     title:'Galette',     desc:'Dürum : fine galette roulée',          price:'9,00', menuPrice:'12,00', badge:null, url:'uploads/Galette.png',     sort_order:21 },
      { id:'cordon-bleu', title:'Cordon Bleu', desc:'Sandwich au cordon bleu fondant',      price:'9,00', menuPrice:'12,00', badge:null, url:'uploads/Cordon Bleu.png', sort_order:22 }
    ]
  },
  {
    category: 'Tacos',
    items: [
      { id:'tacos',      title:'Tacos',      desc:'Sauce fromagère et frites incluses', price:'10,00', menuPrice:'13,00', badge:null,   url:'uploads/Tacos.png',      sort_order:30 },
      { id:'maxi-tacos', title:'Maxi Tacos', desc:'Format géant avec 2 viandes',        price:'15,00', menuPrice:'17,00', badge:'MAXI', url:'uploads/Maxi Tacos.png', sort_order:31 }
    ]
  },
  {
    category: 'Assiettes Gourmet',
    items: [
      { id:'assiette-kebab',    title:'Assiette Kebab',    desc:"Veau maison servi à l'assiette", price:'15,00', menuPrice:null, badge:null, url:'uploads/Assiette Kebab.png',    sort_order:40 },
      { id:'assiette-escalope', title:'Assiette Escalope', desc:'Poulet pané ou grillé',           price:'15,00', menuPrice:null, badge:null, url:'uploads/Assiette Escalope.png', sort_order:41 },
      { id:'assiette-kofte',    title:'Assiette Kofte',    desc:'Boulettes maison grillées',       price:'15,00', menuPrice:null, badge:null, url:'uploads/Assiette Kofte.png',    sort_order:42 }
    ]
  },
  {
    category: 'Assiettes Gourmet (Suite)',
    items: [
      { id:'assiette-steak',  title:'Assiette Steak',       desc:'Steaks hachés grillés minute',  price:'15,00', menuPrice:null, badge:null,    url:'uploads/Assiette Steak.png',      sort_order:50 },
      { id:'assiette-cordon', title:'Assiette Cordon Bleu', desc:'Deux cordons bleus fondants',   price:'15,00', menuPrice:null, badge:null,    url:'uploads/Assiette Cordon Bleu.png',sort_order:51 },
      { id:'assiette-mixte',  title:'Assiette Mixte',       desc:'Kebab + 2 viandes au choix',    price:'18,00', menuPrice:null, badge:'MIXTE', url:'uploads/Assiette Mixte.png',      sort_order:52 }
    ]
  },
  {
    category: 'Assiettes & Salade',
    items: [
      { id:'assiette-enfant',   title:'Assiette Enfant',   desc:'Frites + viandes',             price:'12,00', menuPrice:null, badge:null, url:'uploads/Assiette Enfant.png',   sort_order:60 },
      { id:'assiette-emporter', title:'Assiette Emporter', desc:'Format pratique (Mixte: 18€)', price:'15,00', menuPrice:null, badge:null, url:'uploads/Assiette Emporter.png', sort_order:61 },
      { id:'salade-berger',     title:'Salade du Berger',  desc:'Crudités, feta et olives',     price:'10,00', menuPrice:null, badge:null, url:'uploads/Salade du Berger.png',  sort_order:62 }
    ]
  },
  {
    category: 'Burgers',
    items: [
      { id:'chicken-burger', title:'Chicken Burger', desc:'Poulet croustillant et cheddar', price:'6,00', menuPrice:'9,00', badge:null, url:'uploads/Chicken Burger.png', sort_order:70 },
      { id:'cheese-burger',  title:'Cheese Burger',  desc:'Steak haché et fromage fondu',   price:'6,00', menuPrice:'9,00', badge:null, url:'uploads/Cheese Burger.png',  sort_order:71 },
      { id:'fish-burger',    title:'Fish Burger',    desc:'Poisson pané et sauce tartare',  price:'6,00', menuPrice:'9,00', badge:null, url:'uploads/Fish Burger.png',    sort_order:72 }
    ]
  },
  {
    category: 'Finger Food',
    items: [
      { id:'nuggets', title:'Nuggets (x7)', desc:'Filets de poulet frits dorés',   price:'8,50', menuPrice:null, badge:null, url:'uploads/Nuggets (x7).png', sort_order:80 },
      { id:'wings',   title:'Wings (x4)',   desc:'Ailerons de poulet épicés',       price:'7,50', menuPrice:null, badge:null, url:'uploads/Wings (x8).png',   sort_order:81 },
      { id:'tenders', title:'Tenders (x4)', desc:'Aiguillettes de poulet tendres', price:'7,50', menuPrice:null, badge:null, url:'uploads/Tenders (x4).png', sort_order:82 }
    ]
  },
  {
    category: 'Boissons & Boissons Chaudes',
    items: [
      { id:'boissons-33cl', title:'Boissons 33cl', desc:'Coca, Fanta, Oasis, Perrier...', price:'2,00', menuPrice:null, badge:null, url:'uploads/Boissons 33cl.png', sort_order:90 },
      { id:'cafe',          title:'Café',           desc:'Café expresso moulu minute',     price:'1,50', menuPrice:null, badge:null, url:'uploads/Café.png',          sort_order:91 },
      { id:'the',           title:'Thé',            desc:'Thé à la menthe ou nature',      price:'1,50', menuPrice:null, badge:null, url:'uploads/Thé.png',           sort_order:92 }
    ]
  },
  {
    category: 'Accompagnements & Sauces',
    items: [
      { id:'frites',    title:'Frites',          desc:"Petite: 2,00€ | Grande: 3,00€",    price:'2,00',   menuPrice:null, badge:null,        url:'uploads/Frites.png',    sort_order:100 },
      { id:'barquette', title:'Barquette Viande', desc:'Portion de veau 100% maison',      price:'10,00',  menuPrice:null, badge:null,        url:'uploads/Barquette.png', sort_order:101 },
      { id:'sauces',    title:'Nos Sauces',       desc:'Algérienne, Blanche, Samouraï... Incluse avec votre sandwich ou menu', price:'INCLUSE', menuPrice:'0,50', badge:'AU CHOIX', url:'uploads/Nos Sauces.png', sort_order:102 }
    ]
  },
  {
    category: 'Salades Fraîches',
    items: [
      { id:'salade-grecque', title:'Salade Grecque',   desc:'Tomates, concombres, olives, feta, oignons', price:'6,00',  menuPrice:null, badge:null, url:'uploads/Salade_Grecque.png',   sort_order:110 },
      { id:'salade-shope',   title:'Salade Shope',     desc:'Saladerie fraîche maison',                   price:'6,00',  menuPrice:null, badge:null, url:'uploads/Salade_Shope.png',     sort_order:111 },
      { id:'salade-poulet',  title:'Salade de Poulet', desc:'Poulet grillé, frites et crudités',          price:'12,00', menuPrice:null, badge:null, url:'uploads/Salade_de_Poulet.png', sort_order:112 }
    ]
  },
  {
    category: 'Salades & Burek',
    items: [
      { id:'salade-boeuf',   title:'Salade de Boeuf', desc:'Viande de bœuf, frites et crudités',  price:'13,00', menuPrice:null, badge:null, url:'uploads/Salade_de_Boeuf.png', sort_order:120 },
      { id:'burek-fromage',  title:'Burek Fromage',   desc:'Burek au fromage, feuilleté maison',   price:'3,50',  menuPrice:null, badge:null, url:'uploads/Burek_Fromage.png',   sort_order:121 },
      { id:'burek-epinards', title:'Burek Épinards',  desc:'Burek aux épinards et fromage',        price:'3,50',  menuPrice:null, badge:null, url:'uploads/Burek_Épinards.png',  sort_order:122 }
    ]
  },
  {
    category: 'Burek & Spécialités',
    items: [
      { id:'burek-viande', title:'Burek Viande', desc:'Burek à la viande, feuilleté croustillant', price:'4,00', menuPrice:null, badge:null, url:'uploads/Burek_Viande.png', sort_order:130 },
      { id:'fli-flija',    title:'Fli - Flija',  desc:'Fli traditionnel maison',                   price:'4,00', menuPrice:null, badge:null, url:'uploads/Fli_-_Flija.png',  sort_order:131 },
      { id:'makarona',     title:'Makarona',     desc:'Penne, sauce tomate, fromage râpé',          price:'8,50', menuPrice:null, badge:null, url:'uploads/Makarona.png',     sort_order:132 }
    ]
  },
  {
    category: 'Plats Maison',
    items: [
      { id:'escalope-creme', title:'Escalope Crème',  desc:'Poulet à la crème, champignons, légumes',               price:'12,50', menuPrice:null, badge:null, url:'uploads/Escalope_Crème.png',  sort_order:140 },
      { id:'filet-poulet',   title:'Filet de Poulet', desc:'Frites, fromage, tomate, salade de choux, sauce blanche', price:'12,00', menuPrice:null, badge:null, url:'uploads/Filet_de_Poulet.png', sort_order:141 },
      { id:'pleskavice',     title:'Pleskavice',      desc:'Frites, fromage, tomate, salade de choux, sauce blanche', price:'9,50',  menuPrice:null, badge:null, url:'uploads/Pleskavice.png',      sort_order:142 }
    ]
  },
  {
    category: 'Qofte Grillées',
    items: [
      { id:'qofte-x5',  title:'Qofte x5',  desc:'5 boulettes grillées maison',  price:'9,00',  menuPrice:null, badge:null, url:'uploads/Qofte_x5.png',  sort_order:150 },
      { id:'qofte-x7',  title:'Qofte x7',  desc:'7 boulettes grillées maison',  price:'11,00', menuPrice:null, badge:null, url:'uploads/Qofte_x7.png',  sort_order:151 },
      { id:'qofte-x10', title:'Qofte x10', desc:'10 boulettes grillées maison', price:'13,00', menuPrice:null, badge:null, url:'uploads/Qofte_x10.png', sort_order:152 }
    ]
  },
  {
    category: 'Grillades',
    items: [
      { id:'grillade',      title:'Grillade 2 pers.', desc:'Agneau, escalope, entrecôte, suxhuk, salade grecque, frites', price:'39,00', menuPrice:null, badge:'2 PERS', url:'uploads/Menu_Grillade.png', sort_order:160 },
      { id:'grillade-4pers',title:'Grillade 4 pers.', desc:'Agneau, escalope, entrecôte, suxhuk, salade grecque, frites', price:'79,00', menuPrice:null, badge:'4 PERS', url:'uploads/Menu_Grillade.png', sort_order:161 },
      { id:'grillade-6pers',title:'Grillade 6 pers.', desc:'Agneau, escalope, entrecôte, suxhuk, salade grecque, frites', price:'99,00', menuPrice:null, badge:'6 PERS', url:'uploads/Menu_Grillade.png', sort_order:162 }
    ]
  },
  {
    category: 'Desserts',
    items: [
      { id:'trilece',  title:'Trilece',  desc:'Dessert traditionnel au lait', price:'3,50', menuPrice:null, badge:null, url:'uploads/Trilece.png',  sort_order:163 },
      { id:'tiramisu', title:'Tiramisu', desc:'Tiramisu maison',              price:'3,50', menuPrice:null, badge:null, url:'uploads/Tiramisu.png', sort_order:164 }
    ]
  }
];

/* ── État global ────────────────────────────────────────── */
var allItems      = [];   // données courantes (depuis Supabase ou fallback)
var pendingChanges = {};  // { id: {field: value, ...} }  modifications non sauvées
var pendingNew    = [];   // nouveaux articles à insérer
var pendingDelete = [];   // ids à supprimer
var searchQuery   = '';
var filterCategory= '';
var isLoggedIn    = false;

/* ── Utilitaires ─────────────────────────────────────────── */
function esc(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function slug(s) {
  return s.toLowerCase()
    .replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e')
    .replace(/[îï]/g,'i').replace(/[ôö]/g,'o')
    .replace(/[ùûü]/g,'u').replace(/ç/g,'c')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

function getCategories() {
  var cats = [];
  allItems.forEach(function(item) {
    if (cats.indexOf(item.category) === -1) cats.push(item.category);
  });
  return cats;
}

function hasPending() {
  return Object.keys(pendingChanges).length > 0
      || pendingNew.length > 0
      || pendingDelete.length > 0;
}

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
  var bar = document.getElementById('save-bar');
  if (!bar) return;
  if (hasPending()) {
    bar.classList.add('visible');
    var n = Object.keys(pendingChanges).length + pendingNew.length + pendingDelete.length;
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
  // visuel sur la carte
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
  var cats = getCategories();
  var html = '';
  cats.forEach(function(cat) {
    var anchor = slug(cat);
    html += '<a class="sidebar-link" href="#cat-' + anchor + '" onclick="closeSidebarMobile()">' + esc(cat) + '</a>';
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
    var anchor = slug(cat);
    var catItems = allItems.filter(function(it) { return it.category === cat && pendingDelete.indexOf(it.id) === -1; });
    html +=
      '<section class="cat-section" id="cat-' + anchor + '">' +
        '<div class="cat-header">' +
          '<div>' +
            '<div class="cat-name">' + esc(cat) + '</div>' +
            '<div class="cat-count">' + catItems.length + ' article' + (catItems.length > 1 ? 's' : '') + '</div>' +
          '</div>' +
          '<button class="btn btn-outline btn-sm" onclick="openAddModal(\'' + esc(cat) + '\')">' +
            '+ Ajouter un article' +
          '</button>' +
        '</div>' +
        '<div class="items-list">';
    catItems.forEach(function(item) {
      html += renderItem(item);
    });
    html += '</div></section>';
  });
  html += '<div id="empty-state" style="display:none;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:4rem;color:#888"><div style="font-size:3rem">🔍</div><div style="font-size:1.1rem">Aucun résultat</div></div>';
  content.innerHTML = html;
  buildSidebar();
  updateStats();
}

function renderItem(item) {
  var ch = pendingChanges[item.id] || {};
  var isMod = Object.keys(ch).length > 0;
  var thumb = item.url ? item.url : '';
  return (
    '<div class="item-card' + (isMod ? ' has-changes' : '') + '" data-id="' + esc(item.id) + '" data-title="' + esc(item.title) + '" data-cat="' + esc(item.category) + '">' +
      '<div class="item-thumb">' +
        (thumb ? '<img src="' + esc(thumb) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#555;font-size:1.8rem">🍽️</div>') +
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
          '<input class="price-input" type="text" value="' + esc(ch.price || item.price || '') + '" placeholder="9,00" ' +
            'oninput="markChanged(\'' + esc(item.id) + '\',\'price\',this.value)" ' +
            'onchange="markChanged(\'' + esc(item.id) + '\',\'price\',this.value)">' +
        '</div>' +
        '<div class="price-group">' +
          '<label>Prix menu</label>' +
          '<input class="price-input" type="text" value="' + esc(ch.menuPrice || item.menuPrice || '') + '" placeholder="12,00" ' +
            'oninput="markChanged(\'' + esc(item.id) + '\',\'menuPrice\',this.value)" ' +
            'onchange="markChanged(\'' + esc(item.id) + '\',\'menuPrice\',this.value)">' +
        '</div>' +
      '</div>' +
      '<div class="item-actions">' +
        '<button class="btn-icon btn-edit" title="Modifier" onclick="openEditModal(\'' + esc(item.id) + '\')">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
        '</button>' +
        '<button class="btn-icon btn-delete" title="Supprimer" onclick="confirmDelete(\'' + esc(item.id) + '\',\'' + esc(item.title) + '\')">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>' +
        '</button>' +
      '</div>' +
    '</div>'
  );
}

/* ── Modale : édition complète ───────────────────────────── */
var editingId = null;

function openEditModal(id) {
  var item = null;
  for (var i = 0; i < allItems.length; i++) {
    if (allItems[i].id === id) { item = allItems[i]; break; }
  }
  if (!item) return;
  var ch = pendingChanges[id] || {};
  editingId = id;
  setField('modal-id',        item.id);
  setField('modal-title',     ch.title    || item.title    || '');
  setField('modal-desc',      ch.desc     || item.desc     || '');
  setField('modal-price',     ch.price    || item.price    || '');
  setField('modal-menuprice', ch.menuPrice|| item.menuPrice|| '');
  setField('modal-badge',     ch.badge    || item.badge    || '');
  setField('modal-url',       ch.url      || item.url      || '');
  setField('modal-category',  ch.category || item.category || '');
  var preview = document.getElementById('modal-img-preview');
  if (preview) preview.src = ch.url || item.url || '';
  openModal('edit-modal');
}

function openAddModal(category) {
  editingId = null;
  setField('modal-id',        '');
  setField('modal-title',     '');
  setField('modal-desc',      '');
  setField('modal-price',     '');
  setField('modal-menuprice', '');
  setField('modal-badge',     '');
  setField('modal-url',       '');
  setField('modal-category',  category || '');
  var preview = document.getElementById('modal-img-preview');
  if (preview) preview.src = '';
  openModal('edit-modal');
}

function saveModal() {
  var id       = getField('modal-id').trim();
  var title    = getField('modal-title').trim();
  var desc     = getField('modal-desc').trim();
  var price    = getField('modal-price').trim();
  var menuPrice= getField('modal-menuprice').trim();
  var badge    = getField('modal-badge').trim();
  var url      = getField('modal-url').trim();
  var category = getField('modal-category').trim();

  if (!title || !price || !category) {
    showToast('Titre, prix et catégorie sont obligatoires', 'error');
    return;
  }

  if (editingId) {
    /* Modification */
    for (var i = 0; i < allItems.length; i++) {
      if (allItems[i].id === editingId) {
        var it = allItems[i];
        if (!pendingChanges[editingId]) pendingChanges[editingId] = {};
        if (title     !== it.title)     pendingChanges[editingId].title     = title;
        if (desc      !== it.desc)      pendingChanges[editingId].desc      = desc;
        if (price     !== it.price)     pendingChanges[editingId].price     = price;
        if (menuPrice !== (it.menuPrice||'')) pendingChanges[editingId].menuPrice = menuPrice;
        if (badge     !== (it.badge||''))     pendingChanges[editingId].badge     = badge;
        if (url       !== it.url)       pendingChanges[editingId].url       = url;
        if (category  !== it.category)  pendingChanges[editingId].category  = category;
        // appliquer localement pour le rendu
        it.title     = title;
        it.desc      = desc;
        it.price     = price;
        it.menuPrice = menuPrice;
        it.badge     = badge;
        it.url       = url;
        it.category  = category;
        break;
      }
    }
    showToast('Modifications enregistrées localement', 'info');
  } else {
    /* Nouvel article */
    if (!id) id = slug(title) + '-' + Date.now();
    var newItem = {
      id: id, category: category, title: title, desc: desc,
      price: price, menuPrice: menuPrice, badge: badge, url: url,
      sort_order: allItems.length * 10
    };
    allItems.push(newItem);
    pendingNew.push(newItem);
    showToast('Article ajouté (sera envoyé à la sauvegarde)', 'info');
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
  if (pendingDelete.indexOf(deletingId) === -1) pendingDelete.push(deletingId);
  allItems = allItems.filter(function(it) { return it.id !== deletingId; });
  var idx = pendingNew.findIndex ? pendingNew.findIndex(function(it) { return it.id === deletingId; }) : -1;
  if (idx !== -1) {
    pendingNew.splice(idx, 1);
    pendingDelete.pop();
  }
  delete pendingChanges[deletingId];
  closeModal('confirm-dialog');
  renderAdmin();
  updateSaveBar();
  showToast('"' + deletingTitle + '" supprimé (sera effectif après sauvegarde)', 'warning');
  deletingId = ''; deletingTitle = '';
}

/* ── Sauvegarde Supabase ─────────────────────────────────── */
function saveAll() {
  var btn = document.getElementById('btn-save-all');
  if (btn) { btn.disabled = true; btn.textContent = 'Sauvegarde…'; }

  var tasks = [];

  /* PATCH : modifications existantes */
  Object.keys(pendingChanges).forEach(function(id) {
    var changes = pendingChanges[id];
    tasks.push(supabasePatch(id, changes));
  });

  /* POST : nouveaux articles */
  pendingNew.forEach(function(item) {
    tasks.push(supabasePost(item));
  });

  /* DELETE : suppressions */
  pendingDelete.forEach(function(id) {
    tasks.push(supabaseDelete(id));
  });

  if (tasks.length === 0) {
    showToast('Rien à sauvegarder', 'info');
    if (btn) { btn.disabled = false; btn.textContent = 'Sauvegarder'; }
    return;
  }

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
      showToast('Erreur lors de la sauvegarde (' + errors.length + ' échec(s)). Vérifiez la connexion.', 'error', 5000);
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

function supabasePatch(id, changes) {
  return new Promise(function(resolve) {
    var url = SUPABASE_URL + '/rest/v1/' + TABLE + '?id=eq.' + encodeURIComponent(id);
    xhrRequest('PATCH', url, changes, function(ok, data) {
      resolve(ok ? null : { error: true, id: id });
    });
  });
}

function supabasePost(item) {
  return new Promise(function(resolve) {
    var url = SUPABASE_URL + '/rest/v1/' + TABLE;
    xhrRequest('POST', url, item, function(ok, data) {
      resolve(ok ? null : { error: true });
    });
  });
}

function supabaseDelete(id) {
  return new Promise(function(resolve) {
    var url = SUPABASE_URL + '/rest/v1/' + TABLE + '?id=eq.' + encodeURIComponent(id);
    xhrRequest('DELETE', url, null, function(ok, data) {
      resolve(ok ? null : { error: true, id: id });
    });
  });
}

function xhrRequest(method, url, body, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  var headers = supabaseHeaders();
  Object.keys(headers).forEach(function(k) { xhr.setRequestHeader(k, headers[k]); });
  xhr.onreadystatechange = function() {
    if (xhr.readyState !== 4) return;
    cb(xhr.status >= 200 && xhr.status < 300, xhr.responseText);
  };
  xhr.onerror = function() { cb(false, ''); };
  xhr.send(body ? JSON.stringify(body) : null);
}

function promiseAll(promises, cb) {
  if (!Promise || promises.length === 0) { cb([]); return; }
  Promise.all(promises).then(function(results) { cb(results); }).catch(function(e) { cb([{ error: true }]); });
}

/* ── Fetch menu depuis Supabase ──────────────────────────── */
function fetchMenu() {
  var status = document.getElementById('status-pill');
  if (status) { status.className = 'status-pill loading'; status.textContent = 'Connexion…'; }

  var url = SUPABASE_URL + '/rest/v1/' + TABLE + '?select=*&order=sort_order.asc';
  xhrRequest('GET', url, null, function(ok, data) {
    if (ok && data) {
      try {
        var rows = JSON.parse(data);
        if (rows && rows.length > 0) {
          allItems = rows.map(function(r) {
            return {
              id:        r.id,
              category:  r.category,
              title:     r.title,
              desc:      r.desc || r.description || '',
              price:     r.price,
              menuPrice: r.menuPrice || r['menuPrice'] || '',
              badge:     r.badge || '',
              url:       r.url || '',
              sort_order:r.sort_order || 0
            };
          });
          if (status) { status.className = 'status-pill online'; status.textContent = '● En ligne'; }
          renderAdmin();
          return;
        }
      } catch(e) {}
    }
    /* Fallback données locales */
    useFallback();
    if (status) { status.className = 'status-pill offline'; status.textContent = '○ Hors ligne'; }
  });
}

function useFallback() {
  allItems = [];
  defaultMenu.forEach(function(cat) {
    cat.items.forEach(function(item) {
      allItems.push({
        id:        item.id,
        category:  cat.category,
        title:     item.title,
        desc:      item.desc || '',
        price:     item.price,
        menuPrice: item.menuPrice || '',
        badge:     item.badge || '',
        url:       item.url || '',
        sort_order:item.sort_order
      });
    });
  });
  showToast('Mode hors ligne — données locales utilisées', 'warning', 5000);
  renderAdmin();
}

/* ── Modal helpers ───────────────────────────────────────── */
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
  if (el) el.value = val || '';
}

/* ── Prévisualisation image dans modale ──────────────────── */
function previewModalImage() {
  var url  = getField('modal-url');
  var prev = document.getElementById('modal-img-preview');
  if (prev) prev.src = url || '';
}

/* ── Tutorial Spotlight ──────────────────────────────────── */
var tutoStep = 0;
var tutoForcedSaveBar = false;

var tutoSteps = [
  {
    emoji: '👋',
    title: 'Bienvenue dans le panneau admin !',
    text:  'Ce panneau te permet de changer les prix et les plats qui s\'affichent sur les grandes TV du restaurant. C\'est très facile, on va tout t\'expliquer étape par étape !',
    target: null
  },
  {
    emoji: '💰',
    title: 'Changer le prix d\'un plat',
    text:  'Tu vois cette petite case avec des chiffres ? C\'est le PRIX du plat ! Appuie dessus, efface le chiffre et tape le nouveau prix. Exemple : 9,50',
    target: '.price-input',
    pointer: '← LE PRIX EST LÀ !'
  },
  {
    emoji: '✏️',
    title: 'Modifier tous les détails',
    text:  'Ce petit crayon ouvre une fenêtre pour tout changer : le nom du plat, sa description, sa photo. Appuie dessus pour modifier un plat en détail !',
    target: '.btn-edit',
    pointer: '← APPUIE ICI !'
  },
  {
    emoji: '➕',
    title: 'Ajouter un nouveau plat',
    text:  'Ce bouton sert à créer un tout nouveau plat dans la liste. Tu remplis le nom, le prix, et il apparaît direct sur les TV !',
    target: '.cat-header .btn',
    pointer: '↑ AJOUTER UN PLAT ICI !'
  },
  {
    emoji: '🗑️',
    title: 'Supprimer un plat',
    text:  'Cette petite poubelle supprime un plat. Pas de panique ! Avant de supprimer, elle te demande de confirmer. Tu peux toujours annuler si tu te trompes !',
    target: '.btn-delete',
    pointer: '← SUPPRIMER ICI !'
  },
  {
    emoji: '💾',
    title: '⚠️ TRÈS IMPORTANT : Sauvegarder !',
    text:  'Après CHAQUE modification, cette barre rouge apparaît en bas. Tu DOIS appuyer sur "Sauvegarder" pour que ça s\'affiche sur les TV. Sans ça, rien ne change !',
    target: '#save-bar',
    pointer: '↓ APPUIE SUR SAUVEGARDER !',
    showSaveBar: true
  },
  {
    emoji: '🔍',
    title: 'Chercher un plat rapidement',
    text:  'Tu cherches le kebab ou les frites ? Tape le nom du plat ici et il apparaît directement. Pratique quand il y a beaucoup d\'articles !',
    target: '.search-input',
    pointer: '↑ CHERCHE UN PLAT ICI !'
  },
  {
    emoji: '🎉',
    title: 'Tu es prêt !',
    text:  'Bravo, tu sais tout ! Le plus important à retenir : après chaque changement de prix ou de plat, appuie toujours sur le bouton rouge SAUVEGARDER en bas de l\'écran !',
    target: null
  }
];

/* ── Affichage d'une étape ───────────────────────────────── */
function showTuto() {
  tutoStep = 0;
  var overlay = document.getElementById('tuto-overlay');
  if (overlay) overlay.style.display = 'block';
  applyTutoStep();
}

function applyTutoStep() {
  var step = tutoSteps[tutoStep];
  if (!step) { closeTuto(); return; }

  /* Contenu texte */
  setText('tuto-emoji',      step.emoji);
  setText('tuto-card-title', step.title);
  setText('tuto-card-text',  step.text);

  /* Bouton suivant */
  var btnNext = document.getElementById('tuto-btn-next');
  if (btnNext) btnNext.textContent = tutoStep === tutoSteps.length - 1 ? '✓ Terminer' : 'Suivant →';

  /* Bouton retour */
  var btnPrev = document.getElementById('tuto-btn-prev');
  if (btnPrev) btnPrev.style.visibility = tutoStep === 0 ? 'hidden' : 'visible';

  /* Dots */
  buildTutoDots();

  /* Barre de sauvegarde forcée */
  var bar = document.getElementById('save-bar');
  if (step.showSaveBar) {
    if (bar) bar.classList.add('visible');
    tutoForcedSaveBar = true;
  } else if (tutoForcedSaveBar && !hasPending()) {
    if (bar) bar.classList.remove('visible');
    tutoForcedSaveBar = false;
  }

  /* Spotlight */
  if (step.target) {
    var el = findVisibleEl(step.target);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      setTimeout(function() { positionTutoSpot(el, step.pointer || '← ICI !'); }, 450);
    } else {
      hideTutoSpot();
      centerTutoCard();
    }
  } else {
    hideTutoSpot();
    centerTutoCard();
  }
}

function buildTutoDots() {
  var row = document.getElementById('tuto-dots-row');
  if (!row) return;
  var html = '';
  for (var i = 0; i < tutoSteps.length; i++) {
    html += '<span class="tuto-dot' + (i === tutoStep ? ' active' : '') + '"></span>';
  }
  row.innerHTML = html;
}

function setText(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val || '';
}

/* Retourne le premier élément visible correspondant au sélecteur */
function findVisibleEl(selector) {
  var all = document.querySelectorAll(selector);
  for (var i = 0; i < all.length; i++) {
    if (all[i].offsetParent !== null) return all[i];
  }
  return all[0] || null;
}

/* ── Positionnement spotlight ────────────────────────────── */
function positionTutoSpot(target, pointerText) {
  var spot    = document.getElementById('tuto-spot');
  var card    = document.getElementById('tuto-card');
  var pointer = document.getElementById('tuto-pointer');
  var pArrow  = document.getElementById('tuto-pointer-arrow');
  var pLabel  = document.getElementById('tuto-pointer-label');
  if (!spot || !card) return;

  var rect = target.getBoundingClientRect();
  var pad  = 8;
  var vw   = window.innerWidth;
  var vh   = window.innerHeight;

  /* Spot */
  spot.style.display = 'block';
  spot.style.left   = (rect.left - pad) + 'px';
  spot.style.top    = (rect.top  - pad) + 'px';
  spot.style.width  = (rect.width  + pad * 2) + 'px';
  spot.style.height = (rect.height + pad * 2) + 'px';

  /* Pointer label */
  if (pointer && pLabel) {
    pointer.style.display = 'flex';
    pLabel.textContent    = pointerText;
    /* Flèche emoji selon direction */
    var arrowEmoji = '👆';
    if (pointerText.indexOf('↑') !== -1) arrowEmoji = '👆';
    else if (pointerText.indexOf('↓') !== -1) arrowEmoji = '👇';
    else if (pointerText.indexOf('←') !== -1) arrowEmoji = '👈';
    else if (pointerText.indexOf('→') !== -1) arrowEmoji = '👉';
    if (pArrow) pArrow.textContent = arrowEmoji;

    /* Position du label : juste à côté/au-dessus du spot */
    var pTop  = rect.top  - pad - 44;
    var pLeft = rect.left - pad;
    if (pTop < 60) pTop = rect.bottom + pad + 4;
    pointer.style.top  = pTop  + 'px';
    pointer.style.left = Math.max(8, Math.min(pLeft, vw - 200)) + 'px';
  }

  /* Carte tooltip : en dessous si espace, sinon en haut, sinon en bas fixe */
  var cardW = Math.min(340, vw - 32);
  var cardH = 260; /* hauteur estimée */
  var margin = 16;
  var cardLeft = Math.max(margin, Math.min(
    rect.left + rect.width / 2 - cardW / 2,
    vw - cardW - margin
  ));
  var cardTop;

  if (rect.bottom + margin + cardH < vh) {
    /* Sous le spot */
    cardTop = rect.bottom + margin;
  } else if (rect.top - margin - cardH > 0) {
    /* Au-dessus du spot */
    cardTop = rect.top - margin - cardH;
  } else {
    /* Fenêtre trop petite → colle en bas */
    cardTop = vh - cardH - margin;
    cardLeft = margin;
    cardW = Math.min(340, vw - margin * 2);
  }

  card.style.left  = cardLeft + 'px';
  card.style.top   = cardTop  + 'px';
  card.style.width = cardW    + 'px';
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
  var vw = window.innerWidth;
  var vh = window.innerHeight;
  var cardW = Math.min(340, vw - 32);
  card.style.width     = cardW + 'px';
  card.style.left      = ((vw - cardW) / 2) + 'px';
  card.style.top       = '50%';
  card.style.transform = 'translateY(-50%)';
}

/* ── Navigation ──────────────────────────────────────────── */
function tutoNext() {
  if (tutoStep < tutoSteps.length - 1) {
    tutoStep++;
    applyTutoStep();
  } else {
    closeTuto();
  }
}
function tutoPrev() {
  if (tutoStep > 0) { tutoStep--; applyTutoStep(); }
}
function closeTuto() {
  var overlay = document.getElementById('tuto-overlay');
  if (overlay) overlay.style.display = 'none';
  hideTutoSpot();
  /* Cacher la save bar si on l'avait forcée */
  if (tutoForcedSaveBar && !hasPending()) {
    var bar = document.getElementById('save-bar');
    if (bar) bar.classList.remove('visible');
    tutoForcedSaveBar = false;
  }
  try { localStorage.setItem('tuto_seen', '1'); } catch(e) {}
}

/* ── Sidebar toggle (mobile) ─────────────────────────────── */
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
  var pw = document.getElementById('login-pw');
  if (!pw) return;
  if (pw.value === ADMIN_PASS) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    isLoggedIn = true;
    fetchMenu();
    try {
      var seen = localStorage.getItem('tuto_seen');
      if (!seen) setTimeout(showTuto, 800);
    } catch(e) { setTimeout(showTuto, 800); }
  } else {
    showToast('Mot de passe incorrect', 'error');
    pw.classList.add('shake');
    setTimeout(function() { pw.classList.remove('shake'); }, 500);
    pw.value = '';
    pw.focus();
  }
}

/* ── Init ────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function() {

  /* Enter sur le champ mot de passe */
  var pw = document.getElementById('login-pw');
  if (pw) pw.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.keyCode === 13) doLogin();
  });

  /* Recherche */
  var searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.addEventListener('input', function() {
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

  /* Echap pour fermer les modales et le tutoriel */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.keyCode === 27) {
      closeModal('edit-modal');
      closeTuto();
    }
  });

  /* Recalcul position tuto si fenêtre redimensionnée */
  window.addEventListener('resize', function() {
    var overlay = document.getElementById('tuto-overlay');
    if (!overlay || overlay.style.display === 'none') return;
    applyTutoStep();
  });

  /* URL image en temps réel */
  var urlInput = document.getElementById('modal-url');
  if (urlInput) urlInput.addEventListener('input', previewModalImage);
});
