'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Newspaper, Globe, Radio, TrendingDown, Clock, AlertOctagon } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface NewsItem {
    headline: string
    severity: string
    sentiment?: { score: number; type: string }
    timeStr?: string 
}

interface Props {
  isOpen: boolean
  onClose: () => void
  newsItems: NewsItem[]
}

// ─── Sentiment Badge Helper ──────────────────────────────
function SentimentBadge({ sentiment }: { sentiment?: { score: number; type: string } }) {
    if (!sentiment) return null;
    const isBull = sentiment.type === 'bullish';
    const isBear = sentiment.type === 'bearish';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            backgroundColor: isBull ? 'rgba(34,197,94,0.1)' : isBear ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.1)',
            color: isBull ? '#4ade80' : isBear ? '#f87171' : '#94a3b8',
            border: `1px solid ${isBull ? 'rgba(34,197,94,0.2)' : isBear ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.2)'}`,
            padding: '2px 8px', borderRadius: '12px',
            fontSize: '9px', fontWeight: 800, letterSpacing: '0.05em',
            marginTop: '8px'
        }}>
            {isBull ? <TrendingDown className="w-3 h-3 rotate-180" /> : isBear ? <TrendingDown className="w-3 h-3" /> : null}
            {sentiment.score}% {sentiment.type.toUpperCase()}
        </span>
    )
}

export function NewsDrawer({ isOpen, onClose, newsItems }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // fake times for the news items just to make them look like a real terminal feed,
  // working backwards from current time
  const itemsWithTime = newsItems.map((item, i) => {
      const d = new Date()
      d.setMinutes(d.getMinutes() - (i * 14)) // space them out
      return {
          ...item,
          timeStr: d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[499] bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-[420px] bg-[#0a0d0f] border-l border-[#1c2635] z-[500] flex flex-col shadow-2xl font-mono"
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c2635] bg-[#0d1117] shrink-0 font-sans">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <Globe className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white tracking-wide">Global Financial Feed</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Live Updates</p>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#1c2635] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto bg-[#080b0e] relative" 
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
            >
                {/* Vertical Timeline Line */}
                <div className="absolute left-[44px] top-0 bottom-0 w-px bg-[#1c2635] z-0" />

                {itemsWithTime.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#475569] gap-3">
                        <Radio className="w-8 h-8 opacity-50" />
                        <p className="text-[12px] font-sans">Awaiting financial events...</p>
                    </div>
                ) : (
                    <div className="py-6 px-4">
                        {itemsWithTime.map((item, i) => {
                            const isCritical = item.severity === 'critical'
                            const isHigh = item.severity === 'high'
                            const isHistorical = item.severity === 'historical'
                            
                            const dotColor = isCritical ? '#ef4444' : isHigh ? '#f97316' : isHistorical ? '#64748b' : '#3b82f6'
                            const bgColor = isCritical ? 'rgba(239,68,68,0.05)' : 'transparent'
                            const borderColor = isCritical ? 'rgba(239,68,68,0.2)' : 'transparent'

                            return (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    key={i} 
                                    className="relative z-10 pl-12 pr-2 py-4 group"
                                >
                                    {/* Timeline Dot & Time */}
                                    <div className="absolute left-0 top-5 w-[44px] flex flex-col items-end pr-3">
                                        <div className="text-[9px] text-[#64748b] font-medium mb-1">
                                            {item.timeStr}
                                        </div>
                                    </div>
                                    <div 
                                        className="absolute left-[40px] top-[22px] w-[9px] h-[9px] rounded-full ring-4 ring-[#080b0e]"
                                        style={{ backgroundColor: dotColor }}
                                    />
                                    {isCritical && (
                                        <div 
                                            className="absolute left-[40px] top-[22px] w-[9px] h-[9px] rounded-full animate-ping"
                                            style={{ backgroundColor: dotColor, opacity: 0.6 }}
                                        />
                                    )}

                                    {/* Card */}
                                    <div 
                                        className="rounded-lg p-3 transition-colors duration-300"
                                        style={{ backgroundColor: bgColor, border: `1px solid ${borderColor}` }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span style={{
                                                fontSize: '8px', fontWeight: 800, padding: '2px 4px', borderRadius: '3px',
                                                backgroundColor: isCritical ? '#ef4444' : isHigh ? '#9a3412' : '#1e3a8a',
                                                color: 'white', letterSpacing: '0.05em'
                                            }}>
                                                {isCritical ? 'CRITICAL' : isHigh ? 'ALERT' : isHistorical ? 'CONTEXT' : 'NEWS'}
                                            </span>
                                            <span className="text-[#64748b] text-[9px]">SOURCE: REUTERS</span>
                                        </div>
                                        
                                        <h4 className="text-[13px] leading-relaxed text-[#e2e8f0] font-sans font-medium">
                                            {item.headline}
                                        </h4>
                                        
                                        {item.sentiment && (
                                            <div>
                                                 <SentimentBadge sentiment={item.sentiment} />
                                            </div>
                                        )}
                                        
                                        {/* Fake extra details for depth on high/critical items */}
                                        {(isCritical || isHigh) && (
                                            <div className="mt-3 pt-3 border-t border-[#1c2635] flex items-center gap-3 text-[10px] text-[#475569]">
                                                <div className="flex items-center gap-1">
                                                    <AlertOctagon className="w-3 h-3" /> VOLATILITY WARNING
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
