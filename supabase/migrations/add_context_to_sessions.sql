-- ════════════════════════════════════════════════════════════════════════════
-- Ajout du champ context sur sessions + mise à jour démo APERCU / SUIVI1
-- Synthèses réécrites pour refléter le contexte post-fusion d'Adera Conseil
-- ════════════════════════════════════════════════════════════════════════════

alter table sessions add column if not exists context jsonb default null;


-- ── APERCU : contexte + synthèse + recommandations ───────────────────────────

UPDATE sessions SET
  context = '{
    "situation_type": "transformation_culturelle",
    "problem_description": "Suite à une fusion avec un cabinet régional, Adera Conseil fait face à des difficultés d''intégration culturelle et organisationnelle. Des tensions entre équipes historiques et nouvelles recrues fragilisent la cohésion et impactent la qualité du service client.",
    "past_actions": "Des journées d''intégration ont été organisées et un nouveau projet d''entreprise formalisé. Ces initiatives sont cependant perçues comme descendantes et peu incarnées par l''encadrement intermédiaire.",
    "expected_outcomes": "Identifier les dimensions prioritaires à consolider pour réussir l''intégration. Disposer d''une feuille de route à 12 mois permettant d''aligner les pratiques managériales sur la nouvelle ambition culturelle."
  }'::jsonb,
  synthesis = $s1$Dans le contexte de sa fusion avec un cabinet régional, Adera Conseil affiche un score global d'alignement de 64/100 — une organisation structurée, mais traversée par des tensions d'intégration qui se lisent directement dans les scores.

Le capital humain demeure le premier levier de différenciation : les dimensions Compétences (73) et Staff (67) témoignent d'une expertise reconnue à tous les niveaux hiérarchiques. Ce socle est essentiel pour maintenir la qualité de service client dans une période de transformation soutenue.

Le diagnostic met en évidence les fractures organisationnelles issues de la fusion. L'écart de perception entre dirigeants et équipes est particulièrement révélateur : 29 points sur la Stratégie (78 vs 49), 30 points sur le Style managérial (82 vs 52). Ces tensions traduisent précisément ce qui a été identifié : des initiatives perçues comme descendantes, peu incarnées par l'encadrement intermédiaire. La dimension Valeurs, à 42 côté équipes, confirme que la culture d'intégration déclarée n'est pas encore vécue par les collaborateurs des deux entités.

Pour atteindre l'objectif d'une feuille de route à 12 mois, les priorités sont claires : lancer un chantier de co-construction des valeurs associant les deux entités fusionnées, et renforcer la cascade stratégique par des rituels d'alignement à tous les niveaux. Le redressement des Systèmes (58) — insuffisants de manière homogène — est le levier opérationnel le plus rapide pour réduire les frictions liées à l'intégration.$s1$,
  recommendations = $r1$[
    {"id":"strategie",   "label":"Cascader la vision post-fusion",    "text":"Formaliser un plan stratégique commun aux deux entités et le restituer via des rituels trimestriels à tous les niveaux. L'écart de 29 points entre direction et équipes traduit une stratégie non encore appropriée par les collaborateurs issus de la fusion."},
    {"id":"structure",   "label":"Clarifier les interfaces",           "text":"Documenter les responsabilités dans la structure matricielle post-fusion pour réduire les zones grises. La coexistence de deux cultures organisationnelles accentue les tensions de légitimité entre fonctions."},
    {"id":"systemes",    "label":"Harmoniser les processus",           "text":"Cartographier et standardiser les processus critiques des deux entités pour réduire les frictions opérationnelles. L'homogénéité du score faible (58) tous niveaux confondus signale un dysfonctionnement structurel hérité de la fusion."},
    {"id":"style",       "label":"Incarner le changement",             "text":"Former l'encadrement intermédiaire à porter concrètement le projet d'intégration culturelle. Les 30 points d'écart sur le Style révèlent que les initiatives restent perçues comme descendantes — le signal le plus urgent du diagnostic."},
    {"id":"staff",       "label":"Valoriser les deux cultures",        "text":"Créer des équipes mixtes associant collaborateurs historiques et nouvelles recrues. Mettre en place des programmes de reconnaissance qui valorisent explicitement les contributions des deux entités fusionnées."},
    {"id":"competences", "label":"Accélérer le transfert croisé",      "text":"Dimension la plus forte (73). Mettre en place un programme de mentoring croisé entre les deux entités pour accélérer le transfert de compétences et renforcer la cohésion par la pratique."},
    {"id":"valeurs",     "label":"Co-construire la culture commune",   "text":"L'écart de 28 points (dirigeants 65, équipes 42) révèle une culture d'intégration déclarée non encore vécue. Lancer un chantier participatif associant collaborateurs des deux entités pour ancrer des valeurs communes vécues."}
  ]$r1$::jsonb
WHERE code = 'APERCU';


-- ── SUIVI1 : contexte + synthèse + recommandations ───────────────────────────

UPDATE sessions SET
  context = '{
    "situation_type": "transformation_culturelle",
    "problem_description": "Suite à une fusion avec un cabinet régional, Adera Conseil fait face à des difficultés d''intégration culturelle et organisationnelle. Des tensions entre équipes historiques et nouvelles recrues fragilisent la cohésion et impactent la qualité du service client.",
    "past_actions": "Des journées d''intégration ont été organisées et un nouveau projet d''entreprise formalisé. Ces initiatives sont cependant perçues comme descendantes et peu incarnées par l''encadrement intermédiaire.",
    "expected_outcomes": "Identifier les dimensions prioritaires à consolider pour réussir l''intégration. Disposer d''une feuille de route à 12 mois permettant d''aligner les pratiques managériales sur la nouvelle ambition culturelle."
  }'::jsonb,
  synthesis = $s2$Six mois après le diagnostic initial, et dans la continuité du chantier d'intégration post-fusion, Adera Conseil affiche un score global de 68/100, en progression de 4 points. La dynamique est encourageante : les actions engagées commencent à réduire les fractures observées en T1.

La progression de la Stratégie (+6) traduit un premier effet des rituels de restitution instaurés. L'écart de perception entre niveaux hiérarchiques est passé de 29 à 22 points — signe que la cascade stratégique s'ancre progressivement, même si l'objectif de moins de 15 points n'est pas encore atteint.

Les dimensions Systèmes (+6) et Valeurs (+6) progressent de manière encourageante. L'harmonisation des processus réduit les frictions opérationnelles héritées de la fusion, et la démarche de co-construction des valeurs produit une adhésion plus large. Ces résultats restent fragiles : Valeurs se situe à 60 et l'écart entre dirigeants (74) et équipes (49) demeure significatif, révélant que la culture commune n'est pas encore pleinement vécue par les deux entités.

À mi-chemin de l'objectif à 12 mois, les fondations sont posées mais la vigilance s'impose. Structure (+3 seulement) reste le point de résistance principal, signe que les clarifications post-fusion se heurtent à des enjeux politiques et culturels persistants. La priorité est d'accélérer le chantier Valeurs et la clarification des rôles pour concrétiser l'intégration culturelle avant la clôture de l'exercice.$s2$,
  recommendations = $r2$[
    {"id":"strategie",   "label":"Réduire l'écart perceptionnel",      "text":"L'écart passe de 29 à 22 points : poursuivre les rituels en impliquant davantage l'encadrement intermédiaire. Viser moins de 15 points d'ici T3 pour valider l'appropriation de la stratégie d'intégration par les deux entités."},
    {"id":"structure",   "label":"Lever les blocages post-fusion",     "text":"La progression marginale (+3) signale des résistances politiques aux clarifications organisationnelles. Associer les représentants des deux entités fusionnées à la révision des périmètres et responsabilités."},
    {"id":"systemes",    "label":"Institutionnaliser l'harmonisation", "text":"Étendre la standardisation aux processus secondaires. Mesurer l'impact sur la qualité de service client — premier indicateur tangible du succès de l'intégration opérationnelle."},
    {"id":"style",       "label":"Ancrer le management participatif",  "text":"Intégrer le feedback ascendant dans les pratiques formelles. Évaluer annuellement les managers sur leur capacité à incarner les valeurs communes des deux entités dans leur management quotidien."},
    {"id":"staff",       "label":"Fidéliser dans la durée",            "text":"Surveiller le turn-over dans les équipes issues de la fusion. Renforcer la reconnaissance des contributions individuelles dans un contexte de transformation soutenu, notamment pour les nouvelles recrues."},
    {"id":"competences", "label":"Accélérer les transferts croisés",   "text":"Développer les tandems mentors entre collaborateurs historiques et nouvelles recrues pour accélérer l'intégration par la pratique et le partage de compétences entre les deux entités."},
    {"id":"valeurs",     "label":"Passer à l'ancrage comportemental",  "text":"La co-construction (+6) doit se traduire en comportements concrets. Organiser des ateliers par équipes mixtes pour transformer l'adhésion déclarative en pratiques vécues par l'ensemble des collaborateurs."}
  ]$r2$::jsonb
WHERE code = 'SUIVI1';
