'use client'

import { useEffect, useState } from 'react'
import { Check, ArrowRight, Shield, FastForward } from 'lucide-react'

type Step = 'BUY' | 'SL' | 'WAIT' | 'SELL' | 'DONE'

interface TrialState {
  step: Step
  cash: number
  shares: number
  price: number
  stopLoss: number | null
  minutesElapsed: number
}

const SHARES_TO_BUY = 10
const START_PRICE = 1200
const START_CASH = 50000

const INITIAL: TrialState = {
  step: 'BUY',
  cash: START_CASH,
  shares: 0,
  price: START_PRICE,
  stopLoss: null,
  minutesElapsed: 0,
}

interface Props {
  onComplete: () => void
}

export function TrialTradeBlock({ onComplete }: Props) {
  const [s, setS] = useState<TrialState>(INITIAL)

  const positionValue = s.shares * s.price
  const total = s.cash + positionValue
  const pnl = total - START_CASH

  // Tick the price during WAIT phase
  useEffect(() => {
    if (s.step !== 'WAIT') return
    if (s.minutesElapsed >= 10) {
      setS(x => ({ ...x, step: 'SELL', price: 1218 }))
      return
    }
    const t = setTimeout(() => {
      setS(x => {
        const drift = Math.random() * 4 - 1.5
        const newPrice = Math.max(1170, Math.round(x.price + drift))
        return { ...x, minutesElapsed: x.minutesElapsed + 1, price: newPrice }
      })
    }, 280)
    return () => clearTimeout(t)
  }, [s.step, s.minutesElapsed])

  function handleBuy() {
    setS(x => ({
      ...x,
      step: 'SL',
      cash: x.cash - SHARES_TO_BUY * x.price,
      shares: SHARES_TO_BUY,
    }))
  }

  function handleSetSL() {
    setS(x => ({
      ...x,
      step: 'WAIT',
      stopLoss: Math.round(x.price * 0.95),
      minutesElapsed: 0,
    }))
  }

  function handleSell() {
    setS(x => ({
      ...x,
      step: 'DONE',
      cash: x.cash + x.shares * x.price,
      shares: 0,
    }))
  }

  return (
    <div style={{
      marginTop: '14px',
      padding: '18px 20px',
      background: 'rgba(0,0,0,0.5)',
      border: '1px solid rgba(212,160,77,0.32)',
      borderRadius: '8px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '14px',
      }}>
        <div style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', fontWeight: 800, color: '#D4A04D',
          letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>Practice Trade · Sandbox</div>
        <div style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '9px', color: '#606060',
        }}>NOT REAL · DOES NOT AFFECT YOUR ₹1,00,000</div>
      </div>

      {/* Stock card */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '12px 14px',
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '6px',
        marginBottom: '12px',
      }}>
        <div style={{
          width: '40px', height: '40px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(59,130,246,0.18)',
          border: '1px solid rgba(59,130,246,0.5)',
          borderRadius: '5px',
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '14px', fontWeight: 800, color: '#3B82F6',
        }}>IG</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '13px', fontWeight: 800, color: '#E0E0E0',
            letterSpacing: '0.06em',
          }}>INDIGO</div>
          <div style={{
            fontFamily: 'var(--font-fraunces), serif',
            fontSize: '11px', color: '#808080', fontStyle: 'italic',
          }}>InterGlobe Aviation</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '18px', fontWeight: 700,
            color: s.price > START_PRICE ? '#10B981' : s.price < START_PRICE ? '#FF1F1F' : '#E0E0E0',
            transition: 'color 0.2s',
          }}>₹{s.price.toLocaleString('en-IN')}</div>
          <div style={{
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '10px',
            color: s.price > START_PRICE ? '#10B981' : s.price < START_PRICE ? '#FF1F1F' : '#606060',
          }}>
            {s.price > START_PRICE ? '▲ ' : s.price < START_PRICE ? '▼ ' : ''}
            {(((s.price - START_PRICE) / START_PRICE) * 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px',
        marginBottom: '14px',
      }}>
        <Stat label="Cash" value={`₹${s.cash.toLocaleString('en-IN')}`} />
        <Stat label="Shares" value={`${s.shares}`} />
        <Stat label="Stop Loss" value={s.stopLoss ? `₹${s.stopLoss}` : '—'} />
        <Stat
          label={s.step === 'DONE' ? 'P&L Realised' : 'P&L'}
          value={`${pnl >= 0 ? '+' : ''}₹${pnl}`}
          color={pnl > 0 ? '#10B981' : pnl < 0 ? '#FF1F1F' : '#909090'}
        />
      </div>

      <StepBox
        step={s.step}
        price={s.price}
        shares={s.shares}
        minutesElapsed={s.minutesElapsed}
        onBuy={handleBuy}
        onSL={handleSetSL}
        onSell={handleSell}
        onDone={onComplete}
      />
    </div>
  )
}

function Stat({ label, value, color = '#E0E0E0' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{
      padding: '6px 8px',
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '4px',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '7.5px', fontWeight: 700, color: '#606060',
        letterSpacing: '0.16em', textTransform: 'uppercase',
        marginBottom: '2px',
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '11px', fontWeight: 700, color,
      }}>{value}</div>
    </div>
  )
}

interface StepBoxProps {
  step: Step
  price: number
  shares: number
  minutesElapsed: number
  onBuy: () => void
  onSL: () => void
  onSell: () => void
  onDone: () => void
}

function StepBox({ step, price, shares, minutesElapsed, onBuy, onSL, onSell, onDone }: StepBoxProps) {
  let instruction = ''
  let cta: React.ReactNode = null

  switch (step) {
    case 'BUY':
      instruction = `Step 1 of 4 — Click BUY to purchase ${SHARES_TO_BUY} shares of INDIGO at ₹${price}.`
      cta = (
        <button onClick={onBuy} style={btnStyle('#10B981')}>
          BUY {SHARES_TO_BUY} @ ₹{price} <ArrowRight size={12}/>
        </button>
      )
      break
    case 'SL':
      instruction = 'Step 2 of 4 — Set a stop loss at −5%. This auto-sells if the price falls that low. Defines your maximum loss before you take any risk.'
      cta = (
        <button onClick={onSL} style={btnStyle('#3B82F6')}>
          <Shield size={12}/> Set SL at −5% (₹{Math.round(price * 0.95)})
        </button>
      )
      break
    case 'WAIT':
      instruction = `Step 3 of 4 — Time is advancing. Watch the price tick. Your unrealised P&L moves with it. (${minutesElapsed} of 10 sim-minutes elapsed)`
      cta = (
        <button disabled style={{ ...btnStyle('#606060'), cursor: 'wait', opacity: 0.7 }}>
          <FastForward size={12}/> Watching market…
        </button>
      )
      break
    case 'SELL':
      instruction = 'Step 4 of 4 — 10 minutes passed. Price is up. SELL now to lock in your profit (realise the P&L).'
      cta = (
        <button onClick={onSell} style={btnStyle('#FF1F1F')}>
          SELL {shares} @ ₹{price} <ArrowRight size={12}/>
        </button>
      )
      break
    case 'DONE':
      instruction = 'Done. You completed a full trade cycle: BUY → set SL → wait → SELL. This is the same flow you\'ll use in the live session.'
      cta = (
        <button onClick={onDone} style={btnStyle('#10B981')}>
          <Check size={12}/> Continue
        </button>
      )
      break
  }

  return (
    <div style={{
      padding: '12px 14px',
      background: 'rgba(212,160,77,0.06)',
      border: '1px solid rgba(212,160,77,0.30)',
      borderLeft: '3px solid #D4A04D',
      borderRadius: '5px',
    }}>
      <div style={{
        fontFamily: 'var(--font-fraunces), serif',
        fontSize: '12px', color: '#C0C0C0',
        lineHeight: 1.55, marginBottom: '10px',
      }}>{instruction}</div>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>{cta}</div>
    </div>
  )
}

function btnStyle(color: string): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px',
    background: `linear-gradient(135deg, ${color}, ${color}AA)`,
    border: 'none', borderRadius: '5px',
    color: '#000',
    fontFamily: 'var(--font-inter), sans-serif',
    fontSize: '11px', fontWeight: 800, letterSpacing: '0.14em',
    textTransform: 'uppercase', cursor: 'pointer',
    boxShadow: `0 4px 12px ${color}55`,
  }
}
