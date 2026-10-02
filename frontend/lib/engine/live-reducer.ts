// The live-trading engine (Bhavya's FSM): initial state, actions, reducer.
// Moved verbatim out of lib/contexts/live-session-context.tsx (2026-10-02,
// by Claude at Bhavya's request) so it has no 'use client' boundary: the
// server must be able to replay sessions through it (P1, ADR-005) and Monitor
// (2.1) runs on both sides. Must stay pure: same state + action → same result.

import type { LiveSessionState, Order, Position } from '@/types/live'
import { COV20_TIMELINE } from '@/lib/data/scenarios/cov-20/timeline'
import { COV20_CIRCUITS } from '@/lib/data/scenarios/cov-20/live-events'

// ─── Initial state ──────────────────────────────────────────

export const STARTING_CASH = 100000
export const SESSION_MINUTES = 375        // 9:15 → 15:30 IST
export const SYMBOLS = ['INDIGO', 'SUNPHARMA', 'RELIANCE', 'HDFCBANK', 'TITAN', 'TCS']

export function initialState(): LiveSessionState {
  return {
    scenarioId: 'COV-20',
    status: 'PRE_OPEN',
    currentMinute: 0,
    speed: 5,
    activeSymbol: 'INDIGO',
    cash: STARTING_CASH,
    positions: {},
    orders: [],
    realisedPnL: 0,
    firedNewsIds: [],
    currentHalt: null,
    equityCurve: [],
    started: false,
    coachShown: { orderType: false, stopLoss: false, sizing: false },
  }
}

// ─── Action types ───────────────────────────────────────────

export type Action =
  | { type: 'TICK' }
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'END' }
  | { type: 'SKIP_HALT' }
  | { type: 'SET_SPEED'; speed: 1 | 5 | 10 }
  | { type: 'SET_ACTIVE'; symbol: string }
  | { type: 'PLACE_ORDER'; order: Omit<Order, 'id' | 'status' | 'placedAtMin'> }
  | { type: 'CANCEL_ORDER'; id: string }
  | { type: 'SET_STOP'; symbol: string; stopPrice: number | null }
  | { type: 'MARK_COACH_SHOWN'; coach: 'orderType' | 'stopLoss' | 'sizing' }

// ─── Helpers ────────────────────────────────────────────────

export function getPriceAtMinute(symbol: string, minute: number): number {
  const tl = COV20_TIMELINE[symbol]
  if (!tl) return 0
  // Find the bar covering this minute
  const idx = Math.min(tl.bars.length - 1, Math.floor(minute / 5))
  return tl.bars[idx]?.close ?? tl.prevClose
}

function snapshotPositions(positions: Record<string, Position>, atMinute: number): {
  totalValue: number; unrealised: number
} {
  let totalValue = 0
  let unrealised = 0
  for (const sym in positions) {
    const p = positions[sym]
    if (!p.qty) continue
    const ltp = getPriceAtMinute(sym, atMinute)
    totalValue += Math.abs(p.qty) * ltp
    unrealised += p.qty * (ltp - p.avgPrice)
  }
  return { totalValue, unrealised }
}

// ─── Reducer ────────────────────────────────────────────────

export function reducer(state: LiveSessionState, action: Action): LiveSessionState {
  switch (action.type) {
    case 'START':
      return { ...state, status: 'LIVE', started: true }

    case 'PAUSE':
      return state.status === 'LIVE' ? { ...state, status: 'PAUSED' } : state

    case 'RESUME':
      return state.status === 'PAUSED' ? { ...state, status: 'LIVE' } : state

    case 'END':
      return { ...state, status: 'CLOSED' }

    case 'SET_SPEED':
      return { ...state, speed: action.speed }

    case 'SET_ACTIVE':
      return { ...state, activeSymbol: action.symbol }

    case 'MARK_COACH_SHOWN':
      return { ...state, coachShown: { ...state.coachShown, [action.coach]: true } }

    case 'SKIP_HALT': {
      if (!state.currentHalt) return state
      // Jump time forward to halt end, resume LIVE
      const next = state.currentHalt.endsAtMin
      return { ...state, currentMinute: next, currentHalt: null, status: 'LIVE' }
    }

    case 'TICK': {
      // PAUSED / CLOSED / PRE_OPEN → no time progression
      if (state.status !== 'LIVE' && state.status !== 'HALTED') return state

      const next = state.currentMinute + 1
      if (next >= SESSION_MINUTES) {
        // Square off at close
        const close = squareOffAtMinute(state, SESSION_MINUTES - 1)
        return { ...close, currentMinute: SESSION_MINUTES, status: 'CLOSED' }
      }

      let working: LiveSessionState = { ...state, currentMinute: next }

      // Check circuit halt expiry FIRST (before testing for new circuits)
      if (working.currentHalt && next >= working.currentHalt.endsAtMin) {
        working = { ...working, currentHalt: null, status: 'LIVE' }
      }

      // Check new circuits — only fire if we\'re not already in one
      for (const c of COV20_CIRCUITS) {
        if (c.fireAt === next && !working.currentHalt) {
          working = {
            ...working,
            currentHalt: { startedAtMin: next, endsAtMin: next + c.haltMinutes, level: c.level },
            status: 'HALTED',
          }
        }
      }

      // Match pending orders only when actively LIVE (not halted)
      if (working.status === 'LIVE') {
        working = matchOrders(working)
      }

      // Capture equity point every minute
      const snap = snapshotPositions(working.positions, working.currentMinute)
      const equity = working.cash + snap.totalValue
      const last = working.equityCurve[working.equityCurve.length - 1]
      if (!last || working.currentMinute - last.minute >= 1) {
        working = {
          ...working,
          equityCurve: [...working.equityCurve, { minute: working.currentMinute, equity }],
        }
      }

      return working
    }

    case 'PLACE_ORDER': {
      if (state.status !== 'LIVE' && state.status !== 'PAUSED') return state
      const order: Order = {
        ...action.order,
        // Deterministic (3.3, ADR-005): replay must recreate the same ids. Orders are never removed.
        id: `o${state.orders.length + 1}`,
        status: 'PENDING',
        placedAtMin: state.currentMinute,
      }
      // Validate funds for BUY
      if (order.side === 'BUY') {
        const refPrice = order.price ?? getPriceAtMinute(order.symbol, state.currentMinute)
        const cost = order.quantity * refPrice
        if (cost > state.cash) {
          // Reject
          return {
            ...state,
            orders: [...state.orders, { ...order, status: 'REJECTED', reason: 'Insufficient funds' }],
          }
        }
      }
      // Validate qty for SELL
      if (order.side === 'SELL') {
        const pos = state.positions[order.symbol]
        if (!pos || pos.qty < order.quantity) {
          return {
            ...state,
            orders: [...state.orders, { ...order, status: 'REJECTED', reason: 'Position too small to sell' }],
          }
        }
      }
      const withOrder = { ...state, orders: [...state.orders, order] }
      // For MARKET orders, fill immediately
      if (order.type === 'MARKET') {
        return matchOrders(withOrder)
      }
      return withOrder
    }

    case 'CANCEL_ORDER':
      return {
        ...state,
        orders: state.orders.map(o =>
          o.id === action.id && o.status === 'PENDING' ? { ...o, status: 'CANCELLED' } : o,
        ),
      }

    case 'SET_STOP': {
      const pos = state.positions[action.symbol]
      if (!pos) return state
      return {
        ...state,
        positions: {
          ...state.positions,
          [action.symbol]: { ...pos, stopPrice: action.stopPrice ?? undefined },
        },
      }
    }
  }
}

// Match all pending orders against current tick
function matchOrders(state: LiveSessionState): LiveSessionState {
  let cash = state.cash
  let positions = { ...state.positions }
  let realisedPnL = state.realisedPnL
  const orders = state.orders.map(o => {
    if (o.status !== 'PENDING') return o
    const price = getPriceAtMinute(o.symbol, state.currentMinute)
    let fill = false
    let fillPrice = price
    if (o.type === 'MARKET') { fill = true }
    else if (o.type === 'LIMIT') {
      if (o.side === 'BUY' && price <= (o.price ?? Infinity)) { fill = true; fillPrice = Math.min(price, o.price!) }
      else if (o.side === 'SELL' && price >= (o.price ?? 0))   { fill = true; fillPrice = Math.max(price, o.price!) }
    } else if (o.type === 'SL' || o.type === 'SL-M') {
      // Trigger logic
      const trig = o.triggerPrice ?? 0
      if (o.side === 'SELL' && price <= trig) { fill = true; fillPrice = o.type === 'SL-M' ? price : (o.price ?? price) }
      else if (o.side === 'BUY' && price >= trig) { fill = true; fillPrice = o.type === 'SL-M' ? price : (o.price ?? price) }
    }
    if (!fill) return o

    // Apply fill to portfolio
    const cost = o.quantity * fillPrice
    if (o.side === 'BUY') {
      const cur = positions[o.symbol]
      if (cur && cur.qty > 0) {
        const newQty = cur.qty + o.quantity
        const newAvg = ((cur.qty * cur.avgPrice) + cost) / newQty
        positions[o.symbol] = { ...cur, qty: newQty, avgPrice: newAvg }
      } else {
        positions[o.symbol] = {
          symbol: o.symbol, qty: o.quantity, avgPrice: fillPrice, realisedPnL: 0,
        }
      }
      cash -= cost
    } else {
      // SELL
      const cur = positions[o.symbol]
      if (cur) {
        const closeQty = Math.min(cur.qty, o.quantity)
        const realised = (fillPrice - cur.avgPrice) * closeQty
        realisedPnL += realised
        const remaining = cur.qty - closeQty
        if (remaining <= 0) {
          delete positions[o.symbol]
        } else {
          positions[o.symbol] = { ...cur, qty: remaining }
        }
        cash += closeQty * fillPrice
      }
    }
    return { ...o, status: 'FILLED' as const, filledAtMin: state.currentMinute, filledPrice: fillPrice }
  })

  return { ...state, orders, cash, positions, realisedPnL }
}

// Square off all positions at end of session
function squareOffAtMinute(state: LiveSessionState, minute: number): LiveSessionState {
  let cash = state.cash
  let realisedPnL = state.realisedPnL
  for (const sym in state.positions) {
    const p = state.positions[sym]
    if (!p.qty) continue
    const ltp = getPriceAtMinute(sym, minute)
    const realised = (ltp - p.avgPrice) * p.qty
    realisedPnL += realised
    cash += p.qty * ltp
  }
  return { ...state, cash, positions: {}, realisedPnL }
}
