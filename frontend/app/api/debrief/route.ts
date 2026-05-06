import { NextRequest, NextResponse } from 'next/server'
import type { DebriefRequest, DebriefResponse, MistakeId, Mistake } from '@/lib/behavior/types'

export const maxDuration = 30

let currentKeyIndex = 0

const VALID_MISTAKE_IDS: ReadonlySet<MistakeId> = new Set<MistakeId>([
  'NO_STOP_LOSS', 'OVERSIZED_POSITION', 'REVENGE_TRADE', 'PANIC_SELL',
  'FOMO_BUY', 'NEWS_REFLEX', 'NO_THESIS', 'CIRCUIT_BREAKER_ATTEMPT',
  'DISPOSITION_EFFECT', 'OVERTRADING', 'IGNORED_NEWS', 'HELD_THROUGH_CLOSE',
])

const SYSTEM_PROMPT = `You are Chronos, a senior Indian-market trading mentor with 15 years of desk experience. You're reviewing a beginner's simulated session on COV-20 (March 9, 2020 — Black Monday).

You will receive a structured behavior report. Your job is a deeply detailed, professorial breakdown — like watching a tape replay with a senior trader narrating.

OUTPUT STRICT JSON. No prose outside the JSON object.

SCHEMA:
{
  "narrative": "<4-5 paragraphs, ~400-500 words. Walk through the session chronologically. Frame the market context (NIFTY direction, news drops, circuit breakers). Quote specific timestamps, prices, theses. For EACH meaningful trade, describe: (a) what was happening in the broader market when they entered, (b) what their action was, (c) what the market did after, (d) whether they responded correctly. Use vivid but factual language. No moralizing.>",

  "tradeBreakdown": [
    {
      "tradeRef": "Trade 1",
      "summary": "<2-3 sentences. Quote the exact entry: time, symbol, qty, price, thesis if any. State what NIFTY/BRENT was doing at that moment. State the outcome — did the position go up or down, by how much, was there a stop loss, did it trigger.>",
      "counterfactual": "<2-3 sentences. The OPTIMAL path. Be specific with numbers: 'A stop loss at ₹X (-Y%) would have capped the loss at ₹Z.' OR 'Entering 5 minutes later at ₹X after the dust settled would have given you a better entry by ₹Y.' OR 'Sizing at 5% of wallet (50 shares not 100) would have made this risk acceptable for a high-conviction trade.' Cite numbers.>",
      "estimatedAvoidableLoss": <number — estimated rupees saved if optimal path taken; positive number; null if not applicable>
    }
    // one entry per significant trade in the session
  ],

  "criticalMoments": [
    {
      "timestamp": "<HH:MM IST>",
      "description": "<what was happening in the market at this moment>",
      "youDid": "<the user\\'s action — could be inaction>",
      "shouldHaveDone": "<the optimal action with numbers>"
    }
    // 2-4 entries highlighting the most pivotal decision points
  ],

  "marketTiming": "<2-3 sentences analyzing WHEN they traded vs market regime. Did they trade during the panic open? During halts? After news drops without checking it? Late in the session when liquidity dried up? Be specific about timing patterns.>",

  "wins": [
    { "headline": "<5-8 word headline>", "detail": "<1 sentence citing event evidence>" }
    // 1-2 entries — if they had ZERO wins, output the array empty []
  ],

  "mistakes": [
    {
      "mistakeId": "<MUST match an id in detected_mistakes — never invent>",
      "headline": "<5-8 word headline naming the pattern>",
      "explanation": "<2-3 sentences. Name the behavioral pattern, cite EVIDENCE, state why it costs traders money statistically>",
      "counterfactual": "<2 sentences. The specific corrective action. e.g., 'Set the SL FIRST before entering — the share count then falls out from (max-loss-rupees ÷ stop-distance).' Be prescriptive.>",
      "evidences": [<every evidence string from detected_mistakes for THIS mistakeId — pull from the input>]
    }
    // one entry per UNIQUE mistakeId — group all NO_STOP_LOSS evidences together, etc.
  ],

  "tomorrow": "<1-2 sentence tactical rule for next session — e.g., 'Set the SL in the order ticket BEFORE writing the thesis. If you can\\'t name a stop level, you don\\'t have a trade.'>"
}

CONSTRAINTS:
- Always quote actual numbers from the input (prices, times, percentages, qty).
- For tradeBreakdown: one entry per trade in the trades[] array provided.
- Group mistakes by mistakeId — do NOT create multiple entries with the same id.
- counterfactual is the most important field — that's where the teaching happens. Be SPECIFIC and NUMERICAL.
- Tone: senior but warm. No condescension. No hedging. Indian-English idioms welcome where natural ("bhai" optional).
- If trader took zero trades, focus narrative on hesitation; tradeBreakdown can be [].
- Do NOT invent events not in key_events.
- Output ONLY the JSON object. No code fences, no preamble.`

export async function POST(req: NextRequest) {
  const GROQ_KEYS = [
    process.env.GROQ_API_KEY_1,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
    process.env.GROQ_API_KEY_4,
  ].filter(Boolean) as string[]

  if (GROQ_KEYS.length === 0) {
    return NextResponse.json(emptyFallback('GROQ_API_KEY env vars are not configured.'), { status: 200 })
  }

  let body: DebriefRequest
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body?.profile || !Array.isArray(body.mistakes) || !body.archetype) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Build a richer payload — full trade list + grouped mistakes + key event timeline
  const trimmedEvents = (body.keyEvents ?? []).slice(0, 30)
  const groupedMistakes = groupMistakes(body.mistakes)

  const compactPayload = {
    archetype: body.archetype,
    profile: {
      tradeCount: body.profile.tradeCount,
      buyCount: body.profile.buyCount,
      sellCount: body.profile.sellCount,
      slUsageRate: round(body.profile.slUsageRate, 2),
      thesisRate: round(body.profile.thesisRate, 2),
      avgPositionSizePct: round(body.profile.avgPositionSizePct, 3),
      maxPositionSizePct: round(body.profile.maxPositionSizePct, 3),
      newsViewedRate: round(body.profile.newsViewedRate, 2),
      pauseMinutes: round(body.profile.pauseMinutes, 1),
      timeBeforeFirstTradeSec: Math.round(body.profile.timeBeforeFirstTradeMs / 1000),
      realizedPnL: Math.round(body.profile.realizedPnL),
      dayPnL: Math.round(body.profile.dayPnL),
      dayPnLPct: round(body.profile.dayPnLPct, 2),
      winCount: body.profile.winCount,
      lossCount: body.profile.lossCount,
      winRate: round(body.profile.winRate, 2),
      dispositionRatio: round(body.profile.dispositionRatio, 2),
    },
    trades: body.profile.trades.map((t, i) => ({
      ref: `Trade ${i + 1}`,
      side: t.side,
      symbol: t.symbol,
      qty: t.qty,
      price: t.price,
      sizingPct: round(t.sizingPct, 3),
      hasThesis: t.hasThesis,
      thesisLength: t.thesisLength,
      filledAtMin: t.filledAtMin,
      timeStr: minToIST(t.filledAtMin),
      orderType: t.orderType,
      realizedPnL: Math.round(t.realizedPnL),
    })),
    detected_mistakes_grouped: groupedMistakes,
    key_events: trimmedEvents.map(e => ({
      simMinute: e.simMinute,
      timeStr: minToIST(e.simMinute),
      kind: e.kind,
      data: e.data,
    })),
  }

  const userPrompt = `Behavior report for this session:\n\n${JSON.stringify(compactPayload, null, 2)}\n\nReturn ONLY the JSON object matching the schema.`

  let attempts = 0
  let lastError = 'unknown'
  while (attempts < GROQ_KEYS.length) {
    const apiKey = GROQ_KEYS[currentKeyIndex]
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.4,
          max_tokens: 3000,
        }),
      })

      if (res.status === 429) {
        currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length
        attempts++
        continue
      }
      if (!res.ok) {
        lastError = `${res.status}: ${(await res.text()).slice(0, 200)}`
        currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length
        attempts++
        continue
      }

      const data = await res.json()
      const raw = data?.choices?.[0]?.message?.content ?? ''
      const json = parseJsonRobust(raw)
      if (!json) {
        return NextResponse.json(richFallback(body), { status: 200 })
      }

      const validated = validateResponse(json, body.mistakes)
      return NextResponse.json(validated)
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
      currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length
      attempts++
    }
  }

  console.error('[debrief] all keys failed:', lastError)
  return NextResponse.json(richFallback(body), { status: 200 })
}

// ── helpers ──────────────────────────────────────────────────

function round(n: number, d: number): number {
  const p = Math.pow(10, d)
  return Math.round(n * p) / p
}

function minToIST(min: number): string {
  const total = 9 * 60 + 15 + Math.floor(min)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')} IST`
}

function groupMistakes(mistakes: Mistake[]): Array<{ id: string; severity: string; evidences: string[] }> {
  const map = new Map<string, { id: string; severity: string; evidences: string[] }>()
  for (const m of mistakes) {
    const ex = map.get(m.id)
    if (ex) ex.evidences.push(m.evidence)
    else map.set(m.id, { id: m.id, severity: m.severity, evidences: [m.evidence] })
  }
  return Array.from(map.values())
}

function parseJsonRobust(text: string): Record<string, unknown> | null {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()
  try { return JSON.parse(cleaned) } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/)
  if (match) {
    try { return JSON.parse(match[0]) } catch {}
  }
  return null
}

function validateResponse(json: Record<string, unknown>, detectedMistakes: Mistake[]): DebriefResponse {
  const validIds = new Set(detectedMistakes.map(m => m.id))
  const evidencesById = new Map<string, string[]>()
  for (const m of detectedMistakes) {
    const ex = evidencesById.get(m.id) ?? []
    ex.push(m.evidence)
    evidencesById.set(m.id, ex)
  }

  return {
    narrative: typeof json.narrative === 'string' ? json.narrative : '',
    tradeBreakdown: Array.isArray(json.tradeBreakdown)
      ? json.tradeBreakdown.slice(0, 12).map((t: Record<string, unknown>) => ({
          tradeRef: String(t.tradeRef ?? ''),
          summary: String(t.summary ?? ''),
          counterfactual: String(t.counterfactual ?? ''),
          estimatedAvoidableLoss: typeof t.estimatedAvoidableLoss === 'number' ? t.estimatedAvoidableLoss : undefined,
        }))
      : [],
    criticalMoments: Array.isArray(json.criticalMoments)
      ? json.criticalMoments.slice(0, 6).map((m: Record<string, unknown>) => ({
          timestamp: String(m.timestamp ?? ''),
          description: String(m.description ?? ''),
          youDid: String(m.youDid ?? ''),
          shouldHaveDone: String(m.shouldHaveDone ?? ''),
        }))
      : [],
    marketTiming: typeof json.marketTiming === 'string' ? json.marketTiming : '',
    wins: Array.isArray(json.wins)
      ? json.wins.slice(0, 3).map((w: Record<string, unknown>) => ({
          headline: String(w.headline ?? ''),
          detail: String(w.detail ?? ''),
        }))
      : [],
    mistakes: Array.isArray(json.mistakes)
      ? json.mistakes
          .filter((m: Record<string, unknown>) => typeof m.mistakeId === 'string' && validIds.has(m.mistakeId as MistakeId))
          .slice(0, 6)
          .map((m: Record<string, unknown>) => ({
            mistakeId: m.mistakeId as MistakeId,
            headline: String(m.headline ?? ''),
            explanation: String(m.explanation ?? ''),
            counterfactual: String(m.counterfactual ?? ''),
            evidences: Array.isArray(m.evidences) && m.evidences.length > 0
              ? m.evidences.map(String)
              : (evidencesById.get(m.mistakeId as MistakeId) ?? []),
          }))
      : [],
    tomorrow: typeof json.tomorrow === 'string' ? json.tomorrow : '',
  }
}

function emptyFallback(reason: string): DebriefResponse {
  return {
    narrative: `Unable to generate the LLM-powered debrief. ${reason}`,
    tradeBreakdown: [], criticalMoments: [], marketTiming: '',
    wins: [], mistakes: [], tomorrow: '',
  }
}

function richFallback(body: DebriefRequest): DebriefResponse {
  const p = body.profile
  const groupedMistakes = groupMistakes(body.mistakes)
  return {
    narrative: `You closed the session with ${p.dayPnL >= 0 ? '+' : ''}₹${Math.round(p.dayPnL)} on a day NIFTY fell sharply. You placed ${p.tradeCount} trade${p.tradeCount === 1 ? '' : 's'} (${p.buyCount} buys, ${p.sellCount} sells), with a ${Math.round(p.winRate * 100)}% win rate. Average position size was ${(p.avgPositionSizePct * 100).toFixed(0)}% of wallet. Stop loss usage: ${Math.round(p.slUsageRate * 100)}%. (LLM unavailable — showing rules-based summary only.)`,
    tradeBreakdown: p.trades.map((t, i) => ({
      tradeRef: `Trade ${i + 1}`,
      summary: `${t.side} ${t.qty} ${t.symbol} @ ₹${t.price} at ${minToIST(t.filledAtMin)}. Sizing ${(t.sizingPct * 100).toFixed(0)}% of wallet.`,
      counterfactual: 'Set a stop loss before entry; size off the stop distance.',
    })),
    criticalMoments: [],
    marketTiming: '',
    wins: p.slUsageRate >= 0.7
      ? [{ headline: 'Stop losses used consistently', detail: `${Math.round(p.slUsageRate * 100)}% of buys had a stop within 60 seconds.` }]
      : [],
    mistakes: groupedMistakes.map(g => ({
      mistakeId: g.id as MistakeId,
      headline: g.id.replace(/_/g, ' ').toLowerCase(),
      explanation: g.evidences[0] ?? '',
      counterfactual: 'Apply the relevant rule from the Academy playlists.',
      evidences: g.evidences,
    })),
    tomorrow: 'Set a stop loss before clicking Place Order. Define rupee risk first, then derive share count.',
  }
}
