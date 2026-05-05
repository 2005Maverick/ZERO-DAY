'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BarChart3, Activity, FileText, Newspaper, Building2, Globe2, BookOpenCheck } from 'lucide-react'
import type { ScenarioStock } from '@/types/scenario'
import type { CompanyDetail } from '@/lib/data/scenarios/cov-20/companies'
import { TabChart } from './tabs/tab-chart'
import { TabTechnicals } from './tabs/tab-technicals'
import { TabFundamentals } from './tabs/tab-fundamentals'
import { TabNews } from './tabs/tab-news'
import { TabCompany } from './tabs/tab-company'
import { TabSector } from './tabs/tab-sector'

export type DossierTab = 'chart' | 'technicals' | 'fundamentals' | 'news' | 'company' | 'sector'

interface DossierModalProps {
  open: boolean
  onClose: () => void
  stock: ScenarioStock | null
  company: CompanyDetail | null
  studied: Record<string, true>
  onMarkAllStudied: (symbol: string) => void
  onTabView: (symbol: string, tab: DossierTab, durationMs: number) => void
  onTutorOpen: (symbol: string, tab: DossierTab) => void
}

const SECTOR_COLOR: Record<string, string> = {
  airlines: '#3B82F6',
  pharma:   '#10B981',
  energy:   '#E11D48',
  banking:  '#06B6D4',
  luxury:   '#A855F7',
  it:       '#14B8A6',
}

const TABS: { key: DossierTab; label: string; icon: React.ElementType }[] = [
  { key: 'chart',        label: 'Chart',        icon: BarChart3 },
  { key: 'technicals',   label: 'Technicals',   icon: Activity },
  { key: 'fundamentals', label: 'Fundamentals', icon: FileText },
  { key: 'news',         label: 'News',         icon: Newspaper },
  { key: 'company',      label: 'Company',      icon: Building2 },
  { key: 'sector',       label: 'Sector',       icon: Globe2 },
]

const TAB_TO_ARTIFACT_KEY: Record<DossierTab, string> = {
  chart:        'price-chart',
  technicals:   'price-chart',         // same artifact base for tracking
  fundamentals: 'key-metrics',
  news:         'news-24h',
  company:      'balance-sheet',
  sector:       'sector-position',
}

/**
 * Tabbed dossier overlay. Slides in over the deck with backdrop blur.
 */
export function DossierModal({
  open, onClose, stock, company, studied, onMarkAllStudied, onTabView, onTutorOpen,
}: DossierModalProps) {
  const [activeTab, setActiveTab] = useState<DossierTab>('chart')
  const [tabStartedAt, setTabStartedAt] = useState<number>(Date.now())

  useEffect(() => {
    if (open) {
      setActiveTab('chart')
      setTabStartedAt(Date.now())
    }
  }, [open, stock?.symbol])

  if (!stock || !company) return null

  const accent = SECTOR_COLOR[stock.sector] ?? '#D4A04D'
  const pctNum = stock.pctChange30d * 100
  const isDown = pctNum < 0

  function handleTabSwitch(tab: DossierTab): void {
    if (!stock) return
    const dur = Date.now() - tabStartedAt
    if (dur > 500) onTabView(stock.symbol, activeTab, dur)
    setActiveTab(tab)
    setTabStartedAt(Date.now())
  }

  function handleClose(): void {
    if (stock) {
      const dur = Date.now() - tabStartedAt
      if (dur > 500) onTabView(stock.symbol, activeTab, dur)
    }
    onClose()
  }

  const studiedCount = Object.keys(studied).filter(k => k.startsWith(`${stock.symbol}:`)).length

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(6,8,12,0.78)',
              backdropFilter: 'blur(8px)',
              zIndex: 60,
            }}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: '32px',
              maxWidth: '1280px',
              margin: '0 auto',
              background: 'linear-gradient(180deg, #131820 0%, #0B0F15 100%)',
              border: `1px solid ${accent}66`,
              borderRadius: '14px',
              boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${accent}22`,
              zIndex: 61,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* HEAD ─ Stock title */}
            <div style={{
              padding: '22px 28px 18px',
              borderBottom: '1px solid rgba(212,160,77,0.18)',
              background: `linear-gradient(180deg, ${accent}10, transparent)`,
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
            }}>
              <div style={{
                width: '52px', height: '52px',
                borderRadius: '10px',
                background: `${accent}1A`,
                border: `1px solid ${accent}80`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px',
                flexShrink: 0,
              }}>
                {stock.emoji}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontFamily: 'var(--font-fraunces), serif',
                    fontWeight: 700,
                    fontSize: '32px',
                    color: '#F4EDE0',
                    letterSpacing: '0.04em',
                    lineHeight: 1,
                  }}>
                    {stock.symbol}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-fraunces), serif',
                    fontStyle: 'italic',
                    fontSize: '16px',
                    color: '#A89A7E',
                    fontWeight: 400,
                  }}>
                    {stock.name}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-jetbrains), monospace',
                    fontSize: '11px',
                    color: accent,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                  }}>
                    {stock.sectorLabel} · NSE
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <div style={{
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontSize: '10px',
                  color: '#5C5849',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                }}>
                  Last Close · Mar 6, 2020
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span style={{
                    fontFamily: 'var(--font-jetbrains), monospace',
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#F4EDE0',
                  }}>
                    ₹{stock.closePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-jetbrains), monospace',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: isDown ? '#E04A4A' : '#5AB088',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <span style={{ fontSize: '10px' }}>{isDown ? '▼' : '▲'}</span>
                    {pctNum > 0 ? '+' : ''}{pctNum.toFixed(1)}% <span style={{ color: '#5C5849', marginLeft: '2px' }}>30D</span>
                  </span>
                </div>
              </div>

              <button
                onClick={handleClose}
                aria-label="Close dossier"
                style={{
                  width: '38px', height: '38px',
                  background: 'rgba(212,160,77,0.08)',
                  border: '1px solid rgba(212,160,77,0.3)',
                  borderRadius: '8px',
                  color: '#D4A04D',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,160,77,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(212,160,77,0.08)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* TABS */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '0 28px',
              borderBottom: '1px solid rgba(212,160,77,0.18)',
              background: 'rgba(0,0,0,0.25)',
              overflowX: 'auto',
            }}>
              {TABS.map(t => {
                const isActive = activeTab === t.key
                const Icon = t.icon
                return (
                  <button
                    key={t.key}
                    onClick={() => handleTabSwitch(t.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '14px 18px',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `2px solid ${isActive ? accent : 'transparent'}`,
                      color: isActive ? '#F4EDE0' : '#8A8576',
                      fontFamily: 'var(--font-inter), sans-serif',
                      fontSize: '13px',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                      transition: 'color 0.15s, border-color 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#F4EDE0' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#8A8576' }}
                  >
                    <Icon size={14} strokeWidth={2.2} />
                    {t.label}
                  </button>
                )
              })}

              <div style={{ flex: 1 }} />

              <button
                onClick={() => stock && onTutorOpen(stock.symbol, activeTab)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: 'rgba(168,85,247,0.12)',
                  border: '1px solid rgba(168,85,247,0.5)',
                  borderRadius: '6px',
                  color: '#C589FA',
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <BookOpenCheck size={13} strokeWidth={2.2} />
                ORUS Tutor
              </button>

              <button
                onClick={() => stock && onMarkAllStudied(stock.symbol)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  background: studiedCount >= 6 ? 'rgba(90,176,136,0.14)' : 'rgba(212,160,77,0.08)',
                  border: `1px solid ${studiedCount >= 6 ? '#5AB088' : 'rgba(212,160,77,0.4)'}`,
                  borderRadius: '6px',
                  color: studiedCount >= 6 ? '#5AB088' : '#D4A04D',
                  fontFamily: 'var(--font-inter), sans-serif',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  flexShrink: 0,
                  marginLeft: '6px',
                }}
              >
                {studiedCount >= 6 ? '✓ All Studied' : `${studiedCount}/6 Studied`}
              </button>
            </div>

            {/* TAB BODY — scrollable */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              padding: '24px 28px',
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.18))',
            }}>
              {activeTab === 'chart'        && <TabChart stock={stock} accent={accent} />}
              {activeTab === 'technicals'   && <TabTechnicals stock={stock} accent={accent} />}
              {activeTab === 'fundamentals' && <TabFundamentals stock={stock} company={company} accent={accent} />}
              {activeTab === 'news'         && <TabNews stock={stock} accent={accent} />}
              {activeTab === 'company'      && <TabCompany company={company} accent={accent} />}
              {activeTab === 'sector'       && <TabSector stock={stock} company={company} accent={accent} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export { TAB_TO_ARTIFACT_KEY }
