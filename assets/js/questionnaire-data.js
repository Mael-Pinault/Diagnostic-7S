export const DIMENSIONS = [
  {
    id: 'strategie',
    label: 'Stratégie',
    englishLabel: 'Strategy',
    icon: '🎯',
    description: 'Clarté du cap stratégique et cohérence des choix d\'allocation de ressources',
    questions: [
      {
        text: 'La vision à long terme de l\'organisation est clairement articulée et largement partagée par les parties prenantes internes.',
        levels: [
          'Aucune vision formalisée. Les dirigeants peinent eux-mêmes à l\'articuler de façon cohérente.',
          'Une vision existe mais reste vague, connue du seul comité de direction.',
          'La vision est définie et communiquée, mais inégalement comprise selon les niveaux hiérarchiques.',
          'La vision est claire, documentée et sert de référence effective dans les prises de décision.',
          'La vision est co-construite, profondément intégrée dans les pratiques et régulièrement revisitée.'
        ]
      },
      {
        text: 'La stratégie se traduit par des choix clairs et assumés — l\'organisation sait ce qu\'elle ne fait pas.',
        levels: [
          'Pas de stratégie documentée. L\'organisation réagit aux opportunités sans fil directeur.',
          'Des orientations existent mais restent générales ; l\'organisation peine à renoncer à des opportunités.',
          'Des choix stratégiques sont posés mais leur traduction en renoncements concrets est partielle.',
          'Les choix stratégiques sont explicites et les renoncements assumés, même sous pression externe.',
          'La stratégie est un filtre de décision robuste : tout projet est évalué à l\'aune des priorités définies.'
        ]
      },
      {
        text: 'Les décisions opérationnelles quotidiennes sont cohérentes avec les orientations stratégiques affichées.',
        levels: [
          'Les décisions du quotidien ignorent la stratégie, qui reste un document de façade.',
          'La cohérence est ponctuelle — certains managers s\'alignent, d\'autres pas.',
          'On cherche à aligner les décisions, mais des incohérences fréquentes subsistent.',
          'Les décisions opérationnelles s\'inscrivent généralement dans le cadre stratégique, avec quelques exceptions justifiées.',
          'La stratégie infuse toutes les décisions ; les écarts sont immédiatement identifiés et corrigés.'
        ]
      },
      {
        text: 'L\'organisation dispose d\'une veille active lui permettant d\'adapter sa stratégie aux évolutions de son environnement.',
        levels: [
          'Pas de veille organisée. Les évolutions de l\'environnement surprennent régulièrement l\'organisation.',
          'Quelques initiatives de veille existent mais ne remontent pas aux décideurs de façon structurée.',
          'Une veille est en place, mais son intégration dans la réflexion stratégique reste informelle.',
          'La veille alimente des revues stratégiques périodiques et a déjà conduit à des ajustements de cap.',
          'La veille est institutionnalisée, pluridisciplinaire et constitue un avantage compétitif reconnu.'
        ]
      },
      {
        text: 'L\'allocation des ressources (budget, talent, attention managériale) reflète effectivement les priorités stratégiques.',
        levels: [
          'Les ressources sont allouées selon les habitudes historiques, sans lien avec la stratégie.',
          'Des intentions d\'alignement existent mais les arbitrages sont dominés par les logiques politiques internes.',
          'Certaines priorités stratégiques bénéficient d\'une allocation renforcée, mais la cohérence n\'est pas systématique.',
          'L\'allocation reflète globalement les priorités, avec des revues annuelles de réalignement.',
          'Chaque décision budgétaire significative est explicitement justifiée au regard des priorités stratégiques.'
        ]
      }
    ]
  },
  {
    id: 'structure',
    label: 'Structure',
    englishLabel: 'Structure',
    icon: '🏗️',
    description: 'Organisation formelle, lignes de responsabilité et mécanismes de coordination',
    questions: [
      {
        text: 'L\'organisation formelle (organigramme, périmètres) est adaptée aux objectifs stratégiques actuels.',
        levels: [
          'La structure est héritée de l\'histoire, sans lien avec les enjeux actuels. Elle génère des blocages évidents.',
          'Des inadéquations majeures sont reconnues mais non traitées (restructuration différée, postes fantômes).',
          'La structure est partiellement adaptée ; des ajustements ponctuels ont été faits mais des inadéquations persistent.',
          'La structure est globalement alignée avec la stratégie et a évolué lors des derniers grands pivots.',
          'La structure est conçue comme un levier stratégique, régulièrement questionnée et adaptée proactivement.'
        ]
      },
      {
        text: 'Les responsabilités et les niveaux d\'autorité sont clairement définis et connus de l\'ensemble des collaborateurs.',
        levels: [
          'Les responsabilités sont floues, source de conflits fréquents et de décisions non prises.',
          'Des fiches de poste existent mais ne reflètent pas la réalité ou sont ignorées.',
          'Les responsabilités sont définies au niveau managérial mais restent opaques pour les équipes.',
          'Chacun connaît son périmètre ; les zones de chevauchement sont identifiées et gérées.',
          'Les responsabilités sont cristallines à tous les niveaux et servent de référentiel partagé pour résoudre les tensions.'
        ]
      },
      {
        text: 'Les mécanismes de coordination entre entités fonctionnent efficacement et limitent les phénomènes de silos.',
        levels: [
          'Les entités fonctionnent en silos étanches. La coordination passe quasi exclusivement par le sommet.',
          'Des réunions de coordination existent mais sont perçues comme chronophages et peu efficaces.',
          'Des mécanismes transverses sont en place (comités, chefs de projet) mais leur efficacité est variable.',
          'La coordination transversale fonctionne bien ; les frictions inter-entités sont gérées rapidement.',
          'La coopération transversale est une compétence organisationnelle distinctive, soutenue par des outils et une culture adaptés.'
        ]
      },
      {
        text: 'Le degré de centralisation / décentralisation est approprié au contexte, à la taille et aux activités de l\'organisation.',
        levels: [
          'La centralisation excessive ou la décentralisation anarchique génère lenteur ou incohérence structurelle.',
          'Le modèle est perçu inadéquat par les managers, qui contournent régulièrement les circuits officiels.',
          'Un équilibre est recherché mais le curseur est souvent mal calibré selon les types de décisions.',
          'Le modèle est globalement adapté ; les ajustements se font au cas par cas de façon raisonnée.',
          'Le niveau de centralisation est piloté explicitement, différencié par type de décision et régulièrement réévalué.'
        ]
      },
      {
        text: 'La structure facilite la réactivité et la prise de décision en temps utile.',
        levels: [
          'Les délais de décision sont systématiquement trop longs ; l\'organisation manque régulièrement des fenêtres d\'opportunité.',
          'La lourdeur structurelle est reconnue mais tolérée. Des raccourcis informels se multiplient.',
          'La réactivité est acceptable en situation normale mais se dégrade sous pression ou en période de crise.',
          'La prise de décision est fluide dans la majorité des situations ; les circuits d\'escalade sont clarifiés.',
          'La structure est conçue pour la vitesse : délégation claire, escalade rare, décision au plus près du terrain.'
        ]
      }
    ]
  },
  {
    id: 'systemes',
    label: 'Systèmes',
    englishLabel: 'Systems',
    icon: '⚙️',
    description: 'Processus formels et informels qui gouvernent les activités quotidiennes',
    questions: [
      {
        text: 'Les processus clés (planification, reporting, RH, qualité) sont formalisés, documentés et effectivement appliqués.',
        levels: [
          'Peu ou pas de processus formalisés. Chacun fonctionne selon ses propres pratiques.',
          'Des processus existent sur papier mais leur application est sporadique et non contrôlée.',
          'Les processus sont documentés et partiellement appliqués, avec des variations importantes selon les entités.',
          'Les processus clés sont formalisés, connus et globalement respectés ; des audits ponctuels le confirment.',
          'Les processus sont une référence partagée, régulièrement mis à jour et pleinement internalisés par les équipes.'
        ]
      },
      {
        text: 'Les systèmes d\'information répondent aux besoins opérationnels et sont réellement adoptés par les équipes.',
        levels: [
          'Les SI sont inadaptés ou obsolètes. Les équipes utilisent massivement des outils alternatifs non officiels.',
          'Des outils sont en place mais leur adoption est faible ; les contournements (Excel, mails) dominent.',
          'Les outils couvrent les besoins principaux mais avec des lacunes et une adoption partielle.',
          'Les SI répondent aux besoins et sont utilisés par la grande majorité des collaborateurs concernés.',
          'Les SI sont un levier de performance reconnu : adoption forte, mise à jour proactive, intégration entre outils.'
        ]
      },
      {
        text: 'Les indicateurs de performance permettent un pilotage fiable et réactif de l\'activité.',
        levels: [
          'Pas de tableau de bord. Le pilotage repose sur les impressions et les remontées informelles.',
          'Des indicateurs existent mais sont produits tardivement, contestés ou peu utilisés.',
          'Un tableau de bord est en place mais couvre partiellement l\'activité et génère peu de décisions.',
          'Les indicateurs clés sont fiables, produits régulièrement et alimentent effectivement les revues de direction.',
          'Le pilotage par la donnée est une compétence organisationnelle : indicateurs avancés, analyses prédictives, culture du fait.'
        ]
      },
      {
        text: 'Les processus font l\'objet de revues régulières visant à les améliorer en continu.',
        levels: [
          'Aucune revue de processus n\'est organisée. Les dysfonctionnements s\'accumulent sans être traités.',
          'Des problèmes sont identifiés mais les corrections sont réactives et ponctuelles.',
          'Des revues existent dans certains services, mais il n\'y a pas de démarche d\'amélioration continue systématique.',
          'Des cycles de revue sont planifiés et ont conduit à des améliorations significatives et documentées.',
          'L\'amélioration continue est institutionnalisée : méthode partagée, résultats mesurés, culture du feedback généralisée.'
        ]
      },
      {
        text: 'La circulation de l\'information entre équipes et niveaux hiérarchiques est fluide et fiable.',
        levels: [
          'L\'information est retenue, filtrée ou perdue. Les équipes travaillent souvent sans les données nécessaires.',
          'La circulation est principalement descendante ; la remontée d\'information est faible et peu fiable.',
          'L\'information circule de façon inégale ; certains services sont bien informés, d\'autres isolés.',
          'La circulation est globalement fluide ; des dispositifs de partage sont en place et utilisés.',
          'L\'organisation est transparente par design : l\'information est accessible en temps réel, à la bonne granularité.'
        ]
      }
    ]
  },
  {
    id: 'style',
    label: 'Style managérial',
    englishLabel: 'Style',
    icon: '🧭',
    description: 'Comportements effectifs des dirigeants et culture de prise de décision',
    questions: [
      {
        text: 'Le style de management des dirigeants est cohérent avec les valeurs et la culture affichées par l\'organisation.',
        levels: [
          'Écart manifeste entre discours officiel et comportements observés. La crédibilité des dirigeants en est affectée.',
          'La cohérence est partielle : quelques dirigeants incarnent les valeurs, d\'autres les contredisent ouvertement.',
          'Des efforts sont faits mais des incohérences persistent, perceptibles par les équipes.',
          'La cohérence entre discours et pratiques est généralement perçue positivement ; les écarts sont traités.',
          'Les dirigeants sont des modèles inconditionnels des valeurs, cités comme référence par les équipes.'
        ]
      },
      {
        text: 'Les décisions importantes sont prises de façon transparente et les arbitrages sont clairement expliqués.',
        levels: [
          'Les décisions tombent sans explication. L\'organisation fonctionne en boîte noire.',
          'Certaines décisions sont expliquées, mais le manque de transparence génère régulièrement rumeurs et méfiance.',
          'La transparence est variable selon les dirigeants et les sujets ; les équipes attendent plus d\'explication.',
          'Les décisions importantes sont accompagnées d\'une communication claire sur les raisons et les critères retenus.',
          'La transparence est une valeur opérationnelle : processus documenté, critères partagés, droit au questionnement reconnu.'
        ]
      },
      {
        text: 'Le management favorise l\'autonomie et la prise d\'initiative des collaborateurs.',
        levels: [
          'Le management est directif et contrôlant. L\'initiative est découragée, voire sanctionnée.',
          'L\'autonomie est accordée en discours mais limitée en pratique par une supervision excessive.',
          'L\'autonomie est encouragée dans certains périmètres mais reste conditionnelle à la validation hiérarchique.',
          'Les collaborateurs disposent d\'une réelle latitude d\'action ; la prise d\'initiative est reconnue et valorisée.',
          'L\'autonomie est une norme organisationnelle : les collaborateurs sont responsabilisés sur les résultats, pas sur les méthodes.'
        ]
      },
      {
        text: 'Les désaccords et tensions sont gérés de façon ouverte et constructive plutôt qu\'esquivés.',
        levels: [
          'Les conflits sont niés ou étouffés. La culture du consensus apparent masque des tensions profondes.',
          'Les désaccords émergent mais leur gestion est souvent évitée ou traitée de façon autoritaire.',
          'Certains managers gèrent bien les tensions, d\'autres les esquivent. Pas de pratique partagée.',
          'Les désaccords sont abordés ouvertement et résolus rapidement ; le droit au désaccord est reconnu.',
          'La capacité à gérer les tensions est une force organisationnelle : culture du feedback, pratiques de résolution outillées.'
        ]
      },
      {
        text: 'Les dirigeants incarnent par leurs comportements réels les exigences qu\'ils formulent envers les équipes.',
        levels: [
          'Les dirigeants appliquent des standards différents pour eux-mêmes et leurs équipes. Le double standard est visible.',
          'Des écarts ponctuels sont tolérés et banalisés, sans que cela ne génère de conséquence.',
          'La plupart des dirigeants respectent les standards, mais des exceptions notables fragilisent l\'ensemble.',
          'Les dirigeants sont globalement exemplaires ; les écarts sont rares et traités lorsqu\'ils surviennent.',
          'L\'exemplarité managériale est un principe non négociable, intégré dans l\'évaluation des leaders.'
        ]
      }
    ]
  },
  {
    id: 'staff',
    label: 'Personnel',
    englishLabel: 'Staff',
    icon: '👥',
    description: 'Profils, politique RH, développement et engagement des collaborateurs',
    questions: [
      {
        text: 'Les profils recrutés correspondent aux besoins stratégiques présents et futurs de l\'organisation.',
        levels: [
          'Le recrutement est opportuniste et réactif, sans lien avec les enjeux stratégiques.',
          'Des profils sont définis mais les recrutements réels s\'en éloignent souvent (contraintes budget, urgence).',
          'Le recrutement est partiellement aligné avec les besoins ; des lacunes de profil persistent sur des postes clés.',
          'Les recrutements sont fondés sur des référentiels de compétences liés à la stratégie, régulièrement évalués.',
          'Le recrutement est un acte stratégique : chaque embauche est évaluée à l\'aune des besoins à 3-5 ans.'
        ]
      },
      {
        text: 'L\'organisation dispose d\'une politique active de développement des compétences et d\'évolution professionnelle.',
        levels: [
          'Pas de politique de développement. La formation est ponctuelle, réglementaire, déconnectée des enjeux.',
          'Un plan de formation existe mais son lien avec les besoins réels est ténu ; l\'impact est faible.',
          'Des actions de développement existent mais sont inégalement distribuées selon les équipes ou les managers.',
          'Une politique structurée est en place, avec des plans individuels et des budgets dédiés utilisés efficacement.',
          'Le développement est un investissement stratégique : parcours individualisés, mobilité interne active, culture apprenante.'
        ]
      },
      {
        text: 'L\'organisation sait identifier et fidéliser ses talents clés.',
        levels: [
          'Pas d\'identification formelle des talents. Les départs clés surprennent et fragilisent l\'organisation.',
          'Quelques talents sont identifiés informellement mais sans dispositif structuré de fidélisation.',
          'Un processus de détection des talents existe mais les actions de fidélisation restent limitées ou tardives.',
          'Les talents clés sont identifiés, font l\'objet d\'attentions spécifiques et le taux de rétention est satisfaisant.',
          'La gestion des talents est un avantage compétitif : identification précoce, plans de succession, proposition de valeur distincte.'
        ]
      },
      {
        text: 'La diversité des profils (expériences, formations, perspectives) est valorisée comme source de performance.',
        levels: [
          'L\'organisation recrute et promeut des profils homogènes. La diversité n\'est pas un sujet.',
          'La diversité est évoquée dans les discours mais peu visible dans les faits, notamment aux postes de direction.',
          'Des initiatives existent mais restent isolées ; la diversité n\'est pas encore perçue comme levier de performance.',
          'La diversité des profils est réelle et contribue visiblement à la richesse des décisions et des solutions.',
          'La diversité est un principe de composition des équipes, mesuré et intégré dans les critères de recrutement et de promotion.'
        ]
      },
      {
        text: 'Le niveau d\'engagement et de motivation des équipes est globalement élevé.',
        levels: [
          'Désengagement perceptible : absentéisme élevé, turnover important, manque d\'initiative généralisé.',
          'L\'engagement est inégal : des îlots de motivation coexistent avec des zones de résignation.',
          'L\'engagement est moyen ; les collaborateurs font leur travail sans s\'impliquer au-delà du nécessaire.',
          'Les équipes sont globalement motivées et impliquées ; les signaux d\'engagement sont positifs et mesurés.',
          'L\'engagement est un atout organisationnel : les collaborateurs sont des ambassadeurs, l\'initiative foisonne.'
        ]
      }
    ]
  },
  {
    id: 'competences',
    label: 'Compétences',
    englishLabel: 'Skills',
    icon: '💡',
    description: 'Capacités distinctives et savoir-faire qui constituent l\'avantage de l\'organisation',
    questions: [
      {
        text: 'L\'organisation dispose des compétences collectives nécessaires pour exécuter sa stratégie.',
        levels: [
          'Des lacunes de compétences critiques bloquent directement l\'exécution de la stratégie.',
          'Des manques sont identifiés mais non couverts ; l\'organisation compense par des prestataires ou des contournements.',
          'Les compétences couvrent l\'essentiel des besoins, avec des zones de fragilité sur des sujets stratégiques.',
          'Les compétences clés sont disponibles en interne ; les rares lacunes sont anticipées et adressées.',
          'La base de compétences est un actif stratégique solide, régulièrement cartographié et développé proactivement.'
        ]
      },
      {
        text: 'Les savoir-faire distinctifs de l\'organisation sont identifiés, valorisés et protégés.',
        levels: [
          'L\'organisation n\'a pas identifié ses compétences distinctives ou les sous-estime.',
          'Des savoir-faire existent mais sont concentrés sur quelques individus, sans dispositif de protection.',
          'Certains savoir-faire sont reconnus en interne mais peu formalisés ou valorisés en externe.',
          'Les compétences distinctives sont identifiées, documentées et intégrées dans le positionnement de l\'organisation.',
          'Les savoir-faire clés sont un actif géré : cartographie, protection, valorisation commerciale et institutionnelle.'
        ]
      },
      {
        text: 'Les mécanismes de transfert et de capitalisation des connaissances sont efficaces.',
        levels: [
          'Pas de transfert organisé. Le départ d\'un collaborateur emporte son expertise sans laisser de trace.',
          'Le transfert repose sur la bonne volonté individuelle ; aucun processus formalisé n\'existe.',
          'Des tentatives de capitalisation existent (wikis, documentation) mais leur utilisation effective est faible.',
          'Des mécanismes de transfert fonctionnent : binômes, documentation active, revues de pratiques régulières.',
          'La capitalisation est une routine organisationnelle : chaque projet génère un retour d\'expérience formalisé.'
        ]
      },
      {
        text: 'L\'organisation investit de façon proactive dans le développement de nouvelles compétences stratégiques.',
        levels: [
          'L\'investissement en développement est minimal, perçu comme un coût et non comme un investissement.',
          'Des budgets existent mais sont les premiers coupés en période de tension. Le développement est réactif.',
          'Certaines compétences émergentes sont adressées, mais sans anticipation systématique des besoins futurs.',
          'L\'organisation investit sur des compétences identifiées comme stratégiques à moyen terme.',
          'L\'anticipation des compétences futures est un processus formalisé, articulé au cycle stratégique.'
        ]
      },
      {
        text: 'Les compétences disponibles constituent un avantage compétitif reconnu par les parties prenantes.',
        levels: [
          'Les compétences de l\'organisation ne se distinguent pas de celles des concurrents ou pairs.',
          'Quelques domaines d\'expertise sont reconnus, mais le positionnement compétitif reste flou.',
          'Des avantages compétitifs existent mais sont sous-communiqués ou peu exploités stratégiquement.',
          'Les compétences distinctives contribuent à la réputation de l\'organisation et sont reconnues.',
          'L\'excellence dans des domaines clés est un différenciateur fort, cité spontanément par les clients et partenaires.'
        ]
      }
    ]
  },
  {
    id: 'valeurs',
    label: 'Valeurs partagées',
    englishLabel: 'Shared Values',
    icon: '🔗',
    description: 'Culture organisationnelle fondamentale qui oriente les comportements au-delà des règles',
    questions: [
      {
        text: 'La culture organisationnelle est clairement identifiable et perceptible dans les comportements quotidiens.',
        levels: [
          'Pas de culture identifiable. Chaque entité fonctionne selon ses propres normes implicites.',
          'Une culture existe mais elle est difficile à décrire et peu perceptible de l\'extérieur.',
          'La culture est identifiable dans certains services ou par les anciens collaborateurs, mais pas de façon homogène.',
          'La culture est visible et descriptible ; un observateur extérieur la percevrait rapidement.',
          'La culture est une signature organisationnelle forte, perçue immédiatement et cohérente à tous les niveaux.'
        ]
      },
      {
        text: 'Les valeurs affichées se traduisent effectivement dans les pratiques et décisions réelles de l\'organisation.',
        levels: [
          'Les valeurs affichées sont déconnectées de la réalité quotidienne. L\'écart est source de cynisme.',
          'Certaines valeurs sont respectées, d\'autres régulièrement sacrifiées sous pression.',
          'Les valeurs guident partiellement les pratiques ; des incohérences ponctuelles sont tolérées.',
          'Les valeurs sont opérationnelles : elles influencent réellement les décisions et les comportements.',
          'Les valeurs sont un filtre de décision systématique, revalidé lors des moments clés de l\'organisation.'
        ]
      },
      {
        text: 'Les collaborateurs s\'identifient à la mission et aux valeurs de l\'organisation.',
        levels: [
          'Les collaborateurs n\'ont pas connaissance des valeurs ou les jugent inopérantes.',
          'Une minorité de collaborateurs s\'identifie aux valeurs ; la majorité reste indifférente.',
          'L\'identification est présente chez une partie des collaborateurs, notamment ceux en contact avec la mission.',
          'Les collaborateurs expriment globalement un attachement aux valeurs et à la mission de l\'organisation.',
          'L\'identification à la mission est un moteur de motivation et d\'engagement reconnu par tous.'
        ]
      },
      {
        text: 'La culture facilite la coopération, la confiance mutuelle et le travail collectif.',
        levels: [
          'La culture génère de la compétition interne, de la méfiance et des comportements de rétention d\'information.',
          'La coopération est possible mais coûteuse ; elle nécessite des efforts importants pour surmonter les frictions.',
          'La culture est neutre vis-à-vis de la coopération : elle ne l\'inhibe pas mais ne la favorise pas activement.',
          'La culture facilite la coopération ; la confiance est un capital collectif préservé et valorisé.',
          'La coopération spontanée et la confiance inter-équipes sont des marqueurs culturels distinctifs de l\'organisation.'
        ]
      },
      {
        text: 'En période de changement ou de crise, la culture constitue un facteur de cohésion et de résilience.',
        levels: [
          'En période de crise, la culture amplifie les tensions et fragilise la cohésion.',
          'La culture offre peu de ressources face au changement ; les réactions de repli et de résistance dominent.',
          'La culture atténue partiellement les effets de la crise, sans constituer un véritable amortisseur.',
          'La culture a démontré sa capacité à maintenir la cohésion lors de transformations significatives.',
          'La résilience culturelle est une force reconnue : l\'organisation traverse les crises sans perdre son identité ni sa cohésion.'
        ]
      }
    ]
  }
];

export const SCALE_LABELS = [
  { value: 1, label: 'Inexistant'  },
  { value: 2, label: 'Insuffisant' },
  { value: 3, label: 'Partiel'     },
  { value: 4, label: 'Solide'      },
  { value: 5, label: 'Exemplaire'  }
];
