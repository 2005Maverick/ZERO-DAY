'use client'

import { TutorialShell } from './fundamentals-tutorial'

interface Props { open: boolean; onClose: () => void }
interface Step {
  id: number; title: string; eyebrow: string
  targetId: string | null
  dialogPos: 'right' | 'left' | 'below' | 'above' | 'center'
  body: string
  bullets?: string[]
  pairsWith?: string
  example?: string
}

const ACCENT = '#C9A45F'

const STEPS: Step[] = [
  {
    id: 1, eyebrow: 'Filing · 01 of 11',
    title: 'What is the Company Filing?',
    targetId: null, dialogPos: 'center',
    body: 'A condensed annual-report excerpt — what the business actually does, who runs it, what they own and owe. Where fundamentals show ratios, the filing gives you the underlying facts.',
    bullets: [
      'Identity — legal name, registration, exchange listing',
      'Business — what segments produce revenue and at what mix',
      'People — promoters, board, key management, headcount',
      'Operations — physical scale (plants, stores, geographies)',
      'Statutory — actual ITR-6 numbers filed with MCA',
    ],
    pairsWith: 'Use this BEFORE looking at fundamentals — the numbers only mean something if you understand the business.',
  },
  {
    id: 2, eyebrow: 'Identity · 02 of 11',
    title: 'Document Header & Seal',
    targetId: 'co-header', dialogPos: 'below',
    body: 'The masthead identifies the company exactly: legal name, fiscal year of filing, ITR-6 form reference. The red ZDM·VERIFIED seal confirms numbers come from the actual MCA21 filing, not a press release.',
    bullets: [
      'Always read the LEGAL name — corporate restructurings change it (e.g. "Reliance Industries Ltd." vs old "Reliance Petroleum")',
      'Fiscal year matters — Indian FY ends March 31',
      'ITR-6 = audited corporate return; numbers are legally attested',
    ],
  },
  {
    id: 3, eyebrow: 'Identity · 03 of 11',
    title: 'CIN · Incorporated · HQ · Exchange',
    targetId: 'co-meta', dialogPos: 'below',
    body: 'The four-cell grid is the company\'s ID card. CIN is the unique corporate registration number assigned by MCA — it encodes incorporation year, state, and listing status. Listed exchange tells you where the stock trades.',
    bullets: [
      'CIN starting with "L" → publicly listed; "U" → unlisted',
      'Incorporation date — older companies have weathered more cycles',
      'Registered HQ vs operations HQ are different — Reliance is registered in Mumbai but operates pan-India',
      'Exchange listing — NSE for liquidity, BSE for breadth',
    ],
    pairsWith: 'Compare incorporation year against management tenure: if the founder still runs a 30-year-old company, that\'s a "founder-led" durability signal.',
  },
  {
    id: 4, eyebrow: 'Business · 04 of 11',
    title: 'About the Company',
    targetId: 'co-about', dialogPos: 'right',
    body: 'A 2–3 paragraph plain-language description of WHAT the company does. Read this first — without context, every other number is noise.',
    bullets: [
      'Industry positioning (leader, challenger, niche)',
      'Geographic footprint (India-only, regional, global)',
      'Brand portfolio and customer segments',
      'Competitive moats (scale, IP, network effects, regulation)',
    ],
    example: 'A 30-second read here often saves you from buying a "cheap" stock without realizing it\'s a sunset industry.',
  },
  {
    id: 5, eyebrow: 'Business · 05 of 11',
    title: 'Revenue Mix — Where Money Comes From',
    targetId: 'co-segments', dialogPos: 'above',
    body: 'The bar shows what fraction of revenue each business segment contributes. A diversified mix is more defensive; a concentrated mix means the stock moves with that one segment\'s cycle.',
    bullets: [
      'Single segment > 70% revenue → high concentration risk',
      'Watch for SHIFTS year-over-year (digital eating retail, etc.)',
      'High-margin segments matter more than top-line share',
      'New segments below 5% are often the future, not the present',
    ],
    pairsWith: 'For Reliance, the mix tells you how much is oil/petchem (cyclical) vs Jio (recurring). The same revenue mix shifts your beta.',
  },
  {
    id: 6, eyebrow: 'People · 06 of 11',
    title: 'Promoters & Founders',
    targetId: 'co-promoters', dialogPos: 'left',
    body: 'In Indian companies, "promoters" are the founding family or controlling shareholders — distinct from professional managers. They typically hold 30–75% of equity and exert outsized control.',
    bullets: [
      'High promoter holding (>50%) → aligned interests, but governance risk',
      'Low promoter holding (<25%) → professionally managed, but vulnerable to takeovers',
      'Falling promoter holding YoY → red flag; rising → strong signal',
      'Pledged promoter shares → margin call risk during drawdowns',
    ],
    pairsWith: 'Promoter pledges show up in disclosures. A high pledge + falling stock = forced-sale spiral risk.',
  },
  {
    id: 7, eyebrow: 'People · 07 of 11',
    title: 'Key Management Personnel',
    targetId: 'co-management', dialogPos: 'left',
    body: 'CEO, CFO, COO and equivalents. Their tenure tells you about institutional continuity. Recent CFO change without explanation is often a yellow flag — the auditor change that follows is a red flag.',
    bullets: [
      '10+ year tenures → deep institutional knowledge',
      'Founder-CEO → vision-driven, but key-person risk',
      'Multiple senior exits in one year → look for governance issues',
      'Independent directors with strong CVs → governance signal',
    ],
  },
  {
    id: 8, eyebrow: 'Scale · 08 of 11',
    title: 'Workforce Composition',
    targetId: 'co-workforce', dialogPos: 'right',
    body: 'Total headcount and how it breaks down (engineering vs operations vs sales etc.). Tells you what KIND of business this is — capital-light tech, capital-heavy manufacturing, or labor-intensive services.',
    bullets: [
      'Revenue per employee = company productivity',
      'TCS / Infy: ~₹85L per employee — high-skill services',
      'Manufacturing: ~₹2–4 Cr per employee — capital-intensive',
      'Sharp rise in headcount without revenue rise → cost bloat',
    ],
    pairsWith: 'Cross-check with Total Revenue (Section 7). Revenue/employee is one of the cleanest productivity metrics.',
  },
  {
    id: 9, eyebrow: 'Scale · 09 of 11',
    title: 'Operational Scale',
    targetId: 'co-operations', dialogPos: 'right',
    body: 'Physical operations — plants, stores, refineries, fleet, retail outlets, telecom subscribers. The metrics that actually scale the business. Numbers here are leading indicators of revenue.',
    bullets: [
      'Store/plant count growing faster than revenue → margin pressure ahead',
      'Single facility > 50% capacity → concentration risk',
      'Geographic concentration → regional macro vulnerability',
      'New facility commissioned → capex cycle peaking',
    ],
    example: 'INDIGO: fleet count and routes are the leading indicator. Add planes → revenue follows in 2–3 quarters.',
  },
  {
    id: 10, eyebrow: 'Numbers · 10 of 11',
    title: 'Statutory Filing — The Hard Numbers',
    targetId: 'co-filing', dialogPos: 'above',
    body: 'The actual numbers from the audited ITR-6 filing. These are legally attested — penalty for misstatement is real. Look here AFTER reading the narrative sections — context first, numbers second.',
    bullets: [
      'Total Revenue + YoY growth → is the business expanding?',
      'Net Profit + YoY growth → is profit keeping up with revenue?',
      'Total Assets vs Total Liabilities → balance sheet strength',
      'Cash & Equivalents → can it survive a downturn?',
      'Long-Term Debt → leverage exposure',
      'EPS in ₹ → earnings per single share you own',
    ],
    pairsWith: 'These same numbers drive the Fundamentals tab\'s ratios. P/E uses Net Profit; D/E uses Long-Term Debt; ROE uses Equity (Assets − Liabilities).',
  },
  {
    id: 11, eyebrow: 'Synthesis · 11 of 11',
    title: 'Reading It Like a Trader',
    targetId: null, dialogPos: 'center',
    body: 'A 60-second read of this filing should leave you able to answer four questions. If any answer is "I don\'t know", you don\'t understand the business well enough to size a position.',
    bullets: [
      '① What does this company actually DO? (one sentence)',
      '② Who controls it? (promoter share + management tenure)',
      '③ Where does the money come from? (segment mix)',
      '④ Is the business growing, flat, or shrinking? (revenue + profit YoY)',
    ],
    pairsWith: 'Once you can answer all four, the Fundamentals tab\'s ratios become meaningful. Without these answers, ratios are just numbers on a screen.',
  },
]

export function CompanyTutorial({ open, onClose }: Props) {
  return <TutorialShell open={open} onClose={onClose} steps={STEPS} accent={ACCENT}/>
}
