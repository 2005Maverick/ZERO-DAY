'use client'

import { motion } from 'framer-motion'
import type { Mistake } from '@/types/portfolio'

interface Props {
  mistakes: Mistake[]
}

function secToTime(sec: number): string {
  const marketMin = 9 * 60 + 15 + Math.round((sec / 480) * 375)
  const h = Math.floor(marketMin / 60)
  const m = marketMin % 60
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

export function MistakesList({ mistakes }: Props) {
  if (mistakes.length === 0) {
    return (
      <div style={{
        background: '#0c1118',
        border: '1px solid rgba(34,197,94,0.2)',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏆</div>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#22c55e', fontWeight: 600 }}>
          No major mistakes detected
        </div>
        <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#475569', marginTop: '4px' }}>
          Clean execution throughout the session
        </div>
      </div>
    )
  }

  const totalCost = mistakes.reduce((s, m) => s + Math.abs(m.costRupees), 0)

  return (
    <div style={{
      background: '#0c1118',
      border: '1px solid #1e2a35',
      borderRadius: '12px',
      padding: '20px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '11px',
          fontWeight: 700,
          color: '#475569',
          letterSpacing: '0.08em',
        }}>
          MISTAKES & LESSONS
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '12px',
          color: '#ef4444',
        }}>
          Total cost: −₹{totalCost.toLocaleString('en-IN')}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {mistakes.map((mistake, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              background: 'rgba(239,68,68,0.04)',
              border: '1px solid rgba(239,68,68,0.15)',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '10px',
              color: '#475569',
              flexShrink: 0,
              paddingTop: '2px',
              minWidth: '60px',
            }}>
              {secToTime(mistake.atSecond)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '13px',
                fontWeight: 600,
                color: '#f1f5f9',
                marginBottom: '4px',
              }}>
                {mistake.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '12px',
                color: '#64748b',
                lineHeight: 1.5,
              }}>
                {mistake.detail}
              </div>
            </div>
            {mistake.costRupees !== 0 && (
              <div style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                fontWeight: 700,
                color: '#ef4444',
                flexShrink: 0,
              }}>
                −₹{Math.abs(mistake.costRupees).toLocaleString('en-IN')}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
