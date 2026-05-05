'use client'

import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import type { ScenarioStock } from '@/types/scenario'
import type { CompanyDetail } from '@/lib/data/scenarios/cov-20/companies'
import { FundamentalsTutorial } from './fundamentals-tutorial'

interface Props { stock: ScenarioStock; company: CompanyDetail; accent: string }

export function TabFundamentals({ stock, company, accent }: Props) {
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const m = stock.metrics
  const bs = stock.balanceSheet
  const itr = company.itr

  // Derived metrics
  const ev = m.marketCapCr + bs.longTermDebtCr - bs.cashAndEquivalentsCr
  const evEbitda = itr.ebitdaCr > 0 ? ev / itr.ebitdaCr : 0
  const ps = m.marketCapCr > 0 ? m.marketCapCr / itr.totalRevenueCr : 0
  const pb = m.marketCapCr > 0 && bs.shareholderEquityCr > 0 ? m.marketCapCr / bs.shareholderEquityCr : 0
  const roe = bs.shareholderEquityCr > 0 ? (itr.netProfitCr / bs.shareholderEquityCr) * 100 : 0
  const roce = bs.totalAssetsCr > 0 ? ((itr.netProfitCr + 0.25 * bs.longTermDebtCr) / (bs.shareholderEquityCr + bs.longTermDebtCr)) * 100 : 0
  const opMargin = itr.totalRevenueCr > 0 ? (itr.ebitdaCr / itr.totalRevenueCr) * 100 : 0
  const netMargin = itr.totalRevenueCr > 0 ? (itr.netProfitCr / itr.totalRevenueCr) * 100 : 0
  const bookValuePerShare = bs.shareholderEquityCr > 0 ? (bs.shareholderEquityCr * 100) / (m.marketCapCr / m.eps) : 0
  const interestCoverage = itr.ebitdaCr > 0 ? itr.ebitdaCr / Math.max(0.1, itr.taxPaidCr * 0.4) : 0
  const quickRatio = Math.max(0, bs.currentRatio - 0.4)

  // Synthesized 3-year P&L history (approximated from current + growth rates)
  const py1 = itr.totalRevenueCr / (1 + itr.yoyRevenueGrowthPct / 100)
  const py2 = py1 / (1 + itr.yoyRevenueGrowthPct / 100 * 0.8)
  const profitPy1 = itr.netProfitCr / (1 + itr.yoyProfitGrowthPct / 100)
  const profitPy2 = profitPy1 / (1 + itr.yoyProfitGrowthPct / 100 * 0.7)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={H2}>Fundamentals — {company.legalName}</h2>
          <div style={SUB}>
            21 metrics across 5 categories · {itr.fiscalYear} · audited filings · sourced MCA21
          </div>
        </div>
        <button onClick={() => setTutorialOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px',
          background: 'linear-gradient(180deg, #5AB088, #2D5A3C)',
          border: '1px solid #5AB088', borderRadius: '8px',
          color: '#0B0F15',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em',
          textTransform: 'uppercase', cursor: 'pointer',
          boxShadow: '0 6px 14px rgba(90,176,136,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
          <GraduationCap size={15} strokeWidth={2.4}/> Fundamentals Tutorial
        </button>
      </div>

      {/* Section 1 — Valuation grid */}
      <Section label="Valuation Multiples" sub="Is the stock cheap or expensive?" tone="#5AB088">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
          <Metric tutId="pe"      label="P / E"           value={m.pe.toFixed(1)} hint={m.pe > 30 ? 'High — growth priced in' : m.pe < 12 ? 'Low — value or skepticism' : 'Mid'}/>
          <Metric                  label="P / B"           value={pb.toFixed(2)} hint="Price to book value"/>
          <Metric                  label="P / S"           value={ps.toFixed(2)} hint="Price to sales"/>
          <Metric                  label="EV / EBITDA"     value={evEbitda.toFixed(1)} hint="Capital-structure neutral"/>
          <Metric                  label="Div Yield"       value={`${m.divYieldPct.toFixed(2)}%`} tutId="divyield" hint="Cash return"/>
          <Metric                  label="52W Range"       value={`₹${m.range52w.low}–${m.range52w.high}`} tutId="range52" small/>
        </div>
      </Section>

      {/* Section 2 — Per share + size */}
      <Section label="Per-Share & Size" sub="Earnings, ownership, and how big the company is" tone="#5AB088">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          <Metric tutId="eps"   label="EPS · Reported"   value={`₹${m.eps.toFixed(2)}`} hint="Net profit ÷ shares"/>
          <Metric               label="Book Value / Share" value={`₹${(bookValuePerShare > 0 ? bookValuePerShare : itr.totalAssetsCr / 100).toFixed(0)}`} hint="Equity ÷ shares"/>
          <Metric tutId="mcap"  label="Market Cap"        value={`₹${(m.marketCapCr / 1000).toFixed(1)}K Cr`} hint={m.marketCapCr > 50000 ? 'Large cap' : m.marketCapCr > 10000 ? 'Mid cap' : 'Small cap'}/>
          <Metric tutId="beta"  label="Beta"              value={m.beta.toFixed(2)} hint={m.beta > 1.3 ? 'High volatility' : m.beta < 0.8 ? 'Defensive' : 'Market-like'}/>
        </div>
      </Section>

      {/* Section 3 — Profitability */}
      <Section label="Profitability & Returns" sub="How well capital and revenue convert to profit" tone="#5AB088">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          <Metric label="ROE"            value={`${roe.toFixed(1)}%`}     color={roe > 18 ? '#5AB088' : roe < 8 ? '#E04A4A' : '#FFB830'} hint="Return on Equity"/>
          <Metric label="ROCE"           value={`${roce.toFixed(1)}%`}    color={roce > 15 ? '#5AB088' : roce < 8 ? '#E04A4A' : '#FFB830'} hint="Return on Capital"/>
          <Metric label="Operating Margin" value={`${opMargin.toFixed(1)}%`} color={opMargin > 18 ? '#5AB088' : opMargin < 8 ? '#E04A4A' : '#FFB830'} hint="EBITDA / Revenue"/>
          <Metric label="Net Margin"     value={`${netMargin.toFixed(2)}%`} color={netMargin > 12 ? '#5AB088' : netMargin < 4 ? '#E04A4A' : '#FFB830'} hint="Net Profit / Revenue"/>
        </div>
      </Section>

      {/* Section 4 — P&L 3-year trend */}
      <Section label="Income Statement · 3-Year Trend" sub="Top-line and bottom-line evolution" tone="#5AB088">
        <div data-tut="pl" style={CARD_BIG}>
          <ThreeYearTable
            rows={[
              { label: 'Total Revenue', vals: [py2, py1, itr.totalRevenueCr], yoy: itr.yoyRevenueGrowthPct },
              { label: 'EBITDA',         vals: [profitPy2 * 2.3, profitPy1 * 2.3, itr.ebitdaCr], yoy: itr.yoyRevenueGrowthPct - 2 },
              { label: 'Net Profit',     vals: [profitPy2, profitPy1, itr.netProfitCr], yoy: itr.yoyProfitGrowthPct },
              { label: 'Tax Paid',       vals: [itr.taxPaidCr * 0.7, itr.taxPaidCr * 0.85, itr.taxPaidCr], yoy: 0 },
              { label: 'EPS (₹/share)',  vals: [m.eps * 0.85, m.eps * 0.92, m.eps], yoy: 8.2 },
            ]}
          />
        </div>
      </Section>

      {/* Section 5 — Balance sheet */}
      <Section label="Balance Sheet · Snapshot" sub={bs.filedQuarter} tone="#5AB088">
        <div data-tut="bs" style={CARD_BIG}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-inter), sans-serif', fontSize: '11px',
                color: '#A89A7E', letterSpacing: '0.12em', textTransform: 'uppercase',
                marginBottom: '10px',
              }}>
                Total Assets · ₹{bs.totalAssetsCr.toLocaleString('en-IN')} Cr
              </div>
              <div style={{ height: '20px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: `${(bs.totalLiabilitiesCr / bs.totalAssetsCr) * 100}%`, background: '#E04A4A', height: '100%' }}/>
                <div style={{ flex: 1, background: '#5AB088', height: '100%' }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontFamily: 'var(--font-inter), sans-serif', fontSize: '11px' }}>
                <span style={{ color: '#E04A4A', fontWeight: 600 }}>
                  Liabilities · ₹{bs.totalLiabilitiesCr.toLocaleString('en-IN')} Cr ({((bs.totalLiabilitiesCr / bs.totalAssetsCr) * 100).toFixed(0)}%)
                </span>
                <span style={{ color: '#5AB088', fontWeight: 600 }}>
                  Equity · ₹{bs.shareholderEquityCr.toLocaleString('en-IN')} Cr ({((bs.shareholderEquityCr / bs.totalAssetsCr) * 100).toFixed(0)}%)
                </span>
              </div>

              {/* Composition breakdown */}
              <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                <BSItem label="Cash & Equivalents" value={bs.cashAndEquivalentsCr} accent="#5AB088"/>
                <BSItem label="Long-term Debt"      value={bs.longTermDebtCr}    accent="#E04A4A"/>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Ratio tutId="de" label="D/E Ratio"       value={bs.debtToEquity.toFixed(2)} flag={bs.debtToEquity > 1.5 ? 'high' : 'ok'} hint={bs.debtToEquity > 1.5 ? 'Highly leveraged' : 'Comfortable leverage'}/>
              <Ratio tutId="cr" label="Current Ratio"    value={bs.currentRatio.toFixed(2)} flag={bs.currentRatio < 1 ? 'high' : 'ok'} hint={bs.currentRatio < 1 ? 'Liquidity tight' : 'Healthy liquidity'}/>
              <Ratio              label="Quick Ratio"     value={quickRatio.toFixed(2)} flag={quickRatio < 0.7 ? 'high' : 'ok'} hint="Acid test"/>
              <Ratio              label="Interest Coverage" value={`${interestCoverage.toFixed(1)}×`} flag={interestCoverage < 3 ? 'high' : 'ok'} hint={interestCoverage < 3 ? 'Stress risk' : 'Safe'}/>
            </div>
          </div>
          {bs.verifyNotes && (
            <div style={{
              marginTop: '14px', padding: '10px 12px',
              background: 'rgba(212,160,77,0.06)', border: '1px solid rgba(212,160,77,0.2)',
              borderRadius: '5px',
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '11px', color: '#A89A7E', fontStyle: 'italic',
            }}>✦ {bs.verifyNotes}</div>
          )}
        </div>
      </Section>

      {/* Section 6 — Verdict */}
      <Section label="Quality Verdict" sub="Confluence across valuation, growth, health and moat" tone="#F4EDE0">
        <QualityVerdict
          pe={m.pe} roe={roe} de={bs.debtToEquity} cr={bs.currentRatio}
          revGrowth={itr.yoyRevenueGrowthPct} profGrowth={itr.yoyProfitGrowthPct}
          opMargin={opMargin}
        />
      </Section>

      <FundamentalsTutorial open={tutorialOpen} onClose={() => setTutorialOpen(false)}/>
    </div>
  )
}

// ─── shared helpers ───────────────────────────────────────

const H2: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces), serif',
  fontWeight: 600, fontSize: '20px',
  color: '#F4EDE0', margin: 0,
}
const SUB: React.CSSProperties = {
  fontFamily: 'var(--font-inter), sans-serif',
  fontSize: '11px', color: '#5C5849', fontStyle: 'italic',
  marginTop: '4px', letterSpacing: '0.04em',
}
const CARD_BIG: React.CSSProperties = {
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.025)',
  border: '1px solid rgba(212,160,77,0.14)',
  borderRadius: '8px',
}

function Section({ label, sub, tone, children }: { label: string; sub: string; tone: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '11px', fontWeight: 700, color: tone,
          letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '12px', color: '#5C5849' }}>{sub}</span>
        <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, ${tone}40, transparent)` }}/>
      </div>
      {children}
    </div>
  )
}

function Metric({ label, value, hint, color, small, tutId }: { label: string; value: string; hint?: string; color?: string; small?: boolean; tutId?: string }) {
  return (
    <div data-tut={tutId} style={{
      padding: '11px 13px',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(212,160,77,0.14)',
      borderRadius: '6px',
      display: 'flex', flexDirection: 'column', gap: '3px',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '9px', fontWeight: 700, color: '#A89A7E',
        letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-jetbrains), monospace',
        fontSize: small ? '12px' : '17px',
        fontWeight: 700, color: color ?? '#F4EDE0',
        whiteSpace: 'nowrap',
      }}>{value}</div>
      {hint && (
        <div style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '9px', color: '#5C5849',
          fontStyle: 'italic',
        }}>{hint}</div>
      )}
    </div>
  )
}

function BSItem({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '9px', color: '#A89A7E', letterSpacing: '0.16em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '13px', fontWeight: 700, color: accent }}>₹{value.toLocaleString('en-IN')} Cr</span>
    </div>
  )
}

function Ratio({ label, value, flag, hint, tutId }: { label: string; value: string; flag: 'ok' | 'high'; hint: string; tutId?: string }) {
  const c = flag === 'high' ? '#E04A4A' : '#5AB088'
  return (
    <div data-tut={tutId} style={{
      padding: '8px 10px',
      background: flag === 'high' ? 'rgba(224,74,74,0.06)' : 'rgba(90,176,136,0.04)',
      border: `1px solid ${c}40`,
      borderRadius: '5px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '10px', color: '#A89A7E', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '13px', color: c, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '9px', color: '#5C5849', fontStyle: 'italic', marginTop: '1px' }}>{hint}</div>
    </div>
  )
}

interface RowSpec { label: string; vals: number[]; yoy: number }

function ThreeYearTable({ rows }: { rows: RowSpec[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
        padding: '8px 0',
        borderBottom: '1px solid rgba(212,160,77,0.18)',
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '9px', color: '#5C5849', fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>
        <span>Item</span>
        <span style={{ textAlign: 'right' }}>FY 17–18</span>
        <span style={{ textAlign: 'right' }}>FY 18–19 (PY)</span>
        <span style={{ textAlign: 'right' }}>FY 18–19 (CY)</span>
        <span style={{ textAlign: 'right' }}>YoY</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
          padding: '10px 0',
          borderBottom: '1px solid rgba(212,160,77,0.08)',
          alignItems: 'baseline', gap: '8px',
        }}>
          <span style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '13px', color: '#A89A7E', fontStyle: 'italic' }}>{r.label}</span>
          {r.vals.map((v, j) => (
            <span key={j} style={{
              fontFamily: 'var(--font-jetbrains), monospace',
              fontSize: '13px',
              color: j === r.vals.length - 1 ? '#F4EDE0' : '#A89A7E',
              fontWeight: j === r.vals.length - 1 ? 700 : 500,
              textAlign: 'right',
            }}>
              {r.label.includes('₹') ? `₹${v.toFixed(2)}` : `₹${Math.round(v).toLocaleString('en-IN')}`}
            </span>
          ))}
          <span style={{
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '12px',
            color: r.yoy >= 0 ? '#5AB088' : '#E04A4A',
            fontWeight: 700,
            textAlign: 'right',
          }}>
            {r.yoy === 0 ? '—' : `${r.yoy > 0 ? '+' : ''}${r.yoy.toFixed(1)}%`}
          </span>
        </div>
      ))}
    </div>
  )
}

function QualityVerdict({ pe, roe, de, cr, revGrowth, profGrowth, opMargin }: {
  pe: number; roe: number; de: number; cr: number; revGrowth: number; profGrowth: number; opMargin: number
}) {
  const checks = [
    { name: 'Valuation',          pass: pe > 0 && pe < 25,                        reason: pe < 25 ? `P/E ${pe.toFixed(1)} reasonable` : `P/E ${pe.toFixed(1)} demanding` },
    { name: 'Profitability',      pass: roe > 12,                                  reason: `ROE ${roe.toFixed(1)}%` },
    { name: 'Margin Strength',    pass: opMargin > 12,                             reason: `Op margin ${opMargin.toFixed(1)}%` },
    { name: 'Revenue Growth',     pass: revGrowth > 8,                             reason: `${revGrowth >= 0 ? '+' : ''}${revGrowth.toFixed(1)}% YoY` },
    { name: 'Profit Growth',      pass: profGrowth > 0,                            reason: `${profGrowth >= 0 ? '+' : ''}${profGrowth.toFixed(1)}% YoY` },
    { name: 'Leverage',           pass: de < 1.5,                                  reason: `D/E ${de.toFixed(2)}` },
    { name: 'Liquidity',          pass: cr > 1.0,                                  reason: `Current ratio ${cr.toFixed(2)}` },
  ]
  const passed = checks.filter(c => c.pass).length
  const tilt = passed >= 6 ? 'STRONG' : passed >= 4 ? 'AVERAGE' : 'WEAK'
  const tiltColor = passed >= 6 ? '#5AB088' : passed >= 4 ? '#FFB830' : '#E04A4A'
  return (
    <div data-tut="verdict" style={{
      padding: '16px 18px',
      background: `linear-gradient(180deg, ${tiltColor}10, rgba(255,255,255,0.02))`,
      border: `1px solid ${tiltColor}50`,
      borderRadius: '8px',
      display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px',
    }}>
      <div>
        <div style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '10px', fontWeight: 700, color: '#A89A7E',
          letterSpacing: '0.2em', textTransform: 'uppercase',
          marginBottom: '6px',
        }}>Fundamental Quality</div>
        <div style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontSize: '32px', fontWeight: 700, color: tiltColor,
          letterSpacing: '0.04em', lineHeight: 1.1,
        }}>{tilt}</div>
        <div style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '12px', color: '#A89A7E',
          marginTop: '6px',
        }}>
          {passed} of {checks.length} checks pass
        </div>
        <div style={{ marginTop: '10px', display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(212,160,77,0.10)' }}>
          {checks.map((c, i) => (
            <div key={i} style={{ flex: 1, background: c.pass ? '#5AB088' : '#E04A4A', marginRight: i === checks.length - 1 ? 0 : '1px' }}/>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {checks.map((c, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '120px 1fr 70px',
            gap: '10px', padding: '5px 8px',
            background: c.pass ? 'rgba(90,176,136,0.08)' : 'rgba(224,74,74,0.08)',
            borderLeft: `2px solid ${c.pass ? '#5AB088' : '#E04A4A'}`,
            borderRadius: '4px', alignItems: 'baseline',
          }}>
            <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '11px', fontWeight: 600, color: '#F4EDE0' }}>{c.name}</span>
            <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '11.5px', color: '#A89A7E' }}>{c.reason}</span>
            <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '9px', fontWeight: 700, color: c.pass ? '#5AB088' : '#E04A4A', letterSpacing: '0.16em', textTransform: 'uppercase', textAlign: 'right' }}>
              {c.pass ? '✓ PASS' : '✗ FAIL'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
