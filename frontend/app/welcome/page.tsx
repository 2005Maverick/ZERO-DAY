'use client'

import { useEffect, useMemo, useState } from 'react'
import { useNavigation } from '@/lib/contexts/navigation-context'
import { useUser } from '@/lib/contexts/user-context'
import { ParticleTextEffect, type ParticleFrame } from '@/components/ui/particle-text-effect'

export default function WelcomePage() {
  const { navigateTo } = useNavigation()
  const { user } = useUser()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const firstName = (user?.firstName || 'TRADER').toUpperCase()
  const tier = user?.stats?.knowledgeLevel || 'Intermediate'
  // The Ledger is the unified destination. Beginners open at Case 001 (first lecture),
  // Intermediates open at Case 035 (LEH-08 — first simulation).
  const destination = tier === 'Beginner' ? '/ledger?case=1' : '/ledger?case=35'

  const handleComplete = (): void => {
    navigateTo(destination)
  }

  const frames: ParticleFrame[] = useMemo(() => [
    // 01 — personal welcome (huge text, lots of particles to assemble — needs the most settle time)
    {
      lines: [
        { text: `WELCOME, ${firstName}.`, size: 'huge' },
      ],
      durationMs: 7000,
    },
    // 02 — Keynes (longest quote, needs the most time to read)
    {
      lines: [
        { text: '"MARKETS CAN STAY IRRATIONAL', size: 'medium' },
        { text: 'LONGER THAN YOU CAN STAY SOLVENT."', size: 'medium' },
        { text: '— JOHN MAYNARD KEYNES', size: 'small' },
      ],
      durationMs: 6500,
    },
    // 03 — Dalio (short but heavy)
    {
      lines: [
        { text: '"PAIN + REFLECTION = PROGRESS."', size: 'medium' },
        { text: '— RAY DALIO', size: 'small' },
      ],
      durationMs: 5000,
    },
    // 04 — Manifesto (3 lines, dense, needs hold)
    {
      lines: [
        { text: 'THIS IS WHERE TRADERS ARE MADE.', size: 'large' },
        { text: 'NOT IN BOOKS. NOT IN TUTORIALS.', size: 'small' },
        { text: 'HERE.', size: 'large' },
      ],
      durationMs: 5000,
    },
    // 05 — Final command (let it sit, dramatic close)
    {
      lines: [
        { text: 'BEGIN.', size: 'huge' },
      ],
      durationMs: 3500,
    },
  ], [firstName])

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#000' }} />

  return (
    <>
      <ParticleTextEffect frames={frames} onComplete={handleComplete} />

      {/* Skip — overlays the canvas */}
      <button
        onClick={() => navigateTo(destination)}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 50,
          padding: '10px 18px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: '6px',
          color: 'rgba(255,255,255,0.65)',
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '11px',
          letterSpacing: '0.22em',
          fontWeight: 600,
          textTransform: 'uppercase',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        Skip →
      </button>
    </>
  )
}
