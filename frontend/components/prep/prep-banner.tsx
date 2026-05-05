'use client'

interface PrepBannerProps {
  scenarioId: string
  scenarioDate: string
  bellInLabel: string
}

/**
 * Top header — large readable typography on dark slate.
 *   Display: Fraunces (modern variable serif)
 *   UI: Inter
 *   Numbers: JetBrains Mono
 */
export function PrepBanner({ scenarioId, scenarioDate, bellInLabel }: PrepBannerProps) {
  return (
    <div style={{
      position: 'relative',
      margin: '24px auto 0',
      width: 'min(80vw, 980px)',
      padding: '20px 32px',
      background: 'linear-gradient(180deg, #1A2028 0%, #11161D 100%)',
      border: '1px solid rgba(212,160,77,0.32)',
      borderRadius: '8px',
      boxShadow: '0 14px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
    }}>
      <span style={{
        position: 'absolute',
        left: '20px', top: '50%', transform: 'translateY(-50%)',
        width: '24px', height: '1px',
        background: 'linear-gradient(90deg, transparent, #D4A04D)',
      }} />
      <span style={{
        position: 'absolute',
        right: '20px', top: '50%', transform: 'translateY(-50%)',
        width: '24px', height: '1px',
        background: 'linear-gradient(270deg, transparent, #D4A04D)',
      }} />

      <div style={{
        fontFamily: 'var(--font-fraunces), serif',
        fontWeight: 600,
        fontSize: '28px',
        letterSpacing: '0.06em',
        color: '#F4EDE0',
        textShadow: '0 1px 0 rgba(0,0,0,0.6)',
        whiteSpace: 'nowrap',
      }}>
        The Ledger
        <span style={{ color: '#D4A04D', margin: '0 14px', fontWeight: 400 }}>·</span>
        <span style={{ fontStyle: 'italic', fontWeight: 500 }}>Dossier {scenarioId}</span>
        <span style={{ color: '#D4A04D', margin: '0 14px', fontWeight: 400 }}>·</span>
        {scenarioDate}
      </div>

      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '14px',
        color: '#A89A7E',
        fontStyle: 'italic',
        whiteSpace: 'nowrap',
      }}>
        Pre-market opens in <span style={{ color: '#D4A04D', fontWeight: 600, fontStyle: 'normal' }}>{bellInLabel}</span>. Six dossiers selected for review.
      </div>
    </div>
  )
}
