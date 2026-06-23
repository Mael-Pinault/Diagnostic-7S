import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Chart as ChartJS,
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import supabase from '../lib/supabase'
import LogoMark from '../components/LogoMark'
import { DIMENSIONS } from '../../assets/js/questionnaire-data.js'
import '../../assets/css/session.css'
import '../../assets/css/analyser.css'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const LS_KEY = 'diagnostic7s_sessions'

const SESSION_COLORS = [
  { line: '#C9A84C', fill: 'rgba(201,168,76,0.08)',  light: 'rgba(201,168,76,0.15)' },
  { line: '#1B5EA6', fill: 'rgba(27,94,166,0.08)',   light: 'rgba(27,94,166,0.15)'  },
  { line: '#4CAF87', fill: 'rgba(76,175,135,0.08)',  light: 'rgba(76,175,135,0.15)' },
  { line: '#9C8DB0', fill: 'rgba(156,141,176,0.08)', light: 'rgba(156,141,176,0.15)'},
]

const GAP_COLORS = {
  low:    { cls: 'gap--low',    label: 'Consensus',   threshold: 15  },
  medium: { cls: 'gap--medium', label: 'Divergence',  threshold: 25  },
  high:   { cls: 'gap--high',   label: 'Forte tension' },
}

function gapLevel(gap) {
  if (gap < 15) return 'low'
  if (gap < 25) return 'medium'
  return 'high'
}

function aggregate(diagnostics) {
  if (!diagnostics.length) return null
  const result = {}
  DIMENSIONS.forEach(dim => {
    const vals = diagnostics.map(d => d.scores?.[dim.id]).filter(v => v != null)
    if (!vals.length) return
    result[dim.id] = {
      avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      count: vals.length
    }
  })
  return result
}

function getLocalCodes() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') }
  catch { return [] }
}

const RADAR_OPTIONS = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    r: {
      min: 0, max: 100,
      ticks: { stepSize: 25, color: 'rgba(13,31,60,0.3)', font: { size: 9 }, backdropColor: 'transparent' },
      grid:        { color: 'rgba(13,31,60,0.08)' },
      angleLines:  { color: 'rgba(13,31,60,0.08)' },
      pointLabels: { color: 'rgba(13,31,60,0.8)', font: { size: 11, weight: '600', family: "'Inter', sans-serif" } }
    }
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: ctx => ` ${ctx.dataset.label} : ${ctx.raw}/100`
      }
    }
  }
}

const HEX_COLORS = ['#C9A84C', '#1B5EA6', '#4CAF87', '#9C8DB0']
function hexRgb(hex) { return hex.match(/\w\w/g).map(h => parseInt(h, 16)) }

export default function Analyser() {
  useDocumentMeta({
    title: 'Analyser | Diagnostic 7S',
    description: 'Comparez deux diagnostics 7S pour mesurer la progression organisationnelle entre deux périodes et identifier les priorités d\'action.',
  })
  const [slots,     setSlots]     = useState([])    // { id, code, label, session, agg, loading, error }
  const [addCode,   setAddCode]   = useState('')
  const [addError,  setAddError]  = useState('')
  const [localSess, setLocalSess] = useState([])    // sessions from localStorage for quick-add
  const [exporting, setExporting] = useState(false)
  const analysisRef = useRef(null)

  // Charger les sessions locales pour suggestion
  useEffect(() => {
    async function loadLocal() {
      const codes = getLocalCodes()
      if (!codes.length) return
      const { data } = await supabase.from('sessions').select('code, org_name, mode').in('code', codes)
      setLocalSess(data ?? [])
    }
    loadLocal()
  }, [])

  async function fetchSession(code) {
    const upper = code.trim().toUpperCase()
    if (!upper) return null
    if (slots.find(s => s.code === upper)) { setAddError('Cette session est déjà dans l\'analyse.'); return null }
    if (slots.length >= 4) { setAddError('Maximum 4 sessions comparables en simultané.'); return null }

    const id = Date.now()
    setSlots(prev => [...prev, { id, code: upper, label: '', session: null, agg: null, loading: true, error: null }])
    setAddCode('')
    setAddError('')

    const { data: sess } = await supabase.from('sessions').select('*').eq('code', upper).single()
    if (!sess) {
      setSlots(prev => prev.map(s => s.id === id ? { ...s, loading: false, error: 'Session introuvable.' } : s))
      return
    }

    const { data: diags } = await supabase
      .from('diagnostics')
      .select('scores, global_score, respondent_role')
      .eq('session_id', sess.id)
      .eq('completed', true)

    const agg = aggregate(diags ?? [])
    setSlots(prev => prev.map(s => s.id === id
      ? { ...s, session: sess, label: sess.org_name, agg, loading: false, respondents: diags?.length ?? 0 }
      : s
    ))
  }

  function removeSlot(id) {
    setSlots(prev => prev.filter(s => s.id !== id))
  }

  function updateLabel(id, label) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, label } : s))
  }

  // Sessions prêtes à être comparées
  const ready = slots.filter(s => s.agg && !s.loading && !s.error)
  const canCompare = ready.length >= 2

  // ── Calculs comparaison ──────────────────────────────────────────────────
  const radarData = canCompare ? {
    labels: DIMENSIONS.map(d => d.label),
    datasets: ready.map((s, i) => ({
      label: s.label || s.code,
      data:  DIMENSIONS.map(d => s.agg[d.id]?.avg ?? 0),
      backgroundColor: SESSION_COLORS[i % SESSION_COLORS.length].fill,
      borderColor:     SESSION_COLORS[i % SESSION_COLORS.length].line,
      borderWidth: 2,
      pointBackgroundColor: SESSION_COLORS[i % SESSION_COLORS.length].line,
      pointRadius: 3,
    }))
  } : null

  const dimTable = canCompare ? DIMENSIONS.map(dim => {
    const scores = ready.map(s => ({ label: s.label || s.code, score: s.agg[dim.id]?.avg ?? 0, color: SESSION_COLORS[ready.indexOf(s) % SESSION_COLORS.length].line }))
    const vals   = scores.map(s => s.score)
    const gap    = Math.max(...vals) - Math.min(...vals)
    return { dim, scores, gap, level: gapLevel(gap) }
  }).sort((a, b) => b.gap - a.gap) : null

  const divergent  = dimTable?.filter(r => r.level !== 'low').slice(0, 3)  ?? []
  const convergent = dimTable ? [...dimTable].sort((a, b) => a.gap - b.gap).slice(0, 3) : []

  async function exportPDF() {
    if (!analysisRef.current) return
    setExporting(true)
    try {
      const canvas = await html2canvas(analysisRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#f5f5f7',
        logging: false,
      })

      const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW    = 210, pageH = 297, margin = 15
      const contentW = pageW - 2 * margin  // 180 mm
      const headerH  = 32

      // ── Branded header ──────────────────────────────────────────────────
      pdf.setFillColor(13, 31, 60)
      pdf.rect(0, 0, pageW, headerH, 'F')

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(14)
      pdf.setTextColor(255, 255, 255)
      pdf.text('Analyse comparative — McKinsey 7S', margin, 13)

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(160, 180, 210)
      pdf.text(
        'Généré le ' + new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        margin, 20
      )

      // Session colored dots + labels
      ready.forEach((s, i) => {
        const x = margin + i * 44
        const [r, g, b] = hexRgb(HEX_COLORS[i % HEX_COLORS.length])
        pdf.setFillColor(r, g, b)
        pdf.circle(x, 27, 1.3, 'F')
        pdf.setTextColor(210, 225, 245)
        pdf.setFontSize(7.5)
        pdf.text((s.label || s.code).substring(0, 22), x + 3.5, 27.5)
      })

      // ── Paginated content image ─────────────────────────────────────────
      const imgMmW        = contentW
      const pxPerMm       = canvas.width / imgMmW
      const imgMmH        = canvas.height / pxPerMm
      const firstAvailMm  = pageH - headerH - margin - 6
      const otherAvailMm  = pageH - 2 * margin

      if (imgMmH <= firstAvailMm) {
        pdf.addImage(canvas, 'PNG', margin, headerH + 6, imgMmW, imgMmH)
      } else {
        let yPx = 0
        let pageNum = 0
        while (yPx < canvas.height) {
          if (pageNum > 0) pdf.addPage()
          const availMm  = pageNum === 0 ? firstAvailMm : otherAvailMm
          const slicePx  = Math.min(Math.round(availMm * pxPerMm), canvas.height - yPx)
          const sliceMmH = slicePx / pxPerMm

          const slice = document.createElement('canvas')
          slice.width  = canvas.width
          slice.height = slicePx
          slice.getContext('2d').drawImage(canvas, 0, -yPx)

          const yDest = pageNum === 0 ? headerH + 6 : margin
          pdf.addImage(slice.toDataURL('image/png'), 'PNG', margin, yDest, imgMmW, sliceMmH)
          yPx += slicePx
          pageNum++
        }
      }

      // ── Footer on every page ────────────────────────────────────────────
      const totalPages = pdf.getNumberOfPages()
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(7)
        pdf.setTextColor(150, 160, 175)
        pdf.text('Diagnostic 7S — Document confidentiel', margin, pageH - 6)
        pdf.text(`${p} / ${totalPages}`, pageW - margin, pageH - 6, { align: 'right' })
      }

      const filename = `analyse-7S_${ready.map(s => (s.label || s.code).replace(/\s+/g, '-')).join('_vs_')}.pdf`
      pdf.save(filename)
    } catch (e) {
      console.error('PDF export failed:', e)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="session-wrapper">
      <header className="session-header">
        <Link to="/" className="session-header__logo">
          <div className="nav__logo-mark"><LogoMark animate={false} /></div>
          <span className="session-header__logo-name">Diagnostic 7S</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/mes-sessions" className="btn-ghost" style={{ fontSize: '0.875rem' }}>Mes sessions</Link>
          {canCompare && (
            <button
              className="btn btn-outline"
              onClick={exportPDF}
              disabled={exporting}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {exporting
                ? 'Export…'
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Exporter PDF</>
              }
            </button>
          )}
          <Link to="/creer-session" className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>+ Nouvelle session</Link>
        </div>
      </header>

      <main className="session-main" style={{ alignItems: 'flex-start', paddingTop: '2.5rem' }}>
        <div style={{ width: '100%', maxWidth: 960 }}>

          {/* Titre */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '0.4rem' }}>
              Analyseur multi-sessions
            </h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9375rem' }}>
              Comparez les perceptions de plusieurs groupes sur une même organisation. Ajoutez 2 à 4 sessions.
            </p>
          </div>

          {/* Sélecteur de sessions */}
          <div className="analyser-selector">

            {/* Slots existants */}
            <AnimatePresence>
              {slots.map((s, i) => (
                <motion.div
                  key={s.id}
                  className={`analyser-slot${s.error ? ' analyser-slot--error' : ''}${s.loading ? ' analyser-slot--loading' : ''}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="analyser-slot__top">
                    <div className="analyser-slot__color" style={{ background: SESSION_COLORS[i % SESSION_COLORS.length].line }} />
                    <div className="analyser-slot__code">{s.code}</div>
                    <button className="analyser-slot__remove" onClick={() => removeSlot(s.id)}>✕</button>
                  </div>

                  {s.loading && <div className="analyser-slot__spinner"><div className="q-spinner" style={{ width: 24, height: 24, borderWidth: 2 }} /></div>}
                  {s.error && <div className="analyser-slot__err">{s.error}</div>}

                  {s.session && (
                    <>
                      <div className="analyser-slot__meta">{s.session.org_name} · {s.respondents} répondant{s.respondents !== 1 ? 's' : ''}</div>
                      <div className="form-field" style={{ marginBottom: 0 }}>
                        <label style={{ fontSize: '0.72rem' }}>Nom affiché dans l'analyse</label>
                        <input
                          type="text"
                          value={s.label}
                          onChange={e => updateLabel(s.id, e.target.value)}
                          placeholder={s.session.org_name}
                          style={{ fontSize: '0.875rem', padding: '0.4rem 0.625rem' }}
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Ajouter une session */}
            {slots.length < 4 && (
              <div className="analyser-add">
                <div className="analyser-add__title">Ajouter une session</div>

                {/* Suggestions depuis localStorage */}
                {localSess.filter(ls => !slots.find(s => s.code === ls.code)).length > 0 && (
                  <div className="analyser-suggestions">
                    {localSess.filter(ls => !slots.find(s => s.code === ls.code)).map(ls => (
                      <button key={ls.code} className="analyser-suggestion" onClick={() => fetchSession(ls.code)}>
                        <span className="analyser-suggestion__org">{ls.org_name}</span>
                        <span className="analyser-suggestion__code">{ls.code}</span>
                      </button>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <input
                    type="text"
                    placeholder="Code de session"
                    value={addCode}
                    onChange={e => setAddCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && fetchSession(addCode)}
                    maxLength={6}
                    style={{ fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.5rem 0.75rem', border: '1.5px solid var(--border)', borderRadius: 6, fontSize: '0.9rem', flex: 1 }}
                  />
                  <button className="btn btn-primary" onClick={() => fetchSession(addCode)} style={{ flexShrink: 0, fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                    Ajouter
                  </button>
                </div>
                {addError && <div className="session-error" style={{ marginTop: '0.5rem', marginBottom: 0, padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}>{addError}</div>}
              </div>
            )}
          </div>

          {/* ── ANALYSE ── */}
          {!canCompare && ready.length < 2 && (
            <div className="analyser-empty">
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📊</div>
              <p>Ajoutez au moins <strong>2 sessions</strong> pour lancer la comparaison.</p>
            </div>
          )}

          {canCompare && (
            <motion.div
              ref={analysisRef}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Légende */}
              <div className="analyser-legend">
                {ready.map((s, i) => (
                  <div key={s.id} className="analyser-legend__item">
                    <span className="analyser-legend__dot" style={{ background: SESSION_COLORS[i % SESSION_COLORS.length].line }} />
                    <span className="analyser-legend__label">{s.label || s.code}</span>
                    <span className="analyser-legend__meta">({s.respondents} répondant{s.respondents !== 1 ? 's' : ''})</span>
                  </div>
                ))}
              </div>

              <div className="analyser-grid">

                {/* Radar */}
                <div className="analyser-panel analyser-panel--radar">
                  <div className="panel-header">
                    <h2 className="panel-title">Profil comparatif</h2>
                  </div>
                  <div style={{ maxWidth: 340, margin: '0 auto' }}>
                    <Radar data={radarData} options={RADAR_OPTIONS} />
                  </div>
                </div>

                {/* Table des écarts */}
                <div className="analyser-panel analyser-panel--table">
                  <div className="panel-header">
                    <h2 className="panel-title">Écarts par dimension</h2>
                    <p className="panel-sub">
                      <span className="gap-chip gap--low">Consensus</span> &lt; 15 pts ·{' '}
                      <span className="gap-chip gap--medium">Divergence</span> 15–25 pts ·{' '}
                      <span className="gap-chip gap--high">Forte tension</span> &gt; 25 pts
                    </p>
                  </div>
                  <div className="analyser-table">
                    <div className="analyser-table__head">
                      <div>Dimension</div>
                      {ready.map((s, i) => (
                        <div key={s.id} style={{ color: SESSION_COLORS[i % SESSION_COLORS.length].line, textAlign: 'right' }}>
                          {s.label || s.code}
                        </div>
                      ))}
                      <div style={{ textAlign: 'right' }}>Écart</div>
                    </div>
                    {dimTable.map(({ dim, scores, gap, level }) => (
                      <div key={dim.id} className={`analyser-table__row analyser-table__row--${level}`}>
                        <div className="analyser-table__dim">
                          <span>{dim.icon}</span>
                          <span>{dim.label}</span>
                        </div>
                        {scores.map((s, i) => (
                          <div key={i} className="analyser-table__score" style={{ color: s.color }}>{s.score}</div>
                        ))}
                        <div className="analyser-table__gap">
                          <span className={`gap-chip gap--${level}`}>{gap} pts</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divergence / Consensus */}
              <div className="session-divergence" style={{ marginTop: '1.5rem' }}>
                <div className="session-divergence__col session-divergence__col--div">
                  <div className="session-divergence__label"><span>⚡</span> Zones de divergence</div>
                  <p className="session-divergence__sub">Dimensions où les groupes ont des perceptions très différentes — prioritaires à approfondir.</p>
                  {divergent.length === 0
                    ? <div style={{ fontSize: '0.8125rem', color: 'var(--text-light)' }}>Aucune divergence significative détectée.</div>
                    : divergent.map(({ dim, gap }) => (
                      <div key={dim.id} className="session-divergence__row">
                        <span>{dim.icon} {dim.label}</span>
                        <span className="session-divergence__spread">écart {gap} pts</span>
                      </div>
                    ))
                  }
                </div>
                <div className="session-divergence__col session-divergence__col--conv">
                  <div className="session-divergence__label"><span>✓</span> Zones de consensus</div>
                  <p className="session-divergence__sub">Dimensions partagées par tous les groupes — points d'appui solides pour la conduite du changement.</p>
                  {convergent.map(({ dim, gap }) => (
                    <div key={dim.id} className="session-divergence__row">
                      <span>{dim.icon} {dim.label}</span>
                      <span className="session-divergence__spread">écart {gap} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </main>
    </div>
  )
}
