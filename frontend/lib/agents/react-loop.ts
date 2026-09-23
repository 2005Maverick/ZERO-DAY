import 'server-only'
import type { ModelCaller } from './model'
import type { AgentRun, AgentSpec, ToolContext } from './types'

// ============================================================================
// ReAct loop (roadmap 1.3), YOURS TO IMPLEMENT.
// Decisions agreed 2026-09-23; react-loop.test.ts checks each one.
// ============================================================================
//
// Setup
//  - Build the registry from spec.tools (createRegistry). The model's tool list =
//    every tool via toGroqTool() + submitTool(spec.output, <description>).
//  - messages = [system: spec.systemPrompt, user: spec.buildUserMessage(input)].
//  - One AbortController for the whole run; abort it after spec.limits.timeoutMs.
//    Its signal goes to every model call AND into ctx for tools.
//    Clear the timer when the run ends, whatever the outcome.
//    A tool that ignores its signal must not hold the run past timeoutMs:
//    the run ends as 'timeout' on time even if executeTool hasn't returned yet.
//
// Each step (at most spec.limits.maxSteps model calls)
//  - Call deps.model with toolChoice 'required', maxTokens from limits.
//    On the LAST allowed step, force the submit tool instead:
//      toolChoice: { type: 'function', function: { name: SUBMIT_TOOL_NAME } }      [decision 4]
//  - Record response.step, then push response.message onto messages unchanged.
//  - No tool calls (the model replied in prose):
//      push a user message telling it it must call a tool; this counts as a step. [decision 1]
//  - If any call is SUBMIT_TOOL_NAME, handle ONLY that call; don't run the others. [decision 2]
//      Parse + validate its arguments against spec.output and record a ToolStep
//      named SUBMIT_TOOL_NAME (bad JSON → errorKind 'bad_json', schema failure →
//      'invalid_args', success → result = the parsed output).
//      Valid   → finish with status 'ok', output = parsed data.
//      Invalid → send the error back as that call's tool result; ONE repair
//                attempt is allowed. A second invalid submit → 'invalid_output'. [decision 3]
//  - Otherwise run each call in order with executeTool(registry, call, ctx, limits.toolTimeoutMs),
//    record each ToolStep, and push a tool message:
//      { role: 'tool', tool_call_id, name, content }
//      content = JSON.stringify(result), or `ERROR (<errorKind>): <error>` on failure.
//
// Endings
//  - Ran out of steps without a valid submit            → 'step_limit'
//  - ModelCallError 'aborted' (the run timer fired)      → 'timeout'           [decisions 5, 6]
//  - ModelCallError 'tool_use_failed': retry ONCE (push a user nudge, counts as a step);
//    a second one in the same run → 'error'                                    [decision 6]
//  - Any other error (other ModelCallError kinds, or anything thrown) → 'error'
//  - NEVER throws. Every ending returns an AgentRun with all steps so far, output null
//    unless 'ok', and usage summed over model steps (+ total wall-clock latencyMs).
//  - runId = deps.newRunId?.() ?? crypto.randomUUID()

export interface ReactDeps {
  model: ModelCaller
  /** tool context minus the signal: the loop supplies the run's signal */
  ctx: Omit<ToolContext, 'signal'>
  newRunId?: () => string
}

export async function runReactAgent<In, Out>(
  spec: AgentSpec<In, Out>,
  input: In,
  deps: ReactDeps,
): Promise<AgentRun<Out>> {
  void spec; void input; void deps
  throw new Error('runReactAgent: not implemented yet')
}
