import { useState, useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
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

  const [session,   setSession]   = useState(null)
  const [scores,    setScores]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [filter,    setFilter]    = useState('all')
  const [checked,   setChecked]   = useState({})
  const [exporting, setExporting] = useState(false)

  const gridRef = useRef(null)

  useEffect(() => {
    async function load() {
      const { data: sess } = await supabase.from('sessions').select('*').eq('code', code).single()
      if (!sess) { setError('Session introuvable.'); setLoading(false); return }

      const { data: diags } = await supabase
        .from('diagnostics')
        .select('scores')
        .eq('session_id', sess.id)
        .eq('completed', true)

      setSession(sess)
      setScores(aggregate(diags ?? []))
      setLoading(false)
    }
    load()
  }, [code])

  // ── Computed ──────────────────────────────────────────────────────────────
  const changeType = scores ? getChangeType(scores) : null
  const ct         = changeType ? CHANGE_TYPES[changeType] : null

  const rows = scores
    ? DIMENSIONS
        .map(dim => ({
          dim,
          score: scores[dim.id] ?? 0,
          band:  scoreBand(scores[dim.id] ?? 0),
          reco:  getRecoV2(dim.id, scores[dim.id] ?? 0),
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
    setChecked(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // ── PDF Export ────────────────────────────────────────────────────────────
  async function exportPDF() {
    if (!gridRef.current) return
    setExporting(true)
    try {
      const grid  = gridRef.current
      const SCALE = 2

      // Capture row boundaries BEFORE html2canvas (DOM positions are live)
      const gridRect  = grid.getBoundingClientRect()
      const rowEls    = [...grid.querySelectorAll('.fdr-grid__head, .fdr-row')]
      const rowEndsPx = rowEls.map(r => {
        const rect = r.getBoundingClientRect()
        // +24 canvas-px de marge : compense le reflow html2canvas vs DOM
        return Math.ceil((rect.bottom - gridRect.top) * SCALE) + 24
      })

      // Capture pill positions from DOM — on les redessine en vecteur jsPDF après
      const pillData = []
      grid.querySelectorAll('.fdr-action__lever').forEach(el => {
        const text     = el.textContent.trim()
        const leverKey = Object.keys(LEVER).find(k => LEVER[k].label === text)
        if (!leverKey) return
        const elRect = el.getBoundingClientRect()
        pillData.push({
          text,
          color:    LEVER[leverKey].color,
          topPx:    elRect.top    - gridRect.top,
          leftPx:   elRect.left   - gridRect.left,
          widthPx:  elRect.width,
          heightPx: elRect.height,
        })
      })

      const canvas = await html2canvas(grid, {
        scale: SCALE,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: grid.scrollWidth,
        windowHeight: grid.scrollHeight,
        onclone: (_doc, clonedEl) => {
          clonedEl.querySelectorAll('.fdr-action__lever').forEach(el => {
            el.style.visibility = 'hidden'
          })
        },
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

        // N'absorber le reste que si c'est un artefact de rendu (pas de frontière de ligne dedans)
        // → évite de couper du vrai contenu qui déborde légèrement
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

        // ── Overlay pills en vecteur jsPDF (évite l'offset de texte html2canvas) ──
        for (const pill of pillData) {
          const pillTopPx    = pill.topPx    * SCALE
          const pillBottomPx = (pill.topPx + pill.heightPx) * SCALE
          if (pillTopPx < yPx || pillBottomPx > sliceEndPx) continue

          const pillX = margin + (pill.leftPx  * SCALE) / pxPerMm
          const pillY = yDest  + (pillTopPx - yPx) / pxPerMm
          const pillW = (pill.widthPx  * SCALE) / pxPerMm
          const pillH = (pill.heightPx * SCALE) / pxPerMm

          const r = parseInt(pill.color.slice(1, 3), 16)
          const g = parseInt(pill.color.slice(3, 5), 16)
          const b = parseInt(pill.color.slice(5, 7), 16)
          pdf.setFillColor(r, g, b)
          pdf.roundedRect(pillX, pillY, pillW, pillH, pillH / 2, pillH / 2, 'F')

          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(5.5)
          pdf.setTextColor(255, 255, 255)
          pdf.text(
            pill.text.toUpperCase(),
            pillX + pillW / 2,
            pillY + pillH / 2,
            { align: 'center', baseline: 'middle' }
          )
        }

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

      pdf.save(`feuille-de-route_${session?.org_name?.replace(/\s+/g, '-') ?? code}.pdf`)
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
          <Link to={`/resultats-session/${code}`} className="fdr-back-btn">← Résultats</Link>
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

          {/* ── Grid ── */}
          <div className="fdr-grid" ref={gridRef}>

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
            {filteredRows.map(({ dim, score, band, reco }) => (
              <div key={dim.id} className={`fdr-row fdr-row--${band}`}>

                {/* Dimension cell */}
                <div className="fdr-row__dim">
                  <div className="fdr-row__dim-top">
                    <span className="fdr-row__icon">{dim.icon}</span>
                    <span className="fdr-row__label">{dim.label}</span>
                    <span className="fdr-row__score-pill">{score}/100</span>
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
        </motion.div>

      </main>
    </div>
  )
}
