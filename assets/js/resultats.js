import supabase from './supabase-client.js';
import { DIMENSIONS } from './questionnaire-data.js';

// ============================================================
// RECOMMENDATIONS DATA
// Band: 0-39 | 40-59 | 60-79 | 80-100
// ============================================================
const RECOMMENDATIONS = {
  strategie: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: 'La stratégie est insuffisamment formalisée ou partagée. Engager en priorité un travail de clarification stratégique : définir la vision à 3-5 ans, formaliser les choix assumés et les renoncements, et les inscrire dans un document de référence accessible à tous les niveaux.' },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: 'Des orientations stratégiques existent mais peinent à irriguer les décisions opérationnelles. Travailler la déclinaison de la stratégie en objectifs cascadés et vérifier la cohérence entre les priorités affichées et l\'allocation effective des ressources.' },
    { band: [60,79],  priority: 'medium', label: 'Axe d\'amélioration', text: 'La stratégie est établie et comprise. Le levier de progrès réside dans le renforcement des capacités de veille et d\'adaptation : instituer des revues stratégiques périodiques et des mécanismes d\'alerte précoce face aux signaux faibles de l\'environnement.' },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: 'La dimension stratégique est un atout distinct. Tirer parti de cette maturité pour accélérer l\'appropriation de la stratégie par l\'ensemble des équipes et en faire un levier d\'engagement et d\'alignement organisationnel.' }
  ],
  structure: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: 'La structure organisationnelle génère des blocages et des ambiguïtés de responsabilité qui pèsent sur la performance. Conduire un diagnostic des interfaces et des zones de flou, puis repositionner l\'organigramme en cohérence avec les enjeux stratégiques actuels.' },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: 'La structure présente des inadéquations avec les objectifs poursuivis. Revoir la clarté des périmètres et des niveaux d\'autorité, et renforcer les mécanismes de coordination transversale pour réduire les silos fonctionnels.' },
    { band: [60,79],  priority: 'medium', label: 'Axe d\'amélioration', text: 'L\'organisation formelle est adaptée mais peut être optimisée. Explorer des formes de coordination plus agiles (comités transverses, rôles intégrateurs) et s\'assurer que le degré de centralisation est calibré aux enjeux de réactivité.' },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: 'La structure est un facteur d\'efficacité reconnu. Surveiller que l\'organisation évolue proactivement face aux transformations stratégiques plutôt que de subir des adaptations tardives.' }
  ],
  systemes: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: 'Les systèmes de gestion sont défaillants ou non adoptés. Priorité à la cartographie des processus clés, à l\'identification des zones sans pilotage, et à la mise en place d\'un tableau de bord minimal permettant un suivi fiable de l\'activité.' },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: 'Les processus existent mais manquent de cohérence ou d\'adoption. Renforcer la formalisation des processus critiques, former les équipes aux outils en place et instaurer des revues de performance régulières.' },
    { band: [60,79],  priority: 'medium', label: 'Axe d\'amélioration', text: 'Les systèmes fonctionnent. Le gain se situe dans l\'amélioration continue : instaurer des cycles de revue des processus, intégrer les retours des utilisateurs et anticiper les besoins liés à la croissance ou aux transformations.' },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: 'Les systèmes constituent un socle de pilotage solide. Tirer parti de cette maturité pour développer des capacités analytiques avancées (BI, prédictif) et accélérer la prise de décision fondée sur les données.' }
  ],
  style: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: 'Des écarts significatifs entre le management affiché et pratiqué fragilisent la crédibilité des dirigeants et l\'engagement des équipes. Un travail de fond sur la posture managériale et la cohérence actes/discours est incontournable.' },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: 'Le style managérial est insuffisamment cohérent ou adapté aux enjeux. Engager un programme de développement du leadership, travailler la transparence des décisions et encourager des modes de management plus responsabilisants.' },
    { band: [60,79],  priority: 'medium', label: 'Axe d\'amélioration', text: 'Le management est perçu positivement mais des marges existent. Renforcer la capacité des managers à gérer les tensions constructivement et à personnaliser leur style en fonction des profils et des situations.' },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: 'Le style managérial est une source de cohésion et d\'attractivité. Le maintenir en veillant à ce que les nouveaux managers intègrent les codes culturels et en évitant la dilution lors des phases de croissance.' }
  ],
  staff: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: 'La politique RH est insuffisante pour répondre aux enjeux de l\'organisation. Refondre la stratégie d\'acquisition et de développement des talents, en commençant par un audit des compétences disponibles versus requises.' },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: 'Des lacunes dans la gestion des talents génèrent des fragilités. Structurer une politique de fidélisation des profils clés, renforcer les parcours de développement et travailler la proposition de valeur employeur.' },
    { band: [60,79],  priority: 'medium', label: 'Axe d\'amélioration', text: 'La gestion RH est solide. Renforcer la dimension prospective : anticiper les besoins en compétences liés aux transformations stratégiques et diversifier les viviers de recrutement.' },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: 'La qualité et l\'engagement des équipes constituent un avantage concurrentiel. Investir dans des programmes de reconnaissance et de développement pour maintenir ce niveau dans un marché du travail compétitif.' }
  ],
  competences: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: 'L\'organisation manque de compétences distinctives, ce qui fragilise l\'exécution de la stratégie. Identifier les savoir-faire critiques manquants, arbitrer entre développement interne, recrutement et partenariats externes.' },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: 'Les compétences disponibles couvrent partiellement les besoins. Structurer un plan de développement des compétences prioritaires et mettre en place des mécanismes de capitalisation des savoirs pour éviter leur perte.' },
    { band: [60,79],  priority: 'medium', label: 'Axe d\'amélioration', text: 'Les compétences clés sont présentes. Le levier de différenciation réside dans la formalisation des savoir-faire distinctifs et dans la construction de programmes de partage et de montée en compétence collectifs.' },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: 'Les compétences organisationnelles sont une source d\'avantage compétitif. Protéger ce capital en renforçant la documentation, le transfert intergénérationnel et la veille sur les compétences émergentes.' }
  ],
  valeurs: [
    { band: [0,39],   priority: 'high',   label: 'Action prioritaire', text: 'La culture organisationnelle est peu lisible ou génère des comportements contre-productifs. Un travail de fond sur la clarification des valeurs réelles (non affichées) et leur traduction en comportements attendus est prioritaire.' },
    { band: [40,59],  priority: 'high',   label: 'Axe de développement', text: 'Les valeurs existent mais ne se traduisent pas suffisamment dans les pratiques réelles. Travailler l\'incarnation des valeurs par le management, rituels collectifs et intégration dans les processus RH (recrutement, évaluation).' },
    { band: [60,79],  priority: 'medium', label: 'Axe d\'amélioration', text: 'La culture est un facteur de cohésion reconnu. Renforcer son rôle dans les moments de changement : ritualiser les temps de sens, associer les équipes aux évolutions et veiller à la cohérence culturelle lors des recrutements.' },
    { band: [80,100], priority: 'low',    label: 'Point fort à capitaliser', text: 'La culture organisationnelle est un atout différenciant et un facteur de résilience. La préserver lors des phases de transformation, et en faire un argument visible dans la marque employeur et la relation aux partenaires.' }
  ]
};

// ============================================================
// UTILS
// ============================================================
function scoreBand(score) {
  if (score < 40) return 'critical';
  if (score < 60) return 'low';
  if (score < 80) return 'medium';
  if (score < 90) return 'good';
  return 'excellent';
}

function globalLabel(score) {
  if (score < 40) return { label: 'Organisation en difficulté',  cls: 'badge--critical' };
  if (score < 60) return { label: 'Organisation en transition',  cls: 'badge--low' };
  if (score < 75) return { label: 'Organisation structurée',     cls: 'badge--medium' };
  if (score < 88) return { label: 'Organisation performante',    cls: 'badge--good' };
  return                 { label: 'Organisation exemplaire',     cls: 'badge--excellent' };
}

function getReco(dimId, score) {
  return RECOMMENDATIONS[dimId].find(r => score >= r.band[0] && score <= r.band[1]);
}

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function calculateScores(answers) {
  const scores = {};
  DIMENSIONS.forEach(dim => {
    const ans = answers[dim.id] || [];
    const sum = ans.reduce((a, b) => a + (b || 0), 0);
    scores[dim.id] = Math.round((sum / 25) * 100);
  });
  return scores;
}

// ============================================================
// CHART
// ============================================================
function renderRadar(scores) {
  const ctx = document.getElementById('radar-chart').getContext('2d');
  const labels = DIMENSIONS.map(d => d.label);
  const data   = DIMENSIONS.map(d => scores[d.id] || 0);

  new Chart(ctx, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Score',
        data,
        backgroundColor: 'rgba(13,31,60,0.12)',
        borderColor: '#C9A84C',
        borderWidth: 2.5,
        pointBackgroundColor: '#C9A84C',
        pointBorderColor: '#fff',
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            display: false
          },
          grid: { color: 'rgba(0,0,0,0.06)' },
          angleLines: { color: 'rgba(0,0,0,0.06)' },
          pointLabels: {
            font: { family: 'Inter', size: 11, weight: '600' },
            color: '#4A5A72'
          }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.raw} / 100`
          }
        }
      }
    }
  });
}

// ============================================================
// RENDER SECTIONS
// ============================================================
function renderHero(data, globalScore) {
  const gl = globalLabel(globalScore);
  const userTypeLabel = data.user_type === 'consultant' ? 'Évaluation consultant' : 'Auto-évaluation dirigeant';

  return `
    <div class="r-hero">
      <div class="r-hero__left">
        <div class="r-hero__eyebrow">Rapport de diagnostic — Modèle McKinsey 7S</div>
        <div class="r-hero__org">${data.company_name || 'Organisation'}</div>
        <div class="r-hero__meta">
          <span class="r-meta-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${formatDate(data.created_at)}
          </span>
          ${data.sector ? `<span class="r-meta-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>
            ${data.sector}
          </span>` : ''}
          <span class="r-meta-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            ${userTypeLabel}${data.respondent_name ? ' · ' + data.respondent_name : ''}
          </span>
        </div>
      </div>
      <div class="r-hero__score">
        <div class="r-score-ring">
          <span class="r-score-ring__value">${globalScore}</span>
          <span class="r-score-ring__suffix">/100</span>
        </div>
        <div class="r-score-badge ${gl.cls}">${gl.label}</div>
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);margin-top:0.25rem;">Score d'alignement global</div>
      </div>
    </div>
  `;
}

function renderDimScores(scores) {
  return `
    <div class="r-card">
      <div class="r-card__header">
        <span class="r-card__title">Scores par dimension</span>
      </div>
      <div class="r-dim-list">
        ${DIMENSIONS.map(dim => {
          const s = scores[dim.id] || 0;
          const band = scoreBand(s);
          return `
            <div class="r-dim-item">
              <span class="r-dim-icon">${dim.icon}</span>
              <div class="r-dim-info">
                <div class="r-dim-name">${dim.label}</div>
                <div class="r-dim-bar-track">
                  <div class="r-dim-bar-fill score--${band}" style="width:${s}%"></div>
                </div>
              </div>
              <span class="r-dim-score">${s}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderAnalysis(scores) {
  const sorted = DIMENSIONS.map(d => ({ ...d, score: scores[d.id] || 0 }))
    .sort((a, b) => b.score - a.score);

  const forces    = sorted.slice(0, 3);
  const vigilance = sorted.slice(-3).reverse();

  const forceItems = forces.map(d => `
    <div class="r-analysis-item">
      <span class="r-analysis-item__badge">${d.score}/100</span>
      <span class="r-analysis-item__text">
        <span class="r-analysis-item__dim">${d.label}</span> —
        ${d.score >= 80 ? 'Dimension maîtrisée, source d\'avantage à préserver et à valoriser.' :
          d.score >= 60 ? 'Dimension bien établie, constitue un socle de stabilité organisationnelle.' :
          'Meilleure performance relative — levier à renforcer en priorité.'}
      </span>
    </div>
  `).join('');

  const vigilanceItems = vigilance.map(d => `
    <div class="r-analysis-item">
      <span class="r-analysis-item__badge">${d.score}/100</span>
      <span class="r-analysis-item__text">
        <span class="r-analysis-item__dim">${d.label}</span> —
        ${d.score < 40 ? 'Zone critique nécessitant une action corrective immédiate.' :
          d.score < 60 ? 'Zone de fragilité — un plan de développement structuré est recommandé.' :
          'Marge de progression identifiée — optimisation possible à moyen terme.'}
      </span>
    </div>
  `).join('');

  return `
    <div class="r-analysis">
      <div class="r-analysis-card r-analysis-card--forces">
        <div class="r-analysis-card__header">
          <span class="r-analysis-card__icon">✦</span>
          <span class="r-analysis-card__title">Points forts</span>
        </div>
        <div class="r-analysis-items">${forceItems}</div>
      </div>
      <div class="r-analysis-card r-analysis-card--vigilance">
        <div class="r-analysis-card__header">
          <span class="r-analysis-card__icon">⚑</span>
          <span class="r-analysis-card__title">Points de vigilance</span>
        </div>
        <div class="r-analysis-items">${vigilanceItems}</div>
      </div>
    </div>
  `;
}

function renderRecommendations(scores) {
  const sorted = DIMENSIONS.map(d => ({ ...d, score: scores[d.id] || 0 }))
    .sort((a, b) => a.score - b.score); // priorité : scores les plus bas d'abord

  const cards = sorted.map(dim => {
    const reco = getReco(dim.id, dim.score);
    if (!reco) return '';
    return `
      <div class="r-reco-card">
        <div class="r-reco-card__top">
          <div class="r-reco-card__dim">
            <span class="r-reco-card__icon">${dim.icon}</span>
            <span class="r-reco-card__name">${dim.label}</span>
          </div>
          <div style="display:flex;align-items:center;gap:0.5rem;">
            <span class="r-reco-card__score">${dim.score}/100</span>
            <span class="r-reco-priority priority--${reco.priority}">
              ${reco.priority === 'high' ? 'Prioritaire' : reco.priority === 'medium' ? 'Moyen terme' : 'À consolider'}
            </span>
          </div>
        </div>
        <div class="r-reco-card__body">
          <div class="r-reco-card__label">${reco.label}</div>
          <div class="r-reco-card__text">${reco.text}</div>
        </div>
      </div>
    `;
  }).join('');

  return `<div class="r-reco-grid">${cards}</div>`;
}

// ============================================================
// MAIN RENDER
// ============================================================
function renderResults(data) {
  const scores = data.scores || calculateScores(data.answers || {});
  const globalScore = data.global_score || Math.round(
    Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length
  );

  const main = document.getElementById('r-main');
  main.innerHTML = `
    ${renderHero(data, globalScore)}

    <div class="r-section-title">Analyse des dimensions</div>

    <div class="r-grid">
      <div class="r-card">
        <div class="r-card__header">
          <span class="r-card__title">Radar d'alignement 7S</span>
        </div>
        <div class="r-chart-wrap">
          <canvas id="radar-chart" width="400" height="400"></canvas>
        </div>
      </div>
      ${renderDimScores(scores)}
    </div>

    ${renderAnalysis(scores)}

    <div class="r-section-title r-section-title--break">Recommandations par dimension</div>
    ${renderRecommendations(scores)}
  `;

  renderRadar(scores);

  // Animate bars after render
  setTimeout(() => {
    document.querySelectorAll('.r-dim-bar-fill').forEach(el => {
      const width = el.style.width;
      el.style.width = '0%';
      requestAnimationFrame(() => { el.style.width = width; });
    });
  }, 100);
}

function renderLoading() {
  document.getElementById('r-main').innerHTML = `
    <div class="r-loading">
      <div class="r-spinner"></div>
      <p style="color:var(--text-light);font-size:0.9375rem;">Chargement du rapport…</p>
    </div>
  `;
}

function renderError(msg) {
  document.getElementById('r-main').innerHTML = `
    <div class="r-loading">
      <p style="font-size:2rem;">⚠️</p>
      <p style="color:var(--text-light);">${msg}</p>
      <a href="questionnaire.html" class="btn btn-primary" style="margin-top:1rem;">Refaire un diagnostic</a>
    </div>
  `;
}

// ============================================================
// INIT
// ============================================================
async function init() {
  renderLoading();

  const params = new URLSearchParams(window.location.search);
  const rawId = params.get('id');
  const id = (rawId && rawId !== 'null') ? rawId : sessionStorage.getItem('diagnostic_id');

  if (!id) {
    renderError('Aucun diagnostic trouvé. Veuillez compléter le questionnaire.');
    return;
  }

  try {
    const { data, error } = await supabase
      .from('diagnostics')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new Error('Diagnostic introuvable.');
    if (!data.answers || Object.keys(data.answers).length === 0) {
      throw new Error('Le questionnaire n\'a pas été complété.');
    }

    renderResults(data);
    populatePrintHeader(data);

  } catch (err) {
    renderError(err.message || 'Impossible de charger le rapport.');
  }
}

// ============================================================
// PRINT HEADER
// ============================================================
function populatePrintHeader(data) {
  const orgName = data.company_name || 'Organisation';
  document.getElementById('print-org-name').textContent = orgName;
  document.getElementById('print-date').textContent = formatDate(data.created_at);
  document.getElementById('print-footer-org').textContent = orgName;
  document.title = `Diagnostic 7S — ${orgName}`;
}

// Export PDF via window.print()
document.getElementById('btn-export')?.addEventListener('click', () => {
  const btn = document.getElementById('btn-export');
  btn.disabled = true;

  const printHeader = document.getElementById('r-print-header');
  const chartCanvas = document.getElementById('radar-chart');
  let chartImg = null;

  // Montrer l'en-tête print
  printHeader.style.display = 'flex';

  // Convertir le canvas radar en image — les canvas ne s'impriment pas toujours bien
  if (chartCanvas) {
    chartImg = document.createElement('img');
    chartImg.src = chartCanvas.toDataURL('image/png');
    chartImg.className = 'radar-print-img';
    chartCanvas.parentNode.replaceChild(chartImg, chartCanvas);
  }

  // Restaurer le DOM une fois le dialogue d'impression fermé
  const restore = () => {
    printHeader.style.display = '';
    if (chartImg && chartCanvas) {
      chartImg.parentNode?.replaceChild(chartCanvas, chartImg);
    }
    btn.disabled = false;
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exporter PDF`;
    window.removeEventListener('afterprint', restore);
  };
  window.addEventListener('afterprint', restore);

  setTimeout(() => window.print(), 150);
});

// New diagnostic
document.getElementById('btn-new')?.addEventListener('click', () => {
  sessionStorage.removeItem('diagnostic_id');
});

init();
