
/* ══════════════════════════════════════════════
   DONNÉES MENU
══════════════════════════════════════════════ */
var SLIDES = [
  { cat:"Sandwichs Vedettes", info:"Veau 100% Maison | Pain Artisanal", items:[
    { name:"Kebab",        desc:"Pain rond, veau maison, crudités",        price:"9,00",  menu:"12,00", img:"/uploads/Kebab.png" },
    { name:"Kebab Frites", desc:"Viande et frites servis dans le pain",    price:"9,50",               img:"/uploads/Kebab Frites.png" },
    { name:"Kebab Géant",  desc:"Double portion de viande de veau",        price:"15,00", menu:"17,00", badge:"XXL", img:"/uploads/Kebab Geant.png" }
  ]},
  { cat:"Nos Spécialités", info:"Servis Seul ou en Menu (+3,00€)", items:[
    { name:"Kofte",     desc:"Boulettes de viande hachée épicées", price:"9,00", menu:"12,00", img:"/uploads/Americain.png" },
    { name:"Américain", desc:"Steak haché et cheddar fondu",       price:"9,00", menu:"12,00", img:"/uploads/Kofte.png" },
    { name:"Escalope",  desc:"Filet de poulet pané maison",        price:"9,00", menu:"12,00", img:"/uploads/Escalope.png" }
  ]},
  { cat:"Tradition & Galettes", info:"Pain miche ou galette fine au choix", items:[
    { name:"Miche Kebab", desc:"Pain miche traditionnel croustillant", price:"9,00", menu:"12,00", img:"/uploads/Miche Kebab.png" },
    { name:"Galette",     desc:"Dürum : fine galette roulée",          price:"9,00", menu:"12,00", img:"/uploads/Galette.png" },
    { name:"Cordon Bleu", desc:"Sandwich au cordon bleu fondant",      price:"9,00", menu:"12,00", img:"/uploads/Cordon Bleu.png" }
  ]},
  { cat:"Tacos", info:"Viande au choix : Kebab, Escalope, Kofte, Steak...", items:[
    { name:"Tacos",      desc:"Sauce fromagère et frites incluses", price:"10,00", menu:"13,00", img:"/uploads/Tacos.png" },
    { name:"Maxi Tacos", desc:"Format géant avec 2 viandes",        price:"15,00", menu:"17,00", badge:"MAXI", img:"/uploads/Maxi Tacos.png" }
  ]},
  { cat:"Assiettes Gourmet", info:"Inclus : frites, blé et crudités fraîches", items:[
    { name:"Assiette Kebab",    desc:"Veau maison servi à l'assiette", price:"15,00", img:"/uploads/Assiette Kebab.png" },
    { name:"Assiette Escalope", desc:"Poulet pané ou grillé",          price:"15,00", img:"/uploads/Assiette Escalope.png" },
    { name:"Assiette Kofte",    desc:"Boulettes maison grillées",      price:"15,00", img:"/uploads/Assiette Kofte.png" }
  ]},
  { cat:"Assiettes Gourmet (Suite)", info:"Accompagnements frais tous les jours", items:[
    { name:"Assiette Steak",       desc:"Steaks hachés grillés minute",  price:"15,00", img:"/uploads/Assiette Steak.png" },
    { name:"Assiette Cordon Bleu", desc:"Deux cordons bleus fondants",   price:"15,00", img:"/uploads/Assiette Cordon Bleu.png" },
    { name:"Assiette Mixte",       desc:"Kebab + 2 viandes au choix",    price:"18,00", badge:"MIXTE", img:"/uploads/Assiette Mixte.png" }
  ]},
  { cat:"Assiettes & Salade", info:"Produits frais et de qualité", items:[
    { name:"Assiette Enfant",   desc:"Frites + viandes",                price:"12,00", img:"/uploads/Assiette Enfant.png" },
    { name:"Assiette Emporter", desc:"Format pratique (Mixte: 18,00€)", price:"15,00", img:"/uploads/Assiette Emporter.png" },
    { name:"Salade du Berger",  desc:"Crudités, feta et olives",        price:"10,00", img:"/uploads/Salade du Berger.png" }
  ]},
  { cat:"Burgers", info:"Servis seuls ou en menu avec frites + boisson", items:[
    { name:"Chicken Burger", desc:"Poulet croustillant et cheddar", price:"6,00", menu:"9,00", img:"/uploads/Chicken Burger.png" },
    { name:"Cheese Burger",  desc:"Steak haché et fromage fondu",   price:"6,00", menu:"9,00", img:"/uploads/Cheese Burger.png" },
    { name:"Fish Burger",    desc:"Poisson pané et sauce tartare",  price:"6,00", menu:"9,00", img:"/uploads/Fish Burger.png" }
  ]},
  { cat:"Finger Food", info:"À partager ou en accompagnement", items:[
    { name:"Nuggets (x7)", desc:"Filets de poulet frits dorés",   price:"8,50", img:"/uploads/Nuggets (x7).png" },
    { name:"Wings (x4)",   desc:"Ailerons de poulet épicés",      price:"7,50", img:"/uploads/Wings (x8).png" },
    { name:"Tenders (x4)", desc:"Aiguillettes de poulet tendres", price:"7,50", img:"/uploads/Tenders (x4).png" }
  ]},
  { cat:"Boissons & Boissons Chaudes", info:"Fraîches ou chaudes selon votre envie", items:[
    { name:"Boissons 33cl", desc:"Coca, Fanta, Oasis, Perrier...", price:"2,00", img:"/uploads/Boissons 33cl.png" },
    { name:"Café",          desc:"Café expresso moulu minute",     price:"1,50", img:"/uploads/Café.png" },
    { name:"Thé",           desc:"Thé à la menthe ou nature",      price:"1,50", img:"/uploads/Thé.png" }
  ]},
  { cat:"Accompagnements & Sauces", info:"Pour compléter votre repas", items:[
    { name:"Frites",     desc:"Petite: 2,00€ | Grande: 3,00€",                                 price:"2,00",    img:"/uploads/Frites.png" },
    { name:"Barquette",  desc:"Portion de veau 100% maison",                                   price:"10,00",   img:"/uploads/Barquette.png" },
    { name:"Nos Sauces", desc:"Algérienne, Blanche, Samouraï... Incluse avec sandwich ou menu", price:"",  supp:"0,50", badge:"AU CHOIX", img:"/uploads/Nos Sauces.png" }
  ]},
  { cat:"Salades Fraîches", info:"Préparées chaque matin avec des produits frais", items:[
    { name:"Salade Grecque",   desc:"Tomates, concombres, olives, feta, oignons", price:"6,00",  img:"/uploads/Salade_Grecque.png" },
    { name:"Salade Shope",     desc:"Saladerie fraîche maison",                   price:"6,00",  img:"/uploads/Salade_Shope.png" },
    { name:"Salade de Poulet", desc:"Poulet grillé, frites et crudités",          price:"12,00", img:"/uploads/Salade_de_Poulet.png" }
  ]},
  { cat:"Salades & Burek", info:"Nos spécialités maison", items:[
    { name:"Salade de Boeuf", desc:"Viande de bœuf, frites et crudités",  price:"13,00", img:"/uploads/Salade_de_Boeuf.png" },
    { name:"Burek Fromage",   desc:"Burek au fromage, feuilleté maison",   price:"3,50",  img:"/uploads/Burek_Fromage.png" },
    { name:"Burek Épinards",  desc:"Burek aux épinards et fromage",        price:"3,50",  img:"/uploads/Burek_Épinards.png" }
  ]},
  { cat:"Burek & Spécialités", info:"Recettes traditionnelles maison", items:[
    { name:"Burek Viande", desc:"Burek à la viande, feuilleté croustillant", price:"4,00", img:"/uploads/Burek_Viande.png" },
    { name:"Fli - Flija",  desc:"Fli traditionnel maison",                   price:"4,00", img:"/uploads/Fli_-_Flija.png" },
    { name:"Makarona",     desc:"Penne, sauce tomate, fromage râpé",         price:"8,50", img:"/uploads/Makarona.png" }
  ]},
  { cat:"Plats Maison", info:"Cuisinés chaque jour avec amour", items:[
    { name:"Escalope Crème",  desc:"Poulet à la crème, champignons, légumes",                   price:"12,50", img:"/uploads/Escalope_Crème.png" },
    { name:"Filet de Poulet", desc:"Frites, fromage, tomate, salade de choux, sauce blanche",   price:"12,00", img:"/uploads/Filet_de_Poulet.png" },
    { name:"Pleskavice",      desc:"Frites, fromage, tomate, salade de choux, sauce blanche",   price:"9,50",  img:"/uploads/Pleskavice.png" }
  ]},
  { cat:"Qofte Grillées", info:"Boulettes maison grillées à la commande", items:[
    { name:"Qofte x5",  desc:"5 boulettes grillées maison",  price:"9,00",  img:"/uploads/Qofte_x5.png" },
    { name:"Qofte x7",  desc:"7 boulettes grillées maison",  price:"11,00", img:"/uploads/Qofte_x7.png" },
    { name:"Qofte x10", desc:"10 boulettes grillées maison", price:"13,00", img:"/uploads/Qofte_x10.png" }
  ]},
  { cat:"Grillades", info:"Plateau : agneau, escalope, entrecôte, suxhuk, salade grecque, frites", items:[
    { name:"Grillade 2 pers.", desc:"Plateau complet pour 2 personnes", price:"39,00", badge:"2 PERS", img:"/uploads/Menu_Grillade.png" },
    { name:"Grillade 4 pers.", desc:"Plateau complet pour 4 personnes", price:"79,00", badge:"4 PERS", img:"/uploads/Menu_Grillade.png" },
    { name:"Grillade 6 pers.", desc:"Plateau complet pour 6 personnes", price:"99,00", badge:"6 PERS", img:"/uploads/Menu_Grillade.png" }
  ]},
  { cat:"Desserts", info:"Douceurs maison", items:[
    { name:"Trilece",  desc:"Dessert traditionnel au lait", price:"3,50", img:"/uploads/Trilece.png" },
    { name:"Tiramisu", desc:"Tiramisu maison",              price:"3,50", img:"/uploads/Tiramisu.png" }
  ]}
];

/* ══════════════════════════════════════════════
   CANVAS DIMENSIONS
══════════════════════════════════════════════ */
var CW = 1920, CH = 1080;

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function loadImg(src) {
  return new Promise(function(res) {
    var i = new Image();
    i.onload  = function(){ res(i); };
    i.onerror = function(){ res(null); };
    i.src = src;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);   ctx.arcTo(x+w, y,   x+w, y+r,   r);
  ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
  ctx.lineTo(x+r, y+h);   ctx.arcTo(x,   y+h, x,   y+h-r, r);
  ctx.lineTo(x,   y+r);   ctx.arcTo(x,   y,   x+r, y,     r);
  ctx.closePath();
}

function fitText(ctx, text, maxW, font, startSize) {
  var size = startSize;
  ctx.font = 'bold ' + size + 'px ' + font;
  while (ctx.measureText(text).width > maxW && size > 16) {
    size -= 2;
    ctx.font = 'bold ' + size + 'px ' + font;
  }
  return size;
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  var words = text.split(' ');
  var line  = '';
  var lines = 0;
  for (var n = 0; n < words.length; n++) {
    var test = line + words[n] + ' ';
    if (ctx.measureText(test).width > maxW && n > 0) {
      ctx.fillText(line.trim(), x, y);
      y += lineH; line = words[n] + ' '; lines++;
      if (lines >= 2) break;
    } else { line = test; }
  }
  if (line.trim()) ctx.fillText(line.trim(), x, y);
}

/* ══════════════════════════════════════════════
   DRAW ONE SLIDE  — rendu identique au menu live
══════════════════════════════════════════════ */
function drawSlide(canvas, slide, images) {
  var ctx = canvas.getContext('2d');
  canvas.width  = CW;
  canvas.height = CH;

  /* ── Fond #060606 + lueur rouge (identique menu live) */
  ctx.fillStyle = '#060606';
  ctx.fillRect(0, 0, CW, CH);
  var rg = ctx.createRadialGradient(CW/2, CH*0.4, 0, CW/2, CH*0.4, CW*0.45);
  rg.addColorStop(0, 'rgba(224,16,16,0.055)');
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, CW, CH);

  /* ── Header (7vw = 134px, dégradé noir) */
  var headerH = 134;
  var padX    = 67;   /* 3.5vw */
  var hg = ctx.createLinearGradient(0, 0, 0, headerH);
  hg.addColorStop(0, 'rgba(0,0,0,0.98)');
  hg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, CW, headerH);

  /* Brand CHEZ RAMO (5.5vw = 106px) */
  ctx.font         = 'bold 106px Impact, Arial Black, Arial';
  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'left';
  ctx.fillStyle    = '#ffffff';
  var chezW = ctx.measureText('CHEZ ').width;
  ctx.fillText('CHEZ ', padX, headerH / 2);
  ctx.fillStyle   = '#e01010';
  ctx.shadowColor = 'rgba(224,16,16,0.6)';
  ctx.shadowBlur  = 18;
  ctx.fillText('RAMO', padX + chezW, headerH / 2);
  ctx.shadowBlur  = 0;
  ctx.shadowColor = 'transparent';


  /* ── Ligne catégorie : titre + ligne rouge (même rangée, comme le flex du menu) */
  var catFont    = 'Impact, Arial Black, Arial';
  var catTitleSz = 71;   /* 3.7vw */
  var catRowY    = headerH + 17;  /* 0.9vw slide-padding-top */

  ctx.fillStyle    = '#ffffff';
  ctx.textBaseline = 'top';
  ctx.textAlign    = 'left';
  fitText(ctx, slide.cat.toUpperCase(), CW * 0.58, catFont, catTitleSz);
  ctx.fillText(slide.cat.toUpperCase(), padX, catRowY);
  var titleW = ctx.measureText(slide.cat.toUpperCase()).width;

  /* Ligne rouge dégradée (après le titre, centrée verticalement) */
  var lnX = padX + titleW + 27;   /* 1.4vw gap */
  var lnW = CW - padX - lnX;
  var lnY = catRowY + catTitleSz / 2 - 1;
  if (lnW > 0) {
    var lg = ctx.createLinearGradient(lnX, 0, lnX + lnW, 0);
    lg.addColorStop(0,   '#e01010');
    lg.addColorStop(0.6, 'rgba(224,16,16,0.1)');
    lg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(lnX, lnY, lnW, 3);
  }

  /* Info catégorie (1.35vw = 26px, rouge gras, comme le menu) */
  var catInfoY = catRowY + catTitleSz + 9;  /* 0.45vw margin-bottom du cat-header */
  if (slide.info) {
    ctx.fillStyle    = '#e01010';
    ctx.font         = 'bold 26px Arial, sans-serif';
    ctx.textBaseline = 'top';
    ctx.textAlign    = 'left';
    /* Troncature si texte trop long */
    var infoMaxW = CW - padX * 2;
    var infoTxt  = slide.info.toUpperCase();
    if (ctx.measureText(infoTxt).width > infoMaxW) {
      while (infoTxt.length > 0 && ctx.measureText(infoTxt + '…').width > infoMaxW)
        infoTxt = infoTxt.slice(0, -1);
      infoTxt += '…';
    }
    ctx.fillText(infoTxt, padX, catInfoY);
  }

  /* ── Grille de cartes */
  var cardsTop = catInfoY + 26 + 23;   /* info-height + 0.6vw margin + 14px */
  var cardsBot = CH - 12;
  var cardsH   = cardsBot - cardsTop;
  var gapX     = 13;                   /* 0.7vw gap entre cartes */
  var n        = slide.items.length;
  var cardW    = Math.floor((CW - padX * 2 - gapX * (n - 1)) / n);
  var imgH     = Math.floor(cardsH * 0.55);   /* 55% image comme le CSS */
  var bodyH    = cardsH - imgH;

  /* Padding du card-body calé sur le CSS : 1.0vw/1.4vw/0.9vw */
  var bPadT = 19;   /* 1.0vw top  */
  var bPadX = 27;   /* 1.4vw côtés */
  var bPadB = 17;   /* 0.9vw bas   */

  for (var i = 0; i < n; i++) {
    var item = slide.items[i];
    var img  = images[i];
    var cx   = padX + i * (cardW + gapX);
    var cy   = cardsTop;
    var cr   = 21;   /* 1.1vw border-radius */

    /* Ombre carte */
    ctx.shadowColor   = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur    = 28;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle     = '#141414';   /* même que le CSS */
    roundRect(ctx, cx, cy, cardW, cardsH, cr);
    ctx.fill();
    ctx.shadowBlur    = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor   = 'transparent';

    /* Bordure subtile */
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth   = 1;
    roundRect(ctx, cx, cy, cardW, cardsH, cr);
    ctx.stroke();

    /* ── Image (object-fit cover) */
    ctx.save();
    roundRect(ctx, cx, cy, cardW, imgH, cr);
    ctx.clip();
    if (img) {
      var sc = Math.max(cardW / img.width, imgH / img.height);
      ctx.drawImage(img,
        cx + (cardW - img.width  * sc) / 2,
        cy + (imgH  - img.height * sc) / 2,
        img.width * sc, img.height * sc);
    } else {
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(cx, cy, cardW, imgH);
    }
    /* Dégradé bas image (comme .card-img::after) */
    var fG = ctx.createLinearGradient(0, cy + imgH * 0.7, 0, cy + imgH);
    fG.addColorStop(0, 'rgba(0,0,0,0)');
    fG.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = fG;
    ctx.fillRect(cx, cy, cardW, imgH);
    ctx.restore();

    /* Badge (1.3vw = 25px, coin haut-droit) */
    if (item.badge) {
      ctx.font = 'bold 25px Impact, Arial Black, Arial';
      var bW  = ctx.measureText(item.badge).width + 28;
      var bH  = 35;
      var bX  = cx + cardW - 15 - bW;
      var bY  = cy + 15;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur  = 8;
      ctx.fillStyle   = '#e01010';
      roundRect(ctx, bX, bY, bW, bH, 9);
      ctx.fill();
      ctx.shadowBlur   = 0;
      ctx.shadowColor  = 'transparent';
      ctx.fillStyle    = '#ffffff';
      ctx.textBaseline = 'middle';
      ctx.textAlign    = 'center';
      ctx.fillText(item.badge, bX + bW / 2, bY + bH / 2);
      ctx.textAlign = 'left';
    }

    /* ── Corps de la carte */
    var bodyY = cy + imgH;
    var textX = cx + bPadX;
    var textW = cardW - bPadX * 2;

    /* Nom (3.1vw = 60px, Impact majuscules) */
    ctx.fillStyle    = '#ffffff';
    ctx.textBaseline = 'top';
    ctx.textAlign    = 'left';
    var nameSize = fitText(ctx, item.name, textW, 'Impact, Arial Black, Arial', 60);
    ctx.fillText(item.name, textX, bodyY + bPadT);

    /* Description (1.45vw = 28px, opacité 0.75, 2 lignes max) */
    var descH = 0;
    if (item.desc) {
      ctx.font = '28px Arial, sans-serif';
      /* Compter le nombre réel de lignes (1 ou 2) pour positionner les prix */
      var dWords = item.desc.split(' '), dLine = '', dCount = 1;
      for (var dw = 0; dw < dWords.length; dw++) {
        var dTest = dLine + dWords[dw] + ' ';
        if (ctx.measureText(dTest).width > textW && dw > 0) {
          dLine = dWords[dw] + ' '; dCount++;
          if (dCount >= 2) break;
        } else { dLine = dTest; }
      }
      descH = dCount * 44;

      ctx.fillStyle    = 'rgba(255,255,255,0.75)';
      ctx.textBaseline = 'top';
      wrapText(ctx, item.desc, textX, bodyY + bPadT + nameSize + 10, textW, 44);
    }

    /* ── Prix — ancrés juste sous le texte (plus de grande marche) */
    var contentBottom = bodyY + bPadT + nameSize + (descH > 0 ? 10 + descH : 0);
    var priceBaseY    = Math.min(contentBottom + 114, bodyY + bodyH - bPadB - 6);
    var priceSepY     = priceBaseY - 96;

    /* Séparateur dégradé rouge (comme .prices::before) */
    var sg = ctx.createLinearGradient(textX, 0, textX + textW, 0);
    sg.addColorStop(0,   'rgba(224,16,16,0.5)');
    sg.addColorStop(0.5, 'rgba(224,16,16,0.1)');
    sg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(textX, priceSepY, textW, 1);

    var noMain = !item.price || item.price === '' || item.price === 'INCLUSE';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign    = 'left';

    if (!noMain) {
      var parts = item.price.indexOf(',') >= 0 ? item.price.split(',') : [item.price, '00'];

      /* Label SEUL (1.25vw = 24px Impact) */
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font      = 'bold 24px Impact, Arial Black, Arial';
      ctx.fillText('SEUL', textX, priceBaseY - 74);

      /* Entier du prix (4.1vw = 79px) */
      ctx.fillStyle = '#ffffff';
      ctx.font      = 'bold 79px Impact, Arial Black, Arial';
      ctx.fillText(parts[0], textX, priceBaseY);
      var intW = ctx.measureText(parts[0]).width;

      /* Centimes en exposant (52% de 79 ≈ 41px, levés de 38px) */
      var supSz = Math.round(79 * 0.52);
      ctx.fillStyle = '#e01010';
      ctx.font      = 'bold ' + supSz + 'px Impact, Arial Black, Arial';
      ctx.fillText(',' + parts[1] + '€', textX + intW, priceBaseY - 38);
      var centsW = ctx.measureText(',' + parts[1] + '€').width;

      /* Prix menu (4.5vw = 86px) */
      if (item.menu) {
        var mp = item.menu.indexOf(',') >= 0 ? item.menu.split(',') : [item.menu, '00'];
        var mx = textX + intW + centsW + 24;

        ctx.fillStyle = '#e01010';
        ctx.font      = 'bold 24px Impact, Arial Black, Arial';
        ctx.fillText('MENU', mx, priceBaseY - 74);

        ctx.font      = 'bold 86px Impact, Arial Black, Arial';
        ctx.fillText(mp[0], mx, priceBaseY);
        var mIntW = ctx.measureText(mp[0]).width;

        var mSupSz = Math.round(86 * 0.52);
        ctx.font      = 'bold ' + mSupSz + 'px Impact, Arial Black, Arial';
        ctx.fillText(',' + mp[1] + '€', mx + mIntW, priceBaseY - 41);
      }

    } else if (item.supp) {
      /* Supplément sauces (3.0vw ≈ 58px) */
      var sp = item.supp.indexOf(',') >= 0 ? item.supp.split(',') : [item.supp, '00'];
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font      = 'bold 24px Impact, Arial Black, Arial';
      ctx.fillText('SUPP.', textX, priceBaseY - 66);

      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font      = 'bold 58px Impact, Arial Black, Arial';
      ctx.fillText('+' + sp[0], textX, priceBaseY);
      var spW = ctx.measureText('+' + sp[0]).width;

      var spSupSz = Math.round(58 * 0.52);
      ctx.fillStyle = 'rgba(255,255,255,0.55)';
      ctx.font      = 'bold ' + spSupSz + 'px Impact, Arial Black, Arial';
      ctx.fillText(',' + sp[1] + '€', textX + spW, priceBaseY - 27);
    }
  }

  /* ── Barre de progression (bas de l'écran, comme le menu live) */
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(0, CH - 5, CW, 5);
  ctx.fillStyle = '#e01010';
  ctx.fillRect(0, CH - 5, CW, 5);
}

/* ══════════════════════════════════════════════
   GENERATE ALL
══════════════════════════════════════════════ */
var generatedCanvases = [];

async function generateAll() {
  var btn    = document.getElementById('btn-gen');
  var dlBtn  = document.getElementById('btn-dl');
  var status = document.getElementById('status');
  var prog   = document.getElementById('prog-bar');
  var progW  = document.getElementById('prog-wrap');
  var grid   = document.getElementById('grid');

  btn.disabled   = true;
  btn.textContent = '⏳ Génération en cours…';
  progW.style.display = 'block';
  grid.innerHTML = '';
  generatedCanvases = [];

  for (var i = 0; i < SLIDES.length; i++) {
    var slide = SLIDES[i];
    var pct   = Math.round((i / SLIDES.length) * 100);
    prog.style.width = pct + '%';
    status.textContent = 'Génération diapo ' + (i+1) + '/' + SLIDES.length + ' : ' + slide.cat + '…';

    /* Load images for this slide */
    var images = [];
    for (var j = 0; j < slide.items.length; j++) {
      images.push(await loadImg(slide.items[j].img));
    }

    /* Draw */
    var canvas = document.createElement('canvas');
    drawSlide(canvas, slide, images);
    generatedCanvases.push({ canvas: canvas, name: String(i+1).padStart(2,'0') + '-' + slide.cat.replace(/[^a-zA-Z0-9]/g,'-') + '.png' });

    /* Preview card */
    var num = String(i+1).padStart(2,'0');
    var card = document.createElement('div');
    card.className = 'slide-card';
    var previewCanvas = document.createElement('canvas');
    previewCanvas.width  = 640;
    previewCanvas.height = 360;
    var pCtx = previewCanvas.getContext('2d');
    pCtx.drawImage(canvas, 0, 0, 640, 360);
    card.appendChild(previewCanvas);

    var footer = document.createElement('div');
    footer.className = 'slide-card-footer';
    footer.innerHTML = '<span>' + num + '. ' + slide.cat + '</span>';

    var a = document.createElement('a');
    a.className = 'dl-btn';
    a.textContent = '⬇ PNG';
    a.download = generatedCanvases[i].name;
    a.href = canvas.toDataURL('image/png');
    footer.appendChild(a);
    card.appendChild(footer);
    grid.appendChild(card);
  }

  prog.style.width = '100%';
  status.textContent = '✓ ' + SLIDES.length + ' diapos générées ! Télécharge-les et copie-les sur ta clé USB.';
  btn.disabled    = false;
  btn.textContent = '↺ Regénérer';
  dlBtn.style.display = 'inline-block';
}

/* ══════════════════════════════════════════════
   DOWNLOAD ALL (un par un via timeout)
══════════════════════════════════════════════ */
function downloadAll() {
  if (!generatedCanvases.length) { alert('Génère les diapos d\'abord !'); return; }
  var i = 0;
  function dlNext() {
    if (i >= generatedCanvases.length) return;
    var item = generatedCanvases[i++];
    var a = document.createElement('a');
    a.download = item.name;
    a.href = item.canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(dlNext, 400);
  }
  dlNext();
}

/* padStart polyfill */
if (!String.prototype.padStart) {
  String.prototype.padStart = function(len,fill){
    var s=String(this);fill=fill||' ';
    while(s.length<len)s=fill+s;return s;
  };
}


document.addEventListener('DOMContentLoaded', function() {
  var btnGen = document.getElementById('btn-gen');
  var btnDl  = document.getElementById('btn-dl');
  if (btnGen) btnGen.addEventListener('click', generateAll);
  if (btnDl)  btnDl.addEventListener('click', downloadAll);
});
