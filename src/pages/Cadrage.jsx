import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { motion } from 'framer-motion'
import supabase from '../lib/supabase'
import LogoMark from '../components/LogoMark'
import '../../assets/css/cadrage.css'

// ── Référentiels ──────────────────────────────────────────────────────────────

const STRUCTURE_TYPES = [
  { value: 'fonctionnelle',  label: 'Fonctionnelle',   desc: 'Regroupement par grandes fonctions (RH, Finance, Production…). Centralisation forte, silos fréquents.' },
  { value: 'divisionnelle',  label: 'Divisionnelle',   desc: 'Divisions autonomes par produit, marché ou zone géographique. Chaque division a ses propres fonctions.' },
  { value: 'matricielle',    label: 'Matricielle',     desc: 'Double ligne hiérarchique fonctionnelle + projet/produit. Coordination complexe, tensions de légitimité.' },
  { value: 'projets',        label: 'Par projets',     desc: 'Organisation temporaire centrée sur des projets. Structure légère, mobilisation ponctuelle des expertises.' },
  { value: 'reseau',         label: 'En réseau',       desc: 'Entité centrale coordonnant des partenaires externes. Externalisation forte, coordination contractuelle.' },
  { value: 'hybride',        label: 'Hybride',         desc: 'Combinaison de plusieurs modèles selon les activités ou les niveaux hiérarchiques.' },
]

const FORMALIZATION = [
  { value: 'tres_formalisee', label: 'Très formalisée',   desc: 'Procédures écrites pour la quasi-totalité des situations, organigramme précis, peu de place à l\'initiative.' },
  { value: 'formalisee',      label: 'Formalisée',        desc: 'Règles et procédures claires sur les activités critiques, adaptation possible sur le reste.' },
  { value: 'peu_formalisee',  label: 'Peu formalisée',    desc: 'Fonctionnement largement basé sur la confiance et les habitudes implicites. Règles formelles réduites.' },
  { value: 'informelle',      label: 'Informelle',        desc: 'Très peu de règles écrites. Organisation fondée sur les relations personnelles et l\'ajustement mutuel.' },
]

const COORDINATION = [
  { value: 'supervision',     label: 'Supervision directe',           desc: 'Le manager contrôle et coordonne directement le travail de son équipe.' },
  { value: 'std_processus',   label: 'Standardisation des processus', desc: 'Les procédures et méthodes de travail sont définies à l\'avance et imposées.' },
  { value: 'std_resultats',   label: 'Standardisation des résultats', desc: 'Les objectifs sont fixés, les équipes libres de choisir leurs moyens.' },
  { value: 'std_competences', label: 'Standardisation des savoirs',   desc: 'La coordination repose sur la formation et la professionnalisation des individus.' },
  { value: 'ajustement',      label: 'Ajustement mutuel',             desc: 'Coordination informelle par communication directe entre les acteurs. Adaptatif.' },
]

const HIERARCHY = [
  { value: 'forte',   label: 'Forte',   desc: 'Grande distance entre niveaux. Décisions concentrées au sommet, faible délégation.' },
  { value: 'moderee', label: 'Modérée', desc: 'Délégation partielle. Les niveaux intermédiaires ont une marge d\'initiative encadrée.' },
  { value: 'faible',  label: 'Faible',  desc: 'Organisation plutôt horizontale. Accès facile aux décideurs, culture du consensus.' },
]

const UNCERTAINTY = [
  { value: 'forte',   label: 'Forte aversion',    desc: 'Besoin marqué de règles, procédures et prévisibilité. L\'ambiguïté génère de la résistance.' },
  { value: 'moderee', label: 'Modérée',            desc: 'Tolérance variable selon le contexte. Capacité à s\'adapter sans règles explicites sur certains sujets.' },
  { value: 'faible',  label: 'Confort avec l\'incertitude', desc: 'Organisation à l\'aise dans l\'ambiguïté. Peu de procédures, réactivité et improvisation valorisées.' },
]

const ORIENTATION = [
  { value: 'individuelle', label: 'Individuelle', desc: 'Valorisation de la performance personnelle, de l\'autonomie et de la responsabilité individuelle.' },
  { value: 'collective',   label: 'Collective',   desc: 'Prééminence du groupe, de la solidarité et de la décision partagée sur l\'initiative individuelle.' },
]

const DECISION_MODELS = [
  { value: 'rationnel',       label: 'Rationnel / Planifié',      desc: 'Décisions fondées sur l\'analyse, l\'optimisation et des critères formalisés. LCAG, plans stratégiques.' },
  { value: 'organisationnel', label: 'Organisationnel',           desc: 'Décisions guidées par les procédures, routines et divisions du travail (rationalité limitée, Simon).' },
  { value: 'politique',       label: 'Politique / Négocié',       desc: 'Coalitions, lobbying, compromis entre acteurs aux intérêts divergents. Le pouvoir prime.' },
  { value: 'emergent',        label: 'Émergent / Anarchique',     desc: 'Peu de processus formels. Décisions prises selon les circonstances, les présences et les opportunités.' },
]

const LEADERSHIP_STYLES = [
  { value: 'analytique',       label: 'Analytique',       desc: 'Fondé sur les données, la rigueur et la résolution de problèmes. Décision par l\'analyse.' },
  { value: 'humaniste',        label: 'Humaniste',        desc: 'Centré sur les personnes, la relation et le développement des collaborateurs.' },
  { value: 'visionnaire',      label: 'Visionnaire',      desc: 'Orienté vers le futur et l\'inspiration. Mobilise par le sens et les ambitions collectives.' },
  { value: 'operationnel',     label: 'Opérationnel',     desc: 'Focalisé sur l\'exécution, les résultats et l\'efficacité à court terme.' },
  { value: 'communicationnel', label: 'Communicationnel', desc: 'Maîtrise des réseaux, de la mise en récit et de l\'influence. Coordination par la communication.' },
]

const EMPTY = {
  structure_type: '',
  formalization: '',
  coordination: '',
  hierarchy_distance: '',
  uncertainty: '',
  orientation: '',
  decision_model: '',
  leadership_style: '',
}

// ── Sous-composant : sélecteur de carte ──────────────────────────────────────

function CardSelect({ options, value, onChange }) {
  return (
    <div className="cad-cards">
      {options.map(opt => (
        <label key={opt.value} className={`cad-card${value === opt.value ? ' cad-card--selected' : ''}`}>
          <input type="radio" name={Math.random()} value={opt.value} checked={value === opt.value} onChange={() => onChange(opt.value)} />
          <div className="cad-card__inner">
            <div className="cad-card__label">{opt.label}</div>
            <div className="cad-card__desc">{opt.desc}</div>
          </div>
        </label>
      ))}
    </div>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function Cadrage() {
  useDocumentMeta({
    title: 'Cadrage | Diagnostic 7S',
    description: 'Définissez le contexte organisationnel (structure, gouvernance, culture) pour affiner l\'interprétation de votre diagnostic 7S.',
  })
  const { code } = useParams()

  const [session, setSession] = useState(null)
  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    async function load() {
      const { data: sess } = await supabase.from('sessions').select('*').eq('code', code.toUpperCase()).single()
      if (!sess) { setError('Session introuvable.'); setLoading(false); return }
      setSession(sess)
      if (sess.cadrage && Object.keys(sess.cadrage).length > 0) {
        setForm({ ...EMPTY, ...sess.cadrage })
      }
      setLoading(false)
    }
    load()
  }, [code])

  function update(key, val) {
    setForm(prev => ({ ...prev, [key]: val }))
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    setError(null)
    try {
      const { error: err } = await supabase
        .from('sessions')
        .update({ cadrage: form })
        .eq('id', session.id)
      if (err) throw err
      setSession(prev => ({ ...prev, cadrage: form }))
      setSaved(true)
    } catch (e) {
      setError('Erreur lors de la sauvegarde. Veuillez réessayer.')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const filledCount = Object.values(form).filter(Boolean).length
  const totalFields = Object.keys(EMPTY).length

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="q-spinner" />
    </div>
  )

  if (error && !session) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ color: 'var(--text-light)' }}>{error}</p>
      <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
    </div>
  )

  return (
    <div className="cad-wrapper">

      {/* ── Header ── */}
      <header className="cad-header">
        <Link to="/" className="cad-header__logo">
          <div className="nav__logo-mark"><LogoMark animate={false} /></div>
          <span className="cad-header__logo-name">Diagnostic 7S</span>
        </Link>
        <div className="cad-header__center">
          <span className="cad-header__org">{session?.org_name}</span>
          <span className="cad-header__code">·&nbsp;{code.toUpperCase()}</span>
        </div>
        <div className="cad-header__actions">
          <div className="cad-progress-pill">
            <span>{filledCount}/{totalFields}</span>
            <div className="cad-progress-pill__bar">
              <div className="cad-progress-pill__fill" style={{ width: `${(filledCount / totalFields) * 100}%` }} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={save} disabled={saving} style={{ fontSize: '0.875rem', padding: '0.5rem 1.125rem' }}>
            {saving ? 'Sauvegarde…' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
          </button>
          <Link to={`/resultats-session/${code}`} className="cad-back-btn">← Résultats</Link>
        </div>
      </header>

      <main className="cad-main">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          <div className="cad-intro">
            <h1 className="cad-intro__title">Cadrage de mission</h1>
            <p className="cad-intro__sub">
              Renseignez vos observations terrain avant ou pendant la collecte. Ces informations enrichissent l'interprétation des résultats et la pertinence des recommandations.
            </p>
          </div>

          {/* ── Section 1 : Structure ── */}
          <section className="cad-section">
            <div className="cad-section__header">
              <div className="cad-section__num">1</div>
              <div>
                <div className="cad-section__title">Structure organisationnelle</div>
                <div className="cad-section__sub">Vos observations sur la configuration formelle de l'organisation — d'après Mintzberg.</div>
              </div>
            </div>

            <div className="cad-field">
              <label className="cad-field__label">Type de structure observé</label>
              <CardSelect options={STRUCTURE_TYPES} value={form.structure_type} onChange={v => update('structure_type', v)} />
            </div>

            <div className="cad-field">
              <label className="cad-field__label">Niveau de formalisation</label>
              <CardSelect options={FORMALIZATION} value={form.formalization} onChange={v => update('formalization', v)} />
            </div>

            <div className="cad-field">
              <label className="cad-field__label">Mécanisme de coordination dominant</label>
              <CardSelect options={COORDINATION} value={form.coordination} onChange={v => update('coordination', v)} />
            </div>
          </section>

          {/* ── Section 2 : Culture ── */}
          <section className="cad-section">
            <div className="cad-section__header">
              <div className="cad-section__num">2</div>
              <div>
                <div className="cad-section__title">Profil culturel</div>
                <div className="cad-section__sub">Perception des indicateurs culturels selon Hofstede — basée sur vos observations, entretiens et documents internes.</div>
              </div>
            </div>

            <div className="cad-field">
              <label className="cad-field__label">Distance hiérarchique perçue</label>
              <div className="cad-hint">Dans quelle mesure les collaborateurs acceptent-ils que le pouvoir soit inégalement distribué ?</div>
              <CardSelect options={HIERARCHY} value={form.hierarchy_distance} onChange={v => update('hierarchy_distance', v)} />
            </div>

            <div className="cad-field">
              <label className="cad-field__label">Rapport à l'incertitude</label>
              <div className="cad-hint">L'organisation tolère-t-elle l'ambiguïté, ou cherche-t-elle à l'éliminer par des règles ?</div>
              <CardSelect options={UNCERTAINTY} value={form.uncertainty} onChange={v => update('uncertainty', v)} />
            </div>

            <div className="cad-field">
              <label className="cad-field__label">Orientation dominante</label>
              <div className="cad-hint">Ce qui est valorisé : la performance individuelle ou la cohésion collective ?</div>
              <CardSelect options={ORIENTATION} value={form.orientation} onChange={v => update('orientation', v)} />
            </div>
          </section>

          {/* ── Section 3 : Décisionnel ── */}
          <section className="cad-section">
            <div className="cad-section__header">
              <div className="cad-section__num">3</div>
              <div>
                <div className="cad-section__title">Processus décisionnel</div>
                <div className="cad-section__sub">Comment les décisions se prennent-elles réellement dans cette organisation ? — d'après Allison, Simon et Cohen.</div>
              </div>
            </div>

            <div className="cad-field">
              <label className="cad-field__label">Modèle décisionnel dominant observé</label>
              <CardSelect options={DECISION_MODELS} value={form.decision_model} onChange={v => update('decision_model', v)} />
            </div>

            <div className="cad-field">
              <label className="cad-field__label">Style de leadership observé</label>
              <CardSelect options={LEADERSHIP_STYLES} value={form.leadership_style} onChange={v => update('leadership_style', v)} />
            </div>
          </section>

          {/* ── Footer actions ── */}
          <div className="cad-footer">
            {error && <div className="session-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}
            <button className="btn btn-primary" onClick={save} disabled={saving} style={{ fontSize: '0.9375rem', padding: '0.625rem 1.5rem' }}>
              {saving ? 'Sauvegarde…' : saved ? '✓ Cadrage sauvegardé' : 'Sauvegarder le cadrage'}
            </button>
            <Link to={`/resultats-session/${code}`} className="btn-ghost" style={{ fontSize: '0.875rem' }}>
              Retour aux résultats
            </Link>
          </div>

        </motion.div>
      </main>
    </div>
  )
}
