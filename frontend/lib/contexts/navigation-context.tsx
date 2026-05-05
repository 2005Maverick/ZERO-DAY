'use client'

import { createContext, useContext, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useLoading } from '@/lib/contexts/loading-context'

// ─── Types ───────────────────────────────────────────────
interface NavigationContextType {
    navigateTo: (path: string) => void
    goBack: () => void
}

// ─── Context ─────────────────────────────────────────────
const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

// ─── Provider ────────────────────────────────────────────
export function NavigationProvider({ children }: { children: ReactNode }) {
    const router = useRouter()

    const { startLoading, stopLoading } = useLoading()

    const navigateTo = useCallback(
        (path: string) => {
            startLoading()
            router.push(path)
            // Stop loading after a brief frame buffer so the new page mounts
            setTimeout(() => stopLoading(), 150)
        },
        [router, startLoading, stopLoading]
    )

    const goBack = useCallback(() => {
        startLoading()
        router.back()
        setTimeout(() => stopLoading(), 400)
    }, [router, startLoading, stopLoading])

    return (
        <NavigationContext.Provider value={{ navigateTo, goBack }}>
            {children}
        </NavigationContext.Provider>
    )
}

// ─── Hook ────────────────────────────────────────────────
export function useNavigation() {
    const context = useContext(NavigationContext)
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider')
    }
    return context
}
