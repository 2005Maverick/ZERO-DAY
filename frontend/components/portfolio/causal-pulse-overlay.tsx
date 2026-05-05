'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PulsePayload } from '@/types/portfolio'
import { getPulseTarget, refreshAll } from '@/lib/utils/pulse-registry'

interface ResolvedPulse extends PulsePayload {
  path: string
  cometX: number[]
  cometY: number[]
  color: string
}

function buildBezier(from: DOMRect, to: DOMRect): { path: string; points: Array<[number, number]> } {
  const x0 = from.left + from.width / 2
  const y0 = from.top + from.height / 2
  const x3 = to.left + to.width / 2
  const y3 = to.top + to.height / 2

  const dx = x3 - x0
  const dy = y3 - y0
  const len = Math.sqrt(dx * dx + dy * dy)
  const perp = { x: -dy / len * 100, y: dx / len * 100 }

  const x1 = x0 + dx * 0.33 + perp.x
  const y1 = y0 + dy * 0.33 + perp.y
  const x2 = x0 + dx * 0.66 + perp.x
  const y2 = y0 + dy * 0.66 + perp.y

  const path = `M ${x0} ${y0} C ${x1} ${y1}, ${x2} ${y2}, ${x3} ${y3}`

  // Sample points along bezier for comet path
  const points: Array<[number, number]> = []
  for (let t = 0; t <= 1; t += 0.05) {
    const mt = 1 - t
    const bx = mt*mt*mt*x0 + 3*mt*mt*t*x1 + 3*mt*t*t*x2 + t*t*t*x3
    const by = mt*mt*mt*y0 + 3*mt*mt*t*y1 + 3*mt*t*t*y2 + t*t*t*y3
    points.push([bx, by])
  }

  return { path, points }
}

const POLARITY_COLORS = {
  positive: '#22c55e',
  negative: '#ef4444',
  neutral:  '#FFB830',
}

export function CausalPulseOverlay({ pulses, onDone }: { pulses: PulsePayload[]; onDone: () => void }) {
  const [resolved, setResolved] = useState<ResolvedPulse[]>([])
  const doneRef = useRef(false)

  useEffect(() => {
    if (pulses.length === 0) return
    doneRef.current = false
    refreshAll()

    const result: ResolvedPulse[] = []
    for (const pulse of pulses) {
      const from = getPulseTarget(pulse.fromId)
      const to = getPulseTarget(pulse.toId)
      if (!from || !to) continue
      const { path, points } = buildBezier(from, to)
      result.push({
        ...pulse,
        path,
        cometX: points.map(p => p[0]),
        cometY: points.map(p => p[1]),
        color: POLARITY_COLORS[pulse.polarity],
      })
    }
    setResolved(result)

    const maxDelay = Math.max(...pulses.map(p => p.delayMs), 0)
    const clearTimer = setTimeout(() => {
      setResolved([])
      onDone()
    }, maxDelay + 2000)

    return () => clearTimeout(clearTimer)
  }, [pulses, onDone])

  if (resolved.length === 0) return null

  return (
    <svg
      style={{
        position: 'fixed', inset: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
        zIndex: 60,
      }}
    >
      <defs>
        {resolved.map(p => (
          <filter key={`f-${p.id}`} id={`glow-${p.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        ))}
      </defs>

      <AnimatePresence>
        {resolved.map(pulse => (
          <g key={pulse.id}>
            {/* Glowing path */}
            <motion.path
              d={pulse.path}
              fill="none"
              stroke={pulse.color}
              strokeWidth="2"
              strokeLinecap="round"
              filter={`url(#glow-${pulse.id})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.9, 0.9, 0] }}
              transition={{
                pathLength: { duration: 1.0, delay: pulse.delayMs / 1000, ease: 'easeOut' },
                opacity: { duration: 1.6, delay: pulse.delayMs / 1000, times: [0, 0.1, 0.7, 1] },
              }}
            />

            {/* Comet dot traveling along path */}
            {pulse.cometX.map((x, i) => {
              const frac = i / (pulse.cometX.length - 1)
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={pulse.cometY[i]}
                  r="4"
                  fill={pulse.color}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                  transition={{
                    delay: pulse.delayMs / 1000 + frac * 0.9,
                    duration: 0.25,
                  }}
                />
              )
            })}
          </g>
        ))}
      </AnimatePresence>
    </svg>
  )
}
