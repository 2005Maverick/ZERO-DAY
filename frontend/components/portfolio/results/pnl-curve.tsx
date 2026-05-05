'use client'

import { useState } from 'react'

interface Point { second: number; value: number }

interface Props {
  userHistory: Point[]
  doNothingHistory: Point[]
  perfectHistory: Point[]
  startingCapital: number
}

function toPath(points: Point[], minV: number, maxV: number, w: number, h: number): string {
  if (points.length === 0) return ''
  const maxSec = 480
  return points
    .map((p, i) => {
      const x = (p.second / maxSec) * w
      const y = h - ((p.value - minV) / (maxV - minV || 1)) * (h * 0.85) - h * 0.075
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

const TIME_LABELS = ['9:15', '10:30', '11:45', '1:00', '2:15', '3:30']

export function PnlCurve({ userHistory, doNothingHistory, perfectHistory, startingCapital }: Props) {
  const [hoverSec, setHoverSec] = useState<number | null>(null)

  const allValues = [
    ...userHistory.map(p => p.value),
    ...doNothingHistory.map(p => p.value),
    ...perfectHistory.map(p => p.value),
    startingCapital,
  ]
  const minV = Math.min(...allValues) * 0.998
  const maxV = Math.max(...allValues) * 1.002

  const W = 800
  const H = 240

  const userPath = toPath(userHistory, minV, maxV, W, H)
  const doNothingPath = toPath(doNothingHistory, minV, maxV, W, H)
  const perfectPath = toPath(perfectHistory, minV, maxV, W, H)

  const getValueAt = (history: Point[], sec: number) => {
    const p = history.find(h => h.second >= sec) ?? history[history.length - 1]
    return p?.value ?? startingCapital
  }

  const hoverX = hoverSec != null ? (hoverSec / 480) * W : null

  return (
    <div style={{
      background: '#0c1118',
      border: '1px solid #1e2a35',
      borderRadius: '12px',
      padding: '20px',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter)',
        fontSize: '11px',
        fontWeight: 700,
        color: '#475569',
        letterSpacing: '0.08em',
        marginBottom: '12px',
      }}>
        PORTFOLIO VALUE — MARCH 9, 2020
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
        {[
          { label: 'You', color: '#f1f5f9', dash: false },
          { label: 'Do Nothing', color: '#475569', dash: true },
          { label: 'Perfect Play', color: '#FFB830', dash: true },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="24" height="8">
              <line
                x1="0" y1="4" x2="24" y2="4"
                stroke={l.color}
                strokeWidth="2"
                strokeDasharray={l.dash ? '4 3' : 'none'}
              />
            </svg>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: l.color }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: `${W}/${H}` }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
          onMouseMove={e => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = ((e.clientX - rect.left) / rect.width) * W
            setHoverSec(Math.round((x / W) * 480))
          }}
          onMouseLeave={() => setHoverSec(null)}
        >
          {/* Grid */}
          {[0.25, 0.5, 0.75].map(r => (
            <line key={r} x1="0" y1={H * r} x2={W} y2={H * r}
              stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}

          {/* Starting capital baseline */}
          {(() => {
            const baseY = H - ((startingCapital - minV) / (maxV - minV || 1)) * (H * 0.85) - H * 0.075
            return <line x1="0" y1={baseY} x2={W} y2={baseY}
              stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2 4" />
          })()}

          {/* Perfect play line */}
          {perfectPath && (
            <path d={perfectPath} fill="none" stroke="#FFB830" strokeWidth="1.5"
              strokeDasharray="5 3" opacity="0.6" />
          )}

          {/* Do nothing line */}
          {doNothingPath && (
            <path d={doNothingPath} fill="none" stroke="#475569" strokeWidth="1.5"
              strokeDasharray="4 3" opacity="0.7" />
          )}

          {/* User line */}
          {userPath && (
            <path d={userPath} fill="none" stroke="#f1f5f9" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Hover crosshair */}
          {hoverX != null && (
            <line x1={hoverX} y1="0" x2={hoverX} y2={H}
              stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          )}
        </svg>

        {/* Hover tooltip */}
        {hoverSec != null && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: `clamp(0px, ${(hoverSec / 480) * 100}%, calc(100% - 160px))`,
            background: '#131920',
            border: '1px solid #1e2a35',
            borderRadius: '8px',
            padding: '8px 12px',
            pointerEvents: 'none',
            minWidth: '150px',
          }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: '#475569', marginBottom: '6px' }}>
              {TIME_LABELS[Math.floor((hoverSec / 480) * 5)]}
            </div>
            {[
              { label: 'You', value: getValueAt(userHistory, hoverSec), color: '#f1f5f9' },
              { label: 'Do Nothing', value: getValueAt(doNothingHistory, hoverSec), color: '#475569' },
              { label: 'Perfect', value: getValueAt(perfectHistory, hoverSec), color: '#FFB830' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: r.color, lineHeight: 1.6 }}>
                <span>{r.label}</span>
                <span>₹{r.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* X-axis labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        {TIME_LABELS.map(l => (
          <span key={l} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#334155' }}>{l}</span>
        ))}
      </div>
    </div>
  )
}
