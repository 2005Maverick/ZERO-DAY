'use client'

import { useEffect, useState } from 'react'

interface Props {
  finalValue: number
  startingCapital: number
  pnlRupees: number
  pnlPct: number
}

function useCountUp(target: number, duration = 2500): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * ease))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return value
}

export function PnlHero({ finalValue, startingCapital, pnlRupees, pnlPct }: Props) {
  const displayValue = useCountUp(finalValue)
  const displayPnl = useCountUp(Math.abs(pnlRupees))
  const isPositive = pnlRupees >= 0
  const color = isPositive ? '#22c55e' : '#ef4444'

  return (
    <div style={{
      minHeight: '40vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {isPositive && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center top, rgba(34,197,94,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      <div style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '13px',
        fontWeight: 600,
        color: '#475569',
        letterSpacing: '0.12em',
        marginBottom: '12px',
      }}>
        PORTFOLIO FINAL VALUE
      </div>

      <div style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: 'clamp(48px, 8vw, 80px)',
        color: '#f1f5f9',
        lineHeight: 1,
        marginBottom: '12px',
      }}>
        ₹{displayValue.toLocaleString('en-IN')}
      </div>

      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: '24px',
        fontWeight: 800,
        color,
        marginBottom: '8px',
      }}>
        {isPositive ? '+' : '-'}₹{displayPnl.toLocaleString('en-IN')} ({isPositive ? '+' : ''}{pnlPct.toFixed(2)}%)
      </div>

      <div style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '13px',
        color: '#475569',
      }}>
        Started with ₹{startingCapital.toLocaleString('en-IN')} · Nifty 50 fell −5.2% that day
      </div>

      {isPositive && (
        <div style={{
          marginTop: '16px',
          padding: '8px 20px',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '20px',
          fontFamily: 'var(--font-inter)',
          fontSize: '13px',
          color: '#22c55e',
          fontWeight: 600,
        }}>
          You beat the index! 🎉
        </div>
      )}
    </div>
  )
}
