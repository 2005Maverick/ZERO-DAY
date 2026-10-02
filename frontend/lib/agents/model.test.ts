import { describe, it, expect } from 'vitest'
import { createGroqCaller, scriptedModel, ModelCallError, type ModelRequest } from './model'

// ─── Fake fetch ─────────────────────────────────────────────

type Reply = { status: number; body: unknown }

function fakeFetch(replies: Reply[]) {
  const calls: { auth: string; body: Record<string, unknown> }[] = []
  let i = 0
  const impl = (async (_url: string, init: RequestInit) => {
    calls.push({
      auth: (init.headers as Record<string, string>).Authorization,
      body: JSON.parse(init.body as string),
    })
    const r = replies[i++]
    return new Response(typeof r.body === 'string' ? r.body : JSON.stringify(r.body), { status: r.status })
  }) as unknown as typeof fetch
  return { impl, calls }
}

const ok = (message: unknown, usage = { prompt_tokens: 50, completion_tokens: 10 }) =>
  ({ status: 200, body: { choices: [{ message, finish_reason: 'stop' }], usage } })

const req = (over: Partial<ModelRequest> = {}): ModelRequest => ({
  model: 'llama-3.1-8b-instant',
  messages: [{ role: 'user', content: 'hi' }],
  maxTokens: 100,
  signal: new AbortController().signal,
  ...over,
})

// ─── createGroqCaller ───────────────────────────────────────

describe('createGroqCaller', () => {
  it('parses a tool-call response into the message and an audit step', async () => {
    const { impl } = fakeFetch([ok({
      content: null,
      tool_calls: [{ id: 'c1', type: 'function', function: { name: 'get_rsi', arguments: '{"symbol":"TCS"}' } }],
    })])
    const res = await createGroqCaller({ keys: ['k1'], fetchImpl: impl })(req())
    expect(res.message.tool_calls?.[0].function.name).toBe('get_rsi')
    expect(res.step).toMatchObject({
      type: 'model',
      toolCalls: [{ id: 'c1', name: 'get_rsi', arguments: '{"symbol":"TCS"}' }],
      promptTokens: 50,
      completionTokens: 10,
    })
    expect(res.step.text).toBeUndefined()
  })

  it('sends max_completion_tokens, and tools/tool_choice only when tools are given', async () => {
    const { impl, calls } = fakeFetch([ok({ content: 'a' }), ok({ content: 'b' })])
    const call = createGroqCaller({ keys: ['k1'], fetchImpl: impl })
    await call(req())
    await call(req({ tools: [{ type: 'function', function: { name: 't', description: 'd', parameters: {} } }], toolChoice: 'required' }))
    expect(calls[0].body).toMatchObject({ max_completion_tokens: 100 })
    expect(calls[0].body.tools).toBeUndefined()
    expect(calls[0].body.max_tokens).toBeUndefined()
    expect(calls[1].body).toMatchObject({ tool_choice: 'required' })
    expect(calls[1].body.parallel_tool_calls).toBeUndefined()
  })

  it('passes a named tool_choice through unchanged', async () => {
    const { impl, calls } = fakeFetch([ok({ content: null })])
    const forced = { type: 'function' as const, function: { name: 'submit_findings' } }
    await createGroqCaller({ keys: ['k1'], fetchImpl: impl })(
      req({ tools: [{ type: 'function', function: { name: 'submit_findings', description: 'd', parameters: {} } }], toolChoice: forced }),
    )
    expect(calls[0].body.tool_choice).toEqual(forced)
  })

  it('sends response_format only when given', async () => {
    const { impl, calls } = fakeFetch([ok({ content: '{}' }), ok({ content: 'x' })])
    const call = createGroqCaller({ keys: ['k1'], fetchImpl: impl })
    const rf = { type: 'json_schema' as const, json_schema: { name: 'coach_output', strict: true, schema: { type: 'object' } } }
    await call(req({ responseFormat: rf }))
    await call(req())
    expect(calls[0].body.response_format).toEqual(rf)
    expect(calls[1].body.response_format).toBeUndefined()
  })

  it('rotates to the next key on 429 and succeeds', async () => {
    const { impl, calls } = fakeFetch([{ status: 429, body: 'slow down' }, ok({ content: 'hello' })])
    const res = await createGroqCaller({ keys: ['k1', 'k2'], fetchImpl: impl })(req())
    expect(calls.map(c => c.auth)).toEqual(['Bearer k1', 'Bearer k2'])
    expect(res.step.text).toBe('hello')
  })

  it('throws rate_limited when every key returns 429', async () => {
    const { impl } = fakeFetch([{ status: 429, body: '' }, { status: 429, body: '' }])
    await expect(createGroqCaller({ keys: ['k1', 'k2'], fetchImpl: impl })(req()))
      .rejects.toMatchObject({ kind: 'rate_limited' })
  })

  it('classifies a 400 tool_use_failed separately from other HTTP errors', async () => {
    const { impl } = fakeFetch([
      { status: 400, body: { error: { code: 'tool_use_failed', message: 'Failed to call a function' } } },
      { status: 500, body: 'boom' },
    ])
    const call = createGroqCaller({ keys: ['k1'], fetchImpl: impl })
    await expect(call(req())).rejects.toMatchObject({ kind: 'tool_use_failed', status: 400 })
    await expect(call(req())).rejects.toMatchObject({ kind: 'http', status: 500 })
  })

  it('reports aborted when the caller signal fired', async () => {
    const ac = new AbortController()
    ac.abort()
    const impl = (async (_u: string, init: RequestInit) => {
      if (init.signal?.aborted) throw new DOMException('aborted', 'AbortError')
      throw new Error('unreachable')
    }) as unknown as typeof fetch
    await expect(createGroqCaller({ keys: ['k1'], fetchImpl: impl })(req({ signal: ac.signal })))
      .rejects.toMatchObject({ kind: 'aborted' })
  })

  it('throws bad_response on a 2xx without choices', async () => {
    const { impl } = fakeFetch([{ status: 200, body: { nope: true } }])
    await expect(createGroqCaller({ keys: ['k1'], fetchImpl: impl })(req()))
      .rejects.toMatchObject({ kind: 'bad_response' })
  })
})

// ─── scriptedModel (the test double for 1.3) ────────────────

describe('scriptedModel', () => {
  it('replays turns in order, records requests, and passes raw-string args through', async () => {
    const model = scriptedModel([
      { toolCalls: [{ name: 'get_rsi', args: { symbol: 'TCS' } }] },
      { toolCalls: [{ name: 'get_rsi', args: '{broken' }] },
      { error: new ModelCallError('http', 'boom', 500) },
    ])
    const r1 = await model(req())
    expect(r1.step.toolCalls[0].arguments).toBe('{"symbol":"TCS"}')
    expect(r1.finishReason).toBe('tool_calls')
    const r2 = await model(req())
    expect(r2.step.toolCalls[0].arguments).toBe('{broken')
    await expect(model(req())).rejects.toMatchObject({ kind: 'http' })
    await expect(model(req())).rejects.toThrow(/no turn 4 scripted/)
    expect(model.requests).toHaveLength(4)
  })
})
