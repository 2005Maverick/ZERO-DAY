'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react'

interface ChartTutorialProps {
  open: boolean
  onClose: () => void
}

interface Step {
  id: number
  title: string
  eyebrow: string
  /** target box on the chart (percent of container) */
  target: { left: string; top: string; width: string; height: string }
  /** where to anchor the dialog relative to target */
  dialogPos: 'right' | 'left' | 'below' | 'above'
  body: string
  bullets?: string[]
  example?: string
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'The Candlestick — Anatomy',
    eyebrow: 'Foundation · 01 of 09',
    target: { left: '52%', top: '18%', width: '6%', height: '40%' },
    dialogPos: 'right',
    body: 'Each rectangle is one trading day, called a "candle." It packs four numbers — Open, High, Low, Close — into a single glyph. The thick rectangle is the body; the thin lines above and below are wicks (or shadows).',
    bullets: [
      'Top of the body  →  whichever is greater: open OR close',
      'Bottom of the body  →  whichever is smaller: open OR close',
      'Top of the wick  →  the day\'s highest price',
      'Bottom of the wick  →  the day\'s lowest price',
    ],
  },
  {
    id: 2,
    title: 'Green Candle — Bullish Day',
    eyebrow: 'Color Code · 02 of 09',
    target: { left: '14%', top: '14%', width: '5%', height: '12%' },
    dialogPos: 'right',
    body: 'A green (or hollow) body means the closing price was higher than the opening price. Buyers won the day — the stock gained ground from open to close.',
    bullets: [
      'Bottom of body  =  Open price',
      'Top of body  =  Close price (higher)',
      'Bigger body  =  more decisive buying pressure',
    ],
    example: 'The 4 March green candle here closed +₹18 above its open, with a small lower wick — buyers absorbed every dip.',
  },
  {
    id: 3,
    title: 'Red Candle — Bearish Day',
    eyebrow: 'Color Code · 03 of 09',
    target: { left: '32%', top: '24%', width: '5%', height: '24%' },
    dialogPos: 'right',
    body: 'A red (or filled) body means the closing price was lower than the opening price. Sellers dominated — the stock lost ground from open to close.',
    bullets: [
      'Top of body  =  Open price',
      'Bottom of body  =  Close price (lower)',
      'Long red body  =  decisive selling, often institutional',
    ],
    example: 'On 6 March, INDIGO opened near ₹1,335 and closed near ₹1,260 — a wide red body marks panic distribution.',
  },
  {
    id: 4,
    title: 'Wicks — The Day\'s Extremes',
    eyebrow: 'Anatomy · 04 of 09',
    target: { left: '76%', top: '40%', width: '5%', height: '30%' },
    dialogPos: 'left',
    body: 'The thin lines above and below the body are called wicks (or shadows). They mark the highest and lowest prices touched during the session, even if price didn\'t close there.',
    bullets: [
      'Long upper wick  →  rejected at higher prices, sellers stepped in',
      'Long lower wick  →  rejected at lower prices, buyers defended',
      'No wick  →  open or close was exactly the day\'s extreme',
      'Wick on both sides  →  indecision (see "Doji" later)',
    ],
  },
  {
    id: 5,
    title: 'Volume — The Conviction Behind the Move',
    eyebrow: 'Confirmation · 05 of 09',
    target: { left: '4%', top: '78%', width: '92%', height: '18%' },
    dialogPos: 'above',
    body: 'The bars below the chart show volume — how many shares traded that day. Volume tells you whether a price move had real money behind it.',
    bullets: [
      'Tall green bar  →  big day, lots of buying',
      'Tall red bar  →  big day, lots of selling',
      'Price up + volume up  →  trend is healthy',
      'Price up + volume down  →  weak rally, watch for reversal',
      'Spike day  →  often a trend turning point',
    ],
    example: 'Volume on the 6 March red candle is 2.1× the 30-day average — institutional desks were repositioning ahead of Covid news.',
  },
  {
    id: 6,
    title: 'Price Grid & Scale',
    eyebrow: 'Reading the Page · 06 of 09',
    target: { left: '93%', top: '8%', width: '7%', height: '70%' },
    dialogPos: 'left',
    body: 'The numbers down the right edge are the price scale. Horizontal dashed lines at each level help you measure how far price has moved.',
    bullets: [
      'Lines auto-snap to round numbers (₹1,260 / ₹1,280 / ₹1,300)',
      'Solid amber line + tag  →  current closing price',
      'Larger gap between levels  →  bigger move needed to "feel" something',
    ],
  },
  {
    id: 7,
    title: 'Trend — The Big Picture',
    eyebrow: 'Pattern · 07 of 09',
    target: { left: '4%', top: '14%', width: '92%', height: '60%' },
    dialogPos: 'below',
    body: 'Step back from individual candles and look at the overall slope. A series of higher highs and higher lows is an uptrend; lower highs and lower lows is a downtrend.',
    bullets: [
      'Uptrend  →  trade pullbacks as buying opportunities',
      'Downtrend  →  rallies are usually selling opportunities',
      'Sideways / range  →  buy near support, sell near resistance',
      'Trend changes are usually marked by climactic volume + a reversal candle',
    ],
    example: 'INDIGO over this 30-day window prints lower highs and lower lows — a textbook downtrend. Each green bounce is shorter than the previous red leg.',
  },
  {
    id: 8,
    title: 'Support & Resistance Levels',
    eyebrow: 'Pattern · 08 of 09',
    target: { left: '4%', top: '60%', width: '92%', height: '12%' },
    dialogPos: 'above',
    body: 'Horizontal price levels where the stock has reversed multiple times. Support is a floor where buyers historically defend; resistance is a ceiling where sellers historically appear.',
    bullets: [
      'A level becomes "support" after price bounces off it 2+ times',
      'When support breaks, it often becomes resistance on a retest',
      'Round numbers (₹1,200, ₹1,250, ₹1,300) often act as psychological levels',
      'The more times a level holds, the more important it is — but also the more violent the break when it fails',
    ],
  },
  {
    id: 9,
    title: 'Doji — Indecision Pattern',
    eyebrow: 'Reversal · 09 of 09',
    target: { left: '44%', top: '40%', width: '4%', height: '14%' },
    dialogPos: 'right',
    body: 'A "doji" is a candle where open and close are nearly identical — the body is a thin line. Long wicks on both sides. It means buyers and sellers fought to a tie.',
    bullets: [
      'A doji at the top of an uptrend  →  potential reversal warning',
      'A doji at the bottom of a downtrend  →  selling exhaustion',
      'A doji in the middle of a range  →  mostly noise, ignore',
      'Always wait for the NEXT candle to confirm what the doji is signaling',
    ],
    example: 'The pattern always needs context — a doji alone tells you "uncertainty." It\'s the candles around it that tell you what the uncertainty resolves into.',
  },
]

/**
 * Chart Tutorial — full-overlay step-by-step explainer.
 * Highlights regions of the chart with a spotlight + dialog callout.
 */
export function ChartTutorial({ open, onClose }: ChartTutorialProps) {
  const [stepIdx, setStepIdx] = useState(0)
  const step = STEPS[stepIdx]

  function next() { if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1) }
  function prev() { if (stepIdx > 0) setStepIdx(stepIdx - 1) }
  function close() { setStepIdx(0); onClose() }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 50,
            pointerEvents: 'auto',
          }}
        >
          {/* Spotlight backdrop using clip-path mask */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.74)',
            // soft cutout via mask
            maskImage: `radial-gradient(ellipse calc(${step.target.width} * 1.4) calc(${step.target.height} * 1.6) at calc(${step.target.left} + ${step.target.width} / 2) calc(${step.target.top} + ${step.target.height} / 2), transparent 30%, #000 75%)`,
            WebkitMaskImage: `radial-gradient(ellipse calc(${step.target.width} * 1.4) calc(${step.target.height} * 1.6) at calc(${step.target.left} + ${step.target.width} / 2) calc(${step.target.top} + ${step.target.height} / 2), transparent 30%, #000 75%)`,
          }} />

          {/* Spotlight ring */}
          <motion.div
            key={`ring-${step.id}`}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              left: step.target.left,
              top: step.target.top,
              width: step.target.width,
              height: step.target.height,
              border: '2px solid #D4A04D',
              borderRadius: '6px',
              boxShadow: '0 0 24px rgba(212,160,77,0.6), 0 0 0 4px rgba(212,160,77,0.16)',
              pointerEvents: 'none',
            }}
          />

          {/* Dialog */}
          <Dialog
            step={step}
            stepIdx={stepIdx}
            total={STEPS.length}
            onPrev={prev}
            onNext={next}
            onClose={close}
            onJump={setStepIdx}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Dialog box ────────────────────────────────────────────

function Dialog({
  step, stepIdx, total, onPrev, onNext, onClose, onJump,
}: {
  step: Step
  stepIdx: number
  total: number
  onPrev: () => void
  onNext: () => void
  onClose: () => void
  onJump: (idx: number) => void
}) {
  const dialogStyle = positionDialog(step)
  return (
    <div
      key={`dialog-${step.id}`}
      style={{
        position: 'absolute',
        ...dialogStyle,
        width: '300px',
        maxHeight: '92%',
        overflowY: 'auto',
        background: 'linear-gradient(180deg, #1A2028 0%, #11161D 100%)',
        border: '1px solid #D4A04D',
        borderRadius: '10px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.7), 0 0 30px rgba(212,160,77,0.18)',
        padding: '14px 16px 12px',
        color: '#F4EDE0',
        zIndex: 51,
        animation: 'tut-dialog-in 0.22s ease-out',
      }}
    >
      <style>{`
        @keyframes tut-dialog-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
      {/* Eyebrow + close */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <GraduationCap size={12} color="#D4A04D"/>
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '9px',
            fontWeight: 700,
            color: '#D4A04D',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}>
            {step.eyebrow}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close tutorial"
          style={{
            width: '20px', height: '20px',
            background: 'rgba(212,160,77,0.08)',
            border: '1px solid rgba(212,160,77,0.3)',
            borderRadius: '4px',
            color: '#D4A04D',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={11}/>
        </button>
      </div>

      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-fraunces), serif',
        fontWeight: 600,
        fontSize: '17px',
        color: '#F4EDE0',
        letterSpacing: '0.02em',
        lineHeight: 1.2,
        marginBottom: '8px',
      }}>
        {step.title}
      </div>

      {/* Body */}
      <p style={{
        fontFamily: 'var(--font-fraunces), serif',
        fontSize: '12.5px',
        color: '#D9CFB8',
        lineHeight: 1.55,
        margin: 0,
      }}>
        {step.body}
      </p>

      {/* Bullets */}
      {step.bullets && step.bullets.length > 0 && (
        <ul style={{
          margin: '8px 0 0',
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {step.bullets.map((b, i) => (
            <li key={i} style={{
              display: 'flex',
              gap: '6px',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '11.5px',
              color: '#A89A7E',
              lineHeight: 1.45,
            }}>
              <span style={{ color: '#D4A04D', fontWeight: 700, flexShrink: 0, fontSize: '10px' }}>◆</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Example */}
      {step.example && (
        <div style={{
          marginTop: '10px',
          padding: '8px 10px',
          background: 'rgba(212,160,77,0.08)',
          border: '1px solid rgba(212,160,77,0.3)',
          borderLeft: '3px solid #D4A04D',
          borderRadius: '4px',
          fontFamily: 'var(--font-fraunces), serif',
          fontStyle: 'italic',
          fontSize: '11.5px',
          color: '#D9CFB8',
          lineHeight: 1.5,
        }}>
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontStyle: 'normal',
            fontSize: '8px',
            fontWeight: 700,
            color: '#D4A04D',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '3px',
          }}>
            ✦ In this chart
          </span>
          {step.example}
        </div>
      )}

      {/* Footer — progress dots + nav */}
      <div style={{
        marginTop: '12px',
        paddingTop: '10px',
        borderTop: '1px solid rgba(212,160,77,0.16)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      }}>
        <button
          onClick={onPrev}
          disabled={stepIdx === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 10px',
            background: 'transparent',
            border: '1px solid rgba(212,160,77,0.3)',
            borderRadius: '5px',
            color: stepIdx === 0 ? '#5C5849' : '#D4A04D',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            cursor: stepIdx === 0 ? 'not-allowed' : 'pointer',
            opacity: stepIdx === 0 ? 0.4 : 1,
          }}
        >
          <ChevronLeft size={12}/> Back
        </button>

        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: total }).map((_, i) => (
            <button
              key={i}
              onClick={() => onJump(i)}
              aria-label={`Go to step ${i + 1}`}
              style={{
                width: '6px', height: '6px',
                borderRadius: '50%',
                background: i === stepIdx ? '#D4A04D' : 'rgba(212,160,77,0.2)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                boxShadow: i === stepIdx ? '0 0 6px rgba(212,160,77,0.7)' : 'none',
              }}
            />
          ))}
        </div>

        <button
          onClick={stepIdx === total - 1 ? onClose : onNext}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 14px',
            background: 'linear-gradient(180deg, #C0344B, #8B2545)',
            border: '1px solid #D4A04D',
            borderRadius: '5px',
            color: '#F4EDE0',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(139,37,69,0.4)',
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

// ─── dialog positioning ────────────────────────────────────

function positionDialog(step: Step): React.CSSProperties {
  const t = step.target
  // Always vertically centered & clamped within chart container
  const verticalCenter: React.CSSProperties = {
    top: '50%',
    transform: 'translateY(-50%)',
  }
  switch (step.dialogPos) {
    case 'right':
      return { left: `calc(${t.left} + ${t.width} + 18px)`, ...verticalCenter }
    case 'left':
      return { right: `calc(100% - ${t.left} + 18px)`, ...verticalCenter }
    case 'below': {
      // For wide horizontal targets, anchor to bottom edge with safe gap
      return { left: '50%', transform: 'translateX(-50%)', bottom: '4%' }
    }
    case 'above': {
      return { left: '50%', transform: 'translateX(-50%)', top: '4%' }
    }
  }
}
