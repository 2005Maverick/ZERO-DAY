'use client'

import { useUser } from '@/lib/contexts/user-context'

interface InsideCoverProps {
  /** Optional: jump to a specific case (e.g., user's last-read or recommended next) */
  onContinue?: () => void
}

export function InsideCover({ onContinue }: InsideCoverProps = {}) {
  const { user } = useUser()
  const firstName = user?.firstName || 'Trader'
  const tier = (user?.stats?.knowledgeLevel || 'Strategist').toUpperCase()

  // v1 mock stats — replace with real data later
  const stats = [
    { label: 'TIER',       value: tier },
    { label: 'LEVEL',      value: '7' },
    { label: 'BALANCE',    value: '₹47,820' },
    { label: 'STREAK',     value: '07 DAYS' },
    { label: 'WIN RATE',   value: '78.2%' },
    { label: 'CASES READ', value: '24 / 247' },
  ]

  return (
    <aside style={{
      width: '240px',
      flexShrink: 0,
      padding: '32px 28px 32px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
    }}>
      {/* Section header */}
      <div style={{
        fontFamily: 'Garamond, "EB Garamond", "Times New Roman", serif',
        fontSize: '20px',
        color: '#E8DFC8',
        fontStyle: 'italic',
        marginBottom: '4px',
        textAlign: 'right',
      }}>
        Inside Cover
      </div>

      {/* Bookplate widget */}
      <div style={{
        position: 'relative',
        padding: '24px 20px 28px',
        background: 'linear-gradient(160deg, #3D1F18 0%, #2A1208 100%)',
        border: '2px solid rgba(201,164,95,0.3)',
        borderRadius: '4px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,164,95,0.15)',
        textAlign: 'center',
      }}>
        {/* Gold-leaf inner frame */}
        <div style={{
          position: 'absolute',
          inset: '8px',
          border: '1px solid rgba(201,164,95,0.35)',
          pointerEvents: 'none',
          borderRadius: '2px',
        }} />
        {/* Corner ornaments */}
        {[
          { top: 4, left: 4 },
          { top: 4, right: 4 },
          { bottom: 4, left: 4 },
          { bottom: 4, right: 4 },
        ].map((pos, i) => (
          <div key={i} style={{
            position: 'absolute',
            ...pos,
            width: '12px', height: '12px',
            border: '1px solid #C9A45F',
            opacity: 0.6,
            pointerEvents: 'none',
          }} />
        ))}

        {/* "THIS LEDGER BELONGS TO" */}
        <div style={{
          position: 'relative',
          fontFamily: 'Garamond, "EB Garamond", "Times New Roman", serif',
          fontStyle: 'italic',
          fontSize: '11px',
          letterSpacing: '0.18em',
          color: 'rgba(232,223,200,0.65)',
          marginBottom: '14px',
          textTransform: 'uppercase',
        }}>
          This Ledger Belongs To
        </div>

        {/* User name in display Garamond */}
        <div style={{
          position: 'relative',
          fontFamily: 'Garamond, "EB Garamond", "Times New Roman", serif',
          fontStyle: 'italic',
          fontSize: '32px',
          color: '#E8DFC8',
          lineHeight: 1,
          marginBottom: '16px',
        }}>
          {firstName}
        </div>

        {/* Hairline divider */}
        <div style={{
          position: 'relative',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(201,164,95,0.5), transparent)',
          margin: '0 auto 18px',
          width: '70%',
        }} />

        {/* Stats */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
          {stats.map(s => (
            <div key={s.label} style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: '10px',
              color: '#E8DFC8',
              letterSpacing: '0.1em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span style={{ opacity: 0.6, fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontWeight: 600 }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Wax seal accent */}
        <div style={{
          position: 'relative',
          width: '52px', height: '52px',
          margin: '0 auto 14px',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #B91C1C 0%, #7F1D1D 60%, #450A0A 100%)',
          boxShadow: '0 4px 12px rgba(220,38,38,0.4), inset 0 -3px 6px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: '11px',
          color: '#2A0A0A',
          letterSpacing: '0.06em',
          fontWeight: 700,
        }}>
          Z·D·M
          <span style={{
            position: 'absolute',
            top: '12%', left: '40%', width: '3px', height: '60%',
            background: 'rgba(0,0,0,0.35)',
            transform: 'rotate(18deg)',
            borderRadius: '2px',
          }} />
        </div>

        {/* CTA */}
        <button
          onClick={onContinue}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: onContinue ? 'pointer' : 'default',
            fontFamily: 'Garamond, "EB Garamond", "Times New Roman", serif',
            fontStyle: 'italic',
            fontSize: '13px',
            color: '#DC2626',
            letterSpacing: '0.02em',
          }}
        >
          Continue Reading →
        </button>
      </div>
    </aside>
  )
}
