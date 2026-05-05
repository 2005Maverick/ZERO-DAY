'use client'

import { useState } from 'react'

interface WaxSealButtonProps {
  label: string
  onClick?: () => void
  /** Slightly different presentation when used as the main CTA */
  variant?: 'primary' | 'secondary'
}

/**
 * Wax-seal CTA button.
 * Visual: a circular red wax stamp embossed with "Z·D·M", sitting partially
 * overlapping a label tab. On hover, the seal lifts slightly and the crack widens.
 */
export function WaxSealButton({ label, onClick, variant = 'primary' }: WaxSealButtonProps) {
  const [hover, setHover] = useState(false)

  const isPrimary = variant === 'primary'

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0',
        padding: 0,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'inherit',
        fontFamily: 'inherit',
      }}
    >
      {/* Label tab */}
      <span style={{
        position: 'relative',
        padding: '14px 28px 14px 32px',
        background: isPrimary
          ? 'linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%)'
          : 'rgba(232,223,200,0.08)',
        border: isPrimary ? 'none' : '1px solid rgba(139,0,0,0.4)',
        color: isPrimary ? '#FFF' : '#8B0000',
        fontFamily: 'var(--font-anton), sans-serif',
        fontSize: '14px',
        letterSpacing: '0.22em',
        fontWeight: 700,
        textTransform: 'uppercase',
        boxShadow: isPrimary ? '0 4px 12px rgba(139,0,0,0.45)' : 'none',
        transition: 'transform 0.25s, box-shadow 0.25s',
        transform: hover ? 'translateX(-2px)' : 'translateX(0)',
        marginLeft: '24px',  // overlapped by the seal
      }}>
        {label}
      </span>

      {/* Wax seal */}
      <span style={{
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: hover
          ? 'translate(0, -50%) rotate(-8deg) scale(1.06)'
          : 'translate(0, -50%) rotate(-6deg) scale(1)',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #B91C1C 0%, #7F1D1D 50%, #450A0A 100%)',
        boxShadow: hover
          ? '0 6px 16px rgba(220,38,38,0.55), inset 0 -3px 6px rgba(0,0,0,0.45), inset 0 2px 3px rgba(255,255,255,0.08)'
          : '0 4px 10px rgba(220,38,38,0.4), inset 0 -3px 6px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-anton), sans-serif',
        fontSize: '11px',
        color: '#2A0A0A',
        letterSpacing: '0.04em',
        fontWeight: 700,
        zIndex: 2,
        transition: 'transform 0.3s, box-shadow 0.3s',
      }}>
        Z·D·M
        {/* Crack line */}
        <span style={{
          position: 'absolute',
          top: '15%',
          left: '38%',
          width: hover ? '3.5px' : '2.5px',
          height: '52%',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.25))',
          transform: 'rotate(18deg)',
          borderRadius: '2px',
          transition: 'width 0.3s',
        }} />
        {/* Drip */}
        <span style={{
          position: 'absolute',
          bottom: '-4px',
          right: '20%',
          width: '6px',
          height: '8px',
          background: '#7F1D1D',
          borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%',
        }} />
      </span>
    </button>
  )
}
