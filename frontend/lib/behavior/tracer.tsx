'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { TraceEvent, EventKind } from './types'

const STORAGE_KEY = 'zdm-trace'

interface TraceState {
  sessionId: string
  startedAt: number
  events: TraceEvent[]
}

interface TracerContextValue {
  sessionId: string
  events: TraceEvent[]
  track: (kind: EventKind, simMinute: number, data?: Record<string, unknown>) => void
  reset: () => void
  load: () => TraceState | null
}

const TracerContext = createContext<TracerContextValue | null>(null)

function readPersisted(): TraceState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as TraceState
    if (!parsed.sessionId || !Array.isArray(parsed.events)) return null
    return parsed
  } catch {
    return null
  }
}

function persist(state: TraceState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full or disabled — silently degrade
  }
}

export function TracerProvider({ children }: { children: ReactNode }) {
  // Always start a fresh session on provider mount; previous session can be
  // recovered via load() (used by the debrief page).
  const [sessionId] = useState(() => `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`)
  const startedAtRef = useRef(Date.now())
  const [events, setEvents] = useState<TraceEvent[]>([])

  // Persist to localStorage on every event push
  useEffect(() => {
    persist({ sessionId, startedAt: startedAtRef.current, events })
  }, [events, sessionId])

  const track = useCallback((kind: EventKind, simMinute: number, data?: Record<string, unknown>) => {
    const event: TraceEvent = {
      t: Date.now(),
      simMinute,
      kind,
      ...(data ? { data } : {}),
    }
    setEvents(prev => [...prev, event])
  }, [])

  const reset = useCallback(() => {
    setEvents([])
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
    }
  }, [])

  const load = useCallback(() => readPersisted(), [])

  return (
    <TracerContext.Provider value={{ sessionId, events, track, reset, load }}>
      {children}
    </TracerContext.Provider>
  )
}

export function useTracer(): TracerContextValue {
  const ctx = useContext(TracerContext)
  if (!ctx) throw new Error('useTracer must be used inside TracerProvider')
  return ctx
}

// Standalone reader (works even without provider — used by debrief page on mount)
export function readTrace(): TraceState | null {
  return readPersisted()
}
