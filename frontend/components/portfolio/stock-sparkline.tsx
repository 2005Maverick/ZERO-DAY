'use client'

interface Props {
  prices: number[]
  color: string
  width?: number
  height?: number
  showVolume?: boolean
  volumes?: number[]
}

export function StockSparkline({ prices, color, width = 120, height = 40, showVolume = false, volumes = [] }: Props) {
  if (prices.length < 2) return null

  const chartHeight = showVolume ? height * 0.65 : height
  const volHeight = height * 0.3

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1

  const pts = prices.map((v, i) => {
    const x = (i / (prices.length - 1)) * width
    const y = chartHeight - ((v - min) / range) * (chartHeight - 2) - 1
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })

  const lastPrice = prices[prices.length - 1]
  const firstPrice = prices[0]
  const isPositive = lastPrice >= firstPrice

  // Gradient fill
  const fillPts = [
    `0,${chartHeight}`,
    ...pts,
    `${width},${chartHeight}`,
  ].join(' ')

  const maxVol = volumes.length > 0 ? Math.max(...volumes, 1) : 1

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <polygon
        points={fillPts}
        fill={`url(#grad-${color.replace('#', '')})`}
      />

      {/* Price line */}
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={isPositive ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Volume bars */}
      {showVolume && volumes.length > 0 && volumes.map((vol, i) => {
        const barW = Math.max(1, (width / volumes.length) - 0.5)
        const barH = (vol / maxVol) * volHeight
        const x = (i / volumes.length) * width
        return (
          <rect
            key={i}
            x={x}
            y={height - barH}
            width={barW}
            height={barH}
            fill={color}
            opacity={0.3}
          />
        )
      })}
    </svg>
  )
}
