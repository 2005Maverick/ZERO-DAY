'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { CausalRule } from '@/types/portfolio'

interface Props {
  rule: CausalRule
  unlocked: boolean
  delay?: number
}

export function RuleCard({ rule, unlocked, delay = 0 }: Props) {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!unlocked) return
    const t = setTimeout(() => setRevealed(true), delay)
    return () => clearTimeout(t)
  }, [unlocked, delay])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      style={{
        perspective: '800px',
        height: '180px',
        cursor: unlocked ? 'default' : 'not-allowed',
      }}
    >
      <motion.div
        animate={{ rotateY: revealed ? 0 : 180 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Front (unlocked) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          background: revealed
            ? 'linear-gradient(135deg, rgba(255,184,48,0.08), rgba(255,184,48,0.03))'
            : '#131920',
          border: `1px solid ${revealed ? 'rgba(255,184,48,0.3)' : '#1e2a35'}`,
          borderRadius: '12px',
          padding: '20px',
          boxShadow: revealed ? '0 0 24px rgba(255,184,48,0.08)' : 'none',
          transition: 'box-shadow 0.3s',
        }}>
          <div style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: '15px',
            color: '#FFB830',
            letterSpacing: '0.04em',
            marginBottom: '8px',
          }}>
            {rule.name}
          </div>
          <div style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '13px',
            color: '#94a3b8',
            lineHeight: 1.5,
            marginBottom: '10px',
          }}>
            {rule.shortRule}
          </div>
          <div style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            color: '#475569',
            lineHeight: 1.4,
            borderTop: '1px solid #1e2a35',
            paddingTop: '8px',
          }}>
            {rule.example}
          </div>
        </div>

        {/* Back (locked) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: '#0c1118',
          border: '1px solid #1e2a35',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <div style={{ fontSize: '32px' }}>{unlocked ? '🔓' : '🔒'}</div>
          <div style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            color: '#334155',
            textAlign: 'center',
            padding: '0 16px',
          }}>
            {unlocked ? 'Unlocking...' : rule.triggerCondition}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
