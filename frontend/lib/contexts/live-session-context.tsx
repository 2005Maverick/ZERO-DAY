'use client'

import { createContext, useContext, useEffect, useReducer, useRef, useCallback, useMemo, type ReactNode } from 'react'
import type { LiveSessionState } from '@/types/live'
import { COV20_TIMELINE, COV20_INDICES } from '@/lib/data/scenarios/cov-20/timeline'
import { COV20_NEWS_EVENTS, COV20_WHISPERS } from '@/lib/data/scenarios/cov-20/live-events'
import {
  reducer, initialState, getPriceAtMinute, STARTING_CASH, SYMBOLS, type Action,
} from '@/lib/engine/live-reducer'
import { withJournal, emptyJournal, type JournalEntry } from '@/lib/session/journal'

// The engine itself lives in lib/engine/live-reducer.ts (no 'use client', so the server can replay it).
export { reducer, initialState, type Action }

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
  /** Every non-TICK action with the minute it was applied at (3.3): synced to session_actions. */
  journal: JournalEntry<Action>[]
}

const LiveSessionContext = createContext<LiveSessionContextValue | null>(null)

// Records each user action inside the reducer, so the logged minute is exact (ADR-005).
const journaledReducer = withJournal(reducer)

export function LiveSessionProvider({ children }: { children: ReactNode }) {
  const [journaled, dispatch] = useReducer(journaledReducer, undefined, () => emptyJournal<LiveSessionState, Action>(initialState()))
  const state = journaled.live
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
    journal: journaled.entries,
  }), [state, journaled.entries, ltp, prevClose, pctChange, totalEquity, dayPnL, dayPnLPct, positionsValue, marginUsed, getBars, getIndexLatest, pendingNews, whisperForMinute])

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
