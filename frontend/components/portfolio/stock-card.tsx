'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Allocation, PortfolioStock, RevealPhase, PortfolioNewsEvent } from '@/types/portfolio'
import { StockSparkline } from './stock-sparkline'
import { registerPulseTarget, unregisterPulseTarget } from '@/lib/utils/pulse-registry'

interface Props {
  stock: PortfolioStock
  currentPrice: number
  allocation: Allocation | null
  revealPhase: RevealPhase
  elapsedSeconds: number
  lastFiredEvent: PortfolioNewsEvent | null
  onWhyClick: (symbol: string) => void
}

const SECTOR_COLORS: Record<string, string> = {
  airlines: '#3b82f6',
  pharma:   '#22c55e',
  energy:   '#f97316',
  banking:  '#a855f7',
  luxury:   '#eab308',
  it:       '#06b6d4',
}

export function StockCard({ stock, currentPrice, allocation, revealPhase, elapsedSeconds, lastFiredEvent, onWhyClick }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const prevPriceRef = useRef(stock.openPrice)
  const [flashColor, setFlashColor] = useState<string | null>(null)
  const [borderGlow, setBorderGlow] = useState<string | null>(null)

  const pulseId = `stock-card-${stock.symbol}`

  // Register with pulse registry
  useEffect(() => {
    registerPulseTarget(pulseId, cardRef.current)
    return () => unregisterPulseTarget(pulseId)
  }, [pulseId])

  // Update registry position on resize
  useEffect(() => {
    const obs = new ResizeObserver(() => registerPulseTarget(pulseId, cardRef.current))
    if (cardRef.current) obs.observe(cardRef.current)
    return () => obs.disconnect()
  }, [pulseId])

  // Flash on price change
  useEffect(() => {
    if (currentPrice === prevPriceRef.current) return
    const up = currentPrice > prevPriceRef.current
    setFlashColor(up ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)')
    const t = setTimeout(() => setFlashColor(null), 400)
    prevPriceRef.current = currentPrice
    return () => clearTimeout(t)
  }, [currentPrice])

  // Border glow when event hits this stock
  useEffect(() => {
    if (!lastFiredEvent) return
    const impact = lastFiredEvent.causalImpacts.find(ci => ci.symbol === stock.symbol)
    if (!impact) return
    const glowColor = impact.polarity === 'positive' ? '#22c55e' : impact.polarity === 'negative' ? '#ef4444' : '#FFB830'
    setBorderGlow(glowColor)
    const t = setTimeout(() => setBorderGlow(null), 3000)
    return () => clearTimeout(t)
  }, [lastFiredEvent, stock.symbol])

  const sectorColor = SECTOR_COLORS[stock.sector] ?? '#94a3b8'
  const priceDelta = currentPrice - stock.openPrice
  const pricePct = (priceDelta / stock.openPrice) * 100
  const isUp = priceDelta >= 0
  const priceColor = isUp ? '#22c55e' : '#ef4444'

  // Sparkline: last 60 data points
  const endIdx = Math.min(elapsedSeconds, stock.candles.length - 1)
  const startIdx = Math.max(0, endIdx - 60)
  const sparkPrices = stock.candles.slice(startIdx, endIdx + 1).map(c => c.price)
  const sparkVolumes = stock.candles.slice(startIdx, endIdx + 1).map(c => c.volume)

  const showVolume = revealPhase === 'volume' || revealPhase === 'orderbook' || revealPhase === 'heatmap'

  const hasWhyData = lastFiredEvent?.causalImpacts.some(ci => ci.symbol === stock.symbol)

  return (
    <motion.div
      ref={cardRef}
      data-pulse-id={pulseId}
      animate={{ backgroundColor: flashColor ?? '#131920' }}
      transition={{ duration: 0.3 }}
      style={{
        border: `1px solid ${borderGlow ? borderGlow + '60' : '#1e2a35'}`,
        borderRadius: '14px',
        padding: '14px 16px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: borderGlow ? `0 0 20px ${borderGlow}30` : 'none',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Sector accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: sectorColor, opacity: 0.6, borderRadius: '14px 14px 0 0' }} />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, fontSize: '15px', color: '#f1f5f9' }}>
              {stock.symbol}
            </span>
            <span style={{
              background: sectorColor + '15',
              border: `1px solid ${sectorColor}30`,
              borderRadius: '4px', padding: '1px 6px',
              fontSize: '9px', fontWeight: 700, color: sectorColor,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {stock.sectorLabel}
            </span>
          </div>
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
            {stock.name}
          </div>
        </div>

        {/* Price */}
        <div style={{ textAlign: 'right' }}>
          <motion.div
            key={Math.round(currentPrice)}
            initial={{ opacity: 0.6, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '18px', color: '#f1f5f9' }}
          >
            ₹{currentPrice.toFixed(2)}
          </motion.div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: priceColor }}>
            {isUp ? '▲' : '▼'} {Math.abs(pricePct).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Sparkline */}
      <div style={{ marginBottom: '10px' }}>
        <StockSparkline
          prices={sparkPrices}
          color={sectorColor}
          width={200}
          height={showVolume ? 55 : 40}
          showVolume={showVolume}
          volumes={showVolume ? sparkVolumes : []}
        />
      </div>

      {/* Allocation footer */}
      <div style={{ borderTop: '1px solid #1e2a35', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {allocation && allocation.shares > 0 ? (
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', color: '#94a3b8' }}>
              ₹{Math.round(allocation.currentValue).toLocaleString('en-IN')}
              <span style={{ color: '#475569', marginLeft: '4px' }}>({allocation.shares.toFixed(2)} sh)</span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', color: allocation.pnlRupees >= 0 ? '#22c55e' : '#ef4444' }}>
              {allocation.pnlRupees >= 0 ? '+' : ''}₹{Math.round(allocation.pnlRupees).toLocaleString('en-IN')}
              {' '}({allocation.pnlPct >= 0 ? '+' : ''}{allocation.pnlPct.toFixed(2)}%)
            </div>
          </div>
        ) : (
          <div style={{ fontFamily: 'var(--font-inter)', fontSize: '12px', color: '#475569' }}>Not invested</div>
        )}

        {/* Why button */}
        <AnimatePresence>
          {hasWhyData && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onWhyClick(stock.symbol)}
              style={{
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                color: '#3b82f6',
                cursor: 'pointer',
                fontFamily: 'var(--font-inter)',
                fontWeight: 600,
              }}
            >
              ? Why
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
