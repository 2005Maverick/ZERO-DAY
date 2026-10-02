import type { DecisionEvent } from '@/lib/agents/pipeline'

// Deterministic feedback for a Monitor event: the pipeline's 'template' path (ADR-002)
// and the browser's fallback when the server can't be reached (no LLM, no network).
// Built from Monitor's own sentence, so it contains only Monitor's facts; coach.test.ts
// checks it passes Coach's content rules. No 'server-only': the browser uses it too.

export interface Feedback {
  message: string
  severity: 'info' | 'caution' | 'warning'
  question: string
}

const TEMPLATES: Record<string, Omit<Feedback, 'message'> & { line: string }> = {
  panic_sell: { severity: 'warning', line: 'Selling a loser while the screen is deep red is often fear talking, not a plan.', question: 'What would have made you sell before the price started falling?' },
  revenge_trade: { severity: 'warning', line: 'A bigger trade right after a loss is often an attempt to win it back quickly.', question: 'Would you have placed this trade if the last one had been a win?' },
  averaging_down: { severity: 'caution', line: 'Adding to a losing position raises your stake in a call that has not worked yet.', question: 'What has changed since your first buy that makes this a better entry?' },
  news_reflex: { severity: 'caution', line: 'Trading within moments of a headline leaves no time to judge whether it matters.', question: 'What did this headline tell you that the price had not already shown?' },
  oversized_position: { severity: 'caution', line: 'Putting a large share of the account into one order makes a single mistake expensive.', question: 'How much of your account are you willing to lose on one idea?' },
  overtrading: { severity: 'info', line: 'Many orders in a short time can mean reacting to every move instead of following a plan.', question: 'Which of these orders were part of your plan for the day?' },
}

/** Never fails. */
export function feedbackTemplate(event: DecisionEvent): Feedback {
  const t = TEMPLATES[event.kind] ?? { severity: 'info' as const, line: 'Take a moment to check this decision against your plan.', question: 'What was your reason for this trade?' }
  return { message: `${event.summary} ${t.line}`.slice(0, 400), severity: t.severity, question: t.question }
}

/** Plain-language names for the UI. */
export const PATTERN_LABELS: Record<string, string> = {
  panic_sell: 'Panic sell',
  revenge_trade: 'Revenge trade',
  averaging_down: 'Averaging down',
  news_reflex: 'News reflex',
  oversized_position: 'Oversized position',
  overtrading: 'Overtrading',
}
