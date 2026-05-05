'use client'

import type { ScenarioMacro } from '@/types/scenario'

interface PrepTickerProps {
  macro: ScenarioMacro
  preMarketLabel?: string                   // '09:00 IST · BELL IN 60s'
  activeSymbol?: string
  activeClose?: number
}

/**
 * Slim bottom marquee — pure black, single line, mono caps.
 */
export function PrepTicker({ macro, preMarketLabel, activeSymbol, activeClose }: PrepTickerProps) {
  const segs: { text: string; color: string }[] = []
  if (preMarketLabel) segs.push({ text: preMarketLabel, color: '#FFFFFF' })
  if (activeSymbol && activeClose != null) {
    segs.push({ text: `MR-01 ${activeSymbol} LAST CLOSE ${activeClose.toFixed(0)}`, color: '#EF4444' })
  }
  for (const h of macro.worldNews) {
    segs.push({ text: `${h.flag} ${h.headline}`.toUpperCase(), color: 'rgba(255,255,255,0.7)' })
  }
  for (const ind of macro.indicators) {
    if (ind.pctChange === 0) continue
    const up = ind.pctChange > 0
    segs.push({
      text: `${ind.label} ${ind.pctChange > 0 ? '+' : ''}${ind.pctChange.toFixed(1)}%`,
      color: up ? '#10B981' : '#EF4444',
    })
  }

  const renderRun = (key: string) => (
    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '20px', paddingRight: '20px', flexShrink: 0 }}>
      {segs.map((s, i) => (
        <span key={i} style={{
          color: s.color,
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.14em',
          whiteSpace: 'nowrap',
        }}>
          {s.text}
          {i < segs.length - 1 && (
            <span style={{ marginLeft: '20px', color: 'rgba(255,255,255,0.2)' }}>·</span>
          )}
        </span>
      ))}
    </div>
  )

  return (
    <div style={{
      height: '36px',
      background: '#000000',
      borderTop: '1px solid rgba(239,68,68,0.4)',
      overflow: 'hidden',
      position: 'relative',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div style={{
        display: 'flex',
        whiteSpace: 'nowrap',
        animation: 'prep-ticker-scroll 90s linear infinite',
      }}>
        {renderRun('a')}{renderRun('b')}{renderRun('c')}
      </div>
      <style jsx>{`
        @keyframes prep-ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  )
}
