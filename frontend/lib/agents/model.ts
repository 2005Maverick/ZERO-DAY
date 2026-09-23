import 'server-only'
import type { GroqTool } from './groq-tools'
import type { ModelStep, RawToolCall } from './types'

// ============================================================================
// Model transport: ONE chat-completion call to Groq. No loop, no retries
// beyond key rotation on 429. The ReAct loop (1.3) sits on top of this.
//
// The loop depends on the `ModelCaller` TYPE, not on Groq, so tests and evals
// can swap in a scripted fake model (see `scriptedModel` below).
// ============================================================================

// ─── Messages (OpenAI / Groq wire format) ───────────────────

export interface WireToolCall {
  id: string
  type: 'function'
  function: { name: string; arguments: string }
}

export type ChatMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string | null; tool_calls?: WireToolCall[] }
  | { role: 'tool'; tool_call_id: string; name: string; content: string }

export type AssistantMessage = Extract<ChatMessage, { role: 'assistant' }>

// ─── Caller contract ────────────────────────────────────────

/**
 * 'required' forces a tool call every turn, so the model can't reply in plain prose.
 * The object form forces one specific tool (used to force `submit_findings` on the last step).
 */
export type ToolChoice = 'auto' | 'required' | 'none' | { type: 'function'; function: { name: string } }

export interface ModelRequest {
  model: string
  messages: ChatMessage[]
  tools?: GroqTool[]
  toolChoice?: ToolChoice
  /** Only sent when set: the gpt-oss models don't support parallel calls, per Groq's docs. */
  parallelToolCalls?: boolean
  /**
   * Structured output (single-shot agents only: Groq can't combine it with tools or streaming).
   * strict: true = constrained decoding; only some models support it.
   */
  responseFormat?: { type: 'json_schema'; json_schema: { name: string; strict: boolean; schema: Record<string, unknown> } }
  maxTokens: number
  temperature?: number
  signal: AbortSignal
}

export interface ModelResponse {
  /** Append this to the conversation as-is: tool results must follow the message that requested them. */
  message: AssistantMessage
  /** The same turn in audit-log form. */
  step: ModelStep
  finishReason: string
}

export type ModelCaller = (req: ModelRequest) => Promise<ModelResponse>

export type ModelErrorKind =
  | 'rate_limited'     // 429 on every key
  | 'tool_use_failed'  // model produced a malformed tool call and Groq rejected it (400)
  | 'http'             // any other non-2xx
  | 'network'          // fetch itself failed
  | 'aborted'          // caller's signal fired
  | 'bad_response'     // 2xx but not the shape we expect

/** The transport throws; the agent runner (1.3) turns these into RunStatus values. */
export class ModelCallError extends Error {
  constructor(public kind: ModelErrorKind, message: string, public status?: number) {
    super(message)
    this.name = 'ModelCallError'
  }
}

// ─── Groq implementation ────────────────────────────────────

interface GroqCallerOptions {
  keys: string[]
  baseUrl?: string
  fetchImpl?: typeof fetch
}

export function createGroqCaller({ keys, baseUrl = 'https://api.groq.com/openai/v1', fetchImpl = fetch }: GroqCallerOptions): ModelCaller {
  if (keys.length === 0) throw new Error('createGroqCaller: no API keys')
  // Per-caller state, not module-global as in V1's routes.
  // TODO(8.4): confirm rotating several free-tier keys is within Groq's terms.
  let keyIndex = 0

  return async function callGroq(req: ModelRequest): Promise<ModelResponse> {
    const body = JSON.stringify({
      model: req.model,
      messages: req.messages,
      ...(req.tools?.length ? { tools: req.tools, tool_choice: req.toolChoice ?? 'auto' } : {}),
      ...(req.tools?.length && req.parallelToolCalls !== undefined ? { parallel_tool_calls: req.parallelToolCalls } : {}),
      ...(req.responseFormat ? { response_format: req.responseFormat } : {}),
      max_completion_tokens: req.maxTokens,
      temperature: req.temperature ?? 0.2,
      stream: false,
    })

    for (let attempt = 0; attempt < keys.length; attempt++) {
      const started = Date.now()
      let res: Response
      try {
        res = await fetchImpl(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${keys[keyIndex]}`, 'Content-Type': 'application/json' },
          body,
          signal: req.signal,
        })
      } catch (err) {
        if (req.signal.aborted) throw new ModelCallError('aborted', 'Model call aborted')
        throw new ModelCallError('network', err instanceof Error ? err.message : String(err))
      }

      if (res.status === 429) {
        keyIndex = (keyIndex + 1) % keys.length
        continue
      }
      if (!res.ok) {
        const text = (await res.text()).slice(0, 500)
        // Observed Groq behaviour, not in the API reference: malformed tool calls come back as a 400 with code "tool_use_failed".
        const kind: ModelErrorKind = res.status === 400 && text.includes('tool_use_failed') ? 'tool_use_failed' : 'http'
        throw new ModelCallError(kind, `Groq ${res.status}: ${text}`, res.status)
      }

      return parseCompletion(await res.json(), Date.now() - started)
    }
    throw new ModelCallError('rate_limited', `All ${keys.length} Groq keys returned 429`, 429)
  }
}

function parseCompletion(json: unknown, latencyMs: number): ModelResponse {
  const data = json as {
    choices?: { message?: { content?: string | null; tool_calls?: WireToolCall[] }; finish_reason?: string }[]
    usage?: { prompt_tokens?: number; completion_tokens?: number }
  }
  const choice = data.choices?.[0]
  if (!choice?.message) throw new ModelCallError('bad_response', 'No choices[0].message in Groq response')

  const toolCalls = choice.message.tool_calls ?? []
  const message: AssistantMessage = {
    role: 'assistant',
    content: choice.message.content ?? null,
    ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
  }
  const step: ModelStep = {
    type: 'model',
    ...(message.content ? { text: message.content } : {}),
    toolCalls: toolCalls.map<RawToolCall>(tc => ({ id: tc.id, name: tc.function.name, arguments: tc.function.arguments })),
    promptTokens: data.usage?.prompt_tokens ?? 0,
    completionTokens: data.usage?.completion_tokens ?? 0,
    latencyMs,
  }
  return { message, step, finishReason: choice.finish_reason ?? 'unknown' }
}

// ─── Test double ────────────────────────────────────────────

/** One scripted model turn: plain text, some tool calls, or an error to throw. */
export type ScriptedTurn =
  | { text: string; finishReason?: string }
  | { toolCalls: { name: string; args: unknown | string }[]; text?: string }
  | { error: ModelCallError }

/**
 * A fake ModelCaller that replays turns in order and records every request.
 * `args` given as an object is JSON-encoded; given as a string it's passed
 * through raw, so tests can simulate the model sending broken JSON.
 */
export function scriptedModel(turns: ScriptedTurn[]): ModelCaller & { requests: ModelRequest[] } {
  let i = 0
  const requests: ModelRequest[] = []
  const caller = async (req: ModelRequest): Promise<ModelResponse> => {
    // Snapshot the messages: the loop keeps mutating its array after the call.
    requests.push({ ...req, messages: [...req.messages] })
    const turn = turns[i++]
    if (!turn) throw new Error(`scriptedModel: no turn ${i} scripted (the loop called the model too many times)`)
    if ('error' in turn) throw turn.error
    const toolCalls: WireToolCall[] = 'toolCalls' in turn
      ? turn.toolCalls.map((tc, n) => ({
          id: `call_${i}_${n}`,
          type: 'function',
          function: { name: tc.name, arguments: typeof tc.args === 'string' ? tc.args : JSON.stringify(tc.args) },
        }))
      : []
    return parseCompletion(
      {
        choices: [{
          message: { content: turn.text ?? null, tool_calls: toolCalls },
          finish_reason: 'finishReason' in turn && turn.finishReason ? turn.finishReason : toolCalls.length ? 'tool_calls' : 'stop',
        }],
        usage: { prompt_tokens: 100, completion_tokens: 20 },
      },
      1,
    )
  }
  return Object.assign(caller, { requests })
}
