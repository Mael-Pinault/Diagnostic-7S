export const RECOMMENDATIONS = {
  strategie: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: 'La stratégie est insuffisamment formalisée ou partagée. Engager en priorité un travail de clarification stratégique : définir la vision à 3-5 ans, formaliser les choix assumés et les renoncements, et les inscrire dans un document de référence accessible à tous les niveaux.' },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: "Des orientations stratégiques existent mais peinent à irriguer les décisions opérationnelles. Travailler la déclinaison de la stratégie en objectifs cascadés et vérifier la cohérence entre les priorités affichées et l'allocation effective des ressources." },
    { band: [60,79],  priority: 'medium', label: "Axe d'amélioration", text: "La stratégie est établie et comprise. Le levier de progrès réside dans le renforcement des capacités de veille et d'adaptation : instituer des revues stratégiques périodiques et des mécanismes d'alerte précoce face aux signaux faibles de l'environnement." },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: "La dimension stratégique est un atout distinct. Tirer parti de cette maturité pour accélérer l'appropriation de la stratégie par l'ensemble des équipes et en faire un levier d'engagement et d'alignement organisationnel." }
  ],
  structure: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: "La structure organisationnelle génère des blocages et des ambiguïtés de responsabilité qui pèsent sur la performance. Conduire un diagnostic des interfaces et des zones de flou, puis repositionner l'organigramme en cohérence avec les enjeux stratégiques actuels." },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: "La structure présente des inadéquations avec les objectifs poursuivis. Revoir la clarté des périmètres et des niveaux d'autorité, et renforcer les mécanismes de coordination transversale pour réduire les silos fonctionnels." },
    { band: [60,79],  priority: 'medium', label: "Axe d'amélioration", text: "L'organisation formelle est adaptée mais peut être optimisée. Explorer des formes de coordination plus agiles (comités transverses, rôles intégrateurs) et s'assurer que le degré de centralisation est calibré aux enjeux de réactivité." },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: "La structure est un facteur d'efficacité reconnu. Surveiller que l'organisation évolue proactivement face aux transformations stratégiques plutôt que de subir des adaptations tardives." }
  ],
  systemes: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: "Les systèmes de gestion sont défaillants ou non adoptés. Priorité à la cartographie des processus clés, à l'identification des zones sans pilotage, et à la mise en place d'un tableau de bord minimal permettant un suivi fiable de l'activité." },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: "Les processus existent mais manquent de cohérence ou d'adoption. Renforcer la formalisation des processus critiques, former les équipes aux outils en place et instaurer des revues de performance régulières." },
    { band: [60,79],  priority: 'medium', label: "Axe d'amélioration", text: "Les systèmes fonctionnent. Le gain se situe dans l'amélioration continue : instaurer des cycles de revue des processus, intégrer les retours des utilisateurs et anticiper les besoins liés à la croissance ou aux transformations." },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: "Les systèmes constituent un socle de pilotage solide. Tirer parti de cette maturité pour développer des capacités analytiques avancées (BI, prédictif) et accélérer la prise de décision fondée sur les données." }
  ],
  style: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: "Des écarts significatifs entre le management affiché et pratiqué fragilisent la crédibilité des dirigeants et l'engagement des équipes. Un travail de fond sur la posture managériale et la cohérence actes/discours est incontournable." },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: "Le style managérial est insuffisamment cohérent ou adapté aux enjeux. Engager un programme de développement du leadership, travailler la transparence des décisions et encourager des modes de management plus responsabilisants." },
    { band: [60,79],  priority: 'medium', label: "Axe d'amélioration", text: "Le management est perçu positivement mais des marges existent. Renforcer la capacité des managers à gérer les tensions constructivement et à personnaliser leur style en fonction des profils et des situations." },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: "Le style managérial est une source de cohésion et d'attractivité. Le maintenir en veillant à ce que les nouveaux managers intègrent les codes culturels et en évitant la dilution lors des phases de croissance." }
  ],
  staff: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: "La politique RH est insuffisante pour répondre aux enjeux de l'organisation. Refondre la stratégie d'acquisition et de développement des talents, en commençant par un audit des compétences disponibles versus requises." },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: "Des lacunes dans la gestion des talents génèrent des fragilités. Structurer une politique de fidélisation des profils clés, renforcer les parcours de développement et travailler la proposition de valeur employeur." },
    { band: [60,79],  priority: 'medium', label: "Axe d'amélioration", text: "La gestion RH est solide. Renforcer la dimension prospective : anticiper les besoins en compétences liés aux transformations stratégiques et diversifier les viviers de recrutement." },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: "La qualité et l'engagement des équipes constituent un avantage concurrentiel. Investir dans des programmes de reconnaissance et de développement pour maintenir ce niveau dans un marché du travail compétitif." }
  ],
  competences: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: "L'organisation manque de compétences distinctives, ce qui fragilise l'exécution de la stratégie. Identifier les savoir-faire critiques manquants, arbitrer entre développement interne, recrutement et partenariats externes." },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: "Les compétences disponibles couvrent partiellement les besoins. Structurer un plan de développement des compétences prioritaires et mettre en place des mécanismes de capitalisation des savoirs pour éviter leur perte." },
    { band: [60,79],  priority: 'medium', label: "Axe d'amélioration", text: "Les compétences clés sont présentes. Le levier de différenciation réside dans la formalisation des savoir-faire distinctifs et dans la construction de programmes de partage et de montée en compétence collectifs." },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: "Les compétences organisationnelles sont une source d'avantage compétitif. Protéger ce capital en renforçant la documentation, le transfert intergénérationnel et la veille sur les compétences émergentes." }
  ],
  valeurs: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: "La culture organisationnelle est peu lisible ou génère des comportements contre-productifs. Un travail de fond sur la clarification des valeurs réelles (non affichées) et leur traduction en comportements attendus est prioritaire." },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: "Les valeurs existent mais ne se traduisent pas suffisamment dans les pratiques réelles. Travailler l'incarnation des valeurs par le management, rituels collectifs et intégration dans les processus RH (recrutement, évaluation)." },
    { band: [60,79],  priority: 'medium', label: "Axe d'amélioration", text: "La culture est un facteur de cohésion reconnu. Renforcer son rôle dans les moments de changement : ritualiser les temps de sens, associer les équipes aux évolutions et veiller à la cohérence culturelle lors des recrutements." },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: "La culture organisationnelle est un atout différenciant et un facteur de résilience. La préserver lors des phases de transformation, et en faire un argument visible dans la marque employeur et la relation aux partenaires." }
  ]
}

export function getReco(dimId, score) {
  return RECOMMENDATIONS[dimId].find(r => score >= r.band[0] && score <= r.band[1])
}
