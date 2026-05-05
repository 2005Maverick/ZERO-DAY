'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'

interface Props { open: boolean; onClose: () => void }
interface Step {
  id: number; title: string; eyebrow: string
  targetId: string | null
  dialogPos: 'right' | 'left' | 'below' | 'above' | 'center'
  body: string
  bullets?: string[]
  pairsWith?: string
  example?: string
}

const ACCENT = '#5AB088'

const STEPS: Step[] = [
  {
    id: 1, eyebrow: 'Foundation · 01 of 12',
    title: 'What Are Fundamentals?',
    targetId: null, dialogPos: 'center',
    body: 'Fundamentals are the actual business performance numbers — how much the company earns, how much it owes, how efficiently it runs. Where technicals tell you what the market THINKS, fundamentals tell you what the business IS.',
    bullets: [
      'Valuation ratios — is the stock cheap or expensive?',
      'Profitability — how much profit per rupee of sales / capital?',
      'Health — can it pay its bills? what\'s the leverage?',
      'Growth — is the business expanding or shrinking?',
    ],
    pairsWith: 'Fundamentals tell you WHAT to buy. Technicals tell you WHEN.',
  },
  {
    id: 2, eyebrow: 'Valuation · 02 of 12',
    title: 'P/E Ratio — Price-to-Earnings',
    targetId: 'pe', dialogPos: 'right',
    body: 'Price ÷ Earnings per Share. Tells you how many rupees of stock price you\'re paying for each rupee of annual profit.',
    bullets: [
      'P/E = 18  →  paying ₹18 for every ₹1 of yearly profit',
      'High P/E (>30)  →  market expects big future growth',
      'Low P/E (<10)  →  market is sceptical, OR a bargain',
      'Always compare against the SECTOR average, not market average',
    ],
    pairsWith: 'Combine with EPS growth: P/E 30 is fine if EPS is growing 30%/year, terrible if EPS is flat.',
  },
  {
    id: 3, eyebrow: 'Valuation · 03 of 12',
    title: 'EPS — Earnings per Share',
    targetId: 'eps', dialogPos: 'right',
    body: 'Net profit divided by total shares outstanding. The "per share" version of company profit — how much your single share earned this year.',
    bullets: [
      'Higher EPS  →  more profit per share',
      'Track it YEAR OVER YEAR — the trend matters more than absolute value',
      'Diluted EPS includes potential new shares (employee options) — more conservative',
      'Negative EPS  →  the company is losing money',
    ],
    pairsWith: 'EPS growth × current P/E ≈ next year\'s expected price (a rough but useful heuristic).',
  },
  {
    id: 4, eyebrow: 'Valuation · 04 of 12',
    title: 'Market Cap — How Big Is This Company?',
    targetId: 'mcap', dialogPos: 'right',
    body: 'Market Cap = Stock Price × Total Shares. The total rupee value the market puts on the entire company.',
    bullets: [
      'Large cap (>₹50,000 Cr)  →  stable, slow-moving, defensive',
      'Mid cap (₹10K–50K Cr)   →  growing, more volatile',
      'Small cap (<₹10K Cr)     →  high risk, high reward',
      'Compare to total assets — high mcap/asset = market loves the brand',
    ],
    pairsWith: 'Combine with the 52W range: a stock down 50% from its high but still ₹50K Cr mcap is being deeply discounted.',
  },
  {
    id: 5, eyebrow: 'Risk · 05 of 12',
    title: 'Beta — Volatility vs Market',
    targetId: 'beta', dialogPos: 'left',
    body: 'Beta measures how much a stock moves compared to the broader market (Nifty 50). Beta of 1 = moves the same; 1.5 = moves 50% more; 0.5 = moves 50% less.',
    bullets: [
      'Beta > 1.5  →  high-beta — amplifies market moves both ways',
      'Beta 0.8–1.2 →  market-correlated, average risk',
      'Beta < 0.5  →  defensive — moves less than market (utilities, FMCG)',
      'Beta < 0    →  inverse correlation (rare — gold, some hedges)',
    ],
    pairsWith: 'Position size by beta: a beta-1.5 stock sized at ₹10K is risk-equivalent to a beta-1.0 stock at ₹15K.',
  },
  {
    id: 6, eyebrow: 'Income · 06 of 12',
    title: 'Dividend Yield — Cash Returned',
    targetId: 'divyield', dialogPos: 'left',
    body: 'Annual dividend ÷ stock price. The cash return you receive each year just for holding the stock, expressed as a percentage.',
    bullets: [
      'Yield > 4%  →  income stock (typically utilities, REITs, banks)',
      'Yield 1–3%  →  blended growth + income',
      'Yield 0%   →  pure growth stock — reinvests all profits',
      'Yield rising sharply  →  often a "yield trap" — price falling fast',
    ],
    pairsWith: 'Compare yield to 10-year G-Sec rate. If yield > G-Sec, the dividend is paying you to wait.',
  },
  {
    id: 7, eyebrow: 'Range · 07 of 12',
    title: '52-Week Range — Where Does Price Sit?',
    targetId: 'range52', dialogPos: 'left',
    body: 'The lowest and highest price the stock has touched in the last 52 weeks. Tells you where today\'s price sits in the year-long context.',
    bullets: [
      'Near 52W low  →  stock is beaten down — value or warning?',
      'Near 52W high  →  momentum is strong — but late entry risk',
      'Mid-range  →  no clear edge from this metric alone',
      'Just broke 52W high  →  often a continuation breakout signal',
    ],
    pairsWith: 'Check why it\'s at the low — sector-wide selloff (transient) vs company-specific issue (real).',
  },
  {
    id: 8, eyebrow: 'P&L · 08 of 12',
    title: 'Revenue & Profit — Top + Bottom Line',
    targetId: 'pl', dialogPos: 'right',
    body: 'Revenue is total money coming in (top of income statement). Net Profit is what\'s left after all expenses (bottom). EBITDA is profit before tax + depreciation + interest — the "operating engine" measure.',
    bullets: [
      'Revenue growing, profit shrinking  →  costs rising faster than sales',
      'Revenue flat, profit growing  →  margin expansion (good!)',
      'Both growing 20%+  →  high-quality compounder',
      'Both shrinking  →  business in decline, avoid',
    ],
    pairsWith: 'EBITDA margin = EBITDA / Revenue. Industry-leading margins are a moat.',
    example: 'INDIGO\'s revenue grew +26% YoY but profit fell -94% — costs (fuel, leases) ate the margin.',
  },
  {
    id: 9, eyebrow: 'Balance Sheet · 09 of 12',
    title: 'Assets vs Liabilities — The Snapshot',
    targetId: 'bs', dialogPos: 'above',
    body: 'A balance sheet is a snapshot at one moment: what the company OWNS (assets) and OWES (liabilities). The difference is shareholder equity — what\'s left for owners.',
    bullets: [
      'Assets = Liabilities + Equity (always — that\'s why it "balances")',
      'Liabilities > 70% of assets  →  highly leveraged',
      'Liabilities < 40% of assets  →  conservative, lots of cushion',
      'Cash position > Liabilities  →  fortress balance sheet (TCS, Infy)',
    ],
    pairsWith: 'Always check it WITH the income statement: a company with growing profits but ballooning liabilities is borrowing to fund growth.',
  },
  {
    id: 10, eyebrow: 'Health · 10 of 12',
    title: 'D/E Ratio — How Much Borrowed?',
    targetId: 'de', dialogPos: 'left',
    body: 'Debt / Equity = how much of the company is funded by borrowing vs by owners. Higher = more risk if business slows.',
    bullets: [
      'D/E < 0.5  →  conservative, plenty of room',
      'D/E 0.5–1.0  →  normal for most sectors',
      'D/E > 1.5  →  highly leveraged, sensitive to interest rates',
      'BUT: banks and capital-heavy businesses (airlines) naturally run high D/E — compare against sector!',
    ],
    pairsWith: 'In a recession, high-D/E stocks sell off first — they can\'t cover debt service when revenue dips.',
  },
  {
    id: 11, eyebrow: 'Health · 11 of 12',
    title: 'Current Ratio — Can It Pay This Year\'s Bills?',
    targetId: 'cr', dialogPos: 'left',
    body: 'Current Assets ÷ Current Liabilities. Both numerator and denominator are short-term (within 1 year). It tells you if the company has enough liquid assets to cover what\'s due soon.',
    bullets: [
      'CR > 1.5  →  comfortably solvent',
      'CR 1.0–1.5 →  adequate, watch trend',
      'CR < 1.0  →  liquidity tight — could miss obligations',
      'CR > 3.0  →  too much idle cash, capital not being put to work',
    ],
    pairsWith: 'CR + D/E together: low D/E + high CR = fortress; high D/E + low CR = distress risk.',
  },
  {
    id: 12, eyebrow: 'Verdict · 12 of 12',
    title: 'Putting It Together — Quality Verdict',
    targetId: 'verdict', dialogPos: 'above',
    body: 'A "good" fundamental setup has FOUR things working together: reasonable valuation (P/E vs sector), growing earnings (EPS up), healthy balance sheet (D/E low, CR > 1), and a moat (high margins or market share).',
    bullets: [
      'Valuation OK + Growth + Health + Moat  =  long-term compounder',
      'Cheap valuation + falling earnings  =  value trap, avoid',
      'High valuation + slowing growth  =  expensive, expect derating',
      'Fortress balance sheet  =  survives downturns, gains share when peers struggle',
    ],
    pairsWith: 'Use fundamentals to build a watchlist of WHAT to own. Use technicals to time WHEN to enter.',
  },
]

export function FundamentalsTutorial({ open, onClose }: Props) {
  return <TutorialShell open={open} onClose={onClose} steps={STEPS} accent={ACCENT}/>
}

// ─── Generic shell (reused in news + sector tutorials) ─────

interface ShellProps {
  open: boolean
  onClose: () => void
  steps: Step[]
  accent: string
}

export function TutorialShell({ open, onClose, steps, accent }: ShellProps) {
  const [stepIdx, setStepIdx] = useState(0)
  const [bounds, setBounds] = useState<DOMRect | null>(null)
  const step = steps[stepIdx]

  useEffect(() => { if (open) setStepIdx(0) }, [open])

  useEffect(() => {
    if (!open) { setBounds(null); return }
    if (!step.targetId) { setBounds(null); return }
    const el = document.querySelector(`[data-tut="${step.targetId}"]`) as HTMLElement | null
    if (!el) { setBounds(null); return }
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    let cancelled = false
    let raf = 0
    const t = setTimeout(() => { if (!cancelled) setBounds(el.getBoundingClientRect()) }, 380)
    const onUpdate = () => {
      if (cancelled) return
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setBounds(el.getBoundingClientRect()))
    }
    window.addEventListener('resize', onUpdate)
    window.addEventListener('scroll', onUpdate, true)
    return () => {
      cancelled = true; clearTimeout(t); cancelAnimationFrame(raf)
      window.removeEventListener('resize', onUpdate)
      window.removeEventListener('scroll', onUpdate, true)
    }
  }, [open, stepIdx, step.targetId])

  function next() { if (stepIdx < steps.length - 1) setStepIdx(stepIdx + 1) }
  function prev() { if (stepIdx > 0) setStepIdx(stepIdx - 1) }
  function close() { setStepIdx(0); onClose() }

  if (!open) return null

  const accentRgba = (alpha: number) => {
    const r = parseInt(accent.slice(1, 3), 16)
    const g = parseInt(accent.slice(3, 5), 16)
    const b = parseInt(accent.slice(5, 7), 16)
    return `rgba(${r},${g},${b},${alpha})`
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <Backdrop bounds={bounds}/>
      {bounds && step.targetId && (
        <div style={{
          position: 'fixed',
          left: bounds.left - 6,
          top: bounds.top - 6,
          width: bounds.width + 12,
          height: bounds.height + 12,
          border: `2px solid ${accent}`,
          borderRadius: '12px',
          boxShadow: `0 0 28px ${accentRgba(0.6)}, 0 0 0 4px ${accentRgba(0.15)}`,
          pointerEvents: 'none',
          transition: 'left 0.25s, top 0.25s, width 0.25s, height 0.25s',
        }}/>
      )}
      <Dialog
        step={step} bounds={bounds} stepIdx={stepIdx} total={steps.length}
        onPrev={prev} onNext={next} onClose={close} onJump={setStepIdx}
        accent={accent}
      />
      <style>{`
        @keyframes tut-dialog-in { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  )
}

function Backdrop({ bounds }: { bounds: DOMRect | null }) {
  if (!bounds) return <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)' }}/>
  const cx = bounds.left + bounds.width / 2
  const cy = bounds.top + bounds.height / 2
  const w = bounds.width * 0.85
  const h = bounds.height * 1.1
  const mask = `radial-gradient(ellipse ${w}px ${h}px at ${cx}px ${cy}px, transparent 30%, #000 75%)`
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.78)',
      maskImage: mask, WebkitMaskImage: mask,
      transition: 'mask-image 0.25s, -webkit-mask-image 0.25s',
    }}/>
  )
}

function Dialog({
  step, bounds, stepIdx, total, onPrev, onNext, onClose, onJump, accent,
}: {
  step: Step; bounds: DOMRect | null
  stepIdx: number; total: number
  onPrev: () => void; onNext: () => void; onClose: () => void; onJump: (i: number) => void
  accent: string
}) {
  const dialogStyle = positionDialogViewport(step, bounds)
  return (
    <div
      key={`d-${step.id}`}
      style={{
        position: 'fixed',
        ...dialogStyle,
        width: '320px',
        maxHeight: '80vh',
        overflowY: 'auto',
        background: 'linear-gradient(180deg, #1A2028 0%, #11161D 100%)',
        border: `1px solid ${accent}`,
        borderRadius: '10px',
        boxShadow: `0 24px 48px rgba(0,0,0,0.7), 0 0 30px ${accent}30`,
        padding: '14px 16px 12px',
        color: '#F4EDE0',
        zIndex: 201,
        animation: 'tut-dialog-in 0.22s ease-out',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GraduationCap size={12} color={accent}/>
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif', fontSize: '9px',
            fontWeight: 700, color: accent,
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>{step.eyebrow}</span>
        </div>
        <button onClick={onClose} aria-label="Close tutorial" style={{
          width: '20px', height: '20px',
          background: `${accent}1A`, border: `1px solid ${accent}66`,
          borderRadius: '4px', color: accent,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><X size={11}/></button>
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
              <span style={{ color: accent, fontWeight: 700, flexShrink: 0, fontSize: '10px' }}>◆</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {step.pairsWith && (
        <div style={{
          marginTop: '10px', padding: '8px 10px',
          background: 'rgba(168,85,247,0.08)',
          border: '1px solid rgba(168,85,247,0.3)',
          borderLeft: '3px solid #A855F7', borderRadius: '4px',
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
          marginTop: '10px', padding: '8px 10px',
          background: `${accent}14`, border: `1px solid ${accent}50`,
          borderLeft: `3px solid ${accent}`, borderRadius: '4px',
          fontFamily: 'var(--font-fraunces), serif',
          fontStyle: 'italic',
          fontSize: '11.5px', color: '#D9CFB8', lineHeight: 1.5,
        }}>
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif', fontStyle: 'normal',
            fontSize: '8px', fontWeight: 700, color: accent,
            letterSpacing: '0.2em', textTransform: 'uppercase',
            display: 'block', marginBottom: '3px',
          }}>✦ In this stock</span>
          {step.example}
        </div>
      )}

      <div style={{
        marginTop: '12px', paddingTop: '10px',
        borderTop: `1px solid ${accent}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
      }}>
        <button onClick={onPrev} disabled={stepIdx === 0} style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '6px 10px', background: 'transparent',
          border: `1px solid ${accent}50`, borderRadius: '5px',
          color: stepIdx === 0 ? '#5C5849' : accent,
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em',
          cursor: stepIdx === 0 ? 'not-allowed' : 'pointer',
          opacity: stepIdx === 0 ? 0.4 : 1,
        }}><ChevronLeft size={12}/> Back</button>
        <div style={{ display: 'flex', gap: '3px' }}>
          {Array.from({ length: total }).map((_, i) => (
            <button key={i} onClick={() => onJump(i)} aria-label={`Go to step ${i + 1}`} style={{
              width: '5px', height: '5px', borderRadius: '50%',
              background: i === stepIdx ? accent : `${accent}30`,
              border: 'none', padding: 0, cursor: 'pointer',
              boxShadow: i === stepIdx ? `0 0 6px ${accent}b3` : 'none',
            }}/>
          ))}
        </div>
        <button onClick={stepIdx === total - 1 ? onClose : onNext} style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '6px 14px',
          background: `linear-gradient(180deg, ${accent}, ${accent}c0)`,
          border: `1px solid ${accent}`, borderRadius: '5px',
          color: '#0B0F15',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em',
          cursor: 'pointer',
          boxShadow: `0 4px 10px ${accent}66`,
          textTransform: 'uppercase',
        }}>
          {stepIdx === total - 1 ? 'Finish' : 'Next'}
          {stepIdx < total - 1 && <ChevronRight size={12}/>}
        </button>
      </div>
    </div>
  )
}

function positionDialogViewport(step: Step, bounds: DOMRect | null): React.CSSProperties {
  if (!bounds || step.dialogPos === 'center') {
    return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  }
  const dialogW = 320
  const dialogH = 380             // conservative estimate
  const margin = 16
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280

  // Available room on each side
  const roomRight = vw - bounds.right - margin
  const roomLeft  = bounds.left - margin
  const roomBelow = vh - bounds.bottom - margin
  const roomAbove = bounds.top - margin

  const fitsRight = roomRight >= dialogW + 12
  const fitsLeft  = roomLeft  >= dialogW + 12
  const fitsBelow = roomBelow >= dialogH + 12
  const fitsAbove = roomAbove >= dialogH + 12

  // Cascade: requested → opposite → below → above → center
  type Side = 'right' | 'left' | 'below' | 'above' | 'center'
  const order: Side[] = (() => {
    switch (step.dialogPos) {
      case 'right': return ['right', 'left', 'below', 'above', 'center']
      case 'left':  return ['left', 'right', 'below', 'above', 'center']
      case 'below': return ['below', 'above', 'right', 'left', 'center']
      case 'above': return ['above', 'below', 'right', 'left', 'center']
    }
  })()

  for (const side of order) {
    if (side === 'right' && fitsRight) return positionRight(bounds, margin, vh)
    if (side === 'left'  && fitsLeft)  return positionLeft(bounds, margin, vh, vw)
    if (side === 'below' && fitsBelow) return positionBelow(bounds, margin, vw)
    if (side === 'above' && fitsAbove) return positionAbove(bounds, margin, vh, vw)
    if (side === 'center')             return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  }
  return { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
}

function positionRight(b: DOMRect, m: number, vh: number): React.CSSProperties {
  const cy = b.top + b.height / 2
  return { left: `${b.right + m}px`, top: `${clamp(cy, vh * 0.16, vh * 0.84)}px`, transform: 'translateY(-50%)' }
}
function positionLeft(b: DOMRect, m: number, vh: number, vw: number): React.CSSProperties {
  const cy = b.top + b.height / 2
  return { right: `${vw - b.left + m}px`, top: `${clamp(cy, vh * 0.16, vh * 0.84)}px`, transform: 'translateY(-50%)' }
}
function positionBelow(b: DOMRect, m: number, vw: number): React.CSSProperties {
  return { left: `${clamp(b.left + b.width / 2, vw * 0.2, vw * 0.8)}px`, top: `${b.bottom + m}px`, transform: 'translateX(-50%)' }
}
function positionAbove(b: DOMRect, m: number, vh: number, vw: number): React.CSSProperties {
  return { left: `${clamp(b.left + b.width / 2, vw * 0.2, vw * 0.8)}px`, bottom: `${vh - b.top + m}px`, transform: 'translateX(-50%)' }
}
function clamp(v: number, lo: number, hi: number): number { return Math.max(lo, Math.min(hi, v)) }
