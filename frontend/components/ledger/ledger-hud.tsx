'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/lib/contexts/user-context'

interface LedgerHudProps {
  totalCases: number
  currentCase: number
}

export function LedgerHud({ totalCases, currentCase }: LedgerHudProps) {
  const { user } = useUser()
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const h = d.getUTCHours().toString().padStart(2, '0')
      const m = d.getUTCMinutes().toString().padStart(2, '0')
      const s = d.getUTCSeconds().toString().padStart(2, '0')
      setClock(`${h}:${m}:${s}`)
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [])

  const firstName = user?.firstName || 'Trader'
  const tier = user?.stats?.knowledgeLevel || 'Strategist'
  const balance = '47,820' // TODO: pull from real wallet later

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 30,
      padding: '14px 28px',
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr',
      alignItems: 'center',
      borderBottom: '1px solid rgba(220,38,38,0.25)',
      background: 'linear-gradient(180deg, rgba(20,12,4,0.95) 0%, rgba(12,8,4,0.92) 100%)',
      backdropFilter: 'blur(14px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    }}>
      {/* Glow line beneath border */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: '-1px', height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.55), transparent)',
        pointerEvents: 'none',
      }} />

      {/* LEFT — brand monogram + masthead */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          position: 'relative',
          padding: '7px 12px',
          border: '1.5px solid #DC2626',
          background: 'linear-gradient(135deg, rgba(220,38,38,0.22), rgba(220,38,38,0.05))',
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: '15px',
          letterSpacing: '0.2em',
          color: '#fff',
          lineHeight: 1,
          boxShadow: '0 0 16px rgba(220,38,38,0.25)',
        }}>
          ZDM
          <span style={{ position: 'absolute', top: '-3px', left: '-3px', width: '6px', height: '6px', background: '#DC2626' }} />
          <span style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '6px', height: '6px', background: '#DC2626' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{
            fontFamily: 'var(--font-geist-sans), sans-serif',
            fontSize: '11px',
            letterSpacing: '0.22em',
            color: '#F0F0F0',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}>
            The Ledger · Archives
          </span>
          <span style={{
            fontFamily: 'Garamond, "EB Garamond", "Times New Roman", serif',
            fontStyle: 'italic',
            fontSize: '11px',
            letterSpacing: '0.06em',
            color: '#A89880',
            fontWeight: 400,
          }}>
            Volume XII · MMXXV · <span style={{ color: 'rgba(168,152,128,0.55)' }}>dim cream 9px italic Garamond</span>
          </span>
        </div>
      </div>

      {/* CENTER — live status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '8px 22px',
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '8px',
      }}>
        <span style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: '#DC2626',
          boxShadow: '0 0 10px rgba(220,38,38,0.85)',
          animation: 'pulse-soft 1.6s infinite',
        }} />
        <span style={{
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.28em',
          color: '#DC2626',
          textTransform: 'uppercase',
        }}>
          Live Feed
        </span>
        <span style={{ width: '1px', height: '12px', background: 'rgba(220,38,38,0.3)' }} />
        <span style={{
          fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.06em',
          color: '#E8DFC8',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {clock || '00:00:00'} <span style={{ color: 'rgba(168,152,128,0.45)', marginLeft: '4px', fontSize: '10px' }}>UTC</span>
        </span>
        <span style={{ width: '1px', height: '12px', background: 'rgba(220,38,38,0.3)' }} />
        <span style={{
          fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
          fontSize: '11px',
          letterSpacing: '0.16em',
          color: 'rgba(168,152,128,0.7)',
          textTransform: 'uppercase',
        }}>
          Case {currentCase.toString().padStart(3, '0')} of {totalCases}
        </span>
      </div>

      {/* RIGHT — operator chip */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '5px 14px 5px 5px',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '24px',
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #A855F7, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: '12px', fontWeight: 700,
            color: '#fff',
          }}>
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#F0F0F0',
              fontFamily: 'var(--font-geist-sans), sans-serif',
            }}>{firstName}</span>
            <span style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: '9px',
              letterSpacing: '0.18em',
              color: '#DC2626',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}>{tier} · ₹{balance}</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.85); }
        }
      `}</style>
    </header>
  )
}
