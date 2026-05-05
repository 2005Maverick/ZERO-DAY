'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface Toast {
    id: string
    title: string
    message?: string
    type: ToastType
    duration?: number
}

interface ToastContextType {
    toast: (toast: Omit<Toast, 'id'>) => void
    dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const toast = useCallback(({ ...props }: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2, 9)
        setToasts((prev) => [...prev, { id, ...props }])

        if (props.duration !== Infinity) {
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id))
            }, props.duration || 4000)
        }
    }, [])

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toast, dismiss }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((t) => (
                        <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const duration = toast.duration || 4000

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
    }

    const borders = {
        success: 'border-emerald-500/20 bg-emerald-500/5',
        error: 'border-red-500/20 bg-red-500/5',
        info: 'border-blue-500/20 bg-blue-500/5',
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`pointer-events-auto relative overflow-hidden w-[320px] rounded-xl border ${borders[toast.type]} bg-[#111] backdrop-blur-xl shadow-2xl flex items-start p-4 gap-3`}
        >
            <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-white">{toast.title}</p>
                {toast.message && <p className="text-[13px] text-white/50 mt-1 leading-relaxed">{toast.message}</p>}
            </div>
            <button
                onClick={onDismiss}
                className="text-white/25 hover:text-white/60 transition-colors flex-shrink-0"
            >
                <X className="w-4 h-4" />
            </button>
            
            {/* Depleting Progress Bar */}
            {duration !== Infinity && (
                <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 bg-white/5"
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: duration / 1000, ease: 'linear' }}
                    style={{ transformOrigin: 'left' }}
                >
                    <div className={`h-full w-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />
                </motion.div>
            )}
        </motion.div>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) throw new Error('useToast must be used within a ToastProvider')
    return context
}
