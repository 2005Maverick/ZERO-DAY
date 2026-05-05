'use client'

import type { ScenarioMacro, WorldHeadline, SectorPulse, MarketIndicator } from '@/types/scenario'

interface MacroIntelRailProps {
  macro: ScenarioMacro
  scenarioDateLabel: string                 // '09 MAR 2020'
}

export function MacroIntelRail({ macro, scenarioDateLabel }: MacroIntelRailProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <WorldIntelBlock items={macro.worldNews} dateLabel={scenarioDateLabel} />
      <SectorHeatmapBlock items={macro.sectorHeatmap} />
      <IndicatorsBlock items={macro.indicators} />
    </div>
  )
}

// ─── World Intel ─────────────────────────────────────────────

function WorldIntelBlock({ items, dateLabel }: { items: WorldHeadline[]; dateLabel: string }) {
  const SEVERITY_COLOR: Record<WorldHeadline['severity'], string> = {
    low:      '#FACC15',
    medium:   '#F97316',
    high:     '#EF4444',
    critical: '#A855F7',
  }
  return (
    <BlockShell title={`WORLD INTEL · ${dateLabel}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '8px',
            padding: '8px 10px',
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '5px',
          }}>
            <div style={{
              width: '24px', height: '24px',
              borderRadius: '5px',
              background: `${SEVERITY_COLOR[item.severity]}1A`,
              border: `1px solid ${SEVERITY_COLOR[item.severity]}60`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              fontSize: '12px',
            }}>
              {item.flag}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.92)',
                lineHeight: 1.3,
                fontWeight: 500,
                marginBottom: '3px',
              }}>
                {item.headline}
              </div>
              <div style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '8px',
                color: SEVERITY_COLOR[item.severity],
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {item.hoursAgo}h ago · {item.severity}
              </div>
            </div>
          </div>
        ))}
      </div>
    </BlockShell>
  )
}

// ─── Sector Heatmap (Nifty grid) ─────────────────────────────

function SectorHeatmapBlock({ items }: { items: SectorPulse[] }) {
  // pctChange is stored as percentage (e.g., -3.2 means -3.2%)
  const colorFor = (pct: number): { bg: string; border: string; text: string } => {
    if (pct <= -3)   return { bg: 'rgba(239,68,68,0.18)', border: '#EF444480', text: '#FCA5A5' }
    if (pct <  0)    return { bg: 'rgba(239,68,68,0.10)', border: '#EF444460', text: '#FCA5A5' }
    if (pct === 0)   return { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.6)' }
    if (pct <  2)    return { bg: 'rgba(16,185,129,0.10)', border: '#10B98160', text: '#6EE7B7' }
    return { bg: 'rgba(16,185,129,0.18)', border: '#10B98180', text: '#6EE7B7' }
  }
  return (
    <BlockShell title="SECTOR HEATMAP · NIFTY">
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '6px',
      }}>
        {items.map(item => {
          const c = colorFor(item.pctChange)
          const pctStr = `${item.pctChange > 0 ? '+' : ''}${item.pctChange.toFixed(1)}%`
          return (
            <div key={item.sector} style={{
              padding: '8px 6px',
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: '5px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
            }}>
              <span style={{ fontSize: '14px' }}>{item.emoji}</span>
              <span style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '8px',
                color: 'rgba(255,255,255,0.65)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}>
                {item.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '11px',
                fontWeight: 700,
                color: c.text,
              }}>
                {pctStr}
              </span>
            </div>
          )
        })}
      </div>
    </BlockShell>
  )
}

// ─── Indicators ──────────────────────────────────────────────

function IndicatorsBlock({ items }: { items: MarketIndicator[] }) {
  return (
    <BlockShell title="CURRENCY / OIL">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map(ind => {
          const up = ind.pctChange > 0
          const flat = ind.pctChange === 0
          const color = flat ? 'rgba(255,255,255,0.55)' : up ? '#10B981' : '#EF4444'
          const arrow = flat ? '→' : up ? '▲' : '▼'
          const pctStr = `${up ? '+' : ''}${ind.pctChange.toFixed(1)}%`
          return (
            <div key={ind.label} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '7px 10px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '5px',
              gap: '8px',
            }}>
              <span style={{
                fontFamily: 'var(--font-geist-sans), sans-serif',
                fontSize: '9px',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.55)',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                width: '60px',
              }}>
                {ind.label}
              </span>
              <span style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '12px',
                fontWeight: 700,
                color: '#FFFFFF',
                flex: 1,
              }}>
                {ind.value}
              </span>
              <span style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: '11px',
                fontWeight: 700,
                color,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{ fontSize: '8px' }}>{arrow}</span>
                {pctStr}
              </span>
            </div>
          )
        })}
      </div>
    </BlockShell>
  )
}

// ─── Block shell ─────────────────────────────────────────────

function BlockShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(180deg, rgba(20,20,28,0.85), rgba(10,10,14,0.92))',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '10px',
      padding: '14px',
      boxShadow: '0 4px 14px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
    }}>
      <span style={{ position: 'absolute', top: '6px', left: '6px', width: '8px', height: '8px',
        borderTop: '1.5px solid rgba(239,68,68,0.5)', borderLeft: '1.5px solid rgba(239,68,68,0.5)', pointerEvents: 'none' }} />
      <span style={{ position: 'absolute', bottom: '6px', right: '6px', width: '8px', height: '8px',
        borderBottom: '1.5px solid rgba(239,68,68,0.5)', borderRight: '1.5px solid rgba(239,68,68,0.5)', pointerEvents: 'none' }} />
      <div style={{
        display: 'inline-block',
        padding: '4px 8px',
        marginBottom: '10px',
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.4)',
        borderRadius: '4px',
        fontFamily: 'var(--font-geist-sans), sans-serif',
        fontSize: '9px',
        fontWeight: 700,
        letterSpacing: '0.18em',
        color: '#EF4444',
        textTransform: 'uppercase',
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}
