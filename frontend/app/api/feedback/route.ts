import { NextResponse } from 'next/server';

export const maxDuration = 30;

let currentKeyIndex = 0;

export async function POST(req: Request) {
  try {
    const GROQ_KEYS = [
      process.env.GROQ_API_KEY_1,
      process.env.GROQ_API_KEY_2,
      process.env.GROQ_API_KEY_3,
      process.env.GROQ_API_KEY_4,
    ].filter(Boolean) as string[];

    if (GROQ_KEYS.length === 0) {
      console.error('[API/Feedback] Missing Groq API keys in environment.');
      return NextResponse.json({ error: 'System configuration error.' }, { status: 500 });
    }

    const { scenarioContext, correctOutcome, userGuess, confidence } = await req.json();

    const systemPrompt = `You are an expert quantitative trading teacher reviewing a student's trade decision.

Scenario: ${scenarioContext}
Correct Outcome: ${correctOutcome}
Student Guessed: ${userGuess}
Student Confidence: ${confidence}%

Your task is to provide detailed, educational feedback in a STRICT JSON format. Do not use markdown blocks (\`\`\`json) or any conversational preamble. Return ONLY raw, valid JSON.

The required JSON structure:
{
  "assessment": "A single sentence assessing their call (e.g., 'You underestimated the severity of the drop.', 'Perfect reading of the macro situation.')",
  "insight": "A 2-3 sentence paragraph explaining why the correct outcome happened for 'The Insight' section. Keep it focused on the core drivers (e.g., 'Lehman was a 150-year institution...').",
  "whatYouGotRight": ["List item 1 of what they did well or poorly", "List item 2", "List item 3"],
  "quote": "A thoughtful, relevant trading or historical quote along with the author."
}`;

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Provide the feedback.' }
    ];

    let attempts = 0;
    while (attempts < GROQ_KEYS.length) {
      try {
        const apiKey = GROQ_KEYS[currentKeyIndex];
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: formattedMessages,
            stream: true,
            temperature: 0.2, // Lower temp for more reliable JSON
            response_format: { type: "json_object" },
            max_tokens: 1024,
          }),
        });

        if (response.status === 429) {
          console.warn(`[Groq Feedback] Rate limit hit on key index ${currentKeyIndex}. Switching keys...`);
          currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length;
          attempts++;
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Groq API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const stream = new ReadableStream({
          async start(controller) {
            const reader = response.body?.getReader();
            if (!reader) {
              controller.close();
              return;
            }

            const decoder = new TextDecoder();
            
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                  if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                      const data = JSON.parse(line.slice(6));
                      if (data.choices && data.choices[0].delta.content) {
                        controller.enqueue(new TextEncoder().encode(data.choices[0].delta.content));
                      }
                    } catch (e) {}
                  }
                }
              }
            } catch (err) {
              console.error('Stream reading error:', err);
              controller.error(err);
            } finally {
              controller.close();
            }
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'application/octet-stream',
            'Cache-Control': 'no-cache',
          },
        });

      } catch (err: any) {
        currentKeyIndex = (currentKeyIndex + 1) % GROQ_KEYS.length;
        attempts++;
        if (attempts >= GROQ_KEYS.length) {
            return NextResponse.json({ error: 'All Groq keys failed.', details: err.message }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ error: 'All Groq keys rate limited or failed.' }, { status: 500 });
  } catch (error: any) {
    console.error('Feedback Error:', error);
    return NextResponse.json({ error: 'Internal server error processing AI feedback.', details: error.message }, { status: 500 });
  }
}
