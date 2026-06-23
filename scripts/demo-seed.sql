-- ================================================================
-- SESSION DÉMO — "Adera Conseil"
-- Code d'accès : APERCU
-- À exécuter UNE SEULE FOIS dans l'éditeur SQL de Supabase.
-- ================================================================

WITH demo AS (
  INSERT INTO sessions (
    code, mode, org_name, sector, company_size, governance_type,
    is_active, min_respondents, cadrage
  )
  VALUES (
    'APERCU',
    'comparison',
    'Adera Conseil',
    'Conseil & Expertise',
    '50 – 249',
    'ETI indépendante',
    false,
    3,
    '{
      "structure_type":      "matricielle",
      "formalization":       "formalisee",
      "coordination":        "std_resultats",
      "hierarchy_distance":  "moderee",
      "uncertainty":         "moderee",
      "orientation":         "individuelle",
      "decision_model":      "rationnel",
      "leadership_style":    "analytique"
    }'::jsonb
  )
  RETURNING id
)
INSERT INTO diagnostics (
  session_id, user_type, respondent_role, completed, global_score, scores
)
VALUES
  -- Dirigeants (2) — vision stratégique optimiste
  ((SELECT id FROM demo), 'dirigeant', 'dirigeant', true, 67,
   '{"strategie":85,"structure":70,"systemes":55,"style":72,"staff":58,"competences":80,"valeurs":48}'::jsonb),
  ((SELECT id FROM demo), 'dirigeant', 'dirigeant', true, 65,
   '{"strategie":82,"structure":68,"systemes":52,"style":75,"staff":55,"competences":82,"valeurs":44}'::jsonb),

  -- Managers (4) — perception intermédiaire
  ((SELECT id FROM demo), 'dirigeant', 'manager', true, 63,
   '{"strategie":80,"structure":65,"systemes":50,"style":68,"staff":60,"competences":76,"valeurs":45}'::jsonb),
  ((SELECT id FROM demo), 'dirigeant', 'manager', true, 61,
   '{"strategie":78,"structure":62,"systemes":48,"style":65,"staff":58,"competences":74,"valeurs":42}'::jsonb),
  ((SELECT id FROM demo), 'dirigeant', 'manager', true, 64,
   '{"strategie":75,"structure":68,"systemes":52,"style":70,"staff":62,"competences":78,"valeurs":46}'::jsonb),
  ((SELECT id FROM demo), 'dirigeant', 'manager', true, 61,
   '{"strategie":77,"structure":60,"systemes":55,"style":66,"staff":56,"competences":72,"valeurs":44}'::jsonb),

  -- Équipes (6) — regard terrain plus critique
  ((SELECT id FROM demo), 'dirigeant', 'equipe', true, 59,
   '{"strategie":72,"structure":62,"systemes":45,"style":62,"staff":58,"competences":72,"valeurs":40}'::jsonb),
  ((SELECT id FROM demo), 'dirigeant', 'equipe', true, 59,
   '{"strategie":75,"structure":65,"systemes":48,"style":64,"staff":55,"competences":70,"valeurs":38}'::jsonb),
  ((SELECT id FROM demo), 'dirigeant', 'equipe', true, 57,
   '{"strategie":70,"structure":60,"systemes":42,"style":60,"staff":60,"competences":68,"valeurs":42}'::jsonb),
  ((SELECT id FROM demo), 'dirigeant', 'equipe', true, 59,
   '{"strategie":74,"structure":62,"systemes":50,"style":65,"staff":52,"competences":74,"valeurs":38}'::jsonb),
  ((SELECT id FROM demo), 'dirigeant', 'equipe', true, 59,
   '{"strategie":76,"structure":60,"systemes":45,"style":62,"staff":58,"competences":70,"valeurs":40}'::jsonb),
  ((SELECT id FROM demo), 'dirigeant', 'equipe', true, 60,
   '{"strategie":72,"structure":64,"systemes":48,"style":64,"staff":56,"competences":72,"valeurs":42}'::jsonb);
