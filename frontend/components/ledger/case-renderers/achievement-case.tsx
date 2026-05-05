'use client'

import type { AchievementCase } from '@/types/ledger'

interface Props {
  ledgerCase: AchievementCase
}

export function AchievementCaseRenderer({ ledgerCase }: Props) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px',
      gap: '24px',
    }}>
      <div style={{
        fontFamily: '"Big Caslon", Caslon, Garamond, serif',
        fontStyle: 'italic',
        fontSize: '14px',
        letterSpacing: '0.18em',
        color: '#8B0000',
        textTransform: 'uppercase',
      }}>
        Achievement
      </div>

      <h2 style={{
        fontFamily: 'var(--font-anton), sans-serif',
        fontSize: 'clamp(40px, 5vw, 64px)',
        color: '#1a1a1a',
        letterSpacing: '0.02em',
        lineHeight: 1,
        margin: 0,
        textTransform: 'uppercase',
        textAlign: 'center',
      }}>
        {ledgerCase.title}
      </h2>

      <p style={{
        fontFamily: 'Garamond, serif',
        fontStyle: 'italic',
        fontSize: '15px',
        color: '#3a2818',
        textAlign: 'center',
        maxWidth: '420px',
        margin: 0,
      }}>
        {ledgerCase.description}
      </p>

      <div style={{
        marginTop: '20px',
        padding: '8px 20px',
        border: '2px solid #8B0000',
        fontFamily: 'var(--font-anton), sans-serif',
        fontSize: '14px',
        letterSpacing: '0.22em',
        color: '#8B0000',
        textTransform: 'uppercase',
      }}>
        Locked
      </div>
    </div>
  )
}
