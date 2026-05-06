import type { Outcome } from './types'

export function computeReward(o: Outcome): number {
  let r = 0
  if (o.completed) r += 1.0
  if (o.passed)    r += 2.0
  if (o.replayed)  r += 0.5
  r += o.skillDelta * 5.0
  r += o.mistakeReduction * 3.0
  if (o.abandoned)      r -= 1.0
  if (o.timeOverBudget) r -= 0.3
  return r
}
