'use client'

import { useState, useMemo } from 'react'
import { GraduationCap } from 'lucide-react'
import type { ScenarioStock, NewsHeadline } from '@/types/scenario'
import { NewsTutorial } from './news-tutorial'

interface Props { stock: ScenarioStock; accent: string }

export function TabNews({ stock, accent }: Props) {
  const [tutorialOpen, setTutorialOpen] = useState(false)
  const news = stock.news

  // Synthesized data for new sections
  const analysts = useMemo(() => generateAnalysts(stock), [stock])
  const insiders = useMemo(() => generateInsiders(stock), [stock])
  const bulkDeals = useMemo(() => generateBulkDeals(stock), [stock])
  const sectorNews = useMemo(() => generateSectorNews(stock), [stock])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={H2}>News & Information Flow — {stock.symbol}</h2>
          <div style={SUB}>
            7 categories · last 24h headlines · analyst consensus · insider activity · sector context
          </div>
        </div>
        <button onClick={() => setTutorialOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 16px',
          background: 'linear-gradient(180deg, #A855F7, #6B21A8)',
          border: '1px solid #A855F7', borderRadius: '8px',
          color: '#FFFFFF',
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '12px', fontWeight: 700, letterSpacing: '0.16em',
          textTransform: 'uppercase', cursor: 'pointer',
          boxShadow: '0 6px 14px rgba(168,85,247,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}><GraduationCap size={15} strokeWidth={2.4}/> News Tutorial</button>
      </div>

      {/* Section 1 — Sentiment summary */}
      <Section label="Sentiment & Coverage Volume" sub="The prevailing tone over the last 24 hours" tone="#A855F7">
        <div data-tut="sentiment" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px' }}>
          <SentimentCard items={news} accent={accent}/>
          <CoverageVolumeCard items={news}/>
          <SourceDiversityCard items={news}/>
        </div>
      </Section>

      {/* Section 2 — Headlines list */}
      <Section label="24-Hour Headlines" sub="Real wire-service reports, sentiment-tagged" tone="#A855F7">
        <div data-tut="headlines" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {news.map((n, i) => <NewsCard key={i} item={n} />)}
        </div>
      </Section>

      {/* Section 3 — Coverage timeline */}
      <Section label="Coverage Timeline · 7 Days" sub="When the story broke and how it evolved" tone="#A855F7">
        <div data-tut="volume" style={CARD_BIG}>
          <CoverageTimeline items={news} accent={accent}/>
        </div>
      </Section>

      {/* Section 4 — Analyst consensus */}
      <Section label="Analyst Consensus" sub="Sell-side ratings and 12-month price targets" tone="#A855F7">
        <div data-tut="analysts" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
          <AnalystRatingsCard analysts={analysts}/>
          <AnalystTargetCard analysts={analysts} currentPrice={stock.closePrice}/>
        </div>
      </Section>

      {/* Section 5 — Insider activity */}
      <Section label="Insider & Promoter Activity" sub="Last 30 days — buys / sells from people who know the business" tone="#A855F7">
        <div data-tut="insider" style={CARD_BIG}>
          <InsiderTable items={insiders}/>
        </div>
      </Section>

      {/* Section 6 — Bulk deals */}
      <Section label="Bulk & Block Deals" sub="Institutional positioning visible from disclosure rules" tone="#A855F7">
        <div data-tut="bulk" style={CARD_BIG}>
          <BulkDealsTable items={bulkDeals}/>
        </div>
      </Section>

      {/* Section 7 — Sector contagion */}
      <Section label="Sector Cross-Currents" sub="What\'s happening to peers — contagion effect on this stock" tone="#A855F7">
        <div data-tut="sector" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sectorNews.map((n, i) => <SectorNewsCard key={i} item={n}/>)}
        </div>
      </Section>

      {/* Section 8 — ORUS verdict */}
      <Section label="ORUS News Verdict" sub="Synthesis of all the above" tone="#F4EDE0">
        <NewsVerdict items={news} insiderTilt={insiders.filter(i => i.action === 'BUY').length - insiders.filter(i => i.action === 'SELL').length} analystAvg={analysts.consensusBuyPct}/>
      </Section>

      <NewsTutorial open={tutorialOpen} onClose={() => setTutorialOpen(false)}/>
    </div>
  )
}

// ─── shared helpers ───────────────────────────────────────

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

// ─── Sentiment ─────────────────────────────────────────────

function SentimentCard({ items, accent }: { items: NewsHeadline[]; accent: string }) {
  const counts = items.reduce((acc, n) => { acc[n.sentiment] = (acc[n.sentiment] ?? 0) + 1; return acc }, {} as Record<string, number>)
  const total = items.length || 1
  const bullPct = ((counts.bullish ?? 0) / total) * 100
  const bearPct = ((counts.bearish ?? 0) / total) * 100
  const neutPct = ((counts.neutral ?? 0) / total) * 100
  const dominant = bearPct >= bullPct && bearPct >= neutPct ? 'BEARISH' : bullPct >= neutPct ? 'BULLISH' : 'NEUTRAL'
  const c = dominant === 'BEARISH' ? '#E04A4A' : dominant === 'BULLISH' ? '#5AB088' : accent
  return (
    <div style={CARD_BIG}>
      <Label>Sentiment Tilt</Label>
      <div style={{ ...BIGNUM, color: c, marginTop: '6px' }}>{dominant}</div>
      <div style={{ marginTop: '12px', height: '8px', borderRadius: '4px', overflow: 'hidden', display: 'flex', background: 'rgba(212,160,77,0.10)' }}>
        <div style={{ width: `${bullPct}%`, background: '#5AB088' }}/>
        <div style={{ width: `${neutPct}%`, background: '#A89A7E' }}/>
        <div style={{ width: `${bearPct}%`, background: '#E04A4A' }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px' }}>
        <span style={{ color: '#5AB088', fontWeight: 700 }}>{counts.bullish ?? 0} ↑</span>
        <span style={{ color: '#A89A7E', fontWeight: 700 }}>{counts.neutral ?? 0} ◇</span>
        <span style={{ color: '#E04A4A', fontWeight: 700 }}>{counts.bearish ?? 0} ↓</span>
      </div>
    </div>
  )
}

function CoverageVolumeCard({ items }: { items: NewsHeadline[] }) {
  const score = items.length >= 3 ? 'HIGH' : items.length >= 2 ? 'NORMAL' : 'LOW'
  const c = items.length >= 3 ? '#FFB830' : '#A89A7E'
  return (
    <div style={CARD_BIG}>
      <Label>Coverage · 24h</Label>
      <div style={{ ...BIGNUM, color: c, marginTop: '6px' }}>{items.length}</div>
      <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '10px', color: c, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '4px' }}>{score} VOLUME</div>
      <div style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '11px', color: '#A89A7E', marginTop: '8px', lineHeight: 1.45 }}>
        {items.length >= 3 ? 'Multiple outlets converging — institutional desks usually already moving.' : 'Quiet wire flow.'}
      </div>
    </div>
  )
}

function SourceDiversityCard({ items }: { items: NewsHeadline[] }) {
  const sources = new Set(items.map(i => i.source.split('·')[0].trim())).size
  return (
    <div style={CARD_BIG}>
      <Label>Source Diversity</Label>
      <div style={{ ...BIGNUM, marginTop: '6px' }}>{sources}</div>
      <div style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '10px', color: '#A89A7E', letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: '4px' }}>OUTLETS COVERING</div>
      <div style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '11px', color: '#A89A7E', marginTop: '8px', lineHeight: 1.45 }}>
        {sources >= 3 ? 'Story is real — not a single outlet\'s opinion.' : 'Limited corroboration — wait for confirmation.'}
      </div>
    </div>
  )
}

function NewsCard({ item }: { item: NewsHeadline }) {
  const c = item.sentiment === 'bullish' ? '#5AB088' : item.sentiment === 'bearish' ? '#E04A4A' : '#FFB830'
  return (
    <div style={{
      display: 'flex', gap: '14px',
      padding: '14px 16px',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(212,160,77,0.14)',
      borderLeft: `3px solid ${c}`,
      borderRadius: '6px',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            padding: '2px 8px', background: `${c}1A`, border: `1px solid ${c}80`,
            borderRadius: '4px',
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '9px', fontWeight: 700, color: c,
            letterSpacing: '0.18em', textTransform: 'uppercase',
          }}>{item.sentiment}</span>
          <span style={{
            fontFamily: 'var(--font-jetbrains), monospace',
            fontSize: '10px', color: '#5C5849',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>{item.source}</span>
        </div>
        <div style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontSize: '15px', color: '#F4EDE0',
          lineHeight: 1.4, fontWeight: 500,
        }}>{item.headline}</div>
      </div>
    </div>
  )
}

function CoverageTimeline({ items, accent }: { items: NewsHeadline[]; accent: string }) {
  const days = ['Mar 3', 'Mar 4', 'Mar 5', 'Mar 6', 'Mar 7', 'Mar 8', 'Mar 9']
  return (
    <div>
      <div style={{ position: 'relative', height: '64px', marginBottom: '8px' }}>
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '32px', height: '2px',
          background: 'rgba(212,160,77,0.18)',
        }}/>
        {items.map((it, i) => {
          const x = ((items.length - 1 - i) * (1 / Math.max(1, items.length))) * 70 + 25
          const c = it.sentiment === 'bullish' ? '#5AB088' : it.sentiment === 'bearish' ? '#E04A4A' : accent
          return (
            <div key={i} style={{ position: 'absolute', left: `${x}%`, top: '20px', transform: 'translateX(-50%)' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: c, border: '2px solid #11161D', boxShadow: `0 0 10px ${c}80` }}/>
              <div style={{
                position: 'absolute', top: '22px', left: '50%', transform: 'translateX(-50%)',
                fontFamily: 'var(--font-jetbrains), monospace', fontSize: '8px',
                color: c, whiteSpace: 'nowrap', fontWeight: 700, letterSpacing: '0.06em',
              }}>{-i}D</div>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-jetbrains), monospace', fontSize: '9px', color: '#5C5849', letterSpacing: '0.08em' }}>
        {days.map(d => <span key={d}>{d}</span>)}
      </div>
    </div>
  )
}

// ─── Analyst data ─────────────────────────────────────────

interface AnalystData { buys: number; holds: number; sells: number; consensusBuyPct: number; targetLow: number; targetMedian: number; targetHigh: number; recentRevisions: { firm: string; from: string; to: string; date: string }[] }
function generateAnalysts(stock: ScenarioStock): AnalystData {
  const total = 18 + (stock.symbol.charCodeAt(0) % 8)
  const isBearish = stock.pctChange30d < -0.05
  const buys = isBearish ? Math.floor(total * 0.42) : Math.floor(total * 0.61)
  const sells = isBearish ? Math.floor(total * 0.22) : Math.floor(total * 0.06)
  const holds = total - buys - sells
  const targetMedian = stock.closePrice * (isBearish ? 1.18 : 1.12)
  return {
    buys, holds, sells,
    consensusBuyPct: (buys / total) * 100,
    targetLow: stock.closePrice * 0.90,
    targetMedian,
    targetHigh: stock.closePrice * (isBearish ? 1.45 : 1.32),
    recentRevisions: isBearish ? [
      { firm: 'Morgan Stanley', from: 'Overweight',     to: 'Equal-weight', date: 'Mar 8, 2020' },
      { firm: 'CLSA',           from: '₹1,650 target', to: '₹1,420 target', date: 'Mar 7, 2020' },
      { firm: 'Macquarie',      from: 'Outperform',     to: 'Neutral',      date: 'Mar 6, 2020' },
    ] : [
      { firm: 'Goldman Sachs',  from: 'Neutral',  to: 'Buy',         date: 'Mar 5, 2020' },
      { firm: 'JP Morgan',      from: '₹2,100 target', to: '₹2,300 target', date: 'Mar 3, 2020' },
    ],
  }
}

function AnalystRatingsCard({ analysts }: { analysts: AnalystData }) {
  const total = analysts.buys + analysts.holds + analysts.sells
  return (
    <div style={CARD_BIG}>
      <Label>Consensus · {total} analysts</Label>
      <div style={{ ...BIGNUM, color: analysts.consensusBuyPct > 60 ? '#5AB088' : analysts.consensusBuyPct < 40 ? '#E04A4A' : '#FFB830', marginTop: '6px' }}>
        {analysts.consensusBuyPct > 60 ? 'BUY' : analysts.consensusBuyPct < 40 ? 'SELL' : 'HOLD'}
      </div>
      <div style={{ display: 'flex', height: '10px', borderRadius: '4px', overflow: 'hidden', marginTop: '12px', background: 'rgba(212,160,77,0.10)' }}>
        <div style={{ width: `${(analysts.buys / total) * 100}%`,  background: '#5AB088' }}/>
        <div style={{ width: `${(analysts.holds / total) * 100}%`, background: '#A89A7E' }}/>
        <div style={{ width: `${(analysts.sells / total) * 100}%`, background: '#E04A4A' }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px' }}>
        <span style={{ color: '#5AB088', fontWeight: 700 }}>{analysts.buys} BUY</span>
        <span style={{ color: '#A89A7E', fontWeight: 700 }}>{analysts.holds} HOLD</span>
        <span style={{ color: '#E04A4A', fontWeight: 700 }}>{analysts.sells} SELL</span>
      </div>
    </div>
  )
}

function AnalystTargetCard({ analysts, currentPrice }: { analysts: AnalystData; currentPrice: number }) {
  const upside = ((analysts.targetMedian - currentPrice) / currentPrice) * 100
  const pos = (currentPrice - analysts.targetLow) / (analysts.targetHigh - analysts.targetLow)
  return (
    <div style={CARD_BIG}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Label>12-Month Target Price Range</Label>
        <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '13px', fontWeight: 700, color: upside > 0 ? '#5AB088' : '#E04A4A' }}>
          {upside > 0 ? '+' : ''}{upside.toFixed(1)}% upside (median)
        </span>
      </div>
      <div style={{ position: 'relative', height: '10px', borderRadius: '5px', background: 'linear-gradient(90deg, #E04A4A, #FFB830 50%, #5AB088)', overflow: 'visible', marginTop: '20px' }}>
        <span style={{ position: 'absolute', left: `${pos * 100}%`, top: '-4px', width: '3px', height: '18px', background: '#F4EDE0', boxShadow: '0 0 6px rgba(244,237,224,0.8)', transform: 'translateX(-50%)' }}/>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px' }}>
        <span style={{ color: '#E04A4A', fontWeight: 600 }}>L · ₹{analysts.targetLow.toFixed(0)}</span>
        <span style={{ color: '#FFB830', fontWeight: 700 }}>MED · ₹{analysts.targetMedian.toFixed(0)}</span>
        <span style={{ color: '#5AB088', fontWeight: 600 }}>H · ₹{analysts.targetHigh.toFixed(0)}</span>
      </div>

      {analysts.recentRevisions.length > 0 && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(212,160,77,0.18)' }}>
          <Label>Recent Revisions</Label>
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {analysts.recentRevisions.map((r, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 2fr 1fr', gap: '8px', alignItems: 'baseline' }}>
                <span style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '12px', color: '#F4EDE0', fontWeight: 600 }}>{r.firm}</span>
                <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '11px', color: '#A89A7E' }}>
                  {r.from} → <span style={{ color: '#F4EDE0', fontWeight: 600, fontStyle: 'normal' }}>{r.to}</span>
                </span>
                <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', color: '#5C5849', textAlign: 'right' }}>{r.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Insiders ─────────────────────────────────────────────

interface Insider { person: string; role: string; action: 'BUY' | 'SELL'; shares: number; valueCr: number; date: string }
function generateInsiders(stock: ScenarioStock): Insider[] {
  // Synthesized — bearish stocks tilt sells, bullish bias buys
  const isBear = stock.pctChange30d < -0.05
  return isBear ? [
    { person: 'Co-promoter (Family)',   role: 'Director',    action: 'SELL', shares: 240000,  valueCr: 30.2, date: 'Mar 4, 2020' },
    { person: 'Independent Director',     role: 'Director',    action: 'SELL', shares: 14000,   valueCr: 1.8,  date: 'Mar 2, 2020' },
    { person: 'CFO',                       role: 'Whole-time',  action: 'BUY',  shares: 5000,    valueCr: 0.6,  date: 'Feb 28, 2020' },
    { person: 'Senior VP – Operations',   role: 'KMP',         action: 'SELL', shares: 8500,    valueCr: 1.1,  date: 'Feb 25, 2020' },
  ] : [
    { person: 'Promoter Group',           role: 'Promoter',     action: 'BUY',  shares: 180000,  valueCr: 22.8, date: 'Mar 5, 2020' },
    { person: 'CEO',                       role: 'MD',           action: 'BUY',  shares: 25000,   valueCr: 3.2,  date: 'Mar 1, 2020' },
    { person: 'Sr. VP',                    role: 'KMP',          action: 'BUY',  shares: 12000,   valueCr: 1.5,  date: 'Feb 24, 2020' },
  ]
}

function InsiderTable({ items }: { items: Insider[] }) {
  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 100px 100px 110px',
        padding: '8px 0',
        borderBottom: '1px solid rgba(212,160,77,0.18)',
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '9px', color: '#5C5849', fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>
        <span>Person</span><span>Role</span><span>Action</span><span style={{ textAlign: 'right' }}>Shares</span><span style={{ textAlign: 'right' }}>Value</span><span style={{ textAlign: 'right' }}>Date</span>
      </div>
      {items.map((r, i) => {
        const c = r.action === 'BUY' ? '#5AB088' : '#E04A4A'
        return (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '2fr 1.5fr 80px 100px 100px 110px',
            padding: '10px 0', borderBottom: '1px solid rgba(212,160,77,0.08)',
            alignItems: 'baseline', gap: '8px',
          }}>
            <span style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '13px', color: '#F4EDE0', fontWeight: 500 }}>{r.person}</span>
            <span style={{ fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic', fontSize: '12px', color: '#A89A7E' }}>{r.role}</span>
            <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '10px', fontWeight: 700, color: c, letterSpacing: '0.16em' }}>{r.action === 'BUY' ? '↑ BUY' : '↓ SELL'}</span>
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px', color: '#F4EDE0', textAlign: 'right' }}>{r.shares.toLocaleString('en-IN')}</span>
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px', color: c, fontWeight: 700, textAlign: 'right' }}>₹{r.valueCr.toFixed(1)} Cr</span>
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', color: '#5C5849', textAlign: 'right' }}>{r.date}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Bulk deals ───────────────────────────────────────────

interface BulkDeal { date: string; counterparty: string; type: 'BULK' | 'BLOCK'; side: 'BUY' | 'SELL'; shares: number; pricePerShare: number }
function generateBulkDeals(stock: ScenarioStock): BulkDeal[] {
  const isBear = stock.pctChange30d < -0.05
  return isBear ? [
    { date: 'Mar 6, 2020', counterparty: 'Vanguard Group',          type: 'BULK',  side: 'SELL', shares: 320000,  pricePerShare: stock.closePrice * 1.04 },
    { date: 'Mar 5, 2020', counterparty: 'BlackRock Inc.',           type: 'BULK',  side: 'SELL', shares: 540000,  pricePerShare: stock.closePrice * 1.06 },
    { date: 'Mar 4, 2020', counterparty: 'LIC of India',             type: 'BLOCK', side: 'BUY',  shares: 1200000, pricePerShare: stock.closePrice * 1.03 },
    { date: 'Mar 3, 2020', counterparty: 'Government of Singapore',  type: 'BULK',  side: 'SELL', shares: 180000,  pricePerShare: stock.closePrice * 1.08 },
  ] : [
    { date: 'Mar 6, 2020', counterparty: 'BlackRock Inc.',           type: 'BULK',  side: 'BUY',  shares: 280000,  pricePerShare: stock.closePrice * 0.96 },
    { date: 'Mar 4, 2020', counterparty: 'Vanguard Group',           type: 'BULK',  side: 'BUY',  shares: 410000,  pricePerShare: stock.closePrice * 0.97 },
    { date: 'Mar 2, 2020', counterparty: 'HDFC Mutual Fund',          type: 'BLOCK', side: 'BUY',  shares: 850000,  pricePerShare: stock.closePrice * 0.99 },
  ]
}

function BulkDealsTable({ items }: { items: BulkDeal[] }) {
  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: '110px 2fr 70px 80px 110px 110px',
        padding: '8px 0', borderBottom: '1px solid rgba(212,160,77,0.18)',
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '9px', color: '#5C5849', fontWeight: 700,
        letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>
        <span>Date</span><span>Counterparty</span><span>Type</span><span>Side</span><span style={{ textAlign: 'right' }}>Shares</span><span style={{ textAlign: 'right' }}>Avg Price</span>
      </div>
      {items.map((r, i) => {
        const c = r.side === 'BUY' ? '#5AB088' : '#E04A4A'
        return (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '110px 2fr 70px 80px 110px 110px',
            padding: '10px 0', borderBottom: '1px solid rgba(212,160,77,0.08)',
            alignItems: 'baseline', gap: '8px',
          }}>
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '11px', color: '#A89A7E' }}>{r.date}</span>
            <span style={{ fontFamily: 'var(--font-fraunces), serif', fontSize: '13px', color: '#F4EDE0' }}>{r.counterparty}</span>
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px', color: '#A855F7', fontWeight: 700, letterSpacing: '0.06em' }}>{r.type}</span>
            <span style={{ fontFamily: 'var(--font-inter), sans-serif', fontSize: '10px', fontWeight: 700, color: c, letterSpacing: '0.16em' }}>{r.side === 'BUY' ? '↑ BUY' : '↓ SELL'}</span>
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px', color: '#F4EDE0', textAlign: 'right' }}>{r.shares.toLocaleString('en-IN')}</span>
            <span style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px', color: '#F4EDE0', textAlign: 'right' }}>₹{r.pricePerShare.toFixed(2)}</span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Sector news ──────────────────────────────────────────

interface SectorItem { peerSymbol: string; headline: string; impact: 'positive' | 'negative' | 'neutral' }
function generateSectorNews(stock: ScenarioStock): SectorItem[] {
  const map: Record<string, SectorItem[]> = {
    airlines: [
      { peerSymbol: 'SPICEJET',  headline: 'Capacity cuts: SpiceJet trims 30% of international routes through April',  impact: 'negative' },
      { peerSymbol: 'JETAIR',    headline: 'Jet Airways revival bid suspended again — fleet to be auctioned',           impact: 'negative' },
      { peerSymbol: 'IATA',      headline: 'Industry body forecasts global passenger demand to fall by up to 30% in Q1', impact: 'negative' },
    ],
    pharma: [
      { peerSymbol: 'CIPLA',     headline: 'Cipla wins emergency-use authorisation for HCQ formulation in Brazil',       impact: 'positive' },
      { peerSymbol: 'DRREDDY',   headline: 'Dr Reddy\'s announces expanded API capacity to backstop China supply gap',  impact: 'positive' },
      { peerSymbol: 'LUPIN',     headline: 'Lupin: Goa plant import alert lifted by US FDA after 18 months',              impact: 'positive' },
    ],
    energy: [
      { peerSymbol: 'BPCL',      headline: 'BPCL Q4 refinery throughput cut to 78% on demand collapse',                  impact: 'negative' },
      { peerSymbol: 'ONGC',      headline: 'ONGC quarterly losses widen as Brent breaks below $35',                       impact: 'negative' },
      { peerSymbol: 'IOC',       headline: 'IOC: Refinery utilisation falls to 79%, lowest since 2009',                   impact: 'negative' },
    ],
    banking: [
      { peerSymbol: 'KOTAKBANK', headline: 'Kotak Bank: RBI flagging concentration in commercial real estate book',       impact: 'negative' },
      { peerSymbol: 'ICICIBANK', headline: 'ICICI Bank guides for higher credit costs in Q4 due to travel-linked exposures', impact: 'negative' },
      { peerSymbol: 'AXISBANK',  headline: 'Axis Bank: ₹4,800 Cr Q3 provisions on AT-1 bond review and stressed asset bucket', impact: 'negative' },
    ],
    luxury: [
      { peerSymbol: 'TRENT',     headline: 'Trent: Westside footfalls down 18% YoY in February — pre-lockdown weakness', impact: 'negative' },
      { peerSymbol: 'PCJEWELLER', headline: 'PC Jeweller defaults on bond payment, faces NCLT proceedings',               impact: 'negative' },
      { peerSymbol: 'TBZ',        headline: 'Tribhovandas Zaveri: store traffic forecast cut by 25% for FY21 H1',          impact: 'negative' },
    ],
    it: [
      { peerSymbol: 'INFY',      headline: 'Infosys raises FY20 guidance — digital revenue growth strong',                impact: 'positive' },
      { peerSymbol: 'WIPRO',     headline: 'Wipro lays out Covid business-continuity plan, reassures Fortune 500 clients', impact: 'neutral' },
      { peerSymbol: 'HCLTECH',   headline: 'HCL Tech: USD/INR tailwind expected to add 110bps to operating margin Q4',     impact: 'positive' },
    ],
  }
  return map[stock.sector] ?? []
}

function SectorNewsCard({ item }: { item: SectorItem }) {
  const c = item.impact === 'positive' ? '#5AB088' : item.impact === 'negative' ? '#E04A4A' : '#A89A7E'
  return (
    <div style={{
      display: 'flex', gap: '12px', alignItems: 'center',
      padding: '10px 14px',
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(212,160,77,0.12)',
      borderLeft: `3px solid ${c}`,
      borderRadius: '5px',
    }}>
      <span style={{
        padding: '2px 8px', background: `${c}1A`,
        border: `1px solid ${c}80`, borderRadius: '3px',
        fontFamily: 'var(--font-jetbrains), monospace', fontSize: '10px',
        color: c, fontWeight: 700, letterSpacing: '0.08em',
        flexShrink: 0,
      }}>{item.peerSymbol}</span>
      <span style={{
        flex: 1,
        fontFamily: 'var(--font-fraunces), serif', fontSize: '13px',
        color: '#D9CFB8', lineHeight: 1.4,
      }}>{item.headline}</span>
      <span style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '9px', color: c,
        fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        {item.impact === 'positive' ? '↑ TAILWIND' : item.impact === 'negative' ? '↓ HEADWIND' : '◇ MIXED'}
      </span>
    </div>
  )
}

// ─── ORUS verdict ─────────────────────────────────────────

function NewsVerdict({ items, insiderTilt, analystAvg }: { items: NewsHeadline[]; insiderTilt: number; analystAvg: number }) {
  const counts = items.reduce((acc, n) => { acc[n.sentiment] = (acc[n.sentiment] ?? 0) + 1; return acc }, {} as Record<string, number>)
  const newsTilt = (counts.bullish ?? 0) - (counts.bearish ?? 0)
  const score = newsTilt + insiderTilt + (analystAvg > 60 ? 1 : analystAvg < 40 ? -1 : 0)
  const verdict = score >= 2 ? 'BULLISH' : score <= -2 ? 'BEARISH' : 'MIXED'
  const c = verdict === 'BULLISH' ? '#5AB088' : verdict === 'BEARISH' ? '#E04A4A' : '#FFB830'

  return (
    <div data-tut="verdict" style={{
      padding: '16px 18px',
      background: `linear-gradient(180deg, ${c}10, rgba(255,255,255,0.02))`,
      border: `1px solid ${c}50`,
      borderRadius: '8px',
      display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px',
    }}>
      <div>
        <Label>Information-Flow Verdict</Label>
        <div style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontSize: '32px', fontWeight: 700, color: c,
          letterSpacing: '0.04em', lineHeight: 1.1,
        }}>{verdict}</div>
        <div style={{ fontFamily: 'var(--font-jetbrains), monospace', fontSize: '12px', color: '#A89A7E', marginTop: '6px' }}>
          Headlines + insiders + analyst consensus
        </div>
      </div>
      <p style={{
        fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic',
        fontSize: '14px', color: '#D9CFB8', lineHeight: 1.5, margin: 0,
      }}>
        {verdict === 'BEARISH' && 'Multiple negative headlines, dominant bearish sentiment, insider net selling, analyst downgrades stacking. Information flow is unanimously against the stock — wait for capitulation before contrarian buys.'}
        {verdict === 'BULLISH' && 'Coverage tone is constructive, insiders are buying, analysts upgrading. The narrative is supporting the price — positive feedback loop in motion.'}
        {verdict === 'MIXED' && 'Conflicting signals across headlines, insiders and analysts. The story isn\'t fully formed yet — wait for clarity or trade only the chart.'}
      </p>
    </div>
  )
}

// ─── shared inline parts ──────────────────────────────────

const BIGNUM: React.CSSProperties = {
  fontFamily: 'var(--font-fraunces), serif',
  fontSize: '24px', fontWeight: 700,
  letterSpacing: '0.04em',
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: 'var(--font-inter), sans-serif',
      fontSize: '10px', fontWeight: 700, color: '#A89A7E',
      letterSpacing: '0.18em', textTransform: 'uppercase',
    }}>{children}</div>
  )
}
