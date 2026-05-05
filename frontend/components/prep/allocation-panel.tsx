'use client'

import { useMemo } from 'react'
import type { ScenarioStock } from '@/types/scenario'

interface AllocationPanelProps {
  stocks: ScenarioStock[]
  walletInr: number
  allocations: Record<string, number>
  onAllocate: (symbol: string, rupees: number) => void
  onDeploy: () => void
  unstudiedCount: number
}

const MIN_DEPLOY_PCT = 0.95

/**
 * Compact allocation block (sliders) + DEPLOY button.
 * Pure-black card · sector-tinted dot · slider · rupees right-aligned.
 * DEPLOY: yellow gradient when unlocked, dark/grey + tooltip when locked.
 */
export function AllocationPanel({
  stocks, walletInr, allocations, onAllocate, onDeploy,
}: AllocationPanelProps) {
  const allocated = useMemo(
    () => Object.values(allocations).reduce((s, v) => s + v, 0),
    [allocations],
  )
  const pct = walletInr > 0 ? Math.min(1, allocated / walletInr) : 0
  const canDeploy = allocated >= walletInr * MIN_DEPLOY_PCT
  const remainingForDeploy = Math.max(0, walletInr * MIN_DEPLOY_PCT - allocated)
  const remainingPct = walletInr > 0 ? remainingForDeploy / walletInr : 0

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
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <span style={{ position: 'absolute', top: '6px', left: '6px', width: '8px', height: '8px',
        borderTop: '1.5px solid rgba(239,68,68,0.5)', borderLeft: '1.5px solid rgba(239,68,68,0.5)', pointerEvents: 'none' }} />
      <span style={{ position: 'absolute', bottom: '6px', right: '6px', width: '8px', height: '8px',
        borderBottom: '1.5px solid rgba(239,68,68,0.5)', borderRight: '1.5px solid rgba(239,68,68,0.5)', pointerEvents: 'none' }} />
      <SectionHeader>ALLOCATE WALLET</SectionHeader>

      {/* Compact slider rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {stocks.map(stock => {
          const value = allocations[stock.symbol] ?? 0
          return (
            <div key={stock.symbol} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '8px', height: '8px',
                background: stock.color,
                borderRadius: '50%',
                boxShadow: `0 0 6px ${stock.color}80`,
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '9px',
                fontWeight: 700,
                color: '#FFFFFF',
                width: '70px',
                letterSpacing: '0.04em',
              }}>
                {stock.symbol}
              </span>
              <input
                type="range"
                min={0}
                max={walletInr}
                step={500}
                value={value}
                onChange={e => onAllocate(stock.symbol, Number(e.target.value))}
                style={{
                  flex: 1,
                  height: '3px',
                  accentColor: stock.color,
                  cursor: 'pointer',
                }}
              />
              <span style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '10px',
                color: value > 0 ? '#FFFFFF' : 'rgba(255,255,255,0.35)',
                width: '52px',
                textAlign: 'right',
                fontWeight: 600,
              }}>
                ₹{value.toLocaleString('en-IN')}
              </span>
            </div>
          )
        })}
      </div>

      {/* "70% DEPLOYED" stamp */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 8px',
        background: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: '4px',
      }}>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '10px',
          color: '#EF4444',
          letterSpacing: '0.12em',
          fontWeight: 700,
        }}>
          {(pct * 100).toFixed(0)}% DEPLOYED
        </div>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '9px',
          color: 'rgba(255,255,255,0.5)',
        }}>
          ₹{allocated.toLocaleString('en-IN')}
        </div>
      </div>

      {/* DEPLOY — yellow */}
      <button
        onClick={onDeploy}
        disabled={!canDeploy}
        title={canDeploy ? 'Deploy capital · enter the live arena' : `Allocate ${(remainingPct * 100).toFixed(0)}% more to deploy`}
        style={{
          marginTop: '2px',
          padding: '12px 14px',
          background: canDeploy
            ? 'linear-gradient(180deg, #FACC15, #EAB308)'
            : 'rgba(255,255,255,0.04)',
          border: `1px solid ${canDeploy ? '#FACC15' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '6px',
          color: canDeploy ? '#1A1208' : 'rgba(255,255,255,0.3)',
          fontFamily: 'var(--font-anton), var(--font-geist-sans), sans-serif',
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '0.24em',
          cursor: canDeploy ? 'pointer' : 'not-allowed',
          textTransform: 'uppercase',
          boxShadow: canDeploy ? '0 0 22px rgba(250,204,21,0.45), inset 0 1px 0 rgba(255,255,255,0.3)' : 'none',
          textShadow: canDeploy ? '0 1px 0 rgba(255,255,255,0.25)' : 'none',
          transition: 'all 0.18s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        Deploy <span style={{ fontFamily: 'var(--font-geist-mono), monospace', fontWeight: 900 }}>→</span>
      </button>

      {!canDeploy && (
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '9px',
          color: 'rgba(250,204,21,0.85)',
          textAlign: 'center',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          Allocate {(remainingPct * 100).toFixed(0)}% more to deploy
        </div>
      )}
    </div>
  )
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-block',
      padding: '4px 8px',
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.4)',
      borderRadius: '4px',
      fontFamily: 'var(--font-geist-sans), sans-serif',
      fontSize: '9px',
      fontWeight: 700,
      letterSpacing: '0.18em',
      color: '#EF4444',
      textTransform: 'uppercase',
      alignSelf: 'flex-start',
    }}>
      {children}
    </div>
  )
}
