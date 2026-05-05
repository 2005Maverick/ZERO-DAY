'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, TrendingDown, TrendingUp, Globe, Activity, Target, Crosshair, Award, Flame } from 'lucide-react'
import { useUser } from '@/lib/contexts/user-context'
import { Sidebar } from '@/components/layout/sidebar'
import { useNavigation } from '@/lib/contexts/navigation-context'

function getTimeGreeting(): string {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning,'
    if (h < 17) return 'Good afternoon,'
    return 'Good evening,'
}

const TICKER_ITEMS = [
    { symbol: 'LEH', change: '-93.2%', up: false },
    { symbol: 'AAPL', change: '+2.1%', up: true },
    { symbol: 'GOLD', change: '-1.5%', up: false },
    { symbol: 'US10Y', change: '-0.05', up: false },
    { symbol: 'BTC', change: '-5.2%', up: false },
    { symbol: 'SPY', change: '-1.2%', up: false },
    { symbol: '000', change: '-2.4%', up: false },
    { symbol: 'VIX', change: '-15.4%', up: false },
]
const TICKER_DISPLAY = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS]

const SparkleStar = () => (
    <motion.div 
        className="fixed bottom-[28px] right-[28px] z-50 cursor-pointer text-[#f1f5f9]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        whileHover={{ opacity: 1, rotate: 15, scale: 1.1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
    >
        <svg width="36" height="36" viewBox="0 0 36 36" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 0L19.5 16.5L36 18L19.5 19.5L18 36L16.5 19.5L0 18L16.5 16.5L18 0Z" />
        </svg>
    </motion.div>
)

export function DashboardContent() {
    const { user } = useUser()
    const { navigateTo } = useNavigation()
    const firstName = user?.firstName || 'Pranav'

    const [progressWidth, setProgressWidth] = useState(0)
    useEffect(() => {
        const timer = setTimeout(() => setProgressWidth(10), 800)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="flex min-h-screen bg-[var(--bg-base)] overflow-hidden">
            <Sidebar />

            <div className="flex-1 ml-[var(--sidebar-width)] h-screen flex flex-col relative overflow-hidden">
                <div className="h-[var(--ticker-height)] shrink-0 bg-[var(--bg-ticker)] border-b border-[var(--border-default)] overflow-hidden flex items-center w-full relative">
                    <motion.div 
                        className="flex items-center whitespace-nowrap h-full"
                        animate={{ x: [0, '-50%'] }}
                        transition={{ ease: "linear", duration: 28, repeat: Infinity }}
                        style={{ willChange: 'transform' }}
                    >
                        {TICKER_DISPLAY.map((item, i) => (
                            <React.Fragment key={i}>
                                <div className="flex items-center gap-[6px] px-[8px]">
                                    <span className="text-[12px] font-[600] text-[#94a3b8] uppercase">{item.symbol}</span>
                                    <span className={`text-[12px] font-[700] ${item.up ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>
                                        {item.change}
                                    </span>
                                </div>
                                <div className="text-[#1e2a35] mx-[16px] text-[12px]">|</div>
                            </React.Fragment>
                        ))}
                    </motion.div>
                </div>

                <div className="flex-1 overflow-y-auto px-[32px] py-[28px] w-full" style={{ scrollbarColor: '#2d3f50 transparent', scrollbarWidth: 'thin' }}>
                    
                    <motion.div 
                        className="mb-[28px]"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                    >
                        <div className="flex items-baseline mb-[4px]">
                            <span className="text-[26px] font-[400] text-[#94a3b8]">{getTimeGreeting()}&nbsp;</span>
                            <span className="text-[26px] font-[800] text-[var(--text-primary)]">{firstName}</span>
                        </div>
                        <p className="text-[14px] font-[400] text-[#64748b]">
                            Your edge is sharpening. Keep building.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-4 gap-[16px] mb-[20px]">
                        <motion.div 
                            className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[14px] p-[16px_20px] min-h-[110px] shadow-[var(--shadow-card)] relative hover:border-[#2d3f50] hover:-translate-y-[2px] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-200 flex flex-col justify-start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                        >
                            <div className="flex items-center gap-[6px] mb-[8px]">
                                <Target className="w-[14px] h-[14px] text-[#64748b]" />
                                <p className="text-[12px] font-[500] text-[#64748b] uppercase tracking-[0.05em]">Scenarios Completed</p>
                            </div>
                            <p className="text-[52px] font-[800] text-[var(--text-primary)] leading-[1] mb-[12px]">0</p>
                            <p className="text-[11px] text-[#475569] italic leading-[1.4] mt-auto">5 scenarios to first our first 5 scenarios!</p>
                        </motion.div>

                        <motion.div 
                            className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[14px] p-[16px_20px] min-h-[110px] shadow-[var(--shadow-card)] relative hover:border-[#2d3f50] hover:-translate-y-[2px] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col justify-start"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.38 }}
                        >
                            <div className="flex items-center gap-[6px] mb-[8px]">
                                <Crosshair className="w-[14px] h-[14px] text-[#64748b]" />
                                <p className="text-[12px] font-[500] text-[#64748b] uppercase tracking-[0.05em]">Accuracy (Overall)</p>
                            </div>
                            <div className="flex items-baseline mb-[12px]">
                                <p className="text-[52px] font-[800] text-[var(--text-primary)] leading-[1]">0%</p>
                            </div>
                            <p className="text-[11px] text-[#475569] italic leading-[1.4] mt-auto">Based on completed practice sessions</p>
                        </motion.div>

                        <motion.div 
                            className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[14px] p-[16px_20px] min-h-[110px] shadow-[var(--shadow-card)] relative hover:border-[#2d3f50] hover:-translate-y-[2px] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.46 }}
                        >
                            <div className="flex justify-between items-start mb-[8px]">
                                <div className="flex items-center gap-[6px]">
                                    <Award className="w-[14px] h-[14px] text-[#64748b]" />
                                    <p className="text-[12px] font-[500] text-[#64748b] uppercase tracking-[0.05em]">Trader Level</p>
                                </div>
                                <p className="text-[11px] text-[#64748b]">Global Rank: 1</p>
                            </div>
                            <p className="text-[32px] font-[800] text-[var(--text-primary)] uppercase tracking-[0.04em] mb-[10px] leading-[1]">NOVICE TRADER</p>
                            
                            <div className="w-full h-[6px] bg-[#1e2a35] rounded-[3px] overflow-hidden mb-[4px]">
                                <motion.div 
                                    className="h-full rounded-[3px]"
                                    style={{ background: 'linear-gradient(90deg, #dc2626, #f97316)' }}
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${progressWidth}%` }}
                                    transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
                                />
                            </div>
                            
                            <div className="grid grid-cols-3">
                                <p className="text-[11px] text-[var(--accent-orange)] font-[600]">10%</p>
                            </div>
                            
                            <div className="grid grid-cols-3 mt-[4px]">
                                <p className="text-[11px] text-[#475569] text-left">Level 1</p>
                                <p className="text-[11px] text-[#64748b] text-center whitespace-nowrap -ml-[20px]">Next Level (Apprentice Trader)</p>
                                <p className="text-[11px] text-[#475569] text-right">Level 1</p>
                            </div>
                        </motion.div>

                        <motion.div 
                            className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[14px] p-[16px_20px] min-h-[110px] shadow-[var(--shadow-card)] relative hover:border-[#2d3f50] hover:-translate-y-[2px] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.54 }}
                        >
                            <div className="flex items-center gap-[6px] mb-[8px]">
                                <Flame className="w-[14px] h-[14px] text-[#64748b]" />
                                <p className="text-[12px] font-[500] text-[#64748b] uppercase tracking-[0.05em]">Streak</p>
                            </div>
                            
                            <div className="flex items-start">
                                <div>
                                    <div className="flex items-baseline leading-[1]">
                                        <p className="text-[52px] font-[800] text-[var(--text-primary)]">7</p>
                                    </div>
                                    <p className="text-[14px] font-[700] text-[var(--text-primary)] mt-[4px]">7-Day</p>
                                    <p className="text-[11px] text-[#64748b]">Current</p>
                                    
                                    <div className="w-full h-[1px] bg-[#1e2a35] my-[10px]" />
                                    
                                    <p className="text-[11px] text-[#64748b]">Best: 14-Day</p>
                                </div>
                                
                                <div className="absolute top-[16px] right-[16px] grid grid-cols-3 grid-rows-2 gap-[8px]">
                                    <div className="w-[14px] h-[14px] rounded-full bg-[var(--accent-green)]" />
                                    <div className="w-[14px] h-[14px] rounded-full bg-[var(--accent-green)]" />
                                    <div className="w-[14px] h-[14px] rounded-full bg-[var(--accent-green)]" />
                                    <div className="w-[14px] h-[14px] rounded-full bg-[var(--accent-green)]" />
                                    <div className="w-[14px] h-[14px] rounded-full bg-[var(--accent-orange)]" />
                                    <div className="w-[14px] h-[14px] rounded-full bg-[#2d3f50]" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-12 gap-[16px] mb-[20px]">
                        <motion.div 
                            className="col-span-12 xl:col-span-7 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[14px] overflow-hidden relative min-h-[200px] hover:border-[#2d3f50] hover:-translate-y-[2px] transition-all duration-200"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.6 }}
                            style={{ boxShadow: 'var(--shadow-card)' }}
                        >
                            <div 
                                className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
                                style={{ background: 'radial-gradient(ellipse at 85% 50%, rgba(180,30,30,0.3) 0%, transparent 60%)' }}
                            />
                            
                            <div className="p-[22px_24px] relative z-10 w-full h-full flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-[6px] mb-[10px]">
                                            <Calendar className="w-[14px] h-[14px] text-[var(--accent-green)]" />
                                            <span className="text-[11px] font-[700] text-[var(--accent-green)] uppercase tracking-[0.1em]">
                                                DAILY CHALLENGE
                                            </span>
                                        </div>
                                        <h3 className="text-[22px] font-[800] text-[var(--text-primary)] leading-[1.2]">
                                            The Flash Crash of 2010
                                        </h3>
                                    </div>
                                    
                                    <div className="flex items-center gap-[6px] bg-[#1a1500] border border-[#eab30844] rounded-[20px] px-[10px] py-[4px]">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="#eab308" />
                                        </svg>
                                        <span className="text-[12px] font-[700] text-[#eab308]">+130 XP</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-[8px] mt-[12px]">
                                    {['Economies', 'Dow Jones', 'Recovery', 'Flashable'].map((tag) => (
                                        <span key={tag} className="bg-[#1a2030] border border-[#2d3f50] rounded-[20px] px-[12px] py-[5px] text-[12px] font-[500] text-[#94a3b8]">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-[18px]">
                                    <button className="flex items-center gap-[8px] bg-[var(--accent-green)] hover:bg-[#16a34a] text-[#000000] text-[14px] font-[700] px-[22px] py-[11px] rounded-[10px] transition-all duration-200 hover:translate-x-[2px] shadow-lg">
                                        Accept Challenge
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="absolute right-[-10px] bottom-[20px] w-[220px] h-[80px] pointer-events-none">
                                <svg width="220" height="80" viewBox="0 0 220 80" className="overflow-visible">
                                    <path d="M0 40 Q20 35 40 38 T80 30 T120 50 T140 70 L150 78 L160 30 T220 20" fill="none" stroke="#ef4444" strokeWidth="2" />
                                    <path d="M0 40 Q20 35 40 38 T80 30 T120 50 T140 70 L150 78 L160 30 T220 20 L220 80 L0 80 Z" fill="rgba(239, 68, 68, 0.15)" />
                                    <text x="145" y="90" fontSize="10" fill="#64748b" style={{fontFamily: 'var(--font-family)'}}>1040</text>
                                </svg>
                                
                                <div className="absolute left-[30px] top-[-30px] bg-[#1a0f0f] border border-[#ef444444] rounded-[20px] px-[12px] py-[4px]">
                                    <span className="text-[11px] font-[600] text-[#ef4444]">Crash Event</span>
                                </div>
                            </div>
                        </motion.div>

                        <div className="col-span-12 xl:col-span-5 grid grid-cols-2 grid-rows-2 gap-[12px]">
                            {[
                                { name: "Crashes", count: 55, gradient: "linear-gradient(135deg,#1a0a0a_0%,#2d1010_100%)", glow: "rgba(220,38,38,0.3)", color: 'hover:shadow-[0_4px_20px_rgba(239,68,68,0.2)]', border: 'hover:border-[var(--accent-green-glow)]', icon: TrendingDown, iconColor: 'text-red-400' },
                                { name: "Earnings", count: 27, gradient: "linear-gradient(135deg,#0a1a0f_0%,#0f2a18_100%)", glow: "rgba(34,197,94,0.3)", color: 'hover:shadow-[0_4px_20px_rgba(34,197,94,0.2)]', border: 'hover:border-[var(--accent-green-glow)]', icon: TrendingUp, iconColor: 'text-emerald-400' },
                                { name: "Economic", count: 8, gradient: "linear-gradient(135deg,#0a0f1a_0%,#101830_100%)", glow: "rgba(59,130,246,0.3)", color: 'hover:shadow-[0_4px_20px_rgba(59,130,246,0.2)]', border: 'hover:border-[rgba(59,130,246,0.5)]', icon: Globe, iconColor: 'text-blue-400' },
                                { name: "Technical", count: 4, gradient: "linear-gradient(135deg,#100a1a_0%,#1a0f2a_100%)", glow: "rgba(139,92,246,0.3)", color: 'hover:shadow-[0_4px_20px_rgba(139,92,246,0.2)]', border: 'hover:border-[rgba(139,92,246,0.5)]', icon: Activity, iconColor: 'text-purple-400' }
                            ].map((cat, i) => {
                                const Icon = cat.icon;
                                return (
                                <motion.div 
                                    key={i}
                                    className={`border border-[var(--border-default)] rounded-[12px] p-[16px] min-h-[130px] relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-200 flex flex-col justify-end ${cat.color} ${cat.border}`}
                                    style={{ background: cat.gradient }}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3, delay: 0.6 + (i*0.1) }}
                                >
                                    <div className="absolute inset-0" style={{ background: `radial-gradient(at 80% 50%, ${cat.glow} 0%, transparent 60%)` }} />
                                    <div className="absolute right-[-5px] bottom-[-5px] opacity-90 w-[120px] h-[100px] bg-white/5 rounded-tl-[100%] flex items-center justify-center">
                                        <Icon className={`w-[48px] h-[48px] opacity-20 ${cat.iconColor}`} />
                                    </div> 
                                    <div className="relative z-10">
                                        <p className="text-[16px] font-[700] text-[var(--text-primary)]">{cat.name}</p>
                                        <p className="text-[12px] text-[#64748b] mt-[2px]">{cat.count} scenarios</p>
                                    </div>
                                </motion.div>
                            )
                        })}
                        </div>
                    </div>

                    <div className="mb-[28px]">
                        <div className="flex flex-row overflow-x-auto gap-[14px] pb-[4px] snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {[
                                { name: "Crashes", count: 55, gradient: "linear-gradient(135deg,#1a0a0a_0%,#2d1010_100%)", glow: "rgba(220,38,38,0.3)", icon: TrendingDown, iconColor: 'text-red-400' },
                                { name: "Earnings", count: 27, gradient: "linear-gradient(135deg,#0a1a0f_0%,#0f2a18_100%)", glow: "rgba(34,197,94,0.3)", icon: TrendingUp, iconColor: 'text-emerald-400' },
                                { name: "Economic", count: 8, gradient: "linear-gradient(135deg,#0a0f1a_0%,#101830_100%)", glow: "rgba(59,130,246,0.3)", icon: Globe, iconColor: 'text-blue-400' },
                                { name: "Technical", count: 4, gradient: "linear-gradient(135deg,#100a1a_0%,#1a0f2a_100%)", glow: "rgba(139,92,246,0.3)", icon: Activity, iconColor: 'text-purple-400' },
                                { name: "Global...", count: 12, gradient: "linear-gradient(135deg,#1a1a0a_0%,#2d2d10_100%)", glow: "rgba(234,179,8,0.3)", icon: Globe, iconColor: 'text-yellow-400' },
                                { name: "Futures", count: 6, gradient: "linear-gradient(135deg,#0a1a1a_0%,#0f2d2d_100%)", glow: "rgba(14,165,233,0.3)", icon: TrendingUp, iconColor: 'text-sky-400' },
                            ].map((cat, i) => {
                                const Icon = cat.icon;
                                return (
                                <motion.div 
                                    key={i}
                                    className="w-[220px] h-[130px] shrink-0 border border-[var(--border-default)] rounded-[12px] p-[16px] relative overflow-hidden flex flex-col justify-end cursor-pointer hover:border-[var(--accent-green-glow)] hover:-translate-y-[2px] hover:shadow-[var(--shadow-card)] transition-all duration-200 snap-start"
                                    style={{ background: cat.gradient }}
                                >
                                    <div className="absolute inset-0" style={{ background: `radial-gradient(at 80% 50%, ${cat.glow} 0%, transparent 60%)` }} />
                                    <div className="absolute right-[-5px] bottom-[-5px] opacity-90 w-[120px] h-[100px] bg-white/5 rounded-tl-[100%] flex items-center justify-center">
                                        <Icon className={`w-[48px] h-[48px] opacity-20 ${cat.iconColor}`} />
                                    </div> 
                                    <div className="relative z-10">
                                        <p className="text-[15px] font-[700] text-[var(--text-primary)]">{cat.name}</p>
                                        <p className="text-[12px] text-[#64748b] mt-[2px]">{cat.count} scenarios</p>
                                    </div>
                                </motion.div>
                            )
                        })}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-[16px]">
                            <h2 className="text-[18px] font-[700] text-[var(--text-primary)]">Recommended for You</h2>
                            <button className="text-[13px] font-[500] text-[var(--accent-green)] hover:text-[#16a34a] hover:underline transition-all cursor-pointer">
                                View all →
                            </button>
                        </div>
                        
                        <div className="flex flex-row overflow-x-auto gap-[14px] pb-[4px] snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <motion.div 
                                    key={i}
                                    className="w-[280px] h-[160px] shrink-0 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[14px] p-[16px] relative cursor-pointer hover:border-[#2d3f50] hover:-translate-y-[2px] transition-all duration-200 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)] snap-start group"
                                >
                                    <div className="flex justify-between items-start mb-[10px]">
                                        <div className="flex items-center gap-[6px]">
                                            <span className="w-[8px] h-[8px] rounded-full bg-[var(--accent-green)]" />
                                            <span className="text-[12px] text-[#94a3b8] font-[500] tracking-[0.05em] uppercase">Earnings</span>
                                        </div>
                                        <span className="text-[12px] text-[#475569]">★★★★☆</span>
                                    </div>
                                    <h4 className="text-[15px] font-[600] text-white truncate mb-[6px]">Surprise Quarter Example {i}</h4>
                                    <p className="text-[12px] text-[#64748b] line-clamp-2">Test your ability to react to sudden earnings reports causing dramatic market shifts.</p>
                                    <div className="absolute bottom-[16px] left-[16px] flex gap-[12px]">
                                        <span className="text-[11px] text-[#475569]">8 min</span>
                                        <span className="text-[11px] text-[#475569]">8.1k views</span>
                                    </div>
                                    
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] rounded-[14px] transition-all duration-200">
                                        <div className="w-[48px] h-[48px] rounded-full bg-[var(--accent-green)] flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8 5V19L19 12L8 5Z" fill="white" />
                                            </svg>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                <SparkleStar />
            </div>
        </div>
    )
}
