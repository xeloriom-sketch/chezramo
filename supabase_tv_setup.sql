-- ══════════════════════════════════════════════════════
-- CHEZ RAMO — Détection auto des rôles TV 1 / TV 2
-- Colle ce SQL dans : Supabase > SQL Editor > New Query
-- (à exécuter UNE FOIS avant de déployer la détection auto)
-- ══════════════════════════════════════════════════════

-- Chaque ligne = un rôle d'écran. Les TV réclament un rôle
-- via PATCH conditionnel (atomique) : device_id = qui le tient,
-- last_seen = dernier heartbeat (epoch ms). Un rôle silencieux
-- depuis plus de 2 minutes est considéré libre.

CREATE TABLE IF NOT EXISTS tv_roles (
  role      INTEGER PRIMARY KEY,
  device_id TEXT,
  last_seen BIGINT DEFAULT 0
);

INSERT INTO tv_roles (role, device_id, last_seen) VALUES
  (1, NULL, 0),
  (2, NULL, 0)
ON CONFLICT (role) DO NOTHING;

ALTER TABLE tv_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tv lecture publique"      ON tv_roles;
DROP POLICY IF EXISTS "tv modification publique" ON tv_roles;

CREATE POLICY "tv lecture publique"      ON tv_roles FOR SELECT USING (true);
CREATE POLICY "tv modification publique" ON tv_roles FOR UPDATE USING (true);
