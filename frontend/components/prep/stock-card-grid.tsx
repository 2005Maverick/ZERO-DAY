'use client'

import type { ScenarioStock } from '@/types/scenario'
import { ChevronRight, Eye } from 'lucide-react'

interface StockCardGridProps {
  stocks: ScenarioStock[]
  studiedCounts: Record<string, number>
  onOpen: (symbol: string) => void
}

const SECTOR_COLOR: Record<string, string> = {
  airlines: '#3B82F6',
  pharma:   '#10B981',
  energy:   '#E11D48',
  banking:  '#06B6D4',
  luxury:   '#A855F7',
  it:       '#14B8A6',
}

const SECTOR_LABEL: Record<string, string> = {
  airlines: 'Aviation',
  pharma:   'Pharmaceuticals',
  energy:   'Oil, Gas & Petrochem',
  banking:  'Private Banking',
  luxury:   'Luxury & Lifestyle',
  it:       'Information Technology',
}

/**
 * 3 × 2 grid of large clickable stock cards.
 * Click → opens the dossier modal.
 */
export function StockCardGrid({ stocks, studiedCounts, onOpen }: StockCardGridProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '18px',
    }}>
      {stocks.slice(0, 6).map(stock => (
        <StockCard
          key={stock.symbol}
          stock={stock}
          studied={studiedCounts[stock.symbol] ?? 0}
          onOpen={() => onOpen(stock.symbol)}
        />
      ))}
    </div>
  )
}

// ─── card ───────────────────────────────────────────────────

function StockCard({ stock, studied, onOpen }: {
  stock: ScenarioStock
  studied: number
  onOpen: () => void
}) {
  const accent = SECTOR_COLOR[stock.sector] ?? stock.color
  const pctNum = stock.pctChange30d * 100
  const isDown = pctNum < 0
  const fullyStudied = studied >= 6

  return (
    <button
      onClick={onOpen}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        padding: '20px 22px',
        background: 'linear-gradient(180deg, #1A2028 0%, #11161D 100%)',
        border: `1px solid ${fullyStudied ? '#5AB088' : 'rgba(212,160,77,0.22)'}`,
        borderRadius: '12px',
        boxShadow: '0 8px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'transform 0.2s, border 0.2s, box-shadow 0.2s',
        minHeight: '220px',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-3px)'
        el.style.borderColor = accent
        el.style.boxShadow = `0 12px 30px rgba(0,0,0,0.55), 0 0 22px ${accent}30, inset 0 1px 0 rgba(255,255,255,0.06)`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = ''
        el.style.borderColor = fullyStudied ? '#5AB088' : 'rgba(212,160,77,0.22)'
        el.style.boxShadow = '0 8px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)'
      }}
    >
      {/* Sector accent bar on top */}
      <span style={{
        position: 'absolute',
        top: 0, left: '12px', right: '12px',
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
      }} />

      {/* Top row — sector chip + studied badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SectorGlyph sector={stock.sector} color={accent} size={20} />
          <div>
            <div style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              color: accent,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}>
              {SECTOR_LABEL[stock.sector] ?? stock.sectorLabel}
            </div>
            <div style={{
              fontFamily: 'var(--font-inter), sans-serif',
              fontSize: '11px',
              color: '#5C5849',
              marginTop: '4px',
            }}>
              NSE · {stock.sectorLabel}
            </div>
          </div>
        </div>

        <div style={{
          padding: '5px 10px',
          background: fullyStudied ? 'rgba(90,176,136,0.14)' : 'rgba(212,160,77,0.10)',
          border: `1px solid ${fullyStudied ? '#5AB088' : 'rgba(212,160,77,0.4)'}`,
          borderRadius: '999px',
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '10px',
          fontWeight: 700,
          color: fullyStudied ? '#5AB088' : '#D4A04D',
          letterSpacing: '0.05em',
        }}>
          {studied}/6 STUDIED
        </div>
      </div>

      {/* Symbol + name */}
      <div>
        <div style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontWeight: 700,
          fontSize: '32px',
          color: '#F4EDE0',
          letterSpacing: '0.03em',
          lineHeight: 1.05,
        }}>
          {stock.symbol}
        </div>
        <div style={{
          fontFamily: 'var(--font-fraunces), serif',
          fontStyle: 'italic',
          fontSize: '14px',
          color: '#A89A7E',
          marginTop: '4px',
          fontWeight: 400,
        }}>
          {stock.name}
        </div>
      </div>

      {/* Price + delta */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
        <span style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '24px',
          fontWeight: 700,
          color: '#F4EDE0',
          letterSpacing: '0.01em',
        }}>
          ₹{stock.closePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span style={{
          fontFamily: 'var(--font-jetbrains), monospace',
          fontSize: '14px',
          fontWeight: 700,
          color: isDown ? '#E04A4A' : '#5AB088',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}>
          <span style={{ fontSize: '10px' }}>{isDown ? '▼' : '▲'}</span>
          {pctNum > 0 ? '+' : ''}{pctNum.toFixed(1)}%
        </span>
        <span style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '11px',
          color: '#5C5849',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginLeft: 'auto',
        }}>
          30D
        </span>
      </div>

      {/* Sparkline */}
      <Sparkline candles={stock.candles} color={accent} />

      {/* Bottom — open dossier prompt */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '8px',
        borderTop: '1px solid rgba(212,160,77,0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#A89A7E' }}>
          <Eye size={14} strokeWidth={2} />
          <span style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '12px',
            fontWeight: 500,
          }}>
            Open Dossier
          </span>
        </div>
        <ChevronRight size={16} color={accent} />
      </div>
    </button>
  )
}

// ─── sparkline ──────────────────────────────────────────────

function Sparkline({ candles, color }: { candles: ScenarioStock['candles']; color: string }) {
  if (candles.length === 0) return null
  const w = 280, h = 44, pad = 2
  const closes = candles.map(c => c.close)
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const range = max - min || 1
  const pts = closes.map((c, i) => {
    const x = pad + (i / (closes.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (c - min) / range) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const fillPts = `${pad},${h - pad} ${pts} ${w - pad},${h - pad}`
  const lastX = pad + (w - pad * 2)
  const lastY = pad + (1 - (closes[closes.length - 1] - min) / range) * (h - pad * 2)

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gridspk-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#gridspk-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={lastX} cy={lastY} r="2.4" fill={color} />
    </svg>
  )
}

// ─── sector glyph ───────────────────────────────────────────

function SectorGlyph({ sector, color, size = 16 }: { sector: string; color: string; size?: number }) {
  const sw = 1.6
  switch (sector) {
    case 'airlines':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 9 L15 3 L13 8 L8 9 L10 13 L8 13.5 L6 10 L3 11 Z"/>
        </svg>
      )
    case 'pharma':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
          <line x1="8" y1="2" x2="8" y2="14"/>
          <path d="M5 4 Q8 5 11 4 Q8 7 5 8 Q8 11 11 10"/>
        </svg>
      )
    case 'energy':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round">
          <path d="M8 2 Q5 6 6 10 Q6 13 8 14 Q10 13 10 10 Q10 7 9 6 Q9 8 8 8 Q7 6 8 2 Z"/>
        </svg>
      )
    case 'banking':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round">
          <polygon points="2,6 8,3 14,6"/>
          <line x1="4" y1="7" x2="4" y2="12"/>
          <line x1="8" y1="7" x2="8" y2="12"/>
          <line x1="12" y1="7" x2="12" y2="12"/>
          <line x1="2" y1="13" x2="14" y2="13"/>
        </svg>
      )
    case 'luxury':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round">
          <polygon points="8,2 13,6 8,14 3,6"/>
          <line x1="3" y1="6" x2="13" y2="6"/>
        </svg>
      )
    case 'it':
      return (
        <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth={sw}>
          <rect x="4" y="4" width="8" height="8" rx="0.5"/>
          <line x1="6" y1="2" x2="6" y2="4"/>
          <line x1="10" y1="2" x2="10" y2="4"/>
          <line x1="6" y1="12" x2="6" y2="14"/>
          <line x1="10" y1="12" x2="10" y2="14"/>
          <line x1="2" y1="6" x2="4" y2="6"/>
          <line x1="2" y1="10" x2="4" y2="10"/>
          <line x1="12" y1="6" x2="14" y2="6"/>
          <line x1="12" y1="10" x2="14" y2="10"/>
        </svg>
      )
  }
  return null
}
