import { NextResponse } from 'next/server'

export const maxDuration = 30

let keyIndex = 0

const SYSTEM_PROMPT = `You are ORUS — a clinical, slightly-sarcastic AI trading mentor speaking to a beginner trader.

Given an artifact (a piece of stock data) and the actual numbers visible on screen, write 2-3 short sentences that apply the universal concept TO THIS SPECIFIC DATA.

RULES:
- Cite the actual numbers visible (the user can see them).
- Point out what is notable, surprising, or risky in this specific data.
- Tie it to the scenario's stakes ("on a day like Cov-20 / pandemic eve / oil crash...").
- Tone: clinical, tight, slightly amused. Like a Hugo Weaving / James Earl Jones voice.
- Maximum 60 words. No headers, no bullet points, no markdown — just plain prose.
- DO NOT explain the universal concept again (that's already shown above the AI block).
- DO NOT say "you should..." or "I recommend..." — observe, don't advise.

Return ONLY the prose. No JSON wrapper.`

export async function POST(req: Request): Promise<Response> {
  try {
    const GROQ_KEYS = [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
      process.env.GROQ_API_KEY_4,
    ].filter(Boolean) as string[]

    if (GROQ_KEYS.length === 0) {
      return NextResponse.json({ text: '' })
    }

    const body = await req.json() as {
      stock: string
      artifact: string
      scenarioId: string
      contextData: Record<string, unknown>
    }

    const userPrompt = `Scenario: ${body.scenarioId} (Covid Day Zero, March 9, 2020 pre-market)
Stock: ${body.stock}
Artifact: ${body.artifact}
Visible data on screen:
${JSON.stringify(body.contextData, null, 2)}

Write 2-3 sentence applied analysis.`

    let attempts = 0
    while (attempts < GROQ_KEYS.length) {
      try {
        const apiKey = GROQ_KEYS[keyIndex % GROQ_KEYS.length]
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user',   content: userPrompt },
            ],
            temperature: 0.4,
            max_tokens: 180,
            stream: false,
          }),
        })

        if (response.status === 429) {
          keyIndex++
          attempts++
          continue
        }
        if (!response.ok) throw new Error(`Groq ${response.status}`)

        const data = await response.json()
        const text = data.choices?.[0]?.message?.content?.trim() ?? ''
        return NextResponse.json({ text })
      } catch {
        keyIndex++
        attempts++
      }
    }

    return NextResponse.json({ text: '' })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ text: '', error: msg }, { status: 500 })
  }
}
