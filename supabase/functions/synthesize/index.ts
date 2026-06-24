import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DIM_LABELS: Record<string, string> = {
  strategie:   'Stratégie',
  structure:   'Structure',
  systemes:    'Systèmes',
  style:       'Style managérial',
  staff:       'Personnel',
  competences: 'Compétences',
  valeurs:     'Valeurs partagées',
}

const CADRAGE_LABELS: Record<string, Record<string, string>> = {
  structure_type: {
    fonctionnelle: 'structure fonctionnelle', divisionnelle: 'structure divisionnelle',
    matricielle: 'structure matricielle', projets: 'organisation par projets',
    reseau: 'organisation en réseau', hybride: 'structure hybride',
  },
  formalization: {
    tres_formalisee: 'très formalisée', formalisee: 'formalisée',
    peu_formalisee: 'peu formalisée', informelle: 'informelle',
  },
  coordination: {
    supervision: 'coordination par supervision directe',
    std_processus: 'coordination par standardisation des processus',
    std_resultats: 'coordination par standardisation des résultats',
    std_competences: 'coordination par standardisation des savoirs',
    ajustement: 'coordination par ajustement mutuel',
  },
  hierarchy_distance: {
    forte: 'forte distance hiérarchique', moderee: 'distance hiérarchique modérée',
    faible: 'faible distance hiérarchique',
  },
  uncertainty: {
    forte: "forte aversion à l'incertitude", moderee: "rapport à l'incertitude modéré",
    faible: "confort avec l'incertitude",
  },
  orientation: {
    individuelle: 'orientation individuelle', collective: 'orientation collective',
  },
  decision_model: {
    rationnel: 'prise de décision rationnelle/planifiée',
    organisationnel: 'prise de décision organisationnelle',
    politique: 'prise de décision politique/négociée',
    emergent: 'prise de décision émergente',
  },
  leadership_style: {
    analytique: 'leadership analytique', humaniste: 'leadership humaniste',
    visionnaire: 'leadership visionnaire', operationnel: 'leadership opérationnel',
    communicationnel: 'leadership communicationnel',
  },
}

const DIM_IDS = ['strategie', 'structure', 'systemes', 'style', 'staff', 'competences', 'valeurs']

function computeAvg(diagnostics: Record<string, unknown>[]): Record<string, number> {
  const avg: Record<string, number> = {}
  DIM_IDS.forEach(id => {
    const vals = diagnostics
      .map(d => (d.scores as Record<string, number>)?.[id])
      .filter(v => v != null) as number[]
    avg[id] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
  })
  return avg
}

function buildPrompt(
  session: Record<string, unknown>,
  diagnostics: Record<string, unknown>[],
  parentDiagnostics?: Record<string, unknown>[]
): string {
  const avg = computeAvg(diagnostics)
  const global = Math.round(DIM_IDS.map(id => avg[id]).reduce((a, b) => a + b, 0) / DIM_IDS.length)

  const isSuivi = parentDiagnostics && parentDiagnostics.length > 0
  const parentAvg = isSuivi ? computeAvg(parentDiagnostics!) : null
  const parentGlobal = parentAvg
    ? Math.round(DIM_IDS.map(id => parentAvg[id]).reduce((a, b) => a + b, 0) / DIM_IDS.length)
    : null

  let roleSection = ''
  if (session.mode === 'comparison') {
    const roles = ['dirigeant', 'manager', 'equipe']
    const roleLabels: Record<string, string> = { dirigeant: 'Dirigeants', manager: 'Managers', equipe: 'Équipes' }
    const roleAvg: Record<string, Record<string, number>> = {}
    roles.forEach(role => {
      const rd = diagnostics.filter(d => d.respondent_role === role)
      if (!rd.length) return
      roleAvg[role] = {}
      DIM_IDS.forEach(id => {
        const vals = rd.map(d => (d.scores as Record<string, number>)?.[id]).filter(v => v != null) as number[]
        roleAvg[role][id] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
      })
    })
    const filledRoles = Object.keys(roleAvg)
    if (filledRoles.length > 1) {
      roleSection = '\n\nPerceptions par niveau hiérarchique :\n'
      DIM_IDS.forEach(id => {
        const parts = filledRoles.map(r => `${roleLabels[r] ?? r} : ${roleAvg[r][id]}/100`)
        roleSection += `- ${DIM_LABELS[id]} → ${parts.join(' | ')}\n`
      })
    }
  }

  const cadrage = session.cadrage as Record<string, string> | null
  let cadrageSection = ''
  if (cadrage) {
    const items = Object.entries(CADRAGE_LABELS)
      .map(([key, map]) => cadrage[key] ? map[cadrage[key]] : null)
      .filter(Boolean)
    if (items.length) cadrageSection = `\nContexte de cadrage : ${items.join(', ')}.`
  }

  const org = [
    session.org_name,
    session.sector,
    session.company_size ? `${session.company_size} collaborateurs` : null,
    session.governance_type,
  ].filter(Boolean).join(' — ')

  const recoGuidance = `Pour chaque dimension, génère une recommandation adaptée à son score :
- score < 40 : action corrective urgente et concrète
- score 40–59 : plan de développement structuré, levier prioritaire
- score 60–74 : optimisation ciblée, consolidation progressive
- score ≥ 75 : capitalisation sur l'acquis, maintien et diffusion`

  const recoFormat = DIM_IDS.map(id => `    { "id": "${id}", "label": "<4-6 mots>", "text": "<2-3 phrases>" }`).join(',\n')

  if (isSuivi && parentAvg && parentGlobal !== null) {
    const globalDelta = global - parentGlobal
    const evolutionLines = DIM_IDS.map(id => {
      const delta = avg[id] - parentAvg[id]
      const sign = delta > 0 ? '+' : ''
      return `- ${DIM_LABELS[id]} : T1 ${parentAvg[id]} → T2 ${avg[id]} (${sign}${delta})`
    }).join('\n')

    return `Tu es un consultant senior en stratégie et organisation.

Organisation : ${org}.${cadrageSection}

Évolution des scores 7S entre T1 (diagnostic initial) et T2 (suivi) — ${diagnostics.length} répondant${diagnostics.length > 1 ? 's' : ''} :
${evolutionLines}
Score global d'alignement : T1 ${parentGlobal}/100 → T2 ${global}/100 (${globalDelta > 0 ? '+' : ''}${globalDelta})${roleSection}

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant ou après :
{
  "synthesis": "<bilan de suivi 220-250 mots, 4 paragraphes courts : (1) bilan global et dynamique observée (2) progressions significatives delta ≥ +7 et ce qu'elles révèlent (3) dimensions encore fragiles score T2 < 60 ou delta faible (4) prochaines priorités et vigilances. Style : professionnel, direct, troisième personne, pas de formules creuses.>",
  "recommendations": [
${recoFormat}
  ]
}

${recoGuidance}
Style recommendations : professionnel, concret, 2 phrases max par dimension. Prend en compte l'évolution T1→T2 dans le texte quand pertinent.`
  }

  return `Tu es un consultant senior en stratégie et organisation.

Organisation : ${org}.${cadrageSection}

Scores 7S — moyenne sur ${diagnostics.length} répondant${diagnostics.length > 1 ? 's' : ''} :
${DIM_IDS.map(id => `- ${DIM_LABELS[id]} : ${avg[id]}/100`).join('\n')}
Score global d'alignement : ${global}/100${roleSection}

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant ou après :
{
  "synthesis": "<constat de diagnostic 220-250 mots, 4 paragraphes courts : (1) lecture globale, situation et dynamique à l'œuvre (2) points de force dimensions ≥ 70 (3) zones de fragilité dimensions < 60${session.mode === 'comparison' ? ', écarts de perception entre niveaux si significatifs' : ''} (4) orientation recommandée et priorités d'action. Style : professionnel, direct, troisième personne, pas de formules creuses.>",
  "recommendations": [
${recoFormat}
  ]
}

${recoGuidance}
Style recommendations : professionnel, concret, 2 phrases max par dimension.`
}

function buildIndividualPrompt(
  diagnostic: Record<string, unknown>,
  userType: string
): string {
  const scores = diagnostic.scores as Record<string, number>
  const global = Math.round(DIM_IDS.map(id => scores[id] || 0).reduce((a, b) => a + b, 0) / DIM_IDS.length)

  const org = [
    diagnostic.company_name,
    diagnostic.sector,
    diagnostic.company_size ? `${diagnostic.company_size} collaborateurs` : null,
    diagnostic.governance_type,
  ].filter(Boolean).join(' — ')

  const scoresSection = DIM_IDS.map(id => `- ${DIM_LABELS[id]} : ${scores[id] || 0}/100`).join('\n')

  const recoGuidance = `Pour chaque dimension, génère une recommandation adaptée à son score :
- score < 40 : action corrective urgente et concrète
- score 40–59 : plan de développement structuré, levier prioritaire
- score 60–74 : optimisation ciblée, consolidation progressive
- score ≥ 75 : capitalisation sur l'acquis, maintien et diffusion`

  const recoFormat = DIM_IDS.map(id => `    { "id": "${id}", "label": "<4-6 mots>", "text": "<2-3 phrases>" }`).join(',\n')

  if (userType === 'consultant') {
    return `Tu es un consultant senior en stratégie et organisation mandaté pour réaliser un diagnostic externe indépendant.

Organisation analysée : ${org}.

Scores 7S — évaluation externe :
${scoresSection}
Score global d'alignement : ${global}/100

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant ou après :
{
  "synthesis": "<constat de diagnostic externe 220-250 mots, 4 paragraphes courts : (1) lecture globale et dynamique organisationnelle observée (2) points de force dimensions ≥ 70 et ce qu'ils révèlent sur la maturité de l'organisation (3) zones de fragilité dimensions < 60 et risques associés pour la performance (4) orientations d'intervention prioritaires. Style : professionnel, regard externe, troisième personne, pas de formules creuses.>",
  "recommendations": [
${recoFormat}
  ]
}

${recoGuidance}
Style recommendations : professionnel, concret, posture consultant externe, 2 phrases max par dimension.`
  }

  return `Tu es un consultant senior en stratégie et organisation accompagnant un dirigeant dans l'analyse de son auto-diagnostic.

Organisation : ${org}.

Scores 7S — auto-évaluation du dirigeant :
${scoresSection}
Score global d'alignement : ${global}/100

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans texte avant ou après :
{
  "synthesis": "<analyse de l'auto-diagnostic 220-250 mots, 4 paragraphes courts : (1) lecture globale du positionnement organisationnel actuel (2) points de force dimensions ≥ 70 et leviers à valoriser pour le dirigeant (3) zones de fragilité dimensions < 60 et axes de travail prioritaires (4) orientations stratégiques et prochaines décisions recommandées. Style : professionnel, adressé au dirigeant (\"votre organisation\"), pas de formules creuses.>",
  "recommendations": [
${recoFormat}
  ]
}

${recoGuidance}
Style recommendations : professionnel, concret, adressé au dirigeant, 2 phrases max par dimension.`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionCode, diagnosticId, force } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // ── Mode diagnostic individuel ──────────────────────────────────────────
    if (diagnosticId) {
      const { data: diagnostic, error: diagErr } = await supabase
        .from('diagnostics')
        .select('*')
        .eq('id', diagnosticId)
        .single()

      if (diagErr || !diagnostic) throw new Error('Diagnostic introuvable')
      if (!diagnostic.scores) throw new Error('Scores manquants')

      const userType = (diagnostic.user_type as string) || 'dirigeant'
      const prompt = buildIndividualPrompt(diagnostic, userType)

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!claudeRes.ok) {
        const body = await claudeRes.text()
        throw new Error(`Anthropic error ${claudeRes.status}: ${body}`)
      }

      const claudeData = await claudeRes.json()
      const raw: string = claudeData.content?.[0]?.text ?? ''
      if (!raw) throw new Error('Réponse vide de l\'API')

      let synthesis = ''
      let recommendations: unknown[] = []
      try {
        const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/, '').trim()
        const parsed = JSON.parse(cleaned)
        synthesis = parsed.synthesis ?? ''
        recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : []
      } catch {
        synthesis = raw
      }

      if (!synthesis) throw new Error('Synthèse vide dans la réponse')

      return new Response(JSON.stringify({ synthesis, recommendations, cached: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!sessionCode) throw new Error('sessionCode requis')

    const { data: session, error: sessErr } = await supabase
      .from('sessions')
      .select('*')
      .eq('code', sessionCode.toUpperCase())
      .single()

    if (sessErr || !session) throw new Error('Session introuvable')

    if (session.synthesis && !force) {
      return new Response(JSON.stringify({
        synthesis: session.synthesis,
        recommendations: session.recommendations ?? null,
        cached: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: diagnostics } = await supabase
      .from('diagnostics')
      .select('scores, global_score, respondent_role')
      .eq('session_id', session.id)
      .eq('completed', true)

    if (!diagnostics?.length) throw new Error('Aucun diagnostic complété pour cette session')

    let parentDiagnostics: Record<string, unknown>[] | undefined
    if (session.parent_session_id) {
      const { data: pd } = await supabase
        .from('diagnostics')
        .select('scores, global_score, respondent_role')
        .eq('session_id', session.parent_session_id as string)
        .eq('completed', true)
      parentDiagnostics = pd ?? undefined
    }

    const prompt = buildPrompt(session, diagnostics, parentDiagnostics)

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeRes.ok) {
      const body = await claudeRes.text()
      throw new Error(`Anthropic error ${claudeRes.status}: ${body}`)
    }

    const claudeData = await claudeRes.json()
    const raw: string = claudeData.content?.[0]?.text ?? ''
    if (!raw) throw new Error('Réponse vide de l\'API')

    let synthesis = ''
    let recommendations: unknown[] = []
    try {
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/,'').trim()
      const parsed = JSON.parse(cleaned)
      synthesis = parsed.synthesis ?? ''
      recommendations = Array.isArray(parsed.recommendations) ? parsed.recommendations : []
    } catch {
      synthesis = raw
    }

    if (!synthesis) throw new Error('Synthèse vide dans la réponse')

    await supabase.from('sessions')
      .update({ synthesis, recommendations })
      .eq('code', sessionCode.toUpperCase())

    return new Response(JSON.stringify({ synthesis, recommendations, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    // Toujours retourner 200 pour que le client puisse lire data.error
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
