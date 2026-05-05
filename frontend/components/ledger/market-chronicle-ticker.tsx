'use client'

const TICKER_ITEMS = [
  'Market Chronicle',
  'Vol XII',
  'Nifty 22,475 ↑',
  "Today's Brief: Covid Day Zero",
  'New case opens Thursday',
  'Brexit Night reaches 1,200 reads',
  'Sensex 73,212 ↓',
  'Operator P. completes Lehman Collapse',
  'BTC/USD 67,341 ↑',
  'Volume IV unlocks at Tier 4',
]

export function MarketChronicleTicker() {
  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      width: '100%',
      height: '40px',
      borderTop: '1px solid rgba(220,38,38,0.25)',
      background: 'linear-gradient(180deg, rgba(20,12,4,0.92), rgba(8,4,0,0.95))',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      zIndex: 20,
    }}>
      {/* Edge fades */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px',
        zIndex: 2,
        background: 'linear-gradient(90deg, rgba(8,4,0,1), transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px',
        zIndex: 2,
        background: 'linear-gradient(270deg, rgba(8,4,0,1), transparent)',
        pointerEvents: 'none',
      }} />

      {/* Scrolling content */}
      <div style={{
        display: 'flex',
        gap: '36px',
        whiteSpace: 'nowrap',
        animation: 'chronicle-scroll 60s linear infinite',
        paddingLeft: '20px',
      }}>
        {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span key={i} style={{
            fontFamily: '"Big Caslon", Caslon, Garamond, "Times New Roman", serif',
            fontStyle: 'italic',
            fontSize: '12px',
            color: 'rgba(232,223,200,0.62)',
            letterSpacing: '0.05em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '32px',
          }}>
            {item}
            <span style={{ color: 'rgba(220,38,38,0.45)', fontWeight: 700 }}>—</span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes chronicle-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}
