'use client'

import type { ScenarioStock, OhlcvCandle } from '@/types/scenario'

// ============================================================================
// 6 ARTIFACT RENDERERS — internals only (wrapped by ArtifactCard externally)
// ============================================================================

const C = {
  cream:    '#E8DFC8',
  dimCream: '#A89880',
  red:      '#DC2626',
  redBg:    'rgba(220,38,38,0.08)',
  green:    '#10B981',
  amber:    '#FFB830',
  cyan:     '#06B6D4',
  text2:    'rgba(232,223,200,0.6)',
  text3:    'rgba(168,152,128,0.45)',
}

// ─── 01 · PRICE CHART ───────────────────────────────────────
export function PriceChartArtifact({ stock }: { stock: ScenarioStock }) {
  const candles = stock.candles
  if (candles.length === 0) return null

  const w = 100
  const h = 100
  const allPrices = candles.flatMap(c => [c.high, c.low])
  const min = Math.min(...allPrices)
  const max = Math.max(...allPrices)
  const range = max - min || 1
  const candleWidth = (w / candles.length) * 0.7
  const gap = (w / candles.length) * 0.3

  const yPx = (price: number) => h - ((price - min) / range) * (h * 0.85) - h * 0.075

  const lastClose = candles[candles.length - 1].close
  const firstOpen = candles[0].open
  const totalChange = ((lastClose - firstOpen) / firstOpen) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
      {/* Top stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '20px', fontWeight: 700, color: C.cream, letterSpacing: '0.02em' }}>
            ₹{stock.closePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '9px', letterSpacing: '0.16em', color: C.text2, textTransform: 'uppercase', marginTop: '2px' }}>
            Mar 06, 2020 close
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '16px', fontWeight: 600,
            color: totalChange < 0 ? C.red : C.green,
          }}>
            {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(2)}%
          </div>
          <div style={{ fontSize: '9px', letterSpacing: '0.16em', color: C.text3, textTransform: 'uppercase', marginTop: '2px' }}>
            Last 30 days
          </div>
        </div>
      </div>

      {/* Candlestick chart */}
      <div style={{ flex: 1, position: 'relative', minHeight: '120px' }}>
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          {/* horizontal grid */}
          {[0.25, 0.5, 0.75].map(r => (
            <line key={r} x1="0" y1={h * r} x2={w} y2={h * r}
              stroke="rgba(255,255,255,0.04)" strokeWidth="0.2" strokeDasharray="0.5 0.8" />
          ))}
          {candles.map((c, i) => {
            const cx = i * (candleWidth + gap) + candleWidth / 2 + gap / 2
            const isBull = c.close >= c.open
            const color = isBull ? C.green : C.red
            return (
              <g key={i}>
                <line x1={cx} y1={yPx(c.high)} x2={cx} y2={yPx(c.low)} stroke={color} strokeWidth="0.3" />
                <rect
                  x={i * (candleWidth + gap) + gap / 2}
                  y={yPx(Math.max(c.open, c.close))}
                  width={candleWidth}
                  height={Math.max(0.4, Math.abs(yPx(c.open) - yPx(c.close)))}
                  fill={color}
                  opacity={isBull ? 0.55 : 0.85}
                />
              </g>
            )
          })}
        </svg>
        {/* Y-axis price labels */}
        <div style={{ position: 'absolute', right: '4px', top: '4px', fontSize: '8px', fontFamily: 'var(--font-geist-mono), monospace', color: C.text3 }}>
          ₹{max.toFixed(0)}
        </div>
        <div style={{ position: 'absolute', right: '4px', bottom: '4px', fontSize: '8px', fontFamily: 'var(--font-geist-mono), monospace', color: C.text3 }}>
          ₹{min.toFixed(0)}
        </div>
      </div>

      {/* Volume strip */}
      <VolumeStrip candles={candles} />
    </div>
  )
}

function VolumeStrip({ candles }: { candles: OhlcvCandle[] }) {
  const max = Math.max(...candles.map(c => c.volume))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1px', height: '20px' }}>
      {candles.map((c, i) => {
        const isBull = c.close >= c.open
        return (
          <div key={i} style={{
            flex: 1,
            height: `${(c.volume / max) * 100}%`,
            background: isBull ? 'rgba(16,185,129,0.5)' : 'rgba(220,38,38,0.5)',
            minHeight: '1px',
          }} />
        )
      })}
    </div>
  )
}

// ─── 02 · KEY METRICS ────────────────────────────────────────
export function KeyMetricsArtifact({ stock }: { stock: ScenarioStock }) {
  const m = stock.metrics
  const rows: Array<[string, string, string]> = [
    ['P/E',         m.pe.toFixed(1),                                       'price / earnings'],
    ['EPS',         `₹${m.eps.toFixed(2)}`,                                'per share, TTM'],
    ['Market Cap',  `₹${(m.marketCapCr / 1000).toFixed(1)}K Cr`,           'total value'],
    ['52W Range',   `₹${m.range52w.low}–${m.range52w.high}`,               '12-month low–high'],
    ['Beta',        m.beta.toFixed(2),                                     'vs Nifty 50'],
    ['Div Yield',   `${m.divYieldPct.toFixed(1)}%`,                        'annualized'],
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', height: '100%', alignContent: 'space-around' }}>
      {rows.map(([k, v, sub]) => (
        <div key={k}>
          <div style={{ fontSize: '9px', letterSpacing: '0.16em', color: C.text3, textTransform: 'uppercase', marginBottom: '2px' }}>{k}</div>
          <div style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '15px', fontWeight: 600, color: C.cream }}>{v}</div>
          <div style={{ fontSize: '8px', color: C.text3, marginTop: '1px' }}>{sub}</div>
        </div>
      ))}
    </div>
  )
}

// ─── 03 · BALANCE SHEET ──────────────────────────────────────
export function BalanceSheetArtifact({ stock }: { stock: ScenarioStock }) {
  const bs = stock.balanceSheet
  const total = bs.totalAssetsCr
  const liabPct = (bs.totalLiabilitiesCr / total) * 100
  const equityPct = (bs.shareholderEquityCr / total) * 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '10px' }}>
      <div style={{ fontSize: '9px', color: C.text2, fontStyle: 'italic' }}>{bs.filedQuarter}</div>

      {/* Stacked bar */}
      <div>
        <div style={{ display: 'flex', height: '24px', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(220,38,38,0.18)' }}>
          <div title={`Liabilities: ₹${bs.totalLiabilitiesCr.toLocaleString('en-IN')} Cr`} style={{ width: `${liabPct}%`, background: C.red, opacity: 0.75 }} />
          <div title={`Equity: ₹${bs.shareholderEquityCr.toLocaleString('en-IN')} Cr`} style={{ width: `${equityPct}%`, background: C.green, opacity: 0.65 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: C.text2, marginTop: '4px' }}>
          <span>Liabilities {liabPct.toFixed(0)}%</span>
          <span>Equity {equityPct.toFixed(0)}%</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <Stat label="Total Assets" value={`₹${(bs.totalAssetsCr / 1000).toFixed(1)}K Cr`} />
        <Stat label="Cash + Equiv." value={`₹${(bs.cashAndEquivalentsCr / 1000).toFixed(1)}K Cr`} />
        <Stat label="D/E Ratio" value={bs.debtToEquity.toFixed(2)} highlight={bs.debtToEquity > 1} />
        <Stat label="Current Ratio" value={bs.currentRatio.toFixed(2)} highlight={bs.currentRatio < 1} />
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: '8px', letterSpacing: '0.14em', color: C.text3, textTransform: 'uppercase', marginBottom: '2px' }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-geist-mono), monospace',
        fontSize: '13px', fontWeight: 600,
        color: highlight ? C.red : C.cream,
      }}>
        {value}
      </div>
    </div>
  )
}

// ─── 04 · NEWS (24h) ─────────────────────────────────────────
export function NewsArtifact({ stock }: { stock: ScenarioStock }) {
  const sentColor = (s: 'bullish' | 'bearish' | 'neutral') =>
    s === 'bullish' ? C.green : s === 'bearish' ? C.red : C.amber

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
      {stock.news.map((n, i) => (
        <div key={i} style={{
          display: 'flex',
          gap: '10px',
          padding: '8px 10px',
          background: 'rgba(0,0,0,0.3)',
          borderLeft: `2px solid ${sentColor(n.sentiment)}`,
          borderRadius: '0 3px 3px 0',
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: '8px', letterSpacing: '0.14em',
              color: sentColor(n.sentiment),
              textTransform: 'uppercase',
              marginBottom: '3px',
              fontWeight: 600,
            }}>
              {n.source}
            </div>
            <div style={{
              fontFamily: 'Garamond, "EB Garamond", serif',
              fontSize: '12px',
              color: C.cream,
              lineHeight: 1.4,
            }}>
              {n.headline}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── 05 · HOLDINGS ───────────────────────────────────────────
export function HoldingsArtifact({ stock }: { stock: ScenarioStock }) {
  const total = stock.holders.reduce((s, h) => s + h.percent, 0)
  const max = Math.max(...stock.holders.map(h => h.percent))

  const typeColor: Record<string, string> = {
    'promoter':              C.amber,
    'foreign-institution':   C.cyan,
    'domestic-institution':  C.green,
    'mutual-fund':           '#A855F7',
    'insider':               C.red,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
      {stock.holders.map((h, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', alignItems: 'center' }}>
          <div>
            <div style={{
              fontSize: '11px',
              color: C.cream,
              fontWeight: 500,
              marginBottom: '2px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {h.name}
            </div>
            <div style={{
              height: '4px',
              background: 'rgba(255,255,255,0.06)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${(h.percent / max) * 100}%`,
                height: '100%',
                background: typeColor[h.type] ?? C.cream,
                borderRadius: '2px',
              }} />
            </div>
          </div>
          <div style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '12px', fontWeight: 600,
            color: C.cream,
            minWidth: '46px',
            textAlign: 'right',
          }}>
            {h.percent.toFixed(1)}%
          </div>
        </div>
      ))}
      <div style={{
        marginTop: 'auto',
        paddingTop: '6px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '9px',
        color: C.text2,
      }}>
        <span>Top 5 holders</span>
        <span>{total.toFixed(1)}% of float</span>
      </div>
    </div>
  )
}

// ─── 06 · SECTOR POSITION ────────────────────────────────────
export function SectorPositionArtifact({ stock }: { stock: ScenarioStock }) {
  const sp = stock.sectorPosition

  const impactColor: Record<string, string> = {
    'high-positive': C.green,
    'positive':      'rgba(16,185,129,0.55)',
    'neutral':       C.text3,
    'negative':      'rgba(220,38,38,0.55)',
    'high-negative': C.red,
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', height: '100%' }}>
      {/* Left — sensitivities */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '8px', letterSpacing: '0.16em', color: C.text3, textTransform: 'uppercase', marginBottom: '2px' }}>
          Factor Sensitivities
        </div>
        {sp.sensitivities.map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
          }}>
            <span style={{ color: C.cream }}>{s.factor}</span>
            <span style={{
              padding: '1px 6px',
              borderRadius: '2px',
              background: `${impactColor[s.impact]}25`,
              color: impactColor[s.impact],
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: '9px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
            }}>
              {s.impact === 'high-positive' ? '+++' : s.impact === 'positive' ? '++' : s.impact === 'neutral' ? '~' : s.impact === 'negative' ? '−−' : '−−−'}
            </span>
          </div>
        ))}
      </div>

      {/* Right — correlations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '8px', letterSpacing: '0.16em', color: C.text3, textTransform: 'uppercase', marginBottom: '2px' }}>
          Correlations
        </div>
        <CorrelationBar label="vs Nifty" value={sp.niftyBeta} unit="β" />
        <CorrelationBar label="vs Sector" value={sp.sectorBeta} unit="β" />
        <CorrelationBar label="vs Crude Oil" value={sp.oilCorrelation} unit="ρ" />
        <CorrelationBar label="vs USD/INR" value={sp.usdInrCorrelation} unit="ρ" />
      </div>
    </div>
  )
}

function CorrelationBar({ label, value, unit }: { label: string; value: number; unit: string }) {
  const isNegative = value < 0
  const fillPct = Math.min(100, Math.abs(value) * 50 + 50) // 0 → 50%, ±1 → 0% or 100%
  const valueX = isNegative ? 50 - Math.abs(value) * 50 : 50
  const valueWidth = Math.abs(value) * 50

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: C.text2, marginBottom: '4px' }}>
        <span>{label}</span>
        <span style={{ fontFamily: 'var(--font-geist-mono), monospace', color: isNegative ? C.red : C.green, fontWeight: 600 }}>
          {value > 0 ? '+' : ''}{value.toFixed(2)} {unit}
        </span>
      </div>
      <div style={{
        position: 'relative',
        height: '4px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '2px',
      }}>
        {/* center marker */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '-2px', bottom: '-2px',
          width: '1px',
          background: 'rgba(255,255,255,0.3)',
        }} />
        {/* value bar */}
        <div style={{
          position: 'absolute',
          left: `${valueX}%`,
          width: `${valueWidth}%`,
          top: 0, bottom: 0,
          background: isNegative ? C.red : C.green,
          borderRadius: '2px',
        }} />
      </div>
    </div>
  )
}
