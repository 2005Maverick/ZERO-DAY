'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import type { ScenarioStock } from '@/types/scenario'

interface DeployVerdictModalProps {
  open: boolean
  unstudiedStocks: ScenarioStock[]
  allocations: Record<string, number>
  onGoBack: () => void
  onDeployAnyway: () => void
}

export function DeployVerdictModal({
  open, unstudiedStocks, allocations, onGoBack, onDeployAnyway,
}: DeployVerdictModalProps) {
  const risky = unstudiedStocks.filter(s => (allocations[s.symbol] ?? 0) > 0)

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 90,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(560px, 92vw)',
              background: '#0A0A0C',
              border: '1px solid rgba(250,204,21,0.5)',
              borderRadius: '10px',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 50px rgba(250,204,21,0.18)',
              zIndex: 91,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #FACC15, #F59E0B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 18px rgba(250,204,21,0.5)',
              }}>
                <AlertTriangle size={20} color="#0A0A0C" strokeWidth={2.4} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-geist-mono), monospace',
                  fontSize: '9px',
                  color: '#FACC15',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                  fontWeight: 700,
                }}>
                  ORUS · Pre-Deploy Verdict
                </div>
                <div style={{
                  fontFamily: 'var(--font-anton), var(--font-geist-sans), sans-serif',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '0.04em',
                  lineHeight: 1.15,
                }}>
                  You're moving fast, operative.
                </div>
              </div>
            </div>

            <p style={{
              fontFamily: 'var(--font-geist-sans), sans-serif',
              fontSize: '14px',
              lineHeight: 1.5,
              color: 'rgba(255,255,255,0.8)',
              margin: 0,
            }}>
              You've allocated capital to {risky.length} stock{risky.length === 1 ? '' : 's'} you haven't fully studied.
              On a day like Cov-20, the unstudied positions are usually where the loss compounds. Take another minute.
            </p>

            {risky.length > 0 && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                background: 'rgba(250,204,21,0.06)',
                border: '1px solid rgba(250,204,21,0.25)',
                borderRadius: '6px',
                padding: '12px',
              }}>
                <div style={{
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontSize: '9px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  color: '#FACC15',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}>
                  Unstudied positions
                </div>
                {risky.map(s => (
                  <div key={s.symbol} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: '12px',
                  }}>
                    <span style={{ fontSize: '14px' }}>{s.emoji}</span>
                    <span style={{ color: s.color, fontWeight: 700, width: '100px' }}>{s.symbol}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', flex: 1 }}>{s.sectorLabel}</span>
                    <span style={{ color: '#FACC15', fontWeight: 700 }}>
                      ₹{(allocations[s.symbol] ?? 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={onGoBack}
                style={{
                  flex: 1,
                  padding: '13px 18px',
                  background: 'linear-gradient(180deg, #06B6D4, #0891B2)',
                  border: '1px solid #06B6D4',
                  borderRadius: '6px',
                  color: '#0A0A0C',
                  fontFamily: 'var(--font-anton), var(--font-geist-sans), sans-serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.2em',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  boxShadow: '0 0 18px rgba(6,182,212,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                Go Back & Study
              </button>
              <button
                onClick={onDeployAnyway}
                style={{
                  padding: '13px 16px',
                  background: 'transparent',
                  border: '1px solid rgba(239,68,68,0.5)',
                  borderRadius: '6px',
                  color: '#EF4444',
                  fontFamily: 'var(--font-geist-sans), sans-serif',
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                Deploy Anyway
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
