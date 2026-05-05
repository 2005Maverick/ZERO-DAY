'use client'

import type { DrillCase } from '@/types/ledger'

interface Props {
  ledgerCase: DrillCase
}

export function DrillCaseRenderer({ ledgerCase }: Props) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      width: '100%', height: '100%',
    }}>
      {/* LEFT — drill briefing */}
      <div style={{
        position: 'relative',
        padding: '36px 32px 28px',
        borderRight: '1px solid rgba(60, 30, 15, 0.18)',
      }}>
        <div style={{
          fontFamily: '"Big Caslon", Caslon, Garamond, serif',
          fontStyle: 'italic',
          fontSize: '22px',
          color: '#1a1a1a',
          marginBottom: '6px',
        }}>
          DRILL № {(ledgerCase.number - 24).toString().padStart(2, '0')} / 10
        </div>
        <div style={{
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '10px',
          letterSpacing: '0.22em',
          color: 'rgba(60, 30, 15, 0.6)',
          fontWeight: 600,
          textTransform: 'uppercase',
          marginBottom: '20px',
        }}>
          Concept · {ledgerCase.concept}
        </div>

        <h2 style={{
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: 'clamp(28px, 3vw, 40px)',
          color: '#1a1a1a',
          letterSpacing: '0.02em',
          lineHeight: 1,
          margin: '0 0 16px',
          textTransform: 'uppercase',
        }}>
          {ledgerCase.title}
        </h2>

        <p style={{
          fontFamily: 'Garamond, serif',
          fontStyle: 'italic',
          fontSize: '14px',
          color: '#3a2818',
          lineHeight: 1.5,
          margin: 0,
        }}>
          {ledgerCase.mechanic}
        </p>
      </div>

      {/* RIGHT — coming soon stamp */}
      <div style={{
        padding: '36px 32px 28px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '24px',
      }}>
        <div style={{
          padding: '14px 28px',
          border: '4px solid #8B0000',
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: '24px',
          letterSpacing: '0.16em',
          color: '#8B0000',
          textTransform: 'uppercase',
          transform: 'rotate(-6deg)',
          background: 'rgba(232,223,200,0.4)',
          fontWeight: 700,
        }}>
          Coming Soon
        </div>
        <p style={{
          fontFamily: 'Garamond, serif',
          fontStyle: 'italic',
          fontSize: '13px',
          color: '#3a2818',
          textAlign: 'center',
          margin: 0,
          maxWidth: '260px',
        }}>
          This drill will unlock once the curriculum video for the underlying concept is published.
        </p>
      </div>
    </div>
  )
}
