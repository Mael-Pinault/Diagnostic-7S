import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { motion, AnimatePresence } from 'framer-motion'
import supabase from '../lib/supabase'
import LogoMark from '../components/LogoMark'
import '../../assets/css/session.css'

const SECTORS    = ['Industrie & Manufacturing','Services aux entreprises','Conseil & Expertise','Finance & Assurance','Santé & Médico-social','Distribution & Retail','Technologies & Numérique','Énergie & Environnement','Secteur public & Associations','Autre']
const SIZES      = ['< 10 collaborateurs','10 – 49','50 – 249','250 – 999','1 000 – 4 999','5 000 +']
const GOVERNANCE = ['Familiale','ETI indépendante','Filiale de groupe','Cotée en bourse','PE / LBO','Secteur public','Association / ESS']

const MODES = [
  {
    id: 'shared',
    icon: '🔗',
    title: 'Session partagée',
    tag: 'Recommandé',
    desc: 'Générez un lien unique à envoyer à vos répondants. Chacun remplit de façon autonome. Les résultats s\'agrègent en temps réel.'
  },
  {
    id: 'collective',
    icon: '🤝',
    title: 'Remplissage collectif',
    tag: 'Atelier',
    desc: 'Un animateur pilote la session. Le groupe discute et valide chaque réponse ensemble. Un seul diagnostic, construit en équipe.'
  },
  {
    id: 'comparison',
    icon: '📊',
    title: 'Comparaison multi-profils',
    tag: 'Avancé',
    desc: 'Chaque répondant est tagué par son rôle (dirigeant, manager, équipe). Les résultats comparent les perceptions par niveau.'
  }
]

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const slide = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -18 },
  transition: { duration: 0.22 }
}

export default function SessionCreer() {
  useDocumentMeta({
    title: 'Créer une session | Diagnostic 7S',
    description: 'Lancez un diagnostic collectif McKinsey 7S. Invitez vos collaborateurs, comparez les perceptions par niveau hiérarchique et obtenez une synthèse collective.',
  })
  const [step, setStep]     = useState(1)
  const [mode, setMode]     = useState('')
  const [form, setForm]     = useState({ org_name: '', sector: '', company_size: '', governance_type: '', created_by_name: '', created_by_email: '' })
  const [minRespondents, setMinRespondents] = useState(1)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')
  const [copied, setCopied] = useState(false)

  const [searchParams] = useSearchParams()
  const suiviCode = searchParams.get('suivi')?.toUpperCase() ?? null
  const [parentSession, setParentSession] = useState(null)

  useEffect(() => {
    if (!suiviCode) return
    supabase.from('sessions').select('*').eq('code', suiviCode).single()
      .then(({ data }) => {
        if (!data) return
        setParentSession(data)
        setForm(prev => ({
          ...prev,
          org_name: data.org_name ?? '',
          sector: data.sector ?? '',
          company_size: data.company_size ?? '',
          governance_type: data.governance_type ?? '',
        }))
        if (data.mode) setMode(data.mode)
      })
  }, [suiviCode])

  const sessionUrl   = session ? `${window.location.origin}/session/${session.code}` : ''
  const dashboardUrl = session ? `${window.location.origin}/resultats-session/${session.code}` : ''

  function update(key, val) { setForm(p => ({ ...p, [key]: val })) }

  async function createSession() {
    if (!form.org_name.trim()) { setError("Le nom de l'organisation est requis."); return }
    setLoading(true); setError('')
    try {
      const code = generateCode()
      const { data, error: err } = await supabase
        .from('sessions')
        .insert({ code, mode, ...form, min_respondents: minRespondents, ...(parentSession ? { parent_session_id: parentSession.id } : {}) })
        .select()
        .single()
      if (err) throw err
      try {
        const stored = JSON.parse(localStorage.getItem('diagnostic7s_sessions') || '[]')
        if (!stored.includes(data.code)) {
          localStorage.setItem('diagnostic7s_sessions', JSON.stringify([data.code, ...stored]))
        }
      } catch {}
      setSession(data)
      setStep(3)
    } catch (e) {
      const msg = e?.code === '42P01'
        ? 'La table "sessions" n\'existe pas encore dans Supabase. Exécutez le schéma SQL fourni.'
        : e?.message?.includes('fetch')
        ? 'Impossible de joindre Supabase. Vérifiez votre connexion internet.'
        : `Erreur : ${e?.message ?? 'inconnue'}`
      setError(msg)
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  function copyUrl() {
    navigator.clipboard.writeText(sessionUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const selectedMode = MODES.find(m => m.id === mode)

  return (
    <div className="session-wrapper">
      <header className="session-header">
        <Link to="/" className="session-header__logo">
          <div className="nav__logo-mark"><LogoMark animate={false} /></div>
          <span className="session-header__logo-name">Diagnostic 7S</span>
        </Link>
        <div className="session-stepper">
          {['Mode', 'Organisation', 'Partage'].map((label, i) => (
            <div key={label} className={`session-stepper__item${step > i + 1 ? ' done' : ''}${step === i + 1 ? ' active' : ''}`}>
              <div className="session-stepper__dot">{step > i + 1 ? '✓' : i + 1}</div>
              <span className="session-stepper__label">{label}</span>
              {i < 2 && <div className="session-stepper__line" />}
            </div>
          ))}
        </div>
      </header>

      <main className="session-main">
        <AnimatePresence mode="wait">

          {/* ── ÉTAPE 1 : choix du mode ── */}
          {step === 1 && (
            <motion.div key="s1" {...slide} className="session-card">
              <p className="session-card__eyebrow">Étape 1 sur 3</p>
              <h1 className="session-card__title">Quel mode de collecte ?</h1>
              <p className="session-card__sub">Adaptez la méthode à votre contexte de mission. Vous pouvez créer plusieurs sessions avec des modes différents.</p>

              <div className="mode-grid">
                {MODES.map(m => (
                  <label key={m.id} className={`mode-card${mode === m.id ? ' mode-card--selected' : ''}`}>
                    <input type="radio" name="mode" value={m.id} checked={mode === m.id} onChange={() => setMode(m.id)} />
                    <div className="mode-card__inner">
                      <div className="mode-card__top">
                        <span className="mode-card__icon">{m.icon}</span>
                        <span className="mode-card__tag">{m.tag}</span>
                      </div>
                      <div className="mode-card__title">{m.title}</div>
                      <div className="mode-card__desc">{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="session-nav">
                <Link to="/" className="btn-ghost">Annuler</Link>
                <button className="btn btn-primary" disabled={!mode} onClick={() => setStep(2)}>
                  Continuer
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </button>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 2 : infos organisation ── */}
          {step === 2 && (
            <motion.div key="s2" {...slide} className="session-card">
              <p className="session-card__eyebrow">Étape 2 sur 3</p>
              <h1 className="session-card__title">L'organisation évaluée</h1>
              <p className="session-card__sub">Ces informations seront pré-remplies pour tous les répondants de la session.</p>

              {parentSession && (
                <div className="suivi-banner">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.41"/></svg>
                  Suivi du diagnostic <strong style={{ margin: '0 0.2em' }}>{parentSession.org_name}</strong> — session {suiviCode}. Les informations sont pré-remplies.
                </div>
              )}

              <div className="form-grid">
                <div className="form-field form-field--full">
                  <label htmlFor="org_name">Nom de l'organisation *</label>
                  <input id="org_name" type="text" placeholder="ex : Acme Corp" value={form.org_name} onChange={e => update('org_name', e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="sector">Secteur d'activité</label>
                  <select id="sector" value={form.sector} onChange={e => update('sector', e.target.value)}>
                    <option value="">— Sélectionner —</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="company_size">Taille de l'organisation</label>
                  <select id="company_size" value={form.company_size} onChange={e => update('company_size', e.target.value)}>
                    <option value="">— Sélectionner —</option>
                    {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="governance_type">Gouvernance</label>
                  <select id="governance_type" value={form.governance_type} onChange={e => update('governance_type', e.target.value)}>
                    <option value="">— Sélectionner —</option>
                    {GOVERNANCE.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label htmlFor="created_by_name">Votre nom</label>
                  <input id="created_by_name" type="text" placeholder="Prénom Nom" value={form.created_by_name} onChange={e => update('created_by_name', e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="created_by_email">Votre email</label>
                  <input id="created_by_email" type="email" placeholder="email@exemple.com" value={form.created_by_email} onChange={e => update('created_by_email', e.target.value)} />
                </div>
                <div className="form-field">
                  <label htmlFor="min_respondents">Nombre minimum de répondants</label>
                  <input
                    id="min_respondents"
                    type="number"
                    min="1"
                    max="200"
                    value={minRespondents}
                    onChange={e => setMinRespondents(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <span className="form-note">Les résultats s'affichent une fois ce seuil atteint.</span>
                </div>
              </div>

              {error && <div className="session-error">{error}</div>}

              <div className="session-nav">
                <button className="btn-ghost" onClick={() => setStep(1)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Retour
                </button>
                <button className="btn btn-primary" onClick={createSession} disabled={loading}>
                  {loading ? 'Création…' : 'Créer la session'}
                  {!loading && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── ÉTAPE 3 : session créée ── */}
          {step === 3 && session && (
            <motion.div key="s3" {...slide} className="session-card session-card--success">
              <div className="session-success-check">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <p className="session-card__eyebrow" style={{ color: 'var(--gold)' }}>Session créée</p>
              <h1 className="session-card__title">Votre session est prête</h1>
              <p className="session-card__sub">
                Mode <strong>{selectedMode?.title}</strong> — {session.org_name}.
                Partagez le lien ci-dessous avec vos répondants.
              </p>

              <div className="session-code-block">
                <div className="session-code-block__row">
                  <div>
                    <div className="session-code-block__label">Code de session</div>
                    <div className="session-code-block__code">{session.code}</div>
                  </div>
                  <div className="session-code-block__sep" />
                  <div style={{ flex: 1 }}>
                    <div className="session-code-block__label">Lien à partager avec les répondants</div>
                    <div className="session-url-row">
                      <code className="session-url">{sessionUrl}</code>
                      <button className={`btn-copy${copied ? ' btn-copy--done' : ''}`} onClick={copyUrl}>
                        {copied ? '✓' : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="session-actions">
                <a href={dashboardUrl} className="btn btn-primary" target="_blank" rel="noreferrer">
                  Ouvrir le tableau de bord live
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
                <Link to="/" className="btn-ghost">Retour à l'accueil</Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  )
}
