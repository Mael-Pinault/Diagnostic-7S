import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { motion } from 'framer-motion'
import supabase from '../lib/supabase'
import LogoMark from '../components/LogoMark'
import '../../assets/css/session.css'

const MODE_LABELS = {
  shared:     { icon: '🔗', label: 'Session partagée',       desc: 'Remplissez le questionnaire de façon autonome. Vos réponses s\'agrégeront avec celles des autres participants.' },
  collective: { icon: '🤝', label: 'Remplissage collectif',  desc: 'Ce questionnaire est complété en groupe, sous la conduite d\'un animateur. Répondez selon ce qui a été décidé collectivement.' },
  comparison: { icon: '📊', label: 'Comparaison multi-profils', desc: 'Vos réponses seront analysées selon votre rôle dans l\'organisation. Sélectionnez le profil qui vous correspond.' }
}

const ROLES = [
  { id: 'dirigeant', label: 'Dirigeant / Comité de direction', icon: '🏢' },
  { id: 'manager',   label: 'Manager intermédiaire',           icon: '👔' },
  { id: 'equipe',    label: 'Membre d\'équipe / Collaborateur', icon: '👥' },
  { id: 'autre',     label: 'Autre (consultant, RH, expert…)', icon: '💡' }
]

export default function SessionJoin() {
  useDocumentMeta({
    title: 'Rejoindre une session | Diagnostic 7S',
    description: 'Participez à un diagnostic organisationnel collectif basé sur le modèle McKinsey 7S et contribuez à l\'analyse de votre organisation.',
  })
  const { code }   = useParams()
  const navigate   = useNavigate()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [role, setRole]       = useState('')
  const [name, setName]       = useState('')

  useEffect(() => {
    async function fetchSession() {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single()
      if (error || !data) { setNotFound(true) }
      else { setSession(data) }
      setLoading(false)
    }
    fetchSession()
  }, [code])

  function startQuestionnaire() {
    const params = new URLSearchParams({ session: session.code })
    if (session.mode === 'comparison' && role) params.set('role', role)
    if (name.trim()) params.set('name', name.trim())
    navigate(`/questionnaire?${params.toString()}`)
  }

  const modeInfo = session ? MODE_LABELS[session.mode] : null
  const canStart = session?.mode !== 'comparison' || role !== ''

  if (loading) {
    return (
      <div className="session-wrapper session-wrapper--center">
        <div className="q-spinner" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="session-wrapper session-wrapper--center">
        <div className="session-card" style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
          <h2>Session introuvable</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
            Le code <strong>{code.toUpperCase()}</strong> ne correspond à aucune session active. Vérifiez le lien reçu.
          </p>
          <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="session-wrapper">
      <header className="session-header">
        <Link to="/" className="session-header__logo">
          <div className="nav__logo-mark"><LogoMark animate={false} /></div>
          <span className="session-header__logo-name">Diagnostic 7S</span>
        </Link>
        <div className="session-header__code">
          Session <strong>{session.code}</strong>
        </div>
      </header>

      <main className="session-main">
        <motion.div
          className="session-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* En-tête session */}
          <div className="join-org-header">
            <div className="join-org-icon">{modeInfo.icon}</div>
            <div>
              <div className="join-org-mode">{modeInfo.label}</div>
              <div className="join-org-name">{session.org_name}</div>
              {session.sector && <div className="join-org-meta">{session.sector}{session.company_size ? ` · ${session.company_size}` : ''}</div>}
            </div>
          </div>

          <p className="session-card__sub" style={{ marginTop: '1.25rem' }}>{modeInfo.desc}</p>

          <div className="join-info-block">
            <div className="join-info-row">
              <span>Questionnaire</span>
              <strong>35 questions · ~15 minutes</strong>
            </div>
            <div className="join-info-row">
              <span>Dimensions évaluées</span>
              <strong>7 (modèle McKinsey 7S)</strong>
            </div>
          </div>

          {/* Champ nom (optionnel) */}
          <div className="form-field" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="respondent_name">Votre prénom <span style={{ fontWeight: 400, color: 'var(--text-light)' }}>(optionnel)</span></label>
            <input
              id="respondent_name"
              type="text"
              placeholder="ex : Sophie"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* Sélection de rôle (mode comparison uniquement) */}
          {session.mode === 'comparison' && (
            <div className="join-role-section">
              <div className="join-role-title">Votre rôle dans l'organisation *</div>
              <div className="join-role-grid">
                {ROLES.map(r => (
                  <label key={r.id} className={`join-role-card${role === r.id ? ' join-role-card--selected' : ''}`}>
                    <input type="radio" name="role" value={r.id} checked={role === r.id} onChange={() => setRole(r.id)} />
                    <span className="join-role-icon">{r.icon}</span>
                    <span className="join-role-label">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="session-nav" style={{ marginTop: '2rem' }}>
            <div />
            <button className="btn btn-primary btn-lg" onClick={startQuestionnaire} disabled={!canStart}>
              Commencer le questionnaire
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>

          <p className="join-footer-note">
            Vos réponses sont sauvegardées automatiquement. Le rapport est accessible à l'issue du questionnaire.
          </p>
        </motion.div>
      </main>
    </div>
  )
}
