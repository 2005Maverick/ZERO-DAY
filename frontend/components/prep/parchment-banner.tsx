'use client'

interface ParchmentBannerProps {
  scenarioId: string
  scenarioDate: string                   // '9 March MMXX'
  bellInLabel: string                    // '58 minutes, 24 seconds'
}

/**
 * Top header strip — slate dark with burnished-amber accents.
 * No parchment, no perspective, no plank. Clean, readable.
 */
export function ParchmentBanner({
  scenarioId, scenarioDate, bellInLabel,
}: ParchmentBannerProps) {
  return (
    <div style={{
      position: 'relative',
      margin: '20px auto 0',
      width: 'min(72vw, 880px)',
      padding: '14px 26px',
      background: 'linear-gradient(180deg, #1A2028 0%, #11161D 100%)',
      border: '1px solid rgba(212,160,77,0.32)',
      borderRadius: '6px',
      boxShadow: '0 12px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
    }}>
      {/* Side amber rules */}
      <span style={{
        position: 'absolute',
        left: '14px', top: '50%', transform: 'translateY(-50%)',
        width: '20px', height: '1px',
        background: 'linear-gradient(90deg, transparent, #D4A04D)',
      }} />
      <span style={{
        position: 'absolute',
        right: '14px', top: '50%', transform: 'translateY(-50%)',
        width: '20px', height: '1px',
        background: 'linear-gradient(270deg, transparent, #D4A04D)',
      }} />

      {/* Title */}
      <div style={{
        fontFamily: 'var(--font-cormorant-sc), serif',
        fontWeight: 700,
        fontSize: '20px',
        letterSpacing: '0.18em',
        color: '#F4EDE0',
        textShadow: '0 1px 0 rgba(0,0,0,0.6)',
        whiteSpace: 'nowrap',
      }}>
        THE LEDGER
        <span style={{ color: '#D4A04D', margin: '0 10px' }}>·</span>
        DOSSIER {scenarioId}
        <span style={{ color: '#D4A04D', margin: '0 10px' }}>·</span>
        {scenarioDate}
      </div>

      {/* Subtitle */}
      <div style={{
        fontFamily: 'var(--font-eb-garamond), serif',
        fontStyle: 'italic',
        fontSize: '12px',
        color: '#A89A7E',
        whiteSpace: 'nowrap',
      }}>
        Pre-market opens in {bellInLabel}. Six dossiers selected for review.
      </div>
    </div>
  )
}
