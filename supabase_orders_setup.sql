-- ══════════════════════════════════════════════════════
-- CHEZ RAMO — Table des commandes en ligne
-- Colle ce SQL dans : Supabase > SQL Editor > New Query
-- ══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS orders (
  id          BIGSERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL,
  items       JSONB NOT NULL,
  total       NUMERIC(10,2) NOT NULL,
  status      TEXT DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lecture publique"      ON orders;
DROP POLICY IF EXISTS "insertion publique"    ON orders;
DROP POLICY IF EXISTS "modification publique" ON orders;

CREATE POLICY "lecture publique"      ON orders FOR SELECT USING (true);
CREATE POLICY "insertion publique"    ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "modification publique" ON orders FOR UPDATE USING (true);
