import { Variants } from 'framer-motion'

// Standard entrance animations

export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
}

export const slideUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
}

export const slideRight: Variants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
}

export const scaleIn: Variants = {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
}

export const staggerContainer: Variants = {
    animate: {
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
}

export const staggerItem: Variants = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
}

// Dramatic variants (for results, briefing)
export const dramaticReveal: Variants = {
    initial: { opacity: 0, scale: 0.9, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0 },
}

// Shake (for validation errors)
export const shake: Variants = {
    animate: {
        x: [0, -8, 8, -6, 6, -4, 4, 0],
        transition: { duration: 0.4, ease: 'easeInOut' }
    }
}

// Pulse (for streak, important elements)
export const pulseGlow = (color: string): Variants => ({
    animate: {
        boxShadow: [
            `0 0 0 0 ${color}00`,
            `0 0 0 8px ${color}30`,
            `0 0 0 0 ${color}00`
        ],
        transition: { duration: 2, repeat: Infinity }
    }
})

// Custom transition to use with the standard variants above
export const transitionDefaults = {
    standard: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    slide: { duration: 0.3, ease: [0, 0, 0.2, 1] },
    spring: { duration: 0.6, type: 'spring', bounce: 0.4 },
    dramatic: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
    bouncy: { duration: 0.4, type: 'spring', bounce: 0.6 }
}
