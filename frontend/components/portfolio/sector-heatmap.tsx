'use client'

import type { PortfolioStock, Allocation } from '@/types/portfolio'

interface Props {
  stocks: PortfolioStock[]
  allocations: Record<string, Allocation>
  currentPrices: Record<string, number>
}

const SECTOR_EMOJI: Record<string, string> = {
  airlines: '✈️',
  pharma: '💊',
  energy: '⛽',
  banking: '🏦',
  luxury: '💎',
  it: '💻',
}

export function SectorHeatmap({ stocks, allocations, currentPrices }: Props) {
  const tiles = stocks.map(stock => {
    const alloc = allocations[stock.symbol]
    const currentPrice = currentPrices[stock.symbol] ?? stock.openPrice
    const pnlPct = alloc && alloc.avgCost > 0
      ? ((currentPrice - alloc.avgCost) / alloc.avgCost) * 100
      : 0
    const currentValue = alloc ? alloc.shares * currentPrice : 0
    return { stock, pnlPct, currentValue }
  })

  const maxAbs = Math.max(...tiles.map(t => Math.abs(t.pnlPct)), 0.5)

  return (
    <div style={{
      background: '#0c1118',
      border: '1px solid #1e2a35',
      borderRadius: '12px',
      padding: '16px',
      marginTop: '8px',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '11px',
        fontWeight: 700,
        color: '#475569',
        letterSpacing: '0.08em',
        marginBottom: '12px',
      }}>
        SECTOR HEATMAP
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px',
      }}>
        {tiles.map(({ stock, pnlPct, currentValue }) => {
          const isPositive = pnlPct >= 0
          const intensity = Math.min(Math.abs(pnlPct) / maxAbs, 1)
          const bg = isPositive
            ? `rgba(34,197,94,${0.04 + intensity * 0.22})`
            : `rgba(239,68,68,${0.04 + intensity * 0.22})`
          const border = isPositive
            ? `rgba(34,197,94,${0.1 + intensity * 0.3})`
            : `rgba(239,68,68,${0.1 + intensity * 0.3})`
          const color = isPositive ? '#22c55e' : '#ef4444'

          return (
            <div
              key={stock.symbol}
              style={{
                background: bg,
                border: `1px solid ${border}`,
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
                transition: 'background 1s ease, border-color 1s ease',
              }}
            >
              <div style={{
                fontSize: '16px',
                marginBottom: '2px',
              }}>
                {SECTOR_EMOJI[stock.sector] ?? '📊'}
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '11px',
                fontWeight: 700,
                color,
                marginBottom: '2px',
              }}>
                {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '10px',
                color: '#475569',
              }}>
                {stock.symbol}
              </div>
              {currentValue > 0 && (
                <div style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '9px',
                  color: '#334155',
                  marginTop: '2px',
                }}>
                  ₹{Math.round(currentValue).toLocaleString('en-IN')}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
