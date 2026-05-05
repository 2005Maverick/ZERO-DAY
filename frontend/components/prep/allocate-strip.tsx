'use client'

import { ArrowRight } from 'lucide-react'
import type { ScenarioStock } from '@/types/scenario'

interface AllocateStripProps {
  stocks: ScenarioStock[]
  walletInr: number
  allocations: Record<string, number>
  onAllocate: (symbol: string, rupees: number) => void
  onDeploy: () => void
}

const MIN_DEPLOY_PCT = 0.95

const SECTOR_COLOR: Record<string, string> = {
  airlines: '#3B82F6',
  pharma:   '#10B981',
  energy:   '#E11D48',
  banking:  '#06B6D4',
  luxury:   '#A855F7',
  it:       '#14B8A6',
}

/**
 * Bottom allocation strip — 6 stocks in a horizontal row + Deploy CTA.
 */
export function AllocateStrip({
  stocks, walletInr, allocations, onAllocate, onDeploy,
}: AllocateStripProps) {
  const allocated = Object.values(allocations).reduce((s, v) => s + v, 0)
  const pct = walletInr > 0 ? Math.min(1, allocated / walletInr) : 0
  const canDeploy = pct >= MIN_DEPLOY_PCT
  const remaining = Math.max(0, MIN_DEPLOY_PCT - pct)

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 240px',
      gap: '14px',
      padding: '12px 16px',
      background: 'linear-gradient(180deg, #1A2028 0%, #11161D 100%)',
      borderTop: '1px solid rgba(212,160,77,0.25)',
      borderBottom: '1px solid rgba(212,160,77,0.10)',
      alignItems: 'stretch',
    }}>
      {/* Left: 6 stock allocators */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <span style={{
            fontFamily: 'var(--font-cormorant-sc), serif',
            fontWeight: 700,
            fontSize: '11px',
            color: '#D4A04D',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}>
            Allocate Wallet
          </span>
          <span style={{
            fontFamily: 'var(--font-plex-mono), monospace',
            fontSize: '10px',
            color: pct >= 0.95 ? '#5AB088' : '#A89A7E',
            letterSpacing: '0.04em',
          }}>
            ₹{allocated.toLocaleString('en-IN')} / ₹{walletInr.toLocaleString('en-IN')}
            <span style={{ marginLeft: '8px', color: pct >= 0.95 ? '#5AB088' : '#D4A04D', fontWeight: 700 }}>
              {(pct * 100).toFixed(0)}%
            </span>
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
        }}>
          {stocks.map(stock => {
            const color = SECTOR_COLOR[stock.sector] ?? stock.color
            const value = allocations[stock.symbol] ?? 0
            const rowPct = walletInr > 0 ? value / walletInr : 0
            return (
              <div key={stock.symbol} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{
                    width: '6px', height: '6px',
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 4px ${color}99`,
                    flexShrink: 0,
                  }} />
                  <span style={{
                    flex: 1,
                    fontFamily: 'var(--font-cormorant-sc), serif',
                    fontWeight: 700,
                    fontSize: '9px',
                    color: '#F4EDE0',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                  }}>
                    {stock.symbol}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-plex-mono), monospace',
                    fontSize: '9px',
                    color: '#8A8576',
                  }}>
                    {(rowPct * 100).toFixed(0)}%
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-plex-mono), monospace',
                    fontSize: '9px',
                    color: value > 0 ? '#F4EDE0' : '#5C5849',
                    fontWeight: 600,
                    minWidth: '50px',
                    textAlign: 'right',
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
                    height: '3px',
                    accentColor: color,
                    cursor: 'pointer',
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Right: Deploy CTA */}
      <button
        onClick={canDeploy ? onDeploy : undefined}
        disabled={!canDeploy}
        title={canDeploy ? 'Deploy positions' : `Allocate ${Math.ceil(remaining * 100)}% more to deploy`}
        style={{
          padding: '14px 18px',
          background: canDeploy
            ? 'linear-gradient(180deg, #C0344B 0%, #8B2545 100%)'
            : 'linear-gradient(180deg, #1A2028 0%, #11161D 100%)',
          border: canDeploy
            ? '1px solid #D4A04D'
            : '1px solid rgba(212,160,77,0.18)',
          borderRadius: '8px',
          color: canDeploy ? '#F4EDE0' : '#5C5849',
          fontFamily: 'var(--font-cormorant-sc), serif',
          fontWeight: 700,
          fontSize: '12px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          cursor: canDeploy ? 'pointer' : 'not-allowed',
          boxShadow: canDeploy
            ? '0 8px 18px rgba(139,37,69,0.45), 0 0 18px rgba(212,160,77,0.20), inset 0 1px 0 rgba(255,255,255,0.18)'
            : 'none',
          textShadow: canDeploy ? '0 1px 0 rgba(0,0,0,0.4)' : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => {
          if (canDeploy) e.currentTarget.style.transform = 'translateY(-2px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = ''
        }}
      >
        <SealIcon canDeploy={canDeploy} />
        <span style={{ flex: 1, textAlign: 'left' }}>
          {canDeploy ? 'Deploy' : `Allocate ${Math.ceil(remaining * 100)}%`}
        </span>
        {canDeploy && <ArrowRight size={14} />}
      </button>
    </div>
  )
}

function SealIcon({ canDeploy }: { canDeploy: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 28 28" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id="strip-seal" cx="35%" cy="30%">
          <stop offset="0%"  stopColor={canDeploy ? '#F4EDE0' : '#3A3128'} stopOpacity="0.55"/>
          <stop offset="55%" stopColor={canDeploy ? '#D4A04D' : '#3A3128'}/>
          <stop offset="100%" stopColor={canDeploy ? '#7A4A1A' : '#1A1612'}/>
        </radialGradient>
      </defs>
      <circle cx="14" cy="14" r="11"
              fill="url(#strip-seal)"
              stroke={canDeploy ? '#F4EDE0' : '#5C5849'}
              strokeWidth="0.8"
              opacity={canDeploy ? 1 : 0.6}/>
      <text x="14" y="17"
            textAnchor="middle"
            fontFamily="var(--font-cinzel), serif"
            fontWeight="700"
            fontSize="7"
            letterSpacing="0.6"
            fill={canDeploy ? '#3A0C18' : '#5C5849'}>
        ZDM
      </text>
    </svg>
  )
}
