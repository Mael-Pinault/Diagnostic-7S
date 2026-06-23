import supabase from './supabase-client.js';
import { DIMENSIONS, SCALE_LABELS } from './questionnaire-data.js';

// ============================================================
// STATE
// ============================================================
const state = {
  step: 'profile', // 'profile' | 0..6
  diagnosticId: null,
  profile: {},
  answers: {}     // { strategie: [3,4,2,5,4], structure: [...], ... }
};

// ============================================================
// DOM REFS
// ============================================================
const content   = document.getElementById('q-content');
const fillBar   = document.getElementById('q-progress-fill');
const stepLabel = document.getElementById('q-step-label');
const saveStatus = document.getElementById('q-save-status');

// ============================================================
// PROGRESS
// ============================================================
function updateProgress() {
  const totalSteps = 1 + DIMENSIONS.length; // profile + 7 dimensions
  let current = 0;
  if (state.step === 'profile') {
    current = 0;
  } else {
    current = state.step + 1;
  }
  const pct = Math.round((current / totalSteps) * 100);
  fillBar.style.width = pct + '%';

  if (state.step === 'profile') {
    stepLabel.textContent = 'Étape 1 / 8 — Informations';
  } else {
    stepLabel.textContent = `Étape ${current + 1} / 8 — ${DIMENSIONS[state.step].label}`;
  }
}

// ============================================================
// SAVE STATUS
// ============================================================
function setSaveStatus(status) {
  const dot = saveStatus.querySelector('.save-dot');
  const text = saveStatus.querySelector('span:last-child');
  if (status === 'saving') {
    dot.className = 'save-dot save-dot--saving';
    text.textContent = 'Sauvegarde…';
  } else if (status === 'saved') {
    dot.className = 'save-dot';
    text.textContent = 'Sauvegardé';
  } else if (status === 'error') {
    dot.className = 'save-dot';
    dot.style.background = '#EF4444';
    text.textContent = 'Erreur de sauvegarde';
  }
}

// ============================================================
// RENDER HELPERS
// ============================================================
function renderDots(currentDimIndex) {
  return `
    <div class="q-step-dots">
      ${DIMENSIONS.map((d, i) => {
        let cls = 'q-dot';
        if (i < currentDimIndex) cls += ' q-dot--done';
        if (i === currentDimIndex) cls += ' q-dot--active';
        return `<div class="${cls}" title="${d.label}"></div>`;
      }).join('')}
    </div>
  `;
}

function renderScale(qIndex, dimId, question) {
  const saved = state.answers[dimId];
  const selectedVal = saved ? saved[qIndex] : null;

  return `
    <div class="q-scale">
      ${SCALE_LABELS.map(s => `
        <label class="scale-option">
          <input type="radio" name="${dimId}_q${qIndex}" value="${s.value}"
            ${selectedVal === s.value ? 'checked' : ''}
            data-dim="${dimId}" data-q="${qIndex}">
          <div class="scale-option__btn">
            <span class="scale-option__value">${s.value}</span>
            <span class="scale-option__label">${s.label}</span>
            <div class="scale-tooltip">
              <strong>${s.value} — ${s.label}</strong>
              <span>${question.levels[s.value - 1]}</span>
            </div>
          </div>
        </label>
      `).join('')}
    </div>
  `;
}

// ============================================================
// RENDER PROFILE STEP
// ============================================================
function renderProfile() {
  const p = state.profile;
  content.innerHTML = `
    <div class="q-card">
      <div class="q-profile">
        <h2 class="q-profile__title">Informations préliminaires</h2>
        <p class="q-profile__subtitle">Ces informations permettent de contextualiser le diagnostic et de personnaliser le rapport.</p>

        <div class="q-profile__type-group">
          <label class="q-type-option">
            <input type="radio" name="user_type" value="dirigeant" ${p.user_type === 'dirigeant' ? 'checked' : ''}>
            <div class="q-type-option__card">
              <span class="q-type-option__icon">🏢</span>
              <span class="q-type-option__label">Dirigeant</span>
              <span class="q-type-option__desc">J'évalue ma propre organisation</span>
            </div>
          </label>
          <label class="q-type-option">
            <input type="radio" name="user_type" value="consultant" ${p.user_type === 'consultant' ? 'checked' : ''}>
            <div class="q-type-option__card">
              <span class="q-type-option__icon">💼</span>
              <span class="q-type-option__label">Consultant</span>
              <span class="q-type-option__desc">J'évalue une organisation cliente</span>
            </div>
          </label>
        </div>

        <div class="form-grid">
          <div class="form-field form-field--full">
            <label>Organisation évaluée *</label>
            <input type="text" id="company_name" placeholder="Nom de l'organisation" value="${p.company_name || ''}">
          </div>
          <div class="form-field">
            <label>Secteur d'activité</label>
            <select id="sector">
              <option value="">— Sélectionner —</option>
              ${['Industrie & Manufacturing','Services aux entreprises','Conseil & Expertise','Finance & Assurance','Santé & Médico-social','Distribution & Retail','Technologies & Numérique','Énergie & Environnement','Secteur public & Associations','Autre'].map(s =>
                `<option value="${s}" ${p.sector === s ? 'selected' : ''}>${s}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-field">
            <label>Taille de l'organisation</label>
            <select id="company_size">
              <option value="">— Sélectionner —</option>
              ${['< 10 collaborateurs','10 – 49','50 – 249','250 – 999','1 000 – 4 999','5 000 +'].map(s =>
                `<option value="${s}" ${p.company_size === s ? 'selected' : ''}>${s}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-field">
            <label>Votre nom</label>
            <input type="text" id="respondent_name" placeholder="Prénom Nom" value="${p.respondent_name || ''}">
          </div>
          <div class="form-field">
            <label>Votre email</label>
            <input type="email" id="respondent_email" placeholder="email@exemple.com" value="${p.respondent_email || ''}">
            <span class="form-note">Uniquement pour vous envoyer votre rapport</span>
          </div>
        </div>

      </div>
      <div class="q-nav">
        <div class="q-nav__left">
          <span class="q-error" id="q-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Veuillez renseigner le nom de l'organisation et votre profil.
          </span>
        </div>
        <div class="q-nav__right">
          <button class="btn btn-primary" id="btn-next">
            Commencer le diagnostic
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-next').addEventListener('click', submitProfile);
}

// ============================================================
// RENDER DIMENSION STEP
// ============================================================
function renderDimension(dimIndex) {
  const dim = DIMENSIONS[dimIndex];
  const isLast = dimIndex === DIMENSIONS.length - 1;

  content.innerHTML = `
    <div class="q-card">
      ${renderDots(dimIndex)}
      <div class="q-dim-header">
        <div class="q-dim-header__eyebrow">
          <span>${dim.icon}</span>
          <span>${dim.englishLabel}</span>
        </div>
        <div class="q-dim-header__title">${dim.label}</div>
        <div class="q-dim-header__desc">${dim.description}</div>
      </div>

      <div class="q-questions">
        ${dim.questions.map((q, i) => `
          <div class="q-question" data-q="${i}">
            <div class="q-question__label">
              <div class="q-question__num">${i + 1}</div>
              <div class="q-question__text">${q.text}</div>
            </div>
            ${renderScale(i, dim.id, q)}
          </div>
        `).join('')}
      </div>

      <div class="q-nav">
        <div class="q-nav__left">
          <button class="btn-ghost" id="btn-prev">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Précédent
          </button>
          <span class="q-error" id="q-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Répondez à toutes les questions.
          </span>
        </div>
        <div class="q-nav__right">
          <button class="btn btn-primary" id="btn-next">
            ${isLast ? 'Voir les résultats' : 'Dimension suivante'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  // Track radio selections in state
  content.querySelectorAll('input[type=radio]').forEach(radio => {
    radio.addEventListener('change', e => {
      const { dim: dId, q } = e.target.dataset;
      if (!state.answers[dId]) state.answers[dId] = [null, null, null, null, null];
      state.answers[dId][parseInt(q)] = parseInt(e.target.value);
      // Clear error highlight on answered question
      e.target.closest('.q-question').classList.remove('q-question--unanswered');
    });
  });

  document.getElementById('btn-prev').addEventListener('click', goPrev);
  document.getElementById('btn-next').addEventListener('click', () => submitDimension(dimIndex));
}

// ============================================================
// RENDER LOADING
// ============================================================
function renderLoading(message = 'Calcul des résultats…') {
  content.innerHTML = `
    <div class="q-card">
      <div class="q-loading">
        <div class="q-spinner"></div>
        <p style="color: var(--text-light); font-size: 0.9375rem;">${message}</p>
      </div>
    </div>
  `;
}

// ============================================================
// SUBMIT PROFILE
// ============================================================
async function submitProfile() {
  const userType = document.querySelector('input[name="user_type"]:checked')?.value;
  const companyName = document.getElementById('company_name').value.trim();

  if (!userType || !companyName) {
    document.getElementById('q-error').classList.add('q-error--visible');
    return;
  }

  state.profile = {
    user_type: userType,
    company_name: companyName,
    sector: document.getElementById('sector').value,
    company_size: document.getElementById('company_size').value,
    respondent_name: document.getElementById('respondent_name').value.trim(),
    respondent_email: document.getElementById('respondent_email').value.trim()
  };

  setSaveStatus('saving');
  try {
    const { data, error } = await supabase
      .from('diagnostics')
      .insert({ ...state.profile, step_current: 0 })
      .select('id')
      .single();

    if (error) throw error;
    state.diagnosticId = data.id;
    setSaveStatus('saved');

    // Store ID in session so results page can access it
    sessionStorage.setItem('diagnostic_id', data.id);
  } catch (err) {
    console.error(err);
    setSaveStatus('error');
    // Continue anyway — don't block the user
  }

  state.step = 0;
  updateProgress();
  renderDimension(0);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// SUBMIT DIMENSION
// ============================================================
async function submitDimension(dimIndex) {
  const dim = DIMENSIONS[dimIndex];
  const answers = state.answers[dim.id] || [];

  // Validate: all 5 questions answered
  const unanswered = [];
  for (let i = 0; i < 5; i++) {
    if (!answers[i]) unanswered.push(i);
  }

  if (unanswered.length > 0) {
    document.getElementById('q-error').classList.add('q-error--visible');
    unanswered.forEach(i => {
      content.querySelector(`.q-question[data-q="${i}"]`).classList.add('q-question--unanswered');
    });
    // Scroll to first unanswered
    content.querySelector('.q-question--unanswered')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Save to Supabase
  if (state.diagnosticId) {
    setSaveStatus('saving');
    try {
      const updatedAnswers = { ...(await getStoredAnswers()), [dim.id]: answers };
      const isLast = dimIndex === DIMENSIONS.length - 1;
      const scores = isLast ? calculateScores({ ...updatedAnswers }) : null;
      const globalScore = isLast ? calculateGlobalScore(scores) : null;

      await supabase
        .from('diagnostics')
        .update({
          answers: updatedAnswers,
          step_current: dimIndex + 1,
          ...(isLast ? { completed: true, scores, global_score: globalScore } : {})
        })
        .eq('id', state.diagnosticId);

      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  }

  const isLast = dimIndex === DIMENSIONS.length - 1;
  if (isLast) {
    renderLoading('Génération de votre rapport…');
    setTimeout(() => {
      window.location.href = `resultats.html?id=${state.diagnosticId}`;
    }, 1200);
    return;
  }

  state.step = dimIndex + 1;
  updateProgress();
  renderDimension(dimIndex + 1);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// GO PREV
// ============================================================
function goPrev() {
  if (state.step === 0) {
    state.step = 'profile';
    updateProgress();
    renderProfile();
  } else {
    state.step = state.step - 1;
    updateProgress();
    renderDimension(state.step);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// SCORING
// ============================================================
function calculateScores(allAnswers) {
  const scores = {};
  DIMENSIONS.forEach(dim => {
    const ans = allAnswers[dim.id] || [];
    const sum = ans.reduce((a, b) => a + (b || 0), 0);
    scores[dim.id] = Math.round((sum / 25) * 100);
  });
  return scores;
}

function calculateGlobalScore(scores) {
  const vals = Object.values(scores);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// Fetch current answers from Supabase to merge (avoids overwriting previous dims)
async function getStoredAnswers() {
  if (!state.diagnosticId) return state.answers;
  try {
    const { data } = await supabase
      .from('diagnostics')
      .select('answers')
      .eq('id', state.diagnosticId)
      .single();
    return { ...(data?.answers || {}), ...state.answers };
  } catch {
    return state.answers;
  }
}

// ============================================================
// INIT
// ============================================================
function init() {
  updateProgress();
  renderProfile();
}

init();
