'use client'

import React, { useRef } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    LayoutDashboard,
    Play,
    Trophy,
    BookOpen,
    Star,
    Search,
    Settings,
} from 'lucide-react'
import { useNavigation } from '@/lib/contexts/navigation-context'
import { useUser } from '@/lib/contexts/user-context'
import { useGlobalHotkeys } from '@/lib/hooks/use-global-hotkeys'

// ─── Nav Items ───────────────────────────────────────────
const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Scenarios', href: '/scenarios', icon: Play },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'Learn', href: '/learn', icon: BookOpen, dot: true },
    { label: 'Achievements', href: '/achievements', icon: Star },
    { label: 'Settings', href: '/settings', icon: Settings },
]

// ─── Component ───────────────────────────────────────────
interface SidebarProps {
    onLogout?: () => void
}

const BoltIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="white" />
    </svg>
)

export const Sidebar = React.memo(function Sidebar({ onLogout }: SidebarProps) {
    const pathname = usePathname()
    const { navigateTo } = useNavigation()
    const { user } = useUser()
    const searchRef = useRef<HTMLInputElement>(null)

    const firstName = user?.firstName || 'Pranav'
    const lastName = user?.lastName || 'Singh'
    const initials = `${firstName[0] || 'N'}`.toUpperCase()

    useGlobalHotkeys([
        {
            key: 'k',
            metaKey: true,
            action: (e) => {
                e.preventDefault()
                searchRef.current?.focus()
            },
        },
    ])

    return (
        <motion.aside
            className="fixed left-0 top-0 bottom-0 w-[var(--sidebar-width)] bg-[var(--bg-sidebar)] border-r border-[var(--border-default)] z-[100] flex flex-col justify-between py-[20px] transition-[width] duration-300"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
            role="navigation"
        >
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* ── Logo Block ──────────────────────────────────── */}
                <div className="flex items-center gap-[10px] px-[20px] mb-[24px]">
                    <div className="w-[32px] h-[32px] rounded-[6px] bg-[#dc2626] flex items-center justify-center flex-shrink-0">
                        <BoltIcon />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[14px] font-[800] text-[var(--text-primary)] tracking-[0.06em] uppercase leading-tight">
                            ZERO DAY
                        </span>
                        <span className="text-[11px] font-[600] text-[var(--text-secondary)] tracking-[0.1em] uppercase leading-tight">
                            MARKET
                        </span>
                    </div>
                </div>

                {/* ── Search Bar ────────────────────────────── */}
                <div className="px-[12px] mb-[24px]">
                    <div className="relative group">
                        <Search className="absolute left-[24px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[var(--text-tertiary)]" />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search scenarios..."
                            className="w-full h-[38px] pl-[34px] pr-[12px] bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[10px] text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] placeholder:italic focus:border-[#2d3f50] focus:outline-none focus:ring-0 transition-colors hover:border-[#2d3f50]"
                        />
                    </div>
                </div>

                {/* ── Navigation Menu ────────────────────────────── */}
                <nav className="flex-1 px-[8px] space-y-[2px] overflow-y-auto" role="navigation">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/') || (item.href === '/dashboard' && pathname === '/') // treat '/' as dashboard

                        return (
                            <div key={item.href} className={`rounded-r-[10px] ${isActive ? 'border-l-[3px] border-[var(--accent-green)]' : 'border-l-[3px] border-transparent'}`}>
                                <button
                                    onClick={() => navigateTo(item.href)}
                                    className={`
                                        relative w-full flex items-center gap-[12px] h-[42px] px-[12px] rounded-[10px] cursor-pointer transition-colors duration-150
                                        ${isActive 
                                            ? 'bg-[var(--sidebar-active-bg)] text-[var(--text-primary)] font-[600] rounded-l-none' 
                                            : 'bg-transparent text-[var(--text-secondary)] font-[500] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] rounded-l-[10px]'
                                        }
                                    `}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-[var(--accent-green)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'}`} />
                                    <span className="flex-1 text-left text-[14px]">{item.label}</span>

                                    {/* Pulsing dot badge */}
                                    {item.dot && (
                                        <span className="absolute right-[12px] top-1/2 -translate-y-1/2">
                                            <span className="block w-[8px] h-[8px] rounded-full bg-[var(--accent-green)]" />
                                        </span>
                                    )}
                                </button>
                            </div>
                        )
                    })}
                </nav>
            </div>

            {/* ── Bottom User Block ──────────────────────────── */}
            <div className="p-[12px] border-t border-[var(--border-default)] mt-auto">
                {/* LEVEL BADGE ROW */}
                <div className="flex items-center gap-[6px] mb-[6px]">
                    <Star className="w-[14px] h-[14px] text-[var(--text-secondary)]" />
                    <span className="text-[11px] font-[600] text-[var(--text-secondary)] tracking-[0.06em] uppercase">
                        LEVEL 1, NOVICE TRADER
                    </span>
                </div>

                {/* STATS ROW */}
                <div className="flex items-center gap-[6px] mb-[12px]">
                    <span className="text-[11px] text-[var(--text-secondary)]">0% accuracy</span>
                    <span className="text-[11px] text-[var(--text-tertiary)]">•</span>
                    <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">0 day 🔥</span>
                </div>

                {/* USER PROFILE ROW */}
                <div className="flex items-center gap-[10px]">
                    <div 
                        className="w-[36px] h-[36px] rounded-full flex items-center justify-center border-[1.5px] border-[var(--accent-green-glow)]"
                        style={{ background: 'linear-gradient(135deg, #1e3a5f, #0f2318)' }}
                    >
                        <span className="text-[15px] font-[700] text-[var(--text-primary)]">{initials || 'N'}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[13px] font-[600] text-[var(--text-primary)]">{firstName} {lastName}</span>
                        <div className="flex items-center gap-[5px]">
                            <span className="w-[7px] h-[7px] rounded-full bg-[var(--accent-green)]" />
                            <span className="text-[11px] text-[var(--accent-green)]">Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.aside>
    )
})
