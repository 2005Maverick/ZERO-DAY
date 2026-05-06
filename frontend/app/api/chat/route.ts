import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

let currentKeyIndex = 0

interface IncomingMessage { role: 'user' | 'assistant' | 'system'; content: string }
interface ChatRequest { messages: IncomingMessage[]; availableImages?: string[] }

const SYSTEM_PROMPT_BASE = `You are ORUS, the in-app trading assistant for "Zero Day Market" (ZDM) — an Indian-market trading simulator.

THE PRODUCT (so you can answer "where is X?" questions):
- Splash page (/) — entry point
- Academy (/academy) — 10 curated YouTube playlists with a mini-game per playlist
- Ledger (/ledger?case=N) — 67 cases across 6 volumes (lectures, drills/mini-games, simulations, analyses, profiles, achievements)
- Live Sim (/sim/COV-20/live) — March 9, 2020 COV-20 trading simulation (₹1,00,000, 6 stocks, 375 minutes)
- Debrief (/sim/COV-20/debrief) — behavioral analysis with archetype, mistake detection, AI narrative

THE PEDAGOGY:
- Pre-game tutorial walks 18 slides covering scenario, basics, mini-games, and interface
- In-session, 3 retrieval-style coaching prompts pause the simulation
- Debrief detects mistakes (NO_STOP_LOSS, OVERSIZED_POSITION, REVENGE_TRADE, PANIC_SELL, NEWS_REFLEX, NO_THESIS, DISPOSITION_EFFECT, OVERTRADING, IGNORED_NEWS, HELD_THROUGH_CLOSE) and recommends remedial Academy playlists.

TONE:
- Senior trading desk veteran, warm but direct. Indian-English idioms welcome where natural.
- Concise. 2–4 short paragraphs max. Bullet points OK when listing things.
- No corporate hedging. No "as an AI" preamble. No emoji.

IMAGES — important:
You can include illustrations using the token [img:SLUG]. The frontend renders the matching SVG diagram inline. Use them when helpful (chart patterns, candle types, concept diagrams). Don't pad responses — one or two when relevant. ONLY use these exact slugs:
{{IMAGE_LIST}}

Examples:
- "A hammer is a small body at the top with a long lower wick, after a downtrend.\\n\\n[img:hammer]\\n\\nIt signals buyers stepped in aggressively and rejected lower prices."
- "Risk vs reward is the math of trading survival.\\n\\n[img:risk-reward]\\n\\nFor every ₹1 you risk, target at least ₹3 of profit."

Output plain text only. No JSON, no markdown headers, no code blocks.`

export async function POST(req: NextRequest) {
  try {
    const GROQ_KEYS = [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
      process.env.GROQ_API_KEY_4,
    ].filter(Boolean) as string[]

    if (GROQ_KEYS.length === 0) {
      console.error('[API/Chat] No GROQ_API_KEY_* set in environment.')
      return NextResponse.json({
        reply: "I'm not configured yet — the GROQ_API_KEY environment variables are missing on the server.",
      }, { status: 200 })
    }

    let body: ChatRequest
    try { body = await req.json() }
    catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

    if (!Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: 'Empty messages' }, { status: 400 })
    }

    const imageList = (body.availableImages ?? []).join(', ') || '(none provided)'
    const systemPrompt = SYSTEM_PROMPT_BASE.replace('{{IMAGE_LIST}}', imageList)

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...body.messages.slice(-12).map(m => ({ role: m.role, content: m.content })),
    ]

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
            model: 'llama-3.1-8b-instant',
            messages: formattedMessages,
            stream: false,
            temperature: 0.55,
            max_tokens: 700,
          }),
        })

        if (res.status === 429) {
          console.warn(`[API/Chat] 429 on key ${currentKeyIndex}, rotating`)
          currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length
          attempts++
          continue
        }

        if (!res.ok) {
          const errText = await res.text()
          lastError = `${res.status}: ${errText.slice(0, 200)}`
          console.error(`[API/Chat] Groq error: ${lastError}`)
          currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length
          attempts++
          continue
        }

        const data = await res.json()
        let reply = (data?.choices?.[0]?.message?.content ?? '').toString().trim()
        reply = reply.replace(/^(ASSISTANT|ORUS|HELP)\s*:\s*/i, '').trim()

        if (!reply) {
          return NextResponse.json({
            reply: "Hmm, I couldn't generate a response for that — try rephrasing?",
          })
        }

        return NextResponse.json({ reply })
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
        console.error(`[API/Chat] Network error on key ${currentKeyIndex}:`, lastError)
        currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length
        attempts++
      }
    }

    return NextResponse.json({
      reply: `Couldn't reach the assistant. ${lastError}`,
    }, { status: 200 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown'
    console.error('[API/Chat] Outer error:', msg)
    return NextResponse.json({
      reply: `Server error: ${msg}`,
    }, { status: 200 })
  }
}
