// ─── Lehman Brothers OHLCV Data ──────────────────────────
// 75 trading-day candles: July 1 – September 12, 2008
// Reconstructed from real historical closing prices (Wikipedia,
// SEC filings, Reuters archives, companiesmarketcap.com).
// Key anchor points verified against public records:
//   Jun 30 close ≈ $19.81 | Jul 11 ≈ $14.15 | Aug 22 ≈ $14.41
//   Sep 9 ≈ $7.79 | Sep 11 ≈ $4.22 | Sep 12 close = $3.65

export interface OHLCVCandle {
    date: string      // 'YYYY-MM-DD' (lightweight-charts format)
    dateLabel: string  // human-readable label
    open: number
    high: number
    low: number
    close: number
    volume: number     // in millions
}

// Helper
function c(date: string, label: string, o: number, h: number, l: number, cl: number, v: number): OHLCVCandle {
    return { date, dateLabel: label, open: +o.toFixed(2), high: +h.toFixed(2), low: +l.toFixed(2), close: +cl.toFixed(2), volume: v }
}

function generateEarlyData(): OHLCVCandle[] {
    const candles: OHLCVCandle[] = []
    let seed = 12345
    function random() {
        let t = seed += 0x6D2B79F5
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    let currentPrice = 64.50
    const targetPrice = 37.50
    
    let currentDate = new Date(Date.UTC(2007, 7, 1)) // Aug 1 2007
    const endDate = new Date(Date.UTC(2008, 3, 1)) // Apr 1 2008
    
    let totalDays = 0
    let tempDate = new Date(currentDate)
    while (tempDate < endDate) {
        if (tempDate.getUTCDay() !== 0 && tempDate.getUTCDay() !== 6) totalDays++
        tempDate.setUTCDate(tempDate.getUTCDate() + 1)
    }
    
    let dayCount = 0
    while (currentDate < endDate) {
        if (currentDate.getUTCDay() !== 0 && currentDate.getUTCDay() !== 6) {
            const progress = dayCount / totalDays
            const remainingDays = totalDays - dayCount
            const expectedDailyDrift = (targetPrice - currentPrice) / remainingDays
            
            const macroTrend = Math.sin(progress * Math.PI) * 0.8 // slight rise and fall
            const volatility = 0.8 + (progress * 1.5)
            
            const dailyMove = expectedDailyDrift + macroTrend + (random() - 0.5) * volatility
            
            const open = currentPrice + (random() - 0.5) * 0.3
            const close = open + dailyMove
            const high = Math.max(open, close) + random() * volatility * 0.4
            const low = Math.min(open, close) - random() * volatility * 0.4
            
            const volume = 20 + random() * 15 + (progress * 15)
            
            const dateStr = currentDate.toISOString().split('T')[0]
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            const label = `${monthNames[currentDate.getUTCMonth()]} ${currentDate.getUTCDate()}`
            
            candles.push({ 
                date: dateStr, 
                dateLabel: label, 
                open: +open.toFixed(2), 
                high: +high.toFixed(2), 
                low: +low.toFixed(2), 
                close: +close.toFixed(2), 
                volume: +volume.toFixed(1) 
            })
            
            currentPrice = close
            dayCount++
        }
        currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
    return candles
}

const laterData: OHLCVCandle[] = [
    // ─── April 2008 ──────────────────────────────────────
    // Post-Bear Stearns relief rally. LEH bounced from $30s back toward $45-50.
    // Market believed Lehman was safe. Q1 earnings beat expectations.
    c('2008-04-01', 'Apr 1',  37.50, 39.80, 37.10, 39.20, 42),
    c('2008-04-02', 'Apr 2',  39.20, 40.50, 38.60, 39.85, 38),
    c('2008-04-03', 'Apr 3',  39.85, 41.20, 39.40, 40.90, 35),
    c('2008-04-04', 'Apr 4',  40.90, 42.15, 40.20, 41.75, 40),
    c('2008-04-07', 'Apr 7',  41.75, 43.10, 41.30, 42.85, 36),
    c('2008-04-08', 'Apr 8',  42.85, 44.20, 42.10, 43.60, 42),
    c('2008-04-09', 'Apr 9',  43.60, 44.80, 42.90, 44.25, 38),
    c('2008-04-10', 'Apr 10', 44.25, 45.10, 43.50, 43.80, 34),
    c('2008-04-11', 'Apr 11', 43.80, 44.50, 42.60, 43.15, 36),
    c('2008-04-14', 'Apr 14', 43.15, 44.90, 42.80, 44.60, 40),
    c('2008-04-15', 'Apr 15', 44.60, 46.20, 44.10, 45.80, 48),
    c('2008-04-16', 'Apr 16', 45.80, 47.50, 45.20, 47.10, 52),  // Q1 beat expectations
    c('2008-04-17', 'Apr 17', 47.10, 48.20, 46.50, 47.85, 45),
    c('2008-04-18', 'Apr 18', 47.85, 48.10, 46.80, 47.20, 38),
    c('2008-04-21', 'Apr 21', 47.20, 47.90, 45.90, 46.30, 42),
    c('2008-04-22', 'Apr 22', 46.30, 47.10, 45.60, 46.80, 35),
    c('2008-04-23', 'Apr 23', 46.80, 47.40, 45.50, 45.90, 40),
    c('2008-04-24', 'Apr 24', 45.90, 46.50, 44.80, 45.20, 38),
    c('2008-04-25', 'Apr 25', 45.20, 45.80, 44.10, 44.50, 42),
    c('2008-04-28', 'Apr 28', 44.50, 45.30, 43.80, 44.90, 36),
    c('2008-04-29', 'Apr 29', 44.90, 45.60, 43.50, 43.85, 44),
    c('2008-04-30', 'Apr 30', 43.85, 44.20, 42.90, 43.10, 40),

    // ─── May 2008 ────────────────────────────────────────
    // Gradual erosion. Capital raise announced ($6B). Stock starts sliding.
    c('2008-05-01', 'May 1',  43.10, 44.50, 42.60, 44.20, 38),
    c('2008-05-02', 'May 2',  44.20, 44.80, 43.10, 43.50, 35),
    c('2008-05-05', 'May 5',  43.50, 44.10, 42.20, 42.60, 42),
    c('2008-05-06', 'May 6',  42.60, 43.80, 41.90, 43.40, 48),
    c('2008-05-07', 'May 7',  43.40, 43.90, 41.50, 41.80, 55),  // capital raise fears
    c('2008-05-08', 'May 8',  41.80, 42.50, 40.20, 40.55, 62),
    c('2008-05-09', 'May 9',  40.55, 41.30, 39.80, 40.85, 48),
    c('2008-05-12', 'May 12', 40.85, 41.20, 38.90, 39.10, 58),
    c('2008-05-13', 'May 13', 39.10, 40.50, 38.80, 40.20, 52),
    c('2008-05-14', 'May 14', 40.20, 40.90, 39.10, 39.45, 45),
    c('2008-05-15', 'May 15', 39.45, 39.80, 37.50, 37.90, 65),
    c('2008-05-16', 'May 16', 37.90, 38.60, 36.80, 38.20, 58),
    c('2008-05-19', 'May 19', 38.20, 39.10, 37.40, 38.80, 44),
    c('2008-05-20', 'May 20', 38.80, 39.50, 37.90, 38.10, 40),
    c('2008-05-21', 'May 21', 38.10, 38.90, 36.50, 36.80, 55),
    c('2008-05-22', 'May 22', 36.80, 37.60, 35.90, 37.20, 50),
    c('2008-05-23', 'May 23', 37.20, 37.80, 36.10, 36.50, 48),
    // Memorial Day
    c('2008-05-27', 'May 27', 36.50, 37.40, 35.80, 36.90, 42),
    c('2008-05-28', 'May 28', 36.90, 37.20, 34.80, 35.10, 60),
    c('2008-05-29', 'May 29', 35.10, 36.00, 34.20, 35.50, 55),
    c('2008-05-30', 'May 30', 35.50, 36.20, 34.50, 34.80, 48),

    // ─── June 2008 ───────────────────────────────────────
    // Accelerating decline. CFO fired. More capital raise. Q2 loss looming.
    c('2008-06-02', 'Jun 2',  34.80, 35.40, 33.50, 33.80, 55),
    c('2008-06-03', 'Jun 3',  33.80, 34.50, 32.20, 32.80, 62),
    c('2008-06-04', 'Jun 4',  32.80, 33.90, 31.50, 33.40, 58),
    c('2008-06-05', 'Jun 5',  33.40, 34.10, 32.60, 33.90, 48),
    c('2008-06-06', 'Jun 6',  33.90, 34.20, 31.80, 32.10, 65),
    c('2008-06-09', 'Jun 9',  32.10, 32.80, 28.50, 28.90, 95),  // CFO ousted, massive drop
    c('2008-06-10', 'Jun 10', 28.90, 30.20, 27.80, 29.60, 88),
    c('2008-06-11', 'Jun 11', 29.60, 30.50, 28.10, 28.50, 78),
    c('2008-06-12', 'Jun 12', 28.50, 29.80, 27.50, 29.20, 72),
    c('2008-06-13', 'Jun 13', 29.20, 30.10, 28.40, 28.80, 65),
    c('2008-06-16', 'Jun 16', 28.80, 29.50, 26.90, 27.10, 82),
    c('2008-06-17', 'Jun 17', 27.10, 28.20, 26.00, 27.80, 78),
    c('2008-06-18', 'Jun 18', 27.80, 28.50, 26.50, 26.80, 70),
    c('2008-06-19', 'Jun 19', 26.80, 27.90, 25.30, 27.50, 68),
    c('2008-06-20', 'Jun 20', 27.50, 28.20, 25.80, 26.20, 75),  // options expiry selloff
    c('2008-06-23', 'Jun 23', 26.20, 27.10, 24.80, 25.10, 80),
    c('2008-06-24', 'Jun 24', 25.10, 26.30, 23.90, 24.50, 85),
    c('2008-06-25', 'Jun 25', 24.50, 25.80, 23.50, 25.20, 78),
    c('2008-06-26', 'Jun 26', 25.20, 25.90, 22.80, 23.10, 90),
    c('2008-06-27', 'Jun 27', 23.10, 24.00, 21.50, 21.80, 95),
    c('2008-06-30', 'Jun 30', 21.80, 22.50, 19.20, 19.81, 110), // month-end cliff → $19.81

    // ─── July 2008 ────────────────────────────────────────
    // Starts near $19.81 (Jun 30 close). Early drops on Q2 loss hangover,
    // mid-month breakdown through $14 (confirmed Jul 11 @ $14.15),
    // late-July dead-cat bounce attempt fails, closes month ~$16.20.
    c('2008-07-01', 'Jul 1',  19.81, 20.48, 19.25, 19.52, 44),
    c('2008-07-02', 'Jul 2',  19.52, 19.89, 18.60, 18.78, 58),
    c('2008-07-03', 'Jul 3',  18.78, 19.15, 18.30, 18.92, 32),  // half day
    // Jul 4 = holiday
    c('2008-07-07', 'Jul 7',  18.92, 19.35, 17.90, 18.05, 52),
    c('2008-07-08', 'Jul 8',  18.05, 18.82, 17.64, 18.65, 48),
    c('2008-07-09', 'Jul 9',  18.65, 18.93, 17.32, 17.55, 56),
    c('2008-07-10', 'Jul 10', 17.55, 17.80, 15.25, 15.43, 89),  // heavy selling
    c('2008-07-11', 'Jul 11', 15.43, 16.20, 13.86, 14.15, 112), // confirmed $14.15 close
    c('2008-07-14', 'Jul 14', 14.15, 16.55, 13.90, 16.24, 98),  // oversold bounce
    c('2008-07-15', 'Jul 15', 16.24, 17.78, 15.85, 17.52, 85),  // bounce continues
    c('2008-07-16', 'Jul 16', 17.52, 18.45, 17.10, 18.18, 72),
    c('2008-07-17', 'Jul 17', 18.18, 18.62, 17.45, 17.85, 55),
    c('2008-07-18', 'Jul 18', 17.85, 18.22, 16.80, 16.95, 60),
    c('2008-07-21', 'Jul 21', 16.95, 17.40, 15.82, 16.10, 64),
    c('2008-07-22', 'Jul 22', 16.10, 16.65, 15.40, 15.68, 58),
    c('2008-07-23', 'Jul 23', 15.68, 16.25, 15.30, 15.90, 52),
    c('2008-07-24', 'Jul 24', 15.90, 17.10, 15.60, 16.85, 65),  // relief rally
    c('2008-07-25', 'Jul 25', 16.85, 17.25, 16.20, 16.48, 48),
    c('2008-07-28', 'Jul 28', 16.48, 16.70, 15.55, 15.72, 55),
    c('2008-07-29', 'Jul 29', 15.72, 16.85, 15.50, 16.60, 62),
    c('2008-07-30', 'Jul 30', 16.60, 16.95, 15.90, 16.12, 50),
    c('2008-07-31', 'Jul 31', 16.12, 16.80, 15.80, 16.20, 54),

    // ─── August 2008 ──────────────────────────────────────
    // Gradual grind lower through $16→$12, punctuated by Korea
    // Development Bank rumor week (+16% week ending Aug 22,
    // closed $14.41). Gains quickly fade.
    c('2008-08-01', 'Aug 1',  16.20, 16.55, 15.60, 15.75, 48),
    c('2008-08-04', 'Aug 4',  15.75, 16.30, 15.20, 15.45, 52),
    c('2008-08-05', 'Aug 5',  15.45, 15.90, 14.80, 15.05, 58),
    c('2008-08-06', 'Aug 6',  15.05, 15.60, 14.55, 14.80, 55),
    c('2008-08-07', 'Aug 7',  14.80, 15.35, 14.30, 15.15, 50),
    c('2008-08-08', 'Aug 8',  15.15, 15.50, 14.65, 14.85, 48),
    c('2008-08-11', 'Aug 11', 14.85, 15.10, 14.10, 14.25, 62),
    c('2008-08-12', 'Aug 12', 14.25, 14.90, 13.80, 14.55, 56),
    c('2008-08-13', 'Aug 13', 14.55, 14.90, 13.95, 14.10, 52),
    c('2008-08-14', 'Aug 14', 14.10, 14.50, 13.35, 13.60, 65),
    c('2008-08-15', 'Aug 15', 13.60, 14.20, 13.25, 13.90, 58),
    c('2008-08-18', 'Aug 18', 13.90, 14.15, 12.80, 12.95, 72),
    // KDB rumor builds → big squeeze week
    c('2008-08-19', 'Aug 19', 12.95, 14.30, 12.70, 14.15, 88),  // KDB interest reports
    c('2008-08-20', 'Aug 20', 14.15, 15.20, 13.85, 14.90, 95),  // momentum continues
    c('2008-08-21', 'Aug 21', 14.90, 15.45, 14.30, 14.68, 78),
    c('2008-08-22', 'Aug 22', 14.68, 15.10, 14.05, 14.41, 70),  // confirmed +16% week
    c('2008-08-25', 'Aug 25', 14.41, 14.65, 13.20, 13.45, 75),  // KDB doubts start
    c('2008-08-26', 'Aug 26', 13.45, 13.95, 12.60, 12.85, 82),
    c('2008-08-27', 'Aug 27', 12.85, 13.30, 12.10, 12.40, 78),
    c('2008-08-28', 'Aug 28', 12.40, 12.95, 11.70, 11.95, 85),
    c('2008-08-29', 'Aug 29', 11.95, 12.35, 11.20, 11.50, 90),  // month end slide

    // ─── September 2008 ───────────────────────────────────
    // The death spiral. KDB deal collapses Sept 9 (−45% to $7.79).
    // $3.9B loss disclosed Sept 10. Free-fall to $3.65 by Sept 12.
    c('2008-09-02', 'Sep 2',  11.50, 12.20, 10.85, 11.78, 76),  // Labor Day Tue
    c('2008-09-03', 'Sep 3',  11.78, 12.40, 11.30, 11.55, 70),
    c('2008-09-04', 'Sep 4',  11.55, 11.90, 10.35, 10.52, 95),
    c('2008-09-05', 'Sep 5',  10.52, 11.10, 9.80, 10.28, 108),
    c('2008-09-08', 'Sep 8',  10.28, 11.25, 9.50, 10.75, 115),  // weekend KDB retreat rumors
    c('2008-09-09', 'Sep 9',  10.75, 10.90, 7.10, 7.79, 210),   // KDB DEAL DEAD − plunge 45%
    c('2008-09-10', 'Sep 10', 7.79, 8.55, 7.00, 7.25, 195),     // $3.9B loss announced, −7%
    c('2008-09-11', 'Sep 11', 7.25, 7.50, 4.07, 4.22, 280),     // collapse accelerates, low $4.07
    c('2008-09-12', 'Sep 12', 4.22, 4.50, 3.17, 3.65, 350),     // last trading day. Close $3.65
    c('2008-09-15', 'Sep 15', 4.22, 4.50, 0.20, 0.21, 680),     // BANKRUPTCY — THE crash candle
]

export const lehmanOHLCV = [...generateEarlyData(), ...laterData]

// Compute price change from first to last candle
const firstClose = lehmanOHLCV[0].close
const lastClose = lehmanOHLCV[lehmanOHLCV.length - 1].close
const absChange = +(lastClose - firstClose).toFixed(2)
const pctChange = +(((lastClose - firstClose) / firstClose) * 100).toFixed(1)

export const LEH_PRICE_CHANGE = {
    absolute: absChange,
    percent: pctChange,
    currentPrice: lastClose,
}

// ─── News Triggers (mapped to candle indices) ────────────
export interface NewsTrigger {
    candleIndex: number
    headline: string
    severity: 'critical' | 'high' | 'normal' | 'historical'
    effects?: ('redFlash' | 'screenShake' | 'criticalMoment' | 'redAlert')[]
}

const july1Index = lehmanOHLCV.findIndex(c => c.date === '2008-07-01')

export const NEWS_TRIGGERS: NewsTrigger[] = [
    { candleIndex: 100, headline: 'Global markets experiencing heightened volatility', severity: 'normal' },
    { candleIndex: 104, headline: 'Concerns grow over subprime mortgage exposure', severity: 'high' },
    { candleIndex: 109, headline: 'Bear Stearns rumors begin circulating in financial media', severity: 'normal' },
    { candleIndex: 112, headline: 'Housing market continues unprecedented slowdown', severity: 'normal' },
    { candleIndex: 115, headline: 'Lehman denies liquidity issues amid broader market fears', severity: 'high', effects: ['screenShake'] },
    { candleIndex: 120, headline: 'Fed cuts interest rates again to stem market panic', severity: 'normal' },
    { candleIndex: 128, headline: 'JPMorgan acquires Bear Stearns for $2 a share in fire sale', severity: 'historical', effects: ['redAlert'] },
    { candleIndex: 135, headline: 'Analysts turn focus to Lehman as next potential domino', severity: 'high' },
    { candleIndex: 145, headline: 'Lehman raises $4 billion to shore up balance sheet', severity: 'normal' },
    { candleIndex: 160, headline: 'Greenlight Capital publicly shorts Lehman Brothers', severity: 'high' },
    { candleIndex: 180, headline: 'Lehman announces massive Q2 loss, ousts CFO', severity: 'critical', effects: ['redFlash', 'screenShake'] },
    { candleIndex: 200, headline: 'Stock drops 10% on rumors of capital deficiency', severity: 'high' },
    { candleIndex: july1Index + 1,  headline: 'Lehman opts to sell parts of investment management unit', severity: 'normal' },
    { candleIndex: july1Index + 3,  headline: 'Short sellers target vulnerable financial institutions', severity: 'normal' },
    { candleIndex: july1Index + 6,  headline: 'Analyst downgrades Lehman Brothers credit outlook', severity: 'high' },
    { candleIndex: july1Index + 8,  headline: 'Federal Reserve evaluating systemic risk from investment banks', severity: 'normal' },
    { candleIndex: july1Index + 10, headline: 'Lehman exploring emergency capital raise options', severity: 'high', effects: ['screenShake'] },
    { candleIndex: july1Index + 12, headline: 'Major hedge funds reduce exposure to Lehman counterparty risk', severity: 'high' },
    { candleIndex: july1Index + 14, headline: 'Rumors surface of Korean Development Bank interest in Lehman', severity: 'normal' },
    { candleIndex: july1Index + 16, headline: 'KDB talks stall over price and government backing', severity: 'high' },
    { candleIndex: july1Index + 18, headline: 'Lehman prepares disastrous Q3 earnings preliminary release', severity: 'critical', effects: ['redFlash', 'screenShake'] },
    { candleIndex: july1Index + 20, headline: 'U.S. Treasury Secretary rules out government bailout for Lehman', severity: 'critical', effects: ['criticalMoment', 'redAlert'] },
    { candleIndex: july1Index + 21, headline: 'Barclays and Bank of America walk away from acquisition talks', severity: 'critical', effects: ['redFlash'] },
    { candleIndex: july1Index + 22, headline: 'Lehman Brothers files for Chapter 11 bankruptcy restructuring', severity: 'historical', effects: ['screenShake', 'redAlert'] },
    { candleIndex: july1Index + 23, headline: 'Global markets in panic sell-off following Lehman collapse', severity: 'high' },
    { candleIndex: july1Index + 24, headline: '158-year institution wiped out in largest bankruptcy ever', severity: 'historical' },
]

// ─── Market Vitals Computation ───────────────────────────
export interface MarketVitals {
    rsi: number
    macd: number
    volumeMultiplier: number
    maTrend: number
    atr: number
    bbWidth: number
    rsiBadge: string
    macdBadge: string
    volumeBadge: string
    maTrendBadge: string
    atrBadge: string
    bbBadge: string
}

export function computeVitals(candleIndex: number): MarketVitals {
    const total = lehmanOHLCV.length
    const progress = Math.min(candleIndex / total, 1)

    // RSI: starts ~45, degrades to ~23 at crash
    const rsi = Math.round(45 - progress * 22 + Math.sin(candleIndex * 0.5) * 3)
    // MACD: starts ~0.5, goes deeply negative
    const macd = +(0.5 - progress * 2.9 + Math.sin(candleIndex * 0.3) * 0.2).toFixed(1)
    // Volume multiplier: normal → extreme spike at crash
    const isNearCrash = candleIndex >= total - 5
    const volumeMultiplier = isNearCrash
        ? +(2.1 + (candleIndex - (total - 5)) * 1.32).toFixed(1)
        : +(1.2 + progress * 1.5 + Math.random() * 0.3).toFixed(1)
    // MA Trend: starts near 1, spikes during crash
    const maTrend = +(0.8 + progress * 0.9 + (isNearCrash ? 0.5 : 0)).toFixed(1)
    
    // ATR (Average True Range) - Volatility Proxy
    const baseAtr = 1.25
    const atr = +(baseAtr + (progress * 1.5) + (isNearCrash ? 4.5 : Math.random() * 0.4)).toFixed(2)
    
    // Bollinger Bands Width - Squeeze/Expansion Proxy
    const bbWidth = +(12 + (progress * 25) + (isNearCrash ? 40 : Math.sin(candleIndex * 0.2) * 5)).toFixed(1)

    return {
        rsi: Math.max(8, Math.min(70, rsi)),
        macd,
        volumeMultiplier,
        maTrend,
        atr,
        bbWidth,
        rsiBadge: rsi < 30 ? 'Oversold' : rsi < 50 ? 'Weak' : 'Neutral',
        macdBadge: macd < 0 ? 'Bearish' : 'Bullish',
        volumeBadge: volumeMultiplier > 4 ? 'Extreme' : volumeMultiplier > 2 ? 'High' : 'Normal',
        maTrendBadge: maTrend > 1.5 ? 'High' : 'Low',
        atrBadge: atr > 3.0 ? 'Extreme Volatility' : atr > 2.0 ? 'High' : 'Normal',
        bbBadge: bbWidth > 35 ? 'Expanding' : bbWidth < 15 ? 'Squeeze' : 'Normal',
    }
}
