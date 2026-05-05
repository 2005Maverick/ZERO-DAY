'use client'

import type { ScenarioStock } from '@/types/scenario'
import { Search } from 'lucide-react'

interface DossierCardProps {
  stock: ScenarioStock
  active: boolean
  studied: number
  onClick: () => void
  onTutor: () => void
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
  pharma:   'Pharma',
  energy:   'Energy',
  banking:  'Banking',
  luxury:   'Luxury',
  it:       'Tech',
}

/**
 * Stock dossier card — modern flat card, dark slate, amber accents.
 * Used in 3×2 grid (no fan, no rotation).
 */
export function DossierCard({ stock, active, studied, onClick, onTutor }: DossierCardProps) {
  const accent = SECTOR_COLOR[stock.sector] ?? '#D4A04D'
  const pctNum = stock.pctChange30d * 100
  const isDown = pctNum < 0

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '14px 16px',
        background: active
          ? `linear-gradient(180deg, rgba(212,160,77,0.08) 0%, #11161D 100%)`
          : 'linear-gradient(180deg, #1A2028 0%, #11161D 100%)',
        border: active
          ? '1px solid rgba(212,160,77,0.7)'
          : '1px solid rgba(212,160,77,0.18)',
        borderRadius: '10px',
        boxShadow: active
          ? '0 12px 28px rgba(0,0,0,0.55), 0 0 24px rgba(212,160,77,0.20), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 6px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'transform 0.18s, border 0.18s, box-shadow 0.18s',
        transform: active ? 'translateY(-2px)' : 'translateY(0)',
        minHeight: '180px',
      }}
      onMouseEnter={e => {
        if (!active) e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        if (!active) e.currentTarget.style.transform = ''
      }}
    >
      {/* Top row — sector chip + tutor button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SectorGlyph sector={stock.sector} color={accent} />
          <span style={{
            fontFamily: 'var(--font-plex-mono), monospace',
            fontSize: '9px',
            fontWeight: 600,
            color: accent,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}>
            {SECTOR_LABEL[stock.sector] ?? stock.sectorLabel}
          </span>
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onTutor() }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onTutor() } }}
          aria-label={`Open tutor for ${stock.symbol}`}
          style={{
            width: '22px', height: '22px',
            borderRadius: '5px',
            background: 'rgba(212,160,77,0.10)',
            border: '1px solid rgba(212,160,77,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#D4A04D',
            cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.background = 'rgba(212,160,77,0.22)'
            el.style.borderColor = '#D4A04D'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.background = 'rgba(212,160,77,0.10)'
            el.style.borderColor = 'rgba(212,160,77,0.4)'
          }}
        >
          <Search size={11} strokeWidth={2.4} />
        </div>
      </div>

      {/* Middle — symbol + price stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{
          fontFamily: 'var(--font-cormorant-sc), serif',
          fontWeight: 700,
          fontSize: '20px',
          color: '#F4EDE0',
          letterSpacing: '0.06em',
          lineHeight: 1.05,
        }}>
          {stock.symbol}
        </div>
        <div style={{
          fontFamily: 'var(--font-eb-garamond), serif',
          fontStyle: 'italic',
          fontSize: '11px',
          color: '#8A8576',
          letterSpacing: '0.02em',
        }}>
          {stock.name}
        </div>
      </div>

      {/* Price + delta */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{
          fontFamily: 'var(--font-plex-mono), monospace',
          fontSize: '20px',
          fontWeight: 700,
          color: '#F4EDE0',
          letterSpacing: '0.02em',
        }}>
          ₹{stock.closePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          fontFamily: 'var(--font-plex-mono), monospace',
          fontSize: '12px',
          fontWeight: 700,
          color: isDown ? '#E04A4A' : '#5AB088',
        }}>
          <span style={{ fontSize: '8px' }}>{isDown ? '▼' : '▲'}</span>
          {pctNum > 0 ? '+' : ''}{pctNum.toFixed(1)}%
        </div>
      </div>

      {/* Sparkline */}
      <Sparkline candles={stock.candles} color={accent} />

      {/* Bottom — studied dots + open dossier link */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '3px' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} style={{
              width: '5px', height: '5px',
              borderRadius: '50%',
              background: i < studied ? '#D4A04D' : 'rgba(212,160,77,0.18)',
              boxShadow: i < studied ? '0 0 4px rgba(212,160,77,0.6)' : 'none',
            }} />
          ))}
        </div>
        <div style={{
          fontFamily: 'var(--font-cormorant-sc), serif',
          fontWeight: 700,
          fontSize: '9px',
          color: active ? '#D4A04D' : '#8A8576',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}>
          {active ? '◆ Open Dossier' : 'Open →'}
        </div>
      </div>
    </button>
  )
}

// ─── Sparkline ───────────────────────────────────────────────

function Sparkline({ candles, color }: { candles: ScenarioStock['candles']; color: string }) {
  if (candles.length === 0) return null
  const w = 240, h = 36, pad = 1
  const closes = candles.map(c => c.close)
  const min = Math.min(...closes)
  const max = Math.max(...closes)
  const range = max - min || 1
  const pts = closes.map((c, i) => {
    const x = pad + (i / (closes.length - 1)) * (w - pad * 2)
    const y = pad + (1 - (c - min) / range) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  // build a fill polygon
  const fillPts = `${pad},${h - pad} ${pts} ${w - pad},${h - pad}`

  const lastX = pad + (w - pad * 2)
  const lastY = pad + (1 - (closes[closes.length - 1] - min) / range) * (h - pad * 2)

  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spk-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#spk-${color.replace('#', '')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={lastX} cy={lastY} r="2" fill={color} />
    </svg>
  )
}

// ─── Sector glyph (16×16 line-art) ───────────────────────────

function SectorGlyph({ sector, color }: { sector: string; color: string }) {
  switch (sector) {
    case 'airlines':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 8 L13 3 L11 7 L7 8 L9 11 L7.5 11.5 L5.5 9 L2.5 9.5 Z"/>
        </svg>
      )
    case 'pharma':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round">
          <line x1="7" y1="2" x2="7" y2="12"/>
          <path d="M4 4 Q7 5 10 4 Q7 7 4 8 Q7 10 10 9"/>
        </svg>
      )
    case 'energy':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round">
          <path d="M7 2 Q4 6 5 9 Q5 12 7 12 Q9 12 9 9 Q9 7 8 6 Q8 8 7 8 Q6 6 7 2 Z"/>
        </svg>
      )
    case 'banking':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.3" strokeLinecap="round">
          <polygon points="2,5 7,2 12,5"/>
          <line x1="3" y1="6" x2="3" y2="11"/>
          <line x1="7" y1="6" x2="7" y2="11"/>
          <line x1="11" y1="6" x2="11" y2="11"/>
          <line x1="2" y1="12" x2="12" y2="12"/>
        </svg>
      )
    case 'luxury':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.3" strokeLinejoin="round">
          <polygon points="7,2 11,5 7,12 3,5"/>
          <line x1="3" y1="5" x2="11" y2="5"/>
        </svg>
      )
    case 'it':
      return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.3">
          <rect x="4" y="4" width="6" height="6" rx="0.5"/>
          <line x1="6" y1="2" x2="6" y2="4"/>
          <line x1="8" y1="2" x2="8" y2="4"/>
          <line x1="6" y1="10" x2="6" y2="12"/>
          <line x1="8" y1="10" x2="8" y2="12"/>
          <line x1="2" y1="6" x2="4" y2="6"/>
          <line x1="2" y1="8" x2="4" y2="8"/>
          <line x1="10" y1="6" x2="12" y2="6"/>
          <line x1="10" y1="8" x2="12" y2="8"/>
        </svg>
      )
  }
  return null
}
