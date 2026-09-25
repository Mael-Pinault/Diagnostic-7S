-- Ajoute le champ context sur la table sessions
alter table sessions add column if not exists context jsonb default null;

-- Mise à jour du contexte de mission pour la démo APERCU
UPDATE sessions SET context = '{
  "situation_type": "transformation_culturelle",
  "problem_description": "Suite à une fusion avec un cabinet régional, Adera Conseil fait face à des difficultés d''intégration culturelle et organisationnelle. Des tensions entre équipes historiques et nouvelles recrues fragilisent la cohésion et impactent la qualité du service client.",
  "past_actions": "Des journées d''intégration ont été organisées et un nouveau projet d''entreprise formalisé. Ces initiatives sont cependant perçues comme descendantes et peu incarnées par l''encadrement intermédiaire.",
  "expected_outcomes": "Identifier les dimensions prioritaires à consolider pour réussir l''intégration. Disposer d''une feuille de route à 12 mois permettant d''aligner les pratiques managériales sur la nouvelle ambition culturelle."
}'::jsonb
WHERE code = 'APERCU';

-- Mise à jour du contexte de mission pour la démo SUIVI1
UPDATE sessions SET context = '{
  "situation_type": "transformation_culturelle",
  "problem_description": "Suite à une fusion avec un cabinet régional, Adera Conseil fait face à des difficultés d''intégration culturelle et organisationnelle. Des tensions entre équipes historiques et nouvelles recrues fragilisent la cohésion et impactent la qualité du service client.",
  "past_actions": "Des journées d''intégration ont été organisées et un nouveau projet d''entreprise formalisé. Ces initiatives sont cependant perçues comme descendantes et peu incarnées par l''encadrement intermédiaire.",
  "expected_outcomes": "Identifier les dimensions prioritaires à consolider pour réussir l''intégration. Disposer d''une feuille de route à 12 mois permettant d''aligner les pratiques managériales sur la nouvelle ambition culturelle."
}'::jsonb
WHERE code = 'SUIVI1';
