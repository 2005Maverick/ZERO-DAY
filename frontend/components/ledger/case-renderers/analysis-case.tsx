'use client'

import type { AnalysisCase } from '@/types/ledger'

interface Props {
  ledgerCase: AnalysisCase
}

export function AnalysisCaseRenderer({ ledgerCase }: Props) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      width: '100%', height: '100%',
    }}>
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
          marginBottom: '18px',
        }}>
          PATTERN № {ledgerCase.number.toString().padStart(3, '0')}
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
          fontSize: '13px',
          color: '#3a2818',
          lineHeight: 1.6,
        }}>
          The full analysis of this pattern — diagnostic features, success rate, classic examples, and how to spot it in real-time — will be archived here.
        </p>
      </div>

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
          Locked
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
          Reach Tier 4 to unlock pattern-recognition exercises.
        </p>
      </div>
    </div>
  )
}
