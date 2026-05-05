'use client'

import { useEffect } from 'react'

type KeyCombo = {
    key: string
    ctrlKey?: boolean
    metaKey?: boolean
    action: (e: KeyboardEvent) => void
}

export function useGlobalHotkeys(shortcuts: KeyCombo[]) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if user is typing in an input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                // Allow ESC to naturally unfocus inputs if needed, or explicitly handle it
                if (e.key === 'Escape') {
                    const activeFallback = shortcuts.find((s) => s.key.toLowerCase() === 'escape')
                    if (activeFallback) {
                        e.preventDefault()
                        activeFallback.action(e)
                        return
                    }
                }
                return
            }

            for (const shortcut of shortcuts) {
                const matchKey = e.key.toLowerCase() === shortcut.key.toLowerCase()
                if (!matchKey) continue

                const matchCtrl = shortcut.ctrlKey ? (e.metaKey || e.ctrlKey) : true
                const matchMeta = shortcut.metaKey ? (e.metaKey || e.ctrlKey) : true

                if (matchCtrl && matchMeta) {
                    e.preventDefault()
                    shortcut.action(e)
                    break
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [shortcuts])
}
