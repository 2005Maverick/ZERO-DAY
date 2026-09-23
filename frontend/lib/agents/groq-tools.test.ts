import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { toGroqTool, submitTool } from './groq-tools'

describe('toGroqTool', () => {
  const tool = {
    name: 'get_window',
    description: 'OHLCV window',
    input: z.object({
      symbol: z.string().describe('NSE ticker'),
      from: z.number().int().min(0),
      bars: z.number().int().default(12),
    }),
    output: z.object({}),
    run: async () => ({}),
  }
  const params = toGroqTool(tool).function.parameters as {
    $schema?: string; required: string[]; properties: Record<string, Record<string, unknown>>
  }

  it('produces an OpenAI-style function tool', () => {
    expect(toGroqTool(tool)).toMatchObject({ type: 'function', function: { name: 'get_window', description: 'OHLCV window' } })
  })

  it('strips $schema and the safe-integer noise bounds', () => {
    expect(params.$schema).toBeUndefined()
    expect(params.properties.from).toEqual({ type: 'integer', minimum: 0 })
  })

  it('keeps descriptions (the model reads them)', () => {
    expect(params.properties.symbol.description).toBe('NSE ticker')
  })

  it('uses the input view: fields with defaults are optional for the model', () => {
    expect(params.required).toEqual(['symbol', 'from'])
  })
})

describe('submitTool', () => {
  it('uses the reserved name and the output schema as parameters', () => {
    const t = submitTool(z.object({ summary: z.string() }), 'Submit your findings')
    expect(t.function.name).toBe('submit_findings')
    expect((t.function.parameters as { required: string[] }).required).toEqual(['summary'])
  })
})
