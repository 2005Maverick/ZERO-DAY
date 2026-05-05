'use client'

import type { ScenarioMacro, SectorPulse, MarketIndicator, WorldHeadline } from '@/types/scenario'

interface HeraldicIntelProps {
  macro: ScenarioMacro
}

/**
 * Macro intel — flat dark slate panel with three sections:
 *   World news · Sector heatmap · Foreign ports.
 * No parchment, no perspective.
 */
export function HeraldicIntel({ macro }: HeraldicIntelProps) {
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <Panel title="World Intel · 09 Mar 2020">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {macro.worldNews.slice(0, 3).map((n, i) => <NewsRow key={i} item={n} />)}
        </div>
      </Panel>

      <Panel title="Sector Heatmap · Nifty">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
        }}>
          {macro.sectorHeatmap.map(p => <HeatTile key={p.sector} pulse={p} />)}
        </div>
      </Panel>

      <Panel title="Foreign Ports">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {macro.indicators.map(ind => <PortRow key={ind.label} ind={ind} />)}
        </div>
      </Panel>
    </div>
  )
}

// ─── Panel shell ────────────────────────────────────────────

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #1A2028 0%, #11161D 100%)',
      border: '1px solid rgba(212,160,77,0.2)',
      borderRadius: '8px',
      padding: '12px 14px',
      boxShadow: '0 6px 16px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      <div style={{
        fontFamily: 'var(--font-cormorant-sc), serif',
        fontWeight: 700,
        fontSize: '10px',
        color: '#D4A04D',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        marginBottom: '10px',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

// ─── Sector heatmap tile ────────────────────────────────────

function HeatTile({ pulse }: { pulse: SectorPulse }) {
  const isUp = pulse.pctChange >= 0
  const accent = isUp ? '#5AB088' : pulse.pctChange <= -3 ? '#E04A4A' : '#C77070'
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '3px',
      padding: '8px 9px',
      background: isUp ? 'rgba(90,176,136,0.08)' : 'rgba(224,74,74,0.08)',
      border: `1px solid ${isUp ? 'rgba(90,176,136,0.3)' : 'rgba(224,74,74,0.3)'}`,
      borderRadius: '5px',
    }}>
      <div style={{
        fontFamily: 'var(--font-cormorant-sc), serif',
        fontSize: '9px',
        fontWeight: 700,
        color: '#F4EDE0',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}>
        {pulse.label}
      </div>
      <div style={{
        fontFamily: 'var(--font-plex-mono), monospace',
        fontSize: '12px',
        fontWeight: 700,
        color: accent,
      }}>
        {isUp ? '+' : ''}{pulse.pctChange.toFixed(1)}%
      </div>
    </div>
  )
}

// ─── World news row ─────────────────────────────────────────

function NewsRow({ item }: { item: WorldHeadline }) {
  const SEV: Record<WorldHeadline['severity'], string> = {
    low:      '#D4A04D',
    medium:   '#E48838',
    high:     '#E04A4A',
    critical: '#A855F7',
  }
  const c = SEV[item.severity]
  return (
    <div style={{
      display: 'flex',
      gap: '8px',
      padding: '7px 9px',
      background: 'rgba(212,160,77,0.04)',
      border: '1px solid rgba(212,160,77,0.10)',
      borderLeft: `2px solid ${c}`,
      borderRadius: '4px',
    }}>
      <span style={{ fontSize: '13px', flexShrink: 0 }}>{item.flag}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'var(--font-eb-garamond), serif',
          fontSize: '11px',
          color: '#F4EDE0',
          lineHeight: 1.35,
          marginBottom: '2px',
        }}>
          {item.headline}
        </div>
        <div style={{
          fontFamily: 'var(--font-plex-mono), monospace',
          fontSize: '8px',
          color: c,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          {item.hoursAgo}h ago · {item.severity}
        </div>
      </div>
    </div>
  )
}

// ─── Foreign port row ───────────────────────────────────────

function PortRow({ ind }: { ind: MarketIndicator }) {
  const up = ind.pctChange > 0
  const flat = ind.pctChange === 0
  const arrow = flat ? '—' : up ? '▲' : '▼'
  const c = flat ? '#A89A7E' : up ? '#5AB088' : '#E04A4A'
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      gap: '8px',
      padding: '5px 0',
    }}>
      <span style={{
        fontFamily: 'var(--font-cormorant-sc), serif',
        fontWeight: 700,
        fontSize: '10px',
        color: '#A89A7E',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        width: '60px',
      }}>
        {ind.label}
      </span>
      <span style={{
        flex: 1,
        borderBottom: '1px dotted rgba(212,160,77,0.2)',
        height: '8px',
      }} />
      <span style={{
        fontFamily: 'var(--font-plex-mono), monospace',
        fontSize: '11px',
        fontWeight: 600,
        color: '#F4EDE0',
        minWidth: '52px',
        textAlign: 'right',
      }}>
        {ind.value}
      </span>
      <span style={{
        fontFamily: 'var(--font-plex-mono), monospace',
        fontSize: '10px',
        fontWeight: 700,
        color: c,
        minWidth: '54px',
        textAlign: 'right',
        display: 'flex',
        gap: '3px',
        justifyContent: 'flex-end',
      }}>
        <span style={{ fontSize: '8px' }}>{arrow}</span>
        {Math.abs(ind.pctChange).toFixed(1)}%
      </span>
    </div>
  )
}
