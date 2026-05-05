'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  date: string
  cinematicCopy: string
  onComplete: () => void
}

export function CinematicIntro({ date, cinematicCopy, onComplete }: Props) {
  const [showSkip, setShowSkip] = useState(false)
  const [countdown, setCountdown] = useState(15)

  useEffect(() => {
    const skipTimer = setTimeout(() => setShowSkip(true), 3000)
    return () => clearTimeout(skipTimer)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(id); onComplete(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
      overflow: 'hidden',
    }}>
      {/* Grain overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
        opacity: 0.4,
        pointerEvents: 'none',
      }} />

      {/* Red top bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '6px', background: '#ef4444',
          transformOrigin: 'left',
        }}
      />

      {/* Breaking tag */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          fontFamily: 'var(--font-inter)', fontWeight: 800,
          fontSize: '12px', letterSpacing: '0.2em',
          color: '#ef4444', marginBottom: '24px',
          textTransform: 'uppercase',
        }}
      >
        ⬤ LIVE MARKET SIMULATION
      </motion.div>

      {/* Date */}
      <motion.div
        initial={{ opacity: 0, rotateX: 90 }}
        animate={{ opacity: 1, rotateX: 0 }}
        transition={{ delay: 0.8, duration: 0.7, ease: 'easeOut' }}
        style={{
          fontFamily: 'Anton, var(--font-inter)',
          fontSize: 'clamp(56px, 10vw, 120px)',
          color: '#f1f5f9',
          lineHeight: 1,
          textAlign: 'center',
          letterSpacing: '0.02em',
          marginBottom: '20px',
        }}
      >
        {date}
      </motion.div>

      {/* Cinematic copy */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.6 }}
        style={{
          fontFamily: 'var(--font-inter)',
          fontSize: 'clamp(16px, 2.5vw, 22px)',
          color: '#94a3b8',
          textAlign: 'center',
          maxWidth: '600px',
          lineHeight: 1.6,
          padding: '0 24px',
          marginBottom: '48px',
        }}
      >
        {cinematicCopy}
      </motion.div>

      {/* Wallet badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        style={{
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '12px',
          padding: '12px 32px',
          marginBottom: '32px',
        }}
      >
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '24px', fontWeight: 700, color: '#22c55e' }}>
          ₹1,00,000
        </span>
        <span style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#64748b', marginLeft: '12px' }}>
          available to invest
        </span>
      </motion.div>

      {/* Countdown bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        style={{ width: '300px', textAlign: 'center' }}
      >
        <div style={{ height: '3px', background: '#1e2a35', borderRadius: '2px', marginBottom: '8px' }}>
          <motion.div
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 15, ease: 'linear' }}
            style={{ height: '100%', background: '#ef4444', borderRadius: '2px' }}
          />
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#475569' }}>
          Markets open in {countdown}s
        </span>
      </motion.div>

      {/* Skip button */}
      <AnimatePresence>
        {showSkip && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onComplete}
            style={{
              position: 'absolute', bottom: '32px', right: '32px',
              background: 'transparent',
              border: '1px solid #1e2a35',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#475569',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter)',
            }}
          >
            Skip intro →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
