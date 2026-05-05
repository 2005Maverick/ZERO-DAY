'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Script from 'next/script'
import { type OHLCVCandle } from '@/lib/data/lehman-ohlcv'

/* ────────────────────────────────────────────────────────────
 * We load lightweight-charts from CDN via next/script.
 * The library attaches itself to window.LightweightCharts.
 * ──────────────────────────────────────────────────────────── */

declare global {
    interface Window {
        LightweightCharts: any
    }
}

interface Props {
    data: OHLCVCandle[]
}

interface OHLCDisplay {
    date: string
    open: number
    high: number
    low: number
    close: number
    volume: number
    isUp: boolean
}

export function CandlestickChart({ data }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<any>(null)
    const candleSeriesRef = useRef<any>(null)
    const [libReady, setLibReady] = useState(false)
    const [ohlc, setOhlc] = useState<OHLCDisplay | null>(null)
    const [activeRange, setActiveRange] = useState<'1D' | '1W' | '1M'>('1M')

    // ─── Build chart when library + container are ready ────
    const initChart = useCallback(() => {
        if (!containerRef.current || !window.LightweightCharts || chartRef.current) return
        const LWC = window.LightweightCharts

        const chart = LWC.createChart(containerRef.current, {
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
            layout: {
                background: { type: 'solid', color: '#131722' },
                textColor: '#787b86',
                fontSize: 11,
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
            },
            grid: {
                vertLines: { color: 'rgba(255,255,255,0.06)' },
                horzLines: { color: 'rgba(255,255,255,0.06)' },
            },
            crosshair: {
                mode: 1,
                vertLine: {
                    color: 'rgba(255,255,255,0.3)',
                    labelBackgroundColor: '#2a2e39',
                },
                horzLine: {
                    color: 'rgba(255,255,255,0.3)',
                    labelBackgroundColor: '#2a2e39',
                },
            },
            rightPriceScale: {
                borderColor: 'rgba(255,255,255,0.1)',
                scaleMargins: { top: 0.05, bottom: 0.2 },
            },
            timeScale: {
                borderColor: 'rgba(255,255,255,0.1)',
                rightOffset: 8,
                barSpacing: 8,
                minBarSpacing: 2,
                timeVisible: true,
                secondsVisible: false,
                tickMarkFormatter: (time: string) => {
                    const d = new Date(time)
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                    return months[d.getUTCMonth()]
                },
            },
            handleScroll: true,
            handleScale: true,
        })
        chart.timeScale().applyOptions({
            barSpacing: 8,
            minBarSpacing: 2,
            rightOffset: 8,
            fixLeftEdge: false,
            fixRightEdge: false,
        })

        chartRef.current = chart

        // ─── Candlestick series ────
        const candleSeries = chart.addCandlestickSeries({
            upColor: '#26a69a',        
            downColor: '#ef5350',      
            borderVisible: false,      
            wickUpColor: '#26a69a',    
            wickDownColor: '#ef5350',  
            priceLineVisible: true,
            priceLineColor: '#ef5350',
            priceLineWidth: 1,
            priceLineStyle: 2,
            lastValueVisible: true,
        })
        candleSeriesRef.current = candleSeries

        // Map OHLCV data
        const candleData = data.map(c => ({
            time: c.date,
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
        }))
        candleSeries.setData(candleData)

        // ─── Volume histogram ────
        const volumeSeries = chart.addHistogramSeries({
            priceFormat: { type: 'volume' },
            priceScaleId: 'volume',
        })
        chart.priceScale('volume').applyOptions({
            scaleMargins: { top: 0.8, bottom: 0 },
        })

        const volumeData = data.map(c => ({
            time: c.date,
            value: c.volume * 1_000_000,
            color: c.close >= c.open
                ? 'rgba(38,166,154,0.5)'
                : 'rgba(239,83,80,0.5)',
        }))
        volumeSeries.setData(volumeData)

        // ─── TODAY marker (dashed gold vertical line at last candle) ────
        const todayLine = chart.addLineSeries({
            color: 'rgba(245, 158, 11, 0.6)',
            lineWidth: 1,
            lineStyle: LWC.LineStyle.Dashed,
            priceLineVisible: false,
            lastValueVisible: false,
            crosshairMarkerVisible: false,
        })
        // Vertical-line hack: two points at same time, spanning price range
        const lastDate = data[data.length - 1].date
        todayLine.setData([
            { time: lastDate, value: data[data.length - 1].low * 0.8 },
            { time: lastDate, value: data[data.length - 1].high * 1.5 },
        ])

        // ─── Crosshair OHLCV tracking ────
        chart.subscribeCrosshairMove((param: any) => {
            if (!param || !param.seriesData || !param.seriesData.has(candleSeries)) {
                setOhlc(null)
                return
            }
            const candle = param.seriesData.get(candleSeries)
            if (!candle || candle.open === undefined) {
                setOhlc(null)
                return
            }
            const volEntry = param.seriesData.get(volumeSeries)
            const vol = volEntry ? volEntry.value / 1_000_000 : 0

            // Find label
            const matched = data.find(d => d.date === candle.time)
            setOhlc({
                date: matched?.dateLabel || candle.time,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: Math.round(vol),
                isUp: candle.close >= candle.open,
            })
        })

        // Fit content
        chart.timeScale().fitContent()
    }, [data])

    // ─── Handle library ready ────
    useEffect(() => {
        if (libReady) initChart()
    }, [libReady, initChart])

    // ─── Resize handler ────
    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current && containerRef.current) {
                chartRef.current.applyOptions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                })
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // ─── Time range buttons ────
    const handleRangeChange = useCallback((range: '1D' | '1W' | '1M') => {
        setActiveRange(range)
        if (!chartRef.current || data.length === 0) return

        const lastIdx = data.length - 1
        let fromIdx = 0

        if (range === '1D') {
            fromIdx = Math.max(0, lastIdx - 1)
        } else if (range === '1W') {
            fromIdx = Math.max(0, lastIdx - 5)
        } else {
            fromIdx = 0
        }

        chartRef.current.timeScale().setVisibleRange({
            from: data[fromIdx].date,
            to: data[lastIdx].date,
        })
    }, [data])

    // ─── Fallback: if the library was already loaded (e.g. cached) ────
    useEffect(() => {
        if (window.LightweightCharts) {
            setLibReady(true)
        }
    }, [])

    // Default OHLC (last candle)
    const lastCandle = data[data.length - 1]
    const displayOhlc = ohlc || (lastCandle ? {
        date: lastCandle.dateLabel,
        open: lastCandle.open,
        high: lastCandle.high,
        low: lastCandle.low,
        close: lastCandle.close,
        volume: lastCandle.volume,
        isUp: lastCandle.close >= lastCandle.open,
    } : null)

    return (
        <>
            <Script
                src="https://unpkg.com/lightweight-charts@4.1.3/dist/lightweight-charts.standalone.production.js"
                strategy="afterInteractive"
                onLoad={() => setLibReady(true)}
            />

            <div className="relative w-full h-full" style={{ backgroundColor: '#000' }}>
                {/* Chart container */}
                <div ref={containerRef} className="w-full h-full" />

                {/* ─── Floating OHLCV header (top-left) ──── */}
                {displayOhlc && (
                    <div
                        className="absolute top-0 left-0 z-10 pointer-events-none"
                        style={{ fontFamily: 'monospace', padding: '8px 12px', fontSize: '13px' }}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="text-xs font-bold px-1.5 py-0.5 rounded"
                                style={{
                                    backgroundColor: '#1a0000',
                                    border: '1px solid #dc2626',
                                    color: '#ef4444',
                                    fontFamily: 'var(--font-bebas)',
                                    letterSpacing: '0.05em',
                                }}
                            >
                                LEH
                            </span>
                            <span className="text-[11px] text-white/30">July – Sept 2008</span>
                        </div>
                        <div className="flex items-center gap-1 text-[13px]">
                            <span style={{ color: '#787b86' }}>O </span>
                            <span style={{ color: displayOhlc.open > displayOhlc.close ? '#ef5350' : '#26a69a' }}>
                                {displayOhlc.open.toFixed(2)}
                            </span>
                            <span style={{ color: '#787b86' }}> H </span>
                            <span style={{ color: '#26a69a' }}>{displayOhlc.high.toFixed(2)}</span>
                            <span style={{ color: '#787b86' }}> L </span>
                            <span style={{ color: '#ef5350' }}>{displayOhlc.low.toFixed(2)}</span>
                            <span style={{ color: '#787b86' }}> C </span>
                            <span style={{ color: displayOhlc.close > displayOhlc.open ? '#26a69a' : '#ef5350' }}>
                                {displayOhlc.close.toFixed(2)}
                            </span>
                            <span style={{ color: '#787b86' }}> V </span>
                            <span style={{ color: '#787b86' }}>
                                {displayOhlc.volume.toFixed(1)}M
                            </span>
                        </div>
                    </div>
                )}

                {/* ─── TODAY floating label ──── */}
                <div
                    className="absolute top-2 z-10 pointer-events-none"
                    style={{
                        right: '72px',
                        backgroundColor: 'rgba(245,158,11,0.15)',
                        border: '1px solid rgba(245,158,11,0.3)',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        color: '#f59e0b',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        fontFamily: "var(--font-jetbrains), monospace",
                        letterSpacing: '0.1em',
                    }}
                >
                    TODAY
                </div>

                {/* ─── Time period buttons (top-right) ──── */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1">
                    {(['1D', '1W', '1M'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => handleRangeChange(range)}
                            className="transition-all duration-150"
                            style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 500,
                                cursor: 'pointer',
                                backgroundColor: activeRange === range ? '#1a1a1a' : 'transparent',
                                border: activeRange === range ? '1px solid #333' : '1px solid transparent',
                                color: activeRange === range ? '#fff' : '#6b7280',
                            }}
                        >
                            {range}
                        </button>
                    ))}
                </div>

                {/* ─── Keyboard hint bar (bottom) ──── */}
                <div
                    className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center"
                    style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        padding: '4px 12px',
                        color: 'rgba(255,255,255,0.15)',
                        fontSize: '10px',
                        fontFamily: "var(--font-jetbrains), monospace",
                        letterSpacing: '0.05em',
                    }}
                >
                    U = Up &nbsp;·&nbsp; D = Down &nbsp;·&nbsp; F = Flat &nbsp;·&nbsp; A = Ask AI
                </div>
            </div>
        </>
    )
}
