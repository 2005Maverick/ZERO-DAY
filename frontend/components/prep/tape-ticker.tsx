'use client'

import type { ScenarioMacro } from '@/types/scenario'

interface TapeTickerProps {
  macro: ScenarioMacro
  preMarketLabel?: string
  activeSymbol?: string
  activeClose?: number
  activePctChange?: number
}

/**
 * Slim bottom ticker — dark slate, amber + colored deltas.
 * No paper texture, no brass key. Performant.
 */
export function TapeTicker({
  macro, preMarketLabel, activeSymbol, activeClose, activePctChange,
}: TapeTickerProps) {
  const segs: { text: string; color: string }[] = []
  if (preMarketLabel) segs.push({ text: preMarketLabel, color: '#D4A04D' })
  if (activeSymbol && activeClose != null) {
    const dn = (activePctChange ?? 0) < 0
    segs.push({
      text: `${activeSymbol} ${activeClose.toFixed(2)} ${dn ? '▼' : '▲'}${Math.abs(activePctChange ?? 0).toFixed(1)}%`,
      color: dn ? '#E04A4A' : '#5AB088',
    })
  }
  for (const h of macro.worldNews) {
    segs.push({ text: `${h.flag}  ${h.headline}`.toUpperCase(), color: '#A89A7E' })
  }
  for (const ind of macro.indicators) {
    if (ind.pctChange === 0) continue
    const up = ind.pctChange > 0
    segs.push({
      text: `${ind.label} ${up ? '▲' : '▼'}${Math.abs(ind.pctChange).toFixed(1)}%`,
      color: up ? '#5AB088' : '#E04A4A',
    })
  }

  const renderRun = (key: string) => (
    <div key={key} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
      {segs.map((s, i) => (
        <span key={i} style={{
          color: s.color,
          fontFamily: 'var(--font-plex-mono), monospace',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          padding: '0 18px',
          whiteSpace: 'nowrap',
        }}>
          {s.text}
          {i < segs.length - 1 && (
            <span style={{ marginLeft: '18px', color: 'rgba(212,160,77,0.3)' }}>·</span>
          )}
        </span>
      ))}
    </div>
  )

  return (
    <div style={{
      height: '38px',
      background: 'linear-gradient(180deg, #11161D 0%, #0A0E14 100%)',
      borderTop: '1px solid rgba(212,160,77,0.25)',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    }}>
      <div style={{
        display: 'flex',
        animation: 'tape-scroll 80s linear infinite',
        willChange: 'transform',
      }}>
        {renderRun('a')}{renderRun('b')}{renderRun('c')}
      </div>
      <style jsx>{`
        @keyframes tape-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  )
}
