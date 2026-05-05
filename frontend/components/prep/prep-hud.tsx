'use client'

import { useEffect, useState } from 'react'

interface PrepHudProps {
  scenarioId: string
  scenarioTitle: string
  scenarioDate: string
  preMarketTime: string
  walletInr: number
  allocatedInr: number
  tutorOn: boolean
  onTutorToggle: () => void
  operatorName: string
  operatorTier: string
  operatorBalance: number
  onExit: () => void
}

/**
 * Top HUD — pure-black bar.
 *   [ZDM]  PREP ROOM · COV-20            [allocation tracker]      [TUTOR pill]   [operator card]   [exit]
 */
export function PrepHud({
  scenarioId, scenarioTitle, scenarioDate, preMarketTime,
  walletInr, allocatedInr, tutorOn, onTutorToggle,
  operatorName, operatorTier, operatorBalance, onExit,
}: PrepHudProps) {
  const pct = walletInr > 0 ? Math.min(1, allocatedInr / walletInr) : 0
  const cash = walletInr - allocatedInr

  return (
    <div style={{
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '0 16px',
      background: 'linear-gradient(180deg, rgba(15,15,22,0.95), rgba(8,8,12,0.95))',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(239,68,68,0.18)',
      boxShadow: '0 8px 22px rgba(0,0,0,0.5)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* ZDM monogram */}
      <div style={{
        fontFamily: 'var(--font-anton), sans-serif',
        fontSize: '13px',
        letterSpacing: '0.18em',
        color: '#EF4444',
        fontWeight: 700,
        padding: '6px 10px',
        border: '1.5px solid #EF4444',
        borderRadius: '4px',
        boxShadow: '0 0 14px rgba(239,68,68,0.35)',
      }}>
        [ZDM]
      </div>

      {/* Scenario block */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '12px',
          fontWeight: 700,
          color: '#EF4444',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          lineHeight: 1,
        }}>
          Prep Room · {scenarioId}
        </div>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '10px',
          color: 'rgba(255,255,255,0.55)',
          letterSpacing: '0.06em',
        }}>
          Pre-Market · {preMarketTime} · {scenarioDate}
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Allocation tracker pill */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        padding: '7px 14px',
        background: '#0F0F12',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
        minWidth: '320px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '11px',
            color: '#FFFFFF',
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}>
            ₹{allocatedInr.toLocaleString('en-IN')} <span style={{ color: 'rgba(255,255,255,0.4)' }}>/</span> ₹{walletInr.toLocaleString('en-IN')} <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '9px', letterSpacing: '0.16em', marginLeft: '4px' }}>ALLOCATED</span>
          </div>
          <div style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '12px',
            fontWeight: 700,
            color: pct >= 0.95 ? '#10B981' : '#FACC15',
          }}>
            {(pct * 100).toFixed(0)}%
          </div>
        </div>
        <div style={{
          height: '4px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${pct * 100}%`,
            height: '100%',
            background: pct >= 0.95
              ? 'linear-gradient(90deg, #10B981, #06B6D4)'
              : 'linear-gradient(90deg, #FACC15, #F97316)',
            transition: 'width 0.25s, background 0.25s',
            boxShadow: pct >= 0.95 ? '0 0 8px #10B98180' : '0 0 8px #FACC1560',
          }} />
        </div>
        <div style={{
          fontFamily: 'var(--font-geist-mono), monospace',
          fontSize: '9px',
          color: 'rgba(255,255,255,0.45)',
          letterSpacing: '0.04em',
        }}>
          ₹{cash.toLocaleString('en-IN')} cash · {(pct * 100).toFixed(0)}% deployed
        </div>
      </div>

      {/* Tutor toggle pill */}
      <button
        onClick={onTutorToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 12px 7px 14px',
          background: tutorOn
            ? 'linear-gradient(90deg, #7C3AED, #A855F7)'
            : '#15151A',
          border: `1px solid ${tutorOn ? '#A855F7' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '999px',
          color: tutorOn ? '#FFFFFF' : 'rgba(255,255,255,0.6)',
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          boxShadow: tutorOn ? '0 0 18px rgba(168,85,247,0.45)' : 'none',
          transition: 'all 0.18s',
        }}
        aria-pressed={tutorOn}
      >
        Tutor · {tutorOn ? 'ON' : 'OFF'}
        <span style={{
          width: '22px', height: '12px',
          background: 'rgba(255,255,255,0.18)',
          borderRadius: '999px',
          position: 'relative',
          flexShrink: 0,
        }}>
          <span style={{
            position: 'absolute',
            top: '1px',
            left: tutorOn ? '11px' : '1px',
            width: '10px', height: '10px',
            background: '#FFFFFF',
            borderRadius: '50%',
            transition: 'left 0.18s',
          }} />
        </span>
      </button>

      {/* Operator card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 12px 6px 6px',
        background: '#0F0F12',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px',
      }}>
        <div style={{
          width: '32px', height: '32px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #7C3AED, #A855F7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#FFFFFF',
          fontFamily: 'var(--font-anton), sans-serif',
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          boxShadow: '0 0 14px rgba(168,85,247,0.4)',
        }}>
          {operatorName.charAt(0).toUpperCase()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{
            fontFamily: 'var(--font-geist-sans), sans-serif',
            fontSize: '8px',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
            Operator
          </div>
          <div style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: '11px',
            color: '#FFFFFF',
            fontWeight: 600,
            letterSpacing: '0.02em',
          }}>
            {operatorName} · <span style={{ color: '#A855F7' }}>{operatorTier}</span> · ₹{operatorBalance.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <button
        onClick={onExit}
        title="Back to Ledger"
        style={{
          padding: '8px 10px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px',
          color: 'rgba(255,255,255,0.55)',
          fontFamily: 'var(--font-geist-sans), sans-serif',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        ← Ledger
      </button>
    </div>
  )
}
