'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'

interface TechnicalsTutorialProps {
  open: boolean
  onClose: () => void
}

interface Step {
  id: number
  title: string
  eyebrow: string
  /** data-tut attribute of the element to spotlight; null = no spotlight (intro/overview step) */
  targetId: string | null
  dialogPos: 'right' | 'left' | 'below' | 'above' | 'center'
  body: string
  bullets?: string[]
  pairsWith?: string
  example?: string
}

const STEPS: Step[] = [
  {
    id: 1, eyebrow: 'Foundation · 01 of 13',
    title: 'What Are Technical Indicators?',
    targetId: null, dialogPos: 'center',
    body: 'Technical indicators are math formulas applied to past price and volume. They take noisy charts and turn them into a number or line that\'s easier to read. Think of them as different "lenses" — each one reveals one specific thing about price.',
    bullets: [
      'Trend indicators tell you which direction price is moving',
      'Momentum indicators tell you how fast / how tired the move is',
      'Volatility indicators tell you how violent the swings are',
      'Volume indicators tell you whether real money is behind the move',
    ],
    pairsWith: 'Use indicators in groups, never alone — one trend + one momentum + one volume is the classic setup.',
  },
  {
    id: 2, eyebrow: 'Trend · 02 of 13',
    title: 'Moving Averages — The Smoothed Trend',
    targetId: 'ma', dialogPos: 'right',
    body: 'A moving average smooths out daily noise by averaging the last N closing prices. The 20-day MA shows the short-term trend; the 50-day MA shows the medium-term trend.',
    bullets: [
      'Price ABOVE MA20  →  short-term uptrend',
      'Price BELOW MA20  →  short-term downtrend',
      'MA20 ABOVE MA50 ("Golden Cross")  →  bullish trend confirmed',
      'MA20 BELOW MA50 ("Death Cross")  →  bearish trend confirmed',
      'Far from MA  →  stretched, usually pulls back',
    ],
    pairsWith: 'Confirms RSI: if RSI is overbought AND price is far above MA20, the pullback is more likely.',
  },
  {
    id: 3, eyebrow: 'Trend · 03 of 13',
    title: 'ADX — How Strong Is the Trend?',
    targetId: 'adx', dialogPos: 'left',
    body: 'ADX measures trend STRENGTH (not direction) on a 0–100 scale. A high ADX means whatever the trend is, it\'s strong; a low ADX means price is just chopping sideways.',
    bullets: [
      'ADX < 20  →  no real trend, range-bound — fade extremes, don\'t chase',
      'ADX 20–40  →  trend developing, getting tradeable',
      'ADX > 40  →  strong trend in place, follow it',
      'ADX > 60  →  exhausted trend, watch for reversal',
    ],
    pairsWith: 'Combine with MA direction: ADX 35 + MA20 below MA50 = strong downtrend, sell rallies.',
  },
  {
    id: 4, eyebrow: 'Momentum · 04 of 13',
    title: 'RSI — The "Is It Tired?" Meter',
    targetId: 'rsi', dialogPos: 'right',
    body: 'RSI compares recent gains vs. losses on a 0–100 scale. It tells you whether a stock has rallied or fallen too far, too fast — and might be about to pause or reverse.',
    bullets: [
      'RSI > 70  →  overbought — buyers are exhausted, watch for pullback',
      'RSI < 30  →  oversold — sellers are exhausted, watch for bounce',
      'RSI 40–60  →  neutral, no edge',
      'Divergence:  price makes a new high but RSI doesn\'t  →  reversal warning',
    ],
    pairsWith: 'Confirms Stochastic: when both agree, the signal is much stronger.',
    example: 'INDIGO\'s RSI here is in the low-30s after the steep drop. Oversold can stay oversold in a panic — wait for confirmation.',
  },
  {
    id: 5, eyebrow: 'Momentum · 05 of 13',
    title: 'Stochastic — Short-Term Momentum',
    targetId: 'stoch', dialogPos: 'right',
    body: 'Stochastic measures where today\'s close sits within the recent high-low range. If today closed near the high of the last 14 days, %K is near 100. Near the low? Near 0.',
    bullets: [
      '%K ABOVE 80  →  closing near recent highs (overbought)',
      '%K BELOW 20  →  closing near recent lows (oversold)',
      '%K crossing %D upward  →  short-term buy signal',
      '%K crossing %D downward  →  short-term sell signal',
    ],
    pairsWith: 'Stochastic is FASTER than RSI — it spots reversals first, but throws more false signals. RSI confirms.',
  },
  {
    id: 6, eyebrow: 'Momentum · 06 of 13',
    title: 'Williams %R — Inverted Overbought/Oversold',
    targetId: 'williams', dialogPos: 'left',
    body: 'Williams %R is essentially Stochastic on an inverted scale. It runs from 0 (top) to -100 (bottom). Useful for catching short-term turns.',
    bullets: [
      '%R ABOVE -20  →  overbought',
      '%R BELOW -80  →  oversold',
      'Best used in confirmed range-bound markets, not strong trends',
    ],
    pairsWith: 'When ALL three (RSI + Stochastic + Williams %R) agree, the reversal probability is near 80%.',
  },
  {
    id: 7, eyebrow: 'Momentum · 07 of 13',
    title: 'MACD — Trend + Momentum Combined',
    targetId: 'macd', dialogPos: 'left',
    body: 'MACD subtracts a slow MA (26-day) from a fast MA (12-day). When the fast pulls upward, MACD rises = momentum building. The Signal line is a 9-day MA of MACD.',
    bullets: [
      'MACD ABOVE Signal  →  momentum bullish',
      'MACD BELOW Signal  →  momentum bearish',
      'Histogram (MACD − Signal) growing  →  trend accelerating',
      'Histogram shrinking  →  trend weakening',
    ],
    pairsWith: 'Combine with ADX: MACD bull crossover + ADX rising = high-conviction trade.',
  },
  {
    id: 8, eyebrow: 'Volatility · 08 of 13',
    title: 'Bollinger Bands — Volatility Envelope',
    targetId: 'bollinger', dialogPos: 'right',
    body: 'Bollinger Bands draw a moving average plus two bands at two standard deviations. ~95% of price action stays inside the bands, so a band touch is meaningful.',
    bullets: [
      'Price near UPPER band  →  expensive vs. recent volatility',
      'Price near LOWER band  →  cheap vs. recent volatility',
      'Bands SQUEEZE tight  →  volatility compressed, big move incoming',
      'Bands EXPAND wide  →  trend or panic in progress',
      'Walking the band  →  strong trend, don\'t fight it',
    ],
    pairsWith: 'Lower-band + RSI < 30 = high-probability bounce. Upper-band + RSI > 70 = high-probability fade.',
  },
  {
    id: 9, eyebrow: 'Volatility · 09 of 13',
    title: 'ATR — How Big Is Today\'s Move?',
    targetId: 'atr', dialogPos: 'left',
    body: 'ATR is the average distance between daily highs and lows over the last 14 days, in absolute rupee terms. It tells you how big a "normal" daily move is for this stock.',
    bullets: [
      'High ATR  →  stock moves a lot, set wide stops',
      'Low ATR  →  stock is calm, tight stops are safe',
      'ATR doubling overnight  →  regime shift, recalibrate position size',
      'Use ATR to size stop-losses (e.g., entry − 2× ATR)',
    ],
    pairsWith: 'Bollinger Band width and ATR move together — both measure volatility, just differently.',
  },
  {
    id: 10, eyebrow: 'Volume · 10 of 13',
    title: 'OBV — On-Balance Volume',
    targetId: 'obv', dialogPos: 'right',
    body: 'OBV adds today\'s volume on green days and subtracts it on red days. It tells you whether real money is flowing IN or OUT, regardless of price level.',
    bullets: [
      'Price up + OBV up  →  trend confirmed by volume, ride it',
      'Price up + OBV flat or down  →  weak rally, money isn\'t following',
      'Price down + OBV up  →  bullish divergence, smart money accumulating',
      'Price down + OBV down  →  trend confirmed, distribution',
    ],
    pairsWith: 'OBV divergence is one of the most reliable early reversal signals — even before RSI or MACD.',
  },
  {
    id: 11, eyebrow: 'Volume · 11 of 13',
    title: 'VWAP — Institutional Benchmark',
    targetId: 'vwap', dialogPos: 'left',
    body: 'VWAP is the average price weighted by trading volume. It\'s the benchmark institutional traders measure their day\'s execution against.',
    bullets: [
      'Price ABOVE VWAP  →  intraday strength, buyers in control',
      'Price BELOW VWAP  →  intraday weakness, sellers in control',
      'Price returning to VWAP after stretch  →  mean-reversion play',
      'VWAP often acts as intraday support / resistance',
    ],
    pairsWith: 'For day trades, combine VWAP with Pivot Points — when both align, the level is much stronger.',
  },
  {
    id: 12, eyebrow: 'Levels · 12 of 13',
    title: 'Pivot Points & Fibonacci — Key Levels',
    targetId: 'levels', dialogPos: 'above',
    body: 'Pivot Points come from the previous day\'s High, Low, Close. They generate a central pivot plus 3 supports and 3 resistances. Fibonacci splits the recent swing into ratios (23.6%, 38.2%, 50%, 61.8%).',
    bullets: [
      'Both methods give pre-computed levels — many traders watch them, so they often "work"',
      'Bounce at 38.2% Fib  →  shallow retracement, trend continuation likely',
      'Bounce at 61.8% Fib  →  deep retracement, trend in question',
      'Pivot S1/S2/S3, R1/R2/R3 act as natural intraday stop / target zones',
    ],
    pairsWith: 'Combine with VWAP and chart S/R: the more methods that converge on the same price, the stronger the level.',
  },
  {
    id: 13, eyebrow: 'Verdict · 13 of 13',
    title: 'Putting It Together — Signal Confluence',
    targetId: 'verdict', dialogPos: 'above',
    body: 'No single indicator is enough — every one throws false signals 30–40% of the time. The professional approach is "confluence": only act when 3+ different indicators agree.',
    bullets: [
      'Trend (MA, ADX) + Momentum (RSI, MACD) + Volume (OBV) = classic confluence',
      'BUY when:  uptrend + RSI bouncing from oversold + OBV rising + price near support',
      'SELL when: downtrend + RSI rejecting from overbought + OBV falling + price near resistance',
      'STAY OUT when indicators are mixed — the market is telling you "I don\'t know either"',
    ],
    pairsWith: 'This panel does the confluence math automatically and gives you a tilt readout.',
    example: 'For INDIGO right now: trend down (MA20<MA50, ADX rising), momentum oversold but no reversal yet, volume distributing. Verdict: trend intact, no buy signal — wait for OBV to turn before buying any bounce.',
  },
]

// ───────────────────────────────────────────────────────────

export function TechnicalsTutorial({ open, onClose }: TechnicalsTutorialProps) {
  const [stepIdx, setStepIdx] = useState(0)
  const [bounds, setBounds] = useState<DOMRect | null>(null)
  const step = STEPS[stepIdx]

  // Reset on open
  useEffect(() => {
    if (open) setStepIdx(0)
  }, [open])

  // Scroll-to + measure target on step change
  useEffect(() => {
    if (!open) { setBounds(null); return }
    if (!step.targetId) { setBounds(null); return }

    const el = document.querySelector(`[data-tut="${step.targetId}"]`) as HTMLElement | null
    if (!el) { setBounds(null); return }

    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })

    let cancelled = false
    let raf = 0
    const tick = () => {
      if (cancelled) return
      setBounds(el.getBoundingClientRect())
    }
    // Measure after scroll animation roughly settles
    const t = setTimeout(tick, 380)

    const onUpdate = () => {
      if (cancelled) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setBounds(el.getBoundingClientRect()))
    }
    window.addEventListener('resize', onUpdate)
    window.addEventListener('scroll', onUpdate, true)
    return () => {
      cancelled = true
      clearTimeout(t)
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onUpdate)
      window.removeEventListener('scroll', onUpdate, true)
    }
  }, [open, stepIdx, step.targetId])

  function next() { if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1) }
  function prev() { if (stepIdx > 0) setStepIdx(stepIdx - 1) }
  function close() { setStepIdx(0); onClose() }

  if (!open) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      pointerEvents: 'auto',
    }}>
      {/* Backdrop */}
      <Backdrop bounds={bounds} />

      {/* Spotlight ring */}
      {bounds && step.targetId && (
        <div
          key={`ring-${step.id}`}
          style={{
            position: 'fixed',
            left: bounds.left - 6,
            top: bounds.top - 6,
            width: bounds.width + 12,
            height: bounds.height + 12,
            border: '2px solid #06B6D4',
            borderRadius: '12px',
            boxShadow: '0 0 28px rgba(6,182,212,0.6), 0 0 0 4px rgba(6,182,212,0.15)',
            pointerEvents: 'none',
            transition: 'left 0.25s, top 0.25s, width 0.25s, height 0.25s',
            animation: 'tut-ring-in 0.25s ease-out',
          }}
        />
      )}

      <Dialog
        step={step}
        bounds={bounds}
        stepIdx={stepIdx}
        total={STEPS.length}
        onPrev={prev}
        onNext={next}
        onClose={close}
        onJump={setStepIdx}
      />

      <style>{`
        @keyframes tut-ring-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes tut-dialog-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── Backdrop with cutout ──────────────────────────────────

function Backdrop({ bounds }: { bounds: DOMRect | null }) {
  if (!bounds) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.78)',
      }} />
    )
  }
  // Use mask cutout in viewport coordinates
  const cx = bounds.left + bounds.width / 2
  const cy = bounds.top + bounds.height / 2
  const w = bounds.width * 0.85
  const h = bounds.height * 1.1
  const mask = `radial-gradient(ellipse ${w}px ${h}px at ${cx}px ${cy}px, transparent 30%, #000 75%)`
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.78)',
      maskImage: mask,
      WebkitMaskImage: mask,
      transition: 'mask-image 0.25s, -webkit-mask-image 0.25s',
    }} />
  )
}

// ─── Dialog ─────────────────────────────────────────────────

function Dialog({
  step, bounds, stepIdx, total, onPrev, onNext, onClose, onJump,
}: {
  step: Step
  bounds: DOMRect | null
  stepIdx: number
  total: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  onJump: (idx: number) => void
}) {
  const dialogStyle = positionDialogViewport(step, bounds)

  return (
    <div
      key={`dialog-${step.id}`}
      style={{
        position: 'fixed',
        ...dialogStyle,
        width: '320px',
        maxHeight: '80vh',
        overflowY: 'auto',
        background: 'linear-gradient(180deg, #1A2028 0%, #11161D 100%)',
        border: '1px solid #06B6D4',
        borderRadius: '10px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.7), 0 0 30px rgba(6,182,212,0.20)',
        padding: '14px 16px 12px',
        color: '#F4EDE0',
        zIndex: 201,
        animation: 'tut-dialog-in 0.22s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GraduationCap size={12} color="#06B6D4"/>
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '9px', fontWeight: 700, color: '#06B6D4',
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>{step.eyebrow}</span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close tutorial"
          style={{
            width: '20px', height: '20px',
            background: 'rgba(6,182,212,0.10)',
            border: '1px solid rgba(6,182,212,0.4)',
            borderRadius: '4px',
            color: '#06B6D4',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={11}/>
        </button>
      </div>

      <div style={{
        fontFamily: 'var(--font-fraunces), serif',
        fontWeight: 600, fontSize: '17px',
        color: '#F4EDE0', letterSpacing: '0.02em', lineHeight: 1.2,
        marginBottom: '8px',
      }}>{step.title}</div>

      <p style={{
        fontFamily: 'var(--font-fraunces), serif',
        fontSize: '12.5px', color: '#D9CFB8', lineHeight: 1.55, margin: 0,
      }}>{step.body}</p>

      {step.bullets && step.bullets.length > 0 && (
        <ul style={{
          margin: '8px 0 0', padding: 0, listStyle: 'none',
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {step.bullets.map((b, i) => (
            <li key={i} style={{
              display: 'flex', gap: '6px',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '11.5px', color: '#A89A7E', lineHeight: 1.45,
            }}>
              <span style={{ color: '#06B6D4', fontWeight: 700, flexShrink: 0, fontSize: '10px' }}>◆</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {step.pairsWith && (
        <div style={{
          marginTop: '10px',
          padding: '8px 10px',
          background: 'rgba(168,85,247,0.08)',
          border: '1px solid rgba(168,85,247,0.3)',
          borderLeft: '3px solid #A855F7',
          borderRadius: '4px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '11px', color: '#D9CFB8', lineHeight: 1.5,
        }}>
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '8px', fontWeight: 700, color: '#A855F7',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            display: 'block', marginBottom: '3px',
          }}>⤥ How it pairs</span>
          {step.pairsWith}
        </div>
      )}

      {step.example && (
        <div style={{
          marginTop: '10px',
          padding: '8px 10px',
          background: 'rgba(6,182,212,0.08)',
          border: '1px solid rgba(6,182,212,0.3)',
          borderLeft: '3px solid #06B6D4',
          borderRadius: '4px',
          fontFamily: 'var(--font-fraunces), serif',
          fontStyle: 'italic',
          fontSize: '11.5px', color: '#D9CFB8', lineHeight: 1.5,
        }}>
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontStyle: 'normal',
            fontSize: '8px', fontWeight: 700, color: '#06B6D4',
            letterSpacing: '0.2em', textTransform: 'uppercase',
            display: 'block', marginBottom: '3px',
          }}>✦ In this stock</span>
          {step.example}
        </div>
      )}

      <div style={{
        marginTop: '12px', paddingTop: '10px',
        borderTop: '1px solid rgba(6,182,212,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
      }}>
        <button
          onClick={onPrev}
          disabled={stepIdx === 0}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 10px',
            background: 'transparent',
            border: '1px solid rgba(6,182,212,0.3)',
            borderRadius: '5px',
            color: stepIdx === 0 ? '#5C5849' : '#06B6D4',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
            cursor: stepIdx === 0 ? 'not-allowed' : 'pointer',
            opacity: stepIdx === 0 ? 0.4 : 1,
          }}
        ><ChevronLeft size={12}/> Back</button>

        <div style={{ display: 'flex', gap: '3px' }}>
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => onJump(i)}
              aria-label={`Go to step ${i + 1}`}
              style={{
                width: '5px', height: '5px',
                borderRadius: '50%',
                background: i === stepIdx ? '#06B6D4' : 'rgba(6,182,212,0.2)',
                border: 'none', padding: 0, cursor: 'pointer',
                boxShadow: i === stepIdx ? '0 0 6px rgba(6,182,212,0.7)' : 'none',
              }}
            />
          ))}
        </div>

        <button
          onClick={stepIdx === total - 1 ? onClose : onNext}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 14px',
            background: 'linear-gradient(180deg, #06B6D4, #0E7490)',
            border: '1px solid #06B6D4',
            borderRadius: '5px',
            color: '#0B0F15',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(6,182,212,0.4)',
            textTransform: 'uppercase',
          }}
        >
          {stepIdx === total - 1 ? 'Finish' : 'Next'}
          {stepIdx < total - 1 && <ChevronRight size={12}/>}
        </button>
      </div>
    </div>
  )
}

// ─── Dialog positioning in viewport coords ─────────────────

function positionDialogViewport(step: Step, bounds: DOMRect | null): React.CSSProperties {
  // No bounds → center on viewport
  if (!bounds || step.dialogPos === 'center') {
    return {
      left: '50%',
      top: '50%',
      transform: 'translate(-50%, -50%)',
    }
  }

  const dialogW = 320
  const dialogH = 380
  const margin = 16
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280

  const roomRight = vw - bounds.right - margin
  const roomLeft  = bounds.left - margin
  const roomBelow = vh - bounds.bottom - margin
  const roomAbove = bounds.top - margin
  const fitsRight = roomRight >= dialogW + 12
  const fitsLeft  = roomLeft  >= dialogW + 12
  const fitsBelow = roomBelow >= dialogH + 12
  const fitsAbove = roomAbove >= dialogH + 12

  type Side = 'right' | 'left' | 'below' | 'above' | 'center'
  const order: Side[] = (() => {
    switch (step.dialogPos) {
      case 'right': return ['right', 'left', 'below', 'above', 'center']
      case 'left':  return ['left', 'right', 'below', 'above', 'center']
      case 'below': return ['below', 'above', 'right', 'left', 'center']
      case 'above': return ['above', 'below', 'right', 'left', 'center']
    }
  })()

  const cy = bounds.top + bounds.height / 2

  for (const side of order) {
    if (side === 'right' && fitsRight) return { left: `${bounds.right + margin}px`, top: `${clamp(cy, vh * 0.16, vh * 0.84)}px`, transform: 'translateY(-50%)' }
    if (side === 'left'  && fitsLeft)  return { right: `${vw - bounds.left + margin}px`, top: `${clamp(cy, vh * 0.16, vh * 0.84)}px`, transform: 'translateY(-50%)' }
    if (side === 'below' && fitsBelow) return { left: `${clamp(bounds.left + bounds.width / 2, vw * 0.2, vw * 0.8)}px`, top: `${bounds.bottom + margin}px`, transform: 'translateX(-50%)' }
    if (side === 'above' && fitsAbove) return { left: `${clamp(bounds.left + bounds.width / 2, vw * 0.2, vw * 0.8)}px`, bottom: `${vh - bounds.top + margin}px`, transform: 'translateX(-50%)' }
    if (side === 'center')             return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  }
  return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}
