import type {
  Allocation,
  AllocationSnapshot,
  PortfolioStock,
  PortfolioNewsEvent,
  PortfolioRunResult,
  Mistake,
  CausalRule,
} from '@/types/portfolio'

export function computePortfolioValue(
  allocations: Record<string, Allocation>,
  cash: number
): number {
  const invested = Object.values(allocations).reduce((sum, a) => sum + a.currentValue, 0)
  return invested + cash
}

export function computePnlPct(current: number, starting: number): number {
  return ((current - starting) / starting) * 100
}

// HHI-based diversification score (0–5)
// HHI = sum of (weight^2). Perfectly diversified (6 equal) = low HHI = high score.
export function computeDiversificationScore(
  allocations: Record<string, Allocation>,
  totalValue: number
): number {
  if (totalValue <= 0) return 0
  const weights = Object.values(allocations).map(a => a.currentValue / totalValue)
  const hhi = weights.reduce((sum, w) => sum + w * w, 0)
  // HHI: 1.0 = fully concentrated, 1/6 ≈ 0.167 = perfectly diversified
  // Map to 0–5 score: lower HHI = higher score
  const score = Math.max(0, Math.min(5, 5 * (1 - hhi) / (1 - 1 / 6)))
  return Math.round(score * 10) / 10
}

export function computeDoNothingHistory(
  initialSnapshot: AllocationSnapshot,
  stocks: PortfolioStock[]
): { second: number; value: number }[] {
  const result: { second: number; value: number }[] = []
  for (let s = 0; s < 480; s++) {
    let value = initialSnapshot.cash
    for (const [symbol, alloc] of Object.entries(initialSnapshot.allocations)) {
      const stock = stocks.find(st => st.symbol === symbol)
      if (!stock) continue
      const candle = stock.candles[s] ?? stock.candles[stock.candles.length - 1]
      value += alloc.shares * candle.price
    }
    result.push({ second: s, value: Math.round(value) })
  }
  return result
}

// Perfect play: sell airlines/energy before Event 1, buy pharma; buy banking before Event 3
export function computePerfectPlayHistory(
  stocks: PortfolioStock[],
  events: PortfolioNewsEvent[],
  startingCapital: number
): { second: number; value: number }[] {
  const result: { second: number; value: number }[] = []

  // Phase allocations based on events
  const phases = [
    { from: 0,   to: 95,  allocs: { SUNPHARMA: 0.25, HDFCBANK: 0.25, TCS: 0.25, TITAN: 0.15, RELIANCE: 0.05, INDIGO: 0.05 } },
    { from: 96,  to: 249, allocs: { SUNPHARMA: 0.40, HDFCBANK: 0.30, TCS: 0.20, TITAN: 0.10, RELIANCE: 0.00, INDIGO: 0.00 } },
    { from: 250, to: 402, allocs: { SUNPHARMA: 0.50, HDFCBANK: 0.30, TCS: 0.15, TITAN: 0.05, RELIANCE: 0.00, INDIGO: 0.00 } },
    { from: 403, to: 480, allocs: { SUNPHARMA: 0.40, HDFCBANK: 0.40, TCS: 0.15, TITAN: 0.05, RELIANCE: 0.00, INDIGO: 0.00 } },
  ]

  for (let s = 0; s < 480; s++) {
    const phase = phases.find(p => s >= p.from && s <= p.to) ?? phases[0]
    let value = 0
    for (const stock of stocks) {
      const weight = phase.allocs[stock.symbol as keyof typeof phase.allocs] ?? 0
      const candle = stock.candles[s] ?? stock.candles[stock.candles.length - 1]
      const shares = (startingCapital * weight) / stock.openPrice
      value += shares * candle.price
    }
    result.push({ second: s, value: Math.round(value) })
  }
  return result
}

export function detectMistakes(
  snapshots: AllocationSnapshot[],
  flashCrashSecond: number,
  didPanicSell: boolean,
  events: PortfolioNewsEvent[],
  stocks: PortfolioStock[]
): Mistake[] {
  const mistakes: Mistake[] = []

  // Mistake 1: panic sold during flash crash
  if (didPanicSell) {
    const crashSnap = snapshots.find(s => s.reason === 'flash_crash')
    const cost = crashSnap ? Math.round(crashSnap.portfolioValue * 0.03) : 2000
    mistakes.push({
      atSecond: flashCrashSecond,
      label: 'Panic Sell During Flash Crash',
      detail: 'You sold during the algo cascade. The market recovered in 90 seconds. You locked in a false loss.',
      costRupees: cost,
    })
  }

  // Mistake 2: over-concentrated (>50%) in one stock after any event
  for (const snap of snapshots) {
    for (const [symbol, alloc] of Object.entries(snap.allocations)) {
      const weight = alloc.currentValue / snap.portfolioValue
      if (weight > 0.5) {
        mistakes.push({
          atSecond: snap.atSecond,
          label: `Over-Concentrated in ${symbol}`,
          detail: `${Math.round(weight * 100)}% in one stock. When it fell, your portfolio had no cushion.`,
          costRupees: Math.round(alloc.pnlRupees < 0 ? Math.abs(alloc.pnlRupees) * 0.5 : 0),
        })
        break
      }
    }
  }

  // Mistake 3: held IndiGo through oil event without selling
  const oilEvent = events.find(e => e.id === 'oil-crash')
  if (oilEvent) {
    const snapAfter = snapshots.find(s => s.atSecond >= oilEvent.realSecond)
    if (snapAfter) {
      const indigoAlloc = snapAfter.allocations['INDIGO']
      if (indigoAlloc && indigoAlloc.shares > 0) {
        const indigoStock = stocks.find(s => s.symbol === 'INDIGO')
        if (indigoStock) {
          const priceBefore = indigoStock.candles[oilEvent.realSecond - 1]?.price ?? indigoStock.openPrice
          const priceAfter = indigoStock.candles[Math.min(oilEvent.realSecond + 30, 479)]?.price ?? priceBefore
          const cost = Math.round(indigoAlloc.shares * (priceBefore - priceAfter))
          if (cost > 500) {
            mistakes.push({
              atSecond: oilEvent.realSecond + 30,
              label: 'Held IndiGo Through Oil Crash',
              detail: 'Oil crashing 25% is bad for airlines. Fuel = 40% of operating costs. The rebalancing window was open.',
              costRupees: cost,
            })
          }
        }
      }
    }
  }

  return mistakes
}

export function detectUnlockedRules(
  snapshots: AllocationSnapshot[],
  didPanicSell: boolean,
  rules: CausalRule[]
): string[] {
  const unlocked = new Set<string>()

  const initialSnap = snapshots[0]
  const afterOilSnap = snapshots.find(s => s.atSecond >= 96)
  const afterWhoSnap = snapshots.find(s => s.atSecond >= 250)
  const afterRbiSnap = snapshots.find(s => s.atSecond >= 403)
  const hasFlashSnap  = snapshots.some(s => s.reason === 'flash_crash')

  // Oil-Airline Inverse: sold IndiGo OR reduced IndiGo before/at oil event
  if (initialSnap && afterOilSnap) {
    const before = initialSnap.allocations['INDIGO']?.shares ?? 0
    const after  = afterOilSnap.allocations['INDIGO']?.shares ?? 0
    if (after < before) unlocked.add('oil-airline-inverse')
  }

  // Pharma Safe Haven: bought SunPharma before WHO event
  if (initialSnap && afterWhoSnap) {
    const before = initialSnap.allocations['SUNPHARMA']?.shares ?? 0
    const after  = afterWhoSnap.allocations['SUNPHARMA']?.shares ?? 0
    if (after > before * 1.1) unlocked.add('pharma-safe-haven')
    // Also unlock if they held sunpharma from start
    if (before > 0 && after > 0) unlocked.add('pharma-safe-haven')
  }

  // Rate-Bank Positive: held or bought HDFC before RBI event
  if (afterRbiSnap) {
    const hdfc = afterRbiSnap.allocations['HDFCBANK']
    if (hdfc && hdfc.shares > 0) unlocked.add('rate-bank-positive')
  }

  // Diversification: spread across 4+ sectors in any snapshot
  for (const snap of snapshots) {
    const sectors = new Set(Object.values(snap.allocations)
      .filter(a => a.shares > 0)
      .map(a => a.symbol))
    if (sectors.size >= 4) {
      unlocked.add('diversification')
      break
    }
  }

  // Flash Crash Recovery: did NOT panic sell
  if (!didPanicSell) unlocked.add('flash-crash-recovery')

  // Volume Precedes Price: always unlock (they saw the volume bars after minute 2)
  unlocked.add('volume-precedes-price')

  return rules.filter(r => unlocked.has(r.id)).map(r => r.id)
}
