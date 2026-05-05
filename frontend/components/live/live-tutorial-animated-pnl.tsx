'use client'

import { useEffect, useState, useCallback } from 'react'
import { Play, RotateCcw } from 'lucide-react'

interface Step {
  cash: number
  shares: number
  price: number
  caption: string
  highlight: 'cash' | 'pos' | 'total' | 'pnl' | 'all' | null
  realised: boolean
}

const STEPS: Step[] = [
  {
    cash: 100000, shares: 0, price: 1400,
    caption: 'Starting position. ₹1,00,000 in cash, no stocks owned.',
    highlight: null, realised: false,
  },
  {
    cash: 86000, shares: 10, price: 1400,
    caption: 'BUY 10 RELIANCE at ₹1,400 — cash drops by ₹14,000, you now own ₹14,000 of stock. Total wealth unchanged.',
    highlight: 'total', realised: false,
  },
  {
    cash: 86000, shares: 10, price: 1430,
    caption: 'Price ticks up to ₹1,430. Position is now worth ₹14,300. Unrealised P&L = +₹300.',
    highlight: 'pnl', realised: false,
  },
  {
    cash: 100300, shares: 0, price: 1430,
    caption: 'SELL 10 shares at ₹1,430. Cash receives ₹14,300. P&L of +₹300 is now REALISED — locked in.',
    highlight: 'cash', realised: true,
  },
]

export function AnimatedPnLBlock() {
  const [stepIdx, setStepIdx] = useState(0)
  const [playing, setPlaying] = useState(true)

  const step = STEPS[stepIdx]
  const positionValue = step.shares * step.price
  const total = step.cash + positionValue
  const pnl = total - 100000

  useEffect(() => {
    if (!playing) return
    if (stepIdx >= STEPS.length - 1) { setPlaying(false); return }
    const t = setTimeout(() => setStepIdx(i => i + 1), 2200)
    return () => clearTimeout(t)
  }, [playing, stepIdx])

  const replay = useCallback(() => { setStepIdx(0); setPlaying(true) }, [])

  return (
    <div style={{
      marginTop: '14px',
      padding: '16px 18px',
      background: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(59,130,246,0.30)',
      borderRadius: '8px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <div style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', fontWeight: 800, color: '#3B82F6',
          letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>
          Live Example · Step {stepIdx + 1} of {STEPS.length}
        </div>
        <button
          onClick={replay}
          disabled={playing}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px',
            background: playing ? 'rgba(255,255,255,0.04)' : 'rgba(59,130,246,0.15)',
            border: `1px solid ${playing ? 'rgba(255,255,255,0.08)' : 'rgba(59,130,246,0.5)'}`,
            borderRadius: '4px',
            color: playing ? '#404040' : '#3B82F6',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: playing ? 'not-allowed' : 'pointer',
          }}
        >
          {playing ? <><Play size={9}/> Playing</> : <><RotateCcw size={9}/> Replay</>}
        </button>
      </div>

      {/* Number grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <Cell label="Cash"   value={`₹${step.cash.toLocaleString('en-IN')}`}      hot={step.highlight === 'cash' || step.highlight === 'all'} color="#E0E0E0"/>
        <Cell label="Position" value={`₹${positionValue.toLocaleString('en-IN')}`} hot={step.highlight === 'pos'  || step.highlight === 'all'} color="#E0E0E0"/>
        <Cell label="Total"  value={`₹${total.toLocaleString('en-IN')}`}            hot={step.highlight === 'total'|| step.highlight === 'all'} color="#E0E0E0"/>
        <Cell
          label={step.realised ? 'P&L (REALISED)' : 'P&L (Unrealised)'}
          value={`${pnl >= 0 ? '+' : ''}₹${pnl.toLocaleString('en-IN')}`}
          hot={step.highlight === 'pnl'}
          color={pnl > 0 ? '#10B981' : pnl < 0 ? '#FF1F1F' : '#909090'}
        />
      </div>

      {/* Stock state row */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '4px',
        marginBottom: '12px',
      }}>
        <div style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', fontWeight: 700, color: '#808080',
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>RELIANCE</div>
        <div style={{ flex: 1, fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px', color: '#A0A0A0' }}>
          {step.shares > 0 ? `${step.shares} shares held` : 'No position'}
        </div>
        <div style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '12px', fontWeight: 700,
          color: stepIdx >= 2 && step.price > 1400 ? '#10B981' : '#E0E0E0',
        }}>
          ₹{step.price.toLocaleString('en-IN')}
          {stepIdx >= 2 && step.price > 1400 && <span style={{ marginLeft: '6px', fontSize: '10px' }}>▲ +2.14%</span>}
        </div>
      </div>

      {/* Caption */}
      <div style={{
        padding: '10px 12px',
        background: 'rgba(59,130,246,0.06)',
        border: '1px solid rgba(59,130,246,0.20)',
        borderLeft: '3px solid #3B82F6',
        borderRadius: '4px',
        fontFamily: 'var(--font-fraunces), serif',
        fontSize: '12px', color: '#C0C0C0',
        lineHeight: 1.55, minHeight: '40px',
        transition: 'all 0.3s',
      }}>
        {step.caption}
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === stepIdx ? '24px' : '6px',
            height: '6px', borderRadius: '3px',
            background: i <= stepIdx ? '#3B82F6' : 'rgba(255,255,255,0.12)',
            transition: 'all 0.3s',
          }}/>
        ))}
      </div>
    </div>
  )
}

function Cell({ label, value, hot, color }: { label: string; value: string; hot: boolean; color: string }) {
  return (
    <div style={{
      padding: '8px 10px',
      background: hot ? 'rgba(59,130,246,0.18)' : 'rgba(0,0,0,0.4)',
      border: `1px solid ${hot ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '5px',
      transition: 'all 0.4s ease',
      boxShadow: hot ? '0 0 18px rgba(59,130,246,0.4)' : 'none',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '8px', fontWeight: 700,
        color: hot ? '#60A5FA' : '#606060',
        letterSpacing: '0.16em', textTransform: 'uppercase',
        marginBottom: '3px',
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '13px', fontWeight: 700, color,
      }}>{value}</div>
    </div>
  )
}
