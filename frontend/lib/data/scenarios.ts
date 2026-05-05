// ─── Scenario Data ───────────────────────────────────────
// Single source of truth for all scenarios, used by Library + Briefing screens.

export interface Scenario {
    id: string
    slug: string
    title: string
    subtitle: string
    ticker: string
    company: string
    date: string
    dateShort: string
    marketTime: string
    category: 'crash' | 'earnings' | 'economic' | 'technical' | 'blackswan' | 'social'
    categoryLabel: string
    difficulty: number
    difficultyLabel: string
    estimatedTime: number
    plays: number
    playsFormatted: string
    solveRate: number
    isNew: boolean
    isFeatured: boolean
    isTrending: boolean
    description: string
    briefingText: string
    sparklineData: number[]
    accentColor: string
    keyStats: { value: string; numericValue: number; label: string; color: string }[]
}

export const CATEGORY_META: Record<string, { dot: string; label: string }> = {
    crash: { dot: '#ef4444', label: 'Market Crash' },
    earnings: { dot: '#3b82f6', label: 'Earnings' },
    economic: { dot: '#f97316', label: 'Economic' },
    technical: { dot: '#a855f7', label: 'Technical' },
    blackswan: { dot: '#eab308', label: 'Black Swan' },
    social: { dot: '#ec4899', label: 'Social / Momentum' },
}

export const scenarios: Scenario[] = [
    {
        id: 'lehman-2008',
        slug: 'lehman-2008',
        title: 'Lehman Brothers Collapse',
        subtitle: 'When 158 years ended overnight',
        ticker: 'LEH',
        company: 'Lehman Brothers Holdings Inc.',
        date: 'September 15, 2008',
        dateShort: 'Sept 2008',
        marketTime: '07:23 AM EST — PRE-MARKET',
        category: 'crash',
        categoryLabel: 'Market Crash',
        difficulty: 4,
        difficultyLabel: 'Hard',
        estimatedTime: 12,
        plays: 5200,
        playsFormatted: '5.2k',
        solveRate: 31,
        isNew: false,
        isFeatured: true,
        isTrending: false,
        description: 'The collapse of Lehman Brothers marked the largest bankruptcy filing in U.S. history and triggered the global financial crisis.',
        briefingText: `The Lehman Brothers crisis has a 158-year institution teetering on the edge of collapse. Government <hl>bailout negotiations have failed</hl> overnight. Markets open in 47 minutes. <hl>Contagion risk</hl> is spreading across global financial systems. This is the moment everything changes.`,
        sparklineData: [100, 95, 98, 90, 85, 70, 55, 40, 30, 15, 8, 4],
        accentColor: '#dc2626',
        keyStats: [
            { value: '-94%', numericValue: 94, label: 'YTD PERFORMANCE', color: '#ef4444' },
            { value: '158', numericValue: 158, label: 'YEARS IN BUSINESS', color: '#eab308' },
            { value: '25,000', numericValue: 25000, label: 'EMPLOYEES', color: '#ffffff' },
            { value: '$639B', numericValue: 639, label: 'ASSETS AT RISK', color: '#ffffff' },
        ],
    },
    {
        id: 'covid-crash-2020',
        slug: 'covid-crash-2020',
        title: 'COVID Market Panic',
        subtitle: 'The fastest bear market in history',
        ticker: 'SPY',
        company: 'S&P 500 ETF Trust',
        date: 'March 16, 2020',
        dateShort: 'Mar 2020',
        marketTime: '09:30 AM EST — MARKET OPEN',
        category: 'crash',
        categoryLabel: 'Market Crash',
        difficulty: 3,
        difficultyLabel: 'Medium',
        estimatedTime: 10,
        plays: 12300,
        playsFormatted: '12.3k',
        solveRate: 44,
        isNew: false,
        isFeatured: true,
        isTrending: true,
        description: 'Global markets plunged as pandemic fears triggered the fastest bear market decline in history.',
        briefingText: `A novel virus has shut down economies worldwide. The S&P 500 has already fallen 12% this week. <hl>Circuit breakers have been triggered</hl> three times. Governments are scrambling to announce <hl>emergency stimulus packages</hl>. Markets are in freefall.`,
        sparklineData: [100, 98, 95, 90, 80, 65, 45, 35, 30, 28, 25, 20],
        accentColor: '#dc2626',
        keyStats: [
            { value: '-34%', numericValue: 34, label: 'PEAK DECLINE', color: '#ef4444' },
            { value: '33', numericValue: 33, label: 'DAYS TO BOTTOM', color: '#eab308' },
            { value: '3', numericValue: 3, label: 'CIRCUIT BREAKERS', color: '#ffffff' },
            { value: '$6T', numericValue: 6, label: 'STIMULUS PLEDGED', color: '#ffffff' },
        ],
    },
    {
        id: 'apple-earnings-2020',
        slug: 'apple-earnings-2020',
        title: "Apple's Surprise Quarter",
        subtitle: 'When services saved the story',
        ticker: 'AAPL',
        company: 'Apple Inc.',
        date: 'January 28, 2020',
        dateShort: 'Jan 2020',
        marketTime: '04:30 PM EST — AFTER HOURS',
        category: 'earnings',
        categoryLabel: 'Earnings',
        difficulty: 2,
        difficultyLabel: 'Easy',
        estimatedTime: 8,
        plays: 8100,
        playsFormatted: '8.1k',
        solveRate: 62,
        isNew: false,
        isFeatured: false,
        isTrending: false,
        description: "Apple reported a surprise earnings beat driven by record services revenue, defying analyst expectations.",
        briefingText: `Apple is about to report Q1 2020 earnings. Analysts are skeptical after <hl>iPhone sales warnings</hl> last quarter. The stock has run up 85% in 12 months. Can the <hl>services narrative</hl> carry another quarter? The options market is pricing a 5% move.`,
        sparklineData: [60, 62, 65, 68, 72, 78, 85, 90, 88, 92, 95, 98],
        accentColor: '#3b82f6',
        keyStats: [
            { value: '+7%', numericValue: 7, label: 'AFTER-HOURS MOVE', color: '#22c55e' },
            { value: '$91.8B', numericValue: 91, label: 'QUARTERLY REVENUE', color: '#ffffff' },
            { value: '56%', numericValue: 56, label: 'SERVICES GROWTH', color: '#eab308' },
            { value: '$1.3T', numericValue: 1300, label: 'MARKET CAP', color: '#ffffff' },
        ],
    },
    {
        id: 'gamestop-2021',
        slug: 'gamestop-2021',
        title: 'GameStop Short Squeeze',
        subtitle: 'Reddit vs. Wall Street',
        ticker: 'GME',
        company: 'GameStop Corp.',
        date: 'January 27, 2021',
        dateShort: 'Jan 2021',
        marketTime: '09:30 AM EST — MARKET OPEN',
        category: 'social',
        categoryLabel: 'Social / Momentum',
        difficulty: 5,
        difficultyLabel: 'Expert',
        estimatedTime: 15,
        plays: 15000,
        playsFormatted: '15k',
        solveRate: 8,
        isNew: false,
        isFeatured: true,
        isTrending: true,
        description: 'Reddit traders orchestrated a massive short squeeze on GameStop, sending shares up over 1,700% and shaking Wall Street.',
        briefingText: `A group of retail traders on Reddit's r/WallStreetBets have been <hl>coordinating a massive short squeeze</hl>. Short interest exceeds 140% of float. Multiple hedge funds are facing <hl>billions in potential losses</hl>. Brokers may restrict trading at any moment.`,
        sparklineData: [10, 12, 15, 20, 35, 60, 120, 200, 350, 480, 300, 150],
        accentColor: '#ec4899',
        keyStats: [
            { value: '+1,745%', numericValue: 1745, label: 'PEAK GAIN', color: '#22c55e' },
            { value: '140%', numericValue: 140, label: 'SHORT INTEREST', color: '#ef4444' },
            { value: '$13B', numericValue: 13, label: 'HEDGE FUND LOSSES', color: '#ef4444' },
            { value: '7.2M', numericValue: 7200, label: 'WSB MEMBERS', color: '#ffffff' },
        ],
    },
    {
        id: 'tesla-earnings-2019',
        slug: 'tesla-earnings-2019',
        title: 'Tesla Shocks the Bears',
        subtitle: 'The profit that changed everything',
        ticker: 'TSLA',
        company: 'Tesla Inc.',
        date: 'October 23, 2019',
        dateShort: 'Oct 2019',
        marketTime: '04:30 PM EST — AFTER HOURS',
        category: 'earnings',
        categoryLabel: 'Earnings',
        difficulty: 3,
        difficultyLabel: 'Medium',
        estimatedTime: 10,
        plays: 6800,
        playsFormatted: '6.8k',
        solveRate: 51,
        isNew: false,
        isFeatured: false,
        isTrending: false,
        description: "Tesla reported an unexpected quarterly profit, igniting a massive short squeeze and beginning its historic rally.",
        briefingText: `Tesla has been <hl>burning through cash</hl> for years. Analysts expect another loss this quarter. Short sellers have made Tesla their most-shorted stock. But whispers of a <hl>surprise profit</hl> are circulating. The after-hours session is about to get volatile.`,
        sparklineData: [45, 42, 40, 38, 35, 33, 30, 35, 50, 65, 80, 95],
        accentColor: '#3b82f6',
        keyStats: [
            { value: '+20%', numericValue: 20, label: 'NEXT-DAY MOVE', color: '#22c55e' },
            { value: '$143M', numericValue: 143, label: 'NET INCOME', color: '#22c55e' },
            { value: '97K', numericValue: 97, label: 'DELIVERIES', color: '#ffffff' },
            { value: '34%', numericValue: 34, label: 'SHORT INTEREST', color: '#ef4444' },
        ],
    },
    {
        id: 'netflix-miss-2019',
        slug: 'netflix-miss-2019',
        title: 'Netflix Subscriber Shock',
        subtitle: 'The growth story unravels',
        ticker: 'NFLX',
        company: 'Netflix Inc.',
        date: 'July 17, 2019',
        dateShort: 'Jul 2019',
        marketTime: '04:00 PM EST — AFTER HOURS',
        category: 'earnings',
        categoryLabel: 'Earnings',
        difficulty: 3,
        difficultyLabel: 'Medium',
        estimatedTime: 9,
        plays: 4300,
        playsFormatted: '4.3k',
        solveRate: 45,
        isNew: false,
        isFeatured: false,
        isTrending: false,
        description: 'Netflix missed subscriber growth estimates for the first time, losing domestic subscribers and raising competition concerns.',
        briefingText: `Netflix is about to report Q2 earnings. The streaming wars are intensifying with <hl>Disney+ launching later this year</hl>. Analysts expect strong growth but whispers suggest <hl>domestic subscriber losses</hl> for the first time. Content spending is ballooning.`,
        sparklineData: [95, 92, 88, 85, 80, 78, 75, 70, 65, 60, 58, 55],
        accentColor: '#3b82f6',
        keyStats: [
            { value: '-10%', numericValue: 10, label: 'AFTER-HOURS DROP', color: '#ef4444' },
            { value: '-130K', numericValue: 130, label: 'US SUBS LOST', color: '#ef4444' },
            { value: '$3.2B', numericValue: 3200, label: 'CONTENT SPEND', color: '#ffffff' },
            { value: '151M', numericValue: 151, label: 'TOTAL SUBS', color: '#ffffff' },
        ],
    },
    {
        id: 'brexit-2016',
        slug: 'brexit-2016',
        title: 'Brexit Referendum Shock',
        subtitle: "Britain's $2 trillion gamble",
        ticker: 'GBP',
        company: 'British Pound Sterling',
        date: 'June 24, 2016',
        dateShort: 'Jun 2016',
        marketTime: '04:40 AM BST — RESULT DECLARED',
        category: 'economic',
        categoryLabel: 'Economic',
        difficulty: 4,
        difficultyLabel: 'Hard',
        estimatedTime: 12,
        plays: 3100,
        playsFormatted: '3.1k',
        solveRate: 28,
        isNew: false,
        isFeatured: false,
        isTrending: false,
        description: 'The UK voted to leave the European Union in a shock referendum result, triggering the largest single-day currency crash in decades.',
        briefingText: `The UK referendum on EU membership has just closed. Markets had been pricing in a <hl>Remain victory</hl> with 85% confidence. Early results from Sunderland show a <hl>massive swing toward Leave</hl>. The pound is starting to slip. $2 trillion in market value hangs in the balance.`,
        sparklineData: [100, 98, 96, 95, 93, 88, 78, 65, 60, 58, 62, 65],
        accentColor: '#f97316',
        keyStats: [
            { value: '-11%', numericValue: 11, label: 'GBP CRASH', color: '#ef4444' },
            { value: '52%', numericValue: 52, label: 'LEAVE VOTE', color: '#eab308' },
            { value: '$2T', numericValue: 2, label: 'VALUE WIPED', color: '#ef4444' },
            { value: '72%', numericValue: 72, label: 'VOTER TURNOUT', color: '#ffffff' },
        ],
    },
    {
        id: 'flash-crash-2010',
        slug: 'flash-crash-2010',
        title: 'The Flash Crash of 2010',
        subtitle: 'A trillion dollars in 36 minutes',
        ticker: 'SPY',
        company: 'S&P 500 ETF Trust',
        date: 'May 6, 2010',
        dateShort: 'May 2010',
        marketTime: '02:32 PM EST — MID-SESSION',
        category: 'technical',
        categoryLabel: 'Technical',
        difficulty: 4,
        difficultyLabel: 'Hard',
        estimatedTime: 11,
        plays: 2900,
        playsFormatted: '2.9k',
        solveRate: 19,
        isNew: false,
        isFeatured: false,
        isTrending: false,
        description: 'The Dow Jones plunged 1,000 points in minutes before recovering, exposing vulnerabilities in algorithmic trading systems.',
        briefingText: `It's an ordinary Thursday afternoon. Greek debt concerns are simmering but manageable. Then at 2:32 PM, <hl>a massive sell order hits the market</hl>. Algorithmic trading systems begin cascading. The Dow drops 600 points in 5 minutes. <hl>Liquidity has evaporated</hl>. No one knows why.`,
        sparklineData: [100, 98, 97, 96, 90, 60, 20, 15, 25, 35, 80, 95],
        accentColor: '#a855f7',
        keyStats: [
            { value: '-9.2%', numericValue: 9, label: 'INTRADAY DROP', color: '#ef4444' },
            { value: '36', numericValue: 36, label: 'MINUTES', color: '#eab308' },
            { value: '$1T', numericValue: 1, label: 'VALUE LOST', color: '#ef4444' },
            { value: '20K', numericValue: 20, label: 'TRADES CANCELLED', color: '#ffffff' },
        ],
    },
    {
        id: 'crypto-winter-2018',
        slug: 'crypto-winter-2018',
        title: 'Crypto Winter 2018',
        subtitle: 'The bubble that burst overnight',
        ticker: 'BTC',
        company: 'Bitcoin',
        date: 'January 16, 2018',
        dateShort: 'Jan 2018',
        marketTime: '24/7 MARKET — NO CLOSE',
        category: 'blackswan',
        categoryLabel: 'Black Swan',
        difficulty: 5,
        difficultyLabel: 'Expert',
        estimatedTime: 14,
        plays: 9200,
        playsFormatted: '9.2k',
        solveRate: 12,
        isNew: true,
        isFeatured: false,
        isTrending: true,
        description: 'Bitcoin crashed from its all-time high of $20,000, wiping out billions and ending the ICO boom.',
        briefingText: `Bitcoin hit $20,000 just weeks ago. Media frenzy has brought in millions of <hl>first-time retail investors</hl>. Regulators worldwide are cracking down on ICOs. South Korea is considering a <hl>complete trading ban</hl>. The entire crypto market cap is about to collapse by 65% in a month.`,
        sparklineData: [100, 95, 85, 78, 70, 55, 45, 40, 35, 30, 28, 25],
        accentColor: '#eab308',
        keyStats: [
            { value: '-84%', numericValue: 84, label: 'PEAK TO TROUGH', color: '#ef4444' },
            { value: '$700B', numericValue: 700, label: 'MARKET CAP LOST', color: '#ef4444' },
            { value: '800+', numericValue: 800, label: 'DEAD COINS', color: '#eab308' },
            { value: '12', numericValue: 12, label: 'MONTHS OF WINTER', color: '#ffffff' },
        ],
    },
    {
        id: 'india-demonetization-2016',
        slug: 'india-demonetization-2016',
        title: 'India Demonetization Shock',
        subtitle: '86% of currency voided in one speech',
        ticker: 'NIFTY',
        company: 'Nifty 50 Index',
        date: 'November 8, 2016',
        dateShort: 'Nov 2016',
        marketTime: '08:15 PM IST — AFTER HOURS',
        category: 'economic',
        categoryLabel: 'Economic',
        difficulty: 3,
        difficultyLabel: 'Medium',
        estimatedTime: 10,
        plays: 1800,
        playsFormatted: '1.8k',
        solveRate: 38,
        isNew: false,
        isFeatured: false,
        isTrending: false,
        description: "India's PM announced the immediate demonetization of ₹500 and ₹1,000 notes, invalidating 86% of currency in circulation.",
        briefingText: `At 8:15 PM, Prime Minister Modi goes live on national television. He announces that <hl>all ₹500 and ₹1,000 notes are now invalid</hl>. 86% of India's currency is suddenly worthless. Banks are closed. ATMs will be shut for days. Markets haven't priced in anything yet — <hl>they open in 12 hours</hl>.`,
        sparklineData: [100, 98, 95, 85, 75, 70, 68, 65, 70, 72, 75, 78],
        accentColor: '#f97316',
        keyStats: [
            { value: '-6.3%', numericValue: 6, label: 'NIFTY DROP', color: '#ef4444' },
            { value: '86%', numericValue: 86, label: 'CURRENCY VOIDED', color: '#eab308' },
            { value: '₹15.4T', numericValue: 15, label: 'NOTES INVALIDATED', color: '#ffffff' },
            { value: '1.3B', numericValue: 1300, label: 'PEOPLE AFFECTED', color: '#ffffff' },
        ],
    },
]

// ─── Filter + Sort helpers ───────────────────────────────
export type SortOption = 'difficulty' | 'popularity' | 'newest' | 'solve-rate'

export function filterScenarios(
    all: Scenario[],
    opts: { category?: string; search?: string; sort?: SortOption }
): Scenario[] {
    let result = [...all]

    if (opts.category && opts.category !== 'all') {
        result = result.filter((s) => s.category === opts.category)
    }

    if (opts.search) {
        const q = opts.search.toLowerCase()
        result = result.filter(
            (s) =>
                s.title.toLowerCase().includes(q) ||
                s.ticker.toLowerCase().includes(q) ||
                s.company.toLowerCase().includes(q) ||
                s.dateShort.toLowerCase().includes(q) ||
                s.categoryLabel.toLowerCase().includes(q)
        )
    }

    switch (opts.sort) {
        case 'difficulty':
            result.sort((a, b) => b.difficulty - a.difficulty)
            break
        case 'popularity':
            result.sort((a, b) => b.plays - a.plays)
            break
        case 'solve-rate':
            result.sort((a, b) => a.solveRate - b.solveRate)
            break
        case 'newest':
        default:
            break
    }

    return result
}
