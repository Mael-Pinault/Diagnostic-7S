export const LEVER = {
  humain:   { label: 'Humain',   color: '#1B5EA6' },
  systemes: { label: 'Systèmes', color: '#D97706' },
  culture:  { label: 'Culture',  color: '#7C3AED' },
  pilotage: { label: 'Pilotage', color: '#0D9488' },
}

export const CHANGE_TYPES = {
  adaptation:   { label: 'Adaptation',   cls: 'ct--adaptation',   desc: "Ajustements ciblés sur 1 à 2 dimensions. Les fondamentaux sont sains — quelques leviers à optimiser sans remettre en cause l'organisation dans son ensemble." },
  evolution:    { label: 'Évolution',    cls: 'ct--evolution',    desc: "Transformation progressive sur 12 à 24 mois. Un rééquilibrage structuré est nécessaire pour aligner plusieurs dimensions durablement." },
  redressement: { label: 'Redressement', cls: 'ct--redressement', desc: "Intervention urgente sur des dysfonctionnements avérés. Des décisions courageuses s'imposent à court terme pour stopper la dégradation." },
  revolution:   { label: 'Révolution',   cls: 'ct--revolution',   desc: "Refondation organisationnelle. La majorité des dimensions sont en tension — une transformation profonde, cohérente et soutenue est inévitable." },
}

export function getChangeType(scoreMap) {
  const scores = Object.values(scoreMap).filter(v => v != null)
  if (!scores.length) return 'adaptation'
  const avg      = scores.reduce((a, b) => a + b, 0) / scores.length
  const critical = scores.filter(s => s < 40).length
  const low      = scores.filter(s => s < 60).length
  if (critical >= 3 || avg < 45) return 'revolution'
  if (critical >= 1 || avg < 58) return 'redressement'
  if (low      >= 3 || avg < 73) return 'evolution'
  return 'adaptation'
}

export const RECO_V2 = {
  strategie: [
    {
      band: [0, 39],
      diagnosis: "La stratégie est absente ou illisible à tous les niveaux. Les décisions sont prises au fil de l'eau, les ressources dispersées, les équipes manquent de cap commun.",
      actions: {
        court: [
          { lever: 'pilotage', text: "Organiser un séminaire de direction (1-2 jours) pour formaliser la vision et les 3 priorités stratégiques sur 18 mois" },
          { lever: 'systemes', text: "Rédiger un document de référence stratégique synthétique (1-2 pages) et le diffuser immédiatement à tous les managers" },
        ],
        moyen: [
          { lever: 'humain',   text: "Former les managers intermédiaires à la déclinaison de la stratégie en objectifs opérationnels mesurables (OKR ou équivalent)" },
          { lever: 'pilotage', text: "Instaurer une revue stratégique trimestrielle avec indicateurs de suivi formalisés et responsables désignés" },
        ],
        long: [
          { lever: 'culture',  text: "Intégrer la stratégie dans les rituels d'équipe, les entretiens annuels et les critères d'arbitrage des décisions d'investissement" },
        ],
      },
    },
    {
      band: [40, 59],
      diagnosis: "Des orientations stratégiques existent mais ne descendent pas jusqu'aux décisions opérationnelles. L'écart entre stratégie affichée et réalité quotidienne génère perte de sens et désalignement des efforts.",
      actions: {
        court: [
          { lever: 'pilotage', text: "Cartographier la cascade stratégique niveau par niveau pour identifier précisément où la stratégie se perd ou se déforme" },
          { lever: 'humain',   text: "Organiser des sessions de clarification des priorités avec chaque équipe (format 'Pourquoi / Pour quoi / Comment')" },
        ],
        moyen: [
          { lever: 'systemes', text: "Mettre en cohérence les allocations budgétaires et les ressources humaines avec les priorités stratégiques déclarées" },
          { lever: 'pilotage', text: "Déployer un tableau de bord stratégique simplifié, visible et mis à jour mensuellement par les managers" },
        ],
        long: [
          { lever: 'culture',  text: "Construire des boucles de feedback bottom-up permettant aux équipes de signaler les incohérences entre cap affiché et réalité opérationnelle" },
        ],
      },
    },
    {
      band: [60, 79],
      diagnosis: "La stratégie est comprise et globalement suivie. La marge de progression porte sur la capacité d'anticipation et d'adaptation face aux signaux faibles de l'environnement.",
      actions: {
        court: [
          { lever: 'systemes', text: "Structurer un dispositif de veille (marché, concurrence, réglementaire) avec remontées formalisées vers la direction" },
        ],
        moyen: [
          { lever: 'pilotage', text: "Instaurer des revues stratégiques semestrielles incluant des scénarios d'adaptation à des hypothèses alternatives" },
          { lever: 'humain',   text: "Initier la direction aux méthodes de planification par scénarios et de stratégie émergente" },
        ],
        long: [
          { lever: 'culture',  text: "Développer une culture d'initiative stratégique à tous les niveaux : valoriser les propositions d'adaptation issues du terrain" },
        ],
      },
    },
    {
      band: [80, 100],
      diagnosis: "La stratégie constitue un actif organisationnel solide. Le risque principal est l'auto-satisfaction et le retard d'adaptation lors de ruptures de marché.",
      actions: {
        court: [
          { lever: 'pilotage', text: "Documenter et partager en interne les pratiques de planification stratégique pour institutionnaliser la compétence" },
        ],
        moyen: [
          { lever: 'humain',   text: "Associer davantage les niveaux intermédiaires à la réflexion stratégique pour élargir la base de détection des opportunités" },
        ],
        long: [
          { lever: 'culture',  text: "Institutionnaliser une capacité d'exploration stratégique : espaces de test, partenariats d'exploration, horizon de veille à 5-10 ans" },
        ],
      },
    },
  ],

  structure: [
    {
      band: [0, 39],
      diagnosis: "La structure génère des blocages significatifs : responsabilités floues, doublons de décision, silos étanches. La performance opérationnelle en est directement affectée.",
      actions: {
        court: [
          { lever: 'pilotage', text: "Cartographier les zones de flou : interfaces sans propriétaire clair, décisions bloquées, conflits de périmètre récurrents" },
          { lever: 'systemes', text: "Formaliser une matrice RACI pour les processus et décisions clés afin de clarifier immédiatement qui décide, exécute et est consulté" },
        ],
        moyen: [
          { lever: 'humain',   text: "Repositionner l'organigramme en cohérence avec la stratégie actuelle, en distinguant structure permanente et dispositifs projets" },
          { lever: 'systemes', text: "Créer ou renforcer les mécanismes de coordination transversale (comités inter-équipes, rôles intégrateurs dédiés)" },
        ],
        long: [
          { lever: 'culture',  text: "Accompagner le changement structurel par un travail sur la culture de collaboration : les comportements changent après la structure, pas avant" },
        ],
      },
    },
    {
      band: [40, 59],
      diagnosis: "La structure présente des inadéquations avec les objectifs poursuivis. Les niveaux d'autorité manquent de clarté et la coordination transversale reste défaillante.",
      actions: {
        court: [
          { lever: 'pilotage', text: "Clarifier le niveau d'autorité de chaque poste clé : qui peut décider quoi, jusqu'à quel seuil, sans escalade hiérarchique" },
        ],
        moyen: [
          { lever: 'systemes', text: "Revoir la structure des réunions et des instances de décision pour réduire les doublons et accélérer les arbitrages" },
          { lever: 'humain',   text: "Évaluer le degré de centralisation actuel et le calibrer aux exigences de réactivité de l'activité" },
        ],
        long: [
          { lever: 'culture',  text: "Travailler la culture de responsabilisation : inciter les équipes à décider à leur niveau sans systématiser l'escalade" },
        ],
      },
    },
    {
      band: [60, 79],
      diagnosis: "L'organisation formelle est adaptée mais optimisable, notamment sur la fluidité des décisions transversales et l'agilité structurelle face aux transformations.",
      actions: {
        court: [
          { lever: 'pilotage', text: "Identifier les goulets d'étranglement décisionnels récurrents et proposer des délégations ciblées pour les déverrouiller" },
        ],
        moyen: [
          { lever: 'humain',   text: "Explorer des formes de coordination plus agiles (équipes projets, rôles transverses) sans déstabiliser la structure de base" },
        ],
        long: [
          { lever: 'pilotage', text: "Mettre en place une revue structurelle annuelle pour s'assurer que l'organisation évolue proactivement avec la stratégie" },
        ],
      },
    },
    {
      band: [80, 100],
      diagnosis: "La structure est un facteur d'efficacité reconnu. La vigilance porte sur l'anticipation des évolutions structurelles lors des prochains changements stratégiques.",
      actions: {
        court: [
          { lever: 'pilotage', text: "Documenter le modèle organisationnel actuel et ses principes de conception pour faciliter son évolution maîtrisée" },
        ],
        moyen: [
          { lever: 'humain',   text: "Préparer les managers aux enjeux d'évolution structurelle liés aux transformations stratégiques anticipées" },
        ],
        long: [
          { lever: 'systemes', text: "Anticiper les besoins structurels à 3 ans : quelles nouvelles fonctions, quel modèle de gouvernance pour les projets de transformation ?" },
        ],
      },
    },
  ],

  systemes: [
    {
      band: [0, 39],
      diagnosis: "Les systèmes de gestion sont défaillants ou non adoptés. L'organisation pilote à vue, sans données fiables ni processus standardisés, générant erreurs récurrentes et réactivité insuffisante.",
      actions: {
        court: [
          { lever: 'pilotage', text: "Cartographier les processus critiques et identifier les zones sans pilotage : là où personne ne sait ce qui se passe réellement" },
          { lever: 'pilotage', text: "Déployer un tableau de bord minimal (5-7 indicateurs) permettant un suivi fiable de l'activité à fréquence hebdomadaire" },
        ],
        moyen: [
          { lever: 'systemes', text: "Formaliser et documenter les processus critiques ; former les équipes aux outils existants avant d'en déployer de nouveaux" },
          { lever: 'humain',   text: "Désigner des 'process owners' responsables du respect et de l'amélioration continue de chaque processus clé" },
        ],
        long: [
          { lever: 'culture',  text: "Développer une culture du process et de la mesure : valoriser la rigueur opérationnelle comme levier de performance collective" },
        ],
      },
    },
    {
      band: [40, 59],
      diagnosis: "Les processus existent mais manquent de cohérence ou d'adoption. Les équipes les contournent, générant des pratiques hétérogènes et une perte de traçabilité.",
      actions: {
        court: [
          { lever: 'humain',   text: "Identifier les causes du non-respect des processus : manque de formation, outils inadaptés, ou procédures perçues comme bureaucratiques ?" },
        ],
        moyen: [
          { lever: 'systemes', text: "Simplifier les processus les moins adoptés en co-construction avec les utilisateurs pour lever les résistances légitimes" },
          { lever: 'pilotage', text: "Instaurer des revues de performance mensuelles par équipe centrées sur les processus clés" },
        ],
        long: [
          { lever: 'culture',  text: "Intégrer le respect des processus comme critère d'évaluation managériale pour ancrer la culture de la rigueur opérationnelle" },
        ],
      },
    },
    {
      band: [60, 79],
      diagnosis: "Les systèmes fonctionnent correctement. Les gains résident dans l'amélioration continue et l'anticipation des besoins liés aux transformations à venir.",
      actions: {
        court: [
          { lever: 'pilotage', text: "Instaurer des cycles semestriels de revue des processus incluant les retours utilisateurs pour identifier les frictions résiduelles" },
        ],
        moyen: [
          { lever: 'systemes', text: "Anticiper les évolutions de systèmes nécessaires en lien avec les projets de transformation stratégique identifiés" },
        ],
        long: [
          { lever: 'systemes', text: "Explorer les capacités analytiques avancées (reporting automatisé, BI) pour accélérer la prise de décision fondée sur les données" },
        ],
      },
    },
    {
      band: [80, 100],
      diagnosis: "Les systèmes constituent un socle de pilotage solide et différenciant. L'enjeu est d'en tirer davantage de valeur analytique et d'anticiper les ruptures technologiques.",
      actions: {
        court: [
          { lever: 'pilotage', text: "Documenter les meilleures pratiques de pilotage pour garantir leur transmission lors des évolutions d'équipe" },
        ],
        moyen: [
          { lever: 'systemes', text: "Explorer l'intégration de capacités prédictives ou d'automatisation pour libérer du temps décisionnel à haute valeur ajoutée" },
        ],
        long: [
          { lever: 'humain',   text: "Former les managers à l'exploitation avancée des données disponibles pour développer une culture de la décision éclairée" },
        ],
      },
    },
  ],

  style: [
    {
      band: [0, 39],
      diagnosis: "Des écarts significatifs entre management affiché et pratiqué fragilisent la crédibilité des dirigeants. L'engagement des équipes en pâtit directement, avec des risques de turnover et de désengagement silencieux.",
      actions: {
        court: [
          { lever: 'humain',   text: "Conduire un diagnostic du vécu managérial : enquête anonyme ou entretiens individuels pour objectiver l'écart entre management affiché et ressenti" },
          { lever: 'humain',   text: "Travailler en priorité la cohérence actes/discours avec le top management : les comportements du sommet conditionnent l'ensemble de la culture" },
        ],
        moyen: [
          { lever: 'humain',   text: "Déployer un programme de développement du leadership centré sur la posture et la communication authentique" },
          { lever: 'culture',  text: "Instaurer des espaces de dialogue réguliers (team meetings, entretiens 1:1 formalisés) pour recréer la confiance dans la relation managériale" },
        ],
        long: [
          { lever: 'culture',  text: "Intégrer les comportements managériaux attendus dans les référentiels d'évaluation et faire du leadership un critère de progression explicite" },
        ],
      },
    },
    {
      band: [40, 59],
      diagnosis: "Le style managérial est insuffisamment cohérent ou mal adapté aux enjeux. Des pratiques disparates entre managers créent des inégalités de vécu selon les équipes.",
      actions: {
        court: [
          { lever: 'humain',   text: "Définir collectivement les comportements managériaux non-négociables et les rendre visibles (charte, engagements formalisés)" },
        ],
        moyen: [
          { lever: 'humain',   text: "Déployer un programme de formation managériale commun pour homogénéiser les pratiques sur les fondamentaux" },
          { lever: 'pilotage', text: "Mettre en place un feedback 360° pour les managers afin de rendre les écarts de style objectivables et discutables" },
        ],
        long: [
          { lever: 'culture',  text: "Construire une communauté managériale active (pairs learning, co-développement) pour que les managers progressent et se régulent mutuellement" },
        ],
      },
    },
    {
      band: [60, 79],
      diagnosis: "Le management est perçu positivement. Les marges de progression portent sur la personnalisation du style selon les profils et la gestion constructive des tensions.",
      actions: {
        court: [
          { lever: 'humain',   text: "Former les managers au management situationnel : adapter leur posture au niveau d'autonomie et de compétence de chaque collaborateur" },
        ],
        moyen: [
          { lever: 'humain',   text: "Développer la capacité des managers à gérer les conflits et tensions de manière constructive plutôt qu'à les éviter" },
        ],
        long: [
          { lever: 'culture',  text: "Pérenniser la qualité managériale lors des phases de croissance : intégrer les nouveaux managers dans la culture avant qu'ils prennent leurs fonctions" },
        ],
      },
    },
    {
      band: [80, 100],
      diagnosis: "Le style managérial est une source de cohésion et d'attractivité. L'enjeu est de préserver cette qualité lors des phases de croissance et de renouvellement des équipes.",
      actions: {
        court: [
          { lever: 'humain',   text: "Identifier et valoriser les managers exemplaires comme relais de la culture managériale auprès de leurs pairs" },
        ],
        moyen: [
          { lever: 'humain',   text: "Structurer le parcours d'intégration des nouveaux managers pour transmettre les codes managériaux constitutifs de la culture" },
        ],
        long: [
          { lever: 'culture',  text: "Faire du style managérial un argument de marque employeur différenciant, visible dès les processus de recrutement et d'onboarding" },
        ],
      },
    },
  ],

  staff: [
    {
      band: [0, 39],
      diagnosis: "La politique RH est insuffisante pour répondre aux enjeux. Des postes clés sont fragilisés, des compétences critiques manquent, et la dépendance à quelques individus crée des vulnérabilités majeures.",
      actions: {
        court: [
          { lever: 'humain',   text: "Cartographier les postes critiques et identifier les 'single points of failure' : qui, en partant, mettrait l'organisation en difficulté ?" },
          { lever: 'humain',   text: "Engager immédiatement les actions de rétention pour les profils identifiés comme essentiels et à risque de départ" },
        ],
        moyen: [
          { lever: 'humain',   text: "Refondre la stratégie d'acquisition de talents : proposition de valeur employeur, canaux de recrutement, critères de sélection alignés sur les enjeux futurs" },
          { lever: 'systemes', text: "Structurer une GPEC (Gestion Prévisionnelle des Emplois et Compétences) pour piloter l'évolution des profils dans le temps" },
        ],
        long: [
          { lever: 'culture',  text: "Construire une marque employeur cohérente avec la culture et la stratégie pour attirer des profils alignés sur le projet de l'organisation" },
        ],
      },
    },
    {
      band: [40, 59],
      diagnosis: "Des lacunes dans la gestion des talents génèrent des fragilités opérationnelles. Les processus RH existent mais ne sont pas suffisamment différenciants ni proactifs.",
      actions: {
        court: [
          { lever: 'humain',   text: "Identifier les top performers et lancer des actions de fidélisation ciblées : reconnaissance, développement, mobilité interne" },
        ],
        moyen: [
          { lever: 'humain',   text: "Structurer les parcours de développement des profils à potentiel et formaliser les plans de succession pour les postes clés" },
          { lever: 'systemes', text: "Renforcer les entretiens annuels comme outil de management actif, pas seulement comme formalité administrative" },
        ],
        long: [
          { lever: 'culture',  text: "Développer la proposition de valeur employeur et la rendre cohérente à toutes les étapes du cycle de vie collaborateur" },
        ],
      },
    },
    {
      band: [60, 79],
      diagnosis: "La gestion RH est solide. La marge de progression porte sur l'anticipation des besoins futurs et la diversification des viviers de compétences.",
      actions: {
        court: [
          { lever: 'humain',   text: "Anticiper les besoins en compétences liés aux transformations stratégiques identifiées sur les 18-36 prochains mois" },
        ],
        moyen: [
          { lever: 'humain',   text: "Développer la mobilité interne comme levier de rétention et d'enrichissement des profils" },
          { lever: 'systemes', text: "Diversifier les viviers de recrutement pour réduire les biais de sélection et élargir les perspectives de renouvellement" },
        ],
        long: [
          { lever: 'culture',  text: "Positionner l'organisation comme acteur de développement des talents dans son écosystème (apprentissage, partenariats écoles, alternance)" },
        ],
      },
    },
    {
      band: [80, 100],
      diagnosis: "La qualité et l'engagement des équipes constituent un avantage concurrentiel réel. L'enjeu est de maintenir ce niveau dans un marché du travail compétitif et lors des phases de croissance.",
      actions: {
        court: [
          { lever: 'humain',   text: "Documenter ce qui fait la qualité de l'expérience collaborateur pour pouvoir la préserver et la transposer à l'échelle" },
        ],
        moyen: [
          { lever: 'humain',   text: "Investir dans des programmes de reconnaissance et de développement pour maintenir le niveau d'engagement dans la durée" },
        ],
        long: [
          { lever: 'culture',  text: "Gérer proactivement le risque de dilution culturelle lors des phases de recrutement intense ou d'intégration d'équipes externes" },
        ],
      },
    },
  ],

  competences: [
    {
      band: [0, 39],
      diagnosis: "L'organisation manque de compétences distinctives sur ses activités cœur. L'exécution de la stratégie est fragilisée et des dépendances externes non maîtrisées créent des vulnérabilités.",
      actions: {
        court: [
          { lever: 'humain',   text: "Conduire un audit des compétences disponibles versus requises pour l'exécution de la stratégie, en distinguant compétences critiques et support" },
          { lever: 'humain',   text: "Arbitrer immédiatement entre développement interne, recrutement ciblé et partenariats externes pour les compétences les plus critiques" },
        ],
        moyen: [
          { lever: 'humain',   text: "Structurer un plan de développement des compétences prioritaires avec objectifs mesurables et budget alloué" },
          { lever: 'systemes', text: "Mettre en place un référentiel de compétences et un système de cartographie pour suivre les acquis et lacunes dans le temps" },
        ],
        long: [
          { lever: 'culture',  text: "Construire une organisation apprenante : capitalisation des savoirs, transfert intergénérationnel, culture de la montée en compétence continue" },
        ],
      },
    },
    {
      band: [40, 59],
      diagnosis: "Les compétences disponibles couvrent partiellement les besoins. Des zones de fragilité subsistent sur des activités importantes, avec un risque de perte en cas de départ de profils clés.",
      actions: {
        court: [
          { lever: 'humain',   text: "Cartographier les compétences critiques détenues par peu de personnes et lancer des plans de redondance (doublures, documentation des savoirs)" },
        ],
        moyen: [
          { lever: 'systemes', text: "Structurer les mécanismes de capitalisation : bases de connaissance, retours d'expérience formalisés, procédures documentées" },
          { lever: 'humain',   text: "Développer des parcours de formation internes sur les compétences les plus fréquemment identifiées comme manquantes" },
        ],
        long: [
          { lever: 'culture',  text: "Valoriser le partage des compétences comme comportement collectif : mentoring, pair learning, contributions à la base de connaissance" },
        ],
      },
    },
    {
      band: [60, 79],
      diagnosis: "Les compétences clés sont présentes. Le levier de différenciation réside dans la formalisation des savoir-faire distinctifs et dans la construction d'une capacité d'apprentissage collectif.",
      actions: {
        court: [
          { lever: 'systemes', text: "Formaliser les savoir-faire distinctifs de l'organisation pour les rendre transmissibles et moins dépendants de quelques individus" },
        ],
        moyen: [
          { lever: 'humain',   text: "Développer des programmes de partage de compétences inter-équipes pour enrichir les profils et décloisonner les expertises" },
        ],
        long: [
          { lever: 'culture',  text: "Maintenir une veille active sur les compétences émergentes dans le secteur pour anticiper les besoins à 3-5 ans" },
        ],
      },
    },
    {
      band: [80, 100],
      diagnosis: "Les compétences organisationnelles constituent une source d'avantage compétitif réel. Le risque est leur érosion progressive par manque de transmission ou d'anticipation des évolutions.",
      actions: {
        court: [
          { lever: 'systemes', text: "Renforcer la documentation des savoir-faire clés pour garantir leur transmission et leur préservation dans le temps" },
        ],
        moyen: [
          { lever: 'humain',   text: "Structurer un programme de transfert intergénérationnel des compétences critiques avec des binômes dédiés" },
        ],
        long: [
          { lever: 'humain',   text: "Maintenir une veille sur les compétences émergentes et investir en anticipation pour conserver l'avance compétitive" },
        ],
      },
    },
  ],

  valeurs: [
    {
      band: [0, 39],
      diagnosis: "La culture organisationnelle est peu lisible ou génère des comportements contre-productifs. Les valeurs affichées et les pratiques réelles divergent fortement, détruisant confiance et cohésion.",
      actions: {
        court: [
          { lever: 'humain',   text: "Conduire des entretiens qualitatifs pour révéler les valeurs réelles (celles qui guident effectivement les comportements) versus les valeurs déclarées" },
          { lever: 'humain',   text: "Mettre en débat ouvert les comportements contre-productifs observés sans les nier : nommer la réalité est le premier acte de transformation culturelle" },
        ],
        moyen: [
          { lever: 'culture',  text: "Co-construire avec les équipes un référentiel de comportements attendus, ancré sur des situations concrètes plutôt que sur des abstractions valorisantes" },
          { lever: 'humain',   text: "Aligner les pratiques RH (recrutement, évaluation, promotion) sur les comportements cibles pour crédibiliser la démarche" },
        ],
        long: [
          { lever: 'culture',  text: "Construire des rituels collectifs qui incarnent les valeurs cibles et les rendent visibles dans le quotidien de l'organisation" },
        ],
      },
    },
    {
      band: [40, 59],
      diagnosis: "Les valeurs existent mais ne se traduisent pas suffisamment dans les pratiques réelles. Le management de proximité n'incarne pas encore les valeurs pour en faire une réalité vécue.",
      actions: {
        court: [
          { lever: 'humain',   text: "Former et coacher le management intermédiaire à l'incarnation des valeurs : ce sont eux qui les crédibilisent ou les décrédibilisent au quotidien" },
        ],
        moyen: [
          { lever: 'systemes', text: "Intégrer les valeurs dans les processus RH : critères de recrutement, objectifs d'évaluation, critères de promotion et de reconnaissance" },
          { lever: 'culture',  text: "Créer ou renforcer les rituels collectifs qui donnent corps aux valeurs : moments de reconnaissance, partage de succès, gestion publique des échecs" },
        ],
        long: [
          { lever: 'pilotage', text: "Mesurer annuellement l'évolution de la culture perçue et rendre visible la progression pour maintenir la dynamique de transformation" },
        ],
      },
    },
    {
      band: [60, 79],
      diagnosis: "La culture est un facteur de cohésion reconnu. Le renforcement porte sur sa capacité à traverser les changements sans s'éroder.",
      actions: {
        court: [
          { lever: 'culture',  text: "Ritualiser les temps de sens collectif pour maintenir la cohésion culturelle lors des périodes de changement et d'incertitude" },
        ],
        moyen: [
          { lever: 'humain',   text: "Associer les équipes aux évolutions des valeurs ou de leur expression : la culture vivante se co-construit, elle ne s'impose pas" },
        ],
        long: [
          { lever: 'systemes', text: "Veiller à la cohérence culturelle lors des recrutements et intégrations d'équipes externes : la culture se dilue lors des phases de croissance rapide" },
        ],
      },
    },
    {
      band: [80, 100],
      diagnosis: "La culture organisationnelle est un atout différenciant et un facteur de résilience avéré. L'enjeu est de la préserver lors des transformations sans en faire un frein au changement.",
      actions: {
        court: [
          { lever: 'humain',   text: "Identifier et mobiliser les gardiens informels de la culture comme ambassadeurs lors des prochaines phases de transformation" },
        ],
        moyen: [
          { lever: 'culture',  text: "Distinguer les invariants culturels à préserver des pratiques à faire évoluer : toute transformation réussie respecte ce qui fait l'identité de l'organisation" },
        ],
        long: [
          { lever: 'culture',  text: "Utiliser la force culturelle comme argument de marque employeur et de différenciation visible auprès des partenaires et clients" },
        ],
      },
    },
  ],
}

export function getRecoV2(dimId, score) {
  const recs = RECO_V2[dimId]
  if (!recs) return null
  return recs.find(r => score >= r.band[0] && score <= r.band[1]) ?? null
}
