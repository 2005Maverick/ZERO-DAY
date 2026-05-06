'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff, Clock, Check, X } from 'lucide-react'
import type { CustomModeResult } from '@/lib/academy/game-types'
import { SingleCandle } from '../inline-chart'
import { useTracer } from '@/lib/behavior/tracer'

interface Card {
  pattern: string
  candle: { o: number; h: number; l: number; c: number }
  options: string[]
}

const CARDS: Card[] = [
  { pattern: 'Doji',                candle: { o: 100, h: 108, l: 92, c: 100.5 }, options: ['Doji', 'Hammer', 'Shooting Star', 'Marubozu'] },
  { pattern: 'Hammer',              candle: { o: 96,  h: 100, l: 84, c: 99 },    options: ['Hammer', 'Hanging Man', 'Inverted Hammer', 'Doji'] },
  { pattern: 'Shooting Star',       candle: { o: 105, h: 116, l: 99, c: 100 },   options: ['Shooting Star', 'Inverted Hammer', 'Hanging Man', 'Hammer'] },
  { pattern: 'Bullish Marubozu',    candle: { o: 95,  h: 105, l: 95, c: 105 },   options: ['Bullish Marubozu', 'Hammer', 'Bullish Engulfing', 'Doji'] },
  { pattern: 'Bearish Marubozu',    candle: { o: 110, h: 110, l: 96, c: 96 },    options: ['Bearish Marubozu', 'Shooting Star', 'Bearish Engulfing', 'Doji'] },
  { pattern: 'Hanging Man',         candle: { o: 99,  h: 102, l: 88, c: 100 },   options: ['Hanging Man', 'Hammer', 'Shooting Star', 'Doji'] },
  { pattern: 'Inverted Hammer',     candle: { o: 92,  h: 105, l: 91, c: 95 },    options: ['Inverted Hammer', 'Shooting Star', 'Hammer', 'Hanging Man'] },
  { pattern: 'Spinning Top',        candle: { o: 100, h: 106, l: 94, c: 101 },   options: ['Spinning Top', 'Doji', 'Hammer', 'Marubozu'] },
]

const FLASH_MS = 2500
const ANSWER_MS = 5000
const POINTS_PER_CARD = 100
const SPEED_BONUS = 50

interface Props {
  onComplete: (result: CustomModeResult) => void
}

type Phase = 'flash' | 'answer' | 'feedback'

export function CandleMemoryGame({ onComplete }: Props) {
  const { track } = useTracer()
  const [idx, setIdx] = useState(0)
  const [phase, setPhase] = useState<Phase>('flash')
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(FLASH_MS)

  const card = CARDS[idx]
  const correctIdx = card.options.indexOf(card.pattern)

  // Drive the timer for the current phase
  useEffect(() => {
    if (phase === 'feedback') return
    const total = phase === 'flash' ? FLASH_MS : ANSWER_MS
    setTimeLeft(total)
    const start = Date.now()
    const interval = setInterval(() => {
      const remaining = total - (Date.now() - start)
      if (remaining <= 0) {
        clearInterval(interval)
        if (phase === 'flash') setPhase('answer')
        else if (phase === 'answer' && picked === null) handlePick(-1) // timeout
      } else {
        setTimeLeft(remaining)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [idx, phase])

  function handlePick(i: number) {
    if (phase !== 'answer' || picked !== null) return
    setPicked(i)
    const correct = i === correctIdx
    track('candle_memory_card', 0, {
      cardIdx: idx, pattern: card.pattern, pickedIdx: i, correct, timeLeft,
    })
    if (correct) {
      const speedBonus = Math.round((timeLeft / ANSWER_MS) * SPEED_BONUS)
      setScore(s => s + POINTS_PER_CARD + speedBonus)
    }
    setPhase('feedback')
    setTimeout(() => {
      if (idx >= CARDS.length - 1) {
        const max = CARDS.length * (POINTS_PER_CARD + SPEED_BONUS)
        const finalScore = score + (correct ? POINTS_PER_CARD + Math.round((timeLeft / ANSWER_MS) * SPEED_BONUS) : 0)
        onComplete({
          score: finalScore, maxScore: max,
          passed: finalScore / max >= 0.6,
          detail: `${CARDS.length} candles flashed, you scored ${finalScore} of ${max}.`,
        })
      } else {
        setIdx(i => i + 1)
        setPicked(null)
        setPhase('flash')
      }
    }, 1400)
  }

  const accent = 'D4A04D'
  const totalMs = phase === 'flash' ? FLASH_MS : ANSWER_MS
  const timePct = Math.max(0, timeLeft / totalMs)

  return (
    <div>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '14px',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 10px',
          background: 'rgba(212,160,77,0.10)',
          border: '1px solid rgba(212,160,77,0.40)',
          borderRadius: '4px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', fontWeight: 800, color: '#D4A04D',
          letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>
          {phase === 'flash' ? <><Eye size={10}/> Memorize</> : phase === 'answer' ? <><EyeOff size={10}/> Recall</> : <><Check size={10}/> Result</>}
          · Card {idx + 1}/{CARDS.length}
        </div>
        <div style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '14px', fontWeight: 800, color: '#F0F0F0',
        }}>{score.toLocaleString()} pts</div>
      </div>

      {/* Timer bar */}
      <div style={{
        height: '4px', background: 'rgba(255,255,255,0.06)',
        borderRadius: '2px', overflow: 'hidden', marginBottom: '20px',
      }}>
        <div style={{
          width: `${timePct * 100}%`, height: '100%',
          background: phase === 'flash' ? '#3B82F6' : timePct < 0.3 ? '#FF1F1F' : `#${accent}`,
          transition: 'width 0.05s linear',
        }}/>
      </div>

      {/* Candle (flash) or hidden box (answer) */}
      <div style={{
        height: '280px',
        background: '#000',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {phase === 'flash' ? (
          <div style={{ width: '220px', height: '280px' }}>
            <SingleCandle open={card.candle.o} high={card.candle.h} low={card.candle.l} close={card.candle.c} accent={accent}/>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <EyeOff size={36} color="#404040"/>
            <div style={{
              marginTop: '12px',
              fontFamily: 'var(--font-fraunces), serif',
              fontStyle: 'italic',
              fontSize: '14px', color: '#606060',
            }}>What did you see?</div>
          </div>
        )}
      </div>

      {/* Options (only shown in answer phase) */}
      {phase !== 'flash' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {card.options.map((opt, i) => {
            const isPick = picked === i
            const showCorrect = phase === 'feedback' && i === correctIdx
            const showWrong = phase === 'feedback' && isPick && i !== correctIdx
            return (
              <button
                key={i}
                onClick={() => handlePick(i)}
                disabled={picked !== null}
                style={{
                  padding: '14px 16px',
                  background: showCorrect ? 'rgba(16,185,129,0.14)' : showWrong ? 'rgba(255,31,31,0.14)' : isPick ? `rgba(${rgb(accent)}, 0.10)` : 'rgba(0,0,0,0.4)',
                  border: `1px solid ${showCorrect ? '#10B981' : showWrong ? '#FF1F1F' : isPick ? `#${accent}` : 'rgba(255,255,255,0.10)'}`,
                  borderRadius: '6px',
                  color: showCorrect ? '#10B981' : showWrong ? '#FF1F1F' : '#E0E0E0',
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontSize: '13px', fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: picked === null ? 'pointer' : 'default',
                  textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}
              >
                {showCorrect ? <Check size={14}/> : showWrong ? <X size={14}/> : <span style={{ width: '14px', display: 'inline-block', textAlign: 'center', fontSize: '11px', color: '#606060', fontFamily: 'monospace' }}>{String.fromCharCode(65 + i)}</span>}
                {opt}
              </button>
            )
          })}
        </div>
      )}

      {phase === 'flash' && (
        <div style={{
          textAlign: 'center',
          fontFamily: 'var(--font-fraunces), serif',
          fontStyle: 'italic',
          fontSize: '12px', color: '#606060',
        }}>Look carefully. The candle disappears in {Math.ceil(timeLeft / 1000)}s.</div>
      )}
    </div>
  )
}

function rgb(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `${r},${g},${b}`
}
