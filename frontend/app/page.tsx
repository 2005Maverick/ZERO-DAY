'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Volume2, VolumeX } from 'lucide-react'

const TICKER = [
  ['NIFTY 50',     '22,475.10', '+1.24'],
  ['SENSEX',       '73,212.45', '-0.41'],
  ['BANKNIFTY',    '47,890.65', '+0.83'],
  ['BTC/USD',      '67,341.20', '+2.18'],
  ['USD/INR',      '83.42',     '-0.12'],
  ['GOLD',         '2,032.50',  '+0.34'],
  ['NASDAQ',       '16,802.31', '+1.55'],
  ['DOW JONES',    '38,654.78', '-0.22'],
  ['S&P 500',      '5,123.69',  '+0.91'],
  ['VIX',          '14.23',     '-3.21'],
  ['BRENT CRUDE',  '83.45',     '+1.08'],
  ['ETH/USD',      '3,421.55',  '+1.72'],
] as const

export default function SplashPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [clock, setClock] = useState('')
  const [muted, setMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    videoRef.current?.play().catch(() => {})
    const tick = () => {
      const d = new Date()
      const h = d.getUTCHours().toString().padStart(2, '0')
      const m = d.getUTCMinutes().toString().padStart(2, '0')
      const s = d.getUTCSeconds().toString().padStart(2, '0')
      setClock(`${h}:${m}:${s}`)
    }
    tick()
    const iv = setInterval(tick, 1000)
    return () => clearInterval(iv)
  }, [mounted])

  const toggleSound = () => {
    if (!videoRef.current) return
    const next = !muted
    videoRef.current.muted = next
    setMuted(next)
    if (!next) videoRef.current.play().catch(() => {})
  }

  if (!mounted) return <div style={{ minHeight: '100vh', background: '#050505' }} />

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      background: '#050505',
      overflow: 'hidden',
      fontFamily: 'var(--font-inter), sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>

      {/* ═══════════ VIDEO ═══════════ */}
      <motion.div
        style={{ position: 'absolute', inset: 0 }}
        initial={{ opacity: 0, scale: 1.12 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <video
          ref={videoRef}
          autoPlay loop playsInline preload="auto"
          muted={muted}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            animation: 'videoReveal 2.8s cubic-bezier(0.16,1,0.3,1) forwards',
          }}
        >
          <source src="/videos/trading-bg.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Symmetric center spotlight + frame darkening */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.96) 100%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '160px', pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.92), transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '160px', pointerEvents: 'none',
        background: 'linear-gradient(to top, rgba(0,0,0,0.92), transparent)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.022,
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 3px)' }} />

      {/* ═══════════════════════════════════════════════════════
            CREATIVE TOP HUD — three lanes: brand · status · ticker
        ═══════════════════════════════════════════════════════ */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 30 }}
      >
        {/* ── Lane 1: Brand monogram + status + sound toggle ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'stretch',
          borderBottom: '1px solid rgba(220,38,38,0.18)',
        }}>
          {/* LEFT — bracketed monogram */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '18px',
            padding: '14px 24px',
            borderRight: '1px solid rgba(220,38,38,0.18)',
            background: 'rgba(0,0,0,0.55)',
          }}>
            {/* Monogram block */}
            <div style={{
              position: 'relative',
              padding: '6px 10px',
              border: '1.5px solid #dc2626',
              fontFamily: 'Anton, sans-serif',
              fontSize: '15px',
              letterSpacing: '0.18em',
              color: '#fff',
              lineHeight: 1,
            }}>
              ZDM
              {/* mini corner ticks */}
              <span style={{ position: 'absolute', top: '-3px', left: '-3px', width: '5px', height: '5px', background: '#dc2626' }} />
              <span style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '5px', height: '5px', background: '#dc2626' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{
                fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif',
                fontSize: '10px', letterSpacing: '0.18em',
                color: 'rgba(220,38,38,0.92)', fontWeight: 600,
                textTransform: 'uppercase',
              }}>
                Terminal
              </span>
              <span style={{
                fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif',
                fontSize: '9px', letterSpacing: '0.14em',
                color: 'rgba(180,180,180,0.5)', fontWeight: 400,
                textTransform: 'uppercase',
              }}>
                Est. 2025 · Vol. 01
              </span>
            </div>
          </div>

          {/* CENTER — live status, framed by hairlines */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '22px',
            padding: '0 24px',
            background: 'rgba(0,0,0,0.4)',
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#dc2626',
                boxShadow: '0 0 14px rgba(220,38,38,0.9)',
                animation: 'pulse-dot 1.4s infinite',
              }} />
              <span style={{
                fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif',
                fontSize: '10px', fontWeight: 600,
                letterSpacing: '0.24em', color: '#dc2626',
                textTransform: 'uppercase',
              }}>
                Live
              </span>
            </span>

            <span style={{ width: '1px', height: '14px', background: 'rgba(220,38,38,0.3)' }} />

            <span style={{
              fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
              fontSize: '12px', fontWeight: 500,
              letterSpacing: '0.08em',
              color: '#e8e8e8',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {clock || '00:00:00'}
              <span style={{
                color: 'rgba(180,180,180,0.4)',
                marginLeft: '6px',
                fontSize: '10px',
                fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif',
                letterSpacing: '0.16em',
              }}>UTC</span>
            </span>

            <span style={{ width: '1px', height: '14px', background: 'rgba(220,38,38,0.3)' }} />

            <span style={{
              fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif',
              fontSize: '10px', fontWeight: 500,
              letterSpacing: '0.18em', color: 'rgba(180,180,180,0.6)',
              textTransform: 'uppercase',
            }}>
              Edition Zero
            </span>
          </div>

          {/* RIGHT — sound toggle */}
          <button
            onClick={toggleSound}
            title={muted ? 'Unmute audio' : 'Mute audio'}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '14px 24px',
              borderLeft: '1px solid rgba(220,38,38,0.18)',
              background: muted ? 'rgba(0,0,0,0.55)' : 'rgba(220,38,38,0.12)',
              border: 'none',
              borderTop: 'none', borderBottom: 'none',
              cursor: 'pointer',
              color: muted ? 'rgba(180,180,180,0.6)' : '#dc2626',
              fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif',
              fontSize: '10px', letterSpacing: '0.18em', fontWeight: 600,
              textTransform: 'uppercase',
              transition: 'all 0.25s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = muted ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = muted ? 'rgba(0,0,0,0.55)' : 'rgba(220,38,38,0.12)' }}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{muted ? 'Sound Off' : 'Sound On'}</span>
          </button>
        </div>

        {/* ── Lane 2: scrolling market ticker ── */}
        <div style={{
          position: 'relative',
          background: 'rgba(0,0,0,0.7)',
          borderBottom: '1px solid rgba(220,38,38,0.14)',
          overflow: 'hidden',
          height: '32px',
          display: 'flex', alignItems: 'center',
        }}>
          {/* Edge fades for ticker */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', zIndex: 2,
            background: 'linear-gradient(to right, rgba(0,0,0,1), transparent)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', zIndex: 2,
            background: 'linear-gradient(to left, rgba(0,0,0,1), transparent)', pointerEvents: 'none' }} />

          {/* "MARKETS" lead-in pill on the left */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 3,
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '0 18px',
            background: 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)',
            color: '#000',
            fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif',
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.22em',
            textTransform: 'uppercase',
            clipPath: 'polygon(0 0, 100% 0, calc(100% - 12px) 100%, 0 100%)',
          }}>
            ▲▼ Markets
          </div>

          {/* Scrolling track — duplicated for seamless loop */}
          <div style={{
            display: 'flex', gap: '40px',
            paddingLeft: '160px',
            whiteSpace: 'nowrap',
            animation: 'tickerScroll 70s linear infinite',
          }}>
            {[...TICKER, ...TICKER, ...TICKER].map((row, i) => {
              const [sym, price, pct] = row
              const positive = pct.startsWith('+')
              const color = positive ? '#22c55e' : '#ef4444'
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px' }}>
                  <span style={{
                    fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif',
                    color: 'rgba(232,232,232,0.92)',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                  }}>{sym}</span>
                  <span style={{
                    fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                    color: 'rgba(180,180,180,0.7)',
                    fontVariantNumeric: 'tabular-nums',
                  }}>{price}</span>
                  <span style={{
                    fontFamily: 'var(--font-geist-mono), ui-monospace, monospace',
                    color, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: '3px',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    <span style={{ fontSize: '9px' }}>{positive ? '▲' : '▼'}</span>
                    {pct}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </motion.header>

      {/* ═══════════ CENTERED HERO ═══════════ */}
      <main style={{
        position: 'relative', zIndex: 10,
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.0, duration: 0.8, ease: 'easeOut' }}
          style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '40px' }}
        >
          <div style={{ width: '52px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(220,38,38,0.7))' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.32em', color: '#dc2626', textTransform: 'uppercase' }}>
            A Market Simulation
          </span>
          <div style={{ width: '52px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(220,38,38,0.7))' }} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ userSelect: 'none', lineHeight: 0.88 }}
        >
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(44px, 6.4vw, 92px)',
            letterSpacing: '0.18em',
            color: 'transparent',
            WebkitTextStroke: '1.5px #dc2626',
            marginBottom: '6px',
            textShadow: '0 0 40px rgba(220,38,38,0.18)',
          }}>
            ZERO DAY
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.45, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ userSelect: 'none', lineHeight: 0.88 }}
        >
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(96px, 16vw, 220px)',
            letterSpacing: '0.04em',
            color: '#e8e8e8',
            textShadow: '0 0 80px rgba(232,232,232,0.06), 0 6px 40px rgba(0,0,0,0.95)',
          }}>
            MARKET
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1.85, duration: 0.7, ease: 'easeOut' }}
          style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '36px' }}
        >
          <div style={{ width: '120px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(220,38,38,0.5))' }} />
          <div style={{ width: '7px', height: '7px', transform: 'rotate(45deg)', border: '1px solid rgba(220,38,38,0.7)', background: 'rgba(220,38,38,0.15)' }} />
          <div style={{ width: '120px', height: '1px', background: 'linear-gradient(to left, transparent, rgba(220,38,38,0.5))' }} />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.05, duration: 0.7 }}
          style={{
            marginTop: '24px',
            fontSize: 'clamp(14px, 1.4vw, 17px)',
            fontWeight: 300,
            letterSpacing: '0.04em',
            color: 'rgba(200,200,200,0.65)',
            lineHeight: 1.6,
            margin: '24px 0 0',
            maxWidth: '520px',
          }}
        >
          Trade history&apos;s most volatile moments. No tutorials.
          <span style={{ color: '#dc2626', fontWeight: 500 }}> Pure consequence.</span>
        </motion.p>

        <motion.button
          onClick={() => router.push('/signup')}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.25, duration: 0.7 }}
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.97 }}
          style={{
            position: 'relative',
            marginTop: '44px',
            padding: '18px 56px',
            background: 'rgba(220,38,38,0.04)',
            border: '1.5px solid #dc2626',
            cursor: 'pointer',
            fontFamily: 'Anton, sans-serif',
            fontSize: '15px',
            letterSpacing: '0.24em',
            color: '#fff',
            transition: 'background 0.25s, box-shadow 0.25s',
            boxShadow: '0 0 36px rgba(220,38,38,0.18)',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = '#dc2626'
            el.style.boxShadow = '0 0 80px rgba(220,38,38,0.5)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement
            el.style.background = 'rgba(220,38,38,0.04)'
            el.style.boxShadow = '0 0 36px rgba(220,38,38,0.18)'
          }}
        >
          ENTER THE TERMINAL  →
          <span style={{ position: 'absolute', top: '-1px', left: '-1px', width: '10px', height: '10px', borderTop: '2px solid rgba(232,232,232,0.6)', borderLeft: '2px solid rgba(232,232,232,0.6)' }} />
          <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '10px', height: '10px', borderTop: '2px solid rgba(232,232,232,0.6)', borderRight: '2px solid rgba(232,232,232,0.6)' }} />
          <span style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '10px', height: '10px', borderBottom: '2px solid rgba(232,232,232,0.6)', borderLeft: '2px solid rgba(232,232,232,0.6)' }} />
          <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '10px', height: '10px', borderBottom: '2px solid rgba(232,232,232,0.6)', borderRight: '2px solid rgba(232,232,232,0.6)' }} />
        </motion.button>

      </main>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.8); }
        }
        @keyframes tickerScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
      `}</style>
    </div>
  )
}
