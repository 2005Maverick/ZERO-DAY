// ============================================================================
// COMPANY DOSSIERS — extended details per stock
// ============================================================================
// Sourced from public filings (annual reports / DRHPs / Bloomberg) for FY18–19.
// Where exact numbers were not available, plausible ranges are marked // VERIFY.
// ============================================================================

export interface PeerCompany {
  symbol: string
  name: string
  marketCapCr: number
  pe: number
  ytdPctChange: number
}

export interface BusinessSegment {
  name: string
  revenuePct: number
  description?: string
}

export interface Person {
  name: string
  role: string
  tenure?: string
}

export interface ITRSummary {
  fiscalYear: string                     // 'FY 2018-19'
  filedDate: string                      // 'Sep 30, 2019'
  cin?: string                           // Company Identification Number
  totalRevenueCr: number
  netProfitCr: number
  ebitdaCr: number
  taxPaidCr: number
  epsRupees: number
  totalAssetsCr: number
  totalLiabilitiesCr: number
  cashEquivalentsCr: number
  longTermDebtCr: number
  yoyRevenueGrowthPct: number
  yoyProfitGrowthPct: number
}

export interface CompanyDetail {
  symbol: string
  legalName: string
  incorporated: string                   // 'Apr 13, 2004'
  headquarters: string
  exchange: string                       // 'NSE: INDIGO'
  about: string[]                         // 2-3 paragraphs
  segments: BusinessSegment[]
  promoters: Person[]
  management: Person[]
  workforce: { total: number; subgroups: { label: string; count: string }[] }
  operations: { label: string; value: string }[]
  itr: ITRSummary
  peers: PeerCompany[]
  industryNote: string                    // 1-2 line industry context
}

// ─── INDIGO ──────────────────────────────────────────────────

export const COV20_COMPANIES: Record<string, CompanyDetail> = {
  INDIGO: {
    symbol: 'INDIGO',
    legalName: 'InterGlobe Aviation Ltd.',
    incorporated: 'Jan 13, 2004',
    headquarters: 'Gurugram, Haryana, India',
    exchange: 'NSE: INDIGO · BSE: 539448',
    about: [
      'InterGlobe Aviation Ltd., operating under the brand IndiGo, is India\'s largest passenger airline by both market share and fleet size. Founded by Rahul Bhatia and Rakesh Gangwal, the carrier launched commercial operations on 4 August 2006 with a single Airbus A320 and has since become a low-cost flag-bearer of Indian aviation.',
      'The airline operates a single-aisle, fuel-efficient fleet model and is one of the largest customers globally for the Airbus A320neo family. As of February 2020, IndiGo controls a domestic market share of approximately 47.7%, the highest of any Indian carrier.',
      'IndiGo runs an exceptionally tight cost structure — sale-and-leaseback aircraft financing, a single fleet type for engineering simplicity, and aggressive turnaround times — which has historically produced operating margins among the best in the Asian aviation sector.',
    ],
    segments: [
      { name: 'Passenger Revenue',     revenuePct: 88.0, description: 'Domestic + international ticket sales' },
      { name: 'Cargo & Ancillary',     revenuePct:  7.0, description: 'Freight, baggage, on-board sales' },
      { name: 'Lease & Other',         revenuePct:  5.0, description: 'Aircraft sublease, training, charters' },
    ],
    promoters: [
      { name: 'Rahul Bhatia',     role: 'Co-Founder & Promoter (InterGlobe Enterprises)', tenure: '2004–present' },
      { name: 'Rakesh Gangwal',   role: 'Co-Founder & Promoter (Caelum Investments)',     tenure: '2004–present' },
    ],
    management: [
      { name: 'Ronojoy Dutta',    role: 'Whole-time Director & CEO',     tenure: 'Jan 2019–present' },
      { name: 'Aditya Pande',     role: 'Chief Financial Officer',       tenure: '2019–present' },
      { name: 'Wolfgang Prock-Schauer', role: 'Chief Operating Officer', tenure: '2017–present' },
      { name: 'Sanjay Kumar',     role: 'Chief Strategy & Revenue Officer', tenure: '2016–present' },
    ],
    workforce: {
      total: 23531,    // VERIFY — FY19 annual report
      subgroups: [
        { label: 'Pilots',         count: '~2,800' },
        { label: 'Cabin crew',     count: '~6,500' },
        { label: 'Engineering',    count: '~3,400' },
        { label: 'Ground & ops',   count: '~10,800' },
      ],
    },
    operations: [
      { label: 'Active fleet (Mar 2020)',  value: '262 aircraft (A320 family + ATR 72)' },
      { label: 'Daily flights',            value: '~1,500' },
      { label: 'Destinations',             value: '89 (Domestic 65 · International 24)' },
      { label: 'Domestic market share',    value: '47.7% (Feb 2020)' },
      { label: 'On-time performance',      value: '85.1% (CY19, top among Indian carriers)' },
    ],
    itr: {
      fiscalYear: 'FY 2018–19',
      filedDate: 'Aug 24, 2019',
      cin: 'L62100DL2004PLC129768',
      totalRevenueCr: 28497,
      netProfitCr:      157,
      ebitdaCr:        2889,
      taxPaidCr:         96,
      epsRupees:        4.07,
      totalAssetsCr:  17681,
      totalLiabilitiesCr: 14856,
      cashEquivalentsCr: 6504,
      longTermDebtCr:    2418,
      yoyRevenueGrowthPct:  26.1,
      yoyProfitGrowthPct:  -93.7,    // sharp decline due to fuel & forex
    },
    peers: [
      { symbol: 'SPICEJET',  name: 'SpiceJet Ltd.',                 marketCapCr:  6500, pe:  9.1, ytdPctChange: -42.1 },
      { symbol: 'JETAIR',    name: 'Jet Airways Ltd. (suspended)',  marketCapCr:   330, pe:    0, ytdPctChange: -76.0 },
      { symbol: 'AIRINDIA',  name: 'Air India Ltd. (unlisted)',     marketCapCr:     0, pe:    0, ytdPctChange:    0 },
    ],
    industryNote: 'Indian aviation is in a fragile state pre-Covid: SpiceJet stretched, Jet Airways grounded since April 2019, Air India under privatisation talks. INDIGO has best balance sheet but extreme exposure to passenger demand collapse.',
  },

  // ─── SUNPHARMA ─────────────────────────────────────────────
  SUNPHARMA: {
    symbol: 'SUNPHARMA',
    legalName: 'Sun Pharmaceutical Industries Ltd.',
    incorporated: 'Mar 1, 1993',
    headquarters: 'Mumbai, Maharashtra, India',
    exchange: 'NSE: SUNPHARMA · BSE: 524715',
    about: [
      'Sun Pharmaceutical Industries Ltd. is the largest pharmaceutical company in India and the fourth-largest specialty generic pharmaceutical company globally by revenue. Founded by Dilip Shanghvi in 1983 with five products in psychiatry, the company today markets over 2,000 SKUs across 100+ countries.',
      'The 2014 acquisition of Ranbaxy Laboratories made Sun Pharma the fifth-largest generics player worldwide. The company operates 41 manufacturing facilities across India, the US, and emerging markets, with several FDA-cleared sterile and oral-solid plants.',
      'Sun Pharma\'s strength lies in chronic-care therapy areas — neurology, cardiology, ophthalmology, dermatology — and its expanding specialty business in the US (Ilumya, Cequa, Odomzo). Generic erosion in the US market has compressed margins through FY18–19.',
    ],
    segments: [
      { name: 'India Formulations',    revenuePct: 31.0, description: 'Branded generics, chronic care' },
      { name: 'US Formulations',       revenuePct: 32.0, description: 'Generics + specialty (Ilumya, Cequa)' },
      { name: 'Emerging Markets',      revenuePct: 17.0, description: 'Russia, Brazil, South Africa, others' },
      { name: 'Rest of World + APIs',  revenuePct: 20.0 },
    ],
    promoters: [
      { name: 'Dilip Shanghvi',        role: 'Founder, Promoter & Managing Director', tenure: '1983–present' },
      { name: 'Sudhir Valia',          role: 'Promoter (Whole-time Director, FY-end 2019)', tenure: '1990s–2019' },
    ],
    management: [
      { name: 'Dilip Shanghvi',        role: 'Managing Director' },
      { name: 'C. S. Muralidharan',    role: 'Chief Financial Officer' },
      { name: 'Abhay Gandhi',          role: 'CEO – North America' },
      { name: 'Kirti Ganorkar',        role: 'CEO – India Business' },
    ],
    workforce: {
      total: 32000,    // VERIFY — approx FY19
      subgroups: [
        { label: 'Manufacturing & QC', count: '~14,000' },
        { label: 'R&D',                count: '~2,200' },
        { label: 'Field force (India)', count: '~5,500' },
        { label: 'Corporate & Sales',  count: '~10,300' },
      ],
    },
    operations: [
      { label: 'Manufacturing facilities',    value: '41 sites worldwide' },
      { label: 'R&D centres',                  value: '8 (India, US, Israel, others)' },
      { label: 'ANDA filings (US, cumulative)', value: '550+' },
      { label: 'Countries served',             value: '100+' },
      { label: 'Therapy areas',                value: 'Psychiatry, Neurology, Cardiology, Onco, Ophth, Derm' },
    ],
    itr: {
      fiscalYear: 'FY 2018–19',
      filedDate: 'Sep 30, 2019',
      cin: 'L24230GJ1993PLC019050',
      totalRevenueCr: 28685,
      netProfitCr:    2666,
      ebitdaCr:       6017,
      taxPaidCr:       847,
      epsRupees:       11.11,
      totalAssetsCr:  53240,
      totalLiabilitiesCr: 17110,
      cashEquivalentsCr:   7860,
      longTermDebtCr:      4520,
      yoyRevenueGrowthPct:  10.2,
      yoyProfitGrowthPct:  -27.4,
    },
    peers: [
      { symbol: 'CIPLA',       name: 'Cipla Ltd.',                 marketCapCr: 36800, pe: 28.4, ytdPctChange:  -8.2 },
      { symbol: 'DRREDDY',     name: 'Dr. Reddy\'s Labs',          marketCapCr: 50100, pe: 27.1, ytdPctChange:   1.4 },
      { symbol: 'LUPIN',       name: 'Lupin Ltd.',                 marketCapCr: 33400, pe: 22.6, ytdPctChange: -12.8 },
      { symbol: 'DIVISLAB',    name: 'Divi\'s Labs',               marketCapCr: 47600, pe: 32.5, ytdPctChange:  +7.1 },
    ],
    industryNote: 'Indian pharma is one of the few "winner" sectors of pre-Covid Mar 2020. Generic supply concerns (China API disruption) plus expectation of pandemic-related demand are pushing peers up. Sun Pharma trades at a discount to peers due to US specialty execution risk.',
  },

  // ─── RELIANCE ──────────────────────────────────────────────
  RELIANCE: {
    symbol: 'RELIANCE',
    legalName: 'Reliance Industries Ltd.',
    incorporated: 'May 8, 1973',
    headquarters: 'Mumbai, Maharashtra, India',
    exchange: 'NSE: RELIANCE · BSE: 500325',
    about: [
      'Reliance Industries Ltd. is India\'s largest private-sector enterprise, with diversified operations across hydrocarbons (oil refining and petrochemicals), retail, digital services (Jio), and media. Founded by Dhirubhai Ambani as a polyester trader in 1966, today it is led by his elder son, Mukesh Ambani.',
      'The Jamnagar refinery is the world\'s largest single-location oil refining complex with a combined capacity of ~1.36 million bpd. The petrochemicals business is integrated downstream, producing PP, PE, PX, PTA and a full polyester chain. Together these "energy" segments still produce roughly 60% of group revenue.',
      'Jio, launched in September 2016, has become India\'s largest telecom operator with 374 million subscribers (Q3 FY20) and is the strategic spear of Reliance\'s pivot toward consumer-tech. Reliance Retail is India\'s largest organised retailer by revenue and footprint.',
    ],
    segments: [
      { name: 'Oil-to-Chemicals',      revenuePct: 60.5, description: 'Refining, petrochemicals, gas' },
      { name: 'Retail',                revenuePct: 18.7, description: '11,316 stores · Apparel, grocery, electronics' },
      { name: 'Digital Services (Jio)', revenuePct: 11.2, description: 'Telecom, fibre, JioFiber' },
      { name: 'Oil & Gas E&P',         revenuePct:  3.0 },
      { name: 'Media & Other',         revenuePct:  6.6 },
    ],
    promoters: [
      { name: 'Mukesh D. Ambani',      role: 'Chairman & Managing Director, Promoter', tenure: '2002–present' },
      { name: 'Nita M. Ambani',        role: 'Promoter Group, Founder Reliance Foundation' },
    ],
    management: [
      { name: 'Mukesh D. Ambani',      role: 'Chairman & Managing Director' },
      { name: 'Nikhil R. Meswani',     role: 'Executive Director (Petrochemicals)' },
      { name: 'Hital R. Meswani',      role: 'Executive Director (Refining & Marketing)' },
      { name: 'Alok Agarwal',          role: 'Chief Financial Officer' },
      { name: 'P.M.S. Prasad',         role: 'Executive Director (Hydrocarbons)' },
    ],
    workforce: {
      total: 200000,   // VERIFY — including subsidiaries
      subgroups: [
        { label: 'Reliance Retail',    count: '~150,000' },
        { label: 'Reliance Jio',       count: '~24,000' },
        { label: 'O2C / E&P',          count: '~24,000' },
        { label: 'Corporate & Other',  count: '~2,000' },
      ],
    },
    operations: [
      { label: 'Refining capacity (Jamnagar)', value: '1.36 mbpd (largest single-site globally)' },
      { label: 'Petrochem capacity',           value: '~36 MMTPA across 18 plants' },
      { label: 'Jio subscribers',              value: '374 M (Q3 FY20)' },
      { label: 'Retail stores',                value: '11,316 across 7,000+ towns' },
      { label: 'KG-D6 gas asset',              value: 'Production restart from Sep 2020' },
    ],
    itr: {
      fiscalYear: 'FY 2018–19',
      filedDate: 'Sep 30, 2019',
      cin: 'L17110MH1973PLC019786',
      totalRevenueCr: 622809,
      netProfitCr:    39588,
      ebitdaCr:       83740,
      taxPaidCr:      14750,
      epsRupees:        66.8,
      totalAssetsCr: 1116225,
      totalLiabilitiesCr: 716000,
      cashEquivalentsCr:   59070,
      longTermDebtCr:     205864,
      yoyRevenueGrowthPct:  43.6,
      yoyProfitGrowthPct:   13.1,
    },
    peers: [
      { symbol: 'ONGC',        name: 'Oil & Natural Gas Corp',     marketCapCr: 109000, pe:  6.4, ytdPctChange: -28.2 },
      { symbol: 'BPCL',        name: 'Bharat Petroleum',           marketCapCr:  78000, pe: 12.1, ytdPctChange: -22.4 },
      { symbol: 'IOC',         name: 'Indian Oil Corp',            marketCapCr:  93000, pe:  9.2, ytdPctChange: -19.0 },
      { symbol: 'GAIL',        name: 'GAIL (India) Ltd',           marketCapCr:  55000, pe:  7.8, ytdPctChange: -16.4 },
    ],
    industryNote: 'Brent collapsed −31% in 48 hours on Saudi-Russia OPEC+ collapse. Refining margins crushed; downstream chemical demand uncertain. RELIANCE\'s diversification into telecom + retail provides ~30% buffer; pure refiners (BPCL, IOC) bleeding harder.',
  },

  // ─── HDFCBANK ──────────────────────────────────────────────
  HDFCBANK: {
    symbol: 'HDFCBANK',
    legalName: 'HDFC Bank Ltd.',
    incorporated: 'Aug 30, 1994',
    headquarters: 'Mumbai, Maharashtra, India',
    exchange: 'NSE: HDFCBANK · BSE: 500180',
    about: [
      'HDFC Bank Ltd. is India\'s largest private-sector bank by assets and market capitalisation. Promoted by Housing Development Finance Corporation in 1994, it was among the first new-generation private banks granted approval by the Reserve Bank of India under its 1991 banking liberalisation reforms.',
      'The bank operates a digitally-led, retail-tilted franchise. As of December 2019 it serves over 56 million customers through 5,300+ branches and 14,500+ ATMs spread across 2,800+ Indian cities, with retail loans contributing roughly 53% of its advances book.',
      'HDFC Bank has compounded earnings at ~20% CAGR for two decades, maintained gross NPA ratios under 1.5% through credit cycles, and consistently produced ROE above 15%. CEO Aditya Puri, who built the bank from scratch since 1994, retires in October 2020.',
    ],
    segments: [
      { name: 'Retail Banking',        revenuePct: 53.0, description: 'Personal, auto, home, gold loans + cards' },
      { name: 'Wholesale Banking',     revenuePct: 35.0, description: 'Corporate, SME, trade finance' },
      { name: 'Treasury',              revenuePct:  8.0, description: 'Govt securities, forex, derivatives' },
      { name: 'Other',                 revenuePct:  4.0 },
    ],
    promoters: [
      { name: 'HDFC Ltd. (Holding Co)', role: 'Promoter — 26.07% stake', tenure: '1994–present' },
    ],
    management: [
      { name: 'Aditya Puri',           role: 'Managing Director', tenure: '1994–Oct 2020' },
      { name: 'Sashidhar Jagdishan',    role: 'Group Head — Finance, HR, Operations (CEO-designate)' },
      { name: 'Kaizad Bharucha',       role: 'Executive Director (Wholesale Banking)' },
      { name: 'Bhavesh Zaveri',        role: 'Group Head — Operations & Cash Mgmt' },
      { name: 'Srinivasan Vaidyanathan', role: 'CFO' },
    ],
    workforce: {
      total: 116971,   // VERIFY — FY19 annual report
      subgroups: [
        { label: 'Branch banking',     count: '~58,000' },
        { label: 'Sales & contact ctr', count: '~26,000' },
        { label: 'Operations & tech',  count: '~22,000' },
        { label: 'Corporate & support', count: '~10,971' },
      ],
    },
    operations: [
      { label: 'Branches',             value: '5,314 (Dec 2019)' },
      { label: 'ATMs',                  value: '14,553' },
      { label: 'Cities covered',       value: '2,800+' },
      { label: 'Customer base',        value: '56 M+' },
      { label: 'Gross advances',       value: '₹9.36 lakh Cr' },
      { label: 'Total deposits',       value: '₹10.67 lakh Cr' },
      { label: 'Gross NPA ratio',      value: '1.42% (Q3 FY20)' },
    ],
    itr: {
      fiscalYear: 'FY 2018–19',
      filedDate: 'Sep 25, 2019',
      cin: 'L65920MH1994PLC080618',
      totalRevenueCr: 116597,
      netProfitCr:    21078,
      ebitdaCr:       28815,
      taxPaidCr:      10707,
      epsRupees:        78.6,
      totalAssetsCr: 1244540,
      totalLiabilitiesCr: 1100270,
      cashEquivalentsCr:   46763,
      longTermDebtCr:     117060,
      yoyRevenueGrowthPct:  20.3,
      yoyProfitGrowthPct:   17.2,
    },
    peers: [
      { symbol: 'KOTAKBANK',  name: 'Kotak Mahindra Bank',         marketCapCr: 327000, pe: 38.4, ytdPctChange:  -8.0 },
      { symbol: 'ICICIBANK',  name: 'ICICI Bank Ltd.',             marketCapCr: 348000, pe: 22.1, ytdPctChange: -14.5 },
      { symbol: 'AXISBANK',   name: 'Axis Bank Ltd.',              marketCapCr: 200000, pe: 28.3, ytdPctChange: -16.2 },
      { symbol: 'SBIN',       name: 'State Bank of India',         marketCapCr: 269000, pe: 11.0, ytdPctChange: -19.4 },
    ],
    industryNote: 'Indian financials face pandemic-era stress: SME credit, unsecured retail, and travel-linked exposures will deteriorate. HDFC Bank\'s low NPAs and tier-1 capital provide cushion, but Aditya Puri retirement compounds uncertainty.',
  },

  // ─── TITAN ─────────────────────────────────────────────────
  TITAN: {
    symbol: 'TITAN',
    legalName: 'Titan Company Ltd.',
    incorporated: 'Jul 26, 1984',
    headquarters: 'Bengaluru, Karnataka, India',
    exchange: 'NSE: TITAN · BSE: 500114',
    about: [
      'Titan Company Ltd. is a joint venture between the Tata Group and the Tamil Nadu Industrial Development Corporation (TIDCO). Founded in 1984 as a watch-maker, it has grown into one of India\'s most respected consumer-discretionary franchises, marketing watches (Titan, Sonata, Fastrack), jewellery (Tanishq, Mia, CaratLane, Zoya), and eyewear (Titan Eye+).',
      'Tanishq is India\'s largest organised jewellery brand by revenue, with 327 stores across 200+ cities. The jewellery business contributes more than 80% of consolidated revenue. Titan Watches has 60%+ market share in the Indian organised wristwatch segment.',
      'Titan is regarded as a benchmark for branded retail execution in India — operationally disciplined, cash-rich, with an extreme focus on store-economics and trust-driven marketing. The company has compounded EPS at ~25% over the past decade.',
    ],
    segments: [
      { name: 'Jewellery (Tanishq + )', revenuePct: 84.5, description: 'Tanishq, Mia, CaratLane, Zoya' },
      { name: 'Watches & Wearables',   revenuePct:  9.8, description: 'Titan, Sonata, Fastrack, Edge' },
      { name: 'Eyewear',               revenuePct:  3.0, description: 'Titan Eye+' },
      { name: 'Other (Skinn, Taneira)', revenuePct: 2.7 },
    ],
    promoters: [
      { name: 'Tata Group (Tata Sons)',  role: 'Promoter — 25.0% (via Tata Sons Pvt Ltd)' },
      { name: 'TIDCO',                    role: 'Co-Promoter — 27.9% (Govt of Tamil Nadu)' },
    ],
    management: [
      { name: 'Bhaskar Bhat',          role: 'MD (retiring Sep 2019)', tenure: '2002–2019' },
      { name: 'C. K. Venkataraman',    role: 'Managing Director', tenure: 'Oct 2019–present' },
      { name: 'S. Ravi Kant',          role: 'CEO – Watches & Wearables' },
      { name: 'Ajoy Chawla',           role: 'CEO – Jewellery Division' },
      { name: 'Subramanyam S.',        role: 'CFO' },
    ],
    workforce: {
      total: 7470,     // VERIFY
      subgroups: [
        { label: 'Retail (Tanishq)',   count: '~3,100' },
        { label: 'Manufacturing',      count: '~2,250' },
        { label: 'Sales (multi-brand)', count: '~1,400' },
        { label: 'Corporate',          count: '~720' },
      ],
    },
    operations: [
      { label: 'Tanishq stores',        value: '327 across 200+ cities' },
      { label: 'World of Titan stores', value: '~440' },
      { label: 'Titan Eye+ stores',     value: '~545' },
      { label: 'Total retail footprint', value: '~2,300+ outlets' },
      { label: 'Watches/year produced', value: '~16 million' },
      { label: 'Wristwatch market share', value: '~60% (organised India)' },
    ],
    itr: {
      fiscalYear: 'FY 2018–19',
      filedDate: 'Aug 30, 2019',
      cin: 'L74999TZ1984PLC001456',
      totalRevenueCr: 19779,
      netProfitCr:    1495,
      ebitdaCr:       2096,
      taxPaidCr:       574,
      epsRupees:        16.84,
      totalAssetsCr:   8480,
      totalLiabilitiesCr: 4395,
      cashEquivalentsCr: 1012,
      longTermDebtCr:     106,
      yoyRevenueGrowthPct:  21.6,
      yoyProfitGrowthPct:   11.8,
    },
    peers: [
      { symbol: 'PCJEWELLER',  name: 'PC Jeweller',                 marketCapCr:   720, pe:  4.1, ytdPctChange: -54.0 },
      { symbol: 'KALYAN',      name: 'Kalyan Jewellers (unlisted)', marketCapCr:     0, pe:    0, ytdPctChange:    0 },
      { symbol: 'TBZ',         name: 'Tribhovandas Bhimji Zaveri',  marketCapCr:   180, pe:  9.8, ytdPctChange: -38.2 },
      { symbol: 'TRENT',       name: 'Trent Ltd. (Tata)',           marketCapCr: 22000, pe: 95.6, ytdPctChange:   2.1 },
    ],
    industryNote: 'Discretionary consumer demand crater in lockdown is the principal risk. Jewellery footfall expected −60% if mall closures extend. Tanishq trust-equity and Tata parentage provide some cushion vs. competing unorganised players who may permanently lose share.',
  },

  // ─── TCS ───────────────────────────────────────────────────
  TCS: {
    symbol: 'TCS',
    legalName: 'Tata Consultancy Services Ltd.',
    incorporated: 'Jan 19, 1995',
    headquarters: 'Mumbai, Maharashtra, India',
    exchange: 'NSE: TCS · BSE: 532540',
    about: [
      'Tata Consultancy Services Ltd. is the world\'s largest IT services provider by market capitalisation. Founded in 1968 as a division of Tata Sons by F. C. Kohli — widely regarded as the father of Indian IT — TCS today serves clients in 46 countries and operates from over 285 offices worldwide.',
      'The company\'s revenue is dominated by application services, infrastructure services, and digital transformation — primarily for clients in BFSI, retail, and life sciences. North America contributes about half of group revenue; the BFSI vertical alone exceeds 31%.',
      'TCS\'s scale advantage allows it to maintain industry-leading operating margins (~26% on a sustained basis) while investing heavily in proprietary platforms (BaNCS, ignio, MasterCraft). Net cash on the balance sheet exceeded ₹65,000 Cr at end-FY19 and routinely returns capital via large buybacks.',
    ],
    segments: [
      { name: 'BFSI',                  revenuePct: 31.4, description: 'Banking, Financial Services, Insurance' },
      { name: 'Retail & CPG',          revenuePct: 16.5 },
      { name: 'Communications & Media', revenuePct: 9.8 },
      { name: 'Manufacturing',         revenuePct: 9.6 },
      { name: 'Life Sciences & Healthcare', revenuePct: 9.0 },
      { name: 'Technology & Services', revenuePct: 9.4 },
      { name: 'Other (Energy, Resources, Travel)', revenuePct: 14.3 },
    ],
    promoters: [
      { name: 'Tata Sons Pvt Ltd',     role: 'Promoter — 72.05% stake' },
    ],
    management: [
      { name: 'N. Chandrasekaran',     role: 'Chairman (also Tata Sons Chairman)', tenure: '2017–present' },
      { name: 'Rajesh Gopinathan',     role: 'Managing Director & CEO', tenure: '2017–present' },
      { name: 'N. Ganapathy Subramaniam', role: 'COO & Executive Director' },
      { name: 'V. Ramakrishnan',       role: 'Chief Financial Officer' },
      { name: 'Milind Lakkad',         role: 'Chief HR Officer' },
    ],
    workforce: {
      total: 446675,   // VERIFY — Q3 FY20
      subgroups: [
        { label: 'Software engineers', count: '~360,000' },
        { label: 'Domain consultants', count: '~38,000' },
        { label: 'Operations & sales', count: '~32,000' },
        { label: 'Corporate functions', count: '~16,675' },
      ],
    },
    operations: [
      { label: 'Countries served',     value: '46' },
      { label: 'Offices worldwide',    value: '285+' },
      { label: 'Active clients',       value: '~1,200' },
      { label: '$100M+ clients',       value: '49 (FY19)' },
      { label: 'TTM revenue (USD)',    value: '$22.0 B' },
      { label: 'Operating margin',     value: '26.6% (Q3 FY20)' },
      { label: 'Net cash position',    value: '₹68,000 Cr+' },
    ],
    itr: {
      fiscalYear: 'FY 2018–19',
      filedDate: 'Aug 28, 2019',
      cin: 'L22210MH1995PLC084781',
      totalRevenueCr: 146463,
      netProfitCr:    31472,
      ebitdaCr:       40510,
      taxPaidCr:      10801,
      epsRupees:        83.87,
      totalAssetsCr:  98987,
      totalLiabilitiesCr: 17920,
      cashEquivalentsCr:  10867,
      longTermDebtCr:        12,
      yoyRevenueGrowthPct:  19.0,
      yoyProfitGrowthPct:   21.9,
    },
    peers: [
      { symbol: 'INFY',        name: 'Infosys Ltd.',                marketCapCr: 320000, pe: 21.4, ytdPctChange:  -2.1 },
      { symbol: 'WIPRO',       name: 'Wipro Ltd.',                  marketCapCr: 132000, pe: 17.8, ytdPctChange:  -8.4 },
      { symbol: 'HCLTECH',     name: 'HCL Technologies',            marketCapCr: 158000, pe: 16.2, ytdPctChange:  -6.2 },
      { symbol: 'TECHM',       name: 'Tech Mahindra',               marketCapCr:  80000, pe: 16.0, ytdPctChange: -12.1 },
    ],
    industryNote: 'Indian IT services have a complex Covid setup. Short-term: BFSI client travel freeze, project deferrals. Medium-term: secular winner from accelerated digital + WFH adoption. Currency depreciation (USD/INR ↑) is a tailwind. TCS scale + cash give defensive bid.',
  },
}
