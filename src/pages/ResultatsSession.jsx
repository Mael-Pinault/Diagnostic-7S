import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Chart as ChartJS,
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import supabase from '../lib/supabase'
import LogoMark from '../components/LogoMark'
import { DIMENSIONS } from '../../assets/js/questionnaire-data.js'
import { getReco } from '../data/recommendations.js'
import '../../assets/css/session.css'
import '../../assets/css/resultats.css'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip)

const MODE_LABELS = {
  shared:     'Session partagée',
  collective: 'Remplissage collectif',
  comparison: 'Comparaison multi-profils'
}

const ROLE_COLORS = {
  dirigeant: '#C9A84C',
  manager:   '#1B5EA6',
  equipe:    '#4CAF87',
  autre:     '#9C8DB0'
}

const ROLE_LABELS = {
  dirigeant: 'Dirigeants',
  manager:   'Managers',
  equipe:    'Équipes',
  autre:     'Autres'
}

// ── Utilitaires rapport ──────────────────────────────────────────────────────
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

// ── Calcul d'agrégats ───────────────────────────────────────────────────────
function aggregate(diagnostics) {
  if (!diagnostics.length) return null
  const result = {}
  DIMENSIONS.forEach(dim => {
    const vals = diagnostics.map(d => d.scores?.[dim.id]).filter(v => v != null)
    if (!vals.length) return
    result[dim.id] = {
      avg:    Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      min:    Math.min(...vals),
      max:    Math.max(...vals),
      values: vals
    }
  })
  return result
}

// ── Radar data ───────────────────────────────────────────────────────────────
function buildRadarData(agg, byRole, parentAgg) {
  const labels = DIMENSIONS.map(d => d.label)
  const datasets = []

  if (parentAgg) {
    datasets.push({
      label: 'T1 — Diagnostic initial',
      data: DIMENSIONS.map(d => parentAgg[d.id]?.avg ?? 0),
      backgroundColor: 'rgba(107,114,128,0.04)',
      borderColor: 'rgba(107,114,128,0.45)',
      borderWidth: 1.5,
      borderDash: [5, 4],
      pointRadius: 2,
      pointBackgroundColor: 'rgba(107,114,128,0.45)'
    })
  }

  if (agg) {
    datasets.push({
      label: parentAgg ? 'T2 — Suivi' : 'Moyenne générale',
      data: DIMENSIONS.map(d => agg[d.id]?.avg ?? 0),
      backgroundColor: 'rgba(201,168,76,0.12)',
      borderColor: 'rgba(201,168,76,0.9)',
      borderWidth: 2,
      pointBackgroundColor: 'rgba(201,168,76,1)',
      pointRadius: 3
    })
  }

  if (byRole) {
    Object.entries(byRole).forEach(([role, diags]) => {
      if (!diags.length) return
      const roleAgg = aggregate(diags)
      if (!roleAgg) return
      datasets.push({
        label: ROLE_LABELS[role] ?? role,
        data: DIMENSIONS.map(d => roleAgg[d.id]?.avg ?? 0),
        backgroundColor: 'transparent',
        borderColor: ROLE_COLORS[role] ?? '#888',
        borderWidth: 1.5,
        borderDash: [4, 3],
        pointRadius: 2,
        pointBackgroundColor: ROLE_COLORS[role] ?? '#888'
      })
    })
  }

  return { labels, datasets }
}

const RADAR_OPTIONS = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    r: {
      min: 0, max: 100,
      ticks: { stepSize: 25, color: 'rgba(13,31,60,0.35)', font: { size: 9 }, backdropColor: 'transparent' },
      grid:        { color: 'rgba(13,31,60,0.1)' },
      angleLines:  { color: 'rgba(13,31,60,0.1)' },
      pointLabels: { color: 'rgba(13,31,60,0.85)', font: { size: 11, weight: '600', family: "'Inter', sans-serif" } }
    }
  },
  plugins: { legend: { display: false }, tooltip: { enabled: true } }
}

// ── Barre de dispersion ──────────────────────────────────────────────────────
function DispersionBar({ dim, agg, diagnostics, isComparison }) {
  if (!agg) return null
  const d = agg[dim.id]
  if (!d) return null

  const pct = v => `${v}%`

  return (
    <div className="disp-row">
      <div className="disp-row__label">
        <span className="disp-row__icon">{dim.icon}</span>
        <span>{dim.label}</span>
      </div>
      <div className="disp-row__track-wrap">
        {/* Zone min–max */}
        <div className="disp-row__track">
          <div
            className="disp-row__range"
            style={{ left: pct(d.min), width: pct(d.max - d.min) }}
          />
          {/* Points individuels */}
          {d.values.map((v, i) => {
            const diag = diagnostics[i]
            const color = isComparison && diag?.respondent_role
              ? ROLE_COLORS[diag.respondent_role] ?? 'rgba(255,255,255,0.5)'
              : 'rgba(255,255,255,0.6)'
            return (
              <div
                key={i}
                className="disp-row__dot"
                style={{ left: pct(v), background: color }}
                title={`${diag?.respondent_name ?? `Répondant ${i + 1}`} : ${v}/100`}
              />
            )
          })}
          {/* Moyenne */}
          <div
            className="disp-row__avg"
            style={{ left: pct(d.avg) }}
            title={`Moyenne : ${d.avg}/100`}
          />
        </div>
        <div className="disp-row__stats">
          <span className="disp-row__stat disp-row__stat--min">min {d.min}</span>
          <span className="disp-row__stat disp-row__stat--avg">{d.avg}</span>
          <span className="disp-row__stat disp-row__stat--max">max {d.max}</span>
        </div>
      </div>
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function ResultatsSession() {
  useDocumentMeta({
    title: 'Résultats de session | Diagnostic 7S',
    description: 'Synthèse collective du diagnostic 7S : scores par dimension, analyse des écarts de perception et recommandations générées par IA.',
  })
  const { code }  = useParams()
  const [session,     setSession]     = useState(null)
  const [diagnostics, setDiagnostics] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [notFound,    setNotFound]    = useState(false)
  const [liveCount,   setLiveCount]   = useState(0)
  const [closing,      setClosing]     = useState(false)
  const [copiedDir,    setCopiedDir]   = useState(false)
  const [synthesis,         setSynthesis]         = useState(null)
  const [recommendations,   setRecommendations]   = useState(null)
  const [synthLoading,      setSynthLoading]      = useState(false)
  const [synthError,        setSynthError]        = useState(null)
  const [parentSession,     setParentSession]     = useState(null)
  const [parentDiagnostics, setParentDiagnostics] = useState([])
  const channelRef = useRef(null)

  // ── Chargement initial ─────────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      const { data: sess, error: sessErr } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', code.toUpperCase())
        .single()

      if (sessErr || !sess) { setNotFound(true); setLoading(false); return }
      setSession(sess)
      setSynthesis(sess.synthesis ?? null)
      setRecommendations(sess.recommendations ?? null)

      const { data: diags } = await supabase
        .from('diagnostics')
        .select('id, respondent_name, respondent_role, scores, global_score, created_at')
        .eq('session_id', sess.id)
        .eq('completed', true)
        .order('created_at', { ascending: true })

      setDiagnostics(diags ?? [])

      if (sess.parent_session_id) {
        const { data: parentSess } = await supabase
          .from('sessions').select('*').eq('id', sess.parent_session_id).single()
        if (parentSess) {
          setParentSession(parentSess)
          const { data: parentDiags } = await supabase
            .from('diagnostics')
            .select('scores, global_score, respondent_role')
            .eq('session_id', sess.parent_session_id)
            .eq('completed', true)
          setParentDiagnostics(parentDiags ?? [])
        }
      }

      setLoading(false)

      // ── Realtime ────────────────────────────────────────────────────────────
      channelRef.current = supabase
        .channel(`session-${sess.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'diagnostics',
          filter: `session_id=eq.${sess.id}`
        }, payload => {
          if (payload.new?.completed) {
            setDiagnostics(prev => {
              const exists = prev.find(d => d.id === payload.new.id)
              if (exists) return prev.map(d => d.id === payload.new.id ? payload.new : d)
              setLiveCount(c => c + 1)
              return [...prev, payload.new]
            })
          }
        })
        .subscribe()
    }
    init()
    return () => { channelRef.current?.unsubscribe() }
  }, [code])

  async function closeSession() {
    setClosing(true)
    await supabase.from('sessions').update({ is_active: false }).eq('id', session.id)
    setSession(prev => ({ ...prev, is_active: false }))
    setClosing(false)
  }

  async function reopenSession() {
    await supabase.from('sessions').update({ is_active: true }).eq('id', session.id)
    setSession(prev => ({ ...prev, is_active: true }))
  }

  async function generateSynthesis(force = false) {
    setSynthLoading(true)
    setSynthError(null)
    try {
      const { data, error } = await supabase.functions.invoke('synthesize', {
        body: { sessionCode: code, force },
      })
      if (error) throw new Error(error.message)
      if (data?.error) throw new Error(data.error)
      setSynthesis(data.synthesis)
      if (data.recommendations) setRecommendations(data.recommendations)
    } catch (e) {
      setSynthError(e.message ?? 'Erreur lors de la génération')
    } finally {
      setSynthLoading(false)
    }
  }

  // ── Calculs ────────────────────────────────────────────────────────────────
  const threshold    = session?.min_respondents ?? 1

  // Sépare le dirigeant des autres répondants
  const dirDiags  = diagnostics.filter(d => (d.respondent_role ?? '').toLowerCase() === 'dirigeant')
  const teamDiags = diagnostics.filter(d => (d.respondent_role ?? '').toLowerCase() !== 'dirigeant')
  const aggDir    = aggregate(dirDiags)
  const aggTeam   = aggregate(teamDiags)

  const agg          = aggregate(diagnostics)
  const isComp    = session?.mode === 'comparison'
  const byRole    = isComp
    ? diagnostics.reduce((acc, d) => {
        const r = d.respondent_role ?? 'autre'
        acc[r] = [...(acc[r] ?? []), d]
        return acc
      }, {})
    : null
  const parentAgg      = aggregate(parentDiagnostics)
  const parentGlobalAvg = parentAgg
    ? Math.round(DIMENSIONS.map(d => parentAgg[d.id]?.avg ?? 0).reduce((a, b) => a + b, 0) / DIMENSIONS.length)
    : null
  const radarData = buildRadarData(agg, byRole, parentAgg)
  const globalAvg = agg
    ? Math.round(DIMENSIONS.map(d => agg[d.id]?.avg ?? 0).reduce((a, b) => a + b, 0) / DIMENSIONS.length)
    : null

  // ── Rendu états ────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="session-wrapper session-wrapper--center"><div className="q-spinner" /></div>
  )

  if (notFound) return (
    <div className="session-wrapper session-wrapper--center">
      <div className="session-card" style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
        <h2>Session introuvable</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>Le code <strong>{code.toUpperCase()}</strong> ne correspond à aucune session.</p>
        <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
      </div>
    </div>
  )

  const isDemo = code?.toUpperCase() === 'APERCU'

  return (
    <div className="session-results-wrapper">

      {isDemo && (
        <div className="demo-banner">
          <span className="demo-banner__text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Rapport de démonstration — Organisation fictive « Adera Conseil »
          </span>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to="/resultats-session/SUIVI1" className="demo-banner__cta">Voir le suivi à 6 mois →</Link>
            <Link to="/creer-session" className="demo-banner__cta">Créer ma session →</Link>
          </div>
        </div>
      )}

      {/* ── EN-TÊTE ── */}
      <header className="session-results-header">
        <div className="session-results-header__inner">
          <Link to="/" className="session-header__logo">
            <div className="nav__logo-mark"><LogoMark animate={false} /></div>
            <span className="session-header__logo-name">Diagnostic 7S</span>
          </Link>
          <div className="session-results-header__meta">
            <div className="session-results-header__org">{session.org_name}</div>
            <div className="session-results-header__mode">
              {MODE_LABELS[session.mode]} · Code&nbsp;<strong>{session.code}</strong>
              {session.governance_type && <> · {session.governance_type}</>}
            </div>
          </div>
          <div className="session-live-badge">
            <span className="live-dot" />
            Live
          </div>
          <Link to={`/cadrage/${session.code}`} className="session-close-btn" style={{ textDecoration: 'none', fontSize: '0.8rem' }}>
            📋 Cadrage
          </Link>
          {session.is_active ? (
            <button
              className="session-close-btn"
              onClick={closeSession}
              disabled={closing}
            >
              {closing ? 'Clôture…' : '🔒 Clôturer'}
            </button>
          ) : (
            <button className="session-close-btn session-close-btn--reopen" onClick={reopenSession}>
              🔓 Réouvrir
            </button>
          )}
        </div>
      </header>

      {/* ── RÉSUMÉ CADRAGE ── */}
      {session.cadrage && Object.values(session.cadrage).some(Boolean) && (() => {
        const c = session.cadrage
        const STRUCT = { fonctionnelle: 'Fonctionnelle', divisionnelle: 'Divisionnelle', matricielle: 'Matricielle', projets: 'Par projets', reseau: 'En réseau', hybride: 'Hybride' }
        const FORM   = { tres_formalisee: 'Très formalisée', formalisee: 'Formalisée', peu_formalisee: 'Peu formalisée', informelle: 'Informelle' }
        const HIER   = { forte: 'Hiérarchie forte', moderee: 'Hiérarchie modérée', faible: 'Hiérarchie faible' }
        const UNCERT = { forte: 'Aversion incertitude', moderee: 'Rapport incertitude modéré', faible: 'Confort incertitude' }
        const ORIENT = { individuelle: 'Individuelle', collective: 'Collective' }
        const DEC    = { rationnel: 'Décision rationnelle', organisationnel: 'Décision organisationnelle', politique: 'Décision politique', emergent: 'Décision émergente' }
        const LEAD   = { analytique: 'Leadership analytique', humaniste: 'Humaniste', visionnaire: 'Visionnaire', operationnel: 'Opérationnel', communicationnel: 'Communicationnel' }
        const chips = [
          c.structure_type && STRUCT[c.structure_type],
          c.formalization  && FORM[c.formalization],
          c.hierarchy_distance && HIER[c.hierarchy_distance],
          c.uncertainty    && UNCERT[c.uncertainty],
          c.orientation    && ORIENT[c.orientation],
          c.decision_model && DEC[c.decision_model],
          c.leadership_style && LEAD[c.leadership_style],
        ].filter(Boolean)
        return (
          <div className="cadrage-bar">
            <span className="cadrage-bar__label">Cadrage :</span>
            {chips.map((chip, i) => <span key={i} className="cadrage-chip">{chip}</span>)}
            <Link to={`/cadrage/${session.code}`} className="cadrage-bar__edit">Modifier</Link>
          </div>
        )
      })()}

      <main className="session-results-main container">

        {/* ── COMPTEUR RÉPONDANTS ── */}
        <div className="session-respondents-bar">
          <div className="session-respondents-count">
            <span className="session-respondents-count__num">{diagnostics.length}</span>
            <span className="session-respondents-count__label">
              {diagnostics.length <= 1 ? 'répondant' : 'répondants'} ayant complété le questionnaire
            </span>
          </div>
          <AnimatePresence>
            {liveCount > 0 && (
              <motion.div
                key={liveCount}
                className="session-new-badge"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                +{liveCount} nouvelle{liveCount > 1 ? 's' : ''} réponse{liveCount > 1 ? 's' : ''}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── MODULE DIRIGEANT ── */}
        {(() => {
          const dirLink = `${window.location.origin}/questionnaire?session=${session.code}&role=Dirigeant`
          const hasDirData  = dirDiags.length > 0 && aggDir
          const hasTeamData = teamDiags.length > 0 && aggTeam

          const dirGlobalAvg  = aggDir  ? Math.round(DIMENSIONS.map(d => aggDir[d.id]?.avg  ?? 0).reduce((a,b) => a+b,0) / DIMENSIONS.length) : null
          const teamGlobalAvg = aggTeam ? Math.round(DIMENSIONS.map(d => aggTeam[d.id]?.avg ?? 0).reduce((a,b) => a+b,0) / DIMENSIONS.length) : null

          const dirRadarData = (hasDirData && hasTeamData) ? {
            labels: DIMENSIONS.map(d => d.label),
            datasets: [
              {
                label: 'Dirigeant',
                data: DIMENSIONS.map(d => aggDir[d.id]?.avg ?? 0),
                backgroundColor: 'rgba(201,168,76,0.1)',
                borderColor: '#C9A84C',
                borderWidth: 2.5,
                pointRadius: 3,
                pointBackgroundColor: '#C9A84C'
              },
              {
                label: 'Équipes',
                data: DIMENSIONS.map(d => aggTeam[d.id]?.avg ?? 0),
                backgroundColor: 'rgba(13,31,60,0.07)',
                borderColor: 'rgba(13,31,60,0.7)',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: 'rgba(13,31,60,0.7)'
              }
            ]
          } : null

          const dirGaps = (hasDirData && hasTeamData)
            ? DIMENSIONS.map(dim => ({
                dim,
                dirScore:  aggDir[dim.id]?.avg  ?? 0,
                teamScore: aggTeam[dim.id]?.avg ?? 0,
                delta: (aggDir[dim.id]?.avg ?? 0) - (aggTeam[dim.id]?.avg ?? 0)
              })).sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
            : null

          return (
            <div className="dir-panel">
              <div className="dir-panel__header">
                <div className="dir-panel__title">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Vision du dirigeant
                </div>
                <div className="dir-panel__actions">
                  {hasDirData && (
                    <span className="dir-panel__responded">
                      ✓ {dirDiags.length === 1 ? dirDiags[0].respondent_name || 'Dirigeant' : `${dirDiags.length} dirigeants`} {dirDiags.length === 1 ? 'a' : 'ont'} répondu
                    </span>
                  )}
                  {session.is_active && (
                    <button
                      className="dir-copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(dirLink)
                        setCopiedDir(true)
                        setTimeout(() => setCopiedDir(false), 2200)
                      }}
                    >
                      {copiedDir
                        ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copié</>
                        : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copier le lien dirigeant</>
                      }
                    </button>
                  )}
                </div>
              </div>

              {!hasDirData && (
                <div className="dir-panel__empty">
                  <p>Partagez ce lien avec le dirigeant pour recueillir sa vision et la comparer à celle de ses équipes.</p>
                  <code className="dir-panel__link">{dirLink}</code>
                </div>
              )}

              {hasDirData && hasTeamData && dirRadarData && dirGaps && (
                <div className="dir-panel__content">
                  {/* Scores globaux */}
                  <div className="dir-score-compare">
                    <div className="dir-score-compare__item dir-score-compare__item--dir">
                      <span className="dir-score-compare__label">Dirigeant</span>
                      <span className="dir-score-compare__val">{dirGlobalAvg}<span>/100</span></span>
                    </div>
                    <div className="dir-score-compare__delta">
                      <span style={{ color: (dirGlobalAvg - teamGlobalAvg) > 0 ? '#C9A84C' : (dirGlobalAvg - teamGlobalAvg) < 0 ? '#dc2626' : '#6b7280' }}>
                        {dirGlobalAvg - teamGlobalAvg > 0 ? '+' : ''}{dirGlobalAvg - teamGlobalAvg} pts
                      </span>
                      <span className="dir-score-compare__delta-label">écart</span>
                    </div>
                    <div className="dir-score-compare__item dir-score-compare__item--team">
                      <span className="dir-score-compare__label">Équipes</span>
                      <span className="dir-score-compare__val">{teamGlobalAvg}<span>/100</span></span>
                    </div>
                  </div>

                  <div className="dir-panel__grid">
                    {/* Radar */}
                    <div className="dir-panel__radar">
                      <div className="dir-radar-legend">
                        <span><span className="dir-legend-dot" style={{ background: '#C9A84C' }} /> Dirigeant</span>
                        <span><span className="dir-legend-dot" style={{ background: 'rgba(13,31,60,0.7)' }} /> Équipes</span>
                      </div>
                      <Radar data={dirRadarData} options={RADAR_OPTIONS} />
                    </div>

                    {/* Table d'écarts */}
                    <div className="dir-panel__gaps">
                      <div className="dir-gaps-head">
                        <span>Dimension</span>
                        <span style={{ textAlign: 'right' }}>Dir.</span>
                        <span style={{ textAlign: 'right' }}>Éq.</span>
                        <span style={{ textAlign: 'right' }}>Écart</span>
                      </div>
                      {dirGaps.map(({ dim, dirScore, teamScore, delta }) => (
                        <div key={dim.id} className="dir-gaps-row">
                          <span className="dir-gaps-row__dim">{dim.icon} {dim.label}</span>
                          <span className="dir-gaps-row__score" style={{ color: '#C9A84C' }}>{dirScore}</span>
                          <span className="dir-gaps-row__score">{teamScore}</span>
                          <span className={`dir-gaps-row__delta ${delta > 10 ? 'delta--pos' : delta < -10 ? 'delta--neg' : 'delta--neu'}`}>
                            {delta > 0 ? '+' : ''}{delta}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insight narratif */}
                  {(() => {
                    const bigGaps = dirGaps.filter(g => Math.abs(g.delta) > 15)
                    const overestDims = dirGaps.filter(g => g.delta > 15).map(g => g.dim.label)
                    const underestDims = dirGaps.filter(g => g.delta < -15).map(g => g.dim.label)
                    if (!bigGaps.length) return (
                      <div className="dir-insight dir-insight--aligned">
                        <strong>Vision alignée.</strong> Le dirigeant et ses équipes partagent une perception proche de l'organisation sur l'ensemble des dimensions.
                      </div>
                    )
                    return (
                      <div className="dir-insight dir-insight--gap">
                        {overestDims.length > 0 && <p><strong>Surestimation dirigeant ({overestDims.join(', ')}) :</strong> le dirigeant perçoit ces dimensions significativement mieux que ses équipes — point de vigilance sur la réalité terrain.</p>}
                        {underestDims.length > 0 && <p><strong>Sous-estimation dirigeant ({underestDims.join(', ')}) :</strong> les équipes perçoivent ces dimensions plus positivement que leur dirigeant — potentiel non identifié par le sommet.</p>}
                      </div>
                    )
                  })()}
                </div>
              )}

              {hasDirData && !hasTeamData && (
                <div className="dir-panel__empty">
                  <p>Le dirigeant a répondu. La comparaison avec les équipes sera disponible dès que des répondants d'équipe auront complété le questionnaire.</p>
                </div>
              )}
            </div>
          )
        })()}

        {(diagnostics.length === 0 || diagnostics.length < threshold) && (
          <div className="session-empty">
            <div className="session-empty__icon">⏳</div>
            {diagnostics.length === 0
              ? <h2>En attente des répondants</h2>
              : <h2>Seuil minimum non atteint</h2>
            }
            {diagnostics.length > 0 && (
              <>
                <div className="session-threshold-bar">
                  <div className="session-threshold-fill" style={{ width: `${Math.min(100, Math.round((diagnostics.length / threshold) * 100))}%` }} />
                </div>
                <p>
                  <strong>{diagnostics.length} / {threshold}</strong> répondants ont complété le questionnaire.
                  Les résultats s'afficheront une fois le seuil atteint.
                </p>
              </>
            )}
            {diagnostics.length === 0 && (
              <p>Les résultats s'afficheront ici au fur et à mesure des soumissions. Partagez le lien de session avec vos répondants.</p>
            )}
            <code className="session-url" style={{ marginTop: '1rem' }}>
              {`${window.location.origin}/session/${session.code}`}
            </code>
          </div>
        )}
        {diagnostics.length > 0 && diagnostics.length >= threshold && (
          <div className="session-results-grid">

            {/* ── RADAR ── */}
            <div className="session-results-panel session-results-panel--radar">
              <div className="panel-header">
                <h2 className="panel-title">Profil agrégé</h2>
                {globalAvg !== null && (
                  <div className="panel-global">
                    <span className="panel-global__score">{globalAvg}</span>
                    <span className="panel-global__label">score moyen</span>
                  </div>
                )}
              </div>
              <div className="radar-wrap">
                <Radar data={radarData} options={RADAR_OPTIONS} />
              </div>
              {isComp && byRole && (
                <div className="role-legend">
                  {Object.entries(byRole).map(([role, diags]) => (
                    <div key={role} className="role-legend__item">
                      <span className="role-legend__dot" style={{ background: ROLE_COLORS[role] ?? '#888' }} />
                      <span>{ROLE_LABELS[role] ?? role} ({diags.length})</span>
                    </div>
                  ))}
                  <div className="role-legend__item">
                    <span className="role-legend__dot" style={{ background: 'rgba(201,168,76,0.9)' }} />
                    <span>Moyenne générale</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── DISPERSION ── */}
            <div className="session-results-panel session-results-panel--dispersion">
              <div className="panel-header">
                <h2 className="panel-title">Dispersion par dimension</h2>
                <p className="panel-sub">Chaque point représente un répondant. La bande couvre l'intervalle min–max. Le losange ◆ marque la moyenne.</p>
              </div>
              <div className="disp-list">
                {DIMENSIONS.map(dim => (
                  <DispersionBar
                    key={dim.id}
                    dim={dim}
                    agg={agg}
                    diagnostics={diagnostics}
                    isComparison={isComp}
                  />
                ))}
              </div>
              <div className="disp-axis">
                <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
              </div>
            </div>

            {/* ── LISTE RÉPONDANTS ── */}
            <div className="session-results-panel session-results-panel--respondents">
              <div className="panel-header">
                <h2 className="panel-title">Répondants</h2>
              </div>
              <div className="respondents-list">
                {diagnostics.map((d, i) => (
                  <div key={d.id} className="respondent-row">
                    <div className="respondent-row__avatar">
                      {d.respondent_name ? d.respondent_name.charAt(0).toUpperCase() : (i + 1)}
                    </div>
                    <div className="respondent-row__info">
                      <div className="respondent-row__name">
                        {d.respondent_name ?? `Répondant ${i + 1}`}
                      </div>
                      {d.respondent_role && (
                        <div className="respondent-row__role" style={{ color: ROLE_COLORS[d.respondent_role] ?? 'var(--text-light)' }}>
                          {ROLE_LABELS[d.respondent_role] ?? d.respondent_role}
                        </div>
                      )}
                    </div>
                    <div className="respondent-row__score">{d.global_score ?? '—'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── ÉVOLUTION T1 → T2 ── */}
            {parentSession && parentAgg && agg && globalAvg !== null && parentGlobalAvg !== null && (() => {
              const globalDelta = globalAvg - parentGlobalAvg
              return (
                <div className="session-results-panel session-results-panel--evolution">
                  <div className="panel-header">
                    <h2 className="panel-title">Évolution T1 → T2</h2>
                    <p className="panel-sub">
                      Comparaison avec le diagnostic initial ({parentSession.org_name} · session {parentSession.code})
                    </p>
                  </div>

                  <div className="evolution-global">
                    <div className="evolution-global__item">
                      <span className="evolution-global__label">T1 — Initial</span>
                      <span className="evolution-global__score">{parentGlobalAvg}<span style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.5 }}>/100</span></span>
                    </div>
                    <div className="evolution-global__arrow">
                      <span className="evolution-global__arrow-icon" style={{ color: globalDelta > 0 ? '#16a34a' : globalDelta < 0 ? '#dc2626' : 'var(--text-light)' }}>
                        {globalDelta > 0 ? '↑' : globalDelta < 0 ? '↓' : '→'}
                      </span>
                      <span className="evolution-global__arrow-delta" style={{ color: globalDelta > 0 ? '#16a34a' : globalDelta < 0 ? '#dc2626' : 'var(--text-light)' }}>
                        {globalDelta > 0 ? '+' : ''}{globalDelta} pts
                      </span>
                    </div>
                    <div className="evolution-global__item">
                      <span className="evolution-global__label">T2 — Suivi</span>
                      <span className="evolution-global__score">{globalAvg}<span style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.5 }}>/100</span></span>
                    </div>
                  </div>

                  <div className="evolution-body">
                    <div className="evolution-table-wrap">
                      <div className="evolution-table-head">
                        <span>Dimension</span>
                        <span style={{ textAlign: 'center' }}>T1</span>
                        <span style={{ textAlign: 'center' }}>T2</span>
                        <span style={{ textAlign: 'center' }}>Δ</span>
                      </div>
                      {DIMENSIONS.map(dim => {
                        const t1 = parentAgg[dim.id]?.avg ?? 0
                        const t2 = agg[dim.id]?.avg ?? 0
                        const delta = t2 - t1
                        return (
                          <div key={dim.id} className="evolution-row">
                            <span className="evolution-row__dim">{dim.icon} {dim.label}</span>
                            <span className="evolution-row__t1">{t1}</span>
                            <span className="evolution-row__t2">{t2}</span>
                            <span className={`evolution-row__delta ${delta > 0 ? 'delta--up' : delta < 0 ? 'delta--down' : 'delta--same'}`}>
                              {delta > 0 ? '+' : ''}{delta}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="evolution-radar-wrap">
                      <div className="evolution-radar-legend">
                        <span>
                          <span className="evolution-legend-line evolution-legend-line--dashed" />
                          T1
                        </span>
                        <span>
                          <span className="evolution-legend-line" style={{ background: 'rgba(201,168,76,0.9)' }} />
                          T2
                        </span>
                      </div>
                      <Radar data={buildRadarData(agg, null, parentAgg)} options={RADAR_OPTIONS} />
                    </div>
                  </div>
                </div>
              )
            })()}

          </div>
        )}

        {/* ── RAPPORT DE CLÔTURE ── */}
        {!session.is_active && agg && diagnostics.length > 0 && (() => {
          const dimScores  = DIMENSIONS.map(d => ({ ...d, score: agg[d.id]?.avg ?? 0, spread: (agg[d.id]?.max ?? 0) - (agg[d.id]?.min ?? 0) }))
          const recoSorted = [...dimScores].sort((a, b) => a.score - b.score)
          const gAvg       = Math.round(dimScores.reduce((s, d) => s + d.score, 0) / dimScores.length)
          const gl         = globalLabel(gAvg)
          const divergent  = isComp ? [...dimScores].sort((a, b) => b.spread - a.spread) : null

          return (
            <div className="session-report">
              <div className="session-report__header">
                <div className="session-report__eyebrow">🔒 Session clôturée · {diagnostics.length} répondant{diagnostics.length > 1 ? 's' : ''}</div>
                <h2 className="session-report__title">Rapport de synthèse — {session.org_name}</h2>
                <div className="session-report__global">
                  <span className="session-report__score">{gAvg}<span style={{ fontSize: '1rem', fontWeight: 400, opacity: 0.6 }}>/100</span></span>
                  <span className={`r-score-badge ${gl.cls}`} style={{ fontSize: '0.8rem' }}>{gl.label}</span>
                </div>
                {!session.parent_session_id && (
                  <div style={{ marginTop: '1rem' }}>
                    <Link
                      to={`/creer-session?suivi=${session.code}`}
                      className="btn btn-outline"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.41"/></svg>
                      Créer un suivi
                    </Link>
                  </div>
                )}
              </div>

              {/* Zones de convergence / divergence (mode comparaison) */}
              {isComp && divergent && (
                <div className="session-divergence">
                  <div className="session-divergence__col session-divergence__col--div">
                    <div className="session-divergence__label">
                      <span>⚡</span> Zones de divergence
                    </div>
                    <p className="session-divergence__sub">Dimensions où les perceptions s'écartent le plus selon les rôles — à approfondir en atelier.</p>
                    {divergent.slice(0, 3).map(d => (
                      <div key={d.id} className="session-divergence__row">
                        <span>{d.icon} {d.label}</span>
                        <span className="session-divergence__spread">écart {d.spread} pts</span>
                      </div>
                    ))}
                  </div>
                  <div className="session-divergence__col session-divergence__col--conv">
                    <div className="session-divergence__label">
                      <span>✓</span> Zones de consensus
                    </div>
                    <p className="session-divergence__sub">Dimensions partagées par tous les profils — points d'appui solides pour la conduite du changement.</p>
                    {divergent.slice(-3).reverse().map(d => (
                      <div key={d.id} className="session-divergence__row">
                        <span>{d.icon} {d.label}</span>
                        <span className="session-divergence__spread">écart {d.spread} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Synthèse narrative ── */}
              <div className="synthesis-block">
                <div className="synthesis-block__header">
                  <div className="synthesis-block__title">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                    Synthèse narrative
                  </div>
                  {synthesis && !synthLoading && (
                    <button className="synthesis-regen-btn" onClick={() => generateSynthesis(true)}>
                      Régénérer
                    </button>
                  )}
                </div>

                {synthLoading ? (
                  <div className="synthesis-block__loading">
                    <div className="q-spinner q-spinner--sm" />
                    Analyse en cours…
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
                    <button className="btn btn-primary" style={{ fontSize: '0.875rem' }} onClick={() => generateSynthesis(false)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
                      Générer la synthèse
                    </button>
                    <p className="synthesis-block__hint">Constat rédigé par IA à partir des scores et du cadrage organisationnel.</p>
                  </div>
                )}
              </div>

              {/* Recommandations */}
              <div className="r-section-title" style={{ marginTop: '2rem' }}>
                Recommandations par dimension
                {recommendations && <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-light)', marginLeft: '0.5rem' }}>générées par IA</span>}
              </div>
              <div className="r-reco-grid">
                {recoSorted.map(dim => {
                  const staticReco = getReco(dim.id, dim.score)
                  const llmReco = recommendations?.find(r => r.id === dim.id)
                  const priority = staticReco?.priority ?? (dim.score < 60 ? 'high' : dim.score < 75 ? 'medium' : 'low')
                  const label = llmReco?.label ?? staticReco?.label ?? ''
                  const text  = llmReco?.text  ?? staticReco?.text  ?? ''
                  if (!label && !text) return null
                  return (
                    <div key={dim.id} className="r-reco-card">
                      <div className="r-reco-card__top">
                        <div className="r-reco-card__dim">
                          <span className="r-reco-card__icon">{dim.icon}</span>
                          <span className="r-reco-card__name">{dim.label}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="r-reco-card__score">{dim.score}/100</span>
                          <span className={`r-reco-priority priority--${priority}`}>
                            {priority === 'high' ? 'Prioritaire' : priority === 'medium' ? 'Moyen terme' : 'À consolider'}
                          </span>
                        </div>
                      </div>
                      <div className="r-reco-card__body">
                        <div className="r-reco-card__label">{label}</div>
                        <div className="r-reco-card__text">{text}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ── CTA feuille de route ── */}
              <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--grey-200)', display: 'flex', justifyContent: 'center' }}>
                <a
                  href={`/feuille-de-route/${session.code}`}
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                  Générer la feuille de route
                </a>
              </div>
            </div>
          )
        })()}

      </main>
    </div>
  )
}
