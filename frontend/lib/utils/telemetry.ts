import type { TelemetryEvent } from '@/types/scenario'

// ============================================================================
// PREP ROOM TELEMETRY
// ============================================================================
// Silent behavioral tracking. Stored in localStorage for v1, can be pushed to
// Supabase later. Drives the post-session debrief ("ORUS will know").
// ============================================================================

const STORAGE_PREFIX = 'zdm_prep_telemetry'

function key(scenarioId: string): string {
  return `${STORAGE_PREFIX}_${scenarioId}`
}

interface SessionLog {
  scenarioId: string
  startedAt: number          // Unix ms
  events: (TelemetryEvent & { atMs: number })[]
}

function loadSession(scenarioId: string): SessionLog {
  if (typeof window === 'undefined') {
    return { scenarioId, startedAt: Date.now(), events: [] }
  }
  try {
    const raw = window.localStorage.getItem(key(scenarioId))
    if (raw) return JSON.parse(raw)
  } catch { /* fall through */ }
  return { scenarioId, startedAt: Date.now(), events: [] }
}

function saveSession(log: SessionLog): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key(log.scenarioId), JSON.stringify(log))
  } catch { /* storage full */ }
}

export function startPrepSession(scenarioId: string): void {
  if (typeof window === 'undefined') return
  // Only start a fresh session if one doesn't already exist for this scenario
  const existing = loadSession(scenarioId)
  if (existing.events.length === 0) {
    saveSession({ scenarioId, startedAt: Date.now(), events: [] })
  }
}

export function logTelemetry(scenarioId: string, event: TelemetryEvent): void {
  if (typeof window === 'undefined') return
  const log = loadSession(scenarioId)
  const atMs = Date.now() - log.startedAt
  log.events.push({ ...event, atMs })
  saveSession(log)
}

export function getSession(scenarioId: string): SessionLog | null {
  if (typeof window === 'undefined') return null
  return loadSession(scenarioId)
}

export function clearSession(scenarioId: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key(scenarioId))
  } catch { /* ignore */ }
}

// ─── Aggregate helpers for the Debrief screen later ──────────

export function summarizeSession(scenarioId: string): {
  totalDurationMs: number
  artifactsViewed: Record<string, number>      // 'INDIGO:price-chart' → ms
  tutorOpensCount: number
  studiedArtifacts: string[]                    // 'INDIGO:price-chart'
  blurEvents: number
  totalAllocationChanges: number
  finalAllocations: Record<string, number>
  unstudiedAtDeploy: string[]
  deployTimeSec: number | null
} {
  const log = loadSession(scenarioId)
  const summary = {
    totalDurationMs: 0,
    artifactsViewed: {} as Record<string, number>,
    tutorOpensCount: 0,
    studiedArtifacts: [] as string[],
    blurEvents: 0,
    totalAllocationChanges: 0,
    finalAllocations: {} as Record<string, number>,
    unstudiedAtDeploy: [] as string[],
    deployTimeSec: null as number | null,
  }
  for (const e of log.events) {
    summary.totalDurationMs = Math.max(summary.totalDurationMs, e.atMs)
    if (e.type === 'artifact-view') {
      const k = `${e.stock}:${e.artifact}`
      summary.artifactsViewed[k] = (summary.artifactsViewed[k] || 0) + e.durationMs
    }
    if (e.type === 'tutor-open') summary.tutorOpensCount++
    if (e.type === 'tutor-marked-studied') summary.studiedArtifacts.push(`${e.stock}:${e.artifact}`)
    if (e.type === 'tab-blur') summary.blurEvents++
    if (e.type === 'allocation-change') {
      summary.totalAllocationChanges++
      summary.finalAllocations[e.stock] = e.rupees
    }
    if (e.type === 'deploy-clicked') {
      summary.deployTimeSec = e.timeToDeploySec
    }
  }
  return summary
}
