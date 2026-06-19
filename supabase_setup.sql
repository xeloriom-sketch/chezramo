-- ══════════════════════════════════════════════════════
-- CHEZ RAMO — Setup Supabase
-- Colle ce SQL dans : Supabase > SQL Editor > New Query
-- ══════════════════════════════════════════════════════

-- 1. Crée la table (ignoré si elle existe déjà)
CREATE TABLE IF NOT EXISTS menu_items (
  id          TEXT PRIMARY KEY,
  category    TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  price       TEXT NOT NULL,
  "menuPrice" TEXT,
  badge       TEXT,
  url         TEXT,
  sort_order  INTEGER DEFAULT 0
);

-- 2. Politiques d'accès public
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lecture publique"      ON menu_items;
DROP POLICY IF EXISTS "modification publique" ON menu_items;
DROP POLICY IF EXISTS "insertion publique"    ON menu_items;
DROP POLICY IF EXISTS "suppression publique"  ON menu_items;

CREATE POLICY "lecture publique"      ON menu_items FOR SELECT USING (true);
CREATE POLICY "modification publique" ON menu_items FOR UPDATE USING (true);
CREATE POLICY "insertion publique"    ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "suppression publique"  ON menu_items FOR DELETE USING (true);

-- 3. Insère / met à jour tous les articles
-- (ON CONFLICT = ne remplace pas ce qui existe déjà)
INSERT INTO menu_items (id, category, title, price, "menuPrice", badge, url, sort_order) VALUES

-- Sandwichs Vedettes
('kebab',        'Sandwichs Vedettes', 'Kebab',        '9,00',  '12,00', NULL,    'uploads/Kebab.png',           1),
('kebab-frites', 'Sandwichs Vedettes', 'Kebab Frites', '9,50',  NULL,    NULL,    'uploads/Kebab Frites.png',    2),
('kebab-geant',  'Sandwichs Vedettes', 'Kebab Géant',  '15,00', '17,00', 'XXL',   'uploads/Kebab Geant.png',     3),

-- Nos Spécialités
('kofte',     'Nos Specialites', 'Kofte',     '9,00', '12,00', NULL, 'uploads/Americain.png', 10),
('americain', 'Nos Specialites', 'Américain', '9,00', '12,00', NULL, 'uploads/Kofte.png',     11),
('escalope',  'Nos Specialites', 'Escalope',  '9,00', '12,00', NULL, 'uploads/Escalope.png',  12),

-- Tradition & Galettes
('miche-kebab', 'Tradition & Galettes', 'Miche Kebab', '9,00', '12,00', NULL, 'uploads/Miche Kebab.png', 20),
('galette',     'Tradition & Galettes', 'Galette',     '9,00', '12,00', NULL, 'uploads/Galette.png',     21),
('cordon-bleu', 'Tradition & Galettes', 'Cordon Bleu', '9,00', '12,00', NULL, 'uploads/Cordon Bleu.png', 22),

-- Tacos
('tacos',      'Tacos', 'Tacos',      '10,00', '13,00', NULL,   'uploads/Tacos.png',      30),
('maxi-tacos', 'Tacos', 'Maxi Tacos', '15,00', '17,00', 'MAXI', 'uploads/Maxi Tacos.png', 31),

-- Assiettes Gourmet
('assiette-kebab',    'Assiettes Gourmet', 'Assiette Kebab',    '15,00', NULL, NULL, 'uploads/Assiette Kebab.png',    40),
('assiette-escalope', 'Assiettes Gourmet', 'Assiette Escalope', '15,00', NULL, NULL, 'uploads/Assiette Escalope.png', 41),
('assiette-kofte',    'Assiettes Gourmet', 'Assiette Kofte',    '15,00', NULL, NULL, 'uploads/Assiette Kofte.png',    42),

-- Assiettes Gourmet Suite
('assiette-steak',  'Assiettes Gourmet (Suite)', 'Assiette Steak',       '15,00', NULL, NULL,    'uploads/Assiette Steak.png',       50),
('assiette-cordon', 'Assiettes Gourmet (Suite)', 'Assiette Cordon Bleu', '15,00', NULL, NULL,    'uploads/Assiette Cordon Bleu.png', 51),
('assiette-mixte',  'Assiettes Gourmet (Suite)', 'Assiette Mixte',       '18,00', NULL, 'MIXTE', 'uploads/Assiette Mixte.png',       52),

-- Assiettes & Salade
('assiette-enfant',   'Assiettes & Salade', 'Assiette Enfant',   '12,00', NULL, NULL, 'uploads/Assiette Enfant.png',   60),
('assiette-emporter', 'Assiettes & Salade', 'Assiette Emporter', '15,00', NULL, NULL, 'uploads/Assiette Emporter.png', 61),
('salade-berger',     'Assiettes & Salade', 'Salade du Berger',  '10,00', NULL, NULL, 'uploads/Salade du Berger.png',  62),

-- Burgers
('chicken-burger', 'Burgers', 'Chicken Burger', '6,00', '9,00', NULL, 'uploads/Chicken Burger.png', 70),
('cheese-burger',  'Burgers', 'Cheese Burger',  '6,00', '9,00', NULL, 'uploads/Cheese Burger.png',  71),
('fish-burger',    'Burgers', 'Fish Burger',    '6,00', '9,00', NULL, 'uploads/Fish Burger.png',    72),

-- Finger Food
('nuggets', 'Finger Food', 'Nuggets (x7)', '8,50', NULL, NULL, 'uploads/Nuggets (x7).png', 80),
('wings',   'Finger Food', 'Wings (x4)',   '7,50', NULL, NULL, 'uploads/Wings (x8).png',   81),
('tenders', 'Finger Food', 'Tenders (x4)', '7,50', NULL, NULL, 'uploads/Tenders (x4).png', 82),

-- Boissons
('boissons-33cl', 'Boissons & Boissons Chaudes', 'Boissons 33cl', '2,00', NULL, NULL, 'uploads/Boissons 33cl.png', 90),
('cafe',          'Boissons & Boissons Chaudes', 'Café',           '1,50', NULL, NULL, 'uploads/Café.png',          91),
('the',           'Boissons & Boissons Chaudes', 'Thé',            '1,50', NULL, NULL, 'uploads/Thé.png',           92),

-- Accompagnements
('frites',    'Accompagnements & Sauces', 'Frites',           '2,00',   NULL, NULL,       'uploads/Frites.png',    100),
('barquette', 'Accompagnements & Sauces', 'Barquette Viande', '10,00',  NULL, NULL,       'uploads/Barquette.png', 101),
('sauces',    'Accompagnements & Sauces', 'Nos Sauces',       'OFFERT', NULL, 'AU CHOIX', 'uploads/Nos Sauces.png',102),

-- Salades Fraîches
('salade-grecque', 'Salades Fraîches', 'Salade Grecque',   '6,00',  NULL, NULL, 'uploads/Salade_Grecque.png',   110),
('salade-shope',   'Salades Fraîches', 'Salade Shope',     '6,00',  NULL, NULL, 'uploads/Salade_Shope.png',     111),
('salade-poulet',  'Salades Fraîches', 'Salade de Poulet', '12,00', NULL, NULL, 'uploads/Salade_de_Poulet.png', 112),

-- Salades & Burek
('salade-boeuf',   'Salades & Burek', 'Salade de Boeuf', '13,00', NULL, NULL, 'uploads/Salade_de_Boeuf.png', 120),
('burek-fromage',  'Salades & Burek', 'Burek Fromage',   '3,50',  NULL, NULL, 'uploads/Burek_Fromage.png',   121),
('burek-epinards', 'Salades & Burek', 'Burek Épinards',  '3,50',  NULL, NULL, 'uploads/Burek_Épinards.png',  122),

-- Burek & Spécialités
('burek-viande', 'Burek & Spécialités', 'Burek Viande', '4,00', NULL, NULL, 'uploads/Burek_Viande.png', 130),
('fli-flija',    'Burek & Spécialités', 'Fli - Flija',  '4,00', NULL, NULL, 'uploads/Fli_-_Flija.png',  131),
('makarona',     'Burek & Spécialités', 'Makarona',     '8,50', NULL, NULL, 'uploads/Makarona.png',     132),

-- Plats Maison
('escalope-creme', 'Plats Maison', 'Escalope Crème',  '12,50', NULL, NULL, 'uploads/Escalope_Crème.png',  140),
('filet-poulet',   'Plats Maison', 'Filet de Poulet', '12,00', NULL, NULL, 'uploads/Filet_de_Poulet.png', 141),
('pleskavice',     'Plats Maison', 'Pleskavice',      '9,50',  NULL, NULL, 'uploads/Pleskavice.png',      142),

-- Qofte Grillées
('qofte-x5',  'Qofte Grillées', 'Qofte x5',  '9,00',  NULL, NULL, 'uploads/Qofte_x5.png',  150),
('qofte-x7',  'Qofte Grillées', 'Qofte x7',  '11,00', NULL, NULL, 'uploads/Qofte_x7.png',  151),
('qofte-x10', 'Qofte Grillées', 'Qofte x10', '13,00', NULL, NULL, 'uploads/Qofte_x10.png', 152),

-- Grillades (slide séparé : 3 items max)
('grillade',       'Grillades', 'Grillade 2 pers.', '39,00', NULL, '2 PERS', 'uploads/Menu_Grillade.png', 160),
('grillade-4pers', 'Grillades', 'Grillade 4 pers.', '79,00', NULL, '4 PERS', 'uploads/Menu_Grillade.png', 161),
('grillade-6pers', 'Grillades', 'Grillade 6 pers.', '99,00', NULL, '6 PERS', 'uploads/Menu_Grillade.png', 162),

-- Desserts (slide séparé : 2 items)
('trilece',  'Desserts', 'Trilece',  '3,50', NULL, NULL, 'uploads/Trilece.png',  163),
('tiramisu', 'Desserts', 'Tiramisu', '3,50', NULL, NULL, 'uploads/Tiramisu.png', 164)

ON CONFLICT (id) DO NOTHING;

-- Menu Enfants (nouvelle section)
INSERT INTO menu_items (id, category, title, description, price, "menuPrice", badge, url, sort_order) VALUES
('menu-enfant-combo',    'Menu Enfants', 'Menu Enfant',     '4 Nuggets ou viande au choix',      '10,00', NULL,    'AU CHOIX', 'uploads/Assiette Enfant.png', 169),
('menu-enfant-assiette', 'Menu Enfants', 'Assiette Enfant', 'Frites, viande et sauce au choix',  '12,00', NULL,    NULL,       'uploads/Assiette Enfant.png', 170),
('menu-enfant-burger',   'Menu Enfants', 'Mini Burger',     'Pain, steak haché, fromage, sauce', '6,00',  NULL,    NULL,       'uploads/Chicken Burger.png',  171)
ON CONFLICT (id) DO NOTHING;
