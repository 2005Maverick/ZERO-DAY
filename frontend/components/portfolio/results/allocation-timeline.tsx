'use client'

import type { AllocationSnapshot, PortfolioStock } from '@/types/portfolio'

interface Props {
  snapshots: AllocationSnapshot[]
  stocks: PortfolioStock[]
}

function secToTime(sec: number): string {
  const marketMin = 9 * 60 + 15 + Math.round((sec / 480) * 375)
  const h = Math.floor(marketMin / 60)
  const m = marketMin % 60
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

const REASON_LABELS: Record<string, string> = {
  initial: 'Open',
  event: 'Rebalance',
  flash_crash: 'Crash',
}

export function AllocationTimeline({ snapshots, stocks }: Props) {
  if (snapshots.length === 0) return null

  return (
    <div style={{
      background: '#0c1118',
      border: '1px solid #1e2a35',
      borderRadius: '12px',
      padding: '20px',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '11px',
        fontWeight: 700,
        color: '#475569',
        letterSpacing: '0.08em',
        marginBottom: '16px',
      }}>
        ALLOCATION SNAPSHOTS
      </div>

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        {snapshots.map((snap, i) => {
          const total = snap.portfolioValue || 1

          return (
            <div key={i} style={{ flexShrink: 0, minWidth: '120px' }}>
              {/* Time label */}
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '10px',
                color: '#475569',
                marginBottom: '4px',
                textAlign: 'center',
              }}>
                {secToTime(snap.atSecond)}
              </div>

              {/* Reason badge */}
              <div style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '9px',
                fontWeight: 600,
                color: snap.reason === 'initial' ? '#22c55e' : snap.reason === 'flash_crash' ? '#ef4444' : '#FFB830',
                textAlign: 'center',
                marginBottom: '8px',
                letterSpacing: '0.06em',
              }}>
                {REASON_LABELS[snap.reason] ?? snap.reason}
              </div>

              {/* Stacked bar */}
              <div style={{
                height: '140px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid #1e2a35',
              }}>
                {stocks.map(stock => {
                  const alloc = snap.allocations[stock.symbol]
                  const pct = alloc ? (alloc.currentValue / total) * 100 : 0
                  if (pct < 0.5) return null
                  return (
                    <div
                      key={stock.symbol}
                      title={`${stock.symbol}: ${pct.toFixed(1)}%`}
                      style={{
                        height: `${pct}%`,
                        background: stock.color,
                        opacity: 0.8,
                        transition: 'height 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: pct > 8 ? '18px' : '0',
                      }}
                    >
                      {pct > 8 && (
                        <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#000', fontWeight: 700 }}>
                          {stock.symbol.slice(0, 4)}
                        </span>
                      )}
                    </div>
                  )
                })}
                {/* Cash */}
                {snap.cash > 0 && (
                  <div style={{
                    height: `${(snap.cash / total) * 100}%`,
                    background: '#1e2a35',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: (snap.cash / total) > 0.08 ? '18px' : '0',
                  }}>
                    {snap.cash / total > 0.08 && (
                      <span style={{ fontSize: '9px', fontFamily: 'JetBrains Mono, monospace', color: '#475569' }}>CASH</span>
                    )}
                  </div>
                )}
              </div>

              {/* Value */}
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '10px',
                color: '#94a3b8',
                textAlign: 'center',
                marginTop: '6px',
              }}>
                ₹{Math.round(total / 1000)}k
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
        {stocks.map(stock => (
          <div key={stock.symbol} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: stock.color, opacity: 0.8 }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#475569' }}>
              {stock.symbol}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
