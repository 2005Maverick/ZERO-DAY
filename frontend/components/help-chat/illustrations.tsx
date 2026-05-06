'use client'

// Curated inline-SVG illustrations the chatbot can return via [img:slug] tokens.
// Self-contained — no external image hosting needed.

interface IllustrationDef {
  slug: string
  title: string
  caption: string
  render: () => React.ReactNode
}

// Helper: render a candle
function Candle({ x, y, w, h, open, close, high, low, scaleY, color }: {
  x: number; y: number; w: number; h: number
  open: number; close: number; high: number; low: number
  scaleY: (v: number) => number
  color: string
}) {
  const yHi = scaleY(high), yLo = scaleY(low)
  const yOpen = scaleY(open), yClose = scaleY(close)
  const yTop = Math.min(yOpen, yClose)
  const bodyH = Math.max(2, Math.abs(yClose - yOpen))
  return (
    <g>
      <line x1={x + w / 2} x2={x + w / 2} y1={yHi} y2={yLo} stroke={color} strokeWidth="1.5"/>
      <rect x={x} y={yTop} width={w} height={bodyH} fill={color}/>
    </g>
  )
}

const ILLUSTRATIONS: IllustrationDef[] = [
  // ── Candle patterns ───────────────────────────────────────
  {
    slug: 'hammer',
    title: 'Hammer',
    caption: 'Bullish reversal — small body at top, long lower wick.',
    render: () => (
      <svg viewBox="0 0 200 220" style={{ width: '100%', height: 'auto' }}>
        <line x1="100" x2="100" y1="40" y2="180" stroke="#10B981" strokeWidth="2"/>
        <rect x="80" y="40" width="40" height="30" fill="#10B981"/>
        <text x="100" y="210" fill="#A0A0A0" fontSize="11" fontFamily="var(--font-jetbrains), monospace" textAnchor="middle">HAMMER</text>
      </svg>
    ),
  },
  {
    slug: 'doji',
    title: 'Doji',
    caption: 'Indecision — open ≈ close, long wicks both sides.',
    render: () => (
      <svg viewBox="0 0 200 220" style={{ width: '100%', height: 'auto' }}>
        <line x1="100" x2="100" y1="40" y2="180" stroke="#D4A04D" strokeWidth="2"/>
        <line x1="80" x2="120" y1="110" y2="110" stroke="#D4A04D" strokeWidth="3"/>
        <text x="100" y="210" fill="#A0A0A0" fontSize="11" fontFamily="var(--font-jetbrains), monospace" textAnchor="middle">DOJI</text>
      </svg>
    ),
  },
  {
    slug: 'shooting-star',
    title: 'Shooting Star',
    caption: 'Bearish reversal — small body at bottom, long upper wick.',
    render: () => (
      <svg viewBox="0 0 200 220" style={{ width: '100%', height: 'auto' }}>
        <line x1="100" x2="100" y1="40" y2="180" stroke="#FF1F1F" strokeWidth="2"/>
        <rect x="80" y="150" width="40" height="30" fill="#FF1F1F"/>
        <text x="100" y="210" fill="#A0A0A0" fontSize="11" fontFamily="var(--font-jetbrains), monospace" textAnchor="middle">SHOOTING STAR</text>
      </svg>
    ),
  },
  {
    slug: 'bullish-engulfing',
    title: 'Bullish Engulfing',
    caption: 'Strong reversal — large green candle engulfs the prior red.',
    render: () => (
      <svg viewBox="0 0 240 220" style={{ width: '100%', height: 'auto' }}>
        <line x1="80" x2="80" y1="60" y2="160" stroke="#FF1F1F" strokeWidth="2"/>
        <rect x="65" y="100" width="30" height="50" fill="#FF1F1F"/>
        <line x1="160" x2="160" y1="40" y2="180" stroke="#10B981" strokeWidth="2"/>
        <rect x="135" y="60" width="50" height="100" fill="#10B981"/>
        <text x="120" y="210" fill="#A0A0A0" fontSize="11" fontFamily="var(--font-jetbrains), monospace" textAnchor="middle">BULLISH ENGULFING</text>
      </svg>
    ),
  },

  // ── Chart patterns ────────────────────────────────────────
  {
    slug: 'head-shoulders',
    title: 'Head and Shoulders',
    caption: 'Three-peak bearish reversal pattern. Break the neckline = entry.',
    render: () => (
      <svg viewBox="0 0 300 200" style={{ width: '100%', height: 'auto' }}>
        <polyline points="20,150 60,90 90,120 130,50 170,120 210,90 250,150" fill="none" stroke="#3B82F6" strokeWidth="2"/>
        <line x1="60" x2="210" y1="100" y2="100" stroke="#FF1F1F" strokeDasharray="3 3" strokeWidth="1"/>
        <text x="60" y="80" fill="#A0A0A0" fontSize="9" textAnchor="middle">L</text>
        <text x="130" y="40" fill="#A0A0A0" fontSize="9" textAnchor="middle">HEAD</text>
        <text x="210" y="80" fill="#A0A0A0" fontSize="9" textAnchor="middle">R</text>
        <text x="220" y="115" fill="#FF1F1F" fontSize="9">neckline</text>
        <text x="150" y="190" fill="#A0A0A0" fontSize="11" fontFamily="var(--font-jetbrains), monospace" textAnchor="middle">HEAD AND SHOULDERS</text>
      </svg>
    ),
  },
  {
    slug: 'double-top',
    title: 'Double Top',
    caption: 'Two equal peaks — bearish reversal when the valley breaks down.',
    render: () => (
      <svg viewBox="0 0 300 200" style={{ width: '100%', height: 'auto' }}>
        <polyline points="20,160 80,60 130,120 180,60 240,160" fill="none" stroke="#3B82F6" strokeWidth="2"/>
        <line x1="80" x2="180" y1="50" y2="50" stroke="#FF1F1F" strokeDasharray="3 3" strokeWidth="1"/>
        <line x1="20" x2="240" y1="120" y2="120" stroke="#FF1F1F" strokeDasharray="3 3" strokeWidth="1"/>
        <text x="240" y="115" fill="#FF1F1F" fontSize="9">neckline</text>
        <text x="150" y="190" fill="#A0A0A0" fontSize="11" fontFamily="var(--font-jetbrains), monospace" textAnchor="middle">DOUBLE TOP</text>
      </svg>
    ),
  },
  {
    slug: 'cup-handle',
    title: 'Cup and Handle',
    caption: 'Bullish continuation — rounded cup followed by a small pullback.',
    render: () => (
      <svg viewBox="0 0 300 200" style={{ width: '100%', height: 'auto' }}>
        <path d="M 30 60 Q 30 160 110 160 Q 190 160 190 60 L 220 70 L 250 90 L 280 60" fill="none" stroke="#10B981" strokeWidth="2"/>
        <line x1="30" x2="280" y1="60" y2="60" stroke="#FF1F1F" strokeDasharray="3 3" strokeWidth="1"/>
        <text x="280" y="55" fill="#FF1F1F" fontSize="9" textAnchor="end">resistance</text>
        <text x="150" y="190" fill="#A0A0A0" fontSize="11" fontFamily="var(--font-jetbrains), monospace" textAnchor="middle">CUP &amp; HANDLE</text>
      </svg>
    ),
  },
  {
    slug: 'bull-flag',
    title: 'Bull Flag',
    caption: 'Sharp uptrend (pole), tight pullback (flag), then continuation up.',
    render: () => (
      <svg viewBox="0 0 300 200" style={{ width: '100%', height: 'auto' }}>
        <polyline points="20,170 80,40" fill="none" stroke="#10B981" strokeWidth="2.5"/>
        <polyline points="80,40 120,75 160,55 200,90 240,70" fill="none" stroke="#3B82F6" strokeWidth="2"/>
        <polyline points="240,70 290,20" fill="none" stroke="#10B981" strokeWidth="2.5" strokeDasharray="4 3"/>
        <line x1="80" x2="240" y1="35" y2="55" stroke="#A0A0A0" strokeDasharray="2 2"/>
        <line x1="80" x2="240" y1="80" y2="100" stroke="#A0A0A0" strokeDasharray="2 2"/>
        <text x="50" y="100" fill="#10B981" fontSize="9">pole</text>
        <text x="150" y="115" fill="#3B82F6" fontSize="9">flag</text>
        <text x="150" y="190" fill="#A0A0A0" fontSize="11" fontFamily="var(--font-jetbrains), monospace" textAnchor="middle">BULL FLAG</text>
      </svg>
    ),
  },

  // ── Concepts ──────────────────────────────────────────────
  {
    slug: 'stop-loss',
    title: 'Stop Loss Placement',
    caption: 'Define max loss BEFORE entry. Position size = max-loss ÷ stop-distance.',
    render: () => (
      <svg viewBox="0 0 320 200" style={{ width: '100%', height: 'auto' }}>
        <line x1="20" x2="300" y1="80" y2="80" stroke="#10B981" strokeDasharray="4 3"/>
        <text x="305" y="84" fill="#10B981" fontSize="10">entry ₹500</text>
        <line x1="20" x2="300" y1="140" y2="140" stroke="#FF1F1F" strokeDasharray="4 3"/>
        <text x="305" y="144" fill="#FF1F1F" fontSize="10">stop ₹475</text>
        <polyline points="20,75 60,82 100,72 140,90 180,85 220,92 260,138" fill="none" stroke="#3B82F6" strokeWidth="2"/>
        <circle cx="260" cy="138" r="6" fill="none" stroke="#FF1F1F" strokeWidth="2">
          <animate attributeName="r" values="4;10;4" dur="1.6s" repeatCount="indefinite"/>
        </circle>
        <text x="160" y="190" fill="#A0A0A0" fontSize="11" fontFamily="var(--font-jetbrains), monospace" textAnchor="middle">STOP LOSS · RISK ₹2,000 / 200 SHARES</text>
      </svg>
    ),
  },
  {
    slug: 'risk-reward',
    title: 'Risk vs Reward (3:1)',
    caption: 'For every ₹1 you risk, target ₹3 of profit. The math behind survival.',
    render: () => (
      <svg viewBox="0 0 320 200" style={{ width: '100%', height: 'auto' }}>
        <line x1="20" x2="300" y1="100" y2="100" stroke="#909090" strokeDasharray="2 4"/>
        <text x="20" y="95" fill="#909090" fontSize="10">entry</text>
        <line x1="20" x2="300" y1="40" y2="40" stroke="#10B981" strokeDasharray="3 3"/>
        <text x="305" y="44" fill="#10B981" fontSize="10">target +₹30</text>
        <line x1="20" x2="300" y1="120" y2="120" stroke="#FF1F1F" strokeDasharray="3 3"/>
        <text x="305" y="124" fill="#FF1F1F" fontSize="10">stop −₹10</text>
        <rect x="200" y="40" width="20" height="60" fill="#10B981" opacity="0.5"/>
        <rect x="200" y="100" width="20" height="20" fill="#FF1F1F" opacity="0.5"/>
        <text x="225" y="72" fill="#10B981" fontSize="11" fontWeight="700">+30</text>
        <text x="225" y="115" fill="#FF1F1F" fontSize="11" fontWeight="700">−10</text>
        <text x="160" y="190" fill="#A0A0A0" fontSize="11" fontFamily="var(--font-jetbrains), monospace" textAnchor="middle">R:R 3:1 · MINIMUM ACCEPTABLE</text>
      </svg>
    ),
  },
  {
    slug: 'support-resistance',
    title: 'Support & Resistance',
    caption: 'Horizontal price levels where buyers/sellers repeatedly stepped in.',
    render: () => (
      <svg viewBox="0 0 320 200" style={{ width: '100%', height: 'auto' }}>
        <line x1="20" x2="300" y1="50" y2="50" stroke="#FF1F1F" strokeWidth="1.5" strokeDasharray="4 4"/>
        <text x="305" y="54" fill="#FF1F1F" fontSize="10">resistance</text>
        <line x1="20" x2="300" y1="150" y2="150" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4"/>
        <text x="305" y="154" fill="#10B981" fontSize="10">support</text>
        <polyline points="20,140 50,55 90,148 130,52 170,145 210,55 240,148 280,90"
          fill="none" stroke="#3B82F6" strokeWidth="2"/>
        <text x="160" y="190" fill="#A0A0A0" fontSize="11" fontFamily="var(--font-jetbrains), monospace" textAnchor="middle">RANGE-BOUND MARKET</text>
      </svg>
    ),
  },
  {
    slug: 'volume-confirm',
    title: 'Volume Confirmation',
    caption: 'Real breakouts have rising volume. Low-volume "breakouts" usually fail.',
    render: () => (
      <svg viewBox="0 0 320 200" style={{ width: '100%', height: 'auto' }}>
        <polyline points="20,140 50,135 80,138 110,135 140,140 170,138 200,90 230,70 260,55 290,45"
          fill="none" stroke="#3B82F6" strokeWidth="2"/>
        <line x1="20" x2="300" y1="120" y2="120" stroke="#909090" strokeDasharray="2 4"/>
        {[40, 70, 100, 130, 160, 190, 220, 250, 280].map((x, i) => {
          const heights = [12, 14, 11, 13, 12, 13, 32, 38, 42]
          return <rect key={x} x={x - 6} y={195 - heights[i]} width="12" height={heights[i]} fill={i < 6 ? '#909090' : '#10B981'} opacity="0.7"/>
        })}
        <text x="160" y="190" fill="#A0A0A0" fontSize="11" fontFamily="var(--font-jetbrains), monospace" textAnchor="middle"></text>
      </svg>
    ),
  },
]

const BY_SLUG: Record<string, IllustrationDef> = {}
for (const i of ILLUSTRATIONS) BY_SLUG[i.slug] = i

export const ALL_ILLUSTRATION_SLUGS = ILLUSTRATIONS.map(i => i.slug)

export function getIllustration(slug: string): IllustrationDef | null {
  return BY_SLUG[slug] ?? null
}

interface InlineProps {
  slug: string
}

export function InlineIllustration({ slug }: InlineProps) {
  const ill = getIllustration(slug)
  if (!ill) return (
    <div style={{
      padding: '8px 12px',
      background: 'rgba(255,255,255,0.04)',
      border: '1px dashed rgba(255,255,255,0.15)',
      borderRadius: '4px',
      fontFamily: 'var(--font-jetbrains), monospace',
      fontSize: '10px', color: '#606060',
    }}>image not found: {slug}</div>
  )
  return (
    <div style={{
      marginTop: '8px',
      padding: '12px',
      background: 'rgba(0,0,0,0.55)',
      border: '1px solid rgba(212,160,77,0.30)',
      borderRadius: '6px',
    }}>
      <div style={{
        fontFamily: 'var(--font-inter), sans-serif',
        fontSize: '9px', fontWeight: 800, color: '#D4A04D',
        letterSpacing: '0.22em', textTransform: 'uppercase',
        marginBottom: '6px',
      }}>{ill.title}</div>
      <div style={{ background: '#000', padding: '8px', borderRadius: '4px' }}>
        {ill.render()}
      </div>
      <div style={{
        fontFamily: 'var(--font-fraunces), serif', fontStyle: 'italic',
        fontSize: '11.5px', color: '#909090', lineHeight: 1.55,
        marginTop: '6px',
      }}>{ill.caption}</div>
    </div>
  )
}
