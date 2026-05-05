'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { PortfolioScenario } from '@/types/portfolio'
import { AllocationSlider } from './allocation-slider'

interface Props {
  scenario: PortfolioScenario
  pendingAllocations: Record<string, number>
  onSetAllocation: (symbol: string, rupees: number) => void
  onLockIn: () => void
}

export function AllocationPanel({ scenario, pendingAllocations, onSetAllocation, onLockIn }: Props) {
  const [countdown, setCountdown] = useState(60)

  const totalAllocated = Object.values(pendingAllocations).reduce((s, v) => s + v, 0)
  const remaining = scenario.startingCapital - totalAllocated
  const allAllocated = totalAllocated >= scenario.startingCapital * 0.95

  // Individual stock constraint: warn if > 60%
  const maxStock = Math.max(...Object.values(pendingAllocations))
  const overConcentrated = maxStock > scenario.startingCapital * 0.6

  const handleSliderChange = (symbol: string, rupees: number) => {
    const otherTotal = totalAllocated - (pendingAllocations[symbol] ?? 0)
    const capped = Math.min(rupees, scenario.startingCapital - otherTotal)
    onSetAllocation(symbol, Math.max(0, capped))
  }

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(id); onLockIn(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [onLockIn])

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60

  return (
    <div style={{ minHeight: '100vh', background: '#090c0f', color: '#f1f5f9', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #1e2a35',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#0e1318',
      }}>
        <div>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '20px', color: '#f1f5f9' }}>
            {scenario.title}
          </div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#64748b' }}>
            {scenario.dateShort} · Pre-Market Allocation
          </div>
        </div>

        {/* Timer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: countdown <= 10 ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
          border: `1px solid ${countdown <= 10 ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
          borderRadius: '10px', padding: '8px 14px',
        }}>
          <span style={{ fontSize: '13px', color: '#94a3b8', fontFamily: 'var(--font-inter)' }}>Markets open in</span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '20px',
            color: countdown <= 10 ? '#ef4444' : '#22c55e',
            animation: countdown <= 10 ? 'timerPulse 1s infinite' : 'none',
          }}>
            {mins}:{secs.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        {/* Wallet bar */}
        <div style={{
          background: '#131920', border: '1px solid #1e2a35',
          borderRadius: '12px', padding: '16px 20px',
          display: 'flex', gap: '32px', marginBottom: '24px',
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'var(--font-inter)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Capital</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '20px', color: '#f1f5f9' }}>
              ₹{scenario.startingCapital.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'var(--font-inter)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Allocated</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '20px', color: '#22c55e' }}>
              ₹{totalAllocated.toLocaleString('en-IN')}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#475569', fontFamily: 'var(--font-inter)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Remaining</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '20px', color: remaining > 0 ? '#eab308' : '#22c55e' }}>
              ₹{remaining.toLocaleString('en-IN')}
            </div>
          </div>

          {/* Allocation bar */}
          <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ height: '8px', background: '#1e2a35', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${Math.min(100, (totalAllocated / scenario.startingCapital) * 100)}%` }}
                style={{ height: '100%', background: allAllocated ? '#22c55e' : '#3b82f6', borderRadius: '4px' }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', fontFamily: 'var(--font-inter)' }}>
              {Math.round((totalAllocated / scenario.startingCapital) * 100)}% deployed
            </div>
          </div>
        </div>

        {overConcentrated && (
          <div style={{
            background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)',
            borderRadius: '8px', padding: '10px 16px', marginBottom: '16px',
            fontSize: '13px', color: '#eab308', fontFamily: 'var(--font-inter)',
          }}>
            ⚠️ Over 60% in one stock — that's a concentrated bet. You can proceed, but a single bad event will hurt badly.
          </div>
        )}

        {/* Stock sliders grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {scenario.stocks.map(stock => (
            <AllocationSlider
              key={stock.symbol}
              stock={stock}
              allocated={pendingAllocations[stock.symbol] ?? 0}
              totalCapital={scenario.startingCapital}
              onChange={rupees => handleSliderChange(stock.symbol, rupees)}
            />
          ))}
        </div>

        {/* Lock In button */}
        <div style={{ textAlign: 'center' }}>
          {!allAllocated && (
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '12px', fontFamily: 'var(--font-inter)' }}>
              Allocate at least 95% of capital to trade. Unallocated capital sits as cash.
            </div>
          )}
          <button
            onClick={onLockIn}
            style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              border: 'none',
              borderRadius: '12px',
              padding: '16px 48px',
              fontFamily: 'Anton, sans-serif',
              fontSize: '18px',
              color: '#000',
              cursor: 'pointer',
              letterSpacing: '0.05em',
              boxShadow: '0 0 24px rgba(34,197,94,0.3)',
              transition: 'transform 0.1s, box-shadow 0.2s',
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.03)' }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)' }}
          >
            LOCK IN & TRADE →
          </button>
          <div style={{ fontSize: '12px', color: '#475569', marginTop: '8px', fontFamily: 'var(--font-inter)' }}>
            {allAllocated ? 'Ready to trade' : 'Or wait for the timer to auto-start'}
          </div>
        </div>
      </div>
    </div>
  )
}
