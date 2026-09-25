-- ════════════════════════════════════════════════════════════════════════════
-- Ajout du champ context sur sessions + mise à jour démo APERCU / SUIVI1
-- Recommendations enrichies : diagnosis + actions 3 phases avec leviers
-- Synthèses réécrites pour refléter le contexte post-fusion d'Adera Conseil
-- ════════════════════════════════════════════════════════════════════════════

alter table sessions add column if not exists context jsonb default null;


-- ── APERCU : contexte + synthèse + recommandations enrichies ─────────────────

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
    {
      "id": "strategie",
      "label": "Cascader la vision post-fusion",
      "text": "Formaliser un plan stratégique commun aux deux entités et le restituer via des rituels trimestriels à tous les niveaux. L'écart de 29 points entre direction et équipes traduit une stratégie non encore appropriée par les collaborateurs issus de la fusion.",
      "diagnosis": "La stratégie post-fusion est définie mais insuffisamment appropriée : 29 points d'écart entre direction (78) et équipes (49). Les collaborateurs issus du cabinet régional n'ont pas encore intégré le projet commun dans leurs pratiques quotidiennes.",
      "actions": {
        "court": [
          {"lever": "pilotage", "text": "Organiser des ateliers de restitution stratégique par équipes mixtes pour traduire la vision de la fusion en 3 priorités opérationnelles concrètes à chaque niveau hiérarchique"}
        ],
        "moyen": [
          {"lever": "humain",   "text": "Former l'encadrement intermédiaire des deux entités à la déclinaison de la stratégie d'intégration en objectifs d'équipe mesurables"},
          {"lever": "systemes", "text": "Déployer un tableau de bord d'intégration partagé avec indicateurs d'avancement des chantiers fusion, accessible à tous les niveaux"}
        ],
        "long": [
          {"lever": "culture",  "text": "Construire un récit commun aux deux entités — valeurs, ambitions, pratiques — pour ancrer une identité stable dans l'organisation fusionnée"}
        ]
      }
    },
    {
      "id": "structure",
      "label": "Clarifier les interfaces",
      "text": "Documenter les responsabilités dans la structure matricielle post-fusion pour réduire les zones grises. La coexistence de deux cultures organisationnelles accentue les tensions de légitimité entre fonctions.",
      "diagnosis": "La structure matricielle post-fusion génère des zones grises décisionnelles aux interfaces entre les deux entités. Les tensions de légitimité entre fonctions héritées ralentissent l'exécution et génèrent des conflits de périmètre récurrents.",
      "actions": {
        "court": [
          {"lever": "pilotage", "text": "Cartographier les interfaces conflictuelles entre fonctions issues des deux entités et formaliser les périmètres de responsabilité prioritaires"}
        ],
        "moyen": [
          {"lever": "systemes", "text": "Documenter une matrice RACI pour les processus critiques transversaux, co-rédigée avec des représentants des deux entités"},
          {"lever": "humain",   "text": "Évaluer le degré de centralisation hérité de chaque entité et calibrer les délégations en cohérence avec les exigences de réactivité post-fusion"}
        ],
        "long": [
          {"lever": "culture",  "text": "Accompagner l'évolution structurelle par des mécanismes de co-décision mixtes pour lever les résistances de légitimité héritées de la fusion"}
        ]
      }
    },
    {
      "id": "systemes",
      "label": "Harmoniser les processus",
      "text": "Cartographier et standardiser les processus critiques des deux entités pour réduire les frictions opérationnelles. L'homogénéité du score faible (58) tous niveaux confondus signale un dysfonctionnement structurel hérité de la fusion.",
      "diagnosis": "Les processus des deux entités coexistent sans harmonisation suffisante. L'hétérogénéité des pratiques génère frictions et perte d'efficacité aux interfaces, notamment entre équipes historiques et nouvelles recrues.",
      "actions": {
        "court": [
          {"lever": "humain",   "text": "Identifier avec les équipes terrain les 3 processus les plus sources de friction entre les deux entités et engager leur harmonisation en priorité"}
        ],
        "moyen": [
          {"lever": "systemes", "text": "Cartographier et standardiser les processus critiques communs en impliquant des référents des deux entités dans leur co-rédaction"},
          {"lever": "pilotage", "text": "Instaurer des revues de performance mensuelles centrées sur la qualité de service client — premier indicateur de réussite de l'harmonisation"}
        ],
        "long": [
          {"lever": "culture",  "text": "Développer une culture processus commune en valorisant la rigueur opérationnelle comme garant de la qualité de service dans l'entité fusionnée"}
        ]
      }
    },
    {
      "id": "style",
      "label": "Incarner le changement",
      "text": "Former l'encadrement intermédiaire à porter concrètement le projet d'intégration culturelle. Les 30 points d'écart sur le Style révèlent que les initiatives restent perçues comme descendantes — le signal le plus urgent du diagnostic.",
      "diagnosis": "30 points d'écart entre dirigeants (82) et équipes (52) sur le Style managérial. Les initiatives d'intégration sont perçues comme descendantes, non incarnées par l'encadrement intermédiaire — le signal le plus urgent du diagnostic.",
      "actions": {
        "court": [
          {"lever": "humain",   "text": "Former les managers intermédiaires à incarner concrètement le projet d'intégration dans leur management quotidien, au-delà des communications institutionnelles"}
        ],
        "moyen": [
          {"lever": "pilotage", "text": "Instaurer un feedback ascendant structuré pour mesurer l'écart entre message managérial et vécu des équipes, avec plans de correction par manager"},
          {"lever": "humain",   "text": "Déployer un programme de co-développement managérial mixte pour homogénéiser les pratiques entre les deux cultures"}
        ],
        "long": [
          {"lever": "culture",  "text": "Intégrer l'incarnation des valeurs d'intégration dans les critères d'évaluation managériale annuelle des deux entités"}
        ]
      }
    },
    {
      "id": "staff",
      "label": "Valoriser les deux cultures",
      "text": "Créer des équipes mixtes associant collaborateurs historiques et nouvelles recrues. Mettre en place des programmes de reconnaissance qui valorisent explicitement les contributions des deux entités fusionnées.",
      "diagnosis": "Les talents sont présents dans les deux entités mais la fusion génère un risque de départ des nouvelles recrues qui ne se sentent pas encore reconnus dans leur contribution. La rétention est un enjeu à court terme.",
      "actions": {
        "court": [
          {"lever": "humain",   "text": "Identifier les collaborateurs clés issus du cabinet régional à risque de départ et lancer des actions ciblées de reconnaissance et d'intégration"}
        ],
        "moyen": [
          {"lever": "humain",   "text": "Créer des équipes projets mixtes pour valoriser les compétences des deux entités et rompre les cloisonnements hérités de la fusion"},
          {"lever": "systemes", "text": "Renforcer les entretiens de suivi semestriels comme outil d'écoute active pour détecter les signaux de désengagement dans un contexte de transformation"}
        ],
        "long": [
          {"lever": "culture",  "text": "Construire une proposition de valeur employeur commune aux deux entités, intégrant le meilleur des deux cultures pour fidéliser dans la durée"}
        ]
      }
    },
    {
      "id": "competences",
      "label": "Accélérer le transfert croisé",
      "text": "Dimension la plus forte (73). Mettre en place un programme de mentoring croisé entre les deux entités pour accélérer le transfert de compétences et renforcer la cohésion par la pratique.",
      "diagnosis": "Premier actif de l'organisation fusionnée : les compétences sont élevées dans les deux entités. La création de valeur réside dans le transfert croisé des expertises complémentaires — un levier encore sous-exploité post-fusion.",
      "actions": {
        "court": [
          {"lever": "systemes", "text": "Cartographier les expertises distinctives de chaque entité et identifier les binômes de transfert à fort potentiel croisé"}
        ],
        "moyen": [
          {"lever": "humain",   "text": "Lancer un programme de mentoring croisé associant collaborateurs historiques et nouvelles recrues pour accélérer l'intégration par la pratique"},
          {"lever": "systemes", "text": "Formaliser les savoir-faire distinctifs des deux entités dans une base de connaissance commune pour les rendre transmissibles"}
        ],
        "long": [
          {"lever": "culture",  "text": "Instituer le partage de compétences inter-entités comme pratique culturelle valorisée d'Adera Conseil — une organisation qui apprend de sa propre diversité"}
        ]
      }
    },
    {
      "id": "valeurs",
      "label": "Co-construire la culture commune",
      "text": "L'écart de 28 points (dirigeants 65, équipes 42) révèle une culture d'intégration déclarée non encore vécue. Lancer un chantier participatif associant collaborateurs des deux entités pour ancrer des valeurs communes vécues.",
      "diagnosis": "28 points d'écart entre dirigeants (65) et équipes (42) — le chantier le plus urgent et le plus structurant. La culture d'intégration est déclarée par la direction mais n'est pas encore vécue. Sans ancrage comportemental, les autres chantiers resteront fragiles.",
      "actions": {
        "court": [
          {"lever": "humain",   "text": "Organiser des ateliers participatifs mixtes pour révéler les valeurs réelles des deux entités et identifier convergences et divergences culturelles à travailler en priorité"}
        ],
        "moyen": [
          {"lever": "culture",  "text": "Co-construire un référentiel de comportements communs associant historiques et nouvelles recrues, ancré sur des situations concrètes plutôt que sur des abstractions"},
          {"lever": "systemes", "text": "Intégrer les valeurs communes dans les processus RH : critères de recrutement, objectifs d'évaluation et critères de promotion des deux entités"}
        ],
        "long": [
          {"lever": "pilotage", "text": "Mesurer annuellement l'évolution de l'écart de perception entre dirigeants et équipes sur les valeurs et piloter les actions correctrices jusqu'à convergence"}
        ]
      }
    }
  ]$r1$::jsonb

WHERE code = 'APERCU';


-- ── SUIVI1 : contexte + synthèse + recommandations enrichies ─────────────────

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
    {
      "id": "strategie",
      "label": "Réduire l'écart perceptionnel",
      "text": "L'écart passe de 29 à 22 points : poursuivre les rituels en impliquant davantage l'encadrement intermédiaire. Viser moins de 15 points d'ici T3 pour valider l'appropriation de la stratégie d'intégration par les deux entités.",
      "diagnosis": "Progression de +6 : les rituels de restitution produisent leurs effets et l'écart de perception passe de 29 à 22 points. Premier signe d'appropriation de la stratégie d'intégration — mais l'objectif de moins de 15 points reste à atteindre pour valider l'ancrage.",
      "actions": {
        "court": [
          {"lever": "pilotage", "text": "Renforcer les rituels trimestriels en impliquant davantage les managers intermédiaires des deux entités comme relais actifs de la cascade stratégique"}
        ],
        "moyen": [
          {"lever": "pilotage", "text": "Déployer des tableaux de bord stratégiques individualisés par équipe pour rendre la progression de l'intégration visible et mesurable à chaque niveau"},
          {"lever": "humain",   "text": "Développer les compétences d'animation stratégique des managers intermédiaires pour qu'ils deviennent autonomes dans la cascade vers leurs équipes"}
        ],
        "long": [
          {"lever": "culture",  "text": "Stabiliser la culture de transparence stratégique en intégrant le reporting d'intégration dans les routines managériales permanentes des deux entités"}
        ]
      }
    },
    {
      "id": "structure",
      "label": "Lever les blocages post-fusion",
      "text": "La progression marginale (+3) signale des résistances politiques aux clarifications organisationnelles. Associer les représentants des deux entités fusionnées à la révision des périmètres et responsabilités.",
      "diagnosis": "Progression marginale de +3 : les résistances structurelles persistent. La coexistence des deux cultures continue de freiner les clarifications de périmètres — signe que les enjeux de légitimité post-fusion n'ont pas encore été résolus.",
      "actions": {
        "court": [
          {"lever": "pilotage", "text": "Identifier les blocages spécifiques aux clarifications structurelles et associer les parties prenantes clés des deux entités à leur résolution"}
        ],
        "moyen": [
          {"lever": "humain",   "text": "Relancer la révision des périmètres de responsabilité en format co-construction mixte pour lever les résistances de légitimité héritées"},
          {"lever": "systemes", "text": "Restructurer les instances de décision transversales pour garantir la représentation équilibrée des deux entités"}
        ],
        "long": [
          {"lever": "culture",  "text": "Ancrer la légitimité des nouvelles règles structurelles en les faisant co-porter par des représentants reconnus des deux entités plutôt qu'en les imposant"}
        ]
      }
    },
    {
      "id": "systemes",
      "label": "Institutionnaliser l'harmonisation",
      "text": "Étendre la standardisation aux processus secondaires. Mesurer l'impact sur la qualité de service client — premier indicateur tangible du succès de l'intégration opérationnelle.",
      "diagnosis": "+6 grâce à l'harmonisation des processus prioritaires. Les frictions opérationnelles héritées de la fusion réduisent. La démarche doit être étendue aux processus secondaires pour consolider les acquis et éviter une asymétrie entre zones harmonisées et zones encore hétérogènes.",
      "actions": {
        "court": [
          {"lever": "pilotage", "text": "Mesurer l'impact des processus harmonisés sur la qualité de service client — premier indicateur tangible du succès de l'intégration opérationnelle"}
        ],
        "moyen": [
          {"lever": "systemes", "text": "Étendre la standardisation aux processus secondaires des deux entités en capitalisant sur la méthode co-construction qui a fait ses preuves en T1"},
          {"lever": "pilotage", "text": "Instaurer des revues semestrielles de processus avec retours utilisateurs des deux entités pour mesurer l'adoption réelle"}
        ],
        "long": [
          {"lever": "systemes", "text": "Explorer des outils de pilotage partagés pour institutionnaliser la culture de la mesure dans l'ensemble de l'organisation fusionnée"}
        ]
      }
    },
    {
      "id": "style",
      "label": "Ancrer le management participatif",
      "text": "Intégrer le feedback ascendant dans les pratiques formelles. Évaluer annuellement les managers sur leur capacité à incarner les valeurs communes des deux entités dans leur management quotidien.",
      "diagnosis": "+4 points mais l'écart perceptionnel demeure. Les managers commencent à incarner le projet d'intégration mais la cohérence des pratiques entre les deux entités reste insuffisante — le chantier de développement managérial doit se poursuivre.",
      "actions": {
        "court": [
          {"lever": "humain",   "text": "Systématiser le feedback ascendant et partager les résultats avec les équipes pour créer une boucle de progrès visible et partagée"}
        ],
        "moyen": [
          {"lever": "pilotage", "text": "Intégrer l'incarnation des valeurs d'intégration dans les critères d'évaluation formelle des managers des deux entités"},
          {"lever": "humain",   "text": "Développer une communauté managériale mixte (co-développement entre pairs) pour homogénéiser les pratiques entre les deux cultures"}
        ],
        "long": [
          {"lever": "culture",  "text": "Faire du management participatif inclusif un marqueur identitaire d'Adera Conseil, visible dès les processus de recrutement et d'intégration des nouveaux managers"}
        ]
      }
    },
    {
      "id": "staff",
      "label": "Fidéliser dans la durée",
      "text": "Surveiller le turn-over dans les équipes issues de la fusion. Renforcer la reconnaissance des contributions individuelles dans un contexte de transformation soutenu, notamment pour les nouvelles recrues.",
      "diagnosis": "Progression de +3 : la stabilisation des équipes s'amorce. Le risque de départ des nouvelles recrues est en recul mais reste à surveiller. La fidélisation par la reconnaissance demeure le levier prioritaire dans un contexte de transformation encore soutenu.",
      "actions": {
        "court": [
          {"lever": "humain",   "text": "Surveiller les signaux de désengagement dans les équipes issues du cabinet régional et renforcer les programmes de reconnaissance ciblés"}
        ],
        "moyen": [
          {"lever": "humain",   "text": "Développer la mobilité interne croisée entre les deux entités comme levier de fidélisation et d'intégration par la pratique"},
          {"lever": "systemes", "text": "Structurer des plans de succession mixtes pour les postes clés en valorisant explicitement les profils des deux entités"}
        ],
        "long": [
          {"lever": "culture",  "text": "Consolider une proposition de valeur employeur commune en intégrant les retours des collaborateurs des deux entités pour la rendre authentiquement partagée"}
        ]
      }
    },
    {
      "id": "competences",
      "label": "Accélérer les transferts croisés",
      "text": "Développer les tandems mentors entre collaborateurs historiques et nouvelles recrues pour accélérer l'intégration par la pratique et le partage de compétences entre les deux entités.",
      "diagnosis": "+3 points et une progression vers les niveaux les plus élevés. Le transfert croisé entre entités s'amorce. L'enjeu est d'institutionnaliser les échanges pour que la richesse des deux expertises devienne un avantage structurel durable.",
      "actions": {
        "court": [
          {"lever": "humain",   "text": "Accélérer les programmes de mentoring croisé et mesurer leur impact sur la qualité des prestations aux clients communs des deux entités"}
        ],
        "moyen": [
          {"lever": "systemes", "text": "Étendre la cartographie des expertises et formaliser les savoir-faire distinctifs des deux entités dans une base de connaissance commune"},
          {"lever": "humain",   "text": "Lancer des projets pilotes interentités sur des missions client communes pour accélérer l'intégration par la pratique professionnelle"}
        ],
        "long": [
          {"lever": "culture",  "text": "Faire du partage de compétences inter-entités un marqueur culturel d'Adera Conseil — une organisation qui tire sa force de sa propre diversité d'expertises"}
        ]
      }
    },
    {
      "id": "valeurs",
      "label": "Passer à l'ancrage comportemental",
      "text": "La co-construction (+6) doit se traduire en comportements concrets. Organiser des ateliers par équipes mixtes pour transformer l'adhésion déclarative en pratiques vécues par l'ensemble des collaborateurs.",
      "diagnosis": "+6 : la démarche de co-construction produit une adhésion plus large et Valeurs atteint 60. Mais l'écart dirigeants (74) / équipes (49) demeure significatif — la culture commune n'est pas encore pleinement vécue. Il faut passer de l'adhésion déclarative aux comportements observables.",
      "actions": {
        "court": [
          {"lever": "culture",  "text": "Organiser des ateliers de mise en pratique des valeurs par équipes mixtes pour ancrer les comportements communs au-delà du discours institutionnel"}
        ],
        "moyen": [
          {"lever": "humain",   "text": "Ancrer les valeurs communes dans les rituels quotidiens d'équipe et les rendre visibles dans les décisions managériales concrètes"},
          {"lever": "systemes", "text": "Intégrer les comportements valorisés dans les critères de recrutement et d'évaluation des deux entités pour institutionnaliser la culture commune"}
        ],
        "long": [
          {"lever": "pilotage", "text": "Mesurer annuellement l'écart perceptionnel entre dirigeants et équipes sur les valeurs pour piloter la convergence culturelle jusqu'à l'objectif de moins de 15 points"}
        ]
      }
    }
  ]$r2$::jsonb

WHERE code = 'SUIVI1';
