'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PortfolioNewsEvent } from '@/types/portfolio'

type Tier = 'simple' | 'deeper' | 'expert'

interface Props {
  symbol: string
  event: PortfolioNewsEvent
  onClose: () => void
}

export function WhyPopover({ symbol, event, onClose }: Props) {
  const [tier, setTier] = useState<Tier>('simple')
  const explanation = event.whyExplanations[symbol]
  if (!explanation) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 8 }}
        style={{
          position: 'fixed',
          bottom: '100px',
          right: '24px',
          width: '340px',
          background: '#131920',
          border: '1px solid #1e2a35',
          borderRadius: '14px',
          padding: '16px',
          zIndex: 70,
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '14px', color: '#f1f5f9' }}>
              {symbol}
            </span>
            <span style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#475569', marginLeft: '8px' }}>
              Why did this move?
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
        </div>

        {/* Tier tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          {(['simple', 'deeper', 'expert'] as Tier[]).map(t => (
            <button
              key={t}
              onClick={() => setTier(t)}
              style={{
                flex: 1,
                padding: '6px 0',
                background: tier === t ? 'rgba(59,130,246,0.15)' : 'transparent',
                border: `1px solid ${tier === t ? 'rgba(59,130,246,0.4)' : '#1e2a35'}`,
                borderRadius: '8px',
                color: tier === t ? '#3b82f6' : '#64748b',
                fontSize: '11px', fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font-inter)',
                textTransform: 'capitalize',
              }}
            >
              {t === 'simple' ? '🟢 Simple' : t === 'deeper' ? '🟡 Deeper' : '🔴 Expert'}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={tier}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: '#94a3b8', lineHeight: 1.6 }}
        >
          {explanation[tier]}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
