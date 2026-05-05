'use client'

import type { ScenarioStock } from '@/types/scenario'

interface StockFilesRailProps {
  stocks: ScenarioStock[]
  activeSymbol: string
  studiedCounts: Record<string, number>
  allocations: Record<string, number>
  onSelect: (symbol: string) => void
}

/**
 * Modern fintech-terminal stock-files list.
 * Each row: colored circle icon · symbol · sector · sparkline · 4/6 cyan badge
 * Active row: red border + red glow + red vertical marker bar
 */
export function StockFilesRail({
  stocks, activeSymbol, studiedCounts, onSelect,
}: StockFilesRailProps) {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(180deg, rgba(20,20,28,0.85), rgba(10,10,14,0.92))',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '14px',
      boxShadow: '0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
    }}>
      <span style={{ position: 'absolute', top: '6px', left: '6px', width: '8px', height: '8px',
        borderTop: '1.5px solid rgba(239,68,68,0.5)', borderLeft: '1.5px solid rgba(239,68,68,0.5)', pointerEvents: 'none' }} />
      <span style={{ position: 'absolute', bottom: '6px', right: '6px', width: '8px', height: '8px',
        borderBottom: '1.5px solid rgba(239,68,68,0.5)', borderRight: '1.5px solid rgba(239,68,68,0.5)', pointerEvents: 'none' }} />
      <SectionHeader>STOCK FILES · {stocks.length} OF {stocks.length}</SectionHeader>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {stocks.map(stock => {
          const isActive = stock.symbol === activeSymbol
          const studied = studiedCounts[stock.symbol] ?? 0

          return (
            <button
              key={stock.symbol}
              onClick={() => onSelect(stock.symbol)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '9px 10px 9px 12px',
                background: isActive ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? '#EF4444' : 'rgba(255,255,255,0.06)'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isActive ? '0 0 14px rgba(239,68,68,0.25)' : 'none',
                textAlign: 'left',
              }}
            >
              {isActive && (
                <span style={{
                  position: 'absolute',
                  left: '-1px', top: '-1px', bottom: '-1px',
                  width: '3px',
                  background: '#EF4444',
                  borderRadius: '6px 0 0 6px',
                  boxShadow: '0 0 10px #EF4444',
                }} />
              )}

              {/* Sector circle icon */}
              <div style={{
                width: '32px', height: '32px',
                borderRadius: '50%',
                background: `${stock.color}1F`,
                border: `1px solid ${stock.color}80`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px',
                flexShrink: 0,
                boxShadow: isActive ? `0 0 10px ${stock.color}50` : 'none',
              }}>
                {stock.emoji}
              </div>

              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                <div style={{
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {stock.symbol}
                </div>
                <div style={{
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontSize: '9px',
                  color: 'rgba(255,255,255,0.4)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}>
                  {stock.sectorLabel}
                </div>
              </div>

              <Sparkline candles={stock.candles} color={stock.color} />

              {/* studied badge */}
              <div style={{
                padding: '3px 7px',
                borderRadius: '4px',
                background: studied >= 6 ? 'rgba(6,182,212,0.16)' : 'rgba(250,204,21,0.14)',
                border: `1px solid ${studied >= 6 ? '#06B6D4' : '#FACC15'}60`,
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '9px',
                fontWeight: 700,
                color: studied >= 6 ? '#06B6D4' : '#FACC15',
                letterSpacing: '0.02em',
                flexShrink: 0,
              }}>
                {studied}/6
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── small parts ─────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-block',
      padding: '4px 8px',
      marginBottom: '10px',
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.4)',
      borderRadius: '4px',
      fontFamily: 'var(--font-geist-sans), sans-serif',
      fontSize: '9px',
      fontWeight: 700,
      letterSpacing: '0.18em',
      color: '#EF4444',
      textTransform: 'uppercase',
    }}>
      {children}
    </div>
  )
}

function Sparkline({ candles, color }: { candles: ScenarioStock['candles']; color: string }) {
  if (candles.length === 0) return null
  const w = 50, h = 20, pad = 1
  const closes = candles.map(c => c.close)
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const range = max - min || 1
  const pts = closes.map((c, i) => {
    const x = pad + (i / (closes.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (c - min) / range) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const lastX = pad + (w - pad * 2)
  const lastY = pad + (1 - (closes[closes.length - 1] - min) / range) * (h - pad * 2)
  return (
    <svg width={w} height={h} style={{ flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" opacity={0.9} />
      <circle cx={lastX} cy={lastY} r="1.6" fill={color} />
    </svg>
  )
}
