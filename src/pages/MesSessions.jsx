import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { motion } from 'framer-motion'
import supabase from '../lib/supabase'
import LogoMark from '../components/LogoMark'
import '../../assets/css/session.css'

const MODE_LABELS = {
  shared:     { label: 'Session partagée',       icon: '🔗' },
  collective: { label: 'Remplissage collectif',  icon: '🤝' },
  comparison: { label: 'Comparaison multi-profils', icon: '📊' }
}

const CADRAGE_TOTAL = 8

const LS_KEY = 'diagnostic7s_sessions'

function getLocalCodes() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') }
  catch { return [] }
}

function saveLocalCode(code) {
  const codes = getLocalCodes()
  if (!codes.includes(code)) {
    localStorage.setItem(LS_KEY, JSON.stringify([code, ...codes]))
  }
}

function removeLocalCode(code) {
  const codes = getLocalCodes().filter(c => c !== code)
  localStorage.setItem(LS_KEY, JSON.stringify(codes))
}

export default function MesSessions() {
  useDocumentMeta({
    title: 'Mes sessions | Diagnostic 7S',
    description: 'Gérez vos sessions de diagnostic organisationnel 7S, accédez aux résultats et suivez l\'évolution de votre organisation dans le temps.',
  })
  const [sessions,  setSessions]  = useState([])
  const [counts,    setCounts]    = useState({})
  const [loading,   setLoading]   = useState(true)
  const [addCode,   setAddCode]   = useState('')
  const [addError,  setAddError]  = useState('')
  const [closing,   setClosing]   = useState(null)
  const [copied,    setCopied]    = useState(null)

  async function loadSessions(codes) {
    if (!codes.length) { setLoading(false); return }

    const { data: sessData } = await supabase
      .from('sessions')
      .select('*')
      .in('code', codes)
      .order('created_at', { ascending: false })

    if (!sessData?.length) { setLoading(false); return }

    const ids = sessData.map(s => s.id)
    const { data: diagData } = await supabase
      .from('diagnostics')
      .select('session_id')
      .in('session_id', ids)
      .eq('completed', true)

    const countMap = (diagData ?? []).reduce((acc, d) => {
      acc[d.session_id] = (acc[d.session_id] || 0) + 1
      return acc
    }, {})

    setSessions(sessData)
    setCounts(countMap)
    setLoading(false)
  }

  useEffect(() => {
    loadSessions(getLocalCodes())
  }, [])

  async function addByCode() {
    const code = addCode.trim().toUpperCase()
    if (!code) return
    setAddError('')

    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', code)
      .single()

    if (!data) { setAddError('Code introuvable. Vérifiez le code de session.'); return }

    saveLocalCode(code)
    setAddCode('')
    setLoading(true)
    loadSessions(getLocalCodes())
  }

  async function closeSession(session) {
    setClosing(session.id)
    await supabase.from('sessions').update({ is_active: false }).eq('id', session.id)
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, is_active: false } : s))
    setClosing(null)
  }

  async function reopenSession(session) {
    await supabase.from('sessions').update({ is_active: true }).eq('id', session.id)
    setSessions(prev => prev.map(s => s.id === session.id ? { ...s, is_active: true } : s))
  }

  function removeSession(code) {
    removeLocalCode(code)
    setSessions(prev => prev.filter(s => s.code !== code))
  }

  function copyLink(code) {
    navigator.clipboard.writeText(`${window.location.origin}/session/${code}`)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const localCodes = getLocalCodes()

  return (
    <div className="session-wrapper">
      <header className="session-header">
        <Link to="/" className="session-header__logo">
          <div className="nav__logo-mark"><LogoMark animate={false} /></div>
          <span className="session-header__logo-name">Diagnostic 7S</span>
        </Link>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <Link to="/analyser" className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
            Analyser
          </Link>
          <Link to="/creer-session" className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
            + Nouvelle session
          </Link>
        </div>
      </header>

      <main className="session-main" style={{ alignItems: 'flex-start', paddingTop: '2.5rem' }}>
        <div style={{ width: '100%', maxWidth: 820 }}>

          {/* Titre */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', color: 'var(--navy)', marginBottom: '0.4rem' }}>
              Mes sessions
            </h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9375rem' }}>
              Accédez aux résultats, au cadrage et à la feuille de route de chacune de vos sessions.
            </p>
          </div>

          {/* Ajouter par code */}
          <div className="session-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
              <div className="form-field" style={{ flex: 1, marginBottom: 0 }}>
                <label htmlFor="add-code" style={{ fontSize: '0.8rem' }}>Retrouver une session par son code</label>
                <input
                  id="add-code"
                  type="text"
                  placeholder="ex : A7B2K9"
                  value={addCode}
                  onChange={e => setAddCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && addByCode()}
                  maxLength={6}
                  style={{ fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                />
              </div>
              <button className="btn btn-primary" onClick={addByCode} style={{ flexShrink: 0 }}>
                Ajouter
              </button>
            </div>
            {addError && <div className="session-error" style={{ marginTop: '0.75rem', marginBottom: 0 }}>{addError}</div>}
          </div>

          {/* Liste */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <div className="q-spinner" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="session-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
              <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--navy)', marginBottom: '0.5rem' }}>
                Aucune session pour l'instant
              </h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                Créez votre première session multi-répondants ou retrouvez-en une existante via son code.
              </p>
              <Link to="/creer-session" className="btn btn-primary">Créer une session</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {sessions.map((s, i) => {
                const count        = counts[s.id] ?? 0
                const modeInfo     = MODE_LABELS[s.mode] ?? { label: s.mode, icon: '📋' }
                const threshold    = s.min_respondents ?? 1
                const reached      = count >= threshold
                const cadrageCount = Object.values(s.cadrage || {}).filter(v => v && v !== '').length
                const cadrageDone  = cadrageCount === CADRAGE_TOTAL

                return (
                  <motion.div
                    key={s.id}
                    className="session-card"
                    style={{ padding: '1.5rem' }}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="ms-card-inner">

                      {/* ── Ligne info + actions ── */}
                      <div className="ms-card-body">
                        <div className="ms-card-info">
                          <div className="ms-card-top">
                            <span className="ms-card-mode">{modeInfo.icon} {modeInfo.label}</span>
                            <span className={`ms-card-status ${s.is_active ? 'ms-card-status--active' : 'ms-card-status--closed'}`}>
                              {s.is_active ? 'Active' : 'Clôturée'}
                            </span>
                          </div>
                          <div className="ms-card-org">{s.org_name}</div>
                          <div className="ms-card-meta">
                            <span>Code <strong style={{ fontFamily: 'monospace', letterSpacing: '0.08em' }}>{s.code}</strong></span>
                            <span>·</span>
                            <span>{formatDate(s.created_at)}</span>
                            {s.sector && <><span>·</span><span>{s.sector}</span></>}
                          </div>
                          <div className="ms-progress">
                            <div className="ms-progress-bar">
                              <div
                                className="ms-progress-fill"
                                style={{ width: `${Math.min(100, (count / Math.max(threshold, 1)) * 100)}%` }}
                              />
                            </div>
                            <span className="ms-progress-label">
                              <strong>{count}</strong> répondant{count !== 1 ? 's' : ''}
                              {threshold > 1 && ` / ${threshold} requis`}
                              {threshold > 1 && (reached
                                ? <span style={{ color: '#166534', marginLeft: '0.4rem' }}>✓ Seuil atteint</span>
                                : <span style={{ color: 'var(--text-light)', marginLeft: '0.4rem' }}>— en attente</span>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Actions utilitaires */}
                        <div className="ms-card-actions">
                          {s.is_active && (
                            <button
                              className="btn-ghost ms-action-btn"
                              onClick={() => copyLink(s.code)}
                              title="Copier le lien répondant"
                            >
                              {copied === s.code
                                ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copié</>
                                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copier le lien</>
                              }
                            </button>
                          )}
                          {s.is_active ? (
                            <button
                              className="btn-ghost ms-action-btn ms-action-btn--danger"
                              onClick={() => closeSession(s)}
                              disabled={closing === s.id}
                            >
                              {closing === s.id ? 'Clôture…' : '🔒 Clôturer'}
                            </button>
                          ) : (
                            <button
                              className="btn-ghost ms-action-btn"
                              onClick={() => reopenSession(s)}
                            >
                              🔓 Réouvrir
                            </button>
                          )}
                          <button
                            className="btn-ghost ms-action-btn ms-action-btn--remove"
                            onClick={() => removeSession(s.code)}
                            title="Retirer de la liste (ne supprime pas la session)"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>

                      {/* ── Barre de modules ── */}
                      <div className="ms-modules">
                        <a href={`/resultats-session/${s.code}`} className="ms-module-link">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                          Résultats
                          {count > 0 && <span className="ms-module-badge ms-module-badge--count">{count}</span>}
                        </a>

                        <a href={`/cadrage/${s.code}`} className={`ms-module-link${cadrageDone ? ' ms-module-link--done' : ''}`}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                          Cadrage
                          <span className={`ms-module-badge${cadrageDone ? ' ms-module-badge--done' : cadrageCount > 0 ? ' ms-module-badge--partial' : ''}`}>
                            {cadrageDone ? '✓' : `${cadrageCount}/${CADRAGE_TOTAL}`}
                          </span>
                        </a>

                        <a
                          href={`/feuille-de-route/${s.code}`}
                          className={`ms-module-link${count === 0 ? ' ms-module-link--dim' : ''}`}
                          title={count === 0 ? 'Disponible dès le premier répondant' : undefined}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                          Feuille de route
                          {count === 0 && <span className="ms-module-badge">—</span>}
                        </a>
                      </div>

                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
