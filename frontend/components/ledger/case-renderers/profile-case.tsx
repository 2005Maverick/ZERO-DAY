'use client'

import type { ProfileCase } from '@/types/ledger'
import { WaxSealButton } from '../wax-seal-button'

interface Props {
  ledgerCase: ProfileCase
  onRead?: () => void
}

export function ProfileCaseRenderer({ ledgerCase, onRead }: Props) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      width: '100%', height: '100%',
    }}>
      {/* LEFT — portrait + name + lifespan + pull quote */}
      <div style={{
        position: 'relative',
        padding: '36px 32px 28px',
        borderRight: '1px solid rgba(60, 30, 15, 0.18)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        {/* Portrait silhouette placeholder — vintage circular frame */}
        <div style={{
          width: '160px', height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, #5a3a22 0%, #2a1208 100%)',
          border: '4px solid #C9A45F',
          marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: '48px',
          color: '#E8DFC8',
          letterSpacing: '0.04em',
          boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.5)',
        }}>
          {ledgerCase.trader.split(' ').map(s => s[0]).join('')}
        </div>

        <div style={{
          fontFamily: '"Big Caslon", Caslon, Garamond, serif',
          fontStyle: 'italic',
          fontSize: '24px',
          color: '#1a1a1a',
          textAlign: 'center',
          marginBottom: '4px',
        }}>
          {ledgerCase.trader}
        </div>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '11px',
          letterSpacing: '0.16em',
          color: '#8B0000',
          marginBottom: '20px',
        }}>
          {ledgerCase.lifespan}
        </div>

        <div style={{
          fontFamily: 'Garamond, serif',
          fontStyle: 'italic',
          fontSize: '14px',
          color: '#3a2818',
          lineHeight: 1.5,
          textAlign: 'center',
          padding: '0 16px',
          borderLeft: '2px solid #8B0000',
          paddingLeft: '14px',
          alignSelf: 'flex-start',
        }}>
          &ldquo;{ledgerCase.pullQuote}&rdquo;
        </div>
      </div>

      {/* RIGHT — bio summary + CTA */}
      <div style={{ padding: '36px 32px 28px' }}>
        <div style={{
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '10px',
          letterSpacing: '0.28em',
          color: '#8B0000',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          Trader Profile
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
          The Story
        </h2>

        <p style={{
          fontFamily: 'Garamond, serif',
          fontSize: '13px',
          color: '#3a2818',
          lineHeight: 1.6,
          margin: '0 0 24px',
        }}>
          {ledgerCase.bodyMd || 'Full biography will be archived here. The trader\'s defining trade, philosophy, and three lessons every operator must absorb.'}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <WaxSealButton label="Read Biography →" onClick={onRead} variant="secondary" />
        </div>
      </div>
    </div>
  )
}
