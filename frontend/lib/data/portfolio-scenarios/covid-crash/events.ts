import type { PortfolioNewsEvent, FlashCrashEvent } from '@/types/portfolio'

export const COVID_EVENTS: PortfolioNewsEvent[] = [
  {
    id: 'oil-crash',
    realSecond: 96,
    headline: 'CRUDE OIL CRASHES 25% — SAUDI-RUSSIA PRICE WAR ERUPTS',
    body: 'Saudi Arabia slashes oil prices after Russia refuses OPEC+ production cuts. Brent crude collapses from $45 to $31 — largest single-day drop since 1991.',
    rebalanceWindowSec: 15,
    causalImpacts: [
      { symbol: 'RELIANCE', impactPct: -0.08, polarity: 'negative', decaySeconds: 60, rationale: 'Oil price crash hits Reliance upstream revenue directly' },
      { symbol: 'INDIGO',   impactPct: -0.06, polarity: 'negative', decaySeconds: 50, rationale: 'Fuel cost uncertainty spikes — airlines double-hit' },
      { symbol: 'SUNPHARMA',impactPct:  0.03, polarity: 'positive', decaySeconds: 40, rationale: 'Safe-haven buying into defensive pharma' },
      { symbol: 'HDFCBANK', impactPct: -0.02, polarity: 'negative', decaySeconds: 45, rationale: 'General risk-off sentiment hits banks' },
      { symbol: 'TITAN',    impactPct: -0.015,polarity: 'negative', decaySeconds: 35, rationale: 'Discretionary spending concerns on economic shock' },
      { symbol: 'TCS',      impactPct: -0.01, polarity: 'negative', decaySeconds: 30, rationale: 'Mild risk-off — IT is defensive but not immune' },
    ],
    tierHint: {
      simple:  'Oil prices are crashing. Which sector needs oil to operate AND which sector produces it?',
      deeper:  'Reliance extracts oil — lower price = lower revenue. IndiGo burns jet fuel (crude-derived) — lower crude is usually good, but this crash signals demand collapse, so both fall.',
      expert:  'Watch the oil-airline correlation invert: normally crude down = airlines up. Here, the macro signal (recession fear) dominates the cost benefit. Classic risk-off override.',
    },
    whyExplanations: {
      INDIGO: {
        simple:  'Airlines need jet fuel to fly. Jet fuel comes from crude oil. When oil markets crash this violently, airlines panic — investors fear they will lose money even if fuel gets cheap.',
        deeper:  'IndiGo hedges only 40–60% of its fuel costs. The rest is spot price. A 25% crude crash signals economic collapse — fewer passengers, not cheaper flights.',
        expert:  'The crude collapse is a demand signal, not a cost story. IndiGo RASK (revenue per available seat km) compression from travel freeze outweighs any CASK (cost) relief.',
      },
      RELIANCE: {
        simple:  'Reliance pumps oil from the ground. When oil is worth less, every barrel they sell earns less money. Stock falls with the price of their main product.',
        deeper:  'Reliance E&P division (KG-D6 basin) sees margin collapse. The refining segment actually benefits from cheap crude, but the market prices the headline first.',
        expert:  'GRM (gross refining margin) expansion from cheap feedstock is offset by E&P revenue destruction and polymer demand collapse. Net: negative for integrated players.',
      },
      SUNPHARMA: {
        simple:  'When scary economic news hits, investors move money into "safe" sectors. Medicines are always needed — demand doesn\'t fall in a crash. Sun Pharma benefits.',
        deeper:  'Pharma is a defensive sector: inelastic demand, rupee depreciation from oil shock actually helps export revenues. Safe haven buying accelerates.',
        expert:  'Pharma benefits from the oil-rupee transmission: crude crash → current account concerns → rupee weakness → higher USD export earnings for Sun Pharma\'s US business.',
      },
      HDFCBANK: {
        simple:  'Big scary news makes investors nervous about all stocks. Banks lend money — if businesses are struggling, they might not pay back loans. Mild drop on general fear.',
        deeper:  'Crude collapse raises NPA concerns in oil-linked sectors (refiners, airlines). Bank stocks correct as markets price in future loan defaults.',
        expert:  'HDFC Bank\'s direct oil exposure is minimal, but the risk-off repricing of the entire financial sector happens within minutes. Beta-weighted selloff.',
      },
      TITAN: {
        simple:  'When people are scared about the economy, they stop buying luxury goods like jewelry and watches. Titan\'s business depends on consumer confidence.',
        deeper:  'Gold jewelry demand is resilient, but premium watches and lifestyle products see immediate demand concern. Titan falls on discretionary spending anxiety.',
        expert:  'Titan\'s PE multiple compresses on consumer staple de-rating. Gold as component holds value, but watch segment earnings estimates are cut immediately.',
      },
      TCS: {
        simple:  'IT companies are relatively safe — companies always need software. But when markets panic, even safe stocks dip a little as investors sell everything.',
        deeper:  'TCS has no direct oil exposure. The mild drop is pure risk-off: global funds sell India ETFs, everything in the basket falls proportionally.',
        expert:  'TCS benefits from oil-driven rupee weakness (USD revenues). The mild decline is sentiment-driven, not fundamental — creating a potential entry point.',
      },
    },
  },
  {
    id: 'who-pandemic',
    realSecond: 250,
    headline: 'WHO: COVID-19 NOW MEETS CRITERIA FOR GLOBAL PANDEMIC',
    body: 'World Health Organization declares COVID-19 a global pandemic. Travel bans expected. India confirms 62 cases. Global markets in freefall.',
    rebalanceWindowSec: 15,
    causalImpacts: [
      { symbol: 'SUNPHARMA', impactPct:  0.08, polarity: 'positive', decaySeconds: 80, rationale: 'Pandemic = massive pharma demand surge globally' },
      { symbol: 'INDIGO',    impactPct: -0.05, polarity: 'negative', decaySeconds: 60, rationale: 'Travel bans imminent — airlines face existential threat' },
      { symbol: 'HDFCBANK',  impactPct: -0.03, polarity: 'negative', decaySeconds: 50, rationale: 'NPA risk spikes as economy to face lockdown' },
      { symbol: 'RELIANCE',  impactPct: -0.02, polarity: 'negative', decaySeconds: 40, rationale: 'Demand destruction — fuel, retail, telecom all hit' },
      { symbol: 'TITAN',     impactPct: -0.03, polarity: 'negative', decaySeconds: 45, rationale: 'Stores close, consumer spending collapses' },
      { symbol: 'TCS',       impactPct: -0.015,polarity: 'negative', decaySeconds: 35, rationale: 'IT budgets will freeze as clients cut costs' },
    ],
    tierHint: {
      simple:  'A global pandemic is declared. Which type of company makes products people suddenly need more of?',
      deeper:  'Healthcare demand is inelastic and surges in pandemics. Travel demand collapses. Banks fear loan defaults as businesses shut. Think about each sector\'s demand curve.',
      expert:  'The asymmetric trade here is long pharma / short travel. WHO declaration triggers mandatory travel restrictions globally. Airlines face revenue-to-zero scenarios. Pharma faces infinite demand.',
    },
    whyExplanations: {
      SUNPHARMA: {
        simple:  'A pandemic means millions of people will need medicines. Sun Pharma makes medicines. When demand for your product explodes, your stock price goes up.',
        deeper:  'COVID-19 creates direct demand for antivirals, fever medication, and supportive care drugs. Sun Pharma supplies hydroxychloroquine (later controversial) and has a massive US generic pipeline.',
        expert:  'WHO pandemic declaration triggers WHO/UNICEF bulk procurement. Sun Pharma\'s API (active pharmaceutical ingredient) business sees order surge. Regulatory tailwinds for emergency approvals.',
      },
      INDIGO: {
        simple:  'Nobody wants to fly during a pandemic. Travel bans are coming. No passengers = no revenue. IndiGo faces the worst possible news for an airline.',
        deeper:  'IndiGo burns ₹65 crore per day in operating costs regardless of flights. With revenue going to zero, the cash runway becomes the existential question.',
        expert:  'Airline operating leverage is brutal: 70% fixed costs. Revenue collapse with fixed cost base means EBITDA goes deeply negative. Equity value approaches zero in prolonged shutdown.',
      },
      HDFCBANK: {
        simple:  'Banks lend money to businesses. If businesses shut down due to a pandemic, they cannot repay their loans. Banks then lose money on those loans.',
        deeper:  'HDFC Bank\'s SME and retail loan books face stress. Moratorium expectations begin forming — RBI will likely force loan repayment deferrals, hurting bank income.',
        expert:  'NPA provisions spike in pandemic scenarios. GNPA could rise 200-300bps from lockdown. The RBI moratorium (announced later in March) crystallizes income recognition risk.',
      },
      RELIANCE: {
        simple:  'People stuck at home use less fuel, shop less at stores, and travel less. Reliance has businesses in all of these — oil refining, retail, and telecom.',
        deeper:  'Retail stores shutting eliminates Reliance Retail revenue. Fuel demand collapse continues. Only Jio (telecom) benefits from lockdown data consumption — not enough to offset.',
        expert:  'Reliance is a diversified conglomerate. The oil/retail hit is $8B+ revenue at risk. Jio provides a partial offset via data volume surge but margins are thin.',
      },
      TITAN: {
        simple:  'Jewelry and watch stores will be forced to close. You cannot buy a Titan watch online as easily as buying a book. Discretionary purchases stop completely.',
        deeper:  'Titan\'s 1,800 stores face mandatory closure. Inventory piles up unsold. Wedding season (March-May) is the peak — a lockdown during peak season is catastrophic.',
        expert:  'Titan revenue is 80% driven by walk-in retail. With stores closed, the business is effectively zero revenue. Gold as collateral holds some floor, but equity is deeply at risk.',
      },
      TCS: {
        simple:  'Companies that hire TCS to build software will now be cutting budgets to survive the crisis. Less new IT projects = less revenue for TCS.',
        deeper:  'TCS\'s $22B order book provides 12-18 months of revenue visibility. The drop is about new deal flow freezing — discretionary IT spend is the first budget line cut in a recession.',
        expert:  'TCS defense: multi-year contracts provide revenue stability. The risk is FY22 guidance cuts and margin pressure from WFH transition costs. Still the most defensive name in the portfolio.',
      },
    },
  },
  {
    id: 'rbi-liquidity',
    realSecond: 403,
    headline: 'RBI ANNOUNCES ₹1.37 LAKH CRORE EMERGENCY LIQUIDITY PACKAGE',
    body: 'Reserve Bank of India Governor calls emergency press conference. Announces massive liquidity injection, repo rate cut signal, and moratorium on loan repayments to stabilize banking system.',
    rebalanceWindowSec: 15,
    causalImpacts: [
      { symbol: 'HDFCBANK',  impactPct:  0.04, polarity: 'positive', decaySeconds: 60, rationale: 'Direct liquidity injection — banks are the primary beneficiary' },
      { symbol: 'RELIANCE',  impactPct:  0.015,polarity: 'positive', decaySeconds: 45, rationale: 'Credit market ease helps large corporate borrowers' },
      { symbol: 'SUNPHARMA', impactPct:  0.01, polarity: 'positive', decaySeconds: 30, rationale: 'General market stabilization lifts all boats slightly' },
      { symbol: 'TCS',       impactPct:  0.01, polarity: 'positive', decaySeconds: 30, rationale: 'Rupee stability from RBI action helps IT exporters' },
      { symbol: 'INDIGO',    impactPct: -0.01, polarity: 'negative', decaySeconds: 25, rationale: 'Even RBI cannot fix zero passengers — airline pain continues' },
      { symbol: 'TITAN',     impactPct:  0.005,polarity: 'neutral',  decaySeconds: 20, rationale: 'Marginal positive — stores still closed, but liquidity helps credit' },
    ],
    tierHint: {
      simple:  'The RBI (India\'s central bank) is pumping money into the system. Who benefits most when banks suddenly have more money to lend?',
      deeper:  'Central bank liquidity injections directly benefit banks — lower borrowing costs, lower NPA provisioning pressure. Other sectors benefit indirectly. Airlines cannot be fixed by liquidity alone.',
      expert:  'RBI\'s action is a monetary backstop, not a demand stimulus. Watch HDFCBANK for the rate-sensitive trade. The moratorium announcement is actually a double-edged sword: income recognition impact.',
    },
    whyExplanations: {
      HDFCBANK: {
        simple:  'The RBI is giving banks extra money to lend. When your main business is lending money and you suddenly get more of it at lower cost, your profits improve.',
        deeper:  'HDFC Bank benefits from: lower repo rate (reduces cost of funds), liquidity injection (improves LAR ratios), and moratorium (defers NPA recognition even if painful later).',
        expert:  'The rate transmission is immediate for HDFC Bank\'s variable rate book. NIM expansion of 10-15bps likely in Q1. The moratorium is a near-term positive (deferred NPA) despite long-term ambiguity.',
      },
      RELIANCE: {
        simple:  'When the RBI gives banks cheap money, those banks can lend cheaply to big companies like Reliance. Lower borrowing costs = more profit.',
        deeper:  'Reliance has ₹1.6 lakh crore of debt. Even a 50bps rate cut saves them ~₹800 crore in annual interest — meaningful for a company earning ~₹40,000 crore EBITDA.',
        expert:  'Credit spread compression on Reliance\'s commercial paper and NCDs. The liquidity announcement signals RBI backstop for IG (investment grade) corporates — reduces Reliance refinancing risk.',
      },
      INDIGO: {
        simple:  'Even if banks have more money, nobody is flying. Cheap loans do not fill an empty airplane. IndiGo\'s core problem — zero passengers — is not fixed by the RBI.',
        deeper:  'IndiGo needs a sector-specific bailout, not general liquidity. The airline\'s daily cash burn of ₹65 crore cannot be solved by credit facility access alone.',
        expert:  'Airlines require demand recovery + capacity restructuring. Monetary policy is the wrong tool. IndiGo will need DGCA relief (slot protection), government equity infusion, or creditor restructuring.',
      },
      TCS: {
        simple:  'RBI action stabilizes the rupee slightly. TCS earns most of its money in US dollars — a stable rupee means they do not lose money on currency conversion.',
        deeper:  'Rupee stabilization from RBI\'s FX intervention arm (separate from liquidity action) helps TCS\'s USD/INR hedging costs. Rupee at 73-74 vs 77-78 in panic is meaningful.',
        expert:  'Every 1% rupee depreciation adds ~40bps to TCS EBIT margin (natural hedge via USD revenues, INR costs). RBI stability narrows the benefit but maintains the structural export thesis.',
      },
      SUNPHARMA: {
        simple:  'The overall market stabilizes a little when the RBI acts. Sun Pharma was already going up — this just provides a slightly more stable environment.',
        deeper:  'Sun Pharma is a USD earner. RBI liquidity reduces the extreme rupee volatility that was creating FX hedging uncertainty for their US business.',
        expert:  'Sun Pharma is largely policy-agnostic on the RBI action. The marginal positive comes from improved market sentiment reducing the risk premium on all Indian equities.',
      },
      TITAN: {
        simple:  'Cheaper borrowing costs might eventually help consumers buy jewelry on EMI. But stores are still closed — the immediate benefit is very small.',
        deeper:  'Titan\'s retail financing (easy EMI options) becomes cheaper for customers when rates fall. Gold loan rates also decline, making gold jewelry more accessible.',
        expert:  'Titan\'s benefit is indirect and lagged: rate cut → gold loan rate cut → improved jewelry affordability → demand recovery when stores reopen. 2-3 quarter delay in transmission.',
      },
    },
  },
]

export const FLASH_CRASH: FlashCrashEvent = {
  realSecond: 346,
  durationSeconds: 90,
  dropPct: 0.03,
}
