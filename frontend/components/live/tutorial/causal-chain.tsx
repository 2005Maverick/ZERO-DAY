'use client'

interface Node {
  label: string
  detail: string
  delta: string
  color: string
}

const CHAIN: Node[] = [
  { label: 'BRENT CRUDE OIL',  detail: 'Saudi–Russia talks collapsed overnight',                delta: '−30%', color: '#D4A04D' },
  { label: 'ENERGY SECTOR',    detail: 'Reliance, ONGC, BPCL — all directly hit',               delta: '−7%',  color: '#E11D48' },
  { label: 'NIFTY 50 INDEX',   detail: 'Reliance alone is ~10% of NIFTY weight',                delta: '−5%',  color: '#FF1F1F' },
  { label: 'EVERY OTHER STOCK', detail: 'Sympathy selling, fund redemptions, panic',            delta: '−4 to −9%', color: '#8B0000' },
]

export function CausalChainBlock() {
  return (
    <div style={{
      marginTop: '14px',
      padding: '18px 20px',
      background: 'rgba(255,31,31,0.04)',
      border: '1px solid rgba(255,31,31,0.20)',
      borderRadius: '8px',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '9px', fontWeight: 800, color: '#FF1F1F',
        letterSpacing: '0.22em', textTransform: 'uppercase',
        marginBottom: '14px', textAlign: 'center',
      }}>
        Today's Cascade — Read Top to Bottom
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {CHAIN.map((node, i) => (
          <div key={node.label}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '10px 12px',
              background: 'rgba(0,0,0,0.5)',
              border: `1px solid ${node.color}55`,
              borderLeft: `3px solid ${node.color}`,
              borderRadius: '4px',
            }}>
              <div style={{
                width: '28px', height: '28px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${node.color}18`,
                border: `1px solid ${node.color}55`,
                borderRadius: '4px',
                fontFamily: 'var(--font-jetbrains), monospace',
                fontSize: '11px', fontWeight: 800, color: node.color,
                flexShrink: 0,
              }}>{i + 1}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontSize: '11.5px', fontWeight: 700,
                  color: '#E0E0E0', letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>{node.label}</div>
                <div style={{
                  fontFamily: 'var(--font-fraunces), serif',
                  fontSize: '11.5px', color: '#909090',
                  marginTop: '2px', lineHeight: 1.4,
                }}>{node.detail}</div>
              </div>
              <div style={{
                fontFamily: 'var(--font-jetbrains), monospace',
                fontSize: '13px', fontWeight: 800, color: node.color,
                flexShrink: 0,
              }}>{node.delta}</div>
            </div>
            {i < CHAIN.length - 1 && (
              <div style={{
                height: '20px',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                position: 'relative',
              }}>
                <div style={{
                  width: '2px', height: '100%',
                  background: `linear-gradient(180deg, ${node.color}88, ${CHAIN[i + 1].color}88)`,
                }}/>
                <div style={{
                  position: 'absolute', bottom: '2px',
                  width: 0, height: 0,
                  borderLeft: '5px solid transparent',
                  borderRight: '5px solid transparent',
                  borderTop: `7px solid ${CHAIN[i + 1].color}`,
                }}/>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '14px', padding: '10px 12px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '4px',
        fontFamily: 'var(--font-fraunces), serif',
        fontStyle: 'italic',
        fontSize: '12px', color: '#A0A0A0', lineHeight: 1.55,
        textAlign: 'center',
      }}>
        Key insight: a stock can fall sharply without any bad news about that stock specifically.
        It's being dragged by its index, sector, or the broader market mood.
      </div>
    </div>
  )
}
