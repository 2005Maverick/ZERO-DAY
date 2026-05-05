'use client'

import { useState, useMemo } from 'react'
import { GraduationCap, Settings2, TrendingUp, BarChart2, LineChart } from 'lucide-react'
import type { ScenarioStock, OhlcvCandle } from '@/types/scenario'
import { ChartTutorial } from './chart-tutorial'

interface TabChartProps {
  stock: ScenarioStock
  accent: string
}

type RangeKey = '1W' | '1M' | '3M' | '6M' | '1Y'
const RANGE_DAYS: Record<RangeKey, number> = { '1W': 5, '1M': 22, '3M': 30, '6M': 30, '1Y': 30 }

type ChartType = 'candle' | 'line' | 'bar'

export function TabChart({ stock, accent }: TabChartProps) {
  const [range, setRange] = useState<RangeKey>('1M')
  const [chartType, setChartType] = useState<ChartType>('candle')
  const [showMA, setShowMA] = useState(true)
  const [showSR, setShowSR] = useState(true)
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const candles = stock.candles.slice(-RANGE_DAYS[range])

  const stats = useMemo(() => computeStats(candles, stock.closePrice), [candles, stock.closePrice])
  const ma20 = useMemo(() => movingAverage(candles.map(c => c.close), 20), [candles])
  const ma50 = useMemo(() => movingAverage(candles.map(c => c.close), 50), [candles])
  const sr = useMemo(() => detectSupportResistance(candles), [candles])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-fraunces), serif',
            fontWeight: 600,
            fontSize: '20px',
            color: '#F4EDE0',
            margin: 0,
          }}>
            Price Action — {stock.symbol}
          </h2>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', marginTop: '6px', fontFamily: 'var(--font-jetbrains), monospace' }}>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#F4EDE0' }}>
              ₹{stock.closePrice.toFixed(2)}
            </span>
            <span style={{
              fontSize: '13px',
              fontWeight: 700,
              color: stats.changePct < 0 ? '#E04A4A' : '#5AB088',
            }}>
              {stats.absChange >= 0 ? '+' : ''}₹{Math.abs(stats.absChange).toFixed(2)} ({stats.changePct >= 0 ? '+' : ''}{stats.changePct.toFixed(2)}%)
            </span>
            <span style={{ fontSize: '11px', color: '#5C5849', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              {range} · {candles.length} sessions · NSE
            </span>
          </div>
        </div>

        <button
          onClick={() => setTutorialOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'linear-gradient(180deg, #C0344B, #8B2545)',
            border: '1px solid #D4A04D',
            borderRadius: '8px',
            color: '#F4EDE0',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow: '0 6px 14px rgba(139,37,69,0.5), 0 0 18px rgba(212,160,77,0.18), inset 0 1px 0 rgba(255,255,255,0.18)',
            textShadow: '0 1px 0 rgba(0,0,0,0.4)',
          }}
        >
          <GraduationCap size={15} strokeWidth={2.4}/>
          Chart Tutorial
        </button>
      </div>

      {/* Toolbar — chart type · MA toggle · S/R toggle · range */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '8px 12px',
        background: 'linear-gradient(180deg, #161B22 0%, #0E141B 100%)',
        border: '1px solid rgba(212,160,77,0.18)',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ToolbarSegment
            icon={<BarChart2 size={13} strokeWidth={2.2}/>}
            active={chartType === 'candle'}
            onClick={() => setChartType('candle')}
            label="Candle"
            accent={accent}
          />
          <ToolbarSegment
            icon={<LineChart size={13} strokeWidth={2.2}/>}
            active={chartType === 'line'}
            onClick={() => setChartType('line')}
            label="Line"
            accent={accent}
          />
          <ToolbarSegment
            icon={<TrendingUp size={13} strokeWidth={2.2}/>}
            active={chartType === 'bar'}
            onClick={() => setChartType('bar')}
            label="OHLC"
            accent={accent}
          />
          <Divider/>
          <Toggle label="MA20·50" active={showMA} onClick={() => setShowMA(!showMA)} accent={accent}/>
          <Toggle label="S / R"   active={showSR} onClick={() => setShowSR(!showSR)} accent={accent}/>
          <Divider/>
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '10px',
            color: '#5C5849',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            Indicators
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '3px 8px',
            background: 'rgba(212,160,77,0.10)',
            border: '1px solid rgba(212,160,77,0.3)',
            borderRadius: '4px',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '10px',
            color: '#D4A04D',
            fontWeight: 600,
          }}>
            <Settings2 size={10}/> 3 active
          </span>
        </div>

        <RangePicker active={range} onChange={setRange} accent={accent} />
      </div>

      {/* Main chart card */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(20,28,38,0.6) 0%, rgba(11,15,21,0.85) 100%)',
        border: '1px solid rgba(212,160,77,0.18)',
        borderTop: 'none',
        borderRadius: '0 0 8px 8px',
        overflow: 'hidden',
      }}>
        <CandleChart
          candles={candles}
          accent={accent}
          closePrice={stock.closePrice}
          symbol={stock.symbol}
          chartType={chartType}
          ma20={showMA ? ma20 : null}
          ma50={showMA ? ma50 : null}
          sr={showSR ? sr : null}
        />
        <ChartTutorial open={tutorialOpen} onClose={() => setTutorialOpen(false)}/>
      </div>

      {/* OHLC strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
        <Tile label="Open"        value={`₹${stats.open.toFixed(2)}`} />
        <Tile label="High"         value={`₹${stats.high.toFixed(2)}`} color="#5AB088" />
        <Tile label="Low"          value={`₹${stats.low.toFixed(2)}`} color="#E04A4A" />
        <Tile label="Close"        value={`₹${stats.close.toFixed(2)}`} bold />
        <Tile label="Volume (avg)" value={`${stats.avgVolLakh.toFixed(1)} L`} />
        <Tile label="Range"        value={`${stats.rangePct.toFixed(2)}%`} color="#D4A04D" />
        <Tile label="Volatility"   value={stats.volatility.toFixed(2)} mono />
      </div>

      {/* 52W + bias */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
        <RangeBar
          low={stock.metrics.range52w.low}
          high={stock.metrics.range52w.high}
          current={stock.closePrice}
          label="52-Week Range"
          accent={accent}
        />
        <BiasIndicator stats={stats}/>
      </div>
    </div>
  )
}

// ─── toolbar primitives ───────────────────────────────────

function ToolbarSegment({ icon, active, onClick, label, accent }: {
  icon: React.ReactNode; active: boolean; onClick: () => void; label: string; accent: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 10px',
        background: active ? `${accent}28` : 'transparent',
        border: `1px solid ${active ? accent : 'rgba(212,160,77,0.2)'}`,
        borderRadius: '5px',
        color: active ? accent : '#A89A7E',
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        cursor: 'pointer',
      }}
    >
      {icon} {label}
    </button>
  )
}
function Toggle({ label, active, onClick, accent }: { label: string; active: boolean; onClick: () => void; accent: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '5px 10px',
        background: active ? `${accent}28` : 'transparent',
        border: `1px solid ${active ? accent : 'rgba(212,160,77,0.2)'}`,
        borderRadius: '5px',
        color: active ? accent : '#A89A7E',
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '11px',
        fontWeight: 700,
        letterSpacing: '0.04em',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}
function Divider() {
  return <span style={{ width: '1px', height: '18px', background: 'rgba(212,160,77,0.18)' }}/>
}
function RangePicker({ active, onChange, accent }: { active: RangeKey; onChange: (r: RangeKey) => void; accent: string }) {
  const ranges: RangeKey[] = ['1W', '1M', '3M', '6M', '1Y']
  return (
    <div style={{
      display: 'flex',
      gap: '2px',
      padding: '3px',
      background: 'rgba(0,0,0,0.4)',
      border: '1px solid rgba(212,160,77,0.2)',
      borderRadius: '5px',
    }}>
      {ranges.map(r => (
        <button
          key={r}
          onClick={() => onChange(r)}
          style={{
            padding: '5px 10px',
            background: active === r ? `${accent}28` : 'transparent',
            border: 'none',
            borderRadius: '3px',
            color: active === r ? accent : '#A89A7E',
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            cursor: 'pointer',
          }}
        >
          {r}
        </button>
      ))}
    </div>
  )
}
function Tile({ label, value, color, bold, mono }: { label: string; value: string; color?: string; bold?: boolean; mono?: boolean }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(212,160,77,0.14)',
      borderRadius: '6px',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '9px', fontWeight: 700, color: '#5C5849',
        letterSpacing: '0.18em', textTransform: 'uppercase',
        marginBottom: '4px',
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: bold ? '15px' : '13px',
        fontWeight: bold ? 700 : 600,
        color: color ?? '#F4EDE0',
        whiteSpace: 'nowrap',
        letterSpacing: mono ? '0.04em' : 'normal',
      }}>{value}</div>
    </div>
  )
}

// ─── stats math ────────────────────────────────────────────

interface ChartStats {
  open: number; high: number; low: number; close: number
  changePct: number; absChange: number; rangePct: number
  avgVolLakh: number; volatility: number
  bullish: number; bearish: number
}
function computeStats(candles: OhlcvCandle[], lastClose: number): ChartStats {
  if (candles.length === 0) {
    return { open: 0, high: 0, low: 0, close: 0, changePct: 0, absChange: 0, rangePct: 0, avgVolLakh: 0, volatility: 0, bullish: 0, bearish: 0 }
  }
  const open = candles[0].open
  const close = lastClose
  const high = Math.max(...candles.map(c => c.high))
  const low = Math.min(...candles.map(c => c.low))
  const absChange = close - open
  const changePct = (absChange / open) * 100
  const rangePct = ((high - low) / low) * 100
  const avgVolLakh = candles.reduce((s, c) => s + c.volume, 0) / candles.length / 100000
  const rets = candles.slice(1).map((c, i) => (c.close - candles[i].close) / candles[i].close)
  const mean = rets.reduce((a, b) => a + b, 0) / Math.max(1, rets.length)
  const variance = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(1, rets.length)
  const volatility = Math.sqrt(variance) * 100
  const bullish = candles.filter(c => c.close >= c.open).length
  return { open, high, low, close, changePct, absChange, rangePct, avgVolLakh, volatility, bullish, bearish: candles.length - bullish }
}
function movingAverage(arr: number[], window: number): number[] {
  if (window <= 0) return arr.map(() => 0)
  return arr.map((_, i) => {
    if (i < window - 1) return 0
    return arr.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0) / window
  })
}
function detectSupportResistance(candles: OhlcvCandle[]): { support: number; resistance: number } {
  if (candles.length === 0) return { support: 0, resistance: 0 }
  const closes = candles.map(c => c.close)
  return {
    support: Math.min(...closes),
    resistance: Math.max(...closes),
  }
}

// ─── chart canvas ─────────────────────────────────────────

interface ChartProps {
  candles: OhlcvCandle[]
  accent: string
  closePrice: number
  symbol: string
  chartType: ChartType
  ma20: number[] | null
  ma50: number[] | null
  sr: { support: number; resistance: number } | null
}
function CandleChart({ candles, accent, closePrice, symbol, chartType, ma20, ma50, sr }: ChartProps) {
  if (candles.length === 0) return null

  const W = 1200
  const TOTAL_H = 440
  const CHART_H = 320
  const VOL_H = 78
  const GAP = 14
  const PAD_L = 14
  const PAD_R = 70
  const PAD_T = 14

  const allHL = candles.flatMap(c => [c.high, c.low])
  const minP = Math.min(...allHL)
  const maxP = Math.max(...allHL)
  const padP = (maxP - minP) * 0.08
  const yMin = minP - padP
  const yMax = maxP + padP
  const range = yMax - yMin || 1

  const chartW = W - PAD_L - PAD_R
  const candleSpace = chartW / candles.length
  const candleWidth = Math.max(2, candleSpace * 0.62)
  const yPx = (price: number) => PAD_T + (1 - (price - yMin) / range) * (CHART_H - PAD_T)

  const volMax = Math.max(...candles.map(c => c.volume))
  const volBaseY = CHART_H + GAP
  const volH = (vol: number) => (vol / volMax) * (VOL_H - 14)

  const gridLevels = niceGrid(yMin, yMax, 6)

  // weekly vertical separators (every 5 candles)
  const verticalGridX: number[] = []
  for (let i = 5; i < candles.length; i += 5) verticalGridX.push(PAD_L + i * candleSpace)

  const dateInterval = Math.max(1, Math.floor(candles.length / 7))

  // line/area path for line chart type
  const linePts = candles.map((c, i) => {
    const x = PAD_L + i * candleSpace + candleSpace / 2
    return `${x.toFixed(1)},${yPx(c.close).toFixed(1)}`
  }).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${TOTAL_H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <defs>
        <linearGradient id="chart-bg-deep" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(20,28,38,0.65)"/>
          <stop offset="100%" stopColor="rgba(11,15,21,0.9)"/>
        </linearGradient>
        <linearGradient id={`line-fill-${accent.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="0.32"/>
          <stop offset="100%" stopColor={accent} stopOpacity="0"/>
        </linearGradient>
      </defs>

      {/* CHART AREA BG */}
      <rect x={PAD_L} y={PAD_T} width={chartW} height={CHART_H - PAD_T} fill="url(#chart-bg-deep)"/>

      {/* WATERMARK SYMBOL */}
      <text x={PAD_L + chartW / 2} y={PAD_T + (CHART_H - PAD_T) / 2 + 32}
            textAnchor="middle"
            fontFamily="var(--font-fraunces), serif"
            fontSize="120" fontWeight="700"
            fill="#F4EDE0" opacity="0.025"
            letterSpacing="0.06em">
        {symbol}
      </text>

      {/* HORIZONTAL GRID + price labels */}
      {gridLevels.map((p, i) => (
        <g key={`g-${i}`}>
          <line x1={PAD_L} y1={yPx(p)} x2={PAD_L + chartW} y2={yPx(p)}
                stroke="rgba(212,160,77,0.10)" strokeDasharray="2 6" strokeWidth="0.6"/>
          <text x={PAD_L + chartW + 8} y={yPx(p) + 3.5}
                fontFamily="var(--font-jetbrains), monospace"
                fontSize="11" fontWeight="500" fill="#A89A7E">
            ₹{p.toFixed(0)}
          </text>
        </g>
      ))}

      {/* WEEKLY VERTICAL SEPARATORS */}
      {verticalGridX.map((x, i) => (
        <line key={`v-${i}`} x1={x} y1={PAD_T} x2={x} y2={CHART_H}
              stroke="rgba(212,160,77,0.06)" strokeWidth="0.5"/>
      ))}

      {/* SUPPORT / RESISTANCE LINES */}
      {sr && (
        <g>
          <line x1={PAD_L} y1={yPx(sr.resistance)} x2={PAD_L + chartW} y2={yPx(sr.resistance)}
                stroke="#E04A4A" strokeWidth="1" strokeDasharray="6 4" opacity="0.55"/>
          <rect x={PAD_L + 4} y={yPx(sr.resistance) - 9} width="84" height="16" rx="2" fill="rgba(224,74,74,0.16)"/>
          <text x={PAD_L + 8} y={yPx(sr.resistance) + 3}
                fontFamily="var(--font-jetbrains), monospace" fontSize="10" fontWeight="700" fill="#FF8888">
            R · ₹{sr.resistance.toFixed(2)}
          </text>
          <line x1={PAD_L} y1={yPx(sr.support)} x2={PAD_L + chartW} y2={yPx(sr.support)}
                stroke="#5AB088" strokeWidth="1" strokeDasharray="6 4" opacity="0.55"/>
          <rect x={PAD_L + 4} y={yPx(sr.support) - 9} width="84" height="16" rx="2" fill="rgba(90,176,136,0.16)"/>
          <text x={PAD_L + 8} y={yPx(sr.support) + 3}
                fontFamily="var(--font-jetbrains), monospace" fontSize="10" fontWeight="700" fill="#7AD0A4">
            S · ₹{sr.support.toFixed(2)}
          </text>
        </g>
      )}

      {/* MA LINES */}
      {ma20 && (
        <polyline
          points={candles.map((_, i) => ma20[i] > 0 ? `${(PAD_L + i * candleSpace + candleSpace / 2).toFixed(1)},${yPx(ma20[i]).toFixed(1)}` : null).filter(Boolean).join(' ')}
          fill="none" stroke="#FFB830" strokeWidth="1.6" strokeLinejoin="round" strokeDasharray="0"
        />
      )}
      {ma50 && (
        <polyline
          points={candles.map((_, i) => ma50[i] > 0 ? `${(PAD_L + i * candleSpace + candleSpace / 2).toFixed(1)},${yPx(ma50[i]).toFixed(1)}` : null).filter(Boolean).join(' ')}
          fill="none" stroke="#A855F7" strokeWidth="1.6" strokeLinejoin="round" strokeDasharray="6 3"
        />
      )}

      {/* MAIN PRICE SERIES */}
      {chartType === 'candle' && candles.map((c, i) => {
        const cx = PAD_L + i * candleSpace + candleSpace / 2
        const isBull = c.close >= c.open
        const color = isBull ? '#5AB088' : '#E04A4A'
        return (
          <g key={i}>
            <line x1={cx} y1={yPx(c.high)} x2={cx} y2={yPx(c.low)} stroke={color} strokeWidth="1.1"/>
            <rect
              x={cx - candleWidth / 2}
              y={yPx(Math.max(c.open, c.close))}
              width={candleWidth}
              height={Math.max(1.2, Math.abs(yPx(c.open) - yPx(c.close)))}
              fill={color}
              fillOpacity={isBull ? 0.7 : 0.95}
              stroke={color}
              strokeWidth="0.6"
            />
          </g>
        )
      })}
      {chartType === 'bar' && candles.map((c, i) => {
        const cx = PAD_L + i * candleSpace + candleSpace / 2
        const isBull = c.close >= c.open
        const color = isBull ? '#5AB088' : '#E04A4A'
        return (
          <g key={i}>
            <line x1={cx} y1={yPx(c.high)} x2={cx} y2={yPx(c.low)} stroke={color} strokeWidth="1.4"/>
            <line x1={cx - candleWidth / 2} y1={yPx(c.open)} x2={cx} y2={yPx(c.open)} stroke={color} strokeWidth="1.4"/>
            <line x1={cx} y1={yPx(c.close)} x2={cx + candleWidth / 2} y2={yPx(c.close)} stroke={color} strokeWidth="1.4"/>
          </g>
        )
      })}
      {chartType === 'line' && (
        <>
          <polygon
            points={`${PAD_L},${CHART_H - 0} ${linePts} ${PAD_L + chartW},${CHART_H - 0}`}
            fill={`url(#line-fill-${accent.replace('#', '')})`}
          />
          <polyline points={linePts} fill="none" stroke={accent} strokeWidth="1.8" strokeLinejoin="round"/>
        </>
      )}

      {/* CURRENT PRICE TAG */}
      <line x1={PAD_L} y1={yPx(closePrice)} x2={PAD_L + chartW} y2={yPx(closePrice)}
            stroke={accent} strokeWidth="0.8" strokeDasharray="2 3" opacity="0.65"/>
      <rect x={PAD_L + chartW + 1} y={yPx(closePrice) - 9} width="62" height="18" rx="2" fill={accent}/>
      <text x={PAD_L + chartW + 32} y={yPx(closePrice) + 4}
            fontFamily="var(--font-jetbrains), monospace" fontSize="11" fontWeight="700"
            textAnchor="middle" fill="#0B0F15">
        ₹{closePrice.toFixed(2)}
      </text>

      {/* HIGH / LOW MARKERS */}
      <HighLowMarker candles={candles} yPx={yPx} chartLeft={PAD_L} candleSpace={candleSpace}/>

      {/* MA LEGEND */}
      {(ma20 || ma50) && (
        <g transform={`translate(${PAD_L + 12}, ${PAD_T + 16})`}>
          {ma20 && (
            <g>
              <line x1="0" y1="0" x2="14" y2="0" stroke="#FFB830" strokeWidth="1.6"/>
              <text x="20" y="3" fontFamily="var(--font-inter), sans-serif" fontSize="10" fill="#FFB830" fontWeight="600">
                MA 20
              </text>
            </g>
          )}
          {ma50 && (
            <g transform="translate(70, 0)">
              <line x1="0" y1="0" x2="14" y2="0" stroke="#A855F7" strokeWidth="1.6" strokeDasharray="6 3"/>
              <text x="20" y="3" fontFamily="var(--font-inter), sans-serif" fontSize="10" fill="#A855F7" fontWeight="600">
                MA 50
              </text>
            </g>
          )}
        </g>
      )}

      {/* VOLUME PANE */}
      <g>
        <text x={PAD_L} y={volBaseY - 4}
              fontFamily="var(--font-inter), sans-serif" fontSize="9" fontWeight="700"
              fill="#5C5849" letterSpacing="2">
          VOL
        </text>
        <line x1={PAD_L} y1={volBaseY} x2={PAD_L + chartW} y2={volBaseY}
              stroke="rgba(212,160,77,0.2)" strokeWidth="0.6"/>
        <text x={PAD_L + chartW + 8} y={volBaseY + 4}
              fontFamily="var(--font-jetbrains), monospace" fontSize="10"
              fill="#5C5849">
          {(volMax / 100000).toFixed(1)}L
        </text>
        {candles.map((c, i) => {
          const cx = PAD_L + i * candleSpace + candleSpace / 2
          const isBull = c.close >= c.open
          const h = volH(c.volume)
          return (
            <rect key={i}
                  x={cx - candleWidth / 2}
                  y={volBaseY + (VOL_H - 14) - h}
                  width={candleWidth}
                  height={h}
                  fill={isBull ? '#5AB088' : '#E04A4A'}
                  fillOpacity="0.55"/>
          )
        })}
      </g>

      {/* X-AXIS DATES */}
      {candles.map((c, i) => {
        if (i % dateInterval !== 0 && i !== candles.length - 1) return null
        const cx = PAD_L + i * candleSpace + candleSpace / 2
        const d = c.date.match(/\d{4}-(\d{2})-(\d{2})/)
        if (!d) return null
        return (
          <text key={`d-${i}`} x={cx} y={TOTAL_H - 8}
                textAnchor="middle"
                fontFamily="var(--font-jetbrains), monospace"
                fontSize="10" fill="#5C5849" letterSpacing="0.08em">
            {`${d[2]} ${monthName(parseInt(d[1], 10))}`}
          </text>
        )
      })}

      <text x={PAD_R + chartW - 6} y={TOTAL_H - 8}
            textAnchor="end"
            fontFamily="var(--font-inter), sans-serif"
            fontSize="9" fill="#5C5849"
            letterSpacing="0.16em" fontWeight="700">
        ZDM · TERMINAL
      </text>
    </svg>
  )
}

function HighLowMarker({ candles, yPx, chartLeft, candleSpace }: {
  candles: OhlcvCandle[]; yPx: (p: number) => number; chartLeft: number; candleSpace: number
}) {
  const highIdx = candles.reduce((best, c, i) => c.high > candles[best].high ? i : best, 0)
  const lowIdx = candles.reduce((best, c, i) => c.low < candles[best].low ? i : best, 0)
  const hx = chartLeft + highIdx * candleSpace + candleSpace / 2
  const lx = chartLeft + lowIdx * candleSpace + candleSpace / 2
  return (
    <g>
      <text x={hx} y={yPx(candles[highIdx].high) - 7} textAnchor="middle"
            fontFamily="var(--font-jetbrains), monospace" fontSize="9" fontWeight="700" fill="#5AB088">
        ▲ ₹{candles[highIdx].high.toFixed(0)}
      </text>
      <text x={lx} y={yPx(candles[lowIdx].low) + 13} textAnchor="middle"
            fontFamily="var(--font-jetbrains), monospace" fontSize="9" fontWeight="700" fill="#E04A4A">
        ▼ ₹{candles[lowIdx].low.toFixed(0)}
      </text>
    </g>
  )
}

// ─── 52W & bias ───────────────────────────────────────────

function RangeBar({ low, high, current, label, accent }: { low: number; high: number; current: number; label: string; accent: string }) {
  const pct = Math.max(0, Math.min(1, (current - low) / (high - low)))
  return (
    <div style={{
      padding: '12px 14px',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(212,160,77,0.14)',
      borderRadius: '6px',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '10px', fontWeight: 700, color: '#5C5849',
        letterSpacing: '0.18em', textTransform: 'uppercase',
        marginBottom: '8px',
      }}>{label}</div>
      <div style={{ position: 'relative', height: '10px', background: 'rgba(212,160,77,0.12)', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: `${pct * 100}%`,
          background: `linear-gradient(90deg, #E04A4A, ${accent}, #5AB088)`,
          borderRadius: '5px',
        }}/>
        <div style={{
          position: 'absolute', left: `calc(${pct * 100}% - 1.5px)`, top: '-4px',
          width: '3px', height: '18px', background: '#F4EDE0',
          boxShadow: '0 0 6px rgba(244,237,224,0.8)', borderRadius: '1px',
        }}/>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: '8px',
        fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px',
      }}>
        <span style={{ color: '#E04A4A', fontWeight: 600 }}>L · ₹{low.toLocaleString('en-IN')}</span>
        <span style={{ color: '#F4EDE0', fontWeight: 700 }}>NOW · ₹{current.toFixed(2)}</span>
        <span style={{ color: '#5AB088', fontWeight: 600 }}>H · ₹{high.toLocaleString('en-IN')}</span>
      </div>
    </div>
  )
}

function BiasIndicator({ stats }: { stats: ChartStats }) {
  const total = stats.bullish + stats.bearish || 1
  const bullPct = (stats.bullish / total) * 100
  const sentiment = stats.changePct < -3 ? 'STRONG BEAR' : stats.changePct < 0 ? 'BEARISH' : stats.changePct > 3 ? 'STRONG BULL' : 'BULLISH'
  const c = stats.changePct < 0 ? '#E04A4A' : '#5AB088'
  return (
    <div style={{
      padding: '12px 14px',
      background: 'rgba(255,255,255,0.025)',
      border: `1px solid ${c}40`,
      borderRadius: '6px',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif', fontSize: '10px', fontWeight: 700,
        color: '#5C5849', letterSpacing: '0.18em', textTransform: 'uppercase',
        marginBottom: '8px',
      }}>Period Bias</div>
      <div style={{
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '15px', fontWeight: 700, color: c, marginBottom: '8px',
      }}>{sentiment}</div>
      <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(212,160,77,0.10)' }}>
        <div style={{ width: `${bullPct}%`, background: '#5AB088' }}/>
        <div style={{ flex: 1, background: '#E04A4A' }}/>
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', marginTop: '6px',
        fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px',
      }}>
        <span style={{ color: '#5AB088', fontWeight: 700 }}>{stats.bullish} ↑</span>
        <span style={{ color: '#E04A4A', fontWeight: 700 }}>{stats.bearish} ↓</span>
      </div>
    </div>
  )
}

// ─── helpers ──────────────────────────────────────────────

function niceGrid(min: number, max: number, count: number): number[] {
  const step = (max - min) / count
  const mag = Math.pow(10, Math.floor(Math.log10(step)))
  const norm = step / mag
  const niceStep = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag
  const start = Math.ceil(min / niceStep) * niceStep
  const out: number[] = []
  for (let v = start; v <= max; v += niceStep) out.push(v)
  return out
}
function monthName(m: number): string {
  return ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][m - 1] ?? ''
}
