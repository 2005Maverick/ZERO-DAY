'use client'

import type { ScenarioStock } from '@/types/scenario'

interface OpenLedgerProps {
  stocks: ScenarioStock[]
  walletInr: number
  allocations: Record<string, number>
  onAllocate: (symbol: string, rupees: number) => void
}

const GEM_FOR_SECTOR: Record<string, string> = {
  airlines: '#3B82F6',     // sapphire
  pharma:   '#10B981',     // emerald
  energy:   '#E11D48',     // ruby
  banking:  '#06B6D4',     // sky
  luxury:   '#A855F7',     // amethyst
  it:       '#14B8A6',     // teal
}

/**
 * Allocation panel — flat dark slate panel, NO perspective transform.
 * Title + 6 slider rows + arc gauge.
 */
export function OpenLedger({ stocks, walletInr, allocations, onAllocate }: OpenLedgerProps) {
  const allocated = Object.values(allocations).reduce((s, v) => s + v, 0)
  const pct = walletInr > 0 ? Math.min(1, allocated / walletInr) : 0

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      background: 'linear-gradient(180deg, #1A2028 0%, #11161D 100%)',
      border: '1px solid rgba(212,160,77,0.22)',
      borderRadius: '8px',
      padding: '18px 20px',
      boxShadow: '0 10px 24px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <div style={{
          fontFamily: 'var(--font-cormorant-sc), serif',
          fontWeight: 700,
          fontSize: '15px',
          letterSpacing: '0.18em',
          color: '#F4EDE0',
          textTransform: 'uppercase',
        }}>
          Allocate Wallet
        </div>
        <div style={{
          fontFamily: 'var(--font-plex-mono), monospace',
          fontSize: '10px',
          color: '#A89A7E',
          letterSpacing: '0.08em',
        }}>
          ₹{walletInr.toLocaleString('en-IN')}
        </div>
      </div>

      <span style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #D4A04D, transparent)', opacity: 0.4 }} />

      {/* Slider rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {stocks.map(stock => {
          const color = GEM_FOR_SECTOR[stock.sector] ?? stock.color
          const value = allocations[stock.symbol] ?? 0
          const rowPct = walletInr > 0 ? value / walletInr : 0
          return (
            <div key={stock.symbol} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Gem color={color} />
                <span style={{
                  flex: 1,
                  fontFamily: 'var(--font-cormorant-sc), serif',
                  fontWeight: 700,
                  fontSize: '11px',
                  color: '#F4EDE0',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                }}>
                  {stock.symbol}
                </span>
                <span style={{
                  fontFamily: 'var(--font-plex-mono), monospace',
                  fontSize: '10px',
                  color: '#8A8576',
                  width: '34px',
                  textAlign: 'right',
                }}>
                  {(rowPct * 100).toFixed(0)}%
                </span>
                <span style={{
                  fontFamily: 'var(--font-plex-mono), monospace',
                  fontSize: '11px',
                  color: value > 0 ? '#F4EDE0' : '#5C5849',
                  width: '70px',
                  textAlign: 'right',
                  fontWeight: 600,
                }}>
                  ₹{value.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={walletInr}
                step={500}
                value={value}
                onChange={e => onAllocate(stock.symbol, Number(e.target.value))}
                style={{
                  width: '100%',
                  height: '4px',
                  accentColor: color,
                  cursor: 'pointer',
                }}
              />
            </div>
          )
        })}
      </div>

      <span style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #D4A04D, transparent)', opacity: 0.4 }} />

      {/* Total bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-plex-mono), monospace', fontSize: '10px' }}>
          <span style={{ color: '#A89A7E', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Deployed</span>
          <span style={{ color: pct >= 0.95 ? '#5AB088' : '#D4A04D', fontWeight: 700 }}>
            {(pct * 100).toFixed(0)}% · ₹{allocated.toLocaleString('en-IN')}
          </span>
        </div>
        <div style={{ height: '4px', background: 'rgba(212,160,77,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{
            width: `${pct * 100}%`,
            height: '100%',
            background: pct >= 0.95
              ? 'linear-gradient(90deg, #5AB088, #D4A04D)'
              : 'linear-gradient(90deg, #D4A04D, #F0BC6E)',
            transition: 'width 0.18s, background 0.18s',
          }} />
        </div>
      </div>
    </div>
  )
}

function Gem({ color }: { color: string }) {
  return (
    <span style={{
      width: '10px', height: '10px',
      borderRadius: '50%',
      background: color,
      boxShadow: `0 0 6px ${color}99, inset 0 0 1px rgba(255,255,255,0.5)`,
    }} />
  )
}
