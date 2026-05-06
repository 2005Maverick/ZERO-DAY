'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

import { LEDGER_CASES, getCase } from '@/lib/data/ledger-cases'
import { useUser } from '@/lib/contexts/user-context'

import { LedgerHud } from '@/components/ledger/ledger-hud'
import { VolumeStrip } from '@/components/ledger/volume-strip'
import { BookmarkShelf } from '@/components/ledger/bookmark-shelf'
import { InsideCover } from '@/components/ledger/inside-cover'
import { BookFrame } from '@/components/ledger/book-frame'
import { MarketChronicleTicker } from '@/components/ledger/market-chronicle-ticker'
import { BriefingOverlay } from '@/components/ledger/briefing-overlay'

import { SimulationCaseRenderer } from '@/components/ledger/case-renderers/simulation-case'
import { LectureCaseRenderer }   from '@/components/ledger/case-renderers/lecture-case'
import { DrillCaseRenderer }     from '@/components/ledger/case-renderers/drill-case'
import { AnalysisCaseRenderer }  from '@/components/ledger/case-renderers/analysis-case'
import { ProfileCaseRenderer }   from '@/components/ledger/case-renderers/profile-case'
import { AchievementCaseRenderer } from '@/components/ledger/case-renderers/achievement-case'

import type { Case, SimulationCase } from '@/types/ledger'

// Default shelf for Vol III simulation cases (when on the simulation volume).
const SIM_SHELF_CASE_IDS = ['COV-20', 'LEH-08', 'GME-21', 'BRX-16', 'SVB-23', 'FLC-10']

// Volume → human label for the shelf header.
const VOLUME_LABEL: Record<string, string> = {
  'I':   'Lectures · Vol I',
  'II':  'Drills · Vol II',
  'III': 'Simulations · Vol III',
  'IV':  'Analyses · Vol IV',
  'V':   'Trader Profiles · Vol V',
  'VI':  'Achievements · Vol VI',
}

/** All cases use the same Blender-rendered ORUS briefing animation. */
function briefingVideoFor(_caseId: string): string {
  return `/videos/orus-briefing-render.mp4`
}

function LedgerInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { user } = useUser()
  const [mounted, setMounted] = useState(false)
  const [briefingFor, setBriefingFor] = useState<SimulationCase | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const tier = user?.stats?.knowledgeLevel || 'Beginner'
  const defaultCase = tier === 'Beginner' ? 1 : 35
  const requested = Number(params.get('case'))
  const currentCaseNumber = Number.isFinite(requested) && requested > 0 ? requested : defaultCase

  const currentCase = getCase(currentCaseNumber) ?? LEDGER_CASES[0]
  const shelfCases = useMemo(() => {
    const vol = currentCase.volume
    // Vol III simulations: use the curated featured list
    if (vol === 'III') {
      return SIM_SHELF_CASE_IDS
        .map(id => LEDGER_CASES.find(c => c.id === id))
        .filter(Boolean) as Case[]
    }
    // Other volumes: show all cases in this volume (excluding chapter dividers), capped
    return LEDGER_CASES
      .filter(c => c.volume === vol && c.type !== 'chapter-divider')
      .slice(0, 10)
  }, [currentCase.volume])
  const shelfLabel = VOLUME_LABEL[currentCase.volume] ?? 'Left Sidebar'

  const goToCase = (n: number) => {
    const clamped = Math.max(1, Math.min(LEDGER_CASES.length, n))
    router.push(`/ledger?case=${clamped}`, { scroll: false })
  }

  const launchBriefing = (sim: SimulationCase): void => {
    setBriefingFor(sim)
  }

  const finishBriefing = (): void => {
    const sim = briefingFor
    setBriefingFor(null)
    if (sim) router.push(`/sim/${sim.id}/prep`)
  }

  const renderCurrentCase = (c: Case) => {
    switch (c.type) {
      case 'simulation':
        return <SimulationCaseRenderer ledgerCase={c} onOpen={() => launchBriefing(c)} />
      case 'lecture':         return <LectureCaseRenderer ledgerCase={c} />
      case 'drill':           return <DrillCaseRenderer ledgerCase={c} />
      case 'analysis':        return <AnalysisCaseRenderer ledgerCase={c} />
      case 'profile':         return <ProfileCaseRenderer ledgerCase={c} />
      case 'achievement':     return <AchievementCaseRenderer ledgerCase={c} />
      case 'chapter-divider': return (
        <div style={{
          padding: '40px', textAlign: 'center',
          fontFamily: 'Garamond, serif', fontStyle: 'italic',
          color: '#1a1a1a',
        }}>
          Chapter divider — Volume {c.volume}
        </div>
      )
      default: return null
    }
  }

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#1A1208' }} />

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1A1208',
      color: '#E8DFC8',
      fontFamily: 'var(--font-geist-sans), sans-serif',
      display: 'flex',
      flexDirection: 'column',
      // Subtle wood-grain hint via radial gradients
      backgroundImage: `
        radial-gradient(ellipse at 25% 15%, rgba(60,30,15,0.5) 0%, transparent 55%),
        radial-gradient(ellipse at 75% 85%, rgba(60,30,15,0.4) 0%, transparent 55%)
      `,
    }}>
      {/* HUD (now includes the nav strip in its second row) */}
      <LedgerHud totalCases={LEDGER_CASES.length} currentCase={currentCaseNumber} />

      {/* Volume jump-strip — chapter tabs into the book */}
      <VolumeStrip currentCaseNumber={currentCaseNumber} onJumpToVolume={goToCase} />

      {/* Hero greeting band */}
      <div style={{
        textAlign: 'center',
        padding: '32px 24px 8px',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '10px',
          letterSpacing: '0.28em',
          color: '#DC2626',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: '14px',
        }}>
          <span style={{ width: '32px', height: '1px', background: '#DC2626' }} />
          14:32 IST · Currently Reading
          <span style={{ width: '32px', height: '1px', background: '#DC2626' }} />
        </div>
        <h1 style={{
          fontFamily: 'Garamond, "EB Garamond", "Times New Roman", serif',
          fontSize: 'clamp(28px, 3.4vw, 44px)',
          fontStyle: 'italic',
          color: '#E8DFC8',
          margin: '0 0 8px',
          lineHeight: 1.1,
        }}>
          What chapter would you like to study?
        </h1>
        <p style={{
          fontFamily: 'Garamond, serif',
          fontSize: '14px',
          color: 'rgba(232,223,200,0.55)',
          margin: 0,
        }}>
          Open any case file. Read the brief. Trade the day.
        </p>
      </div>

      {/* Main 3-column layout */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: '0',
        padding: '0 8px',
        maxWidth: '1480px',
        margin: '0 auto',
        width: '100%',
      }}>
        <BookmarkShelf
          shelfCases={shelfCases}
          currentCaseNumber={currentCaseNumber}
          onSelectCase={goToCase}
          onBrowseAll={() => goToCase(1)}
          volumeLabel={shelfLabel}
        />

        <BookFrame
          caseNumber={currentCaseNumber}
          totalCases={LEDGER_CASES.length}
          onPrev={() => goToCase(currentCaseNumber - 1)}
          onNext={() => goToCase(currentCaseNumber + 1)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCase.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{ width: '100%', height: '100%' }}
            >
              {renderCurrentCase(currentCase)}
            </motion.div>
          </AnimatePresence>
        </BookFrame>

        <InsideCover onContinue={() => goToCase(currentCaseNumber + 1)} />
      </main>

      {/* Spacer above ticker */}
      <div style={{ height: '32px' }} />

      <MarketChronicleTicker />

      {/* ═══════════ ORUS BRIEFING OVERLAY ═══════════ */}
      <AnimatePresence>
        {briefingFor && (
          <BriefingOverlay
            videoSrc={briefingVideoFor(briefingFor.id)}
            caseCode={briefingFor.id}
            caseTitle={briefingFor.title}
            onComplete={finishBriefing}
            onSkip={finishBriefing}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LedgerPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#1A1208' }} />}>
      <LedgerInner />
    </Suspense>
  )
}
