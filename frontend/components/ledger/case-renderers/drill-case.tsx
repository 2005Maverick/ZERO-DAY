'use client'

import { useEffect } from 'react'
import type { DrillCase } from '@/types/ledger'
import { academyLinkFor } from '@/lib/ledger-academy-map'
import { getGame } from '@/lib/academy/games'
import { MiniGameEngine } from '@/components/academy/mini-game-engine'
import { useTracer } from '@/lib/behavior/tracer'
import { Zap } from 'lucide-react'

interface Props {
  ledgerCase: DrillCase
}

export function DrillCaseRenderer({ ledgerCase }: Props) {
  const { track } = useTracer()
  const link = academyLinkFor(ledgerCase)
  const game = link ? getGame(link.gameSlug) : null

  useEffect(() => {
    track('ledger_case_opened', 0, {
      caseId: ledgerCase.id, type: 'drill', number: ledgerCase.number,
      volume: ledgerCase.volume, title: ledgerCase.title,
    })
  }, [ledgerCase.id, ledgerCase.number, ledgerCase.volume, ledgerCase.title, track])

  // ── Rich path: real mini-game embedded ─────────────────────
  if (game) {
    const drillNum = Math.max(1, ledgerCase.number - 24)
    return (
      <div style={{
        display: 'grid', gridTemplateColumns: '300px 1fr',
        width: '100%', height: '100%',
      }}>
        {/* LEFT — drill briefing on parchment */}
        <div style={{
          position: 'relative',
          padding: '36px 28px 28px',
          borderRight: '1px solid rgba(60, 30, 15, 0.18)',
        }}>
          <div style={{
            fontFamily: '"Big Caslon", Caslon, Garamond, serif',
            fontStyle: 'italic',
            fontSize: '20px',
            color: '#1a1a1a',
            marginBottom: '6px',
          }}>
            DRILL № {drillNum.toString().padStart(2, '0')} / 10
          </div>

          <div style={{
            fontFamily: 'var(--font-geist-sans), sans-serif',
            fontSize: '9px',
            letterSpacing: '0.22em',
            color: `#${game.accentColor}`,
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: '18px',
          }}>{ledgerCase.concept}</div>

          <h2 style={{
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: 'clamp(24px, 2.6vw, 34px)',
            color: '#1a1a1a',
            letterSpacing: '0.02em',
            lineHeight: 1.05,
            margin: '0 0 14px',
            textTransform: 'uppercase',
          }}>{game.title}</h2>

          <p style={{
            fontFamily: 'Garamond, serif',
            fontStyle: 'italic',
            fontSize: '13px',
            color: '#3a2818',
            lineHeight: 1.5,
            margin: '0 0 18px',
          }}>{game.tagline}</p>

          <div style={{
            padding: '10px 12px',
            background: `rgba(${rgb(game.accentColor)}, 0.08)`,
            border: `1px solid #${game.accentColor}66`,
            borderRadius: '4px',
          }}>
            <div style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '9px', fontWeight: 700,
              color: `#${game.accentColor}`,
              letterSpacing: '0.18em', textTransform: 'uppercase',
              marginBottom: '4px',
            }}><Zap size={9} style={{ display: 'inline', marginRight: '3px' }}/>Format</div>
            <div style={{
              fontFamily: 'Garamond, serif',
              fontSize: '12px', color: '#1a1a1a', lineHeight: 1.5,
            }}>{game.rounds.length} rounds · pass at {(game.passThreshold * 100).toFixed(0)}%</div>
          </div>

          {(typeof ledgerCase.bestScore === 'number' || typeof ledgerCase.timesPlayed === 'number') && (
            <div style={{
              marginTop: '18px',
              fontFamily: 'var(--font-geist-mono), monospace',
              fontSize: '10px', color: '#604838',
              letterSpacing: '0.06em',
            }}>
              {typeof ledgerCase.bestScore === 'number' && <div>Best · {ledgerCase.bestScore}</div>}
              {typeof ledgerCase.timesPlayed === 'number' && <div>Played · {ledgerCase.timesPlayed}×</div>}
            </div>
          )}
        </div>

        {/* RIGHT — embedded game (dark theme contrasts with parchment) */}
        <div style={{
          padding: '20px',
          background: 'linear-gradient(160deg, #0D0D0D 0%, #060606 100%)',
          overflow: 'auto',
        }}>
          <MiniGameEngine game={game}/>
        </div>
      </div>
    )
  }

  // ── Fallback: original "Coming Soon" stamp ─────────────────
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      width: '100%', height: '100%',
    }}>
      <div style={{
        position: 'relative',
        padding: '36px 32px 28px',
        borderRight: '1px solid rgba(60, 30, 15, 0.18)',
      }}>
        <div style={{
          fontFamily: '"Big Caslon", Caslon, Garamond, serif',
          fontStyle: 'italic', fontSize: '22px', color: '#1a1a1a',
          marginBottom: '6px',
        }}>DRILL № {(ledgerCase.number - 24).toString().padStart(2, '0')} / 10</div>
        <div style={{
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '10px', letterSpacing: '0.22em',
          color: 'rgba(60, 30, 15, 0.6)', fontWeight: 600,
          textTransform: 'uppercase', marginBottom: '20px',
        }}>Concept · {ledgerCase.concept}</div>
        <h2 style={{
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: 'clamp(28px, 3vw, 40px)', color: '#1a1a1a',
          letterSpacing: '0.02em', lineHeight: 1, margin: '0 0 16px',
          textTransform: 'uppercase',
        }}>{ledgerCase.title}</h2>
        <p style={{
          fontFamily: 'Garamond, serif', fontStyle: 'italic',
          fontSize: '14px', color: '#3a2818', lineHeight: 1.5, margin: 0,
        }}>{ledgerCase.mechanic}</p>
      </div>
      <div style={{
        padding: '36px 32px 28px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '24px',
      }}>
        <div style={{
          padding: '14px 28px', border: '4px solid #8B0000',
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: '24px', letterSpacing: '0.16em', color: '#8B0000',
          textTransform: 'uppercase', transform: 'rotate(-6deg)',
          background: 'rgba(232,223,200,0.4)', fontWeight: 700,
        }}>Coming Soon</div>
      </div>
    </div>
  )
}

function rgb(hex: string): string {
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `${r},${g},${b}`
}
