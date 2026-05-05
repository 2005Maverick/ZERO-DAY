'use client'

import { useEffect, useState } from 'react'

interface Props {
  score: number  // 0–5
}

const SCORE_LABELS = ['None', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']
const SCORE_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#10b981']

export function DiversificationGauge({ score }: Props) {
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setDisplayed(score), 300)
    return () => clearTimeout(t)
  }, [score])

  const clamped = Math.max(0, Math.min(5, displayed))
  const pct = (clamped / 5) * 100
  const color = SCORE_COLORS[Math.round(clamped)] ?? '#475569'
  const label = SCORE_LABELS[Math.round(clamped)] ?? 'Unknown'

  // SVG arc parameters
  const R = 70
  const cx = 90
  const cy = 90
  const circumference = Math.PI * R  // half circle
  const arcLen = (pct / 100) * circumference

  const startAngle = Math.PI      // 180° (left)
  const endAngle = 0              // 0° (right)
  const x1 = cx + R * Math.cos(startAngle)
  const y1 = cy + R * Math.sin(startAngle)
  const x2 = cx + R * Math.cos(endAngle)
  const y2 = cy + R * Math.sin(endAngle)

  const arcSweepAngle = (pct / 100) * Math.PI
  const currentAngle = Math.PI - arcSweepAngle
  const arcX = cx + R * Math.cos(currentAngle)
  const arcY = cy + R * Math.sin(currentAngle)

  return (
    <div style={{
      background: '#0c1118',
      border: '1px solid #1e2a35',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '11px',
        fontWeight: 700,
        color: '#475569',
        letterSpacing: '0.08em',
        marginBottom: '16px',
        alignSelf: 'flex-start',
      }}>
        DIVERSIFICATION SCORE
      </div>

      <svg width="180" height="100" viewBox="0 0 180 100">
        {/* Background track */}
        <path
          d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`}
          fill="none"
          stroke="#1e2a35"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Filled arc */}
        <path
          d={`M ${x1} ${y1} A ${R} ${R} 0 0 1 ${arcX} ${arcY}`}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          style={{ transition: 'all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        />

        {/* Score text */}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '28px',
            fontWeight: 800,
            fill: color,
            transition: 'fill 1s ease',
          }}
        >
          {clamped.toFixed(1)}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          style={{ fontFamily: 'sans-serif', fontSize: '11px', fill: '#475569' }}
        >
          / 5.0
        </text>
      </svg>

      <div style={{
        fontFamily: 'Anton, sans-serif',
        fontSize: '18px',
        color,
        letterSpacing: '0.04em',
        marginTop: '-4px',
        transition: 'color 1s ease',
      }}>
        {label}
      </div>

      <div style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '12px',
        color: '#475569',
        marginTop: '8px',
        textAlign: 'center',
        maxWidth: '200px',
        lineHeight: 1.5,
      }}>
        {clamped < 2
          ? 'High concentration risk — spread capital across more sectors next time.'
          : clamped < 4
          ? 'Moderate spread. Adding 1-2 more sectors would reduce volatility.'
          : 'Excellent! Spreading across 4+ sectors protected you from single-sector shocks.'}
      </div>
    </div>
  )
}
