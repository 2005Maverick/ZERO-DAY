'use client'

import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Clock } from 'lucide-react'
import type { CustomModeResult } from '@/lib/academy/game-types'
import { useTracer } from '@/lib/behavior/tracer'

type Stance = 'long' | 'short' | 'flat'

const SESSION_TICKS = 90        // total ticks in the session (~45s at 500ms)
const TICK_MS = 500
const ACCENT = '14B8A6'

// Pre-baked synthetic price walk with regime changes embedded.
// Format: [closes, regime_label] — regime_label is the 'correct' stance for that bar.
function buildSession(): { close: number; trueStance: Stance }[] {
  const out: { close: number; trueStance: Stance }[] = []
  let p = 100
  const segments: { len: number; bias: number; stance: Stance }[] = [
    { len: 22, bias: 0.6,  stance: 'long' },   // up trend
    { len: 14, bias: 0.0,  stance: 'flat' },   // sideways
    { len: 18, bias: -0.7, stance: 'short' },  // down trend
    { len: 12, bias: 0.0,  stance: 'flat' },   // sideways
    { len: 24, bias: 0.5,  stance: 'long' },   // recovery
  ]
  for (const seg of segments) {
    for (let i = 0; i < seg.len; i++) {
      p += seg.bias + (Math.random() - 0.5) * 1.4
      out.push({ close: p, trueStance: seg.stance })
    }
  }
  return out.slice(0, SESSION_TICKS)
}

interface Props {
  onComplete: (result: CustomModeResult) => void
}

export function TrendContinuousGame({ onComplete }: Props) {
  const { track } = useTracer()
  const [session] = useState(buildSession)
  const [tick, setTick] = useState(0)
  const [stance, setStanceRaw] = useState<Stance>('flat')
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(true)
  const [tickFeedback, setTickFeedback] = useState<'good' | 'bad' | 'neutral' | null>(null)

  function setStance(next: Stance) {
    if (next === stance) return
    track('trend_stance_change', 0, { from: stance, to: next, atTick: tick })
    setStanceRaw(next)
  }

  // Tick the session
  useEffect(() => {
    if (!running) return
    if (tick >= session.length) {
      setRunning(false)
      const max = session.length * 10
      setTimeout(() => onComplete({
        score: Math.max(0, score),
        maxScore: max,
        passed: score / max >= 0.5,
        detail: `${session.length} bars surfed. Earned ${Math.max(0, score)} of ${max} possible by aligning your stance with the trend.`,
      }), 1200)
      return
    }
    const t = setTimeout(() => {
      // Score this tick based on stance vs true regime
      const trueS = session[tick].trueStance
      let delta = 0
      let fb: 'good' | 'bad' | 'neutral' = 'neutral'
      if (stance === trueS) { delta = 10; fb = 'good' }
      else if (stance === 'flat') { delta = 1; fb = 'neutral' }            // sitting out is mildly OK
      else if (trueS === 'flat') { delta = -2; fb = 'bad' }                 // wrong direction in chop
      else { delta = -8; fb = 'bad' }                                       // wrong direction in trend
      setScore(s => s + delta)
      setTickFeedback(fb)
      setTick(t => t + 1)
    }, TICK_MS)
    return () => clearTimeout(t)
  }, [tick, stance, running, session])

  const elapsed = tick / SESSION_TICKS
  const visible = session.slice(0, tick + 1)
  const W = 760, H = 240
  const padL = 14, padR = 24, padT = 14, padB = 14
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const lows = visible.length > 0 ? Math.min(...visible.map(c => c.close)) : 90
  const highs = visible.length > 0 ? Math.max(...visible.map(c => c.close)) : 110
  const min = lows - 2
  const max = highs + 2
  const xFor = (i: number) => padL + (i / (SESSION_TICKS - 1)) * innerW
  const yFor = (p: number) => padT + (1 - (p - min) / (max - min)) * innerH

  const path = visible
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i).toFixed(1)} ${yFor(c.close).toFixed(1)}`)
    .join(' ')

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
          background: `rgba(20,184,166,0.10)`,
          border: `1px solid rgba(20,184,166,0.40)`,
          borderRadius: '4px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', fontWeight: 800, color: `#${ACCENT}`,
          letterSpacing: '0.22em', textTransform: 'uppercase',
        }}><Clock size={10}/> Trend Surfer · {tick}/{SESSION_TICKS}</div>
        <div style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '20px', fontWeight: 800,
          color: tickFeedback === 'good' ? '#10B981' : tickFeedback === 'bad' ? '#FF1F1F' : '#F0F0F0',
          transition: 'color 0.15s',
        }}>{score >= 0 ? '+' : ''}{score} pts</div>
      </div>

      {/* Time bar */}
      <div style={{
        height: '4px', background: 'rgba(255,255,255,0.06)',
        borderRadius: '2px', overflow: 'hidden', marginBottom: '14px',
      }}>
        <div style={{
          width: `${elapsed * 100}%`, height: '100%',
          background: `linear-gradient(90deg, #${ACCENT}, #0F766E)`,
          transition: 'width 0.4s linear',
        }}/>
      </div>

      {/* Chart */}
      <div style={{
        position: 'relative',
        background: '#000',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '18px',
      }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Grid */}
          {[0, 0.5, 1].map(t => (
            <line key={t} x1={padL} x2={padL + innerW} y1={padT + t * innerH} y2={padT + t * innerH}
              stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4"/>
          ))}
          {/* Price line */}
          <path d={path} fill="none" stroke={`#${ACCENT}`} strokeWidth="1.6"/>
          {/* Live dot */}
          {visible.length > 0 && (
            <>
              <circle cx={xFor(visible.length - 1)} cy={yFor(visible[visible.length - 1].close)} r="4" fill={`#${ACCENT}`}/>
              <circle cx={xFor(visible.length - 1)} cy={yFor(visible[visible.length - 1].close)} r="9" fill={`#${ACCENT}`} opacity="0.30">
                <animate attributeName="r" values="6;14;6" dur="1.4s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.4s" repeatCount="indefinite"/>
              </circle>
            </>
          )}
        </svg>

        {/* Stance overlay */}
        <div style={{
          position: 'absolute', top: '10px', left: '12px',
          padding: '4px 10px',
          background: stance === 'long' ? 'rgba(16,185,129,0.20)' : stance === 'short' ? 'rgba(255,31,31,0.20)' : 'rgba(255,255,255,0.06)',
          border: `1px solid ${stance === 'long' ? '#10B981' : stance === 'short' ? '#FF1F1F' : 'rgba(255,255,255,0.20)'}`,
          borderRadius: '3px',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', fontWeight: 800,
          color: stance === 'long' ? '#10B981' : stance === 'short' ? '#FF1F1F' : '#A0A0A0',
          letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>Stance · {stance}</div>
      </div>

      {/* Stance buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        <StanceBtn label="LONG" icon={<TrendingUp size={14}/>} color="#10B981" active={stance === 'long'} onClick={() => setStance('long')}/>
        <StanceBtn label="FLAT" icon={<Minus size={14}/>} color="#A0A0A0" active={stance === 'flat'} onClick={() => setStance('flat')}/>
        <StanceBtn label="SHORT" icon={<TrendingDown size={14}/>} color="#FF1F1F" active={stance === 'short'} onClick={() => setStance('short')}/>
      </div>

      <p style={{
        marginTop: '14px',
        fontFamily: 'var(--font-fraunces), serif',
        fontStyle: 'italic',
        fontSize: '12px', color: '#606060', lineHeight: 1.55,
        textAlign: 'center',
      }}>
        Set your stance to match the trend. <strong style={{ color: '#10B981' }}>Long</strong> in uptrends, <strong style={{ color: '#FF1F1F' }}>Short</strong> in downtrends, <strong style={{ color: '#A0A0A0' }}>Flat</strong> in chop. Wrong stance = lose points each tick.
      </p>
    </div>
  )
}

function StanceBtn({ label, icon, color, active, onClick }: {
  label: string; icon: React.ReactNode; color: string; active: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      padding: '14px',
      background: active ? `${color}28` : 'rgba(0,0,0,0.4)',
      border: `1px solid ${active ? color : 'rgba(255,255,255,0.10)'}`,
      borderRadius: '6px',
      color: active ? color : '#A0A0A0',
      fontFamily: 'var(--font-inter), sans-serif',
      fontSize: '13px', fontWeight: 800,
      letterSpacing: '0.20em', textTransform: 'uppercase',
      cursor: 'pointer',
      boxShadow: active ? `0 0 24px ${color}33` : 'none',
      transition: 'all 0.15s',
    }}>{icon} {label}</button>
  )
}
