export function Logo({ className = '', size = 'default' }: { className?: string; size?: 'small' | 'default' | 'large' }) {
    const sizes = {
        small: { icon: 32, text: 'text-lg' },
        default: { icon: 48, text: 'text-2xl' },
        large: { icon: 80, text: 'text-5xl' }
    }

    const s = sizes[size]

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            {/* Icon */}
            <svg
                width={s.icon}
                height={s.icon}
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Chart arrow going up */}
                <path
                    d="M15 55 L35 35 L45 45 L65 20"
                    stroke="url(#logoGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
                {/* Arrow head */}
                <path
                    d="M55 20 L65 20 L65 30"
                    stroke="url(#logoGradient)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Text */}
            <div className={`${s.text} font-bold tracking-wider text-center`}>
                <span className="text-white">ZERO DAY</span>
                <br />
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                    MARKET
                </span>
            </div>
        </div>
    )
}

export function LogoHorizontal({ className = '' }: { className?: string }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Icon */}
            <svg
                width={36}
                height={36}
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M15 55 L35 35 L45 45 L65 20"
                    stroke="url(#logoGradientH)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
                <path
                    d="M55 20 L65 20 L65 30"
                    stroke="url(#logoGradientH)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
                <defs>
                    <linearGradient id="logoGradientH" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Text */}
            <div className="flex items-baseline gap-2">
                <span className="text-white font-bold text-xl tracking-wide">ZERO DAY</span>
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent font-bold text-xl tracking-wide">
                    MARKET
                </span>
            </div>
        </div>
    )
}
