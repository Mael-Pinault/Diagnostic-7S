import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { motion } from 'framer-motion'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import supabase from '../lib/supabase'
import LogoMark from '../components/LogoMark'
import { DIMENSIONS } from '../../assets/js/questionnaire-data.js'
import { LEVER, CHANGE_TYPES, RECO_V2, getChangeType, getRecoV2 } from '../data/recommendations-v2.js'
import '../../assets/css/feuille-de-route.css'

const PHASES = [
  { key: 'court', label: 'Court terme', sub: '0 – 3 mois' },
  { key: 'moyen', label: 'Moyen terme', sub: '3 – 12 mois' },
  { key: 'long',  label: 'Long terme',  sub: '12 mois +' },
]

function scoreBand(s) {
  if (s < 40) return 'critical'
  if (s < 60) return 'low'
  if (s < 80) return 'medium'
  return 'good'
}

function aggregate(diagnostics) {
  const result = {}
  DIMENSIONS.forEach(dim => {
    const vals = diagnostics.map(d => d.scores?.[dim.id]).filter(v => v != null)
    if (vals.length) result[dim.id] = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
  })
  return result
}

export default function FeuilleDeRoute() {
  useDocumentMeta({
    title: 'Feuille de route | Diagnostic 7S',
    description: 'Construisez le plan d\'action organisationnel issu du diagnostic 7S et pilotez l\'avancement des initiatives de transformation.',
  })
  const { code } = useParams()
  const [searchParams] = useSearchParams()
  const isSolo = code === 'solo'
  const soloId = searchParams.get('id')

  const storageKey = isSolo ? `fdr-${soloId}` : `fdr-${code}`

  const [session,      setSession]      = useState(null)
  const [scores,       setScores]       = useState(null)
  const [parentScores, setParentScores] = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)
  const [filter,       setFilter]       = useState('all')
  const [checked,      setChecked]      = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}') } catch { return {} }
  })
  const [exporting,    setExporting]    = useState(false)

  const pdfRef = useRef(null)

  useEffect(() => {
    async function load() {
      if (isSolo) {
        if (!soloId) { setError('Identifiant de diagnostic manquant.'); setLoading(false); return }
        const { data: diag } = await supabase.from('diagnostics').select('*').eq('id', soloId).single()
        if (!diag) { setError('Diagnostic introuvable.'); setLoading(false); return }
        setSession({ org_name: diag.company_name, sector: diag.sector, governance_type: diag.governance_type })
        setScores(diag.scores ?? {})
        setLoading(false)
        return
      }

      const { data: sess } = await supabase.from('sessions').select('*').eq('code', code).single()
      if (!sess) { setError('Session introuvable.'); setLoading(false); return }

      const { data: diags } = await supabase
        .from('diagnostics')
        .select('scores')
        .eq('session_id', sess.id)
        .eq('completed', true)

      setSession(sess)
      setScores(aggregate(diags ?? []))

      if (sess.parent_session_id) {
        const { data: parentDiags } = await supabase
          .from('diagnostics')
          .select('scores')
          .eq('session_id', sess.parent_session_id)
          .eq('completed', true)
        if (parentDiags?.length) setParentScores(aggregate(parentDiags))
      }

      setLoading(false)
    }
    load()
  }, [code, soloId])

  // ── Computed ──────────────────────────────────────────────────────────────
  const changeType = scores ? getChangeType(scores) : null
  const ct         = changeType ? CHANGE_TYPES[changeType] : null

  const dbRecoMap = useMemo(() => {
    if (!session?.recommendations || !Array.isArray(session.recommendations)) return {}
    return Object.fromEntries(
      session.recommendations
        .filter(r => r.id && r.diagnosis && r.actions)
        .map(r => [r.id, { diagnosis: r.diagnosis, actions: r.actions }])
    )
  }, [session])

  const delta = (scores && parentScores)
    ? Object.fromEntries(DIMENSIONS.map(d => [d.id, (scores[d.id] ?? 0) - (parentScores[d.id] ?? 0)]))
    : null

  const currentGlobal = scores
    ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
    : null
  const parentGlobal = parentScores
    ? Math.round(Object.values(parentScores).reduce((a, b) => a + b, 0) / Object.values(parentScores).length)
    : null

  const rows = scores
    ? DIMENSIONS
        .map(dim => ({
          dim,
          score:    scores[dim.id] ?? 0,
          band:     scoreBand(scores[dim.id] ?? 0),
          reco:     dbRecoMap[dim.id] ?? getRecoV2(dim.id, scores[dim.id] ?? 0),
          dimDelta: delta?.[dim.id] ?? null,
        }))
        .sort((a, b) => a.score - b.score)
    : []

  const filteredRows = filter === 'priority' ? rows.filter(r => r.score < 60) : rows

  // Progress tracking
  const totalActions = rows.reduce((acc, { reco }) => {
    if (!reco) return acc
    return acc + PHASES.reduce((s, p) => s + (reco.actions[p.key]?.length ?? 0), 0)
  }, 0)
  const doneCount = Object.values(checked).filter(Boolean).length
  const pct = totalActions > 0 ? Math.round((doneCount / totalActions) * 100) : 0

  function toggleCheck(key) {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      return next
    })
  }

  function resetChecked() {
    setChecked({})
    try { localStorage.removeItem(storageKey) } catch {}
  }

  // ── PDF Export ────────────────────────────────────────────────────────────
  async function exportPDF() {
    if (!pdfRef.current) return
    setExporting(true)
    try {
      const grid  = pdfRef.current
      const SCALE = 2

      // Capture row boundaries before html2canvas (DOM positions are live)
      const gridRect  = grid.getBoundingClientRect()
      const rowEls    = [...grid.querySelectorAll('.fdr-grid__head, .fdr-row')]
      const rowEndsPx = rowEls.map(r => {
        const rect = r.getBoundingClientRect()
        return Math.ceil((rect.bottom - gridRect.top) * SCALE) + 24
      })

      const canvas = await html2canvas(grid, {
        scale: SCALE,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: grid.scrollWidth,
        windowHeight: grid.scrollHeight,
      })

      const pdf      = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const pageW    = 297, pageH = 210, margin = 12
      const contentW = pageW - 2 * margin
      const headerH  = 28

      // ── Header page 1 ──
      pdf.setFillColor(13, 31, 60)
      pdf.rect(0, 0, pageW, headerH, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(13)
      pdf.setTextColor(255, 255, 255)
      pdf.text(`Feuille de route — ${session?.org_name ?? ''}`, margin, 11)
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(160, 185, 210)
      pdf.text('Modèle McKinsey 7S · Diagnostic organisationnel', margin, 18)
      pdf.text(
        'Généré le ' + new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        margin, 24
      )
      if (ct) {
        const ctColors = {
          adaptation:   [22, 163, 74],
          evolution:    [29, 78, 216],
          redressement: [234, 88, 12],
          revolution:   [220, 38, 38],
        }
        const [r, g, b] = ctColors[changeType] ?? [100, 100, 100]
        pdf.setFillColor(r, g, b)
        const ctX = pageW - margin - 40
        pdf.roundedRect(ctX, 7, 38, 14, 3, 3, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(8)
        pdf.setTextColor(255, 255, 255)
        pdf.text(ct.label.toUpperCase(), ctX + 19, 15.5, { align: 'center' })
      }

      // ── Slices avec ruptures entre les lignes ──
      const imgMmW       = contentW
      const pxPerMm      = canvas.width / imgMmW
      const firstAvailMm = pageH - headerH - margin - 6
      const otherAvailMm = pageH - 2 * margin

      let yPx = 0, pageNum = 0

      while (yPx < canvas.height) {
        if (pageNum > 0) pdf.addPage()

        const availMm  = pageNum === 0 ? firstAvailMm : otherAvailMm
        const maxEndPx = yPx + Math.round(availMm * pxPerMm)

        // Trouver la dernière limite de ligne qui tient dans la page
        let sliceEndPx = maxEndPx
        for (const boundary of rowEndsPx) {
          if (boundary > yPx && boundary <= maxEndPx) {
            sliceEndPx = boundary
          }
        }
        sliceEndPx = Math.min(sliceEndPx, canvas.height)

        const remainPx = canvas.height - sliceEndPx
        const hasContentInRemainder = rowEndsPx.some(b => b > sliceEndPx && b < canvas.height)
        if (remainPx > 0 && remainPx < Math.round(20 * pxPerMm) && !hasContentInRemainder) {
          sliceEndPx = canvas.height
        }

        const sliceH = sliceEndPx - yPx
        if (sliceH <= 0) break

        const slice   = document.createElement('canvas')
        slice.width   = canvas.width
        slice.height  = sliceH
        slice.getContext('2d').drawImage(canvas, 0, -yPx)

        const yDest = pageNum === 0 ? headerH + 6 : margin
        pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, yDest, imgMmW, sliceH / pxPerMm)

        yPx = sliceEndPx
        pageNum++
      }

      // ── Footer toutes les pages ──
      const total = pdf.getNumberOfPages()
      for (let p = 1; p <= total; p++) {
        pdf.setPage(p)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        pdf.setTextColor(150, 160, 175)
        pdf.text('Diagnostic 7S — Document confidentiel', margin, pageH - 5)
        pdf.text(`${p} / ${total}`, pageW - margin, pageH - 5, { align: 'right' })
      }

      pdf.save(`feuille-de-route_${session?.org_name?.replace(/\s+/g, '-') ?? (isSolo ? 'diagnostic' : code)}.pdf`)
    } catch (e) {
      console.error('PDF export failed:', e)
    } finally {
      setExporting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="q-spinner" />
    </div>
  )

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-light)' }}>{error}</p>
      <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
    </div>
  )

  const isDemo = code?.toUpperCase() === 'APERCU'

  return (
    <div className="fdr-wrapper">

      {isDemo && (
        <div className="demo-banner">
          <span className="demo-banner__text">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Feuille de route de démonstration — Organisation fictive « Adera Conseil »
          </span>
          <Link to="/creer-session" className="demo-banner__cta">Créer ma session →</Link>
        </div>
      )}

      {/* ── Header ── */}
      <header className="fdr-header">
        <Link to="/" className="fdr-header__logo">
          <div className="nav__logo-mark"><LogoMark animate={false} /></div>
          <span className="fdr-header__logo-name">Diagnostic 7S</span>
        </Link>
        <div className="fdr-header__actions">
          {ct && <span className={`ct-badge ${ct.cls}`}>{ct.label}</span>}
          <button className="fdr-export-btn" onClick={exportPDF} disabled={exporting}>
            {exporting
              ? 'Export…'
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exporter PDF</>
            }
          </button>
          <Link to={isSolo ? `/resultats?id=${soloId}` : `/resultats-session/${code}`} className="fdr-back-btn">← Résultats</Link>
        </div>
      </header>

      <main className="fdr-main">

        {/* ── Summary ── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="fdr-summary">
            <h1 className="fdr-summary__org">{session?.org_name}</h1>
            <div className="fdr-summary__meta">
              {session?.sector && <span className="fdr-summary__tag">{session.sector}</span>}
              {session?.governance_type && <><span className="fdr-summary__tag">·</span><span className="fdr-summary__tag">{session.governance_type}</span></>}
            </div>
            {ct && (
              <div className="fdr-ct-block">
                <span className={`fdr-ct-block__badge ${ct.cls}`}>{ct.label}</span>
                <span className="fdr-ct-block__desc">{ct.desc}</span>
              </div>
            )}
          </div>

          {/* ── Progress ── */}
          <div className="fdr-progress">
            <div className="fdr-progress__bar">
              <div className="fdr-progress__fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="fdr-progress__label">
              <strong>{doneCount}</strong> / {totalActions} actions réalisées — <strong>{pct}%</strong>
            </span>
            {doneCount > 0 && (
              <button className="fdr-reset-btn" onClick={resetChecked} title="Réinitialiser la progression">
                Réinitialiser
              </button>
            )}
          </div>

          {/* ── Toolbar ── */}
          <div className="fdr-toolbar">
            <div className="fdr-filters">
              <button className={`fdr-filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
                Toutes les dimensions
              </button>
              <button className={`fdr-filter-btn${filter === 'priority' ? ' active' : ''}`} onClick={() => setFilter('priority')}>
                Prioritaires (&lt; 60)
              </button>
            </div>
            <div className="fdr-levers">
              {Object.entries(LEVER).map(([key, v]) => (
                <span key={key} className="fdr-lever-chip">
                  <span className="fdr-lever-dot" style={{ background: v.color }} />
                  {v.label}
                </span>
              ))}
            </div>
          </div>

          {/* ── PDF zone : contexte + bilan + grille ── */}
          <div ref={pdfRef} className="fdr-pdf-zone">

            {/* Mission context */}
            {!isSolo && session?.context && (session.context.situation_type || session.context.problem_description) && (() => {
              const ctx = session.context
              const SITUATION_LABELS = {
                transformation_culturelle: 'Transformation culturelle',
                fusion_acquisition:        'Fusion / Acquisition',
                restructuration:           'Restructuration',
                croissance_rapide:         'Croissance rapide',
                numerique:                 'Transformation numérique',
                international:             'Développement international',
                redressement:              'Redressement',
                changement_gouvernance:    'Changement de gouvernance',
                autre:                     'Autre',
              }
              const typeLabel = ctx.situation_type === 'autre' && ctx.situation_type_other
                ? ctx.situation_type_other
                : (SITUATION_LABELS[ctx.situation_type] ?? ctx.situation_type)
              return (
                <div className="fdr-mission-context">
                  <div className="fdr-mission-context__header">
                    <span className="fdr-mission-context__label">Contexte de mission</span>
                    {typeLabel && <span className="fdr-mission-context__type">{typeLabel}</span>}
                  </div>
                  {ctx.problem_description && <p className="fdr-mission-context__problem">{ctx.problem_description}</p>}
                  {(ctx.past_actions || ctx.expected_outcomes) && (
                    <div className="fdr-mission-context__details">
                      {ctx.past_actions && (
                        <div className="fdr-mission-context__detail">
                          <span className="fdr-mission-context__detail-label">Actions passées</span>
                          <span>{ctx.past_actions}</span>
                        </div>
                      )}
                      {ctx.expected_outcomes && (
                        <div className="fdr-mission-context__detail">
                          <span className="fdr-mission-context__detail-label">Résultats attendus</span>
                          <span>{ctx.expected_outcomes}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Bilan T1 → T2 */}
            {delta && (() => {
              const progressCount = DIMENSIONS.filter(d => (delta[d.id] ?? 0) > 0).length
              const allDeltas     = DIMENSIONS.map(d => ({ label: d.label, val: delta[d.id] ?? 0 }))
              const worstDim      = allDeltas.reduce((w, d) => d.val < w.val ? d : w)
              const deltaGlobal   = currentGlobal - parentGlobal
              return (
                <div className="fdr-bilan">
                  <span className="fdr-bilan__title">Progression T1 → T2</span>
                  <div className="fdr-bilan__stats">
                    <div className="fdr-bilan__stat">
                      <span className="fdr-bilan__stat-value">
                        {parentGlobal} <span className="fdr-bilan__arrow">→</span> {currentGlobal}
                        <span className={`fdr-bilan__global-delta ${deltaGlobal >= 0 ? 'fdr-bilan__delta--up' : 'fdr-bilan__delta--down'}`}>
                          {deltaGlobal >= 0 ? '+' : ''}{deltaGlobal}
                        </span>
                      </span>
                      <span className="fdr-bilan__stat-label">Score global /100</span>
                    </div>
                    <div className="fdr-bilan__divider" />
                    <div className="fdr-bilan__stat">
                      <span className="fdr-bilan__stat-value">
                        {progressCount}<span className="fdr-bilan__stat-denom">/7</span>
                      </span>
                      <span className="fdr-bilan__stat-label">Dimensions en progrès</span>
                    </div>
                    <div className="fdr-bilan__divider" />
                    <div className="fdr-bilan__stat">
                      <span className="fdr-bilan__stat-value fdr-bilan__stat--warning">
                        {worstDim.label}
                        <span className="fdr-bilan__dim-delta">{worstDim.val >= 0 ? '+' : ''}{worstDim.val}</span>
                      </span>
                      <span className="fdr-bilan__stat-label">Point de résistance</span>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Grid */}
            <div className="fdr-grid">

              {/* Head */}
              <div className="fdr-grid__head">
                <div>Dimension</div>
                {PHASES.map(p => (
                  <div key={p.key}>
                    {p.label}
                    <span className="fdr-head-sub">{p.sub}</span>
                  </div>
                ))}
              </div>

              {/* Rows */}
              {filteredRows.map(({ dim, score, band, reco, dimDelta }) => (
                <div key={dim.id} className={`fdr-row fdr-row--${band}`}>

                  {/* Dimension cell */}
                  <div className="fdr-row__dim">
                    <div className="fdr-row__dim-top">
                      <span className="fdr-row__icon">{dim.icon}</span>
                      <span className="fdr-row__label">{dim.label}</span>
                      <span className="fdr-row__score-pill">{score}/100</span>
                      {dimDelta != null && (
                        <span className={`fdr-row__delta ${dimDelta > 0 ? 'fdr-row__delta--up' : dimDelta < 0 ? 'fdr-row__delta--down' : 'fdr-row__delta--flat'}`}>
                          {dimDelta > 0 ? '+' : ''}{dimDelta}
                        </span>
                      )}
                    </div>
                    {reco && <p className="fdr-row__diagnosis">{reco.diagnosis}</p>}
                  </div>

                  {/* Phase cells */}
                  {PHASES.map(phase => (
                    <div key={phase.key} className="fdr-row__phase" data-phase={phase.label}>
                      {reco?.actions[phase.key]?.map((action, i) => {
                        const key  = `${dim.id}-${phase.key}-${i}`
                        const done = !!checked[key]
                        return (
                          <div
                            key={i}
                            className={`fdr-action${done ? ' fdr-action--done' : ''}`}
                            onClick={() => toggleCheck(key)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => e.key === 'Enter' && toggleCheck(key)}
                          >
                            <div className="fdr-action__top">
                              <span
                                className="fdr-action__lever"
                                style={{ background: LEVER[action.lever]?.color ?? '#888' }}
                              >
                                {LEVER[action.lever]?.label}
                              </span>
                              <span className="fdr-action__check">
                                {done && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                              </span>
                            </div>
                            <span className="fdr-action__text">{action.text}</span>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </main>
    </div>
  )
}
