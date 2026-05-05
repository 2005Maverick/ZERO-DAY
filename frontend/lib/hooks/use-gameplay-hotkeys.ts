'use client'

import { useEffect } from 'react'

interface GameplayHotkeysConfig {
    onUp: () => void
    onDown: () => void
    onFlat: () => void
    onLockIn: () => void
    onAskAI: () => void
    onSelectNews: (index: number) => void
    disabled?: boolean
}

export function useGameplayHotkeys({
    onUp,
    onDown,
    onFlat,
    onLockIn,
    onAskAI,
    onSelectNews,
    disabled = false
}: GameplayHotkeysConfig) {
    useEffect(() => {
        if (disabled) return

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target as HTMLElement).isContentEditable
            ) {
                return
            }

            const key = e.key.toLowerCase()

            switch (key) {
                case 'u':
                    e.preventDefault()
                    onUp()
                    break
                case 'd':
                    e.preventDefault()
                    onDown()
                    break
                case 'f':
                    e.preventDefault()
                    onFlat()
                    break
                case 'enter':
                    e.preventDefault()
                    onLockIn()
                    break
                case 'a':
                    e.preventDefault()
                    onAskAI()
                    break
                case '1':
                case '2':
                case '3':
                case '4':
                    e.preventDefault()
                    onSelectNews(parseInt(key, 10) - 1)
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [onUp, onDown, onFlat, onLockIn, onAskAI, onSelectNews, disabled])
}
