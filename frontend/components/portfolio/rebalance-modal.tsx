'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { PortfolioNewsEvent, PortfolioStock } from '@/types/portfolio'

type Tier = 'simple' | 'deeper' | 'expert'

interface Props {
  event: PortfolioNewsEvent
  stocks: PortfolioStock[]
  currentAllocations: Record<string, number>
  totalValue: number
  secondsLeft: number
  onApply: (newAllocations: Record<string, number>) => void
  onHold: () => void
}

export function RebalanceModal({ event, stocks, currentAllocations, totalValue, secondsLeft, onApply, onHold }: Props) {
  const [allocations, setAllocations] = useState<Record<string, number>>({ ...currentAllocations })
  const [hintTier, setHintTier] = useState<Tier>('simple')

  const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0)
  const remaining = totalValue - totalAllocated

  const handleChange = (symbol: string, rupees: number) => {
    const others = totalAllocated - (allocations[symbol] ?? 0)
    const capped = Math.min(rupees, totalValue - others)
    setAllocations(prev => ({ ...prev, [symbol]: Math.max(0, capped) }))
  }

  const urgencyColor = secondsLeft <= 5 ? '#ef4444' : secondsLeft <= 10 ? '#eab308' : '#FFB830'

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(9,12,15,0.85)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          background: '#131920',
          border: `2px solid ${urgencyColor}50`,
          borderRadius: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '520px',
          boxShadow: `0 0 40px ${urgencyColor}20`,
        }}
      >
        {/* Timer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '13px', color: urgencyColor, letterSpacing: '0.08em' }}>
            ⚡ REBALANCING WINDOW
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontWeight: 800,
            fontSize: '22px', color: urgencyColor,
            animation: secondsLeft <= 5 ? 'timerPulse 0.5s infinite' : 'none',
          }}>
            {secondsLeft}s
          </div>
        </div>

        {/* Countdown bar */}
        <div style={{ height: '4px', background: '#1e2a35', borderRadius: '2px', marginBottom: '16px' }}>
          <motion.div
            animate={{ width: `${(secondsLeft / event.rebalanceWindowSec) * 100}%` }}
            style={{ height: '100%', background: urgencyColor, borderRadius: '2px' }}
            transition={{ duration: 1 }}
          />
        </div>

        {/* Hint */}
        <div style={{
          background: 'rgba(255,184,48,0.05)',
          border: '1px solid rgba(255,184,48,0.2)',
          borderRadius: '10px',
          padding: '12px 14px',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            {(['simple', 'deeper', 'expert'] as Tier[]).map(t => (
              <button
                key={t}
                onClick={() => setHintTier(t)}
                style={{
                  padding: '3px 10px',
                  background: hintTier === t ? 'rgba(255,184,48,0.15)' : 'transparent',
                  border: `1px solid ${hintTier === t ? 'rgba(255,184,48,0.4)' : '#1e2a35'}`,
                  borderRadius: '6px',
                  color: hintTier === t ? '#FFB830' : '#64748b',
                  fontSize: '10px', fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-inter)',
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#94a3b8', lineHeight: 1.5 }}>
            {event.tierHint[hintTier]}
          </div>
        </div>

        {/* Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {stocks.map(stock => {
            const alloc = allocations[stock.symbol] ?? 0
            const impact = event.causalImpacts.find(c => c.symbol === stock.symbol)
            const impactColor = !impact ? '#475569' : impact.polarity === 'positive' ? '#22c55e' : impact.polarity === 'negative' ? '#ef4444' : '#eab308'

            return (
              <div key={stock.symbol} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '80px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#94a3b8', flexShrink: 0 }}>
                  {stock.symbol}
                  {impact && (
                    <span style={{ marginLeft: '4px', color: impactColor, fontSize: '10px' }}>
                      {impact.polarity === 'positive' ? '↑' : impact.polarity === 'negative' ? '↓' : '→'}
                    </span>
                  )}
                </div>
                <input
                  type="range" min={0} max={totalValue} step={1000}
                  value={alloc}
                  onChange={e => handleChange(stock.symbol, Number(e.target.value))}
                  style={{ flex: 1, accentColor: impactColor }}
                />
                <div style={{ width: '72px', textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#f1f5f9' }}>
                  ₹{alloc.toLocaleString('en-IN')}
                </div>
              </div>
            )
          })}
        </div>

        {remaining !== 0 && (
          <div style={{ fontSize: '12px', color: remaining > 0 ? '#eab308' : '#ef4444', marginBottom: '12px', fontFamily: 'var(--font-inter)', textAlign: 'center' }}>
            {remaining > 0 ? `₹${remaining.toLocaleString('en-IN')} unallocated (held as cash)` : `Over-allocated by ₹${Math.abs(remaining).toLocaleString('en-IN')}`}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onHold}
            style={{
              flex: 1, padding: '12px',
              background: 'transparent',
              border: '1px solid #1e2a35',
              borderRadius: '10px',
              color: '#94a3b8', fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font-inter)',
            }}
          >
            Hold All
          </button>
          <button
            onClick={() => onApply(allocations)}
            style={{
              flex: 2, padding: '12px',
              background: 'linear-gradient(135deg, #FFB830, #f97316)',
              border: 'none',
              borderRadius: '10px',
              color: '#000', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font-inter)',
            }}
          >
            Apply Changes →
          </button>
        </div>
      </motion.div>
    </div>
  )
}
