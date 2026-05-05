'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PortfolioNewsEvent } from '@/types/portfolio'
import { registerPulseTarget, unregisterPulseTarget } from '@/lib/utils/pulse-registry'

interface Props {
  event: PortfolioNewsEvent | null
}

export function NewsBanner({ event }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerPulseTarget('news-banner', ref.current)
    return () => unregisterPulseTarget('news-banner')
  }, [])

  useEffect(() => {
    if (ref.current) registerPulseTarget('news-banner', ref.current)
  }, [event])

  const isBullish = event?.causalImpacts.filter(c => c.polarity === 'positive').length ?? 0 >
    (event?.causalImpacts.filter(c => c.polarity === 'negative').length ?? 0)

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          ref={ref}
          data-pulse-id="news-banner"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            background: isBullish ? '#081a0a' : '#1a0808',
            border: `1px solid ${isBullish ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Pulsing left bar */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
            background: isBullish ? '#22c55e' : '#ef4444',
            animation: 'timerPulse 1s infinite',
          }} />

          <div style={{
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '6px',
            padding: '4px 10px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 800, fontSize: '11px', color: '#ef4444', letterSpacing: '0.1em' }}>
              ⬤ BREAKING
            </span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Anton, sans-serif', fontSize: '16px', color: '#f1f5f9', letterSpacing: '0.02em' }}>
              {event.headline}
            </div>
            <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              {event.body}
            </div>
          </div>

          {/* Impact indicators */}
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            {event.causalImpacts.map(impact => (
              <div key={impact.symbol} style={{
                background: impact.polarity === 'positive' ? 'rgba(34,197,94,0.1)' : impact.polarity === 'negative' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                border: `1px solid ${impact.polarity === 'positive' ? 'rgba(34,197,94,0.3)' : impact.polarity === 'negative' ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'}`,
                borderRadius: '6px',
                padding: '3px 7px',
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: 'JetBrains Mono, monospace',
                color: impact.polarity === 'positive' ? '#22c55e' : impact.polarity === 'negative' ? '#ef4444' : '#eab308',
              }}>
                {impact.symbol} {impact.polarity === 'positive' ? '↑' : impact.polarity === 'negative' ? '↓' : '→'}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
