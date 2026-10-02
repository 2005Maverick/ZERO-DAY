'use client'

import { useEffect, useRef, useState } from 'react'
import { useLiveSession } from '@/lib/contexts/live-session-context'
import { createClient } from '@/lib/supabase/client'
import { DEMO_MODE } from '@/lib/auth/demo'
import { createActionSync, type ActionSync } from './sync'
import { supabaseTransport } from './supabase-transport'

/**
 * Bump when the reducer's behaviour changes: replaying an old log through a
 * newer engine can give different states (ADR-003). Stored on sessions.engine_version.
 * 'cov20.2' = deterministic order ids (ADR-005).
 */
export const ENGINE_VERSION = 'cov20.2'

/**
 * Mounts inside LiveSessionProvider, like TraceBridge. Sends the session journal
 * to Supabase (3.3, ADR-005). Pure observer: never dispatches, never blocks the sim.
 * Off unless a real user is signed in (which also covers demo mode and an
 * unconfigured Supabase, whose stub client has no user).
 */
export function SessionSync() {
  const { state, journal } = useLiveSession()
  const [enabled, setEnabled] = useState<boolean | null>(DEMO_MODE ? false : null)
  const syncRef = useRef<ActionSync | null>(null)

  useEffect(() => {
    if (DEMO_MODE) return
    let cancelled = false
    createClient().auth.getUser()
      .then(({ data }: { data: { user: unknown } }) => { if (!cancelled) setEnabled(!!data.user) })
      .catch(() => { if (!cancelled) setEnabled(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!enabled) return
    // A ref, not state: StrictMode re-runs effects but keeps refs, so one session per mount.
    syncRef.current ??= createActionSync({
      transport: supabaseTransport(createClient(), { scenarioId: state.scenarioId, engineVersion: ENGINE_VERSION }),
      onStatus: (s, detail) => { if (s === 'failed') console.warn('[session-sync] stopped:', detail) },
    })
    syncRef.current.update(journal)
  }, [enabled, journal, state.scenarioId])

  useEffect(() => {
    if (enabled && state.status === 'CLOSED') void syncRef.current?.end()
  }, [enabled, state.status])

  return null
}
