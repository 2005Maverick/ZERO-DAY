'use client'

import type { ChartSpec } from '@/lib/academy/game-types'

interface Props {
  chart: ChartSpec
  accent: string                  // hex
  showLast?: boolean
}

export function InlineChart({ chart, accent, showLast = true }: Props) {
  const candles = chart.candles ?? []
  const W = chart.width ?? 760
  const H = chart.height ?? 260
  const padL = 14, padR = 56, padT = 14, padB = chart.volume ? 56 : 14

  if (candles.length === 0) {
    return (
      <div style={emptyStyle(H)}>No chart data</div>
    )
  }

  const allHi = candles.map(c => c.h)
  const allLo = candles.map(c => c.l)
  const min = Math.min(...allLo) * 0.998
  const max = Math.max(...allHi) * 1.002

  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const xFor = (i: number) => padL + (i + 0.5) * (innerW / candles.length)
  const yFor = (p: number) => padT + (1 - (p - min) / (max - min)) * innerH
  const cw = Math.max(2, innerW / candles.length * 0.65)

  const last = candles[candles.length - 1]

  // Volume scaling
  const volMax = Math.max(...(chart.volume ?? [1]))
  const volH = 36
  const volTop = H - volH - 6

  return (
    <div style={{
      position: 'relative',
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #050505 0%, #000 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const y = padT + t * innerH
          const price = max - t * (max - min)
          return (
            <g key={`g${t}`}>
              <line x1={padL} x2={padL + innerW} y1={y} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="2 6"/>
              <text x={padL + innerW + 4} y={y + 3} fill="#404040" fontSize="9" fontFamily="monospace">{price.toFixed(price > 100 ? 0 : 2)}</text>
            </g>
          )
        })}

        {/* MA20 */}
        {chart.ma20 && chart.ma20.length > 1 && (
          <polyline
            fill="none" stroke="#E0E0E0" strokeWidth="1" strokeOpacity="0.55"
            points={chart.ma20.map((v, i) => `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`).join(' ')}
          />
        )}

        {/* MA50 */}
        {chart.ma50 && chart.ma50.length > 1 && (
          <polyline
            fill="none" stroke="#A855F7" strokeWidth="1" strokeOpacity="0.6"
            points={chart.ma50.map((v, i) => `${xFor(i).toFixed(1)},${yFor(v).toFixed(1)}`).join(' ')}
          />
        )}

        {/* Candles */}
        {candles.map((c, i) => {
          const x = xFor(i)
          const isUp = c.c >= c.o
          const color = isUp ? '#10B981' : '#FF1F1F'
          const yOpen = yFor(c.o), yClose = yFor(c.c)
          const yHi = yFor(c.h), yLo = yFor(c.l)
          const yTop = Math.min(yOpen, yClose)
          const bodyH = Math.max(1.5, Math.abs(yClose - yOpen))
          return (
            <g key={i}>
              <line x1={x} x2={x} y1={yHi} y2={yLo} stroke={color} strokeWidth="1"/>
              <rect x={x - cw / 2} y={yTop} width={cw} height={bodyH} fill={color}/>
            </g>
          )
        })}

        {/* Volume bars */}
        {chart.volume && (
          <g>
            {chart.volume.map((v, i) => {
              const h = (v / volMax) * volH
              const isUp = candles[i] ? candles[i].c >= candles[i].o : true
              return (
                <rect
                  key={`v${i}`}
                  x={xFor(i) - cw / 2}
                  y={volTop + (volH - h)}
                  width={cw}
                  height={h}
                  fill={isUp ? '#10B981' : '#FF1F1F'}
                  fillOpacity="0.45"
                />
              )
            })}
          </g>
        )}

        {/* Last price tag */}
        {showLast && last && (
          <g>
            <line x1={padL} x2={padL + innerW} y1={yFor(last.c)} y2={yFor(last.c)}
              stroke={`#${accent}`} strokeOpacity="0.35" strokeDasharray="2 3" strokeWidth="0.8"/>
            <rect x={padL + innerW + 2} y={yFor(last.c) - 9} width={48} height={18} fill={`#${accent}`}/>
            <text x={padL + innerW + 26} y={yFor(last.c) + 4} fill="#000" fontSize="10" fontFamily="monospace" fontWeight="700" textAnchor="middle">
              {last.c.toFixed(last.c > 100 ? 0 : 2)}
            </text>
          </g>
        )}

        {/* Highlight markers */}
        {chart.highlight === 'breakout' && last && (
          <circle cx={xFor(candles.length - 1)} cy={yFor(last.h) - 8} r="6" fill="none" stroke={`#${accent}`} strokeWidth="1.5">
            <animate attributeName="r" values="6;14;6" dur="1.6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite"/>
          </circle>
        )}
      </svg>
    </div>
  )
}

function emptyStyle(h: number): React.CSSProperties {
  return {
    height: h,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#0A0A0A',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    fontFamily: 'var(--font-fraunces), serif',
    fontStyle: 'italic',
    fontSize: '12px', color: '#404040',
  }
}

// Single big candle for Candle Caller game
export function SingleCandle({ open, high, low, close, accent }: { open: number; high: number; low: number; close: number; accent: string }) {
  const W = 220, H = 280
  const min = Math.min(low, open, close) - 0.5
  const max = Math.max(high, open, close) + 0.5
  const yFor = (p: number) => 30 + (1 - (p - min) / (max - min)) * (H - 60)
  const x = W / 2
  const cw = 80
  const isUp = close >= open
  const color = isUp ? '#10B981' : '#FF1F1F'
  const yOpen = yFor(open), yClose = yFor(close)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%' }}>
      <line x1={x} x2={x} y1={yFor(high)} y2={yFor(low)} stroke={color} strokeWidth="3"/>
      <rect x={x - cw / 2} y={Math.min(yOpen, yClose)} width={cw} height={Math.max(2, Math.abs(yClose - yOpen))} fill={color} stroke={`#${accent}`} strokeWidth="0.5"/>
    </svg>
  )
}
