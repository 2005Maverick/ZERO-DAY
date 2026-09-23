import 'server-only'
import { ModelCallError, type ModelCaller } from './model'

// ============================================================================
// Retry with exponential backoff + full jitter (roadmap 1.6).
// A decorator: wraps any ModelCaller and returns a ModelCaller, so the
// transport stays "one call" and the runners don't know retries exist.
// Written by Claude at Bhavya's request (2026-09-23).
// ============================================================================

export interface RetryPolicy {
  /** retries AFTER the first attempt: 2 = up to 3 calls */
  maxRetries: number
  baseDelayMs: number
  maxDelayMs: number
}

export const DEFAULT_RETRY: RetryPolicy = { maxRetries: 2, baseDelayMs: 250, maxDelayMs: 2000 }

/** Only failures that waiting can fix. A 400/404, a malformed tool call or an abort will fail the same way again. */
export function isRetryable(err: unknown): boolean {
  if (!(err instanceof ModelCallError)) return false
  switch (err.kind) {
    case 'network':
    case 'rate_limited':
      return true
    case 'http':
      return err.status === 408 || (err.status !== undefined && err.status >= 500)
    default:
      return false   // tool_use_failed (the loop nudges instead), aborted, bad_response
  }
}

/** Full jitter: a random wait in [0, min(cap, base·2^n)], so many clients don't retry in lockstep. */
export function backoffDelay(retry: number, policy: RetryPolicy, random: () => number): number {
  return Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** retry) * random()
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new ModelCallError('aborted', 'Aborted during retry backoff')); return }
    const onAbort = () => { clearTimeout(timer); reject(new ModelCallError('aborted', 'Aborted during retry backoff')) }
    const timer = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve() }, ms)
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export function withRetry(
  caller: ModelCaller,
  policy: RetryPolicy = DEFAULT_RETRY,
  hooks: {
    /** injectable for tests */
    random?: () => number
    sleep?: (ms: number, signal: AbortSignal) => Promise<void>
    /** e.g. to log retries into the audit trail */
    onRetry?: (info: { retry: number; delayMs: number; error: ModelCallError }) => void
  } = {},
): ModelCaller {
  const random = hooks.random ?? Math.random
  const wait = hooks.sleep ?? sleep
  return async req => {
    for (let retry = 0; ; retry++) {
      try {
        return await caller(req)
      } catch (err) {
        if (!isRetryable(err) || retry >= policy.maxRetries || req.signal.aborted) throw err
        const delayMs = backoffDelay(retry, policy, random)
        hooks.onRetry?.({ retry: retry + 1, delayMs, error: err as ModelCallError })
        await wait(delayMs, req.signal)
      }
    }
  }
}
