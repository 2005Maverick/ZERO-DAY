'use client'

import { Volume2, VolumeX, ArrowLeft } from 'lucide-react'

interface Props {
  elapsedSeconds: number
  portfolioValue: number
  pnlRupees: number
  pnlPct: number
  cashRemaining: number
  isMuted: boolean
  onMuteToggle: () => void
  onBack: () => void
}

function marketTime(elapsedSeconds: number): string {
  const marketOpenMinute = 9 * 60 + 15
  const currentMarketMinute = marketOpenMinute + Math.floor((elapsedSeconds / 480) * 375)
  const hours = Math.floor(currentMarketMinute / 60)
  const minutes = currentMarketMinute % 60
  const h12 = hours > 12 ? hours - 12 : hours
  const ampm = hours >= 12 ? 'PM' : 'AM'
  return `${h12}:${minutes.toString().padStart(2, '0')} ${ampm}`
}

export function PortfolioHeader({ elapsedSeconds, portfolioValue, pnlRupees, pnlPct, cashRemaining, isMuted, onMuteToggle, onBack }: Props) {
  const isPositive = pnlRupees >= 0
  const pnlColor = isPositive ? '#22c55e' : '#ef4444'

  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: '#0e1318',
      borderBottom: '1px solid #1e2a35',
      padding: '10px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: '1px solid #1e2a35', borderRadius: '8px', padding: '6px 12px', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontFamily: 'var(--font-inter)' }}
          >
            <ArrowLeft size={14} /> Back
          </button>

          {/* Market clock */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            background: '#131920', border: '1px solid #1e2a35',
            borderRadius: '8px', padding: '6px 14px',
          }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '18px', color: '#f1f5f9' }}>
              {marketTime(elapsedSeconds)}
            </span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              NSE · Mar 9, 2020
            </span>
          </div>
        </div>

        {/* Center — P&L */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 800,
            fontSize: 'clamp(20px, 3vw, 28px)',
            color: pnlColor,
            lineHeight: 1,
          }}>
            {isPositive ? '+' : ''}₹{Math.abs(pnlRupees).toLocaleString('en-IN')}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: pnlColor, opacity: 0.8 }}>
            {isPositive ? '▲' : '▼'} {Math.abs(pnlPct).toFixed(2)}% · ₹{portfolioValue.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cash</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', color: '#94a3b8' }}>
              ₹{cashRemaining.toLocaleString('en-IN')}
            </div>
          </div>

          <button
            onClick={onMuteToggle}
            style={{ background: 'none', border: '1px solid #1e2a35', borderRadius: '8px', padding: '8px', color: '#64748b', cursor: 'pointer' }}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>
    </div>
  )
}
