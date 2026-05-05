'use client'

import { motion } from 'framer-motion'

interface Props {
  secondsLeft: number
  onPanicSell: () => void
  onHold: () => void
}

export function FlashCrashOverlay({ secondsLeft, onPanicSell, onHold }: Props) {
  const canStillSell = secondsLeft > 60

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(139,0,0,0.15)',
      backdropFilter: 'blur(2px)',
      zIndex: 55,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      animation: 'screenShake 0.4s ease-in-out',
    }}>
      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(239,68,68,0.15) 100%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: '#0e0505',
          border: '2px solid rgba(239,68,68,0.4)',
          borderRadius: '20px',
          padding: '40px 48px',
          textAlign: 'center',
          maxWidth: '480px',
          position: 'relative',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>

        <div style={{
          fontFamily: 'Anton, sans-serif',
          fontSize: '28px',
          color: '#ef4444',
          letterSpacing: '0.04em',
          marginBottom: '8px',
        }}>
          FLASH CRASH
        </div>

        <div style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '14px',
          color: '#94a3b8',
          marginBottom: '4px',
        }}>
          Algorithmic stop-loss cascade triggered
        </div>

        <div style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '13px',
          color: '#64748b',
          marginBottom: '32px',
        }}>
          All stocks are plunging simultaneously. This happens 3-4 times a day.
        </div>

        {/* Countdown */}
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontWeight: 800,
          fontSize: '36px',
          color: secondsLeft <= 30 ? '#22c55e' : '#ef4444',
          marginBottom: '8px',
        }}>
          {secondsLeft}s
        </div>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#475569', marginBottom: '28px' }}>
          {secondsLeft > 60 ? 'Recovery not started yet' : 'Recovery in progress...'}
        </div>

        {/* Countdown bar */}
        <div style={{ height: '4px', background: '#1e2a35', borderRadius: '2px', marginBottom: '24px' }}>
          <div style={{
            width: `${(secondsLeft / 90) * 100}%`,
            height: '100%', background: '#ef4444', borderRadius: '2px',
            transition: 'width 1s linear',
          }} />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {canStillSell && (
            <button
              onClick={onPanicSell}
              style={{
                flex: 1, padding: '14px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px',
                color: '#ef4444', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-inter)',
              }}
            >
              🔴 Sell All (Panic)
            </button>
          )}
          <button
            onClick={onHold}
            style={{
              flex: canStillSell ? 1 : 2, padding: '14px',
              background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
              border: '1px solid rgba(34,197,94,0.4)',
              borderRadius: '10px',
              color: '#22c55e', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-inter)',
            }}
          >
            💎 Hold Position
          </button>
        </div>
      </motion.div>
    </div>
  )
}
