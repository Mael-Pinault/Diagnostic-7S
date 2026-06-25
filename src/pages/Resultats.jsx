import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { motion } from 'framer-motion'
import {
  Chart as ChartJS,
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import supabase from '../lib/supabase'
import { DIMENSIONS } from '../../assets/js/questionnaire-data.js'
import { RECOMMENDATIONS, getReco } from '../data/recommendations.js'

import '../../assets/css/resultats.css'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } }
}

// ---- utils ----------------------------------------------------------------
function scoreBand(s) {
  if (s < 40) return 'critical'
  if (s < 60) return 'low'
  if (s < 80) return 'medium'
  if (s < 90) return 'good'
  return 'excellent'
}

function globalLabel(s) {
  if (s < 40) return { label: 'Organisation en difficulté',  cls: 'badge--critical' }
  if (s < 60) return { label: 'Organisation en transition',  cls: 'badge--low' }
  if (s < 75) return { label: 'Organisation structurée',     cls: 'badge--medium' }
  if (s < 88) return { label: 'Organisation performante',    cls: 'badge--good' }
  return               { label: 'Organisation exemplaire',   cls: 'badge--excellent' }
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function calculateScores(answers) {
  const scores = {}
  DIMENSIONS.forEach(dim => {
    const ans = answers[dim.id] || []
    scores[dim.id] = Math.round((ans.reduce((a, b) => a + (b || 0), 0) / 25) * 100)
  })
  return scores
}

// ---- component ------------------------------------------------------------
export default function Resultats() {
  useDocumentMeta({
    title: 'Résultats | Diagnostic 7S',
    description: 'Consultez les résultats de votre diagnostic 7S, l\'analyse par dimension et les recommandations pour renforcer l\'alignement de votre organisation.',
  })
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const chartRef        = useRef(null)

  const [status, setStatus]         = useState('loading') // loading | ok | error
  const [data, setData]             = useState(null)
  const [scores, setScores]         = useState(null)
  const [globalScore, setGlobalScore] = useState(null)
  const [diagId, setDiagId]         = useState(null)
  const [isPrintMode, setIsPrintMode] = useState(false)
  const [printImgSrc, setPrintImgSrc] = useState(null)
  const [exportBtn, setExportBtn]   = useState({ disabled: false })
  const [synthesis, setSynthesis]   = useState(null)
  const [aiRecos, setAiRecos]       = useState(null)
  const [synthLoading, setSynthLoading] = useState(false)
  const [synthError, setSynthError] = useState(null)
  const synthFiredRef = useRef(false)

  useEffect(() => {
    async function load() {
      const rawId = searchParams.get('id')
      const id    = (rawId && rawId !== 'null' && rawId !== 'local') ? rawId : sessionStorage.getItem('diagnostic_id')

      // Try Supabase first
      if (id) {
        try {
          const { data: row, error } = await supabase
            .from('diagnostics')
            .select('*')
            .eq('id', id)
            .single()

          if (!error && row && row.answers && Object.keys(row.answers).length > 0) {
            const sc = row.scores || calculateScores(row.answers)
            const gs = row.global_score || Math.round(Object.values(sc).reduce((a, b) => a + b, 0) / Object.values(sc).length)
            setData(row)
            setScores(sc)
            setGlobalScore(gs)
            setDiagId(row.id)
            document.title = `Diagnostic 7S — ${row.company_name || 'Organisation'}`
            setStatus('ok')
            return
          }
        } catch (err) {
          console.error('Supabase fetch error:', err)
        }
      }

      // Fallback: sessionStorage
      const backupAnswers = sessionStorage.getItem('diagnostic_answers')
      if (backupAnswers) {
        try {
          const parsedAnswers = JSON.parse(backupAnswers)
          const parsedProfile = JSON.parse(sessionStorage.getItem('diagnostic_profile') || '{}')
          const sc = JSON.parse(sessionStorage.getItem('diagnostic_scores') || 'null') || calculateScores(parsedAnswers)
          const gs = Number(sessionStorage.getItem('diagnostic_global')) || Math.round(Object.values(sc).reduce((a, b) => a + b, 0) / Object.values(sc).length)
          setData({ ...parsedProfile, created_at: new Date().toISOString(), answers: parsedAnswers })
          setScores(sc)
          setGlobalScore(gs)
          document.title = `Diagnostic 7S — ${parsedProfile.company_name || 'Organisation'}`
          setStatus('ok')
          return
        } catch (err) {
          console.error('sessionStorage parse error:', err)
        }
      }

      setStatus('error')
    }
    load()
  }, [searchParams])

  // Animate bars after scores load
  useEffect(() => {
    if (status !== 'ok') return
    setTimeout(() => {
      document.querySelectorAll('.r-dim-bar-fill').forEach(el => {
        const w = el.style.width
        el.style.width = '0%'
        requestAnimationFrame(() => { el.style.width = w })
      })
    }, 300)
  }, [status])

  const generateSynthesis = useCallback(async (id) => {
    setSynthLoading(true)
    setSynthError(null)
    try {
      const { data: res, error } = await supabase.functions.invoke('synthesize', {
        body: { diagnosticId: id },
      })
      if (error) throw new Error(error.message)
      if (!res || res.error) throw new Error(res?.error || 'Réponse invalide du serveur')
      setSynthesis(typeof res.synthesis === 'string' ? res.synthesis : null)
      if (Array.isArray(res.recommendations)) setAiRecos(res.recommendations)
    } catch (e) {
      setSynthError(e.message ?? 'Erreur lors de la génération')
    } finally {
      setSynthLoading(false)
    }
  }, [])

  // Auto-generate synthesis once when data is ready
  useEffect(() => {
    if (status === 'ok' && diagId && !synthFiredRef.current) {
      synthFiredRef.current = true
      generateSynthesis(diagId)
    }
  }, [status, diagId, generateSynthesis])

  function handleExport() {
    setExportBtn({ disabled: true })
    const canvas = chartRef.current?.canvas
    if (canvas) {
      setPrintImgSrc(canvas.toDataURL('image/png'))
      setIsPrintMode(true)
    }
    document.getElementById('r-print-header').style.display = 'flex'

    const restore = () => {
      setIsPrintMode(false)
      setPrintImgSrc(null)
      document.getElementById('r-print-header').style.display = ''
      setExportBtn({ disabled: false })
      window.removeEventListener('afterprint', restore)
    }
    window.addEventListener('afterprint', restore)
    setTimeout(() => window.print(), 200)
  }

  // ---- RADAR DATA ----
  const radarData = scores ? {
    labels: DIMENSIONS.map(d => d.label),
    datasets: [{
      label: 'Score',
      data: DIMENSIONS.map(d => scores[d.id] || 0),
      backgroundColor: 'rgba(13,31,60,0.12)',
      borderColor: '#C9A84C',
      borderWidth: 2.5,
      pointBackgroundColor: '#C9A84C',
      pointBorderColor: '#fff',
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  } : null

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { stepSize: 20, display: false },
        grid: { color: 'rgba(0,0,0,0.06)' },
        angleLines: { color: 'rgba(0,0,0,0.06)' },
        pointLabels: { font: { family: 'Inter', size: 11, weight: '600' }, color: '#4A5A72' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ` ${ctx.raw} / 100` } }
    }
  }

  // ---- RENDER STATES ----
  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="r-loading">
          <div className="r-spinner" />
          <p style={{ color: 'var(--text-light)', fontSize: '0.9375rem' }}>Chargement du rapport…</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--grey-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="r-loading">
          <p style={{ fontSize: '2rem' }}>⚠️</p>
          <p style={{ color: 'var(--text-light)' }}>Aucun diagnostic trouvé. Veuillez compléter le questionnaire.</p>
          <Link to="/questionnaire" className="btn btn-primary" style={{ marginTop: '1rem' }}>Refaire un diagnostic</Link>
        </div>
      </div>
    )
  }

  const gl      = globalLabel(globalScore)
  const sorted  = DIMENSIONS.map(d => ({ ...d, score: scores[d.id] || 0 })).sort((a, b) => b.score - a.score)
  const forces  = sorted.slice(0, 3)
  const vigilance = sorted.slice(-3).reverse()
  const recoSorted = [...sorted].sort((a, b) => a.score - b.score)
  const userTypeLabel = data.user_type === 'consultant' ? 'Évaluation consultant' : 'Auto-évaluation dirigeant'

  return (
    <>
      {/* NAV */}
      <header className="r-header no-print">
        <div className="r-header__inner">
          <Link to="/" className="r-header__logo">
            <div className="r-header__logo-mark">7S</div>
            <span className="r-header__logo-name">Diagnostic 7S</span>
          </Link>
          <div className="r-header__actions">
            <Link to="/questionnaire" id="btn-new" className="btn btn-outline-dark" style={{ fontSize: '0.875rem', padding: '0.5rem 1.125rem' }}
              onClick={() => sessionStorage.removeItem('diagnostic_id')}>
              Nouveau diagnostic
            </Link>
            <button
              id="btn-export"
              className="btn btn-primary"
              style={{ fontSize: '0.875rem', padding: '0.5rem 1.125rem' }}
              disabled={exportBtn.disabled}
              onClick={handleExport}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Exporter PDF
            </button>
          </div>
        </div>
      </header>

      {/* PRINT HEADER */}
      <div className="r-print-header" id="r-print-header">
        <div className="r-print-header__left">
          <div className="r-print-header__logo">7S</div>
          <div>
            <div className="r-print-header__title">Diagnostic organisationnel</div>
            <div className="r-print-header__subtitle">Modèle McKinsey 7S — Rapport confidentiel</div>
          </div>
        </div>
        <div className="r-print-header__right">
          <div className="r-print-header__org">{data.company_name}</div>
          <div>{formatDate(data.created_at)}</div>
        </div>
      </div>

      {/* MAIN */}
      <motion.div className="r-main" id="r-main" variants={stagger} initial="hidden" animate="show">

        {/* HERO */}
        <motion.div className="r-hero" variants={fadeUp}>
          <div className="r-hero__left">
            <div className="r-hero__eyebrow">Rapport de diagnostic — Modèle McKinsey 7S</div>
            <div className="r-hero__org">{data.company_name || 'Organisation'}</div>
            <div className="r-hero__meta">
              <span className="r-meta-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                {formatDate(data.created_at)}
              </span>
              {data.sector && (
                <span className="r-meta-tag">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                  {data.sector}
                </span>
              )}
              {data.governance_type && (
                <span className="r-meta-tag">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                  {data.governance_type}
                </span>
              )}
              <span className="r-meta-tag">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                {userTypeLabel}{data.respondent_name ? ` · ${data.respondent_name}` : ''}
              </span>
            </div>
          </div>
          <div className="r-hero__score">
            <div className="r-score-ring">
              <span className="r-score-ring__value">{globalScore}</span>
              <span className="r-score-ring__suffix">/100</span>
            </div>
            <div className={`r-score-badge ${gl.cls}`}>{gl.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.25rem' }}>Score d'alignement global</div>
          </div>
        </motion.div>

        {/* ANALYSE DES DIMENSIONS */}
        <motion.div className="r-section-title" variants={fadeUp}>Analyse des dimensions</motion.div>

        <motion.div className="r-grid" variants={fadeUp}>
          {/* Radar */}
          <div className="r-card">
            <div className="r-card__header">
              <span className="r-card__title">Radar d'alignement 7S</span>
            </div>
            <div className="r-chart-wrap">
              {isPrintMode && printImgSrc ? (
                <img src={printImgSrc} className="radar-print-img" alt="Radar d'alignement" />
              ) : (
                <Radar ref={chartRef} data={radarData} options={radarOptions} />
              )}
            </div>
          </div>

          {/* Scores par dimension */}
          <div className="r-card">
            <div className="r-card__header">
              <span className="r-card__title">Scores par dimension</span>
            </div>
            <div className="r-dim-list">
              {DIMENSIONS.map(dim => {
                const s = scores[dim.id] || 0
                return (
                  <div key={dim.id} className="r-dim-item">
                    <span className="r-dim-icon">{dim.icon}</span>
                    <div className="r-dim-info">
                      <div className="r-dim-name">{dim.label}</div>
                      <div className="r-dim-bar-track">
                        <div className={`r-dim-bar-fill score--${scoreBand(s)}`} style={{ width: `${s}%` }} />
                      </div>
                    </div>
                    <span className="r-dim-score">{s}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* ANALYSE FORCES / VIGILANCE */}
        <motion.div className="r-analysis" variants={fadeUp}>
          <div className="r-analysis-card r-analysis-card--forces">
            <div className="r-analysis-card__header">
              <span className="r-analysis-card__icon">✦</span>
              <span className="r-analysis-card__title">Points forts</span>
            </div>
            <div className="r-analysis-items">
              {forces.map(d => (
                <div key={d.id} className="r-analysis-item">
                  <span className="r-analysis-item__badge">{d.score}/100</span>
                  <span className="r-analysis-item__text">
                    <span className="r-analysis-item__dim">{d.label}</span>{' '}
                    {d.score >= 80 ? "Dimension maîtrisée, source d'avantage à préserver et à valoriser."
                      : d.score >= 60 ? 'Dimension bien établie, constitue un socle de stabilité organisationnelle.'
                      : 'Meilleure performance relative — levier à renforcer en priorité.'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="r-analysis-card r-analysis-card--vigilance">
            <div className="r-analysis-card__header">
              <span className="r-analysis-card__icon">⚑</span>
              <span className="r-analysis-card__title">Points de vigilance</span>
            </div>
            <div className="r-analysis-items">
              {vigilance.map(d => (
                <div key={d.id} className="r-analysis-item">
                  <span className="r-analysis-item__badge">{d.score}/100</span>
                  <span className="r-analysis-item__text">
                    <span className="r-analysis-item__dim">{d.label}</span>{' '}
                    {d.score < 40 ? 'Zone critique nécessitant une action corrective immédiate.'
                      : d.score < 60 ? 'Zone de fragilité — un plan de développement structuré est recommandé.'
                      : 'Marge de progression identifiée — optimisation possible à moyen terme.'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* SYNTHÈSE IA */}
        <motion.div className="r-section-title r-section-title--break" variants={fadeUp}>Synthèse & analyse</motion.div>

        <motion.div className="r-card" style={{ marginBottom: '1.5rem' }} variants={fadeUp}>
          <div className="synthesis-block">
            <div className="synthesis-block__header">
              <div className="synthesis-block__title">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Synthèse narrative
              </div>
              {synthesis && !synthLoading && (
                <button className="synthesis-regen-btn" onClick={() => generateSynthesis(diagId)}>↺ Régénérer</button>
              )}
            </div>
            {synthLoading ? (
              <div className="synthesis-block__loading">
                <div className="r-spinner" style={{ width: 20, height: 20 }} />
                <span>Analyse en cours…</span>
              </div>
            ) : synthesis ? (
              <div className="synthesis-block__content">
                {synthesis.split('\n\n').filter(Boolean).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            ) : (
              <div className="synthesis-block__empty">
                {synthError && <p className="synthesis-block__error">{synthError}</p>}
                {!synthError && <p className="synthesis-block__hint">Constat rédigé par IA à partir des scores organisationnels.</p>}
              </div>
            )}
          </div>
        </motion.div>

        {/* RECOMMANDATIONS */}
        <motion.div className="r-section-title r-section-title--break" variants={fadeUp}>Recommandations par dimension</motion.div>

        <motion.div className="r-reco-grid" variants={stagger}>
          {aiRecos
            ? aiRecos.map(r => {
                const dim = recoSorted.find(d => d.id === r.id)
                if (!dim) return null
                return (
                  <motion.div key={r.id} className="r-reco-card" variants={fadeUp}>
                    <div className="r-reco-card__top">
                      <div className="r-reco-card__dim">
                        <span className="r-reco-card__icon">{dim.icon}</span>
                        <span className="r-reco-card__name">{dim.label}</span>
                      </div>
                      <span className="r-reco-card__score">{dim.score}/100</span>
                    </div>
                    <div className="r-reco-card__body">
                      <div className="r-reco-card__label">{r.label}</div>
                      <div className="r-reco-card__text">{r.text}</div>
                    </div>
                  </motion.div>
                )
              })
            : recoSorted.map(dim => {
                const reco = getReco(dim.id, dim.score)
                if (!reco) return null
                return (
                  <motion.div key={dim.id} className="r-reco-card" variants={fadeUp}>
                    <div className="r-reco-card__top">
                      <div className="r-reco-card__dim">
                        <span className="r-reco-card__icon">{dim.icon}</span>
                        <span className="r-reco-card__name">{dim.label}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="r-reco-card__score">{dim.score}/100</span>
                        <span className={`r-reco-priority priority--${reco.priority}`}>
                          {reco.priority === 'high' ? 'Prioritaire' : reco.priority === 'medium' ? 'Moyen terme' : 'À consolider'}
                        </span>
                      </div>
                    </div>
                    <div className="r-reco-card__body">
                      <div className="r-reco-card__label">{reco.label}</div>
                      <div className="r-reco-card__text">{reco.text}</div>
                    </div>
                  </motion.div>
                )
              })
          }
        </motion.div>

        {/* FEUILLE DE ROUTE */}
        {diagId && (
          <motion.div variants={fadeUp} style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0 2rem' }}>
            <Link
              to={`/feuille-de-route/solo?id=${diagId}`}
              className="btn btn-primary"
              style={{ fontSize: '0.9375rem', padding: '0.75rem 2rem' }}
            >
              Générer la feuille de route →
            </Link>
          </motion.div>
        )}

      </motion.div>

      {/* PRINT FOOTER */}
      <div className="r-print-footer" id="r-print-footer">
        <span>Diagnostic 7S — Document confidentiel</span>
        <span>{data.company_name}</span>
      </div>
    </>
  )
}
