import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface EmptyStateProps {
    title: string
    description: string
    action?: ReactNode
    icon?: ReactNode
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
            {icon ? (
                <div className="mb-6 text-white/20">
                    {icon}
                </div>
            ) : (
                <div className="mb-6 w-24 h-24 rounded-full bg-[#111] border border-[#1a1a1a] flex items-center justify-center relative overflow-hidden">
                    {/* SVG Illustration: empty chart with flat candles */}
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="8" y1="24" x2="40" y2="24" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="2" strokeDasharray="4 4"/>
                        <rect x="12" y="20" width="4" height="8" rx="1" fill="#ffffff" fillOpacity="0.15"/>
                        <rect x="22" y="20" width="4" height="8" rx="1" fill="#ffffff" fillOpacity="0.15"/>
                        <rect x="32" y="20" width="4" height="8" rx="1" fill="#ffffff" fillOpacity="0.15"/>
                        <line x1="14" y1="16" x2="14" y2="32" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="24" y1="16" x2="24" y2="32" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="2" strokeLinecap="round"/>
                        <line x1="34" y1="16" x2="34" y2="32" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </div>
            )}
            <h3 className="text-[18px] font-semibold text-white mb-2">{title}</h3>
            <p className="text-[14px] text-white/40 max-w-[280px] mb-6 leading-relaxed">
                {description}
            </p>
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    )
}
