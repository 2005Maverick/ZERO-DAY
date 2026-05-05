'use client'

import { ArrowRight } from 'lucide-react'

interface DeployWaxSealProps {
  pct: number
  onClick: () => void
}

const MIN_DEPLOY_PCT = 0.95

/**
 * Deploy CTA — modern amber/burgundy ceremonial button.
 * Locked: dark with "Allocate N% More" message.
 */
export function DeployWaxSeal({ pct, onClick }: DeployWaxSealProps) {
  const canDeploy = pct >= MIN_DEPLOY_PCT
  const remaining = Math.max(0, MIN_DEPLOY_PCT - pct)

  return (
    <button
      onClick={canDeploy ? onClick : undefined}
      disabled={!canDeploy}
      title={canDeploy ? 'Deploy positions' : `Allocate ${Math.ceil(remaining * 100)}% more to deploy`}
      style={{
        position: 'relative',
        width: '100%',
        padding: '16px 22px',
        background: canDeploy
          ? 'linear-gradient(180deg, #C0344B 0%, #8B2545 100%)'
          : 'linear-gradient(180deg, #1A2028 0%, #11161D 100%)',
        border: canDeploy
          ? '1px solid #D4A04D'
          : '1px solid rgba(212,160,77,0.18)',
        borderRadius: '8px',
        color: canDeploy ? '#F4EDE0' : '#5C5849',
        fontFamily: 'var(--font-cormorant-sc), serif',
        fontWeight: 700,
        fontSize: '14px',
        letterSpacing: '0.24em',
        textTransform: 'uppercase',
        cursor: canDeploy ? 'pointer' : 'not-allowed',
        boxShadow: canDeploy
          ? '0 12px 24px rgba(139,37,69,0.45), 0 0 24px rgba(212,160,77,0.20), inset 0 1px 0 rgba(255,255,255,0.18)'
          : '0 6px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)',
        textShadow: canDeploy ? '0 1px 0 rgba(0,0,0,0.4)' : 'none',
        transition: 'transform 0.15s, box-shadow 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}
      onMouseEnter={e => {
        if (canDeploy) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 16px 30px rgba(139,37,69,0.55), 0 0 30px rgba(212,160,77,0.30), inset 0 1px 0 rgba(255,255,255,0.18)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = ''
        if (canDeploy) {
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(139,37,69,0.45), 0 0 24px rgba(212,160,77,0.20), inset 0 1px 0 rgba(255,255,255,0.18)'
        }
      }}
    >
      {/* Wax seal icon */}
      <SealIcon canDeploy={canDeploy} />
      <span style={{ flex: 1, textAlign: 'left' }}>
        {canDeploy ? 'Deploy Positions' : `Allocate ${Math.ceil(remaining * 100)}% More`}
      </span>
      {canDeploy && <ArrowRight size={16} />}
    </button>
  )
}

function SealIcon({ canDeploy }: { canDeploy: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" style={{ flexShrink: 0 }}>
      <defs>
        <radialGradient id="seal-mini-grad" cx="35%" cy="30%">
          <stop offset="0%"  stopColor={canDeploy ? '#F4EDE0' : '#3A3128'} stopOpacity="0.55"/>
          <stop offset="55%" stopColor={canDeploy ? '#D4A04D' : '#3A3128'}/>
          <stop offset="100%" stopColor={canDeploy ? '#7A4A1A' : '#1A1612'}/>
        </radialGradient>
      </defs>
      <circle cx="14" cy="14" r="11"
              fill="url(#seal-mini-grad)"
              stroke={canDeploy ? '#F4EDE0' : '#5C5849'}
              strokeWidth="0.8"
              opacity={canDeploy ? 1 : 0.6}/>
      <text x="14" y="17"
            textAnchor="middle"
            fontFamily="var(--font-cinzel), serif"
            fontWeight="700"
            fontSize="7"
            letterSpacing="0.6"
            fill={canDeploy ? '#3A0C18' : '#5C5849'}>
        ZDM
      </text>
    </svg>
  )
}
