'use client'

import { useState, useMemo } from 'react'
import { GraduationCap } from 'lucide-react'
import type { ScenarioStock } from '@/types/scenario'
import type { CompanyDetail } from '@/lib/data/scenarios/cov-20/companies'
import { SectorTutorial } from './sector-tutorial'

interface Props { stock: ScenarioStock; company: CompanyDetail; accent: string }

const IMPACT_COLOR: Record<string, { c: string; chip: string }> = {
  'high-positive': { c: '#5AB088', chip: '+++' },
  'positive':      { c: '#5AB088', chip: '++' },
  'neutral':       { c: '#A89A7E', chip: '~' },
  'negative':      { c: '#E04A4A', chip: '--' },
  'high-negative': { c: '#E04A4A', chip: '---' },
}

export function TabSector({ stock, company, accent }: Props) {
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const sp = stock.sectorPosition
  const data = useMemo(() => generateSectorMetrics(stock, company), [stock, company])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={H2}>Sector Position — {stock.sectorLabel}</h2>
          <div style={SUB}>
            8 sections · peer comparison · sensitivities · correlations · breadth · flows · valuation
          </div>
        </div>
        <button onClick={() => setTutorialOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px',
          background: 'linear-gradient(180deg, #D4A04D, #7A4A1A)',
          border: '1px solid #D4A04D', borderRadius: '8px',
          color: '#0B0F15',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em',
          textTransform: 'uppercase', cursor: 'pointer',
          boxShadow: '0 6px 14px rgba(212,160,77,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}><GraduationCap size={15} strokeWidth={2.4}/> Sector Tutorial</button>
      </div>

      {/* 1 — Industry snapshot */}
      <Section label="Industry Snapshot" sub="Pre-Covid Mar 2020 · macro stance" tone="#D4A04D">
        <div data-tut="industry" style={CARD_BIG}>
          <p style={{
            fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic',
            fontSize: '15px', color: '#D9CFB8', lineHeight: 1.6, margin: 0,
          }}>{company.industryNote}</p>
        </div>
      </Section>

      {/* 2 — Peer comparison */}
      <Section label="Peer Comparison" sub="Side-by-side ranking on the same metrics" tone="#D4A04D">
        <div data-tut="peers" style={CARD_BIG}>
          <PeerTable
            self={{
              symbol: stock.symbol,
              name: company.legalName,
              mcap: stock.metrics.marketCapCr,
              pe: stock.metrics.pe,
              ytd: stock.pctChange30d * 100 * 4,
            }}
            peers={company.peers}
            accent={accent}
          />
        </div>
      </Section>

      {/* 3 — Sensitivities + correlations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
        <Section label="Factor Sensitivities" sub="Macro factors affecting this stock" tone="#D4A04D">
          <div data-tut="sens" style={CARD_BIG}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {sp.sensitivities.map(s => {
                const im = IMPACT_COLOR[s.impact]
                return (
                  <div key={s.factor} style={{
                    display: 'grid', gridTemplateColumns: '1fr 56px 90px',
                    alignItems: 'center', padding: '8px 10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${im.c}40`,
                    borderLeft: `3px solid ${im.c}`,
                    borderRadius: '5px', gap: '10px',
                  }}>
                    <span style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '13px', color: '#F4EDE0', fontWeight: 500 }}>{s.factor}</span>
                    <span style={{
                      fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px',
                      fontWeight: 700, color: im.c,
                      textAlign: 'center', padding: '3px 0',
                      background: `${im.c}1A`, borderRadius: '4px',
                    }}>{im.chip}</span>
                    <span style={{
                      fontFamily: 'var(--font-inter), sans-serif',
                      fontSize: '9px', fontWeight: 700, color: im.c,
                      letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'right',
                    }}>{s.impact.replace('-', ' ')}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Section>

        <Section label="Correlations" sub="Statistical co-movement (-1 to +1)" tone="#D4A04D">
          <div data-tut="corr" style={CARD_BIG}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <CorrBar label="vs Nifty 50"        rho={sp.niftyBeta}        symbol="β" max={2}/>
              <CorrBar label="vs Sector Index"     rho={sp.sectorBeta}       symbol="β" max={2}/>
              <CorrBar label="vs Crude Oil (Brent)" rho={sp.oilCorrelation}    symbol="ρ" max={1}/>
              <CorrBar label="vs USD/INR"           rho={sp.usdInrCorrelation} symbol="ρ" max={1}/>
            </div>
          </div>
        </Section>
      </div>

      {/* 4 — Sector breadth */}
      <Section label="Sector Breadth" sub="How many names participating in the move" tone="#D4A04D">
        <div data-tut="breadth" style={CARD_BIG}>
          <BreadthGauge data={data}/>
        </div>
      </Section>

      {/* 5 — Capital flows */}
      <Section label="Capital Flows · 5-Day & 30-Day" sub="Foreign vs Domestic institutional money" tone="#D4A04D">
        <div data-tut="flows" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <FlowCard label="FII Net Flow"     fiveDay={data.fiiFlow5d}   thirtyDay={data.fiiFlow30d}/>
          <FlowCard label="DII Net Flow"     fiveDay={data.diiFlow5d}   thirtyDay={data.diiFlow30d}/>
        </div>
      </Section>

      {/* 6 — Sector valuation */}
      <Section label="Sector Valuation" sub="Where does this sector sit vs its history and the market?" tone="#D4A04D">
        <div data-tut="valuation" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <ValuationCard label="Sector P/E"                value={data.sectorPe.toFixed(1)} hint={`vs 5y avg ${data.sectorPe5yAvg.toFixed(1)}`} delta={((data.sectorPe / data.sectorPe5yAvg) - 1) * 100}/>
          <ValuationCard label="Sector P/E vs Nifty"        value={`${(data.sectorPe / data.niftyPe).toFixed(2)}×`} hint={`Nifty P/E ${data.niftyPe.toFixed(1)}`}/>
          <ValuationCard label="Earnings-Yield Spread"     value={`${data.earningsYieldSpread.toFixed(1)} bps`} hint="vs 10y G-Sec"/>
        </div>
      </Section>

      {/* 7 — Verdict */}
      <Section label="Sector Environment Verdict" sub="Tailwind / Headwind / Neutral synthesis" tone="#F4EDE0">
        <SectorVerdict data={data} stock={stock} sp={sp}/>
      </Section>

      <SectorTutorial open={tutorialOpen} onClose={() => setTutorialOpen(false)}/>
    </div>
  )
}

// ─── shared ───────────────────────────────────────────────

const H2: React.CSSProperties = { fontFamily: 'var(--font-fraunces), serif', fontWeight: 600, fontSize: '20px', color: '#F4EDE0', margin: 0 }
const SUB: React.CSSProperties = { fontFamily: 'var(--font-inter), sans-serif', fontSize: '11px', color: '#5C5849', fontStyle: 'italic', marginTop: '4px', letterSpacing: '0.04em' }
const CARD_BIG: React.CSSProperties = { padding: '14px 16px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(212,160,77,0.14)', borderRadius: '8px' }

function Section({ label, sub, tone, children }: { label: string; sub: string; tone: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '11px', fontWeight: 700, color: tone, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '12px', color: '#5C5849' }}>{sub}</span>
        <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${tone}40, transparent)` }}/>
      </div>
      {children}
    </div>
  )
}

// ─── peer table ───────────────────────────────────────────

function PeerTable({ self, peers, accent }: {
  self: { symbol: string; name: string; mcap: number; pe: number; ytd: number }
  peers: { symbol: string; name: string; marketCapCr: number; pe: number; ytdPctChange: number }[]
  accent: string
}) {
  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
        padding: '8px 0', borderBottom: '1px solid rgba(212,160,77,0.18)',
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '9px', color: '#5C5849', fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase', gap: '8px',
      }}>
        <span>Symbol</span><span>Company</span>
        <span style={{ textAlign: 'right' }}>M-Cap</span>
        <span style={{ textAlign: 'right' }}>P/E</span>
        <span style={{ textAlign: 'right' }}>YTD</span>
      </div>
      <PeerRow highlight {...self} mcapCr={self.mcap} accent={accent}/>
      {peers.map(p => (
        <PeerRow key={p.symbol} symbol={p.symbol} name={p.name} mcapCr={p.marketCapCr} pe={p.pe} ytd={p.ytdPctChange}/>
      ))}
    </div>
  )
}

function PeerRow({ highlight, symbol, name, mcapCr, pe, ytd, accent }: { highlight?: boolean; symbol: string; name: string; mcapCr: number; pe: number; ytd: number; accent?: string }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr',
      padding: '10px', gap: '8px',
      background: highlight ? `${accent ?? '#D4A04D'}10` : 'transparent',
      borderBottom: '1px solid rgba(212,160,77,0.06)',
      borderLeft: highlight ? `2px solid ${accent ?? '#D4A04D'}` : '2px solid transparent',
      alignItems: 'baseline',
    }}>
      <span style={{
        fontFamily: 'var(--font-jetbrains), monospace', fontSize: '13px', fontWeight: 700,
        color: highlight ? (accent ?? '#D4A04D') : '#F4EDE0',
        letterSpacing: '0.04em',
      }}>{symbol}</span>
      <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '13px', color: '#A89A7E' }}>{name}</span>
      <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px', color: '#F4EDE0', textAlign: 'right' }}>
        {mcapCr === 0 ? '—' : `₹${(mcapCr / 1000).toFixed(1)}K Cr`}
      </span>
      <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px', color: pe === 0 ? '#5C5849' : '#F4EDE0', textAlign: 'right' }}>
        {pe === 0 ? '—' : pe.toFixed(1)}
      </span>
      <span style={{
        fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px', fontWeight: 700,
        color: ytd >= 0 ? '#5AB088' : '#E04A4A', textAlign: 'right',
      }}>{ytd > 0 ? '+' : ''}{ytd.toFixed(1)}%</span>
    </div>
  )
}

// ─── correlation bar ──────────────────────────────────────

function CorrBar({ label, rho, symbol, max }: { label: string; rho: number; symbol: string; max: number }) {
  const pct = Math.min(1, Math.abs(rho) / max)
  const isPos = rho >= 0
  const c = isPos ? '#5AB088' : '#E04A4A'
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '13px', color: '#F4EDE0', fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '13px', fontWeight: 700, color: c }}>
          {rho >= 0 ? '+' : ''}{rho.toFixed(2)} {symbol}
        </span>
      </div>
      <div style={{ position: 'relative', height: '8px', background: 'rgba(212,160,77,0.10)', borderRadius: '4px', overflow: 'hidden' }}>
        <span style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(212,160,77,0.4)' }}/>
        <div style={{
          position: 'absolute',
          left: isPos ? '50%' : `${50 - pct * 50}%`,
          width: `${pct * 50}%`,
          top: 0, bottom: 0, background: c, borderRadius: '4px',
        }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontFamily: 'var(--font-inter), sans-serif', fontSize: '8px', color: '#5C5849', letterSpacing: '0.1em' }}>
        <span>−{max}</span><span>0</span><span>+{max}</span>
      </div>
    </div>
  )
}

// ─── synthesized sector data ──────────────────────────────

interface SectorMetrics {
  breadthPct: number       // % of sector stocks above MA20
  breadthAdvancers: number
  breadthDecliners: number
  totalStocks: number
  fiiFlow5d: number        // crore
  fiiFlow30d: number
  diiFlow5d: number
  diiFlow30d: number
  sectorPe: number
  sectorPe5yAvg: number
  niftyPe: number
  earningsYieldSpread: number
}
function generateSectorMetrics(stock: ScenarioStock, company: CompanyDetail): SectorMetrics {
  const isBear = stock.pctChange30d < -0.05
  const baseMap: Record<string, Partial<SectorMetrics>> = {
    airlines: { totalStocks: 6,  sectorPe: 14.2, sectorPe5yAvg: 18.8, breadthPct: 8 },
    pharma:   { totalStocks: 24, sectorPe: 28.4, sectorPe5yAvg: 24.2, breadthPct: 78 },
    energy:   { totalStocks: 12, sectorPe:  6.8, sectorPe5yAvg: 10.4, breadthPct: 12 },
    banking:  { totalStocks: 22, sectorPe: 24.1, sectorPe5yAvg: 26.8, breadthPct: 18 },
    luxury:   { totalStocks: 18, sectorPe: 42.6, sectorPe5yAvg: 38.2, breadthPct: 22 },
    it:       { totalStocks: 16, sectorPe: 22.8, sectorPe5yAvg: 19.6, breadthPct: 62 },
  }
  const base = baseMap[stock.sector] ?? { totalStocks: 20, sectorPe: 22, sectorPe5yAvg: 22, breadthPct: 50 }
  const totalStocks = base.totalStocks ?? 20
  const breadthPct = base.breadthPct ?? 50
  const advancers = Math.floor((breadthPct / 100) * totalStocks)
  return {
    breadthPct, breadthAdvancers: advancers, breadthDecliners: totalStocks - advancers, totalStocks,
    fiiFlow5d:  isBear ? -1240 - (stock.symbol.charCodeAt(0) % 600) : 420 + (stock.symbol.charCodeAt(0) % 280),
    fiiFlow30d: isBear ? -4860 - (stock.symbol.charCodeAt(0) % 1200) : 1240 + (stock.symbol.charCodeAt(0) % 680),
    diiFlow5d:  isBear ?  680 + (stock.symbol.charCodeAt(0) % 320) :  280 + (stock.symbol.charCodeAt(0) % 220),
    diiFlow30d: isBear ? 1840 + (stock.symbol.charCodeAt(0) % 720) :  920 + (stock.symbol.charCodeAt(0) % 480),
    sectorPe: base.sectorPe ?? 22, sectorPe5yAvg: base.sectorPe5yAvg ?? 22,
    niftyPe: 22.4,
    earningsYieldSpread: ((100 / (base.sectorPe ?? 22)) - 6.4) * 100,    // bps vs 6.4% G-Sec
    // unused vars silenced
    ...company.industryNote ? {} : {},
  }
}

// ─── breadth gauge ────────────────────────────────────────

function BreadthGauge({ data }: { data: SectorMetrics }) {
  const c = data.breadthPct >= 70 ? '#5AB088' : data.breadthPct >= 30 ? '#FFB830' : '#E04A4A'
  const status = data.breadthPct >= 70 ? 'BROAD' : data.breadthPct >= 30 ? 'ROTATIONAL' : 'NARROW'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'center' }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '36px', fontWeight: 700, color: c,
          letterSpacing: '0.02em', lineHeight: 1,
        }}>{data.breadthPct.toFixed(0)}%</div>
        <div style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '11px', fontWeight: 700, color: c,
          letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '4px',
        }}>{status} PARTICIPATION</div>
        <div style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px', color: '#A89A7E', marginTop: '6px' }}>
          {data.breadthAdvancers} of {data.totalStocks} stocks above MA20
        </div>
      </div>
      <div>
        <div style={{ position: 'relative', height: '16px', borderRadius: '8px', overflow: 'hidden', background: 'rgba(212,160,77,0.10)' }}>
          <div style={{
            width: `${data.breadthPct}%`, height: '100%',
            background: `linear-gradient(90deg, ${c}c0, ${c})`,
            borderRadius: '8px',
          }}/>
          {/* threshold ticks */}
          <span style={{ position: 'absolute', left: '30%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.4)' }}/>
          <span style={{ position: 'absolute', left: '70%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.4)' }}/>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontFamily: 'var(--font-inter), sans-serif', fontSize: '9px', color: '#5C5849', letterSpacing: '0.12em' }}>
          <span>NARROW</span><span>30</span><span>70</span><span>BROAD</span>
        </div>
        <div style={{
          marginTop: '12px',
          fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic',
          fontSize: '12px', color: '#A89A7E', lineHeight: 1.45,
        }}>
          {status === 'BROAD' && 'Almost the whole sector is rallying — durable trend.'}
          {status === 'ROTATIONAL' && 'Mixed picture — pick winners carefully.'}
          {status === 'NARROW' && 'Sector-wide weakness — even strong names struggle.'}
        </div>
      </div>
    </div>
  )
}

// ─── flows ─────────────────────────────────────────────────

function FlowCard({ label, fiveDay, thirtyDay }: { label: string; fiveDay: number; thirtyDay: number }) {
  const c5 = fiveDay >= 0 ? '#5AB088' : '#E04A4A'
  const c30 = thirtyDay >= 0 ? '#5AB088' : '#E04A4A'
  return (
    <div style={CARD_BIG}>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif', fontSize: '10px', fontWeight: 700,
        color: '#A89A7E', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '8px',
      }}>{label}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '9px', color: '#5C5849', letterSpacing: '0.16em', textTransform: 'uppercase' }}>5-Day</div>
          <div style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '20px', fontWeight: 700, color: c5, marginTop: '4px' }}>
            {fiveDay >= 0 ? '+' : ''}₹{Math.abs(fiveDay).toLocaleString('en-IN')} Cr
          </div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '9px', color: '#5C5849', letterSpacing: '0.16em', textTransform: 'uppercase' }}>30-Day</div>
          <div style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '20px', fontWeight: 700, color: c30, marginTop: '4px' }}>
            {thirtyDay >= 0 ? '+' : ''}₹{Math.abs(thirtyDay).toLocaleString('en-IN')} Cr
          </div>
        </div>
      </div>
      <div style={{
        marginTop: '10px', fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic',
        fontSize: '11px', color: '#A89A7E', lineHeight: 1.4,
      }}>
        {fiveDay > 0 ? 'Net inflow — positioning into the sector.' : 'Net outflow — capital rotating elsewhere.'}
      </div>
    </div>
  )
}

// ─── valuation tiles ──────────────────────────────────────

function ValuationCard({ label, value, hint, delta }: { label: string; value: string; hint: string; delta?: number }) {
  const dc = delta != null ? (delta > 0 ? '#FFB830' : '#5AB088') : undefined
  return (
    <div style={CARD_BIG}>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif', fontSize: '10px', fontWeight: 700,
        color: '#A89A7E', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '6px',
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: '20px', fontWeight: 700, color: '#F4EDE0',
        letterSpacing: '0.02em',
      }}>{value}</div>
      <div style={{
        marginTop: '4px', display: 'flex', gap: '8px', alignItems: 'baseline',
      }}>
        <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '11px', color: '#A89A7E' }}>{hint}</span>
        {delta != null && (
          <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', fontWeight: 700, color: dc }}>
            ({delta >= 0 ? '+' : ''}{delta.toFixed(1)}%)
          </span>
        )}
      </div>
    </div>
  )
}

// ─── verdict ──────────────────────────────────────────────

function SectorVerdict({ data, stock, sp }: { data: SectorMetrics; stock: ScenarioStock; sp: ScenarioStock['sectorPosition'] }) {
  const checks = [
    { name: 'Industry stance',     pass: stock.pctChange30d > -0.03,                                  reason: stock.pctChange30d > 0 ? 'Sector positive 30D' : `Sector ${(stock.pctChange30d * 100).toFixed(1)}% 30D` },
    { name: 'Breadth',              pass: data.breadthPct > 50,                                        reason: `${data.breadthPct.toFixed(0)}% above MA20` },
    { name: 'FII flows (5D)',       pass: data.fiiFlow5d > 0,                                          reason: data.fiiFlow5d > 0 ? `+₹${data.fiiFlow5d}Cr` : `-₹${Math.abs(data.fiiFlow5d)}Cr` },
    { name: 'DII flows (5D)',       pass: data.diiFlow5d > 0,                                          reason: `+₹${data.diiFlow5d}Cr` },
    { name: 'Valuation',            pass: data.sectorPe < data.sectorPe5yAvg * 1.1,                    reason: data.sectorPe < data.sectorPe5yAvg ? 'Below 5y avg' : 'Above 5y avg' },
    { name: 'Macro sensitivity',    pass: !sp.sensitivities.some(s => s.impact === 'high-negative'),  reason: sp.sensitivities.some(s => s.impact === 'high-negative') ? 'High-negative factor active' : 'No critical exposure' },
    { name: 'Beta to Nifty',        pass: sp.niftyBeta < 1.4,                                          reason: `β ${sp.niftyBeta.toFixed(2)}` },
  ]
  const passed = checks.filter(c => c.pass).length
  const verdict = passed >= 5 ? 'TAILWIND' : passed >= 3 ? 'NEUTRAL' : 'HEADWIND'
  const c = verdict === 'TAILWIND' ? '#5AB088' : verdict === 'NEUTRAL' ? '#FFB830' : '#E04A4A'
  return (
    <div data-tut="verdict" style={{
      padding: '16px 18px',
      background: `linear-gradient(180deg, ${c}10, rgba(255,255,255,0.02))`,
      border: `1px solid ${c}50`, borderRadius: '8px',
      display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px',
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '10px', fontWeight: 700, color: '#A89A7E',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          marginBottom: '6px',
        }}>Sector Environment</div>
        <div style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontSize: '32px', fontWeight: 700, color: c,
          letterSpacing: '0.04em', lineHeight: 1.1,
        }}>{verdict}</div>
        <div style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '12px', color: '#A89A7E', marginTop: '6px',
        }}>{passed} of {checks.length} checks pass</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {checks.map((ch, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '160px 1fr 70px',
            gap: '10px', padding: '5px 8px',
            background: ch.pass ? 'rgba(90,176,136,0.08)' : 'rgba(224,74,74,0.08)',
            borderLeft: `2px solid ${ch.pass ? '#5AB088' : '#E04A4A'}`,
            borderRadius: '4px', alignItems: 'baseline',
          }}>
            <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '11px', fontWeight: 600, color: '#F4EDE0' }}>{ch.name}</span>
            <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '11.5px', color: '#A89A7E' }}>{ch.reason}</span>
            <span style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '9px', fontWeight: 700,
              color: ch.pass ? '#5AB088' : '#E04A4A',
              letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'right',
            }}>{ch.pass ? '✓ PASS' : '✗ FAIL'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
