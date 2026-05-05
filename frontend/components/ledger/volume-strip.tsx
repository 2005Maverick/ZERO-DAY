'use client'

import { VOLUMES, getVolumeForCase } from '@/lib/data/ledger-cases'
import type { VolumeId } from '@/types/ledger'

interface VolumeStripProps {
  currentCaseNumber: number
  onJumpToVolume: (caseNum: number) => void
}

const VOLUME_HINTS: Record<VolumeId, string> = {
  I:   'Foundations · Videos',
  II:  'Drills · Mini-Games',
  III: 'Crises · Simulations',
  IV:  'Patterns · Analysis',
  V:   'Profiles · Trader Bios',
  VI:  'Mastery · Achievements',
}

export function VolumeStrip({ currentCaseNumber, onJumpToVolume }: VolumeStripProps) {
  const activeVolume = getVolumeForCase(currentCaseNumber)?.id

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      padding: '14px 24px',
      borderBottom: '1px solid rgba(201,164,95,0.12)',
      background: 'rgba(20,12,4,0.4)',
      flexWrap: 'wrap',
    }}>
      {/* Eyebrow label */}
      <span style={{
        fontFamily: '"Big Caslon", Caslon, Garamond, serif',
        fontStyle: 'italic',
        fontSize: '11px',
        letterSpacing: '0.16em',
        color: 'rgba(201,164,95,0.6)',
        textTransform: 'uppercase',
        marginRight: '8px',
      }}>
        Jump to Volume —
      </span>

      {VOLUMES.map(v => {
        const isActive = v.id === activeVolume
        return (
          <button
            key={v.id}
            onClick={() => onJumpToVolume(v.defaultEntry)}
            style={{
              position: 'relative',
              padding: '7px 14px',
              background: isActive ? 'rgba(220,38,38,0.14)' : 'transparent',
              border: `1px solid ${isActive ? '#DC2626' : 'rgba(201,164,95,0.22)'}`,
              borderRadius: '3px',
              cursor: 'pointer',
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              color: isActive ? '#FFB830' : 'rgba(232,223,200,0.7)',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isActive ? '0 0 12px rgba(220,38,38,0.25)' : 'none',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(220,38,38,0.5)'
                ;(e.currentTarget as HTMLButtonElement).style.color = '#E8DFC8'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,164,95,0.22)'
                ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(232,223,200,0.7)'
              }
            }}
          >
            <span style={{
              fontFamily: '"Big Caslon", Caslon, Garamond, serif',
              fontStyle: 'italic',
              fontSize: '13px',
              fontWeight: 700,
              color: isActive ? '#FFB830' : '#DC2626',
            }}>
              Vol {v.id}
            </span>
            <span style={{ opacity: 0.85 }}>{VOLUME_HINTS[v.id]}</span>
            {isActive && (
              <span style={{
                position: 'absolute',
                bottom: '-1px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '20px',
                height: '2px',
                background: '#DC2626',
                boxShadow: '0 0 6px rgba(220,38,38,0.85)',
              }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
