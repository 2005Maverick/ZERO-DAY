'use client'

import { ArrowRight } from 'lucide-react'

interface EnterLiveCTAProps {
  fullyStudied: number
  total: number
  onEnter: () => void
}

/**
 * Bottom primary CTA — "Bell Rings In 60s · Enter Live Market".
 * Always available (research is encouraged but not gated).
 * When ALL stocks fully studied, button gets a celebratory glow.
 */
export function EnterLiveCTA({ fullyStudied, total, onEnter }: EnterLiveCTAProps) {
  const allDone = fullyStudied >= total
  return (
    <button
      onClick={onEnter}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 26px',
        background: allDone
          ? 'linear-gradient(180deg, #C0344B 0%, #8B2545 100%)'
          : 'linear-gradient(180deg, #2A1F18 0%, #1A1208 100%)',
        border: allDone ? '1px solid #D4A04D' : '1px solid rgba(212,160,77,0.4)',
        borderRadius: '8px',
        color: '#F4EDE0',
        fontFamily: 'var(--font-fraunces), serif',
        fontWeight: 600,
        fontSize: '15px',
        letterSpacing: '0.06em',
        cursor: 'pointer',
        boxShadow: allDone
          ? '0 12px 28px rgba(139,37,69,0.55), 0 0 28px rgba(212,160,77,0.30), inset 0 1px 0 rgba(255,255,255,0.18)'
          : '0 6px 14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,160,77,0.10)',
        textShadow: '0 1px 0 rgba(0,0,0,0.5)',
        transition: 'transform 0.18s, box-shadow 0.18s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{
          fontFamily: 'var(--font-inter), sans-serif',
          fontSize: '10px',
          color: '#D4A04D',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontWeight: 700,
        }}>
          {allDone ? '✦ All Studied — Ready' : 'Bell Rings In 60s'}
        </span>
        <span style={{ marginTop: '2px' }}>
          Enter Live Market
        </span>
      </div>
      <ArrowRight size={20} strokeWidth={2.4} />
    </button>
  )
}
