'use client'

import type { SimulationCase } from '@/types/ledger'
import { WaxSealButton } from '../wax-seal-button'

interface Props {
  ledgerCase: SimulationCase
  onOpen?: () => void
}

/**
 * Hand-drawn pencil-style chart for the case file (top-left page).
 * SVG with a falling-knife trajectory + annotation text.
 */
function HandDrawnChart() {
  return (
    <svg viewBox="0 0 320 140" style={{ width: '100%', height: 'auto' }}>
      {/* Subtle grid */}
      <line x1="0"   y1="35"  x2="320" y2="35"  stroke="#1a1a1a" strokeWidth="0.4" strokeDasharray="2 3" opacity="0.3" />
      <line x1="0"   y1="70"  x2="320" y2="70"  stroke="#1a1a1a" strokeWidth="0.4" strokeDasharray="2 3" opacity="0.3" />
      <line x1="0"   y1="105" x2="320" y2="105" stroke="#1a1a1a" strokeWidth="0.4" strokeDasharray="2 3" opacity="0.3" />

      {/* Falling-knife price path (graphite hand-drawn feel) */}
      <path
        d="M 8 20 L 30 22 L 50 28 L 72 38 L 92 52 L 110 60 L 130 75 L 152 88 L 170 95 L 188 102 L 208 110 L 230 115 L 252 122 L 272 124 L 295 128"
        stroke="#1a1a1a"
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Annotation 1: "$4.12 - knife already falling" */}
      <text x="115" y="48" style={{ fontFamily: 'Garamond, serif', fontStyle: 'italic', fontSize: '10px', fill: '#1a1a1a' }}>
        $4.12 — knife already falling
      </text>
      <line x1="155" y1="50" x2="148" y2="60" stroke="#1a1a1a" strokeWidth="0.6" />

      {/* Annotation 2: MARGIN CALL */}
      <text x="170" y="78" style={{ fontFamily: 'Garamond, serif', fontStyle: 'italic', fontSize: '9px', fill: '#1a1a1a', letterSpacing: '0.06em' }}>
        MARGIN
      </text>
      <text x="170" y="89" style={{ fontFamily: 'Garamond, serif', fontStyle: 'italic', fontSize: '9px', fill: '#1a1a1a', letterSpacing: '0.06em' }}>
        CALL
      </text>
      <line x1="186" y1="86" x2="200" y2="103" stroke="#1a1a1a" strokeWidth="0.6" />

      {/* Annotation 3: arrow with second margin call */}
      <text x="60" y="78" style={{ fontFamily: 'Garamond, serif', fontStyle: 'italic', fontSize: '9px', fill: '#1a1a1a', letterSpacing: '0.06em' }}>
        MARGIN
      </text>
      <text x="60" y="89" style={{ fontFamily: 'Garamond, serif', fontStyle: 'italic', fontSize: '9px', fill: '#1a1a1a', letterSpacing: '0.06em' }}>
        CALL
      </text>
      <line x1="76" y1="86" x2="68" y2="48" stroke="#1a1a1a" strokeWidth="0.6" />

      {/* Tiny tick marks on axis */}
      {[0, 80, 160, 240, 310].map(x => (
        <line key={x} x1={x} y1="135" x2={x} y2="138" stroke="#1a1a1a" strokeWidth="0.4" />
      ))}
    </svg>
  )
}

export function SimulationCaseRenderer({ ledgerCase, onOpen }: Props) {
  const isLocked = ledgerCase.status === 'locked' || ledgerCase.status === 'coming-soon'

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      width: '100%',
      height: '100%',
      gap: 0,
    }}>
      {/* ════════ LEFT PAGE — CASE FILE DOSSIER ════════ */}
      <div style={{
        position: 'relative',
        padding: '36px 32px 28px',
        borderRight: '1px solid rgba(60, 30, 15, 0.18)',  // subtle spine seam
        opacity: isLocked ? 0.55 : 1,
      }}>
        {/* "CASE FILE №042" header */}
        <div style={{
          fontFamily: '"Big Caslon", Caslon, Garamond, serif',
          fontStyle: 'italic',
          fontSize: '22px',
          color: '#1a1a1a',
          letterSpacing: '0.02em',
          marginBottom: '18px',
        }}>
          CASE FILE № {ledgerCase.number.toString().padStart(3, '0')}
        </div>

        {/* Hand-stamped date — top-right, slightly rotated */}
        <div style={{
          position: 'absolute',
          top: '34px',
          right: '32px',
          padding: '6px 14px',
          border: '2px solid #8B0000',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '13px',
          fontWeight: 700,
          color: '#8B0000',
          letterSpacing: '0.06em',
          transform: 'rotate(3deg)',
          background: 'rgba(232,223,200,0.6)',
        }}>
          {ledgerCase.date}
        </div>

        {/* Hand-drawn chart */}
        <div style={{
          marginTop: '20px',
          marginBottom: '20px',
        }}>
          <HandDrawnChart />
        </div>

        {/* Pasted newspaper clipping */}
        <div style={{
          background: '#D8C8A8',
          padding: '12px 14px',
          marginBottom: '20px',
          transform: 'rotate(-0.6deg)',
          boxShadow: '2px 3px 6px rgba(0,0,0,0.18)',
          fontFamily: 'Times, "Times New Roman", serif',
          fontSize: '14px',
          fontWeight: 700,
          color: '#1a1a1a',
          lineHeight: 1.25,
          letterSpacing: '0.01em',
        }}>
          {ledgerCase.clippingHeadline}
        </div>

        {/* Operative tags — string-tied labels */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '14px',
        }}>
          {ledgerCase.operativeTags.map(tag => (
            <span key={tag} style={{
              position: 'relative',
              padding: '6px 12px',
              background: '#E8DFC8',
              border: '1px solid rgba(60, 30, 15, 0.4)',
              fontFamily: '"Big Caslon", Caslon, Garamond, serif',
              fontStyle: 'italic',
              fontSize: '11px',
              color: '#1a1a1a',
              letterSpacing: '0.04em',
            }}>
              {tag}
              {/* String hole */}
              <span style={{
                position: 'absolute',
                left: '-3px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '4px',
                height: '4px',
                background: '#8B0000',
                borderRadius: '50%',
              }} />
            </span>
          ))}
        </div>
      </div>

      {/* ════════ RIGHT PAGE — ENGAGEMENT CARD ════════ */}
      <div style={{
        position: 'relative',
        padding: '36px 32px 28px',
        opacity: isLocked ? 0.55 : 1,
      }}>
        {/* Top eyebrow */}
        <div style={{
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '10px',
          letterSpacing: '0.28em',
          color: '#8B0000',
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: '12px',
        }}>
          The Brief
        </div>

        {/* Display headline */}
        <h2 style={{
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: 'clamp(32px, 3.4vw, 44px)',
          color: '#1a1a1a',
          lineHeight: 0.98,
          letterSpacing: '0.02em',
          margin: '0 0 14px',
          textTransform: 'uppercase',
        }}>
          {ledgerCase.title}
        </h2>

        {/* Italic subtitle */}
        <p style={{
          fontFamily: 'Garamond, "EB Garamond", "Times New Roman", serif',
          fontStyle: 'italic',
          fontSize: '15px',
          color: '#3a2818',
          lineHeight: 1.45,
          margin: '0 0 22px',
        }}>
          {ledgerCase.hookLine}
        </p>

        {/* Meta rows: DURATION / STARTING WALLET / REWARD */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
          padding: '14px 0',
          borderTop: '1px solid rgba(60, 30, 15, 0.25)',
          borderBottom: '1px solid rgba(60, 30, 15, 0.25)',
          marginBottom: '18px',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '9px',
              letterSpacing: '0.22em',
              color: 'rgba(60, 30, 15, 0.6)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '4px',
            }}>Duration</div>
            <div style={{
              fontFamily: 'var(--font-anton), sans-serif',
              fontSize: '20px',
              color: '#1a1a1a',
              letterSpacing: '0.02em',
            }}>
              {ledgerCase.durationMin} minutes
            </div>
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '9px',
              letterSpacing: '0.22em',
              color: 'rgba(60, 30, 15, 0.6)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '4px',
            }}>Starting Wallet</div>
            <div style={{
              fontFamily: 'var(--font-anton), sans-serif',
              fontSize: '20px',
              color: '#1a1a1a',
              letterSpacing: '0.02em',
            }}>
              ₹1,00,000
            </div>
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '9px',
              letterSpacing: '0.22em',
              color: 'rgba(60, 30, 15, 0.6)',
              textTransform: 'uppercase',
              fontWeight: 600,
              marginBottom: '4px',
            }}>Reward</div>
            <div style={{
              fontFamily: 'var(--font-anton), sans-serif',
              fontSize: '20px',
              color: '#1a1a1a',
              letterSpacing: '0.02em',
            }}>
              +{ledgerCase.reward.xp} XP · {ledgerCase.reward.rules} RULES
            </div>
          </div>
        </div>

        {/* Body copy */}
        <p style={{
          fontFamily: 'Garamond, "EB Garamond", "Times New Roman", serif',
          fontSize: '13px',
          color: '#3a2818',
          lineHeight: 1.6,
          margin: '0 0 32px',
        }}>
          {ledgerCase.body}
        </p>

        {/* CTA — wax seal button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: 'auto',
        }}>
          {isLocked ? (
            <span style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.22em',
              color: '#8B0000',
              padding: '10px 18px',
              border: '1.5px solid #8B0000',
              textTransform: 'uppercase',
            }}>
              Locked · Coming Soon
            </span>
          ) : (
            <WaxSealButton label="Open Case →" onClick={onOpen} />
          )}
        </div>
      </div>
    </div>
  )
}
