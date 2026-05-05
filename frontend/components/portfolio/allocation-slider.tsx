'use client'

import { useState } from 'react'
import type { PortfolioStock } from '@/types/portfolio'

const SECTOR_COLORS: Record<string, string> = {
  airlines: '#3b82f6',
  pharma:   '#22c55e',
  energy:   '#f97316',
  banking:  '#a855f7',
  luxury:   '#eab308',
  it:       '#06b6d4',
}

const STOCK_ONE_LINERS: Record<string, string> = {
  INDIGO:    "India's biggest airline. Fuel = 40% of operating costs.",
  SUNPHARMA: "India's largest pharma company. Exports medicines to 100+ countries.",
  RELIANCE:  "India's most valuable company. Oil, retail, and telecom.",
  HDFCBANK:  "India's largest private bank. Profits when interest rates are higher.",
  TITAN:     "India's leading jewelry & watch brand. Tracks gold prices.",
  TCS:       "India's biggest IT company. Earns revenue in US dollars.",
}

interface Props {
  stock: PortfolioStock
  allocated: number
  totalCapital: number
  onChange: (rupees: number) => void
}

export function AllocationSlider({ stock, allocated, totalCapital, onChange }: Props) {
  const [showHint, setShowHint] = useState(false)
  const shares = allocated > 0 ? (allocated / stock.openPrice).toFixed(2) : '0'
  const pct = totalCapital > 0 ? Math.round((allocated / totalCapital) * 100) : 0
  const color = SECTOR_COLORS[stock.sector] ?? '#94a3b8'

  const handleQuick = (fraction: number) => onChange(Math.round(totalCapital * fraction / 1000) * 1000)

  return (
    <div
      style={{
        background: '#131920',
        border: `1px solid ${allocated > 0 ? color + '40' : '#1e2a35'}`,
        borderRadius: '12px',
        padding: '14px 16px',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={() => setShowHint(true)}
      onMouseLeave={() => setShowHint(false)}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Logo circle */}
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: color + '20', border: `2px solid ${color}40`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 800, color,
            fontFamily: 'JetBrains Mono, monospace',
            flexShrink: 0,
          }}>
            {stock.symbol.slice(0, 2)}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-inter)', fontWeight: 600, fontSize: '14px', color: '#f1f5f9' }}>
              {stock.name}
            </div>
            <div style={{
              display: 'inline-block',
              background: color + '15',
              border: `1px solid ${color}30`,
              borderRadius: '4px',
              padding: '1px 6px',
              fontSize: '10px', fontWeight: 700, color, marginTop: '2px',
            }}>
              {stock.sectorLabel.toUpperCase()}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '16px', color: allocated > 0 ? '#f1f5f9' : '#475569' }}>
            ₹{allocated.toLocaleString('en-IN')}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#475569' }}>
            ≈ {shares} shares
          </div>
        </div>
      </div>

      {/* One-liner hint */}
      {showHint && (
        <div style={{
          fontSize: '12px', color: '#64748b',
          marginBottom: '8px', fontStyle: 'italic',
          fontFamily: 'var(--font-inter)',
        }}>
          {STOCK_ONE_LINERS[stock.symbol]}
        </div>
      )}

      {/* Slider */}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="range"
          min={0}
          max={totalCapital}
          step={1000}
          value={allocated}
          onChange={e => onChange(Number(e.target.value))}
          style={{ width: '100%', accentColor: color, cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>₹0</span>
          <span style={{ fontSize: '11px', color: pct > 50 ? '#eab308' : '#475569', fontFamily: 'JetBrains Mono, monospace', fontWeight: pct > 50 ? 700 : 400 }}>
            {pct}%
          </span>
          <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>₹1L</span>
        </div>
      </div>

      {/* Quick buttons */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {[0, 0.1, 0.25, 0.5].map(f => (
          <button
            key={f}
            onClick={() => handleQuick(f)}
            style={{
              flex: 1,
              padding: '4px 0',
              background: allocated === Math.round(totalCapital * f / 1000) * 1000 ? color + '20' : 'transparent',
              border: `1px solid ${color}30`,
              borderRadius: '6px',
              color: '#94a3b8',
              fontSize: '11px',
              cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            {f === 0 ? '0%' : `${f * 100}%`}
          </button>
        ))}
      </div>
    </div>
  )
}
