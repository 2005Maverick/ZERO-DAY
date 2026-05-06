import type { BehaviorProfile, Mistake, TraceEvent } from './types'

function fmtMin(simMin: number): string {
  const total = 9 * 60 + 15 + Math.floor(simMin)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function detectMistakes(profile: BehaviorProfile, events: TraceEvent[]): Mistake[] {
  const out: Mistake[] = []

  // ── NO_STOP_LOSS ──────────────────────────────────────────
  for (const buy of profile.trades.filter(t => t.side === 'BUY')) {
    const buyEvent = events.find(e => e.kind === 'order_filled' && e.data?.orderId === buy.id)
    if (!buyEvent) continue
    const slSet = events.find(e =>
      e.kind === 'sl_set' &&
      e.data?.symbol === buy.symbol &&
      e.t > buyEvent.t && e.t - buyEvent.t < 60_000,
    )
    if (!slSet) {
      out.push({
        id: 'NO_STOP_LOSS', severity: 'high',
        evidence: `BUY ${buy.qty} ${buy.symbol} @ ₹${buy.price} at ${fmtMin(buy.filledAtMin)} IST — no stop loss set within 60 seconds`,
        data: { tradeId: buy.id, symbol: buy.symbol, qty: buy.qty, price: buy.price, simMinute: buy.filledAtMin },
      })
    }
  }

  // ── OVERSIZED_POSITION ────────────────────────────────────
  for (const trade of profile.trades) {
    if (trade.sizingPct > 0.30) {
      out.push({
        id: 'OVERSIZED_POSITION',
        severity: trade.sizingPct > 0.50 ? 'high' : 'med',
        evidence: `${trade.side} ${trade.qty} ${trade.symbol} @ ₹${trade.price} at ${fmtMin(trade.filledAtMin)} — ${(trade.sizingPct * 100).toFixed(0)}% of wallet committed in one trade`,
        data: { tradeId: trade.id, sizingPct: trade.sizingPct, symbol: trade.symbol, simMinute: trade.filledAtMin },
      })
    }
  }

  // ── REVENGE_TRADE ─────────────────────────────────────────
  for (let i = 1; i < profile.trades.length; i++) {
    const prev = profile.trades[i - 1]
    const cur = profile.trades[i]
    if (prev.side === 'SELL' && prev.realizedPnL < 0 && cur.side === 'BUY') {
      const dtMin = cur.filledAtMin - prev.filledAtMin
      if (dtMin >= 0 && dtMin < 5 && cur.notional > prev.notional * 2) {
        out.push({
          id: 'REVENGE_TRADE', severity: 'high',
          evidence: `Lost ₹${Math.abs(Math.round(prev.realizedPnL))} on ${prev.symbol} at ${fmtMin(prev.filledAtMin)}, then bought ${cur.qty} ${cur.symbol} for ₹${Math.round(cur.notional)} ${dtMin} min later — ${(cur.notional / prev.notional).toFixed(1)}× the previous size`,
          data: { afterLoss: prev.id, revengeId: cur.id, sizeMultiplier: cur.notional / prev.notional },
        })
      }
    }
  }

  // ── PANIC_SELL ────────────────────────────────────────────
  if (profile.panicSellCount > 0) {
    out.push({
      id: 'PANIC_SELL',
      severity: profile.panicSellCount > 1 ? 'high' : 'med',
      evidence: `${profile.panicSellCount} sell${profile.panicSellCount > 1 ? 's' : ''} taken within minutes of entry at a loss — likely panic exits rather than planned stops`,
      data: { count: profile.panicSellCount },
    })
  }

  // ── NO_THESIS ─────────────────────────────────────────────
  const noThesisTrades = profile.trades.filter(t => !t.hasThesis)
  if (noThesisTrades.length > 0 && profile.thesisRate < 0.5) {
    out.push({
      id: 'NO_THESIS',
      severity: 'med',
      evidence: `${noThesisTrades.length} of ${profile.trades.length} trades placed without writing a thesis — only ${Math.round(profile.thesisRate * 100)}% had a stated reason`,
      data: { thesisRate: profile.thesisRate, missingCount: noThesisTrades.length },
    })
  }

  // ── NEWS_REFLEX ───────────────────────────────────────────
  if (profile.newsReflexCount > 0) {
    out.push({
      id: 'NEWS_REFLEX',
      severity: profile.newsReflexCount > 1 ? 'high' : 'med',
      evidence: `${profile.newsReflexCount} trade${profile.newsReflexCount > 1 ? 's' : ''} placed within 10 seconds of a news headline dropping — reflex, not analysis`,
      data: { count: profile.newsReflexCount },
    })
  }

  // ── DISPOSITION_EFFECT ────────────────────────────────────
  if (profile.dispositionRatio > 2 && profile.winCount + profile.lossCount >= 2) {
    out.push({
      id: 'DISPOSITION_EFFECT', severity: 'high',
      evidence: `Held losers ${(profile.avgLoserHoldMs / 60_000).toFixed(1)} min on average vs winners only ${(profile.avgWinnerHoldMs / 60_000).toFixed(1)} min — classic cut-winners-hold-losers pattern`,
      data: { dispositionRatio: profile.dispositionRatio, winnerHold: profile.avgWinnerHoldMs, loserHold: profile.avgLoserHoldMs },
    })
  }

  // ── OVERTRADING ───────────────────────────────────────────
  // > 6 trades per simulated hour
  const sessionMinutes = events.length > 0
    ? events[events.length - 1].simMinute - (events[0]?.simMinute ?? 0)
    : 0
  const tradesPerHour = sessionMinutes > 0 ? (profile.tradeCount / sessionMinutes) * 60 : 0
  if (tradesPerHour > 6 && profile.tradeCount >= 4) {
    out.push({
      id: 'OVERTRADING', severity: 'med',
      evidence: `Placed ${profile.tradeCount} trades over ${Math.round(sessionMinutes)} minutes — ~${tradesPerHour.toFixed(1)} per hour. High frequency rarely correlates with returns for retail.`,
      data: { tradesPerHour, tradeCount: profile.tradeCount },
    })
  }

  // ── IGNORED_NEWS ──────────────────────────────────────────
  if (profile.newsViewedRate < 0.3 && profile.tradeCount >= 2) {
    out.push({
      id: 'IGNORED_NEWS', severity: 'med',
      evidence: `Read only ${Math.round(profile.newsViewedRate * 100)}% of news headlines that fired during the session — trading without context`,
      data: { newsViewedRate: profile.newsViewedRate },
    })
  }

  // ── HELD_THROUGH_CLOSE ────────────────────────────────────
  // Force-square-off at end with positions still open is common — flag if loss
  const sessionEnd = events.find(e => e.kind === 'session_end')
  if (sessionEnd) {
    const heldOpen = (sessionEnd.data?.openPositions as number | undefined) ?? 0
    if (heldOpen > 0 && profile.dayPnL < 0) {
      out.push({
        id: 'HELD_THROUGH_CLOSE', severity: 'low',
        evidence: `${heldOpen} position${heldOpen > 1 ? 's' : ''} still open at the closing bell — force-squared at close, often the worst possible price`,
        data: { count: heldOpen },
      })
    }
  }

  return out
}
