-- ============================================================
-- SCHÉMA SUPABASE — Diagnostic Organisationnel 7S
-- À exécuter dans l'éditeur SQL de votre projet Supabase
-- ============================================================

-- Table principale : une ligne = une session de diagnostic
CREATE TABLE diagnostics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),

  -- Profil du répondant
  user_type     TEXT NOT NULL CHECK (user_type IN ('dirigeant', 'consultant')),
  company_name  TEXT,
  respondent_name  TEXT,
  respondent_email TEXT,

  -- Contexte (optionnel pour consultant)
  client_name   TEXT,
  sector        TEXT,
  company_size  TEXT,

  -- Réponses brutes : { "strategie": [3,4,2,5,3], "structure": [...], ... }
  answers       JSONB,

  -- Scores calculés par dimension (0-100)
  scores        JSONB,

  -- Score global d'alignement (0-100)
  global_score  NUMERIC(5,2),

  -- Statut
  completed     BOOLEAN DEFAULT FALSE,
  step_current  INTEGER DEFAULT 0
);

-- Index pour requêtes courantes
CREATE INDEX idx_diagnostics_created_at ON diagnostics(created_at DESC);
CREATE INDEX idx_diagnostics_completed ON diagnostics(completed);

-- Mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER diagnostics_updated_at
  BEFORE UPDATE ON diagnostics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Row Level Security (RLS)
-- Pour ce projet portfolio, on autorise l'insert/select anonyme.
-- À durcir pour un usage en production.
-- ============================================================

ALTER TABLE diagnostics ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut créer et lire ses propres diagnostics (via UUID secret)
CREATE POLICY "insert_anonymous" ON diagnostics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "select_by_id" ON diagnostics
  FOR SELECT USING (true);

CREATE POLICY "update_by_id" ON diagnostics
  FOR UPDATE USING (true);
