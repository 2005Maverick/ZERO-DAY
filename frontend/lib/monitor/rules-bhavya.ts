import { MONITOR_THRESHOLDS as T } from './thresholds'
import { pct, r2, type Rule } from './context'

// ============================================================================
// Bhavya's rules (2.1): the two core behavioural-finance ideas.
// Spec: rules-bhavya.test.ts. Run `npx vitest run lib/monitor` until it's green.
//
// You have, in the context (see context.ts → RuleContext):
//   order   the order just placed (side, symbol, quantity, price?)
//   before  state BEFORE the order: before.positions[symbol] = { qty, avgPrice }
//   now     the minute it was placed
//   price(symbol, minute?)  the engine's price (default minute: now)
//   prevClose(symbol)       previous close: the HUD's % change is measured against it
// Thresholds: T.underwaterPct (0.02), T.panicDayDropPct (0.05), T.panicLookbackMin (15).
// Helpers: r2(n) rounds to 2 dp; pct(0.041) → 4.1.
// Return null when the rule doesn't apply, or an event:
//   { kind, simMinute: now, symbol, facts: { …numbers/strings/booleans }, summary: '<one plain sentence>' }
// ============================================================================

/**
 * panic_sell ("on-screen red", ADR-006): selling a losing position while the screen
 * shows the stock deep red on the day and still falling.
 * Fires when ALL of:
 *   - it's a SELL, and there is a position in `before` with qty > 0
 *   - price now ≤ avgPrice × (1 − T.underwaterPct)                  (selling at a loss)
 *   - price now ≤ prevClose × (1 − T.panicDayDropPct)               (≥5% red on the HUD)
 *   - price now < price T.panicLookbackMin minutes ago               (still falling; clamp that minute at 0)
 * Facts (the test checks these names): lossPct (how far below avg cost, in %),
 *   dayDropPct (how far below the previous close, in %), fallPct (the fall over the
 *   lookback, in %), lookbackMinutes, avgPrice, price.
 */
export const panicSell: Rule = () => {
  // TODO(Bhavya)
  void T; void pct; void r2
  return null
}

/**
 * averaging_down: buying more of a position that is already underwater.
 * Fires when ALL of:
 *   - it's a BUY, and there is a position in `before` with qty > 0
 *   - price now ≤ avgPrice × (1 − T.underwaterPct)
 * Facts: lossPct, avgPrice, price, existingQty, addedQty.
 */
export const averagingDown: Rule = () => {
  // TODO(Bhavya)
  return null
}
