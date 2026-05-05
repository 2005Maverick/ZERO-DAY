'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, BarChart3, TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react'
import type { MarketVitals } from '@/lib/data/lehman-ohlcv'

// ─── Sparkline SVG helper ────────────────────────────────
function Sparkline({ values, color, width = 200, height = 40 }: { values: number[]; color: string; width?: number; height?: number }) {
    if (values.length < 2) return null
    const min = Math.min(...values)
    const max = Math.max(...values)
    const range = max - min || 1
    const points = values.map((v, i) => {
        const x = (i / (values.length - 1)) * width
        const y = height - ((v - min) / range) * height
        return `${x},${y}`
    }).join(' ')
    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <path d={`M 0,${height} L ${points} L ${width},${height} Z`} fill={`url(#gradient-${color})`} opacity="0.1" />
            <defs>
                <linearGradient id={`gradient-${color}`} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="1" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
        </svg>
    )
}

interface Props {
  isOpen: boolean
  onClose: () => void
  vitals: MarketVitals
  history: {
      rsi: number[]
      macd: number[]
      vol: number[]
      ma: number[]
  }
}

export function MarketDrawer({ isOpen, onClose, vitals, history }: Props) {
  const rsiColor = vitals.rsi < 30 ? '#ef4444' : vitals.rsi < 50 ? '#f97316' : '#22c55e'
  const macdColor = vitals.macd < 0 ? '#ef4444' : '#22c55e'
  const volColor = '#3b82f6'
  const maColor = vitals.maTrend > 1.2 ? '#22c55e' : '#ef4444'

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
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-[#0a0d0f] border-l border-[#1c2635] z-[500] flex flex-col shadow-2xl"
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c2635] bg-[#0d1117] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white tracking-wide">Market Analysis</h3>
                  <p className="text-[11px] text-[#64748b]">Advanced Technical Indicators</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#1c2635] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}>
                
              {/* RSI Section */}
              <div className="mb-6 bg-[#111820] border border-[#1c2635] rounded-xl p-4">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h4 className="flex items-center gap-2 text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                              <Activity className="w-3.5 h-3.5" /> RSI Momentum
                          </h4>
                          <span style={{
                              fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                              backgroundColor: vitals.rsiBadge === 'Oversold' ? '#2d0f0f' : '#1c2635',
                              color: vitals.rsiBadge === 'Oversold' ? '#ef4444' : '#94a3b8',
                              border: `1px solid ${vitals.rsiBadge === 'Oversold' ? 'rgba(239,68,68,0.3)' : 'transparent'}`
                          }}>
                              {vitals.rsiBadge}
                          </span>
                      </div>
                      <div className="text-right">
                          <div className="text-[28px] font-black leading-none" style={{ color: rsiColor }}>
                              {vitals.rsi}
                          </div>
                          <div className="text-[10px] text-[#64748b] mt-1">14 Period / Close</div>
                      </div>
                  </div>
                  <div className="h-[50px] w-full" style={{ borderBottom: '1px solid #1c2635' }}>
                    {history.rsi.length > 0 && <Sparkline values={history.rsi} color={rsiColor} width={320} height={50} />}
                  </div>
                  <div className="flex justify-between mt-2 text-[9px] font-bold text-[#475569]">
                      <span>Overbought (70)</span>
                      <span>Oversold (30)</span>
                  </div>
              </div>

              {/* MACD Section */}
              <div className="mb-6 bg-[#111820] border border-[#1c2635] rounded-xl p-4">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h4 className="flex items-center gap-2 text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                              {vitals.macd >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />} 
                              MACD Trend
                          </h4>
                          <span style={{
                              fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                              backgroundColor: vitals.macdBadge === 'Bearish' ? '#2d0f0f' : '#0f2d1a',
                              color: vitals.macdBadge === 'Bearish' ? '#ef4444' : '#22c55e',
                              border: `1px solid ${vitals.macdBadge === 'Bearish' ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`
                          }}>
                              {vitals.macdBadge} Divergence
                          </span>
                      </div>
                      <div className="text-right">
                          <div className="text-[24px] font-black leading-none" style={{ color: macdColor }}>
                              {vitals.macd > 0 ? '+' : ''}{vitals.macd.toFixed(2)}
                          </div>
                      </div>
                  </div>
                  <div className="h-[40px] w-full relative">
                      {/* Zero line */}
                      <div className="absolute w-full h-px bg-[#334155] top-1/2 -translate-y-1/2 z-0" />
                      <div className="relative z-10 opacity-80">
                         {history.macd.length > 0 && <Sparkline values={history.macd} color={macdColor} width={320} height={40} />}
                      </div>
                  </div>
              </div>

              {/* Volume Profile Section */}
              <div className="mb-6 bg-[#111820] border border-[#1c2635] rounded-xl p-4">
                  <div className="flex justify-between items-start mb-4">
                      <div>
                          <h4 className="flex items-center gap-2 text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">
                              <BarChart3 className="w-3.5 h-3.5" /> Volume Profile
                          </h4>
                          <span style={{
                              fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                              backgroundColor: vitals.volumeBadge === 'Extreme' ? '#2d0f0f' : '#1c2635',
                              color: vitals.volumeBadge === 'Extreme' ? '#ef4444' : '#3b82f6',
                              border: `1px solid ${vitals.volumeBadge === 'Extreme' ? 'rgba(239,68,68,0.3)' : 'transparent'}`
                          }}>
                              {vitals.volumeBadge} Spikes
                          </span>
                      </div>
                      <div className="text-right">
                          <div className="text-[24px] font-black leading-none" style={{ color: volColor }}>
                              {vitals.volumeMultiplier.toFixed(1)}x
                          </div>
                          <div className="text-[10px] text-[#64748b] mt-1">vs 20-Day Avg</div>
                      </div>
                  </div>
                  <div className="h-[40px] w-full flex items-end gap-1">
                      {history.vol.map((v, i) => {
                          const h = Math.min((v / 5) * 100, 100) // cap at 5x for visual Scale
                          return (
                              <div key={i} className="flex-1 bg-blue-500/20 hover:bg-blue-500/40 transition-colors rounded-t-sm relative group" style={{ height: `${h}%` }}>
                                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#1c2635] text-white text-[9px] px-1 py-0.5 rounded pointer-events-none">
                                      {v.toFixed(1)}x
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              </div>

              {/* Moving Averages Overview */}
              <div className="bg-[#111820] border border-[#1c2635] rounded-xl p-4">
                  <h4 className="flex items-center gap-2 text-[12px] font-bold text-[#94a3b8] uppercase tracking-wider mb-4">
                      <AlertTriangle className="w-3.5 h-3.5" /> Moving Averages (Trend)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[#080b0e] border border-[#1c2635] rounded-lg p-3">
                          <div className="text-[10px] text-[#64748b] mb-1 font-bold">20 SMA</div>
                          <div className="text-[14px] font-bold" style={{ color: maColor }}>
                              {((vitals.maTrend - 1) * -100).toFixed(1)}%
                          </div>
                          <div className="text-[9px] text-[#475569] mt-0.5">Deviation from mean</div>
                      </div>
                      <div className="bg-[#080b0e] border border-[#1c2635] rounded-lg p-3">
                          <div className="text-[10px] text-[#64748b] mb-1 font-bold">50 / 200 SMA</div>
                          <div className="text-[12px] font-bold text-[#ef4444]">
                               Death Cross
                          </div>
                          <div className="text-[9px] text-[#475569] mt-0.5">Macro trend status</div>
                      </div>
                  </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-[#1c2635] bg-[#0d1117] shrink-0">
               <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3 items-start">
                   <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                   <p className="text-[11px] text-amber-500/90 leading-relaxed font-medium">
                       These are lagging indicators. Severe fundamental news events will override technical support levels during a crisis.
                   </p>
               </div>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
