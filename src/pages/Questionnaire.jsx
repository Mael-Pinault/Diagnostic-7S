import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { motion, AnimatePresence } from 'framer-motion'
import supabase from '../lib/supabase'
import { DIMENSIONS, SCALE_LABELS } from '../../assets/js/questionnaire-data.js'

import '../../assets/css/questionnaire.css'

const SECTORS    = ['Industrie & Manufacturing','Services aux entreprises','Conseil & Expertise','Finance & Assurance','Santé & Médico-social','Distribution & Retail','Technologies & Numérique','Énergie & Environnement','Secteur public & Associations','Autre']
const SIZES      = ['< 10 collaborateurs','10 – 49','50 – 249','250 – 999','1 000 – 4 999','5 000 +']
const GOVERNANCE = ['Familiale','ETI indépendante','Filiale de groupe','Cotée en bourse','PE / LBO','Secteur public','Association / ESS']

const slideVariants = {
  enter:  (dir) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir) => ({ opacity: 0, x: dir * -40 })
}

function calculateScores(answers) {
  const scores = {}
  DIMENSIONS.forEach(dim => {
    const ans = answers[dim.id] || []
    scores[dim.id] = Math.round((ans.reduce((a, b) => a + (b || 0), 0) / 25) * 100)
  })
  return scores
}

function calculateGlobalScore(scores) {
  const vals = Object.values(scores)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export default function Questionnaire() {
  useDocumentMeta({
    title: 'Questionnaire 7S | Diagnostic organisationnel',
    description: 'Répondez aux 7 dimensions du modèle McKinsey 7S et obtenez une évaluation de la cohérence organisationnelle de votre entreprise.',
  })
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const sessionCode    = searchParams.get('session')
  const sessionRole    = searchParams.get('role')
  const sessionName    = searchParams.get('name')

  const [step, setStep]               = useState('profile')
  const [direction, setDirection]     = useState(1)
  const [diagnosticId, setDiagnosticId] = useState(null)
  const [sessionData, setSessionData] = useState(null)
  const [profile, setProfile]         = useState({ user_type: '', company_name: '', sector: '', company_size: '', governance_type: '', respondent_name: '', respondent_email: '', respondent_role: '' })
  const [answers, setAnswers]         = useState({})
  const [saveStatus, setSaveStatus]   = useState('idle')
  const [error, setError]             = useState('')
  const [unanswered, setUnanswered]   = useState([])

  // Chargement de la session depuis l'URL
  useEffect(() => {
    if (!sessionCode) return
    supabase
      .from('sessions')
      .select('*')
      .eq('code', sessionCode.toUpperCase())
      .eq('is_active', true)
      .single()
      .then(({ data }) => {
        if (!data) return
        setSessionData(data)
        setProfile(prev => ({
          ...prev,
          company_name:    data.org_name,
          sector:          data.sector          ?? '',
          company_size:    data.company_size    ?? '',
          governance_type: data.governance_type ?? '',
          respondent_name:  sessionName         ?? '',
          respondent_role:  sessionRole         ?? '',
          user_type:       'consultant'
        }))
      })
  }, [sessionCode, sessionRole, sessionName])

  const totalSteps = 1 + DIMENSIONS.length
  const stepNum    = step === 'profile' ? 0 : step + 1
  const progress   = Math.round((stepNum / totalSteps) * 100)
  const stepLabel  = step === 'profile'
    ? 'Étape 1 / 8 — Informations'
    : `Étape ${stepNum + 1} / 8 — ${DIMENSIONS[step].label}`

  useEffect(() => {
    if (unanswered.length > 0) {
      document.querySelector('.q-question--unanswered')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [unanswered])

  function updateProfile(key, value) {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  function updateAnswer(dimId, qIndex, value) {
    setAnswers(prev => {
      const arr = [...(prev[dimId] || [null, null, null, null, null])]
      arr[qIndex] = value
      return { ...prev, [dimId]: arr }
    })
    setUnanswered(prev => prev.filter(i => i !== qIndex))
  }

  async function submitProfile() {
    if (!profile.user_type || !profile.company_name.trim()) {
      setError('Veuillez renseigner le nom de l\'organisation et votre profil.')
      return
    }
    setError('')
    setSaveStatus('saving')
    try {
      const { data, error: err } = await supabase
        .from('diagnostics')
        .insert({ ...profile, step_current: 0, session_id: sessionData?.id ?? null })
        .select('id')
        .single()
      if (err) throw err
      setDiagnosticId(data.id)
      sessionStorage.setItem('diagnostic_id', data.id)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
    goTo(0, 1)
  }

  async function submitDimension(dimIndex) {
    const dim        = DIMENSIONS[dimIndex]
    const dimAnswers = answers[dim.id] || []
    const missing    = [0, 1, 2, 3, 4].filter(i => !dimAnswers[i])

    if (missing.length > 0) {
      setUnanswered(missing)
      setError('Répondez à toutes les questions.')
      return
    }
    setUnanswered([])
    setError('')

    const isLast = dimIndex === DIMENSIONS.length - 1
    const updatedAnswers = { ...answers, [dim.id]: dimAnswers }

    if (isLast) {
      const sc = calculateScores(updatedAnswers)
      const gs = calculateGlobalScore(sc)
      sessionStorage.setItem('diagnostic_answers', JSON.stringify(updatedAnswers))
      sessionStorage.setItem('diagnostic_profile', JSON.stringify(profile))
      sessionStorage.setItem('diagnostic_scores', JSON.stringify(sc))
      sessionStorage.setItem('diagnostic_global', String(gs))
    }

    if (diagnosticId) {
      setSaveStatus('saving')
      try {
        const scores      = isLast ? calculateScores(updatedAnswers) : null
        const globalScore = isLast ? calculateGlobalScore(scores) : null
        const { error: updateError } = await supabase
          .from('diagnostics')
          .update({
            answers: updatedAnswers,
            step_current: dimIndex + 1,
            ...(isLast ? { completed: true, scores, global_score: globalScore } : {})
          })
          .eq('id', diagnosticId)
        if (updateError) throw updateError
        setSaveStatus('saved')
      } catch (err) {
        console.error('Supabase update error:', err)
        setSaveStatus('error')
      }
    }

    if (isLast) {
      goTo('loading', 1)
      setTimeout(() => navigate(`/resultats?id=${diagnosticId ?? 'local'}`), 1400)
      return
    }
    goTo(dimIndex + 1, 1)
  }

  function goPrev() {
    if (step === 0) goTo('profile', -1)
    else goTo(step - 1, -1)
  }

  function goTo(newStep, dir) {
    setDirection(dir)
    setError('')
    setUnanswered([])
    setTimeout(() => {
      setStep(newStep)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 0)
  }

  const isLoading = step === 'loading'
  const dim       = typeof step === 'number' ? DIMENSIONS[step] : null

  return (
    <div className="q-wrapper">
      <header className="q-header">
        <div className="q-header__inner">
          <Link to="/" className="q-header__logo">
            <div className="q-header__logo-mark">7S</div>
            <span className="q-header__logo-name">Diagnostic 7S</span>
          </Link>
          <div className="q-header__progress-wrap">
            <div className="q-progress-track">
              <div className="q-progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="q-header__step-label">{stepLabel}</div>
          </div>
          <div className="q-header__save-status">
            <span className={`save-dot${saveStatus === 'saving' ? ' save-dot--saving' : ''}`} />
            <span>{saveStatus === 'saving' ? 'Sauvegarde…' : saveStatus === 'error' ? 'Erreur' : 'Sauvegardé'}</span>
          </div>
        </div>
      </header>

      <main className="q-main">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={isLoading ? 'loading' : step === 'profile' ? 'profile' : step}
            className="q-card"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {/* LOADING */}
            {isLoading && (
              <div className="q-loading">
                <div className="q-spinner" />
                <p style={{ color: 'var(--text-light)', fontSize: '0.9375rem' }}>Génération de votre rapport…</p>
              </div>
            )}

            {/* PROFILE */}
            {step === 'profile' && (
              <div className="q-profile">
                {sessionData && (
                  <div className="q-session-banner">
                    <span className="q-session-banner__icon">🔗</span>
                    <div>
                      <div className="q-session-banner__title">Session · {sessionData.code}</div>
                      <div className="q-session-banner__org">{sessionData.org_name}</div>
                    </div>
                    {sessionRole && (
                      <span className="q-session-banner__role">{sessionRole}</span>
                    )}
                  </div>
                )}
                <h2 className="q-profile__title">Informations préliminaires</h2>
                <p className="q-profile__subtitle">Ces informations permettent de contextualiser le diagnostic et de personnaliser le rapport.</p>

                <div className="q-profile__type-group">
                  {[{ value: 'dirigeant', icon: '🏢', label: 'Dirigeant', desc: 'J\'évalue ma propre organisation' },
                    { value: 'consultant', icon: '💼', label: 'Consultant', desc: 'J\'évalue une organisation cliente' }].map(t => (
                    <label key={t.value} className="q-type-option">
                      <input type="radio" name="user_type" value={t.value} checked={profile.user_type === t.value} onChange={() => updateProfile('user_type', t.value)} />
                      <div className="q-type-option__card">
                        <span className="q-type-option__icon">{t.icon}</span>
                        <span className="q-type-option__label">{t.label}</span>
                        <span className="q-type-option__desc">{t.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="form-grid">
                  <div className="form-field form-field--full">
                    <label htmlFor="company_name">Organisation évaluée *</label>
                    <input id="company_name" type="text" placeholder="Nom de l'organisation" value={profile.company_name} onChange={e => updateProfile('company_name', e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="sector">Secteur d'activité</label>
                    <select id="sector" value={profile.sector} onChange={e => updateProfile('sector', e.target.value)}>
                      <option value="">— Sélectionner —</option>
                      {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="company_size">Taille de l'organisation</label>
                    <select id="company_size" value={profile.company_size} onChange={e => updateProfile('company_size', e.target.value)}>
                      <option value="">— Sélectionner —</option>
                      {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="governance_type">Gouvernance</label>
                    <select id="governance_type" value={profile.governance_type} onChange={e => updateProfile('governance_type', e.target.value)}>
                      <option value="">— Sélectionner —</option>
                      {GOVERNANCE.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="respondent_name">Votre nom</label>
                    <input id="respondent_name" type="text" placeholder="Prénom Nom" value={profile.respondent_name} onChange={e => updateProfile('respondent_name', e.target.value)} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="respondent_email">Votre email</label>
                    <input id="respondent_email" type="email" placeholder="email@exemple.com" value={profile.respondent_email} onChange={e => updateProfile('respondent_email', e.target.value)} />
                    <span className="form-note">Uniquement pour vous envoyer votre rapport</span>
                  </div>
                </div>

                <div className="q-nav">
                  <div className="q-nav__left">
                    {error && (
                      <span className="q-error q-error--visible">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {error}
                      </span>
                    )}
                  </div>
                  <div className="q-nav__right">
                    <button className="btn btn-primary" onClick={submitProfile}>
                      Commencer le diagnostic
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* DIMENSION */}
            {typeof step === 'number' && dim && (
              <>
                <div className="q-step-dots">
                  {DIMENSIONS.map((d, i) => (
                    <div key={d.id} className={`q-dot${i < step ? ' q-dot--done' : ''}${i === step ? ' q-dot--active' : ''}`} title={d.label} />
                  ))}
                </div>

                <div className="q-dim-header">
                  <div className="q-dim-header__eyebrow">
                    <span>{dim.icon}</span>
                    <span>{dim.englishLabel}</span>
                  </div>
                  <div className="q-dim-header__title">{dim.label}</div>
                  <div className="q-dim-header__desc">{dim.description}</div>
                </div>

                <div className="q-questions">
                  {dim.questions.map((q, i) => (
                    <div key={i} className={`q-question${unanswered.includes(i) ? ' q-question--unanswered' : ''}`}>
                      <div className="q-question__label">
                        <div className="q-question__num">{i + 1}</div>
                        <div className="q-question__text">{q.text}</div>
                      </div>
                      <div className="q-scale">
                        {SCALE_LABELS.map(s => (
                          <label key={s.value} className="scale-option">
                            <input
                              type="radio"
                              name={`${dim.id}_q${i}`}
                              value={s.value}
                              checked={(answers[dim.id]?.[i] ?? null) === s.value}
                              onChange={() => updateAnswer(dim.id, i, s.value)}
                            />
                            <div className="scale-option__btn">
                              <span className="scale-option__value">{s.value}</span>
                              <span className="scale-option__label">{s.label}</span>
                              <div className="scale-tooltip">
                                <strong>{s.value} — {s.label}</strong>
                                <span>{q.levels[s.value - 1]}</span>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="q-nav">
                  <div className="q-nav__left">
                    <button className="btn-ghost" onClick={goPrev}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                      Précédent
                    </button>
                    {error && (
                      <span className="q-error q-error--visible">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                        {error}
                      </span>
                    )}
                  </div>
                  <div className="q-nav__right">
                    <button className="btn btn-primary" onClick={() => submitDimension(step)}>
                      {step === DIMENSIONS.length - 1 ? 'Voir les résultats' : 'Dimension suivante'}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
