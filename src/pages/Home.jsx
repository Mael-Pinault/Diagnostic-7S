import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { motion } from 'framer-motion'
import LogoMark from '../components/LogoMark'

function HeroCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.5 + 0.5,
    }))

    const MAX_DIST = 160
    let raf

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.hypot(dx, dy)
          if (d < MAX_DIST) {
            ctx.globalAlpha = (1 - d / MAX_DIST) * 0.13
            ctx.strokeStyle = 'rgba(201,168,76,1)'
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(201,168,76,0.3)'
        ctx.fill()
      }

      raf = requestAnimationFrame(tick)
    }

    tick()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="hero__canvas" aria-hidden="true" />
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } }
}

const DIMENSIONS = [
  { icon: '🎯', tag: 'Strategy',      title: 'Stratégie',        desc: "Plan d'action pour atteindre un avantage concurrentiel durable. Clarté de la vision, cohérence des choix, horizon temporel." },
  { icon: '🏗️', tag: 'Structure',     title: 'Structure',        desc: 'Organisation formelle : hiérarchies, décentralisation, lignes de reporting, division du travail et mécanismes de coordination.' },
  { icon: '⚙️', tag: 'Systems',       title: 'Systèmes',         desc: 'Processus formels et informels qui gouvernent les activités quotidiennes : reporting, budget, RH, SI, qualité.' },
  { icon: '🧭', tag: 'Style',         title: 'Style managérial', desc: 'Comportements réels des dirigeants, culture de prise de décision, style de leadership effectivement pratiqué.' },
  { icon: '👥', tag: 'Staff',         title: 'Personnel',        desc: 'Profils, démographie, modes de recrutement, politique de développement RH et gestion des talents.' },
  { icon: '💡', tag: 'Skills',        title: 'Compétences',      desc: "Capacités distinctives de l'organisation — ce qu'elle fait mieux que ses concurrents ou ce qui constitue son cœur de métier." },
  { icon: '🔗', tag: 'Shared Values', title: 'Valeurs partagées', desc: 'Normes, croyances et culture organisationnelle fondamentale qui oriente les comportements au-delà des règles formelles.' }
]

const PHASES = [
  {
    num: '01',
    label: 'Cadrage',
    title: 'Observation terrain',
    desc: "Posez les bases avant la collecte. Structure organisationnelle, profil culturel et processus décisionnel renseignés dans un formulaire structuré — d'après Mintzberg, Hofstede et Allison.",
    tags: ['Structure Mintzberg', 'Culture Hofstede', 'Modèle décisionnel'],
    color: '#C9A84C',
  },
  {
    num: '02',
    label: 'Collecte',
    title: 'Questionnaire multi-répondants',
    desc: "35 questions sur 7 dimensions. Recueillez les perceptions de l'ensemble de l'équipe. Module dirigeant pour mesurer l'écart entre vision stratégique et réalité terrain.",
    tags: ['Multi-répondants', 'Module dirigeant', 'Temps réel'],
    color: '#1B5EA6',
  },
  {
    num: '03',
    label: 'Analyse',
    title: 'Radar chart & comparaison',
    desc: "Visualisez l'alignement de chaque dimension, comparez plusieurs sessions et identifiez les zones de fragilité. Export PDF branded généré automatiquement.",
    tags: ['Radar chart', 'Multi-sessions', 'Export PDF'],
    color: '#0D9488',
  },
  {
    num: '04',
    label: 'Recommandations',
    title: 'Feuille de route interactive',
    desc: "Grille d'actions priorisées par levier (humain, systèmes, culture, pilotage) et par horizon temporel. Suivi de progression et export livrable.",
    tags: ['Court / Moyen / Long terme', "Leviers d'action", 'Progression'],
    color: '#7C3AED',
  },
]

const POURQUI = [
  {
    type: 'dirigeant',
    icon: '🏢',
    title: 'Vous êtes dirigeant',
    desc: "Vous évaluez votre propre organisation. Vous avez une connaissance interne de ses pratiques réelles, de ses tensions et de ses forces. Le diagnostic vous permet de les objectiver et de structurer une réflexion stratégique.",
    items: [
      'Préparer une réunion de direction ou un séminaire stratégique',
      'Identifier les sources de désalignement interne',
      'Poser un état des lieux avant d\'engager une transformation'
    ],
    note: 'Le rapport PDF est partageable avec votre équipe dirigeante.'
  },
  {
    type: 'consultant',
    icon: '💼',
    title: 'Vous êtes consultant',
    desc: "Vous accompagnez une organisation cliente. L'outil vous fournit une grille de lecture structurée pour poser un premier diagnostic, créer une base de discussion partagée et orienter les premières hypothèses de travail.",
    items: [
      'Phase de cadrage ou de diagnostic en début de mission',
      'Structurer un entretien ou un atelier client autour du 7S',
      'Produire un livrable de diagnostic exportable en PDF'
    ],
    note: 'Le questionnaire peut être complété en session avec le client ou en amont.'
  }
]

export default function Home() {
  useDocumentMeta({
    title: 'Diagnostic 7S | Analyse organisationnelle McKinsey',
    description: 'Évaluez la cohérence de votre organisation avec le modèle McKinsey 7S. Diagnostic individuel ou collectif, synthèse IA, feuille de route et suivi dans le temps.',
  })
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* NAVIGATION */}
      <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`} id="nav">
        <div className="container">
          <div className="nav__inner">
            <Link to="/" className="nav__logo">
              <div className="nav__logo-mark"><LogoMark animate={false} /></div>
              <span className="nav__logo-name">Diagnostic 7S</span>
            </Link>
            <ul className="nav__links">
              <li><a href="#methode">Méthode</a></li>
              <li><a href="#dimensions">Dimensions</a></li>
              <li><a href="#mission">Workflow</a></li>
              <li><a href="#apropos">À propos</a></li>
            </ul>
            <Link to="/questionnaire" className="btn btn-primary nav__cta">
              Démarrer le diagnostic
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <HeroCanvas />
        <div className="hero__blobs" aria-hidden="true">
          <div className="hero__blob hero__blob--1" />
          <div className="hero__blob hero__blob--2" />
          <div className="hero__blob hero__blob--3" />
        </div>
        <div className="hero__logo-bg" aria-hidden="true">
          <LogoMark animate={false} />
        </div>
        <div className="container">
          <div className="hero__inner">
            <div className="hero__content">
              <motion.div
                className="hero__eyebrow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Modèle McKinsey 7S
              </motion.div>
              <motion.h1
                className="hero__title"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Révélez les leviers de<br />
                <em>transformation</em> de votre organisation
              </motion.h1>
              <motion.p
                className="hero__subtitle"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Un diagnostic structuré en 35 questions pour évaluer la cohérence interne de votre organisation, identifier vos points de force et prioriser vos axes de transformation.
              </motion.p>
              <motion.div
                className="hero__actions"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link to="/questionnaire" className="btn btn-primary btn-lg">
                  Démarrer le diagnostic
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </Link>
                <a href="#methode" className="btn btn-outline btn-lg">Découvrir la méthode</a>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.55 }}
              >
                <Link to="/resultats-session/APERCU" className="hero__demo-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Voir un exemple de rapport complet
                </Link>
              </motion.div>
            </div>

            <motion.div
              className="hero__visual"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
            >
              <div className="hero__visual-card">
                <div className="hero__visual-header">
                  <span className="hero__visual-label">Aperçu du rapport</span>
                  <span className="hero__visual-chip">McKinsey 7S</span>
                </div>
                <div className="hero__visual-dims">
                  {[
                    { label: 'Stratégie',         score: 78, icon: '🎯' },
                    { label: 'Structure',          score: 62, icon: '🏗️' },
                    { label: 'Systèmes',           score: 85, icon: '⚙️' },
                    { label: 'Style',              score: 71, icon: '🧭' },
                    { label: 'Personnel',          score: 55, icon: '👥' },
                    { label: 'Compétences',        score: 90, icon: '💡' },
                    { label: 'Valeurs partagées',  score: 67, icon: '🔗' },
                  ].map(d => (
                    <div key={d.label} className="hero__visual-dim">
                      <span className="hero__visual-dim-icon">{d.icon}</span>
                      <span className="hero__visual-dim-name">{d.label}</span>
                      <div className="hero__visual-dim-track">
                        <div className="hero__visual-dim-fill" style={{ width: `${d.score}%` }} />
                      </div>
                      <span className="hero__visual-dim-score">{d.score}</span>
                    </div>
                  ))}
                </div>
                <div className="hero__visual-footer">
                  <span>Score d'alignement global</span>
                  <span className="hero__visual-global">73 / 100</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="hero__scroll">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10l5 5 5-5" /></svg>
        </div>
      </section>

      {/* STATS BAR */}
      <motion.div
        className="stats-bar"
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
      >
        <div className="container">
          <div className="stats-bar__inner">
            {[
              { number: '7',  label: 'Dimensions analysées' },
              { number: '35', label: 'Questions de diagnostic' },
              { number: '4',  label: 'Phases de mission' },
              { number: '∞',  label: 'Répondants par session' },
            ].map(s => (
              <motion.div key={s.label} variants={fadeUp}>
                <div className="stat__number">{s.number}</div>
                <div className="stat__label">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* POUR QUI */}
      <section className="section section--grey">
        <div className="container">
          <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="section-label">Utilisateurs</span>
            <h2>Pour qui est conçu cet outil ?</h2>
            <p>Le diagnostic s'adresse à deux profils distincts, avec des objectifs différents mais une même logique d'analyse.</p>
          </motion.div>
          <motion.div
            className="pourqui-grid"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {POURQUI.map(p => (
              <motion.div key={p.type} className={`pourqui-card pourqui-card--${p.type}`} variants={fadeUp}>
                <div className="pourqui-card__icon">{p.icon}</div>
                <h3 className="pourqui-card__title">{p.title}</h3>
                <p className="pourqui-card__desc">{p.desc}</p>
                <ul className="pourqui-card__list">
                  {p.items.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
                <div className="pourqui-card__note">{p.note}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* METHODE */}
      <section className="section" id="methode">
        <div className="container">
          <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="section-label">Fondements méthodologiques</span>
            <h2>Un cadre éprouvé pour analyser la cohérence organisationnelle</h2>
            <p>
              Développé par McKinsey &amp; Company dans les années 1980, le modèle 7S postule que la performance d'une organisation repose sur l'alignement de sept facteurs interdépendants — trois « hard » (Strategy, Structure, Systems) et quatre « soft » (Style, Staff, Skills, Shared Values).
            </p>
          </motion.div>
          <div className="method-visual">
            <motion.div
              className="method-grid"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              <motion.div className="method-card method-card--hard" variants={fadeUp}>
                <div className="method-card__type">Facteurs « Hard »</div>
                <h4>Tangibles et formalisés</h4>
                <p>Stratégie, Structure et Systèmes sont directement pilotables par le management et objectivables dans des documents formels.</p>
              </motion.div>
              <motion.div className="method-card method-card--soft" variants={fadeUp}>
                <div className="method-card__type">Facteurs « Soft »</div>
                <h4>Culturels et humains</h4>
                <p>Style, Staff, Compétences et Valeurs partagées sont plus difficiles à modifier mais souvent décisifs dans les transformations durables.</p>
              </motion.div>
              <motion.div className="method-card method-card--center" variants={fadeUp}>
                <div className="method-card__type">Principe central</div>
                <h4>L'alignement comme levier</h4>
                <p>Ce ne sont pas les facteurs pris isolément qui créent la performance, mais leur cohérence mutuelle. Le diagnostic révèle les désalignements.</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DIMENSIONS */}
      <section className="section section--grey" id="dimensions">
        <div className="container">
          <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="section-label">Les 7 dimensions</span>
            <h2>Qu'est-ce que le diagnostic évalue ?</h2>
            <p>Chaque dimension est explorée à travers 5 questions calibrées pour révéler autant les pratiques réelles que les représentations des acteurs.</p>
          </motion.div>
          <motion.div
            className="dimensions"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            {DIMENSIONS.map(d => (
              <motion.div key={d.tag} className="dimension-card" variants={fadeUp}>
                <div className="dimension-card__icon">{d.icon}</div>
                <div className="dimension-card__tag">{d.tag}</div>
                <h3 className="dimension-card__title">{d.title}</h3>
                <p className="dimension-card__desc">{d.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WORKFLOW DE MISSION */}
      <section className="section" id="mission">
        <div className="container">
          <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="section-label">Workflow de mission</span>
            <h2>Un outil conçu pour chaque phase de votre mission</h2>
            <p>Du cadrage initial à la feuille de route finale, chaque étape du diagnostic consultant dispose d'un module dédié.</p>
          </motion.div>
          <motion.div
            className="mission-phases"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
          >
            {PHASES.map(p => (
              <motion.div
                key={p.num}
                className="mission-phase"
                style={{ '--phase-color': p.color }}
                variants={fadeUp}
              >
                <div className="mission-phase__head">
                  <span className="mission-phase__num" style={{ color: p.color }}>{p.num}</span>
                  <span className="mission-phase__label" style={{ background: p.color + '18', color: p.color }}>{p.label}</span>
                </div>
                <h3 className="mission-phase__title">{p.title}</h3>
                <p className="mission-phase__desc">{p.desc}</p>
                <div className="mission-phase__tags">
                  {p.tags.map(t => <span key={t} className="mission-phase__tag">{t}</span>)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* À PROPOS */}
      <section className="section section--grey" id="apropos">
        <div className="container">
          <div className="about-layout">
            <motion.div className="about-content" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <span className="section-label">À propos du projet</span>
              <h2>Un outil ancré dans une formation au conseil</h2>
              <p>Ce diagnostic est un projet personnel développé après l'obtention d'un Master 2 Management Conseil et Recherche en Organisation à l'Université Paris Panthéon-Assas (option Stratégie, 2024-2025). Il prolonge une formation centrée sur l'analyse et la transformation des organisations.</p>
              <p>L'ambition est de montrer qu'une solide maîtrise des frameworks stratégiques peut se traduire en outils opérationnels concrets, directement mobilisables en mission de conseil ou en diagnostic interne. Le modèle McKinsey 7S n'est pas simplement exposé, il est instrumentalisé.</p>
              <p>Les 35 questions, les descripteurs de maturité par niveau et les recommandations ont été calibrés pour refléter les pratiques réelles du conseil en organisation, au-delà de la seule théorie du modèle.</p>
            </motion.div>
            <motion.div
              className="about-card"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="about-card__avatar">MP</div>
              <div className="about-card__name">Maël Pinault</div>
              <div className="about-card__title">Diplômé M2 Management Conseil<br />&amp; Recherche en Organisation</div>
              <div className="about-card__school">Université Paris Panthéon-Assas · 2025</div>
              <span className="about-card__tag">Option Stratégie</span>
              <div className="about-card__divider" />
              <a href="mailto:mael.pinault@gmail.com" className="about-card__contact">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                mael.pinault@gmail.com
              </a>
              <a href="https://www.linkedin.com/in/mael-pinault" target="_blank" rel="noopener noreferrer" className="about-card__contact">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                linkedin.com/in/mael-pinault
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* MULTI-RÉPONDANTS */}
      <section className="section" id="multi">
        <div className="container">
          <motion.div className="section-header" variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="section-label">Mode collectif</span>
            <h2>Plusieurs répondants, un seul diagnostic</h2>
            <p>Collectez les perceptions de plusieurs parties prenantes d'une même organisation et comparez-les en temps réel. Idéal pour les phases de diagnostic en mission de conseil.</p>
          </motion.div>
          <motion.div
            className="multi-grid"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {[
              { icon: '🔗', title: 'Session partagée', desc: 'Générez un lien unique à envoyer à vos répondants. Chacun remplit de façon autonome. Résultats agrégés en temps réel.' },
              { icon: '🤝', title: 'Remplissage collectif', desc: 'Animez un atelier : le groupe discute et valide chaque réponse ensemble. Un seul diagnostic, construit en équipe.' },
              { icon: '📊', title: 'Comparaison multi-profils', desc: 'Taggez chaque répondant par rôle (dirigeant, manager, équipe). Visualisez les écarts de perception par niveau hiérarchique.' },
            ].map(m => (
              <motion.div key={m.title} className="multi-card" variants={fadeUp}>
                <div className="multi-card__icon">{m.icon}</div>
                <h3 className="multi-card__title">{m.title}</h3>
                <p className="multi-card__desc">{m.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div style={{ textAlign: 'center', marginTop: '2.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <Link to="/creer-session" className="btn btn-primary btn-lg">
              Créer une session multi-répondants
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link to="/mes-sessions" className="btn btn-outline btn-lg">
              Mes sessions
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="section-label" style={{ color: 'var(--gold)' }}>Prêt à commencer ?</span>
            <h2>Lancez votre diagnostic organisationnel</h2>
            <p>Gratuit, sans inscription requise. Vos réponses sont sauvegardées automatiquement.</p>
            <Link to="/questionnaire" className="btn btn-primary btn-lg">
              Démarrer maintenant
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div className="footer__brand">
              <Link to="/" className="nav__logo">
                <div className="nav__logo-mark"><LogoMark animate={false} /></div>
                <span className="nav__logo-name" style={{ color: 'rgba(255,255,255,0.7)' }}>Diagnostic 7S</span>
              </Link>
              <p>Outil de diagnostic organisationnel basé sur le modèle McKinsey 7S. Conçu pour dirigeants et consultants.</p>
            </div>
            <div className="footer__links">
              <h5>Navigation</h5>
              <ul>
                <li><a href="#methode">La méthode</a></li>
                <li><a href="#dimensions">Les 7 dimensions</a></li>
                <li><a href="#mission">Workflow de mission</a></li>
                <li><Link to="/questionnaire">Démarrer</Link></li>
                <li><Link to="/creer-session">Créer une session</Link></li>
                <li><Link to="/mes-sessions">Mes sessions</Link></li>
              </ul>
            </div>
            <div className="footer__links">
              <h5>Contact</h5>
              <ul>
                <li><a href="mailto:mael.pinault@gmail.com">mael.pinault@gmail.com</a></li>
                <li><a href="https://www.linkedin.com/in/mael-pinault" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
                <li><a href="#apropos">À propos du projet</a></li>
              </ul>
            </div>
          </div>
          <div className="footer__bottom">
            <span className="footer__copy">© 2026 Maël Pinault — Projet portfolio</span>
            <div className="footer__badge">
              <span />
              Basé sur le modèle McKinsey 7S
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
