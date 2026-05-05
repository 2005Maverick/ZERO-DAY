'use client'

import type { ScenarioStock } from '@/types/scenario'

interface StockRailProps {
  stocks: ScenarioStock[]
  activeSymbol: string
  studiedCounts: Record<string, number>
  allocations: Record<string, number>
  onSelect: (symbol: string) => void
}

const SECTOR_COLOR: Record<string, string> = {
  airlines: '#3B82F6',
  pharma:   '#10B981',
  energy:   '#E11D48',
  banking:  '#06B6D4',
  luxury:   '#A855F7',
  it:       '#14B8A6',
}

const SECTOR_LABEL: Record<string, string> = {
  airlines: 'Aviation',
  pharma:   'Pharma',
  energy:   'Energy',
  banking:  'Banking',
  luxury:   'Luxury',
  it:       'Tech',
}

/**
 * Left-rail vertical stack of 6 compact stock tiles.
 * Tile shows: sector dot, symbol, price, % delta, sparkline,
 *             studied progress (N/6), allocated rupees.
 * Active tile gets amber border + lift.
 */
export function StockRail({
  stocks, activeSymbol, studiedCounts, allocations, onSelect,
}: StockRailProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      <div style={{
        fontFamily: 'var(--font-cormorant-sc), serif',
        fontWeight: 700,
        fontSize: '10px',
        color: '#D4A04D',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        padding: '0 4px',
        marginBottom: '2px',
      }}>
        Files · {stocks.length}
      </div>

      {stocks.map(stock => {
        const accent = SECTOR_COLOR[stock.sector] ?? stock.color
        const isActive = stock.symbol === activeSymbol
        const studied = studiedCounts[stock.symbol] ?? 0
        const allocated = allocations[stock.symbol] ?? 0
        const pctNum = stock.pctChange30d * 100
        const isDown = pctNum < 0

        return (
          <button
            key={stock.symbol}
            onClick={() => onSelect(stock.symbol)}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: '10px 12px',
              background: isActive
                ? 'linear-gradient(180deg, rgba(212,160,77,0.10), #11161D)'
                : 'linear-gradient(180deg, #1A2028, #11161D)',
              border: `1px solid ${isActive ? 'rgba(212,160,77,0.7)' : 'rgba(212,160,77,0.16)'}`,
              borderRadius: '8px',
              boxShadow: isActive
                ? '0 0 18px rgba(212,160,77,0.18), inset 0 1px 0 rgba(255,255,255,0.04)'
                : '0 4px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'border 0.15s, box-shadow 0.15s',
            }}
          >
            {/* Active marker bar */}
            {isActive && (
              <span style={{
                position: 'absolute',
                left: '-1px', top: '8px', bottom: '8px',
                width: '3px',
                background: accent,
                borderRadius: '2px',
                boxShadow: `0 0 8px ${accent}`,
              }} />
            )}

            {/* Top row — sector dot, symbol, sparkline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '8px', height: '8px',
                borderRadius: '50%',
                background: accent,
                boxShadow: `0 0 6px ${accent}99`,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-cormorant-sc), serif',
                  fontWeight: 700,
                  fontSize: '12px',
                  color: '#F4EDE0',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {stock.symbol}
                </div>
                <div style={{
                  fontFamily: 'var(--font-plex-mono), monospace',
                  fontSize: '8px',
                  color: accent,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  marginTop: '1px',
                }}>
                  {SECTOR_LABEL[stock.sector] ?? stock.sectorLabel}
                </div>
              </div>
              <Sparkline candles={stock.candles} color={accent} />
            </div>

            {/* Mid row — price + delta */}
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <span style={{
                fontFamily: 'var(--font-plex-mono), monospace',
                fontSize: '12px',
                fontWeight: 700,
                color: '#F4EDE0',
              }}>
                ₹{stock.closePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span style={{
                fontFamily: 'var(--font-plex-mono), monospace',
                fontSize: '10px',
                fontWeight: 700,
                color: isDown ? '#E04A4A' : '#5AB088',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
              }}>
                <span style={{ fontSize: '7px' }}>{isDown ? '▼' : '▲'}</span>
                {pctNum > 0 ? '+' : ''}{pctNum.toFixed(1)}%
              </span>
            </div>

            {/* Bottom row — studied dots + allocation */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} style={{
                    width: '4px', height: '4px',
                    borderRadius: '50%',
                    background: i < studied ? '#D4A04D' : 'rgba(212,160,77,0.16)',
                    boxShadow: i < studied ? '0 0 3px rgba(212,160,77,0.6)' : 'none',
                  }} />
                ))}
              </div>
              {allocated > 0 ? (
                <span style={{
                  fontFamily: 'var(--font-plex-mono), monospace',
                  fontSize: '9px',
                  color: accent,
                  fontWeight: 600,
                }}>
                  ₹{allocated.toLocaleString('en-IN')}
                </span>
              ) : (
                <span style={{
                  fontFamily: 'var(--font-plex-mono), monospace',
                  fontSize: '9px',
                  color: '#5C5849',
                  fontStyle: 'italic',
                }}>
                  ₹0
                </span>
              )}
            </div>
          </button>
        )
      })}
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
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" opacity={0.85}/>
      <circle cx={lastX} cy={lastY} r="1.5" fill={color}/>
    </svg>
  )
}
