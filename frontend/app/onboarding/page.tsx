'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ArrowRight, Play, Zap, Wallet, Newspaper, BarChart3 } from 'lucide-react'
import { useNavigation } from '@/lib/contexts/navigation-context'
import { useUser } from '@/lib/contexts/user-context'
import { setKnowledgeLevel } from '@/lib/utils/localStorage'

// ─── Color tokens ───────────────────────────────────────────
const COLORS = {
  bg:      '#000000',
  text:    '#fafafa',
  text2:   'rgba(200,200,200,0.7)',
  text3:   'rgba(180,180,180,0.5)',
  border:  'rgba(255,255,255,0.08)',
  red:     '#dc2626',
  cyan:    '#06b6d4',
  cyanLo:  '#0891b2',
  teal:    '#14b8a6',
  gold:    '#FFB830',
  goldLo:  '#f59e0b',
  orange:  '#f97316',
}

type TierId = 'beginner' | 'intermediate'

interface Tier {
  id: TierId
  badge: string
  label: string
  tagline: string
  description: string
  stats: string
  route: string
  knowledgeLevel: 'Beginner' | 'Intermediate'
  primary: string
  secondary: string
}

const TIERS: Tier[] = [
  {
    id: 'beginner',
    badge: '01',
    label: 'Initiate',
    tagline: 'Learn by Playing.',
    description: '10 hands-on mini-drills woven with bite-sized video lessons. Tape reading, candle patterns, news reflexes, sector logic, risk sizing. The trader stack from zero — no prior knowledge required.',
    stats: '10 Mini-Games · Video Lessons · Self-Paced',
    route: '/academy',
    knowledgeLevel: 'Beginner',
    primary: COLORS.cyan,
    secondary: COLORS.teal,
  },
  {
    id: 'intermediate',
    badge: '02',
    label: 'Operator',
    tagline: 'Trade the Chaos.',
    description: 'Skip the classroom. Drop into live historic market replays with a starting wallet. Real news, real charts, real consequences. The market remembers nothing — you will learn fast, or lose fast.',
    stats: 'Multiple Sims · Live Wallet · 8-Min Sessions',
    route: '/dashboard',
    knowledgeLevel: 'Intermediate',
    primary: COLORS.gold,
    secondary: COLORS.orange,
  },
]

// ════════════════════════════════════════════════════════════
//  ANIMATED WAVE STRING (between hello label and headline)
// ════════════════════════════════════════════════════════════
function WaveString({ color }: { color: string }) {
  return (
    <svg width="120" height="20" viewBox="0 0 120 20" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="wave-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%"  stopColor={color} stopOpacity="0" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <motion.path
        d="M0 10 Q 15 4 30 10 T 60 10 T 90 10 T 120 10"
        fill="none"
        stroke="url(#wave-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        animate={{
          d: [
            'M0 10 Q 15 4 30 10 T 60 10 T 90 10 T 120 10',
            'M0 10 Q 15 16 30 10 T 60 10 T 90 10 T 120 10',
            'M0 10 Q 15 4 30 10 T 60 10 T 90 10 T 120 10',
          ],
        }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  )
}

// ════════════════════════════════════════════════════════════
//  CARD with spotlight + tilt + animated border
// ════════════════════════════════════════════════════════════
function TierCard({
  tier, idx, isHovered, isSelecting, anyOtherSelecting,
  onHover, onLeave, onSelect,
}: {
  tier: Tier; idx: number;
  isHovered: boolean; isSelecting: boolean; anyOtherSelecting: boolean;
  onHover: () => void; onLeave: () => void; onSelect: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null)

  // Mouse-relative position for spotlight
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const smx = useSpring(mx, { stiffness: 200, damping: 24 })
  const smy = useSpring(my, { stiffness: 200, damping: 24 })

  // 3D tilt
  const tiltX = useTransform(smy, [0, 480], [4, -4])
  const tiltY = useTransform(smx, [0, 540], [-4, 4])

  // Card-internal spotlight
  const spotlightBg = useTransform([smx, smy], ([sx, sy]) =>
    `radial-gradient(360px circle at ${sx}px ${sy}px, ${tier.primary}22 0%, ${tier.primary}08 30%, transparent 65%)`
  )

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    mx.set(e.clientX - rect.left)
    my.set(e.clientY - rect.top)
  }, [mx, my])

  const isActive = isHovered || isSelecting
  const dim = anyOtherSelecting && !isSelecting

  return (
    <motion.button
      ref={ref}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onMouseMove={handleMouseMove}
      disabled={anyOtherSelecting || isSelecting}
      initial={{ opacity: 0, y: 28 }}
      animate={{
        opacity: dim ? 0.25 : 1,
        y: 0,
        scale: isSelecting ? 1.015 : 1,
      }}
      transition={{ delay: 1.0 + idx * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      whileHover={!anyOtherSelecting ? { y: -6 } : {}}
      whileTap={!anyOtherSelecting ? { scale: 0.985 } : {}}
      style={{
        position: 'relative',
        textAlign: 'left',
        padding: '32px 28px 28px',
        background: 'rgba(8,8,8,0.7)',
        border: `1px solid ${isActive ? tier.primary : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '14px',
        cursor: anyOtherSelecting ? 'wait' : 'pointer',
        overflow: 'hidden',
        transition: 'border-color 0.35s, box-shadow 0.35s',
        boxShadow: isActive
          ? `0 24px 80px ${tier.primary}30, 0 0 100px ${tier.primary}18`
          : '0 8px 24px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)',
        minHeight: '480px',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'inherit',
        color: 'inherit',
        rotateX: isActive ? tiltX : 0,
        rotateY: isActive ? tiltY : 0,
        transformPerspective: 1200,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Mouse-following internal spotlight */}
      <motion.div
        style={{
          position: 'absolute', inset: 0,
          background: spotlightBg,
          opacity: isActive ? 1 : 0,
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
          borderRadius: '14px',
        }}
      />

      {/* Animated traveling border (conic gradient mask) */}
      {isActive && (
        <div style={{
          position: 'absolute', inset: '-1px',
          borderRadius: '15px',
          background: `conic-gradient(from 0deg, transparent 0deg, ${tier.primary} 30deg, transparent 60deg, transparent 360deg)`,
          animation: 'border-spin 4s linear infinite',
          padding: '1.5px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          opacity: 0.7,
        }} />
      )}

      {/* Top color accent bar */}
      <motion.div
        animate={{ opacity: isActive ? 1 : 0.55 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${tier.primary}, ${tier.secondary})`,
          boxShadow: isActive ? `0 0 16px ${tier.primary}` : 'none',
        }}
      />

      {/* Corner brackets */}
      {[
        { top: 8, left: 8, borderTop: 1, borderLeft: 1 },
        { bottom: 8, right: 8, borderBottom: 1, borderRight: 1 },
      ].map((pos, i) => (
        <span key={i} style={{
          position: 'absolute',
          ...(pos.top !== undefined ? { top: pos.top } : {}),
          ...(pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
          ...(pos.left !== undefined ? { left: pos.left } : {}),
          ...(pos.right !== undefined ? { right: pos.right } : {}),
          width: '12px', height: '12px',
          borderTop: pos.borderTop ? `2px solid ${isActive ? tier.primary : 'rgba(255,255,255,0.15)'}` : 'none',
          borderLeft: pos.borderLeft ? `2px solid ${isActive ? tier.primary : 'rgba(255,255,255,0.15)'}` : 'none',
          borderBottom: pos.borderBottom ? `2px solid ${isActive ? tier.primary : 'rgba(255,255,255,0.15)'}` : 'none',
          borderRight: pos.borderRight ? `2px solid ${isActive ? tier.primary : 'rgba(255,255,255,0.15)'}` : 'none',
          transition: 'all 0.3s',
        }} />
      ))}

      {/* HEADER ROW — badge + path tag */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: '36px', lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: `1.5px ${isActive ? tier.primary : 'rgba(255,255,255,0.25)'}`,
            letterSpacing: '0.04em',
            transition: 'all 0.3s',
          }}>{tier.badge}</div>
          <motion.div
            animate={{ width: isActive ? '40px' : '24px' }}
            transition={{ duration: 0.3 }}
            style={{
              height: '1.5px',
              background: isActive ? tier.primary : 'rgba(255,255,255,0.2)',
              boxShadow: isActive ? `0 0 8px ${tier.primary}` : 'none',
            }}
          />
        </div>
        <div style={{
          padding: '4px 10px',
          background: isActive ? `${tier.primary}15` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${isActive ? `${tier.primary}50` : 'rgba(255,255,255,0.08)'}`,
          borderRadius: '4px',
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '9px', letterSpacing: '0.16em',
          color: isActive ? tier.primary : COLORS.text3,
          fontWeight: 600,
          transition: 'all 0.3s',
          textTransform: 'uppercase',
        }}>{tier.id === 'beginner' ? 'Path · A' : 'Path · B'}</div>
      </div>

      {/* TITLE + TAGLINE */}
      <h2 style={{
        position: 'relative',
        fontFamily: 'var(--font-anton), sans-serif',
        fontSize: '38px',
        letterSpacing: '0.04em',
        color: '#fff',
        margin: 0, lineHeight: 1,
        textTransform: 'uppercase',
        marginBottom: '6px',
      }}>{tier.label}</h2>
      <p style={{
        position: 'relative',
        margin: 0,
        fontSize: '15px',
        fontStyle: 'italic',
        color: isActive ? tier.primary : COLORS.text2,
        fontWeight: 400, letterSpacing: '0.02em',
        transition: 'color 0.3s',
      }}>{tier.tagline}</p>

      {/* DESCRIPTION */}
      <p style={{
        position: 'relative',
        marginTop: '16px',
        marginBottom: '20px',
        fontSize: '13px',
        lineHeight: 1.65,
        color: 'rgba(220,220,220,0.78)',
        fontWeight: 300,
      }}>{tier.description}</p>

      {/* ILLUSTRATION */}
      <div style={{
        position: 'relative',
        flex: 1,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '8px 0 20px',
      }}>
        {tier.id === 'beginner'
          ? <IllustrationInitiate active={isActive} />
          : <IllustrationOperator active={isActive} />}
      </div>

      {/* FOOTER */}
      <div style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', gap: '12px',
        paddingTop: '16px',
        borderTop: `1px solid ${isActive ? `${tier.primary}30` : 'rgba(255,255,255,0.06)'}`,
        transition: 'border-color 0.3s',
      }}>
        <div style={{
          flex: 1,
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '10px',
          color: COLORS.text3,
          letterSpacing: '0.08em',
          fontWeight: 500,
          textTransform: 'uppercase',
        }}>{tier.stats}</div>
        <motion.div
          animate={{ x: isActive ? 4 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px',
            background: isActive ? `linear-gradient(135deg, ${tier.primary}, ${tier.secondary})` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isActive ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '6px',
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: '12px', letterSpacing: '0.18em',
            color: isActive ? '#000' : COLORS.text2,
            fontWeight: 700,
            textTransform: 'uppercase',
            transition: 'all 0.3s',
            boxShadow: isActive ? `0 8px 24px ${tier.primary}50` : 'none',
          }}
        >
          {isSelecting ? 'Engaging' : 'Choose'}
          <ArrowRight size={12} strokeWidth={2.5} />
        </motion.div>
      </div>
    </motion.button>
  )
}

// ─── Illustrations (unchanged from previous build) ──────────
function IllustrationInitiate({ active }: { active: boolean }) {
  const tiles = [
    { icon: BarChart3, label: 'TAPE' }, { icon: Zap, label: 'NEWS' }, { icon: BarChart3, label: 'PNF' },
    { icon: Newspaper, label: 'EVNT' }, { icon: Play, label: 'PLAY' }, { icon: Wallet, label: 'RISK' },
    { icon: BarChart3, label: 'IND' }, { icon: Zap, label: 'RFLX' }, { icon: Newspaper, label: 'CASE' },
  ]
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
      gap: '6px', width: '100%', aspectRatio: '1.4 / 1', maxWidth: '280px', padding: '14px',
      background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.18)', borderRadius: '8px',
    }}>
      {tiles.map((t, i) => {
        const Icon = t.icon
        const isCenter = i === 4
        return (
          <div key={i} style={{
            position: 'relative', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '4px',
            background: isCenter ? `linear-gradient(135deg, ${COLORS.cyan}, ${COLORS.teal})` : active ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.02)',
            border: isCenter ? '1px solid rgba(6,182,212,0.6)' : `1px solid ${active ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.05)'}`,
            borderRadius: '4px', transition: 'all 0.4s',
            boxShadow: isCenter && active ? `0 0 16px ${COLORS.cyan}80` : 'none',
          }}>
            <Icon size={isCenter ? 14 : 10} color={isCenter ? '#000' : `rgba(6,182,212,${active ? 0.7 : 0.35})`} />
            <span style={{
              fontFamily: 'var(--font-geist-mono), monospace', fontSize: '7px', fontWeight: 700,
              letterSpacing: '0.1em', color: isCenter ? '#000' : `rgba(6,182,212,${active ? 0.6 : 0.3})`,
            }}>{t.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function IllustrationOperator({ active }: { active: boolean }) {
  const sparkPoints = (seed: number, w: number, h: number) => {
    let v = h / 2
    return Array.from({ length: 18 }).map((_, i) => {
      const r = Math.sin(seed * i * 1.7) * (h * 0.18)
      v = Math.max(h * 0.15, Math.min(h * 0.85, v + r))
      return `${(i / 17) * w},${v}`
    }).join(' ')
  }
  return (
    <div style={{
      width: '100%', maxWidth: '300px', aspectRatio: '1.5 / 1', padding: '8px',
      background: 'rgba(255,184,48,0.04)', border: '1px solid rgba(255,184,48,0.18)', borderRadius: '8px',
      display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '6px',
    }}>
      <div style={{ position: 'relative', background: 'rgba(0,0,0,0.4)',
        border: `1px solid ${active ? 'rgba(255,184,48,0.35)' : 'rgba(255,184,48,0.15)'}`,
        borderRadius: '4px', padding: '6px', overflow: 'hidden' }}>
        <div style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '7px', color: COLORS.gold, fontWeight: 700, letterSpacing: '0.1em' }}>NIFTY · 1m</div>
        <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ position: 'absolute', inset: '20px 6px 6px 6px', width: 'calc(100% - 12px)', height: 'calc(100% - 26px)' }}>
          <polyline points={sparkPoints(3, 100, 40)} fill="none" stroke={COLORS.gold} strokeWidth="1.2" />
        </svg>
      </div>
      <div style={{
        position: 'relative', background: active ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.04)',
        border: `1px solid ${active ? 'rgba(220,38,38,0.5)' : 'rgba(220,38,38,0.2)'}`,
        borderRadius: '4px', padding: '6px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        boxShadow: active ? `0 0 12px ${COLORS.red}40` : 'none', transition: 'all 0.4s',
      }}>
        <div style={{
          display: 'inline-flex', alignSelf: 'flex-start', padding: '1px 5px', borderRadius: '2px', background: COLORS.red,
          fontFamily: 'var(--font-geist-mono), monospace', fontSize: '7px', fontWeight: 800, letterSpacing: '0.12em', color: '#fff',
          animation: active ? 'pulse-soft 1.4s infinite' : 'none',
        }}>BREAKING</div>
        <div style={{ fontFamily: 'var(--font-geist-mono), monospace', fontSize: '7px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>
          OIL +12% · ENERGY ↑
        </div>
      </div>
      <div style={{
        background: 'rgba(0,0,0,0.4)', border: `1px solid ${active ? 'rgba(255,184,48,0.35)' : 'rgba(255,184,48,0.15)'}`,
        borderRadius: '4px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '3px',
      }}>
        {['10:42  RBI cuts rate', '10:38  ONGC ↑3.2%', '10:35  ITC hits high'].map((line, i) => (
          <div key={i} style={{
            fontFamily: 'var(--font-geist-mono), monospace', fontSize: '6.5px',
            color: i === 0 ? COLORS.gold : 'rgba(255,255,255,0.55)', letterSpacing: '0.04em',
          }}>{line}</div>
        ))}
      </div>
      <div style={{
        background: 'rgba(0,0,0,0.4)', border: `1px solid ${active ? 'rgba(20,184,166,0.4)' : 'rgba(20,184,166,0.18)'}`,
        borderRadius: '4px', padding: '6px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '4px',
          fontFamily: 'var(--font-geist-sans), sans-serif', fontSize: '7px',
          color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase',
        }}>
          <Wallet size={8} /> Wallet
        </div>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace', fontSize: '11px', fontWeight: 700,
          color: active ? '#10b981' : 'rgba(255,255,255,0.65)', lineHeight: 1,
        }}>₹98,420</div>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace', fontSize: '7px', color: '#10b981', fontWeight: 600,
        }}>+₹420 today</div>
      </div>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  MAIN
// ════════════════════════════════════════════════════════════
export default function OnboardingPage() {
  const { navigateTo } = useNavigation()
  const { user, setUser } = useUser()
  const [hovered, setHovered] = useState<TierId | null>(null)
  const [selecting, setSelecting] = useState<TierId | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const firstName = user?.firstName || 'Trader'

  const handleSelect = (tier: Tier) => {
    if (selecting) return
    setSelecting(tier.id)
    if (user) {
      const updated = setKnowledgeLevel(tier.knowledgeLevel)
      if (updated) setUser(updated)
    }
    // Route through the welcome cinema first; it reads the tier and routes onward
    setTimeout(() => navigateTo('/welcome'), 700)
  }

  if (!mounted) return <div style={{ minHeight: '100vh', background: COLORS.bg }} />

  const activeAccent = hovered || selecting
  const accentTier = TIERS.find(t => t.id === activeAccent)
  const ambientAccent = accentTier?.primary || COLORS.red

  return (
    <div style={{
      position: 'relative', minHeight: '100vh',
      background: COLORS.bg, overflow: 'hidden',
      fontFamily: 'var(--font-geist-sans), -apple-system, sans-serif',
      color: '#fff', display: 'flex', flexDirection: 'column',
    }}>
      {/* ═══════════ HUD ═══════════ */}
      <motion.header
        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
        style={{
          position: 'relative', zIndex: 30,
          padding: '22px 36px',
          display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
          // Subtle elevation so the HUD has somewhere to "sit" against the pure void below
          background: 'linear-gradient(180deg, rgba(22,22,26,0.95) 0%, rgba(12,12,14,0.92) 100%)',
          borderBottom: '1px solid rgba(220,38,38,0.45)',
          boxShadow: '0 1px 0 rgba(220,38,38,0.15), 0 8px 32px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Glow line under the bottom border */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: '-1px', height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(220,38,38,0.6), transparent)',
          pointerEvents: 'none',
        }} />

        {/* LEFT — brand + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            position: 'relative', padding: '7px 12px',
            border: '1.5px solid #dc2626',
            background: 'linear-gradient(135deg, rgba(220,38,38,0.18), rgba(220,38,38,0.04))',
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: '15px', letterSpacing: '0.2em', color: '#fff', lineHeight: 1,
            boxShadow: '0 0 16px rgba(220,38,38,0.25)',
          }}>
            ZDM
            <span style={{ position: 'absolute', top: '-3px', left: '-3px', width: '6px', height: '6px', background: '#dc2626', boxShadow: '0 0 6px rgba(220,38,38,0.8)' }} />
            <span style={{ position: 'absolute', bottom: '-3px', right: '-3px', width: '6px', height: '6px', background: '#dc2626', boxShadow: '0 0 6px rgba(220,38,38,0.8)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{
              fontSize: '11px', letterSpacing: '0.22em',
              color: '#f0f0f0', fontWeight: 600, textTransform: 'uppercase',
            }}>
              Trader Onboarding
            </span>
            <span style={{
              fontSize: '9px', letterSpacing: '0.18em',
              color: 'rgba(220,38,38,0.85)', fontWeight: 500, textTransform: 'uppercase',
            }}>
              Single decision · cannot be undone
            </span>
          </div>
        </div>

        {/* CENTER — progress trail */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '18px',
          padding: '8px 24px',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '8px',
        }}>
          {[{ label: 'Account', done: true }, { label: 'Profile', active: true }].map((step, i) => (
            <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  position: 'relative',
                  width: step.active ? '12px' : '10px', height: step.active ? '12px' : '10px',
                  borderRadius: '50%',
                  background: '#dc2626',
                  boxShadow: step.active
                    ? '0 0 14px rgba(220,38,38,0.85), 0 0 28px rgba(220,38,38,0.4)'
                    : '0 0 6px rgba(220,38,38,0.5)',
                }}>
                  {step.active && (
                    <span style={{
                      position: 'absolute', inset: '-4px',
                      borderRadius: '50%',
                      border: '1px solid rgba(220,38,38,0.55)',
                      animation: 'pulse-soft 1.6s infinite',
                    }} />
                  )}
                </div>
                <span style={{
                  fontSize: '11px', letterSpacing: '0.22em',
                  color: step.active ? '#fff' : 'rgba(240,240,240,0.65)',
                  fontWeight: step.active ? 700 : 500,
                  textTransform: 'uppercase',
                }}>{step.label}</span>
              </div>
              {i < 1 && (
                <div style={{
                  width: '40px', height: '1px',
                  background: 'linear-gradient(90deg, rgba(220,38,38,0.7), rgba(220,38,38,0.4))',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* RIGHT — date chip */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '14px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 16px',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '6px',
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '11px', letterSpacing: '0.18em',
            color: '#e8e8e8', fontWeight: 500, textTransform: 'uppercase',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#dc2626',
              boxShadow: '0 0 10px rgba(220,38,38,0.85)',
              animation: 'pulse-soft 1.6s infinite',
            }} />
            {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </div>
        </div>
      </motion.header>

      {/* ═══════════ MAIN ═══════════ */}
      <main style={{
        position: 'relative', zIndex: 10, flex: 1,
        display: 'flex', flexDirection: 'column',
        padding: '48px 32px',
        maxWidth: '1280px', margin: '0 auto', width: '100%',
      }}>
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: '52px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <motion.span
              animate={{ color: accentTier ? accentTier.primary : 'rgba(220,38,38,0.9)' }}
              transition={{ duration: 0.4 }}
              style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.28em', textTransform: 'uppercase' }}
            >
              Hello, {firstName}
            </motion.span>
            <WaveString color={accentTier ? accentTier.primary : '#dc2626'} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-anton), sans-serif',
            fontSize: 'clamp(48px, 6.6vw, 88px)',
            letterSpacing: '0.04em', lineHeight: 0.95,
            color: '#e8e8e8', margin: 0,
            textShadow: '0 4px 40px rgba(0,0,0,0.85)',
          }}>
            DECLARE YOUR
            <br />
            <span
              className="gradient-text-flow"
              style={{
                background: 'linear-gradient(120deg, #dc2626 0%, #dc2626 30%, #f43f5e 50%, #dc2626 70%, #dc2626 100%)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                WebkitTextStroke: '2px transparent',
                position: 'relative',
              }}
            >
              TRADING POSTURE.
            </span>
          </h1>

          <div style={{ marginTop: '24px', maxWidth: '620px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <motion.div
              animate={{ background: `linear-gradient(to bottom, ${accentTier?.primary || '#dc2626'}, transparent)` }}
              transition={{ duration: 0.5 }}
              style={{ width: '3px', minHeight: '48px', flexShrink: 0, marginTop: '4px' }}
            />
            <p style={{
              fontSize: 'clamp(14px, 1.3vw, 16px)', fontWeight: 300, letterSpacing: '0.02em',
              color: COLORS.text2, lineHeight: 1.65, margin: 0, fontStyle: 'italic',
            }}>
              We don&apos;t teach you to trade — <span style={{ color: '#fff', fontStyle: 'normal' }}>we let history do that.</span>
              <span style={{ color: accentTier?.primary || '#dc2626', fontStyle: 'normal' }}> Pick the path that fits you today. The simulation calibrates accordingly.</span>
            </p>
          </div>
        </motion.div>

        {/* CARDS */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '24px', maxWidth: '1080px', margin: '0 auto', width: '100%',
        }}>
          {TIERS.map((tier, idx) => (
            <TierCard
              key={tier.id} tier={tier} idx={idx}
              isHovered={hovered === tier.id}
              isSelecting={selecting === tier.id}
              anyOtherSelecting={!!selecting && selecting !== tier.id}
              onHover={() => setHovered(tier.id)}
              onLeave={() => setHovered(null)}
              onSelect={() => handleSelect(tier)}
            />
          ))}
        </div>
      </main>

      <style>{`
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.55; }
        }
        @keyframes border-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes gradient-flow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-text-flow {
          animation: gradient-flow 6s ease infinite;
          -webkit-text-stroke: 2px transparent;
        }
      `}</style>
    </div>
  )
}
