'use client'

import { createContext, useContext, useEffect, useReducer, useRef, useCallback, useMemo, type ReactNode } from 'react'
import type {
  LiveSessionState, Order, OrderSide, OrderType, OrderValidity,
  Position, SessionStatus, EquityPoint,
} from '@/types/live'
import { COV20_TIMELINE, COV20_INDICES } from '@/lib/data/scenarios/cov-20/timeline'
import { COV20_NEWS_EVENTS, COV20_CIRCUITS, COV20_WHISPERS } from '@/lib/data/scenarios/cov-20/live-events'

// ─── Initial state ──────────────────────────────────────────

const STARTING_CASH = 100000
const SESSION_MINUTES = 375        // 9:15 → 15:30 IST
const SYMBOLS = ['INDIGO', 'SUNPHARMA', 'RELIANCE', 'HDFCBANK', 'TITAN', 'TCS']

function initialState(): LiveSessionState {
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

type Action =
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

function getPriceAtMinute(symbol: string, minute: number): number {
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

function reducer(state: LiveSessionState, action: Action): LiveSessionState {
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
        id: `o_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
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

// ─── Context ────────────────────────────────────────────────

interface LiveSessionContextValue {
  state: LiveSessionState
  dispatch: React.Dispatch<Action>
  // selectors
  ltp: (symbol: string) => number
  prevClose: (symbol: string) => number
  pctChange: (symbol: string) => number
  totalEquity: number
  dayPnL: number
  dayPnLPct: number
  positionsValue: number
  marginUsed: number
  // helpers
  getBars: (symbol: string) => typeof COV20_TIMELINE[string]['bars']
  getIndexLatest: (key: string) => { value: number; pctChange: number }
  pendingNews: () => typeof COV20_NEWS_EVENTS
  whisperForMinute: (minute: number) => (typeof COV20_WHISPERS)[number] | undefined
  symbols: string[]
}

const LiveSessionContext = createContext<LiveSessionContextValue | null>(null)

export function LiveSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const tickRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-start on mount
  useEffect(() => {
    if (!state.started) dispatch({ type: 'START' })
  }, [state.started])

  // Tick loop based on speed
  useEffect(() => {
    if (state.status !== 'LIVE' && state.status !== 'HALTED') {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
      return
    }
    // 1 simulated minute every X ms based on speed
    // 1× = 1500ms (real-time-ish); 5× = 300ms; 10× = 150ms
    const ms = state.speed === 1 ? 1500 : state.speed === 5 ? 300 : 150
    tickRef.current = setInterval(() => {
      dispatch({ type: 'TICK' })
    }, ms)
    return () => {
      if (tickRef.current) clearInterval(tickRef.current)
      tickRef.current = null
    }
  }, [state.status, state.speed])

  // ─── Selectors ────────────────────────────────────────────
  const ltp = useCallback((symbol: string) => getPriceAtMinute(symbol, state.currentMinute), [state.currentMinute])
  const prevClose = useCallback((symbol: string) => COV20_TIMELINE[symbol]?.prevClose ?? 0, [])
  const pctChange = useCallback((symbol: string) => {
    const pc = COV20_TIMELINE[symbol]?.prevClose ?? 0
    if (pc === 0) return 0
    return ((getPriceAtMinute(symbol, state.currentMinute) - pc) / pc) * 100
  }, [state.currentMinute])

  const positionsValue = useMemo(() => {
    let v = 0
    for (const sym in state.positions) {
      v += Math.abs(state.positions[sym].qty) * ltp(sym)
    }
    return v
  }, [state.positions, ltp])

  const marginUsed = useMemo(() => {
    // Simple model: 25% margin used = position value × 0.25
    return positionsValue * 0.25
  }, [positionsValue])

  const totalEquity = state.cash + positionsValue
  const dayPnL = totalEquity - STARTING_CASH
  const dayPnLPct = (dayPnL / STARTING_CASH) * 100

  const getBars = useCallback((symbol: string) => {
    return COV20_TIMELINE[symbol]?.bars ?? []
  }, [])

  const getIndexLatest = useCallback((key: string) => {
    const arr = COV20_INDICES[key] ?? []
    if (arr.length === 0) return { value: 0, pctChange: 0 }
    const idx = Math.min(arr.length - 1, Math.floor(state.currentMinute / 5))
    return { value: arr[idx].value, pctChange: arr[idx].pctChange * 100 }
  }, [state.currentMinute])

  const pendingNews = useCallback(() => {
    return COV20_NEWS_EVENTS.filter(n => n.fireAt <= state.currentMinute)
  }, [state.currentMinute])

  const whisperForMinute = useCallback((minute: number) => {
    return COV20_WHISPERS.find(w => Math.abs(w.fireAt - minute) <= 1)
  }, [])

  const value = useMemo<LiveSessionContextValue>(() => ({
    state, dispatch,
    ltp, prevClose, pctChange,
    totalEquity, dayPnL, dayPnLPct, positionsValue, marginUsed,
    getBars, getIndexLatest, pendingNews, whisperForMinute,
    symbols: SYMBOLS,
  }), [state, ltp, prevClose, pctChange, totalEquity, dayPnL, dayPnLPct, positionsValue, marginUsed, getBars, getIndexLatest, pendingNews, whisperForMinute])

  return <LiveSessionContext.Provider value={value}>{children}</LiveSessionContext.Provider>
}

export function useLiveSession(): LiveSessionContextValue {
  const ctx = useContext(LiveSessionContext)
  if (!ctx) throw new Error('useLiveSession must be used inside LiveSessionProvider')
  return ctx
}

// Format minute since 9:15 → HH:MM IST
export function fmtIST(minute: number): string {
  const totalMin = 9 * 60 + 15 + minute
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
