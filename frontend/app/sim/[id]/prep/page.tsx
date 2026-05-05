'use client'

import { use, useEffect, useMemo, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { ArtifactType, ScenarioStock } from '@/types/scenario'
import { COV20_SCENARIO } from '@/lib/data/scenarios/cov-20'
import { COV20_COMPANIES } from '@/lib/data/scenarios/cov-20/companies'
import { PrepBackdrop } from '@/components/prep/prep-backdrop'
import { PrepBanner } from '@/components/prep/prep-banner'
import { StockCardGrid } from '@/components/prep/stock-card-grid'
import { HeraldicIntel } from '@/components/prep/heraldic-intel'
import { TapeTicker } from '@/components/prep/tape-ticker'
import { TutorDrawer } from '@/components/prep/tutor-drawer'
import { DossierModal, type DossierTab } from '@/components/prep/dossier-modal'
import { EnterLiveCTA } from '@/components/prep/enter-live-cta'
import {
  startPrepSession,
  logTelemetry,
} from '@/lib/utils/telemetry'

const SCENARIOS = { 'COV-20': COV20_SCENARIO } as const

const ARTIFACT_ORDER: ArtifactType[] = [
  'price-chart',
  'key-metrics',
  'balance-sheet',
  'news-24h',
  'holdings',
  'sector-position',
]

const TAB_TO_ARTIFACT: Record<DossierTab, ArtifactType> = {
  chart:        'price-chart',
  technicals:   'price-chart',
  fundamentals: 'key-metrics',
  news:         'news-24h',
  company:      'balance-sheet',
  sector:       'sector-position',
}

function StudiedRing({ studied, total }: { studied: number; total: number }) {
  const pct = total > 0 ? studied / total : 0
  const r = 11, c = 2 * Math.PI * r
  return (
    <svg width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r={r} fill="none" stroke="rgba(212,160,77,0.22)" strokeWidth="2"/>
      <circle cx="14" cy="14" r={r} fill="none" stroke="#D4A04D" strokeWidth="2"
              strokeDasharray={`${pct * c} ${c}`} strokeLinecap="round"
              transform="rotate(-90 14 14)" />
    </svg>
  )
}

function dateToRoman(dateStr: string): string {
  const m = dateStr.match(/^0?(\d+)\s+(\w+)\s+(\d+)$/)
  if (!m) return dateStr
  const day = m[1]
  const month = m[2]
  const yyyy = parseInt(m[3], 10)
  const yy = yyyy - 2000
  const roman = `MM${'X'.repeat(Math.floor(yy / 10))}${['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][yy % 10]}`
  return `${day} ${month} ${roman}`
}

type StudiedSet = Record<string, true>

export default function PrepRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: _id } = use(params)
  const router = useRouter()

  const scenario = SCENARIOS['COV-20']
  const stocks = scenario.stocks

  const [openSymbol, setOpenSymbol] = useState<string | null>(null)
  const [studied, setStudied] = useState<StudiedSet>({})
  const [tutorOpenFor, setTutorOpenFor] = useState<{ symbol: string; artifact: ArtifactType } | null>(null)
  const startedAtRef = useState(() => Date.now())[0]

  useEffect(() => { startPrepSession(scenario.id) }, [scenario.id])

  useEffect(() => {
    let blurStart: number | null = null
    function onVisibility() {
      if (document.hidden) blurStart = Date.now()
      else if (blurStart) {
        const dur = Date.now() - blurStart
        if (dur > 500) logTelemetry(scenario.id, { type: 'tab-blur', durationMs: dur })
        blurStart = null
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [scenario.id])

  const studiedCounts = useMemo<Record<string, number>>(() => {
    const out: Record<string, number> = {}
    for (const s of stocks) {
      out[s.symbol] = ARTIFACT_ORDER.reduce(
        (n, a) => n + (studied[`${s.symbol}:${a}`] ? 1 : 0),
        0,
      )
    }
    return out
  }, [stocks, studied])

  const fullyStudiedStocks = stocks.filter(s => studiedCounts[s.symbol] >= ARTIFACT_ORDER.length).length
  const totalStockSlots = stocks.length

  const openStock: ScenarioStock | null = openSymbol
    ? stocks.find(s => s.symbol === openSymbol) ?? null
    : null
  const openCompany = openSymbol ? COV20_COMPANIES[openSymbol] ?? null : null

  // ─── handlers ────────────────────────────────────────────
  const handleOpen = useCallback((symbol: string) => {
    setOpenSymbol(symbol)
    logTelemetry(scenario.id, { type: 'artifact-view', stock: symbol, artifact: 'price-chart', durationMs: 0 })
  }, [scenario.id])

  const handleClose = useCallback(() => setOpenSymbol(null), [])

  const handleTabView = useCallback((symbol: string, tab: DossierTab, durationMs: number) => {
    const artifact = TAB_TO_ARTIFACT[tab]
    logTelemetry(scenario.id, { type: 'artifact-view', stock: symbol, artifact, durationMs })
    if (durationMs >= 3000 && !studied[`${symbol}:${artifact}`]) {
      setStudied(prev => ({ ...prev, [`${symbol}:${artifact}`]: true }))
    }
  }, [scenario.id, studied])

  const handleMarkAllStudied = useCallback((symbol: string) => {
    setStudied(prev => {
      const next = { ...prev }
      for (const a of ARTIFACT_ORDER) {
        const k = `${symbol}:${a}`
        if (!next[k]) {
          next[k] = true
          logTelemetry(scenario.id, { type: 'tutor-marked-studied', stock: symbol, artifact: a })
        }
      }
      return next
    })
  }, [scenario.id])

  const handleTutorOpen = useCallback((symbol: string, tab: DossierTab) => {
    const artifact = TAB_TO_ARTIFACT[tab]
    setTutorOpenFor({ symbol, artifact })
    logTelemetry(scenario.id, { type: 'tutor-open', stock: symbol, artifact })
  }, [scenario.id])

  const handleMarkStudied = useCallback(() => {
    if (!tutorOpenFor) return
    const k = `${tutorOpenFor.symbol}:${tutorOpenFor.artifact}`
    if (!studied[k]) {
      setStudied(prev => ({ ...prev, [k]: true }))
      logTelemetry(scenario.id, {
        type: 'tutor-marked-studied',
        stock: tutorOpenFor.symbol,
        artifact: tutorOpenFor.artifact,
      })
    }
  }, [tutorOpenFor, studied, scenario.id])

  const handleEnterLive = useCallback(() => {
    const timeToDeploySec = Math.floor((Date.now() - startedAtRef) / 1000)
    logTelemetry(scenario.id, {
      type: 'deploy-clicked',
      allocations: {},
      timeToDeploySec,
      unstudiedCount: stocks.length - fullyStudiedStocks,
    })
    router.push(`/sim/${scenario.id}/live`)
  }, [scenario.id, router, startedAtRef, fullyStudiedStocks, stocks.length])

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      color: '#F4EDE0',
    }}>
      <PrepBackdrop />

      {/* Top-left: back link */}
      <div style={{ position: 'absolute', top: '24px', left: '32px', zIndex: 30 }}>
        <button
          onClick={() => router.push('/ledger?case=35')}
          style={{
            background: 'rgba(26,32,40,0.85)',
            border: '1px solid rgba(212,160,77,0.4)',
            borderRadius: '6px',
            padding: '8px 16px',
            color: '#F4EDE0',
            fontFamily: 'var(--font-inter), sans-serif',
            fontWeight: 600,
            fontSize: '12px',
            letterSpacing: '0.18em',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}
        >
          ← Ledger
        </button>
      </div>

      {/* Top-right: studied counter */}
      <div style={{
        position: 'absolute',
        top: '24px',
        right: '32px',
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 16px',
        background: 'rgba(26,32,40,0.85)',
        border: '1px solid rgba(212,160,77,0.4)',
        borderRadius: '999px',
      }}>
        <StudiedRing studied={fullyStudiedStocks} total={totalStockSlots} />
        <span style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontWeight: 700,
          fontSize: '12px',
          color: '#F4EDE0',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
        }}>
          {fullyStudiedStocks} of {totalStockSlots} Studied
        </span>
      </div>

      {/* Top center banner */}
      <div style={{ position: 'relative', zIndex: 20, flexShrink: 0 }}>
        <PrepBanner
          scenarioId={scenario.id}
          scenarioDate={dateToRoman(scenario.date)}
          bellInLabel="58 minutes, 24 seconds"
        />
      </div>

      {/* Stage: 2-col — cards left + macro right */}
      <div style={{
        position: 'relative',
        flex: 1,
        zIndex: 10,
        display: 'grid',
        gridTemplateColumns: '1fr 320px',
        alignItems: 'start',
        padding: '28px 40px 20px',
        gap: '24px',
        minHeight: 0,
      }}>
        <main style={{ minWidth: 0 }}>
          <StockCardGrid
            stocks={stocks}
            studiedCounts={studiedCounts}
            onOpen={handleOpen}
          />
        </main>

        <aside>
          <HeraldicIntel macro={scenario.macro} />
        </aside>
      </div>

      {/* Bottom CTA bar */}
      <div style={{
        position: 'relative',
        zIndex: 20,
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'center',
        padding: '8px 40px 16px',
      }}>
        <EnterLiveCTA
          fullyStudied={fullyStudiedStocks}
          total={totalStockSlots}
          onEnter={handleEnterLive}
        />
      </div>

      {/* Ticker */}
      <div style={{ position: 'relative', zIndex: 20, flexShrink: 0 }}>
        <TapeTicker macro={scenario.macro} preMarketLabel="09:00 IST · BELL IN 60s" />
      </div>

      {/* Dossier modal */}
      <DossierModal
        open={openSymbol !== null}
        onClose={handleClose}
        stock={openStock}
        company={openCompany}
        studied={studied}
        onMarkAllStudied={handleMarkAllStudied}
        onTabView={handleTabView}
        onTutorOpen={handleTutorOpen}
      />

      {/* Tutor drawer (over modal) */}
      <TutorDrawer
        open={tutorOpenFor !== null}
        onClose={() => setTutorOpenFor(null)}
        artifact={tutorOpenFor?.artifact ?? null}
        stock={tutorOpenFor ? stocks.find(s => s.symbol === tutorOpenFor.symbol) ?? null : null}
        scenarioId={scenario.id}
        studied={tutorOpenFor ? !!studied[`${tutorOpenFor.symbol}:${tutorOpenFor.artifact}`] : false}
        onMarkStudied={handleMarkStudied}
      />
    </div>
  )
}
