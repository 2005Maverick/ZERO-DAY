import 'server-only'
import { z } from 'zod'
import { SUBMIT_TOOL_NAME, type AnyToolDef } from './types'

// ============================================================================
// Zod → Groq tool definitions (OpenAI-compatible "function" tools)
// ============================================================================

export interface GroqTool {
  type: 'function'
  function: { name: string; description: string; parameters: Record<string, unknown> }
}

// z.number().int() emits ±Number.MAX_SAFE_INTEGER bounds. They carry no
// information for the model and cost tokens on every request, so drop them.
const SAFE_INT = Number.MAX_SAFE_INTEGER

function stripNoise(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(stripNoise)
  if (!node || typeof node !== 'object') return node
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(node)) {
    if (k === '$schema') continue
    if (k === 'maximum' && v === SAFE_INT) continue
    if (k === 'minimum' && v === -SAFE_INT) continue
    out[k] = stripNoise(v)
  }
  return out
}

/**
 * JSON Schema for what the MODEL must send, so we use `io: 'input'`: a field
 * with a .default() is optional for the model even though it's always present
 * after parsing.
 */
export function zodToParameters(schema: z.ZodType): Record<string, unknown> {
  return stripNoise(z.toJSONSchema(schema, { io: 'input' })) as Record<string, unknown>
}

export function toGroqTool(tool: AnyToolDef): GroqTool {
  return {
    type: 'function',
    function: { name: tool.name, description: tool.description, parameters: zodToParameters(tool.input) },
  }
}

/**
 * The tool that ends a ReAct loop. Its parameters are the agent's output
 * schema, so "submitting" = handing over the final answer as structured args.
 * (On Groq, schema-enforced output can't be combined with tool calling, see ADR-001.)
 */
export function submitTool(output: z.ZodType, description: string): GroqTool {
  return {
    type: 'function',
    function: { name: SUBMIT_TOOL_NAME, description, parameters: zodToParameters(output) },
  }
}
