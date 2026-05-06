import type { BehaviorProfile, TraceEvent, TradeRecord } from './types'

const STARTING_CASH = 100000

interface FillEventData {
  orderId: string
  side: 'BUY' | 'SELL'
  symbol: string
  qty: number
  price: number
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'SL-M'
  thesis?: string
  walletAtOrder?: number
}

function getNum(d: Record<string, unknown> | undefined, key: string, fallback = 0): number {
  const v = d?.[key]
  return typeof v === 'number' ? v : fallback
}

function getStr(d: Record<string, unknown> | undefined, key: string, fallback = ''): string {
  const v = d?.[key]
  return typeof v === 'string' ? v : fallback
}

export function computeProfile(events: TraceEvent[]): BehaviorProfile {
  // ── Build trade records from order_filled events ─────────
  const trades: TradeRecord[] = []
  const buyFifo: Record<string, { qty: number; price: number; filledAtMin: number }[]> = {}

  for (const e of events) {
    if (e.kind !== 'order_filled') continue
    const d = e.data
    const side = getStr(d, 'side') as 'BUY' | 'SELL'
    const symbol = getStr(d, 'symbol')
    const qty = getNum(d, 'qty')
    const price = getNum(d, 'price')
    const orderType = (getStr(d, 'orderType') || 'MARKET') as TradeRecord['orderType']
    const thesis = getStr(d, 'thesis')
    const wallet = getNum(d, 'walletAtOrder', STARTING_CASH)
    const notional = qty * price

    let realizedPnL = 0
    if (side === 'SELL') {
      const fifo = buyFifo[symbol] ?? []
      let remaining = qty
      while (remaining > 0 && fifo.length > 0) {
        const head = fifo[0]
        const close = Math.min(head.qty, remaining)
        realizedPnL += (price - head.price) * close
        head.qty -= close
        remaining -= close
        if (head.qty <= 0) fifo.shift()
      }
      buyFifo[symbol] = fifo
    } else {
      const fifo = buyFifo[symbol] ?? []
      fifo.push({ qty, price, filledAtMin: e.simMinute })
      buyFifo[symbol] = fifo
    }

    trades.push({
      id: getStr(d, 'orderId') || `t_${trades.length}`,
      side, symbol, qty, price, notional, orderType,
      hasThesis: thesis.trim().length > 0,
      thesisLength: thesis.trim().length,
      sizingPct: wallet > 0 ? notional / wallet : 0,
      filledAtMin: e.simMinute,
      walletAtTrade: wallet,
      realizedPnL,
    })
  }

  const buys = trades.filter(t => t.side === 'BUY')
  const sells = trades.filter(t => t.side === 'SELL')

  // ── SL usage rate ────────────────────────────────────────
  let slPaired = 0
  for (const buy of buys) {
    const followingSL = events.find(e =>
      e.kind === 'sl_set' &&
      e.t > findEventTime(events, 'order_filled', buy.id) &&
      e.t - findEventTime(events, 'order_filled', buy.id) <= 60_000 &&
      getStr(e.data, 'symbol') === buy.symbol,
    )
    if (followingSL) slPaired++
  }
  const slUsageRate = buys.length > 0 ? slPaired / buys.length : 0

  // ── Pause-to-think ───────────────────────────────────────
  const pauseEvents = events.filter(e => e.kind === 'pause')
  const resumeEvents = events.filter(e => e.kind === 'resume')
  const pauseSpans: { start: number; end: number }[] = []
  for (let i = 0; i < pauseEvents.length; i++) {
    const start = pauseEvents[i].t
    const end = resumeEvents[i]?.t ?? Date.now()
    pauseSpans.push({ start, end })
  }
  const pauseMinutes = pauseSpans.reduce((s, p) => s + (p.end - p.start) / 60_000, 0)
  let pauseToThink = 0
  for (const trade of trades) {
    const tradeT = findEventTime(events, 'order_filled', trade.id)
    const has30sPauseRecent = pauseSpans.some(p =>
      p.end <= tradeT && tradeT - p.start <= 2 * 60_000 && p.end - p.start >= 30_000,
    )
    if (has30sPauseRecent) pauseToThink++
  }
  const pauseToThinkRate = trades.length > 0 ? pauseToThink / trades.length : 0

  // ── News engagement ─────────────────────────────────────
  const newsDropped = events.filter(e => e.kind === 'news_dropped')
  const newsViewed = events.filter(e => e.kind === 'news_viewed')
  const newsViewedRate = newsDropped.length > 0
    ? Math.min(1, new Set(newsViewed.map(e => getStr(e.data, 'newsId'))).size / newsDropped.length)
    : 0

  // ── Reflex/FOMO/panic counters (window-based) ───────────
  let panicSell = 0, fomoBuy = 0, newsReflex = 0
  for (const trade of trades) {
    const tradeT = findEventTime(events, 'order_filled', trade.id)
    // News reflex: trade within 10s of any news_dropped
    const reflexNews = events.find(e =>
      e.kind === 'news_dropped' && tradeT - e.t > 0 && tradeT - e.t <= 10_000,
    )
    if (reflexNews) newsReflex++

    if (trade.side === 'SELL') {
      // Panic sell heuristic: realized loss + sold within 60s of any minute_tick
      // (proxy — we'd need price-tick events for true adverse-move detection)
      if (trade.realizedPnL < 0) {
        const heldMs = tradeT - matchingBuyTime(events, trade.id, trades) || 0
        if (heldMs > 0 && heldMs < 5 * 60_000) panicSell++
      }
    } else {
      // FOMO: bought without thesis or pause
      if (!trade.hasThesis && !pauseSpans.some(p => p.end <= tradeT && tradeT - p.end < 30_000)) {
        fomoBuy++
      }
    }
  }

  // ── Revenge: size grew >2× after a loss within 5 min ────
  let revenge = 0
  for (let i = 1; i < trades.length; i++) {
    const prev = trades[i - 1]
    const cur = trades[i]
    if (prev.side === 'SELL' && prev.realizedPnL < 0 && cur.side === 'BUY') {
      const dt = (findEventTime(events, 'order_filled', cur.id) - findEventTime(events, 'order_filled', prev.id))
      if (dt < 5 * 60_000 && cur.notional > prev.notional * 2) revenge++
    }
  }

  // ── Disposition: avg hold(losers) vs winners ────────────
  const sellRecords = sells.map(sell => {
    const buyT = matchingBuyTime(events, sell.id, trades)
    const sellT = findEventTime(events, 'order_filled', sell.id)
    return { holdMs: sellT - (buyT || sellT), pnl: sell.realizedPnL }
  })
  const winners = sellRecords.filter(r => r.pnl > 0)
  const losers  = sellRecords.filter(r => r.pnl < 0)
  const avgWinnerHoldMs = winners.length ? winners.reduce((s, r) => s + r.holdMs, 0) / winners.length : 0
  const avgLoserHoldMs  = losers.length  ? losers.reduce((s, r) => s + r.holdMs, 0) / losers.length  : 0
  const dispositionRatio = avgWinnerHoldMs > 0 ? avgLoserHoldMs / avgWinnerHoldMs : 0

  // ── Sizing ───────────────────────────────────────────────
  const sizes = trades.map(t => t.sizingPct)
  const avgPositionSizePct = sizes.length ? sizes.reduce((a, b) => a + b, 0) / sizes.length : 0
  const maxPositionSizePct = sizes.length ? Math.max(...sizes) : 0
  const oversizedTradeCount = trades.filter(t => t.sizingPct > 0.30).length

  // ── Thesis ───────────────────────────────────────────────
  const withThesis = trades.filter(t => t.hasThesis)
  const thesisRate = trades.length > 0 ? withThesis.length / trades.length : 0
  const avgThesisLength = withThesis.length > 0
    ? withThesis.reduce((s, t) => s + t.thesisLength, 0) / withThesis.length : 0

  // ── Engagement ──────────────────────────────────────────
  const symbolFocus = new Set(events.filter(e => e.kind === 'symbol_focus').map(e => getStr(e.data, 'symbol')))
  const sessionStart = events.find(e => e.kind === 'session_start')?.t ?? events[0]?.t ?? Date.now()
  const firstTrade = trades[0]
  const firstTradeT = firstTrade ? findEventTime(events, 'order_filled', firstTrade.id) : 0
  const timeBeforeFirstTradeMs = firstTrade ? Math.max(0, firstTradeT - sessionStart) : 0

  // ── Outcome ─────────────────────────────────────────────
  const realizedPnL = sells.reduce((s, t) => s + t.realizedPnL, 0)
  const finalEquityEvent = [...events].reverse().find(e => e.kind === 'session_end')
  const finalEquity = getNum(finalEquityEvent?.data, 'finalEquity', STARTING_CASH + realizedPnL)
  const dayPnL = finalEquity - STARTING_CASH
  const dayPnLPct = (dayPnL / STARTING_CASH) * 100
  const winCount = winners.length
  const lossCount = losers.length
  const winRate = sellRecords.length > 0 ? winCount / sellRecords.length : 0

  return {
    tradeCount: trades.length,
    buyCount: buys.length,
    sellCount: sells.length,
    slUsageRate,
    thesisRate,
    avgThesisLength,
    pauseToThinkRate,
    avgPositionSizePct,
    maxPositionSizePct,
    oversizedTradeCount,
    panicSellCount: panicSell,
    fomoBuyCount: fomoBuy,
    newsReflexCount: newsReflex,
    revengeTradeCount: revenge,
    avgWinnerHoldMs,
    avgLoserHoldMs,
    dispositionRatio,
    newsViewedRate,
    pauseMinutes,
    symbolsTouched: symbolFocus.size,
    timeBeforeFirstTradeMs,
    realizedPnL,
    finalEquity,
    startingCash: STARTING_CASH,
    dayPnL,
    dayPnLPct,
    winCount,
    lossCount,
    winRate,
    trades,
  }
}

// ── Helpers ──────────────────────────────────────────────────

function findEventTime(events: TraceEvent[], kind: TraceEvent['kind'], orderId: string): number {
  const e = events.find(ev => ev.kind === kind && (ev.data?.orderId === orderId || ev.data?.id === orderId))
  return e?.t ?? 0
}

function matchingBuyTime(events: TraceEvent[], sellOrderId: string, trades: TradeRecord[]): number {
  // Find the BUY trade for the same symbol that preceded this SELL
  const sell = trades.find(t => t.id === sellOrderId)
  if (!sell) return 0
  const prevBuy = trades
    .filter(t => t.side === 'BUY' && t.symbol === sell.symbol && t.filledAtMin <= sell.filledAtMin)
    .pop()
  return prevBuy ? findEventTime(events, 'order_filled', prevBuy.id) : 0
}
