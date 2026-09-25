-- ════════════════════════════════════════════════════════════════════════════
-- MISE À JOUR DES SESSIONS DE DÉMONSTRATION — Adera Conseil
-- Exécuter dans Supabase SQL Editor
-- Sessions : APERCU (T1 — diagnostic initial) et SUIVI1 (T2 — suivi 6 mois)
-- ════════════════════════════════════════════════════════════════════════════


-- ── 1. Session APERCU — mise à jour métadonnées + cadrage ────────────────────

UPDATE sessions SET
  org_name        = 'Adera Conseil',
  sector          = 'Conseil & Expertise',
  company_size    = '50 – 249',
  governance_type = 'ETI indépendante',
  mode            = 'comparison',
  min_respondents = 3,
  is_active       = false,
  cadrage = '{
    "structure_type":    "matricielle",
    "formalization":     "peu_formalisee",
    "coordination":      "ajustement",
    "hierarchy_distance":"faible",
    "uncertainty":       "moderee",
    "orientation":       "collective",
    "decision_model":    "politique",
    "leadership_style":  "communicationnel"
  }'::jsonb,
  synthesis = $synth_apercu$Adera Conseil affiche un score global d'alignement de 64/100, positionnant l'organisation au seuil de la structuration — une base solide, mais des tensions internes qui appellent une action ciblée et sans délai.

Le capital humain constitue le premier levier de différenciation : les dimensions Compétences (73) et Staff (67) témoignent d'un vivier de talents reconnu à tous les niveaux hiérarchiques. Cette solidité opérationnelle est un actif stratégique pour une organisation de conseil fortement dépendante de l'expertise individuelle et de l'engagement de ses équipes.

Le diagnostic met en évidence un écart de perception préoccupant entre niveaux hiérarchiques. Les dirigeants évaluent la Stratégie à 78 et le Style managérial à 82, quand les équipes opérationnelles les perçoivent respectivement à 49 et 52 — soit un delta de 29 à 30 points. Cet écart traduit une vision stratégique insuffisamment cascadée et un management dont l'impact terrain reste limité. La dimension Valeurs (54 en moyenne, 42 côté équipes) confirme une déconnexion entre les ambitions culturelles portées par la direction et le vécu quotidien des collaborateurs.

La priorité est d'agir sur la congruence valeurs-pratiques : une transformation culturelle se construit par des signaux managériaux cohérents et répétés, pas par déclaration. Le redressement des Systèmes (58), point de faiblesse homogène entre niveaux, constitue le second chantier structurant. L'ouverture d'une démarche de co-construction des valeurs et de rituels de restitution stratégique à tous les niveaux permettrait de réduire significativement les écarts de perception observés.$synth_apercu$,
  recommendations = $reco_apercu$[
    {"id":"strategie",   "label":"Cascader la vision",          "text":"Formaliser un plan stratégique à 18 mois partagé à tous les niveaux. Instaurer des rituels trimestriels de restitution pour réduire l'écart de perception entre direction et équipes (29 points d'écart observé)."},
    {"id":"structure",   "label":"Clarifier les responsabilités","text":"Documenter les interfaces de la structure matricielle pour réduire les zones grises décisionnelles. Renforcer la légitimité des chefs de projet face aux lignes fonctionnelles."},
    {"id":"systemes",    "label":"Fiabiliser les processus",     "text":"Cartographier les 5 processus critiques et formaliser leurs règles de fonctionnement. Réduire la dépendance à l'ajustement informel en outillant les équipes sur les processus à forte variabilité."},
    {"id":"style",       "label":"Rapprocher direction et terrain","text":"Instaurer des sessions de feedback ascendant régulières pour identifier les décalages entre intention managériale et impact perçu. L'écart de 30 points sur cette dimension est le signal le plus urgent."},
    {"id":"staff",       "label":"Capitaliser sur les talents",  "text":"Renforcer les parcours d'évolution et la reconnaissance des expertises spécialisées. Mettre en place un programme de mentoring interne pour consolider la transmission des savoirs."},
    {"id":"competences", "label":"Maintenir l'avance compétitive","text":"Dimension la plus forte du diagnostic (73). Investir dans un plan de formation prospectif pour anticiper les évolutions métiers à 3 ans et maintenir le différentiel compétitif."},
    {"id":"valeurs",     "label":"Aligner culture et pratiques", "text":"Lancer un chantier de co-construction des valeurs incluant managers et équipes opérationnelles. L'écart de 28 points entre dirigeants (65) et équipes (42) révèle une culture déclarée non encore vécue."}
  ]$reco_apercu$::jsonb
WHERE code = 'APERCU';


-- ── 2. Remplacement des diagnostics APERCU ───────────────────────────────────

DELETE FROM diagnostics
WHERE session_id = (SELECT id FROM sessions WHERE code = 'APERCU');

INSERT INTO diagnostics (
  session_id, respondent_name, respondent_role, user_type,
  company_name, sector, company_size, governance_type,
  scores, global_score, completed, step_current, answers
)
SELECT
  s.id,
  d.respondent_name,
  d.respondent_role,
  'consultant',
  'Adera Conseil',
  'Conseil & Expertise',
  '50 – 249',
  'ETI indépendante',
  d.scores::jsonb,
  d.global_score,
  true,
  7,
  '{}'::jsonb
FROM sessions s
CROSS JOIN (VALUES
  ('Marie Dupont',   'dirigeant', '{"strategie":80,"structure":74,"systemes":56,"style":84,"staff":76,"competences":82,"valeurs":68}', 74),
  ('Thomas Bernard', 'dirigeant', '{"strategie":76,"structure":70,"systemes":52,"style":80,"staff":72,"competences":78,"valeurs":62}', 70),
  ('Sophie Martin',  'manager',   '{"strategie":65,"structure":66,"systemes":60,"style":72,"staff":68,"competences":74,"valeurs":58}', 66),
  ('Julien Petit',   'manager',   '{"strategie":60,"structure":62,"systemes":56,"style":68,"staff":65,"competences":72,"valeurs":50}', 62),
  ('Camille Robert', 'equipe',    '{"strategie":52,"structure":58,"systemes":64,"style":54,"staff":62,"competences":68,"valeurs":44}', 57),
  ('Lucas Moreau',   'equipe',    '{"strategie":46,"structure":54,"systemes":60,"style":50,"staff":60,"competences":64,"valeurs":40}', 53)
) AS d(respondent_name, respondent_role, scores, global_score)
WHERE s.code = 'APERCU';


-- ── 3. Session SUIVI1 — mise à jour + lien parent ────────────────────────────

UPDATE sessions SET
  org_name          = 'Adera Conseil',
  sector            = 'Conseil & Expertise',
  company_size      = '50 – 249',
  governance_type   = 'ETI indépendante',
  mode              = 'comparison',
  min_respondents   = 3,
  is_active         = false,
  parent_session_id = (SELECT id FROM sessions WHERE code = 'APERCU'),
  synthesis = $synth_suivi1$Six mois après le diagnostic initial, Adera Conseil affiche un score global de 68/100, en progression de 4 points. La dynamique est positive mais prudente : les chantiers engagés produisent leurs premiers effets visibles, sans lever pour autant les zones de fragilité structurelles identifiées en T1.

La progression la plus significative concerne la Stratégie (+6) : les rituels de restitution instaurés ont commencé à réduire l'écart de perception entre niveaux hiérarchiques. Les dimensions Systèmes (+6) et Valeurs (+6) progressent de manière encourageante — le travail de formalisation des processus critiques et la démarche de co-construction des valeurs commencent à produire une adhésion plus large. Ces deux chantiers doivent être activement poursuivis.

Les dimensions encore fragiles méritent une vigilance renforcée. Valeurs reste en dessous de 60 malgré la progression, et l'écart de perception entre dirigeants (74) et équipes (49) demeure significatif. Structure ne progresse que de 3 points, signe d'une résistance persistante aux clarifications organisationnelles dans la structure matricielle. Ces deux dimensions constituent les priorités du prochain cycle.

À 6 mois, l'organisation a démontré sa capacité à se mobiliser autour de chantiers ciblés. La prochaine étape est de pérenniser les acquis sur Systèmes et Compétences tout en relançant avec plus d'ambition les chantiers Valeurs et Structure. Un programme de formation managériale axé sur le feedback ascendant et la cascade stratégique permettrait d'ancrer durablement les progressions observées.$synth_suivi1$,
  recommendations = $reco_suivi1$[
    {"id":"strategie",   "label":"Renforcer la cascade",          "text":"Maintenir les rituels trimestriels et déployer des tableaux de bord stratégiques à chaque niveau. Viser une réduction de l'écart de perception à moins de 15 points d'ici T3."},
    {"id":"structure",   "label":"Relancer la clarification",     "text":"La progression marginale (+3) signale une résistance aux changements structurels. Identifier les blocages et associer les parties prenantes clés à la révision des périmètres de responsabilité."},
    {"id":"systemes",    "label":"Consolider les processus",      "text":"Les processus formalisés doivent être mesurés et ajustés. Étendre la démarche aux processus secondaires pour ancrer durablement la culture processus dans l'organisation."},
    {"id":"style",       "label":"Ancrer les pratiques",          "text":"Les sessions de feedback ascendant doivent devenir une pratique systématique. Intégrer le management participatif dans les critères d'évaluation managériale annuelle."},
    {"id":"staff",       "label":"Stabiliser les équipes",        "text":"Surveiller le turn-over dans un contexte de transformation soutenu. Renforcer les programmes de reconnaissance pour fidéliser les talents identifiés."},
    {"id":"competences", "label":"Accélérer la prospective",      "text":"Initier le plan de formation prospectif sur les compétences à 3 ans. Mettre en place un réseau d'experts internes pour accélérer le transfert de savoirs."},
    {"id":"valeurs",     "label":"Pérenniser l'adhésion",         "text":"La co-construction a permis +6 points. Organiser des ateliers de mise en pratique des valeurs par équipe pour passer de l'adhésion déclarative à l'ancrage comportemental."}
  ]$reco_suivi1$::jsonb
WHERE code = 'SUIVI1';


-- ── 4. Remplacement des diagnostics SUIVI1 ───────────────────────────────────

DELETE FROM diagnostics
WHERE session_id = (SELECT id FROM sessions WHERE code = 'SUIVI1');

INSERT INTO diagnostics (
  session_id, respondent_name, respondent_role, user_type,
  company_name, sector, company_size, governance_type,
  scores, global_score, completed, step_current, answers
)
SELECT
  s.id,
  d.respondent_name,
  d.respondent_role,
  'consultant',
  'Adera Conseil',
  'Conseil & Expertise',
  '50 – 249',
  'ETI indépendante',
  d.scores::jsonb,
  d.global_score,
  true,
  7,
  '{}'::jsonb
FROM sessions s
CROSS JOIN (VALUES
  ('Marie Dupont',   'dirigeant', '{"strategie":83,"structure":76,"systemes":62,"style":86,"staff":78,"competences":84,"valeurs":74}', 78),
  ('Thomas Bernard', 'dirigeant', '{"strategie":79,"structure":73,"systemes":60,"style":82,"staff":74,"competences":80,"valeurs":68}', 74),
  ('Sophie Martin',  'manager',   '{"strategie":72,"structure":69,"systemes":66,"style":76,"staff":72,"competences":78,"valeurs":64}', 71),
  ('Julien Petit',   'manager',   '{"strategie":66,"structure":65,"systemes":62,"style":72,"staff":68,"competences":74,"valeurs":56}', 66),
  ('Camille Robert', 'equipe',    '{"strategie":58,"structure":60,"systemes":68,"style":60,"staff":66,"competences":72,"valeurs":52}', 62),
  ('Lucas Moreau',   'equipe',    '{"strategie":54,"structure":57,"systemes":65,"style":56,"staff":62,"competences":68,"valeurs":46}', 58)
) AS d(respondent_name, respondent_role, scores, global_score)
WHERE s.code = 'SUIVI1';
